import { useState, useCallback } from 'react';
import axios from 'axios';

const useBangaloreTrafficContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateBangaloreTrafficContent = useCallback(async () => {
    const prompt = `Generate a funny Bangalore traffic scenario rendered in beautiful Studio Ghibli art style.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the traffic scenario (20-40 words)
    - imagePrompt: Detailed prompt for generating the Ghibli-style traffic scene

    BANGALORE TRAFFIC CONCEPT:
    - Real Bangalore traffic situations that locals recognize
    - Rendered in beautiful Studio Ghibli animation art style
    - Soft, dreamy, magical aesthetic applied to chaotic traffic
    - Watercolor textures, gentle lighting, whimsical details
    - Make mundane traffic chaos look enchanting and beautiful

    REAL BANGALORE TRAFFIC SCENARIOS:

    ICONIC LOCATIONS:
    - Silk Board junction gridlock during peak hours
    - Electronic City traffic jam stretching for kilometers
    - Outer Ring Road crawling at 5 km/h
    - Koramangala narrow roads with buses and bikes
    - Whitefield tech corridor during office hours
    - Hebbal flyover construction chaos
    - Bannerghatta Road weekend traffic
    - Hosur Road IT company rush
    - Marathahalli bridge bottleneck
    - Sarjapur Road pothole navigation

    CLASSIC BANGALORE TRAFFIC SITUATIONS:
    - 2-lane road magically becoming 6 lanes with creative lane discipline
    - Massive crater-sized pothole with cars doing gymnastics to avoid it
    - Sacred cow casually sitting in middle of busy tech corridor
    - Two drops of rain causing complete traffic paralysis and 3-hour jams
    - Wrong-way bike confidently riding against traffic like they own the road
    - Creative signal jumping - red means "proceed with caution"
    - Cars parked on footpath while pedestrians walk on road
    - Bus and auto playing chicken on narrow Koramangala roads
    - Delivery bikes threading through 2-inch gaps between vehicles
    - Construction blocking 80% of road with no alternate route signs
    - Flooded underpass with cars attempting to become submarines
    - Traffic police giving up and just watching the chaos unfold
    - Honking symphony reaching decibel levels that break sound barriers
    - Silk Board junction where GPS systems have nervous breakdowns
    - Auto-rickshaw refusing short distances but taking 2-hour detours
    - Bike riders using footpath as express highway during jams
    - Cars reversing on main road because they missed their turn
    - Pedestrians playing real-life Frogger to cross Electronic City road
    - Office buses creating their own lanes in the middle of nowhere
    - Parking attendants fitting 50 cars in space meant for 10

    GHIBLI ART STYLE REQUIREMENTS:
    - Soft, dreamy watercolor aesthetic like Totoro/Spirited Away
    - Gentle, warm lighting (golden hour, soft shadows)
    - Whimsical details and magical atmosphere
    - Beautiful sky with fluffy clouds or sunset colors
    - Lush greenery and trees in background
    - Cute, gentle character expressions even in chaos
    - Detailed backgrounds with Studio Ghibli attention to detail
    - Soft color palette with pastels and warm tones
    - Hand-drawn animation quality and texture
    - Make traffic chaos look enchanting and beautiful

    DESCRIPTION STYLE:
    - Humorous and relatable for Bangalore residents
    - Emphasize the absurdity of the traffic situation
    - Keep it light-hearted and funny
    - Mention specific Bangalore locations when relevant
    - Make it sound both realistic and amusing

    IMAGE PROMPT REQUIREMENTS:
    - Studio Ghibli animation art style with watercolor textures
    - Realistic Bangalore traffic scenario (specific location if possible)
    - Soft, dreamy lighting and beautiful sky
    - Detailed vehicles, people, and urban environment
    - Whimsical, magical atmosphere applied to mundane chaos
    - Professional animation quality with Ghibli attention to detail
    - Warm, gentle color palette even for chaotic scenes
    - Make traffic jam look enchanting and visually stunning
    - Include recognizable Bangalore elements (autos, buses, IT offices, etc.)
    - Beautiful composition that makes chaos look artistic

    EXAMPLE SCENARIOS:
    - 2-lane Koramangala road magically transformed into 6 lanes with cars, bikes, and autos creating their own traffic rules, rendered in soft golden hour lighting
    - Massive crater-sized pothole on Sarjapur Road with vehicles performing acrobatic maneuvers to avoid it, beautiful cloudy sky above
    - Silk Board junction complete gridlock with GPS systems giving up, but made magical with dreamy watercolor Ghibli aesthetic
    - Electronic City underpass flooded with cars attempting submarine mode, gentle lighting making chaos look enchanting
    - Construction blocking 80% of Outer Ring Road with no alternate route, but rendered in whimsical Ghibli style with lush greenery
    - Pedestrians playing real-life Frogger across busy Whitefield road, soft pastel colors making danger look beautiful
    - Traffic police watching helplessly as 2 drops of rain cause 3-hour jam, rendered with gentle Totoro-like expressions

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
            content: 'You are a master of Bangalore traffic comedy who creates hilarious but realistic traffic scenarios rendered in beautiful Studio Ghibli art style. Generate authentic Bangalore traffic situations that locals will recognize, but make them visually stunning through dreamy animation aesthetics. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
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
      
      console.log('Cleaned Bangalore traffic JSON:', jsonText);
      
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

      console.log('🚗 Generating Bangalore traffic Ghibli-style image...');

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
      
      console.log('✅ Bangalore traffic content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Bangalore traffic content generation failed:', error);
      setError('Failed to generate Bangalore traffic content');
      throw new Error('Failed to generate Bangalore traffic content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateBangaloreTrafficContent,
    isGenerating,
    error
  };
};

export default useBangaloreTrafficContent;
