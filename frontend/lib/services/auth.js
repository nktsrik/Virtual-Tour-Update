import api from '../api';
import Cookies from 'js-cookie';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    console.log('Auth service - Full response:', response.data);
    
    if (response.data?.data?.tokens?.accessToken) {
      Cookies.set('token', response.data.data.tokens.accessToken);
    } else if (response.data?.data?.access_token) {
      Cookies.set('token', response.data.data.access_token);
    }
    
    if (response.data?.data?.user) {
      Cookies.set('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  async loginWithGoogle(googleToken, email, nama) {
    const response = await api.post('/auth/google-login', { googleToken, email, nama });

    if (response.data?.data?.tokens?.accessToken) {
      Cookies.set('token', response.data.data.tokens.accessToken);
    }
    if (response.data?.data?.user) {
      Cookies.set('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout() {
    Cookies.remove('token');
    Cookies.remove('user');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};