import React, { useState, useEffect } from 'react';
import useSpaceWarsContent from '../hooks/useSpaceWarsContent';
import '../styles/retro-futurism.css';

const SpaceWarsExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateSpaceWarsContent } = useSpaceWarsContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateSpaceWarsContent();
      setCurrentContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewExperience = () => {
    generateContent();
  };

  if (isLoading) {
    return (
      <div className="retro-futurism-container">
        <div className="retro-loading">
          <div className="atomic-spinner"></div>
          <h2>Generating Space War Battle...</h2>
          <p>Preparing galactic conflict scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="retro-futurism-container">
        <div className="retro-error">
          <h3>⚡ Generation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="retro-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="retro-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-futurism-container">
      {/* Header */}
      <div className="retro-header">
        <h1>🚀 Space Wars</h1>
        <p>Epic Galactic Battles Across the Cosmos</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="retro-main-content">
        {/* Story Text Box */}
        <div className="retro-story-panel">
          <div className="story-header">
            <h2>{currentContent?.title}</h2>
            <div className="story-meta">
              <span className="era">{currentContent?.era}</span>
              <span className="location">{currentContent?.location}</span>
            </div>
          </div>
          
          <div className="story-content">
            {currentContent?.story.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Generated Image */}
        <div className="retro-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="retro-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">⚔️</div>
                <p>Space Battle Visualization</p>
              </div>
            )}
          </div>
          
          <div className="image-caption">
            <p>{currentContent?.image?.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="retro-actions">
        <button onClick={handleNewExperience} className="retro-btn primary">
          🔄 Generate New Battle
        </button>
        <button onClick={onStop} className="retro-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for storytelling and Nano Banana via Segmind API for visuals</p>
      </div>
    </div>
  );
};

export default SpaceWarsExperience;
