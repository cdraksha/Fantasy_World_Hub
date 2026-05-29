import React, { useState, useEffect } from 'react';
import '../styles/indian-city-run.css';

const API_KEY = () => import.meta.env.VITE_SEGMIND_API_KEY;
const VID_URL = 'https://api.segmind.com/v1/seedance-2.0';

const WORLDS = [
  {
    id: 'varanasi',
    name: 'Varanasi Ghats',
    tagline: 'Dawn sprint along the sacred river',
    prompt: `2D hand-drawn anime animation. Studio Ghibli film style. Cel-shaded characters. Richly painted watercolor backgrounds. Fluid anime motion. NOT photorealistic. NOT 3D CGI. NOT live action.

Over-the-shoulder third-person chase view: runner's back and shoulders fill the lower center of frame, sprinting directly away from camera into the distance. The world ahead RUSHES toward the viewer at high speed. Anime speed lines streak from center outward on both sides. Ancient stone ghats of Varanasi at golden dawn — stone steps and temple walls fly past left and right in motion blur. The Ganges glows amber-gold ahead. Marigold petals and incense smoke whip violently sideways past the camera in the wind. Morning mist parts as the runner plunges through. Temple gopurams loom ahead then blur overhead. Ghibli watercolor sky — soft gold and rose. Runner wears a loose white kurta streaming behind. Each stride kicks up ghat water in anime splash arcs. Hand-painted depth, rich cel-shaded textures, anime motion blur.`,
  },
  {
    id: 'delhi',
    name: 'Old Delhi Bazaar',
    tagline: 'Full sprint through Chandni Chowk',
    prompt: `2D hand-drawn anime animation. Studio Ghibli film style. Cel-shaded characters. Richly painted watercolor backgrounds. Fluid anime motion. NOT photorealistic. NOT 3D CGI. NOT live action.

Over-the-shoulder third-person chase view: runner's back and shoulders in lower center frame, sprinting directly forward away from camera. The narrow bazaar ahead RUSHES toward the viewer. Anime speed lines blast outward from center. Chandni Chowk alley walls rush past left and right in heavy motion blur — colorful fabric shops, marigold garland chains, glowing lanterns smearing into streaks. Turmeric dust and scattered flower petals explode sideways past camera in the wind. A Mughal archway looms ahead and blurs overhead. Runner's dupatta streams and snaps behind like a whip. Warm amber light bounces off painted walls. Claustrophobic alley, sky barely a strip above. Hand-painted Ghibli watercolor textures — vivid saffron, crimson, gold. Anime speed blur, cel-shaded motion.`,
  },
  {
    id: 'hampi',
    name: 'Hampi Ruins',
    tagline: 'Racing through Vijayanagara stone corridors',
    prompt: `2D hand-drawn anime animation. Studio Ghibli film style. Cel-shaded characters. Richly painted stone textures. Fluid anime motion. NOT photorealistic. NOT 3D CGI. NOT live action.

Over-the-shoulder third-person chase view: runner's back in lower center frame sprinting directly forward away from camera. The ancient stone corridor ahead RUSHES toward the viewer at full speed. Anime speed lines radiate from center outward. Towering carved Vijayanagara stone pillars streak past left and right in anime motion blur — intricate carvings smearing into texture streaks. Fine red dust and dried flower petals spiral violently sideways past the camera. Golden afternoon light blasts through pillar gaps ahead, creating alternating bars of bright and shadow. Ruined gopuram visible far ahead getting closer fast. Each footfall kicks up a small anime dust cloud. Hand-painted Ghibli watercolor stone — ochre, rust, deep shadow. Cel-shaded runner, rich depth of field blur on periphery.`,
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan Blue City',
    tagline: 'Sprinting through Jodhpur\'s painted corridors',
    prompt: `2D hand-drawn anime animation. Studio Ghibli film style. Cel-shaded characters. Richly painted watercolor backgrounds. Fluid anime motion. NOT photorealistic. NOT 3D CGI. NOT live action.

Over-the-shoulder third-person chase view: runner's back in lower center frame sprinting directly forward away from camera. The blue-walled corridor ahead RUSHES toward the viewer. Anime speed lines blast outward from center. Brilliant cobalt-blue painted walls rush past left and right in anime motion blur — carved sandstone jali screens and arched doorways smearing into streaks. Silk dupattas and hanging fabric decorations fly violently sideways past camera in the desert wind. Rose petals spiral upward in anime arcs. Mehrangarh Fort looms massive ahead getting closer. Harsh Rajasthan sunlight carves crisp shadows through carved stone. Hand-painted Ghibli watercolor palette — vivid cobalt, saffron, warm sandstone. Cel-shaded anime motion, speed blur on both walls.`,
  },
  {
    id: 'mumbai',
    name: 'Mumbai Monsoon',
    tagline: 'Monsoon sprint through rain-soaked streets',
    prompt: `2D hand-drawn anime animation. Studio Ghibli film style. Cel-shaded characters. Richly painted watercolor backgrounds. Fluid anime motion. NOT photorealistic. NOT 3D CGI. NOT live action.

Over-the-shoulder third-person chase view: runner's back in lower center frame sprinting directly forward into a violent monsoon. The rain-soaked street ahead RUSHES toward the viewer. Anime speed lines radiate from center. Thick diagonal sheets of anime-style rain slash across the entire frame. Narrow Mumbai street buildings rush past left and right in motion blur — neon chai stall signs and old plaster facades smearing into streaks. Puddles EXPLODE in anime splash arcs under each footstep. Neon reflections ripple on the flooded road ahead. Banana leaves and debris fly violently sideways past camera. Dark churning monsoon clouds press low overhead. Runner's clothes soaked and clinging, fabric plastered by rain. Hand-painted Ghibli watercolor — deep indigo sky, neon teal and magenta reflections on black water. Rich anime rain texture, cel-shaded motion blur.`,
  },
];

