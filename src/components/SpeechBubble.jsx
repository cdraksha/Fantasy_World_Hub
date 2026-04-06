import React from 'react';

const SpeechBubble = ({ character, text, position, onContinue, onClose, isLoading }) => {
  const isRobot = character.type === 'robot';
  
  return (
    <div
      className={`speech-bubble ${isRobot ? 'robot' : ''}`}
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.max(position.y - 100, 20),
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
        {character.name || character.type}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        {isLoading ? (
          <span>
            <span style={{ opacity: 0.6 }}>Thinking</span>
            <span className="loading-dots">...</span>
          </span>
        ) : (
          text
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button 
          className="continue-button" 
          onClick={onContinue}
          disabled={isLoading}
        >
          Continue...
        </button>
        <button 
          className="continue-button" 
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SpeechBubble;
