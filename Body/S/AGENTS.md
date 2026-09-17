# AGENTS.md — S

## Purpose
The S-Stack root: the technology-layer implementation tree (S0..S5) plus the cross-stack `epi-kernel-contract` crate ("Parent-role kernel-aligned contract layer for Epi-Logos: KernelTickEnvelope, TrajectoryDeposit, AnuttaraDiagnostic, PhysicalPoleState, MentalPoleState").
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]]

## Ownership
- `epi-kernel-contract/` — S-stack root contract crate; parent of all S layers, NOT an S0 sibling (per DR-S0-1, ratified 2026-06-03). Carries the cross-surface typed shapes (`KernelTickEnvelope`, `TrajectoryDeposit`, etc.).
- `S0/` .. `S5/` — the six S-layer implementation trees (each is its own DOX node).
- Does NOT own coordinate semantics: each layer's domain law lives in that layer's owning module and spec, not here. S2 raw Neo4j/Redis carry no coordinate semantics (those route through S2'). Conceptual coordinate != physical residency (e.g. `S3/graphiti-runtime` resides at S3 but actualises S5).

## Local Contracts
- Code Coordinate Header: `epi-kernel-contract/src/lib.rs` (`//!` — "this crate sits at `Body/S/` (sibling to S0..S5)").
- Owning specs: [[S-SYSTEM-INDEX]]; per-layer [[S0-SPEC]]..[[S5-SPEC]] and [[S0-ARCHITECTURE]]..[[S5-ARCHITECTURE]].
- No CONTRACT.md exists at this level — see per-layer children + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-kernel-contract` for the root contract crate; otherwise run each child's own check (C: `make test`; Rust: `make rust-test` / `cargo test -p <crate>`).

## Child DOX Index
- `epi-kernel-contract/AGENTS.md` — S-stack root contract crate (kernel-aligned typed shapes; parent of S0..S5).
- `S0/AGENTS.md` — Terminal / CLI / C Ground: `epi-lib` (C m0-m5), `epi-cli`, `portal-core`. See [[S0-SPEC]].
- `S1/AGENTS.md` — Obsidian / Material Container: `hen-compiler` + `hen-compiler-core` (residency + agent-invocation law). See [[S1-SPEC]].
- `S2/AGENTS.md` — GraphDB Substrate: `graph-schema`, `graph-services` (Neo4j + Redis contracts), `ontology`, RUNBOOK. See [[S2-SPEC]].
- `S3/AGENTS.md` — Gateway Control Plane: `gateway`, `gateway-contract`, `redis-context`, `graphiti-runtime`, `epi-spacetime-module`. See [[S3-SPEC]].
- `S4/AGENTS.md` — Agent Runtime: `pi-agent`, `ta-onta` carriers, `plugins`. See [[S4-SPEC]].
- `S5/AGENTS.md` — Integral World Boundary: `epi-gnostic`, `epi-kbase(-core)`, `epii-agent(-core)`, world-return cores. See [[S5-SPEC]].
