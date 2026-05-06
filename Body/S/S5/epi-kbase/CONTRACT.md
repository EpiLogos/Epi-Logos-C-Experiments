# epi-kbase Contract

**Coordinate**: S5.2'
**Shard Spec**: [[S5-2'-SPEC]]
**Role**: Bounded resource context for DAY/NOW agent runs

## What This Module Does

epi-kbase is the TS interface layer that PI agents use to access
project-scoped bkmr semantic search. It operates as a local NotebookLM
fork: pooling, embedding, and making available a bounded set of resources
within each agent run.

## Integration Surface

| Export | Consumer | Purpose |
|---|---|---|
| `bindKbaseProject()` | Anima/NowCoordinator | Bind run-scoped project at session init |
| `readKbaseProject()` | Any agent | Read project scope from envelope metadata |
| `setKbaseProject()` | Psyche (P4) | Set scope on orchestration envelope |
| `propagateKbaseToChild()` | Agent spawner | Inherit parent scope in child agents |
| `kbaseSearch()` | Lachesis (P4') | Semantic search within bounded field |
| `skillSearch()` | Agora (CF4a) | "What already exists?" skill lookup |
| `hasHighRelevanceMatch()` | Agora (CF4a) | Gate new integration creation |

## Dependencies

- `bkmr` CLI (must be on PATH)
- `BKMR_PROJECT` env var (optional, defaults to `epi-logos`)

## Upstream (consumes from)

- S0 `epi-cli/scripts/kbase.sh` — shell-level bkmr wrapper
- S0 `epi-cli/src/core/knowing/kbase.rs` — Rust `build_kbase_field()`

## Downstream (consumed by)

- S4 ta-onta Anima/NowCoordinator — session binding
- S4 ta-onta Aletheia — skill search, kbase suggestions
- S4 ta-onta Pleroma — tool registry (bkmr tool access control)
- S5' Epii — retrieval governance, disclosure strategy
