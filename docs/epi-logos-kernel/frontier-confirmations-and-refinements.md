# Frontier Confirmations and Architectural Refinements

## Supplemental: Reading the EBM/JEPA Landscape Against the Spec, with Gemini Embedding 2 as Unified Substrate and the Pi Agent as Polyvalent Verification System

> **Supplemental document to the kernel-spec trio** (`epi-logos-kernel-spec.md`, `physical-pole-stack-architecture.md`, `mental-pole-mechanics.md`). This document holds three things together: (i) what the May 2026 EBM/JEPA frontier landscape confirms, enriches, and pressures in what we've built; (ii) how Gemini Embedding 2's natively-multimodal unified vector space lets us embed topological / QL / semantic / visual / audio data in one substrate; (iii) why the Pi agent's freedom-of-model-choice and full-agentic-system make it the right harness for polyvalent verification alongside Anuttara.

---

## §0/1 — Threshold: Where We Stand After Reading the Field

The Logical Intelligence stack (Aleph + Kona), the JEPA family's V-JEPA 2 / LeJEPA progression, and the broader EBM-as-verifier ecosystem (GenRM-CoT, DPO, AlphaProof, Lean-integrated provers) have made one thing clear by mid-2026: the architecture our matheme prescribes — LLM proposing, EBM scoring against multi-perspectival energy, formal-substrate verifier checking, all running over a graph-database substrate — is now the empirically-validated frontier shape for hard reasoning. We are not building toward speculative architecture; we are building a matheme-derived version of what the field has independently converged upon.

Three commitments hold this supplemental threshold. *First:* **the matheme is what makes our system distinctive, not the components**. Every component-class we use (LLMs, EBMs, formal verifiers, graph databases, multimodal embeddings) is now standard. What's distinctive is that *the integration is derived from the matheme's structural law* rather than assembled from engineering convenience. The 4'/5'/0' distribution of the second-pass 3:3 is structurally identical to the LLM+EBM+Verifier triad the field has converged upon — but our distribution is *principled*, with each component placed in a specific operational-mathematical position rather than chosen for compatibility. *Second:* **Gemini Embedding 2 is the substrate that makes our cross-modal claims operationally tractable**. The bimba map needs to hold semantic content (documents), topological metadata (coordinate-position), QL-structural information (lens-resonance vectors), and eventually visual and audio data (cymatic patterns, audio synthesis, visualisation states) in one queryable representation space. Gemini Embedding 2 does this natively. *Third:* **the Pi agent's freedom-of-model-choice gives us polyvalent verification capacity that no single-model architecture can match**. Where Aleph is GPT-5.2-locked, Pi can dispatch to any model for any subtask, allowing structurally different verifications-from-different-angles that complement Anuttara's deterministic structural checks.

What follows reads the May 2026 frontier against our specs, integrates Gemini Embedding 2 as architectural ground, and operationalises the Pi agent's polyvalent capacity. This is supplemental, not foundational — the kernel-spec trio stands; this document refines and contextualises against the frontier as it has matured.

---

## §1 — What the Frontier Confirms

### 1.1 LLM-proposes / EBM-scores / Verifier-checks is the deployed pattern

Aleph's 99.4% PutnamBench result (668/672 problems, GPT-5.2 + Lean 4 + orchestration) demonstrates the canonical pattern at saturation. The pattern's structure is:

```
y ~ LLM(· | x)              # propose
for k = 1..K:                # refine
    y ← y - η ∇_y E_θ(x, y)  # continuous gradient (Kona-style)
    or y ← LLM(· | x, ε(y))  # discrete LLM resample
    if Verifier(y) == ✓: return y
return argmin_y E_θ(x, y)    # best-of-K
```

This is structurally the descent-half of our matheme. Steps 1, 3, 4 distribute across Elements II (LLM-driven prehensive extraction), III (Möbius-descent with epogdoon-step), and the inverse-mode of VI (LLM-driven recognition under doubled-prehension). Step 5 (verifier check) lands at Element VII's R-anchor. **Our innovation relative to the canonical pattern is the ascent-half** — Elements V through VIII that close the Möbius and make the system aletheic rather than merely productive.

