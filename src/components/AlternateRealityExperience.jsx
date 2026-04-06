import React, { useState, useEffect } from 'react';
import useAlternateRealityContent from '../hooks/useAlternateRealityContent';
import '../styles/alternate-reality.css';

const AlternateRealityExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateAlternateContent } = useAlternateRealityContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateAlternateContent();
      setCurrentContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewReality = () => {
    generateContent();
  };

  if (isLoading) {
    return (
      <div className="alternate-container">
        <div className="alternate-loading">
          <div className="reality-spinner"></div>
          <h2>Bending Reality...</h2>
          <p>Creating impossible worlds and scenarios</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alternate-container">
        <div className="alternate-error">
          <h3>🌍 Reality Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="alternate-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="alternate-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alternate-container">
      {/* Header */}
      <div className="alternate-header">
        <h1>🌍 Alternate Reality</h1>
        <p>Imagine worlds where everything is wonderfully different</p>
      </div>

      {/* Main Content */}
      <div className="alternate-main-content">
        <div className="alternate-content-panel">
          <div className="content-header">
            <h2>{currentContent?.heading}</h2>
          </div>
          
          <div className="content-description">
            <p>{currentContent?.description}</p>
          </div>

          <div className="content-image">
            {currentContent?.imageUrl ? (
              <img 
                src={currentContent.imageUrl} 
                alt={currentContent.heading}
                className="generated-image"
                onLoad={() => console.log('🖼️ Alternate reality image loaded successfully')}
                onError={() => console.error('❌ Failed to load alternate reality image')}
              />
            ) : (
              <div className="image-placeholder">
                <span>🌍 Generating alternate reality...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="alternate-actions">
        <button onClick={handleNewReality} className="alternate-btn primary">
          🔄 Generate Another Reality
        </button>
        <button onClick={onStop} className="alternate-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for concepts and Nano Banana via Segmind API for visuals</p>
      </div>
    </div>
  );
};

export default AlternateRealityExperience;
