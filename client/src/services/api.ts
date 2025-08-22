import axios from 'axios';

const base = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
console.log('API_BASE =', base);

export const api = axios.create({
  baseURL: base,
  withCredentials: true, // cookies
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${t}`,
    } as any;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);
