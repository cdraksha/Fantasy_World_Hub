import { useState, useCallback } from 'react';
import axios from 'axios';

const useDreamArchitectureContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDreamArchitectureContent = useCallback(async () => {
    const prompt = `Generate an Inception-inspired dream architecture scenario with limbo beaches, infinite staircases, and floating structures.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the dream architecture scene (20-40 words)
    - imagePrompt: Detailed prompt for generating the Inception-style dream environment

    DREAM ARCHITECTURE CONCEPT:
    - Inception-style reality-bending environments from limbo and dream layers
    - Infinite staircases, floating structures, and impossible architectural spaces
    - Limbo beaches with architectural fragments scattered across landscapes
    - Gravity-defying buildings and structures suspended in dreamlike space
    - Surreal environments that exist only in the deepest layers of dreams

    DREAM ARCHITECTURE SCENARIOS:
    - Infinite staircases spiraling through clouds and void
    - Limbo beaches with architectural fragments and building pieces
    - Floating city blocks suspended in dreamlike space
    - Impossible bridges connecting nothing to nowhere
    - Architectural ruins defying gravity and logic
    - Endless corridors and rooms that loop impossibly
    - Floating staircases leading to architectural fragments
    - Dream palaces with rooms that exist in multiple dimensions
    - Surreal libraries with books floating in architectural space
    - Impossible cathedrals with gravity-defying spires

    IMAGE PROMPT REQUIREMENTS:
    - Inception-style dream architecture with surreal, impossible structures
    - Limbo-like environments with floating architectural elements
    - Infinite or impossible staircases, bridges, and structural elements
    - Dreamlike quality with ethereal lighting and atmosphere
    - Professional architectural visualization with surreal elements
    - Christopher Nolan Inception movie aesthetic and quality
    - Gravity-defying structures that exist only in dreams
    - High detail on architectural elements and dreamlike atmosphere

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of Inception-style dream architecture who creates surreal, impossible architectural environments. Generate dreamlike structures that exist only in the deepest layers of consciousness. Always return valid JSON.'
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
        {
          prompt: scenarioData.imagePrompt,
          negative_prompt: 'modern technology, contemporary design, realistic photography, blurry, low quality',
          aspect_ratio: '4:3'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      setError('Failed to generate dream architecture content');
      throw new Error('Failed to generate dream architecture content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateDreamArchitectureContent,
    isGenerating,
    error
  };
};

export default useDreamArchitectureContent;
