---
coordinate: "S5.2'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S5-2-SPEC]]"
  - "[[S5-TRACEABILITY-INDEX]]"
---

# S5.2' Shard: epi-kbase — Bounded Resource Context (NotebookLM Type)

## Intent

Own **epi-kbase**: the bkmr-based wrapper that operates as a local NotebookLM fork. Its function is to **pool, semantically embed, and make available** a bounded set of resources within a given DAY/NOW run, so that agents operate against a curated resource field rather than the entire corpus.

This is **not** a file maker (that is hen/khora at S3-1'). This is the **resource field setter**: Psyche (P4 coordinator) works with epi-kbase to determine and bind the scoped bkmr project space for all resources relevant to a given agent task run.

### The NotebookLM Parallel

Google NotebookLM's core innovation: give an LLM a **bounded set of sources** and let it reason *only* against those sources. epi-kbase applies the same principle to the multi-agent system:

| NotebookLM | epi-kbase |
|---|---|
| Create notebook | Bind `bkmr --project <scope>` |
| Add sources | Index vault files, transcripts, insights via `bkmr add --project` |
| Query notebook | `bkmr --gemini sem-search <query> --project <scope>` |
| Citations | `include_sources` provenance in search results |

The difference: NotebookLM is manual (user adds sources). epi-kbase is **automatic** — Psyche determines the resource scope from the task's coordinates and session lineage.

## Core Mechanism: bkmr `--project` Scoping

The entire S5.2' function rests on one parameter: `bkmr --project <scope>`.

```bash
# Full corpus (fallback)
bkmr --gemini sem-search "quaternary logic patterns" --project epi-logos

# Day-scoped (bounded to one day's indexed resources)
bkmr --gemini sem-search "quaternary logic patterns" --project epi-logos:02-05-2026

# Run-scoped (bounded to one session's resources)
bkmr --gemini sem-search "quaternary logic patterns" --project epi-logos:02-05-2026:session-abc
```

### Project Scope Hierarchy

```
epi-logos                          ← full corpus (fallback)
├── epi-logos:{day_id}             ← day-bounded resources
│   ├── epi-logos:{day_id}:{now_id} ← run-bounded resources
│   └── epi-logos:{day_id}:{now_id} ← (another run in same day)
└── epi-logos:skills               ← skill index (Agora CF4a)
```

### What Gets Indexed

| Resource Type | Source | Index Trigger |
|---|---|---|
| Vault files (seeds, world, map) | `/Idea/Bimba/` | Hen sync cycle |
| Session transcripts | `.epi-claw/agents/*/sessions/` | Session close hook |
| External bookmarks | `bkmr add` CLI | Manual or automated |
| Crystallized insights | `s5.py:/crystallize` output | Sophia seal flow |
| M-coordinate content | `Idea/Bimba/Map/M*` | M-gate crystallization |
| Skill definitions | `extensions/*/skills/*/SKILL.md` | Agora CF4a indexing |

## Build Scope

- Assemble kbase pools for S4 context via `bkmr --project`.
- Decide retrieval mode and disclosure policy per run.
- Keep corpus namespace/version explicit.
- Bind kbase project scope at session init via NowCoordinator.
- Propagate scope to child agents via orchestration envelope metadata.
- Implement dynamic scope widening: if run-scoped query yields no results, widen to day-scoped, then fallback.

## API / Envelope / TS

### Envelope Convention (orchestration-envelope.ts)

kbase project scope is carried via `QlNativeOrchestrationEnvelope.metadata`:

```typescript
metadata: {
  kbaseProject: "epi-logos:02-05-2026:session-abc",
  kbaseProjectFallback: "epi-logos"
}
```

Well-known metadata keys: `METADATA_KBASE_PROJECT`, `METADATA_KBASE_PROJECT_FALLBACK`. Helpers: `readKbaseProject()`, `setKbaseProject()`.

### NowCoordinator Binding (anima/now/coordinator.ts)

`bindSessionNowContext()` populates kbase fields on `NowLineage`:

```typescript
kbaseProject: "epi-logos:{day_id}:{session_id}"
kbaseProjectFallback: "epi-logos"
```

`buildDayMergeClosurePayload()` includes:

```typescript
s_5_kbase_project: lineage.kbaseProject
s_5_kbase_project_fallback: lineage.kbaseProjectFallback
```

### Skill Search Override (aletheia/kbase-search.ts)

`skillSearch()` accepts optional `project` override from envelope metadata, falling back to `process.env.BKMR_PROJECT || "epi-logos"`.

### Owned Envelope Fields

- `s_2_kbase_pool_id` — context pool identifier consumed by S4.
- `s_2_retrieval_mode` — semantic / keyword / hybrid / episodic.
- `s_2_source_set` — source set assembled from Gnosis, kbase, episodic, Bimba, vault.
- `s_5_kbase_project` — scoped bkmr project for this run.
- `s_5_kbase_project_fallback` — fallback (full corpus) project.

### Owned API Paths

- `s5'.kbase.search` / `s5'.kbase.add` / `s5'.kbase.pool` / `s5'.kbase.status`

## Agent Integration

### Psyche Sets the Field (P4 Day)

During run setup, Psyche determines the kbase scope:
1. Read task coordinates from VAK evaluation.
2. Determine which resources are relevant.
3. Bind kbase project to session via `NowCoordinator.bindSessionNowContext()`.
4. All spawned child agents inherit the scope via envelope metadata.

### Lachesis Queries the Field (P4' Night')

At Night' P4' Discovery ("what sources inform?"), Psyche dispatches Lachesis:
- Calls `bkmr --gemini sem-search <query> --project <bound-scope>`.
- Returns sources that informed the work, with provenance.
- Missing sources flagged → may trigger new resource indexing.

### Sophia Indexes Back (P5 Seal / Apokatastasis)

When Sophia seals a cycle:
1. Crystallized insight → `s5.py:/crystallize`.
2. Insight indexed back into bkmr → `bkmr add <insight-url> --project <scope>`.
3. Future runs can discover this insight via kbase search.
4. Apokatastasis: no spark lost, every extraction credited to origin.

### Agora CF4a ("What already exists?")

Agora queries kbase before creating new integrations:
- `skillSearch({ query, project: envelope.kbaseProject })`.
- `hasHighRelevanceMatch()` at 0.8 threshold gates creation.

## Implementation Hooks

- `hen/kbase.ts` — low-level bkmr wrapper with `runKbaseSearch({bkmrPath, query, project, topN, json})`.
- `aletheia/kbase-search.ts` — skill-level search with project override, tag extraction, formatting.
- `aletheia/kbase-suggest.ts` — contextual suggestions via `epi kbase suggest --context --project`.
- `pleroma/tool-registry.ts` — bkmr registered with ownerScope: "aletheia", allowedScopes: ["eros", "psyche", "anansi", "nous", "logos"].
- `Pratibimba/System/app/routers/s5.py` — S5' REST API with synthesize/crystallize/mobius-return endpoints.

## Test Obligations

- kbase pool ID is consumable by S4.
- Strategy changes retrieval mode.
- NowLineage kbase fields populated correctly from day_id + session_id.
- Closure payload carries `s_5_kbase_project` and `s_5_kbase_project_fallback`.
- Envelope `readKbaseProject()` reads scoped → fallback → undefined.
- `skillSearch()` respects project override from envelope.

## Boundaries

- S5.2' governs retrieval meaning and kbase resource field setup.
- S2 executes substrate retrieval (graph/vector).
- S3-1' (hen/khora) makes files; S5.2' sets the bounded resource context.
- S5.2 (base) owns Gnosis/RAG corpus ingestion; S5.2' (prime) owns governance, strategy, and kbase pool binding.
- Psyche (P4) is the coordinator that calls into S5.2' to set the field; S5.2' does not self-invoke.
