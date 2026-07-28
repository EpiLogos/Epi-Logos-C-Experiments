/**
 * Coordinate: M' M4' -> M5' (integrated personal recognition carrier)
 * Residency: Body/M/pratibimba-app/src/engine/PersonalRecognitionEngine.tsx
 * Position (#n): #4 — one personal-face composition across M0 grounding,
 * M4 recognition, and M5 scoring.
 * Actualises: Track 36.T36.5's public-safe recognition handoff, and 29.T29.3's
 * personal 4-5-0 slot-ownership declaration — the root that runs
 * `loadPersonalComposition()` through the real load-time law and reports each
 * slot's owner on this surface.
 * Public surface: PersonalRecognitionEngine, readPersonalRecognition.
 * Does NOT own: virtue-witness computation, quaternion composition, EBM
 * scoring, profile transport, the daily-note editor, or the slot-ownership
 * declaration itself (`composition/personalComposition.ts`) and the boundary
 * law it runs through (`composition/geometricSlotEnforcement.ts`).
 */

import { useMemo } from 'react';
import {
    useCompositionLifecycleEvents,
    useCompositionPentadicTraceEvents
} from '../composition/compositionEvents';
import { buildIntegratedPentadicTraceOverlay } from '../composition/integratedPentadicTrace';
import { useCompositionProfile } from '../composition/compositionProfileContext';
import { ownerOfMountedSlot } from '../composition/compositionLoad';
// 29.T29.3 — the personal composition declares WHO owns each geometric slot
// and runs that through the real load-time law. The five forbidden handle
// classes that law guards are all personal material, so until this call
// existed the M4 protected-local boundary was unreachable on the only path it
// was written for: `PERSONAL_GEOMETRIC_SLOTS` was referenced by its own test
// and by nothing else in the repository.
import { blockedPersonalSlots, loadPersonalComposition } from '../composition/personalComposition';
import { M0VirtueWitnessPanel } from '../panes/M0VirtueWitnessPanel';
import { M5EbmObservatoryPane } from '../panes/M5EbmObservatoryPane';
import { M5RecognitionLayer } from '../panes/M5RecognitionLayer';
import { NowPane } from '../panes/NowPane';
import {
    evaluateCachedProfileIntegratedReadiness,
    formatIntegratedReadiness
} from './integratedReadiness';

type RecordValue = Readonly<Record<string, unknown>>;

export interface PersonalRecognitionReading {
    readonly state: 'ready' | 'pending' | 'blocked';
    readonly sourceBinaryState: string | null;
    readonly codon: string | null;
    readonly lineChangeOperator: number | null;
    readonly qComposedTargetKind: string | null;
    readonly qComposedHandle: string | null;
    readonly qBHandle: string | null;
    readonly qPHandle: string | null;
    readonly checkpointRef: string | null;
}

function objectValue(value: unknown): RecordValue | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as RecordValue)
        : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Reads the one profile tick without deriving or opening any protected body. */
export function readPersonalRecognition(payload: unknown): PersonalRecognitionReading {
    const outer = objectValue(payload);
    const root = objectValue(outer?.harmonicProfile) ?? outer;
    const trace = objectValue(root?.anuttaraPentadicTrace);
    const personalPole = objectValue(root?.personalPole);
    const qComposed = objectValue(personalPole?.qComposedHandle);
    const projection = objectValue(root?.mathemeResonance72Projection);

    const qComposedHandle = stringValue(qComposed?.handle);
    const traceHandle = stringValue(trace?.qComposedHandle);
    // Ported contract: Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts.
    const qBHandle = qComposedHandle === null ? null : `${qComposedHandle}#q_b`;
    const qPHandle = qComposedHandle === null ? null : `${qComposedHandle}#q_p`;
    const checkpointRef =
        stringValue(trace?.learnedPredictorCheckpointRef) ??
        stringValue(projection?.learnedPredictorCheckpointRef);
    const tracePresent = trace !== null;
    const m0WitnessPresent = objectValue(root?.anuttaraWitness) !== null;
    const handlesDisagree =
        qComposedHandle !== null && traceHandle !== null && qComposedHandle !== traceHandle;

    return Object.freeze({
        state: handlesDisagree
            ? 'blocked'
            : tracePresent && m0WitnessPresent && qComposedHandle !== null && checkpointRef !== null
                ? 'ready'
                : 'pending',
        sourceBinaryState: stringValue(trace?.sourceBinaryState),
        codon: stringValue(trace?.codon),
        lineChangeOperator: numberValue(trace?.lineChangeOperator),
        qComposedTargetKind: stringValue(qComposed?.targetKind),
        qComposedHandle,
        qBHandle,
        qPHandle,
        checkpointRef
    });
}

