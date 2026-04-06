import React, { useState, useEffect } from 'react';
import useAncientCityWalksContent from '../hooks/useAncientCityWalksContent';
import '../styles/ancient-city-walks.css';

const AncientCityWalksExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const [cityDescription, setCityDescription] = useState(null);
  const { generateAncientCityWalk, isGenerating, error } = useAncientCityWalksContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      setCityDescription(null);
      setContent(null);
      
      const newContent = await generateAncientCityWalk();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate ancient city walk:', err);
    }
  };

  // Loading state - Show city info while video generates
  if (isGenerating && !content) {
    return (
      <div className="ancient-city-walks-container">
        <div className="ancient-city-walks-loading">
          <div className="time-portal-spinner"></div>
          <h2>🏛️ Traveling Through Time...</h2>
          <p>Generating your ancient city walk experience</p>
          <div className="generation-info">
            <p>⏳ Video generation takes approximately 2-3 minutes</p>
            <p>🎬 Creating cinematic 5-second journey through history with Runway Gen-3</p>
            <p>☕ Perfect time for a quick break while we craft your epic ancient city walk!</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="ancient-city-walks-container">
        <div className="ancient-city-walks-error">
          <h3>🏛️ Time Portal Disrupted</h3>
          <p>{error}</p>
          <div className="ancient-city-walks-actions">
            <button className="ancient-city-walks-btn primary" onClick={generateContent}>
              Reopen Time Portal
            </button>
            <button className="ancient-city-walks-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content display
  if (content) {
    return (
      <div className="ancient-city-walks-container">
        {/* Header */}
        <div className="ancient-city-walks-header">
          <h1>🏛️ Ancient City Walks</h1>
          <p>Cinematic journeys through lost civilizations</p>
        </div>

        {/* City Information */}
        <div className="city-info-section">
          <div className="city-title">
            <h2>Walking through {content.city}, {content.year}</h2>
          </div>
          <div className="city-description">
            <p>{content.description}</p>
          </div>
          <div className="city-landmark">
            <p><strong>Featured:</strong> {content.landmark}</p>
          </div>
        </div>

        {/* Video Display */}
        <div className="ancient-city-walks-content">
          <div className="video-container">
            <video 
              src={content.video.url} 
              controls
              autoPlay
              loop
              className="city-walk-video"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Actions */}
        <div className="ancient-city-walks-actions">
          <button 
            className="ancient-city-walks-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Traveling Through Time...' : 'Visit Another Ancient City'}
          </button>
          <button className="ancient-city-walks-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>City descriptions by ChatGPT-4 • Videos generated using Runway Gen-3 Turbo via Segmind API</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="ancient-city-walks-container">
      {/* Header */}
      <div className="ancient-city-walks-header">
        <h1>🏛️ Ancient City Walks</h1>
        <p>Cinematic journeys through lost civilizations</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="ancient-city-walks-loading">
        <div className="time-portal-spinner"></div>
        <h2>🏛️ Opening Time Portal...</h2>
        <p>Preparing your journey through ancient history</p>
      </div>
    </div>
  );
};

export default AncientCityWalksExperience;
