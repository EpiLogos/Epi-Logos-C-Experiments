/**
 * Coordinate: M' `/` membrane (Gateway tab — kernel-bridge readiness chip — 27.T27.7)
 * Residency: Body/M/pratibimba-app/src/panes/omni/gateway
 * Position (#n): the header traffic-light for the Gateway tab; cross-link to
 *   the ide-shell `bridge-gate.tsx` readiness (27.7 cross-link).
 * Actualises: a small chip that reads the SAME per-binding readiness source as
 *   every other carrier readiness site (`useReadinessStore` → the shared
 *   nine-id taxonomy) and surfaces the WORST binding's visual tier. When the
 *   bridge has reported nothing, the honest state is `bridge_unavailable`
 *   (the bridge said nothing, which is never "ready"). Clicking it activates
 *   the Diagnostics tab at its kernel-bridge sub-section (spec cross-link),
 *   unless an `onActivate` override is supplied so the controller can reuse it.
 * Public surface: KernelBridgeReadinessChip.
 * Does NOT own: the taxonomy law (ui/bridgeReadiness), the readiness transport
 *   (state/readinessStore ← gateway `readiness` event), or the tab manifest.
 */

import {
    readinessTier,
    type BridgeReadinessId,
    type BridgeReadinessTier,
    type ReportedBinding
} from '../../../ui/bridgeReadiness';
import { useReadinessStore } from '../../../state/readinessStore';
import { useOmniPanelSessionStore } from '../omnipanelSessionState';

const TIER_RANK: Readonly<Record<BridgeReadinessTier, number>> = { green: 0, amber: 1, red: 2 };

interface WorstBinding {
    readonly bindingKey: string | null;
    readonly readinessId: BridgeReadinessId;
    readonly reason?: string;
}

/** Pick the worst-tier reported binding. An empty map is honestly
 *  `bridge_unavailable` — the bridge has reported on nothing. */
export function worstReadinessBinding(bindings: Readonly<Record<string, ReportedBinding>>): WorstBinding {
    let worst: WorstBinding | null = null;
    let worstRank = -1;
    for (const [bindingKey, reported] of Object.entries(bindings)) {
        const rank = TIER_RANK[readinessTier(reported.state)];
        if (rank > worstRank) {
            worstRank = rank;
            worst = { bindingKey, readinessId: reported.state, reason: reported.reason };
        }
    }
    return worst ?? { bindingKey: null, readinessId: 'bridge_unavailable' };
}

export function KernelBridgeReadinessChip({ onActivate }: { readonly onActivate?: () => void }) {
    const bindings = useReadinessStore(state => state.bindings);
    const selectTab = useOmniPanelSessionStore(state => state.selectTab);
    const patchTab = useOmniPanelSessionStore(state => state.patchTab);

    const worst = worstReadinessBinding(bindings);
    const tier = readinessTier(worst.readinessId);
    const title = worst.reason ?? worst.readinessId.replace(/_/g, ' ');

    const activate = () => {
        if (onActivate) {
            onActivate();
            return;
        }
        selectTab('diagnostics');
        patchTab('diagnostics', { activeSubSection: 'kernel-bridge' });
    };

    return (
        <button
            type="button"
            className={`kernel-bridge-readiness-chip kernel-bridge-readiness-chip-${tier}`}
            data-testid="kernel-bridge-readiness-chip"
            data-readiness={worst.readinessId}
            data-tier={tier}
            title={title}
            aria-label={`kernel bridge readiness: ${worst.readinessId}`}
            onClick={activate}
        >
            <span className="kernel-bridge-readiness-dot" aria-hidden="true" />
            <span className="kernel-bridge-readiness-label">{worst.readinessId}</span>
        </button>
    );
}
