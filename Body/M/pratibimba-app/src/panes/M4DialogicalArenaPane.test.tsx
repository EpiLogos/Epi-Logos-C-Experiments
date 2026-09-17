/**
 * Coordinate: M' M4' (dialogical arena pane tests — Tranche 41.7 rerun)
 * Actualises: the spec's render verification — fixture scene with 3 Vama
 *   Shaktis (one per non-egregore class) + 5 turns; classifier-glyph per chip;
 *   the privacy invariant (`protectedBodiesProjected: false`) on the surface;
 *   the CPF-gate refusal (wizard cannot open without brainstorm confirmation);
 *   the anti-leak invariant (no `m4.arena.summon`/`scene_open` invoke ever
 *   fires while the gate is closed).
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setGateway } from '../bridge/gatewayHolder';
import { DEFAULT_CONNECTION_STATUS } from '../bridge/types';
import { useProvenanceStore } from '../state/stores';
import { M4DialogicalArenaPane } from './M4DialogicalArenaPane';
import {
    ARENA_SCENE_OPEN_RPC,
    ARENA_SUMMON_RPC,
    ArenaSceneSummary,
    ArenaTurnEntry,
    ArenaVamaShakti,
    WarmVamaShaktiRow
} from './m4DialogicalArena';

const FIXTURE_SCENE: ArenaSceneSummary = {
    sceneKey: 'arena:ontologies-in-conversation',
    status: 'open',
    pinnedCoordinate: 'C5',
    admittedConstitutional: ['Sophia'],
    vamaShaktiCount: 3,
    turnCount: 5
};

/** One per non-egregore class, per the tranche's render verification. */
const FIXTURE_ROSTER: readonly ArenaVamaShakti[] = [
    { key: 'v-sprite', name: 'Hermes Spark', vamaShaktiClass: 'sprite', vakAddress: 'C2.hermes' },
    { key: 'v-daemon', name: 'Plotinus One', vamaShaktiClass: 'daemon', vakAddress: 'C0.plotinus-one' },
    { key: 'v-mantra', name: 'Aum', vamaShaktiClass: 'mantra', vakAddress: 'T5.aum' }
];

const FIXTURE_TURNS: readonly ArenaTurnEntry[] = [
    { key: 't0', speakerKind: 'user', speakerName: 'You', vamaShaktiClass: null, vakAddress: null, kairosDelta: null, line: 'What is the One?' },
    { key: 't1', speakerKind: 'vama_shakti', speakerName: 'Plotinus One', vamaShaktiClass: 'daemon', vakAddress: 'C0.plotinus-one', kairosDelta: 'Δ +2', line: null },
    { key: 't2', speakerKind: 'vama_shakti', speakerName: 'Hermes Spark', vamaShaktiClass: 'sprite', vakAddress: 'C2.hermes', kairosDelta: null, line: null },
    { key: 't3', speakerKind: 'constitutional', speakerName: 'Sophia', vamaShaktiClass: null, vakAddress: null, kairosDelta: null, line: null },
    { key: 't4', speakerKind: 'vama_shakti', speakerName: 'Aum', vamaShaktiClass: 'mantra', vakAddress: 'T5.aum', kairosDelta: 'Δ +7', line: null }
];

const FIXTURE_WARM: readonly WarmVamaShaktiRow[] = [
    { identityHandle: 'w-sprite', coordinateLabel: 'M4.sprite-field', vamaShaktiClass: 'sprite', turnsParticipatedCount: 8 },
    { identityHandle: 'w-daemon', coordinateLabel: 'M4.daemon-field', vamaShaktiClass: 'daemon', turnsParticipatedCount: 32 }
];

