// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  LayoutDashboard,
  ClipboardList,
  Target,
  Map,
  Banknote,
  Users,
  MapPin,
  MapPinned,
  UserCog,
  Bus,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const estAdmin = user?.role === 'administrateur';

  // Menu selon le rôle
  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', Icon: LayoutDashboard, adminSeul: false },
    { path: '/demandes', label: 'Demandes', Icon: ClipboardList, adminSeul: false },
    { path: '/activites', label: 'Activités', Icon: Target, adminSeul: false },
    { path: '/circuits', label: 'Circuits', Icon: Map, adminSeul: false },
    { path: '/tarifs', label: 'Tarifs', Icon: Banknote, adminSeul: false },
    { path: '/prestataires', label: 'Prestataires', Icon: Users, adminSeul: false },
    { path: '/destinations', label: 'Destinations', Icon: MapPin, adminSeul: false },
    { path: '/lieux', label: 'Lieux', Icon: MapPinned, adminSeul: false },
    { path: '/utilisateurs', label: 'Utilisateurs', Icon: UserCog, adminSeul: true },
    { path: '/trajets', label: 'Trajets', Icon: Bus, adminSeul: false }
  ];

  // Filtrer selon le rôle
  const menuFiltre = estAdmin
    ? menuItems
    : menuItems.filter(item => !item.adminSeul);

  // Initiales pour l'avatar (purement visuel)
  const initiales = (user?.nom_complet || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0].toUpperCase())
    .join('');

  return (
    <Aside>
      <Brand>
        <Logo>S</Logo>
        <div>
          <BrandName>SHAMS TOUR</BrandName>
          <BrandSub>Administration</BrandSub>
        </div>
      </Brand>

      <Nav aria-label="Navigation principale">
        {menuFiltre.map(({ path, label, Icon }) => (
          <NavItem key={path} to={path}>
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavItem>
        ))}
      </Nav>

      <Footer>
        <UserBox>
          <Avatar>{initiales}</Avatar>
          <UserText>
            <UserName>{user?.nom_complet}</UserName>
            <Role $admin={estAdmin}>{user?.role}</Role>
          </UserText>
        </UserBox>
        <LogoutButton type="button" onClick={logout}>
          <LogOut size={16} />
          Déconnexion
        </LogoutButton>
      </Footer>
    </Aside>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const Aside = styled.aside`
  --navy: #1f4e79;
  --accent: #2f6fd6;
  --ink: #1b2a3a;
  --text: #3d4f63;
  --muted: #6b7c8f;
  --border: #dbe5f0;
  --soft: #f4f8fc;

  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid var(--border);
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  z-index: 100;

  &,
  & *,
  & *::before,
  & *::after {
    box-sizing: border-box;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px;
  border-bottom: 1px solid var(--border);
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 19px;
  font-weight: 700;
  color: #fff;
  background: var(--navy);
  border-radius: 10px;
`;

const BrandName = styled.div`
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--navy);
`;

const BrandSub = styled.div`
  margin-top: 1px;
  font-size: 12px;
  color: var(--muted);
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  overflow-y: auto;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  text-decoration: none;
  border-radius: 10px;
  transition: background-color 0.15s ease, color 0.15s ease;

  svg {
    flex-shrink: 0;
    color: #8fa2b6;
    transition: color 0.15s ease;
  }

  &:hover {
    background: var(--soft);
    color: var(--navy);

    svg {
      color: var(--navy);
    }
  }

  &.active {
    color: var(--navy);
    font-weight: 600;
    background: #e6f0ff;

    svg {
      color: var(--accent);
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(47, 111, 214, 0.3);
  }
`;

const Footer = styled.div`
  padding: 14px 12px 16px;
  border-top: 1px solid var(--border);
  background: var(--soft);
`;

const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
  background: #e6f0ff;
  border: 1px solid #cfe0f7;
  border-radius: 50%;
`;

const UserText = styled.div`
  min-width: 0;
`;

const UserName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
`;

const Role = styled.span`
  display: inline-block;
  margin-top: 3px;
  padding: 1px 8px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $admin }) => ($admin ? '#b45309' : '#4b5d70')};
  background: ${({ $admin }) => ($admin ? '#fff1e0' : '#eef2f6')};
  border-radius: 999px;
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--navy);
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    color: #b42318;
    background: #fef3f2;
    border-color: #fecdca;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(47, 111, 214, 0.3);
  }
`;