export function PersonalRecognitionEngine() {
    // 29.T29.4 — ONE profile subscription per composition (DR-WC-IP-4). This
    // root previously took its generation off the cached profile while the
    // cosmic root took it from the store; both now read the same snapshot.
    const { profile: cached, generation } = useCompositionProfile();
    useCompositionLifecycleEvents('jiva-siva.integrated', generation);
    // 29.15: the 4-5-0 slot of the shared pentadic-trace envelope, built off the
    // same single profile subscription; its advance event fires on trace-tick
    // change just as the cosmic slot's does.
    const pentadicTraceOverlay = useMemo(
        () => buildIntegratedPentadicTraceOverlay((cached?.profile as Record<string, unknown> | null) ?? null),
        [cached]
    );
    useCompositionPentadicTraceEvents(
        'jiva-siva.integrated',
        pentadicTraceOverlay,
        generation
    );
    const reading = useMemo(() => readPersonalRecognition(cached?.profile ?? null), [cached]);
    // Slot ownership is a property of the DECLARATION, not of any frame, so it
    // is resolved once rather than per tick.
    const compositionLoadResult = useMemo(() => loadPersonalComposition(), []);
    const integratedReadiness = useMemo(
        () => evaluateCachedProfileIntegratedReadiness(cached),
        [cached]
    );

    return (
        <section
            className="personal-recognition-engine"
            data-testid="personal-recognition-engine"
            data-state={reading.state}
            data-generation={generation ?? 'none'}
            // Ownership rides data attributes rather than rendered chrome: this
            // surface sits inside the `composition-4-5-0-personal.png` baseline,
            // and `visibility: hidden` preserves its layout box, so any added
            // text would still move the capture. Same idiom as CosmicEngine.
            data-composition-mounted={compositionLoadResult.ok ? 'true' : 'false'}
            data-left-composition-owner={ownerOfMountedSlot(compositionLoadResult, 'left-composition')}
            data-center-composition-owner={ownerOfMountedSlot(compositionLoadResult, 'center-composition')}
            data-right-composition-owner={ownerOfMountedSlot(compositionLoadResult, 'right-composition')}
            data-grounding-owner={ownerOfMountedSlot(compositionLoadResult, 'grounding')}
            data-composition-ambient-owner={ownerOfMountedSlot(compositionLoadResult, 'composition-ambient')}
            data-composition-status-owner={ownerOfMountedSlot(compositionLoadResult, 'composition-status')}
            data-composition-blocked-slots={blockedPersonalSlots().join(',')}
            data-composition-rejection={
                compositionLoadResult.ok ? '' : compositionLoadResult.rejection.rejections[0].reason
            }
        >
            <header className="personal-recognition-header">
                <div>
                    <h2>Recognition</h2>
                    <p>M0 grounds the hinge; M4 carries the protected recognition; M5 scores it.</p>
                </div>
                <span data-testid="personal-recognition-state" data-state={reading.state}>
                    {reading.state}
                </span>
                <span
                    data-testid="personal-recognition-integrated-readiness"
                    data-state={integratedReadiness.state}
                    data-blockers={integratedReadiness.blockerIds.join(',')}
                    data-conditional={integratedReadiness.conditionalPending.map(marker => marker.marker).join(',')}
                    title="Shared Wave-A readiness from the live cached kernel profile"
                >
                    {formatIntegratedReadiness(integratedReadiness)}
                </span>
            </header>

            <div className="personal-recognition-legs">
                <div className="personal-recognition-leg" data-testid="personal-recognition-m0-ground">
                    <h3>M0 ground</h3>
                    <p>
                        0/1 substrate:{' '}
                        <strong data-testid="personal-recognition-substrate">
                            {reading.sourceBinaryState ?? 'pending'}
                        </strong>
                    </p>
                    <M0VirtueWitnessPanel />
                </div>

                <div
                    className="personal-recognition-leg"
                    data-testid="personal-recognition-m4-handoff"
                    data-state={reading.qComposedHandle === null ? 'pending' : 'ready'}
                >
                    <h3>M4 recognition</h3>
                    <p>
                        codon{' '}
                        <strong data-testid="personal-recognition-codon">
                            {reading.codon ?? 'pending'}
                        </strong>{' '}
                        · line change{' '}
                        <strong data-testid="personal-recognition-line-change">
                            {reading.lineChangeOperator ?? 'pending'}
                        </strong>
                    </p>
                    {reading.qComposedHandle === null ? (
                        <p>protected composed handle pending</p>
                    ) : (
                        <span
                            data-testid="personal-recognition-q-composed"
                            title={reading.qComposedHandle}
                        >
                            {reading.qComposedTargetKind ?? 'QComposed'} handle attached
                        </span>
                    )}
                    {reading.qBHandle !== null && reading.qPHandle !== null ? (
                        <p>
                            <span data-testid="personal-recognition-q-b" title={reading.qBHandle}>
                                Bimba handle
                            </span>{' '}
                            ·{' '}
                            <span data-testid="personal-recognition-q-p" title={reading.qPHandle}>
                                Pratibimba handle
                            </span>
                        </p>
                    ) : null}
                </div>

                <div className="personal-recognition-leg" data-testid="personal-recognition-m5-score">
                    <h3>M5 score</h3>
                    <p>
                        checkpoint:{' '}
                        <span data-testid="personal-recognition-checkpoint">
                            {reading.checkpointRef ?? 'pending'}
                        </span>
                    </p>
                    <M5RecognitionLayer />
                    {/* Personal scale: the EBM scoring face composes here, but the
                        canonical-scale operational-capacity lanes (26.2) stay in the
                        standalone observatory only (surface-composition §1). */}
                    <M5EbmObservatoryPane hostCapacityLanes={false} />
                </div>
            </div>

            <div className="personal-recognition-now">
                <NowPane />
            </div>
        </section>
    );
}
