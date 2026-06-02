# Track 10 - Cross-Cutting Integration And Milestones

This track binds the M5-2 substrate plans, M5-3 Tauri/Theia surface plans, and M5-4 agentic-mediation plans into one build sequence. It is the integration control plane for the program: which seams must be proven first, which demos certify real cross-stack behavior, and which release gates prevent the M' surfaces from drifting away from S/S' authority.

## Goal

Deliver an integration milestone plan that keeps S/S' wiring close to the beginning of the M' build:

- Establish cross-track readiness gates before UI-heavy implementation can claim progress.
- Define the minimum vertical slices that prove S0, S2, S3, S5, `/body`, `/pratibimba/system`, six M-extensions, two integrated plugins, and M5-4 agents are sharing the same runtime truth.
- Sequence the first engineering work so M5-2 substrate, M5-3 surfaces, and M5-4 mediation land together rather than as separate projects.
- Provide demo and acceptance milestones with real local services, persisted state, live subscriptions, and governed review/evidence paths.
- Keep unresolved architecture choices visible in [[11-open-architectural-decisions]] instead of silently baking them into implementation.

## Source Specs

- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, sections 1.2, 3, 4, 5, 8, and 9. This is the authority for M5-2 as the S-stack, M5-3 as the single Tauri app with `/body` plus `/pratibimba/system`, and M5-4 as operational-capacity and agentic mediation across the full coordinate system.
- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `docs/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, sections 4, 8, 10, 11, and 12. This is the inherited pre-implementation plan whose Theia tranches are folded into Tracks 05-08.
- [[alpha_quaternionic_integration_across_M_stack]] - `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`, section 11, especially 11.7. This establishes the S3'/SpaceTimeDB native-WebSocket shared-gateway milestone as the first integration proof.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "Required Shared MathemeHarmonicProfile", "Neo4j / Graphiti Boundary", and "Minimum Live Loop". This is the authority for shared profile, shell/subsystem separation, graph/memory boundaries, and minimum end-to-end loop.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "Port Architecture", "Harmonic Profile Architecture Amendment", "Graphiti And S2 Graph Boundary", and "Testing Contract". This is the authority for typed Tauri clients, readiness states, and mock-free desktop testing.
- [[S0-S0i-CLI-CORE]] - `docs/specs/S/S0-S0i-CLI-CORE.md`, [[S2-S2i-GRAPH]] - `docs/specs/S/S2-S2i-GRAPH.md`, [[S3-S3i-GATEWAY]] - `docs/specs/S/S3-S3i-GATEWAY.md`, and [[S5-S5i-SYNC]] - `docs/specs/S/S5-S5i-SYNC.md`. These are the implementation-spec anchors for the S' substrate lanes.
- [[S4-5-SPEC]] / [[S4-5'-SPEC]] under `Idea/Bimba/Seeds/S/S4/` and the live `Body/S/S4/ta-onta/S4-5p-aletheia/` contract/agent/cluster files. These are the cross-track authority for Aletheia differentiated expert lineage when M5-4 and S5 claim Aletheia disclosure readiness.
- [[01-kernel-bridge-and-s0-foundation]], [[02-s2-bimba-map-population]], [[03-s3-gateway-and-spacetimedb]], [[04-s5-autoresearch-and-review-extension]], [[05-tauri-ide-shell-and-pratibimba-system]], [[06-zero-one-surface-evolution]], [[07-m-extension-individual-tracks]], [[08-integrated-plugin-tracks]], [[09-agentic-mediation-and-operational-capacities]], and [[11-open-architectural-decisions]] in this folder.

## Architectural Keystones

- **Substrate-First Vertical Slices:** The first demos must start in S0/S2/S3/S5 and end in `/body`, Theia, and M5-4 evidence. A frontend-only milestone is not an integration milestone.
- **One Profile Generation Across Surfaces:** Every integration slice names a profile generation, session/DAY/NOW handle, privacy class, and readiness state. `/body`, Theia, extensions, plugins, and agents must observe the same generation.
- **Native Live Path Before Rich UX:** The S3 native SpaceTimeDB WebSocket path, gateway stream contract, and reconnect/resync semantics must be proven before rich live rendering claims are accepted.
- **S2 Graph Law Before Graph UI Authority:** M0/M5 graph views, coordinate trees, GDS overlays, and plugin graph backdrops consume S2 payloads. They do not construct coordinate law or graph topology locally.
- **S5 Review Before Agentic Authority:** M5-4 action surfaces cannot become operational until S5 candidates, routes, review gates, evidence envelopes, and dry-run promotion plans are real persisted state.
- **Aletheia Lineage Before Aletheia Surfacing:** Any integration milestone that claims Aletheia disclosure readiness must show differentiated S4.5 lineage from real persisted records: specialist/mode, tool refs, skill refs, namespace refs, DAY/NOW/session, readiness, and privacy class. A generic `Aletheia` source label alone is not enough.
- **Decision Gates Are Build Gates:** Theia runtime mode, bridge host ownership, WebSocket topology, profile schema versioning, graph root mapping, and privacy storage choices block dependent implementation rather than being left as implicit engineering taste.
- **Mock-Free Completion:** Captured-real fixtures may accelerate UI tests, but every milestone that claims live behavior must run against real local services or a repository-provided live harness.
- **Degraded States Are Product Behavior:** Missing S2 GDS, missing n10s, absent M3 LUTs, disconnected SpaceTimeDB, blocked private projection, or unavailable S5 routes must render as typed readiness blockers, not placeholder content.

## Tranches

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

2. **T1 - S0/S3 Live Profile Stream MVP.**

   Deliverables:

   - Complete the minimum S0 profile contract needed for integration: `MathemeHarmonicProfile` generation, privacy class, readiness, pointer anchor placeholder/certification state, and profile serialization.
   - Complete the minimum S3 stream lane: gateway WebSocket contract, native SpaceTimeDB subscription path, reconnect/resync states, and `world_clock` or `KairosSurface` update event.
   - Add a tiny bridge subscriber outside the final UI that proves the S0 profile and S3 stream travel through the same gateway/SpaceTimeDB lane.
   - Produce the first "profile generation ledger" fixture from a real run, recording CLI output, gateway frame, SpaceTimeDB row/frame, and bridge subscriber observation.

   Dependencies:

   - Track 01 Tranches 0-4.
   - Track 03 Tranches 1-4.
   - T0 decisions for profile schema versioning, bridge host abstraction, and WebSocket topology.

   Verification:

   - A local integration test drives a real profile or `KairosSurface` update and observes it through native SpaceTimeDB WebSocket within the budget chosen by Track 03, initially targeting the alpha §11.7 100 ms milestone where feasible.
   - The test fails if native WebSocket silently falls back to HTTP polling while claiming native readiness.
   - Reconnect/resync transitions produce typed readiness changes and a new generation marker.

3. **T2 - S2 Graph Baseline And S5 Review Baseline (parallel with T1 after T0).**

   Deliverables:

   - Populate the minimum S2 graph baseline: canonical coordinate nodes, accepted relation registry, source/spec/code/test anchors, and coordinate-native API payloads for M0/M5 graph consumers.
   - Resolve or explicitly block the `#` root mapping and schema/seed relation-type divergence before graph UI work treats S2 as authoritative.
   - Extend S5 typed state enough for frontend and agent consumption: candidate, route queue, review item, governance gate, evidence envelope, dry-run promotion plan, and frontend-safe DTOs.
   - Capture real S2 and S5 payloads as contract fixtures for `/body`, Theia shell, M extensions, integrated plugins, and M5-4 agents.

   Dependencies:

   - Track 02 Tranches T0-T5 for baseline graph population.
   - Track 04 Tranches 0-6 for typed S5 state and governance metadata.
   - T0 decisions for S2 root mapping, n10s/GDS packaging, S5 storage shape, and review metadata model.

   Verification:

   - S2 tests query real Neo4j state or the repository-provided graph-services harness and return coordinate-native payloads with relation types accepted by schema tests.
   - S5 tests persist and reload real candidate/review/evidence state; fake in-memory review counts do not satisfy the milestone.
   - Captured fixtures include provenance showing the command, service, and schema version that generated them.

