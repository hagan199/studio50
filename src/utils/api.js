import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// Sections render as their data arrives, so "requests still in flight" means
// the page layout is still changing (used to land /#section links correctly).
let inFlight = 0;
export const pendingRequests = () => inFlight;
const settle = () => { inFlight = Math.max(0, inFlight - 1); };

api.interceptors.request.use((config) => {
  inFlight += 1;
  const token = localStorage.getItem('studio50_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => { settle(); return res; },
  (err) => {
    settle();
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
