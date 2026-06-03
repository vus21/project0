import { axiosInstance } from './axiosInstance';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  logout: () => axiosInstance.post('/auth/logout'),
  refreshToken: () => axiosInstance.post('/auth/refresh-token'),
  getProfile: () => axiosInstance.get('/auth/profile'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  changePassword: (data) => axiosInstance.put('/auth/change-password', data),
  uploadAvatar: (formData) => axiosInstance.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verifyEmail: (token) => axiosInstance.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => axiosInstance.post('/auth/resend-verification', { email }),
};
