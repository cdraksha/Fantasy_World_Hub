import { useState, useCallback } from 'react';

const useUnderwaterCivilizationsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateUnderwaterCivilizationsContent = useCallback(async () => {
    const prompt = `Generate a story about people living in underwater civilizations and biodomes.

    Create a JSON object with these fields:
    - story: A narrative about life in underwater biodomes (150-200 words)
    - imagePrompt: Detailed prompt for generating an image of this underwater civilization

    UNDERWATER CIVILIZATIONS CONCEPT:
    - People living in underwater biodomes, aquatic cities, and ocean colonies
    - Advanced technology that allows humans to thrive beneath the waves
    - Beautiful underwater architecture with glass domes, coral integration
    - Daily life adapted to aquatic environments
    - Peaceful coexistence with marine life
    - Advanced underwater transportation and communication

    STORY SCENARIOS:
    - Morning routine in a glass biodome city on the ocean floor
    - Commuting between underwater habitats via submarine tubes
    - Farming kelp and cultivating sea vegetables in aquatic gardens
    - Children playing in pressurized underwater playgrounds
    - Scientists studying marine life from within their ocean colonies
    - Artists creating sculptures from coral and sea materials
    - Engineers maintaining the life support systems of underwater cities
    - Families enjoying dinner while watching whales swim past their windows
    - Underwater markets where people trade with surface dwellers
    - Schools where children learn to navigate both water and air environments

    STORY STYLE:
    - Write in third person narrative style
    - Focus on the wonder and beauty of underwater living
    - Include sensory details about the aquatic environment
    - Show how technology enables this lifestyle
    - Describe the unique aspects of underwater daily life
    - Make it feel peaceful and utopian, not dystopian
    - Include interactions with marine life
    - Show the architectural marvels of underwater cities
    - Keep it between 150-200 words
    - Make it immersive and descriptive

    IMAGE PROMPT REQUIREMENTS:
    - Show underwater biodomes or aquatic cities
    - Glass structures integrated with coral and sea life
    - People living normally in underwater environments
    - Beautiful underwater architecture with domes, tubes, or spires
    - Marine life swimming around the structures
    - Soft underwater lighting filtering through water
    - Advanced technology seamlessly integrated
    - Peaceful, utopian atmosphere
    - Clear water with good visibility
    - Realistic underwater physics and lighting
    - Show the scale and beauty of underwater civilization
    - Include both human habitation and natural ocean environment

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate story content
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
              content: 'You are a creative storyteller who writes immersive narratives about underwater civilizations. Create beautiful, peaceful stories about people living in underwater biodomes and aquatic cities. Focus on the wonder, technology, and daily life of underwater living. Always return valid JSON.'
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
      
      // Extract JSON from response
      let jsonText = contentText;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1];
      }
      
      // Find first complete JSON object
      const firstBrace = jsonText.indexOf('{');
      if (firstBrace > -1) {
        jsonText = jsonText.substring(firstBrace);
        let braceCount = 0;
        let firstObjectEnd = -1;
        for (let i = 0; i < jsonText.length; i++) {
          if (jsonText[i] === '{') braceCount++;
          if (jsonText[i] === '}') braceCount--;
          if (braceCount === 0 && jsonText[i] === '}') {
            firstObjectEnd = i;
            break;
          }
        }
        if (firstObjectEnd > -1) {
          jsonText = jsonText.substring(0, firstObjectEnd + 1);
        }
      }
      
      // Clean up JSON
      jsonText = jsonText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
      
      console.log('Cleaned underwater civilizations JSON:', jsonText);
      
      let parsedStoryData;
      try {
        parsedStoryData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse story JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;

      console.log('🌊 Generating underwater civilizations image...');

      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: parsedStoryData.imagePrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, text, watermark, signature, username, artist name, copyright, logo, brand name",
          width: 1024,
          height: 768,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000000),
          scheduler: "DPM++ 2M Karras"
        })
      });

      if (!imageResponse.ok) {
        throw new Error(`Segmind Nano Banana API error: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();

      const imageUrl = URL.createObjectURL(imageBlob);
      
      console.log('✅ Underwater civilizations content generated successfully');
      
      return {
        story: parsedStoryData.story,
        image: {
          url: imageUrl,
          prompt: parsedStoryData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Underwater civilizations content generation failed:', error);
      setError('Failed to generate underwater civilizations content');
      throw new Error('Failed to generate underwater civilizations content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateUnderwaterCivilizationsContent,
    isGenerating,
    error
  };
};

export default useUnderwaterCivilizationsContent;
