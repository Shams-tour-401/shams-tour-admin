// src/pages/DemandeDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { demandesService } from '../services/demandes';
import { propositionsService } from '../services/propositions';

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

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (erreur) return <div style={styles.erreur}>{erreur}</div>;
  if (!demande) return <div style={styles.erreur}>Demande non trouvée</div>;

  const statutsDisponibles = [
    { value: 'demande_recue', label: 'Demande reçue' },
    { value: 'a_contacter', label: 'À contacter' },
    { value: 'disponibilites_a_verifier', label: 'Disponibilités à vérifier' },
    { value: 'proposition_a_valider', label: 'Proposition à valider' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'annulee', label: 'Annulée' }
  ];

  return (
    <div>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <Link to="/demandes" style={styles.retour}>← Retour aux demandes</Link>
          <h2 style={styles.reference}>{demande.reference}</h2>
          <p style={styles.client}>
            👤 {demande.nom_client} — 📞 {demande.telephone}
          </p>
        </div>
        <StatutBadge statut={demande.statut} />
      </div>

      <div style={styles.grid}>
        {/* Colonne gauche */}
        <div style={styles.colonne}>
          {/* Critères du voyage */}
          <Card titre="🎒 Critères du voyage">
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
  <Card titre="⚠️ Doublon possible détecté">
    <p style={styles.alerteDoublon}>
      Ce client a {demande.doublons.length} autre(s) demande(s) similaire(s) :
    </p>
    {demande.doublons.map((d) => (
      <div key={d.id} style={styles.doublonItem}>
        <Link to={`/demandes/${d.id}`} style={styles.doublonLink}>
          {d.reference}
        </Link>
        <small>
          {' '}— {new Date(d.date_depart).toLocaleDateString('fr-FR')}
          {' '}({d.statut})
        </small>
      </div>
    ))}
  </Card>
)}

          {/* Commentaire */}
          {demande.commentaire && (
            <Card titre="💬 Commentaire du client">
              <p style={styles.commentaire}>{demande.commentaire}</p>
            </Card>
          )}

          {/* Notes internes */}
          <Card titre="📝 Notes internes">
            <div style={styles.noteForm}>
              <textarea
                value={nouvelleNote}
                onChange={(e) => setNouvelleNote(e.target.value)}
                placeholder="Ajouter une note interne..."
                rows="2"
                style={styles.noteInput}
              />
              <button
                onClick={ajouterNote}
                disabled={!nouvelleNote.trim() || ajoutNoteEnCours}
                style={{
                  ...styles.btnAjouterNote,
                  opacity: (!nouvelleNote.trim() || ajoutNoteEnCours) ? 0.5 : 1
                }}
              >
                {ajoutNoteEnCours ? '...' : '➕ Ajouter la note'}
              </button>
            </div>

            {demande.notes && demande.notes.length > 0 ? (
              demande.notes.map((n) => (
                <div key={n.id} style={styles.note}>
                  <div style={styles.noteHeader}>
                    <strong>{n.auteur_nom || 'Système'}</strong>
                    <small>
                      {new Date(n.date_creation).toLocaleString('fr-FR')}
                    </small>
                  </div>
                  <p>{n.texte}</p>
                </div>
              ))
            ) : (
              <p style={styles.vide}>Aucune note</p>
            )}
          </Card>
        </div>

        {/* Colonne droite */}
        <div style={styles.colonne}>
          {/* Actions */}
          <Card titre="⚙️ Actions">
            <label style={styles.label}>Changer le statut :</label>
            <select
              value={demande.statut}
              onChange={(e) => changerStatut(e.target.value)}
              disabled={changementEnCours}
              style={styles.selectStatut}
            >
              {statutsDisponibles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
{/* Compteur d'appels */}
{demande.stats_appels && demande.stats_appels.total > 0 && (
  <div style={styles.compteurAppels}>
    <div style={styles.compteurItem}>
      <strong>{demande.stats_appels.total}</strong>
      <span>tentative(s)</span>
    </div>
    <div style={styles.compteurItem}>
      <strong>{demande.stats_appels.aboutis}</strong>
      <span>aboutie(s)</span>
    </div>
    <div style={styles.compteurItem}>
      <strong>{demande.stats_appels.aujourd_hui}</strong>
      <span>aujourd'hui</span>
    </div>
  </div>
)}
            {/* Bouton appel */}
            <button
              onClick={() => setModalAppel(true)}
              style={styles.btnAppel}
            >
              📞 Enregistrer un appel
            </button>

            {/* Actions rapides selon le statut */}
            <div style={styles.actionsRapides}>
              {demande.statut === 'demande_recue' && (
                <button
                  onClick={() => changerStatut('a_contacter')}
                  style={styles.btnAction}
                  disabled={changementEnCours}
                >
                  📞 Marquer "à contacter"
                </button>
              )}

              {demande.statut === 'a_contacter' && (
                <button
                  onClick={() => changerStatut('disponibilites_a_verifier')}
                  style={styles.btnAction}
                  disabled={changementEnCours}
                >
                  ✅ Vérifier disponibilités
                </button>
              )}

              {demande.statut === 'disponibilites_a_verifier' && (
                <button
                  onClick={() => changerStatut('confirmee')}
                  style={styles.btnActionVert}
                  disabled={changementEnCours}
                >
                  ✅ Confirmer directement
                </button>
              )}

              {demande.statut === 'proposition_a_valider' && (
                <button
                  onClick={() => changerStatut('confirmee')}
                  style={styles.btnActionVert}
                  disabled={changementEnCours}
                >
                  ✅ Confirmer la réservation
                </button>
              )}

              {demande.statut !== 'annulee' && demande.statut !== 'confirmee' && (
                <button
                  onClick={() => changerStatut('annulee')}
                  style={styles.btnActionRouge}
                  disabled={changementEnCours}
                >
                  ❌ Annuler la demande
                </button>
              )}
              {demande.statut !== 'annulee' && 
 demande.statut !== 'confirmee' &&
 demande.stats_appels &&
 demande.stats_appels.total >= 3 && (
  <button
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
    style={styles.btnActionOrange}
    disabled={changementEnCours}
  >
    📵 Marquer "injoignable"
  </button>
)}

              {demande.statut === 'confirmee' && (
                <button
                  onClick={() => changerStatut('annulee')}
                  style={styles.btnActionRouge}
                  disabled={changementEnCours}
                >
                  ❌ Annuler (admin)
                </button>
              )}

              {demande.statut === 'annulee' && (
                <button
                  onClick={() => changerStatut('a_contacter')}
                  style={styles.btnAction}
                  disabled={changementEnCours}
                >
                  🔄 Réouvrir la demande
                </button>
              )}
            </div>
          </Card>

          {/* Propositions */}
          <Card titre="📄 Propositions">
            {(demande.statut === 'disponibilites_a_verifier' ||
              demande.statut === 'proposition_a_valider') && (
              <button
                onClick={() => setModalProposition(true)}
                style={styles.btnCreerProposition}
              >
                ➕ Créer une nouvelle version
              </button>
            )}

            {propositions.length === 0 ? (
              <p style={styles.vide}>Aucune proposition</p>
            ) : (
              propositions.map((p) => (
                <div key={p.id} style={styles.propositionCard}>
                  <div style={styles.propositionHeader}>
                    <strong>Version {p.numero_version}</strong>
                    <span style={styles.propositionTotal}>
                      {p.total.toLocaleString('fr-FR')} Ar
                    </span>
                  </div>
                  <div style={styles.propositionMeta}>
                    <small>
                      Créée le {new Date(p.date_creation).toLocaleDateString('fr-FR')}
                      {p.auteur_nom && ` par ${p.auteur_nom}`}
                    </small>
                  </div>
                  {p.ecarts && (
                    <div style={styles.propositionEcarts}>
                      📊 {p.ecarts}
                    </div>
                  )}

                  {/* Accord */}
                  {p.accord_date ? (
                    <div style={styles.accordOk}>
                      ✅ Accord client le {new Date(p.accord_date).toLocaleDateString('fr-FR')}
                      {' '}({p.accord_mode})
                      {p.accord_recueilli_par_nom && ` — ${p.accord_recueilli_par_nom}`}
                    </div>
                  ) : (
                    <button
                      onClick={() => setModalAccord(p)}
                      style={styles.btnAccord}
                    >
                      📝 Enregistrer l'accord client
                    </button>
                  )}

                  {/* Éléments */}
                  {p.elements && p.elements.length > 0 && (
                    <details style={styles.propositionDetails}>
                      <summary style={styles.propositionSummary}>
                        Voir les {p.elements.length} élément(s)
                      </summary>
                      <ul style={styles.elementListe}>
                        {p.elements.map((el) => (
                          <li key={el.id} style={styles.elementItem}>
                            <span style={styles.elementJour}>J{el.jour}</span>
                            <span style={styles.elementLibelle}>
                              {el.libelle}
                              {el.activite_nom && ` — ${el.activite_nom}`}
                            </span>
                            <span style={styles.elementPrix}>
                              {el.prix.toLocaleString('fr-FR')} Ar
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ))
            )}
          </Card>

          {/* Historique */}
          <Card titre="📅 Historique">
            {demande.evenements && demande.evenements.length > 0 ? (
              demande.evenements.map((e) => (
                <div key={e.id} style={styles.evenement}>
                  <div style={styles.evenementHeader}>
                    <strong>{e.auteur_nom || 'Système'}</strong>
                    <small>
                      {new Date(e.date_evenement).toLocaleString('fr-FR')}
                    </small>
                  </div>
                  <p>{e.detail}</p>
                </div>
              ))
            ) : (
              <p style={styles.vide}>Aucun événement</p>
            )}
          </Card>
        </div>
      </div>

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
    </div>
  );
}

function Card({ titre, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitre}>{titre}</h3>
      <div style={styles.cardContenu}>{children}</div>
    </div>
  );
}

function Info({ label, valeur }) {
  return (
    <div style={styles.info}>
      <span style={styles.infoLabel}>{label} :</span>
      <span style={styles.infoValeur}>{valeur}</span>
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

function ModalAppel({ onSave, onClose }) {
  const [resultat, setResultat] = useState('abouti');
  const [resume, setResume] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(resultat, resume);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>📞 Enregistrer un appel</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Résultat de l'appel *</label>
            <select
              value={resultat}
              onChange={(e) => setResultat(e.target.value)}
              required
              style={styles.input}
            >
              <option value="abouti">✅ Abouti (client joint)</option>
              <option value="pas_de_reponse">📵 Pas de réponse</option>
              <option value="occupe">⏸️ Occupé</option>
              <option value="numero_invalide">❌ Numéro invalide</option>
              <option value="rappel_demande">🔄 Rappel demandé</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Résumé (optionnel)</label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Ex: Client préfère être rappelé le matin..."
              rows="3"
              style={styles.textarea}
            />
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>
              Annuler
            </button>
            <button type="submit" style={styles.btnPrimaire}>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modal, maxWidth: '900px' }}>
        <div style={styles.modalHeader}>
          <h3>📄 Créer une nouvelle proposition</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <p style={styles.hint}>
            Modifiez les éléments du programme. Le prix total sera recalculé automatiquement.
          </p>

          {elements.map((el, index) => (
            <div key={index} style={styles.elementForm}>
              <div style={styles.elementFormGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Jour</label>
                  <input
                    type="number"
                    value={el.jour}
                    onChange={(e) => modifierElement(index, 'jour', parseInt(e.target.value) || 1)}
                    min="1"
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Libellé *</label>
                  <input
                    type="text"
                    value={el.libelle}
                    onChange={(e) => modifierElement(index, 'libelle', e.target.value)}
                    placeholder="Ex: Visite de la Grotte d'Anjohibe"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Prix (Ar) *</label>
                  <input
                    type="number"
                    value={el.prix}
                    onChange={(e) => modifierElement(index, 'prix', parseInt(e.target.value) || 0)}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Durée (min)</label>
                  <input
                    type="number"
                    value={el.duree_min}
                    onChange={(e) => modifierElement(index, 'duree_min', parseInt(e.target.value) || 0)}
                    style={styles.input}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => supprimerElement(index)}
                  style={styles.btnSupprElement}
                  disabled={elements.length === 1}
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={ajouterElement}
            style={styles.btnAjouterElement}
          >
            ➕ Ajouter un élément
          </button>

          <div style={styles.totalProposition}>
            <strong>Total estimé : </strong>
            {total.toLocaleString('fr-FR')} Ar
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>
              Annuler
            </button>
            <button type="submit" style={styles.btnPrimaire}>
              Créer la proposition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalAccord({ proposition, onSave, onClose }) {
  const [mode, setMode] = useState('telephone');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(mode);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modal, maxWidth: '500px' }}>
        <div style={styles.modalHeader}>
          <h3>📝 Enregistrer l'accord client</h3>
          <button onClick={onClose} style={styles.btnFermer}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <p style={styles.hint}>
            Version {proposition.numero_version} — Total : {proposition.total.toLocaleString('fr-FR')} Ar
          </p>

          <div style={styles.field}>
            <label style={styles.label}>Mode d'accord *</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              required
              style={styles.input}
            >
              <option value="telephone">📞 Téléphone</option>
              <option value="ecrit">📧 Écrit (email, SMS)</option>
              <option value="en_ligne">💻 En ligne (page de suivi)</option>
            </select>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.btnSecondaire}>
              Annuler
            </button>
            <button type="submit" style={styles.btnPrimaire}>
              Enregistrer l'accord
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  erreur: {
    padding: '20px', backgroundColor: '#FADBD8', color: '#C0392B',
    borderRadius: '8px', textAlign: 'center'
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 24px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  retour: { fontSize: '13px', color: '#7f8c8d', display: 'block', marginBottom: '8px' },
  reference: { fontSize: '24px', color: '#2C3E50', marginBottom: '4px' },
  client: { fontSize: '14px', color: '#7f8c8d' },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  colonne: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  cardTitre: { fontSize: '15px', color: '#2C3E50', marginBottom: '16px' },
  cardContenu: {},
  info: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '13px'
  },
  infoLabel: { color: '#7f8c8d' },
  infoValeur: { color: '#2C3E50', fontWeight: '600' },
  commentaire: { fontSize: '13px', color: '#2C3E50', lineHeight: '1.6' },
  vide: { fontSize: '13px', color: '#95A5A6', fontStyle: 'italic' },
  note: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '8px'
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px'
  },
  evenement: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '8px'
  },
  evenementHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '4px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#7f8c8d',
    marginBottom: '6px'
  },
  selectStatut: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  actionsRapides: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  btnAction: {
    padding: '10px',
    backgroundColor: '#C0392B',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  btnActionVert: {
    padding: '10px',
    backgroundColor: '#27AE60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  btnActionRouge: {
    padding: '10px',
    backgroundColor: '#E74C3C',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  btnAppel: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3498DB',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px'
  },
  badge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '16px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600'
  },
  noteForm: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #ecf0f1'
  },
  noteInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '8px',
    outline: 'none'
  },
  btnAjouterNote: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#C0392B',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  // Propositions
  btnCreerProposition: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#9B59B6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '12px'
  },
  propositionCard: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '10px',
    border: '1px solid #ecf0f1'
  },
  propositionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  propositionTotal: {
    color: '#C0392B',
    fontWeight: '700',
    fontSize: '14px'
  },
  propositionMeta: {
    fontSize: '11px',
    color: '#95A5A6',
    marginBottom: '6px'
  },
  propositionEcarts: {
    fontSize: '12px',
    color: '#E67E22',
    backgroundColor: '#FEF5E7',
    padding: '4px 8px',
    borderRadius: '4px',
    marginBottom: '8px'
  },
  accordOk: {
    fontSize: '12px',
    color: '#27AE60',
    backgroundColor: '#D5F4E6',
    padding: '6px 10px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  btnAccord: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#27AE60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  propositionDetails: {
    marginTop: '10px'
  },
  propositionSummary: {
    fontSize: '12px',
    color: '#7f8c8d',
    cursor: 'pointer',
    padding: '4px 0'
  },
  elementListe: {
    listStyle: 'none',
    padding: '8px 0 0',
    margin: 0
  },
  elementItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 0',
    fontSize: '12px',
    borderBottom: '1px solid #ecf0f1'
  },
  elementJour: {
    display: 'inline-block',
    minWidth: '30px',
    fontWeight: '700',
    color: '#C0392B'
  },
  elementLibelle: {
    flex: 1,
    color: '#2C3E50'
  },
  elementPrix: {
    color: '#7f8c8d',
    fontWeight: '600'
  },
  // Modal proposition
  elementForm: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '10px'
  },
  elementFormGrid: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 120px 100px 40px',
    gap: '8px',
    alignItems: 'end'
  },
  btnSupprElement: {
    padding: '8px',
    backgroundColor: '#E74C3C',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  btnAjouterElement: {
    padding: '8px 16px',
    backgroundColor: '#3498DB',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px'
  },
  totalProposition: {
    padding: '12px',
    backgroundColor: '#ECF0F1',
    borderRadius: '4px',
    textAlign: 'right',
    fontSize: '14px',
    marginBottom: '16px'
  },
  hint: {
    fontSize: '12px',
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: '16px'
  },
  // Modal
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
  },
  modal: {
    backgroundColor: 'white', borderRadius: '8px', width: '100%',
    maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
  },
  modalHeader: {
    padding: '20px 24px', borderBottom: '1px solid #ecf0f1',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  btnFermer: {
    background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', color: '#7f8c8d'
  },
  form: { padding: '24px' },
  field: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
  input: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '14px', outline: 'none'
  },
  textarea: {
    padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px'
  },
  btnPrimaire: {
    padding: '10px 20px', backgroundColor: '#C0392B', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  btnSecondaire: {
    padding: '10px 20px', backgroundColor: '#ECF0F1', color: '#2C3E50',
    border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
alerteDoublon: {
  fontSize: '13px',
  color: '#E67E22',
  marginBottom: '10px',
  fontWeight: '600'
},
doublonItem: {
  padding: '6px 10px',
  backgroundColor: '#FEF5E7',
  borderRadius: '4px',
  marginBottom: '6px',
  fontSize: '13px'
},
doublonLink: {
  color: '#C0392B',
  fontWeight: '600'
},
compteurAppels: {
  display: 'flex',
  gap: '16px',
  padding: '12px',
  backgroundColor: '#ECF0F1',
  borderRadius: '6px',
  marginBottom: '12px'
},
compteurItem: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: '11px',
  color: '#7f8c8d'
},

btnActionOrange: {
  padding: '10px',
  backgroundColor: '#E67E22',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '8px'
},

};