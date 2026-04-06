import { useState } from 'react';
import axios from 'axios';

const useEpicMotorHomesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const motorHomeConcepts = [
    "A sleek motor home with solar panel wings that extend for power, a rooftop greenhouse garden, retractable walls that triple the interior space, and a portal door that opens to different scenic locations around the world",
    "An amphibious motor home that transforms into a houseboat, complete with underwater viewing windows, a submarine mode for ocean exploration, and a deck that converts into a floating dock",
    "A treehouse motor home with extending branch-like supports that lift it into the canopy, camouflaged bark exterior, and a crow's nest observation deck with 360-degree forest views",
    "A crystal-powered motor home with transparent walls that can become opaque on command, levitation capabilities for floating over rough terrain, and rooms that exist in pocket dimensions",
    "A steampunk motor home with brass fittings, steam-powered mechanical arms for setup, a coal-burning stove that never runs out of fuel, and gears that transform it into different configurations",
    "A bio-luminescent motor home grown from living trees, with walls that photosynthesize for energy, roots that purify water, and flowers that bloom into furniture when needed",
    "A time-traveling motor home with a flux capacitor engine, windows that show different historical periods, and a library that contains books from every era it visits",
    "A shapeshifting motor home that can mimic local architecture, blend into mountainsides like a chameleon, and compress into a backpack when not in use",
    "A cloud-dwelling motor home with anti-gravity generators, weather manipulation controls, a rain collection system, and the ability to ride storm systems across continents",
    "A desert motor home with sand-filtering life support, solar stills for water generation, underground burrowing capability, and walls that regulate temperature using thermal mass"
  ];

  const generateEpicMotorHomesContent = async () => {
    console.log('🚐 Epic Motor Homes: Starting content generation...');
    setIsGenerating(true);
    setError(null);

    try {
      const randomConcept = motorHomeConcepts[Math.floor(Math.random() * motorHomeConcepts.length)];
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
      
      console.log('🔑 API Key check:', apiKey ? 'API key found' : 'No API key found');
      console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);

      if (!apiKey) {
        console.log('🚐 Epic Motor Homes: No API key, using SVG placeholder');
        // Use themed placeholder when no API key
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          imageUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="800" height="600" fill="#1a1a2e"/>
              <defs>
                <linearGradient id="motorhome-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#2a3441;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#3a4a5a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4a5a6a;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="800" height="600" fill="url(#motorhome-bg)"/>
              
              <!-- Road -->
              <rect x="0" y="450" width="800" height="150" fill="#2c2c2c"/>
              <rect x="0" y="520" width="800" height="10" fill="#ffff00" opacity="0.8"/>
              
              <!-- Motor Home Body -->
              <rect x="200" y="300" width="400" height="150" rx="20" fill="#e8e8e8" stroke="#64b5f6" stroke-width="3"/>
              <rect x="220" y="320" width="360" height="110" rx="15" fill="#f5f5f5"/>
              
              <!-- Wheels -->
              <circle cx="250" cy="470" r="25" fill="#333333"/>
              <circle cx="250" cy="470" r="15" fill="#666666"/>
              <circle cx="550" cy="470" r="25" fill="#333333"/>
              <circle cx="550" cy="470" r="15" fill="#666666"/>
              
              <!-- Windows -->
              <rect x="240" y="340" width="80" height="60" rx="10" fill="#87ceeb" opacity="0.7"/>
              <rect x="340" y="340" width="80" height="60" rx="10" fill="#87ceeb" opacity="0.7"/>
              <rect x="440" y="340" width="80" height="60" rx="10" fill="#87ceeb" opacity="0.7"/>
              
              <!-- Door -->
              <rect x="540" y="360" width="40" height="80" rx="5" fill="#8b4513"/>
              <circle cx="570" cy="400" r="3" fill="#ffd700"/>
              
              <!-- Fantasy Elements -->
              <rect x="180" y="280" width="40" height="20" rx="10" fill="#64b5f6" opacity="0.8"/>
              <rect x="580" y="280" width="40" height="20" rx="10" fill="#64b5f6" opacity="0.8"/>
              
              <!-- Magical Sparkles -->
              <circle cx="150" cy="200" r="3" fill="#ffd700" opacity="0.8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="650" cy="180" r="3" fill="#ffd700" opacity="0.8">
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="400" cy="150" r="3" fill="#ffd700" opacity="0.8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
              </circle>
              
              <text x="400" y="100" fill="#64b5f6" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold">Epic Motor Home</text>
              <text x="400" y="550" fill="#42a5f5" text-anchor="middle" font-family="Arial" font-size="16">${randomConcept.substring(0, 60)}...</text>
            </svg>
          `)}`,
          description: randomConcept
        };
      }

      // Use proxy endpoint like Ridiculous Ventures
      console.log('Making API call via proxy...');
      const imageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: `Epic fantasy motor home: ${randomConcept}. A highly detailed, photorealistic concept art of a magical mobile home with futuristic features. The motor home should look amazing and fantastical, with intricate details, beautiful lighting, and professional vehicle design. High quality, 8k resolution, cinematic composition.`,
          negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy, text, watermark, signature, low resolution, pixelated, grainy, artifacts, jpeg artifacts, compression artifacts, amateur, unprofessional',
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
      console.log('Image generated successfully via proxy');

      return {
        imageUrl,
        description: randomConcept
      };

    } catch (err) {
      console.error('Error generating epic motor homes content:', err);
      // Fallback to placeholder on any error
      const randomConcept = motorHomeConcepts[Math.floor(Math.random() * motorHomeConcepts.length)];
      return {
        imageUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="600" fill="#1a1a2e"/>
            <defs>
              <linearGradient id="motorhome-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#2a3441;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#3a4a5a;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#4a5a6a;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="800" height="600" fill="url(#motorhome-bg)"/>
            
            <!-- Road -->
            <rect x="0" y="450" width="800" height="150" fill="#2c2c2c"/>
            <rect x="0" y="520" width="800" height="10" fill="#ffff00" opacity="0.8"/>
            
            <!-- Motor Home Body -->
            <rect x="200" y="300" width="400" height="150" rx="20" fill="#e8e8e8" stroke="#64b5f6" stroke-width="3"/>
            <rect x="220" y="320" width="360" height="110" rx="15" fill="#f5f5f5"/>
            
            <!-- Wheels -->
            <circle cx="250" cy="470" r="25" fill="#333333"/>
            <circle cx="250" cy="470" r="15" fill="#666666"/>
            <circle cx="550" cy="470" r="25" fill="#333333"/>
            <circle cx="550" cy="470" r="15" fill="#666666"/>
            
            <!-- Windows -->
            <rect x="240" y="340" width="80" height="60" rx="10" fill="#87ceeb" opacity="0.7"/>
            <rect x="340" y="340" width="80" height="60" rx="10" fill="#87ceeb" opacity="0.7"/>
            <rect x="440" y="340" width="80" height="60" rx="10" fill="#87ceeb" opacity="0.7"/>
            
            <!-- Door -->
            <rect x="540" y="360" width="40" height="80" rx="5" fill="#8b4513"/>
            <circle cx="570" cy="400" r="3" fill="#ffd700"/>
            
            <!-- Fantasy Elements -->
            <rect x="180" y="280" width="40" height="20" rx="10" fill="#64b5f6" opacity="0.8"/>
            <rect x="580" y="280" width="40" height="20" rx="10" fill="#64b5f6" opacity="0.8"/>
            
            <!-- Magical Sparkles -->
            <circle cx="150" cy="200" r="3" fill="#ffd700" opacity="0.8">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="650" cy="180" r="3" fill="#ffd700" opacity="0.8">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="400" cy="150" r="3" fill="#ffd700" opacity="0.8">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
            </circle>
            
            <text x="400" y="100" fill="#64b5f6" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold">Epic Motor Home</text>
            <text x="400" y="550" fill="#42a5f5" text-anchor="middle" font-family="Arial" font-size="16">${randomConcept.substring(0, 60)}...</text>
          </svg>
        `)}`,
        description: randomConcept
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateEpicMotorHomesContent,
    isGenerating,
    error
  };
};

export default useEpicMotorHomesContent;
