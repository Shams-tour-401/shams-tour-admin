// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  AlertCircle, ClipboardList, Bell, Phone, CheckCircle2,
  AlertTriangle, Clock, Tag, Route, ListChecks, ChevronRight, Loader2, Inbox
} from 'lucide-react';
import { demandesService } from '../services/demandes';
import { alertesService } from '../services/alertes';

const ALERTES_VIDES = {
  total: 0, tarifs_anciens: [], circuits_a_reviser: [], demandes_en_retard: [], lignes_a_confirmer: []
};

const normaliserAlertes = (data) => {
  const src = data && typeof data === 'object' ? data : {};
  const liste = (v) => (Array.isArray(v) ? v : []);
  return {
    total: Number(src.total) || 0,
    tarifs_anciens: liste(src.tarifs_anciens),
    circuits_a_reviser: liste(src.circuits_a_reviser),
    demandes_en_retard: liste(src.demandes_en_retard),
    lignes_a_confirmer: liste(src.lignes_a_confirmer)
  };
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, demande_recue: 0, a_contacter: 0, confirmee: 0 });
  const [dernieresDemandes, setDernieresDemandes] = useState([]);
  const [alertes, setAlertes] = useState(ALERTES_VIDES);
  const [loading, setLoading] = useState(true);
  const [erreurs, setErreurs] = useState([]);

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      setErreurs([]);
      const [resDemandes, resAlertes] = await Promise.allSettled([
        demandesService.getAll(), alertesService.getAll()
      ]);
      const messages = [];
      const decrire = (nom, reason) => {
        const status = reason?.response?.status;
        const detail = reason?.response?.data?.error || reason?.message || 'erreur inconnue';
        return `${nom} : ${status ? `HTTP ${status} — ` : ''}${detail}`;
      };
      let demandes = [];
      if (resDemandes.status === 'fulfilled') {
        demandes = Array.isArray(resDemandes.value) ? resDemandes.value : [];
      } else { messages.push(decrire('Demandes', resDemandes.reason)); }
      if (resAlertes.status === 'fulfilled') {
        setAlertes(normaliserAlertes(resAlertes.value));
      } else { messages.push(decrire('Alertes', resAlertes.reason)); setAlertes(ALERTES_VIDES); }
      setStats({
        total: demandes.length,
        demande_recue: demandes.filter(d => d.statut === 'demande_recue').length,
        a_contacter: demandes.filter(d => d.statut === 'a_contacter').length,
        confirmee: demandes.filter(d => d.statut === 'confirmee').length
      });
      setDernieresDemandes(demandes.slice(0, 5));
      setErreurs(messages);
    } catch (error) {
      setErreurs([error?.message || 'Erreur de chargement']);
    } finally { setLoading(false); }
  };

  if (loading) return <Loading><Spinner size={18} />Chargement...</Loading>;

  // Données du diagramme en bandes
  const barres = [
    { label: 'Total demandes', valeur: stats.total, couleur: '#5a4339', Icon: ClipboardList },
    { label: 'Nouvelles', valeur: stats.demande_recue, couleur: '#b8321f', Icon: Bell },
    { label: 'À contacter', valeur: stats.a_contacter, couleur: '#e08a1e', Icon: Phone },
    { label: 'Confirmées', valeur: stats.confirmee, couleur: '#1e8a3a', Icon: CheckCircle2 }
  ];

  const maxValeur = Math.max(...barres.map(b => b.valeur), 1);

  return (
    <Page>
      {erreurs.length > 0 && (
        <ErrorBanner role="alert"><AlertCircle size={18} /><ErrorText><strong>Certaines données n'ont pas pu être chargées.</strong><ul>{erreurs.map((m) => <li key={m}>{m}</li>)}</ul></ErrorText><RetryButton type="button" onClick={chargerDonnees}>Réessayer</RetryButton></ErrorBanner>
      )}

      {/* Diagramme en bandes */}
      <ChartCard>
        <ChartTitle>Répartition des demandes</ChartTitle>
        <ChartBars>
          {barres.map((b) => {
            const pourcentage = (b.valeur / maxValeur) * 100;
            const Icon = b.Icon;
            return (
              <BarRow key={b.label}>
                <BarLabel>
                  <BarIcon style={{ backgroundColor: b.couleur }}>
                    <Icon size={15} />
                  </BarIcon>
                  <span>{b.label}</span>
                </BarLabel>
                <BarTrack>
                  <BarFill
                    style={{
                      width: `${Math.max(pourcentage, 2)}%`,
                      backgroundColor: b.couleur
                    }}
                  >
                    <span>{b.valeur}</span>
                  </BarFill>
                </BarTrack>
              </BarRow>
            );
          })}
        </ChartBars>
      </ChartCard>

      {alertes.total > 0 && (
        <AlertesSection>
          <AlertesTitre><AlertTriangle size={18} />À traiter<AlertesTotal>{alertes.total}</AlertesTotal></AlertesTitre>
          <AlertesGrid>
            {alertes.demandes_en_retard.length > 0 && (
              <AlerteCard tone="red" Icon={Clock} titre="Demandes en retard" description="Sans action depuis plus d'un jour ouvré" count={alertes.demandes_en_retard.length}>
                {alertes.demandes_en_retard.slice(0, 5).map((d) => (<AlerteItem key={d.id}><AlerteLink to={`/demandes/${d.id}`}>{d.reference} — {d.nom_client}</AlerteLink><AlerteMeta>{d.jours_depuis_creation}j</AlerteMeta></AlerteItem>))}
              </AlerteCard>
            )}
            {alertes.tarifs_anciens.length > 0 && (
              <AlerteCard tone="amber" Icon={Tag} titre="Tarifs à vérifier" description="Non vérifiés depuis plus de 180 jours" count={alertes.tarifs_anciens.length}>
                {alertes.tarifs_anciens.slice(0, 5).map((t) => (<AlerteItem key={t.id}><AlerteLink to="/tarifs">{t.activite_nom || 'Prestataire'} — {t.prix_vente.toLocaleString('fr-FR')} Ar</AlerteLink><AlerteMeta>{t.derniere_verification ? `${t.jours_depuis_verif}j` : 'jamais'}</AlerteMeta></AlerteItem>))}
              </AlerteCard>
            )}
            {alertes.circuits_a_reviser.length > 0 && (
              <AlerteCard tone="yellow" Icon={Route} titre="Circuits à réviser" description="Activités désactivées ou données manquantes" count={alertes.circuits_a_reviser.length}>
                {alertes.circuits_a_reviser.slice(0, 5).map((c) => (<AlerteItem key={c.id}><AlerteLink to="/circuits">{c.nom}</AlerteLink><AlerteMeta>{c.duree_jours}j</AlerteMeta></AlerteItem>))}
              </AlerteCard>
            )}
            {alertes.lignes_a_confirmer.length > 0 && (
              <AlerteCard tone="violet" Icon={ListChecks} titre="Lignes à confirmer" description="Disponibilités non vérifiées" count={alertes.lignes_a_confirmer.length}>
                {alertes.lignes_a_confirmer.slice(0, 5).map((l) => (<AlerteItem key={l.id}><AlerteLink to={`/demandes/${l.demande_id}`}>{l.reference} — {l.libelle}</AlerteLink></AlerteItem>))}
              </AlerteCard>
            )}
          </AlertesGrid>
        </AlertesSection>
      )}

      <Section>
        <SectionHeader><SectionTitle>Dernières demandes</SectionTitle><VoirTout to="/demandes">Tout voir <ChevronRight size={14} /></VoirTout></SectionHeader>
        {dernieresDemandes.length === 0 ? (
          <Empty><Inbox size={28} /><p>Aucune demande pour le moment</p></Empty>
        ) : (
          <TableWrapper><Table><thead><tr><Th>Référence</Th><Th>Client</Th><Th>Destination</Th><Th>Statut</Th><Th>Date</Th></tr></thead><tbody>
            {dernieresDemandes.map((d) => (
              <Tr key={d.id}><Td><RefLink to={`/demandes/${d.id}`}>{d.reference}</RefLink></Td><Td $strong>{d.nom_client}</Td><Td>{d.destination_nom}</Td><Td><StatutBadge statut={d.statut} /></Td><Td $muted>{new Date(d.date_creation).toLocaleDateString('fr-FR')}</Td></Tr>
            ))}
          </tbody></Table></TableWrapper>
        )}
      </Section>
    </Page>
  );
}

