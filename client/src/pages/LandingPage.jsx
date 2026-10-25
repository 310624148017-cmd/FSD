import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  FileCheck2, 
  TrendingUp, 
  Receipt, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  Coins, 
  Sparkles,
  BarChart3,
  Calendar,
  Lock
} from 'lucide-react';

const stats = [
  { value: '2,400+', label: 'Active Contracts', icon: FileCheck2 },
  { value: '₹48 Cr+', label: 'Total Payouts', icon: Coins },
  { value: '850+', label: 'Verified Farmers', icon: UserCheck },
  { value: '120+', label: 'Agribusiness Partners', icon: Building2 },
];

const features = [
  {
    icon: FileCheck2,
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.12)',
    title: 'Digital Smart Contracts',
    desc: 'Standardized agricultural agreements with predefined tonnage, guaranteed floor pricing, delivery schedules, and clear legal terms.',
  },
  {
    icon: TrendingUp,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    title: 'Agronomic Crop Monitoring',
    desc: 'Farmers post structured weekly health logs, weather condition alerts, and estimated yield projections directly to sponsors.',
  },
  {
    icon: Receipt,
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.12)',
    title: 'Transparent Multi-Mode Ledger',
    desc: 'Automate advance deposits, cultivation milestones, and final settlements via UPI, Bank Transfer (NEFT/RTGS), or Stripe.',
  },
  {
    icon: ShieldCheck,
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.12)',
    title: 'UIDAI Aadhaar Verification',
    desc: 'Government-grade 2-factor OTP verification ensuring identity integrity and eliminating middleman fraud.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Publish Agreement',
    desc: 'Agribusiness creates a contract specifying crop variety, required tonnage, delivery deadline, and price per ton.',
  },
  {
    step: '02',
    title: 'Farmer Review & Accept',
    desc: 'Verified farmers browse nearby open offers, inspect terms, and bind the agreement with one secure click.',
  },
  {
    step: '03',
    title: 'Cultivation & Tracking',
    desc: 'Throughout the growing season, farmers log weekly health ratings and projected harvest yields with weather impacts.',
  },
  {
    step: '04',
    title: 'Guaranteed Settlement',
    desc: 'Payments are recorded transparently in the immutable digital ledger with instant receipts upon harvest delivery.',
  },
];

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('agri');

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '90px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Glow Spheres */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '650px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="fade-in" style={{ position: 'relative', zIndex: 1, maxWidth: 860 }}>
          {/* Announcement Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 30,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: 28,
              fontSize: '0.85rem',
              color: '#34d399',
              fontWeight: 500,
            }}
          >
            <Sparkles size={14} />
            <span>Next-Gen Agricultural Infrastructure & Escrow</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 24,
            }}
          >
            Bridge Between{' '}
            <span className="gradient-text">Agribusinesses</span>
            <br />&amp; Modern{' '}
            <span style={{ color: '#38bdf8' }}>Farmers</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--color-muted)',
              maxWidth: 680,
              margin: '0 auto 36px',
              lineHeight: 1.7,
            }}
          >
            Eliminate middlemen with transparent digital farming contracts, cryptographic
            UIDAI Aadhaar authentication, weekly agronomic health logging, and guaranteed
            multi-channel payment ledgers.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 48,
            }}
          >
            <Link
              to="/register"
              className="btn-primary"
              style={{
                fontSize: '1rem',
                padding: '14px 32px',
                borderRadius: 12,
              }}
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="btn-secondary"
              style={{
                fontSize: '1rem',
                padding: '14px 28px',
                borderRadius: 12,
              }}
            >
              Explore Demo Portals
            </Link>
          </div>

          {/* Quick Value Proof */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              flexWrap: 'wrap',
              fontSize: '0.85rem',
              color: 'var(--color-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color="#34d399" /> Zero Brokerage Cut
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color="#34d399" /> UIDAI KYC Compliant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color="#34d399" /> Instant UPI &amp; Bank Settlement
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Interactive Preview Box ──────────────────────────── */}
      <section style={{ maxWidth: 1060, margin: '0 auto 80px', padding: '0 24px' }}>
        <div
          className="card"
          style={{
            background: 'rgba(12, 19, 34, 0.9)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.1)',
            padding: 24,
            borderRadius: 20,
          }}
        >
          {/* Header Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: 18,
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                Live Portal Simulation
              </span>
            </div>

            {/* Role Switcher */}
            <div style={{ display: 'flex', background: 'rgba(15,24,43,0.8)', padding: 4, borderRadius: 10, border: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setActiveTab('agri')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'agri' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'agri' ? '#ffffff' : 'var(--color-muted)',
                  transition: 'all 0.2s',
                }}
              >
                🏢 Agribusiness View
              </button>
              <button
                onClick={() => setActiveTab('farmer')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'farmer' ? '#38bdf8' : 'transparent',
                  color: activeTab === 'farmer' ? '#080c14' : 'var(--color-muted)',
                  transition: 'all 0.2s',
                }}
              >
                👨‍🌾 Farmer View
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'agri' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              <div style={{ padding: 18, background: 'rgba(15,24,43,0.5)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Active Harvest Contract</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '6px 0 12px' }}>Wheat Premium Sharbati - 120 Tons</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  <span>Farmer: Rajesh Kumar (Punjab)</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Active · Week 6</span>
                </div>
                <div style={{ marginTop: 12, height: 6, background: '#1e293b', borderRadius: 4 }}>
                  <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ padding: 18, background: 'rgba(15,24,43,0.5)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Escrow Ledger Health</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>₹28,80,000</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>₹12,00,000 Advance Disbursed · Milestone 2 Settled</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                  ✓ 100% Cryptographic Match
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              <div style={{ padding: 18, background: 'rgba(15,24,43,0.5)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Weekly Crop Log · Week 4</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '6px 0 12px' }}>Basmati Rice Export Grade</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className="badge badge-excellent">● Health: Excellent</span>
                  <span className="badge badge-open">🌤 Sunny · Low Pest</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  Est. Yield: <strong style={{ color: '#ffffff' }}>48.5 Tons</strong> (+8% above contract floor)
                </div>
              </div>

              <div style={{ padding: 18, background: 'rgba(15,24,43,0.5)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Direct Farmer Payouts</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0' }}>₹4,50,000</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Received via UPI / Direct Bank Transfer · ITC Agri</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                  🛡️ Protected by Contract SLA
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Metric Stats ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '48px 24px',
          background: 'rgba(12, 19, 34, 0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                  }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '1.9rem',
                      fontWeight: 800,
                      fontFamily: 'Outfit',
                      color: '#ffffff',
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: 14 }}>
            Built for <span className="gradient-text">Complete Trust &amp; Transparency</span>
          </h2>
          <p
            style={{
              color: 'var(--color-muted)',
              fontSize: '1.05rem',
              maxWidth: 620,
              margin: '0 auto',
            }}
          >
            Every feature is engineered to protect both agribusinesses from supply shocks and
            farmers from market volatility.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24,
          }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  borderRadius: 18,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: f.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: f.color,
                  }}
                >
                  <Icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.15rem' }}>{f.title}</h3>
                <p
                  style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.9rem',
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 4 Step Process ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          background: 'rgba(12, 19, 34, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: 12 }}>
              How AgriContract Works
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '1rem' }}>
              From initial offer to harvest settlement in four clear steps
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            {steps.map((s) => (
              <div
                key={s.step}
                className="card"
                style={{
                  padding: 24,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    fontFamily: 'Outfit',
                    color: 'rgba(16, 185, 129, 0.2)',
                    marginBottom: 8,
                  }}
                >
                  {s.step}
                </div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: 8, color: '#ffffff' }}>
                  {s.title}
                </h4>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Call to Action ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: '96px 24px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '50px 32px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h2 style={{ fontSize: '2.2rem', marginBottom: 14 }}>
            Ready to modernise your contract farming?
          </h2>
          <p
            style={{
              color: 'var(--color-muted)',
              fontSize: '1.05rem',
              marginBottom: 32,
              lineHeight: 1.7,
            }}
          >
            Join hundreds of agribusinesses and certified farmers collaborating on a secure,
            auditable digital platform.
          </p>
          <Link
            to="/register"
            className="btn-primary"
            style={{
              fontSize: '1.05rem',
              padding: '14px 36px',
              borderRadius: 12,
            }}
          >
            Create Your Account Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: '36px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          color: 'var(--color-muted)',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Sprout size={16} color="#34d399" />
          <strong style={{ color: '#ffffff' }}>AgriContract Management System</strong>
        </div>
        <p style={{ margin: 0 }}>
          Full-Stack Contract Farming Platform · Secured by UIDAI KYC &amp; RBI Digital Ledger Standards
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
