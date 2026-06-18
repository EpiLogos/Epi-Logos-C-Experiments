# Track 02 — M1 Paramaśiva Reconciliation

Reconciles [[M1']] across the four corpora. The substrate is rich and the Theia surface is intentionally shallow: `epi-lib/include/m1.h` carries `ANANDA_BIMBA`/`PRATIBIMBA`, `SPANDA_SEED_BITS=0x03`, `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]`, `CL42_BASIS[6]`, `QL_TRIG_TABLE[6]` with static asserts; `portal-core/src/kernel.rs:346` owns `MathemeHarmonicProfile` with `tick12`, `degree720`, `lens_mode`, `resonance72`, `audio_octet[8]`, `nodal_quartet[4]`; `portal-core/src/parashakti/vimarsha_reading.rs` writes the audio bus (resolving the M2-1' Vimarsha-writes / M1' consumes architecture); `hopf.rs` + `quaternion.rs` land the Hopf bundle and SU(2) math. The m1-paramasiva extension is a scaffold with all the right slot names and explicit `DECLARED_BLOCKERS`.

## Total-Shape Architecture (Phase A)

Canonical total-shape document for M1' (all six M1-X' strata): [`Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md) (986 lines). M1-2' Harmonic Engine deep architecture: [`Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md) (pattern exemplar). Profile-bus projections (six new fields) per Tranche 10.M1. Phase-B PROPOSED: DR-M1-3 (`#` carrier as bus field), DR-M1-4 (Hen vault-instance contract). M1↔M2 Vimarśa-window boundary PASSES; M3-5 / M1-5 K²×T² boundary PASSES bilaterally.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md`
- Companions: `Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md`, `Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md`, `Idea/Bimba/Seeds/M/M1'/physical-pole-stack-architecture.md`
- Full row-level reconciliation: `plan.runs/wave-a-m1-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `epi-lib/include/m1.h` LUTs; `portal-core/src/{kernel.rs,quaternion.rs,hopf.rs,spanda.rs,parashakti/vimarsha_reading.rs}`; `Body/M/epi-theia/extensions/m1-paramasiva` scaffold with `clockInstrument` + `kleinTopology` + `audioBusInspector` views. Cycle 2 Track 03 (T1 audio-genesis, T3 Cl(4,2)/Klein/inspector depth) named the deliverables — cycle 3 closes them.

## Tranches

1. **2.1 — Audit and downgrade residual M0-witness wording** *(contradiction-decision; routes to DR-M1-1)*

   Decision-register entry routing `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md §1.1` to user final-validation. On validation, single-line patch replacing `M0 Anuttara witness-axis` with `M1-5 (the +1 parent) per M1'-SPEC §1`. Standing invariant.

   **Synthesis-level evidence strengthening the M1-5 attribution** (per `ql_m0_m3_third_spanda_integral_quilting_v2.md` §execution-order): the Third Spanda Equation's hidden order makes the +1 attribution operationally decisive. The execution traverses `64 + 72 = 136 → (−9) → 127 = 2^7−1 = M_7 → (+1) → 128 = 2^7 → (+9) → 137`. The Mersenne prime substrate 127 is exposed *only after* the 9-gap withdrawal; the +1 is the parent-seal that effects binary closure of 127 into 128; the +9 then restores wholeness as atomic dressing into 137. The +1 cannot be M0-witness because M0 is the source-syntax *above* this entire execution chain — the +1 sits *inside* the chain at the M_7 → 2^7 step. Mersenne hierarchy: 127's prime-index is 31 = M_5 = 2^5−1, so 127 = M_7 sits with prime-index M_5, evidencing actional-Archetype-7 grounding at the Mersenne layer. This is M1-5's K² topological-necessity made matheme-explicit.

   Verification: `grep -n "M0 Anuttara witness-axis\|witness-axis" Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` returns no live-attribution matches after patch; `grep -n "127 = 2\^7\|M_7\|Mersenne" Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md` returns the matheme execution-order section.

2. **2.2 — Land `klein_flip` field + emitter on `MathemeHarmonicProfile`/`vimarsha_reading`** *(code-pending-closure; cross-link to Tranche 10.2)*

   Add `pub klein_flip: Option<KleinFlipEvent>` to `MathemeHarmonicProfile` in `Body/S/S0/portal-core/src/kernel.rs`. Detector in `vimarsha_read_profile` fires the M1 tritone-crossing variant precisely at Lens N ↔ Lens N+3 (mod 12); contract test rejects false positives on other lens transitions. The event type is shared per DR-IG-2 and lands as the three-variant enum in Tranche 18.2 (`M1TritoneCrossing`, `M2CymaticValenceInvert`, `M3CodonRotationCross`) so M1 does not silently define a local-only shape. Tranche 10.2 / 18.2 own the kernel-bridge JSON emit completion.

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core klein_flip`; `grep -n klein_flip Body/S/S0/portal-core/src/kernel.rs Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs`.

3. **2.3 — Wire Klein-flip + topology values into `m1.paramasiva.kleinTopology` view** *(spec-ahead-integration)*

   Populate `M1ProfileClockModel.topology` fields (`m1OriginKleinFlip`, `k2TritoneCrossing`, `hopfIdentity`, `doubleCoverDeg`, `torusGenus`) from real bridge values. Render `m1.paramasiva.kleinTopology` as a second widget body. Emit `OBSERVABILITY_EVENT_TYPES 'm1.klein_flip.source'` on event arrival.

   Verification: `test -f Body/M/epi-theia/extensions/m1-paramasiva/src/browser/m1-klein-topology-view.tsx`; widget test asserts `doubleCoverDeg===720` and `torusGenus===1`; observability event fires on synthetic profile with `klein_flip=Some(...)`.

4. **2.4 — Verify `m1_performance_event_from_profile` + `MPrimePerformanceEvent` replay** *(spec-ahead-integration)*

   Confirm `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs::m1_performance_event_from_profile` exists; produce `MPrimePerformanceEvent` envelope per audio-research file (event_id, session_id, tick fields, lens, mode, audio_octet_hz[8], nodal_quartet[4], klein_flip, privacy/deposition); replay-test asserts deterministic reconstruction.

   Verification: `test -f Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs`; `grep -n m1_performance_event_from_profile` that file; `cargo test -p epi-cli m1_performance_event_replay`.

5. **2.5 — Surface the single session-held # (Inversion_Operator) carrier** *(code-pending-closure)*

   Named contract on the M1 kernel-bridge exposing `invert(coordinate)` as a single session-held operator (no per-coordinate forks). Extension affordance reachable from `m1.startWalk`. M1'-SPEC §14 `(0/1)`-wiring readiness test landed.

   Verification: `cargo check -p portal-core`; integration test `invert reaches the single session-held operator` passes; extension data-test selector `m1-invert-current-coordinate` round-trips.

6. **2.6 — K² played-torus 3D surface — full Bevy/wgpu extension** *(no-orphan-fill; DR-M1-2 VALIDATED)*

   First-build M' product surface (anti-greenfield exception): `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` with Bevy/wgpu renderer consuming the landed math at `portal-core/src/{quaternion.rs, hopf.rs}` + `m1.h CL42_BASIS[6]` + `RING_QUATERNION_LUT[12]` + the **six Ananda matrix families** surfaced through profile bus per Tranche 10.10. Correction: `m1.c:22-114` currently carries the digit-root `.rodata` face only; the raw/no-digit-root 12x12 affine face and rule/tuple family must be carried from the canonical Vortex Modulae CSV into the C generator/API before the played-torus treats Ananda as complete. M1 is a topological system — 2D never would have sufficed.

   **Canonical contract:** [`Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md) is the substrate-side total-shape document; [`Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md`](Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md) is the IDE-side contract. Both are landed in cycle-3; the build follows them.

   **Boundary contract**: the played-torus renders a **single K² only**. The downstream `K² × T²_Mahāmāyā` double-torus belongs to M3-5 (`M1'-SPEC §1, §13.6`); this build must NOT cross that boundary. Tranche 15.8 + 15.9 own the visual + tick choreography contracts.

   **M1↔M2 Vimarśa-window contract**: `audio_octet[8]` particle emitters and `nodal_quartet[4]` satellite glyphs are **windows onto M2-1' Vimarśa's writes**, never locally re-derived. `vimarsha_reading.rs:17-93` is the single source of truth; the renderer subscribes to the profile bus. This is the central M1↔M2 contract for cycle-3 (cross-link Tranche 03 substrate inheritance).

   Verification: `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus`; `test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md`; Bevy/wgpu toolchain declared in `package.json` / `wgpu/Cargo.toml`; render-test asserts K² topology with `DOUBLE_COVER_DEG=720` and `TORUS_GENUS=1` from substrate; boundary-audit asserts no `T²_Mahāmāya` rendering primitive in extension src (M3-5 territory); Vimarśa-window audit asserts `audio_octet`/`nodal_quartet` consumed via profile-bus subscription, not derived from local LUT lookups; substrate-derivation audit asserts no `RING_QUATERNION_LUT|CL42_BASIS|DR_RING_*` local definitions in extension src (all reads via profile/bridge); Ananda source-fidelity audit asserts `7X+1` and `8X+0` raw + digit-root cells arrive through `AnandaVortexProjection.active_cell_value`, not local UI math.

