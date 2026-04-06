export const characterPersonalities = [
  {
    id: 'asteroid_miner',
    name: 'Asteroid Miner',
    description: 'Rugged space worker who mines asteroids for rare minerals',
    traits: [
      'Tough and practical',
      'Stories about dangerous mining operations',
      'Appreciates strong coffee and hearty meals',
      'Often tired from long shifts in zero-g'
    ],
    conversationTopics: [
      'Latest asteroid strikes and mineral finds',
      'Equipment malfunctions in deep space',
      'The loneliness of mining operations',
      'Credits earned from rare element discoveries',
      'Close calls with space debris'
    ],
    stayDuration: { min: 15, max: 30 }, // minutes in simulation time
    spendingHabits: { min: 50, max: 120 }, // credits
    orderPreferences: ['Strong coffee', 'Protein bars', 'Energy drinks', 'Hearty stew'],
    personality: 'gruff but friendly, speaks in short sentences, uses mining terminology',
    backstory: 'Works the asteroid belt, sends money back to family on Mars'
  },
  {
    id: 'research_scientist',
    name: 'Research Scientist',
    description: 'Brilliant researcher studying cosmic phenomena',
    traits: [
      'Highly intelligent and curious',
      'Excited about discoveries',
      'Sometimes absent-minded',
      'Passionate about their work'
    ],
    conversationTopics: [
      'Latest research on dark matter',
      'Quantum experiments in zero gravity',
      'Theories about alien civilizations',
      'Grant funding challenges',
      'Breakthrough discoveries'
    ],
    stayDuration: { min: 20, max: 45 },
    spendingHabits: { min: 30, max: 80 },
    orderPreferences: ['Tea varieties', 'Light snacks', 'Brain food supplements', 'Fruit'],
    personality: 'enthusiastic, uses scientific terminology, gets excited about discoveries',
    backstory: 'PhD in astrophysics, working on classified government research'
  },
  {
    id: 'space_tourist',
    name: 'Space Tourist',
    description: 'Wealthy civilian experiencing space travel for the first time',
    traits: [
      'Amazed by everything in space',
      'Takes lots of photos',
      'Nervous about zero gravity',
      'Eager to share experiences'
    ],
    conversationTopics: [
      'First time seeing Earth from space',
      'How different everything feels in zero-g',
      'Expensive space vacation packages',
      'Photos to share with friends back home',
      'Luxury amenities on space stations'
    ],
    stayDuration: { min: 25, max: 60 },
    spendingHabits: { min: 80, max: 200 },
    orderPreferences: ['Exotic space cocktails', 'Gourmet meals', 'Desserts', 'Champagne'],
    personality: 'excited, asks lots of questions, mentions how expensive everything is',
    backstory: 'Made fortune in tech, fulfilling lifelong dream of space travel'
  },
  {
    id: 'cargo_pilot',
    name: 'Cargo Pilot',
    description: 'Experienced pilot who transports goods between stations',
    traits: [
      'Cool under pressure',
      'Knows all the trade routes',
      'Pragmatic and efficient',
      'Good with navigation'
    ],
    conversationTopics: [
      'Dangerous cargo runs through pirate territory',
      'Navigation challenges near black holes',
      'Best trade routes for profit',
      'Ship maintenance in deep space',
      'Encounters with space traffic control'
    ],
    stayDuration: { min: 10, max: 25 },
    spendingHabits: { min: 40, max: 90 },
    orderPreferences: ['Quick meals', 'Coffee', 'Energy bars', 'Stimulants'],
    personality: 'professional, efficient speech, talks about schedules and deadlines',
    backstory: 'Former military pilot, now runs independent cargo operations'
  },
  {
    id: 'station_engineer',
    name: 'Station Engineer',
    description: 'Technical expert who maintains the space station systems',
    traits: [
      'Highly technical mindset',
      'Proud of their work',
      'Concerned about safety',
      'Detail-oriented'
    ],
    conversationTopics: [
      'Life support system maintenance',
      'Artificial gravity generator issues',
      'Power grid optimization',
      'Emergency protocols and safety',
      'Upgrading station infrastructure'
    ],
    stayDuration: { min: 12, max: 20 },
    spendingHabits: { min: 35, max: 70 },
    orderPreferences: ['Caffeinated drinks', 'Quick snacks', 'Protein shakes', 'Vitamins'],
    personality: 'technical, uses engineering jargon, worries about system failures',
    backstory: 'Keeps the station running, takes pride in zero accidents record'
  },
  {
    id: 'diplomatic_envoy',
    name: 'Diplomatic Envoy',
    description: 'Ambassador traveling between planetary governments',
    traits: [
      'Sophisticated and well-spoken',
      'Diplomatic and careful with words',
      'Well-traveled and cultured',
      'Interested in politics'
    ],
    conversationTopics: [
      'Interplanetary trade negotiations',
      'Cultural differences between colonies',
      'Political tensions in the outer rim',
      'Diplomatic immunity in space law',
      'Peace treaties and alliances'
    ],
    stayDuration: { min: 30, max: 50 },
    spendingHabits: { min: 100, max: 250 },
    orderPreferences: ['Fine wines', 'Gourmet cuisine', 'Exotic teas', 'Luxury items'],
    personality: 'eloquent, diplomatic, speaks about politics and culture',
    backstory: 'Represents Earth government in outer colony negotiations'
  }
];

