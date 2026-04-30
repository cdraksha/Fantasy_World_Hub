import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Mumbai Rooftop at Golden Hour',
    prompt: 'Traditional watercolor painting of a Mumbai rooftop at golden hour. Water tanks and satellite dishes silhouetted against a warm amber sky. Laundry lines strung between buildings. Loose wet-on-wet washes of ochre and burnt sienna. Visible brushstrokes, soft bleeding edges, paper texture showing through. Luminous atmospheric haze, impressionistic crowd below. Watercolor on cold-press paper, warm palette.'
  },
  {
    title: 'Varanasi Ghat at Dawn',
    prompt: 'Traditional watercolor painting of Varanasi ghats at dawn. Soft pink and lavender washes reflect in the still Ganges. Priests with brass lamps, pilgrims on worn stone steps, small wooden boats. Ancient temple spires dissolving into morning mist. Loose fluid brushwork, wet-on-wet blending, white paper left for highlights. Serene, atmospheric, luminous watercolor on textured paper.'
  },
  {
    title: 'Old Delhi Lane — Chandni Chowk',
    prompt: 'Traditional watercolor painting of a narrow Chandni Chowk lane in Old Delhi. Cycle rickshaws and handcarts in a crowded bazaar. Colorful shop fronts with Hindi signage, spice sellers, tangled electric wires overhead. Rich jewel tones — saffron, crimson, cobalt. Expressive loose brushwork, ink line details, wet washes bleeding into each other. Watercolor on textured paper.'
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
                content: 'You are a master watercolor artist specialising in Indian cities. You paint evocative scenes — rooftops, street markets, railway stations, chai stalls, ghats, old havelis, bazaars, temple lanes, auto-rickshaw junctions — from cities like Mumbai, Delhi, Varanasi, Kolkata, Jaipur, Chennai, Hyderabad, Amritsar, Bangalore, Cochin. Your style is loose, luminous, wet-on-wet with bleeding color washes, visible brushstrokes, and paper texture. No surrealism, no fantasy — purely real, beautiful India rendered in watercolor. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick one specific Indian city scene and write a detailed watercolor painting prompt for it. Return: {"title":"<5-8 word descriptive English title>","prompt":"<100-140 word watercolor painting prompt, specify city, time of day, color palette, brushwork style, mood, paper texture>"}'
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
      const finalPrompt = `${imagePrompt}. Traditional watercolor painting, loose expressive brushwork, wet-on-wet color washes, soft bleeding edges, visible paper texture, luminous transparent pigments, no photography, no CGI, authentic India.`;

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
