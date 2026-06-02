# M-Dev Context Pack - 05.T1

Generated: 2026-06-01T10:14:46.985Z

## Task

- **ID:** 05.T1
- **Title:** `Idea/Pratibimba/System` Theia Application Skeleton And Version Pin
- **Track:** 05-tauri-ide-shell-and-pratibimba-system.md
- **Computed status:** in_progress
- **Write scopes:** Body/M/epi-tauri/**, Idea/Pratibimba/System, Idea/Pratibimba/System/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/M/epi-tauri`
- `Body/M/epi-tauri/package.json`
- `Body/M/epi-tauri/src-tauri/src/lib.rs`
- `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs`
- `Body/M/epi-tauri/src/domains/M5_Epii/EpiiDashboard.tsx`
- `Body/M/epi-tauri/src/services/types.ts`
- `Body/M/epi-tauri/src/shell/Shell.tsx`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Pratibimba/System`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`
- `src/components/CommandPalette.tsx`
- `src/components/OmniPanel.tsx`
- `src/domains/MPrime_Subsystems/MPrimeSubsystemPage.tsx`
- `src/stores/uiStore.ts`

## Dependency Context

- 05.T0 - Runtime Baseline, Decision Harness, And Contract Map (05-tauri-ide-shell-and-pratibimba-system.md)

## Track Source Specs

- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, especially section 1 "Architectural commitments", section 3 "The `/pratibimba/system/` directory structure", section 4 "The kernel-bridge foundational extension", section 5 "The ide-shell-m0-m5 extension", section 8 "The 0/1 <-> IDE bridging", section 9 "Build pipeline", section 10 "Open architectural questions", section 11 "Initial tranche specification", and section 12 "Success criteria". Track 05 folds this plan in and supersedes section 11's proof-of-concept tranches with production tranches.
- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, section 2 "Code organisation: /body and /pratibimba/system", section 3 "The single-Tauri-app two-surface model", section 4 "Theia as IDE shell + the 6 + 2 plugin-app architecture", section 5 "The kernel-bridge foundational extension", section 8 "Implementation milestones", and section 9 "Open implementation questions". This is the authority for one Tauri app, two surfaces, Theia as the deep IDE, M0/M5 IDE chrome, 6+2 extension/plugin shape, and kernel-bridge as M5-2 access point.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "Canonical 0/1/4+2 Layout Discipline", "The Shell 0/1 Split IS the (0/1) Inversionary Parent", "Minimum Live Loop", "Diatonic CF / VAK Projection", "The K2 Topology as the Shared Substrate", "Required Shared MathemeHarmonicProfile", and "Neo4j / Graphiti Boundary". This is the authority that M' surfaces share one profile, topology, VAK projection, and graph/memory boundary rather than widget-local interpretations.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "Two-Layer Page Architecture", "Preserve From Electron", "Replace From Electron", "OmniPanel As `/`", "VAK / Anima / Epii Execution Surface", "Port Architecture", "Harmonic Profile Architecture Amendment", "Graphiti And S2 Graph Boundary", "Current-State Gap Table", and "Testing Contract". This is the authority for current `Body/M/epi-tauri` reuse, Tauri command/event boundaries, typed renderer clients, OmniPanel parity, and mock-free desktop tests.
- [[M'-PORTAL-SPEC]] - `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, "Harmonic / Musical Surface Law", "Shared Runtime Law", "`/` Surface", "`0` Surface", "`1` Surface", "M5' Epii Surface", "Agentic Execution / Inbox", and "Implementation Rule". This is the authority that desktop and TUI mirror logical contracts, not widgets, and that `/` dispatches CLI/gateway/typed service calls instead of forking backend behavior.
- [[M5'-SPEC]] - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, "Sixfold IDE Surface", "Graph Namespace Model", "Surface Philosophy: The Agentic IDE as Conversational Engagement", "User-Facing Surface", "Backend Contract Consumed", "Required MathemeHarmonicProfile Fields", "Relationship To Portal 0/1 And The 4+2 Layer", and "Readiness / Test Criteria". This is the authority for M5-2/S-stack, M5-3/Tauri-Theia, M5-4/agentic mediation, graph namespaces, review evidence, human gates, and Theia kernel-bridge readiness.
- [[01-kernel-bridge-and-s0-foundation]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`, "Architectural Keystones", Tranches 5-8, "Dependencies", and "Open Decisions". Track 05 depends on the shared TypeScript contract, lite/full bridge modes, real `MathemeHarmonicProfile`, readiness taxonomy, bridge capabilities, and bridge-host decision path.
- [[02-s2-bimba-map-population]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`, Tranches T7-T9 and "Success Criteria". Track 05 depends on S2 graph payloads, pointer anchors, namespace-aware graph access, Anuttara fields, GDS overlay readiness, and real S2 response fixtures.
- [[03-s3-gateway-and-spacetimedb]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`, Tranches 1-5, "Open Decisions", and "Success Criteria". Track 05 depends on the gateway/WebSocket stream contract, native SpaceTimeDB subscriptions, `world_clock`, `pratibimba_presence`, shared archetype/coincidence rows, DAY/NOW/session/deposition anchors, and reconnect/resync semantics.
- [[04-s5-autoresearch-and-review-extension]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`, Tranches 6-9, "Dependencies", and "Success Criteria". Track 05 depends on real S5 review/autoresearch DTOs, route queues, agent-access snapshots, review gates, dry-run promotion plans, and M5-3 IDE/workbench contract surfaces.

Current implementation surface observed for this plan:

- `Body/M/epi-tauri/package.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, and `src-tauri/tauri.conf.json` define the existing React/Vite/Tauri v2 app and one-window `frontendDist` build shape.
- `Body/M/epi-tauri/src/shell/Shell.tsx`, `src/components/OmniPanel.tsx`, `src/components/CommandPalette.tsx`, and `src/stores/uiStore.ts` already provide a lightweight shell, hotkeys, workspace selection, OmniPanel, command palette, and an MPrime workspace entry.
- `Body/M/epi-tauri/src/services/types.ts`, `kernelProjection.ts`, `kernelProfileObservation.ts`, `gatewayClient.ts`, `temporalClient.ts`, `graphClient.ts`, `epiiClient.ts`, and `agentExecutionClient.ts` are the current typed-client footholds for profile, S2/S3/S5, and agent surfaces.
- `Body/M/epi-tauri/src-tauri/src/lib.rs`, `commands/*`, `events.rs`, `gateway`, `graph`, `temporal`, `vault`, `agents`, `atelier`, and `library` show the current Tauri command/event authority surface.
- `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` still treats native SpaceTimeDB WebSocket mode as a stub and logs fallback to polling; Track 05 must depend on Track 03 before claiming native live projection readiness.
- `Body/M/epi-tauri/src/domains/M5_Epii/EpiiDashboard.tsx` and `src/domains/MPrime_Subsystems/MPrimeSubsystemPage.tsx` already move toward conversational M5 and 4+2 profile-grounded surfaces, but they are not a Theia IDE shell.

## Task Body

2. **T1 - `Idea/Pratibimba/System` Theia Application Skeleton And Version Pin.**

   Deliverables:

   - Create `Idea/Pratibimba/System` as the in-tree Theia workspace, served or summoned as the `/pratibimba/system` IDE surface, with `theia-app`, `extensions`, `shared`, `docs`, and `scripts` matching the existing Theia plan section 3, adjusted for the chosen package manager.
   - Pin a Theia release after checking current official Theia compatibility with the selected Node, package manager, and Tauri webview constraints.
   - Add a minimal Theia application with real Theia workbench services, workspace state, command registry, layout service, contribution loading, and extension activation smoke tests.
   - Add the first non-placeholder Theia contribution: a diagnostic/readiness view that reads a real Tauri or gateway readiness endpoint and displays blocked/ready states.
   - Document the extension naming, dependency, and publishing model for the six individual M extensions and two integrated plugins.

   Verification:

   - `pnpm --dir Idea/Pratibimba/System install --frozen-lockfile` or the chosen equivalent is reproducible from a clean checkout.
   - `pnpm --dir Idea/Pratibimba/System build` produces a real Theia browser bundle or the selected runtime artifact without Electron-only assumptions unless Electron fallback is explicitly chosen.
   - The Theia app starts in development and activates the readiness contribution through Theia's real DI/contribution system.
   - A Theia browser test verifies the workbench shell, command registry, layout service, and readiness view are live; a static HTML "hello" page is not acceptable.

## Track Open Decisions

- **Theia runtime mode:** Can Theia browser-mode run directly inside Tauri's Wry/WebKit webview with required workers, IndexedDB, asset paths, CSP, and extension-host behavior? If not, is the production fallback local-server-in-webview or Theia Electron sidecar?
- **Single versus multi-webview:** Should IDE summon navigate the existing webview, open a second Tauri window/webview, or keep `/body` in tray/background with Theia foregrounded? The canon prefers persistent co-existence, but implementation must prove state and resource behavior.
- **Bridge ownership:** Is the long-lived shared bridge owned by the Tauri Rust process, by a Theia first-loaded extension, or by a hybrid Tauri singleton with Theia and `/body` adapters? The API should be stable before this is finalized.
- **Theia version pin and update cadence:** The existing Theia plan mentions "1.50+" as an example, but implementation must verify the current stable release and choose an update cadence.
- **Package manager:** Theia convention often favors Yarn workspaces, while the current Tauri app uses `pnpm`. Decide whether `Idea/Pratibimba/System` follows Theia convention, repo convention, or an explicitly isolated package manager.
- **Build composition strategy:** Decide whether Tauri bundles Theia static assets, supervises a local Theia server, or embeds/supervises a sidecar. This affects bundle size, CSP, offline behavior, startup time, and security review.
- **Extension host model:** Decide whether all 6+2 extensions are in-tree Theia-native packages for phase 1, whether any use VS Code Extension API, and how external plugin publishing would be introduced later.
- **Workspace and state persistence:** Decide which state belongs to Theia workspace storage, Tauri app state, S3 session state, S5 review state, S1/vault files, or bridge cache.
- **IDE terminal and shell access:** Theia normally provides terminal/task features; Epi-Logos needs bounded agent/task execution. Decide whether a local terminal is available to users, agents, both, or neither in phase 1.
- **Source of deep M-extension ownership:** Track 05 owns the shell, registry, and first real contribution slices, but deeper M1/M2/M3/M4 subsystem renderers may require follow-on tracks once backend contracts mature.
- **Current source gap:** The source specs define the desired Theia shell and M5' workbench, but they do not yet provide a definitive Theia/Tauri embedding proof, bridge-host decision, or SpaceTimeDB table/stream shape for Theia beyond upstream track contracts.

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
| DSD-06 | M2/M3 authority payload readiness before full 1-2-3 readiness | Dependency and sequencing | 01, 02, 07, 08 |
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
- **Recommended default if safe:** Recent stable Theia, Theia-native extensions for `kernel-bridge` and M surfaces, in-tree `Idea/Pratibimba/System/extensions`, and a package-manager choice made by the Tauri/Theia prototype rather than assumed.
- **Skill-vs-tool invariant (from VAK-as-Operational-Substrate landing):** Within the agent-capability layer (`Body/S/S4/plugins/pleroma/capability-matrix.json`), `vak_profile` is a skill-level concept: every `skills[]` entry has a matching `skills/<name>/SKILL.md` directory enforced by `test_matrix_maps_real_agents_skills_and_hooks`. `dispatch_tools[]` entries are tools not skills and carry no `vak_profile`. Theia extensions hosting skills (under `Idea/Pratibimba/System/extensions/*/skills/*/SKILL.md`) inherit this invariant; new agent capabilities added through Theia extensions must respect skill-vs-tool distinction at matrix-authoring time. See `IOD-17` for the broader governance authority.
- **Validation path:** Build `kernel-bridge` plus `m0-anuttara` as Theia-native slices; verify workbench command/layout service activation; record Theia version/package manager/update cadence ADR; verify any Theia-extension-hosted skills respect the skill-vs-tool invariant via the live `test_matrix_maps_real_agents_skills_and_hooks` check.
- **Consequence of delaying:** Track 07 package inventory and Track 08 composition contracts remain abstract and cannot be enforced by static checks.

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
