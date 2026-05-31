# S5/S5' Autoresearch and Review Extension Implementation Track

This track turns the S5/S5' autoresearch and review surface into the live M5-2 mechanism layer for the M'/S' system: typed surfacing, routing, orchestration, review, dry-run promotion, continuity, and M5-3/M5-4 visibility over real Rust state. It extends the existing `Body/S/S5` cores; it does not replace them with a parallel spec-only model.

## Goal

Build the production S5/S5' autoresearch and review extension that lets Epii receive real improvement candidates, route them across the six operational-capacity siblings, govern them through review gates, expose their state to M5-4 mediation and M5-3 IDE surfaces, and preserve the existing constraints: human gates are non-bypassable, Aletheia recompose remains human-reviewed on first pass, promotion stays dry-run-only until compiler mutation law is explicitly wired, and no surfaced candidate auto-promotes.

Implementation ownership for this track is centered on:

- `Body/S/S5/epii-autoresearch-core/`: candidate envelopes, routing taxonomy, orchestration state, typed destinations, continuity, promotion planning.
- `Body/S/S5/epii-review-core/`: governance categories, review-stage metadata, recursive/user/deployment gate semantics, auditability.
- `Body/S/S5/epii-agent-core/`: Epii deposit/snapshot bridge, M5-4 mediation surface, M5-3 review/autoresearch state DTOs.

## Source Specs

