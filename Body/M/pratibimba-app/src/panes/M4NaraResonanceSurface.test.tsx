import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NaraDayResonanceStrip, NaraResonanceChip } from './M4NaraResonanceSurface';
import { normalizeResonanceIndicator } from './m4NaraResonance';
import { useTickStore } from '../state/stores';

const invokeCommand = vi.fn();
vi.mock('../bridge/tauri', () => ({
    invokeCommand: (...args: unknown[]) => invokeCommand(...args),
    listenEvent: vi.fn(async () => () => undefined)
}));

function seedProfile(harmonicProfile: Record<string, unknown> | null) {
    useTickStore.setState({
        generation: 3,
        profile:
            harmonicProfile === null
                ? null
                : ({
                      generation: 3,
                      cachedAtMs: 0,
                      stale: false,
                      stalenessMs: 0,
                      privacyClass: 'safe-public-current-kernel-tick',
                      profile: { harmonicProfile }
                  } as never)
    } as never);
}

describe('NaraResonanceChip (05.T5.1 §6.5 render law)', () => {
    afterEach(cleanup);

    it('renders a resolved indicator as numeric + conjugate-form-character', () => {
        render(
            <NaraResonanceChip
                indicator={normalizeResonanceIndicator({
                    numeric: 0.812,
                    conjugateFormCharacter: 'Major'
                })}
                testId="chip"
            />
        );
        const chip = screen.getByTestId('chip');
        expect(chip.textContent).toBe('0.812 Major');
        expect(chip.dataset.state).toBe('resolved');
        expect(chip.dataset.character).toBe('Major');
    });

    it('renders the pending-resonance fallback verbatim when the stamp is absent', () => {
        render(<NaraResonanceChip indicator={normalizeResonanceIndicator(undefined)} testId="chip" />);
        const chip = screen.getByTestId('chip');
        expect(chip.textContent).toBe('pending-resonance');
        expect(chip.dataset.state).toBe('pending-resonance');
        expect(chip.dataset.character).toBe('');
    });
});

describe('NaraDayResonanceStrip (day summary on the day surface)', () => {
    beforeEach(() => {
        invokeCommand.mockReset();
        useTickStore.setState({ generation: null, profile: null } as never);
    });
    afterEach(cleanup);

    it('shows the at-now indicator from the personal pole and pending aggregation over unstamped artifacts', async () => {
        seedProfile({
            // raw interior present on the bus — must NEVER reach the DOM (§6.5)
            qCosmic: [0.1234, 0.5678, 0.9012, 0.3456],
            personalPole: {
                resonance: { score: 0.931, conjugateFormCharacter: 'ShadowInversion' },
                qPersonalHandle: {
                    targetKind: 'q-personal',
                    handle: 'm4.protected://q-personal/7',
                    privacy: 'protected-local-body'
                }
            }
        });
        invokeCommand.mockResolvedValue([
            { name: 'daily-note.md', path: 'Empty/Present/02-07-2026/daily-note.md', isDir: false },
            { name: 'oracle-120000-rws.md', path: 'Empty/Present/02-07-2026/oracle-120000-rws.md', isDir: false },
            { name: 'dream-070000.md', path: 'Empty/Present/02-07-2026/dream-070000.md', isDir: false },
            { name: '20260702-120000-abc123', path: 'Empty/Present/02-07-2026/20260702-120000-abc123', isDir: true }
        ]);

        render(<NaraDayResonanceStrip dayNow="02-07-2026" />);

        // at-now indicator: kernel wire ShadowInversion renders as §6.5 Shadow
        const now = screen.getByTestId('nara-resonance-now');
        expect(now.textContent).toBe('0.931 Shadow');
        expect(now.dataset.state).toBe('resolved');

        // day aggregation: 2 artifact envelopes (daily-note + NOW dir excluded),
        // both unstamped — the honest pending-resonance fallback
        const counts = await screen.findByTestId('nara-day-resonance-counts');
        expect(counts.textContent).toContain('pending 2');
        expect(screen.getByTestId('nara-day-resonance').dataset.state).toBe('pending-resonance');
        expect(screen.getByTestId('nara-day-resonance-label').textContent).toBe('pending-resonance');
        expect(invokeCommand).toHaveBeenCalledWith('vault_list', { path: 'Empty/Present/02-07-2026' });

        // §6.5 no-quaternion-dump law: none of the raw interior reaches the DOM
        const strip = screen.getByTestId('nara-day-resonance');
        expect(strip.textContent).not.toContain('0.5678');
        expect(strip.textContent).not.toContain('qCosmic');
        expect(strip.textContent).not.toContain('q_personal');
    });

    it('renders the pending-resonance fallback end-to-end when no profile and no artifacts exist', async () => {
        invokeCommand.mockResolvedValue([]);
        render(<NaraDayResonanceStrip dayNow="02-07-2026" />);

        const now = screen.getByTestId('nara-resonance-now');
        expect(now.textContent).toBe('pending-resonance');
        expect(now.dataset.state).toBe('pending-resonance');
        expect((await screen.findByTestId('nara-day-resonance')).dataset.state).toBe(
            'pending-resonance'
        );
    });
});
