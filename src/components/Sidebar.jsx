// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ closeMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: '📊 Tableau de bord' },
    { path: '/demandes', label: '📋 Demandes' },
    { path: '/activites', label: '🎯 Activités' },
    { path: '/circuits', label: '🗺️ Circuits' },
    { path: '/tarifs', label: '💰 Tarifs' },
    { path: '/prestataires', label: '👥 Prestataires' },
    { path: '/destinations', label: '📍 Destinations' },
    { path: '/lieux', label: '📌 Lieux' },
    { path: '/utilisateurs', label: '👤 Utilisateurs', adminSeul: true },
    { path: '/trajets', label: '🚐 Trajets' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (closeMenu) closeMenu();
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <h2 style={styles.logoText}>SHAMS TOUR</h2>
        <p style={styles.logoSub}>Administration</p>
        {/* Bouton Fermer pour Mobile */}
        <button onClick={closeMenu} style={styles.btnFermerMobile} className="close-mobile">
          ✕
        </button>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          if (item.adminSeul && user?.role !== 'administrateur') return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              })}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <p style={styles.userInfo}>
          👤 {user?.nom_complet}<br />
          <small style={styles.role}>{user?.role}</small>
        </p>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '250px',
    height: '100vh',
    backgroundColor: '#2C3E50',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
  },
  logoContainer: {
    padding: '24px 20px',
    borderBottom: '1px solid #34495E',
    textAlign: 'center',
    position: 'relative'
  },
  logoText: { color: '#C0392B', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' },
  logoSub: { color: '#95A5A6', fontSize: '12px', marginTop: '4px' },
  btnFermerMobile: {
    display: 'none',
    position: 'absolute',
    top: '20px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer'
  },
  nav: { flex: 1, padding: '16px 0', overflowY: 'auto' },
  navItem: {
    display: 'block',
    padding: '12px 20px',
    color: '#ECF0F1',
    textDecoration: 'none',
    fontSize: '14px'
  },
  navItemActive: { backgroundColor: '#C0392B', color: 'white', borderLeft: '4px solid #D4A574' },
  footer: { padding: '16px 20px', borderTop: '1px solid #34495E', backgroundColor: '#243342' },
  userInfo: { fontSize: '13px', color: '#ECF0F1', marginBottom: '8px' },
  role: { color: '#95A5A6', fontSize: '11px' },
  logoutBtn: {
    width: '100%', padding: '8px', backgroundColor: '#C0392B', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
  }
};
