import React, { useState, useEffect, useRef } from 'react';
import '../styles/anime-battles.css';

const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;
const GPT_URL  = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/nano-banana';
const VID_URL  = 'https://api.segmind.com/v1/seedance-2.0';

/* ── GPT: generate battle concept + shot scripts ── */
async function generateBattle() {
  const prompt = `You are a cinematic director fusing Japanese anime (Demon Slayer, Attack on Titan) with Indian Hindu mythology for a brutal, epic 30-second battle video.

Randomly pick ONE battle from this list — choose unpredictably, not always the first:
1. Arjuna vs Karna — twilight Kurukshetra, the final duel of two divine archers, arrows of light splitting the sky
2. Rama vs Ravana — Lanka burning, ten-headed demon king vs the blue-skinned avatar, Brahmastra energy
3. Hanuman vs Indrajit — aerial battle through smoke and illusion above Lanka's flaming towers
4. Kali vs Raktabija — blood-rage battlefield, every drop of blood spawning another demon, Kali's tongue out, furious
5. Bhima vs Duryodhana — final mace duel in the dark at Kurukshetra, earth shattering with every impact
6. Krishna vs Narakasura — Sudarshana Chakra spinning as a weapon, demon fortress crumbling
7. Shiva vs Tripurasura — the moment Shiva's single arrow destroys three indestructible cities simultaneously
8. Parashurama vs Karna — forest clearing, master vs student, the curse being unleashed

The video is 30 seconds split into 3 segments of 10 seconds each. Each segment is rendered independently so timestamps reset to 0s–10s for each.

Shot style rules — STRICTLY anime:
- Demon Slayer: breathing technique effects, glowing eyes, speed lines, elemental auras around weapons
- Attack on Titan: brutal kinetic energy, extreme close-ups of eyes before strikes, wide shots showing scale and devastation
- Hard cuts between shots, NOT slow dissolves
- Dark and saturated — not pastel, not generic glowing auras
- Camera moves fast: low-angle upward tilts, rapid tracking shots, crash zooms
- Describe: camera type, subject action, visual effects, color mood for EVERY shot

WARRIORS description: Give a short but precise visual description of each fighter (hair, armor, weapon, aura color) for consistency.

Return ONLY valid JSON — no markdown, no extra text:
{
  "battle": "Fighter A vs Fighter B",
  "warriors": "Fighter A: [appearance]. Fighter B: [appearance].",
  "description": "one brutal tagline line",
  "mood": "dark and brutal",
  "imagePrompt": "A cinematic Japanese anime battle poster. [describe the exact scene with fighter appearances, weapons, environment, dramatic lighting]. Demon Slayer art style, dark palette, hyper-detailed.",
  "segmentA": "Shot 1 | 0s–3s\\n[camera type, movement]. [Subject action]. [Visual effects]. [Color mood].\\n\\nShot 2 | 3s–6s\\n[...] \\n\\nShot 3 | 6s–10s\\n[...]",
  "segmentB": "Shot 4 | 0s–3s\\n[...]\\n\\nShot 5 | 3s–7s\\n[...]\\n\\nShot 6 | 7s–10s\\n[...]",
  "segmentC": "Shot 7 | 0s–4s\\n[...]\\n\\nShot 8 | 4s–7s\\n[...]\\n\\nShot 9 | 7s–10s\\n[...]"
}`;

  const res = await fetch(GPT_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      max_tokens: 2400,
      temperature: 0.95,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned);
}

/* ── Nano Banana: poster ── */
async function generatePoster(imagePrompt) {
  const res = await fetch(IMG_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: imagePrompt,
      samples: 1,
      width: 1024, height: 576,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      seed: Math.floor(Math.random() * 99999),
    })
  });
  if (!res.ok) throw new Error('poster failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/* ── Seedance 2.0: one 10s video segment ── */
async function generateSegment(battle, warriors, segmentScript) {
  const prompt = `Generate a 16:9 anime battle video in the style of Demon Slayer and Attack on Titan. Dark, brutal, hyper-kinetic.

Battle: ${battle}
Warriors: ${warriors}

${segmentScript}`;

  const res = await fetch(VID_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      reference_images: [],
      reference_videos: [],
      reference_audios: [],
      duration: 10,
      resolution: '720p',
      aspect_ratio: '16:9',
      generate_audio: true,
      seed: Math.floor(Math.random() * 99999),
      return_last_frame: false,
      skip_moderation: 'false',
    })
  });
  if (!res.ok) throw new Error('segment failed: ' + res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/* ── Elapsed timer ── */
function ElapsedTimer({ running }) {
  const [secs, setSecs] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!running) { setSecs(0); return; }
    ref.current = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return <div className="amb-timer">{m}:{s}</div>;
}

