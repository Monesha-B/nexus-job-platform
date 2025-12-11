import api from './api';

export const aiService = {
  // Match resume with job description
  matchJob: async (data) => {
    const response = await api.post('/ai/analyze-match', data);
    return response.data;
  },

  // Generate cover letter
  generateCoverLetter: async (data) => {
    const response = await api.post('/ai/cover-letter', data);
    return response.data;
  },

  // Get interview questions
  getInterviewQuestions: async (data) => {
    const response = await api.post('/ai/interview-questions', data);
    return response.data;
  },

  // Analyze skills gap
  analyzeSkillsGap: async (targetRole, resumeId) => {
    const response = await api.post('/ai/skills-gap', { targetRole, resumeId });
    return response.data;
  },

  // Chat with AI assistant
  chat: async (messages, context = {}) => {
    const response = await api.post('/ai/chat', { messages, context });
    return response.data;
  },

  // Get match history
  getMatches: async (limit = 10, saved = false) => {
    const response = await api.get('/ai/matches', {
      params: { limit, saved },
    });
    return response.data;
  },

  // Get specific match
  getMatch: async (matchId) => {
    const response = await api.get(`/ai/matches/${matchId}`);
    return response.data;
  },

  // Toggle save match
  toggleSaveMatch: async (matchId) => {
    const response = await api.put(`/ai/matches/${matchId}/save`);
    return response.data;
  },
};

export default aiService;
