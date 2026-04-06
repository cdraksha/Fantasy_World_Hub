import { useState, useCallback } from 'react';
import axios from 'axios';

const useImpossibleGeometriesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateImpossibleGeometriesContent = useCallback(async () => {
    const prompt = `Generate an impossible geometries scenario with Penrose stairs, M.C. Escher-like loops, and gravity-shifting architectural paradoxes.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the impossible geometry scene (20-40 words)
    - imagePrompt: Detailed prompt for generating the impossible geometric architecture

    IMPOSSIBLE GEOMETRIES CONCEPT:
    - Penrose stairs, triangles, and other mathematical impossibilities
    - M.C. Escher-inspired architectural paradoxes and optical illusions
    - Gravity-shifting environments where up and down lose meaning
    - Geometric structures that connect in logically impossible ways
    - Mathematical paradoxes made into architectural reality

    IMPOSSIBLE GEOMETRY SCENARIOS:
    - Penrose staircases that loop infinitely upward
    - Buildings with rooms larger inside than outside
    - Corridors that lead back to themselves impossibly
    - Gravity wells where people walk on walls and ceilings
    - Architectural Möbius strips and Klein bottles
    - Impossible triangular buildings like Penrose triangles
    - Staircases that go up but end up going down
    - Rooms with impossible perspective and vanishing points
    - Buildings that exist in multiple dimensions simultaneously
    - Geometric structures that defy Euclidean space

    IMAGE PROMPT REQUIREMENTS:
    - Impossible geometric architecture with mathematical paradoxes
    - Penrose stairs, triangles, or other impossible geometric forms
    - M.C. Escher-style optical illusions and perspective tricks
    - People in the scene to demonstrate the impossible nature
    - Professional architectural visualization with impossible elements
    - Clear demonstration of geometric paradoxes and impossibilities
    - High detail on geometric structures and mathematical impossibilities

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of impossible geometries and mathematical paradoxes who creates M.C. Escher-style architectural impossibilities. Generate geometric structures that defy logic and mathematics. Always return valid JSON.'
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
      let jsonText = contentText;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1];
      }
      
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
      
      jsonText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
      
      let scenarioData;
      try {
        scenarioData = JSON.parse(jsonText);
      } catch (parseError) {
        throw new Error('Failed to parse scenario JSON');
      }

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
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 60000
        }
      );

      const imageUrl = URL.createObjectURL(imageResponse.data);
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      setError('Failed to generate impossible geometries content');
      throw new Error('Failed to generate impossible geometries content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateImpossibleGeometriesContent,
    isGenerating,
    error
  };
};

export default useImpossibleGeometriesContent;
