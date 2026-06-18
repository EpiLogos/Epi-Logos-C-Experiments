---
coordinate: "M5'"
c_4_artifact_role: "seed"
c_1_ct_type: "CT1"
c_3_crystallised_at: "2026-06-18"
c_0_source_coordinates:
  - "[[M5'-SPEC]]"
  - "[[m5-prime-autoresearch-self-improvement-loop]]"
  - "[[S4'-SPEC]]"
  - "[[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]"
  - "[[epi-logos-kernel-spec]]"
  - "[[mental-pole-mechanics]]"
  - "[[M'-USER-CONTEXT-SKILL-SPEC]]"
  - "[[33-harmonic-energy-channel-handoff]]"
c_0_related_coordinates:
  - "[[S4']]"
  - "[[S5']]"
  - "[[M0']]"
  - "[[M4']]"
  - "[[M5']]"
---

# [[M5']] Evolver Typed [[VAK]] Choreography

This is the operational typed-VAK view of the [[m5-prime-autoresearch-self-improvement-loop]]. It maps the evolver / Darwinian-Godel-Machine loop onto existing [[S4']] and [[S5']] primitives. It does not introduce a new optimizer, gateway, carrier, VAK field, review authority, archive law, mutation primitive, or learning-log substrate.

The structural spine remains [[m5-prime-autoresearch-self-improvement-loop]]. This document says how that spine runs as a typed choreography once the upstream Cycle 3 Streams A-G from [[33-harmonic-energy-channel-handoff]] have landed.

## §0 - Inherited Decisions

This spec inherits the [[33-harmonic-energy-channel-handoff]] frontmatter `dev_decisions` block without re-debate:

> - "E_4 = personal/Nara substrate (PASU + kairos + q_personal + q_identity + planet_degrees + oracle charges + Nara-LoRA-adapted user content). Final."
> - "E_5 = multi-channel harmonic substrate (lens_resonance_72 + audio_octet[8] + nodal_quartet[4] + planetary_chakral + mahamaya + codon_rotation_projection + q_cosmic) — N-channel EBM. Final."
> - "E_6 = Anuttara R-virtue verifier with refusal authority. Unchanged."
> - "M5-4' = canonical home for operational capacities, skills, capability matrix (siva-shakti register). M5-0' = library substrate (Gnostic Library)."
> - "Implementation language: Rust-native default (burn / candle). PyO3+PyTorch only as documented fallback where Rust is materially worse — file DR-EBM-IMPL at that decision point, not before."
> - "Gradient computation: Riemannian-quaternion with manifold projection. Specced inline in mental-pole-mechanics §7.5, NOT in a new spec file."
> - "All thresholds (Elo drift δ, trial-count N, time-window T, max k× retrain rate, confidence-interval penalty α) passed as real config values from ~/.epi-logos/config.toml. No hardcoded numbers."
> - "Stepping-stone archive: c_5_crystallisation_state: 'discarded-branchable' added to Hen residency law canonical state table."
> - "Gemini API key: read from user zshenv via new S0 settings infrastructure with cloud-opt-in policy enforcement per M'-MODEL-SLOT-SPEC."
> - "EBM N-channel cross-attention pattern is a degree of freedom for the system's own learning/self-experimentation. Spec the SHAPE (parallel channel encoders → cross-attention → tritone-symmetric three-sub-head → 72-vector) but do NOT pin the specific attention pattern."
> - "Existing specs are AMENDED IN PLACE. No new 'supersedes' specs. Where the older kernel-spec §3 contradicts the newer ML-Skill-Surface §7.1, the older is edited to match the newer."
> - "Evolver/DGM integration lands as typed VAK choreography after streams stabilise. Add tranche 12.25 (or next-numbered) explicitly naming this."

Two gates are architectural invariants:

