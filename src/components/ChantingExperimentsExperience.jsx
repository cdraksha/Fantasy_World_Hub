import React, { useState, useEffect } from 'react';
import useChantingExperimentsContent from '../hooks/useChantingExperimentsContent';
import '../styles/chanting-experiments.css';

const ChantingExperimentsExperience = ({ onStop }) => {
  const [content, setContent] = useState(null);
  const { generateChantingExperiment, isGenerating, error } = useChantingExperimentsContent();

  // Auto-generate content on component mount
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const newContent = await generateChantingExperiment();
      setContent(newContent);
    } catch (err) {
      console.error('Failed to generate chanting experiment:', err);
    }
  };

  // Loading state
  if (isGenerating && !content) {
    return (
      <div className="chanting-experiments-container">
        <div className="chanting-experiments-loading">
          <div className="sound-wave-spinner"></div>
          <h2>Tuning the Vibrations...</h2>
          <p>Preparing a curious sound experiment for you</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !content) {
    return (
      <div className="chanting-experiments-container">
        <div className="chanting-experiments-error">
          <h3>Experiment Failed</h3>
          <p>{error}</p>
          <div className="chanting-experiments-actions">
            <button className="chanting-experiments-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="chanting-experiments-btn secondary" onClick={onStop}>
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
      <div className="chanting-experiments-container">
        {/* Header */}
        <div className="chanting-experiments-header">
          <h1>🕉️ Chanting Experiments</h1>
          <p>Playful exploration of sound and vibration</p>
        </div>

        {/* Experiment Content */}
        <div className="chanting-experiments-content">
          {/* Experiment Title */}
          <div className="experiment-title">
            <h2>{content.title}</h2>
          </div>

          {/* Main Experiment Panel */}
          <div className="experiment-panel">
            <div className="experiment-instructions">
              <h3>🧪 The Experiment</h3>
              <div className="instructions-text">
                <p>{content.experiment}</p>
              </div>
            </div>

            <div className="experiment-details">
              <div className="chant-box">
                <h4>🎵 Chant to Use</h4>
                <div className="chant-display">
                  <span className="chant-text">{content.chant}</span>
                </div>
              </div>

              <div className="focus-box">
                <h4>👁️ What to Notice</h4>
                <p>{content.focus}</p>
              </div>

              <div className="curiosity-box">
                <h4>✨ You Might Discover</h4>
                <p>{content.curiosityNote}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="chanting-experiments-actions">
          <button 
            className="chanting-experiments-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            New Experiment
          </button>
          <button className="chanting-experiments-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using OpenAI GPT-4 for curious sound exploration</p>
        </div>

        {/* Disclaimer */}
        <div className="experiment-disclaimer">
          <p>These are playful experiments for curiosity and discovery. No expertise claimed - just fun exploration of sound and vibration!</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="chanting-experiments-container">
      {/* Header */}
      <div className="chanting-experiments-header">
        <h1>🕉️ Chanting Experiments</h1>
        <p>Playful exploration of sound and vibration</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="chanting-experiments-loading">
        <div className="sound-wave-spinner"></div>
        <h2>Tuning the Vibrations...</h2>
        <p>Preparing a curious sound experiment for you</p>
      </div>
    </div>
  );
};

export default ChantingExperimentsExperience;
