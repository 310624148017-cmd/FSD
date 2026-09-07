import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ledgerService } from '../api/services';
import { StatusBadge } from '../components/StatusBadge';

const PAYMENT_TYPES = ['advance', 'milestone', 'final', 'penalty'];

const LedgerPage = () => {
  const { contractId } = useParams();
  const { user } = useAuth();
  const isAgri = user.role === 'agribusiness';

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'advance', notes: '' });
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
      setSuccess('Payment recorded successfully!');
      setForm({ amount: '', type: 'advance', notes: '' });
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const typeColor = { advance: 'var(--color-accent)', milestone: 'var(--color-secondary)', final: 'var(--color-primary)', penalty: 'var(--color-danger)' };
  const typeEmoji = { advance: '⬆️', milestone: '🎯', final: '✅', penalty: '⚠️' };

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Contract Value', value: `₹${summary.totalValue?.toLocaleString()}`, color: 'var(--color-text)' },
            { label: 'Amount Paid', value: `₹${summary.totalPaid?.toLocaleString()}`, color: 'var(--color-primary)' },
            { label: 'Outstanding', value: `₹${summary.outstanding?.toLocaleString()}`, color: 'var(--color-warning)' },
            { label: 'Completion', value: `${summary.percentPaid}%`, color: 'var(--color-secondary)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {summary && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Payment Progress</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            <span>₹0</span><span>₹{summary.totalValue?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Record Payment Form */}
      {showForm && isAgri && (
        <div className="card fade-in" style={{ marginBottom: 24, borderLeft: '3px solid var(--color-primary)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Record New Payment</h3>
          <form onSubmit={handleRecord} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            {formError && <div className="alert-error" style={{ gridColumn: '1/-1' }}>{formError}</div>}
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input id="pay-amount" type="number" name="amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="form-input" placeholder="Enter amount" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Type *</label>
              <select id="pay-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="form-select">
                {PAYMENT_TYPES.map((t) => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input id="pay-notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="form-input" placeholder="Reference note" />
            </div>
            <button id="pay-submit" type="submit" className="btn-primary" disabled={submitting} style={{ marginBottom: 0 }}>
              {submitting ? '...' : 'Record'}
            </button>
          </form>
        </div>
      )}

      {/* Ledger Table */}
      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>Date</th><th>Type</th><th>Amount</th><th>Farmer</th><th>Status</th><th>Notes</th>
          </tr></thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 40 }}>
                No payments recorded yet.
              </td></tr>
            ) : entries.map((e) => (
              <tr key={e._id}>
                <td style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                  {new Date(e.transactionDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, textTransform: 'capitalize', color: typeColor[e.type] }}>
                    {typeEmoji[e.type]} {e.type}
                  </span>
                </td>
                <td style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>₹{e.amount?.toLocaleString()}</td>
                <td>{e.farmer?.name}</td>
                <td><StatusBadge status={e.status} /></td>
                <td style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>{e.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerPage;
