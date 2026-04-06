import React, { useState, useEffect } from 'react';
import useTimeAnomalyContent from '../hooks/useTimeAnomalyContent';
import '../styles/time-anomaly.css';

const TimeAnomalyExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateTimeAnomalyContent } = useTimeAnomalyContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateTimeAnomalyContent();
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
      <div className="time-anomaly-container">
        <div className="time-anomaly-loading">
          <div className="time-anomaly-spinner"></div>
          <h2>Folding Time Layers...</h2>
          <p>Merging different eras into one moment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="time-anomaly-container">
        <div className="time-anomaly-error">
          <h3>⚡ Temporal Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="time-anomaly-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="time-anomaly-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="time-anomaly-container">
      {/* Header */}
      <div className="time-anomaly-header">
        <h1>⏰ Time Anomaly</h1>
        <p>When Different Eras Collide in One Moment</p>
      </div>

      {/* Main Content - Text Top, Image Bottom */}
      <div className="time-anomaly-main-content">
        {/* Description Text */}
        <div className="time-anomaly-text-panel">
          <div className="text-header">
            <h2>{currentContent?.title}</h2>
            <div className="time-periods">
              <span className="era-tag">{currentContent?.era1}</span>
              <span className="collision-symbol">⚡</span>
              <span className="era-tag">{currentContent?.era2}</span>
            </div>
          </div>
          
          <div className="text-content">
            <p>{currentContent?.description}</p>
          </div>
        </div>

        {/* Generated Image */}
        <div className="time-anomaly-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="time-anomaly-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🌀</div>
                <p>Temporal Collision</p>
              </div>
            )}
          </div>
          
          <div className="image-caption">
            <p>{currentContent?.image?.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="time-anomaly-actions">
        <button onClick={handleNewExperience} className="time-anomaly-btn primary">
          🔄 Generate New Time Anomaly
        </button>
        <button onClick={onStop} className="time-anomaly-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for temporal scenarios and Nano Banana via Segmind API for visuals</p>
      </div>
    </div>
  );
};

export default TimeAnomalyExperience;
