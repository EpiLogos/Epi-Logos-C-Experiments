# AGENTS.md — S4-3p-chronos

## Purpose
The Chronos ta-onta carrier (S4-3') — "Chronos carrier law for the temporal frame under which every S4' dispatch runs" (`modules/temporal-frame.ts`); the temporal authority owning the Day/NOW lifecycle, cron/Möbius scheduling, and temporal-frame computation, folded onto S3 (Gateway/Transport).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-3'-SPEC]] (carrier law) -> [[S3-3'-SPEC]] (S-layer temporal fold)

## Ownership
- `extension.ts` — pi-coding-agent extension entry; registers Chronos tools and routes Khora completion events into orbit scheduling/re-entry
- `CONTRACT.md` — binding responsibility/tool/lifecycle contract (the local interface of record)
- `spine-contribution.ts` — `S3'/Temporal` spine injection slot, ledger channel, compiler pass, query handler
- `modules/temporal-frame.ts` — temporal-frame law: `computeDayId`, `nowPath`, `directionForRun`
- `modules/aeon-scheduling.ts` — [[Aeon]] CT4b scheduling binding: cron registration payloads, result-drop `on_event` matching, CPF consent enforcement; a bound `task_source` advances one tranche per fire and an exhausted list refuses dispatch (47.4)
- `modules/aeon-task-source.ts` — 47.4 [[Aeon]] task-source binding: Ralph PRD markdown checkboxes → ordered tranches; JSON checkpoint (completed ids + fire history) persists across fires; `advanceAeonTaskSource` is the per-fire work-list cursor
- `modules/graphiti-day-arc.ts` — seam to the Graphiti day-arc runtime (non-fatal when sidecar absent)
- `modules/cron-fire.ts` — 47.2 fired-cron → [[Anima]] dispatch unit: `chronos_cron_fire` resolves payload → (agent, task, VakAddress) and routes through `dispatchTeamMember` (a scheduled fire is a normal VAK dispatch, not a side channel); `wake_mode` now/next-heartbeat shapes the address (CP4.2/CS2 vs CP4.4/CS4); re-exported by `extension.ts`, which keeps only the typebox tool registration
- `modules/temporal-control-plane.ts` — 19.11 response-orbit scheduling and rhythm re-entry: real cron registration, response-token/kairos receipt, Hen content delta, Janus spread delta, Mercurius kairos delta, Khora top inscription
- `S3'/kairos-python-adapter.ts` — kerykeion natal-chart provider (invoked by Janus within Chronos)
- `tests/` — `node:test` suites including `temporal_control_plane` (real filesystem + real `epi gate cron` round trip), `temporal_frame`, `graphiti_day_arc`, `kairos_additive`, `aeon_scheduling`, `cron_fire_dispatch`, and `aeon_task_source`
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
