import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── Individual floating shape ── */
function FloatingShape({ geometry, position, rotation, scale, speed, color, floatSpeed, floatIntensity }) {
  const meshRef = useRef();
  const initialRotation = useMemo(() => rotation, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = initialRotation[0] + t * speed * 0.3;
    meshRef.current.rotation.y = initialRotation[1] + t * speed * 0.5;
    meshRef.current.rotation.z = initialRotation[2] + t * speed * 0.2;
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.2} floatIntensity={floatIntensity}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.55}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

/* ── Wireframe ring ── */
function WireframeRing({ position, scale, color, speed }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * speed * 0.4;
    meshRef.current.rotation.z = t * speed * 0.3;
  });

  return (
    <Float speed={1.0} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1, 0.03, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

/* ── Tiny floating particles ── */
function Particles({ count = 40 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#93A3BC"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Scene that holds all the 3D shapes ── */
function Scene({ isMobile }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
  });

  const shapes = useMemo(() => {
    const baseShapes = [
      // Large translucent sphere — top left
      {
        geometry: <icosahedronGeometry args={[1, 1]} />,
        position: [-3.5, 1.8, -2],
        rotation: [0.4, 0.2, 0],
        scale: isMobile ? 0.8 : 1.2,
        speed: 0.15,
        color: '#A5B4FC', // soft indigo
        floatSpeed: 1.2,
        floatIntensity: 0.6,
      },
      // Medium torus knot — right side
      {
        geometry: <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />,
        position: [3.8, -0.5, -1.5],
        rotation: [0.8, 1.2, 0],
        scale: isMobile ? 0.55 : 0.8,
        speed: 0.12,
        color: '#C4B5FD', // soft violet
        floatSpeed: 1.5,
        floatIntensity: 0.5,
      },
      // Octahedron — bottom left
      {
        geometry: <octahedronGeometry args={[0.8, 0]} />,
        position: [-2.8, -2.2, -1],
        rotation: [0.3, 0.6, 0.5],
        scale: isMobile ? 0.6 : 0.9,
        speed: 0.2,
        color: '#93C5FD', // soft blue
        floatSpeed: 1.8,
        floatIntensity: 0.7,
      },
      // Small dodecahedron — top right
      {
        geometry: <dodecahedronGeometry args={[0.5, 0]} />,
        position: [2.5, 2.5, -2.5],
        rotation: [1.2, 0.3, 0.8],
        scale: isMobile ? 0.5 : 0.7,
        speed: 0.18,
        color: '#BFDBFE', // light blue
        floatSpeed: 1.3,
        floatIntensity: 0.4,
      },
      // Sphere — center background
      {
        geometry: <sphereGeometry args={[0.7, 32, 32]} />,
        position: [0.5, 0.3, -3.5],
        rotation: [0, 0, 0],
        scale: isMobile ? 0.7 : 1.0,
        speed: 0.08,
        color: '#DDD6FE', // faint purple
        floatSpeed: 0.8,
        floatIntensity: 0.3,
      },
      // Cone — bottom right
      {
        geometry: <coneGeometry args={[0.5, 1.2, 6]} />,
        position: [3.2, -2.5, -2],
        rotation: [0.5, 0, 1.0],
        scale: isMobile ? 0.5 : 0.7,
        speed: 0.14,
        color: '#E0E7FF', // pale indigo
        floatSpeed: 1.6,
        floatIntensity: 0.5,
      },
    ];
    return baseShapes;
  }, [isMobile]);

  return (
    <group ref={groupRef}>
      {shapes.map((s, i) => (
        <FloatingShape key={i} {...s} />
      ))}

      {/* Decorative wireframe rings */}
      <WireframeRing position={[-1.5, 1.0, -3]} scale={isMobile ? 0.8 : 1.2} color="#C7D2FE" speed={0.1} />
      <WireframeRing position={[2.0, -1.5, -2.5]} scale={isMobile ? 0.6 : 0.9} color="#DDD6FE" speed={-0.08} />

      {/* Floating particles for depth */}
      <Particles count={isMobile ? 20 : 50} />
    </group>
  );
}

/* ── Exported full-screen 3D background canvas ── */
export default function HeroBackground3D() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 50 }}
          dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5)}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <color attach="background" args={['#FFFFFF']} />
          <fog attach="fog" args={['#FFFFFF', 8, 18]} />

          <ambientLight intensity={1.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} color="#F8FAFC" />
          <directionalLight position={[-3, 3, 2]} intensity={0.6} color="#E0E7FF" />
          <pointLight position={[0, -3, 3]} intensity={0.4} color="#C7D2FE" />

          <Scene isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}
