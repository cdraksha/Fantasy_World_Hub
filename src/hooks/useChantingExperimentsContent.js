import { useState, useCallback } from 'react';
import axios from 'axios';

const useChantingExperimentsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateChantingExperiment = useCallback(async () => {
    const prompt = `Generate a playful chanting experiment for curious exploration.

    Create a JSON object with these fields:
    - title: A catchy name for this chanting experiment (3-6 words)
    - experiment: Step-by-step instructions for the chanting experiment (100-150 words)
    - chant: The specific sound/mantra to use (simple, accessible)
    - focus: What to pay attention to during the experiment
    - curiosityNote: A fun "what might happen" observation to spark interest

    CHANTING EXPERIMENTS CONCEPT:
    - Playful exploration of sound and vibration
    - Simple, accessible chants anyone can try
    - Focus on curiosity and discovery, not expertise
    - "What happens if..." approach
    - Get people excited to explore on their own
    - No right or wrong answers - just observations

    EXPERIMENT TYPES:
    - Visualization + chanting (see colors, paths, shapes while chanting)
    - Body awareness + sound (feel vibrations in different body parts)
    - Emotion + chanting (notice how feelings change with different sounds)
    - Space perception + sound (how chanting affects sense of room/environment)
    - Memory + vibration (recall experiences while chanting)
    - Breathing + sound combinations
    - Simple mantras with observation focus

    SIMPLE CHANTS TO USE:
    - OM (AUM) - the classic
    - AH, EE, OO, MM - vowel sounds
    - SO HUM (I am) - with breathing
    - Simple humming at different pitches
    - AH-OO-MM breakdown
    - Single syllable sounds like "LAM", "VAM", "RAM"
    - Nature sounds like "SHHH" (wind), "MMMM" (earth)

    EXPERIMENT EXAMPLES:
    - Close eyes, imagine a path, chant OM - what happens to the path?
    - Think of blue color, hum at different pitches - does the color change?
    - Focus on your chest, chant AH - where do you feel vibrations?
    - Sit quietly, chant SO HUM with breath - does the room feel different?
    - Remember something happy, hum while holding the memory - what changes?
    - Visualize light in your head, chant MM - does the light shift?

    INSTRUCTION STYLE:
    - Curious and playful tone
    - "Try this and see what happens"
    - No pressure or expectations
    - Encourage personal discovery
    - Use "you might notice" instead of "you will feel"
    - Make it sound fun and intriguing
    - Keep instructions simple and clear
    - 3-5 steps maximum

    FOCUS AREAS:
    - Physical sensations (vibrations, tingling, warmth)
    - Visual changes (colors, shapes, brightness)
    - Emotional shifts (calm, energy, joy)
    - Spatial awareness (room size, boundaries)
    - Mental clarity (thoughts, focus, awareness)

    Return ONLY a valid JSON object with all fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate experiment content
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a curious explorer of sound and vibration who creates playful chanting experiments. Focus on accessibility, curiosity, and discovery rather than formal spiritual practice. Make experiments fun and intriguing for anyone to try. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
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
      
      console.log('Cleaned chanting experiment JSON:', jsonText);
      
      let experimentData;
      try {
        experimentData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse experiment JSON');
      }

      console.log('✅ Chanting experiment generated successfully');
      
      return {
        title: experimentData.title,
        experiment: experimentData.experiment,
        chant: experimentData.chant,
        focus: experimentData.focus,
        curiosityNote: experimentData.curiosityNote
      };

    } catch (error) {
      console.error('Chanting experiment generation failed:', error);
      setError('Failed to generate chanting experiment');
      throw new Error('Failed to generate chanting experiment');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateChantingExperiment,
    isGenerating,
    error
  };
};

export default useChantingExperimentsContent;
