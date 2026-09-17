// @vitest-environment node
/**
 * 29.T29.16 — the Inhabited Bimba read law. Covered (the brief's own list,
 * carrier-side): the visual-law fixture across Mono / Poly / ActualisingOne /
 * MonoPoly states; the 18.10 stale-generation drop; the four readiness
 * blockers firing on their REAL conditions; the canon boundary (`s2Mutated`
 * repeated verbatim, never overridden — composition writes no graph canon);
 * and the graphiti source guard in BOTH directions (handles survive, prose
 * cannot).
 */

import { describe, expect, it } from 'vitest';
import {
    beingPatternFixture,
    beingPatternStreamFixture
} from '../panes/beingPattern/beingPatternProjection';
import {
    INHABITED_BIMBA_BLOCKER_IDS,
    guardGraphitiRefs,
    readInhabitedBimba
} from './inhabitedBimba';

const PASU_HANDLE = { entityId: 'user-being', privacy: 'protected-reference-only' };

describe('29.T29.16 — visual law', () => {
    it('classifies the four specced states: the many as many, contour, warning, held one', () => {
        const stream = beingPatternStreamFixture([
            beingPatternFixture({ entityId: 'poly-being', monopolyOperator: 'Poly' }),
            beingPatternFixture({ entityId: 'many-being', monopolyOperator: 'ActuallyMany' }),
            beingPatternFixture({ entityId: 'maybe-one', monopolyOperator: 'PotentiallyOne' }),
            beingPatternFixture({
                entityId: 'forcing-one',
                monopolyOperator: 'ActualisingOne',
                reviewRisk: 'forced-unification'
            }),
            beingPatternFixture({ entityId: 'held-one', monopolyOperator: 'MonoPoly' })
        ]);
        const read = readInhabitedBimba(stream, null, PASU_HANDLE);
        expect(read.state).toBe('read');
        const lawById = new Map(read.markers.map(m => [m.entityId, m.law]));
        expect(lawById.get('poly-being')).toBe('many');
        expect(lawById.get('many-being')).toBe('many');
        expect(lawById.get('maybe-one')).toBe('suggested-contour');
        expect(lawById.get('forcing-one')).toBe('review-warning');
        expect(lawById.get('held-one')).toBe('held-one');
        // The many render as MANY — five markers, never one symbolic object.
        expect(read.markers.length).toBe(5);
        // The warning carries its review risk on the marker.
        expect(read.markers.find(m => m.entityId === 'forcing-one')?.reviewRisk).toBe(
            'forced-unification'
        );
    });

    it('repeats the producer honesty strings verbatim — empty roster says so', () => {
        const empty = readInhabitedBimba(beingPatternStreamFixture([]), null, PASU_HANDLE);
        expect(empty.state).toBe('read');
        expect(empty.markers).toEqual([]);
        expect(empty.source).toBe('live-producer (no entity observed yet)');
    });
});

describe('29.T29.16 — the 18.10 consumption law', () => {
    it('drops a stale generation instead of rewinding the field', () => {
        const stale = readInhabitedBimba(
            beingPatternStreamFixture([beingPatternFixture()], { generation: 4 }),
            9,
            PASU_HANDLE
        );
        expect(stale.state).toBe('pending');
        expect(stale.reason).toContain('stale generation 4 < 9');
        expect(stale.markers).toEqual([]);
    });

    it('accepts the same-or-newer generation', () => {
        const same = readInhabitedBimba(
            beingPatternStreamFixture([beingPatternFixture()], { generation: 9 }),
            9,
            PASU_HANDLE
        );
        expect(same.state).toBe('read');
        expect(same.generation).toBe(9);
    });
});

describe('29.T29.16 — the four readiness blockers', () => {
    it('declares exactly the four brief-named ids', () => {
        expect([...INHABITED_BIMBA_BLOCKER_IDS]).toEqual([
            'pending-pasu-being-pattern',
            'pending-spacetime-live-state',
            'pending-monopoly-operator',
            'pending-perspective-role'
        ]);
    });

    it('pending-pasu-being-pattern fires when the 18.10 profile handle is absent', () => {
        const read = readInhabitedBimba(beingPatternStreamFixture(), null, null);
        expect(read.blockers).toContain('pending-pasu-being-pattern');
        // …and the field still renders — blocked is not hidden (24.9 law).
        expect(read.state).toBe('read');
        expect(read.markers.length).toBe(1);
    });

    it('pending-spacetime-live-state fires when the stream carries no delta key', () => {
        const stream = beingPatternStreamFixture();
        (stream as Record<string, unknown>).streamDeltaKey = null;
        const read = readInhabitedBimba(stream, null, PASU_HANDLE);
        expect(read.blockers).toContain('pending-spacetime-live-state');
    });

    it('the operator/role blockers ride the ONE parser refusal, never a defaulted read', () => {
        const badOperator = beingPatternStreamFixture([
            { ...beingPatternFixture(), monopolyOperator: 'SomethingElse' }
        ]);
        const read = readInhabitedBimba(badOperator, null, PASU_HANDLE);
        expect(read.state).toBe('refused');
        expect(read.blockers).toContain('pending-monopoly-operator');
        expect(read.markers).toEqual([]);
    });
});

describe('29.T29.16 — canon boundary', () => {
    it('repeats s2Mutated verbatim and never rewrites it', () => {
        const read = readInhabitedBimba(beingPatternStreamFixture(), null, PASU_HANDLE);
        expect(read.s2Mutated).toBe(false);
        const mutated = beingPatternStreamFixture();
        (mutated as Record<string, unknown>).s2Mutated = true;
        // A producer CLAIMING mutation is surfaced as said — the reader is a
        // witness, not a laundering layer. (The producer's own tests pin it
        // false; this asserts the READER cannot hide a violation.)
        expect(readInhabitedBimba(mutated, null, PASU_HANDLE).s2Mutated).toBe(true);
    });
});

describe('29.T29.16 — graphiti source guard', () => {
    it('keeps handle-shaped refs and drops prose in both directions', () => {
        const guarded = guardGraphitiRefs([
            'graphiti://episode/abc123',
            's2:identity:user-being',
            'the user dreamt of a spiral staircase last night', // prose — never
            '',
            42,
            null,
            'x'.repeat(300)
        ]);
        expect(guarded).toEqual(['graphiti://episode/abc123', 's2:identity:user-being']);
    });
});
