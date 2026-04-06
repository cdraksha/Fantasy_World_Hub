import { useState } from 'react';
import { generateForceGrid, generateRealityDataFromForce } from '../data/forceMapping';
import useOpenAI from './useOpenAI';
import useImageGeneration from './useImageGeneration';

const useFantasyRealityContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const { generateSpeech } = useOpenAI();
  const { generateImage } = useImageGeneration();

  const generateFantasyRealityContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Pick random element
      const allForces = ['Fire', 'Water', 'Air', 'Space', 'Time', 'Gravity', 'Mind', 'Body', 'Soul'];
      const randomForce = allForces[Math.floor(Math.random() * allForces.length)];
      
      // Generate reality data
      const reality = generateRealityDataFromForce(randomForce);
      
      // Generate story
      const story = await generateFantasyStory(reality);
      
      // Generate image
      const image = await generateFantasyImage(reality);

      return {
        force: randomForce,
        reality: reality,
        story: story,
        image: image,
        title: `${randomForce} Reality`,
        description: `A ${randomForce}-dominated reality where ${reality.governingLaw?.toLowerCase()}`
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate 200-word fantasy story
  const generateFantasyStory = async (reality) => {
    const { tier, governingLaw, force } = reality;

    const prompt = `
      Write exactly 200 words about a fantasy reality where ${force} is the dominant element.

      This is ${reality.worldType} where the main rule is: ${governingLaw}

      Create an immersive story describing this ${force}-based reality. Include:
      - What this world looks like and feels like
      - How people live in this ${force}-dominated reality
      - How ${governingLaw} shapes everything in this world
      - Specific examples of how ${force} manifests everywhere
      - What makes this place magical and unique

      Write it as a vivid, descriptive fantasy story that makes the reader feel like they're experiencing this reality. Make it exactly 200 words.
    `;

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
            content: 'You are a master fantasy storyteller specializing in elemental realities. Create immersive, detailed stories that transport readers to magical worlds dominated by specific forces.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`Story generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Generate fantasy image
  const generateFantasyImage = async (reality) => {
    const { tier, governingLaw, force } = reality;
    
    const moodMap = {
      'Fire': 'intense, burning, passionate',
      'Water': 'flowing, emotional, adaptive', 
      'Air': 'ethereal, swift, transformative',
      'Space': 'vast, infinite, mysterious',
      'Time': 'temporal, cyclical, eternal',
      'Gravity': 'heavy, binding, inevitable',
      'Mind': 'cerebral, illusory, complex',
      'Body': 'physical, visceral, grounded',
      'Soul': 'spiritual, transcendent, pure'
    };

    const forceMood = moodMap[force];

    const prompt = `
      Cinematic fantasy scene in ${reality.worldType}.
      Visual representation of "${governingLaw}".
      Atmospheric lighting, epic composition, high detail.
      Emotional tone: ${forceMood}.
      Fantasy realism, mythic atmosphere, no text overlays.
      Still frame from epic fantasy film, dramatic perspective.
      Focus on ${force} energy and essence.
    `;

    return await generateImage(prompt, 'fantasy-reality', Date.now());
  };

  return {
    generateFantasyRealityContent,
    isGenerating,
    error
  };
};

export default useFantasyRealityContent;