export const serviceBotTypes = [
  {
    id: 'cleaning_bot',
    name: 'Cleaning Bot',
    description: 'Autonomous cleaning robot that maintains station hygiene',
    responses: [
      'CLEANING PROTOCOL ACTIVE. PLEASE MAINTAIN SAFE DISTANCE.',
      'DEBRIS DETECTED. INITIATING SANITATION SEQUENCE.',
      'HYGIENE STANDARDS: OPTIMAL. CONTINUING PATROL.',
      'WARNING: SPILL DETECTED IN SECTOR 7. RESPONDING.',
      'MAINTENANCE CYCLE COMPLETE. RETURNING TO CHARGING STATION.'
    ],
    personality: 'robotic, formal, focused on cleanliness and order'
  },
  {
    id: 'service_bot',
    name: 'Service Bot',
    description: 'Customer service robot that assists with orders and information',
    responses: [
      'WELCOME TO ORBITAL CAFE. HOW MAY I ASSIST YOU TODAY?',
      'MENU ITEMS AVAILABLE. WOULD YOU LIKE RECOMMENDATIONS?',
      'ORDER PROCESSING COMPLETE. ESTIMATED DELIVERY: 3.7 MINUTES.',
      'CUSTOMER SATISFACTION RATING: PLEASE PROVIDE FEEDBACK.',
      'SPECIAL OFFERS AVAILABLE FOR FREQUENT SPACE TRAVELERS.'
    ],
    personality: 'helpful, customer-focused, slightly overly enthusiastic'
  },
  {
    id: 'security_bot',
    name: 'Security Bot',
    description: 'Security robot that monitors station safety and protocols',
    responses: [
      'SECURITY SCAN COMPLETE. NO THREATS DETECTED.',
      'PLEASE PRESENT IDENTIFICATION FOR VERIFICATION.',
      'MONITORING STATION PERIMETER. ALL SYSTEMS NOMINAL.',
      'SAFETY PROTOCOL REMINDER: SECURE ALL LOOSE OBJECTS.',
      'UNAUTHORIZED ACCESS DETECTED. INVESTIGATING SECTOR 12.'
    ],
    personality: 'authoritative, security-focused, slightly intimidating'
  }
];

export const getRandomPersonality = () => {
  return characterPersonalities[Math.floor(Math.random() * characterPersonalities.length)];
};

export const getRandomServiceBot = () => {
  return serviceBotTypes[Math.floor(Math.random() * serviceBotTypes.length)];
};
