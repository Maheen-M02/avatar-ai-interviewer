import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarCanvasProps {
  isListening: boolean;
  isSpeaking: boolean;
  visemeData?: any[];
}

// Simple avatar mesh component with basic animations
function AvatarMesh({ isListening, isSpeaking, visemeData }: AvatarCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (meshRef.current) {
      // Breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02 + 1;
      
      // Speaking animation
      const speakScale = isSpeaking ? Math.sin(state.clock.elapsedTime * 8) * 0.1 + 1.1 : 1;
      
      // Listening pulse
      const listenScale = isListening ? Math.sin(state.clock.elapsedTime * 4) * 0.05 + 1.05 : 1;
      
      meshRef.current.scale.setScalar(breathe * speakScale * listenScale);
      
      // Subtle head movement
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group>
      {/* Head */}
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.1, 0.6, 0.25]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.1, 0.6, 0.25]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 0.5, 0.28]}>
        <coneGeometry args={[0.02, 0.06, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Mouth - changes based on speaking */}
      <mesh 
        position={[0, 0.4, 0.25]} 
        scale={[1, isSpeaking ? 1.5 : 1, 1]}
      >
        <sphereGeometry args={[0.04, 16, 8]} />
        <meshStandardMaterial color="#d63031" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 16]} />
        <meshStandardMaterial color="#4834d4" />
      </mesh>
      
      {/* Collar */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export default function AvatarCanvas({ isListening, isSpeaking, visemeData }: AvatarCanvasProps) {
  return (
    <div className="w-full h-full bg-avatar-bg rounded-xl shadow-strong avatar-ring">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        className="rounded-xl"
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#74b9ff" />
        
        <AvatarMesh 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          visemeData={visemeData} 
        />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}