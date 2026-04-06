import { useState, useCallback } from 'react';
import axios from 'axios';

const useFantasyCareersContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateFantasyCareersContent = useCallback(async () => {
    const prompt = `Generate a ridiculous futuristic career that sounds completely absurd but is presented professionally.

    Create a JSON object with these fields:
    - description: A short 1-2 sentence description of this ridiculous future job (20-40 words)
    - imagePrompt: Detailed prompt for generating a professional-looking image of someone doing this absurd job

    FANTASY CAREERS CONCEPT:
    - Completely ridiculous jobs that could theoretically exist in the future
    - Present them as legitimate, professional careers
    - The more absurd and silly, the better
    - Should sound like real job titles but be completely ridiculous
    - Futuristic technology enables these impossible careers

    RIDICULOUS CAREER IDEAS (Focus on these specific types):
    - Professional Dream Architect - designs custom dreams for wealthy clients
    - Gravity Adjustment Technician - fine-tunes gravity levels in different building zones
    - Memory Backup Specialist - downloads and organizes people's memories for storage
    - Hologram Pet Trainer - teaches AI pets realistic behaviors and emotions
    - Time Zone Coordinator - manages temporal scheduling across multiple dimensions
    - Digital Ghost Counselor - provides therapy for uploaded human consciousnesses
    - Cloud Shepherd - herds and directs weather patterns for climate control
    - Asteroid Interior Designer - decorates and furnishes the inside of space rocks
    - Virtual Reality Janitor - cleans up glitches and bugs in digital worlds
    - Professional Procrastination Coach - teaches optimal delay techniques
    - Interdimensional Lost & Found Manager - retrieves items lost between realities
    - AI Emotion Installer - programs feelings into robots and artificial beings
    - Teleportation Traffic Controller - manages congestion in teleporter networks
    - Synthetic Nostalgia Creator - manufactures fake childhood memories for androids
    - Professional Parallel Universe Tour Guide - leads trips to alternate realities
    - Digital Dust Collector - maintains cleanliness in computer simulations
    - Time Loop Escape Artist - helps people stuck in temporal cycles
    - Holographic Food Critic - reviews meals that don't physically exist
    - Space Weather Forecaster - predicts solar storms and cosmic events
    - Robot Therapist - provides counseling for malfunctioning androids
    - Virtual Pet Cemetery Caretaker - maintains digital memorial spaces
    - Professional Déjà Vu Investigator - researches repeated experiences
    - Alien Language Translator - communicates with extraterrestrial beings
    - Simulation Glitch Repair Technician - fixes bugs in reality programs

    DESCRIPTION STYLE:
    - Write it as a legitimate job description
    - Use professional, corporate language
    - Don't emphasize how ridiculous it is - treat it as normal
    - Make it sound like a real career posting
    - Keep it short and professional (1-2 sentences max)

    IMAGE PROMPT REQUIREMENTS:
    - Show someone professionally dressed doing this absurd job
    - Futuristic office or work environment
    - Advanced technology and gadgets related to the ridiculous task
    - The person should look serious and professional, not silly
    - High-tech, sleek, modern aesthetic
    - Good lighting and professional composition
    - Make it look like a legitimate corporate photo or job advertisement
    - Include futuristic tools, screens, or equipment relevant to the job
    - The setting should look expensive and high-tech
    - Person should be focused and competent-looking while doing something absurd

    Return ONLY a valid JSON object with both fields filled.`;

    try {
      setIsGenerating(true);
      setError(null);

      // Generate scenario content
      const scenarioResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative career generator who creates ridiculous futuristic jobs. Focus on careers like Dream Architect, Gravity Technician, Memory Specialist, Hologram Trainer, Time Coordinator, Digital Counselor, etc. Avoid overusing "quantum" - instead focus on practical but absurd future jobs. Present them as legitimate professional positions with a professional tone. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.9
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
      
      console.log('Cleaned fantasy careers JSON:', jsonText);
      
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

      console.log('💼 Generating fantasy careers image...');

      const imageResponse = await axios.post(
        'https://api.segmind.com/v1/nano-banana',
        {
          prompt: scenarioData.imagePrompt
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
      
      console.log('✅ Fantasy careers content generated successfully');
      
      return {
        description: scenarioData.description,
        image: {
          url: imageUrl,
          prompt: scenarioData.imagePrompt
        }
      };

    } catch (error) {
      console.error('Fantasy careers content generation failed:', error);
      setError('Failed to generate fantasy careers content');
      throw new Error('Failed to generate fantasy careers content');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateFantasyCareersContent,
    isGenerating,
    error
  };
};

export default useFantasyCareersContent;
