import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as Tone from 'tone';
import '../styles/singer-studio.css';

const API_KEY = () => import.meta.env.VITE_SEGMIND_API_KEY;
const GPT_URL = 'https://api.segmind.com/v1/gpt-4o';

/* ── Chord → notes ── */
const CHORD_NOTES = {
  'C':    ['C3','E3','G3','C4'],      'Cm':   ['C3','Eb3','G3','C4'],
  'C#':   ['C#3','F3','G#3','C#4'],  'Db':   ['Db3','F3','Ab3','Db4'],
  'D':    ['D3','F#3','A3','D4'],     'Dm':   ['D3','F3','A3','D4'],
  'D#':   ['D#3','G3','A#3','D4'],   'Eb':   ['Eb3','G3','Bb3','Eb4'],
  'E':    ['E2','B2','E3','G#3','B3'],'Em':   ['E2','B2','E3','G3','B3'],
  'F':    ['F2','C3','F3','A3'],      'Fm':   ['F2','C3','F3','Ab3'],
  'F#':   ['F#2','C#3','F#3','A#3'], 'Gb':   ['Gb2','Db3','Gb3','Bb3'],
  'G':    ['G2','B2','D3','G3'],      'Gm':   ['G2','Bb2','D3','G3'],
  'G#':   ['G#2','C3','D#3','G#3'],  'Ab':   ['Ab2','C3','Eb3','Ab3'],
  'A':    ['A2','E3','A3','C#4'],     'Am':   ['A2','E3','A3','C4'],
  'A#':   ['A#2','F3','A#3','D4'],   'Bb':   ['Bb2','F3','Bb3','D4'],
  'B':    ['B2','F#3','B3','D#4'],    'Bm':   ['B2','F#3','B3','D4'],
  'G7':   ['G2','B2','D3','F3'],      'C7':   ['C3','E3','G3','Bb3'],
  'D7':   ['D3','F#3','A3','C4'],     'A7':   ['A2','E3','G3','C#4'],
  'E7':   ['E2','B2','D3','G#3'],     'B7':   ['B2','D#3','F#3','A3'],
  'F7':   ['F2','A2','C3','Eb3'],
  'Am7':  ['A2','E3','G3','C4'],      'Em7':  ['E2','B2','D3','G3'],
  'Dm7':  ['D3','F3','A3','C4'],      'Bm7':  ['B2','D3','F#3','A3'],
  'Cmaj7':['C3','E3','G3','B3'],      'Gmaj7':['G2','B2','D3','F#3'],
  'Fmaj7':['F2','A2','C3','E3'],      'Amaj7':['A2','C#3','E3','G#3'],
  'Dsus2':['D3','E3','A3','D4'],      'Dsus4':['D3','G3','A3','D4'],
  'Asus2':['A2','B2','E3','A3'],      'Asus4':['A2','D3','E3','A3'],
  'Gsus4':['G2','C3','D3','G3'],      'Cadd9':['C3','E3','G3','D4'],
  'Gadd9':['G2','B2','D3','A3'],
};

