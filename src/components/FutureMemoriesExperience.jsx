import React, { useState, useEffect } from 'react';
import useFutureMemoriesContent from '../hooks/useFutureMemoriesContent';
import '../styles/future-memories.css';

const FutureMemoriesExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateFutureMemoriesContent } = useFutureMemoriesContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateFutureMemoriesContent();
      setCurrentContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewExperience = () => {
    generateContent();
  };

  if (isLoading) {
    return (
      <div className="future-memories-container">
        <div className="future-memories-loading">
          <div className="memory-spinner"></div>
          <h2>Accessing Future Memories...</h2>
          <p>Connecting to tomorrow's consciousness...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="future-memories-container">
        <div className="future-memories-error">
          <h3>🧠 Memory Access Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="future-memories-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="future-memories-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="future-memories-container">
      {/* Header */}
      <div className="future-memories-header">
        <h1>🧠 Future Memories</h1>
        <p>Experiencing tomorrow's memories today</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="future-memories-main-content">
        {/* Story Panel */}
        <div className="future-memories-story-panel">
          <div className="story-content">
            {currentContent?.story ? (
              currentContent.story.split('\n\n').filter(paragraph => paragraph.trim()).map((paragraph, index) => (
                <p key={index}>{paragraph.trim()}</p>
              ))
            ) : (
              <p>Loading story...</p>
            )}
          </div>
        </div>

        {/* Generated Image */}
        <div className="future-memories-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="future-memories-image"
              />
            ) : (
              <div className="image-placeholder">
                <span>🌌 Ethereal memory scene will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="future-memories-actions">
        <button 
          onClick={handleNewExperience} 
          className="future-memories-btn primary"
        >
          🔄 Access New Memory
        </button>
        <button onClick={onStop} className="future-memories-btn secondary">
          ← Return to Present
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for temporal narratives and Nano Banana via Segmind API for ethereal visuals</p>
      </div>
    </div>
  );
};

export default FutureMemoriesExperience;
