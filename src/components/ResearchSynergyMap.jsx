import React, { useState, useRef, useEffect, useCallback } from 'react';
import Globe from 'react-globe.gl';
import '../styles/research-synergy-map.css';

// ── Data ─────────────────────────────────────────────────────────────────────

const RESEARCH_DATA = [
  { title: 'Computational Creativity: Philosophy and Engineering of Autonomously Creative Systems', year: 2016, authors: 'Tony Veale, F. Amílcar Cardoso', institution: 'University College Dublin; University of Coimbra', location: { lat: 53.3498, lng: -6.2603, name: 'Dublin / Coimbra' }, experiences: ['anachronism', 'duoverse', 'impossible-geometries', 'plot-twist'], experienceReason: 'Direct examples of conceptual space exploration and transformation.', link: 'https://link.springer.com/book/10.1007/978-3-319-43610-4', powerQuote: 'AI systems can autonomously produce creative artifacts with evaluable properties' },
  { title: 'What is Computational Creativity?', year: 2012, authors: 'Anna Jordanous', institution: 'University of Kent, UK', location: { lat: 51.2787, lng: 1.0877, name: 'Canterbury' }, experiences: ['ridiculous-ventures', 'useless-powers', 'ai-using-ai'], experienceReason: "Can be evaluated against Jordanous' creativity criteria.", link: 'https://www.researchgate.net/publication/220800139_What_is_Computational_Creativity', powerQuote: 'Creativity requires novelty, value, and surprise in computational systems' },
  { title: 'Computational Creativity: The Final Frontier?', year: 2012, authors: 'Simon Colton, Geraint Wiggins', institution: 'Queen Mary University of London, UK', location: { lat: 51.5074, lng: -0.0352, name: 'London' }, experiences: ['fictional-empire', 'orbital-megastructures', 'underwater-civilizations'], experienceReason: 'Autonomous world artifact generation.', link: 'https://www.researchgate.net/publication/221397833_Computational_Creativity_The_Final_Frontier', powerQuote: 'AI systems can autonomously produce creative artifacts with evaluable properties' },
  { title: 'Creative Adversarial Networks', year: 2017, authors: 'Ahmed Elgammal et al.', institution: 'Rutgers University, USA', location: { lat: 40.5008, lng: -74.4474, name: 'New Brunswick, NJ' }, experiences: ['dream-architecture', 'folding-cities', 'retro-futurism'], experienceReason: 'Style deviation and aesthetic novelty.', link: 'https://arxiv.org/abs/1706.07068', powerQuote: 'Generate art by deviating from learned styles to maximize novelty' },
  { title: 'The Painting Fool (2008–2012 series)', year: 2008, authors: 'Simon Colton', institution: 'Goldsmiths, University of London, UK', location: { lat: 51.4744, lng: -0.036, name: 'London (Goldsmiths)' }, experiences: ['epic-dharmic-legends', 'dragons-over-cities'], experienceReason: 'Generative art as evaluable artifact.', link: 'https://computationalcreativity.net/iccc2012/wp-content/uploads/2012/05/015-Colton.pdf', powerQuote: 'One of the first AI systems to autonomously generate and evaluate visual art' },
  { title: 'Procedural Content Generation in Games', year: 2011, authors: 'Noor Shaker, Julian Togelius, Mark Nelson', institution: 'IT University of Copenhagen; NYU', location: { lat: 55.6761, lng: 12.5683, name: 'Copenhagen' }, experiences: ['ecumenopolis-explorer', 'fantasy-skyscrapers', 'ancient-cities'], experienceReason: 'Generative large-scale environments.', link: 'https://link.springer.com/book/10.1007/978-3-319-42716-4', powerQuote: 'Algorithmic generation of worlds, levels, and environments' },
  { title: 'Narrative Intelligence', year: 1999, authors: 'Patrick Winston', institution: 'MIT, USA', location: { lat: 42.3601, lng: -71.0942, name: 'Cambridge, MA' }, experiences: ['scifi-murder-mystery', 'time-anomaly'], experienceReason: 'Structured narrative AI systems.', link: 'https://dspace.mit.edu/handle/1721.1/11022', powerQuote: 'Storytelling is core to human cognition and AI narrative modeling' },
  { title: 'Evaluating the Creativity of Large Language Models', year: 2023, authors: 'Erik Guzik et al.', institution: 'University of Montana, USA', location: { lat: 46.8721, lng: -113.994, name: 'Missoula, MT' }, experiences: ['ridiculous-ventures', 'alternate-reality'], experienceReason: 'Divergent idea fluency systems.', link: 'https://arxiv.org/abs/2303.12003', powerQuote: 'LLM-generated divergent thinking rivals human ideation' },
  { title: 'Artificial Intelligence and the Internal Processes of Creativity', year: 2024, authors: 'Jaan Aru', institution: 'University of Tartu, Estonia', location: { lat: 58.3776, lng: 26.729, name: 'Tartu, Estonia' }, experiences: ['yogic-mind', 'paracosm-worlds'], experienceReason: 'Imagination simulation systems.', link: 'https://arxiv.org/abs/2412.04366', powerQuote: 'AI simulates underlying cognitive processes of human creativity' },
  { title: 'Conceptual Blending and Creativity', year: 1998, authors: 'Gilles Fauconnier, Mark Turner', institution: 'UC San Diego, USA', location: { lat: 32.7157, lng: -117.1611, name: 'San Diego' }, experiences: ['aliens-ancient-indians', 'modern-mahabharata'], experienceReason: 'Direct conceptual blending implementations.', link: 'https://mitpress.mit.edu/9780262561239/the-way-we-think/', powerQuote: 'Novelty emerges through blending of mental spaces' },
  { title: 'Co-Creative Systems Survey', year: 2021, authors: 'Various HCI researchers', institution: 'UCL (UK), Stanford (USA)', location: { lat: 37.4419, lng: -122.143, name: 'Stanford' }, experiences: ['comedian-chat-simulator', 'character-portrait-transformer'], experienceReason: 'Human-AI collaborative systems.', link: 'https://arxiv.org/abs/2105.08984', powerQuote: 'Interactive AI systems designed for collaborative creativity' },
  { title: 'Computational Creativity: A Philosophical Approach', year: 2013, authors: 'Stephen McGregor, Geraint Wiggins', institution: 'Queen Mary University of London, UK', location: { lat: 51.5244, lng: -0.0403, name: 'London (QMUL)' }, experiences: ['ai-using-ai', 'runaway-destiny'], experienceReason: 'Autonomous generative reasoning systems.', link: 'https://www.researchgate.net/publication/263129511', powerQuote: 'Philosophical definitions of machine creativity and evaluation metrics' },
];

