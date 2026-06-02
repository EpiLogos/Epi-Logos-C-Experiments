---
coordinate: "M5'"
status: "active-spine-spec"
updated: "2026-05-31"
companion_to: "[[M5'-SPEC]]"
consolidates: "[[epii-operational-capacities]] family"
depends_on:
  - "[[M5'-SPEC]]"
  - "[[m5-prime-agentic-ide-research]]"
  - "[[m5-prime-epii-on-anuttara-language-development]]"
  - "[[m5-prime-epii-on-paramasiva-ql-cpt-and-rag]]"
  - "[[m5-prime-epii-on-parashakti-graph-relational-ml]]"
  - "[[m5-prime-epii-on-mahamaya-process-reward-rl]]"
  - "[[m5-prime-epii-on-nara-qlora-dialogic-voice]]"
  - "[[m5-prime-epii-on-epii-self-referential-capacity]]"
s_side_reference: "[[S5-SPEC]]"
live_cores:
  - "Body/S/S5/epii-autoresearch-core"
  - "Body/S/S5/epii-review-core"
  - "Body/S/S5/epii-agent-core"
---

# [[M5']] The Autoresearch Self-Improvement Loop

## The spine that binds the six per-subsystem capacities to the live S5 mechanism layer

**Status:** M5'-level spine spec, consolidating the `epii-operational-capacities/` family with the existing S5/S5' implementation substrate. Drafted explicitly as a **consolidation document, not an invention document**.

