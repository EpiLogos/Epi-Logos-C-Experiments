# Track 05 - Tauri IDE Shell And Pratibimba System

This track turns M5-3 into the single M' desktop instrument: the existing lightweight `/body` Tauri 0/1 surface remains the daily-use shell, while `/pratibimba/system` becomes the deep Theia IDE surface summoned inside the same app. It consumes the S0/S2/S3/S5 foundation through the shared kernel-bridge and extends the existing Theia plan into production implementation tranches rather than restarting the architecture.

## Goal

Build the production M5-3 Tauri/Theia application layer:

- Compose the current `Body/M/epi-tauri` daily-driver surface and the new `/pratibimba/system` Theia workbench into one Tauri v2 application distribution.
- Preserve the canonical two-surface rhythm: `/body` loads first as the lean 0/1 free-flow shell; `/pratibimba/system` lazy-loads on demand as the deep IDE surface.
- Implement Theia IDE chrome for M0/M5: Bimba graph viewer, Canon Studio, Agentic Control Room, Bimba coordinate tree, Logos Atelier, command/omni integration, review/autoresearch visibility, and evidence panes.
- Provide the Theia-side adapter for the shared `kernel-bridge` contract defined by Track 01, with real S0 profile, S2 graph, S3 SpaceTimeDB/gateway, and S5 review/autoresearch consumption.
- Define and sequence the 6 individual M-extension workbench contributions plus the integrated 1-2-3 and 4/5/0 plugin surfaces without letting them bypass backend authority, privacy boundaries, or review gates.
- Resolve the architectural prototype questions that the existing Theia plan left open: Theia browser-mode versus Electron/local-server, single versus multi-webview, and bridge ownership between Tauri and Theia.

This plan does not implement `/Body` code. It describes the future implementation path and names the real verification that must be satisfied before the M5-3 shell is considered production-ready.

## Source Specs

- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, especially section 1 "Architectural commitments", section 3 "The `/pratibimba/system/` directory structure", section 4 "The kernel-bridge foundational extension", section 5 "The ide-shell-m0-m5 extension", section 8 "The 0/1 <-> IDE bridging", section 9 "Build pipeline", section 10 "Open architectural questions", section 11 "Initial tranche specification", and section 12 "Success criteria". Track 05 folds this plan in and supersedes section 11's proof-of-concept tranches with production tranches.
- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, section 2 "Code organisation: /body and /pratibimba/system", section 3 "The single-Tauri-app two-surface model", section 4 "Theia as IDE shell + the 6 + 2 plugin-app architecture", section 5 "The kernel-bridge foundational extension", section 8 "Implementation milestones", and section 9 "Open implementation questions". This is the authority for one Tauri app, two surfaces, Theia as the deep IDE, M0/M5 IDE chrome, 6+2 extension/plugin shape, and kernel-bridge as M5-2 access point.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "Canonical 0/1/4+2 Layout Discipline", "The Shell 0/1 Split IS the (0/1) Inversionary Parent", "Minimum Live Loop", "Diatonic CF / VAK Projection", "The K2 Topology as the Shared Substrate", "Required Shared MathemeHarmonicProfile", and "Neo4j / Graphiti Boundary". This is the authority that M' surfaces share one profile, topology, VAK projection, and graph/memory boundary rather than widget-local interpretations.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "Two-Layer Page Architecture", "Preserve From Electron", "Replace From Electron", "OmniPanel As `/`", "VAK / Anima / Epii Execution Surface", "Port Architecture", "Harmonic Profile Architecture Amendment", "Graphiti And S2 Graph Boundary", "Current-State Gap Table", and "Testing Contract". This is the authority for current `Body/M/epi-tauri` reuse, Tauri command/event boundaries, typed renderer clients, OmniPanel parity, and mock-free desktop tests.
- [[M'-PORTAL-SPEC]] - `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`, "Harmonic / Musical Surface Law", "Shared Runtime Law", "`/` Surface", "`0` Surface", "`1` Surface", "M5' Epii Surface", "Agentic Execution / Inbox", and "Implementation Rule". This is the authority that desktop and TUI mirror logical contracts, not widgets, and that `/` dispatches CLI/gateway/typed service calls instead of forking backend behavior.
- [[M5'-SPEC]] - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, "Sixfold IDE Surface", "Graph Namespace Model", "Surface Philosophy: The Agentic IDE as Conversational Engagement", "User-Facing Surface", "Backend Contract Consumed", "Required MathemeHarmonicProfile Fields", "Relationship To Portal 0/1 And The 4+2 Layer", and "Readiness / Test Criteria". This is the authority for M5-2/S-stack, M5-3/Tauri-Theia, M5-4/agentic mediation, graph namespaces, review evidence, human gates, and Theia kernel-bridge readiness.
- [[01-kernel-bridge-and-s0-foundation]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`, "Architectural Keystones", Tranches 5-8, "Dependencies", and "Open Decisions". Track 05 depends on the shared TypeScript contract, lite/full bridge modes, real `MathemeHarmonicProfile`, readiness taxonomy, bridge capabilities, and bridge-host decision path.
- [[02-s2-bimba-map-population]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`, Tranches T7-T9 and "Success Criteria". Track 05 depends on S2 graph payloads, pointer anchors, namespace-aware graph access, Anuttara fields, GDS overlay readiness, and real S2 response fixtures.
- [[03-s3-gateway-and-spacetimedb]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`, Tranches 1-5, "Open Decisions", and "Success Criteria". Track 05 depends on the gateway/WebSocket stream contract, native SpaceTimeDB subscriptions, `world_clock`, `pratibimba_presence`, shared archetype/coincidence rows, DAY/NOW/session/deposition anchors, and reconnect/resync semantics.
- [[04-s5-autoresearch-and-review-extension]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`, Tranches 6-9, "Dependencies", and "Success Criteria". Track 05 depends on real S5 review/autoresearch DTOs, route queues, agent-access snapshots, review gates, dry-run promotion plans, and M5-3 IDE/workbench contract surfaces.

Current implementation surface observed for this plan:

- `Body/M/epi-tauri/package.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, and `src-tauri/tauri.conf.json` define the existing React/Vite/Tauri v2 app and one-window `frontendDist` build shape.
- `Body/M/epi-tauri/src/shell/Shell.tsx`, `src/components/OmniPanel.tsx`, `src/components/CommandPalette.tsx`, and `src/stores/uiStore.ts` already provide a lightweight shell, hotkeys, workspace selection, OmniPanel, command palette, and an MPrime workspace entry.
- `Body/M/epi-tauri/src/services/types.ts`, `kernelProjection.ts`, `kernelProfileObservation.ts`, `gatewayClient.ts`, `temporalClient.ts`, `graphClient.ts`, `epiiClient.ts`, and `agentExecutionClient.ts` are the current typed-client footholds for profile, S2/S3/S5, and agent surfaces.
- `Body/M/epi-tauri/src-tauri/src/lib.rs`, `commands/*`, `events.rs`, `gateway`, `graph`, `temporal`, `vault`, `agents`, `atelier`, and `library` show the current Tauri command/event authority surface.
- `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` still treats native SpaceTimeDB WebSocket mode as a stub and logs fallback to polling; Track 05 must depend on Track 03 before claiming native live projection readiness.
- `Body/M/epi-tauri/src/domains/M5_Epii/EpiiDashboard.tsx` and `src/domains/MPrime_Subsystems/MPrimeSubsystemPage.tsx` already move toward conversational M5 and 4+2 profile-grounded surfaces, but they are not a Theia IDE shell.

## Architectural Keystones

- **One Tauri App, Two Runtime Surfaces:** `/body` stays the first-load daily shell and `/pratibimba/system` becomes the lazy-loaded deep IDE. The final user artifact is one Tauri app, not a separate Theia product installed beside the daily surface.
- **Prototype-Gated Theia Embedding:** Do not assume Theia browser-mode inside Tauri works until proven. The implementation must test browser-mode-in-webview, local-server-in-webview, and Electron-sidecar fallback explicitly, then record the decision.
- **Multi-Surface State Identity:** The 0/1 surface, IDE surface, OmniPanel, menubar/tray mode, and deep links must preserve the same session key, DAY/NOW context, kernel profile generation, review notifications, and bridge connection state.
- **Bridge Host Abstraction:** The Theia plan names `kernel-bridge` as first-loaded Theia extension, while Track 01 and the canon require the 0/1 surface to share the same bridge instance. Track 05 must implement against a stable bridge-host boundary so the final host may be Tauri-owned, Theia-owned, or hybrid without changing downstream extension APIs.
- **Theia-Native IDE Chrome:** M0 and M5 are part of IDE chrome, not ordinary optional plugins. Bimba graph viewer, Canon Studio, Agentic Control Room, coordinate tree, Logos Atelier, and evidence/review panes should be always available in the workbench shell.
- **Backend Contracts Over Renderer Logic:** Theia extensions and `/body` clients consume S0 profile, S2 graph, S3 stream, and S5 review/autoresearch contracts. They must not compute tick, codon, pointer law, graph relation law, ontology inference, SpaceTimeDB temporal truth, review state, or promotion authority locally.
- **6+2 Extension Composition:** Six individual M extensions provide focused subsystem workspaces; two integrated plugins compose 1-2-3 and 4/5/0 surfaces. Integrated plugins compose real services and extension contributions, not duplicated copies of subsystem logic.
- **Agentic Control Room As M5-4 Window:** IDE chrome must expose VAK evaluation, bounded Anima/Aletheia/Pi/Sophia routing, run evidence, tool streams, diagnostics, review inbox, dry-run promotion plans, and continuation/rejection controls over real S5 state.
- **Namespace And Privacy Boundaries:** Bimba, gnosis, etymology, and protected reviewed pratibimba handles remain separate graph namespaces. Graphiti/Nara bodies do not enter S2, SpaceTimeDB, or public IDE state; Theia receives handles, summaries, readiness, and governed review views.
- **Mock-Free Readiness:** Tests may use fixtures captured from real local services for fast UI tests, but readiness requires live Theia/Tauri/kernel-bridge/S3/S5 paths. Placeholder panels, fake review counts, synthetic graph data, and mocked SpaceTimeDB frames do not satisfy this track.
- **Existing Theia Plan Fold-In:** Track 05 supersedes [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] section 11 as follows: T0-T2 replace Tranche 1.1, T3 consumes Tranche 1.2, T4-T5 consume Tranches 1.3-1.4, T6 consumes Tranche 1.5 as a contribution-registry slice, T7 consumes sections 6-7 integrated plugin planning, and T9 replaces Tranche 1.6 with an end-to-end release gate.

## Tranches

1. **T0 - Runtime Baseline, Decision Harness, And Contract Map.**

   Deliverables:

   - Inventory current `Body/M/epi-tauri` build, command/event, service-client, hotkey, workspace, M5, and MPrime subsystem surfaces without changing behavior.
   - Create the implementation ADR set for the three unresolved choices: Theia browser-mode versus local-server/Electron fallback, single versus multi-webview, and bridge ownership.
   - Map the existing Theia plan tranches to Track 01-04 dependency gates and identify which work can start before live S0/S2/S3/S5 contracts are complete.
   - Define the local development topology for M5-3 tests: Tauri app, Theia dev server or bundled Theia app, local gateway, local SpaceTimeDB, local Neo4j/Redis, and S5 persisted test stores.

   Verification:

   - `pnpm --dir Body/M/epi-tauri test` passes against the current renderer tests before M5-3 changes begin.
   - `cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml` passes or records existing failures with owners before M5-3 changes begin.
   - ADRs name the selected prototype commands, ports, CSP requirements, service dependencies, and pass/fail criteria before any Theia embedding code is merged.
   - No Theia tranche is marked unblocked unless its Track 01-04 dependency contract is either implemented or represented as an explicit readiness-blocked state.

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

3. **T2 - Tauri Composition Prototype And Runtime Decision Gate.**

   Deliverables:

   - Extend the Tauri composition prototype so one app can load the existing `/body` surface and the `/pratibimba/system` Theia surface from the same runtime envelope.
   - Test browser-mode Theia loaded directly from bundled assets in a Tauri webview, including workers, IndexedDB, CSP, asset URLs, file access constraints, and extension-host behavior.
   - Test local-server Theia loaded through Tauri webview as a fallback, with deterministic port allocation, health checks, shutdown, and security review.
   - Test Theia Electron sidecar only as a last-resort fallback and document the user-experience and process-boundary costs if selected.
   - Test single-webview navigation and multi-webview/window persistence against the one-app law and decide which path will carry production implementation.

   Verification:

   - A Tauri integration test launches the app, lands on `/body`, opens the IDE surface through a command, and asserts the real Theia workbench becomes interactive.
   - The same test asserts `/body` state is preserved or intentionally persisted/restored according to the selected single/multi-webview decision.
   - CSP tests prove Theia assets, workers, WebSocket connections, and IPC calls are allowed only for the selected local endpoints.
   - The prototype records memory/process count, cold-open time, warm-open time, shutdown behavior, and bridge connection identity for each tested embedding mode.

4. **T3 - Shared Kernel-Bridge Adapter For Theia And `/body` (gated by Track 01 Tranches 5-7 and Track 03 Tranches 1-5).**

   Deliverables:

   - Implement the M5-3 side of the `kernel-bridge` contract: a Theia-native extension contribution plus a Tauri `/body` adapter over the same bridge-host decision from T0-T2.
   - Consume the Track 01 TypeScript contract for profile, readiness, connection status, subscription mode, gateway RPC envelope, capability manifest, and observability events.
   - Wire lite mode for `/body` and full mode for Theia without opening duplicate S3/SpaceTimeDB subscriptions for each consumer.
   - Expose Theia DI symbols or services for `MathemeHarmonicProfile`, `world_clock`, `pratibimba_presence`, shared archetype/coincidence events, graph/query handles, S5 review/autoresearch DTOs, connection state, and bounded gateway RPC.
   - Add bridge status UI in Theia status bar and `/` readiness panel with stale, reconnecting, degraded, protocol-mismatch, private-blocked, pending-LUT, and ready states.

   Verification:

   - A real local S0/S3 path produces a profile generation consumed by `/body` and a Theia test extension, and both report the same generation, privacy class, and staleness metadata.
   - A real local SpaceTimeDB/gateway subscription updates `world_clock` or `KairosSurface` and reaches the bridge adapter without HTTP polling being silently substituted for native mode.
   - Reconnection tests stop and restart gateway or SpaceTimeDB and prove `/body` and Theia receive disconnected, reconnecting, resynced, and latest-generation events in order.
   - Capability tests reject unauthorized gateway method names and protected-private payloads before dispatch from either `/body` or Theia.

5. **T4 - M0/M5 IDE Shell Chrome And Evidence Workbench (gated by Track 02 T7-T8 and Track 04 T7).**

   Deliverables:

   - Build the Theia `ide-shell-m0-m5` extension with first-class chrome contributions for Bimba graph viewer, Canon Studio, Agentic Control Room, Bimba coordinate tree, Logos Atelier, evidence panel, and review/autoresearch panes.
   - Bimba graph viewer consumes S2 graph payloads, namespace labels, pointer anchors, source/spec/code/test anchors, and optional GDS overlay readiness; it does not construct coordinate trees locally.
   - Canon Studio opens real vault/repo markdown files through governed S1/vault/file contracts and adds QL/bimba-coordinate decorations without forking file authority.
   - Agentic Control Room consumes S5 review/autoresearch DTOs, VAK profile fields, bridge capabilities, gateway method metadata, run evidence, task lineage, and dry-run promotion plans.
   - Logos Atelier opens the etymology namespace and staged exploration workflow as a Theia workspace contribution, while preserving the M5' rule that conversation precedes graph/lens sedimentation.

   Verification:

   - Theia UI tests open a real S2-backed Bimba graph node and verify namespace, pointer anchor, source/spec/code/test anchors, and GDS readiness are rendered from S2 responses.
   - Canon Studio tests open, edit, save, and reload a temp vault markdown file through the same file/vault command path used by production, with no direct renderer filesystem shortcut.
   - Agentic Control Room tests read a real S5 persisted snapshot with active candidate, review item, route queue, and dry-run promotion plan; fake counts or hardcoded panels fail the test.
   - Privacy tests prove protected Nara/Graphiti bodies are absent from graph, evidence, review, and Atelier views unless a governed review capability explicitly opens a protected view.

6. **T5 - OmniPanel, Menubar, Deep-Link, And Cross-Surface Lifecycle.**

   Deliverables:

   - Promote the current renderer-local OmniPanel into the canonical desktop `/` command membrane that can summon Theia, route commands across surfaces, and show readiness from the shared bridge.
   - Implement native global shortcut and tray/menubar lifecycle using Tauri plugins selected during T2, with explicit behavior for close IDE, hide `/body`, sleep to tray, resume, and quit.
   - Implement deep-link routing such as `epi-logos://ide/m4-nara/context?...`, `epi-logos://ide/review/...`, and `epi-logos://body/journal/...` through Tauri into Theia or `/body`.
   - Preserve pending review notifications, active session, DAY/NOW, bridge generation, and selected coordinate across surface switches.
   - Add cross-surface command routing for "open IDE", "open review item", "open graph node", "open Canon Studio file", "start journal entry", and "deposit review evidence".

   Verification:

   - Tauri e2e tests use the real app to open `/body`, summon Theia from OmniPanel, close Theia, resume `/body`, and prove session/profile/review state remains coherent.
   - Deep-link tests send real URL-scheme events and assert the target Theia contribution opens with the correct graph/review/file/session context.
   - Tray/menubar tests assert hiding and restoring windows does not spawn duplicate bridge subscriptions or lose review notifications.
   - OmniPanel parity tests call gateway/session/readiness methods through the same typed service clients used by `/body` and Theia, not separate command shims.

7. **T6 - Six Individual M Extension Contribution Registry (staged by backend readiness).**

   Deliverables:

   - Create the in-tree extension packages `m0-anuttara`, `m1-paramasiva`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, and `m5-epii` with shared contribution interfaces, activation dependencies, readiness gates, and bridge service imports.
   - Implement a first real contribution for each extension using backend data available at that time: M0 graph/OWL readiness, M1 relation walk/profile movement, M2 resonance72/elements/planetaryChakral, M3 codon-rotation/profile transcription, M4 protected handle/resonance summary, and M5 S5 review/autoresearch state.
   - Add extension-level readiness UI that explains blocked dependencies from S0/S2/S3/S5 rather than rendering placeholder dashboards.
   - Define how individual extensions yield or switch to inspector mode when composed by integrated 1-2-3 or 4/5/0 plugins.
   - Keep each extension Theia-native unless a documented VS Code Extension API dependency justifies an exception.

   Verification:

   - Theia extension activation tests prove each M extension activates only when its declared dependencies are present and fails closed with a typed readiness blocker otherwise.
   - Contract tests prove no M extension imports private clock/codon/planetary/tarot/graph constants to compute backend law locally.
   - UI tests for each first contribution render data from real S0/S2/S3/S5 payloads or captured fixtures generated by those real services; handcrafted demo payloads are rejected.
   - Composition tests prove individual extensions can be loaded together without duplicate bridge subscriptions, command collisions, or namespace leakage.

8. **T7 - Integrated 1-2-3 And 4/5/0 Plugin Surfaces.**

   Deliverables:

   - Build `plugin-integrated-1-2-3` as a Theia contribution that composes M1, M2, and M3 into the live cosmic-engine surface described by the canon, driven by the same profile tick, S2 relation law, S3 world clock, and bridge stream.
   - Build `plugin-integrated-4-5-0` as a Theia contribution that composes M4, M5, and M0 into the protected user-experience integration surface: personal field handles, canonical Bimba backdrop, BEDROCK link, activity-resonance traces, review state, and Logos Atelier context.
   - Implement layout choreography so integrated plugins compose individual extension services and views rather than copying their data-fetching or rendering authority.
   - Add explicit privacy gates for the 4/5/0 surface so protected personal-field foreground data remains local/protected and shared state carries only safe handles or reviewed summaries.
   - Surface the unresolved `137 = 64 + 72 + 1` M0/M1 `+1` wording as a canon-review question, not as a silently harmonized UI claim.

   Verification:

   - The 1-2-3 surface test drives a real profile tick change and verifies M1 movement, M2 resonance/correspondence, and M3 codon-rotation views update from the same generation.
   - The 4/5/0 surface test renders canonical Bimba context plus protected Pratibimba handles and proves raw personal field bodies, journal bodies, and Graphiti episode text are absent.
   - Integrated-plugin tests prove composed views share one bridge subscription and one selected coordinate/session state.
   - Review evidence tests prove recognition claims link to source specs, profile generation, S2/S3 anchors, and S5 review state before any canon-promotion affordance appears.

9. **T8 - Agentic Run, Review, And Autoresearch E2E In The IDE (gated by Track 04 T8-T9).**

   Deliverables:

   - Implement the M5-4 Agentic Control Room flow inside Theia: VAK evaluation fields, route/actor selection, bounded tool/capability display, payload assembly, run tree, tool stream, diagnostics, abort/retry/continue, evidence deposition, and review decision controls.
   - Connect Theia task/file/graph/review selections to S5 candidate, route, review, and dry-run promotion DTOs through gateway methods.
   - Preserve human-required, recursive, deployment, and user-final validation gates in UI and command affordances; agents may defer but not approve/reject/revise human-required states.
   - Add run evidence linking changed artifacts, source/spec/code/test anchors, profile generation, bridge readiness, test output handles, and review ids.
   - Provide a controlled path for future agent implementation work to return patch/evidence artifacts into Epii review without making Theia or OpenVSCode sidecars a competing source of truth.

   Verification:

   - A full IDE test surfaces a real S5 improvement candidate, routes it, opens it in Agentic Control Room, attaches a real graph/file/source context, records evidence, and submits a governed review transition.
   - Human-gate tests prove the UI and gateway path block agent approval/rejection/revision for human-required review items.
   - Run-tree tests consume real gateway/tool-stream events or repository-provided live event harness output, not mocked in-memory events.
   - Evidence tests prove source file refs, graph refs, review refs, test output refs, profile generation, DAY/NOW, session key, and bridge readiness survive reload.

10. **T9 - Full One-App Acceptance, Release Gate, And Replan.**

    Deliverables:

    - Add a repeatable acceptance harness that starts the required local services, launches the Tauri app, opens `/body`, summons `/pratibimba/system`, exercises the bridge, opens graph/canon/review/agent surfaces, and shuts down cleanly.
    - Produce an operator runbook for development, CI, local service setup, Theia build, Tauri bundle, bridge readiness, native SpaceTimeDB lane, graph lane, S5 persisted-store lane, and privacy audit.
    - Record the selected Theia embedding mode, webview strategy, bridge ownership, extension host model, and fallback policies as committed architecture decisions.
    - Identify phase-2 work for deeper M extension rendering, mobile/future browser deployments, external plugin publishing, and hosted/shared IDE sessions.

    Verification:

    - The acceptance harness proves one profile generation flows from S0/S3 into the bridge and is visible in `/body`, Theia chrome, an M extension, and Agentic Control Room.
    - A live S2 graph node opens in the Theia Bimba graph viewer with namespace and pointer/source anchors intact.
    - A live S5 review/autoresearch record opens in Theia, preserves human gates, and records evidence without fake IDs or placeholder state.
    - The Tauri bundle contains or supervises the selected Theia runtime and opens the IDE through OmniPanel/deep-link without installing a second user-facing product.
    - Privacy audit checks Theia/Tauri payloads, SpaceTimeDB rows, graph payloads, logs, and S5 evidence for forbidden raw journal, raw birth data, Graphiti body, private quaternion, and protected profile fields.

## Dependencies

- **Track 01 - S0/kernel bridge:** Track 05 cannot complete T3 or later without the shared profile/bridge contract, lite/full modes, readiness taxonomy, capability manifest, and observability stream. The bridge-host ownership decision must be resolved jointly because Theia wants first-loaded extension semantics while `/body` needs the same live instance.
- **Track 02 - S2 graph:** Bimba graph viewer, coordinate tree, graph namespaces, Anuttara inspector, GDS overlays, source/spec/code/test anchors, and graph-backed agent context require real S2 graph API payloads and captured fixtures from live S2 responses.
- **Track 03 - S3 gateway/SpaceTimeDB:** Tauri/Theia live state depends on gateway WebSocket parity, native SpaceTimeDB subscriptions, subscription lifecycle events, DAY/NOW/session/deposition anchors, world clock, presence, and reconnect/resync semantics.
- **Track 04 - S5 review/autoresearch:** Agentic Control Room, review inbox, spine-state inspector, route queues, dry-run promotion plans, and S5 evidence deposition require real S5 DTOs and gateway-shaped methods.
- **Existing `Body/M/epi-tauri`:** The daily `/body` shell, OmniPanel, typed clients, current M-domain pages, Tauri command modules, and tests are the migration substrate. Track 05 should extend them during implementation, not replace them wholesale.
- **Theia upstream:** The selected Theia release, package manager, Node version, extension-host behavior, and browser-mode compatibility must be verified against current official Theia releases during T1/T2 before committing to build scripts or CSP.
- **Tauri v2 capabilities:** Multi-window/webview, tray/menubar, global shortcut, URL scheme, local asset protocol, CSP, and local-server supervision must be proven in the chosen OS targets before they become architecture assumptions.
- **Privacy and identity policy:** M4/Nara protected-local policy and Graphiti boundaries determine what Theia may display in 4/5/0, review evidence, and agent payloads. Until finalized, Track 05 must render blockers/handles rather than raw protected content.
- **CI/live service lanes:** Production readiness requires local-service test lanes for gateway, SpaceTimeDB, Neo4j/Redis, and S5 persisted stores. Unit tests and captured fixtures are insufficient as final proof.

## Open Decisions

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

## Success Criteria

- The app builds and runs as one Tauri product with `/body` as the default daily shell and `/pratibimba/system` as the summoned Theia IDE surface.
- The selected Theia embedding mode is proven by real Tauri tests, documented as an ADR, and does not rely on an unstated second user-facing app.
- `/body`, OmniPanel, Theia chrome, and at least one M extension consume the same bridge generation, session key, DAY/NOW context, readiness state, and selected coordinate without duplicate live subscriptions.
- The Theia `kernel-bridge` adapter consumes real S0/S3/S5 contracts: `MathemeHarmonicProfile`, native SpaceTimeDB/gateway deltas, connection-state recovery, bounded gateway RPC, S5 review/autoresearch DTOs, and observability events.
- M0/M5 IDE chrome is usable: Bimba graph viewer, Canon Studio, Agentic Control Room, coordinate tree, Logos Atelier, evidence panel, review/autoresearch panes, and command/omni integration all operate over real contracts.
- Six individual M extensions and the integrated 1-2-3 and 4/5/0 plugins are composable Theia contributions with readiness gates, shared bridge consumption, namespace boundaries, and no renderer-local backend law.
- OmniPanel, tray/menubar, global shortcut, deep-link, close/resume, and cross-surface command flows preserve state and do not leak protected data.
- Agentic Control Room proves M5-4 visibility: VAK routing, bounded capabilities, run evidence, diagnostics, review inbox, autoresearch state, dry-run promotion, and human gate enforcement all work over real S5 state.
- Tests include real Theia workbench activation, Tauri launch/summon/deep-link flows, kernel-bridge profile/SpaceTimeDB/gateway subscriptions, S2 graph rendering, S5 review/autoresearch state, privacy audits, and bundle/build checks.
- No readiness claim is accepted from mock-only tests, placeholder panels, fixture-only review state, synthetic graph data, HTTP-polling fallback hidden as native mode, or hardcoded renderer interpretations of S0/S2/S3/S5 authority.
