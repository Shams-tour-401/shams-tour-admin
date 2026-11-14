// src/components/Header.jsx
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const titres = {
    '/dashboard': 'Tableau de bord',
    '/demandes': 'Demandes de réservation',
    '/activites': 'Activités',
    '/circuits': 'Circuits',
    '/tarifs': 'Tarifs',
    '/destinations': 'Destinations',
    '/lieux': 'Lieux',
    '/trajets': 'Trajets',
    '/compte': 'Mon compte'
  };

  const titre = titres[location.pathname] || 
    (location.pathname.startsWith('/demandes/') ? 'Détail de la demande' : 'Administration');

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>{titre}</h1>
      <div style={styles.droite}>
        <div style={styles.date}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        {/* ✅ BOUTON DE BASCULE DE THÈME */}
        <button
          onClick={toggleTheme}
          style={styles.btnTheme}
          title={theme === 'clair' ? 'Passer en mode sombre' : 'Passer en mode clair'}
        >
          {theme === 'clair' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'var(--bg-surface)',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 2px var(--shadow)',
    width: '100%',
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  },
  title: {
    fontSize: '20px',
    color: 'var(--text-primary)',
    fontWeight: '600',
    margin: 0,
    transition: 'color 0.3s ease'
  },
  droite: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  date: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textTransform: 'capitalize'
  },
  btnTheme: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-soft)',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, border-color 0.2s'
  }
};
