import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../utils/AuthContext';
import Overview from './Overview';
import Lessons from './Lessons';
import Users from './Users';
import Settings from './Settings';
import { Menu, X, Home, BookOpen, Users as UsersIcon, Settings as SettingsIcon } from 'lucide-react';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const Sidebar = styled.div`
  width: ${({ $collapsed }) => ($collapsed ? '80px' : '250px')};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-right: 1px solid ${({ theme }) => theme.colors.neutral.light};
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'space-between')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.light};
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
  display: ${({ $collapsed }) => ($collapsed ? 'none' : 'block')};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Nav = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary.main : theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral.light};
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const NavIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: ${({ $collapsed }) => ($collapsed ? '0' : '12px')};
`;

const NavText = styled.span`
  display: ${({ $collapsed }) => ($collapsed ? 'none' : 'block')};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
`;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/admin', icon: <Home size={20} />, text: 'Overview' },
    { path: '/admin/lessons', icon: <BookOpen size={20} />, text: 'Lessons' },
    { path: '/admin/users', icon: <UsersIcon size={20} />, text: 'Users' },
    { path: '/admin/settings', icon: <SettingsIcon size={20} />, text: 'Settings' }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <DashboardContainer>
      <Sidebar $collapsed={collapsed}>
        <SidebarHeader $collapsed={collapsed}>
          <Logo $collapsed={collapsed}>Admin</Logo>
          <ToggleButton onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </ToggleButton>
        </SidebarHeader>
        <Nav>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              $active={location.pathname === item.path}
              onClick={() => handleNavClick(item.path)}
            >
              <NavIcon $collapsed={collapsed}>{item.icon}</NavIcon>
              <NavText $collapsed={collapsed}>{item.text}</NavText>
            </NavItem>
          ))}
        </Nav>
      </Sidebar>
      <MainContent>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard; 