import { useState } from 'react';

const useHydrokineticPart2Content = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateHydrokineticPart2Content = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let generatedText = null;
      let generatedImage = null;
      let generatedVideo = null;

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
              content: 'Generate a short 1-2 sentence description of someone using hydrokinetic water manipulation powers in motion. Keep it under 30 words, epic and cinematic like a movie scene. Focus on the dynamic movement and flow of water powers.'
            },
            {
              role: 'user',
              content: `Create a brief, cinematic description of hydrokinetic water powers in dynamic action. Make it mystical and inspired by flowing water manipulation abilities.`
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

      // First generate an image using Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: `Hydrokinetic water manipulation powers, mystical water control abilities, person wielding water powers, flowing water streams, aquatic magic, oceanic energy, crystal clear water, bioluminescent water effects, temple of the sea atmosphere, Pokémon Ranger inspired, magical water bending, serene yet powerful, ethereal water spirits, cinematic lighting, highly detailed, fantasy art style`,
          negative_prompt: 'blurry, low quality, dark, muddy water, pollution, ugly, distorted, text, watermark, simple, boring',
          width: 720,
          height: 1280,
          num_inference_steps: 25,
          guidance_scale: 7.5
        })
      });

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        generatedImage = imageBlob;
      } else {
        throw new Error('Failed to generate base image for video');
      }

      // Now generate video using LTX-2-19B-I2V with the generated image
      // Convert image blob to base64 for the API
      const imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(generatedImage);
      });
      
      const videoResponse = await fetch('https://api.segmind.com/v1/ltx-2-19b-i2v', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          image: imageBase64,
          prompt: `Hydrokinetic water manipulation powers in dynamic motion, person wielding flowing water streams, aquatic magic in action, oceanic energy waves, crystal clear water flowing and splashing, bioluminescent water effects moving, temple of the sea atmosphere, Pokémon Ranger inspired, magical water bending in motion, serene yet powerful water control, ethereal water spirits dancing, cinematic lighting, highly detailed, fantasy water magic`,
          negative_prompt: 'blurry, low quality, still frame, frames, watermark, overlay, titles, has blurbox, has subtitles, static, motionless',
          width: 720,
          height: 1280,
          num_frames: 181,
          fps: 24,
          seed: 42,
          guidance_scale: 4
        })
      });

      if (videoResponse.ok) {
        const videoBlob = await videoResponse.blob();
        generatedVideo = {
          url: URL.createObjectURL(videoBlob),
          description: "Hydrokinetic abilities in motion"
        };
      }

      return {
        text: generatedText,
        video: generatedVideo
      };
      
    } catch (err) {
      console.error('Hydrokinetic Part 2 generation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateHydrokineticPart2Content,
    isGenerating,
    error
  };
};

export default useHydrokineticPart2Content;
