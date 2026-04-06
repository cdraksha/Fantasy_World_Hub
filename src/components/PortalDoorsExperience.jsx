import React, { useEffect } from 'react';
import usePortalDoorsContent from '../hooks/usePortalDoorsContent';
import '../styles/dragons-over-cities.css';

const PortalDoorsExperience = ({ onStop }) => {
  const { content, loading, error, generateContent } = usePortalDoorsContent();

  useEffect(() => {
    generateContent();
  }, []);

  const handleGenerateNew = () => {
    generateContent();
  };

  // Loading state
  if (loading) {
    return (
      <div className="dragons-cities-container">
        <div className="dragons-cities-loading">
          <div className="dragons-spinner"></div>
          <h2>Opening a portal to another world...</h2>
          <p>Magical doors are aligning across dimensions</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dragons-cities-container">
        <div className="dragons-cities-error">
          <h3>Portal Malfunction</h3>
          <p>The magical door seems to be stuck: {error}</p>
          <div className="dragons-cities-actions">
            <button className="dragons-cities-btn primary" onClick={handleGenerateNew}>
              Try Another Door
            </button>
            <button className="dragons-cities-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content view
  if (content) {
    return (
      <div className="dragons-cities-container">
        {/* Header */}
        <div className="dragons-cities-header">
          <h1>🚪 Portal Doors</h1>
          <p>Ordinary entrances to extraordinary worlds</p>
        </div>

        {/* Content */}
        <div className="dragons-cities-content">
          {/* Description */}
          <div className="dragons-description">
            <p>{content.description}</p>
          </div>

          {/* Image */}
          <div className="dragons-image-container">
            <img 
              src={content.imageUrl} 
              alt="Portal Door to Another World"
              className="dragons-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="dragons-cities-actions">
          <button 
            className="dragons-cities-btn primary" 
            onClick={handleGenerateNew}
            disabled={loading}
          >
            🚪 Open Another Portal
          </button>
          <button className="dragons-cities-btn secondary" onClick={onStop}>
            🏠 Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p><strong>Inspired by:</strong> Narnia: The Lion, the Witch and the Wardrobe (2005)<br/>
          <strong>Powered by:</strong> Segmind Nano Banana for portal imagery</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="dragons-cities-container">
      {/* Header */}
      <div className="dragons-cities-header">
        <h1>🚪 Portal Doors</h1>
        <p>Ordinary entrances to extraordinary worlds</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="dragons-cities-loading">
        <div className="dragons-spinner"></div>
        <h2>Opening a portal to another world...</h2>
        <p>Magical doors are aligning across dimensions</p>
      </div>
    </div>
  );
};

export default PortalDoorsExperience;
