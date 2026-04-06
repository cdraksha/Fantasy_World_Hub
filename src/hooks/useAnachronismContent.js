import { useState, useCallback } from 'react';
import axios from 'axios';

const useAnachronismContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateScenario = useCallback(async () => {
    const scenarioPrompt = `Create a completely original, mind-bending anachronistic scenario where modern or future technology exists seamlessly in a historical period.

    Generate a JSON object with these fields:
    - historicalPeriod: A specific historical period with year (e.g., "Ancient Babylon, 605 BC")
    - location: A specific historical location 
    - modernTech: A specific modern/future technology category
    - concept: A one-sentence description of the anachronistic scenario
    - elements: An array of 5 specific anachronistic elements that blend the tech with the historical period

    Make it completely unique and mind-bending. Think of combinations that have never been done before. Be creative with both the historical period and the technology.

    Examples of creativity level wanted:
    - "Neanderthals using neural implants for collective consciousness during ice age hunts"
    - "Byzantine monks livestreaming illuminated manuscript creation on Twitch"
    - "Mayan astronomers using quantum computers to predict interdimensional eclipses"

    Return ONLY the JSON object, no other text.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative genius specializing in anachronistic scenarios. Generate completely original, mind-bending combinations of historical periods and modern technology. Always return valid JSON.'
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
      throw new Error('Failed to generate anachronistic scenario');
    }
  }, []);

  const generateStory = useCallback(async (scenario) => {
    const prompt = `Write a mind-bending 250-word anachronistic story set in ${scenario.location} during ${scenario.historicalPeriod}. 

    CORE CONCEPT: ${scenario.concept}
    Modern Technology: ${scenario.modernTech}
    Anachronistic Elements: ${scenario.elements.join(', ')}

    Create 2-3 main characters with period-appropriate names who interact naturally with this impossibly advanced technology as if it's always existed in their time. The story should be:

    - MIND-BENDING: Make readers question reality and time itself
    - IMMERSIVE: Rich sensory details of both historical setting and futuristic tech
    - PARADOXICAL: Show how modern tech would fundamentally change historical events
    - CHARACTER-DRIVEN: Focus on personal experiences and relationships
    - DETAILED: Specific interactions with the anachronistic technology

    The tone should be both historically authentic and wildly imaginative. Make it feel like this technology has always been part of their world, not like it was suddenly introduced.

    Write in an engaging, immersive style that makes the impossible feel inevitable.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master storyteller specializing in anachronistic narratives that bend time and reality. Create immersive, mind-bending stories where modern technology exists seamlessly in historical periods, making the impossible feel natural and inevitable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Story generation failed:', error);
      throw new Error('Failed to generate anachronistic story');
    }
  }, []);

  const generateImage = useCallback(async (scenario, storyTitle) => {
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    const imagePrompt = `Anachronistic scene: ${scenario.modernTech} seamlessly integrated into ${scenario.historicalPeriod} at ${scenario.location}, ${scenario.concept}, detailed historical accuracy mixed with futuristic technology, mind-bending temporal paradox, cinematic lighting, photorealistic, impossible but believable`;

    try {
      console.log('🕰️ Generating anachronistic image...');
      
      const response = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: imagePrompt,
          negative_prompt: 'modern clothing, contemporary architecture, obvious time inconsistencies, cartoonish, low quality, blurry',
          aspect_ratio: '4:3'
        },
        {
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
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
        description: `A mind-bending anachronistic vision: ${scenario.modernTech} existing naturally in ${scenario.historicalPeriod}, creating a temporal paradox that challenges our understanding of history and technology.`
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error('Failed to generate anachronistic image');
    }
  }, []);

  const generateAnachronisticContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate completely original scenario using ChatGPT
      console.log('🧠 Generating original anachronistic scenario...');
      const scenario = await generateScenario();
      
      console.log('📝 Generating anachronistic story...');
      const story = await generateStory(scenario);
      
      // Extract title from story (first line or create one)
      const storyLines = story.split('\n');
      const title = storyLines[0].length < 100 ? storyLines[0] : `${scenario.modernTech} in ${scenario.historicalPeriod}`;
      
      console.log('🎨 Generating anachronistic image...');
      const image = await generateImage(scenario, title);

      const content = {
        title: title.replace(/^#+\s*/, ''), // Remove markdown headers
        historicalPeriod: scenario.historicalPeriod,
        modernTech: scenario.modernTech,
        story: story,
        image: image,
        scenario: scenario
      };

      console.log('✅ Anachronistic content generated successfully');
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
    generateAnachronisticContent,
    isGenerating,
    error
  };
};

export default useAnachronismContent;
