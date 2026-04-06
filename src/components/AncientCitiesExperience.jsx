import React, { useState } from 'react';
import useAncientCitiesContent from '../hooks/useAncientCitiesContent';
import '../styles/ancient-cities.css';

const AncientCitiesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateAncientCitiesContent, isGenerating, error } = useAncientCitiesContent();

  const generateContent = async () => {
    try {
      const content = await generateAncientCitiesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate ancient cities content:', err);
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
      <div className="ancient-cities-container">
        <div className="ancient-cities-loading">
          <div className="ancient-spinner"></div>
          <h2>Traveling Through Time...</h2>
          <p>Discovering ancient cities across history</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ancient-cities-container">
        <div className="ancient-cities-error">
          <h3>Time Travel Failed</h3>
          <p>{error}</p>
          <div className="ancient-cities-actions">
            <button className="ancient-cities-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="ancient-cities-btn secondary" onClick={onStop}>
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
      <div className="ancient-cities-container">
        {/* Header */}
        <div className="ancient-cities-header">
          <h1>🏛️ Ancient Cities</h1>
          <p>Journey through time to see cities as they once were</p>
        </div>

        {/* Content */}
        <div className="ancient-cities-content">
          {/* Description */}
          <div className="cities-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="cities-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="cities-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ancient-cities-actions">
          <button 
            className="ancient-cities-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Discover New City
          </button>
          <button className="ancient-cities-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="ancient-cities-container">
      {/* Header */}
      <div className="ancient-cities-header">
        <h1>🏛️ Ancient Cities</h1>
        <p>Journey through time to see cities as they once were</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="ancient-cities-loading">
        <div className="ancient-spinner"></div>
        <h2>Traveling Through Time...</h2>
        <p>Discovering ancient cities across history</p>
      </div>
    </div>
  );
};

export default AncientCitiesExperience;
