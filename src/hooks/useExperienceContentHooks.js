// Dynamic hook registry for experience content generation
import useGossipingAuntiesPart2Content from './useGossipingAuntiesPart2Content';
import useGossipAuntiesContent from './useGossipAuntiesContent';
import useDragonsOverCitiesContent from './useDragonsOverCitiesContent';
import useBangaloreTrafficContent from './useBangaloreTrafficContent';
import useEpicFlightInteriorsContent from './useEpicFlightInteriorsContent';
import useFuturisticSkyscrapersContent from './useFuturisticSkyscrapersContent';
import useFuturisticGlassesContent from './useFuturisticGlassesContent';
import useFantasySkyscrapersContent from './useFantasySkyscrapersContent';
import useUselessPowersContent from './useUselessPowersContent';
import useEpicMotorHomesContent from './useEpicMotorHomesContent';
import useAiUsingAiContent from './useAiUsingAiContent';
import useChineseFairyCitiesContent from './useChineseFairyCitiesContent';
import useGraveyardChroniclesContent from './useGraveyardChroniclesContent';
import useDaydreamFantasyContent from './useDaydreamFantasyContent';
import useIndianTeachersContent from './useIndianTeachersContent';
import useHydrokineticPart1Content from './useHydrokineticPart1Content';
import useHydrokineticPart2Content from './useHydrokineticPart2Content';
import useTiberiusInterviewImprovedContent from './useTiberiusInterviewImprovedContent';
import useAbsurdSpeechGeneratorContent from './useAbsurdSpeechGeneratorContent';
import useFuturisticSiegesContent from './useFuturisticSiegesContent';
import useFantasyRealityContent from './useFantasyRealityContent';
import usePortalDoorsContent from './usePortalDoorsContent';

// Map experience IDs to their corresponding hooks
export const EXPERIENCE_HOOKS = {
  'gossiping-aunties-part2': useGossipingAuntiesPart2Content,
  'gossip-aunties': useGossipAuntiesContent,
  'dragons-over-cities': useDragonsOverCitiesContent,
  'bangalore-traffic': useBangaloreTrafficContent,
  'epic-flight-interiors': useEpicFlightInteriorsContent,
  'futuristic-skyscrapers': useFuturisticSkyscrapersContent,
  'futuristic-glasses': useFuturisticGlassesContent,
  'fantasy-skyscrapers': useFantasySkyscrapersContent,
  'useless-powers': useUselessPowersContent,
  'epic-motor-homes': useEpicMotorHomesContent,
  'ai-using-ai': useAiUsingAiContent,
  'chinese-fairy-cities': useChineseFairyCitiesContent,
  'graveyard-chronicles': useGraveyardChroniclesContent,
  'daydream-fantasy': useDaydreamFantasyContent,
  'indian-teachers': useIndianTeachersContent,
  'hydrokinetic-part1': useHydrokineticPart1Content,
  'hydrokinetic-part2': useHydrokineticPart2Content,
  'tiberius-interview-improved': useTiberiusInterviewImprovedContent,
  'absurd-speech-generator': useAbsurdSpeechGeneratorContent,
  'futuristic-sieges': useFuturisticSiegesContent,
  'fantasy-reality': useFantasyRealityContent,
  'portal-doors': usePortalDoorsContent,
  // Add more mappings as needed
};

// Get the appropriate hook for an experience
export const getExperienceHook = (experienceId) => {
  return EXPERIENCE_HOOKS[experienceId] || null;
};

// Check if an experience has a content generation hook
export const hasContentHook = (experienceId) => {
  return experienceId in EXPERIENCE_HOOKS;
};
