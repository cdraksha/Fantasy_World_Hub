import React, { useState, useEffect } from 'react';
import useEcumenopolisContent from '../hooks/useEcumenopolisContent';
import '../styles/ecumenopolis.css';

const EcumenopolisExplorer = ({ onStop }) => {
  const [error, setError] = useState(null);

  const { generateContent, isLoading, generatedContent } = useEcumenopolisContent();

  useEffect(() => {
    generateNewCityscape();
  }, []);

  const generateNewCityscape = async () => {
    setError(null);
    
    try {
      await generateContent();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="experience-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Constructing Ecumenopolis...</h2>
          <p>Merging Earth's cultures into planetary cityscape...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="experience-container">
        <div className="error-state">
          <h3>🏙️ Construction Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={generateNewCityscape} className="ecumenopolis-btn primary">
              Try Again
            </button>
            <button onClick={onStop} className="ecumenopolis-btn secondary">
              Back to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="experience-container">
      {/* Header */}
      <div className="experience-header">
        <h1>🏙️ Terran Ecumenopolis</h1>
        <p className="experience-tagline">
          Witness planet-wide cities where Earth's cultures converge in magnificent architectural fusion
        </p>
      </div>

      {/* Content */}
      <div className="content-section">
        {/* Description */}
        <div className="ecumenopolis-description">
          <p>{generatedContent?.description}</p>
        </div>

        {/* Generated Image */}
        <div className="image-container">
          <img 
            src={generatedContent?.image?.url} 
            alt="Multicultural Ecumenopolis Cityscape"
            className="generated-image"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ecumenopolis-actions">
        <button onClick={generateNewCityscape} className="ecumenopolis-btn primary">
          🔄 Generate New
        </button>
        <button onClick={onStop} className="ecumenopolis-btn secondary">
          ← Back
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using Segmind Nano Banana</p>
      </div>
    </div>
  );
};

export default EcumenopolisExplorer;
