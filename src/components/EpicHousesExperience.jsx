import React, { useState } from 'react';
import useEpicHousesContent from '../hooks/useEpicHousesContent';
import '../styles/epic-houses.css';

const EpicHousesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateEpicHousesContent, isGenerating, error } = useEpicHousesContent();

  const generateContent = async () => {
    try {
      const content = await generateEpicHousesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate epic houses content:', err);
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
      <div className="epic-houses-container">
        <div className="epic-houses-loading">
          <div className="houses-spinner"></div>
          <h2>Designing Epic House Modifications...</h2>
          <p>Creating realistic but amazing home improvements</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="epic-houses-container">
        <div className="epic-houses-error">
          <h3>House Design Failed</h3>
          <p>{error}</p>
          <div className="epic-houses-actions">
            <button className="epic-houses-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="epic-houses-btn secondary" onClick={onStop}>
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
      <div className="epic-houses-container">
        {/* Header */}
        <div className="epic-houses-header">
          <h1>🏠 Epic Houses</h1>
          <p>Realistic but amazing house modifications</p>
        </div>

        {/* Content */}
        <div className="epic-houses-content">
          {/* Description */}
          <div className="houses-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="houses-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="houses-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="epic-houses-actions">
          <button 
            className="epic-houses-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New House
          </button>
          <button className="epic-houses-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for house concepts and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="epic-houses-container">
      {/* Header */}
      <div className="epic-houses-header">
        <h1>🏠 Epic Houses</h1>
        <p>Realistic but amazing house modifications</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="epic-houses-loading">
        <div className="houses-spinner"></div>
        <h2>Designing Epic House Modifications...</h2>
        <p>Creating realistic but amazing home improvements</p>
      </div>
    </div>
  );
};

export default EpicHousesExperience;
