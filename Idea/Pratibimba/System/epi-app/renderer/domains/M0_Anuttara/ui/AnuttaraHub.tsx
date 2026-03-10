import { DomainHub } from '../../../components/DomainHub';
import { AnuttaraState, AnuttaraActions } from '../core/useAnuttara';

interface AnuttaraHubViewProps {
  domainId: string;
  domainName: string;
  state: AnuttaraState;
  actions: AnuttaraActions;
  onEnterWorkspace: () => void;
}

export function AnuttaraHubView({ domainId, domainName, state, actions, onEnterWorkspace }: AnuttaraHubViewProps) {
  const { metrics } = state;

  const workspaceVisual = (
    <div className="flex flex-col items-center gap-4 pt-10 cursor-pointer group" onClick={onEnterWorkspace}>
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border border-white/20 group-hover:animate-ping transition-all"></div>
        <div className="absolute inset-2 rounded-full bg-white/10 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
      <span className="text-[var(--text-secondary)] text-sm group-hover:text-white transition-colors">Enter Graph View</span>
    </div>
  );

  return (
    <DomainHub
      domainId={domainId}
      domainName={domainName}
      onEnterWorkspace={onEnterWorkspace}
      strata={[
        {
          title: "0' The Void (Metrics)",
          content: (
            <div className="p-4 h-full overflow-auto custom-scrollbar">
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Total Nodes</span>
                  <span className="text-white font-mono">{metrics.nodeCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Density</span>
                  <span className="text-[var(--color-m0)]">{metrics.density}</span>
                </div>
              </div>
            </div>
          )
        },
        {
          title: "1' Impulse (Actions)",
          content: (
            <div className="p-4 h-full grid grid-cols-2 gap-2 content-start">
              <button onClick={() => actions.refreshGraph()} className="bg-white/5 hover:bg-white/10 p-2 rounded text-[10px] text-center transition-colors">Refresh</button>
              <button onClick={() => actions.exportCSV()} className="bg-white/5 hover:bg-white/10 p-2 rounded text-[10px] text-center transition-colors">Export</button>
            </div>
          )
        },
        {
          title: "2' Resonance",
          content: <div className="p-4 text-xs text-white/30">Waveform analysis pending...</div>
        },
        {
          title: "3' Structuration",
          content: <div className="p-4 text-xs text-white/30">No active structures detected.</div>
        },
        {
          title: "4' Action",
          content: <div className="p-4 text-xs text-white/30">Command buffer empty.</div>
        },
        {
          title: "5' Synthesis",
          content: workspaceVisual
        }
      ]}
    />
  );
}