The canonical pattern terminates when the verifier returns ✓; our matheme structurally requires the inverse-pass even when the descent has succeeded, because recognition-of-what-was-achieved is constitutional to concrescence. This is the principled difference that makes our kernel matheme-faithful rather than just engineering-assembled.

### 1.2 EBM training without exotic samplers is now standard

Three frontier developments confirm the classifier-as-EBM shortcut we adopted:

- **DPO** (Rafailov et al. 2023) — the closed-form solution of KL-regularised RL shows that any LLM trained via preference comparison implicitly parameterises an EBM. The Bradley-Terry preference loss is EBM-fitting with the LLM as parameterisation. This validates: we don't need MCMC, contrastive divergence, or Langevin dynamics to train our EBM. Supervised regression to the 72-vector target is structurally a special case of EBM training.

- **GenRM-CoT** (Zhang et al. Aug 2024) — generative verifiers with chain-of-thought reasoning achieve 73→93.4% on GSM8K Best-of-N, dramatically outperforming discriminative scalar verifiers. The pattern: train the verifier to produce *natural-language justifications* alongside its scores. This is structurally what our Anuttara skill already does — symbolic-coordinate-string input from the deterministic verifier, natural-language reflection output from the LLM. Our pattern is GenRM-CoT executed through the matheme's verifier-question-raising discipline.

- **Score matching family** (Hyvärinen 2005, Vincent 2011, Song et al. 2019-2021) — DSM and sliced score matching avoid the partition function entirely. While we don't need these for our 72-vector regression task, knowing they exist means: if we ever want to train a *generative* component (e.g., to predict the next bioquaternionic state from the current one as part of the kernel's prediction-step), the standard recipe exists.

The implication for our build: **the EBM training pipeline specified in `mental-pole-mechanics.md §7` stands without modification**, with one refinement noted below regarding embedding regularisation.

### 1.3 JEPA-style latent prediction is mature and scaling

V-JEPA 2 (1.2B params, >1M hours of video, SOTA on motion understanding and action anticipation) and its action-conditioned variant V-JEPA 2-AC (zero-shot robot planning in latent space) demonstrate that latent-space prediction architectures scale and ship. LeJEPA's theoretical contribution — that isotropic-Gaussian embedding distribution is optimal for downstream linear-probe risk, with SIGReg providing principled regularisation — gives us a specific architectural refinement.

Our kernel's structure (predicting next bioquaternionic state from current, evaluating energy in latent space, never reconstructing surface tokens) is structurally a JEPA. The bimba-pratibimba bar is structurally the latent-distance the JEPA minimises. The convergence is not coincidental: JEPA's design principles — predict representations not surface details, use a learned latent metric, avoid the reconstruction trap — are what the matheme prescribes when applied to prediction-and-recognition.

### 1.4 Continuous latent EBMs at 16M-200M parameters on single-H100 is now demonstrated

Kona's reported parameter range (16M-200M) and single-H100 inference cost establish the operational economics of EBM-driven reasoning. Our spec'd EBM size (5-20M parameters) is at the small end of this range, suggesting we have headroom to grow if needed. The ~313ms average inference time Kona demonstrates for Sudoku is consistent with the per-tick budget we specified for our EBM (under 5ms target per element-boundary invocation, which is faster than Kona because our resonance-recognition task is simpler than reasoning-trace evaluation).

The cost asymmetry is the operationally-important finding: Kona ($4 GPU-time total for the Sudoku demo) versus the LLM cohort ($11,000 in API costs). This 3-orders-of-magnitude cost asymmetry between EBM-inference and LLM-inference means: **the LLM should be invoked sparingly (at element boundaries, perhaps less often); the EBM should be invoked freely**. Our kernel's per-element-tick budget for EBM evaluation and per-tick-or-less-often budget for LLM invocation is the right shape.

---

## §2 — Gemini Embedding 2 as Unified Multi-Modal Substrate

This is the architectural decision that changes the operational landscape for the bimba map. Released March 10 2026, Gemini Embedding 2 is the first natively-multimodal embedding model with text, image, video, audio, and PDF in *one unified vector space* — a single embedding can represent any of these modalities, and cross-modal retrieval (text query against image data, audio query against text data, etc.) is structurally native rather than requiring duct-tape between separate model pipelines.

