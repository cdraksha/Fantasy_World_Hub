export const PLANETS = [
  { id:'sun',     glyph:'☉', en:'Sun',     sa:'सूर्य',  trans:'Sūrya',    color:'#f0c14b', glow:'rgba(240,193,75,0.55)',  nature:'Royal · Sattvic',         myth:'The eye of the cosmos. King of the visible world.',               short:'ego, soul, sovereignty' },
  { id:'moon',    glyph:'☽', en:'Moon',    sa:'चन्द्र', trans:'Chandra',   color:'#f1ead8', glow:'rgba(241,234,216,0.55)', nature:'Benefic · Watery',        myth:'The mind in liquid form. Memory\'s tide.',                        short:'feeling, mother, the inner ocean' },
  { id:'mars',    glyph:'♂', en:'Mars',    sa:'मङ्गल',  trans:'Maṅgala',   color:'#c83a2a', glow:'rgba(200,58,42,0.6)',    nature:'Malefic · Fire',          myth:'The blood-warrior. Discipline forged in flame.',                  short:'courage, conflict, the will to act' },
  { id:'mercury', glyph:'☿', en:'Mercury', sa:'बुध',    trans:'Budha',     color:'#4faa6e', glow:'rgba(79,170,110,0.55)',  nature:'Neutral · Earth',         myth:'The messenger-prince. Quicksilver between realms.',               short:'speech, intellect, commerce' },
  { id:'jupiter', glyph:'♃', en:'Jupiter', sa:'गुरु',   trans:'Guru',      color:'#d99a3a', glow:'rgba(217,154,58,0.55)',  nature:'Benefic · Ether',         myth:'The teacher. The expanse that blesses.',                          short:'wisdom, fortune, expansion' },
  { id:'venus',   glyph:'♀', en:'Venus',   sa:'शुक्र',  trans:'Śukra',     color:'#e88aa3', glow:'rgba(232,138,163,0.55)', nature:'Benefic · Water',         myth:'Sage of the asuras. Beauty that knows the dark.',                 short:'love, art, sweetness' },
  { id:'saturn',  glyph:'♄', en:'Saturn',  sa:'शनि',    trans:'Śani',      color:'#3a5599', glow:'rgba(58,85,153,0.6)',    nature:'Malefic · Air',           myth:'The slow one. The judge whose verdict is years.',                 short:'discipline, time, weight' },
  { id:'rahu',    glyph:'☊', en:'Rahu',    sa:'राहु',   trans:'Rāhu',      color:'#6e4ea8', glow:'rgba(110,78,168,0.6)',   nature:'Shadow · Northern Node',  myth:'The severed head. Hunger that cannot be filled.',                 short:'obsession, foreign, hunger' },
  { id:'ketu',    glyph:'☋', en:'Ketu',    sa:'केतु',   trans:'Ketu',      color:'#8a8579', glow:'rgba(138,133,121,0.55)', nature:'Shadow · Southern Node',  myth:'The severed body. Memory of past lives smoldering.',              short:'moksha, detachment, the cut' },
];

// South Indian chart — 4×4 grid, fixed signs. Aries top-row second-from-left, clockwise.
export const HOUSES = [
  { num:12, sign:'♓', signName:'Pisces',      theme:'Moksha',   row:1, col:1 },
  { num:1,  sign:'♈', signName:'Aries',       theme:'Self',     row:1, col:2 },
  { num:2,  sign:'♉', signName:'Taurus',      theme:'Wealth',   row:1, col:3 },
  { num:3,  sign:'♊', signName:'Gemini',      theme:'Siblings', row:1, col:4 },
  { num:4,  sign:'♋', signName:'Cancer',      theme:'Home',     row:2, col:4 },
  { num:5,  sign:'♌', signName:'Leo',         theme:'Creation', row:3, col:4 },
  { num:6,  sign:'♍', signName:'Virgo',       theme:'Service',  row:4, col:4 },
  { num:7,  sign:'♎', signName:'Libra',       theme:'Spouse',   row:4, col:3 },
  { num:8,  sign:'♏', signName:'Scorpio',     theme:'Mystery',  row:4, col:2 },
  { num:9,  sign:'♐', signName:'Sagittarius', theme:'Dharma',   row:4, col:1 },
  { num:10, sign:'♑', signName:'Capricorn',   theme:'Career',   row:3, col:1 },
  { num:11, sign:'♒', signName:'Aquarius',    theme:'Gains',    row:2, col:1 },
];

export const MANTRAS = [
  'Place a planet to begin.',
  'The cosmos waits in a single grain.',
  'Every body in heaven leaves a fingerprint on the soul.',
  'Drag a graha. Read what falls into place.',
  'The stars are not fate — they are language.',
];

