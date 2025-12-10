// AI Service - Supports OpenAI, Anthropic, or Mock mode
const OpenAI = require('openai');

const USE_MOCK = !process.env.OPENAI_API_KEY || process.env.USE_MOCK_AI === 'true';

let openai;
if (!USE_MOCK) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const MODEL = 'gpt-4o-mini';

// Mock responses for testing
const generateMockMatch = (resumeText, jobDescription) => {
  const score = Math.floor(Math.random() * 30) + 65;
  return {
    matchScore: score,
    overallFit: score >= 80 ? 'excellent' : score >= 65 ? 'good' : 'moderate',
    summary: `Based on your background, you show strong potential for this role. Your experience aligns well with several key requirements.`,
    strengths: [
      'Relevant technical skills that match job requirements',
      'Strong educational background',
      'Experience in similar industry or role',
      'Good communication and soft skills evident from resume'
    ],
    gaps: [
      'Could benefit from more experience with specific tools mentioned',
      'Consider highlighting leadership experience more prominently',
      'Some preferred qualifications not explicitly shown'
    ],
    skillsMatch: [
      { skill: 'Communication', status: 'match', importance: 'required' },
      { skill: 'Problem Solving', status: 'match', importance: 'required' },
      { skill: 'Technical Skills', status: 'partial', importance: 'required' },
      { skill: 'Leadership', status: 'partial', importance: 'preferred' },
      { skill: 'Industry Knowledge', status: 'match', importance: 'preferred' }
    ],
    experienceMatch: { yearsRequired: 3, yearsActual: 4, assessment: 'Your experience level meets the requirements.' },
    educationMatch: { required: "Bachelor's degree", actual: "Bachelor's degree", assessment: 'Your education qualifications meet the requirements.' },
    recommendations: [
      'Tailor your resume to highlight specific keywords from the job description',
      'Prepare examples of relevant projects to discuss in interviews',
      'Research the company culture and values before applying'
    ],
    processingTime: 1200
  };
};

const generateMockCoverLetter = (jobTitle, company) => {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background and skills, I am confident I would be a valuable addition to your team.

Throughout my career, I have developed expertise that directly aligns with this role's requirements. My experience has equipped me with the technical skills and problem-solving abilities necessary to excel in this position.

What particularly excites me about ${company} is your commitment to innovation and excellence. I am eager to contribute to your team's success while continuing to grow professionally.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm would benefit your organization. Thank you for considering my application.

Sincerely,
[Your Name]`;
};

const analyzeJobMatch = async (resumeText, jobDescription, jobTitle = '', company = '') => {
  if (USE_MOCK) {
    console.log('Using mock AI response');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockMatch(resumeText, jobDescription);
  }
  const startTime = Date.now();
  const prompt = `You are an expert career counselor. Analyze the compatibility between this resume and job.

RESUME:
${resumeText}

JOB:
${jobTitle ? `Title: ${jobTitle}` : ''}
${company ? `Company: ${company}` : ''}
${jobDescription}

Respond with valid JSON only (no markdown):
{
  "matchScore": <0-100>,
  "overallFit": "<excellent|good|moderate|low>",
  "summary": "<2-3 sentence assessment>",
  "strengths": ["<strength>"],
  "gaps": ["<gap>"],
  "skillsMatch": [{"skill": "<name>", "status": "<match|partial|missing>", "importance": "<required|preferred|nice-to-have>"}],
  "experienceMatch": {"yearsRequired": <num>, "yearsActual": <num>, "assessment": "<text>"},
  "educationMatch": {"required": "<text>", "actual": "<text>", "assessment": "<text>"},
  "recommendations": ["<recommendation>"]
}`;
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  const result = JSON.parse(response.choices[0].message.content);
  result.processingTime = Date.now() - startTime;
  return result;
};

const generateCoverLetter = async (resumeText, jobDescription, jobTitle, company) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return generateMockCoverLetter(jobTitle, company);
  }
  const prompt = `Write a professional cover letter (300-400 words) for:
Position: ${jobTitle} at ${company}
Job Description: ${jobDescription}
Candidate Resume: ${resumeText}

Write only the letter text, no explanations or markdown.`;
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0].message.content;
};

const generateInterviewQuestions = async (resumeText, jobDescription, jobTitle = '') => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { question: 'Tell me about yourself.', category: 'behavioral', suggestedAnswer: 'Focus on relevant experience.', tip: 'Keep it concise.' },
      { question: 'Why this position?', category: 'behavioral', suggestedAnswer: 'Connect your goals with the company.', tip: 'Research the company.' },
      { question: 'Describe a challenging project.', category: 'experience', suggestedAnswer: 'Use STAR method.', tip: 'Quantify achievements.' }
    ];
  }
  const prompt = `Generate 10 interview questions for this candidate and role.
Job: ${jobTitle} - ${jobDescription}
Resume: ${resumeText}

Respond with JSON array only:
[{"question": "<text>", "category": "<behavioral|technical|situational|experience>", "suggestedAnswer": "<answer>", "tip": "<advice>"}]`;
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
  });
  try {
    const text = response.choices[0].message.content.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(text);
  } catch { return []; }
};

const parseResume = async (resumeText) => {
  if (USE_MOCK) {
    return { summary: 'Experienced professional.', skills: ['Communication', 'Leadership'], totalExperienceYears: 4 };
  }
  const prompt = `Extract structured data from this resume as JSON:
{"summary": "", "skills": [], "totalExperienceYears": 0, "experience": [], "education": []}
Resume: ${resumeText}`;
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  return JSON.parse(response.choices[0].message.content);
};

const analyzeSkillsGap = async (resumeText, targetRole) => {
  if (USE_MOCK) {
    return { currentSkills: ['Communication'], requiredSkills: ['Communication', 'Technical'], matchingSkills: ['Communication'], missingSkills: ['Technical'], overallReadiness: 75 };
  }
  const prompt = `Analyze skills gap for ${targetRole}. Profile: ${resumeText}
Respond JSON: {"currentSkills": [], "requiredSkills": [], "matchingSkills": [], "missingSkills": [], "overallReadiness": 0}`;
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  return JSON.parse(response.choices[0].message.content);
};

const chatWithAI = async (messages, userContext = {}) => {
  if (USE_MOCK) {
    return "I'm here to help with career questions! Configure your OpenAI API key for personalized advice.";
  }
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: `You are NEXUS AI, a career counselor. Be helpful and concise. ${userContext.resumeSummary || ''}` },
      ...messages
    ],
  });
  return response.choices[0].message.content;
};

module.exports = { analyzeJobMatch, generateCoverLetter, generateInterviewQuestions, parseResume, analyzeSkillsGap, chatWithAI };