describe('M4DialogicalArenaPane', () => {
    const invoke = vi.fn();

    beforeEach(() => {
        invoke.mockReset();
        invoke.mockResolvedValue({ artifact: {} } as never);
        setGateway({ invoke } as never);
        useProvenanceStore.setState({
            connection: { ...DEFAULT_CONNECTION_STATUS, connected: true, state: 'connected' }
        });
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('renders the fixture scene: roster chips, 5 turns, privacy attributes', () => {
        render(
            <M4DialogicalArenaPane
                fixture={{ scenes: [FIXTURE_SCENE], roster: FIXTURE_ROSTER, turns: FIXTURE_TURNS, warm: FIXTURE_WARM }}
            />
        );

        const root = screen.getByTestId('m4-arena-root');
        expect(root.getAttribute('data-privacy-class')).toBe('protected_local_handle_only');
        expect(root.getAttribute('data-protected-bodies-projected')).toBe('false');
        expect(root.getAttribute('data-view-id')).toBe('m4.nara.dialogicalArena');

        expect(screen.getByTestId('m4-arena-pinned').getAttribute('data-coordinate')).toBe('C5');
        expect(screen.getByTestId('m4-arena-trika0')).toBeTruthy();
        expect(screen.getAllByTestId('m4-arena-vama-chip')).toHaveLength(3);
        expect(screen.getAllByTestId('m4-arena-constitutional-chip')).toHaveLength(1);
        expect(screen.getAllByTestId('m4-arena-turn')).toHaveLength(5);

        // Non-user dialogue bodies stay opaque (41.1 contract law).
        const lines = screen.getAllByTestId('m4-arena-turn-line').map(el => el.textContent);
        expect(lines[0]).toBe('What is the One?');
        expect(lines[1]).toContain('protected-local');
    });

    it('carries the correct classifier glyph per admitted chip', () => {
        render(
            <M4DialogicalArenaPane
                fixture={{ scenes: [FIXTURE_SCENE], roster: FIXTURE_ROSTER, turns: [], warm: [] }}
            />
        );
        const chips = screen.getAllByTestId('m4-arena-vama-chip');
        const byClass = Object.fromEntries(
            chips.map(chip => [chip.getAttribute('data-vama-shakti-class'), chip.getAttribute('data-glyph')])
        );
        expect(byClass).toEqual({ sprite: '✦', daemon: '◐', mantra: '〰' });
    });

    it('CPF gate: the wizard refuses to open until brainstorm confirmed + coordinate pinned, and never invokes scene_open/summon while closed', () => {
        render(<M4DialogicalArenaPane fixture={{ scenes: [], roster: [], turns: [], warm: FIXTURE_WARM }} />);

        fireEvent.click(screen.getByTestId('m4-arena-new-scene'));
        const openButton = () => screen.getByTestId('m4-arena-wizard-open') as HTMLButtonElement;
        expect(openButton().disabled).toBe(true);
        expect(openButton().getAttribute('data-gate-reason')).toBe('cpf-brainstorm-required');

        // Clicking the disabled gate must not fire any arena invoke.
        fireEvent.click(openButton());
        const arenaCalls = invoke.mock.calls.filter(
            ([method]) => method === ARENA_SCENE_OPEN_RPC || method === ARENA_SUMMON_RPC
        );
        expect(arenaCalls).toHaveLength(0);

        fireEvent.click(screen.getByTestId('m4-arena-wizard-confirm-brainstorm'));
        expect(openButton().getAttribute('data-gate-reason')).toBe('pinned-coordinate-required');
        expect(openButton().disabled).toBe(true);

        fireEvent.change(screen.getByTestId('m4-arena-wizard-coordinate'), { target: { value: 'C5' } });
        expect(openButton().disabled).toBe(false);
        expect(openButton().getAttribute('data-gate-reason')).toBe('ready');
    });

    it('warm-rail Admit stages into the CPF-gated wizard (no direct summon path) and the staged scene opens with the admitted classes', () => {
        render(<M4DialogicalArenaPane fixture={{ scenes: [], roster: [], turns: [], warm: FIXTURE_WARM }} />);

        fireEvent.click(screen.getAllByTestId('m4-arena-warm-admit')[1]); // daemon row
        expect(screen.getByTestId('m4-arena-wizard')).toBeTruthy();
        expect(screen.getAllByTestId('m4-arena-wizard-admission')).toHaveLength(1);

        fireEvent.click(screen.getByTestId('m4-arena-wizard-confirm-brainstorm'));
        fireEvent.change(screen.getByTestId('m4-arena-wizard-coordinate'), { target: { value: 'M4-3' } });
        fireEvent.click(screen.getByTestId('m4-arena-wizard-open'));

        // Fixture mode: the scene opens locally with the staged admission.
        expect(screen.getAllByTestId('m4-arena-scene-tab')).toHaveLength(1);
        const chips = screen.getAllByTestId('m4-arena-vama-chip');
        expect(chips).toHaveLength(1);
        expect(chips[0].getAttribute('data-vama-shakti-class')).toBe('daemon');
        // No live invokes in fixture mode — the gate law was exercised purely.
        const arenaCalls = invoke.mock.calls.filter(([method]) => String(method).startsWith('m4.arena.'));
        expect(arenaCalls).toHaveLength(0);
    });

    it('utterance input appends a user turn to the scrollback', () => {
        render(
            <M4DialogicalArenaPane
                fixture={{ scenes: [FIXTURE_SCENE], roster: FIXTURE_ROSTER, turns: [], warm: [] }}
            />
        );
        fireEvent.change(screen.getByTestId('m4-arena-input-field'), { target: { value: 'speak, friends' } });
        fireEvent.submit(screen.getByTestId('m4-arena-input'));
        const turns = screen.getAllByTestId('m4-arena-turn');
        expect(turns).toHaveLength(1);
        expect(turns[0].getAttribute('data-speaker-kind')).toBe('user');
        expect(screen.getByTestId('m4-arena-turn-line').textContent).toBe('speak, friends');
    });

    it('renders the honest pending-wire banner on live mode while the family is unimplemented', async () => {
        invoke.mockRejectedValue(new Error('gateway error: unimplemented'));
        render(<M4DialogicalArenaPane />);
        expect(await screen.findByTestId('m4-arena-pending-wire')).toBeTruthy();
    });

    it('warm classifier filter narrows the rail to the selected class', () => {
        render(<M4DialogicalArenaPane fixture={{ scenes: [], roster: [], turns: [], warm: FIXTURE_WARM }} />);
        expect(screen.getAllByTestId('m4-arena-warm-item')).toHaveLength(2);
        fireEvent.change(screen.getByTestId('m4-arena-warm-filter'), { target: { value: 'sprite' } });
        const items = screen.getAllByTestId('m4-arena-warm-item');
        expect(items).toHaveLength(1);
        expect(items[0].getAttribute('data-vama-shakti-class')).toBe('sprite');
    });
});
