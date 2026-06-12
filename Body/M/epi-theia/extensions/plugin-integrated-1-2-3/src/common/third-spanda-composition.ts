// 07.T7.2 — 137 = 64 + 72 + 1 composition assertion (Third Spanda Equation).
//
// SYMBOLIC-SKELETON DISCIPLINE
// ============================
// This module asserts that the cosmic-engine plugin's stratification preserves
// the matheme spine — M3 codon (64) + M2 invariant (72) + M1-5 (+1) = 137 —
// and renders the Third Spanda Equation's five canonical forms as OVERLAY
// STRINGS, never as a local computation. The plugin already routes the real
// codon / correspondence / topology data from the backend profile bus (see
// cosmic-engine-panes.tsx). Nothing here recomputes any of that; these are
// labelled symbolic faces of the same spine.
//
// REGISTER DISCIPLINE (per full_theoretical_alignments_ql_physics.md)
// -------------------------------------------------------------------
// Every face carries exactly one of three register labels:
//   - 'symbolic_skeleton' — a QL/M-stack canonical form (the five equations,
//      the translation rule, the Mersenne grounding, the 7-8-9 spine).
//   - 'measurement_face'  — an empirical physics measurement shown for
//      reference only (e.g. alpha_EM(0)^-1 ~= 137.036).
//   - 'physics_reference' — a structural physics correspondence shown for
//      reference only (e.g. QCD gluon-octet 8+1, b_3 = -7).
// Physics lanes are reference faces ONLY. The QL stratum never computes the
// fine-structure constant; alpha is displayed, not produced.
//
// Cross-links: DR-M1-1 (M1-5 is the +1 parent / single-torus recognition site)
// and DR-M5-2 (M0-Anuttara is the prior 0/1 ground, NOT the witness-axis +1).

/** The only register labels the integrated surface may attach to a face. */
export type CompositionRegisterLabel =
    | 'symbolic_skeleton'
    | 'measurement_face'
    | 'physics_reference';

/** Frozen enumeration of the allowed register labels, for validation/tests. */
export const COMPOSITION_REGISTER_LABELS: readonly CompositionRegisterLabel[] = Object.freeze([
    'symbolic_skeleton',
    'measurement_face',
    'physics_reference'
]);

/**
 * The `+1` parent attribution. This MUST read `M1-5` — the single-torus
 * recognition site — and MUST NOT read `M0-Anuttara-witness`. M0 is the prior
 * 0/1 ground M1 receives (DR-M5-2); it never absorbs the +1 parent (DR-M1-1).
 */
export const PARENT_ATTRIBUTION = 'M1-5' as const;

/** What the parent attribution must never collapse into (kept visible for tests/docs). */
export const PARENT_ATTRIBUTION_REJECTED = 'M0-Anuttara-witness' as const;

/** One of the three composition slots that sum to 137. */
export interface CompositionSlot {
    /** Numeric weight of the slot (64, 72, or 1). */
    readonly value: number;
    /** Which side of the bridge the slot sits on. */
    readonly side: 'codon-64-side' | 'invariant-72-side' | 'parent-+1';
    /** The owning subsystem (M3 / M2 / M1-5). */
    readonly subsystem: string;
    /** Always a symbolic skeleton — these are spine faces, not measurements. */
    readonly register: Extract<CompositionRegisterLabel, 'symbolic_skeleton'>;
    /** Short human label for the slot. */
    readonly label: string;
}

/** A single canonical form of the Third Spanda Equation. */
export interface ThirdSpandaCanonicalForm {
    /** The literal equation string, e.g. `137 = 64 + 72 + 1`. */
    readonly form: string;
    /** Name of the view. */
    readonly name: string;
    /** Canonical forms are symbolic skeletons by construction. */
    readonly register: Extract<CompositionRegisterLabel, 'symbolic_skeleton'>;
    /** One-line gloss of what the decomposition means. */
    readonly gloss: string;
}

/**
 * The translation rule rendered as a labelled bridge between the 72-side
 * (M2 invariant) and the 64-side (M3 codon). The M1 parent unit literally sits
 * between them: `9_M2 = 8_M3 + 1_M1`.
 */
export interface TranslationRuleBridge {
    /** `9_M2 = 8_M3 + 1_M1` — the epogdoon-9 resolves to octave-8 plus the M1 parent unit. */
    readonly rule: string;
    /** Left anchor of the bridge. */
    readonly leftSide: string;
    /** Right anchor of the bridge. */
    readonly rightSide: string;
    /** The +1 parent unit that sits literally between the 72-side and 64-side. */
    readonly parentUnit: string;
    readonly register: Extract<CompositionRegisterLabel, 'symbolic_skeleton'>;
}

/**
 * The Mersenne grounding of the 7. The 7 is doubly grounded: `127 = 2^7 - 1`
 * (Mersenne prime M_7) and its prime-index `31 = M_5`. Displayed as the
 * `archetype-7 generator` annotation.
 */
