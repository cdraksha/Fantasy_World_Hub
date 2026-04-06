import React, { useState, useEffect } from 'react';
import useUnderwaterCivilizationsContent from '../hooks/useUnderwaterCivilizationsContent';
import '../styles/underwater-civilizations.css';

const UnderwaterCivilizationsExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateUnderwaterCivilizationsContent, isGenerating, error } = useUnderwaterCivilizationsContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateUnderwaterCivilizationsContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate underwater civilizations content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="underwater-civilizations-container">
        <div className="underwater-civilizations-loading">
          <div className="underwater-spinner"></div>
          <h2>Diving into the Depths...</h2>
          <p>Exploring underwater biodomes and aquatic civilizations</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="underwater-civilizations-container">
        <div className="underwater-civilizations-error">
          <h3>Dive Failed</h3>
          <p>{error}</p>
          <div className="underwater-civilizations-actions">
            <button className="underwater-civilizations-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="underwater-civilizations-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content display
  if (content) {
    return (
      <div className="underwater-civilizations-container">
        {/* Header */}
        <div className="underwater-civilizations-header">
          <h1>🌊 Underwater Civilizations</h1>
          <p>Life beneath the waves in aquatic biodomes</p>
        </div>

        {/* Main Content - Side by Side */}
        <div className="underwater-main-content">
          {/* Story Text Panel */}
          <div className="underwater-story-panel">
            <div className="story-header">
              <h2>Underwater Life</h2>
            </div>
            
            <div className="story-content">
              <p>{content.story}</p>
            </div>
          </div>

          {/* Generated Image Panel */}
          <div className="underwater-image-panel">
            <div className="image-container">
              <img 
                src={content.image.url} 
                alt="Underwater Civilization"
                className="underwater-image"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="underwater-civilizations-actions">
          <button 
            className="underwater-civilizations-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Explore New Depths
          </button>
          <button className="underwater-civilizations-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for storytelling and Nano Banana via Segmind API for visuals</p>
        </div>

        {/* Inspiration Credit */}
        <div className="inspiration-credit">
          <p>Inspired by <a href="https://www.linkedin.com/in/rohitdraksha" target="_blank" rel="noopener noreferrer">Rohit Draksha</a>'s vision of underwater biodomes</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="underwater-civilizations-container">
      {/* Header */}
      <div className="underwater-civilizations-header">
        <h1>🌊 Underwater Civilizations</h1>
        <p>Life beneath the waves in aquatic biodomes</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="underwater-civilizations-loading">
        <div className="underwater-spinner"></div>
        <h2>Diving into the Depths...</h2>
        <p>Exploring underwater biodomes and aquatic civilizations</p>
      </div>
    </div>
  );
};

export default UnderwaterCivilizationsExperience;
