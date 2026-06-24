import React, { useState, useEffect, useCallback } from 'react';
import '../styles/darshan.css';

const API_KEY = () => import.meta.env.VITE_SEGMIND_API_KEY;
const GPT_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL = 'https://api.segmind.com/v1/gpt-image-2';

const LABELS_A = [
  'The cosmos is assembling…',
  'GPT-4 is choosing the moment…',
  'Finding the divine frame…',
  'The mythology is speaking…',
];

const LABELS_B = [
  'Light is breaking through the dark…',
  'The divine form is taking shape…',
  'God-rays cutting through the storm…',
  'The silhouette is emerging…',
  'Almost here…',
];

async function fetchVision() {
  const res = await fetch(GPT_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      max_tokens: 320,
      temperature: 1.1,
      stream: false,
      messages: [
        {
          role: 'system',
          content: `You are a cinematic VFX director specializing in Hindu mythology epics — think Baahubali meets a $500M Hollywood production. You create breathtaking photorealistic cinematic stills with one sacred visual formula: LOW ANGLE looking up, foreground figure in near-complete silhouette, divine being above radiating blinding god-rays, violent dark storm clouds. NOT anime. NOT illustrated. NOT painted. Purely photorealistic. Utterly epic scale.`
        },
        {
          role: 'user',
          content: `Pick one specific iconic moment from Hindu mythology. Each call must be a DIFFERENT moment — vary across Ramayana, Mahabharata, Puranas, Vedas. Return ONLY valid JSON, no markdown:
{
  "title": "<specific scene name, 4-7 words, e.g. 'Hanuman Lifts the Sanjeevani Mountain'>",
  "prompt": "<190-220 word photorealistic image generation prompt. STRICT visual formula: LOW ANGLE SHOT from ground level looking UP. FOREGROUND: a human or warrior figure in near-complete dark silhouette occupying the lower 25% of frame — describe their specific pose, weapon, garment in silhouette terms only, no color. UPPER 70% OF FRAME: the divine figure, deity or cosmic phenomenon towering impossibly large — describe intricate details: multiple arms each holding sacred weapons, ornate crown, flowing divine garments, a blazing radiant core — ALL of this is backlit, radiating blinding golden god-rays outward in every direction like a second sun. ATMOSPHERE: violent dark storm clouds churning behind the deity, thick diagonal rain streaking the entire frame, occasional lightning. COLOR PALETTE: pure black in foreground and edges, burning amber-gold in center radiating outward, deep charcoal and purple storm clouds. LIGHTING: the deity IS the only light source — everything else in shadow. Cinematic chiaroscuro. End with: 'photorealistic VFX still, 8K ultra-detail, cinematic god-rays, no illustration, no anime, no painting, dramatic chiaroscuro, Baahubali production quality.'>"
}`
        }
      ]
    })
  });
  if (!res.ok) throw new Error(`GPT ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned);
}

async function fetchImage(prompt) {
  const res = await fetch(IMG_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      size: '1024x1536',
      quality: 'high',
      moderation: 'auto',
      background: 'opaque',
      output_compression: 100,
      output_format: 'png',
      image_urls: [],
    })
  });
  if (!res.ok) throw new Error(`Image ${res.status}: ${await res.text()}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function CyclicLabel({ labels, interval = 2800 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % labels.length), interval);
    return () => clearInterval(id);
  }, [labels, interval]);
  return <div className="drsh-cyclic" key={idx}>{labels[idx]}</div>;
}

function ElapsedTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <div className="drsh-timer">{m}:{s}</div>;
}

export default function Darshan({ onStop }) {
  const [screen, setScreen]       = useState('idle');
  const [phase, setPhase]         = useState(null);
  const [visionTitle, setVisionTitle] = useState('');
  const [imageUrl, setImageUrl]   = useState(null);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (document.getElementById('drsh-fonts')) return;
    const link = document.createElement('link');
    link.id = 'drsh-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400&display=swap';
    document.head.appendChild(link);
    return () => { document.getElementById('drsh-fonts')?.remove(); };
  }, []);

  const generate = useCallback(async () => {
    setScreen('loading');
    setPhase('A');
    setVisionTitle('');
    setImageUrl(null);
    setError(null);
    try {
      const vision = await fetchVision();
      setVisionTitle(vision.title);
      setPhase('B');
      const url = await fetchImage(vision.prompt);
      setImageUrl(url);
      setScreen('result');
    } catch (err) {
      setError(err.message || 'The vision could not be summoned. Try again.');
      setScreen('error');
    }
  }, []);

  const download = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `darshan_${visionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    a.click();
  }, [imageUrl, visionTitle]);

  return (
    <div className="drsh-root">
      <div className="drsh-bg" />
      <div className="drsh-rays" />
      <div className="drsh-noise" />

      {/* Idle */}
      {screen === 'idle' && (
        <div className="drsh-center">
          <button className="drsh-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="drsh-idle-kicker">Hindu Mythology · GPT-4 · gpt-image-2</div>
          <div className="drsh-idle-title">Darshan</div>
          <div className="drsh-idle-sub">Every vision is a different divine moment.</div>
          <div className="drsh-idle-divider" />
          <div className="drsh-idle-formula">
            <span>Silhouette below</span>
            <span className="drsh-formula-sep">·</span>
            <span>Deity above</span>
            <span className="drsh-formula-sep">·</span>
            <span>God-rays through the storm</span>
          </div>
          <button className="drsh-receive-btn" onClick={generate}>
            Receive Darshan
          </button>
        </div>
      )}

      {/* Loading */}
      {screen === 'loading' && (
        <div className="drsh-center">
          <button className="drsh-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="drsh-loading-phase">
            {phase === 'A' ? 'GPT-4 · Choosing the moment' : 'gpt-image-2 · Rendering the vision'}
          </div>
          {visionTitle && (
            <div className="drsh-loading-title">{visionTitle}</div>
          )}
          <div className="drsh-orb-wrap">
            <div className="drsh-orb-ring drsh-orb-r1" />
            <div className="drsh-orb-ring drsh-orb-r2" />
            <div className="drsh-orb-ring drsh-orb-r3" />
            <div className="drsh-orb-core" />
          </div>
          <CyclicLabel labels={phase === 'A' ? LABELS_A : LABELS_B} />
          <ElapsedTimer />
        </div>
      )}

      {/* Result */}
      {screen === 'result' && (
        <div className="drsh-result">
          <div className="drsh-result-bar">
            <button className="drsh-back-btn" style={{ position: 'static' }} onClick={onStop}>◂ Exit</button>
            <div className="drsh-result-title">{visionTitle}</div>
            <div className="drsh-result-actions">
              <button className="drsh-action-btn" onClick={download}>↓ Save</button>
              <button className="drsh-action-btn drsh-action-next" onClick={generate}>↺ Next Vision</button>
            </div>
          </div>
          <div className="drsh-image-wrap">
            <img className="drsh-image" src={imageUrl} alt={visionTitle} />
          </div>
        </div>
      )}

      {/* Error */}
      {screen === 'error' && (
        <div className="drsh-center">
          <button className="drsh-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="drsh-loading-title" style={{ color: 'rgba(220,80,40,0.8)' }}>Vision lost</div>
          <div className="drsh-cyclic">{error}</div>
          <button className="drsh-receive-btn" style={{ marginTop: 28 }} onClick={generate}>Try Again</button>
        </div>
      )}
    </div>
  );
}
