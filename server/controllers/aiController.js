const Match = require('../models/Match');
const Resume = require('../models/Resume');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const aiService = require('../services/aiService');
const { extractTextFromURL, cleanText } = require('../services/resumeParser');

/**
 * @swagger
 * /api/ai/match:
 *   post:
 *     summary: Match resume with job description
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobDescription]
 *             properties:
 *               jobDescription: { type: string }
 *               jobTitle: { type: string }
 *               company: { type: string }
 *               resumeId: { type: string, description: Use specific resume or primary }
 *               resumeText: { type: string, description: Or provide text directly }
 */
const matchJob = asyncHandler(async (req, res) => {
  const { jobDescription, jobTitle, company, resumeId, resumeText } = req.body;

  if (!jobDescription) {
    throw new AppError('Job description is required', 400);
  }

  let finalResumeText = resumeText;

  // Get resume text if not provided directly
  if (!finalResumeText) {
    let resume;

    if (resumeId) {
      resume = await Resume.findById(resumeId);
      if (!resume || resume.user.toString() !== req.user._id.toString()) {
        throw new AppError('Resume not found', 404);
      }
    } else {
      // Use primary resume
      resume = await Resume.getPrimaryResume(req.user._id);
      if (!resume) {
        throw new AppError('No resume found. Please upload a resume first.', 400);
      }
    }

    // Get resume text (use parsed or extract)
    if (resume.rawText) {
      finalResumeText = resume.rawText;
    } else {
      finalResumeText = await extractTextFromURL(resume.fileUrl, resume.fileType);
      finalResumeText = cleanText(finalResumeText);
    }
  }

  // Perform AI analysis
  const result = await aiService.analyzeJobMatch(
    finalResumeText,
    jobDescription,
    jobTitle || '',
    company || ''
  );

  // Save match result
  const match = await Match.create({
    user: req.user._id,
    resume: resumeId,
    resumeText: finalResumeText.substring(0, 10000), // Limit stored text
    jobDescription: jobDescription.substring(0, 10000),
    jobTitle,
    company,
    result,
    modelUsed: 'claude-sonnet-4-20250514',
  });

  res.json({
    success: true,
    data: {
      matchId: match._id,
      matchScore: result.matchScore,
      overallFit: result.overallFit,
      summary: result.summary,
      strengths: result.strengths,
      gaps: result.gaps,
      skillsMatch: result.skillsMatch,
      experienceMatch: result.experienceMatch,
      educationMatch: result.educationMatch,
      recommendations: result.recommendations,
      processingTime: result.processingTime,
    },
  });
});

