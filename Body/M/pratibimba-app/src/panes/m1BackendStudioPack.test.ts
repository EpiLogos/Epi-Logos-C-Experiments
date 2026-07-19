/**
 * Coordinate: M' M1' (Backend Studio source-pack proof, 22.T22.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M1 source-navigation manifest gate.
 * Actualises: verification that every pack entry resolves to a real source file
 *   with the language-server category the future Backend Studio will require.
 * Public surface: Vitest suite for M1_BACKEND_STUDIO_PACK.
 * Does NOT own: LSP lifecycle, source opening, or the Backend Studio pane.
 * Contract: [[M1'-SPEC]] + rerun [[22-m1-paramasiva-frontend-deep]] 22.12.
 */

import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { M1_BACKEND_STUDIO_PACK } from './m1BackendStudioPack';

const REPOSITORY_ROOT = resolve(__dirname, '../../../../..');

describe('M1 Backend Studio pack (22.T22.12)', () => {
    it('declares the eight curated read-only M1 anchors with their real language servers', () => {
        const sources = M1_BACKEND_STUDIO_PACK.sources;

        expect(M1_BACKEND_STUDIO_PACK).toMatchObject({
            packId: 'm1-paramasiva.backend-studio-pack',
            owner: 'm1-paramasiva',
            gatedOn: '28.T28.13'
        });
        expect(sources).toHaveLength(8);
        expect(sources.map(source => `${source.lsp}:${source.path}`)).toEqual([
            'clangd:Body/S/S0/epi-lib/include/m1.h',
            'clangd:Body/S/S0/epi-lib/src/m1.c',
            'rust-analyzer:Body/S/S0/portal-core/src/kernel.rs',
            'rust-analyzer:Body/S/S0/portal-core/src/hopf.rs',
            'rust-analyzer:Body/S/S0/portal-core/src/quaternion.rs',
            'rust-analyzer:Body/S/S0/portal-core/src/spanda.rs',
            'rust-analyzer:Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs',
            'rust-analyzer:Body/S/S0/portal-core/src/codon_rotation_projection.rs'
        ]);
        for (const source of sources) {
            expect(source.readOnly).toBe(true);
            expect(source.annotation.length).toBeGreaterThan(20);
            expect(statSync(resolve(REPOSITORY_ROOT, source.path)).isFile()).toBe(true);
        }
    });
});
