// src/pages/Tarifs.jsx
import { useEffect, useState, useMemo } from 'react'; 
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
  const { user } = useAuth();
  const estAdmin = user?.role === 'administrateur';

  //  LA RECHERCHE ET LES FILTRES
  const [recherche, setRecherche] = useState('');
  const [filtreUnite, setFiltreUnite] = useState('');
  const [filtrePrix, setFiltrePrix] = useState('');
  const [filtreCout, setFiltreCout] = useState('');
  const [filtreMarge, setFiltreMarge] = useState('');
  const [filtrePeriode, setFiltrePeriode] = useState('');
  const [filtreVerifie, setFiltreVerifie] = useState('');

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

  //  LOGIQUE DE FILTRAGE INSTANTANÉ
  const tarifsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    const maintenant = new Date();

    return tarifs.filter((t) => {
      // 1. Recherche par nom d'activité
      const matchRecherche = terme === '' || (t.activite_nom || '').toLowerCase().includes(terme);

      // 2. Filtre par unité
      const matchUnite = filtreUnite === '' || t.unite === filtreUnite;

      // 3. Filtre par prix de vente
      let matchPrix = true;
      if (filtrePrix === 'bas') matchPrix = t.prix_vente < 50000;
      else if (filtrePrix === 'moyen') matchPrix = t.prix_vente >= 50000 && t.prix_vente <= 200000;
      else if (filtrePrix === 'eleve') matchPrix = t.prix_vente > 200000;

      // 4. Filtre par coût
      let matchCout = true;
      if (filtreCout === 'bas') matchCout = t.cout && t.cout < 30000;
      else if (filtreCout === 'moyen') matchCout = t.cout && t.cout >= 30000 && t.cout <= 100000;
      else if (filtreCout === 'eleve') matchCout = t.cout && t.cout > 100000;
      else if (filtreCout === 'inconnu') matchCout = !t.cout;

      // 5. Filtre par marge
      let matchMarge = true;
      const marge = t.cout ? t.prix_vente - t.cout : null;
      if (filtreMarge === 'faible') matchMarge = marge !== null && marge < 10000;
      else if (filtreMarge === 'moyenne') matchMarge = marge !== null && marge >= 10000 && marge <= 50000;
      else if (filtreMarge === 'elevee') matchMarge = marge !== null && marge > 50000;
      else if (filtreMarge === 'inconnue') matchMarge = marge === null;

      // 6. Filtre par période (actif / expiré)
      let matchPeriode = true;
      if (filtrePeriode === 'actif') {
        matchPeriode = new Date(t.periode_fin) >= maintenant;
      } else if (filtrePeriode === 'expire') {
        matchPeriode = new Date(t.periode_fin) < maintenant;
      }

      // 7. Filtre par date de vérification
      let matchVerifie = true;
      if (filtreVerifie === 'recent') {
        matchVerifie = t.derniere_verification && 
          (maintenant - new Date(t.derniere_verification)) / (1000 * 60 * 60 * 24) <= 30;
      } else if (filtreVerifie === 'ancien') {
        matchVerifie = t.derniere_verification && 
          (maintenant - new Date(t.derniere_verification)) / (1000 * 60 * 60 * 24) > 30;
      } else if (filtreVerifie === 'jamais') {
        matchVerifie = !t.derniere_verification;
      }

      return matchRecherche && matchUnite && matchPrix && matchCout && matchMarge && matchPeriode && matchVerifie;
    });
  }, [tarifs, recherche, filtreUnite, filtrePrix, filtreCout, filtreMarge, filtrePeriode, filtreVerifie]);

  const reinitialiserFiltres = () => {
    setRecherche('');
    setFiltreUnite('');
    setFiltrePrix('');
    setFiltreCout('');
    setFiltreMarge('');
    setFiltrePeriode('');
    setFiltreVerifie('');
  };

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
          <h2 style={styles.titre}>
            Tarifs ({tarifsFiltres.length}
            {tarifsFiltres.length !== tarifs.length && ` / ${tarifs.length}`})
          </h2>
          <p style={styles.sousTitre}>
            {estAdmin ? 'Gestion des tarifs par activité' : 'Consultation des tarifs (lecture seule)'}
          </p>
        </div>
        {estAdmin && (
          <button onClick={ouvrirModalCreation} style={styles.btnPrimaire}>
            ➕ Nouveau tarif
          </button>
        )}
      </div>

      {/*  BARRE DE RECHERCHE ET FILTRES */}
      <div style={styles.barreFiltres}>
        <input
          type="text"
          placeholder="🔍 Rechercher par nom d'activité..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={styles.recherche}
        />

        <select value={filtreUnite} onChange={(e) => setFiltreUnite(e.target.value)} style={styles.select}>
          <option value="">Toutes les unités</option>
          <option value="par_adulte">Par adulte</option>
          <option value="par_enfant">Par enfant</option>
          <option value="par_groupe">Par groupe</option>
          <option value="par_vehicule">Par véhicule</option>
        </select>

        <select value={filtrePrix} onChange={(e) => setFiltrePrix(e.target.value)} style={styles.select}>
          <option value="">Tous les prix</option>
          <option value="bas">Prix bas (&lt; 50 000 Ar)</option>
          <option value="moyen">Prix moyen (50k - 200k)</option>
          <option value="eleve">Prix élevé (&gt; 200 000 Ar)</option>
        </select>

        <select value={filtreCout} onChange={(e) => setFiltreCout(e.target.value)} style={styles.select}>
          <option value="">Tous les coûts</option>
          <option value="bas">Coût bas (&lt; 30 000 Ar)</option>
          <option value="moyen">Coût moyen (30k - 100k)</option>
          <option value="eleve">Coût élevé (&gt; 100 000 Ar)</option>
          <option value="inconnu">Coût non renseigné</option>
        </select>

        <select value={filtreMarge} onChange={(e) => setFiltreMarge(e.target.value)} style={styles.select}>
          <option value="">Toutes les marges</option>
          <option value="faible">Marge faible (&lt; 10 000 Ar)</option>
          <option value="moyenne">Marge moyenne (10k - 50k)</option>
          <option value="elevee">Marge élevée (&gt; 50 000 Ar)</option>
          <option value="inconnue">Marge inconnue</option>
        </select>

        <select value={filtrePeriode} onChange={(e) => setFiltrePeriode(e.target.value)} style={styles.select}>
          <option value="">Toutes les périodes</option>
          <option value="actif">Période active</option>
          <option value="expire">Période expirée</option>
        </select>

        <select value={filtreVerifie} onChange={(e) => setFiltreVerifie(e.target.value)} style={styles.select}>
          <option value="">Toutes les vérifications</option>
          <option value="recent">Vérifié récemment (&lt; 30j)</option>
          <option value="ancien">Vérifié il y a &gt; 30j</option>
          <option value="jamais">Jamais vérifié</option>
        </select>

        {(recherche || filtreUnite || filtrePrix || filtreCout || filtreMarge || filtrePeriode || filtreVerifie) && (
          <button onClick={reinitialiserFiltres} style={styles.btnReset}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau */}
      <div style={styles.tableContainer}>
        {tarifsFiltres.length === 0 ? (
          <div style={styles.aucune}>
            {tarifs.length === 0 ? 'Aucun tarif' : 'Aucun tarif ne correspond à votre recherche'}
          </div>
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
  loading: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },
  erreur: { padding: '20px', backgroundColor: '#FADBD8', color: '#C0392B', borderRadius: '8px', textAlign: 'center' },
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
  unite: {
    display: 'inline-block', padding: '3px 10px', backgroundColor: 'var(--bg-soft)',
    borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)'
  },
  marge: { color: '#27AE60', fontWeight: '600' },
  nonVerifie: { color: '#E67E22', fontSize: '12px', fontWeight: '600' },
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
    maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'
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
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' },
  input: {
    padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px',
    fontSize: '14px', outline: 'none', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)'
  },
  modalFooter: {
    padding: '16px 24px', borderTop: '1px solid var(--border)',
    display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px'
  }
};
