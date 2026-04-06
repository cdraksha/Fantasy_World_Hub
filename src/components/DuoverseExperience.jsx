import React, { useState, useEffect } from 'react';
import useDuoverseContent from '../hooks/useDuoverseContent';
import '../styles/duoverse.css';

const DuoverseExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateDuoverseContent, isGenerating, error } = useDuoverseContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateDuoverseContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate duoverse content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="duoverse-container">
        <div className="duoverse-loading">
          <div className="duoverse-spinner"></div>
          <h2>Calculating Reality Split...</h2>
          <p>Mapping parallel destinies across the Duoverse</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="duoverse-container">
        <div className="duoverse-error">
          <h3>🌍 Reality Fracture Detected</h3>
          <p>{error}</p>
          <div className="duoverse-actions">
            <button className="duoverse-btn primary" onClick={generateContent}>
              Repair Reality Split
            </button>
            <button className="duoverse-btn secondary" onClick={onStop}>
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
      <div className="duoverse-container">
        {/* Header */}
        <div className="duoverse-header">
          <h1>🌍 Duoverse</h1>
          <p>Where One Decision Splits Reality in Two</p>
        </div>

        {/* Content - Simple Layout */}
        <div className="duoverse-content">
          {/* Decision Moment - Top */}
          <div className="decision-moment">
            <h2>The Decision Moment</h2>
            <div className="image-container">
              <img 
                src={content.beforeImage.url} 
                alt="Decision moment"
                className="duoverse-image"
              />
            </div>
            <div className="decision-text">
              <p>{content.decision}</p>
            </div>
          </div>

          {/* Parallel Outcomes - Bottom */}
          <div className="parallel-outcomes">
            {/* Earth 1 */}
            <div className="outcome-panel earth1">
              <h2>Earth 1</h2>
              <div className="image-container">
                <img 
                  src={content.earth1.image.url} 
                  alt="Earth 1 outcome"
                  className="duoverse-image"
                />
              </div>
              <div className="outcome-text">
                <p>{content.earth1.description}</p>
              </div>
            </div>

            {/* Earth 2 */}
            <div className="outcome-panel earth2">
              <h2>Earth 2</h2>
              <div className="image-container">
                <img 
                  src={content.earth2.image.url} 
                  alt="Earth 2 outcome"
                  className="duoverse-image"
                />
              </div>
              <div className="outcome-text">
                <p>{content.earth2.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="duoverse-actions">
          <button 
            className="duoverse-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Splitting Reality...' : '🔄 Generate New Split'}
          </button>
          <button className="duoverse-btn secondary" onClick={onStop}>
            ← Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for parallel reality visuals</p>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="duoverse-container">
      <div className="duoverse-loading">
        <div className="duoverse-spinner"></div>
        <h2>Calculating Reality Split...</h2>
        <p>Mapping parallel destinies across the Duoverse</p>
      </div>
    </div>
  );
};

export default DuoverseExperience;
