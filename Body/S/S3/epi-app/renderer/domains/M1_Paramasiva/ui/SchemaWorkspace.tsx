import { ForceGraphPower } from '../../../powers/graph/ForceGraph';

export function SchemaWorkspace({ onBack }: { onBack: () => void }) {
    // Placeholder Data for Visual Confirmation
    const mockData = { nodes: [], relationships: [] };

    return (
        <div className="h-full flex flex-col relative w-full">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-50 text-xs text-white/50 hover:text-white bg-black/50 px-2 py-1 rounded backdrop-blur-md"
            >
                ← Hub
            </button>
            <div className="flex-1 flex items-center justify-center bg-[#050505] text-white/20">
                {/* Once Logic is ready, we pass real data to ForceGraphPower */}
                <ForceGraphPower data={mockData} />
            </div>
        </div>
    );
}
