import { useState, useCallback } from 'react';
import axios from 'axios';

const useEpicHousesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateEpicHousesContent = useCallback(async () => {
    const prompt = `Generate an epic house modification scenario that is realistic but amazing - something you could actually build.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the house modification (20-40 words)
    - imagePrompt: Detailed prompt for generating the image showing this epic house feature

    EPIC HOUSES CONCEPT:
    - Focus on SECRET, HIDDEN, and CONCEALED house modifications
    - Trap doors, secret passages, rotating walls, hidden rooms
    - Surprise elements that guests would never expect
    - Avoid generic features like rock climbing walls, stargazing rooms
    - Think James Bond house, secret agent hideout, speakeasy vibes
    - Hidden commercial spaces (secret Starbucks, McDonald's, etc.)

    HOUSE MODIFICATION IDEAS (Focus on SECRET/HIDDEN/UNIQUE):
    - Secret Starbucks hidden behind rotating bookshelf with full barista setup
    - Trap door in kitchen floor leading to underground speakeasy bar
    - Hidden McDonald's drive-thru window built into living room wall
    - Secret passage behind bathroom mirror to hidden office
    - Floor that opens up to reveal sunken hot tub in living room
    - Hidden arcade room accessed through fake refrigerator door
    - Secret slide from bedroom closet to garage (emergency exit)
    - Wall that rotates to reveal hidden home theater
    - Trap door under dining table leading to wine cellar
    - Hidden panic room behind fake electrical panel
    - Secret tunnel from house to detached garage/workshop
    - Floor-to-ceiling aquarium that's actually a hidden door
    - Hidden elevator disguised as phone booth or wardrobe
    - Secret rooftop access through bedroom ceiling panel
    - Hidden safe room behind fake wall in basement
    - Bookshelf that slides away to reveal hidden library/study
    - Kitchen island that lowers into floor to reveal dance floor
    - Hidden gym behind living room wall (Murphy gym setup)
    - Secret balcony accessed through bedroom wall panel
    - Trap door in shower leading to underground pool

    DESCRIPTION STYLE:
    - Write it as an exciting but achievable home feature
    - Use enthusiastic but realistic tone
    - Mention the practical benefits
    - Make it sound like something people would want
    - Keep it short and punchy (1-2 sentences max)

    IMAGE PROMPT REQUIREMENTS:
    - Show a realistic modern house interior with the epic modification
    - High-quality architectural photography style
    - Good lighting showing the feature clearly
    - Make it look professionally designed and built
    - Include people using/enjoying the feature naturally
    - Modern, clean, well-designed aesthetic
    - Show the scale and functionality of the modification
    - Make it look like something from a luxury home magazine
    - Realistic materials and construction
    - Focus on the "wow factor" while keeping it believable

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
            content: 'You are a creative home design expert who specializes in SECRET, HIDDEN, and UNIQUE house modifications. Focus on trap doors, secret passages, hidden rooms, rotating walls, concealed features, and surprise elements. Avoid generic features like rock climbing walls or stargazing. Think secret speakeasies, hidden Starbucks, trap doors, rotating bookcases, concealed rooms. Always return valid JSON.'
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
      
      console.log('Cleaned epic houses JSON:', jsonText);
      
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

      console.log('🏠 Generating epic house image...');

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: scenarioData.imagePrompt,
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
      
      console.log('✅ Epic houses content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Epic houses content generation failed:', error);
      setError('Failed to generate epic houses content');
      throw new Error('Failed to generate epic houses content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateEpicHousesContent,
    isGenerating,
    error
  };
};

export default useEpicHousesContent;
