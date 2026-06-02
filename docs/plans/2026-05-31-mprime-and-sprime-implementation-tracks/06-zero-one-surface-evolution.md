# Track 06 - Zero/One Daily Layout (collapsed into Track 05)

> **STATUS (2026-06-01):** Tranches **T2-T8 superseded by Track 05 T2** per canon recast — see [[05-tauri-ide-shell-and-pratibimba-system]] preamble and §Architectural Keystones ("Existing Theia Plan Fold-In"). The ledger marks T2-T8 as `done` with evidence pointing at 05.T2 because the helper has no `superseded` status. **T0 and T1 are retained as historical record** — they landed real Tauri-side substrate work before the canon recast and stay `done` with their original evidence.
>
> **COLLAPSED into Track 05 per [[m5-prime-system-shape-and-tauri-ide-canon]] §2-§3 Theia-only revision.** The 0/1 daily surface is no longer a separate Tauri product; it is a **workspace layout mode inside the single Theia shell at [[/pratibimba/system]]**. The deliverables of this track are absorbed into Track 05 as the "0/1 daily layout build" sub-tranche set. The Evolution-Not-Replacement discipline still applies: existing [[Body/M/epi-tauri]] components are migration source into Theia frontend contributions — typed clients become Theia services, M-domain components become contributions in matching M-extensions, Tauri Rust commands either become Theia backend extensions or reach [[Body/S/S3/gateway]] directly. **Read this track as historical context for the Evolution-Not-Replacement discipline + service-client inventory + privacy boundaries; execute the work under Track 05.**

---

The original framing follows (preserved for the catalog of `Body/M/epi-tauri` migration-source items, which Track 05 inherits):

This track evolves the existing `Body/M/epi-tauri` lightweight Tauri 0/1 daily surface into the lite consumer of the M5-2 S/S' stack and the launch surface for `/pratibimba/system`. It is not a greenfield frontend plan and not an IDE duplication plan: keep the useful `/body` shell, services, stores, Tauri commands, and tests, then replace local approximations with shared kernel-bridge, gateway, SpaceTimeDB, S2 graph, Nara, and S5 review contracts as those upstream tracks land.

## Goal

Deliver a production-ready lightweight 0/1 surface inside the same M' Tauri app as the Theia IDE:

- `/body` consumes S0/S2/S3/S5 through lite kernel-bridge and gateway contracts instead of renderer-local clock, graph, review, or agent approximations.
- Shell `0` remains the lean structural/cosmic daily view over shared profile, world clock, selected coordinate, and S2 graph affordance.
- Shell `1` remains the lean personal/world-return daily view over Nara writing, DAY/NOW continuity, lightweight protected-local field affordances, review alerts, and agent check-in.
- The OmniPanel and command palette summon `/pratibimba/system` targets with typed deep-link intents while preserving `/body` as the lightweight daily surface.
- Highlight sendoff, quick agent chat, review alerts, and profile observations deposit into governed S3/S5 paths with DAY/NOW/session/profile lineage and no protected-body leakage.

## Source Specs

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

## Architectural Keystones

