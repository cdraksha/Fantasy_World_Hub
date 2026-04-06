import React, { useState, useEffect } from 'react';
import useGirlInRedDressContent from '../hooks/useGirlInRedDressContent';
import '../styles/girl-in-red-dress.css';

const GirlInRedDressExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateGirlInRedDressContent } = useGirlInRedDressContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateGirlInRedDressContent();
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
      <div className="girl-red-dress-container">
        <div className="red-dress-loading">
          <div className="red-dress-spinner"></div>
          <h2>Preparing Eye-Trap Scenario...</h2>
          <p>Creating intentional visual anomalies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="girl-red-dress-container">
        <div className="red-dress-error">
          <h3>⚡ Generation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="red-dress-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="red-dress-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="girl-red-dress-container">
      {/* Header */}
      <div className="red-dress-header">
        <h1>🔴 Girl in the Red Dress</h1>
        <p>Where Do Your Eyes Really Go?</p>
      </div>

      {/* Main Content - Image Focused */}
      <div className="red-dress-main-content">
        {/* Generated Image */}
        <div className="red-dress-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="red-dress-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">👁️</div>
                <p>Eye-Trap Scenario</p>
              </div>
            )}
          </div>
        </div>

        {/* Eye-Trap Analysis */}
        <div className="red-dress-analysis">
          <div className="analysis-content">
            <p className="eye-trap-callout">{currentContent?.eyeTrapText}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="red-dress-actions">
        <button onClick={handleNewExperience} className="red-dress-btn primary">
          🔄 Generate New Eye-Trap
        </button>
        <button onClick={onStop} className="red-dress-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using Nano Banana via Segmind API for strategic eye-trap visuals</p>
      </div>
    </div>
  );
};

export default GirlInRedDressExperience;
