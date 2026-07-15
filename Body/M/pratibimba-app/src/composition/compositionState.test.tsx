/**
 * Coordinate: M5' integrated composition persistence (29.T29.10)
 * Residency: Body/M/pratibimba-app/src/composition
 * Position (#n): #5 — integration of the M0'..M5' composition state
 * Actualises: behavioral proof that composition state survives face/layout
 *   replacement and process restart through a real filesystem port.
 * Public surface: none (tests).
 * Does NOT own: production filesystem access or composition-domain law.
 * Contract: [[M'-SYSTEM-SPEC]] / [[29-integrated-plugins-composition-deep]] T29.10
 */

import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    CompositionStateProvider,
    type CompositionStatePort,
    type IntegratedCompositionPersistedState,
    persistCompositionState,
    readCompositionState,
    useCompositionState
} from './compositionState';

class RealFilesystemPort implements CompositionStatePort {
    constructor(private readonly root: string) {}

    async load(compositionId: string): Promise<string | null> {
        try {
            return await readFile(join(this.root, `${compositionId}.json`), 'utf8');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
            throw error;
        }
    }

    async save(compositionId: string, json: string): Promise<void> {
        await mkdir(this.root, { recursive: true });
        await writeFile(join(this.root, `${compositionId}.json`), json, 'utf8');
    }
}

const COMPLETE_STATE: IntegratedCompositionPersistedState = {
    compositionId: 'cosmic-engine.integrated',
    coordinate: 'M3-2',
    lens: 'L4',
    mode: 'composed-cosmic-1-2-3',
    profileGeneration: 73,
    sessionKey: 'session-29-10',
    dayNow: '15-07-2026',
    pinnedMatrixFamily: 4,
    selectedLensCell: { lensId: 'L4', cellIndex: 5 },
    activeCodonCell: 63,
    k2OrientationQ: [0.5, -0.5, 0.5, -0.5],
    mathemeProofModeEnabled: true,
    timeAxisMode: 'kairotic',
    senseOverride: 'retrospective',
    qComposedSnapshotId: 'q-composed://snapshot/73',
    recognitionLayerView: 'wisdom-delta',
    anuttaraGroundingExpanded: true,
    miniInspectorActiveIds: ['m1-paramasiva', 'm5-epii']
};

async function realPort(): Promise<RealFilesystemPort> {
    return new RealFilesystemPort(await mkdtemp(join(tmpdir(), 'pratibimba-composition-')));
}

function StateHarness({ surface }: { surface: string }) {
    const { stateById, save, load } = useCompositionState();
    const state = stateById['cosmic-engine.integrated'];
    return (
        <div data-testid="surface" data-surface={surface}>
            <button onClick={() => void save(COMPLETE_STATE)}>save</button>
            <button onClick={() => void load('cosmic-engine.integrated')}>load</button>
            <output>{state ? JSON.stringify(state) : 'empty'}</output>
        </div>
    );
}

afterEach(cleanup);

describe('integrated composition persistence', () => {
    it('round-trips every state-spine and composition field through a real filesystem', async () => {
        const port = await realPort();
        await persistCompositionState(COMPLETE_STATE, port);
        await expect(readCompositionState('cosmic-engine.integrated', port)).resolves.toEqual(COMPLETE_STATE);
    });

    it('rejects raw quaternion material at the privacy boundary', async () => {
        const port = await realPort();
        await expect(
            persistCompositionState({
                ...COMPLETE_STATE,
                qComposedSnapshotId: '[0.5,-0.5,0.5,-0.5]'
            }, port)
        ).rejects.toThrow(/opaque q-composed handle/i);
    });

    it('preserves state across both layout/face replacement and provider restart', async () => {
        const port = await realPort();
        const first = render(
            <CompositionStateProvider port={port}>
                <StateHarness surface="daily-0-1/cosmic" />
            </CompositionStateProvider>
        );
        fireEvent.click(screen.getByText('save'));
        expect(await screen.findByText(JSON.stringify(COMPLETE_STATE))).toBeTruthy();

        first.rerender(
            <CompositionStateProvider port={port}>
                <StateHarness surface="ide-deep/personal" />
            </CompositionStateProvider>
        );
        expect(screen.getByTestId('surface').getAttribute('data-surface')).toBe('ide-deep/personal');
        expect(screen.getByText(JSON.stringify(COMPLETE_STATE))).toBeTruthy();

        first.unmount();
        render(
            <CompositionStateProvider port={port}>
                <StateHarness surface="daily-0-1/cosmic" />
            </CompositionStateProvider>
        );
        fireEvent.click(screen.getByText('load'));
        expect(await screen.findByText(JSON.stringify(COMPLETE_STATE))).toBeTruthy();
    });
});
