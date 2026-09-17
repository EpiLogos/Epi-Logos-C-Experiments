# Bimba property recovery — 2026-07-28 wipe

Artifacts produced by Track 54 (`54.T54.02`) from the Neo4j transaction log in
`~/bimba-forensic/`. They are a **record of what was applied**, not a source to
re-run blindly.

## What was lost, and what these recover

The `DETACH DELETE` destroyed the `:Bimba` namespace. Structure came back from
the datasets — 1,978 nodes, 12,208 relationships, 996/996 Map coordinates.
Properties did not, because the dataset replay only restores the generator's
`registeredTargets` allowlist: any property with no repo-side source — a `q_*`
register curated straight into the graph through MCP, say — had nowhere to come
back from.

The transaction log has all of them, because it records every write regardless
of whether anything downstream knew the property existed. That is why this
recovery reaches what the dataset join structurally cannot.

## Files

- `recovered-bimba-properties.cypher` — additive `SET n +=` per coordinate.
  **Properties only**: no node or relationship is created or deleted. Emitted as
  a *delta*: every property already present on the live node was left alone, so
  nothing live is overwritten by a log value.
- `recovered-bimba-properties.audit.json` — one entry per assignment, carrying
  the coordinate, the property, and the transaction id it was recovered from.
- `recovered-empty-property-values.cypher` / `.audit.json` — the **empty-value
  repair** over the above (see below). Guarded `SET n.<prop>` per row, never
  `SET n +=`.

## Applied

Replayed forward to the transaction immediately before **tx 59354** (the mass
delete, 2,098 node deletions). Applied to live on 2026-07-29 behind
`~/bimba-forensic/backups/neo4j-data-20260729-pre-t5403.tar.gz`:

| measure | before | after |
|---|---|---|
| `:Bimba` nodes | 1,978 | 1,978 (unchanged) |
| relationships | 12,208 | 12,208 (unchanged) |
| properties on `:Bimba` | 30,872 | 51,641 |
| `q_*`/`qm_*` registers | 374 over 66 nodes | 721 over 108 nodes |

Proven on a throwaway restored from that backup before touching live: the same
apply took `cli_canon_coord_depth_ladder` from 3 failed to 6 passed, which is
the regression the wipe caused.

## The empty-value repair (2026-07-29, Architect-authorised)

The replay above decoded most property values, but **long text lives in Neo4j as
`DynamicRecord` chains, and the decoder emitted `''` for those instead of
refusing.** That empty delta went to live: **1,002 empty-string properties over
484 `:Bimba` nodes** (`c_*` 793, `t_*` 82, `q_*` 56, `l_*` 49, `p_*` 11,
`s_*` 11). `M0-0-0.c_0_void_relationship` was `''` against 342 real characters.

This is not cosmetic. Recovery is emitted as a delta that leaves alone every
property already **present** — and an empty write makes the key present. Left
there, every future recovery pass skips those 1,002 keys permanently.

Repaired from a **different source of truth**: `54.T54.04-recovered-properties.json`,
an independent reconstruction from Claude/Codex session transcripts (graph
read-backs recorded verbatim in `tool_result` blocks), not from the transaction
log. Prose: `54.T54.04-crossvalidation-disagreements.md`.

Derivation is the intersection — a live empty repaired only where the transcript
holds a non-empty value. Every statement is shaped and guarded:

```cypher
MATCH (n:Bimba {coordinate: $coord}) WHERE n.<prop> = '' SET n.<prop> = $value
```

The `WHERE … = ''` guard makes the write idempotent and makes it structurally
impossible to overwrite real content. Values were passed as **parameters**, never
interpolated — they carry quotes, newlines and unicode (`∞`, `→`, `R#/##`).

Applied in one transaction on 2026-07-29 behind
`~/epi-backups/neo4j/epi-neo4j-data-20260729T173217Z.tar.gz`
(sha256 `5eb45c06…ccd34e4`), rehearsed against live and rolled back first:

| measure | before | after |
|---|---|---|
| empty-string properties on `:Bimba` | 1,002 | 828 |
| nodes carrying one | 484 | 393 |
| `:Bimba` nodes | 1,978 | 1,978 (unchanged) |
| relationships | 12,368 | 12,368 (unchanged) |

174 statements, 174 matched, 0 no-ops — the drop equals the repair count exactly.

> A concurrent writer (the `54.T54.02` sibling restoring the 163 missing
> coordinate nodes) committed moments later, taking the live graph to 2,141
> `:Bimba` nodes / 12,722 relationships and adding 33 empty properties on 22
> new coordinates. That is separable and not attributable to this repair, whose
> own before/after was measured atomically inside its own transaction.

## Known gaps

- 94 values were **skipped, not guessed** — `TEMPORAL` and `GEOMETRY` are
  carried losslessly by the decoder but not interpreted into datetimes/points.
- 163 recovered coordinates have no live node. They are reported rather than
  created: restoring structure is not this tranche's job.
- **828 of the 1,002 empties remain**, because no transcript ever recorded a
  read-back of them (`c_*` 656, `t_*` 75, `l_*` 43, `q_*` 39, `p_*` 10,
  `s_*` 5). They are enumerated in the `residual` array of
  `recovered-empty-property-values.audit.json`. **They are not recoverable from
  transcripts — they need `54.T54.02`'s `DynamicRecord` decoding fixed at
  source and the log re-decoded.** That is open work, not a closed gap.
