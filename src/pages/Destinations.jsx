// src/pages/Destinations.jsx
import { useEffect, useState, useMemo } from 'react';
import { destinationsService } from '../services/destinations';
import { useAuth } from '../context/AuthContext';

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const { user } = useAuth();
  const estAdmin = user?.role === 'administrateur';
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await destinationsService.getAll();
      setDestinations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //  LOGIQUE DE FILTRAGE
  const destinationsFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return destinations.filter((d) => {
      const matchRecherche = terme === '' || (d.nom || '').toLowerCase().includes(terme);
      const matchStatut =
        filtreStatut === '' ||
        (filtreStatut === 'active' && d.statut_actif) ||
        (filtreStatut === 'inactive' && !d.statut_actif);
      return matchRecherche && matchStatut;
    });
  }, [destinations, recherche, filtreStatut]);

  const reinitialiserFiltres = () => {
    setRecherche('');
    setFiltreStatut('');
  };

  const sauvegarder = async (form) => {
    try {
      if (enEdition) {
        await destinationsService.update(enEdition.id, form);
      } else {
        await destinationsService.create(form);
      }
      await charger();
      setModalOuvert(false);
      setEnEdition(null);
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
            Destinations ({destinationsFiltrees.length}
            {destinationsFiltrees.length !== destinations.length && ` / ${destinations.length}`})
          </h2>
          <p style={styles.sousTitre}>
            {estAdmin ? 'Destinations proposées par Shams Tour' : 'Consultation des destinations (lecture seule)'}
          </p>
        </div>
        {estAdmin && (
          <button
            onClick={() => { setEnEdition(null); setModalOuvert(true); }}
            style={styles.btnPrimaire}
          >
            ➕ Nouvelle destination
          </button>
        )}
      </div>

      {/*  BARRE DE RECHERCHE ET FILTRE */}
      <div style={styles.barreFiltres}>
        <input
          type="text"
          placeholder="🔍 Rechercher une destination..."
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
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>

        {(recherche || filtreStatut) && (
          <button onClick={reinitialiserFiltres} style={styles.btnReset}>
            Réinitialiser
          </button>
        )}
      </div>

      <div style={styles.grid}>
        {destinationsFiltrees.length === 0 ? (
          <div style={{...styles.aucune, gridColumn: '1 / -1'}}>
            Aucune destination ne correspond à votre recherche.
          </div>
        ) : (
          destinationsFiltrees.map((d) => (
            <div key={d.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitre}>📍 {d.nom}</h3>
                <span style={{
                  ...styles.statutBadge,
                  backgroundColor: d.statut_actif ? '#27AE60' : '#95A5A6'
                }}>
                  {d.statut_actif ? 'Active' : 'Inactive'}
                </span>
              </div>

              {d.texte_accueil && (
                <p style={styles.cardTexte}>{d.texte_accueil}</p>
              )}

              <div style={styles.cardStats}>
                <div style={styles.stat}>
                  <strong>{d.nb_activites || 0}</strong>
                  <span>Activités</span>
                </div>
                <div style={styles.stat}>
                  <strong>{d.nb_circuits || 0}</strong>
                  <span>Circuits publiés</span>
                </div>
              </div>

              <div style={styles.cardInfo}>
                🕐 Fenêtre : {d.fenetre_debut?.substring(0, 5)} → {d.fenetre_fin?.substring(0, 5)}
              </div>

              {estAdmin && (
                <button
                  onClick={() => { setEnEdition(d); setModalOuvert(true); }}
                  style={styles.btnModifier}
                >
                  ✏️ Modifier
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {modalOuvert && estAdmin && (
        <ModalDestination
          destination={enEdition}
          onSave={sauvegarder}
          onClose={() => { setModalOuvert(false); setEnEdition(null); }}
        />
      )}
    </div>
  );
}

function ModalDestination({ destination, onSave, onClose }) {
  const [form, setForm] = useState({
    nom: destination?.nom || '',
    statut_actif: destination?.statut_actif ?? 1,
    fenetre_debut: destination?.fenetre_debut || '08:00:00',
    fenetre_fin: destination?.fenetre_fin || '19:00:00',
    texte_accueil: destination?.texte_accueil || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>{destination ? 'Modifier' : 'Nouvelle'} destination</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nom *</label>
            <input type="text" name="nom" value={form.nom} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Fenêtre début</label>
              <input type="time" name="fenetre_debut" value={form.fenetre_debut} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Fenêtre fin</label>
              <input type="time" name="fenetre_fin" value={form.fenetre_fin} onChange={handleChange} style={styles.input} />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Texte d'accueil</label>
            <textarea name="texte_accueil" value={form.texte_accueil} onChange={handleChange} rows="3" style={styles.textarea} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>
              <input type="checkbox" name="statut_actif" checked={form.statut_actif === 1} onChange={handleChange} />
              {' '}Destination active
            </label>
          </div>
          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>Annuler</button>
            <button type="submit" style={styles.btnPrimaire}>{destination ? 'Enregistrer' : 'Créer'}</button>
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
    alignItems: 'center', boxShadow: '0 2px 4px var(--shadow)'
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
  btnPrimaire: {
    padding: '10px 20px', backgroundColor: '#C0392B', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  btnSecondaire: {
    padding: '10px 20px', backgroundColor: 'var(--bg-soft)', color: 'var(--text-primary)',
    border: '1px solid var(--border)', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px'
  },
  aucune: { padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' },
  card: {
    backgroundColor: 'var(--bg-surface)', borderRadius: '8px', padding: '20px',
    boxShadow: '0 2px 4px var(--shadow)'
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px'
  },
  cardTitre: { fontSize: '16px', color: 'var(--text-primary)' },
  statutBadge: {
    padding: '3px 10px', borderRadius: '12px', color: 'white',
    fontSize: '11px', fontWeight: '600'
  },
  cardTexte: {
    fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px',
    fontStyle: 'italic', lineHeight: '1.5'
  },
  cardStats: {
    display: 'flex', gap: '20px', padding: '12px 0',
    borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
    marginBottom: '12px'
  },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-primary)' },
  cardInfo: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' },
  btnModifier: {
    width: '100%', padding: '8px', backgroundColor: 'var(--bg-soft)',
    color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
  },
  modal: {
    backgroundColor: 'var(--bg-surface)', borderRadius: '8px', width: '100%',
    maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
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
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
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
