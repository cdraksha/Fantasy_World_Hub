import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, Sphere, Box, Cylinder, Ring, Plane } from '@react-three/drei';
import * as THREE from 'three';

const ImageHotspot = ({ position, prompt, onImageGenerate, icon = "🖼️" }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });
  
  return (
    <group position={position} ref={meshRef}>
      {/* Holographic hotspot */}
      <Sphere
        args={[0.15]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onImageGenerate(prompt)}
      >
        <meshBasicMaterial 
          color={hovered ? "#00ffff" : "#0088ff"} 
          transparent 
          opacity={0.7}
        />
      </Sphere>
      
      {/* Holographic ring */}
      <Ring args={[0.2, 0.25, 16]} rotation={[Math.PI/2, 0, 0]}>
        <meshBasicMaterial 
          color="#00aaff" 
          transparent 
          opacity={hovered ? 0.8 : 0.4}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      {hovered && (
        <>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.15}
            color="#00ffff"
            anchorX="center"
            anchorY="middle"
          >
            {icon}
          </Text>
          <Plane args={[2, 0.5]} position={[0, -0.4, 0]}>
            <meshBasicMaterial 
              color="#001122" 
              transparent 
              opacity={0.8}
            />
          </Plane>
          <Text
            position={[0, -0.4, 0.01]}
            fontSize={0.08}
            color="#00ffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {prompt}
          </Text>
        </>
      )}
    </group>
  );
};

// Booth Seating Component
const BoothSeating = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Curved booth back */}
      <Cylinder args={[1.2, 1.2, 0.8, 16, 1, false, 0, Math.PI]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#2a3a4a" roughness={0.3} metalness={0.1} />
      </Cylinder>
      
      {/* Booth seat */}
      <Cylinder args={[1.1, 1.1, 0.15, 16, 1, false, 0, Math.PI]} position={[0, 0.08, 0]}>
        <meshStandardMaterial color="#1a2a3a" roughness={0.4} />
      </Cylinder>
      
      {/* Table */}
      <Cylinder args={[0.6, 0.6, 0.05, 24]} position={[0, 0.4, 0.8]}>
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.8} />
      </Cylinder>
      
      {/* Table base */}
      <Cylinder args={[0.1, 0.1, 0.4, 12]} position={[0, 0.2, 0.8]}>
        <meshStandardMaterial color="#4a5a6a" metalness={0.7} />
      </Cylinder>
      
      {/* Holographic display */}
      <Plane args={[0.4, 0.3]} position={[0, 0.45, 0.8]} rotation={[-Math.PI/6, 0, 0]}>
        <meshBasicMaterial color="#00aaff" transparent opacity={0.6} />
      </Plane>
    </group>
  );
};

// Central Service Bar Component
const ServiceBar = () => {
  const barRef = useRef();
  
  useFrame((state) => {
    if (barRef.current) {
      // Subtle hologram animation
      barRef.current.children.forEach((child, i) => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
        }
      });
    }
  });
  
  return (
    <group ref={barRef}>
      {/* Main bar structure */}
      <Cylinder args={[2.5, 2.5, 1.2, 32]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#e8e8e8" roughness={0.1} metalness={0.8} />
      </Cylinder>
      
      {/* Bar top */}
      <Cylinder args={[2.6, 2.6, 0.1, 32]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.9} />
      </Cylinder>
      
      {/* Central holographic display */}
      <Cylinder args={[0.8, 0.8, 0.02, 24]} position={[0, 1.8, 0]}>
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
      </Cylinder>
      
      {/* Food display cases */}
      {[0, Math.PI/2, Math.PI, 3*Math.PI/2].map((angle, i) => (
        <group key={i}>
          <Box 
            args={[0.8, 0.6, 0.4]} 
            position={[Math.cos(angle) * 1.8, 0.9, Math.sin(angle) * 1.8]}
            rotation={[0, angle, 0]}
          >
            <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
          </Box>
          
          {/* Display items */}
          <Sphere 
            args={[0.1]} 
            position={[Math.cos(angle) * 1.8, 1.0, Math.sin(angle) * 1.8]}
          >
            <meshStandardMaterial color="#ff6600" />
          </Sphere>
        </group>
      ))}
    </group>
  );
};

