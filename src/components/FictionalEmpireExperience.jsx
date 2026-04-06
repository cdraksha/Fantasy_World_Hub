import React, { useState, useEffect } from 'react';
import useFictionalEmpireContent from '../hooks/useFictionalEmpireContent';
import '../styles/fictional-empire.css';

const FictionalEmpireExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateFictionalEmpireContent, isGenerating, error } = useFictionalEmpireContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateFictionalEmpireContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate fictional empire content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="fictional-empire-container">
        <div className="fictional-empire-loading">
          <div className="empire-spinner"></div>
          <h2>Forging New Empire...</h2>
          <p>Weaving the threads of history and legend</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="fictional-empire-container">
        <div className="fictional-empire-error">
          <h3>🏛️ Empire Creation Failed</h3>
          <p>{error}</p>
          <div className="fictional-empire-actions">
            <button className="fictional-empire-btn primary" onClick={generateContent}>
              Forge New Empire
            </button>
            <button className="fictional-empire-btn secondary" onClick={onStop}>
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
      <div className="fictional-empire-container">
        {/* Header */}
        <div className="fictional-empire-header">
          <h1>🏛️ Fictional Empire</h1>
          <p>Legendary Civilizations Born from Imagination</p>
        </div>

        {/* Content Layout - Text Left, Image Right */}
        <div className="fictional-empire-content">
          {/* Left Side - Empire Story */}
          <div className="empire-story-panel">
            <div className="empire-header">
              <h2>{content.name}</h2>
              <div className="empire-status">Status: LEGENDARY</div>
            </div>

            <div className="empire-backstory">
              <h3>📜 Origin Chronicle</h3>
              <div className="backstory-text">
                <p>{content.backstory}</p>
              </div>
            </div>
          </div>

          {/* Right Side - Empire Image */}
          <div className="empire-image-panel">
            <div className="image-container">
              <img 
                src={content.image.url} 
                alt={content.name}
                className="empire-image"
              />
            </div>
            <div className="image-caption">
              <p>The magnificent realm of {content.name}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="fictional-empire-actions">
          <button 
            className="fictional-empire-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Forging Empire...' : '🔄 Forge New Empire'}
          </button>
          <button className="fictional-empire-btn secondary" onClick={onStop}>
            ← Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for epic empire visuals</p>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="fictional-empire-container">
      <div className="fictional-empire-loading">
        <div className="empire-spinner"></div>
        <h2>Forging New Empire...</h2>
        <p>Weaving the threads of history and legend</p>
      </div>
    </div>
  );
};

export default FictionalEmpireExperience;