4. **T3 - Kernel Bridge Shared-Consumer Acceptance.**

   Deliverables:

   - Implement the shared `KernelBridgeAPI` contract package and runtime MVP sufficient for both lite `/body` and full Theia consumers.
   - Subscribe one `/body` lite test client and one Theia test extension to the same bridge source without duplicate backend subscriptions.
   - Include S0 profile, S3 stream readiness, S2 graph readiness, S5 review readiness, connection state, and observability events in the bridge read model.
   - Add a bridge capability reader for M5-4 that can read current profile/readiness and deposit a governed evidence envelope through S5.

   Dependencies:

   - T1 must be complete.
   - T2 graph/review baselines must be available or reported as explicit typed blockers.
   - Track 01 Tranches 5-8.
   - Track 05 Tranche T3.
   - Track 09 initial capability contract.

   Verification:

   - A single profile generation is observed with the same id and privacy class in CLI/gateway, bridge, `/body`, Theia test extension, and M5-4 capability reader.
   - Failure/restart tests prove `/body`, Theia, and agent readers receive disconnected, reconnecting, stale, and resynced states in order.
   - Capability tests prove protected Nara bodies, private profile hashes, raw identity data, and unrestricted gateway methods are rejected.

5. **T4 - `/body` Daily Surface Vertical Slice.**

   > **Recast 2026-06-01:** Per the Theia-only canon revision (Track 05 §1–§3) and the Body/M/epi-tauri DEPRECATED tombstone, `/body` now lives as the 0/1 daily-layout mode inside the single Theia shell at `Idea/Pratibimba/System`. The 0/1 surface is realised by the `omnipanel-shell` + `pratibimba-layouts` extensions; bridge lite-mode is the `KERNEL_BRIDGE_API.subscribe` path published by the kernel-bridge extension. This tranche is a vertical-slice acceptance test over those existing extensions — not a build of new Body/M/epi-tauri code.

   Deliverables:

   - Verify the 0/1 daily layout (via `Idea/Pratibimba/System/extensions/omnipanel-shell/` + `pratibimba-layouts/`) consumes the kernel-bridge lite mode for profile, graph readiness, Nara/protected handles, review notifications, and IDE intent routing — Shell 0 and Shell 1 here are layout regions inside the Theia shell, not separate processes.
   - Implement the `/` command membrane for bridge readiness, open IDE, open review item, open graph node, and start protected entry (as Theia commands registered by the relevant M-extensions; many already exist per Thread A's `extensions/ide-shell-m0-m5/` intent targets).
   - Add a deep-link or command path from the 0/1 daily layout into the deep IDE layout that preserves session, DAY/NOW, profile generation, and selected coordinate (via Theia's `Layout Restorer` + `WorkspaceService` — Track 05 T5 landed the layout-switch primitive).
   - Bind the daily rotation contract from [[11-open-architectural-decisions#IOD-13---Nara-vaultwrite-service-ownership]]: `Idea/Empty/Present/` keeps the active Day plus immediately previous Day for crossover continuity, while older Day/NOW/session material is archived under `Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/` and surfaced to `/body`, M4 Nara, M5 Library, Graphiti, Gateway, S5, and Pi only as privacy-filtered handles/envelopes.
   - Surface degraded substrate states in the daily layout without synthetic graph/review/profile data.

   Dependencies:

   - T3 bridge shared-consumer acceptance.
   - Track 05 Tranche T5 (layout-switch primitive, done).
   - Track 05 Tranche T4 (M0/M5 chrome, done) for the IDE-side deep-link target.
   - Track 06 deliverables — absorbed into Track 05 T2 per canon recast; no separate Track 06 work required.

   Verification:

   - Playwright/puppeteer e2e test opens the Theia shell in 0/1 daily layout, observes a live profile generation and readiness state, receives a real review or readiness notification, invokes IDE intent, switches to deep IDE layout, and returns without duplicate bridge subscriptions (assert `KERNEL_BRIDGE_API.snapshot.upstreamSubscriptionCount === 1` across both layouts).
   - Rotation test creates at least three real Day folders, proves only active+previous remain in `Idea/Empty/Present/`, proves the older Day is archived to `Idea/Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`, and proves the bridge/profile payload carries archive handles without protected Nara or Graphiti body text.
   - Privacy test proves the 0/1 daily layout shows protected handles/summaries only and does not persist private Nara or Graphiti bodies into shared Theia workspace state.

6. **T5 - Theia Shell And M0/M5 Workbench Vertical Slice.**

   Deliverables:

   - Bootstrap `/pratibimba/system` inside the selected Tauri/Theia runtime and open it from `/body`.
   - Implement the first M0/M5 IDE chrome: graph viewer/coordinate tree, Canon Studio file path, Agentic Control Room read model, evidence pane, and bridge status.
   - Consume live S2 graph payloads, S5 review/autoresearch DTOs, S0/S3 profile/stream state, and M5-4 capability metadata.
   - Record all remaining blockers as readiness facts in the IDE shell.

   Dependencies:

   - T0 Theia runtime and webview decision.
   - T3 bridge shared-consumer acceptance.
   - Track 05 Tranches T1-T4.
   - Track 02 Tranches T7-T8 and Track 04 Tranche T7 for richer graph/review panes.

   Verification:

   - Tauri launches `/body`, summons the real Theia workbench, opens a real S2 graph node, opens a real S5 review/autoresearch record, and records evidence with profile/session anchors.
   - Theia build/test harness exercises real Theia DI/contribution activation, not a static HTML placeholder.

7. **T6 - Six M-Extension First Contributions (staged by upstream readiness).**

   Deliverables:

   - Deliver first real contributions for `m0-anuttara`, `m1-paramasiva`, `m2-parashakti`, `m3-mahamaya`, `m4-nara`, and `m5-epii`.
   - Each extension imports the shared bridge contract, declares upstream readiness, provides one workbench contribution, one evidence producer or diagnostic output, and one integration contract for Track 08.
   - Each extension identifies whether it is live-ready, captured-real-fixture-ready, or readiness-blocked by S0/S2/S3/S5/M4 privacy work.

   Dependencies:

   - T5 Theia shell vertical slice.
   - Track 07 Tranches 0-10.
   - Track 01/02/03/04 field readiness according to each subsystem.

   Verification:

   - All six extensions activate in the same Theia workbench without command collisions, duplicate backend subscriptions, or private-state leakage.
   - Extension tests fail if local renderer code computes backend-owned tick, graph, codon, correspondence, review, or protected-personal law.

8. **T7 - Integrated Plugin Acceptance Slices (after T6 begins).**

   Deliverables:

   - Implement `plugin-integrated-1-2-3` as a composed M1/M2/M3 cosmic-engine slice driven by one shared profile generation.
   - Implement `plugin-integrated-4/5/0` as a composed M4/M5/M0 user-experience slice with protected-local foreground, canonical graph backdrop, and governed review/evidence hooks.
   - Add layout arbitration, mini-inspector mode, evidence envelopes, deep links, and degradation states for both integrated plugins.

   Dependencies:

   - T6 individual extension contribution contracts.
   - Track 08 Tranches T0-T9.
   - M4/Nara privacy decisions and S5 governance gates.

   Verification:

   - Scenario A: profile tick -> S3 stream -> bridge -> 1-2-3 plugin updates M1/M2/M3 panes from one generation -> evidence deposited to S5.
   - Scenario B: M4 protected handle + S2 BEDROCK link + S5 review state -> 4/5/0 plugin renders recognition surface -> governed evidence envelope produced without raw protected bodies.

9. **T8 - M5-4 Agentic Mediation End-To-End (can overlap T6/T7 after S5 gates exist).**

   Deliverables:

   - Route a real candidate or work item through VAK evaluation, Anima orchestration, bounded agent capability selection, tool/run stream, evidence deposition, review gate, and dry-run promotion plan.
   - Expose this flow in Theia Agentic Control Room and a lightweight `/body` notification/continuation affordance.
   - Connect Sophia/Anima/Pi/Aletheia roles to S5 review/autoresearch state, S0/S2/S3 context, and user-final-validation gates without granting unrestricted shell/backend authority.
   - Include the Track 09 T8.5 Aletheia expert-lineage handoff before claiming any Aletheia disclosure path complete.

   Dependencies:

   - Track 09.
   - Track 04 Tranches 6-9.
   - Track 05 Tranche T8.
   - T3 bridge capability contract.

   Verification:

   - A real S5 candidate is routed, acted on within bounded capability policy, records tool/test/evidence references, and lands in a governed review state.
   - A real Aletheia disclosure reloads from persisted `Idea/Empty/Present/{day}` JSONL with differentiated specialist/mode lineage, safe source URIs, and no protected body leakage.
   - Human-required review gates cannot be approved, rejected, revised, or promoted by agents.
   - Agent payloads include source/spec/code/test anchors, profile generation, S2/S3 handles, privacy class, and review id.

10. **T9 - Full System Alpha Gate And Replan.**

    Deliverables:

    - Run the full local alpha scenario: S0 computes profile, S2 serves graph, S3 streams live state, S5 serves review/autoresearch, `/body` consumes lite mode, Theia consumes full mode, six M extensions activate, both integrated plugins run acceptance slices, and M5-4 records evidence.
    - Produce the operator runbook for service startup, test lanes, privacy audit, degraded modes, known blockers, and expected demos.
    - Produce the alpha readiness report with passed milestones, failed milestones, deferred decisions, and next implementation tranches.
    - Feed [[13-s-sprime-modularity-and-s0-membrane-cleanup]] by listing every S0 adapter, compatibility shim, temporary live host, and duplicated-service-law surface that must be recast before beta hardening.
    - Update the implementation plan folder if the alpha reveals sequencing errors, but do not rewrite canon.

    Dependencies:

    - T1 through T8.
    - Track 11 decisions resolved or explicitly deferred with known degraded behavior.

    Verification:

   - A repeatable command or documented harness starts the local stack, launches the app, exercises `/body`, summons Theia, opens graph/review/extension/plugin/agent surfaces, records evidence, includes differentiated Aletheia disclosure lineage, and shuts down cleanly.
    - Privacy audit checks Tauri state, Theia workspace state, S3 rows/frames, S2 payloads, S5 evidence, logs, and observability events for forbidden protected fields.
    - The report identifies any remaining work as a concrete tranche with owner track, upstream dependency, and test gate.

## Dependencies

- **Critical path:** T0 decisions -> T1 S0/S3 live stream -> T3 shared bridge -> T4 `/body` and T5 Theia shell -> T6 six M extensions -> T7 integrated plugins -> T8 agentic mediation -> T9 alpha gate.
- **Parallel path:** T2 S2 graph baseline and S5 review baseline can proceed alongside T1, but T3 must represent missing S2/S5 readiness honestly if either lags.
- **Bridge dependency:** Track 01 Tranches 5-8 and Track 03 native subscription work are upstream of most M5-3 and M5-4 claims.
- **Graph dependency:** Track 02 graph API/payload readiness is upstream of M0 graph viewer, coordinate tree, graph-backed evidence, 4/5/0 backdrop, and S2-provenance claims.
- **Review dependency:** Track 04 typed S5 DTOs and gates are upstream of Agentic Control Room, M5 extension, integrated plugin evidence, and all agentic operational authority.
- **Theia dependency:** Track 05 runtime decision gates are upstream of Track 07/08 packaging, deep links, workspace persistence, and IDE acceptance.
- **Privacy dependency:** M4/Nara privacy and Graphiti boundaries are upstream of 4/5/0, protected evidence, personal-field handles, and agent payload policies.
- **Cleanup dependency:** Track 13 begins after T9 unless T13.T0/T13.T1 run early as non-conflicting inventory/parity work that does not touch active Track 03 gateway extraction files.

## Open Decisions

- This track does not resolve architectural questions by itself. It gates dependent milestones on [[11-open-architectural-decisions]] and records the consequences of deferring them.
- Decisions that block early work are Theia runtime mode, single vs multi-webview, bridge host boundary, gateway/SpaceTimeDB multiplexing, SpaceTimeDB auth/RLS, profile schema versioning, S2 `#` root mapping, S5 persisted-state shape, review metadata model, and M4 privacy/open-handle policy.
- Decisions that can be deferred behind readiness blockers are exact GDS overlay UX, n10s production packaging, visual style of 4/5/0 graph/city backdrop, integrated plugin workspace-vs-command default, and high-frequency visual interpolation cadence.

## Success Criteria

- The plan sequence prevents "UI first, S later" drift: every M5-3 milestone names its S0/S2/S3/S5 upstream dependency and real readiness state.
- At least one early vertical slice proves a single S0/S3 profile generation reaches bridge, `/body`, Theia, and M5-4 evidence without duplicate subscriptions or renderer-local derivation.
- S2 and S5 are present from the first alpha surface work as graph/review readiness, not deferred to a later phase.
- The Theia shell, `/body` surface, six M extensions, two integrated plugins, and agentic mediation all consume the same bridge/profile/session/readiness contracts.
- Every demo has a real verification path: local services, persisted data where applicable, native WebSocket where claimed, governed S5 review/evidence, and privacy audit.
- All unresolved architectural questions are linked to [[11-open-architectural-decisions]] with blocked tracks and consequences visible.
- The final alpha gate produces an operator runbook, privacy report, integration test evidence, known blocker list, and next-tranche replan.
