import React, { useState, useEffect } from 'react';
import useFunnyAIChatboxContent from '../hooks/useFunnyAIChatboxContent';
import '../styles/funny-ai-chatbox.css';

const FunnyAIChatboxExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [currentAI, setCurrentAI] = useState('');
  const [error, setError] = useState(null);

  const { 
    generateInitialPrompt, 
    generateAIResponse 
  } = useFunnyAIChatboxContent();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleCreatePrompt = async () => {
    setIsGeneratingPrompt(true);
    setError(null);
    
    try {
      const prompt = await generateInitialPrompt();
      setInitialPrompt(prompt);
      setConversation([{
        id: Date.now(),
        type: 'prompt',
        content: prompt,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleUseUserPrompt = () => {
    if (!userPrompt.trim()) return;
    
    setInitialPrompt(userPrompt.trim());
    setConversation([{
      id: Date.now(),
      type: 'prompt',
      content: userPrompt.trim(),
      timestamp: new Date()
    }]);
  };

  const handleAIResponse = async (aiModel) => {
    if (isGeneratingResponse || !initialPrompt) return;
    
    setIsGeneratingResponse(true);
    setCurrentAI(aiModel);
    setError(null);
    
    try {
      const response = await generateAIResponse(aiModel, conversation);
      
      const newMessage = {
        id: Date.now(),
        type: 'ai_response',
        aiModel: aiModel,
        content: response,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingResponse(false);
      setCurrentAI('');
    }
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

  if (isLoading) {
    return (
      <div className="funny-ai-container">
        <div className="ai-loading">
          <div className="chat-spinner"></div>
          <h2>Initializing AI Chatbox...</h2>
          <p>Preparing 5 AI personalities for conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="funny-ai-container">
      {/* Header */}
      <div className="ai-header">
        <h1>🤖 Funny AI Chatbox</h1>
        <p>Watch 5 AI personalities have hilarious conversations</p>
      </div>

      {/* Prompt Generation */}
      {!initialPrompt && (
        <div className="prompt-section">
          <div className="prompt-card">
            <h3>Start the Conversation</h3>
            <p>Enter your own prompt or let AI generate one</p>
            
            <div className="prompt-input-section">
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter your conversation topic..."
                className="prompt-input"
                onKeyPress={(e) => e.key === 'Enter' && handleUseUserPrompt()}
              />
              <button 
                onClick={handleUseUserPrompt}
                disabled={!userPrompt.trim()}
                className="use-prompt-btn"
              >
                Use This Prompt
              </button>
            </div>
            
            <div className="prompt-divider">
              <span>OR</span>
            </div>
            
            <button 
              onClick={handleCreatePrompt}
              disabled={isGeneratingPrompt}
              className="create-prompt-btn"
            >
              {isGeneratingPrompt ? 'Creating Prompt...' : 'AI Generate Prompt'}
            </button>
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      {conversation.length > 0 && (
        <div className="conversation-section">
          <div className="conversation-thread">
            {conversation.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'prompt' && (
                  <div className="prompt-message">
                    <div className="message-header">
                      <span className="prompt-label">🎯 Conversation Starter</span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                )}
                
                {message.type === 'ai_response' && (
                  <div className="ai-message">
                    <div className="message-header">
                      <span className="ai-name">{getAIName(message.aiModel)}</span>
                      <span className="ai-personality">{getAIPersonality(message.aiModel)}</span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator for current AI */}
            {isGeneratingResponse && (
              <div className="message ai_response">
                <div className="ai-message generating">
                  <div className="message-header">
                    <span className="ai-name">{getAIName(currentAI)}</span>
                    <span className="ai-personality">{getAIPersonality(currentAI)}</span>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Selection Buttons */}
      {initialPrompt && (
        <div className="ai-selection-section">
          <div className="selection-header">
            <h3>Who should respond next?</h3>
          </div>
          <div className="ai-buttons">
            <button 
              onClick={() => handleAIResponse('gpt-5.2')}
              disabled={isGeneratingResponse}
              className="ai-btn gpt"
            >
              GPT 5.2
              <span className="personality">The Analyst</span>
            </button>
            
            <button 
              onClick={() => handleAIResponse('gemini-3-pro')}
              disabled={isGeneratingResponse}
              className="ai-btn gemini"
            >
              Gemini 3 Pro
              <span className="personality">The Creative</span>
            </button>
            
            <button 
              onClick={() => handleAIResponse('claude-4-sonnet')}
              disabled={isGeneratingResponse}
              className="ai-btn claude"
            >
              Claude 4 Sonnet
              <span className="personality">The Philosopher</span>
            </button>
            
            <button 
              onClick={() => handleAIResponse('llama-v3p1-70b-instruct')}
              disabled={isGeneratingResponse}
              className="ai-btn llama"
            >
              Llama 3.1 70B
              <span className="personality">The Contrarian</span>
            </button>
            
            <button 
              onClick={() => handleAIResponse('deepseek-chat')}
              disabled={isGeneratingResponse}
              className="ai-btn deepseek"
            >
              Deepseek
              <span className="personality">The Mystic</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-section">
          <div className="error-message">
            <h3>🚨 Generation Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Return to Hub */}
      <div className="ai-actions">
        <button onClick={onStop} className="return-btn">
          ← Return to FantasyWorld Hub
        </button>
      </div>
    </div>
  );
};

export default FunnyAIChatboxExperience;
