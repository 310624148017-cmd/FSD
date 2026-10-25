import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { contractService } from '../api/services';
import { 
  FileText, 
  Scale, 
  IndianRupee, 
  Calendar, 
  ArrowLeft, 
  PlusCircle, 
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const ContractFormPage = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: '',
    cropType: '',
    requiredQuantityTons: '',
    pricePerTon: '',
    deadline: '',
    terms: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      contractService.getById(id).then((res) => {
        const c = res.data.contract;
        if (c) {
          setForm({
            title: c.title || '',
            cropType: c.cropType || '',
            requiredQuantityTons: c.requiredQuantityTons || '',
            pricePerTon: c.pricePerTon || '',
            deadline: c.deadline ? c.deadline.split('T')[0] : '',
            terms: c.terms || '',
          });
        }
      }).catch(() => {
        // Check localStorage
        try {
          const locals = JSON.parse(localStorage.getItem('cfm_local_contracts') || '[]');
          const found = locals.find((c) => c._id === id);
          if (found) {
            setForm({
              title: found.title || '',
              cropType: found.cropType || '',
              requiredQuantityTons: found.requiredQuantityTons || '',
              pricePerTon: found.pricePerTon || '',
              deadline: found.deadline ? found.deadline.split('T')[0] : '',
              terms: found.terms || '',
            });
          }
        } catch {}
      });
    }
  }, [isEdit, id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const qty = parseFloat(form.requiredQuantityTons) || 0;
  const price = parseFloat(form.pricePerTon) || 0;
  const totalValue = qty * price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const contractData = {
      ...form,
      requiredQuantityTons: qty,
      pricePerTon: price,
      totalValue: qty * price,
      deadline: form.deadline || new Date(Date.now() + 90 * 86400000).toISOString(),
    };

    try {
      if (isEdit) {
        await contractService.update(id, contractData);
        // Sync local storage
        try {
          const locals = JSON.parse(localStorage.getItem('cfm_local_contracts') || '[]');
          const idx = locals.findIndex((c) => c._id === id);
          if (idx !== -1) {
            locals[idx] = { ...locals[idx], ...contractData };
            localStorage.setItem('cfm_local_contracts', JSON.stringify(locals));
          }
        } catch {}
        navigate(`/contracts/${id}`);
      } else {
        const res = await contractService.create(contractData);
        const created = res.data?.contract || {
          _id: 'c-' + Date.now(),
          ...contractData,
          status: 'open',
          amountPaid: 0,
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
        };

        // Persist to local client storage as well
        try {
          const locals = JSON.parse(localStorage.getItem('cfm_local_contracts') || '[]');
          locals.unshift(created);
          localStorage.setItem('cfm_local_contracts', JSON.stringify(locals));
        } catch {}

        navigate(`/contracts/${created._id}`);
      }
    } catch (err) {
      // Local fallback creation
      const localId = 'c-' + Date.now();
      const fallbackContract = {
        _id: localId,
        ...contractData,
        status: 'open',
        amountPaid: 0,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
      };
      try {
        const locals = JSON.parse(localStorage.getItem('cfm_local_contracts') || '[]');
        locals.unshift(fallbackContract);
        localStorage.setItem('cfm_local_contracts', JSON.stringify(locals));
      } catch {}
      navigate(`/contracts/${localId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: 960 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/contracts"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--color-muted)',
            fontSize: '0.85rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Contracts
        </Link>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem' }}>
          {isEdit ? 'Modify Contract Terms' : 'Publish New Agricultural Contract Offer'}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.925rem', marginTop: 4 }}>
          Specify procurement volume, guaranteed floor rate, quality criteria, and delivery deadlines
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Form Card */}
        <div className="card" style={{ padding: 28, borderRadius: 18 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">
                <FileText size={14} /> Contract Title *
              </label>
              <input
                id="contract-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Sharbati Wheat Procurement Season 2025"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">🌾 Crop Variety *</label>
                <input
                  id="contract-crop"
                  name="cropType"
                  value={form.cropType}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Wheat, Basmati Rice, Cotton, Sugarcane"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} /> Delivery Deadline *
                </label>
                <input
                  id="contract-deadline"
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">
                  <Scale size={14} /> Required Volume (Tons) *
                </label>
                <input
                  id="contract-qty"
                  type="number"
                  name="requiredQuantityTons"
                  value={form.requiredQuantityTons}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. 100"
                  required
                  min="0.1"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <IndianRupee size={14} /> Guaranteed Price / Ton (₹) *
                </label>
                <input
                  id="contract-price"
                  type="number"
                  name="pricePerTon"
                  value={form.pricePerTon}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. 26500"
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Quality Standards &amp; SLA Terms</label>
              <textarea
                id="contract-terms"
                name="terms"
                value={form.terms}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Specify moisture tolerance (e.g. < 12%), grain size, delivery terminal location, and milestone conditions..."
                style={{ minHeight: 120 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                id="contract-submit"
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ padding: '12px 24px', flex: 1 }}
              >
                {loading
                  ? 'Saving Contract...'
                  : isEdit
                  ? 'Save Contract Amendments'
                  : 'Publish Contract Offer →'}
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

        {/* Live Preview Card */}
        <div
          className="card"
          style={{
            position: 'sticky',
            top: 90,
            padding: 22,
            borderRadius: 18,
            background: 'rgba(12, 19, 34, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#34d399',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            <Sparkles size={14} /> Live Contract Preview
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Crop &amp; Title
              </div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem', marginTop: 2 }}>
                {form.title || 'Untitled Offer'}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#38bdf8' }}>
                {form.cropType ? `🌾 ${form.cropType}` : 'No crop selected'}
              </div>
            </div>

            <div style={{ padding: '10px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--color-muted)' }}>Volume:</span>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>
                  {form.requiredQuantityTons ? `${form.requiredQuantityTons} tons` : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>Rate / Ton:</span>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>
                  {form.pricePerTon ? `₹${parseFloat(form.pricePerTon).toLocaleString('en-IN')}` : '—'}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Total Escrow Floor Commitment
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  color: '#34d399',
                  marginTop: 2,
                }}
              >
                ₹{totalValue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 4 }}>
                Floor amount locked upon farmer acceptance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractFormPage;
