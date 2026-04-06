import React, { useState } from 'react';
import useBangaloreTrafficContent from '../hooks/useBangaloreTrafficContent';
import '../styles/bangalore-traffic.css';

const BangaloreTrafficExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateBangaloreTrafficContent, isGenerating, error } = useBangaloreTrafficContent();

  const generateContent = async () => {
    try {
      const content = await generateBangaloreTrafficContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate Bangalore traffic content:', err);
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
      <div className="bangalore-traffic-container">
        <div className="bangalore-traffic-loading">
          <div className="traffic-spinner"></div>
          <h2>Navigating Bangalore Traffic...</h2>
          <p>Rendering chaos in beautiful Ghibli style</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bangalore-traffic-container">
        <div className="bangalore-traffic-error">
          <h3>Traffic Jam Error</h3>
          <p>{error}</p>
          <div className="bangalore-traffic-actions">
            <button className="bangalore-traffic-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="bangalore-traffic-btn secondary" onClick={onStop}>
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
      <div className="bangalore-traffic-container">
        {/* Header */}
        <div className="bangalore-traffic-header">
          <h1>🚗 Funny Bangalore Traffic</h1>
          <p>Real traffic chaos in magical Ghibli style</p>
        </div>

        {/* Content */}
        <div className="bangalore-traffic-content">
          {/* Description */}
          <div className="traffic-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="traffic-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="traffic-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bangalore-traffic-actions">
          <button 
            className="bangalore-traffic-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Traffic Scene
          </button>
          <button className="bangalore-traffic-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for traffic scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="bangalore-traffic-container">
      {/* Header */}
      <div className="bangalore-traffic-header">
        <h1>🚗 Funny Bangalore Traffic</h1>
        <p>Real traffic chaos in magical Ghibli style</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="bangalore-traffic-loading">
        <div className="traffic-spinner"></div>
        <h2>Navigating Bangalore Traffic...</h2>
        <p>Rendering chaos in beautiful Ghibli style</p>
      </div>
    </div>
  );
};

export default BangaloreTrafficExperience;
