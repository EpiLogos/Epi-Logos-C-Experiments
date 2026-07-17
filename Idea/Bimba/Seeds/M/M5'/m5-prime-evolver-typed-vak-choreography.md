---
coordinate: "M5'"
c_4_artifact_role: "typed-vak-choreography-spec"
c_1_ct_type: "CT4"
c_3_ctx_frame: "4.5/0"
c_0_source_coordinates:
  - "[[m5-prime-autoresearch-self-improvement-loop]]"
  - "[[33-harmonic-energy-channel-handoff]]"
  - "[[12-agentic-layer-s4-s5]]"
---

# M5' Evolver Typed VAK Choreography

## Invariants

This is a choreography over existing surfaces, never a new mutation authority. Every row preserves two non-bypassable gates: Anuttara's discrete E_6 refusal veto, and [[epii-review-core]]'s `requires_human` rule, under which agents may only defer. The DGM objective-hacking record is the reason neither gate may be softened, compensated for, or bypassed.

The inherited decisions are those in [[33-harmonic-energy-channel-handoff]]. No new gateway method, carrier, VAK field, or mutation primitive is proposed. `config.aletheia.elo.sigmoid_midpoint_percentile` is the Stream-G follow-up for Mercurius's distribution-relative score midpoint, not a hardcoded value or a new 12.T12.25 mechanism.

## Dependency Gate

| Stream | Required landing | Effect on this choreography |
|---|---|---|
| A | M3 oracle wiring | supplies calculation evidence |
| B/D | kernel energy plus Möbius descent | supplies the shared E_4/E_5/E_6 comparison |
| C | EBM head plus runtime hook | supplies learned E_5 channel evidence |
| E | settings and Gemini embedding accessor | makes corpus-backed training operable |
| F | Nara LoRA | supplies E_4 evidence |
| G | 12.20, 12.23, 12.24 | supplies ratings, dispatch policy, and retrain signals |

Until all rows above are operational, this document is the binding spec and runtime execution remains blocked. The following addresses are implementation targets once that gate is green.

## Invocation Blocks

```yaml
evolver_step: Sample parent
primitive: s5'.improve.history / ImprovementStore::history
vak_address: { cpf: "(0/1)", ct: CT4, cp: "P4", cf: "(4.5/0)", cfp: "S4'.4", cs: Day }
dispatching_carrier: Aletheia
subagent_owner: Moirai
gateway_methods: ["s5'.improve.history"]
wire_payloads: [ImprovementHistory, ImprovementRun]
config_keys: []
provenance_writes: [Mercurius rating-state read, source_refs retained]
notes: Selects a baseline only; no promotion or mutation occurs.
```

```yaml
evolver_step: Sample stepping-stone parent
primitive: "Idea/Empty/Discarded/{round-key}/ with discarded-branchable residency"
vak_address: { cpf: "(0/1/2/3)", ct: CT4, cp: "P3", cf: "(0/1/2/3)", cfp: "S4'.3", cs: Day }
dispatching_carrier: Hen
subagent_owner: Anansi
gateway_methods: ["s1'.world.resolve"]
wire_payloads: [DiscardedBranchHandle, EvidenceSourceRef]
config_keys: []
provenance_writes: [round-key, parent provenance]
notes: Read-only branch selection; archive methods remain a separately scoped follow-up.
```

```yaml
evolver_step: Mutate / propose
primitive: "s5'.improve.propose via Zeithoven creative-skill surface"
vak_address: { cpf: "(0/1/2)", ct: CT2, cp: "P2", cf: "(5/0)", cfp: "S4'.5", cs: Day }
dispatching_carrier: Anima
subagent_owner: Zeithoven
gateway_methods: ["s5'.improve.propose"]
wire_payloads: [ProposeRequest, ImprovementRun]
config_keys: ["anima.dispatch_policy.*"]
provenance_writes: [candidate artifact, DispatchTrace]
notes: Produces a challenger, never a direct runtime mutation.
```

```yaml
evolver_step: Score
primitive: kernel_energy_evaluate
vak_address: { cpf: "(0/1/2)", ct: CT2, cp: "P2", cf: "(0/1/2)", cfp: "S4'.2", cs: Day }
dispatching_carrier: Pleroma
subagent_owner: Mercurius
gateway_methods: ["s5'.improve.evaluate"]
wire_payloads: [EvaluationEvidence, KernelEvidence, EnergyDecomposition]
config_keys: ["ml.parashakti_ebm_head.*"]
provenance_writes: [baseline/challenger evidence, kernel trajectory]
notes: Uses E_total(challenger) < E_total(baseline), never a parallel fitness function.
```

