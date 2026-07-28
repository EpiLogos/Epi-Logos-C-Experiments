/**
 * 22.T22.3 / 22.4 / 22.8 / 22.9 — the four M1' deep inspector faces render REAL
 * bridged data (Cl(4,2) signature, Klein-flip event-strip, vortex matrices
 * browser, audio-bus inspector). Each asserts the rendered surface reads the
 * already-present profile fields through the existing readers — no fabricated
 * bodies, honest pending when a window is absent.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { M1Cl42SignatureInspector } from './m1Cl42SignatureInspector';
import { M1KleinFlipEventStrip } from './m1KleinFlipEventStrip';
import { M1VortexMatricesBrowser } from './m1VortexMatricesBrowser';
import { M1AudioBusInspector } from './m1AudioBusInspector';
import { publishProfileTick, resetProfileTicks } from '../composition/profileTickSubscription';

/** The T2.6 CSV skeleton cell — accepted by the strict vortex reader. */
const CELL_7X5 = {
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

const MATRIX_FAMILIES = ['bimba', 'pratibimba', 'sum', 'diff-a', 'diff-b', 'quintessence'] as const;

function digitRoot(value: number): number {
    if (value === 0) return 0;
    const reduced = Math.abs(value) % 9;
    return reduced === 0 ? 9 : reduced;
}

function fullMatrixCells() {
    return MATRIX_FAMILIES.flatMap(family =>
        Array.from({ length: 12 }, (_, rowK) => rowK).flatMap(rowK =>
            Array.from({ length: 12 }, (_, positionP) => {
                const rawBimba = rowK * positionP;
                const rawPratibimba = rawBimba + 1;
                const rawSum = rawBimba + rawPratibimba;
                const rawValue =
                    family === 'bimba'
                        ? rawBimba
                        : family === 'pratibimba'
                          ? rawPratibimba
                          : family === 'sum'
                            ? rawSum
                            : family === 'diff-a'
                              ? -1
                              : family === 'diff-b'
                                ? 1
                                : null;
                return {
                    family,
                    rowK,
                    positionP,
                    rawValue,
                    rawBimba,
                    rawPratibimba,
                    rawSum,
                    rawDelta: 1,
                    drValue: rawValue === null ? null : digitRoot(rawValue),
                    drBimba: digitRoot(rawBimba),
                    drPratibimba: digitRoot(rawPratibimba),
                    drSum: digitRoot(rawSum),
                    // Rule face is CSV verbatim ("Rule; 0/1 != 0/1"): the
                    // tetralemma "-1/0/1" at kp==0, else {DiffA,DiffB,Sum}.
                    ruleValue:
                        family === 'quintessence'
                            ? rawBimba === 0
                                ? '-1/0/1'
                                : `-1/1/${rawSum}`
                            : null,
                    skeletonEvent: null
                };
            })
        )
    );
}

function vortex(overrides: Record<string, unknown> = {}) {
    return {
        activeMatrixOp: 'pratibimba',
        activeCell: [7, 5],
        activeCellValue: CELL_7X5,
        drRingPhase: { mahamayaIdx: 2, parashaktiIdx: 6 },
        cl42SignatureAtPosition: -1,
        ringQuaternion: RING_Q,
        helixSheet: 1,
        kleinFlipAtThisTick: false,
        matrixCells: fullMatrixCells(),
        ...overrides
    };
}

const AUDIO_OCTET = [261.6, 294.3, 327, 348.8, 392.4, 436, 490.5, 523.2];
const NODAL_QUARTET = [
    { m: 1, n: 1 },
    { m: 3, n: 2 },
    { m: 4, n: 3 },
    { m: 9, n: 8 }
];

const M1_TRITONE_FLIP = {
    kind: 'm1TritoneCrossing',
    tick12: 6,
    lensPair: [2, 5]
};

function prime(harmonicProfile: Record<string, unknown>, generation = 41) {
    publishProfileTick({
            generation,
            cachedAtMs: 1,
            stale: false,
            stalenessMs: 0,
            privacyClass: 'safe-public-current-kernel-tick',
            profile: { generation, harmonicProfile }
        });
}

function clear() {
    resetProfileTicks();
}

describe('22.T22.3 Cl(4,2) signature inspector', () => {
    beforeEach(() => {
        cleanup();
        clear();
    });

    it('honest pending when no profile is on the bus', () => {
        render(<M1Cl42SignatureInspector />);
        expect(screen.getByTestId('m1-cl42-pending')).toBeTruthy();
    });

    it('renders the six-position trig/signature matrix with the definitional Cl(4,2) signature', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1Cl42SignatureInspector />);
        // implicate generators sin@P0 / cos@P5 carry −1
        expect(screen.getByTestId('m1-cl42-position-0').getAttribute('data-signature')).toBe('-1');
        expect(screen.getByTestId('m1-cl42-position-5').getAttribute('data-signature')).toBe('-1');
        // explicate derivatives P1..P4 carry +1
        for (const p of [1, 2, 3, 4]) {
            expect(screen.getByTestId(`m1-cl42-position-${p}`).getAttribute('data-signature')).toBe('1');
        }
        expect(screen.getByTestId('m1-cl42-position-0').textContent).toContain('sin');
        expect(screen.getByTestId('m1-cl42-position-1').textContent).toContain('tan');
        expect(screen.getByTestId('m1-cl42-position-1').textContent).toContain('[0]/[5]');
        expect(screen.getByTestId('m1-cl42-position-2').textContent).toContain('1/[5]');
        expect(screen.getByTestId('m1-cl42-position-3').textContent).toContain('[5]/[0]');
        expect(screen.getByTestId('m1-cl42-position-4').textContent).toContain('1/[0]');
        // swatch tones from the CL42_PALETTE token
        expect(screen.getByTestId('m1-cl42-swatch-0').getAttribute('data-tone')).toBe('implicate');
        expect(screen.getByTestId('m1-cl42-swatch-1').getAttribute('data-tone')).toBe('explicate');
    });

    it('drives the active-position highlight from position6 and the signature readout from the bus', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1Cl42SignatureInspector />);
        expect(screen.getByTestId('m1-cl42-position-1').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m1-cl42-position-0').getAttribute('data-active')).toBe('false');
        const active = screen.getByTestId('m1-cl42-active');
        expect(active.getAttribute('data-position6')).toBe('1');
        expect(active.getAttribute('data-bus-signature')).toBe('-1');
    });

    it('renders the 9/8 derivation chain with the current tick12 step highlighted', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1Cl42SignatureInspector />);
        expect(screen.getByTestId('m1-cl42-98-octave').textContent).toContain('(4/3) × (3/2) = 2/1');
        expect(screen.getByTestId('m1-cl42-98-epogdoon').textContent).toContain('(3/2) ÷ (4/3) = 9/8');
        expect(screen.getByTestId('m1-cl42-98-step-7').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m1-cl42-98-step-6').getAttribute('data-active')).toBe('false');
    });
});

