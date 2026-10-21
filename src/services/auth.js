// src/services/auth.js
import api from './api';

export const authService = {
  // Connexion
  async login(identifiant, mot_de_passe) {
    const response = await api.post('/auth/login', {
      identifiant,
      mot_de_passe
    });
    
    // Sauvegarder le token et l'utilisateur
    localStorage.setItem('shams_token', response.data.token);
    localStorage.setItem('shams_user', JSON.stringify(response.data.utilisateur));
    
    return response.data;
  },

  // Déconnexion
  logout() {
    localStorage.removeItem('shams_token');
    localStorage.removeItem('shams_user');
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser() {
    const user = localStorage.getItem('shams_user');
    return user ? JSON.parse(user) : null;
  },

  // Vérifier si connecté
  isAuthenticated() {
    return !!localStorage.getItem('shams_token');
  }
};