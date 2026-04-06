import { useState, useCallback } from 'react';
import axios from 'axios';

const useAliensAncientIndiansContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateAliensAncientIndiansContent = useCallback(async () => {
    const ancientStructures = [
      {
        name: "Kailasa Temple, Ellora",
        period: "8th century CE (but using pre-6th century techniques)",
        mystery: "Carved from single massive rock, removed 400,000 tons of stone",
        location: "Maharashtra, India"
      },
      {
        name: "Konark Sun Temple",
        period: "13th century (but using ancient Kalinga techniques)",
        mystery: "Perfect astronomical alignment, magnetic levitation of main dome",
        location: "Odisha, India"
      },
      {
        name: "Brihadeeswara Temple",
        period: "11th century (but using ancient Tamil techniques)",
        mystery: "80-ton granite capstone lifted 200 feet high without cranes",
        location: "Tamil Nadu, India"
      },
      {
        name: "Ajanta Caves",
        period: "2nd century BCE to 6th century CE",
        mystery: "Perfect acoustics, natural lighting systems, precise rock cutting",
        location: "Maharashtra, India"
      },
      {
        name: "Mahabalipuram Shore Temple",
        period: "7th-8th century (but using ancient Pallava techniques)",
        mystery: "Underwater foundations, tsunami-resistant design",
        location: "Tamil Nadu, India"
      },
      {
        name: "Hampi Vijayanagara Structures",
        period: "14th-16th century (but using ancient Vijayanagara techniques)",
        mystery: "Massive stone blocks fitted without mortar, musical pillars",
        location: "Karnataka, India"
      },
      {
        name: "Sanchi Stupa",
        period: "3rd century BCE",
        mystery: "Perfect geometric proportions, earthquake-resistant design",
        location: "Madhya Pradesh, India"
      },
      {
        name: "Elephanta Caves",
        period: "5th-6th century CE",
        mystery: "Massive underground chambers carved with precision tools",
        location: "Maharashtra, India"
      },
      {
        name: "Badami Cave Temples",
        period: "6th century CE",
        mystery: "Complex rock-cut architecture with perfect structural engineering",
        location: "Karnataka, India"
      },
      {
        name: "Udayagiri and Khandagiri Caves",
        period: "2nd century BCE",
        mystery: "Intricate Jain cave monasteries with advanced ventilation systems",
        location: "Odisha, India"
      }
    ];

    const selectedStructure = ancientStructures[Math.floor(Math.random() * ancientStructures.length)];

    try {
      setIsGenerating(true);
      setError(null);

      console.log(`🛸 Generating alien-ancient Indian collaboration story for ${selectedStructure.name}...`);

      // Generate the story using OpenAI GPT-4
      const textResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are writing a story about ancient alien collaboration with pre-6th century Indian civilizations. The story explores how extraterrestrial visitors helped ancient Indians construct impossible architectural marvels that defy modern scientific explanation.

The story should be exactly 200 words and follow this structure:
1. Setting the scene - the ancient Indian civilization and their construction challenge
2. First contact - how the aliens arrived and made contact with the builders/architects
3. Knowledge transfer - specific alien technologies and techniques shared (anti-gravity, energy tools, sacred geometry, etc.)
4. Collaborative construction - how humans and aliens worked together to build the impossible structure

The tone should be:
- Respectful to ancient Indian culture and achievements
- Scientifically curious about unexplained construction methods
- Detailed about specific alien technologies used
- Focused on the collaborative partnership between species
- Grounded in real archaeological mysteries

Make it feel like a documentary narrative that explains how these impossible structures were actually built with alien assistance.`
          },
          {
            role: 'user',
            content: `Write a 200-word story about alien collaboration in building "${selectedStructure.name}".

Context: 
- Structure: ${selectedStructure.name}
- Period: ${selectedStructure.period}
- Location: ${selectedStructure.location}
- Mystery: ${selectedStructure.mystery}

Show how aliens helped ancient Indian architects and builders overcome the impossible engineering challenges using advanced extraterrestrial technology and knowledge.`
          }
        ],
        max_tokens: 350,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const storyText = textResponse.data.choices[0].message.content.trim();
      console.log('✅ Alien collaboration story generated successfully');

      // Generate alien-ancient Indian collaboration visualization
      const imagePrompt = `Epic cinematic scene showing ancient extraterrestrial beings collaborating with pre-6th century Indian architects and builders to construct ${selectedStructure.name}. The scene shows tall, advanced alien beings with glowing technology working alongside ancient Indian craftsmen, priests, and architects in traditional Vedic clothing. Aliens are using anti-gravity beams, energy tools, and holographic blueprints to help lift massive stone blocks and carve intricate details. The setting shows ancient India with traditional architecture, palm trees, and dramatic lighting. UFOs hover in the background. The collaboration is peaceful and respectful, showing knowledge transfer between civilizations. Cinematic quality, ancient alien documentary style, realistic historical setting, advanced alien technology, collaborative construction scene.`;

      console.log('🏛️ Generating alien collaboration visualization...');

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

      console.log('✅ Alien collaboration visualization generated successfully');

      // Check if we got valid responses
      if (!imageResponse.data || imageResponse.data.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageResponse.data);
      console.log('Created image URL:', imageUrl);

      return {
        structureName: selectedStructure.name,
        story: storyText,
        image: {
          url: imageUrl,
          prompt: imagePrompt,
          description: `Aliens collaborating with ancient Indians to build ${selectedStructure.name}`
        }
      };

    } catch (error) {
      console.error('Aliens ancient Indians generation failed:', error);
      
      let errorMessage = 'Failed to generate alien collaboration story';
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
    generateAliensAncientIndiansContent,
    isGenerating,
    error
  };
};

export default useAliensAncientIndiansContent;
