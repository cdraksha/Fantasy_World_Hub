import React, { useState } from 'react';
import useGossipingAuntiesPart2Content from '../hooks/useGossipingAuntiesPart2Content';
import '../styles/gossiping-aunties-part2.css';

const GossipingAuntiesPart2Experience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateGossipingAuntiesPart2Content, isGenerating, error } = useGossipingAuntiesPart2Content();

  const generateContent = async () => {
    try {
      const content = await generateGossipingAuntiesPart2Content();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate gossiping aunties part 2 content:', err);
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
      <div className="gossiping-aunties-part2-container">
        <div className="gossiping-aunties-part2-loading">
          <div className="video-spinner"></div>
          <h2>Aunties Are Getting Ready for Action...</h2>
          <p>Generating dramatic gossip surveillance footage</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="gossiping-aunties-part2-container">
        <div className="gossiping-aunties-part2-error">
          <h3>Video Production Failed</h3>
          <p>{error}</p>
          <div className="gossiping-aunties-part2-actions">
            <button className="gossiping-aunties-part2-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="gossiping-aunties-part2-btn secondary" onClick={onStop}>
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
      <div className="gossiping-aunties-part2-container">
        {/* Header */}
        <div className="gossiping-aunties-part2-header">
          <h1>🎬 Gossiping Aunties Part 2</h1>
          <p>The WhatsApp surveillance network in action</p>
        </div>

        {/* Description Box */}
        <div className="scene-description">
          <p>{currentContent.sceneDescription}</p>
        </div>

        {/* Video Content */}
        <div className="video-content">
          <div className="video-container">
            <video 
              src={currentContent.video.url} 
              controls
              autoPlay
              loop
              muted
              className="gossip-video"
              poster={currentContent.video.thumbnail || ''}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Actions */}
        <div className="gossiping-aunties-part2-actions">
          <button 
            className="gossiping-aunties-part2-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Next Gossip Scene
          </button>
          <button className="gossiping-aunties-part2-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Uses Segmind's LTX-2-19B-T2V for video generation</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="gossiping-aunties-part2-container">
      {/* Header */}
      <div className="gossiping-aunties-part2-header">
        <h1>🎬 Gossiping Aunties Part 2</h1>
        <p>The WhatsApp surveillance network in action</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="gossiping-aunties-part2-loading">
        <div className="video-spinner"></div>
        <h2>Aunties Are Getting Ready for Action...</h2>
        <p>Generating dramatic gossip surveillance footage</p>
      </div>
    </div>
  );
};

export default GossipingAuntiesPart2Experience;
