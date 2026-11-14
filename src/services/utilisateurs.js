// src/services/utilisateurs.js
import api from './api';

export const utilisateursService = {
  async getAll() {
    const response = await api.get('/utilisateurs');
    return response.data;
  },
  
  async create(data) {
    const response = await api.post('/utilisateurs', data);
    return response.data;
  },
  
  async changerStatut(id, statut) {
    const response = await api.put(`/utilisateurs/${id}/statut`, { statut });
    return response.data;
  },

  // ✅ LA FONCTION MANQUANTE
  async changerMotDePasse(ancien_mot_de_passe, nouveau_mot_de_passe) {
    const response = await api.put('/utilisateurs/mot-de-passe', {
      ancien_mot_de_passe,
      nouveau_mot_de_passe
    });
    return response.data;
  }
};
