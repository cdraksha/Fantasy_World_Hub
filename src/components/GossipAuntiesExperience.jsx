import React, { useState } from 'react';
import useGossipAuntiesContent from '../hooks/useGossipAuntiesContent';
import '../styles/gossip-aunties.css';

const GossipAuntiesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateGossipAuntiesContent, isGenerating, error } = useGossipAuntiesContent();

  const generateContent = async () => {
    try {
      const content = await generateGossipAuntiesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate gossip aunties content:', err);
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
      <div className="gossip-aunties-container">
        <div className="gossip-aunties-loading">
          <div className="whatsapp-spinner"></div>
          <h2>Aunties Are Gathering Intel...</h2>
          <p>WhatsApp group is buzzing with fresh gossip</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="gossip-aunties-container">
        <div className="gossip-aunties-error">
          <h3>WhatsApp Network Down</h3>
          <p>{error}</p>
          <div className="gossip-aunties-actions">
            <button className="gossip-aunties-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="gossip-aunties-btn secondary" onClick={onStop}>
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
      <div className="gossip-aunties-container">
        {/* Header */}
        <div className="gossip-aunties-header">
          <h1>👵 Gossip Aunties</h1>
          <p>The savage WhatsApp surveillance network that controls everything</p>
        </div>

        {/* Content - Side by side layout */}
        <div className="gossip-aunties-content">
          {/* Text Content - Left Side */}
          <div className="gossip-content">
            <div className="gossip-title">
              <h2>{currentContent.gossipTitle}</h2>
            </div>
            <div className="gossip-text">
              <p>{currentContent.story}</p>
            </div>
          </div>

          {/* Image Content - Right Side */}
          <div className="gossip-image-container">
            <img 
              src={currentContent.image.url} 
              alt={`${currentContent.gossipTitle} - Gossip Aunties investigation`}
              className="gossip-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="gossip-aunties-actions">
          <button 
            className="gossip-aunties-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Next Gossip Investigation
          </button>
          <button className="gossip-aunties-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Uses Segmind's GPT-5.2 for text and Segmind's Nano Banana for images</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="gossip-aunties-container">
      {/* Header */}
      <div className="gossip-aunties-header">
        <h1>👵 Gossip Aunties</h1>
        <p>The savage WhatsApp surveillance network that controls everything</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="gossip-aunties-loading">
        <div className="whatsapp-spinner"></div>
        <h2>Aunties Are Gathering Intel...</h2>
        <p>WhatsApp group is buzzing with fresh gossip</p>
      </div>
    </div>
  );
};

export default GossipAuntiesExperience;
