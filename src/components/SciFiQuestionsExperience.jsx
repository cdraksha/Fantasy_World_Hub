import React, { useState, useEffect } from 'react';
import useSciFiQuestionsContent from '../hooks/useSciFiQuestionsContent';
import '../styles/scifi-questions.css';

const SciFiQuestionsExperience = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);

  const { generateSciFiQuestion } = useSciFiQuestionsContent();

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await generateSciFiQuestion();
      setCurrentContent(content);
      setQuestionCount(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestion = () => {
    generateQuestion();
  };

  if (isLoading) {
    return (
      <div className="scifi-container">
        <div className="scifi-loading">
          <div className="simple-spinner"></div>
          <h2>Exploring Impossible Questions...</h2>
          <p>Formulating scientific theories for the unreal</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scifi-container">
        <div className="scifi-error">
          <h3>🔬 Scientific Error</h3>
          <p>{error}</p>
          <button onClick={generateQuestion} className="scifi-btn primary">
            Recalibrate
          </button>
          <button onClick={onStop} className="scifi-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scifi-container">
      {/* Header */}
      <div className="scifi-header">
        <h1>🔬 Sci-Fi Questions</h1>
        <p>Scientific theories for anything fictional, impossible, or unreal</p>
        <div className="question-counter">
          <span>Question #{questionCount - 1}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="scifi-main-content">
        <div className="question-panel">
          <div className="question-section">
            <div className="question-label">Question</div>
            <h2 className="question-text">{currentContent?.question}</h2>
          </div>
          
          <div className="answer-section">
            <div className="answer-label">Scientific Theory</div>
            <div className="answer-text">
              {currentContent?.answer}
            </div>
            <div className="word-count">
              {currentContent?.answer?.split(' ').length || 0} words
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="scifi-actions">
        <button onClick={handleNewQuestion} className="scifi-btn primary">
          🔄 Ask Another Question
        </button>
        <button onClick={onStop} className="scifi-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for fun fictional explanations</p>
      </div>
    </div>
  );
};

export default SciFiQuestionsExperience;
