/**
 * 29.T29.5 — the typed IntegratedReadiness envelope and its ledger-parity law.
 *
 * The parity law is the point. A blocker id is a promise that something real is
 * missing and that a named track will land it; an id naming nothing renders as
 * an honest pending state while pointing at no work. These tests refuse:
 * marker-backed ids whose marker is absent from the Wave-A register, contributor
 * -backed ids naming an unregistered slot, and — the one that caught a real
 * defect — any id a composition declaration uses that is not registered at all.
 */

import { describe, expect, it } from 'vitest';

import { WAVE_A_PENDING_MARKERS } from '../engine/integratedReadiness';
import { COSMIC_COMPOSITION_CONTRIBUTORS } from './cosmicComposition';
import { GEOMETRIC_SLOTS } from './geometricSlotEnforcement';
import {
    blockerSpec,
    buildIntegratedReadiness,
    COMPOSITION_BLOCKERS
} from './integratedReadinessEnvelope';
import { PERSONAL_COMPOSITION_CONTRIBUTORS, PERSONAL_SLOT_BLOCKERS } from './personalComposition';

const MARKER_NAMES = new Set(WAVE_A_PENDING_MARKERS.map(marker => marker.marker));

function profileWith(fields: Record<string, unknown>) {
    return {
        generation: 1,
        cachedAtMs: 1000,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'public-current-context',
        profile: { harmonicProfile: fields }
    } as never;
}

/** Every Wave-A field the cosmic composition reads, present. */
const FULL_PROFILE = profileWith({
    kleinFlip: false,
    resonance72Index: 36,
    audioOctet: [220, 247, 262, 294, 330, 349, 392, 440],
    nodalQuartet: [{ qlPosition: 0, helix: 'a', m: 1, n: 2 }]
});

