import React, { useState, useEffect } from 'react';
import useAnachronismContent from '../hooks/useAnachronismContent';
import '../styles/anachronism.css';

const AnachronismExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateAnachronisticContent } = useAnachronismContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateAnachronisticContent();
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
      <div className="anachronism-container">
        <div className="anachronism-loading">
          <div className="temporal-spinner"></div>
          <h2>Generating Anachronistic Experience...</h2>
          <p>Bending the fabric of time itself...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="anachronism-container">
        <div className="anachronism-error">
          <h3>⏰ Temporal Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="anachronism-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="anachronism-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="anachronism-container">
      {/* Header */}
      <div className="anachronism-header">
        <h1>⏰ Anachronism</h1>
        <p>When Future Meets Past</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="anachronism-main-content">
        {/* Story Text Box */}
        <div className="anachronism-story-panel">
          <div className="story-header">
            <h2>{currentContent?.title}</h2>
            <div className="story-meta">
              <span className="historical-period">{currentContent?.historicalPeriod}</span>
              <span className="modern-tech">{currentContent?.modernTech}</span>
            </div>
          </div>
          
          <div className="story-content">
            {currentContent?.story.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Generated Image */}
        <div className="anachronism-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="anachronism-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🕰️</div>
                <p>Temporal Paradox Visualization</p>
              </div>
            )}
          </div>
          
          <div className="image-caption">
            <p>{currentContent?.image?.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="anachronism-actions">
        <button onClick={handleNewExperience} className="anachronism-btn primary">
          🔄 Generate New Paradox
        </button>
        <button onClick={onStop} className="anachronism-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for storytelling and Google Imagen-4 via Segmind API for visuals</p>
      </div>
    </div>
  );
};

export default AnachronismExperience;
