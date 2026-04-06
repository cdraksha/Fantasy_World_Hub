import { useState, useCallback } from 'react';
import axios from 'axios';

const useMindBendingHinduContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateScenario = useCallback(async () => {
    const prompt = `Generate a mind-bending story from Dharmic cultures (Hindu, Buddhist, Jain, or Sikh traditions) for storytelling.

    Generate a JSON object with these fields:
    - title: A simple 3-5 word title for this story
    - storyName: The actual name of the tale from Dharmic traditions
    - characters: Main characters involved (gods, demons, kings, sages, gurus, etc.)
    - concept: The mind-bending concept in simple words (time travel, multiple worlds, illusion, etc.)

    Include stories from ALL Dharmic traditions:
    - Hindu mythology and epics
    - Buddhist tales and Jataka stories
    - Jain cosmology and spiritual journeys
    - Sikh Guru stories and miraculous events

    Include ALL types of characters:
    - Gods and goddesses
    - Demons and asuras (like Ravana, Hiranyakashipu)
    - Kings and queens
    - Sages and saints
    - Gurus and teachers
    - Common people with extraordinary experiences

    Choose stories with:
    - Time travel or time tricks
    - Multiple worlds or parallel realities  
    - Reality illusions or Maya
    - Consciousness expansion
    - Mind-blowing revelations

    CRITICAL: Return ONLY ONE valid JSON object with no markdown formatting, no explanations, no additional text. Do NOT return multiple JSON objects. Pick ONE random story and return only that. Ensure all strings are properly quoted and escaped. Example format:
    {"title": "Example Title", "storyName": "Example Story Name", "characters": "Example Characters", "concept": "Example Concept"}

    Return ONLY ONE JSON object, no other text, no lists, no multiple options.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a storyteller who knows amazing stories from Hindu, Buddhist, Jain, and Sikh traditions. Pick mind-bending stories that will blow people\'s minds - include gods, demons, kings, sages, and regular people with extraordinary experiences. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 1.0
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const scenarioText = response.data.choices[0].message.content.trim();
      console.log('Raw GPT response:', scenarioText);
      
      // Try to extract JSON if it's wrapped in markdown or other text
      let jsonText = scenarioText;
      if (scenarioText.includes('```json')) {
        const jsonMatch = scenarioText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      } else if (scenarioText.includes('```')) {
        const jsonMatch = scenarioText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      }
      
      // If multiple JSON objects are returned, take only the first one
      if (jsonText.includes('}{')) {
        console.log('Multiple JSON objects detected, taking first one');
        const firstJsonMatch = jsonText.match(/^(\{[^}]*\})/);
        if (firstJsonMatch) {
          jsonText = firstJsonMatch[1];
        } else {
          // More robust extraction for complex nested objects
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
      }
      
      // Clean up common JSON issues
      jsonText = jsonText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\r/g, '') // Remove carriage returns
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
      
      console.log('Cleaned JSON text:', jsonText);
      
      try {
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse scenario JSON');
      }
    } catch (error) {
      console.error('Scenario generation failed:', error);
      throw new Error('Failed to generate Dharmic story scenario');
    }
  }, []);

  const generateStory = useCallback(async (scenario) => {
    const prompt = `Write an amazing 1000-word story from Dharmic traditions based on this scenario:

    Story: ${scenario.storyName}
    Characters: ${scenario.characters}
    Mind-bending Concept: ${scenario.concept}

    IMPORTANT: Write this story in SIMPLE ENGLISH that even a 5th grader can understand and be amazed by. Focus on the mind-blowing, reality-bending parts that will make readers go "WOW!"

    Guidelines:
    - Use simple, easy words (avoid complex vocabulary)
    - Tell the story in third person (not "you are...")
    - Stay true to the original story from Hindu/Buddhist/Jain/Sikh traditions
    - Focus on the mind-blowing parts: time travel, multiple worlds, reality tricks
    - Make it exciting and easy to follow
    - Build up to the amazing revelation that will shock readers
    - Show how the characters react with wonder and amazement
    - Include cool details about magical/divine places
    - Make the big ideas easy to understand

    Structure the story:
    - Beginning: Set up the characters and what's happening
    - Middle: The mind-bending adventure begins
    - Climax: The incredible truth is revealed
    - End: How this amazing experience changes everything

    Write it like you're telling an exciting story to a kid who loves adventure and magic. Make them say "That's impossible!" and "How cool is that!"`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an amazing storyteller who tells mind-blowing stories from Hindu, Buddhist, Jain, and Sikh traditions using simple English that kids and adults can easily understand and be amazed by.'
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

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Story generation failed:', error);
      throw new Error('Failed to generate Hindu story');
    }
  }, []);

  const generateImage = useCallback(async (scenario) => {
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    const imagePrompt = `Dharmic traditions divine art: ${scenario.storyName} featuring ${scenario.characters}, cosmic scale, divine beings, reality-bending visuals representing ${scenario.concept}, traditional Indian/Buddhist/Jain/Sikh art style mixed with cosmic/surreal elements, golden divine light, ethereal atmosphere, spiritual transcendence, detailed mythological illustration, no text, no words`;

    try {
      console.log('🎨 Generating Hindu mythology image...');
      
      const response = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: imagePrompt
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

      const imageUrl = URL.createObjectURL(response.data);
      
      console.log('✅ Hindu mythology image generated successfully');
      return imageUrl;

    } catch (error) {
      console.error('❌ Image generation failed:', error);
      throw new Error('Failed to generate Hindu mythology image');
    }
  }, []);

  return {
    generateScenario,
    generateStory,
    generateImage,
    isGenerating,
    error
  };
};

export default useMindBendingHinduContent;
