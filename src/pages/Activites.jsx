// src/pages/Activites.jsx
import { useEffect, useState } from 'react';
import { activitesService } from '../services/activites';
import { lieuxService } from '../services/lieux';
import { useAuth } from '../context/AuthContext';

export default function Activites() {
  const [activites, setActivites] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [activiteEnEdition, setActiviteEnEdition] = useState(null);
  const { user } = useAuth();
const estAdmin = user?.role === 'administrateur';

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [acts, lxs] = await Promise.all([
        activitesService.getAll(),
        lieuxService.getAll()
      ]);
      setActivites(acts);
      setLieux(lxs);
    } catch (error) {
      console.error('Erreur chargement :', error);
      setErreur('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModalCreation = () => {
    setActiviteEnEdition(null);
    setModalOuvert(true);
  };

  const ouvrirModalEdition = (activite) => {
    setActiviteEnEdition(activite);
    setModalOuvert(true);
  };

  const fermerModal = () => {
    setModalOuvert(false);
    setActiviteEnEdition(null);
  };

  const sauvegarder = async (data) => {
    try {
      if (activiteEnEdition) {
        await activitesService.update(activiteEnEdition.id, data);
      } else {
        await activitesService.create(data);
      }
      await chargerDonnees();
      fermerModal();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const desactiver = async (activite) => {
    if (!confirm(`Désactiver "${activite.nom}" ?\n\nLes circuits qui l'utilisent seront marqués "à réviser".`)) return;
    
    try {
      await activitesService.desactiver(activite.id);
      await chargerDonnees();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (erreur) return <div style={styles.erreur}>{erreur}</div>;

  return (
    <div>
      {/* Barre d'actions */}
      <div style={styles.barreActions}>
        <div>
          <h2 style={styles.titre}>Activités ({activites.length})</h2>
          <p style={styles.sousTitre}>Catalogue des activités disponibles</p>
        </div>
        {estAdmin && (
  <button onClick={ouvrirModalCreation} style={styles.btnPrimaire}>
    ➕ Nouvelle activité
  </button>
)}
      </div>

      {/* Tableau */}
      <div style={styles.tableContainer}>
        {activites.length === 0 ? (
          <div style={styles.aucune}>Aucune activité</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Catégorie</th>
                <th style={styles.th}>Lieu</th>
                <th style={styles.th}>Durée</th>
                <th style={styles.th}>Âge min.</th>
                <th style={styles.th}>Effectif</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activites.map((a) => (
                <tr key={a.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{a.nom}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categorie}>{a.categorie}</span>
                  </td>
                  <td style={styles.td}>{a.lieu_nom}</td>
                  <td style={styles.td}>{Math.floor(a.duree_min / 60)}h{a.duree_min % 60 > 0 ? String(a.duree_min % 60).padStart(2, '0') : ''}</td>
                  <td style={styles.td}>{a.age_min} ans</td>
                  <td style={styles.td}>{a.effectif_min} - {a.effectif_max}</td>
                  <td style={styles.td}>
  {estAdmin ? (
    <>
      <button onClick={() => ouvrirModalEdition(a)} style={styles.btnIcone} title="Modifier">
        ✏️
      </button>
      <button onClick={() => desactiver(a)} style={styles.btnIcone} title="Désactiver">
        🗑️
      </button>
    </>
  ) : (
    <span style={styles.lectureSeule}>👁️ Consultation</span>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOuvert && (
        <ModalActivite
          activite={activiteEnEdition}
          lieux={lieux}
          onSave={sauvegarder}
          onClose={fermerModal}
        />
      )}
    </div>
  );
}

function ModalActivite({ activite, lieux, onSave, onClose }) {
  const [form, setForm] = useState({
    nom: activite?.nom || '',
    description: activite?.description || '',
    categorie: activite?.categorie || 'Nature',
    lieu_id: activite?.lieu_id || (lieux[0]?.id || ''),
    duree_min: activite?.duree_min || 120,
    creneaux: activite?.creneaux || '08:00',
    age_min: activite?.age_min || 0,
    age_max: activite?.age_max || '',
    effectif_min: activite?.effectif_min || 1,
    effectif_max: activite?.effectif_max || 12,
    dependance_meteo: activite?.dependance_meteo || 0,
    inclus: activite?.inclus || '',
    non_inclus: activite?.non_inclus || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>{activite ? 'Modifier' : 'Nouvelle'} activité</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
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
              <label style={styles.label}>Catégorie</label>
              <select
                name="categorie"
                value={form.categorie}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Nature">Nature</option>
                <option value="Aventure">Aventure</option>
                <option value="Culture">Culture</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Lieu *</label>
              <select
                name="lieu_id"
                value={form.lieu_id}
                onChange={handleChange}
                required
                style={styles.input}
              >
                {lieux.map(l => (
                  <option key={l.id} value={l.id}>{l.nom}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Durée (minutes) *</label>
              <input
                type="number"
                name="duree_min"
                value={form.duree_min}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Âge minimum</label>
              <input
                type="number"
                name="age_min"
                value={form.age_min}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Effectif min</label>
              <input
                type="number"
                name="effectif_min"
                value={form.effectif_min}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Effectif max</label>
              <input
                type="number"
                name="effectif_max"
                value={form.effectif_max}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  name="dependance_meteo"
                  checked={form.dependance_meteo === 1}
                  onChange={handleChange}
                />
                {' '}Dépend de la météo
              </label>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Inclus</label>
              <textarea
                name="inclus"
                value={form.inclus}
                onChange={handleChange}
                rows="2"
                placeholder="Guide, transport, entrée..."
                style={styles.textarea}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Non inclus</label>
              <textarea
                name="non_inclus"
                value={form.non_inclus}
                onChange={handleChange}
                rows="2"
                placeholder="Repas, boissons..."
                style={styles.textarea}
              />
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>
              Annuler
            </button>
            <button type="submit" style={styles.btnPrimaire}>
              {activite ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  erreur: { padding: '20px', backgroundColor: '#FADBD8', color: '#C0392B', borderRadius: '8px', textAlign: 'center' },
  barreActions: {
    backgroundColor: 'white',
    padding: '20px 24px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  titre: { fontSize: '20px', color: '#2C3E50' },
  sousTitre: { fontSize: '13px', color: '#7f8c8d', marginTop: '4px' },
  btnPrimaire: {
    padding: '10px 20px',
    backgroundColor: '#C0392B',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  btnSecondaire: {
    padding: '10px 20px',
    backgroundColor: '#ECF0F1',
    color: '#2C3E50',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  aucune: { padding: '60px 20px', textAlign: 'center', color: '#95A5A6' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8f9fa' },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'uppercase',
    borderBottom: '2px solid #ecf0f1'
  },
  tr: { borderBottom: '1px solid #ecf0f1' },
  td: { padding: '12px', fontSize: '13px', color: '#2C3E50' },
  categorie: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: '#ECF0F1',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  btnIcone: {
    padding: '6px 10px',
    marginRight: '4px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #ecf0f1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  btnFermer: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#7f8c8d'
  },
  form: { padding: '24px' },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  field: { display: 'flex', flexDirection: 'column' },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: '6px'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none'
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #ecf0f1',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  lectureSeule: {
  fontSize: '12px',
  color: '#95A5A6',
  fontStyle: 'italic'
},
};