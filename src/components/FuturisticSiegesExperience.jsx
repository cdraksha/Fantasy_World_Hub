import React, { useState, useEffect } from 'react';
import useFuturisticSiegesContent from '../hooks/useFuturisticSiegesContent';
import '../styles/futuristic-sieges.css';

const FuturisticSiegesExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateFuturisticSiegeContent } = useFuturisticSiegesContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateFuturisticSiegeContent();
      setCurrentContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSiege = () => {
    generateContent();
  };

  if (isLoading) {
    return (
      <div className="siege-container">
        <div className="siege-loading">
          <div className="tactical-spinner"></div>
          <h2>Generating Futuristic Siege...</h2>
          <p>Analyzing tactical scenarios across time...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="siege-container">
        <div className="siege-error">
          <h3>⚡ Generation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="siege-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="siege-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="siege-container">
      {/* Header */}
      <div className="siege-header">
        <h1>🏙️ Futuristic Sieges</h1>
        <p>Urban Warfare in Tomorrow's World</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="siege-main-content">
        {/* Story Text Panel */}
        <div className="siege-story-panel">
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

        {/* Generated Image Panel */}
        <div className="siege-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="siege-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🏙️</div>
                <p>Futuristic Siege Vision</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="siege-actions">
        <button onClick={handleNewSiege} className="siege-btn primary">
          🔄 Generate New Siege
        </button>
        <button onClick={onStop} className="siege-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using Segmind GPT-4 for siege narratives and Segmind Nano Banana for warfare visuals</p>
      </div>
    </div>
  );
};

export default FuturisticSiegesExperience;
