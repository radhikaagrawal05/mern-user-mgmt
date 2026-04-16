import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    ...(isAdmin || isManager ? [{ to: '/users', label: 'Users', icon: '👥' }] : []),
    { to: '/profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
          color: 'white',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 32, height: 32, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👥</div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>UserMS</h1>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#6d6fa0', paddingLeft: '2.5rem' }}>Management System</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: '0.625rem 0.875rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                background: isActive ? 'rgba(167,139,250,0.2)' : 'transparent',
                color: isActive ? '#a78bfa' : '#c4c6e0',
                transition: 'all 0.15s',
              })}
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#8b8cc7', marginBottom: '0.375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
