/**
 * 25.T25.23 — the fretboard is a pure consumer of the compiled route table +
 * the emit-only witness. Covered here (brief's own verification list): 7×6
 * render with the double-courses paired and R0 confined to the upper triad;
 * playback lights exactly the recorded frets; the (@#) turn flares only when
 * a walked step IS the turn; the unreturned-complement glow; non-blocking
 * (a witness-less profile still draws the instrument); ?-chips dispatch ONLY
 * the verifier method.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import type { AnuttaraWitnessProjection, RFactorRouteTableProjection } from '../bridge/types';
import { publishProfileTick } from '../composition/profileTickSubscription';
import { NaraRFactorFretboardPane } from './NaraRFactorFretboardPane';
import {
    courseOf,
    fretMarkers,
    litFrets,
    readRFactorFretboard,
    unreturnedComplements
} from './naraRFactorFretboard';

/** The kernel distribution verbatim (pinned substrate-side by
 *  portal-core/tests/rfactor_route_table_profile_field.rs — this fixture is
 *  the same words so a drift breaks BOTH sides). */
const TABLE: RFactorRouteTableProjection = {
    routes: [
        { baseRoute: 'O#', mColumn: 1, positions: [1, 0, 7, 7, 5, 7] },
        { baseRoute: 'X#', mColumn: 2, positions: [2, 1, 0, 5, 4, 7] },
        { baseRoute: 'N#', mColumn: 3, positions: [3, 2, 1, 4, 3, 7] },
        { baseRoute: 'M#', mColumn: 4, positions: [7, 3, 2, 3, 2, 7] },
        { baseRoute: 'Nara', mColumn: 4, positions: [7, 4, 3, 2, 1, 7] },
        { baseRoute: 'Siva', mColumn: 5, positions: [7, 5, 4, 1, 0, 7] },
        { baseRoute: 'Shakti', mColumn: 5, positions: [7, 7, 5, 0, 7, 7] }
    ],
    positionless: 7,
    bandTurnSymbol: '(@#)',
    virtues: Array.from({ length: 9 }, (_, virtueIndex) => ({
        virtueIndex,
        ...(virtueIndex >= 3 ? { rFactor: virtueIndex - 3 } : {}),
        name: `virtue-${virtueIndex}`,
        symbol: `${virtueIndex >= 3 ? `${virtueIndex - 3}R` : 'meta'} = sym-${virtueIndex}`
    }))
};

const WITNESS: AnuttaraWitnessProjection = {
    virtueWitnessVector: 0b000001000, // lamp 3 (0R Joy/Play) lit
    syntaxWitnessVector: 0,
    rfactorPath: [
        { rFactor: 1, baseRoute: 'O#', band: 'pravritti', position: 0, isTurn: false },
        { rFactor: 2, baseRoute: 'Shakti', band: 'pravritti', position: 5, isTurn: false },
        { rFactor: 3, baseRoute: 'Shakti', band: 'nivritti', position: 0, isTurn: true }
    ],
    bandBalance: { pravrittiDepth: 2, nivrittiDepth: 1, reachedTurn: true, returned: false },
    palindromeState: { normalFormSymmetric: false, mirrorNormalForm: 'fixture' },
    openQuestions: ['Which act was missing?'],
    coherenceScore: 0.4
};

let generationCounter = 91;

function mountWithProfile(profile: unknown): void {
    // The tick store is generation-monotonic (single-clock law); each mount
    // must advance it, and the ONE sanctioned writer is publishProfileTick.
    generationCounter += 1;
    publishProfileTick({
        generation: generationCounter,
        cachedAtMs: 0,
        stale: false,
        profile,
        connection: 'connected',
        readiness: null
    } as never);
    render(<NaraRFactorFretboardPane />);
}

afterEach(() => {
    setGateway(null);
    cleanup();
});

