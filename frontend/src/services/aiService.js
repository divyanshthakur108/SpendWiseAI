import api from './api';

export const parseExpenseAPI = async (text) => {
  const response = await api.post('/ai/parse-expense', { text });
  return response.data;
};

export const categorizeAPI = async (description) => {
  const response = await api.post('/ai/categorize', { description });
  return response.data;
};

export const getMonthlyInsightsAPI = async () => {
  const response = await api.get('/ai/insights');
  return response.data;
};

export const getBudgetAdviceAPI = async () => {
  const response = await api.get('/ai/budget-advice');
  return response.data;
};

export const sendAIChatMessageAPI = async (message) => {
  const response = await api.post('/ai/chat', { message });
  return response.data;
};
