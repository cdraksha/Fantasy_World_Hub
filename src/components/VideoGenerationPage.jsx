import React, { useState, useEffect } from 'react';
import '../styles/video-generation.css';

const VideoGenerationPage = ({ onReturn }) => {
  const [imageData, setImageData] = useState(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(115);
  const [progress, setProgress] = useState(0);
  const [showPromptEditor, setShowPromptEditor] = useState(true);

  useEffect(() => {
    // Get video generation data from localStorage
    const storedData = localStorage.getItem('video-generation-data');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setImageData(data);
        
        // Generate initial video prompt based on original image prompt
        generateVideoPrompt(data.originalPrompt);
        
        // Clean up localStorage
        localStorage.removeItem('video-generation-data');
      } catch (error) {
        console.error('Failed to parse video generation data:', error);
      }
    }
  }, []);

  const generateVideoPrompt = async (originalPrompt) => {
    try {
      const response = await fetch('https://api.segmind.com/v1/gpt-4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert at creating video prompts from image descriptions. Take the original image prompt and transform it into a dynamic video prompt that describes movement, animation, and cinematic elements. Keep it concise but vivid.'
            },
            {
              role: 'user',
              content: `Transform this image prompt into a video prompt with dynamic movement and cinematic elements: "${originalPrompt}"`
            }
          ],
          model: 'gpt-4',
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        setVideoPrompt(data.choices[0].message.content);
      } else {
        setVideoPrompt(`Dynamic cinematic movement of ${originalPrompt}, fluid animation, smooth transitions, cinematic camera work`);
      }
    } catch (error) {
      console.error('Failed to generate video prompt:', error);
      setVideoPrompt(`Dynamic cinematic movement of ${originalPrompt}, fluid animation, smooth transitions, cinematic camera work`);
    }
  };

  const startVideoGeneration = async () => {
    if (!imageData || !videoPrompt.trim()) return;

    setIsGenerating(true);
    setShowPromptEditor(false);
    setTimeRemaining(115);
    setProgress(0);

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        setProgress(((115 - newTime) / 115) * 100);
        
        if (newTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    try {
      // Convert image URL to blob then to base64
      const imageResponse = await fetch(imageData.imageUrl);
      const imageBlob = await imageResponse.blob();
      
      const imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(imageBlob);
      });

      // Generate video using Segmind LTX-2-19B-I2V
      const videoResponse = await fetch('https://api.segmind.com/v1/ltx-2-19b-i2v', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY
        },
        body: JSON.stringify({
          image: imageBase64,
          prompt: videoPrompt,
          negative_prompt: 'static, still, motionless, boring, low quality, blurry',
          width: 720,
          height: 1280,
          num_frames: 181,
          fps: 24,
          seed: 42,
          guidance_scale: 4
        })
      });

      if (videoResponse.ok) {
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        setGeneratedVideo({
          url: videoUrl,
          prompt: videoPrompt
        });
      } else {
        throw new Error('Video generation failed');
      }

    } catch (error) {
      console.error('Video generation error:', error);
      setGeneratedVideo({
        error: 'Video generation failed. Please try again.',
        prompt: videoPrompt
      });
    } finally {
      clearInterval(timer);
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (generatedVideo && generatedVideo.url) {
      const link = document.createElement('a');
      link.href = generatedVideo.url;
      link.download = `generated_video_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateAnother = () => {
    setGeneratedVideo(null);
    setShowPromptEditor(true);
    setTimeRemaining(115);
    setProgress(0);
  };

  if (!imageData) {
    return (
      <div className="video-generation-page">
        <div className="video-generation-container">
          <h1>🎬 Video Generation</h1>
          <p>No image data found. Please return to the Create Experience page and try again.</p>
          <button onClick={onReturn} className="return-button">
            🏠 Return to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-generation-page">
      <div className="video-generation-container">
        <h1>🎬 Video Generation from Image</h1>
        
        {/* Original Image Display */}
        <div className="original-image-section">
          <h3>Original Image:</h3>
          <div className="image-thumbnail">
            <img src={imageData.imageUrl} alt="Original generated image" />
          </div>
        </div>

        {/* Prompt Editor */}
        {showPromptEditor && (
          <div className="prompt-editor-section">
            <h3>Video Prompt:</h3>
            <textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              className="video-prompt-textarea"
              rows={4}
              placeholder="Describe the movement and animation you want to see..."
            />
            <div className="prompt-actions">
              <button 
                onClick={startVideoGeneration}
                disabled={!videoPrompt.trim()}
                className="generate-video-button"
              >
                🎬 Generate Video (115s)
              </button>
              <button onClick={onReturn} className="return-button">
                🏠 Return to Hub
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="video-loading-section">
            <div className="loading-header">
              <h2>🎬 Generating Video...</h2>
              <div className="time-remaining">{timeRemaining}s remaining</div>
            </div>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-text">{Math.round(progress)}%</div>
            </div>
            
            <div className="loading-spinner"></div>
            <p>Converting your image to video using AI...</p>
          </div>
        )}

        {/* Generated Video Display */}
        {generatedVideo && (
          <div className="generated-video-section">
            {generatedVideo.error ? (
              <div className="video-error">
                <h3>❌ Generation Failed</h3>
                <p>{generatedVideo.error}</p>
                <button onClick={generateAnother} className="try-again-button">
                  🔄 Try Again
                </button>
              </div>
            ) : (
              <div className="video-success">
                <h3>✅ Video Generated Successfully!</h3>
                <div className="video-player">
                  <video 
                    src={generatedVideo.url} 
                    controls 
                    loop
                    className="generated-video"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div className="video-details">
                  <h4>Video Prompt Used:</h4>
                  <p className="prompt-display">{generatedVideo.prompt}</p>
                </div>
                
                <div className="video-actions">
                  <button onClick={downloadVideo} className="download-button">
                    📥 Download Video
                  </button>
                  <button onClick={generateAnother} className="generate-another-button">
                    🔄 Generate Another
                  </button>
                  <button onClick={onReturn} className="return-button">
                    🏠 Return to Hub
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerationPage;
