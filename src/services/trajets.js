// src/services/trajets.js
import api from './api';

export const trajetsService = {
  async getAll() {
    const response = await api.get('/trajets');
    return response.data;
  },
  async create(data) {
    const response = await api.post('/trajets', data);
    return response.data;
  },
  async update(id, data) {
    const response = await api.put(`/trajets/${id}`, data);
    return response.data;
  },
  async delete(id) {
    const response = await api.delete(`/trajets/${id}`);
    return response.data;
  }
};