- [[m5-prime-autoresearch-self-improvement-loop.md]] at `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md`: §1.1 "Live Rust cores at `Body/S/S5/`"; §2 "The spine's four operational phases"; §3.2 "The six surfacing pipelines"; §3.3 "The candidate-improvement record shape"; §4.1-§4.5 target/vector routing taxonomy; §5.1-§5.4 orchestration handoff and state model; §6.1-§6.4 integration and Hen residency; §7.2-§7.3 continuity; §8 promotion-destination type system; §11 open spec gaps; §13 implementation milestones.
- [[m5-prime-agentic-ide-research.md]] at `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`: "M5' IDE Operational Surface Summary"; "Graph Namespace/File/Code/Agent Integration Model"; "Agentic Safety/Review/Promotion Flow"; "Implementation/Test Implications"; "Open Research Questions". This defines the M5-3 workbench contract that must consume real S5 review/autoresearch state.
- [[m5-prime-epii-on-anuttara-language-development.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`: §4 M5-2 OWL/SHACL/n10s construction; §5 M5-3 language inspector and trace rendering; §6 Sophia/Anima/Pi/Aletheia review workflow; §11 first-tranche construction, trace API, user-final validation.
- [[m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`: §4 M5-2 CPT/RAG/GDS pipeline; §5 M5-3 corpus/checkpoint surfaces; §6 Sophia + Epii co-review; §11 corpus assembly, synthetic-proof, hot-reload, cross-subsystem trigger trajectories.
- [[m5-prime-epii-on-parashakti-graph-relational-ml.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`: §4 M5-2 KGE/R-GCN/GDS/Lens-LoRA pipeline; §6 embedding-quality metrics; §7 M5-4 deployment workflow and autoresearch triggers; §12 first-tranche construction, Lens-LoRA, dashboard, topology-handling trajectories.
- [[m5-prime-epii-on-mahamaya-process-reward-rl.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`: §4 M5-2 process-reward RL/federated/genetic/GDS/SHACL integration; §5 M5-3 pipeline monitors; §6 M5-4 governance, autoresearch routing, tier asymmetries; §11 pipeline, federation, synthesis, runtime-integration trajectories.
- [[m5-prime-epii-on-nara-qlora-dialogic-voice.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`: §4 M5-2 QLoRA/DPO/eval/inference path; §5 M5-3 curator surfaces; §6 Anima-primary mediation and five Anima gates; §10 autoresearch-spine triggers and anti-frequency-bias; §12 delivered constraints.
- [[m5-prime-epii-on-epii-self-referential-capacity.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md`: §4.1.C S5 review/autoresearch infrastructure; §4.3 autoresearch spine shape; §5.4 spine-state inspector; §6 recursive review loops and user-validation gate; §11 first-tranche construction, recursive protocols, pattern detection.
- [[S5-SPEC.md]] at `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`: §A S5 services and current implementation state; §B `s5'.improve.*`, `s5'.epii.*`, and `s5'.review.*`; "Envelope Fields Populated"; "S5'Cx Projection"; "Current Implementation State"; "Gaps"; "Key Architectural Decisions". This is the authority for S5/S5' method families and the current live-core status.
- [[S5-S5i-SYNC.md]] at `docs/specs/S/S5-S5i-SYNC.md`: "Architectural Role"; "Current State in This Repo"; "Integration Architecture"; "Implementation Plan"; "Authority Documents". This remains a stubbed world-sync layer but names publication, n8n, notification, and canon-recognition surfaces that S5/S5' promotion must not bypass.
- Existing implementation surface: `Body/S/S5/epii-autoresearch-core/src/lib.rs`, `src/inbox.rs`, `src/recompose.rs`, and tests under `Body/S/S5/epii-autoresearch-core/tests/`; `Body/S/S5/epii-review-core/src/lib.rs` and tests under `Body/S/S5/epii-review-core/tests/`; `Body/S/S5/epii-agent-core/src/lib.rs` and tests under `Body/S/S5/epii-agent-core/tests/`.

## Architectural Keystones

1. **Spine schema extension, not replacement.** Add typed `ImprovementCandidate`, `TargetSubsystem`, `ImprovementVectorKind`, `SurfacingPipelineId`, `ObservationEvidence`, `SurfaceActor`, `SensitivityClass`, `ObservationFingerprint`, and `PromotionDestination` around the existing `ProposeRequest`, `ImprovementRun`, and `PromoteRequest` APIs. Preserve backward-compatible deserialization of existing `s5-improvement-state.json` files and keep `direction: String` as the human-readable summary until all callers use typed fields.

2. **Routed candidate queues as first-class persisted state.** The autoresearch core needs subsystem route queues under the S5 state root, with deterministic route records, cross-target links, Anuttara-first blocking references, and observation suppression. Routing is a persisted decision, not a transient UI filter.

3. **Fine-grained orchestration state over coarse loop state.** Keep `LoopState::{Idle,Hypothesis,Evaluating,Deciding}` as the summary field, but add `OrchestrationState` for `Routed`, `AwaitingArticulation`, `BackendSpecified`, `ReviewInProgress`, `ReviewApproved`, `AwaitingUserFinalValidation`, `IntegrationInProgress`, `IntegrationCompleted`, `Discarded`, and failure/timeout states. State transitions must be explicit functions with invalid-transition errors.

4. **Review gates encode governance, not just status.** Extend review records with gate/category metadata such as standard improvement review, deployment gate, user-final validation, recursive self-modification, Anima-primary Nara gate, and Aletheia crystallisation review. Preserve the current hard invariant: if `requires_human` is true, only `ResolutionActor::Human` may approve, reject, or revise.

5. **Typed promotion remains dry-run until mutation law is real.** `PromotionDestination` and per-target `MutationKind` should make integration plans type-safe, but non-dry-run execution must stay blocked until compiler mutation law, rollback capture, deployment gate, and per-target mutation contracts are implemented. The current Hen compile-plan path is the promotion-planning spine.

6. **Continuity generalizes `NextComposeHint` without breaking the Z-cycle — the operational cycle is now load-bearing.** The Z-cycle is the abstract spine; its concrete VAK-substrate expression is `Khora compose → execution → Moirai rehear → Sophia witness → Aletheia routes Sophia → Epii inbox (closure_kind tagged) → Epii recompose → next-cycle seed`, with both env-propagation and gateway-record load-bearing on every traversal (per `docs/superpowers/plans/2026-05-22-vak-as-operational-substrate.md`, all 10 chips closed). Add `CrossCycleContinuity` and `ContinuityHint` for pending work, suppression windows, verification schedules, and per-pipeline seeds. The Aletheia→Epii append boundary carries a `closure_kind` discriminator (C4 chip, commit `d1c89ab`) that Epii recompose consults when planting the next-cycle seed. Existing Aletheia JSONL inbox and `recompose_pass()` must keep producing the current `NextComposeHint` behavior while the generalized continuity layer is introduced.

7. **M5-4 mediation and M5-3 IDE consume the same real state.** `EpiiAgentAccess.snapshot()` and deposit APIs should expose review counts, active candidates, route queues, orchestration states, governance gates, continuity hints, and promotion plans to Sophia/Anima/Pi/Aletheia and to the Tauri/Theia workbench. No IDE placeholder state is acceptable.

8. **Tests must exercise real persisted stores and real gateway-shaped flows.** Unit tests can use temporary directories, but they must write/read actual JSON state, route actual candidates, enforce actual review gates, run real promotion dry-runs, and prove state survives reload. Do not test mocked review objects or placeholder UI-only fixtures.

## Tranches

### Tranche 0 — Baseline Characterization and Compatibility Map

Deliverables:

- Inventory the current public API and serialized state for `ImprovementStore`, `ReviewStore`, `EpiiAgentAccess`, `InboxStore`, and `recompose_pass()`.
- Add characterization tests, before schema changes, that lock existing behavior for `propose/evaluate/promote`, `submit/inbox/resolve/history`, `deposit/snapshot`, Aletheia JSONL intake, and recompose human-review default.
- Capture fixture JSON files representing current `s5-improvement-state.json` and `s5-review-state.json` shapes for future migration tests.
- Confirm the existing hard-coded Hen timestamp in `epii-autoresearch-core/src/lib.rs` is either documented as a temporary implementation seam or targeted for replacement in Tranche 5.

Verification:

- `cargo test --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml`
- `cargo test --manifest-path Body/S/S5/epii-review-core/Cargo.toml`
- `cargo test --manifest-path Body/S/S5/epii-agent-core/Cargo.toml`
- Tests fail if existing state JSON cannot deserialize or if the current human-review, human-required, and non-dry-run promotion blocks regress.

### Tranche 1 — Typed Spine Core Schema

Deliverables:

- Add autoresearch-core modules for typed candidate, routing, destination, continuity, closure, content-type-register, and schema-version types.
- Implement `ImprovementCandidate` wrapping `ProposeRequest` with typed target subsystem, vector kind, surfacing pipeline, observation evidence, baseline/challenger refs, originating inbox/review/kernel links, sensitivity class, canonical-prefix VAK keys (CPF/CT/CP/CF/CFP/CS) where supplied by the upstream invocation, and surfaced actor/time.
- Implement closed `TargetSubsystem` and `ImprovementVectorKind` enums derived from the six operational-capacity specs.
- Implement `ClosureKind` enum that Epii recompose consults when planting the next-cycle seed (per the Aletheia→Epii append contract, C4 chip commit `d1c89ab`). The variants enumerate the operational closure registers Aletheia routes Sophia witness into — at minimum, those required by the live `Body/S/S5/epii-autoresearch-core` recompose path; treat the enum as closed and exhaustive at the typed boundary, with serde rejection on unknown variants.
- Implement `ContentTypeRegister` distinguishing `CT4a` from `CT4b` (per the CT4 harmonization, E1↔E2 chip commit `9abc13f`). Every candidate, route record, and review-stage record records which register it operates in, with explicit values, not inferred from context.
- Implement `PromotionDestination` and `MutationKind` enums, initially compile-plan-only, with governance-level mapping.
- Add serde migrations so legacy `ImprovementRun` records still load and get typed defaults only when sufficient data exists; legacy records without `closure_kind` or `ct_register` are loaded with explicit "legacy-unspecified" sentinel values that downstream code must handle, never silently defaulted.

Verification:

- Real JSON round-trip tests for every new enum and candidate envelope.
- Migration tests load Tranche 0 fixture JSON and then persist upgraded state without losing existing runs.
- Validation tests reject blank direction, missing observation evidence source URI, unsupported target/vector combinations, and malformed typed destinations.
- Existing `ProposeRequest` callers continue to compile and pass tests.

### Tranche 2 — Surfacing Intake and Routing Queues

Deliverables:

- Add `ImprovementStore::surface_candidate()` and `ImprovementStore::route_candidate()` APIs that persist candidates and route records under the autoresearch state root, each carrying `closure_kind` and `ct_register` fields from Tranche 1.
- Map Aletheia JSONL `InboxEntry` records to `ImprovementCandidate` for the Aletheia-disclosure pipeline while preserving current `InboxStore::append/list_pending` behavior. The Aletheia→Epii append boundary tags every entry with its `closure_kind` per the C4 contract (commit `d1c89ab`); Epii recompose reads `closure_kind` to plant the next-cycle seed in the matching register.
- Implement deterministic routing from `TargetSubsystem` to route queues for Anuttara, Paramaśiva, Paraśakti, Mahāmāyā, Nara, and Epii.
- Implement multi-target splitting, `cross_target_link`, and Anuttara-first blocking for candidates that include upstream Anuttara changes.
- Implement observation fingerprints and suppression windows for the Aletheia path first; leave explicit per-pipeline fingerprint strategies as open configuration for non-Aletheia pipelines.

Verification:

- Integration test writes a real Aletheia JSONL inbox file, runs intake, creates a typed candidate, creates a linked review item/run, and persists a route record.
- Multi-target test proves one surfaced observation can generate linked target-specific route records without duplicating the same run id incorrectly.
- Anuttara-first test proves downstream route records are blocked until the Anuttara route is resolved.
- Suppression test proves replaying the same observation fingerprint within the window does not create a duplicate candidate, while a materially changed observation does.

### Tranche 3 — Orchestration State Machine and Cross-Cycle Continuity

Deliverables:

- Implement `OrchestrationState`, `ReviewStage`, `RetryPolicy`, `DiscardReason`, and state transition APIs in autoresearch-core.
- Add persisted orchestration records linked to candidate id, route id, review item id, improvement run id, and optional promotion plan id.
- Implement timeout and abandonment policies from the autoresearch spine spec, including meta-event surfacing into the Epii-on-Epii route when a candidate stalls.
- Implement `CrossCycleContinuity`, `IntegrationVerificationEntry`, and generalized `ContinuityHint`.
- Keep `NextComposeHint` as the Aletheia specialization and update `recompose_pass()` tests to prove no behavior break.

Verification:

- State-machine tests cover each legal transition and representative illegal transitions with exact error assertions.
- Persistence tests create orchestration state, reload the store, transition it, and verify updated JSON state.
- Timeout test advances supplied clock/test timestamp and surfaces a real Epii-on-Epii meta candidate for a stalled route.
- Continuity test proves pending articulations, pending integrations, user-validation awaits, suppression windows, and verification schedules are visible in the next cycle.
- Existing `z_cycle_smoke` and `recompose_pass` tests continue to pass unchanged or with purely additive assertions.

### Tranche 4 — Review Core Governance Extension

Deliverables:

- Extend review-core with governance metadata: `ReviewCategory`, `GateKind`, `GovernanceLevel`, `GovernanceProfile`, `ReviewStageRecord`, and linked candidate/orchestration ids.
- Add review categories for standard improvement, deployment gate, user-final validation, recursive self-modification, Nara Anima-primary gate, Aletheia crystallisation, and canon-recognition/publication gate.
- Preserve `ReviewSource` compatibility while deciding whether new agent/source detail belongs in `ReviewSource` variants or structured metadata.
- Add resolution validation for recursive/user-final gates so only `ResolutionActor::Human` can approve load-bearing recursive modifications.
- Add audit fields sufficient for M5-3 review panes: source artifact refs, target subsystem, vector kind, governance level, required actors, and promotion destination when known.

Verification:

- Existing review tests for human-required items continue to pass.
- New tests prove an agent can defer but not approve/reject/revise human-required, recursive, and deployment-gate reviews.
- Nara-gate test proves Anima-primary governance is represented in metadata while final deployment still requires the configured gate.
- Review-history test proves governance metadata and linked candidate/orchestration ids survive persistence and sort correctly.

### Tranche 5 — Typed Dry-Run Promotion and Compiler-Mutation Boundary

Deliverables:

- Replace or wrap free-form `PromoteRequest.destination: String` with typed `PromotionDestination` while preserving a legacy string ingress path.
- Add per-destination governance mapping and dry-run compile-plan dispatch for seed/world/present scratchpad, Anuttara ontology/shape, Paramaśiva corpus/checkpoint, Paraśakti embedding/Lens-LoRA, Mahāmāyā policy/program, Nara adapter, Epii agent/spine updates, and sync/publication candidates.
- Add rollback-plan data structures to promotion plans, but do not execute rollback until non-dry-run mutation exists.
- Require an approved review resolution id and compatible governance category before promotion planning.
- Replace the current hard-coded Hen timestamp with caller-supplied or system-derived day/NOW input, with deterministic tests.

Verification:

- Promotion tests prove non-dry-run still returns the current blocked error until mutation law is wired.
- Typed destination tests prove incompatible target/vector/destination combinations are rejected.
- Approved-review test creates a real review item, resolves it as human where required, evaluates an improvement as keep, and obtains a dry-run Hen compile plan.
- Rejected/deferred review tests prove promotion planning is refused.
- Timestamp test proves compile plans use the supplied day/NOW rather than a hard-coded date.

### Tranche 6 — Epii Agent-Access and M5-4 Mediation Surface

Deliverables:

- Extend `EpiiAgentAccess.snapshot()` with active candidates, route queues, orchestration summary, governance-gate counts, pending human validations, continuity hints, and latest promotion plans.
- Extend `DepositRequest` or add a structured companion request for typed improvement candidates, validation gates, review-only deposits, and Aletheia crystallisations.
- Add API-shaped methods for spine state inspection, route detail lookup, review submission/resolution, and promotion dry-run planning; keep authority split intact so Anima/Aletheia can deposit but not resolve Epii gates.
- Update `gateway_methods()` with new method names only after handlers/tests exist in the gateway layer that calls these cores.
- Encode M5-4 actor expectations: Sophia-led by default, Anima-primary for Nara, Pi dispatch, Aletheia disclosure tracking, recursive Epii-on-Epii separation.

Verification:

- Agent-access tests use real temp stores to deposit a typed candidate, route it, create a review item and improvement run, then read a snapshot showing all linked state.
- Authority tests prove unsupported source agents still fail and Anima/Aletheia deposits cannot resolve review gates.
- Snapshot tests prove M5-4-specific governance profile data is exposed without leaking protected Nara/Graphiti body fields.
- Gateway-style tests, once gateway handlers exist, dispatch through the method layer rather than constructing store structs directly.

### Tranche 7 — M5-3 IDE/Workbench Contract Surface

Deliverables:

- Define stable JSON DTOs for the review pane, autoresearch spine-state inspector, route queues, candidate details, continuity hints, and promotion dry-run results.
- Align artifact refs with the IDE research URI model: `vault://`, `repo://`, `graph://bimba/`, `gnosis://`, `etymology://`, `pratibimba://`, `run://`, `review://`, and `improvement://`.
- Add privacy-filtered read models so protected Pratibimba/Nara content is represented by handles, summaries, readiness, and review requirements only.
- Provide the minimum backend methods that M5-3 can call to render real review/autoresearch state before any Theia/CodeMirror/Monaco frontend surfaces are built.
- Document compatibility mapping for existing `gnostic`/`atelier` UI names to `gnosis`/`etymology` if the UI has not migrated yet.

Verification:

- DTO tests serialize realistic snapshots from real stores and assert stable field names for frontend consumers.
- Privacy tests prove protected fields are absent from M5-3 DTOs even when source records contain kernel trajectory, Graphiti arc, or Pratibimba handles.
- Artifact-ref tests prove URI parsing/validation rejects raw absolute paths where a namespace URI is required.
- End-to-end UI-contract test creates a file/graph/run/review/improvement artifact set and returns linked DTOs with no placeholder values.

### Tranche 8 — Non-Aletheia Pipeline Adapters (staged by dependency)

Deliverables:

- Implement pipeline adapter interfaces for the five non-Aletheia surfacing sources, but land adapters one at a time behind real signal inputs.
- First wave: Anuttara SHACL/reasoner failure reports and Paraśakti embedding metric drift reports, because their trigger shapes are the most deterministic.
- Second wave: Mahāmāyā kernel-trace/RL/federation/genetic signals and Paramaśiva corpus/CPT/RAG gap signals, once upstream metrics and corpus manifests exist.
- Third wave: Nara dialogic/voice-drift/consent-corpus signals, preserving Anima-primary gate and anti-frequency-bias conditions.
- Epii-on-Epii meta adapter surfaces review inconsistency, review-time growth, voice-articulation drift, and spine-self-observation events from the live orchestration/review data.

Verification:

- Each adapter test consumes a real structured report file or persisted store state, not a mocked trait return, and produces a persisted `ImprovementCandidate`.
- SHACL adapter test routes repeated shape failures to Anuttara and blocks downstream dependent candidates.
- Paraśakti adapter test routes metric drift below threshold to Paraśakti with metric evidence preserved.
- Nara adapter test proves volume alone never triggers a refresh candidate; quality threshold plus drift/new-register/systematic-feedback is required.
- Epii-on-Epii adapter test proves recursive self-modification candidates require user-final validation before promotion planning.

### Tranche 9 — Full Spine Acceptance Scenario

Deliverables:

- Add an integration test harness that runs a complete production-shaped path: surfacing input -> typed candidate -> route -> review item -> improvement run -> evidence evaluation -> approved review -> typed dry-run promotion -> continuity hint -> M5-3 snapshot.
- Include at least one Aletheia-disclosure case, one Anuttara-first cross-target case, one Nara Anima-primary case, and one Epii-on-Epii recursive gate case.
- Ensure all state is persisted under temp roots using the same JSON/file layout as production cores.
- Add a regression test that older state files from Tranche 0 still load after all extensions.

Verification:

- All three S5 core crate test suites pass.
- The full acceptance tests fail if any step uses placeholder IDs, mocked review state, bypassed human gates, or non-dry-run mutation.
- `cargo test` output demonstrates real persisted-store, routing, review, promotion-plan, and snapshot behavior.
- Manual smoke command, if gateway handlers exist by then, exercises the same flow through the gateway rather than direct store calls.

## Dependencies

- S1' Hen compiler work must define the compiler mutation law before any non-dry-run promotion can be enabled. Until then this track only produces typed dry-run promotion plans.
- S4/Aletheia must preserve the JSONL inbox wire format or coordinate schema changes with the Aletheia-disclosure adapter. Current `InboxEntry` mirrors the S4 handoff and should remain the compatibility contract.
- M5-4 mediation needs agent identity and authority rules for Sophia, Anima, Pi, Aletheia, and Epii-on-Epii recursive review. This track can encode governance profiles but cannot invent final agent behavior semantics for other tracks.
- M5-3 IDE/workbench needs the shared artifact URI/ref model, namespace vocabulary, and gateway runtime context. This track should expose stable DTOs before frontend panels depend on them.
- S2 graph/Neo4j/n10s/GDS surfaces are prerequisites for non-Aletheia Anuttara, Paraśakti, Mahāmāyā, and Paramaśiva adapters that consume SHACL, graph, embedding, pathway, or corpus metrics.
- M4/Nara consent and protected-local policy are prerequisites for Nara corpus/voice-drift adapters. S5 must not receive raw protected body text as an autoresearch signal.
- S5/S5' sync/publication remains stubbed in `docs/specs/S/S5-S5i-SYNC.md`; canon-recognition/publication gates can be represented in review metadata now, but Notion/n8n/world sync execution belongs to a later sync implementation.
- Existing S5 core crates depend on local path crates such as `epi-s1-hen-compiler-core` and `portal-core`; schema changes must keep workspace path dependencies compiling in isolation with each crate's `Cargo.toml`.

## Open Decisions

- Should extended S5 state stay as multiple JSON files under the current state root, or move to a small embedded store once route queues, continuity, and orchestration records grow?
- Should `ReviewSource` expand with Sophia/Pi/Epii/Nara-specific variants, or should source remain coarse while actor and governance metadata carry the richer identity?
- What exact legacy migration policy applies when `direction: String` cannot be mapped cleanly to an `ImprovementVectorKind`?
- What are the canonical observation-fingerprint fields for each non-Aletheia pipeline?
- Which `PromotionDestination` variants are in the first production enum, and which remain reserved until their target subsystem has a real mutation contract?
- What exact operator workflow constitutes the deployment gate beyond current `requires_human` review resolution?
- When does a routine Paraśakti embedding retrain or Paramaśiva corpus refresh become load-bearing enough to require explicit user-final validation?
- How should Theia/OpenVSCode sidecars, if used by M5-3, return patch/evidence artifacts into Epii review without becoming a competing source of truth?
- Does `epii-agent/agent-contract.json` need to be versioned and updated in the same implementation tranche as `EpiiAgentAccess.gateway_methods()`, or should contract updates be a separate governance-reviewed artifact?
- Should Hen compile planning accept an explicit day/NOW timestamp from callers everywhere, or should S5 own a clock abstraction for deterministic tests and runtime calls?

## Success Criteria

- Existing `s5'.review.*`, `s5'.improve.*`, and `s5'.epii.*` behavior remains backward-compatible for current callers and legacy JSON state.
- S5/S5' can persist, route, inspect, and review typed improvement candidates across all six target subsystems with deterministic route records and governance metadata.
- Aletheia JSONL intake and `recompose_pass()` continue to work, while generalized continuity state carries pending work and verification schedules across cycles.
- Human-required, recursive self-modification, deployment, and user-final validation gates cannot be approved by agents in tests or through public APIs.
- Promotion planning is typed and review-bound, but non-dry-run mutation remains blocked until compiler mutation law, rollback, and deployment gates are implemented.
- M5-4 actors and M5-3 IDE surfaces can read real S5 state through `EpiiAgentAccess`/gateway-shaped DTOs without placeholder counts, fake review items, or protected-body leakage.
- Tests use real filesystem-backed stores, real JSON serialization, real route/review/improvement/promotion flows, and realistic signal fixtures. No mock/demo/placeholder tests satisfy readiness.
- At least one full acceptance scenario proves surfacing -> routing -> review -> evaluation -> approved dry-run promotion -> continuity -> IDE snapshot end to end.
