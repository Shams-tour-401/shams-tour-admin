// src/components/ProtegeAdmin.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtegeAdmin({ children }) {
  const { user } = useAuth();

  if (user?.role !== 'administrateur') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}