function normalizeChord(chord) {
  if (!chord) return null;
  const c = chord.trim();
  if (CHORD_NOTES[c]) return c;
  const withoutBass = c.split('/')[0].trim();
  if (CHORD_NOTES[withoutBass]) return withoutBass;
  const root = withoutBass.match(/^[A-G][#b]?/)?.[0];
  return root && CHORD_NOTES[root] ? root : null;
}

/* ── Data helpers ── */
function buildFlatLines(songData) {
  const lines = [];
  (songData.sections || []).forEach(sec => {
    (sec.lines || []).forEach(line => {
      lines.push({ ...line, sectionName: sec.name || '' });
    });
  });
  return lines;
}

function buildChordQueue(flatLines) {
  const queue = [];
  flatLines.forEach((line, lineIdx) => {
    (line.chords || []).forEach(c => {
      queue.push({ chord: c.chord, lineIdx, wordIdx: c.wordIndex ?? 0 });
    });
  });
  return queue;
}

/* ── Image helpers ── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function resizeImage(dataUrl, maxDim = 1500) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim) { resolve(dataUrl); return; }
      if (width > height) { height = Math.round((height / width) * maxDim); width = maxDim; }
      else { width = Math.round((width / height) * maxDim); height = maxDim; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}

/* ── Guitar hook ── */
function useGuitar() {
  const ref = useRef(null);

  const init = useCallback(async () => {
    if (ref.current) return;
    await Tone.start();
    const reverb = new Tone.Reverb({ decay: 2.4, wet: 0.3 }).toDestination();
    await reverb.ready;
    const synths = Array.from({ length: 6 }, () =>
      new Tone.PluckSynth({ attackNoise: 0.9, dampening: 3600, resonance: 0.97 }).connect(reverb)
    );
    ref.current = { synths, reverb };
  }, []);

  const strum = useCallback((chordName) => {
    const key = normalizeChord(chordName);
    const notes = key ? CHORD_NOTES[key] : null;
    if (!notes || !ref.current) return;
    const now = Tone.now();
    notes.forEach((note, i) => {
      if (ref.current.synths[i]) ref.current.synths[i].triggerAttack(note, now + i * 0.028);
    });
  }, []);

  const dispose = useCallback(() => {
    if (!ref.current) return;
    ref.current.synths.forEach(s => s.dispose());
    ref.current.reverb.dispose();
    ref.current = null;
  }, []);

  return { init, strum, dispose };
}

/* ── GPT Vision parse ── */
async function parseSongSheet(imageBase64) {
  const prompt = `You are a music sheet parser. The image shows song lyrics with guitar chord notation above the words.

Extract:
1. The song title (or "Unknown Song" if not visible)
2. All sections (Verse 1, Chorus, Bridge, Outro, etc.)
3. For each section, every line of lyrics with the chord changes

Return ONLY valid JSON in exactly this format — no markdown, no explanation:
{
  "title": "Song Title",
  "sections": [
    {
      "name": "Verse 1",
      "lines": [
        {
          "lyrics": "full line of lyrics",
          "chords": [
            { "chord": "Am", "wordIndex": 0 },
            { "chord": "F", "wordIndex": 3 }
          ]
        }
      ]
    }
  ]
}

Rules:
- wordIndex = 0-based index of the word where the chord appears
- If a chord appears before any word, use wordIndex 0
- Include chord symbols exactly as written (Am, G#m, Fmaj7, Dsus4, etc.)`;

  const res = await fetch(GPT_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageBase64 } }
        ]
      }]
    })
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned);
}