function getRandomWorld() {
  return WORLDS[Math.floor(Math.random() * WORLDS.length)];
}

async function generateRun(world) {
  const res = await fetch(VID_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: world.prompt,
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

function ElapsedTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <div className="icr-timer">{m}:{s}</div>;
}

export default function IndianCityRun({ onStop }) {
  const [screen, setScreen]   = useState('idle');
  const [world, setWorld]     = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (document.getElementById('icr-fonts')) return;
    const link = document.createElement('link');
    link.id = 'icr-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@500;600&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400&display=swap';
    document.head.appendChild(link);
    return () => { document.getElementById('icr-fonts')?.remove(); };
  }, []);

  const generate = async () => {
    const chosen = getRandomWorld();
    setWorld(chosen);
    setScreen('loading');
    setVideoUrl(null);
    setError(null);
    try {
      const url = await generateRun(chosen);
      setVideoUrl(url);
      setScreen('result');
    } catch (err) {
      setError(err.message || 'Failed to generate. Try again.');
      setScreen('error');
    }
  };

  return (
    <div className="icr-root">
      <div className="icr-bg" />
      <div className="icr-noise" />

      {/* Idle */}
      {screen === 'idle' && (
        <div className="icr-center">
          <button className="icr-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="icr-idle-kicker">5 Worlds · Ghibli Anime · Seedance 2.0</div>
          <div className="icr-idle-title">Indian<br />City Run</div>
          <div className="icr-world-pills">
            {WORLDS.map(w => (
              <span key={w.id} className="icr-pill">{w.name}</span>
            ))}
          </div>
          <button className="icr-start-btn" onClick={generate}>
            Start the Run
          </button>
        </div>
      )}

      {/* Loading */}
      {screen === 'loading' && (
        <div className="icr-center">
          <button className="icr-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="icr-loading-world">{world?.name}</div>
          <div className="icr-loading-tagline">{world?.tagline}</div>
          <div className="icr-runner-anim">
            <div className="icr-runner-track">
              <div className="icr-runner-dot" />
            </div>
          </div>
          <div className="icr-loading-sub">Seedance 2.0 is rendering your world</div>
          <ElapsedTimer />
        </div>
      )}

      {/* Result */}
      {screen === 'result' && (
        <div className="icr-result">
          <div className="icr-result-bar">
            <button className="icr-back-btn" style={{ position: 'static' }} onClick={onStop}>◂ Exit</button>
            <div className="icr-result-info">
              <span className="icr-result-world">{world?.name}</span>
              <span className="icr-result-tagline">{world?.tagline}</span>
            </div>
            <button className="icr-again-btn" onClick={generate}>↺ New Run</button>
          </div>
          <div className="icr-video-wrap">
            <video className="icr-video" src={videoUrl} controls autoPlay playsInline />
          </div>
        </div>
      )}

      {/* Error */}
      {screen === 'error' && (
        <div className="icr-center">
          <button className="icr-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="icr-loading-world" style={{ color: 'rgba(220,80,40,0.8)' }}>Run failed</div>
          <div className="icr-loading-sub">{error}</div>
          <button className="icr-again-btn" style={{ marginTop: 28 }} onClick={generate}>Try Again</button>
        </div>
      )}
    </div>
  );
}
