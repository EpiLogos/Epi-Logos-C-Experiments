/**
 * Coordinate: M'/29 :: the typed IntegratedReadiness envelope (29.T29.5)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #5 — Integration; one readiness reading per composition
 * Actualises: 29.T29.5 — the composition's readiness as a TYPED envelope
 *   (per-slot state + named blockers), and the ledger-parity law that keeps its
 *   blocker vocabulary honest. Closes 11.8's composition half.
 * Public surface: CompositionBlockerId, CompositionBlockerSpec,
 *   COMPOSITION_BLOCKERS, blockerSpec, GeometricSlotReadiness,
 *   IntegratedReadinessEnvelope, buildIntegratedReadiness.
 * Does NOT own: the Wave-A marker register (`engine/integratedReadiness.ts` —
 *   THE field-backed ledger port, with the carrier-real profile paths), the
 *   slot law (`geometricSlotEnforcement.ts`), or either composition's
 *   declaration.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.5.
 *
 * # The law this file exists for
 *
 * A blocker id is a promise that something real is missing and that a named
 * track will land it. An id naming nothing is worse than no blocker at all: it
 * renders as an honest pending state while pointing at no work. So every id
 * here declares what BACKS it —
 *
 *   `wave-a-marker`      the field is transported (or not) by the kernel, and
 *                        the marker carries the carrier-real profile paths;
 *   `pending-contributor` a geometric slot whose owner has not landed yet.
 *
 * `integratedReadinessEnvelope.test.ts` refuses a marker-backed id whose marker
 * is absent from `WAVE_A_PENDING_MARKERS`, a contributor-backed id whose slot
 * is not a registered geometric slot, and — the one that actually caught a
 * defect — any blocker id used by a composition declaration that is not
 * registered here. 29.T29.3 shipped `pending-psychoid-cymatic-renderer`, which
 * this vocabulary spells `pending-psychoid-cymatic-solver`; the id was invented
 * at the call site and nothing could tell.
 */

import {
    WAVE_A_PENDING_MARKERS,
    type WaveAMarkerName
} from '../engine/integratedReadiness';
import {
    COSMIC_GEOMETRIC_SLOTS,
    PERSONAL_GEOMETRIC_SLOTS,
    type CompositionContributor,
    type IntegratedGeometricSlot
} from './geometricSlotEnforcement';
import type { KernelBridgeCachedProfile } from '../bridge/types';

export type IntegratedCompositionId = 'cosmic-engine.integrated' | 'jiva-siva.integrated';

/** The composition blocker vocabulary (29.5). Fixed: an id outside this set is
 *  a typo or an invention, and the parity test says so. */
export type CompositionBlockerId =
    | 'pending-k2-surface'
    | 'pending-cymatic-mount-point'
    | 'pending-codon-rotation-export'
    | 'pending-ananda-vortex'
    | 'pending-psychoid-cymatic-solver'
    | 'pending-recognition-surface'
    | 'pending-q-composed'
    | 'pending-virtue-witness'
    | 'pending-kairos-populator'
    | 'pending-klein-flip'
    | 'pending-resonance72'
    | 'pending-audio-octet'
    | 'pending-nodal-quartet';

/** What makes a blocker id real — checked, not asserted. */
export type BlockerBacking =
    | { readonly kind: 'wave-a-marker'; readonly marker: WaveAMarkerName }
    | { readonly kind: 'pending-contributor'; readonly slot: IntegratedGeometricSlot };

export interface CompositionBlockerSpec {
    readonly id: CompositionBlockerId;
    /** The track that lands it — quoted from the owning tranche, not guessed. */
    readonly ownerTrack: string;
    readonly humanReason: string;
    readonly backedBy: BlockerBacking;
    /** Which compositions can report it. */
    readonly compositions: readonly IntegratedCompositionId[];
}

const COSMIC: readonly IntegratedCompositionId[] = Object.freeze(['cosmic-engine.integrated']);
const PERSONAL: readonly IntegratedCompositionId[] = Object.freeze(['jiva-siva.integrated']);
const BOTH: readonly IntegratedCompositionId[] = Object.freeze([
    'cosmic-engine.integrated',
    'jiva-siva.integrated'
]);

