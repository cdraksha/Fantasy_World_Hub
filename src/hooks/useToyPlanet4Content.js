import { useState, useCallback } from 'react';

const IMG_URL   = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY   = () => import.meta.env.VITE_SEGMIND_API_KEY;
const IMGBB_KEY = () => import.meta.env.VITE_IMGBB_API_KEY;

const uploadToImgbb = async (base64Data) => {
  const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  const formData = new FormData();
  formData.append('image', base64);
  formData.append('key', IMGBB_KEY());
  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
  const json = await res.json();
  return json.data.url;
};

const useToyPlanet4Content = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]               = useState(null);

  const generatePlanet = useCallback(async (imageBase64) => {
    setIsGenerating(true);
    setError(null);

    try {
      const hostedUrl = await uploadToImgbb(imageBase64);

      const prompt = 'Transform this photo into a tiny perfect spherical toy planet floating alone in pure black space. Whatever is in the photo — people, mountains, buildings, landscapes, animals — becomes the surface of a miniature world, wrapping all the way around the sphere. The subjects and scenery from the photo are visible on the planet surface. The sphere floats completely alone in a pure black void with no stars. Single dramatic light source from above. Super Mario Galaxy Nintendo 3D art style, vivid, magical, dreamlike, ultra detailed.';

      const imgRes = await fetch(IMG_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
        body   : JSON.stringify({
          prompt            : prompt,
          size              : '1024x1024',
          quality           : 'high',
          moderation        : 'auto',
          background        : 'opaque',
          output_compression: 100,
          output_format     : 'png',
          image_urls        : [hostedUrl]
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