```yaml
evolver_step: Admissibility gate
primitive: Anuttara E_6 refusal authority
vak_address: { cpf: "(00/00)", ct: CT0, cp: "P0", cf: "(0000)", cfp: "S4'.0", cs: Day }
dispatching_carrier: Anima
subagent_owner: Anuttara
gateway_methods: ["s0'.verifier.check_state"]
wire_payloads: [AnuttaraDiagnostic, TypedQuery]
config_keys: []
provenance_writes: [refusal rationale, invariant evidence]
notes: Any E_6 violation vetoes regardless of E_4/E_5 quality.
```

```yaml
evolver_step: Promotion
primitive: "Hen CompilePlanSummary plus epii-review-core requires_human gate"
vak_address: { cpf: "(4.0/1-4.4/5)", ct: CT4, cp: "P4", cf: "(4.5/0)", cfp: "S4'.1", cs: Night' }
dispatching_carrier: Hen
subagent_owner: Psyche
gateway_methods: ["s5'.improve.promote", "s5'.review.resolve"]
wire_payloads: [PromotionPlan, ReviewInboxItem, ReviewResolution]
config_keys: []
provenance_writes: [Hen compile plan, review history]
notes: Agents may defer only when requires_human is true; promotion remains dry-run until compiler mutation law lands.
```

```yaml
evolver_step: Crossover (multi-parent synthesis)
primitive: dispatch_fusion_agents CFP3
vak_address: { cpf: "(0/1/2/3)", ct: CT3, cp: "P3", cf: "(4.0/1-4.4/5)", cfp: "S4'.3", cs: Day }
dispatching_carrier: Anima
subagent_owner: Agora
gateway_methods: ["s4'.mediation.route"]
wire_payloads: [FusionDispatch, ImprovementCandidate]
config_keys: ["anima.dispatch_policy.*"]
provenance_writes: [parent set, fusion rationale, DispatchTrace]
notes: Anima owns the fusion dispatch; no independent crossover service exists.
```

```yaml
evolver_step: Stepping-stone archive
primitive: "Idea/Empty/Discarded/{round-key}/"
vak_address: { cpf: "(0/1)", ct: CT1, cp: "P1", cf: "(0/1)", cfp: "S4'.1", cs: Night' }
dispatching_carrier: Hen
subagent_owner: Janus
gateway_methods: ["s1'.world.resolve"]
wire_payloads: [DiscardedBranchHandle, ResidencyDecision]
config_keys: []
provenance_writes: [round-key, discarded-branchable state]
notes: Archives branchable evidence; it does not erase rejected candidates.
```

```yaml
evolver_step: Cross-cycle differential signal
primitive: "dev_decisions, supersedes, and proposes frontmatter relations"
vak_address: { cpf: "(0/1/2/3)", ct: CT3, cp: "P3", cf: "(4.0/1-4.4/5)", cfp: "S4'.4", cs: Night' }
dispatching_carrier: Aletheia
subagent_owner: Mercurius
gateway_methods: ["s5'.gnostic.resolve", "s5'.improve.history"]
wire_payloads: [EvidenceSourceRef, NextComposeHint]
config_keys: ["aletheia.elo.sigmoid_midpoint_percentile"]
provenance_writes: [cross-cycle rationale, next-compose hint]
notes: Consumes Hen-enforced relations as the learning log; it does not create another log substrate.
```

```yaml
evolver_step: Recognition-closure
primitive: "UserContextFrame.recognized plus Anuttara recognition_provenance"
vak_address: { cpf: "(5/0)", ct: CT5, cp: "P5", cf: "(5/0)", cfp: "S4'.5", cs: Night' }
dispatching_carrier: Aletheia
subagent_owner: Sophia
gateway_methods: ["s0'.verifier.check_state", "s5'.review.history"]
wire_payloads: [UserContextFrame, AnuttaraDiagnostic, ReviewHistory]
config_keys: ["aletheia.drift_detection.*"]
provenance_writes: [recognition_provenance, closure evidence]
notes: Requires SHACL, R-virtue, kernel-65, and configured E_5 coherence checks; it never closes around an unreviewed change.
```

## Verification

The contract is complete only when all ten blocks resolve exclusively to the listed existing carrier, VAK field, and gateway vocabulary. Runtime choreography remains a follow-up acceptance once Streams A-G are green.
