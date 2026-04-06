import { useState, useCallback } from 'react';
import axios from 'axios';

const useRidiculousVenturesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateRidiculousVenturesContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const ventures = [
        {
          title: "Lunar Dance Academy",
          description: "Professional ballet and contemporary dance studios built inside pressurized domes on the Moon's surface. Students learn to perform graceful movements in low gravity, creating entirely new art forms impossible on Earth. The academy offers specialized programs in 'gravity dancing' where performers use the Moon's 1/6th gravity to achieve impossible leaps and sustained aerial choreography. Classes include Moonwalk Ballet, Zero-G Hip Hop, and Crater Contemporary. The main performance hall features a transparent dome ceiling offering spectacular Earth views during recitals. Advanced students can even perform spacewalk dance routines outside the facility.",
          imagePrompt: "Futuristic dance studio on the Moon with transparent dome ceiling showing Earth in space, dancers performing in low gravity with graceful floating movements, lunar surface visible outside, high-tech dance floor, space suits nearby, ethereal lighting"
        },
        {
          title: "Underwater Barber Shop Chain",
          description: "A network of fully submerged barbershops located 50 feet underwater in crystal-clear tropical lagoons. Customers breathe through advanced gill-implant technology while getting haircuts surrounded by colorful fish and coral reefs. The experience combines grooming with marine therapy, as the gentle underwater currents and aquatic environment provide ultimate relaxation. Each location features pressure-equalized chambers, waterproof styling tools, and trained dolphin assistants who help with towel service. The signature service is the 'Kelp Forest Fade' where stylists use bio-luminescent algae to highlight hair patterns that glow underwater.",
          imagePrompt: "Underwater barbershop with glass walls surrounded by tropical fish and coral reefs, customers getting haircuts while breathing underwater, dolphins assisting, bio-luminescent lighting, futuristic underwater architecture"
        },
        {
          title: "Cloud City Food Trucks",
          description: "Mobile restaurants that operate entirely in the sky, suspended by advanced anti-gravity technology at altitudes of 30,000 feet. Customers are transported up via teleportation pods to enjoy gourmet meals while floating among the clouds. The menu features 'altitude cuisine' - dishes that can only be prepared in low-pressure, high-altitude conditions. Popular items include Cloud Soufflé (which expands to impossible sizes in thin air) and Lightning-Grilled Steaks (cooked using captured electrical storms). Each truck offers panoramic dining with 360-degree sky views and the unique experience of eating dinner above the weather.",
          imagePrompt: "Floating food truck suspended in clouds at high altitude, customers dining on outdoor platforms in the sky, anti-gravity technology visible, storm clouds below, panoramic sky views, futuristic aerial dining experience"
        },
        {
          title: "Volcano Spa & Wellness Resort",
          description: "Luxury wellness retreats built directly into active volcano craters, utilizing natural geothermal energy for therapeutic treatments. Guests enjoy lava stone massages using actual molten rock (safely contained), sulfur spring baths that cure any ailment, and meditation sessions on platforms suspended over bubbling magma. The resort's signature treatment is the 'Pyroclastic Facial' using mineral-rich volcanic ash applied at precisely controlled temperatures. Accommodations feature rooms carved into volcanic rock with natural heating from the Earth's core, and the restaurant serves meals cooked using direct geothermal vents.",
          imagePrompt: "Luxury spa resort built into an active volcano crater, guests relaxing in geothermal pools with lava visible in background, volcanic rock architecture, steam and natural lighting from magma, futuristic wellness facilities"
        },
        {
          title: "Time Travel Tourism Agency",
          description: "A full-service travel company specializing in vacation packages to different historical periods. Customers can book weekend trips to ancient Rome, witness the construction of the pyramids, or attend Shakespeare's opening nights. The agency offers comprehensive packages including period-appropriate clothing, language translation implants, and historical guides who are actual people from those eras. Popular destinations include the Renaissance for art lovers, the Wild West for adventure seekers, and the 1960s for music enthusiasts. All trips include temporal insurance and a guarantee that travelers won't accidentally change history.",
          imagePrompt: "Futuristic travel agency office with time portals showing different historical periods, customers booking trips to ancient civilizations, temporal technology displays, historical period costumes on display, time machines in background"
        },
        {
          title: "Asteroid Mining Coffee Shops",
          description: "Cozy cafés built on hollowed-out asteroids in the asteroid belt, serving the galaxy's finest space-grown coffee to miners and space travelers. Each location is carved into a different type of asteroid - some feature rare metal walls that shimmer with precious minerals, others offer ice-asteroid locations with natural frozen décor. The coffee beans are grown in zero-gravity hydroponic gardens, creating unique flavors impossible to achieve on planets. Signature drinks include Meteorite Mocha, Cosmic Cappuccino, and the Zero-G Espresso that floats in perfect spheres. Free Wi-Fi reaches across the solar system.",
          imagePrompt: "Cozy coffee shop carved inside a large asteroid, space miners and travelers enjoying coffee in zero gravity, hydroponic coffee plants growing on walls, precious metals gleaming in the rock, space views through windows, floating coffee spheres"
        },
        {
          title: "Interdimensional Pet Grooming",
          description: "Professional grooming services for pets from parallel dimensions and alternate realities. The salon specializes in caring for creatures that don't exist in our dimension - like six-legged cats from Universe-B, telepathic dogs from the Mirror Dimension, and rainbow-colored hamsters from the Prismatic Realm. Services include dimensional fur styling, reality-shifting nail trims, and quantum flea treatments. The staff is trained in multi-dimensional animal psychology and equipped with tools that work across different physics laws. Popular services include the 'Schrödinger Special' for cats that exist in multiple states simultaneously.",
          imagePrompt: "Interdimensional pet grooming salon with bizarre alien pets being groomed, six-legged cats, rainbow creatures, portal doorways to other dimensions, futuristic grooming equipment, staff working with impossible animals"
        },
        {
          title: "Gravity Gym Franchise",
          description: "Fitness centers where customers can adjust gravity levels for customized workouts. Want to feel like Superman? Train in 0.1G. Need an extreme challenge? Crank it up to 3G and feel every rep. The gym features gravity chambers for different workout zones - cardio areas with Mars gravity for easy running, strength training sections with Jupiter gravity for maximum resistance, and yoga studios with Moon gravity for impossible poses. Personal trainers are certified in multi-gravity fitness techniques, and the facility includes a zero-gravity swimming pool and variable-gravity rock climbing walls.",
          imagePrompt: "Futuristic gym with gravity control panels, people working out in different gravity zones, some floating in zero gravity, others struggling in high gravity, anti-gravity swimming pool, variable gravity climbing walls, high-tech fitness equipment"
        },
        {
          title: "Dream Architecture Studio",
          description: "An architectural firm that designs and builds structures inside people's dreams. Using advanced dream-sharing technology, architects collaborate with clients while they sleep to create impossible buildings that exist only in the subconscious realm. Projects include floating castles, upside-down skyscrapers, and houses made entirely of memories. The firm specializes in 'lucid construction' where dreamers can consciously participate in building their dream homes. Services include nightmare renovation (turning bad dreams into pleasant spaces), recurring dream expansion, and shared dream community planning where multiple people can live in the same dream neighborhood.",
          imagePrompt: "Surreal architectural studio inside a dream landscape, impossible floating buildings being designed, architects working with dream-like tools, structures defying physics, ethereal lighting, dream-sharing technology visible, fantastical architecture"
        },
        {
          title: "Quantum Cooking Classes",
          description: "Culinary school where students learn to cook using quantum physics principles. Dishes exist in multiple states simultaneously until observed, ingredients can be in several locations at once, and meals are prepared using quantum entanglement to instantly share flavors across vast distances. Popular classes include 'Superposition Soufflé' (which is both risen and fallen until someone looks), 'Entangled Pasta' (where noodles cooked on Earth instantly affect their paired noodles on Mars), and 'Uncertainty Principle Seasoning' (where you can know the exact flavor OR the exact spice amount, but never both). Graduation requires successfully preparing a meal that exists in parallel universes.",
          imagePrompt: "Quantum physics cooking classroom with ingredients floating in multiple states, chefs using particle accelerator cooking tools, dishes existing in superposition, quantum entanglement cooking equipment, scientific cooking apparatus, impossible culinary physics"
        }
      ];

      const selectedVenture = ventures[Math.floor(Math.random() * ventures.length)];

      // Generate the image
      const imageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedVenture.imagePrompt,
          negative_prompt: 'blurry, low quality, boring, realistic, mundane, ordinary, current technology, present day, conventional business',
          aspect_ratio: '16:9'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const imageBlob = imageResponse.data;
      const imageUrl = URL.createObjectURL(imageBlob);

      return {
        title: selectedVenture.title,
        description: selectedVenture.description,
        image: {
          url: imageUrl,
          prompt: selectedVenture.imagePrompt
        }
      };

    } catch (error) {
      console.error('Error generating ridiculous ventures content:', error);
      setError('Failed to generate ridiculous venture. Please try again.');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateRidiculousVenturesContent,
    isGenerating,
    error
  };
};

export default useRidiculousVenturesContent;
