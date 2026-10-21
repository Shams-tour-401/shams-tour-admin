// src/pages/Tarifs.jsx
import { useEffect, useState } from 'react';
import { tarifsService } from '../services/tarifs';
import { activitesService } from '../services/activites';
import { useAuth } from '../context/AuthContext';

export default function Tarifs() {
  const [tarifs, setTarifs] = useState([]);
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [tarifEnEdition, setTarifEnEdition] = useState(null);
  const [filtreActivite, setFiltreActivite] = useState('');
  const { user } = useAuth();
  const estAdmin = user?.role === 'administrateur';

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [trs, acts] = await Promise.all([
        tarifsService.getAll(),
        activitesService.getAll()
      ]);
      setTarifs(trs);
      setActivites(acts);
    } catch (error) {
      console.error('Erreur chargement :', error);
      setErreur('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const tarifsFiltres = filtreActivite
    ? tarifs.filter(t => t.activite_id === parseInt(filtreActivite))
    : tarifs;

  const ouvrirModalCreation = () => {
    setTarifEnEdition(null);
    setModalOuvert(true);
  };

  const ouvrirModalEdition = (tarif) => {
    setTarifEnEdition(tarif);
    setModalOuvert(true);
  };

  const fermerModal = () => {
    setModalOuvert(false);
    setTarifEnEdition(null);
  };

  const sauvegarder = async (data) => {
    try {
      if (tarifEnEdition) {
        await tarifsService.update(tarifEnEdition.id, data);
      } else {
        await tarifsService.create(data);
      }
      await chargerDonnees();
      fermerModal();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const supprimer = async (tarif) => {
    if (!confirm(`Supprimer ce tarif de ${tarif.prix_vente.toLocaleString('fr-FR')} Ar ?`)) return;

    try {
      await tarifsService.delete(tarif.id);
      await chargerDonnees();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const verifier = async (tarif) => {
    try {
      await tarifsService.verifier(tarif.id);
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
          <h2 style={styles.titre}>Tarifs ({tarifsFiltres.length})</h2>
          <p style={styles.sousTitre}>
            {estAdmin ? 'Gestion des tarifs par activité' : 'Consultation des tarifs (lecture seule)'}
          </p>
        </div>
        <div style={styles.actionsDroite}>
          <select
            value={filtreActivite}
            onChange={(e) => setFiltreActivite(e.target.value)}
            style={styles.select}
          >
            <option value="">Toutes les activités</option>
            {activites.map(a => (
              <option key={a.id} value={a.id}>{a.nom}</option>
            ))}
          </select>
          {estAdmin && (
            <button onClick={ouvrirModalCreation} style={styles.btnPrimaire}>
              ➕ Nouveau tarif
            </button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div style={styles.tableContainer}>
        {tarifsFiltres.length === 0 ? (
          <div style={styles.aucune}>Aucun tarif</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Activité</th>
                <th style={styles.th}>Unité</th>
                <th style={styles.th}>Prix vente</th>
                <th style={styles.th}>Coût</th>
                <th style={styles.th}>Marge</th>
                <th style={styles.th}>Période</th>
                <th style={styles.th}>Vérifié le</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tarifsFiltres.map((t) => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{t.activite_nom || 'Prestataire'}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.unite}>{formatUnite(t.unite, t)}</span>
                  </td>
                  <td style={styles.td}>
                    <strong>{t.prix_vente.toLocaleString('fr-FR')} Ar</strong>
                  </td>
                  <td style={styles.td}>
                    {t.cout ? `${t.cout.toLocaleString('fr-FR')} Ar` : '—'}
                  </td>
                  <td style={styles.td}>
                    {t.cout ? (
                      <span style={styles.marge}>
                        +{(t.prix_vente - t.cout).toLocaleString('fr-FR')} Ar
                      </span>
                    ) : '—'}
                  </td>
                  <td style={styles.td}>
                    <small>
                      {new Date(t.periode_debut).toLocaleDateString('fr-FR')}<br />
                      → {new Date(t.periode_fin).toLocaleDateString('fr-FR')}
                    </small>
                  </td>
                  <td style={styles.td}>
                    {t.derniere_verification ? (
                      <small>{new Date(t.derniere_verification).toLocaleDateString('fr-FR')}</small>
                    ) : (
                      <span style={styles.nonVerifie}>Jamais</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {estAdmin ? (
                      <>
                        <button
                          onClick={() => verifier(t)}
                          style={styles.btnIcone}
                          title="Marquer vérifié"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => ouvrirModalEdition(t)}
                          style={styles.btnIcone}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => supprimer(t)}
                          style={styles.btnIcone}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
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

      {/* Modal */}
      {modalOuvert && estAdmin && (
        <ModalTarif
          tarif={tarifEnEdition}
          activites={activites}
          onSave={sauvegarder}
          onClose={fermerModal}
        />
      )}
    </div>
  );
}

function formatUnite(unite, tarif) {
  const labels = {
    'par_adulte': 'Par adulte',
    'par_enfant': `Par enfant${tarif.tranche_age_min ? ` (${tarif.tranche_age_min}-${tarif.tranche_age_max} ans)` : ''}`,
    'par_groupe': 'Par groupe',
    'par_vehicule': 'Par véhicule'
  };
  return labels[unite] || unite;
}

function ModalTarif({ tarif, activites, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

  const [form, setForm] = useState({
    activite_id: tarif?.activite_id || (activites[0]?.id || ''),
    unite: tarif?.unite || 'par_adulte',
    tranche_age_min: tarif?.tranche_age_min || '',
    tranche_age_max: tarif?.tranche_age_max || '',
    prix_vente: tarif?.prix_vente || '',
    cout: tarif?.cout || '',
    periode_debut: tarif?.periode_debut?.split('T')[0] || today,
    periode_fin: tarif?.periode_fin?.split('T')[0] || nextYear,
    statut: tarif?.statut || 'confirme'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      prix_vente: parseInt(form.prix_vente),
      cout: form.cout ? parseInt(form.cout) : null,
      tranche_age_min: form.tranche_age_min ? parseInt(form.tranche_age_min) : null,
      tranche_age_max: form.tranche_age_max ? parseInt(form.tranche_age_max) : null
    });
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>{tarif ? 'Modifier' : 'Nouveau'} tarif</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Activité *</label>
              <select
                name="activite_id"
                value={form.activite_id}
                onChange={handleChange}
                required
                style={styles.input}
              >
                {activites.map(a => (
                  <option key={a.id} value={a.id}>{a.nom}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Unité *</label>
              <select
                name="unite"
                value={form.unite}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="par_adulte">Par adulte</option>
                <option value="par_enfant">Par enfant</option>
                <option value="par_groupe">Par groupe</option>
                <option value="par_vehicule">Par véhicule</option>
              </select>
            </div>

            {form.unite === 'par_enfant' && (
              <>
                <div style={styles.field}>
                  <label style={styles.label}>Âge min</label>
                  <input
                    type="number"
                    name="tranche_age_min"
                    value={form.tranche_age_min}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Âge max</label>
                  <input
                    type="number"
                    name="tranche_age_max"
                    value={form.tranche_age_max}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Prix de vente (Ar) *</label>
              <input
                type="number"
                name="prix_vente"
                value={form.prix_vente}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Coût prestataire (Ar)</label>
              <input
                type="number"
                name="cout"
                value={form.cout}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Période début *</label>
              <input
                type="date"
                name="periode_debut"
                value={form.periode_debut}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Période fin *</label>
              <input
                type="date"
                name="periode_fin"
                value={form.periode_fin}
                onChange={handleChange}
                required
                style={styles.input}
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
                <option value="confirme">Confirmé</option>
                <option value="a_confirmer">À confirmer</option>
              </select>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>
              Annuler
            </button>
            <button type="submit" style={styles.btnPrimaire}>
              {tarif ? 'Enregistrer' : 'Créer'}
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexWrap: 'wrap',
    gap: '12px'
  },
  titre: { fontSize: '20px', color: '#2C3E50' },
  sousTitre: { fontSize: '13px', color: '#7f8c8d', marginTop: '4px' },
  actionsDroite: { display: 'flex', gap: '12px', alignItems: 'center' },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
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
  unite: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: '#ECF0F1',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  marge: { color: '#27AE60', fontWeight: '600' },
  nonVerifie: { color: '#E67E22', fontSize: '12px', fontWeight: '600' },
  lectureSeule: {
    fontSize: '12px',
    color: '#95A5A6',
    fontStyle: 'italic'
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
    gap: '16px'
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
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #ecf0f1',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px'
  }
};