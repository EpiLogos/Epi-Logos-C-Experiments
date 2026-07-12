import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    NaraDayResonanceStrip,
    NaraKleinWeightingChip,
    NaraResonanceChip
} from './M4NaraResonanceSurface';
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
        // The Klein chip mounts on the strip and shows the honest no-session state
        expect(screen.getByTestId('nara-klein-weighting').dataset.state).toBe('pending-weighting');
    });
});

describe('NaraKleinWeightingChip (05.T5.15 c_3_klein_weighting render law)', () => {
    beforeEach(() => {
        invokeCommand.mockReset();
    });
    afterEach(cleanup);

    const day = '12-07-2026';
    const dayPath = `Empty/Present/${day}`;
    const sessionDir = `${dayPath}/20260712-000600-9b0057`;
    const entries = [
        { name: 'daily-note.md', path: `${dayPath}/daily-note.md`, isDir: false },
        { name: '20260712-000600-9b0057', path: sessionDir, isDir: true }
    ];

    function mockVault(nowContent: string | null) {
        invokeCommand.mockImplementation((command: unknown, args: unknown) => {
            if (command === 'vault_list') {
                return Promise.resolve(entries);
            }
            if (command === 'vault_read') {
                expect(args).toEqual({ path: `${sessionDir}/now.md` });
                return nowContent === null
                    ? Promise.reject(new Error('not-found'))
                    : Promise.resolve({ path: `${sessionDir}/now.md`, content: nowContent });
            }
            return Promise.reject(new Error(`unexpected: ${String(command)}`));
        });
    }

    it('renders the weighting from the latest session NOW frontmatter', async () => {
        mockVault(
            `---\nsession_id: "20260712-000600-9b0057"\nc_3_klein_weighting:\n  prospective: 0.4\n  retrospective: 0.6\n---\n# NOW\n`
        );
        render(<NaraKleinWeightingChip dayNow={day} />);

        const chip = await screen.findByText('40% prospective · 60% retrospective');
        expect(chip.dataset.state).toBe('resolved');
        expect(chip.dataset.prospective).toBe('0.4');
        expect(chip.dataset.retrospective).toBe('0.6');
        expect(chip.title).toBe(`${sessionDir}/now.md`);
    });

    it('renders the honest pending state when the frontmatter key is absent (live shape today)', async () => {
        mockVault(`---\nsession_id: "20260712-000600-9b0057"\nday_id: "12-07-2026"\n---\n# NOW\n`);
        render(<NaraKleinWeightingChip dayNow={day} />);

        const chip = await screen.findByTestId('nara-klein-weighting');
        expect(chip.textContent).toBe('pending-weighting');
        expect(chip.dataset.state).toBe('pending-weighting');
        expect(chip.dataset.prospective).toBe('');
    });

    it('renders pending when the session now.md cannot be read', async () => {
        mockVault(null);
        render(<NaraKleinWeightingChip dayNow={day} />);

        const chip = await screen.findByTestId('nara-klein-weighting');
        expect(chip.dataset.state).toBe('pending-weighting');
        expect(chip.textContent).toBe('pending-weighting');
    });
});
