import api from './api';

export const getAdminStatsAPI = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsersAPI = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const toggleBlockUserAPI = async (id) => {
  const response = await api.put(`/admin/users/${id}/block`);
  return response.data;
};

export const deleteUserAPI = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getCategoriesAPI = async () => {
  const response = await api.get('/admin/categories');
  return response.data;
};

export const createCategoryAPI = async (data) => {
  const response = await api.post('/admin/categories', data);
  return response.data;
};

export const deleteCategoryAPI = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};
