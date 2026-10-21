// src/services/alertes.js
import api from './api';

export const alertesService = {
  async getAll() {
    const response = await api.get('/alertes');
    return response.data;
  }
};