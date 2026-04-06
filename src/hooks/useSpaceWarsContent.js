import { useState } from 'react';
import axios from 'axios';

const useSpaceWarsContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSpaceWarsContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Generating space war story with ChatGPT...');

      // Generate the story content
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master military science fiction writer. Create epic, detailed 500-word stories about space battles, sieges, and galactic campaigns. Focus on military strategy, heroic moments, and the grand scale of interstellar warfare. Write in an engaging, dramatic style that captures the epic nature of space conflicts.'
          },
          {
            role: 'user',
            content: `Generate an epic space war story. Create a JSON object with:

            - title: Battle/siege name (e.g., "The Siege of Europa", "Battle of the Titan Nebula")
            - era: Year/time period (e.g., "3525 CE", "Year 4891 of the Galactic Empire")
            - location: Where the battle takes place (e.g., "Europa Colony", "Proxima Centauri System")
            - story: Exactly 500 words describing the epic space battle with military details, strategy, heroic moments, and dramatic action
            - imagePrompt: Detailed prompt for generating an epic space battle image

            EXAMPLES OF BATTLES:
            - The Siege of Europa by Martian forces
            - Battle for the mining colonies of Titan
            - The Great Fleet engagement at Alpha Centauri
            - Siege of the orbital stations around Jupiter
            - The defense of Earth's moon bases
            - Battle in the asteroid belt mining territories
            - The assault on the space elevators of Mars

            STORY REQUIREMENTS:
            - Exactly 500 words
            - Include military commanders and their strategies
            - Describe ship movements, weapons, and tactics
            - Show the scale and epicness of space warfare
            - Include heroic moments and dramatic tension
            - End with a clear outcome

            IMAGE PROMPT: Epic space battle scene with detailed ships, explosions, planets/moons in background, dramatic lighting, cinematic composition

            Return ONLY valid JSON.`
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
      
      console.log('Cleaned story JSON:', jsonText);
      
      let storyData;
      try {
        storyData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse story JSON');
      }

      console.log('✅ Space war story generated successfully');

      // Generate image
      console.log('🎨 Generating space battle image with Nano Banana...');
      
      const imageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: storyData.imagePrompt
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
      console.log('✅ Space battle image generated successfully');

      return {
        title: storyData.title,
        era: storyData.era,
        location: storyData.location,
        story: storyData.story,
        image: {
          url: imageUrl,
          prompt: storyData.imagePrompt,
          description: `Epic space battle: ${storyData.title}`
        }
      };

    } catch (error) {
      console.error('Space wars content generation failed:', error);
      
      let errorMessage = 'Failed to generate space war content';
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
    generateSpaceWarsContent,
    isLoading,
    error
  };
};

export default useSpaceWarsContent;
