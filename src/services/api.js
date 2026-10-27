// src/services/api.js
import axios from 'axios';

// URL de base de l'API Node.js (sur Render)
const API_URL = 'https://shams-tour-api.onrender.com/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur : ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shams_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur : gérer les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expiré ou invalide : déconnecter
      localStorage.removeItem('shams_token');
      localStorage.removeItem('shams_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
