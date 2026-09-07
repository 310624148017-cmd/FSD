import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.register(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse 70% 50% at 70% 30%, rgba(59,130,246,0.08) 0%, transparent 50%),
                   radial-gradient(ellipse 50% 40% at 20% 70%, rgba(34,197,94,0.07) 0%, transparent 50%)`,
      padding: 24,
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 32 }}>🌾</span>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem' }} className="gradient-text">AgriContract</span>
          </Link>
          <h2 style={{ marginTop: 16, fontSize: '1.6rem' }}>Create your account</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>Join the platform as a Farmer or Agribusiness</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {['farmer', 'agribusiness'].map((role) => (
            <button
              key={role}
              type="button"
              id={`role-${role}`}
              onClick={() => setForm({ ...form, role })}
              style={{
                padding: '16px 12px',
                borderRadius: 12,
                border: `2px solid ${form.role === role ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: form.role === role ? 'rgba(34,197,94,0.1)' : 'var(--color-card)',
                color: form.role === role ? 'var(--color-primary)' : 'var(--color-muted)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{role === 'farmer' ? '👨‍🌾' : '🏢'}</div>
              <div style={{ textTransform: 'capitalize' }}>{role}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 400, marginTop: 2, color: 'var(--color-muted)' }}>
                {role === 'farmer' ? 'Accept & track contracts' : 'Create & manage contracts'}
              </div>
            </button>
          ))}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="reg-name" type="text" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your full name" required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="reg-password" type="password" name="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Min. 6 characters" required minLength={6} />
            </div>

            <button id="reg-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, justifyContent: 'center' }}>
              {loading ? 'Creating account...' : `Create ${form.role === 'farmer' ? 'Farmer' : 'Agribusiness'} Account →`}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
