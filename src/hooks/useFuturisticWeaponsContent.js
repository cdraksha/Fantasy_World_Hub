import { useState, useCallback } from 'react';
import axios from 'axios';

const useFuturisticWeaponsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFuturisticWeaponsContent = useCallback(async () => {
    const prompt = `Generate a futuristic weapon with advanced technology and scientific principles.

    Create a JSON object with these fields:
    - weaponName: The name of the futuristic weapon
    - description: Detailed description of the weapon's technology, capabilities, and scientific principles (100-150 words)
    - imagePrompt: Detailed prompt for generating a stunning visual of this futuristic weapon

    FUTURISTIC WEAPON CATEGORIES:

    ENERGY-BASED WEAPONS:
    - Plasma swords/katanas - energy blades that cut through molecular bonds
    - Laser rifles - coherent light beams with pinpoint accuracy
    - Ion cannons - charged particle beams that disintegrate matter
    - Photon blasters - light-speed projectiles with devastating impact
    - Neural disruptors - energy weapons that scramble consciousness
    - Particle beam weapons - subatomic projectiles at near light speed
    - Fusion lances - miniaturized fusion reactions as projectiles
    - Antimatter rifles - matter-antimatter annihilation weapons

    EXOTIC PHYSICS WEAPONS:
    - Gravity guns - weapons that manipulate local gravitational fields
    - Time-dilation weapons - temporal distortion fields that slow enemies
    - Quantum entanglement rifles - bullets that exist in multiple dimensions
    - Dark matter cannons - invisible projectiles made of dark matter
    - Dimensional rift generators - weapons that tear holes in spacetime
    - Singularity grenades - miniature black holes as weapons
    - Tachyon pulse weapons - faster-than-light particle beams
    - Zero-point energy extractors - vacuum energy manipulation weapons

    AI-ENHANCED WEAPONS:
    - Self-targeting smart bullets that never miss their intended target
    - Adaptive weapons that change form based on threat assessment
    - Nano-swarm weapons that rebuild and repair themselves
    - Holographic decoy launchers that create false targets
    - Predictive targeting systems that anticipate enemy movements
    - Swarm intelligence missiles that coordinate attacks
    - Machine learning combat drones with evolving tactics
    - Quantum AI targeting computers with perfect accuracy

    MOLECULAR/NANO WEAPONS:
    - Molecular disassemblers that break down matter at atomic level
    - Nano-forge launchers that build projectiles during flight
    - Programmable matter weapons that reshape themselves
    - Molecular acid weapons that dissolve any material
    - Self-replicating ammunition that multiplies in flight
    - Atomic restructuring beams that transform matter
    - Nano-virus weapons that corrupt enemy technology
    - Quantum tunneling bullets that phase through armor

    BIOLOGICAL/NEURAL WEAPONS:
    - Neural interface weapons controlled by thought
    - Bioelectric pulse weapons that disrupt nervous systems
    - Synthetic organism launchers with programmed behaviors
    - Memory manipulation devices that alter consciousness
    - Empathy disruptors that eliminate emotional responses
    - Cognitive overload weapons that cause mental shutdown
    - Synthetic pheromone weapons that control behavior
    - Genetic targeting weapons that affect specific DNA

    DESCRIPTION REQUIREMENTS:
    - Explain the scientific principles behind the weapon
    - Describe the advanced materials and technology used
    - Include details about power sources and energy requirements
    - Explain the weapon's capabilities and limitations
    - Describe safety features and fail-safes
    - Include manufacturing details (3D printing, molecular assembly, etc.)
    - Explain tactical applications and strategic advantages
    - Make it sound scientifically plausible but advanced

    IMAGE PROMPT REQUIREMENTS:
    - Sleek, high-tech design with advanced materials
    - Glowing energy elements and power indicators
    - Futuristic aesthetics with clean lines and curves
    - Advanced HUD displays and targeting systems
    - Exotic materials like carbon nanotubes, metamaterials
    - Energy fields, plasma effects, or particle streams
    - Professional sci-fi concept art quality
    - Show the weapon in a way that conveys its advanced technology

    EXAMPLE WEAPONS:
    - "Quantum Katana" - plasma blade stabilized by quantum fields
    - "Graviton Rifle" - weapon that fires concentrated gravity waves
    - "Neural Mesh Disruptor" - non-lethal consciousness scrambler
    - "Tachyon Pulse Cannon" - faster-than-light particle weapon
    - "Nano-Swarm Launcher" - self-assembling projectile system

    Return ONLY a valid JSON object with all three fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate futuristic weapon description
      const weaponResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master futurist and weapons technologist who creates detailed descriptions of advanced future weapons. Generate scientifically plausible content that combines real physics with speculative technology. Always return valid JSON.'
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
      
      console.log('Cleaned futuristic weapon JSON:', jsonText);
      
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

      console.log('⚡ Generating futuristic weapon image...');

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
      
      console.log('✅ Futuristic weapons content generated successfully');
      
      return {
        weaponName: weaponData.weaponName,
        description: weaponData.description,
        image: {
          url: imageUrl,
          prompt: weaponData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Futuristic weapons content generation failed:', error);
      setError('Failed to generate futuristic weapons content');
      throw new Error('Failed to generate futuristic weapons content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateFuturisticWeaponsContent,
    isGenerating,
    error
  };
};

export default useFuturisticWeaponsContent;
