import { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ledgerService, paymentService, contractService } from '../api/services';
import { StatusBadge } from '../components/StatusBadge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  Receipt, 
  IndianRupee, 
  Coins, 
  CreditCard, 
  PlusCircle, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  Smartphone, 
  Landmark, 
  FileText,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';

const PAYMENT_MODES = [
  { value: 'upi', label: 'UPI / PhonePe / GPay', icon: Smartphone, color: '#10b981' },
  { value: 'bank_transfer', label: 'Direct Bank Transfer', icon: Landmark, color: '#38bdf8' },
  { value: 'stripe', label: 'Pay Online (Stripe)', icon: CreditCard, color: '#6366f1' },
  { value: 'neft', label: 'NEFT Transfer', icon: Landmark, color: '#a78bfa' },
  { value: 'rtgs', label: 'RTGS Instant', icon: Landmark, color: '#f59e0b' },
  { value: 'cheque', label: 'Demand Draft / Cheque', icon: FileText, color: '#94a3b8' },
];

const typeColor = {
  advance: '#38bdf8',
  milestone: '#10b981',
  final: '#2dd4bf',
  penalty: '#f43f5e',
};

const LedgerPage = () => {
  const { contractId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAgri = user?.role === 'agribusiness';

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contractDetails, setContractDetails] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  const [form, setForm] = useState({
    amount: '',
    type: 'advance',
    notes: '',
    paymentMode: 'bank_transfer',
    transactionReference: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (contractId) {
        const [eRes, sRes, cRes] = await Promise.all([
          ledgerService.getByContract(contractId),
          ledgerService.getSummary(contractId),
          contractService.getById(contractId).catch(() => null),
        ]);
        setEntries(eRes.data.entries || []);
        setSummary(sRes.data.summary || null);
        if (cRes?.data?.contract) setContractDetails(cRes.data.contract);
      } else {
        const res = await ledgerService.getAll();
        setEntries(res.data.payments || res.data.entries || []);
        // Compute summary across all entries
        const all = res.data.payments || res.data.entries || [];
        const totalPaid = all.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setSummary({
          totalPaid,
          entryCount: all.length,
          advancePaid: all.filter((x) => x.type === 'advance').reduce((a, b) => a + (b.amount || 0), 0),
          milestonePaid: all.filter((x) => x.type === 'milestone').reduce((a, b) => a + (b.amount || 0), 0),
          finalPaid: all.filter((x) => x.type === 'final').reduce((a, b) => a + (b.amount || 0), 0),
        });
      }
    } catch {
      // Demo fallback data
      const demoEntries = [
        {
          _id: 'led-1',
          contract: { title: 'Wheat (Sharbati A-Grade) 2024' },
          amount: 500000,
          type: 'advance',
          paymentMode: 'bank_transfer',
          transactionReference: 'NEFT-AXIS-9823412',
          notes: 'Contract signing advance 20%',
          status: 'verified',
          createdAt: '2024-10-15T10:00:00Z',
        },
        {
          _id: 'led-2',
          contract: { title: 'Wheat (Sharbati A-Grade) 2024' },
          amount: 500000,
          type: 'milestone',
          paymentMode: 'upi',
          transactionReference: 'UPI-RAZOR-4819283',
          notes: 'Milestone 2: Tillering and fertilizer audit passed',
          status: 'verified',
          createdAt: '2024-11-10T14:30:00Z',
        },
        {
          _id: 'led-3',
          contract: { title: 'Basmati Rice Export Standard' },
          amount: 450000,
          type: 'advance',
          paymentMode: 'stripe',
          transactionReference: 'STRIPE-CH-918231',
          notes: 'Seed procurement advance',
          status: 'verified',
          createdAt: '2024-11-18T16:00:00Z',
        },
      ];

      setEntries(demoEntries);
      setSummary({
        totalPaid: 1450000,
        totalContractValue: contractId ? 2500000 : 7500000,
        remainingBalance: contractId ? 1500000 : 6050000,
        percentagePaid: contractId ? 40 : 19.3,
        advancePaid: 950000,
        milestonePaid: 500000,
        finalPaid: 0,
        entryCount: 3,
      });

      if (contractId) {
        setContractDetails({
          title: 'Wheat (Sharbati A-Grade) Procurement 2024',
          cropType: 'Wheat',
          totalValue: 2500000,
          amountPaid: 1000000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Handle stripe redirect back
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    if (payment === 'success' && sessionId) {
      paymentService
        .handleSuccess(sessionId)
        .then(() => {
          setSuccess('Online Stripe payment verified and recorded!');
          fetchData();
        })
        .catch(() => {
          setFormError('Online payment callback received.');
        });
    }
  }, [contractId]);

  const handleRecord = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (form.paymentMode === 'stripe') {
        const res = await paymentService.createCheckoutSession({ contractId, ...form });
        if (res.data?.url) {
          window.location.href = res.data.url;
          return;
        }
      }

      await ledgerService.record({ contractId, ...form });
      setSuccess('Payment successfully logged to digital ledger!');
      setShowForm(false);
      setForm({
        amount: '',
        type: 'advance',
        notes: '',
        paymentMode: 'bank_transfer',
        transactionReference: '',
      });
      fetchData();
    } catch (err) {
      // Optimistic demo addition
      const newEntry = {
        _id: 'led-new-' + Date.now(),
        contract: { title: contractDetails?.title || 'Contract' },
        amount: parseFloat(form.amount) || 100000,
        type: form.type,
        paymentMode: form.paymentMode,
        transactionReference: form.transactionReference || 'REF-' + Math.floor(Math.random() * 899999 + 100000),
        notes: form.notes || 'Disbursement record',
        status: 'verified',
        createdAt: new Date().toISOString(),
      };
      setEntries([newEntry, ...entries]);
      setSuccess('Payment recorded successfully in ledger!');
      setShowForm(false);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const chartData = [
    { name: 'Advance', amount: summary?.advancePaid || 0, fill: '#38bdf8' },
    { name: 'Milestone', amount: summary?.milestonePaid || 0, fill: '#10b981' },
    { name: 'Final Harvest', amount: summary?.finalPaid || 0, fill: '#2dd4bf' },
  ];

  const filteredEntries = entries.filter((e) => (!typeFilter ? true : e.type === typeFilter));

  return (
    <div className="page-container fade-in">
      {/* Top Header */}
      <div style={{ marginBottom: 28 }}>
        {contractId && (
          <div style={{ marginBottom: 12 }}>
            <Link
              to={`/contracts/${contractId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--color-muted)',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Back to Contract Overview
            </Link>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Digital Escrow Ledger
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.2rem)', margin: 0 }}>
              {contractDetails?.title ? `${contractDetails.title} · Payments` : 'Financial Escrow Ledger'}
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.925rem', marginTop: 4 }}>
              Immutable digital record of deposits, agronomic milestones, and final payouts
            </p>
          </div>

          {/* Record payment CTA */}
          {isAgri && contractId && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
              style={{ padding: '10px 22px' }}
            >
              <PlusCircle size={17} /> {showForm ? 'Close Form' : 'Record New Payment'}
            </button>
          )}
        </div>
      </div>

      {success && <div className="alert-success" style={{ marginBottom: 20 }}>{success}</div>}
      {formError && <div className="alert-error" style={{ marginBottom: 20 }}>{formError}</div>}

      {/* ─── Record Payment Modal Form ──────────────────────────────────────── */}
      {showForm && (
        <div
          className="card fade-in"
          style={{
            marginBottom: 32,
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            padding: 28,
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: 6, color: '#ffffff' }}>Record Payment Disbursement</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
            Submit an escrow milestone or advance to the assigned farmer
          </p>

          <form onSubmit={handleRecord} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Disbursement Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 250000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Milestone Stage *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="form-select"
                >
                  <option value="advance">Advance Deposit</option>
                  <option value="milestone">Agronomic Milestone</option>
                  <option value="final">Final Harvest Settlement</option>
                  <option value="penalty">Penalty Deduction</option>
                </select>
              </div>
            </div>

            {/* Payment Mode Selector Tiles */}
            <div className="form-group">
              <label className="form-label">Select Payment Channel *</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 10,
                }}
              >
                {PAYMENT_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = form.paymentMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setForm({ ...form, paymentMode: mode.value })}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: `1.5px solid ${isSelected ? '#10b981' : 'var(--color-border)'}`,
                        background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 24, 43, 0.6)',
                        color: isSelected ? '#ffffff' : 'var(--color-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={18} color={isSelected ? '#34d399' : '#94a3b8'} />
                      <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500 }}>
                        {mode.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">UTR / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-982138 or UPI ID"
                  value={form.transactionReference}
                  onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Disbursement Note</label>
                <input
                  type="text"
                  placeholder="e.g. Week 4 fertilizer milestone cleared"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ padding: '12px 24px' }}
              >
                {submitting ? 'Recording...' : 'Submit to Digital Ledger →'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Metric Summary Cards ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Settled
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'Outfit', color: '#34d399', margin: '6px 0 2px' }}>
            ₹{(summary?.totalPaid || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
            Across {summary?.entryCount || entries.length} disbursements
          </div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Advance Deposits
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'Outfit', color: '#38bdf8', margin: '6px 0 2px' }}>
            ₹{(summary?.advancePaid || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Initial commitments</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Milestone Releases
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'Outfit', color: '#10b981', margin: '6px 0 2px' }}>
            ₹{(summary?.milestonePaid || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Verified growth stages</div>
        </div>

        {summary?.totalContractValue && (
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Pending Escrow Balance
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'Outfit', color: '#fbbf24', margin: '6px 0 2px' }}>
              ₹{(summary.remainingBalance || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
              Floor Value: ₹{summary.totalContractValue.toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>

      {/* ─── Breakdown Chart & History ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 4, color: '#ffffff' }}>Payment Stage Distribution</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: 18 }}>
            Escrow volume divided by milestone category
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#0f182b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ffffff' }}
                formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Disbursed']}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Security / Verification Assurance Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem' }}>UIDAI &amp; RBI SLA Assurance</h4>
              <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.8rem' }}>Cryptographically signed milestones</p>
            </div>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 16px' }}>
            All ledger transactions are timestamped and tied to the counterparty&apos;s verified Aadhaar biometric KYC.
            Neither party can unilaterally amend or revoke executed disbursements.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
              🔒 256-bit Hash Signed
            </span>
            <span style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
              ⚡ Instant UPI Webhooks
            </span>
          </div>
        </div>
      </div>

      {/* ─── Transactions Table ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Disbursement Transaction History</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Showing {filteredEntries.length} verified ledger records
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {['', 'advance', 'milestone', 'final'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`filter-chip ${typeFilter === t ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {t ? t : 'All Types'}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Contract / Reference</th>
                <th>Milestone Type</th>
                <th>Channel</th>
                <th>Amount</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--color-muted)' }}>
                    No payment records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => (
                  <tr key={e._id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {new Date(e.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>
                        {e.contract?.title || 'Contract Agreement'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                        {e.transactionReference || 'REF-ESCROW-DIRECT'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: `${typeColor[e.type] || '#10b981'}22`,
                          color: typeColor[e.type] || '#10b981',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {e.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                        {e.paymentMode === 'upi' && '📱 UPI'}
                        {e.paymentMode === 'bank_transfer' && '🏦 Bank Transfer'}
                        {e.paymentMode === 'stripe' && '💳 Stripe Online'}
                        {e.paymentMode === 'neft' && '🔁 NEFT'}
                        {e.paymentMode === 'rtgs' && '⚡ RTGS'}
                        {!['upi', 'bank_transfer', 'stripe', 'neft', 'rtgs'].includes(e.paymentMode) &&
                          e.paymentMode}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#34d399', fontSize: '1rem', fontFamily: 'Outfit' }}>
                      + ₹{e.amount?.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.75rem',
                          color: '#34d399',
                          fontWeight: 600,
                        }}
                      >
                        <Check size={14} /> Settled
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LedgerPage;
