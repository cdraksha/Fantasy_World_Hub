import React, { useState, useEffect, useCallback } from 'react';
import { SPACE_CAFE_NPCS, getNPCAtPosition, isValidPosition, GRID_SIZE } from '../data/spaceCafeGrid';
import useOpenAI from '../hooks/useOpenAI';
import useImageGeneration from '../hooks/useImageGeneration';
import useMusicGeneration from '../hooks/useMusicGeneration';
import '../styles/space-cafe-2.css';

const SpaceCafe2 = ({ onStop }) => {
  // Position and navigation state
  const [currentPosition, setCurrentPosition] = useState({ x: 2, y: 2 }); // Start in center
  const [selectedNPC, setSelectedNPC] = useState(null);
  
  // Content state
  const [npcContent, setNpcContent] = useState({}); // Cache generated content
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  
  // API hooks
  const { generateSpeech } = useOpenAI();
  const { generateImage, isGenerating: imageGenerating } = useImageGeneration();
  const { 
    generateMusic, 
    toggleMute, 
    isGeneratingMusic, 
    isPlaying, 
    isMuted, 
    currentTrack,
    audioRef 
  } = useMusicGeneration();

  // Initialize music and auto-generate "You" story on component mount
  useEffect(() => {
    const initializeExperience = async () => {
      generateMusic();
      // Auto-generate initial story for "You" at center position
      const centerNPC = getNPCAtPosition(2, 2);
      if (centerNPC && centerNPC.name === 'You') {
        await generateNPCContent(centerNPC, { x: 2, y: 2 });
      }
      setIsInitialLoading(false);
    };
    
    initializeExperience();
  }, []);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      const { x, y } = currentPosition;
      let newX = x;
      let newY = y;

      switch (event.key) {
        case 'ArrowUp':
          newY = Math.max(0, y - 1);
          break;
        case 'ArrowDown':
          newY = Math.min(GRID_SIZE - 1, y + 1);
          break;
        case 'ArrowLeft':
          newX = Math.max(0, x - 1);
          break;
        case 'ArrowRight':
          newX = Math.min(GRID_SIZE - 1, x + 1);
          break;
        case 'Enter':
          // Always generate new content for NPC at current position
          const npc = getNPCAtPosition(x, y);
          console.log('Enter pressed at position:', x, y, 'NPC found:', npc);
          if (npc) {
            setIsGeneratingContent(true);
            generateNPCContent(npc, { x, y });
          }
          return;
        default:
          return;
      }

      if (newX !== x || newY !== y) {
        setCurrentPosition({ x: newX, y: newY });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPosition]);

  // Generate content for NPC
  const generateNPCContent = useCallback(async (npc, position) => {
    const cacheKey = `${position.x},${position.y}`;
    
    console.log('generateNPCContent called with:', npc, position);
    
    // Always generate new content - no caching for any character when Enter is pressed
    // This ensures every Enter press creates fresh content

    setIsGeneratingStory(true);
    setIsGeneratingImage(true);

    try {
      // Special handling for "You" character
      let storyPrompt;
      if (npc.name === 'You') {
        storyPrompt = `You are sitting at the center table in a cosmic space cafe, observing the fascinating beings around you. Write a personal, reflective story in first person about your thoughts, observations, or a meaningful moment you're experiencing in this magical place. Be introspective and contemplative, describing what you see, feel, and think about while surrounded by this diverse galactic community. Keep it conversational and around 100-150 words. Make it a unique, personal experience each time.`;
      } else {
        storyPrompt = `Write a third-person story about ${npc.name}, a ${npc.description} in a cosmic space cafe. Start with "This is ${npc.name}..." and describe what he/she is doing at the cafe, what they're talking about, their current thoughts or experiences. Make it observational, like you're watching them from across the cafe. Keep it conversational and around 100-150 words. Personality: ${npc.personality}. Focus on their actions, conversations, and what they're experiencing right now in the cafe.`;
      }
      
      console.log('Story prompt for', npc.name, ':', storyPrompt);
      
      const story = await generateSpeech(storyPrompt, {
        character: npc.name,
        personality: npc.personality,
        setting: 'space cafe'
      }, 'space-cafe-2');

      setIsGeneratingStory(false);

      // Generate portrait using Nano Banana
      let imagePrompt;
      if (npc.name === 'You') {
        imagePrompt = `First person view from a table in a cosmic space cafe, looking out at the diverse galactic beings around you. View of hands on table, cosmic cafe interior, space station windows showing stars, ambient lighting, immersive perspective, high quality digital art`;
      } else {
        imagePrompt = `Portrait of ${npc.name}, a ${npc.description} in a space cafe setting. ${npc.personality} personality, cosmic background, detailed character design, space station interior, futuristic lighting, high quality digital art`;
      }
      
      const image = await generateImage(imagePrompt, `npc_${cacheKey}_${Date.now()}`, Date.now(), 'space-cafe-2');
      
      setIsGeneratingImage(false);

      // Don't cache any content - always generate fresh stories
      const generatedContent = {
        story: story,
        image: image,
        generated: true
      };

      setSelectedNPC({
        ...npc,
        ...generatedContent,
        position
      });

      // Turn off full page loading after both story and image are complete
      setIsGeneratingContent(false);

    } catch (error) {
      console.error('Error generating NPC content:', error);
      setIsGeneratingStory(false);
      setIsGeneratingImage(false);
      setIsGeneratingContent(false);
      
      // Fallback content
      const fallbackContent = {
        story: `Hello, I'm ${npc.name}. I'm having a peaceful day here in the cosmic cafe, watching the stars drift by outside the windows. There's something magical about this place that brings beings from across the galaxy together.`,
        image: null,
        generated: false
      };

      setNpcContent(prev => ({
        ...prev,
        [cacheKey]: fallbackContent
      }));

      setSelectedNPC({
        ...npc,
        ...fallbackContent,
        position
      });
    }
  }, [npcContent, generateSpeech, generateImage]);

  // Handle generate button click (for regenerating content)
  const handleGenerateContent = () => {
    if (selectedNPC && selectedNPC.position) {
      generateNPCContent(selectedNPC, selectedNPC.position);
    }
  };

  // Render grid cell
  const renderGridCell = (x, y) => {
    const npc = getNPCAtPosition(x, y);
    const isCurrentPosition = currentPosition.x === x && currentPosition.y === y;
    const isSelected = selectedNPC && selectedNPC.position && selectedNPC.position.x === x && selectedNPC.position.y === y;

    return (
      <div
        key={`${x}-${y}`}
        className={`grid-cell ${isCurrentPosition ? 'current' : ''} ${npc ? 'has-npc' : ''} ${isSelected ? 'selected' : ''}`}
      >
        {npc && (
          <div className="npc-indicator" title={npc.description}>
            <span className="npc-name">{npc.name}</span>
          </div>
        )}
        {isCurrentPosition && <div className="position-marker">📍</div>}
      </div>
    );
  };

  // Show loading screen during initial load or content generation
  if (isInitialLoading || isGeneratingContent) {
    return (
      <div className="space-cafe-2-container">
        <div className="initial-loading-screen">
          <div className="loading-content">
            <h2>🌌 Space Cafe 2.0</h2>
            <div className="loading-spinner-large"></div>
            {isInitialLoading ? (
              <>
                <p>Settling into your seat at the center table...</p>
                <p>Observing the cosmic beings around you...</p>
              </>
            ) : (
              <>
                <p>Generating story and portrait...</p>
                <p>Please wait while we create the experience...</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-cafe-2-container">
      {/* Header */}
      <div className="space-cafe-header">
        <h2>🌌 Space Cafe 2.0</h2>
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
          <button className="stop-button" onClick={onStop}>
            ← Back to Hub
          </button>
        </div>
      </div>

      {/* Model Attribution */}
      <div className="model-attribution">
        <p>Generated using Segmind GPT-4 for stories, Nano Banana for portraits, and Lyria-2 for ambient music</p>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Panel - Content Display */}
        <div className="content-panel">
          {selectedNPC ? (
            <div className="npc-content">
              {/* Character Info */}
              <div className="character-info">
                <h3>{selectedNPC.name}</h3>
                <p className="character-description">{selectedNPC.description}</p>
                <p className="character-personality">Personality: {selectedNPC.personality}</p>
              </div>

              {/* Generate Button or Content */}
              {selectedNPC.story ? (
                <div className="generated-content">
                  {/* Character Image */}
                  <div className="character-image-container">
                    {isGeneratingImage || imageGenerating ? (
                      <div className="image-loading">
                        <div className="loading-spinner"></div>
                        <p>Generating portrait...</p>
                      </div>
                    ) : selectedNPC.image ? (
                      <img 
                        src={selectedNPC.image.url} 
                        alt={selectedNPC.name}
                        className="character-image"
                      />
                    ) : (
                      <div className="image-placeholder">
                        <span className="placeholder-emoji">{selectedNPC.emoji}</span>
                        <p>{selectedNPC.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Story Content */}
                  <div className="story-container">
                    {isGeneratingStory ? (
                      <div className="story-loading">
                        <div className="loading-spinner"></div>
                        <p>Listening to {selectedNPC.name}'s story...</p>
                      </div>
                    ) : (
                      <div className="story-text">
                        <p>"{selectedNPC.story}"</p>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="generate-prompt">
                  <p>Press Enter to hear {selectedNPC.name}'s story and see their portrait.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="welcome-content">
              <h3>Welcome to Space Cafe 2.0</h3>
              <p>You're sitting at the center table observing everyone around you. Use arrow keys to explore and press Enter to hear stories.</p>
              <div className="instructions">
                <div className="instruction-item">
                  <span className="key">↑↓←→</span>
                  <span>Navigate grid</span>
                </div>
                <div className="instruction-item">
                  <span className="key">Enter</span>
                  <span>Generate new story</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Grid Navigation */}
        <div className="grid-panel">
          <div className="grid-header">
            <h4>Cosmic Cafe Layout</h4>
            <p>Position: {String.fromCharCode(65 + currentPosition.x)}{currentPosition.y + 1}</p>
          </div>
          
          <div className="grid-container">
            {Array.from({ length: GRID_SIZE }, (_, y) => (
              <div key={y} className="grid-row">
                {Array.from({ length: GRID_SIZE }, (_, x) => renderGridCell(x, y))}
              </div>
            ))}
          </div>

          <div className="grid-legend">
            <div className="legend-item">
              <span className="legend-icon">📍</span>
              <span>Your Position</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">↑↓←→</span>
              <span>Move with Arrow Keys</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">⏎</span>
              <span>Hit Enter for Hearing Story</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default SpaceCafe2;