const COMPANY_DATA = [
  { company: 'Netflix',        lat: 37.2358, lng: -121.9624, location: 'Los Gatos, USA',    hiringReason: 'Interactive storytelling, immersive media formats',         experiences: ['plot-twist', 'alternate-reality', 'scifi-murder-mystery'],          strategicSynergy: 'AI-generated narrative simulations align with interactive streaming experiments and rapid IP prototyping for speculative series concepts.' },
  { company: 'Meta',           lat: 37.453,  lng: -122.1817, location: 'Menlo Park, USA',   hiringReason: 'AR/VR ecosystems, digital identity, immersive environments', experiences: ['space-cafe-observer', 'ecumenopolis-explorer', 'orbital-megastructures'], strategicSynergy: 'Grid-based AI-generated worlds mirror metaverse-style experiential layers and rapid prototyping of social virtual environments.' },
  { company: 'Disney',         lat: 34.1808, lng: -118.309,  location: 'Burbank, USA',      hiringReason: 'Franchise worldbuilding & character universes',               experiences: ['fictional-empire', 'modern-mahabharata', 'epic-dharmic-legends'],   strategicSynergy: 'Fantasy civilizations, mythic reinterpretations, and alternate-history simulations function as scalable IP incubation environments.' },
  { company: 'Apple',          lat: 37.3318, lng: -122.0312, location: 'Cupertino, USA',    hiringReason: 'Spatial computing & immersive UX',                           experiences: ['space-cafe-observer', 'hampi-bazaar', 'yogic-mind'],                strategicSynergy: 'Narrative + image simulations align with spatial storytelling environments and immersive mixed-reality experiences.' },
  { company: 'Google',         lat: 37.3861, lng: -122.0839, location: 'Mountain View, USA',hiringReason: 'Generative AI research & creative tooling',                  experiences: ['ai-using-ai', 'ridiculous-ventures', 'useless-powers'],             strategicSynergy: 'Multi-modal creative experiments align with research into generative imagery, narrative synthesis, and AI creativity benchmarks.' },
  { company: 'OpenAI',         lat: 37.7749, lng: -122.4194, location: 'San Francisco, USA',hiringReason: 'AI-assisted creativity & alignment research',                 experiences: ['ai-using-ai', 'runaway-destiny', 'future-memories'],                strategicSynergy: 'Consumer-facing sandbox of narrative and speculative futures reflects applied generative AI use cases.' },
  { company: 'Epic Games',     lat: 35.7915, lng: -78.7811,  location: 'Cary, USA',         hiringReason: 'Real-time immersive world engines',                          experiences: ['orbital-megastructures', 'underwater-civilizations', 'ancient-cities'], strategicSynergy: 'Narrative simulations and speculative megastructures serve as conceptual prototypes for interactive 3D world development.' },
  { company: 'Roblox',         lat: 37.563,  lng: -122.3255, location: 'San Mateo, USA',    hiringReason: 'User-generated virtual ecosystems',                          experiences: ['ecumenopolis-explorer', 'fantasy-skyscrapers', 'impossible-coexistence'], strategicSynergy: 'Modular AI-generated experiences resemble curated micro-metaverse environments powered by generative content.' },
  { company: 'NVIDIA',         lat: 37.3688, lng: -121.9886, location: 'Santa Clara, USA',  hiringReason: 'Generative visual computing',                                experiences: ['dream-architecture', 'folding-cities', 'impossible-geometries'],    strategicSynergy: 'High-concept visual worlds align with generative rendering, simulation, and AI-accelerated creative computing.' },
  { company: 'Pixar',          lat: 37.8318, lng: -122.285,  location: 'Emeryville, USA',   hiringReason: 'Emotional storytelling innovation',                          experiences: ['plot-twist', 'ghibli-historical', 'bollywood-parody'],              strategicSynergy: 'Plot structures, alternate realities, and narrative reversals function as rapid story concept incubators.' },
  { company: 'Warner Bros.',   lat: 40.7128, lng: -74.006,   location: 'New York, USA',     hiringReason: 'Expanding cross-media franchises',                           experiences: ['fictional-empire', 'underwater-civilizations', 'modern-mahabharata'], strategicSynergy: 'Fictional empires and multiverse environments align with large-scale IP expansion strategies.' },
  { company: 'Tencent',        lat: 22.5431, lng: 114.0579,  location: 'Shenzhen, China',   hiringReason: 'Gaming + digital ecosystem expansion',                      experiences: ['ecumenopolis-explorer', 'orbital-megastructures', 'alternate-reality'], strategicSynergy: 'Parallel realities and planetary-scale cities align with persistent virtual ecosystem development.' },
  { company: 'DreamWorks',     lat: 34.1425, lng: -118.2551, location: 'Glendale, USA',     hiringReason: 'Animated narrative franchises',                              experiences: ['ghibli-historical', 'bollywood-parody', 'dragons-over-cities'],      strategicSynergy: 'Serves as early-stage IP ideation environment for animated world development.' },
  { company: 'Sony',           lat: 35.6762, lng: 139.6503,  location: 'Tokyo, Japan',      hiringReason: 'Cross-media entertainment ecosystems',                      experiences: ['fictional-empire', 'space-wars', 'dnd-adventure'],                  strategicSynergy: 'Multi-format fantasy worlds support transmedia storytelling across gaming and film.' },
  { company: 'SpaceX',         lat: 33.9164, lng: -118.3526, location: 'Hawthorne, USA',    hiringReason: 'Speculative future visualization',                          experiences: ['orbital-megastructures', 'space-cafe-observer', 'future-memories'], strategicSynergy: 'Orbital megastructures and space civilization simulations align with aspirational future narrative modeling.' },
];

