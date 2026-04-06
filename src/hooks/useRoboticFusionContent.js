import { useState, useCallback } from 'react';
import axios from 'axios';

const useRoboticFusionContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateRoboticFusionContent = useCallback(async () => {
    const prompt = `Generate a robotic fusion scenario where living beings have robotic enhancements for normal daily activities.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the normal daily activity (20-40 words)
    - imagePrompt: Detailed prompt for generating the image showing this as completely normal

    ROBOTIC FUSION CONCEPT:
    - Living beings (humans, animals) have robotic/mechanical enhancements
    - They use these enhancements for completely normal, everyday activities
    - The activity should look casual and mundane in the image
    - No one in the scene thinks this is unusual - it's just normal life
    - The robotic parts are seamlessly integrated into daily routines

    SCENARIO IDEAS:
    - Dad flying to work with cybernetic wings integrated into his back/shoulder blades
    - Mom cooking dinner with robotic arms that are her actual arms, seamlessly bio-mechanical
    - Kid doing homework with cybernetic hands that have built-in writing capabilities
    - Grandma gardening with telescopic cybernetic legs that extend naturally
    - Dog with integrated mechanical leg enhancements as part of its body
    - Cat with built-in cleaning mechanisms integrated into its paws/body
    - Businessman with cybernetic wheel-feet that are his actual feet
    - Teacher with cybernetic arms that naturally extend for reaching the board
    - Chef with multiple cybernetic arms integrated into their torso
    - Librarian with cybernetic arms that naturally telescope for reaching high shelves

    DESCRIPTION STYLE:
    - Write it as if this is completely normal and everyday
    - Use casual, matter-of-fact tone
    - Don't emphasize the robotic parts as unusual
    - Make it sound like just another day in life
    - Keep it short and simple (1-2 sentences max)

    IMAGE PROMPT REQUIREMENTS:
    - Show the scene as completely normal and casual
    - People should look relaxed and unbothered
    - The robotic parts should be INTEGRATED INTO their bodies, not attached as add-ons
    - Cybernetic limbs, mechanical body parts seamlessly fused with organic tissue
    - Robotic arms/legs/eyes should look like natural body parts, not external devices
    - Realistic, photographic style with seamless bio-mechanical integration
    - Good lighting and composition
    - The activity should look mundane and everyday
    - No one should be staring or acting surprised
    - Make it look like this is just how life normally works
    - Focus on cybernetic integration, not external robotic attachments

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate scenario content
      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative scenario generator who creates cybernetic fusion scenarios. Generate everyday activities where people have robotic/mechanical parts INTEGRATED INTO their bodies (not attached as add-ons). Think cybernetic limbs, bio-mechanical fusion, robotic body parts that ARE their actual body parts. Make it sound completely mundane and ordinary, even though it\'s absurd. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const contentText = scenarioResponse.data.choices[0].message.content.trim();
      
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
      
      console.log('Cleaned robotic fusion JSON:', jsonText);
      
      let scenarioData;
      try {
        scenarioData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse scenario JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;

      console.log('🤖 Generating robotic fusion image...');

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: scenarioData.imagePrompt
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
      
      console.log('✅ Robotic fusion content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Robotic fusion content generation failed:', error);
      setError('Failed to generate robotic fusion content');
      throw new Error('Failed to generate robotic fusion content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateRoboticFusionContent,
    isGenerating,
    error
  };
};

export default useRoboticFusionContent;
