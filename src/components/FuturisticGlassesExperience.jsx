import React, { useState } from 'react';
import useFuturisticGlassesContent from '../hooks/useFuturisticGlassesContent';
import '../styles/futuristic-glasses.css';

const FuturisticGlassesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateFuturisticGlassesContent, isGenerating, error } = useFuturisticGlassesContent();

  const generateContent = async () => {
    try {
      const content = await generateFuturisticGlassesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate futuristic glasses content:', err);
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
      <div className="futuristic-glasses-container">
        <div className="futuristic-glasses-loading">
          <div className="glasses-spinner"></div>
          <h2>Calibrating Futuristic Glasses...</h2>
          <p>Advanced optics are initializing impossible vision capabilities</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="futuristic-glasses-container">
        <div className="futuristic-glasses-error">
          <h3>Vision System Malfunction</h3>
          <p>{error}</p>
          <div className="futuristic-glasses-actions">
            <button className="futuristic-glasses-btn primary" onClick={generateContent}>
              Recalibrate
            </button>
            <button className="futuristic-glasses-btn secondary" onClick={onStop}>
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
      <div className="futuristic-glasses-container">
        {/* Header */}
        <div className="futuristic-glasses-header">
          <h1>🕶️ Futuristic Glasses</h1>
          <p>Tony Stark-inspired eyewear with impossible capabilities</p>
        </div>

        {/* Content */}
        <div className="futuristic-glasses-content">
          {/* Description */}
          <div className="glasses-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="glasses-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="glasses-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="futuristic-glasses-actions">
          <button 
            className="futuristic-glasses-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Vision
          </button>
          <button className="futuristic-glasses-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Nano Banana via Segmind API for advanced optics visualization</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="futuristic-glasses-container">
      {/* Header */}
      <div className="futuristic-glasses-header">
        <h1>🕶️ Futuristic Glasses</h1>
        <p>Tony Stark-inspired eyewear with impossible capabilities</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="futuristic-glasses-loading">
        <div className="glasses-spinner"></div>
        <h2>Calibrating Futuristic Glasses...</h2>
        <p>Advanced optics are initializing impossible vision capabilities</p>
      </div>
    </div>
  );
};

export default FuturisticGlassesExperience;
