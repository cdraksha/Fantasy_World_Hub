import React, { useState, useEffect } from 'react';
import useAIRoastBattleContent from '../hooks/useAIRoastBattleContent';
import '../styles/ai-roast-battle.css';

const AIRoastBattleExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [roastFeed, setRoastFeed] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('select-roaster'); // 'select-roaster', 'roasting', 'select-responder'
  const [currentRoaster, setCurrentRoaster] = useState('');
  const [isGeneratingRoasts, setIsGeneratingRoasts] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [error, setError] = useState(null);

  const { 
    generateRoasts, 
    generateResponse 
  } = useAIRoastBattleContent();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSelectRoaster = async (aiModel) => {
    setCurrentRoaster(aiModel);
    setCurrentPhase('roasting');
    setIsGeneratingRoasts(true);
    setError(null);
    
    try {
      const roasts = await generateRoasts(aiModel);
      
      // Add roasts to feed one by one for dramatic effect
      const roastEntries = roasts.map((roast, index) => ({
        id: Date.now() + index,
        type: 'roast',
        roaster: aiModel,
        target: roast.target,
        content: roast.content,
        timestamp: new Date()
      }));
      
      setRoastFeed(roastEntries);
      setCurrentPhase('select-responder');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingRoasts(false);
    }
  };

  const handleSelectResponder = async (aiModel) => {
    setIsGeneratingResponse(true);
    setError(null);
    
    try {
      const response = await generateResponse(aiModel, roastFeed, currentRoaster);
      
      const responseEntry = {
        id: Date.now(),
        type: 'response',
        responder: aiModel,
        content: response,
        timestamp: new Date()
      };
      
      setRoastFeed(prev => [...prev, responseEntry]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleStartAgain = () => {
    setRoastFeed([]);
    setCurrentPhase('select-roaster');
    setCurrentRoaster('');
    setError(null);
  };

  const getAIName = (model) => {
    const names = {
      'gpt-5.2': 'GPT 5.2',
      'gemini-3-pro': 'Gemini 3 Pro',
      'claude-4-sonnet': 'Claude 4 Sonnet',
      'llama-v3p1-70b-instruct': 'Llama 3.1 70B',
      'deepseek-chat': 'Deepseek'
    };
    return names[model] || model;
  };

  const getAIPersonality = (model) => {
    const personalities = {
      'gpt-5.2': 'The Analyst',
      'gemini-3-pro': 'The Creative',
      'claude-4-sonnet': 'The Philosopher',
      'llama-v3p1-70b-instruct': 'The Contrarian',
      'deepseek-chat': 'The Mystic'
    };
    return personalities[model] || '';
  };

  const aiModels = ['gpt-5.2', 'gemini-3-pro', 'claude-4-sonnet', 'llama-v3p1-70b-instruct', 'deepseek-chat'];

  if (isLoading) {
    return (
      <div className="roast-battle-container">
        <div className="roast-loading">
          <div className="roast-spinner"></div>
          <p>Preparing the roast arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="roast-battle-container">
      {/* Header */}
      <div className="roast-header">
        <h1>🔥 AI Roast Battle</h1>
        <p>Watch AIs roast each other with savage wit and clever comebacks</p>
      </div>

      {/* Roaster Selection */}
      {currentPhase === 'select-roaster' && (
        <div className="roaster-selection">
          <div className="selection-card">
            <h3>Choose Your Roaster</h3>
            <p>Select which AI will roast all the others</p>
            
            <div className="ai-selection-grid">
              {aiModels.map((model) => (
                <button 
                  key={model}
                  onClick={() => handleSelectRoaster(model)}
                  disabled={isGeneratingRoasts}
                  className={`ai-select-btn ${model.replace(/[^a-z0-9]/gi, '-')}`}
                >
                  {getAIName(model)}
                  <span className="personality">{getAIPersonality(model)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roast Feed */}
      {roastFeed.length > 0 && (
        <div className="roast-feed-section">
          <div className="roast-feed">
            {roastFeed.map((entry) => (
              <div key={entry.id} className={`roast-entry ${entry.type}`}>
                {entry.type === 'roast' ? (
                  <div className="roast-message">
                    <div className="roast-header-line">
                      <span className="roaster-name">{getAIName(entry.roaster)}</span>
                      <span className="roast-arrow">🔥→</span>
                      <span className="target-name">{getAIName(entry.target)}</span>
                    </div>
                    <div className="roast-content">{entry.content}</div>
                  </div>
                ) : (
                  <div className="response-message">
                    <div className="response-header-line">
                      <span className="responder-name">💥 {getAIName(entry.responder)} responds:</span>
                    </div>
                    <div className="response-content">{entry.content}</div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {(isGeneratingRoasts || isGeneratingResponse) && (
              <div className="generating-indicator">
                <div className="roast-spinner-small"></div>
                <p>{isGeneratingRoasts ? 'Generating roasts...' : 'Generating response...'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responder Selection */}
      {currentPhase === 'select-responder' && !isGeneratingRoasts && (
        <div className="responder-selection">
          <div className="selection-card">
            <h3>Who Responds Next?</h3>
            <p>Select any AI to deliver a comeback</p>
            
            <div className="ai-selection-grid">
              {aiModels.map((model) => (
                <button 
                  key={model}
                  onClick={() => handleSelectResponder(model)}
                  disabled={isGeneratingResponse}
                  className={`ai-select-btn ${model.replace(/[^a-z0-9]/gi, '-')}`}
                >
                  {getAIName(model)}
                  <span className="personality">{getAIPersonality(model)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <div className="error-card">
            <h3>🚨 Roast Failed</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="bottom-controls">
        <button 
          onClick={handleStartAgain}
          className="start-again-btn"
        >
          🔄 Start Again with New Roaster
        </button>
        
        <button 
          onClick={onStop}
          className="return-hub-btn"
        >
          ← Return to FantasyWorld Hub
        </button>
      </div>
    </div>
  );
};

export default AIRoastBattleExperience;
