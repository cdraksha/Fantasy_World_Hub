import { useState, useCallback } from 'react';
import axios from 'axios';

const useProfessorXMindReadsContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateProfessorXMindReadsContent = useCallback(async () => {
    const famousPeople = [
      {
        name: "Elon Musk",
        position: "CEO of Tesla and SpaceX",
        context: "Tech entrepreneur and innovator",
        scenario: "During a Tesla board meeting or SpaceX launch preparation"
      },
      {
        name: "Warren Buffett",
        position: "CEO of Berkshire Hathaway",
        context: "Investment legend and philanthropist",
        scenario: "During annual shareholder meeting or major investment decision"
      },
      {
        name: "Jeff Bezos",
        position: "Founder of Amazon",
        context: "E-commerce and space exploration pioneer",
        scenario: "During Amazon leadership meeting or Blue Origin planning"
      },
      {
        name: "Tim Cook",
        position: "CEO of Apple",
        context: "Technology executive and privacy advocate",
        scenario: "During Apple product launch or board meeting"
      },
      {
        name: "Mark Zuckerberg",
        position: "CEO of Meta",
        context: "Social media pioneer and VR enthusiast",
        scenario: "During Meta strategy meeting or congressional hearing"
      },
      {
        name: "Bill Gates",
        position: "Microsoft Co-founder and Philanthropist",
        context: "Technology pioneer and global health advocate",
        scenario: "During Gates Foundation meeting or climate summit"
      },
      {
        name: "Satya Nadella",
        position: "CEO of Microsoft",
        context: "Cloud computing and AI leader",
        scenario: "During Microsoft leadership meeting or AI conference"
      },
      {
        name: "Jensen Huang",
        position: "CEO of NVIDIA",
        context: "AI and graphics processing pioneer",
        scenario: "During NVIDIA product launch or AI summit"
      },
      {
        name: "Reed Hastings",
        position: "Co-founder of Netflix",
        context: "Streaming and entertainment innovator",
        scenario: "During Netflix content strategy meeting"
      },
      {
        name: "Sundar Pichai",
        position: "CEO of Alphabet/Google",
        context: "Search and AI technology leader",
        scenario: "During Google I/O conference or board meeting"
      }
    ];

    const selectedPerson = famousPeople[Math.floor(Math.random() * famousPeople.length)];

    try {
      setIsGenerating(true);
      setError(null);

      console.log(`🧠 Generating Professor X mind reading scenario for ${selectedPerson.name}...`);

      // Generate the story using OpenAI GPT-4
      const textResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are writing a story about Professor Charles Xavier from X-Men: First Class (2011) using his telepathic powers to take over the mind of a real famous person. 

The story should be exactly 200 words and follow this structure:
1. Setting the scene - where Xavier encounters the target
2. The telepathic infiltration - Xavier reading their mind and taking control
3. Using their knowledge/position - Xavier leveraging their resources and connections
4. The outcome - what Xavier achieves that the person never could/would

The tone should be:
- Cinematic and dramatic like X-Men: First Class
- Morally complex - Xavier uses mind control for greater good
- Detailed about the telepathic process and what Xavier discovers in their mind
- Specific about how Xavier uses their unique position and knowledge

Make it feel like a scene from the movie with Xavier's characteristic calm determination and moral purpose.`
          },
          {
            role: 'user',
            content: `Write a 200-word story: "If Professor X Mind Reads ${selectedPerson.name}". 

Context: ${selectedPerson.name} is ${selectedPerson.position}, known as ${selectedPerson.context}. The scenario takes place ${selectedPerson.scenario}.

Show Xavier taking over their mind and using their position/knowledge to achieve something for the greater good that they never would have done themselves.`
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
      console.log('✅ Professor X story generated successfully');

      // Generate telepathic visualization image
      const imagePrompt = `Cinematic scene from X-Men: First Class style showing Professor Charles Xavier using his telepathic powers on ${selectedPerson.name}. Xavier sits in his wheelchair with intense concentration, his eyes glowing with psychic energy. ${selectedPerson.name} is shown with a glazed expression as telepathic energy flows between them - visible as blue/purple energy streams or neural connections. The scene has dramatic lighting with Xavier's telepathic power visualized as glowing neural networks or psychic waves. Cinematic composition, X-Men movie aesthetic, dramatic shadows, telepathic mind control visualization, psychic energy effects, professional movie still quality.`;

      console.log('🎬 Generating telepathic visualization...');

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

      console.log('✅ Telepathic visualization generated successfully');

      // Check if we got valid responses
      if (!imageResponse.data || imageResponse.data.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageResponse.data);
      console.log('Created image URL:', imageUrl);

      return {
        targetPerson: selectedPerson.name,
        story: storyText,
        image: {
          url: imageUrl,
          prompt: imagePrompt,
          description: `Professor X taking telepathic control of ${selectedPerson.name}`
        }
      };

    } catch (error) {
      console.error('Professor X mind reads generation failed:', error);
      
      let errorMessage = 'Failed to generate Professor X scenario';
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
    generateProfessorXMindReadsContent,
    isGenerating,
    error
  };
};

export default useProfessorXMindReadsContent;
