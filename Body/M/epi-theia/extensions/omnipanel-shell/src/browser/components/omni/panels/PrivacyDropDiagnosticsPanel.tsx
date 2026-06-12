import type { PrivacyDropAggregate } from '@pratibimba/ide-shell-m0-m5/lib/browser/services/privacy-drop-feed';

type PrivacyDropDiagnosticsPanelProps = {
  aggregate: PrivacyDropAggregate;
};

export function PrivacyDropDiagnosticsPanel({ aggregate }: PrivacyDropDiagnosticsPanelProps) {
  const widgetRows = Object.entries(aggregate.byWidget).sort(([a], [b]) => a.localeCompare(b));
  const classRows = Object.entries(aggregate.byClass).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const maxClassCount = Math.max(1, ...classRows.map(([, count]) => count));

  return (
    <div className="p-6 space-y-5" data-test="omnipanel-privacy-drop-diagnostics">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Diagnostics</h3>
        <span
          className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)] bg-black/20"
          data-test="omnipanel-privacy-drop-total"
        >
          privacy drops: {aggregate.total}
        </span>
      </div>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">By widget</h4>
        {widgetRows.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)]" data-test="omnipanel-privacy-drop-empty">
            No privacy drops recorded.
          </p>
        ) : (
          <table className="w-full text-xs border-collapse" data-test="omnipanel-privacy-drop-by-widget">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left">
                <th className="py-2 pr-3 font-medium">Widget</th>
                <th className="py-2 font-medium text-right">Drops</th>
              </tr>
            </thead>
            <tbody>
              {widgetRows.map(([widgetId, count]) => (
                <tr
                  key={widgetId}
                  className="border-b border-[var(--border-subtle)]/60"
                  data-test={`omnipanel-privacy-drop-widget-${widgetId}`}
                >
                  <td className="py-2 pr-3 font-mono">{widgetId}</td>
                  <td className="py-2 text-right">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">By privacy class</h4>
        <div className="space-y-2" data-test="omnipanel-privacy-drop-by-class">
          {classRows.map(([privacyClass, count]) => (
            <div key={privacyClass} className="grid grid-cols-[minmax(0,1fr)_5rem] gap-3 items-center">
              <div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <code>{privacyClass}</code>
                  <span>{count}</span>
                </div>
                <div className="mt-1 h-2 rounded bg-black/20 overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-m5)]"
                    style={{ width: `${Math.max(6, (count / maxClassCount) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-right text-xs text-[var(--text-secondary)]">
                {Math.round((count / Math.max(1, aggregate.total)) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
