import api from './api';

export const uploadReceiptAPI = async (file, onProgress) => {
  console.log('[Upload Request] Sending receipt file to backend:', {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    fileType: file.type,
  });

  const formData = new FormData();
  formData.append('receipt', file);

  try {
    const response = await api.post('/upload/receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    console.log('[Upload Response] Receipt upload response from backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Upload Error] Failed to upload receipt image:', error.response?.data || error.message);
    throw error;
  }
};

