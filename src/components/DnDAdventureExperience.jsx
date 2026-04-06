import React, { useState } from 'react';
import useDnDAdventureContent from '../hooks/useDnDAdventureContent';
import '../styles/dnd-adventure.css';

const DnDAdventureExperience = ({ onStop }) => {
  const [currentScene, setCurrentScene] = useState(null);
  const [sceneHistory, setSceneHistory] = useState([]);
  const [adventureContext, setAdventureContext] = useState('');
  const { generateDnDAdventureContent, isGenerating, error } = useDnDAdventureContent();

  const startNewAdventure = async () => {
    try {
      const scene = await generateDnDAdventureContent(1, [], '');
      setCurrentScene(scene);
      setSceneHistory([scene]);
      setAdventureContext(scene.sceneText);
    } catch (err) {
      console.error('Failed to start D&D adventure:', err);
    }
  };

  const handleDiceChoice = async (choiceIndex, choiceText) => {
    if (currentScene.sceneNumber >= 15) {
      // Adventure is complete
      return;
    }

    try {
      const newChoices = [...currentScene.previousChoices, `${currentScene.diceType}:${choiceText}`];
      const newContext = `${adventureContext} Previous choice: ${choiceText}.`;
      
      const nextScene = await generateDnDAdventureContent(
        currentScene.sceneNumber + 1,
        newChoices,
        newContext
      );
      
      setCurrentScene(nextScene);
      setSceneHistory([...sceneHistory, nextScene]);
      setAdventureContext(newContext);
    } catch (err) {
      console.error('Failed to generate next scene:', err);
    }
  };

  const renderDiceButtons = () => {
    if (!currentScene) return null;

    const { diceType, options } = currentScene;
    
    // For d20, show as ranges
    if (diceType === 'd20' && options.length === 4) {
      return (
        <div className="dice-buttons d20-ranges">
          {options.map((option, index) => {
            const ranges = ['1-5', '6-10', '11-15', '16-20'];
            return (
              <button
                key={index}
                className="dice-button d20-range"
                onClick={() => handleDiceChoice(index, option)}
                disabled={isGenerating}
              >
                <span className="dice-range">{ranges[index]}</span>
                <span className="dice-outcome">{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // For other dice types, show as numbered buttons
    return (
      <div className={`dice-buttons ${diceType}-grid`}>
        {options.map((option, index) => (
          <button
            key={index}
            className="dice-button numbered"
            onClick={() => handleDiceChoice(index, option)}
            disabled={isGenerating}
          >
            <span className="dice-number">{index + 1}</span>
            <span className="dice-outcome">{option}</span>
          </button>
        ))}
      </div>
    );
  };

  // Initial welcome state
  if (!currentScene && !isGenerating && !error) {
    return (
      <div className="dnd-adventure-container">
        <div className="dnd-adventure-welcome">
          <h1>🎲 D&D Adventure</h1>
          <p>Embark on an epic 15-scene fantasy adventure where your dice choices shape the story!</p>
          
          <div className="adventure-instructions">
            <h3>How to Play:</h3>
            <ul>
              <li>Read each scene carefully</li>
              <li>Choose your dice roll by clicking a button</li>
              <li>Watch your story unfold based on your choices</li>
              <li>Complete all 15 scenes to finish your adventure</li>
            </ul>
          </div>

          <div className="dnd-adventure-actions">
            <button 
              className="dnd-adventure-btn primary large"
              onClick={startNewAdventure}
            >
              Begin Adventure
            </button>
            <button className="dnd-adventure-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="dnd-adventure-container">
        <div className="dnd-adventure-loading">
          <div className="dnd-spinner"></div>
          <h2>Rolling the Dice of Fate...</h2>
          <p>Generating your next adventure scene</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dnd-adventure-container">
        <div className="dnd-adventure-error">
          <h3>Adventure Failed</h3>
          <p>{error}</p>
          <div className="dnd-adventure-actions">
            <button className="dnd-adventure-btn primary" onClick={startNewAdventure}>
              Start New Adventure
            </button>
            <button className="dnd-adventure-btn secondary" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main adventure scene
  if (currentScene) {
    const isComplete = currentScene.sceneNumber >= 15;
    
    return (
      <div className="dnd-adventure-container">
        {/* Header */}
        <div className="dnd-adventure-header">
          <h1>🎲 D&D Adventure</h1>
          <div className="scene-progress">
            Scene {currentScene.sceneNumber} of 15
          </div>
        </div>

        {/* Scene Content */}
        <div className="dnd-adventure-content">
          <div className="scene-text">
            {currentScene.sceneText.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {!isComplete && (
            <div className="dice-section">
              <div className="dice-prompt">
                <h3>{currentScene.dicePrompt}</h3>
              </div>
              {renderDiceButtons()}
            </div>
          )}

          {isComplete && (
            <div className="adventure-complete">
              <h2>🏆 Adventure Complete!</h2>
              <p>Your epic journey has reached its conclusion. Well played, adventurer!</p>
              <div className="dnd-adventure-actions">
                <button 
                  className="dnd-adventure-btn primary"
                  onClick={startNewAdventure}
                >
                  Start New Adventure
                </button>
                <button className="dnd-adventure-btn secondary" onClick={onStop}>
                  Return to Hub
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isComplete && (
          <div className="dnd-adventure-footer">
            <button className="dnd-adventure-btn secondary small" onClick={onStop}>
              Return to Hub
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default DnDAdventureExperience;
