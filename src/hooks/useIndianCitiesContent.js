import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Mumbai Rooftop at Golden Hour',
    prompt: 'Photorealistic cinematic shot from a Mumbai rooftop at golden hour. Dozens of water tanks and satellite dishes silhouetted against a hazy orange sky. Laundry lines strung between buildings. Below, a dense maze of narrow lanes packed with shops, autos, and people. Warm dusty light. Shot on 35mm f/2.0, shallow depth of field, film grain, ultra-realistic.'
  },
  {
    title: 'Varanasi Ghat at Dawn',
    prompt: 'Photorealistic cinematic shot of Varanasi ghats at dawn. Soft pink-gold mist rising off the Ganges. Priests performing aarti with brass lamps. Pilgrims descending worn stone steps to bathe. Small wooden boats on still water reflecting the sky. Ancient temple spires behind. Shot on medium format camera, natural light only, ultra-detailed, film grain.'
  },
  {
    title: 'Old Delhi Street Market — Chandni Chowk',
    prompt: 'Photorealistic cinematic street photograph in Chandni Chowk, Old Delhi. Narrow lane packed with cycle rickshaws, handcarts, and crowds. Colorful shop fronts with Hindi signage. Spice sellers, fabric bolls, silver jewellers. Tangle of electric wires overhead. Afternoon haze and dust. Shot on 28mm full-frame, f/4, street photography style, ultra-detailed, natural color grading.'
  }
];

const useIndianCitiesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]               = useState(null);

  const generateContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // ── Step 1: GPT-4 picks a scene and writes the photorealistic prompt ──
      let title, imagePrompt;

      try {
        const gptRes = await fetch(GPT4_URL, {
          method : 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
          body   : JSON.stringify({
            model      : 'gpt-4',
            max_tokens : 220,
            temperature: 1.0,
            messages   : [
              {
                role   : 'system',
                content: 'You are a world-class travel photographer specialising in Indian cities. You compose stunning photorealistic scenes — rooftops, street markets, railway stations, chai stalls, ghats, old havelis, bazaars, temple lanes, auto-rickshaw junctions — from cities like Mumbai, Delhi, Varanasi, Kolkata, Jaipur, Chennai, Hyderabad, Amritsar, Bangalore, Cochin. No fantasy, no surrealism — purely real, gritty, beautiful India. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick one specific Indian city scene and write a cinematic photorealistic image prompt for it. Return: {"title":"<5-8 word descriptive English title>","prompt":"<100-140 word ultra-detailed photorealistic image prompt, specify city, time of day, camera settings, lighting, mood>"}'
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

      // ── Step 2: generate the image with gpt-image-2 ──
      const finalPrompt = `${imagePrompt}. Photorealistic, cinematic composition, natural lighting, ultra-detailed textures, professional photography, authentic India, no illustration, no painting, no fantasy elements.`;

      const imgRes = await fetch(IMG_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
        body   : JSON.stringify({
          prompt            : finalPrompt,
          size              : '1536x1024',
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
      console.error('Indian cities generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useIndianCitiesContent;
