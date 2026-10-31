// src/components/Layout.jsx
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();

  // Si non connecté, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Header />
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '250px'
  },
  content: {
    flex: 1,
    padding: '24px',
    backgroundColor: '#f5f5f5'
  }
};
