# AGENTS.md — S1

## Purpose
S1 Obsidian / Material Container layer: the Hen (S1') compiler tree that carries Epi-Logos residency + agent-invocation law over the vault. Holds the Rust contract crate (`epi-s1-hen-compiler-core` — "S1 Hen compiler contract for Epi-Logos residency and agent invocation law") and the Python knowledge-base compiler (`llm-personal-kb`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S1-SPEC]]

## Ownership
- `hen-compiler-core/` — Rust contract crate (`epi-s1-hen-compiler-core`); its own DOX node. Public surface in `src/lib.rs`: artifact_evidence, base_view, compile_plan, coordinate, frontmatter, graph_promotion, graph_sync, ledger, residency, wikilinks, smart_env, l_alignments, property_intelligence, relation_inference; contract tests in `tests/`.
- `hen-compiler/` — Python personal-KB compiler (`llm-personal-kb`); its own DOX node. Compiles `daily/` conversations into `knowledge/`; holds `ledger/`, `hooks/`, `reports/`, `scripts/`, `tests/`.
- Does NOT own coordinate semantics or canon-write authority beyond Hen's mandate: domain law for other layers lives in those layers' owning modules/specs, not here. Canon (`Idea/Bimba|Pratibimba|Empty`) is written only through Hen with explicit review — SwarmVault and other agents never write `Idea/` directly.

## Local Contracts
- Code Coordinate Header: `hen-compiler-core/src/lib.rs` (`//!` — "S1 Hen compiler contract.").
- Owning specs: [[S1-SPEC]] and [[S1-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].
- No CONTRACT.md at this level — see per-child AGENTS.md + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter; residency + frontmatter law is enforced by `hen-compiler-core` (`residency.rs`, `frontmatter.rs`).

## Verification
- Rust contract crate: `cargo test -p epi-s1-hen-compiler-core` (or `make rust-test`).
- Python compiler: run `hen-compiler/tests/` per that child's AGENTS.md.

## Child DOX Index
- `hen-compiler-core/AGENTS.md` — Rust S1 Hen compiler contract: residency, frontmatter, compile-plan, wikilink, graph-promotion law.
- `hen-compiler/AGENTS.md` — Python `llm-personal-kb`: Karpathy-style compiler turning `daily/` AI conversations into a queryable `knowledge/` base.
