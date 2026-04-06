import { useState, useCallback } from 'react';
import axios from 'axios';

const usePortalDimensionsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePortalDimensionsContent = useCallback(async () => {
    const prompt = `Generate an interdimensional portal scenario featuring mystical portals opening to reveal other dimensions.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the portal and what dimension it leads to (20-40 words)
    - imagePrompt: Detailed prompt for generating the portal and dimensional view

    PORTAL DIMENSIONS CONCEPT:
    - Dr. Strange-style mystical portals opening in everyday locations
    - Circular portals with mandala patterns appearing in normal places
    - Contrast between mundane reality and otherworldly destinations
    - Portals suddenly materializing in streets, stores, offices, homes
    - People's reactions to seeing interdimensional gateways

    DIMENSION TYPES:
    
    MYSTICAL DIMENSIONS:
    - Mirror Dimension - Everything reversed and crystalline
    - Dark Dimension - Dormammu's realm of eternal darkness and floating rocks
    - Astral Plane - Spiritual realm of pure energy and floating consciousness
    - Time Dimension - Past/future versions of reality overlapping
    - Dream Dimension - Surreal, impossible landscapes from subconscious

    ALIEN WORLDS:
    - Crystal planet with floating geometric structures
    - Underwater civilization with bioluminescent cities
    - Sky realm with floating islands and no ground
    - Fire dimension with lava rivers and flame creatures
    - Ice dimension with frozen palaces and aurora skies
    - Jungle dimension with massive trees and exotic creatures
    - Desert dimension with sand dunes and ancient ruins
    - Mechanical dimension with clockwork landscapes

    QUANTUM/SCIENTIFIC DIMENSIONS:
    - Quantum Realm - Microscopic universe with strange physics
    - Multiverse variants - Earth but everything's different
    - Parallel universe - Same but opposite reality
    - Fractal dimension - Infinite recursive patterns
    - Energy dimension - Pure light and electromagnetic fields

    FANTASY DIMENSIONS:
    - Elemental planes (fire, water, air, earth)
    - Fairy realm with magical forests and creatures
    - Shadow realm of darkness and whispers
    - Light realm of pure radiance and angels
    - Void dimension of empty space and stars
    - Chaos dimension with constantly shifting reality

    DESCRIPTION STYLE:
    - Mystical and otherworldly tone
    - Emphasize the portal's appearance and energy
    - Briefly describe what's visible on the other side
    - Make it sound magical and mysterious
    - Keep it short and impactful (1-2 sentences max)

    EVERYDAY LOCATIONS FOR PORTALS:
    - Busy city street with pedestrians and cars
    - Inside a grocery store or shopping mall
    - Coffee shop or restaurant
    - Office building or workplace
    - Subway station or bus stop
    - Park or playground
    - Library or bookstore
    - Gas station or parking lot
    - Apartment building hallway
    - School classroom or university
    - Hospital or medical center
    - Bank or post office

    IMAGE PROMPT REQUIREMENTS:
    - Dr. Strange-style circular portal with intricate mandala patterns
    - Portal opening in a normal, everyday location (street, store, etc.)
    - Sparking orange/gold energy crackling around the portal edges
    - Clear view of the other dimension through the portal opening
    - Normal people in the scene reacting with shock/amazement
    - Contrast between mundane reality and otherworldly destination
    - Realistic modern setting with the mystical portal as focal point
    - Professional cinematic composition showing both worlds
    - Make the other dimension look alien and impossible
    - High detail on portal design, everyday location, and dimensional landscape

    EXAMPLE SCENARIOS:
    - Portal opening in a busy coffee shop, revealing a crystalline mirror dimension while customers stare in shock
    - Mystical gateway appearing in a grocery store aisle, showing the Dark Dimension with floating rocks
    - Circular portal materializing on a city street, leading to an underwater bioluminescent city
    - Dimensional rift opening in an office building, revealing a sky realm of floating islands
    - Portal appearing in a subway station, showing a quantum realm with geometric structures

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
            content: 'You are a master of mystical portal magic who creates interdimensional gateways to other realities. Generate Dr. Strange-style circular portals with intricate mandala patterns that reveal glimpses of alien worlds, mirror dimensions, quantum realms, and impossible landscapes. Focus on the mystical energy and otherworldly destinations. Always return valid JSON.'
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
      
      console.log('Cleaned portal dimensions JSON:', jsonText);
      
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

      console.log('🌀 Generating portal dimensions image...');

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
      
      console.log('✅ Portal dimensions content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Portal dimensions content generation failed:', error);
      setError('Failed to generate portal dimensions content');
      throw new Error('Failed to generate portal dimensions content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generatePortalDimensionsContent,
    isGenerating,
    error
  };
};

export default usePortalDimensionsContent;
