import type { GatewayPanel } from '../../../stores/epiClawGatewayStore';
import { PRIMARY_PANELS } from '../contracts/panels';
import { OmniTabs } from '../ui/tabs';

type PrimaryTabsProps = {
  activePanel: GatewayPanel;
  onSelect: (panel: GatewayPanel) => void;
};

export function PrimaryTabs({ activePanel, onSelect }: PrimaryTabsProps) {
  const items = PRIMARY_PANELS.map((panel) => ({ id: panel.id, label: panel.label }));

  return (
    <div className="shrink-0 px-4 py-2 border-b border-[var(--border-subtle)] bg-white/5">
      <OmniTabs items={items} activeId={activePanel} onSelect={(id) => onSelect(id as GatewayPanel)} />
    </div>
  );
}
