import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/the-convergence.css';

const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;
const GPT_URL  = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';

const ORBS = [
  { top:'12%', left:'14%', size:140, color:'rgba(220,170,55,0.06)',  anim:'tc-float-a', dur:15 },
  { top:'22%', left:'78%', size:110, color:'rgba(160,130,255,0.05)', anim:'tc-float-b', dur:17 },
  { top:'64%', left:'8%',  size:90,  color:'rgba(160,130,255,0.05)', anim:'tc-float-c', dur:13 },
  { top:'74%', left:'70%', size:160, color:'rgba(220,170,55,0.06)',  anim:'tc-float-d', dur:18 },
  { top:'40%', left:'46%', size:120, color:'rgba(160,130,255,0.05)', anim:'tc-float-a', dur:16 },
  { top:'8%',  left:'52%', size:60,  color:'rgba(220,170,55,0.06)',  anim:'tc-float-c', dur:12 },
  { top:'52%', left:'88%', size:70,  color:'rgba(220,170,55,0.06)',  anim:'tc-float-b', dur:14 },
  { top:'84%', left:'34%', size:100, color:'rgba(160,130,255,0.05)', anim:'tc-float-d', dur:17 },
  { top:'34%', left:'24%', size:50,  color:'rgba(220,170,55,0.06)',  anim:'tc-float-a', dur:13 },
  { top:'58%', left:'58%', size:80,  color:'rgba(160,130,255,0.05)', anim:'tc-float-c', dur:16 },
];

const CYCLIC_LABELS = [
  'Dissolving the present…',
  'Reaching back to colonial shadows…',
  'Finding the medieval city beneath…',
  'Touching the ancient foundation…',
];

const ERAS = ['Ancient', 'Medieval', 'Colonial', 'Modern'];

/* ── API calls ── */

