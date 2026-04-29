import { useState, useCallback } from 'react';

const GPT4_URL     = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL      = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY      = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Hanuman Carries the Sanjeevani Mountain',
    prompt: 'Epic Japanese anime scene: the mighty Hanuman, golden-furred divine monkey warrior, soaring through a stormy night sky carrying an entire mountain range on one hand, flames flickering from the mountain, divine energy crackling around his form, massive scale dwarfing the clouds below, dramatic rim lighting from twin moons, ultra-detailed anime illustration, Attack on Titan scale grandeur, cinematic composition'
  },
  {
    title: 'Ram Unleashes the Brahmastra on Ravan',
    prompt: 'Epic Japanese anime scene: Prince Ram with glowing divine bow Kodanda drawn, releasing the flaming Brahmastra arrow at the ten-headed demon king Ravan, golden divine energy exploding outward, massive battlefield of Lanka burning below, dramatic god rays splitting storm clouds, ultra-detailed anime art style, cinematic wide shot, Demon Slayer visual quality, godly power auras'
  },
  {
    title: 'Arjuna vs Karna — Final Battle of Kurukshetra',
    prompt: 'Epic Japanese anime scene: Arjuna and Karna facing each other on war chariots on the burning plain of Kurukshetra, both releasing divine astras simultaneously creating a blinding collision of celestial energy, dead warriors and broken chariots in the foreground, blood-red sky, ultra-detailed anime style, Fate/Zero level detail, dramatic backlighting, tragic and epic scale'
  }
];

const useHinduMythologyContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]               = useState(null);

  const generateContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // ── Step 1: GPT-4 picks a scene and writes the anime image prompt ──
      let title, imagePrompt;

      try {
        const gptRes = await fetch(GPT4_URL, {
          method : 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY() },
          body   : JSON.stringify({
            model      : 'gpt-4',
            max_tokens : 200,
            temperature: 1.0,
            messages   : [
              {
                role   : 'system',
                content: 'You are a creative director for an epic anime studio specialising in Hindu mythology. You generate dramatic scenes from the Ramayana, Mahabharata, and Puranas rendered in the style of top-tier Japanese anime (Demon Slayer, Attack on Titan, Fate series). Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick one dramatic Hindu mythology scene — a battle, divine feat, or legendary moment — and create an epic anime image prompt for it. Return: {"title":"<5-8 word dramatic English title>","prompt":"<100-140 word ultra-detailed anime image prompt, Japanese anime art style, epic cinematic composition, dramatic lighting>"}'
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
        // GPT-4 failed — use a fallback scene
      }

      if (!title || !imagePrompt) {
        const fb   = FALLBACK_SCENES[Math.floor(Math.random() * FALLBACK_SCENES.length)];
        title       = fb.title;
        imagePrompt = fb.prompt;
      }

      // ── Step 2: generate the anime image with gpt-image-2 ──
      const finalPrompt = `${imagePrompt}. Japanese anime art style, ultra-detailed, studio animation quality, dramatic god-tier lighting, vibrant sacred colors, cinematic masterpiece.`;

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

      // gpt-image-2 returns raw binary image bytes
      const blob     = await imgRes.blob();
      const imageUrl = URL.createObjectURL(blob);

      if (!imageUrl) throw new Error('Could not extract image from response');

      return { title, imageUrl };

    } catch (err) {
      console.error('Hindu mythology generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useHinduMythologyContent;
