// src/services/demandes.js
import api from './api';

export const demandesService = {
  async getAll(filtres = {}) {
    const response = await api.get('/demandes', { params: filtres });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/demandes/${id}`);
    return response.data;
  },

  async changerStatut(id, statut, motif = null) {
    const response = await api.put(`/demandes/${id}/statut`, {
      statut,
      motif
    });
    return response.data;
  },

  async ajouterNote(id, texte) {
    const response = await api.post(`/demandes/${id}/notes`, { texte });
    return response.data;
  }
};