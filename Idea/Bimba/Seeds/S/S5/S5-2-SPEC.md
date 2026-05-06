---
coordinate: "S5.2"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S5-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S5-2'-SPEC]]"
---

# S5.2 Shard: Gnosis and Corpus Grounding

## Intent

Own [[Gnosis]], [[RAG-Anything]], NotebookLM, Vimarsa/kbase, corpus ingestion, retrieval, and namespace grounding. This is the **base** (Day-side) substrate for world-return corpus semantics.

The prime counterpart [[S5-2'-SPEC]] owns the kbase governance layer: bounded resource context setup (NotebookLM-type pooling), retrieval strategy, and disclosure policy. S5.2 owns the ingestion, embedding, and retrieval substrate that S5.2' governs.

## Build Scope

- Decide canonical embedding dimension/namespace before implementation.
- Reconcile older 1536/T1 corpus docs with newer 3072 Gnosis/Bimba direction.
- Use S2 substrate without owning graph persistence.
- Maintain bkmr project namespace conventions for scoped indexing.

## API / Envelope / TS

- Owns `s5.gnostic.*`.
- Supports `s5'.kbase.*` (governed by S5.2').
- Populates source-set, retrieval-mode, and kbase pool fields.
- `s_2_source_set` — assembled source set.
- `s_2_retrieval_mode` — semantic / keyword / hybrid / episodic.

## Implementation Hooks

- `epi-gnostic`.
- `epi techne gnosis`.
- `epi vimarsa`.
- `kbase.sh` / bkmr CLI.
- `hen/kbase.ts` — low-level bkmr wrapper.

## Test Obligations

- Real ingest/query over configured corpus path.
- Embedding namespace/version is asserted.
- bkmr project scoping produces correct namespace hierarchy.

## Boundaries

S5.2 owns world-return corpus semantics and ingestion substrate; S2 owns graph/vector persistence. S5.2' owns the governance layer that determines *which* resources enter *which* bounded context for a given run.
