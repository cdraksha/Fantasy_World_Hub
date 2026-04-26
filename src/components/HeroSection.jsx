import React, { useRef, useEffect, useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
//  Real Katana renderer — authentic anatomy
// ─────────────────────────────────────────────────────────────
function drawRealKatana(ctx, tipX, tipY, angle, BL, alpha, glow, trail) {
  if (alpha <= 0) return;
  ctx.save();
  const bW = BL * 0.016;

  // Trail glow
  trail.forEach((pt, i) => {
    const ta = (i / trail.length) * alpha * 0.42;
    ctx.save();
    ctx.globalAlpha = ta;
    ctx.translate(pt.x, pt.y); ctx.rotate(angle);
    ctx.shadowColor = `rgba(200,225,255,${glow})`; ctx.shadowBlur = 32 + glow * 52;
    ctx.strokeStyle = `rgba(170,200,255,${0.32 + glow * 0.22})`; ctx.lineWidth = bW * 3.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-BL * 0.9, 0); ctx.stroke();
    ctx.restore();
  });

  ctx.translate(tipX, tipY); ctx.rotate(angle); ctx.globalAlpha = alpha;

  // Ambient blade halo
  const hG = ctx.createLinearGradient(4, 0, -BL, 0);
  hG.addColorStop(0,   'rgba(180,210,255,0)');
  hG.addColorStop(0.3, `rgba(180,210,255,${glow * 0.10})`);
  hG.addColorStop(0.6, `rgba(160,200,255,${glow * 0.16})`);
  hG.addColorStop(1,   'rgba(180,210,255,0)');
  ctx.beginPath();
  ctx.ellipse(-BL * 0.44, 0, BL * 0.48, bW * 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = hG; ctx.fill();

  // ── Blade body (shinogi-ji + ji cross-section gradient) ──
  const bG = ctx.createLinearGradient(0, -bW, 0, bW);
  bG.addColorStop(0,    'rgba(68,98,172,0.50)');
  bG.addColorStop(0.20, 'rgba(142,175,236,0.85)');
  bG.addColorStop(0.48, 'rgba(255,255,255,1)');
  bG.addColorStop(0.72, 'rgba(192,216,255,0.90)');
  bG.addColorStop(1,    'rgba(60,90,160,0.45)');

  ctx.beginPath();
  ctx.moveTo(3,           0);              // Kissaki tip (ha apex)
  ctx.lineTo(-BL * 0.968, bW * 0.50);    // Near habaki, ha side
  ctx.lineTo(-BL,          bW * 0.10);   // Machi ha
  ctx.lineTo(-BL,         -bW * 0.28);   // Machi mune
  ctx.lineTo(-BL * 0.968, -bW * 0.42);  // Near habaki, mune side
  ctx.lineTo(2,           -bW * 0.15);   // Kissaki mune
  ctx.closePath();
  ctx.fillStyle = bG;
  ctx.shadowColor = `rgba(188,213,255,${0.28 + glow * 0.52})`;
  ctx.shadowBlur = 12 + glow * 26;
  ctx.fill(); ctx.shadowBlur = 0;

  // Ha — cutting edge bright line
  ctx.beginPath();
  ctx.moveTo(3, 0); ctx.lineTo(-BL * 0.968, bW * 0.50);
  ctx.strokeStyle = 'rgba(255,255,255,0.93)'; ctx.lineWidth = bW * 0.20;
  ctx.shadowColor = 'rgba(218,234,255,0.95)'; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;

  // Mune — spine back edge
  ctx.beginPath();
  ctx.moveTo(2, -bW * 0.15); ctx.lineTo(-BL * 0.968, -bW * 0.42);
  ctx.strokeStyle = 'rgba(125,160,216,0.42)'; ctx.lineWidth = bW * 0.11; ctx.stroke();

  // Shinogi — central ridge line
  ctx.beginPath();
  ctx.moveTo(0, bW * 0.10); ctx.lineTo(-BL * 0.960, bW * 0.20);
  ctx.strokeStyle = 'rgba(200,220,255,0.52)'; ctx.lineWidth = bW * 0.08; ctx.stroke();

  // Bo-hi — fuller groove
  ctx.beginPath();
  ctx.moveTo(-bW * 3.5, -bW * 0.04); ctx.lineTo(-BL * 0.875, bW * 0.07);
  ctx.strokeStyle = `rgba(98,145,212,${0.26 + glow * 0.16})`; ctx.lineWidth = bW * 0.12;
  ctx.shadowColor = 'rgba(128,178,255,0.5)'; ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0;

  // Hamon — irregular temper wave along ha
  ctx.save();
  ctx.beginPath();
  const haStep = (BL * 0.87) / 24;
  let hx = -bW * 2.5, hy = bW * 0.30;
  ctx.moveTo(hx, hy);
  for (let i = 0; i < 24; i++) {
    const nx = hx - haStep;
    const wy = bW * 0.044 * (Math.sin(i * 1.7 + 0.5) * 1.4 + Math.sin(i * 0.8) * 0.6);
    ctx.quadraticCurveTo(hx - haStep * 0.5, hy + wy, nx, hy + wy * 0.3);
    hx = nx; hy = hy + wy * 0.3;
  }
  ctx.strokeStyle = `rgba(255,255,255,${0.20 + glow * 0.24})`; ctx.lineWidth = bW * 0.09; ctx.stroke();
  ctx.restore();

  // ── Habaki (blade collar) ──
  const habX = -BL * 0.968, habW = BL * 0.038;
  const habT = -bW * 0.55, habB = bW * 0.58;
  const habG = ctx.createLinearGradient(habX, 0, habX + habW, 0);
  habG.addColorStop(0,    'rgba(110,70,16,0.92)');
  habG.addColorStop(0.42, 'rgba(220,174,56,0.98)');
  habG.addColorStop(0.74, 'rgba(196,148,45,0.96)');
  habG.addColorStop(1,    'rgba(100,60,12,0.90)');
  ctx.beginPath(); ctx.rect(habX, habT, habW, habB - habT);
  ctx.fillStyle = habG; ctx.shadowColor = 'rgba(196,154,44,0.52)'; ctx.shadowBlur = 7; ctx.fill(); ctx.shadowBlur = 0;
  [0.28, 0.58].forEach(r => {
    ctx.beginPath();
    ctx.moveTo(habX + habW * r, habT); ctx.lineTo(habX + habW * r, habB);
    ctx.strokeStyle = 'rgba(255,214,90,0.28)'; ctx.lineWidth = 0.5; ctx.stroke();
  });

  // ── Tsuba (guard) ──
  const tsubaX = habX + habW;
  ctx.save(); ctx.translate(tsubaX, 0);
  ctx.beginPath(); ctx.ellipse(0, 0, bW * 4.5, bW * 1.9, 0, 0, Math.PI * 2);
  const tG = ctx.createRadialGradient(-bW, -bW * 0.38, 0, 0, 0, bW * 4.5);
  tG.addColorStop(0,    'rgba(238,188,64,0.98)');
  tG.addColorStop(0.40, 'rgba(184,134,40,0.96)');
  tG.addColorStop(0.80, 'rgba(114,69,15,0.93)');
  tG.addColorStop(1,    'rgba(74,40,5,0.90)');
  ctx.fillStyle = tG;
  ctx.shadowColor = `rgba(214,164,50,${0.52 + glow * 0.35})`; ctx.shadowBlur = 14 + glow * 18; ctx.fill(); ctx.shadowBlur = 0;
  // Seppa ring
  ctx.beginPath(); ctx.ellipse(0, 0, bW * 3.05, bW * 1.25, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,214,90,0.30)'; ctx.lineWidth = 0.65; ctx.stroke();
  // 4-petal carving suggestion
  for (let p = 0; p < 4; p++) {
    const pa = p * Math.PI * 0.5 + Math.PI * 0.25;
    ctx.beginPath(); ctx.ellipse(Math.cos(pa) * bW * 1.65, Math.sin(pa) * bW * 0.70, bW * 0.62, bW * 0.32, pa, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,210,74,0.15)'; ctx.lineWidth = 0.5; ctx.stroke();
  }
  ctx.restore();

  // ── Tsuka (handle) ──
  const tsukaX = tsubaX + bW * 2.25, tsukaLen = BL * 0.295, tsukaHH = bW * 0.80;
  const tkG = ctx.createLinearGradient(tsukaX, -tsukaHH, tsukaX, tsukaHH);
  tkG.addColorStop(0,    'rgba(18,11,3,0.97)');
  tkG.addColorStop(0.38, 'rgba(58,34,9,0.97)');
  tkG.addColorStop(0.72, 'rgba(42,22,5,0.97)');
  tkG.addColorStop(1,    'rgba(12,6,1,0.97)');
  ctx.beginPath(); ctx.rect(tsukaX, -tsukaHH, tsukaLen, tsukaHH * 2);
  ctx.fillStyle = tkG; ctx.fill();

  // Same-gawa dots
  ctx.fillStyle = 'rgba(255,255,255,0.052)';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) {
    ctx.beginPath();
    ctx.arc(tsukaX + 5 + c * (tsukaLen - 10) / 9, -tsukaHH * 0.55 + r * tsukaHH * 0.55, 0.72, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ito diamond wrapping
  const wN = 11, wp = tsukaLen / wN;
  for (let i = 0; i < wN; i++) {
    const x0 = tsukaX + i * wp;
    ctx.beginPath();
    ctx.moveTo(x0,            -tsukaHH);
    ctx.lineTo(x0 + wp * 0.46, -tsukaHH);
    ctx.lineTo(x0 + wp * 0.84,  tsukaHH);
    ctx.lineTo(x0 + wp * 0.38,  tsukaHH);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? 'rgba(145,95,30,0.70)' : 'rgba(78,45,9,0.52)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(194,142,45,0.25)'; ctx.lineWidth = 0.55; ctx.stroke();
  }

  // Menuki ornament
  ctx.beginPath(); ctx.ellipse(tsukaX + tsukaLen * 0.47, 0, bW * 1.55, bW * 0.50, 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(188,142,40,0.40)'; ctx.shadowColor = 'rgba(214,164,55,0.48)'; ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0;

  // ── Kashira (pommel) ──
  const kasX = tsukaX + tsukaLen;
  ctx.beginPath(); ctx.ellipse(kasX + bW * 1.05, 0, bW * 1.02, bW * 0.94, 0, 0, Math.PI * 2);
  const kG = ctx.createRadialGradient(kasX + bW * 0.28, -bW * 0.28, 0, kasX + bW * 1.05, 0, bW * 1.02);
  kG.addColorStop(0,   'rgba(238,188,64,0.97)');
  kG.addColorStop(0.5, 'rgba(168,114,28,0.94)');
  kG.addColorStop(1,   'rgba(74,40,6,0.90)');
  ctx.fillStyle = kG;
  ctx.shadowColor = `rgba(194,148,40,${0.52 + glow * 0.34})`; ctx.shadowBlur = 9 + glow * 12; ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.ellipse(kasX + bW * 1.05, 0, bW * 0.65, bW * 0.60, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,212,84,0.25)'; ctx.lineWidth = 0.6; ctx.stroke();

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
//  Portal Jump — 5 worlds + cut flashes + white burst
// ─────────────────────────────────────────────────────────────
function runPortalJump(canvas, W, H, onComplete) {
  if (!canvas) { if (onComplete) onComplete(); return; }
  canvas.width = W; canvas.height = H;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');

  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const oc = off.getContext('2d');

  const SRCS = ['/worlds/L.jpg', '/worlds/S.jpg', '/worlds/C.jpg', '/worlds/J.jpg', '/worlds/K.jpg'];

  const SEG = [
    { k: 'w', id: 0, s: 0,    e: 900  },
    { k: 'f',         s: 900,  e: 950  },
    { k: 'w', id: 1, s: 950,  e: 1850 },
    { k: 'f',         s: 1850, e: 1900 },
    { k: 'w', id: 2, s: 1900, e: 2800 },
    { k: 'f',         s: 2800, e: 2850 },
    { k: 'w', id: 3, s: 2850, e: 3750 },
    { k: 'f',         s: 3750, e: 3800 },
    { k: 'w', id: 4, s: 3800, e: 4700 },
    { k: 'b',         s: 4700, e: 5000 },
  ];
  const END = 5000;
  let start = null;
  const cx = W / 2, cy = H / 2;
  const maxR = Math.hypot(cx, cy);

  function drawCover(img, zoom) {
    if (!img.naturalWidth) return;
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight) * (zoom || 1);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    oc.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }

  // Deterministic per-frame shake so each frame is consistent
  function srand(seed) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); }

  // Layered arc glow ring — visible against white background
  function drawRing(r, ringW, alpha) {
    for (let i = 5; i >= 1; i--) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,230,130,${(alpha * 0.18) / i})`;
      ctx.lineWidth = ringW * i * 2;
      ctx.stroke();
    }
    // Bright core edge
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,248,200,${alpha * 0.95})`;
    ctx.lineWidth = Math.max(2, ringW * 0.2);
    ctx.stroke();
  }

  let loaded = 0;
  const imgs = SRCS.map(src => {
    const img = new Image();
    img.onload = img.onerror = () => { loaded++; if (loaded === SRCS.length) requestAnimationFrame(frame); };
    img.src = src;
    return img;
  });

  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;

    if (elapsed >= END) {
      canvas.style.filter = '';
      canvas.style.display = 'none';
      if (onComplete) onComplete();
      return;
    }

    ctx.clearRect(0, 0, W, H);
    const seg = SEG.find(s => elapsed >= s.s && elapsed < s.e);
    if (!seg) { requestAnimationFrame(frame); return; }
    const p = (elapsed - seg.s) / (seg.e - seg.s);

    if (seg.k === 'f') {
      // Golden shockwave ring punches across white screen
      canvas.style.filter = '';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      const r = p * (maxR + 80);
      const ringW = 60 * (1 - p * 0.55);
      // Alpha peaks at p=0.35, fades out
      const ringAlpha = p < 0.35 ? p / 0.35 : 1 - (p - 0.35) / 0.65;
      drawRing(r, ringW, ringAlpha);

    } else if (seg.k === 'b') {
      // Thanos final burst — ring sweeps out then holds white
      canvas.style.filter = '';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      if (p < 0.5) {
        const bp = p / 0.5;
        const r = bp * (maxR + 80);
        const ringW = 65 * (1 - bp * 0.5);
        const ringAlpha = bp < 0.4 ? bp / 0.4 : 1 - (bp - 0.4) / 0.6;
        drawRing(r, ringW, ringAlpha * 1.1);
      }
      // After p=0.5 just holds white — cards appear through it

    } else {
      // ── World segment ──────────────────────────────────────────
      const img = imgs[seg.id];

      // Slow push-in zoom: 100% → 107%
      const zoom = 1 + p * 0.07;

      oc.clearRect(0, 0, W, H);
      drawCover(img, zoom);

      // Dark vignette drawn onto offscreen
      const vg = oc.createRadialGradient(cx, cy, H * 0.28, cx, cy, maxR);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.60)');
      oc.fillStyle = vg;
      oc.fillRect(0, 0, W, H);

      // Entry slam: hard random jitter decaying over first ~100ms (11% of 900ms)
      let sx = 0, sy = 0;
      if (p < 0.11) {
        const slamDecay = 1 - p / 0.11;
        const seed = Math.floor(elapsed / 16);
        sx = (srand(seed)     - 0.5) * 22 * slamDecay;
        sy = (srand(seed + 7) - 0.5) * 13 * slamDecay;
      }

      ctx.save();
      ctx.translate(sx, sy);
      ctx.drawImage(off, 0, 0);
      ctx.restore();

      // Burn to white: last ~180ms (20% of 900ms) — world dissolves into energy
      if (p > 0.80) {
        const burnP = (p - 0.80) / 0.20;
        ctx.fillStyle = `rgba(255,255,255,${burnP * 0.90})`;
        ctx.fillRect(0, 0, W, H);
      }

      // CA: slams in at 10px, clears by ~100ms (11%)
      const caVal = p < 0.11 ? Math.round(10 * (1 - p / 0.11)) : 0;
      canvas.style.filter = caVal > 0
        ? `drop-shadow(${caVal}px 0 0 rgba(255,10,10,0.72)) drop-shadow(-${caVal}px 0 0 rgba(10,10,255,0.72)) contrast(1.25)`
        : '';
    }

    requestAnimationFrame(frame);
  }
}