describe('ledger parity — every blocker id is backed by something real', () => {
    it('backs each marker-backed id with a marker the Wave-A register declares', () => {
        const markerBacked = COMPOSITION_BLOCKERS.filter(s => s.backedBy.kind === 'wave-a-marker');
        expect(markerBacked.length).toBeGreaterThan(0);
        for (const spec of markerBacked) {
            const marker = spec.backedBy.kind === 'wave-a-marker' ? spec.backedBy.marker : null;
            expect(
                MARKER_NAMES.has(marker as never),
                `blocker '${spec.id}' names marker '${marker}', absent from WAVE_A_PENDING_MARKERS`
            ).toBe(true);
        }
    });

    it('backs each contributor-backed id with a registered geometric slot', () => {
        const contributorBacked = COMPOSITION_BLOCKERS.filter(
            s => s.backedBy.kind === 'pending-contributor'
        );
        expect(contributorBacked.length).toBeGreaterThan(0);
        for (const spec of contributorBacked) {
            const slot = spec.backedBy.kind === 'pending-contributor' ? spec.backedBy.slot : null;
            expect(
                GEOMETRIC_SLOTS,
                `blocker '${spec.id}' names slot '${slot}', which is not a geometric slot`
            ).toContain(slot as never);
        }
    });

    it('gives every blocker a named owning track and a human reason', () => {
        for (const spec of COMPOSITION_BLOCKERS) {
            expect(spec.ownerTrack.trim().length, `${spec.id} has no owning track`).toBeGreaterThan(0);
            expect(spec.humanReason.trim().length, `${spec.id} has no reason`).toBeGreaterThan(0);
            expect(spec.compositions.length, `${spec.id} belongs to no composition`).toBeGreaterThan(0);
        }
    });

    it('registers each id exactly once', () => {
        const ids = COMPOSITION_BLOCKERS.map(s => s.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    // ── the check that caught a real defect ───────────────────────────────

    it('REFUSES a blocker id a composition uses but the registry does not know', () => {
        // 29.T29.3 shipped `pending-psychoid-cymatic-renderer`, invented at the
        // call site. Nothing could tell, because no registry existed to tell it
        // against. This is that registry.
        for (const [slot, id] of Object.entries(PERSONAL_SLOT_BLOCKERS)) {
            const spec = blockerSpec(id as string);
            expect(spec, `slot '${slot}' declares unregistered blocker id '${id}'`).not.toBeNull();
            expect(spec?.compositions).toContain('jiva-siva.integrated');
        }
    });

    it('returns null for an unregistered id rather than inventing a spec', () => {
        expect(blockerSpec('pending-psychoid-cymatic-renderer')).toBeNull();
        expect(blockerSpec('pending-nothing-at-all')).toBeNull();
    });
});

describe('the envelope reads one composition', () => {
    it('reports every cosmic slot ready when owners and fields are present', () => {
        const envelope = buildIntegratedReadiness(
            'cosmic-engine.integrated',
            // grounding is optional in cosmic; give it an owner so the reading
            // is about fields, not absence.
            [
                ...COSMIC_COMPOSITION_CONTRIBUTORS,
                {
                    extensionId: 'm0-anuttara',
                    geometricClaim: {
                        extensionId: 'm0-anuttara',
                        geometricSlot: 'grounding',
                        priority: 3,
                        handleClass: 'r-virtue-witness'
                    }
                }
            ],
            FULL_PROFILE
        );
        expect(envelope.overall).toBe('ready');
        expect(envelope.compositionBlockers).toEqual([]);
        expect(envelope.perGeometricSlot.map(s => s.geometricSlot)).toEqual([
            'surface',
            'texture',
            'cell-state',
            'grounding'
        ]);
    });

    it('names the pending contributor when a slot has no owner', () => {
        // Cosmic declares no grounding owner, which is the spec's "optional in
        // cosmic — backdrop only" case.
        const envelope = buildIntegratedReadiness(
            'cosmic-engine.integrated',
            COSMIC_COMPOSITION_CONTRIBUTORS,
            FULL_PROFILE
        );
        expect(envelope.overall).toBe('pending');
        const grounding = envelope.perGeometricSlot.find(s => s.geometricSlot === 'grounding');
        expect(grounding?.slotState).toBe('pending-contributor');
        expect(grounding?.ownerId).toBeNull();
    });

    it('propagates an absent transported field to its blocker id', () => {
        // The spec's own acceptance: toggling klein_flip absence must surface
        // the matching compositionBlockers[].id.
        const withoutKlein = profileWith({
            resonance72Index: 36,
            audioOctet: [220, 247, 262, 294, 330, 349, 392, 440],
            nodalQuartet: [{ qlPosition: 0, helix: 'a', m: 1, n: 2 }]
        });
        const envelope = buildIntegratedReadiness(
            'cosmic-engine.integrated',
            COSMIC_COMPOSITION_CONTRIBUTORS,
            withoutKlein
        );
        const ids = envelope.compositionBlockers.map(s => s.id);
        expect(ids).toContain('pending-klein-flip');
        expect(ids).not.toContain('pending-resonance72');
        const surface = envelope.perGeometricSlot.find(s => s.geometricSlot === 'surface');
        expect(surface?.slotState).toBe('blocked');
        expect(envelope.overall).toBe('blocked');
    });

    it('carries the owning track with the blocker, so the reader knows who lands it', () => {
        const envelope = buildIntegratedReadiness(
            'cosmic-engine.integrated',
            COSMIC_COMPOSITION_CONTRIBUTORS,
            profileWith({})
        );
        const klein = envelope.compositionBlockers.find(s => s.id === 'pending-klein-flip');
        expect(klein?.ownerTrack).toContain('02.2');
        expect(klein?.humanReason.length).toBeGreaterThan(0);
    });

    it('reads the personal composition over its own six slots', () => {
        const envelope = buildIntegratedReadiness(
            'jiva-siva.integrated',
            PERSONAL_COMPOSITION_CONTRIBUTORS,
            FULL_PROFILE
        );
        expect(envelope.compositionId).toBe('jiva-siva.integrated');
        expect(envelope.perGeometricSlot).toHaveLength(6);
        // Every personal slot has a declared owner (29.3), so nothing is
        // pending-contributor even though the centre renderer is unbuilt —
        // ownership and renderability are different facts.
        for (const slot of envelope.perGeometricSlot) {
            expect(slot.ownerId, `${slot.geometricSlot} has no owner`).not.toBeNull();
        }
        expect(envelope.overall).toBe('ready');
    });

    it('scopes blockers to the composition that can report them', () => {
        const cosmic = buildIntegratedReadiness(
            'cosmic-engine.integrated',
            [],
            FULL_PROFILE
        ).compositionBlockers.map(s => s.id);
        const personal = buildIntegratedReadiness(
            'jiva-siva.integrated',
            [],
            FULL_PROFILE
        ).compositionBlockers.map(s => s.id);
        expect(cosmic).toContain('pending-k2-surface');
        expect(cosmic).not.toContain('pending-recognition-surface');
        expect(personal).toContain('pending-recognition-surface');
        expect(personal).not.toContain('pending-k2-surface');
    });
});
