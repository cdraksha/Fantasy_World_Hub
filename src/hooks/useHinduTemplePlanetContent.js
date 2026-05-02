import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Kailash — The Mountain of Gods',
    prompt: 'A tiny perfect spherical toy planet with clearly visible curved sides floating in pure black space. Disney Pixar 3D render quality. On the surface: a colossal Kailasa-style temple carved from black volcanic rock dominates the background. In the foreground two cute chibi cartoon Hindu priests in white dhotis stand before the temple entrance. Lava rivers glow orange between carved stone paths. Gold diyas flicker along the steps. Palm trees frame the scene. Warm dramatic light from below. Pure black void background.'
  },
  {
    title: 'The Golden Gopuram World',
    prompt: 'A tiny perfect spherical toy planet with clearly visible curved sides floating in pure black space. Disney Pixar 3D render quality. On the surface: a soaring South Indian gopuram covered in gold and vivid painted sculptures rises behind two cute chibi cartoon devotees in traditional silk attire. Marigold garlands drape the entrance. Brass diyas and oil lamps line the stone courtyard. Banana trees and lotus flowers around the base. Warm golden temple light. Pure black void background.'
  },
  {
    title: 'Hampi — The Empire of Boulders',
    prompt: 'A tiny perfect spherical toy planet with clearly visible curved sides floating in pure black space. Disney Pixar 3D render quality. On the surface: enormous orange granite boulders with a Vijayanagara stone chariot and temple complex behind. Two cute chibi cartoon figures in traditional Deccan attire stand beside the stone chariot. Carved elephant statues line the path. Golden afternoon sun casting long shadows. Coconut palms and sacred river visible. Pure black void background.'
  },
  {
    title: 'The Bridal Temple Planet',
    prompt: 'A tiny perfect spherical toy planet with clearly visible curved sides floating in pure black space. Disney Pixar 3D render quality. On the surface: an ancient Dravidian temple with intricate carved gopuram glows with warm light in the background. A cute chibi South Indian bride in purple silk saree and gold jewellery and a groom in white dhoti with flower garlands stand in the centre. Rangoli on the stone floor, diyas everywhere, marigold garlands draped on pillars, banana trees on either side. Pure black void background.'
  }
];

const useHinduTemplePlanetContent = () => {
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
            max_tokens : 260,
            temperature: 1.2,
            messages   : [
              {
                role   : 'system',
                content: 'You design ancient Hindu temple toy planets — tiny perfect spheres with clearly visible curved sides, floating in pure black space, rendered in Disney Pixar 3D animation quality. Each planet has: one ancient Indian temple (Dravidian gopuram, Nagara shikhara, Ellora cave temple, Vijayanagara stone complex, Hampi chariot, etc.) as the centrepiece, 1-2 cute chibi cartoon human characters in traditional Indian attire as the focus in the foreground, and rich decorative details (gold diyas, marigold garlands, rangoli, brass lamps, sacred rivers, palm trees, banana trees, lotus flowers, carved elephants). Vary the characters: bride and groom, priest and devotee, warrior and sage, dancer, pilgrim. Vary the temples: South Indian gopuram, North Indian shikhara, cave temple, stone chariot, riverside ghat temple, jungle temple. Vary the lighting: warm golden diya light, sunrise saffron, moonlit silver, festival lamp glow. Always floating in pure black void. Always Disney Pixar quality — not Nintendo, not photorealistic. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Invent a unique Hindu temple toy planet scene. Return: {"title":"<3-5 word evocative title>","prompt":"<140-170 word image prompt: describe the tiny spherical planet with clearly visible curved sides floating in pure black space, the specific temple in the background, the 1-2 chibi cartoon characters in the foreground with their attire and expression, the decorative details (diyas, garlands, rangoli, trees), the lighting and mood — then end with: Disney Pixar 3D render quality, vivid, warm, magical, pure black void background>"}'
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

      const finalPrompt = `${imagePrompt}. Tiny perfect sphere with clearly visible curved sides floating in pure black void, no stars, no background, pure black space. Disney Pixar 3D render quality, ultra detailed stone carvings, warm golden light from diyas, vivid colours, magical and sacred atmosphere.`;

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
      console.error('Hindu temple planet generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useHinduTemplePlanetContent;
