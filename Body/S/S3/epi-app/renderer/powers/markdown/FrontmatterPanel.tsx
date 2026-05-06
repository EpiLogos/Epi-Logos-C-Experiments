export function FrontmatterPower({ data }: { data: Record<string, unknown> }) {
    if (Object.keys(data).length === 0) return null;

    return (
        <div className="bg-white/5 rounded p-4 mb-6 border border-white/5">
            <h3 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2 select-none">Metadata</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-[var(--text-tertiary)] text-[10px] uppercase">{key}</span>
                        <span className="text-white font-mono break-all">{String(value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
