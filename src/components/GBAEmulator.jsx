import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/gba-emulator.css';

const EJS_PATH = '/emulatorjs/';

const CORE_MAP = {
  gba: 'mgba',
  gb: 'gambatte', gbc: 'gambatte',
  nes: 'fceumm',
  smc: 'snes9x', sfc: 'snes9x',
  n64: 'mupen64plus_next', z64: 'mupen64plus_next', v64: 'mupen64plus_next',
  nds: 'melonds',
  gen: 'genesis_plus_gx', md: 'genesis_plus_gx',
  bin: 'pcsx_rearmed', cue: 'pcsx_rearmed',
};

const SYSTEM_LABEL = {
  gba: 'Game Boy Advance',
  gb: 'Game Boy', gbc: 'Game Boy Color',
  nes: 'NES',
  smc: 'SNES', sfc: 'SNES',
  n64: 'Nintendo 64', z64: 'Nintendo 64', v64: 'Nintendo 64',
  nds: 'Nintendo DS',
  gen: 'Sega Genesis', md: 'Sega Genesis',
  bin: 'PlayStation', cue: 'PlayStation',
};

function getExt(f) { return f.split('.').pop().toLowerCase(); }
function getCore(f) { return CORE_MAP[getExt(f)] || 'mgba'; }
function getSystemLabel(f) { return SYSTEM_LABEL[getExt(f)] || 'Unknown'; }

function cleanupEmulator() {
  const loader = document.getElementById('ejs-loader-script');
  if (loader) loader.remove();
  const style = document.getElementById('ejs-style');
  if (style) style.remove();
  ['EJS_player','EJS_gameUrl','EJS_core','EJS_pathtodata','EJS_color',
   'EJS_startOnLoaded','EJS_gameName','EJS_emulator','EJS_onGameStart',
   'EJS_onSaveState','EJS_onLoadState',
  ].forEach(k => { try { delete window[k]; } catch {} });
}

// ── Save state helpers ──────────────────────────────────────────────────────

const SS_KEY = (f) => `fw_ss_${f}`;
const MAX_SLOTS = 3;

function loadSlots(romFile) {
  try { return JSON.parse(localStorage.getItem(SS_KEY(romFile)) || 'null') || []; }
  catch { return []; }
}

function persistSlots(romFile, slots) {
  localStorage.setItem(SS_KEY(romFile), JSON.stringify(slots));
}

function stateToBase64(data) {
  try {
    const bytes = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  } catch { return null; }
}

function base64ToBytes(b64) {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch { return null; }
}

// ── Main component ──────────────────────────────────────────────────────────