export const READINGS = {
  sun:     ['Sovereignty radiates from within. The self is its own throne.','Wealth wears a regal cloak — but ego may eat its share.','Voice carries the weight of command. Siblings step aside.','The hearth burns bright; the mother stands in the king\'s shadow.','Children inherit fire. Creativity is a public act.','Conflict found, conflict won — at the cost of allies.','A spouse who must learn to be seen beside, not behind.','Crisis becomes coronation. The Sun loves what burns.','Dharma is performed, not whispered. Travel becomes ritual.','Career is the Sun\'s true kingdom. Power, recognized.','Gains arrive bearing your name. The network bows.','The self dissolves in service. Hidden labor, public glory.'],
  moon:    ['The body is a vessel of moods. Beware the unfed mind.','Money rises and falls with the tide of feeling.','Words land softly. Siblings remember what was said at 3 AM.','Home is sanctuary. The mother\'s blessing is foundational.','Imagination births worlds. The child within rules.','Health flickers like a flame in monsoon wind.','Partnership is mirrored emotion — gentle, mutually wounded.','Dreams turn prophetic. Secrets sleep beneath the bed.','Faith is felt, not argued. Pilgrimage by water.','Career follows the public mood. Fame possible, instability also.','Gains come from many — not few. The crowd is kin.','The unconscious is wide open. Solitude is medicine.'],
  mars:    ['The body is forged in iron. Anger is a teacher with sharp hands.','Wealth earned by force. Speech can wound the bank account.','Siblings spar. Courage runs in the blood.','The home knows raised voices. Property is fought for and won.','Children come strong-willed. Creativity is a campaign.','Enemies fall — illness too. Mars heals what it harms.','Marriage is fire. Either forge or conflagration.','Transformation comes through wound. Surgery, accident, rebirth.','Belief becomes battle. Travel with cause.','Career is conquest. Engineers, soldiers, surgeons thrive.','Friends are comrades. Gains demand effort.','Hidden enemies. Sleep restless. The fight follows you in.'],
  mercury: ['The mind is quick, the tongue quicker. Self is articulate.','Wealth made through words and numbers. The deal whispers back.','Siblings are allies, scribes, conspirators in the best sense.','Home is full of books. Childhood was schooled.','Children of intellect. Speculation rewards the careful.','Health worries in the head before the body. Nerves rule.','A spouse who is also a co-author. Words bind the bond.','Research, the occult, the contract — Mercury reads the fine print.','Higher learning blesses. Languages open doors.','Career in writing, teaching, trade. The hand is paid for skill.','Networks are vast. Conversations turn into capital.','The mind wanders the unconscious. Codes and dreams entangle.'],
  jupiter: ['A blessed self. Optimism is a lifelong inheritance.','Wealth grows in fertile soil. Generosity returns multiplied.','Siblings teach. Even adversaries become guides.','The home is wide and welcoming. The mother is wise.','Children are gifts that arrive with their own light.','Health debts forgiven. Even illness teaches.','A spouse who is also a teacher. The marriage is a school.','Inheritance, occult wisdom, sudden revelations.','The placement of the sage. Dharma is the air you breathe.','Career carries reputation. Honors find you without asking.','Gains are abundant and clean. The elder becomes ally.','Final liberation glimpsed. The end is a beginning.'],
  venus:   ['Beauty walks with you. Self is sweetly held.','Wealth in art, beauty, women\'s blessings. Comfort accumulates.','Younger siblings pampered. The tongue sings before it argues.','A home of luxury and love. The mother\'s grace is visible.','Romance, art, children — all bloom here.','Indulgence may inflame. Sweetness too — diabetes of the chart.','The classical Venus seat. A spouse of grace and harmony.','Inheritance from love. Hidden romance.','Faith is aesthetic. Pilgrimage to beautiful places.','Career in art, design, diplomacy. Charm is currency.','Friendships rich and many. Gains through women.','Pleasure in the dream world. Bedroom delights.'],
  saturn:  ['The body learns gravity early. Old soul, young face.','Wealth slow, then steady. Saturn pays in decades.','Older siblings or no siblings. Effort speaks.','The home is austere or distant. Ancestors weigh in.','Children come late or carefully. Creativity disciplined.','Service is the Saturn temple. Health through routine.','A spouse older or graver. The marriage rewards endurance.','Longevity strong. Crisis is patient with you.','Faith earned, not inherited. Slow pilgrimage.','The exalted seat of duty. Career through sustained effort.','Gains arrive late but lasting. Old friends, deep wells.','Solitude is teacher. Detachment is destination.'],
  rahu:    ['An identity that hungers to be seen — and sometimes consumes itself.','Sudden gains, sudden losses. The wallet is a weather system.','Communication amplifies — half-truths travel far.','Restlessness at home. Foreign roots, unfamiliar comforts.','Speculation thrills, then bites. Children may surprise.','Strange illnesses. Enemies behave unpredictably.','A partner from across a border, language, or culture.','Occult obsession. Transformation through what cannot be named.','Belief turns radical. Long voyages.','Career outside tradition. Tech, foreign markets, the new.','Wild networks. Gains arrive in unexpected currencies.','Hidden longings rule. The unconscious is loud.'],
  ketu:    ['The self is half-here. Past lives leak through.','Detachment from money — for better and for worse.','Spiritual siblings, or distant ones. Speech becomes sparse.','Roots feel uprooted. Home is a question.','Mystical children. Creativity arrives unbidden, unowned.','Health enigmas. Healers themselves carry Ketu here.','A partner who comes and goes. Bonds soften, slip.','The seat of moksha. Death is mere doorway.','Renunciation as path. Pilgrimage inward.','Career feels temporary. The world is waiting room.','Friends are ghosts of old lives. Gains feel undeserved.','Liberation. The flame goes out, and the room is finally still.'],
};

export const VERDICTS = [
  'A life headed toward respected stability.',
  'A path of slow climb, late blossom, lasting name.',
  'A soul that will be known for what it gives away.',
  'A life of inward pilgrimage and outward grace.',
  'A fate written in fire — bright, contested, won.',
  'A union written in the stars — with one storm to weather.',
  'A becoming. The chart says: not yet finished.',
];
