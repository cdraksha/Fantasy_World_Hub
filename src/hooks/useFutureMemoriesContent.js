import { useState, useCallback } from 'react';
import axios from 'axios';

const useFutureMemoriesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFutureMemoriesContent = useCallback(async () => {
    const prompt = `Generate a complete Future Memories experience with title, temporal type, theme, memory fragments, and image prompt.

    Create a JSON object with these fields:
    - story: A complete 400-600 word narrative story with proper plot structure
    - imagePrompt: Detailed prompt for generating a scene from the story

    FUTURE MEMORIES CONCEPT:
    - Consciousness accessing memories of events that will occur in the future
    - These events have "already happened" in the timeline but haven't been lived yet
    - No paradoxes - these are consistent memories from the temporal fabric
    - Focus on emotional resonance, déjà vu, and nonlinear time experience

    STORY REQUIREMENTS:
    - Write a complete narrative story with proper plot structure (400-600 words)
    - Use 3rd person perspective with a named protagonist
    - Create a mind-bending story where character accesses memories from their future self
    - NOT premonition or seeing the future - they're remembering events that haven't happened yet
    - Use simple vocabulary but maintain mind-bending concepts
    - Include specific details like dates, locations, conversations that prove it's future memory
    - Build to a shocking realization that what they "remembered" actually happens later

    Story Structure:
    - Setup: Character in normal situation experiences vivid "memory" of future event
    - Development: Character investigates, finds evidence that contradicts the memory (dates, people, etc.)
    - Escalation: More impossible memories surface, character becomes confused about reality
    - Climax: Character realizes they're accessing future memories, not past ones
    - Resolution: The "remembered" events actually occur, proving the temporal connection


    WRITING STYLE:
    - Write like a proper story with plot, characters, dialogue, and narrative flow
    - Use simple, clear language that anyone can follow
    - Focus on specific, concrete details (dates, times, locations, exact conversations)
    - Build suspense through character's growing confusion and realization
    - Include realistic dialogue and character reactions
    - Show character's logical attempts to understand what's happening
    - Make the temporal twist feel shocking but inevitable
    - NO poetry, NO fragments - write complete narrative prose
    - Include specific evidence that proves it's future memory (newspaper dates, etc.)
    - End with the mind-blowing realization when future events actually occur
    - CRITICAL: Break the story into 5-6 short paragraphs with clear spacing between them
    - Each paragraph should be 3-5 sentences max to avoid word vomit
    - Format with proper paragraph breaks for easy reading (separate each paragraph with double line breaks: \n\n)

    IMAGE PROMPT should describe an ethereal, dreamlike scene that captures the essence of accessing future memories - soft lighting, temporal echoes, nostalgic atmosphere.

    CRITICAL: Return ONLY a valid JSON object with proper comma separation between fields. 
    
    STORY FORMATTING EXAMPLE:
    {"story": "Paragraph 1 text here.\n\nParagraph 2 text here.\n\nParagraph 3 text here.\n\nParagraph 4 text here.\n\nParagraph 5 text here.", "imagePrompt": "Your image prompt here"}
    
    MUST use \\n\\n between each paragraph for proper spacing. Ensure there is a comma between ALL fields. Return ONLY valid JSON, no other text.`;

    try {
      // Generate memory content
      const memoryResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master storyteller who creates mind-bending Future Memories stories. Write complete narrative stories with named characters, proper plot structure, dialogue, and realistic details. The protagonist accesses memories from their future self - NOT premonition, but actual memories of events that haven\'t happened yet. Include specific evidence like dates, conversations, locations that prove it\'s future memory. Build to shocking realization when the "remembered" events actually occur later. Use simple language, realistic dialogue, and concrete details. NO poetry or fragments - write proper story prose. Always return valid JSON.'
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

      const contentText = memoryResponse.data.choices[0].message.content.trim();
      console.log('Raw memory response:', contentText);
      
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
      
      // Clean up JSON and fix common formatting issues
      jsonText = jsonText
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/"\s*"imagePrompt":/g, '","imagePrompt":') // Fix missing comma before imagePrompt
        .replace(/"\s*"story":/g, '","story":') // Fix missing comma before story
        .replace(/}\s*{/g, '},{') // Fix missing comma between objects
        .trim();
      
      console.log('Cleaned memory JSON:', jsonText);
      
      let memoryData;
      try {
        memoryData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse memory JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
      
      console.log('🌌 Generating future memory visualization...');
      
      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: memoryData.imagePrompt
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
      
      console.log('✅ Future memories content generated successfully');
      
      return {
        story: memoryData.story,
        image: {
          url: imageUrl,
          prompt: memoryData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Future memories content generation failed:', error);
      throw new Error('Failed to generate future memories content');
    }
  }, []);

  return {
    generateFutureMemoriesContent,
    isGenerating,
    error
  };
};

export default useFutureMemoriesContent;
