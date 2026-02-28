import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startChat, sendMessage } from '../api/client';

function MirrorLakeLogo({ size = 32 }) {
  return (
    <img src="/logo.png" alt="Mirror Lake Credit" width={size} height={size} style={{ objectFit: 'contain', display: 'block' }} />
  );
}

function AgentAvatar() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1.5px solid #ffe0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      <img src="/logo.png" alt="Mirror Lake AI" width={24} height={24} style={{ objectFit: 'contain', display: 'block' }} />
    </div>
  );
}

function parseScore(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== 'assistant') continue;
    const m = messages[i].content.match(/\b([4-9]\d{2}|[1-9]\d{2})\s*\/\s*850\b/);
    if (m) return parseInt(m[1], 10);
    const m2 = messages[i].content.match(/score[:\s]+([4-9]\d{2})/i);
    if (m2) return parseInt(m2[1], 10);
  }
  return null;
}

function parseRisk(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== 'assistant') continue;
    const c = messages[i].content.toLowerCase();
    if (c.includes('high risk')) return 'High Risk';
    if (c.includes('medium risk')) return 'Medium Risk';
    if (c.includes('low-medium risk') || c.includes('low medium risk')) return 'Low-Medium Risk';
    if (c.includes('low risk')) return 'Low Risk';
    // Fall back to score-based classification
    const scoreMatch = c.match(/(\d{3})\s*\/\s*850/);
    if (scoreMatch) {
      const s = parseInt(scoreMatch[1], 10);
      if (s < 550) return 'High Risk';
      if (s < 650) return 'Medium Risk';
      if (s < 750) return 'Low-Medium Risk';
      return 'Low Risk';
    }
  }
  return 'Medium Risk';
}

function saveReport(name, sessionId, messages) {
  const email = localStorage.getItem('mlc_email');
  const lastAI = [...messages].reverse().find(m => m.role === 'assistant');
  const summary = lastAI
    ? lastAI.content.slice(0, 220).replace(/\n/g, ' ').trim() + (lastAI.content.length > 220 ? '…' : '')
    : 'Assessment complete.';
  const report = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    date: new Date().toISOString(),
    email: email || 'guest',
    name,
    sessionId,
    score: parseScore(messages) ?? 700,
    riskLevel: parseRisk(messages),
    summary,
    messages,
  };
  const existing = JSON.parse(localStorage.getItem('mlc_reports') || '[]');
  localStorage.setItem('mlc_reports', JSON.stringify([...existing, report]));
  return report;
}

