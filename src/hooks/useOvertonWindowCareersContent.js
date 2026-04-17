import { useState, useCallback } from 'react';

const useOvertonWindowCareersContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateOvertonWindowCareers = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const careerResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You generate career concepts for a visual "Overton Window Parallel Universes" experience showing 7 career paths across parallel realities.

Structure:
- middle: A specific, interesting career (current reality)
- left1: Similar career (same industry, slightly different role)
- left2: Further career (different industry, related skills)
- left3: Completely different career (opposite lifestyle/values from middle)
- right1: EXACT OPPOSITE of left1 (contrasting in every meaningful way)
- right2: EXACT OPPOSITE of left2
- right3: EXACT OPPOSITE of left3

Rules for opposites:
- If left1 is indoors → right1 is outdoors
- If left1 is creative → right1 is analytical/mechanical
- If left1 is solitary → right1 is social
- If left1 is high-tech → right1 is primitive/traditional
- Make the opposites truly contrasting and visually distinct

For each career provide:
- label: 2-4 word career name
- visual_description: 15-20 word cinematic image prompt (specific scene, setting, action)

Return ONLY valid JSON, no extra text:
{
  "middle": {"label": "...", "visual_description": "..."},
  "left1": {"label": "...", "visual_description": "..."},
  "left2": {"label": "...", "visual_description": "..."},
  "left3": {"label": "...", "visual_description": "..."},
  "right1": {"label": "...", "visual_description": "..."},
  "right2": {"label": "...", "visual_description": "..."},
  "right3": {"label": "...", "visual_description": "..."}
}`
            },
            {
              role: 'user',
              content: 'Generate a diverse, visually interesting set of 7 parallel universe careers. Pick an unexpected but specific starting career for the middle. Make the opposites truly contrasting.'
            }
          ],
          model: 'gpt-4',
          max_tokens: 700,
          temperature: 0.95
        })
      });

      let careers = null;
      if (careerResponse.ok) {
        const careerData = await careerResponse.json();
        const content = careerData.choices[0].message.content;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          careers = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
          console.error('Failed to parse careers JSON:', e);
        }
      }

      if (!careers) {
        careers = {
          middle: { label: 'Marine Biologist', visual_description: 'scientist studying coral reefs underwater, scuba gear, bioluminescent ocean, tropical fish surrounding' },
          left1: { label: 'Ocean Engineer', visual_description: 'engineer designing underwater turbines, technical blueprints, submarine dock, deep sea equipment' },
          left2: { label: 'Desert Botanist', visual_description: 'scientist cataloguing rare cacti in Sahara, magnifying glass, golden dunes, field notebook' },
          left3: { label: 'Space Miner', visual_description: 'astronaut drilling asteroid in zero gravity, sparks flying, star field, mining exosuit' },
          right1: { label: 'Mountain Logger', visual_description: 'logger felling pine trees on steep slope, chainsaw, dense misty forest, timber yard' },
          right2: { label: 'Urban Architect', visual_description: 'architect presenting glass skyscraper model, city skyline, blueprints spread on desk' },
          right3: { label: 'Underground Farmer', visual_description: 'farmer tending hydroponic crops in cave, artificial grow lights, roots hanging, tunnel farm' }
        };
      }

      const positions = ['left3', 'left2', 'left1', 'middle', 'right1', 'right2', 'right3'];

      const imagePromises = positions.map(pos =>
        fetch('https://api.segmind.com/v1/nano-banana', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
          },
          body: JSON.stringify({
            prompt: `${careers[pos].label}, ${careers[pos].visual_description}, cinematic lighting, professional photography, high detail, vivid colors, 8k`,
            negative_prompt: 'blurry, low quality, distorted, ugly, text, watermark, amateur, dark, gloomy',
            width: 512,
            height: 512,
            num_inference_steps: 20,
            guidance_scale: 7.5,
            seed: Math.floor(Math.random() * 1000000)
          })
        }).then(async res => {
          if (res.ok) {
            const blob = await res.blob();
            return { pos, url: URL.createObjectURL(blob) };
          }
          return { pos, url: null };
        }).catch(() => ({ pos, url: null }))
      );

      const imageResults = await Promise.all(imagePromises);

      const images = {};
      imageResults.forEach(({ pos, url }) => {
        images[pos] = url;
      });

      return { careers, images, positions };

    } catch (err) {
      console.error('Overton Window Careers generation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateOvertonWindowCareers,
    isGenerating,
    error
  };
};

export default useOvertonWindowCareersContent;
