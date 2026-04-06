import React, { useState, useEffect } from 'react';
import useImpossibleCoexistenceContent from '../hooks/useImpossibleCoexistenceContent';
import '../styles/impossible-coexistence.css';

const ImpossibleCoexistenceExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateImpossibleContent } = useImpossibleCoexistenceContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateImpossibleContent();
      setCurrentContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewImpossibility = () => {
    generateContent();
  };

  if (isLoading) {
    return (
      <div className="impossible-container">
        <div className="impossible-loading">
          <div className="reality-spinner"></div>
          <h2>Bending Reality...</h2>
          <p>Merging impossible worlds into one image</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="impossible-container">
        <div className="impossible-error">
          <h3>🌍 Reality Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="impossible-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="impossible-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="impossible-container">
      {/* Header */}
      <div className="impossible-header">
        <h1>🌍 Impossible Coexistence</h1>
        <p>When worlds collide in impossible harmony</p>
      </div>

      {/* Main Content */}
      <div className="impossible-main-content">
        <div className="impossible-content-panel">
          <div className="content-header">
            <h2>{currentContent?.heading}</h2>
            <p className="content-description">{currentContent?.description}</p>
          </div>
          
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="impossible-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🌍</div>
                <p>Impossible Reality Visualization</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="impossible-actions">
        <button onClick={handleNewImpossibility} className="impossible-btn primary">
          🔄 Generate Another Impossibility
        </button>
        <button onClick={onStop} className="impossible-btn secondary">
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

export default ImpossibleCoexistenceExperience;
