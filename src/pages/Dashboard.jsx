// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Bell,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Tag,
  Route,
  ListChecks,
  ArrowRight,
  Loader2,
  Inbox
} from 'lucide-react';
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
    return (
      <div className={styles.loading}>
        <Loader2 size={18} className={styles.spinner} />
        Chargement...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Cartes de statistiques */}
      <div className={styles.statsGrid}>
        <StatCard titre="Total demandes" valeur={stats.total} tone="neutral" Icon={ClipboardList} />
        <StatCard titre="Nouvelles" valeur={stats.demande_recue} tone="accent" Icon={Bell} />
        <StatCard titre="À contacter" valeur={stats.a_contacter} tone="amber" Icon={Phone} />
        <StatCard titre="Confirmées" valeur={stats.confirmee} tone="green" Icon={CheckCircle2} />
      </div>

      {/* Alertes */}
      {alertes.total > 0 && (
        <section className={styles.alertesSection}>
          <h2 className={styles.alertesTitre}>
            <AlertTriangle size={18} />
            Alertes
            <span className={styles.alertesTotal}>{alertes.total}</span>
          </h2>

          <div className={styles.alertesGrid}>
            {/* Alertes : demandes en retard */}
            {alertes.demandes_en_retard.length > 0 && (
              <AlerteCard
                tone="red"
                Icon={Clock}
                titre="Demandes en retard"
                description="Sans action depuis plus d'un jour ouvré"
                count={alertes.demandes_en_retard.length}
              >
                {alertes.demandes_en_retard.slice(0, 5).map((d) => (
                  <li key={d.id} className={styles.alerteItem}>
                    <Link to={`/demandes/${d.id}`} className={styles.alerteLink}>
                      {d.reference} — {d.nom_client}
                    </Link>
                    <small className={styles.alerteMeta}>{d.jours_depuis_creation}j</small>
                  </li>
                ))}
              </AlerteCard>
            )}

            {/* Alertes : tarifs anciens */}
            {alertes.tarifs_anciens.length > 0 && (
              <AlerteCard
                tone="amber"
                Icon={Tag}
                titre="Tarifs à vérifier"
                description="Non vérifiés depuis plus de 180 jours"
                count={alertes.tarifs_anciens.length}
              >
                {alertes.tarifs_anciens.slice(0, 5).map((t) => (
                  <li key={t.id} className={styles.alerteItem}>
                    <Link to="/tarifs" className={styles.alerteLink}>
                      {t.activite_nom || 'Prestataire'} — {t.prix_vente.toLocaleString('fr-FR')} Ar
                    </Link>
                    <small className={styles.alerteMeta}>
                      {t.derniere_verification ? `${t.jours_depuis_verif}j` : 'jamais'}
                    </small>
                  </li>
                ))}
              </AlerteCard>
            )}

            {/* Alertes : circuits à réviser */}
            {alertes.circuits_a_reviser.length > 0 && (
              <AlerteCard
                tone="yellow"
                Icon={Route}
                titre="Circuits à réviser"
                description="Activités désactivées ou données manquantes"
                count={alertes.circuits_a_reviser.length}
              >
                {alertes.circuits_a_reviser.slice(0, 5).map((c) => (
                  <li key={c.id} className={styles.alerteItem}>
                    <Link to="/circuits" className={styles.alerteLink}>
                      {c.nom}
                    </Link>
                    <small className={styles.alerteMeta}>{c.duree_jours}j</small>
                  </li>
                ))}
              </AlerteCard>
            )}

            {/* Alertes : lignes à confirmer */}
            {alertes.lignes_a_confirmer.length > 0 && (
              <AlerteCard
                tone="violet"
                Icon={ListChecks}
                titre="Lignes à confirmer"
                description="Disponibilités non vérifiées"
                count={alertes.lignes_a_confirmer.length}
              >
                {alertes.lignes_a_confirmer.slice(0, 5).map((l) => (
                  <li key={l.id} className={styles.alerteItem}>
                    <Link to={`/demandes/${l.demande_id}`} className={styles.alerteLink}>
                      {l.reference} — {l.libelle}
                    </Link>
                  </li>
                ))}
              </AlerteCard>
            )}
          </div>
        </section>
      )}

      {/* Dernières demandes */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Dernières demandes</h2>
          <Link to="/demandes" className={styles.link}>
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {dernieresDemandes.length === 0 ? (
          <div className={styles.empty}>
            <Inbox size={28} />
            <p>Aucune demande pour le moment</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Référence</th>
                  <th className={styles.th}>Client</th>
                  <th className={styles.th}>Destination</th>
                  <th className={styles.th}>Statut</th>
                  <th className={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {dernieresDemandes.map((d) => (
                  <tr key={d.id} className={styles.tr}>
                    <td className={styles.td}>
                      <Link to={`/demandes/${d.id}`} className={styles.refLink}>
                        {d.reference}
                      </Link>
                    </td>
                    <td className={styles.td}>{d.nom_client}</td>
                    <td className={styles.td}>{d.destination_nom}</td>
                    <td className={styles.td}>
                      <StatutBadge statut={d.statut} />
                    </td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ titre, valeur, tone, Icon }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[`tone_${tone}`]}`}>
        <Icon size={18} />
      </div>
      <div className={styles.statValeur}>{valeur}</div>
      <div className={styles.statTitre}>{titre}</div>
    </div>
  );
}

function AlerteCard({ tone, Icon, titre, description, count, children }) {
  return (
    <div className={styles.alerteCard}>
      <div className={styles.alerteHeader}>
        <span className={`${styles.alerteIcone} ${styles[`tone_${tone}`]}`}>
          <Icon size={15} />
        </span>
        <strong className={styles.alerteNom}>{titre}</strong>
        <span className={styles.alerteCount}>{count}</span>
      </div>
      <p className={styles.alerteDesc}>{description}</p>
      <ul className={styles.alerteListe}>{children}</ul>
    </div>
  );
}

function StatutBadge({ statut }) {
  const config = {
    'demande_recue': { label: 'Demande reçue', tone: 'blue' },
    'a_contacter': { label: 'À contacter', tone: 'amber' },
    'disponibilites_a_verifier': { label: 'Dispo. à vérifier', tone: 'yellow' },
    'proposition_a_valider': { label: 'Prop. à valider', tone: 'violet' },
    'confirmee': { label: 'Confirmée', tone: 'green' },
    'annulee': { label: 'Annulée', tone: 'neutral' }
  };

  const c = config[statut] || { label: statut, tone: 'neutral' };

  return (
    <span className={`${styles.badge} ${styles[`tone_${c.tone}`]}`}>
      <span className={styles.badgeDot} />
      {c.label}
    </span>
  );
}
