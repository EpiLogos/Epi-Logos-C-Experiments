# M-Dev Context Pack - 10.T0

Generated: 2026-05-31T21:40:58.194Z

## Task

- **ID:** 10.T0
- **Title:** Integration Decision Gate And Local Harness Topology
- **Track:** 10-cross-cutting-integration-and-milestones.md
- **Computed status:** ready
- **Write scopes:** .omx/**, docs/plans/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-t0-validate.mjs`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`
- `docs/specs/S/S0-S0i-CLI-CORE.md`
- `docs/specs/S/S2-S2i-GRAPH.md`
- `docs/specs/S/S3-S3i-GATEWAY.md`
- `docs/specs/S/S5-S5i-SYNC.md`

## Dependency Context

- None

## Track Source Specs

- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, sections 1.2, 3, 4, 5, 8, and 9. This is the authority for M5-2 as the S-stack, M5-3 as the single Tauri app with `/body` plus `/pratibimba/system`, and M5-4 as operational-capacity and agentic mediation across the full coordinate system.
- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, sections 4, 8, 10, 11, and 12. This is the inherited pre-implementation plan whose Theia tranches are folded into Tracks 05-08.
- [[alpha_quaternionic_integration_across_M_stack]] - `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`, section 11, especially 11.7. This establishes the S3'/SpaceTimeDB native-WebSocket shared-gateway milestone as the first integration proof.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "Required Shared MathemeHarmonicProfile", "Neo4j / Graphiti Boundary", and "Minimum Live Loop". This is the authority for shared profile, shell/subsystem separation, graph/memory boundaries, and minimum end-to-end loop.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "Port Architecture", "Harmonic Profile Architecture Amendment", "Graphiti And S2 Graph Boundary", and "Testing Contract". This is the authority for typed Tauri clients, readiness states, and mock-free desktop testing.
- [[S0-S0i-CLI-CORE]] - `docs/specs/S/S0-S0i-CLI-CORE.md`, [[S2-S2i-GRAPH]] - `docs/specs/S/S2-S2i-GRAPH.md`, [[S3-S3i-GATEWAY]] - `docs/specs/S/S3-S3i-GATEWAY.md`, and [[S5-S5i-SYNC]] - `docs/specs/S/S5-S5i-SYNC.md`. These are the implementation-spec anchors for the S' substrate lanes.
- [[01-kernel-bridge-and-s0-foundation]], [[02-s2-bimba-map-population]], [[03-s3-gateway-and-spacetimedb]], [[04-s5-autoresearch-and-review-extension]], [[05-tauri-ide-shell-and-pratibimba-system]], [[06-zero-one-surface-evolution]], [[07-m-extension-individual-tracks]], [[08-integrated-plugin-tracks]], [[09-agentic-mediation-and-operational-capacities]], and [[11-open-architectural-decisions]] in this folder.

## Task Body

1. **T0 - Integration Decision Gate And Local Harness Topology.**

   Deliverables:

   - Create the cross-track ADR bundle for the decisions that block implementation: Theia runtime mode, single vs multi-webview, bridge host boundary, gateway/SpaceTimeDB multiplexing, SpaceTimeDB auth/RLS, profile schema versioning, S2 root mapping, and S5 persisted-state shape.
   - Define the local service topology used by all later milestones: Tauri app, Theia runtime, gateway, SpaceTimeDB, Neo4j/Redis if required, S5 persisted stores, vault fixture area, and test data reset policy.
   - Define the shared identifiers every milestone must carry: profile generation, selected coordinate, session key, DAY/NOW, privacy class, S2 anchor, S3 deposition handle, S5 review/evidence id, and bridge readiness.
   - Publish a milestone checklist template so each track reports readiness, blockers, test commands, and source-spec anchors consistently.

   Verification:

   - ADRs identify owner track, blocked tracks, prototype command, pass/fail criterion, and fallback policy for each open decision.
   - A fresh checkout can start or intentionally skip each local service with explicit readiness output; silent "service absent but UI still green" is a failure.
   - Track 05 T0/T2, Track 03 T1/T3, Track 01 T5/T6, Track 02 T0/T3, and Track 04 T0/T2 all consume the same harness topology.

   T0 artifacts:

   - [[10-t0-integration-decision-gate-adr-bundle]] records the blocking ADR gate with owner tracks, blocked tracks, prototype commands, pass/fail criteria, and fallback policy.
   - [[10-t0-local-harness-topology]] and `10-t0-local-harness-topology.json` define service readiness, explicit skip policy, reset policy, shared identifiers, and the existing repo commands to use before adding wrappers.
   - [[10-t0-milestone-checklist-template]] is the readiness template for every Track 10 milestone and cross-track tranche.
   - `10-t0-validate.mjs` validates the artifacts and emits machine-readable local readiness with `node docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-t0-validate.mjs --readiness`.

## Track Open Decisions

- This track does not resolve architectural questions by itself. It gates dependent milestones on [[11-open-architectural-decisions]] and records the consequences of deferring them.
- Decisions that block early work are Theia runtime mode, single vs multi-webview, bridge host boundary, gateway/SpaceTimeDB multiplexing, SpaceTimeDB auth/RLS, profile schema versioning, S2 `#` root mapping, S5 persisted-state shape, review metadata model, and M4 privacy/open-handle policy.
- Decisions that can be deferred behind readiness blockers are exact GDS overlay UX, n10s production packaging, visual style of 4/5/0 graph/city backdrop, integrated plugin workspace-vs-command default, and high-frequency visual interpolation cadence.

## Decision Register Excerpt

| ID | Decision | Category | Primary affected tracks |
| --- | --- | --- | --- |
| UFV-01 | Privacy and consent copy | User-final validation | 04, 05, 06, 07, 08 |
| UFV-02 | User-final validation threshold for recursive or corpus-affecting changes | User-final validation | 04, 05, 07, 08 |
| UFV-03 | Menubar/background lifecycle semantics | User-final validation | 05, 06, 08 |
| UFV-04 | Daily-flow review interruption and default lightweight agent | User-final validation | 04, 06, 07, 08 |
| PRD-01 | Theia browser-mode in Tauri versus local-server/Electron fallback | Prototype-resolved | 01, 05, 06, 07, 08 |
| PRD-02 | Single-webview navigation versus multi-webview persistence | Prototype-resolved | 05, 06, 08 |
| PRD-03 | Kernel-bridge host boundary | Prototype-resolved | 01, 03, 05, 06, 07, 08 |
| PRD-04 | Theia extension API, version, package manager, and build composition | Prototype-resolved | 05, 07, 08 |
| IOD-01 | S3 single WebSocket surface: physical multiplexing versus app-level manager | Implementation-owner | 01, 03, 05, 06, 07, 08 |
| IOD-02 | SpaceTimeDB auth/RLS and privacy discipline | Implementation-owner | 03, 04, 05, 06, 08 |
| IOD-03 | `world_clock` source of truth and cadence | Implementation-owner | 01, 03, 05, 06, 08 |
| IOD-04 | Profile versioning and `binary`/`mahamaya` compatibility | Implementation-owner | 01, 05, 06, 07, 08 |
| IOD-05 | S2 canonical `#` root mapping | Implementation-owner | 02, 05, 06, 07, 08 |
| IOD-06 | Anuttara field naming and provenance contract | Implementation-owner | 02, 04, 05, 07, 08 |
| IOD-07 | n10s/GDS packaging and GDS output persistence | Implementation-owner | 02, 05, 07, 08 |
| IOD-08 | Graphiti runtime boundary | Implementation-owner | 02, 03, 04, 05, 06, 08 |
| IOD-09 | S5 state storage and `ReviewSource` metadata | Implementation-owner | 04, 05, 06, 07, 08 |
| IOD-10 | Deep-link URI grammar and intent acknowledgement | Implementation-owner | 05, 06, 07, 08 |
| IOD-11 | Shell chrome versus individual extension ownership | Implementation-owner | 05, 07, 08 |
| IOD-12 | Observability schema ownership | Implementation-owner | 01, 04, 05, 06, 07, 08 |
| IOD-13 | Nara vault/write service ownership | Implementation-owner | 03, 04, 05, 06, 07, 08 |
| IOD-14 | Plugin activation, composition, and mini-mode model | Implementation-owner | 05, 07, 08 |
| IOD-17 | `capability-matrix.json` as canonical agent-tool governance authority | Implementation-owner | 01, 04, 09 |
| DSD-01 | Live local-service harness and CI sequencing | Dependency and sequencing | 01, 02, 03, 04, 05, 06, 07, 08 |
| DSD-02 | Track 01-04 contract readiness before UI hardening | Dependency and sequencing | 05, 06, 07, 08 |
| DSD-03 | Non-dry-run promotion waits for compiler mutation law | Dependency and sequencing | 04, 05, 07, 08 |
| DSD-04 | SpaceTimeDB schema source, migration, and table compatibility | Dependency and sequencing | 01, 03, 05, 06, 08 |
| DSD-05 | Protected Nara/Graphiti substrate before M4 and 4/5/0 readiness | Dependency and sequencing | 02, 03, 04, 06, 07, 08 |
| DSD-06 | M2/M3 dataset LUT readiness before full 1-2-3 readiness | Dependency and sequencing | 01, 02, 07, 08 |
| DCC-01 | M0 versus M1 `+1` attribution | Deferred canon contradiction | 07, 08, M5' canon |
| DCC-02 | M3 `16+1` / "17th lens" language | Deferred canon contradiction | 07, 08 |
| DCC-03 | M2 planet count and Earth-observer semantics | Deferred canon contradiction | 07, 08 |
| DCC-04 | M4 identity quaternion naming, axis order, and 0/1 polarity | Deferred canon contradiction | 06, 07, 08 |
| DCC-05 | Audio bus and cymatic derivation ownership wording | Deferred canon contradiction | 01, 07, 08 |
| DCC-06 | Alpha section cross-reference drift | Deferred canon contradiction | 07, 08 |

### UFV-01 - Privacy and consent copy

- **Question:** What exact user-facing language explains protected-local data, derived handles, opt-in shared archetype events, audio playback consent, private projection blocks, and review visibility?
- **Why it matters:** Tracks 06 and 08 can only enforce privacy if users understand what is local, what is shared as an opaque handle, and what is explicitly published.
- **Affected tracks:** 04, 05, 06, 07, 08.
- **Options:** Minimal technical labels in readiness UI; full consent copy in `/body` plus Theia; staged consent with short prompts and inspectable detail panes.
- **Recommended default if safe:** Staged consent: concise default copy in `/body`, detailed reviewable privacy explanation in Theia/M5, and no shared archetype publishing or protected-open action without explicit user action.
- **Validation path:** Privacy-copy review by the user; UI tests that block publishing without consent; privacy audit over Tauri events, SpaceTimeDB rows, S2 payloads, S5 DTOs, observability events, workspace state, and DOM text.
- **Consequence of delaying:** M4, 4/5/0, shared archetype, audio, and review surfaces must remain in blocked or local-only mode even if backend contracts are available.

### UFV-02 - User-final validation threshold for recursive or corpus-affecting changes

- **Question:** When do Paraśakti embedding retrains, Paramaśiva corpus refreshes, Anuttara grammar changes, Mahāmāyā runtime-learning updates, Nara voice/corpus shifts, and Epii-on-Epii recursive changes require explicit user-final validation?
- **Why it matters:** S5 can encode gates, but only a user-final policy can say which changes are routine maintenance and which are canon-, identity-, or governance-affecting.
- **Affected tracks:** 04, 05, 07, 08.
- **Options:** Require human validation for all non-read-only changes; require it only for promotion/mutation; require it by target-specific risk class.
- **Recommended default if safe:** Use target-specific risk classes with a conservative rule: any recursive self-modification, deployment gate, protected-personal corpus change, canon publication, or model/profile behavior change that affects future outputs requires human approval.
- **Validation path:** S5 tests proving agents may defer but cannot approve/reject/revise/promote human-required items; review fixtures for each target subsystem; user acceptance of the gate taxonomy.
- **Consequence of delaying:** S5 dry-run promotion can exist, but operational M5-4 actions must stay read-only or deposit-only.

### UFV-03 - Menubar/background lifecycle semantics

- **Question:** What should close, quit, sleep, wake, auto-start, notification permission, global hotkey conflict, crash recovery, and "IDE closed but `/body` lives" mean to the user?
- **Why it matters:** The one-app/two-surface law depends on user trust that the app is neither secretly running too much nor losing session state when the IDE is summoned or dismissed.
- **Affected tracks:** 05, 06, 08.
- **Options:** Always quit on close; minimize to tray by default; ask once and persist preference; expose explicit "sleep app" and "quit app" commands.
- **Recommended default if safe:** Ask once on first close after IDE summon, persist the preference, and always expose visible connection/readiness state plus explicit sleep and quit commands.
- **Validation path:** Desktop e2e for close/foreground/background/wake flows; bridge subscription upgrade/downgrade tests; reconnect tests after gateway/SpaceTimeDB restart while backgrounded.
- **Consequence of delaying:** Track 06 T7 and deep-link/session continuity cannot be finalized, and multi-webview behavior remains only a prototype claim.

### UFV-04 - Daily-flow review interruption and default lightweight agent

- **Question:** Which actor appears in Shell `1` by default, and which review alerts interrupt daily flow versus staying passive?
- **Why it matters:** `/body` must not imply an agent governance model that S5 has not implemented, and review notifications can become either useful safety signals or ambient noise.
- **Affected tracks:** 04, 06, 07, 08.
- **Options:** Default to Nara; default to Anima; default to Epii; use a neutral "agent check-in" affordance that routes after S5/gateway context is known. Alerts may be all passive, priority-based, or always interrupting for human-required gates.
- **Recommended default if safe:** Neutral "agent check-in" entry with S5-routed actor resolution, and priority-based alerts where human-required/security/privacy/deployment gates can interrupt while routine evidence stays passive.
- **Validation path:** S5 DTO tests for alert category/priority; `/body` UX tests for passive versus interrupting alerts; human-gate tests proving no agent approval affordance appears for human-required reviews.
- **Consequence of delaying:** Shell `1` can show safe review counts and readiness, but should not expose default agent promises or interruption behavior as final UX.

### PRD-01 - Theia browser-mode in Tauri versus local-server/Electron fallback

- **Question:** Can Theia browser-mode run directly inside Tauri v2 Wry/WebKit with workers, IndexedDB, asset paths, CSP, extension-host behavior, WebSockets, and IPC, or does production require a supervised localhost server or Electron sidecar?
- **Why it matters:** This decides bundle shape, security review, offline behavior, startup time, port management, process supervision, and whether the IDE is truly one Tauri product rather than a second app.
- **Affected tracks:** 01, 05, 06, 07, 08.
- **Options:** Bundled browser-mode assets in Tauri webview; Tauri-supervised local Theia server loaded in webview; Tauri-spawned Theia Electron sidecar.
- **Recommended default if safe:** Prototype browser-mode-in-webview first; fallback to supervised localhost browser-mode if direct asset loading fails; treat Electron sidecar as last resort.
- **Validation path:** One-to-two day prototype that launches Tauri, opens `/body`, summons a real Theia workbench, activates a readiness contribution, exercises workers/IndexedDB/CSP/WebSocket/IPC, and records an ADR.
- **Consequence of delaying:** Build scripts, CSP, deep-link verification, Theia version pin, and extension test harnesses remain unstable.

### PRD-02 - Single-webview navigation versus multi-webview persistence

- **Question:** Should IDE summon navigate the existing webview, open a second Tauri webview/window, or keep `/body` in menubar/background while Theia foregrounds?
- **Why it matters:** The canon prefers persistent co-existence; implementation must prove state preservation, resource use, bridge identity, and user lifecycle semantics.
- **Affected tracks:** 05, 06, 08.
- **Options:** Single-webview navigation with persisted restore; multi-window/multi-webview co-existence; tray/background `/body` plus Theia foreground.
- **Recommended default if safe:** Multi-webview with `/body` capable of tray/background persistence, provided the prototype proves shared bridge identity and acceptable resource behavior.
- **Validation path:** Tauri e2e opens `/body`, summons IDE, verifies both surfaces share profile generation/session/review notifications, closes IDE, and verifies `/body` resumes without duplicate subscriptions.
- **Consequence of delaying:** Menubar/background, deep links, workspace persistence, and integrated plugin multi-window tests cannot close.

### PRD-03 - Kernel-bridge host boundary

- **Question:** Is the long-lived shared bridge owned by Theia as first-loaded extension, by the Tauri Rust process, or by a Tauri singleton service with Theia and `/body` adapters?
- **Why it matters:** All M-extension and `/body` consumers need one profile/session/subscription identity, but canon simultaneously names `kernel-bridge` as first-loaded Theia extension and requires `/body` lite mode to share the same instance.
- **Affected tracks:** 01, 03, 05, 06, 07, 08.
- **Options:** Pure Theia extension host; Tauri-owned service exposed to Theia and `/body`; hybrid Tauri singleton plus Theia-native adapter/API.
- **Recommended default if safe:** Hybrid Tauri singleton plus stable Theia-native `KernelBridgeAPI` adapter, because it best satisfies one-app shared instance, `/body` lite mode, and Theia DI consumption.
- **Validation path:** Contract tests for `KernelBridgeAPI`; service tests proving one S3/SpaceTimeDB subscription fans out to `/body` and Theia; background upgrade/downgrade tests; ADR before downstream extension APIs freeze.
- **Consequence of delaying:** Tracks 06-08 can define against an API seam, but cannot finalize subscription economy, background behavior, or performance/privacy claims.

### PRD-04 - Theia extension API, version, package manager, and build composition

- **Question:** Which Theia release, extension API style, package manager, and Tauri build composition are production for `/pratibimba/system`?
- **Why it matters:** All six individual extensions and two integrated plugins depend on a stable build and contribution model before package skeletons, activation tests, and CI can be meaningful.
- **Affected tracks:** 05, 07, 08.
- **Options:** Recent stable Theia with Theia-native extensions; VS Code Extension API for compatibility; Yarn workspaces per Theia convention; `pnpm` per repo convention; isolated package manager; bundled static assets or supervised local server.
- **Recommended default if safe:** Recent stable Theia, Theia-native extensions for `kernel-bridge` and M surfaces, in-tree `/pratibimba/system/extensions`, and a package-manager choice made by the Tauri/Theia prototype rather than assumed.
- **Skill-vs-tool invariant (from VAK-as-Operational-Substrate landing):** Within the agent-capability layer (`Body/S/S4/plugins/pleroma/capability-matrix.json`), `vak_profile` is a skill-level concept: every `skills[]` entry has a matching `skills/<name>/SKILL.md` directory enforced by `test_matrix_maps_real_agents_skills_and_hooks`. `dispatch_tools[]` entries are tools not skills and carry no `vak_profile`. Theia extensions hosting skills (under `/pratibimba/system/extensions/*/skills/*/SKILL.md`) inherit this invariant; new agent capabilities added through Theia extensions must respect skill-vs-tool distinction at matrix-authoring time. See `IOD-17` for the broader governance authority.
- **Validation path:** Build `kernel-bridge` plus `m0-anuttara` as Theia-native slices; verify workbench command/layout service activation; record Theia version/package manager/update cadence ADR; verify any Theia-extension-hosted skills respect the skill-vs-tool invariant via the live `test_matrix_maps_real_agents_skills_and_hooks` check.
- **Consequence of delaying:** Track 07 package inventory and Track 08 composition contracts remain abstract and cannot be enforced by static checks.

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
