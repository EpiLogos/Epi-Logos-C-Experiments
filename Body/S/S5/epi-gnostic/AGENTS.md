# AGENTS.md — epi-gnostic

## Purpose
Python package "Gnostic namespace RAG pipeline for Epi-Logos" (`pyproject.toml` description) — RAG-Anything + LightRAG + Neo4j + Graphiti, called by the Rust S5 cores as a subprocess (JSON on stdout).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `pyproject.toml` — package `epi-gnostic`; scripts `epi-gnostic` (`epi_gnostic.cli:main`) + deprecated `epi-graphiti` (`epi_gnostic._deprecated.graphiti_service:main`).
- `epi_gnostic/cli.py` — CLI entry (status/models/ingest/query/notebook/enrich), JSON stdout for Rust.
- `epi_gnostic/{config.py, wrapper.py, arena_promotion.py, storage/, enrichment/}` — config, RAG wrapper, arena-promotion proposal generation, Neo4j vector storage, cross-namespace enrichment.
- `epi_gnostic/graphiti_service.py` — deprecated root-import shim for legacy callers; `epi_gnostic/_deprecated/graphiti_service.py` owns the Graphiti episodic-memory HTTP compatibility wrapper, including the former harness-blind `s2'.memory.ingest_transcript` / `s2'.memory.query_graphiti` transcript-to-episodic-graph pipeline now lifted into `Body/S/S3/graphiti-runtime`; `epi_gnostic/graphiti_config.py` remains shared compatibility configuration; `Dockerfile.graphiti` runs the deprecated module.
- `epi_gnostic/arena_distillation.py` — Moirai arena closure-distillation: Graphiti episode writes plus classifier-modulated `ARENA_DIALOGUE_OF` / `DIALOGICAL_RESONANCE_AT` edge planning/writes. `coordinate_tag_arena_transcript` serializes existing VAK addresses for later resolve; it is not a compression orchestrator.
- `scripts/` — `enrich.py`, `migrate_bimba_embeddings.py` (768→3072 migration).
- `cypher/` — bootstrap/relations/pointer Cypher; `tests/` — pytest suite; `schema-context.md` — graph schema notes.
- Does NOT own coordinate semantics, kbase scoping, or the Epii agent contract — those live in sibling S5 cores (`epi-kbase-core`, `epii-agent-core`) and their specs.

## Local Contracts
- Coordinate Header: `epi_gnostic/__init__.py` (`"""Gnostic namespace RAG pipeline for Epi-Logos."""`) + `cli.py` usage docstring (the JSON CLI surface Rust binds to).
- **Embedding dimension is 3072, full stop.** `config.py` exports `CANONICAL_EMBEDDING_DIM = 3072` and `VALID_EMBEDDING_DIMS = {3072}`; `GnosticConfig.__post_init__` refuses any other width, so a stray `GNOSTIC_EMBEDDING_DIM` fails at config load rather than writing unstorable vectors. Gnosis shares Bimba's `coord_embedding` (3072/COSINE) index — the width is not a tunable. Bimba's own `GEMINI_EMBED_DIMS` (S2 `graph-services/src/embeddings.rs`) is a *different, deliberately variable* knob and is NOT read here; aliasing it would let a Bimba-side matryoshka setting break every Gnosis command. Pinned by `tests/test_config.py`.
- `schema-context.md` (graph schema), `.env.example` (required env).
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]]. No local CONTRACT.md — see parent + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- CLI must keep emitting JSON on stdout — the Rust S5 cores parse it.

## Verification
- `Body/S/S5/epi-gnostic/.venv/bin/python -m pytest Body/S/S5/epi-gnostic/tests` (dev extra: `pytest>=8.0`, `pytest-asyncio`). Do not use the global `python3`: this project venv carries the architecture-matched native dependencies.

## Child DOX Index
- `epi_gnostic/_deprecated/AGENTS.md` — cycle-4 deletion boundary for the retired Graphiti HTTP compatibility wrapper.
