/**
 * Coordinate: M' M4' (ambient/tuning tests, rerun 11.T11.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M4-0' day canvas chrome
 * Actualises: strict ambient projection and real session-NOW write intent.
 * Public surface: behavioral tests for NaraAmbientTuning.
 * Does NOT own: Medicine law, Janus defaults, or vault persistence law.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.4–2.5.
 */

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ambientModelFromProfile, NaraTuningBar, tuningFromNowContent, updateTuningFrontmatter } from './NaraAmbientTuning';

const NOW = `---\nsession_id: s\nc_3_tranche_mode: quiet:90m\nc_3_response_orbit: next-morning\nc_3_klein_weighting:\n  prospective: 0.4\n  retrospective: 0.6\n---\n# NOW\n\nBody stays.\n`;
const invokeCommand = vi.fn(async (command: string, _args?: Record<string, unknown>) => {
    if (command === 'vault_list') return [{ name: '20260716-100000-s', path: 'Empty/Present/16-07-2026/20260716-100000-s', isDir: true }];
    if (command === 'vault_read') return { content: NOW };
    if (command === 'vault_write') return undefined;
    throw new Error(`unexpected ${command}`);
});

vi.mock('../bridge/tauri', () => ({ invokeCommand: (command: string, args?: Record<string, unknown>) => invokeCommand(command, args) }));
afterEach(() => { cleanup(); invokeCommand.mockClear(); });

describe('Nara ambient and tuning chrome', () => {
    it('projects canonical Earth/Water/Air/Fire order and real spread state', () => {
        const model = ambientModelFromProfile({ harmonicProfile: { personalPole: { elementalBalance: {
            earth: 0.4, water: 0.3, air: 0.2, fire: 0.1, dominant: 'earth', activeChakra: 'root', decanRulingPlanet: 'Saturn'
        } }, oracleSpreadState: { active: 3, generating: 7, muting: 2 } } });
        expect(model.elements?.map(item => item.name)).toEqual(['Earth', 'Water', 'Air', 'Fire']);
        expect(model.dominant).toBe('Earth');
        expect(model.chakra).toBe('root');
        expect(model.spreadSummary).toBe('3 spreads · 7 generating · 2 muting');
    });

    it('updates only canonical tuning keys and preserves the NOW body', () => {
        expect(tuningFromNowContent(NOW)).toMatchObject({ prospective: 0.4, retrospective: 0.6 });
        const updated = updateTuningFrontmatter(NOW, { trancheMode: 'rhythm', responseOrbit: 'saturnine', prospective: 0.7, retrospective: 0.3 });
        expect(updated).toContain('c_3_tranche_mode: rhythm');
        expect(updated).toContain('c_3_response_orbit: saturnine');
        expect(updated).toContain('prospective: 0.7');
        expect(updated).toContain('# NOW\n\nBody stays.');
    });

    it('writes a tuning change through the latest real session-NOW path', async () => {
        render(<NaraTuningBar dayNow="16-07-2026" />);
        const bar = await screen.findByTestId('nara-tuning-bar');
        await waitFor(() => expect(bar.dataset.status).toBe('ready'));
        fireEvent.click(screen.getByRole('button', { name: 'rhythm' }));
        await waitFor(() => expect(bar.dataset.status).toBe('saved'));
        const write = invokeCommand.mock.calls.find(call => call[0] === 'vault_write');
        expect(write?.[1]).toMatchObject({ path: 'Empty/Present/16-07-2026/20260716-100000-s/now.md' });
        expect(String(write?.[1]?.content)).toContain('c_3_tranche_mode: rhythm');
        expect(String(write?.[1]?.content)).toContain('Body stays.');

        fireEvent.keyDown(window, { key: '1', altKey: true, shiftKey: true });
        await waitFor(() => {
            const writes = invokeCommand.mock.calls.filter(call => call[0] === 'vault_write');
            expect(String(writes.at(-1)?.[1]?.content)).toContain('c_3_tranche_mode: explicit');
        });
    });
});
