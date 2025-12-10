import api from './api';

export const getMyStats = async (period = '7d') => {
  const response = await api.get('/analytics/my-stats', { params: { period } });
  return response.data;
};

export const getMatchTrend = async (period = '7d') => {
  const response = await api.get('/analytics/match-trend', { params: { period } });
  return response.data;
};

export const getSkillsAnalysis = async () => {
  const response = await api.get('/analytics/skills-analysis');
  return response.data;
};

export const getRecentActivity = async (type = 'all', limit = 10) => {
  const response = await api.get('/analytics/recent-activity', { params: { type, limit } });
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/analytics/my-applications');
  return response.data;
};

export const getMyMatches = async () => {
  const response = await api.get('/analytics/my-matches');
  return response.data;
};
