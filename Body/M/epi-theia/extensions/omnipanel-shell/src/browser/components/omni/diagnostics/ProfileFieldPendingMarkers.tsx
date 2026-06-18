import type { PendingProfileFieldMarker } from './diagnosticsTypes';

export interface ProfileFieldPendingMarkersProps {
  readonly markers: readonly PendingProfileFieldMarker[];
}

export function ProfileFieldPendingMarkers({ markers }: ProfileFieldPendingMarkersProps) {
  return (
    <section className="space-y-2" data-test="profile-field-pending-markers">
      <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Profile field pending markers</h4>
      {markers.length === 0 ? (
        <p className="text-xs text-[var(--text-tertiary)]" data-test="profile-field-pending-empty">
          All declared MathemeHarmonicProfile fields are ready.
        </p>
      ) : (
        <div className="overflow-auto rounded border border-[var(--border-subtle)]">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="bg-white/5 text-[10px] uppercase text-[var(--text-tertiary)]">
              <tr>
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Gating tranche</th>
                <th className="px-3 py-2">State</th>
              </tr>
            </thead>
            <tbody>
              {markers.map(marker => (
                <tr key={`${marker.fieldName}-${marker.gatingTranche}`} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2 font-mono">{marker.fieldName}</td>
                  <td className="px-3 py-2">{marker.gatingTranche}</td>
                  <td className="px-3 py-2">{marker.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

