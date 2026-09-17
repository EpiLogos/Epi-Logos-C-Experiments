export interface BackendStudioSource {
    readonly path: string;
    readonly lsp: 'rust-analyzer' | 'clangd' | 'pylsp';
    readonly annotation: string;
    readonly readOnly: boolean;
}

export const M1_BACKEND_STUDIO_PACK = Object.freeze({
    packId: 'm1-paramasiva.backend-studio-pack',
    label: 'M1 Backend Pack — engine + harmonic profile + ring + Hopf + Vimarśa',
    owner: 'm1-paramasiva',
    sources: Object.freeze<readonly BackendStudioSource[]>([
        {
            path: 'Body/S/S0/epi-lib/include/m1.h',
            lsp: 'clangd',
            annotation: 'C header — RING_QUATERNION_LUT[12], CL42_BASIS[6], QL_TRIG_TABLE[6], DR_RING_MAHAMAYA[6], DR_RING_PARASHAKTI[6], ANANDA_RING_SIZE, SPANDA_SEED_BITS, TORUS_GENUS, DOUBLE_COVER_DEG, Ananda_Matrix_Op/Spanda_Stage parallel-track invariant at L735-756',
            readOnly: true
        },
        {
            path: 'Body/S/S0/epi-lib/src/m1.c',
            lsp: 'clangd',
            annotation: 'C source — six Ananda matrices .rodata (L22-114) + runtime API (L297-345)',
            readOnly: true
        },
        {
            path: 'Body/S/S0/portal-core/src/kernel.rs',
            lsp: 'rust-analyzer',
            annotation: 'MathemeHarmonicProfile struct (L346-465) + from_tick constructor',
            readOnly: true
        },
        {
            path: 'Body/S/S0/portal-core/src/hopf.rs',
            lsp: 'rust-analyzer',
            annotation: 'Hopf bundle S³ → S² → S¹ projection (hopf_project, hopf_fiber, hopf_tick12)',
            readOnly: true
        },
        {
            path: 'Body/S/S0/portal-core/src/quaternion.rs',
            lsp: 'rust-analyzer',
            annotation: 'SU(2) math — quat_mul, quat_normalize, quat_slerp, derive_walk_mode, derive_bifurcation',
            readOnly: true
        },
        {
            path: 'Body/S/S0/portal-core/src/spanda.rs',
            lsp: 'rust-analyzer',
            annotation: 'Spanda phase quantiser — quantize_to_spanda_substage(y, x), spanda_invert(stage)',
            readOnly: true
        },
        {
            path: 'Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs',
            lsp: 'rust-analyzer',
            annotation: 'Vimarśa M2-1\' writes audio_octet[8] + nodal_quartet[4] — READ-ONLY reference for M1\' (M1\' consumes; never writes)',
            readOnly: true
        },
        {
            path: 'Body/S/S0/portal-core/src/codon_rotation_projection.rs',
            lsp: 'rust-analyzer',
            annotation: 'M3 codon scale of Cl(4,2) — read-only reference for the four-scale Cl(4,2) identity (Tranche 02.7)',
            readOnly: true
        }
    ])
});
