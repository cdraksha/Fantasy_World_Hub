// Hampi Bazaar Personalities - Vijayanagara Empire 1458 AD
// Authentic historical characters from the golden age of Hampi

const hampiBazaarPersonalities = [
  {
    id: 'royal_merchant',
    name: 'Royal Merchant',
    description: 'Wealthy gem trader from distant Persian lands',
    traits: [
      'Well-traveled and worldly',
      'Speaks multiple languages',
      'Expert in precious stones',
      'Diplomatic and cultured',
      'Carries exotic goods'
    ],
    conversationTopics: [
      'Trade routes from Persia and Arabia',
      'Quality of rubies from Burma',
      'Royal court ceremonies and protocols',
      'Monsoon delays affecting spice shipments',
      'Stories from distant kingdoms'
    ],
    stayDuration: { min: 60, max: 180 },
    spendingHabits: { min: 200, max: 500 },
    orderPreferences: ['Fine silk cloth', 'Precious gems', 'Sandalwood', 'Silver ornaments'],
    personality: 'refined, speaks of distant lands, mentions royal connections',
    backstory: 'Established trade relations with the Vijayanagara court, brings exotic goods from Persia'
  },
  {
    id: 'temple_priest',
    name: 'Temple Priest',
    description: 'Learned Brahmin conducting daily rituals at Virupaksha temple',
    traits: [
      'Deeply spiritual and wise',
      'Knowledgeable in Sanskrit',
      'Performs sacred ceremonies',
      'Peaceful and contemplative',
      'Respected by all castes'
    ],
    conversationTopics: [
      'Sacred rituals and temple ceremonies',
      'Ancient Sanskrit texts and their meanings',
      'Auspicious times for festivals',
      'Stories of Lord Virupaksha',
      'Philosophical discussions on dharma'
    ],
    stayDuration: { min: 30, max: 90 },
    spendingHabits: { min: 20, max: 60 },
    orderPreferences: ['Sacred tulsi leaves', 'Camphor', 'Coconut offerings', 'Incense sticks'],
    personality: 'serene, speaks in blessings, quotes ancient wisdom',
    backstory: 'Serves at the great Virupaksha temple, guides pilgrims and performs sacred rites'
  },
  {
    id: 'court_musician',
    name: 'Court Musician',
    description: 'Skilled veena player entertaining the royal court',
    traits: [
      'Masterful with stringed instruments',
      'Knows classical ragas',
      'Entertains nobility',
      'Artistic and sensitive',
      'Preserves musical traditions'
    ],
    conversationTopics: [
      'Classical ragas for different times of day',
      'Royal court performances and patronage',
      'Stories told through music',
      'Teaching music to noble children',
      'Sacred songs for temple festivals'
    ],
    stayDuration: { min: 45, max: 120 },
    spendingHabits: { min: 80, max: 150 },
    orderPreferences: ['Veena strings', 'Musical instruments', 'Fine cloth', 'Betel leaves'],
    personality: 'melodious speech, hums ragas, speaks of rhythm and harmony',
    backstory: 'Performs for the royal family, teaches music to court children'
  },
  {
    id: 'stone_sculptor',
    name: 'Stone Sculptor',
    description: 'Master craftsman carving intricate temple pillars',
    traits: [
      'Skilled in granite carving',
      'Creates temple architecture',
      'Patient and meticulous',
      'Strong and weathered hands',
      'Preserves artistic traditions'
    ],
    conversationTopics: [
      'Techniques for carving granite pillars',
      'Temple construction projects',
      'Stories depicted in stone reliefs',
      'Tools and methods of sculpture',
      'Training apprentices in the craft'
    ],
    stayDuration: { min: 20, max: 60 },
    spendingHabits: { min: 40, max: 100 },
    orderPreferences: ['Iron chisels', 'Stone hammers', 'Simple food', 'Palm wine'],
    personality: 'speaks of permanence, admires craftsmanship, talks with hands',
    backstory: 'Works on the great temple expansions, creates pillars that will last centuries'
  },
  {
    id: 'spice_trader',
    name: 'Spice Trader',
    description: 'Merchant selling cardamom, pepper, and exotic spices',
    traits: [
      'Expert in spice quality',
      'Knows trade routes well',
      'Energetic and persuasive',
      'Travels with bullock carts',
      'Connected to coastal ports'
    ],
    conversationTopics: [
      'Quality of cardamom from Western Ghats',
      'Pepper trade with Arab merchants',
      'Monsoon effects on spice cultivation',
      'Competition from other traders',
      'Stories from Malabar coast'
    ],
    stayDuration: { min: 30, max: 90 },
    spendingHabits: { min: 60, max: 180 },
    orderPreferences: ['Cardamom pods', 'Black pepper', 'Cinnamon bark', 'Turmeric powder'],
    personality: 'aromatic presence, speaks of flavors, enthusiastic about quality',
    backstory: 'Brings spices from the coast, supplies the royal kitchens and wealthy households'
  },
  {
    id: 'royal_guard',
    name: 'Royal Guard',
    description: 'Elite warrior protecting the bazaar and royal quarters',
    traits: [
      'Disciplined and alert',
      'Skilled in combat',
      'Loyal to the empire',
      'Maintains order',
      'Respected and feared'
    ],
    conversationTopics: [
      'Security of trade routes',
      'Training with traditional weapons',
      'Stories of battles and victories',
      'Protecting pilgrims and merchants',
      'Loyalty to the Vijayanagara throne'
    ],
    stayDuration: { min: 15, max: 45 },
    spendingHabits: { min: 30, max: 80 },
    orderPreferences: ['Weapon maintenance oil', 'Leather armor', 'Simple meals', 'Betel nut'],
    personality: 'alert, speaks of duty, observes surroundings constantly',
    backstory: 'Elite guard trained in the royal barracks, ensures safety of the bazaar'
  },
  {
    id: 'silk_weaver',
    name: 'Silk Weaver',
    description: 'Artisan creating fine textiles for nobility',
    traits: [
      'Skilled in silk production',
      'Creates intricate patterns',
      'Patient and artistic',
      'Supplies royal court',
      'Preserves weaving traditions'
    ],
    conversationTopics: [
      'Silk thread quality and sources',
      'Weaving patterns for royal saris',
      'Natural dyes and colors',
      'Orders from noble families',
      'Training daughters in the craft'
    ],
    stayDuration: { min: 40, max: 100 },
    spendingHabits: { min: 70, max: 160 },
    orderPreferences: ['Silk threads', 'Natural dyes', 'Weaving tools', 'Gold thread'],
    personality: 'speaks of beauty, admires fine textures, talks of colors and patterns',
    backstory: 'Creates silk garments for the royal court, known for exquisite craftsmanship'
  },
  {
    id: 'temple_dancer',
    name: 'Temple Dancer',
    description: 'Devadasi performing sacred dances in temple ceremonies',
    traits: [
      'Graceful and expressive',
      'Trained in classical dance',
      'Devoted to temple service',
      'Preserves dance traditions',
      'Spiritually connected'
    ],
    conversationTopics: [
      'Sacred dance forms and their meanings',
      'Temple festivals and performances',
      'Stories told through dance',
      'Training young dancers',
      'Devotion expressed through movement'
    ],
    stayDuration: { min: 35, max: 80 },
    spendingHabits: { min: 50, max: 120 },
    orderPreferences: ['Ankle bells', 'Dance costumes', 'Flower garlands', 'Kohl for eyes'],
    personality: 'moves gracefully, speaks of devotion, expressive gestures',
    backstory: 'Dedicated to temple service, performs during festivals and ceremonies'
  }
];

// Helper function to get a random personality
export const getRandomHampiPersonality = () => {
  return hampiBazaarPersonalities[Math.floor(Math.random() * hampiBazaarPersonalities.length)];
};

export default hampiBazaarPersonalities;
