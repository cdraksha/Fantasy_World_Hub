import { useState, useCallback } from 'react';

const useGraveyardChroniclesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateGraveyardChroniclesContent = useCallback(async () => {
    const prompt = `Generate a graveyard chronicles story featuring a fictional person's complete life story discovered from their gravestone.

    Create a JSON object with these fields:
    - name: Full name of the fictional person
    - birthYear: Birth year (1800-1950 range for historical depth)
    - deathYear: Death year (ensure realistic lifespan)
    - epitaph: Short phrase on the headstone (3-8 words)
    - lifeStory: Complete biographical narrative (200-300 words)
    - imagePrompt: Detailed prompt for generating cemetery scene or portrait

    GRAVEYARD CHRONICLES CONCEPT:
    - Celebrate ordinary lives with extraordinary stories
    - Focus on dignity, kindness, and human connection
    - Historical immersion across different eras
    - Respectful, uplifting tone - no tragedy exploitation
    - Every life has a story worth telling

    STORY THEMES:
    - Quiet heroes who helped others without recognition
    - Artists, musicians, writers who touched hearts locally
    - Immigrants who built communities and bridges
    - Teachers, nurses, craftspeople who shaped lives
    - Parents who sacrificed for their children's futures
    - People who overcame adversity with grace
    - Unsung contributors to their communities

    HISTORICAL ERAS & CONTEXTS:
    - Victorian era (1837-1901): Industrial revolution, social change
    - Early 1900s: Immigration waves, urbanization
    - 1920s: Jazz age, women's rights, cultural shifts
    - 1930s-40s: Depression, WWII, resilience and sacrifice
    - Post-war era: Rebuilding, hope, family focus

    LIFE STORY ELEMENTS:
    - Childhood and family background
    - Passions, talents, and dreams
    - Career or life's work (often humble but meaningful)
    - Acts of kindness and community contribution
    - Relationships and love stories
    - Challenges overcome with dignity
    - Legacy left behind (often unrecognized)

    VISUAL ELEMENTS FOR IMAGE:
    - Weathered cemetery with old headstones
    - Period-appropriate portrait of the person
    - Historical clothing and settings
    - Atmospheric lighting (golden hour, misty)
    - Respectful, dignified composition
    - Details that reflect their era and story

    TONE GUIDELINES:
    - Warm, celebratory, and respectful
    - Focus on life lived, not death
    - Emphasize human dignity and connection
    - Bittersweet but ultimately uplifting
    - "Every person matters" philosophy

    EXAMPLE STORY TYPES:
    - The seamstress who secretly funded orphanages
    - The jazz musician who never got famous but brought joy
    - The immigrant baker who fed the neighborhood during hard times
    - The librarian who taught countless children to read
    - The factory worker who organized community gardens
    - The nurse who cared for patients like family

    Return ONLY a valid JSON object with all fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🪦 Generating Graveyard Chronicles story with Segmind GPT...');

      // Generate story content using Segmind GPT-4
      const storyResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a master storyteller who finds extraordinary stories in ordinary lives. Generate respectful, dignified biographical narratives that celebrate the human experience across different historical eras. Focus on quiet heroism, acts of kindness, and the dignity found in every life. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.8
        })
      });

      if (!storyResponse.ok) {
        throw new Error(`Segmind GPT API error: ${storyResponse.status}`);
      }

      const storyData = await storyResponse.json();
      const contentText = storyData.choices[0].message.content.trim();
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(contentText);
      } catch (parseError) {
        console.error('Failed to parse GPT response as JSON:', contentText);
        throw new Error('Invalid response format from GPT');
      }

      if (!parsedContent.name || !parsedContent.lifeStory || !parsedContent.imagePrompt) {
        throw new Error('Missing required fields in GPT response');
      }

      console.log('🎨 Generating Graveyard Chronicles image with Nano Banana...');

      // Generate image using Segmind Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: parsedContent.imagePrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, text, watermark, signature, username, artist name, copyright, logo, brand name, horror, scary, disturbing, grotesque",
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
      console.log('✅ Graveyard Chronicles image generated successfully');

      // Check if we got valid image response
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Created image URL:', imageUrl);

      return {
        name: parsedContent.name,
        birthYear: parsedContent.birthYear,
        deathYear: parsedContent.deathYear,
        epitaph: parsedContent.epitaph,
        lifeStory: parsedContent.lifeStory,
        image: {
          url: imageUrl,
          prompt: parsedContent.imagePrompt,
          description: `Graveyard Chronicles - ${parsedContent.name}`,
          thumbnail: null
        }
      };

    } catch (error) {
      console.error('Graveyard Chronicles generation failed:', error);
      
      let errorMessage = 'Failed to generate Graveyard Chronicles story';
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
    generateGraveyardChroniclesContent,
    isGenerating,
    error
  };
};

export default useGraveyardChroniclesContent;
