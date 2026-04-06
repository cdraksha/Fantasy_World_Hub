import { useState, useCallback } from 'react';
import axios from 'axios';

const useOrbitalMegastructuresContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateOrbitalMegastructuresContent = useCallback(async () => {
    const prompt = `Generate an orbital megastructure scenario showing massive space infrastructure around Earth.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the orbital megastructure (20-40 words)
    - imagePrompt: Detailed prompt for generating the image showing this massive space infrastructure

    ORBITAL MEGASTRUCTURES CONCEPT:
    - Massive space cities, highways, elevators, and infrastructure around Earth
    - Earth should be visible in the background, often dwarfed by the structures
    - Impossible scale engineering that defies current physics
    - Breathtaking orbital vistas with mind-bending architecture
    - Transportation networks connecting space habitats

    MEGASTRUCTURE IDEAS:
    - Elysium-style rotating ring habitats with spokes and artificial gravity
    - Massive rotating sphere habitats with cities on the inner surface
    - Disc-shaped space stations spinning for artificial gravity
    - Crystal-shaped geometric habitats with faceted surfaces
    - Organic flowing space structures with bio-inspired architecture
    - Pyramid megastructures combining ancient and space-age design
    - Multi-ring complexes with connected rotating wheels
    - Spiral habitats twisted around central axes
    - Space elevators reaching from Earth's surface to orbital stations
    - Massive space highways weaving between different habitat shapes
    - Orbital tramlines connecting rings, spheres, and disc stations
    - Continent-sized floating habitats in various geometric forms
    - Cylindrical O'Neill cylinders with rotating sections
    - Floating island chains of connected diverse habitats
    - Space highway interchanges with multiple levels between structures
    - Orbital gardens - pure green space habitats in sphere or ring form
    - Massive space bridges linking rotating and static megastructures
    - Space cables and suspension networks between orbital structures

    DESCRIPTION STYLE:
    - Write it as a simple, matter-of-fact description
    - Focus on the scale and engineering marvel
    - Don't over-explain, just describe what you see
    - Keep it short and impactful (1-2 sentences max)
    - Emphasize the massive scale compared to Earth

    IMAGE PROMPT REQUIREMENTS:
    - Show Earth prominently in the background for scale reference
    - The megastructure should be MASSIVE - dwarfing normal space stations
    - Realistic space photography style with dramatic lighting
    - Show the engineering details and architectural complexity
    - Include multiple levels, sections, or connected components
    - Make it look like a real photograph taken from space
    - Emphasize the impossible scale and grandeur
    - Good contrast between Earth's natural beauty and artificial structures
    - Show how the structure interacts with or connects to Earth
    - Make it look both beautiful and technically impressive
    - Include details like lights, windows, docking bays, or transportation routes

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
            content: 'You are a creative scenario generator who creates orbital megastructure concepts. Generate massive space infrastructure around Earth that defies current engineering limits. Think space cities, orbital highways, space elevators, ring worlds, and other impossible-scale structures. Make it sound impressive but matter-of-fact. Always return valid JSON.'
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
      
      console.log('Cleaned orbital megastructures JSON:', jsonText);
      
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

      console.log('🌌 Generating orbital megastructures image...');

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: scenarioData.imagePrompt,
          negative_prompt: 'blurry, low quality, distorted, unrealistic',
          aspect_ratio: '4:3'
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
      
      console.log('✅ Orbital megastructures content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Orbital megastructures content generation failed:', error);
      setError('Failed to generate orbital megastructures content');
      throw new Error('Failed to generate orbital megastructures content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateOrbitalMegastructuresContent,
    isGenerating,
    error
  };
};

export default useOrbitalMegastructuresContent;
