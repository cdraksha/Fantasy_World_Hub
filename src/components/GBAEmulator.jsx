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
  // Clean up global EJS state
  [
    'EJS_player', 'EJS_gameUrl', 'EJS_core', 'EJS_pathtodata',
    'EJS_color', 'EJS_startOnLoaded', 'EJS_GameName', 'EJS_emulator',
    'EJS_onGameStart', 'EJS_onSaveState', 'EJS_onLoadState',
  ].forEach(k => { try { delete window[k]; } catch {} });
}

export default function GBAEmulator({ onStop }) {
  const [roms, setRoms] = useState([]);
  const [selectedRom, setSelectedRom] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const playerRef = useRef(null);
  const ejsLoadedRef = useRef(false);

  // Load manifest
  useEffect(() => {
    fetch('/roms/manifest.json')
      .then(r => r.json())
      .then(data => setRoms(Array.isArray(data) ? data : []))
      .catch(() => setRoms([]));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupEmulator();
  }, []);

  const launchGame = useCallback((rom) => {
    setLoadError(null);
    setPlaying(true);
    ejsLoadedRef.current = false;

    // Give React time to render the player div, then boot the emulator
    setTimeout(() => {
      cleanupEmulator();

      window.EJS_player = '#emu-player';
      window.EJS_gameUrl = `/roms/${rom.file}`;
      window.EJS_core = getCore(rom.file);
      window.EJS_pathtodata = EJS_PATH;
      window.EJS_color = '#FFCB05';
      window.EJS_startOnLoaded = true;
      window.EJS_GameName = rom.name;

      const script = document.createElement('script');
      script.id = 'ejs-loader-script';
      script.src = `${EJS_PATH}loader.js`;
      script.onerror = () => setLoadError('Failed to load emulator. Check that EmulatorJS files are in public/emulatorjs/.');
      document.body.appendChild(script);
    }, 80);
  }, []);

  const exitGame = useCallback(() => {
    cleanupEmulator();
    setPlaying(false);
    setSelectedRom(null);
    ejsLoadedRef.current = false;
  }, []);

  // ── Selector screen ──────────────────────────────────────────────
  if (!playing) {
    return (
      <div className="emu-root">
        <div className="emu-bg" />

        <div className="emu-selector">
          <button className="emu-back-btn" onClick={onStop}>◂ Back</button>

          <div className="emu-header">
            <div className="emu-header-icon">🎮</div>
            <div className="emu-header-title">Game Library</div>
            <div className="emu-header-sub">Select a game to play</div>
          </div>

          {roms.length === 0 ? (
            <div className="emu-empty">
              <div className="emu-empty-icon">📂</div>
              <div className="emu-empty-title">No ROMs loaded yet</div>
              <div className="emu-empty-body">
                Drop your ROM files into <code>public/roms/</code> and let me know — I'll add them to the library instantly.
              </div>
            </div>
          ) : (
            <div className="emu-game-grid">
              {roms.map(rom => (
                <button
                  key={rom.file}
                  className={`emu-game-card${selectedRom?.file === rom.file ? ' selected' : ''}`}
                  onClick={() => setSelectedRom(rom)}
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

          {selectedRom && (
            <div className="emu-launch-bar">
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
      </div>
    );
  }

  // ── Player screen ─────────────────────────────────────────────────
  return (
    <div className="emu-root emu-playing">
      <div className="emu-player-bar">
        <button className="emu-player-back" onClick={exitGame}>◂ Library</button>
        <span className="emu-player-title">{selectedRom?.name}</span>
        <span className="emu-player-system">{selectedRom ? getSystemLabel(selectedRom.file) : ''}</span>
        <button className="emu-player-quit" onClick={onStop}>✕ Quit</button>
      </div>

      {loadError && (
        <div className="emu-error">
          <span>⚠️ {loadError}</span>
          <button onClick={exitGame}>Go Back</button>
        </div>
      )}

      <div className="emu-player-wrap">
        <div id="emu-player" ref={playerRef} />
      </div>
    </div>
  );
}
