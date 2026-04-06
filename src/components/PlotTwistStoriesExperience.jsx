import React, { useState, useEffect } from 'react';
import usePlotTwistContent from '../hooks/usePlotTwistContent';
import '../styles/plot-twist.css';

const PlotTwistStoriesExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generatePlotTwistContent } = usePlotTwistContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generatePlotTwistContent();
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
      <div className="plot-twist-container">
        <div className="plot-twist-loading">
          <div className="twist-spinner"></div>
          <h2>Generating Plot Twist Story...</h2>
          <p>Crafting the perfect mind-bending twist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plot-twist-container">
        <div className="plot-twist-error">
          <h3>🤯 Plot Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="plot-twist-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="plot-twist-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plot-twist-container">
      {/* Header */}
      <div className="plot-twist-header">
        <h1>🤯 Plot Twist Stories</h1>
        <p>500-word stories with endings that will blow your mind</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="plot-twist-main-content">
        {/* Story Panel */}
        <div className="plot-twist-story-panel">
          <div className="story-header">
            <h2>{currentContent?.title}</h2>
            <div className="story-meta">
              <span className="genre">{currentContent?.genre}</span>
              <span className="twist-type">{currentContent?.twistType}</span>
            </div>
          </div>
          
          <div className="story-content">
            {currentContent?.story.split('\n\n').filter(paragraph => paragraph.trim()).map((paragraph, index) => (
              <p key={index}>{paragraph.trim()}</p>
            ))}
          </div>
        </div>

        {/* Image Panel */}
        <div className="plot-twist-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="plot-twist-image"
              />
            ) : (
              <div className="image-placeholder">
                <span>🎨 Dramatic scene will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="plot-twist-actions">
        <button 
          onClick={handleNewExperience} 
          className="plot-twist-btn primary"
        >
          🔄 Generate Another Twist
        </button>
        <button onClick={onStop} className="plot-twist-btn secondary">
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

export default PlotTwistStoriesExperience;
