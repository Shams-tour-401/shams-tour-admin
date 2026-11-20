// src/pages/Demandes.jsx
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { demandesService } from '../services/demandes';

export default function Demandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [hoverVoir, setHoverVoir] = useState(null);

  // Filtres
  const [filtreStatut, setFiltreStatut] = useState('');
  const [recherche, setRecherche] = useState('');
  const [filtreDate, setFiltreDate] = useState(''); 

  useEffect(() => {
    chargerDemandes();
  }, []);

  const chargerDemandes = async () => {
    try {
      setLoading(true);
      const data = await demandesService.getAll();
      setDemandes(data);
    } catch (error) {
      console.error('Erreur chargement demandes :', error);
      setErreur('Impossible de charger les demandes');
    } finally {
      setLoading(false);
    }
  };

  //  FILTRAGE INSTANTANÉ AVEC useMemo
  const demandesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return demandes.filter((d) => {
      // 1. Filtre par statut
      const matchStatut = filtreStatut === '' || d.statut === filtreStatut;

      // 2. Recherche par référence, nom ou téléphone
      const matchRecherche = 
        terme === '' ||
        (d.reference || '').toLowerCase().includes(terme) ||
        (d.nom_client || '').toLowerCase().includes(terme) ||
        (d.telephone || '').includes(terme);

      // 3. Filtre par date de création ("Reçue le")
      let matchDate = true;
      if (filtreDate) {
        // On compare la date de création (YYYY-MM-DD) avec la date choisie
        const dateCreation = new Date(d.date_creation).toISOString().split('T')[0];
        matchDate = dateCreation === filtreDate;
      }

      return matchStatut && matchRecherche && matchDate;
    });
  }, [demandes, filtreStatut, recherche, filtreDate]);

  const reinitialiserFiltres = () => {
    setFiltreStatut('');
    setRecherche('');
    setFiltreDate('');
  };

  if (loading) {
    return <div style={styles.loading}>Chargement des demandes...</div>;
  }

  if (erreur) {
    return <div style={styles.erreur}>{erreur}</div>;
  }

  return (
    <div>
      {/* Barre de filtres */}
      <div style={styles.filtresBar}>
        <div style={styles.filtresGroupe}>
          <input
            type="text"
            placeholder="🔍 Rechercher (référence, nom, téléphone)"
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
            <option value="demande_recue">Demande reçue</option>
            <option value="a_contacter">À contacter</option>
            <option value="disponibilites_a_verifier">Dispo. à vérifier</option>
            <option value="proposition_a_valider">Prop. à valider</option>
            <option value="confirmee">Confirmée</option>
            <option value="annulee">Annulée</option>
          </select>

          {/*  CHAMP DATE */}
          <input
            type="date"
            value={filtreDate}
            onChange={(e) => setFiltreDate(e.target.value)}
            style={styles.dateInput}
            title="Filtrer par date de réception"
          />

{(recherche || filtreStatut || filtreDate) && (
  <button 
    onClick={reinitialiserFiltres} 
    style={styles.btnResetIcone}
    title="Réinitialiser les filtres"
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" height="16" 
      fill="currentColor" 
      viewBox="0 0 16 16"
    >
      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
      <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
    </svg>
  </button>
)}
          
        </div>

        <div style={styles.compteur}>
          {demandesFiltrees.length} / {demandes.length} demande(s)
        </div>
      </div>

      {/* Tableau */}
      <div style={styles.tableContainer}>
        {demandesFiltrees.length === 0 ? (
          <div style={styles.aucune}>
            {demandes.length === 0 
              ? '📭 Aucune demande pour le moment'
              : '🔍 Aucune demande ne correspond à vos filtres'}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Référence</th>
                <th style={styles.th}>Client</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Destination</th>
                <th style={styles.th}>Dates</th>
                <th style={styles.th}>Voyageurs</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Reçue le</th>
                <th style={styles.th}>Actions</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {demandesFiltrees.map((d) => (
                <tr key={d.id} style={styles.tr}>
                  <td style={styles.td}>
                    <Link to={`/demandes/${d.id}`} style={styles.refLink}>
                      {d.reference}
                    </Link>
                    {d.a_doublon && (
                      <span style={styles.doublonBadge} title="Doublon possible détecté">
                        ⚠️ Doublon
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>{d.nom_client}</td>
                  <td style={styles.td}>{d.telephone}</td>
                  <td style={styles.td}>{d.destination_nom}</td>
                  <td style={styles.td}>
                    {new Date(d.date_depart).toLocaleDateString('fr-FR')}
                    <br />
                    <small style={styles.small}>
                      {d.nombre_jours} jour{d.nombre_jours > 1 ? 's' : ''}
                    </small>
                  </td>
                  <td style={styles.td}>
                    {d.adultes} ad.{d.enfants > 0 ? ` + ${d.enfants} enf.` : ''}
                  </td>
                  <td style={styles.td}>
                    <StatutBadge statut={d.statut} />
                  </td>
                  <td style={styles.td}>
                    {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                    <br />
                    <small style={styles.small}>
                      {new Date(d.date_creation).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </td>
                                    <td style={styles.td}>
                    <Link 
                      to={`/demandes/${d.id}`} 
                      style={{
                        ...styles.btnVoirIcone,
                        ...(hoverVoir === d.id ? styles.btnVoirIconeHover : {})
                      }}
                      onMouseEnter={() => setHoverVoir(d.id)}
                      onMouseLeave={() => setHoverVoir(null)}
                      title="Voir le détail"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatutBadge({ statut }) {
  const config = {
    'demande_recue': { label: 'Demande reçue', bg: '#3498DB' },
    'a_contacter': { label: 'À contacter', bg: '#E67E22' },
    'disponibilites_a_verifier': { label: 'Dispo. à vérifier', bg: '#F39C12' },
    'proposition_a_valider': { label: 'Prop. à valider', bg: '#9B59B6' },
    'confirmee': { label: 'Confirmée', bg: '#27AE60' },
    'annulee': { label: 'Annulée', bg: '#95A5A6' }
  };

  const c = config[statut] || { label: statut, bg: '#95A5A6' };

  return (
    <span style={{ ...styles.badge, backgroundColor: c.bg }}>
      {c.label}
    </span>
  );
}
const styles = {
  loading: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },
  erreur: {
    padding: '20px',
    backgroundColor: '#FADBD8',
    color: '#C0392B',
    borderRadius: '8px',
    textAlign: 'center'
  },
  filtresBar: {
    backgroundColor: 'var(--bg-bloc)',
    padding: '16px 20px',
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px var(--shadow)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',

  },
  filtresGroupe: {
    display: 'flex',
    gap: '12px',
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  recherche: {
    flex: 1,
    minWidth: '200px',
    padding: '8px 12px',
    border: '1px solid #0000FF',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor:  'var(--bg-surface)',
    color: 'var(--text-primary)'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #FFA500',
    borderRadius: '14px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #00FF00',
    borderRadius: '14px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  btnResetIcone: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    padding: 0,
    backgroundColor: 'transparent',
    color: '#C0392B',                    // Couleur rouge
    border: '2px solid #C0392B',         // Bordure rouge de 2px (effet "gras")
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    fontWeight: 'bold',                  // "Gras" (bien que sans texte, ça force le rendu du SVG si besoin)
  },
  compteur: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  tableContainer: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px var(--shadow)'
  },
  aucune: {
    padding: '60px 20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '16px'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--bg-soft)' },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase',
    borderBottom: '2px solid var(--border)'
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.15s'
  },
  td: { padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' },
  small: { fontSize: '11px', color: 'var(--text-muted)' },
  refLink: { color: '#C0392B', fontWeight: '600', fontSize: '13px' },
  btnVoirIcone: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  },
  btnVoirIconeHover: {
    borderColor: '#16a34a',
    color: '#16a34a',
    backgroundColor: 'rgba(22, 163, 74, 0.1)'
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  doublonBadge: {
    display: 'inline-block',
    marginLeft: '8px',
    padding: '2px 8px',
    backgroundColor: '#F39C12',
    color: 'white',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: '600',
    cursor: 'help'
  }
};
