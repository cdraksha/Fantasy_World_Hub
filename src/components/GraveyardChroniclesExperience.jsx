import React, { useState } from 'react';
import useGraveyardChroniclesContent from '../hooks/useGraveyardChroniclesContent';
import '../styles/graveyard-chronicles.css';

const GraveyardChroniclesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateGraveyardChroniclesContent, isGenerating, error } = useGraveyardChroniclesContent();

  const generateContent = async () => {
    try {
      const content = await generateGraveyardChroniclesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate graveyard chronicles content:', err);
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
      <div className="graveyard-chronicles-container">
        <div className="graveyard-chronicles-loading">
          <div className="graveyard-spinner"></div>
          <h2>Discovering Life Stories...</h2>
          <p>Listening to whispers from weathered headstones</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="graveyard-chronicles-container">
        <div className="graveyard-chronicles-error">
          <h3>Story Discovery Failed</h3>
          <p>{error}</p>
          <div className="graveyard-chronicles-actions">
            <button className="graveyard-chronicles-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="graveyard-chronicles-btn secondary" onClick={onStop}>
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
      <div className="graveyard-chronicles-container">
        {/* Header */}
        <div className="graveyard-chronicles-header">
          <h1>🪦 Graveyard Chronicles</h1>
          <p>Every headstone tells a story worth remembering</p>
        </div>

        {/* Content Layout - Text + Image */}
        <div className="graveyard-chronicles-content">
          {/* Left Side - Image */}
          <div className="graveyard-image-section">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="graveyard-image"
            />
          </div>

          {/* Right Side - Story */}
          <div className="graveyard-story-section">
            {/* Headstone Info */}
            <div className="headstone-info">
              <h2 className="person-name">{currentContent.name}</h2>
              <div className="life-dates">
                {currentContent.birthYear} - {currentContent.deathYear}
              </div>
              <div className="epitaph">"{currentContent.epitaph}"</div>
            </div>

            {/* Life Story */}
            <div className="life-story">
              <h3>Their Story</h3>
              <p>{currentContent.lifeStory}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="graveyard-chronicles-actions">
          <button 
            className="graveyard-chronicles-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Discover Another Story
          </button>
          <button className="graveyard-chronicles-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Segmind GPT-4 for biographical narratives and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="graveyard-chronicles-container">
      {/* Header */}
      <div className="graveyard-chronicles-header">
        <h1>🪦 Graveyard Chronicles</h1>
        <p>Every headstone tells a story worth remembering</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="graveyard-chronicles-loading">
        <div className="graveyard-spinner"></div>
        <h2>Discovering Life Stories...</h2>
        <p>Listening to whispers from weathered headstones</p>
      </div>
    </div>
  );
};

export default GraveyardChroniclesExperience;
