import React from 'react';
import { useNavigate } from 'react-router-dom';

function MirrorLakeLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#logoGrad)" />
      {/* Water horizon line */}
      <line x1="8" y1="24" x2="40" y2="24" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      {/* Above water — reflection arc pair forming "M" shape */}
      <path d="M 10 24 Q 14 13 19 19 Q 24 13 29 19 Q 34 13 38 24" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Below water — mirror reflection, faded */}
      <path d="M 10 24 Q 14 35 19 29 Q 24 35 29 29 Q 34 35 38 24" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.35" />
      {/* Ripple lines */}
      <line x1="16" y1="30" x2="32" y2="30" stroke="white" strokeWidth="0.9" strokeOpacity="0.2" />
      <line x1="19" y1="34" x2="29" y2="34" stroke="white" strokeWidth="0.9" strokeOpacity="0.12" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ScorePreviewCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px 28px 24px', width: 300, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7dd3fc', marginBottom: 16 }}>Sample Financial Resume</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1 }}>724</span>
        <span style={{ fontSize: 16, color: '#7dd3fc', marginBottom: 8 }}>/ 850</span>
      </div>
      <div style={{ display: 'inline-block', background: 'rgba(34,197,94,0.2)', color: '#86efac', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, marginBottom: 20 }}>Low Risk ✓</div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
        {[['Rent payments', '23/24 on time'], ['Cash flow ratio', '1.38x'], ['Fairness score', '98/100 ✅']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#7dd3fc' }}>{k}</span>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  { icon: '🔄', bg: 'linear-gradient(135deg,#0ea5e9,#0369a1)', title: 'Alternate Data', text: 'Rent, utilities, income flow, education — we build your profile from what you actually do, not what credit cards you have.' },
  { icon: '🔍', bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', title: 'Explainable AI', text: 'Every decision is shown in plain English. IBM Granite 3.2 explains exactly which factors helped and what to improve.' },
  { icon: '⚖️', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', title: 'Bias Auditing', text: 'IBM Granite Guardian reviews every score for demographic bias in real time. Fair by design, not by accident.' },
  { icon: '🤖', bg: 'linear-gradient(135deg,#10b981,#059669)', title: 'Agentic AI', text: 'Four specialist AI agents work together — collecting, analyzing, auditing, and explaining — orchestrated by IBM watsonx.' },
];

const steps = [
  { n: '01', title: 'Chat with our AI', desc: 'Tell our agent about your rent, job, school, and finances in plain conversation.' },
  { n: '02', title: 'Agents Analyze', desc: 'Four IBM watsonx agents process your data, score your profile, and audit for bias.' },
  { n: '03', title: 'Get Your Resume', desc: 'Receive a transparent score with a plain-English explanation you can show lenders.' },
];

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f9ff', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e0f2fe', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MirrorLakeLogo size={38} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0c2340', letterSpacing: '-0.02em' }}>Mirror Lake Credit</div>
            <div style={{ fontSize: 11, color: '#0891b2', fontWeight: 500 }}>AI Financial Assessment</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Powered by IBM watsonx
          </span>
          <button onClick={() => navigate('/chat')} style={{ background: '#0369a1', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0c2340 0%, #0369a1 55%, #0891b2 100%)', padding: '80px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 64, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(14,165,233,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: 60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 520, color: '#fff' }}>
          <div style={{ display: 'inline-block', background: 'rgba(14,165,233,0.25)', border: '1px solid rgba(14,165,233,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#7dd3fc', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
            IBM OSU Hackathon · Feb 2026
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.08, marginBottom: 20, letterSpacing: '-0.03em' }}>
            See Your True<br />
            <span style={{ color: '#38bdf8' }}>Financial Reflection</span>
          </h1>
          <p style={{ fontSize: 17, color: '#bae6fd', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
            No credit card? No loan history? No problem. Mirror Lake Credit uses AI agents to build a complete Financial Resume from the data that actually reflects who you are.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/chat')}
              style={{ background: '#fff', color: '#0369a1', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
            >
              Build My Resume →
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7dd3fc', fontSize: 14 }}>
              <span>⚡</span> Takes 3 minutes
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[['45M+', 'Credit-invisible Americans'], ['4', 'AI Agents Working For You'], ['100%', 'Bias-Audited Results']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{n}</div>
                <div style={{ fontSize: 11, color: '#7dd3fc', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <ScorePreviewCard />
      </div>

      {/* How it works */}
      <div style={{ background: '#fff', padding: '72px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0891b2', marginBottom: 10 }}>How It Works</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0c2340', letterSpacing: '-0.02em' }}>Three steps to your Financial Resume</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {steps.map((step, i) => (
              <div key={step.n} style={{ position: 'relative', padding: '32px 28px', borderRadius: 16, background: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                {i < steps.length - 1 && <div style={{ position: 'absolute', top: 42, right: -12, fontSize: 18, color: '#bae6fd', zIndex: 1 }}>→</div>}
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0ea5e9', marginBottom: 16, fontFamily: 'monospace' }}>{step.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0c2340', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '72px 48px', background: '#f0f9ff' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0891b2', marginBottom: 10 }}>Why Mirror Lake</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#0c2340', letterSpacing: '-0.02em' }}>Built different, on purpose</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: 16, padding: '28px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e0f2fe', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0c2340', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0c2340, #0369a1)', padding: '56px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Ready to see your reflection?</h2>
        <p style={{ fontSize: 16, color: '#bae6fd', marginBottom: 28 }}>Start a conversation with our AI — it only takes a few minutes.</p>
        <button onClick={() => navigate('/chat')} style={{ background: '#fff', color: '#0369a1', border: 'none', borderRadius: 10, padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Get My Financial Resume →
        </button>
      </div>

      <footer style={{ background: '#0c2340', padding: '20px 48px', textAlign: 'center', fontSize: 13, color: '#475569' }}>
        Mirror Lake Credit · IBM SkillsBuild Hackathon · Ohio State University 2026
      </footer>
    </div>
  );
}

export default Dashboard;
