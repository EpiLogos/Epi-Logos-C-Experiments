import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ORACLE_DEPOSIT_COMMAND,
    ORACLE_ICHING_CAST_METHOD,
    ORACLE_POSITION_STATE_METHOD,
    ORACLE_TAROT_CAST_METHOD,
    OraclePane,
    castTextOf
} from './OraclePane';
import { commands } from '../commands/registry';
import { setGateway } from '../bridge/gatewayHolder';
import { useSessionStore } from '../state/stores';
import { resetProfileTicks } from '../composition/profileTickSubscription';

const invokeCommand = vi.fn();
vi.mock('../bridge/tauri', () => ({
    invokeCommand: (...args: unknown[]) => invokeCommand(...args),
    listenEvent: vi.fn(async () => () => undefined)
}));

const gatewayInvoke = vi.fn();

function positions(count: number, kind: string) {
    return Array.from({ length: count }, (_, positionIndex) => ({
        positionIndex,
        cardId: kind === 'hexagram' ? 11 : positionIndex,
        cardKind: kind,
        liveState: 'generating',
        targetAspect: null
    }));
}

function envelope(count: number) {
    return {
        system: 'iching',
        cp_position_refs: Array.from({ length: count }, (_, index) => `CP4.3.${index + 1}`),
        vak_address: { cp: Array.from({ length: count }, (_, index) => `CP4.3.${index + 1}`), cs: { code: 'CS0', direction: 'Day' } },
        oracle_frame_ref: 'oracle-frame://cast/7',
        review_state: 'live-only',
        scalar_refs: [{ ref_kind: 'm3-codon', scalar_ref: 'm3-codon://ACG' }]
    };
}

function ichingReceipt() {
    const values = [6, 7, 8, 9, 7, 8] as const;
    return {
        castId: 7,
        spreadId: 'oracle-spread-7',
        system: 'iching',
        castAt: 1_700_000_000,
        hygiene: 'clear',
        output: 'I-Ching Cast #7',
        draw: {
            lines: values.map((value, index) => ({
                lineIndex: index + 1,
                value,
                lineType: ['old-yin', 'young-yang', 'young-yin', 'old-yang', 'young-yang', 'young-yin'][index],
                moving: value === 6 || value === 9,
                nucleotide: ['A', 'C', 'G', 'T', 'C', 'G'][index],
                codonRef: `m3-codon://ACG#line-${index + 1}`
            })),
            primaryHexagramId: 12,
            relatingHexagramId: 18,
            nuclearHexagramId: 4,
            torusPosition: 2,
            body: { dynamics: 'Head/Lungs', primaryChakra: 6, secondaryChakra: 6 }
        },
        positions: positions(6, 'hexagram'),
        envelope: envelope(6),
        spacetimePublished: false
    };
}

function tarotReceipt() {
    return {
        castId: 8,
        spreadId: 'oracle-spread-8',
        system: 'thoth',
        castAt: 1_700_000_100,
        hygiene: 'clear',
        output: 'Tarot Draw #8 (thoth)',
        draw: {
            spreadSize: 4,
            cards: Array.from({ length: 4 }, (_, positionIndex) => ({
                positionIndex,
                cardId: positionIndex,
                reversed: positionIndex === 2,
                cardKind: 'tarot-major',
                label: ['The Fool', 'The Magician', 'The High Priestess', 'The Empress'][positionIndex],
                codonRef: positionIndex === 2 ? null : `m3-codon://AT${positionIndex}`,
                codonBinding: positionIndex === 2 ? 'unbound' : 'primary',
                suit: null,
                rank: null,
                decan: null,
                planet: null,
                element: null,
                chakra: null,
                bodyZones: [],
                chainSource: 'kernel-oracle-luts'
            }))
        },
        positions: positions(4, 'tarot-major'),
        envelope: { ...envelope(4), system: 'thoth' },
        spacetimePublished: false
    };
}

function gatewayServing(receipt: unknown = ichingReceipt()) {
    gatewayInvoke.mockImplementation(async (method: string) => {
        if (method === 'nara.oracle.history.read') {
            return { artifact: { totalCount: 0, generatedAt: 1_700_000_200, entries: [] } };
        }
        if (method === ORACLE_POSITION_STATE_METHOD) {
            return { artifact: { liveState: 'muting' } };
        }
        return { artifact: receipt };
    });
    setGateway({ connected: true, invoke: gatewayInvoke } as never);
}

