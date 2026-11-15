// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  LayoutDashboard, ClipboardList, Target, Map, Banknote,
  Users, MapPin, MapPinned, UserCog, Bus, LogOut, X, Settings 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ closeMenu }) {
  const { user, logout } = useAuth();
  const estAdmin = user?.role === 'administrateur';
  
  // ✅ NOUVEL ÉTAT POUR LA MODALE DE DÉCONNEXION
  const [modalDeconnexion, setModalDeconnexion] = useState(false);

  const menuItems = [
    { path: '/dashboard',    label: 'Tableau de bord', Icon: LayoutDashboard, adminSeul: false },
    { path: '/demandes',     label: 'Demandes',        Icon: ClipboardList,   adminSeul: false },
    { path: '/activites',    label: 'Activités',       Icon: Target,          adminSeul: false },
    { path: '/circuits',     label: 'Circuits',        Icon: Map,             adminSeul: false },
    { path: '/tarifs',       label: 'Tarifs',          Icon: Banknote,        adminSeul: false },
    { path: '/prestataires', label: 'Prestataires',    Icon: Users,           adminSeul: false },
    { path: '/destinations', label: 'Destinations',    Icon: MapPin,          adminSeul: false },
    { path: '/lieux',        label: 'Lieux',           Icon: MapPinned,       adminSeul: false },
    { path: '/utilisateurs', label: 'Utilisateurs',    Icon: UserCog,         adminSeul: true  },
    { path: '/trajets',      label: 'Trajets',         Icon: Bus,             adminSeul: false },
    { path: '/compte',       label: 'Mon compte',      Icon: Settings,        adminSeul: false  }, 
  ];

  const menuFiltre = estAdmin ? menuItems : menuItems.filter(i => !i.adminSeul);

  const initiales = (user?.nom_complet || '?')
    .split(' ').filter(Boolean).slice(0, 2)
    .map(m => m[0].toUpperCase()).join('');

  // ✅ GESTION DE LA CONFIRMATION
  const confirmerDeconnexion = () => {
    setModalDeconnexion(false);
    logout();
  };

  return (
    <>
      <Aside>
        <Brand>
          <Logo>S</Logo>
          <div>
            <BrandName>SHAMS TOUR</BrandName>
            <BrandSub>Administration</BrandSub>
          </div>
          <CloseButtonMobile
            type="button"
            onClick={closeMenu}
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </CloseButtonMobile>
        </Brand>

        <Nav aria-label="Navigation principale">
          {menuFiltre.map(({ path, label, Icon }) => (
            <NavItem key={path} to={path} onClick={closeMenu}>
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
          {/* ✅ OUVRE LA MODALE AU LIEU DE DÉCONNECTER DIRECTEMENT */}
          <LogoutButton type="button" onClick={() => setModalDeconnexion(true)}>
            <LogOut size={16} />
            Déconnexion
          </LogoutButton>
        </Footer>
      </Aside>

      {/* ✅ MODALE DE CONFIRMATION */}
      {modalDeconnexion && (
        <ModalOverlay onClick={() => setModalDeconnexion(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <LogOut size={20} />
                Confirmer la déconnexion
              </ModalTitle>
              <ModalClose onClick={() => setModalDeconnexion(false)}>
                <X size={18} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              <p>Voulez-vous vraiment vous déconnecter ?</p>
              <p className="small">Vous devrez vous reconnecter pour accéder à l'administration.</p>
            </ModalBody>
            <ModalFooter>
              <BtnSecondary onClick={() => setModalDeconnexion(false)}>
                Annuler
              </BtnSecondary>
              <BtnDanger onClick={confirmerDeconnexion}>
                <LogOut size={16} />
                Se déconnecter
              </BtnDanger>
            </ModalFooter>
          </ModalBox>
        </ModalOverlay>
      )}
    </>
  );
}

/* ---------------------- Styles ---------------------- */

const Aside = styled.aside`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
  z-index: 100;
  overflow: hidden;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &, & *, & *::before, & *::after { box-sizing: border-box; }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px;
  border-bottom: 1px solid var(--border);
  position: relative;
  flex-shrink: 0;
`;

const Logo = styled.div`
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: 19px; font-weight: 700;
  color: #fff;
  background: #1f4e79;
  border-radius: 10px;
`;

const BrandName = styled.div`
  font-size: 15px; font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
`;

const BrandSub = styled.div`
  margin-top: 1px;
  font-size: 12px;
  color: var(--text-muted);
`;

const CloseButtonMobile = styled.button`
  display: none;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;

  &:hover { color: var(--text-primary); background: var(--bg-soft); }

  @media (max-width: 1024px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

const Nav = styled.nav`
  flex: 1;
  display: flex; flex-direction: column;
  gap: 2px;
  padding: 12px;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
`;

const NavItem = styled(NavLink)`
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  font-size: 14px; font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 10px;
  transition: background-color .15s ease, color .15s ease;

  svg { flex-shrink: 0; color: var(--text-muted); transition: color .15s ease; }

  &:hover { background: var(--bg-soft); color: var(--text-primary); svg { color: var(--text-primary); } }

  &.active {
    color: #2f6fd6; font-weight: 600; background: var(--bg-soft);
    svg { color: #2f6fd6; }
  }

  &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(47,111,214,.3); }
`;

const Footer = styled.div`
  padding: 14px 12px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-soft);
  flex-shrink: 0;
`;

const UserBox = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 0 4px; margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: 13px; font-weight: 700;
  color: #2f6fd6;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 50%;
`;

const UserText = styled.div`min-width: 0;`;

const UserName = styled.div`
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 13px; font-weight: 600; color: var(--text-primary);
`;

const Role = styled.span`
  display: inline-block; margin-top: 3px;
  padding: 1px 8px;
  font-size: 10px; font-weight: 600;
  letter-spacing: .04em; text-transform: uppercase;
  color: ${({ $admin }) => ($admin ? '#b45309' : 'var(--text-secondary)')};
  background: ${({ $admin }) => ($admin ? '#fff1e0' : 'var(--bg-surface)')};
  border-radius: 999px;
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 9px 12px;
  font-family: inherit; font-size: 13px; font-weight: 600;
  color: var(--text-primary); background: var(--bg-surface);
  border: 1px solid var(--border); border-radius: 10px;
  cursor: pointer;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease;

  &:hover { color: #b42318; background: #fef3f2; border-color: #fecdca; }
  &:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(47,111,214,.3); }
`;

/* ---------------------- Styles de la modale ---------------------- */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: var(--bg-surface);
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-soft);
`;

const ModalTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
`;

const ModalClose = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--border);
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;

  p { margin: 0 0 8px; }
  p.small {
    font-size: 13px;
    color: var(--text-muted);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  background: var(--bg-soft);
  border-top: 1px solid var(--border);
`;

const BtnSecondary = styled.button`
  padding: 10px 18px;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: var(--bg-soft);
  }
`;

const BtnDanger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #C0392B;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: #a93226;
  }
`;
