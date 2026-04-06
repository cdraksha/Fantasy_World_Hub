import React, { useState } from 'react';
import useProfessorXMindReadsContent from '../hooks/useProfessorXMindReadsContent';
import '../styles/professor-x-mind-reads.css';

const ProfessorXMindReadsExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateProfessorXMindReadsContent, isGenerating, error } = useProfessorXMindReadsContent();

  const generateContent = async () => {
    try {
      const content = await generateProfessorXMindReadsContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate Professor X mind reads content:', err);
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
      <div className="professor-x-mind-reads-container">
        <div className="professor-x-mind-reads-loading">
          <div className="telepathy-spinner"></div>
          <h2>Establishing Telepathic Connection...</h2>
          <p>Professor X is accessing a powerful mind</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="professor-x-mind-reads-container">
        <div className="professor-x-mind-reads-error">
          <h3>Telepathic Connection Failed</h3>
          <p>{error}</p>
          <div className="professor-x-mind-reads-actions">
            <button className="professor-x-mind-reads-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="professor-x-mind-reads-btn secondary" onClick={onStop}>
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
      <div className="professor-x-mind-reads-container">
        {/* Header */}
        <div className="professor-x-mind-reads-header">
          <h1>🧠 If Professor X Mind Reads...</h1>
          <p>Telepathic takeovers of the world's most powerful minds</p>
        </div>

        {/* Content - Side by side layout */}
        <div className="professor-x-mind-reads-content">
          {/* Text Content - Left Side */}
          <div className="story-content">
            <div className="target-person">
              <h2>{currentContent.targetPerson}</h2>
            </div>
            <div className="story-text">
              <p>{currentContent.story}</p>
            </div>
          </div>

          {/* Image Content - Right Side */}
          <div className="telepathy-image-container">
            <img 
              src={currentContent.image.url} 
              alt={`Professor X taking over ${currentContent.targetPerson}'s mind`}
              className="telepathy-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="professor-x-mind-reads-actions">
          <button 
            className="professor-x-mind-reads-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Next Mind Takeover
          </button>
          <button className="professor-x-mind-reads-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for storytelling and Nano Banana for telepathic visualizations</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="professor-x-mind-reads-container">
      {/* Header */}
      <div className="professor-x-mind-reads-header">
        <h1>🧠 If Professor X Mind Reads...</h1>
        <p>Telepathic takeovers of the world's most powerful minds</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="professor-x-mind-reads-loading">
        <div className="telepathy-spinner"></div>
        <h2>Establishing Telepathic Connection...</h2>
        <p>Professor X is accessing a powerful mind</p>
      </div>
    </div>
  );
};

export default ProfessorXMindReadsExperience;
