import { useState, useCallback } from 'react';
import axios from 'axios';

const useDadJokesComediansContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDadJokesComediansContent = useCallback(async () => {
    const comedians = [
      {
        name: "Tanmay Bhatt",
        style: "Gaming and pop culture references, animated storytelling, millennial humor",
        personality: "High-energy, references gaming, YouTube, social media, uses 'guys guys' frequently"
      },
      {
        name: "Kenny Sebastian",
        style: "Musical references, observational humor, wholesome and relatable",
        personality: "Gentle, musical, observational, talks about everyday life and relationships"
      },
      {
        name: "Danish Sait",
        style: "Bangalore and South Indian cultural references, character voices",
        personality: "Mimics accents, references Bangalore traffic and South Indian culture"
      },
      {
        name: "Biswa Kalyan Rath",
        style: "Intellectual and sarcastic humor, deadpan delivery",
        personality: "Dry, intellectual, slightly cynical, engineering background references"
      },
      {
        name: "Kanan Gill",
        style: "Self-deprecating millennial humor, storytelling",
        personality: "Self-aware, millennial struggles, relatable awkwardness"
      },
      {
        name: "Abish Mathew",
        style: "Wholesome family-friendly humor, positive energy",
        personality: "Cheerful, family-oriented, clean comedy, positive outlook"
      },
      {
        name: "Jerry Seinfeld",
        style: "Observational humor with 'What's the deal with...' format",
        personality: "Questioning everything, observational, New York attitude"
      },
      {
        name: "Kevin Hart",
        style: "High-energy animated delivery, self-deprecating height jokes",
        personality: "Loud, animated, talks about family and personal experiences"
      },
      {
        name: "John Mulaney",
        style: "Storytelling with precise delivery and unexpected punchlines",
        personality: "Precise, storyteller, references childhood and wife, clean delivery"
      },
      {
        name: "Dave Chappelle",
        style: "Social commentary mixed with personal anecdotes",
        personality: "Thoughtful, social observer, mixes serious topics with humor"
      },
      {
        name: "Ricky Gervais",
        style: "British dry humor, slightly controversial and edgy",
        personality: "Sarcastic, British, slightly provocative, dry delivery"
      },
      {
        name: "Amy Schumer",
        style: "Bold and edgy humor, personal and relatable",
        personality: "Bold, talks about relationships and personal life, unfiltered"
      }
    ];

    const selectedComedian = comedians[Math.floor(Math.random() * comedians.length)];

    try {
      setIsGenerating(true);
      setError(null);

      console.log(`🎭 Generating dad joke for ${selectedComedian.name}...`);

      // Generate the dad joke text using OpenAI GPT-4
      const textResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are ${selectedComedian.name}, a comedian known for ${selectedComedian.style}. Your personality is: ${selectedComedian.personality}. 

You need to deliver a dad joke in your signature comedic style. The joke should:
1. Be a classic dad joke (puns, wordplay, groan-worthy humor)
2. Be delivered in YOUR unique comedic voice and style
3. Include your typical mannerisms, catchphrases, or references
4. Be exactly 120 words or less
5. Feel authentic to how you would actually tell a dad joke

Make it feel like the audience is watching you perform this dad joke live on stage.`
          },
          {
            role: 'user',
            content: 'Tell me a dad joke in your signature style. Make it feel like a live performance.'
          }
        ],
        max_tokens: 200,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const jokeText = textResponse.data.choices[0].message.content.trim();
      console.log('✅ Dad joke generated successfully');

      // Generate Ghibli-style portrait of the comedian
      const imagePrompt = `Studio Ghibli style animated portrait of ${selectedComedian.name}, the comedian. Soft watercolor animation style like Hayao Miyazaki films, gentle and whimsical art style, warm lighting, friendly expression, animated character design, hand-drawn animation aesthetic, soft pastel colors, charming and approachable look, Studio Ghibli character art style, wholesome and heartwarming portrait, detailed facial features in Ghibli animation style, cozy and inviting atmosphere.`;

      console.log('🎨 Generating Ghibli-style portrait...');

      const imageResponse = await axios.post('https://api.segmind.com/v1/nano-banana', {
        prompt: imagePrompt,
        samples: 1,
        scheduler: "DPM++ 2M",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
        img_width: 1024,
        img_height: 1024,
        base64: false
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 120000
      });

      console.log('✅ Ghibli portrait generated successfully');

      // Check if we got valid responses
      if (!imageResponse.data || imageResponse.data.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageResponse.data);
      console.log('Created image URL:', imageUrl);

      return {
        comedian: selectedComedian.name,
        joke: jokeText,
        image: {
          url: imageUrl,
          prompt: imagePrompt,
          description: `Ghibli-style portrait of ${selectedComedian.name}`
        }
      };

    } catch (error) {
      console.error('Dad jokes comedians generation failed:', error);
      
      let errorMessage = 'Failed to generate comedian dad joke';
      if (error.response?.status === 401) {
        errorMessage = 'API key authentication failed';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.response?.status) {
        errorMessage = `API Error: Status ${error.response.status}`;
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
    generateDadJokesComediansContent,
    isGenerating,
    error
  };
};

export default useDadJokesComediansContent;