// ─────────────────────────────────────────────────────────────
//  Plasma Gun SVG
// ─────────────────────────────────────────────────────────────
const PlasmaGun = ({ mirror }) => (
  <svg
    width="380" height="110" viewBox="0 0 380 110"
    style={mirror ? { transform: 'scaleX(-1)' } : {}}
  >
    {/* Barrel */}
    <rect x="95" y="43" width="268" height="20" rx="5" fill="#040810"/>
    <rect x="97" y="44" width="264" height="4"  rx="2" fill="#0a1428"/>
    <rect x="97" y="44" width="264" height="1.5" rx="0.75" fill="rgba(0,200,255,0.22)"/>
    <rect x="97" y="61" width="264" height="1"  rx="0.5" fill="rgba(0,150,200,0.14)"/>
    {/* Plasma conduit strip */}
    <rect x="100" y="50" width="258" height="5"  rx="2.5" fill="rgba(0,20,45,0.90)"/>
    <rect x="101" y="51.5" width="256" height="2" rx="1"   fill="rgba(0,220,255,0.60)"/>
    {/* Receiver body */}
    <rect x="28" y="29" width="90" height="54" rx="8" fill="#050a17"/>
    <rect x="30" y="30" width="86" height="2.5" rx="1" fill="#0b1430"/>
    <rect x="30" y="53" width="86" height="1" rx="0.5" fill="rgba(0,175,255,0.18)"/>
    <rect x="30" y="71" width="86" height="1" rx="0.5" fill="rgba(0,175,255,0.18)"/>
    {/* Plasma chamber window */}
    <rect x="44" y="35" width="44" height="42" rx="6" fill="#02060f"/>
    <rect x="46" y="37" width="40" height="38" rx="5" fill="rgba(0,35,70,0.60)"/>
    <ellipse cx="66" cy="56" rx="14" ry="16" fill="rgba(0,180,255,0.06)"/>
    <ellipse cx="66" cy="56" rx="9"  ry="10" fill="rgba(0,210,255,0.14)"/>
    <ellipse cx="66" cy="56" rx="5"  ry="6"  fill="rgba(0,240,255,0.55)"/>
    <ellipse cx="66" cy="56" rx="2"  ry="2.5" fill="rgba(200,255,255,0.95)"/>
    <rect x="44" y="35" width="44" height="42" rx="6" fill="none" stroke="rgba(0,175,255,0.28)" strokeWidth="0.8"/>
    {/* Energy rings */}
    {[140, 192, 244, 313].map(x => (
      <g key={x}>
        <rect x={x}   y="41" width="8" height="24" rx="2.5" fill="#050a17"/>
        <rect x={x+1} y="42" width="6" height="22" rx="1.5" fill="rgba(0,195,255,0.22)"/>
        <rect x={x+2.5} y="49.5" width="3" height="7" rx="1.5" fill="rgba(0,240,255,0.75)"/>
      </g>
    ))}
    {/* Hex vents */}
    {[165, 215, 267].map(x => (
      <polygon key={x}
        points={`${x},43 ${x+8},43 ${x+11},49 ${x+8},55 ${x},55 ${x-3},49`}
        fill="#030810" stroke="rgba(0,160,222,0.22)" strokeWidth="0.6"/>
    ))}
    {/* Scope rail */}
    <rect x="93" y="24" width="62" height="17" rx="4" fill="#040a18"/>
    <rect x="95" y="26" width="58" height="7"  rx="3" fill="#081020"/>
    <ellipse cx="140" cy="30" rx="7"   ry="5.5" fill="rgba(0,175,255,0.12)"/>
    <ellipse cx="140" cy="30" rx="3.5" ry="2.8" fill="rgba(0,220,255,0.40)"/>
    <ellipse cx="140" cy="30" rx="1.2" ry="1"   fill="rgba(180,255,255,0.85)"/>
    {/* Muzzle */}
    <rect x="356" y="37" width="20" height="32" rx="5" fill="#030810"/>
    <ellipse cx="367" cy="53" rx="5"   ry="8.5" fill="rgba(0,230,255,0.10)"/>
    <ellipse cx="367" cy="53" rx="3"   ry="5.5" fill="rgba(0,240,255,0.38)"/>
    <ellipse cx="367" cy="53" rx="1.2" ry="2.5" fill="rgba(200,255,255,0.92)"/>
    <rect x="356" y="37" width="20" height="32" rx="5" fill="none" stroke="rgba(0,175,255,0.38)" strokeWidth="0.8"/>
    {/* Grip */}
    <path d="M50 83 Q46 100 62 108 L80 108 Q89 108 87 98 L87 83 Z" fill="#050a17"/>
    {[87, 93, 99, 105].map(y => (
      <rect key={y} x="54" y={y} width={y < 104 ? 29 : 25} height="1.5" rx="0.75" fill="rgba(0,175,255,0.28)"/>
    ))}
    <path d="M50 83 Q46 100 62 108 L80 108 Q89 108 87 98 L87 83 Z" fill="none" stroke="rgba(0,175,255,0.18)" strokeWidth="0.7"/>
    {/* Neon accents */}
    <rect x="28" y="29" width="90" height="54" rx="8" fill="none" stroke="rgba(0,175,255,0.18)" strokeWidth="0.8"/>
    <rect x="115" y="43" width="24" height="4" rx="2" fill="rgba(0,200,255,0.55)"/>
    {/* Purple power cell */}
    <rect x="29" y="36" width="13" height="32" rx="3" fill="rgba(70,35,175,0.35)"/>
    <rect x="30" y="37" width="11" height="30" rx="2" fill="rgba(90,55,215,0.14)"/>
    <ellipse cx="35.5" cy="52" rx="3.5" ry="4"   fill="rgba(120,80,255,0.35)"/>
    <ellipse cx="35.5" cy="52" rx="1.5" ry="2"   fill="rgba(180,140,255,0.70)"/>
  </svg>
);

