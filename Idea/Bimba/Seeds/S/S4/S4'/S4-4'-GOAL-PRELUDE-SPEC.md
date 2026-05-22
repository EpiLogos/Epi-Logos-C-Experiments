---
coordinate: "S4.4'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT4b"
c_3_ctx_frame: "4.0/1-4.4/5"
c_3_created_at: "2026-05-18T00:00:00Z"
c_0_source_coordinates:
  - "[[S4-4'-SPEC]]"
  - "[[S4-SPEC]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[S4-NOW-INTEGRATION-AND-ENVIRONMENT]]"
  - "[[S5'-TRACEABILITY-INDEX]]"
---

# S4.4' Goal Prelude Specification

## Intent

Own `/goal` as a dialogical VAK entry surface inside [[Anima]] and [[Psyche]], not as a rigid background pipeline.

The first `/goal` invocation discovers intent. It writes a markdown prelude into the active [[NOW]] and returns to the user with an open summary. It does not create a durable run record, does not schedule cron, and does not compile an autonomous task by default.

The goal prelude is the place where [[Nous]] clears assumptions, [[Aletheia]] and kbase surfaces gather source context, and [[Psyche]] receives a living task-world. Only after user dialogue confirms or revises the discovered intent may the system compile an immediate task, isolated NOW run, scheduled Chronos run, or Epii/Aletheia review lane.

## Z-Thread Identity

**The `/goal` lifecycle defined here IS the Z-thread self-composing cycle** — the CFP code `Z` in [[VAK]] grammar, redefined from "zero-touch / transcendent automation" to **"self-composing: the system as its own composer, performer, audience, and critic"**.

The four phases:

```
compose   →   perform   →   rehear   →   recompose   →   next compose
(GoalPrelude  (GoalRun     (Aletheia    (Epii            (P5' Insight
 in (00/00)    via CFP      ingest +     autoresearch:    -> P0'
 dialogical)   dispatch     Sophia       Zeithoven        Questions
               from         disclosure   challenger +     opens
               compiled     + T/T'       Darshana         next
               GoalSpec)    routing)     evaluation +     compose
                                         keep/discard)    phase)
```

