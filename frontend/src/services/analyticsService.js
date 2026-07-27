import api from './api';

export const getSummaryAPI = async () => {
  const response = await api.get('/analytics/summary');
  return response.data;
};

export const getMonthlyTrendAPI = async () => {
  const response = await api.get('/analytics/monthly');
  return response.data;
};

export const getCategoryAnalyticsAPI = async (timeframe = 'all') => {
  const response = await api.get('/analytics/categories', { params: { timeframe } });
  return response.data;
};

export const getIncomeVsExpenseAPI = async () => {
  const response = await api.get('/analytics/income-expense');
  return response.data;
};

export const getRecentActivityAPI = async () => {
  const response = await api.get('/analytics/recent');
  return response.data;
};

export const getSpendingStatsAPI = async () => {
  const response = await api.get('/analytics/stats');
  return response.data;
};

export const getDashboardAnalyticsAPI = async (timeframe = 'all') => {
  const response = await api.get('/analytics/dashboard', { params: { timeframe } });
  return response.data;
};
