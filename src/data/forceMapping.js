// Fantasy Escape - Force Mapping System
// Maps numbers 1-9 to cosmic Forces and their tiers

export const FORCE_MAP = {
  1: 'Fire',
  2: 'Water', 
  3: 'Air',
  4: 'Space',
  5: 'Time',
  6: 'Gravity',
  7: 'Mind',
  8: 'Body',
  9: 'Soul'
};

export const TIER_MAP = {
  'Fire': 'Physical',
  'Water': 'Physical', 
  'Air': 'Physical',
  'Space': 'Cosmic',
  'Time': 'Cosmic',
  'Gravity': 'Cosmic',
  'Mind': 'Inner',
  'Body': 'Inner',
  'Soul': 'Inner'
};

export const GOVERNING_LAWS = {
  1: "Everything decays unless acted upon",
  2: "Emotion reshapes physics",
  3: "Words alter terrain", 
  4: "Distance distorts relationships",
  5: "Events loop",
  6: "Desire traps the protagonist",
  7: "Nothing is certain",
  8: "Pain unlocks doors",
  9: "Truth manifests physically"
};

export const WORLD_TYPES = {
  Physical: "elemental fantasy realm with primal forces",
  Cosmic: "warped spacetime reality with impossible geometry",
  Inner: "psychological dreamscape with symbolic manifestations"
};

// Generate 3x3 grid of Forces
export const generateForceGrid = () => {
  const allForces = Object.values(FORCE_MAP);
  // Shuffle array using Fisher-Yates algorithm
  for (let i = allForces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allForces[i], allForces[j]] = [allForces[j], allForces[i]];
  }
  return allForces;
};

// Get governing law from single Force
export const getGoverningLawFromForce = (force) => {
  // Find the number key for this force
  const forceKey = Object.keys(FORCE_MAP).find(key => FORCE_MAP[key] === force);
  return GOVERNING_LAWS[forceKey];
};

// Generate reality data from single Force
export const generateRealityDataFromForce = (force) => {
  const tier = TIER_MAP[force];
  return {
    force: force,
    tier: tier,
    governingLaw: getGoverningLawFromForce(force),
    worldType: WORLD_TYPES[tier] || WORLD_TYPES.Physical
  };
};
