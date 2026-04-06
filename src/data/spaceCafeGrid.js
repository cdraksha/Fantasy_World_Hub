// Space Cafe 2.0 Grid Data - 5x5 grid with cosmic NPCs
export const GRID_SIZE = 5;

export const SPACE_CAFE_NPCS = {
  '0,0': {
    name: 'Stellar Barista',
    personality: 'friendly',
    description: 'The cheerful keeper of cosmic beverages',
    emoji: '☕'
  },
  '0,1': {
    name: 'Quantum Physicist',
    personality: 'contemplative',
    description: 'A deep thinker pondering the mysteries of space-time',
    emoji: '🔬'
  },
  '0,2': {
    name: 'Nebula Trader',
    personality: 'adventurous',
    description: 'A seasoned merchant from distant star systems',
    emoji: '🚀'
  },
  '0,3': {
    name: 'Station Commander',
    personality: 'authoritative',
    description: 'The respected leader of this cosmic outpost',
    emoji: '�‍✈️'
  },
  '0,4': {
    name: 'Space Poet',
    personality: 'artistic',
    description: 'A wordsmith inspired by the beauty of the cosmos',
    emoji: '📝'
  },
  '1,0': {
    name: 'Galactic Chef',
    personality: 'passionate',
    description: 'Master of interstellar cuisine',
    emoji: '👨‍🍳'
  },
  '1,1': {
    name: 'Time Traveler',
    personality: 'mysterious',
    description: 'A wanderer between temporal dimensions',
    emoji: '⏰'
  },
  '1,2': {
    name: 'Asteroid Miner',
    personality: 'hardworking',
    description: 'A tough worker from the outer belt',
    emoji: '⛏️'
  },
  '1,3': {
    name: 'Cosmic Dancer',
    personality: 'joyful',
    description: 'An artist who moves to the rhythm of the stars',
    emoji: '💃'
  },
  '1,4': {
    name: 'Void Walker',
    personality: 'philosophical',
    description: 'A being who has journeyed through empty space',
    emoji: '🌑'
  },
  '2,0': {
    name: 'Solar Engineer',
    personality: 'technical',
    description: 'An expert in harnessing stellar energy',
    emoji: '⚡'
  },
  '2,1': {
    name: 'Dream Weaver',
    personality: 'mystical',
    description: 'A keeper of sleeping visions across worlds',
    emoji: '🌙'
  },
  '2,2': {
    name: 'You',
    personality: 'reflective',
    description: 'Sitting at the center table, observing the cosmic cafe around you',
    emoji: '🪑'
  },
  '2,3': {
    name: 'Alien Botanist',
    personality: 'nurturing',
    description: 'A gardener of exotic space flora',
    emoji: '🌱'
  },
  '2,4': {
    name: 'Hologram Artist',
    personality: 'creative',
    description: 'A master of light-based art forms',
    emoji: '🎨'
  },
  '3,0': {
    name: 'Memory Keeper',
    personality: 'wise',
    description: 'A guardian of ancient galactic histories',
    emoji: '📚'
  },
  '3,1': {
    name: 'Plasma Welder',
    personality: 'focused',
    description: 'A skilled craftsperson working with stellar fire',
    emoji: '🔥'
  },
  '3,2': {
    name: 'Telepathic Guide',
    personality: 'empathetic',
    description: 'A being who helps others navigate mental landscapes',
    emoji: '🧠'
  },
  '3,3': {
    name: 'Comet Chaser',
    personality: 'thrill-seeking',
    description: 'An adventurer who follows celestial wanderers',
    emoji: '☄️'
  },
  '3,4': {
    name: 'Gravity Sculptor',
    personality: 'artistic',
    description: 'An artist who shapes space itself',
    emoji: '🌀'
  },
  '4,0': {
    name: 'Star Cartographer',
    personality: 'methodical',
    description: 'A mapper of uncharted cosmic territories',
    emoji: '🗺️'
  },
  '4,1': {
    name: 'Energy Healer',
    personality: 'compassionate',
    description: 'A being who mends souls with cosmic light',
    emoji: '✨'
  },
  '4,2': {
    name: 'Quantum Musician',
    personality: 'harmonious',
    description: 'A composer of interdimensional melodies',
    emoji: '🎵'
  },
  '4,3': {
    name: 'Space Archaeologist',
    personality: 'curious',
    description: 'An explorer of ancient cosmic civilizations',
    emoji: '🏺'
  },
  '4,4': {
    name: 'Starlight Weaver',
    personality: 'ethereal',
    description: 'A being who crafts with pure stellar radiance',
    emoji: '⭐'
  }
};

// Helper functions
export const getNPCAtPosition = (x, y) => {
  return SPACE_CAFE_NPCS[`${x},${y}`] || null;
};

export const isValidPosition = (x, y) => {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
};

export const getAllNPCs = () => {
  return Object.entries(SPACE_CAFE_NPCS).map(([position, npc]) => {
    const [x, y] = position.split(',').map(Number);
    return { ...npc, x, y, position };
  });
};
