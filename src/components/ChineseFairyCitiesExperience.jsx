import React, { useState } from 'react';
import useChineseFairyCitiesContent from '../hooks/useChineseFairyCitiesContent';
import '../styles/chinese-fairy-cities.css';

const ChineseFairyCitiesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateChineseFairyCitiesContent, isGenerating, error } = useChineseFairyCitiesContent();

  const generateContent = async () => {
    try {
      const content = await generateChineseFairyCitiesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate Chinese fairy cities content:', err);
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
      <div className="chinese-fairy-cities-container">
        <div className="chinese-fairy-cities-loading">
          <div className="fairy-spinner"></div>
          <h2>Conjuring Chinese Fairy Cities...</h2>
          <p>Ancient pagodas are rising into the celestial realm</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="chinese-fairy-cities-container">
        <div className="chinese-fairy-cities-error">
          <h3>Fairy City Conjuring Failed</h3>
          <p>{error}</p>
          <div className="chinese-fairy-cities-actions">
            <button className="chinese-fairy-cities-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="chinese-fairy-cities-btn secondary" onClick={onStop}>
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
      <div className="chinese-fairy-cities-container">
        {/* Header */}
        <div className="chinese-fairy-cities-header">
          <h1>🏮 Chinese Fairy Cities</h1>
          <p>Mystical Chinese architecture meets magical enchantment</p>
        </div>

        {/* Content */}
        <div className="chinese-fairy-cities-content">
          {/* Description */}
          <div className="fairy-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="fairy-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="fairy-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="chinese-fairy-cities-actions">
          <button 
            className="chinese-fairy-cities-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Fairy City
          </button>
          <button className="chinese-fairy-cities-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Segmind GPT-4 for fairy city scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="chinese-fairy-cities-container">
      {/* Header */}
      <div className="chinese-fairy-cities-header">
        <h1>🏮 Chinese Fairy Cities</h1>
        <p>Mystical Chinese architecture meets magical enchantment</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="chinese-fairy-cities-loading">
        <div className="fairy-spinner"></div>
        <h2>Conjuring Chinese Fairy Cities...</h2>
        <p>Ancient pagodas are rising into the celestial realm</p>
      </div>
    </div>
  );
};

export default ChineseFairyCitiesExperience;
