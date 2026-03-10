import { DomainHub } from '../../../components/DomainHub';

export function CoLogosHub({ domainId, domainName, onEnterWorkspace }: any) {
    return (
        <DomainHub
            domainId={domainId}
            domainName={domainName}
            onEnterWorkspace={onEnterWorkspace}
            metrics={
                <div className="text-xs text-[var(--text-secondary)]">Collab Engine Ready</div>
            }
            actions={
                <button className="bg-white/5 p-2 rounded text-[10px]">Ping Network</button>
            }
            workspace={
                <div className="flex flex-col items-center gap-4">
                    <span className="text-2xl">🤝</span>
                    <span className="text-[var(--text-secondary)] text-sm">Open Collab Stream</span>
                </div>
            }
        />
    );
}
