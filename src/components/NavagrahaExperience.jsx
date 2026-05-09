import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { PLANETS, HOUSES, MANTRAS, READINGS, VERDICTS } from '../data/navagrahaData';
import '../styles/navagraha.css';

const API_KEY = () => import.meta.env.VITE_SEGMIND_API_KEY;
const GPT_URL  = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/nano-banana';

/* ── helpers ── */
// 12 signs in South Indian clockwise order starting from Aries (index 0)
const SIGNS = [
  { id:'aries',       name:'Aries',       sa:'मेष',  glyph:'♈' },
  { id:'taurus',      name:'Taurus',      sa:'वृष',  glyph:'♉' },
  { id:'gemini',      name:'Gemini',      sa:'मिथुन',glyph:'♊' },
  { id:'cancer',      name:'Cancer',      sa:'कर्क', glyph:'♋' },
  { id:'leo',         name:'Leo',         sa:'सिंह', glyph:'♌' },
  { id:'virgo',       name:'Virgo',       sa:'कन्या',glyph:'♍' },
  { id:'libra',       name:'Libra',       sa:'तुला', glyph:'♎' },
  { id:'scorpio',     name:'Scorpio',     sa:'वृश्चिक',glyph:'♏' },
  { id:'sagittarius', name:'Sagittarius', sa:'धनु',  glyph:'♐' },
  { id:'capricorn',   name:'Capricorn',   sa:'मकर',  glyph:'♑' },
  { id:'aquarius',    name:'Aquarius',    sa:'कुम्भ',glyph:'♒' },
  { id:'pisces',      name:'Pisces',      sa:'मीन',  glyph:'♓' },
];
// Given a lagna index (0=Aries..11=Pisces), compute house number for a sign at signIdx
function signToHouse(signIdx, lagnaIdx) {
  return ((signIdx - lagnaIdx + 12) % 12) + 1;
}

function pVars(p) {
  return { '--planet-color': p.color, '--planet-glow': p.glow };
}

/* ── Cosmos backdrop ── */
function Cosmos() {
  return (
    <>
      <div className="ngr-cosmos" />
      <div className="ngr-twinkle">
        <b /><b /><b /><b /><b />
      </div>
    </>
  );
}

/* ── TypeOn ── */
function TypeOn({ text, active, className }) {
  const [shown, setShown] = useState(active ? '' : text);
  useEffect(() => {
    if (!active) { setShown(text); return; }
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text, active]);
  return <div className={className}>{shown}</div>;
}

