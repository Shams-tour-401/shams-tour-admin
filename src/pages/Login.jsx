// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
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
        <Brand>
          <Logo>S</Logo>
          <div>
            <BrandName>SHAMS TOUR</BrandName>
            <BrandSub>Administration</BrandSub>
          </div>
          <StatusPill>
            <Dot /> En ligne
          </StatusPill>
        </Brand>

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
                <User size={18} />
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
                <Lock size={18} />
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
                {afficherMdp ? <EyeOff size={18} /> : <Eye size={18} />}
              </Toggle>
            </InputWrapper>
          </Field>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size={18} />
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
/* Styles — thème crème / rouge brique (comme l'app M3)               */
/* ------------------------------------------------------------------ */

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  --brand: #b8321f;
  --brand-hover: #a22b1a;
  --brand-soft: #fbeae6;
  --ink: #241914;
  --text: #4a3f39;
  --muted: #8a7e76;
  --border: #eadfd0;
  --surface: #ffffff;
  --bg: #faf5ec;
  --sun: #fdf0dc;
  --ok: #1e8a3a;
  --danger: #b42318;
  --danger-bg: #fef3f2;
  --danger-border: #fecdca;

  position: relative;
  overflow: hidden;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 24px 16px;
  font-family: Roboto, 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  background: var(--bg);

  /* grand disque chaud en arrière-plan, comme sur la carte « Nouveau » */
  &::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    background: var(--sun);
    pointer-events: none;
  }

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
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 28px;
  box-shadow: 0 2px 4px rgba(120, 70, 40, 0.04), 0 16px 36px rgba(120, 70, 40, 0.1);
  overflow: hidden;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);

  @media (min-width: 480px) {
    padding: 22px 32px;
  }
`;

const Logo = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  background: var(--brand);
  border: 3px solid var(--surface);
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--border), 0 4px 10px rgba(184, 50, 31, 0.25);
`;

const BrandName = styled.div`
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--ink);
`;

const BrandSub = styled.div`
  margin-top: 2px;
  font-size: 13px;
  color: var(--muted);
`;

const StatusPill = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ok);
  background: #eaf6ed;
  border-radius: 999px;
  white-space: nowrap;
`;

const Dot = styled.span`
  width: 7px;
  height: 7px;
  background: var(--ok);
  border-radius: 50%;
`;

const Form = styled.form`
  padding: 24px;

  @media (min-width: 480px) {
    padding: 28px 32px 32px;
  }
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--brand);
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
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--danger);
  background: var(--danger-bg);
  border: 1px solid var(--danger-border);
  border-radius: 16px;

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
  margin: 0 0 6px 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.span`
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  display: flex;
  color: #a39689;
  pointer-events: none;
  transition: color 0.15s ease;

  ${InputWrapper}:focus-within & {
    color: var(--brand);
  }
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 ${({ $withToggle }) => ($withToggle ? '48px' : '16px')} 0 46px;
  font-family: inherit;
  font-size: 16px; /* évite le zoom auto sur iOS */
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  outline: none;
  box-shadow: 0 2px 6px rgba(120, 70, 40, 0.05);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: #b8ab9e;
  }

  &:hover {
    border-color: #dccbb5;
  }

  &:focus {
    border-color: var(--brand);
    box-shadow: 0 0 0 4px rgba(184, 50, 31, 0.14);
  }

  @media (min-width: 480px) {
    font-size: 14px;
  }
`;

const Toggle = styled.button`
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a39689;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: var(--brand);
    background: var(--brand-soft);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 50px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: var(--brand);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(184, 50, 31, 0.28);
  transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--brand-hover);
    box-shadow: 0 10px 22px rgba(184, 50, 31, 0.38);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(184, 50, 31, 0.3);
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
  padding: 10px 14px;
  font-size: 12px;
  text-align: center;
  color: var(--muted);
  background: var(--bg);
  border: 1px dashed #dccbb5;
  border-radius: 999px;

  strong {
    color: var(--brand);
    font-weight: 700;
  }
`;

const Footer = styled.p`
  position: relative;
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
`;