// Plasma muzzle flash
const PlasmaMuzzleFlash = () => (
  <svg width="120" height="120" viewBox="-60 -60 120 120">
    <circle r="18" fill="rgba(200,255,255,0.95)"/>
    <circle r="30" fill="rgba(0,240,255,0.55)"/>
    <circle r="46" fill="rgba(0,200,255,0.22)"/>
    <circle r="24" fill="none" stroke="rgba(0,255,255,0.40)" strokeWidth="1.5"/>
    <g stroke="rgba(0,240,255,0.88)" strokeWidth="2" strokeLinecap="round">
      <line x1="0" y1="-15" x2="0" y2="-56"/>
      <line x1="0"  y1="15" x2="0"  y2="56"/>
      <line x1="15" y1="0"  x2="56" y2="0"/>
      <line x1="-15" y1="0" x2="-56" y2="0"/>
      <line x1="11"  y1="-11" x2="36" y2="-36"/>
      <line x1="-11" y1="11"  x2="-36" y2="36"/>
      <line x1="11"  y1="11"  x2="36" y2="36"/>
      <line x1="-11" y1="-11" x2="-36" y2="-36"/>
    </g>
  </svg>
);

// Bullet/gunpowder muzzle flash
const BulletFlash = () => (
  <svg width="110" height="110" viewBox="-55 -55 110 110">
    <ellipse rx="10" ry="12" fill="rgba(255,240,180,0.98)"/>
    <ellipse rx="22" ry="18" fill="rgba(255,200,60,0.65)"/>
    <ellipse rx="38" ry="28" fill="rgba(255,140,20,0.30)"/>
    <g stroke="rgba(255,200,60,0.90)" strokeWidth="2.5" strokeLinecap="round">
      <line x1="0" y1="-10" x2="0" y2="-48"/>
      <line x1="0"  y1="10" x2="0"  y2="48"/>
      <line x1="12" y1="-8" x2="44" y2="-28"/>
      <line x1="-12" y1="8" x2="-44" y2="28"/>
      <line x1="12" y1="8" x2="44" y2="28"/>
      <line x1="-12" y1="-8" x2="-44" y2="-28"/>
    </g>
    <ellipse rx="5" ry="6" fill="rgba(255,255,220,0.95)"/>
  </svg>
);

