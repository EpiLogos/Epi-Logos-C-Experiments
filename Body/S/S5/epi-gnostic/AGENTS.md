# AGENTS.md — epi-gnostic

## Purpose
Python package "Gnostic namespace RAG pipeline for Epi-Logos" (`pyproject.toml` description) — RAG-Anything + LightRAG + Neo4j + Graphiti, called by the Rust S5 cores as a subprocess (JSON on stdout).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `pyproject.toml` — package `epi-gnostic`; scripts `epi-gnostic` (`epi_gnostic.cli:main`) + `epi-graphiti` (`epi_gnostic.graphiti_service:main`).
- `epi_gnostic/cli.py` — CLI entry (status/models/ingest/query/notebook/enrich), JSON stdout for Rust.
- `epi_gnostic/{config.py, wrapper.py, arena_promotion.py, storage/, enrichment/}` — config, RAG wrapper, arena-promotion proposal generation, Neo4j vector storage, cross-namespace enrichment.
- `epi_gnostic/{graphiti_service.py, graphiti_config.py}` — Graphiti episodic-memory service; `Dockerfile.graphiti`.
- `scripts/` — `enrich.py`, `migrate_bimba_embeddings.py` (768→3072 migration).
- `cypher/` — bootstrap/relations/pointer Cypher; `tests/` — pytest suite; `schema-context.md` — graph schema notes.
- Does NOT own coordinate semantics, kbase scoping, or the Epii agent contract — those live in sibling S5 cores (`epi-kbase-core`, `epii-agent-core`) and their specs.

## Local Contracts
- Coordinate Header: `epi_gnostic/__init__.py` (`"""Gnostic namespace RAG pipeline for Epi-Logos."""`) + `cli.py` usage docstring (the JSON CLI surface Rust binds to).
- `schema-context.md` (graph schema), `.env.example` (required env).
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]]. No local CONTRACT.md — see parent + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- CLI must keep emitting JSON on stdout — the Rust S5 cores parse it.

## Verification
- `python3 -m pytest Body/S/S5/epi-gnostic/tests` (dev extra: `pytest>=8.0`, `pytest-asyncio`).

## Child DOX Index
- (leaf)
