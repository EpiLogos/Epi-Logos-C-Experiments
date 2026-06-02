# M-Dev Context Pack - 08.T3

Generated: 2026-06-01T12:37:02.764Z

## Task

- **ID:** 08.T3
- **Title:** 1-2-3 Cosmic Engine Composition Slice
- **Track:** 08-integrated-plugin-tracks.md
- **Computed status:** in_progress
- **Write scopes:** Idea/Pratibimba/System/extensions/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
- `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`
- `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`
- `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`
- `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md`
- `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`
- `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md`
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/08-integrated-plugin-tracks.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`

## Dependency Context

- 08.T2 - Shared Live State Coordinator And Readiness Model (08-integrated-plugin-tracks.md)

## Track Source Specs

- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, Section 4.2 "The `KernelBridgeAPI` interface", Section 4.3 "Data flow specifics", Section 4.4 "Observability stream for autoresearch spine", Section 5 "The ide-shell-m0-m5 extension", Section 6 "The six individual M-extensions", Section 7 "The two integrated plugins", Section 8 "The 0/1 <-> IDE bridging", Section 10 "Open architectural questions". This is the direct composition and activation authority for the two integrated plugins.
- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, Section 4.4 "The 2 integrated plugins", Section 4.5 "Granularity decision", Section 5.3 "The downstream extensions consume from kernel-bridge", Section 6 "The QL context-frame inheritance pattern", Section 8 "Implementation milestones", especially Milestone 6 and Milestone 7. This is the app-architecture authority that integrated plugins are composed bundles inside M5-3.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "Canonical 0/1/4+2 Layout Discipline", "The Shell 0/1 Split IS the (0/1) Inversionary Parent", "Default Surface: Conversational/Agentic Engagement, Not Data-Dump", "Required Shared Profile", "The K2 Topology as the Shared Substrate". This is the UX and shared-profile authority for not collapsing shell previews, subsystem depth, or technical inspectors into one always-on dashboard.
- [[M5'-SPEC]] - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, "Sixfold IDE Surface", "Graph Namespace Model", "User-Facing Surface", "Backend Contract Consumed", "Privacy Boundary", "Relationship To Portal 0/1 And The 4+2 Layer", "Canon Recognition: 137 And Jiva-Is-Siva", "Readiness / Test Criteria". This is the M5 authority for graph namespace separation, review/evidence hooks, and the Jiva-is-Siva recognition boundary.
- [[alpha_quaternionic_integration_across_M_stack]] - `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`, Section 4 "alpha(E) is the bioquaternion-to-live-state epigenetic coupling between Nara and the 1-2-3 stack", Section 11 "Shared cosmos hosting at S3' via SpaceTimeDB", especially Sections 11.3, 11.5, 11.7, and 11.8. This is the source for the live M4 <-> M1/M2/M3 coupling, SpaceTimeDB shared-cosmos state, and privacy gotchas.
- [[alpha_rasa_bridge_ql]] - `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md`, "Executive thesis", Section 9 "The QL unit corrected", and Section 13 "Research edges". This is the source for `137 = 64 + 72 + 1`, alpha as variable-invariant coupling, and the requirement not to flatten physics-register overlays into unreviewed runtime facts.
- [[M0'-SPEC]] - `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`, "Backend Contract Consumed", "The 0-Side Mahamaya Graph View", "Privacy Boundary", "Readiness / Test Criteria". This defines what `plugin-integrated-4-5-0` may consume from the M0 graph surface and what it must leave to S2/M0 ownership.
- [[M1'-SPEC]] - `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`, Section 2 "User-Facing Surface", Section 3 "Backend Contract Consumed", Section 13.3 "IDE / Kernel-Bridge Placement", Section 14 "Readiness / Test Criteria". This defines the M1 composition contract for `plugin-integrated-1-2-3`.
- [[M2'-SPEC]] - `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`, Section 2 "User-Facing Surface", Section 3 "Backend Contract Consumed", Section 9.7 "IDE Surface Placement", Section 10 "Readiness / Test Criteria". This defines the M2 composition contract and the kernel-bridge-only rule for both the individual `m2-parashakti` extension and the integrated 1-2-3 plugin.
- [[M3'-SPEC]] - `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`, Section 2 "Backend Contract Consumed", Section 6 "Readiness / Test Criteria", Section 7 "The 472-State Modal-Inversion Landscape", Section 8.13 "M3-5 Surface Law", Section 8.14 "App Surface and Pipeline Hooks". This defines the M3 composition contract and the single-profile-stream rule for the integrated 1-2-3 plugin.
- [[M4'-SPEC]] - `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`, "Backend Contract Consumed", "Privacy Boundary", Section 6.6 "Canonical Nara Content Structure And Surface Placement", Section 6.7 "Cross-M Interface Seams And Promotion Law", Section 7 "The Personal-Quaternion at M4-4-4-4", Section 8 "Readiness / Test Criteria". This defines what the 4/5/0 plugin may expose from M4 and what must remain protected-local.
- [[m4-prime-psychoid-cymatic-field-engine]] - `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md`, Section 11 "Engine architecture", Section 13 "Composition discipline", Section 14 "Privacy and protected-local status", Section 18.4 "The 0/1/4+2 layout", Section 18.11 "The Jiva-is-Siva recognition computationally concrete". This is the rendering, pacing, and privacy authority for the 4/5/0 recognition surface.
- [[m4-prime-nara-day-episodes-and-oracle-artifacts]] - `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md`, Section 0 "Thesis", Section 2 "The artifact taxonomy", Section 9 "Privacy classes per artifact type", Section 10 "How Tauri-v2 0/1 surface and m4-nara IDE extension consume this", Section 11 "Implementation milestones". This is the day/artifact/Graphiti contract consumed by 4/5/0 without exposing bodies.
- [[01-kernel-bridge-and-s0-foundation]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`, especially "Architectural Keystones", Tranches 5-8, "Dependencies", and "Success Criteria". Track 08 depends on the typed `KernelBridgeAPI`, shared profile, lite/full subscription modes, readiness states, observability, and agent capabilities.
- [[02-s2-bimba-map-population]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`, especially Tranches T7-T8 and "Success Criteria". Track 08 depends on coordinate-native graph APIs, GDS overlays, namespace-aware graph access, and real captured S2 payloads.
- [[03-s3-gateway-and-spacetimedb]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`, especially Tranches 3-5, "Open Decisions", and "Success Criteria". Track 08 depends on native live deltas for `world_clock`, `pratibimba_presence`, shared archetype/coincidence rows, session/DAY/NOW handles, and gateway RPC stream contracts.
- [[04-s5-autoresearch-and-review-extension]] - `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`, especially Tranches 6-9. Track 08 depends on real S5 review/autoresearch DTOs, Epii agent access, route queues, governance gates, dry-run promotion state, and frontend-safe privacy-filtered read models.

## Task Body

4. **T3 - 1-2-3 Cosmic Engine Composition Slice.**

   Deliverables:

   - Compose the first real `cosmic-engine.integrated` layout: M3 cosmic wheel center, M2 lens/cymatic/planetary-chakral backdrop or left stage, M1 torus/path/audio-walk inspector as side or lower stage.
   - Synchronize the displayed M1 `(lens, mode)`, M2 `resonance72` / `planetaryChakral` / `kleinFlipState`, and M3 `(codon, rotation)` / `mahamaya` state from one shared profile generation.
   - Render readiness blockers for missing `audio_octet`, `nodal_quartet`, `planetaryChakral`, `codonRotationProjection`, M3 codec LUT, or S2 provenance.
   - Add mini-inspector choreography for M1 route preview, M2 meaning packet, and M3 codon provenance without letting any one inspector take over the whole workspace by default.

   Verification:

   - A live or captured-real-profile test drives a profile generation change and proves all three panes display the same generation id, tick, `(lens, mode)`, and readiness.
   - Tests prove the integrated plugin does not contain local codon, tarot, planetary, pitch, or correspondence tables; it only renders backend/profile/S2-supplied fields.
   - Visual-state tests prove M1/M2/M3 individual extensions are in supporting mode while the integrated plugin owns center stage.

## Track Open Decisions

- **Workspace-mode vs command-view activation:** Source docs allow "own Theia workspace-mode or command". The implementation must decide whether integrated plugins are named workspace layouts, command-opened meta-views, or both. This decision affects persistence, deep links, and layout conflict handling.
- **Mini-mode inspector standard:** Theia plan says individual extensions are inhibited or operate in mini-mode when an integrated plugin is active, but no concrete mini-inspector contract exists yet. Track 08 proposes one; Track 07 must confirm it.
- **Composition ownership:** Decide whether composition orchestration lives in each integrated plugin package, a shared `integrated-composition` extension, or the `ide-shell-m0-m5` chrome extension. A shared service is favored to avoid divergent layout arbitration.
- **Live shared state cadence:** Need a production cadence decision for backend state updates versus render interpolation: 1 Hz `world_clock`, potential 250 ms visual interpolation, high-frequency audio/cymatic frames, and S5 review updates all have different cadence requirements.
- **Tauri/Theia bridge host boundary:** The kernel bridge may be Theia-native, Tauri-owned with adapters, or hybrid. Integrated plugin code should target the stable API, but performance and privacy behavior depend on the host decision.
- **Graph/city visual language for 4/5/0:** The source names an Epii city-scape backdrop but leaves literal architecture versus stylized geometric abstraction open. The first build should prototype both before settling.
- **Personal field simulation level:** M4 field source names Option F full physics as target and stylized cymatic-inspired rendering as fallback. 4/5/0 must render readiness honestly if only the fallback is available.
- **S2 GDS personalization model:** Source recommends canonical Option 1 first, with local per-user enrichment later. 4/5/0 should not assume user-personal GDS overlays until Track 02 or M4 substrate supplies the privacy-safe model.
- **Alpha `+1` wording contradiction:** M5' records the unresolved M0/M1 `+1` source contradiction. Integrated plugins should route `137 = 64 + 72 + 1` teaching to M1/M2/M3 for the cosmic spine and keep M0 as prior ground unless canon changes.
- **Track 07 source availability:** At this planning moment the individual-extension track file was not present in the worktree. Track 08 therefore defines composition expectations and marks per-extension contribution details as a dependency rather than pretending they are settled.
- **Missing alpha Section 18 cross-reference:** `M0'-SPEC` notes that `alpha_quaternionic_integration_across_M_stack.md` has no Section 18 heading in the current file. Track 08 should cite the discoverable Section 11 and M4 field-engine Section 18 instead.

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
