import React, { useState, useEffect, useRef } from 'react';
import '../styles/anime-battles.css';

const API_KEY = () => import.meta.env.VITE_SEGMIND_API_KEY;
const GPT_URL = 'https://api.segmind.com/v1/gpt-4';
const VID_URL = 'https://api.segmind.com/v1/seedance-2.0';

/* ── GPT: generate battle + 3×10s shot scripts ── */
async function generateBattle() {
  const prompt = `You are a cinematic director. Create shot scripts for a 30-second anime battle video (3 independent 10-second segments) fusing Hindu mythology with Studio Ghibli / theatrical anime quality.

Randomly pick ONE battle:
1. Arjuna vs Karna — twilight Kurukshetra, divine archers, arrows of light
2. Rama vs Ravana — Lanka on fire, ten-headed king vs the blue avatar
3. Hanuman vs Indrajit — aerial combat through smoke and illusion
4. Kali vs Raktabija — fierce elemental battlefield, goddess wrathful and unstoppable
5. Bhima vs Duryodhana — final mace duel at midnight, earth splitting
6. Krishna vs Narakasura — Sudarshana Chakra spinning, demon fortress crumbling
7. Shiva vs Tripurasura — one cosmic arrow destroys three indestructible cities
8. Parashurama vs Karna — forest clearing, master vs student, ancient curse unleashed

Each segment is 10 seconds and rendered independently (timestamps reset 0s–10s per segment).
Each segment: 3 shots. Per shot: shot type, camera movement, subject action, visual effects, color mood.
Style: Studio Ghibli cinematic quality — rich textures, volumetric lighting, painterly depth. Hard cuts, dark saturated palette. NOT cartoon.

Warriors: precise visual description of each fighter (hair, armor, weapon, aura color).

Return ONLY valid JSON, no markdown:
{
  "battle": "Fighter A vs Fighter B",
  "warriors": "Fighter A: [look]. Fighter B: [look].",
  "description": "one epic tagline",
  "segmentA": "Shot 1 | 0s–3s\\n[shot type, camera]. [action]. [fx]. [color].\\n\\nShot 2 | 3s–7s\\n[...]\\n\\nShot 3 | 7s–10s\\n[...]",
  "segmentB": "Shot 4 | 0s–3s\\n[...]\\n\\nShot 5 | 3s–7s\\n[...]\\n\\nShot 6 | 7s–10s\\n[...]",
  "segmentC": "Shot 7 | 0s–3s\\n[...]\\n\\nShot 8 | 3s–7s\\n[...]\\n\\nShot 9 | 7s–10s\\n[...]"
}`;

  const res = await fetch(GPT_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4',
      max_tokens: 1200,
      temperature: 0.95,
      stream: false,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('GPT error:', errText);
    throw new Error(`GPT ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned);
}

/* ── Seedance 2.0: one 10s segment ── */
async function generateSegment(battle, warriors, segmentScript) {
  const prompt = `Generate a 16:9 aspect ratio cinematic anime battle video. Studio Ghibli and theatrical anime film quality — rich hand-painted textures, dramatic volumetric lighting, painterly depth of field. Dark, intense, hyper-detailed. NOT cartoon.

Battle: ${battle}
Warriors: ${warriors}

${segmentScript}`;

  const res = await fetch(VID_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
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
    throw new Error(`Seedance ${res.status}: ${errText}`);
  }

  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), blob };
}

/* ── Stitch 3 segments → single WebM blob ── */
async function stitchVideos(videoUrls, onProgress) {
  const validUrls = videoUrls.filter(u => u && u !== 'error');
  if (!validUrls.length) throw new Error('No valid videos to stitch');

  const canvas = document.createElement('canvas');
  canvas.width = 1280; canvas.height = 720;
  const ctx = canvas.getContext('2d');

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audioDest = audioCtx.createMediaStreamDestination();

  const videoStream = canvas.captureStream(30);
  const combined = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm';

  const recorder = new MediaRecorder(combined, { mimeType, videoBitsPerSecond: 5_000_000 });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.start(100);

  for (let i = 0; i < validUrls.length; i++) {
    await new Promise(resolve => {
      const vid = document.createElement('video');
      vid.src = validUrls[i];
      vid.playsInline = true;
      try { const src = audioCtx.createMediaElementSource(vid); src.connect(audioDest); } catch (_) {}
      let interval;
      vid.oncanplaythrough = () => {
        vid.play().catch(() => {});
        interval = setInterval(() => {
          if (!vid.paused && !vid.ended) ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
          if (vid.duration) {
            onProgress?.(Math.round(((i + vid.currentTime / vid.duration) / validUrls.length) * 100));
          }
        }, 33);
      };
      const done = () => { clearInterval(interval); resolve(); };
      vid.onended = done; vid.onerror = done; vid.load();
    });
  }

  recorder.stop();
  await new Promise(r => { recorder.onstop = r; });
  await audioCtx.close();
  return new Blob(chunks, { type: 'video/webm' });
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

/* ── Generating screen ── */
function Generating({ battleData, videos, onDone }) {
  const labels = ['Battle Reel I  (0–10s)', 'Battle Reel II  (10–20s)', 'Battle Reel III  (20–30s)'];
  const allDone = videos.every(v => v !== null);
  useEffect(() => { if (allDone) onDone(); }, [allDone, onDone]);

  return (
    <div className="amb-generating">
      <div className="amb-gen-left">
        <div className="amb-gen-battle-name">{battleData.battle}</div>
        <div className="amb-gen-tagline">{battleData.description}</div>

        <div className="amb-progress-list" style={{ marginTop: 20 }}>
          {labels.map((label, i) => (
            <div key={i} className="amb-progress-item">
              <div className="amb-progress-label">
                <div className={'amb-progress-dot' + (videos[i] ? ' amb-done' : ' amb-running')} />
                <span className="amb-progress-label-text">{label}</span>
              </div>
              <div className="amb-progress-bar-wrap">
                <div className="amb-progress-bar-fill" style={{ width: videos[i] ? '100%' : '55%' }} />
              </div>
            </div>
          ))}
        </div>

        <ElapsedTimer running={true} />

        <div className="amb-gen-warriors">
          <div className="amb-gen-warriors-label">Warriors</div>
          <div className="amb-gen-warriors-text">{battleData.warriors}</div>
        </div>
      </div>

      <div className="amb-gen-right">
        {['segmentA','segmentB','segmentC'].map((seg, i) => (
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
function Result({ battleData, videos, onAgain, onBack }) {
  const [stitching, setStitching]   = useState(false);
  const [stitchPct, setStitchPct]   = useState(0);
  const [stitchDone, setStitchDone] = useState(false);

  const hasVideos = videos.some(v => v && v !== 'error');

  const handleDownload = async () => {
    if (stitching) return;
    setStitching(true); setStitchDone(false); setStitchPct(0);
    try {
      const blob = await stitchVideos(videos.map(v => v?.url), pct => setStitchPct(pct));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(battleData.battle || 'battle').replace(/\s+/g, '-').toLowerCase()}-30s.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setStitchDone(true);
    } catch (e) { console.error('Stitch failed:', e); }
    finally { setStitching(false); }
  };

  return (
    <div className="amb-result">
      <header className="amb-result-topbar">
        <button className="amb-back-btn" style={{ position: 'static' }} onClick={onBack}>◂ Back</button>
        <div className="amb-result-title-block">
          <div className="amb-battle-name-big">{battleData.battle}</div>
          <div className="amb-battle-tag">{battleData.description}</div>
        </div>
        <div className="amb-result-actions">
          <button className="amb-again-btn" onClick={onAgain}>⚔ New Battle</button>
          {hasVideos && (
            <button
              className={'amb-download-btn' + (stitching ? ' amb-dl-active' : '')}
              onClick={handleDownload}
              disabled={stitching}
            >
              {stitching ? (
                <><div className="amb-dl-bar" style={{ width: `${stitchPct}%` }} /><span className="amb-dl-label">Stitching… {stitchPct}%</span></>
              ) : stitchDone ? (
                <span className="amb-dl-label">✓ Downloaded</span>
              ) : (
                <span className="amb-dl-label">⬇ Download Full Battle</span>
              )}
            </button>
          )}
        </div>
      </header>

      <div className="amb-videos-grid">
        {videos.map((v, i) => (
          <div key={i} className="amb-video-item">
            <div className="amb-video-seg-label">
              Reel {['I','II','III'][i]} &nbsp;·&nbsp; {['0–10s','10–20s','20–30s'][i]}
            </div>
            {v?.url ? (
              <video src={v.url} controls autoPlay={i === 0} loop={false} playsInline />
            ) : v === 'error' ? (
              <div className="amb-video-pending"><span>Failed</span></div>
            ) : (
              <div className="amb-video-pending">
                <div className="amb-video-spinner" /><span>Rendering…</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Root ── */
export default function AnimeMythologyBattles({ onStop }) {
  const [screen, setScreen]         = useState('idle');
  const [battleData, setBattleData] = useState(null);
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
    setBattleData(null);
    setVideos([null, null, null]);
    setScreen('generating');

    try {
      const data = await generateBattle();
      setBattleData(data);

      const videoPromises = ['segmentA', 'segmentB', 'segmentC'].map((seg, i) =>
        generateSegment(data.battle, data.warriors, data[seg])
          .then(result => setVideos(prev => { const n = [...prev]; n[i] = result; return n; }))
          .catch(err => {
            console.error(`Segment ${i + 1} failed:`, err);
            setVideos(prev => { const n = [...prev]; n[i] = 'error'; return n; });
          })
      );

      await Promise.allSettled(videoPromises);
      setScreen('result');
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
      setScreen('error');
    }
  };

  const handleAgain = () => startGeneration();

  return (
    <div className="amb-root">
      <div className="amb-bg" />
      <div className="amb-noise" />

      {screen === 'idle' && (
        <div className="amb-waiting">
          <button className="amb-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="amb-waiting-icon">⚔️</div>
          <div className="amb-waiting-label">Anime Mythology Wars</div>
          <button className="amb-generate-btn" style={{ marginTop: 32 }} onClick={startGeneration}>
            Summon the Battle
          </button>
        </div>
      )}

      {screen === 'generating' && battleData && (
        <Generating
          battleData={battleData}
          videos={videos}
          onDone={() => setScreen('result')}
        />
      )}

      {screen === 'generating' && !battleData && (
        <div className="amb-waiting">
          <button className="amb-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="amb-waiting-icon">⚔️</div>
          <div className="amb-waiting-label">Summoning the battle…</div>
          <div className="amb-waiting-sub">GPT is writing the shot script</div>
        </div>
      )}

      {screen === 'result' && battleData && (
        <Result
          battleData={battleData}
          videos={videos}
          onAgain={handleAgain}
          onBack={onStop}
        />
      )}

      {screen === 'error' && (
        <div className="amb-waiting">
          <button className="amb-back-btn" onClick={onStop}>◂ Exit</button>
          <div className="amb-waiting-icon">💀</div>
          <div className="amb-waiting-label">Battle failed</div>
          <div className="amb-waiting-sub">{error}</div>
          <button className="amb-generate-btn" style={{ marginTop: 32 }} onClick={handleAgain}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
