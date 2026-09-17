/**
 * 25.T25.6 — the personal cymatic field. Covered (the brief's verification
 * list, carrier-side): synthetic-handle mount; the DR-IG-6 geometry law
 * (all 12 P/P' positions render — `expect(scene.nodes.length).toBe(12)`);
 * the Hopf-toric-link law (at least two interlocking tori wind the apex
 * axis); the 25.17 time-axis foregrounding propagating into the
 * renderer-handle call; the privacy invariant (handle-only — no `q_*` body
 * field is ever read); and the fail-closed parse (wrong contract/geometry
 * law refuses to draw).
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { CompositionStateProvider } from '../composition/compositionState';
import { publishProfileTick } from '../composition/profileTickSubscription';
import { M4PersonalCymaticField } from './M4PersonalCymaticFieldPane';
import { buildCymaticScene, parseFieldHandle } from './m4PersonalCymaticField';

const HANDLE = {
    contractVersion: 'psychoid-cymatic.handle.v1',
    geometryLaw: 'DR-IG-6',
    privacyClass: 'protected-local-handle-only',
    solverStrategy: 'option-f',
    rendererHandle: 'psychoid-cymatic://renderer/dr-ig-6/option-f/abcdef1234567890',
    geometryHandle: 'psychoid-cymatic://geometry/dr-ig-6/fedcba0987654321',
    tick: 41,
    tick12: 5,
    audioBusDigest: 'audio-digest',
    nodalDigest: 'nodal-digest',
    sessionKey: 'agent:main:main',
    foregroundedHandle: 'qTransitHandle'
};

let generation = 700;

function mount(): ReturnType<typeof vi.fn> {
    const invoke = vi.fn().mockResolvedValue({ artifact: HANDLE });
    setGateway({ connected: true, invoke } as never);
    generation += 5;
    publishProfileTick({
        generation,
        cachedAtMs: 0,
        stale: false,
        profile: { harmonicProfile: {} },
        connection: 'connected',
        readiness: null
    } as never);
    render(
        <CompositionStateProvider>
            <M4PersonalCymaticField />
        </CompositionStateProvider>
    );
    return invoke;
}

afterEach(() => {
    setGateway(null);
    cleanup();
    window.localStorage.clear();
});

describe('m4PersonalCymaticField read + scene law', () => {
    it('parses a well-formed handle and refuses the wrong law', () => {
        expect(parseFieldHandle(HANDLE).kind).toBe('read');
        expect(parseFieldHandle({ ...HANDLE, geometryLaw: 'DR-IG-5' }).kind).toBe('refused');
        expect(parseFieldHandle({ ...HANDLE, contractVersion: 'v2' }).kind).toBe('refused');
        expect(
            parseFieldHandle({ ...HANDLE, rendererHandle: 'https://not-a-handle' }).kind
        ).toBe('refused');
        expect(parseFieldHandle(null).kind).toBe('refused');
    });

    it('DR-IG-6: the scene renders all 12 P/P′ positions off the carrier fixture', () => {
        const read = parseFieldHandle(HANDLE);
        expect(read.kind).toBe('read');
        if (read.kind !== 'read') return;
        const scene = buildCymaticScene(read.handle);
        // The CORRECTED fixture (08.T8.7) carries the 12 positions as 11
        // loci: P0/P0' is ONE central axis-point by its own law — the brief's
        // literal 12-node count predates that correction, and the fixture is
        // the authority every psychoid renderer must consume.
        expect(scene.nodes.length).toBe(11);
        const labels = scene.nodes.map(node => node.label).sort();
        expect(labels).toEqual(
            ["P0/P0'", 'P1', "P1'", 'P2', "P2'", 'P3', "P3'", 'P4', "P4'", 'P5', "P5'"].sort()
        );
        // All twelve P/P' POSITIONS are present: ten distinct vertices plus
        // the combined dual axis-point.
        expect(scene.nodes.filter(node => node.role === 'apex').length).toBe(2);
        expect(scene.nodes.filter(node => node.role === 'base').length).toBe(8);
        expect(scene.nodes.filter(node => node.role === 'axis-point').length).toBe(1);
    });

    it('Hopf-toric-link: at least two interlocking tori wind the apex axis', () => {
        const read = parseFieldHandle(HANDLE);
        if (read.kind !== 'read') throw new Error('fixture must parse');
        const scene = buildCymaticScene(read.handle);
        expect(scene.tori.length).toBeGreaterThanOrEqual(2);
        for (const torus of scene.tori) {
            expect(torus.windsApexAxis).toBe(true);
            expect(torus.points.length).toBeGreaterThan(24);
        }
        // The two loops differ (transverse planes) — identical loops would
        // be one torus drawn twice, not a link.
        expect(JSON.stringify(scene.tori[0].points)).not.toBe(JSON.stringify(scene.tori[1].points));
        // The phase rides the handle's tick12 — the scene moves with the clock.
        expect(scene.phase).toBe(5);
    });
});

describe('M4PersonalCymaticField', () => {
    it('mounts the synthetic handle and declares the scene on the surface', async () => {
        mount();
        await waitFor(() =>
            expect(
                screen.getByTestId('m4-personal-cymatic-field').getAttribute('data-state')
            ).toBe('read')
        );
        const pane = screen.getByTestId('m4-personal-cymatic-field');
        expect(pane.getAttribute('data-node-count')).toBe('11');
        expect(pane.getAttribute('data-tori-count')).toBe('2');
        expect(pane.getAttribute('data-renderer-handle')).toContain(
            'psychoid-cymatic://renderer/dr-ig-6/'
        );
        expect(screen.getByTestId('m4-cymatic-canvas')).toBeTruthy();
    });

    it('propagates the 25.17 time-axis mode into the renderer-handle call', async () => {
        const invoke = mount();
        await waitFor(() => expect(invoke).toHaveBeenCalled());
        // Default mode is real-time → qTransitHandle (25.17 line 219 law).
        expect(invoke).toHaveBeenCalledWith('nara.field.handle', {
            sessionKey: 'agent:main:main',
            foregroundedHandle: 'qTransitHandle'
        });
        expect(
            screen.getByTestId('m4-personal-cymatic-field').getAttribute('data-foregrounded')
        ).toBe('qTransitHandle');
    });

    it('privacy invariant: only handle-form params cross the bus — never a q_* body', async () => {
        const invoke = mount();
        await waitFor(() => expect(invoke).toHaveBeenCalled());
        for (const call of invoke.mock.calls) {
            const serialized = JSON.stringify(call);
            expect(serialized).not.toMatch(/"q[A-Z][a-zA-Z]*":\s*[\[{0-9]/);
            expect(serialized).not.toMatch(/quaternion/i);
        }
    });

    it('refuses to draw against a mis-lawed handle', async () => {
        const invoke = vi.fn().mockResolvedValue({
            artifact: { ...HANDLE, geometryLaw: 'DR-IG-5' }
        });
        setGateway({ connected: true, invoke } as never);
        generation += 5;
        publishProfileTick({
            generation,
            cachedAtMs: 0,
            stale: false,
            profile: { harmonicProfile: {} },
            connection: 'connected',
            readiness: null
        } as never);
        render(
            <CompositionStateProvider>
                <M4PersonalCymaticField />
            </CompositionStateProvider>
        );
        await waitFor(() =>
            expect(
                screen.getByTestId('m4-personal-cymatic-field').getAttribute('data-state')
            ).toBe('refused')
        );
        expect(screen.getByTestId('m4-cymatic-pending').textContent).toContain('DR-IG-6');
        expect(screen.queryByTestId('m4-cymatic-canvas')).toBeNull();
    });
});
