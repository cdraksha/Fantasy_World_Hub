import { useState } from 'react';

const usePortalDoorsContent = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const portalScenarios = [
    {
      prompt: "A magnificent antique wardrobe made of dark mahogany wood stands in a dusty Victorian attic, its ornate doors slightly ajar revealing a snowy lamppost glowing in an enchanted forest beyond, with mythical creatures visible in the misty distance",
      description: "The Wardrobe to Narnia - Step through the fur coats into an eternal winter"
    },
    {
      prompt: "An ordinary bedroom closet door creaks open to reveal a vast underwater kingdom with coral palaces, mermaids swimming gracefully, and bioluminescent sea creatures illuminating crystal cities beneath the waves",
      description: "The Closet to Atlantis - Dive into an aquatic realm of wonder"
    },
    {
      prompt: "A rustic barn door swings wide to unveil a floating sky city with cloud bridges, winged inhabitants soaring between crystalline towers, and rainbow waterfalls cascading into the endless blue below",
      description: "The Barn Door to the Sky Realm - Soar among the clouds and stars"
    },
    {
      prompt: "An elegant French door opens from a library to reveal a steampunk metropolis with brass gears turning in the sky, airships docking at copper towers, and steam-powered creatures walking cobblestone streets",
      description: "The Library Door to Steamland - Enter a world of brass and steam"
    },
    {
      prompt: "A simple bathroom door transforms into a portal revealing an ancient Egyptian temple complex with golden pyramids, sphinx guardians, and priests in white robes walking through halls filled with hieroglyphic mysteries",
      description: "The Bathroom Door to Ancient Egypt - Walk among pharaohs and gods"
    },
    {
      prompt: "A kitchen pantry door opens to show a candy wonderland with gingerbread houses, chocolate rivers, gumdrop trees, and sugar crystal mountains sparkling under a cotton candy sky",
      description: "The Pantry Door to Sweetland - Taste the magic of confection"
    },
    {
      prompt: "An office door swings open to reveal a mystical forest realm where ancient trees have faces, fairy lights dance between branches, and unicorns graze in moonlit clearings filled with magical flowers",
      description: "The Office Door to the Enchanted Forest - Meet the guardians of nature"
    },
    {
      prompt: "A basement door opens into a futuristic space station with holographic displays, alien diplomats in elegant robes, and vast windows showing distant galaxies and nebulae in cosmic splendor",
      description: "The Basement Door to the Galactic Embassy - Join the cosmic council"
    },
    {
      prompt: "A garden shed door reveals a miniature world where tiny dragons nest in flower petals, fairy villages are built inside mushrooms, and dewdrops serve as crystal palaces for thumb-sized royalty",
      description: "The Shed Door to Lilliput - Discover the realm of the small"
    },
    {
      prompt: "An attic trapdoor opens downward into an inverted castle hanging from a starry void, where gravity flows upward and robed wizards walk on crystal ceilings while casting spells that create new constellations",
      description: "The Trapdoor to the Inverted Realm - Where up is down and magic flows backward"
    }
  ];

  const generateContent = async () => {
    setLoading(true);
    setError(null);

    try {
      // Select random scenario
      const scenario = portalScenarios[Math.floor(Math.random() * portalScenarios.length)];

      const response = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: scenario.prompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, signature, text, logo, brand names, realistic photography, modern clothing, cars, phones, computers, contemporary objects",
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000)
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      const contentData = {
        image: {
          url: imageUrl,
          description: scenario.description
        },
        text: scenario.description,
        description: scenario.description,
        prompt: scenario.prompt
      };

      setContent(contentData);
      return contentData; // Return the content for Try It Out box

    } catch (err) {
      console.error('Portal Doors generation error:', err);
      setError(err.message || 'Failed to generate portal door image');
      throw err; // Re-throw for Try It Out box error handling
    } finally {
      setLoading(false);
    }
  };

  return {
    content,
    loading: loading,
    isGenerating: loading,
    error,
    generateContent,
    generatePortalDoorsContent: generateContent
  };
};

export default usePortalDoorsContent;
