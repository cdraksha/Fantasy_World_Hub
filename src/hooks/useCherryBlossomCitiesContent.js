import { useState, useCallback } from 'react';

const GPT4_URL = 'https://api.segmind.com/v1/gpt-4';
const IMG_URL  = 'https://api.segmind.com/v1/gpt-image-2';
const API_KEY  = () => import.meta.env.VITE_SEGMIND_API_KEY;

const FALLBACK_SCENES = [
  {
    title: 'Tokyo Shibuya — Cherry Blossom Rush Hour',
    prompt: 'Professional travel photograph of Tokyo\'s Shibuya crossing at peak cherry blossom season. Massive sakura trees in full bloom arch over the famous scramble crossing, pink petals drifting onto the crowd below. Neon signs glowing behind a canopy of soft blossoms. Hundreds of people crossing. Shot with 35mm lens, f/2.8, golden hour light, petals sharp in foreground. Ultra sharp, cinematic, photorealistic.'
  },
  {
    title: 'Amsterdam Canals — Cherry Blossom Spring',
    prompt: 'Professional travel photograph of Amsterdam\'s canal district at cherry blossom season. Sakura trees in full bloom line the historic canal, their pink blossoms reflecting perfectly in the water. Traditional Dutch narrow townhouses in the background, bicycles parked along the canal edge. Soft morning light, petals floating on the canal surface. Shot at f/2.8, wide angle, cinematic colour grading. Ultra sharp, photorealistic, stunning travel photography.'
  },
  {
    title: 'Washington DC Tidal Basin at Dawn',
    prompt: 'Professional travel photograph of Washington DC\'s Tidal Basin at sunrise during the cherry blossom festival. The Jefferson Memorial perfectly reflected in still water, surrounded by hundreds of sakura trees at peak bloom. Pink and gold dawn light, petals floating on the water. Shot at f/2.8, wide angle, long exposure for glassy reflections. Ultra sharp, cinematic, photorealistic.'
  },
  {
    title: 'Seoul Gyeongbokgung Palace — Cherry Blossoms',
    prompt: 'Professional travel photograph of Seoul\'s Gyeongbokgung Palace at cherry blossom season. Ancient Korean royal palace buildings with traditional curved tile roofs framed by hundreds of sakura trees in full bloom. Pink petals drifting across the grand stone courtyard. People in hanbok robes walking through the blossoms. Warm afternoon light. Shot at f/2.8, 35mm, cinematic. Ultra sharp, photorealistic, breathtaking travel photography.'
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
                content: 'You are a world-class travel photographer specialising in cherry blossom season photography across cities worldwide. You capture stunning, photorealistic images of cherry blossoms in famous city locations — Tokyo Shibuya crossing, Kyoto Philosopher\'s Path, Amsterdam canals, Washington DC Tidal Basin, Seoul Gyeongbokgung Palace, Paris boulevards, Prague bridges, Vancouver harbour, Berlin Unter den Linden, London Hyde Park, New York Central Park, Sydney harbour, Istanbul Bosphorus. Your shots are cinematic and magazine-quality: sharp foreground blossoms, beautiful bokeh, perfect natural light. Vary the cities, landmarks, times of day (dawn, golden hour, blue hour, midday), and composition. Return ONLY valid compact JSON with no markdown.'
              },
              {
                role   : 'user',
                content: 'Pick one specific city and exact landmark at cherry blossom season. Return: {"title":"<City Name> — <landmark or location, 3-5 words>","prompt":"<100-130 word photorealistic travel photography prompt: specify exact city, landmark, cherry blossom details, light conditions, camera settings (lens, aperture, time of day), composition, mood — always stunning, sharp, cinematic and photorealistic>"}'
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

      const finalPrompt = `${imagePrompt}. Photorealistic travel photography, ultra sharp, cinematic colour grading, full cherry blossom bloom at peak season, natural light, magazine quality, shot on Sony A7R V, no painting, no illustration, no sketch, no watercolor.`;

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
