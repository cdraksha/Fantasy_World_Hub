import React, { useState } from 'react';
import useRoboticFusionContent from '../hooks/useRoboticFusionContent';
import '../styles/robotic-fusion.css';

const RoboticFusionExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateRoboticFusionContent, isGenerating, error } = useRoboticFusionContent();

  const generateContent = async () => {
    try {
      const content = await generateRoboticFusionContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate robotic fusion content:', err);
    }
  };

  // Auto-generate first content on mount
  React.useEffect(() => {
    if (!currentContent && !isGenerating && !error) {
      generateContent();
    }
  }, []);

  // Loading state
  if (isGenerating) {
    return (
      <div className="robotic-fusion-container">
        <div className="robotic-fusion-loading">
          <div className="fusion-spinner"></div>
          <h2>Integrating Robotic Enhancements...</h2>
          <p>Preparing normal daily activities with mechanical assistance</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="robotic-fusion-container">
        <div className="robotic-fusion-error">
          <h3>Enhancement Integration Failed</h3>
          <p>{error}</p>
          <div className="robotic-fusion-actions">
            <button className="robotic-fusion-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="robotic-fusion-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content view
  if (currentContent) {
    return (
      <div className="robotic-fusion-container">
        {/* Header */}
        <div className="robotic-fusion-header">
          <h1>🤖 Robotic Fusion</h1>
          <p>Normal life with mechanical enhancements</p>
        </div>

        {/* Content */}
        <div className="robotic-fusion-content">
          {/* Description */}
          <div className="fusion-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="fusion-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="fusion-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="robotic-fusion-actions">
          <button 
            className="robotic-fusion-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Fusion
          </button>
          <button className="robotic-fusion-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for scenario concepts and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="robotic-fusion-container">
      {/* Header */}
      <div className="robotic-fusion-header">
        <h1>🤖 Robotic Fusion</h1>
        <p>Normal life with mechanical enhancements</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="robotic-fusion-loading">
        <div className="fusion-spinner"></div>
        <h2>Integrating Robotic Enhancements...</h2>
        <p>Preparing normal daily activities with mechanical assistance</p>
      </div>
    </div>
  );
};

export default RoboticFusionExperience;
