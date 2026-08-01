/**
 * Coordinate: M'/29 :: personal 4-5-0 composition — the declared slot ownership
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #4 — the composed personal surface (peer to the #2 cosmic one)
 * Actualises: 29.T29.3 (personal 4-5-0 composition geometry), DR-WC-IP-3
 *   (status ROUTED, ratified by building — see "Decision status" below).
 * Public surface: PERSONAL_SLOT_CARRIERS, PERSONAL_SLOT_BLOCKERS,
 *   PERSONAL_COMPOSITION_CONTRIBUTORS, loadPersonalComposition,
 *   describePersonalCompositionLoad, blockedPersonalSlots.
 * Does NOT own: the geometric-slot law (`geometricSlotEnforcement.ts`), the
 *   render (`engine/PersonalRecognitionEngine.tsx` + the `personalHome` case in
 *   `App.tsx`), the privacy-class register (`ui/privacyChrome.ts`, 25.18), or
 *   any slot contributor's own surface.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]]
 *   T29.3 · DR-WC-IP-1 (slot taxonomy) · DR-WC-IP-3 · DR-M4-3 / IP-15.
 *
 * # Why this file exists
 *
 * `geometricSlotEnforcement.ts` (29.13) declares the six PERSONAL geometric
 * slots and the protected-local boundary that guards them — the five raw-body
 * handle classes (`raw-quaternion`, `raw-audio-octet`, `plaintext-journal`,
 * `graphiti-episode-body`, `raw-natal-chart`) that must never cross a slot.
 *
 * Those five classes are all PERSONAL material. The cosmic declaration (29.2)
 * gave `compositionLoad()` a production caller, but a cosmic contributor has no
 * plausible reason to declare a raw journal body or a natal chart, so the
 * boundary's whole reason for existing stayed unexercised in production.
 * `PERSONAL_GEOMETRIC_SLOTS` was referenced by exactly one file in the
 * repository: its own test.
 *
 * The guard was unreachable on the only path it was written for. This is the
 * declaration that makes it reachable — the M4 protected-local boundary now
 * runs at the mount of the surface that actually carries someone's journal,
 * quaternions and natal chart.
 *
 * # The claims are the render, not an aspiration
 *
 * Every slot below names the carrier file and symbol that renders it, and
 * `personalComposition.test.ts` reads those files and fails if the symbol is
 * gone — the declaration is not allowed to describe a composition that is not
 * on screen. This mirrors the cosmic parity test, generalised to a file+symbol
 * pair because the personal composition's chrome legitimately lives in more
 * than one file (the ambient control mounts in `App.tsx` around the engine;
 * the privacy tint is worn by the leaf surfaces themselves).
 *
 * # The one blocked slot is blocked, not quietly dropped
 *
 * `center-composition` is OWNED by m4-nara and has no renderer: 25.T25.6
 * (personal cymatic field widget body) is pending in the rerun ledger, and
 * `engine/dipyramidGeometry.ts` — the DR-IG-6 vertex fixture "every M4-5'
 * psychoid renderer must consume" — has zero consumers in the repository. The
 * slot is therefore declared with its owner and a named blocker rather than
 * omitted, because an unowned slot and an unbuilt one are different facts.
 *
 * Per the tranche brief a blocked slot renders an empty state. That empty state
 * is deliberately NOT added here: the personal surface currently has no
 * center-composition region to render one into, and adding a visible region for
 * a renderer that does not exist would change a screenshot-baselined face
 * (`composition-4-5-0-personal.png`) on behalf of another tranche. The blocked
 * state reports as a data attribute, exactly as the cosmic ownership readout
 * does; the visible slot arrives with 25.T25.6.
 *
 * # Decision status
 *
 * DR-WC-IP-3 is ROUTED, not validated. The tranche says building it is what
 * ratifies it, and that is the only basis claimed here.
 */

import { loadComposition, type LoadCompositionResult } from './compositionLoad';
import type { CompositionContributor } from './geometricSlotEnforcement';
import type { KernelBridgeCachedProfile } from '../bridge/types';

/** The six personal slots, in the order the composition reads left→under→chrome. */
export type PersonalGeometricSlotName =
    | 'left-composition'
    | 'center-composition'
    | 'right-composition'
    | 'grounding'
    | 'composition-ambient'
    | 'composition-status';

