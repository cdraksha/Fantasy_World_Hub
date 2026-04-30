import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Verdania — The Forest Moon',
    prompt: 'A tiny toy planet floating in pure black space, Super Mario Galaxy style. A perfect sphere covered in lush forest — giant cartoonish trees with round fluffy canopies, a winding wooden bridge between two massive trees, glowing lanterns hanging from branches, tiny mushroom houses at the roots. A bold single directional light from one side creates a clear day and night hemisphere. Stars scattered in the black void. Vibrant saturated colours, Nintendo 3D render quality, toy-like proportions, ultra-detailed.'
  },
  {
    title: 'Cogsworth — The Steampunk Planet',
    prompt: 'A tiny toy planet floating in pure black space, Super Mario Galaxy style. A perfect dark-brown sphere covered in steampunk machinery — a tall brass clock tower at the top, spinning golden gears half-embedded in the surface, belching chimneys with puffs of smoke, steam pipes wrapping around the equator, a tiny airship docked at a landing mast. Strong single directional light, warm amber glow from furnace vents. Stars in the black void. Vibrant, detailed Nintendo 3D render quality, toy-like proportions.'
  },
  {
    title: 'Aquaria — The Ocean World',
    prompt: 'A tiny toy planet floating in pure black space, Super Mario Galaxy style. A perfect ocean-blue sphere with a sandy island at the top — a red and white striped lighthouse with a blinking beacon, palm trees leaning over turquoise water, colourful coral blobs dotting the surface, a tiny wooden pier. Bold single directional sunlight reflecting off the water. Stars in the black void. Vivid saturated colours, Nintendo 3D render quality, toy-like proportions, ultra-detailed.'
  },
  {
    title: 'Mycelia — The Mushroom Planet',
    prompt: 'A tiny toy planet floating in pure black space, Super Mario Galaxy style. A perfect deep red sphere covered in giant cartoon mushrooms — one enormous central mushroom with a bright spotted cap towering above the rest, dozens of smaller colourful mushrooms scattered across the surface, tiny glowing spores drifting off into space. Strong single directional light. Stars in the black void. Vivid saturated Nintendo colours, toy-like proportions, ultra-detailed 3D render quality.'
  }
];

const useToyPlanetContent = () => {
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
            max_tokens : 220,
            temperature: 1.2,
            messages   : [
              {
                role   : 'system',
                content: 'You design whimsical toy planets inspired by Super Mario Galaxy (2007). Each planet is a tiny perfect sphere floating in pure black space, covered in one distinct theme — forest, steampunk, ocean, crystal, mushroom, skull desert, candy, lava, ice, jungle, clockwork, coral reef, haunted, cherry blossom, etc. Objects on the surface are large and cartoonish relative to the planet size. There is always one dominant landmark feature (a giant tree, a clock tower, a lighthouse, a crystal spire). Strong single directional lighting creates a clear lit and shadow hemisphere. Pure black space with stars. Nintendo 3D art quality, vivid toy-like colours. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Invent a unique toy planet and write a detailed image prompt for it. Return: {"title":"<planet name> — <3-4 word subtitle>","prompt":"<120-150 word image prompt: describe the planet sphere, its theme, key surface features, dominant landmark, colours, lighting, space background, art style>"}'
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

      const finalPrompt = `${imagePrompt}. Super Mario Galaxy art style, Nintendo 3D render, toy planet floating in pure black starfield, vivid saturated colours, single strong directional light, ultra-detailed surface features, no background landscape, no atmosphere glow, pure black void space.`;

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
      console.error('Toy planet generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useToyPlanetContent;
