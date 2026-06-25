# AGENTS.md — S4-3p-chronos

## Purpose
The Chronos ta-onta carrier (S4-3') — "Chronos carrier law for the temporal frame under which every S4' dispatch runs" (`modules/temporal-frame.ts`); the temporal authority owning the Day/NOW lifecycle, cron/Möbius scheduling, and temporal-frame computation, folded onto S3 (Gateway/Transport).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-3'-SPEC]] (carrier law) -> [[S3-3'-SPEC]] (S-layer temporal fold)

## Ownership
- `extension.ts` — pi-coding-agent extension entry; registers Chronos tools, hooks, orbit scheduling
- `CONTRACT.md` — binding responsibility/tool/lifecycle contract (the local interface of record)
- `spine-contribution.ts` — `S3'/Temporal` spine injection slot, ledger channel, compiler pass, query handler
- `modules/temporal-frame.ts` — temporal-frame law: `computeDayId`, `nowPath`, `directionForRun`
- `modules/aeon-scheduling.ts` — [[Aeon]] CT4b scheduling binding: cron registration payloads, result-drop `on_event` matching, CPF consent enforcement
- `modules/graphiti-day-arc.ts` — seam to the Graphiti day-arc runtime (non-fatal when sidecar absent)
- `S3'/kairos-python-adapter.ts` — kerykeion natal-chart provider (invoked by Janus within Chronos)
- `tests/` — `node:test` suites: `temporal_frame`, `graphiti_day_arc`, `kairos_additive`, `aeon_scheduling`
- Does NOT own: NOW/Day structure definition + template instantiation (Hen), thought classification (Aletheia), agent dispatch (Anima), session identity + write primitive (Khora). Chronos TRIGGERS; siblings CREATE/EXECUTE.

## Local Contracts
- `CONTRACT.md` (Responsibility, Registered Tools, Temporal Lifecycle Events, Key Invariants)
- Coordinate Header: `modules/temporal-frame.ts` `//` doc-comment citing `S4-3'-SPEC §"Build Contract"`
- Owning spec: [[S4-3'-SPEC]]; S-layer fold spec: [[S3-3'-SPEC]] / [[S3-3-SPEC]]

## Work Guidance
- Run `gitnexus_impact` on any symbol before editing it (`computeDayId`, `dayArc`, orbit helpers are imported across the carrier and `extension.ts`).
- `[[wikilink]]` all coordinate/carrier/agent/spec references in any authored artifact.
- Honour CONTRACT.md invariants: Chronos triggers, Hen creates; archive path always includes `W{WW}`; SEED.md is `/Empty/Present/SEED.md` only (distinct from `/Bimba/Seeds/`).
- Vault writes use coordinate-prefixed `c_n_*` / `s_3_*` frontmatter (see `spine-contribution.ts` `s_3_day_id`, `s_3_kairos_mode`).

## Verification
- `node --test "Body/S/S4/ta-onta/S4-3p-chronos/tests/"` (Node built-in test runner; no package.json at this carrier).
- Graphiti day-arc tests must stay non-fatal when the sidecar is unavailable (per `modules/graphiti-day-arc.ts`).

## Child DOX Index
- (leaf)
