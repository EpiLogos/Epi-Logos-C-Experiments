import { DomainHub } from '../../../components/DomainHub';
import { EpiiState, EpiiActions } from '../core/useEpii';

interface SystemHubViewProps {
  domainId: string;
  domainName: string;
  state: EpiiState;
  actions: EpiiActions;
  onEnterWorkspace: () => void;
}

export function SystemHubView({ domainId, domainName, state, actions, onEnterWorkspace }: SystemHubViewProps) {
  const { stats } = state;

  return (
    <DomainHub
      domainId={domainId}
      domainName={domainName}
      onEnterWorkspace={onEnterWorkspace}
      metrics={
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>CPU</span>
            <span className="text-white font-mono">{stats.cpu}%</span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>RAM</span>
            <span className="text-white font-mono">{stats.ram} GB</span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Uptime</span>
            <span className="text-cyan-400 font-mono">{stats.uptime}</span>
          </div>
        </div>
      }
      actions={
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => actions.refreshContext()}
            className="bg-white/5 hover:bg-white/10 p-2 rounded text-[10px] text-center transition-colors"
          >
            Restart
          </button>
          <button className="bg-white/5 hover:bg-white/10 p-2 rounded text-[10px] text-center transition-colors">Config</button>
        </div>
      }
      workspace={
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-[var(--color-m5)] flex items-center justify-center bg-[var(--color-m5)]/10">
            <span className="text-2xl">⚡</span>
          </div>
          <span className="text-[var(--text-secondary)] text-sm">Access System Core</span>
        </div>
      }
    />
  );
}
