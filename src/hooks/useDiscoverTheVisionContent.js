import { useState, useCallback } from 'react';

const useDiscoverTheVisionContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const [generatingSlide, setGeneratingSlide] = useState(null);

  const generateSlideImage = useCallback(async (slideType) => {
    try {
      setGeneratingSlide(slideType);
      setError(null);

      console.log(`🎨 Generating ${slideType} image...`);

      let prompt;
      let seed;
      
      switch(slideType) {
        case 'creativity':
          prompt = "beautiful digital art";
          seed = 42;
          break;
        case 'daydream':
          prompt = "fantasy landscape";
          seed = 123;
          break;
        case 'story':
          prompt = "futuristic scene";
          seed = 456;
          break;
        default:
          throw new Error('Invalid slide type');
      }

      const response = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          samples: 1,
          scheduler: "DDIM",
          num_inference_steps: 10,
          guidance_scale: 5.0,
          seed,
          img_width: 512,
          img_height: 512,
          base64: false
        })
      });

      if (!response.ok) {
        throw new Error(`${slideType} image generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return { url, description: `AI generated ${slideType}` };

    } catch (error) {
      console.error(`Error generating ${slideType} image:`, error);
      setError(error.message);
      throw error;
    } finally {
      setGeneratingSlide(null);
    }
  }, []);

  const generateSlideContent = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('🎨 Initializing Discover the Vision slideshow...');

      // Don't auto-generate images, just set up the structure
      const storyText = "In 2087, coffee shops float in zero gravity while baristas serve liquid dreams in crystalline cups to time travelers from the Renaissance.";

      console.log('✅ Slideshow initialized successfully');

      return {
        creativity: {
          url: null,
          description: "AI and human creativity merging"
        },
        daydream: {
          url: null,
          description: "Magical fantasy landscapes"
        },
        story: {
          url: null,
          text: storyText,
          description: "AI storytelling demonstration"
        }
      };

    } catch (error) {
      console.error('Discover the Vision content generation failed:', error);
      
      let errorMessage = 'Failed to generate slideshow content';
      if (error.message.includes('401')) {
        errorMessage = 'API key authentication failed';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded, please try again later';
      } else if (error.message.includes('generation failed')) {
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
    generateSlideContent,
    generateSlideImage,
    isGenerating,
    generatingSlide,
    error
  };
};

export default useDiscoverTheVisionContent;
