import { useState, useCallback } from 'react';
import axios from 'axios';

const useDragonsOverCitiesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDragonsOverCitiesContent = useCallback(async () => {
    const prompt = `Generate a dragons over cities scenario featuring majestic dragons flying over modern cityscapes.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the dragon/city scene (20-40 words)
    - imagePrompt: Detailed prompt for generating the epic dragon over cityscape image

    DRAGONS OVER CITIES CONCEPT:
    - Majestic dragons soaring over real modern cities
    - Epic fantasy meets urban reality
    - Massive scale - dragons dwarfing skyscrapers
    - Cinematic, movie-like atmosphere
    - Different dragon types and city combinations

    DRAGON TYPES:
    - Fire dragons breathing flames over glass towers
    - Ice dragons creating frost on buildings
    - Storm dragons with lightning and dark clouds
    - Ancient wyrms massive and weathered
    - Elegant Eastern dragons serpentine and graceful
    - Shadow dragons dark and mysterious
    - Crystal dragons with translucent scales
    - Multiple dragons in formation flights

    CITY OPTIONS:
    - New York - Dragons over Manhattan skyline
    - Tokyo - Dragons weaving through neon-lit towers
    - London - Ancient dragons over Thames and Big Ben
    - Dubai - Fire dragons over Burj Khalifa
    - Hong Kong - Dragons through dense urban canyons
    - Paris - Elegant dragons over Eiffel Tower
    - Singapore - Water dragons over Marina Bay
    - Chicago - Dragons between Willis Tower and lakefront
    - Sydney - Dragons over Opera House and harbor
    - Shanghai - Dragons over futuristic skyline

    DESCRIPTION STYLE:
    - Epic and cinematic tone
    - Emphasize the scale and majesty
    - Mention specific dragon type and city
    - Make it sound like a movie scene
    - Keep it short and impactful (1-2 sentences max)

    IMAGE PROMPT REQUIREMENTS:
    - Epic cinematic composition with dramatic lighting
    - Massive dragons clearly visible against city skyline
    - Realistic modern cityscape with recognizable landmarks
    - Dynamic action - dragons in flight, breathing fire/ice, etc.
    - Atmospheric effects - clouds, smoke, lightning, city lights
    - High detail on both dragon scales/features and city architecture
    - Movie poster quality, professional fantasy art style
    - Wide establishing shot showing full scale
    - Golden hour or dramatic storm lighting
    - Make the dragons feel truly massive compared to buildings

    EXAMPLE SCENARIOS:
    - Massive fire dragon breathing flames while soaring between Manhattan skyscrapers
    - Ancient ice dragon perched on Tokyo Tower with frost covering nearby buildings
    - Storm dragon with lightning crackling around it flying over London's Thames
    - Elegant Eastern dragon weaving through Hong Kong's dense urban canyon
    - Multiple dragons in formation over Dubai's futuristic skyline at sunset

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate scenario content
      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of epic fantasy scenarios who creates breathtaking scenes of dragons flying over modern cities. Generate cinematic, movie-quality scenarios where massive mythical creatures dominate urban skylines. Focus on scale, majesty, and the contrast between ancient fantasy and modern reality. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const contentText = scenarioResponse.data.choices[0].message.content.trim();
      
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
      
      console.log('Cleaned dragons over cities JSON:', jsonText);
      
      let scenarioData;
      try {
        scenarioData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse scenario JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;

      console.log('🐉 Generating dragons over cities image...');

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: scenarioData.imagePrompt,
          samples: 1,
          scheduler: "DPM++ 2M",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
          img_width: 1024,
          img_height: 1024,
          base64: false
        },
        {
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 60000
        }
      );

      const imageUrl = URL.createObjectURL(imageResponse.data);
      
      console.log('✅ Dragons over cities content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Dragons over cities content generation failed:', error);
      setError('Failed to generate dragons over cities content');
      throw new Error('Failed to generate dragons over cities content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateDragonsOverCitiesContent,
    isGenerating,
    error
  };
};

export default useDragonsOverCitiesContent;
