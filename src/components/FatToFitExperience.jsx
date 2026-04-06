import React, { useState, useEffect } from 'react';
import useFatToFitContent from '../hooks/useFatToFitContent';
import '../styles/fat-to-fit.css';

const FatToFitExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateFatToFitContent } = useFatToFitContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateFatToFitContent();
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
      <div className="fat-to-fit-container">
        <div className="fit-loading">
          <div className="muscle-spinner"></div>
          <h2>Generating Extreme Transformation...</h2>
          <p>Crafting impossible fitness journeys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fat-to-fit-container">
        <div className="fit-error">
          <h3>💪 Transformation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="fit-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="fit-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fat-to-fit-container">
      {/* Header */}
      <div className="fit-header">
        <h1>💪 Fat to Fit</h1>
        <p>Extreme Transformations Through Impossible Methods</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="fit-main-content">
        {/* Story Text Box */}
        <div className="fit-story-panel">
          <div className="story-header">
            <h2>{currentContent?.title}</h2>
            <div className="story-meta">
              <span className="method">{currentContent?.method}</span>
              <span className="timeframe">{currentContent?.timeframe}</span>
            </div>
          </div>
          
          <div className="story-content">
            {currentContent?.story.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Before and After Images */}
        <div className="fit-image-panel">
          {/* Before Image */}
          <div className="before-image-container">
            <div className="image-label">BEFORE</div>
            {currentContent?.beforeImage ? (
              <img 
                src={currentContent.beforeImage.url} 
                alt={currentContent.beforeImage.prompt}
                className="fit-image before-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">😔</div>
                <p>Before Transformation</p>
              </div>
            )}
          </div>
          
          {/* After Image */}
          <div className="after-image-container">
            <div className="image-label">AFTER</div>
            {currentContent?.afterImage ? (
              <img 
                src={currentContent.afterImage.url} 
                alt={currentContent.afterImage.prompt}
                className="fit-image after-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">💪</div>
                <p>After Transformation</p>
              </div>
            )}
          </div>
          
          <div className="image-caption">
            <p>{currentContent?.afterImage?.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fit-actions">
        <button onClick={handleNewExperience} className="fit-btn primary">
          🔄 Generate New Transformation
        </button>
        <button onClick={onStop} className="fit-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for transformation stories and Nano Banana via Segmind API for visuals</p>
      </div>
    </div>
  );
};

export default FatToFitExperience;