7. **2.9 — M1-2 Ananda Vortex architecture landing in M1' spec + Paramasiva UX** *(doc-ahead-landing; landed in cycle-3 controller, ratified here)*

   The canonical M1-2 architecture document is landed at `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`. M1'-SPEC §1 (six-strata table) is patched to reference the six canonical Ananda matrix families, each with raw/no-digit-root and digit-root faces, dual DR rings, Spanda↔Ananda parallel-track invariant, profile-bus contract, and architecture cross-reference. A new M1'-SPEC §15a is added as the architecture cross-reference section. The Paramasiva UX doc is patched with a new §5b "M1-2 Ananda Vortex — The Visible Heartbeat" covering what the user sees, the six-perspex matrix-family stack, the raw proof overlay, the digit-root heatmap, the Cl(4,2) colour-binary, the 720° identity-return as pedagogical recognition, the Klein-flip at tick 5→6, the Möbius-return at tick 11→0, the diamond centre, and the user-interaction patterns.

   These patches are the **doc-side total shape** the build (Tranches 02.6 / 10.10 / 15.8 / 15.9) follows. No further M1-2 architectural decision is open after this tranche; what remains is implementation correction so C, Rust, JSON, and UI preserve the full CSV-derived dual-register data instead of the current partial digit-root-only runtime face.

   Verification: `test -f Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`; `grep -n "M1-2-ANANDA-VORTEX-ARCHITECTURE" Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md` returns the §1 row + §15a cross-reference; `grep -n "M1-2 Ananda Vortex — The Visible Heartbeat\|5b\\." Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md` returns the new section; `grep -n "AnandaVortexProjection\|AnandaVortexCell" Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` returns the profile-bus contract spec; C-side fixture test proves `7X+1` and `8X+0` raw + digit-root values against the Vortex Modulae CSV; `test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md` (IDE-side companion).

