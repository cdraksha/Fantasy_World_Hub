import React, { useState } from 'react';
import useFoldingCitiesContent from '../hooks/useFoldingCitiesContent';
import '../styles/folding-cities.css';

const FoldingCitiesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateFoldingCitiesContent, isGenerating, error } = useFoldingCitiesContent();

  const generateContent = async () => {
    try {
      const content = await generateFoldingCitiesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate folding cities content:', err);
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
      <div className="folding-cities-container">
        <div className="folding-cities-loading">
          <div className="architecture-spinner"></div>
          <h2>Folding Reality...</h2>
          <p>Bending the laws of architecture and physics</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="folding-cities-container">
        <div className="folding-cities-error">
          <h3>Reality Fold Error</h3>
          <p>{error}</p>
          <div className="folding-cities-actions">
            <button className="folding-cities-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="folding-cities-btn secondary" onClick={onStop}>
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
      <div className="folding-cities-container">
        {/* Header */}
        <div className="folding-cities-header">
          <h1>🏗️ Folding Cities</h1>
          <p>Where architecture defies reality</p>
        </div>

        {/* Content */}
        <div className="folding-cities-content">
          {/* Description */}
          <div className="cities-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="cities-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="cities-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="folding-cities-actions">
          <button 
            className="folding-cities-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Folding City
          </button>
          <button className="folding-cities-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="folding-cities-container">
      {/* Header */}
      <div className="folding-cities-header">
        <h1>🏗️ Folding Cities</h1>
        <p>Where architecture defies reality</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="folding-cities-loading">
        <div className="architecture-spinner"></div>
        <h2>Folding Reality...</h2>
        <p>Bending the laws of architecture and physics</p>
      </div>
    </div>
  );
};

export default FoldingCitiesExperience;
