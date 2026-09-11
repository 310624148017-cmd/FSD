import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aadhaarService } from '../api/services';
import { Link } from 'react-router-dom';

const steps = ['Enter Aadhaar', 'Verify OTP', 'Done'];

const AadhaarVerifyPage = () => {
  const { user, login, token } = useAuth();
  const [step, setStep] = useState(user?.aadhaar?.verified ? 2 : 0);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [maskedNumber, setMaskedNumber] = useState(user?.aadhaar?.maskedNumber || '');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Format Aadhaar input as XXXX-XXXX-XXXX
  const formatAadhaar = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join('-')
    );
  };

  const handleAadhaarChange = (e) => {
    setAadhaarInput(formatAadhaar(e.target.value));
    setError('');
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    setError('');
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleSendOtp = async () => {
    const clean = aadhaarInput.replace(/-/g, '');
    if (clean.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await aadhaarService.sendOtp(clean);
      setMaskedNumber(res.data.maskedNumber);
      setDemoOtp(res.data.demoOtp);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await aadhaarService.verifyOtp(otpStr);
      login({ ...user, aadhaar: res.data.aadhaar }, token);
      setSuccess(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const alreadyVerified = user?.aadhaar?.verified;

  return (
    <div className="page-container fade-in" style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 32 }}>
        <Link to="/profile" style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>← Back to Profile</Link>
        <h1 style={{ fontSize: '1.8rem', marginTop: 12 }}>Aadhaar Verification</h1>
        <p style={{ color: 'var(--color-muted)', marginTop: 4, fontSize: '0.9rem' }}>
          Verify your identity using your Aadhaar card to build trust with partners.
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: i <= step
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                  : 'var(--color-card)',
                border: `2px solid ${i <= step ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: i < step ? '1rem' : '0.85rem', fontWeight: 700,
                color: i <= step ? '#fff' : 'var(--color-muted)',
                transition: 'all 0.3s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: '0.72rem', color: i <= step ? 'var(--color-primary)' : 'var(--color-muted)', whiteSpace: 'nowrap' }}>{s}</div>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--color-primary)' : 'var(--color-border)', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s' }} />}
          </div>
        ))}
      </div>

      {/* Step 0 — Enter Aadhaar */}
      {step === 0 && (
        <div className="card fade-in">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>🪪</div>
            <h3 style={{ fontSize: '1.2rem' }}>Enter your Aadhaar Number</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              Your 12-digit Aadhaar number printed on your card.
            </p>
          </div>

          {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Aadhaar Number</label>
            <input
              id="aadhaar-input"
              type="text"
              value={aadhaarInput}
              onChange={handleAadhaarChange}
              className="form-input"
              placeholder="XXXX-XXXX-XXXX"
              style={{ fontSize: '1.2rem', letterSpacing: '0.15em', textAlign: 'center' }}
              maxLength={14}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 4 }}>
              {aadhaarInput.replace(/-/g, '').length}/12 digits
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--color-warning)', marginBottom: 20 }}>
            ⚠️ <strong>Demo Mode:</strong> This is a simulated verification. OTP will be shown on screen for testing purposes.
          </div>

          <button id="aadhaar-send-otp" className="btn-primary" onClick={handleSendOtp} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Sending OTP...' : 'Send OTP →'}
          </button>
        </div>
      )}

      {/* Step 1 — Verify OTP */}
      {step === 1 && (
        <div className="card fade-in">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>📱</div>
            <h3 style={{ fontSize: '1.2rem' }}>Enter OTP</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              OTP sent to mobile linked with <strong>{maskedNumber}</strong>
            </p>
          </div>

          {/* Demo OTP display */}
          {demoOtp && (
            <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4 }}>🧪 Demo OTP (not shown in production)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-primary)', letterSpacing: '0.3em' }}>{demoOtp}</div>
            </div>
          )}

          {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          {/* OTP input boxes */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                style={{
                  width: 52, height: 60, textAlign: 'center',
                  fontSize: '1.5rem', fontWeight: 700,
                  background: 'var(--color-surface)',
                  border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 10, color: 'var(--color-text)',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
              />
            ))}
          </div>

          <button id="aadhaar-verify-otp" className="btn-primary" onClick={handleVerifyOtp} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Verifying...' : '✅ Verify OTP'}
          </button>

          <button className="btn-secondary" onClick={() => { setStep(0); setOtp(['','','','','','']); setError(''); }} style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
            ← Change Aadhaar Number
          </button>
        </div>
      )}

      {/* Step 2 — Verified */}
      {step === 2 && (
        <div className="card fade-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }} className="gradient-text">Aadhaar Verified!</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: 20 }}>
            Your identity has been successfully verified.
          </p>

          {(user?.aadhaar?.maskedNumber || maskedNumber) && (
            <div style={{ padding: '14px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, marginBottom: 24, display: 'inline-block' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4 }}>Verified Aadhaar</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--color-primary)' }}>
                {user?.aadhaar?.maskedNumber || maskedNumber}
              </div>
              {user?.aadhaar?.verifiedAt && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 4 }}>
                  Verified on {new Date(user.aadhaar.verifiedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/profile" className="btn-primary">Go to Profile</Link>
            <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AadhaarVerifyPage;
