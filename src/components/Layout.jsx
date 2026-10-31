import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout-container">
      {/* Bouton Menu (visible uniquement sur mobile) */}
      <button 
        onClick={() => setSidebarOuverte(true)} 
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {/* Overlay sombre (visible uniquement sur mobile quand le menu est ouvert) */}
      {sidebarOuverte && (
        <div 
          onClick={() => setSidebarOuverte(false)} 
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${sidebarOuverte ? 'open' : ''}`}>
        <Sidebar closeMenu={() => setSidebarOuverte(false)} />
      </div>

      {/* Contenu Principal */}
      <div className="main-content">
        <Header />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
