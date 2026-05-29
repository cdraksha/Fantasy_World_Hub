import React, { useState, useEffect } from 'react';
import '../styles/fantasy-walk.css';

const API_KEY = () => import.meta.env.VITE_SEGMIND_API_KEY;
const VID_URL = 'https://api.segmind.com/v1/seedance-2.0';

const PROMPT = `Cinematic 16:9 video. A lone traveler in a flowing cloak walks along a winding ancient stone path toward a breathtaking fantasy world. Ahead: ancient floating islands drift in a luminous golden sky, glowing aurora forests shimmer on the horizon, crystal waterfalls cascade into misty valleys below. Camera follows low and close behind the traveler — slow cinematic tracking shot, the traveler's silhouette small against the vast radiant world ahead. Warm golden hour light with rays piercing through the clouds. Atmospheric orchestral music, emotional and grand, ethereal fantasy score. Studio Ghibli and epic fantasy cinematic quality. Painterly, hyper-detailed, soft depth of field. Awe-inspiring, majestic, serene.`;

async function generateWalk() {
  const res = await fetch(VID_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: PROMPT,
      duration: 10,
      resolution: '720p',
      aspect_ratio: '16:9',
      seed: Math.floor(Math.random() * 99999),
      skip_moderation: false,
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Seedance error:', errText);
    throw new Error(errText);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/* ── Elapsed timer ── */
function ElapsedTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <div className="fw-timer">{m}:{s}</div>;
}

export default function FantasyWalk({ onStop }) {
  const [screen, setScreen] = useState('idle');
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (document.getElementById('fw-fonts')) return;
    const link = document.createElement('link');
    link.id = 'fw-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Cormorant+SC:wght@500;600&family=JetBrains+Mono:wght@400&display=swap';
    document.head.appendChild(link);
    return () => { document.getElementById('fw-fonts')?.remove(); };
  }, []);


  const generate = async () => {
    setScreen('loading');
    setVideoUrl(null);
    setError(null);
    try {
      const url = await generateWalk();
      setVideoUrl(url);
      setScreen('result');
    } catch (err) {
      setError(err.message || 'Failed to generate. Try again.');
      setScreen('error');
    }
  };

  return (
    <div className="fw-root">
      <div className="fw-bg" />
      <div className="fw-noise" />

      {/* Idle */}
      {screen === 'idle' && (
        <div className="fw-loading">
          <button className="fw-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="fw-orb-wrap">
            <div className="fw-orb" />
            <div className="fw-orb-ring" />
            <div className="fw-orb-ring fw-orb-ring--2" />
          </div>
          <div className="fw-loading-label">Fantasy Walk</div>
          <button className="fw-again-btn" style={{ marginTop: 16 }} onClick={generate}>
            Open Portal
          </button>
        </div>
      )}

      {/* Loading */}
      {screen === 'loading' && (
        <div className="fw-loading">
          <button className="fw-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="fw-orb-wrap">
            <div className="fw-orb" />
            <div className="fw-orb-ring" />
            <div className="fw-orb-ring fw-orb-ring--2" />
          </div>
          <div className="fw-loading-label">Opening the portal…</div>
          <div className="fw-loading-sub">Seedance 2.0 is rendering your world</div>
          <ElapsedTimer />
        </div>
      )}

      {/* Result */}
      {screen === 'result' && (
        <div className="fw-result">
          <div className="fw-result-bar">
            <button className="fw-back-btn" style={{ position: 'static' }} onClick={onStop}>◂ Exit</button>
            <div className="fw-result-title">Fantasy Walk</div>
            <button className="fw-again-btn" onClick={generate}>↺ New World</button>
          </div>
          <div className="fw-video-wrap">
            <video
              className="fw-video"
              src={videoUrl}
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}

      {/* Error */}
      {screen === 'error' && (
        <div className="fw-loading">
          <button className="fw-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="fw-loading-label" style={{ color: 'rgba(196,100,50,0.8)' }}>Portal failed</div>
          <div className="fw-loading-sub">{error}</div>
          <button className="fw-again-btn" style={{ marginTop: 28 }} onClick={generate}>Try Again</button>
        </div>
      )}
    </div>
  );
}
