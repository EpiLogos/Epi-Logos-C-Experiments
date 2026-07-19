/**
 * Coordinate: M' M3' (Third-Spanda matheme proof panel — Track 24.T24.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: `M3ThirdSpandaPanel` — the live cumulative M1→M2→M3 generation
 *   from `anuttaraPentadicTrace.thirdSpanda`, followed by the source-warrant
 *   reference render of the Third Spanda Equation's five canonical forms
 *   (+ the co-canonical QCD
 *   octet/singlet face), the execution-order trace (64+72=136 → −9 → 127=M₇
 *   → +1 → 128=2⁷ → +9 → 137), the translation rule 9₍M2₎ = 8₍M3₎ + 1₍M1₎
 *   with its QCD analogue 3 ⊗ 3̄ = 8 ⊕ 1, and the 7-8-9 crown spine — every
 *   reference value read verbatim from the landed matheme data model
 *   (engine/compositionMatheme.ts). Register-disciplined: the panel formats
 *   and labels the symbolic skeleton and the measurement-face caveat only; it
 *   NEVER computes α_EM or RG flow (Tranche 4.10). The +1 parent attribution
 *   is asserted M1-5 (never M0-Anuttara-witness). The recognition-context
 *   warrant (payload.couplingFlowAlignment) is not bussed → honest-pending.
 * Does NOT own: trace genesis, the matheme identities
 *   (engine/compositionMatheme.ts — reference authority), any physics
 *   computation, the wheel/inspectors.
 */

import {
    EXECUTION_ORDER,
    MATHEME_SPINE,
    PARENT_ATTRIBUTION,
    QCD_OCTET_SINGLET_FORM,
    SEVEN_EIGHT_NINE_SPINE,
    THIRD_SPANDA_FORMS,
    TRANSLATION_RULE,
    assertParentAttribution
} from '../engine/compositionMatheme';
import type { CouplingFlowOverlay } from '../engine/couplingFlowOverlay';
import type { AnuttaraPentadicRuntimeTrace } from '../bridge/types';
import { ProvenanceBadge } from '../ui/primitives';

/** The QCD colour analogue of the translation rule — a labelled reference
 *  face named by design-recon 7.2, not a QL-derived value. */
const QCD_ANALOGUE = '3 ⊗ 3̄ = 8 ⊕ 1';

/** The execution-order trace as a chevron flow, composed verbatim from the
 *  matheme data model's EXECUTION_ORDER (no local arithmetic beyond string
 *  assembly of the already-evaluated stages). */
function executionTrace(): string {
    return (
        `64 + 72 = ${EXECUTION_ORDER.sum136} → (−9) → ` +
        `${EXECUTION_ORDER.withdraw9} = M₇ → (+1) → ` +
        `${EXECUTION_ORDER.parentRestore} = 2⁷ → (+9) → ` +
        `${EXECUTION_ORDER.wholenessRestore} → (+δ) → ` +
        `${EXECUTION_ORDER.physicalMeasurementFace}…`
    );
}

export type ThirdSpandaSkeletonEvent =
    | 'Additive137'
    | 'MersenneM7Ground'
    | 'SpandaCrownBifurcation';

export interface M3ThirdSpandaPanelProps {
    readonly couplingFlow?: CouplingFlowOverlay;
    readonly skeletonEventsActive?: readonly ThirdSpandaSkeletonEvent[];
    readonly trace?: AnuttaraPentadicRuntimeTrace;
}

function isActive(
    event: ThirdSpandaSkeletonEvent,
    activeEvents: readonly ThirdSpandaSkeletonEvent[]
): boolean {
    return activeEvents.includes(event);
}

