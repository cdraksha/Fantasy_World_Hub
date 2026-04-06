// Audio utility functions for the Space Cafe simulation

export const audioConfig = {
  ambientVolume: 0.3,
  effectVolume: 0.5,
  musicVolume: 0.2,
  fadeTime: 1000
};

export const soundFiles = {
  ambient: {
    stationHum: '/sounds/station-hum.mp3',
    airRecycling: '/sounds/air-recycling.wav',
    ambientMusic: '/sounds/ambient-space-music.mp3'
  },
  effects: {
    floatingMovement: '/sounds/floating-movement.mp3',
    serviceBotWhir: '/sounds/service-bot-whir.wav',
    transactionBeep: '/sounds/transaction-beep.wav'
  }
};

export const calculateVolumeByDistance = (listenerPos, sourcePos, maxDistance = 10) => {
  const distance = Math.sqrt(
    Math.pow(listenerPos.x - sourcePos.x, 2) +
    Math.pow(listenerPos.y - sourcePos.y, 2) +
    Math.pow(listenerPos.z - sourcePos.z, 2)
  );
  
  return Math.max(0, 1 - (distance / maxDistance));
};

export const calculateActivityVolume = (characterCount, maxCharacters = 10) => {
  const activity = Math.min(characterCount / maxCharacters, 1);
  return 0.2 + (activity * 0.3); // Base volume 0.2, max 0.5
};

export const createAudioLayer = (soundFile, volume = 1, loop = false) => {
  return {
    file: soundFile,
    volume: volume,
    loop: loop,
    playing: false
  };
};

export const mixAudioLayers = (layers) => {
  return layers.reduce((total, layer) => {
    return total + (layer.playing ? layer.volume : 0);
  }, 0);
};

// Placeholder audio files - these would normally be actual audio files
// For development, we'll create silent audio or use Web Audio API to generate sounds
export const generatePlaceholderAudio = () => {
  // Create a silent audio context for development
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const createSilentBuffer = (duration = 1) => {
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    return buffer;
  };

  const createToneBuffer = (frequency = 440, duration = 1) => {
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / audioContext.sampleRate) * 0.1;
    }
    
    return buffer;
  };

  return {
    audioContext,
    createSilentBuffer,
    createToneBuffer
  };
};
