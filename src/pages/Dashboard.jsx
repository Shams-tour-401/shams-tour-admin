// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { demandesService } from '../services/demandes';
import { alertesService } from '../services/alertes';
import styles from './Dashboard.module.css';

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
    return <div className={styles.loading}>Chargement des données...</div>;
  }

  return (
    <div className={styles.container}>
      
      {/* En-tête */}
      <div className={styles.header}>
        <h1 className={styles.titre}>Tableau de bord</h1>
        <p className={styles.sousTitre}>Bienvenue dans l'espace d'administration Shams Tour.</p>
      </div>

      {/* Cartes de statistiques */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total demandes</div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#3498db' }}>
          <div className={styles.statIcon}>🔔</div>
          <div className={styles.statValue}>{stats.demande_recue}</div>
          <div className={styles.statLabel}>Nouvelles</div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#e67e22' }}>
          <div className={styles.statIcon}>📞</div>
          <div className={styles.statValue}>{stats.a_contacter}</div>
          <div className={styles.statLabel}>À contacter</div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#27ae60' }}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statValue}>{stats.confirmee}</div>
          <div className={styles.statLabel}>Confirmées</div>
        </div>
      </div>

      {/* Alertes (si présentes) */}
      {alertes.total > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⚠️ Alertes</h2>
          </div>
          <div className={styles.alertesGrid}>
            {alertes.demandes_en_retard.length > 0 && (
              <div className={styles.alerteCard}>
                <span className={styles.alerteIcon}>🔴</span>
                <div>
                  <strong>{alertes.demandes_en_retard.length} demande(s) en retard</strong>
                  <p>Sans action depuis plus d'un jour ouvré</p>
                </div>
              </div>
            )}
            {alertes.tarifs_anciens.length > 0 && (
              <div className={styles.alerteCard}>
                <span className={styles.alerteIcon}>🟠</span>
                <div>
                  <strong>{alertes.tarifs_anciens.length} tarif(s) à vérifier</strong>
                  <p>Non vérifiés depuis plus de 180 jours</p>
                </div>
              </div>
            )}
            {alertes.circuits_a_reviser.length > 0 && (
              <div className={styles.alerteCard}>
                <span className={styles.alerteIcon}>🟡</span>
                <div>
                  <strong>{alertes.circuits_a_reviser.length} circuit(s) à réviser</strong>
                  <p>Activités désactivées ou données manquantes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dernières demandes */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Dernières demandes</h2>
          <Link to="/demandes" className={styles.link}>Voir tout →</Link>
        </div>

        {dernieresDemandes.length === 0 ? (
          <p className={styles.empty}>Aucune demande pour le moment.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Destination</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dernieresDemandes.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Link to={`/demandes/${d.id}`} className={styles.refLink}>
                        {d.reference}
                      </Link>
                    </td>
                    <td>{d.nom_client}</td>
                    <td>{d.destination_nom}</td>
                    <td>
                      <span className={`${styles.badge} ${styles['badge_' + d.statut]}`}>
                        {d.statut.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>{new Date(d.date_creation).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
