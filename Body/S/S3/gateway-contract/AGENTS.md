# AGENTS.md — gateway-contract

## Purpose
`epi-s3-gateway-contract`: "S3 gateway protocol and method contract for Epi-Logos" (Cargo.toml `description`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `src/lib.rs` — crate root; declares + re-exports every contract module (no `//!` header present).
- `src/protocol.rs` — wire protocol (handshake / RPC envelope).
- `src/session.rs` — session authority types/methods.
- `src/dispatch_plan.rs` — dispatch plan contract (largest module).
- `src/spacetime.rs` — SpacetimeDB presence-layer contract.
- `src/kernel_bridge.rs` — S0 kernel bridge contract.
- `src/s1_vault.rs` — S1 vault method contract.
- `src/graphiti.rs`, `src/temporal.rs`, `src/privacy.rs`, `src/portal_events.rs`, `src/release.rs` — Graphiti, temporal, privacy, portal-event, and release-gate contracts.
- `src/verifier.rs` — `s0'.verifier.check_state` / `s0'.verifier.emit_question` method contract.
- `src/tests.rs` (cfg-test) + `tests/hermes_inspired_contracts.rs` — contract tests.
- Does NOT own runtime behaviour — that is sibling `gateway/` (`epi-s3-gateway`). Domain law for other layers stays in its owning coordinate ([[S4-SPEC]] dispatch, [[S2-SPEC]] graph, [[S5-SPEC]] world-return), not here by convenience.

## Local Contracts
- Code Coordinate Header: Cargo.toml `description` (no `src/lib.rs //!` header; no CONTRACT.md / README.md here).
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]].
- Deps (Cargo.toml): `epi-kernel-contract`, `portal-core`.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings (this is a shared contract crate — broad blast radius).
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s3-gateway-contract` (or `make rust-test` from repo root).

## Child DOX Index
- (leaf)
