import { ReactNode } from 'react';
import { FunctionalGrid } from '../powers/layout/FunctionalGrid';

interface DomainHubProps {
    domainId: string;
    domainName: string;
    metrics?: ReactNode;
    actions?: ReactNode;
    workspace?: ReactNode;
    onEnterWorkspace: () => void;
    strata?: any[];
}

export function DomainHub({ domainId, domainName, metrics, actions, workspace, onEnterWorkspace, strata }: DomainHubProps) {
    const colorVar = `--color-${domainId}`;

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-app)]">
            {/* Minimal Header Strip */}
            <div className="flex-none h-10 px-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">{domainId} STATION</span>
                    <div className="h-3 w-px bg-white/10"></div>
                    <h1 className="text-sm font-medium tracking-tight text-white">
                        {domainName} <span style={{ color: `var(${colorVar})` }}>Hub</span>
                    </h1>
                </div>
            </div>

            {/* Main Functional Layout */}
            <div className="flex-1 w-full h-full overflow-hidden relative">
                <FunctionalGrid
                    domainId={domainId}
                    strata={strata}
                    metrics={metrics}
                    actions={actions}
                    workspace={workspace}
                    onEnterWorkspace={onEnterWorkspace}
                />
            </div>
        </div>
    );
}
