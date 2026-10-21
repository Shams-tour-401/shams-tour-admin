// src/pages/Prestataires.jsx
import { useEffect, useState } from 'react';
import { prestatairesService } from '../services/prestataires';
import { useAuth } from '../context/AuthContext';

export default function Prestataires() {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState('');
  const { user } = useAuth();
  const estAdmin = user?.role === 'administrateur';

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await prestatairesService.getAll();
      setPrestataires(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const prestatairesFiltres = filtreStatut
    ? prestataires.filter(p => p.statut === filtreStatut)
    : prestataires;

  const sauvegarder = async (form) => {
    try {
      if (enEdition) {
        await prestatairesService.update(enEdition.id, form);
      } else {
        await prestatairesService.create(form);
      }
      await charger();
      setModalOuvert(false);
      setEnEdition(null);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const desactiver = async (prestataire) => {
    if (!confirm(`Désactiver "${prestataire.nom}" ?`)) return;
    try {
      await prestatairesService.desactiver(prestataire.id);
      await charger();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div>
      <div style={styles.barreActions}>
        <div>
          <h2 style={styles.titre}>Prestataires ({prestatairesFiltres.length})</h2>
          <p style={styles.sousTitre}>
            {estAdmin ? 'Guides, transporteurs et fournisseurs de services' : 'Consultation des prestataires (lecture seule)'}
          </p>
        </div>
        <div style={styles.actionsDroite}>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            style={styles.select}
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
          {estAdmin && (
            <button
              onClick={() => { setEnEdition(null); setModalOuvert(true); }}
              style={styles.btnPrimaire}
            >
              ➕ Nouveau prestataire
            </button>
          )}
        </div>
      </div>

      <div style={styles.tableContainer}>
        {prestatairesFiltres.length === 0 ? (
          <div style={styles.aucune}>Aucun prestataire</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Téléphone(s)</th>
                <th style={styles.th}>Notes</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prestatairesFiltres.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{p.nom}</strong>
                  </td>
                  <td style={styles.td}>
                    {p.telephones || '—'}
                  </td>
                  <td style={styles.td}>
                    <small style={styles.notes}>
                      {p.notes || '—'}
                    </small>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statutBadge,
                      backgroundColor: p.statut === 'actif' ? '#27AE60' : '#95A5A6'
                    }}>
                      {p.statut}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {estAdmin ? (
                      <>
                        <button
                          onClick={() => { setEnEdition(p); setModalOuvert(true); }}
                          style={styles.btnIcone}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        {p.statut === 'actif' && (
                          <button
                            onClick={() => desactiver(p)}
                            style={styles.btnIcone}
                            title="Désactiver"
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    ) : (
                      <span style={styles.lectureSeule}>👁️ Lecture seule</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOuvert && estAdmin && (
        <ModalPrestataire
          prestataire={enEdition}
          onSave={sauvegarder}
          onClose={() => { setModalOuvert(false); setEnEdition(null); }}
        />
      )}
    </div>
  );
}

function ModalPrestataire({ prestataire, onSave, onClose }) {
  const [form, setForm] = useState({
    nom: prestataire?.nom || '',
    telephones: prestataire?.telephones || '',
    notes: prestataire?.notes || '',
    statut: prestataire?.statut || 'actif'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>{prestataire ? 'Modifier' : 'Nouveau'} prestataire</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nom *</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Téléphone(s)</label>
            <input
              type="text"
              name="telephones"
              value={form.telephones}
              onChange={handleChange}
              placeholder="+261 34 12 345 67, +261 32 98 765 43"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Notes internes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Informations complémentaires..."
              rows="3"
              style={styles.textarea}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Statut</label>
            <select
              name="statut"
              value={form.statut}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>Annuler</button>
            <button type="submit" style={styles.btnPrimaire}>
              {prestataire ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  barreActions: {
    backgroundColor: 'white', padding: '20px 24px', borderRadius: '8px',
    marginBottom: '16px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexWrap: 'wrap', gap: '12px'
  },
  titre: { fontSize: '20px', color: '#2C3E50' },
  sousTitre: { fontSize: '13px', color: '#7f8c8d', marginTop: '4px' },
  actionsDroite: { display: 'flex', gap: '12px', alignItems: 'center' },
  select: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '13px', backgroundColor: 'white', cursor: 'pointer'
  },
  btnPrimaire: {
    padding: '10px 20px', backgroundColor: '#C0392B', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  btnSecondaire: {
    padding: '10px 20px', backgroundColor: '#ECF0F1', color: '#2C3E50',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  tableContainer: {
    backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  aucune: { padding: '60px 20px', textAlign: 'center', color: '#95A5A6' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8f9fa' },
  th: {
    padding: '12px', textAlign: 'left', fontSize: '12px', color: '#7f8c8d',
    fontWeight: '600', textTransform: 'uppercase', borderBottom: '2px solid #ecf0f1'
  },
  tr: { borderBottom: '1px solid #ecf0f1' },
  td: { padding: '12px', fontSize: '13px', color: '#2C3E50' },
  notes: { color: '#7f8c8d', fontStyle: 'italic' },
  statutBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
    color: 'white', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'
  },
  lectureSeule: {
    fontSize: '12px', color: '#95A5A6', fontStyle: 'italic'
  },
  btnIcone: {
    padding: '6px 10px', marginRight: '4px', backgroundColor: 'transparent',
    border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
  },
  modal: {
    backgroundColor: 'white', borderRadius: '8px', width: '100%',
    maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
  },
  modalHeader: {
    padding: '20px 24px', borderBottom: '1px solid #ecf0f1',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  btnFermer: {
    background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', color: '#7f8c8d'
  },
  form: { padding: '24px' },
  field: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#2C3E50', marginBottom: '6px' },
  input: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '14px', outline: 'none'
  },
  textarea: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px'
  }
};