// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const estAdmin = user?.role === 'administrateur';

  // Menu selon le rôle
  const menuItems = [
    { path: '/dashboard', label: '📊 Tableau de bord', adminSeul: false },
    { path: '/demandes', label: '📋 Demandes', adminSeul: false },
    { path: '/activites', label: '🎯 Activités', adminSeul: false },
    { path: '/circuits', label: '🗺️ Circuits', adminSeul: false },
    { path: '/tarifs', label: '💰 Tarifs', adminSeul: false },
    { path: '/prestataires', label: '👥 Prestataires', adminSeul: false },
    { path: '/destinations', label: '📍 Destinations', adminSeul: false },
    { path: '/lieux', label: '📌 Lieux', adminSeul: false },
    { path: '/trajets', label: '🚐 Trajets', adminSeul: false }
  ];

  // Filtrer selon le rôle
  const menuFiltre = estAdmin
    ? menuItems
    : menuItems.filter(item => !item.adminSeul);

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <h2 style={styles.logoText}>SHAMS TOUR</h2>
        <p style={styles.logoSub}>Administration</p>
      </div>

      <nav style={styles.nav}>
        {menuFiltre.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {})
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        <p style={styles.userInfo}>
          👤 {user?.nom_complet}<br />
          <small style={{
            ...styles.role,
            color: estAdmin ? '#D4A574' : '#95A5A6'
          }}>
            {user?.role}
          </small>
        </p>
        <button onClick={logout} style={styles.logoutBtn}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '250px',
    height: '100vh',
    backgroundColor: '#2C3E50',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100
  },
  logo: {
    padding: '24px 20px',
    borderBottom: '1px solid #34495E',
    textAlign: 'center'
  },
  logoText: {
    color: '#C0392B',
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  logoSub: {
    color: '#95A5A6',
    fontSize: '12px',
    marginTop: '4px'
  },
  nav: {
    flex: 1,
    padding: '16px 0',
    overflowY: 'auto'
  },
  navItem: {
    display: 'block',
    padding: '12px 20px',
    color: '#ECF0F1',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    fontSize: '14px'
  },
  navItemActive: {
    backgroundColor: '#C0392B',
    color: 'white',
    borderLeft: '4px solid #D4A574'
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #34495E',
    backgroundColor: '#243342'
  },
  userInfo: {
    fontSize: '13px',
    color: '#ECF0F1',
    marginBottom: '8px'
  },
  role: {
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#C0392B',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'bold'
  }
};