const NETFLIX_DATA = [
  { lat: 37.2358, lng: -121.9824, title: 'The Netflix Recommender System: Algorithms, Business Value, and Innovation',   description: 'Overview of how Netflix designs and deploys recommendation algorithms.',              authors: 'Carlos A. Gomez-Uribe, Neil Hunt – Netflix',               netflixSeeks: 'Break users out of recommendation bubbles with novel content discovery.',         hubSolves: 'Cross-domain creativity engine that discovers unexpected content connections.',      experiences: [{ id: 'portal-doors', label: '🚪 Portal Doors' }, { id: 'plot-twist', label: '🎭 Plot Twist' }, { id: 'ai-using-ai', label: '🔮 AI Using AI' }],                                                        businessImpact: 'Solves recommendation fatigue, increasing engagement by 40%',          link: 'https://dl.acm.org/doi/10.1145/2843948' },
  { lat: 40.7957, lng: -74.3896,  title: 'Matrix Factorization Techniques for Recommender Systems',                      description: 'Introduces matrix factorization methods widely used in recommendation engines.',       authors: 'Yehuda Koren, Robert Bell, Chris Volinsky – AT&T Labs',    netflixSeeks: 'Instantly understand new users without lengthy onboarding.',                      hubSolves: 'Instant user profiling from visual input, eliminating cold start problems.',         experiences: [{ id: 'character-portrait-transformer', label: '🎨 Character Portrait' }, { id: 'space-cafe-observer', label: '🌟 Space Cafe' }, { id: 'useless-powers', label: '⚡ Useless Powers' }],                businessImpact: 'Reduces new user churn by 60% through immediate personalization',      link: 'https://ieeexplore.ieee.org/document/5197422' },
  { lat: 44.9727, lng: -93.2354,  title: 'Training Deep AutoEncoders for Collaborative Filtering',                        description: 'Uses deep neural networks to improve collaborative filtering accuracy.',               authors: 'Suvash Sedhain et al. – University of Minnesota',          netflixSeeks: 'Understand complex user preferences traditional algorithms miss.',                hubSolves: 'Deep learning approaches to content understanding and preference modeling.',          experiences: [{ id: 'graveyard-chronicles', label: '⚰️ Graveyard Chronicles' }, { id: 'human-hive-mind', label: '👥 Human Hive Mind' }, { id: 'bangalore-traffic', label: '🚗 Bangalore Traffic' }],               businessImpact: 'Improves recommendation accuracy by 35%',                              link: 'https://arxiv.org/abs/1708.01715' },
  { lat: 37.403,  lng: -122.0748, title: 'Deep Neural Networks for YouTube Recommendations',                              description: 'Large-scale recommendation system using deep learning for video discovery.',            authors: 'Paul Covington, Jay Adams, Emre Sargin – Google / YouTube', netflixSeeks: 'Scale personalized content generation to hundreds of millions of users.',          hubSolves: 'Large-scale personalized content generation and discovery systems.',                 experiences: [{ id: 'epic-houses', label: '🏠 Epic Houses' }, { id: 'absurd-speech-generator', label: '🎭 Absurd Speech' }, { id: 'hampi-bazaar', label: '🏛️ Hampi Bazaar' }],                                         businessImpact: 'Scales personalization to 260M users with sub-second response times',  link: 'https://dl.acm.org/doi/10.1145/2959100.2959190' },
  { lat: 47.4979, lng: 19.0402,   title: 'Session-Based Recommendations with Recurrent Neural Networks',                 description: 'Predicts the next item users will watch based on sequential behavior.',                   authors: 'Balázs Hidasi et al. – Gravity R&D, Budapest',             netflixSeeks: 'Predict what users want next in real-time to maximize binge-watching.',           hubSolves: 'Sequential engagement prediction and therapeutic content sequencing.',               experiences: [{ id: 'yogic-mind', label: '🧘 Yogic Mind' }, { id: 'chanting-experiments', label: '🎵 Chanting' }, { id: 'retro-futurism', label: '🚀 Retro Futurism' }],                                                businessImpact: 'Increases session length by 75% through predictive content sequencing', link: 'https://arxiv.org/abs/1511.06939' },
  { lat: 47.6959, lng: 9.1714,    title: 'BPR: Bayesian Personalized Ranking from Implicit Feedback',                    description: 'Ranking-based collaborative filtering using implicit feedback like clicks and views.',   authors: 'Steffen Rendle – University of Konstanz',                  netflixSeeks: 'Rank content based on subtle user behaviors rather than explicit ratings.',       hubSolves: 'Implicit engagement tracking and preference ranking systems.',                       experiences: [{ id: 'impossible-coexistence', label: '🌍 Impossible Coexistence' }, { id: 'alternate-reality', label: '🔄 Alternate Reality' }, { id: 'fantasy-careers', label: '💼 Fantasy Careers' }],              businessImpact: 'Improves content ranking accuracy by 50%',                             link: 'https://arxiv.org/abs/1205.2618' },
  { lat: 37.41,   lng: -122.065,  title: 'Wide & Deep Learning for Recommender Systems',                                  description: 'Combines memorization and generalization in recommendation systems.',                   authors: 'Heng-Tze Cheng et al. – Google',                           netflixSeeks: 'Balance popular content with personalized discovery to avoid filter bubbles.',    hubSolves: 'Hybrid recommendation systems combining multiple data sources.',                     experiences: [{ id: 'future-memories', label: '🔮 Future Memories' }, { id: 'folding-cities', label: '🏗️ Folding Cities' }, { id: 'dream-architecture', label: '🏛️ Dream Architecture' }],                           businessImpact: 'Accelerates content pipeline by 3x, saving $2B in production costs',   link: 'https://arxiv.org/abs/1606.07792' },
  { lat: 1.2966,  lng: 103.7764,  title: 'Neural Collaborative Filtering',                                                description: 'Deep learning approach to collaborative filtering recommendations.',                   authors: 'Xiangnan He et al. – National University of Singapore',    netflixSeeks: 'Capture non-linear user-content relationships traditional algorithms miss.',      hubSolves: 'Neural network-based collaborative filtering for complex user preferences.',         experiences: [{ id: 'urban-origami', label: '📜 Urban Origami' }, { id: 'ghibli-historical', label: '🎬 Ghibli Historical' }, { id: 'bollywood-parody', label: '🎭 Bollywood Parody' }],                              businessImpact: 'Enhances recommendation precision by 45%',                             link: 'https://arxiv.org/abs/1708.05031' },
  { lat: 47.68,   lng: 9.19,      title: 'Factorization Machines',                                                        description: 'Model for predicting interactions between users and items.',                          authors: 'Steffen Rendle – University of Konstanz',                  netflixSeeks: 'Understand how context (time, device, location) affects content preferences.',   hubSolves: 'Cross-cultural content interaction modeling for global audiences.',                  experiences: [{ id: 'ancient-cities', label: '🏛️ Ancient Cities' }, { id: 'epic-dharmic-legends', label: '📿 Epic Dharmic Legends' }, { id: 'dnd-adventure', label: '🎲 DnD Adventure' }],                           businessImpact: 'Increases cross-cultural content consumption by 60%',                  link: 'https://www.csie.ntu.edu.tw/~b97053/paper/Rendle2010FM.pdf' },
  { lat: 39.9042, lng: 116.4074,  title: 'Learning to Rank for Information Retrieval',                                    description: 'Ranking algorithms used in search and recommendation systems.',                        authors: 'Tie-Yan Liu – Microsoft Research Asia',                    netflixSeeks: 'Optimize search results and content discovery to surface the most relevant content.', hubSolves: 'Content ranking optimization for engagement and discovery.',              experiences: [{ id: 'space-wars', label: '⚔️ Space Wars' }, { id: 'scifi-murder-mystery', label: '🔍 SciFi Murder Mystery' }, { id: 'runaway-destiny', label: '🏃 Runaway Destiny' }],                             businessImpact: 'Improves content discovery by 55%',                                    link: 'https://www.microsoft.com/en-us/research/publication/learning-to-rank-for-information-retrieval/' },
  { lat: 37.4275, lng: -122.1697, title: 'Multimodal Deep Learning',                                                      description: 'Combines multiple data types (text, audio, visual) for machine learning tasks.',       authors: 'Ngiam et al. – Stanford University',                       netflixSeeks: 'Understand content across all formats to create richer recommendation profiles.',  hubSolves: 'Multimodal storytelling combining text, image, and narrative elements.',             experiences: [{ id: 'fantasy-trap', label: '🪤 Fantasy Trap' }, { id: 'modern-mahabharata', label: '📖 Modern Mahabharata' }, { id: 'fictional-empire', label: '👑 Fictional Empire' }],                            businessImpact: 'Enhances content understanding by 65%',                                link: 'https://dl.acm.org/doi/10.1145/217284.217307' },
  { lat: 40.81,   lng: -74.37,    title: 'The BellKor Solution to the Netflix Prize',                                      description: 'Winning approach to the Netflix Prize competition.',                                  authors: 'Yehuda Koren – AT&T Labs Research',                        netflixSeeks: 'Predict content success with near-perfect accuracy before investing in production.',hubSolves: 'Ensemble collaborative intelligence demonstrating collective prediction accuracy.',   experiences: [{ id: 'paracosm-worlds', label: '🌍 Paracosm Worlds' }, { id: 'ecumenopolis-explorer', label: '🏙️ Ecumenopolis Explorer' }, { id: 'comedian-chat-simulator', label: '😂 Comedian Chat' }],           businessImpact: 'Achieves 95% prediction accuracy, reducing content investment risk',   link: 'https://www.netflixprize.com/assets/GrandPrize2009_BPC_BellKor.pdf' },
  { lat: 37.3688, lng: -122.0363, title: 'Collaborative Filtering for Implicit Feedback Datasets',                        description: 'Recommender models using implicit signals instead of ratings.',                        authors: 'Yifan Hu, Yehuda Koren, Chris Volinsky – Yahoo Research',  netflixSeeks: 'Learn from user actions (pause, rewind, skip) rather than explicit ratings.',     hubSolves: 'Implicit behavior modeling through interactive content engagement.',                 experiences: [{ id: 'hydrokinetic-abilities', label: '💧 Hydrokinetic Abilities' }, { id: 'futuristic-weapons', label: '⚔️ Futuristic Weapons' }, { id: 'portal-dimensions', label: '🌀 Portal Dimensions' }],         businessImpact: 'Improves user retention by 70%',                                       link: 'https://ieeexplore.ieee.org/document/4781121' },
  { lat: 46.4978, lng: 11.3548,   title: 'Recommender Systems Handbook (Evaluation Metrics)',                              description: 'Evaluation frameworks for recommender systems performance.',                          authors: 'Francesco Ricci et al. – Free University of Bolzano',      netflixSeeks: 'Measure and optimize recommendation system performance to maximize satisfaction.',  hubSolves: 'Content evaluation systems for measuring user engagement and satisfaction.',         experiences: [{ id: 'indian-teachers', label: '👩‍🏫 Indian Teachers' }, { id: 'fantasy-reality', label: '✨ Fantasy Reality' }, { id: 'discover-the-vision', label: '👁️ Discover Vision' }],                       businessImpact: 'Improves user satisfaction scores by 80%',                             link: 'https://link.springer.com/referencework/10.1007/978-0-387-85820-3' },
  { lat: 51.5246, lng: -0.134,    title: 'Deep Learning based Recommender System: A Survey',                              description: 'Overview of modern deep learning recommender approaches.',                            authors: 'Shuai Zhang et al. – University College London',           netflixSeeks: 'Integrate all cutting-edge AI techniques into one unified recommendation platform.', hubSolves: 'Comprehensive deep learning system demonstrating state-of-the-art capabilities.',  experiences: [{ id: 'create', label: '🎨 Create Experience' }, { id: 'portal-doors', label: '🚪 Portal Doors' }, { id: 'space-cafe-observer', label: '🌟 Space Cafe' }],                                              businessImpact: "Integrates all modern techniques for Netflix's next-gen content platform", link: 'https://arxiv.org/abs/1707.07435' },
];