export interface MersenneGrounding {
    /** `127 = 2^7 - 1` — the Mersenne prime M_7. */
    readonly mersennePrime: string;
    /** `31 = M_5` — prime-index of M_7 is itself a Mersenne prime. */
    readonly primeIndex: string;
    /** The `archetype-7 generator` annotation. */
    readonly annotation: string;
    readonly register: Extract<CompositionRegisterLabel, 'symbolic_skeleton'>;
}

/** A node of the 7-8-9 Spanda-crown spine (per N_5 = 8n ± n bifurcation). */
export interface SpineNode789 {
    /** 7, 8, or 9. */
    readonly numeral: 7 | 8 | 9;
    /** The role this numeral plays in the crown bifurcation. */
    readonly role: string;
    /** One-line gloss. */
    readonly gloss: string;
    readonly register: Extract<CompositionRegisterLabel, 'symbolic_skeleton'>;
}

/** A physics lane shown as a reference/measurement face — never a fourth pole. */
export interface PhysicsReferenceFace {
    /** The physics expression, e.g. `alpha_EM(0)^-1 ~= 137.036`. */
    readonly lane: string;
    /** A measurement face or a structural physics reference — never a symbolic skeleton. */
    readonly register: Exclude<CompositionRegisterLabel, 'symbolic_skeleton'>;
    /** Why it is shown and that it is reference-only. */
    readonly note: string;
}

/** The full composition model the widget overlay renders. */
export interface ThirdSpandaCompositionModel {
    /** Title — the literal phrase `Third Spanda Equation`. */
    readonly title: string;
    /** The matheme spine restated for the header. */
    readonly spine: string;
    /** The three slots that sum to 137. */
    readonly slots: readonly CompositionSlot[];
    /** The asserted total (137). */
    readonly total: number;
    /** The `+1` parent attribution — pinned to `M1-5`. */
    readonly parentAttribution: string;
    /** The five canonical forms. */
    readonly canonicalForms: readonly ThirdSpandaCanonicalForm[];
    /** The 72-side ↔ 64-side translation bridge. */
    readonly translationRule: TranslationRuleBridge;
    /** The Mersenne grounding of the 7. */
    readonly mersenne: MersenneGrounding;
    /** The triadic 7-8-9 overlay. */
    readonly spine789: readonly SpineNode789[];
    /** Physics lanes as labelled reference faces. */
    readonly physicsFaces: readonly PhysicsReferenceFace[];
    /** Decision-record cross-links. */
    readonly crossLinks: readonly string[];
    /** Standing note that physics is reference-only (no alpha is produced here). */
    readonly registerDiscipline: string;
}

const SLOTS: readonly CompositionSlot[] = Object.freeze([
    Object.freeze({
        value: 64,
        side: 'codon-64-side',
        subsystem: 'M3',
        register: 'symbolic_skeleton',
        label: 'M3 codon (2^6 = 64)'
    }),
    Object.freeze({
        value: 1,
        side: 'parent-+1',
        subsystem: PARENT_ATTRIBUTION,
        register: 'symbolic_skeleton',
        label: 'M1-5 parent (+1, single-torus recognition site)'
    }),
    Object.freeze({
        value: 72,
        side: 'invariant-72-side',
        subsystem: 'M2',
        register: 'symbolic_skeleton',
        label: 'M2 invariant (72 = 8 × 9 epogdoon)'
    })
]) as readonly CompositionSlot[];

const CANONICAL_FORMS: readonly ThirdSpandaCanonicalForm[] = Object.freeze([
    Object.freeze({
        form: '137 = 64 + 72 + 1',
        name: 'M-stack composition',
        register: 'symbolic_skeleton',
        gloss: 'M3 codon + M2 invariant + M1-5 parent.'
    }),
    Object.freeze({
        form: '137 = 64 + 2(36) + 1',
        name: 'Spanda-bridge form',
        register: 'symbolic_skeleton',
        gloss: 'Doubled recognition-square: 72 = 2 × 36.'
    }),
    Object.freeze({
        form: '137 = 128 + 8 + 1',
        name: 'binary / QCD decomposition',
        register: 'symbolic_skeleton',
        gloss: '2^7 + gluon-octet + color-singlet.'
    }),
    Object.freeze({
        form: '137 = 2^7 + 9',
        name: 'Mersenne-binary view',
        register: 'symbolic_skeleton',
        gloss: 'Binary 2^7 plus the epogdoon-extension 9.'
    }),
    Object.freeze({
        form: '137 = (2^7 - 1) + 1 + 9',
        name: 'Mersenne-prime-substrate view',
        register: 'symbolic_skeleton',
        gloss: 'M_7 (Mersenne prime) + parent + wholeness.'
    })
]) as readonly ThirdSpandaCanonicalForm[];

const TRANSLATION_RULE: TranslationRuleBridge = Object.freeze({
    rule: '9_M2 = 8_M3 + 1_M1',
    leftSide: '72-side (M2 invariant, 8 × 9)',
    rightSide: '64-side (M3 codon, 2^6)',
    parentUnit: 'M1 parent unit (+1) sits literally between the 72-side and 64-side',
    register: 'symbolic_skeleton'
});

