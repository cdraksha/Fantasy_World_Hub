import React, { useState } from 'react';
import useAliensAncientIndiansContent from '../hooks/useAliensAncientIndiansContent';
import '../styles/aliens-ancient-indians.css';

const AliensAncientIndiansExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateAliensAncientIndiansContent, isGenerating, error } = useAliensAncientIndiansContent();

  const generateContent = async () => {
    try {
      const content = await generateAliensAncientIndiansContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate aliens ancient Indians content:', err);
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
      <div className="aliens-ancient-indians-container">
        <div className="aliens-ancient-indians-loading">
          <div className="ufo-spinner"></div>
          <h2>Establishing Cosmic Connection...</h2>
          <p>Ancient aliens are sharing their knowledge with Vedic architects</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="aliens-ancient-indians-container">
        <div className="aliens-ancient-indians-error">
          <h3>Cosmic Communication Failed</h3>
          <p>{error}</p>
          <div className="aliens-ancient-indians-actions">
            <button className="aliens-ancient-indians-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="aliens-ancient-indians-btn secondary" onClick={onStop}>
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
      <div className="aliens-ancient-indians-container">
        {/* Header */}
        <div className="aliens-ancient-indians-header">
          <h1>🛸 Aliens and Ancient Indians</h1>
          <p>Extraordinary collaboration between extraterrestrials and pre-6th century civilizations</p>
        </div>

        {/* Content - Side by side layout */}
        <div className="aliens-ancient-indians-content">
          {/* Text Content - Left Side */}
          <div className="collaboration-content">
            <div className="structure-name">
              <h2>{currentContent.structureName}</h2>
            </div>
            <div className="collaboration-text">
              <p>{currentContent.story}</p>
            </div>
          </div>

          {/* Image Content - Right Side */}
          <div className="collaboration-image-container">
            <img 
              src={currentContent.image.url} 
              alt={`Aliens collaborating with ancient Indians to build ${currentContent.structureName}`}
              className="collaboration-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="aliens-ancient-indians-actions">
          <button 
            className="aliens-ancient-indians-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Next Collaboration
          </button>
          <button className="aliens-ancient-indians-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for ancient alien narratives and Nano Banana for cosmic visualizations</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="aliens-ancient-indians-container">
      {/* Header */}
      <div className="aliens-ancient-indians-header">
        <h1>🛸 Aliens and Ancient Indians</h1>
        <p>Extraordinary collaboration between extraterrestrials and pre-6th century civilizations</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="aliens-ancient-indians-loading">
        <div className="ufo-spinner"></div>
        <h2>Establishing Cosmic Connection...</h2>
        <p>Ancient aliens are sharing their knowledge with Vedic architects</p>
      </div>
    </div>
  );
};

export default AliensAncientIndiansExperience;
