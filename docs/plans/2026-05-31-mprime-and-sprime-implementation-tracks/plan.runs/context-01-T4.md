# M-Dev Context Pack - 01.T4

Generated: 2026-06-01T12:08:28.226Z

## Task

- **ID:** 01.T4
- **Title:** SpaceTimeDB Projection And Resync Bridge
- **Track:** 01-kernel-bridge-and-s0-foundation.md
- **Computed status:** ready
- **Write scopes:** Body/S/S0/**, Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/S/S0/epi-cli/schemas/src/coordinate.ts`
- `Body/S/S0/epi-cli/src/ffi/mod.rs`
- `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`
- `Body/S/S0/epi-cli/tests/gate_spacetimedb_bridge.rs`
- `Body/S/S0/epi-cli/tests/pointer_web_ffi_contract.rs`
- `Body/S/S0/epi-lib/include/pointer_web.h`
- `Body/S/S0/epi-lib/src/pointer_web.c`
- `Body/S/S0/epi-lib/test/infrastructure/test_pointer_web.c`
- `Body/S/S0/portal-core/src/codon_rotation_projection.rs`
- `Body/S/S0/portal-core/src/events.rs`
- `Body/S/S0/portal-core/src/kernel.rs`
- `Body/S/S0/portal-core/src/nara_journal.rs`
- `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs`
- `Body/S/S0/portal-core/src/personal_identity.rs`
- `Body/S/S0/portal-core/tests/m_prime_shared_contracts.rs`
- `Body/S/S0/portal-core/tests/vimarsha_reading.rs`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/S/S0/S0-CODON-ROTATION-PROJECTION-SPEC.md`
- `Idea/Bimba/Seeds/S/S0/S0-HARMONIC-POINTER-WEB36-SPEC.md`
- `docs/plans/2026-05-19-kernel-mprime-harmonic-clock-integration-plan.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`
- `docs/specs/S/S0-S0i-CLI-CORE.md`

## Dependency Context

- 01.T3 - S0' CLI, Schema, And Gateway Profile Surface (01-kernel-bridge-and-s0-foundation.md)

## Track Source Specs

- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, section 1.2 "M5-2 = S-family; M5-3 = M'-family; M5-4 = operational-capacities + agentic mediation", section 5 "The kernel-bridge foundational extension", section 8 "Implementation milestones", section 9 "Open implementation questions". This is the authority that M5-2 is the S-stack and that `kernel-bridge` is the M5-3/M5-4 access point into it.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "The Shell 0/1 Split IS the (0/1) Inversionary Parent", "Musical Instrument Ramification", "Required Shared Profile", "Harmonic Clock Integration Plan". This is the authority for the shared `MathemeHarmonicProfile` and for not allowing M' renderers to invent private clock/profile/codon mappings.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "Port Architecture", "Harmonic Profile Architecture Amendment", "S0' Command / Config / Readiness Membrane", "Current-State Gap Table", "Testing Contract". This is the authority for typed clients, readiness separation, and real local gateway/S2/S3 tests.
- [[M'-PORTAL-SPEC]] - `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, "Shared Runtime Law", "`/` Surface", "Agentic Execution / Inbox", "Implementation Rule". This is the authority that TUI and desktop mirror logical contracts, not widgets, and that `/` dispatches CLI/gateway/typed service calls instead of forking backend behavior.
- [[S0-HARMONIC-POINTER-WEB36-SPEC]] - `Idea/Bimba/Seeds/S/S0/S0-HARMONIC-POINTER-WEB36-SPEC.md`, section A "Intent", section D "Canonical 36 Shape", section E "Seven Context Frames Are Overlay", section G "C Contract Shape", section H "Build Path", section J "Boundaries". This is the authority for Bedrock7, PointerWeb36, CF7, compact C descriptors, and real C arena/family-linked tests.
- [[S0-CODON-ROTATION-PROJECTION-SPEC]] - `Idea/Bimba/Seeds/S/S0/S0-CODON-ROTATION-PROJECTION-SPEC.md`, "Purpose", "Cardinality Law", "Forward Map", "Reverse Map", "q_cosmic", "Tests". This is the authority for the 84-to-472 `(lens, mode) <-> (codon, rotation)` projection living in `portal-core`.
- [[S0-S0i-CLI-CORE]] - `docs/specs/S/S0-S0i-CLI-CORE.md`, "Current State", "Kernel / QL Meta-Layer", "Reflected M0' / M1' Contract". This is the authority that S0/S0' is the executable kernel/CLI/lib ground and the upstream profile contract for graph, torus, clock, Nara, and Epii surfaces.
- [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]] - `docs/plans/2026-05-19-kernel-mprime-harmonic-clock-integration-plan.md`, "Current Implementation Baseline", "Tranche Order". This is supporting execution context for current profile fields and prior tranche sequencing.
- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, section 4 "The kernel-bridge foundational extension", section 8.1 "Shared kernel-bridge instance", section 11 "Phase-1 implementation tranches", section 12 "Success criteria". This is supporting M5-3 consumer context, not a substitute for this S0/M5-2 track.

Current implementation surfaces observed for this plan:

- `Body/S/S0/epi-lib/include/pointer_web.h`, `Body/S/S0/epi-lib/src/pointer_web.c`, `Body/S/S0/epi-lib/test/infrastructure/test_pointer_web.c`
- `Body/S/S0/portal-core/src/kernel.rs`, `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs`, `Body/S/S0/portal-core/src/codon_rotation_projection.rs`, `Body/S/S0/portal-core/src/events.rs`, `Body/S/S0/portal-core/src/nara_journal.rs`, `Body/S/S0/portal-core/src/personal_identity.rs`
- `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs`, `Body/S/S0/epi-cli/src/ffi/mod.rs`, `Body/S/S0/epi-cli/schemas/src/coordinate.ts`
- `Body/S/S0/portal-core/tests/m_prime_shared_contracts.rs`, `Body/S/S0/portal-core/tests/vimarsha_reading.rs`, `Body/S/S0/epi-cli/tests/pointer_web_ffi_contract.rs`, `Body/S/S0/epi-cli/tests/gate_spacetimedb_bridge.rs`

## Task Body

5. **Tranche 4 - SpaceTimeDB Projection And Resync Bridge**

   Deliverables:

   - Extend `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` or its successor bridge module so native SpaceTimeDB WebSocket subscriptions can carry kernel/profile/session projection updates needed by `kernel-bridge`.
   - Preserve HTTP SQL polling fallback while making native WebSocket mode the preferred path where configured.
   - Define the table/subscription set for lite mode and full mode: current profile/world clock/session surface for lite; profile, presence, shared archetype/coincidence events, kernel traces, temporal context, and observability events for full.
   - Add resync semantics: connection lost, reconnecting, stale profile, resynced profile generation, and degraded-but-subscribable states.
   - Surface bridge readiness as capability facts rather than a single boolean.

   Verification:

   - Tests run against a real local gateway test service and a real local SpaceTimeDB dev instance or repository-provided integration harness that exercises reducer calls and WebSocket subscription frames.
   - Native WebSocket tests prove profile/session updates hydrate the same temporal context shape as HTTP fallback.
   - Reconnection tests prove stale state is marked, subscribers are not silently fed old profile generations as current, and resync emits a new generation.
   - Privacy tests prove SpaceTimeDB public projection does not hydrate protected profile hash detail, protected layer masks, raw Nara bodies, or private identity data.

## Track Open Decisions

- **Bridge host boundary:** Should the long-lived shared bridge instance be owned by Theia, by the Tauri Rust process, or by a Tauri service with Theia and `/body` adapters? The canon says foundational Theia extension, while section 5.4 requires the 0/1 surface and IDE to share one instance in the same Tauri app process.
- **Theia deployment shape:** The Theia browser-mode-in-Tauri-webview prototype must confirm whether the bridge can run entirely in webview JS or needs a local service/process boundary.
- **Profile versioning:** The specs name the profile fields but do not yet define a formal schema version, migration policy, or compatibility window for `binary` vs future `mahamaya` naming.
- **S2/S3 anchor timing:** `pointerAnchor` has an S0 current shape, while final certification and `depositionAnchor` depend on S2/S3. The implementation must decide whether these are nullable fields, readiness-blocked fields, or separate anchor sub-objects.
- **SpaceTimeDB schema source:** The exact table names and reducer contracts for profile/world-clock/presence/shared-archetype/coincidence/kernel-trace streams are referenced in canon, but this track still needs the definitive SpaceTimeDB schema source before implementation.
- **Audio bus ownership wording:** Current specs say the kernel exposes profile fields and that M2-1' Vimarsha reading produces `audio_octet`/`nodal_quartet`, while current `portal-core` houses the Vimarsha function. The engineering boundary should be documented as "S0/portal-core implementation of the M2-1' reading function" or moved if another track owns it.
- **Cymatic field derivation in bridge:** The Theia plan suggests the bridge derives cymatic field state from audio bus and personal/cosmic inputs. S0 boundaries say S0 does not own UI rendering or audio synthesis except through harmonic metadata. Decide whether bridge emits raw inputs only or a typed derived cymatic-state contract owned by M2/M4.
- **Capability auth:** The exact auth model for M5-4 agent bridge capabilities is not settled. The bridge needs method-level allowlists, privacy checks, and session lineage before agents can use it operationally.
- **Real integration harness:** The plan requires real local gateway/SpaceTimeDB integration tests. If the repo lacks a reproducible dev harness, create that harness before claiming native projection readiness.

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
