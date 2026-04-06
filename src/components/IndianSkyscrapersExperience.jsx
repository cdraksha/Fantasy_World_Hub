import React, { useState, useEffect } from 'react';
import useIndianSkyscrapersContent from '../hooks/useIndianSkyscrapersContent';
import '../styles/indian-skyscrapers.css';

const IndianSkyscrapersExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateIndianSkyscrapersContent, isGenerating, error } = useIndianSkyscrapersContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateIndianSkyscrapersContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate Indian skyscrapers content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="indian-skyscrapers-container">
        <div className="indian-skyscrapers-loading">
          <div className="skyscraper-spinner"></div>
          <h2>Building Skyline...</h2>
          <p>Constructing India's tallest towers</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="indian-skyscrapers-container">
        <div className="indian-skyscrapers-error">
          <h3>🏗️ Construction Failed</h3>
          <p>{error}</p>
          <div className="indian-skyscrapers-actions">
            <button className="indian-skyscrapers-btn primary" onClick={generateContent}>
              Build New Tower
            </button>
            <button className="indian-skyscrapers-btn secondary" onClick={onStop}>
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
      <div className="indian-skyscrapers-container">
        {/* Header */}
        <div className="indian-skyscrapers-header">
          <h1>🏙️ Indian Skyscrapers</h1>
          <p>Towering Dreams of Modern India</p>
        </div>

        {/* Building Description */}
        <div className="building-description">
          <p>{content.description}</p>
        </div>

        {/* Main Image */}
        <div className="skyscraper-image-container">
          <img 
            src={content.image.url} 
            alt="Indian Skyscraper"
            className="skyscraper-image"
          />
        </div>

        {/* Actions */}
        <div className="indian-skyscrapers-actions">
          <button 
            className="indian-skyscrapers-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Building...' : '🔄 Build New Tower'}
          </button>
          <button className="indian-skyscrapers-btn secondary" onClick={onStop}>
            ← Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for realistic Indian cityscapes</p>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="indian-skyscrapers-container">
      <div className="indian-skyscrapers-loading">
        <div className="skyscraper-spinner"></div>
        <h2>Building Skyline...</h2>
        <p>Constructing India's tallest towers</p>
      </div>
    </div>
  );
};

export default IndianSkyscrapersExperience;
