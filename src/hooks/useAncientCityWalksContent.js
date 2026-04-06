import { useState, useCallback } from 'react';
import axios from 'axios';

const useAncientCityWalksContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateAncientCityWalk = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('🏛️ Step 1: Generating city description with ChatGPT...');

      // Step 1: Generate city description with ChatGPT
      const cityResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a historian who creates immersive descriptions of ancient cities. Generate a specific city, year, and brief atmospheric description for a cinematic walk-through video.'
          },
          {
            role: 'user',
            content: `Generate a random ancient city walk scenario. Include:
            - City name and specific year (between 3000 BCE - 500 CE)
            - Brief atmospheric description (1-2 sentences)
            - Key landmark or feature visible during the walk
            
            Format as JSON:
            {
              "city": "City Name",
              "year": "Year with BCE/CE",
              "description": "Brief atmospheric description",
              "landmark": "Key landmark or feature",
              "walkPrompt": "Detailed video prompt for Sora-2"
            }

            Examples of cities: Alexandria, Babylon, Carthage, Persepolis, Angkor, Teotihuacan, Rome, Athens, Constantinople, Petra, Memphis, Ur, Harappa, etc.`
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          
            'Content-Type': 'application/json'
        }
      });

      const cityText = cityResponse.data.choices[0].message.content.trim();
      
      // Extract JSON from response
      let jsonText = cityText;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1];
      }
      
      const cityData = JSON.parse(jsonText.trim());
      console.log('✅ City description generated:', cityData);

      console.log('🎬 Step 2: Generating video with Runway Gen-3 Turbo (this will take ~2-3 minutes)...');

      // Step 2: Generate video with Runway Gen-3 Turbo (more reliable)
      const videoResponse = await axios.post('https://api.segmind.com/v1/runway-gen3-turbo', {
        prompt: cityData.walkPrompt,
        duration: 5
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        }
      });

      console.log('✅ Ancient city walk video generated successfully');
      console.log('Video response:', videoResponse.data);

      // Sora-2 Pro returns JSON with video URL, not a blob
      let videoUrl;
      if (typeof videoResponse.data === 'string') {
        // If it's a direct URL string
        videoUrl = videoResponse.data;
      } else if (videoResponse.data.url) {
        // If it's JSON with url field
        videoUrl = videoResponse.data.url;
      } else if (videoResponse.data.video_url) {
        // Alternative field name
        videoUrl = videoResponse.data.video_url;
      } else {
        // Fallback: try to create blob URL
        videoUrl = URL.createObjectURL(videoResponse.data);
      }
      
      return {
        city: cityData.city,
        year: cityData.year,
        description: cityData.description,
        landmark: cityData.landmark,
        video: {
          url: videoUrl,
          prompt: cityData.walkPrompt
        }
      };

    } catch (error) {
      console.error('Ancient city walk generation failed:', error);
      
      let errorMessage = 'Failed to generate ancient city walk';
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
    generateAncientCityWalk,
    isGenerating,
    error
  };
};

export default useAncientCityWalksContent;
