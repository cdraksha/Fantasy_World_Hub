import React, { useState, useEffect } from 'react';
import { generateForceGrid, generateRealityDataFromForce } from '../data/forceMapping';
import useOpenAI from '../hooks/useOpenAI';
import useImageGeneration from '../hooks/useImageGeneration';
import '../styles/fantasy-reality.css';

const FantasyReality = ({ onStop }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  const [error, setError] = useState(null);

  // API hooks
  const { generateSpeech } = useOpenAI();
  const { generateImage } = useImageGeneration();

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Pick random element
      const allForces = ['Fire', 'Water', 'Air', 'Space', 'Time', 'Gravity', 'Mind', 'Body', 'Soul'];
      const randomForce = allForces[Math.floor(Math.random() * allForces.length)];
      
      // Generate reality data
      const reality = generateRealityDataFromForce(randomForce);
      
      // Generate story and image in parallel
      const [story, image] = await Promise.all([
        generateFantasyStory(reality),
        generateFantasyImage(reality)
      ]);

      setCurrentContent({
        force: randomForce,
        reality: reality,
        story: story,
        image: image
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate 200-word fantasy story
  const generateFantasyStory = async (reality) => {
    const { tier, governingLaw, force } = reality;

    const prompt = `
      Write exactly 200 words about a fantasy reality where ${force} is the dominant element.

      This is ${reality.worldType} where the main rule is: ${governingLaw}

      Create an immersive story describing this ${force}-based reality. Include:
      - What this world looks like and feels like
      - How people live in this ${force}-dominated reality
      - How ${governingLaw} shapes everything in this world
      - Specific examples of how ${force} manifests everywhere
      - What makes this place magical and unique

      Write it as a vivid, descriptive fantasy story that makes the reader feel like they're experiencing this reality. Make it exactly 200 words.
    `;

    return await generateSpeech(prompt, {
      worldType: tier,
      governingLaw: governingLaw,
      force: force
    }, 'fantasy-reality');
  };

  // Generate fantasy image
  const generateFantasyImage = async (reality) => {
    const { tier, governingLaw, force } = reality;
    
    const moodMap = {
      'Fire': 'intense, burning, passionate',
      'Water': 'flowing, emotional, adaptive', 
      'Air': 'ethereal, swift, transformative',
      'Space': 'vast, infinite, mysterious',
      'Time': 'temporal, cyclical, eternal',
      'Gravity': 'heavy, binding, inevitable',
      'Mind': 'cerebral, illusory, complex',
      'Body': 'physical, visceral, grounded',
      'Soul': 'spiritual, transcendent, pure'
    };

    const forceMood = moodMap[force];

    const prompt = `
      Cinematic fantasy scene in ${reality.worldType}.
      Visual representation of "${governingLaw}".
      Atmospheric lighting, epic composition, high detail.
      Emotional tone: ${forceMood}.
      Fantasy realism, mythic atmosphere, no text overlays.
      Still frame from epic fantasy film, dramatic perspective.
      Focus on ${force} energy and essence.
    `;

    return await generateImage(prompt, 'fantasy-reality', Date.now());
  };

  const handleNewExperience = () => {
    generateContent();
  };

  if (isLoading) {
    return (
      <div className="fantasy-reality-container">
        <div className="fantasy-loading">
          <div className="cosmic-spinner"></div>
          <h2>🌟 Generating Fantasy Reality</h2>
          <p>Weaving cosmic forces into existence...</p>
          <div className="loading-steps">
            <div className="step">📖 Crafting 200-word story</div>
            <div className="step">🎨 Creating cinematic image</div>
            <div className="step">✨ Manifesting reality</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fantasy-reality-container">
        <div className="fantasy-error">
          <h3>⚡ Generation Error</h3>
          <p>{error}</p>
          <button onClick={generateContent} className="fantasy-btn primary">
            Try Again
          </button>
          <button onClick={onStop} className="fantasy-btn secondary">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fantasy-reality-container">
      {/* Header */}
      <div className="fantasy-header">
        <h1>⚡ Fantasy Reality</h1>
        <p>Elemental Worlds of Imagination</p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="fantasy-main-content">
        {/* Story Text Box */}
        <div className="fantasy-story-panel">
          <div className="story-header">
            <h2>{currentContent?.force} Reality</h2>
            <div className="story-meta">
              <span className="force-type">{currentContent?.force}</span>
              <span className="world-type">{currentContent?.reality?.worldType}</span>
            </div>
          </div>
          
          <div className="story-content">
            {currentContent?.story?.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Generated Image */}
        <div className="fantasy-image-panel">
          <div className="image-container">
            {currentContent?.image ? (
              <img 
                src={currentContent.image.url} 
                alt={`${currentContent.force} Fantasy Reality`}
                className="fantasy-image"
              />
            ) : (
              <div className="image-placeholder">
                <div className="placeholder-icon">🌌</div>
                <p>Fantasy Vision</p>
              </div>
            )}
          </div>
          
          <div className="image-caption">
            <p>A {currentContent?.force}-dominated reality where {currentContent?.reality?.governingLaw?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fantasy-actions">
        <button onClick={handleNewExperience} className="fantasy-btn primary">
          🔄 Generate New Reality
        </button>
        <button onClick={onStop} className="fantasy-btn secondary">
          ← Back to FantasyWorld Hub
        </button>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using Segmind GPT-4 for storytelling and Nano Banana for visuals</p>
      </div>
    </div>
  );
};

export default FantasyReality;
