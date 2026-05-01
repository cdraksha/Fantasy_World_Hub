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
      // Step 1 — vision model reads the photo and gives cartoon-friendly description
      const visionRes = await fetch(VISION_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
        body   : JSON.stringify({
          model      : 'gpt-4o',
          max_tokens : 200,
          messages   : [
            {
              role   : 'user',
              content: [
                {
                  type: 'text',
                  text: 'You are helping create a Nintendo cartoon illustration. Look at this photo and describe ONLY: how many people, each person\'s hair color, skin color, clothing color, and what they are wearing. Then in one sentence describe the setting (mountain, beach, city etc) and its main colors. Use simple cartoon-friendly language. No photographic detail. 2-3 sentences max.'
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

      // Step 2 — generate a brand new cartoon toy planet
      const planetPrompt = sceneDescription
        ? `Brand new digital cartoon illustration — NOT a photograph, NOT realistic, NOT a transformed image. A tiny perfect spherical toy planet floating alone in pure black space. On its surface as cute Nintendo 3D cartoon characters: ${sceneDescription}. The characters and landscape are fully illustrated in bright bold colours, cel-shaded, cartoon style. The planet is a complete sphere floating in pure black void with no stars. Single dramatic light from above. Super Mario Galaxy Nintendo art style. Vivid, joyful, magical. No photorealism whatsoever.`
        : 'Brand new digital cartoon illustration of a tiny perfect spherical toy planet floating in pure black space. Cute Nintendo 3D cartoon characters on the surface. Super Mario Galaxy art style, vivid, bright, magical. No photorealism.';

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
