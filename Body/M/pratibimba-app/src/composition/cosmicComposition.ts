/**
 * Coordinate: M'/29 :: cosmic 1-2-3 composition — the declared slot ownership
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #2 — the composed cosmic surface
 * Actualises: 29.T29.2 (cosmic 1-2-3 composition geometry), DR-WC-IP-2
 *   (composition-over-juxtaposition; status ROUTED, ratified by building).
 * Public surface: COSMIC_SLOT_CARRIER_IDS, COSMIC_COMPOSITION_CONTRIBUTORS,
 *   loadCosmicComposition, describeCosmicCompositionLoad.
 * Does NOT own: the geometric-slot law (`geometricSlotEnforcement.ts` — which
 *   also owns `ownerOfSlot`, since it reads that module's own result type and
 *   the personal declaration reports through it too), the render
 *   (`engine/CosmicEngine.tsx`), or any contributor's own geometry.
 *
 * # Why this file exists
 *
 * `geometricSlotEnforcement.ts` already carries the whole slot-ownership law —
 * the cosmic slots, the reads-only rule on `texture`/`cell-state`, the
 * protected-local boundary, and `compositionLoad()`. It had NO production
 * caller: the only file in the repo that referenced it was its own test, which
 * constructed a cosmic composition that nothing in the app ever declared.
 *
 * So the cosmic surface rendered its K² torus, its cymatic skin and its codon
 * annulus without any of them claiming a slot. Nothing asserted that the
 * texture belongs to M2 and the cell-state to M3; nothing could have caught a
 * second contributor quietly taking the surface. The law was reachable only
 * from a test — which is the same defect shape as an event that is declared and
 * never emitted.
 *
 * This is the declaration. The three mounts that `CosmicEngine` actually
 * renders are stated here as contributors with their geometric claims, and run
 * through the real `compositionLoad()`.
 *
 * # The claims are the render, not an aspiration
 *
 * Each contributor below corresponds to a carrier that `CosmicEngine.tsx`
 * genuinely registers on the modulation graph:
 *
 *   `surface`    <- `carrierId('k2-torus')`      layer `L0-base`
 *   `texture`    <- `carrierId('cymatic-skin')`  layer `L1-cymatic`, surface `torus`
 *   `cell-state` <- `carrierId('codon-annulus')` layer `L2-codon`
 *
 * If a carrier is renamed or removed without updating this file, the parity
 * test fails — the declaration is not allowed to describe a composition that is
 * not on screen.
 */

import {
    compositionLoad,
    type CompositionContributor,
    type CompositionLoadResult
} from './geometricSlotEnforcement';

/** The modulation-carrier id each geometric slot is rendered by. */
export const COSMIC_SLOT_CARRIER_IDS = Object.freeze({
    surface: 'k2-torus',
    texture: 'cymatic-skin',
    'cell-state': 'codon-annulus'
} as const);

/**
 * The cosmic composition, as it is actually mounted.
 *
 * Owners follow the 29.2 spec exactly: the K² surface is M1's played torus,
 * the texture is M2 Parashakti's cymatic mount, the cell-state is M3
 * Mahamaya's codon-rotation export. Both M2 and M3 land on reads-only slots
 * with reads-only handle classes — they parameterise the surface, they never
 * write back into it.
 *
 * `priority` is declaration order and carries no arbitration meaning here:
 * one owner per slot is enforced, so there is nothing to arbitrate.
 */
export const COSMIC_COMPOSITION_CONTRIBUTORS: readonly CompositionContributor[] = Object.freeze([
    Object.freeze({
        extensionId: 'm1-paramasiva-played-torus',
        geometricClaim: Object.freeze({
            extensionId: 'm1-paramasiva-played-torus',
            geometricSlot: 'surface',
            priority: 0,
            handleClass: 'k2-surface-handle',
            reason: 'the K² torus is the composed surface; everything else parameterises it'
        })
    }),
    Object.freeze({
        extensionId: 'm2-parashakti',
        geometricClaim: Object.freeze({
            extensionId: 'm2-parashakti',
            geometricSlot: 'texture',
            priority: 1,
            handleClass: 'cymatic-mount-point',
            reason: 'the cymatic skin renders ON the K² surface, reads-only (DR-IG-5)'
        })
    }),
    Object.freeze({
        extensionId: 'm3-mahamaya',
        geometricClaim: Object.freeze({
            extensionId: 'm3-mahamaya',
            geometricSlot: 'cell-state',
            priority: 2,
            handleClass: 'codon-rotation-export',
            reason: 'codon rotation projects onto the lens-ring cells, reads-only'
        })
    })
] as readonly CompositionContributor[]);

/**
 * Run the declared cosmic composition through the real load-time law.
 *
 * Kept as a function rather than a computed constant so a caller can load a
 * modified contributor set (a blocked contributor, a test's contested claim)
 * through exactly the same path the app uses.
 */
export function loadCosmicComposition(
    contributors: readonly CompositionContributor[] = COSMIC_COMPOSITION_CONTRIBUTORS
): CompositionLoadResult {
    return compositionLoad(contributors);
}

/**
 * A one-line, human-legible statement of the load outcome for the composition
 * chrome. A rejection NAMES the contributor and the reason — a composition that
 * failed to mount must never read as an empty one.
 */
export function describeCosmicCompositionLoad(result: CompositionLoadResult): string {
    if (!result.mounted) {
        return `composition refused: ${result.rejection.reason} (${result.rejection.contributorId})`;
    }
    const owners = result.composition.grantedGeometricClaims
        .map(granted => `${granted.geometricSlot}=${granted.extensionId}`)
        .join(' ');
    return `composed: ${owners}`;
}
