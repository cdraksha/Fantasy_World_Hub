import { useState, useCallback } from 'react';
import axios from 'axios';

const useYogicMindContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateScenario = useCallback(async () => {
    const prompt = `Generate a mind-blowing yogic consciousness experiment scenario.

    Generate a JSON object with these fields:
    - scenario: A "What happens when..." question about yogic mind states (3-8 words)
    - concepts: The main yogic concepts involved (Samskara, Ahankara, Chitta, etc.)
    - intensity: How extreme this scenario is (Mild/Intense/Extreme/Reality-Breaking)

    Focus on IMBALANCES and EXTREMES in yogic psychology:
    
    Examples of scenarios:
    - "What happens when Samskara completely overpowers Ahankara?"
    - "What happens when Chitta becomes perfectly still?"
    - "What happens when Buddhi and Manas are in total conflict?"
    - "What happens when Ahamkara dissolves completely?"
    - "What happens when Vrittis multiply uncontrollably?"
    - "What happens when Prakriti and Purusha separate?"
    - "What happens when all Kleshas activate simultaneously?"
    - "What happens when Dharana becomes permanent?"

    Include various yogic concepts:
    - Mind components: Chitta, Manas, Buddhi, Ahankara
    - Mental patterns: Samskara, Vasana, Vritti
    - Obstacles: Kleshas (Avidya, Asmita, Raga, Dvesha, Abhinivesha)
    - States: Dharana, Dhyana, Samadhi, Kaivalya
    - Principles: Prakriti, Purusha, Gunas (Sattva, Rajas, Tamas)

    Make scenarios that would blow minds and challenge understanding of consciousness itself.

    CRITICAL: Return ONLY ONE valid JSON object. Example format:
    {"scenario": "What happens when...", "concepts": "Concept1, Concept2", "intensity": "Extreme"}

    Return ONLY ONE JSON object, no other text.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a consciousness researcher who understands deep yogic psychology. Generate mind-blowing scenarios about what happens when yogic mind components go to extremes. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 1.0
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const scenarioText = response.data.choices[0].message.content.trim();
      console.log('Raw GPT response:', scenarioText);
      
      // Handle multiple JSON objects if returned
      let jsonText = scenarioText;
      if (jsonText.includes('}{')) {
        console.log('Multiple JSON objects detected, taking first one');
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
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
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
      throw new Error('Failed to generate yogic mind scenario');
    }
  }, []);

  const generateExplanation = useCallback(async (scenario) => {
    const prompt = `Write a mind-blowing explanation for this yogic consciousness scenario:

    Scenario: ${scenario.scenario}
    Concepts: ${scenario.concepts}
    Intensity: ${scenario.intensity}

    IMPORTANT: This should make people go "WHAT THE F..." - be as mind-blowing and deep as possible while using simple English.

    Structure your response as a JSON object with these fields:
    - explanation: What happens in 3-4 simple sentences that a 10-year-old can understand but will blow their mind
    - thoughtExperiment: Simple thought experiment starting with "Imagine this..." (100-150 words max)
    - glossary: One-line simple definitions of yogic terms used, separated by " | " (e.g., "Samskara: Mental impressions | Ahankara: Ego-sense")

    Guidelines for explanation:
    - Keep it SHORT and simple
    - Use everyday language, no complex words
    - Make it mind-blowing but easy to understand
    - Focus on the most shocking part of what happens
    - Like explaining to a curious kid who loves "wow" moments

    Guidelines for thought experiment:
    - Something they can do right where they sit
    - Simple step-by-step instructions
    - Should give them a taste of the concept
    - Keep it short and clear
    - Make it slightly mind-bending when they try it

    Keep everything concise and organized - no word vomit!

    Return ONLY a valid JSON object with the three fields above.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a consciousness researcher who can explain the deepest yogic psychology in mind-blowing yet accessible ways. Create explanations that fundamentally shift how people understand their own minds.'
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

      const contentText = response.data.choices[0].message.content.trim();
      console.log('Raw explanation response:', contentText);
      
      // Handle multiple JSON objects if returned
      let jsonText = contentText;
      if (jsonText.includes('}{')) {
        console.log('Multiple JSON objects detected, taking first one');
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
      
      console.log('Cleaned explanation JSON:', jsonText);
      
      try {
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse explanation JSON');
      }
    } catch (error) {
      console.error('Explanation generation failed:', error);
      throw new Error('Failed to generate yogic explanation');
    }
  }, []);

  const generateImage = useCallback(async (scenario) => {
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    const imagePrompt = `Abstract consciousness visualization: ${scenario.scenario} representing ${scenario.concepts}, mind-bending surreal art, consciousness expansion, meditation visuals, chakras, energy fields, geometric patterns, cosmic consciousness, spiritual awakening, reality distortion, psychedelic art style, vibrant colors, ethereal atmosphere, no text, no words`;

    try {
      console.log('🎨 Generating consciousness visualization...');
      
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
      
      console.log('✅ Consciousness image generated successfully');
      return imageUrl;

    } catch (error) {
      console.error('❌ Image generation failed:', error);
      throw new Error('Failed to generate consciousness visualization');
    }
  }, []);

  return {
    generateScenario,
    generateExplanation,
    generateImage,
    isGenerating,
    error
  };
};

export default useYogicMindContent;
