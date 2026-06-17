# AGENTS.md — epii-agent-core

## Purpose
Rust crate `epi-s5-epii-agent-core`: the Epii pi_agent access core (`EpiiAgentAccess`) that fronts the autoresearch (ImprovementStore) and review (ReviewStore/InboxStore) spines as a peer pi_agent at coordinate `S5/S5'`. (No `description` in Cargo.toml; no crate-root `//!` header — module docs live in `src/deposits.rs` and `src/m5_workbench.rs`.)
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `src/lib.rs` — crate root / public surface: `EpiiAgentAccess`, `EpiiAgentSnapshot`, review + improvement access snapshots, deposit/resolve/promote impls, re-exports `deposits::*` and `m5_workbench::*`.
- `src/deposits.rs` — deposit request/receipt DTOs for the Anima → Epii write-paths (`DepositType`, `DepositArtifact`, …).
- `src/m5_workbench.rs` — `M5*Dto` workbench DTOs consumed by the M5' Theia surface (`M5WorkbenchSnapshot`, …).
- `tests/` — `agent_access.rs`, `full_spine_acceptance.rs`, `baseline_state_fixture.rs` (contract/acceptance tests).
- `Cargo.toml`, `Cargo.lock` — crate manifest; depends on sibling `epii-autoresearch-core` + `epii-review-core` (dev-dep `portal-core`).
- Does NOT own the autoresearch/review state shapes (those live in the sibling `-autoresearch-core` / `-review-core` crates) nor coordinate/kernel semantics (`Body/S/epi-kernel-contract` + owning specs) — this crate only fronts them.

## Local Contracts
- (none yet — no local CONTRACT.md). Code surface: `src/lib.rs` public API; module headers in `src/deposits.rs` + `src/m5_workbench.rs` (both cite `S5-ARCHITECTURE.md §5.1 F3`).
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]]. Layer baseline lives at parent `Body/S/S5` (`contract-inventory/track-04-t0-baseline.md`).

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s5-epii-agent-core` (or `make rust-test`).

## Child DOX Index
- (leaf)
