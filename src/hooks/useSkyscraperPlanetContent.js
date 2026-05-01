import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'The Manhattan Sphere',
    prompt: 'A tiny perfect spherical toy planet floating alone in pure black space. The entire surface is covered in classic New York City skyscrapers — Empire State Building, Chrysler Building, glass towers — all curving around the sphere. Yellow taxis visible at street level, water tanks on rooftops, steam rising from grates. Golden hour light from one side casting long shadows. Super Mario Galaxy Nintendo 3D art style, ultra detailed, vivid, magical.'
  },
  {
    title: 'The Dubai Planet',
    prompt: 'A tiny perfect spherical toy planet floating alone in pure black space. The entire surface is covered in Dubai-style mega-towers — Burj Khalifa-like spires, twisting glass supertalls, gold and chrome facades — all curving around the sphere. Dramatic uplighting from below, desert sand visible at the base of the buildings. Night scene with glowing windows. Super Mario Galaxy Nintendo 3D art style, ultra detailed, vivid, magical.'
  },
  {
    title: 'The Tokyo Neon Planet',
    prompt: 'A tiny perfect spherical toy planet floating alone in pure black space. The entire surface is covered in Tokyo-style skyscrapers — neon signs in Japanese, LED billboards, dense urban towers — wrapping all the way around the sphere. A bullet train elevated track circles the equator. Blue hour twilight, neon reflections glowing. Super Mario Galaxy Nintendo 3D art style, ultra detailed, vivid, magical.'
  },
  {
    title: 'The Flooded City Planet',
    prompt: 'A tiny perfect spherical toy planet floating alone in pure black space. Skyscrapers rise from water covering the lower half of the planet — only the upper floors visible above the waterline, windows glowing. A small wooden boat drifts between the towers. The tops of the buildings are lit by soft golden light, reflections shimmering in the water below. Super Mario Galaxy Nintendo 3D art style, ultra detailed, vivid, magical.'
  }
];

const useSkyscraperPlanetContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]               = useState(null);

  const generateContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      let title, imagePrompt;

      try {
        const gptRes = await fetch(GPT4_URL, {
          method : 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
          body   : JSON.stringify({
            model      : 'gpt-4',
            max_tokens : 250,
            temperature: 1.2,
            messages   : [
              {
                role   : 'system',
                content: 'You design tiny toy city planets in the style of Super Mario Galaxy — perfect miniature spheres floating alone in black space, every surface wrapped in dense skyscrapers and urban architecture from real world cities. Each planet captures the personality of a specific city or architectural style: Manhattan with classic Art Deco towers and yellow cabs; Dubai with twisting supertalls and gold facades; Tokyo with neon signs and bullet trains circling the equator; Shanghai with the Pearl Tower and riverfront density; Hong Kong with dense hillside towers and harbour lights; Chicago with Brutalist and glass towers on a lakefront; London with The Shard and St Paul\'s visible among modern towers; Singapore with futuristic green-clad towers and sky bridges; Mumbai with dense chaotic urban sprawl meeting the sea; São Paulo with endless concrete towers in every direction; Paris with Haussmann rooflines punctuated by modern towers; Frankfurt banking district glass towers at night. Vary the time of day: dawn, golden hour, blue hour, full night with glowing windows, midday sun. Always include small life details: street level activity, vehicles, lights, steam, cranes, elevated trains. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Invent a unique skyscraper toy planet based on a real world city. Return: {"title":"<city name or poetic title, 3-5 words>","prompt":"<120-150 word image prompt: describe the tiny spherical planet floating in pure black space, the city\'s architectural style and signature buildings curving around the sphere, time of day, lighting, small life details — then end with: Super Mario Galaxy Nintendo 3D art style, ultra detailed, vivid, magical>"}'
              }
            ]
          })
        });

        if (gptRes.ok) {
          const gptJson = await gptRes.json();
          const parsed  = JSON.parse(
            gptJson.choices[0].message.content.replace(/```json|```/g, '').trim()
          );
          title       = parsed.title;
          imagePrompt = parsed.prompt;
        }
      } catch {
        // GPT-4 failed — use fallback
      }

      if (!title || !imagePrompt) {
        const fb   = FALLBACK_SCENES[Math.floor(Math.random() * FALLBACK_SCENES.length)];
        title       = fb.title;
        imagePrompt = fb.prompt;
      }

      const finalPrompt = `${imagePrompt}. Tiny perfect sphere floating in pure black void, buildings curving around the surface, city lights glowing, single dramatic light source, Super Mario Galaxy Nintendo render quality, no background, pure black space, whimsical and magical, ultra detailed urban architecture.`;

      const imgRes = await fetch(IMG_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
        body   : JSON.stringify({
          prompt            : finalPrompt,
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

      return { title, imageUrl };

    } catch (err) {
      console.error('Skyscraper planet generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useSkyscraperPlanetContent;
