# AGENTS.md — epi-lib

## Purpose
The C library crate (`epi-lib`, per `Cargo.toml`): the m0–m5 C runtime plus the coordinate-system headers — `ontology.h` is "The Master Blueprint... universal DNA of the Epi-Logos coordinate system", `engine.h` is "The Engine API" (torus walk, lemniscate dive, double covering). Built via `build.rs` (`cc`); `src/lib.rs` is the Rust FFI test bridge.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `include/*.h` — the Coordinate Headers: `ontology.h` (Holographic_Coordinate, 128-byte struct, tagged-pointer macros), `engine.h`, `kernel.h`, `arena.h`, `m_canonical.h` (L2' element-ID harmonisation), `m0`–`m5`, `m0_calculus.h`, `m0_verifier.h`, `pointer_web.h`, `psychoid_numbers.h`, `vak.h`; `m0.h` also exposes the tuning proposal/verdict verifier contract
- `src/*.c` — the m0–m5 implementations + `engine.c`, `families.c`, `kernel.c`, `arena.c`, `pointer_web.c`, `m3_clock_lut.c`, `qv_data.c`, `main.c`
- `src/lib.rs` — Rust FFI tests (e.g. `m0_verifier` behind the `m0_verifier` feature)
- `tests/` — Rust integration tests (`clock_backbone_node_test.rs`); `test/` — C test trees (m0–m5, vak, engine, pillar1, fixtures)
- `Makefile` (delegates to repo root), `build.rs`, `docs/` (m0–m5 references), `scripts/` (LUT/fixture generators)
- Does NOT own coordinate semantics for graph/gateway/agent layers (delegate to [[S2]] / [[S3]] / [[S4]]); domain law lives in each m-module here, not pulled up into [[S0]] by convenience. The S-stack root contract is `epi-kernel-contract` at `Body/S/`, not here.

## Local Contracts
- (no CONTRACT.md here) — the binding interfaces are the C Coordinate Headers `include/*.h` and `Cargo.toml`
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; warn on HIGH/CRITICAL.
- C/FFI invariant: `GET_PTR(ptr)` before every dereference; the Holographic_Coordinate struct stays 128 bytes (`_Static_assert`).
- Reference all coordinates/specs as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- C: `make test`. Focused tuning verifier check: `make -C Body/S/S0/epi-lib test_m0_tune_invariant_constraint`. Rust FFI bridge: `make rust-test`. Per-crate: `cargo test -p epi-lib`.

## Child DOX Index
- (leaf)
