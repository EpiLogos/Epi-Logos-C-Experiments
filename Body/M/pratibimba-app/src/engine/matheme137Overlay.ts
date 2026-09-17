/**
 * Coordinate: M'/29 :: the 137 = 64 + 72 + 1 overlay directive (29.T29.8)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: 29.T29.8 / Track 07 §7.2 — the Third Spanda spine as an
 *   ANNOTATION DIRECTIVE on the cosmic 1-2-3 composition: the 64-side on the
 *   M3 lens-ring, the 72-side on the M2 cymatic surface, the `+1` bridge
 *   between them, the 7-8-9 crown spine, the Mersenne proof-mode label, and
 *   the Kaprekar pedagogy chip.
 * Public surface: MathemeSideAnnotation, MathemeSpineOrbit, Matheme137Overlay,
 *   MATHEME_SKELETON_EVENTS, skeletonEventFired, buildMatheme137Overlay,
 *   formatMatheme137Hover.
 * Does NOT own: the matheme LAW (`compositionMatheme.ts` — the five canonical
 *   forms, the translation rule, the execution order, the parent attribution
 *   and its forbidden value all live there and are composed, never restated),
 *   the skeleton-event read path (`panes/m1KaprekarInspector.ts`), the strip
 *   DOM (`CosmicEngine.tsx`), or the standalone panels (M3ThirdSpandaPanel,
 *   M1KaprekarInspector).
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.8.
 *
 * # Directive, not render — the spec's own division of labour
 *
 * 29.8 says it plainly: "composition issues the directive; played-torus
 * renders." So this builds WHAT the annotation says and WHERE it belongs, and
 * nothing here draws a mesh. The equatorial golden bead and the three orbit
 * meshes are the played-torus renderer's work (22.2), and inventing a second
 * renderer here would fork the surface.
 *
 * # Composed from the law, never restated
 *
 * Every string and number comes from `compositionMatheme.ts`: the canonical
 * forms, the translation-rule symbol, the 7-8-9 roles, the parent attribution.
 * A second copy of `137 = 128 + 8 + 1` living here would be a place for the two
 * to drift, and the whole point of that module is that the contract is checked
 * by arithmetic rather than by string match.
 */

import {
    assertParentAttribution,
    MATHEME_SPINE,
    PARENT_ATTRIBUTION,
    QCD_OCTET_SINGLET_FORM,
    SEVEN_EIGHT_NINE_SPINE,
    THIRD_SPANDA_FORMS,
    TRANSLATION_RULE
} from './compositionMatheme';
import { readKaprekarInspectorInput, isKaprekarPedagogyHit } from '../panes/m1KaprekarInspector';
import type { KernelBridgeCachedProfile } from '../bridge/types';

/** The skeleton events this overlay consumes off the profile bus (19.8). */
export const MATHEME_SKELETON_EVENTS = Object.freeze({
    additive137: 'Additive137',
    kaprekarPedagogyHit: 'KaprekarPedagogyHit'
} as const);

export interface MathemeSideAnnotation {
    /** Where on the composed surface the annotation belongs. */
    readonly region: 'm3-lens-ring' | 'm2-cymatic-surface' | 'k2-equatorial-seam';
    readonly label: string;
    /** The canonical form hover surfaces, taken from the law. */
    readonly canonicalForm: string;
}

export interface MathemeSpineOrbit {
    readonly n: 7 | 8 | 9;
    readonly role: string;
    /** Innermost to outermost, per 19.9. */
    readonly ring: 0 | 1 | 2;
    readonly active: boolean;
}

export interface Matheme137Overlay {
    /** Track 07 §7.2: the `+1` parent is M1-5, never the M0 witness. */
    readonly parentAttribution: typeof PARENT_ATTRIBUTION;
    readonly sixtyFour: MathemeSideAnnotation;
    readonly seventyTwo: MathemeSideAnnotation;
    readonly bridge: MathemeSideAnnotation;
    readonly spineOrbits: readonly MathemeSpineOrbit[];
    /** True once the profile's skeleton event says `Additive137`. */
    readonly spineActive: boolean;
    readonly mersenne: { readonly label: string; readonly visible: boolean };
    /** The 3s Kaprekar chip trigger (19.8 enum ordinal 6). */
    readonly kaprekarChip: boolean;
    /** Every canonical form, for the annotation's hover. */
    readonly hoverForms: readonly string[];
}

