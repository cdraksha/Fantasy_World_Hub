import React, { useState, useEffect } from 'react';
import useSciFiMurderMysteryContent from '../hooks/useSciFiMurderMysteryContent';
import '../styles/scifi-murder-mystery.css';

const SciFiMurderMysteryExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const { generateSciFiMurderMysteryContent, error } = useSciFiMurderMysteryContent();

  const generateContent = async () => {
    setIsLoading(true);
    setShowSolution(false);
    try {
      const content = await generateSciFiMurderMysteryContent();
      setCurrentContent(content);
    } catch (err) {
      console.error('Failed to generate content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateContent();
  }, []);

  const handleNewMystery = () => {
    generateContent();
  };

  const handleRevealSolution = () => {
    setShowSolution(true);
  };

  if (isLoading) {
    return (
      <div className="scifi-murder-mystery-container">
        <div className="scifi-murder-mystery-loading">
          <div className="scifi-murder-mystery-spinner"></div>
          <h2>Investigating Crime Scene...</h2>
          <p>Analyzing quantum evidence and holographic alibis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scifi-murder-mystery-container">
        <div className="scifi-murder-mystery-error">
          <h3>🔍 Investigation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="scifi-murder-mystery-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="scifi-murder-mystery-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scifi-murder-mystery-container">
      {/* Header */}
      <div className="scifi-murder-mystery-header">
        <h1>🔍 Sci-Fi Murder Mystery</h1>
        <p>Solve Futuristic Crimes with Impossible Technology</p>
      </div>

      {/* Main Content - Text Left, Image Right */}
      <div className="scifi-murder-mystery-main-content">
        {/* Text Panel - Left Side */}
        <div className="scifi-murder-mystery-text-panel">
          <div className="mystery-header">
            <h2>{currentContent?.title}</h2>
            <div className="case-details">
              <span className="location">📍 {currentContent?.location}</span>
              <span className="victim">💀 Victim: {currentContent?.victim}</span>
            </div>
          </div>
          
          <div className="mystery-story">
            <h3>The Case:</h3>
            <p>{currentContent?.story}</p>
          </div>

          <div className="clues-section">
            <h3>Evidence & Clues:</h3>
            <ul>
              {currentContent?.clues?.map((clue, index) => (
                <li key={index}>
                  <strong>Clue {index + 1}:</strong> {clue}
                </li>
              ))}
            </ul>
          </div>

          <div className="suspects-section">
            <h3>Suspects:</h3>
            <ul>
              {currentContent?.suspects?.map((suspect, index) => (
                <li key={index}>
                  <strong>{suspect.name}:</strong> {suspect.description}
                </li>
              ))}
            </ul>
          </div>

          {!showSolution ? (
            <button 
              onClick={handleRevealSolution} 
              className="reveal-btn"
            >
              🕵️ Reveal the Murderer
            </button>
          ) : (
            <div className="solution-section">
              <h3>🎯 Solution:</h3>
              <div className="murderer-reveal">
                <strong>The Murderer: {currentContent?.solution?.murderer}</strong>
              </div>
              <div className="method-reveal">
                <strong>Method:</strong> {currentContent?.solution?.method}
              </div>
              <div className="explanation">
                <strong>How:</strong> {currentContent?.solution?.explanation}
              </div>
            </div>
          )}
        </div>

        {/* Image Panel - Right Side */}
        <div className="scifi-murder-mystery-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="scifi-murder-mystery-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🔍</div>
                <p>Crime Scene Image</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="scifi-murder-mystery-actions">
        <button onClick={handleNewMystery} className="scifi-murder-mystery-btn primary">
          🔄 New Mystery
        </button>
        <button onClick={onStop} className="scifi-murder-mystery-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>
    </div>
  );
};

export default SciFiMurderMysteryExperience;
