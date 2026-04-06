import React, { useState, useEffect } from 'react';
import useAncientConversationsContent from '../hooks/useAncientConversationsContent';
import '../styles/ancient-conversations.css';

const AncientConversationsExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  const { generateAncientConversationContent } = useAncientConversationsContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateAncientConversationContent();
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
      <div className="ancient-conversations-container">
        <div className="ancient-loading">
          <div className="ancient-spinner"></div>
          <h2>Connecting to Ancient Voices...</h2>
          <p>Listening to conversations from civilizations past...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ancient-conversations-container">
        <div className="ancient-error">
          <h3>⚡ Connection Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="ancient-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="ancient-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ancient-conversations-container">
      {/* Header */}
      <div className="ancient-header">
        <h1>🏛️ Ancient Conversations</h1>
        <p>Voices from Civilizations Past</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="ancient-main-content">
        {/* Story Text Box */}
        <div className="ancient-story-panel">
          <div className="story-header">
            <h2>{currentContent?.title}</h2>
            <div className="story-meta">
              <span className="era">{currentContent?.era}</span>
              <span className="location">{currentContent?.location}</span>
            </div>
          </div>
          
          <div className="story-content">
            {currentContent?.conversation.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Generated Image */}
        <div className="ancient-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="ancient-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🏺</div>
                <p>Ancient World Vision</p>
              </div>
            )}
          </div>
          
          <div className="image-caption">
            <p>{currentContent?.image?.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ancient-actions">
        <button onClick={handleNewExperience} className="ancient-btn primary">
          🔄 Listen to Another Conversation
        </button>
        <button onClick={onStop} className="ancient-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for storytelling and Nano Banana via Segmind API for visuals</p>
      </div>
    </div>
  );
};

export default AncientConversationsExperience;
