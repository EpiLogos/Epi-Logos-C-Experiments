import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { useGraphStore } from '@/stores/graphStore';
import { useUiStore } from '@/stores/uiStore';
import type { GraphNode, GraphEdge } from '@/services/types';

const LENS_COLORS = ['#94a3b8', '#a78bfa', '#f472b6', '#fb923c', '#4ade80', '#38bdf8'];
const NAMESPACE_COLORS: Record<string, string> = {
  Bimba: '#a78bfa',
  Gnostic: '#f472b6',
  Atelier: '#fb923c',
};

function nodeColor(node: GraphNode, lensIndex: number): string {
  for (const label of node.labels) {
    if (label in NAMESPACE_COLORS) return NAMESPACE_COLORS[label];
  }
  return LENS_COLORS[lensIndex % LENS_COLORS.length];
}

function nodeLabel(node: GraphNode): string {
  if (node.coordinate) return node.coordinate;
  const name = node.properties?.name;
  if (typeof name === 'string') return name;
  return node.id.slice(0, 8);
}

interface ForceNode {
  id: string;
  x?: number;
  y?: number;
  _node: GraphNode;
}

interface ForceLink {
  source: string;
  target: string;
  _edge: GraphEdge;
}

export function BimbaMap2D() {
  const { data, selectedNode, selectNode } = useGraphStore();
  const { activeBranchLens } = useUiStore();
  const graphRef = useRef<ForceGraphMethods<ForceNode, ForceLink>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const graphData = useMemo(() => {
    if (!data) return { nodes: [] as ForceNode[], links: [] as ForceLink[] };
    const nodes: ForceNode[] = data.nodes.map((n) => ({ id: n.id, _node: n }));
    const nodeIds = new Set(nodes.map((n) => n.id));
    const links: ForceLink[] = data.edges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, _edge: e }));
    return { nodes, links };
  }, [data]);

  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(-80);
    fg.d3Force('link')?.distance(60);
  }, [graphData]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (node: ForceNode) => {
      selectNode(node._node);
    },
    [selectNode],
  );

  const handleBackgroundClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const paintNode = useCallback(
    (node: ForceNode, ctx: CanvasRenderingContext2D) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const isSelected = selectedNode?.id === node.id;
      const color = nodeColor(node._node, activeBranchLens);
      const radius = isSelected ? 6 : 4;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const label = nodeLabel(node._node);
      ctx.font = '3px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#666';
      ctx.fillText(label, x, y + radius + 2);
    },
    [selectedNode, activeBranchLens],
  );

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
        No graph data
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node: ForceNode, color: string, ctx: CanvasRenderingContext2D) => {
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        linkColor={() => '#333'}
        linkWidth={0.5}
        backgroundColor="#0a0a0a"
        cooldownTicks={100}
        enablePanInteraction
        enableZoomInteraction
      />
    </div>
  );
}
