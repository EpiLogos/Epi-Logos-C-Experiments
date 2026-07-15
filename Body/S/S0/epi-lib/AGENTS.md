# AGENTS.md — epi-lib

## Purpose
The C library crate (`epi-lib`, per `Cargo.toml`): the m0–m5 C runtime plus the coordinate-system headers — `ontology.h` is "The Master Blueprint... universal DNA of the Epi-Logos coordinate system", `engine.h` is "The Engine API" (torus walk, lemniscate dive, double covering). Built via `build.rs` (`cc`); `src/lib.rs` is the Rust FFI test bridge.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `include/*.h` — the Coordinate Headers: `ontology.h` (Holographic_Coordinate, 128-byte struct, tagged-pointer macros), `engine.h`, `kernel.h`, `arena.h`, `m_canonical.h` (L2' element-ID harmonisation), `m0`–`m5`, `m0_calculus.h`, `m0_verifier.h` (0' Verifier: `M0VerifierReport` with typed queries / act-route + `(@#)` turn / backing chains / closure marker — no scalar coherence_score, per Tranche 01.T1.10), `anuttara_language.h` (128-entry coordinate-language registry: 109 M0 alphabet + 19 QL closure per [[M0-ARCHITECTURE]] §11; `M0_IDENTITY_CHAINS` Law-3 equational tables), `pointer_web.h`, `psychoid_numbers.h`, `vak.h`; `m0.h` exposes tuning structural-invariant and [[DR-TUNE-4]] slot/PASU privacy verdict contracts plus `m0_resolve_archetypal_number` (number 0-9 → `ARCHETYPE_LUT[number+2]`, routing pinned by the `m0_archetype_routing` tests per Tranche 19.T19.1); `m4.h` exposes the [[M4]] session frame + symbolic protein lifecycle ABI
- `src/*.c` — the m0–m5 implementations + `engine.c`, `families.c`, `kernel.c`, `arena.c`, `pointer_web.c`, `m3_clock_lut.c`, `qv_data.c`, `main.c`; `anuttara_language.c` + `anuttara_language_registry.inc` (the .inc is GENERATED from the anuttara-deep dataset via `.codex/scripts/gen-anuttara-language-registry.mjs` — regenerate, don't hand-edit)
- `src/lib.rs` — Rust FFI surface and tests (`m0_verifier` feature exposes `bootstrap_witness_for_tick`, which runs the compiled C verifier over the truthful generic-tick bootstrap state; `m0_calc_*` corpus tests, `m0_archetype_routing`, `m0_rfactor_band_turn`, `m2_asma_mirror_idx_round_trip`, and the T1.11 symbolic-coordinate-string round-trip run in the default build — `m0_calculus.c` + `anuttara_language.c` are UNCONDITIONAL kernel substrate per `build.rs` since Tranche 01.T1.13; the `m0_calculus` cargo feature is a no-op check surface)
- `tests/` — Rust integration tests (`clock_backbone_node_test.rs`); `test/` — C test trees (m0–m5, vak, engine, pillar1, fixtures)
- `Makefile` (delegates to repo root), `build.rs`, `docs/` (m0–m5 references), `scripts/` (LUT/fixture generators)
- Does NOT own coordinate semantics for graph/gateway/agent layers (delegate to [[S2]] / [[S3]] / [[S4]]); domain law lives in each m-module here, not pulled up into [[S0]] by convenience. The S-stack root contract is `epi-kernel-contract` at `Body/S/`, not here.

## Local Contracts
- (no CONTRACT.md here) — the binding interfaces are the C Coordinate Headers `include/*.h` and `Cargo.toml`
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]]
- Contract-surface flag: [[S0-ARCHITECTURE]] should absorb the `M0_TuneProposal` tuning-dispatch metadata and `m0_check_slot_privacy_boundary_compliance` public seam during the next canon harmonisation pass.

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; warn on HIGH/CRITICAL.
- C/FFI invariant: `GET_PTR(ptr)` before every dereference; the Holographic_Coordinate struct stays 128 bytes (`_Static_assert`).
- C Coordinate Headers expose contracts only: keep algorithm bodies and LUT storage in `src/*.c`; reserve header inlines for trivial accessors or `_Static_assert`-required constant forms.
- Reference all coordinates/specs as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- C: `make test`. Focused M4 session lifecycle check: `make -C Body/S/S0/epi-lib test_m4` plus `cargo test --manifest-path Body/S/S0/epi-lib/Cargo.toml m4_session`. Focused tuning verifier check: `make -C Body/S/S0/epi-lib test_m0_tune_invariant_constraint` (structural-invariant plus local-only slot/PASU privacy refusal). Rust FFI bridge: `make rust-test`. Per-crate: `cargo test -p epi-lib`. 0' Verifier + language registry: `cargo test -p epi-lib --features m0_verifier m0_verifier` (6 tests incl. the unwitnessed-Archetype-9 round-trip).

## Child DOX Index
- (leaf)
