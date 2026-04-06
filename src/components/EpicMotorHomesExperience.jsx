import React, { useState } from 'react';
import useEpicMotorHomesContent from '../hooks/useEpicMotorHomesContent';
import '../styles/epic-motor-homes.css';

const EpicMotorHomesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateEpicMotorHomesContent, isGenerating, error } = useEpicMotorHomesContent();

  const generateContent = async () => {
    console.log('🚐 Epic Motor Homes: generateContent function called');
    try {
      const content = await generateEpicMotorHomesContent();
      console.log('🚐 Epic Motor Homes: Content received:', content);
      setCurrentContent(content);
    } catch (err) {
      console.error('🚐 Epic Motor Homes: Failed to generate content:', err);
    }
  };

  // Auto-generate first content on mount
  React.useEffect(() => {
    console.log('🚐 Epic Motor Homes: Component mounted, checking conditions...');
    console.log('currentContent:', currentContent);
    console.log('isGenerating:', isGenerating);
    console.log('error:', error);
    
    if (!currentContent && !isGenerating && !error) {
      console.log('🚐 Epic Motor Homes: Conditions met, calling generateContent...');
      generateContent();
    } else {
      console.log('🚐 Epic Motor Homes: Conditions not met, skipping auto-generation');
    }
  }, []);

  // Loading state
  if (isGenerating) {
    return (
      <div className="epic-motor-homes-container">
        <div className="epic-motor-homes-loading">
          <div className="motor-homes-spinner"></div>
          <h2>Designing Epic Motor Home...</h2>
          <p>Creating fantasy mobile homes with magical features</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="epic-motor-homes-container">
        <div className="epic-motor-homes-error">
          <h3>Motor Home Design Failed</h3>
          <p>{error}</p>
          <div className="epic-motor-homes-actions">
            <button className="epic-motor-homes-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="epic-motor-homes-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="epic-motor-homes-container">
      <div className="epic-motor-homes-header">
        <h1>Epic Motor Homes</h1>
        <p>Fantasy mobile homes that combine freedom of the road with magical features</p>
      </div>

      {currentContent && (
        <>
          <div className="motor-home-description">
            <p>{currentContent.description}</p>
          </div>

          <div className="motor-home-image-container">
            <img 
              src={currentContent.imageUrl} 
              alt="Epic motor home concept"
              className="motor-home-image"
            />
          </div>
        </>
      )}

      <div className="epic-motor-homes-actions">
        <button 
          className="epic-motor-homes-btn primary"
          onClick={generateContent}
          disabled={isGenerating}
        >
          Generate New Motor Home
        </button>
        <button className="epic-motor-homes-btn secondary" onClick={onStop}>
          Return to Hub
        </button>
      </div>

      <div className="model-attribution">
        <p>Powered by Segmind's Nano Banana for image generation</p>
      </div>
    </div>
  );
};

export default EpicMotorHomesExperience;
