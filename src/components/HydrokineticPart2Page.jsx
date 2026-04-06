import React, { useState } from 'react';
import '../styles/hydrokinetic-part2.css';

const HydrokineticPart2Page = ({ onReturn }) => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(135);

  const generateContent = async () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    setGenerationProgress(0);
    setTimeRemaining(135);
    
    // Start countdown timer
    const startTime = Date.now();
    const totalTime = 135000; // 135 seconds in milliseconds (20s image + 115s video)
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((totalTime - elapsed) / 1000));
      const progress = Math.min(100, (elapsed / totalTime) * 100);
      
      setTimeRemaining(remaining);
      setGenerationProgress(progress);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    try {
      let generatedText = null;
      let generatedImage = null;
      let generatedVideo = null;

      // Generate descriptive text using GPT-4
      const textResponse = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Generate a short 1-2 sentence description of someone using hydrokinetic water manipulation powers in motion. Keep it under 30 words, epic and cinematic like a movie scene. Focus on the dynamic movement and flow of water powers.'
            },
            {
              role: 'user',
              content: `Create a brief, cinematic description of hydrokinetic water powers in dynamic action. Make it mystical and inspired by flowing water manipulation abilities.`
            }
          ],
          model: 'gpt-4',
          max_tokens: 50,
          temperature: 0.8
        })
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
      }

      // First generate an image using Nano Banana
      console.log('Generating base image for video...');
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: `Hydrokinetic water manipulation powers, mystical water control abilities, person wielding water powers, flowing water streams, aquatic magic, oceanic energy, crystal clear water, bioluminescent water effects, temple of the sea atmosphere, Pokémon Ranger inspired, magical water bending, serene yet powerful, ethereal water spirits, cinematic lighting, highly detailed, fantasy art style`,
          negative_prompt: 'blurry, low quality, dark, muddy water, pollution, ugly, distorted, text, watermark, simple, boring',
          width: 720,
          height: 1280,
          num_inference_steps: 25,
          guidance_scale: 7.5
        })
      });

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        generatedImage = imageBlob;
        console.log('Base image generated successfully');
      } else {
        const errorText = await imageResponse.text();
        console.error('Image generation failed:', imageResponse.status, errorText);
        throw new Error('Failed to generate base image for video');
      }

      // Now generate video using LTX-2-19B-I2V with the generated image
      console.log('Starting video generation from image...');
      
      // Convert image blob to base64 for the API
      const imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(generatedImage);
      });
      
      const videoResponse = await fetch('https://api.segmind.com/v1/ltx-2-19b-i2v', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          image: imageBase64,
          prompt: `Hydrokinetic water manipulation powers in dynamic motion, person wielding flowing water streams, aquatic magic in action, oceanic energy waves, crystal clear water flowing and splashing, bioluminescent water effects moving, temple of the sea atmosphere, Pokémon Ranger inspired, magical water bending in motion, serene yet powerful water control, ethereal water spirits dancing, cinematic lighting, highly detailed, fantasy water magic`,
          negative_prompt: 'blurry, low quality, still frame, frames, watermark, overlay, titles, has blurbox, has subtitles, static, motionless',
          width: 720,
          height: 1280,
          num_frames: 181,
          fps: 24,
          seed: 42,
          guidance_scale: 4
        })
      });

      console.log('Video response status:', videoResponse.status);
      
      if (videoResponse.ok) {
        const videoBlob = await videoResponse.blob();
        console.log('Video blob size:', videoBlob.size);
        generatedVideo = {
          url: URL.createObjectURL(videoBlob),
          description: "Hydrokinetic abilities in motion"
        };
        console.log('Video generated successfully');
      } else {
        const errorText = await videoResponse.text();
        console.error('Video generation failed:', videoResponse.status, errorText);
      }

      clearInterval(timer);
      setGeneratedContent({
        text: generatedText,
        video: generatedVideo
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      clearInterval(timer);
      setGeneratedContent({
        text: "Generation failed. Please try again with a different scenario.",
        video: null
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
      setTimeRemaining(0);
    }
  };

  // Auto-generate content on mount
  React.useEffect(() => {
    if (!generatedContent && !isGenerating) {
      generateContent();
    }
  }, []);

  return (
    <div className="hydrokinetic-part2-page">
      <div className="hydrokinetic-header">
        <h1>🌊 Hydrokinetic Abilities - Part 2</h1>
        <p className="hydrokinetic-subtitle">Experience the dynamic flow of water manipulation</p>
      </div>

      {/* Loading state with progress */}
      {isGenerating && (
        <div className="loading-section">
          <div className="video-generation-progress">
            <div className="water-waves"></div>
            <h2>🌊 Channeling Dynamic Water Powers...</h2>
            <p>Generating image, then weaving motion into reality...</p>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {Math.round(generationProgress)}% Complete
              </div>
            </div>
            
            <div className="countdown-timer">
              <div className="timer-circle">
                <span className="timer-text">{timeRemaining}s</span>
              </div>
              <p>Video generation in progress...</p>
            </div>
          </div>
        </div>
      )}

      {generatedContent && (
        <div className="content-display">
          {generatedContent.text && (
            <div className="text-content">
              <p>{generatedContent.text}</p>
            </div>
          )}
          
          {generatedContent.video && (
            <div className="video-content">
              <video 
                src={generatedContent.video.url} 
                controls 
                loop 
                muted
                autoPlay
                className="generated-video"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          <div className="action-buttons">
            <button onClick={generateContent} className="regenerate-button">
              🔄 Generate New Vision
            </button>
            <button onClick={onReturn} className="return-button">
              🏠 Return to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HydrokineticPart2Page;
