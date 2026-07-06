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
- `src/q_review.rs`, `src/adapters.rs` — Q-review curation, non-Aletheia adapters.
- `src/capacity_workflows/` — capacity-workflow façade split per S5-ARCHITECTURE §5 F1: `registry.rs` (six capacity profiles), `runner.rs` (deterministic capacity-slice runner + routing/snapshot; restored from pre-split `capacity_workflows.rs` after the 17.T17.4 split orphaned it), `nara_voice.rs`, `recursive_review.rs`, `spine_inspector.rs`, `aletheia_lineage.rs`; `mod.rs` re-exports so `capacity_workflows::*` is unchanged.
- `src/resonance_corpus/` — file-backed resonance corpus/checkpoint surface for accumulated `(document, 72-vector)` training pairs, Bimba-node target vectors, dry-run training plans, and paired EBM checkpoint/corpus-snapshot exports.
- `src/resonance_ebm/` — feature-gated (`resonance_ebm`) position 5' runtime head: N-channel `MathemeHarmonicProfile` encoders, swappable attention, tritone-symmetric 72-vector inference, checkpoint load/persist, kernel invocation, gradient surface, mirror invariant, and training-surface citations.
- `src/ebm_user_projection.py` — Python user-temporal projection utility for Track 12.21/33 position-5' compatibility inputs.
- `skills/` — four `epii-q-*` detector `SKILL.md` definitions (articulation-gap, contradiction-candidate, resonance-harvester, stale-by-non-revisit).
- `tests/` — contract/behaviour tests (spine schema, inbox contract, improvement loop, recompose pass, release gate, etc.).
- Does NOT own review/inbox decision law (delegated to [[S5-SPEC]] sibling crate `epi-s5-epii-review-core`), Hen compile contract (`epi-s1-hen-compiler-core`), or kernel projection (`portal-core`); coordinate semantics live in the owning spec, not here.

## Local Contracts
- Code Coordinate Headers: `src/lib.rs` (no `//!` — `use`-first) plus per-module `//!` headers (`types.rs`, `spine.rs`, `inbox.rs`, `recompose.rs`, `promotion.rs`, `orchestration.rs`, `kernel_evidence.rs`, `resonance_corpus/mod.rs`, `resonance_ebm/mod.rs`).
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]].
- No CONTRACT.md here — see parent `Body/S/S5/AGENTS.md` + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s5-epii-autoresearch-core` (or `make rust-test`).
- Resonance corpus/CLI substrate: `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml resonance_corpus --features resonance_ebm`; S0 CLI mirror: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test pi_ebm_commands`.
- Resonance EBM runtime: `cargo check -p epi-s5-epii-autoresearch-core --features resonance_ebm`; `cargo test -p epi-s5-epii-autoresearch-core --features resonance_ebm resonance_ebm::mirror_consistency_loss`; `cargo test -p epi-s5-epii-autoresearch-core --features resonance_ebm --test resonance_ebm_runtime`.

## Child DOX Index
- (leaf)
