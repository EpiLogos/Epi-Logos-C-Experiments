import type { GatewayPanel } from '../../../stores/epiClawGatewayStore';
import { ADVANCED_PANELS } from '../contracts/panels';

type AdvancedDrawerProps = {
  activePanel: GatewayPanel;
  onSelect: (panel: GatewayPanel) => void;
  open: boolean;
};

export function AdvancedDrawer({ activePanel, onSelect, open }: AdvancedDrawerProps) {
  if (!open) return null;

  return (
    <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-black/20">
      <div className="mb-2 text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">Advanced</div>
      <div className="flex flex-wrap gap-2">
        {ADVANCED_PANELS.map((panel) => {
          const active = activePanel === panel.id;
          return (
            <button
              key={panel.id}
              type="button"
              onClick={() => onSelect(panel.id)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                active
                  ? 'bg-[var(--color-m5)]/20 border-[var(--color-m5)]/50 text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/10'
              }`}
            >
              {panel.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
