// 26.11 — m5.epii.recognitionLayer composition slot (spec-ahead-integration).
//
// Per Track 15 §personal-side the editor area composes three slots INSIDE one
// editor-area composition (NOT three side-by-side panels):
//
//   journal (M4, left) · personal cymatic field (M0, center) · recognition
//   layer (this slot, M5/Mahamaya, right).
//
// This file owns ONLY the third slot — the Mahamaya recognition layer. It is a
// composition member, not a juxtaposed widget: COMPOSITION_MODE pins it to the
// editor-area-inline contract from 15.4. The ide-shell composer is responsible
// for mounting it inside the shared editor-area surface.
//
// PRIVACY DISCIPLINE (same law as jiva-siva-panes.tsx): this file MUST NOT hold
// a local M4 personal field table, identity-quaternion body, Nara journal
// sample, or Graphiti episode body. The quaternion *inputs* (q_Nara handle,
// q_cosmic(t), q_activity(t)) and the CanonRecognitionAnchor arrive as
// backend-supplied, public-safe payload fields. The slot only composes them
// per `alpha_quaternionic_integration_across_M_stack.md §6.7` and renders the
// resulting recognition geometry — it never derives the protected body.
//
// Gates 10.M5 (CanonRecognitionAnchor / MathemeHarmonicProfileBoundary). Until
// 10.M5 lands the anchor shape is declared here as a spec-ahead boundary type
// and read defensively from the profile payload.

import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    Disposable,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';

/** Composition slot identifier — third slot of the 4-5-0 editor-area composition. */
export const M5_RECOGNITION_LAYER_SLOT_ID = 'pratibimba.m5-epii.recognitionLayer';

/**
 * Composition contract (15.4): the recognition layer renders INSIDE the
 * editor-area composition, never side-by-side. The ide-shell composer reads
 * this mode to mount the slot as a composition member; a juxtaposition test
 * asserts the value is NOT a free-floating panel mode.
 */
export const COMPOSITION_MODE = 'editor-area-inline' as const;
export type CompositionMode = typeof COMPOSITION_MODE;

/** Cross-link targets for the Möbius return close-path (26.13 + 19.7). */
export const MOBIUS_RETURN_CLOSE_PATH_COMMAND = 'pratibimba.m5-epii.mobiusReturn.compose';
export const MOBIUS_RETURN_CROSS_LINKS = Object.freeze(['26.13', '19.7'] as const);

// ---------------------------------------------------------------------------
// Quaternion algebra — Q_composed per alpha_quaternionic_integration §6.7
// ---------------------------------------------------------------------------
//
// Canonical component order is [w=EARTH, x=FIRE, y=WATER, z=AIR] (see project
// PLANET/primitive vocabulary canon). Composition is a Hamilton product chain
// then a unit normalisation:
//
//     Q_composed = normalize(q_Nara · q_cosmic(t) · q_activity(t))

export type Quaternion = readonly [number, number, number, number];

export const IDENTITY_QUATERNION: Quaternion = Object.freeze([1, 0, 0, 0]) as Quaternion;

/** Hamilton product a · b. */
export function quaternionMultiply(a: Quaternion, b: Quaternion): Quaternion {
    const [aw, ax, ay, az] = a;
    const [bw, bx, by, bz] = b;
    return [
        aw * bw - ax * bx - ay * by - az * bz,
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw
    ];
}

/** Unit-normalise a quaternion; the zero quaternion collapses to identity. */
export function quaternionNormalize(q: Quaternion): Quaternion {
    const mag = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    if (mag === 0 || !Number.isFinite(mag)) {
        return IDENTITY_QUATERNION;
    }
    return [q[0] / mag, q[1] / mag, q[2] / mag, q[3] / mag];
}

/**
 * Q_composed = normalize(q_Nara · q_cosmic(t) · q_activity(t)) — §6.7.
 * Missing inputs fall back to the identity quaternion so the chain stays
 * well-defined (a missing factor contributes no rotation).
 */
export function composeQComposed(
    qNara: Quaternion | null,
    qCosmic: Quaternion | null,
    qActivity: Quaternion | null
): Quaternion {
    const product = quaternionMultiply(
        quaternionMultiply(qNara ?? IDENTITY_QUATERNION, qCosmic ?? IDENTITY_QUATERNION),
        qActivity ?? IDENTITY_QUATERNION
    );
    return quaternionNormalize(product);
}

/**
 * Recognition strength — magnitude of the resonance match between Q_composed
 * and the current bimba coordinate's targetResonanceVector. Both are unit
 * quaternions, so |dot| is the cosine of the half-angle between them, in
 * [0, 1]; |·| folds the q ≡ −q double cover so opposite signs read as full
 * recognition (Tat tvam asi — identity, not anti-identity).
 */