/* ── Landing ── */
function Landing({ onGenerate, onBack }) {
  return (
    <div className="amb-landing">
      <button className="amb-back-btn" onClick={onBack}>◂ Exit</button>
      <div className="amb-landing-kicker">Segmind Seedance 2.0 &nbsp;·&nbsp; 30 Seconds</div>
      <h1 className="amb-landing-title">Anime<br />Mythology<br />Wars</h1>
      <div className="amb-landing-deva">देवासुर संग्राम</div>
      <p className="amb-landing-desc">
        Hindu mythology battles rendered in Japanese anime — Demon Slayer intensity,
        Attack on Titan scale. Every generation is different. Every fight is brutal.
      </p>
      <button className="amb-generate-btn" onClick={onGenerate}>
        Summon the Battle
      </button>
      <div className="amb-generate-sub">
        GPT writes the script &nbsp;·&nbsp; 3 × 10s videos generate in parallel &nbsp;·&nbsp; ~5 min wait
      </div>
    </div>
  );
}

/* ── Generating screen ── */
function Generating({ battleData, posterUrl, videos, onDone }) {
  const segments = ['segmentA', 'segmentB', 'segmentC'];
  const labels   = ['Battle Reel I  (0–10s)', 'Battle Reel II  (10–20s)', 'Battle Reel III  (20–30s)'];

  const allDone = videos.every(v => v !== null);
  useEffect(() => { if (allDone) onDone(); }, [allDone, onDone]);

  const progress = (done, running) => {
    if (done) return 100;
    if (running) return 55; // indeterminate-ish
    return 0;
  };

  return (
    <div className="amb-generating">
      {/* Left: status */}
      <div className="amb-gen-left">
        <div className="amb-gen-battle-name">{battleData.battle}</div>
        <div className="amb-gen-tagline">{battleData.description}</div>

        <div className="amb-progress-list">
          {/* Poster */}
          <div className="amb-progress-item">
            <div className="amb-progress-label">
              <div className={'amb-progress-dot' + (posterUrl ? ' amb-done' : ' amb-running')} />
              <span className="amb-progress-label-text">Battle Poster</span>
            </div>
            <div className="amb-progress-bar-wrap">
              <div className="amb-progress-bar-fill" style={{ width: posterUrl ? '100%' : '40%' }} />
            </div>
          </div>

          {/* Videos */}
          {labels.map((label, i) => (
            <div key={i} className="amb-progress-item">
              <div className="amb-progress-label">
                <div className={'amb-progress-dot' + (videos[i] ? ' amb-done' : ' amb-running')} />
                <span className="amb-progress-label-text">{label}</span>
              </div>
              <div className="amb-progress-bar-wrap">
                <div className="amb-progress-bar-fill" style={{ width: progress(videos[i], true) + '%' }} />
              </div>
            </div>
          ))}
        </div>

        <ElapsedTimer running={true} />

        {posterUrl && (
          <div className="amb-poster-preview">
            <img src={posterUrl} alt="battle poster" />
          </div>
        )}
      </div>

      {/* Right: shot scripts */}
      <div className="amb-gen-right">
        {segments.map((seg, i) => (
          <div key={seg} className="amb-script-block">
            <div className="amb-script-seg-label">Segment {['I','II','III'][i]}  ·  {['0–10s','10–20s','20–30s'][i]}</div>
            <pre className="amb-script-text">{battleData[seg]}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Result screen ── */
function Result({ battleData, posterUrl, videos, onAgain, onBack }) {
  return (
    <div className="amb-result">
      <header className="amb-result-topbar">
        <button className="amb-back-btn" style={{ position: 'static' }} onClick={onBack}>◂ Back</button>
        <div className="amb-result-title">Anime Mythology Wars</div>
        <div />
      </header>

      <div className="amb-result-body">
        {/* Left: poster + info */}
        <div className="amb-poster-side">
          {posterUrl && <img src={posterUrl} alt="battle poster" />}
          <div className="amb-battle-info">
            <div className="amb-battle-name-big">{battleData.battle}</div>
            <div className="amb-battle-tag">{battleData.description}</div>
          </div>
          <button className="amb-again-btn" onClick={onAgain}>
            ⚔ New Battle
          </button>
        </div>

        {/* Right: videos */}
        <div className="amb-video-side">
          {videos.map((url, i) => (
            <div key={i} className="amb-video-item">
              <div className="amb-video-seg-label">
                Reel {['I','II','III'][i]} &nbsp;·&nbsp; {['0–10s','10–20s','20–30s'][i]}
              </div>
              {url ? (
                <video src={url} controls autoPlay={i === 0} loop={false} playsInline />
              ) : (
                <div className="amb-video-pending">
                  <div className="amb-video-spinner" />
                  <span>Rendering…</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Root ── */
export default function AnimeMythologyBattles({ onStop }) {
  const [screen, setScreen]     = useState('landing'); // landing | generating | result
  const [battleData, setBattleData] = useState(null);
  const [posterUrl, setPosterUrl]   = useState(null);
  const [videos, setVideos]         = useState([null, null, null]);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (document.getElementById('amb-fonts')) return;
    const link = document.createElement('link');
    link.id = 'amb-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Cormorant+SC:wght@500;600&family=Noto+Serif+Devanagari:wght@400;500&family=Manrope:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => { const el = document.getElementById('amb-fonts'); if (el) el.remove(); };
  }, []);

  const startGeneration = async () => {
    setError(null);
    setPosterUrl(null);
    setVideos([null, null, null]);
    setScreen('generating');

    try {
      // Phase 1: GPT writes the battle
      const data = await generateBattle();
      setBattleData(data);

      // Phase 2: Poster + 3 video segments all in parallel
      const posterPromise = generatePoster(data.imagePrompt)
        .then(url => setPosterUrl(url))
        .catch(() => {}); // poster failure is non-fatal

      const videoPromises = ['segmentA', 'segmentB', 'segmentC'].map((seg, i) =>
        generateSegment(data.battle, data.warriors, data[seg])
          .then(url => setVideos(prev => { const n = [...prev]; n[i] = url; return n; }))
          .catch(err => {
            console.error(`Segment ${i + 1} failed:`, err);
            setVideos(prev => { const n = [...prev]; n[i] = 'error'; return n; });
          })
      );

      await Promise.allSettled([posterPromise, ...videoPromises]);
      setScreen('result');
    } catch (err) {
      setError('Something went wrong generating the battle. Try again.');
      setScreen('landing');
    }
  };

  const handleAgain = () => {
    setBattleData(null);
    setPosterUrl(null);
    setVideos([null, null, null]);
    startGeneration();
  };

  return (
    <div className="amb-root">
      <div className="amb-bg" />
      <div className="amb-noise" />

      {screen === 'landing' && (
        <Landing onGenerate={startGeneration} onBack={onStop} />
      )}

      {screen === 'generating' && battleData && (
        <Generating
          battleData={battleData}
          posterUrl={posterUrl}
          videos={videos}
          onDone={() => setScreen('result')}
        />
      )}

      {screen === 'generating' && !battleData && (
        <div className="amb-waiting">
          <div className="amb-waiting-icon">⚔️</div>
          <div className="amb-waiting-label">Summoning the battle…</div>
          <div className="amb-waiting-sub">GPT is writing the shot script</div>
        </div>
      )}

      {screen === 'result' && battleData && (
        <Result
          battleData={battleData}
          posterUrl={posterUrl}
          videos={videos}
          onAgain={handleAgain}
          onBack={() => setScreen('landing')}
        />
      )}

      {error && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(196,30,50,0.15)', border: '1px solid rgba(196,30,50,0.4)',
          color: '#c41e32', padding: '12px 24px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          letterSpacing: '0.18em', zIndex: 10,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