- Compose-phase is owned by S4.4' (this spec).
- Perform-phase is owned by [[S4.3']] (Chronos timing) and the CFP/CF dispatch at this layer.
- Rehear-phase is owned by [[S4.5']] / [[Aletheia]] (see [[S4-5'-SPEC]] §Z-Thread Rehear-Phase Role).
- Recompose-phase is owned by [[S5']] / [[Epii]] via autoresearch.

The cycle closes via the **Möbius seam**: [[Sophia]] (within Anima's #5) discloses → [[Aletheia]] curates → [[Epii]] recomposes → next compose-phase begins from an enriched ground.

Z-thread is the only CFP that completes the Möbius. CFP0–5 are textures *within* a single perform-phase; Z is the cycle that holds compose/perform/rehear/recompose together. The dependency: the Z-cycle round-trips only when the Sophia post-execution hook and Moirai Night' dispatch are wired (currently P0 blockers per [[06-vak-pleroma-implementation-gap-analysis]] §Z-Thread Closure Stake).

## Coordinate Placement

Primary home: [[S4.4']] because `/goal` is a VAK/Psyche context surface.

Supporting homes:

- [[S4.3']] / [[Chronos]] receives confirmed goal specs as scheduled invocations, but does not own discovery.
- [[S4.5']] / [[Aletheia]] receives Night' disclosure, thought routing, and crystallisation handoff, but does not own the first user dialogue.
- [[S5.4']] / [[Epii]] owns review and autoresearch evaluation once a goal has a reviewable improvement or meaning decision.
- [[S5.5']] owns promotion, seed generation, and return-to-ground when an approved goal changes lasting knowledge.

Boundary rule: S4.4' owns `GoalPrelude`; S4.3' may schedule `GoalSpec`; S5' may judge, improve, review, or promote outcomes.

## Object Model

### GoalPrelude

`GoalPrelude` is ephemeral in authority but persistent in the NOW folder as session memory. It is user-facing and dialogical.

Required fields:

```yaml
c_4_artifact_role: "goal-prelude"
c_1_ct_type: "CT4b"
c_3_ctx_frame: "4.0/1-4.4/5"
c_3_invocation_kind: "goal"
c_3_session_id: "<session id>"
c_3_day_id: "<day id>"
c_3_created_at: "<iso8601>"
c_0_source_coordinates:
  - "[[S4.4']]"
c_4_vak_status: "prelude"
c_4_cpf: "(00/00)"
c_4_cf: "(0000)"
c_4_cs: "Day"
c_5_review_required: false
```

Recommended path:

`{NOW}/goals/goal-prelude-{YYYYMMDD-HHmmss}.md`

Fallback path when the `goals/` directory does not exist:

`{NOW}/goal-prelude-{YYYYMMDD-HHmmss}.md`

The file belongs in the active NOW because its job is to orient the current session's Psyche state. It should not be written to Seeds, History, or a global cron store during discovery.

### GoalSpec

`GoalSpec` is the executable form that may be created after user assent. It is not produced by the first pass unless the user explicitly asks to proceed and the agent has enough ground.

Required fields:

```yaml
c_4_artifact_role: "goal-spec"
c_1_ct_type: "CT2"
c_3_ctx_frame: "4.0/1-4.4/5"
c_3_invocation_kind: "manual" # manual | immediate | cron
c_4_vak_status: "compiled"
c_4_cpf: "(4.0/1-4.4/5)"
c_4_ct: "<CT values>"
c_4_cp: "<CP value>"
c_4_cf: "<CF value>"
c_4_cfp: "<CFP value>"
c_4_cs: "<CS value>"
c_5_review_required: "<bool>"
```

`GoalSpec` may be invoked immediately by Anima/Psyche or referenced later by Chronos. A cron job must point to a confirmed `GoalSpec` or NOW-bound task artifact, not raw user intent.

### GoalRun

`GoalRun` is execution history. It exists only after work begins.

It records:

- originating `GoalSpec`
- run mode: `immediate`, `isolated_now`, or `cron`
- NOW path for that bounded execution
- VAK block active at invocation
- worker summary
- evidence and context bundle links
- S5/Aletheia/Sophia verdict or disclosure summary when present
- next P0' questions when a Mobius return occurs

## Prelude Markdown Template

```markdown
---
c_4_artifact_role: "goal-prelude"
c_1_ct_type: "CT4b"
c_3_ctx_frame: "4.0/1-4.4/5"
c_3_invocation_kind: "goal"
c_3_session_id: "<session id>"
c_3_day_id: "<day id>"
c_3_created_at: "<iso8601>"
c_0_source_coordinates:
  - "[[S4.4']]"
c_4_vak_status: "prelude"
c_4_cpf: "(00/00)"
c_4_cf: "(0000)"
c_4_cs: "Day"
c_5_review_required: false
---

# Goal Prelude - <short title>

[[NOW-<session id>]] | [[S4.4']] | [[Anima]] | [[Psyche]] | [[Nous]]

## #0 - Ground / Questions

Original user wording:

Open questions:

Assumptions to check:

## #1 - Material / Sources

Context gathered by [[Nous]]:

Relevant kbase, vault, graph, or prior-session references:

## #2 - Possible Operations

Candidate next actions:

Immediate run possibility:

Scheduled run possibility:

## #3 - Patterns / Shape

Likely task shape:

VAK thread candidates:

## #4 - Context / Psyche State

How this fits the current NOW:

Affected coordinates:

Permission, safety, and human-dialogue boundaries:

## #5 - Integration / User-Facing Return

Distilled intent:

Recommended next mode:

What needs user confirmation:
```

## First-Pass Behavior

The default `/goal` pass is successful when it returns a better question or clearer intent to the user.

It must:

- Start as `CPF = (00/00)`.
- Treat dialogue as the work, not as a setup chore.
- Invoke or simulate [[Nous]] clearing before execution planning.
- Gather only enough source context to make the next user-facing summary honest.
- Write one NOW-bound `GoalPrelude` markdown file.
- Return a concise user-facing summary with openness for correction.

It must not:

- Create a cron job.
- Start a long-running subagent.
- Produce a `GoalRun`.
- Promote permanent knowledge.
- Resolve Epii review.
- Treat provisional VAK coordinates as final authority.

## VAK Language Handling

The prelude records provisional VAK language, but does not freeze the pipeline.

The agent may include:

- `CPF`: normally `(00/00)` during discovery.
- `CT`: likely content types, often `CT0,CT1,CT4,CT5`.
- `CP`: where the question currently sits, often `4.0` or `4.4`.
- `CF`: usually `(0000)` / [[Nous]] for first clearing, then candidate [[Psyche]], [[Logos]], [[Eros]], [[Mythos]], or [[Sophia]] routes.
- `CFP`: candidate execution shapes only, never binding on first pass.
- `CS`: `Day` unless the user is explicitly asking for retrospective analysis, in which case candidate `Night'` may be noted.

The next invocation reads the markdown and resolves VAK again. The language composes the pipeline at run time.

## Chronos Integration

Chronos consumes confirmed goal artifacts only.

Allowed:

- `cron.add` with payload referencing a `GoalSpec` path.
- isolated NOW creation for a confirmed recurring goal.
- scheduled invocation with `c_3_invocation_kind: "cron"` and a fresh VAK resolution at runtime.

Forbidden:

- scheduling a raw `/goal` string before dialogue has completed
- using cron as the owner of intent discovery
- bypassing the active NOW or session lineage

Cron is cadence, not meaning.

## Aletheia, Sophia, and Epii Integration

Aletheia and Sophia become active when the goal produces material needing disclosure, thought routing, or return.

Use [[Aletheia]] / [[Sophia]] when:

- the result needs Night' analysis
- the run created thought artifacts
- sources and traces must be routed to T-buckets
- a P5' insight should become P0' questions

Use [[Epii]] / S5' review when:

- the goal affects user-position, identity, Nara/PASU, or protected interpretation
- the goal proposes system self-learning
- the goal proposes permanent knowledge crystallisation
- the goal produces an autoresearch challenger/baseline decision
- human validation is required

System self-learning and permanent promotion must pass through the Aletheia collaboration gate and Epii review surfaces before it becomes canonical.

## API Shape

Target S4' methods:

```text
s4'.goal.prelude
s4'.goal.compile
s4'.goal.invoke
s4'.goal.status
s4'.goal.history
```

Minimal first implementation:

- `s4'.goal.prelude` writes a NOW markdown file and returns the path plus summary.
- `s4'.goal.compile` reads a confirmed prelude and writes a `GoalSpec`.
- `s4'.goal.invoke` executes a confirmed `GoalSpec` immediately or in an isolated NOW.
- `cron.add` references `GoalSpec` paths for recurrence.

PI/Pleroma surface:

- `/goal <text>` should call the prelude behavior.
- A Pleroma skill may implement the markdown/write rules portably.
- A Pi extension may register the command/tool, but the skill owns the conversational protocol.

## Test Obligations

Real-functionality tests must prove:

- A first `/goal` pass writes exactly one goal prelude into an active NOW path.
- The prelude includes `CPF = (00/00)` and provisional VAK fields.
- The first pass returns to the user without creating a cron job or run history.
- `GoalSpec` compilation requires a confirmed prelude or explicit user instruction.
- Cron invocation rejects raw goal text and accepts confirmed `GoalSpec` references.
- Review-required goals create Epii/Aletheia review handoff material without resolving the review themselves.

Mock-only tests are insufficient for this surface because the feature is specifically about real NOW files, real session lineage, and real handoff boundaries.

## Implementation Notes

Preferred first build:

1. Add a Pleroma skill named `goal-prelude`.
2. Add a Pi command/tool named `goal` that writes the CT4b NOW markdown through Khora/Hen where available.
3. Use existing VAK bootstrap injection so the agent has coordinate language in context.
4. Keep the first pass conversational and non-autonomous.
5. Add gateway or CLI mirrors only after the file-based skill behavior is stable.

Do not make the first implementation a scheduler. The scheduler should be a consumer of compiled artifacts after the dialogue phase has done its work.

## Acceptance

The design is complete when a user can type `/goal "..."`, receive a thoughtful intent-discovery summary, and find a corresponding `goal-prelude` markdown file in the active NOW. No run, cron job, review resolution, or permanent crystallisation should occur unless the user explicitly continues into that next mode.
