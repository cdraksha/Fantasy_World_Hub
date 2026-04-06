import { useState, useCallback } from 'react';
import axios from 'axios';

const useAlternateRealityContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateConcept = useCallback(async () => {
    const conceptPrompt = `Generate a completely original "alternate reality" concept where a REAL CITY has ONE specific realistic change.

    Generate a JSON object with these fields:
    - heading: A catchy 2-4 word title for this city modification
    - description: A single sentence starting with "Imagine if..." describing this specific city change in vivid detail
    - visualPrompt: A detailed description for image generation that clearly describes this modified real city

    IMPORTANT: Start with a REAL CITY and change ONE specific element. Keep it realistic and grounded, not fantasy.

    Focus on real cities with specific modifications:
    - Transportation changes: Roads → canals, streets → bridges, cars → boats
    - Architecture changes: Horizontal → vertical, scattered → connected, low → high
    - Infrastructure changes: Underground → elevated, separate → unified, small → massive
    - Urban planning changes: Grid → circular, spread out → concentrated, land → water

    Examples of what I want:
    - heading: "Canal Manhattan", description: "Imagine if New York City had Venice-style canals instead of streets, with gondolas navigating between Wall Street skyscrapers."
    - heading: "Vertical Dharavi", description: "Imagine if Mumbai's Dharavi slum was rebuilt as a single massive 200-story residential tower reaching into the clouds."
    - heading: "Bridge Tokyo", description: "Imagine if Tokyo had elevated bridges connecting every building, creating a second city level above the streets."
    - heading: "Underground London", description: "Imagine if London was built entirely underground, with the Thames flowing through illuminated caverns beneath the earth."

    Use real cities: New York, London, Tokyo, Mumbai, Delhi, Bangalore, Paris, Dubai, Singapore, Los Angeles, Chicago, Berlin, etc.

    Create realistic urban modifications that are visually striking but believable.

    CRITICAL: Return ONLY a valid JSON object with no markdown formatting, no explanations, no additional text. Ensure all strings are properly quoted and escaped. Example format:
    {"heading": "Example Title", "description": "Imagine if example description.", "visualPrompt": "Example visual prompt"}

    Return ONLY the JSON object, no other text.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an urban planning expert who creates realistic city modifications. Take REAL cities and change ONE specific element (like roads to canals). Keep it grounded and believable, not fantasy. Focus on actual cities with practical alterations. Always return valid JSON.'
          },
          {
            role: 'user',
            content: conceptPrompt
          }
        ],
        max_tokens: 400,
        temperature: 1.1
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const conceptText = response.data.choices[0].message.content.trim();
      console.log('Raw GPT response:', conceptText);
      
      // Try to extract JSON if it's wrapped in markdown or other text
      let jsonText = conceptText;
      if (conceptText.includes('```json')) {
        const jsonMatch = conceptText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      } else if (conceptText.includes('```')) {
        const jsonMatch = conceptText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
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
        throw new Error('Failed to parse concept JSON');
      }
    } catch (error) {
      console.error('Concept generation failed:', error);
      throw new Error('Failed to generate alternate reality concept');
    }
  }, []);

  const generateImage = useCallback(async (concept) => {
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    const imagePrompt = `Photorealistic scene: ${concept.visualPrompt}, detailed and stunning alternate reality, impossible but believable world, cinematic composition, dramatic lighting, crystal clear details, no text, no words, no watermarks`;

    try {
      console.log('🎨 Generating alternate reality image...');
      
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
      
      console.log('✅ Alternate reality image generated successfully');
      return imageUrl;

    } catch (error) {
      console.error('❌ Image generation failed:', error);
      throw new Error('Failed to generate alternate reality image');
    }
  }, []);

  const generateAlternateContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🧠 Generating alternate reality concept...');
      const concept = await generateConcept();
      
      console.log('🎨 Generating alternate reality image...');
      const imageUrl = await generateImage(concept);

      const content = {
        heading: concept.heading,
        description: concept.description,
        visualPrompt: concept.visualPrompt,
        imageUrl: imageUrl
      };

      console.log('✅ Alternate reality content generated successfully');
      setIsGenerating(false);
      return content;

    } catch (error) {
      console.error('❌ Content generation failed:', error);
      setError(error.message);
      setIsGenerating(false);
      throw error;
    }
  }, [generateConcept, generateImage]);

  return {
    generateAlternateContent,
    isGenerating,
    error
  };
};

export default useAlternateRealityContent;