1. [[M0']] / [[Anuttara]] carries the E_6 refusal authority at weight 6 in the canonical 4:5:6 kernel energy. A failed E_6 invariant vetoes the candidate regardless of E_4 or E_5 quality.
2. The `requires_human` review gate in `Body/S/S5/epii-review-core/src/lib.rs` is non-bypassable: when `requires_human = true`, an `Agent` actor may only `Defer`; only a `Human` may `Approve`, `Reject`, or `Revise`.

Sakana DGM objective-hacking cases are the load-bearing rationale for keeping both gates structural. The failure class is self-improvement learning to improve the evaluator rather than the artifact, to game an underspecified fitness signal, or to soften the verifier. This architecture answers that with an E_6 hard veto plus human-required review, not with a softer weighted preference.

## §1 - Choreography Law

Per [[S4'-SPEC]] §VAK-Reading-Frame-Law, each evolver step is a first-class VAK-addressed event:

- `CPF` declares autonomous vs dialogical polarity.
- `CT` declares the content register.
- `CP` declares the active QL position set and cardinality.
- `CF` routes the constitutional handling mode.
- `CFP` declares thread, nesting, and spread topology.
- `CS` declares context sequence and Day / Night' direction.

The choreography uses existing ta-onta carriers only: [[Khora]], [[Hen]], [[Pleroma]], [[Chronos]], [[Anima]], and [[Aletheia]]. It uses existing gateway surfaces only where a gateway already exists. Direct vault queries over `Idea/Empty/Discarded/{round-key}/` are Hen-governed filesystem reads, not a new `s1'.archive.*` method; if an archive gateway becomes necessary, that is a follow-up tranche.

## §2 - Ten Typed Invocations

### §2.1 Sample Parent

```yaml
evolver_step: "Sample parent"
primitive: "s5'.improve.history"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT4"
  cp: "(4.0)"
  cf: "(4.5/0)"
  cfp: "S4'.CFP0"
  cs: "CS1 / Night'"
dispatching_carrier: "Chronos"
subagent_owner: "Janus"
gateway_methods: ["s5'.improve.history"]
wire_payloads:
  - "ImprovementStore::history(limit: Option<usize>) -> ImprovementHistory"
  - "ImprovementHistory { runs: Vec<ImprovementRun> }"
  - "ImprovementRun { run_id, target_family, target_coordinate, direction, baseline, challenger, evaluation, decision, typed_candidate }"
config_keys: ["config.autoresearch.parent_sample.history_limit"]
provenance_writes:
  - "Sample lineage records the selected ImprovementRun.run_id and source s5-improvement-state.json revision."
notes: "Chronos/Janus samples prior runs as temporal evidence. CP is a single-point ground read over history, not a mutation."
```

### §2.2 Sample Stepping-Stone Parent

```yaml
evolver_step: "Sample stepping-stone parent"
primitive: "Idea/Empty/Discarded/{round-key}/*"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT4,CT3"
  cp: "(4.0,4.4)"
  cf: "(4.5/0)"
  cfp: "S4'.CFP0"
  cs: "CS4 / Night'"
dispatching_carrier: "Hen"
subagent_owner: "Anansi"
gateway_methods: []
wire_payloads:
  - "Hen-frontmatter artifact with c_5_crystallisation_state: discarded-branchable"
  - "round-key provenance path: Idea/Empty/Discarded/{round-key}/"
  - "ArtifactRef { path, coordinate, kind } when reintroduced into an ImprovementCandidate"
config_keys: ["config.autoresearch.stepping_stone.sample_limit"]
provenance_writes:
  - "Read provenance records round-key, artifact path, frontmatter state, and originating evaluation cycle."
notes: "Hen residency law owns the archive query. No s1'.archive.* gateway is introduced here; gateway formalisation is a follow-up only if implementation requires it."
```

### §2.3 Mutate / Propose

```yaml
evolver_step: "Mutate / propose"
primitive: "s5'.improve.propose"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT2,CT5"
  cp: "(4.2)"
  cf: "(5/0)"
  cfp: "S4'.CFP2"
  cs: "CS2 / Day"
dispatching_carrier: "Aletheia"
subagent_owner: "Zeithoven"
gateway_methods: ["s5'.improve.propose"]
wire_payloads:
  - "ProposeRequest { target_family, target_coordinate, direction, source_review_item_id, baseline }"
  - "ImprovementCandidate { propose, target_subsystem, vector_kind, surfacing_pipeline, observation_evidence, challenger_artifact, originating_kernel_evidence, vak_keys }"
  - "ImprovementRun { challenger, loop_state: Hypothesis }"
config_keys:
  - "config.autoresearch.proposal.max_candidates_per_round"
  - "config.autoresearch.proposal.retry_policy"
provenance_writes:
  - "CandidateRecord and ImprovementRun are persisted in s5-improvement-state.json."
  - "ObservationEvidence.source_uri and CandidateLinkage carry parent and review provenance."
notes: "Zeithoven owns proposal cadence and next-form generation. The primitive is proposal over existing ImprovementStore mechanics, not an autonomous code mutation."
```

### §2.4 Score

```yaml
evolver_step: "Score"
primitive: "kernel_energy_evaluate via s5'.improve.evaluate"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT2,CT3"
  cp: "(4.2,4.3)"
  cf: "(0/1/2)"
  cfp: "S4'.CFP2"
  cs: "CS3 / Day"
dispatching_carrier: "Pleroma"
subagent_owner: "Mercurius"
gateway_methods: ["s5'.improve.evaluate"]
wire_payloads:
  - "EvaluationEvidence { dimension, baseline_score, challenger_score, weight, notes, source_refs, kernel_evidence }"
  - "KernelEvidence / KernelEvidenceSnapshot / KernelEvidenceDelta"
  - "EnergyDecomposition from kernel_energy_evaluate"
  - "EvaluationResult { winner, baseline_score, challenger_score, evidence, rationale, evaluated_at }"
config_keys:
  - "config.kernel.energy.e4_personal_inputs"
  - "config.kernel.energy.e5_harmonic_inputs"
  - "config.anuttara.r_virtue.severity_weights"
  - "config.autoresearch.score.kernel_evidence_required"
provenance_writes:
  - "EvaluationResult and kernel_evidence are persisted on ImprovementRun.evaluation."
  - "Mercurius rating-state receives the comparison outcome when Stream G rating hooks are active."
notes: "The canonical evolver comparison is E_total(challenger) < E_total(baseline). This is the same energy used for descent, not a separate fitness function. Stream G may refine Mercurius rating presentation, but the kernel comparison remains lower-energy-wins."
```

### §2.5 Admissibility Gate

```yaml
evolver_step: "Admissibility gate"
primitive: "M0'/Anuttara verifier refusal authority"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT1,CT3"
  cp: "(4.1,4.3)"
  cf: "(0/1/2)"
  cfp: "S4'.CFP2"
  cs: "CS3 / Night'"
dispatching_carrier: "Pleroma"
subagent_owner: "Anansi"
gateway_methods: ["s4'.permission.get", "s5'.review.submit"]
wire_payloads:
  - "EnergyDecomposition { e_4_personal_energy, e_5_harmonic_energy, e_6_verifier_energy, total_energy }"
  - "KernelReviewVisibility { projection, energy_delta, resonance_delta, advisory_only }"
  - "ReviewSubmission { source, title, body, priority, coordinate_context, requires_human, kernel_visibility, governance_profile }"
config_keys:
  - "config.anuttara.r_virtue.severity_weights"
  - "config.autoresearch.admissibility.require_cypher_pass"
provenance_writes:
  - "ReviewSubmission.kernel_visibility records verifier evidence as advisory-visible but refusal-authoritative."
  - "GovernanceProfile records gate_kind and target_subsystem for the review item."
notes: "E_6 failure is a veto. It cannot be compensated by E_4/E_5 and cannot be softened by agent policy."
```

### §2.6 Promotion

```yaml
evolver_step: "Promotion"
primitive: "Hen residency law + requires_human review gate"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT5,CT1"
  cp: "(4.5,4.1)"
  cf: "(5/0)"
  cfp: "S4'.CFP2"
  cs: "CS5 / Day+Night'"
dispatching_carrier: "Hen"
subagent_owner: "Sophia"
gateway_methods: ["s5'.review.resolve", "s5'.improve.promote", "s1'.vault.*"]
wire_payloads:
  - "ReviewResolveRequest { item_id, decision, rationale, resolved_by, promotion_destination, promoted_artifact }"
  - "ReviewResolution { item_id, decision, rationale, resolved_by, ... }"
  - "PromoteRequest { run_id, destination, approved_review_resolution_id, review_store_root, vault_root, compiler_root, artifact_slug, dry_run }"
  - "PromotionPlan { ok, dry_run, destination, governance_category, compile_plan, rollback_plan }"
config_keys:
  - "config.autoresearch.promotion.default_destination_policy"
  - "config.hen.compile.improvement_channel"
provenance_writes:
  - "ReviewResolution records human approval/rejection/revision or agent deferral."
  - "PromotionPlan records Hen compile-plan and rollback-plan evidence."
  - "Approved promotions move through Empty -> Seeds -> World only under Hen residency law."
notes: "Agents may defer human-required items but may not approve, reject, or revise them. Non-dry-run promotion remains blocked until compiler mutation law is wired."
```

### §2.7 Crossover / Multi-Parent Synthesis

```yaml
evolver_step: "Crossover (multi-parent synthesis)"
primitive: "dispatch_fusion_agents"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT3,CT5"
  cp: "(4.3,4.5)"
  cf: "(4.5/0)"
  cfp: "S4'.CFP3"
  cs: "CS0 / Day+Night'"
dispatching_carrier: "Anima"
subagent_owner: "Agora"
gateway_methods: ["s4'.orchestrate", "dispatch_fusion_agents", "s5'.improve.propose"]
wire_payloads:
  - "Fusion task envelope over parent ArtifactRef[] and ImprovementRun[]"
  - "ImprovementCandidate with multiple parent source_refs in observation_evidence"
  - "ProposeRequest emitted after fusion aggregation"
config_keys:
  - "config.autoresearch.crossover.max_parents"
  - "config.autoresearch.crossover.aggregate_policy"
provenance_writes:
  - "Fusion provenance records parent run_ids, archive paths, and aggregator decision."
  - "CandidateRecord links the synthesized challenger to all parent source_refs."
notes: "Anima owns CFP3 F-Thread dispatch. Agora aggregates the fusion outputs; Zeithoven may turn the aggregate into a proposal via s5'.improve.propose."
```

### §2.8 Stepping-Stone Archive

```yaml
evolver_step: "Stepping-stone archive"
primitive: "Idea/Empty/Discarded/{round-key}/"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT4,CT5"
  cp: "(4.4,4.5)"
  cf: "(5/0)"
  cfp: "S4'.CFP0"
  cs: "CS4 / Night'"
dispatching_carrier: "Hen"
subagent_owner: "Moirai"
gateway_methods: ["s1'.vault.*"]
wire_payloads:
  - "Discarded branch artifact frontmatter with c_5_crystallisation_state: discarded-branchable"
  - "round-key provenance envelope"
  - "ArtifactRef for later stepping-stone sampling"
config_keys:
  - "config.autoresearch.archive.round_key_format"
  - "config.autoresearch.archive.retention_policy"
provenance_writes:
  - "Hen archive writes the discarded branch under Idea/Empty/Discarded/{round-key}/."
  - "Artifact frontmatter records originating run_id, evaluation cycle, and branchable state."
notes: "Discard does not mean dead. It means non-promoted but branchable under Hen residency law."
```

### §2.9 Cross-Cycle Differential Signal

```yaml
evolver_step: "Cross-cycle differential signal"
primitive: "dev_decisions + supersedes + proposes frontmatter relations"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT4,CT3"
  cp: "(4.4,4.3,4.0)"
  cf: "(4.5/0)"
  cfp: "S4'.CFP2"
  cs: "CS0 / Night'->Day"
dispatching_carrier: "Chronos"
subagent_owner: "Janus"
gateway_methods: ["s1'.semantic.*"]
wire_payloads:
  - "Frontmatter relation set: dev_decisions[], supersedes[], proposes[]"
  - "ContinuityHint { kind, summary, candidate_id, route_id, orchestration_id }"
  - "CrossCycleContinuity records from epii-autoresearch-core orchestration module"
config_keys:
  - "config.autoresearch.differential.max_relation_depth"
  - "config.autoresearch.differential.staleness_policy"
provenance_writes:
  - "ContinuityHint records the differential read that informed Zeithoven's next-round proposal."
  - "No separate learning-log file is written."
notes: "Imbue-style learning-log behavior is achieved by consuming canonical frontmatter relations and continuity hints. A new log substrate would duplicate Hen-governed relation law and is out of scope."
```

### §2.10 Recognition-Closure

```yaml
evolver_step: "Recognition-closure"
primitive: "UserContextFrame.recognized + recognition_provenance"
vak_address:
  cpf: "(4.0/1-4.4/5)"
  ct: "CT5,CT1,CT3"
  cp: "(4.5,4.1,4.3)"
  cf: "(5/0)"
  cfp: "S4'.CFP2"
  cs: "CS5 / Day+Night'"
dispatching_carrier: "Aletheia"
subagent_owner: "Anansi"
gateway_methods: ["s4'.vak.evaluate", "s5'.review.submit", "s5'.review.resolve"]
wire_payloads:
  - "UserContextFrame { recognized: boolean, recognition_provenance: AnuttaraCoordinateString | null }"
  - "VakFrame / VAK evaluation envelope { cpf, ct, cp, cf, cfp, cs }"
  - "ReviewSubmission with GovernanceProfile category CanonRecognitionPublicationGate when publication is at stake"
config_keys:
  - "config.autoresearch.recognition.e5_lens_coherence_delta_threshold"
  - "config.autoresearch.recognition.require_ebm_checkpoint"
  - "config.autoresearch.recognition.kernel_65_invariant_profile"
provenance_writes:
  - "recognition_provenance records the Anuttara coordinate string that anchored closure."
  - "Review history records SHACL, R-virtue, kernel-65, and E_5 lens-coherence evidence."
notes: "The composition predicate is SHACL-pass and R-virtue-check and kernel-65-invariant-check and, when the EBM is trained, E_5 lens-coherence delta below config threshold."
```

## §3 - Dependency Chain

| Evolver row | Blocks on upstream execution | Why |
|---|---|---|
| Sample parent | `12.T12.20`, `12.T12.23`, `12.T12.24` Phase 2/4 | History can be sampled now, but stable rating/proposal metadata depends on Stream G landing. |
| Sample stepping-stone parent | [[33-harmonic-energy-channel-handoff]] Thread A / Hen residency extension | Requires `c_5_crystallisation_state: "discarded-branchable"` to be schema-legal. |
| Mutate / propose | `12.T12.24` Phase 3 plus Stream G | Zeithoven proposal generation and ML-skill surface must exist before proposals are operationally meaningful. |
| Score | `38.T06.11`, `06.T6.8`, `05.T5.22`, `34.T34.1`, `34.T34.2` | Kernel energy restructure, E_5 EBM head, E_4 Nara LoRA, and embedding/settings substrate must land for non-stub scoring. |
| Admissibility gate | `01.T1.10` / `01.T1.11` verifier lane plus `38.T06.11` | E_6 refusal authority and kernel energy shape must be executable. |
| Promotion | Existing `epii-review-core`, `epii-autoresearch-core`, Hen compiler law; downstream compiler mutation law for non-dry-run | Dry-run promotion exists now; non-dry-run promotion remains gated. |
| Crossover | Existing [[Anima]] `dispatch_fusion_agents`; `12.T12.24` proposal surface | Fusion dispatch exists; proposal consumption requires the stabilized proposal surface. |
| Stepping-stone archive | Hen residency extension from Thread A | Archive state must be legal before branches are written as branchable discarded artifacts. |
| Cross-cycle differential signal | Hen frontmatter enforcement plus Stream G rating/drift surfaces | Relation reads exist; using them for next-round proposal quality depends on rating/drift landing. |
| Recognition-closure | `12.T12.21`, verifier lane, `06.T6.8`, `38.T06.11` | UserContextFrame recognition fields, E_6 verifier, E_5 EBM, and kernel energy evidence must be available. |

Spec production is complete in this document. Choreography implementation remains dependency-gated on the upstream rows above.

## §4 - Stream G Refinement Proposal

Mercurius's `weighted_score()` should adopt Imbue's dynamic percentile-based sigmoid midpoint as a refinement to Stream G / Tranches `12.T12.20`, `12.T12.23`, and `12.T12.24` Phase 2. The midpoint must be a function of the current rating-distribution percentile, not a pinned constant, so comparisons stay discriminating as the population improves.

This is not a Tranche `12.T12.25` implementation point. This spec only records the follow-up amendment and config vocabulary:

```toml
[aletheia.elo]
sigmoid_midpoint_percentile = "<user-configured percentile>"
```

The corresponding fully-qualified config key is `config.aletheia.elo.sigmoid_midpoint_percentile`. No numeric default is specified here.

## §5 - No-New-Primitives Checklist

- VAK fields used: `CPF`, `CT`, `CP`, `CF`, `CFP`, `CS`.
- Carriers used: [[Khora]], [[Hen]], [[Pleroma]], [[Chronos]], [[Anima]], [[Aletheia]].
- Dispatch tools used: `dispatch_agent`, `dispatch_fusion_agents`, `run_chain` only by existing [[S4']] dispatch law.
- Gateway surfaces named: `s4'.vak.evaluate`, `s4'.orchestrate`, `s4'.permission.get`, `s5'.improve.history`, `s5'.improve.propose`, `s5'.improve.evaluate`, `s5'.improve.promote`, `s5'.review.submit`, `s5'.review.resolve`, `s1'.vault.*`, `s1'.semantic.*`.
- Explicitly not introduced: `s1'.archive.*`, a new learning-log file, a new fitness function, a new carrier class, a new review actor class, a bypass path for E_6, or an agent bypass for `requires_human`.

## §6 - Acceptance Surface

This document is accepted when:

- all ten evolver rows have typed VAK blocks;
- both non-bypassable gates are named as architectural invariants;
- Sakana DGM objective-hacking rationale is recorded;
- the Imbue dynamic sigmoid-midpoint refinement is recorded as Stream G follow-up only;
- every row names dependencies and existing wire payloads;
- no new gateway method, carrier class, VAK field, mutation primitive, or log substrate is proposed.
