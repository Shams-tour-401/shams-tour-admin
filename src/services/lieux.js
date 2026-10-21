// src/services/lieux.js
import api from './api';

export const lieuxService = {
  async getAll() {
    const response = await api.get('/lieux');
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/lieux/${id}`);
    return response.data;
  },
  async create(data) {
    const response = await api.post('/lieux', data);
    return response.data;
  },
  async update(id, data) {
    const response = await api.put(`/lieux/${id}`, data);
    return response.data;
  }
};