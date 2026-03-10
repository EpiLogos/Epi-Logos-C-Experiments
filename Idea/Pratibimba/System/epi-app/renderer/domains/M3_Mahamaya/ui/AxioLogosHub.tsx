import { DomainHub } from '../../../components/DomainHub';

export function AxioLogosHub({ domainId, domainName, onEnterWorkspace }: any) {
    return (
        <DomainHub
            domainId={domainId}
            domainName={domainName}
            onEnterWorkspace={onEnterWorkspace}
            metrics={
                <div className="text-xs text-[var(--text-secondary)]">Pattern Recognition Idle</div>
            }
            actions={
                <button className="bg-white/5 p-2 rounded text-[10px]">Run Audit</button>
            }
            workspace={
                <div className="flex flex-col items-center gap-4">
                    <span className="text-2xl">👁️</span>
                    <span className="text-[var(--text-secondary)] text-sm">Open Axiom Audit</span>
                </div>
            }
        />
    );
}
