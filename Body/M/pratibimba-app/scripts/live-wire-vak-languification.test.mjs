// @vitest-environment node
/**
 * Coordinate: M'/S0 live-wire VAK languification behavioral proof.
 * Residency: Body/M/pratibimba-app/scripts.
 * Position (#n): replay corruption gate.
 * Actualises: 36.T36.8 profile-bus trace manifest coverage.
 * Public surface: Vitest live-wire suite.
 * Does NOT own: profile derivation, UI presentation, or VAK evaluation.
 * Contract: [[M'-SYSTEM-SPEC]] / [[S0-SPEC]].
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROJECTION_MANIFEST, validateCapture } from './live-wire.mjs';

const FIXTURE_URL = new URL('./__fixtures__/live-wire-capture.json', import.meta.url);

function captureWithTrace() {
    const capture = JSON.parse(readFileSync(FIXTURE_URL, 'utf8'));
    const profile = capture.frames
        .find(frame => (frame.event ?? frame.method) === 'profile.update')
        .payload.harmonicProfile;
    profile.vakLanguificationTrace = {
        cpfNotation: '(4.0/1-4.4/5)',
        cfNotation: '(5/0)',
        m0Address: 'M0-5',
        vakLevel: 'vaikhari',
        diatonicDegree: 0,
        modeTonicCf: '(5/0)',
        resonance72Index: 70,
        halfDecanIndex: 35,
        biasWeightsEmpty: false,
        recognitionClosed: true,
        provenance: ['s4.vak.evaluate', 'm0.vak_cf']
    };
    return capture;
}

describe('live-wire VAK languification manifest', () => {
    it('declares behavioral trace coverage', () => {
        expect(PROJECTION_MANIFEST.map(entry => entry.name))
            .toContain('vakLanguificationTrace');
    });

    it('rejects a trace whose half-decan diverges from resonance72', async () => {
        const capture = captureWithTrace();
        const report = await validateCapture(capture);
        expect(report.ok).toBe(false);
        expect(report.failures.map(failure => failure.name))
            .toContain('vakLanguificationTrace');
    });
});