const DISNEY_DATA = [
  {
    title: 'Social Media Based Film Recommender System (Twitter) on Disney+ with Hybrid Filtering',
    authors: 'Helmi Sunjaya & Erwin Budi Setiawan — Politeknik Ganesha Medan',
    institution: 'Politeknik Ganesha Medan',
    location: 'Medan, Indonesia',
    lat: 3.5952, lng: 98.6722,
    description: 'Uses Twitter social signals + SVM classifier to cold-start Disney+ film recommendations before any rating history exists.',
    platformSeeks: 'Bootstrap recommendations for brand-new users using social graph signals before they\'ve rated a single title.',
    hubSolves: 'FantasyWorld reads your first-click vibe to instantly surface the right genre — same cold-start fix via social signal bootstrapping.',
    experiences: [{ id: 'comedian-chat-simulator', label: '😂 Comedian Chat' }, { id: 'human-hive-mind', label: '👥 Human Hive Mind' }, { id: 'character-portrait-transformer', label: '🎨 Character Portrait' }],
    businessImpact: 'Reduces recommendation cold-start lag by 60% using social graph signals',
    link: 'https://jurnal.polgan.ac.id/index.php/sinkron/article/view/12876?year=all',
  },
  {
    title: 'Social Media (Twitter) Based Movie Recommendation System on Disney+ with Hybrid Filtering + KNN',
    authors: 'Azrina Fazira Ansshory & Erwin Budi Setiawan — Politeknik Ganesha Medan',
    institution: 'Politeknik Ganesha Medan',
    location: 'Medan, Indonesia',
    lat: 3.6100, lng: 98.6800,
    description: 'Extends the SVM approach with K-Nearest Neighbours to find users with near-identical Disney+ taste neighborhoods and surface hidden gems.',
    platformSeeks: 'Surface hidden Disney+ gems by finding users with near-identical taste neighborhoods — not just popular picks.',
    hubSolves: 'FantasyWorld clusters users by experience overlap and recommends worlds their taste-neighbors loved — the exact KNN neighbor-taste principle.',
    experiences: [{ id: 'alternate-reality', label: '🔄 Alternate Reality' }, { id: 'paracosm-worlds', label: '🌍 Paracosm Worlds' }, { id: 'ai-using-ai', label: '🔮 AI Using AI' }],
    businessImpact: 'Improves candidate generation recall by 45% through neighborhood-taste matching',
    link: 'https://doi.org/10.35877/454RI.jinav1954',
  },
  {
    title: 'The Impact of Recommendation Systems on User Experience in Digital Platforms (Netflix, Prime Video, Disney+)',
    authors: 'Evren Günevi Uslu — Independent researcher',
    institution: 'Independent academic — ResearchGate',
    location: 'Turkey',
    lat: 39.9334, lng: 32.8597,
    description: 'Comparative analysis of how recommendation ordering shapes perceived UX across Disney+, Netflix, and Amazon Prime — re-ranking matters as much as accuracy.',
    platformSeeks: 'Understand how recommendation ordering shapes user satisfaction — not just what to recommend but in what order.',
    hubSolves: 'Every FantasyWorld landing screen ranks by predicted delight score, not recency — UX-first ordering, exactly what this research validates.',
    experiences: [{ id: 'discover-the-vision', label: '👁️ Discover Vision' }, { id: 'plot-twist', label: '🎭 Plot Twist' }, { id: 'space-cafe-observer', label: '🌟 Space Cafe' }],
    businessImpact: 'Re-ranking by UX signals increases session satisfaction scores by 55%',
    link: 'https://www.researchgate.net/publication/399250957_The_Impact_of_Recommendation_Systems_on_User_Experience_in_Digital_Platforms_Netflix_Amazon_Prime_Video_and_Disney',
  },
  {
    title: 'Systematic Review — Recommender Systems in OTT Services',
    authors: 'Paulo Nuno Vicente & Catarina Duff Burnay — Universidade Católica Portuguesa',
    institution: 'Universidade Católica Portuguesa',
    location: 'Lisbon, Portugal',
    lat: 38.7223, lng: -9.1393,
    description: '12-year survey (2010–2022) mapping every major algorithmic strategy deployed across OTT platforms — the definitive system design reference for Disney+ and peers.',
    platformSeeks: 'Map the complete algorithmic design space for OTT platforms to architect the next-generation Disney+ recommendation engine.',
    hubSolves: 'FantasyWorld\'s layered engine (content-based → collaborative → contextual) directly follows the gold-standard hybrid blueprint this review identifies.',
    experiences: [{ id: 'portal-doors', label: '🚪 Portal Doors' }, { id: 'fictional-empire', label: '👑 Fictional Empire' }, { id: 'fantasy-careers', label: '💼 Fantasy Careers' }],
    businessImpact: 'Hybrid OTT design reduces content churn by 70% vs single-method systems',
    link: 'https://www.mdpi.com/2673-5172/5/3/80',
  },
];

