import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';

const SpaceCharacter = ({ character, onClick }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Gentle floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + character.id.charCodeAt(0)) * 0.1;
    
    // Slight rotation based on character state
    if (character.state === 'socializing') {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const getCharacterColor = () => {
    const colors = {
      'asteroid_miner': '#ff6600',
      'research_scientist': '#00aaff',
      'space_tourist': '#ff00aa',
      'cargo_pilot': '#ffaa00',
      'station_engineer': '#00ff66',
      'diplomatic_envoy': '#aa00ff'
    };
    return colors[character.id] || '#4488cc';
  };

  const getSuitColor = () => {
    const suitColors = {
      'asteroid_miner': '#2a2a2a',
      'research_scientist': '#ffffff',
      'space_tourist': '#6a4c93',
      'cargo_pilot': '#4a4a4a',
      'station_engineer': '#1a3a1a',
      'diplomatic_envoy': '#3a1a3a'
    };
    return suitColors[character.id] || '#3a3a3a';
  };

  const getStateIndicator = () => {
    const indicators = {
      'entering': '→',
      'ordering': '🍽️',
      'waiting': '⏳',
      'consuming': '☕',
      'socializing': '💬',
      'leaving': '←'
    };
    return indicators[character.state] || '👤';
  };

  const handleClick = (event) => {
    event.stopPropagation();
    onClick(character, event);
  };

  return (
    <group
      ref={groupRef}
      position={[character.position.x, 0, character.position.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Futuristic Character Body */}
      <group scale={hovered ? 1.05 : 1}>
        {/* Head/Helmet */}
        <Sphere args={[0.25]} position={[0, 1.6, 0]}>
          <meshStandardMaterial 
            color={getCharacterColor()} 
            metalness={0.8}
            roughness={0.2}
            emissive={hovered ? getCharacterColor() : '#000000'}
            emissiveIntensity={hovered ? 0.1 : 0}
          />
        </Sphere>
        
        {/* Helmet visor */}
        <Sphere args={[0.26]} position={[0, 1.6, 0]}>
          <meshStandardMaterial 
            color="#001122" 
            transparent
            opacity={0.7}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        {/* Space suit body */}
        <Cylinder args={[0.35, 0.4, 0.8]} position={[0, 1.1, 0]}>
          <meshStandardMaterial 
            color={getSuitColor()} 
            metalness={0.6}
            roughness={0.3}
          />
        </Cylinder>
        
        {/* Chest panel */}
        <Box args={[0.3, 0.2, 0.05]} position={[0, 1.2, 0.4]}>
          <meshStandardMaterial 
            color="#00aaff" 
            emissive="#004488"
            emissiveIntensity={0.3}
          />
        </Box>
        
        {/* Arms */}
        <Cylinder args={[0.08, 0.08, 0.6]} position={[-0.4, 1.1, 0]} rotation={[0, 0, Math.PI/8]}>
          <meshStandardMaterial color={getSuitColor()} metalness={0.5} roughness={0.4} />
        </Cylinder>
        <Cylinder args={[0.08, 0.08, 0.6]} position={[0.4, 1.1, 0]} rotation={[0, 0, -Math.PI/8]}>
          <meshStandardMaterial color={getSuitColor()} metalness={0.5} roughness={0.4} />
        </Cylinder>
        
        {/* Gloves */}
        <Sphere args={[0.12]} position={[-0.6, 0.9, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
        </Sphere>
        <Sphere args={[0.12]} position={[0.6, 0.9, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
        </Sphere>
        
        {/* Legs */}
        <Cylinder args={[0.12, 0.12, 0.7]} position={[-0.15, 0.35, 0]}>
          <meshStandardMaterial color={getSuitColor()} metalness={0.5} roughness={0.4} />
        </Cylinder>
        <Cylinder args={[0.12, 0.12, 0.7]} position={[0.15, 0.35, 0]}>
          <meshStandardMaterial color={getSuitColor()} metalness={0.5} roughness={0.4} />
        </Cylinder>
        
        {/* Boots */}
        <Box args={[0.2, 0.1, 0.3]} position={[-0.15, 0, 0.1]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
        </Box>
        <Box args={[0.2, 0.1, 0.3]} position={[0.15, 0, 0.1]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
        </Box>
        
        {/* Life support backpack */}
        <Box args={[0.25, 0.4, 0.15]} position={[0, 1.1, -0.3]}>
          <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.2} />
        </Box>
      </group>

      {/* State indicator floating above head */}
      <group position={[0, 2.5, 0]}>
        <Sphere args={[0.2]} visible={hovered}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </Sphere>
        {hovered && (
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}
      </group>

      {/* Character info when hovered */}
      {hovered && (
        <group position={[0, 3, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.8]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.8} 
            />
          </mesh>
          {/* Would add text here in a real implementation */}
        </group>
      )}

      {/* Interaction glow */}
      {hovered && (
        <Sphere args={[1]} position={[0, 1, 0]}>
          <meshBasicMaterial 
            color={getCharacterColor()} 
            transparent 
            opacity={0.1}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
};

export default SpaceCharacter;
