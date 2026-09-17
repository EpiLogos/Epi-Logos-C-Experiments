/**
 * Coordinate: M' M1'+M2'+M3' (integrated 1-2-3 composition-contract matheme spine — Track 07.T7.2)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: the composition-contract assertion that the integrated 1-2-3
 *   stratification preserves the matheme spine — M3 codon (64) + M2 invariant
 *   (72 = 8×9) + M1-5 parent (+1) = 137 — in the Third Spanda Equation's five
 *   canonical forms (Mersenne / Binary / Octave-field / Spanda-bridge / M-stack,
 *   per `Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md`
 *   frontmatter authority, status kernel-canon), the co-canonical QCD
 *   octet/singlet decomposition (137 = 128 + 8 + 1, design-recon 7.2), the
 *   execution-order trace (64+72=136 → −9 → 127=M₇ → +1 → 128=2⁷ → +9 → 137),
 *   the translation rule 9₍M2₎ = 8₍M3₎ + 1₍M1₎ (the M1 parent unit sits between
 *   the 72-side and 64-side), and the 7-8-9 crown spine (N₅ = 8n ± n). Every
 *   form is an evaluable identity — the contract is checked by arithmetic, not
 *   by string match. The +1 parent attribution is M1-5 (DR-M1-1 / DR-M5-2, both
 *   VALIDATED), NEVER M0-Anuttara-witness; `assertParentAttribution` rejects the
 *   forbidden value. Physics lanes (α_EM⁻¹, QCD b₃) are reference-only
 *   measurement faces, never a fourth rendered pole nor a QL-derived calc.
 * Public surface: MATHEME_SPINE, ThirdSpandaForm, THIRD_SPANDA_FORMS,
 *   QCD_OCTET_SINGLET_FORM, TRANSLATION_RULE, EXECUTION_ORDER,
 *   SEVEN_EIGHT_NINE_SPINE, PARENT_ATTRIBUTION, FORBIDDEN_PARENT_ATTRIBUTION,
 *   assertParentAttribution, assertMathemeSpine.
 * Does NOT own: the topology-slot render (panes/m1KleinTopology,
 *   panes/KleinTopologyPane), the pentadic overlay strip (cosmicPentadicOverlay),
 *   the kernel genesis of `parent_attribution` (portal-core
 *   profile_projections::M1TopologyProjection), any physics computation.
 */

/** The +1 parent of the matheme spine is M1-5 (the single-torus recognition
 *  site), never M0. DR-M1-1 / DR-M5-2 (both VALIDATED 2026-06-02). */
export const PARENT_ATTRIBUTION = 'M1-5' as const;
export const FORBIDDEN_PARENT_ATTRIBUTION = 'M0-Anuttara-witness' as const;

/** The three composed poles and their sum. M3 codon-address space (64), M2
 *  resonance invariant (72 = 8×9), M1-5 parent unit (+1) → 137. */
export const MATHEME_SPINE = Object.freeze({
    m3Codon: 64,
    m2Invariant: 72,
    m1Parent: 1,
    total: 137
});

export interface ThirdSpandaForm {
    readonly id: string;
    readonly label: string;
    /** The canonical symbolic skeleton exactly as the spec renders it. */
    readonly symbol: string;
    /** The identity evaluated as real arithmetic — every form MUST return 137. */
    readonly evaluate: () => number;
}

/**
 * The Third Spanda Equation in its five canonical forms — the named authority
 * is the `ql_m0_m3_third_spanda_integral_quilting_v2.md` frontmatter:
 * `(Mersenne / Binary / Octave-field / Spanda-bridge / M-stack)`. Each is a
 * symbolic-skeleton overlay face on the composition, not a local computation.
 */
export const THIRD_SPANDA_FORMS: readonly ThirdSpandaForm[] = Object.freeze([
    {
        id: 'm-stack',
        label: 'M-stack composition',
        symbol: '137 = M₃(64) + M₂(72) + M₁(1)',
        evaluate: () =>
            MATHEME_SPINE.m3Codon + MATHEME_SPINE.m2Invariant + MATHEME_SPINE.m1Parent
    },
    {
        id: 'spanda-bridge',
        label: 'Spanda-bridge (doubled recognition-square)',
        symbol: '137 = 64 + 2(36) + 1',
        evaluate: () => 64 + 2 * 36 + 1
    },
    {
        id: 'octave-field',
        label: 'Octave-field',
        symbol: '137 = 8(8+9) + 1',
        evaluate: () => 8 * (8 + 9) + 1
    },
    {
        id: 'binary',
        label: 'Binary (2⁷ + epogdoon-9)',
        symbol: '137 = 2^7 + 9',
        evaluate: () => 2 ** 7 + 9
    },
    {
        id: 'mersenne',
        label: 'Mersenne-prime substrate (M₇ + parent + wholeness)',
        symbol: '137 = (2^7 - 1) + 1 + 9',
        evaluate: () => (2 ** 7 - 1) + 1 + 9
    }
]);

/**
 * The co-canonical binary/QCD octet/singlet decomposition named by design-recon
 * Tranche 7.2 (2^7 + gluon-octet + color-singlet) and recurring in the spec at
 * `137 = 128 + 9 = 128 + 8 + 1`. Asserted alongside the five so both sources of
 * truth are honoured. It is a labelled measurement/reference face, not a QL
 * calculation and not a fourth rendered pole.
 */
