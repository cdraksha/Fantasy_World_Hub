import React, { useState, useRef, useCallback } from 'react';
import useToyPlanet4Content from '../hooks/useToyPlanet4Content';

export default function ToyPlanet4Experience({ onStop }) {
  const { generatePlanet, isGenerating, error } = useToyPlanet4Content();
  const [step, setStep]           = useState('upload'); // 'upload' | 'generating' | 'result'
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [planetUrl, setPlanetUrl]   = useState(null);
  const [countdown, setCountdown]   = useState(120);
  const fileInputRef = useRef(null);
  const timerRef     = useRef(null);

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

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setImageBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const generate = useCallback(async () => {
    if (!imageBase64) return;
    setStep('generating');
    startCountdown();
    try {
      const url = await generatePlanet(imageBase64);
      setPlanetUrl(url);
      setStep('result');
    } catch {
      setStep('upload');
    } finally {
      clearInterval(timerRef.current);
    }
  }, [imageBase64, generatePlanet, startCountdown]);

  const reset = useCallback(() => {
    setStep('upload');
    setPreviewUrl(null);
    setImageBase64(null);
    setPlanetUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const download = useCallback(() => {
    if (!planetUrl) return;
    const a = document.createElement('a');
    a.href = planetUrl;
    a.download = 'my_planet.png';
    a.click();
  }, [planetUrl]);

  const Shell = ({ children }) => (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, overflow: 'hidden'
    }}>
      <button
        onClick={onStop}
        style={{
          position: 'absolute', top: 22, left: 24, zIndex: 20,
          background: 'none', border: '1px solid rgba(200,160,255,0.35)',
          color: 'rgba(200,160,255,0.7)', padding: '7px 18px',
          borderRadius: 6, cursor: 'pointer', fontSize: 13, letterSpacing: 1
        }}
      >
        ← Back
      </button>
      {children}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        .upload-zone {
          border: 2px dashed rgba(200,160,255,0.35);
          border-radius: 16px;
          padding: 48px 40px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          width: 360px;
          max-width: 90vw;
        }
        .upload-zone:hover {
          border-color: rgba(200,160,255,0.7);
          background: rgba(200,160,255,0.05);
        }
        .upload-zone.has-image {
          border-color: rgba(200,160,255,0.6);
          padding: 16px;
        }
      `}</style>
    </div>
  );

  // ── upload ────────────────────────────────────────────────────
  if (step === 'upload') return (
    <Shell>
      <div style={{ textAlign: 'center', color: 'rgba(200,160,255,0.85)', maxWidth: 420 }}>
        <div style={{ fontSize: 17, letterSpacing: 4, marginBottom: 8 }}>TOY PLANET 4.0</div>
        <div style={{ fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginBottom: 36 }}>
          UPLOAD ANY PHOTO · BECOME A PLANET
        </div>

        <div
          className={`upload-zone${previewUrl ? ' has-image' : ''}`}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 10 }}
            />
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🪐</div>
              <div style={{ fontSize: 14, color: 'rgba(200,160,255,0.7)', marginBottom: 8 }}>
                Drop your photo here
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>
                or click to browse
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {error && (
          <div style={{ color: 'rgba(255,80,80,0.8)', fontSize: 13, marginTop: 16 }}>{error}</div>
        )}

        {previewUrl && (
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                background: 'none', border: '1px solid rgba(200,160,255,0.3)',
                color: 'rgba(200,160,255,0.6)', padding: '11px 24px',
                borderRadius: 8, cursor: 'pointer', fontSize: 13, letterSpacing: 1,
                fontFamily: 'inherit'
              }}
            >
              Change Photo
            </button>
            <button
              onClick={generate}
              style={{
                background: 'rgba(200,160,255,0.12)', border: '1px solid rgba(200,160,255,0.6)',
                color: 'rgba(200,160,255,1)', padding: '11px 32px',
                borderRadius: 8, cursor: 'pointer', fontSize: 14, letterSpacing: 2,
                fontFamily: 'inherit', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,160,255,0.22)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,160,255,0.12)'; e.currentTarget.style.color = 'rgba(200,160,255,1)'; }}
            >
              🪐 Generate Planet
            </button>
          </div>
        )}
      </div>
    </Shell>
  );

  // ── generating ────────────────────────────────────────────────
  if (step === 'generating') {
    const pct    = ((120 - countdown) / 120) * 100;
    const urgent = countdown <= 20;
    return (
      <Shell>
        <div style={{ textAlign: 'center', color: 'rgba(200,160,255,0.85)' }}>
          <div style={{
            width: 72, height: 72,
            border: '3px solid rgba(180,140,255,0.15)',
            borderTop: '3px solid rgba(180,140,255,0.95)',
            borderRadius: '50%', margin: '0 auto 32px',
            animation: 'spin 0.9s linear infinite'
          }} />

          <div style={{ fontSize: 17, letterSpacing: 4, marginBottom: 36 }}>
            BUILDING YOUR WORLD…
          </div>

          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 18px' }}>
            <svg width="120" height="120" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(180,140,255,0.1)" strokeWidth="4" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={urgent ? 'rgba(255,80,60,0.9)' : 'rgba(180,140,255,0.85)'}
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

  // ── result ────────────────────────────────────────────────────
  if (step === 'result' && planetUrl) return (
    <Shell>
      <img
        src={planetUrl}
        alt="Your planet"
        style={{
          maxWidth: '80vmin', maxHeight: '80vmin',
          width: 'auto', height: 'auto',
          objectFit: 'contain',
          animation: 'float 4s ease-in-out infinite',
          position: 'relative', zIndex: 2
        }}
      />

      {/* Title */}
      <div style={{
        position: 'absolute', top: 32, left: 0, right: 0,
        textAlign: 'center', pointerEvents: 'none', zIndex: 3
      }}>
        <div style={{
          color: 'rgba(220,190,255,0.9)',
          fontSize: 'clamp(14px, 2vw, 24px)',
          fontWeight: 700, letterSpacing: '0.12em',
          textShadow: '0 0 30px rgba(180,140,255,0.7), 0 2px 10px rgba(0,0,0,0.9)',
          textTransform: 'uppercase'
        }}>
          YOUR WORLD
        </div>
      </div>

      {/* Download */}
      <button
        onClick={download}
        title="Download"
        style={{
          position: 'absolute', bottom: 32, right: 32, zIndex: 20,
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(200,160,255,0.4)',
          color: 'rgba(200,160,255,0.85)', width: 48, height: 48,
          borderRadius: 10, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(120,60,200,0.3)'; e.currentTarget.style.borderColor = 'rgba(200,160,255,0.9)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = 'rgba(200,160,255,0.4)'; e.currentTarget.style.color = 'rgba(200,160,255,0.85)'; }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>

      {/* Buttons */}
      <div style={{
        position: 'absolute', bottom: 32, left: 0, right: 0,
        textAlign: 'center', zIndex: 3, display: 'flex', gap: 12, justifyContent: 'center'
      }}>
        <button
          onClick={reset}
          style={{
            background: 'none', border: '1px solid rgba(200,160,255,0.3)',
            color: 'rgba(200,160,255,0.6)', padding: '13px 28px',
            borderRadius: 8, cursor: 'pointer', fontSize: 14, letterSpacing: 1,
            fontFamily: 'inherit', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,160,255,0.7)'; e.currentTarget.style.color = 'rgba(200,160,255,0.9)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,160,255,0.3)'; e.currentTarget.style.color = 'rgba(200,160,255,0.6)'; }}
        >
          Upload New Photo
        </button>
        <button
          onClick={generate}
          style={{
            background: 'none', border: '1px solid rgba(200,160,255,0.5)',
            color: 'rgba(200,160,255,0.9)', padding: '13px 32px',
            borderRadius: 8, cursor: 'pointer', fontSize: 14, letterSpacing: 2,
            fontFamily: 'inherit', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,160,255,1)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(120,60,200,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,160,255,0.5)'; e.currentTarget.style.color = 'rgba(200,160,255,0.9)'; e.currentTarget.style.background = 'none'; }}
        >
          🪐 Regenerate
        </button>
      </div>
    </Shell>
  );

  return null;
}
