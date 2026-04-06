import { useState } from 'react';
import axios from 'axios';

const useMedievalMurderMysteryContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateMedievalMurderMysteryContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🗡️ Generating medieval murder mystery with ChatGPT...');

      // Generate the murder mystery content
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of medieval murder mysteries who creates authentic historical crime scenarios. Your job is to design murder cases set in real medieval locations (1200-1500 AD) with fictional characters. Focus on realistic medieval technology, politics, and social structures - no magic or fantasy elements.'
          },
          {
            role: 'user',
            content: `Create a medieval murder mystery. Generate a JSON object with:

            - title: Mystery title (e.g., "The Canterbury Cathedral Murder", "Death in the Guild Hall")
            - location: Real medieval location (e.g., "Canterbury Cathedral, England 1387", "Notre-Dame de Paris, France 1245", "Westminster Palace, London 1356")
            - victim: Victim name and brief description (e.g., "Brother Thomas, monastery scribe")
            - story: The mystery story (200-300 words) describing the crime scene and circumstances
            - clues: Array of exactly 3 clues that help solve the mystery
            - suspects: Array of 3-4 suspects, each with name and description
            - solution: Object with murderer (name), method (how they did it), and explanation (detailed solution)
            - imagePrompt: Detailed prompt for generating the medieval crime scene image

            STORY REQUIREMENTS:
            - Set in authentic medieval period (1200-1500 AD)
            - Real historical locations but fictional characters
            - Realistic medieval technology only (no gunpowder, no magic)
            - Medieval social hierarchy and politics
            - Authentic medieval atmosphere and details

            CLUES REQUIREMENTS:
            - Exactly 3 clues that help solve the mystery
            - Each clue should point toward the solution
            - Medieval-appropriate evidence (wax seals, ink stains, fabric, coins, etc.)
            - Should be discoverable with medieval investigation methods
            - Examples: torn parchment, bloodstained cloak, missing silver, broken seal

            SUSPECTS REQUIREMENTS:
            - Authentic medieval professions and social positions
            - Realistic medieval motives (inheritance, politics, trade disputes, religious conflicts)
            - Examples: court scribe, merchant, knight, monk, blacksmith, tavern keeper, guild master
            - Each should have believable medieval alibis and backgrounds

            SOLUTION REQUIREMENTS:
            - Pick one suspect as the murderer
            - Use realistic medieval murder methods (poison, dagger, crossbow, strangling, etc.)
            - Medieval motives (political intrigue, inheritance, trade rivalry, religious dispute)
            - Tie solution back to the clues provided

            IMAGE PROMPT REQUIREMENTS:
            - Authentic medieval crime scene
            - Should match the story location and time period
            - Include period-accurate architecture, clothing, and objects
            - Atmospheric medieval setting (stone walls, tapestries, candles, etc.)
            - Make it look like a medieval manuscript illustration or painting

            EXAMPLE SCENARIOS:
            - Merchant murdered in London guild hall over trade dispute
            - Monk found dead in monastery scriptorium with poisoned ink
            - Knight killed in castle great hall during feast
            - Scribe murdered in cathedral library over forbidden manuscript
            - Blacksmith found dead in forge with his own hammer

            REAL MEDIEVAL LOCATIONS TO USE:
            - Canterbury Cathedral, England
            - Notre-Dame de Paris, France  
            - Westminster Palace, London
            - Cologne Cathedral, Germany
            - Florence Cathedral, Italy
            - Chartres Cathedral, France
            - York Minster, England
            - Reims Cathedral, France

            Return ONLY valid JSON.`
          }
        ],
        max_tokens: 1200,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const contentText = response.data.choices[0].message.content.trim();
      
      // Extract JSON from response
      let jsonText = contentText;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1];
      }
      
      // Find first complete JSON object
      const firstBrace = jsonText.indexOf('{');
      if (firstBrace > -1) {
        jsonText = jsonText.substring(firstBrace);
        let braceCount = 0;
        let firstObjectEnd = -1;
        for (let i = 0; i < jsonText.length; i++) {
          if (jsonText[i] === '{') braceCount++;
          if (jsonText[i] === '}') braceCount--;
          if (braceCount === 0 && jsonText[i] === '}') {
            firstObjectEnd = i;
            break;
          }
        }
        if (firstObjectEnd > -1) {
          jsonText = jsonText.substring(0, firstObjectEnd + 1);
        }
      }
      
      // Clean up JSON
      jsonText = jsonText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
      
      console.log('Cleaned medieval mystery JSON:', jsonText);
      
      let mysteryData;
      try {
        mysteryData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse medieval mystery JSON');
      }

      console.log('✅ Medieval murder mystery generated successfully');
      console.log('Mystery data:', mysteryData);

      // Validate that we have an image prompt
      if (!mysteryData.imagePrompt) {
        console.error('Missing imagePrompt in mystery data. Available fields:', Object.keys(mysteryData));
        throw new Error('No image prompt generated');
      }

      // Generate crime scene image
      console.log('🎨 Generating medieval crime scene image with Nano Banana...');
      console.log('Image prompt:', mysteryData.imagePrompt);
      
      const imagePayload = {
        prompt: mysteryData.imagePrompt,
        samples: 1,
        scheduler: "DPM++ 2M",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
        img_width: 1024,
        img_height: 1024,
        base64: false
      };
      
      console.log('Sending payload to Segmind:', imagePayload);
      
      const imageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', imagePayload, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 60000
      });

      const imageUrl = URL.createObjectURL(imageResponse.data);
      console.log('✅ Medieval crime scene image generated successfully');

      return {
        title: mysteryData.title,
        location: mysteryData.location,
        victim: mysteryData.victim,
        story: mysteryData.story,
        clues: mysteryData.clues,
        suspects: mysteryData.suspects,
        solution: mysteryData.solution,
        image: {
          url: imageUrl,
          prompt: mysteryData.imagePrompt,
          description: `Medieval crime scene: ${mysteryData.title}`
        }
      };

    } catch (error) {
      console.error('Medieval murder mystery generation failed:', error);
      
      let errorMessage = 'Failed to generate medieval murder mystery';
      if (error.response?.status === 401) {
        errorMessage = 'API key authentication failed';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.response?.status) {
        errorMessage = `API Error: Status ${error.response.status}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateMedievalMurderMysteryContent,
    isLoading,
    error
  };
};

export default useMedievalMurderMysteryContent;