function formSymbol(id: string): string {
    const form = THIRD_SPANDA_FORMS.find(candidate => candidate.id === id);
    return form?.symbol ?? QCD_OCTET_SINGLET_FORM.symbol;
}

/**
 * Whether a bussed skeleton-event value names `event`.
 *
 * Accepts the declared enum NAME only. `isKaprekarPedagogyHit` also accepts the
 * wire ordinal 6 because 19.8 states it; no ordinal is stated for the others,
 * and guessing one would invent a wire contract.
 */
export function skeletonEventFired(value: unknown, event: string): boolean {
    if (typeof value === 'string') return value === event;
    if (value !== null && typeof value === 'object') {
        const name = (value as { name?: unknown }).name;
        return typeof name === 'string' && name === event;
    }
    return false;
}

/**
 * Build the annotation directive for the cosmic composition.
 *
 * `proofMode` gates the Mersenne label only — everything else is a property of
 * the composition and the live profile, never of who is looking.
 */
export function buildMatheme137Overlay(
    cached: KernelBridgeCachedProfile | null,
    { proofMode = false }: { proofMode?: boolean } = {}
): Matheme137Overlay {
    const skeletonEvent = readKaprekarInspectorInput(cached).skeletonEvent;
    const spineActive = skeletonEventFired(skeletonEvent, MATHEME_SKELETON_EVENTS.additive137);

    return Object.freeze({
        // Throws on the forbidden M0-Anuttara-witness attribution rather than
        // rendering it — the law owns that refusal.
        parentAttribution: assertParentAttribution(PARENT_ATTRIBUTION),
        sixtyFour: Object.freeze({
            region: 'm3-lens-ring' as const,
            label: `${MATHEME_SPINE.m3Codon} = M3 codons`,
            canonicalForm: QCD_OCTET_SINGLET_FORM.symbol
        }),
        seventyTwo: Object.freeze({
            region: 'm2-cymatic-surface' as const,
            label: `${MATHEME_SPINE.m2Invariant} = M2 invariant`,
            canonicalForm: formSymbol('spanda-bridge')
        }),
        bridge: Object.freeze({
            region: 'k2-equatorial-seam' as const,
            label: TRANSLATION_RULE.symbol,
            canonicalForm: formSymbol('m-stack')
        }),
        spineOrbits: Object.freeze([
            Object.freeze({
                n: 7 as const,
                role: SEVEN_EIGHT_NINE_SPINE.seven.role,
                ring: 0 as const,
                active: spineActive
            }),
            Object.freeze({
                n: 8 as const,
                role: SEVEN_EIGHT_NINE_SPINE.eight.role,
                ring: 1 as const,
                active: spineActive
            }),
            Object.freeze({
                n: 9 as const,
                role: SEVEN_EIGHT_NINE_SPINE.nine.role,
                ring: 2 as const,
                active: spineActive
            })
        ]),
        mersenne: Object.freeze({
            label: `${SEVEN_EIGHT_NINE_SPINE.seven.mersenne} = 2^7 - 1`,
            visible: proofMode
        }),
        kaprekarChip: isKaprekarPedagogyHit(skeletonEvent),
        spineActive,
        hoverForms: Object.freeze([
            ...THIRD_SPANDA_FORMS.map(form => form.symbol),
            QCD_OCTET_SINGLET_FORM.symbol
        ])
    });
}

/** The annotation's hover text: every canonical form, one per line. */
export function formatMatheme137Hover(overlay: Matheme137Overlay): string {
    return [
        `${overlay.sixtyFour.label} · ${overlay.seventyTwo.label} · ${overlay.bridge.label}`,
        ...overlay.hoverForms
    ].join('\n');
}