// Explosive flash for RPG / shotgun
const ExplosiveFlash = () => (
  <svg width="140" height="140" viewBox="-70 -70 140 140">
    <circle r="28" fill="rgba(255,120,10,0.90)"/>
    <circle r="46" fill="rgba(255,80,5,0.55)"/>
    <circle r="62" fill="rgba(255,50,0,0.22)"/>
    <g stroke="rgba(255,200,40,0.88)" strokeWidth="3" strokeLinecap="round">
      <line x1="0" y1="-22" x2="0" y2="-62"/>
      <line x1="0"  y1="22" x2="0"  y2="62"/>
      <line x1="22" y1="0"  x2="62" y2="0"/>
      <line x1="-22" y1="0" x2="-62" y2="0"/>
      <line x1="16"  y1="-16" x2="44" y2="-44"/>
      <line x1="-16" y1="16"  x2="-44" y2="44"/>
      <line x1="16"  y1="16"  x2="44" y2="44"/>
      <line x1="-16" y1="-16" x2="-44" y2="-44"/>
    </g>
    <circle r="12" fill="rgba(255,255,200,0.96)"/>
  </svg>
);

// Assault Rifle (M4-style)
const AssaultRifle = ({ mirror }) => (
  <svg width="380" height="110" viewBox="0 0 380 110" style={mirror ? { transform: 'scaleX(-1)' } : {}}>
    <rect x="195" y="47" width="170" height="13" rx="3" fill="#1a1a1a"/>
    <rect x="197" y="48" width="166" height="4"  rx="2" fill="#2a2a2a"/>
    <rect x="355" y="43" width="22"  height="21" rx="3" fill="#111"/>
    <rect x="357" y="46" width="9"   height="6"  rx="1" fill="#222"/>
    <rect x="357" y="56" width="9"   height="6"  rx="1" fill="#222"/>
    <rect x="357" y="53" width="18"  height="1"  rx="0.5" fill="#333"/>
    <rect x="95"  y="40" width="170" height="28" rx="4" fill="#1c1c1c"/>
    <rect x="97"  y="42" width="166" height="9"  rx="3" fill="#252525"/>
    <rect x="110" y="28" width="130" height="14" rx="3" fill="#181818"/>
    <rect x="148" y="19" width="60"  height="13" rx="5" fill="#0e1a0e"/>
    <ellipse cx="164" cy="25.5" rx="7.5" ry="5" fill="rgba(0,60,15,0.5)"/>
    <ellipse cx="164" cy="25.5" rx="3.5" ry="2.5" fill="rgba(0,180,60,0.6)"/>
    <ellipse cx="192" cy="25.5" rx="7.5" ry="5" fill="rgba(0,60,15,0.5)"/>
    <ellipse cx="192" cy="25.5" rx="3.5" ry="2.5" fill="rgba(0,180,60,0.6)"/>
    <rect x="195" y="44" width="110" height="5" rx="2" fill="#282828"/>
    <rect x="195" y="53" width="110" height="20" rx="4" fill="#1e1e1e"/>
    {[205,225,245,265,285].map(x => <rect key={x} x={x} y="71" width="11" height="3" rx="1" fill="#2e2e2e"/>)}
    <rect x="95" y="68" width="100" height="20" rx="4" fill="#1c1c1c"/>
    <path d="M132 88 Q128 108 142 108 L162 108 Q170 106 168 88 Z" fill="#1a1a1a"/>
    <rect x="132" y="83" width="36" height="8" rx="2" fill="#222"/>
    <path d="M128 88 Q118 103 136 108 L142 108 Q126 103 143 88" fill="none" stroke="#333" strokeWidth="2"/>
    <path d="M96 88 Q92 108 108 108 L118 108 Q124 103 122 88 Z" fill="#1c1c1c"/>
    <rect x="5"  y="50" width="93" height="26" rx="5" fill="#181818"/>
    <rect x="7"  y="52" width="89" height="10" rx="3" fill="#222"/>
    <rect x="5"  y="62" width="28" height="14" rx="3" fill="#151515"/>
    <rect x="0"  y="52" width="9"  height="12" rx="3" fill="#141414"/>
    <rect x="103" y="44" width="18" height="3" rx="1" fill="rgba(255,140,0,0.32)"/>
  </svg>
);

