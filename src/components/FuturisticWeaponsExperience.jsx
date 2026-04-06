import React, { useState } from 'react';
import useFuturisticWeaponsContent from '../hooks/useFuturisticWeaponsContent';
import '../styles/futuristic-weapons.css';

const FuturisticWeaponsExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateFuturisticWeaponsContent, isGenerating, error } = useFuturisticWeaponsContent();

  const generateContent = async () => {
    try {
      const content = await generateFuturisticWeaponsContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate futuristic weapons content:', err);
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
      <div className="futuristic-weapons-container">
        <div className="futuristic-weapons-loading">
          <div className="tech-spinner"></div>
          <h2>Fabricating Future Arsenal...</h2>
          <p>Assembling next-generation weaponry</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="futuristic-weapons-container">
        <div className="futuristic-weapons-error">
          <h3>Fabrication Error</h3>
          <p>{error}</p>
          <div className="futuristic-weapons-actions">
            <button className="futuristic-weapons-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="futuristic-weapons-btn secondary" onClick={onStop}>
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
      <div className="futuristic-weapons-container">
        {/* Header */}
        <div className="futuristic-weapons-header">
          <h1>⚡ Futuristic Weapons Arsenal</h1>
          <p>Next-generation armaments from the far future</p>
        </div>

        {/* Content */}
        <div className="futuristic-weapons-content">
          {/* Description Box */}
          <div className="weapon-description">
            <h3>{currentContent.weaponName}</h3>
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="weapon-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="weapon-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="futuristic-weapons-actions">
          <button 
            className="futuristic-weapons-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Future Weapon
          </button>
          <button className="futuristic-weapons-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for weapon technology and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="futuristic-weapons-container">
      {/* Header */}
      <div className="futuristic-weapons-header">
        <h1>⚡ Futuristic Weapons Arsenal</h1>
        <p>Next-generation armaments from the far future</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="futuristic-weapons-loading">
        <div className="tech-spinner"></div>
        <h2>Fabricating Future Arsenal...</h2>
        <p>Assembling next-generation weaponry</p>
      </div>
    </div>
  );
};

export default FuturisticWeaponsExperience;
