import { useState, useCallback } from 'react';
import axios from 'axios';

const useFantasySkyscrapersContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFantasySkyscrapersContent = useCallback(async () => {
    const skyscraperPrompts = [
      // Crystal and Magical Material Towers
      "EPIC FANTASY SKYSCRAPER: 400-floor crystal spire tower made of translucent magical crystal that glows with inner light, reaching 2 kilometers into the clouds. The tower has floating garden levels suspended by anti-gravity magic every 50 floors, with waterfalls cascading between floating platforms. Intricate runic patterns carved into the crystal walls pulse with blue and gold magical energy. Dragons perch on crystalline platforms that orbit the tower at different heights. The base is surrounded by a magical moat with floating lily pads and glowing fish. Clouds swirl around the upper floors where sky bridges connect to smaller floating towers. The spire top disappears into storm clouds with lightning crackling around a magical beacon. Photorealistic fantasy architecture, dramatic lighting, cinematic composition, 8K detail.",

      "EPIC FANTASY SKYSCRAPER: 350-floor living wood tower grown from a massive World Tree, with bark-like exterior walls and branches extending as balconies and sky bridges. The tower is 1.8 kilometers tall with glowing sap veins running through the trunk like golden circuits. Elven cities built into the bark at various levels, with spiral staircases carved into the living wood. Massive leaves provide natural shade for outdoor terraces, and flowering vines cascade down the sides. Tree spirits visible as glowing wisps floating around the branches. The canopy at the top spreads into multiple spires with treehouses connected by rope bridges. Magical fruits glow like lanterns throughout the structure. Birds and flying creatures nest in the upper branches. Fantasy forest architecture meets skyscraper scale, mystical atmosphere.",

      "EPIC FANTASY SKYSCRAPER: 500-floor obsidian and gold tower with dark volcanic glass walls inlaid with intricate golden magical circuits. The tower reaches 2.5 kilometers high with molten lava flowing through transparent tubes as both decoration and power source. Fire elementals dance within the lava channels, visible through the glass walls. Golden dragon statues perched at every 100th floor breathe real flames. The structure has floating obsidian platforms connected by bridges of hardened lava. Magical forges built into the lower levels with dwarven smiths working. The top floors disappear into a perpetual storm of fire and lightning. Volcanic vents at the base create a dramatic moat of lava. Dark fantasy architecture with dramatic fire lighting, epic scale.",

      // Floating and Anti-Gravity Towers
      "EPIC FANTASY SKYSCRAPER: 450-floor tower with the bottom 200 floors rooted in the ground and the top 250 floors completely floating in the air, connected only by magical energy beams and floating staircases. The floating section slowly rotates, creating a mesmerizing spiral effect. Each floating floor is a different biome - ice levels, desert levels, forest levels, ocean levels with water somehow contained in mid-air. Magical portals connect the grounded section to the floating sections. Sky whales swim through the air between the floating floors. The tower reaches 2.2 kilometers with the floating section extending even higher. Gravity-defying waterfalls flow upward between levels. Mages in robes float between platforms casting spells. Impossible architecture that defies physics, dreamlike atmosphere.",

      "EPIC FANTASY SKYSCRAPER: 380-floor tower built entirely of floating stone blocks held together by pure magical force, creating gaps and spaces throughout the structure where you can see through to the other side. Each stone block glows with different colored magical auras - blue, purple, green, gold. The blocks slowly shift and rearrange themselves, making the tower's shape constantly change. Magical bridges of pure energy connect the floating stone platforms. Wizards' towers built on individual floating stones orbit the main structure. The tower reaches 1.9 kilometers with some stone blocks floating far above the main structure. Levitating gardens grow on some of the stone platforms. Magical creatures fly through the gaps between stones. Impossible floating architecture, mystical lighting effects.",

      // Multi-Spire and Complex Structures
      "EPIC FANTASY SKYSCRAPER: Seven interconnected spires of different magical materials - crystal, living wood, obsidian, silver, copper, marble, and pure energy - each 300+ floors tall, connected by sky bridges and floating platforms. The central spire is made of swirling magical energy that changes colors. Each spire represents a different school of magic with appropriate decorations and inhabitants. The crystal spire has ice magic with frozen waterfalls, the wood spire has nature magic with growing vines, the obsidian spire has fire magic with lava flows. Dragons of different elements perch on their corresponding spires. The complex reaches 2 kilometers high with magical auroras dancing between the spires. Teleportation circles connect the bases of each spire. Epic multi-tower fantasy complex, dramatic magical lighting.",

      "EPIC FANTASY SKYSCRAPER: 420-floor spiral tower that corkscrews up into the clouds, made of white marble with gold inlays and magical gemstones embedded throughout. The spiral design creates natural terraces and balconies at every level. Pegasus and other flying mounts land on the spiral ledges. The tower has a hollow center with a magical vortex of swirling energy and floating platforms inside. Waterfalls spiral down the exterior following the tower's curve. The structure reaches 2.1 kilometers with the top disappearing into golden clouds. Magical elevators made of pure light travel along the spiral path. Angels and celestial beings inhabit the upper levels. The base is surrounded by a moat of liquid starlight. Heavenly architecture with divine lighting effects.",

      // Elemental and Themed Towers
      "EPIC FANTASY SKYSCRAPER: 360-floor ice tower made of magical eternal ice that never melts, with frozen waterfalls, icicle spires, and aurora lights dancing through the translucent walls. The tower reaches 1.8 kilometers into the frozen clouds above. Ice dragons coil around the spire, their breath creating beautiful ice sculptures. The interior has ice slides connecting floors and frozen gardens with crystalline trees. Magical heating runes keep inhabitants warm while maintaining the ice structure. The top floors are shrouded in perpetual blizzard with ice phoenixes flying through the storm. Frozen bridges connect to smaller ice towers floating nearby. The base sits in a lake of liquid starlight that never freezes. Arctic fantasy architecture with magical ice effects.",

      "EPIC FANTASY SKYSCRAPER: 480-floor tower made of pure magical energy that shifts between different elemental forms - sometimes fire, sometimes water, sometimes earth, sometimes air. The tower reaches 2.4 kilometers and its appearance constantly changes as different elements take control. When in fire form, it's made of crystallized flame with lava flows. In water form, it becomes a tower of flowing water held in magical containers. In earth form, it's made of floating rocks and crystals. In air form, it becomes translucent with wind currents visible. Elemental beings inhabit their corresponding sections. The transformation creates spectacular light shows visible for miles. Magical storms swirl around the top where all elements meet. Shape-shifting architecture with dynamic magical effects.",

      // Steampunk Fantasy Fusion
      "EPIC FANTASY SKYSCRAPER: 400-floor tower combining magical fantasy with steampunk technology - brass and copper pipes carrying magical steam, gear-driven floating platforms, clockwork dragons perched on mechanical spires. The tower reaches 2 kilometers with massive magical steam engines at various levels creating floating sections. Magical crystals power brass machinery that defies physics. Airships dock at mechanical platforms extending from the tower. The structure has rotating sections driven by magical clockwork. Steam-powered elevators travel through transparent tubes on the exterior. Gnome and dwarf engineers work on magical machinery throughout the tower. The top has a massive magical steam vent creating perpetual clouds. Steampunk fantasy fusion architecture with brass and magical lighting.",

      // Underwater/Floating Ocean Tower
      "EPIC FANTASY SKYSCRAPER: 350-floor tower that exists both above and below a floating ocean suspended in mid-air at the 200th floor level. The lower 200 floors rise from the ground through magical mist, while the upper 150 floors extend above the floating ocean. Sea creatures swim in the suspended ocean around the tower - whales, dolphins, magical sea serpents. Merfolk cities built into the underwater sections of the tower. Waterfalls cascade from the floating ocean down to the ground below. The tower is made of coral-like magical material that glows underwater. Underwater sections have air-filled chambers connected by water-filled tubes. The structure reaches 1.7 kilometers total height. Magical submarines dock at underwater platforms. Unique underwater-aerial architecture with aquatic lighting effects."
    ];

    const selectedPrompt = skyscraperPrompts[Math.floor(Math.random() * skyscraperPrompts.length)];

    // Enhanced prompt for epic visual quality
    const enhancedPrompt = `${selectedPrompt}

Style: Epic fantasy architecture concept art, cinematic composition with dramatic perspective showing the full massive scale of the tower, photorealistic 3D rendering with intricate architectural details, vibrant magical colors with HDR effects, atmospheric lighting with volumetric rays and magical glows, detailed textures on all materials, particle effects for magical elements, cinematic depth of field, 8K ultra-high resolution, AAA video game environment art quality, fantasy movie concept art style, dramatic shadows and highlights showcasing the tower's immense height, wide establishing shot showing the tower from base to top reaching into clouds.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🏗️ Generating Fantasy Skyscraper with enhanced prompt...');

      const response = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: enhancedPrompt,
        samples: 1,
        scheduler: "DPM++ 2M",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
        img_width: 1024,
        img_height: 1024,
        base64: false
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 120000
      });

      console.log('✅ Fantasy Skyscraper generated successfully');
      console.log('Response data type:', typeof response.data);
      console.log('Response data size:', response.data.size);

      // Check if we got a valid blob
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(response.data);
      console.log('Created image URL:', imageUrl);
      
      // Create descriptions matching the prompts
      const descriptions = [
        "A 400-floor crystal spire with floating gardens and dragons orbiting on magical platforms",
        "A 350-floor living World Tree tower with elven cities carved into the bark",
        "A 500-floor obsidian tower with golden circuits and flowing lava channels",
        "A 450-floor tower with floating upper sections defying gravity",
        "A 380-floor tower of floating stone blocks held by pure magical force",
        "Seven interconnected spires representing different schools of magic",
        "A 420-floor spiral tower of white marble corkscrewing into golden clouds",
        "A 360-floor eternal ice tower with frozen waterfalls and aurora lights",
        "A 480-floor energy tower that shifts between elemental forms",
        "A 400-floor steampunk-fantasy fusion with magical steam engines",
        "A 350-floor tower spanning both air and a floating ocean"
      ];

      // Match description to the selected prompt
      const promptIndex = skyscraperPrompts.indexOf(selectedPrompt);
      const description = descriptions[promptIndex] || "A massive fantasy skyscraper reaching beyond the clouds with magical elements";

      return {
        description,
        image: {
          url: imageUrl,
          prompt: selectedPrompt,
          description: "Fantasy Skyscraper - Magical architecture reaching the heavens"
        }
      };

    } catch (error) {
      console.error('Fantasy Skyscraper generation failed:', error);
      
      let errorMessage = 'Failed to generate fantasy skyscraper';
      if (error.response?.status === 401) {
        errorMessage = 'API key authentication failed';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.response?.status) {
        errorMessage = `API Error: Status ${error.response.status}`;
      } else if (error.message) {
        errorMessage = `Network Error: ${error.message}`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateFantasySkyscrapersContent,
    isGenerating,
    error
  };
};

export default useFantasySkyscrapersContent;
