import React, { useRef, useEffect, useState, useCallback } from 'react';

const CONTENT_TYPE_HUE = {
  'Image': 35,
  'Text': 270,
  'Text and Image': 320,
  'Text + Image': 320,
  'Video': 340,
  'Interactive Simulation': 185,
  'Interactive Upload': 120,
};

const GOLDEN_STRANDS = [
  { r: 18,  lw: 5.5, a: 0.88, c: [255, 255, 220] },
  { r: 36,  lw: 3.8, a: 0.65, c: [255, 230, 140] },
  { r: 57,  lw: 3.0, a: 0.52, c: [255, 200, 80]  },
  { r: 78,  lw: 2.3, a: 0.40, c: [255, 180, 40]  },
  { r: 103, lw: 1.8, a: 0.28, c: [220, 150, 30]  },
  { r: 130, lw: 1.3, a: 0.17, c: [200, 130, 20]  },
];

function drawGoldenSpiral(ctx, cw, ch, t) {
  const cx = cw / 2, cy = ch / 2, vstep = 5;
  const steps = Math.ceil(ch / vstep) + 20;
  ctx.clearRect(0, 0, cw, ch);
  const field = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
  field.addColorStop(0,   'rgba(255,180,40,0.12)');
  field.addColorStop(0.4, 'rgba(255,140,20,0.06)');
  field.addColorStop(1,   'rgba(200,100,10,0)');
  ctx.fillStyle = field; ctx.fillRect(0, 0, cw, ch);
  GOLDEN_STRANDS.forEach((sd, si) => {
    const phase = si * (Math.PI * 2 / GOLDEN_STRANDS.length);
    ctx.beginPath();
    for (let s = -steps / 2; s <= steps / 2; s++) {
      const a = s * 0.2 + t + phase;
      const x = cx + sd.r * Math.sin(a), y = cy + s * vstep;
      s === -steps / 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    const [r, gb, b] = sd.c;
    g.addColorStop(0,   `rgba(${r},${gb},${b},0)`);
    g.addColorStop(0.1, `rgba(${r},${gb},${b},${sd.a * 0.45})`);
    g.addColorStop(0.5, `rgba(${r},${gb},${b},${sd.a})`);
    g.addColorStop(0.9, `rgba(${r},${gb},${b},${sd.a * 0.45})`);
    g.addColorStop(1,   `rgba(${r},${gb},${b},0)`);
    ctx.strokeStyle = g; ctx.lineWidth = sd.lw; ctx.stroke();
  });
  for (let p = 0; p < 65; p++) {
    const sd = GOLDEN_STRANDS[p % GOLDEN_STRANDS.length];
    const phase = (p % GOLDEN_STRANDS.length) * (Math.PI * 2 / GOLDEN_STRANDS.length);
    const s = (p / 65 - 0.5) * steps;
    const a = s * 0.2 + t + phase;
    const x = cx + sd.r * Math.sin(a), y = cy + s * vstep;
    const depth = (Math.cos(a) + 1) / 2;
    const yFade = Math.max(0, 1 - Math.abs(s / (steps / 2)) * 1.6);
    if (yFade < 0.03) continue;
    const sz = 1.5 + depth * 3.8;
    const pg = ctx.createRadialGradient(x, y, 0, x, y, sz * 2.8);
    pg.addColorStop(0,   `rgba(255,255,220,${0.95 * depth * yFade})`);
    pg.addColorStop(0.4, `rgba(255,220,100,${0.55 * depth * yFade})`);
    pg.addColorStop(1,   'rgba(255,160,20,0)');
    ctx.beginPath(); ctx.arc(x, y, sz * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = pg; ctx.fill();
  }
  const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
  flare.addColorStop(0,   'rgba(255,255,200,0.32)');
  flare.addColorStop(0.4, 'rgba(255,220,80,0.14)');
  flare.addColorStop(1,   'rgba(255,160,20,0)');
  ctx.fillStyle = flare; ctx.fillRect(0, 0, cw, ch);
}

const ExploreOverlay = ({ experiences = [], onSelect, onClose, open }) => {
  const spiralRef = useRef(null);
  const cardRefs  = useRef([]);
  const irisRefs  = useRef([]);
  const specRefs  = useRef([]);
  const edgeRefs  = useRef([]);
  const rafRef    = useRef(null);
  const state     = useRef({ pos: 0, target: 0, vel: 0, mx: 0.5, my: 0.5 });
  const [focusIdx, setFocusIdx] = useState(0);
  const N = experiences.length;

  // Reset position when overlay opens
  useEffect(() => {
    if (open) {
      state.current.pos = 0;
      state.current.target = 0;
      state.current.vel = 0;
    }
  }, [open]);

  // Resize spiral canvas
  useEffect(() => {
    const sc = spiralRef.current;
    if (!sc) return;
    const resize = () => { sc.height = sc.parentElement?.offsetHeight || window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [open]);

  // Main RAF loop: spiral + helix + iridescent
  useEffect(() => {
    if (!open || N === 0) return;
    const sc = spiralRef.current;
    const ctx2d = sc ? sc.getContext('2d') : null;
    const R = 220, aStep = 36 * Math.PI / 180, vStep = 110;
    let t = 0, lastFocus = -1;

    const loop = () => {
      t += 0.012;
      if (sc && ctx2d) drawGoldenSpiral(ctx2d, sc.width || 600, sc.height || window.innerHeight, t);

      const s = state.current;
      s.vel *= 0.88;
      s.pos += s.vel;
      s.pos = Math.max(0, Math.min(N - 1, s.pos));
      if (Math.abs(s.vel) < 0.02) s.pos += (s.target - s.pos) * 0.12;
      const globalTilt = (s.mx - 0.5) * 0.3;
      const fi = Math.max(0, Math.min(N - 1, Math.round(s.pos)));

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = i - s.pos, absD = Math.abs(d);
        if (absD > 16) { el.style.display = 'none'; return; }
        el.style.display = 'block';
        const angle = d * aStep + globalTilt;
        const x = R * Math.sin(angle);
        const z = R * (Math.cos(angle) - 1);
        const y = d * vStep;
        const rx = absD < 3 ? (s.my - 0.5) * -12 * Math.max(0, 1 - absD * 0.4) : 0;
        const ry = absD < 3 ? (s.mx - 0.5) *  12 * Math.max(0, 1 - absD * 0.4) : 0;
        el.style.transform = `translate(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%)) translateZ(${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        el.style.opacity = Math.max(0, 1 - absD * 0.11).toFixed(3);
        const blur = absD < 0.5 ? 0 : (absD - 0.4) * 1.8;
        el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
        absD < 0.6 ? el.classList.add('is-focus') : el.classList.remove('is-focus');

        if (absD < 6) {
          const W = window.innerWidth, H = window.innerHeight;
          const rect = el.getBoundingClientRect();
          if (rect.width > 0) {
            const cx2 = ((s.mx * W - rect.left) / rect.width * 100).toFixed(1) + '%';
            const cy2 = ((s.my * H - rect.top) / rect.height * 100).toFixed(1) + '%';
            const mA = (Math.atan2(s.my - 0.5, s.mx - 0.5) * 180 / Math.PI).toFixed(1);
            const iri = irisRefs.current[i];
            const spc = specRefs.current[i];
            const edg = edgeRefs.current[i];
            if (iri) iri.style.cssText = `--angle:${mA};--cx:${cx2};--cy:${cy2};--iri:1;`;
            if (spc) spc.style.cssText = `--cx:${cx2};--cy:${cy2};--glow:0.85;--spec-r:120px;`;
            if (edg) edg.style.setProperty('--angle', mA);
          }
        }
      });

      if (fi !== lastFocus) { lastFocus = fi; setFocusIdx(fi); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, N]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      const s = state.current;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault(); s.vel = 0; s.target = Math.min(N - 1, Math.round(s.target) + 1);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault(); s.vel = 0; s.target = Math.max(0, Math.round(s.target) - 1);
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, N, onClose]);

  const onMouseMove = useCallback((e) => {
    state.current.mx = e.clientX / window.innerWidth;
    state.current.my = e.clientY / window.innerHeight;
  }, []);

  return (
    <div className={`ex-overlay${open ? ' open' : ''}`} onMouseMove={onMouseMove}>
      {/* Spine background */}
      <div className="ex-bg" />
      <div className="ex-bg-overlay" />

      {/* Golden column + spiral */}
      <div className="ex-col-wrap">
        <div className="ex-col-core" />
        <div className="ex-col-glow" />
        <div className="ex-col-glow2" />
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="ex-ering"
            style={{ '--dur': `${5.5 + i * 0.8}s`, '--delay': `${-i * 1.1}s` }}
          />
        ))}
        <canvas ref={spiralRef} className="ex-spiral-canvas" width={600} />
      </div>

      {/* 3D helix scene */}
      <div className="ex-scene">
        <div className="ex-helix">
          {experiences.map((exp, i) => {
            const hue = CONTENT_TYPE_HUE[exp.contentType] || 200;
            return (
              <div
                key={exp.id}
                className="ex-card"
                ref={el => { cardRefs.current[i] = el; }}
                style={{ '--hue': hue }}
                onClick={() => {
                  const s = state.current;
                  if (Math.abs(i - s.pos) >= 0.8) { s.target = i; s.vel = 0; }
                }}
              >
                <div className="ex-card-body">
                  <div className="ex-c-bg" />
                  <div className="ex-c-iri"  ref={el => { irisRefs.current[i] = el; }} />
                  <div className="ex-c-spec" ref={el => { specRefs.current[i] = el; }} />
                  <div className="ex-c-noise" />
                  <div className="ex-c-edge" ref={el => { edgeRefs.current[i] = el; }} />
                  <div className="ex-c-content">
                    <div className="ex-c-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="ex-c-tag">{exp.contentType}</div>
                    <div className="ex-c-title">{exp.title}</div>
                    <div className="ex-c-desc">{exp.description?.slice(0, 120)}…</div>
                    <button
                      className="ex-enter-btn"
                      onClick={(e) => { e.stopPropagation(); onSelect(exp.id); }}
                    >
                      Enter Experience
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chrome UI */}
      <div className="ex-header">
        <h1>EXPERIENCE HUB</h1>
        <p>where AI imagines with you</p>
      </div>
      <div className="ex-counter">
        <strong>{focusIdx + 1}</strong> / {N}
      </div>
      <div className="ex-nav-hint">↑ ↓ to navigate · click to select</div>
      <button className="ex-back" onClick={onClose}>← Back</button>
    </div>
  );
};

export default ExploreOverlay;
