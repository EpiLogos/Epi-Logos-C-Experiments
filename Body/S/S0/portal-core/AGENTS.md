# AGENTS.md — portal-core

## Purpose
Rust crate `portal-core`: "Pure math types and functions for the Epi-Logos portal clock — shared by epi-cli and epi-tauri".
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `Cargo.toml` — crate manifest (`portal-core`); deps `epi-lib`, `serde`, `serde_json`, `toml`; feature `resonance_ebm_runtime`
- `src/lib.rs` — crate root / public surface (re-exports the modules below)
- `src/kernel.rs` — clock kernel math (tick/epogdoon/projection), `E4PersonalInputs`, [[E_4]] personal-energy scalar/gradient provenance, and the re-export root for `src/kernel/`. `KernelTemporalProjection` carries the kernel-owned `kleinFlipState` (latched M2' cymatic valence: primary before tick-7 inversion, inverted through the Möbius return — Tranche 03.T3.1; the law lives in `parashakti::vimarsha_reading::cymatic_valence_state`).
- `src/kernel/` — split [[MathemeHarmonicProfile]] implementation and per-projection modules (`profile.rs`, `projections/*.rs`) surfaced through `src/kernel.rs` and the `src/harmonic_profile.rs` façade. `projections/modal_resonator.rs` is the bell-kernel contract ([[m123-modal-resonator-bell-kernel-spec]] §4): the additive `modalResonator` field on the profile — 12-slot chromatic body, 8 live carriers with exact-bus Hz, 4 nodal anchors, 7+5 partition, bell-partial roles; authority stays with `audio_octet`/`nodal_quartet`. `projections/pentadic_trace.rs` owns the existing `AnuttaraPentadicRuntimeTrace` transport and its nested cumulative [[M1]]→[[M2]]→[[M3]] `thirdSpanda` generation: C M1 ring/Hopf/advancement state, all six M2 `RoutingAxisViews`, typed 9:8 block/collision/round-trip evidence, and M3 DET-reception/world-clock/codon-rotation state. `9` is block size, `8` collision-pair count, and `64` non-exact-round-trip count; no generic gap/fold label may conflate them. `MathemeHarmonicProfile::with_composition_projections` carries only the protected handle into the trace, never the raw quaternion. `profile_projections.rs::M1TopologyProjection` sources its ring from C `RING_QUATERNION_LUT` through `spanda::ring_quaternion`; the M3 codon-charge quaternion never sources M1 topology. Likewise `InversionOperatorHandle::session_held()` is the SINGLE `#` attached to every profile.
- `src/state.rs`, `src/quaternion.rs`, `src/hopf.rs`, `src/spanda.rs` — clock state + quaternion/Hopf/spanda math. `quaternion.rs::Quaternion` is the canonical zero-layout-cost [[Cl(4,2)]] carrier shared by the [[M1]] ring, [[M3]] codon charge, and [[M4]] personal composition surfaces; `tests/cl42_one_algebra.rs` drives the three real producers through the shared Hamilton product (rerun 07.T7.4). `spanda.rs` is the Rust MIRROR of the [[M1-3]] spanda dual-oscillator tick floor (Tranche 02.T2.11: HKB relative-phase field, standing-identity superposition, two involutions, flowering-first tick12 readout, codon advancement clock) — the oscillation reality is authored in `epi-lib` `m1.c`/`m1.h` (C ground → Rust surface); HKB coefficients are config-driven via `[ml.m1_paramasiva]` with derived defaults; canon at [[M1'-SPEC]] §14.1 + [[02-m1-paramasiva-reconciliation]] T2.11
- `src/kernel/profile.rs` — generic `from_tick` profiles carry the compiled [[M0]] verifier's neutral bootstrap report through `anuttaraWitness` and project the compiled `CONTEMPLATION_PROMPT_LUT[12]` verbatim through `contemplationPromptLut`: zero witnessed virtues and symbolic open questions until a session supplies actual evidence, with empty prompt slots preserved as canonical absences. `portal-core` enables the existing `epi-lib` `m0_verifier` feature rather than reimplementing verifier or prompt law; `tests/kernel_clock_projection.rs` and `tests/contemplation_prompt_profile_field.rs` prove the profile edge.
- `src/kernel/projections/m0_void_structure.rs` + `src/kernel/profile.rs` — rerun 21.T21.15's public-current `m0_void_structure_ring`: exactly 16 ordered lens rows derived from `CLOCK_LENSES_16`, with `#0-4-{n}` coordinates, kernel labels, and explicit provenance state. The exact outer key is snake_case by contract; lens bodies remain camelCase. Legacy deserialization defaults through the same kernel builder, never a renderer table. `tests/m0_void_structure_ring_profile.rs` proves tick stability, wire spelling, and backward compatibility. Canon update flag: [[S0-ARCHITECTURE]] / [[M0'-SPEC]].
- `src/lib.rs::m0_archetype_lut_coordinates` — the zero-policy Rust projection of `epi-lib`'s compiled `ARCHETYPE_COORDINATE_LUT[12]`; [[S2]] consumes it when subtracting kernel-lifted rows from the live [[M0]] graph.
- `src/luts/` — consolidated codon, transcription, [[M3]] mahamaya, oracle, rotational, and planet-Keplerian LUT surfaces; `src/lib.rs` keeps legacy module-path re-exports for compatibility
- `src/codon_rotation_projection.rs`, `src/m3_transcription_bridge.rs`, `src/lens_codon_binary.rs` — [[M3]] bridge projections: modal rotation, the one bioquaternion transcription object, and the on-demand codon/charge packet over the primary [[Fibonacci Ground]] lens (id 16) plus its 16 derived clock divisions and C `CLOCK_DEGREE_LUT`.
- `src/personal_identity.rs`, `src/birthdate_identity.rs`, `src/vama_shakti.rs`, `src/nara_journal.rs`, `src/harmonic_profile.rs`, `src/profile_projections.rs`, `src/psychoid_cymatic/`, `src/aspect.rs`, `src/music_tech.rs` — identity + identity-augment proposal lifecycle, unary [[Q_composed]] -> (`q_b`, `q_p`) bioquaternion decomposition, [[M4-0-0]] birthdate/name MEF encoding, [[Vama Shakti]] warm-state / Q-activity math, journal parser + protected [[Nara]] period-reading trajectory reconstruction, harmonic profile, [[M0]]-[[M5]] typed profile projections, handle-only psychoid-cymatic renderer derivation, aspects, music-tech
- `src/nara/` — [[M4]] Nara oracle-artifact envelope + PatternPacket chain law (rerun 05.T5.11): `NaraArtifactEnvelope` preserves `oracle_frame_ref`/`symbolic_protein_ref`/`vak_address`/`deck_context`/`sequence_mode`/packet refs/graph provenance/review state; protected interpretation body is a separate protected-local file (`serde(skip)` — never in the envelope); `project_scalar_refs` = Tarot↔I-Ching mutual projectability gated on `m3-codon` provenance, body-free; `reading_cardinality`/`validate` enforce DR-VAK-1 (positions authority, spread labels decorative); `apply_pattern_packet_chain` takes NO identity/evidence parameter — Q_activity (via `perturb_q_activity`) + trajectory only, never Q_identity or M4-0 branch evidence. Snake_case wire (matches §5.11 vocabulary + the S3 nara edge, not the camelCase projections). Typed S3 edge twin: `gateway-contract/src/nara_pattern.rs`.
- `src/rfactor.rs`, `src/vak_address.rs`, `src/coordinate_phase.rs`, `src/types.rs` — R-factor namespace parsing, VAK addressing, phase-qualified coordinate handles, shared types
- `src/tunable/` — schema-backed tunable metadata, registry loader, scope resolver, and audit writer for `*.tunable.toml` config surfaces
- `src/events/` — `mod.rs`, `kernel_events.rs`, `flip_events.rs`, `bridge_events.rs`
- `src/parashakti/` — `mod.rs`, `f_routing.rs`, `vimarsha_reading.rs`
- `tunable-schema/` — schema declarations for migrated config knobs such as [[Nara]] weights, [[Aletheia]] drift/Elo, model slots, and [[Kairos]] enablement, plus Track 38 [[Nara]] session, [[Mythos]], [[Hen]], and cross-cutting tunables
- `tests/` — contract + math tests (kernel projection, klein-flip, [[M']] shared contracts, profile projections, parity, fixtures); `modal_resonator_privacy.rs` proves public-current bus visibility and handle/digest-only protected personal cymatic serialization.
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
- [[Cl(4,2)]] one-algebra cross-pole: `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test cl42_one_algebra`.
- Baseline fixture: `cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test track_01_t0_baseline_fixture`.
- Phase-qualified VAK resolve: `cargo test -p portal-core --test vak_resolve_preserves_prime_phase`.
- Profile projections: `cargo test -p portal-core --test profile_projections_full_suite`.
- Modal resonator (bell kernel §11): `cargo test -p portal-core --test modal_resonator_profile_field`.
- Modal/chime privacy: `cargo test -p portal-core --test modal_resonator_privacy --test psychoid_cymatic_handle`.
- Live-sky planet degrees: `cargo test -p portal-core --test planet_degrees_profile_field`.
- [[M0]] contemplation prompt bus: `cargo test -p portal-core --test contemplation_prompt_profile_field`.
- [[M0]] 16-fold Void-Structure profile: `cargo test -p portal-core --test m0_void_structure_ring_profile`.
- Third-Spanda generation and epogdoon cardinalities: `cargo test -p portal-core --test anuttara_pentadic_runtime_trace`.
- Phase-space core (Sprint-8 E1/E2): `cargo test -p portal-core --test phase_space_profile_field` — FFI parity with `epi-lib::CLOCK_DEGREE_LUT` (.rodata; the C table is the ONLY degree/hexagram/codon authority, bound in `src/kernel/projections/phase_space.rs`, never re-derived), the 384=360+24=64×6 topology, the zodiac-ordered Chaldean decan law (one table kernel-wide), the §4 lens formula, and the 16+1 temporal apertures.
- Lens→codon→binary edge (37.T37.8): `cargo test -p portal-core --test lens_codon_binary_projection` — primary [[Fibonacci Ground]] at functional lens id 16 (60 positions) and the 16 derived division lenses at their boundary degrees, each carrying `groundingLensId: 16`, canonical `pp/nn/np/pn`, and the X-logic 4X invariant; id 17 is refused.
- [[M4-0-0]] birthdate encoding: `cargo test -p portal-core m4_0_0_birthdate_encoding`.
- [[Vama Shakti]] Q-activity accumulator: `cargo test -p portal-core --test q_activity_accumulator`.
- [[Q_composed]] bioquaternion decomposition: `cargo test -p portal-core personal_identity::bioquaternion_decomposition`.
- Psychoid-cymatic handle derivation: `cargo test -p portal-core --test psychoid_cymatic_handle`.
- Tunable registry: `cargo test -p portal-core --test tunable_full_registry` and `cargo test -p portal-core --test kairos_enabled_compat`.
- Tunable foundation: `cargo test -p portal-core --test tunable_metadata --test tunable_registry_load --test tunable_registry_validate --test tunable_registry_merge --test tunable_scope --test tunable_audit --test tunable_full_registry`.

## Child DOX Index
- (leaf)