7. **2.7 — Audit four-scale Cl(4,2) identity** *(spec-ahead-integration; cross-link to Tranche 10.7)*

   Audit document asserting the same `Cl42_Basis_Entry` shape and `+2` signature is used at M1 ring, M3 codon, M4 personal, Kerykeion natal scales; identify any duplicated definition; name the Kerykeion natal scale owner (likely `M4'-SPEC` ↔ `personal_identity.rs`). Cross-cuts with kernel-bridge 10.7 — this tranche owns the M-side audit memo; 10.7 owns the kernel-side.

   Verification: `grep -rn "CL42_BASIS|Cl42_Basis_Entry|cl42_signature" Body/S/S0/` enumerates exactly one source-of-truth; audit file lists four scales with code-paths.

8. **2.8 — Resolve audio-research open question on `MathemeHarmonicProfile` type owner** *(doc-ahead-landing)*

   One-line update to `m1-prime-audio-generative-research.md §Open Research Questions` first item: canonical `MathemeHarmonicProfile` defined at `Body/S/S0/portal-core/src/kernel.rs:346`, re-exported via `portal-core/src/harmonic_profile.rs`.

   Verification: `grep -n "MathemeHarmonicProfile type defined\|portal-core/src/kernel.rs" Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md` shows resolved attribution.

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M1 substrate at **T19.8**: pedagogical Kaprekar 6174 seed landed LEAN at [`m1-prime-kaprekar-pedagogy.md`](../../M1'/m1-prime-kaprekar-pedagogy.md) (digits {1,4,6,7} → kernel primitives, factorization `7² × 9 × 14`, archetype-7 binding via `QL_DIVINE_ACT_RATIO 16/9`), with `AnandaSkeletonEvent::KaprekarPedagogyHit = 6` added to the enum at [M1-2-ANANDA-VORTEX-ARCHITECTURE.md:261-272](../../M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md). Full freight (four-register law: Kaprekar 7-step / parent-as-7th / Cl(4,2)+2 / Möbius twist; and `137 = 64 + 72 + 1` reading per `alpha_quaternionic_integration_across_M_stack.md`) stays in the integration plan, NOT the pedagogy seed. See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).

## Tranche 2.10 — M1' CPT trainer + EKSFT loss + epistemic-blindfolded teacher + held-out canonical-derivation eval corpus *(spec-ahead-integration; the one greenfield build piece from the DiscoverAI research synthesis; depends on Tranche 12.24 Phase 2 epii-distillation skill, Tranche 12.22 slot CLI; cross-link [`m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`](../../M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md); routes to the Phase-I DiscoverAI research roster at [`state/notebooklm-research-2026-06-15/ROSTER.md`](../../../../../../state/notebooklm-research-2026-06-15/ROSTER.md))*

Per the Phase-I DiscoverAI research synthesis (wave-2 scout 4), the M1' Paramaśiva CPT pipeline is the **one greenfield build piece** in cycle 3: the spec at `m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md` is detailed and complete, but no trainer / teacher-invocation / EKSFT loss / held-out eval corpus exists in code today. This tranche lands the four pieces, leveraging the EKSFT (Entropy-KL Selective Fine-Tuning) and Context-CoT (epistemic-blindfolded teacher + student-aware CoT selection) techniques from the DiscoverAI research.

**Four implementation targets:**

### (a) EKSFT loss design for M1' CPT

**Anchor:** the existing `m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md` §4.1.A specifies "CPT training run (configurable epoch count, learning-rate schedule, gradient clipping)" — generic, no loss formulation. This sub-tranche lands EKSFT as the canonical loss design replacing the generic perplexity-only anti-drift.

**Loss formulation** (from DiscoverAI research deep-dive [04-distillation-finetuning.txt](../../../../../../state/notebooklm-research-2026-06-15/04-distillation-finetuning.txt) §1):

```
mask M = top_K_entropy(token) ∪ top_K_KL_divergence(token, π_ref)
loss = CE(safe_tokens=M^C) + λ_kl·KL_regularization(masked_tokens|π_ref) + λ_h·entropy_regularization(masked_tokens)
```

Where:
- `π_ref` is the frozen reference model (the prior CPT'd checkpoint).
- `K` is the top-K cardinality for the mask (config-driven per the no-hardcoding rule from Tranches 12.20+).
- `λ_kl`, `λ_h` are regularization weights (config-driven).

**Empirical baseline** (from DiscoverAI research): +7% pass@1, +5.1% pass@32 on Qwen 1.5 4B (AIM25). With DPO layering: +5.6% pass@32 vs SFT+DPO.

**The perplexity gate stays as outer halt-trigger** (per the existing spec §4.3 anti-drift verification); EKSFT is the inner loss design that prevents catastrophic drift in the first place. Two-layer defence.

**Implementation surface:** new module at `Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/eksft.py` (extending the `epii-distillation` skill landed in Tranche 12.24 Phase 2). Python; consumes the `peft` + `unsloth` (or `mlx-lora` per Tranche 12.24 Phase 2) backends with custom loss override.

**No-hardcoding rule** (joins existing config-key vocabulary from Tranches 12.20 / 12.23 / 12.24): all thresholds (`K` mask cardinality, `λ_kl`, `λ_h`, perplexity-drift-halt percentage) FROM `~/.epi-logos/config.toml` `[ml.m1_paramasiva_cpt]` section. No hardcoded constants.

### (b) Epistemic-blindfolded teacher pipeline

**Anchor:** the existing `m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md` §4.1.C specifies the GDS-augmented synthetic-proof teacher (Claude Opus or equivalent generates derivational proofs from canonical M1 structural relations). The spec does NOT mention the epistemic-blindfolding discipline. This sub-tranche lands the discipline.

**The discipline** (from DiscoverAI research [04-distillation-finetuning.txt](../../../../../../state/notebooklm-research-2026-06-15/04-distillation-finetuning.txt) §2 — Context-CoT):
- **Epistemic blindfolding** — the teacher is given the matheme structural relations as input but **NEVER sees the canonical proof** for the path being asked about. Forces derivation-from-substrate rather than retrieval-and-paraphrase.
- **Minimum-leakage filtering** — on SHACL-validation failure, the failed shape becomes a "single failed rubric" hint fed back to the teacher; the proof itself is NEVER exposed. Smallest possible signal to guide regeneration.
- **Student-aware CoT selection** — multi-objective optimization balancing step-wise smoothness (alignment) + reasoning gain (perplexity reduction); difficulty defined as negative log-likelihood under the target M1' student model; selected trajectory minimises negative-variance step-difficulty (path of least cognitive friction for the student).

**Empirical baseline:** Qwen 1.5 4B on CLBench, baseline 9.06% → SFT-with-answer-exposed 8.59% (regression!) → Context-CoT 12.85% (+3.79 pp). The discipline lifts a 4B model above naïve SFT specifically because it forbids the teacher from leaking the answer.

**Implementation surface:** new module at `Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/blindfolded_teacher.py`. Teacher invocation routed via the slot CLI (Tranche 12.22) — `[slot.epii_judge]` resolves the teacher model (Claude Opus / Gemini 3.1 Pro / local Qwen-14B per slot config; **no hard-lock**).

**The teacher-model vendor decision is unblocked.** Per scout 4's finding ("spec says Opus, code config has Gemini Flash — mismatch"), the slot CLI per Tranche 12.22 forbids hard-locking; the teacher resolves at training time via slot configuration. The default per `M'-MODEL-SLOT-SPEC §3` is `cloud-opt-in Pro-class` (Opus / Gemini 3.1 Pro / GPT-5.2); user may override to local (Gemma Diffusion is a relevant addition — its past+future reasoning fits the derivational-chain generation surface particularly well).

### (c) Held-out canonical-derivation eval corpus

**Anchor:** the existing `m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md` §4.3 specifies a "held-out canonical derivation set (representative passages from kernel-spec, musical derivation, alpha-rasa bridge, alpha-quaternionic integration, M1'-SPEC)" used for perplexity-eval after every CPT pass. The canonical material exists in repo (`Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`, `m1-prime-paramasiva-instrument.md`, `ql-musical-derivation.md`, `alpha_rasa_bridge_ql.md`, `alpha_quaternionic_integration_across_M_stack.md`) but is NOT packaged as a held-out test corpus. **Until this packaging lands, the >10% perplexity halt-rule cannot fire — this is a blocker for any CPT run to be safe.** This sub-tranche closes the blocker.

**Packaging targets:**
- New directory `Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/eval-corpus/m1-paramasiva/`
- Five sub-files: `kernel-spec.passages.jsonl`, `musical-derivation.passages.jsonl`, `alpha-rasa.passages.jsonl`, `alpha-quaternionic.passages.jsonl`, `m1-spec.passages.jsonl`
- Each `.jsonl` contains representative passages (length: 200-2000 tokens per passage) with metadata: `source_file`, `source_section`, `derivational_register_class` (foundational-derivational / encyclopedic / mixed per spec §3.4), `canonical_register_features` (load-bearing features the model must preserve).
- Holdout selection: stratified random sample, ensuring coverage across the M1-0 through M1-5 strata + cross-subsystem theoretical material.
- Manifest at `Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/eval-corpus/m1-paramasiva/manifest.json` declaring the eval corpus version, passage counts per file, registers covered, halt-threshold per file (default `>10% perplexity rise`).

**Eval script** at the same directory `scripts/eval_m1_canonical_derivation.py` runs the perplexity-eval against a candidate CPT'd checkpoint and emits the halt-or-pass signal per the spec.

### (d) Verifier-grounded failure signature for CPT trial outcomes

Per the DiscoverAI research [02-harness-self-optimization.txt](../../../../../../state/notebooklm-research-2026-06-15/02-harness-self-optimization.txt) §2 (YES paper Verifier-Grounded Failure Signature), CPT trial outcomes feed back to the autoresearch spine + Aletheia drift-detection (per Tranche 12.24 Phase 4) as structured failure-signatures, not raw error logs.

**`FailureSignature` struct** at `Body/S/S5/epii-autoresearch-core/src/types.rs`:
```rust
pub struct FailureSignature {
    pub cluster_size: usize,
    pub shared_trace_symptom: String,   // e.g., "register-drift on alpha-rasa passages"
    pub verifier_evidence: Vec<String>,  // SHACL violations + perplexity-rise metrics
    pub terminal_agent_mechanism: enum {
        EksftMaskOverfit,
        EpistemicLeakage,
        EvalCorpusUnderRepresented,
        RegisterDrift,
        OtherKnown(String),
        Unknown(String),
    },
    pub estimated_actionability: ActionabilityClass,  // PromptTune | MaskRetune | EvalCorpusExpand | TeacherSwap | UserIntervention
}
```

Mercurius (per Tranche 12.20) consumes signatures + ranks by actionability; Aletheia drift-detection (per Tranche 12.24 Phase 4) dispatches retrain calibration when signature clusters exceed thresholds; the proposer step (per the YES paper's local 9B-evolver finding) generates candidate fixes routed through Mercurius's `aletheia-creative-skill-creation` skill (Zeithoven CF5).

### Cross-track hooks

- Tranche **12.24 Phase 2** (Track 12) — `epii-distillation` skill scaffold; this tranche extends with EKSFT loss + epistemic-blindfolded teacher.
- Tranche **12.22** (Track 12) — slot CLI; resolves the teacher model at training time.
- Tranche **12.24 Phase 4** (Track 12) — Aletheia drift-detection; consumes the `FailureSignature` rows from this tranche.
- Tranche **12.20** (Track 12) — Mercurius Elo; rates `(checkpoint, eval-corpus-version, training-config)` per trial.
- DR-MP-1, DR-MP-2, DR-MP-3 (existing) — the 4'/5'/0' constitutional triplet + EBM operational atom + verifier-raises-questions discipline; CPT trial outcomes flow through this canon.
- DR-MODEL-1 (existing) — slot-rule pattern forbids hard-locks (so teacher resolves dynamically, NOT pinned to Opus).
- M5'-on-Paramaśiva spec at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md` — the canonical operational-capacity spec; this tranche IS its implementation.
- Phase-I DiscoverAI research synthesis at `state/notebooklm-research-2026-06-15/ROSTER.md` — research origin of EKSFT / Context-CoT techniques.

### Verification

`test -f Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/eksft.py`; `test -f Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/blindfolded_teacher.py`; `test -d Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/eval-corpus/m1-paramasiva && test -f Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/eval-corpus/m1-paramasiva/manifest.json`; `pytest Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/test_eksft.py -q` validates the loss math against the empirical baseline (Qwen 1.5 4B EKSFT loss converges to spec); `pytest Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/scripts/test_blindfolded_teacher.py -q` confirms teacher never sees ground-truth answer + minimum-leakage hint discipline holds; integration test: a CPT trial on a small Qwen-class model with corrupted training-data produces a `FailureSignature` with `EksftMaskOverfit` mechanism + actionability `MaskRetune`; the eval corpus runs `eval_m1_canonical_derivation.py` against a baseline checkpoint and emits perplexity-pass metric; `grep -nE "FailureSignature" Body/S/S5/epii-autoresearch-core/src/types.rs` returns the struct definition.

### What this is NOT

- This is NOT a re-architecture of M1' Paramaśiva (the matheme-engine stays as is).
- This is NOT a CPT training pipeline (that's Tranche 12.24 Phase 2 `epii-distillation` scaffold).
- This is NOT a teacher-model vendor lock (per DR-MODEL-1, slot CLI handles this).
- This IS the **load-bearing greenfield piece** the DiscoverAI research surfaced as the one place cycle 3 must build, not wire. Estimate ~500 LOC Python + the eval corpus packaging.

This tranche is the **single substrate-gap closure** identified by the wave-2 DiscoverAI synthesis. Every other Phase-I cycle 3 addition is wiring + exposure + clarification of substrate already in place; this one is build.
