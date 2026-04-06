import React, { useState } from 'react';
import useDadJokesComediansContent from '../hooks/useDadJokesComediansContent';
import '../styles/dad-jokes-comedians.css';

const DadJokesComediansExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateDadJokesComediansContent, isGenerating, error } = useDadJokesComediansContent();

  const generateContent = async () => {
    try {
      const content = await generateDadJokesComediansContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate dad jokes comedians content:', err);
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
      <div className="dad-jokes-comedians-container">
        <div className="dad-jokes-comedians-loading">
          <div className="comedy-spinner"></div>
          <h2>Preparing Comedy Gold...</h2>
          <p>Comedians are crafting their finest dad jokes</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dad-jokes-comedians-container">
        <div className="dad-jokes-comedians-error">
          <h3>Comedy Show Cancelled</h3>
          <p>{error}</p>
          <div className="dad-jokes-comedians-actions">
            <button className="dad-jokes-comedians-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="dad-jokes-comedians-btn secondary" onClick={onStop}>
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
      <div className="dad-jokes-comedians-container">
        {/* Header */}
        <div className="dad-jokes-comedians-header">
          <h1>😂 Dad Jokes by Actual Comedians</h1>
          <p>Real comedians delivering dad humor in their signature styles</p>
        </div>

        {/* Content - Side by side layout */}
        <div className="dad-jokes-comedians-content">
          {/* Text Content - Left Side */}
          <div className="joke-content">
            <div className="comedian-name">
              <h2>{currentContent.comedian}</h2>
            </div>
            <div className="joke-text">
              <p>{currentContent.joke}</p>
            </div>
          </div>

          {/* Image Content - Right Side */}
          <div className="comedian-image-container">
            <img 
              src={currentContent.image.url} 
              alt={`Ghibli-style portrait of ${currentContent.comedian}`}
              className="comedian-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="dad-jokes-comedians-actions">
          <button 
            className="dad-jokes-comedians-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Next Comedian
          </button>
          <button className="dad-jokes-comedians-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for comedy writing and Nano Banana for Ghibli-style portraits</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="dad-jokes-comedians-container">
      {/* Header */}
      <div className="dad-jokes-comedians-header">
        <h1>😂 Dad Jokes by Actual Comedians</h1>
        <p>Real comedians delivering dad humor in their signature styles</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="dad-jokes-comedians-loading">
        <div className="comedy-spinner"></div>
        <h2>Preparing Comedy Gold...</h2>
        <p>Comedians are crafting their finest dad jokes</p>
      </div>
    </div>
  );
};

export default DadJokesComediansExperience;
