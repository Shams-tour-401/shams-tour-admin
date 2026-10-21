// src/services/tarifs.js
import api from './api';

export const tarifsService = {
  async getAll() {
    const response = await api.get('/tarifs');
    return response.data;
  },

  async getByActivite(activiteId) {
    const response = await api.get(`/tarifs/activite/${activiteId}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/tarifs', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/tarifs/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/tarifs/${id}`);
    return response.data;
  },

  async verifier(id) {
    const response = await api.put(`/tarifs/${id}/verifier`);
    return response.data;
  }
};