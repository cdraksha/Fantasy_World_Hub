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

function getExt(filename) {
  return filename.split('.').pop().toLowerCase();
}
function getCore(filename) {
  return CORE_MAP[getExt(filename)] || 'mgba';
}
function getSystemLabel(filename) {
  return SYSTEM_LABEL[getExt(filename)] || 'Unknown';
}

function cleanupEmulator() {
  const loader = document.getElementById('ejs-loader-script');
  if (loader) loader.remove();
  const style = document.getElementById('ejs-style');
  if (style) style.remove();
  [
    'EJS_player', 'EJS_gameUrl', 'EJS_core', 'EJS_pathtodata',
    'EJS_color', 'EJS_startOnLoaded', 'EJS_gameName', 'EJS_emulator',
    'EJS_onGameStart', 'EJS_onSaveState', 'EJS_onLoadState',
  ].forEach(k => { try { delete window[k]; } catch {} });
}

export default function GBAEmulator({ onStop }) {
  const [roms, setRoms] = useState([]);
  const [selectedRom, setSelectedRom] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const playerRef = useRef(null);

  useEffect(() => {
    fetch('/roms/manifest.json')
      .then(r => r.json())
      .then(data => setRoms(Array.isArray(data) ? data : []))
      .catch(() => setRoms([]));
  }, []);

  useEffect(() => {
    return () => cleanupEmulator();
  }, []);

  const launchGame = useCallback((rom) => {
    setLoadError(null);
    setPlaying(true);

    setTimeout(() => {
      cleanupEmulator();
      window.EJS_player = '#emu-player';
      window.EJS_gameUrl = `/roms/${rom.file}`;
      window.EJS_core = getCore(rom.file);
      window.EJS_pathtodata = EJS_PATH;
      window.EJS_color = '#FFCB05';
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
    // Flush SRAM to IndexedDB before tearing down the emulator
    try {
      window.EJS_emulator?.gameManager?.saveSaveFiles();
    } catch(e) {}
    setTimeout(() => {
      cleanupEmulator();
      setPlaying(false);
      setSelectedRom(null);
    }, 600);
  }, []);

  return (
    <div className="gba-body">
      <div className="gba-shell">

        {/* ── Left panel ── */}
        <div className="gba-left-panel">
          <div className="gba-shoulder-l">L</div>
          <div className="gba-led" />
          <div className="gba-dpad">
            <div className="gba-dpad-v" />
            <div className="gba-dpad-h" />
            <div className="gba-dpad-center" />
          </div>
          <div className="gba-select-btn">SELECT</div>
        </div>

        {/* ── Screen section ── */}
        <div className="gba-screen-section">
          <div className="gba-bezel">

            {playing ? (
              /* Player mode — EmulatorJS fills the screen */
              <div className="gba-screen emu-active-screen">
                {loadError && (
                  <div className="emu-error">
                    <span>⚠️ {loadError}</span>
                    <button onClick={exitGame}>Go Back</button>
                  </div>
                )}
                <div id="emu-player" ref={playerRef} />
              </div>
            ) : (
              /* Selector mode */
              <div className="gba-screen">
                <div className="gba-screen-header emu-sel-header">
                  <div className="emu-sel-title">🎮 Game Library</div>
                  <div className="emu-sel-sub">Select a game · save states auto-stored</div>
                </div>

                <div className="gba-screen-content">
                  {roms.length === 0 ? (
                    <div className="emu-empty">
                      <div className="emu-empty-icon">📂</div>
                      <div className="emu-empty-title">No ROMs loaded yet</div>
                      <div className="emu-empty-body">
                        Drop ROM files into <code>public/roms/</code> and update the manifest.
                      </div>
                    </div>
                  ) : (
                    <div className="emu-game-grid">
                      {roms.map(rom => (
                        <button
                          key={rom.file}
                          className={`emu-game-card${selectedRom?.file === rom.file ? ' selected' : ''}`}
                          onClick={() => setSelectedRom(selectedRom?.file === rom.file ? null : rom)}
                        >
                          <div className="emu-game-icon">
                            {rom.cover
                              ? <img src={rom.cover} alt={rom.name} className="emu-game-cover" />
                              : <span className="emu-game-emoji">🕹️</span>
                            }
                          </div>
                          <div className="emu-game-name">{rom.name}</div>
                          <div className="emu-game-system">{getSystemLabel(rom.file)}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedRom && (
                  <div className="emu-sel-launch">
                    <div className="emu-launch-info">
                      <span className="emu-launch-name">{selectedRom.name}</span>
                      <span className="emu-launch-system">{getSystemLabel(selectedRom.file)}</span>
                    </div>
                    <button className="emu-launch-btn" onClick={() => launchGame(selectedRom)}>
                      ▶ Play
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="gba-brand-bar">
            <span className="gba-brand-text">Nintendo Game Boy Advance SP</span>
            <span className="gba-brand-sub">GAME LIBRARY</span>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="gba-right-panel">
          <div className="gba-shoulder-r">R</div>
          <div className="gba-ab-group">
            <div className="gba-btn-b">B</div>
            <div className="gba-btn-a">A</div>
          </div>
          <div className="gba-speaker-grille">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="gba-speaker-dot" />
            ))}
          </div>
          {playing
            ? <button className="gba-mini-btn" onClick={exitGame}>BACK</button>
            : <button className="gba-mini-btn" onClick={onStop}>QUIT</button>
          }
        </div>

      </div>
    </div>
  );
}
