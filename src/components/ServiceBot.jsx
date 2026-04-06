import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';
import { getRandomServiceBot } from '../data/personalities';

const ServiceBot = ({ position, onClick }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [botData] = useState(() => getRandomServiceBot());
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Mechanical movement pattern
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
  });

  const handleClick = (event) => {
    event.stopPropagation();
    onClick({ ...botData, type: 'robot' }, event);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Robot body */}
      <group scale={hovered ? 1.1 : 1}>
        {/* Main body */}
        <Box args={[0.6, 0.8, 0.4]} position={[0, 0.8, 0]}>
          <meshStandardMaterial 
            color="#666666" 
            metalness={0.8} 
            roughness={0.2}
            emissive={hovered ? '#ff6600' : '#000000'}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </Box>
        
        {/* Head */}
        <Sphere args={[0.25]} position={[0, 1.4, 0]}>
          <meshStandardMaterial 
            color="#888888" 
            metalness={0.9} 
            roughness={0.1}
          />
        </Sphere>
        
        {/* Eyes */}
        <Sphere args={[0.05]} position={[-0.1, 1.45, 0.2]}>
          <meshBasicMaterial color={hovered ? '#ff0000' : '#00ff00'} />
        </Sphere>
        <Sphere args={[0.05]} position={[0.1, 1.45, 0.2]}>
          <meshBasicMaterial color={hovered ? '#ff0000' : '#00ff00'} />
        </Sphere>
        
        {/* Arms */}
        <Box args={[0.1, 0.6, 0.1]} position={[-0.4, 0.9, 0]}>
          <meshStandardMaterial color="#555555" metalness={0.7} />
        </Box>
        <Box args={[0.1, 0.6, 0.1]} position={[0.4, 0.9, 0]}>
          <meshStandardMaterial color="#555555" metalness={0.7} />
        </Box>
        
        {/* Base/wheels */}
        <Box args={[0.8, 0.3, 0.6]} position={[0, 0.15, 0]}>
          <meshStandardMaterial color="#444444" metalness={0.6} />
        </Box>
      </group>

      {/* Interaction indicator */}
      {hovered && (
        <Sphere args={[1.2]} position={[0, 0.8, 0]}>
          <meshBasicMaterial 
            color="#ff6600" 
            transparent 
            opacity={0.1}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
};

export default ServiceBot;
