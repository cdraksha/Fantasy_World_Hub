import { useState, useCallback } from 'react';
import axios from 'axios';

const useAlternateMovieEndingsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateMovieScenario = useCallback(async () => {
    const scenarioPrompt = `Create a completely original alternate movie ending scenario for a famous film.

    Generate a JSON object with these fields:
    - movieTitle: The title of a famous, well-known movie
    - originalYear: The year the movie was released
    - originalEnding: A brief 1-sentence summary of how the movie actually ended
    - alternateEndingConcept: A 1-sentence summary of your alternate ending concept
    - visualScene: A specific visual scene that represents this alternate ending
    - emotionalTone: The emotional tone of this alternate ending (e.g., "melancholic", "hopeful", "bittersweet", "shocking")

    Choose from famous movies like: Titanic, The Matrix, Star Wars, Avengers Endgame, Romeo and Juliet, The Lion King, Casablanca, The Shawshank Redemption, Forrest Gump, The Dark Knight, etc.

    Make the alternate ending thoughtful and emotionally complex - not just "happy ending" vs "sad ending" but something that explores different themes or consequences.

    Examples of good alternate endings:
    - "What if Neo took the blue pill and stayed in the Matrix, but kept having déjà vu?"
    - "What if Jack survived the Titanic but he and Rose realized they were incompatible in real life?"
    - "What if Thanos won but created a genuinely peaceful utopia?"

    Return ONLY the JSON object, no other text.`;

    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a creative film analyst specializing in alternate movie endings. Generate thoughtful, emotionally complex alternate endings to famous films. Always return valid JSON.'
            },
            {
              role: 'user',
              content: scenarioPrompt
            }
          ],
          max_tokens: 400,
          temperature: 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`Scenario generation failed: ${response.status}`);
      }

      const data = await response.json();
      const scenarioText = data.choices[0].message.content;
      return JSON.parse(scenarioText);
    } catch (error) {
      console.error('Movie scenario generation failed:', error);
      throw new Error('Failed to generate alternate movie ending scenario');
    }
  }, []);

  const generateAlternateEnding = useCallback(async (scenario) => {
    const prompt = `Write a compelling 150-word narrative exploring this alternate movie ending:

    Movie: ${scenario.movieTitle} (${scenario.originalYear})
    Original ending: ${scenario.originalEnding}
    Alternate concept: ${scenario.alternateEndingConcept}
    Emotional tone: ${scenario.emotionalTone}

    Write this as a thoughtful exploration of "what if" - showing the consequences, emotions, and deeper implications of this alternate ending. Focus on:

    - The immediate aftermath of this different choice/outcome
    - How the characters would feel and react differently
    - The broader implications for their lives/world
    - Why this ending might be more interesting, tragic, or meaningful than the original
    - Specific details that make this alternate reality feel real and lived-in

    Write in an engaging, slightly melancholic tone that captures both the nostalgia for the original film and the intrigue of this alternate path. Make the reader feel the weight of this different choice.

    Do NOT just retell the original movie - focus entirely on this new ending and its consequences.`;

    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a master storyteller specializing in alternate movie endings. Create emotionally resonant narratives that explore the deeper implications of different choices in beloved films.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`Alternate ending generation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Alternate ending generation failed:', error);
      throw new Error('Failed to generate alternate ending narrative');
    }
  }, []);

  const generateImage = useCallback(async (scenario) => {
    const imagePrompt = `Cinematic scene from alternate movie ending: ${scenario.visualScene}, ${scenario.movieTitle} alternate ending, ${scenario.emotionalTone} atmosphere, film still aesthetic, dramatic lighting, movie poster style, detailed character expressions, high quality cinematography`;

    try {
      console.log('🎬 Generating alternate movie ending image...');
      
      const response = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: imagePrompt,
          negative_prompt: 'blurry, low quality, text, watermark, logo, amateur photography, poor lighting',
          aspect_ratio: '4:3'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
          },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      
      return {
        url: imageUrl,
        prompt: imagePrompt,
        description: `An alternate ending scene from ${scenario.movieTitle}: ${scenario.visualScene}`
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error('Failed to generate movie scene image');
    }
  }, []);

  const generateAlternateMovieEndingContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate movie scenario
      console.log('🎭 Generating alternate movie ending scenario...');
      const scenario = await generateMovieScenario();
      
      console.log('📝 Writing alternate ending narrative...');
      const alternateEnding = await generateAlternateEnding(scenario);
      
      console.log('🎬 Generating movie scene image...');
      const image = await generateImage(scenario);

      const content = {
        movieTitle: scenario.movieTitle,
        originalYear: scenario.originalYear,
        alternateEnding: alternateEnding,
        image: image,
        scenario: scenario
      };

      console.log('✅ Alternate movie ending content generated successfully');
      setIsGenerating(false);
      return content;

    } catch (error) {
      console.error('❌ Content generation failed:', error);
      setError(error.message);
      setIsGenerating(false);
      throw error;
    }
  }, [generateMovieScenario, generateAlternateEnding, generateImage]);

  return {
    generateAlternateMovieEndingContent,
    isGenerating,
    error
  };
};

export default useAlternateMovieEndingsContent;
