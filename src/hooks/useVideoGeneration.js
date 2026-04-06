import { useState, useCallback } from 'react';
import axios from 'axios';

const useVideoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Generate interviewer character image
  const generateInterviewerImage = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    try {
      console.log('🎥 Generating interviewer character...');
      
      const prompt = `Professional female news correspondent in futuristic red power suit, year 3125, sitting in interview position, confident posture, holographic accessories, silver tech details, studio lighting, high-tech background, photorealistic, 4K quality, cinematic composition`;
      
      const response = await axios.post(
        'https://api.segmind.com/v1/qwen-image-fast',
        {
          prompt: prompt,
          negative_prompt: 'blurry, low quality, distorted, cartoon, anime, modern clothing, casual wear',
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          guidance_scale: 7.5
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

      const imageUrl = URL.createObjectURL(response.data);
      
      const interviewerImage = {
        id: `interviewer_${Date.now()}`,
        url: imageUrl,
        prompt: prompt,
        timestamp: new Date(),
        type: 'interviewer'
      };

      console.log('✅ Interviewer image generated successfully');
      setIsGenerating(false);
      return interviewerImage;

    } catch (error) {
      console.error('❌ Interviewer image generation failed:', error);
      setError(`Interviewer generation failed: ${error.message}`);
      setIsGenerating(false);
      return null;
    }
  }, []);

  // Generate emperor character image
  const generateEmperorImage = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    try {
      console.log('👑 Generating Emperor Tiberius...');
      
      const prompt = `Regal elderly man as Emperor Tiberius Charlie Buchanan, 67 years old, silver hair, cybernetic left eye, wearing futuristic imperial jacket with holographic insignias, deep blue and gold colors, energy patterns, sitting in throne-like chair, dignified posture, year 3125, imperial office background, photorealistic, 4K quality, cinematic lighting`;
      
      const response = await axios.post(
        'https://api.segmind.com/v1/qwen-image-fast',
        {
          prompt: prompt,
          negative_prompt: 'blurry, low quality, distorted, cartoon, anime, modern clothing, casual wear, young person',
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          guidance_scale: 7.5
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

      const imageUrl = URL.createObjectURL(response.data);
      
      const emperorImage = {
        id: `emperor_${Date.now()}`,
        url: imageUrl,
        prompt: prompt,
        timestamp: new Date(),
        type: 'emperor'
      };

      console.log('✅ Emperor image generated successfully');
      setIsGenerating(false);
      return emperorImage;

    } catch (error) {
      console.error('❌ Emperor image generation failed:', error);
      setError(`Emperor generation failed: ${error.message}`);
      setIsGenerating(false);
      return null;
    }
  }, []);

  // Generate final interview video
  const generateFinalVideo = useCallback(async ({ interviewContent, interviewerImage, emperorImage }) => {
    setIsGenerating(true);
    setError(null);

    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    try {
      console.log('🎬 Generating final interview video...');
      
      // Try with a simpler text-to-video model first
      const videoPrompt = `Professional news interview in futuristic setting year 3125, interviewer in red suit asking questions to emperor in imperial jacket, formal interview setup, holographic displays in background, professional lighting, 30 seconds, vertical format, cinematic quality`;
      
      console.log('🎬 Generating emperor interview video...');
      
      // Create video directly from emperor image (more reliable than TTS + Speech2Video)
      const videoResponse = await axios.post(
        'https://api.segmind.com/v1/seedance-pro',
        {
          image: emperorImage.url,
          prompt: `Emperor Tiberius Charlie Buchanan speaking in professional news interview, futuristic imperial setting year 3125, slight head movements, talking, authoritative posture, holographic displays in background, professional lighting`,
          negative_prompt: 'blurry, distorted, fast movement, dramatic gestures, modern clothing, casual wear',
          width: 720,
          height: 1280,
          num_frames: 80,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          fps: 8
        },
        {
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 300000 // 5 minutes timeout for video generation
        }
      );

      const videoUrl = URL.createObjectURL(videoResponse.data);
      console.log('✅ Emperor interview video generated successfully');
      
      const finalVideo = {
        id: `interview_${Date.now()}`,
        url: videoUrl,
        prompt: videoPrompt,
        timestamp: new Date(),
        duration: 10,
        format: 'vertical',
        interviewContent,
        characters: {
          interviewer: interviewerImage,
          emperor: emperorImage
        }
      };

      console.log('✅ Interview video generated successfully');
      setIsGenerating(false);
      return finalVideo;

    } catch (error) {
      console.error('❌ Video generation failed:', error);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('🔄 TTS timed out, trying fallback approach without audio...');
        
        try {
          // Fallback: Create video without audio using just the emperor image
          const fallbackVideoResponse = await axios.post(
            'https://api.segmind.com/v1/seedance-pro',
            {
              image: emperorImage.url,
              prompt: `Emperor speaking in interview, professional news setting, slight head movements, talking, formal posture`,
              negative_prompt: 'blurry, distorted, fast movement, dramatic gestures',
              width: 720,
              height: 1280,
              num_frames: 80,
              num_inference_steps: 25,
              guidance_scale: 7.5,
              fps: 8
            },
            {
              headers: {
                'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
              },
              responseType: 'blob',
              timeout: 300000
            }
          );
          
          const fallbackVideoUrl = URL.createObjectURL(fallbackVideoResponse.data);
          console.log('✅ Fallback video generated successfully (without audio)');
          
          const fallbackVideo = {
            id: `interview_fallback_${Date.now()}`,
            url: fallbackVideoUrl,
            prompt: videoPrompt,
            timestamp: new Date(),
            duration: 10,
            format: 'vertical',
            interviewContent,
            characters: {
              interviewer: interviewerImage,
              emperor: emperorImage
            },
            isFallback: true,
            fallbackReason: 'Audio generation timed out - created silent video'
          };
          
          setIsGenerating(false);
          return fallbackVideo;
          
        } catch (fallbackError) {
          console.error('❌ Fallback video generation also failed:', fallbackError);
          setError(`Video generation failed: ${fallbackError.response?.status || fallbackError.message}`);
          setIsGenerating(false);
          throw fallbackError;
        }
      }
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      setError(`Video generation failed: ${error.response?.status || error.message}`);
      setIsGenerating(false);
      throw error;
    }
  }, []);

  // Alternative: Generate using image-to-video for more control
  const generateImageToVideo = useCallback(async ({ baseImage, audioTrack }) => {
    setIsGenerating(true);
    setError(null);

    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    try {
      console.log('🎬 Converting image to video with audio...');
      
      // Use Higgsfield Speech 2 Video for lip-sync
      const response = await axios.post(
        'https://api.segmind.com/v1/higgsfield-speech2video',
        {
          image: baseImage,
          audio: audioTrack,
          quality: 'high'
        },
        {
          headers: {
            'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'blob',
          timeout: 300000
        }
      );

      const videoUrl = URL.createObjectURL(response.data);
      
      const video = {
        id: `speech_video_${Date.now()}`,
        url: videoUrl,
        timestamp: new Date(),
        type: 'speech_to_video'
      };

      console.log('✅ Speech-to-video generated successfully');
      setIsGenerating(false);
      return video;

    } catch (error) {
      console.error('❌ Speech-to-video generation failed:', error);
      setError(`Speech-to-video failed: ${error.message}`);
      setIsGenerating(false);
      return null;
    }
  }, []);

  return {
    generateInterviewerImage,
    generateEmperorImage,
    generateFinalVideo,
    generateImageToVideo,
    isGenerating,
    error
  };
};

export default useVideoGeneration;
