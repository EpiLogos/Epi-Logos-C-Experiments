import { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData, QL_POSITION_COLORS } from '../../../shared/types';

interface ForceGraphPowerProps {
    data: GraphData | null;
    width?: number;
    height?: number;
    onNodeClick?: (node: any) => void;
}

const DEFAULT_NODE_COLOR = '#6b7280';

export function ForceGraphPower({ data, onNodeClick }: ForceGraphPowerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const forceGraphData = useMemo(() => {
        if (!data) return { nodes: [], links: [] };

        const nodes = data.nodes.map(n => ({
            id: n.id,
            labels: n.labels,
            title: n.title,
            color: n.qlPosition ? QL_POSITION_COLORS[n.qlPosition] || DEFAULT_NODE_COLOR : DEFAULT_NODE_COLOR,
            val: 1
        }));

        const links = data.relationships.map(r => ({
            source: r.startNodeId,
            target: r.endNodeId,
            type: r.type
        }));

        return { nodes, links };
    }, [data]);

    if (!data) return <div className="flex items-center justify-center h-full text-white/50">No Data</div>;

    return (
        <div ref={containerRef} className="flex-1 h-full overflow-hidden bg-[#050505]">
            <ForceGraph2D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={forceGraphData}
                nodeColor="color"
                backgroundColor="#050505"
                onNodeClick={onNodeClick}
            />
        </div>
    );
}
