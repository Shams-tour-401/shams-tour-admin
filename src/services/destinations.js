// src/services/destinations.js
import api from './api';

export const destinationsService = {
  async getAll() {
    const response = await api.get('/destinations');
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/destinations/${id}`);
    return response.data;
  }
};