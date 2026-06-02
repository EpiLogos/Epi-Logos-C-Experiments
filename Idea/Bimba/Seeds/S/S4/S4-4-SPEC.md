---
coordinate: "S4.4"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S4-SHARD-INDEX]]"
  - "[[S4-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
---

# S4.4 Shard: Psyche and Context

## Canonical Role

[[S4.4]] is the [[P4]] / [[CT4a]]-[[CT4b]] context layer of [[S4]]: lived runtime context, [[Psyche]] state, goal/scope posture, context-pack assembly, trace stream, and the inhabited task-world that lets dispatch remain accountable to the actual session.

## Source And Diagram Anchors

- Umbrella and local authority: [[S4-SPEC]], [[S4-SHARD-INDEX]], [[S4-TRACEABILITY-INDEX]], [[S4'-SPEC]], [[S4-4'-SPEC]], [[S4-4'-GOAL-PRELUDE-SPEC]].
- Diagram anchors: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]].
- World/MOC anchors: [[S4]], [[S4']], `Idea/Bimba/World/Types/Coordinates/S/S4/S4.canvas`, `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`.
- Migrated sources: [[S4-NOW-INTEGRATION-AND-ENVIRONMENT]], [[2026-05-22-vak-as-operational-substrate]], [[2026-04-04-vault-autodetect-session-bootstrap]], [[2026-05-21-agent-led-coordinate-promotion-policy]].

## Current Body Reality

The immediate code reality is spread across Anima and Khora. `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` registers `goal_prelude`, `vak_evaluate`, `anima_orchestrate`, dispatch tools, and session [[CS]] state. `Body/S/S4/ta-onta/S4-0p-khora/extension.ts` creates and exposes session/day/NOW identity, and `Body/S/S4/ta-onta/S4-1p-hen/modules/template-vak.ts` renders [[VAK]] fields into Day/NOW frontmatter.

The goal prelude is already specified as NOW-bound dialogue in [[S4-4'-GOAL-PRELUDE-SPEC]]. Current tests touch the pieces rather than a full Psyche store: `template_vak.test.ts` proves frontmatter VAK injection, `dispatch_vak_required.test.ts` proves dialogical vs mechanistic dispatch, and `anima_invoke_payload.test.ts` validates invocation payload construction.

## Build Contract

Context assembly is a coordinator, not a retriever. [[S4.4]] may ask [[S1]]/[[Hen]] for vault context, [[S2]] for coordinate graph/retrieval, [[S3']] for temporal state, and [[S5']] for kbase/Gnosis review material, but it must record the returned handles and not smuggle retrieval ownership into S4.

`/goal` starts as a [[GoalPrelude]] in [[CPF]] `(00/00)`, writes to the active [[NOW]], and returns to dialogue before a run, cron, or review lane exists. Confirmed goals may compile into [[GoalSpec]] and [[GoalRun]] only after user assent or explicit task framing.

## API / Envelope / Implementation Hooks

- `s4'.psyche.state` and `s4'.psyche.update` own operative notebook, current task, subtasks, artifacts, visibility stance, and continuity state.
- `s4'.context.assemble` must return source handles, coordinate anchors, privacy posture, and trace metadata.
- `s4'.goal.prelude` is the live mirror of [[S4-4'-GOAL-PRELUDE-SPEC]]; compile/invoke surfaces require confirmed intent.
- Frontmatter must preserve `cpf`, `ct`, `cp`, `cf`, `cfp`, `cs_code`, and `cs_direction`.

## Test Obligations

- Goal prelude tests must prove a NOW-bound markdown artifact is created without cron/run/review side effects.
- Psyche state tests must round-trip real persisted state, not an in-memory fixture.
- Context assembly tests must consume real source handles from S1/S2/S5 surfaces.
- VAK frontmatter tests must keep `Night'` and [[CT4a]] / [[CT4b]] distinctions canonical.

## Open Gaps

- A full persisted Psyche state store exists as a specified gateway surface, but richer goal state and context-pack assembly remain open in [[S4-SPEC]].
- `nous_disclose` still uses a helper path for context; target `s4'.context.assemble` must route through explicit S1/S2/S3/S5 contracts.

## Boundaries

[[S4.4]] inhabits context. [[S4.4']] [[Anima]] publishes VAK/Psyche law, [[S2]] and [[S5]] produce source pools, [[S3']] owns temporal runtime, and [[S1']] [[Hen]] owns vault artifact form.
