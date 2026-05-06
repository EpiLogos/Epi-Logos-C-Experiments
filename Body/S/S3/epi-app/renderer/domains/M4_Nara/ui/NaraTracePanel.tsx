interface NaraTracePanelProps {
  traces: string[];
}

export function NaraTracePanel({ traces }: NaraTracePanelProps) {
  return (
    <div className="border p-2" style={{ borderColor: 'color-mix(in srgb, var(--border-subtle) 82%, #fff 18%)' }}>
      <p className="mb-1 text-[10px] font-semibold text-[var(--text-primary)]">Recent Event Log</p>
      <div className="max-h-16 overflow-auto">
        {traces.map((trace, idx) => (
          <p key={`${trace}-${idx}`} className="text-[9px] text-[var(--text-secondary)]">
            {trace}
          </p>
        ))}
      </div>
    </div>
  );
}

export default NaraTracePanel;