export function recognitionStrength(
    qComposed: Quaternion,
    targetResonanceVector: Quaternion | null
): number {
    if (!targetResonanceVector) {
        return 0;
    }
    const a = quaternionNormalize(qComposed);
    const b = quaternionNormalize(targetResonanceVector);
    const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    const strength = Math.abs(dot);
    return strength > 1 ? 1 : strength;
}

// ---------------------------------------------------------------------------
// Klein V₄ square — active lens/square indicator (26.1)
// ---------------------------------------------------------------------------
//
// The Klein four-group V₄ = {I, a, b, ab}: the four lens-squares the active
// session can occupy. The current square arrives from the profile payload.

export type KleinV4Square = 'I' | 'a' | 'b' | 'ab';

export const KLEIN_V4_SQUARES: readonly KleinV4Square[] = Object.freeze(['I', 'a', 'b', 'ab']);

export const KLEIN_V4_SQUARE_LABELS: Readonly<Record<KleinV4Square, string>> = Object.freeze({
    I: 'Identity (e)',
    a: 'Reflection a',
    b: 'Reflection b',
    ab: 'Diagonal a·b'
});

export function asKleinV4Square(value: unknown): KleinV4Square | null {
    return typeof value === 'string' && (KLEIN_V4_SQUARES as readonly string[]).includes(value)
        ? (value as KleinV4Square)
        : null;
}

// ---------------------------------------------------------------------------
// CanonRecognitionAnchor — spec-ahead boundary from 10.M5
// ---------------------------------------------------------------------------
//
// Until 10.M5 publishes the canonical shape on MathemeHarmonicProfileBoundary,
// this is the boundary the slot consumes. It is a public-safe recognition
// anchor: the canonical bimba coordinate the personal field is being matched
// against, plus that coordinate's target resonance vector and its personal-
// scale M3 codon projection (codon_rotation_projection scoped to Q_composed).

export interface CanonRecognitionAnchor {
    /** Canonical bimba coordinate currently in focus (e.g. "M3-2"). */
    readonly coordinate: string;
    /** The coordinate's target resonance vector (unit quaternion). */
    readonly targetResonanceVector: Quaternion;
    /** Personal-scale M3 codon projection scoped to Q_composed (display handle). */
    readonly personalCodonProjection: string | null;
    /** Human-facing label for the canonical ring (Tat tvam asi superimposition). */
    readonly canonRingLabel: string | null;
}

// ---------------------------------------------------------------------------
// Möbius return readiness — session-close conditions (cross-link 26.13 + 19.7)
// ---------------------------------------------------------------------------

export interface SessionCloseConditions {
    readonly reflectionComplete: boolean;
    readonly sessionCloseRequested: boolean;
    readonly wisdomDeltaPending: boolean;
}

export interface MobiusReturnReadiness {
    readonly ready: boolean;
    readonly message: string;
    readonly crossLinks: readonly string[];
    readonly closePathCommand: string;
}

/**
 * Möbius return fires its close-path link only when every session-close
 * condition is met. The message composes wisdom_delta (26.13) and threads the
 * close-path to 19.7.
 */
export function evaluateMobiusReturn(conditions: SessionCloseConditions): MobiusReturnReadiness {
    const ready =
        conditions.reflectionComplete &&
        conditions.sessionCloseRequested &&
        conditions.wisdomDeltaPending;
    return {
        ready,
        message: ready
            ? 'Möbius return ready — wisdom_delta composing...'
            : 'Möbius return pending — session-close conditions not yet met.',
        crossLinks: MOBIUS_RETURN_CROSS_LINKS,
        closePathCommand: MOBIUS_RETURN_CLOSE_PATH_COMMAND
    };
}

/** Fire the 26.13 + 19.7 close-path only after session-close readiness lands. */
export function fireMobiusReturnClosePath(
    mobius: MobiusReturnReadiness,
    onClosePath?: (command: string) => void
): boolean {
    if (!mobius.ready) {
        return false;
    }
    onClosePath?.(mobius.closePathCommand);
    return true;
}

// ---------------------------------------------------------------------------
// Payload readers — every value is backend-supplied & public-safe
// ---------------------------------------------------------------------------

function isQuaternionArray(value: unknown): value is [number, number, number, number] {
    return (
        Array.isArray(value) &&
        value.length === 4 &&
        value.every(n => typeof n === 'number' && Number.isFinite(n))
    );
}

