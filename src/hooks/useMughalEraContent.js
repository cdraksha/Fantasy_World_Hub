import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Agra Bazaar at Dusk — Mughal Era',
    prompt: 'Oil painting of a bustling Mughal-era bazaar street in Agra at dusk, 17th century. Merchants selling silks, spices, and gems by lantern light. Turbaned men on horseback, veiled women, camel-drawn carts. Sandstone archways and carved jharokha balconies overhead. Deep chiaroscuro lighting, rich impasto texture, warm amber and deep crimson palette. Style of Rembrandt meets Mughal miniature — thick oil paint, dramatic shadow and light, jewel-toned fabrics.'
  },
  {
    title: 'Fatehpur Sikri Courtyard at Sunrise',
    prompt: 'Oil painting of the grand courtyard of Fatehpur Sikri at sunrise, late 16th century Mughal India. Red sandstone pavilions glowing in early golden light. Courtiers in embroidered jamas, musicians, elephants draped in gold cloth. Long shadows across polished stone floors. Rich impasto oil technique, warm saffron and ochre tones, deep architectural shadows. Painterly brushwork reminiscent of the Dutch Golden Age applied to a Mughal imperial scene.'
  },
  {
    title: 'Delhi Chandni Chowk — Mughal Imperial Market',
    prompt: 'Oil painting of Chandni Chowk in Mughal-era Delhi, mid 17th century under Shah Jahan. The great canal running down the centre reflecting the moonlight. Silk merchants, perfume sellers, jewellers in ornate timber-fronted shops. Nobles on palanquins, Sufi ascetics, Persian traders. Deep chiaroscuro, warm candlelight and torch fire illuminating rich fabrics. Thick oil paint, luminous glazed shadows, Baroque-Mughal fusion style.'
  }
];

const useMughalEraContent = () => {
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
            temperature: 1.0,
            messages   : [
              {
                role   : 'system',
                content: 'You are a master oil painter specialising in Mughal-era India (1526–1857). You paint vivid street scenes from cities like Agra, Delhi, Lahore, Fatehpur Sikri, Lucknow, Hyderabad, and Bijapur — bazaars, caravanserais, mosque courtyards, riverside ghats, elephant processions, spice markets, royal durbars, Sufi dargahs, and night markets lit by oil lamps. Your style fuses Dutch Golden Age chiaroscuro (Rembrandt, Vermeer) with Mughal miniature richness — thick impasto, jewel-toned fabrics, deep amber shadows, warm torchlight. No modern elements. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick one specific Mughal-era Indian street scene and write a detailed oil painting prompt. Return: {"title":"<5-8 word descriptive English title>","prompt":"<100-140 word oil painting prompt, specify city, century, time of day, lighting, color palette, brushwork technique, specific Mughal-era details>"}'
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

      const finalPrompt = `${imagePrompt}. Oil painting on canvas, thick impasto brushwork, rich glazed shadows, luminous warm palette, Dutch Golden Age meets Mughal miniature, no photography, no watercolor, no modern elements, museum-quality fine art.`;

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
      console.error('Mughal era generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useMughalEraContent;
