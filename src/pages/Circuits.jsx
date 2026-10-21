// src/pages/Circuits.jsx
import { useEffect, useState } from 'react';
import { circuitsService } from '../services/circuits';
import { activitesService } from '../services/activites';
import { useAuth } from '../context/AuthContext';

export default function Circuits() {
  const [circuits, setCircuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [circuitEnEdition, setCircuitEnEdition] = useState(null);
  const [circuitSelectionne, setCircuitSelectionne] = useState(null);
  const { user } = useAuth();
  const estAdmin = user?.role === 'administrateur';

  useEffect(() => {
    chargerCircuits();
  }, []);

  const chargerCircuits = async () => {
    try {
      setLoading(true);
      const data = await circuitsService.getAll();
      setCircuits(data);
    } catch (error) {
      console.error('Erreur :', error);
      setErreur('Impossible de charger les circuits');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirCreation = () => {
    setCircuitEnEdition(null);
    setModalOuvert(true);
  };

  const ouvrirEdition = (circuit) => {
    setCircuitEnEdition(circuit);
    setModalOuvert(true);
  };

  const fermerModal = () => {
    setModalOuvert(false);
    setCircuitEnEdition(null);
  };

  const sauvegarder = async (data) => {
    try {
      if (circuitEnEdition) {
        await circuitsService.update(circuitEnEdition.id, data);
      } else {
        await circuitsService.create(data);
      }
      await chargerCircuits();
      fermerModal();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const publier = async (circuit) => {
    try {
      await circuitsService.publier(circuit.id);
      await chargerCircuits();
      alert('✅ Circuit publié avec succès !');
    } catch (error) {
      const data = error.response?.data;
      if (data?.problemes) {
        alert('❌ Impossible de publier :\n\n' + data.problemes.join('\n'));
      } else {
        alert('Erreur : ' + (data?.error || error.message));
      }
    }
  };

  const supprimer = async (circuit) => {
    if (!confirm(`Supprimer "${circuit.nom}" ?`)) return;
    try {
      await circuitsService.delete(circuit.id);
      await chargerCircuits();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const voirDetail = async (circuit) => {
    try {
      const data = await circuitsService.getById(circuit.id);
      setCircuitSelectionne(data);
    } catch (error) {
      alert('Erreur : ' + error.message);
    }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (erreur) return <div style={styles.erreur}>{erreur}</div>;

  return (
    <div>
      <div style={styles.barreActions}>
        <div>
          <h2 style={styles.titre}>Circuits ({circuits.length})</h2>
          <p style={styles.sousTitre}>
            {estAdmin ? 'Gestion des circuits touristiques' : 'Consultation des circuits (lecture seule)'}
          </p>
        </div>
        {estAdmin && (
          <button onClick={ouvrirCreation} style={styles.btnPrimaire}>
            ➕ Nouveau circuit
          </button>
        )}
      </div>

      <div style={styles.tableContainer}>
        {circuits.length === 0 ? (
          <div style={styles.aucune}>Aucun circuit</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Durée</th>
                <th style={styles.th}>Rythme</th>
                <th style={styles.th}>Étiquettes</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {circuits.map((c) => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{c.nom}</strong>
                    {c.description && (
                      <div style={styles.description}>{c.description}</div>
                    )}
                  </td>
                  <td style={styles.td}>{c.duree_jours} jour(s)</td>
                  <td style={styles.td}>
                    <span style={styles.rythme}>{c.rythme}</span>
                  </td>
                  <td style={styles.td}>
                    <small>{c.etiquettes || '—'}</small>
                  </td>
                  <td style={styles.td}>
                    <StatutBadge statut={c.statut} />
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => voirDetail(c)} style={styles.btnIcone} title="Voir détail">
                      👁️
                    </button>
                    {estAdmin ? (
                      <>
                        <button onClick={() => ouvrirEdition(c)} style={styles.btnIcone} title="Modifier">
                          ✏️
                        </button>
                        {c.statut === 'brouillon' && (
                          <button onClick={() => publier(c)} style={styles.btnIcone} title="Publier">
                            🚀
                          </button>
                        )}
                        <button onClick={() => supprimer(c)} style={styles.btnIcone} title="Supprimer">
                          🗑️
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOuvert && estAdmin && (
        <ModalCircuit
          circuit={circuitEnEdition}
          onSave={sauvegarder}
          onClose={fermerModal}
        />
      )}

      {circuitSelectionne && (
        <ModalDetailCircuit
          circuit={circuitSelectionne}
          estAdmin={estAdmin}
          onClose={() => setCircuitSelectionne(null)}
          onRefresh={async () => {
            const data = await circuitsService.getById(circuitSelectionne.id);
            setCircuitSelectionne(data);
          }}
        />
      )}
    </div>
  );
}

function StatutBadge({ statut }) {
  const config = {
    'brouillon': { label: 'Brouillon', bg: '#95A5A6' },
    'publie': { label: 'Publié', bg: '#27AE60' },
    'a_reviser': { label: 'À réviser', bg: '#E67E22' }
  };
  const c = config[statut] || config.brouillon;
  return (
    <span style={{ ...styles.badge, backgroundColor: c.bg }}>{c.label}</span>
  );
}

function ModalCircuit({ circuit, onSave, onClose }) {
  const [form, setForm] = useState({
    nom: circuit?.nom || '',
    description: circuit?.description || '',
    duree_jours: circuit?.duree_jours || 2,
    etiquettes: circuit?.etiquettes || '',
    rythme: circuit?.rythme || 'equilibre',
    profils_adaptes: circuit?.profils_adaptes || '',
    jours_permutables: circuit?.jours_permutables || 0
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
    onSave({
      ...form,
      duree_jours: parseInt(form.duree_jours)
    });
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>{circuit ? 'Modifier' : 'Nouveau'} circuit</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
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
              <label style={styles.label}>Durée (jours) *</label>
              <input
                type="number"
                name="duree_jours"
                value={form.duree_jours}
                onChange={handleChange}
                min="1"
                max="5"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Rythme</label>
              <select
                name="rythme"
                value={form.rythme}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="detente">Détente</option>
                <option value="equilibre">Équilibré</option>
                <option value="intense">Intense</option>
              </select>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Étiquettes (séparées par virgule)</label>
              <input
                type="text"
                name="etiquettes"
                value={form.etiquettes}
                onChange={handleChange}
                placeholder="nature,aventure,culture"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Profils adaptés</label>
              <input
                type="text"
                name="profils_adaptes"
                value={form.profils_adaptes}
                onChange={handleChange}
                placeholder="couple,famille,amis"
                style={styles.input}
              />
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

          <div style={styles.field}>
            <label style={styles.label}>
              <input
                type="checkbox"
                name="jours_permutables"
                checked={form.jours_permutables === 1}
                onChange={handleChange}
              />
              {' '}Jours permutables
            </label>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>Annuler</button>
            <button type="submit" style={styles.btnPrimaire}>
              {circuit ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalDetailCircuit({ circuit, estAdmin, onClose, onRefresh }) {
  const [activites, setActivites] = useState([]);
  const [modalAjoutElement, setModalAjoutElement] = useState(null);

  useEffect(() => {
    chargerActivites();
  }, []);

  const chargerActivites = async () => {
    try {
      const data = await activitesService.getAll();
      setActivites(data);
    } catch (error) {
      console.error(error);
    }
  };

  const ajouterElement = async (jourId, data) => {
    try {
      await circuitsService.ajouterElement(circuit.id, jourId, data);
      await onRefresh();
      setModalAjoutElement(null);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const supprimerElement = async (elementId) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      await circuitsService.supprimerElement(elementId);
      await onRefresh();
    } catch (error) {
      alert('Erreur : ' + error.message);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modal, maxWidth: '900px' }}>
        <div style={styles.modalHeader}>
          <div>
            <h3>{circuit.nom}</h3>
            <small style={{ color: '#7f8c8d' }}>
              {circuit.duree_jours} jour(s) — {circuit.rythme}
            </small>
          </div>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {circuit.jours?.map((jour) => (
            <div key={jour.id} style={styles.jourCard}>
              <div style={styles.jourHeader}>
                <h4>📅 {jour.titre}</h4>
                {estAdmin && (
                  <button
                    onClick={() => setModalAjoutElement(jour.id)}
                    style={styles.btnPetit}
                  >
                    ➕ Ajouter
                  </button>
                )}
              </div>

              {jour.elements?.length === 0 ? (
                <p style={styles.vide}>Aucun élément</p>
              ) : (
                <ul style={styles.elementListe}>
                  {jour.elements.map((el) => (
                    <li key={el.id} style={styles.elementItem}>
                      <span style={styles.elementType}>
                        {el.type === 'activite' && '🎯'}
                        {el.type === 'trajet' && '🚐'}
                        {el.type === 'pause' && '☕'}
                        {el.type === 'temps_libre' && '🕐'}
                      </span>
                      <span style={styles.elementNom}>
                        {el.activite_nom || el.type}
                        {el.duree_min && ` (${el.duree_min} min)`}
                      </span>
                      {estAdmin && (
                        <button
                          onClick={() => supprimerElement(el.id)}
                          style={styles.btnSuppr}
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {modalAjoutElement && estAdmin && (
        <ModalAjoutElement
          activites={activites}
          onSave={(data) => ajouterElement(modalAjoutElement, data)}
          onClose={() => setModalAjoutElement(null)}
        />
      )}
    </div>
  );
}

function ModalAjoutElement({ activites, onSave, onClose }) {
  const [type, setType] = useState('activite');
  const [activiteId, setActiviteId] = useState('');
  const [duree, setDuree] = useState(60);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { type, duree_min: parseInt(duree) };
    if (type === 'activite' && activiteId) {
      data.activite_id = parseInt(activiteId);
      const act = activites.find(a => a.id === parseInt(activiteId));
      if (act) data.duree_min = act.duree_min;
    }
    onSave(data);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modal, maxWidth: '500px' }}>
        <div style={styles.modalHeader}>
          <h3>Ajouter un élément</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={styles.input}>
              <option value="activite">Activité</option>
              <option value="trajet">Trajet</option>
              <option value="pause">Pause</option>
              <option value="temps_libre">Temps libre</option>
            </select>
          </div>

          {type === 'activite' && (
            <div style={styles.field}>
              <label style={styles.label}>Activité</label>
              <select value={activiteId} onChange={(e) => setActiviteId(e.target.value)} required style={styles.input}>
                <option value="">Sélectionner...</option>
                {activites.map(a => (
                  <option key={a.id} value={a.id}>{a.nom}</option>
                ))}
              </select>
            </div>
          )}

          {type !== 'activite' && (
            <div style={styles.field}>
              <label style={styles.label}>Durée (minutes)</label>
              <input
                type="number"
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>Annuler</button>
            <button type="submit" style={styles.btnPrimaire}>Ajouter</button>
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
    backgroundColor: 'white', padding: '20px 24px', borderRadius: '8px',
    marginBottom: '16px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  titre: { fontSize: '20px', color: '#2C3E50' },
  sousTitre: { fontSize: '13px', color: '#7f8c8d', marginTop: '4px' },
  btnPrimaire: {
    padding: '10px 20px', backgroundColor: '#C0392B', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  },
  btnSecondaire: {
    padding: '10px 20px', backgroundColor: '#ECF0F1', color: '#2C3E50',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600'
  },
  btnPetit: {
    padding: '4px 10px', backgroundColor: '#C0392B', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600'
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
  description: { fontSize: '11px', color: '#95A5A6', marginTop: '2px' },
  rythme: {
    display: 'inline-block', padding: '3px 10px', backgroundColor: '#ECF0F1',
    borderRadius: '12px', fontSize: '11px', fontWeight: '600'
  },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
    color: 'white', fontSize: '11px', fontWeight: '600'
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
    maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'
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
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
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
    padding: '16px 0 0', display: 'flex', justifyContent: 'flex-end',
    gap: '12px', marginTop: '16px'
  },
  jourCard: {
    border: '1px solid #ecf0f1', borderRadius: '8px',
    padding: '16px', marginBottom: '12px', backgroundColor: '#fafafa'
  },
  jourHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px'
  },
  vide: { fontSize: '12px', color: '#95A5A6', fontStyle: 'italic' },
  elementListe: { listStyle: 'none', padding: 0 },
  elementItem: {
    display: 'flex', alignItems: 'center', padding: '6px 10px',
    backgroundColor: 'white', borderRadius: '4px', marginBottom: '4px',
    border: '1px solid #ecf0f1'
  },
  elementType: { marginRight: '8px', fontSize: '16px' },
  elementNom: { flex: 1, fontSize: '13px', color: '#2C3E50' },
  btnSuppr: {
    background: 'none', border: 'none', color: '#C0392B',
    cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
  }
};