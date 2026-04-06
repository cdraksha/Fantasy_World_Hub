import { useState, useCallback } from 'react';
import axios from 'axios';

const useRetroFuturismContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateScenario = useCallback(async () => {
    const scenarioPrompt = `Create a completely original retro-futuristic scenario - how people from a specific past era imagined what the year 2000+ would look like.

    Generate a JSON object with these fields:
    - pastEra: A specific past era/decade when people were imagining the future (e.g., "1940s America", "1890s Victorian England")
    - futureYear: The future year they were imagining (e.g., "2000", "2050", "2100")
    - location: A futuristic location name as imagined by that past era
    - theme: The aesthetic/philosophical theme of that era's future vision
    - elements: An array of 5 specific technologies/concepts that past era would have imagined for the future

    IMPORTANT: This should be what people in the PAST thought the FUTURE would look like, not what the past era itself looked like.

    Examples of what I want:
    - "1950s Americans imagining the year 2000 with atomic-powered flying cars, robot housekeepers, and food pills"
    - "1920s people imagining 2050 with art deco rocket ships, pneumatic tube highways, and mechanical servants"
    - "1960s hippies imagining 2100 with peace-powered cities, love energy generators, and cosmic consciousness networks"

    Focus on the technological optimism, design aesthetics, and social assumptions of that past era projected into their imagined future.

    Return ONLY the JSON object, no other text.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative genius specializing in retro-futuristic scenarios. Generate completely original visions of how different historical eras imagined their future. Always return valid JSON.'
          },
          {
            role: 'user',
            content: scenarioPrompt
          }
        ],
        max_tokens: 300,
        temperature: 1.0
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const scenarioText = response.data.choices[0].message.content;
      return JSON.parse(scenarioText);
    } catch (error) {
      console.error('Scenario generation failed:', error);
      throw new Error('Failed to generate retro-futuristic scenario');
    }
  }, []);

  const generateStory = useCallback(async (scenario) => {
    const prompt = `Write a 250-word immersive retro-futuristic story set in ${scenario.location} in the year ${scenario.futureYear}, as imagined by people from ${scenario.pastEra}.

    Theme: ${scenario.theme}
    Include these elements: ${scenario.elements.join(', ')}

    IMPORTANT: This story should reflect how people from ${scenario.pastEra} imagined the future year ${scenario.futureYear} would look and feel. Capture their technological optimism, design aesthetics, and social assumptions.

    Create 2-3 main personas with names, backgrounds, and unique perspectives living in this imagined future. Show their daily experiences in this retro-futuristic world. Use vivid sensory details and dialogue. Make the reader feel like they're experiencing this "future that never was."

    Focus on:
    - Personal experiences and emotions of the characters living in this imagined future
    - Detailed descriptions of the retro-futuristic technology as envisioned by ${scenario.pastEra}
    - The optimism, wonder, and design aesthetics of ${scenario.pastEra}'s vision of the future
    - How ordinary people would live in this extraordinary imagined future world
    - Specific interactions with the futuristic technology as ${scenario.pastEra} people would have conceived it

    Write in an engaging, immersive style that captures the nostalgic charm of ${scenario.pastEra}'s dreams of tomorrow.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master storyteller specializing in retro-futuristic narratives. Create immersive, detailed stories that capture the essence of how past generations imagined the future.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Story generation failed:', error);
      throw new Error('Failed to generate story');
    }
  }, []);

  const generateImage = useCallback(async (scenario, storyTitle) => {
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    const imagePrompt = `Retro-futuristic scene: ${scenario.location} in the year ${scenario.futureYear} as imagined by ${scenario.pastEra}, ${scenario.theme} aesthetic, featuring ${scenario.elements.slice(0, 3).join(', ')}, vintage sci-fi art style, detailed illustration, cinematic lighting, nostalgic atmosphere, "future that never was" concept art`;

    try {
      console.log('🎨 Generating retro-futuristic image...');
      
      const response = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: imagePrompt,
          negative_prompt: 'modern technology, contemporary design, smartphones, current fashion, realistic photography, blurry, low quality',
          aspect_ratio: '4:3'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      
      return {
        url: imageUrl,
        prompt: imagePrompt,
        description: `A retro-futuristic vision of ${scenario.location} in ${scenario.futureYear} as imagined by ${scenario.pastEra}, showcasing ${scenario.theme} design philosophy.`
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error('Failed to generate retro-futuristic image');
    }
  }, []);

  const generateRetroFuturisticContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate completely original scenario using ChatGPT
      console.log('🧠 Generating original retro-futuristic scenario...');
      const scenario = await generateScenario();
      
      console.log('📝 Generating retro-futuristic story...');
      const story = await generateStory(scenario);
      
      // Extract title from story (first line or create one)
      const storyLines = story.split('\n');
      const title = storyLines[0].length < 100 ? storyLines[0] : `Tales from ${scenario.location}`;
      
      console.log('🎨 Generating retro-futuristic image...');
      const image = await generateImage(scenario, title);

      const content = {
        title: title.replace(/^#+\s*/, ''), // Remove markdown headers
        era: `${scenario.pastEra} → ${scenario.futureYear}`,
        location: scenario.location,
        story: story,
        image: image,
        scenario: scenario
      };

      console.log('✅ Retro-futuristic content generated successfully');
      setIsGenerating(false);
      return content;

    } catch (error) {
      console.error('❌ Content generation failed:', error);
      setError(error.message);
      setIsGenerating(false);
      throw error;
    }
  }, [generateScenario, generateStory, generateImage]);

  return {
    generateRetroFuturisticContent,
    isGenerating,
    error
  };
};

export default useRetroFuturismContent;
