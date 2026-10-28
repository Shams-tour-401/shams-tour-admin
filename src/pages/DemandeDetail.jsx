// src/pages/DemandeDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  ArrowLeft,
  User,
  Phone,
  PhoneCall,
  PhoneOff,
  Compass,
  AlertTriangle,
  MessageSquare,
  StickyNote,
  Settings,
  FileText,
  History,
  Plus,
  X,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  TrendingUp,
  ClipboardCheck
} from 'lucide-react';
import { demandesService } from '../services/demandes';
import { propositionsService } from '../services/propositions';

/* ------------------------------------------------------------------ */
/* Composant principal                                                */
/* ------------------------------------------------------------------ */

export default function DemandeDetail() {
  const { id } = useParams();
  const [demande, setDemande] = useState(null);
  const [propositions, setPropositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [changementEnCours, setChangementEnCours] = useState(false);

  // Notes
  const [nouvelleNote, setNouvelleNote] = useState('');
  const [ajoutNoteEnCours, setAjoutNoteEnCours] = useState(false);

  // Appels
  const [modalAppel, setModalAppel] = useState(false);

  // Propositions
  const [modalProposition, setModalProposition] = useState(false);
  const [modalAccord, setModalAccord] = useState(null);

  useEffect(() => {
    chargerDemande();
  }, [id]);

  const chargerDemande = async () => {
    try {
      setLoading(true);
      const data = await demandesService.getById(id);
      setDemande(data);

      // Charger les propositions
      const props = await propositionsService.getByDemande(id);
      setPropositions(props);
    } catch (error) {
      console.error('Erreur chargement demande :', error);
      setErreur('Impossible de charger la demande');
    } finally {
      setLoading(false);
    }
  };

  const changerStatut = async (nouveauStatut, motif = null) => {
    if (nouveauStatut === 'annulee' && !motif) {
      const motifSaisi = prompt('Motif d\'annulation (obligatoire) :');
      if (!motifSaisi || !motifSaisi.trim()) return;
      motif = motifSaisi.trim();
    }

    try {
      setChangementEnCours(true);
      await demandesService.changerStatut(id, nouveauStatut, motif);
      await chargerDemande();
    } catch (error) {
      const data = error.response?.data;
      if (data?.regles && data.regles.length > 0) {
        alert(
          '❌ Transition impossible :\n\n' +
          data.regles.map(r => '• ' + r).join('\n')
        );
      } else {
        alert('Erreur : ' + (data?.error || error.message));
      }
    } finally {
      setChangementEnCours(false);
    }
  };

  const ajouterNote = async () => {
    if (!nouvelleNote.trim()) return;

    try {
      setAjoutNoteEnCours(true);
      await demandesService.ajouterNote(id, nouvelleNote);
      setNouvelleNote('');
      await chargerDemande();
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    } finally {
      setAjoutNoteEnCours(false);
    }
  };

  const enregistrerAppel = async (resultat, resume) => {
    try {
      await demandesService.enregistrerAppel(id, resultat, resume);
      await chargerDemande();
      setModalAppel(false);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const creerProposition = async (data) => {
    try {
      await propositionsService.creer(id, data);
      await chargerDemande();
      setModalProposition(false);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  const enregistrerAccord = async (proposition, mode) => {
    try {
      await propositionsService.enregistrerAccord(id, proposition.id, mode);
      await chargerDemande();
      setModalAccord(null);
    } catch (error) {
      alert('Erreur : ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <Page><Loading>Chargement...</Loading></Page>;
  if (erreur) return <Page><ErreurBox>{erreur}</ErreurBox></Page>;
  if (!demande) return <Page><ErreurBox>Demande non trouvée</ErreurBox></Page>;

  const statutsDisponibles = [
    { value: 'demande_recue', label: 'Demande reçue' },
    { value: 'a_contacter', label: 'À contacter' },
    { value: 'disponibilites_a_verifier', label: 'Disponibilités à vérifier' },
    { value: 'proposition_a_valider', label: 'Proposition à valider' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'annulee', label: 'Annulée' }
  ];

  return (
    <Page>
      {/* En-tête */}
      <Header>
        <div>
          <Retour to="/demandes">
            <ArrowLeft size={14} /> Retour aux demandes
          </Retour>
          <Reference>{demande.reference}</Reference>
          <ClientLine>
            <span><User size={14} /> {demande.nom_client}</span>
            <span><Phone size={14} /> {demande.telephone}</span>
          </ClientLine>
        </div>
        <StatutBadge statut={demande.statut} />
      </Header>

      <Grid>
        {/* Colonne gauche */}
        <Colonne>
          {/* Critères du voyage */}
          <Card titre="Critères du voyage" Icon={Compass}>
            <Info label="Destination" valeur={demande.destination_nom} />
            <Info
              label="Date de départ"
              valeur={new Date(demande.date_depart).toLocaleDateString('fr-FR')}
            />
            <Info label="Nombre de jours" valeur={demande.nombre_jours} />
            <Info
              label="Voyageurs"
              valeur={`${demande.adultes} adulte(s)${demande.enfants > 0 ? ` + ${demande.enfants} enfant(s)` : ''}`}
            />
            {demande.profil && <Info label="Profil" valeur={demande.profil} />}
            {demande.envies && <Info label="Envies" valeur={demande.envies} />}
            {demande.rythme && <Info label="Rythme" valeur={demande.rythme} />}
            {demande.budget && (
              <Info
                label="Budget"
                valeur={`${demande.budget.toLocaleString('fr-FR')} Ar (${demande.budget_type === 'total_groupe' ? 'total groupe' : 'par personne'})`}
              />
            )}
          </Card>

          {/* Alerte doublon */}
          {demande.doublons && demande.doublons.length > 0 && (
            <Card titre="Doublon possible détecté" Icon={AlertTriangle} warning>
              <AlerteDoublon>
                Ce client a {demande.doublons.length} autre(s) demande(s) similaire(s) :
              </AlerteDoublon>
              {demande.doublons.map((d) => (
                <DoublonItem key={d.id}>
                  <DoublonLink to={`/demandes/${d.id}`}>{d.reference}</DoublonLink>
                  <small>
                    {' '}— {new Date(d.date_depart).toLocaleDateString('fr-FR')}
                    {' '}({d.statut})
                  </small>
                </DoublonItem>
              ))}
            </Card>
          )}

          {/* Commentaire */}
          {demande.commentaire && (
            <Card titre="Commentaire du client" Icon={MessageSquare}>
              <Commentaire>{demande.commentaire}</Commentaire>
            </Card>
          )}

          {/* Notes internes */}
          <Card titre="Notes internes" Icon={StickyNote}>
            <NoteForm>
              <Textarea
                value={nouvelleNote}
                onChange={(e) => setNouvelleNote(e.target.value)}
                placeholder="Ajouter une note interne..."
                rows="2"
              />
              <Btn
                type="button"
                $block
                onClick={ajouterNote}
                disabled={!nouvelleNote.trim() || ajoutNoteEnCours}
              >
                <Plus size={16} />
                {ajoutNoteEnCours ? '...' : 'Ajouter la note'}
              </Btn>
            </NoteForm>

            {demande.notes && demande.notes.length > 0 ? (
              demande.notes.map((n) => (
                <LogItem key={n.id}>
                  <LogHeader>
                    <strong>{n.auteur_nom || 'Système'}</strong>
                    <small>{new Date(n.date_creation).toLocaleString('fr-FR')}</small>
                  </LogHeader>
                  <p>{n.texte}</p>
                </LogItem>
              ))
            ) : (
              <Vide>Aucune note</Vide>
            )}
          </Card>
        </Colonne>

        {/* Colonne droite */}
        <Colonne>
          {/* Actions */}
          <Card titre="Actions" Icon={Settings}>
            <Label>Changer le statut :</Label>
            <Select
              value={demande.statut}
              onChange={(e) => changerStatut(e.target.value)}
              disabled={changementEnCours}
            >
              {statutsDisponibles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>

            {/* Compteur d'appels */}
            {demande.stats_appels && demande.stats_appels.total > 0 && (
              <CompteurAppels>
                <CompteurItem>
                  <strong>{demande.stats_appels.total}</strong>
                  <span>tentative(s)</span>
                </CompteurItem>
                <CompteurItem>
                  <strong>{demande.stats_appels.aboutis}</strong>
                  <span>aboutie(s)</span>
                </CompteurItem>
                <CompteurItem>
                  <strong>{demande.stats_appels.aujourd_hui}</strong>
                  <span>aujourd'hui</span>
                </CompteurItem>
              </CompteurAppels>
            )}

            {/* Bouton appel */}
            <Btn type="button" $block $variant="outline" onClick={() => setModalAppel(true)}>
              <PhoneCall size={16} />
              Enregistrer un appel
            </Btn>

            {/* Actions rapides selon le statut */}
            <ActionsRapides>
              {demande.statut === 'demande_recue' && (
                <Btn
                  type="button"
                  $block
                  onClick={() => changerStatut('a_contacter')}
                  disabled={changementEnCours}
                >
                  <Phone size={16} />
                  Marquer "à contacter"
                </Btn>
              )}

              {demande.statut === 'a_contacter' && (
                <Btn
                  type="button"
                  $block
                  onClick={() => changerStatut('disponibilites_a_verifier')}
                  disabled={changementEnCours}
                >
                  <ClipboardCheck size={16} />
                  Vérifier disponibilités
                </Btn>
              )}

              {demande.statut === 'disponibilites_a_verifier' && (
                <Btn
                  type="button"
                  $block
                  $variant="success"
                  onClick={() => changerStatut('confirmee')}
                  disabled={changementEnCours}
                >
                  <CheckCircle2 size={16} />
                  Confirmer directement
                </Btn>
              )}

              {demande.statut === 'proposition_a_valider' && (
                <Btn
                  type="button"
                  $block
                  $variant="success"
                  onClick={() => changerStatut('confirmee')}
                  disabled={changementEnCours}
                >
                  <CheckCircle2 size={16} />
                  Confirmer la réservation
                </Btn>
              )}

              {demande.statut !== 'annulee' && demande.statut !== 'confirmee' && (
                <Btn
                  type="button"
                  $block
                  $variant="danger"
                  onClick={() => changerStatut('annulee')}
                  disabled={changementEnCours}
                >
                  <XCircle size={16} />
                  Annuler la demande
                </Btn>
              )}

              {demande.statut !== 'annulee' &&
                demande.statut !== 'confirmee' &&
                demande.stats_appels &&
                demande.stats_appels.total >= 3 && (
                  <Btn
                    type="button"
                    $block
                    $variant="warning"
                    onClick={() => {
                      const motif = prompt(
                        'Motif :\n\n' +
                        '⚠️ Conditions remplies : ' + demande.stats_appels.total + ' tentatives\n\n' +
                        'Tapez "injoignable" pour confirmer l\'annulation :'
                      );
                      if (motif && motif.toLowerCase().includes('injoignable')) {
                        changerStatut('annulee', 'injoignable');
                      }
                    }}
                    disabled={changementEnCours}
                  >
                    <PhoneOff size={16} />
                    Marquer "injoignable"
                  </Btn>
                )}

              {demande.statut === 'confirmee' && (
                <Btn
                  type="button"
                  $block
                  $variant="danger"
                  onClick={() => changerStatut('annulee')}
                  disabled={changementEnCours}
                >
                  <XCircle size={16} />
                  Annuler (admin)
                </Btn>
              )}

              {demande.statut === 'annulee' && (
                <Btn
                  type="button"
                  $block
                  onClick={() => changerStatut('a_contacter')}
                  disabled={changementEnCours}
                >
                  <RotateCcw size={16} />
                  Réouvrir la demande
                </Btn>
              )}
            </ActionsRapides>
          </Card>

          {/* Propositions */}
          <Card titre="Propositions" Icon={FileText}>
            {(demande.statut === 'disponibilites_a_verifier' ||
              demande.statut === 'proposition_a_valider') && (
              <CreerWrap>
                <Btn
                  type="button"
                  $block
                  $variant="violet"
                  onClick={() => setModalProposition(true)}
                >
                  <Plus size={16} />
                  Créer une nouvelle version
                </Btn>
              </CreerWrap>
            )}

            {propositions.length === 0 ? (
              <Vide>Aucune proposition</Vide>
            ) : (
              propositions.map((p) => (
                <PropositionCard key={p.id}>
                  <PropositionHeader>
                    <strong>Version {p.numero_version}</strong>
                    <PropositionTotal>{p.total.toLocaleString('fr-FR')} Ar</PropositionTotal>
                  </PropositionHeader>
                  <PropositionMeta>
                    Créée le {new Date(p.date_creation).toLocaleDateString('fr-FR')}
                    {p.auteur_nom && ` par ${p.auteur_nom}`}
                  </PropositionMeta>
                  {p.ecarts && (
                    <PropositionEcarts>
                      <TrendingUp size={14} />
                      <span>{p.ecarts}</span>
                    </PropositionEcarts>
                  )}

                  {/* Accord */}
                  {p.accord_date ? (
                    <AccordOk>
                      <CheckCircle2 size={15} />
                      <span>
                        Accord client le {new Date(p.accord_date).toLocaleDateString('fr-FR')}
                        {' '}({p.accord_mode})
                        {p.accord_recueilli_par_nom && ` — ${p.accord_recueilli_par_nom}`}
                      </span>
                    </AccordOk>
                  ) : (
                    <Btn
                      type="button"
                      $block
                      $variant="success"
                      $small
                      onClick={() => setModalAccord(p)}
                    >
                      <ClipboardCheck size={15} />
                      Enregistrer l'accord client
                    </Btn>
                  )}

                  {/* Éléments */}
                  {p.elements && p.elements.length > 0 && (
                    <Details>
                      <summary>Voir les {p.elements.length} élément(s)</summary>
                      <ElementListe>
                        {p.elements.map((el) => (
                          <ElementItem key={el.id}>
                            <ElementJour>J{el.jour}</ElementJour>
                            <ElementLibelle>
                              {el.libelle}
                              {el.activite_nom && ` — ${el.activite_nom}`}
                            </ElementLibelle>
                            <ElementPrix>{el.prix.toLocaleString('fr-FR')} Ar</ElementPrix>
                          </ElementItem>
                        ))}
                      </ElementListe>
                    </Details>
                  )}
                </PropositionCard>
              ))
            )}
          </Card>

          {/* Historique */}
          <Card titre="Historique" Icon={History}>
            {demande.evenements && demande.evenements.length > 0 ? (
              demande.evenements.map((e) => (
                <LogItem key={e.id}>
                  <LogHeader>
                    <strong>{e.auteur_nom || 'Système'}</strong>
                    <small>{new Date(e.date_evenement).toLocaleString('fr-FR')}</small>
                  </LogHeader>
                  <p>{e.detail}</p>
                </LogItem>
              ))
            ) : (
              <Vide>Aucun événement</Vide>
            )}
          </Card>
        </Colonne>
      </Grid>

      {/* Modal appel */}
      {modalAppel && (
        <ModalAppel
          onSave={enregistrerAppel}
          onClose={() => setModalAppel(false)}
        />
      )}

      {/* Modal création proposition */}
      {modalProposition && (
        <ModalProposition
          onSave={creerProposition}
          onClose={() => setModalProposition(false)}
        />
      )}

      {/* Modal accord */}
      {modalAccord && (
        <ModalAccord
          proposition={modalAccord}
          onSave={(mode) => enregistrerAccord(modalAccord, mode)}
          onClose={() => setModalAccord(null)}
        />
      )}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Sous-composants                                                    */
/* ------------------------------------------------------------------ */

function Card({ titre, Icon, warning, children }) {
  return (
    <CardBox $warning={warning}>
      <CardTitre $warning={warning}>
        {Icon && <Icon size={17} />}
        {titre}
      </CardTitre>
      <div>{children}</div>
    </CardBox>
  );
}

function Info({ label, valeur }) {
  return (
    <InfoRow>
      <InfoLabel>{label}</InfoLabel>
      <InfoValeur>{valeur}</InfoValeur>
    </InfoRow>
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

function ModalShell({ titre, Icon, onClose, wide, narrow, children }) {
  return (
    <ModalOverlay>
      <ModalBox $wide={wide} $narrow={narrow} role="dialog" aria-modal="true">
        <ModalHeader>
          <ModalTitre>
            {Icon && <Icon size={18} />}
            {titre}
          </ModalTitre>
          <BtnFermer type="button" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </BtnFermer>
        </ModalHeader>
        {children}
      </ModalBox>
    </ModalOverlay>
  );
}

function ModalAppel({ onSave, onClose }) {
  const [resultat, setResultat] = useState('abouti');
  const [resume, setResume] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(resultat, resume);
  };

  return (
    <ModalShell titre="Enregistrer un appel" Icon={PhoneCall} onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <Field>
          <Label>Résultat de l'appel *</Label>
          <Select value={resultat} onChange={(e) => setResultat(e.target.value)} required>
            <option value="abouti">Abouti (client joint)</option>
            <option value="pas_de_reponse">Pas de réponse</option>
            <option value="occupe">Occupé</option>
            <option value="numero_invalide">Numéro invalide</option>
            <option value="rappel_demande">Rappel demandé</option>
          </Select>
        </Field>

        <Field>
          <Label>Résumé (optionnel)</Label>
          <Textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Ex: Client préfère être rappelé le matin..."
            rows="3"
          />
        </Field>

        <ModalFooter>
          <Btn type="button" $variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          <Btn type="submit">Enregistrer</Btn>
        </ModalFooter>
      </Form>
    </ModalShell>
  );
}

function ModalProposition({ onSave, onClose }) {
  const [elements, setElements] = useState([
    { jour: 1, libelle: '', prix: 0, duree_min: 0 }
  ]);

  const ajouterElement = () => {
    setElements(prev => [
      ...prev,
      { jour: 1, libelle: '', prix: 0, duree_min: 0 }
    ]);
  };

  const modifierElement = (index, field, value) => {
    setElements(prev => {
      const copie = [...prev];
      copie[index] = { ...copie[index], [field]: value };
      return copie;
    });
  };

  const supprimerElement = (index) => {
    if (elements.length === 1) return;
    setElements(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const elementsValides = elements.filter(el => el.libelle.trim() !== '');
    if (elementsValides.length === 0) {
      alert('Veuillez ajouter au moins un élément');
      return;
    }
    onSave({ elements: elementsValides });
  };

  const total = elements.reduce((sum, el) => sum + (el.prix || 0), 0);

  return (
    <ModalShell titre="Créer une nouvelle proposition" Icon={FileText} onClose={onClose} wide>
      <Form onSubmit={handleSubmit}>
        <Hint>
          Modifiez les éléments du programme. Le prix total sera recalculé automatiquement.
        </Hint>

        {elements.map((el, index) => (
          <ElementForm key={index}>
            <ElementFormGrid>
              <Field>
                <Label>Jour</Label>
                <Input
                  type="number"
                  value={el.jour}
                  onChange={(e) => modifierElement(index, 'jour', parseInt(e.target.value) || 1)}
                  min="1"
                />
              </Field>
              <Field>
                <Label>Libellé *</Label>
                <Input
                  type="text"
                  value={el.libelle}
                  onChange={(e) => modifierElement(index, 'libelle', e.target.value)}
                  placeholder="Ex: Visite de la Grotte d'Anjohibe"
                  required
                />
              </Field>
              <Field>
                <Label>Prix (Ar) *</Label>
                <Input
                  type="number"
                  value={el.prix}
                  onChange={(e) => modifierElement(index, 'prix', parseInt(e.target.value) || 0)}
                  required
                />
              </Field>
              <Field>
                <Label>Durée (min)</Label>
                <Input
                  type="number"
                  value={el.duree_min}
                  onChange={(e) => modifierElement(index, 'duree_min', parseInt(e.target.value) || 0)}
                />
              </Field>
              <BtnSuppr
                type="button"
                onClick={() => supprimerElement(index)}
                disabled={elements.length === 1}
                title="Supprimer"
                aria-label="Supprimer l'élément"
              >
                <Trash2 size={16} />
              </BtnSuppr>
            </ElementFormGrid>
          </ElementForm>
        ))}

        <AjouterWrap>
          <Btn type="button" $variant="outline" onClick={ajouterElement}>
            <Plus size={16} />
            Ajouter un élément
          </Btn>
        </AjouterWrap>

        <TotalProposition>
          <span>Total estimé</span>
          <strong>{total.toLocaleString('fr-FR')} Ar</strong>
        </TotalProposition>

        <ModalFooter>
          <Btn type="button" $variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          <Btn type="submit">Créer la proposition</Btn>
        </ModalFooter>
      </Form>
    </ModalShell>
  );
}

function ModalAccord({ proposition, onSave, onClose }) {
  const [mode, setMode] = useState('telephone');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(mode);
  };

  return (
    <ModalShell titre="Enregistrer l'accord client" Icon={ClipboardCheck} onClose={onClose} narrow>
      <Form onSubmit={handleSubmit}>
        <Hint>
          Version {proposition.numero_version} — Total : {proposition.total.toLocaleString('fr-FR')} Ar
        </Hint>

        <Field>
          <Label>Mode d'accord *</Label>
          <Select value={mode} onChange={(e) => setMode(e.target.value)} required>
            <option value="telephone">Téléphone</option>
            <option value="ecrit">Écrit (email, SMS)</option>
            <option value="en_ligne">En ligne (page de suivi)</option>
          </Select>
        </Field>

        <ModalFooter>
          <Btn type="button" $variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          <Btn type="submit">Enregistrer l'accord</Btn>
        </ModalFooter>
      </Form>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

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

const BTN_VARIANTS = {
  primary: { bg: '#2f6fd6', hover: '#2760bf', fg: '#fff', border: 'transparent' },
  success: { bg: '#16a34a', hover: '#15803d', fg: '#fff', border: 'transparent' },
  danger: { bg: '#fff', hover: '#fef3f2', fg: '#b42318', border: '#fecdca' },
  warning: { bg: '#fff', hover: '#fff6ed', fg: '#b45309', border: '#fed7aa' },
  violet: { bg: '#7c3aed', hover: '#6d28d9', fg: '#fff', border: 'transparent' },
  outline: { bg: '#fff', hover: '#f4f8fc', fg: '#1f4e79', border: '#dbe5f0' },
  ghost: { bg: '#eef2f6', hover: '#e2e9f1', fg: '#1f4e79', border: 'transparent' }
};

const variant = ({ $variant }) => BTN_VARIANTS[$variant || 'primary'];

const Page = styled.div`
  --navy: #1f4e79;
  --accent: #2f6fd6;
  --accent-hover: #2760bf;
  --ink: #1b2a3a;
  --text: #3d4f63;
  --muted: #6b7c8f;
  --border: #dbe5f0;
  --surface: #ffffff;
  --soft: #f4f8fc;

  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif;
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

const Loading = styled.div`
  padding: 64px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
`;

const ErreurBox = styled.div`
  padding: 16px 20px;
  text-align: center;
  font-size: 14px;
  color: #b42318;
  background: #fef3f2;
  border: 1px solid #fecdca;
  border-radius: 12px;
`;

/* ---------- En-tête ---------- */
const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  margin-bottom: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;

  @media (min-width: 640px) {
    padding: 20px 24px;
  }
`;

const Retour = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--muted);
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent);
  }
`;

const Reference = styled.h1`
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--navy);
`;

const ClientLine = styled.p`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  margin: 0;
  font-size: 14px;
  color: var(--muted);

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  color: ${toneFg};
  background: ${toneBg};
  border-radius: 999px;
`;

/* ---------- Grille ---------- */
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 1000px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Colonne = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const CardBox = styled.section`
  padding: 18px 20px;
  background: var(--surface);
  border: 1px solid ${({ $warning }) => ($warning ? '#fed7aa' : 'var(--border)')};
  border-radius: 12px;
`;

const CardTitre = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $warning }) => ($warning ? '#b45309' : 'var(--navy)')};
`;

/* ---------- Informations ---------- */
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  font-size: 14px;
  border-bottom: 1px solid #edf2f8;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  flex-shrink: 0;
  color: var(--muted);
`;

const InfoValeur = styled.span`
  min-width: 0;
  text-align: right;
  font-weight: 600;
  color: var(--ink);
  word-break: break-word;
`;

const Commentaire = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink);
`;

const Vide = styled.p`
  margin: 0;
  font-size: 13px;
  font-style: italic;
  color: #9db0c4;
`;

const AlerteDoublon = styled.p`
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #b45309;
`;

const DoublonItem = styled.div`
  padding: 8px 12px;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--text);
  background: #fff6ed;
  border-radius: 8px;
`;

const DoublonLink = styled(Link)`
  font-weight: 600;
  color: var(--navy);

  &:hover {
    color: var(--accent);
  }
`;

/* ---------- Notes / historique ---------- */
const NoteForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #edf2f8;
`;

const LogItem = styled.div`
  padding: 10px 12px;
  margin-bottom: 8px;
  background: var(--soft);
  border: 1px solid #edf2f8;
  border-radius: 10px;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink);
    word-break: break-word;
  }
`;

const LogHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 12px;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--muted);

  strong {
    color: var(--navy);
  }
`;

/* ---------- Formulaires ---------- */
const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
`;

const controlStyles = `
  width: 100%;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 16px;
  color: #1b2a3a;
  background: #fff;
  border: 1px solid #dbe5f0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: #c5d3e3;
  }

  &:focus {
    border-color: #2f6fd6;
    box-shadow: 0 0 0 4px rgba(47, 111, 214, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 640px) {
    font-size: 14px;
  }
`;

const Input = styled.input`
  ${controlStyles}
`;

const Select = styled.select`
  ${controlStyles}
  cursor: pointer;
`;

const Textarea = styled.textarea`
  ${controlStyles}
  resize: vertical;
`;

/* ---------- Boutons ---------- */
const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({ $block }) => ($block ? '100%' : 'auto')};
  padding: ${({ $small }) => ($small ? '8px 12px' : '10px 16px')};
  font-family: inherit;
  font-size: ${({ $small }) => ($small ? '13px' : '14px')};
  font-weight: 600;
  color: ${(p) => variant(p).fg};
  background: ${(p) => variant(p).bg};
  border: 1px solid ${(p) => variant(p).border};
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: ${(p) => variant(p).hover};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(47, 111, 214, 0.25);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ---------- Actions ---------- */
const ActionsRapides = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const CompteurAppels = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  margin: 14px 0 12px;
  background: var(--soft);
  border: 1px solid #edf2f8;
  border-radius: 10px;
`;

const CompteurItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 11px;
  color: var(--muted);

  strong {
    font-size: 20px;
    line-height: 1.2;
    color: var(--navy);
    font-variant-numeric: tabular-nums;
  }
`;

/* ---------- Propositions ---------- */
const CreerWrap = styled.div`
  margin-bottom: 12px;
`;

const PropositionCard = styled.div`
  padding: 14px;
  margin-bottom: 10px;
  background: var(--soft);
  border: 1px solid var(--border);
  border-radius: 12px;
`;

const PropositionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  color: var(--ink);
`;

const PropositionTotal = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--navy);
  font-variant-numeric: tabular-nums;
`;

const PropositionMeta = styled.div`
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--muted);
`;

const PropositionEcarts = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #b45309;
  background: #fff1e0;
  border-radius: 8px;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const AccordOk = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #0f7a3d;
  background: #e3f8ea;
  border-radius: 8px;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const Details = styled.details`
  margin-top: 10px;

  summary {
    padding: 4px 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--accent);
    cursor: pointer;
  }
`;

const ElementListe = styled.ul`
  list-style: none;
  margin: 0;
  padding: 8px 0 0;
`;

const ElementItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid #e3ebf4;

  &:last-child {
    border-bottom: none;
  }
`;

const ElementJour = styled.span`
  min-width: 30px;
  font-weight: 700;
  color: var(--accent);
`;

const ElementLibelle = styled.span`
  flex: 1;
  min-width: 0;
  color: var(--ink);
`;

const ElementPrix = styled.span`
  flex-shrink: 0;
  font-weight: 600;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
`;

/* ---------- Modales ---------- */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(27, 42, 58, 0.45);
  backdrop-filter: blur(2px);
`;

const ModalBox = styled.div`
  width: 100%;
  max-width: ${({ $wide, $narrow }) => ($wide ? '900px' : $narrow ? '500px' : '560px')};
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(31, 78, 121, 0.25);
`;

const ModalHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid var(--border);

  @media (min-width: 640px) {
    padding: 18px 24px;
  }
`;

const ModalTitre = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--navy);
`;

const BtnFermer = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--muted);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    color: var(--navy);
    background: #eef3f9;
  }
`;

const Form = styled.form`
  padding: 20px;

  @media (min-width: 640px) {
    padding: 24px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  min-width: 0;
`;

const Hint = styled.p`
  margin: 0 0 16px;
  font-size: 13px;
  font-style: italic;
  color: var(--muted);
`;

const ModalFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
`;

const ElementForm = styled.div`
  padding: 12px;
  margin-bottom: 10px;
  background: var(--soft);
  border: 1px solid #edf2f8;
  border-radius: 12px;
`;

const ElementFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
  align-items: end;

  & > div {
    margin-bottom: 0;
  }

  /* Mobile : Jour + Prix | Libellé pleine largeur */
  & > div:nth-child(2) {
    grid-column: 1 / -1;
    order: -1;
  }

  & > button {
    grid-column: 1 / -1;
  }

  @media (min-width: 760px) {
    grid-template-columns: 70px 1fr 130px 110px 40px;

    & > div:nth-child(2) {
      grid-column: auto;
      order: 0;
    }

    & > button {
      grid-column: auto;
    }
  }
`;

const BtnSuppr = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  color: #b42318;
  background: #fff;
  border: 1px solid #fecdca;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background: #fef3f2;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const AjouterWrap = styled.div`
  margin-bottom: 16px;
`;

const TotalProposition = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--text);
  background: #e6f0ff;
  border-radius: 10px;

  strong {
    font-size: 16px;
    color: var(--navy);
    font-variant-numeric: tabular-nums;
  }
`;
