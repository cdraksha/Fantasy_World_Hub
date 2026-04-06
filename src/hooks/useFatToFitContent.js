import { useState } from 'react';
import axios from 'axios';

const useFatToFitContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateFatToFitContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('💪 Generating fat to fit content with ChatGPT...');

      // Generate the transformation scenario
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of extreme transformation stories who creates inspiring but completely unrealistic fitness journeys. Focus on impossible methods that somehow create incredible results. Make it motivational but absurd - like losing 200lbs by swimming across oceans daily or getting ripped by wrestling bears. The end result should always be someone incredibly fit and attractive.'
          },
          {
            role: 'user',
            content: `Create an extreme fat to fit transformation story. Generate a JSON object with:

            - title: Transformation title (e.g., "The Everest Climber", "Ocean Swimmer Transformation")
            - method: Brief description of the impossible method (e.g., "Daily Mount Everest climbs", "Wrestling Siberian bears")
            - timeframe: Unrealistic timeframe (e.g., "3 months", "6 weeks", "2 months")
            - story: The complete transformation story (300-400 words) including:
              * Starting condition (overweight, out of shape)
              * The impossible method they used
              * The extreme dedication required
              * The incredible results achieved
              * How amazing they look now
            - beforeImagePrompt: Detailed prompt for generating "before" image of overweight person
            - afterImagePrompt: Detailed prompt for generating "after" image of incredibly fit person

            FAT TO FIT CONCEPT:
            - Extreme transformation stories that sound inspiring but are completely unrealistic
            - Impossible methods that somehow work
            - Motivational but absurd approaches
            - End result is always someone incredibly fit and attractive
            - Fantasy fitness journeys that defy physics and reality

            IMPOSSIBLE METHOD IDEAS:
            - Swimming across Pacific Ocean daily for cardio
            - Climbing Mount Everest every single day
            - Wrestling bears in Siberian wilderness
            - Doing 10,000 sit-ups while skydiving
            - Carrying house on back for a year
            - Running marathons on the moon
            - Lifting cars instead of weights
            - Dancing non-stop for 6 months straight
            - Surfing tsunamis for core strength
            - Boxing with gorillas for muscle building
            - Yoga on active volcanoes
            - Swimming through lava for resistance training
            - Pulling airplanes with teeth
            - Doing pushups on moving trains
            - Meditating while hanging from helicopters

            STORY STRUCTURE:
            1. Starting point - overweight, out of shape, desperate
            2. Discovery of the impossible method
            3. Extreme dedication and commitment
            4. The absurd daily routine
            5. Incredible transformation results
            6. How amazing they look now (fit, attractive, confident)

            TRANSFORMATION STYLE:
            - Motivational and inspiring tone
            - Emphasize the extreme dedication
            - Make the method sound both impossible and appealing
            - Focus on the incredible end results
            - Mention specific physical improvements

            BEFORE IMAGE PROMPT REQUIREMENTS:
            - Overweight, out of shape person looking unhappy/tired
            - Clearly showing excess weight and poor fitness
            - Sad or frustrated expression
            - Poor posture, low confidence body language
            - Casual clothing that shows the weight
            - Realistic photography style
            - Make it relatable but not offensive

            AFTER IMAGE PROMPT REQUIREMENTS:
            - Incredibly fit and attractive person
            - Perfect physique - toned, muscular, or lean as appropriate
            - Confident pose showing off their transformation
            - Motivational poster aesthetic
            - Professional fitness photography style
            - Good lighting highlighting muscle definition
            - Athletic wear or minimal clothing to show results
            - Background suggesting the impossible method used
            - Make them look like a fitness model or magazine cover

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
      
      console.log('Cleaned fat to fit JSON:', jsonText);
      
      let scenarioData;
      try {
        scenarioData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse fat to fit JSON');
      }

      console.log('✅ Fat to fit scenario generated successfully');
      console.log('Scenario data:', scenarioData);

      // Validate that we have both image prompts
      if (!scenarioData.beforeImagePrompt || !scenarioData.afterImagePrompt) {
        console.error('Missing image prompts in scenario data. Available fields:', Object.keys(scenarioData));
        throw new Error('No image prompts generated');
      }

      // Generate before image
      console.log('😔 Generating "before" image with Nano Banana...');
      console.log('Before image prompt:', scenarioData.beforeImagePrompt);
      
      const beforeImageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: scenarioData.beforeImagePrompt,
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
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 60000
      });

      const beforeImageUrl = URL.createObjectURL(beforeImageResponse.data);
      console.log('✅ Before image generated successfully');

      // Generate after image
      console.log('💪 Generating "after" image with Nano Banana...');
      console.log('After image prompt:', scenarioData.afterImagePrompt);
      
      const afterImageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: scenarioData.afterImagePrompt,
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
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 60000
      });

      const afterImageUrl = URL.createObjectURL(afterImageResponse.data);
      console.log('✅ After image generated successfully');

      return {
        title: scenarioData.title,
        method: scenarioData.method,
        timeframe: scenarioData.timeframe,
        story: scenarioData.story,
        beforeImage: {
          url: beforeImageUrl,
          prompt: scenarioData.beforeImagePrompt,
          description: `Before transformation: ${scenarioData.title}`
        },
        afterImage: {
          url: afterImageUrl,
          prompt: scenarioData.afterImagePrompt,
          description: `After transformation: ${scenarioData.title}`
        }
      };

    } catch (error) {
      console.error('Fat to fit generation failed:', error);
      
      let errorMessage = 'Failed to generate fat to fit content';
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
    generateFatToFitContent,
    isLoading,
    error
  };
};

export default useFatToFitContent;
