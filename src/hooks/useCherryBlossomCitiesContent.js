import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Tokyo Shibuya — Cherry Blossom Rush Hour',
    prompt: 'Bright impressionist painting of Tokyo\'s Shibuya crossing at cherry blossom season. Massive sakura trees in full bloom arch over the famous scramble crossing, petals drifting onto the crowd below. Neon signs glow pink and white behind a canopy of blossoms. Figures with umbrellas and city bustle. Vivid luminous palette — hot pink, coral, cream white, electric blue neon. Loose confident brushwork, thick impasto on flower clusters, Monet meets modern Tokyo. Ultra-bright, joyful, painterly.'
  },
  {
    title: 'Kyoto Philosopher\'s Path at Full Bloom',
    prompt: 'Bright impressionist painting of the Philosopher\'s Path in Kyoto at peak cherry blossom season. A narrow canal lined with ancient stone, hundreds of sakura trees forming a tunnel of pink and white. Soft afternoon light filtering through petals. Traditional wooden machiya townhouses behind. Vivid luminous palette — intense blossom pink, jade green, cream, warm amber sunlight. Thick expressive oil brushwork, dabs of pure white and hot pink for flowers, gloriously bright and alive.'
  },
  {
    title: 'Paris Boulevard Under Cherry Blossoms',
    prompt: 'Bright impressionist painting of a grand Parisian boulevard lined with cherry blossom trees in full bloom. Haussmann buildings in cream and sand behind a canopy of intense pink sakura. Parisians at café tables under drifting petals, bicycles, a green lamp post. Golden afternoon light. Vivid palette — saturated blossom pink, warm ochre stone, cobalt sky, green café awnings. Thick Monet-style brushwork, pure colour, maximum brightness, painterly and joyful.'
  },
  {
    title: 'Washington DC Tidal Basin at Dawn',
    prompt: 'Bright impressionist painting of Washington DC\'s Tidal Basin at sunrise during cherry blossom festival. The Jefferson Memorial reflected in still water, surrounded by hundreds of sakura trees in peak bloom. Dawn light painting everything in gold and pink. Petals floating on the water. Vivid luminous palette — hot pink, pale gold, lavender sky, cream marble. Thick expressive brushwork, pure colour dabs, radiant and gloriously bright. Monet-style impressionism at its most vivid.'
  }
];

const useCherryBlossomCitiesContent = () => {
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
            temperature: 1.1,
            messages   : [
              {
                role   : 'system',
                content: 'You are a master impressionist painter specialising in cherry blossom scenes in cities around the world. You paint vivid, gloriously bright scenes — Tokyo crossings, Kyoto canal paths, Paris boulevards, Washington DC monuments, Seoul palaces, Amsterdam canals, Prague bridges, Vancouver harbours, all under full sakura bloom. Your style is bold impressionism: thick expressive brushwork, pure saturated colour, luminous light, maximum brightness and joy. Think Monet, Renoir, Pissarro — but turned up to full saturation. No dark, moody, or muted tones. Always bright, always alive. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick one specific city scene during cherry blossom season and write a bright impressionist painting prompt. Return: {"title":"<city location> — <4-6 word subtitle>","prompt":"<110-140 word impressionist painting prompt, specify city, exact location, time of day, colour palette (vivid and bright), brushwork style, light quality, mood — always joyful and luminous>"}'
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

      const finalPrompt = `${imagePrompt}. Impressionist oil painting, vivid saturated colours, thick expressive brushwork, luminous bright light, full cherry blossom bloom, joyful and radiant, museum-quality fine art, no photography, no dark tones, maximum colour vibrancy.`;

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
      console.error('Cherry blossom cities generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useCherryBlossomCitiesContent;
