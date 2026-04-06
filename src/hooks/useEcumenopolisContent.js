import { useState, useCallback } from 'react';
import axios from 'axios';

const useEcumenopolisContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const generateContent = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const scenarios = [
        {
          description: "Byzantine golden domes rise beside Aztec stepped pyramids while Japanese pagodas tower over African geometric patterns in this endless multicultural cityscape.",
          prompt: "Massive ecumenopolis planet-wide city with Byzantine golden domes and Aztec stepped pyramids, Japanese pagodas towering over African geometric patterns, Chinese temples, European Gothic spires, endless urban sprawl stretching to horizon, flying vehicles between cultural districts, atmospheric perspective, epic scale"
        },
        {
          description: "Scandinavian wooden towers blend with Polynesian navigation spires while Russian onion domes meet Mayan pyramid city blocks in architectural harmony.",
          prompt: "Multicultural ecumenopolis cityscape with Scandinavian wooden mega-towers, Polynesian navigation spires, Russian onion domes, Mayan stepped pyramid city blocks, Celtic stone circles as plazas, planet-wide urban environment with cultural fusion districts"
        },
        {
          description: "African tribal patterns decorate towering spires while East Asian pagoda-skyscrapers connect to Mediterranean coastal architecture across continents.",
          prompt: "Terran ecumenopolis featuring African tribal pattern towers, East Asian pagoda-skyscrapers, Mediterranean coastal architecture with white stone, Aboriginal dot painting on building facades, all connected by elevated walkways and flying traffic lanes"
        },
        {
          description: "Moorish geometric arches frame Incan stonework while Celtic spirals wind around towers topped with Tibetan monastery architecture.",
          prompt: "Planet-wide multicultural city with Moorish geometric arches, Incan precision stonework, Celtic spiral towers, Tibetan monastery architecture on tower tops, Native American pueblo structures, endless cultural fusion architecture stretching across continents"
        },
        {
          description: "Ottoman palace domes merge with Nordic minimalist towers while Aboriginal dreamtime patterns flow across mega-structures in this vast synthesis.",
          prompt: "Ecumenopolis with cultural synthesis: Ottoman palace domes, Nordic minimalist towers, Aboriginal dreamtime patterns flowing across mega-structures, Mughal minarets, Gothic cathedrals, Chinese gardens on floating platforms, atmospheric urban sprawl"
        },
        {
          description: "Polynesian thatched mega-structures rise beside Egyptian pyramid towers while Indian temple spires blend with European castle architecture.",
          prompt: "Massive ecumenopolis with Polynesian thatched mega-structures, Egyptian pyramid towers, Indian temple spires with intricate carvings, European castle architecture, Japanese zen gardens on building terraces, planet-wide multicultural urban environment"
        },
        {
          description: "Korean hanok rooflines crown skyscrapers while Peruvian Inca terraces cascade down tower sides and Greek columns support floating districts.",
          prompt: "Terran ecumenopolis featuring Korean hanok-style rooflines on skyscrapers, Peruvian Inca agricultural terraces cascading down tower sides, Greek marble columns supporting floating districts, Balinese temple gates, endless architectural fusion"
        },
        {
          description: "Thai temple spires twist around Moroccan riads while Venetian canal systems flow between towers decorated with Maori carved patterns.",
          prompt: "Multicultural ecumenopolis with Thai temple spires twisting around Moroccan riad towers, Venetian canal systems flowing between buildings, Maori carved patterns decorating facades, Ethiopian rock-hewn architecture, atmospheric perspective, epic scale"
        }
      ];

      const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      const response = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedScenario.prompt,
          negative_prompt: 'blurry, low quality, distorted, unrealistic, modern generic architecture, single culture, small scale, rural, empty spaces',
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

      const imageBlob = response.data;
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setGeneratedContent({
        description: selectedScenario.description,
        image: { url: imageUrl }
      });
    } catch (error) {
      console.error('Content generation error:', error);
      throw new Error('Failed to generate ecumenopolis content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateContent,
    isLoading,
    generatedContent
  };
};

export default useEcumenopolisContent;