describe('22.T22.4 Klein-flip event-strip', () => {
    beforeEach(() => {
        cleanup();
        clear();
    });

    it('honest pending when the vortex is absent', () => {
        render(<M1KleinFlipEventStrip />);
        expect(screen.getByTestId('m1-klein-flip-strip-pending')).toBeTruthy();
    });

    it('marks the canonical 5→6 tritone boundary on the tick axis', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1KleinFlipEventStrip />);
        expect(screen.getByTestId('m1-klein-flip-axis-cell-6').getAttribute('data-canonical')).toBe('true');
        expect(screen.getByTestId('m1-klein-flip-axis-cell-3').getAttribute('data-canonical')).toBe('false');
    });

    it('deposits a canonical glyph + inverts the Hopf flag on a flip at tick 6', () => {
        prime({
            tick12: 6,
            position6: 4,
            kleinFlip: M1_TRITONE_FLIP,
            anandaVortex: vortex({ kleinFlipAtThisTick: true })
        });
        render(<M1KleinFlipEventStrip />);
        const glyph = screen.getByTestId('m1-klein-flip-glyph-gen-41');
        expect(glyph.getAttribute('data-canonical')).toBe('true');
        expect(glyph.getAttribute('data-tick')).toBe('6');
        expect(glyph.getAttribute('data-variant')).toBe('m1TritoneCrossing');
        expect(glyph.textContent).toContain('Lens 2 → Lens 5');
        expect(screen.queryByTestId('m1-klein-flip-unexpected')).toBeNull();
        expect(screen.getByTestId('m1-klein-flip-hopf-flag').getAttribute('data-inverted')).toBe('true');
    });

    it('flags an unexpected-flip when the flip fires outside the tritone crossing', () => {
        prime({
            tick12: 3,
            position6: 2,
            kleinFlip: { ...M1_TRITONE_FLIP, tick12: 3 },
            anandaVortex: vortex({ kleinFlipAtThisTick: true })
        });
        render(<M1KleinFlipEventStrip />);
        const glyph = screen.getByTestId('m1-klein-flip-glyph-gen-41');
        expect(glyph.getAttribute('data-canonical')).toBe('false');
        expect(screen.getByTestId('m1-klein-flip-unexpected')).toBeTruthy();
    });

    it('shows the empty log when the current tick carries no flip', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex({ kleinFlipAtThisTick: false }) });
        render(<M1KleinFlipEventStrip />);
        expect(screen.getByTestId('m1-klein-flip-log-empty')).toBeTruthy();
        expect(screen.getByTestId('m1-klein-flip-this-tick').getAttribute('data-flip')).toBe('false');
    });

    it('records the shared M2 variant and filters the accumulated event trail by source layer', async () => {
        prime({
            tick12: 7,
            position6: 1,
            kleinFlip: {
                kind: 'm2CymaticValenceInvert',
                valenceBefore: 'primary',
                valenceAfter: 'inverted'
            },
            anandaVortex: vortex({ kleinFlipAtThisTick: true })
        });
        render(<M1KleinFlipEventStrip />);
        expect(screen.getByTestId('m1-klein-flip-glyph-gen-41').getAttribute('data-variant')).toBe(
            'm2CymaticValenceInvert'
        );

        prime(
            {
                tick12: 6,
                position6: 4,
                kleinFlip: M1_TRITONE_FLIP,
                anandaVortex: vortex({ kleinFlipAtThisTick: true })
            },
            42
        );
        await waitFor(() => expect(screen.getByTestId('m1-klein-flip-glyph-gen-42')).toBeTruthy());
        fireEvent.change(screen.getByLabelText('Klein-flip variants'), {
            target: { value: 'm1-only' }
        });
        expect(screen.getByTestId('m1-klein-flip-glyph-gen-42')).toBeTruthy();
        expect(screen.queryByTestId('m1-klein-flip-glyph-gen-41')).toBeNull();

        fireEvent.change(screen.getByLabelText('Klein-flip variants'), {
            target: { value: 'all' }
        });
        prime(
            {
                tick12: 8,
                position6: 2,
                kleinFlip: {
                    kind: 'm3CodonRotationCross',
                    codonBefore: 17,
                    codonAfter: 41
                },
                anandaVortex: vortex({ kleinFlipAtThisTick: true })
            },
            43
        );
        await waitFor(() => expect(screen.getByTestId('m1-klein-flip-glyph-gen-43')).toBeTruthy());
        expect(screen.getByTestId('m1-klein-flip-glyph-gen-43').getAttribute('data-tone')).toBe(
            'm3-emerald'
        );
    });
});

