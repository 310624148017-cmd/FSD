import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Sparkles, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  X, 
  Server, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Info
} from 'lucide-react';
import api from '../api/axios';

export const DataModeModal = ({ isOpen, onClose }) => {
  const [hideDemo, setHideDemo] = useState(() => localStorage.getItem('cfm_hide_demo_data') === 'true');
  const [dbStatus, setDbStatus] = useState({ checking: true, connected: false });
  const [counts, setCounts] = useState({ contracts: 0, updates: 0, ledger: 0 });
  const [copied, setCopied] = useState(false);

  const refreshCounts = () => {
    try {
      const c = JSON.parse(localStorage.getItem('cfm_local_contracts') || '[]');
      const u = JSON.parse(localStorage.getItem('cfm_local_updates') || '[]');
      const l = JSON.parse(localStorage.getItem('cfm_local_ledger') || '[]');
      setCounts({ contracts: c.length, updates: u.length, ledger: l.length });
    } catch {
      setCounts({ contracts: 0, updates: 0, ledger: 0 });
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshCounts();
      api.get('/health')
        .then((res) => {
          setDbStatus({ checking: false, connected: Boolean(res.data?.dbConnected) });
        })
        .catch(() => {
          setDbStatus({ checking: false, connected: false });
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleHideDemo = (value) => {
    setHideDemo(value);
    localStorage.setItem('cfm_hide_demo_data', value ? 'true' : 'false');
    window.dispatchEvent(new Event('cfm_datamode_changed'));
  };

  const handleClearLocalData = () => {
    if (window.confirm('Are you sure you want to clear your manual contracts, weekly updates, and ledger disbursements?')) {
      localStorage.removeItem('cfm_local_contracts');
      localStorage.removeItem('cfm_local_updates');
      localStorage.removeItem('cfm_local_ledger');
      refreshCounts();
      window.dispatchEvent(new Event('cfm_datamode_changed'));
    }
  };

  const copyVercelCommand = () => {
    navigator.clipboard.writeText('vercel env add MONGO_URI');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="card fade-in"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0c1322',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(16, 185, 129, 0.15)',
          padding: 28,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0, color: '#ffffff' }}>Data &amp; Database Controls</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.825rem', color: 'var(--color-muted)' }}>
                Control manual data input, simulated sample records, and cloud MongoDB connection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Section 1: Data Mode Toggle */}
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            background: 'rgba(15, 24, 43, 0.8)',
            border: '1px solid var(--color-border)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} color="#10b981" />
                Data Display Mode
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 2 }}>
                Switch between viewing only your real manual entries or including simulated demo records
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              onClick={() => handleToggleHideDemo(true)}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                border: `1.5px solid ${hideDemo ? '#10b981' : 'var(--color-border)'}`,
                background: hideDemo ? 'rgba(16, 185, 129, 0.15)' : 'rgba(10, 16, 28, 0.5)',
                color: hideDemo ? '#ffffff' : 'var(--color-muted)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: hideDemo ? '#34d399' : '#ffffff', marginBottom: 4 }}>
                ⚡ Manual Data Only
              </div>
              <div style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                Hides simulated Wheat / Rice samples. Displays only contracts, surveillance, and payments you enter.
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleToggleHideDemo(false)}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                border: `1.5px solid ${!hideDemo ? '#38bdf8' : 'var(--color-border)'}`,
                background: !hideDemo ? 'rgba(56, 189, 248, 0.12)' : 'rgba(10, 16, 28, 0.5)',
                color: !hideDemo ? '#ffffff' : 'var(--color-muted)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: !hideDemo ? '#38bdf8' : '#ffffff', marginBottom: 4 }}>
                🌾 Sample + Manual Data
              </div>
              <div style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                Combines sample demonstration contracts with your custom additions for easy testing.
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Your Manual Records Count & Actions */}
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            background: 'rgba(15, 24, 43, 0.8)',
            border: '1px solid var(--color-border)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Your Stored Manual Entries</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                Permanently saved in browser client storage and synchronized to serverless memory
              </div>
            </div>
            <button
              onClick={handleClearLocalData}
              title="Reset manual records"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} /> Clear My Records
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ padding: '10px 12px', background: 'rgba(10, 16, 28, 0.6)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Contracts</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{counts.contracts}</div>
            </div>
            <div style={{ padding: '10px 12px', background: 'rgba(10, 16, 28, 0.6)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Crop Updates</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{counts.updates}</div>
            </div>
            <div style={{ padding: '10px 12px', background: 'rgba(10, 16, 28, 0.6)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Ledger Payments</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>{counts.ledger}</div>
            </div>
          </div>

          {/* Quick Create Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to="/contracts/new"
              onClick={onClose}
              className="btn-primary"
              style={{ fontSize: '0.825rem', padding: '8px 14px' }}
            >
              <PlusCircle size={15} /> + Draft Real Contract
            </Link>
            <Link
              to="/ledger"
              onClick={onClose}
              className="btn-secondary"
              style={{ fontSize: '0.825rem', padding: '8px 14px' }}
            >
              Record Payment
            </Link>
          </div>
        </div>

        {/* Section 3: Cloud Database (MongoDB Atlas) */}
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            background: 'rgba(15, 24, 43, 0.8)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              <Server size={16} color="#38bdf8" />
              Cloud Database (MongoDB Atlas)
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
                background: dbStatus.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: dbStatus.connected ? '#34d399' : '#fbbf24',
                border: dbStatus.connected ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
              }}
            >
              {dbStatus.checking
                ? 'Checking...'
                : dbStatus.connected
                ? '● Connected to MongoDB Atlas'
                : '○ Browser & Serverless Store Active'}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: 1.5, margin: '0 0 12px' }}>
            To save all data permanently in MongoDB Atlas cloud rather than local storage:
          </p>

          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(7, 11, 19, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span>vercel env add MONGO_URI</span>
            <button
              type="button"
              onClick={copyVercelCommand}
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? '#34d399' : 'var(--color-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            Or in Vercel Dashboard → Project Settings → <strong>Environment Variables</strong> → Add <code>MONGO_URI</code> with your MongoDB Atlas connection string.
          </div>
        </div>

        {/* Done Button */}
        <div style={{ marginTop: 22, textAlign: 'right' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 24px', fontSize: '0.88rem' }}
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
