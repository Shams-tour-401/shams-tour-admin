// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  const ouvrirSidebar = () => setSidebarOuverte(true);
  const fermerSidebar = () => setSidebarOuverte(false);

  // 🔒 Fermer avec Échap
  useEffect(() => {
    if (!sidebarOuverte) return;
    const onKey = (e) => {
      if (e.key === 'Escape') fermerSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOuverte]);

  // 🚫 Bloquer le scroll du body quand menu ouvert
  useEffect(() => {
    document.body.style.overflow = sidebarOuverte ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOuverte]);

  // 📐 Fermer si on repasse en desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1025px)');
    const onChange = (e) => { if (e.matches) fermerSidebar(); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        html, body, #root {
          height: 100%;
          margin: 0;
          overflow-x: hidden;
        }

        .layout-container {
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          background: #f5f8fb;
          width: 100%;
        }

        /* ----- Sidebar wrapper (desktop) ----- */
        .sidebar-wrapper {
          flex: 0 0 250px;
          width: 250px;
          height: 100vh;
          height: 100dvh;
          position: sticky;
          top: 0;
          z-index: 200;
          transition: transform 0.28s ease;
        }
        .sidebar-wrapper > aside {
          width: 100%;
          height: 100%;
          position: relative !important;
        }

        /* ----- Contenu principal ----- */
        .main-content {
          flex: 1 1 0%;
          width: 0; /* ✅ ASTUCE : force la prise de tout l'espace restant */
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        
        .content-area {
          flex: 1;
          padding: 24px;
          width: 100%;
        }

        /* ----- Hamburger (caché desktop) ----- */
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 1000;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid #dbe5f0;
          background: #fff;
          color: #1f4e79;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 0;
          align-items: center;
          justify-content: center;
        }
        .mobile-menu-btn:hover { background: #f4f8fc; }

        /* ----- Overlay ----- */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          z-index: 150;
          -webkit-tap-highlight-color: transparent;
        }

        /* ============= MOBILE / TABLETTE ============= */
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: inline-flex; }
          .mobile-overlay  { display: block; }

          .sidebar-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            height: 100dvh;
            width: 260px;
            max-width: 85vw;
            flex: none;
            transform: translateX(-100%);
            transition: transform 0.28s ease;
            z-index: 200;
            box-shadow: none;
          }
          .sidebar-wrapper.open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(15, 23, 42, 0.15);
          }

          .main-content {
            width: 100%;
            flex: 1 1 100%;
          }
          .content-area {
            padding: 76px 16px 24px;
          }
        }

        /* ============= PETIT MOBILE ============= */
        @media (max-width: 480px) {
          .content-area    { padding: 72px 12px 20px; }
          .sidebar-wrapper { width: 86vw; max-width: 320px; }
        }
      `}</style>

      <div className="layout-container">
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

        {sidebarOuverte && (
          <div
            onClick={fermerSidebar}
            className="mobile-overlay"
            aria-hidden="true"
          />
        )}

        <div
          id="app-sidebar"
          className={`sidebar-wrapper ${sidebarOuverte ? 'open' : ''}`}
        >
          <Sidebar closeMenu={fermerSidebar} />
        </div>

        <div className="main-content">
          <Header />
          <div className="content-area">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