/** The carrier file+symbol that renders a slot. `file` is relative to `src/`. */
export interface PersonalSlotCarrier {
    readonly file: string;
    readonly symbol: string;
    readonly note: string;
}

/**
 * Where each personal slot actually renders in THIS carrier.
 *
 * Read against the frozen 4-5-0 widget these differ in layout but not in
 * function, which is the DR-FACE-7 fate law: the journal LEFT column is carried
 * by `NowPane` (day-resonance strip + ambient state strip + tuning bar + the
 * Tiptap canvas, i.e. 11.10 + 11.12 together), and the ambient control sits in
 * `panes/HomePane.tsx` — the component the `personalHome` case renders — which
 * wraps the engine rather than sitting inside it (52.T5).
 */
export const PERSONAL_SLOT_CARRIERS: Readonly<
    Record<Exclude<PersonalGeometricSlotName, 'center-composition'>, PersonalSlotCarrier>
> = Object.freeze({
    'left-composition': Object.freeze({
        file: 'panes/NowPane.tsx',
        symbol: 'NaraCanvasEditor',
        note: 'the day canvas (11.10) under its ambient strip + tuning bar (11.12), mounted by NowPane inside the engine'
    }),
    'right-composition': Object.freeze({
        file: 'engine/PersonalRecognitionEngine.tsx',
        symbol: 'M5RecognitionLayer',
        note: 'the M5 recognition surface (26.11), reads-only on the M4 composed handle'
    }),
    grounding: Object.freeze({
        file: 'engine/PersonalRecognitionEngine.tsx',
        symbol: 'M0VirtueWitnessPanel',
        note: 'the M0 R-virtue witness under-layer (Track 21 / 19.6 Verifier reading)'
    }),
    'composition-ambient': Object.freeze({
        file: 'panes/HomePane.tsx',
        symbol: 'TimeAxisSwitcher',
        note: "the three-mode time-axis control (25.17), mounted above the engine by HomePane — the personalHome case's component since 52.T5 gave Home the subsystems-grid toggle"
    }),
    'composition-status': Object.freeze({
        file: 'panes/NaraCanvasEditor.tsx',
        symbol: 'privacyChrome',
        note: 'the per-surface privacy-class tint (25.18) worn by the M4 surfaces this composition mounts'
    })
} as const);

/**
 * Slots that are owned but cannot render yet. The id must be a REGISTERED
 * composition blocker (`integratedReadinessEnvelope.ts`), which carries its
 * owning track and human reason; `personalComposition.test.ts` refuses an id
 * that is not in that registry.
 */
export const PERSONAL_SLOT_BLOCKERS: Readonly<Partial<Record<PersonalGeometricSlotName, string>>> =
    Object.freeze({
        // The id comes from the 29.5 registry, not from here. This shipped as
        // `pending-psychoid-cymatic-renderer` — an id invented at the call site
        // that named nothing; the ledger-parity law is what caught it.
        'center-composition': 'pending-psychoid-cymatic-solver'
    });

/**
 * The personal composition, as it is actually mounted.
 *
 * Owners follow the 29.3 spec: left and center to m4-nara, right to m5-epii,
 * grounding to m0-anuttara, and the two chrome slots to m4-nara — which is
 * where they land in this carrier, since 25.15's kairos wheel was absorbed by
 * the cosmic face and 25.16's Mercurius chip by the daily face (both DR-FACE-7
 * fate-A carries), and neither renders on the personal pole.
 *
 * HANDLE CLASSES ARE THE POINT. Each is the narrowest class that still lets the
 * slot do its work, and every one of them is a refusal of the shortcut sitting
 * next to it:
 *
 *   left    `opaque-handle`  — the composition passes a vault PATH; the canvas
 *                              editor reads the day's body from S1 itself. The
 *                              journal text never crosses the composition, so
 *                              this is NOT `plaintext-journal`.
 *   center  `psychoid-renderer-handle` — the renderer will receive an opaque
 *                              handle, never the composed quaternion, so this
 *                              is NOT `raw-quaternion`.
 *   right   `recognition-surface` — reads M4's composed handle and M3's
 *                              codon export, both reads-only.
 *   ground  `r-virtue-witness` — a 9-bit witness vector, not an episode body.
 *   chrome  `visual-state`    — a mode and a tint; no personal body at all.
 */
