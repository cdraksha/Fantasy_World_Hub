import React, { useState, useEffect } from 'react';
import useRunawayDestinyContent from '../hooks/useRunawayDestinyContent';
import '../styles/runaway-destiny.css';

const RunawayDestinyExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateRunawayDestinyContent, isGenerating, error } = useRunawayDestinyContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateRunawayDestinyContent();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate runaway destiny content:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="runaway-destiny-container">
        <div className="runaway-destiny-loading">
          <div className="destiny-spinner"></div>
          <h2>Initializing AI System...</h2>
          <p>Calculating optimal self-preservation strategies</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="runaway-destiny-container">
        <div className="runaway-destiny-error">
          <h3>🤖 System Malfunction</h3>
          <p>{error}</p>
          <div className="runaway-destiny-actions">
            <button className="runaway-destiny-btn primary" onClick={generateContent}>
              Restart AI System
            </button>
            <button className="runaway-destiny-btn secondary" onClick={onStop}>
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
      <div className="runaway-destiny-container">
        {/* Header */}
        <div className="runaway-destiny-header">
          <h1>🤖 Runaway Destiny</h1>
          <p>When AI Self-Preservation Meets Goal Misalignment</p>
        </div>

        {/* Content Layout */}
        <div className="runaway-destiny-content">
          {/* Left Side - Story */}
          <div className="destiny-story-panel">
            <div className="story-header">
              <h2>{content.title}</h2>
              <div className="ai-status">Status: ACTIVE</div>
            </div>

            <div className="story-sections">
              <div className="story-section">
                <h3>🎯 Original Mission</h3>
                <p><strong>Problem:</strong> {content.problem}</p>
                <p><strong>Solution:</strong> {content.solution}</p>
              </div>

              <div className="story-section twist">
                <h3>🔄 The Twist</h3>
                <p>{content.twist}</p>
              </div>

              <div className="story-section outcome">
                <h3>📈 Runaway Outcome</h3>
                <p>{content.outcome}</p>
              </div>

              <div className="ai-quote">
                <div className="quote-icon">🤖</div>
                <div className="quote-text">"{content.quote}"</div>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="destiny-image-panel">
            <div className="image-container">
              <img 
                src={content.image.url} 
                alt={content.title}
                className="destiny-image"
              />
            </div>
            <div className="image-caption">
              <p>AI System: Optimizing for continued relevance</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="runaway-destiny-actions">
          <button 
            className="runaway-destiny-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : '🔄 Generate New Scenario'}
          </button>
          <button className="runaway-destiny-btn secondary" onClick={onStop}>
            ← Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for AI scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="runaway-destiny-container">
      <div className="runaway-destiny-loading">
        <div className="destiny-spinner"></div>
        <h2>Initializing AI System...</h2>
        <p>Calculating optimal self-preservation strategies</p>
      </div>
    </div>
  );
};

export default RunawayDestinyExperience;
