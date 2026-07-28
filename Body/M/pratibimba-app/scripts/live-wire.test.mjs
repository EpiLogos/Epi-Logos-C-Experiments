// @vitest-environment node
/**
 * Replay-mode tests for the Track-00.T2 live-wire projection harness.
 * The fixture is a REAL capture (dumped by `node scripts/live-wire.mjs` against
 * a spawned gateway) — these tests prove the validator rejects corruption, so
 * a green live run means the bus actually carried the declared projections.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROJECTION_MANIFEST, validateCapture } from './live-wire.mjs';

const FIXTURE_URL = new URL('./__fixtures__/live-wire-capture.json', import.meta.url);

function loadFixture() {
    return JSON.parse(readFileSync(FIXTURE_URL, 'utf8'));
}

function profileFrames(capture) {
    return capture.frames.filter(f => (f.event ?? f.method) === 'profile.update');
}

describe('live-wire projection manifest', () => {
    it('declares the current-basis projections and event channels as required coverage', () => {
        const names = PROJECTION_MANIFEST.map(entry => entry.name);
        for (const required of [
            'profile.strict-parse',
            'profile.graph-revision',
            'phaseSpace',
            'modalResonator',
            'planetDegrees',
            'livePlanets',
            'quintessence',
            'contemplationPromptLut',
            'm0VoidStructureRing',
            'anandaVortex',
            'event:m123.chime'
        ]) {
            expect(names, `manifest must declare ${required}`).toContain(required);
        }
        for (const entry of PROJECTION_MANIFEST) {
            expect(entry.required, `${entry.name} must be required`).toBe(true);
        }
    });

    it('validates the real captured fixture green with full coverage', async () => {
        const report = await validateCapture(loadFixture());
        // Twice on 2026-07-28 a tranche added a REQUIRED projection to the
        // manifest and to the live gateway without refreshing this capture, so
        // the live bus carried it, the replay did not, and app-test went red
        // for every lane. The fix is mechanical, so the message says it.
        expect(
            report.failures,
            'stale replay fixture — a required projection is on the live bus but not in the capture. ' +
                'Re-run `node scripts/live-wire.mjs` against a spawned gateway and copy its capture over ' +
                'scripts/__fixtures__/live-wire-capture.json. A new required projection lands WITH its fixture.'
        ).toEqual([]);
        expect(report.ok).toBe(true);
        const satisfied = report.coverage.filter(c => c.satisfied).map(c => c.name);
        for (const entry of PROJECTION_MANIFEST) {
            expect(satisfied).toContain(entry.name);
        }
    });

    it('rejects a corrupted frame: liveOctet hz diverging from audioOctet', async () => {
        const capture = loadFixture();
        const frame = profileFrames(capture).find(f => f.payload?.harmonicProfile?.modalResonator);
        expect(frame).toBeDefined();
        frame.payload.harmonicProfile.modalResonator.liveOctet[0].hz += 1;
        const report = await validateCapture(capture);
        expect(report.ok).toBe(false);
        expect(report.failures.map(f => f.name)).toContain('modalResonator');
    });

    it('rejects a corrupted frame: unknown field violates the strict profile contract', async () => {
        const capture = loadFixture();
        const frame = profileFrames(capture)[0];
        frame.payload.harmonicProfile.notInTheContract = true;
        const report = await validateCapture(capture);
        expect(report.ok).toBe(false);
        expect(report.failures.map(f => f.name)).toContain('profile.strict-parse');
    });

    it('rejects profile ticks that omit the S2 graph revision', async () => {
        const capture = loadFixture();
        for (const frame of profileFrames(capture)) {
            delete frame.payload.graphRevision;
        }
        const report = await validateCapture(capture);
        expect(report.ok).toBe(false);
        expect(report.failures.map(f => f.name)).toContain('profile.graph-revision');
    });

    it('rejects a capture whose frames never carry a declared projection', async () => {
        const capture = loadFixture();
        for (const frame of profileFrames(capture)) {
            delete frame.payload.harmonicProfile.phaseSpace;
        }
        const report = await validateCapture(capture);
        expect(report.ok).toBe(false);
        expect(report.failures.map(f => f.name)).toContain('phaseSpace');
    });

    it('rejects contemplation prompt drift from the compiled M0 authority', async () => {
        const capture = loadFixture();
        const frame = profileFrames(capture)[0];
        frame.payload.harmonicProfile.contemplationPromptLut[7] = 'renderer-authored prompt';
        const report = await validateCapture(capture);
        expect(report.ok).toBe(false);
        expect(report.failures.map(f => f.name)).toContain('contemplationPromptLut');
    });

    it('rejects M0 void-structure coordinates that drift from the kernel lens order', async () => {
        const capture = loadFixture();
        const frame = profileFrames(capture)[0];
        frame.payload.harmonicProfile.m0_void_structure_ring[6].coordinate = '#0-4-local';
        const report = await validateCapture(capture);
        expect(report.ok).toBe(false);
        expect(report.failures.map(f => f.name)).toContain('m0VoidStructureRing');
    });

    it('rejects a capture with no m123.chime events on the named channel', async () => {
        const capture = loadFixture();
        capture.frames = capture.frames.filter(f => (f.event ?? f.method) !== 'm123.chime');
        const report = await validateCapture(capture);
        expect(report.ok).toBe(false);
        expect(report.failures.map(f => f.name)).toContain('event:m123.chime');
    });
});
