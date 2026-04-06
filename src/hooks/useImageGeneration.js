import { useState, useCallback } from 'react';
import axios from 'axios';

const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  const generateImage = useCallback(async (prompt, characterId, sceneCount, theme = 'space-cafe') => {
    console.log('🚀 generateImage called with:', { prompt, characterId, sceneCount });
    setIsGenerating(true);
    
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    console.log('🔑 API Key check:', {
      exists: !!apiKey,
      length: apiKey ? apiKey.length : 0,
      firstChars: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
      isDefault: apiKey === 'your_segmind_api_key_here'
    });

    // Always try the API first, even if key looks wrong
    try {
      console.log('🌌 Attempting AI image generation with Juggernaut Lightning Flux');
      
      const url = "https://api.segmind.com/v1/juggernaut-lightning-flux";
      
      // Create theme-specific enhanced prompt
      let enhancedPrompt;
      if (theme === 'hampi-bazaar') {
        enhancedPrompt = `Historical oil painting style: ${prompt}. 15th century Vijayanagara Empire Hampi bazaar with authentic stone architecture, merchants in traditional dhotis and saris, bullock carts loaded with spices, temple gopurams in background, oil lamps and brass vessels, warm golden hour lighting, no modern elements, detailed period-accurate illustration`;
      } else {
        enhancedPrompt = `Comic book style illustration: ${prompt}. Peaceful space station cafe interior with warm lighting, cozy seating, large windows showing stars and galaxies, people in space suits relaxing, therapeutic and calming atmosphere, detailed digital art, high quality`;
      }
      
      const data = {
        positivePrompt: enhancedPrompt,
        width: 1024,
        height: 1024,
        steps: 25,
        seed: Math.floor(Math.random() * 1000000),
        CFGScale: 7,
        outputFormat: "JPG",
        scheduler: "Euler"
      };

      console.log('📡 Sending request to Segmind API:', { url, prompt: enhancedPrompt.substring(0, 100) + '...' });

      const response = await axios.post(url, data, {
        headers: { 
          'x-api-key': apiKey || 'missing-key',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 15000 // 15 second timeout (giving 10s for generation + 5s buffer)
      });

      // Convert blob to data URL for display
      const imageUrl = URL.createObjectURL(response.data);
      
      const newImage = {
        id: Date.now(),
        url: imageUrl,
        prompt: prompt,
        characterId: characterId,
        timestamp: new Date(),
        isPlaceholder: false
      };

      console.log('✅ AI image generated successfully!');
      setGeneratedImages(prev => [...prev, newImage]);
      setIsGenerating(false);
      return newImage;

    } catch (error) {
      console.error('❌ Image generation failed, details:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        try {
          if (error.response.data instanceof Blob) {
            const errorText = await error.response.data.text();
            console.error('Error response text:', errorText);
          } else {
            console.error('Error response data:', error.response.data);
          }
        } catch (e) {
          console.error('Could not read error response:', e);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      
      console.log('❌ Image generation failed - no fallback images');
      setIsGenerating(false);
      return null;
    }
  }, []);

  const getSpacePrompts = (characterType) => {
    const prompts = {
      'asteroid_miner': [
        'Asteroid mining operation in deep space',
        'Futuristic mining equipment on asteroid',
        'Space miner with glowing crystals',
        'Asteroid belt with mining ships'
      ],
      'research_scientist': [
        'Scientific laboratory in space station',
        'Cosmic phenomena and nebulas',
        'Advanced space research equipment',
        'Alien artifacts discovery'
      ],
      'space_tourist': [
        'Luxury space hotel with Earth view',
        'Tourist taking selfie in zero gravity',
        'Beautiful space scenery and planets',
        'Exotic alien landscapes'
      ],
      'cargo_pilot': [
        'Massive cargo ship in space',
        'Space port with loading docks',
        'Pilot in cockpit with star field',
        'Trade routes through asteroid field'
      ],
      'station_engineer': [
        'Complex space station machinery',
        'Engineer working on life support',
        'Futuristic control panels and displays',
        'Space station construction'
      ],
      'diplomatic_envoy': [
        'Elegant diplomatic meeting in space',
        'Alien embassy and negotiations',
        'Peaceful space colonies',
        'Interplanetary council meeting'
      ]
    };

    return prompts[characterType] || [
      'Beautiful space scene with stars',
      'Futuristic space technology',
      'Peaceful orbital station',
      'Amazing cosmic vista'
    ];
  };

  const generateRandomImage = useCallback((characterType, characterId) => {
    const prompts = getSpacePrompts(characterType);
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    return generateImage(randomPrompt, characterId);
  }, [generateImage]);

  const clearImages = useCallback(() => {
    // Clean up object URLs to prevent memory leaks
    generatedImages.forEach(img => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
    setGeneratedImages([]);
  }, [generatedImages]);

  return {
    generateImage,
    generateRandomImage,
    isGenerating,
    generatedImages,
    clearImages,
    getSpacePrompts
  };
};

export default useImageGeneration;
