import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contractService } from '../api/services';

const ContractFormPage = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: '', cropType: '', requiredQuantityTons: '', pricePerTon: '', deadline: '', terms: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const estimatedValue = form.requiredQuantityTons && form.pricePerTon
    ? (parseFloat(form.requiredQuantityTons) * parseFloat(form.pricePerTon)).toLocaleString('en-IN')
    : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await contractService.update(id, form);
        navigate(`/contracts/${id}`);
      } else {
        const res = await contractService.create(form);
        navigate(`/contracts/${res.data.contract._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contract.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem' }}>{isEdit ? 'Edit Contract' : 'Create New Contract'}</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          {isEdit ? 'Modify the contract details below.' : 'Fill in the contract terms to publish an offer for farmers.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Contract Title *</label>
              <input id="contract-title" name="title" value={form.title} onChange={handleChange} className="form-input" placeholder="e.g. Wheat Supply Agreement 2024" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Crop Type *</label>
                <input id="contract-crop" name="cropType" value={form.cropType} onChange={handleChange} className="form-input" placeholder="e.g. Wheat, Rice, Cotton" required />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline *</label>
                <input id="contract-deadline" type="date" name="deadline" value={form.deadline} onChange={handleChange} className="form-input" required min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Required Quantity (tons) *</label>
                <input id="contract-qty" type="number" name="requiredQuantityTons" value={form.requiredQuantityTons} onChange={handleChange} className="form-input" placeholder="e.g. 50" required min="0.1" step="0.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Ton (₹) *</label>
                <input id="contract-price" type="number" name="pricePerTon" value={form.pricePerTon} onChange={handleChange} className="form-input" placeholder="e.g. 25000" required min="1" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contract Terms & Conditions</label>
              <textarea id="contract-terms" name="terms" value={form.terms} onChange={handleChange} className="form-textarea" placeholder="Describe quality standards, delivery conditions, penalties, etc." style={{ minHeight: 120 }} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button id="contract-submit" type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? 'Saving...' : isEdit ? 'Update Contract' : 'Publish Contract →'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="card" style={{ minWidth: 200, position: 'sticky', top: 80 }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Preview</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '🌾 Crop', value: form.cropType || '—' },
              { label: '⚖️ Quantity', value: form.requiredQuantityTons ? `${form.requiredQuantityTons} tons` : '—' },
              { label: '💰 Rate', value: form.pricePerTon ? `₹${parseInt(form.pricePerTon).toLocaleString()}/ton` : '—' },
              { label: '📅 Deadline', value: form.deadline ? new Date(form.deadline).toLocaleDateString('en-IN') : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: 2 }}>{value}</div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>💎 Total Value</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>
                {estimatedValue === '—' ? '—' : `₹${estimatedValue}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractFormPage;
