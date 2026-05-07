---
coordinate: "S1'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[S-SHARDING-TASK-LIST]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[S4-SPEC]]"
  - "[[S5-SPEC]]"
---

# Flow 2026 05 06 Smart Env Hen Link Candidate Pool

## Decision

[[Hen]] should consume [[Smart Env]] as a read-only suggestion pool for wikilink targets.

Authority does not move:

- [[Hen]] still decides which `[[wikilinks]]` get written.
- compiler lint/health remains canonical for broken links, backlink symmetry, and residency law.
- [[S2]] sync remains unchanged and continues to create or update graph state from the links Hen actually writes.

## Integration Shape

Add one narrow S1-side adapter:

- `hen_link_candidates`
- input: current draft or target note path, optional source coordinate set, optional limit
- output: ranked existing-note candidates only

Candidate sources:

1. explicit Smart Env outlinks from source notes
2. semantic source neighbors from Smart Env source embeddings
3. semantic body-block neighbors from Smart Env block embeddings

Candidate output fields:

- `target_path`
- `wikilink_title`
- `score`
- `kind` = `explicit_outlink` | `semantic_source` | `semantic_block`
- `evidence_source_path`
- `evidence_lines`
- `stale`

## Guardrails

- Treat `Idea/.smart-env` as generated intermediate data, not compiler authority.
- Do not let frontmatter-heavy blocks dominate ranking. Keep declared provenance separate from body-semantic suggestions.
- Do not write Smart Env vectors into canonical [[S2]] indexes.
- Do not let Smart Env create nodes, edges, or canonical relations directly.

## Compiler Use

The compiler spine should inject a compact "suggested link pool" into generation or repair passes:

- for new artifact drafting
- for sparse-link repair
- for missing-backlink repair suggestions

Hen then selects from the pool and writes normal Obsidian wikilinks. The existing link health logic remains the gate.

## Minimal First Pass

- no new embedding jobs
- no Smart Env plugin RPC
- no graph changes
- no new canonical schema

Only parse `Idea/.smart-env/multi/*.ajson`, rank candidates, and hand them to [[Hen]].

## Test Shape

Use real `.ajson` fixtures and real markdown notes:

- explicit outlink extraction
- semantic candidate ranking from source and block records
- stale-path rejection
- frontmatter/body separation
- compiler acceptance of candidate pool without bypassing existing link validation
