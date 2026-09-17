/**
 * 22.T22.10 — surface-dispatch contract tests (jsdom, store/unit level).
 * Pins the LAW: the three-mode inventory, the total typed dispatch, the
 * (face, layout)→context resolution, and — the acceptance — a mid-tick surface
 * switch preserving (tick12, position6, active_matrix_op, k2_orientation_q)
 * because the tick-store singleton outlives every mounted body (DR-WC-M1-1).
 *
 * 52.T2 (DR-M1-FACE-LAYOUT-1) adds the four-cell (face × layout) matrix. The
 * pre-52.T2 resolver took `face` alone, so `(1, daily-0-1)` and `(0, ide-deep)`
 * were not expressible: the personal face always answered ide-deep and the
 * cosmic face always answered daily-0-1. Those two cells are the repair, and
 * they are red against the old implementation.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import {
    M1_SURFACE_MODES,
    M1SurfaceDispatchPane,
    readM1SharedState,
    resolveM1SurfaceContext,
    selectM1Body
} from './m1SurfaceDispatch';
import { DEFAULT_LAYOUT_ID, LAYOUT_IDS } from '../ui/layoutId';
import { useProvenanceStore, useTickStore } from '../state/stores';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

/** The T2.6 CSV skeleton cell — reused so the strict vortex reader accepts. */
const CELL_7X1_P5 = {
    family: 'pratibimba',
    rowK: 7,
    positionP: 5,
    rawValue: 36,
    rawBimba: 35,
    rawPratibimba: 36,
    rawSum: 71,
    rawDelta: 1,
    drValue: 9,
    drBimba: 8,
    drPratibimba: 9,
    drSum: 8,
    ruleValue: null,
    skeletonEvent: 'Hit36'
};

const RING_Q = [0.5, -0.8660254, 0, 0];

const VORTEX = {
    activeMatrixOp: 'pratibimba',
    activeCell: [7, 5],
    activeCellValue: CELL_7X1_P5,
    drRingPhase: { mahamayaIdx: 2, parashaktiIdx: 6 },
    cl42SignatureAtPosition: -1,
    ringQuaternion: RING_Q,
    helixSheet: 1,
    kleinFlipAtThisTick: false
};

/** Mid-tick kernel truth: gen 41, tick 7, position 1, pratibimba family. */
const MID_TICK_PAYLOAD = {
    generation: 41,
    harmonicProfile: {
        tick12: 7,
        position6: 1,
        degree720: 435,
        anandaVortex: VORTEX,
        m1Topology: { doubleCoverDeg: 720, torusGenus: 1, hopfIdentity: 'S3->S2 Hopf' }
    }
};

function primeStore(generation = 41, payload: Record<string, unknown> = MID_TICK_PAYLOAD) {
    publishProfileTick({
            generation,
            cachedAtMs: 1,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: payload
        });
}

function stripDataset(): Record<string, string | undefined> {
    const strip = screen.getByTestId('m1-shared-state');
    return {
        generation: strip.getAttribute('data-generation') ?? undefined,
        tick12: strip.getAttribute('data-tick12') ?? undefined,
        position6: strip.getAttribute('data-position6') ?? undefined,
        activeMatrixOp: strip.getAttribute('data-active-matrix-op') ?? undefined,
        k2OrientationQ: strip.getAttribute('data-k2-orientation-q') ?? undefined
    };
}

const EXPECTED_TUPLE = {
    generation: '41',
    tick12: '7',
    position6: '1',
    activeMatrixOp: 'pratibimba',
    k2OrientationQ: RING_Q.join(',')
};

