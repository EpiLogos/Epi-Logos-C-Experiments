/**
 * Coordinate: M' `/` membrane (kernel-bridge readiness summary — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/diagnostics
 * Position (#n): the Diagnostics fold's readiness ledger (27.8; 07-t0 taxonomy).
 * Actualises: the spec's <KernelBridgeReadinessSummary /> — groups the live
 *   per-binding readiness ledger (useReadinessStore) by its nine-state class,
 *   one row per class PRESENT with a count and the binding keys, ordered by the
 *   canonical S0 taxonomy order. Renders only what the bridge reported; an
 *   empty ledger is stated honestly, never back-filled with "ready".
 * Public surface: KernelBridgeReadinessSummary, groupReadinessBindings.
 * Does NOT own: the taxonomy law (ui/bridgeReadiness), the readiness transport
 *   (gateway `readiness` event → readinessStore).
 */

import { useMemo } from 'react';
import { useReadinessStore } from '../../../state/readinessStore';
import {
    BRIDGE_READINESS_IDS,
    readinessTier,
    type BridgeReadinessId,
    type ReportedBinding
} from '../../../ui/bridgeReadiness';

export interface ReadinessClassGroup {
    readonly id: BridgeReadinessId;
    readonly count: number;
    readonly bindingKeys: readonly string[];
}

/** Group bindings by readiness class, in canonical S0 order, classes absent
 *  from the ledger omitted. Pure so the Diagnostics test can assert it. */
export function groupReadinessBindings(
    bindings: Readonly<Record<string, ReportedBinding>>
): readonly ReadinessClassGroup[] {
    const byClass = new Map<BridgeReadinessId, string[]>();
    for (const [key, binding] of Object.entries(bindings)) {
        const keys = byClass.get(binding.state) ?? [];
        keys.push(key);
        byClass.set(binding.state, keys);
    }
    return BRIDGE_READINESS_IDS.filter(id => byClass.has(id)).map(id => {
        const bindingKeys = byClass.get(id) ?? [];
        return { id, count: bindingKeys.length, bindingKeys };
    });
}

export function KernelBridgeReadinessSummary() {
    const bindings = useReadinessStore(s => s.bindings);
    const groups = useMemo(() => groupReadinessBindings(bindings), [bindings]);

    return (
        <section className="kernel-bridge-readiness-summary" data-testid="kernel-bridge-readiness-summary">
            <h4 className="diagnostics-section-title">Kernel-bridge readiness</h4>
            {groups.length === 0 ? (
                <p className="diagnostics-empty" data-testid="kernel-bridge-readiness-empty">
                    no readiness bindings reported
                </p>
            ) : (
                <ul className="kernel-bridge-readiness-rows" role="list">
                    {groups.map(group => (
                        <li
                            key={group.id}
                            className={`readiness-class-row readiness-tier-${readinessTier(group.id)}`}
                            data-testid={`readiness-class-${group.id}`}
                            data-tier={readinessTier(group.id)}
                        >
                            <span className="readiness-class-id">{group.id}</span>
                            <span className="readiness-class-count" data-testid={`readiness-count-${group.id}`}>
                                {group.count}
                            </span>
                            <span className="readiness-class-keys">{group.bindingKeys.join(', ')}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
