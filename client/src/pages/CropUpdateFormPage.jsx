import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { updateService } from '../api/services';
import { 
  ArrowLeft, 
  Calendar, 
  Scale, 
  CloudSun, 
  FileText, 
  CheckCircle2, 
  Sprout,
  AlertTriangle
} from 'lucide-react';

const healthOptions = [
  { value: 'excellent', label: 'Excellent', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { value: 'good', label: 'Good', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.15)' },
  { value: 'fair', label: 'Fair / Moderate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { value: 'poor', label: 'Poor / At Risk', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  { value: 'critical', label: 'Critical / Pests', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
];

const impactOptions = [
  { value: 'positive', label: 'Positive (Accelerating Growth)' },
  { value: 'neutral', label: 'Neutral (Normal Conditions)' },
  { value: 'negative', label: 'Negative (Stress / Risk)' },
];

const CropUpdateFormPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    weekNumber: '',
    cropHealth: 'good',
    estimatedYieldTons: '',
    weatherCondition: '',
    weatherImpact: 'neutral',
    notes: '',
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
      // Local optimistic redirect
      navigate(`/contracts/${contractId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: 680 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
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

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem' }}>Log Weekly Crop Surveillance</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.925rem', marginTop: 4 }}>
          Keep your agribusiness sponsor informed of crop health, meteorological conditions, and revised harvest estimates
        </p>
      </div>

      <div className="card" style={{ padding: 28, borderRadius: 18 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <div className="alert-error">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} /> Cultivation Week Number *
              </label>
              <input
                id="week-number"
                type="number"
                name="weekNumber"
                value={form.weekNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 5"
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Scale size={14} /> Projected Harvest Yield (Tons) *
              </label>
              <input
                id="est-yield"
                type="number"
                name="estimatedYieldTons"
                value={form.estimatedYieldTons}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 98.5"
                required
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Crop Health Selection */}
          <div className="form-group">
            <label className="form-label">
              <Sprout size={14} /> Current Crop Health Status *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
              {healthOptions.map((h) => {
                const isSelected = form.cropHealth === h.value;
                return (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => setForm({ ...form, cropHealth: h.value })}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? h.color : 'var(--color-border)'}`,
                      background: isSelected ? h.bg : 'rgba(15, 24, 43, 0.6)',
                      color: isSelected ? '#ffffff' : 'var(--color-muted)',
                      fontSize: '0.825rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <CloudSun size={14} /> Weather Observed *
              </label>
              <input
                id="weather-cond"
                name="weatherCondition"
                value={form.weatherCondition}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Clear skies, mild winter 22°C"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weather Impact</label>
              <select
                id="weather-impact"
                name="weatherImpact"
                value={form.weatherImpact}
                onChange={handleChange}
                className="form-select"
              >
                {impactOptions.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Agronomic Notes &amp; Observations</label>
            <textarea
              id="update-notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe soil moisture, flowering stage, fertilizer applied, or pest inspection findings..."
              style={{ minHeight: 100 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              id="update-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ flex: 1, padding: '12px 24px' }}
            >
              {loading ? 'Submitting...' : 'Post Weekly Surveillance Log →'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropUpdateFormPage;