describe('22.T22.8 vortex matrices browser', () => {
    beforeEach(() => {
        cleanup();
        clear();
    });

    it('honest pending when the vortex is absent', () => {
        render(<M1VortexMatricesBrowser />);
        expect(screen.getByTestId('m1-vortex-browser-pending')).toBeTruthy();
    });

    it('renders six family tabs with the profile-active family marked', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1VortexMatricesBrowser />);
        for (const op of ['bimba', 'pratibimba', 'sum', 'diff-a', 'diff-b', 'quintessence']) {
            expect(screen.getByTestId(`m1-vortex-tab-${op}`)).toBeTruthy();
        }
        expect(screen.getByTestId('m1-vortex-tab-pratibimba').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m1-vortex-tab-bimba').getAttribute('data-active')).toBe('false');
    });

    it('populates the active cell (7,5) with real raw + DR faces and lights the profile cell halo', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1VortexMatricesBrowser />);
        // active cell carries the DR-face value by default (drValue = 9)
        expect(screen.getByTestId('m1-vortex-cell-7-5').getAttribute('data-active-cell')).toBe('true');
        expect(screen.getByTestId('m1-vortex-cell-7-5').textContent).toBe('9');
        // the profile cell (tick12=7, position6=1) carries the Cl(4,2) halo
        expect(screen.getByTestId('m1-vortex-cell-7-1').getAttribute('data-profile-cell')).toBe('true');
        // the detail panel reads the verbatim faces
        expect(screen.getByTestId('m1-vortex-cell-raw').textContent).toBe('35 / 36 / 71 / 1');
        expect(screen.getByTestId('m1-vortex-cell-dr').textContent).toBe('8 / 9 / 8');
    });

    it('face-mode toggle switches the active cell to its raw face', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1VortexMatricesBrowser />);
        fireEvent.click(screen.getByTestId('m1-vortex-facemode-raw'));
        expect(screen.getByTestId('m1-vortex-facemode-raw').getAttribute('data-active')).toBe('true');
        // raw face → rawValue = 36
        expect(screen.getByTestId('m1-vortex-cell-7-5').textContent).toBe('36');
        expect(screen.getByTestId('m1-vortex-cell-facemode').textContent).toBe('raw');
    });

    it('pinning a non-active family holds the selection while retaining its bussed cells', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1VortexMatricesBrowser />);
        fireEvent.click(screen.getByTestId('m1-vortex-tab-bimba'));
        expect(screen.getByTestId('m1-vortex-tab-bimba').getAttribute('data-pinned')).toBe('true');
        expect(screen.getByTestId('m1-vortex-displayed').getAttribute('data-displayed-op')).toBe('bimba');
        expect(screen.queryByTestId('m1-vortex-pinned-no-cell')).toBeNull();
        expect(screen.getByTestId('m1-vortex-cell-8-8').getAttribute('data-source')).toBe(
            'kernel-projection'
        );
    });

    it('renders every selected-family cell from the complete bussed matrix projection', () => {
        prime({ tick12: 7, position6: 1, anandaVortex: vortex() });
        render(<M1VortexMatricesBrowser />);

        fireEvent.click(screen.getByTestId('m1-vortex-tab-bimba'));
        fireEvent.click(screen.getByTestId('m1-vortex-facemode-raw'));
        expect(screen.getByTestId('m1-vortex-cell-8-8').textContent).toBe('64');
        expect(screen.getByTestId('m1-vortex-cell-8-9').textContent).toBe('72');

        fireEvent.click(screen.getByTestId('m1-vortex-facemode-dr'));
        expect(screen.getByTestId('m1-vortex-cell-8-8').textContent).toBe('1');
        expect(screen.getByTestId('m1-vortex-cell-8-9').textContent).toBe('9');
    });
});

