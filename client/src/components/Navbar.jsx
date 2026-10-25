import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { 
  Sprout, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Receipt, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  AlertTriangle,
  Building2,
  Compass
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/ledger') return location.pathname.startsWith('/ledger');
    return location.pathname.startsWith(path);
  };

  const farmerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/contracts/open', label: 'Browse Offers', icon: Compass },
    { to: '/contracts/my', label: 'My Contracts', icon: FileText },
    { to: '/ledger', label: 'Earnings', icon: Receipt },
  ];

  const agriLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/contracts', label: 'Contracts', icon: FileText },
    { to: '/contracts/new', label: 'New Offer', icon: PlusCircle },
    { to: '/ledger', label: 'Payments', icon: Receipt },
  ];

  const links = user?.role === 'farmer' ? farmerLinks : agriLinks;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(7, 11, 19, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 20px',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
        }}
      >
        {/* Brand Logo */}
        <Link
          to={user ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
            }}
          >
            <Sprout size={22} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'Outfit',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              Agri<span className="gradient-text">Contract</span>
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--color-muted)',
              }}
            >
              CFMS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        {user && (
          <div
            className="desktop-links"
            style={{
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    color: active ? '#ffffff' : 'var(--color-muted)',
                    background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <Icon size={16} color={active ? '#34d399' : '#94a3b8'} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Actions */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Aadhaar Verification Pill */}
            <Link
              to="/verify-aadhaar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 600,
                background: user.aadhaar?.verified
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(245, 158, 11, 0.12)',
                color: user.aadhaar?.verified ? '#34d399' : '#fbbf24',
                border: user.aadhaar?.verified
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(245, 158, 11, 0.3)',
                textDecoration: 'none',
              }}
              title={user.aadhaar?.verified ? 'Aadhaar Verified' : 'Click to Verify Aadhaar'}
            >
              {user.aadhaar?.verified ? (
                <>
                  <ShieldCheck size={13} />
                  <span>UIDAI Verified</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={13} />
                  <span>Verify Aadhaar</span>
                </>
              )}
            </Link>

            {/* Profile Dropdown / Link */}
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '5px 12px 5px 6px',
                borderRadius: 12,
                background: 'rgba(15, 24, 43, 0.6)',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#ffffff',
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: user.role === 'farmer' ? '#34d399' : '#38bdf8',
                    textTransform: 'capitalize',
                  }}
                >
                  {user.role}
                </div>
              </div>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: '0.84rem',
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 6,
              }}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              to="/login"
              className="btn-secondary"
              style={{
                padding: '8px 18px',
                fontSize: '0.88rem',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '0.88rem',
              }}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {user && mobileMenuOpen && (
        <div
          style={{
            padding: '16px 0 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: '0.92rem',
                  color: active ? '#ffffff' : 'var(--color-muted)',
                  background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                }}
              >
                <Icon size={18} color={active ? '#34d399' : '#94a3b8'} />
                {link.label}
              </Link>
            );
          })}
          <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(244, 63, 94, 0.12)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
