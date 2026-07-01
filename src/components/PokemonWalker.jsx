import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/pokemon-walker.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const LS_KEY = 'fw_pokemon_walker';


const PACK_COSTS = { common: 5000, rare: 10000, epic: 20000, legendary: 40000 };

const VAULT_MILESTONES = [
  { threshold: 200000, reward: 'epic' },
  { threshold: 500000, reward: 'legendary' },
];

const TYPE_COLORS = {
  fire: '#f08030', water: '#6890f0', grass: '#78c850', electric: '#f8d030',
  psychic: '#f85888', ice: '#98d8d8', dragon: '#7038f8', dark: '#705848',
  fairy: '#ee99ac', normal: '#a8a878', fighting: '#c03028', flying: '#a890f0',
  poison: '#a040a0', ground: '#e0c068', rock: '#b8a038', bug: '#a8b820',
  ghost: '#705898', steel: '#b8b8d0',
};

const ACHIEVEMENTS_META = [
  { key: 'firstPokemon',    label: 'First Catch',         desc: 'Catch your first Pokémon',         icon: '🎉' },
  { key: 'firstDuplicate',  label: 'Collector',           desc: 'Get a duplicate Pokémon',          icon: '📦' },
  { key: 'firstRare',       label: 'Rare Find',           desc: 'Open a Rare pack',                 icon: '💎' },
  { key: 'firstEpic',       label: 'Epic Pull',           desc: 'Open an Epic pack',                icon: '⚡' },
  { key: 'firstLegendary',  label: 'Legendary!',          desc: 'Open a Legendary pack',            icon: '🌟' },
  { key: 'fullTeam',        label: 'Full Team',           desc: 'Fill all 6 team slots',            icon: '🏆' },
  { key: 'steps100k',       label: '100K Steps',          desc: 'Walk 100,000 lifetime steps',      icon: '👟' },
  { key: 'steps500k',       label: '500K Steps',          desc: 'Walk 500,000 lifetime steps',      icon: '🏃' },
  { key: 'steps1m',         label: '1 Million Steps',     desc: 'Walk 1,000,000 lifetime steps',    icon: '🚀' },
];


// ─── Pokémon Pools ─────────────────────────────────────────────────────────

const ALL_IDS = Array.from({ length: 1010 }, (_, i) => i + 1);

const LEGENDARY_IDS = new Set([
  144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,
  480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,
  644,645,646,647,648,649,716,717,718,719,720,721,772,773,785,786,787,788,789,790,791,
  792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,888,889,890,891,892,
  893,894,895,896,897,898,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010
]);

const EPIC_IDS = new Set([
  3,6,9,12,15,18,20,26,31,34,36,38,40,45,47,49,51,53,55,57,59,62,65,68,71,73,76,78,80,
  82,83,85,87,89,91,94,97,99,101,103,105,106,107,110,112,113,115,117,119,121,122,123,124,
  125,126,127,128,131,134,135,136,137,139,141,142,143,149,154,157,160,162,164,166,168,169,
  171,178,182,184,186,189,192,196,197,199,202,205,208,210,212,214,219,221,224,227,229,230,
  232,234,237,241,248,254,257,260,262,264,267,269,272,275,279,282,286,289,291,295,297,302,
  305,306,310,319,321,323,326,330,334,338,340,342,344,346,348,350,354,356,359,362,365,368,
  373,376,392,395,398,407,409,411,416,419,421,424,426,430,432,435,437,442,445,448,452,454,
  457,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,500,503,
  512,514,516,518,523,526,528,530,534,537,542,545,549,553,555,558,561,563,569,571,576,579,
  584,589,591,593,596,598,601,604,609,612,614,617,620,625,628,630,635,637,658,663,666,671,
  673,675,676,681,683,687,689,691,693,695,697,700,702,706,707,709,711,713,715,724,727,730,
  733,738,740,743,748,752,756,758,760,763,765,768,771,776,778,784,812,815,818,820,823,826,
  830,834,839,841,842,847,849,851,855,858,861,863,866,869,873,876,877,879,881,884,886,908,
  911,914,917,920,923,925,928,931,934,937,940,943,947,950,953,956,959,962,964,967,970,973,
  976,978,980,982,984,986,988,990,993,996,998,1000
]);