function Chat() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('mlc_email')) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleStart = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const email = localStorage.getItem('mlc_email') || '';
      const data = await startChat(name.trim(), email);
      setSessionId(data.session_id);
      setMessages([{ role: 'assistant', content: data.reply }]);
      setStarted(true);
    } catch {
      alert('Could not connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const data = await sendMessage(sessionId, text);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong connecting to the AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = () => {
    if (messages.length === 0) return;
    const report = saveReport(name, sessionId, messages);
    setSaved(true);
    const email = localStorage.getItem('mlc_email');
    if (email) {
      navigate(`/report/${report.id}`);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  if (!started) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #3d0000 0%, #BB0000 60%, #CC0000 100%)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MirrorLakeLogo size={34} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Mirror Lake Credit</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffe0e0', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>
            ← Back
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MirrorLakeLogo size={80} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#3d0000', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Build Your Financial Resume
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 32, maxWidth: 340, margin: '0 auto 28px' }}>
              Our AI advisor will have a short conversation with you to understand your financial situation — no credit cards or loans needed.
            </p>
            <input
              style={{ width: '100%', border: '2px solid #ffe0e0', borderRadius: 12, padding: '14px 16px', fontSize: 15, outline: 'none', marginBottom: 14, boxSizing: 'border-box', color: '#3d0000', transition: 'border 0.2s' }}
              placeholder="What's your first name?"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              onFocus={e => { e.target.style.borderColor = '#BB0000'; }}
              onBlur={e => { e.target.style.borderColor = '#ffe0e0'; }}
              autoFocus
            />
            <button
              onClick={handleStart}
              disabled={loading || !name.trim()}
              style={{ width: '100%', background: name.trim() ? 'linear-gradient(135deg, #BB0000, #CC0000)' : '#e2e8f0', color: name.trim() ? '#fff' : '#94a3b8', border: 'none', borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default', boxShadow: name.trim() ? '0 4px 16px rgba(187,0,0,0.3)' : 'none', transition: 'all 0.2s' }}
            >
              {loading ? 'Starting...' : 'Start My Assessment →'}
            </button>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16 }}>Takes about 3 minutes · Powered by IBM watsonx Granite</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff5f5' }}>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #ffe0e0', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MirrorLakeLogo size={34} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#3d0000' }}>Mirror Lake Credit</div>
            <div style={{ fontSize: 11, color: '#CC0000', fontWeight: 500 }}>AI Financial Advisor · IBM watsonx Granite</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#CC0000', background: '#ffe0e0', borderRadius: 20, padding: '5px 12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Live · {messages.filter(m => m.role === 'user').length} messages
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
            ← Home
          </button>
        </div>
      </header>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16, alignItems: 'flex-end', gap: 10 }}>
              {msg.role === 'assistant' && <AgentAvatar />}
              <div style={{ maxWidth: '74%' }}>
                {msg.role === 'assistant' && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#CC0000', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mirror Lake AI</div>
                )}
                <div style={{
                  padding: '13px 18px',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #BB0000, #CC0000)' : '#ffffff',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize: 14,
                  lineHeight: 1.65,
                  boxShadow: msg.role === 'user' ? '0 4px 16px rgba(187,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                  whiteSpace: 'pre-wrap',
                  border: msg.role === 'assistant' ? '1px solid #ffe0e0' : 'none',
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 16 }}>
              <AgentAvatar />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#CC0000', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mirror Lake AI</div>
                <div style={{ padding: '16px 20px', borderRadius: '20px 20px 20px 4px', background: '#fff', border: '1px solid #ffe0e0', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#CC0000', animation: 'pulse 1.2s infinite', animationDelay: `${delay}s`, opacity: 0.7 }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{ background: '#fff', borderTop: '1px solid #ffe0e0', padding: '16px 24px', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <button
            title={saved ? 'Report saved!' : 'Save & View Financial Resume'}
            onClick={handleSaveReport}
            disabled={messages.length === 0}
            style={{ width: 48, height: 48, borderRadius: 14, border: `1.5px solid ${saved ? '#22c55e' : '#ffe0e0'}`, background: saved ? '#f0fdf4' : '#fff', color: saved ? '#22c55e' : '#BB0000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: messages.length === 0 ? 'default' : 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
            onMouseEnter={e => { if (!saved) { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#BB0000'; } }}
            onMouseLeave={e => { if (!saved) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#ffe0e0'; } }}
          >
            {saved ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 18 15 15" />
              </svg>
            )}
          </button>
          <textarea
            ref={textareaRef}
            style={{ flex: 1, border: '2px solid #ffe0e0', borderRadius: 14, padding: '13px 16px', fontSize: 14, resize: 'none', outline: 'none', lineHeight: 1.5, background: '#f8fafc', color: '#1e293b', transition: 'border 0.2s', overflow: 'hidden' }}
            placeholder="Tell me about your financial situation..."
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKey}
            rows={1}
            onFocus={e => { e.target.style.borderColor = '#BB0000'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#ffe0e0'; e.target.style.background = '#f8fafc'; }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ width: 48, height: 48, borderRadius: 14, border: 'none', background: loading || !input.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #BB0000, #CC0000)', color: loading || !input.trim() ? '#94a3b8' : '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading || !input.trim() ? 'default' : 'pointer', flexShrink: 0, boxShadow: !loading && input.trim() ? '0 4px 14px rgba(187,0,0,0.3)' : 'none', transition: 'all 0.2s' }}
          >
            ↑
          </button>
        </div>
        <div style={{ maxWidth: 700, margin: '8px auto 0', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line · Click the file icon to save your report
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(1); opacity: 0.7; }
          40% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Chat;
