# AGENTS.md — epi-spacetime-module

## Purpose
`epi-spacetime-module` — "SpacetimeDB WASM module for Epi-Logos gateway/client/agent registration" (Cargo.toml `description`); per `src/lib.rs //!`: gateway/client/agent registration and live temporal projection.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `src/lib.rs` — crate root / public surface: SpacetimeDB 2.x `#[table]` schema + `#[reducer]` set. Tables include `gateway_instance`, `agent_instance`, `client_registration`, `session_surface`, `kairos_surface`, `global_temporal_surface`, `temporal_event`, plus the 03.T4 shared-cosmos tables (`world_clock`, `world_clock_tick`, `pratibimba_presence`, `shared_archetype_event`, `coincidence`, `coincidence_tick`, `module_version`) and the CCT-21 BeingPattern live-state tables (`being_pattern_presence`, `being_pattern_relation_edge`, `being_pattern_review_candidate`).
- `Cargo.toml` — `cdylib` crate manifest; pins `spacetimedb = "=2.2.0"`, `rust-version = 1.93`.
- `rust-toolchain.toml` / `scripts/rustc-1.93.sh` / `.cargo/config.toml` — local toolchain pin so Homebrew rustc 1.89 cannot be used.
- Does NOT own the authoritative clock computation: per the `//!` and `advance_world_clock` doc, the gateway (Kerykeion/Nara) computes state; this module carries the projection only. Version mirror constants live in `gateway-contract` ([[S3-SPEC]]); knowledge graph is [[S2-SPEC]], world-return is [[S5-SPEC]].

## Local Contracts
- Code Coordinate Header: `src/lib.rs` top `//!` doc-comment (table/reducer/version-constant catalogue).
- Privacy invariant (enforced in code): `pratibimba_presence` carries only BLAKE3 fingerprints + coarse grid cell; `publish_shared_archetype_event` panics unless `opt_in_consent = true`.
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]]. No local CONTRACT.md exists.

## Work Guidance
- Run `gitnexus_impact` on a reducer/table symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Keep the 03.T4 version constants (`CLOCK_PROTOCOL_VERSION`, `KERYKEION_VERSION`, `PROJECTION_SCHEMA_VERSION`, `REDUCER_ABI_VERSION`) in sync with the gateway-contract mirror when changing schema.

## Verification
- `cargo test --test being_pattern_projection` from this crate directory (uses the local Rust 1.93 wrapper) for CCT-21 schema assertions; `cargo build -p epi-spacetime-module` for workspace contexts that include the crate; WASM target per Cargo.toml note: `cargo build --target wasm32-unknown-unknown` or `spacetime build`. Repo-wide: `make rust-test`.

## Child DOX Index
- (leaf)