export const QCD_OCTET_SINGLET_FORM: ThirdSpandaForm = Object.freeze({
    id: 'qcd-octet-singlet',
    label: 'Binary/QCD decomposition (2⁷ + gluon-octet + color-singlet)',
    symbol: '137 = 128 + 8 + 1',
    evaluate: () => 128 + 8 + 1
});

/** The translation rule: the M1 parent unit literally sits between the 72-side
 *  (M2) and the 64-side (M3) — 9₍M2₎ = 8₍M3₎ + 1₍M1₎. */
export const TRANSLATION_RULE = Object.freeze({
    symbol: '9₍M2₎ = 8₍M3₎ + 1₍M1₎',
    m2Gap: 9,
    m3Gap: 8,
    m1Parent: 1
});

/** Execution-order trace: 64+72=136 → −9 → 127=M₇ → +1 → 128=2⁷ → +9 → 137.
 *  The 9 is first withdrawn to expose the Mersenne prime substrate, then
 *  restored as wholeness dressing. `physicalMeasurementFace` is source-warranted
 *  reference only (α_EM(0)⁻¹ ≈ 137.036) — never a QL-derived value. */
export const EXECUTION_ORDER = Object.freeze({
    sum136: 64 + 72, //           136 = 8(8+9)
    withdraw9: 64 + 72 - 9, //    127 = 2^7 − 1 = M₇
    parentRestore: 128, //        127 + 1 = 128 = 2^7
    wholenessRestore: 137, //     128 + 9 = 137
    physicalMeasurementFace: 137.035999 // reference face, not QL-derived
});

/** The 7-8-9 crown spine (N₅ = 8n ± n): 7 actional contraction (M₇ = 127,
 *  prime-index 31 = M₅, harmonic-seventh 7/4 revealed by 9-cancellation),
 *  8 octave-field/return (2⁷ = 128), 9 wholeness/epogdoon (137 − 128 = 9,
 *  9/8 = step/double-cover). */
export const SEVEN_EIGHT_NINE_SPINE = Object.freeze({
    seven: {
        role: 'actional-contraction',
        mersenne: 127,
        primeIndex: 31,
        harmonicSeventh: 7 / 4
    },
    eight: { role: 'octave-field/return', binaryClosure: 128 },
    nine: { role: 'wholeness/epogdoon-extension', gap: 137 - 128, epogdoonRatio: 9 / 8 }
});

/**
 * Contract check: the rendered +1 parent attribution MUST resolve to M1-5,
 * never M0-Anuttara-witness (DR-M1-1 / DR-M5-2). Returns the normalised
 * attribution `'M1-5'`; THROWS on the forbidden value or any string that does
 * not name M1-5. The input is the live topology-slot render
 * (`topologyFromPayload(payload).parentAttribution`).
 */
export function assertParentAttribution(rendered: string): typeof PARENT_ATTRIBUTION {
    const lower = rendered.toLowerCase();
    if (lower.includes('anuttara-witness') || lower.includes('m0-anuttara')) {
        throw new Error(
            `composition contract: +1 parent attribution '${rendered}' names M0-Anuttara-witness — the +1 is M1-5, the single-torus recognition site (DR-M1-1 / DR-M5-2)`
        );
    }
    if (!lower.includes('m1-5')) {
        throw new Error(
            `composition contract: +1 parent attribution '${rendered}' does not resolve to M1-5`
        );
    }
    return PARENT_ATTRIBUTION;
}

/**
 * The full composition-contract assertion: every canonical form (the spec's
 * five plus the co-canonical QCD form) evaluates to 137, the spine sums, the
 * execution-order trace lands on 137, the translation rule holds, and the +1
 * parent attribution resolves to M1-5. Returns the verified spine total (137).
 * THROWS with a specific message on the first violation.
 */
export function assertMathemeSpine(parentAttribution: string): number {
    const { m3Codon, m2Invariant, m1Parent, total } = MATHEME_SPINE;
    if (m3Codon + m2Invariant + m1Parent !== total) {
        throw new Error(
            `composition contract: M3(${m3Codon})+M2(${m2Invariant})+M1(${m1Parent}) does not sum to ${total}`
        );
    }
    if (m2Invariant !== 8 * 9) {
        throw new Error('composition contract: M2 invariant 72 must be 8×9 (resonance72)');
    }
    for (const form of [...THIRD_SPANDA_FORMS, QCD_OCTET_SINGLET_FORM]) {
        const value = form.evaluate();
        if (value !== total) {
            throw new Error(
                `composition contract: canonical form '${form.id}' (${form.symbol}) evaluates to ${value}, not ${total}`
            );
        }
    }
    if (TRANSLATION_RULE.m3Gap + TRANSLATION_RULE.m1Parent !== TRANSLATION_RULE.m2Gap) {
        throw new Error('composition contract: translation rule 9₍M2₎ = 8₍M3₎ + 1₍M1₎ violated');
    }
    if (
        EXECUTION_ORDER.withdraw9 !== 2 ** 7 - 1 ||
        EXECUTION_ORDER.parentRestore !== 2 ** 7 ||
        EXECUTION_ORDER.wholenessRestore !== total
    ) {
        throw new Error('composition contract: execution-order trace does not close on 137 via M₇→2⁷→+9');
    }
    assertParentAttribution(parentAttribution);
    return total;
}
