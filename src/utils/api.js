import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studio50_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('studio50_token');

      // The admin guard only checks the token at mount, so an expired session
      // otherwise leaves the editor looking usable while every save fails.
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        window.location.replace('/admin/login?expired=1');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
