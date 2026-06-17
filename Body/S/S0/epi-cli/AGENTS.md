# AGENTS.md — epi-cli

## Purpose
Rust crate `epi-logos` (lib `epi_logos`, bin `epi`): "The Master CLI for the Epi-Logos coordinate system — ontology-is-code" — the master command surface + TUI that drives every S-layer over FFI and the gateway.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `Cargo.toml` / `src/lib.rs` — crate root: re-exports command modules and bridges sibling crates (`hen` <- `epi-s1-hen-compiler-core`, `epii_*` <- `epi-s5-*-core`)
- `src/main.rs` — `clap` entrypoint for the `epi` binary
- `build.rs` — compiles `../epi-lib` C sources via `cc` (the C FFI bridge); links BLAKE3 from `../vendor/blake3`
- `src/` command families — `gate/` (gateway RPC/control), `nara/` (M4 personal), `portal/` + `tui/` (ratatui-hypertile), `vault/`, `agent/` + `techne/` (agent/gateway lifecycle), `graph/`, `sync/`, `ffi/`, `core/`, `notebook/`, `profile/`, `book/`, `code/`, `sesh/`, `up.rs`, `vimarsa/`
- `tests/` — extensive contract/integration suites (gate_*, nara_*, vault_*, agent_*, portal_*, kernel_*)
- `schemas/` (TS dataset validator), `contract-inventory/` (`s0-membrane-inventory.json`), `scripts/`, `assets/`, `vendor/`
- Does NOT own coordinate semantics it merely invokes — graph law lives in [[S2]], gateway/session law in [[S3]], agent runtime in [[S4]]; domain law stays in its owning module, not pulled into [[S0-SPEC]] by convenience.

## Local Contracts
- (no local CONTRACT.md; no `//!` header in `src/lib.rs`) — binding surface is the `clap` command tree in `src/main.rs`, the C FFI declarations in `src/ffi/`, and `contract-inventory/s0-membrane-inventory.json`
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; warn the user on HIGH/CRITICAL risk.
- C/FFI invariant: `GET_PTR(ptr)` before every dereference; the HC struct stays 128 bytes.
- Reference all coordinates/specs/crates/agents as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-logos` (Rust). FFI bridge to the C layer: `make rust-test` at the repo root.

## Child DOX Index
- (leaf)
