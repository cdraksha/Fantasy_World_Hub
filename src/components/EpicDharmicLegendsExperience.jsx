import React, { useState, useEffect } from 'react';
import useEpicDharmicLegendsContent from '../hooks/useEpicDharmicLegendsContent';
import '../styles/epic-dharmic-legends.css';

const EpicDharmicLegendsExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateEpicDharmicLegend, isGenerating, error } = useEpicDharmicLegendsContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateEpicDharmicLegend();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate epic dharmic legend:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="epic-dharmic-legends-container">
        <div className="epic-dharmic-legends-loading">
          <div className="divine-spinner"></div>
          <h2>Channeling Divine Legends...</h2>
          <p>Bringing epic Dharmic mythology to life</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="epic-dharmic-legends-container">
        <div className="epic-dharmic-legends-error">
          <h3>Divine Connection Lost</h3>
          <p>{error}</p>
          <div className="epic-dharmic-legends-actions">
            <button className="epic-dharmic-legends-btn primary" onClick={generateContent}>
              Reconnect to Divine
            </button>
            <button className="epic-dharmic-legends-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content display
  if (content) {
    return (
      <div className="epic-dharmic-legends-container">
        {/* Header */}
        <div className="epic-dharmic-legends-header">
          <h1>🕉️ Epic Dharmic Legends</h1>
          <p>Divine mythology brought to life in stunning detail</p>
        </div>

        {/* Main Content */}
        <div className="epic-dharmic-legends-content">
          {/* Legend Description */}
          <div className="legend-description">
            <p>{content.legendDescription}</p>
          </div>

          {/* Main Image Display */}
          <div className="legend-image-container">
            <img 
              src={content.image.url} 
              alt="Epic Dharmic Legend"
              className="legend-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="epic-dharmic-legends-actions">
          <button 
            className="epic-dharmic-legends-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Channeling Divine...' : 'New Epic Legend'}
          </button>
          <button className="epic-dharmic-legends-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for epic visual storytelling</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="epic-dharmic-legends-container">
      {/* Header */}
      <div className="epic-dharmic-legends-header">
        <h1>🕉️ Epic Dharmic Legends</h1>
        <p>Divine mythology brought to life in stunning detail</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="epic-dharmic-legends-loading">
        <div className="divine-spinner"></div>
        <h2>Channeling Divine Legends...</h2>
        <p>Bringing epic Dharmic mythology to life</p>
      </div>
    </div>
  );
};

export default EpicDharmicLegendsExperience;
