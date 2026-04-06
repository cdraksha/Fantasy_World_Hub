import React, { useState } from 'react';
import useUrbanOrigamiContent from '../hooks/useUrbanOrigamiContent';
import '../styles/urban-origami.css';

const UrbanOrigamiExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateUrbanOrigamiContent, isGenerating, error } = useUrbanOrigamiContent();

  const generateContent = async () => {
    try {
      const content = await generateUrbanOrigamiContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate urban origami content:', err);
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
      <div className="urban-origami-container">
        <div className="urban-origami-loading">
          <div className="origami-spinner"></div>
          <h2>Folding Architecture...</h2>
          <p>Creating paper cities</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="urban-origami-container">
        <div className="urban-origami-error">
          <h3>Fold Error</h3>
          <p>{error}</p>
          <div className="urban-origami-actions">
            <button className="urban-origami-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="urban-origami-btn secondary" onClick={onStop}>
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
      <div className="urban-origami-container">
        {/* Header */}
        <div className="urban-origami-header">
          <h1>📜 Urban Origami</h1>
          <p>Cities folded like paper</p>
        </div>

        {/* Content */}
        <div className="urban-origami-content">
          {/* Description */}
          <div className="origami-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="origami-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="origami-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="urban-origami-actions">
          <button 
            className="urban-origami-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Urban Origami
          </button>
          <button className="urban-origami-btn secondary" onClick={onStop}>
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
    <div className="urban-origami-container">
      {/* Header */}
      <div className="urban-origami-header">
        <h1>📜 Urban Origami</h1>
        <p>Cities folded like paper</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="urban-origami-loading">
        <div className="origami-spinner"></div>
        <h2>Folding Architecture...</h2>
        <p>Creating paper cities</p>
      </div>
    </div>
  );
};

export default UrbanOrigamiExperience;
