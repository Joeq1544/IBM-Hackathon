import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MirrorLakeLogo({ size = 32 }) {
  return (
    <img src="/logo.png" alt="Mirror Lake Credit" width={size} height={size} style={{ objectFit: 'contain', display: 'block' }} />
  );
}

function RiskBadge({ level }) {
  const colors = {
    'Low Risk':        { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    'Low-Medium Risk': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    'Medium Risk':     { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    'High Risk':       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  };
  const c = colors[level] || colors['Medium Risk'];
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
      {level}
    </span>
  );
}

function Reports() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('mlc_email');
    if (!stored) { navigate('/login'); return; }
    setEmail(stored);

    const all = JSON.parse(localStorage.getItem('mlc_reports') || '[]');
    const mine = all
      .filter(r => r.email === stored)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setReports(mine);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('mlc_email');
    navigate('/login');
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff5f5', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ffe0e0', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <MirrorLakeLogo size={32} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#3d0000' }}>Mirror Lake Credit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>{email}</span>
          <button
            onClick={() => navigate('/chat')}
            style={{ background: '#BB0000', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            + New Assessment
          </button>
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#3d0000', letterSpacing: '-0.02em', marginBottom: 6 }}>My Financial Resumes</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            {reports.length === 0 ? 'No reports yet.' : `${reports.length} report${reports.length !== 1 ? 's' : ''} · sorted by most recent`}
          </p>
        </div>

        {reports.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ffe0e0', padding: '56px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3d0000', marginBottom: 8 }}>No reports yet</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Complete an AI assessment to generate your first Financial Resume.</p>
            <button
              onClick={() => navigate('/chat')}
              style={{ background: 'linear-gradient(135deg, #BB0000, #CC0000)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Start My Assessment →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reports.map((report, i) => (
              <div
                key={report.id}
                onClick={() => navigate(`/report/${report.id}`)}
                style={{ background: '#fff', borderRadius: 14, border: '1px solid #ffe0e0', padding: '22px 24px', cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s', display: 'flex', gap: 20, alignItems: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(187,0,0,0.1)'; e.currentTarget.style.borderColor = '#BB0000'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#ffe0e0'; }}
              >
                {/* Score circle */}
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #BB0000, #CC0000)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{report.score ?? '—'}</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>/ 850</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{report.name}</span>
                    <RiskBadge level={report.riskLevel || 'Low Risk'} />
                    {i === 0 && (
                      <span style={{ background: '#ffe0e0', color: '#BB0000', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>LATEST</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {report.summary}
                  </p>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {formatDate(report.date)} · {formatTime(report.date)}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ color: '#CBD5E1', fontSize: 18, flexShrink: 0, alignSelf: 'center' }}>›</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
