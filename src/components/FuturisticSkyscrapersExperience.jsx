import React, { useState } from 'react';
import useFuturisticSkyscrapersContent from '../hooks/useFuturisticSkyscrapersContent';
import '../styles/futuristic-skyscrapers.css';

const FuturisticSkyscrapersExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateFuturisticSkyscrapersContent, isGenerating, error } = useFuturisticSkyscrapersContent();

  const generateContent = async () => {
    try {
      const content = await generateFuturisticSkyscrapersContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate futuristic skyscrapers content:', err);
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
      <div className="futuristic-skyscrapers-container">
        <div className="futuristic-skyscrapers-loading">
          <div className="city-spinner"></div>
          <h2>Building Near-Future Towers...</h2>
          <p>Advanced engineers are designing realistic 300+ floor skyscrapers</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="futuristic-skyscrapers-container">
        <div className="futuristic-skyscrapers-error">
          <h3>Construction Failed</h3>
          <p>{error}</p>
          <div className="futuristic-skyscrapers-actions">
            <button className="futuristic-skyscrapers-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="futuristic-skyscrapers-btn secondary" onClick={onStop}>
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
      <div className="futuristic-skyscrapers-container">
        {/* Header */}
        <div className="futuristic-skyscrapers-header">
          <h1>🌆 Futuristic Skyscrapers</h1>
          <p>300+ floor towers that could exist in 30 years</p>
        </div>

        {/* Content */}
        <div className="futuristic-skyscrapers-content">
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
        <div className="futuristic-skyscrapers-actions">
          <button 
            className="futuristic-skyscrapers-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Build New Megastructure
          </button>
          <button className="futuristic-skyscrapers-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for futuristic architecture</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="futuristic-skyscrapers-container">
      {/* Header */}
      <div className="futuristic-skyscrapers-header">
        <h1>🌆 Futuristic Skyscrapers</h1>
        <p>Tomorrow's megastructures in advanced future cities</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="futuristic-skyscrapers-loading">
        <div className="city-spinner"></div>
        <h2>Building Future Cities...</h2>
        <p>Advanced architects are designing tomorrow's megastructures</p>
      </div>
    </div>
  );
};

export default FuturisticSkyscrapersExperience;
