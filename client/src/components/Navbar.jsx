import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const farmerLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/contracts/open', label: 'Browse Contracts' },
    { to: '/contracts/my', label: 'My Contracts' },
  ];

  const agriLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/contracts', label: 'My Contracts' },
    { to: '/contracts/new', label: '+ New Contract' },
    { to: '/ledger', label: 'Payments' },
  ];

  const links = user?.role === 'farmer' ? farmerLinks : agriLinks;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(51,65,85,0.5)',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🌾</span>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem' }}>
            <span className="gradient-text">AgriContract</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {user && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive(link.to) ? 'var(--color-primary)' : 'var(--color-muted)',
                  background: isActive(link.to) ? 'rgba(34,197,94,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem', color: '#fff',
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
            </Link>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
