import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import '../styles/pokemon-walker.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const LS_KEY = 'fw_pokemon_walker';

const PACK_COSTS = { common: 5000, rare: 10000, epic: 20000, legendary: 40000 };

// ─── Loan constants ───────────────────────────────────────────────────────────
const LOAN_BASE           = 50_000;
const LOAN_PENALTY        = 50_000;
const LOAN_DAILY_REQ      = 3_000;
const LOAN_REPAY_DAYS     = 10;
const LOAN_PREVIEW_WINDOW = 20_000;

// ─── Egg constants ────────────────────────────────────────────────────────────
const EGG_BASE            = 10_000;   // new egg at every 10k lifetime vault steps
const EGG_DAILY_REQ       = 5_000;    // steps/day to progress the egg
const EGG_HATCH_DAYS      = 10;       // fixed 10 days to hatch (pauses on miss, no penalty)
const EGG_CLAIM_HOURS     = 24;       // claim window after vault milestone hit
const EGG_PREVIEW_WINDOW  = 5_000;    // show panel only within 5k vault steps of threshold

function eggThreshold(index) {
  return EGG_BASE * (index + 1);
}

function eggTier(index) {
  return index % 5 === 4 ? 'rare' : 'common'; // every 5th egg is Rare
}

function initEgg() {
  return {
    index: 0,
    status: 'waiting',     // waiting | available | active | hatching
    tier: null,
    availableUntil: null,  // ms timestamp — 24hr claim window
    claimedDate: null,
    daysCompleted: 0,
    lastHatchDate: null,
  };
}

// ─── Debt Trap constants ──────────────────────────────────────────────────────
const DT_FACTIONS = [
  'The Eastern Consortium', 'The Iron Peninsula', 'The Northern Accord',
  'The Pacific Syndicate', 'The Southern Coalition', 'The Amber Alliance',
  'The Steel Dominion', 'The Crimson Republic',
];

function dtRand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDebtTrap(index, defaultCount) {
  const dailyTarget = Math.min(
    Math.max(5000 + index * 400 + dtRand(-500, 500) + defaultCount * 2000, 3000),
    15000
  );
  const duration = Math.min(Math.max(10 + Math.floor(index / 2) + dtRand(-2, 2), 8), 30);
  const compoundRate = index < 5 ? 1 : 2;

  const reward = { common: 0, rare: 0, epic: 0, legendary: 0, vaultBonus: 0 };
  if (index <= 1) {
    reward.common = dtRand(1, 3); reward.rare = dtRand(1, 2);
    reward.vaultBonus = dtRand(1, 3) * 1000;
  } else if (index <= 3) {
    reward.rare = dtRand(2, 3); reward.epic = dtRand(1, 2);
    reward.vaultBonus = dtRand(3, 6) * 1000;
  } else if (index <= 5) {
    reward.epic = dtRand(2, 3); reward.legendary = dtRand(0, 1);
    reward.vaultBonus = dtRand(5, 10) * 1000;
  } else {
    reward.epic = dtRand(1, 2); reward.legendary = dtRand(1, 2);
    reward.vaultBonus = dtRand(8, 15) * 1000;
  }

  return {
    index,
    defaultCount,
    status: 'available',
    faction: DT_FACTIONS[Math.floor(Math.random() * DT_FACTIONS.length)],
    dailyTarget,
    duration,
    compoundRate,
    reward,
    hasVaultMultiplier: index >= 3,
    hasLegendaryCompanion: index >= 5,
    collateralUid: null,
    legendaryCompanionUid: null,
    daysCompleted: 0,
    daysCompounded: 0,
    missedDays: 0,
    lastPaidDate: null,
    startDate: null,
  };
}

function initDebtTrap() { return generateDebtTrap(0, 0); }

// ─── Fasting Challenge Algorithms ─────────────────────────────────────────

function generateFastingChallenge(tier) {
  const hoursOptions = [8, 10, 12, 14, 16];
  const hours = hoursOptions[Math.floor(Math.random() * hoursOptions.length)];
  let effortMin, effortMax;
  if (tier === 'easy')   { effortMin = 24;  effortMax = 80;  }
  if (tier === 'medium') { effortMin = 100; effortMax = 200; }
  if (tier === 'hard')   { effortMin = 240; effortMax = 500; }
  const effort = effortMin + Math.floor(Math.random() * (effortMax - effortMin + 1));
  const days = Math.max(1, Math.min(60, Math.round(effort / hours)));
  const window = days + Math.ceil(days * 0.25);
  return { hours, days, window };
}

function generateFastingReward(tier) {
  const roll = Math.random();
  if (tier === 'easy') {
    const steps = Math.round((2500 + Math.random() * 5000) / 500) * 500;
    if (roll < 0.40) return { type: 'buddySteps', amount: steps, label: `+${steps.toLocaleString()} Buddy Steps (choose Pokémon)` };
    if (roll < 0.65) return { type: 'pack', packTier: 'common', count: 1, label: '1× Common Pack' };
    if (roll < 0.85) return { type: 'pack', packTier: 'rare', count: 1, label: '1× Rare Pack' };
    return { type: 'buddySteps', amount: steps, label: `+${steps.toLocaleString()} Buddy Steps (choose Pokémon)` };
  }
  if (tier === 'medium') {
    if (roll < 0.35) return { type: 'pack', packTier: 'epic', count: 1, label: '1× Epic Pack' };
    if (roll < 0.60) {
      const steps = Math.round((8000 + Math.random() * 12000) / 1000) * 1000;
      return { type: 'buddySteps', amount: steps, label: `+${steps.toLocaleString()} Buddy Steps (choose Pokémon)` };
    }
    if (roll < 0.80) return { type: 'freeEvolution', label: 'Free Evolution (any team Pokémon)' };
    return { type: 'pack', packTier: 'rare', count: 2, label: '2× Rare Packs' };
  }
  if (tier === 'hard') {
    if (roll < 0.30) return { type: 'pack', packTier: 'legendary', count: 1, label: '1× Legendary Pack' };
    if (roll < 0.55) return { type: 'freeEvolution', label: 'Free Evolution (any team Pokémon)' };
    if (roll < 0.75) return { type: 'combo', parts: ['legendary', 'freeEvolution'], label: '1× Legendary Pack + Free Evolution' };
    return { type: 'pack', packTier: 'epic', count: 2, label: '2× Epic Packs' };
  }
  return { type: 'pack', packTier: 'common', count: 1, label: '1× Common Pack' };
}

function generateFastingPenalty(tier) {
  const roll = Math.random();
  if (tier === 'easy') {
    const amount = Math.round((1000 + Math.random() * 2000) / 500) * 500;
    if (roll < 0.55) return { type: 'loseBuddySteps', amount, label: `Buddy loses ${amount.toLocaleString()} steps` };
    const days = 1 + Math.floor(Math.random() * 2);
    return { type: 'buddyFreeze', days, label: `Buddy steps frozen for ${days} day${days > 1 ? 's' : ''}` };
  }
  if (tier === 'medium') {
    if (roll < 0.40) {
      const amount = Math.round((3000 + Math.random() * 5000) / 500) * 500;
      return { type: 'loseBuddySteps', amount, label: `Buddy loses ${amount.toLocaleString()} steps` };
    }
    if (roll < 0.70) {
      const days = 2 + Math.floor(Math.random() * 3);
      return { type: 'buddyFreeze', days, label: `Buddy steps frozen for ${days} days` };
    }
    return { type: 'buddyReset', label: 'Buddy steps reset to 0' };
  }
  if (tier === 'hard') {
    const freezeDays = 5 + Math.floor(Math.random() * 6);
    if (roll < 0.35) return { type: 'buddyReset', label: 'Buddy steps reset to 0' };
    if (roll < 0.65) return { type: 'buddyFreeze', days: freezeDays, label: `Buddy steps frozen for ${freezeDays} days` };
    return { type: 'combo', parts: ['buddyReset', 'buddyFreeze'], days: freezeDays, label: `Buddy steps reset to 0 + frozen for ${freezeDays} days` };
  }
  return { type: 'buddyReset', label: 'Buddy steps reset to 0' };
}

function applyFastingPenalty(state, penalty) {
  function applyOne(s, type, p) {
    if (type === 'loseBuddySteps' && s.buddy) {
      return { ...s, pokemon: s.pokemon.map(pk => pk.uid === s.buddy ? { ...pk, buddySteps: Math.max(0, (pk.buddySteps || 0) - p.amount) } : pk) };
    }
    if (type === 'buddyReset' && s.buddy) {
      return { ...s, pokemon: s.pokemon.map(pk => pk.uid === s.buddy ? { ...pk, buddySteps: 0 } : pk) };
    }
    if (type === 'buddyFreeze') {
      const until = addDays(todayString(), p.days);
      return { ...s, fasting: { ...s.fasting, frozenPokemon: { until, reason: 'buddy' } } };
    }
    return s;
  }

  if (penalty.type === 'combo') {
    let s = state;
    for (const partType of penalty.parts) s = applyOne(s, partType, penalty);
    return s;
  }
  return applyOne(state, penalty.type, penalty);
}

function initFasting() {
  return {
    unlockedTiers: ['easy'],
    completedTiers: [],
    active: null,
    frozenPokemon: null,
  };
}

function loanThreshold(index, prevDefaulted) {
  return LOAN_BASE * (index + 1) + (prevDefaulted ? LOAN_PENALTY : 0);
}

function initLoan() {
  return {
    index: 0,
    status: 'locked',      // locked | active | complete | defaulted
    pokemon: null,
    pokemonUid: null,
    startDate: null,
    daysCompleted: 0,
    graceUsed: false,
    lastPaidDate: null,
    prevDefaulted: false,
  };
}

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

// Stage-1 Pokémon that can evolve — used as Day Care guest
const DAYCARE_POOL = [
  1,4,7,10,13,16,19,21,23,25,27,29,32,35,37,39,41,43,46,48,50,52,54,56,58,
  60,63,66,69,72,74,77,79,81,84,86,88,90,92,96,98,100,102,104,109,111,116,
  118,120,129,133,138,140,152,155,158,161,163,165,167,170,172,173,174,175,
  177,179,183,187,190,193,194,204,209,216,218,220,223,228,231,236,238,239,
  240,246,252,255,258,261,263,270,273,276,278,280,285,287,290,293,296,303,
  304,311,312,315,316,318,322,325,328,331,333,339,341,343,345,347,353,360,
  361,363,371,374,387,390,393,396,399,401,403,406,408,410,412,418,420,425,
  427,431,433,436,438,440,443,446,447,449,451,453,456,458,495,498,501,504,
  507,509,511,513,515,519,522,524,529,532,535,543,546,551,554,559,564,566,
  568,570,572,574,577,580,582,585,588,590,592,595,599,602,605,607,610,613,
  616,618,621,622,624,627,629,631,633,
];

function initDaycare() {
  return {
    status: 'available',  // 'available' | 'active' | 'cooldown'
    pokemon: null,        // { dexId, name, sprite, types }
    startDate: null,
    stepsAccumulated: 0,
    cooldownUntil: null,
  };
}

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

