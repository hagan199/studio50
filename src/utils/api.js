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

// Every homepage section loads /api/content on its own. Share one request
// between callers that ask for the same URL at the same time, so the sections
// receive the same data in the same tick and the page fills in at once
// instead of piece by piece. Only plain GETs (no per-call config) are shared,
// and only while in flight — nothing is cached afterwards.
const sharedGets = new Map();
const plainGet = api.get.bind(api);
api.get = (url, config) => {
  if (config) return plainGet(url, config);
  let pending = sharedGets.get(url);
  if (!pending) {
    pending = plainGet(url).finally(() => sharedGets.delete(url));
    sharedGets.set(url, pending);
  }
  // Each caller gets its own copy so one component cannot mutate another's.
  return pending.then((res) => ({ ...res, data: structuredClone(res.data) }));
};

export default api;
