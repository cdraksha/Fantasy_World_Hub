import { useState, useCallback } from 'react';

const useDaydreamDuoverseContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateDaydreamDuoverseContent = useCallback(async () => {
    const scenarios = [
      {
        reality: "Person making a simple peanut butter and jelly sandwich in basic home kitchen, casual clothes, modest counter space",
        dream: "Same person as head chef in luxurious Michelin-starred restaurant, chef whites, elegant plating, fine dining atmosphere",
        description: "Man cuts sandwich for first time, dreams he is Michelin star chef"
      },
      {
        reality: "Young person strumming guitar alone in small bedroom, basic setup, casual clothes",
        dream: "Same person performing as rock star on massive stadium stage, thousands of fans, dramatic lighting",
        description: "Woman strums guitar in bedroom, dreams she's performing at sold-out stadium"
      },
      {
        reality: "Person writing in notebook at small coffee shop table, laptop, casual setting",
        dream: "Same person at bestseller book signing event, elegant bookstore, long line of fans waiting",
        description: "Person writes first blog post, dreams of bestseller book signing"
      },
      {
        reality: "Person doing first workout at basic home gym, simple equipment, beginner form",
        dream: "Same person standing on Olympic podium, gold medal, national anthem, crowd cheering",
        description: "Teenager does first push-up, dreams of Olympic gold medal ceremony"
      },
      {
        reality: "Person sketching simple drawing in basic sketchbook, pencils scattered on desk",
        dream: "Same person at prestigious art gallery opening, elegant crowd admiring their masterpiece on wall",
        description: "Short phrase describing the transformation (e.g., 'Man cuts sandwich for first time, dreams he is Michelin star chef')"
      },
      {
        reality: "Person coding on old laptop in cluttered bedroom, energy drinks, messy desk",
        dream: "Same person ringing IPO bell at stock exchange, suit and tie, celebrating with team",
        description: "From bedroom coding to tech empire"
      },
      {
        reality: "Person setting up small lemonade stand on suburban sidewalk, handmade sign, folding table",
        dream: "Same person in corporate boardroom, presenting to executives, city skyline view through windows",
        description: "From lemonade stand to business empire"
      },
      {
        reality: "Person filming first YouTube video with basic phone setup in bedroom, nervous expression",
        dream: "Same person in professional Hollywood studio, multiple cameras, crew, talk show setting",
        description: "From bedroom vlogs to media stardom"
      },
      {
        reality: "Person planting first small herb in tiny apartment windowsill pot, basic gardening tools",
        dream: "Same person in vast organic farm, greenhouse complex, agricultural innovation center",
        description: "From windowsill herbs to agricultural revolution"
      },
      {
        reality: "Person teaching first student at kitchen table, basic textbooks, patient explanation",
        dream: "Same person giving TED talk on massive stage, spotlight, thousands in audience",
        description: "From kitchen table tutoring to educational influence"
      }
    ];

    const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const prompt = `Create a split-screen composition showing reality vs daydream:

LEFT SIDE (Reality): ${selectedScenario.reality}
RIGHT SIDE (Dream): ${selectedScenario.dream}

VISUAL STYLE:
- Clear split down the middle
- Same person in both sides (consistent appearance)
- LEFT: Modest, everyday lighting, casual setting, humble scale
- RIGHT: Dramatic, professional lighting, grand setting, impressive scale, reminiscent of La La Land's vibrant and dreamy quality
- Strong contrast between humble beginning and grandiose vision
- Photorealistic style
- Clear visual storytelling of aspiration and dreams

COMPOSITION:
- Perfect 50/50 split vertically down the center
- Consistent person across both sides
- Dramatic difference in scale and grandeur
- Professional photography quality`;

    try {
      setIsGenerating(true);
      setError(null);

      console.log('� Generating Daydream Fantasy image with Nano Banana...');

      // Generate image using Segmind Nano Banana
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, extra limbs, text, watermark, signature, username, artist name, copyright, logo, brand name, multiple people in one side, inconsistent person, bad split composition",
          width: 1024,
          height: 512,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000000),
          scheduler: "DPM++ 2M Karras"
        })
      });

      if (!imageResponse.ok) {
        throw new Error(`Segmind Nano Banana API error: ${imageResponse.status}`);
      }

      // Nano Banana returns image file directly, not JSON
      const imageBlob = await imageResponse.blob();
      console.log('✅ Daydream Fantasy image generated successfully');

      // Check if we got valid image response
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Received empty image data');
      }

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Created image URL:', imageUrl);

      return {
        description: selectedScenario.description,
        image: {
          url: imageUrl,
          prompt: prompt,
          description: `Daydream Fantasy - ${selectedScenario.description}`,
          thumbnail: null
        }
      };

    } catch (error) {
      console.error('Daydream Fantasy generation failed:', error);
      
      let errorMessage = 'Failed to generate Daydream Fantasy';
      if (error.message.includes('401')) {
        errorMessage = 'API key authentication failed';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.message.includes('API error')) {
        errorMessage = error.message;
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
    generateDaydreamDuoverseContent,
    isGenerating,
    error
  };
};

export default useDaydreamDuoverseContent;