// RPG Launcher
const RPGLauncher = ({ mirror }) => (
  <svg width="380" height="110" viewBox="0 0 380 110" style={mirror ? { transform: 'scaleX(-1)' } : {}}>
    <rect x="35" y="37" width="316" height="36" rx="18" fill="#2d3d1c"/>
    <rect x="37" y="39" width="312" height="14" rx="8" fill="rgba(255,255,255,0.06)"/>
    <ellipse cx="362" cy="55" rx="20" ry="23" fill="#243018"/>
    <ellipse cx="362" cy="55" rx="12" ry="14" fill="#1a2410"/>
    <ellipse cx="362" cy="55" rx="5"  ry="6"  fill="rgba(255,120,0,0.18)"/>
    <ellipse cx="362" cy="55" rx="2.5" ry="3" fill="rgba(255,80,0,0.55)"/>
    <path d="M33 37 L14 26 L10 84 L33 73 Z" fill="#1e2a10"/>
    <rect x="140" y="73" width="58" height="22" rx="5" fill="#1a2410"/>
    <rect x="143" y="76" width="52" height="11" rx="3" fill="#243018"/>
    <path d="M160 95 Q156 108 168 108 L178 108 Q184 106 181 95" fill="none" stroke="#2d3d1c" strokeWidth="3"/>
    <rect x="258" y="73" width="32" height="26" rx="5" fill="#1e2a10"/>
    <rect x="95"  y="30" width="6"  height="13" rx="2" fill="#2d3d1c"/>
    <rect x="285" y="28" width="6"  height="9"  rx="2" fill="#2d3d1c"/>
    <rect x="0"   y="44" width="38" height="22" rx="4" fill="#1c2a0e"/>
    <rect x="2"   y="47" width="34" height="5"  rx="2" fill="#243018"/>
    {[88,138,188,238,288].map(x => <rect key={x} x={x} y="43" width="4" height="24" rx="2" fill="rgba(190,130,20,0.28)"/>)}
    <rect x="18" y="44" width="16" height="4" rx="1" fill="rgba(255,180,0,0.38)"/>
    <rect x="18" y="52" width="16" height="4" rx="1" fill="rgba(255,0,0,0.28)"/>
  </svg>
);

// Pump Shotgun
const Shotgun = ({ mirror }) => (
  <svg width="380" height="110" viewBox="0 0 380 110" style={mirror ? { transform: 'scaleX(-1)' } : {}}>
    <rect x="138" y="41" width="234" height="14" rx="4" fill="#111"/>
    <rect x="140" y="43" width="230" height="5"  rx="3" fill="#1a1a1a"/>
    <rect x="138" y="55" width="234" height="12" rx="4" fill="#0d0d0d"/>
    <rect x="140" y="57" width="230" height="4"  rx="3" fill="#1a1a1a"/>
    <rect x="358" y="37" width="20"  height="32" rx="5" fill="#0d0d0d"/>
    <ellipse cx="368" cy="47" rx="5" ry="4" fill="rgba(0,0,0,0.9)"/>
    <ellipse cx="368" cy="61" rx="5" ry="4" fill="rgba(0,0,0,0.9)"/>
    <rect x="252" y="67" width="76"  height="22" rx="5" fill="#3d1e0a"/>
    <rect x="255" y="70" width="70"  height="10" rx="3" fill="#4d2810"/>
    <rect x="88"  y="38" width="115" height="38" rx="6" fill="#1a1a1a"/>
    <rect x="90"  y="40" width="111" height="12" rx="4" fill="#222"/>
    <rect x="112" y="43" width="44"  height="14" rx="3" fill="#111"/>
    <path d="M88 52 Q55 50 28 54 L6 62 L6 72 L28 72 Q56 70 88 76 Z" fill="#4d2810"/>
    <path d="M88 54 Q58 52 30 56 L10 63 L10 71 L30 70 Q58 68 88 74" fill="none" stroke="rgba(100,50,10,0.45)" strokeWidth="1"/>
    <path d="M88 76 Q86 96 103 100 L118 100 Q126 96 124 76 Z" fill="#1a1a1a"/>
    <path d="M108 76 Q104 90 113 95 L119 95 Q124 90 121 76" fill="none" stroke="#222" strokeWidth="2.5"/>
    <rect x="138" y="67" width="98"  height="8"  rx="4" fill="#181818"/>
    <rect x="138" y="39" width="232" height="3"  rx="1.5" fill="#252525"/>
    <circle cx="365" cy="40" r="3" fill="#aaa"/>
    <rect x="0"   y="49" width="9"  height="28" rx="4" fill="#3d1e0a"/>
  </svg>
);