export const PERSONAL_COMPOSITION_CONTRIBUTORS: readonly CompositionContributor[] = Object.freeze([
    Object.freeze({
        extensionId: 'm4-nara',
        geometricClaim: Object.freeze({
            extensionId: 'm4-nara',
            geometricSlot: 'left-composition',
            priority: 0,
            handleClass: 'opaque-handle',
            privacyClass: 'protected-local',
            reason: 'the day canvas reads the protected vault path itself; the composition carries the path, never the body'
        })
    }),
    Object.freeze({
        extensionId: 'm4-nara',
        geometricClaim: Object.freeze({
            extensionId: 'm4-nara',
            geometricSlot: 'center-composition',
            priority: 1,
            handleClass: 'psychoid-renderer-handle',
            privacyClass: 'protected-local',
            reason: 'the personal cymatic field renders from an opaque renderer handle (25.6, pending)'
        })
    }),
    Object.freeze({
        extensionId: 'm5-epii',
        geometricClaim: Object.freeze({
            extensionId: 'm5-epii',
            geometricSlot: 'right-composition',
            priority: 2,
            handleClass: 'recognition-surface',
            privacyClass: 'public-safe-summary',
            reason: 'the recognition layer reads the M4 composed handle and the M3 codon export, both reads-only'
        })
    }),
    Object.freeze({
        extensionId: 'm0-anuttara',
        geometricClaim: Object.freeze({
            extensionId: 'm0-anuttara',
            geometricSlot: 'grounding',
            priority: 3,
            handleClass: 'r-virtue-witness',
            privacyClass: 'public-safe-summary',
            reason: 'the 9-bit R-virtue witness vector as the under-layer, per the 19.6 Verifier reading'
        })
    }),
    Object.freeze({
        extensionId: 'm4-nara',
        geometricClaim: Object.freeze({
            extensionId: 'm4-nara',
            geometricSlot: 'composition-ambient',
            priority: 4,
            handleClass: 'visual-state',
            privacyClass: 'public-safe-summary',
            reason: 'the time-axis mode is a reading selector; it carries no personal body'
        })
    }),
    Object.freeze({
        extensionId: 'm4-nara',
        geometricClaim: Object.freeze({
            extensionId: 'm4-nara',
            geometricSlot: 'composition-status',
            priority: 5,
            handleClass: 'visual-state',
            privacyClass: 'public-safe-summary',
            reason: 'the privacy-class tint states WHICH KIND of material a slot shows; it shows none itself'
        })
    })
] as readonly CompositionContributor[]);

/**
 * Run the declared personal composition through the real load-time law.
 *
 * Kept as a function rather than a computed constant so a caller can load a
 * modified contributor set — a blocked contributor, a test's raw-body leak —
 * through exactly the same path the app uses.
 */
export function loadPersonalComposition(
    contributors: readonly CompositionContributor[] = PERSONAL_COMPOSITION_CONTRIBUTORS,
    profile: KernelBridgeCachedProfile | null = null
): LoadCompositionResult {
    return loadComposition('jiva-siva.integrated', contributors, profile);
}

/** The owned-but-unrenderable slots, as `slot:blocker-id` pairs. */
export function blockedPersonalSlots(): readonly string[] {
    return Object.freeze(
        Object.entries(PERSONAL_SLOT_BLOCKERS).map(([slot, blocker]) => `${slot}:${blocker}`)
    );
}

/**
 * A one-line, human-legible statement of the load outcome for the composition
 * chrome. A rejection NAMES the contributor and the reason — a composition that
 * failed to mount must never read as an empty one.
 */
export function describePersonalCompositionLoad(result: LoadCompositionResult): string {
    if (!result.ok) {
        const first = result.rejection.rejections[0];
        return `composition refused: ${first.reason} (${first.extensionId})`;
    }
    const owners = result.mounted.grantedGeometricClaims
        .map(granted => `${granted.geometricSlot}=${granted.extensionId}`)
        .join(' ');
    const blocked = blockedPersonalSlots();
    return blocked.length === 0
        ? `composed: ${owners}`
        : `composed: ${owners} · blocked: ${blocked.join(' ')}`;
}
