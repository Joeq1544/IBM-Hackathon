import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startChat, sendMessage } from '../api/client';

function MirrorLakeLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#chatLogoGrad)" />
      <line x1="8" y1="24" x2="40" y2="24" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <path d="M 10 24 Q 14 13 19 19 Q 24 13 29 19 Q 34 13 38 24" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 10 24 Q 14 35 19 29 Q 24 35 29 29 Q 34 35 38 24" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.35" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="white" strokeWidth="0.9" strokeOpacity="0.2" />
      <defs>
        <linearGradient id="chatLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AgentAvatar() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #0369a1, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
        <path d="M 10 24 Q 14 13 19 19 Q 24 13 29 19 Q 34 13 38 24" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 10 24 Q 14 35 19 29 Q 24 35 29 29 Q 34 35 38 24" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
    </div>
  );
}

function Chat() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleStart = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = await startChat(name.trim());
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0c2340 0%, #0369a1 60%, #0891b2 100%)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MirrorLakeLogo size={34} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Mirror Lake Credit</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#e0f2fe', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>
            ← Back
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #0369a1, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(3,105,161,0.3)' }}>
              <MirrorLakeLogo size={44} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0c2340', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Build Your Financial Resume
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 32, maxWidth: 340, margin: '0 auto 28px' }}>
              Our AI advisor will have a short conversation with you to understand your financial situation — no credit cards or loans needed.
            </p>
            <input
              style={{ width: '100%', border: '2px solid #e0f2fe', borderRadius: 12, padding: '14px 16px', fontSize: 15, outline: 'none', marginBottom: 14, boxSizing: 'border-box', color: '#0c2340', transition: 'border 0.2s' }}
              placeholder="What's your first name?"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              onFocus={e => { e.target.style.borderColor = '#0369a1'; }}
              onBlur={e => { e.target.style.borderColor = '#e0f2fe'; }}
              autoFocus
            />
            <button
              onClick={handleStart}
              disabled={loading || !name.trim()}
              style={{ width: '100%', background: name.trim() ? 'linear-gradient(135deg, #0369a1, #0891b2)' : '#e2e8f0', color: name.trim() ? '#fff' : '#94a3b8', border: 'none', borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default', boxShadow: name.trim() ? '0 4px 16px rgba(3,105,161,0.3)' : 'none', transition: 'all 0.2s' }}
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f9ff' }}>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e0f2fe', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MirrorLakeLogo size={34} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0c2340' }}>Mirror Lake Credit</div>
            <div style={{ fontSize: 11, color: '#0891b2', fontWeight: 500 }}>AI Financial Advisor · IBM watsonx Granite</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0891b2', background: '#e0f2fe', borderRadius: 20, padding: '5px 12px' }}>
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
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#0891b2', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mirror Lake AI</div>
                )}
                <div style={{
                  padding: '13px 18px',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #0369a1, #0891b2)' : '#ffffff',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize: 14,
                  lineHeight: 1.65,
                  boxShadow: msg.role === 'user' ? '0 4px 16px rgba(3,105,161,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
                  whiteSpace: 'pre-wrap',
                  border: msg.role === 'assistant' ? '1px solid #e0f2fe' : 'none',
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
                <div style={{ fontSize: 11, fontWeight: 600, color: '#0891b2', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mirror Lake AI</div>
                <div style={{ padding: '16px 20px', borderRadius: '20px 20px 20px 4px', background: '#fff', border: '1px solid #e0f2fe', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#0891b2', animation: 'pulse 1.2s infinite', animationDelay: `${delay}s`, opacity: 0.7 }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{ background: '#fff', borderTop: '1px solid #e0f2fe', padding: '16px 24px', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            style={{ flex: 1, border: '2px solid #e0f2fe', borderRadius: 14, padding: '13px 16px', fontSize: 14, resize: 'none', outline: 'none', lineHeight: 1.5, background: '#f8fafc', color: '#1e293b', transition: 'border 0.2s', overflow: 'hidden' }}
            placeholder="Tell me about your financial situation..."
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKey}
            rows={1}
            onFocus={e => { e.target.style.borderColor = '#0369a1'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#e0f2fe'; e.target.style.background = '#f8fafc'; }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ width: 48, height: 48, borderRadius: 14, border: 'none', background: loading || !input.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #0369a1, #0891b2)', color: loading || !input.trim() ? '#94a3b8' : '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading || !input.trim() ? 'default' : 'pointer', flexShrink: 0, boxShadow: !loading && input.trim() ? '0 4px 14px rgba(3,105,161,0.3)' : 'none', transition: 'all 0.2s' }}
          >
            ↑
          </button>
        </div>
        <div style={{ maxWidth: 700, margin: '8px auto 0', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line · Your data is analyzed by IBM Granite AI
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
