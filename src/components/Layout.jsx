// src/components/Layout.jsx
import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  // Si non connecté, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={styles.container}>
      {/* Bouton Menu pour Mobile (Caché sur PC) */}
      <button 
        onClick={() => setSidebarOuverte(true)} 
        style={styles.btnMenuMobile}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {/* Overlay sombre quand le menu est ouvert sur mobile */}
      {sidebarOuverte && (
        <div 
          onClick={() => setSidebarOuverte(false)} 
          style={styles.overlayMobile}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div 
        style={{
          ...styles.sidebarWrapper,
          transform: sidebarOuverte ? 'translateX(0)' : 'translateX(-100%)'
        }}
        className={`sidebar-wrapper ${sidebarOuverte ? 'open' : ''}`}
      >
        <Sidebar closeMenu={() => setSidebarOuverte(false)} />
      </div>

      {/* Contenu Principal */}
      <div style={styles.main} className="main-content">
        <Header />
        <div style={styles.content} className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    position: 'relative'
  },
  sidebarWrapper: {
    width: '250px',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 1000,
    transition: 'transform 0.3s ease'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease'
  },
  content: {
    flex: 1,
    padding: '24px'
  },
  btnMenuMobile: {
    display: 'none', // Caché par défaut sur PC
    position: 'fixed',
    top: '15px',
    left: '15px',
    zIndex: 1100,
    backgroundColor: '#C0392B',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  },
  overlayMobile: {
    display: 'none',
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
  }
};
