import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import SpaceEnvironment from './SpaceEnvironment';
import SpaceCharacter from './SpaceCharacter';
import ServiceBot from './ServiceBot';
import BusinessMetrics from './BusinessMetrics';
import SpeechBubble from './SpeechBubble';
import useSpaceCharacters from '../hooks/useSpaceCharacters';
import useOpenAI from '../hooks/useOpenAI';
import useSpaceAudio from '../hooks/useSpaceAudio';
import useImageGeneration from '../hooks/useImageGeneration';

const SpaceCafe = () => {
  const [loading, setLoading] = useState(true);
  const [activeSpeech, setActiveSpeech] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { characters, getTotalRevenue } = useSpaceCharacters();
  const { generateSpeech, isLoading: speechLoading } = useOpenAI();
  const { initializeAudio, playInteractionSound, updateAmbientVolume } = useSpaceAudio();
  const { generateImage, generateRandomImage, generatedImages, isGenerating } = useImageGeneration();

  useEffect(() => {
    // Initialize the simulation
    const initSimulation = async () => {
      await initializeAudio();
      setTimeout(() => setLoading(false), 2000);
    };
    
    initSimulation();
  }, [initializeAudio]);

  useEffect(() => {
    updateAmbientVolume(characters.length);
  }, [characters.length, updateAmbientVolume]);

  const handleCharacterClick = async (character, event) => {
    playInteractionSound(character.type === 'robot' ? 'robot' : 'click');
    
    // Get mouse position for speech bubble
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });

    // Generate speech
    const speech = await generateSpeech(character, {
      situation: `In the space cafe, currently ${character.state}`,
      atmosphere: `${characters.length} customers present`,
      prompt: 'Tell me something interesting about your work or experience in space'
    });

    setActiveSpeech({
      character,
      text: speech,
      position: { x: event.clientX, y: event.clientY }
    });

    // Sometimes generate an image when talking to characters
    if (Math.random() < 0.3 && character.type !== 'robot') {
      setTimeout(() => {
        generateRandomImage(character.id, character.id);
      }, 2000);
    }
  };

  const handleContinueConversation = async () => {
    if (!activeSpeech) return;

    playInteractionSound('click');
    
    const followUpSpeech = await generateSpeech(activeSpeech.character, {
      situation: 'Continuing conversation in space cafe',
      prompt: 'Continue the conversation with more details or ask the customer something'
    });

    setActiveSpeech(prev => ({
      ...prev,
      text: followUpSpeech
    }));
  };

  const closeSpeechBubble = () => {
    setActiveSpeech(null);
  };

  const handleImageHotspotClick = async (prompt) => {
    playInteractionSound('transaction');
    await generateImage(prompt, `hotspot_${Date.now()}`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Initializing Orbital Cafe...</div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
          Calibrating artificial gravity • Loading character personalities • Establishing communications
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 8, 15], fov: 75 }}
        style={{ background: 'linear-gradient(to bottom, #000011, #001122)' }}
      >
        <SpaceEnvironment onImageGenerate={handleImageHotspotClick} />
        
        {characters.map(character => (
          <SpaceCharacter
            key={character.id}
            character={character}
            onClick={handleCharacterClick}
          />
        ))}
        
        <ServiceBot
          position={[4, -1.5, 4]}
          onClick={handleCharacterClick}
        />
        <ServiceBot
          position={[-4, -1.5, -4]}
          onClick={handleCharacterClick}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={30}
          minDistance={5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
        />
        
        <EffectComposer>
          <Bloom 
            intensity={0.5}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
          />
          <ToneMapping adaptive={false} />
        </EffectComposer>
      </Canvas>

      <BusinessMetrics
        characters={characters}
        totalRevenue={getTotalRevenue()}
        generatedImages={generatedImages}
      />

      {activeSpeech && (
        <SpeechBubble
          character={activeSpeech.character}
          text={activeSpeech.text}
          position={activeSpeech.position}
          onContinue={handleContinueConversation}
          onClose={closeSpeechBubble}
          isLoading={speechLoading}
        />
      )}

      {/* Image Generation Indicator */}
      {isGenerating && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff88',
          padding: '20px',
          borderRadius: '10px',
          border: '2px solid #00ff88',
          zIndex: 1500
        }}>
          🎨 Generating space image...
        </div>
      )}

      {/* Generated Images Display */}
      {generatedImages.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 100
        }}>
          {generatedImages.slice(-3).map(image => (
            <div
              key={image.id}
              style={{
                width: '100px',
                height: '100px',
                border: '2px solid #00ff88',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#000'
              }}
            >
              <img
                src={image.url}
                alt={image.prompt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                title={image.prompt}
              />
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        color: '#00ff88',
        fontSize: '12px',
        opacity: 0.7,
        textAlign: 'right',
        maxWidth: '200px'
      }}>
        Click on characters to chat • Images may generate during conversations • Use mouse to navigate
      </div>
    </div>
  );
};

export default SpaceCafe;
