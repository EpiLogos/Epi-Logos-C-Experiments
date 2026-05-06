import { DomainHub } from '../../../components/DomainHub';
import { NaraState, NaraActions } from '../core/useNara';

interface JournalHubViewProps {
  domainId: string;
  domainName: string;
  state: NaraState;
  actions: NaraActions;
  onEnterWorkspace: () => void;
}

export function JournalHubView({ domainId, domainName, state, actions, onEnterWorkspace }: JournalHubViewProps) {
  const { stats } = state;

  return (
    <DomainHub
      domainId={domainId}
      domainName={domainName}
      onEnterWorkspace={onEnterWorkspace}
      metrics={
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Entries</span>
            <span className="text-white font-mono">{stats.entryCount}</span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Words</span>
            <span className="text-white font-mono">{stats.words}</span>
          </div>
        </div>
      }
      actions={
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => actions.refresh()}
            className="bg-white/5 hover:bg-white/10 p-2 rounded text-[10px] text-center transition-colors"
          >
            Refresh
          </button>
          <button className="bg-white/5 hover:bg-white/10 p-2 rounded text-[10px] text-center transition-colors">Archive</button>
        </div>
      }
      workspace={
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-[var(--color-m4)] flex items-center justify-center bg-[var(--color-m4)]/10">
            <span className="text-2xl">📓</span>
          </div>
          <span className="text-[var(--text-secondary)] text-sm">Open Log Stream</span>
        </div>
      }
    />
  );
}
