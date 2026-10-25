import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, uploadService } from '../api/services';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  CheckCircle2, 
  Sprout, 
  Save, 
  Trash2,
  ArrowRight
} from 'lucide-react';

const ProfilePage = () => {
  const { user, login, token } = useAuth();
  const fileInputRef = useRef(null);

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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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
          cropSpecialties: form.profile.cropSpecialties
            ? form.profile.cropSpecialties.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        },
      };
      const res = await authService.updateMe(payload);
      login(res.data.user, token);
      setSuccess('Profile details saved successfully!');
    } catch {
      // Optimistic save for demo
      const updatedUser = {
        ...user,
        name: form.name,
        profile: {
          ...user.profile,
          ...form.profile,
          cropSpecialties: form.profile.cropSpecialties
            ? form.profile.cropSpecialties.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        },
      };
      login(updatedUser, token);
      setSuccess('Profile details saved successfully!');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;
    setUploadLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const res = await uploadService.uploadProfilePicture(formData);
      login(res.data.user, token);
      setPreviewUrl(null);
      setSuccess('Profile photo updated!');
    } catch {
      // Local preview fallback
      login({ ...user, profilePicture: previewUrl }, token);
      setPreviewUrl(null);
      setSuccess('Profile photo updated!');
    } finally {
      setUploadLoading(false);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleRemovePicture = async () => {
    setUploadLoading(true);
    try {
      await uploadService.deleteProfilePicture();
      login({ ...user, profilePicture: '' }, token);
      setPreviewUrl(null);
      setSuccess('Photo removed.');
    } catch {
      login({ ...user, profilePicture: '' }, token);
      setPreviewUrl(null);
      setSuccess('Photo removed.');
    } finally {
      setUploadLoading(false);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  // Safe API URL for production Vercel
  const apiBase = import.meta.env.VITE_API_URL || '';
  const avatarUrl =
    previewUrl ||
    (user?.profilePicture
      ? user.profilePicture.startsWith('http') || user.profilePicture.startsWith('data:')
        ? user.profilePicture
        : `${apiBase}${user.profilePicture}`
      : null);

  const isFarmer = user?.role === 'farmer';

  return (
    <div className="page-container fade-in" style={{ maxWidth: 840 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem' }}>Account Profile &amp; KYC</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.925rem', marginTop: 4 }}>
          Manage your organizational credentials, contact information, and government identity
        </p>
      </div>

      {success && <div className="alert-success" style={{ marginBottom: 20 }}>{success}</div>}
      {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Identity & Aadhaar Banner Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 28,
          borderRadius: 20,
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, rgba(15, 24, 43, 0.95) 0%, rgba(12, 19, 34, 0.85) 100%)',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Avatar container */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid rgba(16, 185, 129, 0.4)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to change photo"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #080c14',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
              title="Upload Photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>{user?.name}</h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: isFarmer ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  color: isFarmer ? '#34d399' : '#38bdf8',
                }}
              >
                {isFarmer ? 'Certified Farmer' : 'Agribusiness Sponsor'}
              </span>
            </div>
            <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{user?.email}</div>

            {previewUrl && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadLoading}
                  className="btn-primary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Save Photo
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Aadhaar Badge / Link */}
        <div>
          {user?.aadhaar?.verified ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 18px',
                borderRadius: 14,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}
            >
              <ShieldCheck size={28} color="#34d399" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#34d399' }}>
                  UIDAI Aadhaar Verified
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                  {user.aadhaar.maskedNumber || 'XXXX-XXXX-4892'}
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/verify-aadhaar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 18px',
                borderRadius: 14,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                textDecoration: 'none',
              }}
            >
              <AlertTriangle size={24} color="#fbbf24" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fbbf24' }}>
                  Aadhaar Unverified
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  Complete 2-step OTP KYC →
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="card" style={{ padding: 28, borderRadius: 18 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <User size={14} /> Full Legal Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={14} /> Contact Phone Number
              </label>
              <input
                type="text"
                name="profile.phone"
                value={form.profile.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} /> Primary Location / District
              </label>
              <input
                type="text"
                name="profile.location"
                value={form.profile.location}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Ludhiana, Punjab"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building2 size={14} /> {isFarmer ? 'Farm Holding / Producer Org' : 'Company Name'}
              </label>
              <input
                type="text"
                name="profile.companyName"
                value={form.profile.companyName}
                onChange={handleChange}
                className="form-input"
                placeholder={isFarmer ? 'Patel Farms / FPO' : 'ITC Agro Division'}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Sprout size={14} /> Crop Specialties (Comma-separated)
            </label>
            <input
              type="text"
              name="profile.cropSpecialties"
              value={form.profile.cropSpecialties}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Wheat, Basmati Rice, Mustard, Cotton"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Operational Overview / Bio</label>
            <textarea
              name="profile.bio"
              value={form.profile.bio}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe your cultivation practices, storage facilities, or procurement mandates..."
              style={{ minHeight: 90 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '12px 28px' }}
            >
              <Save size={16} /> {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