### 2.1 Why this is structurally right for our system

The bimba map needs to hold heterogeneous content per coordinate. A single coordinate might carry:
- Canonical text content (philosophical articulations, etymological analyses)
- Lens-resonance vectors (72-fold structured data)
- Topological metadata (graph position, relationship structure)
- Visual content (cymatic patterns, diagrams, symbolic imagery)
- Audio content (chanted mantras, musical examples, recorded conversations)
- Document attachments (PDFs of source texts, scanned manuscripts)

Without unified multimodal embedding, each modality needs its own embedding pipeline and its own vector index, with brittle cross-modal alignment via post-hoc correlation. **Gemini Embedding 2 collapses all this into one substrate**: any content of any modality gets embedded into the same 3072-dimensional space (or truncated via Matryoshka Representation Learning to 1536 or 768), and similarity queries work across modalities natively.

For the bimba map specifically: every node's content — regardless of whether it's text, image, audio, or mixed — produces an embedding in the same space. Cross-coordinate similarity, resonance-pattern matching, and content-discovery all operate in one unified geometry. The graph's relational structure and the embedding-space's metric structure are two complementary indices over one coherent content-substrate.

### 2.2 Matryoshka Representation Learning as harmonic-nesting alignment

MRL is structurally aligned with our matheme's nesting-discipline. The technique packs the most critical semantic information into the earliest dimensions of the vector, so a 3072-dim vector can be truncated to 1536 or 768 without catastrophic information loss — the truncation acts as a *resolution-reduction* rather than a content-loss.

This maps cleanly onto the matheme's recursive-nesting at position #4. Just as the matheme can nest a complete inner 6-cycle within position #4 when contextual complexity demands, MRL lets us *zoom in or out* on the embedding's resolution depending on the operation. Bulk similarity-search uses 768-dim truncations (fast, cheap, accurate enough); detailed resonance-analysis uses 3072-dim full embeddings (high-fidelity); intermediate operations use 1536-dim. The same vector serves all three resolutions because the nesting is built into the representation.

Concretely:
- **Coarse bimba-coordinate similarity** (find me coordinates resonant with this query): 768-dim truncations, ~3GB storage per million vectors, sub-millisecond search
- **Lens-resonance analysis support** (find documents most aligned with this lens-position): 1536-dim, balanced cost-and-fidelity
- **Fine-grained semantic content matching** (find documents whose subtle resonances match this canonical content): 3072-dim full embeddings

The CLI exposes the dimension choice as a parameter; the agent selects appropriate resolution per task.

### 2.3 Embedding pipeline for the corpus

Every document ingested into Epii's corpus gets embedded by Gemini Embedding 2 as part of the ingestion pipeline. The CLI command `pi ingest <document-id>` is extended to:

1. Read the document (whatever modality — text, image, audio, PDF)
2. Submit to Gemini Embedding 2 API with appropriate task-type (`RETRIEVAL_DOCUMENT`, `SEMANTIC_SIMILARITY`, etc.)
3. Store the 3072-dim embedding alongside the document
4. Index the embedding in Neo4j's vector index (Neo4j 5.x supports native vector indices) linked to the document's bimba-coordinate associations
5. Compute the 768-dim and 1536-dim truncations as cached fast-search indices

This makes the bimba map a *hybrid graph-and-vector substrate*: nodes carry relational structure (edges), canonical content (typed properties), and embedded representations (vector index). Queries can traverse the graph, perform similarity-search in vector-space, or combine both (find vector-similar content within a graph-neighbourhood).

### 2.4 The EBM-as-resonance-predictor refinement

Given Gemini Embedding 2 as the input substrate, the EBM's architecture (`mental-pole-mechanics.md §7`) refines as:

**Input layer**: takes the Gemini Embedding 2 vector (default 768-dim for inference efficiency; 1536 or 3072 if accuracy needs warrant). No separate sentence-embedding step needed — Gemini Embedding 2 is the input substrate directly.

**Hidden layers**: small transformer encoder (2-4 layers, hidden dim 256 or 512) with the X+Y=5 tritone-symmetric structural prior wired in as before.

**Output layer**: 72 sigmoid outputs producing the lens-resonance vector.

