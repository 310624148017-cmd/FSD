import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ledgerService } from '../api/services';
import { StatusBadge } from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PAYMENT_TYPES = ['advance', 'milestone', 'final', 'penalty'];
const PAYMENT_MODES = [
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'neft', label: 'NEFT', icon: '🔁' },
  { value: 'rtgs', label: 'RTGS', icon: '⚡' },
  { value: 'cheque', label: 'Cheque', icon: '📄' },
  { value: 'cash', label: 'Cash', icon: '💵' },
];

const modeRefPlaceholder = {
  upi: 'UPI ID / Transaction ID',
  bank_transfer: 'UTR / Reference Number',
  neft: 'NEFT Reference Number',
  rtgs: 'RTGS UTR Number',
  cheque: 'Cheque Number',
  cash: 'Receipt Number (optional)',
};

const typeColor = { advance: 'var(--color-accent)', milestone: 'var(--color-secondary)', final: 'var(--color-primary)', penalty: 'var(--color-danger)' };
const typeEmoji = { advance: '⬆️', milestone: '🎯', final: '✅', penalty: '⚠️' };
const modeColor = ['#22c55e', '#3b82f6', '#a78bfa', '#f59e0b', '#ec4899', '#14b8a6'];

const LedgerPage = () => {
  const { contractId } = useParams();
  const { user } = useAuth();
  const isAgri = user.role === 'agribusiness';

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'advance', notes: '', paymentMode: 'bank_transfer', transactionReference: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    const [eRes, sRes] = await Promise.all([
      ledgerService.getByContract(contractId),
      ledgerService.getSummary(contractId),
    ]);
    setEntries(eRes.data.entries);
    setSummary(sRes.data.summary);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [contractId]);

  const handleRecord = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await ledgerService.record({ contractId, ...form });
      setSuccess('Payment recorded!');
      setForm({ amount: '', type: 'advance', notes: '', paymentMode: 'bank_transfer', transactionReference: '' });
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Build analytics data: group by paymentMode
  const modeBreakdown = PAYMENT_MODES.map((m, i) => ({
    name: m.label,
    icon: m.icon,
    amount: entries.filter((e) => e.paymentMode === m.value).reduce((s, e) => s + e.amount, 0),
    count: entries.filter((e) => e.paymentMode === m.value).length,
    color: modeColor[i],
  })).filter((d) => d.count > 0);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Payment Ledger</h1>
          <Link to={`/contracts/${contractId}`} style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>← Back to Contract</Link>
        </div>
        {isAgri && (
          <button id="btn-record-payment" className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Close' : '+ Record Payment'}
          </button>
        )}
      </div>

      {success && <div className="alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Value', value: `₹${summary.totalValue?.toLocaleString()}`, color: 'var(--color-text)' },
            { label: 'Amount Paid', value: `₹${summary.totalPaid?.toLocaleString()}`, color: 'var(--color-primary)' },
            { label: 'Outstanding', value: `₹${summary.outstanding?.toLocaleString()}`, color: 'var(--color-warning)' },
            { label: 'Transactions', value: entries.length, color: 'var(--color-secondary)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {summary && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Payment Progress — {summary.percentPaid}%</span>
            <StatusBadge status={summary.paymentStatus} />
          </div>
          <div style={{ height: 14, background: 'var(--color-border)', borderRadius: 7 }}>
            <div style={{
              height: '100%', borderRadius: 7,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              width: `${Math.min(100, parseFloat(summary.percentPaid))}%`,
              transition: 'width 0.8s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            <span>₹0</span><span>₹{summary.totalValue?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Payment Mode Analytics */}
      {modeBreakdown.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>💳 Payment Mode Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
            {/* Mode chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modeBreakdown.map((m, i) => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', flex: 1 }}>{m.icon} {m.name}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: m.color }}>₹{m.amount.toLocaleString()}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>({m.count}x)</span>
                </div>
              ))}
            </div>
            {/* Bar chart */}
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={modeBreakdown} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#888' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {modeBreakdown.map((m, i) => <Cell key={i} fill={m.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Record Payment Form */}
      {showForm && isAgri && (
        <div className="card fade-in" style={{ marginBottom: 24, borderLeft: '3px solid var(--color-primary)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Record New Payment</h3>
          <form onSubmit={handleRecord} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {formError && <div className="alert-error">{formError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input id="pay-amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="form-input" placeholder="Enter amount" required min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Type *</label>
                <select id="pay-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="form-select">
                  {PAYMENT_TYPES.map((t) => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PAYMENT_MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    id={`mode-${m.value}`}
                    onClick={() => setForm({ ...form, paymentMode: m.value, transactionReference: '' })}
                    style={{
                      padding: '6px 12px', borderRadius: 8,
                      border: `1px solid ${form.paymentMode === m.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: form.paymentMode === m.value ? 'rgba(34,197,94,0.1)' : 'var(--color-surface)',
                      color: form.paymentMode === m.value ? 'var(--color-primary)' : 'var(--color-muted)',
                      cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Transaction Reference</label>
                <input
                  id="pay-ref"
                  value={form.transactionReference}
                  onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
                  className="form-input"
                  placeholder={modeRefPlaceholder[form.paymentMode]}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input id="pay-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="form-input" placeholder="Optional note" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button id="pay-submit" type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Recording...' : '💳 Record Payment'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Ledger Table */}
      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>Date</th><th>Type</th><th>Mode</th><th>Amount</th><th>Reference</th><th>Status</th><th>Notes</th>
          </tr></thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 40 }}>
                No payments recorded yet.
              </td></tr>
            ) : entries.map((e) => {
              const modeInfo = PAYMENT_MODES.find((m) => m.value === e.paymentMode) || { icon: '💳', label: e.paymentMode };
              return (
                <tr key={e._id}>
                  <td style={{ color: 'var(--color-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {new Date(e.transactionDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500, textTransform: 'capitalize', color: typeColor[e.type] }}>
                      {typeEmoji[e.type]} {e.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {modeInfo.icon} {modeInfo.label}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>₹{e.amount?.toLocaleString()}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.transactionReference || '—'}
                  </td>
                  <td><StatusBadge status={e.status} /></td>
                  <td style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>{e.notes || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerPage;
