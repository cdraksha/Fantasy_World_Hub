import React, { useState } from 'react';
import useDreamArchitectureContent from '../hooks/useDreamArchitectureContent';
import '../styles/dream-architecture.css';

const DreamArchitectureExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateDreamArchitectureContent, isGenerating, error } = useDreamArchitectureContent();

  const generateContent = async () => {
    try {
      const content = await generateDreamArchitectureContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate dream architecture content:', err);
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
      <div className="dream-architecture-container">
        <div className="dream-architecture-loading">
          <div className="dream-spinner"></div>
          <h2>Entering Dream State...</h2>
          <p>Constructing impossible architectures</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dream-architecture-container">
        <div className="dream-architecture-error">
          <h3>Dream Collapse Error</h3>
          <p>{error}</p>
          <div className="dream-architecture-actions">
            <button className="dream-architecture-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="dream-architecture-btn secondary" onClick={onStop}>
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
      <div className="dream-architecture-container">
        {/* Header */}
        <div className="dream-architecture-header">
          <h1>🏛️ Dream Architecture</h1>
          <p>Limbo structures beyond reality</p>
        </div>

        {/* Content */}
        <div className="dream-architecture-content">
          {/* Description */}
          <div className="dream-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="dream-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="dream-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="dream-architecture-actions">
          <button 
            className="dream-architecture-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Dream Architecture
          </button>
          <button className="dream-architecture-btn secondary" onClick={onStop}>
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
    <div className="dream-architecture-container">
      {/* Header */}
      <div className="dream-architecture-header">
        <h1>🏛️ Dream Architecture</h1>
        <p>Limbo structures beyond reality</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="dream-architecture-loading">
        <div className="dream-spinner"></div>
        <h2>Entering Dream State...</h2>
        <p>Constructing impossible architectures</p>
      </div>
    </div>
  );
};

export default DreamArchitectureExperience;
