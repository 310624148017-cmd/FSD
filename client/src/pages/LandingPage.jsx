import { Link } from 'react-router-dom';

const features = [
  { icon: '📄', title: 'Smart Contracts', desc: 'Draft, publish, and manage digital farming contracts with built-in lifecycle tracking.' },
  { icon: '🌱', title: 'Crop Monitoring', desc: 'Farmers log weekly updates on health, yield estimates, and weather conditions.' },
  { icon: '💰', title: 'Payment Ledger', desc: 'Transparent digital ledger tracking every advance, milestone, and final payout.' },
  { icon: '🔐', title: 'Role-Based Access', desc: 'Separate, secure dashboards for Agribusinesses and Farmers.' },
];

const stats = [
  { value: '2,400+', label: 'Active Contracts' },
  { value: '₹48Cr', label: 'Total Payouts' },
  { value: '850+', label: 'Farmers Onboarded' },
  { value: '120+', label: 'Agribusinesses' },
];

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        minHeight: '90vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px',
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 60%),
                     radial-gradient(ellipse 50% 40% at 80% 80%, rgba(59,130,246,0.08) 0%, transparent 50%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="fade-in" style={{ position: 'relative', maxWidth: 820 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            marginBottom: 28, fontSize: '0.85rem', color: 'var(--color-primary)',
          }}>
            🌾 &nbsp; Digitizing Contract Farming in India
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: 24 }}>
            Bridge Between{' '}
            <span className="gradient-text">Agribusinesses</span>
            {' '}&{' '}
            <span style={{ color: 'var(--color-accent)' }}>Farmers</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--color-muted)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.8 }}>
            Transparent digital contracts, real-time crop tracking, and fair payment ledgers — 
            all in one platform built for modern contract farming.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Get Started Free →
            </Link>
            <Link to="/login" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 24px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Outfit' }} className="gradient-text">{s.value}</div>
              <div style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 12 }}>
            Everything you need to <span className="gradient-text">farm smarter</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-muted)', marginBottom: 56, fontSize: '1rem' }}>
            A complete ecosystem for contract farming, built on trust and transparency.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {features.map((f) => (
              <div key={f.title} className="card" style={{ borderTop: '2px solid var(--color-primary)' }}>
                <div style={{ fontSize: '2.4rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        background: `linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.08))`,
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Ready to transform your farming business?</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: 32 }}>Join hundreds of agribusinesses and farmers already using AgriContract.</p>
        <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
          Create Free Account →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
        © 2024 AgriContract Management System · Built with MERN Stack
      </footer>
    </div>
  );
};

export default LandingPage;
