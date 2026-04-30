import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Byzantine Domes Meet Aztec Pyramids at Sunset',
    prompt: 'Cinematic aerial view of a planet-wide Terran Ecumenopolis at sunset. Byzantine golden domes and Aztec stepped pyramids rise side by side to impossible heights. Japanese pagoda towers soar above African geometric mega-structures. Gothic cathedral spires pierce smog layers between Chinese palace rooflines and Mughal minarets. Flying vehicles weave between districts. Warm amber and violet light. Endless urban sprawl to the horizon. Ultra-detailed, epic scale, atmospheric perspective, sci-fi realism.'
  },
  {
    title: 'Moorish Arches Tower Over Inca Stonework at Night',
    prompt: 'Cinematic night shot of a Terran Ecumenopolis. Glowing Moorish geometric arches span between Incan precision-stone megastructures. Celtic spiral towers pulse with bioluminescence. Tibetan monastery tiers crown skyscrapers. Ottoman palace domes reflect neon and torchlight below. Maori carved facades stretch hundreds of floors. Flying trams thread the canyon streets. Stars visible above the haze. Ultra-detailed, dramatic lighting, epic urban scale, sci-fi realism.'
  },
  {
    title: 'Nordic Towers and Polynesian Spires at Dawn',
    prompt: 'Cinematic dawn view of a Terran Ecumenopolis. Scandinavian wooden mega-towers wrapped in Viking carvings stand beside Polynesian navigation spire skyscrapers. Russian onion domes cap kilometre-tall buildings. Mayan pyramid city blocks grow massive terraced gardens. Aboriginal dot-painting patterns flow across entire building facades. Low dawn mist fills the canyons. Flying vehicles emerge from haze. Ultra-detailed, warm golden light, atmospheric depth, sci-fi realism.'
  }
];

const useEcumenopolis2Content = () => {
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
            max_tokens : 240,
            temperature: 1.2,
            messages   : [
              {
                role   : 'system',
                content: 'You design stunning visual prompts for a Terran Ecumenopolis — a planet-wide city where ALL of Earth\'s civilisations built together. Pick 3-5 unexpected cultural architectural combinations from around the world (e.g. Dravidian gopurams + Norse stave churches + Aztec pyramids + Mughal minarets + Polynesian navigation towers) and compose a breathtaking sci-fi cityscape. Vary the viewpoint: sometimes street-level canyons, sometimes aerial, sometimes a specific district. Vary time of day: dawn mist, golden sunset, neon night, stormy midday. Make each combination fresh and surprising — never the same cultures twice. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick a unique combination of world architectural cultures and generate a cinematic Ecumenopolis image prompt. Return: {"title":"<6-9 word dramatic title naming the cultures and time>","prompt":"<120-150 word ultra-detailed cinematic image prompt, specify cultures, viewpoint, time of day, lighting, scale, atmosphere, sci-fi urban details>"}'
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

      const finalPrompt = `${imagePrompt}. Photorealistic sci-fi concept art, ultra-detailed architecture, cinematic composition, epic planetary scale, atmospheric depth, hyper-detailed textures, no cartoon, no watercolour, no painting style.`;

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
      console.error('Ecumenopolis 2.0 generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useEcumenopolis2Content;
