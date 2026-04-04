import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If unauthorized, logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // IMPORTANT: don't hard-navigate here.
      // A tab switch/background/resume often triggers in-flight requests with
      // expired auth; hard navigation turns into a "full reload" experience.
      // Let route guards / UI decide what to do next.
    }
    return Promise.reject(error);
  }
);

export default api;
