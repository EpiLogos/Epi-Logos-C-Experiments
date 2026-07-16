/**
 * Coordinate: M' M3' (Third-Spanda matheme proof panel — Track 24.T24.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: `M3ThirdSpandaPanel` — the source-warrant render of the Third
 *   Spanda Equation's five canonical forms (+ the co-canonical QCD
 *   octet/singlet face), the execution-order trace (64+72=136 → −9 → 127=M₇
 *   → +1 → 128=2⁷ → +9 → 137), the translation rule 9₍M2₎ = 8₍M3₎ + 1₍M1₎
 *   with its QCD analogue 3 ⊗ 3̄ = 8 ⊕ 1, and the 7-8-9 crown spine — every
 *   value read verbatim from the landed matheme data model
 *   (engine/compositionMatheme.ts). Register-disciplined: the panel formats
 *   and labels the symbolic skeleton and the measurement-face caveat only; it
 *   NEVER computes α_EM or RG flow (Tranche 4.10). The +1 parent attribution
 *   is asserted M1-5 (never M0-Anuttara-witness). The recognition-context
 *   warrant (payload.couplingFlowAlignment) is not bussed → honest-pending.
 * Does NOT own: the matheme identities (engine/compositionMatheme.ts —
 *   arithmetic authority), any physics computation, the wheel/inspectors.
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

export function M3ThirdSpandaPanel() {
    // Contract guard: the rendered +1 parent MUST resolve to M1-5 (DR-M1-1 /
    // DR-M5-2). The constant is safe; the guard keeps the invariant honest if
    // the source is ever edited to the forbidden M0-Anuttara-witness value.
    const parent = assertParentAttribution(PARENT_ATTRIBUTION);
    const forms = [...THIRD_SPANDA_FORMS, QCD_OCTET_SINGLET_FORM];

    return (
        <section className="mext-widget-detail" data-testid="m3-third-spanda" data-total={MATHEME_SPINE.total}>
            <h3>Third-Spanda matheme proof</h3>

            <p data-testid="m3-spanda-spine">
                {MATHEME_SPINE.total} = M₃({MATHEME_SPINE.m3Codon}) + M₂({MATHEME_SPINE.m2Invariant}) +
                M₁({MATHEME_SPINE.m1Parent}) · +1 parent = {parent}
            </p>

            {/* Lane 1 — Symbolic Skeleton: the five canonical forms + the
                co-canonical QCD octet/singlet face, each an evaluable identity. */}
            <dl className="m3-spanda-forms" data-testid="m3-spanda-forms">
                {forms.map(form => (
                    <div key={form.id}>
                        <dt data-testid={`m3-spanda-form-label-${form.id}`}>{form.label}</dt>
                        <dd data-testid={`m3-spanda-form-${form.id}`}>
                            {form.symbol} = {form.evaluate()}
                        </dd>
                    </div>
                ))}
            </dl>

            <p data-testid="m3-spanda-execution-trace">
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

            {/* Lane 4 — Recognition Context: the warrant text rides
                payload.couplingFlowAlignment, which is not bussed → honest-pending. */}
            <p className="mext-widget-empty" data-testid="m3-spanda-recognition-warrant">
                <ProvenanceBadge state="pending" reason="pending-recognition-context-warrant" />
                recognition-context warrant: pending-recognition-context-warrant — the
                couplingFlowAlignment boundary (WC-M3-SA-5) is not yet on the bus.
            </p>
        </section>
    );
}
