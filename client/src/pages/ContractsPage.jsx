import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contractService } from '../api/services';
import { StatusBadge } from '../components/StatusBadge';
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  Scale, 
  IndianRupee, 
  UserCheck, 
  Building2, 
  ArrowRight,
  Filter,
  Sprout
} from 'lucide-react';

const ContractCard = ({ contract, isAgribusiness }) => {
  const formattedDeadline = contract.deadline
    ? new Date(contract.deadline).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Flexible';

  const totalVal =
    contract.totalValue ||
    (contract.requiredQuantityTons && contract.pricePerTon
      ? contract.requiredQuantityTons * contract.pricePerTon
      : 0);

  return (
    <div
      className="card card-interactive fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 18,
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.05)',
                  fontSize: '0.75rem',
                  color: 'var(--color-primary-light)',
                  fontWeight: 600,
                }}
              >
                🌾 {contract.cropType}
              </span>
              <StatusBadge status={contract.status} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>{contract.title}</h3>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'Outfit',
                color: '#34d399',
              }}
            >
              ₹{totalVal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Guaranteed Floor
            </div>
          </div>
        </div>

        {/* 3 Metrics Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            padding: '12px 14px',
            background: 'rgba(10, 16, 28, 0.6)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--color-muted)', marginBottom: 2 }}>
              <Scale size={12} /> VOLUME
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              {contract.requiredQuantityTons}t
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--color-muted)', marginBottom: 2 }}>
              <IndianRupee size={12} /> RATE/TON
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              ₹{contract.pricePerTon?.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--color-muted)', marginBottom: 2 }}>
              <Calendar size={12} /> HARVEST
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
              {formattedDeadline}
            </div>
          </div>
        </div>

        {/* Counterparty Identity */}
        <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: 18 }}>
          {isAgribusiness && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                <UserCheck size={14} />
              </div>
              {contract.farmer?.name ? (
                <span>
                  Farmer: <strong style={{ color: '#ffffff' }}>{contract.farmer.name}</strong>
                </span>
              ) : (
                <span style={{ fontStyle: 'italic', color: '#38bdf8' }}>Open for bidding</span>
              )}
            </div>
          )}

          {!isAgribusiness && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <Building2 size={14} />
              </div>
              <span>
                Sponsor:{' '}
                <strong style={{ color: '#ffffff' }}>
                  {contract.agribusiness?.profile?.companyName || contract.agribusiness?.name || 'ITC Agro Division'}
                </strong>
                {contract.agribusiness?.profile?.location && ` · ${contract.agribusiness.profile.location}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Button */}
      <Link
        to={`/contracts/${contract._id}`}
        className="btn-secondary"
        style={{
          width: '100%',
          justifyContent: 'center',
          fontSize: '0.88rem',
          padding: '10px 16px',
        }}
      >
        View Specifications <ArrowRight size={15} />
      </Link>
    </div>
  );
};

// ─── Agribusiness: Own Contracts ─────────────────────────────────────────────
const AgribusinessContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await contractService.getMyContracts(statusFilter ? { status: statusFilter } : {});
      setContracts(res.data.contracts);
    } catch {
      // Demo fallback
      setContracts([
        {
          _id: 'c-101',
          title: 'Wheat (Sharbati A-Grade) 2024',
          cropType: 'Wheat',
          requiredQuantityTons: 100,
          pricePerTon: 25000,
          totalValue: 2500000,
          deadline: '2025-04-15',
          status: 'active',
          farmer: { name: 'Rajesh Kumar' },
        },
        {
          _id: 'c-102',
          title: 'Basmati Rice Export Standard',
          cropType: 'Basmati Rice',
          requiredQuantityTons: 80,
          pricePerTon: 40000,
          totalValue: 3200000,
          deadline: '2025-06-30',
          status: 'accepted',
          farmer: { name: 'Harpreet Singh' },
        },
        {
          _id: 'c-103',
          title: 'Organic Cotton Kharif Season',
          cropType: 'Cotton',
          requiredQuantityTons: 40,
          pricePerTon: 45000,
          totalValue: 1800000,
          deadline: '2025-09-10',
          status: 'open',
          farmer: null,
        },
        {
          _id: 'c-104',
          title: 'Mustard Seeds Winter Harvest',
          cropType: 'Mustard',
          requiredQuantityTons: 50,
          pricePerTon: 30000,
          totalValue: 1500000,
          deadline: '2025-03-20',
          status: 'completed',
          farmer: { name: 'Gurpreet Gill' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const filtered = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.cropType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['all', 'open', 'accepted', 'active', 'completed', 'declined', 'cancelled'];

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem' }}>My Agricultural Contracts</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.925rem', marginTop: 4 }}>
            Manage procurement agreements, review farmer applications, and oversee delivery timelines
          </p>
        </div>

        <Link to="/contracts/new" className="btn-primary" style={{ padding: '10px 20px' }}>
          <PlusCircle size={18} /> New Contract Offer
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {/* Status Chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === 'all' ? '' : s)}
              className={`filter-chip ${(!statusFilter && s === 'all') || statusFilter === s ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 240 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}
          />
          <input
            type="text"
            placeholder="Search contracts or crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--color-muted)' }}>
          <Sprout size={48} color="#10b981" style={{ opacity: 0.6, marginBottom: 16 }} />
          <h3 style={{ color: '#ffffff', marginBottom: 8 }}>No contracts found</h3>
          <p style={{ maxWidth: 400, margin: '0 auto 20px' }}>
            No procurement contracts match the selected status filter.
          </p>
          <Link to="/contracts/new" className="btn-primary">
            <PlusCircle size={16} /> Create Contract Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 22 }}>
          {filtered.map((c) => (
            <ContractCard key={c._id} contract={c} isAgribusiness />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Farmer: Open Contracts ───────────────────────────────────────────────────
export const OpenContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    contractService
      .getOpenContracts()
      .then((r) => {
        setContracts(r.data.contracts);
      })
      .catch(() => {
        // Demo fallback
        setContracts([
          {
            _id: 'c-open-1',
            title: 'Organic Cotton Kharif Season',
            cropType: 'Cotton',
            requiredQuantityTons: 40,
            pricePerTon: 45000,
            totalValue: 1800000,
            deadline: '2025-09-10',
            status: 'open',
            agribusiness: { profile: { companyName: 'ITC Agro Division', location: 'Telangana' } },
          },
          {
            _id: 'c-open-2',
            title: 'Soybean High Oil Content Variety',
            cropType: 'Soybean',
            requiredQuantityTons: 60,
            pricePerTon: 36000,
            totalValue: 2160000,
            deadline: '2025-08-15',
            status: 'open',
            agribusiness: { profile: { companyName: 'Adani Wilmar Agri', location: 'Madhya Pradesh' } },
          },
          {
            _id: 'c-open-3',
            title: 'Maize Cattle Feed Quality Grade',
            cropType: 'Maize',
            requiredQuantityTons: 75,
            pricePerTon: 22000,
            totalValue: 1650000,
            deadline: '2025-07-20',
            status: 'open',
            agribusiness: { profile: { companyName: 'Cargill India', location: 'Karnataka' } },
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = contracts.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.cropType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem' }}>Open Contract Opportunities</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.925rem', marginTop: 4 }}>
            Explore guaranteed price procurement offers from verified agribusiness sponsors
          </p>
        </div>

        <div style={{ position: 'relative', width: 240 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}
          />
          <input
            type="text"
            placeholder="Search by crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--color-muted)' }}>
          <Sprout size={48} color="#34d399" style={{ opacity: 0.6, marginBottom: 16 }} />
          <h3 style={{ color: '#ffffff', marginBottom: 8 }}>No open offers right now</h3>
          <p>Please check back soon or consult existing active agreements.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 22 }}>
          {filtered.map((c) => (
            <ContractCard key={c._id} contract={c} isAgribusiness={false} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Farmer: My Contracts ─────────────────────────────────────────────────────
export const FarmerContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    contractService
      .getFarmerContracts(statusFilter ? { status: statusFilter } : {})
      .then((r) => {
        setContracts(r.data.contracts);
      })
      .catch(() => {
        // Demo fallback
        setContracts([
          {
            _id: 'c-f-1',
            title: 'Wheat (Sharbati A-Grade) 2024',
            cropType: 'Wheat',
            requiredQuantityTons: 100,
            pricePerTon: 25000,
            totalValue: 2500000,
            deadline: '2025-04-15',
            status: 'active',
            agribusiness: { profile: { companyName: 'ITC Agro Division', location: 'Punjab' } },
          },
          {
            _id: 'c-f-2',
            title: 'Basmati Rice Export Standard',
            cropType: 'Basmati Rice',
            requiredQuantityTons: 80,
            pricePerTon: 40000,
            totalValue: 3200000,
            deadline: '2025-06-30',
            status: 'accepted',
            agribusiness: { profile: { companyName: 'LT Foods Ltd', location: 'Haryana' } },
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="page-container fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem' }}>My Farming Contracts</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.925rem', marginTop: 4 }}>
            Track contracts bound to your farm, submit weekly logs, and inspect escrow payments
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto', minWidth: 150 }}
        >
          <option value="">All Statuses</option>
          <option value="accepted">Accepted</option>
          <option value="active">Active Cultivation</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : contracts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--color-muted)' }}>
          <Sprout size={48} color="#34d399" style={{ opacity: 0.6, marginBottom: 16 }} />
          <h3 style={{ color: '#ffffff', marginBottom: 8 }}>No contracts yet</h3>
          <p style={{ marginBottom: 20 }}>Browse open agricultural offers and accept your first contract.</p>
          <Link to="/contracts/open" className="btn-primary">
            Explore Open Offers →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 22 }}>
          {contracts.map((c) => (
            <ContractCard key={c._id} contract={c} isAgribusiness={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgribusinessContractsPage;
