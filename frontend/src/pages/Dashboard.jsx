import React from 'react';
import { useNavigate } from 'react-router-dom';

function MirrorLakeLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#logoGrad)" />
      {/* Lake — large oval filling the whole circle */}
      <ellipse cx="24" cy="28" rx="21" ry="16" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
      {/* Subtle inner shore highlight */}
      <ellipse cx="24" cy="28" rx="20" ry="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
      {/* Fountain base — centered in the lake */}
      <circle cx="24" cy="28" r="2.8" fill="rgba(255,255,255,0.5)" />
      <circle cx="24" cy="28" r="1.3" fill="rgba(255,255,255,0.78)" />
      {/* Center jet — tallest, straight up */}
      <path d="M 24 25 Q 24 16 24 7" stroke="white" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeOpacity="0.93" />
      <ellipse cx="24" cy="6" rx="1.6" ry="2.2" fill="rgba(255,255,255,0.82)" />
      {/* Inner arcing jets left & right */}
      <path d="M 23 25 Q 17 17 13 21" stroke="white" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeOpacity="0.83" />
      <path d="M 25 25 Q 31 17 35 21" stroke="white" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeOpacity="0.83" />
      {/* Outer arcing jets */}
      <path d="M 22.5 26 Q 13 17 8 22" stroke="white" strokeWidth="0.85" fill="none" strokeLinecap="round" strokeOpacity="0.56" />
      <path d="M 25.5 26 Q 35 17 40 22" stroke="white" strokeWidth="0.85" fill="none" strokeLinecap="round" strokeOpacity="0.56" />
      {/* Concentric ripples centered at fountain */}
      <ellipse cx="24" cy="28" rx="4.5" ry="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
      <ellipse cx="24" cy="28" rx="9.5" ry="6.5" fill="none" stroke="rgba(255,255,255,0.26)" strokeWidth="0.6" />
      <ellipse cx="24" cy="28" rx="16" ry="11" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.5" />
      {/* Reflection of jets in lower lake — faded, inverted */}
      <path d="M 24 29 Q 24 36 24 40" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 23 29 Q 17 34 14 33" stroke="rgba(255,255,255,0.19)" strokeWidth="0.78" fill="none" strokeLinecap="round" />
      <path d="M 25 29 Q 31 34 34 33" stroke="rgba(255,255,255,0.19)" strokeWidth="0.78" fill="none" strokeLinecap="round" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BB0000" />
          <stop offset="100%" stopColor="#CC0000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ScorePreviewCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px 28px 24px', width: 300, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffaaaa', marginBottom: 16 }}>Sample Financial Resume</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1 }}>724</span>
        <span style={{ fontSize: 16, color: '#ffaaaa', marginBottom: 8 }}>/ 850</span>
      </div>
      <div style={{ display: 'inline-block', background: 'rgba(34,197,94,0.2)', color: '#86efac', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, marginBottom: 20 }}>Low Risk ✓</div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
        {[['Rent payments', '23/24 on time'], ['Cash flow ratio', '1.38x'], ['Fairness score', '98/100 ✅']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#ffaaaa' }}>{k}</span>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
      
    </div>
  );
}


const features = [
  { icon: '🔄', bg: 'linear-gradient(135deg,#CC0000,#BB0000)', title: 'Alternate Data', text: 'Rent, utilities, income flow, education — we build your profile from what you actually do, not what credit cards you have.' },
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
    <div style={{ minHeight: '100vh', background: '#fff5f5', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #ffe0e0', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MirrorLakeLogo size={38} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#3d0000', letterSpacing: '-0.02em' }}>Mirror Lake Credit</div>
            <div style={{ fontSize: 11, color: '#CC0000', fontWeight: 500 }}>AI Financial Assessment</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Powered by IBM watsonx
          </span>
          <button onClick={() => navigate('/chat')} style={{ background: '#BB0000', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #3d0000 0%, #BB0000 55%, #CC0000 100%)', padding: '80px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 64, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(187,0,0,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: 60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 520, color: '#fff' }}>
          <div style={{ display: 'inline-block', background: 'rgba(187,0,0,0.25)', border: '1px solid rgba(187,0,0,0.4)', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#ffaaaa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
            IBM OSU Hackathon · Feb 2026
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.08, marginBottom: 20, letterSpacing: '-0.03em' }}>
            See Your True<br />
            <span style={{ color: '#ff9999' }}>Financial Reflection</span>
          </h1>
          <p style={{ fontSize: 17, color: '#ffd0d0', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
            No credit card? No loan history? No problem. Mirror Lake Credit uses AI agents to build a complete Financial Resume from the data that actually reflects who you are.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/chat')}
              style={{ background: '#fff', color: '#BB0000', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
            >
              Build My Resume →
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffaaaa', fontSize: 14 }}>
              <span>⚡</span> Takes 3 minutes
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[['45M+', 'Credit-invisible Americans'], ['4', 'AI Agents Working For You'], ['100%', 'Bias-Audited Results']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{n}</div>
                <div style={{ fontSize: 11, color: '#ffaaaa', marginTop: 2 }}>{l}</div>
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
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CC0000', marginBottom: 10 }}>How It Works</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#3d0000', letterSpacing: '-0.02em' }}>Three steps to your Financial Resume</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {steps.map((step, i) => (
              <div key={step.n} style={{ position: 'relative', padding: '32px 28px', borderRadius: 16, background: '#fff5f5', border: '1px solid #ffe0e0' }}>
                {i < steps.length - 1 && <div style={{ position: 'absolute', top: 42, right: -12, fontSize: 18, color: '#ffd0d0', zIndex: 1 }}>→</div>}
                <div style={{ fontSize: 13, fontWeight: 800, color: '#BB0000', marginBottom: 16, fontFamily: 'monospace' }}>{step.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#3d0000', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '72px 48px', background: '#fff5f5' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CC0000', marginBottom: 10 }}>Why Mirror Lake</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#3d0000', letterSpacing: '-0.02em' }}>Built different, on purpose</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: 16, padding: '28px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ffe0e0', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#3d0000', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ background: 'linear-gradient(135deg, #3d0000, #BB0000)', padding: '56px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Ready to see your reflection?</h2>
        <p style={{ fontSize: 16, color: '#ffd0d0', marginBottom: 28 }}>Start a conversation with our AI — it only takes a few minutes.</p>
        <button onClick={() => navigate('/chat')} style={{ background: '#fff', color: '#BB0000', border: 'none', borderRadius: 10, padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Get My Financial Resume →
        </button>
      </div>

      <footer style={{ background: '#3d0000', padding: '20px 48px', textAlign: 'center', fontSize: 13, color: '#ffaaaa' }}>
        Mirror Lake Credit · IBM SkillsBuild Hackathon · Ohio State University 2026
      </footer>
    </div>
  );
}

export default Dashboard;
