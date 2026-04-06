import React, { useState } from 'react';
import useUselessPowersAssembledContent from '../hooks/useUselessPowersAssembledContent';
import '../styles/useless-powers-assembled.css';

const UselessPowersAssembledExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateUselessPowersAssembledContent, isGenerating, error } = useUselessPowersAssembledContent();

  const generateContent = async () => {
    try {
      const content = await generateUselessPowersAssembledContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate useless powers assembled content:', err);
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
      <div className="useless-powers-assembled-container">
        <div className="useless-powers-assembled-loading">
          <div className="superhero-spinner"></div>
          <h2>Assembling Useless Heroes...</h2>
          <p>The most pointless superhero team is suiting up</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="useless-powers-assembled-container">
        <div className="useless-powers-assembled-error">
          <h3>Hero Assembly Failed</h3>
          <p>{error}</p>
          <div className="useless-powers-assembled-actions">
            <button className="useless-powers-assembled-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="useless-powers-assembled-btn secondary" onClick={onStop}>
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
      <div className="useless-powers-assembled-container">
        {/* Header */}
        <div className="useless-powers-assembled-header">
          <h1>🦸 Useless Powers Assembled</h1>
          <p>The most hilariously pointless superhero team battles</p>
        </div>

        {/* Content - Side by side layout */}
        <div className="useless-powers-assembled-content">
          {/* Text Content - Left Side */}
          <div className="battle-content">
            <div className="battle-title">
              <h2>{currentContent.battleTitle}</h2>
            </div>
            <div className="battle-text">
              <p>{currentContent.story}</p>
            </div>
          </div>

          {/* Image Content - Right Side */}
          <div className="battle-image-container">
            <img 
              src={currentContent.image.url} 
              alt={`${currentContent.battleTitle} - Useless superhero team battle`}
              className="battle-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="useless-powers-assembled-actions">
          <button 
            className="useless-powers-assembled-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Next Battle
          </button>
          <button className="useless-powers-assembled-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Segmind's GPT-5.2 for comedy writing and Nano Banana for superhero visualizations</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="useless-powers-assembled-container">
      {/* Header */}
      <div className="useless-powers-assembled-header">
        <h1>🦸 Useless Powers Assembled</h1>
        <p>The most hilariously pointless superhero team battles</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="useless-powers-assembled-loading">
        <div className="superhero-spinner"></div>
        <h2>Assembling Useless Heroes...</h2>
        <p>The most pointless superhero team is suiting up</p>
      </div>
    </div>
  );
};

export default UselessPowersAssembledExperience;
