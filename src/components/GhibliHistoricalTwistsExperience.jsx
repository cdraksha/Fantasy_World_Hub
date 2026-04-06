import React, { useState } from 'react';
import useGhibliHistoricalContent from '../hooks/useGhibliHistoricalContent';
import '../styles/ghibli-historical.css';

const GhibliHistoricalTwistsExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateGhibliHistoricalContent, isGenerating, error } = useGhibliHistoricalContent();

  const generateContent = async () => {
    try {
      const content = await generateGhibliHistoricalContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate Ghibli historical content:', err);
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
      <div className="ghibli-historical-container">
        <div className="ghibli-historical-loading">
          <div className="ghibli-spinner"></div>
          <h2>Weaving Magic into History...</h2>
          <p>Discovering the supernatural side of historical moments</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ghibli-historical-container">
        <div className="ghibli-historical-error">
          <h3>Magic Weaving Failed</h3>
          <p>{error}</p>
          <div className="ghibli-historical-actions">
            <button className="ghibli-historical-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="ghibli-historical-btn secondary" onClick={onStop}>
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
      <div className="ghibli-historical-container">
        {/* Header */}
        <div className="ghibli-historical-header">
          <h1>🌸 Ghibli Historical Twists</h1>
          <p>Where history meets gentle magic</p>
        </div>

        {/* Content */}
        <div className="ghibli-historical-content">
          {/* Description */}
          <div className="ghibli-description">
            <p>{currentContent?.description}</p>
          </div>

          {/* Image */}
          <div className="ghibli-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="ghibli-historical-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ghibli-historical-actions">
          <button 
            className="ghibli-historical-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Discover New Magic
          </button>
          <button className="ghibli-historical-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for storytelling and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="ghibli-historical-container">
      {/* Header */}
      <div className="ghibli-historical-header">
        <h1>🌸 Ghibli Historical Twists</h1>
        <p>Where history meets gentle magic</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="ghibli-historical-loading">
        <div className="ghibli-spinner"></div>
        <h2>Weaving Magic into History...</h2>
        <p>Discovering the supernatural side of historical moments</p>
      </div>
    </div>
  );
};

export default GhibliHistoricalTwistsExperience;
