import React, { useState, useCallback, useMemo } from 'react';
import useDreamComicContent from '../hooks/useDreamComicContent';

const STARS = Array.from({ length: 50 }, (_, i) => ({
  left   : `${(i * 7.3 + 13) % 100}%`,
  top    : `${(i * 5.7 + 7)  % 100}%`,
  size   : (i % 3) + 1,
  opacity: 0.1 + (i % 6) * 0.1
}));

export default function DreamComicExperience({ onStop }) {
  const { generateContent, error, progress } = useDreamComicContent();
  const [phase, setPhase] = useState('idle'); // idle | sleeping | generating | dreaming | wakeup
  const [comic, setComic] = useState(null);

  const startDream = useCallback(async () => {
    setPhase('sleeping');
    setComic(null);
    await new Promise(r => setTimeout(r, 1800));
    setPhase('generating');
    try {
      const result = await generateContent();
      setComic(result);
      setPhase('dreaming');
    } catch {
      setPhase('idle');
    }
  }, [generateContent]);

  const handleWakeUp = useCallback(() => {
    setPhase('wakeup');
    setTimeout(() => setPhase('idle'), 2000);
  }, []);

  // ── IDLE ──────────────────────────────────────────────────────
  if (phase === 'idle') return (
    <div style={{ position:'fixed', inset:0, background:'#0d0a1a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Georgia','Times New Roman',serif", zIndex:100 }}>
      <button onClick={onStop} style={{ position:'absolute', top:22, left:24, background:'none', border:'1px solid rgba(180,130,255,0.3)', color:'rgba(180,130,255,0.6)', padding:'7px 18px', borderRadius:6, cursor:'pointer', fontSize:13, letterSpacing:1 }}>← Back</button>

      {/* Stars */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {STARS.map((s, i) => (
          <div key={i} style={{ position:'absolute', left:s.left, top:s.top, width:s.size, height:s.size, background:'#fff', borderRadius:'50%', opacity:s.opacity }} />
        ))}
      </div>

      <div style={{ textAlign:'center', zIndex:2 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🌙</div>
        <div style={{ fontSize:30, fontWeight:700, color:'#fff', letterSpacing:5, marginBottom:8, textTransform:'uppercase' }}>Dream Comics</div>
        <div style={{ fontSize:13, color:'rgba(180,130,255,0.6)', letterSpacing:3, marginBottom:8 }}>CLOSE YOUR EYES</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginBottom:40, maxWidth:320, lineHeight:1.7 }}>
          Every dream is different. Some are weird.<br />Some are much, much weirder.
        </div>
        {error && <div style={{ color:'rgba(255,100,100,0.8)', fontSize:13, marginBottom:16 }}>Something went wrong. Try again.</div>}
        <button
          onClick={startDream}
          style={{ background:'rgba(140,80,255,0.12)', border:'1px solid rgba(140,80,255,0.55)', color:'rgba(200,160,255,0.95)', padding:'14px 52px', borderRadius:8, cursor:'pointer', fontSize:16, letterSpacing:4, fontFamily:'inherit', transition:'all 0.2s', textTransform:'uppercase' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(140,80,255,0.28)'; e.currentTarget.style.borderColor='rgba(140,80,255,0.9)'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(140,80,255,0.12)'; e.currentTarget.style.borderColor='rgba(140,80,255,0.55)'; e.currentTarget.style.color='rgba(200,160,255,0.95)'; }}
        >
          💤 Fall Asleep
        </button>
      </div>
      <style>{`@keyframes twinkle{0%,100%{opacity:0.1}50%{opacity:0.7}}`}</style>
    </div>
  );

  // ── SLEEPING ──────────────────────────────────────────────────
  if (phase === 'sleeping') return (
    <div style={{ position:'fixed', inset:0, background:'#06040f', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Georgia',serif", zIndex:100 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:72, marginBottom:20, animation:'float 2s ease-in-out infinite' }}>😴</div>
        <div style={{ fontSize:28, color:'rgba(180,130,255,0.45)', letterSpacing:10, animation:'zzz 1.5s ease-in-out infinite' }}>z z z</div>
      </div>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes zzz{0%{opacity:0.2;transform:translateY(0)}50%{opacity:0.9;transform:translateY(-8px)}100%{opacity:0.2;transform:translateY(-20px)}}
      `}</style>
    </div>
  );

  // ── GENERATING ────────────────────────────────────────────────
  if (phase === 'generating') return (
    <div style={{ position:'fixed', inset:0, background:'#06040f', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Georgia',serif", zIndex:100 }}>
      <div style={{ textAlign:'center', color:'rgba(180,130,255,0.85)' }}>
        <div style={{ width:56, height:56, border:'3px solid rgba(140,80,255,0.15)', borderTop:'3px solid rgba(140,80,255,0.9)', borderRadius:'50%', margin:'0 auto 28px', animation:'spin 0.9s linear infinite' }} />
        <div style={{ fontSize:17, letterSpacing:4, marginBottom:12, animation:'pulse 2s ease-in-out infinite' }}>DREAMING…</div>
        {progress.total > 0 && progress.current > 0
          ? <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', letterSpacing:2 }}>Drawing panel {progress.current} of {progress.total}</div>
          : <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', letterSpacing:2 }}>Crafting your story…</div>
        }
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
      `}</style>
    </div>
  );

  // ── WAKE UP flash ─────────────────────────────────────────────
  if (phase === 'wakeup') return (
    <div style={{ position:'fixed', inset:0, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
      <div style={{ fontSize:'clamp(28px,5vw,66px)', fontWeight:900, color:'#0d0a1a', textTransform:'uppercase', letterSpacing:4, textAlign:'center', animation:'shake 0.5s ease-out' }}>
        YOU WAKE UP!
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-7px)}80%{transform:translateX(7px)}}`}</style>
    </div>
  );

  // ── DREAMING — comic book ─────────────────────────────────────
  if (phase === 'dreaming' && comic) {
    const isACK     = comic.style === 'amar-chitra-katha';
    const accent    = isACK ? '#c94a0a' : '#1a5fff';
    const styleName = isACK ? 'AMAR CHITRA KATHA' : 'ANIME';

    return (
      <div style={{ position:'fixed', inset:0, background:'#0d0a1a', overflowY:'auto', fontFamily:"'Georgia','Times New Roman',serif", zIndex:100 }}>

        {/* Fixed back button */}
        <button onClick={onStop} style={{ position:'fixed', top:22, left:24, zIndex:200, background:'rgba(0,0,0,0.65)', border:'1px solid rgba(180,130,255,0.3)', color:'rgba(180,130,255,0.6)', padding:'7px 18px', borderRadius:6, cursor:'pointer', fontSize:13, letterSpacing:1, backdropFilter:'blur(8px)' }}>← Back</button>

        {/* Comic page */}
        <div style={{ maxWidth:920, margin:'0 auto', padding:'72px 16px 60px' }}>
          <div style={{ background:'#faf7f0', boxShadow:'0 12px 80px rgba(0,0,0,0.85)', borderRadius:2, overflow:'hidden' }}>

            {/* Title banner */}
            <div style={{ background:'#1a0a2e', padding:'22px 28px', borderBottom:`4px solid ${accent}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                <div style={{ fontSize:'clamp(18px,3.5vw,34px)', fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:'0.06em', lineHeight:1.2 }}>{comic.title}</div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:'#fff', background:accent, padding:'5px 11px', borderRadius:3, whiteSpace:'nowrap', flexShrink:0 }}>{styleName}</div>
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', letterSpacing:2, textTransform:'uppercase', marginTop:6 }}>{comic.setting}</div>
            </div>

            {/* Panels 1–4: 2-column grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', border:`3px solid #1a0a2e`, borderTop:'none', borderBottom:'none' }}>
              {comic.panels.slice(0, 4).map((panel, i) => (
                <div key={i} style={{ borderRight: i % 2 === 0 ? `3px solid #1a0a2e` : 'none', borderBottom:`3px solid #1a0a2e`, display:'flex', flexDirection:'column' }}>
                  <div style={{ background:'#1a0a2e', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:2, padding:'3px 8px' }}>PANEL {i + 1}</div>
                  <img src={panel.imageUrl} alt={`Panel ${i + 1}`} style={{ width:'100%', display:'block', aspectRatio:'1/1', objectFit:'cover' }} />
                  <div style={{ padding:'10px 14px 14px', background:'#faf7f0', flex:1 }}>
                    {panel.caption && (
                      <div style={{ background:'#fffde7', border:'1.5px solid #555', padding:'5px 9px', fontSize:11, fontStyle:'italic', color:'#333', marginBottom:7, lineHeight:1.5 }}>
                        {panel.caption}
                      </div>
                    )}
                    {panel.dialogue && (
                      <div style={{ background:'#fff', border:'1.5px solid #333', borderRadius:4, padding:'5px 9px', fontSize:11, color:'#111', fontWeight:600, lineHeight:1.4 }}>
                        {panel.dialogue}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Panel 5 — full width, alarming red */}
            {comic.panels[4] && (
              <div style={{ border:`3px solid #bb0000`, borderTop:'none' }}>
                <div style={{ background:'#bb0000', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:3, padding:'4px 12px' }}>
                  FINAL PANEL — ⚠ WAKING UP INCOMING
                </div>
                <img src={comic.panels[4].imageUrl} alt="Final panel" style={{ width:'100%', display:'block', maxHeight:520, objectFit:'cover' }} />
                <div style={{ padding:'14px 20px 18px', background:'#fff8f8' }}>
                  {comic.panels[4].caption && (
                    <div style={{ background:'#ffe0e0', border:'1.5px solid #aa0000', padding:'6px 10px', fontSize:12, fontStyle:'italic', color:'#550000', marginBottom:8, lineHeight:1.5 }}>
                      {comic.panels[4].caption}
                    </div>
                  )}
                  {comic.panels[4].dialogue && (
                    <div style={{ background:'#fff', border:'1.5px solid #880000', borderRadius:4, padding:'6px 10px', fontSize:12, color:'#330000', fontWeight:700, lineHeight:1.4 }}>
                      {comic.panels[4].dialogue}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wake up section */}
            <div style={{ background:'#1a0a2e', padding:'28px 32px', textAlign:'center', borderTop:'4px solid #bb0000' }}>
              <div style={{ fontSize:'clamp(13px,1.8vw,16px)', color:'rgba(255,210,210,0.9)', fontStyle:'italic', lineHeight:1.7, maxWidth:580, margin:'0 auto 28px' }}>
                {comic.wakeUpText}
              </div>
              <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
                <button
                  onClick={handleWakeUp}
                  style={{ background:'#bb0000', border:'none', color:'#fff', padding:'14px 44px', borderRadius:6, cursor:'pointer', fontSize:15, fontWeight:700, letterSpacing:3, fontFamily:'inherit', transition:'background 0.2s', textTransform:'uppercase' }}
                  onMouseEnter={e => e.currentTarget.style.background='#ee0000'}
                  onMouseLeave={e => e.currentTarget.style.background='#bb0000'}
                >
                  😱 Wake Up!
                </button>
                <button
                  onClick={startDream}
                  style={{ background:'none', border:'1px solid rgba(140,80,255,0.5)', color:'rgba(180,130,255,0.9)', padding:'14px 44px', borderRadius:6, cursor:'pointer', fontSize:15, letterSpacing:2, fontFamily:'inherit', transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(140,80,255,0.15)'; e.currentTarget.style.color='#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='rgba(180,130,255,0.9)'; }}
                >
                  💤 New Dream
                </button>
              </div>
            </div>

          </div>
        </div>
        <style>{`@media(max-width:560px){.comic-grid{grid-template-columns:1fr!important}}`}</style>
      </div>
    );
  }

  return null;
}
