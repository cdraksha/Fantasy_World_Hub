import React, { useState } from 'react';
import useAncientWeaponsContent from '../hooks/useAncientWeaponsContent';
import '../styles/ancient-weapons.css';

const AncientWeaponsExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateAncientWeaponsContent, isGenerating, error } = useAncientWeaponsContent();

  const generateContent = async () => {
    try {
      const content = await generateAncientWeaponsContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate ancient weapons content:', err);
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
      <div className="ancient-weapons-container">
        <div className="ancient-weapons-loading">
          <div className="forge-spinner"></div>
          <h2>Forging Legendary Weapons...</h2>
          <p>Crafting ancient armaments from history</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ancient-weapons-container">
        <div className="ancient-weapons-error">
          <h3>Forge Error</h3>
          <p>{error}</p>
          <div className="ancient-weapons-actions">
            <button className="ancient-weapons-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="ancient-weapons-btn secondary" onClick={onStop}>
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
      <div className="ancient-weapons-container">
        {/* Header */}
        <div className="ancient-weapons-header">
          <h1>⚔️ Ancient Legendary Weapons</h1>
          <p>Legendary armaments from history and myth</p>
        </div>

        {/* Content */}
        <div className="ancient-weapons-content">
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
        <div className="ancient-weapons-actions">
          <button 
            className="ancient-weapons-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Ancient Weapon
          </button>
          <button className="ancient-weapons-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for weapon lore and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="ancient-weapons-container">
      {/* Header */}
      <div className="ancient-weapons-header">
        <h1>⚔️ Ancient Legendary Weapons</h1>
        <p>Legendary armaments from history and myth</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="ancient-weapons-loading">
        <div className="forge-spinner"></div>
        <h2>Forging Legendary Weapons...</h2>
        <p>Crafting ancient armaments from history</p>
      </div>
    </div>
  );
};

export default AncientWeaponsExperience;
