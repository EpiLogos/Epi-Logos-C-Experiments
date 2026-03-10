export function CollabWorkspace({ onBack }: { onBack: () => void }) {
    return (
        <div className="h-full flex flex-col relative w-full">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-50 text-xs text-white/50 hover:text-white bg-black/50 px-2 py-1 rounded backdrop-blur-md"
            >
                ← Hub
            </button>
            <div className="flex-1 flex items-center justify-center bg-[#050505] text-white/20">
                <div>(Placeholder: Collab Stream)</div>
            </div>
        </div>
    );
}
