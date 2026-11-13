// src/pages/Compte.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { utilisateursService } from '../services/utilisateurs'; // ✅ Import du service
import styled from 'styled-components';

export default function Compte() {
  const { user } = useAuth();
  
  const [motDePasse, setMotDePasse] = useState({
    actuel: '',
    nouveau: '',
    confirmation: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMotDePasse(prev => ({ ...prev, [name]: value }));
  };

  const soumettreMotDePasse = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (motDePasse.nouveau !== motDePasse.confirmation) {
      return setMessage({ type: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
    }
    if (motDePasse.nouveau.length < 6) {
      return setMessage({ type: 'error', text: 'Le mot de passe doit faire au moins 6 caractères.' });
    }

    try {
      setEnvoiEnCours(true);
      
      // ✅ On utilise le service
      await utilisateursService.changerMotDePasse(
        motDePasse.actuel, 
        motDePasse.nouveau
      );
      
      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
      setMotDePasse({ actuel: '', nouveau: '', confirmation: '' });
    } catch (error) {
      console.error(error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Erreur lors de la mise à jour.' 
      });
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <Page>
      <PageHeader>
        <Title>Mon compte</Title>
        <Sub>Gérez vos informations de connexion</Sub>
      </PageHeader>

      <Grid>
        <Card>
          <CardHeader><h3>👤 Informations</h3></CardHeader>
          <CardBody>
            <Row><Label>Nom complet</Label><Valeur>{user?.nom_complet}</Valeur></Row>
            <Row><Label>Identifiant</Label><Valeur>{user?.identifiant}</Valeur></Row>
            <Row><Label>Rôle</Label><Valeur style={{ textTransform: 'capitalize' }}>{user?.role}</Valeur></Row>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3>🔐 Changer de mot de passe</h3></CardHeader>
          <CardBody>
            {message.text && <Alert $type={message.type}>{message.text}</Alert>}
            <form onSubmit={soumettreMotDePasse}>
              <Field>
                <Label>Mot de passe actuel</Label>
                <Input type="password" name="actuel" value={motDePasse.actuel} onChange={handleChange} required />
              </Field>
              <Field>
                <Label>Nouveau mot de passe</Label>
                <Input type="password" name="nouveau" value={motDePasse.nouveau} onChange={handleChange} required minLength={6} />
              </Field>
              <Field>
                <Label>Confirmer le nouveau mot de passe</Label>
                <Input type="password" name="confirmation" value={motDePasse.confirmation} onChange={handleChange} required minLength={6} />
              </Field>
              <BtnPrimaire type="submit" disabled={envoiEnCours}>
                {envoiEnCours ? 'Mise à jour...' : 'Mettre à jour'}
              </BtnPrimaire>
            </form>
          </CardBody>
        </Card>
      </Grid>
    </Page>
  );
}

/* STYLES (inchangés) */
const Page = styled.div` width: 100%; max-width: 100%; `;
const PageHeader = styled.div` margin-bottom: 24px; `;
const Title = styled.h1` margin: 0; font-size: 24px; color: #1f4e79; `;
const Sub = styled.p` margin: 4px 0 0; font-size: 14px; color: #6b7c8f; `;
const Grid = styled.div` display: grid; grid-template-columns: 1fr; gap: 24px; @media (min-width: 1024px) { grid-template-columns: 1fr 1fr; } `;
const Card = styled.div` background: white; border-radius: 12px; border: 1px solid #dbe5f0; overflow: hidden; `;
const CardHeader = styled.div` padding: 16px 20px; border-bottom: 1px solid #dbe5f0; background: #f8fafc; h3 { margin: 0; font-size: 16px; color: #1f4e79; } `;
const CardBody = styled.div` padding: 20px; `;
const Row = styled.div` display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; &:last-child { border-bottom: none; } `;
const Label = styled.span` font-size: 13px; color: #6b7c8f; font-weight: 500; `;
const Valeur = styled.span` font-size: 13px; color: #1b2a3a; font-weight: 600; `;
const Field = styled.div` display: flex; flex-direction: column; margin-bottom: 16px; `;
const Input = styled.input` padding: 10px 12px; border: 1px solid #dbe5f0; border-radius: 8px; font-size: 14px; outline: none; &:focus { border-color: #2f6fd6; } `;
const BtnPrimaire = styled.button` width: 100%; padding: 12px; background: #1f4e79; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; &:hover { background: #163a5a; } &:disabled { background: #7f8c8d; cursor: not-allowed; } `;
const Alert = styled.div` padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; ${({ $type }) => $type === 'error' ? `background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;` : `background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;`} `;
