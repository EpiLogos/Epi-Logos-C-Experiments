import type { GatewayPanel, ConnectionState } from '../../../stores/epiClawGatewayStore';
import { panelLabel } from '../contracts/panels';
import { OmniButton } from '../ui/button';

type OmniPanelHeaderProps = {
  activePanel: GatewayPanel;
  connectionState: ConnectionState;
  advancedMenuOpen: boolean;
  advancedPanels: Array<{ id: GatewayPanel; label: string }>;
  onToggleAdvancedMenu: () => void;
  onSelectAdvancedPanel: (panel: GatewayPanel) => void;
};

export function OmniPanelHeader({
  activePanel,
  connectionState,
  advancedMenuOpen,
  advancedPanels,
  onToggleAdvancedMenu,
  onSelectAdvancedPanel,
}: OmniPanelHeaderProps) {
  return (
    <header className="shrink-0 px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-white/5 relative">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Epi-Claw Gateway</h2>
        <span className="text-sm text-[var(--text-tertiary)]">{panelLabel(activePanel)}</span>
      </div>

      <div className="flex items-center gap-2">
        <OmniButton
          type="button"
          aria-label="More Panels"
          onClick={onToggleAdvancedMenu}
          className="px-2.5 py-1"
          title="Open advanced panels"
        >
          {advancedMenuOpen ? 'Close More' : 'More'}
        </OmniButton>

        <div
          className={`text-xs px-2 py-0.5 rounded ${
            connectionState === 'connected'
              ? 'bg-green-500/20 text-green-400'
              : connectionState === 'connecting'
                ? 'bg-yellow-500/20 text-yellow-400'
                : connectionState === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {connectionState}
        </div>
      </div>

      {advancedMenuOpen && (
        <div className="absolute top-[calc(100%-2px)] right-3 z-20 w-52 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-omnipanel)] shadow-2xl p-1.5">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] px-2 pb-1">Advanced</div>
          <div className="space-y-1">
            {advancedPanels.map((panel) => {
              const active = panel.id === activePanel;
              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => onSelectAdvancedPanel(panel.id)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs border transition-colors ${
                    active
                      ? 'bg-[var(--color-m5)]/20 border-[var(--color-m5)]/50 text-[var(--text-primary)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-subtle)] hover:bg-white/5'
                  }`}
                >
                  {panel.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
