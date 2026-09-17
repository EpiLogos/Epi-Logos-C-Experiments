/**
 * Coordinate: M' M1' (Backend Studio source-pack manifest, 22.T22.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M1' read-only source-navigation contribution.
 * Actualises: the curated M1 source pack to be consumed by the Backend Studio
 *   surface when its owning carrier tranche is live.
 * Public surface: BackendStudioLsp, BackendStudioSource, BackendStudioPack,
 *   M1_BACKEND_STUDIO_PACK.
 * Does NOT own: an LSP process, source-file opening, editor navigation, or the
 *   Backend Studio pane (28.T28.13).
 * Contract: [[M1'-SPEC]] + rerun [[22-m1-paramasiva-frontend-deep]] 22.12.
 */

export type BackendStudioLsp = 'rust-analyzer' | 'clangd' | 'pylsp';

export interface BackendStudioSource {
    readonly path: string;
    readonly lsp: BackendStudioLsp;
    readonly annotation: string;
    readonly readOnly: true;
}

export interface BackendStudioPack {
    readonly packId: 'm1-paramasiva.backend-studio-pack';
    readonly label: string;
    readonly owner: 'm1-paramasiva';
    readonly gatedOn: '28.T28.13';
    readonly sources: readonly BackendStudioSource[];
}

export const M1_BACKEND_STUDIO_PACK: BackendStudioPack = Object.freeze({
    packId: 'm1-paramasiva.backend-studio-pack',
    label: 'M1 Backend Pack - engine, harmonic profile, ring, Hopf, and Vimarsha',
    owner: 'm1-paramasiva',
    gatedOn: '28.T28.13',
    sources: Object.freeze([
        Object.freeze({
            path: 'Body/S/S0/epi-lib/include/m1.h',
            lsp: 'clangd',
            annotation: 'C M1 contract: ring quaternion, CL42 basis, QL trig, Ananda, and Spanda declarations.',
            readOnly: true
        }),
        Object.freeze({
            path: 'Body/S/S0/epi-lib/src/m1.c',
            lsp: 'clangd',
            annotation: 'C M1 definitions: six Ananda matrix tables and their runtime API.',
            readOnly: true
        }),
        Object.freeze({
            path: 'Body/S/S0/portal-core/src/kernel.rs',
            lsp: 'rust-analyzer',
            annotation: 'Matheme harmonic profile construction and kernel projection boundary.',
            readOnly: true
        }),
        Object.freeze({
            path: 'Body/S/S0/portal-core/src/hopf.rs',
            lsp: 'rust-analyzer',
            annotation: 'Hopf bundle projection and tick-facing fiber operations.',
            readOnly: true
        }),
        Object.freeze({
            path: 'Body/S/S0/portal-core/src/quaternion.rs',
            lsp: 'rust-analyzer',
            annotation: 'SU(2) quaternion operations and M1 walk/bifurcation derivations.',
            readOnly: true
        }),
        Object.freeze({
            path: 'Body/S/S0/portal-core/src/spanda.rs',
            lsp: 'rust-analyzer',
            annotation: 'Spanda phase quantisation and inversion operations.',
            readOnly: true
        }),
        Object.freeze({
            path: 'Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs',
            lsp: 'rust-analyzer',
            annotation: 'M2 Vimarsha audio and nodal projection, read-only from M1.',
            readOnly: true
        }),
        Object.freeze({
            path: 'Body/S/S0/portal-core/src/codon_rotation_projection.rs',
            lsp: 'rust-analyzer',
            annotation: 'M3 codon rotation projection, read-only Cl(4,2) reference for M1.',
            readOnly: true
        })
    ])
});
