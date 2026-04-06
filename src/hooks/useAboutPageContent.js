import { useState, useCallback } from 'react';
import axios from 'axios';

const useAboutPageContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState(null);

  const generateSectionImage = useCallback(async (sectionType, prompt) => {
    try {
      console.log(`🎨 Generating ${sectionType} image...`);
      
      const response = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: 'blurry, low quality, distorted, inappropriate, nsfw',
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
        prompt: prompt,
        type: sectionType
      };
    } catch (error) {
      console.error(`${sectionType} image generation failed:`, error);
      throw new Error(`Failed to generate ${sectionType} image`);
    }
  }, []);

  const generateCreatorFantasyScenario = useCallback(async (uploadedImageFile) => {
    try {
      console.log('🧙‍♂️ Generating creator fantasy scenario...');
      
      // Convert uploaded image to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(uploadedImageFile);
      });
      
      const base64Image = await base64Promise;
      
      // Generate fantasy scenario prompt
      const scenarioResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a creative fantasy writer. Create modest, PG13 fantasy scenarios that transform a person into various fantasy settings while maintaining dignity and appropriateness.'
            },
            {
              role: 'user',
              content: 'Create a modest, PG13 fantasy scenario description for transforming this person into a fantasy setting. Focus on adventure, magic, heroic themes, and world-building. Keep it appropriate and inspiring. Describe the fantasy transformation in 2-3 sentences.'
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (!scenarioResponse.ok) {
        throw new Error(`Scenario generation failed: ${scenarioResponse.status}`);
      }

      const scenarioData = await scenarioResponse.json();
      const fantasyScenario = scenarioData.choices[0].message.content;

      // Generate fantasy image using the scenario
      const imagePrompt = `${fantasyScenario}, fantasy art style, heroic pose, magical atmosphere, detailed illustration, epic fantasy, adventure theme, PG13 appropriate, inspiring and dignified`;

      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          negative_prompt: 'inappropriate, nsfw, revealing, suggestive, dark themes, violence, blurry, low quality',
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          guidance_scale: 8.0
        })
      });

      if (!imageResponse.ok) {
        throw new Error(`Fantasy image generation failed: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      return {
        url: imageUrl,
        scenario: fantasyScenario,
        prompt: imagePrompt,
        type: 'creator-fantasy'
      };
    } catch (error) {
      console.error('Creator fantasy scenario generation failed:', error);
      throw new Error('Failed to generate creator fantasy scenario');
    }
  }, []);

  const generateSectionImageWithState = useCallback(async (sectionType, prompt) => {
    setLoadingStates(prev => ({ ...prev, [sectionType]: true }));
    
    try {
      console.log(`🎨 Generating ${sectionType} image...`);
      
      const result = await generateSectionImage(sectionType, prompt);
      
      setGeneratedImages(prev => ({
        ...prev,
        [sectionType]: result
      }));
      
      console.log(`✅ ${sectionType} image generated successfully`);
      return result;

    } catch (error) {
      console.error(`❌ ${sectionType} image generation failed:`, error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [sectionType]: false }));
    }
  }, [generateSectionImage]);

  const generateDreamersFantasyImage = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, personal: true }));
    
    try {
      console.log('🎨 Generating Dreamer\'s Journey fantasy comic...');
      
      const response = await fetch('https://api.segmind.com/v1/nano-banana-pro', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "prompt": "Create a fantasy daydreaming comic featuring Chandan Draksha as a creative dreamer surrounded by his imagination. Multi-panel layout showing his journey from reality into fantasy worlds. Use vibrant colors, magical elements, and whimsical art style.\n\nPanel 1 — Reality:\nChandan sitting at his desk, eyes closed, deep in thought with a slight smile.\nText: 'Every great creation starts with a dream...'\n\nPanel 2 — Transition:\nSwirling magical energy emanates from his mind, books and superhero figures floating around him.\nText: 'The boundaries between reality and imagination blur...'\n\nPanel 3 — Fantasy Realm:\nChandan as an adventurer in a vast fantasy landscape with floating islands, magical creatures, and epic architecture.\nText: 'In these worlds, anything is possible.'\n\nPanel 4 — Superhero Universe:\nChandan alongside iconic superheroes, wielding creative powers, energy crackling from his hands.\nText: 'Heroes aren't born, they're imagined into existence.'\n\nPanel 5 — World Builder:\nChandan as a cosmic architect, designing new worlds with his hands, galaxies and civilizations forming.\nText: 'Every story builds a universe.'\n\nPanel 6 — Return:\nBack at his desk, now typing on his laptop with renewed inspiration, fantasy elements still swirling faintly around him.\nText: 'And every universe changes the dreamer.'\n\nArt style: Fantasy comic book style, vibrant colors, magical lighting, epic composition, dreamlike atmosphere.",
          "image_urls": [
            "https://segmind-inference-inputs.s3.amazonaws.com/ad93498e-3370-432b-8dd7-bc3f4aa1b39a-black-man-image.jpeg"
          ],
          "aspect_ratio": "9:16",
          "output_resolution": "4K",
          "output_format": "jpg"
        }),
      });

      if (!response.ok) {
        throw new Error(`Fantasy comic generation failed: ${response.status}`);
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      const result = {
        url: imageUrl,
        prompt: 'GTA-style fantasy comic of office coworkers',
        type: 'personal'
      };
      
      setGeneratedImages(prev => ({
        ...prev,
        personal: result
      }));
      
      console.log('✅ Dreamer\'s Journey fantasy comic generated successfully');
      return result;

    } catch (error) {
      console.error('❌ Dreamer\'s Journey fantasy comic generation failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, personal: false }));
    }
  }, []);

  return {
    generateSectionImage: generateSectionImageWithState,
    generateDreamersFantasyImage,
    generatedImages,
    loadingStates,
    isGenerating,
    error
  };
};

export default useAboutPageContent;
