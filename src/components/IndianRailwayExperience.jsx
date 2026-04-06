import React, { useState, useEffect } from 'react';
import useIndianRailwayContent from '../hooks/useIndianRailwayContent';
import '../styles/indian-railway.css';

const IndianRailwayExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateIndianRailwayContent, isGenerating, error } = useIndianRailwayContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateIndianRailwayContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate Indian railway content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="indian-railway-container">
        <div className="indian-railway-loading">
          <div className="train-spinner"></div>
          <h2>Building Railway Network...</h2>
          <p>Constructing India's modern rail infrastructure</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="indian-railway-container">
        <div className="indian-railway-error">
          <h3>🚄 Construction Delayed</h3>
          <p>{error}</p>
          <div className="indian-railway-actions">
            <button className="indian-railway-btn primary" onClick={generateContent}>
              Build New Station
            </button>
            <button className="indian-railway-btn secondary" onClick={onStop}>
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
      <div className="indian-railway-container">
        {/* Header */}
        <div className="indian-railway-header">
          <h1>🚄 Indian Railway Stations</h1>
          <p>Modern Rail Infrastructure for New India</p>
        </div>

        {/* Station Description */}
        <div className="station-description">
          <p>{content.description}</p>
        </div>

        {/* Main Image */}
        <div className="railway-image-container">
          <img 
            src={content.image.url} 
            alt="Indian Railway Station"
            className="railway-image"
          />
        </div>

        {/* Actions */}
        <div className="indian-railway-actions">
          <button 
            className="indian-railway-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Building...' : '🔄 Build New Station'}
          </button>
          <button className="indian-railway-btn secondary" onClick={onStop}>
            ← Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for modern railway infrastructure</p>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="indian-railway-container">
      <div className="indian-railway-loading">
        <div className="train-spinner"></div>
        <h2>Building Railway Network...</h2>
        <p>Constructing India's modern rail infrastructure</p>
      </div>
    </div>
  );
};

export default IndianRailwayExperience;
