# Integrated 1-2-3 And 4/5/0 Theia Plugin Implementation Track

This track builds the two integrated M5-3 Theia plugin surfaces: `plugin-integrated-1-2-3` as the cosmic-engine substrate and `plugin-integrated-4-5-0` as the user-experience return surface. It composes the six individual M-extensions through stable contracts; it does not implement their per-extension internals, duplicate S-stack behavior, or create backend services under `/Body`.

## Goal

Deliver production-ready build plans for the two integrated Theia plugins:

- `plugin-integrated-1-2-3` composes `m1-paramasiva`, `m2-parashakti`, and `m3-mahamaya` into a single cosmic-engine workspace where M1 movement, M2 harmonic-correspondential rendering, and M3 clock/codon transcription are synchronized by the shared `kernel-bridge`.
- `plugin-integrated-4-5-0` composes `m4-nara`, `m5-epii`, and `m0-anuttara` into a single user-experience integration workspace where protected personal field, Epii review/governance, and canonical Bimba graph ground can be encountered together without leaking protected Nara/Graphiti bodies.

The integrated plugins must prove M5-2/M5-3/M5-4 separation: they consume live S0/S2/S3/S5 substrate through the kernel bridge, render composed M' surfaces inside the Tauri/Theia app, and expose review/evidence/action hooks through governed M5-4 mediation. They must not compute private clock, graph, codon, correspondence, review, or personal-identity law in frontend code.

## Source Specs

- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, Section 4.2 "The `KernelBridgeAPI` interface", Section 4.3 "Data flow specifics", Section 4.4 "Observability stream for autoresearch spine", Section 5 "The ide-shell-m0-m5 extension", Section 6 "The six individual M-extensions", Section 7 "The two integrated plugins", Section 8 "The 0/1 <-> IDE bridging", Section 10 "Open architectural questions". This is the direct composition and activation authority for the two integrated plugins.
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
- [[01-kernel-bridge-and-s0-foundation]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md`, especially "Architectural Keystones", Tranches 5-8, "Dependencies", and "Success Criteria". Track 08 depends on the typed `KernelBridgeAPI`, shared profile, lite/full subscription modes, readiness states, observability, and agent capabilities.
- [[02-s2-bimba-map-population]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`, especially Tranches T7-T8 and "Success Criteria". Track 08 depends on coordinate-native graph APIs, GDS overlays, namespace-aware graph access, and real captured S2 payloads.
- [[03-s3-gateway-and-spacetimedb]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md`, especially Tranches 3-5, "Open Decisions", and "Success Criteria". Track 08 depends on native live deltas for `world_clock`, `pratibimba_presence`, shared archetype/coincidence rows, session/DAY/NOW handles, and gateway RPC stream contracts.
- [[04-s5-autoresearch-and-review-extension]] - `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`, especially Tranches 6-9. Track 08 depends on real S5 review/autoresearch DTOs, Epii agent access, route queues, governance gates, dry-run promotion state, and frontend-safe privacy-filtered read models.

## Architectural Keystones

- **Composed M5-3 Surfaces, Not Backend Services:** Both integrated plugins are Theia contributions in the M'-Tauri/Theia app. They import extension-level view parts, state selectors, commands, and evidence hooks from the six individual M-extensions; they do not create S-stack services, alter `/Body`, or own per-extension engine logic.
- **Kernel Bridge Is The Only Live Substrate Conduit:** All profile, world-clock, presence, graph, gateway RPC, audio bus, cymatic state, kernel trace, readiness, and observability data enters through the shared `kernel-bridge`. The integrated plugins must not open duplicate direct S0/S2/S3/SpaceTimeDB/S5 subscriptions.
- **Composition Contracts With Individual M-Extensions:** Each individual extension must expose a stable `IntegratedSurfaceContribution` contract: `viewParts`, `miniInspectors`, `stateSelectors`, `commands`, `evidenceProducers`, `privacyClass`, `readiness`, and `layoutClaims`. The integrated plugin may arrange and choreograph these contributions, but not reach into private component internals or reimplement missing per-extension behavior.
- **1-2-3 Cosmic Engine Contract:** The 1-2-3 plugin composes M1 path/torus state, M2 72-space/cymatic/planetary-chakral state, and M3 clock/codon/double-torus state into one synchronized workspace. It is allowed to choreograph shared tick, `(lens, mode)`, `resonance72`, `planetaryChakral`, `audio_octet`, `nodal_quartet`, `mahamaya`, and `codonRotationProjection` displays only when those fields arrive from the backend profile/readiness contract.
- **4/5/0 User-Experience Contract:** The 4/5/0 plugin composes M4 protected personal field, M5 Epii review/governance surface, and M0 canonical graph/city backdrop. It may show handles, summaries, resonance traces, BEDROCK links, GDS overlays, review states, and consent prompts; it must not show private journal bodies, raw birth data, raw bioquaternion vectors, unreconciled Graphiti text, or canonicalize personal narrative as S2 graph fact.
- **Activation And Screen-Real-Estate Arbitration:** Each integrated plugin owns a named workspace layout and command entry. When active, composed individual extensions either yield overlapping center-stage panes or switch to mini-inspector mode. The layout manager must make conflicts explicit and testable: no two extensions should claim the same central region, audio sink, or selection authority at once.
- **Conversational / Encounter Default:** Default rendering is not a technical dashboard. 1-2-3 defaults to the living cosmic-engine instrument with technical inspectors summonable for evidence/audit. 4/5/0 defaults to a contemplative recognition surface with review/evidence panes summonable when operational work is requested.
- **M5-4 Evidence And Action Hooks:** Both integrated plugins emit reviewable evidence envelopes to S5 via gateway-shaped methods: current profile generation, S2 graph handles, S3 DAY/NOW/session handles, selected coordinates, readiness blockers, privacy class, user action, and test/evidence references. Agents can request bounded actions, but human-required review and promotion gates remain non-bypassable.
- **Readiness Honesty:** Gaps such as missing M3 codec LUTs, pending GDS, blocked private projection, unavailable Graphiti, degraded SpaceTimeDB, or absent S5 gateway routes must render as readiness states. The integrated plugins must never fill gaps with mock tables, placeholder graph data, or renderer-local "close enough" calculations.
- **Shared State Cadence:** Both plugins consume a shared active context record: profile generation, world-clock generation, selected coordinate, active extension/plugin, active shell face, active `(lens, mode)`, active `(codon, rotation)`, session/DAY/NOW, and privacy scope. High-frequency visual interpolation is allowed only as display interpolation over backend state, not as authority.

## Tranches

1. **T0 - Composition Contract Inventory And Fixture Capture.**

   Deliverables:

   - Inventory the expected contribution surfaces from `m0-anuttara`, `m1-paramasiva`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, and `m5-epii`, using Track 07 outputs where available.
   - Define `IntegratedSurfaceContribution`, `IntegratedViewPart`, `IntegratedMiniInspector`, `IntegratedEvidenceProducer`, `IntegratedLayoutClaim`, and `IntegratedReadiness` TypeScript contract shapes in the future implementation plan for `Idea/Pratibimba/System/shared`.
   - Capture real or planned fixture payload requirements from Tracks 01-04: `MathemeHarmonicProfile`, S2 graph node/subgraph/GDS overlay, S3 world clock/presence/session deltas, and S5 review/autoresearch DTOs.
   - Produce a compatibility matrix naming which fields each integrated plugin needs, which upstream track owns them, and what readiness state appears when absent.

   Verification:

   - Contract tests in the implementation branch should import the six individual extension contribution stubs and reject missing `privacyClass`, `readiness`, or `layoutClaims`.
   - Fixture tests must parse payloads captured from real upstream services or upstream contract tests; handwritten happy-path JSON alone is not accepted.
   - The compatibility matrix must explicitly mark Track 07-owned per-extension internals as out of scope for Track 08.

2. **T1 - Integrated Plugin Packages And Layout Arbitration Skeleton.**

   Deliverables:

   - Add Theia package plans for `plugin-integrated-1-2-3` and `plugin-integrated-4-5-0` under `Idea/Pratibimba/System/extensions/` once the Theia skeleton exists.
   - Register commands: `epi.integrated.openCosmicEngine`, `epi.integrated.openJivaSiva`, `epi.integrated.toggleMiniInspectors`, `epi.integrated.openEvidencePanel`, and `epi.integrated.copyEvidenceHandle`.
   - Implement a composition/layout service that accepts layout claims from individual extensions and resolves center-stage, side-panel, mini-inspector, audio, selection, and evidence-panel ownership.
   - Define named workspace layouts for each plugin: `cosmic-engine.integrated` and `jiva-siva.integrated`.
   - Add degraded empty-state views that show missing upstream contributions/readiness without fake demo components.

   Verification:

   - Theia contribution tests prove both plugins register commands and workspace layouts only after `kernel-bridge` is available.
   - Layout arbitration tests simulate overlapping M1/M2/M3 and M4/M5/M0 layout claims and prove the integrated plugin either grants mini-inspector mode or blocks activation with a specific conflict reason.
   - No tests rely on mocked backend behavior beyond contract-bound readiness objects; UI empty states must include upstream owner and blocker.

3. **T2 - Shared Live State Coordinator And Readiness Model.**

   Deliverables:

   - Build a plugin-local `IntegratedStateCoordinator` that subscribes once to the `kernel-bridge` and fans out safe derived view state to both integrated plugins.
   - Track profile generation, `world_clock` generation, active selected coordinate, active shell/subsystem/plugin route, connection state, S2 graph readiness, S3 stream readiness, S5 review readiness, and privacy scope.
   - Define display cadence policy: backend state updates are authoritative; visual render loops may interpolate but must carry the profile/world-clock generation they display.
   - Add observability events for activation, readiness transitions, layout conflicts, blocked private projections, evidence envelope creation, and rejected capability invocations.

   Verification:

   - Tests prove one bridge subscription is shared by both integrated plugins and late subscribers receive the current generation with staleness metadata.
   - Tests simulate disconnect/reconnect/resync and prove both plugin read models move through degraded states without stale profile claims.
   - Tests assert renderer-local cadence never mutates authoritative profile, graph, codon, or review fields.

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

5. **T4 - 1-2-3 Evidence, Review, And Agent Hooks.**

   Deliverables:

   - Add evidence producers for 1-2-3: cosmic-engine snapshot, route/codon projection audit, M2 meaning packet trace, kernel-trace handle, and readiness/gap report.
   - Wire `Open in Review`, `Ask Epii to explain`, and `Create improvement candidate` actions through S5 gateway-shaped methods when Track 04 DTOs exist.
   - Emit observability events for QL-coherence anomalies, profile field gaps, cross-subsystem relation events, and user-inspector requests.
   - Ensure evidence envelopes include S0 profile generation, S2 provenance handles, S3 session/DAY/NOW handles, S5 review target, privacy class, and source spec anchors.

   Verification:

   - Integration tests create a real evidence envelope from a live/captured profile and assert S5 accepts or rejects it through a real DTO/gateway contract, not local fake state.
   - Privacy tests prove 1-2-3 evidence contains no protected M4 personal field, raw bioquaternion, private journal, or Graphiti body content.
   - Review-hook tests prove human-required S5 gates cannot be resolved by plugin or agent action.

6. **T5 - 4/5/0 Privacy-First Composition Slice.**

   Deliverables:

   - Compose the first real `jiva-siva.integrated` layout: M4 protected personal field foreground, M0 canonical graph/city backdrop, M5 Epii review/continuity panel as summonable side stage.
   - Render the BEDROCK link, selected coordinate, safe activity-resonance dots, GDS cluster glow, and review/consent state only from S2/S3/S5 handles.
   - Add strict privacy gates before opening any M4 deep inspector, Graphiti episode, journal/oracle body, identity-quaternion view, or Nara dialogue artifact.
   - Support mini-inspector mode for M0 graph provenance, M5 review queue, and M4 field state without exposing private bodies in integrated default view.

   Verification:

   - Tests prove public/default 4/5/0 rendering contains handles, summaries, readiness, and visual state only; protected bodies remain behind governed local-open actions.
   - Tests prove a missing consent record blocks shared archetype publishing and raw Graphiti body inspection.
   - Tests prove S2 graph/GDS overlays render from backend-provided payloads and disappear or mark blocked when GDS is unavailable.

7. **T6 - 4/5/0 Epii Review, Consent, And Canon-Recognition Hooks.**

   Deliverables:

   - Add actions for `Review recognition claim`, `Deposit protected evidence handle`, `Request Anima consent review`, `Open Epii continuity`, and `Dry-run canon promotion`.
   - Connect M5 review/autoresearch state to the 4/5/0 surface: review inbox count, active candidate route, human-required gate state, dry-run promotion readiness, and continuity hints.
   - Define evidence envelopes for Jiva-is-Siva recognition claims: protected-field source handle, BEDROCK link handle, activity-resonance traces, S2/S3 evidence handles, privacy boundary assertion, source spec anchors, and readiness/gap state.
   - Keep Epii review panes summonable, not always-on, unless the user explicitly enters review mode or a notification requires attention.

   Verification:

   - Tests prove recognition-claim evidence cannot be created without privacy boundary, M4 protected source handle, BEDROCK link, activity traces, S2/S3 handles, and S5 target route.
   - Tests prove protected evidence can be deferred or summarized by agents but not approved, rejected, revised, or promoted when human-required gates apply.
   - Tests prove Graphiti memory is never treated as canonical S2 topology by the integrated plugin.

8. **T7 - Activation, Deep Links, Omni Panel, And Workspace Persistence.**

   Deliverables:

   - Connect both integrated plugins to the omni panel and cross-surface deep-link routing: `/body` shell 0 may open cosmic-engine context; shell 1 or M4/M5 alerts may open 4/5/0 context.
   - Define deep-link URLs such as `epi-logos://ide/integrated/cosmic-engine?...` and `epi-logos://ide/integrated/jiva-siva?...` with selected coordinate, profile generation, session/DAY/NOW, privacy scope, and intended inspector.
   - Persist workspace layout state, active plugin, mini-inspector state, selected coordinate, and visible evidence panels without storing protected bodies in Theia workspace state.
   - Decide implementation default between workspace-mode and command-view activation only through a prototype gate; until then support both command entry and named workspace layout in the plan.

   Verification:

   - E2E tests open each plugin from command palette, omni panel, and a deep link, then prove selected coordinate/profile/session state survives activation.
   - Persistence tests reload Theia and prove protected bodies are absent from workspace state while layout and readiness state restore correctly.
   - Multi-window tests, if the Tauri prototype chooses multi-webview, prove `/body` and `/pratibimba/system` share kernel-bridge identity and pending review notifications.

9. **T8 - Live Integrated Acceptance Scenarios.**

   Deliverables:

   - Scenario A: S0 profile tick -> S3 `world_clock` delta -> kernel bridge -> 1-2-3 integrated plugin updates M1/M2/M3 panes from one generation -> evidence envelope deposited to S5.
   - Scenario B: protected M4 activity handle + S2 BEDROCK link + GDS overlay + S5 review state -> 4/5/0 integrated plugin renders recognition surface -> user creates a governed review evidence envelope.
   - Scenario C: `/body` shell deep-link opens Theia integrated plugin without losing session state, selected coordinate, profile generation, or pending review notification.
   - Scenario D: degraded upstream states are visible: missing S2 GDS, absent M3 codec LUT, disconnected SpaceTimeDB, blocked private projection, unavailable S5 route.

   Verification:

   - E2E tests run against local gateway/SpaceTimeDB/S2/S5 lanes where those upstream tracks provide harnesses. Captured-real contract fixtures may supplement but not replace live checks for claimed live behavior.
   - Tests fail if any integrated plugin uses placeholder payloads, local S-stack derivations, mocked review state, or protected body leakage.
   - Operator readiness report names every unresolved upstream blocker and every degraded mode visible in the UI.

10. **T9 - Performance, Accessibility, Privacy Audit, And Release Gate.**

   Deliverables:

   - Add performance budgets for each integrated plugin: first meaningful render, profile update propagation, mini-inspector open, evidence envelope creation, graph/city overlay render, and protected-open gate latency.
   - Add accessibility expectations for keyboard activation, command palette discoverability, screen-reader labels for readiness/evidence states, reduced-motion handling, and non-audio operation.
   - Run privacy audit over plugin state, Theia workspace persistence, evidence envelopes, observability events, S3 rows, and S5 DTOs.
   - Document release gates for both plugins and the exact upstream readiness levels required for alpha, beta, and production.

   Verification:

   - Automated tests prove forbidden fields are absent from UI state, persisted workspace state, evidence envelopes, and observability events.
   - Performance tests prove profile update propagation and visible readiness update happen within the budget chosen by the implementation team.
   - Accessibility smoke tests prove every integrated command and mini-inspector is keyboard reachable and readable without relying on audio or color alone.
   - Release is blocked unless acceptance scenarios pass against real upstream functionality or explicitly named upstream blockers remain in degraded alpha scope.

## Dependencies

- **Track 01 - Kernel bridge and S0 foundation:** Required before any integrated plugin can claim live state. Track 08 needs `KernelBridgeAPI`, `MathemeHarmonicProfile`, lite/full mode, readiness taxonomy, connection state, gateway RPC, observability events, and bounded agent capabilities.
- **Track 02 - S2 Bimba-map population:** Required for M0 graph/city backdrop, S2 provenance, GDS overlays, BEDROCK link rendering, coordinate resolution, Anuttara syntax provenance, pointer anchors, and graph namespace boundaries.
- **Track 03 - S3 gateway and SpaceTimeDB:** Required for `world_clock`, `pratibimba_presence`, session/DAY/NOW handles, shared archetype/coincidence state, reconnect/resync semantics, and the stream contract consumed by kernel bridge.
- **Track 04 - S5 autoresearch and review extension:** Required for review inbox, evidence deposit, route queues, governance gates, dry-run promotion state, Epii agent access, and privacy-filtered M5-3 DTOs.
- **Track 07 - Six individual M-extension implementation track:** Required for real `m0` through `m5` view contributions, mini-inspectors, commands, evidence producers, and readiness exports. Track 08 composes these; it does not own their per-extension rendering engines.
- **Theia/Tauri shell foundation:** Required to resolve browser-mode-in-Tauri, multi-webview vs single-webview persistence, extension hosting model, Theia version pin, and whether `kernel-bridge` is Theia-owned, Tauri-owned, or hybrid.
- **M4/Nara protected-local substrate:** Required before 4/5/0 can expose personal-field or Graphiti handles. Without real privacy classes, consent records, and protected-open actions, 4/5/0 remains in safe shell/backdrop/review-only mode.
- **M3 codec and M2 correspondence readiness:** Required before 1-2-3 can claim full cosmic-engine readiness. Missing codon-rotation, M3 LUTs, planetary/chakral provenance, or 8+4 audio bus fields must block full readiness.
- **M5-4 agent governance:** Required before integrated plugin actions can request agent mediation beyond read-only explanation or review deposit. Human-required gates and privacy checks must exist before agent actions can be operational.

## Open Decisions

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

## Success Criteria

- Both integrated plugins are implemented as M5-3 Theia/Tauri surfaces and do not create backend services, mutate `/Body`, or duplicate S-stack subscriptions.
- `plugin-integrated-1-2-3` proves M1/M2/M3 are synchronized by one `kernel-bridge` profile/world-clock stream and renders readiness gaps for every missing backend field instead of deriving local substitutes.
- `plugin-integrated-4-5-0` proves M4/M5/M0 can render the Jiva-is-Siva recognition path through safe handles, BEDROCK link, GDS/activity traces, and S5 review state without exposing protected bodies or treating Nara memory as canonical S2 graph fact.
- Individual M-extension surfaces remain usable alone, and when integrated plugins are active they either yield overlapping real estate or operate in tested mini-inspector mode.
- Evidence envelopes from both integrated plugins include source spec anchors, S0 profile generation, S2 graph/provenance handles, S3 DAY/NOW/session handles, S5 review target, privacy class, readiness state, and user/agent action lineage.
- M5-4 mediated actions are bounded: agents can explain, defer, inspect allowed handles, or deposit evidence where authorized, but cannot bypass human-required review, consent, privacy, or promotion gates.
- `/body` shell, omni panel, and Theia deep links can open both integrated plugins without losing selected coordinate, profile generation, session identity, kernel-bridge identity, or pending review notifications.
- Tests exercise real functionality: captured-real upstream payloads at minimum, live local S0/S2/S3/S5 harnesses for claimed live behavior, real Theia command/layout activation, real privacy-filtered DTOs, and no mock/demo/placeholder data as readiness proof.
- Privacy audits show no raw journal text, dream bodies, oracle interpretations, birth data, raw `q_b`/`q_p`, raw identity hashes beyond approved handles, unreconciled Graphiti bodies, or protected local personal graph facts in public plugin state, observability events, workspace persistence, S3 rows, or S5 evidence envelopes.
- Release readiness is blocked until upstream Tracks 01-04 and Track 07 expose the contracts this track consumes, with every unresolved gap surfaced as a named degraded mode rather than hidden by UI polish.
