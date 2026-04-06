import { useState, useCallback } from 'react';
import axios from 'axios';

const usePastLifeStoriesContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePastLifeStoriesContent = useCallback(async () => {
    const prompt = `Generate an intimate past life story that explores soul connections and memories across lifetimes.

    Create a JSON object with these fields:
    - story: A detailed narrative about a past life memory (200-300 words)
    - imagePrompt: Detailed prompt for generating a historical visual of this past life scene

    PAST LIFE STORIES CONCEPT:
    - Intimate, emotional narratives of remembered past lives
    - Personal stories of love, loss, and deep connections across time
    - "I once knew..." style storytelling from the perspective of someone remembering
    - Different historical periods and cultural settings
    - Focus on human connections, emotions, and relationships that transcend lifetimes

    STORY CATEGORIES:

    ROMANTIC PAST LIFE CONNECTIONS:
    - A musician lover from 1920s Paris who played melodies that still haunt your dreams
    - A Renaissance artist in Florence who painted your portrait that you've never seen but remember
    - A Victorian era poet who wrote verses that feel like they were meant for you
    - A medieval knight who protected you during a siege you can still feel
    - A 1960s dancer in New York whose movements you recognize in your own body

    FAMILY & FRIENDSHIP CONNECTIONS:
    - A sister in ancient Egypt who taught you the secrets of the stars
    - A brother in feudal Japan who shared your love for cherry blossoms
    - A mother in colonial America who sang lullabies you still hum
    - A best friend in ancient Greece who debated philosophy with you for hours
    - A daughter in 1800s India who called you by a name that makes you cry

    MENTOR & TEACHER CONNECTIONS:
    - A wise teacher in ancient China who showed you the way of balance
    - A healer in medieval times who taught you about herbs you've never studied
    - A philosopher in ancient Rome whose words echo in your thoughts
    - A spiritual guide in Tibet who shared meditation techniques you somehow know
    - A craftsman in Renaissance Italy who taught you skills your hands remember

    TRAGIC & UNFINISHED CONNECTIONS:
    - A child you couldn't save during a plague in medieval Europe
    - A lover lost in a war whose face appears in your dreams
    - A friend who died young in 1918 flu pandemic, leaving words unspoken
    - A parent you lost too early in ancient times, love never fully expressed
    - A companion lost at sea whose last words still echo in your heart

    HEROIC & ADVENTURE CONNECTIONS:
    - A fellow explorer who discovered new lands with you in the Age of Exploration
    - A revolutionary companion who fought for freedom in various historical periods
    - A healer who worked alongside you during times of plague and suffering
    - A protector who stood with you against injustice across different eras
    - A fellow seeker who searched for truth and meaning through multiple lifetimes

    STORY REQUIREMENTS:
    - Write in first person from the perspective of someone remembering
    - Include specific sensory details that make the memory feel vivid and real
    - Focus on the emotional connection and what made this person special
    - Include details about the historical period and setting
    - Show how this past life memory affects the present-day narrator
    - Make it deeply emotional and touching, but not overly dramatic
    - Include specific details that suggest genuine memory rather than imagination
    - Show the timeless nature of deep human connections
    - Keep it intimate and personal, not epic or grandiose

    IMAGE PROMPT REQUIREMENTS:
    - Historical scene that matches the time period and setting described
    - Show the specific moment or relationship described in the story
    - Include period-accurate clothing, architecture, and cultural details
    - Capture the emotional essence of the connection described
    - Beautiful, cinematic quality that honors the historical period
    - Show the people in the story in their historical context
    - Warm, emotional lighting that conveys the love and connection
    - Professional historical artwork quality with attention to period details

    EXAMPLE STORY STRUCTURE:
    "I remember the way she laughed... [specific memory]. It was [time period] in [place], and [context]. [Specific details about the person and relationship]. Even now, [how this memory affects present day]. Sometimes I wonder if [reflection on the connection]."

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate past life story
      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master storyteller who creates deeply emotional, intimate past life narratives. Generate beautiful stories about soul connections that transcend lifetimes, focusing on human emotions, relationships, and the timeless nature of love and connection. Always return valid JSON.'
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

      const contentText = scenarioResponse.data.choices[0].message.content.trim();
      
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
      
      console.log('Cleaned past life story JSON:', jsonText);
      
      let scenarioData;
      try {
        scenarioData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonText);
        throw new Error('Failed to parse scenario JSON');
      }

      // Generate image
      const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;

      console.log('🌀 Generating past life story image...');

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: scenarioData.imagePrompt,
          samples: 1,
          scheduler: "DPM++ 2M",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
          img_width: 1024,
          img_height: 1024,
          base64: false
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
      
      console.log('✅ Past life stories content generated successfully');
      
      return {
        story: scenarioData.story,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Past life stories content generation failed:', error);
      setError('Failed to generate past life stories content');
      throw new Error('Failed to generate past life stories content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generatePastLifeStoriesContent,
    isGenerating,
    error
  };
};

export default usePastLifeStoriesContent;
