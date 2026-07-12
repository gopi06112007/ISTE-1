import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Float } from '@react-three/drei';

function LogoDisc({ scale }) {
  const meshRef = useRef();
  // Load the ISTE logo texture from public/istelogo.webp
  const logoTexture = useTexture('/istelogo.webp');

  // Slow continuous rotation (Y-axis spin)
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.55; // ~11s per full rotation
    }
  });

  return (
    <group scale={scale}>
      <mesh ref={meshRef} rotation={[0.15, 0, 0]} castShadow receiveShadow>
        {/* Radius top: 2.2, radius bottom: 2.2, height: 0.28, segments: 64 */}
        <cylinderGeometry args={[2.2, 2.2, 0.28, 64]} />
        
        {/* Materials for the cylinder:
            material-0: Side trim (gold/yellow matte)
            material-1: Front face (ISTE logo texture)
            material-2: Back face (ISTE logo texture)
        */}
        <meshPhysicalMaterial 
          attach="material-0" 
          color="#D97706" // Warm amber/gold matching logo trim
          roughness={0.45} 
          metalness={0.15}
          clearcoat={0.1}
        />
        <meshPhysicalMaterial 
          attach="material-1" 
          map={logoTexture} 
          roughness={0.35} 
          metalness={0.05} 
          clearcoat={0.15}
        />
        <meshPhysicalMaterial 
          attach="material-2" 
          map={logoTexture} 
          roughness={0.35} 
          metalness={0.05} 
          clearcoat={0.15}
        />
      </mesh>
    </group>
  );
}

export default function Iste3DLogo() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = isMobile ? 0.7 : 1.1;

  return (
    <Suspense fallback={null}>
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ pointerEvents: 'none', background: 'transparent' }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.0} castShadow />
        <pointLight position={[-5, -5, 2]} intensity={1.0} />
        <directionalLight position={[0, 0, -5]} intensity={0.8} /> {/* rim light */}
        
        <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.5}>
          <LogoDisc scale={scale} />
        </Float>
      </Canvas>
    </Suspense>
  );
}
