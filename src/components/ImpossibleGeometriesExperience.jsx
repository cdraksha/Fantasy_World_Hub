import React, { useState } from 'react';
import useImpossibleGeometriesContent from '../hooks/useImpossibleGeometriesContent';
import '../styles/impossible-geometries.css';

const ImpossibleGeometriesExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateImpossibleGeometriesContent, isGenerating, error } = useImpossibleGeometriesContent();

  const generateContent = async () => {
    try {
      const content = await generateImpossibleGeometriesContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate impossible geometries content:', err);
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
      <div className="impossible-geometries-container">
        <div className="impossible-geometries-loading">
          <div className="geometry-spinner"></div>
          <h2>Calculating Impossibilities...</h2>
          <p>Defying mathematical logic</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="impossible-geometries-container">
        <div className="impossible-geometries-error">
          <h3>Paradox Error</h3>
          <p>{error}</p>
          <div className="impossible-geometries-actions">
            <button className="impossible-geometries-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="impossible-geometries-btn secondary" onClick={onStop}>
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
      <div className="impossible-geometries-container">
        {/* Header */}
        <div className="impossible-geometries-header">
          <h1>📐 Impossible Geometries</h1>
          <p>Where mathematics breaks down</p>
        </div>

        {/* Content */}
        <div className="impossible-geometries-content">
          {/* Description */}
          <div className="geometries-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="geometries-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="geometries-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="impossible-geometries-actions">
          <button 
            className="impossible-geometries-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New Impossible Geometry
          </button>
          <button className="impossible-geometries-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="impossible-geometries-container">
      {/* Header */}
      <div className="impossible-geometries-header">
        <h1>📐 Impossible Geometries</h1>
        <p>Where mathematics breaks down</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="impossible-geometries-loading">
        <div className="geometry-spinner"></div>
        <h2>Calculating Impossibilities...</h2>
        <p>Defying mathematical logic</p>
      </div>
    </div>
  );
};

export default ImpossibleGeometriesExperience;
