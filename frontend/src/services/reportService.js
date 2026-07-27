import api from './api';

export const getReportSummaryAPI = async (params = {}) => {
  const response = await api.get('/reports/summary', { params });
  return response.data;
};

export const getMonthlyReportAPI = getReportSummaryAPI; // Alias

export const exportCSVAPI = async (params = {}) => {
  const response = await api.get('/reports/csv', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const fileName = `spendwise_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadCSVReportAPI = exportCSVAPI; // Alias

export const exportPDFAPI = async (params = {}) => {
  const response = await api.get('/reports/pdf', { params });
  return response.data;
};
