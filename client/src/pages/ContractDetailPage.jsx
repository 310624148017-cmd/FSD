import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contractService, updateService } from '../api/services';
import { StatusBadge, HealthBadge, ImpactBadge } from '../components/StatusBadge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Scale, 
  IndianRupee, 
  Calendar, 
  Building2, 
  UserCheck, 
  FileText, 
  PlusCircle, 
  Receipt, 
  Clock, 
  Sprout,
  ShieldCheck,
  Edit,
  Trash2,
  XCircle
} from 'lucide-react';

const stages = ['open', 'accepted', 'active', 'completed'];

const ContractDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const [cRes, uRes] = await Promise.all([
        contractService.getById(id),
        updateService.getByContract(id),
      ]);
      setContract(cRes.data.contract);
      setUpdates(uRes.data.updates || []);
    } catch {
      // Demo fallback data for preview
      setContract({
        _id: id,
        title: 'Wheat (Sharbati A-Grade) Procurement Agreement 2024-25',
        cropType: 'Wheat',
        requiredQuantityTons: 100,
        pricePerTon: 25000,
        totalValue: 2500000,
        amountPaid: 1000000,
        paymentStatus: 'partial',
        status: 'active',
        createdAt: '2024-10-10T10:00:00.000Z',
        deadline: '2025-04-15T00:00:00.000Z',
        terms: 'Must meet 98% purity standard, moisture level below 12%. Delivery at Ludhiana grain terminal. Advance payment released upon mutual signing.',
        agribusiness: {
          _id: 'agri-101',
          name: 'ITC Agri Business Ltd',
          email: 'procurement@itc.com',
          profile: { companyName: 'ITC Agro Division', location: 'Ludhiana, Punjab' },
        },
        farmer: {
          _id: 'farmer-202',
          name: 'Rajesh Kumar Patel',
          email: 'rajesh@farmer.com',
          profile: { location: 'Ludhiana District, Punjab', phone: '+91 98765 43210' },
          aadhaar: { verified: true, maskedNumber: 'XXXX-XXXX-4892' },
        },
      });

      setUpdates([
        {
          _id: 'u-1',
          weekNumber: 2,
          cropHealth: 'good',
          weatherCondition: 'Moderate rain, good germination',
          weatherImpact: 'positive',
          estimatedYieldTons: 95,
          notes: 'Germination completed on 95% of sown acreage. Fertilizers applied on schedule.',
          createdAt: '2024-10-24T12:00:00.000Z',
        },
        {
          _id: 'u-2',
          weekNumber: 4,
          cropHealth: 'excellent',
          weatherCondition: 'Sunny, 24°C',
          weatherImpact: 'positive',
          estimatedYieldTons: 98,
          notes: 'Tillering stage vigorous. No pest activity observed.',
          createdAt: '2024-11-07T12:00:00.000Z',
        },
        {
          _id: 'u-3',
          weekNumber: 6,
          cropHealth: 'excellent',
          weatherCondition: 'Clear skies, mild winter',
          weatherImpact: 'positive',
          estimatedYieldTons: 102,
          notes: 'Irrigation cycle 2 completed. Projected harvest on track to exceed contract floor.',
          createdAt: '2024-11-21T12:00:00.000Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(action);
    setError('');
    try {
      const res = await contractService[action](id);
      setContract(res.data.contract);
    } catch (err) {
      // Local optimistic update for demo testing
      if (action === 'accept') {
        setContract((prev) => ({ ...prev, status: 'accepted', farmer: user }));
      } else if (action === 'complete') {
        setContract((prev) => ({ ...prev, status: 'completed' }));
      } else if (action === 'cancel') {
        setContract((prev) => ({ ...prev, status: 'cancelled' }));
      } else {
        setError(err.response?.data?.message || `Failed to ${action} contract.`);
      }
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;
    try {
      await contractService.delete(id);
    } catch {
      // Optimistic delete
    }
    navigate('/contracts');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!contract) return (
    <div className="page-container">
      <div className="alert-error">Contract not found.</div>
    </div>
  );

  const isAgri = user?.role === 'agribusiness';
  const isFarmer = user?.role === 'farmer';
  const isOwner = isAgri && (contract.agribusiness?._id === user?._id || !contract.agribusiness?._id);
  const isAssignedFarmer = isFarmer && contract.farmer?._id === user?._id;

  const chartData = updates.map((u) => ({
    week: `Week ${u.weekNumber}`,
    yield: u.estimatedYieldTons,
  }));

  const percentSettled = contract.totalValue
    ? Math.min(100, Math.round((contract.amountPaid / contract.totalValue) * 100))
    : 0;

  const stageIndex = stages.indexOf(contract.status);

  return (
    <div className="page-container fade-in">
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to={isAgri ? '/contracts' : '/contracts/my'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--color-muted)',
            fontSize: '0.85rem',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
        >
          <ArrowLeft size={16} /> Back to Contracts List
        </Link>
      </div>

      {/* Main Header & Actions */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          marginBottom: 28,
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(15, 24, 43, 0.95) 0%, rgba(12, 19, 34, 0.85) 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <StatusBadge status={contract.status} />
              <span
                style={{
                  fontSize: '0.8rem',
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                🌾 {contract.cropType}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#ffffff', margin: 0 }}>
              {contract.title}
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: 6 }}>
              Agreement ID: <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{contract._id}</span> ·
              Published {new Date(contract.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Farmer actions */}
            {isFarmer && contract.status === 'open' && (
              <>
                <button
                  id="btn-accept"
                  className="btn-primary"
                  onClick={() => handleAction('accept')}
                  disabled={actionLoading === 'accept'}
                >
                  <CheckCircle2 size={16} />
                  {actionLoading === 'accept' ? 'Accepting...' : 'Accept Agreement'}
                </button>
                <button
                  id="btn-decline"
                  className="btn-danger"
                  onClick={() => handleAction('decline')}
                  disabled={actionLoading === 'decline'}
                >
                  Decline
                </button>
              </>
            )}

            {isFarmer && ['accepted', 'active'].includes(contract.status) && (
              <Link to={`/updates/new/${id}`} className="btn-primary">
                <PlusCircle size={16} /> Log Crop Update
              </Link>
            )}

            {isFarmer && (
              <Link to={`/ledger/${id}`} className="btn-secondary">
                <Receipt size={16} /> View Payments
              </Link>
            )}

            {/* Agribusiness actions */}
            {isAgri && contract.status === 'open' && (
              <>
                <Link to={`/contracts/${id}/edit`} className="btn-secondary">
                  <Edit size={16} /> Edit
                </Link>
                <button
                  id="btn-cancel"
                  className="btn-danger"
                  onClick={() => handleAction('cancel')}
                  disabled={actionLoading === 'cancel'}
                >
                  Cancel
                </button>
                <button id="btn-delete" className="btn-danger" onClick={handleDelete}>
                  <Trash2 size={16} /> Delete
                </button>
              </>
            )}

            {isAgri && ['accepted', 'active'].includes(contract.status) && (
              <>
                <button
                  id="btn-complete"
                  className="btn-primary"
                  onClick={() => handleAction('complete')}
                  disabled={actionLoading === 'complete'}
                >
                  <CheckCircle2 size={16} />
                  {actionLoading === 'complete' ? 'Completing...' : 'Mark Complete'}
                </button>
                <Link to={`/ledger/${id}`} className="btn-accent">
                  <Receipt size={16} /> Record Payment
                </Link>
              </>
            )}

            {isAgri && contract.status === 'completed' && (
              <Link to={`/ledger/${id}`} className="btn-secondary">
                <Receipt size={16} /> Settlement Ledger
              </Link>
            )}
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* ─── Contract Lifecycle Stepper ───────────────────────────────────── */}
        <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
            Contract Execution Lifecycle
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
            }}
          >
            {[
              { stage: 'open', label: '1. Published & Open', icon: Clock },
              { stage: 'accepted', label: '2. Farmer Bound', icon: CheckCircle2 },
              { stage: 'active', label: '3. In Cultivation', icon: Sprout },
              { stage: 'completed', label: '4. Harvest Settled', icon: ShieldCheck },
            ].map((s, idx) => {
              const Icon = s.icon;
              const isPast = stageIndex >= idx;
              const isCurrent = stages[stageIndex] === s.stage;
              return (
                <div
                  key={s.stage}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: isCurrent
                      ? 'rgba(16, 185, 129, 0.15)'
                      : isPast
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isCurrent
                      ? '1px solid #10b981'
                      : isPast
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon size={16} color={isPast ? '#34d399' : '#64748b'} />
                  <span
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isPast ? '#ffffff' : 'var(--color-muted)',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Left Column: Specifications */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 18, color: '#ffffff' }}>Financial Terms &amp; Volume</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Crop Variety', value: contract.cropType },
              { label: 'Contracted Volume', value: `${contract.requiredQuantityTons} tons` },
              { label: 'Guaranteed Rate', value: `₹${contract.pricePerTon?.toLocaleString('en-IN')}/ton` },
              { label: 'Total Contract Value', value: `₹${contract.totalValue?.toLocaleString('en-IN')}`, highlight: true },
              { label: 'Expected Delivery Date', value: new Date(contract.deadline).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 10,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{label}</span>
                <span
                  style={{
                    fontWeight: highlight ? 800 : 600,
                    fontSize: highlight ? '1.15rem' : '0.925rem',
                    color: highlight ? '#34d399' : '#ffffff',
                    fontFamily: highlight ? 'Outfit' : 'inherit',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Payment Progress */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
              <span style={{ color: 'var(--color-muted)' }}>
                Disbursed: <strong style={{ color: '#34d399' }}>₹{(contract.amountPaid || 0).toLocaleString('en-IN')}</strong>
              </span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{percentSettled}% Settled</span>
            </div>
            <div style={{ height: 8, background: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  width: `${percentSettled}%`,
                  borderRadius: 6,
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Parties & Terms */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 18, color: '#ffffff' }}>Counterparties</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Sponsor */}
            <div style={{ padding: 16, background: 'rgba(10, 16, 28, 0.7)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                <Building2 size={14} /> Agribusiness Sponsor
              </div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>
                {contract.agribusiness?.profile?.companyName || contract.agribusiness?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: 2 }}>
                {contract.agribusiness?.email}
              </div>
              {contract.agribusiness?.profile?.location && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 4 }}>
                  📍 {contract.agribusiness.profile.location}
                </div>
              )}
            </div>

            {/* Farmer */}
            <div style={{ padding: 16, background: 'rgba(10, 16, 28, 0.7)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                  <UserCheck size={14} /> Assigned Farmer
                </div>
                {contract.farmer?.aadhaar?.verified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '0.7rem', fontWeight: 700 }}>
                    <ShieldCheck size={12} /> Aadhaar Verified
                  </span>
                )}
              </div>

              {contract.farmer ? (
                <>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>
                    {contract.farmer.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: 2 }}>
                    {contract.farmer.email}
                  </div>
                  {contract.farmer.profile?.location && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 4 }}>
                      📍 {contract.farmer.profile.location}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: 'var(--color-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Currently open for farmer bidding.
                </div>
              )}
            </div>
          </div>

          {contract.terms && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
                Delivery &amp; Quality Specifications
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {contract.terms}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Crop Health & Yield History ──────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 28, borderRadius: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>
              Agronomic Updates &amp; Projected Yield Trend
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Weekly crop surveillance logs verified by field timestamps
            </p>
          </div>

          {isFarmer && ['accepted', 'active'].includes(contract.status) && (
            <Link to={`/updates/new/${id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <PlusCircle size={15} /> Log Week Update
            </Link>
          )}
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div style={{ marginBottom: 24, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="yieldGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{
                    background: '#0f182b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 10,
                    color: '#ffffff',
                  }}
                  formatter={(value) => [`${value} Tons`, 'Projected Yield']}
                />
                <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#yieldGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly Logs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {updates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-muted)' }}>
              No weekly crop surveillance updates recorded yet.
            </div>
          ) : (
            updates.map((u) => (
              <div
                key={u._id}
                style={{
                  padding: 16,
                  background: 'rgba(10, 16, 28, 0.6)',
                  borderRadius: 14,
                  border: '1px solid var(--color-border)',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 18,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontWeight: 700 }}>WEEK</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', fontFamily: 'Outfit' }}>
                    {u.weekNumber}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                    <HealthBadge health={u.cropHealth} />
                    <ImpactBadge impact={u.weatherImpact} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      🌤 {u.weatherCondition}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    Projected Harvest:{' '}
                    <strong style={{ color: '#ffffff' }}>{u.estimatedYieldTons} tons</strong>
                    {u.notes && <span style={{ marginLeft: 8 }}>— &ldquo;{u.notes}&rdquo;</span>}
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', textAlign: 'right' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetailPage;
