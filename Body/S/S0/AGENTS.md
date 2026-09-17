# AGENTS.md — S0

## Purpose
S0 is the Terminal / CLI / C Ground layer of the S-stack: the filesystem, process, command, build, and C/Rust crates that all higher S-layers stand on.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `epi-lib/` — C library crate (`epi-lib`); the m0–m5 C runtime + headers in `include/*.h` (e.g. `m0.h`, `vak.h`, `ontology.h`), `Makefile`, `build.rs`, FFI tests in `src/lib.rs`
- `epi-cli/` — Rust crate `epi-logos` (lib `epi_logos`, bin `epi`): "The Master CLI for the Epi-Logos coordinate system — ontology-is-code"
- `portal-core/` — crate `portal-core`: "Pure math types and functions for the Epi-Logos portal clock — shared by epi-cli and epi-tauri"
- `gemini-embedding/` — crate `gemini-embedding`: embedding client (`TaskType` enum, async API, `mock-api` feature)
- `settings/` — crate `epi-s0-settings`: `Settings` (gateway_port / log_level) loaded via `EPI_S0_SETTINGS_PATH`
- `vendor/blake3/` — vendored BLAKE3 (build dependency, not a coordinate node)
- Does NOT own coordinate semantics for graph/gateway/agent layers — those live in [[S2]], [[S3]], [[S4]]; the S-stack root contract crate is `epi-kernel-contract` (parent of all S layers, at `Body/S/`, not here).

## Local Contracts
- (no S0-root CONTRACT.md) — binding interfaces are the C Coordinate Headers `epi-lib/include/*.h` and each child crate's `Cargo.toml`
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]] (shards [[S0-0-SPEC]]..[[S0-5-SPEC]] under Seeds/S/S0)

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; warn on HIGH/CRITICAL.
- C/FFI invariant: `GET_PTR(ptr)` before every dereference; HC struct stays 128 bytes.
- Reference all coordinates/specs/crates as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- C: `make test` (in `epi-lib/`). Rust FFI bridge: `make rust-test`.
- Per-crate: `cargo test -p epi-logos`, `cargo test -p portal-core`, `cargo test -p gemini-embedding`, `cargo test -p epi-s0-settings`.

## Child DOX Index
- `epi-lib/AGENTS.md` — C library crate: the m0–m5 C runtime and `include/*.h` headers
- `epi-cli/AGENTS.md` — Master CLI `epi` (crate `epi-logos`): ontology-as-code command surface
- `portal-core/AGENTS.md` — pure math types/functions for the portal clock, shared by epi-cli and epi-tauri
- `gemini-embedding/AGENTS.md` — Gemini embedding client crate (async, `mock-api` feature)
- `settings/AGENTS.md` — `epi-s0-settings`: S0 settings (gateway port, log level)
