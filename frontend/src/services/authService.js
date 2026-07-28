import api from './api';

export const registerAPI = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginAPI = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUserAPI = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfileAPI = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const forgotPasswordAPI = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

export const resetPasswordAPI = async (resetToken, data) => {
  const response = await api.put(`/auth/reset-password/${resetToken}`, data);
  return response.data;
};
