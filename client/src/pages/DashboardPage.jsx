import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../api/services';
import { StatusBadge } from '../components/StatusBadge';
import { 
  FileText, 
  Activity, 
  CheckCheck, 
  Clock, 
  Users, 
  Coins, 
  PlusCircle, 
  ArrowRight, 
  Sprout, 
  Compass, 
  ShieldCheck, 
  TrendingUp, 
  Receipt,
  Search
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color = '#10b981', bg = 'rgba(16, 185, 129, 0.1)', subtext }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p
          style={{
            color: 'var(--color-muted)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 6px',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            fontFamily: 'Outfit',
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {value}
        </p>
        {subtext && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '6px 0 0' }}>
            {subtext}
          </p>
        )}
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: bg,
          border: `1px solid ${color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}
      >
        <Icon size={22} />
      </div>
    </div>
  </div>
);

// ─── Agribusiness Dashboard ───────────────────────────────────────────────────
const AgribusinessDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setLoading(true);
    const hideDemo = localStorage.getItem('cfm_hide_demo_data') === 'true';

    let locals = [];
    let localLedger = [];
    let localUpdates = [];
    try {
      locals = JSON.parse(localStorage.getItem('cfm_local_contracts') || '[]');
      localLedger = JSON.parse(localStorage.getItem('cfm_local_ledger') || '[]');
      localUpdates = JSON.parse(localStorage.getItem('cfm_local_updates') || '[]');
    } catch {}

    dashboardService
      .agribusiness()
      .then((r) => {
        const serverDash = r.data.dashboard || {};
        const serverContracts = serverDash.recentContracts || [];
        const mergedContracts = hideDemo
          ? locals
          : [...locals, ...serverContracts.filter((c) => !locals.some((l) => l._id === c._id))];

        const totalPaid = hideDemo
          ? localLedger.reduce((a, b) => a + (b.amount || 0), 0)
          : (serverDash.stats?.totalPaid || 0) + localLedger.reduce((a, b) => a + (b.amount || 0), 0);

        setData({
          stats: {
            totalContracts: mergedContracts.length,
            activeContracts: mergedContracts.filter((c) => c.status === 'active').length,
            completedContracts: mergedContracts.filter((c) => c.status === 'completed').length,
            openContracts: mergedContracts.filter((c) => c.status === 'open').length,
            farmerCount: new Set(mergedContracts.map((c) => c.farmer?.name).filter(Boolean)).size || (hideDemo ? 0 : 4),
            totalPaid,
          },
          recentContracts: mergedContracts,
          recentUpdates: hideDemo ? localUpdates : [...localUpdates, ...(serverDash.recentUpdates || [])],
        });
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo data
        const demoContracts = [
          {
            _id: 'demo-c1',
            title: 'Wheat (Sharbati A-Grade) 2024',
            cropType: 'Wheat',
            requiredQuantityTons: 100,
            farmer: { name: 'Rajesh Kumar' },
            status: 'active',
            totalValue: 2500000,
            amountPaid: 1000000,
          },
          {
            _id: 'demo-c2',
            title: 'Basmati Rice Export Standard',
            cropType: 'Basmati Rice',
            requiredQuantityTons: 80,
            farmer: { name: 'Harpreet Singh' },
            status: 'accepted',
            totalValue: 3200000,
            amountPaid: 450000,
          },
          {
            _id: 'demo-c3',
            title: 'Organic Cotton Kharif Season',
            cropType: 'Cotton',
            requiredQuantityTons: 40,
            farmer: null,
            status: 'open',
            totalValue: 1800000,
            amountPaid: 0,
          },
          {
            _id: 'demo-c4',
            title: 'Mustard Seeds Winter Harvest',
            cropType: 'Mustard',
            requiredQuantityTons: 50,
            farmer: { name: 'Gurpreet Gill' },
            status: 'completed',
            totalValue: 1500000,
            amountPaid: 1500000,
          },
        ];

        const mergedContracts = hideDemo
          ? locals
          : [...locals, ...demoContracts.filter((c) => !locals.some((l) => l._id === c._id))];

        const totalPaid = (hideDemo ? 0 : 1450000) + localLedger.reduce((a, b) => a + (b.amount || 0), 0);

        setData({
          stats: {
            totalContracts: mergedContracts.length,
            activeContracts: mergedContracts.filter((c) => c.status === 'active').length,
            completedContracts: mergedContracts.filter((c) => c.status === 'completed').length,
            openContracts: mergedContracts.filter((c) => c.status === 'open').length,
            farmerCount: new Set(mergedContracts.map((c) => c.farmer?.name).filter(Boolean)).size || (hideDemo ? 0 : 4),
            totalPaid,
          },
          recentContracts: mergedContracts,
          recentUpdates: hideDemo ? localUpdates : localUpdates,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    const handleModeChange = () => loadData();
    window.addEventListener('cfm_datamode_changed', handleModeChange);
    return () => window.removeEventListener('cfm_datamode_changed', handleModeChange);
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const { stats, recentContracts } = data;

  const filteredContracts = recentContracts.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.farmer?.name && c.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      {/* 6 Stat Metric Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          icon={FileText}
          label="Total Contracts"
          value={stats.totalContracts}
          color="#38bdf8"
          bg="rgba(56, 189, 248, 0.12)"
          subtext="Under management"
        />
        <StatCard
          icon={Activity}
          label="In Cultivation"
          value={stats.activeContracts}
          color="#10b981"
          bg="rgba(16, 185, 129, 0.12)"
          subtext="Weekly updates active"
        />
        <StatCard
          icon={CheckCheck}
          label="Completed"
          value={stats.completedContracts}
          color="#2dd4bf"
          bg="rgba(45, 212, 191, 0.12)"
          subtext="Harvests settled"
        />
        <StatCard
          icon={Clock}
          label="Open Offers"
          value={stats.openContracts}
          color="#a78bfa"
          bg="rgba(167, 139, 250, 0.12)"
          subtext="Awaiting farmer bids"
        />
        <StatCard
          icon={Users}
          label="Partner Farmers"
          value={stats.farmerCount}
          color="#fb923c"
          bg="rgba(249, 115, 22, 0.12)"
          subtext="Assigned producers"
        />
        <StatCard
          icon={Coins}
          label="Capital Settled"
          value={`₹${(stats.totalPaid || 0).toLocaleString('en-IN')}`}
          color="#34d399"
          bg="rgba(52, 211, 153, 0.12)"
          subtext="Via Escrow / UPI"
        />
      </div>

      {/* Contracts Header & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Contract Portfolio</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Monitor lifecycle status, farmer commitments, and deliverables
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 220 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}
            />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 34, paddingRight: 10, paddingTop: 8, paddingBottom: 8, fontSize: '0.85rem' }}
            />
          </div>
          <Link
            to="/contracts/new"
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.88rem' }}
          >
            <PlusCircle size={16} /> New Contract
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Contract Title</th>
              <th>Crop Variety</th>
              <th>Quantity</th>
              <th>Assigned Farmer</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 48 }}>
                  No contracts matched your search.{' '}
                  <Link to="/contracts/new" style={{ color: 'var(--color-primary)' }}>
                    Draft a new contract →
                  </Link>
                </td>
              </tr>
            ) : (
              filteredContracts.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{c.title}</td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.05)',
                        fontSize: '0.825rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      🌾 {c.cropType}
                    </span>
                  </td>
                  <td>{c.requiredQuantityTons} tons</td>
                  <td>
                    {c.farmer?.name ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }} />
                        {c.farmer.name}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>Open for offers</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    <Link
                      to={`/contracts/${c._id}`}
                      style={{
                        color: 'var(--color-primary-light)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      Manage <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
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

  const loadFarmerData = () => {
    setLoading(true);
    const hideDemo = localStorage.getItem('cfm_hide_demo_data') === 'true';

    let locals = [];
    let localUpdates = [];
    try {
      locals = JSON.parse(localStorage.getItem('cfm_local_contracts') || '[]');
      localUpdates = JSON.parse(localStorage.getItem('cfm_local_updates') || '[]');
    } catch {}

    dashboardService
      .farmer()
      .then((r) => {
        const serverDash = r.data.dashboard || {};
        const mergedUpdates = hideDemo ? localUpdates : [...localUpdates, ...(serverDash.recentUpdates || [])];
        const serverPending = serverDash.pendingPayments || [];
        const mergedPending = hideDemo ? locals : [...locals, ...serverPending.filter((p) => !locals.some((l) => l._id === p._id))];

        setData({
          stats: {
            totalContracts: hideDemo ? locals.length : (serverDash.stats?.totalContracts || 4) + locals.length,
            activeContracts: hideDemo ? locals.filter((c) => c.status === 'active').length : (serverDash.stats?.activeContracts || 2),
            completedContracts: hideDemo ? locals.filter((c) => c.status === 'completed').length : (serverDash.stats?.completedContracts || 1),
            openContracts: hideDemo ? locals.filter((c) => c.status === 'open').length : (serverDash.stats?.openContracts || 8),
          },
          recentUpdates: mergedUpdates,
          pendingPayments: mergedPending,
        });
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo data
        const demoUpdates = [
          {
            _id: 'demo-u1',
            contract: { title: 'Wheat (Sharbati A-Grade) 2024' },
            weekNumber: 6,
            cropHealth: 'excellent',
            weatherCondition: 'Mild Sunny, Optimal Moisture',
            estimatedYieldTons: 98,
          },
          {
            _id: 'demo-u2',
            contract: { title: 'Basmati Rice Export Standard' },
            weekNumber: 3,
            cropHealth: 'good',
            weatherCondition: 'Clear skies',
            estimatedYieldTons: 82,
          },
        ];

        const demoPending = [
          {
            _id: 'demo-c1',
            title: 'Wheat (Sharbati A-Grade) 2024',
            amountPaid: 1000000,
            totalValue: 2500000,
          },
          {
            _id: 'demo-c2',
            title: 'Basmati Rice Export Standard',
            amountPaid: 450000,
            totalValue: 3200000,
          },
        ];

        const mergedUpdates = hideDemo ? localUpdates : [...localUpdates, ...demoUpdates];
        const mergedPending = hideDemo ? locals : [...locals, ...demoPending];

        setData({
          stats: {
            totalContracts: hideDemo ? locals.length : 4 + locals.length,
            activeContracts: hideDemo ? locals.filter((c) => c.status === 'active').length : 2,
            completedContracts: hideDemo ? locals.filter((c) => c.status === 'completed').length : 1,
            openContracts: hideDemo ? locals.filter((c) => c.status === 'open').length : 8,
          },
          recentUpdates: mergedUpdates,
          pendingPayments: mergedPending,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadFarmerData();
    const handleModeChange = () => loadFarmerData();
    window.addEventListener('cfm_datamode_changed', handleModeChange);
    return () => window.removeEventListener('cfm_datamode_changed', handleModeChange);
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const { stats, recentUpdates, pendingPayments } = data;

  return (
    <div>
      {/* Stat Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          icon={FileText}
          label="My Contracts"
          value={stats.totalContracts}
          color="#38bdf8"
          bg="rgba(56, 189, 248, 0.12)"
          subtext="Assigned agreements"
        />
        <StatCard
          icon={Sprout}
          label="In Cultivation"
          value={stats.activeContracts}
          color="#10b981"
          bg="rgba(16, 185, 129, 0.12)"
          subtext="Logging weekly progress"
        />
        <StatCard
          icon={CheckCheck}
          label="Completed"
          value={stats.completedContracts}
          color="#2dd4bf"
          bg="rgba(45, 212, 191, 0.12)"
          subtext="Harvests delivered"
        />
        <StatCard
          icon={Compass}
          label="Open Offers"
          value={stats.openContracts}
          color="#a78bfa"
          bg="rgba(167, 139, 250, 0.12)"
          subtext="Available for bidding"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Recent Updates */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Recent Weekly Health Logs</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Agronomic tracker</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentUpdates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>
                No crop updates logged yet.
              </div>
            ) : (
              recentUpdates.map((u) => (
                <div key={u._id} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>
                      {u.contract?.title}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Week {u.weekNumber}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                    <span className={`badge badge-${u.cropHealth}`}>Health: {u.cropHealth}</span>
                    <span style={{ color: 'var(--color-muted)' }}>·</span>
                    <span style={{ color: 'var(--color-muted)' }}>{u.weatherCondition}</span>
                  </div>
                  <div style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    Projected Yield:{' '}
                    <strong style={{ color: '#34d399' }}>{u.estimatedYieldTons} tons</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Settlements */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Contract Payment Settlements</h3>
            <Link to="/ledger" style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
              Full Ledger →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingPayments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 32 }}>
                All payments settled ✓
              </div>
            ) : (
              pendingPayments.map((c) => {
                const percent = Math.min(100, Math.round((c.amountPaid / c.totalValue) * 100)) || 0;
                return (
                  <div key={c._id} className="card" style={{ padding: 18 }}>
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem', marginBottom: 8 }}>
                      {c.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                      <span style={{ color: 'var(--color-muted)' }}>
                        Received: <strong style={{ color: '#34d399' }}>₹{c.amountPaid?.toLocaleString('en-IN')}</strong>
                      </span>
                      <span style={{ color: 'var(--color-muted)' }}>
                        Total: ₹{c.totalValue?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ height: 7, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                          width: `${percent}%`,
                          borderRadius: 4,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      <span>Disbursed so far</span>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>{percent}% Settled</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DashboardPage Main ───────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="page-container fade-in">
      {/* Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 500 }}>
              {todayStr}
            </span>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 4,
                background: user?.role === 'farmer' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: user?.role === 'farmer' ? '#34d399' : '#38bdf8',
              }}
            >
              {user?.role === 'farmer' ? 'Farmer Portal' : 'Agribusiness Hub'}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.2rem)' }}>
            {getGreeting()},{' '}
            <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p style={{ color: 'var(--color-muted)', marginTop: 6, fontSize: '0.95rem' }}>
            {user?.role === 'agribusiness'
              ? 'Real-time overview of your agricultural contract commitments, agronomic metrics, and escrows.'
              : 'Track crop growth schedules, verified contract milestones, and incoming payouts.'}
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {user?.role === 'agribusiness' ? (
            <>
              <Link to="/contracts/new" className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
                <PlusCircle size={16} /> Draft Contract
              </Link>
              <Link to="/ledger" className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
                <Receipt size={16} /> Payments Ledger
              </Link>
            </>
          ) : (
            <>
              <Link to="/contracts/open" className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
                <Compass size={16} /> Browse Offers
              </Link>
              <Link to="/verify-aadhaar" className="btn-secondary" style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
                <ShieldCheck size={16} /> UIDAI KYC
              </Link>
            </>
          )}
        </div>
      </div>

      {user?.role === 'agribusiness' ? <AgribusinessDashboard /> : <FarmerDashboard />}
    </div>
  );
};

export default DashboardPage;
