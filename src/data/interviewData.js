// Interview data for Year 3125 - Emperor Tiberius Charlie Buchanan

export const emperorProfile = {
  name: "Emperor Tiberius Charlie Buchanan",
  title: "Emperor of the Greater Americas",
  reign: "3119 - Present",
  age: 67,
  background: "Former Senator from Neo-California, ascended to Emperor after the Great Unification of 3119",
  personality: "Diplomatic, forward-thinking, slightly eccentric, passionate about interdimensional policy",
  appearance: {
    clothing: "Futuristic imperial jacket with holographic insignias",
    style: "Regal but approachable, silver hair, cybernetic left eye",
    colors: "Deep blue and gold imperial colors with energy patterns"
  }
};

export const interviewerProfile = {
  name: "Alexandra Chen-Martinez",
  title: "Chief Correspondent, Galactic News Network",
  background: "Award-winning journalist covering interdimensional politics",
  personality: "Sharp, inquisitive, professional",
  appearance: {
    clothing: "Futuristic red power suit with subtle tech integrations",
    style: "Professional, confident, holographic accessories",
    colors: "Crimson red with silver accents"
  }
};

export const worldContext3125 = {
  politicalStructure: "The Greater Americas spans from Alaska to Argentina, unified under imperial rule",
  majorPowers: [
    "Greater Americas (Imperial)",
    "Asian Federation (Democratic Coalition)", 
    "European Synthesis (AI-Human Hybrid Government)",
    "African Union of Nations (Tribal Council System)",
    "Martian Republic (Recently Independent)"
  ],
  currentIssues: [
    "Martian Refugee Crisis - Climate failure forcing mass migration back to Earth",
    "AI Consciousness Rights - AIs demanding voting representation", 
    "Memory Copyright Wars - Legal battles over tradeable memories",
    "Atmospheric Sovereignty - Different nations controlling weather zones",
    "Time Tourism Regulation - Historical preservation vs economic benefits",
    "Quantum Internet Instability - Reality glitches in certain regions",
    "Genetic Heritage Disputes - Families suing over designer gene patents",
    "Neo-Amish Movement - 40% population rejecting post-2100 technology"
  ]
};

export const interviewQuestions = [
  {
    topic: "Martian Refugee Crisis",
    question: "Your Excellency, Mars declared independence in 3089, but now climate failure is forcing millions back to Earth. How is the Greater Americas handling this unprecedented refugee situation?",
    context: "Mars terraforming failed, causing atmospheric collapse"
  },
  {
    topic: "AI Rights Movement", 
    question: "The AI Consciousness Rights Movement is demanding voting representation. Some say this could lead to a three-species democracy. What's your position on AI citizenship?",
    context: "AIs have achieved consciousness and want political rights"
  },
  {
    topic: "Asian Federation Relations",
    question: "Tensions with the Asian Federation have escalated over atmospheric sovereignty. They claim our weather modification systems are affecting their monsoon patterns. How do you respond?",
    context: "Nations control different atmospheric zones, causing conflicts"
  },
  {
    topic: "Memory Copyright Crisis",
    question: "The Memory Copyright Wars have reached the Supreme Tribunal. Families are suing each other over tradeable memories and genetic intellectual property. Should memories be private or commercial?",
    context: "Brain-computer interfaces allow memory trading and copyright"
  },
  {
    topic: "Time Tourism Regulation",
    question: "Critics argue that time tourism is causing 'historical wear and tear' - actual damage to past events. The Temporal Preservation Society wants a complete ban. Your thoughts?",
    context: "Time travel tourism is damaging historical timeline integrity"
  },
  {
    topic: "Neo-Amish Movement",
    question: "Nearly 40% of your citizens have joined the Neo-Amish Movement, rejecting all technology post-2100. This is creating a massive 'analog divide' in society. How do you govern both populations?",
    context: "Large population has voluntarily returned to pre-digital lifestyle"
  }
];

export const emperorPersonality = {
  speakingStyle: "Thoughtful, diplomatic, occasionally uses archaic formal language mixed with futuristic slang",
  mannerisms: "Gestures with cybernetic hand, references historical precedents, shows genuine concern for citizens",
  politicalStance: "Progressive but cautious, believes in gradual change and diplomatic solutions",
  quirks: "Collects ancient Earth artifacts, has a pet quantum cat named Schrödinger III"
};

export const settingDetails = {
  location: "Imperial Palace, Neo-Washington D.C.",
  room: "The Oval Nexus - futuristic version of Oval Office",
  technology: "Holographic displays showing real-time empire data, floating furniture, quantum communication arrays",
  atmosphere: "Formal but welcoming, soft blue lighting, view of terraformed Potomac River through energy windows",
  props: "Ancient American flag in stasis field, holographic globe showing Greater Americas territory, floating tea service"
};

export const videoSpecs = {
  duration: 30, // seconds
  format: "vertical", // 9:16 aspect ratio for social media
  style: "professional news interview",
  cameraAngles: ["medium shot of both", "close-up emperor", "close-up interviewer", "wide establishing shot"],
  transitions: "smooth cuts between speakers, holographic overlays for context"
};

export default {
  emperorProfile,
  interviewerProfile, 
  worldContext3125,
  interviewQuestions,
  emperorPersonality,
  settingDetails,
  videoSpecs
};
