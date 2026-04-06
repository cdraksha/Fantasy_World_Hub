import { useState } from 'react';
import axios from 'axios';

const useFantasyTrapContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateFantasyTrapContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('💭 Generating fantasy trap content with ChatGPT...');

      // Generate the comeback scenario
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of comeback scenarios who creates satisfying "I should have said..." fantasy moments. Focus on realistic situations where people wish they had responded differently, then provide the perfect comeback they daydream about. Make it relatable, cathartic, and satisfying without being mean-spirited.'
          },
          {
            role: 'user',
            content: `Create a fantasy trap comeback scenario. Generate a JSON object with:

            - title: Scenario title (e.g., "The Boss Meeting Comeback", "Perfect Coffee Shop Response")
            - situation: Brief situation type (e.g., "Workplace confrontation", "Customer service encounter")
            - location: Where it happened (e.g., "Conference room", "Starbucks", "Parking lot")
            - story: The complete scenario (300-400 words) including:
              * The original awkward/frustrating situation
              * What the person actually said (or didn't say)
              * The fantasy comeback they daydream about later
              * How satisfying it would have been
            - imagePrompt: Detailed prompt for generating image of person daydreaming/lost in thought

            FANTASY TRAP CONCEPT:
            - Focus on relatable "I should have said..." moments
            - Person actively daydreaming about perfect comeback
            - Situations everyone has experienced
            - Satisfying but not cruel comebacks
            - Emphasize the daydreaming/fantasy aspect

            SCENARIO IDEAS:
            - Boss unfairly criticizing work in meeting
            - Rude customer at retail job
            - Annoying coworker taking credit
            - Parking lot argument with stranger
            - Family dinner political disagreement
            - Ex-partner saying something hurtful
            - Teacher/professor being condescending
            - Neighbor complaining about noise
            - Restaurant server being dismissive
            - Phone customer service frustration

            STORY STRUCTURE:
            1. Set up the original situation (what happened)
            2. Show what they actually said/did (awkward silence, mumbling, etc.)
            3. Transition to them later, alone, replaying it
            4. The perfect comeback they imagine
            5. How good it would have felt to say it

            COMEBACK STYLE:
            - Witty but not mean
            - Professional when appropriate
            - Clever and well-reasoned
            - Something that would actually shut down the situation
            - Satisfying without being vindictive

            IMAGE PROMPT REQUIREMENTS:
            - Person clearly daydreaming or lost in thought
            - Maybe sitting alone (coffee shop, car, home)
            - Contemplative expression, slight smile
            - Thought bubble or dreamy atmosphere
            - Show them actively fantasizing
            - Realistic, relatable setting
            - Good lighting, professional photography style

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
      
      console.log('Cleaned fantasy trap JSON:', jsonText);
      
      let scenarioData;
      try {
        scenarioData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse fantasy trap JSON');
      }

      console.log('✅ Fantasy trap scenario generated successfully');
      console.log('Scenario data:', scenarioData);

      // Validate that we have an image prompt
      if (!scenarioData.imagePrompt) {
        console.error('Missing imagePrompt in scenario data. Available fields:', Object.keys(scenarioData));
        throw new Error('No image prompt generated');
      }

      // Generate daydreaming image
      console.log('💭 Generating daydreaming image with Nano Banana...');
      console.log('Image prompt:', scenarioData.imagePrompt);
      
      const imageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: scenarioData.imagePrompt,
        samples: 1,
        scheduler: "DPM++ 2M",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
        img_width: 1024,
        img_height: 1024,
        base64: false
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 60000
      });

      const imageUrl = URL.createObjectURL(imageResponse.data);
      console.log('✅ Daydreaming image generated successfully');

      return {
        title: scenarioData.title,
        situation: scenarioData.situation,
        location: scenarioData.location,
        story: scenarioData.story,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt,
          description: `Daydreaming about: ${scenarioData.title}`
        }
      };

    } catch (error) {
      console.error('Fantasy trap generation failed:', error);
      
      let errorMessage = 'Failed to generate fantasy trap content';
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
    generateFantasyTrapContent,
    isLoading,
    error
  };
};

export default useFantasyTrapContent;