// Sniper Rifle
const SniperRifle = ({ mirror }) => (
  <svg width="380" height="110" viewBox="0 0 380 110" style={mirror ? { transform: 'scaleX(-1)' } : {}}>
    <rect x="325" y="45" width="50" height="20" rx="4" fill="#1a1a1a"/>
    <rect x="327" y="47" width="46" height="7"  rx="3" fill="#222"/>
    <rect x="372" y="43" width="6"  height="24" rx="3" fill="#111"/>
    <rect x="155" y="48" width="172" height="14" rx="3" fill="#181818"/>
    <rect x="157" y="49" width="168" height="5"  rx="2" fill="#222"/>
    <line x1="205" y1="62" x2="194" y2="88" stroke="#222" strokeWidth="3.5"/>
    <line x1="228" y1="62" x2="239" y2="88" stroke="#222" strokeWidth="3.5"/>
    <rect x="191" y="86" width="10" height="5" rx="2" fill="#1a1a1a"/>
    <rect x="236" y="86" width="10" height="5" rx="2" fill="#1a1a1a"/>
    <rect x="78"  y="41" width="125" height="30" rx="5" fill="#181818"/>
    <rect x="80"  y="43" width="121" height="12" rx="4" fill="#1e1e1e"/>
    <rect x="88"  y="24" width="115" height="20" rx="7" fill="#0a0a0a"/>
    <rect x="90"  y="26" width="111" height="9"  rx="5" fill="#111"/>
    <ellipse cx="106" cy="35" rx="9"  ry="7"   fill="rgba(8,22,40,0.95)"/>
    <ellipse cx="106" cy="35" rx="4.5" ry="3.5" fill="rgba(0,90,200,0.42)"/>
    <ellipse cx="180" cy="35" rx="9"  ry="7"   fill="rgba(8,22,40,0.95)"/>
    <ellipse cx="180" cy="35" rx="4.5" ry="3.5" fill="rgba(0,90,200,0.42)"/>
    <rect x="133" y="18" width="16" height="10" rx="3" fill="#181818"/>
    <rect x="135" y="16" width="12" height="7"  rx="2" fill="#222"/>
    <path d="M108 71 L106 92 Q106 102 118 102 L133 102 Q143 100 141 92 L138 71 Z" fill="#181818"/>
    <rect x="108" y="66" width="30" height="8" rx="2" fill="#222"/>
    <path d="M80 71 Q76 94 93 98 L103 98 Q110 94 108 71 Z" fill="#181818"/>
    <path d="M94 71 Q90 86 98 92 L104 92 Q109 86 106 71" fill="none" stroke="#222" strokeWidth="2"/>
    <rect x="4"  y="47" width="77" height="16" rx="3" fill="#141414"/>
    <rect x="6"  y="49" width="73" height="6"  rx="2" fill="#1c1c1c"/>
    <rect x="4"  y="63" width="28" height="10" rx="3" fill="#111"/>
    <rect x="0"  y="45" width="7"  height="30" rx="3" fill="#0d0d0d"/>
    <rect x="93" y="27" width="32" height="3" rx="1.5" fill="rgba(90,150,255,0.16)"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
//  Accumulative crack impact — adds to existing canvas, never clears
// ─────────────────────────────────────────────────────────────
function addCrackImpact(canvas, shot, totalShots) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const progress = shot / totalShots;

  // Impact position: starts left/right edges, spreads inward then everywhere
  let ix, iy;
  const side = shot % 2;
  if (progress < 0.38) {
    ix = side === 0
      ? W * (0.12 + Math.random() * 0.22)
      : W * (0.66 + Math.random() * 0.22);
    iy = H * (0.18 + Math.random() * 0.64);
  } else {
    ix = W * (0.07 + Math.random() * 0.86);
    iy = H * (0.07 + Math.random() * 0.86);
  }

  const crackCount = 13 + Math.floor(progress * 14);
  const lenBase    = 70 + progress * 180;

  for (let i = 0; i < crackCount; i++) {
    const ang   = (i / crackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
    const len   = lenBase * (0.45 + Math.random() * 0.85);
    const alpha = 0.28 + Math.random() * 0.55;
    ctx.save();
    ctx.strokeStyle = `rgba(0,240,255,${alpha})`;
    ctx.lineWidth   = 0.5 + Math.random() * 1.7;
    ctx.shadowColor = 'rgba(0,220,255,0.65)'; ctx.shadowBlur = 7;
    ctx.beginPath(); ctx.moveTo(ix, iy);
    let cx2 = ix, cy2 = iy;
    const segs = 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < segs; s++) {
      const sL = len / segs, j = (Math.random() - 0.5) * 30;
      cx2 += Math.cos(ang) * sL; cy2 += Math.sin(ang) * sL;
      ctx.lineTo(cx2 + j, cy2 + j * 0.5);
    }
    ctx.stroke(); ctx.restore();
  }

  // Impact glow
  const r   = 38 + progress * 32;
  const impG = ctx.createRadialGradient(ix, iy, 0, ix, iy, r);
  impG.addColorStop(0,   `rgba(0,255,255,${0.42 + progress * 0.28})`);
  impG.addColorStop(0.5, 'rgba(0,200,255,0.10)');
  impG.addColorStop(1,   'transparent');
  ctx.beginPath(); ctx.arc(ix, iy, r, 0, Math.PI * 2);
  ctx.fillStyle = impG; ctx.fill();

  // White bleed grows as progress increases
  if (progress > 0.55) {
    const bleed = (progress - 0.55) / 0.45;
    const wg = ctx.createRadialGradient(ix, iy, 0, ix, iy, r * 3);
    wg.addColorStop(0, `rgba(255,255,255,${bleed * 0.45})`);
    wg.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(ix, iy, r * 3, 0, Math.PI * 2);
    ctx.fillStyle = wg; ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${bleed * 0.07})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function fadeToWhite(canvas, callback) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const DURATION = 340;
  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / DURATION, 1);
    ctx.fillStyle = `rgba(255,255,255,${p * 0.97})`;
    ctx.fillRect(0, 0, W, H);
    if (p < 1) requestAnimationFrame(frame);
    else callback();
  }
  requestAnimationFrame(frame);
}

