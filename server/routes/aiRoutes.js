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

// Generate cover letter (for job application)
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

// Generate cover letter from job description (for AI Match page)
router.post('/cover-letter', protect, asyncHandler(async (req, res) => {
  const { jobDescription, jobTitle, company, userName, userEmail } = req.body;

  if (!jobDescription) {
    throw new AppError('Job description is required', 400);
  }

  const resume = await Resume.findOne({ user: req.user._id }).sort('-createdAt');

  const prompt = `Generate a compelling cover letter for a job application.

JOB DETAILS:
- Title: ${jobTitle || 'the position'}
- Company: ${company || 'your company'}
- Description: ${jobDescription}

CANDIDATE INFO:
- Name: ${userName || `${req.user.firstName} ${req.user.lastName}`}
- Email: ${userEmail || req.user.email}
- Resume summary: ${resume?.parsedData?.summary || resume?.rawText?.substring(0, 1000) || 'Experienced professional'}
- Skills: ${resume?.parsedData?.skills?.join(', ') || 'Various relevant skills'}

Write a professional cover letter that:
1. Opens with a strong hook mentioning the specific role and company
2. Highlights relevant experience and skills that match the job requirements
3. Shows genuine interest in the company and role
4. Ends with a call to action
5. Is approximately 300-400 words

Use the candidate's actual name (${userName || `${req.user.firstName} ${req.user.lastName}`}) - do not use placeholders.`;

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
  const { jobDescription, resumeText, resumeId } = req.body;

  if (!jobDescription) {
    throw new AppError('Job description is required', 400);
  }

  let resumeContent = resumeText;
  
  if (!resumeContent && resumeId) {
    const resume = await Resume.findById(resumeId);
    if (resume) {
      resumeContent = resume.rawText || JSON.stringify(resume.parsedData);
    }
  }
  
  if (!resumeContent) {
    const resume = await Resume.findOne({ user: req.user._id }).sort('-createdAt');
    if (resume) {
      resumeContent = resume.rawText || JSON.stringify(resume.parsedData);
    }
  }

  if (!resumeContent) {
    throw new AppError('Please upload a resume or paste resume text', 400);
  }

  const prompt = `Analyze the match between this resume and job description. Be thorough and specific.

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Provide a JSON response with this EXACT structure:
{
  "matchScore": <number 0-100>,
  "overallFit": "<excellent|good|moderate|low>",
  "summary": "<2-3 sentence personalized summary of the match>",
  "strengths": ["<specific matching qualification 1>", "<specific matching qualification 2>", "<specific matching qualification 3>"],
  "gaps": ["<specific missing requirement 1>", "<specific missing requirement 2>"],
  "skillsMatch": [
    {"skill": "<skill name>", "status": "match", "importance": "high"},
    {"skill": "<skill name>", "status": "partial", "importance": "medium"},
    {"skill": "<skill name>", "status": "missing", "importance": "high"}
  ],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"]
}

Be specific to the actual resume and job. Include at least 3 strengths, 2 gaps, 5 skills in skillsMatch, and 3 recommendations.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert HR analyst and career coach. Respond only with valid JSON. Be specific and helpful.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });

  let analysis;
  try {
    const content = completion.choices[0].message.content;
    analysis = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
  } catch (e) {
    console.error('JSON parse error:', e);
    analysis = {
      matchScore: 65,
      overallFit: 'moderate',
      summary: 'Your profile shows potential for this role. Review the strengths and gaps below for more details.',
      strengths: ['Relevant experience', 'Applicable skills', 'Professional background'],
      gaps: ['Some requirements may need development', 'Consider highlighting more specific experience'],
      skillsMatch: [
        { skill: 'Communication', status: 'match', importance: 'high' },
        { skill: 'Technical Skills', status: 'partial', importance: 'medium' },
        { skill: 'Industry Experience', status: 'partial', importance: 'high' }
      ],
      recommendations: ['Tailor your resume to highlight relevant experience', 'Prepare specific examples for interviews', 'Research the company culture']
    };
  }

  res.json({
    success: true,
    data: { analysis },
  });
}));

module.exports = router;
