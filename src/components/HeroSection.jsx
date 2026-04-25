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
//  Portal Jump
// ─────────────────────────────────────────────────────────────
function runPortalJump(canvas, W, H, onComplete) {
  if (!canvas) { if (onComplete) onComplete(); return; }
  canvas.width = W; canvas.height = H;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const TOTAL = 950;
  let start = null;
  const cx = W / 2, cy = H / 2, MIN = Math.min(W, H);

  function frame(ts) {
    if (!start) start = ts;
    const p = Math.min(1, (ts - start) / TOTAL);
    ctx.clearRect(0, 0, W, H);

    if (p < 0.62) {
      const pp = p / 0.62;
      const scale = 1 + pp * pp * 9;
      const rot = pp * Math.PI * 1.8;
      ctx.save();
      ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
      ctx.fillStyle = '#05001a'; ctx.fillRect(0, 0, W, H);
      ctx.translate(cx, cy); ctx.rotate(rot);
      for (let r = 6; r >= 1; r--) {
        const radius = (r / 6) * MIN * 0.38;
        const hue = 255 + r * 18 + pp * 120;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.65, `hsla(${hue},100%,68%,${0.18 + r * 0.05})`);
        g.addColorStop(1, `hsla(${hue + 25},100%,80%,${0.55 + pp * 0.3})`);
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * MIN * 0.36, Math.sin(a) * MIN * 0.36);
        ctx.strokeStyle = `hsla(${270 + i * 22},100%,82%,${0.14 + pp * 0.22})`;
        ctx.lineWidth = 1.5 + pp * 4; ctx.stroke();
      }
      ctx.restore();
      const eg = ctx.createRadialGradient(cx, cy, 0, cx, cy, MIN * (0.06 + pp * 0.12));
      eg.addColorStop(0, `rgba(255,255,255,${0.7 + pp * 0.3})`);
      eg.addColorStop(0.5, `rgba(200,150,255,${pp * 0.4})`);
      eg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = eg; ctx.fillRect(0, 0, W, H);
    } else {
      const wp = (p - 0.62) / 0.38;
      ctx.fillStyle = `rgba(255,255,255,${1 - Math.pow(1 - wp, 2)})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (p >= 1) {
      canvas.style.display = 'none';
      if (onComplete) onComplete();
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
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

// ─────────────────────────────────────────────────────────────
//  Screen crack drawer (gun sequence)
// ─────────────────────────────────────────────────────────────
function drawScreenCracks(canvas) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const impacts = [{ x: W * 0.34, y: H * 0.48 }, { x: W * 0.66, y: H * 0.52 }];
  impacts.forEach(ip => {
    for (let i = 0; i < 22; i++) {
      const ang = (i / 22) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const len = 90 + Math.random() * 260;
      ctx.save();
      ctx.strokeStyle = `rgba(0,240,255,${0.30 + Math.random() * 0.45})`;
      ctx.lineWidth = 0.8 + Math.random() * 1.5;
      ctx.shadowColor = 'rgba(0,220,255,0.7)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(ip.x, ip.y);
      let cx2 = ip.x, cy2 = ip.y;
      const segs = 3 + Math.floor(Math.random() * 3);
      for (let s = 0; s < segs; s++) {
        const sL = len / segs, j = (Math.random() - 0.5) * 35;
        cx2 += Math.cos(ang) * sL; cy2 += Math.sin(ang) * sL;
        ctx.lineTo(cx2 + j, cy2 + j * 0.5);
      }
      ctx.stroke(); ctx.restore();
    }
    const g = ctx.createRadialGradient(ip.x, ip.y, 0, ip.x, ip.y, 70);
    g.addColorStop(0, 'rgba(0,240,255,0.50)'); g.addColorStop(0.4, 'rgba(0,200,255,0.16)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ip.x, ip.y, 70, 0, Math.PI * 2); ctx.fill();
  });
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
  const [veilShow,    setVeilShow]    = useState(false);

  const particleRef   = useRef(null);
  const slashRef      = useRef(null);
  const crackCanvasRef = useRef(null);
  const cardWrapRef   = useRef(null);
  const cardRef       = useRef(null);
  const curRef        = useRef(null);
  const curRingRef    = useRef(null);
  const gunLRef       = useRef(null);
  const gunRRef       = useRef(null);
  const mflRef        = useRef(null);
  const mfrRef        = useRef(null);
  const btlRef        = useRef(null);
  const btrRef        = useRef(null);
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
    setTimeout(() => setGunsPos('in'), 400);
    setTimeout(() => {
      // Recoil (imperative - needs force reflow to retrigger animation)
      [gunLRef, gunRRef].forEach(ref => {
        if (!ref.current) return;
        ref.current.classList.remove('fwh-gun-fire');
        void ref.current.offsetWidth;
        ref.current.classList.add('fwh-gun-fire');
      });
      // Muzzle flash
      [mflRef, mfrRef].forEach(ref => {
        if (!ref.current) return;
        ref.current.classList.remove('pop');
        void ref.current.offsetWidth;
        ref.current.classList.add('pop');
      });
      // Plasma trails
      [btlRef, btrRef].forEach(ref => {
        if (!ref.current) return;
        ref.current.classList.remove('fwh-trail-fire');
        void ref.current.offsetWidth;
        ref.current.classList.add('fwh-trail-fire');
      });
      setGunFlash(true);
      document.body.classList.add('fwh-shake');
      setTimeout(() => document.body.classList.remove('fwh-shake'), 400);
    }, 1800);
    setTimeout(() => setGunFlash(false), 1880);
    setTimeout(() => {
      const cc = crackCanvasRef.current;
      if (cc) { cc.width = window.innerWidth; cc.height = window.innerHeight; drawScreenCracks(cc); }
      setCracksShow(true);
    }, 1920);
    setTimeout(() => setGunsPos('out'), 2400);
    setTimeout(() => setVeilShow(true), 2600);
    setTimeout(() => {
      setBarsIn(false); setGunsPos('off'); setCracksShow(false); setVeilShow(false);
      setPhase('open');
      onExplore();
    }, 3200);
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

      <div ref={gunLRef} className={`fwh-gun fwh-gun-l${gunsPos === 'in' ? ' in' : ''}${gunsPos === 'out' ? ' out' : ''}`}>
        <PlasmaGun />
      </div>
      <div ref={gunRRef} className={`fwh-gun fwh-gun-r${gunsPos === 'in' ? ' in' : ''}${gunsPos === 'out' ? ' out' : ''}`}>
        <PlasmaGun mirror />
      </div>

      <div className="fwh-mflash fwh-mflash-l">
        <div ref={mflRef} className="fwh-mflash-inner"><PlasmaMuzzleFlash /></div>
      </div>
      <div className="fwh-mflash fwh-mflash-r">
        <div ref={mfrRef} className="fwh-mflash-inner"><PlasmaMuzzleFlash /></div>
      </div>

      <div ref={btlRef} className="fwh-trail fwh-trail-l" />
      <div ref={btrRef} className="fwh-trail fwh-trail-r" />

      <div className={`fwh-gun-flash${gunFlash ? ' active' : ''}`} />
      <canvas ref={crackCanvasRef} className={`fwh-crack-canvas${cracksShow ? ' show' : ''}`} />
      <div className={`fwh-veil${veilShow ? ' show' : ''}`} />

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
