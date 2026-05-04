import { useState, useCallback } from 'react';
import axios from 'axios';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/nano-banana';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Paris — The Cosmic Ring',
    prompt: 'Wide aerial panoramic anime painting of the entire city of Paris, tiny and complete far below — Eiffel Tower, Seine river, all of Haussmann Paris visible at once. A magnificent glowing cosmic ring encircles the entire city like a celestial halo, its accretion disk shimmering in electric violet and gold light surrounding the whole skyline. The sky glows beautifully around the ring. Painterly anime style, Makoto Shinkai sky quality, dramatic painted clouds, rich colour, sweeping awe-inspiring scale.'
  },
  {
    title: 'Tokyo — The Celestial Halo',
    prompt: 'Wide aerial panoramic anime painting of the entire city of Tokyo, tiny and complete — Shinjuku, Tokyo Tower, the bay, all visible from high above. A magnificent glowing cosmic ring encircles the entire city, its shimmering purple and white accretion disk forming a perfect celestial halo in the sky. City lights twinkle beneath the cosmic ring. The sky shimmers with beautiful light. Painterly anime style, Makoto Shinkai sky quality, dramatic painted clouds, rich colour, sweeping awe-inspiring scale.'
  },
  {
    title: 'New York — The Manhattan Ring',
    prompt: 'Wide aerial panoramic anime painting of the entire island of Manhattan and New York City, tiny and complete — all boroughs, the Hudson, Central Park visible at once. A magnificent glowing cosmic ring encircles the whole island like a celestial crown, its blue-violet accretion disk casting beautiful light over the city grid below. The sky bends with luminous cosmic light. Painterly anime style, Makoto Shinkai sky quality, dramatic painted clouds, rich colour, sweeping awe-inspiring scale.'
  },
  {
    title: 'Mumbai — The Arabian Ring',
    prompt: 'Wide aerial panoramic anime painting of the entire city of Mumbai, tiny and complete — Marine Drive, Bandra-Worli Sea Link, the Arabian Sea all visible from far above. A magnificent glowing cosmic ring surrounds the whole peninsula like a celestial halo, its violet and amber accretion disk reflecting in the sea below. The sky shimmers beautifully around the ring. Painterly anime style, Makoto Shinkai sky quality, dramatic painted clouds, rich colour, sweeping awe-inspiring scale.'
  }
];

const useBlackholeCitiesContent = () => {
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
            temperature: 1.1,
            messages   : [
              {
                role   : 'system',
                content: 'You are an anime concept artist specialising in sweeping wide-angle cosmic city paintings. Your signature: the ENTIRE city is visible from far above or far away — tiny, complete, recognisable — while a colossal glowing cosmic ring encircles the whole city like a celestial halo or crown, its shimmering accretion disk of violet, gold, and electric blue light surrounding the skyline. The city sits intact and beautiful, impossibly small inside the luminous ring. Cities: Paris (Eiffel Tower tiny below), Tokyo (all of it from above), New York (Manhattan island encircled), Mumbai (peninsula in the ring), London (Thames curving inside the halo), Dubai (supertalls tiny in the ring), Seoul, Istanbul, Rome, Sydney Opera House. Your art style is painterly anime — Makoto Shinkai sky quality, rich dramatic painted clouds, deep colour, sweeping God-view scale, emotional and awe-inspiring. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick one city and describe the wide-angle cosmic ring scene. Return: {"title":"<City Name> — <3-5 word subtitle>","prompt":"<130-150 word image prompt: wide aerial or panoramic view of the ENTIRE city visible and tiny, the colossal glowing ring encircling the whole city like a celestial halo, the beautiful accretion disk colors, the sky shimmering with cosmic light around the ring, the lighting and mood — then end with: painterly anime style, Makoto Shinkai sky quality, dramatic painted clouds, rich colour, sweeping scale, awe-inspiring>"}'
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

      const finalPrompt = `${imagePrompt}. Painterly anime illustration, wide sweeping aerial composition showing the entire city tiny and complete inside the glowing cosmic ring, Makoto Shinkai painting quality, rich dramatic skies, beautiful accretion disk light, no photography, no realism, no close-up, full city visible.`;

      const imgRes = await axios.post(
        IMG_URL,
        {
          prompt              : finalPrompt,
          samples             : 1,
          scheduler           : 'DPM++ 2M',
          num_inference_steps : 25,
          guidance_scale      : 7.5,
          seed                : Math.floor(Math.random() * 1000000),
          img_width           : 1024,
          img_height          : 576,
          base64              : false
        },
        {
          headers     : { 'x-api-key': API_KEY(), 'Content-Type': 'application/json' },
          responseType: 'blob',
          timeout     : 90000
        }
      );

      const imageUrl = URL.createObjectURL(imgRes.data);
      if (!imageUrl) throw new Error('Could not extract image from response');

      return { title, imageUrl };

    } catch (err) {
      console.error('Blackhole cities generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useBlackholeCitiesContent;
