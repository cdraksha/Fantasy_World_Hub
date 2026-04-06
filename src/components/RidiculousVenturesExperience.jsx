import React, { useState, useEffect } from 'react';
import useRidiculousVenturesContent from '../hooks/useRidiculousVenturesContent';
import '../styles/ridiculous-ventures.css';

const RidiculousVenturesExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateRidiculousVenturesContent, isGenerating, error } = useRidiculousVenturesContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateRidiculousVenturesContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate ridiculous ventures content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="ridiculous-ventures-container">
        <div className="ridiculous-ventures-loading">
          <div className="venture-spinner"></div>
          <h2>Brainstorming Ridiculous Ideas...</h2>
          <p>Generating absurd ventures for the future</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="ridiculous-ventures-container">
        <div className="ridiculous-ventures-error">
          <h3>💡 Innovation Failed</h3>
          <p>{error}</p>
          <div className="ridiculous-ventures-actions">
            <button className="ridiculous-ventures-btn primary" onClick={generateContent}>
              Generate New Venture
            </button>
            <button className="ridiculous-ventures-btn secondary" onClick={onStop}>
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
      <div className="ridiculous-ventures-container">
        {/* Header */}
        <div className="ridiculous-ventures-header">
          <h1>💡 Ridiculous Ventures for the Future</h1>
          <p>Absurd Business Ideas That Could Actually Happen</p>
        </div>

        {/* Main Content - Retro Futurism Layout */}
        <div className="ridiculous-ventures-content">
          {/* Left Side - Text */}
          <div className="venture-text-section">
            <div className="venture-title-container">
              <h2 className="venture-title">{content.title}</h2>
            </div>
            
            <div className="venture-description-container">
              <p className="venture-description">{content.description}</p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="venture-image-section">
            <div className="venture-image-container">
              <img 
                src={content.image.url} 
                alt={content.title}
                className="venture-image"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ridiculous-ventures-actions">
          <button 
            className="ridiculous-ventures-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Brainstorming...' : '🔄 Generate New Venture'}
          </button>
          <button className="ridiculous-ventures-btn secondary" onClick={onStop}>
            ← Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for ridiculous future business concepts</p>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="ridiculous-ventures-container">
      <div className="ridiculous-ventures-loading">
        <div className="venture-spinner"></div>
        <h2>Brainstorming Ridiculous Ideas...</h2>
        <p>Generating absurd ventures for the future</p>
      </div>
    </div>
  );
};

export default RidiculousVenturesExperience;
