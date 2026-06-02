# Track 05 - Theia Shell And Pratibimba System

> **Architectural recast (per [[m5-prime-system-shape-and-tauri-ide-canon]] §2-§3 Theia-only revision):** This track now turns M5-3 into the single Theia shell at [[/pratibimba/system]] with two workspace layout modes — 0/1 daily layout + deep IDE layout — switched via Theia's `Layout Restorer` / `Workspace` service inside one process. **Track 06 (`/body` evolution) collapses INTO this track** as the 0/1-layout-build sub-tranche; the existing [[Body/M/epi-tauri]] code is migration source not destination. PRD-01/02/03 are resolved (no Tauri wrapper, no cross-webview question, kernel-bridge is Theia-owned). T0/T1/T2 deliverables simplify accordingly — no Tauri composition prototype, no Theia-in-Tauri-webview verification, no Electron sidecar fallback path. The Theia codebase builds to Electron (canonical desktop, primary distribution) + browser-mode (CI / optional Docker / future shared deployment) from one tree per Theia conventions. **S1 vault reach is filesystem-direct-read + Hen-gateway-write per IOD-19** (no embedded `obsidian-md-vsc` — that earlier borrow was reversed once research surfaced it is an Obsidian-app remote-control shim, not a vault renderer); **Smart Connections semantic-neighbours via `s1'.semantic.*` over Hen `smart_env.rs` per IOD-18**. Kernel-bridge is a first-loaded Theia extension whose backend module connects to the external [[Body/S/S3/gateway]] Rust process via WebSocket/JSON-RPC — language divergence stays at the substrate boundary.

This track turns M5-3 into the single Theia desktop shell: the existing lightweight [[Body/M/epi-tauri]] 0/1 surface code migrates into the 0/1 daily workspace layout *inside* the Theia shell at [[/pratibimba/system]]; the deep IDE layout carries the M0/M5 IDE chrome and the six M-extensions + two integrated plugins. It consumes the S' kernel + S0/S2/S3/S5 foundation through the kernel-bridge and extends the prior Theia plan into production implementation tranches rather than restarting the architecture.

## Goal

Build the production M5-3 Theia application layer:

- Migrate the current `Body/M/epi-tauri` daily-driver content into the 0/1 daily workspace layout inside the single Theia shell at `/pratibimba/system`, and complete the deep IDE workspace layout in the same Theia process.
- Preserve the canonical two-layout rhythm: the 0/1 daily layout is the first-mounted lean free-flow workspace; the deep IDE layout is the summoned heavy workbench. Both share one Theia DI container, one kernel-bridge subscription, and one selected-coordinate/session state.
- Build the Electron desktop distribution as canonical, with the standard Theia browser bundle retained for CI / optional Docker headless / future shared deployment.
- Implement Theia IDE chrome for M0/M5: Bimba graph viewer, Canon Studio, Agentic Control Room, Bimba coordinate tree, Logos Atelier, command/omni integration, review/autoresearch visibility, and evidence panes.
- Provide the first-loaded `kernel-bridge` Theia extension whose backend module connects to the external `Body/S/S3/gateway` Rust process via WebSocket/JSON-RPC, with real S0 profile, S2 graph, S3 SpaceTimeDB/gateway, and S5 review/autoresearch consumption surfaced through Theia DI.
- Define and sequence the 6 individual M-extension workbench contributions plus the integrated 1-2-3 and 4/5/0 plugin surfaces without letting them bypass backend authority, privacy boundaries, or review gates.
- S1 vault reach: filesystem-direct-read via Theia's FS provider against [[/Idea]]; vault writes routed through Hen via `s1'.vault.*` gateway methods (per IOD-19); Smart Connections semantic-neighbour discovery via `s1'.semantic.*` over Hen `smart_env.rs` (per IOD-18). No embedded `obsidian-md-vsc` — that borrow was reversed.

This plan does not implement `/Body` code as Rust gateway work — that lives in Track 03 and `Body/S/S3/gateway`. It describes the Theia shell implementation path and names the real verification that must be satisfied before the M5-3 shell is considered production-ready.

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

- **One Theia Shell, Two Workspace Layout Modes:** `/pratibimba/system` is one Theia process. The 0/1 daily layout (`daily-0-1.layout`) is the first-mounted lean free-flow workspace; the deep IDE layout (`ide-deep.layout`) is the summoned heavy workbench. Layout switching is intra-process via Theia's `Layout Restorer` / `Workspace` services — not a second app, not a second webview, not a second process.
- **Layout-Mode State Identity:** The 0/1 daily layout, deep IDE layout, OmniPanel, Electron menu/tray/dock, and any OS-level deep links must preserve the same session key, DAY/NOW context, kernel profile generation, review notifications, and bridge connection state. Layout switching is a view change, not a state boundary.
- **Kernel-Bridge Is A First-Loaded Theia Extension:** The kernel-bridge is a single Theia extension loaded before all other M / plugin extensions. Its frontend module publishes `KernelBridgeAPI` through Theia DI; its backend module connects to the external `Body/S/S3/gateway` Rust process via WebSocket/JSON-RPC using Theia's `WebSocketConnectionProvider` / `ConnectionHandler` patterns. There is one bridge instance in the Theia process; both layouts consume it via DI.
- **Theia-Native IDE Chrome:** M0 and M5 are part of IDE chrome, not ordinary optional plugins. Bimba graph viewer, Canon Studio, Agentic Control Room, coordinate tree, Logos Atelier, and evidence/review panes should be always available in the workbench shell.
- **Backend Contracts Over Renderer Logic:** Theia extensions consume S0 profile, S2 graph, S3 stream, and S5 review/autoresearch contracts through the kernel-bridge. They must not compute tick, codon, pointer law, graph relation law, ontology inference, SpaceTimeDB temporal truth, review state, or promotion authority locally.
- **6+2 Extension Composition:** Six individual M extensions provide focused subsystem workspaces; two integrated plugins compose 1-2-3 and 4/5/0 surfaces. Integrated plugins compose real services and extension contributions, not duplicated copies of subsystem logic. Extensions are available across both layouts; the 0/1 layout may surface compact-mode contributions where extensions export them.
- **Agentic Control Room As M5-4 Window:** IDE chrome must expose VAK evaluation, bounded Anima/Aletheia/Pi/Sophia routing, run evidence, tool streams, diagnostics, review inbox, dry-run promotion plans, and continuation/rejection controls over real S5 state. Per IOD-17 the agentic capability matrix is the canonical governance source.
- **Namespace And Privacy Boundaries:** Bimba, gnosis, etymology, and protected reviewed pratibimba handles remain separate graph namespaces. Graphiti/Nara bodies do not enter S2, SpaceTimeDB, or public IDE state; Theia receives handles, summaries, readiness, and governed review views.
- **Mock-Free Readiness:** Tests may use fixtures captured from real local services for fast UI tests, but readiness requires live Theia/kernel-bridge/S3/S5 paths. Placeholder panels, fake review counts, synthetic graph data, and mocked SpaceTimeDB frames do not satisfy this track.
- **Existing Theia Plan Fold-In:** Track 05 fully absorbs [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]]; the prior plan is superseded by this track and the M5'-canon §2-§3 revision. Track 06 (`/body` evolution) is folded into T2 as the 0/1-layout-build sub-tranche.

## Tranches

1. **T0 - Runtime Baseline, Migration Inventory, And Contract Map.**

   Deliverables:

   - Inventory `Body/M/epi-tauri` as migration source: enumerate every React component, store, typed service client, hotkey, workspace definition, M5 page, MPrime subsystem page, OmniPanel/command palette surface, and Tauri Rust command/event module that must be translated into Theia idioms. Record this inventory as a per-file map: `src/services/*.ts` → Theia frontend services; `src/stores/*` → Theia state-store equivalents (Theia preferences / workspace storage / DI-scoped state); `src/domains/M{0..5}_*/*` → contributions inside the matching `m{0..5}-*` Theia extension; `src/components/OmniPanel.tsx` and `src/components/CommandPalette.tsx` → Theia command-membrane contribution; `src-tauri/{commands,gateway,graph,temporal,vault,agents,atelier,clock,library,oracle}/*` → either Theia backend modules (where the logic must stay co-located with the Theia process) or direct gateway-reach (where Track 03's `Body/S/S3/gateway` is the canonical home).
   - Decide and record the Theia version pin against current Theia stable release, Node version, and `@theia/electron` compatibility. Capture the pin in the workspace `package.json` and an ADR.
   - Decide the package manager. The Theia ecosystem leans Yarn workspaces; the existing `Body/M/epi-tauri` uses pnpm. Choose explicitly and record the decision plus migration plan for the imported lockfile content.
   - Plan the Electron-builder configuration: app id, signing, auto-update channel (deferred is acceptable), per-OS targets, file inclusion, and how the Theia browser bundle is reused inside the Electron build.
   - Plan the optional Docker browser-mode build for CI / headless use: Dockerfile structure, port exposure, headless gateway endpoint expectations.
   - Define the local development topology: Theia dev server, external `Body/S/S3/gateway` Rust process, local SpaceTimeDB, local Neo4j/Redis, S5 persisted test stores. Document the startup ordering and the readiness contract Theia uses to confirm each substrate is reachable.
   - Map each downstream tranche to Track 01-04 dependency gates and identify which work can start before live S0/S2/S3/S5 contracts are complete.

   Verification:

   - `pnpm --dir Body/M/epi-tauri test` passes against current renderer tests, capturing the migration baseline.
   - `cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml` passes or records existing failures with owners before migration begins.
   - The migration map enumerates every existing source file with a target Theia location or an explicit "lift to gateway" / "delete" disposition.
   - Theia version pin, package-manager decision, Electron-builder plan, and optional Docker plan are committed as ADRs before T1 begins.
   - No Theia tranche is marked unblocked unless its Track 01-04 dependency contract is either implemented or represented as an explicit readiness-blocked state.

2. **T1 - Theia Application Skeleton And Version Pin.**

   Deliverables:

   - Create the in-tree Theia workspace at `Idea/Pratibimba/System` (served as the `/pratibimba/system` shell) with the structure laid out in canon §2-§3: `theia-app/`, `extensions/`, `shared/`, `docs/`, `scripts/`, using the package manager chosen in T0.
   - Configure dual build targets in the same tree: an Electron-app target (canonical desktop distribution) built via `@theia/electron` + `electron-builder`, and a browser-app target (CI / Docker / optional headless) producing the standard Theia browser bundle.
   - Pin the chosen Theia release in `package.json` for both targets and lock the Node engine.
   - Add a minimal Theia application with real Theia workbench services, workspace state, command registry, layout service, contribution loading, and extension activation smoke tests.
   - Set up S1 vault reach: Theia's FS provider exposes [[/Idea]] for direct read; a thin `vault-bridge` Theia extension (backend module) holds the gateway client for `s1'.vault.*` write methods and `s1'.semantic.*` read methods (per IOD-18 / IOD-19). No VS Code extension borrow needed for vault reach.
   - Add the first non-placeholder Theia contribution: a diagnostic/readiness view that reads the gateway readiness endpoint (via the future kernel-bridge boundary stubbed at this stage with a typed contract) and displays blocked/ready states.
   - Document the extension naming, dependency, and publishing model for the six individual M extensions and two integrated plugins.

   Verification:

   - The package-manager install command chosen in T0 (`yarn install --frozen-lockfile` or `pnpm install --frozen-lockfile`) is reproducible from a clean checkout of `Idea/Pratibimba/System`.
   - The Electron build target produces a runnable Electron application bundle via `electron-builder` (at least the unpacked directory; signed installers are out of scope for T1).
   - The browser build target produces a real Theia browser bundle deployable via the Theia browser server.
   - The Theia app starts in development (both Electron and browser modes) and activates the readiness contribution through Theia's real DI/contribution system.
   - A Theia browser test verifies the workbench shell, command registry, layout service, and readiness view are live; a static HTML "hello" page is not acceptable.
   - The `vault-bridge` Theia extension activates, exposes Theia FS read against [[/Idea]], and reaches the gateway `s1'.vault.*` + `s1'.semantic.*` surfaces. Direct-FS-write from Theia to the vault is rejected by tests — all writes go through Hen-gateway.

3. **T2 - `Body/M/epi-tauri` Migration Plan And Layout-Mode Skeleton (absorbs Track 06).**

   Deliverables:

   - Execute the migration map from T0: lift every `Body/M/epi-tauri` source file into its destination form inside `Idea/Pratibimba/System`. Concretely:
     - `src/services/*.ts` (`types.ts`, `kernelProjection.ts`, `kernelProfileObservation.ts`, `gatewayClient.ts`, `temporalClient.ts`, `graphClient.ts`, `epiiClient.ts`, `agentExecutionClient.ts`) become Theia frontend services published through DI in the shared layer.
     - `src/stores/uiStore.ts` and sibling stores become Theia state-store equivalents — Theia workspace storage for durable per-workspace state, Theia preferences for cross-session toggles, DI-scoped frontend state for ephemeral UI state.
     - `src/domains/M{0..5}_*/*` and `src/domains/MPrime_Subsystems/*` become contributions inside the matching `m{0..5}-*` Theia extensions (the registry skeletons land in T6; T2 only commits the file moves and import rewrites).
     - `src-tauri/{commands,gateway,graph,temporal,vault,agents,atelier,clock,library,oracle}/*` are either lifted into Theia backend modules (when the logic must remain co-process with Theia — e.g. workspace-local file/vault access) or retired in favour of direct gateway-reach when Track 03's `Body/S/S3/gateway` already provides the authority.
   - Implement the 0/1 daily layout skeleton: a Theia workspace layout descriptor named `daily-0-1.layout` mounted at first launch, carrying the journal contribution, the agent-checkin contribution, a lightweight cymatic placeholder (real engine consumption arrives via Track 12 in T7), and a status display contribution.
   - Implement the deep IDE layout skeleton: workspace layout descriptor `ide-deep.layout` with placeholders for M0/M5 chrome, the omni-panel summon paths, and slots for the six M extensions plus the two integrated plugins.
   - Implement the omni-panel as a Theia contribution wrapping Theia's Command Registry — this is the migration target for the existing `OmniPanel.tsx` and `CommandPalette.tsx`. The omni-panel is callable across both layouts and is the canonical command membrane.
   - Implement layout switching via Theia's `Layout Restorer` / `Workspace` services. Switching preserves the selected-coordinate state, session key, DAY/NOW context, and bridge connection identity.

   Verification:

   - The Theia app launches and mounts the 0/1 daily layout by default. Switching to the deep IDE layout via an omni-panel command produces the deep layout with placeholders.
   - The omni-panel summons commands registered by both layouts; commands registered by the deep IDE layout remain invokable from the 0/1 layout where appropriate (intent routing, not view duplication).
   - Layout switching preserves selected-coordinate state, session key, and bridge connection identity across at least one round-trip (`daily-0-1 → ide-deep → daily-0-1`).
   - The migration map from T0 is exhausted: every `Body/M/epi-tauri` source file is either moved into its Theia destination or marked retired with an explicit reason.
   - The existing `Body/M/epi-tauri` directory is either archived or marked deprecated so that no future work mistakenly extends it.

4. **T3 - Kernel-Bridge Theia Extension (gated by Track 01 Tranches 5-7 and Track 03 Tranches 1-5).**

   Deliverables:

   - Implement the M5-3 side of the `kernel-bridge` contract as a single first-loaded Theia extension comprising a frontend module and a backend module.
   - The backend module connects to the external `Body/S/S3/gateway` Rust process via WebSocket/JSON-RPC, using Theia's `WebSocketConnectionProvider` / `ConnectionHandler` pattern. It is the only Theia-side network consumer of S3; no other Theia extension reaches the gateway directly.
   - The frontend module publishes `KernelBridgeAPI` through Theia DI to downstream extensions: `MathemeHarmonicProfile`, `world_clock`, `pratibimba_presence`, shared archetype/coincidence events, graph/query handles, S5 review/autoresearch DTOs, connection state, observability events, and bounded gateway RPC.
   - Both layout modes (0/1 daily layout and deep IDE layout) consume the same bridge instance via DI — one Theia process, one bridge instance, one subscription source. Lite/full subscription modes remain available but are layout-mode-driven (0/1 layout requests lite mode; deep IDE layout requests full mode) rather than surface- or process-driven.
   - Consume the Track 01 TypeScript contract for profile, readiness, connection status, subscription mode, gateway RPC envelope, capability manifest, and observability events.
   - Add bridge status UI in the Theia status bar and a `/` readiness panel with stale, reconnecting, degraded, protocol-mismatch, private-blocked, pending-LUT, and ready states.

   Verification:

   - A real local S0/S3 path produces a profile generation consumed by the kernel-bridge frontend and visible to a Theia test extension under both layout modes, reporting the same generation, privacy class, and staleness metadata.
   - A real local SpaceTimeDB/gateway subscription updates `world_clock` or `KairosSurface` and reaches the bridge frontend without HTTP polling being silently substituted for native mode.
   - Reconnection tests stop and restart gateway or SpaceTimeDB and prove the bridge surfaces disconnected, reconnecting, resynced, and latest-generation events in order, observable in both layouts.
   - Layout switching between `daily-0-1` and `ide-deep` does not open a second bridge subscription or trigger a resubscribe; the bridge subscription is process-scoped, not layout-scoped.
   - Capability tests reject unauthorized gateway method names and protected-private payloads before dispatch.

5. **T4 - M0/M5 IDE Shell Chrome And Evidence Workbench (gated by Track 02 T7-T8 and Track 04 T7).**

   Deliverables:

   - Build the Theia `ide-shell-m0-m5` extension with first-class chrome contributions for Bimba graph viewer, Canon Studio, Agentic Control Room, Bimba coordinate tree, Logos Atelier, evidence panel, and review/autoresearch panes. The chrome lives in the deep IDE layout (`ide-deep.layout`).
   - Bimba graph viewer consumes S2 graph payloads, namespace labels, pointer anchors, source/spec/code/test anchors, and optional GDS overlay readiness; it does not construct coordinate trees locally.
   - Canon Studio is a Theia-native markdown editor extension that opens real vault/repo markdown files via Theia's FS provider for reads and routes saves through the `vault-bridge` extension's `s1'.vault.write_file` / `s1'.vault.move_file` / `s1'.vault.rename_file` gateway methods (per IOD-19 — Hen mediates wikilink integrity). Adds QL/bimba-coordinate decorations + wikilink autocompletion that merges explicit outlinks with Smart Connections semantic-neighbour suggestions via `s1'.semantic.suggest_links` (per IOD-18). No `obsidian-md-vsc` involved.
   - Agentic Control Room consumes S5 review/autoresearch DTOs, VAK profile fields, bridge capabilities, gateway method metadata, run evidence, task lineage, and dry-run promotion plans. Per Track 11 IOD-17 the agentic capability-matrix governance is the canonical authority for what actors and routes are available.
   - Logos Atelier opens the etymology namespace and staged exploration workflow as a Theia workspace contribution, while preserving the M5' rule that conversation precedes graph/lens sedimentation.

   Verification:

   - Theia UI tests open a real S2-backed Bimba graph node and verify namespace, pointer anchor, source/spec/code/test anchors, and GDS readiness are rendered from S2 responses.
   - Canon Studio tests open, edit, save, and reload a temp vault markdown file through the same file/vault command path used by production, with no direct renderer filesystem shortcut.
   - Agentic Control Room tests read a real S5 persisted snapshot with active candidate, review item, route queue, and dry-run promotion plan; fake counts or hardcoded panels fail the test. The capability matrix exposed in the UI matches IOD-17 governance source-of-truth.
   - Privacy tests prove protected Nara/Graphiti bodies are absent from graph, evidence, review, and Atelier views unless a governed review capability explicitly opens a protected view.

5.5. **T4.5 - Vault-Bridge Theia Extension, Smart Connections Sidebar, And Canon Studio Wikilink Autocompletion (gated by Track 03 T6.5 — `s1'.vault.*` + `s1'.semantic.*` gateway surface).**

   Deliverables:

   - Build a `vault-bridge` Theia extension that provides the frontend-facing API for `s1'.vault.*` (Hen-mediated writes per IOD-19) and `s1'.semantic.*` (Smart Connections via Hen `smart_env.rs` per IOD-18). Its backend module connects to the same external [[Body/S/S3/gateway]] Rust process the kernel-bridge uses; published through Theia DI as `VaultBridgeAPI` and `SemanticBridgeAPI` for downstream consumers (Canon Studio, smart-connections-sidebar, Logos Atelier, m4-nara, agentic control room).
   - Build a `smart-connections-sidebar` Theia frontend contribution that shows semantic-neighbours for the currently focused vault document. Subscribes to active-editor changes; calls `SemanticBridgeAPI.neighborsOf(currentPath, k=20)`; renders typed candidates with cosine score, source/block context, staleness flag, and "open neighbour" action. Lives in the deep IDE layout's right-sidebar by default; available in the 0/1 daily layout as a compact mode.
   - Extend the **Canon Studio** Theia markdown editor extension (introduced in T4) with **wikilink autocompletion** that merges (a) explicit outlinks discovered in the open document via `parse_wikilinks` (Hen reader; consumed through `s1'.vault.read_file`) and (b) semantic-neighbour suggestions via `SemanticBridgeAPI.suggestLinks(currentPath, currentCursor, query)`. UI: typing `[[` opens a popover listing explicit outlinks first (deterministic graph traversal) then semantic candidates (sorted by score with staleness badges); user-selected candidate inserts wikilink text and offers to register the inverse backlink on the target.
   - Route **all Canon Studio saves and renames** through `VaultBridgeAPI.writeFile` / `moveFile` / `renameFile` — NOT through Theia's native FS write. Direct-FS write attempts must be intercepted by the extension and rejected with a typed error pointing the user at the gateway path. Renames atomically update referring `[[X]]` to `[[Y]]` across the vault per Hen's wikilink-integrity reconciliation; the editor surfaces affected files with a confirmation step before commit.
   - Surface staleness in Canon Studio: when the open document's `.smart-env/multi/*.ajson` entry is older than the document's mtime, render a non-intrusive banner ("Semantic index stale — last embedded N minutes/hours ago; suggestions reflect pre-edit state"); offer "open in Obsidian to refresh" as a quick action (deep-link via OS handler, not via the `obsidian-md-vsc` extension which is not loaded).
   - **No `obsidian-md-vsc` involved.** The user's existing Obsidian app continues to run independently for authoring + Smart Connections embedding generation; Theia and Obsidian coexist via the shared vault filesystem.

   Verification:

   - Live integration test with real `vault-bridge` extension + real `[[Body/S/S3/gateway]]` + real fixture vault under [[/Idea]]: rename a file with 5+ inbound wikilinks via Canon Studio; assert all referring wikilinks updated atomically; assert no direct-FS-write occurred (audit via Hen write-ledger or git-tracked mtime comparison).
   - Smart-connections-sidebar test: open a known vault note; assert N semantic neighbours render with cosine scores; assert staleness banner appears when fixture `.smart-env/` is artificially aged; assert protected `pratibimba` candidates are excluded from the response.
   - Canon Studio wikilink-autocompletion test: open a markdown file; type `[[`; assert popover shows explicit outlinks first then semantic candidates; select a semantic candidate; assert wikilink inserted AND a backlink registration prompt fires for the target.
   - Privacy test: protected Nara journal paths excluded from `s1'.semantic.search` results and `vault-bridge`'s default read surface; only governed-protected capability holders see them.
   - No-direct-FS-write test: simulate a Theia attempt to write to `Idea/...` directly; assert the audit lane catches it as an unsanctioned write.

6. **T5 - OmniPanel, Background Lifecycle, And Cross-Layout Intent Routing.**

   Deliverables:

   - Promote the OmniPanel Theia contribution from T2 into the canonical `/` command membrane: it summons commands registered by both layouts, routes intents to the target layout (switching layouts where required), and shows readiness from the shared kernel-bridge.
   - Implement Electron's native menu, tray, and dock integration: explicit behaviors for switching to the deep IDE layout, returning to the 0/1 daily layout, hide to tray, resume from tray, and quit. Use Electron's `Menu`, `Tray`, and `app.dock` APIs through the Theia Electron entry point.
   - Integrate OS-level wake/sleep where the platform exposes it (macOS power-state notifications, Windows power events) so the bridge can mark subscriptions stale during sleep and resync on wake.
   - Define the cross-layout intent envelope: an in-process command payload carrying coordinate + artifact URI + review id + DAY/NOW + session + profile generation + privacy class + requested layout (`daily-0-1` or `ide-deep`) + requested extension/contribution. Intents are routed intra-process via Theia's Command Registry; the requested layout is materialised before the contribution opens.
   - Add cross-layout intent routing for "open deep IDE", "return to daily layout", "open review item", "open graph node", "open Canon Studio file", "start journal entry", and "deposit review evidence".
   - Optionally support an `epi-logos://` OS-level URL scheme for external invocation (e.g. clicking a link in a browser or terminal launches the Theia Electron app and dispatches the intent). This is secondary scope; the primary intent channel is intra-process.
   - Preserve pending review notifications, active session, DAY/NOW, bridge generation, and selected coordinate across layout switches.

   Verification:

   - E2E tests launch the Electron build, mount the 0/1 daily layout, summon the deep IDE layout via OmniPanel, return to the daily layout, and prove session/profile/review state and bridge subscription identity remain coherent.
   - Layout-switch tests assert no duplicate bridge subscription is opened and no review notification is lost.
   - Tray/dock tests assert hide-to-tray + resume preserves bridge connection identity and replays missed gateway events according to Track 03's reconnect/resync contract.
   - OmniPanel parity tests call gateway/session/readiness methods through the kernel-bridge DI services, not separate command shims.
   - If the optional `epi-logos://` URL scheme is implemented, a test sends a real URL-scheme event and asserts the target Theia contribution opens with the correct graph/review/file/session context.

7. **T6 - Six Individual M Extension Contribution Registry (staged by backend readiness).**

   Deliverables:

   - Create the in-tree extension packages `m0-anuttara`, `m1-paramasiva`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, and `m5-epii` with shared contribution interfaces, activation dependencies, readiness gates, and kernel-bridge service imports through Theia DI.
   - Implement a first real contribution for each extension using backend data available at that time: M0 graph/OWL readiness, M1 relation walk/profile movement, M2 resonance72/elements/planetaryChakral, M3 codon-rotation/profile transcription, M4 protected handle/resonance summary, and M5 S5 review/autoresearch state.
   - Extensions are available across both layout modes. Their full workbench contributions are typically engaged in the deep IDE layout; where an extension exports a compact-mode contribution, the 0/1 daily layout may surface it.
   - Add extension-level readiness UI that explains blocked dependencies from S0/S2/S3/S5 rather than rendering placeholder dashboards.
   - Define how individual extensions yield or switch to inspector mode when composed by integrated 1-2-3 or 4/5/0 plugins.
   - Keep each extension Theia-native. No VS Code Extension API borrows currently committed (the earlier `obsidian-md-vsc` exception was reversed per IOD-19); future borrows must justify the dependency through PRD-04.

   Verification:

   - Theia extension activation tests prove each M extension activates only when its declared dependencies are present and fails closed with a typed readiness blocker otherwise.
   - Contract tests prove no M extension imports private clock/codon/planetary/tarot/graph constants to compute backend law locally.
   - UI tests for each first contribution render data from real S0/S2/S3/S5 payloads or captured fixtures generated by those real services; handcrafted demo payloads are rejected.
   - Composition tests prove individual extensions can be loaded together without duplicate bridge subscriptions, command collisions, or namespace leakage.

8. **T7 - Integrated 1-2-3 And 4/5/0 Plugin Surfaces.**

   Deliverables:

   - Build `plugin-integrated-1-2-3` as a Theia contribution that composes M1, M2, and M3 into the live cosmic-engine surface described by the canon, driven by the same profile tick, S2 relation law, S3 world clock, and bridge stream. Cymatic-engine consumption flows from Track 12 (Cymatic Engine Substrate) per §0.2 of the review.
   - Build `plugin-integrated-4-5-0` as a Theia contribution that composes M4, M5, and M0 into the protected user-experience integration surface: personal field handles, canonical Bimba backdrop, BEDROCK link, activity-resonance traces, review state, and Logos Atelier context.
   - Implement layout choreography so integrated plugins compose individual extension services and views rather than copying their data-fetching or rendering authority.
   - Add explicit privacy gates for the 4/5/0 surface so protected personal-field foreground data remains local/protected and shared state carries only safe handles or reviewed summaries.
   - Surface the unresolved `137 = 64 + 72 + 1` M0/M1 `+1` wording as a canon-review question, not as a silently harmonized UI claim.

   Verification:

   - The 1-2-3 surface test drives a real profile tick change and verifies M1 movement, M2 resonance/correspondence, and M3 codon-rotation views update from the same generation.
   - The 4/5/0 surface test renders canonical Bimba context plus protected Pratibimba handles and proves raw personal field bodies, journal bodies, and Graphiti episode text are absent.
   - Integrated-plugin tests prove composed views share one bridge subscription and one selected coordinate/session state.
   - Review evidence tests prove recognition claims link to source specs, profile generation, S2/S3 anchors, and S5 review state before any canon-promotion affordance appears.

9. **T8 - Agentic Run, Review, And Autoresearch E2E In The Deep IDE Layout (gated by Track 04 T8-T9).**

   Deliverables:

   - Implement the M5-4 Agentic Control Room flow inside Theia's deep IDE layout: VAK evaluation fields, route/actor selection, bounded tool/capability display per the IOD-17 capability-matrix governance (test-locked three-way parity between matrix, UI, and gateway), payload assembly, run tree, tool stream, diagnostics, abort/retry/continue, evidence deposition, and review decision controls.
   - Connect Theia task/file/graph/review selections to S5 candidate, route, review, and dry-run promotion DTOs through gateway methods.
   - Preserve human-required, recursive, deployment, and user-final validation gates in UI and command affordances; agents may defer but not approve/reject/revise human-required states.
   - Add run evidence linking changed artifacts, source/spec/code/test anchors, profile generation, bridge readiness, test output handles, and review ids.
   - Provide a controlled path for future agent implementation work to return patch/evidence artifacts into Epii review without making Theia or OpenVSCode sidecars a competing source of truth.

   Verification:

   - A full IDE test surfaces a real S5 improvement candidate, routes it, opens it in Agentic Control Room, attaches a real graph/file/source context, records evidence, and submits a governed review transition.
   - Human-gate tests prove the UI and gateway path block agent approval/rejection/revision for human-required review items.
   - Run-tree tests consume real gateway/tool-stream events or repository-provided live event harness output, not mocked in-memory events.
   - Evidence tests prove source file refs, graph refs, review refs, test output refs, profile generation, DAY/NOW, session key, and bridge readiness survive reload.

10. **T9 - Full Theia-Shell Acceptance, Release Gate, And Replan.**

    Deliverables:

    - Add a repeatable acceptance harness that starts the required local services (external `Body/S/S3/gateway` Rust process, SpaceTimeDB, Neo4j/Redis, S5 persisted stores), launches the Theia Electron build, mounts the 0/1 daily layout, exercises the kernel-bridge, switches to the deep IDE layout, opens graph/canon/review/agent surfaces, switches back to the 0/1 daily layout, and shuts down cleanly.
    - Optionally run the same acceptance against the browser-mode build to confirm CI / Docker headless parity.
    - Produce an operator runbook for development, CI, local service setup, Theia Electron build, Theia browser build, kernel-bridge readiness, native SpaceTimeDB lane, graph lane, S5 persisted-store lane, and privacy audit.
    - Record the resolved architectural decisions (Theia-only shell; Electron canonical + browser-mode optional; kernel-bridge as first-loaded Theia extension; S1 vault reach = filesystem-direct-read + Hen-gateway-write per IOD-19; Smart Connections via Hen `smart_env.rs` per IOD-18; two layouts inside one process) as committed ADRs. Supersede the earlier ADR-05-008 `obsidian-md-vsc` document with a reversal note.
    - Identify phase-2 work for deeper M extension rendering, hosted/shared IDE sessions, mobile/future deployments, and external plugin publishing.

    Verification:

    - The acceptance harness proves one profile generation flows from S0/S3 through the kernel-bridge and is visible in the 0/1 daily layout, the deep IDE layout, an M extension, and the Agentic Control Room — all from the same Theia process, same bridge subscription, same session key.
    - Omni-panel layout switching is exercised end-to-end: 0/1 → deep IDE → 0/1, preserving selected-coordinate state and bridge subscription identity.
    - Kernel-bridge subscription continuity across layout switches is asserted (no resubscribe, no duplicate connection).
    - A live S2 graph node opens in the Theia Bimba graph viewer with namespace and pointer/source anchors intact.
    - A live S5 review/autoresearch record opens in Theia, preserves human gates, and records evidence without fake IDs or placeholder state.
    - The Electron build runs as one user-facing product; no second app is installed. The browser-mode build is optional and gated on CI / Docker scope.
    - Privacy audit checks Theia payloads, SpaceTimeDB rows, graph payloads, logs, and S5 evidence for forbidden raw journal, raw birth data, Graphiti body, private quaternion, and protected profile fields.

## Dependencies

- **Track 01 - S0/kernel bridge:** Track 05 cannot complete T3 or later without the shared profile/bridge contract, lite/full modes, readiness taxonomy, capability manifest, and observability stream. The kernel-bridge is implemented as a first-loaded Theia extension whose backend module is the only Theia-side consumer of the external `Body/S/S3/gateway` Rust process.
- **Track 02 - S2 graph:** Bimba graph viewer, coordinate tree, graph namespaces, Anuttara inspector, GDS overlays, source/spec/code/test anchors, and graph-backed agent context require real S2 graph API payloads and captured fixtures from live S2 responses.
- **Track 03 - S3 gateway/SpaceTimeDB:** Theia live state depends on gateway WebSocket parity, native SpaceTimeDB subscriptions, subscription lifecycle events, DAY/NOW/session/deposition anchors, world clock, presence, and reconnect/resync semantics. The gateway is an external Rust process the kernel-bridge backend module connects to via WebSocket/JSON-RPC.
- **Track 04 - S5 review/autoresearch:** Agentic Control Room, review inbox, spine-state inspector, route queues, dry-run promotion plans, and S5 evidence deposition require real S5 DTOs and gateway-shaped methods.
- **Track 11 - Capability matrix governance (IOD-17):** The agentic capability matrix governs what routes, actors, and tools the Agentic Control Room may expose. Test-locked three-way parity between matrix, UI, and gateway is required by T8.
- **Track 12 - Cymatic Engine Substrate:** The integrated 1-2-3 plugin's cymatic surface consumes Track 12 substrate per §0.2 of the review; T7 depends on Track 12 readiness.
- **`Body/M/epi-tauri` as migration source:** The existing Tauri React app is migration source, not a destination. T2 absorbs the previous Track 06 (`/body` evolution) as the 0/1-layout-build sub-tranche.
- **Theia upstream:** The selected Theia release, package manager, Node version, `@theia/electron` compatibility, `electron-builder` configuration, and browser-mode build behavior must be verified against current official Theia releases during T0/T1 before committing to build scripts.
- **S1 vault reach (no VS Code extension):** Theia's FS provider reads [[/Idea]] directly; vault writes route through Hen via `s1'.vault.*` gateway methods (IOD-19); Smart Connections semantic-neighbour discovery via `s1'.semantic.*` over Hen `smart_env.rs` (IOD-18). The earlier `obsidian-md-vsc` borrow was reversed once research surfaced it as Obsidian-app remote-control rather than a vault renderer.
- **Privacy and identity policy:** M4/Nara protected-local policy and Graphiti boundaries determine what Theia may display in 4/5/0, review evidence, and agent payloads. Until finalized, Track 05 must render blockers/handles rather than raw protected content.
- **CI/live service lanes:** Production readiness requires local-service test lanes for gateway, SpaceTimeDB, Neo4j/Redis, and S5 persisted stores. Unit tests and captured fixtures are insufficient as final proof.

## Open Decisions

- **Theia runtime mode — RESOLVED:** Electron is the canonical desktop distribution (via `@theia/electron` + `electron-builder`). The standard Theia browser bundle is retained for CI / optional Docker headless / future shared deployment. No Tauri wrapper, no webview embedding question.
- **Single versus multi-webview — RESOLVED:** One Theia process, one renderer, two workspace layout modes (`daily-0-1.layout` and `ide-deep.layout`) switched via Theia's `Layout Restorer` / `Workspace` services. No cross-webview state question.
- **Bridge ownership — RESOLVED:** The kernel-bridge is a first-loaded Theia extension. Its backend module is the only Theia-side connection to the external `Body/S/S3/gateway` Rust process; its frontend module publishes `KernelBridgeAPI` through Theia DI to both layouts.
- **Build composition strategy — RESOLVED:** Electron-builder produces the canonical desktop bundle reusing the standard Theia browser bundle inside the Electron renderer. The browser bundle alone is deployable for CI / Docker headless.
- **Extension host model — RESOLVED:** Theia-native throughout. No VS Code Extension API borrows currently committed (the earlier `obsidian-md-vsc` borrow was reversed per IOD-19 once research surfaced it as Obsidian-app remote-control rather than vault renderer). The dual-extension-API capability remains as escape hatch; future borrows must justify the dependency through PRD-04.
- **Theia version pin and update cadence — OPEN:** T0 must verify the current Theia stable release against Node version and `@theia/electron` compatibility, pin in `package.json`, and choose an update cadence.
- **Package manager — OPEN:** Theia convention often favors Yarn workspaces; the migration source `Body/M/epi-tauri` uses pnpm. T0 must decide explicitly for `Idea/Pratibimba/System`.
- **Workspace and state persistence — OPEN:** Decide which state belongs to Theia workspace storage, Theia preferences, S3 session state, S5 review state, S1/vault files, or kernel-bridge cache.
- **IDE terminal and shell access — OPEN:** Theia normally provides terminal/task features; Epi-Logos needs bounded agent/task execution. Decide whether a local terminal is available to users, agents, both, or neither in phase 1.
- **Source of deep M-extension ownership:** Track 05 owns the shell, registry, and first real contribution slices, but deeper M1/M2/M3/M4 subsystem renderers may require follow-on tracks once backend contracts mature.
- **Current source gap:** The source specs define the desired Theia shell and M5' workbench, but deeper M-subsystem renderer specs and SpaceTimeDB table/stream shapes for Theia beyond upstream track contracts remain to be elaborated.

## Success Criteria

- The app builds and runs as one Theia shell with two layout modes inside one Theia process: the 0/1 daily layout (`daily-0-1.layout`) as default first-mounted lean workspace and the deep IDE layout (`ide-deep.layout`) as summoned heavy workbench.
- The Electron build is the canonical desktop distribution; the optional Theia browser bundle is deployable for CI / Docker headless. Both are produced from one tree.
- Both layouts, OmniPanel, Theia chrome, and at least one M extension consume the same kernel-bridge generation, session key, DAY/NOW context, readiness state, and selected coordinate without duplicate live subscriptions.
- The kernel-bridge Theia extension consumes real S0/S3/S5 contracts: `MathemeHarmonicProfile`, native SpaceTimeDB/gateway deltas, connection-state recovery, bounded gateway RPC, S5 review/autoresearch DTOs, and observability events — via WebSocket/JSON-RPC to the external `Body/S/S3/gateway` Rust process.
- M0/M5 IDE chrome is usable in the deep IDE layout: Bimba graph viewer, Canon Studio, Agentic Control Room, coordinate tree, Logos Atelier, evidence panel, review/autoresearch panes, and command/omni integration all operate over real contracts.
- Six individual M extensions and the integrated 1-2-3 and 4/5/0 plugins are composable Theia contributions with readiness gates, shared bridge consumption, namespace boundaries, and no renderer-local backend law. The integrated 1-2-3 plugin consumes Track 12 cymatic substrate.
- OmniPanel, Electron menu/tray/dock, OS wake/sleep handling, optional `epi-logos://` URL scheme, and cross-layout intent routing preserve state and do not leak protected data.
- Agentic Control Room proves M5-4 visibility: VAK routing, bounded capabilities per IOD-17 capability matrix, run evidence, diagnostics, review inbox, autoresearch state, dry-run promotion, and human gate enforcement all work over real S5 state.
- Tests include real Theia workbench activation, Electron launch / layout-switch flows, kernel-bridge profile/SpaceTimeDB/gateway subscriptions, S2 graph rendering, S5 review/autoresearch state, privacy audits, and Electron + browser-bundle build checks.
- No readiness claim is accepted from mock-only tests, placeholder panels, fixture-only review state, synthetic graph data, HTTP-polling fallback hidden as native mode, or hardcoded renderer interpretations of S0/S2/S3/S5 authority.
