import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services';

const ProfilePage = () => {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    profile: {
      phone: user?.profile?.phone || '',
      location: user?.profile?.location || '',
      companyName: user?.profile?.companyName || '',
      bio: user?.profile?.bio || '',
      cropSpecialties: user?.profile?.cropSpecialties?.join(', ') || '',
    },
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const key = name.replace('profile.', '');
      setForm({ ...form, profile: { ...form.profile, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        profile: {
          ...form.profile,
          cropSpecialties: form.profile.cropSpecialties.split(',').map((s) => s.trim()).filter(Boolean),
        },
      };
      const res = await authService.updateMe(payload);
      login(res.data.user, token);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem' }}>My Profile</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>Manage your account information.</p>
      </div>

      {/* Avatar Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '1.8rem', color: '#fff', flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem' }}>{user?.name}</h3>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: 2 }}>{user?.email}</div>
          <span className={`badge badge-${user?.role === 'farmer' ? 'active' : 'accepted'}`} style={{ marginTop: 6 }}>
            {user?.role === 'farmer' ? '👨‍🌾 Farmer' : '🏢 Agribusiness'}
          </span>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="prof-name" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your full name" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input id="prof-phone" name="profile.phone" value={form.profile.phone} onChange={handleChange} className="form-input" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input id="prof-location" name="profile.location" value={form.profile.location} onChange={handleChange} className="form-input" placeholder="City, State" />
            </div>
          </div>

          {user?.role === 'agribusiness' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input id="prof-company" name="profile.companyName" value={form.profile.companyName} onChange={handleChange} className="form-input" placeholder="Your company name" />
            </div>
          )}

          {user?.role === 'farmer' && (
            <div className="form-group">
              <label className="form-label">Crop Specialties</label>
              <input id="prof-crops" name="profile.cropSpecialties" value={form.profile.cropSpecialties} onChange={handleChange} className="form-input" placeholder="Wheat, Rice, Cotton (comma separated)" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Bio / Description</label>
            <textarea id="prof-bio" name="profile.bio" value={form.profile.bio} onChange={handleChange} className="form-textarea" placeholder="Tell partners about yourself or your business..." style={{ minHeight: 90 }} />
          </div>

          <button id="prof-save" type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
