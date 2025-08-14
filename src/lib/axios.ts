import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Cấu hình API
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Tạo instance của axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor request - Thêm token vào header nếu có
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response - Xử lý refresh token và lỗi toàn cục
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi 401 (Unauthorized) - Token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Refresh token - dùng axios instance riêng để tránh loop
          const refreshResponse = await axios.create({
            baseURL: API_URL,
            timeout: 10000,
          }).post(`/api/auth/refresh`, {
            refreshToken: refreshToken
          });

          if (refreshResponse.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
            
            // Cập nhật lại token mới
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Gửi lại request gốc với token mới
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
        
        // Nếu refresh thất bại, chuyển hướng về trang đăng nhập
        handleLogout();
      } catch (refreshError) {
        handleLogout();
      }
    }

    // Xử lý các lỗi khác
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred:', error.response.data?.message || error.message);
      }
    } else if (error.request) {
      console.error('Network error - no response received');
    }

    return Promise.reject(error);
  }
);

import { logout } from "@/lib/auth";

// Hàm logout chuyển hướng đến trang đăng nhập
const handleLogout = () => {
  logout('/login');
};

export default apiClient;