export const COMPOSITION_BLOCKERS: readonly CompositionBlockerSpec[] = Object.freeze([
    // ── cosmic 1-2-3 contributors (29.2 "Declared blockers") ──────────────
    Object.freeze({
        id: 'pending-k2-surface' as const,
        ownerTrack: 'Track 22.2 played-torus',
        humanReason: 'the K² surface has no owner mounted, so there is nothing to texture',
        backedBy: Object.freeze({ kind: 'pending-contributor' as const, slot: 'surface' as const }),
        compositions: COSMIC
    }),
    Object.freeze({
        id: 'pending-cymatic-mount-point' as const,
        ownerTrack: 'Track 23.10 cymatic mount',
        humanReason: 'M2 exposes no composition mount point, so the skin cannot bind to the surface',
        backedBy: Object.freeze({ kind: 'pending-contributor' as const, slot: 'texture' as const }),
        compositions: COSMIC
    }),
    Object.freeze({
        id: 'pending-codon-rotation-export' as const,
        ownerTrack: 'Track 24.13 codon export',
        humanReason: 'M3 exports no codon rotation, so the lens-ring cells carry no cell-state',
        backedBy: Object.freeze({ kind: 'pending-contributor' as const, slot: 'cell-state' as const }),
        compositions: COSMIC
    }),
    Object.freeze({
        id: 'pending-ananda-vortex' as const,
        ownerTrack: 'Track 10.10 ananda_vortex',
        humanReason: 'the vortex matrix families are absent, so the perspex cross-fade has no layers',
        backedBy: Object.freeze({ kind: 'pending-contributor' as const, slot: 'surface' as const }),
        compositions: COSMIC
    }),

    // ── personal 4-5-0 contributors (29.3 "Declared blockers") ────────────
    Object.freeze({
        id: 'pending-psychoid-cymatic-solver' as const,
        ownerTrack: 'Track 5.5 / 25.6 personal cymatic field',
        humanReason: 'no psychoid renderer consumes the DR-IG-6 dipyramid fixture, so the centre slot cannot render',
        backedBy: Object.freeze({
            kind: 'pending-contributor' as const,
            slot: 'center-composition' as const
        }),
        compositions: PERSONAL
    }),
    Object.freeze({
        id: 'pending-recognition-surface' as const,
        ownerTrack: 'Track 26.11 recognition layer',
        humanReason: 'the M5 recognition surface is not mounted on the right slot',
        backedBy: Object.freeze({
            kind: 'pending-contributor' as const,
            slot: 'right-composition' as const
        }),
        compositions: PERSONAL
    }),
    Object.freeze({
        id: 'pending-q-composed' as const,
        ownerTrack: 'Track 25.6 personal renderer',
        humanReason: 'no composed-quaternion handle is on the bus, so no slot can foreground a reading',
        backedBy: Object.freeze({
            kind: 'pending-contributor' as const,
            slot: 'center-composition' as const
        }),
        compositions: PERSONAL
    }),
    Object.freeze({
        id: 'pending-virtue-witness' as const,
        ownerTrack: 'Track 21 Anuttara grounding',
        humanReason: 'the 9-bit R-virtue witness vector is not emitted, so the under-layer lamps stay dim',
        backedBy: Object.freeze({ kind: 'pending-contributor' as const, slot: 'grounding' as const }),
        compositions: PERSONAL
    }),
    Object.freeze({
        id: 'pending-kairos-populator' as const,
        ownerTrack: 'Track 19.12 Mercurius populator',
        humanReason: 'no kairos signal reaches the composition, so the ambient row has no time axis to read',
        backedBy: Object.freeze({
            kind: 'pending-contributor' as const,
            slot: 'composition-ambient' as const
        }),
        compositions: PERSONAL
    }),

    // ── field-backed, straight off the Wave-A ledger port ─────────────────
    Object.freeze({
        id: 'pending-klein-flip' as const,
        ownerTrack: 'M1 02.2 / kernel-bridge 10.2',
        humanReason: 'the klein-flip signal is absent, so no pole can choreograph the 5→6 flip',
        backedBy: Object.freeze({ kind: 'wave-a-marker' as const, marker: 'klein_flip' as const }),
        compositions: BOTH
    }),
    Object.freeze({
        id: 'pending-resonance72' as const,
        ownerTrack: 'kernel-bridge (Track 10 readiness ledger)',
        humanReason: 'the 72-fold resonance index is absent, so shell colour and address are unreadable',
        backedBy: Object.freeze({ kind: 'wave-a-marker' as const, marker: 'resonance72' as const }),
        compositions: BOTH
    }),
    Object.freeze({
        id: 'pending-audio-octet' as const,
        ownerTrack: "M1' performance event 02.4",
        humanReason: 'the 8 antinodal drivers are absent, so the cymatic field has no carriers',
        backedBy: Object.freeze({
            kind: 'wave-a-marker' as const,
            marker: 'audio_octet[8]' as const
        }),
        compositions: BOTH
    }),
    Object.freeze({
        id: 'pending-nodal-quartet' as const,
        ownerTrack: "M1' performance event 02.4",
        humanReason: 'the 4 boundary constraints are absent, so no standing-wave mode is selected',
        backedBy: Object.freeze({
            kind: 'wave-a-marker' as const,
            marker: 'nodal_quartet[4]' as const
        }),
        compositions: BOTH
    })
] as readonly CompositionBlockerSpec[]);

const BY_ID = new Map(COMPOSITION_BLOCKERS.map(spec => [spec.id, spec]));

/** The registered spec for an id, or null — never a fabricated one. */
export function blockerSpec(id: string): CompositionBlockerSpec | null {
    return BY_ID.get(id as CompositionBlockerId) ?? null;
}

