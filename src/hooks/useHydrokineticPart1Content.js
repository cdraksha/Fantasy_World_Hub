import { useState } from 'react';

const useHydrokineticPart1Content = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateHydrokineticPart1Content = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let generatedText = null;
      let generatedImage = null;

      // Generate descriptive text using GPT-4
      const textResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Generate a short 1-2 sentence description of someone using hydrokinetic water manipulation powers. Keep it under 30 words, epic and cinematic like a movie scene. Focus on the visual spectacle of water control abilities.'
            },
            {
              role: 'user',
              content: `Create a brief, cinematic description of hydrokinetic water powers in action. Make it mystical and inspired by water manipulation abilities.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 50,
          temperature: 0.8
        })
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
      }

      // Generate image using Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: `Hydrokinetic water manipulation powers, mystical water control abilities, person wielding water powers, flowing water streams, aquatic magic, oceanic energy, crystal clear water, bioluminescent water effects, temple of the sea atmosphere, Pokémon Ranger inspired, magical water bending, serene yet powerful, ethereal water spirits, cinematic lighting, highly detailed, fantasy art style`,
          negative_prompt: 'blurry, low quality, dark, muddy water, pollution, ugly, distorted, text, watermark, simple, boring',
          width: 768,
          height: 512,
          num_inference_steps: 25,
          guidance_scale: 7.5
        })
      });

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        generatedImage = {
          url: URL.createObjectURL(imageBlob),
          description: "Hydrokinetic abilities visualization"
        };
      }

      return {
        text: generatedText,
        image: generatedImage
      };
      
    } catch (err) {
      console.error('Hydrokinetic Part 1 generation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateHydrokineticPart1Content,
    isGenerating,
    error
  };
};

export default useHydrokineticPart1Content;
