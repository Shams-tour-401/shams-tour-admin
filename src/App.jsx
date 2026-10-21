// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtegeAdmin from './components/ProtegeAdmin';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Demandes from './pages/Demandes';
import DemandeDetail from './pages/DemandeDetail';
import Activites from './pages/Activites';
import Circuits from './pages/Circuits';
import Tarifs from './pages/Tarifs';
import Destinations from './pages/Destinations';
import Lieux from './pages/Lieux';
import Trajets from './pages/Trajets';
import Prestataires from './pages/Prestataires';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Demandes : accessibles aux 2 rôles */}
            <Route path="demandes" element={<Demandes />} />
            <Route path="demandes/:id" element={<DemandeDetail />} />
            
            {/* Catalogue : consultation pour tous, modification admin */}
            <Route path="activites" element={<Activites />} />
            <Route path="circuits" element={<Circuits />} />
            <Route path="tarifs" element={<Tarifs />} />
            <Route path="prestataires" element={<Prestataires />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="lieux" element={<Lieux />} />
            <Route path="trajets" element={<Trajets />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;