async function fetchConvergencePrompt(city) {
  const res = await fetch(GPT_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      max_tokens: 1100,
      temperature: 0.9,
      stream: false,
      messages: [{
        role: 'user',
        content: `You are a cinematic visual artist and historian. The user has chosen the city: "${city}".

Create a concept for a quadruple-exposure photograph that layers 4 historical eras of this city into one impossible image — Ancient, Medieval, Colonial, Modern — all overlapping like a long-exposure ghost photograph. Think Makoto Shinkai cinematography meets a museum photograph.

Return ONLY valid JSON, no markdown:
{
  "imagePrompt": "<180-220 word image generation prompt. Describe the quadruple-exposure photograph in rich visual detail. Be specific to this city's actual landmarks and history in each era. The image should feel like a Makoto Shinkai film still — deep atmospheric light, emotional weight, hyperrealistic painterly quality. Describe what physically overlaps in the frame: which ancient structure bleeds through which modern building, what colonial-era detail ghosts over the medieval layer. Mention the multiple-exposure photographic technique. Dark sky, cinematic light shafts, emotional.>",
  "caption": "<2-3 sentences of poetic prose describing what the viewer sees. Reference specific historical details of this city. Should feel like a film subtitle or museum placard. End with one line that makes the viewer sit quietly.>",
  "eras": {
    "ancient": "<1 vivid sentence: what specific ancient-era elements ghost through this image — original geography, earliest settlements, pre-historic structures specific to this city>",
    "medieval": "<1 vivid sentence: what medieval layer is visible — forts, temples, sultanate architecture, trade routes specific to this city's medieval history>",
    "colonial": "<1 vivid sentence: what colonial-era elements bleed through — specific buildings, infrastructure, foreign architectural styles layered into this city>",
    "modern": "<1 vivid sentence: what present-day elements anchor the image — skyline, bridges, contemporary landmarks visible in sharp contrast to the ghosted past>"
  }
}`
      }]
    })
  });
  if (!res.ok) throw new Error(`GPT ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned);
}

async function fetchConvergenceImage(imagePrompt) {
  const res = await fetch(IMG_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: imagePrompt,
      size: '1536x1024',
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

/* ── Background (persistent) ── */
function Background() {
  return (
    <>
      <div className="tc-bg-base" />
      <div className="tc-shafts">
        <div className="tc-shaft tc-shaft-gold" />
        <div className="tc-shaft tc-shaft-lav" />
      </div>
      <div className="tc-bokeh">
        {ORBS.map((o, i) => (
          <div key={i} className="tc-orb" style={{
            top: o.top, left: o.left, width: o.size, height: o.size,
            background: o.color,
            animation: `${o.anim} ${o.dur}s ease-in-out infinite alternate`,
            animationDelay: `${-(i * 1.4)}s`,
          }} />
        ))}
      </div>
      <svg className="tc-grain" xmlns="http://www.w3.org/2000/svg">
        <filter id="tc-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tc-noise)" />
      </svg>
      <div className="tc-scan" />
    </>
  );
}

/* ── Elapsed timer ── */
function ElapsedTimer({ running }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) { setSecs(0); return; }
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <div className="tc-timer">{m}:{s}</div>;
}

/* ── Loading screen ── */
function LoadingScreen({ active, city, phase }) {
  const [labelIdx, setLabelIdx] = useState(0);

  useEffect(() => {
    if (!active) { setLabelIdx(0); return; }
    const id = setInterval(() => setLabelIdx(i => (i + 1) % CYCLIC_LABELS.length), 1800);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className={`tc-screen${active ? ' active' : ''}`}>
      <div className="tc-load-col">
        <div className="tc-load-city">{city}</div>

        <div className="tc-step">
          {phase === 'A' ? 'Step 1 of 2  ·  Writing the eras' : 'Step 2 of 2  ·  Painting the convergence'}
        </div>

        <div className="tc-cyclic">
          <span key={labelIdx} style={{ animation: 'tc-label-cycle 1.8s ease-in-out' }}>
            {CYCLIC_LABELS[labelIdx]}
          </span>
        </div>

        <div className="tc-scanbar" />

        <ElapsedTimer running={active} />

        {phase === 'B' && (
          <div className="tc-era-chips">
            {ERAS.map((era, i) => (
              <React.Fragment key={era}>
                <span className="tc-era-chip" style={{ animationDelay: `${i * 0.3}s` }}>{era}</span>
                {i < ERAS.length - 1 && (
                  <span className="tc-era-arrow" style={{ animationDelay: `${i * 0.3 + 0.15}s` }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="tc-status">
          {phase === 'A' ? 'GPT-4 is writing the eras' : 'gpt-image-2 is collapsing the centuries'}
        </div>
      </div>
    </div>
  );
}

const ERA_CONFIG = [
  { key: 'ancient',  label: 'Ancient',  corner: 'tc-corner-bl', tint: 'rgba(220,150,30,0.2)',  chipActive: 'rgba(220,150,30,0.15)',  borderActive: 'rgba(220,150,30,0.8)',  colorActive: 'rgba(255,190,60,0.95)'  },
  { key: 'medieval', label: 'Medieval', corner: 'tc-corner-tl', tint: 'rgba(140,80,220,0.2)',  chipActive: 'rgba(140,80,220,0.15)',  borderActive: 'rgba(140,80,220,0.8)',  colorActive: 'rgba(180,120,255,0.95)' },
  { key: 'colonial', label: 'Colonial', corner: 'tc-corner-tr', tint: 'rgba(40,160,130,0.2)',  chipActive: 'rgba(40,160,130,0.15)',  borderActive: 'rgba(40,160,130,0.8)',  colorActive: 'rgba(60,200,160,0.95)'  },
  { key: 'modern',   label: 'Modern',   corner: 'tc-corner-br', tint: 'rgba(160,190,220,0.18)', chipActive: 'rgba(160,190,220,0.12)', borderActive: 'rgba(160,190,220,0.8)', colorActive: 'rgba(200,220,240,0.95)' },
];

/* ── Result screen ── */
function ResultScreen({ active, city, imageUrl, caption, eras, onExit, onNewCity }) {
  const [activeEra, setActiveEra] = useState(null);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `convergence-${city.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  }, [imageUrl, city]);

  const activeCfg = ERA_CONFIG.find(e => e.key === activeEra);

  return (
    <div className={`tc-screen tc-result${active ? ' active' : ''}`}>
      <div className="tc-result-wrap">
        <div className="tc-topbar">
          <div className="tc-topbar-left">
            <button className="tc-exit-inline" onClick={onExit}>◂ Exit</button>
          </div>
          <div className="tc-topbar-center">
            <div className="tc-tb-city">{city}</div>
            <div className="tc-tb-eras">Ancient → Medieval → Colonial → Modern</div>
          </div>
          <div className="tc-topbar-right">
            <button className="tc-new-city" onClick={onNewCity}>↺ New City</button>
          </div>
        </div>

        <div className="tc-image-area">
          <div className="tc-image-frame">
            {imageUrl && <img className="tc-img" src={imageUrl} alt={`The Convergence — ${city}`} />}

            {/* era tint overlay */}
            <div className="tc-era-tint" style={{
              background: activeCfg ? activeCfg.tint : 'transparent',
              mixBlendMode: 'screen',
            }} />

            {/* 4 corner era chips */}
            {ERA_CONFIG.map(cfg => {
              const isActive = activeEra === cfg.key;
              return (
                <button
                  key={cfg.key}
                  className={`tc-era-chip-corner ${cfg.corner}`}
                  style={{
                    borderColor: isActive ? cfg.borderActive : undefined,
                    color:       isActive ? cfg.colorActive  : undefined,
                    background:  isActive ? cfg.chipActive   : undefined,
                  }}
                  onMouseEnter={() => setActiveEra(cfg.key)}
                  onMouseLeave={() => setActiveEra(null)}
                  onClick={() => setActiveEra(activeEra === cfg.key ? null : cfg.key)}
                >
                  {cfg.label}
                </button>
              );
            })}

            {/* era description */}
            {activeEra && eras?.[activeEra] && (
              <div key={activeEra} className="tc-era-desc">
                {eras[activeEra]}
              </div>
            )}

            <button className="tc-dl-btn" onClick={handleDownload}>⬇ Save</button>
          </div>
        </div>

        <div className="tc-caption-bar">
          <p>{caption}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Error screen ── */
function ErrorScreen({ active, city, message, onRetry, onExit }) {
  return (
    <div className={`tc-screen${active ? ' active' : ''}`}>
      <button className="tc-exit" onClick={onExit}>◂ Exit</button>
      <div className="tc-error-col">
        <div className="tc-err-city">{city || 'Error'}</div>
        <div className="tc-err-sub">The layers could not converge</div>
        <div className="tc-err-raw">{message}</div>
        <button className="tc-err-btn" onClick={onRetry}>Try Again</button>
      </div>
    </div>
  );
}

/* ── Root ── */
export default function TheConvergence({ onStop }) {
  const [screen, setScreen]   = useState('idle');
  const [phase, setPhase]     = useState('A');
  const [input, setInput]     = useState('');
  const [city, setCity]       = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [eras, setEras]       = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (document.getElementById('tc-fonts')) return;
    const link = document.createElement('link');
    link.id = 'tc-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400&display=swap';
    document.head.appendChild(link);
    return () => { document.getElementById('tc-fonts')?.remove(); };
  }, []);

  const generate = useCallback(async (cityName) => {
    const c = cityName.trim() || 'Mumbai';
    setCity(c);
    setImageUrl(null);
    setCaption('');
    setEras(null);
    setError('');
    setPhase('A');
    setScreen('loading');

    try {
      const { imagePrompt, caption: cap, eras: eraData } = await fetchConvergencePrompt(c);

      setPhase('B');

      const url = await fetchConvergenceImage(imagePrompt);

      setImageUrl(url);
      setCaption(cap);
      setEras(eraData || null);
      setScreen('result');
    } catch (err) {
      console.error('Convergence error:', err);
      setError(err.message || 'Generation failed. Try again.');
      setScreen('error');
    }
  }, []);

  const handleOpen = () => {
    if (!input.trim()) return;
    generate(input);
  };

  const handleNewCity = () => {
    setInput('');
    setScreen('idle');
  };

  const handleRetry = () => {
    setInput('');
    setScreen('idle');
  };

  return (
    <div className="tc-root">
      <Background />
      <div className="tc-stage">

        {/* Idle */}
        <div className={`tc-screen${screen === 'idle' ? ' active' : ''}`}>
          <button className="tc-exit" onClick={onStop}>◂ Exit</button>
          <div className="tc-idle-col">
            <div className="tc-eyebrow tc-fadein" style={{ animationDelay: '0.05s' }}>
              FANTASYWORLD · TEMPORAL IMAGING
            </div>
            <h1 className="tc-title tc-anim" style={{ animationDelay: '0.1s' }}>
              The Convergence
            </h1>
            <p className="tc-tagline tc-anim" style={{ animationDelay: '0.3s' }}>
              "Every city contains every version of itself."
            </p>
            <div className="tc-divider tc-fadein" style={{ animationDelay: '0.5s' }} />
            <input
              className="tc-input tc-anim"
              style={{ animationDelay: '0.6s' }}
              placeholder="Mumbai, Varanasi, Jaipur, Delhi…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleOpen(); }}
            />
            <div className="tc-pills tc-anim" style={{ animationDelay: '0.7s' }}>
              {ERAS.map(p => <span className="tc-pill" key={p}>{p}</span>)}
            </div>
            <button
              className="tc-trigger tc-anim"
              style={{ animationDelay: '0.85s' }}
              onClick={handleOpen}
              disabled={!input.trim()}
            >
              Open the Layers
            </button>
            <div className="tc-ambient tc-fadein" style={{ animationDelay: '1s' }}>
              gpt-4 · gpt-image-2 · quadruple exposure · 4 eras · 1 frame
            </div>
          </div>
        </div>

        {/* Loading */}
        <LoadingScreen active={screen === 'loading'} city={city} phase={phase} />

        {/* Result */}
        <ResultScreen
          active={screen === 'result'}
          city={city}
          imageUrl={imageUrl}
          caption={caption}
          eras={eras}
          onExit={onStop}
          onNewCity={handleNewCity}
        />

        {/* Error */}
        <ErrorScreen
          active={screen === 'error'}
          city={city}
          message={error}
          onRetry={handleRetry}
          onExit={onStop}
        />
      </div>
    </div>
  );
}
