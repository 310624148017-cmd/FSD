import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contractService, updateService } from '../api/services';
import { StatusBadge } from '../components/StatusBadge';
import { HealthBadge, ImpactBadge } from '../components/StatusBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      setUpdates(uRes.data.updates);
    } catch {
      setError('Failed to load contract.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleAction = async (action) => {
    setActionLoading(action);
    setError('');
    try {
      const res = await contractService[action](id);
      setContract(res.data.contract);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} contract.`);
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this contract?')) return;
    await contractService.delete(id);
    navigate('/contracts');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!contract) return <div className="page-container"><div className="alert-error">Contract not found.</div></div>;

  const isAgri = user.role === 'agribusiness';
  const isFarmer = user.role === 'farmer';
  const isOwner = isAgri && contract.agribusiness?._id === user._id;
  const isAssignedFarmer = isFarmer && contract.farmer?._id === user._id;

  const chartData = updates.map((u) => ({ week: `W${u.weekNumber}`, yield: u.estimatedYieldTons }));

  const infoItems = [
    { label: 'Crop Type', value: contract.cropType },
    { label: 'Required Quantity', value: `${contract.requiredQuantityTons} tons` },
    { label: 'Price per Ton', value: `₹${contract.pricePerTon?.toLocaleString()}` },
    { label: 'Total Value', value: `₹${contract.totalValue?.toLocaleString()}`, highlight: true },
    { label: 'Deadline', value: new Date(contract.deadline).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
    { label: 'Payment Status', value: contract.paymentStatus, isBadge: true },
  ];

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ marginBottom: 8 }}><StatusBadge status={contract.status} /></div>
            <h1 style={{ fontSize: '1.8rem' }}>{contract.title}</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              {isAgri ? `Created by you · ` : `By ${contract.agribusiness?.profile?.companyName || contract.agribusiness?.name} · `}
              Created {new Date(contract.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Farmer actions */}
            {isFarmer && contract.status === 'open' && (
              <>
                <button id="btn-accept" className="btn-primary" onClick={() => handleAction('accept')} disabled={actionLoading === 'accept'}>
                  {actionLoading === 'accept' ? 'Accepting...' : '✅ Accept Contract'}
                </button>
                <button id="btn-decline" className="btn-danger" onClick={() => handleAction('decline')} disabled={actionLoading === 'decline'}>
                  Decline
                </button>
              </>
            )}
            {isAssignedFarmer && ['accepted', 'active'].includes(contract.status) && (
              <Link to={`/updates/new/${id}`} className="btn-primary">+ Log Crop Update</Link>
            )}
            {isAssignedFarmer && (
              <Link to={`/ledger/${id}`} className="btn-secondary">View Payments</Link>
            )}

            {/* Agribusiness actions */}
            {isOwner && contract.status === 'open' && (
              <>
                <Link to={`/contracts/${id}/edit`} className="btn-secondary">✏️ Edit</Link>
                <button id="btn-cancel" className="btn-danger" onClick={() => handleAction('cancel')} disabled={actionLoading === 'cancel'}>Cancel</button>
                <button id="btn-delete" className="btn-danger" onClick={handleDelete}>Delete</button>
              </>
            )}
            {isOwner && contract.status === 'accepted' && (
              <button id="btn-cancel-accepted" className="btn-danger" onClick={() => handleAction('cancel')} disabled={actionLoading === 'cancel'}>Cancel</button>
            )}
            {isOwner && ['accepted', 'active'].includes(contract.status) && (
              <>
                <button id="btn-complete" className="btn-primary" onClick={() => handleAction('complete')} disabled={actionLoading === 'complete'}>
                  {actionLoading === 'complete' ? '...' : '✅ Mark Complete'}
                </button>
                <Link to={`/ledger/${id}`} className="btn-secondary">💰 Record Payment</Link>
              </>
            )}
            {isOwner && contract.status === 'completed' && (
              <Link to={`/ledger/${id}`} className="btn-secondary">💰 View Ledger</Link>
            )}
          </div>
        </div>
        {error && <div className="alert-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {/* Contract Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Contract Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {infoItems.map(({ label, value, highlight, isBadge }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{label}</span>
                {isBadge ? <StatusBadge status={value} /> :
                  <span style={{ fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--color-primary)' : 'var(--color-text)', fontSize: highlight ? '1rem' : '0.9rem' }}>{value}</span>
                }
              </div>
            ))}
          </div>

          {/* Payment bar */}
          {contract.totalValue > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 6 }}>
                <span>Amount Paid: ₹{contract.amountPaid?.toLocaleString()}</span>
                <span>{((contract.amountPaid / contract.totalValue) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4 }}>
                <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', width: `${Math.min(100, (contract.amountPaid / contract.totalValue) * 100)}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Parties */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Parties Involved</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { role: 'Agribusiness (Sponsor)', party: contract.agribusiness, icon: '🏢' },
              { role: 'Farmer (Assignee)', party: contract.farmer, icon: '👨‍🌾' },
            ].map(({ role, party, icon }) => (
              <div key={role} style={{ padding: 14, background: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 6 }}>{icon} {role}</div>
                {party ? (
                  <>
                    <div style={{ fontWeight: 600 }}>{party.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{party.email}</div>
                    {party.profile?.location && <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 2 }}>📍 {party.profile.location}</div>}
                  </>
                ) : (
                  <div style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>Not yet assigned</div>
                )}
              </div>
            ))}
          </div>

          {contract.terms && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 6 }}>📋 Terms & Conditions</div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{contract.terms}</p>
            </div>
          )}
        </div>
      </div>

      {/* Crop Updates Section */}
      {updates.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem' }}>📈 Yield Estimate Trend</h3>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>{updates.length} updates logged</span>
          </div>

          {chartData.length > 1 && (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="yield" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: chartData.length > 1 ? 20 : 0 }}>
            {updates.map((u) => (
              <div key={u._id} style={{ padding: 14, background: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary)' }}>W{u.weekNumber}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <HealthBadge health={u.cropHealth} />
                    <ImpactBadge impact={u.weatherImpact} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    🌤 {u.weatherCondition} · Est. yield: <strong style={{ color: 'var(--color-text)' }}>{u.estimatedYieldTons} tons</strong>
                  </div>
                  {u.notes && <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 4 }}>{u.notes}</div>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetailPage;
