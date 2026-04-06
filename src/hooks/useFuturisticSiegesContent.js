import { useState, useCallback } from 'react';

const useFuturisticSiegesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateSiegeScenario = useCallback(async () => {
    const cities = [
      { name: 'New York', year: '2100', climate: 'flooded Manhattan, rising seas', tech: 'vertical fortress-cities, amphibious warfare' },
      { name: 'Bangalore', year: '2050', climate: 'tech capital expansion', tech: 'AI-controlled defenses, cyber warfare' },
      { name: 'London', year: '2090', climate: 'Thames barriers failed, flooded districts', tech: 'amphibious assault craft, underwater bases' },
      { name: 'Tokyo', year: '2085', climate: 'cyberpunk megacity', tech: 'drone swarms, neon-lit battlefields' },
      { name: 'Istanbul', year: '2095', climate: 'Bosphorus bridge warfare', tech: 'ancient meets ultra-modern defenses' },
      { name: 'Lagos', year: '2075', climate: 'coastal megacity, climate refugees', tech: 'resource wars, floating platforms' },
      { name: 'Mumbai', year: '2080', climate: 'monsoon warfare, vertical slums', tech: 'weather-adapted combat, elevated fortresses' },
      { name: 'Phoenix', year: '2070', climate: 'desert warfare, water scarcity', tech: 'solar-powered weapons, underground networks' }
    ];

    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    const scenarioPrompt = `Create a detailed futuristic siege scenario for ${randomCity.name} in the year ${randomCity.year}.

    Setting: ${randomCity.climate}
    Technology: ${randomCity.tech}

    Generate a JSON object with these fields:
    - city: "${randomCity.name}"
    - year: "${randomCity.year}"
    - siegeTitle: A dramatic title for this specific siege
    - attackingForce: Who is attacking and why
    - defendingForce: Who is defending and their advantages
    - keyTechnology: 3 specific futuristic military technologies involved
    - climateFactors: How climate change affects this siege
    - tacticalSituation: The current state of the siege

    Focus on:
    - Advanced military technology (drones, energy weapons, AI systems)
    - Climate change impacts on warfare
    - Urban warfare in mega-cities
    - Human drama amid the conflict
    - Realistic future military tactics

    Return ONLY the JSON object, no other text.`;

    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a creative military strategist specializing in futuristic warfare scenarios. Generate detailed siege scenarios with advanced technology and climate impacts. Always return valid JSON.'
            },
            {
              role: 'user',
              content: scenarioPrompt
            }
          ],
          max_tokens: 400,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`Scenario generation failed: ${response.status}`);
      }

      const data = await response.json();
      const scenarioText = data.choices[0].message.content;
      
      // Try to parse JSON, fallback to manual extraction if needed
      try {
        return JSON.parse(scenarioText);
      } catch {
        // Fallback scenario if JSON parsing fails
        return {
          city: randomCity.name,
          year: randomCity.year,
          siegeTitle: `The Siege of ${randomCity.name} ${randomCity.year}`,
          attackingForce: 'Climate Coalition Forces',
          defendingForce: 'Megacity Defense Network',
          keyTechnology: ['Drone swarms', 'Energy shields', 'AI tactical systems'],
          climateFactors: randomCity.climate,
          tacticalSituation: 'Urban warfare in progress'
        };
      }
    } catch (error) {
      console.error('Scenario generation failed:', error);
      throw new Error('Failed to generate siege scenario');
    }
  }, []);

  const generateSiegeStory = useCallback(async (scenario) => {
    const prompt = `Write a 200-word immersive war correspondent report about the siege of ${scenario.city} in ${scenario.year}.

    Siege: ${scenario.siegeTitle}
    Attacking Force: ${scenario.attackingForce}
    Defending Force: ${scenario.defendingForce}
    Key Technology: ${scenario.keyTechnology.join(', ')}
    Climate Factors: ${scenario.climateFactors}
    Tactical Situation: ${scenario.tacticalSituation}

    Write from the perspective of a war correspondent embedded with the forces. Include:
    - Vivid descriptions of futuristic warfare
    - Specific details about advanced military technology
    - How climate change impacts the battle
    - Human stories and emotions amid the conflict
    - Tactical analysis of urban warfare
    - Sensory details (sounds, sights, atmosphere)

    Create an engaging, immersive narrative that makes the reader feel like they're witnessing this futuristic siege firsthand. Focus on both the epic scale of the conflict and the personal human drama.

    Write exactly 200 words.`;

    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a master war correspondent specializing in futuristic military conflicts. Create immersive, detailed reports that capture both the epic scale and human drama of siege warfare.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Story generation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Story generation failed:', error);
      throw new Error('Failed to generate siege story');
    }
  }, []);

  const generateSiegeImage = useCallback(async (scenario) => {
    const imagePrompt = `Futuristic siege of ${scenario.city} in ${scenario.year}, ${scenario.climateFactors}, ${scenario.keyTechnology.join(', ')}, epic urban warfare, dramatic military conflict, advanced technology, climate-changed environment, cinematic lighting, detailed digital art, war photography style, dystopian atmosphere`;

    try {
      console.log('🎨 Generating futuristic siege image...');
      
      const response = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          negative_prompt: 'peaceful, calm, modern day, contemporary, blurry, low quality, cartoon, anime',
          width: 1024,
          height: 1024,
          num_inference_steps: 20,
          guidance_scale: 7.5
        })
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      return {
        url: imageUrl,
        prompt: imagePrompt,
        description: `The siege of ${scenario.city} in ${scenario.year}, featuring ${scenario.keyTechnology.slice(0, 2).join(' and ')} amid ${scenario.climateFactors}.`
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error('Failed to generate siege image');
    }
  }, []);

  const generateFuturisticSiegeContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🏙️ Generating futuristic siege scenario...');
      const scenario = await generateSiegeScenario();
      
      console.log('📝 Generating siege story...');
      const story = await generateSiegeStory(scenario);
      
      console.log('🎨 Generating siege image...');
      const image = await generateSiegeImage(scenario);

      const content = {
        title: scenario.siegeTitle,
        era: `${scenario.year} Siege`,
        location: scenario.city,
        story: story,
        image: image,
        scenario: scenario
      };

      console.log('✅ Futuristic siege content generated successfully');
      setIsGenerating(false);
      return content;

    } catch (error) {
      console.error('❌ Siege content generation failed:', error);
      setError(error.message);
      setIsGenerating(false);
      throw error;
    }
  }, [generateSiegeScenario, generateSiegeStory, generateSiegeImage]);

  return {
    generateFuturisticSiegeContent,
    isGenerating,
    error
  };
};

export default useFuturisticSiegesContent;