const RARE_IDS = new Set([
  2,5,8,11,14,17,30,33,42,44,58,60,64,67,70,74,79,81,84,86,88,90,93,96,98,100,102,104,
  111,116,118,120,130,132,133,138,140,153,156,159,174,175,176,177,180,183,185,187,190,193,
  194,198,201,203,206,207,209,211,213,215,216,218,220,222,225,226,228,231,235,236,238,239,
  240,246,247,252,255,258,261,263,265,266,268,270,271,273,274,276,277,278,280,281,285,287,
  288,290,293,294,296,298,299,300,303,304,311,312,315,316,317,318,320,322,324,325,327,328,
  329,331,332,333,335,336,337,339,341,343,345,347,349,351,352,353,355,357,358,360,361,363,
  364,366,367,369,370,371,374,375,390,393,396,399,401,403,406,408,410,412,415,417,418,420,
  422,423,425,427,428,429,431,433,434,436,438,439,440,441,443,444,446,447,449,450,451,453,
  455,456,458,459,495,498,501,504,507,509,511,513,515,517,519,521,522,524,527,529,532,535,
  538,539,540,543,546,547,550,551,554,556,557,559,560,562,564,566,568,570,572,574,575,577,
  578,580,581,582,583,585,587,588,590,592,594,595,597,599,600,602,603,605,606,607,608,610,
  611,613,615,616,618,619,621,622,623,624,626,627,629,631,632,633,634,636,650,653,656,659,
  661,664,667,669,672,674,677,678,679,680,682,684,685,686,688,690,692,694,696,698,699,701,
  703,704,705,708,710,712,714,722,725,728,731,734,736,741,744,745,746,747,749,750,751,753,
  754,755,757,759,761,762,764,766,767,769,774,775,777,779,780,781,782,783,808,809,810,813,
  816,819,821,824,827,828,829,831,832,833,835,836,837,838,840,843,844,846,848,850,852,854,
  856,857,859,860,862,864,865,867,868,870,871,872,874,875,878,880,882,883,885,887,906,909,
  912,915,918,921,924,926,929,932,935,938,941,944,948,951,954,957,960,963,965,968,971,974,
  977,979,981,983,985,987,989,991,994,997,999
]);

const COMMON_IDS = ALL_IDS.filter(id => !LEGENDARY_IDS.has(id) && !EPIC_IDS.has(id) && !RARE_IDS.has(id));

const POOLS = {
  common: COMMON_IDS,
  rare: [...RARE_IDS],
  epic: [...EPIC_IDS],
  legendary: [...LEGENDARY_IDS],
};

