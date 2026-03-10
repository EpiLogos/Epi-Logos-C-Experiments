import { useState } from 'react';
import { EpiiState } from '../core/useEpii';
import { AgentPanel } from './components/AgentPanel';
import { FileTreePanel } from './components/FileTreePanel';

interface SystemWorkspaceProps {
    state: EpiiState;
    onBack: () => void;
}

export function SystemWorkspace({ state, onBack }: SystemWorkspaceProps) {
    const [tab, setTab] = useState<'agent' | 'files'>('agent');
    const { context, skills, fileTree, loading } = state;

    if (loading) return <div className="flex items-center justify-center h-full text-white/50">Loading System...</div>;

    return (
        <div className="h-full flex flex-col relative w-full">
            {/* Header / Tabs */}
            <div className="flex-shrink-0 p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-app)]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-xs text-[var(--text-tertiary)] hover:text-white px-2 py-1 rounded hover:bg-white/10"
                    >
                        ← Hub
                    </button>
                    <div className="flex bg-white/5 rounded p-1">
                        <button
                            onClick={() => setTab('agent')}
                            className={`px-3 py-1 rounded text-xs transition-colors ${tab === 'agent' ? 'bg-white/10 text-white' : 'text-[var(--text-tertiary)] hover:text-white'}`}
                        >
                            Agent Interface
                        </button>
                        <button
                            onClick={() => setTab('files')}
                            className={`px-3 py-1 rounded text-xs transition-colors ${tab === 'files' ? 'bg-white/10 text-white' : 'text-[var(--text-tertiary)] hover:text-white'}`}
                        >
                            File Tree
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-8 max-w-6xl mx-auto w-full">
                {tab === 'agent' ? (
                    <AgentPanel context={context} skills={skills} />
                ) : (
                    <FileTreePanel tree={fileTree} />
                )}
            </div>
        </div>
    );
}
