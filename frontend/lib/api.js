import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Token added to request:', config.url, 'Token exists:', !!token);
  } else {
    console.warn('⚠️ No token found for request:', config.url);
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
    
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if ((status === 401 || status === 403) && !isLoginRequest) {
      console.warn(`🚫 ${status} - removing token and redirecting to login`);
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;