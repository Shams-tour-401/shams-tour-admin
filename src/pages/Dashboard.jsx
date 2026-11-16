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

  // ✅ DONNÉES DU DIAGRAMME EN BANDES
  const barres = [
    { label: 'Total demandes', valeur: stats.total, couleur: '#4b5d70', Icon: ClipboardList },
    { label: 'Nouvelles', valeur: stats.demande_recue, couleur: '#2f6fd6', Icon: Bell },
    { label: 'À contacter', valeur: stats.a_contacter, couleur: '#E67E22', Icon: Phone },
    { label: 'Confirmées', valeur: stats.confirmee, couleur: '#27AE60', Icon: CheckCircle2 }
  ];

  const maxValeur = Math.max(...barres.map(b => b.valeur), 1);

  return (
    <Page>
      {erreurs.length > 0 && (
        <ErrorBanner role="alert"><AlertCircle size={18} /><ErrorText><strong>Certaines données n'ont pas pu être chargées.</strong><ul>{erreurs.map((m) => <li key={m}>{m}</li>)}</ul></ErrorText><RetryButton type="button" onClick={chargerDonnees}>Réessayer</RetryButton></ErrorBanner>
      )}

      {/* ✅ DIAGRAMME EN BANDES */}
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
                    <Icon size={14} />
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
    'demande_recue': { label: 'Demande reçue', tone: 'blue' },
    'a_contacter': { label: 'À contacter', tone: 'amber' },
    'disponibilites_a_verifier': { label: 'Dispo. à vérifier', tone: 'yellow' },
    'proposition_a_valider': { label: 'Prop. à valider', tone: 'violet' },
    'confirmee': { label: 'Confirmée', tone: 'green' },
    'annulee': { label: 'Annulée', tone: 'neutral' }
  };
  const c = config[statut] || { label: statut, tone: 'neutral' };
  return <Badge $tone={c.tone}>{c.label}</Badge>;
}

/* ---------------------- Styles ---------------------- */

const TONES = {
  neutral: { fg: '#4b5d70', bg: '#eef2f6' },
  blue: { fg: '#1d5fbf', bg: '#e6f0ff' },
  green: { fg: '#0f7a3d', bg: '#e3f8ea' },
  amber: { fg: '#b45309', bg: '#fff1e0' },
  yellow: { fg: '#a16207', bg: '#fef7d6' },
  red: { fg: '#c0182b', bg: '#ffe8ea' },
  violet: { fg: '#7a1fc4', bg: '#f3e8ff' }
};
const toneFg = ({ $tone }) => (TONES[$tone] || TONES.neutral).fg;
const toneBg = ({ $tone }) => (TONES[$tone] || TONES.neutral).bg;

const spin = keyframes`to { transform: rotate(360deg); }`;

const Page = styled.div`
  width: 100%; max-width: 100%; display: flex; flex-direction: column;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif;
  color: var(--text-primary); -webkit-font-smoothing: antialiased;
  &, & *, & *::before, & *::after { box-sizing: border-box; }
  a { text-decoration: none; }
`;
const ErrorBanner = styled.div`display: flex; flex-wrap: wrap; align-items: flex-start; gap: 12px; padding: 14px 16px; margin-bottom: 20px; color: #b42318; background: #fef3f2; border: 1px solid #fecdca; border-radius: 12px; svg { flex-shrink: 0; margin-top: 2px; }`;
const ErrorText = styled.div`flex: 1 1 240px; min-width: 0; font-size: 14px; ul { margin: 6px 0 0; padding-left: 18px; font-size: 13px; word-break: break-word; }`;
const RetryButton = styled.button`padding: 8px 14px; font-family: inherit; font-size: 13px; font-weight: 600; color: #fff; background: #2f6fd6; border: none; border-radius: 10px; cursor: pointer; &:hover { background: #2760bf; }`;
const Loading = styled.div`display: flex; align-items: center; justify-content: center; gap: 8px; padding: 64px 16px; font-size: 14px; color: var(--text-muted);`;
const Spinner = styled(Loader2)`animation: ${spin} 0.8s linear infinite;`;

