import { useState, useCallback } from 'react';
import axios from 'axios';

const useBollywoodParodyContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateBollywoodParodyContent = useCallback(async () => {
    const prompt = `Generate a Bollywood movie poster remake of an iconic English movie.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description with the Hindi movie title translation (20-40 words)
    - imagePrompt: Detailed prompt for generating a Bollywood-style movie poster

    BOLLYWOOD POSTER CONCEPT:
    - Take an iconic English movie and create a Bollywood poster version
    - Translate the English title into a creative Hindi/Hinglish version
    - Make it look like an authentic Bollywood movie poster with Indian actors
    - Use generic descriptions to avoid direct IP references (no exact character names)
    - Focus on how the movie would be marketed as a Bollywood film

    DESCRIPTION REQUIREMENTS:
    - Include the funny Hindi/Hinglish title translation prominently
    - Write a short, humorous description of the Bollywood poster (1-2 sentences)
    - Use funny, playful tone highlighting the hilarious title translation
    - Focus on the comedy of the English-to-Hindi movie transformation
    - Keep it simple and punchy (20-40 words max)
    - Make the Hindi title translation creative and amusing
    - Show how the serious English movie becomes funny Bollywood masala

    BOLLYWOOD POSTER ELEMENTS:
    - Funny Hindi/Hinglish title translations that sound amusing
    - Over-the-top Bollywood poster style with dramatic poses
    - Bright, colorful, masala movie aesthetic
    - Indian actors in typical Bollywood poster poses
    - Family drama and romance elements typical of Hindi cinema
    - Comedic cultural adaptation of the original concept
    - Traditional Bollywood movie poster layout and design

    IMAGE PROMPT REQUIREMENTS:
    - Keep prompts concise for API compatibility
    - Bollywood movie poster style: vibrant colors, dramatic poses
    - Include classic Bollywood poster elements: multiple actors, title text, colorful design
    - Rich, colorful, masala movie poster aesthetic
    - Over-the-top expressions and dramatic gestures typical of Hindi cinema posters
    - Avoid direct character likenesses - use generic descriptions
    - Focus on the funny Bollywood poster remake elements
    - Include Indian cultural elements, traditional costumes, poster layout

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate story content
      const storyResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a comedy writer who creates funny Bollywood movie poster remakes of English films. Create hilarious Hindi/Hinglish title translations and describe how English movies would look as over-the-top Bollywood posters. Focus on amusing cultural adaptations and funny title translations like "Harry Putter aur Gupt ka Kamra". Use generic descriptions to avoid IP issues. Always return valid JSON.'
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
        .replace(/"\s*"imagePrompt":/g, '","imagePrompt":') // Fix missing comma before imagePrompt
        .replace(/"\s*"story":/g, '","story":') // Fix missing comma before story
        .replace(/}\s*{/g, '},{') // Fix missing comma between objects
        .trim();
      
      console.log('Cleaned Bollywood parody JSON:', jsonText);
      
      let storyData;
      try {
        storyData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse story JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;

      console.log('🎬 Generating Bollywood parody image...');

      // Clean and enhance image prompt for Bollywood style
      let cleanImagePrompt = `Bollywood cinema poster style, Hindi movie, masala comedy, vibrant colors, over-the-top expressions, ${storyData.imagePrompt}`
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
      
      console.log('✅ Bollywood parody content generated successfully');
      
      return {
        description: storyData.description,
        image: {
          url: imageUrl,
          prompt: storyData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Bollywood parody content generation failed:', error);
      setError('Failed to generate Bollywood parody content');
      throw new Error('Failed to generate Bollywood parody content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateBollywoodParodyContent,
    isGenerating,
    error
  };
};

export default useBollywoodParodyContent;
