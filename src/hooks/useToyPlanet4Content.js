import { useState, useCallback } from 'react';

const VISION_URL = 'https://api.segmind.com/v1/gpt-4o';
const IMG_URL    = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY    = () => import.meta.env.VITE_SEGMIND_API_KEY;

const useToyPlanet4Content = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]               = useState(null);

  const generatePlanet = useCallback(async (imageBase64) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Step 1 — vision model reads the photo and describes everything in detail
      const visionRes = await fetch(VISION_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
        body   : JSON.stringify({
          model      : 'gpt-4o',
          max_tokens : 300,
          messages   : [
            {
              role   : 'user',
              content: [
                {
                  type: 'text',
                  text: 'Describe this photo in precise detail for an artist who will recreate everyone in it as cartoon characters on a toy planet. Include: how many people, each person\'s approximate hair color, skin tone, clothing colors and style, what they are doing, their expressions. Then describe the setting: location type, key landscape features, time of day, colors in the scene. Be specific and visual. Write 3-5 sentences only, no lists.'
                },
                {
                  type     : 'image_url',
                  image_url: { url: imageBase64 }
                }
              ]
            }
          ]
        })
      });

      let sceneDescription = '';
      if (visionRes.ok) {
        const visionJson = await visionRes.json();
        sceneDescription = visionJson.choices[0].message.content.trim();
      }

      // Step 2 — build the planet prompt from the description
      const planetPrompt = sceneDescription
        ? `A tiny perfect spherical toy planet floating alone in pure black space. On its surface, recreated as charming Nintendo-style cartoon characters: ${sceneDescription}. The landscape and people from the scene wrap all the way around the sphere. Single dramatic light source from above. Super Mario Galaxy Nintendo 3D art style, vivid, magical, dreamlike, ultra detailed, pure black void background, no stars.`
        : 'A tiny perfect spherical toy planet floating alone in pure black space with people and landscape on its surface. Super Mario Galaxy Nintendo 3D art style, vivid, magical, dreamlike, ultra detailed.';

      // Step 3 — generate the planet
      const imgRes = await fetch(IMG_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
        body   : JSON.stringify({
          prompt            : planetPrompt,
          size              : '1024x1024',
          quality           : 'high',
          moderation        : 'auto',
          background        : 'opaque',
          output_compression: 100,
          output_format     : 'png',
          image_urls        : []
        })
      });

      if (!imgRes.ok) {
        const errText = await imgRes.text();
        throw new Error(`Image API ${imgRes.status}: ${errText}`);
      }

      const blob     = await imgRes.blob();
      const imageUrl = URL.createObjectURL(blob);

      if (!imageUrl) throw new Error('Could not extract image from response');

      return imageUrl;

    } catch (err) {
      console.error('Toy Planet 4 generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generatePlanet, isGenerating, error };
};

export default useToyPlanet4Content;
