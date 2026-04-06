import React, { useState, useEffect } from 'react';
import useOrbitalMegastructuresContent from '../hooks/useOrbitalMegastructuresContent';
import '../styles/orbital-megastructures.css';

const OrbitalMegastructuresExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateOrbitalMegastructuresContent, isGenerating, error } = useOrbitalMegastructuresContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateOrbitalMegastructuresContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate orbital megastructures content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="orbital-megastructures-container">
        <div className="orbital-megastructures-loading">
          <div className="megastructures-spinner"></div>
          <h2>Constructing Orbital Megastructures...</h2>
          <p>Engineering impossible space infrastructure around Earth</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="orbital-megastructures-container">
        <div className="orbital-megastructures-error">
          <h3>Construction Failed</h3>
          <p>{error}</p>
          <div className="orbital-megastructures-actions">
            <button className="orbital-megastructures-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="orbital-megastructures-btn secondary" onClick={onStop}>
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
      <div className="orbital-megastructures-container">
        {/* Header */}
        <div className="orbital-megastructures-header">
          <h1>🌌 Orbital Megastructures</h1>
          <p>Massive space infrastructure around Earth</p>
        </div>

        {/* Content */}
        <div className="orbital-megastructures-content">
          {/* Description */}
          <div className="megastructures-description">
            <p>{content.description}</p>
          </div>

          {/* Image */}
          <div className="megastructures-image-container">
            <img 
              src={content.image.url} 
              alt="Orbital Megastructure"
              className="megastructures-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="orbital-megastructures-actions">
          <button 
            className="orbital-megastructures-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Megastructure
          </button>
          <button className="orbital-megastructures-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for engineering concepts and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="orbital-megastructures-container">
      {/* Header */}
      <div className="orbital-megastructures-header">
        <h1>🌌 Orbital Megastructures</h1>
        <p>Massive space infrastructure around Earth</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="orbital-megastructures-loading">
        <div className="megastructures-spinner"></div>
        <h2>Constructing Orbital Megastructures...</h2>
        <p>Engineering impossible space infrastructure around Earth</p>
      </div>
    </div>
  );
};

export default OrbitalMegastructuresExperience;
