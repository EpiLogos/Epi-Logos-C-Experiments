# AGENTS.md — portal-core

## Purpose
Rust crate `portal-core`: "Pure math types and functions for the Epi-Logos portal clock — shared by epi-cli and epi-tauri".
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `Cargo.toml` — crate manifest (`portal-core`); deps `epi-lib`, `serde`, `serde_json`, `toml`; feature `resonance_ebm_runtime`
- `src/lib.rs` — crate root / public surface (re-exports the modules below)
- `src/kernel.rs` — clock kernel math (tick/epogdoon/projection), `E4PersonalInputs`, [[E_4]] personal-energy scalar/gradient provenance, and the re-export root for `src/kernel/`. `KernelTemporalProjection` carries the kernel-owned `kleinFlipState` (latched M2' cymatic valence: primary before tick-7 inversion, inverted through the Möbius return — Tranche 03.T3.1; the law lives in `parashakti::vimarsha_reading::cymatic_valence_state`).
- `src/kernel/` — split [[MathemeHarmonicProfile]] implementation and per-projection modules (`profile.rs`, `projections/*.rs`) surfaced through `src/kernel.rs` and the `src/harmonic_profile.rs` façade. `projections/modal_resonator.rs` is the bell-kernel contract ([[m123-modal-resonator-bell-kernel-spec]] §4): the additive `modalResonator` field on the profile — 12-slot chromatic body, 8 live carriers with exact-bus Hz, 4 nodal anchors, 7+5 partition, bell-partial roles; authority stays with `audio_octet`/`nodal_quartet`. `projections/pentadic_trace.rs` is the Rust mirror of the kernel-bridge `AnuttaraPentadicRuntimeTrace`/`buildPentadicTrace` (Tranche 36.T36.1): derived entirely from profile payloads + `luts::mahamaya` + the `m3_transcription_bridge` backbone constants (`M3_BACKBONE_DEGREE_STEP`/`M3_BACKBONE_NODE_COUNT`, 24×15=360). `profile_projections.rs::M1TopologyProjection` is now PRODUCED (Tranche 02.T2.3, was an orphan struct + fixture): `from_tick_parts` derives the M1-5 single-torus invariants (double-cover 720° and genus-1/χ=0 from `hopf.rs` constants, S3→S2 Hopf, ring/composed quaternion via `quaternion.rs` mirroring `state.rs`) + live klein-flip descriptors, and `MathemeHarmonicProfile::from_tick` attaches it as the additive `m1Topology` field the carrier's `KleinTopologyPane` reads (Zod parity in `epi-cli/schemas/kernel-bridge.ts`; baseline fixture re-blessed). Likewise `InversionOperatorHandle::session_held()` (Tranche 02.T2.5, was orphaned) is the SINGLE `#` (Inversion_Operator) attached to every profile as the additive `inversionOperator` field — the same `(0/1)` at every coordinate, never per-coordinate forked (M1'-SPEC §14); proven by `tests/m1_inversion_operator.rs`. The session-held `#`/Psychoid_Hash itself lives in `state.rs`.
- `src/state.rs`, `src/quaternion.rs`, `src/hopf.rs`, `src/spanda.rs` — clock state + quaternion/Hopf/spanda math. `spanda.rs` is the Rust MIRROR of the [[M1-3]] spanda dual-oscillator tick floor (Tranche 02.T2.11: HKB relative-phase field, standing-identity superposition, two involutions, flowering-first tick12 readout, codon advancement clock) — the oscillation reality is authored in `epi-lib` `m1.c`/`m1.h` (C ground → Rust surface); HKB coefficients are config-driven via `[ml.m1_paramasiva]` with derived defaults; canon at [[M1'-SPEC]] §14.1 + [[02-m1-paramasiva-reconciliation]] T2.11
- `src/luts/` — consolidated codon, transcription, [[M3]] mahamaya, oracle, rotational, and planet-Keplerian LUT surfaces; `src/lib.rs` keeps legacy module-path re-exports for compatibility
- `src/codon_rotation_projection.rs`, `src/m3_transcription_bridge.rs` — [[M3]] bridge projection and transcription bridge logic
- `src/personal_identity.rs`, `src/birthdate_identity.rs`, `src/vama_shakti.rs`, `src/nara_journal.rs`, `src/harmonic_profile.rs`, `src/profile_projections.rs`, `src/psychoid_cymatic/`, `src/aspect.rs`, `src/music_tech.rs` — identity + identity-augment proposal lifecycle, [[M4-0-0]] birthdate/name MEF encoding, [[Vama Shakti]] warm-state / Q-activity math, journal parser + protected [[Nara]] period-reading trajectory reconstruction, harmonic profile, [[M0]]-[[M5]] typed profile projections, handle-only psychoid-cymatic renderer derivation, aspects, music-tech
- `src/rfactor.rs`, `src/vak_address.rs`, `src/coordinate_phase.rs`, `src/types.rs` — R-factor namespace parsing, VAK addressing, phase-qualified coordinate handles, shared types
- `src/tunable/` — schema-backed tunable metadata, registry loader, scope resolver, and audit writer for `*.tunable.toml` config surfaces
- `src/events/` — `mod.rs`, `kernel_events.rs`, `flip_events.rs`, `bridge_events.rs`
- `src/parashakti/` — `mod.rs`, `f_routing.rs`, `vimarsha_reading.rs`
- `tunable-schema/` — schema declarations for migrated config knobs such as [[Nara]] weights, [[Aletheia]] drift/Elo, model slots, and [[Kairos]] enablement, plus Track 38 [[Nara]] session, [[Mythos]], [[Hen]], and cross-cutting tunables
- `tests/` — contract + math tests (kernel projection, klein-flip, [[M']] shared contracts, profile projections, parity, fixtures)
- `contract-inventory/` — frozen Track-01 baseline contract surface (`track-01-baseline.json`, `baseline-profile.json`, `README.md`)
- Does NOT own gateway/agent/graph semantics, CLI dispatch, or the C runtime itself — those live in [[S2]]/[[S3]]/[[S4]] and the `epi-lib` C crate (sibling under [[S0]]).

## Local Contracts
- (no CONTRACT.md at root) — binding surface is the public API in `src/lib.rs` plus the frozen inventory under `contract-inventory/` (see its `README.md`)
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; warn on HIGH/CRITICAL.
- Public-surface / fixture drift is a test failure: re-bless only on intentional schema change (`BASELINE_FIXTURE_BLESS=1`); never hand-edit `baseline-profile.json` (it is generated).
- Reference all coordinates/specs/crates as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p portal-core` (or `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml`).
- Baseline fixture: `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test track_01_t0_baseline_fixture`.
- Phase-qualified VAK resolve: `cargo test -p portal-core --test vak_resolve_preserves_prime_phase`.
- Profile projections: `cargo test -p portal-core --test profile_projections_full_suite`.
- Modal resonator (bell kernel §11): `cargo test -p portal-core --test modal_resonator_profile_field`.
- Live-sky planet degrees: `cargo test -p portal-core --test planet_degrees_profile_field`.
- Phase-space core (Sprint-8 E1/E2): `cargo test -p portal-core --test phase_space_profile_field` — FFI parity with `epi-lib::CLOCK_DEGREE_LUT` (.rodata; the C table is the ONLY degree/hexagram/codon authority, bound in `src/kernel/projections/phase_space.rs`, never re-derived), the 384=360+24=64×6 topology, the zodiac-ordered Chaldean decan law (one table kernel-wide), the §4 lens formula, and the 16+1 temporal apertures.
- [[M4-0-0]] birthdate encoding: `cargo test -p portal-core m4_0_0_birthdate_encoding`.
- [[Vama Shakti]] Q-activity accumulator: `cargo test -p portal-core --test q_activity_accumulator`.
- Psychoid-cymatic handle derivation: `cargo test -p portal-core --test psychoid_cymatic_handle`.
- Tunable registry: `cargo test -p portal-core --test tunable_full_registry` and `cargo test -p portal-core --test kairos_enabled_compat`.
- Tunable foundation: `cargo test -p portal-core --test tunable_metadata --test tunable_registry_load --test tunable_registry_validate --test tunable_registry_merge --test tunable_scope --test tunable_audit --test tunable_full_registry`.

## Child DOX Index
- (leaf)
