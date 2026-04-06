import React, { useState } from 'react';
import useIndianTeachersContent from '../hooks/useIndianTeachersContent';
import '../styles/indian-teachers.css';

const IndianTeachersExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateIndianTeachersContent, isGenerating, error } = useIndianTeachersContent();

  const generateContent = async () => {
    try {
      const content = await generateIndianTeachersContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate Indian Teachers content:', err);
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
      <div className="indian-teachers-container">
        <div className="indian-teachers-loading">
          <div className="teachers-spinner"></div>
          <h2>Summoning Karma...</h2>
          <p>Preparing cosmic justice for problematic teachers</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="indian-teachers-container">
        <div className="indian-teachers-error">
          <h3>Karma Delivery Failed</h3>
          <p>{error}</p>
          <div className="indian-teachers-actions">
            <button className="indian-teachers-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="indian-teachers-btn secondary" onClick={onStop}>
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
      <div className="indian-teachers-container">
        {/* Header */}
        <div className="indian-teachers-header">
          <h1>👩‍🏫 Indian Teachers We All Know</h1>
          <p>Therapeutic revenge fantasies through cosmic comedy</p>
        </div>

        {/* Teacher Type Badge */}
        <div className="teacher-type-badge">
          <span className="teacher-type-label">Today's Target:</span>
          <span className="teacher-type-name">{currentContent.teacherType}</span>
        </div>

        {/* Content Layout - Text + Image */}
        <div className="indian-teachers-content">
          {/* Left Side - Story */}
          <div className="teachers-story-section">
            <div className="story-content">
              <p>{currentContent.scenario}</p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="teachers-image-section">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.description}
              className="teachers-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="indian-teachers-actions">
          <button 
            className="indian-teachers-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Summon More Karma
          </button>
          <button className="indian-teachers-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Segmind GPT-4 for comedy scenarios and Nano Banana for classroom imagery</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="indian-teachers-container">
      {/* Header */}
      <div className="indian-teachers-header">
        <h1>👩‍🏫 Indian Teachers We All Know</h1>
        <p>Therapeutic revenge fantasies through cosmic comedy</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="indian-teachers-loading">
        <div className="teachers-spinner"></div>
        <h2>Summoning Karma...</h2>
        <p>Preparing cosmic justice for problematic teachers</p>
      </div>
    </div>
  );
};

export default IndianTeachersExperience;