function AlerteCard({ tone, Icon, titre, description, count, children }) {
  return (
    <AlerteBox>
      <AlerteHeader><AlerteIcone $tone={tone}><Icon size={15} /></AlerteIcone><AlerteNom>{titre}</AlerteNom><AlerteCount $tone={tone}>{count}</AlerteCount></AlerteHeader>
      <AlerteDesc>{description}</AlerteDesc>
      <AlerteListe>{children}</AlerteListe>
    </AlerteBox>
  );
}

function StatutBadge({ statut }) {
  const config = {
    'demande_recue': { label: 'Demande reçue', tone: 'brand' },
    'a_contacter': { label: 'À contacter', tone: 'amber' },
    'disponibilites_a_verifier': { label: 'Dispo. à vérifier', tone: 'yellow' },
    'proposition_a_valider': { label: 'Prop. à valider', tone: 'violet' },
    'confirmee': { label: 'Confirmée', tone: 'green' },
    'annulee': { label: 'Annulée', tone: 'neutral' }
  };
  const c = config[statut] || { label: statut, tone: 'neutral' };
  return <Badge $tone={c.tone}>{c.label}</Badge>;
}

/* ------------------------------------------------------------------ */
/* Styles — thème crème / rouge brique (comme l'app M3)               */
/* ------------------------------------------------------------------ */

