// src/pages/Utilisateurs.jsx
import { useEffect, useState, useMemo } from 'react';
import { utilisateursService } from '../services/utilisateurs';

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState({ identifiant: '', mot_de_passe: '', nom_complet: '', role: 'conseiller' });

  // 🆕 États pour la recherche et le filtre
  const [recherche, setRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState('tous');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await utilisateursService.getAll();
      setUtilisateurs(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    try {
      await utilisateursService.create(form);
      await charger();
      setModalOuvert(false);
      setForm({ identifiant: '', mot_de_passe: '', nom_complet: '', role: 'conseiller' });
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleStatut = async (user) => {
    const nouveauStatut = user.statut === 'actif' ? 'inactif' : 'actif';
    if (!confirm(`Passer ${user.nom_complet} en ${nouveauStatut} ?`)) return;
    try {
      await utilisateursService.changerStatut(user.id, nouveauStatut);
      await charger();
    } catch (error) { alert('Erreur'); }
  };

  // 🆕 Filtrage instantané (en mémoire, aucun rechargement)
  const utilisateursFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return utilisateurs.filter((u) => {
      // Filtre par rôle
      const matchRole = filtreRole === 'tous' || u.role === filtreRole;

      // Recherche par nom complet OU identifiant (insensible à la casse)
      const matchRecherche =
        terme === '' ||
        (u.nom_complet || '').toLowerCase().includes(terme) ||
        (u.identifiant || '').toLowerCase().includes(terme);

      return matchRole && matchRecherche;
    });
  }, [utilisateurs, recherche, filtreRole]);

  // 🆕 Couleur du badge selon le rôle
  const couleurBadge = (role) => {
    switch (role) {
      case 'administrateur': return '#C0392B'; // rouge
      case 'conseiller':     return '#2980B9'; // bleu
      case 'client':         return '#27AE60'; // vert
      default:               return '#7F8C8D'; // gris
    }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div>
      {/* Barre d'actions : titre + bouton */}
      <div style={styles.barreActions}>
        <h2 style={styles.titre}>
          Utilisateurs ({utilisateursFiltres.length}
          {utilisateursFiltres.length !== utilisateurs.length && ` / ${utilisateurs.length}`})
        </h2>
        <button onClick={() => setModalOuvert(true)} style={styles.btnPrimaire}>
          ➕ Nouvel utilisateur
        </button>
      </div>

      {/* 🆕 Barre de recherche + filtre rôle */}
      <div style={styles.barreFiltres}>
        <div style={styles.rechercheWrapper}>
          <span style={styles.iconeRecherche}>🔍</span>
          <input
            type="text"
            placeholder="Rechercher par nom ou identifiant..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={styles.inputRecherche}
          />
          {recherche && (
            <button
              type="button"
              onClick={() => setRecherche('')}
              style={styles.btnEffacer}
              title="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={filtreRole}
          onChange={(e) => setFiltreRole(e.target.value)}
          style={styles.selectFiltre}
        >
          <option value="tous">Tous les rôles</option>
          <option value="administrateur">Administrateur</option>
          <option value="conseiller">Conseiller</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* Tableau */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Identifiant</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateursFiltres.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.aucunResultat}>
                  Aucun utilisateur ne correspond à votre recherche.
                </td>
              </tr>
            ) : (
              utilisateursFiltres.map(u => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}><strong>{u.nom_complet}</strong></td>
                  <td style={styles.td}>{u.identifiant}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: couleurBadge(u.role) }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, backgroundColor: u.statut === 'actif' ? '#27AE60' : '#95A5A6'}}>
                      {u.statut}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => toggleStatut(u)} style={styles.btnIcone} title="Changer statut">🔄</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de création */}
      {modalOuvert && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{marginBottom: 20}}>Nouvel utilisateur</h3>
            <form onSubmit={sauvegarder}>
              <div style={styles.field}>
                <label style={styles.label}>Nom complet</label>
                <input type="text" value={form.nom_complet} onChange={e => setForm({...form, nom_complet: e.target.value})} required style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Identifiant</label>
                <input type="text" value={form.identifiant} onChange={e => setForm({...form, identifiant: e.target.value})} required style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Mot de passe</label>
                <input type="password" value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} required style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Rôle</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={styles.input}>
                  <option value="client">Client</option>
                  <option value="conseiller">Conseiller</option>
                  <option value="administrateur">Administrateur</option>
                </select>
              </div>
              <div style={{display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end'}}>
                <button type="button" onClick={() => setModalOuvert(false)} style={styles.btnSecondaire}>Annuler</button>
                <button type="submit" style={styles.btnPrimaire}>Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },
  barreActions: {
    backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: '8px',
    marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 4px var(--shadow)'
  },
  titre: { fontSize: '20px', color: 'var(--text-primary)' },
  barreFiltres: {
    backgroundColor: 'var(--bg-surface)', padding: '16px 20px', borderRadius: '8px',
    marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center',
    flexWrap: 'wrap', boxShadow: '0 2px 4px var(--shadow)'
  },
  rechercheWrapper: {
    flex: 1, minWidth: '250px', position: 'relative', display: 'flex', alignItems: 'center'
  },
  iconeRecherche: {
    position: 'absolute', left: '12px', fontSize: '14px', color: 'var(--text-muted)', pointerEvents: 'none'
  },
  inputRecherche: {
    width: '100%', padding: '10px 36px 10px 36px',
    border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', outline: 'none',
    backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)'
  },
  btnEffacer: {
    position: 'absolute', right: '8px', background: 'transparent', border: 'none',
    cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)', padding: '4px'
  },
  selectFiltre: {
    padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '4px',
    fontSize: '13px', cursor: 'pointer', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)',
    minWidth: '180px'
  },
  aucunResultat: {
    textAlign: 'center', padding: '40px', color: 'var(--text-muted)',
    fontSize: '13px', fontStyle: 'italic'
  },
  btnPrimaire: {
    padding: '10px 20px', backgroundColor: '#C0392B', color: 'white',
    border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
  },
  btnSecondaire: {
    padding: '10px 20px', backgroundColor: 'var(--bg-soft)', color: 'var(--text-primary)',
    border: '1px solid var(--border)', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
  },
  tableContainer: {
    backgroundColor: 'var(--bg-surface)', borderRadius: '8px', overflow: 'hidden',
    boxShadow: '0 2px 4px var(--shadow)'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--bg-soft)' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' },
  badge: { padding: '3px 8px', borderRadius: '12px', color: 'white', backgroundColor: '#3498DB', fontSize: '11px', fontWeight: 'bold' },
  btnIcone: {
    border: '1px solid var(--border)', padding: '5px 10px', borderRadius: '4px',
    cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--text-primary)'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  modal: {
    backgroundColor: 'var(--bg-surface)', padding: '30px', borderRadius: '8px', width: '400px',
    border: '1px solid var(--border)'
  },
  field: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: 'var(--text-primary)' },
  input: {
    padding: '10px', border: '1px solid var(--border)', borderRadius: '4px',
    backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)'
  }
};
