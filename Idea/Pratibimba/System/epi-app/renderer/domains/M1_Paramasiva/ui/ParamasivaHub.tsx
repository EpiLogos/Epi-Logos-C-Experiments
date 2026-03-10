import { DomainHub } from '../../../components/DomainHub';

export function ParamasivaHub({ domainId, domainName, onEnterWorkspace }: any) {
    return (
        <DomainHub
            domainId={domainId}
            domainName={domainName}
            onEnterWorkspace={onEnterWorkspace}
            metrics={
                <div className="text-xs text-[var(--text-secondary)]">Schema Definition Active</div>
            }
            actions={
                <button className="bg-white/5 p-2 rounded text-[10px]">Verify Types</button>
            }
            workspace={
                <div className="flex flex-col items-center gap-4">
                    <span className="text-2xl">📐</span>
                    <span className="text-[var(--text-secondary)] text-sm">Open Schema Editor</span>
                </div>
            }
        />
    );
}
