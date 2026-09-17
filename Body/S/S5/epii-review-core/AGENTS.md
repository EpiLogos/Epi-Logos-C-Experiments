# AGENTS.md — epii-review-core

## Purpose
Rust crate `epi-s5-epii-review-core` — the `ReviewStore` review-inbox / governance spine (review submissions, gate profiles, resolutions, history) for the Epii S5 layer. No `description` in Cargo.toml and no `//!` header; identity is the crate name + public API.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `src/lib.rs` — crate root / entire public surface: `ReviewStore` (`submit` / `inbox` / `resolve` / `history` / `approved_human_resolution`) over `ReviewSubmission`, `ReviewInboxItem`, `ReviewInbox`, `GovernanceProfile`, `ReviewResolveRequest`, `ReviewResolution`, `ReviewHistory`, plus enums `ReviewSource` / `ReviewStatus` / `ReviewDecision` / `ReviewPriority` / `ReviewCategory` / `GateKind`. `approved_human_resolution` is the narrow S5 authority query used before a canonical Q articulation can mutate.
- `tests/baseline_state_fixture.rs`, `tests/review_governance.rs`, `tests/review_inbox.rs`, `tests/personal_field_composition.rs` — contract / governance / inbox / DR-M4-3 composition tests.
- `Cargo.toml`, `Cargo.lock` — crate manifest (serde, serde_json, uuid).
- Does NOT own coordinate semantics, kernel shapes, or the S5/S5' agent contract — those live in their owning specs, `Body/S/epi-kernel-contract`, and `epii-agent/agent-contract.json` (sibling), not here.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` (no `//!`; the `ReviewStore` public API is the binding surface).
- **DR-M4-3 composition boundary (rerun 08.T8.1):** `submit()` rejects raw M4 personal fields (`qIdentity`/`qTransit`/`qActivity`/`qComposed` + snake variants, `audio_octet`, `natalChart`/`natalHash`) on every open Value surface (coordinate_context, proposed_action target/payload, kernel_visibility.projection); personal fields cross only as opaque `*Handle` strings with provenance-state.
- No local `CONTRACT.md` / `README.md`. Layer baseline lives at sibling `../contract-inventory/track-04-t0-baseline.md`.
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]].

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s5-epii-review-core` (or `make rust-test`).

## Child DOX Index
- (leaf)
