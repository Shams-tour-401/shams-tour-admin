// src/components/Header.jsx
import { useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  const titres = {
    '/dashboard': 'Tableau de bord',
    '/demandes': 'Demandes de réservation',
    '/activites': 'Activités',
    '/circuits': 'Circuits',
    '/tarifs': 'Tarifs',
    '/destinations': 'Destinations',
    '/lieux': 'Lieux',
    '/trajets': 'Trajets'
  };

  const titre = titres[location.pathname] || 
    (location.pathname.startsWith('/demandes/') ? 'Détail de la demande' : 'Administration');

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>{titre}</h1>
      <div style={styles.date}>
        {new Date().toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'white',
    padding: '16px 24px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  title: {
    fontSize: '20px',
    color: '#2C3E50',
    fontWeight: '600'
  },
  date: {
    fontSize: '13px',
    color: '#7f8c8d',
    textTransform: 'capitalize'
  }
};