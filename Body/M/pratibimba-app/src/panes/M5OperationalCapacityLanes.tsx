/**
 * Coordinate: M' M5' (operational-capacity lanes — Track 26.T26.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M5' standalone-observatory operational-capacity affordance
 * Actualises: the six-capacity affordance the M5' EBM observatory hosts (26.2).
 *   All six lanes render at once (NOT tabs, per DR-TS-4 / DR-MP-1); each shows
 *   the honest per-capacity dispatch activity read from `s5'.improve.history`
 *   (dispatch count, human-gate count, newest updated_at) and a click-through
 *   that opens the Pi-monitor (ACR, `agentic-control-room`) scoped to the lane's
 *   subsystem vak coordinate for dispatch-trace context (12.5). Re-reads on the
 *   profile-tick advance — one clock only, no local timer (15.6).
 *
 *   26.T26.6 adds the SECOND click-through this surface always implied: the
 *   `capacity:<id>` cross-layout route into the Autoresearch pane's per-capacity
 *   filter. The intent ledger has aliased that prefix onto `autoresearch-pane`
 *   since 31.T31.10 and `App.tsx` has decoded it into `requestedCapacity` since
 *   28.T28.10 — but no surface in the carrier ever dispatched one, so the alias
 *   and the decode were a route with no traffic. This is the traffic.
 * Public surface: M5OperationalCapacityLanes.
 * Does NOT own: the improvement law (S5 substrate), the lane derivation
 *   (m5CapacityLanes.ts), the autoresearch candidate/promotion surface
 *   (AutoresearchPane.tsx), the EBM scoring (m5Ebm.ts), or the intent target
 *   ledger (crossLayoutIntent.ts).
 * Contract: [[M5'-SPEC]] §M5'.4 / [[CHROME-CONTRACT]] §5
 *
 * Honesty (26.2): the spec's `s5'.epii.runtimeContext` capacity fields and a
 * per-capacity `MathemeHarmonicProfileBoundary` are frozen-Theia producers that
 * were never wired — `s5'.improve.history` is the ONLY real per-capacity signal.
 * The harmonic boundary is therefore surfaced as substrate-pending, never
 * synthesised.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { commands } from '../commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND, IntentPrivacyClass } from '../commands/crossLayoutIntent';
import { useSessionStore } from '../state/stores';
import { useProfileTick } from '../state/useProfileTick';
import { BridgeReadinessBadge } from '../ui/BridgeReadinessBadge';
import {
    AutoresearchCandidate,
    capacityIntentContributionId,
    IMPROVE_HISTORY_METHOD,
    parseImproveHistory
} from './autoresearchModel';
import { buildCapacityLanes, CapacityLane } from './m5CapacityLanes';

export interface M5OperationalCapacityLanesProps {
    /** Test/fixture injection: render these candidates instead of hitting the gateway. */
    readonly fixture?: readonly AutoresearchCandidate[];
    /** Override the default Pi-monitor cross-layout dispatch (used by tests/hosts). */
    readonly onOpenPiMonitor?: (lane: CapacityLane) => void;
    /** Override the default capacity-scoped Autoresearch dispatch (26.T26.6). */
    readonly onOpenAutoresearch?: (lane: CapacityLane) => void;
}

