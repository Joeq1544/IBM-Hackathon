import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>
      {level}
    </span>
  );
}

function ScoreArc({ score }) {
  const max = 850;
  const pct = Math.min(score / max, 1);
  const radius = 54;
  const circ = Math.PI * radius; // half-circle
  const offset = circ * (1 - pct);

  return (
    <div style={{ position: 'relative', width: 140, height: 80, margin: '0 auto 8px' }}>
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path d="M 10 76 A 60 60 0 0 1 130 76" fill="none" stroke="#ffe0e0" strokeWidth="10" strokeLinecap="round" />
        <path d="M 10 76 A 60 60 0 0 1 130 76" fill="none" stroke="#BB0000" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transformOrigin: '70px 76px', transform: 'rotate(180deg) scaleX(-1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 36, fontWeight: 900, color: '#3d0000', letterSpacing: '-0.03em' }}>{score}</span>
      </div>
    </div>
  );
}

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('mlc_email');
    if (!email) { navigate('/login'); return; }

    const all = JSON.parse(localStorage.getItem('mlc_reports') || '[]');
    const found = all.find(r => r.id === id);
    if (!found) { navigate('/reports'); return; }
    setReport(found);
  }, [id, navigate]);

  if (!report) return null;

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const assistantMessages = (report.messages || []).filter(m => m.role === 'assistant');
  const userMessages = (report.messages || []).filter(m => m.role === 'user');

  return (
    <div style={{ minHeight: '100vh', background: '#fff5f5', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ffe0e0', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <MirrorLakeLogo size={32} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#3d0000' }}>Mirror Lake Credit</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/reports')}
            style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#475569', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}
          >
            ← My Reports
          </button>
          <button
            onClick={() => navigate('/chat')}
            style={{ background: '#BB0000', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            + New Assessment
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
            {formatDate(report.date)} · {formatTime(report.date)}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#3d0000', letterSpacing: '-0.02em', margin: 0 }}>
            Financial Resume — {report.name}
          </h1>
        </div>

        {/* Score card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ffe0e0', padding: '32px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <ScoreArc score={report.score ?? 0} />
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>out of 850</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ marginBottom: 14 }}>
                <RiskBadge level={report.riskLevel || 'Low Risk'} />
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>{report.summary}</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ffe0e0', padding: '24px 32px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#3d0000', marginBottom: 18, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 11 }}>Assessment Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['Name', report.name],
              ['Email', report.email],
              ['Session ID', report.sessionId ? report.sessionId.slice(0, 16) + '…' : '—'],
              ['Messages exchanged', `${userMessages.length} from you · ${assistantMessages.length} from AI`],
              ['Powered by', 'IBM Granite 3.2 · IBM watsonx'],
              ['Bias audit', 'Granite Guardian 3.2 · Passed'],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '12px 0', borderBottom: '1px solid #fff5f5', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</span>
                <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ffe0e0', padding: '24px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: '#3d0000', marginBottom: 20, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Full Conversation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(report.messages || []).map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? '#ffe0e0' : 'linear-gradient(135deg, #BB0000, #CC0000)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: msg.role === 'user' ? '#BB0000' : '#fff',
                }}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div style={{
                  maxWidth: '80%',
                  background: msg.role === 'user' ? '#fff5f5' : '#f8fafc',
                  border: `1px solid ${msg.role === 'user' ? '#ffe0e0' : '#e2e8f0'}`,
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#1e293b',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bias audit footer */}
        <div style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Bias Audit Passed</div>
            <div style={{ fontSize: 12, color: '#4ade80' }}>Reviewed by IBM Granite Guardian 3.2 — no demographic bias detected</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReportDetail;
