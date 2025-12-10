const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Match = require('../models/Match');
const Resume = require('../models/Resume');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get platform statistics (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalJobseekers,
    totalAdmins,
    activeUsers,
    totalJobs,
    activeJobs,
    totalApplications,
    totalMatches,
    totalResumes,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'jobseeker' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ isActive: true }),
    Job.countDocuments(),
    Job.countDocuments({ isActive: true }),
    Application.countDocuments(),
    Match.countDocuments(),
    Resume.countDocuments(),
  ]);

  // Get registrations in last 7 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: lastWeek },
  });

  // Get applications by status
  const applicationsByStatus = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Get top skills from jobs
  const topSkills = await Job.aggregate([
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        jobseekers: totalJobseekers,
        admins: totalAdmins,
        active: activeUsers,
        newThisWeek: newUsersThisWeek,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
      },
      applications: {
        total: totalApplications,
        byStatus: applicationsByStatus,
      },
      ai: {
        totalMatches,
        totalResumes,
      },
      topSkills,
    },
  });
});

/**
 * @swagger
 * /api/admin/recent-users:
 *   get:
 *     summary: Get recent user registrations (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
const getRecentUsers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const users = await User.find()
    .sort('-createdAt')
    .limit(parseInt(limit))
    .select('firstName lastName email role createdAt isActive');

  res.json({
    success: true,
    data: { users },
  });
});

/**
 * @swagger
 * /api/admin/recent-applications:
 *   get:
 *     summary: Get recent applications (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
const getRecentApplications = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const applications = await Application.find()
    .sort('-createdAt')
    .limit(parseInt(limit))
    .populate('applicant', 'firstName lastName email')
    .populate('job', 'title company');

  res.json({
    success: true,
    data: { applications },
  });
});

/**
 * @swagger
 * /api/admin/popular-jobs:
 *   get:
 *     summary: Get most applied jobs (Admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
const getPopularJobs = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const jobs = await Job.find({ isActive: true })
    .sort('-applicationsCount')
    .limit(parseInt(limit))
    .select('title company location applicationsCount postedAt');

  res.json({
    success: true,
    data: { jobs },
  });
});

module.exports = {
  getPlatformStats,
  getRecentUsers,
  getRecentApplications,
  getPopularJobs,
};
