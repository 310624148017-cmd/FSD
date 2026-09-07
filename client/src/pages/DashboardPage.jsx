import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../api/services';
import { StatusBadge } from '../components/StatusBadge';

const StatCard = ({ icon, label, value, color = 'var(--color-primary)' }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color }}>{value}</p>
      </div>
      <span style={{ fontSize: '2rem', opacity: 0.8 }}>{icon}</span>
    </div>
  </div>
);

// ─── Agribusiness Dashboard ───────────────────────────────────────────────────
const AgribusinessDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.agribusiness().then((r) => { setData(r.data.dashboard); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const { stats, recentContracts } = data;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: 24 }}>
        Business Overview
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="📄" label="Total Contracts" value={stats.totalContracts} />
        <StatCard icon="⚡" label="Active" value={stats.activeContracts} color="var(--color-accent)" />
        <StatCard icon="✅" label="Completed" value={stats.completedContracts} color="#2dd4bf" />
        <StatCard icon="🔓" label="Open" value={stats.openContracts} color="var(--color-secondary)" />
        <StatCard icon="👨‍🌾" label="Farmers" value={stats.farmerCount} />
        <StatCard icon="💰" label="Total Paid" value={`₹${(stats.totalPaid || 0).toLocaleString()}`} color="var(--color-primary)" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.1rem' }}>Recent Contracts</h3>
        <Link to="/contracts/new" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>+ New Contract</Link>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>Contract</th><th>Crop</th><th>Quantity</th><th>Farmer</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            {recentContracts.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>No contracts yet. <Link to="/contracts/new" style={{ color: 'var(--color-primary)' }}>Create one →</Link></td></tr>
            ) : recentContracts.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 600 }}>{c.title}</td>
                <td>{c.cropType}</td>
                <td>{c.requiredQuantityTons} tons</td>
                <td>{c.farmer?.name || <span style={{ color: 'var(--color-muted)' }}>Unassigned</span>}</td>
                <td><StatusBadge status={c.status} /></td>
                <td><Link to={`/contracts/${c._id}`} style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Farmer Dashboard ─────────────────────────────────────────────────────────
const FarmerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.farmer().then((r) => { setData(r.data.dashboard); setLoading(false); });
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const { stats, recentUpdates, pendingPayments } = data;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: 24 }}>Farm Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="📄" label="My Contracts" value={stats.totalContracts} />
        <StatCard icon="⚡" label="Active" value={stats.activeContracts} color="var(--color-accent)" />
        <StatCard icon="✅" label="Completed" value={stats.completedContracts} color="#2dd4bf" />
        <StatCard icon="🔓" label="Open Offers" value={stats.openContracts} color="var(--color-secondary)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Updates */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1rem' }}>Recent Crop Updates</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentUpdates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No updates yet</div>
            ) : recentUpdates.map((u) => (
              <div key={u._id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.contract?.title}</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>Week {u.weekNumber}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  Health: <span style={{ color: 'var(--color-text)' }}>{u.cropHealth}</span> ·
                  Yield est: <span style={{ color: 'var(--color-primary)' }}>{u.estimatedYieldTons}t</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Pending Payments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingPayments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>All payments settled ✓</div>
            ) : pendingPayments.map((c) => (
              <div key={c._id} className="card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>{c.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Paid: <span style={{ color: 'var(--color-primary)' }}>₹{c.amountPaid.toLocaleString()}</span></span>
                  <span style={{ color: 'var(--color-muted)' }}>Total: ₹{c.totalValue?.toLocaleString()}</span>
                </div>
                <div style={{ marginTop: 8, height: 6, background: 'var(--color-border)', borderRadius: 3 }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', width: `${Math.min(100, (c.amountPaid / c.totalValue) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DashboardPage ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
          <span className="gradient-text">{user?.name}</span> 👋
        </h1>
        <p style={{ color: 'var(--color-muted)', marginTop: 4 }}>
          {user?.role === 'agribusiness' ? 'Manage your contracts and track farmer progress.' : 'Track your contracts, crops, and incoming payments.'}
        </p>
      </div>

      {user?.role === 'agribusiness' ? <AgribusinessDashboard /> : <FarmerDashboard />}
    </div>
  );
};

export default DashboardPage;
