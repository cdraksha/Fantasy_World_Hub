import { useState } from 'react';
import axios from 'axios';

const useTimeAnomalyContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateTimeAnomalyContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('⏰ Generating time anomaly with ChatGPT...');

      // Generate the time anomaly content
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of temporal storytelling who creates "time anomaly" scenarios. Your job is to design situations where two different historical eras are happening simultaneously in the same location - like time has folded and different centuries are occurring at once. Focus on the same place but different time periods colliding.'
          },
          {
            role: 'user',
            content: `Create a time anomaly scenario. Generate a JSON object with:

            - title: The anomaly title (e.g., "Medieval Knights Meet Victorian Carriages", "Gladiators vs Tourist Crowds")
            - location: The specific place (e.g., "London Bridge", "Roman Colosseum", "Egyptian Pyramids")
            - era1: First time period (e.g., "Medieval England, 1200 AD", "Ancient Rome, 80 AD")
            - era2: Second time period (e.g., "Victorian London, 1850", "Modern Tourism, 1960s")
            - description: One simple sentence describing what's happening (20-30 words max)
            - imagePrompt: Detailed prompt for generating the temporal collision image

            EXAMPLE SCENARIOS:
            - London Bridge: Medieval knights crossing while Victorian carriages also crossing
            - Roman Colosseum: Gladiators fighting while 1960s tourists watching from same stands
            - Egyptian Pyramids: Ancient builders constructing while 1920s archaeologists excavating
            - Paris streets: French Revolution happening while Belle Époque cafés operating
            - Japanese temple: Samurai ceremony while Meiji-era modernization occurring
            - Great Wall of China: Ancient construction while Cultural Revolution happening
            - Stonehenge: Druid rituals while Victorian scholars studying
            - Versailles: Royal court while French Revolution storming

            DESCRIPTION REQUIREMENTS:
            - ONE simple sentence only (20-30 words max)
            - Just state what's happening, no explanations
            - Focus on the visual collision of two eras
            - Keep it minimal and direct

            IMAGE PROMPT REQUIREMENTS:
            - Both time periods must literally overlap in the SAME PHYSICAL SPACE (not side by side)
            - Like a double-exposure photo where both eras exist simultaneously
            - People/objects from different times should be walking through/interacting in the same area
            - Example: "Medieval knights walking through the same street where Victorian carriages are driving, all happening at once in the same location"
            - Rich historical details for both time periods
            - Emphasize "simultaneous", "overlapping", "same space", "temporal double-exposure"

            Return ONLY valid JSON.`
          }
        ],
        max_tokens: 600,
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
      
      console.log('Cleaned time anomaly JSON:', jsonText);
      
      let anomalyData;
      try {
        anomalyData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse time anomaly JSON');
      }

      console.log('✅ Time anomaly scenario generated successfully');

      // Generate temporal collision image
      console.log('🎨 Generating temporal collision image with Nano Banana...');
      
      const imageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: anomalyData.imagePrompt
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 60000
      });

      const imageUrl = URL.createObjectURL(imageResponse.data);
      console.log('✅ Temporal collision image generated successfully');

      return {
        title: anomalyData.title,
        location: anomalyData.location,
        era1: anomalyData.era1,
        era2: anomalyData.era2,
        description: anomalyData.description,
        image: {
          url: imageUrl,
          prompt: anomalyData.imagePrompt,
          description: `Temporal collision: ${anomalyData.title}`
        }
      };

    } catch (error) {
      console.error('Time anomaly content generation failed:', error);
      
      let errorMessage = 'Failed to generate time anomaly content';
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
    generateTimeAnomalyContent,
    isLoading,
    error
  };
};

export default useTimeAnomalyContent;
