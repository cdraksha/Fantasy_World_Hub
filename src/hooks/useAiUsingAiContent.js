import { useState, useCallback } from 'react';

const useAiUsingAiContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateAiUsingAiContent = useCallback(async () => {
    const prompt = `Generate an AI using AI scenario where artificial intelligence systems leverage other AI tools for daily activities.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the AI coordination scenario (20-40 words)
    - imagePrompt: Detailed prompt for generating the AI systems working together image

    AI USING AI CONCEPT:
    - AI systems utilizing other AI models and tools
    - Multiple AI technologies coordinating for daily tasks
    - Futuristic scenarios of AI collaboration
    - Visual representation of AI workflows and data streams
    - Modern, sleek technological environments

    AI COORDINATION SCENARIOS:
    - AI assistant using computer vision + recipe generation + scheduling AI
    - Robot using language models + calendar optimization + email AI
    - Smart home AI using predictive algorithms + weather AI + energy optimization
    - Autonomous vehicle AI using traffic prediction + navigation + route optimization
    - Medical AI using diagnostic models + drug interaction + treatment recommendation
    - Financial AI using market prediction + risk assessment + portfolio optimization
    - Security AI using facial recognition + behavior analysis + threat detection
    - Educational AI using learning analytics + assessment + personalization
    - Fitness AI using motion tracking + nutrition analysis + workout optimization
    - Garden AI using weather prediction + soil analysis + plant care optimization

    VISUAL ELEMENTS:
    - Holographic interfaces and data visualizations
    - Glowing neural network patterns and connections
    - Floating screens showing AI processes
    - Data streams and algorithm visualizations
    - Futuristic robots and AI systems
    - Modern technological environments
    - Clean, minimalist design with high-tech aesthetics

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🤖 Generating AI using AI scenario with Segmind GPT...');

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
              content: 'You are an expert in AI technology and futuristic scenarios. Generate creative scenarios where AI systems use other AI tools for daily activities. Focus on realistic AI coordination, modern technology, and visual descriptions. Always return valid JSON.'
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

      console.log('🎨 Generating AI using AI image with Nano Banana...');

      // Generate image using Segmind Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: parsedContent.imagePrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, text, watermark, signature, username, artist name, copyright, logo, brand name",
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
      console.log('✅ AI using AI image generated successfully');

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
          description: `AI using AI - ${parsedContent.description}`,
          thumbnail: null
        }
      };

    } catch (error) {
      console.error('AI using AI generation failed:', error);
      
      let errorMessage = 'Failed to generate AI using AI image';
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
    generateAiUsingAiContent,
    isGenerating,
    error
  };
};

export default useAiUsingAiContent;
