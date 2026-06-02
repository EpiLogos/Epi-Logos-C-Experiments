---
name: gnosis-retrieve
description: "Gate graph+vector Gnosis retrieval for a workflow. Wraps aletheia_gnosis_query (hybrid vector + graph + Redis) with provenance discipline. Returns grounded, wikilink-cited context — never fabricated recall."
ct: CT2
cp: "4.2"
agent_affinity: aletheia
---

# Gnosis Retrieve

Alignment target: grounded recall.
Primary contacts: Nous (epistemic clearing), Anansi (orientation/gap analysis), Moirai (Night' rehear).
Moirai pattern: Lachesis — measure the harmonic context (P4' Discovery) before any cut.

Gnosis is Aletheia's local RAG pipeline (ingestion → chunk/embed at 3072 dims → Neo4j `:Gnosis` namespace, separate from `:Bimba`). This skill **gates and contextualises** the raw `aletheia_gnosis_query` tool for a specific workflow — it does not replace it.

## Protocol

1. **Scope before querying.** Choose the retrieval surface: a session-scoped `Gnosis:Notebook`, a persistent family notebook, or ad-hoc. Narrow by coordinate where the question is coordinate-bound (`epi techne gnosis query <text>` mirrors the tool for CLI parity).
2. **Hybrid by default.** `aletheia_gnosis_query` fuses vector + graph + Redis cache. Prefer the hybrid result; fall back to vector-only only when the graph is empty for the coordinate.
3. **Provenance is mandatory.** Every retrieved claim must carry its `source_path` / `[[wikilink]]` back to the `:Gnosis:Document` it came from. A result with no provenance is narrative fog (see `[[anansi]]`) and must be discarded or re-queried, not paraphrased forward.
4. **Degrade gracefully.** If the Gnosis sidecar / Neo4j is unavailable, say so and proceed with what is grounded — never invent recall to fill the gap. Missing retrieval must not block ordinary operation.
5. **Hand off, don't conclude.** Retrieval feeds the calling agent's reasoning; it does not itself decide. Deep recompose/autoresearch over retrieved material belongs to Epii, not to the retrieval step.

## Result discipline
Return: `grounded` (cited context) | `partial` (some coordinates unbacked — name them) | `empty` (nothing in Gnosis for this scope). Never `grounded` without provenance.
