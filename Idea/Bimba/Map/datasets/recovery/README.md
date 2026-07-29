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

## Known gaps

- 94 values were **skipped, not guessed** — `TEMPORAL` and `GEOMETRY` are
  carried losslessly by the decoder but not interpreted into datetimes/points.
- 163 recovered coordinates have no live node. They are reported rather than
  created: restoring structure is not this tranche's job.
