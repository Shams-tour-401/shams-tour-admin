// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
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

/* ------------------------------------------------------------------ */
/* Composant                                                          */
/* ------------------------------------------------------------------ */

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
      <Loading>
        <Spinner size={18} />
        Chargement...
      </Loading>
    );
  }

  return (
    <Page>
      {/* Cartes de statistiques */}
      <StatsGrid>
        <StatCard titre="Total demandes" valeur={stats.total} tone="neutral" Icon={ClipboardList} />
        <StatCard titre="Nouvelles" valeur={stats.demande_recue} tone="accent" Icon={Bell} />
        <StatCard titre="À contacter" valeur={stats.a_contacter} tone="amber" Icon={Phone} />
        <StatCard titre="Confirmées" valeur={stats.confirmee} tone="green" Icon={CheckCircle2} />
      </StatsGrid>

      {/* Alertes */}
      {alertes.total > 0 && (
        <AlertesSection>
          <AlertesTitre>
            <AlertTriangle size={18} />
            Alertes
            <AlertesTotal>{alertes.total}</AlertesTotal>
          </AlertesTitre>

          <AlertesGrid>
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
                  <AlerteItem key={d.id}>
                    <AlerteLink to={`/demandes/${d.id}`}>
                      {d.reference} — {d.nom_client}
                    </AlerteLink>
                    <AlerteMeta>{d.jours_depuis_creation}j</AlerteMeta>
                  </AlerteItem>
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
                  <AlerteItem key={t.id}>
                    <AlerteLink to="/tarifs">
                      {t.activite_nom || 'Prestataire'} — {t.prix_vente.toLocaleString('fr-FR')} Ar
                    </AlerteLink>
                    <AlerteMeta>
                      {t.derniere_verification ? `${t.jours_depuis_verif}j` : 'jamais'}
                    </AlerteMeta>
                  </AlerteItem>
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
                  <AlerteItem key={c.id}>
                    <AlerteLink to="/circuits">{c.nom}</AlerteLink>
                    <AlerteMeta>{c.duree_jours}j</AlerteMeta>
                  </AlerteItem>
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
                  <AlerteItem key={l.id}>
                    <AlerteLink to={`/demandes/${l.demande_id}`}>
                      {l.reference} — {l.libelle}
                    </AlerteLink>
                  </AlerteItem>
                ))}
              </AlerteCard>
            )}
          </AlertesGrid>
        </AlertesSection>
      )}

      {/* Dernières demandes */}
      <Section>
        <SectionHeader>
          <SectionTitle>Dernières demandes</SectionTitle>
          <VoirTout to="/demandes">
            Voir tout <ArrowRight size={14} />
          </VoirTout>
        </SectionHeader>

        {dernieresDemandes.length === 0 ? (
          <Empty>
            <Inbox size={28} />
            <p>Aucune demande pour le moment</p>
          </Empty>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Référence</Th>
                  <Th>Client</Th>
                  <Th>Destination</Th>
                  <Th>Statut</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {dernieresDemandes.map((d) => (
                  <Tr key={d.id}>
                    <Td>
                      <RefLink to={`/demandes/${d.id}`}>{d.reference}</RefLink>
                    </Td>
                    <Td>{d.nom_client}</Td>
                    <Td>{d.destination_nom}</Td>
                    <Td>
                      <StatutBadge statut={d.statut} />
                    </Td>
                    <Td $muted>{new Date(d.date_creation).toLocaleDateString('fr-FR')}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Section>
    </Page>
  );
}

function StatCard({ titre, valeur, tone, Icon }) {
  return (
    <StatCardBox>
      <StatIcon $tone={tone}>
        <Icon size={18} />
      </StatIcon>
      <StatValeur>{valeur}</StatValeur>
      <StatTitre>{titre}</StatTitre>
    </StatCardBox>
  );
}

function AlerteCard({ tone, Icon, titre, description, count, children }) {
  return (
    <AlerteBox>
      <AlerteHeader>
        <AlerteIcone $tone={tone}>
          <Icon size={15} />
        </AlerteIcone>
        <AlerteNom>{titre}</AlerteNom>
        <AlerteCount>{count}</AlerteCount>
      </AlerteHeader>
      <AlerteDesc>{description}</AlerteDesc>
      <AlerteListe>{children}</AlerteListe>
    </AlerteBox>
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
    <Badge $tone={c.tone}>
      <BadgeDot />
      {c.label}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const TONES = {
  neutral: { fg: '#404040', bg: '#f5f5f5' },
  accent: { fg: '#1e3a8a', bg: '#eaeffd' },
  blue: { fg: '#1d4ed8', bg: '#eff4ff' },
  green: { fg: '#15803d', bg: '#ecfdf3' },
  amber: { fg: '#b45309', bg: '#fff6ed' },
  yellow: { fg: '#a16207', bg: '#fefbe8' },
  red: { fg: '#b42318', bg: '#fef3f2' },
  violet: { fg: '#6d28d9', bg: '#f5f3ff' }
};

const toneFg = ({ $tone }) => (TONES[$tone] || TONES.neutral).fg;
const toneBg = ({ $tone }) => (TONES[$tone] || TONES.neutral).bg;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Page = styled.div`
  --accent: #1e3a8a;
  --accent-hover: #1e40af;
  --ink: #0a0a0a;
  --text: #404040;
  --muted: #737373;
  --border: #e5e5e5;
  --surface: #ffffff;
  --bg: #fafafa;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;

  &,
  & *,
  & *::before,
  & *::after {
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
  }
`;

/* ---------- Chargement ---------- */
const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 64px 16px;
  font-size: 14px;
  color: #737373;
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2s;
  }
`;

/* ---------- Stats ---------- */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
`;

const StatCardBox = styled.div`
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
    transform: translateY(-1px);
  }

  @media (min-width: 640px) {
    padding: 20px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`;

const StatIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: ${toneFg};
  background: ${toneBg};
  border-radius: 10px;
`;

const StatValeur = styled.div`
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;

  @media (min-width: 640px) {
    font-size: 32px;
  }
`;

const StatTitre = styled.div`
  margin-top: 6px;
  font-size: 13px;
  color: var(--muted);
`;

/* ---------- Alertes ---------- */
const AlertesSection = styled.section`
  margin-bottom: 24px;
`;

const AlertesTitre = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);

  svg {
    color: #b45309;
  }
`;

const AlertesTotal = styled.span`
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #b42318;
  background: #fef3f2;
  border: 1px solid #fecdca;
  border-radius: 999px;
`;

const AlertesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (min-width: 1100px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const AlerteBox = styled.div`
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

const AlerteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AlerteIcone = styled.span`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${toneFg};
  background: ${toneBg};
  border-radius: 8px;
`;

const AlerteNom = styled.strong`
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
`;

const AlerteCount = styled.span`
  margin-left: auto;
  min-width: 24px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  color: var(--text);
  background: #f5f5f5;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
`;

const AlerteDesc = styled.p`
  margin: 8px 0 12px;
  font-size: 12px;
  color: var(--muted);
`;

const AlerteListe = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 13px;
`;

const AlerteItem = styled.li`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
`;

const AlerteLink = styled(Link)`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: var(--ink);
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent);
  }
`;

const AlerteMeta = styled.small`
  flex-shrink: 0;
  font-size: 12px;
  color: var(--muted);
`;

/* ---------- Section / tableau ---------- */
const Section = styled.section`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);

  @media (min-width: 640px) {
    padding: 18px 20px;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
`;

const VoirTout = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  transition: gap 0.15s ease, color 0.15s ease;

  &:hover {
    gap: 7px;
    color: var(--accent-hover);
  }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 16px;
  color: #a3a3a3;

  p {
    margin: 0;
    font-size: 14px;
    color: var(--muted);
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.12s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg);
  }
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  color: ${({ $muted }) => ($muted ? 'var(--muted)' : 'var(--text)')};
  white-space: nowrap;
`;

const RefLink = styled(Link)`
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent);
  }
`;

/* ---------- Badges ---------- */
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  color: ${toneFg};
  background: ${toneBg};
  border-radius: 999px;
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
`;
