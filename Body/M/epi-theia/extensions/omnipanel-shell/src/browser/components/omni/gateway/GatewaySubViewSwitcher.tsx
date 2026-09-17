import {
  GATEWAY_SUBVIEWS,
  type GatewaySubView
} from './gatewayModel';

export interface GatewaySubViewSwitcherProps {
  readonly activeSubView: GatewaySubView;
  readonly onChange: (subView: GatewaySubView) => void;
}

export function GatewaySubViewSwitcher({ activeSubView, onChange }: GatewaySubViewSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-2" data-test="gateway-subview-switcher">
      {GATEWAY_SUBVIEWS.map(view => (
        <button
          key={view.id}
          type="button"
          className={`px-3 py-1.5 text-xs rounded border ${
            activeSubView === view.id
              ? 'border-[var(--color-m5)]/50 bg-[var(--color-m5)]/15'
              : 'border-[var(--border-subtle)]'
          }`}
          onClick={() => onChange(view.id)}
          data-test={`gateway-subview-${view.id}`}
          aria-pressed={activeSubView === view.id}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
