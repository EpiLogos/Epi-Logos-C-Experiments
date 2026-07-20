import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { CompositionStatePort } from './compositionState';
import { readCompositionState } from './compositionState';
import {
    buildCompositionIntent,
    COMPOSITION_ROUTES,
    dispatchCompositionIntent
} from './integratedDeepLinks';

class FilesystemPort implements CompositionStatePort {
    constructor(private readonly root: string) {}
    async load(id: string): Promise<string | null> {
        try {
            return await readFile(join(this.root, `${id}.json`), 'utf8');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
            throw error;
        }
    }
    async save(id: string, json: string): Promise<void> {
        await mkdir(this.root, { recursive: true });
        await writeFile(join(this.root, `${id}.json`), json, 'utf8');
    }
}

describe('integrated composition deep links (29.T29.14)', () => {
    it('persists cosmic state hints before dispatching the daily composition target', async () => {
        const port = new FilesystemPort(await mkdtemp(join(tmpdir(), 'composition-intent-')));
        const dispatch = vi.fn().mockResolvedValue(undefined);
        const intent = buildCompositionIntent('cosmic-engine.integrated', {
            coordinate: 'M3-2',
            pinnedMatrixFamily: 3,
            activeCodonCell: 42,
            selectedLensCell: { lensId: 'L3', cellIndex: 2 }
        });

        await dispatchCompositionIntent(intent, { statePort: port, dispatch });

        expect(intent.route).toBe(COMPOSITION_ROUTES.cosmicComposition);
        await expect(readCompositionState('cosmic-engine.integrated', port)).resolves.toMatchObject({
            pinnedMatrixFamily: 3,
            activeCodonCell: 42,
            selectedLensCell: { lensId: 'L3', cellIndex: 2 }
        });
        expect(dispatch.mock.calls[0]?.[1]).toMatchObject({
            artifactUri: COMPOSITION_ROUTES.cosmicComposition,
            requestedExtensionId: 'plugin-integrated-1-2-3',
            requestedContributionId: 'cosmic-composition'
        });
    });

    it('keeps protected personal handles opaque and refuses route/id mismatch', async () => {
        const port = new FilesystemPort(await mkdtemp(join(tmpdir(), 'composition-intent-')));
        const dispatch = vi.fn().mockResolvedValue(undefined);
        const intent = buildCompositionIntent('jiva-siva.integrated', {
            timeAxisMode: 'kairotic',
            senseOverride: 'retrospective',
            qComposedSnapshotId: 'q-composed://session/32'
        });
        await dispatchCompositionIntent(intent, { statePort: port, dispatch });
        expect(dispatch.mock.calls[0]?.[1]).toMatchObject({
            privacyClass: 'protected',
            requestedExtensionId: 'plugin-integrated-4-5-0'
        });

        await expect(dispatchCompositionIntent(
            { ...intent, route: COMPOSITION_ROUTES.cosmicComposition },
            { statePort: port, dispatch }
        )).rejects.toThrow('does not match');
    });
});
