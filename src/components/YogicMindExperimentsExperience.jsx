import React, { useState, useEffect } from 'react';
import useYogicMindContent from '../hooks/useYogicMindContent';
import '../styles/yogic-mind.css';

const YogicMindExperimentsExperience = ({ onStop }) => {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentExplanation, setCurrentExplanation] = useState(null);
  const [currentThoughtExperiment, setCurrentThoughtExperiment] = useState(null);
  const [currentGlossary, setCurrentGlossary] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState(null);
  const [experimentCount, setExperimentCount] = useState(1);

  const { generateScenario, generateExplanation, generateImage } = useYogicMindContent();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setError(null);
    
    try {
      // Generate scenario
      setIsGeneratingScenario(true);
      const scenario = await generateScenario();
      setCurrentScenario(scenario);
      setIsGeneratingScenario(false);

      // Generate explanation with thought experiment
      setIsGeneratingExplanation(true);
      const content = await generateExplanation(scenario);
      setCurrentExplanation(content.explanation);
      setCurrentThoughtExperiment(content.thoughtExperiment);
      setCurrentGlossary(content.glossary);
      setIsGeneratingExplanation(false);

      // Generate image
      setIsGeneratingImage(true);
      const imageUrl = await generateImage(scenario);
      setCurrentImage(imageUrl);
      setIsGeneratingImage(false);

      setExperimentCount(prev => prev + 1);
    } catch (err) {
      setError(err.message);
      setIsGeneratingScenario(false);
      setIsGeneratingExplanation(false);
      setIsGeneratingImage(false);
    }
  };

  const handleNewExperiment = () => {
    generateContent();
  };

  if (error) {
    return (
      <div className="yogic-container">
        <div className="yogic-error">
          <h3>🧠 Consciousness Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="yogic-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="yogic-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="yogic-container">
      {/* Header */}
      <div className="yogic-header">
        <h1>🧠 Yogic Mind Experiments</h1>
        <p>Explore what happens when consciousness goes to extremes</p>
        <div className="experiment-counter">
          <span>Experiment #{experimentCount - 1}</span>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="yogic-main-content">
        {/* Explanation Panel */}
        <div className="yogic-explanation-panel">
          <div className="explanation-header">
            <h2>{isGeneratingScenario ? 'Selecting Mind State...' : currentScenario?.scenario}</h2>
            <div className="scenario-meta">
              <span className="concepts">{currentScenario?.concepts}</span>
              <span className="intensity">{currentScenario?.intensity}</span>
            </div>
          </div>
          
          <div className="explanation-content">
            {isGeneratingExplanation ? (
              <div className="explanation-loading">
                <p>Exploring consciousness depths...</p>
              </div>
            ) : (
              <>
                {/* 1. What Happens */}
                <div className="what-happens-section">
                  <h3>What Happens</h3>
                  <div className="what-happens-text">
                    {currentExplanation}
                  </div>
                </div>

                {/* 2. Try This Experiment */}
                {currentThoughtExperiment && (
                  <div className="experiment-section">
                    <h3>🎯 Try This Experiment</h3>
                    <div className="experiment-text">
                      {currentThoughtExperiment}
                    </div>
                  </div>
                )}

                {/* 3. Quick Reference */}
                {currentGlossary && (
                  <div className="reference-section">
                    <h3>📚 Quick Reference</h3>
                    <div className="reference-text">
                      {currentGlossary}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Generated Image */}
        <div className="yogic-image-panel">
          <div className="image-container">
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={currentScenario?.scenario}
                className="yogic-image"
              />
            ) : (
              <div className="image-placeholder">
                <span>🎨 {isGeneratingImage ? 'Visualizing consciousness...' : 'Mind visualization will appear here'}</span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="yogic-actions">
        <button 
          onClick={handleNewExperiment} 
          className="yogic-btn primary"
          disabled={isGeneratingScenario || isGeneratingExplanation || isGeneratingImage}
        >
          🔄 Run Another Experiment
        </button>
        <button onClick={onStop} className="yogic-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for consciousness exploration and Nano Banana via Segmind API for visuals</p>
      </div>
    </div>
  );
};

export default YogicMindExperimentsExperience;
