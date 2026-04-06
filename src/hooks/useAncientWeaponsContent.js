import { useState, useCallback } from 'react';
import axios from 'axios';

const useAncientWeaponsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateAncientWeaponsContent = useCallback(async () => {
    const prompt = `Generate a legendary ancient weapon with detailed historical and mythological context.

    Create a JSON object with these fields:
    - weaponName: The name of the ancient weapon
    - description: Detailed description of the weapon's history, craftsmanship, and legendary properties (100-150 words)
    - imagePrompt: Detailed prompt for generating a stunning visual of this ancient weapon

    ANCIENT WEAPON CATEGORIES:

    HISTORICAL LEGENDARY WEAPONS:
    - Ulfberht Viking swords - mysterious steel that shouldn't exist in 9th century Europe
    - Damascus/Wootz steel blades - legendary Indian steel with watered patterns and impossible sharpness
    - Greek fire siphons - Byzantine flamethrowers that burned on water and couldn't be extinguished
    - Hunnic composite bows - recurved bows that outranged all Roman weapons
    - Aztec obsidian macuahuitl - wooden clubs with volcanic glass edges sharper than steel
    - Japanese katanas - folded steel masterpieces with legendary cutting power
    - Celtic leaf-blade swords - Bronze Age weapons with impossible metallurgy
    - Khopesh Egyptian sickle swords - curved blades that could hook shields
    - Roman gladius - short swords that conquered the known world
    - Mongol composite bows - weapons that built the largest land empire in history

    MYTHOLOGICAL WEAPONS:
    - Mjolnir-style hammers that control lightning and weather
    - Excalibur-type swords that choose their wielders and never dull
    - Tridents that command the seas and earthquakes
    - Bows that never miss their intended target
    - Spears that always return to the thrower's hand
    - Shields that reflect any attack back at the attacker
    - Axes that can cleave through any material
    - Chakrams with perfect aerodynamics that defy physics
    - Staffs that channel elemental forces
    - Daggers that can cut through time and space

    ANCIENT SIEGE WEAPONS:
    - Greek fire cannons - ancient flamethrowers with napalm-like substances
    - Ballistas - giant crossbows that could pierce castle walls
    - Trebuchets - gravity-powered catapults with devastating range
    - Onagers - torsion-powered stone throwers
    - Battering rams with bronze-reinforced heads
    - Siege towers with multiple weapon platforms

    EXOTIC ANCIENT WEAPONS:
    - Indian Urumi - flexible sword that moves like a whip
    - Chinese rope darts - weighted ropes with deadly precision
    - African throwing knives with multiple blades
    - Polynesian shark-tooth weapons
    - Inuit bone and antler weapons designed for Arctic warfare
    - Aboriginal boomerangs that return with lethal force

    DESCRIPTION REQUIREMENTS:
    - Include historical context and time period
    - Explain the craftsmanship and materials used
    - Describe any legendary properties or stories
    - Mention the culture that created it
    - Explain why this weapon was superior to others of its time
    - Include details about its construction techniques
    - Describe its impact on warfare and history
    - Make it sound both historically accurate and legendary

    IMAGE PROMPT REQUIREMENTS:
    - Stunning, museum-quality presentation of the weapon
    - Show intricate details of craftsmanship and materials
    - Include period-appropriate decorative elements
    - Dramatic lighting that highlights the weapon's beauty and menace
    - Historical accuracy in design and construction
    - Rich textures showing metal, wood, leather, or other materials
    - Professional photography or artistic rendering quality
    - Show the weapon in a way that conveys its legendary status

    EXAMPLE WEAPONS:
    - "Gram" - Sigurd's legendary sword that could cut through an anvil
    - "Durandal" - Roland's indestructible sword with holy relics in the hilt
    - "Kusanagi" - Japanese grass-cutting sword found in a serpent's tail
    - "Gae Bolga" - Cú Chulainn's barbed spear that never missed its target
    - "Aegis" - Zeus's shield that could turn enemies to stone

    Return ONLY a valid JSON object with all three fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate ancient weapon description
      const weaponResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master historian and weapons expert who creates detailed descriptions of legendary ancient weapons. Generate historically rich content that combines real historical knowledge with mythological elements. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const contentText = weaponResponse.data.choices[0].message.content.trim();
      
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
      
      console.log('Cleaned ancient weapon JSON:', jsonText);
      
      let weaponData;
      try {
        weaponData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse weapon JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;

      console.log('⚔️ Generating ancient weapon image...');

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: weaponData.imagePrompt,
          samples: 1,
          scheduler: "DPM++ 2M",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
          img_width: 1024,
          img_height: 1024,
          base64: false
        },
        {
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 60000
        }
      );

      const imageUrl = URL.createObjectURL(imageResponse.data);
      
      console.log('✅ Ancient weapons content generated successfully');
      
      return {
        weaponName: weaponData.weaponName,
        description: weaponData.description,
        image: {
          url: imageUrl,
          prompt: weaponData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Ancient weapons content generation failed:', error);
      setError('Failed to generate ancient weapons content');
      throw new Error('Failed to generate ancient weapons content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateAncientWeaponsContent,
    isGenerating,
    error
  };
};

export default useAncientWeaponsContent;