- **Evolution, Not Replacement:** Preserve the current Tauri-v2 React shell, split panel model, OmniPanel, command palette, TipTap Nara editor, BimbaMap stubs, Epii conversation surface, typed service clients, Zustand stores, and Tauri command modules. Replace their data seams progressively with shared contracts; do not rewrite `/body` as a new app.
- **Lite Kernel-Bridge Is The Data Organ:** `/body` should subscribe through the same bridge instance as `/pratibimba/system`, but in lite mode. Lite mode includes current profile, world clock, selected coordinate, readiness, review alerts, agent check-in, and safe Nara handles. Full mode belongs to Theia and the M-extension workbench.
- **One Profile, Many Views:** `MathemeHarmonicProfile` is the shared instrument contract. `kernelProjection.ts` can remain as a renderer-safe adapter, but Shell `0`, Shell `1`, OmniPanel, graph affordances, Epii, and Nara must consume one profile generation with one readiness state rather than clock-specific or domain-specific derivations.
- **Gateway/SpaceTimeDB Own Live State:** `Body/M/epi-tauri/src-tauri/src/temporal/spacetime.rs` currently has polling and a native-WebSocket stub. Production evolution must consume Track 03 native subscription deltas and resync states for `world_clock`, `KairosSurface`, `GlobalTemporalSurface`, and session/DAY/NOW projection.
- **S2 Owns Graph Law:** The existing graph clients and `BimbaMap2D/3D` should be kept, but filtered subgraphs, relation families, pointer anchors, GDS overlays, Anuttara syntax, and source/spec/code/test anchors must come from S2/S2' payloads. Renderer namespace colors and glyphs are display choices, not graph authority.
- **Protected-Local By Default:** The 1-side psychoid field, journal bodies, dream bodies, oracle interpretations, and agent chat text remain local/protected unless a governed opt-in publishes derived handles. `/body` may display privacy state and handles; it must not put raw personal field state into SpaceTimeDB, S2, S5, screenshots, or deep-link payloads.
- **Summon, Do Not Embed The IDE:** `/body` deep-links into `/pratibimba/system` with typed intents and shared bridge context. It must not recreate the Theia graph explorer, canon studio, agentic control room, or subsystem plugins in React panels.
- **Intent Envelopes Across Surfaces:** Highlight sendoff, review alert open, coordinate open, oracle open, and agent-check-in continuation should all produce typed intents carrying coordinate, DAY/NOW, session key, profile generation, privacy class, source artifact handle, and target surface. Free-form route strings are compatibility only.
- **Readiness Is Capability, Not Health:** OmniPanel and shell status must distinguish gateway connected, kernel profile usable, S2 graph law available, S3 live stream current, S5 review route available, Graphiti protected-local available, private projection blocked, and pending dataset LUT. Green service dots alone are not production readiness.
- **Real Verification Only:** The release gate requires local gateway, SpaceTimeDB, S2 graph, S5 persisted stores, Tauri commands, renderer clients, and Playwright/Tauri tests exercising real functionality. Hand-authored fixture-only tests, mock servers, placeholder panels, and demo data do not satisfy readiness.

## Tranches

1. **T0 - Baseline characterization and preservation map.**

   Deliverables:

   - Inventory the current `/body` contracts and behavior without changing implementation: `services/types.ts`, `kernelProjection.ts`, `gatewayClient.ts`, `temporalClient.ts`, `graphClient.ts`, `naraClient.ts`, `epiiClient.ts`, `agentExecutionClient.ts`, `stores/*`, `Shell.tsx`, `ClockCosmos.tsx`, `WorkspacePanel.tsx`, `OmniPanel.tsx`, `CommandPalette.tsx`, and `src-tauri/src/{gateway,temporal,events,state,commands}`.
   - Record which current paths are production footholds, compatibility adapters, or placeholders. Initial classification from source reading: `kernelProjection.ts` and typed profile mirrors are footholds; `clockStore` and `clockClient` are compatibility; `spacetime.rs` native WebSocket is incomplete; OmniPanel non-overview panels and HighlightSidebar empty state are placeholders needing real backends.
   - Add or update characterization tests in the future implementation branch before refactors so the current useful shell layout, hotkeys, graph selection, profile projection, Nara editor, Epii conversation surface, and Tauri command registrations cannot regress unnoticed.
   - Define a migration ledger that maps current renderer state to future bridge state: `PortalRuntimeState` -> lite bridge snapshot, `PortalClockState` -> compatibility clock view over profile/world clock, `GraphData` -> S2 filtered subgraph payload, `AgentRunHandle` -> gateway/S5 run lineage.

   Verification:

   - Run `npm run test --prefix Body/M/epi-tauri` and `npm run lint --prefix Body/M/epi-tauri` before any refactor in the implementation branch.
   - Run `cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml` to lock existing Tauri command behavior.
   - Run `npm run test:e2e --prefix Body/M/epi-tauri` against the current app after the local dev server is available.
   - Characterization tests must assert real current behavior, not ideal future behavior and not mocked backend success.

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

