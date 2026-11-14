// src/pages/Trajets.jsx
import { useEffect, useState, useMemo } from 'react';
import { trajetsService } from '../services/trajets';
import { lieuxService } from '../services/lieux';
import { useAuth } from '../context/AuthContext';

export default function Trajets() {
  const [trajets, setTrajets] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);
  const { user } = useAuth();
  const estAdmin = user?.role === 'administrateur';
  const [rechercheDepart, setRechercheDepart] = useState('');
  const [rechercheArrivee, setRechercheArrivee] = useState('');
  const [filtreDuree, setFiltreDuree] = useState('');
  const [filtreType, setFiltreType] = useState('');

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      setLoading(true);
      const [trs, lxs] = await Promise.all([
        trajetsService.getAll(),
        lieuxService.getAll()
      ]);
      setTrajets(trs);
      setLieux(lxs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //  LOGIQUE DE FILTRAGE
  const trajetsFiltres = useMemo(() => {
    const termeDepart = rechercheDepart.trim().toLowerCase();
    const termeArrivee = rechercheArrivee.trim().toLowerCase();

    return trajets.filter((t) => {
      // 1. Recherche par lieu de départ
      const matchDepart = termeDepart === '' || (t.lieu_depart_nom || '').toLowerCase().includes(termeDepart);

      // 2. Recherche par lieu d'arrivée
      const matchArrivee = termeArrivee === '' || (t.lieu_arrivee_nom || '').toLowerCase().includes(termeArrivee);

      // 3. Filtre par durée
      let matchDuree = true;
      if (filtreDuree === 'court') matchDuree = t.duree_min < 60;
      else if (filtreDuree === 'moyen') matchDuree = t.duree_min >= 60 && t.duree_min <= 180;
      else if (filtreDuree === 'long') matchDuree = t.duree_min > 180;

      // 4. Filtre par type de véhicule
      const matchType = filtreType === '' || (t.type_vehicule || '').toLowerCase().includes(filtreType.toLowerCase());

      return matchDepart && matchArrivee && matchDuree && matchType;
    });
  }, [trajets, rechercheDepart, rechercheArrivee, filtreDuree, filtreType]);

  const reinitialiserFiltres = () => {
    setRechercheDepart('');
    setRechercheArrivee('');
    setFiltreDuree('');
    setFiltreType('');
  };

  const sauvegarder = async (form) => {
    try {
      if (enEdition) {
        await trajetsService.update(enEdition.id, form);
      } else {
        await trajetsService.create(form);
      }
      await charger();
      setModalOuvert(false);
      setEnEdition(null);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const supprimer = async (trajet) => {
    if (!confirm(`Supprimer le trajet ${trajet.lieu_depart_nom} → ${trajet.lieu_arrivee_nom} ?`)) return;
    try {
      await trajetsService.delete(trajet.id);
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
            Trajets ({trajetsFiltres.length}
            {trajetsFiltres.length !== trajets.length && ` / ${trajets.length}`})
          </h2>
          <p style={styles.sousTitre}>
            {estAdmin ? 'Durées de trajet entre les lieux' : 'Consultation des trajets (lecture seule)'}
          </p>
        </div>
        {estAdmin && (
          <button
            onClick={() => { setEnEdition(null); setModalOuvert(true); }}
            style={styles.btnPrimaire}
          >
            ➕ Nouveau trajet
          </button>
        )}
      </div>

      {/*  BARRE DE RECHERCHE ET FILTRES */}
      <div style={styles.barreFiltres}>
        <input
          type="text"
          placeholder="📍 Départ..."
          value={rechercheDepart}
          onChange={(e) => setRechercheDepart(e.target.value)}
          style={styles.recherche}
        />
        <input
          type="text"
          placeholder="🎯 Arrivée..."
          value={rechercheArrivee}
          onChange={(e) => setRechercheArrivee(e.target.value)}
          style={styles.recherche}
        />

        <select value={filtreDuree} onChange={(e) => setFiltreDuree(e.target.value)} style={styles.select}>
          <option value="">Toutes les durées</option>
          <option value="court">Moins d'1 heure</option>
          <option value="moyen">1h à 3h</option>
          <option value="long">Plus de 3h</option>
        </select>

        <input
          type="text"
          placeholder="Type véhicule (ex: 4x4)"
          value={filtreType}
          onChange={(e) => setFiltreType(e.target.value)}
          style={styles.inputType}
        />

        {(rechercheDepart || rechercheArrivee || filtreDuree || filtreType) && (
          <button onClick={reinitialiserFiltres} style={styles.btnReset}>
            Réinitialiser
          </button>
        )}
      </div>

      <div style={styles.tableContainer}>
        {trajetsFiltres.length === 0 ? (
          <div style={styles.aucune}>
            {trajets.length === 0 ? 'Aucun trajet' : 'Aucun trajet ne correspond à votre recherche'}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Départ</th>
                <th style={styles.th}>Arrivée</th>
                <th style={styles.th}>Durée</th>
                <th style={styles.th}>Type véhicule</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trajetsFiltres.map((t) => (
                <tr key={t.id} style={styles.tr}>
                  <td style={styles.td}><strong>📍 {t.lieu_depart_nom}</strong></td>
                  <td style={styles.td}><strong>🎯 {t.lieu_arrivee_nom}</strong></td>
                  <td style={styles.td}>
                    <span style={styles.dureeBadge}>{formatDuree(t.duree_min)}</span>
                  </td>
                  <td style={styles.td}><small>{t.type_vehicule || '—'}</small></td>
                  <td style={styles.td}>
                    {estAdmin ? (
                      <>
                        <button onClick={() => { setEnEdition(t); setModalOuvert(true); }} style={styles.btnIcone} title="Modifier">✏️</button>
                        <button onClick={() => supprimer(t)} style={styles.btnIcone} title="Supprimer">🗑️</button>
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
        <ModalTrajet
          trajet={enEdition}
          lieux={lieux}
          onSave={sauvegarder}
          onClose={() => { setModalOuvert(false); setEnEdition(null); }}
        />
      )}
    </div>
  );
}

function formatDuree(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function ModalTrajet({ trajet, lieux, onSave, onClose }) {
  const [form, setForm] = useState({
    lieu_depart_id: trajet?.lieu_depart_id || (lieux[0]?.id || ''),
    lieu_arrivee_id: trajet?.lieu_arrivee_id || (lieux[1]?.id || ''),
    duree_min: trajet?.duree_min || 60,
    type_vehicule: trajet?.type_vehicule || '4x4'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      duree_min: parseInt(form.duree_min)
    });
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>{trajet ? 'Modifier' : 'Nouveau'} trajet</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Lieu de départ *</label>
              <select name="lieu_depart_id" value={form.lieu_depart_id} onChange={handleChange} required disabled={!!trajet} style={styles.input}>
                {lieux.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Lieu d'arrivée *</label>
              <select name="lieu_arrivee_id" value={form.lieu_arrivee_id} onChange={handleChange} required disabled={!!trajet} style={styles.input}>
                {lieux.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Durée (minutes) *</label>
              <input type="number" name="duree_min" value={form.duree_min} onChange={handleChange} required style={styles.input} />
              <small style={styles.hint}>Soit {formatDuree(form.duree_min)}</small>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Type de véhicule</label>
              <input type="text" name="type_vehicule" value={form.type_vehicule} onChange={handleChange} placeholder="Ex: 4x4, bateau" style={styles.input} />
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>Annuler</button>
            <button type="submit" style={styles.btnPrimaire}>{trajet ? 'Enregistrer' : 'Créer'}</button>
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
    alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  titre: { fontSize: '20px', color: '#2C3E50' },
  sousTitre: { fontSize: '13px', color: '#7f8c8d', marginTop: '4px' },
  barreFiltres: {
    backgroundColor: 'white',
    padding: '16px 20px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  recherche: {
    flex: 1, minWidth: '180px', padding: '8px 12px',
    border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', outline: 'none'
  },
  select: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '13px', backgroundColor: 'white', cursor: 'pointer'
  },
  inputType: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '13px', outline: 'none', minWidth: '150px'
  },
  btnReset: {
    padding: '8px 16px', backgroundColor: '#ECF0F1', color: '#2C3E50',
    border: 'none', borderRadius: '4px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer'
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
  dureeBadge: {
    display: 'inline-block', padding: '3px 10px', backgroundColor: '#3498DB',
    color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
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
  hint: { fontSize: '11px', color: '#95A5A6', marginTop: '4px' },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px'
  }
};