export function readQuaternion(
    profile: MathemeHarmonicProfileBoundary | null,
    field: string
): Quaternion | null {
    if (!profile) {
        return null;
    }
    const value = profile.payload[field];
    return isQuaternionArray(value) ? [value[0], value[1], value[2], value[3]] : null;
}

export function readCanonRecognitionAnchor(
    profile: MathemeHarmonicProfileBoundary | null
): CanonRecognitionAnchor | null {
    if (!profile) {
        return null;
    }
    const raw = profile.payload['canon_recognition_anchor'];
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const obj = raw as Record<string, unknown>;
    const coordinate = obj['coordinate'];
    const target = obj['targetResonanceVector'];
    if (typeof coordinate !== 'string' || !isQuaternionArray(target)) {
        return null;
    }
    const codon = obj['personalCodonProjection'];
    const ringLabel = obj['canonRingLabel'];
    return {
        coordinate,
        targetResonanceVector: [target[0], target[1], target[2], target[3]],
        personalCodonProjection: typeof codon === 'string' ? codon : null,
        canonRingLabel: typeof ringLabel === 'string' ? ringLabel : null
    };
}

export function readSessionCloseConditions(
    profile: MathemeHarmonicProfileBoundary | null
): SessionCloseConditions {
    const payload = profile?.payload ?? {};
    const flag = (k: string): boolean => payload[k] === true;
    return {
        reflectionComplete: flag('c_5_reflection_complete'),
        sessionCloseRequested: flag('session_close_requested'),
        wisdomDeltaPending: flag('wisdom_delta_pending')
    };
}

// ---------------------------------------------------------------------------
// Derived view-model — recomputed whenever Q_composed advances
// ---------------------------------------------------------------------------

export interface RecognitionLayerViewModel {
    readonly qComposed: Quaternion;
    readonly anchor: CanonRecognitionAnchor | null;
    readonly strength: number;
    readonly activeSquare: KleinV4Square | null;
    readonly mobius: MobiusReturnReadiness;
}

export function deriveRecognitionViewModel(
    profile: MathemeHarmonicProfileBoundary | null
): RecognitionLayerViewModel {
    const qComposed = composeQComposed(
        readQuaternion(profile, 'q_nara'),
        readQuaternion(profile, 'q_cosmic'),
        readQuaternion(profile, 'q_activity')
    );
    const anchor = readCanonRecognitionAnchor(profile);
    return {
        qComposed,
        anchor,
        strength: recognitionStrength(qComposed, anchor?.targetResonanceVector ?? null),
        activeSquare: asKleinV4Square(profile?.payload['klein_v4_square']),
        mobius: evaluateMobiusReturn(readSessionCloseConditions(profile))
    };
}

// ---------------------------------------------------------------------------
// Presentational components
// ---------------------------------------------------------------------------

const RecognitionStrengthIndicator: React.FC<{ readonly strength: number }> = ({ strength }) => {
    const pct = Math.round(strength * 100);
    return (
        <div className="m5-recognition-strength" data-test="recognition-strength">
            <span className="m5-recognition-strength-label">Recognition strength</span>
            <div className="m5-recognition-strength-meter" role="meter" aria-valuenow={pct}
                aria-valuemin={0} aria-valuemax={100}>
                <div className="m5-recognition-strength-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="m5-recognition-strength-value" data-test="recognition-strength-value">
                {pct}%
            </span>
        </div>
    );
};

/** Tat tvam asi — personal cymatic ring superimposed on the canonical bimba ring (UX §7). */
const TatTvamAsiVisual: React.FC<{
    readonly anchor: CanonRecognitionAnchor | null;
    readonly strength: number;
}> = ({ anchor, strength }) => {
    const overlap = Math.round(strength * 100);
    return (
        <div className="m5-tat-tvam-asi" data-test="tat-tvam-asi">
            <svg viewBox="0 0 100 100" className="m5-tat-tvam-asi-rings" aria-hidden="true">
                {/* canonical bimba ring */}
                <circle cx="50" cy="50" r="38" className="m5-ring-canon" />
                {/* personal cymatic ring — drawn closer to the canon ring as strength rises */}
                <circle cx="50" cy="50" r={38 - strength * 14} className="m5-ring-personal" />
            </svg>
            <div className="m5-tat-tvam-asi-caption">
                <span data-test="tat-tvam-asi-coord">
                    {anchor ? anchor.canonRingLabel ?? anchor.coordinate : '—'}
                </span>
                <span className="m5-tat-tvam-asi-overlap">tat tvam asi · {overlap}% superimposed</span>
            </div>
        </div>
    );
};

