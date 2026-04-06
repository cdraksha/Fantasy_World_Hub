import React, { useState, useEffect } from 'react';
import useFantasyCareersContent from '../hooks/useFantasyCareersContent';
import '../styles/fantasy-careers.css';

const FantasyCareersExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateFantasyCareersContent, isGenerating, error } = useFantasyCareersContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateFantasyCareersContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate fantasy careers content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="fantasy-careers-container">
        <div className="fantasy-careers-loading">
          <div className="careers-spinner"></div>
          <h2>Recruiting for Future Positions...</h2>
          <p>Scanning the job market for ridiculous career opportunities</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="fantasy-careers-container">
        <div className="fantasy-careers-error">
          <h3>Recruitment Failed</h3>
          <p>{error}</p>
          <div className="fantasy-careers-actions">
            <button className="fantasy-careers-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="fantasy-careers-btn secondary" onClick={onStop}>
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
      <div className="fantasy-careers-container">
        {/* Header */}
        <div className="fantasy-careers-header">
          <h1>💼 Futuristic Careers</h1>
          <p>Ridiculous jobs of the future</p>
        </div>

        {/* Content */}
        <div className="fantasy-careers-content">
          {/* Description */}
          <div className="careers-description">
            <p>{content.description}</p>
          </div>

          {/* Image */}
          <div className="careers-image-container">
            <img 
              src={content.image.url} 
              alt="Fantasy Career"
              className="careers-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="fantasy-careers-actions">
          <button 
            className="fantasy-careers-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Find New Career
          </button>
          <button className="fantasy-careers-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for career concepts and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="fantasy-careers-container">
      {/* Header */}
      <div className="fantasy-careers-header">
        <h1>💼 Futuristic Careers</h1>
        <p>Ridiculous jobs of the future</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="fantasy-careers-loading">
        <div className="careers-spinner"></div>
        <h2>Recruiting for Future Positions...</h2>
        <p>Scanning the job market for ridiculous career opportunities</p>
      </div>
    </div>
  );
};

export default FantasyCareersExperience;