function pickFromPool(tier, ownedDexIds) {
  const pool = POOLS[tier];
  if (tier === 'legendary') {
    const unowned = pool.filter(id => !ownedDexIds.has(id));
    const src = unowned.length > 0 ? unowned : pool;
    return src[Math.floor(Math.random() * src.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── PokeAPI ──────────────────────────────────────────────────────────────

async function fetchPokemonById(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`PokeAPI ${res.status}`);
  const data = await res.json();
  return {
    dexId: data.id,
    name: data.name,
    sprite: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || '',
    types: data.types.map(t => t.type.name),
  };
}

// ─── PokeAPI — evolution chain ────────────────────────────────────────────

async function fetchEvolution(dexId) {
  const specRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${dexId}`);
  if (!specRes.ok) return null;
  const spec = await specRes.json();
  const chainRes = await fetch(spec.evolution_chain.url);
  if (!chainRes.ok) return null;
  const { chain } = await chainRes.json();

  function findNext(node, targetId) {
    const nodeId = parseInt(node.species.url.split('/').filter(Boolean).pop());
    if (nodeId === targetId) {
      if (node.evolves_to.length === 0) return null;
      return parseInt(node.evolves_to[0].species.url.split('/').filter(Boolean).pop());
    }
    for (const child of node.evolves_to) {
      const r = findNext(child, targetId);
      if (r !== undefined) return r;
    }
    return undefined;
  }

  return findNext(chain, dexId) ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function getCollectorLevel(totalSteps) {
  return Math.floor(totalSteps / 50000) + 1;
}

function getRegion(dexId) {
  if (dexId <= 151) return 'Kanto';
  if (dexId <= 251) return 'Johto';
  if (dexId <= 386) return 'Hoenn';
  if (dexId <= 493) return 'Sinnoh';
  if (dexId <= 649) return 'Unova';
  if (dexId <= 721) return 'Kalos';
  if (dexId <= 809) return 'Alola';
  if (dexId <= 905) return 'Galar';
  return 'Paldea';
}

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function fmtFull(n) {
  return n.toLocaleString();
}

function makeUID() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function defaultState(steps) {
  return {
    initialized: true,
    todayDate: todayString(),
    todaySteps: steps,
    spendableSteps: steps,
    totalStepsWalked: steps,
    lifetimeVaultDeposits: 0,
    vaultMilestonesUnlocked: [],
    collectorLevel: 1,
    stepVault: 0,
    packInventory: { common: 0, rare: 0, epic: 0, legendary: 0 },
    pokemon: [],
    achievements: {
      firstPokemon: false, firstDuplicate: false, firstRare: false,
      firstEpic: false, firstLegendary: false, fullTeam: false,
      steps100k: false, steps500k: false, steps1m: false,
    },
    streakDays: 1,
    bestStreak: 1,
    lastStreakDate: todayString(),
    bestDay: steps,
    bestDayDate: todayString(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved.initialized) return null;
    // Daily reset
    const today = todayString();
    if (saved.todayDate !== today) {
      saved.todayDate = today;
      saved.todaySteps = 0;
      saved.spendableSteps = 0;
      saved.packInventory = { common: 0, rare: 0, epic: 0, legendary: 0 };
    }
    return saved;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

function tierGlow(tier) {
  const glows = {
    common: 'radial-gradient(ellipse at center, rgba(106,176,76,0.25) 0%, transparent 70%)',
    rare: 'radial-gradient(ellipse at center, rgba(74,144,217,0.25) 0%, transparent 70%)',
    epic: 'radial-gradient(ellipse at center, rgba(155,89,182,0.25) 0%, transparent 70%)',
    legendary: 'radial-gradient(ellipse at center, rgba(241,196,15,0.3) 0%, transparent 70%)',
  };
  return glows[tier] || glows.common;
}

// ─── Type badge ──────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const bg = TYPE_COLORS[type] || '#888';
  return (
    <span className="pw-type-badge" style={{ background: bg }}>
      {type}
    </span>
  );
}

// ─── Pokémon Detail Popup ─────────────────────────────────────────────────

function PokemonDetailPopup({ pokemon, allPokemon, team, vault, onClose, onAddTeam, onRemoveTeam, onEvolve, evolving }) {
  const isTeamMember = team.includes(pokemon.uid);
  const ownedCount = allPokemon.filter(p => p.dexId === pokemon.dexId).length;
  const timesEvolved = pokemon.timesEvolved || 0;
  const evolveCost = timesEvolved === 0 ? 50000 : 100000;
  const canEvolveMore = timesEvolved < 2;
  const isEvolving = evolving === pokemon.uid;

  return (
    <div className="pw-popup-overlay" onClick={onClose}>
      <div className="pw-popup-modal" onClick={e => e.stopPropagation()}>
        {pokemon.sprite && (
          <img src={pokemon.sprite} alt={pokemon.name} className="pw-popup-sprite" />
        )}
        <div className="pw-popup-name">{pokemon.name}</div>
        <div className="pw-popup-types">
          {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
        </div>
        <div className="pw-popup-meta">
          Owned ×{ownedCount} · #{pokemon.dexId}
        </div>
        <div className="pw-popup-meta">
          Pack: {pokemon.packTier} · {pokemon.caughtDate}
        </div>

        {/* Evolution */}
        <div className="pw-popup-evolve">
          {canEvolveMore ? (
            <>
              <div className="pw-popup-evolve-label">
                Evolve · {fmtFull(evolveCost)} vault steps
              </div>
              <button
                className="pw-evolve-btn"
                onClick={() => onEvolve(pokemon.uid)}
                disabled={vault < evolveCost || isEvolving}
              >
                {isEvolving ? 'Evolving…' : '✨ Evolve'}
              </button>
            </>
          ) : (
            <div className="pw-evolve-max">Max Evolution</div>
          )}
        </div>

        <div className="pw-popup-action-row">
          {isTeamMember ? (
            <button className="pw-popup-remove-btn" onClick={() => { onRemoveTeam(pokemon.uid); onClose(); }}>
              ✕ Remove
            </button>
          ) : (
            <button
              className="pw-popup-toteam-btn"
              onClick={() => { onAddTeam(pokemon.uid); onClose(); }}
              disabled={team.length >= 6}
              style={team.length >= 6 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              + Add to Team
            </button>
          )}
        </div>

        <button className="pw-popup-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ─── Pack Opening Screen ──────────────────────────────────────────────────

function PackOpeningScreen({ tier, onClose, onCatch }) {
  const [phase, setPhase] = useState('facedown'); // facedown | loading | result | error
  const [fetched, setFetched] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTap = async () => {
    if (phase !== 'facedown') return;
    setPhase('loading');
    try {
      // We need owned dex IDs passed in from outside; use a window hack or prop
      const dexId = pickFromPool(tier, window.__pw_owned_dex_ids__ || new Set());
      const data = await fetchPokemonById(dexId);
      setFetched(data);
      setPhase('result');
    } catch (e) {
      setErrorMsg('Failed to load Pokémon. Check your connection and try again.');
      setPhase('error');
    }
  };

  const isNew = fetched && !(window.__pw_owned_dex_ids__ || new Set()).has(fetched.dexId);
  const dupCount = fetched
    ? ((window.__pw_all_pokemon__ || []).filter(p => p.dexId === fetched.dexId).length)
    : 0;

  return (
    <div className="pw-pack-overlay">
      <div
        className="pw-pack-glow"
        style={{ background: tierGlow(tier) }}
      />
      <button className="pw-pack-back-btn" onClick={onClose}>← Back</button>
      <div className="pw-pack-modal">
        <div className={`pw-pack-tier-label ${tier}`}>{tier} pack</div>

        {phase === 'facedown' && (
          <>
            <span className="pw-pack-card-face" onClick={handleTap} role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleTap()}>
              🂠
            </span>
            <div className="pw-pack-tap-hint">Tap to open</div>
          </>
        )}

        {phase === 'loading' && (
          <div className="pw-pack-loading">Catching Pokémon…</div>
        )}

        {phase === 'error' && (
          <>
            <div className="pw-pack-error">⚠ {errorMsg}</div>
            <button className="pw-pack-store-btn" onClick={() => setPhase('facedown')}>Try Again</button>
          </>
        )}

        {phase === 'result' && fetched && (
          <div className="pw-pack-result">
            {fetched.sprite ? (
              <img src={fetched.sprite} alt={fetched.name} className="pw-result-sprite" />
            ) : (
              <div style={{ fontSize: 64, marginBottom: 8 }}>❓</div>
            )}
            <div className="pw-result-name">{fetched.name}</div>
            <div className="pw-result-types">
              {fetched.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
            {isNew ? (
              <div className="pw-new-badge">✨ New!</div>
            ) : (
              <div className="pw-dup-text">Duplicate ×{dupCount + 1}</div>
            )}
            <div className="pw-pack-actions">
              <button className="pw-pack-add-btn" onClick={() => onCatch(fetched, 'team')}>
                + Add to Team
              </button>
              <button className="pw-pack-store-btn" onClick={() => onCatch(fetched, 'storage')}>
                → Storage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Midnight Warning ─────────────────────────────────────────────────────

function MidnightWarning({ spendable, onSpend, onDeposit, onIgnore }) {
  return (
    <div className="pw-midnight-overlay">
      <div className="pw-midnight-modal">
        <div className="pw-midnight-icon">🌙</div>
        <div className="pw-midnight-title">Almost Midnight!</div>
        <div className="pw-midnight-msg">
          It's 11:48 PM. Your spendable steps reset at midnight. Use them or deposit them to your vault!
        </div>
        <div className="pw-midnight-steps">{fmtFull(spendable)} steps</div>
        <div className="pw-midnight-btns">
          <button className="pw-mid-spend-btn" onClick={onSpend}>
            🎁 Unlock Rewards
          </button>
          <button className="pw-mid-deposit-btn" onClick={onDeposit}>
            🏦 Deposit All to Vault
          </button>
          <button className="pw-mid-ignore-btn" onClick={onIgnore}>
            Ignore
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function PokemonWalker({ onStop }) {
  const [appState, setAppState] = useState(() => loadState());
  const [tab, setTab] = useState('dashboard');
  const [stepInput, setStepInput] = useState('');
  const [deltaFlash, setDeltaFlash] = useState(null);
  const [packOpening, setPackOpening] = useState(null); // tier string or null
  const [detailPokemon, setDetailPokemon] = useState(null);
  const [showMidnight, setShowMidnight] = useState(false);
  const [evolving, setEvolving] = useState(null); // uid of Pokémon being evolved
  const [launchInput, setLaunchInput] = useState('');
  const [clockTime, setClockTime] = useState('');
  const [packWarning, setPackWarning] = useState(null); // '9pm' | '11pm' | null
  const midnightChecked = useRef(false);
  const packWarningChecked = useRef({ '9pm': false, '11pm': false });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setClockTime(`${h}:${m}:${s} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ─── Keep window refs for PackOpeningScreen ───────────────────────────
  useEffect(() => {
    if (appState) {
      window.__pw_owned_dex_ids__ = new Set(appState.pokemon.map(p => p.dexId));
      window.__pw_all_pokemon__ = appState.pokemon;
    }
  }, [appState]);

  // ─── Persist ────────────────────────────────────────────────────────
  useEffect(() => {
    if (appState) saveState(appState);
  }, [appState]);

  // ─── Midnight warning timer ──────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      if (!appState || midnightChecked.current) return;
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h === 23 && m >= 48 && appState.spendableSteps > 0) {
        setShowMidnight(true);
        midnightChecked.current = true;
      }
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [appState]);

  // ─── Pack expiry warning ─────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      if (!appState) return;
      const total = Object.values(appState.packInventory).reduce((a, b) => a + b, 0);
      if (total === 0) return;
      const h = new Date().getHours();
      if (h >= 23 && !packWarningChecked.current['11pm']) {
        packWarningChecked.current['11pm'] = true;
        setPackWarning('11pm');
      } else if (h >= 21 && h < 23 && !packWarningChecked.current['9pm']) {
        packWarningChecked.current['9pm'] = true;
        setPackWarning('9pm');
      }
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [appState]);

  // ─── Derived state ──────────────────────────────────────────────────
  const team = appState ? appState.pokemon.filter(p => p.onTeam).map(p => p.uid) : [];
  const teamPokemon = appState ? appState.pokemon.filter(p => p.onTeam) : [];
  const storagePokemon = appState ? appState.pokemon.filter(p => !p.onTeam) : [];

  // ─── Unique collection by dexId ─────────────────────────────────────
  const uniqueByDex = appState
    ? Object.values(
        appState.pokemon.reduce((acc, p) => {
          if (!acc[p.dexId]) acc[p.dexId] = { ...p, count: 1 };
          else acc[p.dexId].count++;
          return acc;
        }, {})
      )
    : [];

  // ─── Level helpers ──────────────────────────────────────────────────
  const collectorLevel = appState ? getCollectorLevel(appState.totalStepsWalked) : 1;

  // ─── Check vault milestones (repeating — resets vault to 0 on unlock) ──
  const checkVaultMilestones = useCallback((vaultBalance, packInventory) => {
    let newPacks = { ...packInventory };
    let resetVault = vaultBalance;
    // Check highest threshold first so legendary takes priority over epic
    const sorted = [...VAULT_MILESTONES].sort((a, b) => b.threshold - a.threshold);
    for (const ms of sorted) {
      if (vaultBalance >= ms.threshold) {
        newPacks = { ...newPacks, [ms.reward]: (newPacks[ms.reward] || 0) + 1 };
        resetVault = 0;
        break;
      }
    }
    return { newPacks, resetVault };
  }, []);

  // ─── Check achievements ─────────────────────────────────────────────
  const checkAchievements = useCallback((state) => {
    const ach = { ...state.achievements };
    if (state.pokemon.length > 0) ach.firstPokemon = true;
    const dexCounts = {};
    state.pokemon.forEach(p => { dexCounts[p.dexId] = (dexCounts[p.dexId] || 0) + 1; });
    if (Object.values(dexCounts).some(c => c > 1)) ach.firstDuplicate = true;
    if (state.pokemon.some(p => p.packTier === 'rare')) ach.firstRare = true;
    if (state.pokemon.some(p => p.packTier === 'epic')) ach.firstEpic = true;
    if (state.pokemon.some(p => p.packTier === 'legendary')) ach.firstLegendary = true;
    if (state.pokemon.filter(p => p.onTeam).length >= 6) ach.fullTeam = true;
    if (state.totalStepsWalked >= 100000) ach.steps100k = true;
    if (state.totalStepsWalked >= 500000) ach.steps500k = true;
    if (state.totalStepsWalked >= 1000000) ach.steps1m = true;
    return ach;
  }, []);

  // ─── Handle first launch ─────────────────────────────────────────────
  const handleLaunch = () => {
    const steps = parseInt(launchInput, 10);
    if (isNaN(steps) || steps < 0) return;
    const s = defaultState(steps);
    setAppState(s);
  };

  // ─── Save steps ──────────────────────────────────────────────────────
  const handleSaveSteps = () => {
    const newTotal = parseInt(stepInput, 10);
    if (isNaN(newTotal) || newTotal < 0) return;
    setAppState(prev => {
      const delta = Math.max(0, newTotal - prev.todaySteps);
      const newTodaySteps = newTotal;
      const newTotalWalked = prev.totalStepsWalked + delta;
      const newSpendable = prev.spendableSteps + delta;
      const newLevel = getCollectorLevel(newTotalWalked);
      const newAch = checkAchievements({ ...prev, totalStepsWalked: newTotalWalked });
      const isNewRecord = newTodaySteps > (prev.bestDay || 0);
      const newBestDay = isNewRecord ? newTodaySteps : (prev.bestDay || 0);
      const newBestDayDate = isNewRecord
        ? new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
        : (prev.bestDayDate || todayString());
      const next = {
        ...prev,
        todaySteps: newTodaySteps,
        spendableSteps: newSpendable,
        totalStepsWalked: newTotalWalked,
        collectorLevel: newLevel,
        achievements: newAch,
        bestDay: newBestDay,
        bestDayDate: newBestDayDate,
      };
      if (delta > 0) {
        setDeltaFlash(`+${fmtFull(delta)} new steps`);
        setTimeout(() => setDeltaFlash(null), 3000);
      }
      return next;
    });
    setStepInput('');
  };

  // ─── Unlock pack ─────────────────────────────────────────────────────
  const handleUnlockPack = (tier) => {
    const cost = PACK_COSTS[tier];
    setAppState(prev => {
      if (prev.spendableSteps < cost) return prev;
      return {
        ...prev,
        spendableSteps: prev.spendableSteps - cost,
        packInventory: { ...prev.packInventory, [tier]: prev.packInventory[tier] + 1 },
      };
    });
  };

  // ─── Deposit to vault ────────────────────────────────────────────────
  const handleDepositAll = () => {
    setAppState(prev => {
      if (prev.spendableSteps <= 0) return prev;
      const deposit = prev.spendableSteps;
      const newVault = prev.stepVault + deposit;
      const newLifetime = prev.lifetimeVaultDeposits + deposit;
      const { newPacks, resetVault } = checkVaultMilestones(newVault, prev.packInventory);
      return {
        ...prev,
        spendableSteps: 0,
        stepVault: resetVault,
        lifetimeVaultDeposits: newLifetime,
        packInventory: newPacks,
      };
    });
  };

  // ─── Open pack (start pack screen) ───────────────────────────────────
  const handleOpenPack = (tier) => {
    if (!appState || appState.packInventory[tier] <= 0) return;
    // Consume the pack first
    setAppState(prev => ({
      ...prev,
      packInventory: { ...prev.packInventory, [tier]: prev.packInventory[tier] - 1 },
    }));
    setPackOpening(tier);
  };

  // ─── Catch Pokémon from pack ─────────────────────────────────────────
  const handleCatch = (fetched, destination) => {
    setPackOpening(null);
    setAppState(prev => {
      const isTeam = destination === 'team' && prev.pokemon.filter(p => p.onTeam).length < 6;
      const newPoke = {
        uid: makeUID(),
        dexId: fetched.dexId,
        name: fetched.name,
        sprite: fetched.sprite,
        types: fetched.types,
        timesEvolved: 0,
        location: 'Unknown',
        packTier: packOpening || 'common',
        caughtDate: todayString(),
        onTeam: isTeam,
      };
      const newPokemon = [...prev.pokemon, newPoke];
      const newAch = checkAchievements({ ...prev, pokemon: newPokemon });
      return { ...prev, pokemon: newPokemon, achievements: newAch };
    });
  };

  // ─── Add to team ─────────────────────────────────────────────────────
  const handleAddTeam = (uid) => {
    setAppState(prev => {
      if (prev.pokemon.filter(p => p.onTeam).length >= 6) return prev;
      const newPokemon = prev.pokemon.map(p =>
        p.uid === uid ? { ...p, onTeam: true } : p
      );
      const newAch = checkAchievements({ ...prev, pokemon: newPokemon });
      return { ...prev, pokemon: newPokemon, achievements: newAch };
    });
  };

  // ─── Remove from team ────────────────────────────────────────────────
  const handleRemoveTeam = (uid) => {
    setAppState(prev => ({
      ...prev,
      pokemon: prev.pokemon.map(p => p.uid === uid ? { ...p, onTeam: false } : p),
    }));
  };

  // ─── Evolve Pokémon ──────────────────────────────────────────────────
  const handleEvolve = async (uid) => {
    if (evolving) return;
    const poke = appState.pokemon.find(p => p.uid === uid);
    if (!poke) return;
    const timesEvolved = poke.timesEvolved || 0;
    if (timesEvolved >= 2) return;
    const cost = timesEvolved === 0 ? 50000 : 100000;
    if (appState.stepVault < cost) return;

    setEvolving(uid);
    try {
      const nextId = await fetchEvolution(poke.dexId);
      if (!nextId) { setEvolving(null); return; }
      const evolved = await fetchPokemonById(nextId);
      setAppState(prev => {
        if (prev.stepVault < cost) return prev;
        return {
          ...prev,
          stepVault: prev.stepVault - cost,
          pokemon: prev.pokemon.map(p =>
            p.uid === uid
              ? { ...p, dexId: evolved.dexId, name: evolved.name, sprite: evolved.sprite, types: evolved.types, timesEvolved: timesEvolved + 1 }
              : p
          ),
        };
      });
      setDetailPokemon(prev => prev?.uid === uid
        ? { ...prev, dexId: evolved.dexId, name: evolved.name, sprite: evolved.sprite, types: evolved.types, timesEvolved: timesEvolved + 1 }
        : prev
      );
    } catch { /* silently fail */ }
    setEvolving(null);
  };

  // ─── Midnight handlers ────────────────────────────────────────────────
  const handleMidnightSpend = () => { setShowMidnight(false); };
  const handleMidnightDeposit = () => { handleDepositAll(); setShowMidnight(false); };
  const handleMidnightIgnore = () => { setShowMidnight(false); };

  // ─── Pack ref tracking ───────────────────────────────────────────────
  // Store tier of the pack being opened so handleCatch can use it
  const packOpeningRef = useRef(null);
  useEffect(() => { packOpeningRef.current = packOpening; }, [packOpening]);

  // ─── First launch screen ──────────────────────────────────────────────
  if (!appState) {
    return (
      <div className="pw-root">
        <div className="pw-launch-screen">
          <div className="pw-launch-card">
            <div className="pw-launch-icon">👟</div>
            <div className="pw-launch-title">Pokémon Walker</div>
            <div className="pw-launch-subtitle">
              Walk more. Catch more. Spend your daily steps on Pokémon packs.
              Deposit to your Vault for milestone rewards. Build the ultimate collection.
            </div>
            <div className="pw-launch-date">Today: {todayString()}</div>
            <input
              className="pw-launch-input"
              type="number"
              min="0"
              placeholder="Enter today's step count"
              value={launchInput}
              onChange={e => setLaunchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLaunch()}
            />
            <button className="pw-launch-btn" onClick={handleLaunch}>
              Start Journey →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pack opening overlay ─────────────────────────────────────────────
  if (packOpening) {
    return (
      <div className="pw-root">
        <PackOpeningScreen
          tier={packOpening}
          onClose={() => {
            // Put pack back if closed without catching
            setAppState(prev => ({
              ...prev,
              packInventory: {
                ...prev.packInventory,
                [packOpening]: prev.packInventory[packOpening] + 1,
              },
            }));
            setPackOpening(null);
          }}
          onCatch={handleCatch}
        />
      </div>
    );
  }

  // ─── Helpers for vault milestone bars ────────────────────────────────
  const upcomingMilestones = VAULT_MILESTONES;

  // ─── Total pack count for sticky bar ────────────────────────────────
  const totalPacks = Object.values(appState.packInventory).reduce((a, b) => a + b, 0);

  return (
    <div className="pw-root">
      {/* Midnight warning */}
      {showMidnight && (
        <MidnightWarning
          spendable={appState.spendableSteps}
          onSpend={handleMidnightSpend}
          onDeposit={handleMidnightDeposit}
          onIgnore={handleMidnightIgnore}
        />
      )}

      {/* Pack expiry warning banner */}
      {packWarning && (
        <div className="pw-pack-warning-banner">
          <span className="pw-pack-warning-icon">⚠️</span>
          <span className="pw-pack-warning-text">
            {packWarning === '9pm'
              ? `You have ${totalPacks} unopened pack${totalPacks > 1 ? 's' : ''} — they expire at midnight!`
              : `Last chance! ${totalPacks} pack${totalPacks > 1 ? 's' : ''} expire${totalPacks === 1 ? 's' : ''} in under an hour.`}
          </span>
          <button className="pw-pack-warning-dismiss" onClick={() => setPackWarning(null)}>✕</button>
        </div>
      )}

      {/* Detail popup */}
      {detailPokemon && (
        <PokemonDetailPopup
          pokemon={detailPokemon}
          allPokemon={appState.pokemon}
          team={team}
          vault={appState.stepVault}
          onClose={() => setDetailPokemon(null)}
          onAddTeam={handleAddTeam}
          onRemoveTeam={handleRemoveTeam}
          onEvolve={handleEvolve}
          evolving={evolving}
        />
      )}

      {/* Sticky bar */}
      <div className="pw-sticky-bar">
        <div className="pw-stat-chip">
          <span>👣</span>
          <span className="pw-val pw-mono">{fmtNum(appState.todaySteps)}</span>
        </div>
        <div className="pw-stat-chip">
          <span>🏦</span>
          <span className="pw-val pw-mono">{fmtNum(appState.stepVault)}</span>
        </div>
        <div className="pw-stat-chip">
          <span>🎁</span>
          <span className="pw-val pw-mono">{totalPacks}</span>
        </div>
        <div className="pw-stat-chip">
          <span>⭐</span>
          <span className="pw-label">Lv</span>
          <span className="pw-val pw-mono">{collectorLevel}</span>
        </div>
        <button className="pw-exit-btn" onClick={onStop}>✕ Exit</button>
      </div>

      {/* Tab bar */}
      <div className="pw-tabs">
        {['dashboard', 'collection'].map(t => (
          <button
            key={t}
            className={`pw-tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'dashboard' ? 'Dashboard' : 'Collection'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pw-content">

        {/* ─── DASHBOARD TAB ─── */}
        {tab === 'dashboard' && (
          <>
            {/* 1. Header card */}
            <div className="pw-section">
              <div className="pw-header-date">
                {appState.todayDate}
                <span className="pw-header-clock">{clockTime}</span>
              </div>
              <div className="pw-stats-grid">
                <div className="pw-stat-box level">
                  <div className="pw-stat-label">Collector Level</div>
                  <div className="pw-stat-number">{collectorLevel}</div>
                </div>
                <div className="pw-stat-box steps">
                  <div className="pw-stat-label">Today's Steps</div>
                  <div className="pw-stat-number">{fmtNum(appState.todaySteps)}</div>
                </div>
                <div className="pw-stat-box vault">
                  <div className="pw-stat-label">Step Vault</div>
                  <div className="pw-stat-number">{fmtNum(appState.stepVault)}</div>
                </div>
                <div className="pw-stat-box total">
                  <div className="pw-stat-label">Total Walked</div>
                  <div className="pw-stat-number">{fmtNum(appState.totalStepsWalked)}</div>
                </div>
                <div className="pw-stat-box streak">
                  <div className="pw-stat-label">Daily Streak</div>
                  <div className="pw-stat-number">{appState.streakDays || 0}d</div>
                </div>
                <div className="pw-stat-box best-streak">
                  <div className="pw-stat-label">Best Streak</div>
                  <div className="pw-stat-number">{appState.bestStreak || 0}d</div>
                </div>
                <div className="pw-stat-box daily-record">
                  <div className="pw-stat-label">Daily Record</div>
                  <div className="pw-stat-number">{fmtNum(appState.bestDay || 0)}</div>
                  <div className="pw-stat-sub">{appState.bestDayDate || '—'}</div>
                </div>
              </div>
            </div>

            {/* 2. Step Entry */}
            <div className="pw-section">
              <div className="pw-section-title">Step Entry</div>
              <div className="pw-step-display">{fmtFull(appState.todaySteps)}</div>
              <div className="pw-step-row">
                <input
                  className="pw-step-input"
                  type="number"
                  min="0"
                  placeholder="Enter current total steps for today"
                  value={stepInput}
                  onChange={e => setStepInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveSteps()}
                />
                <button className="pw-save-btn" onClick={handleSaveSteps}>Save</button>
              </div>
              {deltaFlash && <div className="pw-delta-flash">{deltaFlash}</div>}
            </div>

            {/* 3. Daily Rewards */}
            <div className="pw-section">
              <div className="pw-section-title">Daily Rewards</div>
              <div className="pw-balance-big">
                {fmtFull(appState.spendableSteps)}
                <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8, fontFamily: 'inherit', fontWeight: 400 }}>
                  spendable steps
                </span>
              </div>
              <div className="pw-pack-grid">
                {(['common', 'rare', 'epic', 'legendary']).map(tier => {
                  const cost = PACK_COSTS[tier];
                  const canAfford = appState.spendableSteps >= cost;
                  return (
                    <div className={`pw-pack-store-card ${tier}${canAfford ? ' can-afford' : ''}`} key={tier}>
                      <div className="pw-psc-tier">{tier}</div>
                      <div className="pw-psc-cost">{fmtFull(cost)}</div>
                      <div className="pw-psc-unit">steps</div>
                      {canAfford ? (
                        <button className="pw-psc-btn" onClick={() => handleUnlockPack(tier)}>
                          Unlock
                        </button>
                      ) : (
                        <div className="pw-psc-need">
                          Need {fmtNum(cost - appState.spendableSteps)} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Step Vault */}
            <div className="pw-section">
              <div className="pw-section-title">Step Vault</div>
              <div className="pw-vault-total">{fmtFull(appState.stepVault)}</div>
              <div className="pw-vault-sub">
                Lifetime deposits: {fmtFull(appState.lifetimeVaultDeposits)}
              </div>
              {appState.spendableSteps > 0 && (
                <button className="pw-deposit-btn" onClick={handleDepositAll}>
                  🏦 Deposit All ({fmtFull(appState.spendableSteps)})
                </button>
              )}
              {upcomingMilestones.map(ms => {
                const pct = Math.min(100, (appState.stepVault / ms.threshold) * 100);
                return (
                  <div className="pw-milestone-row" key={ms.threshold}>
                    <div className="pw-milestone-label">
                      <span>{fmtFull(appState.stepVault)} / {fmtFull(ms.threshold)}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="pw-milestone-bar-bg">
                      <div className="pw-milestone-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className={`pw-milestone-reward ${ms.reward}`}>
                      Reward: {ms.reward} pack · resets to 0
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5. Pack Inventory */}
            <div className="pw-section">
              <div className="pw-section-title">Pack Inventory</div>
              <div className="pw-pack-grid">
                {(['common', 'rare', 'epic', 'legendary']).map(tier => (
                  <div className={`pw-pack-store-card ${tier}${appState.packInventory[tier] > 0 ? ' has-pack' : ''}`} key={tier}>
                    <div className="pw-psc-tier">{tier}</div>
                    <div className="pw-psc-count">×{appState.packInventory[tier]}</div>
                    <div className="pw-psc-unit">packs</div>
                    {appState.packInventory[tier] > 0 ? (
                      <button className="pw-psc-btn" onClick={() => handleOpenPack(tier)}>
                        Open
                      </button>
                    ) : (
                      <div className="pw-psc-need">Empty</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Active Team */}
            <div className="pw-section">
              <div className="pw-section-title">Active Team ({teamPokemon.length}/6)</div>
              {teamPokemon.length === 0 ? (
                <div className="pw-empty">No team members yet. Catch Pokémon to build your team!</div>
              ) : (
                <div className="pw-team-scroll">
                  {teamPokemon.map(p => (
                    <div
                      key={p.uid}
                      className="pw-team-card"
                      onClick={() => setDetailPokemon(p)}
                    >
                      {p.sprite ? (
                        <img src={p.sprite} alt={p.name} className="pw-team-sprite" />
                      ) : (
                        <div style={{ width: 56, height: 56, margin: '0 auto', fontSize: 36, lineHeight: '56px' }}>❓</div>
                      )}
                      <div className="pw-team-name">{p.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Storage */}
            <div className="pw-section">
              <div className="pw-section-title">Storage ({storagePokemon.length})</div>
              {storagePokemon.length === 0 ? (
                <div className="pw-empty">Storage is empty.</div>
              ) : (
                <div className="pw-storage-grid">
                  {storagePokemon.map(p => (
                    <div key={p.uid} className="pw-storage-card" onClick={() => setDetailPokemon(p)}>
                      {p.sprite ? (
                        <img src={p.sprite} alt={p.name} className="pw-storage-sprite" />
                      ) : (
                        <div style={{ fontSize: 32, lineHeight: '60px', textAlign: 'center' }}>❓</div>
                      )}
                      <div className="pw-storage-name">{p.name}</div>
                      <div className="pw-storage-region">{getRegion(p.dexId)}</div>
                      <div className="pw-storage-types">
                        {p.types.map(t => <TypeBadge key={t} type={t} />)}
                      </div>
                      <button
                        className="pw-storage-team-btn"
                        onClick={e => { e.stopPropagation(); handleAddTeam(p.uid); }}
                        disabled={team.length >= 6}
                      >
                        → Team
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── COLLECTION TAB ─── */}
        {tab === 'collection' && (
          <>
            <div className="pw-collection-header">
              Unique: <span>{uniqueByDex.length}</span> / 1025 &nbsp;&nbsp;
              Total: <span>{appState.pokemon.length}</span>
            </div>
            {appState.pokemon.length === 0 ? (
              <div className="pw-empty">No Pokémon yet. Open some packs!</div>
            ) : (
              <>
                {(['legendary', 'epic', 'rare', 'common']).map(tier => {
                  const group = uniqueByDex.filter(p => p.packTier === tier);
                  if (group.length === 0) return null;
                  return (
                    <div key={tier} className="pw-coll-section">
                      <div className={`pw-coll-section-title ${tier}`}>
                        {tier} <span>{group.length}</span>
                      </div>
                      <div className="pw-collection-grid">
                        {group.map(p => (
                          <div
                            key={p.dexId}
                            className={`pw-coll-card ${tier}`}
                            onClick={() => {
                              const actual = appState.pokemon.find(pk => pk.dexId === p.dexId);
                              setDetailPokemon(actual || p);
                            }}
                          >
                            {p.count > 1 && <span className="pw-dup-badge">×{p.count}</span>}
                            {p.sprite ? (
                              <img src={p.sprite} alt={p.name} className="pw-coll-sprite" />
                            ) : (
                              <div style={{ width: 56, height: 56, fontSize: 32, lineHeight: '56px', textAlign: 'center' }}>❓</div>
                            )}
                            <div className="pw-coll-name">{p.name}</div>
                            <div className="pw-coll-region">{getRegion(p.dexId)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
