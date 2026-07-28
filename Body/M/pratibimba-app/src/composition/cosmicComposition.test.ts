/**
 * 29.T29.2 — the cosmic composition declares its slot ownership, and the law
 * that governs it finally has a production caller.
 *
 * The gap this closes, precisely: `geometricSlotEnforcement.ts` carried the
 * whole slot-ownership law — cosmic slots, the reads-only rule, the
 * protected-local boundary, `compositionLoad()` — and the ONLY file in the repo
 * that referenced it was its own test. That test even constructed a cosmic
 * composition, which nothing in the app ever declared. The surface rendered its
 * K² torus, cymatic skin and codon annulus with none of them claiming a slot.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
    COSMIC_COMPOSITION_CONTRIBUTORS,
    COSMIC_SLOT_CARRIER_IDS,
    describeCosmicCompositionLoad,
    loadCosmicComposition
} from './cosmicComposition';
import { ownerOfMountedSlot } from './compositionLoad';
import {
    COSMIC_GEOMETRIC_SLOTS,
    READS_ONLY_GEOMETRIC_SLOTS,
    type CompositionContributor
} from './geometricSlotEnforcement';

describe('cosmic composition slot ownership (29.T29.2 / DR-WC-IP-2)', () => {
    it('mounts with one named owner per cosmic slot', () => {
        const result = loadCosmicComposition();
        expect(result.ok).toBe(true);
        expect(ownerOfMountedSlot(result, 'surface')).toBe('m1-paramasiva-played-torus');
        expect(ownerOfMountedSlot(result, 'texture')).toBe('m2-parashakti');
        expect(ownerOfMountedSlot(result, 'cell-state')).toBe('m3-mahamaya');
    });

    it('claims only registered cosmic slots, never a personal one', () => {
        for (const contributor of COSMIC_COMPOSITION_CONTRIBUTORS) {
            const slot = contributor.geometricClaim?.geometricSlot;
            expect(slot).toBeDefined();
            expect(COSMIC_GEOMETRIC_SLOTS).toContain(slot as never);
        }
    });

    it('puts M2 and M3 on reads-only slots — they parameterise, never write back', () => {
        const byOwner = new Map(
            COSMIC_COMPOSITION_CONTRIBUTORS.map(c => [c.extensionId, c.geometricClaim])
        );
        for (const owner of ['m2-parashakti', 'm3-mahamaya']) {
            const slot = byOwner.get(owner)?.geometricSlot as string;
            expect(READS_ONLY_GEOMETRIC_SLOTS).toContain(slot as never);
        }
        // The surface itself is NOT reads-only: it is the thing being written.
        expect(READS_ONLY_GEOMETRIC_SLOTS).not.toContain('surface' as never);
    });

    it('describes a mounted composition by its owners', () => {
        const text = describeCosmicCompositionLoad(loadCosmicComposition());
        expect(text).toContain('surface=m1-paramasiva-played-torus');
        expect(text).toContain('texture=m2-parashakti');
        expect(text).toContain('cell-state=m3-mahamaya');
    });

    // ── the contested-slot law ────────────────────────────────────────────

    it('REFUSES a second claimant on an occupied slot, naming it', () => {
        // Two owners on one slot is the three-stack overlay this composition
        // replaces: whichever drew last would win silently.
        const intruder: CompositionContributor = {
            extensionId: 'm5-epii-overlay',
            geometricClaim: {
                extensionId: 'm5-epii-overlay',
                geometricSlot: 'surface',
                priority: 9,
                handleClass: 'k2-surface-handle'
            }
        };
        const result = loadCosmicComposition([...COSMIC_COMPOSITION_CONTRIBUTORS, intruder]);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.rejection.rejections[0].reason).toBe('contested-geometric-slot');
            // The SECOND claimant is named; the first is the incumbent.
            expect(result.rejection.rejections[0].extensionId).toBe('m5-epii-overlay');
        }
    });

    it('names the refusal in the chrome text rather than reading as empty', () => {
        const intruder: CompositionContributor = {
            extensionId: 'm5-epii-overlay',
            geometricClaim: {
                extensionId: 'm5-epii-overlay',
                geometricSlot: 'texture',
                priority: 9,
                handleClass: 'cymatic-mount-point'
            }
        };
        const result = loadCosmicComposition([...COSMIC_COMPOSITION_CONTRIBUTORS, intruder]);
        const text = describeCosmicCompositionLoad(result);
        expect(text).toContain('composition refused');
        expect(text).toContain('contested-geometric-slot');
        expect(text).toContain('m5-epii-overlay');
        // A refused composition must be distinguishable from an unclaimed slot.
        expect(ownerOfMountedSlot(result, 'surface')).toBe('unmounted');
    });

    it('still refuses a write-back on a reads-only slot through this path', () => {
        // The existing boundary law must remain reachable from the production
        // loader, not only from the enforcement module's own test.
        const writeBack: CompositionContributor = {
            extensionId: 'm2-parashakti',
            geometricClaim: {
                extensionId: 'm2-parashakti',
                geometricSlot: 'cell-state',
                priority: 1,
                handleClass: 'k2-surface-handle'
            }
        };
        const result = loadCosmicComposition([writeBack]);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.rejection.rejections[0].reason).toBe('contribution-declares-write-back-on-reads-only-slot');
        }
    });

    // ── the declaration must describe what actually renders ───────────────

    it('every declared slot maps to a modulation carrier CosmicEngine registers', () => {
        // The declaration is not allowed to describe a composition that is not
        // on screen. If a carrier is renamed or dropped, this fails.
        const engine = readFileSync(join(__dirname, '..', 'engine', 'CosmicEngine.tsx'), 'utf8');
        for (const [slot, carrier] of Object.entries(COSMIC_SLOT_CARRIER_IDS)) {
            expect(
                engine.includes(`carrierId('${carrier}')`),
                `slot '${slot}' declares carrier '${carrier}', which CosmicEngine does not register`
            ).toBe(true);
        }
    });

});
