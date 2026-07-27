import api from './api';

export const getTransactionsAPI = async (params = {}) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

export const getTransactionByIdAPI = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const createTransactionAPI = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const updateTransactionAPI = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransactionAPI = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};
