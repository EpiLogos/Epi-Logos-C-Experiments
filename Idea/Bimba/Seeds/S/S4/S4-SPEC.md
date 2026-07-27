---
coordinate: "S4/S4'"
c_4_artifact_role: "spec"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-25T00:00:00Z"
c_3_updated_at: "2026-07-27T00:00:00Z"
c_0_source_coordinates:
  - "[[PROTOCOL S COORDINATE MODULE SPEC BUILD]]"
  - "[[S0-SPEC]]"
  - "[[S1-SPEC]]"
  - "[[S2-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[S4-TRACEABILITY-INDEX]]"
  - "[[S4'-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ta-onta-anima-superpowers-vak-integration-spec]]"
  - "[[VAK-SUPERPOWERS-INTEGRATION-SPEC]]"
  - "[[S4]]"
  - "[[S4']]"
  - "[[S4'Cx]]"
---

# S4/S4' Specification: Agent Runtime and Agentic Inhabitation Law

## Status

This is the consolidated S4-level master specification. It replaces the older scattered [[S4]], [[S4']], [[S4'Cx]], and S4-y/S4-y' files as the build reference for the agent-runtime layer.

Diagram consumption: this spec and its shards consume [[ARCHITECTURE-DIAGRAM-PACK#Ta-Onta Placement Invariant]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]]. Thin shard remediation follows [[S-SHARD-HARMONIZATION-PROTOCOL]].

[[S4]] is the agent execution package: the managed [[PI Agent]] / harness-agnostic agent runtime where the system lives, acts, spawns, validates skills, manages provider/model/auth profiles, runs constitutional subagents, and carries the active task-world.

[[S4']] is the [[ta-onta]] API surface itself: the coordinate-native agentic inhabitation layer through which the PI runtime becomes [[Epi-Logos]] operative grammar. [[Anima]] is the sovereign dispatch function within this layer, but S4' must not be reduced to the Anima extension alone. S4' includes the full ta-onta internal sequence: [[Khora]] through [[Aletheia]], mapped as S4.0' through S4.5'.

The [[ta-onta]] package is the agent's operational body and the base implementation surface for S4'. Its six modules are not loose cross-level references. They are the internal S4' articulation of the whole S-family inside the agent.

Important correction from the Hermes parity pass: the six ta-onta carriers are not the six VAK dimensions. The C-family/VAK sequence (`CPF`, `CT`, `CP`, `CF`, `CFP`, `CS`) is the vertical dispatch grammar evaluated by [[Anima]] through [[Pleroma]] skills. The ta-onta modules are the horizontal S4' carriers that provide the runtime surface on which that grammar acts. A module may condition a VAK field, but it does not equal that field.

| Internal coordinate | Ta-onta module | S-fold carrier | Responsibility |
|---|---|---|---|
| [[S4.0']] | [[Khora]] | S0 inside the agent | Session ground, write authority, visibility, lifecycle hooks |
| [[S4.1']] | [[Hen]] | S1 inside the agent | Agent artifact form, templates, prompt/content schema, CT context |
| [[S4.2']] | [[Pleroma]] | S2 inside the agent | Skills, bounded primitives, capability/tool surfaces, Techne mechanics |
| [[S4.3']] | [[Chronos]] | S3 inside the agent | Day/NOW/Kairos timing as agent runtime condition |
| [[S4.4']] | [[Anima]] | S4 inside the agent | VAK evaluation, CF routing, team composition, Psyche state |
| [[S4.5']] | [[Aletheia]] | S5 inside the agent | Thought route, crystallisation trigger, Sophia disclosure, Epii handoff |

Each module may correspond analogically to an S-fold, but its implementation residency in ta-onta is S4'. S0-S5 remain the wider system homes; S4' internalizes them so the agent can inhabit and dispatch them.

Within this S4' body, [[Pleroma]] must be treated as [[Anima]]'s executive capability membrane. It is not merely a bag of copied skills. It apportions which ground-level extension primitives, execution-level skills, constitutional agent definitions, hooks, and bounded toolsets are available to the dispatch agent. This is where the OMX fork, VAK workflow semantics, and PI plugin/skill packaging have to be reconciled.

[[Anima]] and [[Epii]] should therefore be implemented as distinct spine-bearing PI agents. [[Anima]] is the dispatch spine: it evaluates VAK, selects agents/skills, invokes bounded S-layer tools, and hands reviewable outputs to [[Epii]]. [[Epii]] is not a subagent of Anima; it is the S5' return spine. Anima may request Epii review or deposit inbox items, but it must not resolve Epii review/improvement decisions itself.

## M' Consumer Surfaces

S4/S4' is consumed most directly by [[M5'-SPEC]] and the cross-cutting agent membrane in [[M'-SYSTEM-SPEC]]. The operative anchors for that surface are [[Body/S/S4/plugins/registry.jsonl]] and [[Body/S/S4/plugins/pleroma/capability-matrix.json]].

### M' Shell Consumed Contract Closure - DR-M5-1 Rerun

This closure narrows the M' surface to **only what the active [[OmniPanel]], executable dispatch roster, and integrated review surfaces consume** from S4/S4'. It is not a re-statement of the full S4 ta-onta API; it pins the consumed boundary so M' work stays subordinate to substrate already landed in `Body/S/S4`.

**Consumption pattern.** M5-4 consumption flows through the same gateway bridge as every other M' surface; [[OmniPanel]] does **not** open private agent sockets. The IOD-17 capability matrix at `Body/S/S4/plugins/pleroma/capability-matrix.json` is the S4 source of truth, and `Body/M/pratibimba-app/src/panes/omni/omnipanelCapabilities.ts` projects its gateway-mediated capability view and executable roster. No M' consumer imports raw S4 plugin internals.

**Closed S4/S4' surfaces.**

| Surface | M5-4 consumer | S4/S4' authority | Verification |
|---|---|---|---|
| Capability matrix tree | [[OmniPanel]] consumes the gateway-derived mediation snapshot and projects capabilities into dispatch/tool-stream folds | `Body/S/S4/plugins/pleroma/capability-matrix.json` (IOD-17 authority; owner `anima`; deprecated empty `constitutional_agents`) | `test_capability_matrix.py` plus `omnipanelCapabilities.test.ts` |
| Mediation routing | [[OmniPanel]] dispatches through `s4'.mediation.route`; never a direct S4 import or private socket | S4' gateway route backed by the [[Pleroma]] matrix and [[Anima]] VAK evaluation | gateway, gateway-contract, and live-wire class-W gates |
| Mediation capability listing | [[OmniPanel]] strictly parses `s4'.mediation.capabilities.list` | S4' lists capabilities authorised by `s_4_permission_boundary` | `omnipanelCapabilities.test.ts` and its live gateway test |
| Executable actor set | `ANIMA_DISPATCH_TARGETS` exposes Pi, Anima, and six Aletheia guardian targets; guardian identity is `actor: 'aletheia'` plus `techneClass` | [[Anima]] is the dispatcher; [[Aletheia]] supplies six subagent techne-guardian classes; [[Techne]] is [[Pleroma]]'s atomic-skills substrate, never an actor | `omnipanelCapabilities.test.ts` asserts all eight targets and excludes Psyche aspect registers |
| Human-required gate | `enforceHumanGate` prevents recursive agent review from resolving human-required decisions | S4 capability governance plus [[S5]] review governance | `m5ReviewGate.test.ts` |
| Evidence envelope to S5 review | M5 review submits through `s5'.review.submit` | S5 review owns receipt verification; S4 supplies dispatch identity | class-W gateway/live-wire gate |

**Constitutional surface boundary.** [[Anima]] and [[Epii]] are distinct spine-bearing PI agents, not Anima-and-subagent. The M5 run-flow never resolves Epii review decisions through `s4'.mediation.route`; review/improvement decisions cross to [[S5]] through `s5'.review.submit`. [[Nous]], [[Logos]], [[Eros]], [[Mythos]], [[Psyche]], and [[Sophia]] remain authorial/Psyche aspect registers composed by Anima, not peer dispatch targets. No Techne profile or seventh Aletheia member lands.

**Verification evidence (2026-07-16).** The matrix contract, active [[OmniPanel]] projection, live mediation snapshot, M5 review gate, and class-W gateway/live-wire suites are the closure evidence. Frozen [[Theia]] ACR tests are historical reference only and are not a verification target.

## VAK Gate

- CPF: `(4.0/1-4.4/5)` - autonomous spec/build pass across the full reflective lattice.
- CT: `CT1` - specification / form-giving law.
- CP: `4.4` - agentic context inhabitation.
- CF: `(4.0/1-4.4/5)` primary [[Anima]], with [[Psyche]] as session subject and [[Logos]] as specification form.
- CFP: S-family, S4/S4' agent runtime and inhabitation layer.
- CS: `CS3` full forward pass, receiving S0-S3 and preparing S5.

Manual dispatch result: [[Anima]] owns the dispatch grammar; [[Psyche]] owns lived context and turn-by-turn state; [[Logos]] owns the consolidated spec shape; [[Eros]] owns implementation/test consequences.

## Preflight. Derivation Notes

### Old S-file carry-forward

The older [[S4]] files correctly identify this level as the home of agentic context: hooks, agent identity, skill/tool operations, thread patterns, runtime context, and subagent orchestration. The older [[S4'Cx]] files also correctly preserve the C-family projection of context-frame machinery.

The old base sequence remains structurally useful:

| Old base coordinate | Carry-forward intuition |
|---|---|
| [[S4.0]] Event Ground | Agent bootstrap, hooks, session start/end, runtime visibility |
| [[S4.1]] Agent Identity | Managed agent definitions, provider/model/auth profiles, constitutional agent identity |
| [[S4.2]] Skill/Tool Operations | Skills, commands, tools, permission boundary, Pleroma-Techne atomic skills repository |
| [[S4.3]] Thread Patterns | Base/P/C/F/L/B/Z execution shapes and team/chain/subagent primitives |
| [[S4.4]] Runtime Context | [[Psyche]], [[NOW]] inhabitation, active task, subtasks, artifacts, continuity |
| [[S4.5]] Subagent Orchestration | Multi-agent coordination, synthesis, durable team records, agent lineage |

The old prime sequence survives as an API pressure:

| Old prime coordinate | Current expression |
|---|---|
| [[S4.0']] Hook System API | Bootstrap and observability law; session visibility and hook seams |
| [[S4.1']] Agent Definition API | Agent identity, roster, provider/model/auth form law |
| [[S4.2']] Skill/Tool API | Skill operation law, tool permissions, write surface |
| [[S4.3']] Thread Pattern API | [[CFP]] thread algebra and execution method selection |
| [[S4.4']] Runtime Context API | [[VAK]], [[CF]] routing, [[Psyche]] state, goal/scope/gates |
| [[S4.5']] Subagent Orchestration API | [[CS]] state, team composition, thought routing, crystallisation trigger |

### Corrections / re-homing

The older files over-bind S4 to a particular harness: first [[Claude Code]], then [[Moltbot]]. Current architecture corrects that:

- [[S4]] is harness-agnostic agent runtime. Current implementation uses managed PI plus a local [[Codex]]/OMX lane; the coordinate is not reducible to any one vendor CLI.
- [[S4']] is not a generic plugin host. It is the agentic inhabitation law that makes the runtime coordinate-aware.
- [[S3]] / [[S3']] owns gateway transport, sessions, temporal context, [[SpacetimeDB]], Redis live-context law, and [[Graphiti]] temporal episodic architecture.
- [[S4]] consumes S3/S3' session and temporal state but does not own gateway persistence or Graphiti architecture.
- [[S5]] / [[S5']] owns [[Gnosis]], [[RAG-Anything]], [[NotebookLM]], [[Vimarsa]], [[Epii]], improvement loops, and Graphiti invocation/usage governance.
- [[Aletheia]] tooling appears inside the ta-onta operational package, but deep world-return knowledge governance is specified at S5/S5'. S4' may trigger crystallisation; S5' performs the heavy improvement/world-return work.
- [[S4']] may read the [[S3']] DAY/NOW/Kairos temporal context and protected [[M4.4.4.4]] Pratibimba references for orientation, but it must not mutate identity, journal-derived aspects, or PersonalNexus graph state. Identity-affecting changes route to [[Epii]] / [[S5']] as review, validation, or user-consent deposits.

### Current code reality

The live S4 implementation is broad and uneven:

- `epi-cli/src/agent/` implements managed agent install/doctor/spawn/attach/run/chat/verify-runtime, extension sync, agent registry, model registry, auth profiles, plugin/skill/subagent validation, hooks, team dispatch, chain runs, session lifecycle, [[Codex]] runtime install/doctor, and deterministic `epi agent vak evaluate`.
- `.pi/extensions/ta-onta/composite-entry.ts` registers all six spine contributions and loads [[Khora]], [[Hen]], [[Pleroma]], [[Chronos]], [[Anima]], and [[Aletheia]] extension tools into PI.
- `.pi/extensions/ta-onta/anima/extension.ts` registers `vak_evaluate`, `anima_orchestrate`, `nous_disclose`, parallel/fusion dispatch tools, and injects the VAK skill stack at `before_agent_start`.
- `.pi/extensions/ta-onta/anima/S4/` contains `agent-team.ts`, `agent-chain.ts`, `subagent-widget.ts`, and related execution primitives.
- `.pi/extensions/ta-onta/anima/S4'/agents/` contains constitutional agent prompts for [[Anima]], [[Nous]], [[Logos]], [[Eros]], [[Mythos]], [[Psyche]], [[Sophia]] (the 6 constitutional CT roles: Nous=CT0, Logos=CT1, Eros=CT2, Mythos=CT3, Psyche=CT4a+CT4b, Sophia=CT5; Anima governs dispatch across all). [[Techne]] is NOT a constitutional agent — it is Pleroma's second face (atomic-skills substrate), invoked through the 6 CF-coded Aletheia techne-guardians (Anansi=CF0, Moirai=CF2, Janus=CF1, Mercurius=CF3, Agora=CF4, Zeithoven=CF5) at constitutional team-composition gates.
- The Rust VAK evaluator is explicitly heuristic. Canonical VAK evaluation is the LLM/skill-mediated path in `anima/S4'/skills/vak-evaluate/`.
- `Body/S/S4/plugins/registry.jsonl` is the canonical source package registry for S4 plugins. `plugins/registry.jsonl` may be read only as a compatibility registry while older root paths are retired.
- `Body/S/S4/plugins/pleroma` is Anima's executable capability membrane package. It carries constitutional ANIMA definitions, critical VAK skills, hooks, settings, and a tested capability matrix. It is distinct from the ta-onta `S4-2p-pleroma` module, which is the internal S4' extension/module expression of Pleroma law.
- `epi agent` source-to-runtime projection distinguishes source package, managed runtime sync target, and installed state: source lives under `Body/S/S4/...`; managed PI runtime lives under `.epi/agents/<id>/agent`; Codex/OMX projection lives under `.codex/` / `.omx/`.

Current implementation state and gaps:

- The first coordinate-native S4/S4' gateway surfaces are now live: `s4.agent.query`, `s4.agent.notify`, `s4.agent.status`, `s4'.vak.evaluate`, `s4'.orchestrate`, `s4'.psyche.state`, `s4'.psyche.update`, `s4'.permission.get`, `s4'.context.assemble` (51.T51.1), and `s4'.orchestration.score` (50.T50.10). They are tested by `gate_s4_coordinate_surfaces.rs`, `gate_anima_pleroma_access.rs`, `gate_s4_context_assemble.rs`, and `gate_s4_orchestration_score.rs`.
- Remaining coordinate-native API gaps include `s4'.team.*`, `s4'.cs.*`, `s4'.thought.*`, `s4'.crystallise`, `s4'.notify_user`, and richer `s4'.goal.*` semantics. (`s4'.context.assemble` landed in 51.T51.1 and is no longer a gap.)
- [[Psyche]] now has first persisted gateway state for operative notebook, current task, subtasks, artifacts, visibility stance, and run-local continuity. The next Psyche gap is richer goal-state, context-pack assembly, and integration with team/VAK state.
- `s_4_permission_boundary` now has first explicit API exposure through `s4'.permission.get`; the next gap is making every S0 exec, Pleroma primitive, file write, subagent spawn, and external API call enforce the same boundary rather than merely report it.
- `s4'.vak.evaluate` must expand beyond the live heuristic response to return primary family, primary coordinate, CPF, prime targets, intent class, and agent sequence position.
- `nous_disclose` currently writes context through a Gnosis notebook path and direct temporary files; target `s4'.context.assemble` must assemble context through explicit S1/S2/S3/S5 contracts without smuggling ontology through a helper workflow.
- Sophia post-execution review is currently an extension hook with guard logic, not yet a proven coordinate-native crystallisation lifecycle.
- [[Pleroma]] package capability apportionment has an executable matrix at `Body/S/S4/plugins/pleroma/capability-matrix.json`: real ANIMA definitions, critical VAK skill files, hooks, Anima authority, Epii review-boundary handoffs, constitutional `agent_capability_gates`, and the Anima-scoped `tilldone` execution backbone are now tested. Runtime plugin discovery and launch planning read this package from the Body-native S4 registry. Gateway `s4'.vak.evaluate` and `s4'.orchestrate` prove first callable access through that capability membrane. The Disler `pi-vs-claude-code` teams/chains/subagent/TillDone lineage is now explicitly checked: TillDone remains a fidelity port, while teams/chains/subagents are VAK-adapted ports that spawn bounded child PI sessions with propagated extensions/skills and per-agent tool lists. Remaining work is provider-backed PI extension-level execution.
- The reciprocal [[Anima]] -> [[Epii]] request/deposit path is specified at S5' but not yet proven as a PI-agent invocation path.

### Planning consequence

The S4 shard/build pass must distinguish four surfaces:

- [[S4]] runtime mechanics: agent layouts, runtime launch plans, managed sessions, skill/subagent validation, provider/auth/model registries, and real process execution.
- [[S4']] inhabitation law: VAK, CF routing, CPF gate, CFP thread algebra, CS state, team composition, orchestration, and thought/crystallisation triggers.
- [[Psyche]] lived-environs API: turn-by-turn operative notebook, task/subtask/artifact set, visibility, trace stream, and continuity.
- Cross-layer calls: context retrieval strategies come from [[S5']] and sources from [[S1]]/[[S2]]/[[S3']], while S4' assembles and inhabits the result.

It must also distinguish capability strata:

- Extensions expose ground-level runtime affordances and safe tool primitives.
- Skills expose execution-level workflows with VAK state and handoff contracts.
- Agents bind bounded skills/tools for focus and security.
- Hooks enforce lifecycle, verification, permission, and crystallisation guardrails.

For [[Anima]], [[Pleroma]] is the package that ties those strata together. The live ta-onta TypeScript modules are necessary, but the executable agent body is incomplete until the Pleroma plugin's skills, ANIMA definitions, and hooks match the S4' VAK grammar.

## A. S4 - Agent Runtime Base Technology

### What It Is

S4 is the objective runtime technology where the PI agent and its constitutional subagents execute.

Current canonical S4 base technology:

- Managed PI agent directories under `.epi/agents/<id>/agent`.
- `epi agent` Rust CLI command family.
- Runtime launch planning and environment propagation.
- Extension sync from repo `.pi/extensions/` into managed agent directories.
- Body-native plugin package discovery from `Body/S/S4/plugins/registry.jsonl`, with root `plugins/registry.jsonl` retained only for compatibility.
- Provider/model/auth registries.
- Skill, plugin, hook, and subagent validation.
- Durable team records and subagent sessions coordinated through the gateway state root.
- PI-native extension package `.pi/extensions/ta-onta/`.
- Local [[Codex]] / OMX runtime lane as a harness alternative.
- Code-mode tool scripting (`Body/S/S4/pi-agent/lib/code-mode.ts`): one generated TypeScript program per multi-tool task, in place of one model round-trip per tool call.

### Tool Composition: JSON Tool-Mode and Code-Mode

Agents naturally run tools in JSON tool-mode: one call per model round-trip, where every hop
re-sends the whole prior history inline (`Body/S/S3/gateway-contract/src/harness.rs`
`ToolCallObserved` re-inlines the full `arguments` + `result` per step). That shape is the
**staircase**. The canonical composition shape is now a single generated TypeScript program
executed once. JSON tool-mode remains the substrate and the fallback; scripting is the default
*usage* for any task touching two or more tools.

Two tiers, one mechanism:

- **Base tier — any pi agent.** A multi-tool task collapses into ONE program. The program's
  function calls resolve to the agent's entitled tool set through a single choke point
  (`resolveToolFunction`), which applies the unchanged security boundary in a fixed order: the
  spawn-time `--tools` allow-list first, then `isEntitled()` — so a tool switched off at spawn
  is refused `code-mode/not-active` without consulting the entitlement layers at all. There is
  **no new VM**: the program is ordinary TypeScript run by a real `node` child process over
  pi's own execution substrate, holding exactly the OS authority the agent already held. What
  is gated is the *named tool surface*, not the process, and this spec does not claim otherwise.
- **VAK tier — [[Anima]].** The same mechanism composed across the full six reflective C'
  coordinates (section B), with [[CP]] as the nesting operator, spawning child pi's for teams
  and chains. This is the tier that makes an orchestration a coordinate-addressed object rather
  than a convenient script.

Measured, not asserted. Over identical recorded work the program costs 657 tokens where the
equivalent JSON staircase costs 2199 — delta 1542, ratio 0.299, estimator `chars/4`. The
estimator is crude by design and is named so no reader mistakes it for a tokenizer; the SHAPE
of the comparison is the result, not the absolute count. Both sides are computed from the SAME
recorded trace, so this measures two protocols over one body of work rather than guessing what
an agent might have done.

Build implications:

- The gate governs the tool surface. Do not describe code-mode as a sandbox.
- A second route from a program to a tool implementation is a defect: `resolveToolFunction` is
  the only one, and the ordering of its two checks is part of the contract.
- One entitlement configuration governs both protocols — an agent denied `write` cannot write
  in either mode.

*(absorbed from `Seeds/M/Legacy/plans/2026-07-03-m-prime-cycle-3-full-rerun/50-code-mode-orchestration.md`, 2026-07-27; end-to-end proof `Body/S/S4/ta-onta/S4-4p-anima/tests/acceptance-live.mjs`, 52/52 green against a spawned gateway, 50.T50.15)*

### Services, Binaries, Processes

| Component | Coordinate | Language | Runtime / Port | Role |
|---|---:|---|---|---|
| `epi agent` | [[S4]] via [[S0]] | Rust | Local CLI | Managed agent lifecycle, validation, runtime launch, team/subagent operations |
| Managed PI runtime | [[S4.0]] / [[S4.1]] | PI agent | Local process | Primary harness for agent sessions |
| `.pi/extensions/ta-onta/` | [[S4]] / [[S4']] | TypeScript + Markdown | PI extension package | Agent operational body: six extension classes, skills, agents, hooks |
| `Body/S/S4/plugins/pleroma` | [[S4.2]] / [[S4.2']] | Markdown + JSON | PI/Codex plugin package | Anima capability membrane: constitutional ANIMA definitions, VAK skills, hooks, capability matrix |
| Agent layout | [[S4.0]] | Filesystem | `.epi/agents/<id>/agent` | Managed agent directory, prompts, plugin runtime, skill roots |
| Team/subagent runtime | [[S4.3]] / [[S4.5]] | Rust + PI process | Gateway state root | Durable teams, worker sessions, lineage, transcripts, cmux coordinates |
| Provider/model/auth registry | [[S4.1]] | Rust + JSON | Managed agent dir | Model/provider identity and credential profile state |
| VAK CLI baseline | [[S4.4']] | Rust | `epi agent vak evaluate` | Deterministic fallback evaluator; not canonical semantic evaluation |
| Codex/OMX lane | [[S4]] | Node/Rust/CLI | `.codex/`, `.omx/` | Alternative local runtime surface managed by `epi agent codex` |

S4 itself does not own the vault, graph, gateway, temporal runtime, or world-return knowledge systems. It owns the agent's execution body and the interfaces by which those systems are inhabited.

### API Methods Homed Here

#### `s4.agent.query`

Async inter-agent query.

Request type: `S4AgentQueryRequest`

```typescript
interface S4AgentQueryRequest {
  target_agent: AgentId;
  method: string;
  params: Record<string, unknown>;
  coordinate_context?: CoordinateContext;
}
```

Response: `AsyncAck`, with result on `agent.result.{ack_id}`.

Build implications:

- Used for [[Anima]] querying [[Epii]] or another agent without direct domain coupling.
- Must route through [[S3]] / [[S3']] event/session authority.
- Must carry enough [[CoordinateContext]] for the receiving agent to interpret the request.

#### `s4.agent.notify`

Fire-and-forget agent notification.

Request type: `S4AgentNotifyRequest`

```typescript
interface S4AgentNotifyRequest {
  target_agent: AgentId;
  event: string;
  payload: Record<string, unknown>;
}
```

Build implications:

- Used for session boundary signals, [[Sophia]] improvement-vector notifications, and crystallisation triggers.
- Delivery semantics belong to S3; interpretation belongs to the target agent's coordinate law.

#### `s4.agent.status`

Agent runtime status.

Request type: `S4AgentStatusRequest`

```typescript
interface S4AgentStatusRequest {
  agent_id?: AgentId;
}
```

Response type: `S4AgentStatusResponse`

```typescript
interface S4AgentStatusResponse {
  agent_id: AgentId;
  state: "active" | "idle" | "improvement" | "crystallising";
  session_key: string;
  day_id: string;
  team_composition: AgentTeam | null;
  cs_position: CSPosition;
  cf_frame: ContextFrameVariant;
  uptime_ms: number;
}
```

Build implications:

- Must draw runtime/session facts from [[S3]] state, not invent parallel session identity.
- Must expose [[CS]] and [[CF]] as first-class runtime facts.

### Envelope Fields Populated

S4 contributes primarily to Lived-Environs and Execution fields:

| Envelope field | Coordinate home | Producer | Notes |
|---|---:|---|---|
| `s_4_active_context_pack` | [[S4.4]] | [[Anima]] / [[Psyche]] | Result of `s4'.context.assemble`; inhabited by Psyche |
| `s_4_operative_notebook` | [[S4.4]] | [[Psyche]] | Current working object in [[NOW]] |
| `s_4_current_task` | [[S4.4]] | [[Psyche]] | Primary task orientation |
| `s_4_current_subtasks` | [[S4.4]] | [[Psyche]] | Updated per turn |
| `s_4_active_artifact_set` | [[S4.4]] | [[Psyche]] | Open files/artifacts under active work |
| `s_4_team_composition` | [[S4.4']] / [[S4.5]] | [[Anima]] | Active constitutional team/subagent composition |
| `s_4_visibility_stance` | [[S4.0]] | [[Khora]] / runtime | Observable vs headless |
| `s_4_run_local_continuity` | [[S4.4]] | [[Psyche]] | Warm continuity across turns |
| `t_1_live_trace_stream` | [[S4.4]] / [[T]] | [[Psyche]] | Live trace, not post-hoc summary |
| `p_3_agent_sequence_position` | [[S4.4]] | [[Anima]] arc | Nous -> Logos -> Eros -> Mythos -> Psyche -> Sophia |
| `s_4_pleroma_techne_classes` | [[S4.2]] | [[Pleroma]] / Techne atomic-skills repository | Techne classes stewarded by Aletheia subagent guardians (e.g. Darshana / Anansi-class coordinate-mapping techne) |

Fields enforced by S4 but specified elsewhere:

- `s_3_session_key`, `s_3_agent_id`, `s_3_day_id`, `s_3_now_path`: S3/S3' session and temporal identity consumed by S4.
- `s_4_permission_boundary`: currently missing a proper S4' API; S0 `exec` and S4 tool use must obey it.
- `t_3_episode_id`, `t_3_arc_id`, `s_3_graphiti_node_ids`: S3'/Graphiti episodic runtime facts, populated through S5 usage/invocation paths.

### CLI Commands

S4 is surfaced through `epi agent`:

| Command | Coordinate home | Current role |
|---|---:|---|
| `epi agent install` | [[S4.0]] | Prepare managed PI agent directory layout |
| `epi agent doctor` | [[S4.0]] | Inspect repo-native PI foundation state |
| `epi agent extensions sync/status/list` | [[S4.0]] / [[S4']] | Copy and inspect repo `.pi` assets in managed agent dir |
| `epi agent agents init/add/list/inspect` | [[S4.1]] | Manage local agent registry |
| `epi agent models init/add-provider/set-default/status` | [[S4.1]] | Provider/model registry |
| `epi agent auth set/status` | [[S4.1]] | Credential profile state |
| `epi agent plugin/plugins/skill/subagent/hooks` | [[S4.2]] | Validate plugin, skill, subagent, and hook contracts |
| `epi agent spawn/attach/run/chat/verify-runtime` | [[S4.0]] / [[S4.3]] | Launch managed PI sessions and real verification runs |
| `epi agent team create/dispatch/list/resolve/stop` | [[S4.3]] / [[S4.5]] | Durable team records and worker dispatch |
| `epi agent chain run` | [[S4.3]] | Ordered agent-chain execution |
| `epi agent subagent run/continue/list/stop` | [[S4.5]] | Managed subagent sessions with lineage |
| `epi agent vak evaluate` | [[S4.4']] | Deterministic VAK baseline |
| `epi agent codex install/doctor` | [[S4]] | Repo-local [[Codex]] runtime lane |
| `epi agent pipi` | [[S4.5]] | Pi-Pi meta-agent launch mode |

CLI parity law: `epi agent` commands are real execution evidence, but the canonical target is the coordinate-native `s4.*` / `s4'.*` API surface.

### Current Implementation State

Implementation files:

- `epi-cli/src/agent/mod.rs` - command topology.
- `epi-cli/src/agent/runtime.rs` - PI launch plans, layout prep, plugin runtime prep, skill roots.
- `epi-cli/src/agent/launch.rs` - process environment propagation and PI launch.
- `epi-cli/src/agent/agents.rs`, `models.rs`, `auth.rs` - identity/provider/auth registries.
- `epi-cli/src/agent/plugins.rs`, `plugin_manifest.rs`, `skills.rs`, `subagents.rs`, `hooks.rs` - validation and runtime contracts.
- `epi-cli/src/agent/team.rs`, `chain.rs`, `subagents.rs` - team/chain/subagent execution.
- `epi-cli/src/agent/vak.rs` - deterministic VAK baseline and CF-to-agent mapping.
- `.pi/extensions/ta-onta/composite-entry.ts` - ta-onta spine and extension loader.
- `.pi/extensions/ta-onta/anima/extension.ts` - Anima tools and VAK skill injection.

The implementation is production-oriented in several places: runtime verification launches a real isolated PI process, source-to-runtime sync is tested, plugin runtime indexing discovers Body-native S4 plugins, agent-scoped plugin loading keeps Anima/Pleroma and Epii/epi-logos surfaces separate, direct `epi agent anima` / `epi agent aletheia` launches make the S4 embodiments testable, subagent execution appends real transcripts, gateway agent RPC is exercised through the server, and team dispatch creates durable records. The main gap is not "fake code"; it is API unification, PI extension-level VAK/orchestration invocation proof, and Psyche-state residency.

### Internal 0-5 Breakdown

| Coordinate | Name | Responsibility |
|---|---|---|
| [[S4.0]] | Agent Bootstrap Ground | Managed runtime layout, install/doctor, extension sync, launch env, hook visibility |
| [[S4.1]] | Agent Identity | Agent registry, constitutional identities, provider/model/auth profiles |
| [[S4.2]] | Skill/Tool Operations | Skill/plugin/subagent/hook validation, permission boundary, tool availability, helper roles |
| [[S4.3]] | Thread Patterns | CFP execution methods: base, parallel, chain, fusion, background, nested |
| [[S4.4]] | Runtime Context / Psyche | NOW inhabitation, active context pack, current task, subtasks, artifacts, trace, continuity |
| [[S4.5]] | Subagent Orchestration | Durable teams, subagent lineage, synthesis, Pi-Pi/meta-agent, return to S5 |

## B. S4' - QL Augmentation

### What It Is

S4' is [[Anima]] as agentic inhabitation law. It gives the runtime its constitutional grammar:

- [[CPF]] polarity gate: dialogical `(00/00)` vs autonomous `(4.0/1-4.4/5)` vs synthesis `(5/0)`.
- [[CT]] semantic phase type.
- [[CP]] incubation coordinate.
- [[CF]] archetypal operator / constitutional agent route.
- [[CFP]] thread/nesting algebra.
- [[CS]] path operator and Day/Night' phase.
- [[Psyche]] as the session subject that inhabits the task-world.
- [[Sophia]] as return/review force.
- [[Nous]], [[Logos]], [[Eros]], [[Mythos]] as differentiated functions of the one operational language.

These six are not only the grammar that *labels* a dispatch. They are the typed vocabulary an
[[Anima]] orchestration is **written against** (`S4-4p-anima/lib/vak-orchestration-surface.ts`),
which is what DR-VAK-3 means by VAK being the operational language rather than metadata over
labels. Each coordinate is a composable AXIS of the program: [[CPF]] plans the run and sets
review polarity, [[CT]] declares the [[Hen]] artifact templates it produces or consumes, [[CP]]
places the step *and* opens nested frames, [[CF]] binds the agent, [[CFP]] shapes the execution
flow, [[CS]] sequences it Day before Night'. Two consequences are load-bearing:

- `emit()` is the ONLY emission constructor, and a partial or non-canonical address is refused
  by name rather than coerced into something plausible — guessing which `CP4.x` a bare `CP4`
  meant would fabricate a coordinate.
- Composing *across* the six is a measurable property, not a claim. A run that varies only
  [[CF]] is one axis with five decorations; `composedCoordinates()` reports the axes on which
  steps genuinely differ, and that is the number an acceptance may quote.

[[CP]] is the composability engine: a position inside a context frame is EITHER a terminal
dispatch or it expands into a whole nested context frame — the `.`-nesting operator surfaced
through CP, as plain recursion. A child of the `(4.0/1-4.4/5)` parent carries the CP of the slot
it occupies, so CP genuinely *places* the step. Frames contribute structure and never dispatch;
only leaves do.

*(absorbed from `Seeds/M/Legacy/plans/2026-07-03-m-prime-cycle-3-full-rerun/50-code-mode-orchestration.md`, 2026-07-27; 50.T50.03 / 50.T50.04)*

### Ta-Onta Module

The named augmentation package for S4' is [[ta-onta]]. Within it, [[Anima]] is the sovereign dispatch module and the place where the other carriers become one operational language.

Within the full [[ta-onta]] body, the six classes are internal S4' carriers. They carry S-family analogies, but their API/base residency is S4':

| Internal coordinate | Extension | S-family analogy | S4' responsibility |
|---|---:|---|
| [[S4.0']] | [[Khora]] | [[S0]] / [[S0']] | Bootstrap, session identity, write authority, visibility |
| [[S4.1']] | [[Hen]] | [[S1]] / [[S1']] | Templates and content form for agent artifacts |
| [[S4.2']] | [[Pleroma]] | [[S2]] / [[S2']] | Bounded primitives, tool seams, Techne atomic-skills repository (Pleroma's second face — 6 CF-coded Aletheia techne-guardians invoked through CF1-CF5 gates) |
| [[S4.3']] | [[Chronos]] | [[S3]] / [[S3']] | Day/NOW lifecycle, temporal events consumed by agent |
| [[S4.4']] | [[Anima]] | [[S4]] / [[S4']] | VAK, CF routing, team composition, Psyche/constitutional dispatch |
| [[S4.5']] | [[Aletheia]] | [[S5]] / [[S5']] | Crystallisation mode and world-return handoff |

### API Methods Homed Here

#### `s4'.vak.evaluate`

Canonical coordinate evaluation for a task.

Request type: `S4PrimeVakEvaluateRequest`

```typescript
interface S4PrimeVakEvaluateRequest {
  context: {
    user_input: string;
    session_state: SessionState;
    coordinate_context?: CoordinateContext;
  };
}
```

Response type: `S4PrimeVakEvaluateResponse`

```typescript
interface S4PrimeVakEvaluateResponse {
  cf_frame: ContextFrameVariant;
  agent_route: ConstitutionalAgent;
  ct_type: CTLevel;
  cp_position: CPPosition;
  mef_lens: MEFLens;
  rationale: string;
  primary_family: CoordinateFamily;
  primary_coordinate: CoordinateString;
  cpf: ContextFrameVariant;
  prime_targets: CoordinateString[];
  intent_class: string;
  agent_sequence_position: number;
}
```

Build implications:

- The live Rust `epi agent vak evaluate` is only a deterministic fallback.
- Canonical evaluation must be skill/LLM mediated, inspect the active [[Envelope]], and return all hot coordinate fields.
- `(00/00)` is a hard dialogical gate: it returns [[Nous]] clearing and requires user-facing brainstorming before autonomous dispatch.

#### `s4'.team.compose` / `s4'.team.status`

Team construction and current composition.

Build implications:

- Must map [[CFP]] and [[CF]] into concrete agent assignments.
- Must integrate with durable `epi agent team` records and S3 session lineage.
- Must not let [[Pleroma]] spawn agents independently; Anima is the dispatch function.

#### `s4'.cs.state` / `s4'.cs.transition`

Context-sequence state machine.

Build implications:

- Day and Night' are [[CS]] runtime phases, not separate agent identities.
- [[Moirai]] Klotho/Lachesis/Atropos are S5' operational modes invoked by Anima during Night', not three S4 agents.

#### `s4'.orchestrate`

Dispatch work through sequential, parallel, or fusion mode.

Build implications:

- Must use `s4'.vak.evaluate` output, not ad hoc route strings.
- Must produce an async ack and observable result channel through S3.
- Must include [[Sophia]] review when the configured evaluation gate requires it.

#### `s4'.orchestration.score`

Serve a persisted orchestration SCORE and the runs recorded against it (50.T50.10).

Track 50 makes a generated TypeScript program the way [[Anima]] composes tool calls. One
execution of such a program is a bounded song; a repeatable one is persisted as a **score**
and runs accumulate against it. This method is how that becomes observable: with a
`scoreId` it returns the score document (`schema`, `id`, `title`, `provenance`, `program`,
`hash`) and its append-only run history; without one it lists the ids in the store.

Build implications:

- **Reader, never runner.** Pi->subagent is the only agentic path, so a gateway that
  executed orchestrations would be a second one. Run state belongs to the parent [[Anima]]
  session that holds it (`S4-4p-anima/lib/orchestration-run.ts`), not to a stateless RPC.
  The [[S0]] adapter serves what the S4' authority produced — the same reader discipline as
  `s4'.context.assemble`.
- Persistence authority is [[Hen]] (`S4-1p-hen/modules/score-store.ts`); the adapter's path
  resolution is a twin of its `scoresDir()`, not an independent layout.
- Must fail closed on a score carrying no `hash`: a caller reading a program without the
  hash it was scored under cannot tell whether it is the program that ran.
- A score id is never a path segment.

#### `s4'.context.assemble`

Assemble the context pack Psyche inhabits.

Build implications:

- [[Anima]] assembles; [[Nous]] prepares dis-closure; [[Psyche]] inhabits.
- Retrieval strategy comes from [[S5']] where needed; sources come through [[S1]], [[S2]], [[S3']], and [[S5]] APIs.
- [[Graphiti]] contributes as S3' temporal episodic architecture; Graphiti invocation/search governance is S5/S5'.
- Must return `write_surface` so execution knows where mutation is allowed.

#### `s4'.psyche.state` / `s4'.psyche.update`

Turn-by-turn lived-environs surface.

Response type: `PsycheState`

```typescript
interface PsycheState {
  operative_notebook: string | null;
  current_task: string | null;
  current_subtasks: string[];
  active_artifact_set: string[];
  visibility_stance: "observable" | "headless";
  run_local_continuity: Record<string, unknown>;
}
```

Build implications:

- This is the largest missing S4/S4' surface.
- It must update per turn, not only at session end.
- It is the place where [[NOW]] becomes a real inhabited environment rather than a path.

#### `s4'.goal.set` / `s4'.goal.get`

Operative goal declaration.

Build implications:

- Populates `s_4_operative_goal`.
- Must be visible to VAK evaluation, team composition, and permission/scope gates.

#### `s4'.permission.get`

Permission boundary.

Build implications:

- Populates `s_4_permission_boundary`.
- Must govern S0 exec, Pleroma primitive use, tool invocations, file writes, subagent spawning, and external API use.

#### `s4'.thought.route` / `s4'.thought.list`

Routes thoughts into T-lanes.

Build implications:

- S4' owns the route trigger and UI membrane.
- S5'/Aletheia owns deeper crystallisation governance and improvement loops.

#### `s4'.crystallise`

Crystallisation trigger.

Build implications:

- Anima triggers; [[Sophia]] reviews; [[Aletheia]]/[[Epii]] performs heavy world-return work when delegated.
- Must not collapse S5' improvement methods into S4.

#### `s4'.notify_user`

User-facing notification.

Build implications:

- S4' decides what needs user awareness.
- S3 chooses channel delivery; S5' may produce crystallisation content.

### Envelope Fields Populated

S4' publishes coordinate, execution, and QL-process fields:

| Envelope field | Coordinate home | Producer | Notes |
|---|---:|---|---|
| `c_4_primary_family` | [[S4.4']] | `s4'.vak.evaluate` | Hot field missing from older response |
| `c_4_primary_coordinate` | [[S4.4']] | `s4'.vak.evaluate` | Hot field missing from older response |
| `c_3_cpf` | [[S4.4']] | `s4'.vak.evaluate` | Polarity gate |
| `c_1_ct` | [[S4.1']] | `s4'.vak.evaluate` | Semantic phase type |
| `c_4_cp` | [[S4.2']] | `s4'.vak.evaluate` | Incubation coordinate |
| `c_4_cf` | [[S4.3']] | `s4'.vak.evaluate` | Agent route / archetypal operator |
| `c_5_prime_targets` | [[S4.5']] | `s4'.vak.evaluate` | Prime targets for augmentation |
| `p_2_intent_class` | [[S4']] / [[P]] | `s4'.vak.evaluate` | Execution intent |
| `c_3_execution_mode` | [[S4.4']] | [[Anima]] | CPF-derived execution mode |
| `c_2_vak_frame` | [[S4.4']] / [[C']] | [[Anima]] applies, C' validates | Operative VAK frame |
| `s_4_operative_goal` | [[S4.4']] | `s4'.goal.set` | Session goal |
| `s_4_write_surface` | [[S4.2']] | `s4'.context.assemble` / permission law | Mutation boundaries |
| `s_4_evaluation_gates` | [[S4.4']] | [[Anima]] | Cold evaluation gates |
| `s_4_bounded_scope` | [[S4.4']] | [[Anima]] | Explicit in/out scope |
| `c_3_ql_modal` | [[S4.4']] / [[C']] | [[Anima]] declares, C' validates | QL mode |
| `c_4_ctx_frame_variant` | [[S4.4']] | [[Anima]] | CF frame variant |
| `c_5_inversion_state` | [[S4']] / [[C']] | [[Anima]] | Normal/inverted state |
| `c_4_topological_mode` | [[S4.4']] / [[C']] | [[Anima]] + C' law | 0-sphere / torus / lemniscate / Klein bottle |
| `c_3_ql_cycle_position` | [[S4.4']] | [[Anima]] | QL arc position |
| `c_5_pratibimba_mirror` | [[S4']] | [[Anima]] | Active [[Pratibimba]] reflection |

### S4'Cx Projection

The [[S4'Cx]] projection maps [[C]] categories to executable VAK/context-frame law:

| S4' coordinate | C-level | VAK term | Function |
|---|---:|---|---|
| [[S4.0']] | [[C0]] / [[Bimba]] | [[CPF]] | Polarity gate and context-packing foundation |
| [[S4.1']] | [[C1]] / Form | [[CT]] | Semantic phase-type / context template |
| [[S4.2']] | [[C2]] / Entity | [[CP]] | Incubation coordinate / parameter binding |
| [[S4.3']] | [[C3]] / Process | [[CF]] | Archetypal operator / context fill / agent route |
| [[S4.4']] | [[C4]] / Type | [[CFP]] | Thread pattern and nesting algebra |
| [[S4.5']] | [[C5]] / [[Pratibimba]] | [[CS]] | Context state/path operator and return |

This projection should be treated as real coordinate law, not decorative prompt language. It determines how commands, skills, agents, context packs, and traces are interpreted.

### Current Implementation State

Live:

- `vak_evaluate` and `anima_orchestrate` tools in `.pi/extensions/ta-onta/anima/extension.ts`.
- VAK skill injection at `before_agent_start`.
- Constitutional agents in `.pi/extensions/ta-onta/anima/S4'/agents/`.
- VAK/orchestration skills in `.pi/extensions/ta-onta/anima/S4'/skills/`.
- Body-native Pleroma plugin package with critical VAK skills: `vak-evaluate`, `anima-orchestration`, `vak-coordinate-frame`, and `day-night-pass`.
- Agent-scoped PI runtime loading: `anima`, `aletheia`, and `main` receive ta-onta/Pleroma skill and subagent roots by default; `epii` receives its S5 epi-logos plugin body instead. This proves the shared PI substrate can host peer embodiments without ambient capability bleed. Role-scoped launches such as `epi agent anima --role logos` and `epi agent aletheia --role anansi` export `EPI_AGENT_ROLE` / `EPI_AGENT_SCOPED_SURFACE` for direct testing without turning constitutional roles into separate top-level PI embodiments.
- Team, chain, subagent runtime via `epi agent team`, `epi agent chain`, `epi agent subagent`.
- Rust deterministic VAK baseline in `epi-cli/src/agent/vak.rs`.

Partial / missing:

- Unified coordinate-native API/gateway bridge for all S4' methods.
- Proper `s4'.psyche.state/update`.
- Proper `s4'.permission.get`.
- Expanded `s4'.vak.evaluate` response.
- Reliable lifecycle proof that [[Sophia]] review, thought routing, Night' pass, and S5'/Epii delegation occur end-to-end.
- Tests for true VAK/Anima behavior across the PI extension and Rust CLI together, not just isolated parsers.

### Internal 0-5 Breakdown

| Coordinate | Name | Responsibility |
|---|---|---|
| [[S4.0']] | CPF / Bootstrap Law | Polarity gate, bootstrap law, session visibility, hook seams |
| [[S4.1']] | CT / Agent Form Law | Constitutional roster, agent definitions, templates, semantic phase-type |
| [[S4.2']] | CP / Skill Operation Law | Skill/tool permissions, write surface, bounded primitives |
| [[S4.3']] | CF / Dispatch Law | CF-to-agent routing, archetypal operator, dispatch decision |
| [[S4.4']] | CFP / Inhabitation Law | Psyche state, context frame pattern, team composition, goal/scope/evaluation gates |
| [[S4.5']] | CS / Return Law | Context sequence, Day/Night', thought routing, crystallisation trigger, synthesis handoff |

## C. Cross-References

### Depends On

| Dependency | Why |
|---|---|
| [[S0]] / [[S0']] | CLI/process execution, preferred tools, env, command surface |
| [[S1]] / [[S1']] | Vault artifacts, templates, NOW files, thoughts, frontmatter law |
| [[S2]] / [[S2']] | Graph/context retrieval, coordinate resolution, disclosure pool material |
| [[S3]] / [[S3']] | Gateway routing, sessions, temporal state, Redis live context, Graphiti episodic architecture |
| [[C']] | VAK/QL validation and coordinate grammar |
| [[P]] | Intent and execution-position law |
| [[T]] | Trace and episodic reporting lanes |

### Consumed By

| Consumer | What it consumes |
|---|---|
| [[S5]] / [[S5']] | Session traces, thought routes, crystallisation triggers, improvement vectors |
| [[Epii]] | Cross-agent queries and delegated improvement work |
| [[Aletheia]] | Sophia review output, thoughts, Night' triggers |
| [[Nara]] / [[M4]] | Dialogical context and personal runtime inhabitation |
| [[OmniPanel]] / app bridge | Agent status, team state, notifications, live trace surfaces |

### Envelope Layers Served

S4/S4' serves:

- Layer 2 Runtime: permission boundary, tool/skill/runtime status.
- Layer 4 Coordinate: VAK coordinate assignment.
- Layer 6 Context-Economy: context pack assembly.
- Layer 7 Lived-Environs: Psyche state.
- Layer 8 Execution: goal, execution mode, write surface, agent sequence.
- Layer 9 Episodic Reporting: live trace stream and interim summaries.
- Layer 12 QL Process Extension: operative QL modal, topological mode, cycle position.

### Gaps

| Gap | Coordinate | Consequence |
|---|---:|---|
| No unified S4/S4' API bridge | [[S4]] / [[S4']] | Live CLI/tools exist, but API parity is incomplete |
| Psyche API missing | [[S4.4]] / [[S4.4']] | Lived-environs hot fields are uncovered |
| Permission API missing | [[S4.2']] | Tool/file/exec/subagent authority is implicit |
| VAK response too thin in current CLI | [[S4.4']] | Hot coordinate fields not reliably populated |
| Sophia/Night' lifecycle not proven end-to-end | [[S4.5']] / [[S5']] | Crystallisation remains partly hook/tool mediated |
| Context assembly overuses helper workflows | [[S4.4']] | Need explicit S1/S2/S3/S5 source contracts |
| Aletheia boundary can blur | [[S4.5']] / [[S5']] | S4 triggers must not swallow S5 governance |

## D. Key Architectural Decisions

1. [[S4]] is harness-agnostic. [[PI Agent]] is the current primary runtime, while [[Codex]]/OMX is a runtime lane, not a coordinate replacement.

2. [[S4']] is the [[ta-onta]] API/base surface, not merely a plugin host and not only the Anima extension. Plugin mechanics are S4 base technology; VAK/CF/CPF/CFP/CS law is S4'.

3. [[Psyche]] is the session subject and custodian of lived-environs. The next build pass must make Psyche state explicit and turn-by-turn.

4. [[Anima]] is the dispatch function. No other ta-onta extension should directly own agent spawning or constitutional routing.

5. [[Nous]] clears and discloses context; it does not route tasks. [[Sophia]] reviews and opens the return; it does not hoard closure.

6. [[Aletheia]] is a mode/function cluster invoked through S4, but its world-return/improvement governance belongs to [[S5']] / [[Epii]].

7. [[Graphiti]] remains architecturally S3/S3' as temporal episodic memory. S4/Psyche can produce live trace material for episodes, and S5/S5' governs Graphiti invocation/usage/search. S4 does not re-home Graphiti.

8. The old Context Frame material survives, but its names must align with the current VAK stack: [[CPF]], [[CT]], [[CP]], [[CF]], [[CFP]], and [[CS]].

9. Current `epi agent` commands are evidence of real runtime capability. They are not sufficient by themselves; the shard pass must close API parity, envelope population, and test coverage.

10. S4 is the inversion partner of [[S1]]. S1 gives content material addressability; S4 gives agentic inhabitation of that material through Psyche and Anima.

## Canonical Source Lock - 2026-06-02

S4 owns managed PI runtime and S4' owns ta-onta/API inhabitation law. VAK is the vertical dispatch grammar; ta-onta carriers are the horizontal S-folds. They are coupled but not interchangeable.

| Required coverage | Canonical citations |
|---|---|
| World ontology | `Idea/Bimba/World/Types/Coordinates/S/S4/S4.md` mtime 2026-04-10 19:15:19; `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md` mtime 2026-04-10 19:15:04; CT files `CT0.md`..`CT5.md` mtime 2026-03-10..2026-03-15 for VAK phase law |
| docs/specs | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/S/S4-S4i-PI-AGENT.md` mtime 2026-04-04 13:46:16; `Idea/Bimba/Seeds/S/Legacy/specs/S/S-STACK-INTEGRATION.md` mtime 2026-03-07 01:51:35 |
| docs/plans | `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/09-agentic-mediation-and-operational-capacities.md` mtime 2026-06-02 00:16:51; `10-cross-cutting-integration-and-milestones.md` mtime 2026-06-02 00:17:57; `11-open-architectural-decisions.md` mtime 2026-06-02 00:14:24 |
| Body substrate | `Body/S/S4/pi-agent/**`, `Body/S/S4/plugins/pleroma/**`, `Body/S/S4/ta-onta/**`, `Body/S/S0/epi-cli/src/agent/**`, `Body/S/S0/epi-cli/src/gate/anima.rs` |
| sibling seeds | `S4-0-SPEC.md`..`S4-5-SPEC.md`, `S4'/S4'-SPEC.md`, `S4'/S4-0'-SPEC.md`..`S4'/S4-5'-SPEC.md`, `S4'/S4-4'-GOAL-PRELUDE-SPEC.md`, `S4-SHARD-INDEX.md`, `S4-TRACEABILITY-INDEX.md`, `S4'/S4'-TRACEABILITY-INDEX.md` |
| nominal tracks | Track 09 owns mediation/governance; Track 10 carries cross-cutting gates |
| open decisions | thin VAK response, incomplete S4/S4' API bridge, Sophia/Night' crystallisation, Epii reciprocal invocation, capability-matrix route authority |

Supersession rule: any fragment that treats Anima, ta-onta, and constitutional agents as separate systems is historical. Current canon is one PI runtime with S4' carrier law and VAK dispatch grammar.
