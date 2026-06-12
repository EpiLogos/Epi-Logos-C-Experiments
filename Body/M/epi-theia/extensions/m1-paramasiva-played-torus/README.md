# @pratibimba/m1-paramasiva-played-torus

Bevy / wgpu Theia extension rendering the M1-5 K² topology carrying the M1-2 Ananda vortex.

DR-M1-2 ratified 2026-06-02; first-build surface landed under cycle-3 Tranche 02.6.

**Architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) — IDE-side contract.
**Substrate authority:** [`Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](../../../../Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md).

This package is the first executable product surface: a Theia widget host plus a Rust renderer-contract crate under `wgpu/`. The renderer consumes `MathemeHarmonicProfile.ananda_vortex.active_cell_value`, `audio_octet`, and `nodal_quartet` from the shared profile bus; it does not carry local Ananda, Cl(4,2), quaternion, or Vimarsha derivation tables.
