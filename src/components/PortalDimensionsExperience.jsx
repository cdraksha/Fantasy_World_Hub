import React, { useState } from 'react';
import usePortalDimensionsContent from '../hooks/usePortalDimensionsContent';
import '../styles/portal-dimensions.css';

const PortalDimensionsExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generatePortalDimensionsContent, isGenerating, error } = usePortalDimensionsContent();

  const generateContent = async () => {
    try {
      const content = await generatePortalDimensionsContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate portal dimensions content:', err);
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
      <div className="portal-dimensions-container">
        <div className="portal-dimensions-loading">
          <div className="portal-spinner"></div>
          <h2>Opening Interdimensional Portals...</h2>
          <p>Channeling mystic energies to reveal other realities</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="portal-dimensions-container">
        <div className="portal-dimensions-error">
          <h3>Portal Opening Failed</h3>
          <p>{error}</p>
          <div className="portal-dimensions-actions">
            <button className="portal-dimensions-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="portal-dimensions-btn secondary" onClick={onStop}>
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
      <div className="portal-dimensions-container">
        {/* Header */}
        <div className="portal-dimensions-header">
          <h1>🌀 Portal Dimensions</h1>
          <p>Mystical gateways to other realities</p>
        </div>

        {/* Content */}
        <div className="portal-dimensions-content">
          {/* Description */}
          <div className="portal-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="portal-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="portal-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="portal-dimensions-actions">
          <button 
            className="portal-dimensions-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Open New Portal
          </button>
          <button className="portal-dimensions-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for dimensional concepts and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="portal-dimensions-container">
      {/* Header */}
      <div className="portal-dimensions-header">
        <h1>🌀 Portal Dimensions</h1>
        <p>Mystical gateways to other realities</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="portal-dimensions-loading">
        <div className="portal-spinner"></div>
        <h2>Opening Interdimensional Portals...</h2>
        <p>Channeling mystic energies to reveal other realities</p>
      </div>
    </div>
  );
};

export default PortalDimensionsExperience;