**Reading order:** Read after `M5'-SPEC.md` (canonical M5' sixfold structure), `Idea/Bimba/Seeds/S/S5/S5-SPEC.md` (the S-side master spec for what is already implemented), and at least one sibling from `epii-operational-capacities/` (recommended: `m5-prime-epii-on-anuttara-language-development.md` as the convention-setter).

---

## §0 — Thesis: the spine is a binding document, not a new mechanism

The autoresearch self-improvement loop is not new. The **substrate is already in place at S5/S5'** — three live Rust cores (`epii-autoresearch-core`, `epii-review-core`, `epii-agent-core`), gateway methods (`s5'.improve.*`, `s5'.review.*`, `s5'.epii.*`), agent contract (`agent-contract.json` with `autoresearch_contract` block), and a master spec at `Idea/Bimba/Seeds/S/S5/S5-SPEC.md` §A/§B that names the loop as "the dynamic self-improvement spine of the Epii agent". The Möbius seam from Aletheia's JSONL handoff through Epii's inbox to `recompose_pass()` is wired. The dry-run promotion contract is enforced. The `requires_human` gate is non-bypassable by agents.

What has NOT been in place is the **consolidating spine document** that binds:

1. The **six per-subsystem capacities** at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/` (Epii's developmental work upon Anuttara, Paramaśiva, Paraśakti, Mahāmāyā, Nara, and Epii itself)
2. The **live S5 mechanism layer** (the cores, the gateway, the wire formats, the review-gating, the dry-run promotion)
3. The **seven specification gaps** the S5/S5' substrate-discovery surfaced (surfacing-layer per subsystem, vector-routing taxonomy, per-subsystem governance gating, integration-back-into-running-system, cross-cycle continuity, promotion-destination type system, the absence of any S-side seed-level working paper for the loop itself)

This spec fills the consolidation slot. It is M-side (M5'-level) because the spine's authoritative-purpose articulation lives at Epii as M-family subsystem; the S-side seed (a future companion at `Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md`) will mirror this from the implementation register.

**The discipline of consolidation**: every assertion in this spec either inherits an established convention (cite the existing source), consumes an existing mechanism (cite the live core), or fills a documented gap with a deliberate proposal (mark as proposal-pending-review). No invention masquerading as discovery. No re-specification of what's already in canon.

---

## §1 — What's already in place (brief — the spec inherits this; doesn't restate it)

### §1.1 Live Rust cores at `Body/S/S5/`

**`epii-autoresearch-core/`** (~690 LOC `src/lib.rs` + `src/inbox.rs` ~173 LOC + `src/recompose.rs` ~73 LOC + four test files):

- `ImprovementStore` API: `propose() → evaluate() → promote()` (the last dry-run-only until compiler mutation law is wired, blocking at `lib.rs:401`)
- `LoopState` enum: `Idle | Hypothesis | Evaluating | Deciding`
- `ImprovementRun` carries `direction: String` (currently free-form — a gap to fill)
- `ImprovementDecision`: `Keep | Discard`
- `EvaluationEvidence` with `dimensions × baseline/challenger scores × weights × notes × source_refs × optional kernel_evidence`
- `KernelEvidence` carries privacy-class, computation-source, advisory-only flag, interpretation-boundary, and a `KernelTrajectoryRef` (session_key, day_id, now_path, spacetimedb surfaces, graphiti arc)
- Persistence: JSON-on-disk at `${root}/s5-improvement-state.json`
- `InboxStore` (in `src/inbox.rs`): receives Aletheia's JSONL handoff per the wire format mirrored from `Body/S/S4/ta-onta/S4-5p-aletheia/modules/sophia-ingest.ts`; storage at `${VAULT}/Pratibimba/Epii/inbox/${session_id}.jsonl`
- `recompose_pass()` (in `src/recompose.rs`): the Möbius seam closure (C6); for each pending inbox entry emits `NextComposeHint { session_seed, proposed_p0_questions, challenger_artifacts }` + `RecomposeDecision`; **first-pass policy is universal `HumanReview`** — no autonomous keep/discard allowed at the recompose seam

**`epii-review-core/`** (~420 LOC):

- `ReviewStore` API: `submit() / inbox() / resolve() / history()`
- `ReviewSource`: `HumanGate | Anima | Aletheia | Autoresearch` (currently only 4 values — a gap for per-subsystem-source enrichment if needed)
- `ReviewStatus`: `Open | Resolved | Deferred`
- `ReviewDecision`: `Approve | Reject | Revise | Defer`
- `ReviewPriority`: `Low | Normal | High | Blocking`
- `ResolutionActor`: `Human | Agent(String)`
- **Hard governance gate** (lib.rs:261-269): if `requires_human = true`, an `Agent` actor can only `Defer`; only a `Human` may `Approve | Reject | Revise`
- `KernelReviewVisibility` envelope: advisory-only, with privacy and computation-source enforcement
- Persistence at `${root}/s5-review-state.json`

**`epii-agent-core/`** (~340 LOC):

- `EpiiAgentAccess.snapshot()` returns `EpiiAgentSnapshot` with review+improvement counts, active vectors, kernel-evidence count, live gateway methods list
- `EpiiAgentAccess.deposit()` accepts `DepositRequest` with `DepositType::{ReviewItem | ImprovementRequest | ValidationGate | AletheiaCrystallisation}`
- For `ImprovementRequest` deposits: creates **both** a review item AND a linked autoresearch run (via `ProposeRequest`) — this is the existing wire from agent-deposit to spine-entry
- Day-scoped inbox path: `Idea/Empty/Present/{day_id}/`
- 14 gateway methods enumerated at `lib.rs:318-338`

**`epii-agent/agent-contract.json`**: the canonical agent contract. Declares `coordinate: "S5/S5'"`, `agent_kind: "pi_agent"`, the live gateway methods, `spines: ["autoresearch", "review_inbox"]`, accepted deposit kinds, allowed Epii→Anima requests, and explicit `forbidden_authority` (e.g. `mutate_raw_runtime_state_without_review_record`). The `autoresearch_contract` block (lines 76-90) names inputs (`inbox_item | system_observation | code_state | spec_trace`) and outputs (`research_note | improvement_hypothesis | implementation_request | alignment_review`).

### §1.2 Master spec at `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`

Authoritative for S5/S5' (replaces older scattered S5/S5'/S5'Cx files). Key sections:

- **§A "Integral World-Boundary Base Technology"** — lists `Body/S/S5/epii-autoresearch-core` + `vendors/autoresearch/` as the S5.4' coordinate's home, gateway-routed via `s5'.improve.*`. "Epii self-improvement spine with baseline/challenger/evaluation/keep-discard dry-run promotion effects"
- **§B `s5'.improve.*` API methods**: `status | evaluate | propose | promote | history` — "[autoresearch] is the Epii agent's dynamic self-improvement spine: it should evaluate and refine skills, plugin resources, API parity, QL schema, retrieval quality, command ergonomics, and lower-layer build outputs". Sophia vectors drive proposals; Zeithoven generates challengers; Darshana evaluates baseline vs challenger; keep/discard promotes through S1' Hen residency law (Present → Seeds → World)
- **§B `s5'.review.*`**: durable review state under gateway state root, `epii-review-core` owns the law. "Items may resolve into human-facing Nara action, autoresearch hypothesis/evaluation, SEED carry-forward, or promotion through Hen residency law"
- **§B `s5'.epii.*`**: agent-access bridge — `s5'.epii.status` + `s5'.epii.deposit` live; user-orientation routes `s5'.epii.user.orientation | pratibimba.status | kairos.context` also live
- **Envelope-field map** (lines 526-547): `s_5_improvement_mode | s_5_baseline_artifact | s_5_challenger_artifact | s_5_evaluation_result | s_5_promotion_target | s_5_review_inbox_item | s_5_review_resolution | s_5_sophia_disclosure | s_5_zeithoven_next_form | s_5_moirai_weave_targets`
- **§D Key Architectural Decisions**, points 5-6: "autoresearch is the dynamic self-improvement spine of the Epii agent. Its effects return through every S-level because Epii is the #5 reflective/user position, not because autoresearch is a generic ambient service"

### §1.3 Shard specs

- `S5/S5/S5-4'-SPEC.md`: "Own Epii autoresearch as dynamic self-improvement spine, review/validation context, Darshana evaluation, Zeithoven challengers, and cross-period synthesis"
- `S5/S5/S5-5'-SPEC.md`: keep/discard, promotion, SEED generation, QL schema evolution, return to S0/S1
- `S5-TRACEABILITY-INDEX.md`, `S5'-TRACEABILITY-INDEX.md`: traceability of source corpus and conclusions for S5'-as-Epii (not Aletheia, not Notion)

### §1.4 Plans the loop already inherits from

- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-23-vendor-spine-pi-port.md`: the 4-seam ledger/compiler/inject architecture; S5/S5' contribution slot for "gnosis query handler, improvement loop state, T-bucket digest" (line 41); `s5/` ledger channel for "crystallisation / improvement events"
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-19-vak-musical-execution-z-thread.md`: Z-thread musical execution; assigns S5 Epii ownership of "recomposition/autoresearch intake" (line 7); architectural source for the `MusicalDiagnostic`/`RehearingEnvelope` test invocations in `improvement_loop.rs:911-1032`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md`: Möbius seam wired Anima→Aletheia→Epii; Tasks C5-C8 (lines 1581-1792) define the *exact* shape of `inbox.rs`, `recompose_pass`, and `NextComposeHint`. **This plan is the direct progenitor of the live inbox/recompose files.**
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-21-agent-led-coordinate-promotion-policy.md`: agent-led promotion policy (related to autoresearch's keep/discard → promotion stage)

### §1.5 Conventions inherited (the spine respects these as load-bearing constraints)

1. **First-pass `HumanReview` policy** at the Möbius seam (`recompose.rs:67-69`). Autonomous keep/discard is forbidden at the recompose seam.
2. **`requires_human` gate semantics** (`epii-review-core/src/lib.rs:261-269`): cannot be bypassed by agent actors. Only a `Human` actor may `Approve | Reject | Revise` when the gate is set.
3. **Dry-run-only promotion** until compiler mutation law is wired (`epii-autoresearch-core/src/lib.rs:400-404`). `promote()` returns a `PromotionPlan` with a Hen `CompilePlanSummary` but does not mutate running state.
4. **Source-anchored evaluation evidence**: `EvaluationEvidence.source_refs` with `kind | uri | coordinate | summary`; supplements with optional `kernel_evidence` carrying privacy-class, computation-source, advisory-only flag, interpretation-boundary, and a `KernelTrajectoryRef`.
5. **Agent-authority separation** enforced in `agent-contract.json` `forbidden_authority`: no bypass of Anima dispatch boundaries, no raw-runtime mutation without a review record.
6. **Day-scoped inbox path** `Idea/Empty/Present/{day_id}/` with NOW/session lineage in metadata (`agent-contract.json:55-74`).
7. **Construction-not-training discipline** at the meta-level: the autoresearch spine surfaces candidates but **never auto-promotes**. Per `m5-prime-epii-on-epii-self-referential-capacity.md:43`: "the autoresearch spine providing surfacing-of-candidates but never auto-promotion."

This spec does not relitigate any of the above. It inherits, cites, and binds.

---

## §2 — The spine's four operational phases

The autoresearch spine is structurally a **four-phase loop** that cycles continuously while the system is running:

```
                          [system in operation across M0-M5]
                                         │
                                         │  observed behaviour, anomalies, opportunities
                                         ▼
                          ╔══════════════════════════════════╗
                          ║  Phase 1: SURFACING               ║
                          ║  (per-subsystem observation        ║
                          ║   pipelines → candidate emission) ║
                          ╚══════════════════════════════════╝
                                         │
                                         │  candidate-improvement records
                                         ▼
                          ╔══════════════════════════════════╗
                          ║  Phase 2: ROUTING                 ║
                          ║  (taxonomy match → target          ║
                          ║   operational-capacity sibling)   ║
                          ╚══════════════════════════════════╝
                                         │
                                         │  routed candidate at target sibling
                                         ▼
                          ╔══════════════════════════════════╗
                          ║  Phase 3: ORCHESTRATION           ║
                          ║  (M5-1 articulation + M5-2 build  ║
                          ║   + M5-3 surface + M5-4 review)   ║
                          ╚══════════════════════════════════╝
                                         │
                                         │  reviewed-and-approved change
                                         ▼
                          ╔══════════════════════════════════╗
                          ║  Phase 4: INTEGRATION             ║
                          ║  (governed write-back to target   ║
                          ║   subsystem; cross-cycle hints)   ║
                          ╚══════════════════════════════════╝
                                         │
                                         │  changed system + new observable behaviour
                                         ▼
                          [next cycle's surfacing reads the changed system]
```

Each phase is concretely specified in §3-§7 below. The spine itself is the **continuous-operation discipline** that drives the four phases through the live cores, the six sibling capacities, the existing governance gates, and the integration hooks. None of the phases are speculative; each binds to existing infrastructure or fills a documented gap with a deliberate proposal.

The Z-cycle (Anima session_end → Aletheia membrane → Epii autoresearch → recompose → next-cycle compose hint, per `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md`) is the **canonical surfacing chain** for one class of input — Aletheia's JSONL handoff after a session. The full spine generalises this: Aletheia's chain is one of several surfacing pipelines, each feeding the same routing-orchestration-integration sequence.

---

## §3 — Phase 1: Surfacing (per-subsystem observation pipelines)

### §3.1 The structural problem

Today the only documented surfacing path is Aletheia's `sophia-ingest.ts` JSONL handoff — one wire format, one closure-kind discriminator (`rehear | force_closed`). This handles **session-end disclosure** (the Z-cycle's terminating Möbius seam) but not the broader class of surfaced observations:

- M2 Paraśakti graph-quality drift (link-prediction AUC drop; lens-rotation-consistency violation under RotatE)
- M3 Mahāmāyā process-reward signal anomalies (calculation pathways producing low coherence-score; Anuttara SHACL failures spiking)
- M4 Nara dialogic failures (voice-flattening; over-mirroring; lens-leakage; the five named failure modes from `m5-prime-epii-on-nara-qlora-dialogic-voice.md`)
- M1 Paramaśiva CPT-corpus gaps (derivational topics under-represented; perplexity drift on canonical eval)
- M0 Anuttara axiom-elaboration triggers (R-virtue refinement opportunities surfaced through repeated SHACL-edge-case observations; Kabbalah-Sephiroth-parallel additions surfaced through M5-5 Atelier work)
- M5 Epii-on-Epii meta-loop observations (Sophia review-decision inconsistency patterns; spine itself surfacing anomalies)

Each sibling spec at `epii-operational-capacities/` enumerates concrete trigger conditions for its target subsystem (per the §11 open trajectories in each). The spine spec's surfacing-phase consolidates these into a **per-subsystem observation-pipeline taxonomy**.

### §3.2 The six surfacing pipelines

Each target subsystem has a dedicated surfacing pipeline. All pipelines feed the same `ImprovementStore::propose()` API surface; they differ in **what they observe** and **how they derive candidate-improvement records**.

| Pipeline | Target | Observation source | Trigger conditions (per sibling spec §11) |
|---|---|---|---|
| **Aletheia-disclosure** | All (default) | `sophia-ingest.ts` JSONL handoff; Anima session_end closures | rehear / force_closed events; high disclosure-density sessions |
| **Anuttara-construction** | M0 Anuttara | SHACL evaluation failures; reasoner inconsistency detections; M5-5 Atelier proposals | repeated SHACL edge-cases; cross-tradition correspondence proposals; n10s axiom-update conversations |
| **Paramaśiva-derivational** | M1 Paramaśiva | CPT perplexity drift on canonical eval; auto-tagger derivational-corpus growth; GDS structural-pathway uncoverings | >10% perplexity rise; ~50k new derivational tokens; new path-pattern surfaced |
| **Paraśakti-relational** | M2 Paraśakti | Bimba-map growth events; new edge-type from Anuttara; embedding-quality metrics drift; cross-subsystem relation instantiation; Klein-flip pattern observations | metric thresholds in `epii-on-parashakti` §6; new edge-types; new lens-mode |
| **Mahāmāyā-calculation** | M3 Mahāmāyā | Kernel-trace accumulation; federated round thresholds; GDS path-mining results; new symbolic-program candidates from genetic programming; new SHACL shape from Anuttara introducing new step-level verifier | monthly RL training cadence; 100+ opted-in users for federated round; new pattern surfaced |
| **Nara-dialogic** | M4 Nara | High-quality dialogue-exchange accumulation; Anima voice-drift detection; user feedback aggregation; new register-requirement emergence | ~5k new reviewed exchanges; Anima qualitative voice-drift flag; new contemplative-context type |
| **Epii-on-Epii-meta** | M5 Epii | Sophia review-decision inconsistency patterns; review-time growth without proposal-complexity growth; voice-articulation drift; spine-self-observation events | patterns flagged by spine itself per `m5-prime-epii-on-epii-self-referential-capacity.md` §4.3 surfacing layer |

Each pipeline is a concrete observation-and-derivation pipeline that runs as a scheduled or event-driven process inside (or alongside) the running subsystem. All pipelines deposit candidate-improvement records through the existing `EpiiAgentAccess.deposit()` API with `DepositType::ImprovementRequest`, which already creates both a review item AND a linked autoresearch run (per `epii-agent-core/src/lib.rs`).

### §3.3 The candidate-improvement record shape

The existing `ProposeRequest` carries `direction: String` (free-form — a documented gap). The spine spec proposes extending this with a structured `ImprovementCandidate` envelope that wraps the existing `ProposeRequest`:

```rust
// PROPOSAL: extension to epii-autoresearch-core
// Does not break existing ProposeRequest API; adds a typed wrapper.

pub struct ImprovementCandidate {
    // Routing fields (filled by Phase 1 surfacing)
    pub target_subsystem: TargetSubsystem,       // see §4.1 taxonomy
    pub vector_kind: ImprovementVectorKind,       // see §4.2 taxonomy
    pub surfacing_pipeline: SurfacingPipelineId,  // which pipeline surfaced this
    pub observation_evidence: ObservationEvidence,// the observation that triggered surfacing

    // Existing autoresearch fields (mapped to ProposeRequest)
    pub direction: String,                        // human-readable direction summary
    pub baseline_artifact: ArtifactRef,           // current state being improved
    pub challenger_artifact: Option<ArtifactRef>, // proposed alternative (if any)

    // Linkage fields
    pub originating_inbox_entry: Option<InboxEntryId>,        // if surfaced via inbox
    pub originating_review_item: Option<ReviewItemId>,        // if surfaced via review
    pub originating_kernel_evidence: Option<KernelEvidence>,  // existing field

    // Provenance
    pub surfaced_at: Timestamp,
    pub surfaced_by: SurfaceActor,                // Aletheia | Anima | Sophia | Pi | KernelObserver
    pub sensitivity_class: SensitivityClass,      // public-current | protected-local | requires-review
}
```

This envelope is the **routing input** for Phase 2. Wrapping the existing `ProposeRequest` rather than replacing it preserves the live core's existing API while adding the taxonomy needed for per-subsystem routing.

### §3.4 The Aletheia-disclosure pipeline as the canonical reference

The existing Aletheia chain is the canonical reference implementation for what every other pipeline should structurally look like:

1. **Observation source** identifies the surfacing event (Aletheia: session_end closure)
2. **Wire format** carries the observation to the spine (Aletheia: `EpiiInboxEntry` JSONL)
3. **Inbox deposition** records the observation as an inbox entry (Aletheia: `InboxStore.append`)
4. **Recompose pass** transforms the inbox entry into a forward-looking candidate (Aletheia: `recompose_pass() → NextComposeHint`)
5. **Improvement-candidate emission** wraps the result in the `ImprovementCandidate` envelope (proposed)
6. **Deposit to autoresearch core** via `EpiiAgentAccess.deposit()` (existing)

The five other pipelines should follow this same architectural shape: observation-source → wire-format → inbox-deposition → transformation-pass → improvement-candidate-emission → deposit. The transformation-pass for non-disclosure pipelines is NOT `recompose_pass()` (which is the Möbius-seam closure for session-end specifically); each pipeline has its own pipeline-specific transformation that derives candidates from observations.

### §3.5 The privacy-class enforcement at surfacing time

Per `agent-contract.json:55-74` and the existing `KernelReviewVisibility` advisory protocol: every surfaced candidate carries a `sensitivity_class` declaration. Surfacing pipelines must classify correctly:

- **public-current**: observations of canonical-system behaviour that touch no user-private content; surfaceable through the standard agent-deposit path
- **protected-local**: observations that originated in user-private substrate (Nara journal/dream/oracle content); the observation summary must NOT carry user-content; only safe-current handles and aggregate-metric derivations
- **requires-review**: observations whose privacy-classification is ambiguous; must be human-reviewed before any deposit-action proceeds

This enforcement happens at the surfacing-pipeline implementation, not at the spine consolidation layer. Each pipeline's authors are responsible for the classification correctness.

---

## §4 — Phase 2: Routing (subsystem-vector taxonomy)

### §4.1 The TargetSubsystem taxonomy

The first routing dimension is **which subsystem the candidate targets**. The taxonomy is the six M-family subsystems:

```rust
pub enum TargetSubsystem {
    Anuttara,       // M0 — language axiom-elaboration
    Paramasiva,     // M1 — foundational-derivational CPT/RAG
    Parashakti,     // M2 — graph-relational ML
    Mahamaya,       // M3 — process-reward RL + federated + symbolic-genetic
    Nara,           // M4 — dialogic-voice QLoRA + DPO
    Epii,           // M5 — synthetic-encyclopedic CPT/RAG (self-referential meta-case)
}
```

This is a closed taxonomy. New subsystems would require canonical extension to the M-family — a major architectural change that requires the user-final-validation gate per CLAUDE.md ur-process.

### §4.2 The ImprovementVectorKind taxonomy

The second routing dimension is **what kind of improvement** is being proposed. Each target subsystem has its own vector-kind enum:

```rust
pub enum ImprovementVectorKind {
    // Anuttara vectors
    AnuttraAxiomElaboration { axiom_class: AxiomClass },
    AnuttraShapeRefinement,
    AnuttraSymbolicCorrespondence { source_tradition: String },

    // Paramaśiva vectors
    ParamasivaCorpusAddition { corpus_segment: CorpusSegmentKind },
    ParamasivaCorpusDeprecation { reason: String },
    ParamasivaSyntheticProofValidation,
    ParamasivaRetrievalGapFilling,

    // Paraśakti vectors
    ParashaktiEmbeddingRefresh { embedding_kind: EmbeddingKind },
    ParashaktiLensLoRARefinement { lens_id: u8 },
    ParashaktiNewEdgeTypeIntegration { edge_type: String },
    ParashaktiKleinHandlingRefinement,

    // Mahāmāyā vectors
    MahamayaProcessRewardRefinement,
    MahamayaFederatedRoundExecution,
    MahamayaSymbolicProgramPromotion { program_id: ProgramId },
    MahamayaPathwayPatternIntegration { pattern: PathwayPattern },

    // Nara vectors
    NaraDialogueCorpusAddition,
    NaraVoiceDriftCorrection { drift_kind: DriftKind },
    NaraDPORefinement,
    NaraRegisterExtension { register: String },

    // Epii vectors (self-referential meta-case)
    EpiiSpineMechanismRefinement { spine_phase: SpinePhase },
    EpiiVoiceCanonRefinement,
    EpiiPedagogyRegisterUpdate { depth: PedagogyDepth },
    EpiiAgentConfigurationUpdate { agent: AgentName, scope: AgentConfigScope },
}
```

This is a **proposal** for the typed vector taxonomy filling the gap left by the free-form `ImprovementRun.direction: String` in the live core. The proposal does not break the existing API — the typed enum can be serialised to fill `direction` while also being stored in a typed field for routing. Implementation requires extending `epii-autoresearch-core` with the enum and an additional field on `ImprovementRun`.

The taxonomy is **derived from the six sibling specs' §11 open trajectories**. Each vector-kind corresponds to a concretely-articulated improvement work-item from a sibling spec.

### §4.3 The routing table

Routing is a simple deterministic dispatch from `TargetSubsystem` to the corresponding sibling capacity:

```
TargetSubsystem::Anuttara    → m5-prime-epii-on-anuttara-language-development.md
TargetSubsystem::Paramasiva  → m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md
TargetSubsystem::Parashakti  → m5-prime-epii-on-parashakti-graph-relational-ml.md
TargetSubsystem::Mahamaya    → m5-prime-epii-on-mahamaya-process-reward-rl.md
TargetSubsystem::Nara        → m5-prime-epii-on-nara-qlora-dialogic-voice.md
TargetSubsystem::Epii        → m5-prime-epii-on-epii-self-referential-capacity.md
```

In the live implementation, this corresponds to:

- A `RoutedCandidate` record being created (extends `ImprovementCandidate` with the routing decision)
- The record being placed in a subsystem-specific routing queue (e.g., `routes/anuttara/`, `routes/paramasiva/`, etc., under the autoresearch state root)
- The corresponding operational-capacity sibling's M5-1 articulation queue receiving a pointer to the routed candidate

### §4.4 Routing ambiguity resolution

Some candidates may have ambiguous target-subsystem assignment. Examples:

- An Aletheia disclosure that touches multiple subsystems (e.g., a session where the user moves between Mahāmāya oracle-casting, Paraśakti chakral-resonance, and Nara dialogic interpretation)
- A cross-subsystem relation surfaced from Paraśakti's edge-mining that implies both a Paraśakti improvement-vector AND an Anuttara axiom-elaboration
- A meta-loop observation that surfaces both a target-subsystem improvement AND a spine-mechanism improvement (Epii-on-Epii)

Resolution policy:

1. **Multi-target candidates** spawn multiple routed records, one per target subsystem. Each record carries a `cross_target_link` pointing to the others, so the orchestration phase can coordinate the multi-target work.
2. **Ambiguous candidates** default to `TargetSubsystem::Epii` with a `vector_kind: EpiiSpineMechanismRefinement` indicating that the surfacing pipeline needs refinement to classify cleanly. The Epii-on-Epii sibling then receives the candidate as a meta-loop case.
3. **Cross-target Anuttara cases** are handled specially: Anuttara axiom changes are upstream of every other improvement vector (per the dependency partial-order in the improvement-vector map). When an Anuttara cross-target candidate is routed, the routing-record carries a `blocks_until_resolved` reference; downstream target-subsystem routings wait for the Anuttara routing to complete first.

### §4.5 Routing-table evolution

The taxonomy is itself evolvable. New vector-kinds emerge as the system matures — e.g., a new contemplative-context type at Nara warranting `NaraRegisterExtension`; a new lens added to MEF warranting a new `ParashaktiLensLoRARefinement` variant. Adding new vector-kinds is itself an `EpiiSpineMechanismRefinement` improvement: the spine taxonomy is updated through the spine's own governance.

This makes the taxonomy recursive-honest: the spine's own classification mechanism evolves through the spine's own loop.

---

## §5 — Phase 3: Orchestration (M5-1 → M5-2 → M5-3 → M5-4 work coordination)

### §5.1 The orchestration handoff

Once a candidate is routed to its target sibling, the orchestration phase coordinates the M5-1 (articulation) + M5-2 (backend) + M5-3 (frontend) + M5-4 (agentic review) + M5-5 (Atelier-if-needed) work that the sibling spec specifies. The handoff is structured:

```
[RoutedCandidate at target sibling's routing queue]
                  │
                  ▼
[M5-1 articulation conversation opens or queues]
   - Sophia (or Anima-primary at Nara) reviews
   - User developer-conversation continues or initiates
   - Articulation deposits as candidate-canon-addition
                  │
                  ▼
[M5-2 backend work specified]
   - Pi generates technical task-spec
   - Pipeline configuration update or training-run config
                  │
                  ▼
[M5-3 frontend affordance specified]
   - UI/UX surface for inspection or developer-engagement
                  │
                  ▼
[M5-4 agentic review workflow initialised]
   - Five-stage review (per Anuttara sibling §6.2):
     Sophia review → Anima review → Pi translation-check
     → Atelier archaeology (if needed) → User final-validation
                  │
                  ▼
[Approval decision deposited as ReviewResolution]
   - via epii-review-core::ReviewStore::resolve()
   - approval_review_resolution_id captured
```

### §5.2 The agentic-mediation surface per target

Different siblings have different governance leads (per the family's deliberate differentiation):

| Target | M5-4 governance lead | Notes |
|---|---|---|
| Anuttara | Sophia | with Anima aesthetic-coherence support; user final-validation for load-bearing axiom changes |
| Paramaśiva | Sophia + Epii (M5-0') co-review | Anima oversight light; CPT corpus-composition governance is technical-derivational |
| Paraśakti | Sophia | with Anima aesthetic-coherence; Pi dispatches GDS runs; user final-validation for new edge-types |
| Mahāmāyā | Sophia | with Anima for kernel-trace texture; Pi for training-run dispatch; user final-validation for new symbolic-programs entering kernel vocabulary |
| Nara | **Anima-primary** | (structurally distinctive; Sophia secondary; voice-fidelity is qualitative-gestalt); five Anima gates (admission / refresh-trigger / deployment / rollback / DPO-trigger) |
| Epii (self-referential) | Sophia (recursive) | with anti-self-justification structural separation per `epii-on-epii` §6.3; user final-validation for any recursive-modification proposal per §6.4 |

These differentiations are inherited from the sibling specs; the spine spec does not re-specify them.

### §5.3 The orchestration-state model

The spine maintains orchestration state for each routed candidate. Proposed extension to `epii-autoresearch-core`:

```rust
pub enum OrchestrationState {
    Routed,                              // Phase 2 just completed; awaiting orchestration handoff
    AwaitingArticulation,                // M5-1 conversation queued or in progress
    ArticulationDeposited,               // candidate-canon-addition exists; awaiting M5-2 specification
    BackendSpecified,                    // M5-2 task-spec ready; awaiting M5-3 frontend surface
    FrontendSpecified,                   // M5-3 affordance ready; awaiting M5-4 review
    ReviewInProgress { stage: ReviewStage },
    ReviewApproved { resolution_id: ReviewResolutionId },
    ReviewRejected { resolution_id: ReviewResolutionId, reason: String },
    AwaitingUserFinalValidation,         // load-bearing change pending user gate
    UserApproved,                        // ready for Phase 4 integration
    IntegrationInProgress,
    IntegrationCompleted,
    IntegrationFailed { reason: String, retry_policy: RetryPolicy },
    Discarded { reason: String, recyclable: bool },
}
```

This state machine extends the existing `LoopState` (`Idle | Hypothesis | Evaluating | Deciding`) with the orchestration-and-integration phases the live core doesn't yet enumerate. The mapping:

- `LoopState::Idle` → no orchestration in progress
- `LoopState::Hypothesis` → corresponds to `OrchestrationState::Routed` through `BackendSpecified`
- `LoopState::Evaluating` → corresponds to `ReviewInProgress`
- `LoopState::Deciding` → corresponds to `ReviewApproved | ReviewRejected | AwaitingUserFinalValidation`

The proposed extension is additive; the existing `LoopState` is preserved as a coarse summary of the finer-grained `OrchestrationState`.

### §5.4 Orchestration timeout and abandonment

Some candidates may stall — the M5-1 conversation never converges; the user never engages with the surfaced articulation; the technical specification reveals deeper issues than the candidate-scope. Orchestration handles this:

- **Timeout policy**: each `OrchestrationState` has a configurable timeout (default 30 days for `AwaitingArticulation`; default 14 days for active states post-articulation; default 60 days for `AwaitingUserFinalValidation`)
- **Quiescent-state observation**: if a candidate is in any state for longer than its timeout, the spine surfaces the stall as a meta-event (Epii-on-Epii surfacing-pipeline trigger)
- **Explicit abandonment**: a candidate can be explicitly abandoned with `OrchestrationState::Discarded { recyclable: true }`; the surfaced observation that triggered it remains in the inbox for potential re-surfacing in a future cycle
- **Permanent rejection**: a `ReviewRejected` decision marks the candidate as permanently-discarded; re-surfacing the same observation requires a meaningful change in the observation evidence

This prevents stale candidates from accumulating indefinitely while preserving the option for re-engagement when context shifts.

---

## §6 — Phase 4: Integration (governed write-back to target subsystem)

### §6.1 The integration discipline (inherits dry-run-only contract)

The live core's `promote()` returns a `PromotionPlan` with a Hen `CompilePlanSummary` but does NOT mutate running state (blocked at `lib.rs:401`). This is the **dry-run-only contract** that holds until "compiler mutation law is wired." The spine spec respects this contract: integration is **specified** but not auto-executed.

What "wired" means is itself a deliberate-construction question. The spine spec proposes:

**Compiler mutation law** = a governed mechanism by which approved improvements compile to executable changes against the target subsystem's running state, with:

1. **Per-subsystem mutation contracts** — each target subsystem has a defined set of `MutationKind`s that can be applied to it (e.g., `Anuttara::AddOWLAxiom`, `Paramasiva::SwapVoiceLoRA`, `Parashakti::HotReloadEmbeddingIndex`, `Mahamaya::SwapPolicyWeights`, `Nara::LoadDialogueAdapter`, `Epii::UpdateAgentConfig`)
2. **Compilation pipelines** — each `MutationKind` has a defined pipeline that compiles the `ImprovementCandidate` + `ReviewResolution` into executable mutation-artifacts (e.g., the OWL Turtle file to import via n10s; the LoRA adapter weights file to deploy; the policy-weights checkpoint to swap)
3. **Mutation execution gates** — beyond the existing `requires_human` review gate, mutation execution has an additional **deployment gate** that may require explicit user-acknowledge for production-state changes
4. **Rollback mechanisms** — every mutation execution captures the previous-state snapshot, with a `RollbackPlan` that can revert to the prior state if subsequent observation surfaces regression

### §6.2 The integration table per target subsystem

| Target | Integration mechanism | Affected runtime state |
|---|---|---|
| **Anuttara** | n10s import of new OWL axiom-set or SHACL shape-set; reasoner re-run; bimba-map node property update via S2 graph-services | Neo4j gnostic-namespace ontology; SHACL validation results |
| **Paramaśiva** | CPT'd voice-LoRA checkpoint swap at model-serving layer; RAG vector-index hot-reload with new corpus chunks | Active Paramaśiva inference path; theory-corpus retrieval index |
| **Paraśakti** | Embedding-store property update (`c_5_kge_embedding_rotate`, `c_5_rgcn_embedding`, `c_5_fastrp_embedding` per the sibling spec); Lens-LoRA adapter hot-load; cross-subsystem relational-training cache refresh | Active Paraśakti retrieval queries; Lens-LoRA inference path; GDS materialised projections |
| **Mahāmāyā** | Kernel-policy weight swap in eight-element kernel-tick orchestrator; new symbolic-program registration in calculation-pathway vocabulary; SHACL shape addition (when integration depends on Anuttara) | Active kernel-tick choreography; calculation-pathway program-set |
| **Nara** | QLoRA adapter load on Nara inference path; optional DPO-refined adapter swap; voice-canonical anchor update if structural change | Active Nara dialogic inference path |
| **Epii** | Agent-configuration update (Sophia / Anima / Pi / Aletheia behaviour); spine-mechanism configuration update (taxonomy extension, pipeline change, governance gate refinement); canonical-document update via vault-write | Live agent behaviour; spine's own operation |

Each integration mechanism inherits the dry-run-only contract until its compiler-mutation-law is explicitly wired. The spine's integration-phase outputs deployment-ready artefacts; the actual deployment is a deliberate operator act.

### §6.3 The Hen residency law as promotion path

Per `S5-SPEC.md` §B: "keep/discard promotes through S1' Hen residency law (Present → Seeds → World)". This means approved improvements follow a three-stage promotion path:

1. **Present** (`Idea/Empty/Present/{day_id}/`): the day-scoped working substrate where improvements are first deposited
2. **Seeds** (`Idea/Bimba/Seeds/`): the canonical-spec substrate where reviewed-and-approved improvements graduate
3. **World** (`Idea/Bimba/World/`): the crystallised-canon substrate where promoted improvements achieve canonical-authority status

The spine respects this residency law. Integration-phase artefacts:

- New seed-spec material → deposits at `Idea/Bimba/Seeds/M/M5'/...` (or appropriate target-subsystem seed location)
- Promoted seed → moves via governed action to `Idea/Bimba/World/`
- Pre-spec material → resides at `Idea/Empty/Present/{day_id}/` until reviewed

The Hen compiler (consumed at `epii-autoresearch-core/src/lib.rs:5` per the substrate-discovery report) is the mechanism that executes the Present → Seeds → World promotion as governed compile-passes.

### §6.4 The cross-subsystem integration coordination

When a `RoutedCandidate` has `cross_target_link` references (per §4.4), the integration phase coordinates the multi-target deployment. The protocol:

1. **Dependency-order resolution** — if any cross-target candidate is `TargetSubsystem::Anuttara`, that integration completes first (per §4.4 blocking-policy)
2. **Atomic-or-staged choice** — for non-Anuttara cross-target candidates, the integration can be either atomic (all-or-nothing, all targets receive their mutations as a single deployment) or staged (sequential deployment with observation between stages)
3. **Cross-target rollback discipline** — if any target's integration fails, the cross-target group rolls back together (atomic) or stops further deployment (staged)

The choice between atomic and staged is per-candidate, decided at the orchestration phase based on the cross-target relationship's nature.

---

## §7 — Cross-cycle continuity

### §7.1 The continuity problem

The existing `NextComposeHint` (per `recompose.rs:67`) seeds the next Z-cycle's compose phase with a new session_seed, proposed p0-questions, and challenger artefacts. This handles **session-end continuity** — the Möbius seam closing one Z-cycle and seeding the next.

What's NOT yet specified is **multi-cycle continuity for partially-resolved improvement runs**. Examples:

- An improvement candidate enters Phase 3 orchestration but stalls in `AwaitingArticulation` — across cycles, its presence as pending-work needs to be visible to surfacing-pipelines so they don't re-surface the same observation
- An improvement is approved in cycle N but integration is delayed to cycle N+2 because the compiler-mutation-law is not yet wired for its `MutationKind` — the integration needs to be tracked across cycles
- An improvement is integrated in cycle N and the next cycle's surfacing-pipelines need to observe the changed system to verify the improvement's effect

### §7.2 The continuity-state extension

Proposed extension to the cross-cycle state model:

```rust
pub struct CrossCycleContinuity {
    // Pending work carried across cycles
    pub pending_articulations: Vec<RoutedCandidateId>,
    pub pending_integrations: Vec<ApprovedCandidateId>,
    pub awaiting_user_final_validation: Vec<CandidateId>,

    // Observation suppression (avoid re-surfacing same observation)
    pub suppression_window: Map<ObservationFingerprint, SuppressionExpiry>,

    // Effect-verification scheduling
    pub verification_due: Vec<IntegrationVerificationEntry>,
}

pub struct IntegrationVerificationEntry {
    pub integrated_candidate_id: CandidateId,
    pub integrated_at: Timestamp,
    pub verification_due_at: Timestamp,
    pub expected_observation_delta: ExpectedDelta,  // what the surfacing-pipeline should observe
    pub actual_observation: Option<ObservationEvidence>,  // filled when verification runs
    pub verification_result: Option<VerificationResult>, // success | unchanged | regression
}
```

This adds three concerns:

1. **Pending-work visibility** — pending articulations, integrations, and user-validation-awaiting candidates are visible to subsequent cycles' surfacing pipelines so the pipelines can suppress duplicate surfacing
2. **Observation suppression** — when an observation has been surfaced as a candidate, the same observation-fingerprint is suppressed from re-surfacing for a configurable window (default 7 days for non-stalled candidates; extends when candidates stall)
3. **Effect verification** — when an integration completes, a verification entry is scheduled; the next cycle's surfacing-pipeline checks whether the expected observation-delta materialised; verification results feed back into Epii-on-Epii meta-loop surfacing (so the spine learns whether its integrations actually fix what they intended to fix)

### §7.3 The NextComposeHint generalisation

The existing `NextComposeHint` is specialised for session-end recompose (Aletheia-disclosure pipeline). The generalised form:

```rust
pub struct ContinuityHint {
    // Specialised hints for specific pipelines
    pub session_seed: Option<SessionSeed>,                    // Aletheia case
    pub proposed_p0_questions: Vec<P0Question>,               // Aletheia case
    pub challenger_artifacts: Vec<ArtifactRef>,               // general case

    // Generalised continuity content
    pub carried_pending_work: CrossCycleContinuity,
    pub verification_schedule: Vec<IntegrationVerificationEntry>,
    pub suppressed_observations: Vec<ObservationFingerprint>,

    // Pipeline-specific seeding
    pub per_pipeline_seeds: Map<SurfacingPipelineId, PipelineSeed>,
}
```

`NextComposeHint` becomes one specialisation of `ContinuityHint` (the Aletheia case); other pipelines get their own continuity-hint subtypes as they're implemented.

---

## §8 — Promotion-destination type system

### §8.1 The free-form-String gap

`PromoteRequest.destination: String` (in the live core) is free-form. This makes promotion-routing brittle and ungovernable at the type-system level. The spine spec proposes a closed type system:

```rust
pub enum PromotionDestination {
    // Per-target-subsystem destinations
    AnuttraOntologyExtension { axiom_target: AxiomTarget },
    AnuttraShapeAddition { shape_target: ShapeTarget },
    ParamasivaCorpusInclusion { corpus_destination: CorpusDestination },
    ParamasivaVoiceLoRADeployment { lora_version: LoRAVersion },
    ParashaktiEmbeddingDeployment { embedding_kind: EmbeddingKind, version: EmbeddingVersion },
    ParashaktiLensLoRADeployment { lens_id: u8, version: LoRAVersion },
    MahamayaPolicyWeightDeployment { policy_version: PolicyVersion },
    MahamayaSymbolicProgramRegistration { program_id: ProgramId },
    NaraDialogueAdapterDeployment { adapter_version: AdapterVersion },
    EpiiAgentConfigDeployment { agent: AgentName, config_version: ConfigVersion },
    EpiiSpineMechanismUpdate { spine_component: SpineComponentId },

    // Hen-residency destinations (cross-cutting)
    SeedDeposit { seed_path: VaultPath },
    WorldPromotion { world_path: VaultPath, source_seed_path: VaultPath },
    PresentScratchpad { day_id: DayId, path_suffix: String },

    // Special destinations
    KernelLawUpdate { law_id: KernelLawId },                  // requires highest governance
    SpaceTimeDBTableChange { module: ModuleId, change: TableChange },  // S3' surface
    SpacedRetrievalReindexing { affected_namespaces: Vec<NamespaceId> }, // RAG re-indexing
}
```

Each variant is a typed destination with the artifact-shape needed for compilation. The Hen compiler dispatches on this enum to determine which compile-pass executes.

### §8.2 Destination-governance mapping

Different destinations require different governance levels:

| Destination | Governance level |
|---|---|
| `SeedDeposit`, `PresentScratchpad` | Standard (Sophia/Anima/Pi review; user-final for load-bearing) |
| `WorldPromotion` | Elevated (explicit user-final-validation always required per Hen residency law) |
| `AnuttraOntologyExtension`, `AnuttraShapeAddition` | Elevated (axiom changes are upstream of every other vector) |
| `EpiiSpineMechanismUpdate`, `EpiiAgentConfigDeployment` | Elevated-recursive (Sophia-on-Sophia anti-self-justification protocol; user-final-validation gate) |
| `KernelLawUpdate` | Highest (user-final-validation is non-negotiable; multi-stage review with Atelier archaeology) |
| `SpaceTimeDBTableChange` | Elevated (live shared-state changes affect all connected users) |
| Per-subsystem deployments (LoRA, embeddings, weights, etc.) | Standard with deployment-gate (additional acknowledgement before production swap) |

These mappings are inherited from the sibling specs' governance specifications and are codified here as the spine's deployment-governance table.

---

## §9 — The construction-not-training discipline at the meta-level (recursion-honest)

### §9.1 The disciplinary core

Per `m5-prime-epii-on-epii-self-referential-capacity.md` §4.2 (which itself inherits from the convention-setting Anuttara sibling's discipline):

> At no level of recursion does auto-promotion happen. Whether we're at the level of "M1 Paramaśiva improvement candidate" or "spine-surfacing-mechanism improvement candidate" or "spine-improvement-mechanism improvement candidate," the same deliberate-governance discipline applies. This is what keeps the recursion from collapsing into runaway self-modification.

The spine spec inherits this as load-bearing. Concrete operational implications:

1. **No surfacing pipeline auto-promotes** — every surfaced candidate becomes a proposal, never a direct mutation
2. **No routing decision auto-executes** — routing places the candidate in a queue; orchestration must initiate engagement explicitly
3. **No orchestration phase bypasses review** — even the M5-1 articulation conversation produces deposits, not mutations
4. **No integration phase deploys without approval** — the dry-run-only contract holds until explicit compiler-mutation-law wiring with explicit deployment-gate
5. **No meta-loop refinement auto-executes** — when the spine refines itself, the refinement passes through the same five-phase governance discipline as any other improvement

### §9.2 The Sophia-on-Sophia anti-self-justification protocol

For `EpiiSpineMechanismRefinement` candidates specifically, the Sophia-on-Sophia review protocol from `m5-prime-epii-on-epii-self-referential-capacity.md` §6.3 applies:

1. Pi prepares the pattern-evidence in structured form (not Sophia hearing about herself informally)
2. Sophia reviews the pattern with explicit awareness that the subject is Sophia; review-output marked as self-review
3. Anima provides aesthetic-coherence check on whether Sophia's self-review reads as rigorous-not-defensive
4. **User final-validation is required before any refinement to Sophia's criteria is enacted**

This applies to all four agents (Sophia-on-Sophia, Anima-on-Anima, Pi-on-Pi, Aletheia-on-Aletheia). It is structurally non-negotiable.

### §9.3 The construction-not-training meta-claim

The spine spec's overall claim: even though the M-stack's interior positions (M1, M2, M3, M4) use **training** paradigms (CPT, KGE/GDS, process-reward RL, QLoRA respectively), the **spine that surfaces, routes, orchestrates, and integrates improvements** is itself **constructed, not trained**. The spine's mechanisms are deliberate human-articulated artefacts; they evolve through governed canon-promotion, not gradient descent.

This is the structurally-correct discipline for the meta-level. Without it, the recursion-honesty fails: if the spine could train itself, the system could optimise its own optimisation-criteria without external check, which is the canonical alignment failure mode. With construction-discipline at the meta-level, the system is bounded-by-construction — every refinement to the system's improvement-mechanism is itself a deliberate-construction act under the same governance.

---

## §10 — The full operational loop in one picture

```
                       [system operating across M0-M5]
                                    │
                                    │  observations across all subsystems
                                    ▼
        ┌─────────────────────────────────────────────────────────┐
        │   Phase 1: SURFACING                                     │
        │                                                          │
        │   ┌────────────────┐ ┌────────────────┐ ┌──────────────┐│
        │   │ Aletheia-      │ │ Per-subsystem  │ │ Epii-on-Epii ││
        │   │ disclosure     │ │ pipelines      │ │ meta-loop    ││
        │   │ pipeline       │ │ (Anuttara-     │ │ pipeline     ││
        │   │ (canonical)    │ │  Paramaśiva-   │ │              ││
        │   │                │ │  Paraśakti-    │ │              ││
        │   │                │ │  Mahāmāya-     │ │              ││
        │   │                │ │  Nara-)        │ │              ││
        │   └───────┬────────┘ └───────┬────────┘ └──────┬───────┘│
        │           │                  │                  │        │
        │           ▼                  ▼                  ▼        │
        │   [ImprovementCandidate envelope wrapping ProposeRequest]│
        │   - target_subsystem, vector_kind, surfacing_pipeline    │
        │   - observation_evidence, sensitivity_class              │
        │   - source_refs, kernel_evidence (existing fields)       │
        └──────────────────────────┬──────────────────────────────┘
                                    │
                                    ▼  deposit via EpiiAgentAccess.deposit()
                                       (creates review item + autoresearch run)
        ┌─────────────────────────────────────────────────────────┐
        │   Phase 2: ROUTING                                       │
        │   - TargetSubsystem dispatch (6-value closed enum)        │
        │   - ImprovementVectorKind classification (per-target taxonomy)│
        │   - Cross-target link resolution                          │
        │   - Anuttara-first dependency-order enforcement           │
        └──────────────────────────┬──────────────────────────────┘
                                    │
                                    ▼
        ┌─────────────────────────────────────────────────────────┐
        │   Phase 3: ORCHESTRATION                                 │
        │   Routed to corresponding sibling capacity:               │
        │                                                          │
        │   M5-1 articulation → M5-2 backend spec →                │
        │   M5-3 frontend affordance →                             │
        │   M5-4 agentic review (Sophia/Anima/Pi/Aletheia          │
        │      with per-target governance lead) →                  │
        │   User final-validation (for load-bearing changes) →     │
        │   ReviewResolution deposited via                         │
        │      epii-review-core::resolve()                         │
        └──────────────────────────┬──────────────────────────────┘
                                    │
                                    ▼  approved_review_resolution_id captured
        ┌─────────────────────────────────────────────────────────┐
        │   Phase 4: INTEGRATION                                   │
        │   - PromotionDestination typed enum dispatch              │
        │   - Hen residency law: Present → Seeds → World            │
        │   - Per-target compilation pipeline                       │
        │   - Deployment-gate (additional acknowledge)              │
        │   - Rollback plan captured                                │
        │                                                          │
        │   (DRY-RUN ONLY until compiler mutation law wired         │
        │    per existing live-core contract at lib.rs:401)         │
        └──────────────────────────┬──────────────────────────────┘
                                    │
                                    ▼  integrated state + verification scheduled
        ┌─────────────────────────────────────────────────────────┐
        │   Cross-cycle continuity (§7)                            │
        │   - Pending work visible to next-cycle surfacing          │
        │   - Observation suppression (avoid re-surfacing)          │
        │   - Verification schedule (did integration work?)         │
        │   - ContinuityHint generalises NextComposeHint            │
        └──────────────────────────┬──────────────────────────────┘
                                    │
                                    ▼  next cycle's surfacing
                       [system observing changed state]
                       
                       << continuous loop under deliberate governance >>
```

The loop is **continuous** but **never autonomous**. Every phase has its governance gates; every gate has its discipline; the discipline holds at every level of recursion.

---

## §11 — Open spec gaps (what the spine spec leaves for follow-up)

This spec consolidates substantial substrate but leaves real follow-up work:

1. **Pipeline implementation for non-Aletheia surfacing** — the five non-Aletheia pipelines (Anuttara-construction, Paramaśiva-derivational, Paraśakti-relational, Mahāmāya-calculation, Nara-dialogic, Epii-on-Epii-meta) have surfacing-trigger specifications but no implementation. Each needs a dedicated implementation spec or a consolidated implementation tranche.
2. **`ImprovementCandidate` envelope extension to `epii-autoresearch-core`** — the proposed type wrapping the existing `ProposeRequest` requires Rust-side schema extension. Backward-compat migration plan needed.
3. **`OrchestrationState` machine implementation** — the proposed extended state machine requires Rust-side implementation, persistence schema, and migration.
4. **`PromotionDestination` typed enum implementation** — replaces free-form `destination: String`; requires migration + Hen compiler dispatch update.
5. **Compiler mutation law wiring** — the elephant in the room. `promote()` is dry-run-only until this is wired. Each per-target `MutationKind` needs its mutation-execution pipeline implemented with rollback discipline.
6. **`ContinuityHint` generalisation** — the proposed extension of `NextComposeHint` requires careful migration; existing Aletheia-disclosure path must remain functional during transition.
7. **`CrossCycleContinuity` persistence and visibility** — pending-work tracking across cycles needs storage schema + access pattern + UI affordance at M5-3 spine-state-inspector.
8. **Effect-verification mechanism** — the verification entries need both a scheduler that runs them and a feedback path back into Epii-on-Epii surfacing. Implementation tranche.
9. **The S-side seed working paper** — this M5'-level spec needs a mirror at `Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md` that articulates the same spine from the implementation-register side. Currently absent (per substrate-discovery §4).
10. **Per-pipeline observation-fingerprint definition** — for observation-suppression to work, each pipeline needs to define what counts as the same observation. Implementation tranche per pipeline.
11. **Deployment-gate concrete protocol** — beyond `requires_human` review-gating, deployment-gates for production-state changes need their concrete operator workflow specified.
12. **Cross-target atomic-vs-staged choice policy** — when cross-target candidates arise, the policy for choosing atomic vs staged integration needs articulation per target-combination.

These are real work-items, not hand-wavy speculations. Each is a tractable specification or implementation tranche.

---

## §12 — What this spec delivers

1. **The spine is named as a consolidation, not an invention** — every assertion either inherits canonical-substrate or fills a documented gap with a deliberate proposal. No re-spec of what's already canon.
2. **The substantial S5/S5' substrate is properly cited** — the three live Rust cores (`epii-autoresearch-core`, `epii-review-core`, `epii-agent-core`), the gateway methods (`s5'.improve.*`, `s5'.review.*`, `s5'.epii.*`), the agent contract, the master `S5-SPEC.md`, the shard specs, the plans. All explicitly referenced.
3. **The four-phase operational loop is specified end-to-end** — Surfacing → Routing → Orchestration → Integration, with each phase grounded in existing infrastructure plus deliberate proposals for the documented gaps.
4. **The six sibling capacities are properly bound** — each `TargetSubsystem` routes to its sibling; the per-target governance differentiation (Anima-primary at Nara, Sophia-primary elsewhere, Sophia-on-Sophia at Epii-self) is preserved.
5. **The construction-not-training discipline at meta-level is explicit** — at no level of recursion does auto-promotion happen; the Sophia-on-Sophia anti-self-justification protocol is honoured; user-final-validation gate at load-bearing changes is structurally non-bypassable.
6. **The seven gaps from substrate-discovery are addressed with deliberate proposals** — surfacing pipelines per subsystem (§3.2), vector-routing taxonomy (§4.2), per-subsystem governance gating (§5.2), integration-back-into-running-system (§6.1-§6.2), cross-cycle continuity (§7), promotion-destination type system (§8), the S-side seed working paper (flagged as §11.9 follow-up).
7. **The Z-cycle Aletheia chain is preserved as canonical-reference** — the existing Möbius-seam closure remains the architectural pattern that other pipelines should structurally mirror.
8. **The Hen residency law (Present → Seeds → World) is the canonical promotion path** — inherited from S5-SPEC §B, codified as the cross-cutting destination type in §8.
9. **The dry-run-only contract is respected** — integration phase specifies deployment-ready artefacts but does not auto-deploy until compiler-mutation-law is wired through deliberate-construction process.
10. **The recursion-honesty is structural** — Epii-on-Epii spine-mechanism refinements pass through the same five-phase governance as any other improvement; the spine evolves itself through the spine's own discipline.
11. **The 12 open follow-up gaps are explicit** — real implementation tranches and specification follow-ups, not hand-wavy speculation. Each tractable.

---

## §13 — Implementation milestones (rough sequencing)

This is suggested ordering, not strict timing. Some milestones can proceed in parallel.

### Milestone 1: spine type-extensions to live cores

- Implement `ImprovementCandidate` envelope wrapping `ProposeRequest`
- Implement `TargetSubsystem` + `ImprovementVectorKind` enums
- Implement `OrchestrationState` extension to `LoopState`
- Implement `PromotionDestination` typed enum replacing `destination: String`
- Backward-compat migration for existing state files

### Milestone 2: Aletheia-disclosure pipeline alignment

- Existing Aletheia chain refactored to emit `ImprovementCandidate` envelope
- Verify Z-cycle smoke tests still pass
- Document the Aletheia pipeline as canonical-reference

### Milestone 3: Anuttara-construction pipeline

- Implement SHACL-evaluation-failure surfacing
- Implement reasoner-inconsistency-detection surfacing
- Implement M5-5-Atelier proposal surfacing
- Wire to spine

### Milestone 4: Per-subsystem pipelines (parallel tranches)

- Paramaśiva-derivational pipeline
- Paraśakti-relational pipeline
- Mahāmāya-calculation pipeline
- Nara-dialogic pipeline
- Epii-on-Epii-meta pipeline

### Milestone 5: Routing infrastructure

- Implement target-subsystem routing dispatch
- Implement vector-kind classification
- Implement cross-target link resolution
- Implement Anuttara-first dependency-order enforcement

### Milestone 6: Orchestration state machine

- Implement extended `OrchestrationState` machine
- Implement orchestration-handoff to sibling capacities
- Implement per-target governance dispatch
- Implement timeout/abandonment policy

### Milestone 7: Integration mechanism (per `MutationKind`)

- Define compiler-mutation-law for each per-target `MutationKind` (deliberate-construction work; one `MutationKind` at a time)
- Implement compilation pipelines
- Implement deployment-gates
- Implement rollback-plan capture

### Milestone 8: Cross-cycle continuity

- Implement `CrossCycleContinuity` state extension
- Implement observation-suppression
- Implement effect-verification scheduler
- Implement `ContinuityHint` generalisation

### Milestone 9: M5-3 spine-state-inspector

- Implement the inspector UI per `m5-prime-epii-on-epii-self-referential-capacity.md` §5.4
- Surface the spine-state at any moment to user
- Show recent meta-loop events with provenance

### Milestone 10: S-side seed working paper

- Mirror this M5'-level spec at `Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md`
- Articulate from implementation-register side
- Cross-reference both directions

---

## §14 — Spec deltas

### §14.1 To `M5'-SPEC.md`

- Annotation that the autoresearch self-improvement loop is specified at this companion spec (cross-reference)
- The §7 "Other Epii Functions" subsection or equivalent should list the spine as one of Epii's load-bearing capacities

### §14.2 To `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`

- Annotation in §A and §B that the M-side spine articulation lives at `m5-prime-autoresearch-self-improvement-loop.md`
- §B `s5'.improve.*` documentation extension to note the typed `ImprovementCandidate` envelope (when implemented)
- §B `s5'.review.*` documentation extension to note per-subsystem-source enrichment (when ReviewSource taxonomy extended)

### §14.3 To the six sibling capacity specs

Each sibling should add a brief cross-reference to this spine spec, noting that the autoresearch spine is what surfaces and routes the improvement-candidates the sibling spec describes how to handle.

### §14.4 New companion to produce

- `Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md` — the S-side seed working paper mirroring this M-side articulation from the implementation-register

---

## Sources

### Live Rust cores (inherited as substrate; not re-specified)

- `Body/S/S5/epii-autoresearch-core/src/lib.rs` (~690 LOC) — `ImprovementStore`, `LoopState`, `EvaluationEvidence`, `KernelEvidence`, dry-run promote contract
- `Body/S/S5/epii-autoresearch-core/src/inbox.rs` (~173 LOC) — `InboxStore` for Aletheia JSONL handoff
- `Body/S/S5/epii-autoresearch-core/src/recompose.rs` (~73 LOC) — `recompose_pass()` Möbius seam closure
- `Body/S/S5/epii-autoresearch-core/tests/{improvement_loop,inbox_contract,recompose_pass,z_cycle_smoke}.rs` — behavioural contracts
- `Body/S/S5/epii-review-core/src/lib.rs` (~420 LOC) — `ReviewStore`, `ResolutionActor::requires_human` gate
- `Body/S/S5/epii-agent-core/src/lib.rs` (~340 LOC) — `EpiiAgentAccess`, `DepositRequest`, 14 gateway methods
- `Body/S/S5/epii-agent/agent-contract.json` — canonical agent contract with `autoresearch_contract` block

### Master specs (cited as canonical)

- `Idea/Bimba/Seeds/S/S5/S5-SPEC.md` §A and §B — authoritative S5/S5' definition; `s5'.improve.*`, `s5'.review.*`, `s5'.epii.*` API methods; envelope-field map
- `Idea/Bimba/Seeds/S/S5/S5/S5-4'-SPEC.md` — S5.4' shard for autoresearch + review + Darshana + Zeithoven + cross-period synthesis
- `Idea/Bimba/Seeds/S/S5/S5/S5-5'-SPEC.md` — S5.5' shard for keep/discard, promotion, SEED generation, QL schema evolution
- `Idea/Bimba/Seeds/S/S5/S5'-TRACEABILITY-INDEX.md` — traceability for S5'-as-Epii

### M-side family

- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` — canonical M5' sixfold structure
- `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md` — agentic IDE research
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md` — convention-setting sibling
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md` — recursive meta-case; especially §4.2 construction-not-training discipline and §6.3 Sophia-on-Sophia anti-self-justification protocol

### Plans (inherited as architectural source)

- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-23-vendor-spine-pi-port.md` — 4-seam ledger/compiler/inject architecture
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-19-vak-musical-execution-z-thread.md` — Z-thread musical execution
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/plans/2026-05-22-vak-as-operational-substrate.md` — Möbius seam wiring; direct progenitor of inbox.rs/recompose.rs
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-21-agent-led-coordinate-promotion-policy.md` — promotion policy
- `Idea/Bimba/Seeds/M/M5'/Legacy/plans/2026-03-07-m5-epii-design.md`, `2026-03-07-m5-epii-implementation.md` — foundational M5/Epii design

### CLAUDE.md (load-bearing ur-process)

- The Human = Ontological Vision + Final Validation principle; AI = Technical Translation + Implementation + Educational Guidance
- The user-final-validation gate at load-bearing changes is structurally non-bypassable

---

End of spine spec. The autoresearch self-improvement loop is now consolidated as a documented M-side spine binding the six sibling per-subsystem capacities to the live S5/S5' mechanism layer. Implementation milestones per §13; spec-deltas per §14; follow-up gaps per §11. The next concrete spec pass is the S-side seed working paper at `Idea/Bimba/Seeds/S/S5/autoresearch-loop-seed.md` mirroring this articulation from the implementation register.
