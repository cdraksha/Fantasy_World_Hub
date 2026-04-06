import { useState, useCallback } from 'react';
import axios from 'axios';

const useFoldingCitiesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFoldingCitiesContent = useCallback(async () => {
    const prompt = `Generate an Inception-inspired folding cities scenario where buildings fold, rotate, and meet in impossible ways.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the folding city scene (20-40 words)
    - imagePrompt: Detailed prompt for generating the Inception-style folding architecture

    FOLDING CITIES CONCEPT:
    - Inception-style architectural impossibilities and gravity-defying urban landscapes
    - Buildings that fold, rotate, and meet in impossible ways like the Paris scene
    - Streets bending upward to connect with other streets
    - People walking on vertical surfaces and impossible angles
    - Reality-bending architecture that defies physics and logic

    ARCHITECTURAL FOLDING SCENARIOS:

    CLASSIC INCEPTION SCENES:
    - Parisian streets folding upward to meet each other at 180 degrees
    - Buildings rotating and connecting in impossible geometric patterns
    - Mirror reflections of cityscapes creating infinite urban loops
    - Gravity-defying walkways where people walk on walls and ceilings
    - Streets that curve and fold back on themselves in impossible ways
    - Skyscrapers bending like flexible materials to touch other buildings
    - Urban environments that fold like paper origami structures
    - Bridges that connect to themselves in paradoxical loops
    - City blocks that rotate and rearrange in real-time
    - Architectural elements that defy perspective and spatial logic

    URBAN FOLDING TYPES:
    - Street-level folding where roads bend upward to meet
    - Skyscraper folding where tall buildings bend and connect
    - Bridge folding creating impossible connection points
    - Park folding where green spaces wrap around buildings
    - Subway folding with underground tunnels becoming vertical
    - Residential folding with apartment blocks bending together
    - Commercial folding with shopping districts creating loops
    - Industrial folding with factory complexes defying gravity
    - Historic folding with ancient architecture bending impossibly
    - Futuristic folding with sci-fi buildings in impossible configurations

    VISUAL REQUIREMENTS:
    - Inception-style cinematic quality and dramatic perspective
    - Clear demonstration of impossible architectural physics
    - People in the scene to show scale and impossibility
    - Dramatic lighting emphasizing the folding geometry
    - Professional architectural visualization quality
    - Realistic textures and materials despite impossible geometry
    - Clear depth and perspective showing the folding effect
    - Urban environment with recognizable city elements
    - Gravity-defying elements that challenge perception
    - Cinematic composition worthy of Christopher Nolan

    DESCRIPTION STYLE:
    - Emphasize the impossibility and wonder of the folding architecture
    - Mention specific architectural elements that are folding
    - Keep it mysterious and awe-inspiring
    - Reference the physics-defying nature
    - Make it sound cinematic and dramatic

    IMAGE PROMPT REQUIREMENTS:
    - Inception-style folding city architecture with impossible geometry
    - Buildings, streets, or structures folding and connecting impossibly
    - People in the scene showing scale and walking on impossible surfaces
    - Dramatic cinematic lighting and perspective
    - Professional architectural visualization quality
    - Clear demonstration of gravity-defying physics
    - Urban environment with realistic textures and materials
    - Christopher Nolan Inception movie aesthetic and quality
    - Reality-bending visual effects that challenge perception
    - High detail on both the folding mechanics and architectural elements

    EXAMPLE SCENARIOS:
    - Parisian boulevard folding upward 180 degrees to meet itself while pedestrians walk on vertical street surfaces
    - Manhattan skyscrapers bending like flexible towers to connect their tops in impossible geometric patterns
    - London bridge folding in half to create a loop where traffic drives in impossible circles
    - Tokyo streets rotating and folding to create multi-level urban origami with people walking on all surfaces
    - San Francisco hills folding backwards to create impossible slopes where gravity works sideways

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
            content: 'You are a master of Inception-style architectural impossibilities who creates mind-bending folding city scenarios. Generate realistic urban environments that fold and bend in ways that defy physics, inspired by Christopher Nolan\'s Inception. Always return valid JSON.'
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
      
      console.log('Cleaned folding cities JSON:', jsonText);
      
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

      console.log('🏗️ Generating Inception-style folding cities image...');

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
      
      console.log('✅ Folding cities content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Folding cities content generation failed:', error);
      setError('Failed to generate folding cities content');
      throw new Error('Failed to generate folding cities content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateFoldingCitiesContent,
    isGenerating,
    error
  };
};

export default useFoldingCitiesContent;