/* ✅ STYLES DU DIAGRAMME EN BANDES */
const ChartCard = styled.section`
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  width: 100%;
  transition: background-color 0.3s ease;
`;
const ChartTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;
const ChartBars = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;
const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
`;
const BarLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  @media (max-width: 640px) {
    min-width: auto;
  }
`;
const BarIcon = styled.span`
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #fff;
  flex-shrink: 0;
`;
const BarTrack = styled.div`
  flex: 1;
  height: 32px;
  background: var(--bg-soft);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;
const BarFill = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  border-radius: 8px;
  transition: width 0.8s ease;
  min-width: 40px;
  span {
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
`;

const AlertesSection = styled.section`margin-bottom: 24px; width: 100%;`;
const AlertesTitre = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  padding: 14px 18px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-left: 4px solid #E67E22; 
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;

  svg {
    color: #b45309;
    flex-shrink: 0;
  }
`;
const AlertesTotal = styled.span`padding: 1px 8px; font-size: 11px; font-weight: 700; color: #fff; background: #e5283c; border-radius: 999px;`;
const AlertesGrid = styled.div`display: grid; grid-template-columns: 1fr; gap: 16px; width: 100%; @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }`;
const AlerteBox = styled.div`padding: 16px; background: var(--bg-soft); border: 1px solid var(--border); border-radius: 12px;`;
const AlerteHeader = styled.div`display: flex; align-items: center; gap: 10px;`;
const AlerteIcone = styled.span`width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${toneFg}; background: ${toneBg}; border-radius: 8px;`;
const AlerteNom = styled.strong`font-size: 15px; font-weight: 600; color: var(--text-primary);`;
const AlerteCount = styled.span`margin-left: auto; min-width: 24px; padding: 2px 8px; font-size: 11px; font-weight: 700; text-align: center; color: ${toneFg}; background: ${toneBg}; border-radius: 999px; font-variant-numeric: tabular-nums;`;
const AlerteDesc = styled.p`margin: 8px 0 10px; font-size: 12px; color: var(--text-muted);`;
const AlerteListe = styled.ul`list-style: none; margin: 0; padding: 0; font-size: 13px;`;
const AlerteItem = styled.li`display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid var(--border);`;
const AlerteLink = styled(Link)`min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; color: var(--text-primary); transition: color 0.15s ease; &:hover { color: #2f6fd6; }`;
const AlerteMeta = styled.small`flex-shrink: 0; font-size: 12px; color: var(--text-muted);`;
const Section = styled.section`background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; width: 100%;`;
const SectionHeader = styled.div`display: flex; align-items: center; justify-content: space-between; padding: 16px; @media (min-width: 640px) { padding: 16px 20px; }`;
const SectionTitle = styled.h2`margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary);`;
const VoirTout = styled(Link)`display: inline-flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 500; color: #2f6fd6; transition: gap 0.15s ease, color 0.15s ease; &:hover { gap: 5px; color: #2760bf; }`;
const Empty = styled.div`display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px 16px; color: #9db0c4; p { margin: 0; font-size: 14px; color: var(--text-muted); }`;
const TableWrapper = styled.div`overflow-x: auto; -webkit-overflow-scrolling: touch;`;
const Table = styled.table`width: 100%; min-width: 640px; border-collapse: collapse;`;
const Th = styled.th`padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted); background: var(--bg-soft); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); white-space: nowrap; @media (min-width: 640px) { &:first-child { padding-left: 20px; } }`;
const Tr = styled.tr`border-bottom: 1px solid var(--border); transition: background-color 0.12s ease; &:last-child { border-bottom: none; } &:hover { background: var(--bg-soft); }`;
const Td = styled.td`padding: 14px 16px; font-size: 14px; font-weight: ${({ $strong }) => ($strong ? 600 : 400)}; color: ${({ $muted, $strong }) => $muted ? 'var(--text-muted)' : $strong ? 'var(--text-primary)' : 'var(--text-secondary)'}; white-space: nowrap; @media (min-width: 640px) { &:first-child { padding-left: 20px; } }`;
const RefLink = styled(Link)`font-weight: 600; color: #1f4e79; font-variant-numeric: tabular-nums; transition: color 0.15s ease; &:hover { color: #2f6fd6; }`;
const Badge = styled.span`display: inline-block; padding: 3px 10px; font-size: 12px; font-weight: 500; color: ${toneFg}; background: ${toneBg}; border-radius: 999px;`;
