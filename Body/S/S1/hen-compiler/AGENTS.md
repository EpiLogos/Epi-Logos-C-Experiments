# AGENTS.md — hen-compiler

## Purpose
Python personal-knowledge-base compiler `llm-personal-kb` — "Personal knowledge base compiled from AI conversations - inspired by Karpathy's LLM KB architecture" (`pyproject.toml`); it compiles `daily/` AI-conversation logs into a queryable `knowledge/` base and hosts the Hen residency/compile-plan scripts at this layer.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S1-SPEC]]

## Ownership
- `scripts/` — CLI tools: `compile.py`, `query.py`, `lint.py`, `flush.py`, `config.py`, `utils.py`, plus Hen-specific `hen_compile_plan.py`, `hen_residency.py`, `migrate_m2_3_element_canonical.py`; runtime `state.json`/`last-flush.json`.
- `hooks/` — Claude Code hooks: `session-start.py`, `session-end.py`, `pre-compact.py`.
- `daily/` — immutable source conversation logs (compiler input).
- `knowledge/` — LLM-owned compiled output: `index.md`, `log.md`, `concepts/`, `connections/`, `qa/`.
- `tests/` — `test_hen_compile_plan.py`, `test_hen_residency.py`.
- `ledger/`, `reports/` — smoke-test ledger and lint reports.
- `pyproject.toml`/`uv.lock` — `llm-personal-kb` deps (uv-managed, Python 3.12+).
- Does NOT own coordinate semantics, canon-write authority, or the Rust contract — those live in sibling `hen-compiler-core/` and the owning S1 specs; this is a dev sidecar, it never writes `Idea/` directly.

## Local Contracts
- Schema reference (compiler analogy, article formats, hook/script details) is documented in this file's history and in the parent layer; binding interface is the owning spec.
- Owning specs: [[S1-SPEC]] and [[S1-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].
- No CONTRACT.md and no `src/lib.rs` Coordinate Header here — see parent `Body/S/S1/AGENTS.md` + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored knowledge articles (Obsidian-style, no `.md`).
- Vault/knowledge writes use coordinate-prefixed `c_n_*` frontmatter where the artifact carries Bimba coordinates; never write into `Idea/` from here.

## Verification
- `python -m unittest discover -s Body/S/S1/hen-compiler/tests` (Python unittest; `hen_compile_plan` / `hen_residency`).
- Knowledge-base health: `uv run python scripts/lint.py` (or `--structural-only` for the free checks).

## Child DOX Index
- (leaf)
