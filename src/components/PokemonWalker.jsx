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
const EGG_BASE            = 10_000;   // new egg every 10k vault steps since last hatch
const EGG_CLAIM_HOURS     = 24;       // claim window after vault milestone hit

function eggTier(_index) {
  return 'common';
}

function initEgg(vaultBaseline = 0) {
  return {
    index: 0,
    vaultBaseline,
    status: 'waiting',     // waiting | available
    tier: null,
    availableUntil: null,
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

// ─── Fasting Challenge Presets ─────────────────────────────────────────────

const FASTING_PRESETS = {
  easy: [
    { hours: 10, days: 10, graceDays: 1,
      reward: { type: 'pack', packTier: 'common', count: 1, label: '1× Common Pack' },
      penalty: { type: 'buddyReset', label: 'Buddy steps reset to 0' } },
    { hours: 8, days: 30, graceDays: 1,
      reward: { type: 'buddySteps', amount: 5000, label: '+5,000 Buddy Steps' },
      penalty: { type: 'buddyFreeze', days: 10, label: 'Buddy locked for 10 days' } },
    { hours: 12, days: 8, graceDays: 1,
      reward: { type: 'pack', packTier: 'common', count: 1, label: '1× Common Pack' },
      penalty: { type: 'buddyFreeze', days: 5, label: 'Buddy locked for 5 days' } },
  ],
  medium: [
    { hours: 14, days: 8, graceDays: 1,
      reward: { type: 'pack', packTier: 'rare', count: 4, label: '4× Rare Packs' },
      penalty: { type: 'releasePokemon', tier: 'rare', count: 2, label: '2 Rare Pokémon released' } },
    { hours: 12, days: 15, graceDays: 1,
      reward: { type: 'pack', packTier: 'epic', count: 2, label: '2× Epic Packs' },
      penalty: { type: 'releasePokemon', tier: 'common', count: 5, label: '5 Common Pokémon released' } },
  ],
  hard: [
    { hours: 16, days: 30, graceDays: 1,
      reward: { type: 'pack', packTier: 'legendary', count: 1, label: '1× Legendary Pack' },
      penalty: { type: 'hardFail', label: 'Buddy loses all steps + Buddy frozen 30 days + 5 Common Pokémon released' },
      bonusReward: { label: '3× Free Evolutions + 5× Common + 1× Rare + 1× Epic Pack', freeEvolutions: 3, packs: { common: 5, rare: 1, epic: 1 } } },
  ],
};

function generateFastingChallenge(tier) {
  const opts = FASTING_PRESETS[tier];
  return opts[Math.floor(Math.random() * opts.length)];
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
    if (type === 'releasePokemon') {
      const eligible = s.pokemon.filter(pk => pk.packTier === p.tier && !pk.onTeam && pk.uid !== s.buddy);
      const toRemove = new Set(eligible.slice(0, p.count).map(pk => pk.uid));
      return { ...s, pokemon: s.pokemon.filter(pk => !toRemove.has(pk.uid)) };
    }
    if (type === 'hardFail') {
      let ns = s;
      if (ns.buddy) ns = { ...ns, pokemon: ns.pokemon.map(pk => pk.uid === ns.buddy ? { ...pk, buddySteps: 0 } : pk) };
      ns = { ...ns, vaultFrozenUntil: Date.now() + 30 * 24 * 60 * 60 * 1000 };
      const eligible = ns.pokemon.filter(pk => pk.packTier === 'common' && !pk.onTeam && pk.uid !== ns.buddy);
      const toRemove = new Set(eligible.slice(0, 5).map(pk => pk.uid));
      ns = { ...ns, pokemon: ns.pokemon.filter(pk => !toRemove.has(pk.uid)) };
      return ns;
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

// ─── Sugar Control ────────────────────────────────────────────────────────

function generateSugarChallenge(tier) {
  let daysMin, daysMax, limitGrams;
  if (tier === 'easy')   { daysMin = 3; daysMax = 7; limitGrams = 50; }
  if (tier === 'medium') { daysMin = 3; daysMax = 6; limitGrams = 25; }
  if (tier === 'hard')   { daysMin = 2; daysMax = 5; limitGrams = 10; }
  const days = daysMin + Math.floor(Math.random() * (daysMax - daysMin + 1));
  const buffer = tier === 'hard' ? (2 + Math.floor(Math.random() * 3)) : (1 + Math.floor(Math.random() * 2));
  const window = days + buffer;
  return { days, window, limitGrams };
}

function generateSugarReward(tier) {
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
    if (roll < 0.80) return { type: 'freeEvolution', label: 'Free Evolution (any Pokémon)' };
    return { type: 'pack', packTier: 'rare', count: 2, label: '2× Rare Packs' };
  }
  if (tier === 'hard') {
    if (roll < 0.30) return { type: 'pack', packTier: 'legendary', count: 1, label: '1× Legendary Pack' };
    if (roll < 0.55) return { type: 'freeEvolution', label: 'Free Evolution (any Pokémon)' };
    if (roll < 0.75) return { type: 'combo', parts: ['legendary', 'freeEvolution'], label: '1× Legendary Pack + Free Evolution' };
    return { type: 'pack', packTier: 'epic', count: 2, label: '2× Epic Packs' };
  }
  return { type: 'pack', packTier: 'common', count: 1, label: '1× Common Pack' };
}

function generateSugarPenalty(tier) {
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
    return { type: 'hardFail', label: 'Buddy Pokémon removed from collection + Vault frozen 7 days' };
  }
  return { type: 'buddyReset', label: 'Buddy steps reset to 0' };
}

function applySugarPenalty(state, penalty) {
  function applyOne(s, type, p) {
    if (type === 'loseBuddySteps' && s.buddy) {
      return { ...s, pokemon: s.pokemon.map(pk => pk.uid === s.buddy ? { ...pk, buddySteps: Math.max(0, (pk.buddySteps || 0) - p.amount) } : pk) };
    }
    if (type === 'buddyReset' && s.buddy) {
      return { ...s, pokemon: s.pokemon.map(pk => pk.uid === s.buddy ? { ...pk, buddySteps: 0 } : pk) };
    }
    if (type === 'buddyFreeze') {
      const until = addDays(todayString(), p.days);
      return { ...s, sugar: { ...s.sugar, frozenPokemon: { until, reason: 'buddy' } } };
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

function initSugar() {
  return { unlockedTiers: ['easy'], completedTiers: [], active: null, frozenPokemon: null };
}

function initWeight() {
  return { lastKg: null, lastChangeDate: null, history: [] };
}

function initWater() {
  return { todayMl: 0, todayDate: null, streak: 0, lastStreakDate: null, pendingReward: null, milestonesCleared: 0 };
}

function calcBollinger(history, window = 7) {
  if (!history || history.length < window) return null;
  const recent = history.slice(-window).map(e => e.kg);
  const mean = recent.reduce((a, b) => a + b, 0) / window;
  const std = Math.sqrt(recent.reduce((a, b) => a + (b - mean) ** 2, 0) / window);
  return { middle: +mean.toFixed(2), upper: +(mean + 2 * std).toFixed(2), lower: +(mean - 2 * std).toFixed(2) };
}

function initWifeChallenge() {
  return { logs: {}, claimedMonths: [], defeatedMonths: [] };
}

const WEDDING_DATE = '2027-01-18';
const WEDDING_GOAL_KG = 88;

const RN_DATE = '2026-08-29';
const RN_GOAL_KG = 97;

const PRUDHVI_DATE = '2026-09-05';
const PRUDHVI_GOAL_KG = 97;

function initWeddingChallenge() {
  return {
    startDate: null,
    startWeight: null,
    claimedReward: false,
    penaltyApplied: false,
  };
}

const TIMING_MILESTONES = [
  { days: 5,  tier: 'common' },
  { days: 15, tier: 'rare' },
  { days: 25, tier: 'epic' },
  { days: 35, tier: 'legendary' },
];

// ─── Water Intake ─────────────────────────────────────────────────────────────
const WATER_GOAL_ML = 3500; // 3.5L/day — recommended for obese adult male

const WATER_MILESTONES = [
  { days: 5,   reward: { buddySteps: 500 } },
  { days: 10,  reward: { buddySteps: 5000 } },
  { days: 20,  reward: { buddySteps: 10000 } },
  { days: 30,  reward: { buddySteps: 5000,  packs: { common: 3 } } },
  { days: 40,  reward: { buddySteps: 10000, packs: { common: 3 }, eggs: 3 } },
  { days: 50,  reward: { buddySteps: 20000, packs: { common: 5 }, freeEvolutions: 5 } },
  { days: 60,  reward: { buddySteps: 20000, packs: { common: 10, rare: 5 } } },
  { days: 70,  reward: { buddySteps: 20000, packs: { common: 10, rare: 5,  epic: 5 } } },
  { days: 80,  reward: { buddySteps: 20000, packs: { common: 10, rare: 10, epic: 10 } } },
  { days: 90,  reward: { buddySteps: 30000, packs: { common: 10, epic: 5,  legendary: 1 } } },
  { days: 100, reward: { buddySteps: 50000, packs: { common: 30, legendary: 3 } } },
];

function waterRewardLabel(r) {
  const parts = [];
  if (r.buddySteps) parts.push(`Buddy +${r.buddySteps.toLocaleString()} steps`);
  if (r.packs) Object.entries(r.packs).forEach(([t, c]) => parts.push(`${c}× ${t}`));
  if (r.freeEvolutions) parts.push(`${r.freeEvolutions}× free evos`);
  if (r.eggs) parts.push(`${r.eggs}× starter eggs`);
  return parts.join(' · ');
}

const TREADMILL_TIERS = [
  { mins: 5,  buddySteps: 500,  packs: {} },
  { mins: 10, buddySteps: 2000, packs: {} },
  { mins: 20, buddySteps: 0,    packs: { common: 1 } },
  { mins: 30, buddySteps: 1000, packs: { common: 1 } },
  { mins: 45, buddySteps: 3000, packs: { common: 1 } },
  { mins: 50, buddySteps: 0,    packs: { rare: 1, common: 1 } },
  { mins: 60, buddySteps: 3000, packs: { rare: 1, common: 1 } },
];

function initTiming() {
  return { streak: 0, lastLogDate: null, claimedMilestones: [], pendingReward: null };
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

// All base-form starter Pokémon across all generations
const STARTERS_POOL = [
  1,4,7,       // Gen 1: Bulbasaur, Charmander, Squirtle
  152,155,158, // Gen 2: Chikorita, Cyndaquil, Totodile
  252,255,258, // Gen 3: Treecko, Torchic, Mudkip
  387,390,393, // Gen 4: Turtwig, Chimchar, Piplup
  495,498,501, // Gen 5: Snivy, Tepig, Oshawott
  650,653,656, // Gen 6: Chespin, Fennekin, Froakie
  722,725,728, // Gen 7: Rowlet, Litten, Popplio
  810,813,816, // Gen 8: Grookey, Scorbunny, Sobble
  906,909,912, // Gen 9: Sprigatito, Fuecoco, Quaxly
];

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

async function isBaseForm(dexId) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${dexId}`);
  if (!res.ok) return true; // assume base if API fails
  const data = await res.json();
  return data.evolves_from_species === null;
}

async function fetchBaseFormPokemon(tier, ownedDexIds, maxTries = 10) {
  for (let i = 0; i < maxTries; i++) {
    const id = pickFromPool(tier, ownedDexIds);
    if (await isBaseForm(id)) {
      return await fetchPokemonById(id);
    }
  }
  // fallback: return whatever we get on the last try
  return await fetchPokemonById(pickFromPool(tier, ownedDexIds));
}

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
    sugar: initSugar(),
    daycare: initDaycare(),
    stepHistory: [],
    evolutionLog: [],
    caughtDex: [],
    timing: initTiming(),
    weight: initWeight(),
    wifeChallenge: initWifeChallenge(),
    weddingChallenge: initWeddingChallenge(),
    challengeLog: [],
    freeEvolutionCredits: 0,
    water: initWater(),
    eggQueue: 0,
    rnChallenge: { claimedReward: false, penaltyApplied: false },
    prudhviChallenge: { claimedReward: false, penaltyApplied: false },
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
    if (!saved.egg.eggV2Reset) saved.egg = { ...saved.egg, vaultBaseline: saved.lifetimeVaultDeposits || 0, eggV2Reset: true, status: saved.egg.status === 'available' ? 'waiting' : saved.egg.status };
    if (!saved.debtTrap) saved.debtTrap = initDebtTrap();
    if (saved.vaultFrozenUntil === undefined) saved.vaultFrozenUntil = null;
    if (saved.buddy === undefined) saved.buddy = null;
    if (!saved.fasting) saved.fasting = initFasting();
    // Migrate active fasting challenge to new format
    if (saved.fasting?.active && saved.fasting.active.graceDays === undefined) {
      saved.fasting = {
        ...saved.fasting,
        active: { ...saved.fasting.active, graceDays: 1, missedDays: 0, status: 'failed' }
      };
    }
    if (!saved.sugar) saved.sugar = initSugar();
    if (!saved.daycare) saved.daycare = initDaycare();
    if (!saved.stepHistory) saved.stepHistory = [];
    if (!saved.evolutionLog) saved.evolutionLog = [];
    if (!saved.timing) saved.timing = initTiming();
    if (!saved.weight) saved.weight = initWeight();
    if (!saved.weight.history) {
      saved.weight = {
        ...saved.weight,
        history: saved.weight.lastKg
          ? [{ date: saved.weight.lastChangeDate || todayString(), kg: saved.weight.lastKg }]
          : [],
      };
    }
    if (!saved.wifeChallenge) saved.wifeChallenge = initWifeChallenge();
    if (!saved.wifeChallenge.defeatedMonths) saved.wifeChallenge = { ...saved.wifeChallenge, defeatedMonths: [] };
    if (!saved.weddingChallenge) saved.weddingChallenge = initWeddingChallenge();
    if (!saved.challengeLog) saved.challengeLog = [];
    if (saved.freeEvolutionCredits === undefined) saved.freeEvolutionCredits = 0;
    if (!saved.water) saved.water = initWater();
    if (!saved.rnChallenge) saved.rnChallenge = { claimedReward: false, penaltyApplied: false };
    if (!saved.prudhviChallenge) saved.prudhviChallenge = { claimedReward: false, penaltyApplied: false };
    if (saved.water.milestonesCleared === undefined) saved.water = { ...saved.water, milestonesCleared: 0 };
    if (saved.eggQueue === undefined) saved.eggQueue = 0;
    // Seed caughtDex from existing pokemon on first migration
    if (!saved.caughtDex || saved.caughtDex.length === 0) {
      saved.caughtDex = [...new Set((saved.pokemon || []).map(p => p.dexId))];
    }
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
    if (saved.egg?.status === 'available' && Date.now() > saved.egg.availableUntil) {
      saved.egg = { ...initEgg(saved.lifetimeVaultDeposits || 0), index: saved.egg.index + 1 };
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
            const dtFaction = saved.debtTrap.faction || 'Debt Trap';
            const dtDays = saved.debtTrap.daysCompleted;
            saved.challengeLog = [{ date: today, type: 'debtTrap', tier: null, outcome: `Defaulted on ${dtFaction} deal — ${dtDays} day${dtDays !== 1 ? 's' : ''} completed` }, ...(saved.challengeLog || [])];
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
      // Fasting streak miss check — grace days allowed
      // User logs the fast the NEXT morning, so give a full day before counting a miss.
      // Only penalise if gap > 1 day (last log was 2+ days ago).
      if (saved.fasting?.active?.status === 'running') {
        const fa = saved.fasting.active;
        const yesterday = saved.todayDate; // saved.todayDate is yesterday at this point
        const lastRef = fa.lastLogDate || addDays(fa.startDate, -1);
        if (daysBetween(lastRef, yesterday) > 1) {
          const newMissed = (fa.missedDays || 0) + 1;
          if (newMissed > (fa.graceDays ?? 1)) {
            saved = applyFastingPenalty(saved, fa.penalty);
            saved.fasting = { ...saved.fasting, active: { ...fa, status: 'failed' } };
            saved.challengeLog = [{ date: today, type: 'fasting', tier: fa.tier, outcome: `Failed — exceeded grace days` }, ...(saved.challengeLog || [])];
          } else {
            saved.fasting = { ...saved.fasting, active: { ...fa, missedDays: newMissed } };
          }
        }
      }
      // Expire frozen Pokémon
      if (saved.fasting?.frozenPokemon && today > saved.fasting.frozenPokemon.until) {
        saved.fasting = { ...saved.fasting, frozenPokemon: null };
      }
      // Sugar Control window expiry
      if (saved.sugar?.active?.status === 'running') {
        const sa = saved.sugar.active;
        const windowEnd = addDays(sa.startDate, sa.window);
        if (today > windowEnd) {
          saved = applySugarPenalty(saved, sa.penalty);
          saved.sugar = { ...saved.sugar, active: { ...sa, status: 'failed' } };
          saved.challengeLog = [{ date: today, type: 'sugar', tier: sa.tier, outcome: 'Failed — window expired' }, ...(saved.challengeLog || [])];
        }
      }
      if (saved.sugar?.frozenPokemon && today > saved.sugar.frozenPokemon.until) {
        saved.sugar = { ...saved.sugar, frozenPokemon: null };
      }
      // Day Care cooldown expiry
      if (saved.daycare?.status === 'cooldown' && saved.daycare.cooldownUntil && today >= saved.daycare.cooldownUntil) {
        saved.daycare = initDaycare();
      }
      // Water intake daily streak check
      {
        const w = saved.water || initWater();
        const goalMet = (w.todayMl || 0) >= WATER_GOAL_ML;
        const wasYesterday = w.todayDate === saved.todayDate; // saved.todayDate is yesterday here
        if (wasYesterday && goalMet) {
          const newStreak = (w.streak || 0) + 1;
          const mc = w.milestonesCleared || 0;
          const milestone = WATER_MILESTONES.find(m => m.days > mc && m.days <= newStreak);
          saved.water = { ...w, todayMl: 0, todayDate: today, streak: newStreak, lastStreakDate: w.todayDate, pendingReward: milestone ? milestone.days : w.pendingReward };
        } else if (wasYesterday && !goalMet) {
          saved.water = { ...initWater(), todayDate: today };
        } else {
          saved.water = { ...w, todayMl: 0, todayDate: today };
        }
      }
      // Timing streak — if yesterday wasn't logged, reset streak
      if (saved.timing?.streak > 0 && saved.timing.lastLogDate !== saved.todayDate) {
        const oldStreak = saved.timing.streak;
        saved.timing = { ...saved.timing, streak: 0, claimedMilestones: [], pendingReward: null };
        saved.challengeLog = [{ date: today, type: 'timing', tier: null, outcome: `Streak broke at ${oldStreak} day${oldStreak !== 1 ? 's' : ''}` }, ...(saved.challengeLog || [])];
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
    // Auto-unlock egg on load if vault threshold already met
    if (saved.egg?.status === 'waiting') {
      const lifetime = saved.lifetimeVaultDeposits || 0;
      const baseline = saved.egg.vaultBaseline || 0;
      if (lifetime - baseline >= EGG_BASE) {
        saved.egg = { ...saved.egg, status: 'available', tier: eggTier(saved.egg.index), availableUntil: Date.now() + EGG_CLAIM_HOURS * 60 * 60 * 1000 };
      }
    }
    // Credit debt trap if today's steps already meet the daily target
    if (saved.debtTrap?.status === 'active' && saved.todaySteps >= saved.debtTrap.dailyTarget && saved.debtTrap.lastPaidDate !== saved.todayDate) {
      const newDays = (saved.debtTrap.daysCompleted || 0) + 1;
      const totalRequired = saved.debtTrap.duration + Math.ceil(saved.debtTrap.daysCompounded || 0);
      if (newDays >= totalRequired) {
        saved.pokemon = (saved.pokemon || []).map(p => {
          if (p.uid === saved.debtTrap.collateralUid) return { ...p, isDTCollateral: false };
          if (p.uid === saved.debtTrap.legendaryCompanionUid) return { ...p, isDTLoan: false };
          return p;
        });
        saved.debtTrap = generateDebtTrap(saved.debtTrap.index + 1, saved.debtTrap.defaultCount);
      } else {
        saved.debtTrap = { ...saved.debtTrap, daysCompleted: newDays, lastPaidDate: saved.todayDate };
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

function PokemonDetailPopup({ pokemon, allPokemon, vault, buddy, onClose, onEvolve, onSetBuddy, evolving }) {
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

        <button className="pw-popup-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ─── Pack Opening Screen ──────────────────────────────────────────────────

function PackOpeningScreen({ tier, isEgg, onClose, onCatch }) {
  const [phase, setPhase] = useState('facedown'); // facedown | loading | result | error
  const [fetched, setFetched] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTap = async () => {
    if (phase !== 'facedown') return;
    setPhase('loading');
    try {
      const ownedIds = window.__pw_owned_dex_ids__ || new Set();
      const data = isEgg
        ? await fetchBaseFormPokemon(tier, ownedIds)
        : await fetchPokemonById(pickFromPool(tier, ownedIds));
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
        <div className={`pw-pack-tier-label ${tier}`}>{isEgg ? '🥚 Egg Hatch' : `${tier} pack`}</div>

        {phase === 'facedown' && (
          <>
            <span className="pw-pack-card-face" onClick={handleTap} role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleTap()}>
              {isEgg ? '🥚' : '🂠'}
            </span>
            <div className="pw-pack-tap-hint">{isEgg ? 'Tap to hatch' : 'Tap to open'}</div>
          </>
        )}

        {phase === 'loading' && (
          <div className="pw-pack-loading">{isEgg ? 'Hatching…' : 'Catching Pokémon…'}</div>
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
              <button className="pw-pack-add-btn" onClick={() => onCatch(fetched)}>
                → Catch!
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

// ─── Weight Graph ────────────────────────────────────────────────────────

function WeightGraph({ history }) {
  if (!history || history.length < 1) return null;
  const recent = history.slice(-14);
  const kgs = recent.map(e => e.kg);
  const rawMin = Math.min(...kgs);
  const rawMax = Math.max(...kgs);
  const pad = Math.max((rawMax - rawMin) * 0.4, 2);
  const minKg = rawMin - pad;
  const maxKg = rawMax + pad;
  const range = maxKg - minKg || 1;

  const SPACING = 28; // fixed px per day — never shrinks
  const H = 170;
  const PL = 38, PR = 16, PT = 14, PB = 28;
  const plotW = Math.max(SPACING * Math.max(recent.length - 1, 1), 240);
  const W = PL + plotW + PR;
  const plotH = H - PT - PB;

  const xOf = i => PL + (i / Math.max(recent.length - 1, 1)) * plotW;
  const yOf = kg => PT + (1 - (kg - minKg) / range) * plotH;

  const yTickCount = 5;
  const rawRange = rawMax - rawMin || 2;
  const yStep = Math.ceil(rawRange / (yTickCount - 1)) || 1;
  const yStart = Math.floor(rawMin);
  const yTicks = Array.from({ length: yTickCount }, (_, i) => yStart + i * yStep);

  const xTickIdxs = recent.length === 1
    ? [0]
    : [...new Set([0, Math.floor((recent.length - 1) / 2), recent.length - 1])];

  const fmtDate = dateStr => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
  };

  const bandAt = recent.map((_, i) => calcBollinger(recent.slice(0, i + 1)));
  const bandSegs = bandAt.map((b, i) => b ? { i, upper: b.upper, lower: b.lower } : null).filter(Boolean);
  const linePath = recent.length > 1
    ? recent.map((e, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(e.kg).toFixed(1)}`).join(' ')
    : null;
  const upperPts = bandSegs.map(s => `${xOf(s.i).toFixed(1)},${yOf(s.upper).toFixed(1)}`);
  const lowerPts = bandSegs.map(s => `${xOf(s.i).toFixed(1)},${yOf(s.lower).toFixed(1)}`);

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden', borderRadius: 10, border: '1px solid #e5e7eb' }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', background: '#f8fafc' }}>
      {/* Grid lines */}
      {yTicks.map(v => (
        <line key={v} x1={PL} y1={yOf(v).toFixed(1)} x2={W - PR} y2={yOf(v).toFixed(1)}
          stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {/* Y-axis labels */}
      {yTicks.map(v => (
        <text key={v} x={PL - 6} y={yOf(v)} textAnchor="end" dominantBaseline="middle"
          fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif" fontWeight="600">{v}</text>
      ))}
      {/* kg label */}
      <text x={10} y={PT + plotH / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fill="#9ca3af" fontWeight="700"
        transform={`rotate(-90, 10, ${PT + plotH / 2})`}>kg</text>
      {/* X-axis labels */}
      {xTickIdxs.map(i => (
        <text key={i} x={xOf(i).toFixed(1)} y={H - 7} textAnchor="middle"
          fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif" fontWeight="600">{fmtDate(recent[i].date)}</text>
      ))}
      {/* Axis lines */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + plotH} stroke="#d1d5db" strokeWidth="1" />
      <line x1={PL} y1={PT + plotH} x2={W - PR} y2={PT + plotH} stroke="#d1d5db" strokeWidth="1" />
      {/* Bollinger band fill */}
      {bandSegs.length > 1 && (
        <polygon points={[...upperPts, ...[...lowerPts].reverse()].join(' ')} fill="rgba(99,102,241,0.08)" />
      )}
      {upperPts.length > 1 && <polyline points={upperPts.join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7" />}
      {lowerPts.length > 1 && <polyline points={lowerPts.join(' ')} fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7" />}
      {/* Weight line */}
      {linePath && <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {/* Dots */}
      {recent.map((e, i) => {
        const b = bandAt[i];
        const color = b ? (e.kg > b.upper ? '#ef4444' : e.kg < b.lower ? '#16a34a' : '#6366f1') : '#6366f1';
        const isLast = i === recent.length - 1;
        return (
          <g key={i}>
            {isLast && <circle cx={xOf(i)} cy={yOf(e.kg)} r={9} fill={color} opacity="0.15" />}
            <circle cx={xOf(i)} cy={yOf(e.kg)} r={isLast ? 5 : 3}
              fill={color} stroke="#f8fafc" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function PokemonWalker({ onStop }) {
  const [appState, setAppState] = useState(() => loadState());
  const [stepInput, setStepInput] = useState('');
  const [deltaFlash, setDeltaFlash] = useState(null);
  const [packOpening, setPackOpening] = useState(null); // tier string or null
  const [eggOpening, setEggOpening] = useState(null);  // tier string when hatching egg, null otherwise
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
  const [buddyNextEvoId, setBuddyNextEvoId] = useState(undefined);
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
  const [showSugarPanel, setShowSugarPanel] = useState(false);
  const [sugarPending, setSugarPending] = useState(null);
  const [sugarPickedPoke, setSugarPickedPoke] = useState(null);
  const [freeEvolvingSugar, setFreeEvolvingSugar] = useState(false);
  const [startingDaycare, setStartingDaycare] = useState(false);
  const [showDaycarePanel, setShowDaycarePanel] = useState(false);
  const [showStepsHistoryPanel, setShowStepsHistoryPanel] = useState(false);
  const [showDaycareDetail, setShowDaycareDetail] = useState(false);
  const [regionFilter, setRegionFilter] = useState(null);
  const [showTeamList, setShowTeamList] = useState(false);
  const [openTiers, setOpenTiers] = useState({});
  const [showEvoRecords, setShowEvoRecords] = useState(false);
  const [showHatchRecords, setShowHatchRecords] = useState(false);
  const [showTimingPanel, setShowTimingPanel] = useState(false);
  const [showTreadmillPanel, setShowTreadmillPanel] = useState(false);
  const [treadmillConfirming, setTreadmillConfirming] = useState(null); // mins value pending confirm
  const treadmillConfirmTimer = useRef(null);
  const [showWeightPanel, setShowWeightPanel] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightResult, setWeightResult] = useState(null);
  const [showWaterPanel, setShowWaterPanel] = useState(false);
  const [waterInput, setWaterInput] = useState('');
  const [showWifeChallengePanel, setShowWifeChallengePanel] = useState(false);
  const [wifeChallengeInput, setWifeChallengeInput] = useState('');
  const [claimingVictory, setClaimingVictory] = useState(false);
  const [victoryStarters, setVictoryStarters] = useState(null);
  const [showWeddingPanel, setShowWeddingPanel] = useState(false);
  const [showRNPanel, setShowRNPanel] = useState(false);
  const [showPrudhviPanel, setShowPrudhviPanel] = useState(false);
  const [generatingWeddingImage, setGeneratingWeddingImage] = useState(false);
  const [weddingImage, setWeddingImage] = useState(null);
  const [claimingWeddingReward, setClaimingWeddingReward] = useState(false);
  const [showLogStepsDropdown, setShowLogStepsDropdown] = useState(false);
  const [showLogChallengesDropdown, setShowLogChallengesDropdown] = useState(false);
  const [mysteryIds] = useState(() => ({
    common: POOLS.common[Math.floor(Math.random() * POOLS.common.length)],
    rare: POOLS.rare[Math.floor(Math.random() * POOLS.rare.length)],
    epic: POOLS.epic[Math.floor(Math.random() * POOLS.epic.length)],
    legendary: POOLS.legendary[Math.floor(Math.random() * POOLS.legendary.length)],
  }));
  const midnightChecked = useRef(false);
  const packWarningChecked = useRef({ '9pm': false, '11pm': false });
  const stepsWarningChecked = useRef(false);
  const evoCheckedUids = useRef(new Set());

  // When Pokémon panel opens, fetch nextEvoDexId for any Pokémon that don't have it yet
  useEffect(() => {
    if (!showMyPokemonPanel || !appState) return;
    const unchecked = appState.pokemon.filter(p => p.nextEvoDexId === undefined && !evoCheckedUids.current.has(p.uid));
    if (unchecked.length === 0) return;
    unchecked.forEach(p => evoCheckedUids.current.add(p.uid));
    Promise.all(
      unchecked.map(async p => ({ uid: p.uid, nextEvoDexId: (await fetchEvolution(p.dexId).catch(() => null)) ?? null }))
    ).then(results => {
      setAppState(prev => ({
        ...prev,
        pokemon: prev.pokemon.map(p => {
          const r = results.find(r => r.uid === p.uid);
          return r ? { ...p, nextEvoDexId: r.nextEvoDexId } : p;
        }),
      }));
    });
  }, [showMyPokemonPanel]);

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

  // Fetch buddy's next evolution whenever buddy changes
  useEffect(() => {
    const buddyPoke = appState?.buddy ? appState.pokemon.find(p => p.uid === appState.buddy) : null;
    if (!buddyPoke) { setBuddyNextEvoId(null); return; }
    setBuddyNextEvoId(undefined);
    fetchEvolution(buddyPoke.dexId).then(setBuddyNextEvoId).catch(() => setBuddyNextEvoId(null));
  }, [appState?.buddy, appState?.pokemon.find(p => p.uid === appState?.buddy)?.dexId]);

  // One-time init of wedding challenge start date/weight when weight is first logged
  useEffect(() => {
    if (!appState) return;
    const wc = appState.weddingChallenge;
    if (!wc || wc.startDate !== null) return;
    if (!appState.weight?.lastKg) return;
    setAppState(prev => ({
      ...prev,
      weddingChallenge: { ...prev.weddingChallenge, startDate: todayString(), startWeight: prev.weight.lastKg },
    }));
  }, [appState?.weddingChallenge?.startDate, appState?.weight?.lastKg]);

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
      let completedDTLog = null;
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
            completedDTLog = { date: todayString(), type: 'debtTrap', tier: null, outcome: `Completed ${newDT.faction || 'Debt Trap'} deal in ${newDaysCompleted} days` };
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
        challengeLog: completedDTLog ? [completedDTLog, ...(prev.challengeLog || [])] : prev.challengeLog,
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
      const todayAlreadyMet = (prev.todaySteps || 0) >= dt.dailyTarget;
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
          daysCompleted: todayAlreadyMet ? 1 : 0,
          lastPaidDate: todayAlreadyMet ? todayString() : null,
        },
      };
    });
    setSelectedCollateral(null);
    setAcceptingDT(false);
  };

  // ─── Claim egg — instant hatch ───────────────────────────────────────
  const handleClaimEgg = () => {
    const egg = appState?.egg;
    if (egg?.status !== 'available') return;
    const tier = egg.tier || 'common';
    setEggOpening(tier);
    setAppState(prev => ({
      ...prev,
      egg: { ...initEgg(prev.lifetimeVaultDeposits || 0), index: (prev.egg.index || 0) + 1 },
    }));
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
      if (newEgg.status === 'waiting' && newLifetime - (newEgg.vaultBaseline || 0) >= EGG_BASE) {
        newEgg = { ...newEgg, status: 'available', tier: eggTier(newEgg.index), availableUntil: Date.now() + EGG_CLAIM_HOURS * 60 * 60 * 1000 };
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
  const handleCatch = async (fetched) => {
    const tier = packOpening || eggOpening || 'common'; // capture before clearing
    const isEgg = !!eggOpening;
    setPackOpening(null);
    setEggOpening(null);
    const nextEvoDexId = await fetchEvolution(fetched.dexId).catch(() => null) ?? null;
    setAppState(prev => {
      const newPoke = {
        uid: makeUID(),
        dexId: fetched.dexId,
        name: fetched.name,
        sprite: fetched.sprite,
        types: fetched.types,
        timesEvolved: 0,
        location: 'Unknown',
        packTier: tier,
        caughtDate: todayString(),
        onTeam: false,
        buddySteps: 0,
        nextEvoDexId,
      };
      const newPokemon = [...prev.pokemon, newPoke];
      const newAch = checkAchievements({ ...prev, pokemon: newPokemon });
      const newCaughtDex = prev.caughtDex?.includes(fetched.dexId)
        ? prev.caughtDex
        : [...(prev.caughtDex || []), fetched.dexId];
      return {
        ...prev,
        pokemon: newPokemon,
        achievements: newAch,
        packInventory: isEgg ? prev.packInventory : { ...prev.packInventory, [newPoke.packTier]: prev.packInventory[newPoke.packTier] - 1 },
        caughtDex: newCaughtDex,
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
      const [evolved, nextNextId] = await Promise.all([
        fetchPokemonById(nextId),
        fetchEvolution(nextId).catch(() => null),
      ]);
      const nextEvoDexId = nextNextId ?? null;
      setAppState(prev => {
        if (prev.stepVault < cost) return prev;
        return {
          ...prev,
          stepVault: prev.stepVault - cost,
          pokemon: prev.pokemon.map(p =>
            p.uid === uid
              ? { ...p, dexId: evolved.dexId, name: evolved.name, sprite: evolved.sprite, types: evolved.types, timesEvolved: timesEvolved + 1, buddySteps: 0, nextEvoDexId }
              : p
          ),
          evolutionLog: [{ date: todayString(), from: poke.name, to: evolved.name, method: 'vault' }, ...(prev.evolutionLog || [])],
          caughtDex: prev.caughtDex?.includes(evolved.dexId) ? prev.caughtDex : [...(prev.caughtDex || []), evolved.dexId],
        };
      });
      setDetailPokemon(prev => prev?.uid === uid
        ? { ...prev, dexId: evolved.dexId, name: evolved.name, sprite: evolved.sprite, types: evolved.types, timesEvolved: timesEvolved + 1, buddySteps: 0, nextEvoDexId }
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
    setShowWifeChallengePanel(false);
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
        evolutionLog: [{ date: todayString(), from: poke.name, to: evolved.name, method: 'buddy' }, ...(prev.evolutionLog || [])],
        caughtDex: prev.caughtDex?.includes(evolved.dexId) ? prev.caughtDex : [...(prev.caughtDex || []), evolved.dexId],
      }));
      setDeltaFlash(`✨ ${poke.name} evolved into ${evolved.name}!`);
      setTimeout(() => setDeltaFlash(null), 4000);
    } catch {}
    setEvolving(null);
  };

  // ─── Fasting Challenge handlers ──────────────────────────────────────
  const handleGenerateFasting = (tier) => {
    const challenge = generateFastingChallenge(tier);
    setFastingPending({ tier, ...challenge });
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
          missedDays: 0,
          lastLogDate: null,
          status: 'running',
        },
      },
    }));
    setFastingPending(null);
  };

  const handleLogFast = (date = todayString()) => {
    setAppState(prev => {
      const fa = prev.fasting?.active;
      if (!fa || fa.status !== 'running') return prev;
      if (fa.lastLogDate === date) return prev;
      const newCompleted = fa.fastsCompleted + 1;
      const done = newCompleted >= fa.days;
      return {
        ...prev,
        fasting: {
          ...prev.fasting,
          active: { ...fa, fastsCompleted: newCompleted, lastLogDate: date, status: done ? 'rewarding' : 'running' },
        },
      };
    });
  };

  const handleClaimFastingReward = (pickedUid) => {
    setAppState(prev => {
      const fa = prev.fasting?.active;
      if (!fa || fa.status !== 'rewarding') return prev;
      let next = { ...prev };

      const applyPack = (s, t, count) => ({ ...s, packInventory: { ...s.packInventory, [t]: (s.packInventory[t] || 0) + count } });

      const reward = fa.reward;
      if (reward.type === 'pack') {
        next = applyPack(next, reward.packTier, reward.count);
      } else if (reward.type === 'buddySteps') {
        const targetUid = pickedUid || next.buddy;
        if (targetUid) {
          next = { ...next, buddy: targetUid, pokemon: next.pokemon.map(p => p.uid === targetUid ? { ...p, buddySteps: (p.buddySteps || 0) + reward.amount } : p) };
        }
      }

      // Hard tier no-grace bonus
      if (fa.tier === 'hard' && fa.bonusReward && (fa.missedDays || 0) === 0) {
        const bonus = fa.bonusReward;
        Object.entries(bonus.packs).forEach(([t, count]) => { next = applyPack(next, t, count); });
        next = { ...next, freeEvolutionCredits: (next.freeEvolutionCredits || 0) + bonus.freeEvolutions };
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
        challengeLog: [{ date: todayString(), type: 'fasting', tier: fa.tier, outcome: reward.label }, ...(prev.challengeLog || [])],
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
          evolutionLog: [{ date: todayString(), from: poke.name, to: evolved.name, method: 'fasting' }, ...(prev.evolutionLog || [])],
          caughtDex: prev.caughtDex?.includes(evolved.dexId) ? prev.caughtDex : [...(prev.caughtDex || []), evolved.dexId],
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

  // ─── Sugar Control handlers ───────────────────────────────────────────
  const handleGenerateSugar = (tier) => {
    const challenge = generateSugarChallenge(tier);
    const reward = generateSugarReward(tier);
    const penalty = generateSugarPenalty(tier);
    setSugarPending({ tier, ...challenge, reward, penalty });
    setSugarPickedPoke(null);
  };

  const handleAcceptSugar = () => {
    if (!sugarPending) return;
    setAppState(prev => ({
      ...prev,
      sugar: {
        ...prev.sugar,
        active: { ...sugarPending, startDate: todayString(), daysCompleted: 0, lastLogDate: null, status: 'running' },
      },
    }));
    setSugarPending(null);
  };

  const handleLogSugar = (date = todayString()) => {
    setAppState(prev => {
      const sa = prev.sugar?.active;
      if (!sa || sa.status !== 'running') return prev;
      if (sa.lastLogDate === date) return prev;
      const newCompleted = sa.daysCompleted + 1;
      const done = newCompleted >= sa.days;
      return {
        ...prev,
        sugar: {
          ...prev.sugar,
          active: { ...sa, daysCompleted: newCompleted, lastLogDate: date, status: done ? 'rewarding' : 'running' },
        },
      };
    });
  };

  const handleClaimSugarReward = (pickedUid) => {
    setAppState(prev => {
      const sa = prev.sugar?.active;
      if (!sa || sa.status !== 'rewarding') return prev;
      const reward = sa.reward;
      let next = { ...prev };
      const applyPack = (s, tier, count) => ({
        ...s,
        packInventory: { ...s.packInventory, [tier]: (s.packInventory[tier] || 0) + count },
      });
      if (reward.type === 'pack') {
        next = applyPack(next, reward.packTier, reward.count);
      } else if (reward.type === 'buddySteps' && pickedUid) {
        next = { ...next, buddy: pickedUid, pokemon: next.pokemon.map(p => p.uid === pickedUid ? { ...p, buddySteps: (p.buddySteps || 0) + reward.amount } : p) };
      } else if (reward.type === 'combo') {
        if (reward.parts.includes('legendary')) next = applyPack(next, 'legendary', 1);
      }
      const tier = sa.tier;
      const completedTiers = prev.sugar.completedTiers.includes(tier) ? prev.sugar.completedTiers : [...prev.sugar.completedTiers, tier];
      const tierOrder = ['easy', 'medium', 'hard'];
      const nextTierIdx = tierOrder.indexOf(tier) + 1;
      const unlockedTiers = nextTierIdx < tierOrder.length && !prev.sugar.unlockedTiers.includes(tierOrder[nextTierIdx])
        ? [...prev.sugar.unlockedTiers, tierOrder[nextTierIdx]] : prev.sugar.unlockedTiers;
      return { ...next, challengeLog: [{ date: todayString(), type: 'sugar', tier: sa.tier, outcome: reward.label }, ...(prev.challengeLog || [])], sugar: { ...next.sugar, active: { ...sa, status: 'done' }, completedTiers, unlockedTiers } };
    });
    setSugarPickedPoke(null);
  };

  const handleFreeEvolveSugar = async (uid) => {
    if (freeEvolvingSugar || !uid) return;
    const poke = appState.pokemon.find(p => p.uid === uid);
    if (!poke) return;
    setFreeEvolvingSugar(true);
    try {
      const nextId = await fetchEvolution(poke.dexId);
      if (!nextId) {
        setFreeEvolvingSugar(false);
        setSugarPickedPoke(null);
        setDeltaFlash("⚠ That Pokémon can't evolve further — pick another!");
        setTimeout(() => setDeltaFlash(null), 3000);
        return;
      }
      const [evolved, nextNextIdSugar] = await Promise.all([
        fetchPokemonById(nextId),
        fetchEvolution(nextId).catch(() => null),
      ]);
      const nextEvoDexIdSugar = nextNextIdSugar ?? null;
      setAppState(prev => {
        const sa = prev.sugar?.active;
        const tierOrder = ['easy', 'medium', 'hard'];
        const nextTierIdx = sa ? tierOrder.indexOf(sa.tier) + 1 : -1;
        return {
          ...prev,
          pokemon: prev.pokemon.map(p => p.uid === uid ? { ...p, dexId: evolved.dexId, name: evolved.name, sprite: evolved.sprite, types: evolved.types, timesEvolved: (p.timesEvolved || 0) + 1, buddySteps: 0, nextEvoDexId: nextEvoDexIdSugar } : p),
          evolutionLog: [{ date: todayString(), from: poke.name, to: evolved.name, method: 'sugar' }, ...(prev.evolutionLog || [])],
          caughtDex: prev.caughtDex?.includes(evolved.dexId) ? prev.caughtDex : [...(prev.caughtDex || []), evolved.dexId],
          sugar: {
            ...prev.sugar,
            active: sa ? { ...sa, status: 'done' } : sa,
            completedTiers: sa && !prev.sugar.completedTiers.includes(sa.tier) ? [...prev.sugar.completedTiers, sa.tier] : prev.sugar.completedTiers,
            unlockedTiers: sa && nextTierIdx < tierOrder.length && !prev.sugar.unlockedTiers.includes(tierOrder[nextTierIdx])
              ? [...prev.sugar.unlockedTiers, tierOrder[nextTierIdx]] : prev.sugar.unlockedTiers,
          },
        };
      });
      setDeltaFlash(`✨ ${poke.name} evolved into ${evolved.name}! (Sugar Control reward)`);
      setTimeout(() => setDeltaFlash(null), 4000);
    } catch {}
    setFreeEvolvingSugar(false);
    setSugarPickedPoke(null);
  };

  const handleDismissSugarResult = () => {
    setAppState(prev => ({ ...prev, sugar: { ...prev.sugar, active: null } }));
    setSugarPickedPoke(null);
  };

  // ─── Midnight handlers ────────────────────────────────────────────────
  const handleLogTiming = (date = todayString()) => {
    setAppState(prev => {
      const t = prev.timing || initTiming();
      if (t.lastLogDate === date) return prev;
      const newStreak = t.streak + 1;
      const claimed = t.claimedMilestones || [];
      const hit = TIMING_MILESTONES.find(m => m.days === newStreak && !claimed.includes(m.days));
      return {
        ...prev,
        timing: {
          ...t,
          streak: newStreak,
          lastLogDate: date,
          claimedMilestones: hit ? [...claimed, hit.days] : claimed,
          pendingReward: hit ? hit.tier : t.pendingReward,
        },
      };
    });
  };

  const handleLogWifeSteps = () => {
    const steps = parseInt(wifeChallengeInput, 10);
    if (isNaN(steps) || steps < 0) return;
    const dateToLog = todayString();
    setAppState(prev => ({
      ...prev,
      wifeChallenge: {
        ...(prev.wifeChallenge || initWifeChallenge()),
        logs: { ...((prev.wifeChallenge?.logs) || {}), [dateToLog]: steps },
      },
    }));
    setWifeChallengeInput('');
  };

  const handleClaimWifeVictory = async (month) => {
    if (claimingVictory) return;
    setClaimingVictory(true);
    try {
      const shuffled = [...STARTERS_POOL].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, 3);
      const pokes = await Promise.all(picked.map(id => fetchPokemonById(id)));
      const newPokes = pokes.map(p => ({ ...p, uid: `wc-${month}-${p.dexId}-${Date.now()}${Math.random()}`, packTier: 'epic', buddySteps: 0 }));
      const monthLabel2 = new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });
      setAppState(prev => ({
        ...prev,
        pokemon: [...prev.pokemon, ...newPokes],
        caughtDex: [...new Set([...(prev.caughtDex || []), ...newPokes.map(p => p.dexId)])],
        wifeChallenge: {
          ...prev.wifeChallenge,
          claimedMonths: [...(prev.wifeChallenge?.claimedMonths || []), month],
        },
        challengeLog: [{ date: todayString(), type: 'wifeChallenge', tier: 'epic', outcome: `Won ${monthLabel2} · 3 Starter Eggs: ${newPokes.map(p => p.name).join(', ')}` }, ...(prev.challengeLog || [])],
      }));
      setVictoryStarters(newPokes);
    } catch {}
    setClaimingVictory(false);
  };

  // ─── Wedding Challenge handlers ──────────────────────────────────────
  const handleGenerateWeddingImage = async () => {
    if (generatingWeddingImage || weddingImage) return;
    setGeneratingWeddingImage(true);
    try {
      const response = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY },
        body: JSON.stringify({
          prompt: 'A confident fit Indian man dancing joyfully at a grand luxurious Indian wedding celebration, wearing elegant sherwani, looking fantastic and dashing, vibrant marigold decorations, bokeh fairy lights, euphoric atmosphere, cinematic photography, 4k',
          negative_prompt: 'blurry, low quality, distorted, overweight, sad, ugly, cartoon',
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5,
        }),
      });
      if (!response.ok) throw new Error('Failed');
      const blob = await response.blob();
      setWeddingImage(URL.createObjectURL(blob));
    } catch { /* silently fail */ }
    setGeneratingWeddingImage(false);
  };

  const handleClaimWeddingReward = async () => {
    if (claimingWeddingReward) return;
    setClaimingWeddingReward(true);
    try {
      const ownedDexIds = new Set(appState.pokemon.map(p => p.dexId));
      const pool = [...LEGENDARY_IDS].filter(id => !ownedDexIds.has(id));
      const src = pool.length >= 2 ? pool : [...LEGENDARY_IDS];
      const ids = src.sort(() => Math.random() - 0.5).slice(0, 2);
      const pokes = await Promise.all(ids.map(id => fetchPokemonById(id)));
      setAppState(prev => ({
        ...prev,
        pokemon: [...prev.pokemon, ...pokes.map(p => ({ uid: makeUID(), ...p, packTier: 'legendary', buddySteps: 0, caughtDate: todayString(), onTeam: false }))],
        caughtDex: [...new Set([...(prev.caughtDex || []), ...pokes.map(p => p.dexId)])],
        weddingChallenge: { ...prev.weddingChallenge, claimedReward: true },
        challengeLog: [{ date: todayString(), type: 'wedding', tier: 'legendary', outcome: `Won Prashant's Wedding Challenge — 2 Legendaries: ${pokes.map(p => p.name).join(', ')}` }, ...(prev.challengeLog || [])],
      }));
      setDeltaFlash(`🎊 Wedding challenge won! ${pokes.map(p => p.name).join(' & ')} are yours!`);
      setTimeout(() => setDeltaFlash(null), 5000);
    } catch { /* silently fail */ }
    setClaimingWeddingReward(false);
  };

  const handleApplyWeddingPenalty = () => {
    setAppState(prev => {
      const epics = prev.pokemon.filter(p => p.packTier === 'epic' && !p.isDTCollateral && !p.isDTLoan && !p.isLoan);
      const toRemove = epics.sort(() => Math.random() - 0.5).slice(0, 5);
      const removeUids = new Set(toRemove.map(p => p.uid));
      return {
        ...prev,
        pokemon: prev.pokemon.filter(p => !removeUids.has(p.uid)),
        weddingChallenge: { ...prev.weddingChallenge, penaltyApplied: true },
        challengeLog: [{ date: todayString(), type: 'wedding', tier: 'epic', outcome: `Lost Prashant's Wedding Challenge — forfeited ${toRemove.length} epic Pokémon: ${toRemove.map(p => p.name).join(', ')}` }, ...(prev.challengeLog || [])],
      };
    });
  };

  // ─── Rakshit & Neha Challenge ─────────────────────────────────────────
  const handleClaimRNReward = async () => {
    const ownedDexIds = new Set(appState.pokemon.map(p => p.dexId));
    const RARE_IDS = [4, 7, 25, 39, 54, 60, 63, 66, 79, 92, 116, 129, 131, 133, 147];
    const pool = RARE_IDS.filter(id => !ownedDexIds.has(id));
    const src = pool.length >= 5 ? pool : RARE_IDS;
    const ids = [...src].sort(() => Math.random() - 0.5).slice(0, 5);
    const pokes = await Promise.all(ids.map(id => fetchPokemonById(id)));
    setAppState(prev => {
      let ns = {
        ...prev,
        pokemon: [...prev.pokemon, ...pokes.map(p => ({ uid: makeUID(), ...p, packTier: 'rare', buddySteps: 0, caughtDate: todayString(), onTeam: false }))],
        caughtDex: [...new Set([...(prev.caughtDex || []), ...pokes.map(p => p.dexId)])],
        rnChallenge: { ...prev.rnChallenge, claimedReward: true },
        challengeLog: [{ date: todayString(), type: 'rnChallenge', tier: 'rare', outcome: `Won Rakshit & Neha challenge — 5 Rares + 30k buddy steps` }, ...(prev.challengeLog || [])],
      };
      if (prev.buddy) {
        ns = { ...ns, pokemon: ns.pokemon.map(p => p.uid === prev.buddy ? { ...p, buddySteps: (p.buddySteps || 0) + 30000 } : p) };
      }
      return ns;
    });
    setDeltaFlash('🎉 Rakshit & Neha challenge won! 5 Rares + 30k buddy steps!');
    setTimeout(() => setDeltaFlash(null), 5000);
  };

  const handleApplyRNPenalty = () => {
    setAppState(prev => {
      const commons = prev.pokemon.filter(p => p.packTier === 'common' && !p.isDTCollateral && !p.isDTLoan && !p.isLoan && p.uid !== prev.buddy);
      const toRemove = [...commons].sort(() => Math.random() - 0.5).slice(0, 5);
      const removeUids = new Set(toRemove.map(p => p.uid));
      return {
        ...prev,
        pokemon: prev.pokemon.filter(p => !removeUids.has(p.uid)),
        rnChallenge: { ...prev.rnChallenge, penaltyApplied: true },
        challengeLog: [{ date: todayString(), type: 'rnChallenge', tier: 'common', outcome: `Lost Rakshit & Neha challenge — ${toRemove.length} common Pokémon released: ${toRemove.map(p => p.name).join(', ')}` }, ...(prev.challengeLog || [])],
      };
    });
  };

  // ─── Prudhvi Engagement Challenge ────────────────────────────────────
  const handleClaimPrudhviReward = async () => {
    const ownedDexIds = new Set(appState.pokemon.map(p => p.dexId));
    const RARE_IDS = [4, 7, 25, 39, 54, 60, 63, 66, 79, 92, 116, 129, 131, 133, 147];
    const pool = RARE_IDS.filter(id => !ownedDexIds.has(id));
    const src = pool.length >= 5 ? pool : RARE_IDS;
    const ids = [...src].sort(() => Math.random() - 0.5).slice(0, 5);
    const pokes = await Promise.all(ids.map(id => fetchPokemonById(id)));
    setAppState(prev => {
      let ns = {
        ...prev,
        pokemon: [...prev.pokemon, ...pokes.map(p => ({ uid: makeUID(), ...p, packTier: 'rare', buddySteps: 0, caughtDate: todayString(), onTeam: false }))],
        caughtDex: [...new Set([...(prev.caughtDex || []), ...pokes.map(p => p.dexId)])],
        prudhviChallenge: { ...prev.prudhviChallenge, claimedReward: true },
        challengeLog: [{ date: todayString(), type: 'prudhviChallenge', tier: 'rare', outcome: `Won Prudhvi's Engagement challenge — 5 Rares + 30k buddy steps` }, ...(prev.challengeLog || [])],
      };
      if (prev.buddy) {
        ns = { ...ns, pokemon: ns.pokemon.map(p => p.uid === prev.buddy ? { ...p, buddySteps: (p.buddySteps || 0) + 30000 } : p) };
      }
      return ns;
    });
    setDeltaFlash("🎉 Prudhvi's Engagement challenge won! 5 Rares + 30k buddy steps!");
    setTimeout(() => setDeltaFlash(null), 5000);
  };

  const handleApplyPrudhviPenalty = () => {
    setAppState(prev => {
      const commons = prev.pokemon.filter(p => p.packTier === 'common' && !p.isDTCollateral && !p.isDTLoan && !p.isLoan && p.uid !== prev.buddy);
      const toRemove = [...commons].sort(() => Math.random() - 0.5).slice(0, 5);
      const removeUids = new Set(toRemove.map(p => p.uid));
      return {
        ...prev,
        pokemon: prev.pokemon.filter(p => !removeUids.has(p.uid)),
        prudhviChallenge: { ...prev.prudhviChallenge, penaltyApplied: true },
        challengeLog: [{ date: todayString(), type: 'prudhviChallenge', tier: 'common', outcome: `Lost Prudhvi's Engagement challenge — ${toRemove.length} common Pokémon released: ${toRemove.map(p => p.name).join(', ')}` }, ...(prev.challengeLog || [])],
      };
    });
  };

  const handleUndoFast = () => {
    setAppState(prev => {
      const fa = prev.fasting?.active;
      if (!fa || fa.status !== 'running' || fa.lastLogDate !== todayString()) return prev;
      return {
        ...prev,
        fasting: {
          ...prev.fasting,
          active: { ...fa, fastsCompleted: Math.max(0, fa.fastsCompleted - 1), lastLogDate: null },
        },
      };
    });
  };

  const handleUndoSugar = () => {
    setAppState(prev => {
      const sa = prev.sugar?.active;
      if (!sa || sa.status !== 'running' || sa.lastLogDate !== todayString()) return prev;
      return {
        ...prev,
        sugar: {
          ...prev.sugar,
          active: { ...sa, daysCompleted: Math.max(0, sa.daysCompleted - 1), lastLogDate: null },
        },
      };
    });
  };

  const handleUndoTiming = () => {
    setAppState(prev => {
      const t = prev.timing;
      if (!t || t.lastLogDate !== todayString()) return prev;
      return {
        ...prev,
        timing: { ...t, streak: Math.max(0, t.streak - 1), lastLogDate: null },
      };
    });
  };

  const handleClaimTimingReward = () => {
    setAppState(prev => {
      const tier = prev.timing?.pendingReward;
      if (!tier) return prev;
      const streak = prev.timing?.streak || 0;
      return {
        ...prev,
        packInventory: { ...prev.packInventory, [tier]: prev.packInventory[tier] + 1 },
        timing: { ...prev.timing, pendingReward: null },
        challengeLog: [{ date: todayString(), type: 'timing', tier, outcome: `${tier} pack · ${streak}-day streak` }, ...(prev.challengeLog || [])],
      };
    });
  };

  // ─── Water Intake handlers ────────────────────────────────────────────
  const handleLogWater = (ml) => {
    setAppState(prev => {
      const today = todayString();
      const w = prev.water || initWater();
      const base = w.todayDate === today ? w.todayMl : 0;
      return { ...prev, water: { ...w, todayMl: base + ml, todayDate: today } };
    });
  };

  const handleClaimWaterReward = () => {
    setAppState(prev => {
      const w = prev.water || initWater();
      const milestoneDay = w.pendingReward;
      if (!milestoneDay) return prev;
      const milestone = WATER_MILESTONES.find(m => m.days === milestoneDay);
      if (!milestone) return prev;
      let ns = { ...prev };
      const r = milestone.reward;
      if (r.buddySteps && ns.buddy) {
        ns = { ...ns, pokemon: ns.pokemon.map(p => p.uid === ns.buddy ? { ...p, buddySteps: (p.buddySteps || 0) + r.buddySteps } : p) };
      }
      if (r.packs) {
        const pi = { ...ns.packInventory };
        Object.entries(r.packs).forEach(([t, c]) => { pi[t] = (pi[t] || 0) + c; });
        ns = { ...ns, packInventory: pi };
      }
      if (r.freeEvolutions) ns = { ...ns, freeEvolutionCredits: (ns.freeEvolutionCredits || 0) + r.freeEvolutions };
      if (r.eggs) ns = { ...ns, eggQueue: (ns.eggQueue || 0) + r.eggs };
      const newStreak = Math.max(0, w.streak - milestoneDay);
      ns = { ...ns, water: { ...w, streak: newStreak, pendingReward: null, milestonesCleared: 0 }, challengeLog: [{ date: todayString(), type: 'water', tier: null, outcome: `Claimed ${milestoneDay}-day water streak reward` }, ...(ns.challengeLog || [])] };
      return ns;
    });
  };

  const handleContinueWaterStreak = () => {
    setAppState(prev => {
      const w = prev.water || initWater();
      if (!w.pendingReward) return prev;
      return { ...prev, water: { ...w, pendingReward: null, milestonesCleared: w.pendingReward } };
    });
  };

  const handleClaimTreadmill = (tier) => {
    setAppState(prev => {
      let next = { ...prev };
      if (tier.packs.common) next = { ...next, packInventory: { ...next.packInventory, common: next.packInventory.common + tier.packs.common } };
      if (tier.packs.rare)   next = { ...next, packInventory: { ...next.packInventory, rare:   next.packInventory.rare   + tier.packs.rare   } };
      if (tier.buddySteps > 0 && prev.buddy) {
        next = { ...next, pokemon: next.pokemon.map(p => p.uid === prev.buddy ? { ...p, buddySteps: (p.buddySteps || 0) + tier.buddySteps } : p) };
      }
      return next;
    });
    const parts = [];
    if (tier.packs.rare)    parts.push(`+${tier.packs.rare} rare pack`);
    if (tier.packs.common)  parts.push(`+${tier.packs.common} common pack`);
    if (tier.buddySteps > 0) parts.push(`buddy +${tier.buddySteps.toLocaleString()} steps`);
    setDeltaFlash(`🏃 ${tier.mins}min claimed — ${parts.join(' · ')}`);
    setTimeout(() => setDeltaFlash(null), 3000);
  };

  const handleLogWeight = () => {
    const raw = parseFloat(weightInput);
    if (isNaN(raw) || raw <= 0) return;
    const newKg = Math.round(raw * 10) / 10;
    setWeightInput('');
    setAppState(prev => {
      const w = prev.weight || initWeight();
      const today = todayString();

      // Upsert today's entry into history
      const existingIdx = (w.history || []).findIndex(e => e.date === today);
      let newHistory;
      if (existingIdx >= 0) {
        newHistory = w.history.map((e, i) => i === existingIdx ? { date: today, kg: newKg } : e);
      } else {
        newHistory = [...(w.history || []), { date: today, kg: newKg }];
      }

      const newWeight = { lastKg: newKg, lastChangeDate: today, history: newHistory };

      // First ever log
      if ((w.history || []).length === 0 && existingIdx < 0) {
        setWeightResult({ type: 'recorded', kg: newKg });
        setTimeout(() => setWeightResult(null), 4000);
        return { ...prev, weight: newWeight };
      }

      // Compute bands from prior history (exclude today's entry)
      const priorHistory = (w.history || []).filter(e => e.date !== today);
      const bands = calcBollinger(priorHistory);

      if (!bands) {
        const daysLeft = 7 - priorHistory.length;
        setWeightResult({ type: 'recorded', kg: newKg, daysLeft });
        setTimeout(() => setWeightResult(null), 4000);
        return { ...prev, weight: newWeight };
      }

      let next = { ...prev, weight: newWeight };

      if (newKg < bands.lower) {
        // Broke below lower band — exceptional loss, epic pack reward
        next = { ...next, packInventory: { ...next.packInventory, epic: next.packInventory.epic + 1 } };
        setWeightResult({ type: 'band-loss', kg: newKg, lower: bands.lower, upper: bands.upper });
      } else if (newKg > bands.upper) {
        // Broke above upper band — weight spike penalty
        const buddyUid = prev.buddy;
        if (buddyUid) {
          next = {
            ...next,
            pokemon: next.pokemon.map(p =>
              p.uid === buddyUid ? { ...p, buddySteps: Math.floor((p.buddySteps || 0) * 0.5) } : p
            ),
          };
          setWeightResult({ type: 'band-gain', kg: newKg, upper: bands.upper, lower: bands.lower });
        } else {
          setWeightResult({ type: 'band-gain-nobuddy', kg: newKg, upper: bands.upper });
        }
      } else {
        // Within bands — safe daily log
        setWeightResult({ type: 'band-ok', kg: newKg, lower: bands.lower, upper: bands.upper });
      }

      setTimeout(() => setWeightResult(null), 5000);
      return next;
    });
  };

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

  // ─── Pack / egg opening overlay ──────────────────────────────────────
  if (packOpening || eggOpening) {
    return (
      <div className="pw-root">
        <PackOpeningScreen
          tier={packOpening || eggOpening}
          isEgg={!!eggOpening}
          onClose={() => { setPackOpening(null); setEggOpening(null); }}
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
  const uniqueDex = new Set(appState.caughtDex || allPokes.map(p => p.dexId));
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
          vault={appState.stepVault}
          buddy={appState.buddy}
          onClose={() => setDetailPokemon(null)}
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
                  { key: 'vault',         icon: '🏦', label: 'Vault',        active: showVaultPanel,          toggle: () => { setShowVaultPanel(p => !p); setShowPacksPanel(false); setShowMyPokemonPanel(false); setShowSystemsPanel(false); setShowStepsHistoryPanel(false); } },
                  { key: 'packs',         icon: '📦', label: 'Packs',        active: showPacksPanel,          toggle: () => { setShowPacksPanel(p => !p); setShowVaultPanel(false); setShowMyPokemonPanel(false); setShowSystemsPanel(false); setShowStepsHistoryPanel(false); } },
                  { key: 'pokemon',       icon: '🎒', label: 'Pokémon',      active: showMyPokemonPanel,      toggle: () => { setShowMyPokemonPanel(p => !p); setShowVaultPanel(false); setShowPacksPanel(false); setShowSystemsPanel(false); setShowStepsHistoryPanel(false); } },
                  { key: 'systems',       icon: '⚔️', label: 'Objectives',   active: showSystemsPanel,        toggle: () => { setShowSystemsPanel(p => !p); setShowVaultPanel(false); setShowPacksPanel(false); setShowMyPokemonPanel(false); setShowStepsHistoryPanel(false); } },
                  { key: 'history',       icon: '📋', label: 'Log',         active: showStepsHistoryPanel,   toggle: () => { setShowStepsHistoryPanel(p => !p); setShowVaultPanel(false); setShowPacksPanel(false); setShowMyPokemonPanel(false); setShowSystemsPanel(false); } },
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
                            {(() => {
                              const timesEvolved = buddyPoke?.timesEvolved || 0;
                              const canEvolve = buddyNextEvoId !== null && timesEvolved < 2;
                              if (buddyNextEvoId === undefined) return <div className="pw-buddy-popup-left">Checking evolution…</div>;
                              if (!canEvolve) return <div className="pw-buddy-popup-left">Max Evolution</div>;
                              if (buddySteps >= 50000) return (
                                <button
                                  className="pw-buddy-popup-evolve"
                                  onClick={e => { e.stopPropagation(); handleBuddyEvolve(); }}
                                  disabled={!!evolving}
                                >
                                  {evolving === appState.buddy ? 'Evolving…' : '✨ Ready to Evolve!'}
                                </button>
                              );
                              return <div className="pw-buddy-popup-left">{fmtFull(50000 - buddySteps)} steps left to evolve</div>;
                            })()}
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
                      {regionFilter && (
                        <div className="gba-region-filter-bar">
                          <span>Showing: <strong>{regionFilter}</strong></span>
                          <button className="gba-region-clear-btn" onClick={() => setRegionFilter(null)}>✕ Clear</button>
                        </div>
                      )}
                      {pokedexRegions.map(r => {
                        const count = [...uniqueDex].filter(id => id >= r.min && id <= r.max).length;
                        const total = r.max - r.min + 1;
                        return (
                          <div key={r.name} className={`gba-region-row${regionFilter === r.name ? ' gba-region-row-active' : ''}`}>
                            <span
                              className="gba-region-name gba-region-link"
                              onClick={() => setRegionFilter(prev => prev === r.name ? null : r.name)}
                            >{r.name}</span>
                            <div className="gba-region-bar"><div className="gba-region-fill" style={{ width: `${(count / total) * 100}%` }} /></div>
                            <span className="gba-region-count">{count}/{total}</span>
                          </div>
                        );
                      })}
                    </div>
                    {appState.pokemon.length === 0 ? (
                      <div className="gba-empty">No Pokémon yet. Open packs to catch some!</div>
                    ) : (
                      <>
                        {(() => {
                          const allPokes = appState.pokemon;
                          const filteredStorage = regionFilter ? allPokes.filter(p => getRegion(p.dexId) === regionFilter) : allPokes;
                          if (filteredStorage.length === 0) return <div className="gba-empty" style={{ marginTop: 8 }}>No {regionFilter} Pokémon in storage.</div>;
                          return (['legendary', 'epic', 'rare', 'common']).map(tier => {
                            const group = filteredStorage.filter(p => p.packTier === tier);
                            if (group.length === 0) return null;
                            const isOpen = !!openTiers[tier];
                            return (
                              <div key={tier} className="pklist-section" style={{ marginTop: 6 }}>
                                <button className={`pklist-toggle pklist-toggle-${tier}`} onClick={() => setOpenTiers(p => ({ ...p, [tier]: !p[tier] }))}>
                                  <span>{tier} · {new Set(group.map(p => p.dexId)).size}{group.length !== new Set(group.map(p => p.dexId)).size ? ` (${group.length} total)` : ''}</span>
                                  <span className="pklist-chevron">{isOpen ? '▲' : '▼'}</span>
                                </button>
                                {isOpen && (
                                  <div className="pklist-list">
                                    <div className="pklist-header-row">
                                      <span className="pklist-col-img" />
                                      <span className="pklist-col-name">Pokémon</span>
                                      <span className="pklist-col-region">Region</span>
                                      <span className="pklist-col-type">Type</span>
                                      <span className="pklist-col-evo">Evolve</span>
                                    </div>
                                    {(() => {
                                      const seen = new Map();
                                      group.forEach(p => {
                                        if (!seen.has(p.dexId)) seen.set(p.dexId, { p, count: 1 });
                                        else seen.get(p.dexId).count++;
                                      });
                                      return [...seen.values()].map(({ p, count }) => (
                                        <div key={p.uid} className="pklist-row" onClick={() => setDetailPokemon(p)}>
                                          <span className="pklist-col-img">{p.sprite && <img src={p.sprite} alt={p.name} className="pklist-sprite" />}</span>
                                          <span className="pklist-col-name">
                                            {p.name}
                                            {count > 1 && <span className="pklist-count-badge">×{count}</span>}
                                          </span>
                                          <span className="pklist-col-region">{getRegion(p.dexId)}</span>
                                          <span className="pklist-col-type">{p.types.map(t => <TypeBadge key={t} type={t} />)}</span>
                                          <span className="pklist-col-evo">{(() => {
                                            if (p.nextEvoDexId === undefined) return <span className="pklist-evo-checking">…</span>;
                                            if (p.nextEvoDexId === null) return <span className="pklist-evo-no">Does Not Evolve</span>;
                                            const cost = (p.timesEvolved || 0) === 0 ? 50000 : 100000;
                                            const current = p.buddySteps || 0;
                                            const pct = Math.min(100, (current / cost) * 100);
                                            return (
                                              <>
                                                <span className="pklist-evo-label">{fmtNum(current)}/{fmtNum(cost)}</span>
                                                <div className="pklist-evo-bar"><div className="pklist-evo-fill" style={{ width: `${pct}%` }} /></div>
                                              </>
                                            );
                                          })()}</span>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </>
                    )}

                    {/* Records */}
                    {(() => {
                      const allRecords = appState.evolutionLog || [];
                      const evolutions = allRecords.filter(e => e.method !== 'egg');
                      const hatches = allRecords.filter(e => e.method === 'egg');
                      return (
                        <div className="records-container">
                          <div className="pklist-section">
                            <button className="pklist-toggle pklist-toggle-evo" onClick={() => setShowEvoRecords(p => !p)}>
                              <span>✨ Evolutions · {evolutions.length}</span>
                              <span className="pklist-chevron">{showEvoRecords ? '▲' : '▼'}</span>
                            </button>
                            {showEvoRecords && (
                              <div className="pklist-list">
                                {evolutions.length === 0 ? (
                                  <div className="records-empty">None yet</div>
                                ) : evolutions.map((entry, i) => (
                                  <div key={i} className="records-row">
                                    <span className="records-date">{entry.date}</span>
                                    <span className="records-names">{entry.from} → {entry.to}</span>
                                    <span className={`records-badge records-badge-${entry.method}`}>{entry.method}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="pklist-section">
                            <button className="pklist-toggle pklist-toggle-egg" onClick={() => setShowHatchRecords(p => !p)}>
                              <span>🥚 Hatches · {hatches.length}</span>
                              <span className="pklist-chevron">{showHatchRecords ? '▲' : '▼'}</span>
                            </button>
                            {showHatchRecords && (
                              <div className="pklist-list">
                                {hatches.length === 0 ? (
                                  <div className="records-empty">None yet</div>
                                ) : hatches.map((entry, i) => (
                                  <div key={i} className="records-row">
                                    <span className="records-date">{entry.date}</span>
                                    <span className="records-names">{entry.to}</span>
                                    <span className="records-badge records-badge-egg">egg</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
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

                    <div className="obj-category-label">Ongoing</div>

                    {/* Step Loan */}
                    <div className="gba-section">
                      <button className="loan-eligible-btn" onClick={() => setShowLoanPanel(p => !p)}>
                        🏦 {showLoanPanel ? 'Hide loan info' : 'Eligible for a loan?'}
                        {appState.loan?.status === 'active' && (
                          appState.loan.lastPaidDate === todayString()
                            ? <span className="obj-updated-badge">Updated</span>
                            : <span className="obj-pending-badge">Pending</span>
                        )}
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
                        return (
                          <div className="loan-panel loan-locked">
                            <div className="loan-locked-icon">{stepsNeeded <= LOAN_PREVIEW_WINDOW ? '🔓' : '🔒'}</div>
                            <div className="loan-locked-title">{stepsNeeded <= LOAN_PREVIEW_WINDOW ? 'Almost there —' : ''} Loan #{loan.index + 1}</div>
                            <div className="loan-locked-desc"><strong>{fmtNum(stepsNeeded)}</strong> more lifetime steps to unlock</div>
                            <div className="loan-bar loan-bar-muted"><div className="loan-bar-fill" style={{ width: `${Math.min(totalSteps / threshold, 1) * 100}%` }} /></div>
                            <div className="loan-locked-remaining">Goal: {fmtNum(threshold)} lifetime steps</div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Egg */}
                    <div className="gba-section">
                      <button className="egg-eligible-btn" onClick={() => setShowEggPanel(p => !p)}>
                        🥚 {showEggPanel ? 'Hide egg info' : 'Egg Progress'}
                        {appState.egg?.status === 'available' && <span className="obj-updated-badge">Claim!</span>}
                        {appState.egg?.status === 'hatching' && <span className="obj-active-badge">Hatching…</span>}
                      </button>
                      {showEggPanel && (() => {
                        const egg = appState.egg;
                        const vaultLifetime = appState.lifetimeVaultDeposits || 0;
                        const baseline = egg.vaultBaseline || 0;
                        const deposited = Math.min(vaultLifetime - baseline, EGG_BASE);
                        const pct = Math.min(100, (deposited / EGG_BASE) * 100);
                        if (egg.status === 'hatching') {
                          return <div className="egg-panel egg-active"><div className="egg-visual"><span className="egg-icon egg-glow">🥚</span></div><div className="egg-avail-title">Hatching…</div></div>;
                        }
                        if (egg.status === 'available') {
                          return (
                            <div className="egg-panel egg-available">
                              <div className="egg-visual"><span className="egg-icon egg-glow">🥚</span><div className="egg-tier-badge">{egg.tier}</div></div>
                              <div className="egg-avail-title">An egg has appeared!</div>
                              <button className="egg-claim-btn" onClick={handleClaimEgg}>🤲 Claim &amp; Hatch</button>
                            </div>
                          );
                        }
                        return (
                          <div className="egg-panel egg-locked">
                            <div className="egg-visual"><span className="egg-icon egg-dim">🥚</span></div>
                            <div className="egg-locked-desc">{fmtNum(deposited)} / {fmtNum(EGG_BASE)} vault steps · {eggTier(egg.index)} next</div>
                            <div className="loan-bar loan-bar-muted"><div className="loan-bar-fill egg-bar-fill" style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Bonus Egg Queue (water streak reward) */}
                    {(appState.eggQueue || 0) > 0 && (
                      <div className="gba-section">
                        <div className="egg-panel egg-avail">
                          <div className="egg-visual"><span className="egg-icon egg-glow">🥚</span></div>
                          <div className="egg-avail-title">Bonus Egg × {appState.eggQueue}</div>
                          <button className="egg-claim-btn" onClick={() => {
                            setEggOpening('common');
                            setAppState(prev => ({ ...prev, eggQueue: Math.max(0, (prev.eggQueue || 0) - 1) }));
                          }}>🤲 Hatch Bonus Egg</button>
                        </div>
                      </div>
                    )}

                    {/* Debt Trap Challenge */}
                    <div className="gba-section">
                      <button className="dt-challenge-btn" onClick={() => setShowChallengePanel(p => !p)}>
                        ⚔️ Challenge
                        {appState.debtTrap?.status === 'active' && (
                          appState.debtTrap.lastPaidDate === todayString()
                            ? <span className="obj-updated-badge">Updated</span>
                            : <span className="obj-pending-badge">Pending</span>
                        )}
                        {appState.debtTrap?.status === 'available' && <span className="obj-updated-badge">Available</span>}
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

                    {/* Day Care */}
                    <div className="gba-section">
                      <button className="dc-toggle-btn" onClick={() => setShowDaycarePanel(p => !p)}>
                        🥚 Day Care
                        {appState.daycare?.status === 'active' && <span className="obj-active-badge">Active</span>}
                        {appState.daycare?.status === 'cooldown' && <span className="obj-cooldown-badge">Cooldown</span>}
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

                    <div className="obj-category-label" style={{ marginTop: 10 }}>Manual Update</div>

                    {/* Weight Loss */}
                    <div className="gba-section">
                      <button className="weight-toggle-btn" onClick={() => setShowWeightPanel(p => !p)}>
                        ⚖️ Weight Loss
                        {appState.weight?.lastKg !== null && <span className="obj-active-badge">Active</span>}
                      </button>
                      {showWeightPanel && (() => {
                        const w = appState.weight || initWeight();
                        const buddyPoke = appState.buddy ? appState.pokemon.find(p => p.uid === appState.buddy) : null;
                        const hist = w.history || [];
                        const bands = calcBollinger(hist);
                        const daysLogged = hist.length;
                        const daysToActivate = Math.max(0, 7 - daysLogged);
                        return (
                          <div className="wt-panel">
                            {/* Current weight hero */}
                            <div className="wt-hero">
                              <div className="wt-hero-left">
                                <div className="wt-hero-label">Current Weight</div>
                                <div className="wt-hero-value">{w.lastKg !== null ? `${w.lastKg} kg` : '—'}</div>
                                {w.lastChangeDate && <div className="wt-hero-date">{w.lastChangeDate}</div>}
                              </div>
                              <div className="wt-hero-right">
                                <div className="wt-hero-label">Days Logged</div>
                                <div className="wt-hero-days">{daysLogged}</div>
                                <div className="wt-hero-label">{bands ? '🟢 Bands Active' : `${daysToActivate}d to activate`}</div>
                              </div>
                            </div>

                            {/* Graph */}
                            <WeightGraph history={hist} />

                            {/* Band stats */}
                            {bands ? (
                              <div className="wt-bands">
                                <div className="wt-band wt-band-upper">
                                  <div className="wt-band-label">▲ Resistance</div>
                                  <div className="wt-band-value">{bands.upper} kg</div>
                                  <div className="wt-band-sub">buddy −50% above</div>
                                </div>
                                <div className="wt-band wt-band-mid">
                                  <div className="wt-band-label">— 7-day avg</div>
                                  <div className="wt-band-value">{bands.middle} kg</div>
                                  <div className="wt-band-sub">safe zone</div>
                                </div>
                                <div className="wt-band wt-band-lower">
                                  <div className="wt-band-label">▼ Support</div>
                                  <div className="wt-band-value">{bands.lower} kg</div>
                                  <div className="wt-band-sub">epic pack below</div>
                                </div>
                              </div>
                            ) : daysLogged > 0 && (
                              <div className="wt-bands-pending">
                                Log {daysToActivate} more day{daysToActivate !== 1 ? 's' : ''} to unlock Bollinger Bands — no penalties until then
                              </div>
                            )}

                            {/* Input */}
                            <div className="wt-input-row">
                              <input
                                className="wt-input"
                                type="number"
                                step="0.1"
                                min="30"
                                max="300"
                                placeholder="Today's weight (kg)"
                                value={weightInput}
                                onChange={e => setWeightInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogWeight()}
                              />
                              <button className="wt-submit-btn" onClick={handleLogWeight} disabled={!weightInput}>Log</button>
                            </div>
                            {weightInput && !isNaN(parseFloat(weightInput)) && (
                              <div className="wt-preview">Recording as <strong>{Math.round(parseFloat(weightInput) * 10) / 10} kg</strong></div>
                            )}
                            {weightResult && (
                              <div className={`wt-result wt-result-${weightResult.type}`}>
                                {weightResult.type === 'recorded' && weightResult.daysLeft > 0 && `✓ ${weightResult.kg} kg saved — ${weightResult.daysLeft} more day${weightResult.daysLeft !== 1 ? 's' : ''} to activate bands`}
                                {weightResult.type === 'recorded' && !weightResult.daysLeft && `✓ First entry: ${weightResult.kg} kg`}
                                {weightResult.type === 'band-ok' && `✓ ${weightResult.kg} kg — safe, within ${weightResult.lower}–${weightResult.upper} kg`}
                                {weightResult.type === 'band-loss' && `🎉 Below support! ${weightResult.kg} kg < ${weightResult.lower} → epic pack earned!`}
                                {weightResult.type === 'band-gain' && `😬 Above resistance! ${weightResult.kg} kg > ${weightResult.upper} → buddy lost 50% steps`}
                                {weightResult.type === 'band-gain-nobuddy' && `⚠ Above resistance — set a buddy to apply penalties`}
                              </div>
                            )}
                            {buddyPoke && (
                              <div className="wt-buddy-note">🐾 {buddyPoke.name} · {fmtNum(buddyPoke.buddySteps || 0)} buddy steps</div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Water Intake */}
                    <div className="gba-section">
                      <button className="water-toggle-btn" onClick={() => setShowWaterPanel(p => !p)}>
                        💧 Water Intake
                        {(() => {
                          const w = appState.water;
                          const today = todayString();
                          if (w?.pendingReward) return <span className="obj-active-badge">🎉 Reward!</span>;
                          if (w?.todayDate === today && (w.todayMl || 0) >= WATER_GOAL_ML) return <span className="obj-updated-badge">Goal Met ✓</span>;
                          if ((w?.streak || 0) > 0) return <span className="obj-pending-badge">{w.streak}d streak</span>;
                          return null;
                        })()}
                      </button>
                      {showWaterPanel && (() => {
                        const w = appState.water || initWater();
                        const today = todayString();
                        const todayMl = w.todayDate === today ? (w.todayMl || 0) : 0;
                        const pct = Math.min(100, (todayMl / WATER_GOAL_ML) * 100);
                        const goalMet = todayMl >= WATER_GOAL_ML;
                        const pendingMilestone = w.pendingReward ? WATER_MILESTONES.find(m => m.days === w.pendingReward) : null;
                        const nextMilestone = WATER_MILESTONES.find(m => m.days > (w.milestonesCleared || 0) && m.days > w.streak);
                        return (
                          <div className="water-panel">
                            {/* Streak + next milestone */}
                            <div className="water-streak-row">
                              <span className="water-streak-count">💧 {w.streak} day streak</span>
                              {nextMilestone && <span className="water-next-ms">Next: day {nextMilestone.days}</span>}
                            </div>

                            {/* Pending reward banner */}
                            {pendingMilestone && (
                              <div className="water-milestone-banner">
                                <div className="water-ms-title">🎉 {w.pendingReward}-Day Streak!</div>
                                <div className="water-ms-reward-label">{waterRewardLabel(pendingMilestone.reward)}</div>
                                <div className="water-ms-actions">
                                  <button className="fast-claim-btn" onClick={handleClaimWaterReward}>Claim (streak → {w.streak - w.pendingReward}d)</button>
                                  <button className="fast-skip-btn" onClick={handleContinueWaterStreak}>Continue Streak</button>
                                </div>
                              </div>
                            )}

                            {/* Today's progress */}
                            <div className="water-goal-label">Today: {todayMl} ml / {WATER_GOAL_ML} ml</div>
                            <div className="water-bar-wrap">
                              <div className="water-bar">
                                <div className="water-bar-fill" style={{ width: `${pct}%` }} />
                              </div>
                              {goalMet && <span className="water-bar-check">✓</span>}
                            </div>

                            {/* Quick-add buttons */}
                            <div className="water-quick-row">
                              {[250, 300, 500, 750].map(ml => (
                                <button key={ml} className="water-quick-btn" onClick={() => handleLogWater(ml)}>+{ml}ml</button>
                              ))}
                            </div>

                            {/* Custom amount */}
                            <div className="water-custom-row">
                              <input
                                className="wt-input"
                                type="number"
                                placeholder="Custom ml"
                                value={waterInput}
                                onChange={e => setWaterInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { const ml = parseInt(waterInput, 10); if (!isNaN(ml) && ml > 0) { handleLogWater(ml); setWaterInput(''); } } }}
                              />
                              <button className="wt-submit-btn" onClick={() => { const ml = parseInt(waterInput, 10); if (!isNaN(ml) && ml > 0) { handleLogWater(ml); setWaterInput(''); } }} disabled={!waterInput}>Log</button>
                            </div>

                            {/* Milestones list */}
                            <div className="water-ms-list">
                              {WATER_MILESTONES.map(m => {
                                const isPending = w.pendingReward === m.days;
                                const isClearedOrPassed = (w.milestonesCleared || 0) >= m.days && !isPending;
                                return (
                                  <div key={m.days} className={`water-ms-row${isPending ? ' water-ms-pending' : isClearedOrPassed ? ' water-ms-done' : ''}`}>
                                    <span className="water-ms-day">{m.days}d</span>
                                    <span className="water-ms-lbl">{waterRewardLabel(m.reward)}</span>
                                    {isPending && <span className="water-ms-badge">Claim!</span>}
                                    {isClearedOrPassed && <span className="water-ms-badge water-ms-done-badge">✓</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Timing */}
                    <div className="gba-section">
                      <button className="timing-toggle-btn" onClick={() => setShowTimingPanel(p => !p)}>
                        🕗 Timing
                        {appState.timing?.lastLogDate === todayString()
                          ? <span className="obj-updated-badge">Updated</span>
                          : (appState.timing?.streak || 0) > 0
                            ? <span className="obj-pending-badge">Pending</span>
                            : null}
                      </button>
                      {showTimingPanel && (() => {
                        const t = appState.timing || initTiming();
                        const today = todayString();
                        const loggedToday = t.lastLogDate === today;
                        const nextMilestone = TIMING_MILESTONES.find(m => m.days > t.streak && !(t.claimedMilestones || []).includes(m.days));

                        if (t.pendingReward) {
                          return (
                            <div className="fast-panel fast-rewarding">
                              <div className="fast-result-title">🎉 Milestone Reached!</div>
                              <div className="fast-result-reward">You earned a <strong>{t.pendingReward}</strong> pack!</div>
                              <button className="fast-claim-btn" onClick={handleClaimTimingReward}>Claim Pack</button>
                            </div>
                          );
                        }

                        return (
                          <div className="fast-panel fast-idle" style={{ padding: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#1a1a2e' }}>No food after 8pm</span>
                              <span style={{ fontSize: 18, fontWeight: 900, color: '#0ea5e9' }}>🔥 {t.streak}</span>
                            </div>
                            {nextMilestone && (
                              <div style={{ fontSize: 9, color: '#7a7a8a', marginBottom: 8 }}>
                                Next reward: <strong>{nextMilestone.tier}</strong> pack at day {nextMilestone.days} ({nextMilestone.days - t.streak} to go)
                              </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                              {TIMING_MILESTONES.map(m => {
                                const done = (t.claimedMilestones || []).includes(m.days);
                                const active = t.streak >= m.days;
                                return (
                                  <div key={m.days} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8 }}>
                                    <span style={{ color: done ? '#16a34a' : active ? '#0ea5e9' : '#ccc', fontWeight: 800 }}>{done ? '✓' : active ? '●' : '○'}</span>
                                    <span style={{ flex: 1, color: '#5a5a6a' }}>Day {m.days}</span>
                                    <span className={`records-badge records-badge-${done ? 'egg' : 'vault'}`} style={{ opacity: done ? 0.5 : 1 }}>{m.tier}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="fast-log-row">
                              <button
                                className={`fast-log-btn${loggedToday ? ' logged' : ''}`}
                                onClick={() => handleLogTiming()}
                                disabled={loggedToday}
                              >
                                {loggedToday ? '✓ Logged' : 'Log Clean Evening'}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Treadmill Jogging */}
                    <div className="gba-section">
                      <button className="timing-toggle-btn" onClick={() => setShowTreadmillPanel(p => !p)}>
                        🏃 Treadmill Jogging
                      </button>
                      {showTreadmillPanel && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 8, color: '#9ca3af', textAlign: 'center' }}>
                            Claim after each nonstop run · same tier claimable multiple times
                          </div>
                          {TREADMILL_TIERS.map(tier => {
                            const noBuddy = tier.buddySteps > 0 && !appState.buddy;
                            return (
                              <div key={tier.mins} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 8px' }}>
                                <div style={{ minWidth: 36, textAlign: 'center' }}>
                                  <div style={{ background: '#0ea5e9', color: '#fff', borderRadius: 6, fontWeight: 900, fontSize: 11, lineHeight: 1, padding: '3px 0' }}>
                                    {tier.mins}
                                  </div>
                                  <div style={{ fontSize: 7, color: '#6b7280', marginTop: 2, fontWeight: 600 }}>MIN</div>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {tier.packs.rare && (
                                    <div style={{ fontSize: 8, fontWeight: 700, color: '#1a6fb5' }}>📦 1× Rare Pack</div>
                                  )}
                                  {tier.packs.common && (
                                    <div style={{ fontSize: 8, fontWeight: 700, color: '#5a5a6a' }}>📦 1× Common Pack</div>
                                  )}
                                  {tier.buddySteps > 0 && (
                                    <div style={{ fontSize: 8, fontWeight: 700, color: '#16a34a' }}>
                                      🦶 Buddy gets {tier.buddySteps.toLocaleString()} free steps
                                      {noBuddy && <span style={{ color: '#f59e0b', fontWeight: 600 }}> (no buddy set)</span>}
                                    </div>
                                  )}
                                </div>
                                {treadmillConfirming === tier.mins ? (
                                  <button
                                    style={{ padding: '6px 10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 900, fontSize: 9, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                                    onClick={() => {
                                      clearTimeout(treadmillConfirmTimer.current);
                                      setTreadmillConfirming(null);
                                      handleClaimTreadmill(tier);
                                    }}
                                  >
                                    ✓ Confirm
                                  </button>
                                ) : (
                                  <button
                                    style={{ padding: '6px 10px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 9, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                                    onClick={() => {
                                      clearTimeout(treadmillConfirmTimer.current);
                                      setTreadmillConfirming(tier.mins);
                                      treadmillConfirmTimer.current = setTimeout(() => setTreadmillConfirming(null), 4000);
                                    }}
                                  >
                                    Claim
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Fasting Challenge */}
                    <div className="gba-section">
                      <button className="fast-toggle-btn" onClick={() => setShowFastingPanel(p => !p)}>
                        🍽️ Fasting Challenge
                        {appState.fasting?.active?.status === 'running' && (
                          appState.fasting.active.lastLogDate === addDays(todayString(), -1)
                            ? <span className="obj-updated-badge">Updated</span>
                            : <span className="obj-pending-badge">Pending</span>
                        )}
                      </button>
                      {showFastingPanel && (() => {
                        const fasting = appState.fasting;
                        const fa = fasting?.active;
                        const today = todayString();

                        // Pending preview (generated, not yet accepted)
                        if (fastingPending) {
                          return (
                            <div className="fast-panel fast-preview">
                              <div className="fast-preview-row">
                                <span className="fast-preview-tier fast-tier-badge fast-tier-badge-{fastingPending.tier}">{fastingPending.tier.toUpperCase()}</span>
                                <span className="fast-preview-challenge">{fastingPending.hours}hr fasts × {fastingPending.days} days</span>
                              </div>
                              <div className="fast-preview-sub">
                                {fastingPending.tier === 'hard'
                                  ? `${fastingPending.graceDays} grace days allowed — exceed them and the penalty hits`
                                  : `1 grace day — miss more than 1 day and it's over`}
                              </div>
                              <div className="fast-info-row fast-reward-row">
                                <span className="fast-info-label">🎁 Reward</span>
                                <span className="fast-info-val">{fastingPending.reward.label}</span>
                              </div>
                              {fastingPending.tier === 'hard' && fastingPending.bonusReward && (
                                <div className="fast-info-row" style={{ background: 'rgba(99,102,241,0.06)', borderRadius: 6, padding: '4px 8px' }}>
                                  <span className="fast-info-label">⭐ No-Grace Bonus</span>
                                  <span className="fast-info-val">{fastingPending.bonusReward.label}</span>
                                </div>
                              )}
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
                          const pct = Math.min(100, (fa.fastsCompleted / fa.days) * 100);
                          const yesterday = addDays(today, -1);
                          const loggedYesterday = fa.lastLogDate === yesterday;
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
                              <div className="fast-active-detail">🛡 {fa.graceDays - (fa.missedDays || 0)} grace day{fa.graceDays - (fa.missedDays || 0) !== 1 ? 's' : ''} remaining</div>
                              {fa.tier === 'hard' && fa.bonusReward && (fa.missedDays || 0) === 0 && (
                                <div className="fast-active-detail" style={{ color: '#6366f1', fontWeight: 700 }}>⭐ No-grace bonus still active!</div>
                              )}
                              <div className="fast-info-row fast-reward-row">
                                <span className="fast-info-label">🎁</span>
                                <span className="fast-info-val">{fa.reward.label}</span>
                              </div>
                              <div className="fast-info-row fast-penalty-row">
                                <span className="fast-info-label">⚠</span>
                                <span className="fast-info-val">{fa.penalty.label}</span>
                              </div>
                              <div className="fast-log-row">
                                <button
                                  className={`fast-log-btn${loggedYesterday ? ' logged' : ''}`}
                                  onClick={() => handleLogFast(yesterday)}
                                  disabled={loggedYesterday}
                                >
                                  {loggedYesterday ? '✓ Logged' : '+ Log Fast'}
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // Rewarding state (all fasts done)
                        if (fa?.status === 'rewarding') {
                          const reward = fa.reward;
                          const needsEvoPicker = false;
                          const needsBuddyPicker = reward.type === 'buddySteps';
                          const needsPicker = needsBuddyPicker;
                          const pickerPoke = appState.pokemon;
                          return (
                            <div className="fast-panel fast-rewarding">
                              <div className="fast-result-title">🎉 Challenge Complete!</div>
                              <div className="fast-result-reward">{reward.label}</div>
                              {fa.tier === 'hard' && fa.bonusReward && (fa.missedDays || 0) === 0 && (
                                <div className="fast-result-reward" style={{ color: '#6366f1' }}>⭐ Bonus: {fa.bonusReward.label}</div>
                              )}
                              {needsPicker && !fastingPickedPoke && (
                                <div className="fast-poke-picker">
                                  <div className="fast-picker-label">
                                    Choose which Pokémon gets the buddy steps:
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
                                  onClick={() => handleClaimFastingReward(fastingPickedPoke)}
                                >
                                  ✨ Claim Reward
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

                    {/* Sugar Control */}
                    <div className="gba-section">
                      <button className="sugar-toggle-btn" onClick={() => setShowSugarPanel(p => !p)}>
                        🍬 Sugar Control
                        {appState.sugar?.active?.status === 'running' && (
                          appState.sugar.active.lastLogDate === addDays(todayString(), -1)
                            ? <span className="obj-updated-badge">Updated</span>
                            : <span className="obj-pending-badge">Pending</span>
                        )}
                      </button>
                      {showSugarPanel && (() => {
                        const sugar = appState.sugar;
                        const sa = sugar?.active;
                        const today = todayString();

                        if (sugarPending) {
                          return (
                            <div className="fast-panel fast-preview">
                              <div className="fast-preview-row">
                                <span className={`fast-tier-badge fast-tier-badge-${sugarPending.tier}`}>{sugarPending.tier.toUpperCase()}</span>
                                <span className="fast-preview-challenge">Under {sugarPending.limitGrams}g × {sugarPending.days} days</span>
                              </div>
                              <div className="fast-preview-sub">Complete within {sugarPending.window} days of starting</div>
                              <div className="fast-info-row fast-reward-row">
                                <span className="fast-info-label">🎁 Reward</span>
                                <span className="fast-info-val">{sugarPending.reward.label}</span>
                              </div>
                              <div className="fast-info-row fast-penalty-row">
                                <span className="fast-info-label">⚠ Penalty</span>
                                <span className="fast-info-val">{sugarPending.penalty.label}</span>
                              </div>
                              <div className="fast-preview-actions">
                                <button className="fast-accept-btn" onClick={handleAcceptSugar}>Accept Challenge</button>
                                <button className="fast-decline-btn" onClick={() => setSugarPending(null)}>Decline</button>
                              </div>
                            </div>
                          );
                        }

                        if (sa?.status === 'running') {
                          const windowEnd = addDays(sa.startDate, sa.window);
                          const daysLeft = Math.max(0, daysBetween(today, windowEnd));
                          const pct = Math.min(100, (sa.daysCompleted / sa.days) * 100);
                          const yesterday = addDays(today, -1);
                          const loggedYesterday = sa.lastLogDate === yesterday;
                          return (
                            <div className="fast-panel fast-active">
                              <div className="fast-active-header">
                                <span className={`fast-tier-badge fast-tier-badge-${sa.tier}`}>{sa.tier.toUpperCase()}</span>
                                <span className="fast-active-count">{sa.daysCompleted} / {sa.days} days</span>
                              </div>
                              <div className="loan-bar fast-bar">
                                <div className="loan-bar-fill fast-bar-fill" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="fast-active-detail">🍬 Under {sa.limitGrams}g sugar required</div>
                              <div className="fast-active-detail">📅 {daysLeft} days left in window</div>
                              <div className="fast-info-row fast-reward-row">
                                <span className="fast-info-label">🎁</span>
                                <span className="fast-info-val">{sa.reward.label}</span>
                              </div>
                              <div className="fast-info-row fast-penalty-row">
                                <span className="fast-info-label">⚠</span>
                                <span className="fast-info-val">{sa.penalty.label}</span>
                              </div>
                              <div className="fast-log-row">
                                <button className={`fast-log-btn${loggedYesterday ? ' logged' : ''}`} onClick={() => handleLogSugar(yesterday)} disabled={loggedYesterday}>
                                  {loggedYesterday ? '✓ Logged' : '+ Log Clean Day'}
                                </button>
                              </div>
                            </div>
                          );
                        }

                        if (sa?.status === 'rewarding') {
                          const reward = sa.reward;
                          const needsEvoPicker = reward.type === 'freeEvolution' || (reward.type === 'combo' && reward.parts.includes('freeEvolution'));
                          const needsBuddyPicker = reward.type === 'buddySteps';
                          const needsPicker = needsEvoPicker || needsBuddyPicker;
                          return (
                            <div className="fast-panel fast-rewarding">
                              <div className="fast-result-title">🎉 Challenge Complete!</div>
                              <div className="fast-result-reward">{reward.label}</div>
                              {needsPicker && !sugarPickedPoke && (
                                <div className="fast-poke-picker">
                                  <div className="fast-picker-label">
                                    {needsBuddyPicker ? 'Choose which Pokémon gets the buddy steps:' : 'Choose which Pokémon to evolve:'}
                                  </div>
                                  {appState.pokemon.length === 0 ? (
                                    <div className="fast-no-team">No Pokémon caught yet</div>
                                  ) : (
                                    <div className="fast-poke-grid">
                                      {appState.pokemon.map(p => (
                                        <button key={p.uid} className="fast-poke-pick-btn" onClick={() => setSugarPickedPoke(p.uid)}>
                                          {p.sprite && <img src={p.sprite} alt={p.name} className="fast-poke-pick-sprite" />}
                                          <span className="fast-poke-pick-name">{p.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              {(!needsPicker || sugarPickedPoke) && (
                                <button
                                  className="fast-claim-btn"
                                  disabled={freeEvolvingSugar}
                                  onClick={() => {
                                    if (needsEvoPicker && sugarPickedPoke) {
                                      handleFreeEvolveSugar(sugarPickedPoke);
                                      if (reward.type === 'combo' && reward.parts.includes('legendary')) {
                                        handleClaimSugarReward(sugarPickedPoke);
                                      }
                                    } else {
                                      handleClaimSugarReward(sugarPickedPoke);
                                    }
                                  }}
                                >
                                  {freeEvolvingSugar ? 'Evolving…' : '✨ Claim Reward'}
                                </button>
                              )}
                            </div>
                          );
                        }

                        if (sa?.status === 'done') {
                          return (
                            <div className="fast-panel fast-done">
                              <div className="fast-result-title">✅ Reward claimed!</div>
                              <div className="fast-result-sub">
                                {sa.tier !== 'hard' ? `${sa.tier === 'easy' ? 'Medium' : 'Hard'} tier unlocked!` : 'All tiers completed!'}
                              </div>
                              <button className="fast-dismiss-btn" onClick={handleDismissSugarResult}>Start new challenge</button>
                            </div>
                          );
                        }

                        if (sa?.status === 'failed') {
                          return (
                            <div className="fast-panel fast-failed">
                              <div className="fast-result-title">❌ Challenge Failed</div>
                              <div className="fast-result-penalty">{sa.penalty.label}</div>
                              <button className="fast-dismiss-btn" onClick={handleDismissSugarResult}>Try Again</button>
                            </div>
                          );
                        }

                        return (
                          <div className="fast-panel fast-idle">
                            <div className="fast-idle-title">Choose a difficulty</div>
                            <div className="fast-tier-btns">
                              {['easy', 'medium', 'hard'].map(tier => {
                                const unlocked = sugar?.unlockedTiers?.includes(tier);
                                const completed = sugar?.completedTiers?.includes(tier);
                                return (
                                  <button
                                    key={tier}
                                    className={`fast-tier-btn fast-tier-btn-${tier}${!unlocked ? ' fast-locked' : ''}`}
                                    onClick={() => unlocked && handleGenerateSugar(tier)}
                                    disabled={!unlocked}
                                  >
                                    <span className="fast-tier-btn-label">{tier}</span>
                                    {!unlocked && <span className="fast-tier-lock">🔒</span>}
                                    {completed && <span className="fast-tier-done">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="fast-idle-hint">Stay under the daily sugar limit for the required days within the window.</div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* ── Surprise Challenges ── */}
                    <div className="obj-category-label" style={{ marginTop: 10 }}>Surprise Challenges</div>

                    {/* Wife Challenge — August 2026 only */}
                    {todayString().startsWith('2026-08') && <div className="gba-section">
                      <button className="wc-toggle-btn" onClick={() => setShowWifeChallengePanel(p => !p)}>
                        🏅 Vishnupriya's Challenge
                        {(() => {
                          const today = todayString();
                          const month = today.slice(0, 7);
                          const mo = parseInt(month.slice(5, 7));
                          const yr = parseInt(month.slice(0, 4));
                          const daysInMo = new Date(yr, mo, 0).getDate();
                          const lastDay = `${month}-${String(daysInMo).padStart(2, '0')}`;
                          const complete = today > lastDay;
                          const logs = appState.wifeChallenge?.logs || {};
                          if (complete) {
                            // compute winner
                            const days2 = [];
                            for (let d = 1; d <= daysInMo; d++) days2.push(`${month}-${String(d).padStart(2, '0')}`);
                            const chandanMap2 = {};
                            (appState.stepHistory || []).forEach(e => { if (e.date.startsWith(month)) chandanMap2[e.date] = e.steps; });
                            const ct = days2.reduce((s, d) => s + (chandanMap2[d] || 0), 0);
                            const vt = days2.reduce((s, d) => s + (logs[d] !== undefined ? logs[d] + 3000 : 0), 0);
                            if (ct > vt) return <span className="obj-updated-badge">You won!</span>;
                            if (vt > ct) return <span className="obj-pending-badge">V won 💸</span>;
                            return <span className="obj-active-badge">Draw</span>;
                          }
                          return logs[today] !== undefined
                            ? <span className="obj-updated-badge">Updated</span>
                            : <span className="obj-pending-badge">Pending</span>;
                        })()}
                      </button>
                      {showWifeChallengePanel && (() => {
                        const today = todayString();
                        const month = today.slice(0, 7);
                        const year = parseInt(month.slice(0, 4));
                        const mo = parseInt(month.slice(5, 7));
                        const daysInMonth = new Date(year, mo, 0).getDate();
                        const days = [];
                        for (let d = 1; d <= daysInMonth; d++) {
                          const ds = `${month}-${String(d).padStart(2, '0')}`;
                          if (ds > today) break;
                          days.push(ds);
                        }
                        const logs = appState.wifeChallenge?.logs || {};
                        const chandanMap = {};
                        (appState.stepHistory || []).forEach(e => { if (e.date.startsWith(month)) chandanMap[e.date] = e.steps; });
                        chandanMap[today] = appState.todaySteps || 0;
                        const HEADSTART = 3000;
                        const chandanTotal = days.reduce((s, d) => s + (chandanMap[d] || 0), 0);
                        // Vishnupriya gets 3k headstart per logged day
                        const vishLoggedDays = days.filter(d => logs[d] !== undefined).length;
                        const vishTotal = days.reduce((s, d) => s + (logs[d] !== undefined ? (logs[d] + HEADSTART) : 0), 0);
                        const chandanDays10k = days.filter(d => (chandanMap[d] || 0) >= 10000).length;
                        const vishDays10k = days.filter(d => logs[d] !== undefined && (logs[d] + HEADSTART) >= 10000).length;
                        const leader = chandanTotal > vishTotal ? 'Chandan' : vishTotal > chandanTotal ? 'Vishnupriya' : null;
                        const lead = Math.abs(chandanTotal - vishTotal);
                        const monthLabel = new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });
                        const lastDayStr = `${month}-${String(daysInMonth).padStart(2, '0')}`;
                        const monthComplete = today > lastDayStr;
                        const claimed = (appState.wifeChallenge?.claimedMonths || []).includes(month);
                        const defeated = (appState.wifeChallenge?.defeatedMonths || []).includes(month);
                        return (
                          <div className="wc-panel">
                            <div className="wc-month-label">{monthLabel}</div>
                            <div className="wc-stakes">
                              <div className="wc-stake wc-stake-win">🥚 You win → 3 Starter Eggs</div>
                              <div className="wc-stake wc-stake-lose">💸 She wins → Buy her a gift</div>
                            </div>
                            <div className="wc-scoreboard">
                              <div className="wc-player wc-player-chandan">
                                <div className="wc-player-name">Chandan</div>
                                <div className="wc-player-steps">{chandanTotal.toLocaleString()}</div>
                                <div className="wc-player-sub">{chandanDays10k}d ≥ 10k</div>
                              </div>
                              <div className="wc-vs">VS</div>
                              <div className="wc-player wc-player-vish">
                                <div className="wc-player-name">Vishnupriya</div>
                                <div className="wc-player-steps">{vishTotal.toLocaleString()}</div>
                                <div className="wc-player-sub">{vishDays10k}d ≥ 10k</div>
                              </div>
                            </div>
                            {leader ? (
                              <div className={`wc-leader-bar wc-leader-${leader === 'Chandan' ? 'chandan' : 'vish'}`}>
                                {monthComplete ? `${leader} won!` : `${leader} leads`} · {lead.toLocaleString()} steps
                              </div>
                            ) : days.length > 0 ? (
                              <div className="wc-leader-bar wc-leader-tie">{monthComplete ? 'Draw!' : 'Tied!'}</div>
                            ) : null}

                            {/* Month over: claim or result */}
                            {monthComplete && leader === 'Chandan' && !claimed && (
                              <div className="wc-victory-box">
                                <div className="wc-victory-title">🏆 You won this month!</div>
                                <div className="wc-victory-sub">Claim your reward: 3 Starter Eggs</div>
                                <button className="wc-claim-btn" onClick={() => handleClaimWifeVictory(month)} disabled={claimingVictory}>
                                  {claimingVictory ? 'Opening eggs…' : '🥚 Claim 3 Starter Eggs'}
                                </button>
                              </div>
                            )}
                            {monthComplete && leader === 'Vishnupriya' && !defeated && (
                              <div className="wc-defeat-box">
                                <div className="wc-defeat-title">💸 Vishnupriya won — time to buy her something cool!</div>
                                <button className="wc-dismiss-btn" style={{ marginTop: 8 }} onClick={() => {
                                  setAppState(prev => ({
                                    ...prev,
                                    wifeChallenge: {
                                      ...(prev.wifeChallenge || initWifeChallenge()),
                                      defeatedMonths: [...(prev.wifeChallenge?.defeatedMonths || []), month],
                                    },
                                    challengeLog: [{ date: today, type: 'wifeChallenge', tier: 'epic', outcome: `Lost ${monthLabel} — owe Vishnupriya a gift` }, ...(prev.challengeLog || [])],
                                  }));
                                }}>Noted 😔</button>
                              </div>
                            )}
                            {victoryStarters && claimed && (
                              <div className="wc-starters-reveal">
                                <div className="wc-starters-title">🎉 Your 3 Starters!</div>
                                <div className="wc-starters-row">
                                  {victoryStarters.map(p => (
                                    <div key={p.uid} className="wc-starter-card">
                                      {p.sprite && <img src={p.sprite} alt={p.name} className="wc-starter-sprite" />}
                                      <div className="wc-starter-name">{p.name}</div>
                                    </div>
                                  ))}
                                </div>
                                <button className="wc-dismiss-btn" onClick={() => setVictoryStarters(null)}>Done</button>
                              </div>
                            )}

                            {!monthComplete && <div className="wc-log-section">
                              <div className="wc-log-label">Vishnupriya's steps today</div>
                              <div className="wc-log-row">
                                <input
                                  type="number"
                                  className="wc-steps-input"
                                  placeholder="Steps"
                                  min="0"
                                  value={wifeChallengeInput}
                                  onChange={e => setWifeChallengeInput(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleLogWifeSteps()}
                                />
                                <button className="wc-log-btn" onClick={handleLogWifeSteps}>Log</button>
                              </div>
                            </div>}

                            <table className="wc-table">
                              <thead>
                                <tr>
                                  <th className="wc-th">Day</th>
                                  <th className="wc-th wc-th-c">Chandan</th>
                                  <th className="wc-th wc-th-c">Vishnupriya</th>
                                  <th className="wc-th wc-th-c">W</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...days].reverse().map(ds => {
                                  const day = parseInt(ds.slice(8));
                                  const cs = chandanMap[ds] || 0;
                                  const vsRaw = logs[ds] ?? null;
                                  const vsEff = vsRaw !== null ? vsRaw + HEADSTART : null;
                                  const w = vsEff !== null ? (cs > vsEff ? 'C' : vsEff > cs ? 'V' : '=') : null;
                                  return (
                                    <tr key={ds} className="wc-row">
                                      <td className="wc-td">{day}</td>
                                      <td className={`wc-td wc-td-c${cs >= 10000 ? ' wc-10k' : ''}`}>{cs ? cs.toLocaleString() : '—'}</td>
                                      <td className={`wc-td wc-td-c${vsEff !== null && vsEff >= 10000 ? ' wc-10k' : ''}`}>{vsRaw !== null ? `${vsRaw.toLocaleString()} +3k` : '—'}</td>
                                      <td className="wc-td wc-td-c">
                                        {w === 'C' && <span className="wc-win-badge wc-win-c">C</span>}
                                        {w === 'V' && <span className="wc-win-badge wc-win-v">V</span>}
                                        {w === '=' && <span className="wc-win-badge wc-win-tie">=</span>}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>}

                    {/* Prashant's Wedding Challenge */}
                    {!(appState.weddingChallenge?.claimedReward || appState.weddingChallenge?.penaltyApplied) && <div className="gba-section">
                      <button className="wc-toggle-btn" onClick={() => setShowWeddingPanel(p => !p)}>
                        💍 Prashant's Wedding
                        {(() => {
                          const wc = appState.weddingChallenge || {};
                          const today = todayString();
                          const cw = appState.weight?.lastKg ?? null;
                          if (wc.claimedReward) return <span className="obj-updated-badge">Won!</span>;
                          if (wc.penaltyApplied) return <span className="obj-pending-badge">Lost</span>;
                          if (today > WEDDING_DATE) {
                            return cw !== null && cw <= WEDDING_GOAL_KG
                              ? <span className="obj-updated-badge">Claim!</span>
                              : <span className="obj-pending-badge">Penalty Due</span>;
                          }
                          return cw !== null && cw <= WEDDING_GOAL_KG
                            ? <span className="obj-updated-badge">Goal Reached!</span>
                            : <span className="obj-active-badge">Active</span>;
                        })()}
                      </button>
                      {showWeddingPanel && (() => {
                        const today = todayString();
                        const wc = appState.weddingChallenge || initWeddingChallenge();
                        const currentWeight = appState.weight?.lastKg ?? null;
                        const startDate = wc.startDate || today;
                        const startWeight = wc.startWeight || currentWeight || WEDDING_GOAL_KG + 5;
                        const totalDays = Math.max(1, daysBetween(startDate, WEDDING_DATE));
                        const daysElapsed = Math.max(0, daysBetween(startDate, today));
                        const daysLeft = Math.max(0, daysBetween(today, WEDDING_DATE));
                        const timePct = Math.min(100, (daysElapsed / totalDays) * 100);
                        const weightToLose = Math.max(0, startWeight - WEDDING_GOAL_KG);
                        const weightLost = currentWeight !== null ? Math.max(0, startWeight - currentWeight) : 0;
                        const weightPct = weightToLose > 0 ? Math.min(100, (weightLost / weightToLose) * 100) : 0;
                        const postWedding = today > WEDDING_DATE;
                        const goalReached = currentWeight !== null && currentWeight <= WEDDING_GOAL_KG;

                        const motivations = [
                          "You are dancing at your closest friend's wedding. YOU WANT TO LOOK HOT.",
                          "Prashant deserves to see you at your absolute best. Make it happen.",
                          "Every step today is a step closer to that dance floor. MAKE IT COUNT.",
                          "The wedding photos are forever. You will thank yourself on Jan 18th.",
                          "Champion mindset — one meal, one walk, one day at a time.",
                          "Picture yourself on that dance floor. Fit. Confident. Unstoppable.",
                        ];
                        const motivation = motivations[Math.floor((daysElapsed / totalDays) * motivations.length) % motivations.length];

                        if (wc.claimedReward) {
                          return (
                            <div className="fast-panel fast-done">
                              <div className="fast-result-title">🎊 Challenge Won!</div>
                              <div className="fast-result-sub">You looked incredible at Prashant's wedding.</div>
                            </div>
                          );
                        }
                        if (wc.penaltyApplied) {
                          return (
                            <div className="fast-panel fast-failed">
                              <div className="fast-result-title">💔 Challenge Over</div>
                              <div className="fast-result-sub">5 epic Pokémon forfeited. Next time, champion.</div>
                            </div>
                          );
                        }
                        return (
                          <div style={{ padding: '4px 0' }}>
                            <div style={{ fontSize: 9, fontStyle: 'italic', color: '#6d28d9', marginBottom: 8, lineHeight: 1.4, textAlign: 'center', fontWeight: 700, padding: '6px 8px', background: 'rgba(109,40,217,0.08)', borderRadius: 6 }}>
                              "{motivation}"
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              <div style={{ flex: 1, background: '#fef3c7', borderRadius: 6, padding: '6px 8px', border: '1px solid #fcd34d' }}>
                                <div style={{ fontSize: 8, color: '#92400e', fontWeight: 700 }}>GOAL</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: '#78350f' }}>88 kg</div>
                                <div style={{ fontSize: 8, color: '#b45309' }}>by Jan 18, 2027</div>
                              </div>
                              <div style={{ flex: 1, background: goalReached ? '#dcfce7' : '#fef2f2', borderRadius: 6, padding: '6px 8px', border: `1px solid ${goalReached ? '#86efac' : '#fca5a5'}` }}>
                                <div style={{ fontSize: 8, color: '#374151', fontWeight: 700 }}>CURRENT</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: goalReached ? '#15803d' : '#dc2626' }}>
                                  {currentWeight !== null ? `${currentWeight} kg` : 'Not logged'}
                                </div>
                                <div style={{ fontSize: 8, color: '#6b7280' }}>
                                  {currentWeight !== null
                                    ? (currentWeight > WEDDING_GOAL_KG ? `${(currentWeight - WEDDING_GOAL_KG).toFixed(0)} kg to go` : '✓ Goal reached!')
                                    : 'Log weight first'}
                                </div>
                              </div>
                            </div>

                            <div style={{ marginBottom: 6 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#374151', marginBottom: 3 }}>
                                <span>⏳ Time elapsed</span>
                                <span>{daysLeft}d left · {Math.round(timePct)}%</span>
                              </div>
                              <div className="loan-bar loan-bar-muted">
                                <div className="loan-bar-fill" style={{ width: `${timePct}%`, background: timePct > 80 ? '#dc2626' : timePct > 60 ? '#f59e0b' : '#0ea5e9' }} />
                              </div>
                            </div>

                            {currentWeight !== null && weightToLose > 0 && (
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#374151', marginBottom: 3 }}>
                                  <span>⚖️ Weight progress</span>
                                  <span>{Math.round(weightPct)}% · {weightLost.toFixed(1)} kg lost</span>
                                </div>
                                <div className="loan-bar loan-bar-muted">
                                  <div className="loan-bar-fill" style={{ width: `${weightPct}%`, background: '#16a34a' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#9ca3af', marginTop: 2 }}>
                                  <span>{startWeight} kg</span>
                                  <span>{WEDDING_GOAL_KG} kg</span>
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: 6, marginBottom: 8, fontSize: 8, padding: '6px 8px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#15803d', fontWeight: 700 }}>🏆 WIN</div>
                                <div style={{ color: '#374151' }}>2 Legendary Pokémon</div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#dc2626', fontWeight: 700 }}>💀 LOSE</div>
                                <div style={{ color: '#374151' }}>Lose 5 Epic Pokémon</div>
                              </div>
                            </div>

                            {goalReached && !postWedding && (
                              <button
                                style={{ width: '100%', padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleClaimWeddingReward}
                                disabled={claimingWeddingReward}
                              >
                                {claimingWeddingReward ? 'Claiming…' : '🏆 Claim Your 2 Legendaries Early!'}
                              </button>
                            )}
                            {postWedding && goalReached && (
                              <button
                                style={{ width: '100%', padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleClaimWeddingReward}
                                disabled={claimingWeddingReward}
                              >
                                {claimingWeddingReward ? 'Claiming…' : '🏆 You won! Claim 2 Legendaries'}
                              </button>
                            )}
                            {postWedding && !goalReached && (
                              <button
                                style={{ width: '100%', padding: '8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleApplyWeddingPenalty}
                              >
                                💀 Apply Penalty (lose 5 epics)
                              </button>
                            )}

                            <div style={{ marginTop: 6 }}>
                              {weddingImage ? (
                                <div style={{ textAlign: 'center' }}>
                                  <img src={weddingImage} alt="Motivation" style={{ width: '100%', borderRadius: 8, border: '2px solid #7c3aed' }} />
                                  <div style={{ fontSize: 8, color: '#7c3aed', marginTop: 4 }}>Your motivation · resets on refresh</div>
                                </div>
                              ) : (
                                <button
                                  style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg, #7c3aed, #db2777)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: generatingWeddingImage ? 'default' : 'pointer', opacity: generatingWeddingImage ? 0.7 : 1 }}
                                  onClick={handleGenerateWeddingImage}
                                  disabled={generatingWeddingImage}
                                >
                                  {generatingWeddingImage ? '✨ Generating motivation…' : '🎨 Generate AI Motivation Image'}
                                </button>
                              )}
                            </div>

                            {currentWeight === null && (
                              <div style={{ fontSize: 8, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
                                Log your weight under Weight Loss to track progress
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>}

                    {/* Rakshit & Neha Challenge */}
                    {!(appState.prudhviChallenge?.claimedReward || appState.prudhviChallenge?.penaltyApplied) && <div className="gba-section">
                      <button className="wc-toggle-btn" onClick={() => setShowPrudhviPanel(p => !p)}>
                        💍 Prudhvi's Engagement
                        {(() => {
                          const pc = appState.prudhviChallenge || {};
                          const today = todayString();
                          const cw = appState.weight?.lastKg ?? null;
                          if (today > PRUDHVI_DATE) {
                            return cw !== null && cw < PRUDHVI_GOAL_KG
                              ? <span className="obj-updated-badge">Claim!</span>
                              : <span className="obj-pending-badge">Penalty Due</span>;
                          }
                          return cw !== null && cw < PRUDHVI_GOAL_KG
                            ? <span className="obj-updated-badge">Goal Reached!</span>
                            : <span className="obj-active-badge">Active</span>;
                        })()}
                      </button>
                      {showPrudhviPanel && (() => {
                        const today = todayString();
                        const currentWeight = appState.weight?.lastKg ?? null;
                        const daysLeft = Math.max(0, daysBetween(today, PRUDHVI_DATE));
                        const postDeadline = today > PRUDHVI_DATE;
                        const goalReached = currentWeight !== null && currentWeight < PRUDHVI_GOAL_KG;
                        return (
                          <div style={{ padding: '4px 0' }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              <div style={{ flex: 1, background: '#fef3c7', borderRadius: 6, padding: '6px 8px', border: '1px solid #fcd34d' }}>
                                <div style={{ fontSize: 8, color: '#92400e', fontWeight: 700 }}>GOAL</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: '#78350f' }}>below 97 kg</div>
                                <div style={{ fontSize: 8, color: '#b45309' }}>by Sep 5, 2026</div>
                              </div>
                              <div style={{ flex: 1, background: goalReached ? '#dcfce7' : '#fef2f2', borderRadius: 6, padding: '6px 8px', border: `1px solid ${goalReached ? '#86efac' : '#fca5a5'}` }}>
                                <div style={{ fontSize: 8, color: '#374151', fontWeight: 700 }}>CURRENT</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: goalReached ? '#15803d' : '#dc2626' }}>
                                  {currentWeight !== null ? `${currentWeight} kg` : 'Not logged'}
                                </div>
                                <div style={{ fontSize: 8, color: '#6b7280' }}>
                                  {currentWeight !== null ? (goalReached ? '✓ Goal hit!' : `${(currentWeight - PRUDHVI_GOAL_KG + 0.1).toFixed(1)} kg to go`) : 'Log under Weight Loss'}
                                </div>
                              </div>
                              <div style={{ flex: 1, background: '#f0f9ff', borderRadius: 6, padding: '6px 8px', border: '1px solid #bae6fd' }}>
                                <div style={{ fontSize: 8, color: '#0369a1', fontWeight: 700 }}>DEADLINE</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: postDeadline ? '#dc2626' : '#0369a1' }}>{postDeadline ? 'PASSED' : `${daysLeft}d`}</div>
                                <div style={{ fontSize: 8, color: '#6b7280' }}>Sep 5, 2026</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 6, padding: '6px 8px', border: '1px solid #bbf7d0' }}>
                                <div style={{ fontSize: 8, color: '#166534', fontWeight: 700 }}>🏆 WIN</div>
                                <div style={{ fontSize: 9, color: '#374151', fontWeight: 600 }}>5 Rare Pokémon + 30k Buddy Steps</div>
                              </div>
                              <div style={{ flex: 1, background: '#fef2f2', borderRadius: 6, padding: '6px 8px', border: '1px solid #fca5a5' }}>
                                <div style={{ fontSize: 8, color: '#dc2626', fontWeight: 700 }}>💀 LOSE</div>
                                <div style={{ fontSize: 9, color: '#374151', fontWeight: 600 }}>5 Random Common Pokémon released</div>
                              </div>
                            </div>
                            {goalReached && !postDeadline && (
                              <button style={{ width: '100%', padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleClaimPrudhviReward}>
                                🏆 Claim Early — 5 Rares + 30k Steps!
                              </button>
                            )}
                            {postDeadline && goalReached && (
                              <button style={{ width: '100%', padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleClaimPrudhviReward}>
                                🏆 You won! Claim 5 Rares + 30k Steps
                              </button>
                            )}
                            {postDeadline && !goalReached && (
                              <button style={{ width: '100%', padding: '8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleApplyPrudhviPenalty}>
                                💀 Apply Penalty (release 5 commons)
                              </button>
                            )}
                            {currentWeight === null && (
                              <div style={{ fontSize: 8, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
                                Log your weight under Weight Loss to track progress
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>}

                    {!(appState.rnChallenge?.claimedReward || appState.rnChallenge?.penaltyApplied) && <div className="gba-section">
                      <button className="wc-toggle-btn" onClick={() => setShowRNPanel(p => !p)}>
                        🤝 Rakshit &amp; Neha Meet
                        {(() => {
                          const rn = appState.rnChallenge || {};
                          const today = todayString();
                          const cw = appState.weight?.lastKg ?? null;
                          if (rn.claimedReward) return <span className="obj-updated-badge">Won!</span>;
                          if (rn.penaltyApplied) return <span className="obj-pending-badge">Lost</span>;
                          if (today > RN_DATE) {
                            return cw !== null && cw <= RN_GOAL_KG
                              ? <span className="obj-updated-badge">Claim!</span>
                              : <span className="obj-pending-badge">Penalty Due</span>;
                          }
                          return cw !== null && cw <= RN_GOAL_KG
                            ? <span className="obj-updated-badge">Goal Reached!</span>
                            : <span className="obj-active-badge">Active</span>;
                        })()}
                      </button>
                      {showRNPanel && (() => {
                        const today = todayString();
                        const rn = appState.rnChallenge || { claimedReward: false, penaltyApplied: false };
                        const currentWeight = appState.weight?.lastKg ?? null;
                        const daysLeft = Math.max(0, daysBetween(today, RN_DATE));
                        const postDeadline = today > RN_DATE;
                        const goalReached = currentWeight !== null && currentWeight <= RN_GOAL_KG;

                        if (rn.claimedReward) return (
                          <div className="fast-panel fast-done">
                            <div className="fast-result-title">🎉 Challenge Won!</div>
                            <div className="fast-result-sub">Looking great at the meet — 5 Rares + 30k buddy steps claimed.</div>
                          </div>
                        );
                        if (rn.penaltyApplied) return (
                          <div className="fast-panel fast-failed">
                            <div className="fast-result-title">💔 Challenge Lost</div>
                            <div className="fast-result-sub">5 common Pokémon released. Keep grinding.</div>
                          </div>
                        );
                        return (
                          <div style={{ padding: '4px 0' }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              <div style={{ flex: 1, background: '#fef3c7', borderRadius: 6, padding: '6px 8px', border: '1px solid #fcd34d' }}>
                                <div style={{ fontSize: 8, color: '#92400e', fontWeight: 700 }}>GOAL</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: '#78350f' }}>below 98 kg</div>
                                <div style={{ fontSize: 8, color: '#b45309' }}>by Aug 29, 2026</div>
                              </div>
                              <div style={{ flex: 1, background: goalReached ? '#dcfce7' : '#fef2f2', borderRadius: 6, padding: '6px 8px', border: `1px solid ${goalReached ? '#86efac' : '#fca5a5'}` }}>
                                <div style={{ fontSize: 8, color: '#374151', fontWeight: 700 }}>CURRENT</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: goalReached ? '#15803d' : '#dc2626' }}>
                                  {currentWeight !== null ? `${currentWeight} kg` : 'Not logged'}
                                </div>
                                <div style={{ fontSize: 8, color: '#6b7280' }}>
                                  {currentWeight !== null ? (goalReached ? '✓ Goal hit!' : `${currentWeight - RN_GOAL_KG} kg to go`) : 'Log under Weight Loss'}
                                </div>
                              </div>
                              <div style={{ flex: 1, background: '#f0f9ff', borderRadius: 6, padding: '6px 8px', border: '1px solid #bae6fd' }}>
                                <div style={{ fontSize: 8, color: '#0369a1', fontWeight: 700 }}>DEADLINE</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: postDeadline ? '#dc2626' : '#0369a1' }}>{postDeadline ? 'PASSED' : `${daysLeft}d`}</div>
                                <div style={{ fontSize: 8, color: '#6b7280' }}>Aug 29, 2026</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 6, padding: '6px 8px', border: '1px solid #bbf7d0' }}>
                                <div style={{ fontSize: 8, color: '#166534', fontWeight: 700 }}>🏆 WIN</div>
                                <div style={{ fontSize: 9, color: '#374151', fontWeight: 600 }}>5 Rare Pokémon + 30k Buddy Steps</div>
                              </div>
                              <div style={{ flex: 1, background: '#fef2f2', borderRadius: 6, padding: '6px 8px', border: '1px solid #fca5a5' }}>
                                <div style={{ fontSize: 8, color: '#dc2626', fontWeight: 700 }}>💀 LOSE</div>
                                <div style={{ fontSize: 9, color: '#374151', fontWeight: 600 }}>5 Random Common Pokémon released</div>
                              </div>
                            </div>

                            {goalReached && !postDeadline && (
                              <button style={{ width: '100%', padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleClaimRNReward}>
                                🏆 Claim Early — 5 Rares + 30k Steps!
                              </button>
                            )}
                            {postDeadline && goalReached && (
                              <button style={{ width: '100%', padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleClaimRNReward}>
                                🏆 You won! Claim 5 Rares + 30k Steps
                              </button>
                            )}
                            {postDeadline && !goalReached && (
                              <button style={{ width: '100%', padding: '8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 10, cursor: 'pointer', marginBottom: 6 }}
                                onClick={handleApplyRNPenalty}>
                                💀 Apply Penalty (release 5 commons)
                              </button>
                            )}
                            {currentWeight === null && (
                              <div style={{ fontSize: 8, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
                                Log your weight under Weight Loss to track progress
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>}

                  </div>
                </div>
              )}
              {/* ── Log Panel ── */}
              {showStepsHistoryPanel && (
                <div className="pw-icon-panel">
                  <div className="pw-ip-header">
                    <span className="pw-ip-title">📋 Log</span>
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

                    {/* Steps dropdown */}
                    <button className="log-section-toggle" onClick={() => setShowLogStepsDropdown(p => !p)}>
                      👣 Daily Steps · {(appState.stepHistory || []).length}
                      <span className="log-section-chevron">{showLogStepsDropdown ? '▲' : '▼'}</span>
                    </button>
                    {showLogStepsDropdown && (
                      (appState.stepHistory || []).length === 0 ? (
                        <div className="sh-empty">No history yet — steps log at midnight.</div>
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
                      )
                    )}

                    {/* Completed challenges dropdown */}
                    <button className="log-section-toggle" style={{ marginTop: 8 }} onClick={() => setShowLogChallengesDropdown(p => !p)}>
                      🏆 Challenges · {(appState.challengeLog || []).length}
                      <span className="log-section-chevron">{showLogChallengesDropdown ? '▲' : '▼'}</span>
                    </button>
                    {showLogChallengesDropdown && (
                      (appState.challengeLog || []).length === 0 ? (
                        <div className="sh-empty">No challenges completed yet.</div>
                      ) : (
                        <div className="clog-list">
                          {(appState.challengeLog || []).map((entry, i) => {
                            const typeLabel = {
                              fasting: '🍽️ Fasting',
                              sugar: '🍬 Sugar Control',
                              timing: '🕗 Timing',
                              wifeChallenge: '🏅 Wife Challenge',
                              debtTrap: '🏦 Debt Trap',
                              wedding: '💍 Wedding Challenge',
                              rnChallenge: '🤝 Rakshit & Neha',
                              prudhviChallenge: '💍 Prudhvi\'s Engagement',
                              water: '💧 Water Intake',
                            }[entry.type] || entry.type;
                            const tierColor = { common: '#7a7a8a', rare: '#1a6fb5', epic: '#7c3aed', legendary: '#b8860b' }[entry.tier] || '#444';
                            const isLoss = /failed|broke|lost|defaulted/i.test(entry.outcome);
                            const outcomeColor = isLoss ? '#dc2626' : '#15803d';
                            return (
                              <div key={i} className="clog-row">
                                <div className="clog-row-top">
                                  <span className="clog-type">{typeLabel}</span>
                                  <span className="clog-tier" style={{ color: tierColor }}>{entry.tier}</span>
                                  <span className="clog-date">{entry.date}</span>
                                </div>
                                <div className="clog-outcome" style={{ color: outcomeColor }}>{entry.outcome}</div>
                              </div>
                            );
                          })}
                        </div>
                      )
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
