import { useCallback } from 'react';

const useFuturisticDancesContent = () => {

  const generateFuturisticDance = useCallback(async () => {
    console.log('🎭 Generating futuristic dance...');
    
    try {
      let generatedText = null;
      let generatedImage = null;

      console.log('🔄 Starting text generation with GPT-4...');
      // Generate descriptive text using Segmind GPT-4
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
              content: 'Generate a creative description of a futuristic dance style. Combine traditional dance with sci-fi elements like zero gravity, holograms, energy manipulation, or cyberpunk aesthetics. Keep it under 100 words, cinematic and imaginative.'
            },
            {
              role: 'user',
              content: 'Create a unique futuristic dance concept that blends traditional choreography with advanced technology and sci-fi environments.'
            }
          ],
          model: 'gpt-4',
          max_tokens: 150,
          temperature: 0.8
        })
      });

      console.log('📡 Text response status:', textResponse.status);
      if (textResponse.ok) {
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
        console.log('✅ Generated dance description:', generatedText);
      } else {
        console.error('❌ Text generation failed:', textResponse.status, textResponse.statusText);
        const errorText = await textResponse.text();
        console.error('❌ Error details:', errorText);
      }

      // Generate detailed image prompt using GPT-4
      const promptResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Create a detailed visual prompt for generating a futuristic dance image. Include specific dance style, futuristic environment, lighting, colors, and sci-fi elements. Make it cinematic and visually striking.'
            },
            {
              role: 'user',
              content: `Based on this dance concept: "${generatedText || 'futuristic dance performance'}", create a detailed image generation prompt that captures the visual essence.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 100,
          temperature: 0.7
        })
      });

      let imagePrompt = 'Futuristic dance performance with holographic effects, neon lighting, cyberpunk aesthetic, dynamic movement, sci-fi environment, cinematic composition';
      
      console.log('📡 Prompt response status:', promptResponse.status);
      if (promptResponse.ok) {
        const promptData = await promptResponse.json();
        imagePrompt = promptData.choices[0].message.content;
        console.log('✅ Generated image prompt:', imagePrompt);
      } else {
        console.error('❌ Prompt generation failed:', promptResponse.status, promptResponse.statusText);
        const errorText = await promptResponse.text();
        console.error('❌ Prompt error details:', errorText);
      }

      console.log('🖼️ Starting image generation with Nano Banana...');

      // Call Segmind Nano Banana API for image generation
      const response = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          negative_prompt: 'blurry, low quality, distorted, amateur, static pose, boring, traditional, old-fashioned, dark, gloomy',
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000)
        })
      });

      console.log('📡 Image response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Image generation failed:', response.status, response.statusText);
        console.error('❌ Image error details:', errorText);
        throw new Error(`Image generation failed: ${response.status}`);
      }

      console.log('✅ Image generation successful, creating blob...');
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      console.log('✅ Image URL created:', imageUrl);

      const result = {
        imageUrl,
        description: generatedText || 'A futuristic dance performance that blends traditional choreography with cutting-edge technology, creating an otherworldly artistic expression that pushes the boundaries of human movement and digital artistry.',
        prompt: imagePrompt
      };
      
      console.log('🎉 Final result:', result);
      return result;

    } catch (error) {
      console.error('Futuristic dance generation failed:', error);
      throw new Error('Failed to generate futuristic dance. Please try again.');
    }
  }, []);

  return {
    generateFuturisticDance
  };
};

export default useFuturisticDancesContent;
