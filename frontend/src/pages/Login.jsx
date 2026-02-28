import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MirrorLakeLogo({ size = 32 }) {
  return (
    <img src="/logo.png" alt="Mirror Lake Credit" width={size} height={size} style={{ objectFit: 'contain', display: 'block' }} />
  );
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (localStorage.getItem('mlc_email')) navigate('/reports');
  }, [navigate]);

  const handleContinue = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;
    localStorage.setItem('mlc_email', trimmed);
    navigate('/reports');
  };

  const valid = email.trim().includes('@');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #3d0000 0%, #BB0000 60%, #CC0000 100%)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <MirrorLakeLogo size={32} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Mirror Lake Credit</span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 420, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MirrorLakeLogo size={64} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#3d0000', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 28 }}>
            Enter your email to access your Financial Resumes.
          </p>
          <input
            style={{ width: '100%', border: '2px solid #ffe0e0', borderRadius: 12, padding: '14px 16px', fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box', color: '#3d0000', transition: 'border 0.2s' }}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleContinue()}
            onFocus={e => { e.target.style.borderColor = '#BB0000'; }}
            onBlur={e => { e.target.style.borderColor = '#ffe0e0'; }}
            autoFocus
          />
          <button
            onClick={handleContinue}
            disabled={!valid}
            style={{ width: '100%', background: valid ? 'linear-gradient(135deg, #BB0000, #CC0000)' : '#e2e8f0', color: valid ? '#fff' : '#94a3b8', border: 'none', borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 700, cursor: valid ? 'pointer' : 'default', boxShadow: valid ? '0 4px 16px rgba(187,0,0,0.3)' : 'none', transition: 'all 0.2s' }}
          >
            Continue →
          </button>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16 }}>No password needed · Your reports are stored locally</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