export default function GBAEmulator({ onStop }) {
  const [roms, setRoms] = useState([]);
  const [selectedRom, setSelectedRom] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [slots, setSlots] = useState([null, null, null]);
  const [slotAction, setSlotAction] = useState(null); // { idx, type: 'load'|'overwrite' }
  const [flash, setFlash] = useState(null);
  const playerRef = useRef(null);
  const flashTimer = useRef(null);

  useEffect(() => {
    fetch('/roms/manifest.json')
      .then(r => r.json())
      .then(d => setRoms(Array.isArray(d) ? d : []))
      .catch(() => setRoms([]));
  }, []);

  useEffect(() => { return () => cleanupEmulator(); }, []);

  useEffect(() => {
    if (selectedRom) {
      const saved = loadSlots(selectedRom.file);
      setSlots([saved[0] || null, saved[1] || null, saved[2] || null]);
    } else {
      setSlots([null, null, null]);
    }
    setSlotAction(null);
  }, [selectedRom?.file]);

  const showFlash = useCallback((msg) => {
    clearTimeout(flashTimer.current);
    setFlash(msg);
    flashTimer.current = setTimeout(() => setFlash(null), 2500);
  }, []);

  const launchGame = useCallback((rom) => {
    setLoadError(null);
    setPlaying(true);
    setTimeout(() => {
      cleanupEmulator();
      window.EJS_player = '#ds-game-screen';
      window.EJS_gameUrl = `/roms/${rom.file}`;
      window.EJS_core = getCore(rom.file);
      window.EJS_pathtodata = EJS_PATH;
      window.EJS_color = '#1a6aff';
      window.EJS_startOnLoaded = true;
      window.EJS_gameName = rom.name;
      const script = document.createElement('script');
      script.id = 'ejs-loader-script';
      script.src = `${EJS_PATH}loader.js`;
      script.onerror = () => setLoadError('Failed to load emulator. Check public/emulatorjs/.');
      document.body.appendChild(script);
    }, 80);
  }, []);

  const exitGame = useCallback(() => {
    try { window.EJS_emulator?.gameManager?.saveSaveFiles(); } catch {}
    setTimeout(() => {
      cleanupEmulator();
      setPlaying(false);
    }, 600);
  }, []);

  const doSave = useCallback((idx) => {
    setSlotAction(null);
    try {
      const data = window.EJS_emulator?.gameManager?.saveState?.();
      if (!data) { showFlash('Start the game first to save'); return; }
      const b64 = stateToBase64(data);
      if (!b64) { showFlash('Save failed'); return; }
      const slot = {
        label: `Slot ${idx + 1}`,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
        data: b64,
      };
      const next = [...slots];
      next[idx] = slot;
      setSlots(next);
      persistSlots(selectedRom.file, next);
      showFlash(`Saved to Slot ${idx + 1}`);
    } catch {
      showFlash('Save failed');
    }
  }, [slots, selectedRom, showFlash]);

  const doLoad = useCallback((idx) => {
    setSlotAction(null);
    try {
      const slot = slots[idx];
      if (!slot) return;
      const bytes = base64ToBytes(slot.data);
      if (!bytes) { showFlash('Load failed'); return; }
      window.EJS_emulator?.gameManager?.loadState?.(bytes);
      showFlash(`Loaded Slot ${idx + 1}`);
    } catch {
      showFlash('Load failed');
    }
  }, [slots, showFlash]);

  const handleSlotTap = (idx) => {
    if (!playing) return;
    if (slots[idx]) {
      setSlotAction({ idx, type: 'filled' });
    } else {
      doSave(idx);
    }
  };

  return (
    <div className="ds-body">
      <div className="ds-shell">

        {/* ── Top half — main screen ── */}
        <div className="ds-top-half">
          <div className="ds-shoulder-bar">
            <div className="ds-shoulder-btn">L</div>
            <span className="ds-brand">NINTENDO DS</span>
            <div className="ds-shoulder-btn">R</div>
          </div>

          <div className="ds-top-bezel">
            <div className="ds-led" />
            {playing ? (
              <div className="ds-top-screen ds-screen-game">
                {loadError && (
                  <div className="ds-error">
                    <span>⚠️ {loadError}</span>
                    <button onClick={exitGame}>Back</button>
                  </div>
                )}
                <div id="ds-game-screen" ref={playerRef} />
              </div>
            ) : (
              <div className="ds-top-screen ds-screen-idle">
                <div className="ds-idle-icon">🎮</div>
                <div className="ds-idle-title">Game Library</div>
                {selectedRom ? (
                  <div className="ds-idle-ready">
                    <div className="ds-idle-game">{selectedRom.name}</div>
                    <div className="ds-idle-sys">{getSystemLabel(selectedRom.file)}</div>
                    <button className="ds-play-btn" onClick={() => launchGame(selectedRom)}>▶ Play</button>
                  </div>
                ) : (
                  <div className="ds-idle-hint">Pick a game below ↓</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Hinge ── */}
        <div className="ds-hinge">
          <div className="ds-hinge-pill left" />
          <div className="ds-hinge-pill right" />
        </div>

        {/* ── Bottom half — touch screen + controls ── */}
        <div className="ds-bottom-half">
          <div className="ds-controls-row">

            {/* D-pad */}
            <div className="ds-dpad">
              <div className="ds-dpad-v" />
              <div className="ds-dpad-h" />
              <div className="ds-dpad-center" />
            </div>

            {/* Bottom screen */}
            <div className="ds-bottom-bezel">
              {flash && <div className="ds-flash">{flash}</div>}

              {playing ? (
                /* ── Save state manager ── */
                <div className="ds-bottom-screen">
                  <div className="ds-ss-title">Save States</div>
                  <div className="ds-ss-list">
                    {slots.map((slot, idx) => {
                      if (slotAction?.idx === idx) {
                        return (
                          <div key={idx} className="ds-ss-slot ds-ss-confirming">
                            <span className="ds-ss-confirm-q">
                              {slotAction.type === 'filled' ? `Slot ${idx + 1} — what do you want?` : ''}
                            </span>
                            <div className="ds-ss-confirm-row">
                              <button className="ds-ss-action-btn load" onClick={() => doLoad(idx)}>Load</button>
                              <button className="ds-ss-action-btn save" onClick={() => doSave(idx)}>Overwrite</button>
                              <button className="ds-ss-action-btn cancel" onClick={() => setSlotAction(null)}>✕</button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <button key={idx} className={`ds-ss-slot${slot ? ' ds-ss-filled' : ' ds-ss-empty'}`} onClick={() => handleSlotTap(idx)}>
                          <span className="ds-ss-slot-num">Slot {idx + 1}</span>
                          {slot
                            ? <span className="ds-ss-slot-date">{slot.date}</span>
                            : <span className="ds-ss-slot-empty">— empty —</span>
                          }
                        </button>
                      );
                    })}
                  </div>
                  <div className="ds-ss-hint">Tap a slot to save · tap a filled slot to load or overwrite</div>
                </div>
              ) : (
                /* ── ROM selector ── */
                <div className="ds-bottom-screen">
                  <div className="ds-rom-list">
                    {roms.length === 0 ? (
                      <div className="ds-no-roms">No ROMs — add files to public/roms/</div>
                    ) : roms.map(rom => (
                      <button
                        key={rom.file}
                        className={`ds-rom-row${selectedRom?.file === rom.file ? ' ds-rom-selected' : ''}`}
                        onClick={() => setSelectedRom(selectedRom?.file === rom.file ? null : rom)}
                      >
                        <span className="ds-rom-name">{rom.name}</span>
                        <span className="ds-rom-sys">{getSystemLabel(rom.file)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ABXY */}
            <div className="ds-abxy">
              <div className="ds-btn-x">X</div>
              <div className="ds-btn-mid-row">
                <div className="ds-btn-y">Y</div>
                <div className="ds-btn-a">A</div>
              </div>
              <div className="ds-btn-b">B</div>
            </div>

          </div>

          {/* Start / Select / Quit */}
          <div className="ds-bottom-bar">
            <button className="ds-sys-btn" onClick={() => { setSelectedRom(null); setSlotAction(null); }}>SELECT</button>
            {playing
              ? <button className="ds-sys-btn ds-back-btn" onClick={exitGame}>BACK</button>
              : <button className="ds-sys-btn ds-quit-btn" onClick={onStop}>QUIT</button>
            }
          </div>
        </div>

      </div>
    </div>
  );
}
