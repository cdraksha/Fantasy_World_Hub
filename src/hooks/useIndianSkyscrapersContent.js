import { useState, useCallback } from 'react';
import axios from 'axios';

const useIndianSkyscrapersContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateIndianSkyscrapersContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const buildings = [
        {
          description: "Mumbai's Nariman Point Financial Tower - 120 floors of commercial offices and banking headquarters, completed in 2031.",
          imagePrompt: "Massive 120-floor skyscraper in Mumbai Nariman Point, modern glass and steel architecture, Mumbai skyline, Marine Drive visible, realistic Indian cityscape, commercial tower, contemporary architecture"
        },
        {
          description: "Bangalore Tech Spire - 135-floor mixed-use tower housing IT companies and residential units, inaugurated in 2029.",
          imagePrompt: "Towering 135-floor skyscraper in Bangalore, modern tech hub architecture, glass facade with LED displays, Bangalore city skyline, IT district, futuristic Indian city, mixed-use tower"
        },
        {
          description: "Delhi Capital Heights - 110-floor government and administrative complex near Connaught Place, opened in 2030.",
          imagePrompt: "Imposing 110-floor government tower in New Delhi, modern administrative architecture, Delhi skyline with India Gate visible in distance, official government building, contemporary Indian architecture"
        },
        {
          description: "Hyderabad Cyberabad Pinnacle - 125-floor technology and research center in HITEC City, completed in 2032.",
          imagePrompt: "Sleek 125-floor tech tower in Hyderabad HITEC City, modern glass architecture, technology hub, Hyderabad skyline, research and development center, futuristic Indian tech city"
        },
        {
          description: "Chennai Marina Towers - 115-floor residential and commercial complex overlooking the Bay of Bengal, built in 2028.",
          imagePrompt: "Elegant 115-floor tower in Chennai near Marina Beach, modern residential architecture, Bay of Bengal coastline visible, Chennai cityscape, coastal skyscraper, contemporary Indian design"
        },
        {
          description: "Pune IT Metroplex - 130-floor software development and startup incubation center, established in 2031.",
          imagePrompt: "Modern 130-floor IT tower in Pune, contemporary glass and steel design, Pune city skyline, technology center, startup hub architecture, realistic Indian tech city"
        },
        {
          description: "Kolkata Heritage Heights - 105-floor cultural and business center blending modern design with Bengali architectural elements, opened in 2029.",
          imagePrompt: "Distinctive 105-floor tower in Kolkata, modern architecture with Bengali cultural motifs, Kolkata skyline with Howrah Bridge visible, cultural center design, contemporary Indian architecture"
        },
        {
          description: "Ahmedabad Commerce Central - 118-floor textile and diamond trading hub with integrated exhibition spaces, completed in 2030.",
          imagePrompt: "Impressive 118-floor commercial tower in Ahmedabad, modern business architecture, Gujarat industrial cityscape, trading center design, contemporary Indian commercial building"
        },
        {
          description: "Kochi Maritime Megastructure - 112-floor port authority and shipping logistics center overlooking the Arabian Sea, built in 2031.",
          imagePrompt: "Striking 112-floor tower in Kochi, modern maritime architecture, Arabian Sea coastline, Kerala backwaters visible, port city skyline, contemporary Indian coastal design"
        },
        {
          description: "Gurgaon Financial District Tower - 140-floor banking and finance headquarters in the Millennium City, inaugurated in 2032.",
          imagePrompt: "Towering 140-floor financial center in Gurgaon, ultra-modern glass architecture, NCR skyline, banking district, contemporary Indian financial hub, futuristic design"
        }
      ];

      const selectedBuilding = buildings[Math.floor(Math.random() * buildings.length)];

      // Generate the image
      const imageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedBuilding.imagePrompt,
          negative_prompt: 'blurry, low quality, fantasy, unrealistic, cartoon, anime, small buildings, old architecture, rural, village',
          aspect_ratio: '9:16'
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
        description: selectedBuilding.description,
        image: {
          url: imageUrl,
          prompt: selectedBuilding.imagePrompt
        }
      };

    } catch (error) {
      console.error('Error generating Indian skyscrapers content:', error);
      setError('Failed to generate Indian skyscrapers. Please try again.');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateIndianSkyscrapersContent,
    isGenerating,
    error
  };
};

export default useIndianSkyscrapersContent;
