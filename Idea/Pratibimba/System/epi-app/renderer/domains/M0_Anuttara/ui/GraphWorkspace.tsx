import { ForceGraphPower } from '../../../powers/graph/ForceGraph';
import { GraphData } from '../../../../shared/types';

interface GraphWorkspaceProps {
    data: GraphData | null;
    onBack: () => void;
}

export function GraphWorkspace({ data, onBack }: GraphWorkspaceProps) {
    return (
        <div className="h-full flex flex-col relative w-full">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-50 text-xs text-white/50 hover:text-white bg-black/50 px-2 py-1 rounded backdrop-blur-md"
            >
                ← Hub
            </button>
            <ForceGraphPower data={data} />
        </div>
    );
}

