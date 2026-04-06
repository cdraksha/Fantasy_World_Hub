import { useState, useCallback } from 'react';
import axios from 'axios';

const useDnDAdventureContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDnDAdventureContent = useCallback(async (sceneNumber = 1, previousChoices = [], adventureContext = '') => {
    const prompt = `Generate a D&D adventure scene for an interactive text-based experience.

    Scene Number: ${sceneNumber} of 15
    Previous Choices: ${previousChoices.join(' → ') || 'Starting adventure'}
    Adventure Context: ${adventureContext || 'New adventure beginning'}

    Create a JSON object with these fields:
    - sceneText: The main story text for this scene (100-200 words)
    - diceType: Type of dice to roll (d4, d6, d8, d10, d12, d20)
    - dicePrompt: What the dice roll represents (e.g., "Roll a d6 to choose your action:")
    - options: Array of 4-20 options based on dice type, each with brief description

    D&D ADVENTURE CONCEPT:
    - Create engaging fantasy adventure scenes with meaningful choices
    - Each scene should feel connected to previous choices and build the story
    - Include classic D&D elements: combat, exploration, social encounters, magic
    - Make dice rolls feel meaningful and impactful to the story
    - Progress toward an epic conclusion by scene 15

    SCENE TEXT REQUIREMENTS:
    - Write immersive fantasy prose (100-200 words)
    - Build on previous choices and adventure context
    - Include vivid descriptions of settings, characters, and situations
    - Create tension and excitement appropriate for D&D adventures
    - End with a situation that requires a dice roll decision
    - Use second person ("you") to make it personal and engaging

    DICE AND OPTIONS REQUIREMENTS:
    - Choose appropriate dice type for the situation:
      * d4: Simple binary-ish choices (4 options)
      * d6: Standard action choices (6 options)  
      * d8: Exploration or skill variety (8 options)
      * d10: Complex situations (10 options)
      * d12: Social encounters or detailed choices (12 options)
      * d20: Combat, skill checks, or major story moments (4 ranges: 1-5, 6-10, 11-15, 16-20)
    - Each option should be 3-8 words describing the outcome
    - Options should feel distinct and meaningful
    - For d20, use ranges that represent different success levels

    STORY PROGRESSION:
    - Scenes 1-3: Setup and introduction
    - Scenes 4-8: Rising action and complications
    - Scenes 9-12: Major challenges and climax building
    - Scenes 13-15: Climax resolution and conclusion
    - Each scene should advance the overall narrative

    EXAMPLE DICE OPTIONS:
    d6 options: ["Charge with sword drawn", "Sneak around the side", "Cast a spell", "Try to negotiate", "Look for another path", "Retreat and regroup"]
    d20 ranges: ["Critical failure (1-5)", "Partial failure (6-10)", "Partial success (11-15)", "Critical success (16-20)"]

    Return ONLY a valid JSON object with all fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate scene content
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a skilled D&D Dungeon Master who creates engaging interactive text adventures. Generate immersive fantasy scenes with meaningful dice-based choices that build an epic 15-scene adventure. Focus on classic D&D elements like combat, exploration, magic, and social encounters. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
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
      
      console.log('Cleaned D&D adventure JSON:', jsonText);
      
      let sceneData;
      try {
        sceneData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse scene JSON');
      }

      console.log('✅ D&D adventure scene generated successfully');
      
      return {
        sceneNumber,
        sceneText: sceneData.sceneText,
        diceType: sceneData.diceType,
        dicePrompt: sceneData.dicePrompt,
        options: sceneData.options,
        previousChoices,
        adventureContext
      };

    } catch (error) {
      console.error('D&D adventure content generation failed:', error);
      setError('Failed to generate D&D adventure content');
      throw new Error('Failed to generate D&D adventure content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateDnDAdventureContent,
    isGenerating,
    error
  };
};

export default useDnDAdventureContent;
