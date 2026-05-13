import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useClockStore } from '@/stores/clockStore';
import { useUiStore } from '@/stores/uiStore';
import type { Quaternion as Q4 } from '@/services/types';

const FIBER_COUNT = 36;
const POINTS_PER_FIBER = 64;
const TAU = Math.PI * 2;
const LENS_COLORS = [0x94a3b8, 0xa78bfa, 0xf472b6, 0xfb923c, 0x4ade80, 0x38bdf8];

function hopfFiber(baseTheta: number, basePhi: number, fiberParam: number): THREE.Vector3 {
  const ct = Math.cos(baseTheta / 2);
  const st = Math.sin(baseTheta / 2);
  const a = ct * Math.cos(fiberParam + basePhi / 2);
  const b = ct * Math.sin(fiberParam + basePhi / 2);
  const c = st * Math.cos(fiberParam - basePhi / 2);
  const d = st * Math.sin(fiberParam - basePhi / 2);

  const denom = 1 - d;
  if (Math.abs(denom) < 0.001) return new THREE.Vector3(0, 0, 10);
  return new THREE.Vector3(a / denom, b / denom, c / denom);
}

function applyQuaternion(v: THREE.Vector3, q: Q4): THREE.Vector3 {
  const quat = new THREE.Quaternion(q[1], q[2], q[3], q[0]);
  return v.clone().applyQuaternion(quat);
}

function FiberBundle() {
  const { state: clockState } = useClockStore();
  const { activeBranchLens } = useUiStore();
  const groupRef = useRef<THREE.Group>(null);

  const fibers = useMemo(() => {
    const result: { points: [number, number, number][]; color: string }[] = [];

    for (let i = 0; i < FIBER_COUNT; i++) {
      const theta = (i / FIBER_COUNT) * Math.PI;
      const phi = (i / FIBER_COUNT) * TAU * 2;
      const pts: [number, number, number][] = [];

      for (let j = 0; j <= POINTS_PER_FIBER; j++) {
        const t = (j / POINTS_PER_FIBER) * TAU;
        let pt = hopfFiber(theta, phi, t);
        if (clockState) {
          pt = applyQuaternion(pt, clockState.live_quaternion);
        }
        pts.push([pt.x, pt.y, pt.z]);
      }

      const hue = (i / FIBER_COUNT + activeBranchLens * 0.15) % 1;
      const color = new THREE.Color().setHSL(hue, 0.6, 0.5);
      result.push({ points: pts, color: `#${color.getHexString()}` });
    }

    return result;
  }, [clockState?.live_quaternion, activeBranchLens]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {fibers.map((fiber, i) => (
        <Line
          key={i}
          points={fiber.points}
          color={fiber.color}
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      ))}
    </group>
  );
}

function DegreeIndicator() {
  const { state: clockState } = useClockStore();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current || !clockState) return;
    const angle = (clockState.current_degree / 360) * TAU;
    meshRef.current.position.set(
      4 * Math.cos(angle),
      4 * Math.sin(angle),
      0,
    );
  });

  if (!clockState) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={0.8} />
    </mesh>
  );
}

function TickRing() {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 72; i++) {
      const angle = (i / 72) * TAU;
      pts.push([4 * Math.cos(angle), 4 * Math.sin(angle), 0]);
    }
    return pts;
  }, []);

  return (
    <Line points={points} color="#333333" lineWidth={1} transparent opacity={0.3} />
  );
}

function HopfScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-5, -5, 3]} intensity={0.2} color="#a78bfa" />
      <FiberBundle />
      <TickRing />
      <DegreeIndicator />
      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        minDistance={3}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

export function HopfClock() {
  const { state: clockState } = useClockStore();

  return (
    <div className="relative w-full h-full min-h-[200px]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <HopfScene />
      </Canvas>
      {clockState && (
        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-neutral-600">
          {clockState.current_degree.toFixed(1)}° · tick {clockState.tick12}
        </div>
      )}
    </div>
  );
}
