import { useState, useCallback } from 'react';

const useDaydreamFantasyContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDaydreamFantasyContent = useCallback(async () => {
    const prompt = `Generate a daydream fantasy scenario showing the gap between humble beginnings and grandiose dreams.

    Create a JSON object with these fields:
    - reality: Detailed description of someone starting something simple/modest for the first time
    - dream: Detailed description of the same person in their grandiose daydream future
    - description: Short phrase describing the transformation (e.g., "Man cuts sandwich for first time, dreams he is Michelin star chef")

    DAYDREAM FANTASY CONCEPT:
    - Show the beautiful contrast between humble starts and grand visions like La La Land
    - Same person in both scenarios (consistent appearance)
    - Reality: modest, everyday, relatable beginnings - someone doing something FOR THE FIRST TIME
    - Dream: epic, glamorous, aspirational future
    - Focus on that universal human tendency to dream big from small starts

    SCENARIO CATEGORIES:
    - Creative pursuits (music, art, writing, filmmaking)
    - Culinary dreams (cooking, baking, food service)
    - Business ventures (startups, entrepreneurship, commerce)
    - Tech/innovation (coding, apps, inventions)
    - Sports/fitness (training, competition, achievement)
    - Education/teaching (tutoring, speaking, influence)
    - Entertainment (performing, content creation, media)
    - Crafts/making (DIY, handmade, artisanal)
    - Service/helping (volunteering, community, social impact)

    VISUAL STYLE REQUIREMENTS:
    - REALITY: Basic settings, casual clothes, modest scale, everyday lighting
    - DREAM: Luxurious settings, professional attire, grand scale, dramatic lighting
    - Strong visual contrast between humble and grandiose
    - Same person recognizable in both sides
    - Photorealistic, professional quality

    EXAMPLE SCENARIOS AND DESCRIPTIONS:
    - "Man cuts sandwich for first time, dreams he is Michelin star chef"
    - "Woman strums guitar in bedroom, dreams she's performing at sold-out stadium"
    - "Person writes first blog post, dreams of bestseller book signing"
    - "Teenager does first push-up, dreams of Olympic gold medal ceremony"
    - "Artist sketches in notebook, dreams of prestigious gallery exhibition"
    - "Student codes first app, dreams of ringing IPO bell on Wall Street"
    - "Child sets up lemonade stand, dreams of leading corporate boardroom"
    - "Creator films first video, dreams of Hollywood studio production"

    Return ONLY a valid JSON object with reality, dream, and description fields.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🌟 Generating Daydream Fantasy scenario with Segmind GPT...');

      // Generate scenario using Segmind GPT-4
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
              content: 'You are a creative storyteller who captures La La Land-style daydream moments. Generate scenarios showing people doing something simple for the first time but dreaming of incredible futures. Use format like "Man cuts sandwich for first time, dreams he is Michelin star chef". Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.9
        })
      });

      if (!scenarioResponse.ok) {
        throw new Error(`Segmind GPT API error: ${scenarioResponse.status}`);
      }

      const scenarioData = await scenarioResponse.json();
      const contentText = scenarioData.choices[0].message.content.trim();
      
      let selectedScenario;
      try {
        selectedScenario = JSON.parse(contentText);
      } catch (parseError) {
        console.error('Failed to parse GPT response as JSON:', contentText);
        throw new Error('Invalid response format from GPT');
      }

      if (!selectedScenario.reality || !selectedScenario.dream || !selectedScenario.description) {
        throw new Error('Missing required fields in GPT response');
      }

      const imagePrompt = `Create a split-screen composition showing reality vs daydream:

LEFT SIDE (Reality): ${selectedScenario.reality}
RIGHT SIDE (Dream): ${selectedScenario.dream}

VISUAL STYLE:
- Clear split down the middle
- Same person in both sides (consistent appearance)
- LEFT: Modest, everyday lighting, casual setting, humble scale
- RIGHT: Dramatic, professional lighting, grand setting, impressive scale, reminiscent of La La Land's vibrant and dreamy quality
- Strong contrast between humble beginning and grandiose vision
- Photorealistic style
- Clear visual storytelling of aspiration and dreams

COMPOSITION:
- Perfect 50/50 split vertically down the center
- Consistent person across both sides
- Dramatic difference in scale and grandeur
- Professional photography quality`;

      console.log('🎨 Generating Daydream Fantasy image with Nano Banana...');

      // Generate image using Segmind Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, text, watermark, signature, username, artist name, copyright, logo, brand name, multiple people in one side, inconsistent person, bad split composition",
          width: 1024,
          height: 512,
          num_inference_steps: 25,
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
      console.log('✅ Daydream Fantasy image generated successfully');

      // Check if we got valid image response
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Created image URL:', imageUrl);

      return {
        description: selectedScenario.description,
        image: {
          url: imageUrl,
          prompt: imagePrompt,
          description: `Daydream Fantasy - ${selectedScenario.description}`,
          thumbnail: null
        }
      };

    } catch (error) {
      console.error('Daydream Fantasy generation failed:', error);
      
      let errorMessage = 'Failed to generate Daydream Fantasy';
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
    generateDaydreamFantasyContent,
    isGenerating,
    error
  };
};

export default useDaydreamFantasyContent;