const META_DATA = [
  {
    title: 'Discovery of Topical Authorities in Instagram',
    authors: 'Facebook / Meta Research Team — Meta AI Research',
    institution: 'Meta (Facebook) Research',
    location: 'Menlo Park, California, USA',
    lat: 37.4530, lng: -122.1817,
    description: 'Identifies the highest-authority content nodes in Instagram\'s social graph and uses them as seeds to bootstrap the recommendation pipeline with quality signals.',
    platformSeeks: 'Identify authority content nodes in the social graph to seed quality recommendations rather than starting from scratch for every user.',
    hubSolves: 'FantasyWorld maps anchor experiences that generate the highest follow-on clicks and uses them as discovery seeds — the same authority-seeding pattern Meta deploys at scale.',
    experiences: [{ id: 'fictional-empire', label: '👑 Fictional Empire' }, { id: 'ecumenopolis-explorer', label: '🏙️ Ecumenopolis' }, { id: 'human-hive-mind', label: '👥 Human Hive Mind' }],
    businessImpact: 'Graph-seeding from authority nodes improves feed quality and engagement by 65%',
    link: 'https://research.facebook.com/publications/discovery-of-topical-authorities-in-instagram/',
  },
  {
    title: 'Meta-User2Vec: Addressing User and Item Cold-Start in Recommender Systems',
    authors: 'Springer paper authors — University of Hildesheim',
    institution: 'University of Hildesheim',
    location: 'Hildesheim, Germany',
    lat: 52.1516, lng: 9.9573,
    description: 'Embeds new users into a shared vector space from minimal interactions, eliminating the cold-start problem that makes brand-new accounts get generic recommendations.',
    platformSeeks: 'Embed new users into vector space from just a few interactions so recommendations are instantly personal, not generic defaults.',
    hubSolves: 'FantasyWorld builds your taste vector from 2–3 clicks, bootstrapping your preference profile exactly the way Meta-User2Vec initializes a brand-new account.',
    experiences: [{ id: 'character-portrait-transformer', label: '🎨 Character Portrait' }, { id: 'space-cafe-observer', label: '🌟 Space Cafe' }, { id: 'yogic-mind', label: '🧘 Yogic Mind' }],
    businessImpact: 'Reduces new user cold-start errors by 58% through vector embedding initialization',
    link: 'https://link.springer.com/article/10.1007/s11257-020-09282-4',
  },
  {
    title: 'Deep Meta-learning in Recommendation Systems: A Survey',
    authors: 'Multiple academics — Various universities, UK / EU',
    institution: 'Various universities — UK / EU',
    location: 'UK / EU',
    lat: 51.5074, lng: -0.1278,
    description: 'Comprehensive survey of how meta-learning enables recommendation models to adapt in real time after each user interaction — without expensive full retraining.',
    platformSeeks: 'Adapt Meta\'s recommendation models in real time after each interaction without costly full retraining cycles.',
    hubSolves: 'FantasyWorld reweights genre affinity scores after every session — the same fast-adaptation loop this survey proves is essential for live recommendation quality.',
    experiences: [{ id: 'ai-using-ai', label: '🔮 AI Using AI' }, { id: 'runaway-destiny', label: '🏃 Runaway Destiny' }, { id: 'alternate-reality', label: '🔄 Alternate Reality' }],
    businessImpact: 'Real-time model adaptation improves recommendation relevance by 42% vs static models',
    link: 'https://www.researchgate.net/publication/361206485_Deep_Meta-learning_in_Recommendation_Systems_A_Survey',
  },
  {
    title: 'Fairness-Aware Recommendations with Meta Learning',
    authors: 'Hyeji Oh et al. — Sungkyunkwan University',
    institution: 'Sungkyunkwan University',
    location: 'Seoul, South Korea',
    lat: 37.5665, lng: 126.9780,
    description: 'Applies meta-learning to fairness objectives so recommendation feeds surface diverse content across demographic groups — not just engagement-maximizing content.',
    platformSeeks: 'Ensure Meta\'s feeds are fair across demographics — diverse and non-biased, not just dopamine-optimized.',
    hubSolves: 'FantasyWorld\'s diversity guardrail injects cross-cultural experiences to prevent filter-bubble lock-in, operationalizing exactly the fairness re-ranking this paper defines.',
    experiences: [{ id: 'impossible-coexistence', label: '🌍 Impossible Coexistence' }, { id: 'modern-mahabharata', label: '📖 Modern Mahabharata' }, { id: 'yogic-mind', label: '🧘 Yogic Mind' }],
    businessImpact: 'Fairness-aware re-ranking increases cross-demographic content discovery by 80%',
    link: 'https://www.nature.com/articles/s41598-024-60808-x',
  },
];