const TONES = {
  neutral: { fg: '#6b5d54', bg: '#f1ebe2' },
  brand: { fg: '#b8321f', bg: '#fbeae6' },
  green: { fg: '#1e7a37', bg: '#e6f5ea' },
  amber: { fg: '#b45309', bg: '#fff0dc' },
  yellow: { fg: '#a16207', bg: '#fdf3cf' },
  red: { fg: '#c0182b', bg: '#ffe8ea' },
  violet: { fg: '#7a1fc4', bg: '#f3e8ff' }
};
const toneFg = ({ $tone }) => (TONES[$tone] || TONES.neutral).fg;
const toneBg = ({ $tone }) => (TONES[$tone] || TONES.neutral).bg;

const spin = keyframes`to { transform: rotate(360deg); }`;

const Page = styled.div`
  /* Palette locale : crème / rouge brique */
  --brand: #b8321f;
  --brand-hover: #a22b1a;
  --brand-soft: #fbeae6;
  --bg-surface: #ffffff;
  --bg-soft: #faf5ec;
  --border: #eadfd0;
  --text-primary: #241914;
  --text-secondary: #4a3f39;
  --text-muted: #8a7e76;
  --shadow-card: 0 2px 4px rgba(120, 70, 40, 0.04), 0 10px 28px rgba(120, 70, 40, 0.08);

  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  font-family: Roboto, 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;

  &, & *, & *::before, & *::after { box-sizing: border-box; }
  a { text-decoration: none; }
`;

const ErrorBanner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
  color: #b42318;
  background: #fef3f2;
  border: 1px solid #fecdca;
  border-radius: 20px;

  svg { flex-shrink: 0; margin-top: 2px; }
`;

const ErrorText = styled.div`
  flex: 1 1 240px;
  min-width: 0;
  font-size: 14px;

  ul { margin: 6px 0 0; padding-left: 18px; font-size: 13px; word-break: break-word; }
`;

const RetryButton = styled.button`
  padding: 9px 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: var(--brand);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(184, 50, 31, 0.25);
  transition: background-color 0.15s ease;

  &:hover { background: var(--brand-hover); }
  &:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(184, 50, 31, 0.3); }
