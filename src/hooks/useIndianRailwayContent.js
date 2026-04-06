import { useState, useCallback } from 'react';
import axios from 'axios';

const useIndianRailwayContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateIndianRailwayContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const stations = [
        {
          description: "New Delhi Central Station - Ultra-modern terminal with glass dome architecture and 24 platforms for high-speed trains, opened in 2029.",
          imagePrompt: "Massive futuristic New Delhi railway station with glass dome architecture, multiple high-speed train platforms, modern Indian railway terminal, sleek design, contemporary infrastructure, bustling with passengers"
        },
        {
          description: "Mumbai Terminus Megahub - 32-platform station with integrated metro and monorail connections, featuring soaring steel and glass canopies, completed in 2030.",
          imagePrompt: "Enormous Mumbai railway station with soaring steel and glass canopies, 32 platforms, integrated transport hub, modern Indian railway architecture, futuristic design, high-speed trains"
        },
        {
          description: "Bangalore Tech Rail Junction - Smart station with AI-powered passenger flow management and 20 platforms for bullet trains, inaugurated in 2031.",
          imagePrompt: "High-tech Bangalore railway station with smart digital displays, AI systems, modern platforms for bullet trains, futuristic Indian railway terminal, sleek contemporary design"
        },
        {
          description: "Chennai Coastal Central - Waterfront station with wave-inspired architecture and 18 platforms overlooking the Bay of Bengal, built in 2028.",
          imagePrompt: "Stunning Chennai railway station with wave-inspired architecture overlooking Bay of Bengal, waterfront location, modern coastal design, high-speed rail platforms, contemporary Indian infrastructure"
        },
        {
          description: "Kolkata Heritage Rail Complex - Blend of traditional Bengali architecture with ultra-modern facilities across 22 platforms, opened in 2029.",
          imagePrompt: "Impressive Kolkata railway station blending Bengali architectural elements with ultra-modern design, 22 platforms, heritage meets futuristic, contemporary Indian railway terminal"
        },
        {
          description: "Hyderabad Cyberabad Rail Hub - Technology-integrated station with holographic displays and 16 platforms in HITEC City, completed in 2030.",
          imagePrompt: "Futuristic Hyderabad railway station with holographic displays, technology integration, modern platforms in tech city setting, advanced Indian railway infrastructure, sleek design"
        },
        {
          description: "Pune Metro Rail Nexus - Multi-level station with 14 platforms and integrated shopping complex, featuring sustainable green architecture, built in 2031.",
          imagePrompt: "Modern Pune railway station with multi-level design, green architecture, integrated facilities, sustainable features, contemporary Indian railway terminal, eco-friendly design"
        },
        {
          description: "Ahmedabad Diamond Rail Terminal - Geometric diamond-pattern facade with 20 platforms for Gujarat's high-speed network, inaugurated in 2029.",
          imagePrompt: "Striking Ahmedabad railway station with diamond-pattern geometric facade, 20 modern platforms, Gujarat high-speed rail network, contemporary architectural design, futuristic terminal"
        },
        {
          description: "Kochi Maritime Rail Gateway - Port-integrated station with 12 platforms and ship-inspired architecture overlooking the Arabian Sea, opened in 2030.",
          imagePrompt: "Unique Kochi railway station with ship-inspired architecture, port integration, Arabian Sea views, maritime design elements, modern Indian coastal railway terminal"
        },
        {
          description: "Jaipur Heritage Express Hub - Pink sandstone and glass fusion architecture with 18 platforms, honoring Rajasthani heritage in modern design, completed in 2031.",
          imagePrompt: "Beautiful Jaipur railway station with pink sandstone and glass architecture, Rajasthani heritage elements, modern platforms, fusion of traditional and contemporary design"
        }
      ];

      const selectedStation = stations[Math.floor(Math.random() * stations.length)];

      // Generate the image
      const imageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedStation.imagePrompt,
          negative_prompt: 'blurry, low quality, old railway station, outdated infrastructure, crowded, dirty, poor maintenance, unrealistic, cartoon',
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
        description: selectedStation.description,
        image: {
          url: imageUrl,
          prompt: selectedStation.imagePrompt
        }
      };

    } catch (error) {
      console.error('Error generating Indian railway content:', error);
      setError('Failed to generate Indian railway stations. Please try again.');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateIndianRailwayContent,
    isGenerating,
    error
  };
};

export default useIndianRailwayContent;