describe('m1 surface-dispatch contract (22.T22.10)', () => {
    beforeEach(() => {
        cleanup();
        resetProfileTicks();
        useProvenanceStore.setState({
            connection: { ...useProvenanceStore.getState().connection, connected: false }
        });
    });

    it('declares exactly the three LAW modes', () => {
        expect([...M1_SURFACE_MODES]).toEqual([
            'standalone-ide-deep',
            'composed-cosmic-1-2-3',
            'compact-track-08'
        ]);
    });

    it('dispatch is total and mode-distinct', () => {
        const bodies = M1_SURFACE_MODES.map(selectM1Body);
        bodies.forEach(body => expect(typeof body).toBe('function'));
        expect(new Set(bodies).size).toBe(3);
    });

    // ── 52.T2 / DR-M1-FACE-LAYOUT-1: face × layout are ORTHOGONAL ──────────
    //
    // Before this tranche the resolver took only `face` and derived the layout
    // from it (face 1 ⇒ ide-deep), so two of the four cells below did not
    // exist as distinct outcomes. These four cases ARE the tranche.

    it('52.T2: (face 0, daily-0-1) → the cosmic 1-2-3 composition in the daily layout', () => {
        expect(resolveM1SurfaceContext({ face: 0, activeLayout: 'daily-0-1' })).toEqual({
            mode: 'composed-cosmic-1-2-3',
            layoutId: 'daily-0-1',
            compositionPluginId: 'plugin-integrated-1-2-3'
        });
    });

    it('52.T2: (face 0, ide-deep) → still the cosmic composition, but reporting the REAL layout', () => {
        // the cosmic mount is a composition role, not a depth role: entering
        // the deep layout does not turn it into the M1' workbench. What DOES
        // change is `layoutId` — which the old face-derived code got wrong.
        expect(resolveM1SurfaceContext({ face: 0, activeLayout: 'ide-deep' })).toEqual({
            mode: 'composed-cosmic-1-2-3',
            layoutId: 'ide-deep',
            compositionPluginId: 'plugin-integrated-1-2-3'
        });
    });

    it('52.T2: (face 1, daily-0-1) → the PREVIEW strip, not the deep workbench (DCC-07)', () => {
        // The case the pre-52.T2 code got wrong in both fields: it answered
        // standalone-ide-deep / 'ide-deep' for the personal face in the daily
        // layout, compressing the full M1' workbench into the daily shell —
        // exactly what M5'-SPEC :161 forbids.
        expect(resolveM1SurfaceContext({ face: 1, activeLayout: 'daily-0-1' })).toEqual({
            mode: 'compact-track-08',
            layoutId: 'daily-0-1'
        });
    });

    it('52.T2: (face 1, ide-deep) → the standalone deep page; BOTH gates open', () => {
        expect(resolveM1SurfaceContext({ face: 1, activeLayout: 'ide-deep' })).toEqual({
            mode: 'standalone-ide-deep',
            layoutId: 'ide-deep'
        });
    });

    it('52.T2: the standalone mode is reachable through NO other (face, layout) cell', () => {
        const cells = ([0, 1] as const).flatMap(face =>
            LAYOUT_IDS.map(activeLayout => ({
                face,
                activeLayout,
                mode: resolveM1SurfaceContext({ face, activeLayout }).mode
            }))
        );
        expect(cells).toHaveLength(4);
        expect(cells.filter(cell => cell.mode === 'standalone-ide-deep')).toEqual([
            { face: 1, activeLayout: 'ide-deep', mode: 'standalone-ide-deep' }
        ]);
        // and the layout axis is never invented: every cell reports its input
        for (const face of [0, 1] as const) {
            for (const activeLayout of LAYOUT_IDS) {
                expect(resolveM1SurfaceContext({ face, activeLayout }).layoutId).toBe(activeLayout);
            }
        }
    });

    it('52.T2: cosmicComposition:false still opts a face-0 mount out of the cross-pole, in either layout', () => {
        for (const activeLayout of LAYOUT_IDS) {
            expect(
                resolveM1SurfaceContext({ face: 0, activeLayout, cosmicComposition: false })
            ).toEqual({ mode: 'compact-track-08', layoutId: activeLayout });
        }
    });

    it('52.T2: a context-less mount falls back to the DAILY ground state, never to depth', () => {
        primeStore();
        render(<M1SurfaceDispatchPane />);
        const body = screen.getByTestId('m1-body-compact-track-08');
        expect(body.getAttribute('data-layout-id')).toBe(DEFAULT_LAYOUT_ID);
        expect(screen.queryByTestId('m1-body-standalone-ide-deep')).toBeNull();
    });

    it('reads the DR-WC-M1-1 tuple as a pure window — absence is null, never a fallback', () => {
        expect(readM1SharedState(null)).toEqual({
            generation: null,
            tick12: null,
            position6: null,
            activeMatrixOp: null,
            k2OrientationQ: null
        });
        primeStore();
        const shared = readM1SharedState(useTickStore.getState().profile);
        expect(shared.generation).toBe(41);
        expect(shared.tick12).toBe(7);
        expect(shared.position6).toBe(1);
        expect(shared.activeMatrixOp).toBe('pratibimba');
        expect(shared.k2OrientationQ).toEqual(RING_Q);
    });

    it('a malformed vortex nulls the vortex members without inventing them (strict T2.6 reader)', () => {
        const { activeCellValue: _dropped, ...malformed } = VORTEX;
        primeStore(41, {
            harmonicProfile: { tick12: 7, position6: 1, anandaVortex: malformed }
        });
        const shared = readM1SharedState(useTickStore.getState().profile);
        expect(shared.tick12).toBe(7);
        expect(shared.position6).toBe(1);
        expect(shared.activeMatrixOp).toBeNull();
        expect(shared.k2OrientationQ).toBeNull();
    });

    it('all three mode bodies render the SAME tuple from the one singleton', () => {
        primeStore();
        for (const mode of M1_SURFACE_MODES) {
            cleanup();
            const context =
                mode === 'standalone-ide-deep'
                    ? resolveM1SurfaceContext({ face: 1, activeLayout: 'ide-deep' })
                    : resolveM1SurfaceContext({
                          face: 0,
                          activeLayout: 'daily-0-1',
                          cosmicComposition: mode === 'composed-cosmic-1-2-3'
                      });
            render(<M1SurfaceDispatchPane context={context} />);
            expect(screen.getByTestId(`m1-body-${mode}`)).toBeTruthy();
            expect(stripDataset()).toEqual(EXPECTED_TUPLE);
        }
    });

    it('ACCEPTANCE: mid-tick surface switch daily-0-1 (composed) → ide-deep (standalone) preserves the tuple', () => {
        primeStore();
        const profileBefore = useTickStore.getState().profile;

        render(<M1SurfaceDispatchPane context={resolveM1SurfaceContext({ face: 0, activeLayout: 'daily-0-1' })} />);
        const composedTuple = stripDataset();
        expect(composedTuple).toEqual(EXPECTED_TUPLE);

        // the layout toggle: the composed body unmounts entirely…
        cleanup();
        // …and a STALE generation arriving mid-switch is refused by the store
        // law, so the switch cannot regress the clock
        publishProfileTick({
            generation: 40,
            cachedAtMs: 2,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: { harmonicProfile: { tick12: 6, position6: 0 } }
        });

        render(<M1SurfaceDispatchPane context={resolveM1SurfaceContext({ face: 1, activeLayout: 'ide-deep' })} />);
        const standaloneTuple = stripDataset();

        expect(standaloneTuple).toEqual(composedTuple);
        // the singleton outlived both widgets: same object, no re-derivation,
        // no store write happened on the switch
        expect(useTickStore.getState().profile).toBe(profileBefore);
        expect(useTickStore.getState().generation).toBe(41);
    });

    it('standalone-ide-deep composes the landed deep faces incl. the four inspector faces', () => {
        primeStore();
        render(<M1SurfaceDispatchPane context={resolveM1SurfaceContext({ face: 1, activeLayout: 'ide-deep' })} />);
        expect(screen.getByTestId('m1-slot-spanda-navigator')).toBeTruthy();
        expect(screen.getByTestId('m1-slot-walk')).toBeTruthy();
        expect(screen.getByTestId('m1-slot-klein-topology')).toBeTruthy();
        // the four M1 deep inspector faces (22.3 / 22.4 / 22.8 / 22.9) now mount
        // as real bodies, not pending slots
        expect(screen.getByTestId('m1-slot-cl42')).toBeTruthy();
        expect(screen.getByTestId('m1-cl42-inspector')).toBeTruthy();
        expect(screen.getByTestId('m1-slot-klein-flip-strip')).toBeTruthy();
        expect(screen.getByTestId('m1-klein-flip-strip')).toBeTruthy();
        expect(screen.getByTestId('m1-slot-vortex-browser')).toBeTruthy();
        expect(screen.getByTestId('m1-vortex-browser')).toBeTruthy();
        expect(screen.getByTestId('m1-slot-audio-bus')).toBeTruthy();
        expect(screen.getByTestId('m1-audio-bus-inspector')).toBeTruthy();
        expect(screen.queryByTestId('m1-slot-pending-22.3')).toBeNull();
        // compact exports belong to the composed/compact bodies only
        expect(screen.queryByTestId('m1-walk-strip')).toBeNull();
    });

    it('composed-cosmic-1-2-3 renders compact exports + crosspole contribution, NOT the played-torus (15.4 mount-point law)', () => {
        primeStore();
        render(<M1SurfaceDispatchPane context={resolveM1SurfaceContext({ face: 0, activeLayout: 'daily-0-1' })} />);
        expect(screen.getByTestId('m1-walk-strip')).toBeTruthy();
        expect(
            screen.getByTestId('m1-walk-strip-cell-7').getAttribute('data-active')
        ).toBe('true');
        expect(screen.getByTestId('m1-topology-mini').textContent).toContain('720');
        expect(screen.getByTestId('m1-cosmic-crosspole').textContent).toContain('pratibimba');
        expect(screen.queryByTestId('m1-played-torus')).toBeNull();
        expect(screen.queryByTestId('m1-slot-spanda-navigator')).toBeNull();
    });

    it('compact-track-08 is the composed body minus the cosmic crosspole', () => {
        primeStore();
        render(
            <M1SurfaceDispatchPane
                context={resolveM1SurfaceContext({ face: 0, activeLayout: 'daily-0-1', cosmicComposition: false })}
            />
        );
        expect(screen.getByTestId('m1-walk-strip')).toBeTruthy();
        expect(screen.getByTestId('m1-topology-mini')).toBeTruthy();
        expect(screen.queryByTestId('m1-cosmic-crosspole')).toBeNull();
    });
});
