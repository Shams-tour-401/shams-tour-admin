// src/services/auth.js
import api from './api';

export const authService = {
  async login(identifiant, mot_de_passe) {
    const response = await api.post('/auth/login', {
      identifiant,
      mot_de_passe
    });
    
    localStorage.setItem('shams_token', response.data.token);
    localStorage.setItem('shams_user', JSON.stringify(response.data.utilisateur));
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('shams_token');
    localStorage.removeItem('shams_user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('shams_user');
    return user ? JSON.parse(user) : null;
  },

  // ✅ La virgule manquante était ici
  getToken() {
    return localStorage.getItem('shams_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('shams_token');
  }
};
