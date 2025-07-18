import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Xử lý lỗi từ server
      const message = error.response.data.message || 'Đã có lỗi xảy ra từ máy chủ.';
      toast.error(message);
      
      if (error.response.status === 401) {
        // Xử lý lỗi xác thực, ví dụ: logout người dùng
        localStorage.removeItem('token');
        // Có thể redirect về trang đăng nhập
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Lỗi không nhận được phản hồi
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.');
    } else {
      // Lỗi khác
      toast.error('Đã có lỗi không xác định xảy ra.');
    }
    return Promise.reject(error);
  }
);


export { api }; 