// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>SHAMS TOUR</h1>
          <p style={styles.subtitle}>Administration</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>Connexion</h2>

          {erreur && (
            <div style={styles.error}>{erreur}</div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Identifiant</label>
            <input
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              style={styles.input}
              placeholder="admin"
              required
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p style={styles.hint}>
            💡 Compte de test : <strong>admin</strong> / <strong>admin123</strong>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C3E50',
    padding: '20px'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
  header: {
    backgroundColor: '#C0392B',
    padding: '24px',
    textAlign: 'center',
    color: 'white'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '2px'
  },
  subtitle: {
    fontSize: '13px',
    opacity: 0.9,
    marginTop: '4px'
  },
  form: {
    padding: '32px 24px'
  },
  formTitle: {
    fontSize: '18px',
    color: '#2C3E50',
    marginBottom: '24px',
    textAlign: 'center'
  },
  error: {
    backgroundColor: '#FADBD8',
    color: '#C0392B',
    padding: '10px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    marginBottom: '16px',
    border: '1px solid #E74C3C'
  },
  field: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#C0392B',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '8px',
    transition: 'background-color 0.2s'
  },
  hint: {
    fontSize: '12px',
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: '20px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  }
};