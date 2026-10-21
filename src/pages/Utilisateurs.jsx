// src/pages/Utilisateurs.jsx
import { useEffect, useState } from 'react';
import { utilisateursService } from '../services/utilisateurs';

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState({ identifiant: '', mot_de_passe: '', nom_complet: '', role: 'conseiller' });

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

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div>
      <div style={styles.barreActions}>
        <h2 style={styles.titre}>Utilisateurs ({utilisateurs.length})</h2>
        <button onClick={() => setModalOuvert(true)} style={styles.btnPrimaire}>➕ Nouvel utilisateur</button>
      </div>

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
            {utilisateurs.map(u => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}><strong>{u.nom_complet}</strong></td>
                <td style={styles.td}>{u.identifiant}</td>
                <td style={styles.td}><span style={styles.badge}>{u.role}</span></td>
                <td style={styles.td}>
                  <span style={{...styles.badge, backgroundColor: u.statut === 'actif' ? '#27AE60' : '#95A5A6'}}>{u.statut}</span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => toggleStatut(u)} style={styles.btnIcone} title="Changer statut">🔄</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOuvert && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{marginBottom: 20}}>Nouvel utilisateur</h3>
            <form onSubmit={sauvegarder}>
              <div style={styles.field}><label style={styles.label}>Nom complet</label><input type="text" value={form.nom_complet} onChange={e => setForm({...form, nom_complet: e.target.value})} required style={styles.input} /></div>
              <div style={styles.field}><label style={styles.label}>Identifiant</label><input type="text" value={form.identifiant} onChange={e => setForm({...form, identifiant: e.target.value})} required style={styles.input} /></div>
              <div style={styles.field}><label style={styles.label}>Mot de passe</label><input type="password" value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} required style={styles.input} /></div>
              <div style={styles.field}><label style={styles.label}>Rôle</label><select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={styles.input}><option value="conseiller">Conseiller</option><option value="administrateur">Administrateur</option></select></div>
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
  loading: { padding: '40px', textAlign: 'center' },
  barreActions: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  titre: { fontSize: '20px', color: '#2C3E50' },
  btnPrimaire: { padding: '10px 20px', backgroundColor: '#C0392B', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecondaire: { padding: '10px 20px', backgroundColor: '#ECF0F1', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  tableContainer: { backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8f9fa' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', color: '#7f8c8d' },
  tr: { borderBottom: '1px solid #ecf0f1' },
  td: { padding: '12px', fontSize: '13px' },
  badge: { padding: '3px 8px', borderRadius: '12px', color: 'white', backgroundColor: '#3498DB', fontSize: '11px', fontWeight: 'bold' },
  btnIcone: { border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px' },
  field: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }
};