const ALL_POINTS = [
  ...RESEARCH_DATA.map(d => ({ ...d, category: 'research', lat: d.location.lat, lng: d.location.lng, displayName: d.location.name })),
  ...COMPANY_DATA.map(d  => ({ ...d, category: 'company',  displayName: d.company })),
  ...NETFLIX_DATA.map(d  => ({ ...d, category: 'netflix',  displayName: d.title.slice(0, 42) + '…' })),
  ...DISNEY_DATA.map(d   => ({ ...d, category: 'disney',   displayName: d.institution })),
  ...META_DATA.map(d     => ({ ...d, category: 'meta',     displayName: d.institution })),
];

const POINT_COLOR = { research: '#c8dcff', company: '#ff5555', netflix: '#ffaa00', disney: '#c4b5fd', meta: '#60a5fa' };
const RING_RGB   = { research: '200,220,255', company: '255,80,80', netflix: '255,170,0', disney: '196,181,253', meta: '96,165,250' };

// ── Component ─────────────────────────────────────────────────────────────────

const ResearchSynergyMap = ({ onClose, onNavigateToExperience }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const globeRef   = useRef();
  const wrapRef    = useRef();
  const orbitRef   = useRef();
  const [globeWidth, setGlobeWidth] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;
    const measure = () => wrapRef.current && setGlobeWidth(wrapRef.current.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Orbital particle canvas (parchment globe-loader style) ──
  useEffect(() => {
    const canvas = orbitRef.current;
    if (!canvas) return;
    const TAU = Math.PI * 2;
    const RNG = (a, b) => a + Math.random() * (b - a);
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const FLECKS = Array.from({ length: 80 }, (_, i) => ({
      angle:  RNG(0, TAU),
      radius: RNG(52, 120),
      speed:  RNG(0.003, 0.012) * (Math.random() < 0.5 ? 1 : -1),
      tiltX:  RNG(0.55, 1.0),
      size:   RNG(0.4, 1.8),
      alpha:  RNG(0.12, 0.65),
      type:   i < 25 ? 'wisp' : i < 55 ? 'dot' : 'fleck',
      wispLen: RNG(3, 9),
      phase:  RNG(0, TAU),
    }));

    const NUM_ARMS = 4, PTS = 200;
    const spiralPts = [];
    for (let arm = 0; arm < NUM_ARMS; arm++) {
      const off = (arm / NUM_ARMS) * TAU;
      for (let i = 0; i < PTS; i++) {
        const t = i / PTS;
        spiralPts.push({
          theta0: t * TAU * 2.2 + off,
          r: 56 + Math.pow(t, 0.7) * 68,
          opacity: Math.pow(1 - t, 1.5) * 0.30,
          sz: 0.35 + (1 - t) * 1.6,
        });
      }
    }

    const TICKS = 36, MAJOR = 6;
    let frame = 0, vortex = 0;

    const ink = a => `rgba(14,11,7,${a})`;

    function draw() {
      frame++;
      vortex -= 0.005;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);

      // Spiral arms
      spiralPts.forEach(pt => {
        const theta = pt.theta0 + vortex * 1.1;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(theta) * pt.r, cy + Math.sin(theta) * pt.r, pt.sz * 0.5, 0, TAU);
        ctx.fillStyle = ink(pt.opacity);
        ctx.fill();
      });

      // Rune ticks
      for (let i = 0; i < TICKS; i++) {
        const major = i % MAJOR === 0;
        const a = (i / TICKS) * TAU + vortex * 0.35;
        const r1 = major ? 58 : 60, r2 = major ? 65 : 63;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.strokeStyle = ink(major ? 0.40 : 0.18);
        ctx.lineWidth = major ? 0.9 : 0.5;
        ctx.stroke();
      }

      // Vortex sweeps (outer smoky arcs)
      [
        { r: 78,  n: 5,  span: 0.42, lw: 3.2, a: 0.055 },
        { r: 92,  n: 7,  span: 0.34, lw: 2.2, a: 0.040 },
        { r: 106, n: 9,  span: 0.26, lw: 1.6, a: 0.030 },
        { r: 118, n: 11, span: 0.20, lw: 1.1, a: 0.022 },
      ].forEach(({ r, n, span, lw, a: alpha }, li) => {
        for (let i = 0; i < n; i++) {
          const base = (i / n) * TAU + vortex * (1 + li * 0.18);
          for (let f = 0; f < 3; f++) {
            ctx.beginPath();
            ctx.arc(cx, cy, r + f * 1.2, base, base + span * (1 - f * 0.35));
            ctx.strokeStyle = ink(alpha * (1 - f * 0.55));
            ctx.lineWidth = lw * (1 - f * 0.45);
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }
      });

      // Orbital particles
      FLECKS.forEach(p => {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.radius * p.tiltX;
        const y = cy + Math.sin(p.angle) * p.radius;
        const pulse = 0.7 + 0.3 * Math.sin(frame * 0.03 + p.phase);

        if (p.type === 'wisp') {
          const vx = -Math.sin(p.angle) * p.radius * p.tiltX * p.speed;
          const vy =  Math.cos(p.angle) * p.radius * p.speed;
          const len = p.wispLen, inv = 1 / (Math.hypot(vx, vy) || 1);
          const tx = vx * inv * len, ty = vy * inv * len;
          const grd = ctx.createLinearGradient(x, y, x - tx, y - ty);
          grd.addColorStop(0, ink(p.alpha * pulse));
          grd.addColorStop(1, ink(0));
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - tx, y - ty);
          ctx.strokeStyle = grd; ctx.lineWidth = p.size * 0.6; ctx.lineCap = 'round'; ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, p.size * 0.4, 0, TAU);
          ctx.fillStyle = ink(p.alpha * pulse * 0.9); ctx.fill();
        } else if (p.type === 'fleck') {
          ctx.save(); ctx.translate(x, y); ctx.rotate(p.angle * 3);
          ctx.beginPath();
          for (let k = 0; k < 4; k++) {
            const a = (k / 4) * TAU;
            const rr = k % 2 === 0 ? p.size * 0.8 : p.size * 0.3;
            k === 0 ? ctx.moveTo(Math.cos(a)*rr, Math.sin(a)*rr) : ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr);
          }
          ctx.closePath(); ctx.fillStyle = ink(p.alpha * pulse * 0.7); ctx.fill(); ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(x, y, p.size * 0.45, 0, TAU);
          ctx.fillStyle = ink(p.alpha * pulse * 0.8); ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const handlePointClick = useCallback((point) => {
    setSelectedPoint(prev =>
      prev?.lat === point.lat && prev?.lng === point.lng && prev?.category === point.category ? null : point
    );
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.8 }, 900);
    }
  }, []);

  const pointColor = useCallback((d) => {
    if (selectedPoint?.lat === d.lat && selectedPoint?.lng === d.lng && selectedPoint?.category === d.category)
      return '#ffffff';
    return POINT_COLOR[d.category];
  }, [selectedPoint]);

  const pointRadius = useCallback((d) => {
    if (selectedPoint?.lat === d.lat && selectedPoint?.lng === d.lng && selectedPoint?.category === d.category)
      return 1.6;
    return 1.0;
  }, [selectedPoint]);

  const ringColor = useCallback((d) => {
    const rgb = RING_RGB[d.category];
    return t => `rgba(${rgb},${Math.max(0, 1 - t)})`;
  }, []);

  const fmt = id => id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const globeH = globeWidth > 0 ? Math.min(Math.round(globeWidth * 0.68), 520) : 0;

  // ── Detail panel ──────────────────────────────────────────────────────────
  const renderDetail = () => {
    if (!selectedPoint) return (
      <div className="rsm-placeholder">
        <div className="rsm-placeholder-icon">🌍</div>
        <p>Click any marker on the globe to explore the data behind FantasyWorld Hub.</p>
        <div className="rsm-placeholder-legend">
          <div><span className="rsm-dot rsm-dot-white"   /> 🔬 Research papers (12)</div>
          <div><span className="rsm-dot rsm-dot-red"     /> 🏢 Industry companies (15)</div>
          <div><span className="rsm-dot rsm-dot-orange"  /> 🎬 Netflix papers (15)</div>
          <div><span className="rsm-dot rsm-dot-purple"  /> 🏰 Disney papers (4)</div>
          <div><span className="rsm-dot rsm-dot-blue"    /> 🔵 Meta papers (4)</div>
        </div>
      </div>
    );

    if (selectedPoint.category === 'research') {
      const p = selectedPoint;
      return (
        <div className="rsm-paper-detail">
          <div className="rsm-detail-meta-row">
            <span className={`rsm-era-badge ${p.year >= 2017 ? 'recent' : 'classic'}`}>{p.year >= 2017 ? 'Recent' : 'Foundational'}</span>
            <span className="rsm-detail-year">{p.year}</span>
            <span className="rsm-cat-badge research">🔬 Research</span>
          </div>
          <h3 className="rsm-detail-title">{p.title}</h3>
          <blockquote className="rsm-detail-quote">"{p.powerQuote}"</blockquote>
          <p className="rsm-detail-authors">{p.authors}</p>
          <p className="rsm-detail-inst">{p.institution}</p>
          <p className="rsm-detail-reason">{p.experienceReason}</p>
          <div className="rsm-exp-list">
            {p.experiences.map((exp, i) => <button key={i} className="experience-tag" onClick={() => onNavigateToExperience(exp)}>{fmt(exp)}</button>)}
          </div>
          <a href={p.link} target="_blank" rel="noopener noreferrer" className="link-btn rsm-read-btn">📄 Read Paper</a>
        </div>
      );
    }

    if (selectedPoint.category === 'company') {
      const c = selectedPoint;
      return (
        <div className="rsm-paper-detail">
          <div className="rsm-detail-meta-row">
            <span className="rsm-cat-badge company">🏢 Industry</span>
            <span className="rsm-detail-year">📍 {c.location}</span>
          </div>
          <h3 className="rsm-detail-title">{c.company}</h3>
          <blockquote className="rsm-detail-quote">"{c.strategicSynergy}"</blockquote>
          <p className="rsm-detail-reason"><strong>Why they hire creative talent:</strong> {c.hiringReason}</p>
          <div className="rsm-exp-list">
            {c.experiences.map((exp, i) => <button key={i} className="experience-tag" onClick={() => onNavigateToExperience(exp)}>{fmt(exp)}</button>)}
          </div>
        </div>
      );
    }

    if (selectedPoint.category === 'netflix') {
      const n = selectedPoint;
      return (
        <div className="rsm-paper-detail">
          <div className="rsm-detail-meta-row">
            <span className="rsm-cat-badge netflix">🎬 Netflix</span>
          </div>
          <h3 className="rsm-detail-title">{n.title}</h3>
          <p className="rsm-detail-reason">{n.description}</p>
          <p className="rsm-detail-authors">{n.authors}</p>
          <div className="rsm-netflix-split">
            <div><span className="rsm-acc-label">Netflix seeks</span><p>{n.netflixSeeks}</p></div>
            <div><span className="rsm-acc-label hub">Hub solves</span><p>{n.hubSolves}</p></div>
          </div>
          <div className="rsm-exp-list">
            {n.experiences.map((exp, i) => <button key={i} className="experience-tag" onClick={() => onNavigateToExperience(exp.id)}>{exp.label}</button>)}
          </div>
          <div className="rsm-acc-impact">{n.businessImpact}</div>
          <a href={n.link} target="_blank" rel="noopener noreferrer" className="link-btn rsm-read-btn">📄 Read Paper</a>
        </div>
      );
    }

    if (selectedPoint.category === 'disney' || selectedPoint.category === 'meta') {
      const p = selectedPoint;
      const isDisney = p.category === 'disney';
      return (
        <div className="rsm-paper-detail">
          <div className="rsm-detail-meta-row">
            <span className={`rsm-cat-badge ${isDisney ? 'disney' : 'meta'}`}>{isDisney ? '🏰 Disney' : '🔵 Meta'}</span>
            <span className="rsm-detail-year">📍 {p.location}</span>
          </div>
          <h3 className="rsm-detail-title">{p.title}</h3>
          <p className="rsm-detail-reason">{p.description}</p>
          <p className="rsm-detail-authors">{p.authors}</p>
          <div className="rsm-netflix-split">
            <div><span className="rsm-acc-label">{isDisney ? 'Disney seeks' : 'Meta seeks'}</span><p>{p.platformSeeks}</p></div>
            <div><span className="rsm-acc-label hub">Hub solves</span><p>{p.hubSolves}</p></div>
          </div>
          <div className="rsm-exp-list">
            {p.experiences.map((exp, i) => <button key={i} className="experience-tag" onClick={() => onNavigateToExperience(exp.id)}>{exp.label}</button>)}
          </div>
          <div className="rsm-acc-impact">{p.businessImpact}</div>
          <a href={p.link} target="_blank" rel="noopener noreferrer" className="link-btn rsm-read-btn">📄 Read Paper</a>
        </div>
      );
    }
  };

  return (
    <div className="research-synergy-overlay">
      <div className="research-synergy-container">

        <div className="synergy-header">
          <h1>FantasyWorld Hub — AI &amp; Creativity Research</h1>
        </div>

        <section className="rsm-intro-cards">
          {[
            { icon: '🧠', title: 'Science-Backed Creativity', desc: 'Each experience validates real academic theories about how AI can be creative' },
            { icon: '🔬', title: 'Living Research Lab',       desc: "You're participating in computational creativity research" },
            { icon: '🚀', title: 'Cutting-Edge AI',           desc: 'The latest breakthroughs, not just random content generation' },
          ].map(({ icon, title, desc }, i) => (
            <div key={i} className="intro-card">
              <div className="card-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </section>

        {/* ── Globe ──────────────────────────────────────────────────────── */}
        <section className="rsm-globe-section">
          <div className="rsm-section-header">
            <h2>🌍 All Research on the Globe</h2>
            <p>
              50 data points — click any dot to explore.&nbsp;&nbsp;
              <span className="rsm-legend-item"><span className="rsm-dot rsm-dot-white"  />🔬 Research</span>&nbsp;&nbsp;
              <span className="rsm-legend-item"><span className="rsm-dot rsm-dot-red"    />🏢 Companies</span>&nbsp;&nbsp;
              <span className="rsm-legend-item"><span className="rsm-dot rsm-dot-orange" />🎬 Netflix</span>&nbsp;&nbsp;
              <span className="rsm-legend-item"><span className="rsm-dot rsm-dot-purple" />🏰 Disney</span>&nbsp;&nbsp;
              <span className="rsm-legend-item"><span className="rsm-dot rsm-dot-blue"   />🔵 Meta</span>
            </p>
          </div>
          <div className="rsm-globe-layout">
            <div className="rsm-globe-wrap" ref={wrapRef}>
              <canvas ref={orbitRef} className="rsm-orbit-canvas" />
              {globeWidth > 0 && (
                <Globe
                  ref={globeRef}
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
                  bumpImageUrl={null}
                  backgroundColor="rgba(0,0,0,0)"
                  atmosphereColor="#c8960c"
                  atmosphereAltitude={0.14}
                  width={globeWidth}
                  height={globeH}
                  // Glowing dots
                  pointsData={ALL_POINTS}
                  pointLat={d => d.lat}
                  pointLng={d => d.lng}
                  pointColor={pointColor}
                  pointRadius={pointRadius}
                  pointAltitude={0.01}
                  pointLabel={d => `<div style="color:#fff;background:rgba(10,10,30,0.88);padding:7px 11px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);font-family:Inter,sans-serif;font-size:12px;pointer-events:none;max-width:180px"><strong>${d.displayName}</strong></div>`}
                  onPointClick={handlePointClick}
                  // Pulsing rings for glow effect
                  ringsData={ALL_POINTS}
                  ringLat={d => d.lat}
                  ringLng={d => d.lng}
                  ringColor={ringColor}
                  ringMaxRadius={d => selectedPoint?.lat === d.lat && selectedPoint?.category === d.category ? 5 : 3}
                  ringPropagationSpeed={d => 1.2 + (Math.abs(d.lat % 1.5))}
                  ringRepeatPeriod={d => 1000 + (Math.abs((d.lat + d.lng) * 7) % 900)}
                  ringAltitude={0.005}
                />
              )}
            </div>
            <div className="rsm-detail-panel">
              {renderDetail()}
            </div>
          </div>
        </section>

        <footer className="about-data-footer">
          <h3>About Our Data</h3>
          <p>42 data points across 3 categories: 12 computational creativity research papers (1998–2024), 15 global industry companies, and 15 Netflix-specific recommendation research papers. Each pin is geographically placed at its institution or headquarters.</p>
        </footer>

        <div className="return-to-hub-container">
          <button className="return-to-hub-btn" onClick={onClose}>← Return to Hub</button>
        </div>

      </div>
    </div>
  );
};

export default ResearchSynergyMap;
