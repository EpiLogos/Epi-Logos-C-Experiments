---
coordinate: "S4'"
c_4_artifact_role: "canonical-seed-spec"
c_1_ct_type: "CT1"
c_3_crystallised_at: "2026-06-02"
c_0_source_coordinates:
  - "[[S4-SPEC]]"
  - "[[S4-SHARD-INDEX]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[M-SYMBOLIC-LANGUAGE-ARCHITECTURE]]"
---

# S4' Specification: Anima, VAK, Ta-Onta, And Capability Governance

## Canonical Status

This file is the single authoritative S4' seed. S4 is the PI runtime substrate; S4' is the Anima/VAK/ta-onta governance layer: coordinate evaluation, constitutional-agent orchestration, permission/capability matrix, Psyche state, and six ta-onta carriers. It is not the S5 Epii review body and not the S3 transport runtime.

Diagram consumption: S4' consumes [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]]. Its MOC/canvas authority is `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.canvas`, while active shard/source law remains under [[Seeds]] by [[S-SHARD-HARMONIZATION-PROTOCOL]].

Placement invariant: [[ta-onta]] is the internal [[S4']] carrier set, not a separate system. [[S4.0']] [[Khora]], [[S4.1']] [[Hen]], [[S4.2']] [[Pleroma]], [[S4.3']] [[Chronos]], [[S4.4']] [[Anima]], and [[S4.5']] [[Aletheia]] are S4' sublayers. The [[VAK]] fields [[CPF]], [[CT]], [[CP]], [[CF]], [[CFP]], and [[CS]] are the vertical dispatch grammar operating through those carriers, not a replacement naming scheme for them.

VAK gate: `CPF=(4.0/1-4.4/5)`, `CT=CT4`, `CP=4.4 context`, `CF=(4.5/0) Psyche with Anima`, `CFP=S4'`, `CS=CS4`.

### VAK Reading-Frame Law

Oracle, Tarot, I-Ching, and Mahāmāyā transcription events are first-class VAK-addressed language events. S4' does not interpret their symbolic content; it frames their execution economy before M3 transcribes and M4 integrates.

For reading frames:

- `CPF` declares whether the reading is dialogical/user-engaged or autonomous/mechanistic.
- `CT` declares artifact/content type.
- `CP` declares the active QL position set of the spread; it is the authority for whether the read is a single point, compressed triad, sixfold traverse, inverse pass, or 4/5 depth pass.
- `CF` routes the constitutional handling mode.
- `CFP` declares thread/spread topology, including nested/meta sub-readings.
- `CS` declares Context Sequence and Day/Night' traversal direction.

Variable-size Tarot readings must not be coerced into six positions. The runtime `reading_frame.positions[]` / `OracleFrame.vak_address.cp[]` is authoritative for cardinality. Optional P4 lemniscate sub-readings are nested CP frames, not extra top-level cards. Night' inverse readings are the same frame traversed backward through `CS.direction = Night'`.

## Submodules And Subcoordinates

| Coordinate | Carrier | Constitutional mapping | Current substrate |
|---|---|---|---|
| `S4.0'` | Khora | command/tool membrane and ground | `Body/S/S4/ta-onta/S4-0p-khora` |
| `S4.1'` | Hen | template/frontmatter/vault law interface | `Body/S/S4/ta-onta/S4-1p-hen` |
| `S4.2'` | Pleroma | plugin/skills/capability substrate | `Body/S/S4/ta-onta/S4-2p-pleroma`, `Body/S/S4/plugins/pleroma` |
| `S4.3'` | Chronos | temporal/Kairos mediation | `Body/S/S4/ta-onta/S4-3p-chronos` |
| `S4.4'` | Anima | dispatch/orchestration/Psyche state | `Body/S/S4/ta-onta/S4-4p-anima` |
| `S4.5'` | Aletheia | crystallisation/review trigger membrane | `Body/S/S4/ta-onta/S4-5p-aletheia` |

## Internal QL 0-5 Provenance

| Internal coordinate | QL / build function | Canonical source anchor | Derivation status |
|---|---|---|---|
| [[S4.0']] | [[Khora]] carrier; [[CPF]] ground, bootstrap, session identity, command/write membrane | `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md` carrier table and S4'Cx projection; [[P0]], [[CT0]], [[L0]] / [[L5']] | direct World ontology |
| [[S4.1']] | [[Hen]] carrier; [[CT]] form law, templates, frontmatter, content authority | `S4'.md` carrier table and S4'Cx projection; [[P1]], [[CT1]], [[L1]] / [[L4']] | direct World ontology |
| [[S4.2']] | [[Pleroma]] carrier; [[CP]] operation, bounded primitives, capability substrate | `S4'.md` carrier table and S4'Cx projection; [[P2]], [[CT2]], [[L2]] / [[L3']] | direct World ontology |
| [[S4.3']] | [[Chronos]] carrier; [[CF]] temporal pathing, [[Day]]/[[NOW]], [[Kairos]] | `S4'.md` carrier table and S4'Cx projection; [[P3]], [[CT3]], [[L3]] / [[L2']] | direct World ontology |
| [[S4.4']] | [[Anima]] carrier; [[CFP]] inhabitation, [[Psyche]] state, team/dispatch grammar | `S4'.md` carrier table and S4'Cx projection; [[P4]], [[CT4a]], [[CT4b]], [[L4]] / [[L1']] | direct World ontology plus seed crystallisation |
| [[S4.5']] | [[Aletheia]] carrier; [[CS]] crystallisation, Gnosis/thought routing, return trigger | `S4'.md` carrier table and S4'Cx projection; [[P5]], [[CT5]], [[L5]] / [[L0']] | direct World ontology |

Six constitutional agents: [[Nous]] `(0000)`, [[Logos]] `(0/1)`, [[Eros]] `(0/1/2)`, [[Mythos]] `(0/1/2/3)`, [[Psyche]] `(4.5/0)`, [[Sophia]] `(5/0)`. [[Aletheia]] subagents: [[Anansi]], [[Moirai]], [[Janus]], [[Mercurius]], [[Agora]], [[Zeithoven]].

[[Pleroma]] placement note: [[S4.2']] [[Pleroma]] is the ta-onta carrier. `Body/S/S4/plugins/pleroma` is the packaged [[Capability Matrix]] / executable capability membrane for [[Anima]], not a second ontology and not a layer outside [[S4']].

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
| OracleFrame / reading-frame VAK envelope | mixed; protected when subject/deck/session refs are personal | evaluate -> bind DAY/NOW/Psyche/source handles -> M3 transcription -> M4 PatternPacket -> optional M5 review |
| capability-matrix entry | public-current/operator | declare -> test parity -> runtime gate -> audit |
| Psyche state | local operational/protected handles | read NOW/session -> update context -> handoff/deposit |
| Aletheia crystallisation envelope | mixed; review-gated | observe -> classify -> deposit to S5/Epii or S1 seed |

## Integration Seams

Calls in from S0 CLI/gateway, M5 Agentic Control Room, Epii review/autoresearch, Nara/Anima dialogue, Pleroma skill/plugin runtime, and agents. Calls out to S1/Hen for vault writes, S2/Pleroma for graph-population support, S3/Chronos for temporal context, S5/Epii for review meaning, and M' kernel-bridge for governed agentic surfaces. The seam invariant is: VAK before dispatch, capability before tool use, deposit before promotion.

## M' Shell Consumed Contract Closure - Cycle 2 T12.T1

M5-4 (the Agentic Control Room at [[Idea/Pratibimba/System/extensions/agentic-control-room]]) consumes S4' only through the single `KernelBridgeAPI.invokeCapability` channel; no private agent socket, no direct `Body/S/S4` import.

| Closed S4' surface | M5-4 consumer | Authority |
|---|---|---|
| Mediation route | `acr-runtime-service` dispatches `invokeCapability({method: 'invokeGatewayRpc', params: {gatewayMethod: "s4'.mediation.route", ...}})` | S4'.4 [[Anima]] VAK + capability evaluation per IOD-17 matrix |
| Mediation capability listing | `s4'.mediation.capabilities.list` (when gateway exposes; ACR falls back to static matrix-derived dispatch otherwise) | S4'.4 capability governance against `Body/S/S4/plugins/pleroma/capability-matrix.json` |
| Capability matrix tree | `@pratibimba/ide-shell-m0-m5::parseCapabilityMatrix` reads the matrix and projects dispatch-tools / skills into ACR actor + route selector | IOD-17: `Body/S/S4/plugins/pleroma/capability-matrix.json` is the single source of truth for the constitutional dispatch surface |
| Constitutional actor set | ACR run-model normalizes actor identity in `{anima, aletheia, pi, sophia, epii, human}`; no other registry agents reach the M5-4 selector | S4'.4 + S4'.5: Anima dispatch spine + Aletheia disclosure spine; Epii remains S5' return spine (distinct PI agent, not Anima subagent) |
| Human-required gate | `enforceHumanGate` blocks auto-resolution of `humanRequired` candidates at any non-human actor | S4'.capability_governance mirroring `Body/S/S5/epii-review-core/src/lib.rs::requires_human_resolution` |
| Evidence envelope | `buildEvidenceEnvelope` produces the envelope ACR submits via `s5'.review.submit` | S4 produces envelope shape; S5 owns receipt verification |

8/8 ACR contract tests pass (run-flow + evidence-envelope + human-gate); the agentic-mediation-e2e harness exercises capability-matrix parity from the live `Body/S/S4/plugins/pleroma/capability-matrix.json` file. Recorded out-of-scope substrate gap (2026-06-02): `extensions/test/agentic-mediation-e2e/harness.mjs` still references the S5 review baseline fixture at `docs/plans/...` while the seed-legacy migration moved the file to `Idea/Bimba/Seeds/M/Legacy/plans/.../plan.runs/`; e2e currently fails with ENOENT on that single path resolution. Path rebase belongs to a Pratibimba-side test-harness write scope, not to the S4 spec closure.

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
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md` | 2026-04-04 13:46:16 | PI agent formal spec |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-TA-ONTA-EXTENSION-SPEC.md` | 2026-03-10 13:14:55 | ta-onta extension source |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md` | 2026-04-04 13:36:17 | skills/plugin formal spec |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-ta-onta-full-implementation.md` | 2026-03-15 00:26:32 | historical ta-onta plan |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-03-pi-cmux-native-orchestration.md` | 2026-04-03 19:42:07 | orchestration source |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/09-agentic-mediation-and-operational-capacities.md` | 2026-06-02 00:16:51 | nominal mediation/capacity track |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` | 2026-06-02 00:14:24 | current open decision register |

## Substrate And Sibling Seeds

Body paths: `Body/S/S4/pi-agent`, `Body/S/S4/plugins/pleroma`, `Body/S/S4/ta-onta`, `Body/S/S0/epi-cli/src/agent`, `Body/S/S0/epi-cli/src/gate/anima.rs`.

Sibling seeds: `S4-SPEC.md`, `S4-0-SPEC.md` through `S4-5-SPEC.md`, `S4-0'-SPEC.md` through `S4-5'-SPEC.md`, `S4-4'-GOAL-PRELUDE-SPEC.md`, `S4-SHARD-INDEX.md`, `S4'-TRACEABILITY-INDEX.md`.

## World Ontology Inclusion - 2026-06-02

`Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md` mtime 2026-04-10 19:15:04 is now cited as load-bearing S4' ontology: ta-onta extension architecture, Khora/Hen/Pleroma/Chronos/Anima/Aletheia, and the S4'Cx vertical VAK projection. `Idea/Bimba/World/Types/Coordinates/S/S4/S4.md` mtime 2026-04-10 19:15:19 is the paired PI-agent runtime ground. `Idea/Bimba/World/CT0.md`..`CT5.md` supply the context-template law for VAK dispatch.
