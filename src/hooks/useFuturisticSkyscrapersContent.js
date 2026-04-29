import { useState, useCallback } from 'react';
import axios from 'axios';

const useFuturisticSkyscrapersContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFuturisticSkyscrapersContent = useCallback(async () => {
    const skyscraperPrompts = [
      // Near-Future Realistic Towers in Current Cities
      "REALISTIC FUTURISTIC SKYSCRAPER: 350-floor glass and steel tower in Manhattan, NYC, with advanced engineering that could exist in 30 years. The building uses ultra-strong carbon fiber and smart glass technology, rising above current NYC skyscrapers like One World Trade Center and Empire State Building. Advanced wind resistance systems with aerodynamic design, vertical gardens integrated into the facade, and smart glass that adjusts transparency. The tower has sustainable energy systems with integrated solar panels and wind turbines. Realistic proportions showing it towering over familiar NYC landmarks, with current street layout and neighboring buildings visible. Modern architectural design with clean lines, advanced materials, but grounded in realistic engineering principles.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 320-floor residential and commercial tower in Tokyo, Japan, built with earthquake-resistant technology 30 years in the future. The building uses advanced seismic dampening systems and flexible materials to withstand major earthquakes. Integrated into Tokyo's current skyline near Tokyo Skytree and other familiar landmarks. The tower features modular construction, green terraces on multiple levels, and advanced elevator systems. Smart building technology with automated climate control and energy efficiency. The design respects Japanese architectural principles while pushing height boundaries. Realistic urban integration showing current Tokyo streets, traffic, and neighboring buildings.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 380-floor mixed-use tower in Dubai, UAE, with advanced desert climate adaptation technology. The building uses advanced cooling systems, smart glass that blocks heat while maintaining transparency, and integrated water collection from humidity. Built alongside current Dubai landmarks like Burj Khalifa and Burj Al Arab. The tower features wind-powered cooling systems, vertical gardens that provide natural cooling, and advanced elevator technology for efficient vertical transportation. Sustainable design with solar integration and water recycling systems. Realistic proportions showing it as the new tallest building in Dubai's current skyline.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 340-floor office and residential tower in Singapore with advanced tropical climate engineering. The building uses humidity control systems, typhoon-resistant design, and integrated green spaces for natural cooling. Built within Singapore's current urban landscape near Marina Bay Sands and other familiar landmarks. Features include rainwater collection systems, vertical farms, and smart building automation. The design incorporates Singapore's architectural style while pushing height boundaries with realistic engineering solutions for tropical climates.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 360-floor tower in London, UK, with advanced weather resistance and energy efficiency systems. The building uses new materials that can withstand strong winds and rain, with smart glass technology and integrated renewable energy systems. Built within London's current skyline near The Shard and other landmarks. Features include fog collection systems, wind turbines integrated into the structure, and advanced insulation technology. The design respects London's architectural heritage while incorporating cutting-edge sustainable technology.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 330-floor tower in Hong Kong with advanced space-efficient design and earthquake resistance. The building maximizes limited urban space with innovative vertical transportation and flexible floor plans. Built within Hong Kong's dense current skyline with familiar harbor views. Features include advanced seismic dampening, efficient elevator systems, and smart space utilization. The tower uses new construction techniques to build safely in Hong Kong's challenging terrain while providing maximum usable space.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 310-floor tower in Mumbai, India, with advanced monsoon and heat management systems. The building uses flood-resistant foundations, advanced drainage systems, and heat-dissipating materials. Built within Mumbai's current skyline with views of the Arabian Sea. Features include rainwater harvesting, natural ventilation systems, and materials that can withstand extreme humidity and heat. The design incorporates traditional Indian architectural elements while using cutting-edge climate adaptation technology.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 290-floor tower in São Paulo, Brazil, with advanced air filtration and earthquake resistance. The building uses pollution-filtering facades, seismic dampening systems, and sustainable materials. Built within São Paulo's current urban landscape. Features include air purification systems, green walls that filter pollutants, and flexible construction that can withstand seismic activity. The design addresses urban pollution while providing maximum living and working space.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 370-floor tower in Sydney, Australia, with bushfire resistance and sustainable design. The building uses fire-resistant materials, advanced sprinkler systems, and renewable energy integration. Built within Sydney's current harbor skyline near the Opera House and Harbour Bridge. Features include fire-safe evacuation systems, solar integration, and materials that can withstand extreme heat and potential bushfire conditions.",

      "REALISTIC FUTURISTIC SKYSCRAPER: 325-floor tower in Toronto, Canada, with extreme cold weather adaptation and energy efficiency. The building uses advanced insulation, snow load management, and heating efficiency systems. Built within Toronto's current skyline with views of Lake Ontario. Features include ice-resistant facades, efficient heating systems, and materials that can withstand extreme temperature variations. The design maximizes energy efficiency while providing comfortable living in harsh winter conditions."
    ];

    const selectedPrompt = skyscraperPrompts[Math.floor(Math.random() * skyscraperPrompts.length)];

    // Enhanced prompt for epic visual quality
    const enhancedPrompt = `${selectedPrompt}

Style: Realistic architectural visualization, near-future urban planning, photorealistic 3D rendering with detailed engineering and materials, natural lighting with realistic shadows, detailed textures on glass, steel and concrete surfaces, modern architectural photography style, cinematic depth of field, 8K ultra-high resolution, contemporary skyscraper design meets advanced engineering, realistic urban integration, dramatic scale showing the tower's height compared to current city landmarks, wide establishing shot showing realistic proportions and urban context.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('🌆 Generating Futuristic Skyscraper with enhanced prompt...');

      const response = await axios.post('https://api.segmind.com/v1/juggernaut-lightning-flux', {
        positivePrompt: enhancedPrompt,
        width: 1024,
        height: 1024,
        steps: 25,
        seed: Math.floor(Math.random() * 1000000),
        CFGScale: 7.5,
        outputFormat: "JPG",
        scheduler: "Euler"
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 120000
      });

      console.log('✅ Futuristic Skyscraper generated successfully');
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
        "A 350-floor glass and steel tower in Manhattan with advanced wind resistance and smart glass technology",
        "A 320-floor earthquake-resistant tower in Tokyo with seismic dampening and green terraces",
        "A 380-floor mixed-use tower in Dubai with desert climate adaptation and cooling systems",
        "A 340-floor tower in Singapore with tropical climate engineering and vertical farms",
        "A 360-floor tower in London with weather resistance and renewable energy integration",
        "A 330-floor space-efficient tower in Hong Kong with advanced vertical transportation",
        "A 310-floor tower in Mumbai with monsoon management and heat-dissipating materials",
        "A 290-floor tower in São Paulo with air filtration and pollution-filtering facades",
        "A 370-floor tower in Sydney with bushfire resistance and sustainable design",
        "A 325-floor tower in Toronto with extreme cold adaptation and energy efficiency"
      ];

      // Match description to the selected prompt
      const promptIndex = skyscraperPrompts.indexOf(selectedPrompt);
      const description = descriptions[promptIndex] || "A massive futuristic skyscraper showcasing tomorrow's advanced urban architecture";

      return {
        description,
        image: {
          url: imageUrl,
          prompt: selectedPrompt,
          description: "Futuristic Skyscraper - Tomorrow's megastructure architecture"
        }
      };

    } catch (error) {
      console.error('Futuristic Skyscraper generation failed:', error);
      
      let errorMessage = 'Failed to generate futuristic skyscraper';
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
    generateFuturisticSkyscrapersContent,
    isGenerating,
    error
  };
};

export default useFuturisticSkyscrapersContent;
