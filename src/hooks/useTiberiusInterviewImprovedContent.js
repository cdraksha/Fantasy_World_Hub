import { useState } from 'react';

const useTiberiusInterviewImprovedContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateTiberiusInterviewImprovedContent = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let generatedText = null;
      let generatedImage = null;
      let generatedVideo = null;

      // Generate interview dialogue
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
              content: 'Create a 30-second futuristic interview with Emperor Tiberius in 3125. Keep it under 90 words.'
            },
            {
              role: 'user',
              content: 'Generate an imperial interview about galactic challenges.'
            }
          ],
          model: 'gpt-4',
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
      }

      // Generate Emperor image
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: `Emperor Tiberius, 67 years old, silver hair, cybernetic eye, imperial jacket, throne, year 3125, photorealistic`,
          negative_prompt: 'blurry, low quality, cartoon, young person',
          width: 720,
          height: 1280,
          num_inference_steps: 25,
          guidance_scale: 7.5
        })
      });

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        generatedImage = imageBlob;
      }

      // Generate video
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
          prompt: `Emperor speaking in interview, slight movements, talking, authoritative`,
          negative_prompt: 'blurry, static, fast movement',
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
          description: "Emperor Tiberius interview"
        };
      }

      return {
        text: generatedText,
        video: generatedVideo
      };
      
    } catch (err) {
      console.error('Tiberius interview generation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateTiberiusInterviewImprovedContent,
    isGenerating,
    error
  };
};

export default useTiberiusInterviewImprovedContent;