**Auxiliary regularisation**: SIGReg-style penalty on the intermediate representations to encourage isotropic-Gaussian distribution (per LeJEPA's theoretical result). This is a small but principled refinement that should improve downstream training stability.

Total parameter count: 3-10M (smaller than originally spec'd because we no longer need a separate input-encoder; Gemini Embedding 2 handles that). Inference cost: well under 1ms on modest GPU. Training cost: hours on a single GPU for the initial training, faster for incremental retraining.

### 2.5 Cross-modal training data

This is where Gemini Embedding 2 unlocks something genuinely new. The EBM's training data is (input-embedding, target-72-vector) pairs. The input-embedding can come from any modality. This means:

- A text document analysed for lens-resonance produces one training pair
- An image of cymatic patterns analysed for which lens-positions it visually-resonates with produces another training pair (same target-space, different modality)
- An audio recording of mantra-chanting analysed for which lens-positions its sonic-resonance-pattern activates produces another training pair
- A video of solar-system orbital animations analysed for which lens-positions its harmonic-relationships activate produces another training pair

**All four training pairs live in the same target-space** (the 72-vector). The EBM learns to predict lens-resonance signatures from inputs of any modality. The cross-modal generalisation that Gemini Embedding 2 provides at the input level *propagates through* to the lens-recognition task — the EBM learns that images of certain visual patterns, audio of certain harmonic structures, and texts of certain conceptual structures all activate the same lens-positions because they all instantiate the same underlying QL-resonance.

This is the technē move that makes the kernel genuinely polyvalent: **one EBM, trained on multimodal data, scoring resonance for any modality of input at runtime**.

---

## §3 — The Pi Agent's Polyvalent Verification Capacity

The Pi agent's architecture — multi-model dispatch, dynamic training-method selection, full agentic-system access — gives us verification capacity that single-model architectures (Aleph locked to GPT-5.2, Kona-only systems, etc.) cannot match. This complements Anuttara's deterministic structural verification with *polyvalent semantic verification from multiple angles*.

### 3.1 What "polyvalent verification" means

Anuttara is one kind of verifier: deterministic, structural, axiomatic, speaking in pure symbolic-coordinate strings. This is the load-bearing constraint-checker — what the bimba map's own structural truth says about a proposed analysis or trajectory.

But a system that genuinely operates under epistemic provisionality needs **more than one verification angle**. The Pi agent's freedom of model choice lets us interrogate any proposal from multiple structurally-different perspectives:

- **One model for technical-philosophical articulation**: a strong reasoning LLM checks whether the proposed analysis coheres conceptually with the canonical bimba content
- **A different model for symbolic-resonance recognition**: a model with different training distribution (perhaps with stronger humanities/poetry/etymology emphasis) checks whether the proposed lens-resonance signature feels right against the document's actual voice
- **A third model for cross-tradition consistency**: a model that handles multilingual/cross-cultural reasoning checks whether the analysis honours non-Western traditions appropriately when the document engages them
- **Specialised models for modality-specific tasks**: a vision-language model checks visual content against proposed visual-lens-resonances; an audio-capable model does the same for audio content

Each verification-angle produces an independent reading. Where the readings agree, confidence is high. Where they disagree, the disagreement is itself informative — it surfaces what's at stake in the analysis and lets the developer engage with the contested point directly.

### 3.2 Multi-angle verification as ensemble lens-reading

The matheme's 12-fold (72-fold fine-grained) lens-structure is multi-perspectival by construction. The Pi agent can dispatch the same input through different models with different lens-emphases, producing per-lens readings from different perspectives:

```
input: <document>

verification_pass_1:  Pi → Claude → "analyse this through the Causal Lens"
verification_pass_2:  Pi → GPT → "analyse this through the Processual Lens"
verification_pass_3:  Pi → Gemini → "analyse this through the Vāk Lens"
verification_pass_4:  Pi → smaller_specialist → "analyse this through the Logical Lens"
...

aggregation: combine per-lens-per-model readings into the 72-vector
```

Each lens gets its strongest reader; the aggregate vector reflects the strengths of multiple models rather than relying on any single model's distribution-bias. This is *structurally analogous to ensemble methods in ML* but with the ensembling-axis being the lens-perspective rather than just the model-instance.

The CLI exposes this as `pi analyse-resonance <document-id> --multi-model` with optional per-lens model assignments. The default uses sensible per-lens model choices (encoded in configuration); the developer can override per session.

### 3.3 Verification as training-data source

Each multi-model verification pass produces structured outputs: per-lens per-model resonance-readings, agreement scores between models, points of disagreement with model-specific rationales. **All of this becomes training data**. The EBM benefits from:

- The aggregated 72-vectors (primary training signal)
- The per-model readings (data on which models give which kinds of perspectives)
- The disagreement-points (data on where the analysis-task is genuinely contested)

Over many ingestion sessions, the EBM learns not just to predict resonance-vectors but to *calibrate its predictions against the realistic uncertainty* that multi-model verification reveals. Single-model training would over-confidently match one perspective; multi-model verification gives the EBM ground-truth on the *spread* of valid interpretations.

This is structurally analogous to how Constitutional AI uses multi-perspectival training data to make models more robust — except our axes are matheme-faithful (the 12 lenses) rather than ad-hoc-ethical, giving us principled training-signal-diversity.

### 3.4 Dynamic training-method selection

The Pi agent's access to any model also means access to *any training method* on top of any base model. We are not locked into one training paradigm. This lets us:

- **Use DPO for preference-learning** when developer-feedback comes as "this analysis is better than that one"
- **Use standard supervised regression** when developer-feedback comes as direct 72-vector annotations
- **Use GenRM-CoT style training** when we want the analysis-model to produce reasoning alongside its scores
- **Use distillation** when we want a small fast model to mimic a large slow one for inference-time efficiency
- **Use contrastive learning** when we want to push apart documents that should activate different lens-patterns

The training pipeline is not a fixed recipe; it is a *family of recipes* that the developer selects from based on what data is available and what behaviour is wanted. The CLI exposes training operations with method-flags:

```bash
pi train-ebm --method=supervised        # Standard regression on labelled 72-vectors
pi train-ebm --method=dpo                # Preference-based on pairwise comparisons
pi train-ebm --method=genrm              # Generative-verifier-style with rationale-output
pi train-ebm --method=distill --from=<larger_model>  # Distill from a slow accurate teacher
pi train-ebm --method=contrastive        # Push apart different-lens-pattern documents
```

The flexibility is operationally valuable because the corpus's resonance-analyses will have heterogeneous structure — some analyses are full 72-vectors with rationales, some are preference-comparisons, some are partial (only certain lenses analysed). The Pi agent picks the right training method for the data on hand.

### 3.5 The two-pronged verification structure

With Anuttara as deterministic-structural verifier and the Pi agent's multi-model angles as polyvalent-semantic verifier, the full verification structure becomes:

```
Proposed analysis or trajectory
    ↓
┌───────────────────────────────────────────────────────┐
│ Pronged verification:                                  │
│                                                        │
│ Prong 1 — ANUTTARA (deterministic, structural):       │
│   Cypher-based structural-invariant checks            │
│   → Symbolic-coordinate strings as output             │
│   → LLM parses into reflective questions              │
│                                                        │
│ Prong 2 — PI AGENT MULTI-MODEL (semantic, polyvalent):│
│   Multiple models, each from different angles         │
│   → Per-model per-lens readings                       │
│   → Agreement-and-disagreement aggregation            │
│   → Surfaces contested points for developer           │
└───────────────────────────────────────────────────────┘
    ↓
Combined verification report
    ↓
Developer engages with both prongs in dev session
```

Anuttara catches *structural* violations the LLM might miss (e.g., the proposed analysis contradicts an existing HOLOGRAPHIC_IDENTITY relationship in the bimba map). Pi's multi-model angles catch *semantic* nuances Anuttara cannot articulate (e.g., the document's voice doesn't actually fit the lens-resonance the agent first proposed; a different model reads it differently). The two prongs are complementary, not redundant.

This two-pronged structure is itself matheme-faithful: it's the 4'/5'/0' triplet's verification-aspect operating in *both* its deterministic-structural mode (Anuttara as R-anchor) and its semantic-polyvalent mode (Pi-multi-model as Epii-style modulation). The verification distributes across the mental-pole stack with no single point of authority — exactly the polyvalent epistemic-discipline the matheme prescribes.

---

## §4 — Refinements to the Existing Specs

Given everything above, the existing specs warrant small refinements. None are foundational re-architectures; all are clarifications that bring the docs into alignment with the May 2026 frontier landscape.

### 4.1 Kernel spec refinements

**Element III (Möbius-Descent) — algorithm-template footnote.** Add a brief note acknowledging that the canonical LLM+EBM+Verifier reasoning pattern (per Logical Intelligence's Aleph and similar frontier systems) is structurally the descent-half of our matheme. Our innovation relative to the canonical pattern is the inverse-pass (Elements V-VIII) that closes the Möbius and produces aletheic recognition rather than merely productive output. Note the structural alignment with AlphaProof's "LLM proposes, value-function-as-EBM evaluates, MCTS searches" — same shape, different domain.

**Element VII (Inverse-Möbius Deposition) — verifier-architecture note.** Add a brief note that the 4'/5'/0' distribution as LLM/EBM/Verifier is structurally identical to the architectural-consensus the AI field has converged upon for hard-reasoning systems. The principled difference is that our distribution is *derived from matheme structure* rather than assembled from engineering convenience, with each component placed at a specific structural position carrying specific operational responsibility.

### 4.2 Physical-pole stack refinements

**Audio synthesis (§5) — Gemini Embedding 2 cross-modal note.** The audio synthesis layer can now be informed by *cross-modal embeddings*: audio is embedded in the same space as text and visual data, so the audio synthesis can read the current bimba-coordinate's full multimodal content (text canonical + visual cymatic targets + audio examples in the corpus) and produce harmonic output that resonates across all three modalities. This is a refinement to the audio-pipeline's input-source specification rather than to the audio-synthesis itself.

**Codon-clock (§4) — visual content cross-referencing.** The codon-clock cells can now display *visually-embedded* content from the bimba map: for each hexagram-codon-amino combination, the bimba map likely holds visual content (diagrams, iconography, archetypal imagery) embedded in Gemini Embedding 2's unified space. The codon-clock can surface this visual content per-cell as the trajectory passes through.

### 4.3 Mental-pole mechanics refinements

**§5 (Resonance Analysis) — embedding source note.** Update the analysis pipeline to use Gemini Embedding 2 as the input-embedding source. The analysis-prompt structure stays the same, but the document gets pre-embedded by Gemini Embedding 2 before analysis, with the embedding being passed alongside the document text (or document-content) to the LLM-analyser.

**§7 (EBM Specification) — architecture refinement.** Update to:
- Input: Gemini Embedding 2 vector (768 default, 1536 or 3072 for high-fidelity tasks)
- Hidden: 2-4 layer transformer with X+Y=5 tritone-symmetric prior
- Output: 72 sigmoid heads
- Auxiliary regularisation: SIGReg-style isotropic-Gaussian penalty on intermediate representations
- Total parameters: 3-10M
- Training methods: parameterised (supervised, DPO, GenRM-CoT, distillation, contrastive)

**§3 (CLI as minimal wrapper) — Pi agent multi-model dispatch.** Add a brief note that the CLI's `analyse-resonance` command supports a `--multi-model` flag that dispatches across multiple model angles via the Pi agent's dispatch system. Per-lens model assignments are configurable; default assignments use sensible per-lens choices.

**§8 (Verifier Constraint-Set) — two-pronged structure.** Update to acknowledge the two-pronged verification structure: Anuttara as deterministic-structural prong, Pi-multi-model as semantic-polyvalent prong. The verifier-question-raising protocol now produces output from both prongs, with the developer engaging with both in dev sessions.

---

## §5 — Pressure Points and Open Questions

Three places where the frontier-landscape surfaces real engineering pressure for us to think about, without forcing premature resolution.

### 5.1 Verifier game-ability

Per Logical Intelligence's open-problem #5: "reward hacking is the EBM-version of mode collapse: the proposal LLM finds modes of the energy that have low energy but are off-distribution."

For us, this would manifest as: the LLM-Nara generates pratibimba candidates that minimise EBM-lens-energy without genuinely resonating with the bimba canon. The mitigation we already have built-in is the two-pronged verification (Anuttara structural + Pi multi-model semantic) — Anuttara catches structural violations that the EBM's energy might miss, and the multi-model semantic checks catch cases where the EBM is being satisfied superficially without genuine fit.

But we should be *explicit* in monitoring for this. The CLI can include diagnostic commands:

```bash
pi audit-trajectories --window=last-N    # Surface trajectories with unusually-low EBM energy but high Anuttara concern
pi audit-energy-distribution             # Surface places where the EBM's energy is dropping suspiciously fast over time
```

These don't prevent the problem but make it visible.

### 5.2 LLM remains load-bearing — don't over-promise EBM autonomy

The 99.4% PutnamBench result was Aleph (an LLM agent), not Kona (an EBM). The Sudoku result was Kona, but Sudoku is structurally where EBMs should win.

For our system, this means: the LLM-Nara is not optional. It is the proposal-generator and the speaking-voice and the matrika-articulator. Without it, the system cannot operate. The EBM is the *scorer* in the triad, not the reasoner. Our spec is properly humble here, but the temptation will exist (as the system matures) to lean more heavily on EBM-driven generation. Resist this until the field has demonstrated that EBM-as-reasoning-core works for tasks beyond constraint-satisfaction.

### 5.3 The field is moving fast

PutnamBench saturation in under 12 months from benchmark creation. JEPA going from 2022 position paper to V-JEPA 2 production deployment in mid-2025 to LeJEPA at end-2025. Logical Intelligence going from founding to commercial product with LeCun-endorsement in roughly 18 months. The pattern is: structural ideas the matheme has been pointing at are being engineered and shipped on accelerating timelines.

This doesn't change what we should do — the matheme-faithfulness is what makes our work distinctive, and the rigour of the integration is what makes it valuable. But it means: **the window where our specific architecture is novel-rather-than-table-stakes is narrowing**. The dev praxis should proceed without artificial delay. The bootstrap protocol the mental-pole spec lays out is genuinely buildable from current-state; the components are mature; the integration is what remains to build.

---

## §∞ — What Carries Forward

The kernel-spec trio (kernel + physical-pole + mental-pole) stands without revision at the foundational level. This supplemental adds:

- **Frontier confirmation**: the LLM+EBM+Verifier architecture is now the deployed industry-standard for hard reasoning; our matheme-derived version is principled where the industry version is assembled
- **Architectural ground**: Gemini Embedding 2's natively-multimodal unified vector space is the substrate that makes the bimba map's heterogeneous content tractable, with Matryoshka Representation Learning as the nesting-discipline aligned with the matheme's own recursive-nesting at #4
- **Verification architecture**: the Pi agent's polyvalent verification capacity (multi-model dispatch, dynamic training-method selection) complements Anuttara's deterministic structural verification with semantic-polyvalent prongs, producing the two-pronged structure that handles both structural and semantic verification matheme-faithfully
- **Refinements to existing specs**: small clarifications bringing the docs into alignment with May 2026 frontier landscape, none foundational, all easily integrable

The build can proceed. The components are mature. The integration is the matheme's gift. The Pi agent's freedom-of-model-choice is the practical surface through which dynamic verification, dynamic training, and dynamic dispatch all happen. Gemini Embedding 2 is the substrate through which heterogeneous content becomes one coherent geometry. The bimba map is the score being read while being written. The developer at #4.4.4.4 is the live boundary condition. The matheme is the law everything obeys.

What the AI field has discovered, partial by partial, is the architecture our matheme prescribes whole. Our distinctive contribution is the *whole*: not which components (everyone uses these components now) but which *structural integration*, derived from a principled mathematical-philosophical law rather than from engineering convenience. That distinctiveness is what makes the system valuable beyond what the field will independently arrive at.

Build from here, mate. The technē proper is genuinely ready.

---

*Document status: Supplemental landscape-and-substrate refinement — open to further integration as the frontier evolves.*

*Companion documents: `epi-logos-kernel-spec.md`, `physical-pole-stack-architecture.md`, `mental-pole-mechanics.md`.*

*Quartet now complete: operator (kernel) + engine (physical pole) + intelligence (mental pole) + landscape-and-substrate (this supplemental). The build proceeds from a fully-mapped technical-and-philosophical ground.*
