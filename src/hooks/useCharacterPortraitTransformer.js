import { useState, useCallback } from 'react';
import axios from 'axios';

const useCharacterPortraitTransformer = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Define all useCallback hooks first to maintain consistent hook order
  const convertImageToBase64 = useCallback(async (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Extract base64 data without the data:image/jpeg;base64, prefix
        const base64Data = e.target.result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }, []);

  const themes = {
    'victorian-era': {
      name: 'Victorian Era',
      description: 'Proper society, gothic atmosphere',
      imagePrompt: 'Victorian era portrait with elaborate period clothing, ornate backgrounds, formal poses, gothic architecture, rich fabrics, and aristocratic styling',
      storyContext: 'Victorian society with themes of propriety, social hierarchy, gothic mystery, and elaborate customs'
    },
    'british-army': {
      name: 'British Army',
      description: 'Military campaigns, colonial adventures',
      imagePrompt: 'British colonial military officers in full dress uniform, medals, military regalia, colonial setting, formal military poses, empire period styling',
      storyContext: 'British colonial military campaigns with themes of duty, honor, imperial service, and frontier adventures'
    },
    'sci-fi': {
      name: 'Sci-Fi',
      description: 'Future tech, space exploration',
      imagePrompt: 'Futuristic sci-fi characters with advanced technology, space suits, cybernetic enhancements, holographic displays, sleek metallic environments',
      storyContext: 'Science fiction setting with advanced technology, space exploration, futuristic societies, and technological marvels'
    },
    'russian-mob-boss': {
      name: 'Russian Mob Boss',
      description: 'Criminal underworld, power struggles',
      imagePrompt: 'Russian crime boss in expensive suit, luxury setting, gold jewelry, intimidating presence, urban backdrop, sophisticated criminal aesthetic',
      storyContext: 'Russian criminal underworld with themes of power, loyalty, betrayal, and organized crime dynamics'
    },
    'south-indian-mappila': {
      name: 'South Indian "Mappila"',
      description: 'Traditional Muslim merchant/sailor culture',
      imagePrompt: 'Traditional South Indian Mappila merchants in traditional attire, spice trading setting, coastal backdrop, traditional jewelry and clothing',
      storyContext: 'South Indian Mappila merchant culture with themes of trade, maritime adventures, cultural traditions, and coastal life'
    },
    'wild-west': {
      name: 'Wild West',
      description: 'Cowboys, frontier justice',
      imagePrompt: 'Wild West cowboys with period clothing, leather chaps, cowboy hats, desert backdrop, saloon setting, frontier town atmosphere',
      storyContext: 'American Wild West with themes of frontier justice, cattle ranching, lawlessness, and pioneer spirit'
    },
    'film-noir': {
      name: 'Film Noir',
      description: '1940s detective, shadows, mystery',
      imagePrompt: '1940s film noir style with dramatic shadows, detective clothing, urban night setting, cigarette smoke, moody lighting, classic noir atmosphere',
      storyContext: '1940s film noir setting with themes of mystery, crime, moral ambiguity, and urban darkness'
    },
    'chinese-gang-leaders': {
      name: 'Chinese Gang Leaders',
      description: 'Triads, honor codes, urban power',
      imagePrompt: 'Chinese triad leaders in traditional and modern fusion clothing, urban setting, martial arts aesthetic, honor symbols, sophisticated criminal style',
      storyContext: 'Chinese triad culture with themes of honor codes, loyalty, martial arts, and urban power struggles'
    },
    'japanese-edo-era': {
      name: 'Japanese Edo Era',
      description: 'Samurai, merchants, traditional Japan',
      imagePrompt: 'Japanese Edo period characters in traditional kimono or samurai armor, traditional architecture, cherry blossoms, classical Japanese aesthetic',
      storyContext: 'Japanese Edo period with themes of honor, tradition, samurai culture, and classical Japanese society'
    },
    'knights-in-armor': {
      name: 'Knights in Armor',
      description: 'Medieval chivalry, quests, honor',
      imagePrompt: 'Medieval knights in full plate armor, castle backdrop, heraldic symbols, medieval weapons, chivalric poses, gothic architecture',
      storyContext: 'Medieval knightly culture with themes of chivalry, honor, quests, and feudal society'
    }
  };

  const validateImage = useCallback(async (imageFile) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    // Convert image to base64
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(imageFile);
    });

    try {
      const response = await fetch('http://localhost:3001/api/openai/chat', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and determine if it contains at least one person. Respond with only "VALID" if people are present, or "INVALID: [reason]" if no people are found or the image is inappropriate.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 50
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content || 'INVALID: Unable to analyze image';
      
      if (result.startsWith('VALID')) {
        return { isValid: true, description: result };
      } else {
        return { isValid: false, reason: result.replace('INVALID: ', '') };
      }
    } catch (error) {
      console.error('Image validation error:', error);
      throw new Error('Failed to validate image. Please try again.');
    }
  }, []);

  const analyzeImage = useCallback(async (imageFile) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(imageFile);
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert at analyzing portraits for artistic transformation. Provide extremely detailed descriptions that will help recreate this person in a different artistic style while maintaining their likeness.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this portrait in extreme detail for artistic transformation. Describe: 1) Facial structure (face shape, jawline, cheekbones, forehead), 2) Eyes (shape, color, size, expression), 3) Nose (shape, size), 4) Mouth (lip shape, size), 5) Hair (color, style, texture, length), 6) Skin tone and complexion, 7) Age and gender, 8) Facial expression and mood, 9) Pose and angle, 10) Clothing visible, 11) Background elements, 12) Lighting and shadows. Be extremely specific about every detail so the person can be accurately recreated in a different artistic style.'
          },
          {
            type: 'image_url',
            image_url: {
              url: base64Image
            }
          }
        ]
      }
    ];

    try {
      const response = await fetch('http://localhost:3001/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to analyze image details';
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }, []);

  const generateImage = useCallback(async (imageAnalysis, themeId, imageBase64) => {
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    if (!apiKey || apiKey === 'your_segmind_api_key_here') {
      throw new Error('Segmind API key not configured');
    }

    const theme = themes[themeId];
    if (!theme) {
      throw new Error('Invalid theme selected');
    }

    const prompt = `Transform this portrait into ${theme.name} artistic style. ${theme.imagePrompt}. High quality artwork, detailed period-appropriate style, maintaining the person's likeness but in the new artistic theme.`;

    try {
      const response = await axios.post(
        'http://localhost:3001/api/segmind/nano-banana-pro',
        {
          prompt: prompt,
          image: imageBase64,
          aspect_ratio: '4:3',
          output_resolution: '2K',
          output_format: 'jpg'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 120000
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      return {
        url: imageUrl,
        description: `${theme.name} transformation of the uploaded portrait`
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate transformed portrait. Please try again.');
    }
  }, []);

  const generateStory = useCallback(async (imageAnalysis, themeId) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    const theme = themes[themeId];
    if (!theme) {
      throw new Error('Invalid theme selected');
    }

    const systemPrompt = `You are a creative storyteller specializing in ${theme.name} narratives. Create engaging, immersive stories that transport readers into ${theme.storyContext}.`;

    const userPrompt = `Based on this image description: "${imageAnalysis}"
    
    Create a compelling 100-word story casting these people as characters in a ${theme.name} setting. The story should:
    - Be exactly around 100 words
    - Cast the people from the image as main characters
    - Be set in ${theme.storyContext}
    - Include vivid details and atmosphere
    - Have an engaging narrative arc
    - Match the ${theme.description} aesthetic
    
    Write in third person and make it immersive and entertaining.`;

    try {
      const response = await fetch('http://localhost:3001/api/openai/chat', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate story';
    } catch (error) {
      console.error('Story generation error:', error);
      throw new Error('Failed to generate story. Please try again.');
    }
  }, []);

  const transformPortrait = useCallback(async (imageFile, themeId) => {
    setIsLoading(true);
    
    try {
      // Step 1: Validate image contains people
      const validation = await validateImage(imageFile);
      if (!validation.isValid) {
        throw new Error(validation.reason || 'Image does not contain people');
      }

      // Step 2: Analyze the image
      const imageAnalysis = await analyzeImage(imageFile);

      // Step 3: Convert image to base64 for transformation
      const imageBase64 = await convertImageToBase64(imageFile);

      // Step 4: Generate transformed portrait using base64 image data
      const transformedImage = await generateImage(imageAnalysis, themeId, imageBase64);

      // Step 5: Generate story
      const story = await generateStory(imageAnalysis, themeId);

      const result = {
        transformedImage,
        story,
        theme: themes[themeId]?.name,
        originalAnalysis: imageAnalysis
      };

      setIsLoading(false);
      return result;

    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [validateImage, analyzeImage, convertImageToBase64, generateImage, generateStory]);

  return {
    transformPortrait,
    isLoading,
    themes
  };
};

export default useCharacterPortraitTransformer;
