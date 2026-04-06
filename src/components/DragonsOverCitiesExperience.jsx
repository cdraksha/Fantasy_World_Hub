import React, { useState } from 'react';
import useDragonsOverCitiesContent from '../hooks/useDragonsOverCitiesContent';
import '../styles/dragons-over-cities.css';

const DragonsOverCitiesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateDragonsOverCitiesContent, isGenerating, error } = useDragonsOverCitiesContent();

  const generateContent = async () => {
    try {
      const content = await generateDragonsOverCitiesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate dragons over cities content:', err);
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
      <div className="dragons-cities-container">
        <div className="dragons-cities-loading">
          <div className="dragons-spinner"></div>
          <h2>Summoning Dragons Over Cities...</h2>
          <p>Ancient wyrms are awakening above the urban skyline</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dragons-cities-container">
        <div className="dragons-cities-error">
          <h3>Dragon Summoning Failed</h3>
          <p>{error}</p>
          <div className="dragons-cities-actions">
            <button className="dragons-cities-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="dragons-cities-btn secondary" onClick={onStop}>
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
      <div className="dragons-cities-container">
        {/* Header */}
        <div className="dragons-cities-header">
          <h1>🐉 Dragons Over Cities</h1>
          <p>Epic fantasy meets urban reality</p>
        </div>

        {/* Content */}
        <div className="dragons-cities-content">
          {/* Description */}
          <div className="dragons-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="dragons-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="dragons-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="dragons-cities-actions">
          <button 
            className="dragons-cities-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Dragon
          </button>
          <button className="dragons-cities-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for dragon scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="dragons-cities-container">
      {/* Header */}
      <div className="dragons-cities-header">
        <h1>🐉 Dragons Over Cities</h1>
        <p>Epic fantasy meets urban reality</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="dragons-cities-loading">
        <div className="dragons-spinner"></div>
        <h2>Summoning Dragons Over Cities...</h2>
        <p>Ancient wyrms are awakening above the urban skyline</p>
      </div>
    </div>
  );
};

export default DragonsOverCitiesExperience;