export function M5OperationalCapacityLanes({
    fixture,
    onOpenPiMonitor,
    onOpenAutoresearch
}: M5OperationalCapacityLanesProps) {
    const tick = useProfileTick();
    const dayNow = useSessionStore(state => state.dayNow);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const sessionPrivacy = useSessionStore(state => state.privacyClass);
    const [candidates, setCandidates] = useState<readonly AutoresearchCandidate[] | null>(fixture ?? null);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(() => {
        if (fixture) {
            return;
        }
        if (!gatewayReady()) {
            setError('Gateway disconnected. Operational-capacity activity was not loaded.');
            return;
        }
        gateway()
            .invoke(IMPROVE_HISTORY_METHOD, { limit: 100 })
            .then(receipt => {
                setCandidates(parseImproveHistory(receipt.artifact));
                setError(null);
            })
            .catch(err => setError(err instanceof Error ? err.message : String(err)));
    }, [fixture]);

    useEffect(refresh, [refresh, tick.generation]);

    const lanes = useMemo(() => buildCapacityLanes(candidates ?? []), [candidates]);

    const dispatchLaneIntent = (lane: CapacityLane, requestedContributionId: string) => {
        const privacyClass: IntentPrivacyClass | null =
            sessionPrivacy === 'public' || sessionPrivacy === 'protected' || sessionPrivacy === 'private'
                ? sessionPrivacy
                : null;
        void commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
            coordinate: lane.coordinate,
            artifactUri: null,
            reviewId: null,
            dayNow,
            sessionKey,
            profileGeneration: tick.generation,
            privacyClass,
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId
        });
    };

    const openPiMonitor = (lane: CapacityLane) => {
        if (onOpenPiMonitor) {
            onOpenPiMonitor(lane);
            return;
        }
        dispatchLaneIntent(lane, 'agentic-control-room');
    };

    /**
     * 26.T26.6 — the capacity-scoped entry into the Autoresearch pane. The
     * `capacity:<id>` alias and its decode were both already live; this is the
     * dispatch that had never existed, so the pane's per-capacity filter now has
     * a real route in as well as a dropdown.
     */
    const openAutoresearch = (lane: CapacityLane) => {
        if (onOpenAutoresearch) {
            onOpenAutoresearch(lane);
            return;
        }
        dispatchLaneIntent(lane, capacityIntentContributionId(lane.id));
    };

    return (
        <section className="m5-capacity-lanes" data-testid="m5-capacity-lanes">
            <header className="m5-capacity-lanes-head">
                <h4>Operational capacities</h4>
                <span>
                    M5′ scores across six operational capacities. Activity is the real{' '}
                    <code>s5′.improve.history</code> dispatch trace per capacity; open the Pi-monitor for the
                    dispatch genealogy behind a lane.
                </span>
                <BridgeReadinessBadge bindingKey="s5'.improve.history" />
            </header>

            {error ? (
                <p className="pane-message m5-capacity-error" data-testid="m5-capacity-error">
                    {error}
                </p>
            ) : null}

            <p
                className="m5-capacity-harmonic-pending"
                data-testid="m5-capacity-harmonic-pending"
                data-reason="no-per-capacity-harmonic-producer"
            >
                Capacity-scoped harmonic boundary: not projected by the substrate — no per-capacity
                MathemeHarmonicProfile producer is wired (only the global kernel-tick profile exists). Pending
                Wave-B; nothing is synthesised here.
            </p>

            <div className="m5-capacity-lane-grid">
                {lanes.map(lane => (
                    <article
                        className="m5-capacity-lane"
                        key={lane.id}
                        data-testid={`m5-capacity-lane-${lane.id}`}
                        data-coordinate={lane.coordinate}
                    >
                        <div className="m5-capacity-lane-head">
                            <strong>{lane.label}</strong>
                            <code>{lane.coordinate}</code>
                        </div>
                        <div className="m5-capacity-lane-metrics">
                            <span>
                                {lane.dispatchCount} {lane.dispatchCount === 1 ? 'dispatch' : 'dispatches'}
                            </span>
                            <span>
                                {lane.humanGateCount} {lane.humanGateCount === 1 ? 'human gate' : 'human gates'}
                            </span>
                            <span data-testid={`m5-capacity-last-activity-${lane.id}`}>
                                {lane.lastActivityMs === null
                                    ? 'no activity yet'
                                    : `last activity @ ${lane.lastActivityMs}`}
                            </span>
                        </div>
                        <div className="m5-capacity-lane-actions">
                            <button
                                type="button"
                                className="m5-capacity-open-pi-monitor"
                                data-testid={`m5-capacity-open-pi-monitor-${lane.id}`}
                                onClick={() => openPiMonitor(lane)}
                            >
                                Open in Pi-monitor
                            </button>
                            <button
                                type="button"
                                className="m5-capacity-open-autoresearch"
                                data-testid={`m5-capacity-open-autoresearch-${lane.id}`}
                                onClick={() => openAutoresearch(lane)}
                            >
                                Open in Autoresearch
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
