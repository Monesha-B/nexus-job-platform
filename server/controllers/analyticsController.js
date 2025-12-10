const Application = require('../models/Application');
const Match = require('../models/Match');
const Resume = require('../models/Resume');
const mongoose = require('mongoose');

const getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    // Current period stats
    const [totalMatches, totalApplications, totalResumes, savedMatches] = await Promise.all([
      Match.countDocuments({ user: userId, createdAt: { $gte: startDate } }),
      Application.countDocuments({ applicant: userId, createdAt: { $gte: startDate } }),
      Resume.countDocuments({ user: userId }),
      Match.countDocuments({ user: userId, isSaved: true })
    ]);

    // Previous period stats for comparison
    const [prevMatches, prevApplications] = await Promise.all([
      Match.countDocuments({ user: userId, createdAt: { $gte: previousStartDate, $lt: startDate } }),
      Application.countDocuments({ applicant: userId, createdAt: { $gte: previousStartDate, $lt: startDate } })
    ]);

    // Calculate average match score for current period
    const matchScores = await Match.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), createdAt: { $gte: startDate } } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
    ]);
    const avgMatchScore = matchScores.length > 0 ? Math.round(matchScores[0].avgScore) : 0;

    // Previous period average score
    const prevMatchScores = await Match.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), createdAt: { $gte: previousStartDate, $lt: startDate } } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
    ]);
    const prevAvgMatchScore = prevMatchScores.length > 0 ? Math.round(prevMatchScores[0].avgScore) : 0;

    // Calculate changes
    const matchesChange = prevMatches > 0 ? Math.round(((totalMatches - prevMatches) / prevMatches) * 100) : 0;
    const applicationsChange = prevApplications > 0 ? Math.round(((totalApplications - prevApplications) / prevApplications) * 100) : 0;
    const scoreChange = prevAvgMatchScore > 0 ? avgMatchScore - prevAvgMatchScore : 0;

    // All time totals
    const [allTimeMatches, allTimeApplications] = await Promise.all([
      Match.countDocuments({ user: userId }),
      Application.countDocuments({ applicant: userId })
    ]);

    res.json({
      success: true,
      data: { 
        totalMatches, 
        totalApplications, 
        totalResumes, 
        savedMatches, 
        avgMatchScore,
        allTimeMatches,
        allTimeApplications,
        changes: {
          matches: matchesChange,
          applications: applicationsChange,
          score: scoreChange
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMatchTrend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '7d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get matches grouped by day
    const matches = await Match.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId), 
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgScore: { $avg: '$matchScore' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create full date range with zeros for missing days
    const chartData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const matchData = matches.find(m => m._id === dateStr);
      
      chartData.push({
        date: dateStr,
        day: period === '7d' ? dayNames[date.getDay()] : date.getDate().toString(),
        score: matchData ? Math.round(matchData.avgScore) : 0,
        count: matchData ? matchData.count : 0
      });
    }

    // Calculate overall trend
    const recentScores = chartData.slice(-3).filter(d => d.score > 0);
    const olderScores = chartData.slice(0, -3).filter(d => d.score > 0);
    
    const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b.score, 0) / recentScores.length : 0;
    const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b.score, 0) / olderScores.length : 0;
    const trend = olderAvg > 0 ? Math.round(recentAvg - olderAvg) : 0;

    res.json({
      success: true,
      data: { 
        chartData,
        trend,
        currentAvg: Math.round(recentAvg) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSkillsAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's latest resume
    const resume = await Resume.findOne({ user: userId }).sort('-createdAt');
    
    // Get recent matches with skill analysis
    const matches = await Match.find({ user: userId })
      .sort('-createdAt')
      .limit(10)
      .select('skillsMatch experienceMatch educationMatch softSkillsMatch matchScore');

    let skillsData = {
      technical: 0,
      experience: 0,
      education: 0,
      softSkills: 0
    };

    if (matches.length > 0) {
      // Calculate averages from matches
      const totals = matches.reduce((acc, m) => ({
        technical: acc.technical + (m.skillsMatch || 0),
        experience: acc.experience + (m.experienceMatch || 0),
        education: acc.education + (m.educationMatch || 0),
        softSkills: acc.softSkills + (m.softSkillsMatch || 0)
      }), { technical: 0, experience: 0, education: 0, softSkills: 0 });

      skillsData = {
        technical: Math.round(totals.technical / matches.length),
        experience: Math.round(totals.experience / matches.length),
        education: Math.round(totals.education / matches.length),
        softSkills: Math.round(totals.softSkills / matches.length)
      };
    } else if (resume) {
      // Estimate from resume completeness
      skillsData = {
        technical: resume.skills?.length > 5 ? 75 : resume.skills?.length > 0 ? 50 : 0,
        experience: resume.experience?.length > 2 ? 80 : resume.experience?.length > 0 ? 50 : 0,
        education: resume.education?.length > 0 ? 85 : 0,
        softSkills: 60
      };
    }

    res.json({
      success: true,
      data: {
        skills: [
          { name: 'Technical Skills', percent: skillsData.technical, color: '#d97757' },
          { name: 'Experience', percent: skillsData.experience, color: '#3b82f6' },
          { name: 'Education', percent: skillsData.education, color: '#059669' },
          { name: 'Soft Skills', percent: skillsData.softSkills, color: '#8b5cf6' }
        ],
        hasResume: !!resume,
        matchCount: matches.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'all', limit = 10 } = req.query;

    let activity = [];

    if (type === 'all' || type === 'match') {
      const recentMatches = await Match.find({ user: userId })
        .sort('-createdAt')
        .limit(parseInt(limit))
        .select('jobTitle company matchScore createdAt');
      
      activity.push(...recentMatches.map(m => ({
        type: 'match',
        title: m.jobTitle || 'Job Match',
        subtitle: m.company || 'Company',
        score: m.matchScore,
        date: m.createdAt
      })));
    }

    if (type === 'all' || type === 'application') {
      const recentApplications = await Application.find({ applicant: userId })
        .sort('-createdAt')
        .limit(parseInt(limit))
        .populate('job', 'title company');
      
      activity.push(...recentApplications.map(a => ({
        type: 'application',
        title: a.job?.title || 'Job Application',
        subtitle: a.job?.company || 'Company',
        status: a.status,
        date: a.createdAt
      })));
    }

    // Sort by date and limit
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    activity = activity.slice(0, parseInt(limit));

    res.json({ success: true, data: { activity } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company')
      .sort('-createdAt')
      .limit(10);
    res.json({ success: true, data: { applications } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(10)
      .select('jobTitle company matchScore isSaved createdAt');
    res.json({ success: true, data: { matches } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getMyStats, 
  getMatchTrend,
  getSkillsAnalysis,
  getRecentActivity, 
  getMyApplications, 
  getMyMatches 
};
