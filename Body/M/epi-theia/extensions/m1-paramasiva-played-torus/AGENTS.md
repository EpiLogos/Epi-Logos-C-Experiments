# AGENTS.md — m1-paramasiva-played-torus

## Purpose
RETIRING — do not build on this. New M1 3D-render work should be confirmed against the parent before extending here.
`@pratibimba/m1-paramasiva-played-torus`: "M1-2/M1-5 played K2 torus Theia surface. Hosts the Bevy/wgpu renderer contract and consumes Ananda/Vimarsha state only through the shared profile bus" (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[M1'-SPEC]] (substrate authority: `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`).

## Ownership
- `package.json` — `@pratibimba/m1-paramasiva-played-torus` workspace package; `theiaExtensions.frontend` + Bevy/wgpu toolchain metadata.
- `ARCHITECTURE.md` — IDE-side contract (contract version, contributions, profile-field consumption, readiness, acceptance tests).
- `README.md` — brief; points at `ARCHITECTURE.md` and the substrate authority.
- `src/common/` — extension surface contract: `played-torus-surface.ts`, `vortex-renderer-handle.ts`, `index.ts` (public surface).
- `src/browser/` — `played-torus-widget.tsx` widget host (embeds wgpu canvas) + `frontend-module.ts`.
- `wgpu/` — `m1-paramasiva-played-torus-wgpu` Rust crate (Bevy/wgpu renderer contract): `Cargo.toml`, `src/` (`lib.rs`, `k2_mesh.rs`, `ananda_heatmap.rs`, `dr_streamlines.rs`, `cl42_colour.rs`, `hopf_shadow.rs`, `diamond_centre.rs`, `tick_choreography.rs`), `shaders/*.wgsl`, `tests/render_acceptance.rs`.
- `style/played-torus.css` — widget styling.
- Does NOT own: profile derivation (consumes `MathemeHarmonicProfile.ananda_vortex`/`audio_octet`/`nodal_quartet` from `portal-core` via the shared bus — no local Ananda/Cl(4,2)/quaternion/Vimarsha LUTs); gateway access (mediated by `kernel-bridge`); the 2D clock instrument (sibling `m1-paramasiva`).

## Local Contracts
- `ARCHITECTURE.md` — IDE-side contract, version `2026-06-02.15-M1-2-vortex`.
- Coordinate Header: `wgpu/Cargo.toml` description — "Bevy/wgpu renderer contract for the M1 K2 played torus, consuming portal-core profile state."
- Owning spec: [[M1'-SPEC]] / `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` (substrate-side authoritative for profile consumption).

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- No local substrate forks: do not add `RING_QUATERNION_LUT`/`CL42_BASIS`/`DR_RING_MAHAMAYA` or audio/nodal derivation helpers (ARCHITECTURE.md acceptance audits forbid them); consume profile fields only.
- No T²_Mahāmāya / double-torus references in `src/` or `wgpu/src/` (boundary audit).

## Verification
`pnpm --filter @pratibimba/m1-paramasiva-played-torus test` (runs `tsc -b`, `node --test tests/played-torus-contract.test.mjs`, then `cargo check`/`cargo test --test render_acceptance` against `wgpu/Cargo.toml`).

## Child DOX Index
- (leaf)
