// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { demandesService } from '../services/demandes';
import { alertesService } from '../services/alertes';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    demande_recue: 0,
    a_contacter: 0,
    confirmee: 0
  });
  const [dernieresDemandes, setDernieresDemandes] = useState([]);
  const [alertes, setAlertes] = useState({
    total: 0,
    tarifs_anciens: [],
    circuits_a_reviser: [],
    demandes_en_retard: [],
    lignes_a_confirmer: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [demandes, alertesData] = await Promise.all([
        demandesService.getAll(),
        alertesService.getAll()
      ]);

      const nouvellesStats = {
        total: demandes.length,
        demande_recue: demandes.filter(d => d.statut === 'demande_recue').length,
        a_contacter: demandes.filter(d => d.statut === 'a_contacter').length,
        confirmee: demandes.filter(d => d.statut === 'confirmee').length
      };

      setStats(nouvellesStats);
      setDernieresDemandes(demandes.slice(0, 5));
      setAlertes(alertesData);
    } catch (error) {
      console.error('Erreur chargement :', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Chargement...</div>;
  }

  return (
    <div>
      {/* Cartes de statistiques */}
      <div style={styles.statsGrid}>
        <StatCard
          titre="Total demandes"
          valeur={stats.total}
          couleur="#2C3E50"
          icone="📋"
        />
        <StatCard
          titre="Nouvelles"
          valeur={stats.demande_recue}
          couleur="#C0392B"
          icone="🔔"
        />
        <StatCard
          titre="À contacter"
          valeur={stats.a_contacter}
          couleur="#E67E22"
          icone="📞"
        />
        <StatCard
          titre="Confirmées"
          valeur={stats.confirmee}
          couleur="#27AE60"
          icone="✅"
        />
      </div>

      {/* Alertes */}
      {alertes.total > 0 && (
        <div style={styles.alertesSection}>
          <div style={styles.alertesHeader}>
            <h2 style={styles.alertesTitre}>
              ⚠️ Alertes ({alertes.total})
            </h2>
          </div>

          <div style={styles.alertesGrid}>
            {/* Alertes : demandes en retard */}
            {alertes.demandes_en_retard.length > 0 && (
              <div style={styles.alerteCard}>
                <div style={styles.alerteHeader}>
                  <span style={styles.alerteIcone}>🔴</span>
                  <strong>Demandes en retard</strong>
                  <span style={styles.alerteCount}>
                    {alertes.demandes_en_retard.length}
                  </span>
                </div>
                <p style={styles.alerteDesc}>
                  Sans action depuis plus d'un jour ouvré
                </p>
                <ul style={styles.alerteListe}>
                  {alertes.demandes_en_retard.slice(0, 5).map((d) => (
                    <li key={d.id}>
                      <Link to={`/demandes/${d.id}`} style={styles.alerteLink}>
                        {d.reference} — {d.nom_client}
                      </Link>
                      <small> ({d.jours_depuis_creation}j)</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alertes : tarifs anciens */}
            {alertes.tarifs_anciens.length > 0 && (
              <div style={styles.alerteCard}>
                <div style={styles.alerteHeader}>
                  <span style={styles.alerteIcone}>🟠</span>
                  <strong>Tarifs à vérifier</strong>
                  <span style={styles.alerteCount}>
                    {alertes.tarifs_anciens.length}
                  </span>
                </div>
                <p style={styles.alerteDesc}>
                  Non vérifiés depuis plus de 180 jours
                </p>
                <ul style={styles.alerteListe}>
                  {alertes.tarifs_anciens.slice(0, 5).map((t) => (
                    <li key={t.id}>
                      <Link to="/tarifs" style={styles.alerteLink}>
                        {t.activite_nom || 'Prestataire'} — {t.prix_vente.toLocaleString('fr-FR')} Ar
                      </Link>
                      {t.derniere_verification ? (
                        <small> ({t.jours_depuis_verif}j)</small>
                      ) : (
                        <small> (jamais)</small>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alertes : circuits à réviser */}
            {alertes.circuits_a_reviser.length > 0 && (
              <div style={styles.alerteCard}>
                <div style={styles.alerteHeader}>
                  <span style={styles.alerteIcone}>🟡</span>
                  <strong>Circuits à réviser</strong>
                  <span style={styles.alerteCount}>
                    {alertes.circuits_a_reviser.length}
                  </span>
                </div>
                <p style={styles.alerteDesc}>
                  Activités désactivées ou données manquantes
                </p>
                <ul style={styles.alerteListe}>
                  {alertes.circuits_a_reviser.slice(0, 5).map((c) => (
                    <li key={c.id}>
                      <Link to="/circuits" style={styles.alerteLink}>
                        {c.nom} ({c.duree_jours}j)
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alertes : lignes à confirmer */}
            {alertes.lignes_a_confirmer.length > 0 && (
              <div style={styles.alerteCard}>
                <div style={styles.alerteHeader}>
                  <span style={styles.alerteIcone}>🟣</span>
                  <strong>Lignes à confirmer</strong>
                  <span style={styles.alerteCount}>
                    {alertes.lignes_a_confirmer.length}
                  </span>
                </div>
                <p style={styles.alerteDesc}>
                  Disponibilités non vérifiées
                </p>
                <ul style={styles.alerteListe}>
                  {alertes.lignes_a_confirmer.slice(0, 5).map((l) => (
                    <li key={l.id}>
                      <Link to={`/demandes/${l.demande_id}`} style={styles.alerteLink}>
                        {l.reference} — {l.libelle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dernières demandes */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Dernières demandes</h2>
          <Link to="/demandes" style={styles.link}>Voir tout →</Link>
        </div>

        {dernieresDemandes.length === 0 ? (
          <p style={styles.empty}>Aucune demande pour le moment</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Référence</th>
                <th style={styles.th}>Client</th>
                <th style={styles.th}>Destination</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {dernieresDemandes.map((d) => (
                <tr key={d.id} style={styles.tr}>
                  <td style={styles.td}>
                    <Link to={`/demandes/${d.id}`} style={styles.refLink}>
                      {d.reference}
                    </Link>
                  </td>
                  <td style={styles.td}>{d.nom_client}</td>
                  <td style={styles.td}>{d.destination_nom}</td>
                  <td style={styles.td}>
                    <StatutBadge statut={d.statut} />
                  </td>
                  <td style={styles.td}>
                    {new Date(d.date_creation).toLocaleDateString('fr-FR')}
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

function StatCard({ titre, valeur, couleur, icone }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${couleur}` }}>
      <div style={styles.statIcon}>{icone}</div>
      <div style={styles.statValeur}>{valeur}</div>
      <div style={styles.statTitre}>{titre}</div>
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
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  statIcon: { fontSize: '28px', marginBottom: '8px' },
  statValeur: { fontSize: '32px', fontWeight: 'bold', color: '#2C3E50' },
  statTitre: { fontSize: '13px', color: '#7f8c8d', marginTop: '4px' },
  // Alertes
  alertesSection: {
    marginBottom: '24px'
  },
  alertesHeader: {
    marginBottom: '12px'
  },
  alertesTitre: {
    fontSize: '18px',
    color: '#2C3E50'
  },
  alertesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  alerteCard: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '4px solid #E67E22',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  alerteHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  alerteIcone: { fontSize: '16px' },
  alerteCount: {
    marginLeft: 'auto',
    backgroundColor: '#E74C3C',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '700'
  },
  alerteDesc: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '8px',
    fontStyle: 'italic'
  },
  alerteListe: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '13px'
  },
  alerteLink: {
    color: '#C0392B',
    fontWeight: '600'
  },
  // Section
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: { fontSize: '16px', color: '#2C3E50' },
  link: { fontSize: '13px', color: '#C0392B', fontWeight: '600' },
  empty: { padding: '20px', textAlign: 'center', color: '#95A5A6' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f8f9fa' },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '12px',
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  tr: { borderBottom: '1px solid #ecf0f1' },
  td: { padding: '12px', fontSize: '14px' },
  refLink: { color: '#C0392B', fontWeight: '600' },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600'
  }
};
