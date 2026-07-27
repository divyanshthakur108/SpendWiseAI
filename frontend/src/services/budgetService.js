import api from './api';

export const getBudgetsAPI = async (params = {}) => {
  const response = await api.get('/budgets', { params });
  return response.data;
};

export const getBudgetByIdAPI = async (id) => {
  const response = await api.get(`/budgets/${id}`);
  return response.data;
};

export const setBudgetAPI = async (data) => {
  const response = await api.post('/budgets', data);
  return response.data;
};

export const updateBudgetAPI = async (id, data) => {
  const response = await api.put(`/budgets/${id}`, data);
  return response.data;
};

export const deleteBudgetAPI = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};
