// src/services/photos.js
import api from './api';

export const photosService = {
  // Récupérer les photos d'une activité
  async getByActivite(activiteId) {
    const response = await api.get(`/photos/${activiteId}`);
    return response.data;
  },

  // Envoyer de nouvelles photos (formData)
  async upload(activiteId, formData) {
    const response = await api.post(`/photos/${activiteId}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    return response.data;
  },

  // Supprimer une photo
  async delete(photoId) {
    const response = await api.delete(`/photos/${photoId}`);
    return response.data;
  }
};