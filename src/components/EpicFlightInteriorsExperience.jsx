import React, { useState } from 'react';
import useEpicFlightInteriorsContent from '../hooks/useEpicFlightInteriorsContent';
import '../styles/epic-flight-interiors.css';

const EpicFlightInteriorsExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateEpicFlightInteriorsContent, isGenerating, error } = useEpicFlightInteriorsContent();

  const generateContent = async () => {
    try {
      const content = await generateEpicFlightInteriorsContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate epic flight interiors content:', err);
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
      <div className="epic-flight-interiors-container">
        <div className="epic-flight-interiors-loading">
          <div className="aircraft-spinner"></div>
          <h2>Boarding Impossible Aircraft...</h2>
          <p>Preparing magical interiors that defy physics and space</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="epic-flight-interiors-container">
        <div className="epic-flight-interiors-error">
          <h3>Flight Delayed</h3>
          <p>{error}</p>
          <div className="epic-flight-interiors-actions">
            <button className="epic-flight-interiors-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="epic-flight-interiors-btn secondary" onClick={onStop}>
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
      <div className="epic-flight-interiors-container">
        {/* Header */}
        <div className="epic-flight-interiors-header">
          <h1>✈️ Epic Flight Interiors</h1>
          <p>Normal aircraft hiding impossible magical interiors</p>
        </div>

        {/* Content */}
        <div className="epic-flight-interiors-content">
          {/* Description */}
          <div className="flight-interior-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="flight-interior-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="flight-interior-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="epic-flight-interiors-actions">
          <button 
            className="epic-flight-interiors-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Board Another Flight
          </button>
          <button className="epic-flight-interiors-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for impossible aircraft interiors</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="epic-flight-interiors-container">
      {/* Header */}
      <div className="epic-flight-interiors-header">
        <h1>✈️ Epic Flight Interiors</h1>
        <p>Normal aircraft hiding impossible magical interiors</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="epic-flight-interiors-loading">
        <div className="aircraft-spinner"></div>
        <h2>Boarding Impossible Aircraft...</h2>
        <p>Preparing magical interiors that defy physics and space</p>
      </div>
    </div>
  );
};

export default EpicFlightInteriorsExperience;
