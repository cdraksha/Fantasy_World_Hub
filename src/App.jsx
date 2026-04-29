import React, { useState, useEffect } from 'react';
import { getAvailableExperiences } from './data/experiences';
import DiscoverTheVisionSlideshow from './components/DiscoverTheVisionSlideshow';
import SpaceCafeObserver from './components/SpaceCafeObserver'
import HampiBazaarObserver from './components/HampiBazaarObserver'
import InterviewGenerator from './components/InterviewGenerator'
import RetroFuturismExperience from './components/RetroFuturismExperience'
import AnachronismExperience from './components/AnachronismExperience'
import ImpossibleCoexistenceExperience from './components/ImpossibleCoexistenceExperience'
import SciFiQuestionsExperience from './components/SciFiQuestionsExperience'
import AlternateRealityExperience from './components/AlternateRealityExperience'
import MindBendingHinduStoriesExperience from './components/MindBendingHinduStoriesExperience'
import YogicMindExperimentsExperience from './components/YogicMindExperimentsExperience'
import PlotTwistStoriesExperience from './components/PlotTwistStoriesExperience'
import FutureMemoriesExperience from './components/FutureMemoriesExperience'
import RoboticFusionExperience from './components/RoboticFusionExperience'
import GhibliHistoricalTwistsExperience from './components/GhibliHistoricalTwistsExperience'
import BollywoodParodyExperience from './components/BollywoodParodyExperience'
import UnderwaterCivilizationsExperience from './components/UnderwaterCivilizationsExperience'
import AncientCitiesExperience from './components/AncientCitiesExperience'
import DnDAdventureExperience from './components/DnDAdventureExperience'
import OrbitalMegastructuresExperience from './components/OrbitalMegastructuresExperience'
import FantasyCareersExperience from './components/FantasyCareersExperience'
import ChantingExperimentsExperience from './components/ChantingExperimentsExperience'
import EpicDharmicLegendsExperience from './components/EpicDharmicLegendsExperience'
import SpaceWarsExperience from './components/SpaceWarsExperience'
import AncientConversationsExperience from './components/AncientConversationsExperience'
import GirlInRedDressExperience from './components/GirlInRedDressExperience'
import SciFiMurderMysteryExperience from './components/SciFiMurderMysteryExperience'
import MedievalMurderMysteryExperience from './components/MedievalMurderMysteryExperience'
import TimeAnomalyExperience from './components/TimeAnomalyExperience'
import EpicHousesExperience from './components/EpicHousesExperience'
import FantasyTrapExperience from './components/FantasyTrapExperience'
import DragonsOverCitiesExperience from './components/DragonsOverCitiesExperience'
import WW2CinematicFramesExperience from './components/WW2CinematicFramesExperience'
import FatToFitExperience from './components/FatToFitExperience'
import PortalDimensionsExperience from './components/PortalDimensionsExperience'
import BangaloreTrafficExperience from './components/BangaloreTrafficExperience'
import FoldingCitiesExperience from './components/FoldingCitiesExperience'
import DreamArchitectureExperience from './components/DreamArchitectureExperience'
import ImpossibleGeometriesExperience from './components/ImpossibleGeometriesExperience'
import UrbanOrigamiExperience from './components/UrbanOrigamiExperience'
import ParacosmWorldsExperience from './components/ParacosmWorldsExperience'
import PastLifeStoriesExperience from './components/PastLifeStoriesExperience'
import AncientWeaponsExperience from './components/AncientWeaponsExperience'
import FuturisticWeaponsExperience from './components/FuturisticWeaponsExperience'
import HumanHiveMindExperience from './components/HumanHiveMindExperience'
import CharacterPortraitTransformerSimple from './components/CharacterPortraitTransformerSimple'
import EcumenopolisExplorer from './components/EcumenopolisExplorer'
import RunawayDestinyExperience from './components/RunawayDestinyExperience'
import DuoverseExperience from './components/DuoverseExperience'
import FictionalEmpireExperience from './components/FictionalEmpireExperience'
import IndianSkyscrapersExperience from './components/IndianSkyscrapersExperience'
import ModernMahabharataExperience from './components/ModernMahabharataExperience'
import IndianRailwayExperience from './components/IndianRailwayExperience'
import RidiculousVenturesExperience from './components/RidiculousVenturesExperience'
import EpicMotorHomesExperience from './components/EpicMotorHomesExperience'
import AboutPage from './components/AboutPage'
import ShowcaseDeck from './components/ShowcaseDeck'
import UselessPowersExperience from './components/UselessPowersExperience'
import PortalDoorsExperience from './components/PortalDoorsExperience'
import FantasySkyscrapersExperience from './components/FantasySkyscrapersExperience'
import AlternateMovieEndingsExperience from './components/AlternateMovieEndingsExperience'
import FunnyAIChatboxExperience from './components/FunnyAIChatboxExperience'
import AIRoastBattleExperience from './components/AIRoastBattleExperience'
import FuturisticGlassesExperience from './components/FuturisticGlassesExperience'
import FuturisticSkyscrapersExperience from './components/FuturisticSkyscrapersExperience'
import EpicFlightInteriorsExperience from './components/EpicFlightInteriorsExperience'
import DadJokesComediansExperience from './components/DadJokesComediansExperience'
import ProfessorXMindReadsExperience from './components/ProfessorXMindReadsExperience'
import AliensAncientIndiansExperience from './components/AliensAncientIndiansExperience'
import UselessPowersAssembledExperience from './components/UselessPowersAssembledExperience'
import GossipAuntiesExperience from './components/GossipAuntiesExperience'
import GossipingAuntiesPart2Experience from './components/GossipingAuntiesPart2Experience'
import AiUsingAiExperience from './components/AiUsingAiExperience'
import ChineseFairyCitiesExperience from './components/ChineseFairyCitiesExperience'
import GraveyardChroniclesExperience from './components/GraveyardChroniclesExperience'
import DaydreamFantasyExperience from './components/DaydreamFantasyExperience'
import AbsurdSpeechGeneratorExperience from './components/AbsurdSpeechGeneratorExperience'
import FuturisticSiegesExperience from './components/FuturisticSiegesExperience'
import ComedianChatSimulator from './components/ComedianChatSimulator'
import SpaceCafe2 from './components/SpaceCafe2';
import FantasyReality from './components/FantasyReality';
import LivingSpaceOracle from './components/LivingSpaceOracle';
import ResearchSynergyMap from './components/ResearchSynergyMap';
import HeroSection from './components/HeroSection';
import ExploreOverlay from './components/ExploreOverlay';
import CreativityLearningPage from './components/CreativityLearningPage'
import CreateExperiencePage from './components/CreateExperiencePage';
import HydrokineticPart1Page from './components/HydrokineticPart1Page';
import OvertonWindowCareersPage from './components/OvertonWindowCareersPage';
import HydrokineticPart2Page from './components/HydrokineticPart2Page';
import HinduMythologyAnimeExperience from './components/HinduMythologyAnimeExperience';
import TiberiusInterviewImprovedPage from './components/TiberiusInterviewImprovedPage';
import VideoGenerationPage from './components/VideoGenerationPage';
import './index.css'
import './styles/hub-redesign.css'