`;

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 64px 16px;
  font-size: 14px;
  color: #8a7e76;
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
  @media (prefers-reduced-motion: reduce) { animation-duration: 2s; }
`;

/* ------------------------- Diagramme en bandes ------------------------- */

const ChartCard = styled.section`
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-bottom: 20px;
  padding: 20px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow-card);

  /* disque chaud décoratif (comme la carte « Nouveau ») */
  &::before {
    content: '';
    position: absolute;
    top: -90px;
    right: -90px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: #fdf0dc;
    pointer-events: none;
  }

  > * { position: relative; }

  @media (min-width: 640px) {
    margin-bottom: 24px;
    padding: 24px 28px;
  }
`;

const ChartTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text-primary);
`;

const ChartBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const BarLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 190px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);

  @media (max-width: 640px) {
    min-width: auto;
    font-size: 13px;
  }
`;

const BarIcon = styled.span`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  border-radius: 50%;
`;

const BarTrack = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  height: 32px;
  overflow: hidden;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 999px;

  @media (max-width: 640px) {
    height: 28px;
  }
`;

const BarFill = styled.div`
  height: 100%;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  border-radius: 999px;
  transition: width 0.8s ease;

  @media (max-width: 640px) {
    min-width: 34px;
    padding: 0 10px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  span {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;

    @media (max-width: 640px) { font-size: 12px; }
  }
`;

/* ------------------------------ Alertes ------------------------------ */

const AlertesSection = styled.section`
  width: 100%;
  margin-bottom: 20px;

  @media (min-width: 640px) { margin-bottom: 24px; }
`;

const AlertesTitre = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  padding: 0 4px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text-primary);

  svg { flex-shrink: 0; color: var(--brand); }
`;

const AlertesTotal = styled.span`
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--brand);
  border-radius: 999px;
`;

const AlertesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const AlerteBox = styled.div`
  min-width: 0;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
`;

const AlerteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AlerteIcone = styled.span`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${toneFg};
  background: ${toneBg};
  border-radius: 50%;
`;

const AlerteNom = styled.strong`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
`;

const AlerteCount = styled.span`
  margin-left: auto;
  min-width: 26px;
  padding: 2px 9px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  color: ${toneFg};
  background: ${toneBg};
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
`;

const AlerteDesc = styled.p`
  margin: 8px 0 10px;
  font-size: 12px;
  color: var(--text-muted);
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
  padding: 9px 0;
  border-top: 1px solid var(--border);
`;

const AlerteLink = styled(Link)`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: var(--text-primary);
  transition: color 0.15s ease;

  &:hover { color: var(--brand); }
`;

const AlerteMeta = styled.small`
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-muted);
`;

/* ------------------------- Dernières demandes ------------------------- */

const Section = styled.section`
  width: 100%;
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;

  @media (min-width: 640px) { padding: 18px 24px; }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text-primary);
`;

const VoirTout = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 999px;
  white-space: nowrap;
  transition: gap 0.15s ease, background-color 0.15s ease;

  &:hover { gap: 5px; background: #f7dcd6; }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 16px;
  color: #c4b5a5;

  p { margin: 0; font-size: 14px; color: var(--text-muted); }
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
  padding: 11px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--bg-soft);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;

  @media (min-width: 640px) { &:first-child { padding-left: 24px; } }
`;

const Tr = styled.tr`
  border-bottom: 1px solid var(--border);
  transition: background-color 0.12s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: var(--bg-soft); }
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  font-weight: ${({ $strong }) => ($strong ? 600 : 400)};
  color: ${({ $muted, $strong }) => ($muted ? 'var(--text-muted)' : $strong ? 'var(--text-primary)' : 'var(--text-secondary)')};
  white-space: nowrap;

  @media (min-width: 640px) { &:first-child { padding-left: 24px; } }
`;

const RefLink = styled(Link)`
  font-weight: 700;
  color: var(--brand);
  font-variant-numeric: tabular-nums;
  transition: color 0.15s ease;

  &:hover { color: var(--brand-hover); text-decoration: underline; }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${toneFg};
  background: ${toneBg};
  border-radius: 999px;
`;
