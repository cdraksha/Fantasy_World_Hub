import React, { useState } from 'react';
import useFantasySkyscrapersContent from '../hooks/useFantasySkyscrapersContent';
import '../styles/fantasy-skyscrapers.css';

const FantasySkyscrapersExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateFantasySkyscrapersContent, isGenerating, error } = useFantasySkyscrapersContent();

  const generateContent = async () => {
    try {
      const content = await generateFantasySkyscrapersContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate fantasy skyscrapers content:', err);
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
      <div className="fantasy-skyscrapers-container">
        <div className="fantasy-skyscrapers-loading">
          <div className="tower-spinner"></div>
          <h2>Constructing Fantasy Skyscrapers...</h2>
          <p>Magical architects are building towers that touch the clouds</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fantasy-skyscrapers-container">
        <div className="fantasy-skyscrapers-error">
          <h3>Construction Failed</h3>
          <p>{error}</p>
          <div className="fantasy-skyscrapers-actions">
            <button className="fantasy-skyscrapers-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="fantasy-skyscrapers-btn secondary" onClick={onStop}>
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
      <div className="fantasy-skyscrapers-container">
        {/* Header */}
        <div className="fantasy-skyscrapers-header">
          <h1>🏗️ Fantasy Skyscrapers</h1>
          <p>Magical towers reaching beyond the clouds</p>
        </div>

        {/* Content */}
        <div className="fantasy-skyscrapers-content">
          {/* Description */}
          <div className="skyscraper-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="skyscraper-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="skyscraper-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="fantasy-skyscrapers-actions">
          <button 
            className="fantasy-skyscrapers-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Build New Tower
          </button>
          <button className="fantasy-skyscrapers-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for magical architecture</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="fantasy-skyscrapers-container">
      {/* Header */}
      <div className="fantasy-skyscrapers-header">
        <h1>🏗️ Fantasy Skyscrapers</h1>
        <p>Magical towers reaching beyond the clouds</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="fantasy-skyscrapers-loading">
        <div className="tower-spinner"></div>
        <h2>Constructing Fantasy Skyscrapers...</h2>
        <p>Magical architects are building towers that touch the clouds</p>
      </div>
    </div>
  );
};

export default FantasySkyscrapersExperience;
