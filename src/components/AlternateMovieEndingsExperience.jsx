import React, { useState, useEffect } from 'react';
import useAlternateMovieEndingsContent from '../hooks/useAlternateMovieEndingsContent';
import '../styles/alternate-movie-endings.css';

const AlternateMovieEndingsExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateAlternateMovieEndingContent } = useAlternateMovieEndingsContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateAlternateMovieEndingContent();
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
      <div className="alternate-movie-container">
        <div className="movie-loading">
          <div className="film-reel-spinner"></div>
          <h2>Rewriting Movie History...</h2>
          <p>Exploring alternate endings to beloved films...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alternate-movie-container">
        <div className="movie-error">
          <h3>🎬 Generation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="movie-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="movie-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alternate-movie-container">
      {/* Header */}
      <div className="movie-header">
        <h1>🎬 Alternate Movie Endings</h1>
        <p>What if your favorite films ended differently?</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="movie-main-content">
        {/* Story Text Box */}
        <div className="movie-story-panel">
          <div className="story-header">
            <h2>{currentContent?.movieTitle}</h2>
            <div className="story-meta">
              <span className="original-year">{currentContent?.originalYear}</span>
              <span className="alternate-tag">Alternate Ending</span>
            </div>
          </div>
          
          <div className="story-content">
            {currentContent?.alternateEnding.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Generated Image */}
        <div className="movie-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="movie-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🎭</div>
                <p>Alternate Scene</p>
              </div>
            )}
          </div>
          
          <div className="image-caption">
            <p>{currentContent?.image?.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="movie-actions">
        <button onClick={handleNewExperience} className="movie-btn primary">
          🔄 Generate New Ending
        </button>
        <button onClick={onStop} className="movie-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using Segmind GPT-4 for storytelling and Segmind Nano Banana for visuals</p>
      </div>
    </div>
  );
};

export default AlternateMovieEndingsExperience;
