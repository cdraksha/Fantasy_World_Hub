import { useState, useCallback } from 'react';
import axios from 'axios';

const useHumanHiveMindContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateHumanHiveMindContent = useCallback(async () => {
    const prompt = `Generate a fantasy story about human collective consciousness and hive mind scenarios.

    Create a JSON object with these fields:
    - story: A detailed narrative about collective human consciousness (200-300 words)
    - imagePrompt: Detailed prompt for generating a visual representation of this hive mind scenario

    HUMAN HIVE MIND CONCEPT:
    - Collective consciousness where billions of minds are connected
    - Shared thoughts, emotions, and experiences across humanity
    - The beauty and terror of unified human consciousness
    - Individual identity vs collective unity
    - Telepathic networks spanning the globe
    - Inspired by the concept from Pluribus (2025)

    STORY CATEGORIES:

    COLLECTIVE AWAKENING SCENARIOS:
    - The morning when 8 billion people wake up with the same thought
    - Global synchronization event where all minds connect simultaneously
    - The first day of mandatory neural linking for all humans
    - Spontaneous telepathic emergence across the species
    - The moment individual privacy ceases to exist

    SHARED EMOTIONAL EXPERIENCES:
    - Billions feeling one person's joy simultaneously
    - Global grief when the collective loses someone
    - Shared anxiety rippling through the connected minds
    - Collective euphoria during humanity's greatest achievement
    - The terror of shared nightmares across all sleeping minds

    COLLECTIVE PROBLEM SOLVING:
    - Humanity thinking as one to solve climate change
    - 8 billion minds working together on a mathematical proof
    - Collective decision-making for species survival
    - Global brainstorming sessions with instant idea sharing
    - The hive mind designing the perfect society

    INDIVIDUAL VS COLLECTIVE CONFLICTS:
    - The last person resisting neural connection
    - Individual thoughts trying to break free from the collective
    - Rebels attempting to disconnect from the hive mind
    - The struggle to maintain personal identity within unity
    - Underground movements of "disconnected" humans

    DAILY LIFE IN THE HIVE MIND:
    - Morning synchronization rituals for billions
    - Collective commuting where everyone knows the optimal routes
    - Shared meals where taste is experienced by all
    - Global conversations happening in real-time
    - The end of loneliness but also the end of solitude

    COLLECTIVE MEMORY AND KNOWLEDGE:
    - Accessing the memories of anyone who ever lived
    - Shared skill libraries where expertise is instantly available
    - Collective learning where one person's education benefits all
    - The global library of human experience
    - Inherited trauma and joy from previous generations

    HIVE MIND MALFUNCTIONS:
    - Thought storms when the collective disagrees
    - Viral ideas spreading uncontrollably through minds
    - System crashes affecting billions of connected brains
    - Collective amnesia events wiping shared memories
    - The chaos when the hive mind fragments

    STORY REQUIREMENTS:
    - Focus on the human experience of collective consciousness
    - Explore both the benefits and dangers of unified minds
    - Include specific details about how the hive mind functions
    - Show the emotional and psychological impact on individuals
    - Describe the technology or phenomenon enabling the connection
    - Make it feel both wondrous and terrifying
    - Include sensory details of what shared consciousness feels like
    - Show how society and relationships change with collective minds

    IMAGE PROMPT REQUIREMENTS:
    - Visual representation of connected human consciousness
    - Neural networks, brain connections, or telepathic links
    - Ethereal, sci-fi visualization of collective minds
    - Glowing connections between people or brains
    - Futuristic cityscape with connected inhabitants
    - Abstract representation of shared thoughts and emotions
    - Beautiful but slightly unsettling atmosphere
    - Professional sci-fi concept art quality

    EXAMPLE SCENARIOS:
    - A baker suddenly feeling the hunger of 8 billion people
    - The collective deciding humanity's next evolutionary step
    - Children born into the hive mind who've never known individual thought
    - The moment when the last disconnected human joins the collective
    - A love story between two minds within the greater consciousness

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate hive mind story
      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master science fiction writer who creates compelling stories about collective human consciousness and hive minds. Generate thought-provoking narratives that explore the philosophical and emotional implications of unified human minds. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
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
      
      console.log('Cleaned hive mind JSON:', jsonText);
      
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

      console.log('🌐 Generating hive mind image...');

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
      
      console.log('✅ Human hive mind content generated successfully');
      
      return {
        story: scenarioData.story,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Human hive mind content generation failed:', error);
      setError('Failed to generate human hive mind content');
      throw new Error('Failed to generate human hive mind content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateHumanHiveMindContent,
    isGenerating,
    error
  };
};

export default useHumanHiveMindContent;