3. **T2 - Live S3/SpaceTimeDB runtime stream into the existing Tauri state (gated by Track 03 Tranches 3 and 5).**

   Deliverables:

   - Replace the `SpacetimeMode::NativeWebSocket` stub in `src-tauri/src/temporal/spacetime.rs` with the Track 03 native subscription consumer or a Tauri adapter over the shared S3 stream contract.
   - Extend `PortalRuntimeState` or its successor bridge snapshot to carry `session_surface`, `kairos_surface`, `global_temporal_surface`, `world_clock`, subscription status, schema/protocol version, generation, staleness, and resync markers.
   - Emit typed Tauri events through `events.rs` for runtime delta, resync, stale, protocol mismatch, and fallback-active. Existing `temporal:runtime` can remain as compatibility, but new consumers should use typed bridge events.
   - Update `temporalStore` to treat stale/resync as first-class state and to avoid silently feeding old generations to Shell `0`, Shell `1`, or OmniPanel.
   - Make HTTP SQL polling visible as degraded fallback only; native mode must not log "falling back to polling" and appear green.

   Verification:

   - A live integration test starts local SpaceTimeDB, starts the gateway, opens a Tauri-compatible subscriber, calls the real reducer path for `bind_kairos_surface` or the Track 03 successor, and asserts `/body` receives the delta within the Track 03 100 ms local target.
   - Tauri Rust tests cover reconnect, stale generation, resynced generation, protocol mismatch, and explicit fallback-active transitions using the real S3 subscription decoder and local service harness.
   - Playwright against the running `/body` app verifies the temporal strip and OmniPanel change state from live deltas, not fixture injection.
   - Privacy audit tests scan emitted Tauri events and SpaceTimeDB rows for forbidden fields: raw birth data, journal body, dream body, profile hash preview, layer mask, Graphiti episode body, and private identity data.

4. **T3 - Shell `0` structural/cosmic surface over S0/S2/S3 contracts (gated by Track 01 profile and Track 02 S2 API parity).**

   Deliverables:

   - Migrate `ClockCosmos`, `HopfClock`, and `StrataPanel` to render current tick, phase, `tick12`, `degree720`, helix, ratio, audio/nodal readiness, codon-rotation summary, and CF/VAK labels from the lite bridge profile instead of `PortalClockState` compatibility fields.
   - Evolve `BimbaMap2D.tsx` and `BimbaMap3D.tsx` from whole-graph display to S2 filtered subgraph consumption: active coordinate, N-hop neighbors, relation-family styling, pointer anchor, source/spec/code/test anchors, Anuttara `symbol` / `formulation_type`, GDS tangent overlay readiness, and privacy badges.
   - Preserve the current 2D/3D graph toggles, selected-node overlay, branch lens hotkeys, and Hopf toggle as UX footholds while moving their data sources to S0/S2/S3.
   - Add a composition seam for the unresolved 0-side graph + clock design: co-resident, toggled, or graph-overlaying-clock. Implement the state and test contract so UX can choose without rewiring data authority.
   - Ensure Shell `0` stays lean. Full M0/M1/M2/M3 workspaces and the IDE plugins remain `/pratibimba/system` deep targets summoned by intents.

   Verification:

   - Live S2 tests return a filtered subgraph for a real coordinate and the renderer displays its nodes, relation types, pointer anchor, and Anuttara facts without local graph-law derivation.
   - Renderer tests fail if `ClockCosmos`, `BimbaMap2D/3D`, or graph stores hardcode codon, tarot, planetary, chakral, pointer, or relation-law mapping tables.
   - Playwright against local gateway + SpaceTimeDB + S2 verifies a world-clock tick/profile generation pulses the selected graph/clock state and keeps the same generation visible in OmniPanel.
   - S2 privacy tests prove protected Graphiti/Nara bodies do not enter graph payloads, graph overlays, or Shell `0` DOM text.

