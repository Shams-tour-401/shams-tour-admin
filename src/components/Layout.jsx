// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  const ouvrirSidebar = () => setSidebarOuverte(true);
  const fermerSidebar = () => setSidebarOuverte(false);

  // 🔒 Fermer avec la touche Échap (UX mobile)
  useEffect(() => {
    if (!sidebarOuverte) return;
    const onKey = (e) => {
      if (e.key === 'Escape') fermerSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOuverte]);

  // 🚫 Bloquer le scroll du body quand le menu est ouvert (mobile)
  useEffect(() => {
    document.body.style.overflow = sidebarOuverte ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOuverte]);

  // 📐 Fermer automatiquement si on repasse en desktop (≥ 1025px)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1025px)');
    const onChange = (e) => {
      if (e.matches) fermerSidebar();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // ⛔ Redirection si non connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout-container">
      {/* Bouton hamburger — visible uniquement sur mobile/tablette */}
      <button
        type="button"
        onClick={ouvrirSidebar}
        className="mobile-menu-btn"
        aria-label="Ouvrir le menu de navigation"
        aria-expanded={sidebarOuverte}
        aria-controls="app-sidebar"
      >
        ☰
      </button>

      {/* Overlay sombre — visible uniquement quand le menu est ouvert */}
      {sidebarOuverte && (
        <div
          onClick={fermerSidebar}
          className="mobile-overlay"
          aria-hidden="true"
        />
      )}

      {/* Wrapper de la sidebar (gère l'animation translateX) */}
      <div
        id="app-sidebar"
        className={`sidebar-wrapper ${sidebarOuverte ? 'open' : ''}`}
      >
        <Sidebar closeMenu={fermerSidebar} />
      </div>

      {/* Contenu principal */}
      <div className="main-content">
        <Header />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/* src/components/Layout.css */
* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }

.layout-container {
  display: flex;
  min-height: 100vh;
  background: #f5f8fb;
}

.sidebar-wrapper {
  flex-shrink: 0;
  width: 250px;
  height: 100vh;
  position: sticky;
  top: 0;
  transition: transform 0.25s ease;
  z-index: 200;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-x: auto;
}

.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 14px;
  left: 14px;
  z-index: 300;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #dbe5f0;
  background: #fff;
  color: #1f4e79;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.mobile-menu-btn:hover { background: #f4f8fc; }

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 150;
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-overlay { display: block; }

  .sidebar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    height: 100dvh;
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    z-index: 200;
    box-shadow: none;
  }

  .sidebar-wrapper.open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(15, 23, 42, 0.15);
  }

  .main-content { width: 100%; }

  .content-area {
    padding: 72px 16px 24px;
  }
}

@media (max-width: 480px) {
  .sidebar-wrapper { width: 84vw; max-width: 300px; }
  .content-area { padding: 68px 12px 20px; }
}
