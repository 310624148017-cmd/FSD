import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, uploadService } from '../api/services';

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File must be smaller than 2MB.');
      return;
    }

    // Show preview
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
      setSuccess('Profile picture updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    setUploadLoading(true);
    try {
      await uploadService.deleteProfilePicture();
      login({ ...user, profilePicture: '' }, token);
      setPreviewUrl(null);
      setSuccess('Profile picture removed.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove picture.');
    } finally {
      setUploadLoading(false);
    }
  };

  const avatarUrl = previewUrl || (user?.profilePicture ? `http://localhost:5001${user.profilePicture}` : null);

  return (
    <div className="page-container fade-in" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem' }}>My Profile</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>Manage your account information and identity.</p>
      </div>

      {success && <div className="alert-success" style={{ marginBottom: 16 }}>{success}</div>}
      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Avatar + Aadhaar Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Avatar Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            title="Click to change photo"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
              />
            ) : (
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '2.2rem', color: '#fff',
                border: '3px solid var(--color-primary)',
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Camera overlay */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--color-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', border: '2px solid var(--color-bg)',
            }}>📷</div>
          </div>
          <input
            ref={fileInputRef}
            id="avatar-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          {previewUrl && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button id="upload-pic-btn" className="btn-primary" onClick={handleUpload} disabled={uploadLoading} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                {uploadLoading ? '...' : 'Save Photo'}
              </button>
              <button className="btn-secondary" onClick={() => { setPreviewUrl(null); fileInputRef.current.value = ''; }} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                Cancel
              </button>
            </div>
          )}
          {user?.profilePicture && !previewUrl && (
            <button id="remove-pic-btn" onClick={handleRemovePicture} disabled={uploadLoading} style={{ fontSize: '0.72rem', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Remove photo
            </button>
          )}
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textAlign: 'center' }}>JPG/PNG/WebP · Max 2MB</div>
        </div>

        {/* Info + Aadhaar Status */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{user?.name}</h3>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: 10 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <span className={`badge badge-${user?.role === 'farmer' ? 'active' : 'accepted'}`}>
              {user?.role === 'farmer' ? '👨‍🌾 Farmer' : '🏢 Agribusiness'}
            </span>
            {user?.aadhaar?.verified ? (
              <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                ✅ Aadhaar Verified
              </span>
            ) : (
              <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.75rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                ⚠️ Aadhaar Not Verified
              </span>
            )}
          </div>

          {/* Aadhaar CTA */}
          <div style={{ padding: '12px 16px', background: user?.aadhaar?.verified ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${user?.aadhaar?.verified ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius: 10 }}>
            {user?.aadhaar?.verified ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>🪪 {user.aadhaar.maskedNumber}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 2 }}>
                    Verified on {new Date(user.aadhaar.verifiedAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-warning)' }}>Verify your Aadhaar</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: 2 }}>Build trust with partners</div>
                </div>
                <Link to="/verify-aadhaar" id="goto-aadhaar" className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                  Verify Now →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Personal Information</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="prof-name" name="name" value={form.name} onChange={handleChange} className="form-input" />
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
              <input id="prof-company" name="profile.companyName" value={form.profile.companyName} onChange={handleChange} className="form-input" />
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
            <textarea id="prof-bio" name="profile.bio" value={form.profile.bio} onChange={handleChange} className="form-textarea" placeholder="Tell partners about yourself..." style={{ minHeight: 80 }} />
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
