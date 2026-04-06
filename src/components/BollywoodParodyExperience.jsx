import React, { useState } from 'react';
import useBollywoodParodyContent from '../hooks/useBollywoodParodyContent';
import '../styles/bollywood-parody.css';

const BollywoodParodyExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateBollywoodParodyContent, isGenerating, error } = useBollywoodParodyContent();

  const generateContent = async () => {
    try {
      const content = await generateBollywoodParodyContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate Bollywood parody content:', err);
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
      <div className="bollywood-parody-container">
        <div className="bollywood-parody-loading">
          <div className="bollywood-spinner"></div>
          <h2>Creating Bollywood Posters...</h2>
          <p>Translating English movies into hilarious Hindi titles</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bollywood-parody-container">
        <div className="bollywood-parody-error">
          <h3>Bollywood Magic Failed</h3>
          <p>{error}</p>
          <div className="bollywood-parody-actions">
            <button className="bollywood-parody-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="bollywood-parody-btn secondary" onClick={onStop}>
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
      <div className="bollywood-parody-container">
        {/* Header */}
        <div className="bollywood-parody-header">
          <h1>🎬 Bollywood Posters</h1>
          <p>English movies as hilarious Hindi poster translations</p>
        </div>

        {/* Content */}
        <div className="bollywood-parody-content">
          {/* Description */}
          <div className="parody-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="parody-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="parody-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bollywood-parody-actions">
          <button 
            className="bollywood-parody-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Poster
          </button>
          <button className="bollywood-parody-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="bollywood-parody-container">
      {/* Header */}
      <div className="bollywood-parody-header">
        <h1>🎬 Bollywood Parody</h1>
        <p>Hollywood scenes with masala comedy twist</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="bollywood-parody-loading">
        <div className="bollywood-spinner"></div>
        <h2>Adding Masala to Hollywood...</h2>
        <p>Preparing over-the-top Bollywood comedy magic</p>
      </div>
    </div>
  );
};

export default BollywoodParodyExperience;
