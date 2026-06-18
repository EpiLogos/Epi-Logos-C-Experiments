import * as React from 'react';
import type { MathemeHarmonicProfileBoundary } from '../../../m-extension-runtime/lib/common/profile';
import {
    PARENT_ATTRIBUTION,
    THIRD_SPANDA_COMPOSITION
} from '../common/third-spanda-composition';
import type { K2SurfaceHandle } from './cosmic-engine-composition';

export const MATHEME_137_PARENT_ATTRIBUTION = PARENT_ATTRIBUTION;

const KAPREKAR_PEDAGOGY_SEED_PATH = "Idea/Bimba/Seeds/M/M1'/m1-prime-kaprekar-pedagogy.md";
const ADDITIVE_137_EVENT = 'Additive137';
const KAPREKAR_PEDAGOGY_EVENT = 'KaprekarPedagogyHit';
const TRANSLATION_RULE_BRIDGE_LABEL = '9_{M_2} = 8_{M_3} + 1_{M_1}';
const TRANSLATION_RULE_BRIDGE_LABEL_NORMALIZED = '9_M2 = 8_M3 + 1_M1';

export interface Matheme137OverlayProps {
    readonly surfaceHandle: K2SurfaceHandle | null;
    readonly profile?: MathemeHarmonicProfileBoundary | null;
    readonly proofMode?: boolean;
}

export interface Matheme137OverlayState {
    readonly additive137PulseActive: boolean;
    readonly kaprekarChipActive: boolean;
    readonly skeletonEvents: readonly string[];
}

export function deriveMatheme137OverlayState(
    profile: MathemeHarmonicProfileBoundary | null | undefined
): Matheme137OverlayState {
    const skeletonEvents = readSkeletonEvents(profile);
    return Object.freeze({
        additive137PulseActive: skeletonEvents.includes(ADDITIVE_137_EVENT),
        kaprekarChipActive: skeletonEvents.includes(KAPREKAR_PEDAGOGY_EVENT),
        skeletonEvents
    });
}

export const Matheme137Overlay: React.FC<Matheme137OverlayProps> = ({
    surfaceHandle,
    profile = null,
    proofMode = false
}) => {
    const busState = deriveMatheme137OverlayState(profile);
    const [equationPulseActive, setEquationPulseActive] = React.useState(busState.additive137PulseActive);
    const [kaprekarChipActive, setKaprekarChipActive] = React.useState(busState.kaprekarChipActive);

    React.useEffect(() => {
        if (!busState.additive137PulseActive) {
            return undefined;
        }
        setEquationPulseActive(true);
        const timeout = setTimeout(() => setEquationPulseActive(false), 400);
        return () => clearTimeout(timeout);
    }, [profile?.generation, busState.additive137PulseActive]);

    React.useEffect(() => {
        if (!busState.kaprekarChipActive) {
            return undefined;
        }
        setKaprekarChipActive(true);
        const timeout = setTimeout(() => setKaprekarChipActive(false), 3000);
        return () => clearTimeout(timeout);
    }, [profile?.generation, busState.kaprekarChipActive]);

    return (
        <aside
            className="matheme-137-overlay"
            data-test="matheme-137-overlay"
            data-surface-handle={surfaceHandle?.handle ?? 'pending-k2-surface'}
            data-renderer-directive={surfaceHandle?.renderer ?? 'played-torus'}
            data-parent-attribution={MATHEME_137_PARENT_ATTRIBUTION}
            data-equation-pulse={equationPulseActive ? 'true' : 'false'}
        >
            <div className="matheme-137-equation" data-test="matheme-137-equation">
                <span className="matheme-137-equation-text">64 + 72 + 1 = 137</span>
            </div>

            <div className="matheme-137-region matheme-137-region-64" data-test="matheme-137-side-64">
                <span
                    className="matheme-137-label"
                    title="137 = 128 + 8 + 1"
                    data-hover-canonical-form="137 = 128 + 8 + 1"
                >
                    64 = M3 codons
                </span>
            </div>

            <div className="matheme-137-region matheme-137-region-72" data-test="matheme-137-side-72">
                <span
                    className="matheme-137-label"
                    title="137 = 64 + 2(36) + 1"
                    data-hover-canonical-form="137 = 64 + 2(36) + 1"
                >
                    72 = M2 invariant
                </span>
            </div>

            <div
                className="matheme-137-bridge"
                data-test="matheme-137-bridge"
                data-bridge-label-normalized={TRANSLATION_RULE_BRIDGE_LABEL_NORMALIZED}
            >
                <span className="matheme-137-parent-bead" data-test="matheme-137-parent-bead">
                    +1
                </span>
                <span className="matheme-137-bridge-label">
                    {TRANSLATION_RULE_BRIDGE_LABEL}
                </span>
            </div>

            <div className="matheme-137-hover-forms" data-test="matheme-137-hover-forms">
                <span title="137 = 64 + 72 + 1" data-hover-canonical-form="137 = 64 + 72 + 1">
                    137 = 64 + 72 + 1
                </span>
                <span title="137 = (2^7 - 1) + 1 + 9" data-hover-canonical-form="137 = (2^7 - 1) + 1 + 9">
                    137 = (2^7 - 1) + 1 + 9
                </span>
            </div>

            <div className="matheme-137-orbit-field" data-test="matheme-137-orbit-field">
                {THIRD_SPANDA_COMPOSITION.spine789.map(node => (
                    <span
                        key={node.numeral}
                        className={`matheme-137-orbit matheme-137-orbit-${node.numeral}`}
                        data-test={`matheme-137-orbit-${node.numeral}`}
                        data-spine-numeral={node.numeral}
                        data-spine-role={node.role}
                        data-profile-event-active={busState.additive137PulseActive ? 'true' : 'false'}
                    >
                        {node.numeral} = {node.role}
                    </span>
                ))}
            </div>

            {proofMode ? (
                <span className="matheme-137-mersenne-proof" data-test="matheme-137-mersenne-proof">
                    127 = 2^7 - 1 = M_7
                </span>
            ) : null}

            {kaprekarChipActive ? (
                <a
                    className="matheme-137-kaprekar-chip"
                    data-test="kaprekar-6174-chip"
                    href={KAPREKAR_PEDAGOGY_SEED_PATH}
                >
                    Kaprekar 6174
                </a>
            ) : null}
        </aside>
    );
};

function readSkeletonEvents(
    profile: MathemeHarmonicProfileBoundary | null | undefined
): readonly string[] {
    const rawEvents =
        profile?.payload['m1_2_skeleton_events_fired'] ??
        profile?.payload['m1SkeletonEventsFired'] ??
        profile?.payload['skeletonEventsFired'];
    if (!Array.isArray(rawEvents)) {
        return Object.freeze([]);
    }
    return Object.freeze(rawEvents.map(readSkeletonEventName).filter((event): event is string => Boolean(event)));
}

function readSkeletonEventName(event: unknown): string | null {
    if (typeof event === 'string' && event.length > 0) {
        return event;
    }
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
        return null;
    }
    const record = event as Readonly<Record<string, unknown>>;
    const name = record['name'] ?? record['event'] ?? record['kind'] ?? record['type'];
    return typeof name === 'string' && name.length > 0 ? name : null;
}
