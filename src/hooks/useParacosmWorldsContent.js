import { useState, useCallback } from 'react';
import axios from 'axios';

const useParacosmWorldsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateParacosmWorldsContent = useCallback(async () => {
    const prompt = `Generate a beautiful paracosm (imaginary world) scenario that explores the psychology of personal fantasy worlds.

    Create a JSON object with these fields:
    - story: A detailed narrative about someone's paracosm world (150-250 words)
    - imagePrompt: Detailed prompt for generating a visual representation of this imaginary world

    PARACOSM CONCEPT:
    - Detailed imaginary worlds created by the mind for emotional refuge and fulfillment
    - Personal mythologies that feel completely real to the person experiencing them
    - Complex fantasy scenarios that provide what reality cannot offer
    - Beautiful psychological landscapes of human imagination and longing
    - Inspired by the concept from Atrangi Re (2021) and psychological research

    PARACOSM CATEGORIES:

    CREATIVE FULFILLMENT PARACOSMS:
    - Alternate life as a famous novelist, filmmaker, or artist
    - Musical genius composing symphonies in a grand conservatory
    - Renowned inventor creating world-changing technologies
    - Master chef running Michelin-starred restaurants worldwide
    - Celebrated architect designing impossible beautiful buildings

    ADVENTURE & HEROISM PARACOSMS:
    - Secret superhero identity saving the world
    - Time traveler fixing historical mistakes and meeting legends
    - Space explorer discovering new civilizations and planets
    - Detective genius solving impossible mysteries
    - Explorer of hidden worlds - underground cities, lost civilizations

    EMOTIONAL REFUGE PARACOSMS:
    - Perfect family life with understanding, loving parents
    - Supportive community that accepts you completely
    - Confidence world where social anxiety doesn't exist
    - Safe childhood reimagined without trauma or pain
    - Romantic paracosm with an ideal, understanding partner

    POWER & RECOGNITION PARACOSMS:
    - Benevolent ruler of a peaceful, prosperous kingdom
    - Respected professor at prestigious universities
    - Influential philanthropist changing the world for better
    - Spiritual guide helping others find meaning and peace
    - Celebrity beloved by millions for positive contributions

    MAGICAL & FANTASTICAL PARACOSMS:
    - Wizard or sorceress mastering ancient magical arts
    - Animal whisperer living harmoniously with wildlife
    - Guardian of mystical realms and magical creatures
    - Interdimensional traveler hopping between realities
    - Keeper of ancient wisdom and forgotten knowledge

    STORY REQUIREMENTS:
    - Focus on the emotional fulfillment the paracosm provides
    - Describe the specific details that make this world feel real
    - Explain what this fantasy world offers that reality doesn't
    - Show the beauty and psychological depth of the imagination
    - Make it relatable - we all have these inner worlds
    - Keep it positive and healing, not escapist in a negative way
    - Include sensory details that make the world vivid
    - Show how this paracosm helps the person emotionally

    IMAGE PROMPT REQUIREMENTS:
    - Visual representation of the paracosm world described in the story
    - Beautiful, dreamlike quality that captures the emotional essence
    - Rich detail showing the specific elements of this imaginary world
    - Warm, inviting atmosphere that shows why this world is appealing
    - Professional artistic quality with emotional depth
    - Should feel both fantastical and emotionally real
    - Capture the wish-fulfillment aspect visually
    - Show the person in their idealized role/environment

    EXAMPLE SCENARIOS:
    - A shy person's paracosm where they're a confident public speaker inspiring millions
    - An artist's fantasy world where they live in a magical studio creating masterpieces
    - A lonely person's paracosm with a perfect found family who understands them completely
    - A student's imaginary life as a renowned professor in a beautiful university
    - Someone's adventure paracosm exploring mystical forests with magical creatures

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate paracosm scenario
      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master of human psychology and imagination who creates beautiful, emotionally resonant paracosm worlds. Generate detailed imaginary worlds that provide emotional fulfillment and show the beauty of human fantasy and longing. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
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
      
      console.log('Cleaned paracosm JSON:', jsonText);
      
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

      console.log('🌈 Generating paracosm world image...');

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
      
      console.log('✅ Paracosm worlds content generated successfully');
      
      return {
        story: scenarioData.story,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Paracosm worlds content generation failed:', error);
      setError('Failed to generate paracosm worlds content');
      throw new Error('Failed to generate paracosm worlds content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateParacosmWorldsContent,
    isGenerating,
    error
  };
};

export default useParacosmWorldsContent;
