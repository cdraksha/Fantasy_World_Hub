import React, { useState } from 'react';
import '../styles/tiberius-interview-improved.css';

const TiberiusInterviewImprovedPage = ({ onReturn }) => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(150);
  const [currentStep, setCurrentStep] = useState('');

  const generateContent = async () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    setGenerationProgress(0);
    setTimeRemaining(150);
    setCurrentStep('Preparing interview...');
    
    // Start countdown timer
    const startTime = Date.now();
    const totalTime = 150000; // 150 seconds total (30s text + 20s image + 100s video)
    
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

      // Step 1: Generate interview dialogue using Segmind GPT-4 (0-20%)
      setCurrentStep('Generating interview dialogue with Emperor Tiberius...');
      setGenerationProgress(5);
      
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
              content: 'You are creating dialogue for a 30-second futuristic news interview in the year 3125. Create a professional interview between a journalist and Emperor Tiberius Charlie Buchanan of the Greater Americas. The Emperor is 67 years old, dignified, forward-thinking, and slightly formal but approachable. Include subtle references to futuristic technology and the unique challenges of 3125 like Martian refugees, AI rights, interstellar politics, and governing a galactic empire. Keep it exactly 30 seconds when spoken (75-90 words total). Format as natural dialogue.'
            },
            {
              role: 'user',
              content: 'Create an engaging 30-second interview where Emperor Tiberius discusses one major challenge facing the galactic empire in 3125. Make it feel authentic and impactful.'
            }
          ],
          model: 'gpt-4',
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        generatedText = textData.choices[0].message.content;
        setGenerationProgress(20);
      }

      // Step 2: Generate Emperor Tiberius image using Segmind Nano Banana (20-40%)
      setCurrentStep('Generating Emperor Tiberius character...');
      
      const imageResponse = await fetch('https://api.segmind.com/v1/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          prompt: `Regal elderly man as Emperor Tiberius Charlie Buchanan, 67 years old, silver hair, cybernetic left eye, wearing futuristic imperial jacket with holographic insignias, deep blue and gold colors, energy patterns, sitting in throne-like chair, dignified posture, year 3125, imperial office background, photorealistic, 4K quality, cinematic lighting, professional portrait`,
          negative_prompt: 'blurry, low quality, distorted, cartoon, anime, modern clothing, casual wear, young person, multiple people',
          width: 720,
          height: 1280,
          num_inference_steps: 25,
          guidance_scale: 7.5
        })
      });

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        generatedImage = imageBlob;
        setGenerationProgress(40);
        console.log('Emperor image generated successfully');
      } else {
        const errorText = await imageResponse.text();
        console.error('Image generation failed:', imageResponse.status, errorText);
        throw new Error('Failed to generate Emperor image');
      }

      // Step 3: Generate video using Segmind LTX-2-19B-I2V (40-100%)
      setCurrentStep('Creating imperial interview video...');
      
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
          prompt: `Emperor Tiberius Charlie Buchanan speaking in professional news interview, futuristic imperial setting year 3125, slight head movements, talking, authoritative posture, dignified speaking gestures, holographic displays in background, professional lighting, imperial interview, regal bearing, cybernetic eye glowing softly`,
          negative_prompt: 'blurry, low quality, still frame, frames, watermark, overlay, titles, has blurbox, has subtitles, static, motionless, fast movement, dramatic gestures',
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
          description: "Emperor Tiberius interview in motion"
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
      setCurrentStep('Interview complete!');
      
    } catch (error) {
      console.error('Generation error:', error);
      clearInterval(timer);
      setGeneratedContent({
        text: "Generation failed. Please try again.",
        video: null
      });
      setCurrentStep('Generation failed');
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
    <div className="tiberius-interview-improved-page">
      <div className="tiberius-header">
        <h1>🎥 An Interview with Emperor Tiberius in the Year 3125</h1>
        <p className="tiberius-subtitle">New and Improved - Experience the future of imperial governance</p>
      </div>

      {/* Loading state with progress */}
      {isGenerating && (
        <div className="loading-section">
          <div className="interview-generation-progress">
            <div className="imperial-spinner"></div>
            <h2>🎬 Preparing Imperial Interview...</h2>
            <p>{currentStep}</p>
            
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
              <p>Generating interview content...</p>
            </div>
          </div>
        </div>
      )}

      {generatedContent && (
        <div className="interview-experience">
          {/* Interview Header */}
          <div className="interview-complete-header">
            <h2>🎬 Imperial Interview Complete!</h2>
            <p>Year 3125 - Emperor Tiberius Charlie Buchanan of the Greater Americas</p>
          </div>

          {/* Video Player Section */}
          <div className="video-player-section">
            {generatedContent.video && (
              <div className="enhanced-video-container">
                <video 
                  src={generatedContent.video.url} 
                  controls 
                  className="imperial-video"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Interview Dialogue */}
          {generatedContent.text && (
            <div className="dialogue-section">
              <h3>📝 Interview Dialogue</h3>
              <div className="dialogue-text">
                {generatedContent.text}
              </div>
            </div>
          )}

          {/* World Context Cards */}
          <div className="context-cards">
            <div className="context-card">
              <h3>👑 Emperor Tiberius Charlie Buchanan</h3>
              <p>67 years old, 6th year of reign</p>
              <p>Former Senator from Neo-California</p>
              <p>Cybernetic left eye, silver hair</p>
            </div>
            
            <div className="context-card">
              <h3>🌍 Greater Americas Empire</h3>
              <p>Unified territory from Alaska to Argentina</p>
              <p>Population: 1.2 billion citizens</p>
              <p>Capital: Neo-Washington D.C.</p>
            </div>
            
            <div className="context-card">
              <h3>📅 Year 3125 Context</h3>
              <p>Martian Refugee Crisis ongoing</p>
              <p>AI Rights Movement gaining momentum</p>
              <p>Interstellar governance challenges</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={generateContent} className="regenerate-button">
              🔄 Generate New Interview
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

export default TiberiusInterviewImprovedPage;
