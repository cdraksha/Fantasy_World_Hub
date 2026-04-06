import { useState, useCallback } from 'react';
import axios from 'axios';

const useAncientCitiesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateAncientCitiesContent = useCallback(async () => {
    const prompt = `Generate a random ancient city at a random historical time period.

    Create a JSON object with these fields:
    - description: A short fascinating fact about what was happening in the city at that time (20-40 words)
    - imagePrompt: Detailed prompt for generating a historically accurate image of the city

    ANCIENT CITIES CONCEPT:
    - Pick any city in the world - be truly random and diverse (not just Rome/Greece)
    - Include cities from ALL continents: Asia, Africa, Americas, Europe, Oceania
    - Pick any random year from 3000BC to 2024 - avoid clustering around famous periods
    - Show how the city looked at that specific time period
    - Include one fascinating historical fact about what was happening then
    - Focus on historically accurate details and authentic period architecture
    - AVOID repeating the same cities or time periods - be genuinely diverse

    DESCRIPTION REQUIREMENTS:
    - Include the city name and year prominently
    - Write one fascinating historical fact about the city at that time (1-2 sentences)
    - Use engaging, educational tone highlighting interesting historical details
    - Focus on what made that city special or significant at that moment
    - Keep it concise and informative (20-40 words max)
    - Make it genuinely interesting and educational
    - Include specific historical context that most people don't know

    IMAGE PROMPT REQUIREMENTS:
    - Keep prompts concise for API compatibility
    - Historical accuracy: authentic architecture, clothing, technology of the period
    - Include specific time period and city name for context
    - Detailed description of how the city looked at that exact time
    - Period-appropriate buildings, streets, people, and atmosphere
    - Avoid anachronisms - only show what existed at that time
    - Focus on the authentic historical cityscape and daily life

    DIVERSITY EXAMPLES (DO NOT COPY - CREATE ORIGINAL):
    - Tenochtitlan, 1450 AD: Floating gardens fed 200,000 Aztecs
    - Baghdad, 850 AD: House of Wisdom was world's largest library
    - Angkor, 1200 AD: Hydraulic city supported 1 million people
    - Timbuktu, 1400 AD: University had 25,000 students from across Africa
    - Cusco, 1500 AD: Inca roads connected 40,000km across mountains
    - Kyoto, 1000 AD: Heian court perfected aesthetic refinement
    - Cairo, 1300 AD: Largest city in the world outside China
    - Cahokia, 1100 AD: Native American city larger than London

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate content
      const storyResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a historian who creates fascinating glimpses into cities worldwide at random time periods. Generate truly diverse city-year combinations from ALL continents and time periods (3000BC to 2024). Avoid defaulting to Rome/Greece - explore cities from Asia, Africa, Americas, Oceania, and different eras. Be genuinely random and educational. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const contentText = storyResponse.data.choices[0].message.content.trim();
      
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
      
      // Clean up JSON and fix common formatting issues
      jsonText = jsonText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/"\s*"imagePrompt":/g, '","imagePrompt":')
        .replace(/"\s*"description":/g, '","description":')
        .replace(/}\s*{/g, '},{')
        .trim();
      
      console.log('Cleaned ancient cities JSON:', jsonText);
      
      let cityData;
      try {
        cityData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse city JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;

      console.log('🏛️ Generating ancient city image...');

      // Clean and enhance image prompt for historical accuracy
      let cleanImagePrompt = `Historical illustration, period accurate, ${cityData.imagePrompt}`
        .replace(/[^\w\s,.-]/g, '') // Remove special characters except basic punctuation
        .substring(0, 250) // Limit to 250 characters to accommodate style prefix
        .trim();

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: cleanImagePrompt
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
      
      console.log('✅ Ancient cities content generated successfully');
      
      return {
        description: cityData.description,
        image: {
          url: imageUrl,
          prompt: cityData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Ancient cities content generation failed:', error);
      setError('Failed to generate ancient cities content');
      throw new Error('Failed to generate ancient cities content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateAncientCitiesContent,
    isGenerating,
    error
  };
};

export default useAncientCitiesContent;
