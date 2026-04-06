import { useState, useCallback } from 'react';
import axios from 'axios';

const useSciFiQuestionsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateSciFiQuestion = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    const questionPrompt = `Generate a thoughtful question about anything fictional, impossible, or unreal and provide an elegant scientific explanation.

    Generate a JSON object with these fields:
    - question: A sophisticated question about any fictional concept, impossible ability, or unreal phenomenon (e.g., "How do dragons breathe fire?", "How does Superman fly on Earth?", "How do I enter someone's dream?")
    - answer: An elegant, pseudo-scientific explanation in EXACTLY 100 words or less, using sophisticated but accessible made-up science

    Focus on anything fictional, impossible, or unreal from any source:
    - Mythological beings: Dragons, phoenixes, kraken, valkyries, djinn, banshees
    - Superhero abilities: Flying, super strength, telepathy, invisibility, time manipulation
    - Fantasy magic: Elemental magic, necromancy, divination, transmutation, dimensional portals
    - Sci-fi concepts: FTL travel, terraforming, consciousness transfer, parallel dimensions, time dilation
    - Impossible abilities: Dream walking, mind reading, shapeshifting, immortality, telekinesis
    - Fictional technologies: Lightsabers, teleportation devices, time machines, force fields

    Examples of the variety I want:
    - "How do dragons breathe fire?"
    - "How does Superman fly on Earth?"
    - "How do I enter someone's dream?"
    - "Why do phoenixes resurrect from ashes?"
    - "How does faster-than-light travel work?"
    - "How do wizards read minds?"
    - "What makes vampires immortal?"
    - "How do shapeshifters change form?"

    Keep explanations sophisticated but accessible. Avoid cheesy endings or overly cute explanations. Make it sound like real theoretical science.

    Return ONLY the JSON object, no other text.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a brilliant theoretical scientist who explains any fictional, impossible, or unreal phenomena using sophisticated but accessible pseudo-science. Write elegant, serious explanations that sound like real scientific theories. Cover everything from superheroes to magic to sci-fi to dreams. Avoid cheesy or cute endings. Always return valid JSON.'
          },
          {
            role: 'user',
            content: questionPrompt
          }
        ],
        max_tokens: 300,
        temperature: 1.2
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const contentText = response.data.choices[0].message.content;
      const content = JSON.parse(contentText);

      console.log('✅ Sci-fi question generated successfully');
      setIsGenerating(false);
      return content;

    } catch (error) {
      console.error('❌ Sci-fi question generation failed:', error);
      setError(error.message);
      setIsGenerating(false);
      throw new Error('Failed to generate sci-fi question');
    }
  }, []);

  return {
    generateSciFiQuestion,
    isGenerating,
    error
  };
};

export default useSciFiQuestionsContent;
