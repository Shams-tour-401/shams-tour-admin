// src/pages/Prestataires.jsx
import { useEffect, useState, useMemo } from 'react'; 
import { prestatairesService } from '../services/prestataires';
import { useAuth } from '../context/AuthContext';

export default function Prestataires() {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const { user } = useAuth();
  const estAdmin = user?.role === 'administrateur';

  //  ÉTATS POUR LA RECHERCHE ET LE FILTRE
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

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

  //  LOGIQUE DE FILTRAGE INSTANTANÉ
  const prestatairesFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return prestataires.filter((p) => {
      // 1. Recherche par nom ou téléphone
      const matchRecherche = 
        terme === '' || 
        (p.nom || '').toLowerCase().includes(terme) || 
        (p.telephones || '').toLowerCase().includes(terme);

      // 2. Filtre par statut
      const matchStatut = filtreStatut === '' || p.statut === filtreStatut;

      return matchRecherche && matchStatut;
    });
  }, [prestataires, recherche, filtreStatut]);

  const reinitialiserFiltres = () => {
    setRecherche('');
    setFiltreStatut('');
  };

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
          <h2 style={styles.titre}>
            Prestataires ({prestatairesFiltres.length}
            {prestatairesFiltres.length !== prestataires.length && ` / ${prestataires.length}`})
          </h2>
          <p style={styles.sousTitre}>
            {estAdmin ? 'Guides, transporteurs et fournisseurs de services' : 'Consultation des prestataires (lecture seule)'}
          </p>
        </div>
        {estAdmin && (
          <button
            onClick={() => { setEnEdition(null); setModalOuvert(true); }}
            style={styles.btnPrimaire}
          >
            ➕ Nouveau prestataire
          </button>
        )}
      </div>

      {/*  BARRE DE RECHERCHE ET FILTRE */}
      <div style={styles.barreFiltres}>
        <input
          type="text"
          placeholder="🔍 Rechercher par nom ou téléphone..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={styles.recherche}
        />

        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          style={styles.select}
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>

        {(recherche || filtreStatut) && (
          <button onClick={reinitialiserFiltres} style={styles.btnReset}>
            Réinitialiser
          </button>
        )}
      </div>

      <div style={styles.tableContainer}>
        {prestatairesFiltres.length === 0 ? (
          <div style={styles.aucune}>
            {prestataires.length === 0 ? 'Aucun prestataire' : 'Aucun prestataire ne correspond à votre recherche'}
          </div>
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
  loading: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },
  barreActions: {
    backgroundColor: 'var(--bg-surface)', padding: '20px 24px', borderRadius: '8px',
    marginBottom: '16px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: '0 2px 4px var(--shadow)', flexWrap: 'wrap', gap: '12px'
  },
  titre: { fontSize: '20px', color: 'var(--text-primary)' },
  sousTitre: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' },
  barreFiltres: {
    backgroundColor: 'var(--bg-surface)', padding: '16px 20px', borderRadius: '8px',
    marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center',
    flexWrap: 'wrap', boxShadow: '0 2px 4px var(--shadow)'
  },
  recherche: {
    flex: 1, minWidth: '250px', padding: '8px 12px',
    border: '1px solid var(--border)', borderRadius: '4px', fontSize: '14px', outline: 'none',
    backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)'
  },
  select: {
    padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px',
    fontSize: '13px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer'
  },
  btnReset: {
    padding: '8px 16px', backgroundColor: 'var(--bg-soft)', color: 'var(--text-primary)',
    border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  },
  actionsDroite: { display: 'flex', gap: '12px', alignItems: 'center' },
  btnPrimaire: {
    padding: '10px 20px', backgroundColor: '#C0392B', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  btnSecondaire: {
    padding: '10px 20px', backgroundColor: 'var(--bg-soft)', color: 'var(--text-primary)',
    border: '1px solid var(--border)', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  tableContainer: {
    backgroundColor: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden',
    boxShadow: '0 2px 4px var(--shadow)'
  },
  aucune: { padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--bg-soft)' },
  th: {
    padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)',
    fontWeight: '600', textTransform: 'uppercase', borderBottom: '2px solid var(--border)'
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' },
  notes: { color: 'var(--text-muted)', fontStyle: 'italic' },
  statutBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
    color: 'white', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'
  },
  lectureSeule: {
    fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic'
  },
  btnIcone: {
    padding: '6px 10px', marginRight: '4px', backgroundColor: 'transparent',
    border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: '14px',
    color: 'var(--text-primary)'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
  },
  modal: {
    backgroundColor: 'var(--bg-surface)', borderRadius: '8px', width: '100%',
    maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
  },
  modalHeader: {
    padding: '20px 24px', borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  btnFermer: {
    background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', color: 'var(--text-muted)'
  },
  form: { padding: '24px' },
  field: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' },
  input: {
    padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px',
    fontSize: '14px', outline: 'none', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)'
  },
  textarea: {
    padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical',
    backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px'
  }
};