5. **T4 - Shell `1` daily Nara surface, highlight sendoff, and protected field readiness (gated by Track 03 temporal handles and Nara artifact contracts).**

   Deliverables:

   - Deepen `NaraDashboard`, `NaraEditor`, `HighlightSidebar`, `vaultClient`, and `naraClient` so daily note, journal entry, highlight, dream, oracle, reminder, and quick agent chat actions create real Nara artifacts under the canonical DAY/NOW store path through Tauri/vault/Nara commands.
   - Replace "No highlights recorded yet" with a real highlight registry driven by persisted artifact metadata and governed sendoff status.
   - Make `naraClient.sendoff()` produce a typed invocation/deposit envelope with selected text, category, source range, modality, coordinate, DAY/NOW, session key, profile generation, privacy class, and target S5/Gateway route. The current shape is a good foothold but must attach review/deposit handles when the backend returns them.
   - Add a lightweight protected field readiness card for Shell `1`: it may show local device capability, profile handle, privacy class, and opt-in audio state, but not raw `q_Nara`, raw field vectors, journal bodies, or shared screenshots.
   - Keep full Nara modality tabs, full psychoid field engine, Graphiti episode browser, and deep temporal trajectory rendering as `/pratibimba/system` or full M4' targets. Shell `1` only starts, previews, and sends off.

   Verification:

   - Tauri command tests write real Nara artifacts into a temp canonical vault layout, validate frontmatter/envelope fields, reload them through `vaultClient`, and assert DAY/NOW/session/profile lineage survives.
   - Playwright creates a journal entry, applies a highlight category, sends it off, and observes a real gateway/S5 deposit handle or explicit backend-unavailable readiness state.
   - Graphiti/S3 integration tests prove a protected-local body stays local while derived handles can appear in SpaceTimeDB/S5 payloads only according to privacy class.
   - Tests prove quick agent chat creates an AgentChat episode handle and S5 review/deposit lineage when the agent route is enabled; no test may satisfy this with a fake chat transcript array.

6. **T5 - Lightweight M5-4 mediation: agent check-in, review alerts, and Epii return (gated by Track 04 Tranches 6-7).**

   Deliverables:

   - Extend `EpiiDashboard`, `EpiiAgent`, `agentExecutionClient`, and `epiiClient` to consume real S5 agent-access snapshots: active review counts, review alerts, pending human validations, routed candidates, latest profile observation, latest safe Nara handle, and unavailable-capability reasons.
   - Add a Shell `1` review alert affordance and OmniPanel review summary that can open a lightweight Epii conversation or summon the full M5' Agentic Control Room in `/pratibimba/system`.
   - Route agent check-in through bounded gateway/S5 methods with VAK envelope fields CPF, CT, CP, CF, CFP, CS when supplied by the execution layer. Agents may defer or request review, but Shell `1` must not expose approve/reject/revise for human-required review gates.
   - Add structured observability intake from Track 01 kernel-bridge events so profile observations and readiness blockers can appear as Epii-reviewable evidence.
   - Keep the M5' full workbench out of `/body`; expose only conversation, alert summary, safe source handles, and summon actions.

   Verification:

   - S5 integration tests use real filesystem-backed S5 stores and gateway-shaped methods to create a review item, read it in `/body`, defer it as an agent where allowed, and prove agent approval/rejection/revision is blocked for human-required gates.
   - Renderer tests prove Epii panels display review counts and source handles from real DTOs and show explicit unavailable state when S5 readiness is blocked.
   - End-to-end test sends a kernel profile observation through the governed deposit route and verifies `/body` receives a typed alert containing profile generation, coordinate anchor, DAY/NOW, and privacy class.
   - Tests reject protected Nara bodies, raw Graphiti episode text, and unrestricted shell commands in Epii/agent payloads.

