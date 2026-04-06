import { useState, useEffect, useCallback } from 'react';
import { audioConfig, calculateActivityVolume } from '../utils/audioUtils';

const useSpaceAudio = () => {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [soundNodes, setSoundNodes] = useState({});

  const initializeAudio = useCallback(async () => {
    if (audioInitialized) return;

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
      
      // Create basic ambient sounds using Web Audio API
      const createAmbientHum = () => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.frequency.setValueAtTime(60, context.currentTime);
        gainNode.gain.setValueAtTime(audioConfig.ambientVolume * 0.3, context.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.start();
        return { oscillator, gainNode };
      };

      const createAirRecycling = () => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.frequency.setValueAtTime(200, context.currentTime);
        gainNode.gain.setValueAtTime(audioConfig.ambientVolume * 0.1, context.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.start();
        return { oscillator, gainNode };
      };

      setSoundNodes({
        ambientHum: createAmbientHum(),
        airRecycling: createAirRecycling()
      });

      setAudioInitialized(true);
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }, [audioInitialized]);

  const playInteractionSound = useCallback((type = 'click') => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Different sounds for different interactions
    const frequencies = {
      click: 800,
      robot: 400,
      transaction: 1200,
      movement: 300
    };

    oscillator.frequency.setValueAtTime(
      frequencies[type] || frequencies.click, 
      audioContext.currentTime
    );
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      audioConfig.effectVolume * 0.3, 
      audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001, 
      audioContext.currentTime + 0.2
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, [audioContext]);

  const updateAmbientVolume = useCallback((characterCount) => {
    if (!soundNodes.ambientHum || !audioContext) return;

    const activityVolume = calculateActivityVolume(characterCount);
    const targetVolume = audioConfig.ambientVolume * activityVolume;

    soundNodes.ambientHum.gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      audioContext.currentTime + 1
    );
  }, [soundNodes, audioContext]);

  const cleanup = useCallback(() => {
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
  }, [audioContext]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    initializeAudio,
    playInteractionSound,
    updateAmbientVolume,
    audioInitialized,
    cleanup
  };
};

export default useSpaceAudio;
