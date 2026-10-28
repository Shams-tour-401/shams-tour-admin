// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ------------------------------------------------------------------ */
/* Composant                                                          */
/* ------------------------------------------------------------------ */

export default function Login() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false); // purement visuel
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    const result = await login(identifiant, motDePasse);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErreur(result.error);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <Logo>
            <Compass size={22} strokeWidth={2} />
          </Logo>
          <Title>Shams Tour</Title>
          <Subtitle>Espace d'administration</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormTitle>Connexion</FormTitle>
          <FormText>Entrez vos identifiants pour accéder au tableau de bord.</FormText>

          {erreur && (
            <ErrorBox role="alert">
              <AlertCircle size={16} />
              <span>{erreur}</span>
            </ErrorBox>
          )}

          <Field>
            <Label htmlFor="identifiant">Identifiant</Label>
            <InputWrapper>
              <InputIcon>
                <User size={16} />
              </InputIcon>
              <Input
                id="identifiant"
                type="text"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                autoFocus
              />
            </InputWrapper>
          </Field>

          <Field>
            <Label htmlFor="motDePasse">Mot de passe</Label>
            <InputWrapper>
              <InputIcon>
                <Lock size={16} />
              </InputIcon>
              <Input
                id="motDePasse"
                type={afficherMdp ? 'text' : 'password'}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                $withToggle
                required
              />
              <Toggle
                type="button"
                onClick={() => setAfficherMdp((v) => !v)}
                aria-label={afficherMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
              >
                {afficherMdp ? <EyeOff size={16} /> : <Eye size={16} />}
              </Toggle>
            </InputWrapper>
          </Field>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size={16} />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </SubmitButton>

          <Hint>
            Compte de test : <strong>admin</strong> / <strong>admin123</strong>
          </Hint>
        </Form>
      </Card>

      <Footer>© {new Date().getFullYear()} Shams Tour · Madagascar</Footer>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  --accent: #1e3a8a;
  --accent-hover: #1e40af;
  --ink: #0a0a0a;
  --text: #404040;
  --muted: #737373;
  --border: #e5e5e5;
  --surface: #ffffff;
  --bg: #fafafa;
  --danger: #b42318;
  --danger-bg: #fef3f2;
  --danger-border: #fecdca;

  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px 16px;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  background-color: var(--bg);
  background-image:
    radial-gradient(60% 50% at 50% 0%, rgba(30, 58, 138, 0.08), transparent 70%),
    linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px);
  background-size: auto, 48px 48px, 48px 48px;

  &,
  & *,
  & *::before,
  & *::after {
    box-sizing: border-box;
  }

  @media (min-width: 480px) {
    padding: 40px 24px;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 24px 48px -12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 32px 24px 8px;
  text-align: center;

  @media (min-width: 480px) {
    padding-top: 40px;
  }
`;

const Logo = styled.div`
  width: 44px;
  height: 44px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted);
`;

const Form = styled.form`
  padding: 24px;

  @media (min-width: 480px) {
    padding: 24px 32px 32px;
  }
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink);
`;

const FormText = styled.p`
  margin: 4px 0 24px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--danger);
  background: var(--danger-bg);
  border: 1px solid var(--danger-border);
  border-radius: 8px;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  display: flex;
  color: #a3a3a3;
  pointer-events: none;
  transition: color 0.15s ease;

  ${InputWrapper}:focus-within & {
    color: var(--accent);
  }
`;

const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 ${({ $withToggle }) => ($withToggle ? '44px' : '12px')} 0 38px;
  font-family: inherit;
  font-size: 16px; /* évite le zoom auto sur iOS */
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: #b5b5b5;
  }

  &:hover {
    border-color: #d4d4d4;
  }

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.12);
  }

  @media (min-width: 480px) {
    font-size: 14px;
  }
`;

const Toggle = styled.button`
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a3a3a3;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: var(--ink);
    background: #f5f5f5;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--accent-hover);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.25);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2s;
  }
`;

const Hint = styled.p`
  margin: 20px 0 0;
  padding: 10px 12px;
  font-size: 12px;
  text-align: center;
  color: var(--muted);
  background: var(--bg);
  border: 1px dashed var(--border);
  border-radius: 8px;

  strong {
    color: var(--ink);
    font-weight: 600;
  }
`;

const Footer = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
`;
