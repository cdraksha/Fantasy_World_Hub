import React, { useState } from 'react';
import useUselessPowersContent from '../hooks/useUselessPowersContent';
import '../styles/useless-powers.css';

const UselessPowersExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateUselessPowersContent, isGenerating, error } = useUselessPowersContent();

  const generateContent = async () => {
    try {
      const content = await generateUselessPowersContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate useless powers content:', err);
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
      <div className="useless-powers-container">
        <div className="useless-powers-loading">
          <div className="powers-spinner"></div>
          <h2>Discovering Useless Superpower...</h2>
          <p>Finding the most impractical abilities in the universe</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="useless-powers-container">
        <div className="useless-powers-error">
          <h3>Power Discovery Failed</h3>
          <p>{error}</p>
          <div className="useless-powers-actions">
            <button className="useless-powers-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="useless-powers-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="useless-powers-container">
      <div className="useless-powers-header">
        <h1>Useless Powers</h1>
        <p>The hilariously impractical side of superhero abilities</p>
      </div>

      {currentContent && (
        <div className="useless-powers-content">
          <div className="story-section">
            <h2>{currentContent.title}</h2>
            <div className="story-text">
              {currentContent.story}
            </div>
          </div>

          <div className="image-section">
            <img 
              src={currentContent.image.url} 
              alt="Useless superpower illustration"
              className="power-image"
            />
            <p className="image-caption">{currentContent.image.prompt}</p>
          </div>
        </div>
      )}

      <div className="useless-powers-actions">
        <button 
          className="useless-powers-btn primary"
          onClick={generateContent}
          disabled={isGenerating}
        >
          Discover New Useless Power
        </button>
        <button className="useless-powers-btn secondary" onClick={onStop}>
          Return to Hub
        </button>
      </div>

      <div className="model-attribution">
        <p>Powered by Segmind's Nano Banana for image generation</p>
      </div>
    </div>
  );
};

export default UselessPowersExperience;
