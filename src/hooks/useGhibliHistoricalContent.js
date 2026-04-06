import { useState, useCallback } from 'react';
import axios from 'axios';

const useGhibliHistoricalContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateGhibliHistoricalContent = useCallback(async () => {
    const prompt = `Generate a Ghibli-style historical twist story with a famous historical event enhanced by magical/supernatural powers.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of the magical historical moment (20-40 words)
    - imagePrompt: Detailed prompt for generating a Ghibli-style image of the magical historical moment

    GHIBLI HISTORICAL TWISTS CONCEPT:
    - Take a real historical event and add magical/supernatural elements
    - Focus on famous historical figures who gain gentle, beautiful powers
    - The magic should feel natural and integrated, not flashy or violent
    - Maintain historical accuracy for the basic event, but add magical enhancement
    - Character-focused storytelling about how the powers affected their decisions

    DESCRIPTION REQUIREMENTS:
    - Write a short, casual description of the magical historical moment (1-2 sentences)
    - Use matter-of-fact tone as if this magical enhancement is completely normal
    - Focus on the historical figure and their gentle magical ability
    - Keep it simple and clear (20-40 words max)
    - Don't emphasize the magical parts as unusual
    - Make it sound like just another historical fact

    MAGICAL ELEMENTS STYLE:
    - Gentle, beautiful supernatural abilities (not violent or dark)
    - Powers that feel natural and organic to the character
    - Magic that enhances human potential rather than replacing it
    - Soft, warm magical effects that fit Ghibli's aesthetic
    - Focus on emotional and spiritual aspects of the powers

    IMAGE PROMPT REQUIREMENTS:
    - Keep prompts concise for API compatibility (Japanese anime style will be added automatically)
    - Focus on character and scene description, not art style (that's handled automatically)
    - Beautiful character portrait of the historical figure using their powers
    - Magical elements should look natural and integrated, not flashy
    - Warm, inviting atmosphere with soft lighting
    - Focus on the character and their magical moment
    - Historical setting should be accurate but enhanced with magical beauty
    - Soft, dreamy quality with attention to emotional expression
    - Describe the scene clearly for Japanese anime/Ghibli rendering

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
            content: 'You are a creative scenario generator who creates Ghibli-style magical historical moments. Generate short descriptions of famous historical figures with gentle magical abilities that enhance their achievements. Write as if these magical enhancements are completely normal historical facts. Focus on beautiful, natural magic that fits Studio Ghibli\'s aesthetic. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
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
      
      console.log('Cleaned Ghibli historical JSON:', jsonText);
      
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

      console.log('🎨 Generating Ghibli historical image...');

      let cleanImagePrompt = `Japanese anime style, Studio Ghibli art style, ${storyData.imagePrompt}`
        .replace(/[^\w\s,.-]/g, '') // Remove special characters except basic punctuation
        .substring(0, 250) // Limit to 250 characters to accommodate style prefix
        .trim();

      const response = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana',
        {
          prompt: cleanImagePrompt,
          negative_prompt: 'modern technology, contemporary design, realistic photography, blurry, low quality',
          aspect_ratio: '4:3'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      
      console.log('✅ Ghibli historical content generated successfully');
      
      return {
        description: storyData.description,
        image: {
          url: imageUrl,
          prompt: storyData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Ghibli historical content generation failed:', error);
      setError('Failed to generate Ghibli historical content');
      throw new Error('Failed to generate Ghibli historical content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateGhibliHistoricalContent,
    isGenerating,
    error
  };
};

export default useGhibliHistoricalContent;
