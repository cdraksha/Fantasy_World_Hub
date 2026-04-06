import { useState, useCallback } from 'react';

const useChineseFairyCitiesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateChineseFairyCitiesContent = useCallback(async () => {
    const prompt = `Generate a Chinese fairy cities scenario featuring mystical Chinese architecture with magical fairy tale elements.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the fairy city scene (20-40 words)
    - imagePrompt: Detailed prompt for generating the Chinese fairy city image

    CHINESE FAIRY CITIES CONCEPT:
    - Traditional Chinese architecture elevated to celestial fairy realms
    - Floating pagodas, temples, and palaces in the clouds
    - Mystical elements: fairy lights, cherry blossoms, magical mists
    - Cultural authenticity combined with fantasy enchantment
    - Celestial beings and mythical creatures in Chinese settings

    ARCHITECTURAL ELEMENTS:
    - Floating pagodas with curved roofs and golden details
    - Jade palace complexes with intricate carvings
    - Traditional hutongs transformed into fairy districts
    - Ancient Chinese gardens with mystical portals
    - Temple cities suspended in cherry blossom clouds
    - Celestial courts with traditional Chinese design
    - Bridges made of jade connecting floating islands
    - Lantern-lit pathways through the clouds

    MAGICAL ELEMENTS:
    - Cherry blossoms falling like magical snow
    - Fairy lights illuminating ancient architecture
    - Mystical mists swirling around buildings
    - Dragons and phoenixes soaring between structures
    - Celestial beings in traditional Chinese clothing
    - Glowing lotus flowers and magical gardens
    - Floating islands connected by rainbow bridges
    - Aurora-like lights in traditional Chinese colors

    VISUAL STYLE:
    - Traditional Chinese color palette: red, gold, jade green, white
    - Soft, ethereal lighting with magical glow effects
    - Detailed traditional Chinese architectural elements
    - Floating, weightless feeling with clouds and mist
    - Cinematic, movie-quality fantasy atmosphere
    - Rich cultural details with authentic Chinese elements

    EXAMPLE SCENARIOS:
    - Floating pagoda city above misty mountains with jade bridges
    - Ancient Chinese palace complex inhabited by celestial fairies
    - Traditional hutong district transformed into magical fairy realm
    - Temple city suspended in cherry blossom clouds with dragons
    - Jade palace with fairy inhabitants and mystical gardens

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🏮 Generating Chinese Fairy Cities scenario with Segmind GPT...');

      // Generate scenario content using Segmind GPT-4
      const scenarioResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert in Chinese culture and fairy tale fantasy. Generate mystical scenarios where traditional Chinese architecture meets magical fairy tale elements. Focus on cultural authenticity, celestial beauty, and enchanting fairy tale magic. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.9
        })
      });

      if (!scenarioResponse.ok) {
        throw new Error(`Segmind GPT API error: ${scenarioResponse.status}`);
      }

      const scenarioData = await scenarioResponse.json();
      const contentText = scenarioData.choices[0].message.content.trim();
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(contentText);
      } catch (parseError) {
        console.error('Failed to parse GPT response as JSON:', contentText);
        throw new Error('Invalid response format from GPT');
      }

      if (!parsedContent.description || !parsedContent.imagePrompt) {
        throw new Error('Missing required fields in GPT response');
      }

      console.log('🎨 Generating Chinese Fairy Cities image with Nano Banana...');

      // Generate image using Segmind Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: parsedContent.imagePrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, text, watermark, signature, username, artist name, copyright, logo, brand name, modern buildings, western architecture",
          width: 1024,
          height: 1024,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000000),
          scheduler: "DPM++ 2M Karras"
        })
      });

      if (!imageResponse.ok) {
        throw new Error(`Segmind Nano Banana API error: ${imageResponse.status}`);
      }

      // Nano Banana returns image file directly, not JSON
      const imageBlob = await imageResponse.blob();
      console.log('✅ Chinese Fairy Cities image generated successfully');

      // Check if we got valid image response
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Created image URL:', imageUrl);

      return {
        description: parsedContent.description,
        image: {
          url: imageUrl,
          prompt: parsedContent.imagePrompt,
          description: `Chinese Fairy Cities - ${parsedContent.description}`,
          thumbnail: null
        }
      };

    } catch (error) {
      console.error('Chinese Fairy Cities generation failed:', error);
      
      let errorMessage = 'Failed to generate Chinese Fairy Cities image';
      if (error.message.includes('401')) {
        errorMessage = 'API key authentication failed';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.message.includes('API error')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = `Network Error: ${error.message}`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateChineseFairyCitiesContent,
    isGenerating,
    error
  };
};

export default useChineseFairyCitiesContent;
