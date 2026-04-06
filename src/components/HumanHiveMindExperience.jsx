import React, { useState } from 'react';
import useHumanHiveMindContent from '../hooks/useHumanHiveMindContent';
import '../styles/human-hive-mind.css';

const HumanHiveMindExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateHumanHiveMindContent, isGenerating, error } = useHumanHiveMindContent();

  const generateContent = async () => {
    try {
      const content = await generateHumanHiveMindContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate human hive mind content:', err);
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
      <div className="human-hive-mind-container">
        <div className="human-hive-mind-loading">
          <div className="neural-spinner"></div>
          <h2>Connecting to Collective...</h2>
          <p>Synchronizing with billions of minds</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="human-hive-mind-container">
        <div className="human-hive-mind-error">
          <h3>Connection Error</h3>
          <p>{error}</p>
          <div className="human-hive-mind-actions">
            <button className="human-hive-mind-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="human-hive-mind-btn secondary" onClick={onStop}>
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
      <div className="human-hive-mind-container">
        {/* Header */}
        <div className="human-hive-mind-header">
          <h1>🌐 Human Hive Mind</h1>
          <p>Collective consciousness stories from the connected future</p>
        </div>

        {/* Content Layout - Text Left, Image Right like Retro Futurism */}
        <div className="human-hive-mind-content">
          {/* Text Content */}
          <div className="hive-mind-text-section">
            <div className="hive-mind-story">
              <h3>Collective Experience</h3>
              <div className="story-content">
                {currentContent.story.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="hive-mind-image-section">
            <div className="hive-mind-image-container">
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="hive-mind-image"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="human-hive-mind-actions">
          <button 
            className="human-hive-mind-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Collective Story
          </button>
          <button className="human-hive-mind-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for collective consciousness narratives and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="human-hive-mind-container">
      {/* Header */}
      <div className="human-hive-mind-header">
        <h1>🌐 Human Hive Mind</h1>
        <p>Collective consciousness stories from the connected future</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="human-hive-mind-loading">
        <div className="neural-spinner"></div>
        <h2>Connecting to Collective...</h2>
        <p>Synchronizing with billions of minds</p>
      </div>
    </div>
  );
};

export default HumanHiveMindExperience;
