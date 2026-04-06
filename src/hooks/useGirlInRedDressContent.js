import { useState } from 'react';
import axios from 'axios';

const useGirlInRedDressContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateGirlInRedDressContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('👁️ Generating eye-trap scenario with ChatGPT...');

      // Generate the eye-trap scenario
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of visual psychology who creates "eye-trap" scenarios. Your job is to design images with intentional, obvious anomalies that draw the eye away from the main subject. Create scenarios where 99% of people will look at the anomaly first, then call them out on it with simple, direct text.'
          },
          {
            role: 'user',
            content: `Create an eye-trap scenario. Generate a JSON object with:

            - scenario: Brief description of the scene (e.g., "Wedding ceremony", "Temple prayer", "University lecture")
            - mainSubject: What people should theoretically look at (e.g., "the bride", "the deity", "the professor")
            - anomaly: The obvious thing that draws the eye instead (e.g., "man on phone", "blue hair", "red jacket")
            - eyeTrapText: Simple callout text (e.g., "You spotted the man on his phone rather than the bride, right?")
            - imagePrompt: Detailed prompt for generating the eye-trap image

            EXAMPLE SCENARIOS:
            - Business meeting: CEO presenting, BUT one person looking out window
            - School assembly: Principal speaking, BUT student with different colored backpack
            - Library: Everyone reading, BUT one person wearing headphones
            - Coffee shop: People working on laptops, BUT one person reading physical book
            - Park: Families having picnics, BUT one person sitting alone on bench
            - Bookstore: Customers browsing fiction, BUT one person in poetry section
            - Waiting room: People reading magazines, BUT one person looking at their hands
            - Art class: Students painting landscapes, BUT one student painting abstract

            IMAGE PROMPT REQUIREMENTS:
            - Main subject should dominate the CENTER of the frame
            - Anomaly should be PERIPHERAL/background element, not center focus
            - Composition should lead eyes to main subject, but anomaly pulls attention away
            - Make the anomaly natural but noticeable (like a black spot on white paper)
            - Trust human psychology - we notice peripheral differences despite central focus

            EYE-TRAP TEXT REQUIREMENTS:
            - Simple and direct
            - "You [action] the [anomaly] rather than [main subject], right?"
            - No psychology explanations
            - Just make them aware of where they looked

            Return ONLY valid JSON.`
          }
        ],
        max_tokens: 400,
        temperature: 0.9
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
      
      console.log('Cleaned eye-trap JSON:', jsonText);
      
      let scenarioData;
      try {
        scenarioData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse eye-trap scenario JSON');
      }

      console.log('✅ Eye-trap scenario generated successfully');

      // Generate strategic eye-trap image
      console.log('🎨 Generating strategic eye-trap image with Nano Banana...');
      
      // Enhance the image prompt for Ghibli-style animated visuals with proper composition
      const enhancedPrompt = `${scenarioData.imagePrompt}. Studio Ghibli animation style, soft watercolor aesthetic, gentle lighting, animated characters. IMPORTANT: Main subject should dominate the CENTER of frame, anomaly should be peripheral/background element. Composition leads eyes to center but peripheral anomaly naturally pulls attention away.`;
      
      const imageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: enhancedPrompt
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 60000
      });

      const imageUrl = URL.createObjectURL(imageResponse.data);
      console.log('✅ Strategic eye-trap image generated successfully');

      return {
        scenario: scenarioData.scenario,
        mainSubject: scenarioData.mainSubject,
        anomaly: scenarioData.anomaly,
        eyeTrapText: scenarioData.eyeTrapText,
        image: {
          url: imageUrl,
          prompt: enhancedPrompt,
          description: `Eye-trap scenario: ${scenarioData.scenario}`
        }
      };

    } catch (error) {
      console.error('Girl in red dress content generation failed:', error);
      
      let errorMessage = 'Failed to generate eye-trap scenario';
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
    generateGirlInRedDressContent,
    isLoading,
    error
  };
};

export default useGirlInRedDressContent;
