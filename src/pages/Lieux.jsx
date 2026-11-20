// src/pages/Lieux.jsx
import { useEffect, useState } from 'react';
import { lieuxService } from '../services/lieux';
import { destinationsService } from '../services/destinations';

export default function Lieux() {
  const [lieux, setLieux] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const [filtreType, setFiltreType] = useState('');

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      setLoading(true);
      const [lxs, dests] = await Promise.all([
        lieuxService.getAll(),
        destinationsService.getAll()
      ]);
      setLieux(lxs);
      setDestinations(dests);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const lieuxFiltres = filtreType
    ? lieux.filter(l => l.type === filtreType)
    : lieux;

  const sauvegarder = async (form) => {
    try {
      if (enEdition) {
        await lieuxService.update(enEdition.id, form);
      } else {
        await lieuxService.create(form);
      }
      await charger();
      setModalOuvert(false);
      setEnEdition(null);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'point_rendez_vous': '📍 Point de rendez-vous',
      'site': '🏞️ Site',
      'restaurant': '🍽️ Restaurant',
      'hebergement': '🏨 Hébergement'
    };
    return labels[type] || type;
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div>
      <div style={styles.barreActions}>
        <div>
          <h2 style={styles.titre}>Lieux ({lieuxFiltres.length})</h2>
          <p style={styles.sousTitre}>Points de rendez-vous et sites touristiques</p>
        </div>
        <div style={styles.actionsDroite}>
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            style={styles.select}
          >
            <option value="">Tous les types</option>
            <option value="point_rendez_vous">Points de rendez-vous</option>
            <option value="site">Sites</option>
            <option value="restaurant">Restaurants</option>
            <option value="hebergement">Hébergements</option>
          </select>
          <button 
            onClick={() => { setEnEdition(null); setModalOuvert(true); }}
            style={styles.btnPrimaire}
          >
            ➕ Nouveau lieu
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {lieuxFiltres.length === 0 ? (
          <div style={styles.aucune}>Aucun lieu</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Destination</th>
                <th style={styles.th}>Adresse</th>
                <th style={styles.th}>Activités</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lieuxFiltres.map((l) => (
                <tr key={l.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{l.nom}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>
                      {getTypeLabel(l.type)}
                    </span>
                  </td>
                  <td style={styles.td}>{l.destination_nom}</td>
                  <td style={styles.td}>
                    <small>{l.adresse || '—'}</small>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.nbBadge}>{l.nb_activites || 0}</span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => { setEnEdition(l); setModalOuvert(true); }} 
                      style={styles.btnIcone}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOuvert && (
        <ModalLieu
          lieu={enEdition}
          destinations={destinations}
          onSave={sauvegarder}
          onClose={() => { setModalOuvert(false); setEnEdition(null); }}
        />
      )}
    </div>
  );
}

function ModalLieu({ lieu, destinations, onSave, onClose }) {
  const [form, setForm] = useState({
    nom: lieu?.nom || '',
    destination_id: lieu?.destination_id || (destinations[0]?.id || ''),
    type: lieu?.type || 'site',
    adresse: lieu?.adresse || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>{lieu ? 'Modifier' : 'Nouveau'} lieu</h3>
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

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="point_rendez_vous">Point de rendez-vous</option>
                <option value="site">Site</option>
                <option value="restaurant">Restaurant</option>
                <option value="hebergement">Hébergement</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Destination *</label>
              <select
                name="destination_id"
                value={form.destination_id}
                onChange={handleChange}
                required
                style={styles.input}
              >
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Adresse</label>
            <input
              type="text"
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              placeholder="Ex: Centre-ville, Majunga"
              style={styles.input}
            />
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>Annuler</button>
            <button type="submit" style={styles.btnPrimaire}>
              {lieu ? 'Enregistrer' : 'Créer'}
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
  typeBadge: {
    display: 'inline-block', padding: '3px 10px', backgroundColor: '#ECF0F1',
    borderRadius: '12px', fontSize: '11px', fontWeight: '600'
  },
  nbBadge: {
    display: 'inline-block', padding: '2px 8px', backgroundColor: '#3498DB',
    color: 'white', borderRadius: '10px', fontSize: '11px', fontWeight: '600'
  },
  btnIcone: {
    padding: '6px 10px', backgroundColor: 'transparent',
    border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
  },
  modal: {
    backgroundColor: 'white', borderRadius: '8px', width: '100%',
    maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
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
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#2C3E50', marginBottom: '6px' },
  input: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '14px', outline: 'none'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px'
  }
};