// ─────────────────────────────────────────────────────────────
//  HeroSection
// ─────────────────────────────────────────────────────────────
const HeroSection = ({ onExplore, onCreate, onResearch, onLearn, onAbout }) => {
  // phase: 'portal' → 'opening' → 'open' → 'gun-seq'
  const [phase,       setPhase]       = useState('portal');
  const [crackVis,    setCrackVis]    = useState(false);
  const [crackDraw,   setCrackDraw]   = useState(false);
  const [showFlash,   setShowFlash]   = useState(false);
  const [showShock,   setShowShock]   = useState(false);
  const [barsIn,      setBarsIn]      = useState(false);
  const [gunsPos,     setGunsPos]     = useState('off'); // 'off'|'in'|'out'
  const [gunFlash,    setGunFlash]    = useState(false);
  const [cracksShow,  setCracksShow]  = useState(false);

  const particleRef   = useRef(null);
  const slashRef      = useRef(null);
  const crackCanvasRef = useRef(null);
  const cardWrapRef   = useRef(null);
  const cardRef       = useRef(null);
  const curRef        = useRef(null);
  const curRingRef    = useRef(null);
  // 3D arc gun refs — arrays of 7 (L0-L6 top-to-bottom / R0-R6)
  const gunLRefs = useRef(Array(7).fill(null));
  const gunRRefs = useRef(Array(7).fill(null));
  const mfLRefs  = useRef(Array(7).fill(null));
  const mfRRefs  = useRef(Array(7).fill(null));
  const trLRefs  = useRef(Array(7).fill(null));
  const trRRefs  = useRef(Array(7).fill(null));
  const mouseRef      = useRef({ mx: 0, my: 0, lx: 0, ly: 0 });
  const dustRef       = useRef([]);
  const rafRef        = useRef(null);

  // ── Particles ──
  useEffect(() => {
    const canvas = particleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;

    const newDust = (spread) => ({
      x: spread ? Math.random() * W : W / 2 + (Math.random() - 0.5) * 100,
      y: spread ? Math.random() * H : H,
      r: 0.5 + Math.random() * 2, vx: (Math.random() - 0.5) * 0.18,
      vy: -Math.random() * 0.25 - 0.05, a: 0.2 + Math.random() * 0.65,
      hue: 30 + Math.random() * 45, t: Math.random() * Math.PI * 2,
      ts: 0.018 + Math.random() * 0.04,
    });
    dustRef.current = Array.from({ length: 65 }, () => newDust(true));

    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    resize();
    window.addEventListener('resize', resize);
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      dustRef.current.forEach(d => {
        d.x += d.vx; d.y += d.vy; d.t += d.ts;
        if (d.y < -10 || d.x < -10 || d.x > W + 10) Object.assign(d, newDust(false));
        const f = 0.4 + 0.6 * Math.abs(Math.sin(d.t));
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},80%,85%,${d.a * f})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // ── Mouse parallax + card tilt + cursor ──
  useEffect(() => {
    if (phase !== 'portal') return;
    const onMove = (e) => { mouseRef.current.mx = e.clientX - window.innerWidth / 2; mouseRef.current.my = e.clientY - window.innerHeight / 2; };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      const { mx, my } = mouseRef.current;
      mouseRef.current.lx += (mx - mouseRef.current.lx) * 0.05;
      mouseRef.current.ly += (my - mouseRef.current.ly) * 0.05;
      const { lx, ly } = mouseRef.current;
      const bg = document.getElementById('fwh-bg');
      if (bg) bg.style.transform = `scale(1.1) translate(${lx * -0.008}%,${ly * -0.005}%)`;
      const wrap = cardWrapRef.current, card = cardRef.current;
      if (wrap && card) {
        const rect = card.getBoundingClientRect();
        const dx = (mx + window.innerWidth / 2) - rect.left - rect.width / 2;
        const dy = (my + window.innerHeight / 2) - rect.top - rect.height / 2;
        wrap.style.transform = `translate(-50%,-50%) perspective(900px) rotateX(${-(dy / window.innerHeight) * 14}deg) rotateY(${(dx / window.innerWidth) * 14}deg)`;
        card.style.setProperty('--conic-angle', (Math.atan2(dy, dx) * 180 / Math.PI) + 'deg');
        card.style.setProperty('--iri', '0.52');
      }
      const cur = curRef.current, ring = curRingRef.current;
      const ax = mx + window.innerWidth / 2, ay = my + window.innerHeight / 2;
      if (cur) { cur.style.left = ax + 'px'; cur.style.top = ay + 'px'; }
      if (ring) {
        ring.style.left = ax + 'px'; ring.style.top = ay + 'px';
        const near = Math.hypot(mx, my) < 200;
        ring.style.width = (near ? 55 : 38) + 'px'; ring.style.height = (near ? 55 : 38) + 'px';
        ring.style.borderColor = near ? 'rgba(160,100,255,0.7)' : 'rgba(160,100,255,0.28)';
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // ── Portal open (card → portal jump → nav) ──
  const openPortal = useCallback(() => {
    if (phase !== 'portal') return;
    setPhase('opening');
    setCrackVis(true);
    setTimeout(() => setCrackDraw(true), 50);
    setTimeout(() => {
      setShowShock(true); setShowFlash(true);
      dustRef.current.forEach(d => { const dx = d.x - window.innerWidth / 2, dy = d.y - window.innerHeight / 2, dist = Math.hypot(dx, dy) || 1; d.vx += (dx / dist) * (0.8 + Math.random() * 1.5); d.vy += (dy / dist) * (0.8 + Math.random() * 1.5); });
    }, 120);
    setTimeout(() => setShowFlash(false), 200);
    setTimeout(() => setShowShock(false), 700);
    setTimeout(() => { const w = cardWrapRef.current; if (w) w.classList.add('fwh-portal-open'); }, 80);
    setTimeout(() => {
      runPortalJump(slashRef.current, window.innerWidth, window.innerHeight, () => setPhase('open'));
    }, 180);
  }, [phase]);

  // ── Gun sequence (Explore → experience hub) ──
  const runGunSeq = useCallback(() => {
    if (phase !== 'open') return;
    setPhase('gun-seq');
    setBarsIn(true);

    // All 14 guns slide in — CSS transition-delay staggers by arc position
    setTimeout(() => setGunsPos('in'), 250);

    const GL = gunLRefs.current, GR = gunRRefs.current;
    const MFL = mfLRefs.current, MFR = mfRRefs.current;
    const TRL = trLRefs.current, TRR = trRRefs.current;

    // Center-out firing order: L3,R3 → L2,R4 → L4,R2 → L1,R5 → L5,R1 → L0,R6 → L6,R0
    const allGuns  = [GL[3],GR[3], GL[2],GR[4], GL[4],GR[2], GL[1],GR[5], GL[5],GR[1], GL[0],GR[6], GL[6],GR[0]];
    const allFlash = [MFL[3],MFR[3], MFL[2],MFR[4], MFL[4],MFR[2], MFL[1],MFR[5], MFL[5],MFR[1], MFL[0],MFR[6], MFL[6],MFR[0]];
    const allTrail = [TRL[3],TRR[3], TRL[2],TRR[4], TRL[4],TRR[2], TRL[1],TRR[5], TRL[5],TRR[1], TRL[0],TRR[6], TRL[6],TRR[0]];

    // 3D-aware base and kick transforms for each arc slot
    const LB = (z,r) => `translateY(-50%) translateZ(${z}px) rotateY(${r}deg)`;
    const LK = (z,r) => `translateY(-50%) translateX(-22px) translateZ(${z}px) rotateY(${r}deg)`;
    const RB = (z,r) => `translateY(-50%) translateZ(${z}px) rotateY(${-r}deg)`;
    const RK = (z,r) => `translateY(-50%) translateX(22px) translateZ(${z}px) rotateY(${-r}deg)`;
    const Lbase = [LB(-160,22),LB(-80,13),LB(-25,6),LB(0,0),LB(-25,6),LB(-80,13),LB(-160,22)];
    const Lkick = [LK(-160,22),LK(-80,13),LK(-25,6),LK(0,0),LK(-25,6),LK(-80,13),LK(-160,22)];
    const Rbase = [RB(-160,22),RB(-80,13),RB(-25,6),RB(0,0),RB(-25,6),RB(-80,13),RB(-160,22)];
    const Rkick = [RK(-160,22),RK(-80,13),RK(-25,6),RK(0,0),RK(-25,6),RK(-80,13),RK(-160,22)];

    // RECOILS in center-out order matching allGuns
    const RECOILS = [
      [Lbase[3],Lkick[3],Lbase[3]], [Rbase[3],Rkick[3],Rbase[3]],
      [Lbase[2],Lkick[2],Lbase[2]], [Rbase[4],Rkick[4],Rbase[4]],
      [Lbase[4],Lkick[4],Lbase[4]], [Rbase[2],Rkick[2],Rbase[2]],
      [Lbase[1],Lkick[1],Lbase[1]], [Rbase[5],Rkick[5],Rbase[5]],
      [Lbase[5],Lkick[5],Lbase[5]], [Rbase[1],Rkick[1],Rbase[1]],
      [Lbase[0],Lkick[0],Lbase[0]], [Rbase[6],Rkick[6],Rbase[6]],
      [Lbase[6],Lkick[6],Lbase[6]], [Rbase[0],Rkick[0],Rbase[0]],
    ];

    let shot = 0;
    const SHOTS = 42;

    const cc = crackCanvasRef.current;
    if (cc) { cc.width = window.innerWidth; cc.height = window.innerHeight; }
    setCracksShow(true);

    setTimeout(() => {
      const interval = setInterval(() => {
        const idx = shot % allGuns.length;
        const g = allGuns[idx];
        if (g) {
          g.animate(
            [{ transform: RECOILS[idx][0] }, { transform: RECOILS[idx][1] }, { transform: RECOILS[idx][2] }],
            { duration: 180, easing: 'ease-out' }
          );
        }
        const mf = allFlash[idx];
        if (mf) { mf.classList.remove('pop'); void mf.offsetWidth; mf.classList.add('pop'); }
        const tr = allTrail[idx];
        if (tr) { tr.classList.remove('fwh-trail-fire'); void tr.offsetWidth; tr.classList.add('fwh-trail-fire'); }

        if (cc) addCrackImpact(cc, shot, SHOTS);
        setGunFlash(true);
        setTimeout(() => setGunFlash(false), 45);
        document.body.classList.add('fwh-shake');
        setTimeout(() => document.body.classList.remove('fwh-shake'), 160);

        shot++;
        if (shot >= SHOTS) {
          clearInterval(interval);
          if (cc) {
            fadeToWhite(cc, () => {
              setGunsPos('out');
              setTimeout(() => {
                setBarsIn(false); setGunsPos('off'); setCracksShow(false);
                setGunFlash(false); setPhase('open');
                onExplore();
              }, 380);
            });
          } else {
            setGunsPos('out');
            setTimeout(() => {
              setBarsIn(false); setGunsPos('off'); setCracksShow(false);
              setPhase('open'); onExplore();
            }, 380);
          }
        }
      }, 95);
    }, 820);
  }, [phase, onExplore]);

  const isNavVisible = phase === 'open' || phase === 'gun-seq';

  return (
    <section className="fwh-hero" style={{ cursor: phase === 'portal' ? 'none' : 'default' }}>

      {/* Background */}
      <div id="fwh-bg" className="fwh-bg" />
      <div className="fwh-bg-overlay" />

      {/* Particles */}
      <canvas ref={particleRef} className="fwh-particle-canvas" />

      {/* Portal card */}
      {(phase === 'portal' || phase === 'opening') && (
        <div ref={cardWrapRef} className="fwh-card-wrap">
          <div ref={cardRef} className="fwh-card" onClick={openPortal} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && openPortal()}>
            <div className="fwh-card-content">
              <div className="fwh-c-title">FantasyWorld<br />Hub</div>
              <div className="fwh-c-sub">Where AI imagines with you</div>
              <div className="fwh-c-cta">Enter ✦</div>
            </div>
            <svg className={`fwh-crack-svg${crackVis ? ' visible' : ''}`} viewBox="0 0 360 215" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path className={`fwh-cp${crackDraw ? ' draw' : ''}`} d="M180,107 L162,72 L148,24" />
              <path className={`fwh-cp${crackDraw ? ' draw' : ''}`} d="M180,107 L196,62 L210,14" style={{ animationDelay: '0.05s' }} />
              <path className={`fwh-cp${crackDraw ? ' draw' : ''}`} d="M180,107 L212,124 L260,152 L316,190 M180,107 L150,130 L102,162 L50,196" style={{ animationDelay: '0.09s' }} />
              <path className={`fwh-cp${crackDraw ? ' draw' : ''}`} d="M180,107 L142,98 L80,84 M180,107 L220,97 L282,80" style={{ animationDelay: '0.06s' }} />
            </svg>
          </div>
        </div>
      )}

      {/* Portal flash + shockwave */}
      <div className={`fwh-flash${showFlash ? ' active' : ''}`} />
      <div className={`fwh-shock${showShock ? ' go' : ''}`} />

      {/* Katana slash canvas */}
      <canvas ref={slashRef} className="fwh-slash-canvas" />

      {/* v8 Nav: big center Explore + 4 corners */}
      {isNavVisible && (
        <div className={`fwh-nav-overlay${phase === 'open' ? ' show' : ''}`}>
          <button className="fwh-nb fwh-nb-explore" onClick={runGunSeq}>
            <span className="fwh-nb-icon">⚡</span>
            <span className="fwh-nb-title">Explore</span>
            <span className="fwh-nb-sub">All worlds</span>
          </button>
          <button className="fwh-nb fwh-nb-corner fwh-nb-tl" onClick={onLearn}>
            <span className="fwh-nb-icon">◎</span>
            <span className="fwh-nb-title">Learn</span>
            <span className="fwh-nb-sub">How to create</span>
          </button>
          <button className="fwh-nb fwh-nb-corner fwh-nb-tr" onClick={onCreate}>
            <span className="fwh-nb-icon">⊕</span>
            <span className="fwh-nb-title">Create</span>
            <span className="fwh-nb-sub">Build your own</span>
          </button>
          <button className="fwh-nb fwh-nb-corner fwh-nb-bl" onClick={onResearch}>
            <span className="fwh-nb-icon">◈</span>
            <span className="fwh-nb-title">Research</span>
            <span className="fwh-nb-sub">AI creativity map</span>
          </button>
          <button className="fwh-nb fwh-nb-corner fwh-nb-br" onClick={onAbout}>
            <span className="fwh-nb-icon">◇</span>
            <span className="fwh-nb-title">About</span>
            <span className="fwh-nb-sub">The vision</span>
          </button>
        </div>
      )}

      {/* ── Gun sequence elements ── */}
      <div className={`fwh-cin-bar fwh-cin-top${barsIn ? ' in' : ''}`} />
      <div className={`fwh-cin-bar fwh-cin-bot${barsIn ? ' in' : ''}`} />

      {/* ── 3D arc gun arena ── */}
      {(() => {
        // L: Sniper RPG AR Plasma Shotgun Plasma Plasma  (top→bottom)
        // R: Plasma AR Shotgun RPG Plasma Sniper Plasma
        const LG = [SniperRifle, RPGLauncher, AssaultRifle, PlasmaGun, Shotgun, PlasmaGun, PlasmaGun];
        const RG = [PlasmaGun, AssaultRifle, Shotgun, RPGLauncher, PlasmaGun, SniperRifle, PlasmaGun];
        const cls = gunsPos === 'in' ? ' in' : gunsPos === 'out' ? ' out' : '';
        return (
          <div className="fwh-gun-arena">
            {[0,1,2,3,4,5,6].map(i => {
              const LGun = LG[i], RGun = RG[i];
              return (
                <React.Fragment key={i}>
                  <div ref={el => { gunLRefs.current[i] = el; }} className={`fwh-gun fwh-gun-a-l${i}${cls}`}><LGun /></div>
                  <div ref={el => { gunRRefs.current[i] = el; }} className={`fwh-gun fwh-gun-a-r${i}${cls}`}><RGun mirror /></div>
                </React.Fragment>
              );
            })}
          </div>
        );
      })()}

      {/* Muzzle flashes */}
      {[0,1,2,3,4,5,6].map(i => {
        const LFlash = [BulletFlash, ExplosiveFlash, BulletFlash, PlasmaMuzzleFlash, ExplosiveFlash, PlasmaMuzzleFlash, PlasmaMuzzleFlash][i];
        const RFlash = [PlasmaMuzzleFlash, BulletFlash, ExplosiveFlash, ExplosiveFlash, PlasmaMuzzleFlash, BulletFlash, PlasmaMuzzleFlash][i];
        return (
          <React.Fragment key={i}>
            <div className={`fwh-mflash fwh-mflash-a-l${i}`}>
              <div ref={el => { mfLRefs.current[i] = el; }} className="fwh-mflash-inner"><LFlash /></div>
            </div>
            <div className={`fwh-mflash fwh-mflash-a-r${i}`}>
              <div ref={el => { mfRRefs.current[i] = el; }} className="fwh-mflash-inner"><RFlash /></div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Bullet trails */}
      {[0,1,2,3,4,5,6].map(i => (
        <React.Fragment key={i}>
          <div ref={el => { trLRefs.current[i] = el; }} className={`fwh-trail fwh-trail-a-l${i}`} />
          <div ref={el => { trRRefs.current[i] = el; }} className={`fwh-trail fwh-trail-a-r${i}`} />
        </React.Fragment>
      ))}

      <div className={`fwh-gun-flash${gunFlash ? ' active' : ''}`} />
      <canvas ref={crackCanvasRef} className={`fwh-crack-canvas${cracksShow ? ' show' : ''}`} />

      {/* Custom cursor (portal phase only) */}
      {phase === 'portal' && (
        <>
          <div ref={curRef}     className="fwh-cur" />
          <div ref={curRingRef} className="fwh-cur-ring" />
        </>
      )}
    </section>
  );
};

export default HeroSection;
