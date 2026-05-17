---
coordinate: "S0/S0'"
c_4_artifact_role: "spec"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-25T00:00:00Z"
c_0_source_coordinates:
  - "[[PROTOCOL S COORDINATE MODULE SPEC BUILD]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
  - "[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
---

# S0/S0' Specification: CLI Ground and CLI Law

## Status

This is the consolidated S0-level master specification. It replaces the older scattered [[S0]], [[S0']], [[S0'Cx]], and S0-y/S0-y' files as the build reference for this level.

The old files remain useful for the sixfold coordinate intuition, but their S0' emphasis on a Pydantic-style [[QL]] type enforcement API is not current architectural truth. In the current system, S0' is the reflective CLI contract: `epi-cli`, [[Khora]] preferred-tool law, resolved tool surface, environment access, and terminal topology. Runtime coordinate/type enforcement is expressed through the shared [[TypeScript]] API, [[S1']] schema/frontmatter law, [[S4']] [[VAK]]/orchestration, and [[S5']] [[QL]] evaluation surfaces.

S0/S0' is both first and last. It is first because every higher layer must become executable here. It is last because every incomplete higher-layer system eventually returns to S0/S0' as command shape, runtime method, test harness, bootstrap surface, and audit trail. Current code gaps in [[S1]] through [[S5']] are therefore not all S0 failures; many are future returns that will solidify as those levels are specified.

After the full S0-S5 pass, S0's return task is clearer: it must make the whole [[S-SYSTEM-INDEX]] executable. The [[API]], [[Envelope]], [[TypeScript]] interfaces, `epi` command tree, gateway method manifest, and test harness should converge so every accepted S/S' capability has a coordinate-native method, typed request/response shape, envelope field home, local command mirror where appropriate, and real-functionality verification.

## VAK Gate

- CPF: `(4.0/1-4.4/5)` - full reflective lattice held as one dispatch field.
- CT: `CT1` - specification / form-giving law.
- CP: `4.1 Definition` moving toward `4.2 Operation`.
- CF: `(0/1)` primary Logos with Eros execution for verification.
- CFP: S-family, S0/S0' ground.
- CS: `CS0` full traverse, because S0 ground affects every higher layer.

Manual dispatch result: Logos owns the consolidated spec shape; Eros owns real implementation/test implications; Khora is the named S0' augmentation module; Anima remains the orchestrating frame.

## A. S0 - Base Technology

### What It Is

S0 is the objective terminal and CLI ground of the [[Epi-Logos]] stack. It is where higher-layer promises cash out as real commands, real processes, real streams, real files, real exit codes, and reproducible local execution.

Current canonical S0 base technology:

- `epi-cli/` Rust CLI binary.
- Shell substrate used by agents, hooks, scripts, and human operators.
- Process spawning, stdout/stderr capture, exit-code handling, cwd/env materialisation.
- Local filesystem and executable discovery.
- Build, install, bootstrap, and package-manager invocation surfaces.
- Ground primitive dependencies such as `vendor/blake3/`.

### Services, Binaries, Processes

| Component | Coordinate | Language | Runtime / Port | Role |
|---|---:|---|---|---|
| `epi-cli` | [[S0]] / [[S0']] | Rust | Local binary | Canonical command surface for [[Vault]], [[Graph]], [[Gateway]], [[PI Agent]], [[Vimarsa]], [[Gnosis]], [[Nara]], app, and bootstrap operations |
| Shell process substrate | [[S0.0]]-[[S0.4]] | Shell / OS | Local process table | Spawns commands, carries cwd/env, exposes streams and exit codes |
| `cmux` / `tmux` topology | [[S0.3]] / [[S0.4]] | CLI tools | Local terminal sessions | Terminal surface and pane layout for multi-agent/operator flows |
| Preferred tools | [[S0.0']] | CLI binaries | Local PATH | `bat`, `rg`, `eza`, `zoxide`, `jq`, `fzf`, `gh`, `just`, with declared fallbacks where honest |
| `epi up` | [[S0.5]] / [[S0.5']] | Rust | Local orchestration | Bootstrap return surface for the stack; roadmap includes two-window PI setup |

S0 itself does not own gateway semantics, vault semantics, graph semantics, or agent semantics. It owns the material command layer that makes those semantics runnable.

### Real `epi-cli` Command Topology

The live `epi` command tree mirrors the full [[S]]/[[S']] and [[M]]/[[M']] coordinate systems, but it does so as an operator surface, not as a perfectly flat ontology. A command's location in the CLI tree is its practical affordance; its coordinate home is where its authority belongs.

| Live command | Operator role | Coordinate home / ontology |
|---|---|---|
| `epi core` | Bare-metal coordinate kernel, pointer web, [[Quintessential View]], help/knowing overlays | [[S0']] touching [[C]], [[P]], [[L]], [[S]], [[T]], [[M]], [[CF]], [[VAK]], [[Bimba]] |
| `epi vault` | Obsidian/vault operations, frontmatter, templates, [[Day]], [[NOW]], [[PASU]], [[Kairos]] anchoring | [[S1]] / [[S1']] with temporal facts from [[S3']] / [[Chronos]] and identity ground from [[PASU]] |
| `epi graph` | Neo4j/Redis lifecycle, graph sync, retrieval, GraphRAG, semantic cache | [[S2]] / [[S2']] / [[Parashakti]] |
| `epi gate` | Gateway runtime, config, cron, sessions, channels, app/device/node RPC | [[S3]] / [[S3']] / [[Chronos]] |
| `epi gate temporal context` | Operator mirror of the S3' DAY/NOW/session context report, including [[Kairos]], protected [[M4.4.4.4]] Pratibimba refs, Redis temporal keys, SpaceTimeDB projection facts, history archive path, and Graphiti arc orientation | [[S3']] / [[Chronos]], consumed by [[S4]] / [[S5]] agents |
| `epi gate graphiti` | Current compatibility control for the temporary Graphiti HTTP wrapper | Transitional [[S3]] command for a runtime that should become an [[S3']] library component; [[S5]] / [[S5']] governs Graphiti invocation and usage |
| `epi agent` | Managed [[PI Agent]] runtime, default [[Epii]] entry, explicit [[Anima]] / [[Aletheia]] embodiments, role-scoped launch metadata, [[ta-onta]], [[VAK]], sessions, teams, subagents, hooks, skills, plugins | S0 command mirror over [[S4]] / [[S4']] / [[Anima]] and [[S5]] / [[S5']] / [[Epii]]; plugin bodies remain S4/S5 authority |
| `epi nara` | Personal dialogical and M-function commands: clock, identity, oracle, medicine, transform, lens, logos | [[M4]], [[M']], [[Nara]], [[S5.m]] |
| `epi portal` | Experiential TUI for the M' surface | [[M']] / [[Pratibimba]] / [[S5]] |
| `epi vimarsa` | BKMR/kbase bookmark and semantic search bridge | [[S5']] / [[Vimarsa]] / [[kbase]] / [[Context Economy]] |
| `epi book` | Bookokrat reader plus local gnosis ingestion/query for books | [[S5]] / [[S5']] / [[Gnosis]] / [[RAG-Anything]] |
| `epi notebook` | NotebookLM helper surface | [[S5']] / [[NotebookLM]] / [[Aletheia]] |
| `epi techne` | Research helpers, cmux/worktrunk, NotebookLM passthrough, Gnosis local storage | [[Pleroma]] / [[Techne]], spanning [[S0']], [[S3]], [[S5']] |
| `epi app` | EpiLogos app launch/dev/build surface | [[S3.5]] / app bridge / [[Pratibimba/System]] |
| `epi up` | Full-stack bootstrap return: session, vault check, graph, gateway, cmux, app | [[S0.5]] / [[S0.5']] returning through [[S1]], [[S2]], [[S3]], [[S4]], [[S5]] |
| `epi agent tmux` / `epi sesh` | Khora terminal-persistence envelope and legacy tmux session lifecycle | [[S0.3]] / [[S0.4]] terminal body; not the semantic gateway/Epii session authority |
| `epi code` | Claude Code provider-profile launcher | [[S0.5]] / [[S0']] tool bridge; not an S4 constitutional agent surface |
| `epi sync` | n8n/webhook placeholder | Intended integration bridge; current implementation is a stub |

Clarification: command nesting is allowed to reflect operator ergonomics. The spec must still name the deeper coordinate home, especially where a command controls a temporary wrapper or helper whose architecture belongs elsewhere.

Return clarification from [[S-SYSTEM-INDEX]]: the command tree should eventually expose a parity map rather than force all ontology into command nesting. For example, `epi gate graphiti` may remain a temporary operator affordance while [[Graphiti]] architecture belongs to [[S3']] and its invocation policy belongs to [[S5]] / [[S5']]. Likewise, `epi nara` remains the personal [[M4]] / [[M']] operator surface while typed `s5.m.*` methods make it accessible to [[Epii]].

Portal clarification: the `epi portal` TUI is now expected to consume a shared S0' surface registry, not a hand-maintained command menu. Its centre `/` panel must aggregate the stable [[S]]/[[S']] topology, gateway parity records, extension `tools.json` manifests, `.claude-plugin` package manifests, [[Epii]] PI-agent contract methods, [[Pleroma]] capability gates, and registered Ratatui/Hypertile plugin IDs. This keeps the TUI, future desktop portal, CLI, gateway, and PI-agent capability membrane aligned to the same command/config truth instead of creating a parallel settings model.

Temporal clarification: the live portal state must also consume one shared [[S3']] temporal projection. [[DAY]], [[NOW]], vault root, [[Kairos]], [[Redis]] temporal keys, [[SpaceTimeDB]] projection tables, and protected [[Pratibimba]] anchor are not clock-plugin-private facts. The structural clock side reads them as M0'-M3' timing/orientation; the [[Nara]] / [[Epii]] side reads the same projection as M4'/M5' personal, review, inbox, and invocation context. `epi portal` now has a `PortalRuntimeState` carrying this shared temporal projection alongside the existing shared clock state. It hydrates from configured [[SpaceTimeDB]] projection reads by polling the canonical `session_surface` and `kairos_surface` SQL projection by default, or by opening the native `v1.json.spacetimedb` WebSocket subscription loop when `EPI_SPACETIME_SUBSCRIPTION_MODE=native-websocket` is set. In both paths it falls back to the local gateway session-store context used by `s3'.temporal.context`, and only then falls back to clock/session state. The future desktop/Tauri mirror must feed this same shape rather than inventing desktop- or plugin-specific state models.

Gateway setup clarification: S0 now exposes the first schema-backed setup surface for external gateway channels and secret-provider posture. `epi gate config schema/apply`, `epi gate channels status`, and `epi gate wizard start` understand Telegram, WhatsApp, Slack, Discord, and Google Drive as configurable channel records, with secret references resolved through an explicit provider posture: `env`, `1password`, or `varlock`. This first setup surface is not completion by itself. The real implementation target is S3 channel adapters following the Hermes-inspired platform pattern: inbound normalization, outbound delivery, subject-coordinate continuity, account binding, secret requirements, and readiness diagnostics for each channel. S0 does not own the platform adapter law; [[S3]] / [[S3']] owns channel runtime, identity continuity, and session/event projection. S0's role is to make the setup state inspectable, patchable, and portal-visible without forcing operators to hand-edit hidden config files.

Secret-provider clarification: `1password` and `varlock` are not acceptable as symbolic config values only. They must resolve through real provider commands/protocols, report missing CLI/auth/profile state clearly, and redact resolved secrets everywhere. S0 may host the operator command mirror, but durable secret authority belongs to the provider layer used by [[S3]] channel adapters and other service clients.

Setup-wizard clarification: the current gateway wizard is no longer only a placeholder flow. It now has coordinate-owned setup steps for gateway basics, secrets, channels, graph service readiness, canonical Bimba import/seed readiness, and [[Nara]] identity initialization. The Nara step explicitly surfaces `c_0_birth_date`, `c_0_birth_location`, and `c_0_natal_chart_path` because the first personal setup must seed [[PASU]] / [[Kairos]] orientation before richer [[M4']] identity work can become reliable.

### API Methods Homed Here

#### `s0.exec`

Raw CLI execution. This is the base executable method for higher surfaces that require shell access. It must be gated by `s_4_permission_boundary`.

Request type: `S0ExecRequest`

```typescript
interface S0ExecRequest {
  command: string;
  args: string[];
  cwd?: string;
  timeout_ms?: number;
  env?: Record<string, string>;
}
```

Response type: `S0ExecResponse`

```typescript
interface S0ExecResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
}
```

Build implications:

- Command and args are structured, not string-concatenated.
- cwd and env are explicit inputs, not hidden ambient assumptions.
- stdout, stderr, and exit code are returned separately.
- Permission checks happen before process spawn.
- Timeouts must terminate child processes cleanly.

#### `s0.tool_surface`

Returns the resolved S0' tool contract as runtime data.

Request type: none.

Response type: `S0ToolSurfaceResponse = ToolSurface`

```typescript
interface ToolSurface {
  preferred_tools: Record<string, string>;
  resolved_paths: Record<string, string>;
  epi_binary: string;
}
```

Build implications:

- Reads Khora `preferred-tools.json`.
- Resolves each declared capability through `resolve.sh` or an equivalent faithful resolver.
- Returns actual executable paths or explicit unresolved status.
- Must not silently substitute semantically weaker tools where the contract declares no fallback.

#### `s0.env`

Reads explicitly requested environment values.

Request type: `S0EnvRequest`

```typescript
interface S0EnvRequest {
  keys: string[];
}
```

Response type: `S0EnvResponse`

```typescript
interface S0EnvResponse {
  values: Record<string, string | null>;
}
```

Build implications:

- Secrets protected by varlock return `null` unless the requester has authority.
- Non-secret config comes from environment and `~/.epi-logos/env/base.env`.
- This method populates environment facts, not task facts.

### Envelope Fields Populated

S0 contributes to Runtime Layer fields:

| Envelope field | Coordinate home | Producer | Notes |
|---|---:|---|---|
| `s_0_workspace_root` | [[S0.4]] | shell environment / zoxide-aware workspace resolution | cwd/workspace root for the current execution context |
| `s_0_tool_surface` | [[S0.0']] | Khora preferred-tools + resolver | `s0.tool_surface` response |
| `s_0_terminal_substrate` | [[S0.3]] | cmux/tmux topology | current terminal/session/pane surface |
| `s_0_env_config` | [[S0.4']] | environment + base env + varlock | non-secret env config, secret-aware reads |

Related runtime guard:

- `s_4_permission_boundary` is not populated by S0, but `s0.exec` must obey it before executing commands.

Historical/audit fields not in current v0.2 API scope:

- `s_0_session_exit_code`
- `s_0_tool_resolution_log`

These remain valid future audit-trail needs, but the API audit marks them low priority and not part of v0.2 coverage.

### CLI Commands

S0 is implemented as `epi` plus the local shell/process layer. Important command families exposed by `epi-cli` include:

| Command family | Primary coordinate home | S0 role |
|---|---:|---|
| `epi core` | cross-cutting / [[S0']] | Coordinate and knowing overlays surfaced through CLI |
| `epi vault` | [[S1]] / [[S1']] | Vault commands made executable through S0 |
| `epi graph` | [[S2]] / [[S2']] | Neo4j/graph commands made executable through S0 |
| `epi gate` | [[S3]] / [[S3']] | Gateway lifecycle and RPC command surface |
| `epi agent` | [[S4]] / [[S4']] | PI agent and ta-onta operator command surface |
| `epi sync` | [[S1.5]] / [[S2.0']] | Sync plumbing surfaced as CLI |
| `epi vimarsa` | [[S5']] | Live BKMR/kbase knowledge/bookmark retrieval surface |
| `epi notebook` / `epi book` | [[S5']] | [[NotebookLM]], source/book, and [[Gnosis]] helpers |
| `epi techne gnosis` | [[S5]] / [[S5']] | Live Gnosis/RAG bridge; canonical docs may later promote `epi gnostic` |
| `epi nara` | [[S5]] / [[M']] | M-function and [[Nara]] operations |
| `epi app` | [[S3.5]] | App bridge surface |
| `epi up` | [[S0.5]] / [[S3]] / [[S4]] | Local system bootstrap and orchestration |

CLI parity law: API methods are canonical; CLI commands are typed mirrors where local execution is appropriate.

Current-state warning: the live `epi-cli` command tree is ahead of the canonical coordinate-native API in some places and behind it in others. This is expected while [[S1]]/[[S1']] through [[S5]]/[[S5']] are still being specified. S0/S0' records the executable surface as it exists, but does not freeze incomplete gateway/API names as final ontology.

### API / Gateway Current-State Split

The canonical FLOW API is coordinate-native: methods such as `s0.exec`, `s1.read`, `s2.graph.query`, `s3.session.list`, `s4'.vak.evaluate`, `s5.gnostic.query`, `s5.m.oracle`, and `s5'.kbase.search` are the target contract.

The live gateway method manifest is currently product/runtime-native: `connect`, `chat.send`, `sessions.list`, `cron.add`, `node.invoke`, `exec.approval.request`, `models.list`, `skills.status`, `wizard.start`, and related app/device/voice/status methods. This does not invalidate the target API. It means [[S3]]/[[S3']] still needs a translation/solidification pass where product RPC, CLI parity, and coordinate-native API names are reconciled.

For S0/S0', record this as follows:

- `epi` is the local command substrate for both current and future surfaces.
- Gateway method names are not authoritative coordinate names until [[S3-SPEC]] resolves them.
- Missing coordinate-native methods are level-specific build work, not automatically S0 gaps.
- S0/S0' must preserve enough command structure and testability for those methods to emerge cleanly.
- [[S-SYSTEM-INDEX]] is the cross-level parity reference for deciding whether a gap belongs to API, envelope, TypeScript, CLI, gateway routing, or a deeper S-level implementation.

### Internal 0-5 Breakdown

| Coordinate | Current ownership |
|---|---|
| [[S0.0]] CLI primitive ground | Raw shell operations, process spawning, stdin/stdout/stderr, executable existence, filesystem addressability |
| [[S0.1]] CLI command form | Command grammar, argument parsing, Clap command tree, `epi` entrypoint shape |
| [[S0.2]] CLI execution operations | Structured subprocess invocation, pipes where needed, timeout handling, exit-code capture, stream separation |
| [[S0.3]] CLI scripting patterns | Small scripts, wrappers, reusable workflow patterns, `just`/mprocs-style compositions, cmux layout templates |
| [[S0.4]] CLI context state | cwd, workspace root, env vars, PATH, zoxide hints, session-local shell state |
| [[S0.5]] CLI integration surface | Cross-tool composition, package manager execution, GitHub host operations through `gh`, build/install/bootstrap return |

## B. S0' - QL Augmentation

### What It Is

S0' is Khora's reflective CLI law: the declared contract that tells agents and higher layers how to use the terminal ground without hardcoding local machine assumptions.

Current canonical S0':

- `epi` as the coordinate contract for infrastructure concerns.
- Khora `preferred-tools.json` as declarative tool preference law.
- Khora `resolve.sh` as the executable resolution boundary.
- `cli-primitives.md` as the human-readable primitive contract.
- cmux/tmux topology as reflective terminal surface.
- Environment and workspace surfacing as runtime envelope facts.

S0' is not a general ontology/type-validation API. It is the lawful reflective surface of S0.

### Ta-Onta Module

Module: [[Khora]]

Relevant files:

- `.pi/extensions/ta-onta/khora/S0/cli/preferred-tools.json`
- `.pi/extensions/ta-onta/khora/S0/cli/resolve.sh`
- `.pi/extensions/ta-onta/khora/S0'/cli-primitives.md`

Installed agent copies currently also exist under `.epi/agents/epii/...`, `.epi/agents/anima/...`, `.epi/agents/aletheia/...`, and compatibility `.epi/agents/main/...`; these are runtime materialisations of the same contract and must not become divergent sources of truth. The bare `epi agent` launch defaults to `epii`, while `epi agent anima`, `epi agent aletheia`, `epi agent epii`, and `epi agent spawn --agent ...` select explicit embodiments.

### API Methods Homed Here

#### `s0'.cmux.list`

Returns known cmux/tmux workspaces and panes.

Response type: `S0PrimeCmuxListResponse`

```typescript
interface S0PrimeCmuxListResponse {
  workspaces: CmuxWorkspace[];
}
```

```typescript
interface CmuxWorkspace {
  name: string;
  panes: CmuxPane[];
  layout: string;
}
```

```typescript
interface CmuxPane {
  id: string;
  name: string;
  command: string;
  active: boolean;
}
```

#### `s0'.cmux.surface`

Creates or destroys a named terminal surface.

Request type: `S0PrimeCmuxSurfaceRequest`

```typescript
interface S0PrimeCmuxSurfaceRequest {
  action: "create" | "destroy";
  name: string;
  layout?: string;
}
```

Response:

```typescript
{ ok: boolean }
```

#### `s0'.cmux.focus`

Focuses a terminal pane.

Request type: `S0PrimeCmuxFocusRequest`

```typescript
interface S0PrimeCmuxFocusRequest {
  pane: string;
}
```

Response:

```typescript
{ ok: boolean }
```

### Envelope Fields Populated

S0' directly populates or supplies:

| Envelope field | Coordinate home | Source |
|---|---:|---|
| `s_0_tool_surface` | [[S0.0']] | Khora tool contract and resolution |
| `s_0_env_config` | [[S0.4']] | environment config and varlock-aware access |

S0' also participates in:

| Envelope field | Coordinate home | Relationship |
|---|---:|---|
| `s_0_terminal_substrate` | [[S0.3]] | cmux/tmux topology is surfaced through S0' methods |
| `s_0_workspace_root` | [[S0.4]] | workspace root can be resolved through shell/zoxide facts |
| Coordinate layer | [[C']] / [[S0']] / [[S4']] | S0' supplies CLI coordinate law, but not the full VAK/QL evaluator |

### S0'Cx Projection

Current S0'Cx is the C-family projection of CLI law, not a Pydantic model tree:

| C position | S0' projection |
|---|---|
| C0 Bimba / ground | Primitive capability names: `read`, `search`, `listing`, `tree`, `navigation`, `json`, `select_interactive`, `git_host`, `task_runner` |
| C1 Form | Stable `epi` command grammar and argument contracts |
| C2 Entity | Structured request/response types for S0 API methods |
| C3 Process | `resolve.sh`, `s0.exec`, cmux lifecycle, bootstrap workflows |
| C4 Type | TypeScript interfaces and envelope field declarations |
| C5 Pratibimba | Runtime-resolved paths, pane surfaces, env snapshots, audit/return artifacts |

Correction to old mapping: older S0'Cx's Pydantic classes are historical reference. The live Cx projection is the typed CLI contract and runtime resolution law.

### Internal 0-5 Breakdown

| Coordinate | Current ownership |
|---|---|
| [[S0.0']] CLI contract ground | `preferred-tools.json`, `resolve.sh`, capability names, declared fallback law |
| [[S0.1']] CLI command law | Versioned `epi` command contracts, API/CLI parity, `just` recipe law where used |
| [[S0.2']] CLI execution contract | Permission boundary consumption, sandboxing intent, structured args, default preference for `rg` over `grep` and `bat` over `cat` when available |
| [[S0.3']] CLI pattern reflection | Canonical workflow templates, cmux topology patterns, repeatable bootstrap compositions |
| [[S0.4']] CLI context frame | Runtime env config, workspace root surfacing, QV/session context injection, interactive `fzf` only where human-in-the-loop |
| [[S0.5']] CLI reflective return | Tool resolution logs, session-end cleanup, hook output capture, bootstrap summary, future audit trail |

## C. Cross-References

### Depends On

S0 is the ground layer and has no upstream S-level dependency.

Practical dependencies:

- OS shell and process APIs.
- PATH and local executable discovery.
- Rust runtime/build toolchain for `epi-cli`.
- Optional external tools declared in Khora S0' law.

### Consumed By

All higher levels consume S0/S0':

| Consumer | Consumption |
|---|---|
| [[S1]] / [[S1']] | Vault reads/writes/search/templates execute through `epi vault` and shell/filesystem primitives |
| [[S2]] / [[S2']] | Neo4j/Redis/graph commands surface through `epi graph` and process orchestration |
| [[S3]] / [[S3']] | Gateway lifecycle, status, pairing, and runtime bootstrap surface through `epi gate` and `epi up` |
| [[S4]] / [[S4']] | PI agent runtime, VAK evaluation command, extensions, teams, hooks, and sessions surface through `epi agent` |
| [[S5]] / [[S5']] | Gnostic, Graphiti invocation/governance, kbase, NotebookLM, Nara/M' functions, and external integrations surface through `epi` command families |

### Envelope Layers Served

Primary:

- Layer 2 Runtime: `s_0_workspace_root`, `s_0_tool_surface`, `s_0_terminal_substrate`, `s_0_env_config`.

Secondary:

- Layer 4 Coordinate: S0' contributes command/coordinate law, but S4'/S5' own higher-level VAK/QL evaluation.
- Layer 8 Execution: S0 provides material command execution but does not own task semantics.
- Layer 10 Crystallisation and Layer 11 Improvement: S0.5'/return artifacts may later feed audit and improvement loops.

### Gaps

| Gap | Status | Build implication |
|---|---|---|
| Runtime `s0.exec` API dispatch | Designed; Next Moves calls shell execution a trivial wrapper, but gateway/API dispatch must still be confirmed end-to-end | Add real request/response tests that spawn harmless commands and assert stdout/stderr/exit code separation |
| Runtime `s0.tool_surface` API dispatch | Designed; preferred-tools contract exists | Implement or verify resolver-backed response including unresolved tools |
| Runtime `s0.env` API dispatch | Designed | Implement varlock-aware secret masking tests |
| `s0'.cmux.*` API dispatch | Designed | Wire to real cmux/tmux surface or explicitly declare local fallback behavior |
| Coordinate-native gateway manifest | Target API exists in FLOW docs; live gateway manifest is product/runtime-native | Resolve in [[S3-SPEC]]; S0 only records local command affordances |
| S0' portal surface registry/runtime state | Rust registry exists in `epi-cli/src/portal/surfaces.rs`; shared runtime projection exists in `epi-cli/src/portal/runtime_state.rs`; configured SpaceTimeDB projection hydration now reads `session_surface` / `kairos_surface` through the gateway registration client by HTTP SQL fallback or native WebSocket subscription; live readiness results distinguish raw services from agent access and expose the native SpaceTimeDB subscription plan; gateway secret/channel fields and graph/Nara setup wizard steps now surface through schema-backed config metadata | Continue broadening providers toward schema-backed S2/S4/S5 settings and desktop-app mirroring without forking CLI/gateway behavior |
| S/S' central parity artifact | Created as [[S-SYSTEM-INDEX]]; must stay synchronized with level specs, API, envelope, and TS definitions | Treat the index as the cross-level guard before sharding or implementing |
| API / Envelope / TS harmonisation | Level specs now include deltas beyond the original FLOW files, especially S5 review inbox fields/methods | Promote accepted deltas into [[FLOW 2026 04 24 PI AGENT API v0.1]], [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]], and [[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]] before implementation hardens |
| `epi kbase` command | `epi-cli/src/kbase/mod.rs` exists but is not wired in `lib.rs`/`main.rs`; live surface is `epi vimarsa` | Decide in [[S5-SPEC]] whether to expose `epi kbase` as alias/canonical command or retire docs toward [[Vimarsa]] |
| `epi gnostic` command | Canonical docs mention top-level command; live surface is `epi techne gnosis` plus `epi book` ingestion/query | Decide in [[S5-SPEC]] whether to promote top-level `epi gnostic` or document nested operational surface |
| `epi gate graphiti` coordinate placement | Current live control is under `gate`, but the sidecar shape is not target architecture | Retire wrapper framing: Graphiti architecture belongs to [[S3']] temporal episodic runtime; [[S5]]/[[S5']] owns invocation/usage |
| `epi agent` mixed strata | Contains S0 launch/tmux/session mechanics, true [[S4']] runtime surfaces, [[Pleroma]] maintenance, and [[S5']] Epii entry | Keep S0 as command envelope; S4/S5 specs own agent authority and plugin bodies |
| `epi vault` temporal commands | Vault writes [[Day]]/[[NOW]]/[[Kairos]] files, but temporal semantics belong to [[S3']] | Clarify ownership in [[S1-SPEC]] and [[S3-SPEC]] |
| CLI audit trail | Known gap; not v0.2 scope | Later S0.5' build should capture resolution logs, session exit code, hook output |
| `epi up` two-window PI setup | Roadmap item | Build after gateway two-agent connection path is ready |
| Tool contract drift across `.pi` and `.epi/agents/*` copies | Risk | Establish source-of-truth sync or generated materialisation check |
| Old S0' type-validation docs | Resolved ambiguity | Do not implement as S0'; re-home runtime type law to shared TS types/S1'/S4'/S5' |

## D. Key Architectural Decisions

1. `epi` is S0' in the operator sense: it is the coordinate contract through which infrastructure is addressed.

2. Gateway is the canonical host of the async API, but local CLI implementations are typed mirrors for S0/S1 local execution.

3. S0 methods do not create semantic authority. They expose executable substrate and runtime facts.

4. S0' can change preferred tools without forcing S4 agents to change, because agents invoke capability names and method contracts, not hardcoded binaries.

5. Khora owns bootstrap and the S0' tool surface, but `s_4_permission_boundary` remains S4.2' authority and must gate raw execution.

6. cmux/tmux belongs here as terminal substrate and pattern reflection; constitutional team composition belongs to S4'.

7. The old S0/S0' subcoordinate files are retained as archetypal support, but the current lattice scaffold from April 2026 is authoritative for S0.y/S0.y' naming.

8. Tests for this level must exercise real command execution and real resolver behavior. Mock-only tests are not acceptable for S0, because S0 is the executable truth layer.

9. Incomplete higher-layer systems must not be flattened into S0. For example, unfinished gateway coordinate methods are [[S3]]/[[S3']] work; unfinished Gnosis/kbase command shape is [[S5]]/[[S5']] work. S0/S0' records the current command substrate and the return path by which those higher-layer decisions become executable.

10. The [[S-SYSTEM-INDEX]] is the central harmonisation map for the consolidated level specs. Before implementation, each accepted method or field should be checked against the index, the FLOW API, the envelope schema, and the TypeScript definitions.

11. S0's next return work is a parity manifest: coordinate-native API method, TypeScript request/response type, envelope field effects, live `epi` command mirror, gateway routing status, and real test evidence.

12. The S0' portal surface registry is the operator-facing view of that parity manifest. Adding a command, gateway method, PI extension tool, plugin package, agent contract method, or capability gate should surface through provider-backed registry data rather than a bespoke TUI edit.

## Build-Test Requirements For S0/S0'

Minimum real-functionality tests:

- `s0.exec` runs a benign command with structured args and verifies stdout/stderr/exit code.
- `s0.exec` handles non-zero exit status without conflating process failure with transport failure.
- `s0.exec` enforces timeout and permission boundary behavior.
- `s0.tool_surface` reads the actual preferred-tools contract and resolves at least available fallback-capable tools.
- `s0.tool_surface` reports no-fallback missing tools honestly.
- `s0.env` masks protected variables and returns known non-secret variables.
- `s0'.cmux.list` either returns actual terminal topology or a clearly typed empty surface when cmux is unavailable.
- `epi` CLI parity tests verify command families remain addressable and documented method mappings do not silently disappear.
- S/S' parity manifest tests verify that accepted API methods have TypeScript types, envelope field mappings where they produce durable facts, and documented CLI/gateway status.
- Portal surface registry tests verify that topology entries, gateway parity methods, extension tools, package manifests, Epii agent contract methods, Pleroma capability gates, and registered TUI plugins become inspectable command/config surfaces.

## Sub-Level Shard Seeds

When sharding this consolidated spec into executable sub-level build docs, use this split:

| Shard | Build focus |
|---|---|
| `S0-0-SPEC.md` | executable discovery, stdin/stdout/stderr, filesystem/process ground |
| `S0-1-SPEC.md` | Clap command grammar and `epi` entrypoint contracts |
| `S0-2-SPEC.md` | structured subprocess execution, timeout, stream, exit-code semantics |
| `S0-3-SPEC.md` | workflow templates, wrappers, cmux/tmux layouts |
| `S0-4-SPEC.md` | cwd/workspace/env/session state and varlock-aware env surfacing |
| `S0-5-SPEC.md` | package/build/bootstrap integration, audit trail, `epi up` return |
| `S0-0'-SPEC.md` | Khora preferred-tools and resolver law |
| `S0-1'-SPEC.md` | CLI command law and API/CLI parity |
| `S0-2'-SPEC.md` | permission/sandbox execution contract |
| `S0-3'-SPEC.md` | reflected workflow and cmux pattern law |
| `S0-4'-SPEC.md` | CLI context frame and QV/session injection |
| `S0-5'-SPEC.md` | reflective return, cleanup, logs, bootstrap summary |

Cross-level shard guard: use [[S-SYSTEM-INDEX]] beside every shard so local S0 implementation work does not accidentally override ownership decisions made in [[S1-SPEC]], [[S2-SPEC]], [[S3-SPEC]], [[S4-SPEC]], or [[S5-SPEC]].