export type GeometricSlotState = 'ready' | 'pending-contributor' | 'blocked';

export interface GeometricSlotReadiness {
    readonly geometricSlot: IntegratedGeometricSlot;
    readonly ownerId: string | null;
    readonly slotState: GeometricSlotState;
    /** Blockers attributable to THIS slot, in registry order. */
    readonly blockers: readonly CompositionBlockerId[];
}

export interface IntegratedReadinessEnvelope {
    readonly compositionId: IntegratedCompositionId;
    readonly overall: 'ready' | 'pending' | 'blocked';
    readonly perGeometricSlot: readonly GeometricSlotReadiness[];
    readonly compositionBlockers: readonly CompositionBlockerSpec[];
}

function slotsFor(compositionId: IntegratedCompositionId): readonly IntegratedGeometricSlot[] {
    return compositionId === 'cosmic-engine.integrated'
        ? COSMIC_GEOMETRIC_SLOTS
        : PERSONAL_GEOMETRIC_SLOTS;
}

/** Read a profile path the way every carrier surface does: under
 *  `harmonicProfile` first, then the payload root. */
function profileHas(profile: KernelBridgeCachedProfile | null, path: string): boolean {
    const payload = (profile?.profile ?? null) as Record<string, unknown> | null;
    if (payload === null) return false;
    const roots = [
        (payload as { harmonicProfile?: unknown }).harmonicProfile as Record<string, unknown> | undefined,
        payload
    ];
    for (const root of roots) {
        if (!root) continue;
        let cursor: unknown = root;
        for (const segment of path.split('.')) {
            if (cursor === null || typeof cursor !== 'object') {
                cursor = undefined;
                break;
            }
            cursor = (cursor as Record<string, unknown>)[segment];
        }
        if (cursor !== undefined && cursor !== null) return true;
    }
    return false;
}

/** A field-backed blocker is live when the kernel transported none of the
 *  marker's carrier-real paths. A derivation (`profilePaths: null`) can never
 *  block as missing-field — that is the Wave-A register's own law. */
function fieldBlockerLive(spec: CompositionBlockerSpec, profile: KernelBridgeCachedProfile | null) {
    const backing = spec.backedBy;
    if (backing.kind !== 'wave-a-marker') return false;
    const marker = WAVE_A_PENDING_MARKERS.find(m => m.marker === backing.marker);
    if (!marker || marker.profilePaths === null) return false;
    return !marker.profilePaths.some(path => profileHas(profile, path));
}

/**
 * The composition's readiness as ONE typed reading.
 *
 * A slot with no granted owner reports `pending-contributor` and carries the
 * blockers that name it; a slot whose owner is present but whose fields are
 * absent reports `blocked`. `overall` is the worst slot state, so a caller
 * never has to re-derive it and the two compositions cannot disagree about what
 * "ready" means.
 */
export function buildIntegratedReadiness(
    compositionId: IntegratedCompositionId,
    contributors: readonly CompositionContributor[],
    profile: KernelBridgeCachedProfile | null
): IntegratedReadinessEnvelope {
    const ownerBySlot = new Map<string, string>();
    for (const contributor of contributors) {
        const claim = contributor.geometricClaim;
        if (claim && !ownerBySlot.has(claim.geometricSlot)) {
            ownerBySlot.set(claim.geometricSlot, claim.extensionId);
        }
    }

    const scoped = COMPOSITION_BLOCKERS.filter(spec => spec.compositions.includes(compositionId));
    const liveFieldBlockers = scoped.filter(spec => fieldBlockerLive(spec, profile));

    const perGeometricSlot = slotsFor(compositionId).map(slot => {
        const ownerId = ownerBySlot.get(slot) ?? null;
        const contributorBlockers = scoped.filter(spec => {
            const backing = spec.backedBy;
            return backing.kind === 'pending-contributor' && backing.slot === slot;
        });
        const unowned = ownerId === null;
        // Field blockers land on every slot of the composition: an absent
        // transported field starves whichever pole reads it.
        const blockers = [
            ...(unowned ? contributorBlockers : []),
            ...liveFieldBlockers
        ].map(spec => spec.id);
        const slotState: GeometricSlotState = unowned
            ? 'pending-contributor'
            : liveFieldBlockers.length > 0
                ? 'blocked'
                : 'ready';
        return Object.freeze({
            geometricSlot: slot,
            ownerId,
            slotState,
            blockers: Object.freeze(blockers)
        });
    });

    const overall = perGeometricSlot.some(s => s.slotState === 'blocked')
        ? 'blocked'
        : perGeometricSlot.some(s => s.slotState === 'pending-contributor')
            ? 'pending'
            : 'ready';

    const reported = new Set(perGeometricSlot.flatMap(s => s.blockers));
    return Object.freeze({
        compositionId,
        overall,
        perGeometricSlot: Object.freeze(perGeometricSlot),
        compositionBlockers: Object.freeze(scoped.filter(spec => reported.has(spec.id)))
    });
}
