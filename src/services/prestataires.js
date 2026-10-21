// src/services/prestataires.js
import api from './api';

export const prestatairesService = {
  async getAll() {
    const response = await api.get('/prestataires');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/prestataires/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/prestataires', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/prestataires/${id}`, data);
    return response.data;
  },

  async desactiver(id) {
    const response = await api.delete(`/prestataires/${id}`);
    return response.data;
  }
};