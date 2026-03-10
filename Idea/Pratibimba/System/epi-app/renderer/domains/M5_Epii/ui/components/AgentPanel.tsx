import { AgentContext } from '../../core/useEpii';

export function AgentPanel({ context, skills }: { context: AgentContext | null, skills: any[] }) {
    if (!context) return <div className="text-white/50 text-sm">No Active Agent Session</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded border border-white/5">
                <h3 className="text-xs uppercase text-[var(--text-tertiary)] mb-2">Session Context</h3>
                <pre className="text-xs text-green-400 font-mono overflow-auto max-h-40">
                    {JSON.stringify(context, null, 2)}
                </pre>
            </div>
            <div className="bg-white/5 p-4 rounded border border-white/5">
                <h3 className="text-xs uppercase text-[var(--text-tertiary)] mb-2">Available Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                            {s.name || s}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
