import React, { useState, useEffect } from 'react';
import useModernMahabharataContent from '../hooks/useModernMahabharataContent';
import '../styles/modern-mahabharata.css';

const ModernMahabharataExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateModernMahabharataContent, isGenerating, error } = useModernMahabharataContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateModernMahabharataContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate modern Mahabharata content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="modern-mahabharata-container">
        <div className="modern-mahabharata-loading">
          <div className="warrior-spinner"></div>
          <h2>Deploying Warriors...</h2>
          <p>Preparing the Pandavas for modern combat</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="modern-mahabharata-container">
        <div className="modern-mahabharata-error">
          <h3>⚔️ Mission Failed</h3>
          <p>{error}</p>
          <div className="modern-mahabharata-actions">
            <button className="modern-mahabharata-btn primary" onClick={generateContent}>
              Deploy New Mission
            </button>
            <button className="modern-mahabharata-btn secondary" onClick={onStop}>
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
      <div className="modern-mahabharata-container">
        {/* Header */}
        <div className="modern-mahabharata-header">
          <h1>⚔️ Modern Mahabharata</h1>
          <p>Ancient Warriors in Contemporary Combat</p>
        </div>

        {/* Combat Description */}
        <div className="combat-description">
          <p>{content.description}</p>
        </div>

        {/* Main Image */}
        <div className="combat-image-container">
          <img 
            src={content.image.url} 
            alt="Modern Mahabharata Combat"
            className="combat-image"
          />
        </div>

        {/* Actions */}
        <div className="modern-mahabharata-actions">
          <button 
            className="modern-mahabharata-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Deploying...' : '🔄 Deploy New Mission'}
          </button>
          <button className="modern-mahabharata-btn secondary" onClick={onStop}>
            ← Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for epic modern warfare visuals</p>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="modern-mahabharata-container">
      <div className="modern-mahabharata-loading">
        <div className="warrior-spinner"></div>
        <h2>Deploying Warriors...</h2>
        <p>Preparing the Pandavas for modern combat</p>
      </div>
    </div>
  );
};

export default ModernMahabharataExperience;
