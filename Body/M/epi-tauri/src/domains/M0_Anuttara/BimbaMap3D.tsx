import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useGraphStore } from '@/stores/graphStore';
import { useUiStore } from '@/stores/uiStore';
import type { GraphNode } from '@/services/types';

const LENS_COLORS = [0x94a3b8, 0xa78bfa, 0xf472b6, 0xfb923c, 0x4ade80, 0x38bdf8];
const NAMESPACE_COLORS: Record<string, number> = {
  Bimba: 0xa78bfa,
  Gnostic: 0xf472b6,
  Atelier: 0xfb923c,
};

function getNodeColor(node: GraphNode, lensIndex: number): number {
  for (const label of node.labels) {
    if (label in NAMESPACE_COLORS) return NAMESPACE_COLORS[label];
  }
  return LENS_COLORS[lensIndex % LENS_COLORS.length];
}

const HEX_ANGLE_OFFSET = -Math.PI / 6;
const HEX_ANGLE_STEP = Math.PI / 3;
const BASE_RADIUS = 12;
const RADIUS_DECAY = 0.3;
const Z_OSCILLATION = 2;

function hexPosition(coord: string): [number, number, number] {
  const cleaned = coord.replace(/^#/, '');
  const parts = cleaned.split(/[-.]/).map(Number);

  let x = 0, y = 0, z = 0;
  let radius = BASE_RADIUS;

  for (let depth = 0; depth < parts.length; depth++) {
    const idx = isNaN(parts[depth]) ? 0 : parts[depth] % 6;
    const angle = HEX_ANGLE_OFFSET + idx * HEX_ANGLE_STEP;
    x += radius * Math.cos(angle);
    y += radius * Math.sin(angle);
    z += (depth % 2 === 0 ? 1 : -1) * Z_OSCILLATION * Math.pow(0.7, depth);
    radius *= RADIUS_DECAY;
  }

  return [x, y, z];
}

interface NodeSphereProps {
  node: GraphNode;
  position: [number, number, number];
  color: number;
  selected: boolean;
  onClick: () => void;
}

function NodeSphere({ node, position, color, selected, onClick }: NodeSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = selected ? 1.4 : 1;

  useFrame(() => {
    if (meshRef.current && selected) {
      meshRef.current.scale.setScalar(1 + 0.1 * Math.sin(Date.now() * 0.003));
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={scale} onClick={onClick}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.6 : 0.2}
        />
      </mesh>
      {selected && node.coordinate && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.3}
          color="#e2e8f0"
          anchorX="center"
          anchorY="bottom"
        >
          {node.coordinate}
        </Text>
      )}
    </group>
  );
}

function EdgeLine({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = useMemo(() => [from, to] as const, [from, to]);

  return (
    <Line
      points={points as unknown as Array<[number, number, number]>}
      color="#333333"
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
}

function GraphScene() {
  const { data, selectedNode, selectNode } = useGraphStore();
  const { activeBranchLens } = useUiStore();

  const nodePositions = useMemo(() => {
    if (!data) return new Map<string, [number, number, number]>();
    const positions = new Map<string, [number, number, number]>();
    data.nodes.forEach((n, i) => {
      if (n.coordinate) {
        positions.set(n.id, hexPosition(n.coordinate));
      } else {
        const angle = (i / data.nodes.length) * Math.PI * 2;
        positions.set(n.id, [Math.cos(angle) * 8, Math.sin(angle) * 8, 0]);
      }
    });
    return positions;
  }, [data]);

  if (!data) return null;

  return (
    <>
      {data.edges.map((edge) => {
        const from = nodePositions.get(edge.source);
        const to = nodePositions.get(edge.target);
        if (!from || !to) return null;
        return <EdgeLine key={edge.id} from={from} to={to} />;
      })}

      {data.nodes.map((node) => {
        const pos = nodePositions.get(node.id);
        if (!pos) return null;
        return (
          <NodeSphere
            key={node.id}
            node={node}
            position={pos}
            color={getNodeColor(node, activeBranchLens)}
            selected={selectedNode?.id === node.id}
            onClick={() => selectNode(selectedNode?.id === node.id ? null : node)}
          />
        );
      })}
    </>
  );
}

export function BimbaMap3D() {
  const { data } = useGraphStore();

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
        No graph data
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 60 }}
        style={{ background: '#0a0a0a' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#a78bfa" />
        <GraphScene />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={5}
          maxDistance={60}
        />
      </Canvas>
    </div>
  );
}