function pokemonSpriteUrl(dexId) {
  return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(dexId).padStart(3, '0')}.png`;
}

async function fetchPokemonById(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`PokeAPI ${res.status}`);
  const data = await res.json();
  return {
    dexId: data.id,
    name: data.name,
    sprite: pokemonSpriteUrl(data.id),
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
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.floor((db - da) / 86400000);
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
    streakDays: 0,
    bestStreak: 0,
    lastStreakDate: null,
    streak10k: 0,
    bestStreak10k: 0,
    lastStreak10kDate: null,
    bestDay: steps,
    bestDayDate: todayString(),
    loan: initLoan(),
    egg: initEgg(),
    debtTrap: initDebtTrap(),
    vaultFrozenUntil: null,
    buddy: null,
    fasting: initFasting(),
    daycare: initDaycare(),
    stepHistory: [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    let saved = JSON.parse(raw);
    if (!saved.initialized) return null;
    // Migrate older saves
    if (!saved.loan) saved.loan = initLoan();
    if (!saved.egg)  saved.egg  = initEgg();
    if (!saved.debtTrap) saved.debtTrap = initDebtTrap();
    if (saved.vaultFrozenUntil === undefined) saved.vaultFrozenUntil = null;
    if (saved.buddy === undefined) saved.buddy = null;
    if (!saved.fasting) saved.fasting = initFasting();
    if (!saved.daycare) saved.daycare = initDaycare();
    if (!saved.stepHistory) saved.stepHistory = [];
    // Add 10k streak fields if missing (new, never existed before)
    if (saved.streak10k === undefined) {
      saved.streak10k = 0;
      saved.bestStreak10k = 0;
      saved.lastStreak10kDate = null;
    }

    // Fix broken GitHub raw sprite URLs → official Pokémon CDN
    // Also ensure per-Pokémon buddySteps and migrate global buddySteps
    if (Array.isArray(saved.pokemon)) {
      saved.pokemon = saved.pokemon.map(p => ({
        ...(p.sprite && p.sprite.includes('raw.githubusercontent.com') ? { ...p, sprite: pokemonSpriteUrl(p.dexId) } : p),
        buddySteps: p.buddySteps !== undefined ? p.buddySteps : 0,
      }));
      // One-time migration: move global buddySteps to the buddy Pokémon
      if (saved.buddy && saved.buddySteps > 0) {
        saved.pokemon = saved.pokemon.map(p =>
          p.uid === saved.buddy ? { ...p, buddySteps: (p.buddySteps || 0) + saved.buddySteps } : p
        );
      }
    }
    saved.buddySteps = undefined;
    if (saved.loan?.pokemon?.sprite?.includes('raw.githubusercontent.com')) {
      saved.loan.pokemon.sprite = pokemonSpriteUrl(saved.loan.pokemon.dexId);
    }

    // Expire unclaimed egg
    if (saved.egg.status === 'available' && Date.now() > saved.egg.availableUntil) {
      saved.egg = { ...initEgg(), index: saved.egg.index + 1 };
    }

    // Daily reset
    const today = todayString();
    if (saved.todayDate !== today) {
      // Check loan daily payment for the day that just ended
      if (saved.loan.status === 'active') {
        const yesterday = saved.todayDate;
        if (saved.loan.lastPaidDate !== yesterday) {
          if (!saved.loan.graceUsed) {
            saved.loan = { ...saved.loan, graceUsed: true };
          } else {
            // Second miss — default, remove pokemon, advance with 50k penalty on next threshold
            saved.pokemon = (saved.pokemon || []).filter(p => p.uid !== saved.loan.pokemonUid);
            saved.loan = { index: saved.loan.index + 1, status: 'locked', pokemon: null, pokemonUid: null, startDate: null, daysCompleted: 0, graceUsed: false, lastPaidDate: null, prevDefaulted: true };
          }
        }
      }
      // Debt Trap miss check
      if (saved.debtTrap?.status === 'active') {
        const dtYesterday = saved.todayDate;
        if (saved.debtTrap.lastPaidDate !== dtYesterday && saved.todaySteps < saved.debtTrap.dailyTarget) {
          const missedDays = (saved.debtTrap.missedDays || 0) + 1;
          const daysCompounded = saved.debtTrap.daysCompounded + saved.debtTrap.compoundRate;
          const totalRequired = saved.debtTrap.duration + Math.ceil(daysCompounded);
          if (missedDays >= 5 || saved.debtTrap.daysCompleted + (saved.debtTrap.duration - missedDays * saved.debtTrap.compoundRate) <= 0) {
            // DEFAULT
            const newDefaultCount = saved.debtTrap.defaultCount + 1;
            saved.pokemon = (saved.pokemon || []).filter(
              p => p.uid !== saved.debtTrap.collateralUid && p.uid !== saved.debtTrap.legendaryCompanionUid
            );
            if (saved.debtTrap.index >= 3) {
              saved.vaultFrozenUntil = Date.now() + (3 + newDefaultCount) * 24 * 60 * 60 * 1000;
            }
            saved.debtTrap = generateDebtTrap(saved.debtTrap.index + 1, newDefaultCount);
          } else {
            saved.debtTrap = { ...saved.debtTrap, missedDays, daysCompounded };
          }
        }
      }
      // Break streaks if yesterday's steps fell short
      if (saved.todaySteps === 0) {
        saved.streakDays = 0;
        saved.lastStreakDate = null;
      }
      if (saved.todaySteps < 10000) {
        saved.streak10k = 0;
        saved.lastStreak10kDate = null;
      }
      // Check fasting challenge window expiry
      if (saved.fasting?.active?.status === 'running') {
        const fa = saved.fasting.active;
        const windowEnd = addDays(fa.startDate, fa.window);
        if (today > windowEnd) {
          saved = applyFastingPenalty(saved, fa.penalty);
          saved.fasting = { ...saved.fasting, active: { ...fa, status: 'failed' } };
        }
      }
      // Expire frozen Pokémon
      if (saved.fasting?.frozenPokemon && today > saved.fasting.frozenPokemon.until) {
        saved.fasting = { ...saved.fasting, frozenPokemon: null };
      }
      // Day Care cooldown expiry
      if (saved.daycare?.status === 'cooldown' && saved.daycare.cooldownUntil && today >= saved.daycare.cooldownUntil) {
        saved.daycare = initDaycare();
      }
      // Log completed day before resetting
      if (saved.todaySteps > 0) {
        saved.stepHistory = [
          { date: saved.todayDate, steps: saved.todaySteps },
          ...(saved.stepHistory || []),
        ].slice(0, 365);
      }
      saved.todayDate = today;
      saved.todaySteps = 0;
      saved.spendableSteps = 0;
      saved.packInventory = { common: 0, rare: 0, epic: 0, legendary: 0 };
    }

    // Credit loan if today's steps already meet the daily requirement
    // (covers: took loan then reloaded same day, or already had enough steps before taking loan)
    if (saved.loan?.status === 'active' && saved.todaySteps >= LOAN_DAILY_REQ && saved.loan.lastPaidDate !== saved.todayDate) {
      const newDays = (saved.loan.daysCompleted || 0) + 1;
      if (newDays >= LOAN_REPAY_DAYS) {
        saved.pokemon = (saved.pokemon || []).map(p => p.uid === saved.loan.pokemonUid ? { ...p, isLoan: false } : p);
        saved.loan = { index: saved.loan.index + 1, status: 'locked', pokemon: null, pokemonUid: null, startDate: null, daysCompleted: 0, graceUsed: false, lastPaidDate: null, prevDefaulted: false };
      } else {
        saved.loan = { ...saved.loan, daysCompleted: newDays, lastPaidDate: saved.todayDate };
      }
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

function PokemonDetailPopup({ pokemon, allPokemon, team, vault, buddy, onClose, onAddTeam, onRemoveTeam, onEvolve, onSetBuddy, evolving }) {
  const isTeamMember = team.includes(pokemon.uid);
  const ownedCount = allPokemon.filter(p => p.dexId === pokemon.dexId).length;
  const timesEvolved = pokemon.timesEvolved || 0;
  const evolveCost = timesEvolved === 0 ? 50000 : 100000;
  const isEvolving = evolving === pokemon.uid;
  const [nextEvoId, setNextEvoId] = useState(undefined); // undefined=loading, null=none, number=has evo

  useEffect(() => {
    setNextEvoId(undefined);
    fetchEvolution(pokemon.dexId).then(setNextEvoId).catch(() => setNextEvoId(null));
  }, [pokemon.dexId]);

  const canEvolveMore = timesEvolved < 2 && nextEvoId !== null;

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
          {nextEvoId === undefined ? (
            <div className="pw-evolve-max">Checking evolution…</div>
          ) : canEvolveMore ? (
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
            <div className="pw-evolve-max">
              {nextEvoId === null && timesEvolved === 0 ? 'Does Not Evolve' : 'Max Evolution'}
            </div>
          )}
        </div>

        <div className="pw-popup-action-row">
          <button
            className={`pw-popup-buddy-btn${buddy === pokemon.uid ? ' active' : ''}`}
            onClick={() => { onSetBuddy(pokemon.uid); onClose(); }}
          >
            {buddy === pokemon.uid ? '👑 Remove Buddy' : '🤝 Set as Buddy'}
          </button>
        </div>
        <div className="pw-popup-action-row">
          {isTeamMember ? (
            <button className="pw-popup-remove-btn" onClick={() => { onRemoveTeam(pokemon.uid); onClose(); }}>
              → Put in Storage
            </button>
          ) : (
            <button
              className="pw-popup-toteam-btn"
              onClick={() => { onAddTeam(pokemon.uid); onClose(); }}
              disabled={team.length >= 6}
              title={team.length >= 6 ? 'Team is full' : ''}
              style={team.length >= 6 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              {team.length >= 6 ? '🔒 Team Full' : '→ Add to Team'}
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
  const [stepInput, setStepInput] = useState('');
  const [deltaFlash, setDeltaFlash] = useState(null);
  const [packOpening, setPackOpening] = useState(null); // tier string or null
  const [detailPokemon, setDetailPokemon] = useState(null);
  const [showMidnight, setShowMidnight] = useState(false);
  const [evolving, setEvolving] = useState(null); // uid of Pokémon being evolved
  const [launchInput, setLaunchInput] = useState('');
  const [clockTime, setClockTime] = useState('');
  const [packWarning, setPackWarning] = useState(null); // '9pm' | '11pm' | null
  const [stepsWarning, setStepsWarning] = useState(false);
  const [editingSpendable, setEditingSpendable] = useState(false);
  const [spendableEditVal, setSpendableEditVal] = useState('');
  const [showLoanPanel, setShowLoanPanel] = useState(false);
  const [takingLoan, setTakingLoan] = useState(false);
  const [showEggPanel, setShowEggPanel] = useState(false);
  const [showChallengePanel, setShowChallengePanel] = useState(false);
  const [showBuddyDetail, setShowBuddyDetail] = useState(false);
  const [acceptingDT, setAcceptingDT] = useState(false);
  const [selectedCollateral, setSelectedCollateral] = useState(null);
  const [showVaultPanel, setShowVaultPanel] = useState(false);
  const [showPacksPanel, setShowPacksPanel] = useState(false);
  const [showMyPokemonPanel, setShowMyPokemonPanel] = useState(false);
  const [showSystemsPanel, setShowSystemsPanel] = useState(false);
  const [showFastingPanel, setShowFastingPanel] = useState(false);
  const [fastingPending, setFastingPending] = useState(null);
  const [fastingPickedPoke, setFastingPickedPoke] = useState(null);
  const [freeEvolving, setFreeEvolving] = useState(false);
  const [startingDaycare, setStartingDaycare] = useState(false);
  const [showDaycarePanel, setShowDaycarePanel] = useState(false);
  const [showStepsHistoryPanel, setShowStepsHistoryPanel] = useState(false);
  const [showDaycareDetail, setShowDaycareDetail] = useState(false);
  const [mysteryIds] = useState(() => ({
    common: POOLS.common[Math.floor(Math.random() * POOLS.common.length)],
    rare: POOLS.rare[Math.floor(Math.random() * POOLS.rare.length)],
    epic: POOLS.epic[Math.floor(Math.random() * POOLS.epic.length)],
    legendary: POOLS.legendary[Math.floor(Math.random() * POOLS.legendary.length)],
  }));
  const midnightChecked = useRef(false);
  const packWarningChecked = useRef({ '9pm': false, '11pm': false });
  const stepsWarningChecked = useRef(false);

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

  // ─── Spendable steps 9 PM warning ───────────────────────────────────
  useEffect(() => {
    const check = () => {
      if (!appState || stepsWarningChecked.current) return;
      if ((appState.spendableSteps || 0) === 0) return;
      const h = new Date().getHours();
      if (h >= 21 && h < 23) {
        stepsWarningChecked.current = true;
        setStepsWarning(true);
      }
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [appState]);

  // ─── Egg hatch (fires when status flips to 'hatching') ──────────────
  const hatchingTier = appState?.egg?.status === 'hatching' ? appState.egg.tier : null;
  useEffect(() => {
    if (!hatchingTier) return;
    let cancelled = false;
    (async () => {
      try {
        const ownedDexIds = new Set((appState?.pokemon || []).map(p => p.dexId));
        const id = pickFromPool(hatchingTier, ownedDexIds);
        const poke = await fetchPokemonById(id);
        if (cancelled) return;
        const uid = makeUID();
        setAppState(prev => ({
          ...prev,
          pokemon: [...prev.pokemon, { uid, ...poke, packTier: hatchingTier, onTeam: false, xp: 0, level: 1 }],
          egg: { ...initEgg(), index: prev.egg.index + 1 },
        }));
        setDeltaFlash(`🥚 Egg hatched! ${poke.name} is yours!`);
        setTimeout(() => setDeltaFlash(null), 4000);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [hatchingTier]);

  // ─── Derived state ──────────────────────────────────────────────────
  const team = appState ? appState.pokemon.filter(p => p.onTeam).map(p => p.uid) : [];
  const teamPokemon = appState ? appState.pokemon.filter(p => p.onTeam) : [];
  const storagePokemon = appState ? appState.pokemon.filter(p => !p.onTeam) : [];


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
      const todayStr = todayString();
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterdayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // ── Daily streak (any steps logged) ──────────────────────────────
      let newStreakDays = prev.streakDays || 0;
      let newBestStreak = prev.bestStreak || 0;
      let newLastStreakDate = prev.lastStreakDate || null;
      if (delta > 0 && newLastStreakDate !== todayStr) {
        newStreakDays = newLastStreakDate === yesterdayStr ? newStreakDays + 1 : 1;
        newBestStreak = Math.max(newBestStreak, newStreakDays);
        newLastStreakDate = todayStr;
      }

      // ── 10k streak ───────────────────────────────────────────────────
      let newStreak10k = prev.streak10k || 0;
      let newBestStreak10k = prev.bestStreak10k || 0;
      let newLastStreak10kDate = prev.lastStreak10kDate || null;
      if (newTodaySteps >= 10000 && newLastStreak10kDate !== todayStr) {
        newStreak10k = newLastStreak10kDate === yesterdayStr ? newStreak10k + 1 : 1;
        newBestStreak10k = Math.max(newBestStreak10k, newStreak10k);
        newLastStreak10kDate = todayStr;
      }

      // ── Buddy steps (per-Pokémon) ─────────────────────────────────────
      let newPokemon = prev.buddy && delta > 0
        ? prev.pokemon.map(p => p.uid === prev.buddy ? { ...p, buddySteps: (p.buddySteps || 0) + delta } : p)
        : [...prev.pokemon];

      // ── Loan daily payment check ──────────────────────────────────────
      let newLoan = prev.loan;
      if (newLoan.status === 'active' && newTodaySteps >= LOAN_DAILY_REQ) {
        const today = todayString();
        if (newLoan.lastPaidDate !== today) {
          const newDays = newLoan.daysCompleted + 1;
          if (newDays >= LOAN_REPAY_DAYS) {
            // Loan paid off — Pokémon is permanently theirs
            newPokemon = newPokemon.map(p =>
              p.uid === newLoan.pokemonUid ? { ...p, isLoan: false } : p
            );
            newLoan = { index: newLoan.index + 1, status: 'locked', pokemon: null, pokemonUid: null, startDate: null, daysCompleted: 0, graceUsed: false, lastPaidDate: null, prevDefaulted: false };
            setDeltaFlash('🎉 Loan paid off! Pokémon is yours!');
            setTimeout(() => setDeltaFlash(null), 4000);
          } else {
            newLoan = { ...newLoan, daysCompleted: newDays, lastPaidDate: today };
          }
        }
      }

      // ── Egg daily progress check ──────────────────────────────────────
      let newEgg = prev.egg;
      if (newEgg.status === 'active' && newTodaySteps >= EGG_DAILY_REQ) {
        const today = todayString();
        if (newEgg.lastHatchDate !== today) {
          const newDays = newEgg.daysCompleted + 1;
          newEgg = newDays >= EGG_HATCH_DAYS
            ? { ...newEgg, daysCompleted: newDays, lastHatchDate: today, status: 'hatching' }
            : { ...newEgg, daysCompleted: newDays, lastHatchDate: today };
        }
      }

      // ── Day Care step accumulation ────────────────────────────────────
      let newDaycare = prev.daycare || initDaycare();
      let newPackInventory = { ...prev.packInventory };
      if (newDaycare.status === 'active' && delta > 0) {
        const newAccum = (newDaycare.stepsAccumulated || 0) + delta;
        const daysElapsed = daysBetween(newDaycare.startDate, todayString());
        if (newAccum >= 50000) {
          newPackInventory = { ...newPackInventory, rare: newPackInventory.rare + 1 };
          newDaycare = initDaycare();
          setDeltaFlash('🎉 Day Care complete! Got a Rare Pack!');
          setTimeout(() => setDeltaFlash(null), 4000);
        } else if (daysElapsed >= 10) {
          newDaycare = { ...newDaycare, status: 'cooldown', cooldownUntil: addDays(todayString(), 3) };
        } else {
          newDaycare = { ...newDaycare, stepsAccumulated: newAccum };
        }
      }

      // ── Debt Trap daily payment ────────────────────────────────────────
      let newDT = prev.debtTrap;
      if (newDT?.status === 'active' && newTodaySteps >= newDT.dailyTarget) {
        const dtToday = todayString();
        if (newDT.lastPaidDate !== dtToday) {
          const newDaysCompleted = newDT.daysCompleted + 1;
          const totalRequired = newDT.duration + Math.ceil(newDT.daysCompounded);
          if (newDaysCompleted >= totalRequired) {
            // COMPLETED — release collateral, companion becomes permanent
            newPokemon = newPokemon.map(p => {
              if (p.uid === newDT.collateralUid) return { ...p, isDTCollateral: false };
              if (p.uid === newDT.legendaryCompanionUid) return { ...p, isDTLoan: false };
              return p;
            });
            setDeltaFlash('🎉 Challenge complete! New deal generated.');
            setTimeout(() => setDeltaFlash(null), 4000);
            newDT = generateDebtTrap(newDT.index + 1, newDT.defaultCount);
          } else {
            newDT = { ...newDT, daysCompleted: newDaysCompleted, lastPaidDate: dtToday };
          }
        }
      }

      const next = {
        ...prev,
        todaySteps: newTodaySteps,
        spendableSteps: newSpendable,
        totalStepsWalked: newTotalWalked,
        collectorLevel: newLevel,
        achievements: newAch,
        bestDay: newBestDay,
        bestDayDate: newBestDayDate,
        loan: newLoan,
        egg: newEgg,
        debtTrap: newDT,
        daycare: newDaycare,
        packInventory: newPackInventory,
        pokemon: newPokemon,
        streakDays: newStreakDays,
        bestStreak: newBestStreak,
        lastStreakDate: newLastStreakDate,
        streak10k: newStreak10k,
        bestStreak10k: newBestStreak10k,
        lastStreak10kDate: newLastStreak10kDate,
      };
      if (delta > 0) {
        setDeltaFlash(`+${fmtFull(delta)} new steps`);
        setTimeout(() => setDeltaFlash(null), 3000);
      }
      return next;
    });
    setStepInput('');
  };

  // ─── Start Day Care ──────────────────────────────────────────────────
  const handleStartDaycare = useCallback(async () => {
    if (startingDaycare) return;
    setStartingDaycare(true);
    try {
      const dexId = DAYCARE_POOL[Math.floor(Math.random() * DAYCARE_POOL.length)];
      const poke = await fetchPokemonById(dexId);
      setAppState(prev => {
        if (prev.daycare?.status !== 'available') return prev;
        return {
          ...prev,
          daycare: {
            status: 'active',
            pokemon: poke,
            startDate: todayString(),
            stepsAccumulated: 0,
            cooldownUntil: null,
          },
        };
      });
    } catch {
      // silently ignore — user can retry
    } finally {
      setStartingDaycare(false);
    }
  }, [startingDaycare]);

  // ─── Edit spendable directly ─────────────────────────────────────────
  const handleSpendableEdit = () => {
    setSpendableEditVal(String(appState.spendableSteps || 0));
    setEditingSpendable(true);
  };

  const handleSpendableSave = () => {
    const val = parseInt(spendableEditVal, 10);
    if (!isNaN(val) && val >= 0) {
      setAppState(prev => ({ ...prev, spendableSteps: val }));
    }
    setEditingSpendable(false);
    setSpendableEditVal('');
  };

  // ─── Take loan ───────────────────────────────────────────────────────
  const handleTakeLoan = async () => {
    setTakingLoan(true);
    try {
      const ownedDexIds = new Set(appState.pokemon.map(p => p.dexId));
      const id = pickFromPool('epic', ownedDexIds);
      const poke = await fetchPokemonById(id);
      const uid = makeUID();
      setAppState(prev => {
        const alreadyPaid = prev.todaySteps >= LOAN_DAILY_REQ;
        return {
          ...prev,
          pokemon: [...prev.pokemon, {
            uid,
            ...poke,
            packTier: 'epic',
            slot: 'storage',
            xp: 0,
            level: 1,
            isLoan: true,
          }],
          loan: {
            ...prev.loan,
            status: 'active',
            pokemon: poke,
            pokemonUid: uid,
            startDate: todayString(),
            daysCompleted: alreadyPaid ? 1 : 0,
            graceUsed: false,
            lastPaidDate: alreadyPaid ? todayString() : null,
          },
        };
      });
    } catch {
      // fetchPokemonById failed — silently ignore, user can retry
    }
    setTakingLoan(false);
  };

  // ─── Accept Debt Trap ────────────────────────────────────────────────
  const handleAcceptDebtTrap = async (collateralUid) => {
    if (!appState?.debtTrap || appState.debtTrap.status !== 'available' || !collateralUid) return;
    setAcceptingDT(true);
    let legendaryPoke = null;
    let legendaryCompanionUid = null;
    try {
      if (appState.debtTrap.hasLegendaryCompanion) {
        const pool = [144,145,146,150,151,249,250,251,377,378,379,380,381,382,383,384,385,386];
        const unowned = pool.filter(id => !appState.pokemon.find(p => p.dexId === id));
        const src = unowned.length > 0 ? unowned : pool;
        const id = src[Math.floor(Math.random() * src.length)];
        legendaryPoke = await fetchPokemonById(id);
        legendaryCompanionUid = makeUID();
      }
    } catch {}
    setAppState(prev => {
      const dt = prev.debtTrap;
      const newPacks = { ...prev.packInventory };
      ['common','rare','epic','legendary'].forEach(tier => {
        if (dt.reward[tier] > 0) newPacks[tier] = (newPacks[tier] || 0) + dt.reward[tier];
      });
      let newPokemon = prev.pokemon.map(p =>
        p.uid === collateralUid ? { ...p, isDTCollateral: true } : p
      );
      if (legendaryPoke && legendaryCompanionUid) {
        newPokemon = [...newPokemon, {
          uid: legendaryCompanionUid,
          dexId: legendaryPoke.dexId,
          name: legendaryPoke.name,
          sprite: legendaryPoke.sprite,
          types: legendaryPoke.types,
          timesEvolved: 0,
          location: 'Debt Trap Companion',
          packTier: 'legendary',
          caughtDate: todayString(),
          onTeam: false,
          isDTLoan: true,
        }];
      }
      return {
        ...prev,
        packInventory: newPacks,
        stepVault: prev.stepVault + dt.reward.vaultBonus,
        pokemon: newPokemon,
        debtTrap: {
          ...dt,
          status: 'active',
          collateralUid,
          legendaryCompanionUid,
          startDate: todayString(),
        },
      };
    });
    setSelectedCollateral(null);
    setAcceptingDT(false);
  };

  // ─── Claim egg ───────────────────────────────────────────────────────
  const handleClaimEgg = () => {
    setAppState(prev => {
      if (prev.egg.status !== 'available') return prev;
      return {
        ...prev,
        egg: { ...prev.egg, status: 'active', claimedDate: todayString(), daysCompleted: 0, lastHatchDate: null },
      };
    });
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
      if (prev.vaultFrozenUntil && Date.now() < prev.vaultFrozenUntil) return prev;
      const deposit = prev.spendableSteps;
      const newVault = prev.stepVault + deposit;
      const newLifetime = prev.lifetimeVaultDeposits + deposit;
      const { newPacks, resetVault } = checkVaultMilestones(newVault, prev.packInventory);
      // Check if vault milestone crossed for egg
      let newEgg = prev.egg;
      if (newEgg.status === 'waiting' && newLifetime >= eggThreshold(newEgg.index)) {
        newEgg = {
          ...newEgg,
          status: 'available',
          tier: eggTier(newEgg.index),
          availableUntil: Date.now() + EGG_CLAIM_HOURS * 60 * 60 * 1000,
        };
      }
      return {
        ...prev,
        spendableSteps: 0,
        stepVault: resetVault,
        lifetimeVaultDeposits: newLifetime,
        packInventory: newPacks,
        egg: newEgg,
      };
    });
  };

  // ─── Open pack (start pack screen) ───────────────────────────────────
  const handleOpenPack = (tier) => {
    if (!appState || appState.packInventory[tier] <= 0) return;
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
        buddySteps: 0,
      };
      const newPokemon = [...prev.pokemon, newPoke];
      const newAch = checkAchievements({ ...prev, pokemon: newPokemon });
      return {
        ...prev,
        pokemon: newPokemon,
        achievements: newAch,
        packInventory: { ...prev.packInventory, [newPoke.packTier]: prev.packInventory[newPoke.packTier] - 1 },
      };
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

  // ─── Close all icon panels ───────────────────────────────────────────
  const closeAllPanels = () => {
    setShowVaultPanel(false);
    setShowPacksPanel(false);
    setShowMyPokemonPanel(false);
    setShowSystemsPanel(false);
    setShowStepsHistoryPanel(false);
  };

  // ─── Set / unset buddy ────────────────────────────────────────────────
  const handleSetBuddy = (uid) => {
    setAppState(prev => ({ ...prev, buddy: prev.buddy === uid ? null : uid }));
  };

  // ─── Evolve buddy via 50k buddy steps ────────────────────────────────
  const handleBuddyEvolve = async () => {
    if (!appState?.buddy || evolving) return;
    const poke = appState.pokemon.find(p => p.uid === appState.buddy);
    if (!poke || (poke.buddySteps || 0) < 50000) return;
    setEvolving(appState.buddy);
    try {
      const nextId = await fetchEvolution(poke.dexId);
      if (!nextId) {
        setDeltaFlash(`${poke.name} has no further evolution`);
        setTimeout(() => setDeltaFlash(null), 3000);
        setEvolving(null);
        return;
      }
      const evolved = await fetchPokemonById(nextId);
      setAppState(prev => ({
        ...prev,
        pokemon: prev.pokemon.map(p =>
          p.uid === prev.buddy
            ? { ...p, dexId: evolved.dexId, name: evolved.name, sprite: evolved.sprite, types: evolved.types, timesEvolved: (p.timesEvolved || 0) + 1, buddySteps: (p.buddySteps || 0) - 50000 }
            : p
        ),
      }));
      setDeltaFlash(`✨ ${poke.name} evolved into ${evolved.name}!`);
      setTimeout(() => setDeltaFlash(null), 4000);
    } catch {}
    setEvolving(null);
  };

  // ─── Fasting Challenge handlers ──────────────────────────────────────
  const handleGenerateFasting = (tier) => {
    const challenge = generateFastingChallenge(tier);
    const reward = generateFastingReward(tier);
    const penalty = generateFastingPenalty(tier);
    setFastingPending({ tier, ...challenge, reward, penalty });
    setFastingPickedPoke(null);
  };

  const handleAcceptFasting = () => {
    if (!fastingPending) return;
    setAppState(prev => ({
      ...prev,
      fasting: {
        ...prev.fasting,
        active: {
          ...fastingPending,
          startDate: todayString(),
          fastsCompleted: 0,
          lastLogDate: null,
          status: 'running',
        },
      },
    }));
    setFastingPending(null);
  };

  const handleLogFast = () => {
    setAppState(prev => {
      const fa = prev.fasting?.active;
      if (!fa || fa.status !== 'running') return prev;
      const today = todayString();
      if (fa.lastLogDate === today) return prev;
      const newCompleted = fa.fastsCompleted + 1;
      const done = newCompleted >= fa.days;
      return {
        ...prev,
        fasting: {
          ...prev.fasting,
          active: {
            ...fa,
            fastsCompleted: newCompleted,
            lastLogDate: today,
            status: done ? 'rewarding' : 'running',
          },
        },
      };
    });
  };

  const handleClaimFastingReward = (pickedUid) => {
    setAppState(prev => {
      const fa = prev.fasting?.active;
      if (!fa || fa.status !== 'rewarding') return prev;
      const reward = fa.reward;
      let next = { ...prev };

      const applyPack = (s, tier, count) => ({
        ...s,
        packInventory: { ...s.packInventory, [tier]: (s.packInventory[tier] || 0) + count },
      });

      if (reward.type === 'pack') {
        next = applyPack(next, reward.packTier, reward.count);
      } else if (reward.type === 'buddySteps' && pickedUid) {
        next = {
          ...next,
          buddy: pickedUid,
          pokemon: next.pokemon.map(p =>
            p.uid === pickedUid ? { ...p, buddySteps: (p.buddySteps || 0) + reward.amount } : p
          ),
        };
      } else if (reward.type === 'combo') {
        if (reward.parts.includes('legendary')) next = applyPack(next, 'legendary', 1);
      }

      const tier = fa.tier;
      const completedTiers = prev.fasting.completedTiers.includes(tier)
        ? prev.fasting.completedTiers
        : [...prev.fasting.completedTiers, tier];
      const tierOrder = ['easy', 'medium', 'hard'];
      const nextTierIdx = tierOrder.indexOf(tier) + 1;
      const unlockedTiers = nextTierIdx < tierOrder.length && !prev.fasting.unlockedTiers.includes(tierOrder[nextTierIdx])
        ? [...prev.fasting.unlockedTiers, tierOrder[nextTierIdx]]
        : prev.fasting.unlockedTiers;

      return {
        ...next,
        fasting: {
          ...next.fasting,
          active: { ...fa, status: 'done' },
          completedTiers,
          unlockedTiers,
        },
      };
    });
    setFastingPickedPoke(null);
  };

  const handleFreeEvolve = async (uid) => {
    if (freeEvolving || !uid) return;
    const poke = appState.pokemon.find(p => p.uid === uid);
    if (!poke) return;
    setFreeEvolving(true);
    try {
      const nextId = await fetchEvolution(poke.dexId);
      if (!nextId) {
        setFreeEvolving(false);
        setFastingPickedPoke(null);
        setDeltaFlash("⚠ That Pokémon can't evolve further — pick another!");
        setTimeout(() => setDeltaFlash(null), 3000);
        return;
      }
      const evolved = await fetchPokemonById(nextId);
      setAppState(prev => {
        const fa = prev.fasting?.active;
        return {
          ...prev,
          pokemon: prev.pokemon.map(p =>
            p.uid === uid
              ? { ...p, dexId: evolved.dexId, name: evolved.name, sprite: evolved.sprite, types: evolved.types, timesEvolved: (p.timesEvolved || 0) + 1 }
              : p
          ),
          fasting: {
            ...prev.fasting,
            active: fa ? { ...fa, status: 'done' } : fa,
            completedTiers: fa && !prev.fasting.completedTiers.includes(fa.tier) ? [...prev.fasting.completedTiers, fa.tier] : prev.fasting.completedTiers,
            unlockedTiers: (() => {
              if (!fa) return prev.fasting.unlockedTiers;
              const tierOrder = ['easy', 'medium', 'hard'];
              const nextTierIdx = tierOrder.indexOf(fa.tier) + 1;
              return nextTierIdx < tierOrder.length && !prev.fasting.unlockedTiers.includes(tierOrder[nextTierIdx])
                ? [...prev.fasting.unlockedTiers, tierOrder[nextTierIdx]]
                : prev.fasting.unlockedTiers;
            })(),
          },
        };
      });
      setDeltaFlash(`✨ ${poke.name} evolved into ${evolved.name}! (Fasting reward)`);
      setTimeout(() => setDeltaFlash(null), 4000);
    } catch {}
    setFreeEvolving(false);
    setFastingPickedPoke(null);
  };

  const handleDismissFastingResult = () => {
    setAppState(prev => ({
      ...prev,
      fasting: { ...prev.fasting, active: null },
    }));
    setFastingPickedPoke(null);
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
          onClose={() => setPackOpening(null)}
          onCatch={handleCatch}
        />
      </div>
    );
  }

  // ─── Helpers for vault milestone bars ────────────────────────────────
  const upcomingMilestones = VAULT_MILESTONES;

  // ─── Total pack count for sticky bar ────────────────────────────────
  const totalPacks = Object.values(appState.packInventory).reduce((a, b) => a + b, 0);

  const allPokes = appState.pokemon;
  const uniqueDex = new Set(allPokes.map(p => p.dexId));
  const pokedexRegions = [
    { name: 'Kanto', min: 1, max: 151 },
    { name: 'Johto', min: 152, max: 251 },
    { name: 'Hoenn', min: 252, max: 386 },
    { name: 'Sinnoh', min: 387, max: 493 },
    { name: 'Unova', min: 494, max: 649 },
    { name: 'Kalos', min: 650, max: 721 },
    { name: 'Alola', min: 722, max: 809 },
    { name: 'Galar', min: 810, max: 905 },
    { name: 'Paldea', min: 906, max: 1010 },
  ];

  return (
    <div className="gba-body">
      {showMidnight && (
        <MidnightWarning
          spendable={appState.spendableSteps}
          onSpend={handleMidnightSpend}
          onDeposit={handleMidnightDeposit}
          onIgnore={handleMidnightIgnore}
        />
      )}
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
      {stepsWarning && (appState.spendableSteps || 0) > 0 && (
        <div className="pw-pack-warning-banner pw-steps-warning-banner">
          <span className="pw-pack-warning-icon">🏃</span>
          <span className="pw-pack-warning-text">
            You have {fmtFull(appState.spendableSteps)} undeposited steps — deposit them before midnight or they'll be lost!
          </span>
          <button className="pw-pack-warning-dismiss" onClick={() => setStepsWarning(false)}>✕</button>
        </div>
      )}
      {detailPokemon && (
        <PokemonDetailPopup
          pokemon={detailPokemon}
          allPokemon={appState.pokemon}
          team={team}
          vault={appState.stepVault}
          buddy={appState.buddy}
          onClose={() => setDetailPokemon(null)}
          onAddTeam={handleAddTeam}
          onRemoveTeam={handleRemoveTeam}
          onEvolve={handleEvolve}
          onSetBuddy={handleSetBuddy}
          evolving={evolving}
        />
      )}

      <div className="gba-shell">

        {/* Left panel — D-pad */}
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

        {/* Center — screen */}
        <div className="gba-screen-section">
          <div className="gba-bezel">
            <div className="gba-screen">
              <div className="gba-screen-header">
                <div className="gba-screen-stats">
                  <span className="gba-ss-item">👣 {fmtNum(appState.todaySteps)}</span>
                  <span className="gba-ss-item">🏦 {fmtNum(appState.stepVault)}</span>
                  <span className="gba-ss-item">🎁 {totalPacks}</span>
                </div>
                <div className="gba-screen-datetime">{appState.todayDate} · {clockTime}</div>
              </div>

              <div className="gba-screen-main">
              {/* ── Icon Sidebar ── */}
              <div className="pw-icon-sidebar">
                <button
                  className={`pw-icon-btn pw-icon-home${!showVaultPanel && !showPacksPanel && !showMyPokemonPanel && !showSystemsPanel && !showStepsHistoryPanel ? ' active' : ''}`}
                  onClick={closeAllPanels}
                >
                  <span className="pw-icon-bubble"><span className="pw-icon-emoji">🏠</span></span>
                  <span className="pw-icon-tip">Home</span>
                </button>
                <div className="pw-sidebar-sep" />
                {[
                  { key: 'vault',   icon: '🏦', label: 'Vault',        active: showVaultPanel,          toggle: () => { setShowVaultPanel(p => !p); setShowPacksPanel(false); setShowMyPokemonPanel(false); setShowSystemsPanel(false); setShowStepsHistoryPanel(false); } },
                  { key: 'packs',   icon: '📦', label: 'Packs',        active: showPacksPanel,          toggle: () => { setShowPacksPanel(p => !p); setShowVaultPanel(false); setShowMyPokemonPanel(false); setShowSystemsPanel(false); setShowStepsHistoryPanel(false); } },
                  { key: 'pokemon', icon: '🎒', label: 'Pokémon',      active: showMyPokemonPanel,      toggle: () => { setShowMyPokemonPanel(p => !p); setShowVaultPanel(false); setShowPacksPanel(false); setShowSystemsPanel(false); setShowStepsHistoryPanel(false); } },
                  { key: 'systems', icon: '⚔️', label: 'Objectives',   active: showSystemsPanel,        toggle: () => { setShowSystemsPanel(p => !p); setShowVaultPanel(false); setShowPacksPanel(false); setShowMyPokemonPanel(false); setShowStepsHistoryPanel(false); } },
                  { key: 'history', icon: '📅', label: 'Daily Steps',  active: showStepsHistoryPanel,   toggle: () => { setShowStepsHistoryPanel(p => !p); setShowVaultPanel(false); setShowPacksPanel(false); setShowMyPokemonPanel(false); setShowSystemsPanel(false); } },
                ].map(({ key, icon, label, active, toggle }) => (
                  <button key={key} className={`pw-icon-btn${active ? ' active' : ''}`} onClick={toggle}>
                    <span className="pw-icon-bubble"><span className="pw-icon-emoji">{icon}</span></span>
                    <span className="pw-icon-tip">{label}</span>
                  </button>
                ))}
              </div>
              <div className="gba-screen-content">

                {/* ── Home header ── */}
                <div className="pw-home-header">
                  <span className="pw-ip-title">Home</span>
                </div>

                {/* ── Top Area: Stat Boxes + Buddy Ring ── */}
                {(() => {
                  const buddyPoke = appState.buddy ? appState.pokemon.find(p => p.uid === appState.buddy) : null;
                  const buddySteps = buddyPoke?.buddySteps || 0;
                  const buddyPct = Math.min(100, (buddySteps / 50000) * 100);
                  const ringColor = buddyPct >= 100 ? '#16a34a' : buddyPct >= 50 ? '#FFCB05' : '#9ca3af';
                  const ringGradient = buddyPoke
                    ? `conic-gradient(from -90deg, ${ringColor} ${buddyPct.toFixed(1)}%, rgba(0,0,0,0.10) ${buddyPct.toFixed(1)}%)`
                    : 'conic-gradient(rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.08) 100%)';
                  return (
                    <div className="pw-top-area">
                      <div className="pw-stats-boxes">
                        <div className="pw-stat-box-sm">
                          <span className="pw-stat-box-val">{fmtNum(appState.totalStepsWalked)}</span>
                          <span className="pw-stat-box-label">Total Walked</span>
                        </div>
                        <div className="pw-stat-box-sm">
                          <span className="pw-stat-box-val">{fmtNum(appState.bestDay || 0)}</span>
                          <span className="pw-stat-box-label">Daily Record</span>
                          {appState.bestDayDate && <span className="pw-stat-box-sub">{appState.bestDayDate}</span>}
                        </div>
                        <div className="pw-stat-box-sm">
                          <span className="pw-stat-box-val">{appState.streakDays || 0}d</span>
                          <span className="pw-stat-box-label">Daily Streak</span>
                        </div>
                        <div className="pw-stat-box-sm">
                          <span className="pw-stat-box-val">{appState.streak10k || 0}d</span>
                          <span className="pw-stat-box-label">10K Streak</span>
                        </div>
                      </div>
                      <div
                        className={`pw-buddy-ring-wrap${buddyPoke ? ' has-buddy' : ''}`}
                        onClick={() => buddyPoke && setShowBuddyDetail(p => !p)}
                        title={buddyPoke ? 'Click to see steps' : 'Set a buddy from your Pokémon'}
                      >
                        <div className="pw-buddy-ring" style={{ background: ringGradient }}>
                          <div className="pw-buddy-ring-inner">
                            {buddyPoke?.sprite && (
                              <img src={buddyPoke.sprite} alt={buddyPoke.name} className="pw-buddy-ring-sprite" />
                            )}
                          </div>
                        </div>
                        <div className="pw-buddy-ring-label">Buddy</div>
                        {showBuddyDetail && buddyPoke && (
                          <>
                            <div className="pw-buddy-popup-backdrop" onClick={e => { e.stopPropagation(); setShowBuddyDetail(false); }} />
                          <div className="pw-buddy-popup" onClick={e => e.stopPropagation()}>
                            <div className="pw-buddy-popup-name">{buddyPoke.name}</div>
                            <div className="pw-buddy-popup-progress-row">
                              <span className="pw-buddy-popup-done">{fmtFull(buddySteps)}</span>
                              <span className="pw-buddy-popup-max">/ 50,000</span>
                            </div>
                            <div className="pw-buddy-popup-bar">
                              <div className="pw-buddy-popup-bar-fill" style={{ width: `${buddyPct.toFixed(1)}%`, background: ringColor }} />
                            </div>
                            {buddySteps >= 50000 ? (
                              <button
                                className="pw-buddy-popup-evolve"
                                onClick={e => { e.stopPropagation(); handleBuddyEvolve(); }}
                                disabled={!!evolving}
                              >
                                {evolving === appState.buddy ? 'Evolving…' : '✨ Ready to Evolve!'}
                              </button>
                            ) : (
                              <div className="pw-buddy-popup-left">{fmtFull(50000 - buddySteps)} steps left to evolve</div>
                            )}
                          </div>
                          </>
                        )}
                      </div>

                      {/* Day Care Ring */}
                      {(() => {
                        const dc = appState.daycare || initDaycare();
                        const dcPct = dc.status === 'active' ? Math.min(100, ((dc.stepsAccumulated || 0) / 50000) * 100) : 0;
                        const dcColor = dcPct >= 100 ? '#16a34a' : '#a855f7';
                        const dcGradient = dc.status === 'active'
                          ? `conic-gradient(from -90deg, ${dcColor} ${dcPct.toFixed(1)}%, rgba(168,85,247,0.15) ${dcPct.toFixed(1)}%)`
                          : 'conic-gradient(rgba(168,85,247,0.12) 0%, rgba(168,85,247,0.12) 100%)';
                        const isClickable = dc.status !== 'available';
                        const daysLeft = dc.status === 'active' ? Math.max(0, 10 - daysBetween(dc.startDate, todayString())) : null;
                        const cooldownDays = dc.status === 'cooldown' && dc.cooldownUntil ? Math.max(0, daysBetween(todayString(), dc.cooldownUntil)) : 0;

                        return (
                          <div
                            className={`pw-daycare-ring-wrap${isClickable ? ' pw-daycare-clickable' : ''}${dc.status === 'cooldown' ? ' pw-daycare-cooldown' : ''}`}
                            onClick={() => isClickable && setShowDaycareDetail(p => !p)}
                            title={isClickable ? 'Click for details' : 'Start from Objectives'}
                          >
                            <div className="pw-daycare-ring" style={{ background: dcGradient }}>
                              <div className="pw-daycare-ring-inner">
                                {dc.status === 'active' && dc.pokemon?.sprite
                                  ? <img src={dc.pokemon.sprite} alt={dc.pokemon.name} className="pw-daycare-ring-sprite" />
                                  : <span className="pw-daycare-ring-icon">{dc.status === 'cooldown' ? '😴' : '🥚'}</span>
                                }
                              </div>
                            </div>
                            <div className="pw-daycare-ring-label">Day Care</div>
                            {dc.status === 'available' && <div className="pw-daycare-ready-dot" />}

                            {showDaycareDetail && isClickable && (
                              <>
                                <div className="pw-buddy-popup-backdrop" onClick={e => { e.stopPropagation(); setShowDaycareDetail(false); }} />
                                <div className="pw-daycare-popup" onClick={e => e.stopPropagation()}>
                                  {dc.status === 'active' ? (
                                    <>
                                      <div className="pw-buddy-popup-name">{dc.pokemon?.name}</div>
                                      <div className="pw-buddy-popup-progress-row">
                                        <span className="pw-buddy-popup-done">{fmtFull(dc.stepsAccumulated || 0)}</span>
                                        <span className="pw-buddy-popup-max">/ 50,000</span>
                                      </div>
                                      <div className="pw-buddy-popup-bar">
                                        <div className="pw-buddy-popup-bar-fill" style={{ width: `${dcPct.toFixed(1)}%`, background: dcColor }} />
                                      </div>
                                      <div className="pw-buddy-popup-left">{daysLeft}d left · {fmtFull(50000 - (dc.stepsAccumulated || 0))} steps to go</div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="pw-buddy-popup-name">On Cooldown</div>
                                      <div className="pw-buddy-popup-left">New Pokémon in {cooldownDays} day{cooldownDays !== 1 ? 's' : ''}</div>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}

                {/* Today's Steps */}
                <div className="gba-section">
                  <div className="gba-section-title">Today's Steps</div>
                  <div className="gba-step-big">{fmtFull(appState.todaySteps)}</div>
                  <div className="gba-spendable-row">
                    <span className="gba-spendable-label">
                      Available to spend
                      {!editingSpendable && (
                        <button className="gba-spendable-edit-btn" onClick={handleSpendableEdit} title="Correct">✎</button>
                      )}
                    </span>
                    {editingSpendable ? (
                      <div className="gba-spendable-edit-row">
                        <input
                          className="gba-spendable-edit-input"
                          type="number"
                          min="0"
                          value={spendableEditVal}
                          onChange={e => setSpendableEditVal(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSpendableSave(); if (e.key === 'Escape') setEditingSpendable(false); }}
                          autoFocus
                        />
                        <button className="gba-spendable-save-btn" onClick={handleSpendableSave}>✓</button>
                        <button className="gba-spendable-cancel-btn" onClick={() => setEditingSpendable(false)}>✕</button>
                      </div>
                    ) : (
                      <span className="gba-spendable-val">{fmtFull(appState.spendableSteps || 0)}</span>
                    )}
                  </div>
                  <div className="gba-step-row">
                    <input
                      className="gba-step-input"
                      type="number"
                      min="0"
                      placeholder="Enter today's total steps"
                      value={stepInput}
                      onChange={e => setStepInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveSteps()}
                    />
                    <button className="gba-save-btn" onClick={handleSaveSteps}>Save</button>
                  </div>
                  {deltaFlash && <div className="gba-delta-flash">{deltaFlash}</div>}
                </div>

                {/* Daily Rewards — right below step entry */}
                <div className="gba-section">
                  <div className="gba-section-title">Daily Rewards</div>
                  <div className="gba-pack-grid">
                    {(['common', 'rare', 'epic', 'legendary']).map(tier => {
                      const cost = PACK_COSTS[tier];
                      const canAfford = (appState.spendableSteps || 0) >= cost;
                      const pct = Math.min(100, ((appState.spendableSteps || 0) / cost) * 100);
                      return (
                        <div className={`gba-pack-card ${tier}${canAfford ? ' can-afford' : ''}`} key={tier}>
                          <div className="gba-mystery-wrap">
                            <img src={pokemonSpriteUrl(mysteryIds[tier])} alt="???" className="gba-mystery-sprite" />
                            <span className="gba-mystery-q">?</span>
                          </div>
                          <div className="gba-pack-tier">{tier}</div>
                          <div className="gba-pack-pb"><div className="gba-pack-pb-fill" style={{ width: `${pct}%` }} /></div>
                          <div className="gba-pack-cost">{fmtNum(cost)}</div>
                          {canAfford ? (
                            <button className="gba-pack-btn" onClick={() => handleUnlockPack(tier)}>Unlock</button>
                          ) : (
                            <div className="gba-pack-need">−{fmtNum(cost - (appState.spendableSteps || 0))}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Team */}
                <div className="gba-section">
                  <div className="gba-section-title">Active Team ({teamPokemon.length}/6)</div>
                  {teamPokemon.length === 0 ? (
                    <div className="gba-empty">No team yet. Open packs to catch Pokémon!</div>
                  ) : (
                    <div className="gba-team-scroll">
                      {teamPokemon.map(p => (
                        <div key={p.uid} className={`gba-team-card ${p.packTier || ''}`} onClick={() => setDetailPokemon(p)}>
                          {p.sprite && <img src={p.sprite} alt={p.name} className="gba-team-sprite" />}
                          <div className="gba-team-name">{p.name}</div>
                          <div className="gba-team-region">{getRegion(p.dexId)}</div>
                          <div className="gba-team-types">{p.types.map(t => <TypeBadge key={t} type={t} />)}</div>
                          <div className={`gba-team-tier ${p.packTier}`}>{p.packTier}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


              </div>{/* end gba-screen-content */}

              {/* ── Vault Panel ── */}
              {showVaultPanel && (() => {
                const vaultFrozen = appState.vaultFrozenUntil && Date.now() < appState.vaultFrozenUntil;
                return (
                  <div className="pw-icon-panel">
                    <div className="pw-ip-header">
                      <span className="pw-ip-title">Vault</span>
                    </div>
                    <div className="pw-ip-body">
                      <div className="pw-panel-hero">
                        <div className="pw-panel-hero-val">{fmtFull(appState.stepVault)}</div>
                        <div className="pw-panel-hero-label">steps banked</div>
                        {appState.spendableSteps > 0 && !vaultFrozen && (
                          <button className="pw-panel-action-btn" onClick={handleDepositAll}>
                            Deposit {fmtFull(appState.spendableSteps)} steps
                          </button>
                        )}
                        {vaultFrozen && <div className="pw-panel-frozen">Vault frozen — challenge penalty active</div>}
                      </div>
                      <div className="pw-panel-section-title">Milestones</div>
                      {upcomingMilestones.map(ms => {
                        const pct = Math.min(100, (appState.stepVault / ms.threshold) * 100);
                        return (
                          <div className="pw-panel-milestone" key={ms.threshold}>
                            <div className="pw-panel-milestone-row">
                              <span className="pw-panel-milestone-label">{ms.reward} pack</span>
                              <span className="pw-panel-milestone-pct">{Math.round(pct)}%</span>
                            </div>
                            <div className="gba-milestone-bar">
                              <div className="gba-milestone-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="pw-panel-milestone-sub">{fmtFull(appState.stepVault)} / {fmtFull(ms.threshold)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ── Pack Inventory Panel ── */}
              {showPacksPanel && (
                <div className="pw-icon-panel">
                  <div className="pw-ip-header">
                    <span className="pw-ip-title">Pack Inventory</span>
                  </div>
                  <div className="pw-ip-body">
                    <div className="pw-panel-hero">
                      <div className="pw-panel-hero-val">{totalPacks}</div>
                      <div className="pw-panel-hero-label">packs ready to open</div>
                    </div>
                    <div className="pw-panel-section-title">Your Packs</div>
                    <div className="gba-pack-grid">
                      {(['common', 'rare', 'epic', 'legendary']).map(tier => (
                        <div className={`gba-pack-card ${tier}${appState.packInventory[tier] > 0 ? ' has-pack' : ''}`} key={tier}>
                          <div className="gba-pack-tier">{tier}</div>
                          <div className="gba-pack-count">×{appState.packInventory[tier]}</div>
                          {appState.packInventory[tier] > 0 ? (
                            <button className="gba-pack-btn" onClick={() => { closeAllPanels(); handleOpenPack(tier); }}>Open</button>
                          ) : (
                            <div className="gba-pack-need">Empty</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── My Pokémon Panel ── */}
              {showMyPokemonPanel && (
                <div className="pw-icon-panel">
                  <div className="pw-ip-header">
                    <span className="pw-ip-title">My Pokémon · {allPokes.length}</span>
                  </div>
                  <div className="pw-ip-body">
                    <div className="gba-section-title" style={{ marginBottom: 6 }}>Pokédex · {uniqueDex.size} / 1010</div>
                    <div className="gba-tier-row">
                      {(['legendary', 'epic', 'rare', 'common']).map(tier => (
                        <div key={tier} className={`gba-tier-box ${tier}`}>
                          <div className="gba-tier-count">{allPokes.filter(p => p.packTier === tier).length}</div>
                          <div className="gba-tier-name">{tier}</div>
                        </div>
                      ))}
                    </div>
                    <div className="gba-pokedex-regions" style={{ marginTop: 8 }}>
                      {pokedexRegions.map(r => {
                        const count = [...uniqueDex].filter(id => id >= r.min && id <= r.max).length;
                        const total = r.max - r.min + 1;
                        return (
                          <div key={r.name} className="gba-region-row">
                            <span className="gba-region-name">{r.name}</span>
                            <div className="gba-region-bar"><div className="gba-region-fill" style={{ width: `${(count / total) * 100}%` }} /></div>
                            <span className="gba-region-count">{count}/{total}</span>
                          </div>
                        );
                      })}
                    </div>
                    {teamPokemon.length > 0 && (
                      <>
                        <div className="gba-section-title" style={{ margin: '12px 0 6px' }}>Team ({teamPokemon.length}/6)</div>
                        <div className="gba-team-scroll">
                          {teamPokemon.map(p => (
                            <div key={p.uid} className={`gba-team-card ${p.packTier || ''}`} onClick={() => setDetailPokemon(p)}>
                              {p.sprite && <img src={p.sprite} alt={p.name} className="gba-team-sprite" />}
                                  <div className="gba-team-name">{p.name}</div>
                              <div className={`gba-team-tier ${p.packTier}`}>{p.packTier}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {storagePokemon.length === 0 && teamPokemon.length === 0 ? (
                      <div className="gba-empty">No Pokémon yet. Open packs to catch some!</div>
                    ) : storagePokemon.length > 0 && (
                      <>
                        <div className="gba-section-title" style={{ margin: '12px 0 6px' }}>Storage ({storagePokemon.length})</div>
                        {(['legendary', 'epic', 'rare', 'common']).map(tier => {
                          const group = storagePokemon.filter(p => p.packTier === tier);
                          if (group.length === 0) return null;
                          return (
                            <div key={tier} className="gba-tier-section">
                              <div className={`gba-tier-header ${tier}`}>{tier} <span>{group.length}</span></div>
                              <div className="gba-storage-grid">
                                {group.map(p => (
                                  <div key={p.uid} className="gba-storage-card" onClick={() => setDetailPokemon(p)}>
                                    {p.sprite && <img src={p.sprite} alt={p.name} className="gba-storage-sprite" />}
                                              <div className="gba-storage-name">{p.name}</div>
                                    <div className="gba-storage-region">{getRegion(p.dexId)}</div>
                                    <div className="gba-storage-types">{p.types.map(t => <TypeBadge key={t} type={t} />)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Systems Panel (Loan + Egg + Challenge) ── */}
              {showSystemsPanel && (
                <div className="pw-icon-panel">
                  <div className="pw-ip-header">
                    <span className="pw-ip-title">Objectives</span>
                  </div>
                  <div className="pw-ip-body">

                    {/* Step Loan */}
                    <div className="gba-section">
                      <button className="loan-eligible-btn" onClick={() => setShowLoanPanel(p => !p)}>
                        🏦 {showLoanPanel ? 'Hide loan info' : 'Eligible for a loan?'}
                      </button>
                      {showLoanPanel && (() => {
                        const loan = appState.loan;
                        const totalSteps = appState.totalStepsWalked;
                        const threshold = loanThreshold(loan.index, loan.prevDefaulted);
                        if (loan.status === 'active') {
                          const today = todayString();
                          const paidToday = loan.lastPaidDate === today;
                          const loanPoke = loan.pokemon;
                          return (
                            <div className="loan-panel loan-active">
                              <div className="loan-header">
                                <span className="loan-label">Active Loan · #{loan.index + 1}</span>
                                {loan.graceUsed && !paidToday && <span className="loan-grace-warn">⚠ Grace used — pay today!</span>}
                              </div>
                              <div className="loan-poke-row">
                                {loanPoke?.sprite && <img src={loanPoke.sprite} alt={loanPoke.name} className="loan-poke-sprite" />}
                                <div className="loan-poke-info">
                                  <div className="loan-poke-name">{loanPoke?.name}</div>
                                  <div className="loan-poke-tier">Epic · on loan</div>
                                </div>
                                <div className={`loan-today-badge ${paidToday ? 'paid' : loan.graceUsed ? 'grace' : 'unpaid'}`}>
                                  {paidToday ? '✓ Paid' : loan.graceUsed ? '⚠ Grace' : '● Unpaid'}
                                </div>
                              </div>
                              <div className="loan-progress-row">
                                <span className="loan-progress-label">Day {loan.daysCompleted} / {LOAN_REPAY_DAYS}</span>
                                <div className="loan-bar"><div className="loan-bar-fill" style={{ width: `${(loan.daysCompleted / LOAN_REPAY_DAYS) * 100}%` }} /></div>
                              </div>
                              <div className="loan-daily-reminder">Hit {fmtNum(LOAN_DAILY_REQ)} steps/day · {LOAN_REPAY_DAYS - loan.daysCompleted} days left</div>
                            </div>
                          );
                        }
                        if (loan.status === 'locked' && totalSteps >= threshold) {
                          return (
                            <div className="loan-panel loan-offer">
                              <div className="loan-header">
                                <span className="loan-label">Loan Offer #{loan.index + 1}</span>
                                {loan.prevDefaulted && <span className="loan-penalty-note">+50k threshold (default penalty)</span>}
                              </div>
                              <div className="loan-offer-details">
                                <div className="loan-offer-row"><span>🏆 Reward</span><span>Epic Pokémon</span></div>
                                <div className="loan-offer-row"><span>📅 Duration</span><span>{LOAN_REPAY_DAYS} days</span></div>
                                <div className="loan-offer-row"><span>👟 Daily req.</span><span>{fmtNum(LOAN_DAILY_REQ)} steps</span></div>
                                <div className="loan-offer-row"><span>💰 Total cost</span><span>30,000 steps (3k × 10)</span></div>
                                <div className="loan-offer-row loan-offer-interest"><span>📈 Interest</span><span>50% on 20k base</span></div>
                              </div>
                              <button className="loan-take-btn" onClick={handleTakeLoan} disabled={takingLoan}>
                                {takingLoan ? 'Fetching Pokémon…' : '🤝 Take This Loan'}
                              </button>
                            </div>
                          );
                        }
                        const stepsNeeded = threshold - totalSteps;
                        if (stepsNeeded <= LOAN_PREVIEW_WINDOW) {
                          return (
                            <div className="loan-panel loan-locked">
                              <div className="loan-locked-icon">🔓</div>
                              <div className="loan-locked-title">Almost there — Loan #{loan.index + 1}</div>
                              <div className="loan-locked-desc"><strong>{fmtNum(stepsNeeded)}</strong> more steps to unlock</div>
                              <div className="loan-bar loan-bar-muted"><div className="loan-bar-fill" style={{ width: `${Math.min(totalSteps / threshold, 1) * 100}%` }} /></div>
                              <div className="loan-locked-remaining">Goal: {fmtNum(threshold)} lifetime steps</div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Egg */}
                    <div className="gba-section">
                      <button className="egg-eligible-btn" onClick={() => setShowEggPanel(p => !p)}>
                        🥚 {showEggPanel ? 'Hide egg info' : 'Eligible for an egg?'}
                      </button>
                      {showEggPanel && (() => {
                        const egg = appState.egg;
                        const vaultLifetime = appState.lifetimeVaultDeposits;
                        const threshold = eggThreshold(egg.index);
                        if (egg.status === 'active' || egg.status === 'hatching') {
                          const today = todayString();
                          const doneToday = egg.lastHatchDate === today;
                          return (
                            <div className="egg-panel egg-active">
                              <div className="egg-visual">
                                <span className="egg-icon" style={{ filter: `sepia(${egg.daysCompleted / EGG_HATCH_DAYS})` }}>🥚</span>
                                <div className="egg-tier-badge">{egg.tier}</div>
                              </div>
                              <div className="egg-progress-row">
                                <span className="egg-progress-label">Day {egg.daysCompleted} / {EGG_HATCH_DAYS}</span>
                                <div className="loan-bar"><div className="loan-bar-fill egg-bar-fill" style={{ width: `${(egg.daysCompleted / EGG_HATCH_DAYS) * 100}%` }} /></div>
                              </div>
                              <div className={`egg-today-badge ${doneToday ? 'paid' : 'unpaid'}`}>
                                {egg.status === 'hatching' ? '✨ Hatching…' : doneToday ? `✓ ${fmtNum(EGG_DAILY_REQ)} steps hit today` : `● Hit ${fmtNum(EGG_DAILY_REQ)} steps to progress`}
                              </div>
                            </div>
                          );
                        }
                        if (egg.status === 'available') {
                          const msLeft = egg.availableUntil - Date.now();
                          const hrsLeft = Math.max(0, Math.floor(msLeft / 3_600_000));
                          const minLeft = Math.max(0, Math.floor((msLeft % 3_600_000) / 60_000));
                          return (
                            <div className="egg-panel egg-available">
                              <div className="egg-visual"><span className="egg-icon egg-glow">🥚</span><div className="egg-tier-badge">{egg.tier}</div></div>
                              <div className="egg-avail-title">An egg has appeared!</div>
                              <div className="egg-avail-sub">Claim within {hrsLeft}h {minLeft}m or it disappears</div>
                              <div className="egg-avail-terms">Hit {fmtNum(EGG_DAILY_REQ)} steps/day for {EGG_HATCH_DAYS} days to hatch</div>
                              <button className="egg-claim-btn" onClick={handleClaimEgg}>🤲 Claim Egg</button>
                            </div>
                          );
                        }
                        const vaultNeeded = threshold - vaultLifetime;
                        if (vaultNeeded <= EGG_PREVIEW_WINDOW) {
                          return (
                            <div className="egg-panel egg-locked">
                              <div className="egg-visual"><span className="egg-icon egg-dim">🥚</span></div>
                              <div className="egg-locked-desc"><strong>{fmtNum(vaultNeeded)}</strong> more vault steps to unlock a {eggTier(egg.index)} egg</div>
                              <div className="loan-bar loan-bar-muted"><div className="loan-bar-fill egg-bar-fill" style={{ width: `${Math.min(vaultLifetime / threshold, 1) * 100}%` }} /></div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Debt Trap Challenge */}
                    <div className="gba-section">
                      <button className="dt-challenge-btn" onClick={() => setShowChallengePanel(p => !p)}>
                        ⚔️ Challenge
                        {appState.debtTrap?.status === 'active' && <span className="dt-active-dot" />}
                      </button>
                      {showChallengePanel && (() => {
                        const dt = appState.debtTrap;
                        if (!dt) return null;
                        const vaultFrozen = appState.vaultFrozenUntil && Date.now() < appState.vaultFrozenUntil;
                        if (dt.status === 'active') {
                          const today = todayString();
                          const paidToday = dt.lastPaidDate === today;
                          const totalRequired = dt.duration + Math.ceil(dt.daysCompounded);
                          const collateral = appState.pokemon.find(p => p.uid === dt.collateralUid);
                          const companion = dt.legendaryCompanionUid ? appState.pokemon.find(p => p.uid === dt.legendaryCompanionUid) : null;
                          return (
                            <div className="dt-panel dt-active">
                              <div className="dt-header">
                                <span className="dt-faction">{dt.faction}</span>
                                <span className="dt-deal-num">Deal #{dt.index + 1}</span>
                              </div>
                              {vaultFrozen && <div className="dt-vault-frozen">❄️ Vault frozen — repay first</div>}
                              <div className="dt-progress-row">
                                <span className="dt-progress-label">Day {dt.daysCompleted} / {totalRequired}</span>
                                {dt.daysCompounded > 0 && <span className="dt-compounded">+{Math.ceil(dt.daysCompounded)}d added</span>}
                              </div>
                              <div className="loan-bar"><div className="loan-bar-fill dt-bar-fill" style={{ width: `${Math.min((dt.daysCompleted / totalRequired) * 100, 100)}%` }} /></div>
                              <div className="dt-daily-row">
                                <span>👟 {fmtNum(dt.dailyTarget)} steps/day</span>
                                <div className={`dt-today-badge ${paidToday ? 'paid' : 'unpaid'}`}>{paidToday ? '✓ Paid' : '● Due'}</div>
                              </div>
                              {dt.missedDays > 0 && <div className="dt-missed-warn">⚠ {dt.missedDays} missed — {5 - dt.missedDays} left before default</div>}
                              {collateral && (
                                <div className="dt-poke-row">
                                  <span className="dt-poke-label">🔒 At risk</span>
                                  {collateral.sprite && <img src={collateral.sprite} alt={collateral.name} className="dt-poke-sprite" />}
                                  <span className="dt-poke-name">{collateral.name}</span>
                                </div>
                              )}
                              {companion && (
                                <div className="dt-poke-row dt-companion-row">
                                  <span className="dt-poke-label">👑 Companion</span>
                                  {companion.sprite && <img src={companion.sprite} alt={companion.name} className="dt-poke-sprite" />}
                                  <span className="dt-poke-name">{companion.name}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (dt.status === 'available') {
                          const myPokemon = appState.pokemon.filter(p => !p.isDTCollateral && !p.isDTLoan && !p.isLoan);
                          return (
                            <div className="dt-panel dt-offer">
                              <div className="dt-header">
                                <span className="dt-faction">{dt.faction}</span>
                                <span className="dt-deal-num">Deal #{dt.index + 1}</span>
                              </div>
                              <div className="dt-offer-title">Chandan's Debt Trap Diplomacy Challenge</div>
                              <div className="dt-offer-grid">
                                <div className="dt-offer-row"><span>👟 Daily target</span><span>{fmtNum(dt.dailyTarget)} steps</span></div>
                                <div className="dt-offer-row"><span>📅 Duration</span><span>{dt.duration} days</span></div>
                                <div className="dt-offer-row"><span>📈 Miss penalty</span><span>+{dt.compoundRate}d per miss</span></div>
                                <div className="dt-offer-row dt-risk-row"><span>⚠ Default risk</span><span>lose collateral{dt.index >= 3 ? ' + vault freeze' : ''}</span></div>
                              </div>
                              <div className="dt-reward-section">
                                <div className="dt-reward-title">Immediate Rewards</div>
                                <div className="dt-reward-chips">
                                  {dt.reward.common > 0 && <span className="dt-chip common">{dt.reward.common}× Common</span>}
                                  {dt.reward.rare > 0 && <span className="dt-chip rare">{dt.reward.rare}× Rare</span>}
                                  {dt.reward.epic > 0 && <span className="dt-chip epic">{dt.reward.epic}× Epic</span>}
                                  {dt.reward.legendary > 0 && <span className="dt-chip legendary">{dt.reward.legendary}× Legendary</span>}
                                  {dt.reward.vaultBonus > 0 && <span className="dt-chip vault">+{fmtNum(dt.reward.vaultBonus)} vault</span>}
                                  {dt.hasLegendaryCompanion && <span className="dt-chip companion">👑 Legendary companion</span>}
                                </div>
                              </div>
                              <div className="dt-collateral-section">
                                <div className="dt-collateral-title">🔒 Pick your collateral (lost on default)</div>
                                {myPokemon.length === 0 ? (
                                  <div className="dt-no-pokemon">Catch Pokémon first to proceed</div>
                                ) : (
                                  <div className="dt-pokemon-picker">
                                    {myPokemon.map(p => (
                                      <button
                                        key={p.uid}
                                        className={`dt-poke-pick${selectedCollateral === p.uid ? ' dt-poke-pick-sel' : ''}`}
                                        onClick={() => setSelectedCollateral(selectedCollateral === p.uid ? null : p.uid)}
                                      >
                                        {p.sprite && <img src={p.sprite} alt={p.name} className="dt-poke-sprite-sm" />}
                                        <span className="dt-pick-name">{p.name}</span>
                                        <span className={`dt-pick-tier ${p.packTier}`}>{p.packTier}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                className="dt-accept-btn"
                                disabled={!selectedCollateral || acceptingDT || myPokemon.length === 0}
                                onClick={() => handleAcceptDebtTrap(selectedCollateral)}
                              >
                                {acceptingDT ? 'Sealing the deal…' : '⚔️ Accept the Challenge'}
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Fasting Challenge */}
                    <div className="gba-section">
                      <button className="fast-toggle-btn" onClick={() => setShowFastingPanel(p => !p)}>
                        🍽️ Fasting Challenge
                        {appState.fasting?.active?.status === 'running' && <span className="dt-active-dot" />}
                      </button>
                      {showFastingPanel && (() => {
                        const fasting = appState.fasting;
                        const fa = fasting?.active;
                        const today = todayString();

                        // Pending preview (generated, not yet accepted)
                        if (fastingPending) {
                          const needsPicker = fastingPending.reward.type === 'buddySteps' || fastingPending.reward.type === 'freeEvolution' || (fastingPending.reward.type === 'combo' && fastingPending.reward.parts.includes('freeEvolution'));
                          return (
                            <div className="fast-panel fast-preview">
                              <div className="fast-preview-row">
                                <span className="fast-preview-tier fast-tier-badge fast-tier-badge-{fastingPending.tier}">{fastingPending.tier.toUpperCase()}</span>
                                <span className="fast-preview-challenge">{fastingPending.hours}hr fasts × {fastingPending.days} days</span>
                              </div>
                              <div className="fast-preview-sub">Complete within {fastingPending.window} days of starting</div>
                              <div className="fast-info-row fast-reward-row">
                                <span className="fast-info-label">🎁 Reward</span>
                                <span className="fast-info-val">{fastingPending.reward.label}</span>
                              </div>
                              <div className="fast-info-row fast-penalty-row">
                                <span className="fast-info-label">⚠ Penalty</span>
                                <span className="fast-info-val">{fastingPending.penalty.label}</span>
                              </div>
                              <div className="fast-preview-actions">
                                <button className="fast-accept-btn" onClick={handleAcceptFasting}>Accept Challenge</button>
                                <button className="fast-decline-btn" onClick={() => setFastingPending(null)}>Decline</button>
                              </div>
                            </div>
                          );
                        }

                        // Active running challenge
                        if (fa?.status === 'running') {
                          const windowEnd = addDays(fa.startDate, fa.window);
                          const daysLeft = Math.max(0, daysBetween(today, windowEnd));
                          const pct = Math.min(100, (fa.fastsCompleted / fa.days) * 100);
                          const loggedToday = fa.lastLogDate === today;
                          return (
                            <div className="fast-panel fast-active">
                              <div className="fast-active-header">
                                <span className={`fast-tier-badge fast-tier-badge-${fa.tier}`}>{fa.tier.toUpperCase()}</span>
                                <span className="fast-active-count">{fa.fastsCompleted} / {fa.days} fasts</span>
                              </div>
                              <div className="loan-bar fast-bar">
                                <div className="loan-bar-fill fast-bar-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="fast-active-detail">⏱ {fa.hours}hr fasts required</div>
                              <div className="fast-active-detail">📅 {daysLeft} days left in window</div>
                              <div className="fast-info-row fast-reward-row">
                                <span className="fast-info-label">🎁</span>
                                <span className="fast-info-val">{fa.reward.label}</span>
                              </div>
                              <div className="fast-info-row fast-penalty-row">
                                <span className="fast-info-label">⚠</span>
                                <span className="fast-info-val">{fa.penalty.label}</span>
                              </div>
                              <button
                                className={`fast-log-btn${loggedToday ? ' logged' : ''}`}
                                onClick={handleLogFast}
                                disabled={loggedToday}
                              >
                                {loggedToday ? '✓ Logged today' : '+ Log Fast'}
                              </button>
                            </div>
                          );
                        }

                        // Rewarding state (all fasts done)
                        if (fa?.status === 'rewarding') {
                          const reward = fa.reward;
                          const needsEvoPicker = reward.type === 'freeEvolution' || (reward.type === 'combo' && reward.parts.includes('freeEvolution'));
                          const needsBuddyPicker = reward.type === 'buddySteps';
                          const needsPicker = needsEvoPicker || needsBuddyPicker;
                          const pickerPoke = appState.pokemon;
                          return (
                            <div className="fast-panel fast-rewarding">
                              <div className="fast-result-title">🎉 Challenge Complete!</div>
                              <div className="fast-result-reward">{reward.label}</div>
                              {needsPicker && !fastingPickedPoke && (
                                <div className="fast-poke-picker">
                                  <div className="fast-picker-label">
                                    {needsBuddyPicker ? 'Choose which Pokémon gets the buddy steps:' : 'Choose which Pokémon to evolve:'}
                                  </div>
                                  {pickerPoke.length === 0 ? (
                                    <div className="fast-no-team">No Pokémon caught yet</div>
                                  ) : (
                                    <div className="fast-poke-grid">
                                      {pickerPoke.map(p => (
                                        <button key={p.uid} className="fast-poke-pick-btn" onClick={() => setFastingPickedPoke(p.uid)}>
                                          {p.sprite && <img src={p.sprite} alt={p.name} className="fast-poke-pick-sprite" />}
                                          <span className="fast-poke-pick-name">{p.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              {(!needsPicker || fastingPickedPoke) && (
                                <button
                                  className="fast-claim-btn"
                                  disabled={freeEvolving}
                                  onClick={() => {
                                    if (needsEvoPicker && fastingPickedPoke) {
                                      handleFreeEvolve(fastingPickedPoke);
                                      if (reward.type === 'combo' && reward.parts.includes('legendary')) {
                                        handleClaimFastingReward(fastingPickedPoke);
                                      }
                                    } else {
                                      handleClaimFastingReward(fastingPickedPoke);
                                    }
                                  }}
                                >
                                  {freeEvolving ? 'Evolving…' : '✨ Claim Reward'}
                                </button>
                              )}
                            </div>
                          );
                        }

                        // Done state
                        if (fa?.status === 'done') {
                          return (
                            <div className="fast-panel fast-done">
                              <div className="fast-result-title">✅ Reward claimed!</div>
                              <div className="fast-result-sub">
                                {fa.tier !== 'hard' ? `${fa.tier === 'easy' ? 'Medium' : 'Hard'} tier unlocked!` : 'All tiers completed!'}
                              </div>
                              <button className="fast-dismiss-btn" onClick={handleDismissFastingResult}>Start new challenge</button>
                            </div>
                          );
                        }

                        // Failed state
                        if (fa?.status === 'failed') {
                          return (
                            <div className="fast-panel fast-failed">
                              <div className="fast-result-title">❌ Challenge Failed</div>
                              <div className="fast-result-penalty">{fa.penalty.label}</div>
                              <button className="fast-dismiss-btn" onClick={handleDismissFastingResult}>Try Again</button>
                            </div>
                          );
                        }

                        // Idle — pick a tier
                        return (
                          <div className="fast-panel fast-idle">
                            <div className="fast-idle-title">Choose a difficulty</div>
                            <div className="fast-tier-btns">
                              {['easy', 'medium', 'hard'].map(tier => {
                                const unlocked = fasting?.unlockedTiers?.includes(tier);
                                const completed = fasting?.completedTiers?.includes(tier);
                                return (
                                  <button
                                    key={tier}
                                    className={`fast-tier-btn fast-tier-btn-${tier}${!unlocked ? ' fast-locked' : ''}`}
                                    onClick={() => unlocked && handleGenerateFasting(tier)}
                                    disabled={!unlocked}
                                  >
                                    <span className="fast-tier-btn-label">{tier}</span>
                                    {!unlocked && <span className="fast-tier-lock">🔒</span>}
                                    {completed && <span className="fast-tier-done">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="fast-idle-hint">A challenge, reward, and penalty are generated on pick — you decide whether to accept.</div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Day Care */}
                    <div className="gba-section">
                      <button className="dc-toggle-btn" onClick={() => setShowDaycarePanel(p => !p)}>
                        🥚 Day Care
                        {appState.daycare?.status === 'active' && <span className="dt-active-dot" />}
                      </button>
                      {showDaycarePanel && (() => {
                        const dc = appState.daycare || initDaycare();
                        if (dc.status === 'cooldown') {
                          const daysLeft = dc.cooldownUntil ? Math.max(0, daysBetween(todayString(), dc.cooldownUntil)) : 0;
                          return (
                            <div className="dc-panel dc-cooldown">
                              <div className="dc-header">
                                <span className="dc-icon">😴</span>
                                <span className="dc-title">Day Care</span>
                                <span className="dc-status-badge dc-status-cooldown">Cooldown</span>
                              </div>
                              <div className="dc-cooldown-msg">Next Pokémon available in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong></div>
                            </div>
                          );
                        }
                        if (dc.status === 'active') {
                          const accum = dc.stepsAccumulated || 0;
                          const pct = Math.min(100, (accum / 50000) * 100);
                          const daysElapsed = daysBetween(dc.startDate, todayString());
                          const daysLeft = Math.max(0, 10 - daysElapsed);
                          return (
                            <div className="dc-panel dc-active">
                              <div className="dc-header">
                                {dc.pokemon?.sprite && <img src={dc.pokemon.sprite} alt={dc.pokemon.name} className="dc-poke-sprite" />}
                                <div className="dc-poke-info">
                                  <div className="dc-poke-name">{dc.pokemon?.name}</div>
                                  <div className="dc-poke-sub">friend's Pokémon · not yours</div>
                                </div>
                                <span className="dc-status-badge dc-status-active">Active</span>
                              </div>
                              <div className="dc-progress-row">
                                <span className="dc-progress-label">{accum.toLocaleString()} / 50,000 steps</span>
                                <span className="dc-days-label">{daysLeft}d left</span>
                              </div>
                              <div className="dc-bar"><div className="dc-bar-fill" style={{ width: `${pct.toFixed(1)}%` }} /></div>
                              <div className="dc-reward-row">🎁 Reward: <strong>1× Rare Pack</strong> on success</div>
                            </div>
                          );
                        }
                        // available
                        return (
                          <div className="dc-panel dc-available">
                            <div className="dc-header">
                              <span className="dc-icon">🥚</span>
                              <span className="dc-title">Day Care</span>
                              <span className="dc-status-badge dc-status-ready">Ready</span>
                            </div>
                            <div className="dc-available-desc">
                              A friend's Pokémon needs training. Walk 50,000 steps in 10 days — earn a Rare Pack.
                            </div>
                            <div className="dc-rules">
                              <div>📅 10 days max</div>
                              <div>👟 50,000 total steps</div>
                              <div>🎁 Rare Pack on success</div>
                              <div>😴 3-day cooldown on failure</div>
                            </div>
                            <button
                              className="dc-start-btn"
                              onClick={handleStartDaycare}
                              disabled={startingDaycare}
                            >
                              {startingDaycare ? 'Loading Pokémon…' : '🤝 Start Day Care'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                </div>
              )}
              {/* ── Daily Steps History Panel ── */}
              {showStepsHistoryPanel && (
                <div className="pw-icon-panel">
                  <div className="pw-ip-header">
                    <span className="pw-ip-title">Daily Steps</span>
                    {(appState.stepHistory || []).length > 0 && (
                      <button
                        className="sh-download-btn"
                        onClick={() => {
                          const rows = (appState.stepHistory || []).map(e => ({ Date: e.date, Steps: e.steps }));
                          const ws = XLSX.utils.json_to_sheet(rows);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, 'Daily Steps');
                          XLSX.writeFile(wb, 'pokemon-walker-steps.xlsx');
                        }}
                      >
                        ⬇ Excel
                      </button>
                    )}
                  </div>
                  <div className="pw-ip-body">
                    {(appState.stepHistory || []).length === 0 ? (
                      <div className="sh-empty">No history yet — steps are logged at the end of each day.</div>
                    ) : (
                      <table className="sh-table">
                        <thead>
                          <tr>
                            <th className="sh-th">Date</th>
                            <th className="sh-th sh-th-right">Steps</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(appState.stepHistory || []).map((entry, i) => (
                            <tr key={i} className={`sh-row${entry.steps >= 10000 ? ' sh-row-10k' : ''}`}>
                              <td className="sh-td">{entry.date}</td>
                              <td className="sh-td sh-td-right">{entry.steps.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
              </div>{/* end gba-screen-main */}
            </div>{/* end gba-screen */}
          </div>{/* end gba-bezel */}
          <div className="gba-brand-bar">
            <span className="gba-brand-text">GAME BOY ADVANCE</span>
            <span className="gba-brand-sub">POKÉMON WALKER</span>
          </div>
        </div>

        {/* Right panel — A/B + Quit */}
        <div className="gba-right-panel">
          <div className="gba-shoulder-r">R</div>
          <div className="gba-ab-group">
            <div className="gba-btn-b">B</div>
            <div className="gba-btn-a">A</div>
          </div>
          <div className="gba-speaker-grille">
            {Array.from({ length: 18 }).map((_, i) => <div key={i} className="gba-speaker-dot" />)}
          </div>
          <button className="gba-mini-btn" onClick={onStop}>QUIT</button>
        </div>

      </div>
    </div>
  );
}
