import React, { useState, useEffect } from 'react';
import useMedievalMurderMysteryContent from '../hooks/useMedievalMurderMysteryContent';
import '../styles/medieval-murder-mystery.css';

const MedievalMurderMysteryExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const { generateMedievalMurderMysteryContent, error } = useMedievalMurderMysteryContent();

  const generateContent = async () => {
    setIsLoading(true);
    setShowSolution(false);
    try {
      const content = await generateMedievalMurderMysteryContent();
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
      <div className="medieval-murder-mystery-container">
        <div className="medieval-murder-mystery-loading">
          <div className="medieval-murder-mystery-spinner"></div>
          <h2>Investigating Medieval Crime...</h2>
          <p>Examining wax seals and questioning witnesses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medieval-murder-mystery-container">
        <div className="medieval-murder-mystery-error">
          <h3>🗡️ Investigation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="medieval-murder-mystery-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="medieval-murder-mystery-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medieval-murder-mystery-container">
      {/* Header */}
      <div className="medieval-murder-mystery-header">
        <h1>🗡️ Medieval Murder Mystery</h1>
        <p>Solve Historical Crimes in Authentic Medieval Settings</p>
      </div>

      {/* Main Content - Text Left, Image Right */}
      <div className="medieval-murder-mystery-main-content">
        {/* Text Panel - Left Side */}
        <div className="medieval-murder-mystery-text-panel">
          <div className="mystery-header">
            <h2>{currentContent?.title}</h2>
            <div className="case-details">
              <span className="location">🏰 {currentContent?.location}</span>
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
              <h3>⚖️ Solution:</h3>
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
        <div className="medieval-murder-mystery-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={currentContent.image.prompt}
                className="medieval-murder-mystery-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🗡️</div>
                <p>Crime Scene Image</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="medieval-murder-mystery-actions">
        <button onClick={handleNewMystery} className="medieval-murder-mystery-btn primary">
          🔄 New Mystery
        </button>
        <button onClick={onStop} className="medieval-murder-mystery-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>
    </div>
  );
};

export default MedievalMurderMysteryExperience;
