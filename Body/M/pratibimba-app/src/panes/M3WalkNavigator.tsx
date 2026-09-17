/**
 * Coordinate: M' M3' (9-walk traversal navigator — Track 24.T24.4)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier surface for the 9 SEQUENTIAL traversal walks.
 * Actualises: `M3WalkNavigator` — 9 horizontal walk-lanes (name + stepCount)
 *   sourced ONLY from the tested kernel-constant mirror `m3WalkTypes.ts`
 *   (verbatim from `portal-core/src/types.rs#WalkType`). These 9 walks are
 *   SEQUENTIAL traversal paths, DISTINCT from the 16 simultaneous lens
 *   apertures (24.3) — the two are never conflated. This is a
 *   spec-ahead-integration tranche: the live per-lane `currentStep` binds the
 *   Wave-B profile field `cosmicClock.walks` (WC-M3-SA-4), which has not
 *   landed, so currentStep is HONEST-PENDING — a bridge-readiness badge keyed
 *   to `cosmicClock.walks` plus a per-lane `pending-profile-field` provenance
 *   badge, NEVER a fabricated/zero/random step. Advance dispatches through the
 *   existing `M3WalkNavigationService` (`s3.world_clock.walk.advance`, itself
 *   Wave-B WC-M3-SA-6 / unimplemented) — the UI surfaces the unavailable
 *   dispatch HONESTLY and never shows a fake "advanced" success.
 * Public surface: M3WalkNavigator, M3WalkNavigatorProps,
 *   COSMIC_CLOCK_WALKS_BINDING.
 * Does NOT own: the walk enumeration (m3WalkTypes.ts — kernel mirror), the
 *   advance transport (services/m3/M3WalkNavigationService), the profile clock
 *   (m3SurfaceContext), the readiness taxonomy (ui/bridgeReadiness).
 * Contract: [[M3'-SPEC]] + rerun [[24-m3-mahamaya-frontend-deep]] 24.4.
 */

import { useMemo, useState } from 'react';
import type { M3WalkDirection } from '../services/m3/M3WalkNavigationService';
import { BridgeReadinessBadge } from '../ui/BridgeReadinessBadge';
import { ProvenanceBadge } from '../ui/primitives';
import { inkBright, inkDim, ringLit, wheelUnlit } from '../ui/tokens';
import { useM3ProfileTick } from './m3SurfaceContext';
import { M3_WALK_TYPES, parseCosmicClockWalkSteps } from './m3WalkTypes';

/** The readiness binding the live per-lane position honestly waits on. */
export const COSMIC_CLOCK_WALKS_BINDING = 'cosmicClock.walks';
/** The precise provenance reason for the absent Wave-B profile field. */
const PENDING_WALKS_FIELD = 'pending-profile-field:cosmicClock.walks';

export interface M3WalkNavigatorProps {
    /**
     * Governed advance dispatch — the existing `M3WalkNavigationService.advance`
     * bound to the live gateway. The navigator NEVER advances locally; it only
     * dispatches and reports the honest outcome.
     */
    readonly onAdvance: (walkId: number, direction: M3WalkDirection) => Promise<unknown>;
}

type AdvancePhase = 'idle' | 'dispatching' | 'unavailable' | 'dispatched';

interface AdvanceStatus {
    readonly phase: AdvancePhase;
    readonly walkId?: number;
    readonly direction?: M3WalkDirection;
    readonly detail?: string;
}

export function M3WalkNavigator({ onAdvance }: M3WalkNavigatorProps) {
    const tick = useM3ProfileTick();
    const liveSteps = useMemo(
        () => parseCosmicClockWalkSteps(tick.payload),
        [tick.payload]
    );
    const [advance, setAdvance] = useState<AdvanceStatus>({ phase: 'idle' });

    const dispatchAdvance = (walkId: number, direction: M3WalkDirection) => {
        setAdvance({ phase: 'dispatching', walkId, direction });
        // Dispatch to the gateway; the renderer never advances locally. Because
        // `s3.world_clock.walk.advance` is not yet implemented, this rejects —
        // and we surface that honestly rather than faking a success.
        void onAdvance(walkId, direction)
            .then(() => setAdvance({ phase: 'dispatched', walkId, direction }))
            .catch(cause =>
                setAdvance({
                    phase: 'unavailable',
                    walkId,
                    direction,
                    detail: cause instanceof Error ? cause.message : String(cause)
                })
            );
    };

    return (
        <section
            className="mext-widget-detail m3-walk-navigator"
            data-testid="m3-walk-navigator"
            data-state={liveSteps === null ? 'live-pending' : 'live'}
        >
            <h3>9-walk traversal navigator</h3>
            <p className="m3-walk-discipline" data-testid="m3-walk-discipline">
                9 SEQUENTIAL traversal-path walks — one active step per walk per
                tick. DISTINCT from the 16 simultaneous lens apertures; the two
                are never conflated. Lane names + step counts are fixed kernel
                constants (portal-core WalkType).
            </p>

            <BridgeReadinessBadge bindingKey={COSMIC_CLOCK_WALKS_BINDING}>
                <div className="m3-walk-lanes" data-testid="m3-walk-lanes">
                    {M3_WALK_TYPES.map(walk => {
                        const step = liveSteps ? liveSteps[walk.id] : null;
                        const pending = step === null;
                        return (
                            <div
                                key={walk.id}
                                className="m3-walk-lane"
                                data-testid={`m3-walk-lane-${walk.id}`}
                                data-walk-label={walk.label}
                                data-step-count={walk.stepCount}
                                data-live-state={pending ? 'pending' : 'live'}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    borderBottom: `1px solid ${wheelUnlit}`,
                                    padding: '2px 0'
                                }}
                            >
                                <span
                                    className="m3-walk-lane-name"
                                    style={{ color: inkBright, minWidth: '7em' }}
                                >
                                    {walk.label}
                                </span>
                                <span
                                    className="m3-walk-lane-steps"
                                    style={{ color: inkDim }}
                                >
                                    {walk.stepCount} steps
                                </span>
                                <span
                                    className="m3-walk-lane-current"
                                    data-testid={`m3-walk-current-step-${walk.id}`}
                                    style={{ color: pending ? inkDim : ringLit }}
                                >
                                    {pending ? (
                                        <>
                                            <ProvenanceBadge
                                                state="pending"
                                                reason={PENDING_WALKS_FIELD}
                                            />
                                            {` step —/${walk.stepCount} · pending`}
                                        </>
                                    ) : (
                                        `step ${step}/${walk.stepCount}`
                                    )}
                                </span>
                                <button
                                    type="button"
                                    className="instrument-toggle m3-walk-advance"
                                    data-testid={`m3-walk-advance-${walk.id}`}
                                    onClick={() => dispatchAdvance(walk.id, 'forward')}
                                >
                                    advance ▸
                                </button>
                            </div>
                        );
                    })}
                </div>
            </BridgeReadinessBadge>

            <p
                className="m3-walk-advance-status"
                data-testid="m3-walk-advance-status"
                data-advance-state={advance.phase}
                data-advance-walk={advance.walkId ?? ''}
            >
                {advance.phase === 'idle'
                    ? 'no advance dispatched'
                    : advance.phase === 'dispatching'
                      ? `dispatching walk ${advance.walkId} ${advance.direction} …`
                      : advance.phase === 'unavailable'
                        ? `advance unavailable — s3.world_clock.walk.advance is not yet implemented (${advance.detail})`
                        : `advance dispatched to gateway; walk ${advance.walkId} position reflects on the next profile tick`}
            </p>
        </section>
    );
}
