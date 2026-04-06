import { useState, useCallback } from 'react';
import axios from 'axios';

const usePlotTwistContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePlotTwistContent = useCallback(async () => {
    const prompt = `Generate a complete plot twist story experience with title, genre, twist type, 500-word story, and image prompt.

    Create a JSON object with these fields:
    - title: A compelling 3-6 word title for the story
    - genre: The story genre (Mystery, Sci-Fi, Horror, Drama, Thriller, etc.)
    - twistType: Type of twist (Identity Reveal, Reality Inversion, Time Loop, etc.)
    - story: Exactly 500 words with a mind-blowing twist ending
    - imagePrompt: Detailed prompt for generating a dramatic scene image

    STORY REQUIREMENTS:
    - 400-600 words (give or take 100 from 500)
    - Create INTENSE, mind-bending twists like Predestination, Eternal Sunshine of the Spotless Mind, Shutter Island, The Sixth Sense
    - Build to a twist ending that will make readers go "HOLY F... I did NOT see that coming!"
    - Plant subtle clues throughout that make perfect sense AFTER the twist
    - The twist should completely reframe everything that happened before
    - Make it so shocking yet inevitable that readers will want to read it again immediately
    - Format with proper paragraph breaks for easy reading (separate each paragraph with double line breaks: \n\n)
    - Write in a way that builds curiosity, not rushed reading
    - Use SIMPLE vocabulary - avoid unnecessarily complex words, but keep the concepts INTENSE
    - Write like you're telling a gripping story to a friend, not dumbing it down
    - Keep sentences clear and easy to follow but maintain psychological depth
    - CRITICAL: Break the story into 5-6 paragraphs with clear spacing between them
    - Each paragraph should be 3-5 sentences to avoid word vomit

    Story Structure (MUST be separate paragraphs with \n\n between each):
    - Paragraph 1: Set up what seems like a normal situation (but plant the first subtle clue)
    - Paragraph 2: Build tension and introduce the main character's perspective/problem
    - Paragraph 3: Escalate the situation, add more clues that seem unrelated
    - Paragraph 4: The moment everything starts to unravel - setup for the massive twist
    - Paragraph 5: The INTENSE mind-blowing reveal that changes everything
    - Paragraph 6: Brief aftermath showing the new horrifying/amazing reality

    Types of INTENSE mind-bending twists (like the movies):
    - Time loops/paradoxes: Character is stuck in time or creates their own past (Predestination style)
    - Memory manipulation: Memories were erased, implanted, or altered (Eternal Sunshine style)
    - Identity reveals: The narrator IS the person they're hunting/avoiding (Fight Club style)
    - Reality layers: What seemed real is a dream/simulation/memory (Inception style)
    - Death reveals: Character was dead all along but didn't know (Sixth Sense style)
    - Perspective inversions: The "victim" was actually the perpetrator (Shutter Island style)
    - Causal loops: The ending creates the beginning (Predestination style)
    - Multiple personalities: Different characters are the same person (Split style)
    - Simulation breaks: Reality glitches reveal the truth (Matrix style)
    - Memory fragments: Story is told from fragmented memories in reverse (Memento style)

    IMAGE PROMPT should describe a dramatic, cinematic scene that captures the essence of the story and twist without spoiling it.

    Return ONLY a valid JSON object with all fields filled.`;

    try {
      // Generate story content
      const storyResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master storyteller who creates INTENSE, mind-bending plot twists like Predestination, Eternal Sunshine, Shutter Island, and The Sixth Sense. Use simple vocabulary but create psychologically complex, reality-bending scenarios that will leave readers speechless. Write gripping stories that build to unforgettable "I did NOT see that coming!" moments. Always return valid JSON.'
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

      const contentText = storyResponse.data.choices[0].message.content.trim();
      console.log('Raw story response:', contentText);
      
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
      
      console.log('Cleaned story JSON:', jsonText);
      
      let storyData;
      try {
        storyData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse story JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
      
      console.log('🎨 Generating plot twist visualization...');
      
      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: storyData.imagePrompt
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
      
      console.log('✅ Plot twist content generated successfully');
      
      return {
        title: storyData.title,
        genre: storyData.genre,
        twistType: storyData.twistType,
        story: storyData.story,
        image: {
          url: imageUrl,
          prompt: storyData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Plot twist content generation failed:', error);
      throw new Error('Failed to generate plot twist content');
    }
  }, []);

  return {
    generatePlotTwistContent,
    isGenerating,
    error
  };
};

export default usePlotTwistContent;
