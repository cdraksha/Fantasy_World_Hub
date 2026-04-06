import React, { useState } from 'react';
import { generateForceGrid, generateRealityDataFromForce } from '../data/forceMapping';
import useOpenAI from '../hooks/useOpenAI';
import useImageGeneration from '../hooks/useImageGeneration';
import '../styles/fantasy-escape.css';

const FantasyEscape = ({ onStop }) => {
  const [forceGrid, setForceGrid] = useState([]);
  const [selectedForce, setSelectedForce] = useState(null);
  const [realityData, setRealityData] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // API hooks
  const { generateSpeech } = useOpenAI();
  const { generateImage } = useImageGeneration();

  // Generate new grid
  const generateNewGrid = React.useCallback(() => {
    console.log('generateNewGrid called');
    const newGrid = generateForceGrid();
    console.log('Generated grid:', newGrid);
    setForceGrid(newGrid);
    setSelectedForce(null);
    setRealityData(null);
    setGeneratedContent(null);
  }, []);

  // Generate new grid on component mount
  React.useEffect(() => {
    console.log('FantasyEscape component mounted');
    generateNewGrid();
  }, [generateNewGrid]);

  // Handle Force selection from grid
  const handleForceSelect = (force) => {
    console.log('Force selected:', force);
    setSelectedForce(force);
    // Move selected force to center and generate reality
    generateRealityFromForce(force);
  };

  // Generate reality from selected Force
  const generateRealityFromForce = async (force) => {
    console.log('Starting reality generation for force:', force);
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      // Calculate reality parameters from selected Force
      const reality = generateRealityDataFromForce(force);
      console.log('Reality data generated:', reality);
      setRealityData(reality);

      console.log('Starting image and story generation...');
      
      // Generate story first
      console.log('Generating story...');
      const story = await generateMythicStory(reality);
      console.log('Story generated:', story);
      
      // Generate image
      console.log('Generating image...');
      const image = await generateFantasyImage(reality);
      console.log('Image generated:', image);

      console.log('Setting generated content...');
      setGeneratedContent({ image, story });
      console.log('Content set successfully');
    } catch (error) {
      console.error('Error generating reality:', error);
      console.error('Error details:', error.message, error.stack);
      // Fallback content
      setGeneratedContent({
        image: null,
        story: `A ${force}-based reality emerges from the cosmic void. In this world, ${force} governs all existence, shaping the laws of physics and the nature of life itself. Here, the essence of ${force} flows through every particle, every thought, every dream. This is a place where the impossible becomes inevitable, and the power of ${force} transforms ordinary existence into something extraordinary and magical.`
      });
    } finally {
      console.log('Setting isGenerating to false');
      setIsGenerating(false);
    }
  };

  // Generate fantasy image using Nano Banana
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

    return await generateImage(prompt, 'fantasy-escape', Date.now());
  };

  // Generate mythic story using GPT-4
  const generateMythicStory = async (reality) => {
    const { tier, governingLaw, force } = reality;

    const prompt = `
      Write exactly 500 words about a fantasy reality where ${force} is the dominant element.

      This is ${reality.worldType} where the main rule is: ${governingLaw}

      Create an immersive story describing this ${force}-based reality. Include:
      - What this world looks like and feels like
      - How people live in this ${force}-dominated reality
      - How ${governingLaw} shapes everything in this world
      - Specific examples of how ${force} manifests everywhere
      - What makes this place magical and unique

      Write it as a vivid, descriptive fantasy story that makes the reader feel like they're experiencing this reality. Make it exactly 500 words.
    `;

    return await generateSpeech(prompt, {
      worldType: tier,
      governingLaw: governingLaw,
      force: force
    }, 'fantasy-escape');
  };

  // Render horizontal 9-Force sequence
  const renderForceSequence = () => {
    if (!realityData || !realityData.forceSequence) return null;

    return (
      <div className="force-sequence">
        {realityData.forceSequence.map((force, index) => (
          <React.Fragment key={index}>
            <div className="force-item">
              <span className="force-name">{force}</span>
            </div>
            {index < realityData.forceSequence.length - 1 && (
              <div className="force-arrow">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render 3x3 grid with selection
  const renderGrid = () => {
    console.log('renderGrid called, forceGrid:', forceGrid);
    if (!forceGrid.length) {
      console.log('No forceGrid, returning null');
      return null;
    }

    // Create grid with selected force in center
    let displayGrid = [...forceGrid];
    if (selectedForce) {
      // Move selected force to center (position 4)
      const selectedIndex = displayGrid.indexOf(selectedForce);
      if (selectedIndex !== -1 && selectedIndex !== 4) {
        // Swap selected force with center
        [displayGrid[4], displayGrid[selectedIndex]] = [displayGrid[selectedIndex], displayGrid[4]];
      }
    }

    const matrix = [
      [displayGrid[0], displayGrid[1], displayGrid[2]],
      [displayGrid[3], displayGrid[4], displayGrid[5]], 
      [displayGrid[6], displayGrid[7], displayGrid[8]]
    ];

    console.log('Rendering grid matrix:', matrix);

    return (
      <div className="force-grid">
        {matrix.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((force, colIndex) => {
              const isCenter = rowIndex === 1 && colIndex === 1;
              const isSelected = force === selectedForce;
              return (
                <div 
                  key={`${rowIndex}-${colIndex}`} 
                  className={`grid-cell ${isCenter ? 'center-cell' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    console.log('Grid cell clicked:', force);
                    handleForceSelect(force);
                  }}
                >
                  <span className="force-name">{force}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Show loading screen during generation
  if (isGenerating) {
    return (
      <div className="fantasy-escape-container">
        <div className="loading-screen">
          <div className="loading-content">
            <h2>⚡ Fantasy Escape</h2>
            <div className="loading-spinner"></div>
            <p>Weaving cosmic forces into reality...</p>
            <p>Generating your mythic destiny...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fantasy-escape-container">
      {/* Header */}
      <div className="fantasy-header">
        <h2>⚡ Fantasy Escape</h2>
        <p>Reality Engine</p>
        <button className="back-button" onClick={onStop}>
          ← Back to Hub
        </button>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="main-panels">
        {/* Left Panel - Generated Content */}
        <div className="output-panel">
{isGenerating ? (
            <div className="generation-loading">
              <div className="loading-content">
                <h3>🌟 Generating Reality</h3>
                <div className="loading-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <p>Weaving {selectedForce} into existence...</p>
                  <div className="loading-steps">
                    <div className="step">📖 Crafting 500-word story</div>
                    <div className="step">🎨 Creating cinematic image</div>
                    <div className="step">✨ Manifesting reality</div>
                  </div>
                </div>
              </div>
            </div>
          ) : generatedContent ? (
            <>
              {/* Generated Image */}
              <div className="image-container">
                {generatedContent.image ? (
                  <img 
                    src={generatedContent.image.url} 
                    alt="Generated Fantasy Scene"
                    className="fantasy-image"
                  />
                ) : (
                  <div className="image-placeholder">
                    <span>🌌</span>
                    <p>Reality Manifesting...</p>
                  </div>
                )}
              </div>

              {/* Generated Story */}
              <div className="story-container">
                <div className="story-text">
                  <p>{generatedContent.story}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-content">
              <div className="welcome-text">
                <h3>Cosmic Reality Generator</h3>
                <p>Click any Force in the grid to generate a 500-word fantasy reality story about that element. Each Force creates a unique world with its own governing laws and magical properties.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Force Sequence & Controls */}
        <div className="sequence-panel">
          <div className="panel-header">
            <h4>Cosmic Forces</h4>
          </div>

          {/* 3x3 Force Grid */}
          <div className="grid-container">
            {renderGrid()}
          </div>

          {/* Generate New Grid Button */}
          <button 
            className="generate-button"
            onClick={generateNewGrid}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate New Grid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FantasyEscape;
