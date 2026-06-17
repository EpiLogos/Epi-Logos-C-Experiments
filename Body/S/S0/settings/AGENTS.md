# AGENTS.md — settings

## Purpose
Rust crate `epi-s0-settings`: the `Settings` struct (`gateway_port`, `log_level`, `data_dir`) loaded from a `key = value` config file resolved via the `EPI_S0_SETTINGS_PATH` env var (default `.epi/s0-settings.conf`), falling back to defaults (gateway port 18794, log level `info`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `Cargo.toml` — crate manifest; package `epi-s0-settings` (dep: `serde` derive)
- `src/lib.rs` — crate root / public surface: `Settings`, `Settings::load` / `load_from_path`, consts `DEFAULT_GATEWAY_PORT` (18794), `DEFAULT_LOG_LEVEL` (`"info"`), `SETTINGS_PATH_ENV` (`EPI_S0_SETTINGS_PATH`); config-line parser; inline `#[cfg(test)]` tests
- Does NOT own gateway/runtime behaviour — only S0 config values; runtime control law lives in [[S3]], not here. Coordinate semantics for higher layers belong to their owning modules, not S0 by convenience.

## Local Contracts
- (no CONTRACT.md / README) — the binding interface is the Coordinate Header / public API in `src/lib.rs` plus `Cargo.toml`
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; warn on HIGH/CRITICAL.
- Reference all coordinates/specs/crates as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s0-settings`

## Child DOX Index
- (leaf)
