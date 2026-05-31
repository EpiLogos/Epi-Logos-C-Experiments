# M-Dev Context Pack - 06.T1

Generated: 2026-05-31T23:42:19.733Z

## Task

- **ID:** 06.T1
- **Title:** Lite kernel-bridge contract adapter in `/body` (gated by Track 01 contract package)
- **Track:** 06-zero-one-surface-evolution.md
- **Computed status:** in_progress
- **Write scopes:** Body/M/epi-tauri/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/M/epi-tauri/src-tauri/tests/`
- `Body/M/epi-tauri/src/**/*.test.*`
- `Body/M/epi-tauri/src/shell/Shell.tsx`
- `Body/M/epi-tauri/tests/e2e/`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md`
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/06-zero-one-surface-evolution.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `src/components/CommandPalette.tsx`
- `src/components/OmniPanel.tsx`
- `src/domains/ClockCosmos.tsx`
- `src/domains/M0_Anuttara/BimbaMap2D.tsx`
- `src/domains/M4_Nara/*`
- `src/domains/M5_Epii/*`
- `src/domains/MPrime_Subsystems/*`
- `src/domains/WorkspacePanel.tsx`
- `src/events.rs`
- `src/gateway/connection.rs`
- `src/services/*`
- `src/stores/*`
- `src/temporal/spacetime.rs`

## Dependency Context

- 06.T0 - Baseline characterization and preservation map (06-zero-one-surface-evolution.md)

## Track Source Specs