/**
 * @swagger
 * /api/ai/cover-letter:
 *   post:
 *     summary: Generate personalized cover letter
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
const generateCoverLetter = asyncHandler(async (req, res) => {
  const { jobDescription, jobTitle, company, resumeId, matchId } = req.body;

  if (!jobDescription || !jobTitle || !company) {
    throw new AppError('Job description, title, and company are required', 400);
  }

  let resumeText;

  // Get resume text
  if (matchId) {
    const match = await Match.findById(matchId);
    if (match) resumeText = match.resumeText;
  }

  if (!resumeText) {
    let resume;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    } else {
      resume = await Resume.getPrimaryResume(req.user._id);
    }

    if (!resume) {
      throw new AppError('Resume required for cover letter generation', 400);
    }

    resumeText = resume.rawText || await extractTextFromURL(resume.fileUrl, resume.fileType);
  }

  const coverLetter = await aiService.generateCoverLetter(
    resumeText,
    jobDescription,
    jobTitle,
    company
  );

  // Update match if exists
  if (matchId) {
    await Match.findByIdAndUpdate(matchId, {
      'result.coverLetter': coverLetter,
    });
  }

  res.json({
    success: true,
    data: { coverLetter },
  });
});

/**
 * @swagger
 * /api/ai/interview-questions:
 *   post:
 *     summary: Generate likely interview questions
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
const getInterviewQuestions = asyncHandler(async (req, res) => {
  const { jobDescription, jobTitle, resumeId, matchId } = req.body;

  if (!jobDescription) {
    throw new AppError('Job description is required', 400);
  }

  let resumeText;

  if (matchId) {
    const match = await Match.findById(matchId);
    if (match) resumeText = match.resumeText;
  }

  if (!resumeText) {
    let resume;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    } else {
      resume = await Resume.getPrimaryResume(req.user._id);
    }

    if (!resume) {
      throw new AppError('Resume required for interview questions', 400);
    }

    resumeText = resume.rawText || await extractTextFromURL(resume.fileUrl, resume.fileType);
  }

  const questions = await aiService.generateInterviewQuestions(
    resumeText,
    jobDescription,
    jobTitle || ''
  );

  // Update match if exists
  if (matchId) {
    await Match.findByIdAndUpdate(matchId, {
      'result.interviewQuestions': questions,
    });
  }

  res.json({
    success: true,
    data: { questions },
  });
});

/**
 * @swagger
 * /api/ai/skills-gap:
 *   post:
 *     summary: Analyze skills gap for target role
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
const analyzeSkillsGap = asyncHandler(async (req, res) => {
  const { targetRole, resumeId } = req.body;

  if (!targetRole) {
    throw new AppError('Target role is required', 400);
  }

  let resume;
  if (resumeId) {
    resume = await Resume.findById(resumeId);
  } else {
    resume = await Resume.getPrimaryResume(req.user._id);
  }

  if (!resume) {
    throw new AppError('Resume required for skills gap analysis', 400);
  }

  const resumeText = resume.rawText || await extractTextFromURL(resume.fileUrl, resume.fileType);
  const analysis = await aiService.analyzeSkillsGap(resumeText, targetRole);

  res.json({
    success: true,
    data: { analysis },
  });
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI career assistant
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
const chat = asyncHandler(async (req, res) => {
  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new AppError('Messages array is required', 400);
  }

  // Build user context
  let userContext = context || {};

  // Get user's resume summary if available
  if (!userContext.resumeSummary) {
    const resume = await Resume.getPrimaryResume(req.user._id);
    if (resume && resume.parsedData?.summary) {
      userContext.resumeSummary = resume.parsedData.summary;
    }
  }

  const response = await aiService.chatWithAI(messages, userContext);

  res.json({
    success: true,
    data: {
      message: response,
      role: 'assistant',
    },
  });
});

/**
 * @swagger
 * /api/ai/matches:
 *   get:
 *     summary: Get user's match history
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
const getMatches = asyncHandler(async (req, res) => {
  const { limit = 10, saved } = req.query;

  let matches;
  if (saved === 'true') {
    matches = await Match.getSavedMatches(req.user._id);
  } else {
    matches = await Match.getUserMatches(req.user._id, parseInt(limit));
  }

  res.json({
    success: true,
    data: { matches, count: matches.length },
  });
});

/**
 * @swagger
 * /api/ai/matches/{id}:
 *   get:
 *     summary: Get specific match result
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
const getMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);

  if (!match) {
    throw new AppError('Match not found', 404);
  }

  if (match.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  res.json({
    success: true,
    data: { match },
  });
});

/**
 * @swagger
 * /api/ai/matches/{id}/save:
 *   put:
 *     summary: Toggle save match
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
const toggleSaveMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);

  if (!match) {
    throw new AppError('Match not found', 404);
  }

  if (match.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  await match.toggleSave();

  res.json({
    success: true,
    message: match.isSaved ? 'Match saved' : 'Match unsaved',
    data: { isSaved: match.isSaved },
  });
});

module.exports = {
  matchJob,
  generateCoverLetter,
  getInterviewQuestions,
  analyzeSkillsGap,
  chat,
  getMatches,
  getMatch,
  toggleSaveMatch,
};
