import React, { useState } from 'react';
import useParacosmWorldsContent from '../hooks/useParacosmWorldsContent';
import '../styles/paracosm-worlds.css';

const ParacosmWorldsExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateParacosmWorldsContent, isGenerating, error } = useParacosmWorldsContent();

  const generateContent = async () => {
    try {
      const content = await generateParacosmWorldsContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate paracosm worlds content:', err);
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
      <div className="paracosm-worlds-container">
        <div className="paracosm-worlds-loading">
          <div className="imagination-spinner"></div>
          <h2>Entering Imaginary Realm...</h2>
          <p>Constructing personal mythology</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="paracosm-worlds-container">
        <div className="paracosm-worlds-error">
          <h3>Imagination Error</h3>
          <p>{error}</p>
          <div className="paracosm-worlds-actions">
            <button className="paracosm-worlds-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="paracosm-worlds-btn secondary" onClick={onStop}>
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
      <div className="paracosm-worlds-container">
        {/* Header */}
        <div className="paracosm-worlds-header">
          <h1>🌈 Paracosm Worlds</h1>
          <p>Beautiful imaginary worlds of the mind</p>
        </div>

        {/* Content Layout - Text Left, Image Right like Retro Futurism */}
        <div className="paracosm-worlds-content">
          {/* Text Content */}
          <div className="paracosm-text-section">
            <div className="paracosm-story">
              <h3>Your Imaginary World</h3>
              <div className="story-content">
                {currentContent.story.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="paracosm-image-section">
            <div className="paracosm-image-container">
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="paracosm-image"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="paracosm-worlds-actions">
          <button 
            className="paracosm-worlds-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Paracosm
          </button>
          <button className="paracosm-worlds-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for psychological scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="paracosm-worlds-container">
      {/* Header */}
      <div className="paracosm-worlds-header">
        <h1>🌈 Paracosm Worlds</h1>
        <p>Beautiful imaginary worlds of the mind</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="paracosm-worlds-loading">
        <div className="imagination-spinner"></div>
        <h2>Entering Imaginary Realm...</h2>
        <p>Constructing personal mythology</p>
      </div>
    </div>
  );
};

export default ParacosmWorldsExperience;