function App() {
  const [currentExperience, setCurrentExperience] = useState(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showCreativityPage, setShowCreativityPage] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showHydrokineticPart1, setShowHydrokineticPart1] = useState(false);
  const [showOvertonWindowCareers, setShowOvertonWindowCareers] = useState(false);
  const [showHydrokineticPart2, setShowHydrokineticPart2] = useState(false);
  const [showTiberiusInterviewImproved, setShowTiberiusInterviewImproved] = useState(false);
  const [showVideoGeneration, setShowVideoGeneration] = useState(false);
  const [showResearchSynergyMap, setShowResearchSynergyMap] = useState(false);
  const [clickCounts, setClickCounts] = useState({});
  const [showExploreOverlay, setShowExploreOverlay] = useState(false);

  // Load click counts from localStorage on mount
  useEffect(() => {
    const savedCounts = localStorage.getItem('fantasyworld-click-counts');
    if (savedCounts) {
      try {
        setClickCounts(JSON.parse(savedCounts));
      } catch (error) {
        console.error('Failed to parse click counts from localStorage:', error);
      }
    }
  }, []);


  // Check URL parameters for experience routing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const experienceParam = urlParams.get('experience');
    const creativityParam = urlParams.get('creativity');
    const createParam = urlParams.get('create');
    const overtonWindowCareersParam = urlParams.get('overton-window-careers');
    if (overtonWindowCareersParam === 'true') {
      setShowOvertonWindowCareers(true);
    }

    const hydrokineticPart1Param = urlParams.get('hydrokinetic-part1');
    if (hydrokineticPart1Param === 'true') {
      setShowHydrokineticPart1(true);
    }
    
    const hydrokineticPart2Param = urlParams.get('hydrokinetic-part2');
    if (hydrokineticPart2Param === 'true') {
      setShowHydrokineticPart2(true);
    }
    
    const tiberiusInterviewImprovedParam = urlParams.get('tiberius-interview-improved');
    if (tiberiusInterviewImprovedParam === 'true') {
      setShowTiberiusInterviewImproved(true);
    }
    
    const videoGenerationParam = urlParams.get('video-generation');
    if (videoGenerationParam === 'true') {
      setShowVideoGeneration(true);
    }
    
    if (experienceParam) {
      setCurrentExperience(experienceParam);
    }
    if (creativityParam === 'true') {
      setShowCreativityPage(true);
    }
    if (createParam === 'true') {
      setShowCreatePage(true);
    }
    const researchSynergyParam = urlParams.get('research-synergy');
    if (researchSynergyParam === 'true') {
      setShowResearchSynergyMap(true);
    }
  }, []);

  const startExperience = (experienceId) => {
    // Increment click count for this experience
    const newCounts = {
      ...clickCounts,
      [experienceId]: (clickCounts[experienceId] || 0) + 1
    };
    setClickCounts(newCounts);
    
    // Save to localStorage
    localStorage.setItem('fantasyworld-click-counts', JSON.stringify(newCounts));
    
    switch (experienceId) {
      case 'creativity-learning':
        window.open(`${window.location.origin}${window.location.pathname}?creativity=true`, '_blank');
        break;
      case 'overton-window-careers':
        window.open(`${window.location.origin}${window.location.pathname}?overton-window-careers=true`, '_blank');
        break;
      case 'hydrokinetic-part1':
        window.open(`${window.location.origin}${window.location.pathname}?hydrokinetic-part1=true`, '_blank');
        break;
      case 'hydrokinetic-part2':
        window.open(`${window.location.origin}${window.location.pathname}?hydrokinetic-part2=true`, '_blank');
        break;
      case 'tiberius-interview-improved':
        window.open(`${window.location.origin}${window.location.pathname}?tiberius-interview-improved=true`, '_blank');
        break;
      default:
        const experienceUrl = `${window.location.origin}${window.location.pathname}?experience=${experienceId}`;
        window.open(experienceUrl, '_blank');
    }
  }

  const stopExperience = () => {
    setCurrentExperience(null)
  }

  const handleInterviewGeneration = () => {
    setCurrentExperience('interview-generator')
  }

  const showCreativityLearning = () => {
    setShowCreativityPage(true)
  }

  const hideCreativityLearning = () => {
    setShowCreativityPage(false)
  }

  const hideCreatePage = () => {
    setShowCreatePage(false)
  }

  const hideOvertonWindowCareersPage = () => {
    setShowOvertonWindowCareers(false);
    const url = new URL(window.location);
    url.searchParams.delete('overton-window-careers');
    window.history.replaceState({}, '', url);
  };

  const hideHydrokineticPart1Page = () => {
    setShowHydrokineticPart1(false);
    // Update URL to remove the hydrokinetic-part1 parameter
    const url = new URL(window.location);
    url.searchParams.delete('hydrokinetic-part1');
    window.history.replaceState({}, '', url);
  };

  const hideHydrokineticPart2Page = () => {
    setShowHydrokineticPart2(false);
    // Update URL to remove the hydrokinetic-part2 parameter
    const url = new URL(window.location);
    url.searchParams.delete('hydrokinetic-part2');
    window.history.replaceState({}, '', url);
  };

  const hideTiberiusInterviewImprovedPage = () => {
    setShowTiberiusInterviewImproved(false);
    // Update URL to remove the tiberius-interview-improved parameter
    const url = new URL(window.location);
    url.searchParams.delete('tiberius-interview-improved');
    window.history.replaceState({}, '', url);
  };

  const hideVideoGenerationPage = () => {
    setShowVideoGeneration(false);
    // Update URL to remove the video-generation parameter
    const url = new URL(window.location);
    url.searchParams.delete('video-generation');
    window.history.replaceState({}, '', url);
  };

  // Creativity Learning Page routing
  if (showCreativityPage) {
    return <CreativityLearningPage onReturn={hideCreativityLearning} />
  }

  // Create Experience Page routing
  if (showCreatePage) {
    return <CreateExperiencePage onReturn={hideCreatePage} />;
  }

  if (showOvertonWindowCareers) {
    return <OvertonWindowCareersPage onReturn={hideOvertonWindowCareersPage} />;
  }

  if (showHydrokineticPart1) {
    return <HydrokineticPart1Page onReturn={hideHydrokineticPart1Page} />;
  }

  if (showHydrokineticPart2) {
    return <HydrokineticPart2Page onReturn={hideHydrokineticPart2Page} />;
  }

  if (showTiberiusInterviewImproved) {
    return <TiberiusInterviewImprovedPage onReturn={hideTiberiusInterviewImprovedPage} />;
  }

  if (showVideoGeneration) {
    return <VideoGenerationPage onReturn={hideVideoGenerationPage} />;
  }

  // Research Synergy Map routing
  if (showResearchSynergyMap) {
    return <ResearchSynergyMap 
      onClose={() => setShowResearchSynergyMap(false)} 
      onNavigateToExperience={(experienceId) => {
        setShowResearchSynergyMap(false);
        setCurrentExperience(experienceId);
      }}
    />;
  }


  // Experience routing
  if (currentExperience === 'space-cafe-observer') {
    return <SpaceCafeObserver onStop={stopExperience} />
  }

  if (currentExperience === 'hampi-bazaar') {
    return <HampiBazaarObserver onStop={stopExperience} />
  }

  if (currentExperience === 'interview-generator') {
    return <InterviewGenerator onStop={stopExperience} />
  }

  if (currentExperience === 'imaginary-interviews') {
    return <InterviewGenerator onStop={stopExperience} />
  }

  if (currentExperience === 'retro-futurism') {
    return <RetroFuturismExperience onStop={stopExperience} />
  }

  if (currentExperience === 'anachronism') {
    return <AnachronismExperience onStop={stopExperience} />
  }

  if (currentExperience === 'impossible-coexistence') {
    return <ImpossibleCoexistenceExperience onStop={stopExperience} />
  }

  if (currentExperience === 'scifi-questions') {
    return <SciFiQuestionsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'alternate-reality') {
    return <AlternateRealityExperience onStop={stopExperience} />
  }

  if (currentExperience === 'mind-bending-hindu') {
    return <MindBendingHinduStoriesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'yogic-mind') {
    return <YogicMindExperimentsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'plot-twist') {
    return <PlotTwistStoriesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'future-memories') {
    return <FutureMemoriesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'robotic-fusion') {
    return <RoboticFusionExperience onStop={stopExperience} />
  }

  if (currentExperience === 'ghibli-historical') {
    return <GhibliHistoricalTwistsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'bollywood-parody') {
    return <BollywoodParodyExperience onStop={stopExperience} />
  }

  if (currentExperience === 'underwater-civilizations') {
    return <UnderwaterCivilizationsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'ancient-cities') {
    return <AncientCitiesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'dnd-adventure') {
    return <DnDAdventureExperience onStop={stopExperience} />
  }

  if (currentExperience === 'orbital-megastructures') {
    return <OrbitalMegastructuresExperience onStop={stopExperience} />
  }

  if (currentExperience === 'fantasy-careers') {
    return <FantasyCareersExperience onStop={stopExperience} />
  }

  if (currentExperience === 'chanting-experiments') {
    return <ChantingExperimentsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'epic-dharmic-legends') {
    return <EpicDharmicLegendsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'space-wars') {
    return <SpaceWarsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'ancient-conversations') {
    return <AncientConversationsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'girl-in-red-dress') {
    return <GirlInRedDressExperience onStop={stopExperience} />
  }

  if (currentExperience === 'scifi-murder-mystery') {
    return <SciFiMurderMysteryExperience onStop={stopExperience} />
  }

  if (currentExperience === 'medieval-murder-mystery') {
    return <MedievalMurderMysteryExperience onStop={stopExperience} />
  }

  if (currentExperience === 'time-anomaly') {
    return <TimeAnomalyExperience onStop={stopExperience} />
  }

  if (currentExperience === 'epic-houses') {
    return <EpicHousesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'fantasy-trap') {
    return <FantasyTrapExperience onStop={stopExperience} />
  }

  if (currentExperience === 'dragons-over-cities') {
    return <DragonsOverCitiesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'ww2-cinematic-frames') {
    return <WW2CinematicFramesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'fat-to-fit') {
    return <FatToFitExperience onStop={stopExperience} />
  }

  if (currentExperience === 'portal-dimensions') {
    return <PortalDimensionsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'bangalore-traffic') {
    return <BangaloreTrafficExperience onStop={stopExperience} />
  }

  if (currentExperience === 'folding-cities') {
    return <FoldingCitiesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'dream-architecture') {
    return <DreamArchitectureExperience onStop={stopExperience} />
  }

  if (currentExperience === 'impossible-geometries') {
    return <ImpossibleGeometriesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'urban-origami') {
    return <UrbanOrigamiExperience onStop={stopExperience} />
  }

  if (currentExperience === 'paracosm-worlds') {
    return <ParacosmWorldsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'past-life-stories') {
    return <PastLifeStoriesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'ancient-weapons') {
    return <AncientWeaponsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'futuristic-weapons') {
    return <FuturisticWeaponsExperience onStop={stopExperience} />
  }

  if (currentExperience === 'human-hive-mind') {
    return <HumanHiveMindExperience onStop={stopExperience} />
  }

  if (currentExperience === 'character-portrait-transformer') {
    return <CharacterPortraitTransformerSimple onStop={stopExperience} />
  }

  if (currentExperience === 'ecumenopolis-explorer') {
    return <EcumenopolisExplorer onStop={stopExperience} />
  }

  if (currentExperience === 'runaway-destiny') {
    return <RunawayDestinyExperience onStop={stopExperience} />
  }

  if (currentExperience === 'duoverse') {
    return <DuoverseExperience onStop={stopExperience} />
  }

  if (currentExperience === 'fictional-empire') {
    return <FictionalEmpireExperience onStop={stopExperience} />
  }

  if (currentExperience === 'indian-skyscrapers') {
    return <IndianSkyscrapersExperience onStop={stopExperience} />
  }

  if (currentExperience === 'modern-mahabharata') {
    return <ModernMahabharataExperience onStop={stopExperience} />
  }

  if (currentExperience === 'indian-railway') {
    return <IndianRailwayExperience onStop={stopExperience} />
  }

  if (currentExperience === 'ridiculous-ventures') {
    return <RidiculousVenturesExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'epic-motor-homes') {
    return <EpicMotorHomesExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'about') {
    return <AboutPage onBack={stopExperience} />;
  }

  if (currentExperience === 'deck') {
    return <ShowcaseDeck onClose={stopExperience} />;
  }


  if (currentExperience === 'useless-powers') {
    return <UselessPowersExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'portal-doors') {
    return <PortalDoorsExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'fantasy-skyscrapers') {
    return <FantasySkyscrapersExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'futuristic-glasses') {
    return <FuturisticGlassesExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'futuristic-skyscrapers') {
    return <FuturisticSkyscrapersExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'epic-flight-interiors') {
    return <EpicFlightInteriorsExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'dad-jokes-comedians') {
    return <DadJokesComediansExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'professor-x-mind-reads') {
    return <ProfessorXMindReadsExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'aliens-ancient-indians') {
    return <AliensAncientIndiansExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'useless-powers-assembled') {
    return <UselessPowersAssembledExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'gossip-aunties') {
    return <GossipAuntiesExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'gossiping-aunties-part2') {
    return <GossipingAuntiesPart2Experience onStop={stopExperience} />;
  }

  if (currentExperience === 'ai-using-ai') {
    return <AiUsingAiExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'chinese-fairy-cities') {
    return <ChineseFairyCitiesExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'graveyard-chronicles') {
    return <GraveyardChroniclesExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'daydream-fantasy') {
    return <DaydreamFantasyExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'indian-teachers') {
    return <IndianTeachersExperience onStop={stopExperience} />
  }

  if (currentExperience === 'absurd-speech-generator') {
    return <AbsurdSpeechGeneratorExperience onStop={stopExperience} />
  }

  if (currentExperience === 'futuristic-sieges') {
    return <FuturisticSiegesExperience onStop={stopExperience} />
  }

  if (currentExperience === 'comedian-chat-simulator') {
    return <ComedianChatSimulator onStop={stopExperience} />
  }

  if (currentExperience === 'space-cafe-2') {
    return <SpaceCafe2 onStop={stopExperience} />;
  }

  if (currentExperience === 'fantasy-reality') {
    return <FantasyReality onStop={stopExperience} />;
  }

  if (currentExperience === 'living-space-oracle') {
    return <LivingSpaceOracle onStop={stopExperience} />;
  }

  if (currentExperience === 'alternate-movie-endings') {
    return <AlternateMovieEndingsExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'funny-ai-chatbox') {
    return <FunnyAIChatboxExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'ai-roast-battle') {
    return <AIRoastBattleExperience onStop={stopExperience} />;
  }

  if (currentExperience === 'hindu-mythology-anime') {
    return <HinduMythologyAnimeExperience onStop={stopExperience} />;
  }

  return (
    <div className="hub-landing">
      <div className="stars-background"></div>

      {/* SECTION 1 — Hero */}
      <HeroSection
        onExplore={() => setShowExploreOverlay(true)}
        onLearn={() => window.open(`${window.location.origin}${window.location.pathname}?creativity=true`, '_blank')}
        onCreate={() => window.open(`${window.location.origin}${window.location.pathname}?create=true`, '_blank')}
        onResearch={() => setShowResearchSynergyMap(true)}
        onAbout={() => window.open(`${window.location.origin}${window.location.pathname}?experience=about`, '_blank')}
      />
      <ExploreOverlay
        open={showExploreOverlay}
        experiences={getAvailableExperiences()}
        onSelect={(id) => { setShowExploreOverlay(false); startExperience(id); }}
        onClose={() => setShowExploreOverlay(false)}
      />

    </div>
  )
}

export default App
