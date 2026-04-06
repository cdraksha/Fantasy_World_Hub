import { useState, useCallback } from 'react';

const useOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState({});

  const generateSpeech = useCallback(async (prompt, context, theme = 'space-cafe') => {
    setIsLoading(true);
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      setIsLoading(false);
      return getTherapeuticFallback(theme, context);
    }

    try {
      // Create therapeutic system prompt based on theme
      let systemPrompt;
      
      if (theme === 'hampi-bazaar') {
        systemPrompt = `You are creating a deeply immersive experience set in the Hampi bazaar during the Vijayanagara Empire in 1458 AD. 

Generate a peaceful, second-person observation that makes the user feel like they are actually experiencing the historic Hampi bazaar. Use "you" to create personal, imaginative scenarios. Vary the user's position and activities - they might be walking, standing, leaning, observing from different vantage points, or moving through different areas of the bazaar.

Context: ${context.situation || 'Journey to 1458 Hampi'}
Characters present: ${context.characters || 'Various historical figures'}
Atmosphere: ${context.atmosphere || 'Warm Karnataka sun, stone architecture, temple bells'}

Create a response in this format:
OBSERVATION: [A concise, immersive second-person description with varied positioning (walking, standing, leaning, etc.) and different areas of the bazaar. Focus on sensory details like warm stone, cardamom scents, temple sounds, and peaceful interactions with historical characters. Keep it under 100 words and make it feel real and calming.]

IMAGE_PROMPT: [A detailed prompt for generating a historical illustration of the scene described]

Keep the observation peaceful, concise (under 100 words), varied in perspective, and historically accurate to 1458 Vijayanagara Empire. No modern elements.`;
      } else {
        systemPrompt = `You are creating a deeply immersive experience set in a peaceful space station cafe. 

Generate a calming, second-person observation that makes the user feel like they are actually sitting in the cosmic cafe. Use "you" to create personal, imaginative scenarios.

Context: ${context.situation || 'Space cafe experience'}
Characters present: ${context.characters || 'Various space travelers'}
Atmosphere: ${context.atmosphere || 'Peaceful cosmic environment with stars visible'}

Create a response in this format:
OBSERVATION: [A concise, immersive second-person description of being in the space cafe, focusing on sensory details like cosmic views, gentle sounds, and peaceful interactions. Keep it under 100 words and make it feel real and calming.]

IMAGE_PROMPT: [A detailed prompt for generating a space cafe scene illustration]

Keep the observation peaceful, concise (under 100 words), and immersive.`;
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: prompt || 'Create a peaceful therapeutic observation for this moment.'
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || getTherapeuticFallback(theme, context);

      setIsLoading(false);
      return aiResponse;

    } catch (error) {
      console.error('OpenAI API error:', error);
      setIsLoading(false);
      return getTherapeuticFallback(theme, context);
    }
  }, []);

  const getTherapeuticFallback = (theme, context) => {
    if (theme === 'hampi-bazaar') {
      const hampiFallbacks = [
        `OBSERVATION: You walk through the bustling Hampi bazaar as the warm Karnataka sun bathes the stone architecture in golden light. A royal merchant displays precious gems while temple bells chime in the distance. The scent of cardamom and sandalwood fills the air as you pause to watch a master sculptor carving intricate patterns into a granite pillar. Peaceful voices of traders echo through the ancient streets.

IMAGE_PROMPT: Historic Hampi bazaar scene with temple architecture, merchants in traditional attire, stone pillars, and warm golden lighting`,

        `OBSERVATION: You stand beneath towering stone gopurams, observing the rhythmic work of craftsmen in the royal quarter. A court musician tunes his veena while spice traders arrange colorful displays of pepper and turmeric. The afternoon breeze carries the sound of temple ceremonies as a silk weaver demonstrates her art to curious onlookers. Ancient stones tell stories of the Vijayanagara Empire's glory.

IMAGE_PROMPT: 15th century Hampi royal quarter with musicians, spice traders, and temple architecture`,

        `OBSERVATION: You lean against a carved stone pillar, watching temple dancers practice their sacred movements in the courtyard. A temple priest offers blessings to pilgrims while the aroma of incense mingles with fresh jasmine garlands. Royal guards patrol peacefully as merchants from distant lands discuss trade routes. The golden hour light transforms the ancient bazaar into a living tapestry of history.

IMAGE_PROMPT: Hampi temple courtyard with dancers, priests, pilgrims, and traditional architecture`
      ];
      
      return hampiFallbacks[Math.floor(Math.random() * hampiFallbacks.length)];
    } else {
      const spaceFallbacks = [
        `OBSERVATION: You settle into a comfortable chair by the large observation window, watching distant galaxies slowly rotate in the cosmic dance. The gentle hum of life support creates a soothing background as fellow travelers share quiet conversations nearby. Soft nebula glow paints everything in ethereal colors while you sip your drink and feel the peaceful weightlessness of space.

IMAGE_PROMPT: Peaceful space station cafe with large windows showing galaxies and nebulae`,

        `OBSERVATION: You find yourself at a quiet corner table, mesmerized by the view of a nearby asteroid field glittering like diamonds in starlight. The cafe's ambient lighting creates a warm, cozy atmosphere as space travelers from different worlds share stories and laughter. The gentle station rotation provides subtle movement as shooting stars streak past the windows.

IMAGE_PROMPT: Cozy space cafe interior with asteroid field view and diverse space travelers`,

        `OBSERVATION: You lean back in your chair, watching Earth slowly rotate below through transparent floor panels. The blue marble of your home planet fills you with peace and wonder as other cafe patrons quietly enjoy the cosmic view. Soft instrumental music plays while the gentle hiss of air recyclers reminds you of this technological marvel.

IMAGE_PROMPT: Space station cafe with Earth view through floor panels and peaceful atmosphere`
      ];
      
      return spaceFallbacks[Math.floor(Math.random() * spaceFallbacks.length)];
    }
  };

  const clearHistory = useCallback((characterId) => {
    setConversationHistory(prev => {
      const updated = { ...prev };
      delete updated[characterId];
      return updated;
    });
  }, []);

  return {
    generateSpeech,
    isLoading,
    clearHistory,
    conversationHistory
  };
};

export default useOpenAI;
