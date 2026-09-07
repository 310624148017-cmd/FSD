import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateService } from '../api/services';

const healthOptions = ['excellent', 'good', 'fair', 'poor', 'critical'];
const impactOptions = ['positive', 'neutral', 'negative'];

const healthEmojis = { excellent: '🌟', good: '✅', fair: '🟡', poor: '🟠', critical: '🔴' };

const CropUpdateFormPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    weekNumber: '', cropHealth: 'good', estimatedYieldTons: '',
    weatherCondition: '', weatherImpact: 'neutral', notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await updateService.create({ ...form, contractId });
      navigate(`/contracts/${contractId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem' }}>Log Weekly Crop Update</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Document this week's crop conditions for your agribusiness partner.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div className="alert-error">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Week Number *</label>
              <input id="week-number" type="number" name="weekNumber" value={form.weekNumber} onChange={handleChange} className="form-input" placeholder="e.g. 4" required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Yield (tons) *</label>
              <input id="est-yield" type="number" name="estimatedYieldTons" value={form.estimatedYieldTons} onChange={handleChange} className="form-input" placeholder="e.g. 45.5" required min="0" step="0.1" />
            </div>
          </div>

          {/* Crop Health Selector */}
          <div className="form-group">
            <label className="form-label">Crop Health *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {healthOptions.map((h) => (
                <button
                  key={h}
                  type="button"
                  id={`health-${h}`}
                  onClick={() => setForm({ ...form, cropHealth: h })}
                  style={{
                    padding: '8px 14px', borderRadius: 8,
                    border: `1px solid ${form.cropHealth === h ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: form.cropHealth === h ? 'rgba(34,197,94,0.12)' : 'var(--color-surface)',
                    color: form.cropHealth === h ? 'var(--color-primary)' : 'var(--color-muted)',
                    cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}
                >
                  {healthEmojis[h]} {h}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Weather Condition *</label>
              <input id="weather-cond" name="weatherCondition" value={form.weatherCondition} onChange={handleChange} className="form-input" placeholder="e.g. Heavy rainfall, Sunny, Drought" required />
            </div>
            <div className="form-group">
              <label className="form-label">Weather Impact</label>
              <select id="weather-impact" name="weatherImpact" value={form.weatherImpact} onChange={handleChange} className="form-select">
                {impactOptions.map((i) => <option key={i} value={i} style={{ textTransform: 'capitalize' }}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea id="update-notes" name="notes" value={form.notes} onChange={handleChange} className="form-textarea" placeholder="Observations, challenges, upcoming plans..." style={{ minHeight: 90 }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button id="update-submit" type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Saving...' : '📋 Submit Update'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropUpdateFormPage;
