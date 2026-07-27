import api from './api';

export const scanReceiptOCRAPI = async (imageUrl, rawText = '') => {
  const response = await api.post('/ocr/scan', { imageUrl, rawText });
  return response.data;
};