7. **T6 - Cross-surface summon and deep-link intents into `/pratibimba/system` (gated by the M5-3 Theia host skeleton and Track 01 shared bridge instance).**

   Deliverables:

   - Define a `SurfaceIntent` / `DeepLinkIntent` contract shared by `/body`, Tauri, and `/pratibimba/system`: target surface, extension/plugin id, coordinate, artifact URI, text selection handle, review id, improvement id, DAY/NOW, session key, profile generation, privacy class, and requested action.
   - Add Tauri-side summon commands and events for "open IDE", "open coordinate in M0/M3", "open Nara artifact in M4", "open review alert in M5", "continue agent run", and "open source/spec/code/test anchor". The command must lazy-load or foreground `/pratibimba/system`; it must not render a fake IDE panel inside `/body`.
   - Extend `CommandPalette` and `OmniPanel` commands to emit these typed intents instead of only switching local workspaces. Current local workspace navigation can remain for lightweight M0/M4/M5 previews.
   - Add deep-link emission from highlight sendoff, oracle result, graph coordinate selection, review alert, and Epii source handle.
   - Implement intent acknowledgements: the IDE target must report accepted, rejected, unsupported target, blocked by readiness, or privacy-denied. `/body` should surface that acknowledgement without trying to repair the target locally.

   Verification:

   - A real `/pratibimba/system` dev shell or Theia skeleton receives intents from the running Tauri app and acknowledges them with the same bridge profile generation visible to `/body`.
   - Playwright/Tauri e2e opens `/body`, selects an oracle/highlight/review/coordinate action, summons the IDE target, and asserts the target receives the correct typed payload and no protected body text.
   - Tests prove repeated summons reuse or foreground the IDE host according to the lifecycle contract instead of spawning duplicate bridge subscriptions.
   - This tranche cannot close with a no-op "intent logged" placeholder; it requires a real receiving surface and shared bridge context, even if only the first Theia extension target is implemented.

8. **T7 - Menubar/background lifecycle and shared bridge subscription economy (gated by T6 host decision).**

   Deliverables:

   - Implement the one-app lifecycle from the system-shape canon: `/body` launches first, IDE lazy-loads on summon, `/body` can persist as menubar/background while IDE is open, closing IDE returns to `/body`, and closing the visible shell can sleep the app to menubar if the user chooses.
   - Use one bridge subscription source for `/body` lite mode and IDE full mode. Opening the IDE upgrades subscription capability; closing it downgrades to lite without losing current profile/session generation or leaking subscriptions.
   - Add visible connection/readiness state for background mode, reconnect, degraded fallback, and sleeping/waking.
   - Preserve keyboard and command access: ESC/OmniPanel, command palette, graph/workspace hotkeys, and the chosen global hotkey or tray command should summon the same command membrane.
   - Keep OS integration behind explicit user-facing settings where platform permissions require it.

   Verification:

   - Tauri integration tests or a supported desktop e2e lane verify window create/close/foreground/background events, bridge subscription upgrade/downgrade, and profile generation continuity.
   - Service-level tests prove `/body` and Theia consumers fan out from one shared bridge instance rather than opening independent SpaceTimeDB/gateway subscriptions.
   - Reconnect tests kill and restart gateway/SpaceTimeDB while the app is backgrounded and verify the user sees disconnected, reconnecting, stale, and resynced states in order after wake.
   - Manual OS tray/global-hotkey checks must be recorded for macOS/Windows/Linux until the repo has reliable automated coverage for those desktop affordances.

9. **T8 - End-to-end 0/1 acceptance slice and release gate (gated by T1-T7 plus upstream live-service harnesses).**

   Deliverables:

   - Prove one production-shaped daily flow: start local services, launch `/body`, receive live profile/world-clock/runtime state, render Shell `0` graph/clock summary from S0/S2/S3, create a Shell `1` journal highlight, send it to an agent/review route, receive S5 review alert, and summon `/pratibimba/system` with a typed deep-link intent.
   - Produce a readiness report from OmniPanel that distinguishes green, degraded, blocked, pending-LUT, private-blocked, and backend-unavailable states for kernel, graph, gateway, SpaceTimeDB, Graphiti, S5 review, and IDE host.
   - Add an operator runbook for local development and CI live-test prerequisites: gateway, SpaceTimeDB, S2 Neo4j/Redis, S5 stores, Tauri dev app, and Theia host.
   - Document the migration path from `clockStore`/`PortalClockState`/local workspace switches to bridge snapshots and deep-link intents.

   Verification:

   - E2E starts the real local service stack and asserts the same profile generation and privacy class across S0/S0' output, gateway/SpaceTimeDB projection, `/body` lite bridge consumer, S2 graph payload, S5 deposit, and `/pratibimba/system` intent receiver.
   - E2E proves renderer code does not compute tick, codon, pointer, graph relation, or review state independently by comparing visible values against S0/S2/S3/S5 payloads.
   - Privacy audit searches Tauri events, SpaceTimeDB rows, S2 payloads, S5 DTOs, deep-link intents, and DOM text for forbidden protected-body fields.
   - Final release gate requires `npm run lint --prefix Body/M/epi-tauri`, `npm run test --prefix Body/M/epi-tauri`, `npm run test:e2e --prefix Body/M/epi-tauri`, `cargo test --manifest-path Body/M/epi-tauri/src-tauri/Cargo.toml`, plus upstream live integration commands from Tracks 01-04.

