import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

const useMusicGeneration = () => {
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [musicQueue, setMusicQueue] = useState([]);
  const audioRef = useRef(null);

  // Calming music prompts for different themes
  const getCalmingMusicPrompt = (theme = 'space-cafe') => {
    let prompts;
    
    if (theme === 'hampi-bazaar') {
      prompts = [
        "Ancient South Indian classical music with veena strings and mridangam rhythms, temple courtyard ambience, 15th century Carnatic ragas, meditative and sacred, royal court atmosphere",
        "Traditional Vijayanagara court music with bamboo flute and tabla, stone temple acoustics, devotional bhajans, peaceful and spiritual, historical Indian classical",
        "Sacred temple music with conch shells and bronze bells, ancient Sanskrit chants in background, serene ashram atmosphere, peaceful and divine, 15th century devotional",
        "Royal procession music with nagaswaram and tavil drums, festive yet calming, Hampi palace courtyard, traditional South Indian instruments, majestic and peaceful",
        "Meditation music with sitar and tanpura drone, ancient raga melodies, temple prayer hall ambience, spiritual and healing, classical Indian calming sounds"
      ];
    } else {
      prompts = [
        "Gentle ambient space music with soft synthesizers, peaceful cosmic atmosphere, meditative and calming, perfect for relaxation and contemplation",
        "Soothing electronic ambient soundscape, floating melodies, ethereal pads, peaceful and tranquil, space cafe atmosphere",
        "Calm ambient music with soft piano, gentle strings, peaceful and restorative, cosmic meditation vibes",
        "Calming ambient soundscape, gentle waves of sound, peaceful and healing, perfect for quiet contemplation",
        "Soft ambient music with celestial tones, meditative and calming, peaceful space atmosphere, gentle and soothing"
      ];
    }
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const generateMusic = useCallback(async (theme = 'space-cafe') => {
    setIsGeneratingMusic(true);
    
    const apiKey = import.meta.env.VITE_SEGMIND_API_KEY;
    
    try {
      const themeLabel = theme === 'hampi-bazaar' ? 'Hampi Bazaar' : 'Space Cafe';
      console.log(`🎵 Generating calming ${themeLabel} music with Lyria-2...`);
      
      const url = "https://api.segmind.com/v1/lyria-2";
      
      // Get a calming music prompt for the theme
      const musicPrompt = getCalmingMusicPrompt(theme);
      
      const data = {
        prompt: musicPrompt,
        negative_prompt: "No loud drums, no vocals, no harsh sounds, no aggressive music, no heavy bass"
      };

      console.log('📡 Sending music generation request:', { prompt: musicPrompt });

      const response = await axios.post(url, data, {
        headers: { 
          'x-api-key': apiKey || 'missing-key',
          'x-api-key': import.meta.env.VITE_SEGMIND_API_KEY,
            'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 45000 // 45 second timeout for music generation
      });

      // Convert blob to audio URL
      const audioUrl = URL.createObjectURL(response.data);
      
      const trackTitle = theme === 'hampi-bazaar' ? 'Hampi Bazaar Ambience' : 'Cosmic Cafe Ambience';
      const newTrack = {
        id: Date.now(),
        url: audioUrl,
        title: trackTitle,
        prompt: musicPrompt,
        timestamp: new Date()
      };

      console.log('✅ Calming music generated successfully!');
      setCurrentTrack(newTrack);
      setMusicQueue(prev => [...prev, newTrack]);
      setIsGeneratingMusic(false);
      
      return newTrack;

    } catch (error) {
      console.error('❌ Music generation failed:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        try {
          if (error.response.data instanceof Blob) {
            const errorText = await error.response.data.text();
            console.error('Error response:', errorText);
          } else {
            console.error('Error response:', error.response.data);
          }
        } catch (e) {
          console.error('Could not read error response:', e);
        }
      }
      
      setIsGeneratingMusic(false);
      
      console.log('🔄 Music generation failed, continuing without background music');
      return null;
    }
  }, []);

  const playMusic = useCallback(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2; // Very gentle background volume
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const pauseMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      } else {
        audioRef.current.muted = true;
        setIsMuted(true);
      }
    }
  }, [isMuted]);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // Auto-play when track is available and not muted
  useEffect(() => {
    if (currentTrack && !isPlaying && !isMuted) {
      playMusic();
    }
  }, [currentTrack, playMusic, isPlaying, isMuted]);

  // Handle track ending - generate new music after a delay
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      const handleEnded = () => {
        console.log('🎵 Track ended, generating new calming music...');
        // Wait a bit before generating new music
        setTimeout(() => {
          generateMusic();
        }, 2000);
      };
      
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentTrack, generateMusic]);

  return {
    generateMusic,
    playMusic,
    pauseMusic,
    stopMusic,
    toggleMute,
    isGeneratingMusic,
    isPlaying,
    isMuted,
    currentTrack,
    musicQueue,
    audioRef
  };
};

export default useMusicGeneration;
