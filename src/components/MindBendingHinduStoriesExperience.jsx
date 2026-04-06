import React, { useState, useEffect } from 'react';
import useMindBendingHinduContent from '../hooks/useMindBendingHinduContent';
import '../styles/mind-bending-hindu.css';

const MindBendingHinduStoriesExperience = ({ onStop }) => {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentStory, setCurrentStory] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState(null);
  const [storyCount, setStoryCount] = useState(1);

  const { generateScenario, generateStory, generateImage } = useMindBendingHinduContent();

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

      // Generate story
      setIsGeneratingStory(true);
      const story = await generateStory(scenario);
      setCurrentStory(story);
      setIsGeneratingStory(false);

      // Generate image
      setIsGeneratingImage(true);
      const imageUrl = await generateImage(scenario);
      setCurrentImage(imageUrl);
      setIsGeneratingImage(false);

      setStoryCount(prev => prev + 1);
    } catch (err) {
      setError(err.message);
      setIsGeneratingScenario(false);
      setIsGeneratingStory(false);
      setIsGeneratingImage(false);
    }
  };

  const handleNewStory = () => {
    generateContent();
  };

  if (error) {
    return (
      <div className="hindu-container">
        <div className="hindu-error">
          <h3>🕉️ Story Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="hindu-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="hindu-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hindu-container">
      {/* Header */}
      <div className="hindu-header">
        <h1>🕉️ Mind-Bending Stories from Dharmic Cultures</h1>
        <p>Amazing stories that will blow your mind from Hindu, Buddhist, Jain, and Sikh traditions</p>
        <div className="story-counter">
          <span>Story #{storyCount - 1}</span>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="hindu-main-content">
        {/* Story Text Box */}
        <div className="hindu-story-panel">
          <div className="story-header">
            <h2>{isGeneratingScenario ? 'Selecting Ancient Tale...' : currentScenario?.title}</h2>
            <div className="story-meta">
              <span className="story-name">{currentScenario?.storyName}</span>
              <span className="characters">{currentScenario?.characters}</span>
            </div>
          </div>
          
          <div className="story-content">
            {isGeneratingStory ? (
              <div className="story-loading">
                <p>Channeling ancient wisdom...</p>
              </div>
            ) : (
              <div className="story-text">
                {currentStory?.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Generated Image */}
        <div className="hindu-image-panel">
          <div className="image-container">
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={currentScenario?.title}
                className="hindu-image"
              />
            ) : (
              <div className="image-placeholder">
                <span>🎨 {isGeneratingImage ? 'Manifesting divine imagery...' : 'Divine vision will appear here'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="hindu-actions">
        <button 
          onClick={handleNewStory} 
          className="hindu-btn primary"
          disabled={isGeneratingScenario || isGeneratingStory || isGeneratingImage}
        >
          🔄 Experience Another Tale
        </button>
        <button onClick={onStop} className="hindu-btn secondary">
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

export default MindBendingHinduStoriesExperience;
