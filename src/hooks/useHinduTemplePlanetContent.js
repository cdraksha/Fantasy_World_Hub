import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Kailash — The Mountain of Gods',
    prompt: 'A tiny perfect spherical toy planet floating in pure black space. The entire surface is dominated by a colossal Kailasa-style temple carved directly from black volcanic rock — massive, impossibly detailed, towering over the curved horizon. Dozens of smaller shrines spiral down the surface. Lava rivers glow orange between carved stone paths. A stormy purple sky with lightning crackling around the temple spires. Super Mario Galaxy Nintendo 3D art style, vivid, epic, magical.'
  },
  {
    title: 'The Golden Gopuram World',
    prompt: 'A tiny perfect spherical toy planet floating in pure black space. Thousands of soaring South Indian gopuram towers covered in gold and vivid painted sculptures wrap across the entire sphere — every inch is temple. The towers pierce up into black space, their tops glowing like torches. Lush jungle visible between the towers, rivers of sacred water flowing around the planet equator. Sunset light in deep orange and saffron. Super Mario Galaxy Nintendo 3D art style, vivid, epic, magical.'
  },
  {
    title: 'Dwarka — The Sunken Divine City',
    prompt: 'A tiny perfect spherical toy planet floating in pure black space. A legendary ocean-covered world where colossal ancient Hindu temple spires rise from deep blue water, mostly submerged, their golden tops glowing above the waves. Bioluminescent coral glows around the submerged columns. The sky is deep indigo with a massive moon. One great central temple rises fully above the waterline, glowing with divine light. Super Mario Galaxy Nintendo 3D art style, vivid, epic, magical.'
  },
  {
    title: 'Hampi — The Empire of Boulders',
    prompt: 'A tiny perfect spherical toy planet floating in pure black space. A world of enormous orange granite boulders with Vijayanagara-style temple complexes built between and on top of them. Massive carved stone chariots and elephant statues ring the planet surface. The Vittala temple complex sits at the top of the sphere, lit by golden afternoon sun. Banana trees and sacred rivers visible between the ruins. Super Mario Galaxy Nintendo 3D art style, vivid, epic, magical.'
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
                content: 'You design ancient Hindu temple toy planets — tiny perfect spheres floating in pure black space in the style of Super Mario Galaxy, but the entire surface is a fantastical ancient Indian divine realm. Think Asgard but Hindu — impossibly grand, sacred, mythological. Draw from real temple traditions but amplify to fantasy scale: Dravidian gopurams a thousand metres tall, Nagara shikhara spires piercing the void, cave temples carved into the entire planet like Ellora and Ajanta, submerged Dwarka rising from sacred oceans, Vijayanagara empire stone cities overrun with jungle and boulders, the cosmic Mount Meru as a planet itself, Angkor Wat-scale temple cities, floating temple islands, lava-filled Shiva realms, underwater Vishnu cities, celestial Indra palaces. Vary the mood: stormy and epic, golden and glorious, moonlit and mysterious, volcanic and powerful, underwater and bioluminescent. Always ancient, always Hindu, always jaw-dropping in scale. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Invent a unique Hindu temple toy planet. Return: {"title":"<3-5 word mythological title>","prompt":"<130-160 word image prompt: describe the tiny spherical planet floating in pure black space, the specific temple style and architecture covering the surface, the scale, the lighting and mood, dramatic details — then end with: Super Mario Galaxy Nintendo 3D art style, vivid, epic, magical>"}'
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

      const finalPrompt = `${imagePrompt}. Tiny perfect sphere floating in pure black void, ancient Hindu temple architecture covering every surface, single dramatic divine light source, Super Mario Galaxy Nintendo render quality, pure black space background, no stars, epic mythological scale, ultra detailed stone carvings.`;

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