const ActiveSquareIndicator: React.FC<{ readonly square: KleinV4Square | null }> = ({ square }) => (
    <div className="m5-active-square" data-test="active-square">
        <span className="m5-active-square-label">Active lens / Klein V₄ square</span>
        <span className="m5-active-square-value" data-test="active-square-value">
            {square ? KLEIN_V4_SQUARE_LABELS[square] : '—'}
        </span>
    </div>
);

const MobiusReturnIndicator: React.FC<{
    readonly mobius: MobiusReturnReadiness;
    readonly onClosePath?: (command: string) => void;
}> = ({ mobius, onClosePath }) => (
    <div
        className={`m5-mobius-return${mobius.ready ? ' m5-mobius-return-ready' : ''}`}
        data-test="mobius-return"
        data-ready={mobius.ready ? 'true' : 'false'}
    >
        <p className="m5-mobius-return-message">{mobius.message}</p>
        {mobius.ready ? (
            <button
                type="button"
                className="theia-button m5-mobius-return-action"
                data-test="mobius-return-close-path"
                onClick={() => fireMobiusReturnClosePath(mobius, onClosePath)}
            >
                Compose wisdom_delta → close session
                <span className="m5-mobius-return-links"> ({mobius.crossLinks.join(' · ')})</span>
            </button>
        ) : null}
    </div>
);

export interface RecognitionLayerProps {
    readonly viewModel: RecognitionLayerViewModel;
    readonly onClosePath?: (command: string) => void;
}

/** Pure presentational composition body — reused by the widget and by tests. */
export const RecognitionLayer: React.FC<RecognitionLayerProps> = ({ viewModel, onClosePath }) => (
    <div className="m5-recognition-layer" data-slot-id={M5_RECOGNITION_LAYER_SLOT_ID}
        data-composition-mode={COMPOSITION_MODE}>
        <header className="m5-recognition-layer-header">
            <h3>Recognition Layer</h3>
            <span className="m5-recognition-layer-source">M5 Epii · Mahamaya</span>
        </header>
        <RecognitionStrengthIndicator strength={viewModel.strength} />
        <TatTvamAsiVisual anchor={viewModel.anchor} strength={viewModel.strength} />
        <ActiveSquareIndicator square={viewModel.activeSquare} />
        {viewModel.anchor?.personalCodonProjection ? (
            <div className="m5-personal-codon" data-test="personal-codon">
                <span className="m5-personal-codon-label">M3 codon (personal scale)</span>
                <code data-test="personal-codon-value">{viewModel.anchor.personalCodonProjection}</code>
            </div>
        ) : null}
        <MobiusReturnIndicator mobius={viewModel.mobius} onClosePath={onClosePath} />
    </div>
);

// ---------------------------------------------------------------------------
// The slot widget
// ---------------------------------------------------------------------------

@injectable()
export class RecognitionLayerSlot extends ReactWidget {
    static readonly ID = M5_RECOGNITION_LAYER_SLOT_ID;
    static readonly LABEL = 'Recognition Layer';

    /** Pin the composition contract: this slot is editor-area-inline, never side-by-side. */
    readonly compositionMode: CompositionMode = COMPOSITION_MODE;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected currentProfile: MathemeHarmonicProfileBoundary | null = null;
    protected subscriptions: Disposable[] = [];
    protected onClosePath?: (command: string) => void;

    @postConstruct()
    protected init(): void {
        this.id = RecognitionLayerSlot.ID;
        this.title.label = RecognitionLayerSlot.LABEL;
        this.title.caption = RecognitionLayerSlot.LABEL;
        this.title.closable = false;
        this.addClass('m5-recognition-layer-slot');

        // Recognition strength updates whenever Q_composed advances — i.e. on
        // every new profile generation carrying fresh q_Nara/q_cosmic/q_activity.
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.currentProfile = profile;
                this.update();
            })
        );
        this.subscriptions.push(this.bridge.onReadiness(() => this.update()));
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try { sub.dispose(); } catch { /* best-effort */ }
        }
        super.dispose();
    }

    /** Install the close-path handler the ide-shell composer routes to 26.13 + 19.7. */
    setClosePathHandler(handler: (command: string) => void): void {
        this.onClosePath = handler;
    }

    /** Current derived view-model — exposed for the composer and tests. */
    viewModel(): RecognitionLayerViewModel {
        return deriveRecognitionViewModel(this.currentProfile);
    }

    protected override render(): React.ReactNode {
        return (
            <RecognitionLayer
                viewModel={this.viewModel()}
                onClosePath={command => this.onClosePath?.(command)}
            />
        );
    }
}
