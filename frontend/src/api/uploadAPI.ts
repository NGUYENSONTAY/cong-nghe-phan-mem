import { api } from './api';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const uploadAPI = {
  validateFile: (file: File): FileValidationResult => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      return { isValid: false, error: 'Không có file được chọn' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'Kích thước file quá lớn (tối đa 5MB)' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Định dạng file không được hỗ trợ (chỉ hỗ trợ JPG, PNG, GIF, WebP)' };
    }

    return { isValid: true };
  },

  uploadImage: async (file: File): Promise<string> => {
    const validation = uploadAPI.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.url;
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  },

  getImages: async (page: number = 0, size: number = 20) => {
    const response = await api.get('/upload/images', {
      params: { page, size }
    });
    return response.data;
  },

  deleteImage: async (filename: string) => {
    const response = await api.delete(`/upload/images/${filename}`);
    return response.data;
  },

  getImageUrl: (filename: string): string => {
    return `${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/${filename}`;
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}; 