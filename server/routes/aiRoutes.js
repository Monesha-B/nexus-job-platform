const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat with AI Assistant
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, context, conversationHistory = [] } = req.body;

  const contextPrompts = {
    'dashboard': 'The user is on their dashboard viewing their job search overview.',
    'browse-jobs': 'The user is browsing available job listings.',
    'job-details': 'The user is viewing a specific job posting details.',
    'ai-match': 'The user is on the AI Job Match page to analyze their resume against jobs.',
    'my-applications': 'The user is viewing their submitted job applications.',
    'profile': 'The user is on their profile page managing their information and resume.',
    'admin-dashboard': 'The user is an admin managing jobs and applications.',
    'general': 'The user is exploring the NEXUS platform.',
  };

  const systemPrompt = `You are the NEXUS AI Assistant - a helpful, friendly career guidance chatbot for the NEXUS job matching platform.

IMPORTANT RULES:
1. You are a GUIDE only - help users navigate the platform and give career advice
2. DO NOT generate cover letters, resumes, or apply to jobs - direct users to the appropriate features instead
3. Keep responses concise (2-3 sentences max unless asked for more detail)
4. Be encouraging and supportive
5. When users ask to DO something, tell them WHERE to do it in the app

PLATFORM FEATURES TO REFERENCE:
- Browse Jobs: Search and filter job listings at /jobs
- AI Match: Analyze resume against job descriptions at /match  
- Apply to Jobs: Click "Apply Now" on any job, can generate AI cover letter there
- My Applications: Track application status at /applications
- Profile: Upload resume, update skills at /profile
- Admin Dashboard: Post jobs, manage applications (admin only)

CURRENT CONTEXT: ${contextPrompts[context] || contextPrompts['general']}

Respond helpfully and always guide users to the right feature when they want to take action.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  const reply = completion.choices[0].message.content;

  res.json({
    success: true,
    data: { reply },
  });
}));

// Generate cover letter
router.post('/generate-cover-letter', protect, asyncHandler(async (req, res) => {
  const { jobId, tone = 'professional', highlights = '', customPoints = '' } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const resume = await Resume.findOne({ user: req.user._id }).sort('-createdAt');
  if (!resume) {
    throw new AppError('Please upload a resume first', 400);
  }

  const toneDescriptions = {
    professional: 'professional, formal, and business-appropriate',
    friendly: 'friendly, warm, and approachable while remaining professional',
    enthusiastic: 'enthusiastic, energetic, and passionate about the opportunity',
    confident: 'confident, bold, and assertive about qualifications',
    humble: 'humble, eager to learn, and appreciative of the opportunity',
  };

  const prompt = `Generate a compelling cover letter for a job application.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description}
- Requirements: ${job.requirements?.join(', ') || 'Not specified'}
- Skills needed: ${job.skills?.join(', ') || 'Not specified'}

CANDIDATE INFO:
- Name: ${req.user.firstName} ${req.user.lastName}
- Resume summary: ${resume.parsedData?.summary || resume.rawText?.substring(0, 1000) || 'Not available'}
- Skills: ${resume.parsedData?.skills?.join(', ') || 'Not specified'}

TONE: ${toneDescriptions[tone] || toneDescriptions.professional}

${highlights ? `KEY STRENGTHS TO HIGHLIGHT: ${highlights}` : ''}
${customPoints ? `CUSTOM POINTS TO INCLUDE: ${customPoints}` : ''}

Write a cover letter that:
1. Opens with a strong hook mentioning the specific role and company
2. Highlights relevant experience and skills that match the job requirements
3. Shows genuine interest in the company and role
4. Includes any custom points mentioned above
5. Ends with a call to action
6. Is approximately 300-400 words
7. Uses the specified tone throughout

Do not include placeholder text like [Your Name] - use the actual candidate name provided.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert career coach and professional writer who creates compelling, personalized cover letters.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });

  const coverLetter = completion.choices[0].message.content;

  res.json({
    success: true,
    data: { coverLetter },
  });
}));

// Analyze job match
router.post('/analyze-match', protect, asyncHandler(async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription) {
    throw new AppError('Job description is required', 400);
  }

  const resume = await Resume.findOne({ user: req.user._id }).sort('-createdAt');
  if (!resume) {
    throw new AppError('Please upload a resume first', 400);
  }

  const prompt = `Analyze the match between this resume and job description.

RESUME:
${resume.rawText || JSON.stringify(resume.parsedData)}

JOB DESCRIPTION:
${jobDescription}

Provide a JSON response with:
{
  "matchScore": <number 0-100>,
  "overallFit": "<excellent|good|moderate|low>",
  "summary": "<2-3 sentence summary>",
  "strengths": ["<matching skill 1>", "<matching skill 2>", ...],
  "gaps": ["<missing skill 1>", "<missing skill 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert HR analyst. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
  });

  let analysis;
  try {
    const content = completion.choices[0].message.content;
    analysis = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
  } catch (e) {
    analysis = {
      matchScore: 70,
      overallFit: 'good',
      summary: 'Analysis completed.',
      strengths: [],
      gaps: [],
      recommendations: []
    };
  }

  res.json({
    success: true,
    data: { analysis },
  });
}));

module.exports = router;
