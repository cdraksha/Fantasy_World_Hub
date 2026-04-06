import { useState, useCallback } from 'react';
import axios from 'axios';

const useImpossibleCoexistenceContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateConcept = useCallback(async () => {
    const conceptPrompt = `Generate a completely original "impossible coexistence" concept where two famous landmarks from DIFFERENT continents/countries exist in the same impossible space.

    Generate a JSON object with these fields:
    - heading: A catchy 2-4 word title for this impossible combination
    - description: 1-2 sentences describing this impossible scenario in vivid, imaginative detail
    - location1: First iconic place/landmark (be very specific, e.g., "Eiffel Tower", "Great Wall of China", "Statue of Liberty")
    - location2: Second iconic place/landmark from a DIFFERENT continent (be very specific)
    - visualPrompt: A detailed, specific description for image generation that clearly describes both landmarks and how they're combined

    IMPORTANT: Avoid generic descriptions. Be extremely specific about the landmarks and their visual details. DO NOT use common combinations like pyramids with modern cities or Venice canals.

    Think of unique, unexpected combinations from these categories:
    - Asian landmarks: Great Wall of China, Angkor Wat, Taj Mahal, Mount Fuji, Forbidden City, Petronas Towers
    - European landmarks: Eiffel Tower, Big Ben, Colosseum, Neuschwanstein Castle, Sagrada Familia, Stonehenge
    - American landmarks: Statue of Liberty, Golden Gate Bridge, Mount Rushmore, Machu Picchu, Christ the Redeemer
    - African/Oceanian landmarks: Table Mountain, Uluru, Sydney Opera House, Victoria Falls, Kilimanjaro
    - Middle Eastern landmarks: Burj Khalifa, Petra, Hagia Sophia, Blue Mosque

    Create completely unexpected pairings that have never been seen before. Make each combination geographically impossible but visually stunning.

    CRITICAL: Return ONLY a valid JSON object with no markdown formatting, no explanations, no additional text. Ensure all strings are properly quoted and escaped. Example format:
    {"heading": "Example Title", "description": "Example description.", "location1": "Example Location 1", "location2": "Example Location 2", "visualPrompt": "Example visual prompt"}

    Return ONLY the JSON object, no other text.`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative genius specializing in impossible geographical combinations. Generate completely original, unexpected concepts where famous landmarks coexist in impossible ways. AVOID common combinations like pyramids, Venice, or overused landmarks. Be wildly creative and unique each time. Always return valid JSON.'
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
      throw new Error('Failed to generate impossible coexistence concept');
    }
  }, []);

  const generateImage = useCallback(async (concept) => {
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    const imagePrompt = `Photorealistic scene: ${concept.location1} seamlessly merged with ${concept.location2}, ${concept.visualPrompt}, detailed architecture, impossible geography, stunning wide shot, cinematic composition, dramatic lighting, crystal clear details, no text, no words, no watermarks`;

    try {
      console.log('🎨 Generating impossible coexistence image...');
      
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
      
      return {
        url: imageUrl,
        prompt: imagePrompt,
        description: `An impossible coexistence of ${concept.location1} and ${concept.location2}, creating a breathtaking fusion of two iconic places that could never exist together in reality.`
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error('Failed to generate impossible coexistence image');
    }
  }, []);

  const generateImpossibleContent = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate completely original concept using ChatGPT
      console.log('🧠 Generating impossible coexistence concept...');
      const concept = await generateConcept();
      
      console.log('🎨 Generating impossible image...');
      const image = await generateImage(concept);

      const content = {
        heading: concept.heading,
        description: concept.description,
        location1: concept.location1,
        location2: concept.location2,
        image: image,
        concept: concept
      };

      console.log('✅ Impossible coexistence content generated successfully');
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
    generateImpossibleContent,
    isGenerating,
    error
  };
};

export default useImpossibleCoexistenceContent;
