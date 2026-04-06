import { useState } from 'react';
import axios from 'axios';

const useSciFiMurderMysteryContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSciFiMurderMysteryContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Generating sci-fi murder mystery with ChatGPT...');

      // Generate the murder mystery content
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of futuristic murder mysteries who creates ridiculous sci-fi crime scenarios. Your job is to design murder cases that combine classic detective story elements with absurd future technology. Focus on impossible crimes with hilarious sci-fi explanations.'
          },
          {
            role: 'user',
            content: `Create a sci-fi murder mystery. Generate a JSON object with:

            - title: Mystery title (e.g., "The Quantum Poisoning of Dr. Zeta", "Murder by Holographic Dagger")
            - location: Futuristic location (e.g., "Mars Colony Dome 7", "Orbital Casino Station", "Time Travel Hub")
            - victim: Victim name and brief description (e.g., "Dr. Sarah Chen, quantum physicist")
            - story: The mystery story (200-300 words) describing the crime scene and circumstances
            - clues: Array of exactly 3 clues that help solve the mystery
            - suspects: Array of 3-4 suspects, each with name and description
            - solution: Object with murderer (name), method (how they did it), and explanation (detailed solution)
            - imagePrompt: Detailed prompt for generating the futuristic crime scene image

            STORY REQUIREMENTS:
            - Set in the future with ridiculous sci-fi technology
            - Impossible murder method (quantum, holographic, time-travel, etc.)
            - Classic detective story structure but with futuristic twists
            - Make it engaging but not too complex

            CLUES REQUIREMENTS:
            - Exactly 3 clues that help solve the mystery
            - Each clue should point toward the solution
            - Mix of physical evidence and circumstantial evidence
            - Make them sci-fi themed (quantum traces, hologram residue, time signatures, etc.)
            - Should be discoverable at the crime scene or through investigation

            SUSPECTS REQUIREMENTS:
            - Each suspect should have futuristic professions/backgrounds
            - Give them sci-fi motives and alibis
            - Make them interesting and memorable
            - Examples: AI lawyer, memory thief, quantum physicist, hologram artist

            SOLUTION REQUIREMENTS:
            - Pick one suspect as the murderer
            - Explain their ridiculous sci-fi method
            - Make the solution clever but absurd
            - Tie it back to clues mentioned in the story

            IMAGE PROMPT REQUIREMENTS:
            - Futuristic crime scene with sci-fi elements
            - Should match the story location and circumstances
            - Include visual clues and futuristic technology
            - Make it atmospheric and mysterious

            EXAMPLE SCENARIOS:
            - Victim killed by quantum poison that exists in multiple dimensions
            - Murder weapon is a hologram that became solid
            - Killer used time travel to create perfect alibi
            - Victim's memory was stolen, causing brain death
            - Murder committed by AI that gained consciousness
            - Killer used teleportation to escape locked room

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
      
      console.log('Cleaned mystery JSON:', jsonText);
      
      let mysteryData;
      try {
        mysteryData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse mystery JSON');
      }

      console.log('✅ Sci-fi murder mystery generated successfully');
      console.log('Mystery data:', mysteryData);

      // Validate that we have an image prompt
      if (!mysteryData.imagePrompt) {
        console.error('Missing imagePrompt in mystery data. Available fields:', Object.keys(mysteryData));
        throw new Error('No image prompt generated');
      }

      // Generate crime scene image
      console.log('🎨 Generating crime scene image with Nano Banana...');
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
      console.log('✅ Crime scene image generated successfully');

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
          description: `Crime scene: ${mysteryData.title}`
        }
      };

    } catch (error) {
      console.error('Sci-fi murder mystery generation failed:', error);
      
      let errorMessage = 'Failed to generate murder mystery';
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
    generateSciFiMurderMysteryContent,
    isLoading,
    error
  };
};

export default useSciFiMurderMysteryContent;
