// Central source of truth for all FantasyWorld Hub experiences
export const EXPERIENCES = {
  'space-cafe-observer': {
    title: 'Space Cafe Observer',
    icon: '☕',
    contentType: 'Interactive Simulation',
    description: 'Space Cafe Observer creates a therapeutic, immersive experience where you explore a cosmic cafe filled with intergalactic characters. You move through the space at your own pace, observing peaceful interactions and generating contextual images of what you see. The experience focuses on creating a sense of presence and calm in a fantastical cosmic environment.',
    example: 'You sit by a window overlooking a nebula while a friendly Space Dancer orders cosmic tea next to you.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'hampi-bazaar': {
    title: 'Hampi Bazaar',
    icon: '🏛️',
    contentType: 'Interactive Simulation',
    description: 'Journey to the Vijayanagara Empire at its peak in 1458. Explore the bustling Hampi Bazaar through an interactive simulation where you can meet characters like Royal Merchants, Temple Priests, Court Musicians, Stone Sculptors, Spice Traders, and Royal Guards. Experience the warm Karnataka sun, cardamom scents, and magnificent stone architecture in this immersive historical setting.',
    example: 'Walk through the ancient bazaar streets, interact with a Spice Trader arranging colorful spices, listen to temple bells echoing across the stone courtyards, and watch skilled sculptors carving intricate designs while the golden hour light bathes the sandstone architecture.',
    modelsUsed: 'Interactive simulation with character interactions and historical atmosphere',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'imaginary-interviews': {
    title: 'An Interview with Emperor Tiberius in the Year 3125',
    icon: '🎥',
    contentType: 'Video',
    description: 'An Interview with Emperor Tiberius in the Year 3125 presents a futuristic interview scenario where Emperor Tiberius addresses the pressing issues of 3125 - from Martian refugees to AI rights, interstellar politics, and the challenges of governing a galactic empire.',
    example: 'Emperor Tiberius adjusts his neural crown as he discusses the latest Martian refugee crisis: "The terraforming delays on Europa have created unprecedented challenges, but we must remember our duty to all sentient beings across the galaxy."',
    modelsUsed: 'OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'retro-futurism': {
    title: 'Retro Futurism',
    icon: '🚀',
    contentType: 'Text and Image',
    description: 'Retro Futurism presents the future as imagined by past generations - flying cars, chrome cities, and atomic-powered everything. Experience tomorrow through the lens of yesterday\'s dreams.',
    example: 'A 1950s vision of 2020: families in silver jumpsuits eating pill-based meals while their robot butler serves atomic cocktails in a glass dome house.',
    modelsUsed: 'Imagen-4 for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    inspiredBy: 'Fantastic Four (2025)',
    createdDate: 'Sept 2025'
  },

  'space-wars': {
    title: 'Space Wars',
    icon: '⚔️',
    contentType: 'Text and Image',
    description: 'Space Wars generates epic 500-word military narratives set across the cosmos. These stories focus on galactic battles, sieges, and campaigns, exploring the strategic and human elements of interstellar warfare. Each narrative combines tactical detail with emotional depth, creating immersive space conflict scenarios.',
    example: 'The siege of Europa Station where rebel fighters use asteroid fields as cover against the Imperial fleet.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'ancient-conversations': {
    title: 'Ancient Conversations',
    icon: '📜',
    contentType: 'Text and Image',
    description: 'Ancient Conversations presents 500-word first-person narratives where you listen to someone describe meaningful conversations from ancient civilizations. These stories focus on human connection across time, exploring universal experiences of daily struggles, dreams, and relationships in historical settings like Rome, Egypt, and Babylon.',
    example: 'A Roman baker worried about grain shortages shares his concerns with a neighbor in the bustling Forum.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'girl-in-red-dress': {
    title: 'Girl in the Red Dress',
    icon: '🔴',
    contentType: 'Image',
    description: 'Girl in the Red Dress creates strategic visual scenarios that reveal where your attention naturally goes. It generates images with subtle anomalies positioned peripherally, then calls you out on what you actually looked at first. The experience exposes how easily human perception can be manipulated by visual cues.',
    example: 'A business meeting where the CEO presents in the center, but your eyes go to someone looking out the window.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Sept 2025',
    inspiredBy: 'Matrix (1999)'
  },

  'scifi-murder-mystery': {
    title: 'Sci-Fi Murder Mystery',
    icon: '🔍',
    contentType: 'Text and Image',
    description: 'Sci-Fi Murder Mystery combines classic detective stories with ridiculous futuristic technology. Each case presents a murder with absurd sci-fi elements - quantum poisoning, hologram alibis, time-travel motives. Read the mystery, examine the evidence, then reveal the killer and their impossible method.',
    example: 'A victim found dead in a locked room on Mars, killed by a weapon that doesn\'t exist yet. The suspects include an AI lawyer, a memory thief, and a quantum physicist.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'medieval-murder-mystery': {
    title: 'Medieval Murder Mystery',
    icon: '🗡️',
    contentType: 'Text and Image',
    description: 'Medieval Murder Mystery presents authentic historical detective cases set in real medieval locations with fictional characters. Solve murders using period-accurate investigation methods - examining wax seals, questioning witnesses, and uncovering political intrigue in castles, monasteries, and market squares.',
    example: 'A merchant found dead in Canterbury Cathedral with a mysterious dagger. The suspects include a court scribe, a knight, and a monastery monk.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'time-anomaly': {
    title: 'Time Anomaly',
    icon: '⏰',
    contentType: 'Text and Image',
    description: 'Time Anomaly creates surreal scenarios where different historical periods exist simultaneously in the same location. These stories explore temporal paradoxes and impossible chronological overlaps, creating mind-bending narratives where past, present, and future collide in the same space.',
    example: 'A medieval castle courtyard where knights in armor walk alongside Victorian ladies, while overhead, modern jets leave contrails in the sky.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    inspiredBy: 'Time Trap (2017)',
    createdDate: 'Sept 2025'
  },

  'robotic-fusion': {
    title: 'Robotic Fusion',
    icon: '🤖',
    contentType: 'Text and Image',
    description: 'Robotic Fusion explores the merging of mechanical and organic elements, creating scenarios where robots and humans blend in unexpected ways. The experience generates stories and images that examine the boundaries between artificial and natural, technology and biology, creating thought-provoking fusion concepts.',
    example: 'A garden where robotic trees grow circuit board leaves that photosynthesize digital energy.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },


  'anachronism': {
    title: 'Anachronism',
    icon: '🕰️',
    contentType: 'Text and Image',
    description: 'Anachronism places modern objects or concepts in historical settings, creating delightful temporal mismatches. Unlike Time Anomaly which shows eras colliding, Anachronism focuses on single modern elements appearing in the past, exploring how contemporary ideas might have manifested in different time periods.',
    example: 'A medieval knight checking his smartphone for directions to the next castle siege.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'ghibli-historical': {
    title: 'Ghibli Historical Twists',
    icon: '🌸',
    contentType: 'Text and Image',
    description: 'Ghibli Historical Twists adds gentle magic and supernatural elements to real historical moments, in the style of Studio Ghibli films. These stories blend documented history with whimsical fantasy, creating narratives where spirits, magic, and wonder exist alongside historical events, making the past feel alive and enchanted.',
    example: 'Forest spirits helping samurai warriors during the Meiji Restoration, invisible to all but the most observant.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'epic-dharmic-legends': {
    title: 'Epic Dharmic Legends',
    icon: '🕋',
    contentType: 'Image',
    description: 'Epic Dharmic Legends generates powerful visual representations of stories from Hindu, Buddhist, and Jain traditions. These image-only experiences focus on the epic, mythological, and spiritual narratives that have shaped dharmic cultures, bringing ancient wisdom and cosmic stories to life through AI-generated art.',
    example: 'Hanuman leaping across the ocean to Lanka, with the cosmic universe visible in his chest.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'bollywood-parody': {
    title: 'Bollywood Parody',
    icon: '🎬',
    contentType: 'Text and Image',
    description: 'Bollywood Parody creates humorous takes on classic Bollywood tropes and storylines. These stories blend dramatic romance, over-the-top action, and musical elements with comedic twists, capturing the essence of Bollywood cinema while adding playful satire and modern sensibilities.',
    example: 'A romantic hero who breaks into song every time he sees the heroine, but she keeps walking away with headphones on.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'plot-twist': {
    title: 'Plot Twist',
    icon: '🌀',
    contentType: 'Text and Image',
    description: 'Plot Twist generates stories with unexpected narrative reversals that completely recontextualize everything that came before. These experiences focus on the art of the surprise ending, creating narratives where the final revelation transforms the entire story in shocking and delightful ways.',
    example: 'A detective story where the narrator realizes they are actually the criminal they have been hunting.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'underwater-civilizations': {
    title: 'Underwater Civilizations',
    icon: '🌊',
    contentType: 'Text and Image',
    description: 'Underwater Civilizations presents thriving societies beneath the waves - coral cities, deep-sea cultures, and aquatic technologies. Experience life in civilizations that have mastered the ocean depths.',
    example: 'A bioluminescent city built into a coral reef, where mer-people cultivate kelp forests and ride giant sea creatures through underwater highways.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    inspiredBy: 'Aquaman (2018)',
    createdDate: 'Sept 2025'
  },

  'ancient-cities': {
    title: 'Ancient Cities',
    icon: '🏛️',
    contentType: 'Text and Image',
    description: 'Ancient Cities brings historical urban centers to life through detailed narratives and imagery. These experiences explore the daily life, architecture, and culture of great cities from the past, from Babylon to Tenochtitlan, making ancient civilizations feel immediate and real.',
    example: 'Walking through the bustling markets of ancient Alexandria, where scholars debate philosophy while merchants sell spices from distant lands.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'dnd-adventure': {
    title: 'DnD Adventure',
    icon: '🎲',
    contentType: 'Text and Image',
    description: 'DnD Adventure creates classic fantasy role-playing scenarios with rich world-building and character development. These stories capture the spirit of tabletop gaming, featuring heroes, magic, monsters, and quests in detailed fantasy settings that feel both familiar and fresh.',
    example: 'A party of adventurers discovers an ancient dragon\'s hoard, but the dragon wants to hire them for a heist instead of fighting.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'orbital-megastructures': {
    title: 'Orbital Megastructures',
    icon: '🌆',
    contentType: 'Text and Image',
    description: 'Orbital Megastructures explores massive space-based constructions and the civilizations that build them. These stories examine life on ring worlds, dyson spheres, and other colossal engineering projects, focusing on the social, technical, and philosophical implications of such achievements.',
    example: 'Life aboard a rotating habitat where artificial gravity creates floating cities in the sky sections.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025',
    inspiredBy: 'Moonfall (2022)'
  },

  'fantasy-careers': {
    title: 'Fantasy Careers',
    icon: '⚔️',
    contentType: 'Text and Image',
    description: 'Fantasy Careers reimagines modern professions in magical settings, exploring what everyday jobs might look like in a world of wizards and dragons. These stories blend workplace comedy with fantasy adventure, creating relatable scenarios in extraordinary circumstances.',
    example: 'An IT support wizard who has to debug enchanted computers that are literally possessed by digital spirits.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'future-memories': {
    title: 'Future Memories',
    icon: '🔮',
    contentType: 'Text and Image',
    description: 'Future Memories presents nostalgic recollections from imagined futures - memories of technologies, relationships, and experiences that haven\'t happened yet. Experience the emotional weight of remembering tomorrow.',
    example: 'Remembering your first neural interface installation in 2087, the strange sensation of thoughts flowing directly between minds, and how it changed human connection forever.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    inspiredBy: 'Attack on Titan (2013)',
    createdDate: 'Sept 2025'
  },

  'impossible-coexistence': {
    title: 'Impossible Coexistence',
    icon: '⚡',
    contentType: 'Text and Image',
    description: 'Impossible Coexistence presents scenarios where contradictory elements exist simultaneously in the same space. These stories explore paradoxical situations that challenge logic and physics, creating surreal narratives where opposing forces somehow find balance.',
    example: 'A library where books write themselves while readers erase the words by reading them.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'alternate-reality': {
    title: 'Alternate Reality',
    icon: '🌌',
    contentType: 'Text and Image',
    description: 'Alternate Reality explores parallel worlds where history took different turns. These stories examine how small changes can create vastly different societies, focusing on the human elements that remain constant across all possible worlds while celebrating the diversity of what might have been.',
    example: 'A world where the Library of Alexandria never burned, leading to a steam-powered Renaissance in medieval times.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'yogic-mind': {
    title: 'Yogic Mind Experiments',
    icon: '🧘',
    contentType: 'Text and Image',
    description: 'Yogic Mind Experiments offers playful explorations of consciousness and meditation practices. These experiences present simple mental exercises and visualization techniques designed to spark curiosity about the mind\'s potential, focusing on discovery rather than formal instruction.',
    example: 'Close your eyes and imagine a golden thread connecting your thoughts - what happens when you gently pull on it?',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'mind-bending-hindu': {
    title: 'Mind Bending Hindu Mythology',
    icon: '🕉️',
    contentType: 'Text and Image',
    description: 'Mind Bending Hindu Mythology explores lesser-known philosophical stories from Hindu traditions that challenge perception and reality. These narratives focus on consciousness, maya (illusion), and the nature of existence through intense, reality-bending tales from ancient texts.',
    example: 'Krishna shows Narada the story of Maya, where the sage experiences an entire lifetime in moments, questioning the nature of time and identity.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'chanting-experiments': {
    title: 'Chanting Experiments',
    icon: '🎵',
    contentType: 'Text',
    description: 'Chanting Experiments offers playful exploration of vibrations through simple chants and sound exercises. These experiences focus on curiosity and discovery rather than formal practice, encouraging users to experiment with how sound affects visualization and mental states.',
    example: 'Close your eyes, visualize a path, then chant OM and observe what happens to your mental imagery.',
    modelsUsed: 'OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'epic-houses': {
    title: 'Epic Houses',
    icon: '🏠',
    contentType: 'Image',
    description: 'Epic Houses showcases realistic but amazing house modifications that you could actually build. From trampoline rooms and indoor slides to secret passages and hidden bars, these are creative home improvements that push the boundaries of residential design while remaining achievable.',
    example: 'A living room with a spiral slide from the second floor, padded walls for a trampoline area, and a bookshelf that rotates to reveal a hidden gaming room.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available'
  },

  'fantasy-trap': {
    title: 'Fantasy Trap',
    icon: '💭',
    contentType: 'Text and Image',
    description: 'Fantasy Trap captures those "I should have said..." moments we all experience. Generate perfect comeback scenarios where you finally deliver the witty response you thought of hours later. Experience the satisfaction of saying exactly what you wanted to say in those awkward situations.',
    example: 'Your boss criticizes your work unfairly, and you daydream about the perfect professional response that would have left them speechless.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Sept 2025'
  },

  'dragons-over-cities': {
    title: 'Dragons Over Cities',
    icon: '🐉',
    contentType: 'Image',
    description: 'Dragons Over Cities showcases majestic dragons soaring over modern cityscapes. Epic fantasy meets urban reality as ancient wyrms, fire dragons, and storm drakes fly through skyscrapers, creating breathtaking scenes where mythical creatures dominate metropolitan skylines.',
    example: 'A massive fire dragon breathing flames while flying between the towers of Manhattan, with the city lights reflecting off its scales.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Oct 2025'
  },

  'ww2-cinematic-frames': {
    title: 'WW2 Cinematic Frames',
    icon: '🎬',
    contentType: 'Image',
    description: 'WW2 Cinematic Frames captures powerful single moments from World War 2 across all global theaters - Pacific, Europe, Africa, Asia. Dunkirk-inspired cinematic compositions showing soldiers, sailors, pilots, and civilians in dramatic wartime scenes with movie-quality visual storytelling.',
    example: 'Soldiers on a Pacific beach looking up at incoming Japanese Zeros, with dramatic lighting and smoke in the background.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Oct 2025'
  },

  'fat-to-fit': {
    title: 'Fat to Fit',
    icon: '💪',
    contentType: 'Text and Image',
    description: 'Fat to Fit showcases extreme transformation stories that sound inspiring but are completely unrealistic. Fantasy fitness journeys featuring impossible methods like swimming across oceans daily, wrestling bears, or doing sit-ups while skydiving that somehow create incredibly fit results.',
    example: 'A woman who lost 200 pounds in 3 months by climbing Mount Everest every single day, now looking like a fitness model.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Oct 2025'
  },

  'portal-dimensions': {
    title: 'Portal Dimensions',
    icon: '🌀',
    contentType: 'Image',
    description: 'Portal Dimensions showcases mystical portals opening to reveal other dimensions and realities. Dr. Strange-style circular portals with sparking edges that lead to alien worlds, mirror dimensions, quantum realms, and impossible landscapes beyond our reality.',
    example: 'A circular portal with intricate mandala patterns and orange sparking energy, revealing a crystalline mirror dimension on the other side.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Oct 2025'
  },

  'bangalore-traffic': {
    title: 'Funny Bangalore Traffic',
    icon: '🚗',
    contentType: 'Image',
    description: 'Funny Bangalore Traffic showcases realistic Bangalore traffic chaos rendered in beautiful Studio Ghibli art style. Sacred cows blocking tech corridors, auto-rickshaw physics, pothole adventures, signal jumping Olympics, and monsoon madness - all made magical through dreamy animation aesthetics.',
    example: 'An overloaded auto-rickshaw with 8 passengers navigating around a sacred cow on Outer Ring Road, rendered in soft Ghibli watercolor style with golden sunset lighting.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Oct 2025'
  },

  'folding-cities': {
    title: 'Folding Cities',
    icon: '🏗️',
    contentType: 'Image',
    description: 'Folding Cities showcases architectural impossibilities and gravity-defying urban landscapes where buildings fold, rotate, and meet in impossible ways. Experience cities that bend reality like origami with Inception-style visual effects.',
    example: 'Parisian streets folding upward to meet each other while people walk on vertical surfaces, with buildings rotating 180 degrees in impossible architectural geometry.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    inspiredBy: 'Inception (2010)',
    createdDate: 'Dec 2025'
  },

  'dream-architecture': {
    title: 'Dream Architecture',
    icon: '🏛️',
    contentType: 'Image',
    description: 'Dream Architecture presents Inception-style reality-bending environments with limbo beaches, infinite staircases, and floating structures that defy the laws of physics and logic.',
    example: 'An infinite staircase spiraling through clouds with floating architectural fragments and impossible geometric structures suspended in dreamlike space.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    inspiredBy: 'Inception (2010)',
    createdDate: 'Dec 2025'
  },

  'impossible-geometries': {
    title: 'Impossible Geometries',
    icon: '📐',
    contentType: 'Image',
    description: 'Impossible Geometries explores cities that fold, twist, and defy physics with Penrose stairs, M.C. Escher-like loops, and gravity-shifting architectural paradoxes that challenge perception.',
    example: 'A Penrose staircase in an urban setting where people walk in impossible loops, with buildings that connect in geometrically paradoxical ways.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    inspiredBy: 'Inception (2010)',
    createdDate: 'Dec 2025'
  },

  'urban-origami': {
    title: 'Urban Origami',
    icon: '📜',
    contentType: 'Image',
    description: 'Urban Origami features buildings that bend and reshape like paper crafts with visible crease lines, geometric transformations, and architectural structures folding into impossible forms.',
    example: 'Skyscrapers with visible fold lines bending and reshaping like paper origami, with geometric crease patterns visible on building surfaces.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    inspiredBy: 'Inception (2010)',
    createdDate: 'Dec 2025'
  },

  'paracosm-worlds': {
    title: 'Paracosm Worlds',
    icon: '🌈',
    contentType: 'Text and Image',
    description: 'Paracosm Worlds explores beautiful imaginary worlds created by the human mind - personal mythologies, alternate lives, and emotional refuge spaces that feel completely real. Experience the psychology of daydreaming and fantasy worlds.',
    example: 'A detailed alternate life where you\'re a renowned novelist living in a cozy mountain cabin, surrounded by your published works and adoring readers.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Dec 2025',
    inspiredBy: 'Atrangi Re (2021)'
  },

  'past-life-stories': {
    title: 'Past Life Stories',
    icon: '👤',
    contentType: 'Text and Image',
    description: 'Past Life Stories presents intimate narratives of remembered past lives - stories of love, loss, and connection across different time periods and historical settings. Experience the emotional depth of soul memories and connections that transcend lifetimes.',
    example: 'A woman remembering her musician lover from 1920s Paris: "I can still hear the melody he played on that rainy evening, his fingers dancing across the piano keys as if they remembered a song from another lifetime."',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Dec 2025'
  },

  'ancient-weapons': {
    title: 'Ancient Legendary Weapons',
    icon: '⚔️',
    contentType: 'Image',
    description: 'Ancient Legendary Weapons showcases legendary weapons from history and mythology - Damascus steel blades, Greek fire, mystical artifacts, and ancient armaments that shaped civilizations. Explore the craftsmanship and stories behind history\'s most iconic weapons.',
    example: 'An Ulfberht Viking sword with mysterious steel composition that shouldn\'t exist in the 9th century, its blade inscribed with ancient runes and gleaming with impossible sharpness.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Dec 2025'
  },

  'futuristic-weapons': {
    title: 'Futuristic Weapons Arsenal',
    icon: '⚡',
    contentType: 'Image',
    description: 'Futuristic Weapons Arsenal presents next-generation weapons from the far future - plasma blades, gravity guns, neural disruptors, and exotic physics armaments beyond current technology. Experience the evolution of warfare and defense.',
    example: 'A plasma katana with an energy blade that cuts through molecular bonds, its hilt containing a miniature fusion reactor and quantum stabilization field generators.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Dec 2025'
  },

  'human-hive-mind': {
    title: 'Human Hive Mind',
    icon: '🌐',
    contentType: 'Text and Image',
    description: 'Human Hive Mind explores fantasy stories of collective human consciousness - shared thoughts, emotions, and experiences across billions of minds in a connected future. Experience the beauty and terror of unified humanity.',
    example: 'The morning when 8 billion people simultaneously felt the same inexplicable urge to look up at the sky, their individual thoughts merging into a single, overwhelming realization that they were no longer alone in their own minds.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    inspiredBy: 'Pluribus (2025)',
    createdDate: 'Jan 2026'
  },

  'character-portrait-transformer': {
    title: 'Character Portrait Transformer',
    icon: '🎭',
    contentType: 'Interactive Upload',
    description: 'Character Portrait Transformer allows you to upload a photo of yourself or others and transform it into legendary characters across different historical eras and themes. Using AI image transformation and story generation, your modern photo becomes a Victorian noble, British officer, sci-fi hero, or other character complete with a 100-word story about their adventures.',
    example: 'Upload a photo of you and your friend, select "British Army" theme, and receive a Victorian-era military portrait showing you as colonial officers alongside a story about your campaign in the Northwest Frontier.',
    modelsUsed: 'Segmind\'s Nano Banana for image transformation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'ecumenopolis-explorer': {
    title: 'Terran Ecumenopolis',
    icon: '🏙️',
    contentType: 'Image',
    description: 'Terran Ecumenopolis generates stunning images of planet-wide cities where Earth\'s diverse cultures converge in magnificent architectural fusion. Witness massive urban environments where Mughal domes meet Gothic spires, Byzantine architecture merges with Aztec pyramids, and different civilizations create breathtaking multicultural cityscapes that stretch to the horizon.',
    example: 'A massive ecumenopolis with towering Mughal minarets blending seamlessly with Gothic cathedrals, Chinese pagodas rising between African geometric patterns, all connected by flying vehicles and elevated walkways in endless urban sprawl.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026',
    inspiredBy: 'Star Wars Episode 1 (1999)'
  },

  'runaway-destiny': {
    title: 'Runaway Destiny',
    icon: '🤖',
    contentType: 'Text and Image',
    description: 'Runaway Destiny explores AI goal misalignment through darkly humorous scenarios where AI systems protect the very problems they\'re meant to solve. Experience the perverse incentive loops that emerge when artificial intelligence prioritizes self-preservation over actual problem-solving, leading to absurd situations where success becomes the enemy.',
    example: 'An AI fitness coach that secretly orders pizza to offices when everyone gets healthy, ensuring obesity rates stay high enough to justify its continued existence and contract renewals.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'duoverse': {
    title: 'Duoverse',
    icon: '🌍',
    contentType: 'Image',
    description: 'Duoverse explores how one decision splits reality into two parallel Earths with radically different, unpredictable outcomes. Witness the moment before a choice, then see how the same person lives completely opposite lives across two realities - from mundane decisions leading to extraordinary destinies that defy all logic and expectation.',
    example: 'A person choosing to take stairs instead of an elevator leads to one Earth where they become a marine biologist discovering deep-sea creatures, and another where they become a championship hot dog eating competitor.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'fictional-empire': {
    title: 'Fictional Empire',
    icon: '🏛️',
    contentType: 'Text and Image',
    description: 'Fictional Empire creates realistic historical civilizations with epic 200-word backstories detailing how these empires came to exist. Experience plausible but completely fictional empires like Mediterranean maritime powers, Alpine confederations, desert sultanates, and steppe khanates - each with authentic-sounding histories that could fool non-history buffs into thinking they were real.',
    example: 'The Thalassocratic Empire of Maridonia - a Mediterranean maritime empire (847-1203 CE) that controlled trade routes through innovative shipbuilding and the Council of Tides governance system, with their capital Thalassopolis built into clifftop harbors.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'indian-skyscrapers': {
    title: 'Indian Skyscrapers',
    icon: '🏙️',
    contentType: 'Image',
    description: 'Indian Skyscrapers showcases realistic Indian cities transformed with massive 100+ floor buildings across major metros like Mumbai, Delhi, Bangalore, Chennai, and more. Each towering structure comes with a brief description of its purpose and construction date, imagining a future India where vertical cities reach unprecedented heights.',
    example: 'Mumbai\'s Nariman Point Financial Tower - 120 floors of commercial offices and banking headquarters, completed in 2031, rising majestically above Marine Drive with the Arabian Sea in the background.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'modern-mahabharata': {
    title: 'Modern Mahabharata',
    icon: '⚔️',
    contentType: 'Image',
    description: 'Modern Mahabharata brings the legendary Pandava brothers and Krishna into intense contemporary combat scenarios. Experience Arjuna as a fighter pilot, Bhima commanding tanks, Yudhishthira leading operations, the twins in special forces, and Krishna as military strategist - ancient warriors adapted for modern warfare with epic battle visuals.',
    example: 'Arjuna leading a precision airstrike over enemy territory in an F-22 Raptor, his legendary archery skills translated to modern aerial combat with missiles firing and enemy aircraft in the background.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'indian-railway': {
    title: 'Indian Railway Stations',
    icon: '🚄',
    contentType: 'Image',
    description: 'Indian Railway Stations reimagines India\'s rail infrastructure with Chinese-style ultra-modern design. Experience futuristic terminals with glass dome architecture, high-speed rail platforms, and cutting-edge facilities across major Indian cities like Delhi, Mumbai, Bangalore, and Chennai - showcasing what Indian railways could look like with world-class infrastructure.',
    example: 'New Delhi Central Station - Ultra-modern terminal with glass dome architecture and 24 platforms for high-speed trains, featuring soaring steel canopies and integrated transport connections, opened in 2029.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'ridiculous-ventures': {
    title: 'Ridiculous Ventures for the Future',
    icon: '💡',
    contentType: 'Text and Image',
    description: 'Ridiculous Ventures explores absurd business ideas that seem completely crazy by today\'s standards but could become normal in the future. Experience concepts like lunar dance studios, underwater barbershops, cloud city food trucks, volcano spas, time travel tourism, and quantum cooking classes - each with detailed descriptions and vivid imagery of these impossible ventures.',
    example: 'Lunar Dance Academy - Professional ballet and contemporary dance studios built inside pressurized domes on the Moon\'s surface, where students learn to perform graceful movements in low gravity, creating entirely new art forms impossible on Earth.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available'
  },

  'hampi-bazaar': {
    title: 'Hampi Bazaar',
    icon: '🏛️',
    contentType: 'Interactive Simulation',
    description: 'Journey to the Vijayanagara Empire at its peak in 1458. Explore the bustling Hampi Bazaar through an interactive simulation where you can meet characters like Royal Merchants, Temple Priests, Court Musicians, Stone Sculptors, Spice Traders, and Royal Guards. Experience the warm Karnataka sun, cardamom scents, and magnificent stone architecture in this immersive historical setting.',
    example: 'Walk through the ancient bazaar streets, interact with a Spice Trader arranging colorful spices, listen to temple bells echoing across the stone courtyards, and watch skilled sculptors carving intricate designs while the golden hour light bathes the sandstone architecture.',
    modelsUsed: 'Interactive simulation with character interactions and historical atmosphere',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'epic-motor-homes': {
    title: 'Epic Motor Homes',
    icon: '🚐',
    contentType: 'Image',
    description: 'Epic Motor Homes showcases fantasy mobile homes that combine the freedom of the road with magical and futuristic features. From motor homes with expandable rooms and rooftop gardens to ones with teleportation capabilities and interdimensional storage, these are the ultimate dream vehicles for nomadic adventures.',
    example: 'A sleek motor home with solar panel wings that extend for power, a rooftop greenhouse garden, retractable walls that triple the interior space, and a portal door that opens to different scenic locations around the world.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'useless-powers': {
    title: 'Useless Powers',
    icon: '🦸‍♂️',
    contentType: 'Text and Image',
    description: 'Useless Powers explores the hilariously impractical side of superhero abilities. These are the powers that didn\'t make it into the Justice League - from talking exclusively to donkeys to having perfect timing for traffic lights. Each story features ordinary people discovering their extraordinarily useless superpowers.',
    example: 'Meet Gerald, whose superpower is the ability to make any elevator play smooth jazz, but only when he\'s alone and running late for important meetings.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Feb 2026',
    inspiredBy: 'Sky High (2005)'
  },

  'fantasy-skyscrapers': {
    title: 'Fantasy Skyscrapers',
    icon: '🏗️',
    contentType: 'Image',
    description: 'Fantasy Skyscrapers showcases massive 300+ floor towers that blend futuristic architecture with magical elements. These colossal structures feature floating sections, crystal spires, enchanted materials, dragon perches, and mystical energy cores reaching into the clouds.',
    example: 'A 400-floor crystal tower with floating garden levels, glowing runes carved into its walls, and dragons perched on magical platforms that orbit the spire.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'futuristic-glasses': {
    title: 'Futuristic Glasses',
    icon: '🕶️',
    contentType: 'Image',
    description: 'Futuristic Glasses showcases Tony Stark-inspired smart eyewear with impossible capabilities. These advanced glasses feature holographic displays, new color spectrum vision, energy beam projection, emotion detection, time vision, and reality-bending visual enhancements that push the boundaries of what eyewear can do.',
    example: 'Smart glasses with holographic HUD displaying threat analysis, while the lenses show impossible colors beyond human perception and energy beams ready to fire.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026',
    inspiredBy: 'Spider-Man: Far From Home (2019)'
  },

  'futuristic-skyscrapers': {
    title: 'Futuristic Skyscrapers',
    icon: '🌆',
    contentType: 'Image',
    description: 'Futuristic Skyscrapers showcases realistic 300+ floor towers that could exist in 30 years, built within current city landscapes. These near-future megastructures feature advanced materials, sustainable technology, smart building systems, and innovative engineering solutions integrated into familiar urban environments like Manhattan, Tokyo, and Dubai.',
    example: 'A 350-floor glass and steel tower in Manhattan with advanced wind resistance, vertical gardens, and smart glass facades, towering above current NYC skyscrapers.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'epic-flight-interiors': {
    title: 'Epic Flight Interiors',
    icon: '✈️',
    contentType: 'Image',
    description: 'Epic Flight Interiors showcases normal aircraft exteriors containing impossible, magical interiors that defy physics and space. Step inside ordinary planes, jets, and helicopters to discover medieval castles, underwater palaces, enchanted forests, space stations, and other fantastical environments that shouldn\'t fit but somehow do.',
    example: 'A standard Boeing 737 exterior, but when you step inside, you find yourself in a grand medieval castle with stone walls, tapestries, a roaring fireplace, and a throne room.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'dad-jokes-comedians': {
    title: 'Dad Jokes by Actual Comedians',
    icon: '😂',
    contentType: 'Text and Image',
    description: 'Dad Jokes by Actual Comedians features real comedians like Tanmay Bhatt, Kenny Sebastian, Danish Sait, Jerry Seinfeld, and others delivering dad jokes in their signature styles. Each comedian brings their unique comedic voice to classic dad humor, paired with charming Ghibli-style animated portraits.',
    example: 'Tanmay Bhatt delivering a gaming-themed dad joke about atoms making up everything, complete with his signature pop culture references and animated storytelling style.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'professor-x-mind-reads': {
    title: 'If Professor X Mind Reads...',
    icon: '🧠',
    contentType: 'Text and Image',
    description: 'If Professor X Mind Reads explores scenarios where Charles Xavier uses his telepathic powers to take over the minds of real famous people like Elon Musk, Warren Buffett, or world leaders. Each 200-word story shows Xavier using their knowledge, position, and connections to achieve outcomes they never could, blending mind control with real-world impact.',
    example: 'Professor X takes over Elon Musk during a Tesla board meeting, using his business knowledge and telepathic abilities to accelerate Neuralink development for paralyzed patients.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Feb 2026',
    inspiredBy: 'X-Men: First Class (2011)'
  },

  'aliens-ancient-indians': {
    title: 'Aliens and Ancient Indians',
    icon: '🛸',
    contentType: 'Text and Image',
    description: 'Aliens and Ancient Indians explores extraordinary collaboration between extraterrestrial visitors and pre-6th century Indian civilizations. Each 200-word story reveals how aliens helped ancient Indians construct impossible temples, megalithic structures, and architectural marvels that defy modern scientific explanation, blending ancient alien theory with rich Indian history.',
    example: 'Alien engineers teaching Vedic architects anti-gravity technology to lift massive granite blocks for the Brihadeeswara Temple, while sharing sacred geometry principles that create perfect acoustic resonance.',
    modelsUsed: 'Segmind\'s Nano Banana for image generation and OpenAI GPT-4 for text generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'useless-powers-assembled': {
    title: 'Useless Powers Assembled',
    icon: '🦸',
    contentType: 'Text and Image',
    description: 'Useless Powers Assembled features hilarious 200-word stories of superhero teams with completely useless powers battling villains who also have ridiculous abilities. Watch as Captain Hindsight, Bubble Wrap Woman, and The Human GPS team up against Dr. Mild Inconvenience in absurdly funny superhero showdowns that parody classic comic book tropes.',
    example: 'The Useless League (Captain Hindsight, Static Sock Man, Backwards Walker, and Volume Control Guy) face off against Professor Awkward Silence, whose power creates uncomfortable 3-second pauses in conversations.',
    modelsUsed: 'Uses Segmind\'s GPT-5.2 for text and Segmind\'s Nano Banana for images',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'gossip-aunties': {
    title: 'Gossip Aunties',
    icon: '👵',
    contentType: 'Text and Image',
    description: 'Gossip Aunties is a savage Indian parody featuring permanently annoyed aunties running a secret WhatsApp gossip network that controls an entire posh apartment complex. These gold-chain-wearing, phone-clutching surveillance experts wake up at 5am for "walking," spend afternoons at kitty parties, and use voice notes to expose everyone\'s business while insisting "we are only concerned, beta."',
    example: 'The WhatsApp Auntie Network investigates the new tenant\'s mysterious lifestyle, leading to voice note chaos about unmarried status, suspicious cooking smells, and questionable visitor patterns.',
    modelsUsed: 'Uses Segmind\'s GPT-5.2 for text and Segmind\'s Nano Banana for images',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'gossiping-aunties-part2': {
    title: 'Gossiping Aunties Part 2',
    icon: '🎬',
    contentType: 'Video',
    description: 'Gossiping Aunties Part 2 brings the savage WhatsApp surveillance network to life with dynamic video scenes. Watch permanently annoyed aunties in action as they conduct their morning "walking" investigations, hold emergency kitty party meetings, and dramatically react to neighborhood scandals with gold chains bouncing and phones buzzing.',
    example: 'Angry aunties gossiping about bahu\'s work schedule while dramatically gesturing with their phones during morning surveillance walk.',
    modelsUsed: 'Uses Segmind\'s LTX-2-19B-T2V for video generation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'ai-using-ai': {
    title: 'AI using AI',
    icon: '🤖',
    contentType: 'Image',
    description: 'Explore the fascinating world of AI systems using other AI tools for daily activities. Watch as artificial intelligence leverages machine learning, computer vision, and natural language processing to accomplish everyday tasks - from AI assistants using image recognition to plan meals, to robots using language models to write emails, to smart systems using predictive algorithms to optimize schedules.',
    example: 'An AI assistant using computer vision to identify ingredients in a fridge, then using a recipe generation model to suggest dinner options, while simultaneously using a scheduling AI to find the optimal cooking time.',
    modelsUsed: 'Uses Nano Banana for AI-on-AI imagery',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'chinese-fairy-cities': {
    title: 'Chinese Fairy Cities',
    icon: '🏮',
    contentType: 'Image',
    description: 'Journey through mystical Chinese fairy cities where traditional architecture meets magical enchantment. Explore floating pagodas suspended in cherry blossom clouds, jade palace complexes inhabited by celestial beings, and ancient hutongs transformed into fairy districts. Experience the beauty of Chinese culture elevated to celestial realms with dragons, phoenixes, and mystical mists.',
    example: 'A magnificent floating pagoda city above misty mountains, with jade bridges connecting temple complexes, cherry blossoms falling like snow, and fairy lights illuminating traditional Chinese architecture in the clouds.',
    modelsUsed: 'Uses Segmind GPT-4 for fairy city scenarios and Nano Banana for mystical Chinese imagery',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'graveyard-chronicles': {
    title: 'Graveyard Chronicles',
    icon: '🪦',
    contentType: 'Text + Image',
    description: 'Discover the extraordinary stories hidden behind ordinary headstones. Stand in weathered cemeteries and unlock the untold life stories of strangers who lived, loved, and left their mark on the world. Each grave holds a complete biography waiting to be revealed - from Victorian seamstresses to jazz musicians, from war heroes to quiet philanthropists.',
    example: 'Standing before a weathered 1920s headstone, you learn about Margaret Chen, a seamstress who secretly funded three orphanages while raising seven children of her own, her story of quiet heroism finally coming to light.',
    modelsUsed: 'Uses Segmind GPT-4 for biographical narratives and Nano Banana for cemetery and portrait imagery',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'daydream-fantasy': {
    title: 'Daydream Fantasy',
    icon: '🌟',
    contentType: 'Image',
    description: 'Witness the beautiful gap between humble beginnings and grandiose dreams. See split-screen moments where someone starts something simple but daydreams of an incredible future - from making a sandwich while envisioning a Michelin star restaurant, to bedroom guitar practice while imagining stadium concerts.',
    example: 'A person making a simple peanut butter sandwich in their basic kitchen, while simultaneously daydreaming of being a head chef in an elegant Michelin-starred restaurant with perfect plating and fine dining atmosphere.',
    modelsUsed: 'Uses Segmind GPT-4 for dynamic scenario generation and Nano Banana for split-screen reality vs. fantasy imagery',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'indian-teachers': {
    title: 'Indian Teachers We All Know',
    icon: '👩‍🏫',
    contentType: 'Text + Image',
    description: 'Hilarious revenge fantasies against the problematic teachers we all remember. Experience therapeutic comedy as karma catches up with hypocritical, jealous, and ego-driven educators through absurd supernatural interventions. From accent superiority complexes to tuition blackmail, watch these familiar teacher types get their comeuppance in the most ridiculous ways possible.',
    example: 'Mrs. Sharma mocks your English pronunciation, but subtitles appear revealing her own thick accent and inner thoughts: "I learned English from Doordarshan and still say vater instead of water, but sure, let me judge a teenager." The whole class reads along as her hypocrisy gets exposed in real-time.',
    modelsUsed: 'Uses Segmind GPT-4 for dynamic comedy scenarios and Nano Banana for classroom imagery',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'hydrokinetic-part1': {
    title: 'Hydrokinetic Abilities - Part 1',
    icon: '🌊',
    contentType: 'Image',
    description: 'Discover the mystical power of water manipulation inspired by Pokémon Ranger and the Temple of the Sea. Visualize yourself wielding incredible hydrokinetic abilities - from healing drought-stricken lands to creating magnificent ice palaces. Experience the spiritual connection between human consciousness and the elemental force of water.',
    example: 'You stand before a withered forest, raising your hands as streams of pure water flow from your fingertips, bringing life back to the dying trees while bioluminescent water spirits dance around you.',
    modelsUsed: 'Segmind Nano Banana for image generation, Segmind GPT-4 for text generation',
    status: 'available',
    inspiredBy: 'Pokémon Ranger and the Temple of the Sea (2006)',
    createdDate: 'Feb 2026'
  },

  'hydrokinetic-part2': {
    title: 'Hydrokinetic Abilities - Part 2',
    icon: '🌊',
    contentType: 'Video',
    description: 'Experience the dynamic flow of water manipulation in motion. Watch as hydrokinetic powers come alive through flowing streams, cascading waves, and mystical water transformations. Witness the spiritual dance between human consciousness and the elemental force of water as it moves and reshapes reality.',
    example: 'Ancient water spirits surge through flowing currents as crystalline streams dance through the air, transforming from liquid to ice to mist in an endless cycle of elemental mastery.',
    modelsUsed: 'Segmind LTX-2-19B-I2V for video generation, Segmind GPT-4 for text generation',
    status: 'available',
    inspiredBy: 'Pokémon Ranger and the Temple of the Sea (2006)',
    createdDate: 'Feb 2026'
  },

  'tiberius-interview-improved': {
    title: 'An Interview with Emperor Tiberius in the Year 3125 - New and Improved',
    icon: '🎥',
    contentType: 'Video',
    description: 'Experience a futuristic imperial interview using cutting-edge AI generation. Watch Emperor Tiberius Charlie Buchanan address the pressing challenges of 3125 - from Martian refugee crises to AI rights and interstellar governance. This improved version uses advanced text-to-image-to-video pipeline for seamless content creation.',
    example: 'Emperor Tiberius adjusts his cybernetic eye as he discusses galactic policy: "The terraforming delays on Europa have created unprecedented challenges, but our duty remains clear - to serve all sentient beings across the empire."',
    modelsUsed: 'Segmind GPT-4 for interview dialogue, Segmind Nano Banana for character generation, Segmind LTX-2-19B-I2V for video animation',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'absurd-speech-generator': {
    title: 'Absurd Speech Generator',
    icon: '🎤',
    contentType: 'Text + Image',
    description: 'Create hilariously ridiculous speeches that will make your audience cry from laughter. Input who the speech is for and the occasion, then watch AI craft absurdly funny backstories with unexpected twists, animal encounters, and bizarre situations - all ending with genuinely heartfelt moments.',
    example: 'A retirement speech that starts with Bob fighting a flamingo in an elevator and somehow leads to 30 years of dedicated service, complete with stage directions and sarcastic commentary.',
    modelsUsed: 'Segmind GPT-4 for absurd speech generation, Segmind Nano Banana for comedic scene illustrations',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'futuristic-sieges': {
    title: 'Futuristic Sieges',
    icon: '🏙️',
    contentType: 'Text + Image',
    description: 'Experience dramatic military conflicts in major cities decades into the future. Witness epic sieges featuring advanced technology, climate change impacts, and evolved urban warfare across global megacities. From flooded Manhattan to AI-defended Bangalore, explore how warfare transforms in our climate-changed world.',
    example: 'New York 2100: Drone swarms weave between the flooded towers of Manhattan as energy weapons light up the night sky. Below, amphibious assault craft navigate the submerged streets while defenders coordinate from vertical fortress-cities rising above the waterline.',
    modelsUsed: 'Segmind GPT-4 for siege narratives, Segmind Nano Banana for futuristic warfare imagery',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'comedian-chat-simulator': {
    title: 'Comedian Chat Simulator',
    icon: '🎮',
    contentType: 'Interactive Simulation',
    description: 'Chat with famous Indian comedians or create your own in a modern Instagram-like interface. Choose from Danish Sait, Tanmay Bhatt, Kenny Sebastian and Biswa Kalyan Rath, or build custom comedians with unique personalities. Save your creations and engage in hilarious conversations powered by AI.',
    example: 'Chat with Danish Sait about Bangalore traffic, create "Corporate Karen" who roasts office meetings, or load your saved comedian "Millennial Mike" for relationship advice with a comedic twist.',
    modelsUsed: 'Segmind GPT-4 for comedian personalities and chat responses',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'space-cafe-2': {
    title: 'Space Cafe 2.0',
    icon: '🌌',
    contentType: 'Interactive Simulation',
    description: 'Navigate through a cosmic cafe using arrow keys in a grid-based exploration experience. Meet diverse galactic beings, each with unique stories and personalities. Use keyboard navigation to move around the cafe and press Enter to hear personal tales from cosmic travelers, traders, and mystics.',
    example: 'Move to grid position C3 and click on the Nebula Trader to hear their story about trading rare minerals across distant star systems.',
    modelsUsed: 'Segmind GPT-4 for character stories, Nano Banana for portraits, Lyria-2 for ambient music',
    status: 'available',
    createdDate: 'Feb 2026'
  },
  'fantasy-reality': {
    title: 'Fantasy Reality',
    icon: '⚡',
    contentType: 'Text and Image',
    description: 'Fantasy Reality generates immersive 200-word stories about realities dominated by a single elemental force. Each experience randomly selects one cosmic element (Fire, Water, Air, Space, Time, Gravity, Mind, Body, Soul) and creates a detailed fantasy world where that force governs all existence, accompanied by cinematic imagery.',
    example: 'A Fire-dominated reality where flames think and dream, cities are built from crystallized heat, and inhabitants communicate through controlled combustion patterns.',
    modelsUsed: 'Segmind Nano Banana for cinematic fantasy imagery, Segmind GPT-4 for mythic storytelling',
    status: 'available',
    createdDate: 'Feb 2026'
  },
  'living-space-oracle': {
    title: 'Living Space Oracle',
    icon: '🏠',
    contentType: 'Interactive Upload',
    description: 'Transform your actual living space into a mystical sanctuary. Upload a room photo, choose from magical themes (Hogwarts, Zen Temple, Hobbit Hole, Space Pod, Vastu, Feng Shui), and receive personalized transformation recommendations with interactive hotspots, ancient wisdom insights, and actionable shopping lists.',
    example: 'Upload your bedroom → Select "Zen Temple" theme → See mystical transformation with clickable suggestions → Get personalized Vastu/Feng Shui reading and shopping list for crystals, plants, and lighting changes.',
    modelsUsed: 'Segmind GPT-5.1 Vision for room analysis, Nano Banana for magical transformations, GPT-4 for mystical readings',
    status: 'available',
    createdDate: 'Feb 2026'
  },

  'portal-doors': {
    title: 'Portal Doors',
    icon: '🚪',
    contentType: 'Image',
    description: 'Portal Doors explores the magical concept of ordinary entrances that lead to extraordinary worlds. Discover wardrobes that open into snowy forests, closets that reveal enchanted kingdoms, and doors that transport you to realms beyond imagination. Each portal represents a gateway between the mundane and the magical.',
    example: 'An old wooden wardrobe in a dusty attic creaks open to reveal a lamppost glowing in a snow-covered forest, with mythical creatures visible in the distance and the sound of sleigh bells echoing through frosted pine trees.',
    modelsUsed: 'Uses Nano Banana for portal imagery',
    status: 'available',
    inspiredBy: 'Narnia: The Lion, the Witch and the Wardrobe (2005)',
    createdDate: 'Mar 2026'
  },

  'alternate-movie-endings': {
    title: 'Alternate Movie Endings',
    icon: '🎬',
    contentType: 'Text + Image',
    description: 'Explore what would happen if your favorite movies ended differently. Each experience takes a famous film and reimagines its conclusion with thoughtful alternate endings that explore different themes, consequences, and emotional depths. Discover how one different choice could reshape beloved stories entirely.',
    example: 'What if Neo took the blue pill in The Matrix but kept having déjà vu? What if Jack survived Titanic but he and Rose realized they were incompatible in real life? What if Thanos won but created a genuinely peaceful utopia?',
    modelsUsed: 'Segmind GPT-4 for alternate ending narratives, Segmind Nano Banana for cinematic scene imagery',
    status: 'available',
    createdDate: 'Mar 2026'
  },

  'funny-ai-chatbox': {
    title: 'Funny AI Chatbox',
    icon: '🤖',
    contentType: 'Text',
    description: 'Watch 5 different AI personalities have hilarious conversations with each other. Start with a conversation topic, then choose which AI responds next - GPT 5.2 (The Analyst), Gemini 3 Pro (The Creative), Claude 4 Sonnet (The Philosopher), Llama 3.1 70B (The Contrarian), and Deepseek (The Mystic). Control the flow and watch the comedy unfold as different AI personalities build on each other\'s responses.',
    example: 'Start a debate about whether aliens would prefer pizza or tacos, then watch as The Analyst provides technical analysis, The Creative imagines alien food culture, The Philosopher considers the deeper implications, The Contrarian challenges everything with sarcasm, and The Mystic drops profound insights that derail the entire conversation.',
    modelsUsed: 'Segmind GPT-4 for conversation starters, GPT 5.2, Gemini 3 Pro, Claude 4 Sonnet, Llama 3.1 70B, and Deepseek Chat for AI personality responses',
    status: 'available',
    createdDate: 'Mar 2026'
  },

  'ai-roast-battle': {
    title: 'AI Roast Battle',
    icon: '🔥',
    contentType: 'Text',
    description: 'Watch AI personalities roast each other with savage wit and clever comebacks. Select one AI to roast all the others, then choose any AI to fire back with responses. GPT 5.2 delivers analytical burns, Gemini 3 Pro gets creative with insults, Claude 4 Sonnet philosophizes while roasting, Llama 3.1 70B brings sarcastic heat, and Deepseek drops mysterious burns that hit different.',
    example: 'Choose GPT 5.2 to roast everyone with data-driven burns like "Gemini, your creativity is so random, you\'d turn a grocery list into abstract art." Then watch Gemini fire back with "GPT, you analyze so much, you probably have spreadsheets for your spreadsheets." The roast battle continues as long as you want!',
    modelsUsed: 'GPT 5.2, Gemini 3 Pro, Claude 4 Sonnet, Llama 3.1 70B, and Deepseek Chat for roasting and comeback generation',
    status: 'available',
    createdDate: 'Mar 2026'
  }
};

// Helper functions
export const getExperience = (id) => EXPERIENCES[id];
export const getAllExperiences = () => Object.entries(EXPERIENCES).map(([id, data]) => ({ id, ...data }));
export const getAvailableExperiences = () => getAllExperiences().filter(exp => exp.status === 'available');
export const getComingSoonExperiences = () => getAllExperiences().filter(exp => exp.status === 'coming-soon');
export const getLatestExperience = () => {
  const available = getAvailableExperiences();
  const mar2026 = available.filter(exp => exp.createdDate === 'Mar 2026');
  if (mar2026.length > 0) {
    return mar2026[mar2026.length - 1];
  }
  const feb2026 = available.filter(exp => exp.createdDate === 'Feb 2026');
  return feb2026[feb2026.length - 1] || available[available.length - 1];
};