describe('OraclePane composite cast', () => {
    beforeEach(() => {
        invokeCommand.mockReset();
        gatewayInvoke.mockReset();
        gatewayServing();
        useSessionStore.setState({ sessionKey: 'session-7', dayNow: null, privacyClass: null });
        resetProfileTicks();
    });

    afterEach(() => {
        cleanup();
        setGateway(null);
    });

    it('refuses to cast without an anchored day', () => {
        render(<OraclePane />);
        expect(screen.getByTestId('oracle-no-day')).toBeTruthy();
    });

    it('casts I-Ching through the typed route, renders six lines, and deposits frame metadata', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        invokeCommand.mockResolvedValue({
            artifactPath: 'Empty/Present/02-07-2026/oracle-120000-iching.md',
            output: 'I-Ching Cast #7',
            system: 'iching',
            envelope: envelope(6)
        });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'what now?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));

        await screen.findByTestId('oracle-result');
        expect(gatewayInvoke).toHaveBeenCalledWith(ORACLE_ICHING_CAST_METHOD, {
            question: 'what now?',
            yes: true,
            sessionKey: 'session-7'
        });
        expect(screen.getAllByTestId(/oracle-iching-line-/)).toHaveLength(6);
        expect(screen.getByTestId('oracle-iching-line-1').dataset.lineType).toBe('old-yin');
        expect(invokeCommand).toHaveBeenCalledWith(ORACLE_DEPOSIT_COMMAND, expect.objectContaining({
            system: 'iching',
            metadata: expect.objectContaining({ castId: 7, spreadId: 'oracle-spread-7' })
        }));
        expect(screen.getByTestId('oracle-envelope').dataset.state).toBe('resolved');
    });

    it('casts the selected quaternal Thoth spread and renders four kernel-projected cards', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        gatewayServing(tarotReceipt());
        invokeCommand.mockResolvedValue({ artifactPath: 'oracle.md', output: 'Tarot Draw #8', system: 'thoth' });
        render(<OraclePane />);
        fireEvent.click(screen.getByTestId('oracle-mode-tarot'));
        fireEvent.change(screen.getByTestId('oracle-spread'), { target: { value: '4' } });
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'what needs attention?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));

        await screen.findByTestId('oracle-tarot-mode');
        expect(gatewayInvoke).toHaveBeenCalledWith(ORACLE_TAROT_CAST_METHOD, {
            system: 'thoth',
            question: 'what needs attention?',
            spreadSize: 4,
            yes: true,
            sessionKey: 'session-7'
        });
        expect(screen.getAllByTestId(/oracle-tarot-card-/)).toHaveLength(4);
        expect(screen.getByTestId('oracle-tarot-card-2').textContent).toContain('reversed');
        expect(screen.getByTestId('oracle-tarot-card-2').textContent).toContain('no primary codon');
    });

    it('advances a live position through the real state method', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        invokeCommand.mockResolvedValue({ artifactPath: 'oracle.md', output: 'I-Ching Cast #7', system: 'iching' });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'settle?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));
        await screen.findByTestId('oracle-iching-mode');
        fireEvent.click(screen.getByRole('button', { name: 'advance position 1 from generating' }));
        await waitFor(() => expect(screen.getByTestId('oracle-position-state-0').textContent).toBe('muting'));
        expect(gatewayInvoke).toHaveBeenCalledWith(ORACLE_POSITION_STATE_METHOD, {
            spreadId: 'oracle-spread-7',
            positionIndex: 0,
            liveState: 'muting'
        });
    });

    it('links the deposited artifact without invoking the retired spawn', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        invokeCommand.mockResolvedValue({ artifactPath: 'Empty/Present/02-07-2026/oracle.md', output: 'I-Ching Cast #7', system: 'iching' });
        const opened: unknown[] = [];
        const dispose = commands.register({ id: 'vault.open', title: 'open', run: argument => void opened.push(argument) });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'open?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));
        fireEvent.click(await screen.findByTestId('oracle-artifact-link'));
        expect(opened).toEqual(['Empty/Present/02-07-2026/oracle.md']);
        expect(invokeCommand).not.toHaveBeenCalledWith('oracle_cast', expect.anything());
        dispose();
    });

    it('surfaces strict receipt and hygiene refusals without depositing', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        gatewayInvoke.mockImplementation(async (method: string) => {
            if (method === 'nara.oracle.history.read') return { artifact: { totalCount: 0, generatedAt: 1, entries: [] } };
            throw new Error('Excessive frequency: 6 casts today (max 6)');
        });
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'again?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));
        expect((await screen.findByTestId('oracle-error')).textContent).toContain('Excessive frequency');
        expect(invokeCommand).not.toHaveBeenCalled();
    });

    it('never falls back to the host spawn when the gateway is disconnected', async () => {
        useSessionStore.setState({ dayNow: '02-07-2026' });
        setGateway(null);
        render(<OraclePane />);
        fireEvent.change(screen.getByTestId('oracle-question'), { target: { value: 'offline?' } });
        fireEvent.click(screen.getByTestId('oracle-cast'));
        expect((await screen.findByTestId('oracle-error')).textContent).toContain(ORACLE_ICHING_CAST_METHOD);
        expect(invokeCommand).not.toHaveBeenCalled();
    });

    it('keeps the legacy text narrow helper for the offline host only', () => {
        expect(castTextOf({ result: 'Tarot Draw #4' })).toBe('Tarot Draw #4');
        expect(castTextOf({ result: '' })).toBeNull();
        expect(castTextOf({ primary_hex: 12 })).toBeNull();
    });
});
