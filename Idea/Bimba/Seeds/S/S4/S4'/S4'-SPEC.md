---
coordinate: "S4'"
c_4_artifact_role: "canonical-seed-spec"
c_1_ct_type: "CT1"
c_3_crystallised_at: "2026-06-02"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S4-SHARD-INDEX]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
---

# S4' Specification: Anima, VAK, Ta-Onta, And Capability Governance

## Canonical Status

This file is the single authoritative S4' seed. S4 is the PI runtime substrate; S4' is the Anima/VAK/ta-onta governance layer: coordinate evaluation, constitutional-agent orchestration, permission/capability matrix, Psyche state, and six ta-onta carriers. It is not the S5 Epii review body and not the S3 transport runtime.

VAK gate: `CPF=(4.0/1-4.4/5)`, `CT=CT4`, `CP=4.4 context`, `CF=(4.5/0) Psyche with Anima`, `CFP=S4'`, `CS=CS4`.

## Submodules And Subcoordinates

| Coordinate | Carrier | Constitutional mapping | Current substrate |
|---|---|---|---|
| `S4.0'` | Khora | command/tool membrane and ground | `Body/S/S4/ta-onta/S4-0p-khora` |
| `S4.1'` | Hen | template/frontmatter/vault law interface | `Body/S/S4/ta-onta/S4-1p-hen` |
| `S4.2'` | Pleroma | plugin/skills/capability substrate | `Body/S/S4/ta-onta/S4-2p-pleroma`, `Body/S/S4/plugins/pleroma` |
| `S4.3'` | Chronos | temporal/Kairos mediation | `Body/S/S4/ta-onta/S4-3p-chronos` |
| `S4.4'` | Anima | dispatch/orchestration/Psyche state | `Body/S/S4/ta-onta/S4-4p-anima` |
| `S4.5'` | Aletheia | crystallisation/review trigger membrane | `Body/S/S4/ta-onta/S4-5p-aletheia` |

Six constitutional agents: Nous `(0000)`, Logos `(0/1)`, Eros `(0/1/2)`, Mythos `(0/1/2/3)`, Psyche `(4.5/0)`, Sophia `(5/0)`. Aletheia subagents: Anansi, Moirai, Janus, Mercurius, Agora, Zeithoven.

## Public APIs And Gateway Methods

| Method family | Status | Owner rule |
|---|---|---|
| `s4'.vak.evaluate`, `s4'.orchestrate`, `s4'.mediation.route` | current gateway methods | S4' owns VAK/orchestration/capability routing |
| `s4'.psyche.state`, `s4'.psyche.update` | current gateway methods | Psyche/NOW continuity state, not S3 temporal store |
| `s4'.permission.get` | current gateway method | capability matrix/permission membrane |
| `device.*`, `exec.approval.*`, `skills.*` | S4' governance/status mirrors | S4' owns permission/capability posture |
| `dispatch_agent`, `dispatch_parallel_agents`, `dispatch_fusion_agents`, `run_chain`, `dispatch_moirai_night_pass`, `anima_self_invoke` | ta-onta dispatch tools | must be upstream-gated by `vak-evaluate` |

## Lifecycle, Data Shapes, Privacy

| Shape/event | Privacy | Lifecycle |
|---|---|---|
| VAK evaluation envelope (`cpf`, `ct`, `cp`, `cf`, `cfp`, `cs`) | public-current unless task refs protected | evaluate -> route -> dispatch -> deposit |
| capability-matrix entry | public-current/operator | declare -> test parity -> runtime gate -> audit |
| Psyche state | local operational/protected handles | read NOW/session -> update context -> handoff/deposit |
| Aletheia crystallisation envelope | mixed; review-gated | observe -> classify -> deposit to S5/Epii or S1 seed |

## Integration Seams

Calls in from S0 CLI/gateway, M5 Agentic Control Room, Epii review/autoresearch, Nara/Anima dialogue, Pleroma skill/plugin runtime, and agents. Calls out to S1/Hen for vault writes, S2/Pleroma for graph-population support, S3/Chronos for temporal context, S5/Epii for review meaning, and M' kernel-bridge for governed agentic surfaces. The seam invariant is: VAK before dispatch, capability before tool use, deposit before promotion.

## Cross-Cutting Participation

S4' participates in capability matrix, consent/permission gates, Day/NOW continuity, agent identity, plugin/skill governance, portal events (`portal.vak_eval`, `portal.lens_pressure`, `portal.review_deposit`), and Epii/Anima reciprocity.

## Open Decisions And Resolution Status

| Decision | Status | Current resolution |
|---|---|---|
| Pleroma capability matrix authority | resolved | `Body/S/S4/plugins/pleroma/capability-matrix.json` is canonical runtime authority |
| Aletheia vs Epii boundary | resolved | Aletheia is S4.5' crystallisation trigger; Epii is S5' deep review/governance |
| Epii -> Anima bounded invocation | open | contract exists; richer provider-backed execution remains gap |
| plan back-reference edits | blocked by scope | This seed supersedes newer plan fragments; docs/plans were not edited |

## Source Coverage

| Source | mtime | Role |
|---|---:|---|
| `docs/specs/S/S4-S4i-PI-AGENT.md` | 2026-04-04 13:46:16 | PI agent formal spec |
| `docs/specs/S/S4/S4-TA-ONTA-EXTENSION-SPEC.md` | 2026-03-10 13:14:55 | ta-onta extension source |
| `docs/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md` | 2026-04-04 13:36:17 | skills/plugin formal spec |
| `docs/plans/2026-03-10-ta-onta-full-implementation.md` | 2026-03-15 00:26:32 | historical ta-onta plan |
| `docs/plans/2026-04-03-pi-cmux-native-orchestration.md` | 2026-04-03 19:42:07 | orchestration source |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/09-agentic-mediation-and-operational-capacities.md` | 2026-06-02 00:16:51 | nominal mediation/capacity track |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` | 2026-06-02 00:14:24 | current open decision register |

## Substrate And Sibling Seeds

Body paths: `Body/S/S4/pi-agent`, `Body/S/S4/plugins/pleroma`, `Body/S/S4/ta-onta`, `Body/S/S0/epi-cli/src/agent`, `Body/S/S0/epi-cli/src/gate/anima.rs`.

Sibling seeds: `S4-SPEC.md`, `S4-0-SPEC.md` through `S4-5-SPEC.md`, `S4-0'-SPEC.md` through `S4-5'-SPEC.md`, `S4-4'-GOAL-PRELUDE-SPEC.md`, `S4-SHARD-INDEX.md`, `S4'-TRACEABILITY-INDEX.md`.

## World Ontology Inclusion - 2026-06-02

`Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md` mtime 2026-04-10 19:15:04 is now cited as load-bearing S4' ontology: ta-onta extension architecture, Khora/Hen/Pleroma/Chronos/Anima/Aletheia, and the S4'Cx vertical VAK projection. `Idea/Bimba/World/Types/Coordinates/S/S4/S4.md` mtime 2026-04-10 19:15:19 is the paired PI-agent runtime ground. `Idea/Bimba/World/CT0.md`..`CT5.md` supply the context-template law for VAK dispatch.