const MERSENNE: MersenneGrounding = Object.freeze({
    mersennePrime: '127 = 2^7 - 1',
    primeIndex: '31 = M_5',
    annotation: 'archetype-7 generator',
    register: 'symbolic_skeleton'
});

const SPINE_789: readonly SpineNode789[] = Object.freeze([
    Object.freeze({
        numeral: 7,
        role: 'actional contraction',
        gloss: '8n − n; harmonic-seventh 7/4 emerging from (72−9)/36.',
        register: 'symbolic_skeleton'
    }),
    Object.freeze({
        numeral: 8,
        role: 'octave-field / return',
        gloss: 'The octave field the contraction returns into.',
        register: 'symbolic_skeleton'
    }),
    Object.freeze({
        numeral: 9,
        role: 'wholeness / epogdoon-extension',
        gloss: '8n + n; the 9/8 epogdoon extension to wholeness.',
        register: 'symbolic_skeleton'
    })
]) as readonly SpineNode789[];

const PHYSICS_FACES: readonly PhysicsReferenceFace[] = Object.freeze([
    Object.freeze({
        lane: 'alpha_EM(0)^-1 ~= 137.036',
        register: 'measurement_face',
        note: 'Low-energy fine-structure constant; shown for reference, not derived here.'
    }),
    Object.freeze({
        lane: 'alpha_EM(M_Z)^-1 ~= 128',
        register: 'measurement_face',
        note: 'Running coupling at the Z mass; reference measurement only.'
    }),
    Object.freeze({
        lane: 'QCD 8 + 1 (gluon-octet + color-singlet)',
        register: 'physics_reference',
        note: 'Structural correspondence to the 128 + 8 + 1 form; reference only.'
    }),
    Object.freeze({
        lane: 'b_3 = -7 (asymptotic freedom)',
        register: 'physics_reference',
        note: 'One-loop QCD beta coefficient; grounds the archetype-7, reference only.'
    })
]) as readonly PhysicsReferenceFace[];

/**
 * The single frozen Third Spanda composition model. Built once at module load
 * — there is nothing to compute per-render; this is the symbolic skeleton.
 */
export const THIRD_SPANDA_COMPOSITION: ThirdSpandaCompositionModel = Object.freeze({
    title: 'Third Spanda Equation',
    spine: '137 = 64 + 72 + 1 (M3 codon + M2 invariant + M1-5 parent)',
    slots: SLOTS,
    total: 137,
    parentAttribution: PARENT_ATTRIBUTION,
    canonicalForms: CANONICAL_FORMS,
    translationRule: TRANSLATION_RULE,
    mersenne: MERSENNE,
    spine789: SPINE_789,
    physicsFaces: PHYSICS_FACES,
    crossLinks: Object.freeze(['DR-M1-1', 'DR-M5-2']),
    registerDiscipline:
        'Physics lanes are labelled reference faces only; the QL stratum does not compute alpha. ' +
        'The five canonical forms, the translation rule, the Mersenne grounding, and the 7-8-9 ' +
        'spine are symbolic_skeleton overlays of the same backend-routed spine.'
});

/**
 * Assert that a composition model preserves the matheme spine. Throws on any
 * violation so a render-test (or a future runtime guard) can prove the
 * invariant rather than trust it.
 *
 * Checks:
 *   1. parentAttribution is exactly `M1-5` (never `M0-Anuttara-witness`).
 *   2. The three slots sum to the asserted total of 137.
 *   3. Every face carries an allowed register label, and slots/forms are
 *      symbolic_skeleton (physics faces are measurement/reference only).
 */
export function assertThirdSpandaComposition(
    model: ThirdSpandaCompositionModel = THIRD_SPANDA_COMPOSITION
): ThirdSpandaCompositionModel {
    // Pinned to the M1-5 parent; the rejected `M0-Anuttara-witness` reading
    // (DR-M5-2) can never satisfy this exact-match guard.
    if (model.parentAttribution !== PARENT_ATTRIBUTION) {
        throw new Error(
            `parentAttribution must be '${PARENT_ATTRIBUTION}' (never '${PARENT_ATTRIBUTION_REJECTED}'), ` +
            `got '${model.parentAttribution}'`
        );
    }
    const slotSum = model.slots.reduce((acc, slot) => acc + slot.value, 0);
    if (slotSum !== model.total || model.total !== 137) {
        throw new Error(`composition slots must sum to 137; got ${slotSum} / total ${model.total}`);
    }
    for (const slot of model.slots) {
        if (slot.register !== 'symbolic_skeleton') {
            throw new Error(`slot ${slot.label} must be symbolic_skeleton`);
        }
    }
    for (const form of model.canonicalForms) {
        if (form.register !== 'symbolic_skeleton') {
            throw new Error(`canonical form ${form.form} must be symbolic_skeleton`);
        }
    }
    for (const face of model.physicsFaces) {
        const register: string = face.register;
        if (register === 'symbolic_skeleton') {
            throw new Error(`physics lane ${face.lane} must not be a symbolic_skeleton (reference only)`);
        }
        if (!COMPOSITION_REGISTER_LABELS.includes(face.register)) {
            throw new Error(`physics lane ${face.lane} has an unknown register label`);
        }
    }
    return model;
}
