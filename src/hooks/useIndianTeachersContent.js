import { useState, useCallback } from 'react';

const useIndianTeachersContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateIndianTeachersContent = useCallback(async () => {
    const prompt = `Generate a hilarious Indian teacher comedy scenario for therapeutic revenge fantasy.

    Create a JSON object with these fields:
    - scenario: Detailed comedy story showing a problematic Indian teacher getting their comeuppance through absurd supernatural intervention
    - teacherType: Brief description of the teacher archetype (e.g., "The Accent Hypocrite", "The Tuition Blackmailer")
    - imagePrompt: Detailed description for generating a classroom scene showing the comedic moment

    INDIAN TEACHER COMEDY CONCEPT:
    - Focus on universally relatable Indian teacher problems: hypocrisy, jealousy, ego, accent issues, favoritism, corruption
    - Use realistic observational comedy - NO supernatural elements, NO revenge fantasy, NO magical interventions
    - Include culturally specific references: coaching classes, reservation comments, festival favoritism, regional language ego
    - Natural storytelling flow showing teacher hypocrisy through realistic situations
    - Therapeutic healing through relatable humor and recognition of shared experiences

    TEACHER ARCHETYPES TO CHOOSE FROM:
    - The Accent Superiority Complex (mocks pronunciation while having thick accent)
    - The Coaching Class Jealousy (bitter about expensive coaching, forces tuition)
    - The Marks Obsessed Maniac (only cares about toppers, ignores average students)
    - The Bribery Specialist (expects Teacher's Day gifts, plays favorites)
    - The Regional Language Ego (discriminates based on local language knowledge)
    - The English Medium Pretender (broken English but mocks students)
    - The Uniform Police (obsessed with dress code over learning)
    - The Festival Favoritism (treats students differently based on religion)
    - The Relative Comparison Champion (constantly compares to own children)
    - The Parent Meeting Drama Queen (exaggerates problems for attention)
    - The Handwriting Hitler (deducts marks for penmanship despite correct answers)
    - The Syllabus Speedster (rushes through content without caring about understanding)

    COMEDY ELEMENTS TO INCLUDE:
    - Realistic hypocrisy exposure (teacher's own contradictions becoming obvious)
    - Observational humor about teacher behavior patterns
    - Cultural references (coaching classes, regional accents, generational gaps)
    - Situational irony and double standards
    - Relatable classroom moments that highlight teacher flaws
    - Realistic scenarios where teacher hypocrisy is naturally revealed

    VISUAL STYLE FOR IMAGE:
    - Realistic Indian classroom setting with typical elements (blackboard, wooden desks, ceiling fan)
    - Teacher in traditional Indian teacher attire
    - Students in school uniforms
    - Natural classroom atmosphere - NO supernatural or magical elements
    - Realistic expressions showing teacher hypocrisy or student reactions
    - Cultural props and details that enhance the authentic Indian school atmosphere

    EXAMPLE SCENARIOS (REALISTIC OBSERVATIONAL COMEDY):
    - Teacher mocking student's English pronunciation while having thick regional accent themselves
    - Professor insulting student's answer but praising attractive student for same response (Kenny Sebastian style)
    - Teacher bragging about their child's achievements while that child is actually struggling
    - Coaching class teacher being jealous of students who go to better institutes
    - Teacher enforcing strict rules while breaking them themselves
    - Festival favoritism where teacher treats students differently based on religion

    Return ONLY a valid JSON object with scenario, teacherType, and imagePrompt fields.`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('👩‍🏫 Generating Indian Teachers comedy scenario with Segmind GPT...');

      // Generate scenario using Segmind GPT-4
      const scenarioResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a comedy writer specializing in Indian cultural humor and observational comedy. Generate realistic, relatable scenarios about problematic teachers that every Indian student will recognize. Focus on cultural specificity, teacher hypocrisy, and situational irony - NO supernatural elements, NO revenge fantasy. Think Kenny Sebastian style observational humor. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.9
        })
      });

      if (!scenarioResponse.ok) {
        throw new Error(`Segmind GPT API error: ${scenarioResponse.status}`);
      }

      const scenarioData = await scenarioResponse.json();
      const contentText = scenarioData.choices[0].message.content.trim();
      
      let generatedContent;
      try {
        generatedContent = JSON.parse(contentText);
      } catch (parseError) {
        console.error('Failed to parse GPT response as JSON:', contentText);
        throw new Error('Invalid response format from GPT');
      }

      if (!generatedContent.scenario || !generatedContent.teacherType || !generatedContent.imagePrompt) {
        throw new Error('Missing required fields in GPT response');
      }

      console.log('🎨 Generating Indian Teachers classroom image with Nano Banana...');

      // Generate image using Segmind Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatedContent.imagePrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, text, watermark, signature, username, artist name, copyright, logo, brand name, western classroom, non-Indian setting, inappropriate content",
          width: 1024,
          height: 768,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000000),
          scheduler: "DPM++ 2M Karras"
        })
      });

      if (!imageResponse.ok) {
        throw new Error(`Segmind Nano Banana API error: ${imageResponse.status}`);
      }

      // Nano Banana returns image file directly, not JSON
      const imageBlob = await imageResponse.blob();
      console.log('✅ Indian Teachers image generated successfully');

      // Check if we got valid image response
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Created image URL:', imageUrl);

      return {
        scenario: generatedContent.scenario,
        teacherType: generatedContent.teacherType,
        image: {
          url: imageUrl,
          prompt: generatedContent.imagePrompt,
          description: `Indian Teachers - ${generatedContent.teacherType}`,
          thumbnail: null
        }
      };

    } catch (error) {
      console.error('Indian Teachers generation failed:', error);
      
      let errorMessage = 'Failed to generate Indian Teachers scenario';
      if (error.message.includes('401')) {
        errorMessage = 'API key authentication failed';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.message.includes('API error')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = `Network Error: ${error.message}`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateIndianTeachersContent,
    isGenerating,
    error
  };
};

export default useIndianTeachersContent;
