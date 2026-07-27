/**
 * Coordinate: M' C5/CS MOC-Base integration proof (48.T48.4).
 * Actualises: the active carrier reading real MOC/Base/canvas artifacts,
 * evaluating their filters over the real vault, and rendering living rows.
 * Does NOT own: authored MOC membership law or Hen write authority.
 */

import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    FileSystemLike,
    loadCanvasBaseReflections,
    loadMocBaseSections
} from './mocBaseRuntime';
import { MocBaseReflectionPane } from './MocBaseReflectionPane';

const IDEA_ROOT = resolve(import.meta.dirname, '../../../../../Idea');

const realVault: FileSystemLike = {
    readText: path => readFile(resolve(IDEA_ROOT, path), 'utf8'),
    list: async path => {
        const entries = await readdir(resolve(IDEA_ROOT, path), { withFileTypes: true });
        return entries.map(entry => ({
            path: path ? `${path}/${entry.name}` : entry.name,
            isDirectory: entry.isDirectory()
        }));
    }
};

afterEach(cleanup);

describe('MOC/Base production integration over the real vault', () => {
    it('executes the S1 living-membership and open-gap queries', async () => {
        const sections = await loadMocBaseSections(
            'Bimba/World/Types/Coordinates/S/S1/S1.md',
            realVault
        );

        expect(sections.map(section => section.heading)).toEqual(['What Belongs Here', 'Open Gaps']);
        expect(sections[0].rows.map(row => row.coordinate)).toEqual(['S1']);
        expect(sections[1].rows).toHaveLength(0);
    });

    it('resolves the real canvas Base node and evaluates its views', async () => {
        const reflections = await loadCanvasBaseReflections(
            'Bimba/World/Types/Coordinates/S/S1/S1.canvas',
            realVault
        );

        expect(reflections).toHaveLength(1);
        expect(reflections[0].sourcePath).toBe('Bimba/World/Types/Crystallisation-Pipeline.base');
        expect(reflections[0].views).toHaveLength(3);
        expect(reflections[0].rows.length).toBeGreaterThan(10);
    });

    // Real-vault I/O: this reads and projects actual vault files, so it is
    // I/O-bound by design and the 5s vitest default is a load-sensitive
    // boundary rather than a real budget — under parallel disk contention it
    // has been killed mid-read, reporting RED while proving nothing.
    it('executes the Map aggregate Base over projected map-index records', { timeout: 30_000 }, async () => {
        const sections = await loadMocBaseSections('Bimba/Map/AGENTS.md', realVault);
        const membership = sections.find(section => section.heading === 'What Belongs Here');

        expect(membership?.sourcePath).toBe('Bimba/Map/Map-Aggregate-Browser.base');
        expect(membership?.views.map(view => view.name)).toContain('Map cards');
        expect(membership?.rows.length).toBeGreaterThan(900);
        expect(membership?.rows.every(row => row.c_4_artifact_role === 'map-index')).toBe(true);
    });

    // Same real-vault I/O as above, reached through the pane: the pane holds
    // `moc-base-loading` until the actual vault read resolves, so findBy's 1s
    // default is what expires under contention — not the render. Both the wait
    // and the test budget are sized to the read, not to a quiet machine.
    it('renders the evaluated rows in the active carrier pane', { timeout: 30_000 }, async () => {
        render(
            <MocBaseReflectionPane
                mocPath="Bimba/World/Types/Coordinates/S/S1/S1.md"
                fileSystem={realVault}
            />
        );

        expect(await screen.findByTestId('moc-base-ready', undefined, { timeout: 20_000 })).toBeTruthy();
        expect(screen.getByText('S1')).toBeTruthy();
        expect(screen.getByTestId('moc-base-section-open-gaps').textContent).toContain('0 rows');
    });
});
