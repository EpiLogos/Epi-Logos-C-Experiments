# AGENTS.md — epii-autoresearch-core

## Purpose
Rust crate `epi-s5-epii-autoresearch-core` — the `ImprovementStore` autoresearch-loop spine: improvement runs/candidates, the Aletheia inbox seam, surfacing/promotion routing, and recompose continuity for the Epii cycle.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `src/lib.rs` — crate root / public surface (`ImprovementStore`, validators; re-exports submodules via `pub use`).
- `src/types.rs` — core value types (improvement runs, candidates, routes, receipts).
- `src/spine.rs` — recursive-spine types (candidate, meaning packet, promotion destination, surfacing pipeline).
- `src/inbox.rs` — `InboxStore`: Rust-side consumer of Aletheia's JSONL handoff (day/session inbox seam).
- `src/recompose.rs` — recompose pass → next-cycle compose hints (Möbius return through the seam).
- `src/promotion.rs` — promotion-plan types + Hen compiler-plan summaries.
- `src/orchestration.rs` — orchestration lifecycle + cross-cycle continuity DTOs.
- `src/kernel_evidence.rs` — kernel-evidence value types + public-projection constructors.
- `src/q_review.rs`, `src/capacity_workflows.rs`, `src/adapters.rs` — Q-review curation, capacity workflow registry, non-Aletheia adapters.
- `skills/` — four `epii-q-*` detector `SKILL.md` definitions (articulation-gap, contradiction-candidate, resonance-harvester, stale-by-non-revisit).
- `tests/` — contract/behaviour tests (spine schema, inbox contract, improvement loop, recompose pass, release gate, etc.).
- Does NOT own review/inbox decision law (delegated to [[S5-SPEC]] sibling crate `epi-s5-epii-review-core`), Hen compile contract (`epi-s1-hen-compiler-core`), or kernel projection (`portal-core`); coordinate semantics live in the owning spec, not here.

## Local Contracts
- Code Coordinate Headers: `src/lib.rs` (no `//!` — `use`-first) plus per-module `//!` headers (`types.rs`, `spine.rs`, `inbox.rs`, `recompose.rs`, `promotion.rs`, `orchestration.rs`, `kernel_evidence.rs`).
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]].
- No CONTRACT.md here — see parent `Body/S/S5/AGENTS.md` + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s5-epii-autoresearch-core` (or `make rust-test`).

## Child DOX Index
- (leaf)