describe('naraRFactorFretboard read law', () => {
    it('refuses to draw without the wire table (never a renderer-local copy)', () => {
        expect(readRFactorFretboard(null).kind).toBe('pending');
        expect(readRFactorFretboard({}).kind).toBe('pending');
        const truncated = { rfactorRouteTable: { ...TABLE, routes: TABLE.routes.slice(0, 6) } };
        expect(readRFactorFretboard(truncated).kind).toBe('pending');
    });

    it('reads the table from either profile home (bare or harmonicProfile)', () => {
        expect(readRFactorFretboard({ rfactorRouteTable: TABLE }).kind).toBe('read');
        expect(
            readRFactorFretboard({ harmonicProfile: { rfactorRouteTable: TABLE } }).kind
        ).toBe('read');
    });

    it('R0 markers exist only on the upper triad; every marker knows its course', () => {
        const markers = fretMarkers(TABLE);
        const drones = markers.filter(m => m.rFactor === 0);
        expect(drones.map(m => m.baseRoute)).toEqual(['O#', 'X#', 'N#']);
        expect(new Set(drones.map(m => m.course))).toEqual(new Set(['r0-drone']));
        expect(courseOf(1)).toBe('r1r4-course');
        expect(courseOf(4)).toBe('r1r4-course');
        expect(courseOf(2)).toBe('r2r3-course');
        expect(courseOf(3)).toBe('r2r3-course');
        // R5 never becomes a fret marker — positionless by law.
        expect(markers.some(m => m.rFactor === 5)).toBe(false);
    });

    it('playback lights exactly the recorded frets and drops an off-table step', () => {
        const lit = litFrets(TABLE, WITNESS.rfactorPath);
        expect(lit.size).toBe(3);
        expect(lit.get('0:0')?.rFactor).toBe(1); // O# R1 @ fret 0
        expect(lit.get('6:5')?.rFactor).toBe(2); // Shakti R2 @ fret 5
        expect(lit.get('6:0')?.isTurn).toBe(true); // Shakti R3 @ fret 0 — the (@#)
        const invented = litFrets(TABLE, [
            { rFactor: 0, baseRoute: 'Shakti', band: 'pravritti', position: 3, isTurn: false }
        ]);
        expect(invented.size).toBe(0);
    });

    it('an unreturned pravritti path glows its untouched nivritti complements', () => {
        expect(unreturnedComplements(WITNESS)).toEqual([4]); // R1 taken → R4 untouched; R2's complement R3 was walked
        expect(
            unreturnedComplements({
                ...WITNESS,
                bandBalance: { ...WITNESS.bandBalance, returned: true }
            })
        ).toEqual([]);
    });
});

describe('NaraRFactorFretboardPane', () => {
    it('draws 7 strings × 6 frets off the wire and flares the walked turn', () => {
        mountWithProfile({ rfactorRouteTable: TABLE, anuttaraWitness: WITNESS });
        const pane = screen.getByTestId('rfactor-fretboard');
        expect(pane.getAttribute('data-state')).toBe('read');
        expect(pane.getAttribute('data-walked-steps')).toBe('3');
        for (let row = 0; row < 7; row += 1) {
            expect(screen.getByTestId(`rfactor-string-${row}`)).toBeTruthy();
        }
        for (let fret = 0; fret < 6; fret += 1) {
            expect(screen.getByTestId(`rfactor-fret-${fret}`)).toBeTruthy();
        }
        expect(screen.getByTestId('rfactor-marker-O#-1').getAttribute('data-lit')).toBe('pravritti');
        expect(screen.getByTestId('rfactor-marker-Shakti-3').getAttribute('data-lit')).toBe('nivritti');
        expect(screen.getByTestId('rfactor-band-turn').getAttribute('data-turn-walked')).toBe('true');
        expect(screen.getByTestId('rfactor-r5-fretless')).toBeTruthy();
        // Virtue lamp 3 rides the vector; its neighbours stay dark.
        expect(screen.getByTestId('rfactor-virtue-lamp-3').getAttribute('data-lit')).toBe('true');
        expect(screen.getByTestId('rfactor-virtue-lamp-4').getAttribute('data-lit')).toBe('false');
        // Unreturned: the readout says so and R4 markers glow.
        expect(screen.getByTestId('rfactor-returned').textContent).toContain('unreturned');
        expect(
            screen.getByTestId('rfactor-marker-O#-4').getAttribute('data-unreturned-glow')
        ).toBe('true');
    });

    it('is NON-BLOCKING: a witness-less profile still draws the instrument', () => {
        mountWithProfile({ rfactorRouteTable: TABLE });
        expect(screen.getByTestId('rfactor-fretboard').getAttribute('data-state')).toBe('read');
        expect(screen.getByTestId('rfactor-no-witness')).toBeTruthy();
        expect(screen.getByTestId('rfactor-marker-O#-0')).toBeTruthy();
    });

    it('?-object chips dispatch ONLY the verifier emit method', async () => {
        const invoke = vi.fn().mockResolvedValue({});
        setGateway({ connected: true, invoke } as never);
        mountWithProfile({ rfactorRouteTable: TABLE, anuttaraWitness: WITNESS });
        fireEvent.click(screen.getByTestId('rfactor-question-chip'));
        await waitFor(() =>
            expect(screen.getByTestId('rfactor-question-chip').getAttribute('data-emit-state')).toBe(
                'sent'
            )
        );
        expect(invoke).toHaveBeenCalledTimes(1);
        expect(invoke).toHaveBeenCalledWith("s0'.verifier.emit_query", {
            question: 'Which act was missing?'
        });
    });

    it('renders honest-pending without the wire table', () => {
        mountWithProfile({});
        expect(screen.getByTestId('rfactor-fretboard').getAttribute('data-state')).toBe('pending');
        expect(screen.getByTestId('rfactor-fretboard-pending').textContent).toContain(
            'rfactorRouteTable'
        );
    });
});
