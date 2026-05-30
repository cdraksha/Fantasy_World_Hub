import React, { useState, useEffect, useRef } from 'react';
import '../styles/roadside-reverie.css';

const API_KEY = () => import.meta.env.VITE_SEGMIND_API_KEY;
const GPT_URL = 'https://api.segmind.com/v1/gpt-4';
const VID_URL = 'https://api.segmind.com/v1/kling-o3-text2video';

const SUGGESTIONS = [
  'Varanasi', 'Mumbai', 'Kyoto', 'Istanbul',
  'Jodhpur', 'Cairo', 'Venice', 'Bangkok',
];

const CYCLIC_LABELS_A = [
  'Scouting the perfect corner…',
  'Finding the right light…',
  'Choosing a spot to sit…',
  'Watching the city breathe…',
];

const CYCLIC_LABELS_B = [
  'Kling O3 is painting the frame…',
  'Cel-shading the background…',
  'Drawing the light…',
  'Almost there…',
];

async function fetchScene(city) {
  const res = await fetch(GPT_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      max_tokens: 900,
      temperature: 1.0,
      stream: false,
      messages: [{
        role: 'user',
        content: `You are a Ghibli film director and anime visual artist. The user has chosen the city: "${city}".

Create a single evocative 5-second anime scene: a lone figure sitting beside a wall, road, or landmark in this city — completely still — watching the world move in front of them.

Pick a specific iconic location and time of day that makes this city feel alive. The character sits, the world moves.

Return ONLY valid JSON, no markdown:
{
  "videoPrompt": "<180-220 word Kling O3 video generation prompt. MUST start with: '2D hand-drawn anime animation. Studio Ghibli film style. Cel-shaded characters. Richly painted watercolor backgrounds. Fluid anime motion. NOT photorealistic. NOT 3D CGI. NOT live action.' Then describe: the specific location in the city, the time of day and atmosphere, exactly how the lone figure is sitting and where (back against what, knees drawn up or stretched out), what the figure is watching (describe the motion in front of them in vivid detail — people, weather, light, animals, vehicles), ambient details that move (smoke, leaves, fabric, water, lanterns), the color palette specific to this city and scene. Camera: wide, still, side-angle. Ghibli watercolor sky. Cel-shaded. Cinematic stillness. End with: 'hand-painted depth, rich cel-shaded textures, anime stillness.'>",
  "tagline": "<8-12 words. Poetic, evocative. What the figure is watching. No period.>",
  "caption": "<2 sentences of poetic prose. What this moment feels like. Something true about sitting still in this city.>",
  "sceneName": "<The specific location name, e.g. 'Jama Masjid Steps' or 'Yasaka Shrine Lane'>"
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

async function fetchVideo(videoPrompt) {
  const res = await fetch(VID_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: videoPrompt,
      mode: 'pro',
      duration: '5',
      cfg_scale: 0.5,
      aspect_ratio: '16:9',
      generate_audio: false,
      negative_prompt: 'blur, distort, low quality, photorealistic, 3D, CGI, live action',
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Kling O3 error:', errText);
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
  return <div className="rsr-timer">{m}:{s}</div>;
}

function CyclicLabel({ labels, interval = 2800 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % labels.length), interval);
    return () => clearInterval(id);
  }, [labels, interval]);
  return <div className="rsr-cyclic-label" key={idx}>{labels[idx]}</div>;
}

export default function RoadsideReverie({ onStop }) {
  const [screen, setScreen] = useState('idle');
  const [phase, setPhase] = useState(null);
  const [input, setInput] = useState('');
  const [city, setCity] = useState('');
  const [scene, setScene] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (document.getElementById('rsr-fonts')) return;
    const link = document.createElement('link');
    link.id = 'rsr-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@500;600&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400&display=swap';
    document.head.appendChild(link);
    return () => { document.getElementById('rsr-fonts')?.remove(); };
  }, []);

  const generate = async (cityName) => {
    const target = (cityName || input).trim();
    if (!target) return;
    setCity(target);
    setScreen('loading');
    setPhase('A');
    setScene(null);
    setVideoUrl(null);
    setError(null);

    try {
      const sceneData = await fetchScene(target);
      setScene(sceneData);
      setPhase('B');
      const url = await fetchVideo(sceneData.videoPrompt);
      setVideoUrl(url);
      setScreen('result');
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
      setScreen('error');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') generate();
  };

  return (
    <div className="rsr-root">
      <div className="rsr-bg" />
      <div className="rsr-lantern" />
      <div className="rsr-noise" />

      {/* Idle */}
      {screen === 'idle' && (
        <div className="rsr-center">
          <button className="rsr-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="rsr-idle-kicker">Any City · Ghibli Anime · Kling O3</div>
          <div className="rsr-idle-title">Roadside<br />Reverie</div>
          <div className="rsr-idle-sub">Sit. Watch. Disappear into any city in the world.</div>

          <div className="rsr-input-wrap">
            <input
              ref={inputRef}
              className="rsr-input"
              type="text"
              placeholder="Type any city…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
            />
            <button
              className="rsr-input-btn"
              onClick={() => generate()}
              disabled={!input.trim()}
            >
              Find a Spot
            </button>
          </div>

          <div className="rsr-suggestions-label">or try</div>
          <div className="rsr-scene-pills">
            {SUGGESTIONS.map(c => (
              <button key={c} className="rsr-pill" onClick={() => { setInput(c); generate(c); }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {screen === 'loading' && (
        <div className="rsr-center">
          <button className="rsr-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="rsr-loading-city">{city}</div>
          <div className="rsr-loading-phase">
            {phase === 'A' ? 'GPT-4 · Writing the scene' : `Kling O3 · Painting the frame`}
          </div>
          <div className="rsr-breath">
            <div className="rsr-breath-ring rsr-ring-1" />
            <div className="rsr-breath-ring rsr-ring-2" />
            <div className="rsr-breath-ring rsr-ring-3" />
            <div className="rsr-breath-dot" />
          </div>
          <CyclicLabel labels={phase === 'A' ? CYCLIC_LABELS_A : CYCLIC_LABELS_B} />
          {phase === 'B' && scene && (
            <div className="rsr-phase-b-scene">{scene.sceneName}</div>
          )}
          <ElapsedTimer />
        </div>
      )}

      {/* Result */}
      {screen === 'result' && (
        <div className="rsr-result">
          <div className="rsr-result-bar">
            <button className="rsr-back-btn" style={{ position: 'static' }} onClick={onStop}>◂ Exit</button>
            <div className="rsr-result-info">
              <span className="rsr-result-city">{city} — {scene?.sceneName}</span>
              <span className="rsr-result-tagline">{scene?.tagline}</span>
            </div>
            <button className="rsr-again-btn" onClick={() => setScreen('idle')}>↺ New Spot</button>
          </div>
          <div className="rsr-video-wrap">
            <video className="rsr-video" src={videoUrl} controls autoPlay playsInline loop />
            {scene?.caption && (
              <div className="rsr-caption">{scene.caption}</div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {screen === 'error' && (
        <div className="rsr-center">
          <button className="rsr-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="rsr-loading-city" style={{ color: 'rgba(220,80,40,0.8)' }}>Scene lost</div>
          <div className="rsr-cyclic-label">{error}</div>
          <button className="rsr-again-btn" style={{ marginTop: 28 }} onClick={() => setScreen('idle')}>Try Again</button>
        </div>
      )}
    </div>
  );
}