export function M3ThirdSpandaPanel({
    couplingFlow,
    skeletonEventsActive = [],
    trace
}: M3ThirdSpandaPanelProps) {
    // Contract guard: the rendered +1 parent MUST resolve to M1-5 (DR-M1-1 /
    // DR-M5-2). The constant is safe; the guard keeps the invariant honest if
    // the source is ever edited to the forbidden M0-Anuttara-witness value.
    const parent = assertParentAttribution(PARENT_ATTRIBUTION);
    const forms = [...THIRD_SPANDA_FORMS, QCD_OCTET_SINGLET_FORM];

    return (
        <section className="mext-widget-detail" data-testid="m3-third-spanda" data-total={MATHEME_SPINE.total}>
            <h3>Third-Spanda runtime and reference registers</h3>

            {trace ? (
                <div className="m3-spanda-runtime" data-testid="m3-spanda-runtime">
                    <p>
                        M1 {trace.thirdSpanda.m1.degree720}° · Hopf fiber {trace.thirdSpanda.m1.hopfFiber}
                        {' · '}advance {trace.thirdSpanda.m1.advancementAddress64}
                        {' · '}q [{trace.thirdSpanda.m1.ringQuaternion.map(value => value.toFixed(3)).join(', ')}]
                    </p>
                    <p>
                        M2 72:{trace.thirdSpanda.m2.address72}
                        {' · '}Shem choir {trace.thirdSpanda.m2.axisViews.shem.choir}
                        {' · '}phase {trace.thirdSpanda.epogdoon.blockPhase}/9
                    </p>
                    <p>
                        M3 DET {trace.thirdSpanda.m3.detReceptionAddress64}
                        {' · '}clock {trace.thirdSpanda.m3.worldClockAddress64}
                        {' · '}{trace.thirdSpanda.m3.codon}
                        {' · '}rotation {trace.thirdSpanda.m3.codonRotation.rotationDegrees}°/
                        {trace.thirdSpanda.m3.codonRotation.rotationalStateCount}
                        {' · '}round-trip loss {trace.thirdSpanda.epogdoon.roundTripLoss}
                    </p>
                    <p>
                        9-address source block · 8 collision pairs · 64 non-exact round trips
                    </p>
                    <dl className="m3-spanda-axes" data-testid="m3-spanda-m2-axes">
                        <div>
                            <dt>MEF</dt>
                            <dd>
                                L{trace.thirdSpanda.m2.axisViews.mef.lens} · P
                                {trace.thirdSpanda.m2.axisViews.mef.position} ·{' '}
                                {trace.thirdSpanda.m2.axisViews.mef.isInverted ? 'inverted' : 'direct'} · family{' '}
                                {trace.thirdSpanda.m2.axisViews.mef.lFamilyLink}
                            </dd>
                        </div>
                        <div>
                            <dt>Tattva</dt>
                            <dd>
                                {trace.thirdSpanda.m2.axisViews.tattva.tattvaIndex} · phase{' '}
                                {trace.thirdSpanda.m2.axisViews.tattva.phase}
                            </dd>
                        </div>
                        <div>
                            <dt>Decan</dt>
                            <dd>
                                sign {trace.thirdSpanda.m2.axisViews.decan.sign} · decan{' '}
                                {trace.thirdSpanda.m2.axisViews.decan.decan} · face{' '}
                                {trace.thirdSpanda.m2.axisViews.decan.face} · planet{' '}
                                {trace.thirdSpanda.m2.axisViews.decan.rulingPlanet}
                            </dd>
                        </div>
                        <div>
                            <dt>Shem</dt>
                            <dd>
                                {trace.thirdSpanda.m2.axisViews.shem.shemIdx} · choir{' '}
                                {trace.thirdSpanda.m2.axisViews.shem.choir} · position{' '}
                                {trace.thirdSpanda.m2.axisViews.shem.position} · decan{' '}
                                {trace.thirdSpanda.m2.axisViews.shem.decanLink}
                            </dd>
                        </div>
                        <div>
                            <dt>Maqam</dt>
                            <dd>
                                {trace.thirdSpanda.m2.axisViews.maqam.index72} · family{' '}
                                {trace.thirdSpanda.m2.axisViews.maqam.family} · mode{' '}
                                {trace.thirdSpanda.m2.axisViews.maqam.modeInFamily} · ruler{' '}
                                {trace.thirdSpanda.m2.axisViews.maqam.planetRuler}
                            </dd>
                        </div>
                        <div>
                            <dt>DET</dt>
                            <dd>
                                {trace.thirdSpanda.m2.axisViews.det.index72} →{' '}
                                {trace.thirdSpanda.m2.axisViews.det.compressed64} · bitboard{' '}
                                {trace.thirdSpanda.m2.axisViews.det.det64}
                            </dd>
                        </div>
                    </dl>
                </div>
            ) : (
                <p className="mext-widget-empty" data-testid="m3-spanda-runtime">
                    <ProvenanceBadge state="pending" reason="pending-anuttara-pentadic-trace" />
                    live M1→M2→M3 generation pending
                </p>
            )}

            <p data-testid="m3-spanda-spine">
                {MATHEME_SPINE.total} = M₃({MATHEME_SPINE.m3Codon}) + M₂({MATHEME_SPINE.m2Invariant}) +
                M₁({MATHEME_SPINE.m1Parent}) · +1 parent = {parent}
            </p>

            {/* Lane 1 — Symbolic Skeleton: the five canonical forms + the
                co-canonical QCD octet/singlet face, each an evaluable identity. */}
            <dl className="m3-spanda-forms" data-testid="m3-spanda-forms">
                {forms.map(form => (
                    <div
                        key={form.id}
                        data-active={
                            (form.id === 'spanda-bridge' && isActive('Additive137', skeletonEventsActive)) ||
                            (form.id === 'mersenne' && isActive('MersenneM7Ground', skeletonEventsActive))
                                ? 'true'
                                : 'false'
                        }
                    >
                        <dt data-testid={`m3-spanda-form-label-${form.id}`}>{form.label}</dt>
                        <dd data-testid={`m3-spanda-form-${form.id}`}>
                            {form.symbol} = {form.evaluate()}
                        </dd>
                    </div>
                ))}
            </dl>

            <p
                data-testid="m3-spanda-execution-trace"
                data-active={isActive('SpandaCrownBifurcation', skeletonEventsActive) ? 'true' : 'false'}
            >
                Execution-order trace (symbolic skeleton): {executionTrace()}
            </p>

            <p data-testid="m3-spanda-translation">
                Translation rule: {TRANSLATION_RULE.symbol} · QCD analogue: {QCD_ANALOGUE}
            </p>

            <ul className="m3-spanda-789" data-testid="m3-spanda-789">
                <li data-testid="m3-spanda-789-seven">
                    7 · {SEVEN_EIGHT_NINE_SPINE.seven.role} · M₇={SEVEN_EIGHT_NINE_SPINE.seven.mersenne}
                </li>
                <li data-testid="m3-spanda-789-eight">
                    8 · {SEVEN_EIGHT_NINE_SPINE.eight.role} · 2⁷={SEVEN_EIGHT_NINE_SPINE.eight.binaryClosure}
                </li>
                <li data-testid="m3-spanda-789-nine">
                    9 · {SEVEN_EIGHT_NINE_SPINE.nine.role} · gap={SEVEN_EIGHT_NINE_SPINE.nine.gap}
                </li>
            </ul>

            {/* Lane 3 — Measurement Face: the canonical caveat, register-disciplined
                (source-warrant only, never a QL-derived α). */}
            <p data-testid="m3-spanda-measurement-face">
                {MATHEME_SPINE.total} is the integer skeleton; {EXECUTION_ORDER.physicalMeasurementFace}… is the
                dressed low-energy measurement-face. This panel is source-warrant / provenance UI over the
                symbolic skeleton — it renders the reference measurement-face, it does not compute it.
            </p>

            {/* Lanes 2 and 4 consume the full kernel alignment as one record.
                Partial fields remain pending in the shared parser. */}
            {couplingFlow?.state === 'ready' ? (
                <>
                    <ol data-testid="m3-spanda-physics-descent">
                        {couplingFlow.physicsDescent.map(step => <li key={step}>{step}</li>)}
                    </ol>
                    <p data-testid="m3-spanda-recognition-warrant">
                        recognition-context warrant: {couplingFlow.recognitionWarrant}
                    </p>
                </>
            ) : (
                <p className="mext-widget-empty" data-testid="m3-spanda-recognition-warrant">
                    <ProvenanceBadge state="pending" reason="pending-recognition-context-warrant" />
                    recognition-context warrant: pending-recognition-context-warrant — the
                    couplingFlowAlignment boundary (WC-M3-SA-5) is not yet on the bus.
                </p>
            )}
        </section>
    );
}