describe('22.T22.9 audio-bus inspector', () => {
    beforeEach(() => {
        cleanup();
        clear();
    });

    it('renders the reads-only M1↔M2 boundary banner verbatim', () => {
        prime({ tick12: 7, audioOctet: AUDIO_OCTET, nodalQuartet: NODAL_QUARTET });
        render(<M1AudioBusInspector />);
        expect(screen.getByTestId('m1-audio-reads-only-banner').textContent).toBe(
            "M1' is the consumer; M2-1' is the writer. To change a value, route through M2."
        );
    });

    it('renders 8 audio_octet rows + 4 nodal_quartet rows with Vimarśa authority badges', () => {
        prime({ tick12: 7, audioOctet: AUDIO_OCTET, nodalQuartet: NODAL_QUARTET });
        render(<M1AudioBusInspector />);
        expect(screen.getAllByTestId('m1-audio-octet-row')).toHaveLength(8);
        expect(screen.getAllByTestId('m1-nodal-quartet-row')).toHaveLength(4);
        expect(screen.getAllByTestId('m1-audio-vimarsha-badge')).toHaveLength(12);
        // real bridged values, verbatim
        expect(screen.getByTestId('m1-audio-octet-hz-0').textContent).toBe('261.6');
        expect(screen.getByTestId('m1-audio-octet-hz-7').textContent).toBe('523.2');
        expect(screen.getByTestId('m1-nodal-quartet-mn-3').textContent).toBe('9/8');
        expect(screen.getAllByTestId('m1-audio-vimarsha-badge')[0].textContent).toContain(
            'vimarsha_reading.rs:17-93'
        );
    });

    it('sorts the bussed octet by Hz while retaining profile ratio and nodal boundary roles', () => {
        prime({
            tick12: 7,
            audioOctet: [392.4, 261.6, 523.2, 294.3, 436, 327, 490.5, 348.8],
            ratioRoles: [
                '3/2 fifth',
                '1/1 prime',
                '2/1 octave',
                '9/8 epogdoon',
                '5/3 sixth',
                '5/4 third',
                '15/8 seventh',
                '4/3 fourth'
            ],
            nodalQuartet: [
                { helix: 'bimba', m: 9, n: 5, qlPosition: 0 },
                { helix: 'bimba', m: 2, n: 5, qlPosition: 5, constraintKind: 'cymatic_boundary' },
                { helix: 'pratibimba', m: 10, n: 9, qlPosition: 0 },
                { helix: 'pratibimba', m: 3, n: 11, qlPosition: 5 }
            ]
        });
        render(<M1AudioBusInspector />);

        fireEvent.click(screen.getByTestId('m1-audio-sort-hz'));
        expect(screen.getAllByTestId('m1-audio-octet-row').map(row => row.getAttribute('data-position'))).toEqual([
            '1',
            '3',
            '5',
            '7',
            '0',
            '4',
            '6',
            '2'
        ]);
        expect(screen.getByTestId('m1-audio-octet-ratio-1').textContent).toBe('1/1 prime');
        expect(screen.getByTestId('m1-nodal-quartet-constraint-0').textContent).toBe('cymatic_boundary');
        expect(screen.getByTestId('m1-nodal-quartet-boundary-0').textContent).toBe(
            'bimba QL position 0 cymatic boundary condition'
        );
    });

    it('honest pending when the octet / quartet windows are absent', () => {
        prime({ tick12: 7 });
        render(<M1AudioBusInspector />);
        expect(screen.getByTestId('m1-audio-octet-pending')).toBeTruthy();
        expect(screen.getByTestId('m1-nodal-quartet-pending')).toBeTruthy();
    });
});
