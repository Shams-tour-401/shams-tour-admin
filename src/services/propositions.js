// src/services/propositions.js
import api from './api';

export const propositionsService = {
  // Liste des propositions d'une demande
  async getByDemande(demandeId) {
    const response = await api.get(`/demandes/${demandeId}/propositions`);
    return response.data;
  },

  // Créer une nouvelle version
  async creer(demandeId, data) {
    const response = await api.post(`/demandes/${demandeId}/propositions`, data);
    return response.data;
  },

  // Enregistrer l'accord client
  async enregistrerAccord(demandeId, propositionId, mode) {
    const response = await api.post(
      `/demandes/${demandeId}/propositions/${propositionId}/accord`,
      { mode }
    );
    return response.data;
  },

  // Vérifier une ligne
  async verifierLigne(demandeId, propositionId, elementId, statut) {
    const response = await api.put(
      `/demandes/${demandeId}/propositions/${propositionId}/elements/${elementId}`,
      { statut_disponibilite: statut }
    );
    return response.data;
  }
};