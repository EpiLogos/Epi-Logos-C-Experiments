# AGENTS.md — S5

## Purpose
The S5 layer: Integral World Boundary — world-exchange/world-return cores (RAG/Gnostic, kbase scoping, the Epii pi_agent, and its autoresearch/review state spines).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `epi-gnostic/` — Python: "Gnostic namespace RAG pipeline for Epi-Logos" (`pyproject.toml`).
- `epi-kbase-core/` — Rust crate `epi-s5-kbase-core`: "S5.2' kbase foundations — bounded resource context, project scoping, search facets".
- `epi-kbase/` — JS: "S5.2' kbase: bounded resource context for DAY/NOW agent runs (NotebookLM-type scoping)"; has local `CONTRACT.md`.
- `epii-agent/` — Epii pi_agent contract (`agent-contract.json`, coordinate `S5/S5'`) + `contract-ledger/`.
- `epii-agent-core/`, `epii-autoresearch-core/`, `epii-review-core/` — Rust crates `epi-s5-epii-agent-core` / `-autoresearch-core` / `-review-core` (ImprovementStore / ReviewStore / InboxStore spines; no crate `description`).
- `plugins/` — Epii resource package (`registry.jsonl` → `epi-logos`).
- `tests/test_epii_agent_contract.py`, `fixtures/track-04-t0/`, `contract-inventory/track-04-t0-baseline.md` — layer-level contract baseline.
- Does NOT own coordinate semantics or kernel shapes: those live in each owning module/spec and `Body/S/epi-kernel-contract` — not duplicated here.

## Local Contracts
- `epi-kbase/CONTRACT.md` (kbase scoping contract); `epii-agent/agent-contract.json` (Epii agent contract); `contract-inventory/track-04-t0-baseline.md` (frozen S5/S5' public API baseline).
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]].
- No CONTRACT.md at this S5 root — see per-child contracts + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- Rust cores: `cargo test -p epi-s5-kbase-core` / `-p epi-s5-epii-agent-core` / `-p epi-s5-epii-autoresearch-core` / `-p epi-s5-epii-review-core` (or `make rust-test`).
- Layer contract: `python3 -m unittest Body/S/S5/tests/test_epii_agent_contract.py`.

## Child DOX Index
- `epi-kbase-core/AGENTS.md` — Rust `epi-s5-kbase-core`: S5.2' kbase foundations (bounded resource context, project scoping, search facets).
- `epii-agent-core/AGENTS.md` — Rust `epi-s5-epii-agent-core`: Epii pi_agent access core.
- `epii-autoresearch-core/AGENTS.md` — Rust `epi-s5-epii-autoresearch-core`: ImprovementStore autoresearch loop spine.
- `epii-review-core/AGENTS.md` — Rust `epi-s5-epii-review-core`: ReviewStore / InboxStore review + Aletheia-handoff spine.
- `epi-gnostic/AGENTS.md` — Python Gnostic namespace RAG pipeline for Epi-Logos.
- `epi-kbase/AGENTS.md` — JS S5.2' kbase: bounded resource context for DAY/NOW agent runs.
- `epii-agent/AGENTS.md` — Epii pi_agent contract (`agent-contract.json`, `S5/S5'`) + contract-ledger.
- `plugins/AGENTS.md` — Epii resource package registry (`registry.jsonl` → `epi-logos`).