## Dependencies

- **Track 01 kernel bridge:** Track 06 should not harden profile or readiness consumption until Track 01 publishes the shared TypeScript contract, lite/full mode semantics, bridge events, capability manifest, and S0/S0' generated/schema-validated payloads.
- **Track 02 S2 graph:** Shell `0` graph evolution depends on S2 filtered subgraph APIs, pointer anchors, relation-family descriptors, Anuttara fields, GDS readiness, namespace boundaries, and real Neo4j live-test harnesses.
- **Track 03 S3 gateway/SpaceTimeDB:** Tauri runtime state, world clock, DAY/NOW/session projection, native subscriptions, resync, and client-facing gateway stream semantics must land before `/body` can claim live mode.
- **Track 04 S5 review/autoresearch:** Review alerts, agent check-in snapshots, profile observation deposits, human gate enforcement, and Epii DTOs depend on S5 persisted stores and gateway-shaped methods.
- **M5-3 `/pratibimba/system` host:** Cross-surface deep-link completion depends on a real Theia/Tauri host skeleton and at least one target extension capable of receiving and acknowledging intents.
- **M4/Nara artifact substrate:** Journal, dream, oracle, reminder, quick chat, and highlight sendoff depend on canonical Nara artifact envelopes, DAY/NOW paths, Graphiti handles, and privacy class enforcement.
- **Shared local-service harness:** Production readiness depends on reproducible local startup for gateway, SpaceTimeDB, S2 Neo4j/Redis, S5 stores, Tauri, and Theia. Mock-only lanes are not sufficient.
- **Design/UX decision pass:** 0-side graph + clock composition, background/menubar lifecycle, deep-link route grammar, and privacy copy need explicit decisions before final UI hardening, but data contracts can be built behind seams now.

## Open Decisions

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

## Success Criteria

- `/body` remains a fast lightweight daily 0/1 surface and does not become a duplicate of `/pratibimba/system`.
- The existing useful implementation is preserved and evolved: Shell, OmniPanel, command palette, graph stubs, Nara editor/highlights, Epii conversation, services, stores, and Tauri commands continue to work while their data sources move to shared contracts.
- Shell `0` consumes live S0 profile, S2 filtered graph/pointer law, and S3 world-clock/runtime data through the lite bridge, with no renderer-local tick/codon/pointer/graph-law derivation.
- Shell `1` writes and reads real Nara artifacts, sends highlights through governed gateway/S5 envelopes, surfaces safe review alerts, and keeps protected personal bodies and field state local.
- OmniPanel reports capability readiness rather than service health alone and can summon IDE targets through typed intents.
- `/body` and `/pratibimba/system` share one bridge context; opening the IDE upgrades capability without duplicating subscriptions, and closing it returns to lite mode safely.
- Deep links carry coordinate, artifact/review/source handles, DAY/NOW, session, profile generation, and privacy class while excluding raw protected content.
- M5-4 lightweight mediation works through real S5 review/autoresearch state, preserves human-required review gates, and deposits evidence with profile/session lineage.
- The release gate includes real Tauri, gateway, SpaceTimeDB, S2, S5, and Theia-host verification. Mock servers, placeholder panels, and hand-authored demo fixtures cannot satisfy completion.
