import React, { useState, useEffect } from 'react';
import useFantasyTrapContent from '../hooks/useFantasyTrapContent';
import '../styles/fantasy-trap.css';

const FantasyTrapExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateFantasyTrapContent } = useFantasyTrapContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateFantasyTrapContent();
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
      <div className="fantasy-trap-container">
        <div className="trap-loading">
          <div className="thought-spinner"></div>
          <h2>Generating Perfect Comeback...</h2>
          <p>Crafting the response you wish you had said...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fantasy-trap-container">
        <div className="trap-error">
          <h3>💭 Generation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="trap-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="trap-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fantasy-trap-container">
      {/* Header */}
      <div className="trap-header">
        <h1>💭 Fantasy Trap</h1>
        <p>Perfect Comebacks You Wish You Had Said</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="trap-main-content">
        {/* Story Text Box */}
        <div className="trap-story-panel">
          <div className="story-header">
            <h2>{currentContent?.title}</h2>
            <div className="story-meta">
              <span className="situation">{currentContent?.situation}</span>
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
        <div className="trap-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="trap-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">💭</div>
                <p>Daydreaming Moment</p>
              </div>
            )}
          </div>
          
          <div className="image-caption">
            <p>{currentContent?.image?.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="trap-actions">
        <button onClick={handleNewExperience} className="trap-btn primary">
          🔄 Generate New Comeback
        </button>
        <button onClick={onStop} className="trap-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for comeback scenarios and Nano Banana via Segmind API for visuals</p>
      </div>
    </div>
  );
};

export default FantasyTrapExperience;
