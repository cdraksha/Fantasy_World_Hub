import React, { useEffect, useState, useRef, useCallback } from 'react';
import useHinduMythologyContent from '../hooks/useHinduMythologyContent';

export default function HinduMythologyAnimeExperience({ onStop }) {
  const { generateContent, isGenerating, error } = useHinduMythologyContent();
  const [scene,     setScene]     = useState(null);
  const [countdown, setCountdown] = useState(120);
  const timerRef = useRef(null);

  const startCountdown = useCallback(() => {
    setCountdown(120);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const load = useCallback(async () => {
    setScene(null);
    startCountdown();
    try {
      const result = await generateContent();
      setScene(result);
    } catch {
      // error already set in hook
    } finally {
      clearInterval(timerRef.current);
    }
  }, [generateContent, startCountdown]);

  useEffect(() => {
    load();
    return () => clearInterval(timerRef.current);
  }, []);

  const downloadJpg = useCallback(() => {
    if (!scene?.imageUrl) return;
    const a    = document.createElement('a');
    a.href     = scene.imageUrl;
    a.download = `${scene.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    a.click();
  }, [scene]);

  // ── shared shell ──────────────────────────────────────────────
  const Shell = ({ children }) => (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      fontFamily: "'Cinzel', 'Georgia', serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, overflow: 'hidden'
    }}>
      <button
        onClick={onStop}
        style={{
          position: 'absolute', top: 22, left: 24, zIndex: 20,
          background: 'none', border: '1px solid rgba(255,210,80,0.35)',
          color: 'rgba(255,210,80,0.7)', padding: '7px 18px',
          borderRadius: 6, cursor: 'pointer', fontSize: 13, letterSpacing: 1
        }}
      >
        ← Back
      </button>
      {children}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>
    </div>
  );

  // ── loading ───────────────────────────────────────────────────
  if (isGenerating) {
    const pct    = ((120 - countdown) / 120) * 100;
    const urgent = countdown <= 20;
    return (
      <Shell>
        <div style={{ textAlign: 'center', color: 'rgba(255,210,80,0.8)' }}>
          {/* Spinner */}
          <div style={{
            width: 72, height: 72,
            border: '3px solid rgba(255,180,0,0.15)',
            borderTop: '3px solid rgba(255,180,0,0.95)',
            borderRadius: '50%', margin: '0 auto 32px',
            animation: 'spin 0.9s linear infinite'
          }} />

          <div style={{ fontSize: 17, letterSpacing: 4, marginBottom: 36 }}>
            SUMMONING THE EPIC…
          </div>

          {/* Countdown ring */}
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 18px' }}>
            <svg width="120" height="120" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,180,0,0.1)" strokeWidth="4" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={urgent ? 'rgba(255,80,60,0.9)' : 'rgba(255,180,0,0.85)'}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                fontSize: 36, fontWeight: 700, lineHeight: 1,
                color: urgent ? 'rgba(255,80,60,0.95)' : '#fff',
                animation: urgent ? 'pulse 1s ease-in-out infinite' : 'none'
              }}>
                {countdown}
              </div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                SEC
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.25)' }}>
            HIGH QUALITY · AI RENDERING
          </div>
        </div>
      </Shell>
    );
  }

  // ── error ─────────────────────────────────────────────────────
  if (error && !scene) return (
    <Shell>
      <div style={{ textAlign: 'center', color: 'rgba(255,80,80,0.8)', maxWidth: 400 }}>
        <div style={{ fontSize: 28, marginBottom: 14 }}>⚡</div>
        <div style={{ fontSize: 15, marginBottom: 24 }}>{error}</div>
        <button onClick={load} style={{
          background: 'none', border: '1px solid rgba(255,210,80,0.5)',
          color: 'rgba(255,210,80,0.85)', padding: '10px 28px',
          borderRadius: 6, cursor: 'pointer', fontSize: 14, letterSpacing: 1
        }}>Try Again</button>
      </div>
    </Shell>
  );

  // ── main: image + title + download ───────────────────────────
  if (scene) return (
    <Shell>
      {/* Full-screen image */}
      <img
        src={scene.imageUrl}
        alt={scene.title}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center'
        }}
      />

      {/* Top gradient + title */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
        padding: '64px 40px 60px', textAlign: 'center', pointerEvents: 'none'
      }}>
        <div style={{
          color: '#fff',
          fontSize: 'clamp(20px, 3.2vw, 40px)',
          fontWeight: 700, letterSpacing: '0.06em',
          textShadow: '0 2px 24px rgba(255,140,0,0.6), 0 0 60px rgba(255,80,0,0.3)',
          textTransform: 'uppercase'
        }}>
          {scene.title}
        </div>
      </div>

      {/* Download button — bottom right */}
      <button
        onClick={downloadJpg}
        title="Download as JPG"
        style={{
          position: 'absolute', bottom: 32, right: 32, zIndex: 20,
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,210,80,0.4)',
          color: 'rgba(255,210,80,0.85)', width: 48, height: 48,
          borderRadius: 10, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,140,0,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,210,80,0.9)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,210,80,0.4)'; e.currentTarget.style.color = 'rgba(255,210,80,0.85)'; }}
      >
        {/* Download arrow icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>

      {/* Bottom gradient + New Scene button */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        padding: '50px 40px 36px', textAlign: 'center'
      }}>
        <button
          onClick={load}
          style={{
            background: 'none', border: '1px solid rgba(255,210,80,0.5)',
            color: 'rgba(255,210,80,0.9)', padding: '13px 44px',
            borderRadius: 8, cursor: 'pointer', fontSize: 15, letterSpacing: 2,
            fontFamily: 'inherit', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,210,80,1)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,140,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,210,80,0.5)'; e.currentTarget.style.color = 'rgba(255,210,80,0.9)'; e.currentTarget.style.background = 'none'; }}
        >
          ⚡ New Scene
        </button>
      </div>
    </Shell>
  );

  return null;
}
