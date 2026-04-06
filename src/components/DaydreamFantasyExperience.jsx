import React, { useState } from 'react';
import useDaydreamFantasyContent from '../hooks/useDaydreamFantasyContent';
import '../styles/daydream-fantasy.css';

const DaydreamFantasyExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateDaydreamFantasyContent, isGenerating, error } = useDaydreamFantasyContent();

  const generateContent = async () => {
    try {
      const content = await generateDaydreamFantasyContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate daydream fantasy content:', err);
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
      <div className="daydream-fantasy-container">
        <div className="daydream-fantasy-loading">
          <div className="fantasy-spinner"></div>
          <h2>Dreaming Beyond Reality...</h2>
          <p>Capturing that La La Land moment of pure fantasy</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="daydream-fantasy-container">
        <div className="daydream-fantasy-error">
          <h3>Fantasy Failed</h3>
          <p>{error}</p>
          <div className="daydream-fantasy-actions">
            <button className="daydream-fantasy-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="daydream-fantasy-btn secondary" onClick={onStop}>
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
      <div className="daydream-fantasy-container">
        {/* Header */}
        <div className="daydream-fantasy-header">
          <h1>🌟 Daydream Fantasy</h1>
          <p>Where humble beginnings meet grandiose dreams</p>
        </div>

        {/* Text Box on Top */}
        <div className="fantasy-description-box">
          <p>{currentContent.description}</p>
        </div>

        {/* Split-Screen Image */}
        <div className="fantasy-image-container">
          <img 
            src={currentContent.image.url} 
            alt={currentContent.image.description}
            className="fantasy-image"
          />
          
          {/* Labels for Left and Right */}
          <div className="fantasy-labels">
            <div className="fantasy-label left">Reality</div>
            <div className="fantasy-label right">Daydream</div>
          </div>
        </div>

        {/* Actions */}
        <div className="daydream-fantasy-actions">
          <button 
            className="daydream-fantasy-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Fantasy
          </button>
          <button className="daydream-fantasy-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for split-screen reality vs. fantasy imagery</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="daydream-fantasy-container">
      {/* Header */}
      <div className="daydream-fantasy-header">
        <h1>🌟 Daydream Fantasy</h1>
        <p>Where humble beginnings meet grandiose dreams</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="daydream-fantasy-loading">
        <div className="fantasy-spinner"></div>
        <h2>Dreaming Beyond Reality...</h2>
        <p>Capturing that La La Land moment of pure fantasy</p>
      </div>
    </div>
  );
};

export default DaydreamFantasyExperience;