/* ── Lyric line ── */
function LyricLine({ line, role, playingWordIdx }) {
  const words = (line.lyrics || '').split(' ').filter(Boolean);
  const chordAtWord = {};
  (line.chords || []).forEach(c => { chordAtWord[c.wordIndex] = c.chord; });
  const isActive = role === 'active';
  const showChords = role === 'active' || role === 'next';

  return (
    <div className={'ss-line-group ss-line-' + role}>
      {isActive && line.sectionName && (
        <div className="ss-section-label">{line.sectionName}</div>
      )}
      <div className="ss-line-words">
        {words.map((word, i) => (
          <span key={i} className="ss-word-group">
            {showChords && (
              <span className={
                'ss-chord-tag' +
                (isActive && playingWordIdx === i && chordAtWord[i] ? ' ss-chord-playing' : '') +
                (!chordAtWord[i] ? ' ss-chord-empty' : '')
              }>
                {chordAtWord[i] || ' '}
              </span>
            )}
            <span className="ss-word-text">{word} </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Studio screen ── */
function StudioScreen({ songData, onBack }) {
  const flatLines  = useMemo(() => buildFlatLines(songData), [songData]);
  const chordQueue = useMemo(() => buildChordQueue(flatLines), [flatLines]);

  const [currentChord, setCurrentChord]   = useState(null);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [playingWordIdx, setPlayingWordIdx] = useState(null);
  const [pos, setPos]       = useState(0);
  const [done, setDone]     = useState(false);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm]       = useState(90);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [mode, setMode]     = useState('tap');

  const posRef      = useRef(0);
  const advanceRef  = useRef(null);
  const { init, strum, dispose } = useGuitar();

  const advance = useCallback(async () => {
    await init();
    const idx = posRef.current;
    if (idx >= chordQueue.length) { setDone(true); setPlaying(false); return; }
    const entry = chordQueue[idx];
    strum(entry.chord);
    setCurrentChord(entry.chord);
    setCurrentLineIdx(entry.lineIdx);
    setPlayingWordIdx(entry.wordIdx);
    setTimeout(() => setPlayingWordIdx(null), 680);
    posRef.current = idx + 1;
    setPos(idx + 1);
  }, [chordQueue, init, strum]);

  // keep advanceRef current so auto interval always calls latest version
  advanceRef.current = advance;

  // Spacebar tap
  useEffect(() => {
    if (mode !== 'tap') return;
    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); advanceRef.current(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode]);

  // Auto playback
  useEffect(() => {
    if (!playing || mode !== 'auto') return;
    const ms = (60 / bpm) * beatsPerChord * 1000;
    const id = setInterval(() => advanceRef.current(), ms);
    return () => clearInterval(id);
  }, [playing, mode, bpm, beatsPerChord]);

  useEffect(() => () => dispose(), [dispose]);

  const reset = () => {
    posRef.current = 0;
    setPos(0); setCurrentChord(null);
    setCurrentLineIdx(0); setDone(false); setPlaying(false);
  };

  const nextChord = chordQueue[pos]?.chord ?? null;
  const progress  = chordQueue.length > 0 ? (pos / chordQueue.length) * 100 : 0;

  const visibleLines = useMemo(() => {
    const result = [];
    const rows = [currentLineIdx - 1, currentLineIdx, currentLineIdx + 1, currentLineIdx + 2];
    const roles = ['prev', 'active', 'next', 'far'];
    rows.forEach((li, ri) => {
      if (li >= 0 && li < flatLines.length) result.push({ line: flatLines[li], lineIdx: li, role: roles[ri] });
    });
    return result;
  }, [currentLineIdx, flatLines]);

  if (chordQueue.length === 0) {
    return (
      <div className="ss-studio">
        <header className="ss-topbar">
          <button className="ss-back-btn" onClick={onBack}>◂ Back</button>
          <div className="ss-song-title">{songData.title || 'Song Sheet'}</div>
          <div />
        </header>
        <div className="ss-lyrics-area">
          <div className="ss-no-chords">
            No chords were found in this sheet.<br />
            Make sure the image clearly shows chord symbols (like Am, G, C) above the lyrics.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-studio">
      <header className="ss-topbar">
        <button className="ss-back-btn" onClick={onBack}>◂ New Sheet</button>
        <div className="ss-song-title">{songData.title || 'Song Sheet'}</div>
        <div className="ss-topbar-controls">
          <div className="ss-mode-toggle">
            <button className={'ss-mode-btn' + (mode === 'tap' ? ' ss-active' : '')} onClick={() => { setMode('tap'); setPlaying(false); }}>Tap</button>
            <button className={'ss-mode-btn' + (mode === 'auto' ? ' ss-active' : '')} onClick={() => setMode('auto')}>Auto</button>
          </div>
        </div>
      </header>

      <div className="ss-lyrics-area">
        {done ? (
          <div className="ss-done">
            <div className="ss-done-icon">♪</div>
            <div className="ss-done-text">Song complete</div>
            <button className="ss-btn" style={{ marginTop: 8 }} onClick={reset}>Start Over</button>
          </div>
        ) : (
          visibleLines.map(({ line, lineIdx, role }) => (
            <LyricLine
              key={lineIdx}
              line={line}
              role={role}
              playingWordIdx={role === 'active' ? playingWordIdx : null}
            />
          ))
        )}
      </div>

      <div className="ss-transport">
        {/* Current chord */}
        <div className="ss-chord-display">
          <div className="ss-chord-name">{currentChord || '—'}</div>
          <div className="ss-chord-label">Now</div>
        </div>

        <div className="ss-divider" />

        {/* Next chord */}
        <div className="ss-chord-next">
          <div className="ss-chord-next-name">{nextChord || '—'}</div>
          <div className="ss-chord-next-label">Next</div>
        </div>

        <div className="ss-divider" />

        {/* Controls */}
        <div className="ss-controls">
          {mode === 'tap' ? (
            <button className="ss-btn ss-btn-tap" onClick={() => advanceRef.current()} disabled={done}>
              ♪ Tap
              <span style={{ fontSize: 8, opacity: 0.55, display: 'block', letterSpacing: '0.18em', marginTop: 2 }}>or Spacebar</span>
            </button>
          ) : (
            <button className="ss-btn ss-btn-play" onClick={() => setPlaying(p => !p)} disabled={done}>
              {playing ? '⏸' : '▶'}
            </button>
          )}
        </div>

        {mode === 'auto' && (
          <>
            <div className="ss-divider" />
            <div className="ss-bpm-wrap">
              <div className="ss-bpm-val">{bpm}</div>
              <div className="ss-bpm-label">BPM</div>
              <div className="ss-bpm-btns">
                <button className="ss-bpm-btn" onClick={() => setBpm(b => Math.max(40, b - 5))}>−</button>
                <button className="ss-bpm-btn" onClick={() => setBpm(b => Math.min(220, b + 5))}>+</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
              <div className="ss-chord-label">Beats / Chord</div>
              <div className="ss-beat-btns">
                {[2, 4, 8].map(n => (
                  <button
                    key={n}
                    className={'ss-bpm-btn' + (beatsPerChord === n ? ' ss-active' : '')}
                    style={{ width: 28 }}
                    onClick={() => setBeatsPerChord(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="ss-divider" />

        {/* Progress */}
        <div className="ss-progress-wrap">
          <div className="ss-progress-bar">
            <div className="ss-progress-fill" style={{ width: progress + '%' }} />
          </div>
          <div className="ss-progress-label">{pos} / {chordQueue.length} chords</div>
        </div>
      </div>
    </div>
  );
}

/* ── Upload screen ── */
function UploadScreen({ onParsed, onBack }) {
  const [dragOver, setDragOver]   = useState(false);
  const [parsing, setParsing]     = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError]         = useState(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file — JPG, PNG, or WEBP.'); return; }
    setError(null);
    setParsing(true);
    try {
      const raw     = await fileToBase64(file);
      const resized = await resizeImage(raw);
      setPreviewUrl(resized);
      const songData = await parseSongSheet(resized);
      if (!songData?.sections?.length) throw new Error('empty');
      onParsed(songData);
    } catch {
      setError('Could not read the song sheet. Make sure the image clearly shows lyrics and chord symbols (like Am, G, C) above the words.');
      setParsing(false);
      setPreviewUrl(null);
    }
  };

  if (parsing) {
    return (
      <div className="ss-parsing-screen" style={{ position: 'relative', zIndex: 1 }}>
        <div className="ss-parse-note">♪</div>
        <div className="ss-parse-label">Reading your song sheet…</div>
        <div className="ss-parse-sub">The AI is learning the chords</div>
        {previewUrl && (
          <img
            src={previewUrl}
            alt="sheet"
            style={{
              maxWidth: 260, maxHeight: 180, objectFit: 'contain',
              opacity: 0.35, marginTop: 20,
              border: '1px solid rgba(232,193,75,0.18)',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="ss-upload-screen">
      <button
        className="ss-back-btn"
        style={{ position: 'absolute', top: 22, left: 28 }}
        onClick={onBack}
      >
        ◂ Exit
      </button>

      <div className="ss-upload-title">Song Sheet</div>
      <div className="ss-upload-sub">
        Upload a photo of your song sheet with lyrics and guitar chords.<br />
        The guitar plays. Your wife sings.
      </div>

      <div
        className={'ss-dropzone' + (dragOver ? ' ss-drag-over' : '')}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById('ss-file-input').click()}
      >
        <input
          id="ss-file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="ss-upload-icon">🎼</div>
        <div className="ss-upload-cta">Drop your song sheet here</div>
        <div className="ss-upload-hint">or click to browse · JPG · PNG · WEBP</div>
      </div>

      {error && (
        <div style={{
          color: '#d6391b', fontFamily: 'Manrope, sans-serif',
          fontSize: 13, marginTop: 4, textAlign: 'center', maxWidth: 440, lineHeight: 1.6,
        }}>
          {error}
        </div>
      )}

      <div className="ss-upload-hint" style={{ marginTop: 20 }}>
        ♪ Guitar plays the chords &nbsp;·&nbsp; Lyrics shown karaoke-style &nbsp;·&nbsp; Tap to advance
      </div>
    </div>
  );
}

/* ── Root ── */
export default function SingerStudio({ onStop }) {
  const [songData, setSongData] = useState(null);

  useEffect(() => {
    if (document.getElementById('ss-fonts')) return;
    const link = document.createElement('link');
    link.id = 'ss-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Cormorant+SC:wght@400;500&family=Manrope:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => { const el = document.getElementById('ss-fonts'); if (el) el.remove(); };
  }, []);

  return (
    <div className="ss-root">
      <div className="ss-bg" />
      {!songData
        ? <UploadScreen onParsed={setSongData} onBack={onStop} />
        : <StudioScreen songData={songData} onBack={() => setSongData(null)} />
      }
    </div>
  );
}
