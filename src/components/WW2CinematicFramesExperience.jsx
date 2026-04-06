import React, { useState } from 'react';
import useWW2CinematicFramesContent from '../hooks/useWW2CinematicFramesContent';
import '../styles/ww2-cinematic-frames.css';

const WW2CinematicFramesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateWW2CinematicFramesContent, isGenerating, error } = useWW2CinematicFramesContent();

  const generateContent = async () => {
    try {
      const content = await generateWW2CinematicFramesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate WW2 cinematic frames content:', err);
    }
  };

  // Auto-generate first content on mount
  React.useEffect(() => {
    if (!currentContent && !isGenerating && !error) {
      generateContent();
    }
  }, []);

  // Loading state
  if (isGenerating) {
    return (
      <div className="ww2-frames-container">
        <div className="ww2-frames-loading">
          <div className="frames-spinner"></div>
          <h2>Capturing Cinematic Moments...</h2>
          <p>Framing the human drama of World War 2</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ww2-frames-container">
        <div className="ww2-frames-error">
          <h3>Frame Capture Failed</h3>
          <p>{error}</p>
          <div className="ww2-frames-actions">
            <button className="ww2-frames-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="ww2-frames-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content view
  if (currentContent) {
    return (
      <div className="ww2-frames-container">
        {/* Header */}
        <div className="ww2-frames-header">
          <h1>🎬 WW2 Cinematic Frames</h1>
          <p>Dunkirk-inspired moments from the global war</p>
        </div>

        {/* Content */}
        <div className="ww2-frames-content">
          {/* Description */}
          <div className="frames-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="frames-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="frames-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ww2-frames-actions">
          <button 
            className="ww2-frames-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Frame
          </button>
          <button className="ww2-frames-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for historical scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="ww2-frames-container">
      {/* Header */}
      <div className="ww2-frames-header">
        <h1>🎬 WW2 Cinematic Frames</h1>
        <p>Dunkirk-inspired moments from the global war</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="ww2-frames-loading">
        <div className="frames-spinner"></div>
        <h2>Capturing Cinematic Moments...</h2>
        <p>Framing the human drama of World War 2</p>
      </div>
    </div>
  );
};

export default WW2CinematicFramesExperience;
