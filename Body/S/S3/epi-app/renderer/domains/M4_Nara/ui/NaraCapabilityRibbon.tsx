import type { ExecutionMode } from '../../../../shared/capabilities/policy';

interface NaraCapabilityRibbonProps {
  mode: ExecutionMode;
  actions: string[];
}

export function NaraCapabilityRibbon({ mode, actions }: NaraCapabilityRibbonProps) {
  return (
    <div className="mb-2 border p-2" style={{ borderColor: 'color-mix(in srgb, var(--border-subtle) 82%, #fff 18%)' }}>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-[var(--text-primary)]">Capability Actions</p>
        <span className="text-[9px] text-[var(--text-secondary)]">Execution Mode: {mode}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {actions.map((action) => (
          <span key={action} className="border px-1.5 py-0.5 text-[9px] text-[var(--text-secondary)]" style={{ borderColor: 'color-mix(in srgb, var(--border-subtle) 82%, #fff 18%)' }}>
            {action}
          </span>
        ))}
      </div>
    </div>
  );
}

export default NaraCapabilityRibbon;