/* ── Chart ── */
function Chart({ placed, hoverHouse, pulseHouse, onDragOver, onDragLeave, onDrop, onRemove, small, lagnaIdx = 0 }) {
  const byPos = {};
  HOUSES.forEach(h => { byPos[`${h.row}-${h.col}`] = h; });

  const cells = [];
  for (let r = 1; r <= 4; r++) {
    for (let c = 1; c <= 4; c++) {
      const isCenter = (r === 2 || r === 3) && (c === 2 || c === 3);
      if (isCenter) {
        if (r === 2 && c === 2) {
          cells.push(
            <div key="lagna" className="ngr-house ngr-lagna" style={{ gridRow: '2 / span 2', gridColumn: '2 / span 2' }}>
              <div className="ngr-lagna-plate">
                <div className="ngr-lagna-label">लग्न</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: small ? 20 : 26, color: 'var(--saffron)', lineHeight: 1, marginTop: 4 }}>{SIGNS[lagnaIdx].glyph}</div>
                <div className="ngr-lagna-en" style={{ fontSize: small ? 10 : 15 }}>{SIGNS[lagnaIdx].name.toUpperCase()}</div>
                {!small && <div className="ngr-glyph-cluster">☉ ☽ ♂ ☿ ♃ ♀ ♄ ☊ ☋</div>}
              </div>
            </div>
          );
        }
        continue;
      }
      const h = byPos[`${r}-${c}`];
      if (!h) continue;
      const displayNum = signToHouse(h.num - 1, lagnaIdx);
      const occupants = PLANETS.filter(p => placed[p.id] === displayNum);
      const cls = 'ngr-house'
        + (hoverHouse === displayNum ? ' ngr-drop-target' : '')
        + (pulseHouse === displayNum ? ' ngr-pulse' : '');
      // House themes renumber with lagna
      const HOUSE_THEMES = ['Self','Wealth','Siblings','Home','Creation','Service','Spouse','Mystery','Dharma','Career','Gains','Liberation'];
      const displayTheme = HOUSE_THEMES[displayNum - 1];
      cells.push(
        <div
          key={`h-${h.num}`}
          className={cls}
          style={{ gridRow: r, gridColumn: c }}
          onDragOver={onDragOver(displayNum)}
          onDragLeave={onDragLeave}
          onDrop={onDrop(displayNum)}
        >
          <div className="ngr-house-meta">
            <span className="ngr-house-num">{String(displayNum).padStart(2, '0')}</span>
            <span className="ngr-house-sign">{h.sign}</span>
          </div>
          {!small && <div className="ngr-house-theme">{displayTheme}</div>}
          <div className="ngr-occupants">
            {displayNum === 1 && lagnaIdx !== undefined && (
              <div style={{ width: 28, height: 28, borderRadius: 4, background: 'rgba(111,217,212,0.18)', border: '1px solid rgba(111,217,212,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, color: '#6fd9d4', letterSpacing: '0.1em', flexShrink: 0 }}>
                ASC
              </div>
            )}
            {occupants.map(p => (
              <div key={p.id} className="ngr-placed-planet" style={pVars(p)} title={`${p.en} · ${p.sa}`}>
                {p.glyph}
                <button className="ngr-remove" onClick={e => { e.stopPropagation(); onRemove(p.id); }}>×</button>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="ngr-chart">
      {cells}
      <svg className="ngr-chart-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0"   y1="0"   x2="25"  y2="25" />
        <line x1="100" y1="0"   x2="75"  y2="25" />
        <line x1="0"   y1="100" x2="25"  y2="75" />
        <line x1="100" y1="100" x2="75"  y2="75" />
      </svg>
    </div>
  );
}

/* ── Oracle readings log ── */
function OraclePanel({ readingsLog, mantraIdx, placedCount, totalCount, onReveal, revealLabel }) {
  return (
    <aside className="ngr-oracle">
      <div className="ngr-oracle-head">
        <div className="ngr-label">Oracle</div>
        <h3>The Reading</h3>
        <div className="ngr-deva-sub">वाणी — voice of the chart</div>
      </div>
      <div className="ngr-oracle-body">
        {readingsLog.length === 0 ? (
          <div className="ngr-oracle-idle">
            <div className="ngr-glyph-spinner">ॐ</div>
            <div className="ngr-mantra" key={mantraIdx}>{MANTRAS[mantraIdx]}</div>
            <div className="ngr-kicker" style={{ opacity: 0.5, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' }}>Drag · Drop · Read</div>
          </div>
        ) : (
          readingsLog.map(entry => (
            <div key={entry.id} className={'ngr-entry' + (entry.typing ? ' ngr-typing' : '')} style={pVars(entry.planet)}>
              {entry.personLabel && <div className="ngr-person-label">{entry.personLabel}</div>}
              <div className="ngr-entry-head">
                <div className="ngr-entry-glyph">{entry.planet.glyph}</div>
                <div className="ngr-entry-title">
                  <span className="ngr-entry-en">{entry.planet.en}</span>
                  <span className="ngr-entry-sa">{entry.planet.sa} · {entry.planet.trans}</span>
                </div>
                <div className="ngr-entry-badge">{entry.intro ? 'Myth' : 'Placed'}</div>
              </div>
              {entry.placement && <div className="ngr-entry-placement">{entry.placement}</div>}
              <TypeOn className="ngr-entry-reading" text={entry.reading} active={entry.typing} />
            </div>
          ))
        )}
      </div>
      <div className="ngr-oracle-foot">
        <button
          className="ngr-reveal-btn"
          disabled={placedCount === 0}
          onClick={onReveal}
        >
          {revealLabel}
          <span className="ngr-deva-sub">भविष्यम् दर्शय</span>
          <span className="ngr-progress" style={{ width: `${Math.min(100, (placedCount / totalCount) * 100)}%` }} />
        </button>
        <div className="ngr-placed-count">{placedCount}/{totalCount} placed · richer chart, deeper reading</div>
      </div>
    </aside>
  );
}

/* ── Birth Details Modal ── */
const FIELD_STYLE = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(13,10,40,0.7)',
  border: '1px solid rgba(232,161,59,0.35)',
  color: '#f3ece1', fontFamily: 'Manrope, sans-serif', fontSize: 14,
  outline: 'none', marginTop: 6, boxSizing: 'border-box',
};
const LABEL_STYLE = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.28em',
  textTransform: 'uppercase', color: 'rgba(243,236,225,0.55)', display: 'block', marginTop: 18,
};

function PersonFields({ label, dob, tob, pob, onDob, onTob, onPob }) {
  return (
    <div>
      {label && <div style={{ fontFamily: 'Cormorant SC, serif', fontSize: 17, color: '#6fd9d4', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>}
      <label style={LABEL_STYLE}>Date of Birth</label>
      <input type="date" style={FIELD_STYLE} value={dob} onChange={e => onDob(e.target.value)} />
      <label style={LABEL_STYLE}>Time of Birth</label>
      <input type="time" style={FIELD_STYLE} value={tob} onChange={e => onTob(e.target.value)} />
      <label style={LABEL_STYLE}>Place of Birth</label>
      <input type="text" placeholder="e.g. Mumbai, India" style={FIELD_STYLE} value={pob} onChange={e => onPob(e.target.value)} />
    </div>
  );
}

function BirthModal({ isMatch, onConfirm, onClose }) {
  const [dob1, setDob1] = useState('');
  const [tob1, setTob1] = useState('');
  const [pob1, setPob1] = useState('');
  const [dob2, setDob2] = useState('');
  const [tob2, setTob2] = useState('');
  const [pob2, setPob2] = useState('');

  const canConfirm = pob1.trim().length > 0 && (!isMatch || pob2.trim().length > 0);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(
      { dob: dob1, tob: tob1, pob: pob1 },
      isMatch ? { dob: dob2, tob: tob2, pob: pob2 } : null
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(7,5,26,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: 'min(520px,95%)', maxHeight: '90vh', overflowY: 'auto',
        background: 'linear-gradient(180deg,rgba(19,16,56,0.98),rgba(7,5,26,0.99))',
        border: '1px solid rgba(232,161,59,0.4)',
        padding: '40px 36px 32px', position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: 'rgba(243,236,225,0.55)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>

        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#e25e44', marginBottom: 8 }}>Before the stars speak</div>
        <h3 style={{ fontFamily: 'Cormorant SC, serif', fontSize: 26, fontWeight: 500, margin: '0 0 4px', color: '#f3ece1', letterSpacing: '0.06em' }}>Birth Details</h3>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 14, color: 'rgba(243,236,225,0.55)', margin: '0 0 24px', lineHeight: 1.6 }}>
          The cosmos reads you more precisely when it knows where and when you arrived.
        </p>

        <div style={{ borderTop: '1px solid rgba(232,161,59,0.15)', paddingTop: 20 }}>
          <PersonFields
            label={isMatch ? 'Person 1' : null}
            dob={dob1} tob={tob1} pob={pob1}
            onDob={setDob1} onTob={setTob1} onPob={setPob1}
          />
          {isMatch && (
            <div style={{ marginTop: 28, borderTop: '1px solid rgba(232,161,59,0.12)', paddingTop: 20 }}>
              <PersonFields
                label="Person 2"
                dob={dob2} tob={tob2} pob={pob2}
                onDob={setDob2} onTob={setTob2} onPob={setPob2}
              />
            </div>
          )}
        </div>

        <button
          disabled={!canConfirm}
          onClick={handleConfirm}
          style={{
            marginTop: 32, width: '100%', padding: '16px 20px', background: 'transparent',
            border: '1px solid ' + (canConfirm ? '#e8a13b' : 'rgba(232,161,59,0.25)'),
            color: canConfirm ? '#e8a13b' : 'rgba(243,236,225,0.4)',
            fontFamily: 'Cormorant SC, serif', fontSize: 17, letterSpacing: '0.32em',
            textTransform: 'uppercase', cursor: canConfirm ? 'pointer' : 'not-allowed',
            transition: 'all 0.4s ease',
          }}
        >
          Read My Fate
          <div style={{ fontFamily: 'Noto Serif Devanagari, serif', fontSize: 11, letterSpacing: '0.2em', color: '#e25e44', marginTop: 4, textTransform: 'none' }}>भविष्यम् दर्शय</div>
        </button>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(243,236,225,0.4)', textAlign: 'center', marginTop: 12 }}>
          Place of birth is required · time and date refine the reading
        </div>
      </div>
    </div>
  );
}


/* ── Wellbeing sandbox ── */
function WellbeingSandbox({ onBack, onReveal }) {
  const [placed, setPlaced] = useState({});
  const [hoverHouse, setHoverHouse] = useState(null);
  const [pulseHouse, setPulseHouse] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [readingsLog, setReadingsLog] = useState([]);
  const [mantraIdx, setMantraIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lagnaIdx, setLagnaIdx] = useState(0);
  const [ascPlaced, setAscPlaced] = useState(false);

  useEffect(() => {
    if (readingsLog.length > 0) return;
    const t = setInterval(() => setMantraIdx(i => (i + 1) % MANTRAS.length), 4500);
    return () => clearInterval(t);
  }, [readingsLog.length]);

  useEffect(() => {
    if (readingsLog.length === 0) return;
    const top = readingsLog[0];
    if (!top.typing) return;
    const ms = Math.min(60 * top.reading.length, 3500);
    const t = setTimeout(() => {
      setReadingsLog(prev => prev.map((e, i) => i === 0 ? { ...e, typing: false } : e));
    }, ms);
    return () => clearTimeout(t);
  }, [readingsLog]);

  const handleDragStart = (planetId) => (e) => {
    if (placed[planetId]) { e.preventDefault(); return; }
    setDraggingId(planetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', planetId);
  };
  const handleDragEnd = () => { setDraggingId(null); setHoverHouse(null); };

  const handleDrop = (houseNum) => (e) => {
    e.preventDefault();
    const planetId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!planetId) return;
    // ASC placement — sets the Lagna sign
    if (planetId === 'ASC') {
      const newLagnaIdx = (houseNum - 1 + lagnaIdx) % 12;
      setLagnaIdx(newLagnaIdx);
      setAscPlaced(true);
      setPulseHouse(houseNum);
      setTimeout(() => setPulseHouse(null), 1200);
      setHoverHouse(null);
      setDraggingId(null);
      return;
    }
    const planet = PLANETS.find(p => p.id === planetId);
    if (!planet) return;
    setPlaced(prev => ({ ...prev, [planetId]: houseNum }));
    setPulseHouse(houseNum);
    setTimeout(() => setPulseHouse(null), 1200);
    setHoverHouse(null);
    setDraggingId(null);
    const reading = READINGS[planetId][houseNum - 1];
    const signIdx = (houseNum - 1 + lagnaIdx) % 12;
    const placement = planet.en + ' in House ' + houseNum + ' · ' + SIGNS[signIdx].name;
    setReadingsLog(prev => [
      { id: `${planetId}-${Date.now()}`, planet, houseNum, placement, reading, typing: true },
      ...prev,
    ]);
  };

  const handleClickPlanet = (planetId) => {
    if (placed[planetId]) return;
    const p = PLANETS.find(x => x.id === planetId);
    setReadingsLog(prev => [
      { id: `intro-${planetId}-${Date.now()}`, planet: p, intro: true, reading: `${p.myth} Domain: ${p.short}.`, typing: true },
      ...prev,
    ]);
  };

  const removePlanet = (planetId) => {
    setPlaced(prev => { const next = { ...prev }; delete next[planetId]; return next; });
  };

  const placedCount = Object.keys(placed).length;

  return (
    <div className="ngr-sandbox">
      <header className="ngr-topbar">
        <div className="ngr-left">
          <button className="ngr-iconbtn" onClick={onBack}>◂ Threshold</button>
          <span className="ngr-brand">N·A·V·A·G·R·A·H·A<span className="ngr-dot">·</span><span style={{ fontFamily: 'var(--deva)', letterSpacing: '0.1em', color: 'var(--saffron)' }}>नवग्रह</span></span>
        </div>
        <div className="ngr-right">
          <span className="ngr-crumb">Overall Wellbeing</span>
          <span className="ngr-crumb" style={{ color: 'var(--vermilion-soft)' }}>·</span>
          <span className="ngr-crumb">Lagna : {ascPlaced ? SIGNS[lagnaIdx].name : 'Not set'}</span>
        </div>
      </header>

      <aside className="ngr-tray">
        <div className="ngr-tray-header">
          <h3>Navagraha</h3>
          <div className="ngr-sub">नवग्रह — The Nine</div>
          <div className="ngr-hint">Drag a body into a house. Click to read its myth.</div>
        </div>
        <div className="ngr-tray-list">
          {/* ASC Token */}
          <div
            className={'ngr-planet ngr-asc-token' + (ascPlaced ? ' ngr-placed' : '') + (draggingId === 'ASC' ? ' ngr-dragging' : '')}
            draggable={!ascPlaced}
            onDragStart={(e) => { if (ascPlaced) { e.preventDefault(); return; } setDraggingId('ASC'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'ASC'); }}
            onDragEnd={handleDragEnd}
            onClick={() => { if (ascPlaced) { setAscPlaced(false); setLagnaIdx(0); setPlaced({}); setReadingsLog([]); } }}
            style={{ '--planet-color': '#6fd9d4', '--planet-glow': 'rgba(111,217,212,0.6)', borderColor: ascPlaced ? 'rgba(111,217,212,0.2)' : 'rgba(111,217,212,0.5)', cursor: ascPlaced ? 'pointer' : 'grab' }}
            title={ascPlaced ? 'Click to reset Ascendant' : 'Drag to set your Ascendant'}
          >
            <div className="ngr-glyph-orb" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 60% 70%, #6fd9d4 0%, rgba(0,0,0,0.6) 90%)', fontSize: 18, fontFamily: 'var(--mono)', fontWeight: 600 }}>
              ASC
            </div>
            <div className="ngr-names">
              <span className="ngr-name-en">Ascendant</span>
              <span className="ngr-name-sa">लग्न · {ascPlaced ? SIGNS[lagnaIdx].name : 'Not placed'}</span>
            </div>
            <div className="ngr-nature" style={{ color: ascPlaced ? 'rgba(111,217,212,0.8)' : 'var(--bone-faint)' }}>{ascPlaced ? '✓ Set' : 'Place first'}</div>
          </div>
          {PLANETS.map(p => (
            <div
              key={p.id}
              className={'ngr-planet' + (placed[p.id] ? ' ngr-placed' : '') + (draggingId === p.id ? ' ngr-dragging' : '')}
              draggable={!placed[p.id]}
              onDragStart={handleDragStart(p.id)}
              onDragEnd={handleDragEnd}
              onClick={() => handleClickPlanet(p.id)}
              style={pVars(p)}
            >
              <div className="ngr-glyph-orb">{p.glyph}</div>
              <div className="ngr-names">
                <span className="ngr-name-en">{p.en}</span>
                <span className="ngr-name-sa">{p.sa} · {p.trans}</span>
              </div>
              <div className="ngr-nature">{p.nature.split(' · ')[0]}</div>
            </div>
          ))}
        </div>
      </aside>

      <main className="ngr-stage">
        <div className="ngr-chart-wrap">
          <Chart
            placed={placed}
            hoverHouse={hoverHouse}
            pulseHouse={pulseHouse}
            lagnaIdx={lagnaIdx}
            onDragOver={(num) => (e) => { e.preventDefault(); setHoverHouse(num); }}
            onDragLeave={() => setHoverHouse(null)}
            onDrop={handleDrop}
            onRemove={removePlanet}
          />
        </div>
      </main>

      <OraclePanel
        readingsLog={readingsLog}
        mantraIdx={mantraIdx}
        placedCount={placedCount}
        totalCount={9}
        onReveal={() => setShowModal(true)}
        revealLabel="Reveal My Future"
      />
      {showModal && (
        <BirthModal
          isMatch={false}
          onClose={() => setShowModal(false)}
          onConfirm={(b1) => { setShowModal(false); onReveal(placed, null, b1, null, lagnaIdx, null); }}
        />
      )}
    </div>
  );
}

/* ── Matchmaking sandbox ── */
function MatchSandbox({ onBack, onReveal }) {
  const [placed1, setPlaced1] = useState({});
  const [placed2, setPlaced2] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [hover1, setHover1] = useState(null);
  const [hover2, setHover2] = useState(null);
  const [pulse1, setPulse1] = useState(null);
  const [pulse2, setPulse2] = useState(null);
  const [dragging1, setDragging1] = useState(null);
  const [dragging2, setDragging2] = useState(null);
  const [readingsLog, setReadingsLog] = useState([]);
  const [mantraIdx, setMantraIdx] = useState(0);
  const [lagnaIdx1, setLagnaIdx1] = useState(0);
  const [lagnaIdx2, setLagnaIdx2] = useState(0);
  const [ascPlaced1, setAscPlaced1] = useState(false);
  const [ascPlaced2, setAscPlaced2] = useState(false);

  useEffect(() => {
    if (readingsLog.length > 0) return;
    const t = setInterval(() => setMantraIdx(i => (i + 1) % MANTRAS.length), 4500);
    return () => clearInterval(t);
  }, [readingsLog.length]);

  useEffect(() => {
    if (readingsLog.length === 0) return;
    const top = readingsLog[0];
    if (!top.typing) return;
    const ms = Math.min(60 * top.reading.length, 3500);
    const t = setTimeout(() => {
      setReadingsLog(prev => prev.map((e, i) => i === 0 ? { ...e, typing: false } : e));
    }, ms);
    return () => clearTimeout(t);
  }, [readingsLog]);

  const makeDragStart = (setDragging, placed, ascPlaced) => (planetId) => (e) => {
    if (planetId === 'ASC' ? ascPlaced : placed[planetId]) { e.preventDefault(); return; }
    setDragging(planetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', planetId);
  };

  const makeDrop = (setPlaced, setHover, setDragging, draggingId, personLabel, pulseSetter, lagnaIdx, setLagnaIdx, setAscPlaced) => (houseNum) => (e) => {
    e.preventDefault();
    const planetId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!planetId) return;
    if (planetId === 'ASC') {
      const newLagnaIdx = (houseNum - 1 + lagnaIdx) % 12;
      setLagnaIdx(newLagnaIdx);
      setAscPlaced(true);
      pulseSetter(houseNum);
      setTimeout(() => pulseSetter(null), 1200);
      setHover(null);
      setDragging(null);
      return;
    }
    const planet = PLANETS.find(p => p.id === planetId);
    if (!planet) return;
    setPlaced(prev => ({ ...prev, [planetId]: houseNum }));
    pulseSetter(houseNum);
    setTimeout(() => pulseSetter(null), 1200);
    setHover(null);
    setDragging(null);
    const reading = READINGS[planetId][houseNum - 1];
    const signIdx = (houseNum - 1 + lagnaIdx) % 12;
    const placement = planet.en + ' in House ' + houseNum + ' · ' + SIGNS[signIdx].name;
    setReadingsLog(prev => [
      { id: personLabel + '-' + planetId + '-' + Date.now(), planet, houseNum, placement, reading, typing: true, personLabel },
      ...prev,
    ]);
  };

  const placedCount = Object.keys(placed1).length + Object.keys(placed2).length;

  const persons = [
    {
      label: 'Person 1', placed: placed1, setPlaced: setPlaced1,
      hover: hover1, setHover: setHover1, pulse: pulse1, setPulse: setPulse1,
      dragging: dragging1, setDragging: setDragging1,
      lagnaIdx: lagnaIdx1, setLagnaIdx: setLagnaIdx1,
      ascPlaced: ascPlaced1, setAscPlaced: setAscPlaced1,
    },
    {
      label: 'Person 2', placed: placed2, setPlaced: setPlaced2,
      hover: hover2, setHover: setHover2, pulse: pulse2, setPulse: setPulse2,
      dragging: dragging2, setDragging: setDragging2,
      lagnaIdx: lagnaIdx2, setLagnaIdx: setLagnaIdx2,
      ascPlaced: ascPlaced2, setAscPlaced: setAscPlaced2,
    },
  ];

  return (
    <div className="ngr-sandbox ngr-match" style={{ gridTemplateColumns: '1fr 1fr 320px' }}>
      <header className="ngr-topbar">
        <div className="ngr-left">
          <button className="ngr-iconbtn" onClick={onBack}>◂ Threshold</button>
          <span className="ngr-brand">N·A·V·A·G·R·A·H·A<span className="ngr-dot">·</span><span style={{ fontFamily: 'var(--deva)', letterSpacing: '0.1em', color: 'var(--saffron)' }}>नवग्रह</span></span>
        </div>
        <div className="ngr-right">
          <span className="ngr-crumb">Match Making</span>
          <span className="ngr-crumb" style={{ color: 'var(--vermilion-soft)' }}>·</span>
          <span className="ngr-crumb">P1: {ascPlaced1 ? SIGNS[lagnaIdx1].name : 'Lagna not set'}</span>
          <span className="ngr-crumb" style={{ color: 'var(--vermilion-soft)' }}>·</span>
          <span className="ngr-crumb">P2: {ascPlaced2 ? SIGNS[lagnaIdx2].name : 'Lagna not set'}</span>
        </div>
      </header>

      {/* Two chart panels side by side */}
      <div className="ngr-match-panels" style={{ gridColumn: '1 / span 2' }}>
        {persons.map(({ label, placed, setPlaced, hover, setHover, pulse, setPulse, dragging, setDragging, lagnaIdx, setLagnaIdx, ascPlaced, setAscPlaced }) => (
          <div key={label} className="ngr-match-panel">
            <div className="ngr-match-panel-label">{label}</div>
            {/* Mini planet tray */}
            <div className="ngr-match-tray">
              {/* ASC mini token */}
              <div
                className={'ngr-planet-mini ngr-asc-token' + (ascPlaced ? ' ngr-placed' : '') + (dragging === 'ASC' ? ' ngr-dragging' : '')}
                draggable={!ascPlaced}
                onDragStart={makeDragStart(setDragging, placed, ascPlaced)('ASC')}
                onDragEnd={() => { setDragging(null); setHover(null); }}
                onClick={() => { if (ascPlaced) { setAscPlaced(false); setLagnaIdx(0); setPlaced({}); } }}
                style={{ '--planet-color': '#6fd9d4', '--planet-glow': 'rgba(111,217,212,0.6)', borderColor: ascPlaced ? 'rgba(111,217,212,0.2)' : 'rgba(111,217,212,0.5)', cursor: ascPlaced ? 'pointer' : 'grab' }}
                title={ascPlaced ? 'Click to reset Ascendant' : 'Drag to set Ascendant'}
              >
                <div className="ngr-glyph-orb-sm" style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 9 }}>ASC</div>
                <span className="ngr-name-en">{ascPlaced ? SIGNS[lagnaIdx].name : 'Asc'}</span>
              </div>
              {PLANETS.map(p => (
                <div
                  key={p.id}
                  className={'ngr-planet-mini' + (placed[p.id] ? ' ngr-placed' : '') + (dragging === p.id ? ' ngr-dragging' : '')}
                  draggable={!placed[p.id]}
                  onDragStart={makeDragStart(setDragging, placed, ascPlaced)(p.id)}
                  onDragEnd={() => { setDragging(null); setHover(null); }}
                  style={pVars(p)}
                >
                  <div className="ngr-glyph-orb-sm">{p.glyph}</div>
                  <span className="ngr-name-en">{p.en}</span>
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="ngr-match-chart-area">
              <div className="ngr-match-chart-wrap">
                <Chart
                  placed={placed}
                  hoverHouse={hover}
                  pulseHouse={pulse}
                  lagnaIdx={lagnaIdx}
                  small
                  onDragOver={(num) => (e) => { e.preventDefault(); setHover(num); }}
                  onDragLeave={() => setHover(null)}
                  onDrop={makeDrop(setPlaced, setHover, setDragging, dragging, label, setPulse, lagnaIdx, setLagnaIdx, setAscPlaced)}
                  onRemove={(pid) => setPlaced(prev => { const n = { ...prev }; delete n[pid]; return n; })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <OraclePanel
        readingsLog={readingsLog}
        mantraIdx={mantraIdx}
        placedCount={placedCount}
        totalCount={18}
        onReveal={() => setShowModal(true)}
        revealLabel="Check Match"
      />
      {showModal && (
        <BirthModal
          isMatch={true}
          onClose={() => setShowModal(false)}
          onConfirm={(b1, b2) => { setShowModal(false); onReveal(placed1, placed2, b1, b2); }}
        />
      )}
    </div>
  );
}

/* ── Reveal screen ── */
function RevealScreen({ placed1, placed2, mode, onCastAgain, onBack, birth1, birth2 }) {
  const isMatch = mode === 'match';
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState('');
  const [story, setStory] = useState('');

  useEffect(() => { generateReveal(); }, []);

  const generateReveal = async () => {
    setLoading(true);
    try {
      const placements1 = Object.entries(placed1).map(([id, num]) => {
        const p = PLANETS.find(x => x.id === id);
        const h = HOUSES.find(x => x.num === num);
        return p.en + ' in House ' + num + ' (' + h.signName + ', ' + h.theme + ')';
      });
      const placements2 = isMatch
        ? Object.entries(placed2 || {}).map(([id, num]) => {
            const p = PLANETS.find(x => x.id === id);
            const h = HOUSES.find(x => x.num === num);
            return p.en + ' in House ' + num + ' (' + h.signName + ', ' + h.theme + ')';
          })
        : [];

      const systemPrompt = isMatch
        ? 'You are a Vedic astrologer. Two people have placed planets on a chart. For each planet placement give one plain-English sentence explaining what it means for that area of their life and one plain-English sentence explaining WHY — the actual astrological reason. Then give an overall compatibility verdict paragraph. Begin with a one-sentence headline verdict (prefixed "HEADLINE:"), blank line, then the placements. Write in a direct, conversational tone. No flowery poetry. No long paragraphs. Talk directly to them — use "you" and "your partner".'
        : 'You are a Vedic astrologer. Someone has placed planets on their chart. For each planet placement write one plain-English sentence about what that placement means for that area of their life, followed by one sentence explaining WHY — the actual astrological reason (e.g. "Saturn slows things down and demands patience before rewarding"). Be specific, direct, and practical. No flowery poetry. No vague mysticism. Talk directly to the person — use "you" and "your". Begin with a one-sentence headline verdict (prefixed "HEADLINE:"), a blank line, then one paragraph per placement.';

      const b1Info = birth1
        ? 'Born: ' + (birth1.dob || 'unknown date') + (birth1.tob ? ' at ' + birth1.tob : '') + ' in ' + (birth1.pob || 'unknown place') + '.'
        : '';
      const b2Info = birth2
        ? 'Born: ' + (birth2.dob || 'unknown date') + (birth2.tob ? ' at ' + birth2.tob : '') + ' in ' + (birth2.pob || 'unknown place') + '.'
        : '';
      const userMsg = isMatch
        ? 'Person 1 placements: ' + (placements1.join(', ') || 'none') + '. ' + b1Info + '\nPerson 2 placements: ' + (placements2.join(', ') || 'none') + '. ' + b2Info
        : 'Placements: ' + (placements1.join(', ') || 'none') + '. ' + b1Info;

      const res = await fetch(GPT_URL, {
        method: 'POST',
        headers: { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 900,
          temperature: 0.88,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg }
          ]
        })
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || '';
      const headlineMatch = raw.match(/^HEADLINE:\s*(.+)/m);
      const hl = headlineMatch ? headlineMatch[1].trim() : VERDICTS[Object.keys(placed1).length % VERDICTS.length];
      const body = raw.replace(/^HEADLINE:\s*.+\n*/m, '').trim();
      setHeadline(hl);
      setStory(body || buildFallbackStory(placed1, placed2, isMatch));
    } catch {
      setHeadline(VERDICTS[Object.keys(placed1).length % VERDICTS.length]);
      setStory(buildFallbackStory(placed1, placed2, isMatch));
    }
    setLoading(false);
  };

  const headlineWords = headline.split(' ');
  const paragraphs = story.split(/\n+/).filter(p => p.trim().length > 0);

  if (loading) {
    return (
      <div className="ngr-reveal">
        <div className="ngr-reveal-bg" />
        <div className="ngr-loading-overlay" style={{ position: 'relative', height: '100%' }}>
          <div className="ngr-spinner" />
          <div className="ngr-loading-text">Reading the stars…</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--bone-faint)', fontSize: 16, marginTop: 8 }}>
            The cosmos is speaking
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ngr-reveal">
      <div className="ngr-reveal-bg" />
      <div className="ngr-reveal-inner">
        <button
          onClick={onBack}
          style={{ position: 'absolute', top: 0, left: 0, background: 'transparent', border: '1px solid rgba(232,161,59,0.3)', color: 'var(--bone-dim)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', padding: '7px 14px', cursor: 'pointer' }}
        >
          ◂ Back
        </button>

        <div className="ngr-invocation">तथास्तु</div>
        <div className="ngr-reveal-label">{isMatch ? 'The Stars Read Your Union' : 'The Stars Read Your Life'}</div>

        <h1 className="ngr-verdict">
          {headlineWords.map((w, i) => (
            <span key={i} className="ngr-word" style={{ animationDelay: (0.12 * i) + 's' }}>
              {w}{i < headlineWords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>

        <div className="ngr-rule" />

        <div style={{ marginTop: 48, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 19,
                lineHeight: 1.8,
                color: 'var(--bone)',
                fontStyle: 'italic',
                margin: '0 0 28px',
                opacity: 0,
                animation: 'ngr-reason-fade 1s ease-out ' + (0.4 + i * 0.4) + 's forwards',
              }}
            >
              {para}
            </p>
          ))}
        </div>

        <div className="ngr-reveal-foot" style={{ marginTop: 32 }}>
          <button className="ngr-cast-again" onClick={onCastAgain}>Cast Again</button>
        </div>
      </div>
    </div>
  );
}

function buildFallbackStory(placed1, placed2, isMatch) {
  const entries = Object.entries(placed1).slice(0, 4);
  const lines = entries.map(([id, num]) => READINGS[id][num - 1]);
  if (isMatch && placed2) {
    Object.entries(placed2).slice(0, 2).forEach(([id, num]) => lines.push(READINGS[id][num - 1]));
  }
  return lines.join('\n\n');
}

/* ── Sigils ── */
function SigilSelf() {
  return (
    <svg viewBox="0 0 110 110" className="ngr-sigil">
      <defs>
        <radialGradient id="ngr-sg1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0c14b" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#e8a13b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e8a13b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="55" cy="55" r="40" fill="url(#ngr-sg1)" />
      <circle cx="55" cy="55" r="32" fill="none" stroke="#e8a13b" strokeWidth="0.6" />
      <circle cx="55" cy="55" r="22" fill="none" stroke="#e8a13b" strokeWidth="0.4" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={55 + Math.cos(a) * 32} y1={55 + Math.sin(a) * 32} x2={55 + Math.cos(a) * 44} y2={55 + Math.sin(a) * 44} stroke="#e8a13b" strokeWidth="0.6" />;
      })}
      <circle cx="55" cy="55" r="6" fill="#d6391b" />
      <circle cx="55" cy="55" r="3" fill="#f0c14b" />
    </svg>
  );
}

function SigilMatch() {
  return (
    <svg viewBox="0 0 110 110" className="ngr-sigil">
      <defs>
        <radialGradient id="ngr-sg2a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0c14b" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f0c14b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ngr-sg2b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6fd9d4" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6fd9d4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="38" cy="55" r="28" fill="url(#ngr-sg2a)" />
      <circle cx="72" cy="55" r="28" fill="url(#ngr-sg2b)" />
      <circle cx="38" cy="55" r="22" fill="none" stroke="#e8a13b" strokeWidth="0.6" />
      <circle cx="72" cy="55" r="22" fill="none" stroke="#6fd9d4" strokeWidth="0.6" />
      <circle cx="55" cy="55" r="4" fill="#d6391b" />
      <line x1="55" y1="20" x2="55" y2="90" stroke="#e8a13b" strokeWidth="0.5" strokeDasharray="2 3" />
    </svg>
  );
}

/* ── Landing screen ── */
function Landing({ onPick, onBack }) {
  return (
    <div className="ngr-landing">
      <button className="ngr-back-btn" onClick={onBack}>◂ Exit</button>
      <div className="ngr-crown">
        <span className="ngr-kicker">A Cosmic Sandbox</span>
        <span className="ngr-dot" />
        <span className="ngr-kicker">Vedic · Drag · Reveal</span>
      </div>
      <div className="ngr-titleblock">
        <div className="ngr-om">ॐ</div>
        <h1 className="ngr-h1">NAVAGRAHA</h1>
        <div className="ngr-deva-title">नवग्रह</div>
        <div className="ngr-sub">The Cosmic Sandbox</div>
      </div>
      <p className="ngr-intent">You are the astrologer now. Place the planets. Read the fate.</p>
      <div className="ngr-doorways">
        <div className="ngr-doorway" onClick={() => onPick('wellbeing')}>
          <SigilSelf />
          <div style={{ textAlign: 'center' }}>
            <h2>Overall Wellbeing</h2>
            <div className="ngr-deva-sub">आत्म</div>
          </div>
          <div className="ngr-desc">One chart. One soul. One fate, weighed.</div>
          <div className="ngr-enter">Cross the threshold ▸</div>
        </div>
        <div className="ngr-doorway" onClick={() => onPick('match')}>
          <SigilMatch />
          <div style={{ textAlign: 'center' }}>
            <h2>Match Making</h2>
            <div className="ngr-deva-sub">संगम</div>
          </div>
          <div className="ngr-desc">Two charts beside each other. Two destinies, considered.</div>
          <div className="ngr-enter">Cross the threshold ▸</div>
        </div>
      </div>
    </div>
  );
}

/* ── Root component ── */
export default function NavagrahaExperience({ onStop }) {
  const [screen, setScreen] = useState('landing');
  const [mode, setMode] = useState(null);
  const [placed1, setPlaced1] = useState({});
  const [placed2, setPlaced2] = useState(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Cormorant+SC:wght@400;500&family=Manrope:wght@400;500&family=Noto+Serif+Devanagari:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const handlePick = (m) => { setMode(m); setScreen('sandbox'); };

  const [birth1, setBirth1] = useState(null);
  const [birth2, setBirth2] = useState(null);

  const handleReveal = (p1, p2, b1, b2) => {
    setPlaced1(p1);
    setPlaced2(p2);
    setBirth1(b1);
    setBirth2(b2);
    setScreen('reveal');
  };

  const handleCastAgain = () => {
    setPlaced1({});
    setPlaced2(null);
    setScreen('sandbox');
  };

  return (
    <div className="ngr-root">
      <Cosmos />
      <div className="ngr-screen">
        {screen === 'landing' && (
          <Landing onPick={handlePick} onBack={onStop} />
        )}
        {screen === 'sandbox' && mode === 'wellbeing' && (
          <WellbeingSandbox
            onBack={() => setScreen('landing')}
            onReveal={handleReveal}
          />
        )}
        {screen === 'sandbox' && mode === 'match' && (
          <MatchSandbox
            onBack={() => setScreen('landing')}
            onReveal={handleReveal}
          />
        )}
        {screen === 'reveal' && (
          <RevealScreen
            placed1={placed1}
            placed2={placed2}
            mode={mode}
            onCastAgain={handleCastAgain}
            onBack={() => setScreen('sandbox')}
            birth1={birth1}
            birth2={birth2}
          />
        )}
      </div>
    </div>
  );
}
