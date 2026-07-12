import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function RotatingIcosahedron() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Base continuous rotation
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.08;

      // Mouse reactivity (interpolation for smoothness)
      meshRef.current.rotation.x += (state.pointer.y * 0.4 - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (state.pointer.x * 0.4 - meshRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Tech Wireframe Shell */}
      <mesh>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshBasicMaterial color="#06b6d4" wireframe opacity={0.25} transparent />
      </mesh>

      {/* Solid Inner Core */}
      <mesh>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.2} metalness={0.85} opacity={0.7} transparent flatShading />
      </mesh>

      {/* Sparkles / Connections Points */}
      <points>
        <icosahedronGeometry args={[2.5, 2]} />
        <pointsMaterial color="#2563eb" size={0.055} sizeAttenuation />
      </points>
    </group>
  );
}

export default function TechHeroCanvas() {
  return (
    <div className="w-full h-[320px] sm:h-[400px] md:h-[500px] flex items-center justify-center relative select-none">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#7c3aed" />

        <Suspense fallback={null}>
          <RotatingIcosahedron />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}
