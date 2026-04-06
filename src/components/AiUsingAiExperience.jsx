import React, { useState } from 'react';
import useAiUsingAiContent from '../hooks/useAiUsingAiContent';
import '../styles/ai-using-ai.css';

const AiUsingAiExperience = ({ onStop }) => {
  const [currentContent, setCurrentContent] = useState(null);
  const { generateAiUsingAiContent, isGenerating, error } = useAiUsingAiContent();

  const generateContent = async () => {
    try {
      const content = await generateAiUsingAiContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate AI using AI content:', err);
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
      <div className="ai-using-ai-container">
        <div className="ai-using-ai-loading">
          <div className="ai-spinner"></div>
          <h2>AI Systems Coordinating...</h2>
          <p>Multiple AI models are collaborating on daily tasks</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ai-using-ai-container">
        <div className="ai-using-ai-error">
          <h3>AI Coordination Failed</h3>
          <p>{error}</p>
          <div className="ai-using-ai-actions">
            <button className="ai-using-ai-btn primary" onClick={generateContent}>
              Try Again
            </button>
            <button className="ai-using-ai-btn secondary" onClick={onStop}>
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
      <div className="ai-using-ai-container">
        {/* Header */}
        <div className="ai-using-ai-header">
          <h1>🤖 AI using AI</h1>
          <p>Artificial intelligence leveraging other AI systems for daily activities</p>
        </div>

        {/* Content */}
        <div className="ai-using-ai-content">
          {/* Description */}
          <div className="ai-description">
            <p>{currentContent.description}</p>
          </div>

          {/* Image */}
          <div className="ai-image-container">
            <img 
              src={currentContent.image.url} 
              alt={currentContent.image.prompt}
              className="ai-image"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ai-using-ai-actions">
          <button 
            className="ai-using-ai-btn primary" 
            onClick={generateContent}
            disabled={isGenerating}
          >
            Generate New AI Scenario
          </button>
          <button className="ai-using-ai-btn secondary" onClick={onStop}>
            Return to Hub
          </button>
        </div>

        {/* Model Attribution */}
        <div className="model-attribution">
          <p>Generated using Segmind GPT-4 for AI scenarios and Nano Banana via Segmind API for visuals</p>
        </div>
      </div>
    );
  }

  // Initial state - should not reach here due to useEffect
  return (
    <div className="ai-using-ai-container">
      {/* Header */}
      <div className="ai-using-ai-header">
        <h1>🤖 AI using AI</h1>
        <p>Artificial intelligence leveraging other AI systems for daily activities</p>
      </div>

      {/* Loading state while waiting for auto-generation */}
      <div className="ai-using-ai-loading">
        <div className="ai-spinner"></div>
        <h2>AI Systems Coordinating...</h2>
        <p>Multiple AI models are collaborating on daily tasks</p>
      </div>
    </div>
  );
};

export default AiUsingAiExperience;
