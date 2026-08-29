import ApiClient from '../api/apiClient';

export const AuthService = {
  async login(email, password) {
    const res = await ApiClient.post('/auth/login', { email, password });
    if (res.data?.token) {
      ApiClient.setToken(res.data.token);
      localStorage.setItem('kopargaon_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(userData) {
    const res = await ApiClient.post('/auth/register', userData);
    if (res.data?.token) {
      ApiClient.setToken(res.data.token);
      localStorage.setItem('kopargaon_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    return ApiClient.get('/auth/me');
  },

  getUser() {
    const str = localStorage.getItem('kopargaon_user');
    try {
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(ApiClient.getToken());
  },

  logout() {
    ApiClient.setToken(null);
    localStorage.removeItem('kopargaon_user');
  }
};

export default AuthService;