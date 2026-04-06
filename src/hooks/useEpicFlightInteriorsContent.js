import { useState, useCallback } from 'react';
import axios from 'axios';

const useEpicFlightInteriorsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateEpicFlightInteriorsContent = useCallback(async () => {
    const flightInteriorPrompts = [
      // Medieval Castle Interior
      "EPIC FLIGHT INTERIOR: Normal Boeing 737 commercial airliner exterior parked at gate, but when you step inside through the aircraft door, you discover a grand medieval castle great hall with massive stone walls, towering Gothic arches, hanging tapestries with heraldic designs, a roaring stone fireplace with crackling logs, wooden throne chairs, suits of armor standing guard, torches mounted on stone pillars providing warm flickering light, and a long wooden banquet table set for a royal feast. The impossible interior stretches far beyond what the aircraft exterior could contain, with vaulted ceilings disappearing into shadows and medieval banners hanging from the rafters.",

      // Underwater Palace Interior
      "EPIC FLIGHT INTERIOR: Standard private jet exterior on tarmac, but stepping through the aircraft door reveals a magnificent underwater palace with floor-to-ceiling aquarium walls showing deep ocean depths, colorful coral reefs, swimming dolphins, tropical fish, and gentle whale songs echoing through the space. The interior features flowing organic architecture with pearl-inlaid surfaces, bioluminescent lighting that pulses like sea creatures, comfortable seating areas surrounded by living coral formations, and crystal-clear water flowing in decorative channels throughout the cabin. The impossible scale contains multiple levels with spiral staircases leading to observation decks.",

      // Enchanted Forest Cabin Interior
      "EPIC FLIGHT INTERIOR: Regular helicopter exterior on landing pad, but entering through the side door transports you into a cozy enchanted forest lodge with massive living trees growing up through the cabin floor, their branches forming the ceiling structure with glowing fairy lights nestled in the leaves. The interior features rustic wooden furniture, a stone fireplace with dancing flames, moss-covered walls, mushroom-shaped seating, woodland creatures peeking from behind tree trunks, and shafts of golden sunlight filtering through the forest canopy above. The magical space extends far beyond the helicopter's physical dimensions.",

      // Roman Villa Interior
      "EPIC FLIGHT INTERIOR: Standard commercial airliner exterior at airport gate, but walking through the aircraft door reveals an opulent Roman villa with white marble columns supporting a high ceiling, intricate mosaic floors depicting mythological scenes, a central courtyard with a bubbling fountain surrounded by lush gardens, comfortable Roman couches with silk cushions, bronze statues of gods and emperors, and warm Mediterranean sunlight streaming through open archways. The impossible interior includes multiple rooms with frescoed walls and a view of rolling Italian hills through grand windows.",

      // Space Station Command Center Interior
      "EPIC FLIGHT INTERIOR: Normal business jet exterior on runway, but entering through the aircraft door leads into a futuristic space station command center with holographic displays floating in mid-air, sleek metallic surfaces with blue LED lighting, zero-gravity seating pods that rotate and adjust automatically, massive viewing windows showing galaxies, nebulae, and distant planets, advanced control panels with touch-screen interfaces, and a central holographic star map showing real-time cosmic data. The high-tech interior defies the aircraft's external dimensions with multiple levels connected by floating platforms.",

      // Circus Tent Interior
      "EPIC FLIGHT INTERIOR: Regular small aircraft exterior on airfield, but stepping inside reveals a full three-ring circus with red and white striped tent walls soaring high above, circus performers practicing on trapeze swings, trained animals in decorated enclosures, colorful bleachers filled with cheering spectators, popcorn and cotton candy vendors, a ringmaster in top hat and red coat, and bright carnival lights creating a festive atmosphere. The impossible interior contains the entire circus experience with sawdust floors and the smell of caramel apples.",

      // Tropical Beach Resort Interior
      "EPIC FLIGHT INTERIOR: Standard helicopter exterior on helipad, but entering through the door transports you to a tropical beach resort with white sand floors, swaying palm trees with coconuts, a tiki bar serving colorful drinks with little umbrellas, comfortable beach loungers, the sound of gentle ocean waves, warm tropical breeze, hammocks strung between palm trees, and a view of turquoise ocean stretching to the horizon. The magical interior includes beach huts, surfboards leaning against palm trees, and the scent of tropical flowers and sea salt.",

      // Massive Library Interior
      "EPIC FLIGHT INTERIOR: Normal commercial jet exterior at terminal, but walking through the aircraft door reveals a magnificent multi-story library like Beauty and the Beast with towering bookshelves reaching impossibly high ceilings, rolling ladders on tracks, floating books that glow softly as they drift through the air, comfortable reading nooks with plush armchairs, warm golden lighting from ornate chandeliers, spiral staircases connecting different levels, ancient tomes and modern books coexisting, and the peaceful atmosphere of infinite knowledge. The impossible interior extends vertically and horizontally far beyond the aircraft's dimensions.",

      // Japanese Garden Interior
      "EPIC FLIGHT INTERIOR: Regular private jet exterior on tarmac, but stepping inside reveals a serene Japanese garden with carefully raked zen sand patterns, a peaceful koi pond with orange and white fish swimming lazily, traditional wooden bridges arching over flowing streams, cherry blossom trees in full bloom with pink petals gently falling, stone lanterns providing soft warm light, bamboo fountains making gentle trickling sounds, meditation areas with comfortable cushions, and the distant sound of temple bells. The tranquil interior defies physics with its expansive natural landscape.",

      // Victorian Mansion Interior
      "EPIC FLIGHT INTERIOR: Standard small aircraft exterior on runway, but entering through the door leads into an elegant Victorian mansion with rich mahogany wood paneling, ornate wallpaper with gold accents, a grand staircase with carved banisters, crystal chandeliers casting warm light, antique furniture with velvet upholstery, oil paintings in gilded frames, a crackling fireplace with marble mantelpiece, Persian rugs on polished hardwood floors, and tall windows with heavy drapes overlooking a misty English countryside. The opulent interior spans multiple rooms and floors impossibly contained within the small aircraft."
    ];

    const selectedPrompt = flightInteriorPrompts[Math.floor(Math.random() * flightInteriorPrompts.length)];

    // Enhanced prompt for epic visual quality
    const enhancedPrompt = `${selectedPrompt}

Style: Epic fantasy concept art, impossible interior architecture, magical realism, photorealistic 3D rendering with intricate details, dramatic lighting showcasing the contrast between normal aircraft exterior and magical interior, rich textures and materials, cinematic depth of field, 8K ultra-high resolution, fantasy meets reality aesthetic, detailed environmental storytelling, wide interior shot showing the impossible scale and magical atmosphere, warm inviting lighting that makes the space feel welcoming and mysterious.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('✈️ Generating Epic Flight Interior with enhanced prompt...');

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

      console.log('✅ Epic Flight Interior generated successfully');
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
        "A Boeing 737 exterior hiding a grand medieval castle interior with stone walls, tapestries, and a roaring fireplace",
        "A private jet exterior containing a magnificent underwater palace with aquarium walls and swimming dolphins",
        "A helicopter exterior that opens to reveal an enchanted forest lodge with living trees and fairy lights",
        "A commercial airliner exterior concealing an opulent Roman villa with marble columns and mosaic floors",
        "A business jet exterior hiding a futuristic space station command center with holographic displays",
        "A small aircraft exterior containing a full three-ring circus with performers and cheering crowds",
        "A helicopter exterior that opens to a tropical beach resort with palm trees and ocean waves",
        "A commercial jet exterior concealing a massive multi-story library with floating books and spiral staircases",
        "A private jet exterior hiding a serene Japanese garden with koi ponds and cherry blossoms",
        "A small aircraft exterior containing an elegant Victorian mansion with crystal chandeliers and antique furniture"
      ];

      // Match description to the selected prompt
      const promptIndex = flightInteriorPrompts.indexOf(selectedPrompt);
      const description = descriptions[promptIndex] || "A normal aircraft exterior hiding an impossible magical interior that defies physics and space";

      return {
        description,
        image: {
          url: imageUrl,
          prompt: selectedPrompt,
          description: "Epic Flight Interior - Impossible aircraft interior"
        }
      };

    } catch (error) {
      console.error('Epic Flight Interior generation failed:', error);
      
      let errorMessage = 'Failed to generate epic flight interior';
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
    generateEpicFlightInteriorsContent,
    isGenerating,
    error
  };
};

export default useEpicFlightInteriorsContent;
