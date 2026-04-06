import React, { useState } from 'react';
import usePastLifeStoriesContent from '../hooks/usePastLifeStoriesContent';
import '../styles/past-life-stories.css';

const PastLifeStoriesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generatePastLifeStoriesContent, isGenerating, error } = usePastLifeStoriesContent();

  const generateContent = async () => {
    try {
      const content = await generatePastLifeStoriesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate past life stories content:', err);
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
      <div className="past-life-stories-container">
        <div className="past-life-stories-loading">
          <div className="memory-spinner"></div>
          <h2>Accessing Soul Memories...</h2>
          <p>Retrieving stories from across lifetimes</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="past-life-stories-container">
        <div className="past-life-stories-error">
          <h3>Memory Retrieval Error</h3>
          <p>{error}</p>
          <div className="past-life-stories-actions">
            <button className="past-life-stories-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="past-life-stories-btn secondary" onClick={onStop}>
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
      <div className="past-life-stories-container">
        {/* Header */}
        <div className="past-life-stories-header">
          <h1>👤 Past Life Stories</h1>
          <p>Intimate memories across lifetimes</p>
        </div>

        {/* Content Layout - Text Left, Image Right like Retro Futurism */}
        <div className="past-life-stories-content">
          {/* Text Content */}
          <div className="past-life-text-section">
            <div className="past-life-story">
              <h3>A Memory From Another Time</h3>
              <div className="story-content">
                {currentContent.story.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="past-life-image-section">
            <div className="past-life-image-container">
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="past-life-image"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="past-life-stories-actions">
          <button 
            className="past-life-stories-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Past Life Story
          </button>
          <button className="past-life-stories-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for soul narratives and Nano Banana via Segmind API for historical visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="past-life-stories-container">
      {/* Header */}
      <div className="past-life-stories-header">
        <h1>👤 Past Life Stories</h1>
        <p>Intimate memories across lifetimes</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="past-life-stories-loading">
        <div className="memory-spinner"></div>
        <h2>Accessing Soul Memories...</h2>
        <p>Retrieving stories from across lifetimes</p>
      </div>
    </div>
  );
};

export default PastLifeStoriesExperience;
