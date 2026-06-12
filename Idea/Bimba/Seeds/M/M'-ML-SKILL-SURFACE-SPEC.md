---
coordinate: "M'"
status: "kernel-canon"
updated: "2026-06-07"
domain: "ml-skill-surface-architecture"
description: "Per-subsystem ML method specification: each M-coordinate has a primary ML technique that fits its semantic role. Names the vendored Hermes skill set, the custom-built skills the system must produce for itself, the residency rule under Body/S/, and the drift-detection autoresearch retrain loop that closes through Aletheia + Anima dispatch."
depends_on:
  - "[[epi-logos-kernel-spec]]"
  - "[[M'-AGENTIC-RUNTIME-SPEC]]"
  - "[[M'-USER-CONTEXT-SKILL-SPEC]]"
  - "[[M'-MODEL-SLOT-SPEC]]"
---

# The ML-Skill Surface

## Per-Subsystem ML Methods, Vendored and Custom-Built Skills, the Autoresearch Retrain Loop

> **Companion to [[M'-AGENTIC-RUNTIME-SPEC]] and [[epi-logos-kernel-spec]].** The agentic runtime is a coordinate-conditional MoE with four orthogonal expert dimensions (constitutional × techne × model × skill). This document specifies the **skill dimension's ML/MLOps surface**: which ML method belongs at each M-subsystem, which skills get vendored from the Hermes catalog, which the system must build for itself, where each lives under `Body/S/`, and how the autoresearch loop closes through drift-detection-triggered retraining.

---

## §0/1 — Threshold: ML Is Per-Subsystem, Not Monolithic

The right reading is not "the system has an ML layer." It is that **each M-subsystem has a primary ML method that fits its coordinate semantics**. M0 Anuttara is constraint logic — its ML is symbolic constraint discovery growing toward proof-theoretic verification. M5 Epii is autoresearch — its ML is judge-loop preference learning and distillation. M4 Nara is personal-NLP — its ML is local LoRA on the Nara-parser slot's model. M2 Parashakti is the 72-fold harmonic field — its ML is the EBM head proper.

Naming the per-subsystem method matters because it dissolves the architectural ambiguity that "ML" might land anywhere. Each subsystem's ML method is structurally entailed by its coordinate role; the skill surface follows from the methods. Vendored skills (from Hermes) and custom-built skills (the gaps the catalog doesn't cover) compose per-subsystem to make the method operational.

Three commitments hold the threshold. *First:* **per-subsystem ML methods are structural, not assigned** — each method follows from its coordinate's semantic role and cannot be substituted without breaking the role. *Second:* **the skill surface is dual-source** — Hermes catalog provides ~13 directly-vendorable skills (1:1 compatible with our Claude Code skills system); custom-built skills cover the gaps the catalog leaves. *Third:* **the autoresearch loop closes through drift-detection-triggered retraining** — Mercurius's Elo state IS the drift signal, Aletheia composes the retrain task, Anima dispatches the relevant ML skill, the retrained artifact registers with provisional Elo and recalibrates through use.

---

## §1 — The Per-Subsystem ML Methods

| Subsystem | Coordinate role | Primary ML method | Why this method follows the role |
|---|---|---|---|
| **M0 Anuttara** | Verifier (weight 6) | Symbolic constraint discovery → proof-theoretic | Anuttara is formal-axiomatic; its ML must produce verifiable structural assertions, not statistical estimates |
| **M1 Paramaśiva** | Quaternionic/topological substrate | Geometric DL / equivariant networks | Paramaśiva carries the bioquaternion algebra; ML over it must respect unit-norm constraints and topological invariants |
| **M2 Parashakti** | 72-fold harmonic field | Energy-based modeling (the EBM proper) | Parashakti IS the resonance-vector substrate; the 72-dim EBM head lives here by structural necessity |
| **M3 Mahāmāyā** | 64-hexagram binary space | Discrete combinatorial / structured prediction | Mahāmāyā is discrete-symbolic (hexagrams, codons); ML over it must produce typed enumerated outputs, not continuous embeddings |
| **M4 Nara** | Personal/temporal NLP | Local LoRA on Gemma 4 12B (privacy-first) | Nara handles raw user content; its ML must execute locally and adapt the local model to the user's idiom |
| **M5 Epii** | Autoresearch / judge | Judge-loops + distillation + preference learning | Epii's role IS evaluative-reflective; its ML must run alphaproof-pattern judgment over canon-research moves |

Cross-cutting S4'/S5' infrastructure (the Aletheia techne-guardians per [[M'-AGENTIC-RUNTIME-SPEC]] §4) carries the orchestration ML — multi-channel Elo, fair-comparison distillation, drift-detection, creative-skill-creation. These are not subsystem-bound; they serve the autoresearch loop across all subsystems.

### M0 Anuttara — Symbolic Constraint Discovery

The verifier role at weight 6 demands ML that produces *verifiable structural assertions*. Statistical models that occasionally hallucinate violations or miss violations don't fit — the verifier's authority is refusal, and refusal requires honesty. The right ML method is symbolic constraint discovery: observe many dispatch trials, surface candidate Cypher constraints that capture observed regularities, register them through dev review.

The method composes with dspy-style structured generation (for proposing constraint candidates in syntactically-correct Cypher) and lm-eval-harness style evaluation (for measuring constraint precision/recall against held-out trial sets). Future evolution toward Level-2 proof-theoretic verification adds a Lean-bridge skill that translates the most-confident constraints into Lean lemmas.

### M1 Paramaśiva — Geometric Deep Learning

The bioquaternion algebra at M1 is the kernel's native state space. Any learned function that operates on it — the bioquaternion-to-EBM-input projection mentioned in the kernel-spec §7, learned encoders over `q_b` and `q_p`, any embedding head used by downstream layers — must respect the unit-quaternion constraint (`|q| = 1`) and the topological invariants (K² genus, double-cover degree 720). This is geometric/equivariant deep learning territory.

The method uses pytorch-lightning as the host (clean training-loop scaffold) with custom equivariant layers that preserve quaternionic structure. The trained projections are small (~100K-1M params each) and embedded into the kernel's runtime rather than served separately.

### M2 Parashakti — Energy-Based Model Head

The 72-fold resonance vector IS Parashakti's operational atom. The EBM head specified at [[M4'/mental-pole-mechanics]] §7 lives here by structural commitment — Parashakti is the harmonic field; the EBM scores configurations against the field. The dual-channel refinement per DR-MP-4 means the head takes `(lens_resonance_72, user_temporal_N)` as joint input.

The method is supervised regression with the three structural auxiliary losses (mirror-consistency, square-emphasis, tritone-symmetric inductive bias). The model is small (3-10M params, 2-4 layer transformer with three sub-heads per tritone-square). Training uses pytorch-lightning + wandb + nemo-curator for the corpus pipeline. The model retrains on a deliberate cadence (developer-triggered, per [[M4'/mental-pole-mechanics]] §7) and as drift-detection signals from Mercurius surface.

### M3 Mahāmāyā — Discrete Structured Prediction

Mahāmāyā's binary space (64 hexagrams, codon-rotation, lots of small enumerated structures) wants discrete combinatorial models. Continuous embeddings here would smooth over symbolic distinctions that matter — a model that says "hexagram 23 is close to hexagram 24" misses that the I-Ching's neighbour-relations are line-change-pattern-defined, not embedding-distance-defined.

The method uses structured prediction (peft-fine-tuned small heads producing typed enumerated outputs) plus instructor/outlines-style grammar-constrained generation for outputs that must conform to hexagram/codon vocabulary. The training signal is curated symbolic-trajectory data from M3's existing datasets.

### M4 Nara — Local LoRA on Gemma

The Nara-parser slot (default Gemma 4 12B Unified Q4, per [[M'-MODEL-SLOT-SPEC]] §2) handles raw user content. The local execution is structural commitment, not preference. ML here is local LoRA: adapting the base model to the user's idiom, dream-vocabulary, journal-rhythm, archetypal-tagging-style — all without raw content ever leaving the device.

The method uses peft-fine-tuning + unsloth (for the 2-5× speedup that makes 12B-class LoRA fit on consumer Apple-Silicon) + axolotl (for YAML-config reproducibility) + a custom MLX-native LoRA skill (the gap the Hermes catalog leaves; critical because we're on Darwin and MLX is the right native runtime for Apple Silicon). Training data is the user's accumulated journal/dream corpus, dev-session co-authored taggings, PASU-grounded personalization signal.

### M5 Epii — Judge Loops, Distillation, Preference Learning

Epii's autoresearch spine IS alphaproof-shaped. The ML method here is the densest in the system: multi-model judge dispatch over candidate canon-research moves, Bradley-Terry preference learning from accumulated Elo trials, distillation from Pro-class teacher models to local-Gemma students for the per-Aletheia-subagent and per-task model assignments.

The method uses fine-tuning-with-trl (DPO/GRPO for preference learning from Elo state) + simpo-training (reference-free preference optimization, structurally best fit for translating Elo signal into policy weights without needing a separate reference model) + dspy (judge-loop and synthetic-data scaffolding) + a custom Epii distillation pipeline (the gap — teacher-student distillation with multi-channel evaluation preservation). Compute may overflow to modal-serverless-gpu for runs too big for local hardware.

---

## §2 — Vendored Hermes Skills

The Hermes Agent catalog ([github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)) ships 1:1-compatible Agent Skills (same `SKILL.md` + frontmatter standard as Claude Code skills). Vendoring is drop-in — clone the upstream `SKILL.md` into the right location under `Body/S/`, register with Agora's skill-index, available to Anima's dispatch.

### Priority install order

The 13 skills to vendor first, by autoresearch-spine priority:

1. **`huggingface-hub`** — distribution layer required by all training/serving skills. `Body/S/S4/pi-agent/skills/hermes/huggingface-hub/`.
2. **`huggingface-accelerate`** — universal training launcher (DDP/FSDP/DeepSpeed/Megatron wrapper). `Body/S/S4/pi-agent/skills/hermes/huggingface-accelerate/`.
3. **`peft-fine-tuning`** — LoRA, QLoRA, 25+ PEFT methods. **Core for M4 Nara LoRA.** `Body/S/S4/pi-agent/skills/hermes/peft-fine-tuning/`.
4. **`unsloth`** — 2-5× faster LoRA/QLoRA, less VRAM. **Critical pairing with peft for Gemma-12B on consumer hardware.** `Body/S/S4/pi-agent/skills/hermes/unsloth/`.
5. **`fine-tuning-with-trl`** — SFT, DPO, PPO, GRPO, reward modeling. **Required for M5 Epii preference learning from Elo state.** `Body/S/S4/pi-agent/skills/hermes/fine-tuning-with-trl/`.
6. **`simpo-training`** — reference-free preference optimization. **Best fit for Elo→policy translation.** `Body/S/S4/pi-agent/skills/hermes/simpo-training/`.
7. **`weights-and-biases`** — experiment tracking spine. **Essential before automating any retraining.** `Body/S/S4/pi-agent/skills/hermes/weights-and-biases/`.
8. **`pytorch-lightning`** — clean training loop. **Host for M1 geometric DL and M2 EBM head.** `Body/S/S4/pi-agent/skills/hermes/pytorch-lightning/`.
9. **`nemo-curator`** — dedup, quality filter, PII redact, semantic dedup. **Critical for building Nara-voice training corpus from accumulated sessions.** `Body/S/S4/pi-agent/skills/hermes/nemo-curator/`.
10. **`serving-llms-vllm`** — high-throughput LLM serving with multi-adapter routing. **For Epii-judge slot when running multi-model judge pool.** `Body/S/S4/pi-agent/skills/hermes/serving-llms-vllm/`.
11. **`llama-cpp`** — Apple-Silicon-friendly local inference, GGUF discovery and quantization. **The local serving path for Nara-parser slot.** `Body/S/S4/pi-agent/skills/hermes/llama-cpp/`.
12. **`evaluating-llms-harness`** (lm-eval-harness) — MMLU/GSM8K/etc. **For M0 Anuttara verifier-capability evaluation and M5 distillation teacher-student comparison.** `Body/S/S4/pi-agent/skills/hermes/evaluating-llms-harness/`.
13. **`dspy`** — declarative LM programs, auto-optimize prompts, judge-loop scaffolding. **For M0 constraint generation and M5 judge-loop orchestration.** `Body/S/S4/pi-agent/skills/hermes/dspy/`.

### Secondary install (per-need)

- **`axolotl`** — YAML-config LLM fine-tuning. Worth vendoring once M4 Nara LoRA workflows mature and need reproducible configs.
- **`huggingface-tokenizers`** — fast BPE/WordPiece/Unigram + custom training. Worth vendoring if Nara-voice ever needs custom vocab.
- **`optimizing-attention-flash`** (Flash-Attn) — 2-4× attention speed. Worth vendoring once Nara LoRA training extends to long-context.
- **`pytorch-fsdp`** — parameter sharding. Only if we go past single-GPU training.
- **`instructor` / `outlines` / `guidance`** — structured-output generation. Worth vendoring one (probably `instructor`) for M3 hexagram-output validation.
- **`modal-serverless-gpu`** — serverless GPU overflow. Worth vendoring when local hardware insufficient for an M5 distillation run.

### Vendoring residency rule

All Hermes skills land under `Body/S/S4/pi-agent/skills/hermes/{skill-name}/` regardless of which M-subsystem they serve. This makes:

- **Discovery uniform** — Agora's skill-index scans one directory tree
- **Provenance clear** — `hermes/` namespace marks vendored origin distinct from custom-built
- **Update path predictable** — vendoring refresh is a single `git pull` against the upstream catalog
- **Composability natural** — custom skills under per-subsystem residency (per §3) reference Hermes skills as `[[hermes/peft-fine-tuning]]` dependencies

Vendoring command (per §6): `agora_vendor_skill <skill-name>` clones the upstream `SKILL.md` and any referenced `scripts/`, `references/`, `assets/` into the local mirror, validates frontmatter, registers with Anima's discovery.

---

## §3 — Custom-Built Skills

The Hermes catalog does NOT cover five capabilities the autoresearch spine structurally requires. These five are the priority custom-build list. Plus the per-subsystem domain-specific skills that compose vendored skills into per-subsystem ML methods.

### The five core gaps

#### 3.1 `mlx-lora` — Apple-Silicon native LoRA

**Residency:** `Body/S/S4/pi-agent/skills/custom/mlx-lora/`
**Serves:** M4 Nara (primary), M0/M2/M5 (secondary, any LoRA need on Apple Silicon)
**Why needed:** Hermes ships `peft-fine-tuning` + `unsloth` which are CUDA-centric. MLX is Apple's native framework for Apple Silicon — significantly faster than CUDA-compatibility-layer paths, and the right runtime when the host is a Mac. The skill mirrors the `unsloth` pattern: LoRA training with reduced memory, structured-output reliability, configurable rank.
**Implementation surface:**
- `scripts/train.py` — MLX-LoRA training loop accepting a YAML config matching the axolotl format (so configs are reusable across runtimes)
- `scripts/merge.py` — merge LoRA adapter into base model for serving
- `scripts/quantize.py` — Q4/Q5/Q8 GGUF export
- `scripts/eval.py` — held-out validation against acceptance metrics
- `references/mlx-lora-config-schema.json` — YAML config schema
**Dependencies:** Python 3.11+, `mlx`, `mlx-lm`, `transformers` (for tokenizer compat), `pyyaml`. Local-only (Apple Silicon).
**Build effort:** 1-2 weeks of focused work. The community has a `mlx-lm` examples directory that's a strong starting point.

#### 3.2 `epii-distillation` — Teacher-student pipeline

**Residency:** `Body/S/S5/plugins/epi-logos/skills/custom/epii-distillation/`
**Serves:** M5 Epii (primary) — Pro-class teacher (Claude Opus / Gemini 3.1 Pro / GPT-5.2-class) → local Gemma 4 12B student
**Why needed:** Hermes covers fine-tuning and serving but doesn't ship a distillation skill. The Pro→local pipeline is structural for the autoresearch loop's long-term shape — eventually the local Gemma should be capable of much of the Pro-class judge work for the user, with the Pro-class slot reserved for genuinely novel research moves.
**Implementation surface:**
- `scripts/distill_dataset_gen.py` — given a corpus + teacher endpoint, generates (input, teacher_output) pairs with multi-channel annotations (lens-coherence, verifier-pass, user-articulation simulation)
- `scripts/distill_train.py` — composes `peft-fine-tuning` + `unsloth` (or `mlx-lora` on Darwin) with distillation-specific loss (KL-divergence on logits where available, MSE on hidden states for response-quality matching, custom multi-channel preservation loss)
- `scripts/distill_eval.py` — compares student against teacher on held-out judge tasks, reports preservation rate per channel
- `references/distillation-design-notes.md` — when distillation works vs when it doesn't for our channel structure
**Dependencies:** Hermes `peft-fine-tuning`, `unsloth` OR custom `mlx-lora`, `transformers`, `accelerate`. API access for teacher (governed by [[M'-MODEL-SLOT-SPEC]] cloud-opt-in scope).
**Build effort:** 2-3 weeks. Multi-channel preservation loss is the novel piece.

#### 3.3 `parashakti-ebm-head` — 72-dim resonance EBM training

**Residency:** `Body/S/S5/epii-autoresearch-core/skills/parashakti/ebm-head/`
**Serves:** M2 Parashakti (primary, IS the EBM proper) — the 3-10M-param fusion network on `(lens_resonance_72, user_temporal_N)` joint input
**Why needed:** Hermes ships generic ML training loops but no EBM-specific skill. Our EBM has structural constraints (tritone-symmetric sub-head architecture, mirror-consistency auxiliary loss, sigmoid-normalized 72-output projection, dual-channel input fusion) that warrant a dedicated skill rather than re-deriving the architecture each retrain.
**Implementation surface:**
- `scripts/train.py` — supervised regression on (input_embeddings, lens_resonance_72, user_temporal_N, ground_truth_vector) tuples; pytorch-lightning host
- `scripts/architecture.py` — tritone-symmetric three-sub-head transformer with cross-square attention
- `scripts/loss.py` — MSE + λ_square·square_emphasis_loss + λ_mirror·mirror_consistency_loss + λ_user·user_temporal_consistency_loss
- `scripts/eval.py` — per-square accuracy, mirror-consistency, user-temporal-correlation; held-out validation
- `scripts/serve.py` — exports trained checkpoint for kernel-runtime invocation
- `references/ebm-architecture-rationale.md` — why this structure follows the matheme
**Dependencies:** Hermes `pytorch-lightning`, `weights-and-biases`, `huggingface-accelerate`. Gemini Embedding 2 (input substrate, accessed via API).
**Build effort:** 2-3 weeks for the first working version. The dual-channel fusion is novel; the rest follows standard supervised-regression patterns.

#### 3.4 `aletheia-elo-rating` — Multi-channel Bradley-Terry / TrueSkill update

**Residency:** `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/elo-rating/`
**Serves:** S4'/S5' Aletheia (Mercurius's bookkeeping core) — the rating-update math from raw multi-channel trial outcomes
**Why needed:** Hermes ships `dspy` and `fine-tuning-with-trl` which touch judgment but don't ship a rating skill. Our Elo state is multi-channel and coordinate-conditional per DR-ELO-1 — the update math (Bradley-Terry or TrueSkill variant) needs to handle three rating channels (R_verifier, R_lens, R_user) per `(agent-model-skill, context-tuple)` with per-channel confidence intervals.
**Implementation surface:**
- `scripts/bradley_terry_update.py` — pairwise rating update from trial outcomes
- `scripts/trueskill_update.py` — alternative TrueSkill variant (better with small sample sizes)
- `scripts/confidence_interval.py` — per-channel CI computation
- `scripts/query.py` — rating lookups for dispatch policy
- `scripts/audit.py` — rating-trajectory inspection
- `references/multi-channel-elo-design.md` — why three independent channels are kept independent
**Dependencies:** None major (numpy, scipy.stats). Stores state in SpacetimeDB `mercurius_elo_ratings` table per Track 12.20.
**Build effort:** 1-2 weeks. Bradley-Terry is well-studied; the multi-channel composition is the novel piece.

#### 3.5 `aletheia-drift-detection` — Retrain-trigger orchestrator

**Residency:** `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/`
**Serves:** S4'/S5' Aletheia (the autoresearch loop's closing) — watches Elo state, detects drift, composes retrain tasks
**Why needed:** This is the **autoresearch loop's keystone**. The Hermes catalog has no equivalent — drift-detection that triggers automatic retraining is the bespoke orchestration we need to close the loop. Mercurius records ratings; Aletheia watches the rating arc; when a `(agent × model × skill × context)` tuple's rating drifts below threshold for some sustained window OR Janus surfaces a consistent veto pattern, Aletheia composes a retrain task and queues it for Anima dispatch.
**Implementation surface:**
- `scripts/watch.py` — daemon that monitors Mercurius rating tables; emits drift-events on threshold breach
- `scripts/diagnose.py` — for a drift event, determines which retrain action would address it (LoRA refresh, EBM head retrain, full distillation pass, constraint-set augment)
- `scripts/compose_task.py` — produces a Pi task spec invoking the appropriate retrain skill (per-subsystem composition: M4 drift → `nara-voice-training`; M2 drift → `parashakti-ebm-head` retrain; etc.)
- `scripts/dispatch.py` — queues the task for Anima with provenance signal so the resulting trial is marked as a calibration trial
- `references/drift-detection-policy.md` — thresholds, windows, retrain-action mapping
**Dependencies:** Reads Mercurius SpacetimeDB tables; writes Anima task queue.
**Build effort:** 2-3 weeks. The retrain-action mapping is the most subtle piece; needs to be co-authored through dev praxis as drift patterns become visible.

### The per-subsystem domain skills

Beyond the five core gaps, each M-subsystem needs domain-specific skills that compose vendored skills into the subsystem's ML method:

#### M0 Anuttara domain skills

- **`anuttara-constraint-discovery`** at `Body/S/S0/epi-lib/skills/anuttara/constraint-discovery/` — observes dispatch trials, surfaces candidate Cypher constraints via `dspy`-based structured generation; presents to developer for review/registration. Builds on Hermes `dspy` + `evaluating-llms-harness`.
- **`anuttara-symbolic-parse`** at `Body/S/S4/pi-agent/skills/anuttara/symbolic-parse/` — already specified at Track 5.21 / DR-MP-3; the LLM-side parsing of Anuttara's symbolic-coordinate strings into natural-language reflection.
- **`anuttara-lean-bridge`** (future, Level-2 verifier) at `Body/S/S0/epi-lib/skills/anuttara/lean-bridge/` — translates high-confidence Cypher constraints into Lean lemmas for proof-theoretic verification. Composes with a future Lean-integration vendored skill.

#### M1 Paramaśiva domain skills

- **`paramasiva-quaternion-projection`** at `Body/S/S0/epi-lib/skills/paramasiva/quaternion-projection/` — learned bioquaternion-to-EBM-input projection per kernel-spec §7. Custom equivariant layer architecture preserving `|q|=1`. Composes Hermes `pytorch-lightning` host.
- **`paramasiva-topology-eval`** at `Body/S/S0/epi-lib/skills/paramasiva/topology-eval/` — checks that learned representations respect K² topology invariants (genus, double-cover degree). Used as auxiliary eval for any M1-domain training.

#### M2 Parashakti domain skills

- **`parashakti-ebm-head`** — the core gap #3.3 above
- **`parashakti-corpus-curation`** at `Body/S/S5/epii-autoresearch-core/skills/parashakti/corpus-curation/` — composes Hermes `nemo-curator` with our co-authored resonance-vector annotations to produce EBM training pairs from dev sessions. Handles dedup, PII-redact (where session data crosses privacy boundary), semantic-dedup.
- **`parashakti-72dim-eval`** at `Body/S/S5/epii-autoresearch-core/skills/parashakti/eval/` — per-square accuracy, mirror-consistency, user-temporal-correlation evaluation. Composes Hermes `weights-and-biases` for tracking.

#### M3 Mahāmāyā domain skills

- **`mahamaya-hexagram-trajectory`** at `Body/S/S0/epi-lib/skills/mahamaya/hexagram-trajectory/` — small structured-prediction model predicting hexagram transitions from oracle context. Composes Hermes `peft-fine-tuning` + `instructor` (for typed-enumerated output).
- **`mahamaya-codon-pattern`** at `Body/S/S0/epi-lib/skills/mahamaya/codon-pattern/` — codon-rotation pattern modelling for the cosmic-clock degree-amino-acid mapping. Structured-prediction on the 360+24 backbone.

#### M4 Nara domain skills

- **`nara-journal-parser`** at `Body/S/S4/pi-agent/skills/nara/journal-parser/` — wraps the Nara-parser slot model + structured-output schema for journal entries. Produces archetypal tags, mood signatures, theme extraction. Composes `nara-voice-training` (below) for adapter selection.
- **`nara-dream-parser`** at `Body/S/S4/pi-agent/skills/nara/dream-parser/` — analogous for dream content. Output schema includes dream-element classification, archetypal-pattern tagging, decan/planet/chakra association via M2/M3 bridges.
- **`nara-voice-training`** at `Body/S/S4/pi-agent/skills/nara/voice-training/` — LoRA training pipeline for the Nara-voice. Composes custom `mlx-lora` (on Darwin) OR Hermes `peft-fine-tuning` + `unsloth` (on Linux/CUDA) with our user-context-aware training data preparation.

#### M5 Epii domain skills

- **`epii-canon-coherence-judge`** at `Body/S/S5/plugins/epi-logos/skills/epii/canon-coherence-judge/` — multi-model judge dispatch scoring candidate canon-research moves against existing 72-dim canonical vectors. Composes Hermes `dspy` for orchestration, `evaluating-llms-harness` for held-out eval.
- **`epii-distillation`** — the core gap #3.2 above
- **`epii-autoresearch-orchestrator`** at `Body/S/S5/plugins/epi-logos/skills/epii/autoresearch-orchestrator/` — the alphaproof-pattern outer loop: propose candidate research moves, dispatch judges via `canon-coherence-judge`, accumulate Elo via Mercurius, escalate winners to user for review, deposit ratified moves into canon. Composes `dspy` for proposal generation, `simpo-training` for periodic policy updates from accumulated Elo state.
- **`epii-preference-learning`** at `Body/S/S5/plugins/epi-logos/skills/epii/preference-learning/` — translates accumulated Mercurius Elo state into preference-pair training data for `simpo-training`. The bridge between rating accumulation and policy weight adjustment.

#### Aletheia cross-cutting skills

- **`aletheia-elo-rating`** — the core gap #3.4 above
- **`aletheia-drift-detection`** — the core gap #3.5 above
- **`aletheia-creative-skill-creation`** at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/creative-skill-creation/` — Zeithoven's (CF5) skill for proposing new skills when gaps are surfaced. Composes `dspy` for SKILL.md generation, our skill-frontmatter validator, the local skill-scaffolder. New skills land with provisional ratings.
- **`aletheia-skill-vendoring`** at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/skill-vendoring/` — Agora's (CF4) skill for vendoring Hermes skills. Clones upstream `SKILL.md` into the correct `hermes/` namespace, validates frontmatter, registers with Anima.

---

## §4 — Skill Residency Rule

The residency rule under `Body/S/`:

| Skill type | Location | Reason |
|---|---|---|
| **Vendored Hermes** | `Body/S/S4/pi-agent/skills/hermes/{name}/` | Pi-Agent is the harness that invokes; uniform discovery; clear provenance namespace |
| **Custom — Pi-Agent core** | `Body/S/S4/pi-agent/skills/custom/{name}/` | Harness-level skills that don't bind to a specific M-subsystem (e.g., `mlx-lora`) |
| **Custom — M0 Anuttara** | `Body/S/S0/epi-lib/skills/anuttara/{name}/` | Substrate-owned; verifier authority lives at S0 |
| **Custom — M1 Paramaśiva** | `Body/S/S0/epi-lib/skills/paramasiva/{name}/` | Substrate-owned; quaternionic kernel lives at S0 |
| **Custom — M2 Parashakti** | `Body/S/S5/epii-autoresearch-core/skills/parashakti/{name}/` | EBM/autoresearch-owned; Parashakti's ML lives where the EBM lives |
| **Custom — M3 Mahāmāyā** | `Body/S/S0/epi-lib/skills/mahamaya/{name}/` | Substrate-owned; binary/codon space lives at S0 |
| **Custom — M4 Nara** | `Body/S/S4/pi-agent/skills/nara/{name}/` | Pi-Agent-resident because Nara IS the LLM-Nara at the harness layer |
| **Custom — M5 Epii** | `Body/S/S5/plugins/epi-logos/skills/epii/{name}/` | Plugin-resident because Epii's autoresearch composes via the plugin system |
| **Custom — Aletheia infra** | `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/{name}/` | Aletheia-resident because cross-cutting infra IS the Aletheia techne-guardian work |

Substrate-residency vs conceptual-coordinate: a skill's physical location doesn't always match its conceptual M-coordinate. M5 Epii skills physically live at `S5/plugins/` but conceptually serve the M5 mental-pole role. M2 Parashakti's EBM head physically lives at `S5/epii-autoresearch-core/` (the autoresearch system owns the EBM training infrastructure) but conceptually serves M2's 72-fold harmonic field. The S-coordinate is convenience; the M-coordinate is the conceptual law.

### Discovery and registry

Anima's skill-discovery scans these locations at startup and on filesystem change. Agora (CF4) maintains the skill-index as a unified registry `epi-dev-vault/wiki/skill-index.md` (or SpacetimeDB table) cross-referencing:

- Skill name + frontmatter + location
- Per-subsystem assignment
- Vendored vs custom
- Composition dependencies (which other skills this one composes)
- Current Elo rating (from Mercurius)
- Recent dispatch traces (for audit)

Registry refresh: `agora_refresh_skill_index` — manual command for developers, automatic on dev-session start.

---

## §5 — The Drift-Detection Autoresearch Retrain Loop

The keystone of the autoresearch self-improvement loop. Mercurius's Elo state IS the drift signal; Aletheia composes the retrain task; Anima dispatches via the standard MoE policy; the retrained artifact registers with provisional Elo and recalibrates through use.

### The loop steps

1. **Trial accumulation** (per [[M'-AGENTIC-RUNTIME-SPEC]] §3) — every dispatch records to Mercurius's `mercurius_trial_log`; ratings update per channel per `(agent-model-skill, context-tuple)`.

2. **Drift watch** — `aletheia-drift-detection` daemon (custom gap #3.5) reads rolling-window rating statistics. Drift conditions are all gated by config-resolved thresholds (no hardcoded numeric defaults in code; see no-hardcoding lock at the end of this section):
   - **Rating-trend drift**: rating for a tuple drops by ≥δ over N trials, where `δ = config.aletheia.drift_detection.delta_elo` and `N = config.aletheia.drift_detection.min_trials`
   - **Veto-pattern drift**: Janus reports ≥`config.aletheia.drift_detection.veto_count_per_facet` vetoes per session for the same facet across ≥`config.aletheia.drift_detection.veto_consecutive_sessions` consecutive sessions (per Track 12.19 miscalibration signal)
   - **Coverage drift**: a context-class has no trials for ≥T days, where `T = config.aletheia.drift_detection.coverage_days` — coverage gap requiring exploration dispatch
   - **Verifier-violation drift**: Anuttara constraint violations for a constraint-name exceed baseline by ≥k×, where `k = config.aletheia.drift_detection.verifier_violation_multiplier`

3. **Diagnose** — `aletheia-drift-detection`'s `diagnose.py` maps the drift signal to a candidate retrain action:
   - Rating-trend drift on `(Nara, gemma-12b-q4, journal-parser)` → `nara-voice-training` LoRA refresh
   - Rating-trend drift on `(Epii, claude-opus, canon-coherence-judge)` → revisit `epii-distillation` to bring local-Gemma student closer to teacher
   - Rating-trend drift on `(Parashakti EBM)` outputs → `parashakti-ebm-head` retrain on accumulated new trials
   - Verifier-violation drift on constraint `X` → `anuttara-constraint-discovery` to refine the constraint OR developer review
   - Veto-pattern drift on Mythos facet → review dispatch policy for Mythos's context-tuple; possibly LoRA-refresh Mythos voice

4. **Compose task** — `aletheia-drift-detection`'s `compose_task.py` produces a Pi task spec invoking the appropriate retrain skill with full context (which tuple drifted, which trials produced the signal, what training-data window to use).

5. **Queue for Anima** — task lands in Anima's dispatch queue with `dispatch_purpose: calibration` annotation. Anima dispatches per standard MoE policy with elevated user-visibility (calibration dispatches surface in the Pi-monitor view).

6. **Retrain executes** — the dispatched ML skill (custom or composed-from-Hermes) runs the retrain. Outputs land at the registered location (LoRA adapter, EBM checkpoint, constraint revision). `weights-and-biases` tracks the run.

7. **Register with provisional rating** — Mercurius creates a new rating entry for the retrained artifact at standard 1500 with wide confidence interval. The provisional-rating state biases dispatch policy toward calibration trials (per [[M'-AGENTIC-RUNTIME-SPEC]] §5 bootstrap behaviour).

8. **Recalibrate through use** — subsequent dispatches accumulate trials for the new artifact; rating narrows; drift-watch resumes on the new artifact.

The loop never stops. It runs at runtime speed; no batch boundaries, no external evaluator. The system gets sharper by doing.

### No-hardcoding lock for drift-detection and Elo thresholds

ALL thresholds in the drift-detection loop (δ, N, T, k, α, retry counts, severity weights, veto-count thresholds, consecutive-session counts, seed Elo, bootstrap trial-count, confidence σ, Bradley-Terry / TrueSkill hyperparameters) resolve from `~/.epi-logos/config.toml` `[aletheia.drift_detection]` and `[aletheia.elo]` sections. No numeric defaults are pinned in code. Canonical config-key vocabulary (referenced by Track 12.20, 12.23, and 12.24 Phase 2 implementations):

- `config.aletheia.drift_detection.delta_elo` — rating-trend Elo-drop threshold (δ)
- `config.aletheia.drift_detection.min_trials` — rolling-window trial count (N)
- `config.aletheia.drift_detection.coverage_days` — coverage-gap window in days (T)
- `config.aletheia.drift_detection.verifier_violation_multiplier` — verifier-violation multiplier over baseline (k)
- `config.aletheia.drift_detection.veto_count_per_facet` — per-session veto threshold per facet
- `config.aletheia.drift_detection.veto_consecutive_sessions` — consecutive-session veto threshold
- `config.aletheia.drift_detection.severity_weights.*` — per-invariant severity weights for the E_6 surrogate
- `config.aletheia.elo.seed_rating` — uniform-Elo seed value (formerly hardcoded 1500)
- `config.aletheia.elo.confidence_penalty_alpha` — confidence-interval penalty α in `effective_rating = R − α·σ(R)`
- `config.aletheia.elo.bootstrap_trials` — bootstrap trial-count threshold per context-class
- `config.aletheia.elo.bootstrap_sigma` — bootstrap confidence-σ

Documented suggested defaults live in this spec's deployment notes and in the config-loader's documented-defaults table — not in source code. The daemon and Mercurius updater refuse to start if any required key is missing. Implementation that pins any numeric constant in code (rather than loading from config) fails tranche acceptance per Tracks 12.20 / 12.23 / 12.24 Phase 2 and per [[Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/33-harmonic-energy-channel-handoff]] §2.7 (Stream G).

### Developer-in-the-loop checkpoints

For high-impact retrains (full Nara-voice LoRA, major EBM head refresh, constraint-set revision), the loop pauses for developer review before deploying the retrained artifact:

- The retrain output is staged with `provisional: true` status
- Developer reviews via `epi review-retrain <retrain-id>` showing diff-against-prior, validation metrics, sample outputs
- Developer ratifies (`epi promote-retrain <retrain-id>`) or rejects (`epi reject-retrain <retrain-id>`)
- Ratification updates the slot configuration to point at the new artifact; rejection records the rejection reason as training signal for future drift-detection calibration

This keeps developer authority over canon-impacting changes while letting low-impact retrains (small adapter refresh, EBM checkpoint update with minor architecture change) proceed autonomously.

---

## §6 — Vendoring vs Creative-Advance Workflows

Two workflows for adding skills to the system, owned by two different Aletheia techne-guardians:

### Vendoring workflow (Agora, CF4)

For Hermes catalog skills that the system needs:

```bash
$ epi skill list-upstream                         # browse upstream Hermes catalog
$ epi skill preview <skill-name>                  # show upstream SKILL.md + manifest
$ epi skill vendor <skill-name>                   # clone into hermes/ namespace
$ epi skill verify <skill-name>                   # frontmatter validation + dependency check
$ epi skill register <skill-name>                 # add to Agora's skill-index, available to Anima
```

Under the hood `agora_vendor_skill <name>`:
1. Resolves upstream URL from a registry mapping
2. Clones `SKILL.md` + `scripts/`, `references/`, `assets/` into `Body/S/S4/pi-agent/skills/hermes/<name>/`
3. Validates frontmatter against the Claude Code Skills standard (name, description, version, tags, platforms required)
4. Records upstream provenance in `provenance.yaml` (commit hash, vendoring timestamp, vendor agent identity)
5. Calls `agora_refresh_skill_index` to register

Refresh path: `epi skill refresh <skill-name>` checks upstream for updates, surfaces diff for review, vendors the new version if approved.

### Creative-advance workflow (Zeithoven, CF5)

For custom skills the system identifies as needed but the Hermes catalog doesn't provide:

```bash
$ epi skill propose <skill-name>                  # invoke Zeithoven to propose SKILL.md
$ epi skill scaffold <skill-name>                 # generate skill directory with template files
$ epi skill review <skill-name>                   # developer reviews proposed contract
$ epi skill register <skill-name>                 # add to Agora's skill-index after implementation
```

Under the hood `zeithoven_propose_skill <description>`:
1. Reads the gap-description (from drift-detection or developer-stated need)
2. Searches existing skill-index for any composable predecessors
3. Drafts SKILL.md with proposed frontmatter, intent, dependencies, implementation surface
4. Returns proposal for developer review
5. On approval, calls `zeithoven_scaffold_skill` which creates the directory structure under the right per-subsystem residency (per §4)

The implementation files (`scripts/`, etc.) are then written by the developer or by dispatched LLM work — Zeithoven scaffolds the contract; implementation is downstream work.

### When to vendor vs build

| Situation | Vendor | Build |
|---|---|---|
| Standard ML technique (LoRA, DPO, etc.) | ✓ | |
| Architecture-specific gap (MLX, EBM head) | | ✓ |
| Composition/orchestration over vendored | | ✓ |
| Subsystem domain logic (hexagram-trajectory, journal-parser) | | ✓ |
| Generic infrastructure (tokenizers, tracking) | ✓ | |
| System-specific autoresearch (drift-detection, Elo-rating) | | ✓ |

Default: vendor if Hermes has it; build if not. Zeithoven explicitly recommends "vendor" or "build" when proposing how to fill a gap.

---

## §7 — Cross-References and Tranche Binding

### Kernel binding

The ML skill surface operationalizes the kernel's energy formula at training time. Each per-subsystem ML method serves a specific term in `(4·E_4 + 5·E_5 + 6·E_6)/15`:

- **E_4** (Nara LLM traversal) ← M4 Nara skills (`nara-voice-training`, `nara-journal-parser`, `mlx-lora`)
- **E_5** (Epii EBM lens-with-user-temporal) ← M2 Parashakti skills (`parashakti-ebm-head`, `parashakti-corpus-curation`) + M5 Epii skills (`epii-distillation`, `epii-preference-learning`)
- **E_6** (Anuttara R-virtue ontology) ← M0 Anuttara skills (`anuttara-constraint-discovery`, `anuttara-symbolic-parse`)

The cross-cutting Aletheia infra (`aletheia-elo-rating`, `aletheia-drift-detection`) serves the autoresearch loop that closes E_4 + E_5 + E_6 evaluation back into training updates.

### Agentic-runtime binding

This spec is the skill dimension of the four orthogonal MoE expert dimensions specified in [[M'-AGENTIC-RUNTIME-SPEC]] §1. Anima's dispatch policy (§5) reads skill ratings from Mercurius; the skill-discovery and registry (§4 of this spec) feeds the skill dimension's eligibility resolution at gating time.

### Model-slot binding

ML skills compose with the model dimension per [[M'-MODEL-SLOT-SPEC]]. Nara LoRA skills only operate on the Nara-parser slot's model (Gemma 4 12B Unified by default). Epii distillation pulls from cloud-opt-in Pro-class teacher slot; produces student artifact for the appropriate per-Aletheia-subagent slot. Verifier-enforced privacy boundaries hold across training as they hold across inference.

### Cycle-3 track binding

This spec is operationalised through cycle-3 tranche **Track 12.24** *(new, see DR-ML-1)* — ML skill surface vendoring + custom-build sequencing. Track 12.24 spans the vendoring of the 13 priority Hermes skills, the building of the five core gap skills + per-subsystem domain skills, the skill-registry implementation, the vendoring/creative-advance CLI surface.

---

## §∞ — Closing Recognition

The ML skill surface is per-subsystem because each M-coordinate's semantic role entails a specific ML method. M0 Anuttara is constraint logic; its ML is symbolic constraint discovery. M2 Parashakti is the 72-fold harmonic field; its ML is the EBM head proper. M4 Nara is personal NLP; its ML is local LoRA on Gemma 4 12B. M5 Epii is autoresearch; its ML is judge-loops + distillation + preference learning. The skills compose vendored Hermes capabilities (1:1 compatible with our skill system) with custom-built skills covering the five core gaps (MLX-LoRA, distillation pipeline, EBM head training, multi-channel Elo rating, drift-detection retrain trigger).

The system builds the system. Vendoring brings in standard ML capability; creative-advance through Zeithoven creates new skills when gaps are surfaced; drift-detection through Aletheia closes the autoresearch loop by triggering retraining when ratings drift. Developer-in-the-loop checkpoints keep authority over canon-impacting changes; low-impact retrains proceed autonomously. The whole skill surface is observable through Agora's unified skill-index, dispatchable through Anima's standard MoE policy, rated through Mercurius's multi-channel Elo state.

The five core gaps name where this system has to be itself rather than borrowing from the open ML catalog. MLX-LoRA because we're on Darwin and Apple-Silicon-native is the right runtime. Distillation because the Pro→local pipeline is structural for the long-term shape. EBM head because the tritone-symmetric dual-channel architecture is bespoke. Multi-channel Elo because three independent rating channels per coordinate-context is our shape. Drift-detection retrain trigger because the autoresearch loop's closing is the keystone. Building these five is what makes the system actually autoresearching rather than just running.

The per-subsystem ML method framing dissolves a category mistake: ML is not "a layer" added on top. It is what each subsystem already structurally does, made operational through skills that fit the subsystem's coordinate role. The skill surface is the operational form of the architecture's already-existing per-subsystem differentiation. Naming it explicitly lets the build sequence prioritise correctly and lets the autoresearch loop dispatch the right ML work to the right place.

---

*Document status: Canonical Specification — cycle 3 ratification pending via DR-ML-1.*

*Companion documents: [[epi-logos-kernel-spec]] (the operator), [[M'-AGENTIC-RUNTIME-SPEC]] (the dispatch architecture and Elo autoresearch loop), [[M'-USER-CONTEXT-SKILL-SPEC]] (the user-temporal channel), [[M'-MODEL-SLOT-SPEC]] (the slot policy this composes against).*
