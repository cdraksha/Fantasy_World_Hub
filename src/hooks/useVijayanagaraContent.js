import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Hampi Bazaar — Vijayanagara at Its Peak',
    prompt: 'Acrylic painting of the grand Hampi Bazaar street in the Vijayanagara Empire, 15th century. Colonnaded stone pillars lining a wide avenue packed with merchants selling silks, gems, spices, and horses. Traders from Persia, Portugal, and China among turbaned Deccan merchants. Massive boulder-strewn hills and a Dravidian gopuram in the background. Vivid saturated acrylics — terracotta, cobalt blue, saffron yellow. Bold confident brushwork, flat graphic areas of colour, strong sunlight and hard shadows.'
  },
  {
    title: 'Vittala Temple Festival Procession',
    prompt: 'Acrylic painting of a grand festival procession at the Vittala Temple complex, Hampi, 16th century Vijayanagara Empire. Caparisoned elephants draped in gold and crimson, musicians with nagaswaram and tavil, priests carrying brass lamps, temple dancers in silk. Stone chariot of Vittala behind. Rich jewel-toned acrylics — deep crimson, temple gold, jade green against blue sky. Bold flat graphic brushwork with thick impasto on fabric textures. Festive, vibrant, monumental scale.'
  },
  {
    title: 'Tungabhadra River Ghat at Sunrise',
    prompt: 'Acrylic painting of the Tungabhadra river ghats near Hampi at sunrise, 15th century. Pilgrims bathing on carved stone steps. Coracle boats on turquoise water. Massive granite boulders glowing amber in the morning sun. Temple spires and ruins on the far bank. Vivid acrylic palette — warm ochre, burnt orange, sky blue, emerald green. Bold sweeping brushwork, graphic flat colour blocks for rocks and sky, energetic impasto on water ripples.'
  }
];

const useVijayanagaraContent = () => {
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
                content: 'You are a master acrylic painter specialising in the Vijayanagara Empire (1336–1646 CE), centred at Hampi in present-day Karnataka. You paint vivid street scenes — the grand Hampi Bazaar colonnade, Vittala Temple festivals, Tungabhadra ghats, royal elephant stables, the Lotus Mahal courtyard, merchants from Persia and Portugal at market, Dravidian temple processions, coracle boats on the river, boulder-strewn Deccan landscapes. Your acrylic style uses vivid saturated colour, bold graphic brushwork, strong sunlight and hard shadows, flat colour areas punctuated by thick impasto on key textures. No Mughal elements. Pure South Indian Vijayanagara. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick one specific Vijayanagara Empire street or city scene and write a detailed acrylic painting prompt. Return: {"title":"<5-8 word descriptive English title>","prompt":"<100-140 word acrylic painting prompt, specify location in Hampi or Vijayanagara territory, century, time of day, colour palette, brushwork style, specific architectural and cultural details>"}'
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

      const finalPrompt = `${imagePrompt}. Acrylic painting on canvas, bold saturated colours, graphic flat brushwork with impasto highlights, vivid Deccan light, museum-quality fine art, no photography, no watercolour, no Mughal elements, purely Vijayanagara South Indian.`;

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
      console.error('Vijayanagara generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useVijayanagaraContent;
