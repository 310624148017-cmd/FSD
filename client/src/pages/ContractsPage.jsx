import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contractService } from '../api/services';
import { StatusBadge } from '../components/StatusBadge';

const ContractCard = ({ contract, isAgribusiness }) => (
  <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{contract.title}</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status={contract.status} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>🌾 {contract.cropType}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          ₹{contract.totalValue?.toLocaleString() || (contract.requiredQuantityTons * contract.pricePerTon).toLocaleString()}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Total Value</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '12px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      {[
        { label: 'Quantity', value: `${contract.requiredQuantityTons} tons` },
        { label: 'Price/ton', value: `₹${contract.pricePerTon?.toLocaleString()}` },
        { label: 'Deadline', value: new Date(contract.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) },
      ].map(({ label, value }) => (
        <div key={label}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{value}</div>
        </div>
      ))}
    </div>

    {isAgribusiness && contract.farmer && (
      <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        👨‍🌾 Farmer: <span style={{ color: 'var(--color-text)' }}>{contract.farmer.name}</span>
      </div>
    )}
    {!isAgribusiness && contract.agribusiness && (
      <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
        🏢 {contract.agribusiness.profile?.companyName || contract.agribusiness.name}
        {contract.agribusiness.profile?.location && ` · ${contract.agribusiness.profile.location}`}
      </div>
    )}

    <Link to={`/contracts/${contract._id}`} className="btn-secondary" style={{ justifyContent: 'center', fontSize: '0.875rem' }}>
      View Details →
    </Link>
  </div>
);

// ─── Agribusiness: own contracts ─────────────────────────────────────────────
const AgribusinessContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchContracts = async () => {
    setLoading(true);
    const res = await contractService.getMyContracts(statusFilter ? { status: statusFilter } : {});
    setContracts(res.data.contracts);
    setLoading(false);
  };

  useEffect(() => { fetchContracts(); }, [statusFilter]);

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>My Contracts</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>{contracts.length} contracts found</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ minWidth: 140 }}>
            <option value="">All Statuses</option>
            {['open', 'accepted', 'active', 'completed', 'declined', 'cancelled'].map((s) => (
              <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
            ))}
          </select>
          <Link to="/contracts/new" className="btn-primary">+ New Contract</Link>
        </div>
      </div>
      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        contracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📄</div>
            <p>No contracts yet. <Link to="/contracts/new" style={{ color: 'var(--color-primary)' }}>Create your first →</Link></p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {contracts.map((c) => <ContractCard key={c._id} contract={c} isAgribusiness />)}
          </div>
        )
      )}
    </div>
  );
};

// ─── Farmer: open contracts ───────────────────────────────────────────────────
export const OpenContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractService.getOpenContracts().then((r) => { setContracts(r.data.contracts); setLoading(false); });
  }, []);

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem' }}>Open Contract Offers</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>{contracts.length} available opportunities</p>
      </div>
      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        contracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌾</div>
            <p>No open contracts at the moment. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {contracts.map((c) => <ContractCard key={c._id} contract={c} isAgribusiness={false} />)}
          </div>
        )
      )}
    </div>
  );
};

// ─── Farmer: my contracts ─────────────────────────────────────────────────────
export const FarmerContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    contractService.getFarmerContracts(statusFilter ? { status: statusFilter } : {}).then((r) => {
      setContracts(r.data.contracts); setLoading(false);
    });
  }, [statusFilter]);

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>My Contracts</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>{contracts.length} assigned contracts</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ minWidth: 140 }}>
          <option value="">All Statuses</option>
          {['accepted', 'active', 'completed', 'declined'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
        contracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌱</div>
            <p>No contracts yet. <Link to="/contracts/open" style={{ color: 'var(--color-primary)' }}>Browse open offers →</Link></p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {contracts.map((c) => <ContractCard key={c._id} contract={c} isAgribusiness={false} />)}
          </div>
        )
      )}
    </div>
  );
};

export default AgribusinessContractsPage;