- [[2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`, "Architectural Keystones", "Tranche 5 - Kernel Bridge Contract Package", "Tranche 6 - `kernel-bridge` Runtime MVP", and "Tranche 8 - End-To-End S0-To-Surface Acceptance Slice". Track 06 depends on its `MathemeHarmonicProfile`, lite/full bridge mode, readiness taxonomy, capability manifest, and observability stream.
- [[2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`, "Architectural Keystones", "T7 - Coordinate-native graph API parity", and "T8 - M5-3 and M5-4 consumption contracts". Track 06 depends on S2-backed filtered subgraph, pointer anchors, Anuttara fields, GDS readiness, and namespace-safe graph payloads.
- [[2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`, "Architectural Keystones", "Tranche 3 - Native SpaceTimeDB WebSocket subscription completion", "Tranche 5 - `/body` and Theia kernel-bridge consumption slice", and "Success Criteria". Track 06 depends on live `session_surface`, `kairos_surface`, `global_temporal_surface`, `world_clock`, subscription lifecycle, resync, and gateway RPC parity.
- [[2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`, "Architectural Keystones", "Tranche 6 - Epii Agent-Access and M5-4 Mediation Surface", "Tranche 7 - M5-3 IDE/Workbench Contract Surface", and "Success Criteria". Track 06 depends on real review alerts, Epii snapshots, typed candidates, review deposits, human-gate enforcement, and DTOs for lightweight review surfacing.
- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, section 2 "Code organisation: /body and /pratibimba/system", section 3 "The single-Tauri-app two-surface model", section 5.4 "The kernel-bridge in the 0/1 surface", and section 8 milestones 8-9. This is the authority that `/body` stays lightweight, `/pratibimba/system` is the deep IDE, both ship as one Tauri app, and `/body` uses lite-mode bridge plus cross-surface deep links.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "Canonical 0/1/4+2 Layout Discipline", "The Shell 0/1 Split IS the (0/1) Inversionary Parent", "Minimum Live Loop", "Diatonic CF / VAK Projection", and "Required Shared Profile". This is the authority for the shell 0/1 split, shared `MathemeHarmonicProfile`, no local astrology/profile recomputation, and the open 0-side graph + clock composition decision.
- [[M'-PORTAL-SPEC]] - `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, "Shared Runtime Law", "`/` Surface", "`0` Surface", "`1` Surface", "M4' Nara Modality Surface", "M5' Epii Surface", "Agentic Execution / Inbox", and "Implementation Rule". This is the authority that OmniPanel is the desktop `/`, TUI and Tauri share logical contracts, and `/body` dispatches existing CLI/gateway/service calls instead of forking backend behavior.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "OmniPanel As `/`", "Shell `0` - Cosmic Surface", "0-Side Graph Affordance", "Shell `1` - Personal Surface", "VAK / Anima / Epii Execution Surface", "Port Architecture", "Harmonic Profile Architecture Amendment", "Graphiti And S2 Graph Boundary", "Current-State Gap Table", and "Testing Contract". This is the desktop integration authority for service clients, readiness, privacy, current implementation gaps, and real local service tests.
- [[m4-prime-nara-day-episodes-and-oracle-artifacts]] - `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md`, section 9 "Privacy classes per artifact type", section 10 "How Tauri-v2 0/1 surface and m4-nara IDE extension consume this", and section 11 milestone 9 "0/1 surface integration". This is the authority for DayContainer/artifact creation, highlight routing, quick agent chat, lightweight cymatic render, and protected-local Nara body handling.
- [[m4-prime-psychoid-cymatic-field-engine]] - `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md`, section 2 "The 0/1 layout discipline and where the field lives", section 11 "Engine architecture", section 13 "Composition discipline", section 14 "Privacy and protected-local status", section 15.4 "Live SpaceTimeDB integration", and section 18.10 "Embedded graph view in Tauri-v2". This is the authority for the 0-side world clock, 1-side protected field, restraint discipline, and graph-view evolution from the existing BimbaMap stubs.
- [[M5'-SPEC]] - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, "Sixfold IDE Surface", "Graph Namespace Model", "Surface Philosophy", "User-Facing Surface", "Backend Contract Consumed", "Required `MathemeHarmonicProfile` Fields", "Privacy Boundary", "Relationship To Portal 0/1 And The 4+2 Layer", and "Readiness / Test Criteria". This is the authority for lightweight Epii affordances in Shell `1`, review inbox visibility, graph namespace boundaries, and summonable deep IDE panes.
- Current implementation surface observed: `Body/M/epi-tauri/src/shell/Shell.tsx`, `src/components/OmniPanel.tsx`, `src/components/CommandPalette.tsx`, `src/domains/ClockCosmos.tsx`, `src/domains/WorkspacePanel.tsx`, `src/domains/M0_Anuttara/BimbaMap2D.tsx`, `src/domains/M4_Nara/*`, `src/domains/M5_Epii/*`, `src/domains/MPrime_Subsystems/*`, `src/services/*`, `src/stores/*`, `src-tauri/src/temporal/spacetime.rs`, `src-tauri/src/gateway/connection.rs`, `src-tauri/src/events.rs`, and current Vitest/Playwright/Rust tests under `Body/M/epi-tauri/src/**/*.test.*`, `Body/M/epi-tauri/tests/e2e/`, and `Body/M/epi-tauri/src-tauri/tests/`.

## Task Body

2. **T1 - Lite kernel-bridge contract adapter in `/body` (gated by Track 01 contract package).**

   Deliverables:

   - Introduce a renderer-facing `kernelBridgeClient` and `kernelBridgeStore` that consume the shared Track 01 TypeScript contract for lite mode: profile snapshot, profile generation, readiness taxonomy, connection status, world clock handle, selected coordinate anchor, review-alert feed handle, and gateway RPC dispatcher.
   - Keep `kernelProjection.ts` as the safe projection adapter over `MathemeHarmonicProfile`, but make it read bridge snapshots instead of accepting ad hoc `PortalRuntimeState` fragments.
   - Extend `services/types.ts` only as a generated/schema-validated mirror or compatibility facade. Do not add a second hand-authored `MathemeHarmonicProfile`, readiness enum, or bridge event shape outside the boundary mirror.
   - Update `OmniPanel` overview and `ClockCosmos` temporal strip to show bridge readiness facts: profile usable, S2 pointer law availability, S3 stream staleness, S5 review route availability, pending LUT, and private projection block.
   - Preserve current `temporalClient` and `clockClient` as compatibility facades until T2/T3 migrate their consumers.

   Verification:

   - TS schema tests parse profile/readiness/connection JSON produced by real `portal-core`/`epi-cli`/gateway paths from Track 01, not handwritten JSON.
   - Vitest tests prove `projectKernelHarmonicConsumer` accepts the shared profile generation and rejects protected fields (`bioquaternion`, raw `q_b`, raw `q_p`, private resonance vectors) when they appear in public-current payloads.
   - Contract locality tests extend `types.contract.test.ts` to fail if duplicate bridge/profile/review alert contracts appear outside the service boundary mirror.
   - A renderer integration test uses the real Tauri invoke path for bridge readiness when the local gateway is running; it must not stub `window.__bridgeReady = true` or equivalent.

## Track Open Decisions

- **0-side graph + clock composition:** `M'-SYSTEM-SPEC`, `M'-PORTAL-SPEC`, and `M'-TAURI-PORT-SPEC` preserve co-resident, toggled, and graph-overlaying-clock possibilities. Track 06 should build a data-authority seam and leave final composition to UX.
- **Bridge host boundary:** The system-shape canon says both surfaces share one bridge instance, while Track 01 leaves open whether that instance is Theia-owned, Tauri-owned, or hybrid. Track 06 needs the answer before subscription upgrade/downgrade and background mode can be finalized.
- **Theia in Tauri hosting:** The source specs still leave open whether Theia runs inside Tauri webview, as a wrapped localhost browser app, or through another process boundary. Deep-link verification depends on this.
- **Deep-link scheme:** Internal Tauri events, command-palette intents, and an external OS URL scheme such as `epi://` need one canonical grammar. Until decided, implementation should isolate route parsing behind `DeepLinkIntent`.
- **Menubar/background semantics:** The canon names menubar/background mode, but not exact behavior for quit, close, sleep, wake, auto-start, notification permission, global hotkey conflicts, or crash recovery.
- **Privacy copy and consent UI:** Specs define protected-local classes and opt-in publishing rules, but `/body` still needs user-facing language for private projection block, protected-local-derived handles, opt-in shared archetype events, and audio playback consent.
- **Default lightweight agent:** Shell `1` needs an agent check-in affordance, but the default actor/routing between Nara, Anima, Sophia, and Epii should be confirmed so the surface does not imply a governance model S5 has not implemented.
- **Review alert priority model:** Track 04 will expose review DTOs, but `/body` needs a product decision for which alerts interrupt daily flow, which remain passive, and which summon the IDE.
- **Profile naming compatibility:** Current renderer types expose `binary`; specs trend toward explicit `mahamaya`. Track 06 should follow Track 01's migration policy rather than inventing aliases locally.
- **Minimum IDE receiver for T6:** Source specs do not define the smallest `/pratibimba/system` target that counts as a real deep-link receiver. Track 06 should coordinate with the M5-3 IDE-shell track before claiming T6 completion.

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
