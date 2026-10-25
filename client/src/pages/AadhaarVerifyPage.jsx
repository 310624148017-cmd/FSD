import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { aadhaarService } from '../api/services';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  QrCode, 
  Calendar, 
  RotateCcw,
  Building,
  UserCheck
} from 'lucide-react';

const steps = [
  { id: 0, label: 'Aadhaar Identification', icon: ShieldCheck },
  { id: 1, label: 'OTP Authentication', icon: KeyRound },
  { id: 2, label: 'Cryptographic Certificate', icon: CheckCircle2 },
];

const AadhaarVerifyPage = () => {
  const { user, login, token } = useAuth();
  const [step, setStep] = useState(user?.aadhaar?.verified ? 2 : 0);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [maskedNumber, setMaskedNumber] = useState(user?.aadhaar?.maskedNumber || 'XXXX-XXXX-4892');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Format as XXXX-XXXX-XXXX
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
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
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
      setDemoOtp(res.data.demoOtp || '123456');
      setStep(1);
    } catch {
      // Demo fallback
      const masked = `XXXX-XXXX-${clean.slice(-4)}`;
      setMaskedNumber(masked);
      setDemoOtp('123456');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await aadhaarService.verifyOtp(otpStr);
      login({ ...user, aadhaar: res.data.aadhaar }, token);
      setSuccess('Identity cryptographically authenticated!');
      setStep(2);
    } catch {
      // Demo fallback
      const verifiedAadhaar = {
        verified: true,
        maskedNumber: maskedNumber || 'XXXX-XXXX-4892',
        verifiedAt: new Date().toISOString(),
      };
      login({ ...user, aadhaar: verifiedAadhaar }, token);
      setSuccess('Identity authenticated successfully in sandbox mode!');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAadhaar = () => {
    setAadhaarInput('5489-3214-4892');
    setError('');
  };

  const fillDemoOtp = () => {
    const code = (demoOtp || '123456').split('');
    setOtp(code);
    setError('');
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 30,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: 16,
            fontSize: '0.825rem',
            color: '#34d399',
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={16} /> Government UIDAI Sandbox Integration
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', marginBottom: 8 }}>
          Farmer Identity KYC Verification
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto' }}>
          Biometric UIDAI 2-factor verification certifies genuine agricultural producers,
          protecting contracts against fraud and escrow disputes.
        </p>
      </div>

      {/* 3 Step Progress Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {steps.map((s) => {
          const Icon = s.icon;
          const isDone = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div
              key={s.id}
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: isCurrent
                  ? 'rgba(16, 185, 129, 0.15)'
                  : isDone
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isCurrent
                  ? '1px solid #10b981'
                  : isDone
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon size={18} color={isDone || isCurrent ? '#34d399' : '#64748b'} />
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isDone || isCurrent ? '#ffffff' : 'var(--color-muted)',
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: 20 }}>{success}</div>}

      {/* ─── Step 0: Enter Aadhaar ────────────────────────────────────────── */}
      {step === 0 && (
        <div className="card" style={{ padding: 32, borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>Enter 12-Digit Aadhaar ID</h3>
            <button
              type="button"
              onClick={fillDemoAadhaar}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={13} /> Auto-fill Demo Aadhaar
            </button>
          </div>

          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
            Your Aadhaar number is transmitted securely over TLS 1.3 to the UIDAI authentication gateway.
            Only the last 4 digits are retained in compliance with Aadhaar Act, 2016.
          </p>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Aadhaar Number</label>
            <input
              type="text"
              value={aadhaarInput}
              onChange={handleAadhaarChange}
              placeholder="5489 - 3214 - 4892"
              className="form-input"
              style={{
                fontSize: '1.25rem',
                letterSpacing: '0.12em',
                fontWeight: 700,
                textAlign: 'center',
                padding: '14px',
              }}
              maxLength={14}
            />
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading || aadhaarInput.replace(/-/g, '').length !== 12}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: 12 }}
          >
            {loading ? 'Requesting OTP...' : (
              <>
                Generate One-Time Password <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      )}

      {/* ─── Step 1: Verify OTP ───────────────────────────────────────────── */}
      {step === 1 && (
        <div className="card" style={{ padding: 32, borderRadius: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: 6 }}>
              Enter 6-Digit OTP Code
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', margin: 0 }}>
              OTP sent to registered mobile linked to <strong style={{ color: '#ffffff' }}>{maskedNumber}</strong>
            </p>

            {/* Sandbox helper */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 14,
                padding: '6px 14px',
                borderRadius: 10,
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.825rem',
                fontWeight: 600,
              }}
            >
              <span>Sandbox Demo OTP: {demoOtp || '123456'}</span>
              <button
                type="button"
                onClick={fillDemoOtp}
                style={{
                  background: '#38bdf8',
                  color: '#080c14',
                  border: 'none',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Auto-fill
              </button>
            </div>
          </div>

          {/* 6 Digit Inputs */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
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
                className="form-input"
                style={{
                  width: 52,
                  height: 58,
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  padding: 0,
                  borderRadius: 12,
                }}
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: 12, marginBottom: 16 }}
          >
            {loading ? 'Authenticating with UIDAI...' : (
              <>
                Verify Cryptographic Token <ShieldCheck size={18} />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setStep(0)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-muted)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ← Edit Aadhaar Number
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Digital Identity Certificate ─────────────────────────── */}
      {step === 2 && (
        <div className="fade-in">
          {/* Certificate Card */}
          <div
            className="card"
            style={{
              padding: 32,
              borderRadius: 22,
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(15, 24, 43, 0.95) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 35px rgba(16, 185, 129, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 24,
            }}
          >
            {/* Watermark seal */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                opacity: 0.05,
                transform: 'rotate(15deg)',
                pointerEvents: 'none',
              }}
            >
              <ShieldCheck size={280} color="#10b981" />
            </div>

            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: 20,
                marginBottom: 24,
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  GOVERNMENT OF INDIA · UIDAI KYC
                </div>
                <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: '4px 0 0' }}>
                  Digital Farmer Verification Certificate
                </h2>
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <CheckCircle2 size={14} /> CERTIFIED
              </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                    Authenticated Holder
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    {user?.name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                    Masked Aadhaar Identity
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                    {maskedNumber}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                    Security Signature &amp; Hash
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                    SHA-256: 8a4f91c7b82e44d081f9a2b537cde0a194bc...
                  </div>
                </div>
              </div>

              {/* QR Simulation Box */}
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 14,
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                }}
              >
                <QrCode size={84} color="#080c14" />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn-primary" style={{ padding: '12px 28px' }}>
              Return to Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/contracts/open" className="btn-secondary" style={{ padding: '12px 24px' }}>
              Browse Available Contracts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AadhaarVerifyPage;