// Hanging Garden Component
const HangingGarden = ({ position }) => {
  const plantRef = useRef();
  
  useFrame((state) => {
    if (plantRef.current) {
      plantRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <group position={position} ref={plantRef}>
      {/* Planter tube */}
      <Cylinder args={[0.3, 0.3, 2, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.3} />
      </Cylinder>
      
      {/* Plant (simplified) */}
      <Sphere args={[0.25]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#2d5a2d" />
      </Sphere>
      <Sphere args={[0.2]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#3d6a3d" />
      </Sphere>
      <Sphere args={[0.15]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4d7a4d" />
      </Sphere>
    </group>
  );
};

const SpaceEnvironment = ({ onImageGenerate }) => {
  const stationRef = useRef();
  const planetRef = useRef();
  const starsRef = useRef();

  useFrame((state) => {
    // Subtle station rotation
    if (stationRef.current) {
      stationRef.current.rotation.y += 0.001;
    }
    
    // Planet rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.003;
    }

    // Starfield animation
    if (starsRef.current) {
      starsRef.current.rotation.x += 0.0001;
      starsRef.current.rotation.z += 0.0002;
    }
  });

  // Enhanced starfield
  const starPositions = useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    return positions;
  }, []);

  return (
    <group>
      {/* Enhanced Starfield */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2000}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.8} />
      </points>

      {/* Main Station Structure */}
      <group ref={stationRef}>
        {/* Curved outer walls */}
        <Cylinder args={[12, 12, 4, 48]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#d0d8e0" 
            roughness={0.2} 
            metalness={0.8}
          />
        </Cylinder>

        {/* Floor with grid pattern */}
        <Cylinder args={[11.8, 11.8, 0.1, 48]} position={[0, -1.95, 0]}>
          <meshStandardMaterial 
            color="#e8f0f8" 
            roughness={0.1} 
            metalness={0.3}
          />
        </Cylinder>

        {/* Ceiling with lighting strips */}
        <Cylinder args={[11.8, 11.8, 0.1, 48]} position={[0, 1.95, 0]}>
          <meshStandardMaterial 
            color="#f0f8ff" 
            roughness={0.1} 
            metalness={0.2}
          />
        </Cylinder>

        {/* Curved panoramic windows */}
        {[0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3].map((angle, index) => (
          <group key={index}>
            {/* Window frame */}
            <Box 
              args={[6, 3, 0.3]} 
              position={[
                Math.cos(angle) * 11.5,
                0.5,
                Math.sin(angle) * 11.5
              ]}
              rotation={[0, angle, 0]}
            >
              <meshStandardMaterial color="#b0c0d0" metalness={0.7} roughness={0.2} />
            </Box>
            
            {/* Window glass */}
            <Plane 
              args={[5.5, 2.5]} 
              position={[
                Math.cos(angle) * 11.7,
                0.5,
                Math.sin(angle) * 11.7
              ]}
              rotation={[0, angle, 0]}
            >
              <meshBasicMaterial 
                color="#001133" 
                transparent 
                opacity={0.1}
              />
            </Plane>
          </group>
        ))}

        {/* Booth Seating Areas */}
        <BoothSeating position={[6, -1.5, 6]} rotation={[0, -Math.PI/4, 0]} />
        <BoothSeating position={[-6, -1.5, 6]} rotation={[0, Math.PI/4, 0]} />
        <BoothSeating position={[6, -1.5, -6]} rotation={[0, -3*Math.PI/4, 0]} />
        <BoothSeating position={[-6, -1.5, -6]} rotation={[0, 3*Math.PI/4, 0]} />
        <BoothSeating position={[8, -1.5, 0]} rotation={[0, -Math.PI/2, 0]} />
        <BoothSeating position={[-8, -1.5, 0]} rotation={[0, Math.PI/2, 0]} />

        {/* Central Service Bar */}
        <ServiceBar />

        {/* Hanging Gardens */}
        <HangingGarden position={[4, 3, 4]} />
        <HangingGarden position={[-4, 3, 4]} />
        <HangingGarden position={[4, 3, -4]} />
        <HangingGarden position={[-4, 3, -4]} />
        <HangingGarden position={[0, 3, 6]} />
        <HangingGarden position={[0, 3, -6]} />

        {/* Atmospheric lighting strips */}
        {[0, Math.PI/6, Math.PI/3, Math.PI/2, 2*Math.PI/3, 5*Math.PI/6, Math.PI, 7*Math.PI/6, 4*Math.PI/3, 3*Math.PI/2, 5*Math.PI/3, 11*Math.PI/6].map((angle, i) => (
          <Box 
            key={i}
            args={[0.1, 0.1, 3]} 
            position={[Math.cos(angle) * 11, 1.8, Math.sin(angle) * 11]}
            rotation={[0, angle, 0]}
          >
            <meshBasicMaterial color="#00aaff" />
          </Box>
        ))}
      </group>

      {/* Massive Planet View */}
      <Sphere ref={planetRef} args={[8]} position={[25, 0, 25]}>
        <meshStandardMaterial 
          color="#ff8844"
          roughness={0.8}
        />
      </Sphere>

      {/* Secondary celestial body */}
      <Sphere args={[3]} position={[-30, 10, -20]}>
        <meshStandardMaterial color="#4488cc" />
      </Sphere>

      {/* Interactive Image Hotspots */}
      <ImageHotspot
        position={[10, 0, 0]}
        prompt="Breathtaking view of alien planet from luxury space cafe"
        onImageGenerate={onImageGenerate}
        icon="🌍"
      />
      
      <ImageHotspot
        position={[-10, 0, 0]}
        prompt="Deep space vista with distant galaxies and nebulas"
        onImageGenerate={onImageGenerate}
        icon="🌌"
      />
      
      <ImageHotspot
        position={[0, 0, 10]}
        prompt="Futuristic space station cafe interior with holographic displays"
        onImageGenerate={onImageGenerate}
        icon="🏗️"
      />
      
      <ImageHotspot
        position={[0, 0, -10]}
        prompt="Massive cargo ships and space traffic around orbital station"
        onImageGenerate={onImageGenerate}
        icon="🚀"
      />

      <ImageHotspot
        position={[7, 1, 7]}
        prompt="Elegant space tourists dining with Earth view"
        onImageGenerate={onImageGenerate}
        icon="🛸"
      />

      <ImageHotspot
        position={[-7, 1, -7]}
        prompt="Alien visitors and interspecies diplomacy in space cafe"
        onImageGenerate={onImageGenerate}
        icon="👽"
      />

      {/* Atmospheric particles and effects */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={new Float32Array(Array.from({length: 900}, () => (Math.random() - 0.5) * 30))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.01} color="#88ccff" transparent opacity={0.4} />
      </points>

      {/* Enhanced lighting */}
      <ambientLight intensity={0.3} color="#ffffff" />
      <pointLight position={[0, 8, 0]} intensity={1.5} color="#ffffff" />
      <pointLight position={[15, 5, 15]} intensity={0.8} color="#ff8844" />
      <pointLight position={[-15, 5, -15]} intensity={0.6} color="#4488cc" />
      
      {/* Blue accent lighting */}
      <pointLight position={[10, 2, 0]} intensity={0.5} color="#00aaff" />
      <pointLight position={[-10, 2, 0]} intensity={0.5} color="#00aaff" />
      <pointLight position={[0, 2, 10]} intensity={0.5} color="#00aaff" />
      <pointLight position={[0, 2, -10]} intensity={0.5} color="#00aaff" />
    </group>
  );
};

export default SpaceEnvironment;
