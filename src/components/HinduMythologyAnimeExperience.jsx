import React, { useEffect, useState } from 'react';
import useHinduMythologyContent from '../hooks/useHinduMythologyContent';

export default function HinduMythologyAnimeExperience({ onStop }) {
  const { generateContent, isGenerating, error } = useHinduMythologyContent();
  const [scene, setScene] = useState(null);

  const load = async () => {
    try {
      const result = await generateContent();
      setScene(result);
    } catch {
      // error already set in hook
    }
  };

  useEffect(() => { load(); }, []);

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
    </div>
  );

  // ── loading ───────────────────────────────────────────────────
  if (isGenerating) return (
    <Shell>
      <div style={{ textAlign: 'center', color: 'rgba(255,210,80,0.7)' }}>
        <div style={{
          width: 56, height: 56, border: '3px solid rgba(255,180,0,0.2)',
          borderTop: '3px solid rgba(255,180,0,0.9)',
          borderRadius: '50%', margin: '0 auto 28px',
          animation: 'spin 0.9s linear infinite'
        }} />
        <div style={{ fontSize: 17, letterSpacing: 3 }}>SUMMONING THE EPIC…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Shell>
  );

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

  // ── main: image + title ───────────────────────────────────────
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
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)',
        padding: '64px 40px 60px', textAlign: 'center', pointerEvents: 'none'
      }}>
        <div style={{
          color: '#fff',
          fontSize: 'clamp(20px, 3.2vw, 40px)',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textShadow: '0 2px 24px rgba(255,140,0,0.6), 0 0 60px rgba(255,80,0,0.3)',
          textTransform: 'uppercase'
        }}>
          {scene.title}
        </div>
      </div>

      {/* Bottom gradient + button */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        padding: '50px 40px 36px', textAlign: 'center'
      }}>
        <button
          onClick={load}
          disabled={isGenerating}
          style={{
            background: 'none',
            border: '1px solid rgba(255,210,80,0.5)',
            color: 'rgba(255,210,80,0.9)',
            padding: '13px 44px', borderRadius: 8,
            cursor: 'pointer', fontSize: 15, letterSpacing: 2,
            fontFamily: 'inherit', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,210,80,1)'; e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,140,0,0.15)'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,210,80,0.5)'; e.target.style.color = 'rgba(255,210,80,0.9)'; e.target.style.background = 'none'; }}
        >
          ⚡ New Scene
        </button>
      </div>
    </Shell>
  );

  return null;
}
