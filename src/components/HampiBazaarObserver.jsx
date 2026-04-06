import React, { useState, useCallback, useEffect } from 'react'
import useOpenAI from '../hooks/useOpenAI'
import useImageGeneration from '../hooks/useImageGeneration'
import useMusicGeneration from '../hooks/useMusicGeneration'
import { getRandomHampiPersonality } from '../data/hampiBazaarPersonalities';

const HampiBazaarObserver = ({ onStop }) => {
  const [currentScene, setCurrentScene] = useState('');
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [sceneCount, setSceneCount] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);

  const { generateSpeech } = useOpenAI();
  const { generateImage, isGenerating } = useImageGeneration();
  const { 
    generateMusic, 
    toggleMute, 
    isGeneratingMusic, 
    isPlaying, 
    isMuted, 
    currentTrack,
    audioRef 
  } = useMusicGeneration();

  const generateObservation = useCallback(async () => {
    console.log('🚀 generateObservation called - isActive:', isActive, 'isGeneratingScene:', isGeneratingScene, 'isGenerating:', isGenerating, 'imageGenerated:', imageGenerated);
    
    if (!isActive || isGeneratingScene || isGenerating || imageGenerated) return; // Prevent multiple calls

    console.log('✅ Proceeding with Hampi bazaar observation generation');
    setIsGeneratingScene(true);
    
    // Get random characters for the scene
    const character1 = getRandomHampiPersonality();
    const character2 = Math.random() > 0.5 ? getRandomHampiPersonality() : null;
    
    // Create context for the immersive experience in 1458 Hampi
    const sceneContext = {
      situation: 'Create a deeply immersive, peaceful Hampi bazaar experience using second person perspective',
      atmosphere: 'peaceful, imaginative, calming 1458 Vijayanagara Empire bazaar',
      characters: character2 
        ? `${character1.name} (${character1.description}) and ${character2.name} (${character2.description})`
        : `${character1.name} (${character1.description})`,
      setting: 'Historic Hampi bazaar during the golden age of Vijayanagara Empire',
      sensoryDetails: 'warm Karnataka sun, stone architecture, cardamom scents, temple bells, silk merchants, spice traders'
    };

    try {
      console.log('🏛️ Generating immersive Hampi bazaar observation...');
      
      // Generate the immersive observation using ChatGPT
      const response = await generateSpeech(
        `Create a peaceful, immersive observation of being in the Hampi bazaar in 1458 AD. Include sensory details like warm stone, cardamom scents, temple sounds. Make it feel real and calming using second person perspective.`, 
        sceneContext,
        'hampi-bazaar'
      );

      // Parse the response
      const observationMatch = response.match(/OBSERVATION:\s*(.*?)(?=IMAGE_PROMPT:|$)/s);
      const promptMatch = response.match(/IMAGE_PROMPT:\s*(.*?)$/s);

      const observation = observationMatch ? observationMatch[1].trim() : response;
      const imagePrompt = promptMatch ? promptMatch[1].trim() : `Historic Hampi bazaar scene: ${observation}`;

      setCurrentScene(observation);
      
      // Generate image only once per scene - capture scene count before increment
      const currentSceneForImage = sceneCount;
      console.log('🎨 About to generate Hampi historical image with prompt:', imagePrompt);
      console.log('🔢 Scene count for this image:', currentSceneForImage);
      
      // Keep generating state active while image is being generated
      const generatedImage = await generateImage(imagePrompt, `hampi_scene_${Date.now()}`, currentSceneForImage, 'hampi-bazaar');
      console.log('🖼️ Generated Hampi image result:', generatedImage);
      
      if (generatedImage) {
        setCurrentImage(generatedImage);
        setImageGenerated(true);
        console.log('✅ Hampi image set successfully and imageGenerated set to true');
      } else {
        console.log('❌ No Hampi image returned');
      }
      
      // Only set generating to false after image is complete
      setIsGeneratingScene(false);

    } catch (error) {
      console.error('Error generating Hampi observation:', error);
      setCurrentScene('You sit peacefully in the shade of the great Virupaksha temple, watching the gentle flow of life in the historic bazaar around you...');
      setIsGeneratingScene(false);
    }
  }, []); // Remove dependencies to prevent re-renders

  // Start the first observation and music when component mounts (only once)
  useEffect(() => {
    if (!hasStarted) {
      console.log('🚀 Starting Hampi Bazaar experience...');
      setHasStarted(true);
      generateObservation();
      generateMusic('hampi-bazaar');
    }
  }, [hasStarted]);

  // Manual control - no auto timer
  const handleNext = () => {
    if (isActive && !isGeneratingScene && !isGenerating) {
      setSceneCount(prev => prev + 1);
      setImageGenerated(false); // Reset for new scene
      setCurrentImage(null); // Clear previous image
      generateObservation();
    }
  };

  const handleStop = () => {
    setIsActive(false);
    onStop();
  };

  return (
    <div className="observer-container hampi-theme">
      {/* Header with controls */}
      <div className="observer-header hampi-header">
        <h2>🏛️ Hampi Bazaar Observer</h2>
        <div className="header-controls">
          <div className="music-controls">
            {isGeneratingMusic ? (
              <button className="music-button generating" disabled>
                🎵 Generating Music...
              </button>
            ) : currentTrack ? (
              <button 
                className={`music-button ${isMuted ? 'muted' : 'playing'}`}
                onClick={toggleMute}
                title={isMuted ? 'Unmute Music' : 'Mute Music'}
              >
                {isMuted ? '🔇' : '🎵'} {isMuted ? 'Muted' : 'Music'}
              </button>
            ) : (
              <button className="music-button disabled" disabled>
                🎵 No Music
              </button>
            )}
          </div>
          <button 
            className="next-button hampi-button" 
            onClick={handleNext}
            disabled={isGeneratingScene || isGenerating}
          >
            ➡️ Next Scene
          </button>
          <button 
            className="stop-button"
            onClick={handleStop}
          >
            ← Back to Hub
          </button>
        </div>
      </div>

      {/* Scene description box */}
      <div className="scene-description hampi-scene">
        <div className="scene-header">
          <span className="scene-counter">Observation #{sceneCount}</span>
          {isGeneratingScene && <span className="generating-text">✨ Observing...</span>}
        </div>
        <p className="scene-text">
          {currentScene || 'Settling into the warm embrace of the ancient Hampi bazaar...'}
        </p>
      </div>

      {/* Main image area */}
      <div className="image-container hampi-image">
        {currentImage ? (
          <div className="image-wrapper">
            <img 
              src={currentImage.url} 
              alt="Historic Hampi Bazaar Scene" 
              className="generated-image"
              onLoad={() => console.log('🖼️ Hampi image loaded successfully')}
              onError={() => console.log('❌ Hampi image failed to load')}
            />
          </div>
        ) : isGenerating ? (
          <div className="image-loading">
            <div className="loading-spinner"></div>
            <p>Generating historical scene...</p>
          </div>
        ) : (
          <div className="image-placeholder hampi-placeholder">
            <span className="placeholder-icon">🏛️</span>
            <p>Historical image will appear here once generated</p>
          </div>
        )}
      </div>

      {/* Ambient info */}
      <div className="ambient-info hampi-info">
        <span className="ambient-text">
          🏛️ Vijayanagara Empire • 1458 AD • 🌅 {sceneCount} Moments Witnessed
        </span>
      </div>

      {/* Hidden audio element for background music */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for storytelling, Juggernaut Lightning Flux via Segmind API for visuals, and Lyria-2 via Segmind API for audio</p>
      </div>
    </div>
  );
};

export default HampiBazaarObserver;
