// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
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
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Compass size={22} strokeWidth={2} />
          </div>
          <h1 className={styles.title}>Shams Tour</h1>
          <p className={styles.subtitle}>Espace d'administration</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.formTitle}>Connexion</h2>
          <p className={styles.formText}>
            Entrez vos identifiants pour accéder au tableau de bord.
          </p>

          {erreur && (
            <div className={styles.error} role="alert">
              <AlertCircle size={16} />
              <span>{erreur}</span>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="identifiant" className={styles.label}>
              Identifiant
            </label>
            <div className={styles.inputWrapper}>
              <User size={16} className={styles.inputIcon} />
              <input
                id="identifiant"
                type="text"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                className={styles.input}
                placeholder="admin"
                autoComplete="username"
                required
                autoFocus
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="motDePasse" className={styles.label}>
              Mot de passe
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="motDePasse"
                type={afficherMdp ? 'text' : 'password'}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className={`${styles.input} ${styles.inputWithToggle}`}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setAfficherMdp((v) => !v)}
                aria-label={afficherMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
              >
                {afficherMdp ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>

          <p className={styles.hint}>
            Compte de test : <strong>admin</strong> / <strong>admin123</strong>
          </p>
        </form>
      </div>

      <p className={styles.footer}>© {new Date().getFullYear()} Shams Tour · Madagascar</p>
    </div>
  );
}
