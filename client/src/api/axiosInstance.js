import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: '/api', // Dùng Proxy của Vite
  timeout: 10000,
  withCredentials: true, // Gửi kèm cookie (refreshToken)
});

// Gắn Token vào Request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý Lỗi & Auto Refresh Token
axiosInstance.interceptors.response.use(
  (response) => response.data, 
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa retry, ngoại trừ route refresh token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      try {
        const res = await axiosInstance.post('/auth/refresh-token');
        const { accessToken } = res.data;
        
        // Lưu token mới và gắn vào request cũ
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        // Nếu refresh cũng lỗi -> Phiên đăng nhập hết hạn hoàn toàn
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    // Trích xuất error message từ backend chuẩn hóa
    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
    return Promise.reject(new Error(message));
  }
);
