import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ────────────────────────────────────────────────────
   1. GEAR COG — precise toothed engineering wheel
   ──────────────────────────────────────────────────── */
function GearCog({ position, scale, speed, color, teeth = 12, innerRadius = 0.6, outerRadius = 1.0, thickness = 0.15 }) {
  const meshRef = useRef();
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const toothDepth = outerRadius - innerRadius;
    const anglePerTooth = (Math.PI * 2) / teeth;
    const halfTooth = anglePerTooth * 0.25;

    for (let i = 0; i < teeth; i++) {
      const angle = i * anglePerTooth;
      // inner arc
      shape.absarc(0, 0, innerRadius, angle + halfTooth, angle + anglePerTooth - halfTooth, false);
      // outer tooth
      shape.absarc(0, 0, outerRadius, angle + anglePerTooth - halfTooth, angle + anglePerTooth + halfTooth, false);
    }

    // center hole
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius * 0.35, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [teeth, innerRadius, outerRadius, thickness]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = state.clock.getElapsedTime() * speed;
  });

  return (
    <Float speed={0.8} floatIntensity={0.2} rotationIntensity={0.05}>
      <mesh ref={meshRef} geometry={geometry} position={position} scale={scale}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

/* ────────────────────────────────────────────────────
   2. WIREFRAME GEODESIC — engineering structural frame
   ──────────────────────────────────────────────────── */
function GeodesicFrame({ position, scale, speed, color, detail = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * speed * 0.3;
    meshRef.current.rotation.y = t * speed * 0.5;
  });

  return (
    <Float speed={1.0} floatIntensity={0.3} rotationIntensity={0.1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, detail]} />
        <meshPhysicalMaterial
          color={color}
          wireframe
          roughness={0.2}
          metalness={0.5}
          transparent
          opacity={0.35}
        />
      </mesh>
    </Float>
  );
}

/* ────────────────────────────────────────────────────
   3. CIRCUIT NODE NETWORK — connected points
   ──────────────────────────────────────────────────── */
function CircuitNetwork({ position, scale, color, nodeCount = 8 }) {
  const groupRef = useRef();
  const { nodes, edges } = useMemo(() => {
    const n = [];
    for (let i = 0; i < nodeCount; i++) {
      n.push(new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 1.5
      ));
    }
    const e = [];
    for (let i = 0; i < n.length; i++) {
      for (let j = i + 1; j < n.length; j++) {
        if (n[i].distanceTo(n[j]) < 2.0) {
          e.push([n[i], n[j]]);
        }
      }
    }
    return { nodes: n, edges: e };
  }, [nodeCount]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.15;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Connection lines */}
      {edges.map((edge, i) => {
        const points = [edge[0], edge[1]];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`edge-${i}`} geometry={lineGeo}>
            <lineBasicMaterial color={color} transparent opacity={0.2} />
          </line>
        );
      })}
      {/* Nodes */}
      {nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={node}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────────────
   4. TECHNICAL GRID PLANE — engineering blueprint floor
   ──────────────────────────────────────────────────── */
function GridPlane({ position, rotation, size = 6, divisions = 12, color }) {
  const gridRef = useRef();

  useFrame((state) => {
    if (!gridRef.current) return;
    gridRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
  });

  return (
    <group ref={gridRef} position={position} rotation={rotation}>
      <gridHelper args={[size, divisions, color, color]} material-transparent material-opacity={0.08} />
    </group>
  );
}

/* ────────────────────────────────────────────────────
   5. PRECISION RING — mechanical bearing ring
   ──────────────────────────────────────────────────── */
function PrecisionRing({ position, scale, speed, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * speed * 0.4;
    meshRef.current.rotation.y = t * speed * 0.2;
  });

  return (
    <Float speed={0.6} floatIntensity={0.15}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1, 0.04, 16, 64]} />
        <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.7} transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

/* ────────────────────────────────────────────────────
   6. AXIS CROSS — 3D coordinate axis indicator
   ──────────────────────────────────────────────────── */
function AxisCross({ position, scale }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.06;
  });

  const axisLen = 0.8;
  const axisRadius = 0.012;
  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* X — red */}
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[axisRadius, axisRadius, axisLen, 8]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0.25} />
      </mesh>
      {/* Y — green */}
      <mesh>
        <cylinderGeometry args={[axisRadius, axisRadius, axisLen, 8]} />
        <meshBasicMaterial color="#22C55E" transparent opacity={0.25} />
      </mesh>
      {/* Z — blue */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[axisRadius, axisRadius, axisLen, 8]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.25} />
      </mesh>
      {/* Center node */}
      <mesh>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#64748B" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* ────────────────────────────────────────────────────
   SCENE — assembles all engineering elements
   ──────────────────────────────────────────────────── */
function Scene({ isMobile }) {
  const s = isMobile ? 0.65 : 1;
  return (
    <group>
      {/* Gear cogs — interlocking pair (vibrant pink and blue) */}
      <GearCog position={[-3.8 * s, 1.5 * s, -2]} scale={s * 0.9} speed={0.15} color="#EC4899" teeth={14} />
      <GearCog position={[-2.3 * s, 0.5 * s, -2.5]} scale={s * 0.6} speed={-0.22} color="#3B82F6" teeth={10} />

      {/* Geodesic wireframe structures (vibrant purple and cyan) */}
      <GeodesicFrame position={[3.5 * s, 1.8 * s, -2]} scale={s * 1.1} speed={0.08} color="#8B5CF6" detail={1} />
      <GeodesicFrame position={[-1 * s, -2.5 * s, -3]} scale={s * 0.7} speed={-0.06} color="#06B6D4" detail={2} />

      {/* Circuit node networks (vibrant amber and emerald) */}
      <CircuitNetwork position={[3 * s, -1.5 * s, -1.5]} scale={s * 0.8} color="#F59E0B" nodeCount={isMobile ? 6 : 10} />
      <CircuitNetwork position={[-3 * s, -1 * s, -2.5]} scale={s * 0.5} color="#10B981" nodeCount={isMobile ? 5 : 7} />

      {/* Precision mechanical rings */}
      <PrecisionRing position={[0.8 * s, 2.2 * s, -3]} scale={s * 0.6} speed={0.1} color="#D946EF" />
      <PrecisionRing position={[-2 * s, -2.8 * s, -2]} scale={s * 0.45} speed={-0.12} color="#3B82F6" />

      {/* Axis crosses — engineering coordinate markers */}
      <AxisCross position={[2.5 * s, 2 * s, -1.5]} scale={s * 0.9} />
      {!isMobile && <AxisCross position={[-4 * s, -0.5 * s, -1]} scale={s * 0.7} />}
    </group>
  );
}

/* ────────────────────────────────────────────────────
   EXPORT — full-screen 3D background canvas
   ──────────────────────────────────────────────────── */
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
          {/* Transparent background so HTML moving gradient shines through */}
          <fog attach="fog" args={['#EEF2FF', 8, 20]} />

          <ambientLight intensity={2.0} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} color="#F8FAFC" />
          <directionalLight position={[-3, 3, 2]} intensity={0.8} color="#E0E7FF" />

          <Scene isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}
