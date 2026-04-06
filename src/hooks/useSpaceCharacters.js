import { useState, useEffect, useCallback } from 'react';
import { getRandomPersonality } from '../data/personalities';

const useSpaceCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const [nextCharacterId, setNextCharacterId] = useState(1);

  const spawnCharacter = useCallback(() => {
    const personality = getRandomPersonality();
    const newCharacter = {
      id: `char_${nextCharacterId}`,
      ...personality,
      position: {
        x: (Math.random() - 0.5) * 8,
        y: 0,
        z: (Math.random() - 0.5) * 8
      },
      state: 'entering',
      stateTimer: 0,
      totalStayTime: Math.random() * (personality.stayDuration.max - personality.stayDuration.min) + personality.stayDuration.min,
      hasOrdered: false,
      currentOrder: null,
      spendingAmount: Math.random() * (personality.spendingHabits.max - personality.spendingHabits.min) + personality.spendingHabits.min
    };

    setCharacters(prev => [...prev, newCharacter]);
    setNextCharacterId(prev => prev + 1);
    
    return newCharacter;
  }, [nextCharacterId]);

  const updateCharacter = useCallback((characterId, updates) => {
    setCharacters(prev => 
      prev.map(char => 
        char.id === characterId ? { ...char, ...updates } : char
      )
    );
  }, []);

  const removeCharacter = useCallback((characterId) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId));
  }, []);

  const updateCharacterStates = useCallback((deltaTime) => {
    setCharacters(prev => prev.map(character => {
      const newStateTimer = character.stateTimer + deltaTime;
      let newState = character.state;
      let updates = { stateTimer: newStateTimer };

      switch (character.state) {
        case 'entering':
          if (newStateTimer > 2) {
            newState = 'ordering';
            updates.stateTimer = 0;
          }
          break;

        case 'ordering':
          if (newStateTimer > 3 && !character.hasOrdered) {
            const order = character.orderPreferences[
              Math.floor(Math.random() * character.orderPreferences.length)
            ];
            updates.hasOrdered = true;
            updates.currentOrder = order;
            newState = 'waiting';
            updates.stateTimer = 0;
          }
          break;

        case 'waiting':
          if (newStateTimer > 5) {
            newState = 'consuming';
            updates.stateTimer = 0;
          }
          break;

        case 'consuming':
          if (newStateTimer > character.totalStayTime * 0.6) {
            newState = 'socializing';
            updates.stateTimer = 0;
          }
          break;

        case 'socializing':
          if (newStateTimer > character.totalStayTime * 0.3) {
            newState = 'leaving';
            updates.stateTimer = 0;
          }
          break;

        case 'leaving':
          if (newStateTimer > 2) {
            return null; // Mark for removal
          }
          break;
      }

      return { ...character, state: newState, ...updates };
    }).filter(Boolean)); // Remove null characters
  }, []);

  const getCharactersByState = useCallback((state) => {
    return characters.filter(char => char.state === state);
  }, [characters]);

  const getTotalRevenue = useCallback(() => {
    return characters
      .filter(char => char.hasOrdered)
      .reduce((total, char) => total + char.spendingAmount, 0);
  }, [characters]);

  // Auto-spawn characters
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (characters.length < 8) { // Max 8 characters
        const shouldSpawn = Math.random() < 0.3; // 30% chance every interval
        if (shouldSpawn) {
          spawnCharacter();
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(spawnInterval);
  }, [characters.length, spawnCharacter]);

  // Update character states
  useEffect(() => {
    const updateInterval = setInterval(() => {
      updateCharacterStates(1); // 1 second delta
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [updateCharacterStates]);

  return {
    characters,
    spawnCharacter,
    updateCharacter,
    removeCharacter,
    getCharactersByState,
    getTotalRevenue
  };
};

export default useSpaceCharacters;
