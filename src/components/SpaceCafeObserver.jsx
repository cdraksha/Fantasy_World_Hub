import React, { useState, useCallback, useEffect } from 'react'
import useOpenAI from '../hooks/useOpenAI'
import useImageGeneration from '../hooks/useImageGeneration'
import useMusicGeneration from '../hooks/useMusicGeneration'
import { getRandomPersonality } from '../data/personalities';

const SpaceCafeObserver = ({ onStop }) => {
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

    console.log('✅ Proceeding with observation generation');
    setIsGeneratingScene(true);
    
    // Get random characters for the scene
    const character1 = getRandomPersonality();
    const character2 = Math.random() > 0.5 ? getRandomPersonality() : null;
    
    // Create context for the immersive experience
    const sceneContext = {
      situation: 'Create a deeply immersive, peaceful space cafe experience using second person perspective',
      atmosphere: 'peaceful, imaginative, calming space station cafe',
      prompt: `Create a deeply immersive and peaceful space cafe experience. Write in second person ("you") to make the user feel like they're actually there. Include sensory details, personal actions, and calming moments. Include a ${character1.name}${character2 ? ` and a ${character2.name}` : ''} in the scene.

Examples of the style:
- "You settle into a soft cushioned booth by the panoramic window, watching a distant nebula slowly swirl in shades of purple and gold..."
- "You take off your space helmet and breathe in the warm, coffee-scented air as a friendly Space Miner at the next table nods hello..."
- "You wrap your hands around a warm mug and feel the gentle hum of the station beneath your feet as stars drift by outside..."

Create a peaceful, imaginative moment that helps the user escape and feel present in this cosmic sanctuary. Then create a visual prompt for this scene.

Format your response as:
OBSERVATION: [immersive second-person peaceful description]
IMAGE_PROMPT: [detailed prompt for the scene illustration]`
    };

    try {
      console.log('🌌 Generating immersive space cafe observation...');
      
      // Generate the immersive observation using ChatGPT
      const response = await generateSpeech(
        `Create a peaceful, immersive observation of being in the space cafe. Include sensory details like cosmic views, gentle sounds, and peaceful interactions. Make it feel real and calming using second person perspective.`, 
        sceneContext,
        'space-cafe'
      );

      // Parse the response
      const observationMatch = response.match(/OBSERVATION:\s*(.*?)(?=IMAGE_PROMPT:|$)/s);
      const promptMatch = response.match(/IMAGE_PROMPT:\s*(.*?)$/s);

      const observation = observationMatch ? observationMatch[1].trim() : response;
      const imagePrompt = promptMatch ? promptMatch[1].trim() : `Peaceful space station cafe scene: ${observation}`;

      setCurrentScene(observation);
      
      // Generate image only once per scene - capture scene count before increment
      const currentSceneForImage = sceneCount;
      console.log('🎨 About to generate image with prompt:', imagePrompt);
      console.log('🔢 Scene count for this image:', currentSceneForImage);
      
      // Keep generating state active while image is being generated
      const generatedImage = await generateImage(imagePrompt, `scene_${Date.now()}`, currentSceneForImage, 'space-cafe');
      console.log('🖼️ Generated image result:', generatedImage);
      
      if (generatedImage) {
        setCurrentImage(generatedImage);
        setImageGenerated(true);
        console.log('✅ Image set successfully and imageGenerated set to true');
      } else {
        console.log('❌ No image returned');
      }
      
      // Only set generating to false after image is complete
      setIsGeneratingScene(false);

    } catch (error) {
      console.error('Error generating observation:', error);
      setCurrentScene('You sit peacefully in the space cafe, watching the gentle flow of cosmic life around you...');
      setIsGeneratingScene(false);
    }
  }, []); // Remove dependencies to prevent re-renders

  // Start the first observation and music when component mounts (only once)
  useEffect(() => {
    if (!hasStarted) {
      console.log('🚀 Starting Space Cafe experience...');
      setHasStarted(true);
      generateObservation();
      generateMusic();
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
    <div className="observer-container">
      {/* Header with controls */}
      <div className="observer-header">
        <h2>🌌 Cosmic Cafe Observer</h2>
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
            className="next-button" 
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
      
      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using OpenAI GPT-4 for storytelling, Juggernaut Lightning Flux via Segmind API for visuals, and Lyria-2 via Segmind API for audio</p>
      </div>

      {/* Scene description box */}
      <div className="scene-description">
        <div className="scene-header">
          <span className="scene-counter">Observation #{sceneCount}</span>
          {isGeneratingScene && <span className="generating-text">✨ Observing...</span>}
        </div>
        <p className="scene-text">
          {currentScene || 'Settling into your favorite corner of the cosmic cafe...'}
        </p>
      </div>

      {/* Main image area */}
      <div className="image-container">
        {currentImage ? (
          <div className="image-wrapper">
            <img 
              src={currentImage.url} 
              alt="Space Cafe Scene" 
              className="generated-image"
              onLoad={() => console.log('🖼️ Image loaded successfully')}
              onError={() => console.log('❌ Image failed to load')}
            />
          </div>
        ) : isGenerating ? (
          <div className="image-loading">
            <div className="loading-spinner"></div>
            <p>Generating cosmic scene...</p>
          </div>
        ) : (
          <div className="image-placeholder">
            <span className="placeholder-icon">🌌</span>
            <p>Image will appear here once generated</p>
          </div>
        )}
      </div>

      {/* Ambient info */}
      <div className="ambient-info">
        <span className="ambient-text">
          🌍 Orbital Station Cafe • ☕ Always Open • 🌟 {sceneCount} Moments Observed
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

export default SpaceCafeObserver;
