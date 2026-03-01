import axios from 'axios';

// Base URL de l'API :
// - si VITE_API_BASE_URL est défini dans .env → on l'utilise
// - sinon → fallback sur http://localhost:4000/api (dev local)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
