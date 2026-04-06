import { useState, useCallback } from 'react';
import axios from 'axios';

const useUrbanOrigamiContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateUrbanOrigamiContent = useCallback(async () => {
    const prompt = `Generate an urban origami scenario with buildings that bend and reshape like paper crafts with visible crease lines.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the urban origami scene (20-40 words)
    - imagePrompt: Detailed prompt for generating the paper-craft architectural structures

    URBAN ORIGAMI CONCEPT:
    - Buildings that bend and reshape like paper crafts and origami
    - Visible crease lines and fold marks on architectural surfaces
    - Geometric transformations and paper-like architectural structures
    - Cities that look like they're made from folded paper
    - Architectural origami with complex geometric fold patterns

    URBAN ORIGAMI SCENARIOS:
    - Skyscrapers with visible fold lines bending like paper
    - Buildings reshaping through origami-style transformations
    - Paper-craft cities with geometric crease patterns
    - Architectural structures folding into impossible forms
    - Buildings made from giant sheets of folded paper
    - Urban landscapes that look like paper models
    - Origami-style bridges and infrastructure
    - Paper-craft apartment buildings with fold details
    - Geometric buildings with visible crease lines
    - Cities that transform through paper-folding mechanics

    IMAGE PROMPT REQUIREMENTS:
    - Buildings and structures that look like paper origami
    - Visible crease lines and fold marks on surfaces
    - Geometric paper-craft aesthetic with clean fold lines
    - Urban environment made from folded paper materials
    - Professional architectural visualization with origami elements
    - Clear demonstration of paper-folding mechanics in architecture
    - High detail on fold patterns and geometric transformations

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of architectural origami who creates paper-craft cities and buildings. Generate urban environments that look like they\'re made from folded paper with visible crease lines. Always return valid JSON.'
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
      setError('Failed to generate urban origami content');
      throw new Error('Failed to generate urban origami content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateUrbanOrigamiContent,
    isGenerating,
    error
  };
};

export default useUrbanOrigamiContent;
