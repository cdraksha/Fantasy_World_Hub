import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'The Flute Player',
    prompt: 'A tiny perfect spherical toy planet floating alone in pure black space. On the surface: a massive ancient cherry blossom tree in full bloom, soft pink petals drifting off into the void. A lone monk sits cross-legged beneath it playing a bamboo shakuhachi flute, eyes closed in peace. Stone path curving around the planet. Dramatic single overhead light source. Super Mario Galaxy Nintendo 3D art style, vivid, magical, dreamlike.'
  },
  {
    title: 'The Midnight Pond',
    prompt: 'A tiny perfect spherical toy planet floating alone in pure black space. A glassy koi pond covers half the planet surface, orange and white koi visible beneath. A stone lantern glows amber at the water\'s edge. A woman in a white kimono kneels trailing her fingers in the water. Cherry blossom trees arch over the pond, petals falling into still water. Full moon reflected. Super Mario Galaxy Nintendo 3D art style, vivid, magical.'
  },
  {
    title: 'The Tea House',
    prompt: 'A tiny perfect spherical toy planet floating alone in pure black space. A small wooden Japanese tea house sits atop the planet with a wrap-around veranda, paper lanterns glowing warm orange. An old man sits on the veranda drinking tea, watching cherry blossom petals drift off the edge into space. A single massive sakura tree in full bloom shelters the roof. Super Mario Galaxy Nintendo 3D art style, vivid, magical, dreamlike.'
  },
  {
    title: 'The Lantern Festival',
    prompt: 'A tiny perfect spherical toy planet floating alone in pure black space. Dozens of glowing paper lanterns float upward from the planet surface into the black void above. A group of children in colourful yukatas stand on the planet watching the lanterns rise, hands clasped. Cherry blossom trees ring the surface, petals swirling with the lanterns. Dramatic warm glow from below. Super Mario Galaxy Nintendo 3D art style, vivid, magical, joyful.'
  }
];

const useSakuraPlanetContent = () => {
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
            max_tokens : 250,
            temperature: 1.2,
            messages   : [
              {
                role   : 'system',
                content: 'You design tiny magical cherry blossom planets in the style of Super Mario Galaxy — perfect miniature spheres floating alone in black space, every surface covered in sakura trees in full bloom, always with one intimate human scene. Draw from these archetypes but keep inventing new variations: a monk playing a bamboo flute under a sakura tree; a woman in a kimono beside a glassy koi pond with a stone lantern; an old man on a wooden tea house veranda watching petals drift into space; a samurai resting against a sakura trunk sword across his lap; a child releasing a paper boat on a stream that circles the whole planet; a woman painting the sakura tree on a tiny canvas; an abandoned bronze temple bell hanging from a blossom branch; a gardener raking a zen garden as petals fall into the raked sand; a red torii gate with a fox sitting beneath it; children releasing paper lanterns that float into the void. Vary the time of day: dawn, golden hour, midnight with a full moon, blue twilight. Always include cherry blossoms. Always one human moment. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Invent a unique cherry blossom toy planet scene. Return: {"title":"<3-5 word poetic title>","prompt":"<120-150 word image prompt: describe the tiny spherical planet floating in pure black space, the cherry blossom tree(s), the one human scene, the time of day, the lighting — then end with: Super Mario Galaxy Nintendo 3D art style, vivid, magical, dreamlike>"}'
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

      const finalPrompt = `${imagePrompt}. Tiny perfect sphere floating in pure black starless void, cherry blossom petals drifting off the edges into space, single dramatic light source, Super Mario Galaxy Nintendo render quality, no background, no stars, pure black space, whimsical and magical.`;

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
      console.error('Sakura planet generation failed:', err);
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};

export default useSakuraPlanetContent;
