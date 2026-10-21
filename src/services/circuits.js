// src/services/circuits.js
import api from './api';

export const circuitsService = {
  async getAll() {
    const response = await api.get('/circuits');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/circuits/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/circuits', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/circuits/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/circuits/${id}`);
    return response.data;
  },

  async publier(id) {
    const response = await api.post(`/circuits/${id}/publier`);
    return response.data;
  },

  async ajouterElement(circuitId, jourId, data) {
    const response = await api.post(`/circuits/${circuitId}/jours/${jourId}/elements`, data);
    return response.data;
  },

  async supprimerElement(elementId) {
    const response = await api.delete(`/circuits/elements/${elementId}`);
    return response.data;
  }
};