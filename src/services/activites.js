// src/services/activites.js
import api from './api';

export const activitesService = {
  // Liste des activités
  async getAll() {
    const response = await api.get('/activites');
    return response.data;
  },

  // Détail d'une activité
  async getById(id) {
    const response = await api.get(`/activites/${id}`);
    return response.data;
  },

  // Créer une activité
  async create(data) {
    const response = await api.post('/activites', data);
    return response.data;
  },

  // Modifier une activité
  async update(id, data) {
    const response = await api.put(`/activites/${id}`, data);
    return response.data;
  },

  // Désactiver une activité
  async desactiver(id) {
    const response = await api.delete(`/activites/${id}`);
    return response.data;
  }
};