import { useState, useCallback } from 'react';
import axios from 'axios';

const useModernMahabharataContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateModernMahabharataContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const combatScenarios = [
        {
          description: "Arjuna leading a precision airstrike over enemy territory in an F-22 Raptor, his legendary archery skills translated to modern aerial combat.",
          imagePrompt: "Epic scene of Arjuna as modern fighter pilot in F-22 Raptor cockpit during aerial combat, traditional Indian warrior features, intense action, missiles firing, enemy aircraft in background, cinematic military aviation, heroic composition"
        },
        {
          description: "Bhima charging through enemy lines in an M1 Abrams tank, his immense strength now channeled through heavy armor warfare.",
          imagePrompt: "Powerful scene of Bhima as tank commander in M1 Abrams tank crushing through battlefield, muscular Indian warrior, tank cannon firing, explosive combat action, modern warfare, dust and debris, heroic tank battle"
        },
        {
          description: "Yudhishthira coordinating a multi-front assault from a command vehicle, his strategic wisdom guiding modern combined arms operations.",
          imagePrompt: "Commanding scene of Yudhishthira as military commander in armored command vehicle with multiple screens and communications, noble Indian features, coordinating battle operations, modern military technology, tactical leadership"
        },
        {
          description: "Nakula and Sahadeva executing a synchronized special forces raid behind enemy lines, their twin bond perfect for covert operations.",
          imagePrompt: "Dynamic scene of twin warriors Nakula and Sahadeva in modern special forces gear conducting night raid, tactical equipment, synchronized movement, stealth operation, military action, Indian features, elite soldiers"
        },
        {
          description: "Krishna providing tactical guidance to allied forces during a major urban combat operation, his divine wisdom adapted for modern warfare.",
          imagePrompt: "Inspiring scene of Krishna as military advisor in urban combat zone, traditional Indian features with modern tactical gear, guiding soldiers, city battlefield background, leadership presence, modern warfare setting"
        },
        {
          description: "Arjuna as an elite sniper taking impossible shots across a war-torn cityscape, his perfect aim legendary even in modern combat.",
          imagePrompt: "Intense scene of Arjuna as military sniper on rooftop with advanced rifle, focused expression, urban warfare environment, precision shooting, modern military gear, Indian warrior features, tactical scope"
        },
        {
          description: "Bhima breaching enemy fortifications with explosive charges, his raw power demolishing obstacles that stop other soldiers.",
          imagePrompt: "Explosive scene of Bhima as combat engineer with demolition charges breaching concrete fortifications, muscular build, modern military explosives, debris flying, intense combat action, heroic warrior"
        },
        {
          description: "Yudhishthira leading troops from the front in a desert battle, his righteous leadership inspiring soldiers in mechanized warfare.",
          imagePrompt: "Epic scene of Yudhishthira leading mechanized infantry charge across desert battlefield, noble bearing, modern military vehicles, dust clouds, inspiring leadership, desert warfare, heroic commander"
        },
        {
          description: "Nakula piloting an attack helicopter providing close air support, his swift reflexes perfect for aerial combat maneuvers.",
          imagePrompt: "Dynamic scene of Nakula as helicopter pilot in Apache attack helicopter during combat mission, skilled aviator, missiles and gunfire, aerial battlefield, modern military aviation, intense action"
        },
        {
          description: "Sahadeva operating advanced surveillance drones to gather intelligence on enemy positions, his keen perception enhanced by technology.",
          imagePrompt: "Tactical scene of Sahadeva operating multiple drone control systems, high-tech surveillance equipment, monitoring enemy positions, modern military intelligence, focused concentration, advanced technology"
        },
        {
          description: "Krishna coordinating a massive amphibious assault from a command ship, orchestrating the complex modern equivalent of ancient battles.",
          imagePrompt: "Grand scene of Krishna on naval command bridge coordinating amphibious assault, multiple screens showing battle progress, naval warfare, landing craft approaching shore, strategic command, modern military operation"
        },
        {
          description: "All five Pandavas and Krishna in a joint special operations mission, their legendary teamwork adapted for elite modern combat.",
          imagePrompt: "Epic group scene of all six Mahabharata warriors in modern special forces gear during joint operation, each with distinct roles and equipment, coordinated team action, elite military unit, heroic composition"
        }
      ];

      const selectedScenario = combatScenarios[Math.floor(Math.random() * combatScenarios.length)];

      // Generate the image
      const imageResponse = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: selectedScenario.imagePrompt,
          negative_prompt: 'blurry, low quality, cartoon, anime, peaceful, non-military, civilian, fantasy elements, unrealistic, poor composition',
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
        description: selectedScenario.description,
        image: {
          url: imageUrl,
          prompt: selectedScenario.imagePrompt
        }
      };

    } catch (error) {
      console.error('Error generating modern Mahabharata content:', error);
      setError('Failed to generate modern Mahabharata combat. Please try again.');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateModernMahabharataContent,
    isGenerating,
    error
  };
};

export default useModernMahabharataContent;
