import { useState } from 'react';
import axios from 'axios';

const useAncientConversationsContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateAncientConversationContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🏛️ Generating ancient conversation with ChatGPT...');

      // Generate the conversation content
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a storyteller who captures intimate conversations from ancient civilizations. Create immersive 500-word stories where the reader is listening to someone describe a meaningful conversation they had in the ancient world. Focus on human connection, daily struggles, dreams, and the universal experiences that transcend time. Write in first person as if someone is telling you about their conversation.'
          },
          {
            role: 'user',
            content: `Generate an ancient conversation story. Create a JSON object with:

            - title: The conversation title (e.g., "A Baker's Worry in Ancient Rome", "Dreams of a Scribe in Alexandria")
            - era: Time period (e.g., "150 BCE", "Ancient Egypt, 1350 BCE", "Classical Athens, 430 BCE")
            - location: Specific place (e.g., "Roman Forum", "Library of Alexandria", "Athenian Agora")
            - conversation: Exactly 500 words where someone describes a conversation they had in the ancient world
            - imagePrompt: Detailed prompt for generating an ancient world scene

            EXAMPLES OF CONVERSATIONS:
            - A Roman baker worried about grain shortages talking to his neighbor
            - An Egyptian scribe sharing dreams with a fellow scholar in Alexandria
            - A Greek philosopher discussing life's meaning with a student
            - A Babylonian merchant concerned about trade routes
            - A Celtic druid sharing wisdom with a young apprentice
            - A Chinese scholar debating poetry with a friend

            CONVERSATION REQUIREMENTS:
            - Exactly 500 words
            - First person narrative: "I was talking to..." or "She told me about..."
            - Focus on human emotions and universal concerns
            - Include specific ancient world details (food, clothing, customs)
            - Show the timeless nature of human connection
            - End with a meaningful insight or reflection

            IMAGE PROMPT: Ancient world scene showing people in conversation, historically accurate clothing and architecture, warm lighting, detailed period elements

            Return ONLY valid JSON.`
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
      
      console.log('Cleaned conversation JSON:', jsonText);
      
      let conversationData;
      try {
        conversationData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse conversation JSON');
      }

      console.log('✅ Ancient conversation generated successfully');

      // Generate image
      console.log('🎨 Generating ancient world image with Nano Banana...');
      
      const imageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: conversationData.imagePrompt
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 60000
      });

      const imageUrl = URL.createObjectURL(imageResponse.data);
      console.log('✅ Ancient world image generated successfully');

      return {
        title: conversationData.title,
        era: conversationData.era,
        location: conversationData.location,
        conversation: conversationData.conversation,
        image: {
          url: imageUrl,
          prompt: conversationData.imagePrompt,
          description: `Ancient world scene: ${conversationData.title}`
        }
      };

    } catch (error) {
      console.error('Ancient conversations content generation failed:', error);
      
      let errorMessage = 'Failed to generate ancient conversation content';
      if (error.response?.status === 401) {
        errorMessage = 'API key authentication failed';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.response?.status) {
        errorMessage = `API Error: Status ${error.response.status}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateAncientConversationContent,
    isLoading,
    error
  };
};

export default useAncientConversationsContent;
