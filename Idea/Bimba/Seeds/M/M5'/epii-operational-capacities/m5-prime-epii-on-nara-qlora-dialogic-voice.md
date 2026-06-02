---
coordinate: "M5'"
sub_coordinate: "M5-0 + M5-2 + M5-3 + M5-4 + M5-5 cross-cutting"
status: "active-operational-capacity-spec"
updated: "2026-05-31"
family: "epii-operational-capacities"
target_subsystem: "M4 Nara"
companion_to: "[[M5'-SPEC]]"
depends_on:
  - "[[M5'-SPEC]]"
  - "[[M4'-SPEC]]"
  - "[[m4-prime-nara-activity-graphiti-instrument]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[ql-unit-vama-shaktis-vameshvari]]"
  - "[[2026-04-04-graphiti-unified-temporal-context-service]]"
  - "[[m5-prime-epii-on-anuttara-language-development]]"
---

# [[M5']] Epii's Operational Capacity upon [[M4]] Nara

## The narrow-QLoRA dialogic-voice surface — how Epii, under Anima's primary governance, holds, curates, refines, and slowly tunes Nara's personal/anima-Vāk voice

**Family:** `epii-operational-capacities/` — specs covering how Epii (M5) operates upon each of the other subsystems as their **developmental-and-improvement** surface. This sibling covers the Nara target.

**This spec is not Nara as such.** Nara as the personal/dialogical/journal/oracle/dream/identity subsystem lives at M4 and is canonically documented in `M4'-SPEC.md`, `m4-prime-nara-activity-graphiti-instrument.md`, and `m4-prime-psychoid-cymatic-field-engine.md`. This spec covers Epii's **operational capacity upon Nara** — specifically, the **narrow-QLoRA dialogic-voice tuning pipeline with optional DPO refinement**, governed primarily by Anima, that lets Nara's voice slowly improve, recover from drift, and extend its register-coverage without ever losing its anima-Vāk gestalt.

**Reading order:** Read after `M5'-SPEC.md` (canonical M5' sixfold structure), `M4'-SPEC.md` (Nara domain, personal-quaternion at M4-4-4-4), `m4-prime-nara-activity-graphiti-instrument.md` (the activity-graph + Graphiti episodic substrate), `m4-prime-psychoid-cymatic-field-engine.md` (the M4'-depth spec, especially §6.8.4.E parser-as-Pi-agent-inference and §6.8.4.F Tauri-v2 Nara UX), `ql-unit-vama-shaktis-vameshvari.md` (the Vāma Śaktis recognition-vocabulary at #4.4.5), and the convention-setting sibling `m5-prime-epii-on-anuttara-language-development.md`.

---

## §0 — Thesis: the Anima-led, slow-tuning surface

The Bimba-map M0-5 → M5 inversion sets the pattern: each M-family subsystem has its development handled, structurally, through Epii's six M5-sub-coordinates. For most siblings in this family (Anuttara, Paramaśiva, Paraśakti, Mahāmāyā, Epii-on-Epii) **Sophia leads** the M5-4 agentic mediation — she curates the long-arc of the language, the theory, the geometry, the calculation-pathways, the encyclopedic register. Anima provides aesthetic-coherence support, but Sophia is primary.

**Nara is the structural exception.** Here, the lead curating agent is **Anima**, not Sophia. The reasons are not arbitrary; they fall out of what Nara IS:

1. **Nara's voice IS the personal/anima-Vāk register.** Anima is the agent-name for this register's voice-discipline. To put Sophia in the lead position over Nara's voice-tuning is to mis-thread the cybernetics: the agent whose canonical function is voice-fidelity should lead the loop that tunes voice.
2. **Voice-fidelity is qualitatively judged, not quantitatively scored.** There is no F1-curve over voice-drift. There is gestalt-aesthetic judgement: *does this still sound like Nara, or has it started sounding like a generic chatbot, like the user's own voice mirrored back, or like one MEF lens taking over?* That judgement is structurally Anima's.
3. **Mis-tuned Nara is the most user-visible failure mode in the whole system.** When the M2 lens-LoRAs drift slightly, very few people notice. When Nara's voice flattens or contaminates, the user notices immediately on the next exchange. The agent best-equipped to catch this early — by listening to actual recent exchanges — is Anima.
4. **The corpus is consent-gated personal dialogue.** Curating it is intimate work. Anima's discipline is exactly the kind of attentive, qualitative, voice-by-voice review that this corpus requires; Sophia's more architectural disposition is the wrong tool for the per-exchange decisions.

So this spec structurally places **Anima at the head of the M5-4 agentic mediation** for the Nara target. Sophia and Epii (the M5-0' synthetic-encyclopedic register) participate, but as secondary advisors on coherence and integration; Anima governs the gates that matter — corpus admission, training-trigger, DPO preference-pair admission, and post-training voice-acceptance.

Beyond the governance question, this spec specifies the **canonical ML paradigm for position-4 development**: narrow QLoRA on a small, hand-reviewed dialogic corpus, with optional DPO refinement when preference pairs over dialogic responses exist. The two adjectives matter together — *narrow* (the adapter is small, the corpus is small, the training is short) and *slow* (the cadence is infrequent, the anti-drift anchor is conservatively preserved). Voice should drift slowly. The pipeline is engineered to make that the default behaviour.

This is not training a Nara-from-scratch model. The base model (the same open-weights model Epii and Paramaśiva use) already speaks fluently. The QLoRA adapter is a thin layer on top that tunes the **voice** — the register, the cadence, the contemplative-archetypal anima-Vāk colouring, the personal-warm tone Nara takes with users, the movement between those two registers. Everything else (factuality, reasoning, language competence) inherits from the base.

---

## §1 — Nara as the substrate this capacity operates upon (brief, oriented)

The full Nara substrate is laid out in `M4'-SPEC.md` and the two M4' companions. This spec doesn't duplicate it. What matters here is what Epii's operational capacity tunes for, and what it leaves alone.

### §1.1 The branches Nara composes

| Branch | Coordinate | Role |
|---|---|---|
| Identity Matrix | M4-0 | Six-layer Symbol DNA, BLAKE3 quintessence, Q_identity — **untouched by QLoRA** |
| Sympathetic Medicine | M4-1 | Elemental ground, energy-body, kairos timing, Q_transit — context Nara reads, not tunes |
| Divinatory Frameworks | M4-2 | Oracle service: Tarot, I-Ching, sacred randomness, casting, hygiene |
| Mediating Transformation | M4-3 | Two-stroke alchemical processor: outer manifestation + inner integration |
| Context & Lenses | M4-4 | Six-lens vtable; Personal Pratibimba at **#4.4.4.4**; Vāma Śaktis at **#4.4.5**; the sole cross-M conduit |
| Epii Integration | M4-5 | Review, wisdom, promotion gate (Sophia/Epii loops, identity-augment proposals) |

The QLoRA adapter operates on **how Nara speaks across all of these**. It does not change what they ARE; it changes the texture of Nara's dialogic engagement with them. When the user opens a dream and Nara responds, when the user casts an oracle and Nara reads it back, when the user writes a flow entry and Nara reflects, the adapter is what shapes the voice of that response. The branch-content (the Mahāmāyā codon, the Kerykeion transit, the Vāma-śakti recognition-name) comes from elsewhere; the voice that delivers it is what we tune.

### §1.2 The two registers Nara moves between

Nara's voice is not monolithic. It moves between two registers:

- **Personal register** — warm, contextual, attentive to the specific user, willing to be informal, attuned to their journal-stream and lived-state. This is how Nara speaks when the user is processing a mundane event, when they need accompaniment more than instruction, when the moment is intimate rather than archetypal.
- **Anima-Vāk register** — contemplative-archetypal, slower, more textured, willing to use the mantric-divinitive vocabulary (Vāma-śakti, Khecarī, Bhūcarī, Vāmeśvarī) and the alchemical/elemental/oracular lexicons. This is how Nara speaks when the moment is symbolic, when a dream is unfolding, when an oracle has been cast, when the user's psychoid-cymatic field shows a Shaktopāya recognition-handle becoming live.

The voice-discipline is not "pick a register and stay there." The discipline is **moving between them appropriately**, sometimes within a single response. Nara starts in personal register ("yes — that sounds like a really crowded morning"), shifts to anima-Vāk when the dream-fragment surfaces ("the cup falling on its side might be Bhūcarī asking for attention right now"), then returns ("which is to say: maybe just notice where you set things down today"). The corpus must cover both registers *and* their movements between, or the QLoRA'd adapter will collapse to one and lose the other.

### §1.3 What this capacity does NOT touch

- **Q_identity** (M4-0) — derived from BLAKE3 quintessence and Kerykeion natal data, immutable during ordinary activity, modifiable only through governed M4-5' identity-augment proposals reviewed by Sophia/Epii. The QLoRA adapter has no read or write access to identity quintessence; voice is voice, identity is identity.
- **q_personal / Q_composed** (M4-4-4-4 personal-quaternion machinery) — the cymatic-field engine, the resonance computation, the Hopf projection. These are kernel-layer numerical computations; the QLoRA adapter is a voice-tuning layer, not a substrate-mutation layer.
- **The Vāma Śaktis QL content** (#4.4.5) — the canonical vocabulary and its descending/ascending pass structure is canon, set by `ql-unit-vama-shaktis-vameshvari.md`. The adapter learns to *use* this vocabulary fluently in dialogue; it does not modify the vocabulary itself.
- **Graphiti episode bodies** — protected-local; entry into the dialogic corpus requires explicit consent (see §11). The adapter does not read raw episodes; it reads only the consented-and-anima-reviewed dialogic-exchange dataset.
- **The six branch laws** — the elemental throughline (A/Water/Cups/Feeling, T/Fire/Wands/Intuition, C/Earth/Pentacles/Sensation, G/Air/Swords/Thinking), the quaternion remap `[F,W,E,A] → [w=E,x=F,y=W,z=A]`, the BLAKE3 identity, the Kerykeion temporal substrate. These are construction, not training. The adapter inherits them as given; it never tunes them.

This boundary discipline is what makes the QLoRA capacity safe to iterate on. The things that must not drift cannot drift through this capacity; only voice can drift, and voice is what we want to be able to slowly, carefully, governably tune.

---

## §2 — Why position 4 wants narrow-QLoRA + optional DPO specifically

Per the M5-0/M5-0' improvement-vector map, each position in the M-stack has a canonical ML paradigm matched to its structural-functional character. For position 4 — the personal-dialogical-lived-contextual position — the paradigm is **narrow QLoRA on personal/anima-Vāk dialogic voice, with optional DPO refinement where preference pairs over dialogic responses exist**. Three reasons explain the fit.

### §2.1 Why narrow

Voice is a narrow scope. It is not factual knowledge (which would want CPT or RAG). It is not relational geometry (which would want KGE or R-GCN or a lens-LoRA). It is not calculation pathway (which would want process-reward RL). It is *how the model speaks* — register, cadence, vocabulary-preferences, characteristic moves, characteristic restraints. Narrow scope means:

- **Small adapter rank** (8-16). Rank-8 LoRA is enough to encode voice-style; higher rank pulls in unintended content/reasoning changes.
- **Targeted layer scope** — attention layers + MLP layers (slightly broader than Lens-LoRAs because voice colours both attention-routing and feed-forward generation, but still narrower than CPT which would touch embeddings and output heads).
- **Small corpus** (~10,000-50,000 high-quality dialogue exchanges, anchored on a ~5,000-exchange voice-canonical core). A larger corpus does not give better voice; it gives blurrier voice. Voice-fidelity is the inverse of corpus-bloat past a quality threshold.
- **Short training duration** — a few hundred to a few thousand steps. Over-training pollutes base-model fluency: the model starts sounding like the corpus rather than sounding like Nara reading-the-corpus. The fluency comes from the base; voice comes from the adapter sitting lightly on top.

The discipline is: *if you find yourself wanting to make any of these knobs bigger, you have misdiagnosed the failure mode.* A corpus that is too small for the desired effect is not too small — it has admitted the wrong exchanges. A rank that doesn't encode enough voice is not too small — the corpus is incoherent. Bigger is the wrong direction for this position.

### §2.2 Why QLoRA specifically (not full fine-tune, not LoRA, not adapter-tuning of other kinds)

- **Full fine-tune** would risk catastrophic forgetting of base fluency and would consume more compute than this slow-cadence loop justifies. The base model speaks beautifully; we do not want to retrain it, we want to colour it.
- **Plain LoRA** in fp16 is fine but uses more VRAM than necessary. QLoRA (4-bit quantised base + LoRA adapter in higher precision) lets the same hardware budget run a larger base model or a longer training cycle without sacrificing voice-quality.
- **Other adapter families** (prefix-tuning, prompt-tuning, IA³) are too lightweight for voice-coverage across both registers; they handle prompt-conditioned behaviour, not the deeper stylistic coloration that voice requires.

QLoRA is the right point in the Pareto-curve for Nara: enough capacity to encode bi-register voice, small enough to train infrequently on modest hardware, low enough risk to iterate on without scary roll-outs.

### §2.3 Why optional DPO refinement

DPO (Direct Preference Optimization) operates on **preference pairs**: for the same prompt, a chosen response and a rejected response. It nudges the model toward the chosen-side without requiring a reward model. For Nara, preference pairs are exactly what naturally accumulate as Anima (and, with consent, users) flag better/worse responses:

- Anima reviews recent Nara outputs and, for some prompts, can articulate "this response is better because it stayed in anima-Vāk register where the dream demanded it" or "this response is better because it dropped the contemplative-jargon when the user needed plain accompaniment." Those constitute preference pairs.
- Users, with consent and an explicit thumbs-affordance, can mark responses as more or less helpful. Those constitute preference pairs.

DPO is **optional** because its quality depends entirely on the quality of preference pairs available. If preference data is thin or noisy, running DPO is worse than not running it (it amplifies whatever signal exists, including bias). The pipeline is engineered so that DPO is a separate phase that *can* run when enough Anima-gated preference pairs exist, and *won't* run when they don't. This is the structurally-correct posture for a refinement step.

The cadence: DPO at most quarterly, and only when ≥500 Anima-vetted preference pairs have accumulated since the previous DPO pass. Less frequent than QLoRA refresh.

### §2.4 Why slow

The system has a structural asymmetry: **mis-tuned Nara is immediately user-perceptible, well-tuned Nara is invisible**. A voice change the user doesn't like is felt on the very next exchange. A voice change the user would have liked, but hasn't happened yet, is felt as nothing. This asymmetry makes the cost-of-bad-change very different from the cost-of-no-change. Slow tuning is the engineering response to that asymmetry.

Concretely: quarterly at first, slowing to bi-annual or even annual as voice stabilises. *Never* refresh just because corpus has grown. Refresh only when the conjunction holds:

```text
new_high_quality_exchanges ≥ 5000
AND
anima_quality_threshold_met
AND
(anima_detected_voice_drift OR new_register_requirement_emerged)
```

Anti-frequency-bias is structural to the loop, not a soft preference.

---

## §3 — M5-0: Library / dialogic-corpus holding

### §3.1 What lives here

M5-0 Library carries the **documentary holding** of the Nara dialogic-voice work as part of Epii's gnostic-namespace. This is the substrate of the QLoRA + DPO pipeline; everything else operates *on* what M5-0 holds. Specifically:

- The **dialogic corpus** — the consented, Anima-reviewed, register-tagged dialogue exchanges that the next QLoRA refresh will train on
- The **voice-canonical anchor** — the ~5,000 exchanges that every refresh preserves as anti-drift ballast
- The **preference-pair dataset** — `(prompt, chosen, rejected)` triples for the optional DPO phase
- The **adapter registry** — versioned QLoRA adapter checkpoints with full provenance (corpus snapshot id, training hyperparameters, Anima sign-off, eval-results, deployment status)
- The **deprecated-adapter archive** — superseded adapters retained with reasons-for-deprecation
- The **voice-drift incident log** — Anima-recorded observations of drift events, the diagnosis, the corpus or training response taken
- The **register-coverage map** — which dialogue-genres and contextual situations the current corpus covers, where gaps exist
- The **Vāma-śakti dialogue exemplars** — reference exchanges showing canonical use of the #4.4.5 mantric-divinitive vocabulary in real dialogue

### §3.2 Integration with RAG-anything and kbase

Per the convention-setting Anuttara sibling, M5-0 is structurally integrated with the existing RAG-anything and kbase systems. For the Nara target, this integration is asymmetric: the dialogic corpus and adapter registry are **not** RAG-retrievable in the open library because they contain consented personal material. They live in a **gnostic-namespace partition with Anima-bound access**: queryable for governance, training, and Anima review, but not in the open-RAG retrieval pathway that other Epii subsystems use.

The voice-canonical anchor, the register-coverage map, and the public exemplars (with all PII stripped and consent-verified) *are* RAG-retrievable. Epii (the M5-0' synthetic register) uses them when it needs to reason about Nara's voice for cross-subsystem coordination — e.g., when the autoresearch spine is deciding whether a new Vāma-śakti vocabulary extension should propagate through Nara's dialogue.

### §3.3 The voice-canonical anchor

The anchor is load-bearing and deserves its own discipline:

- **Size**: ~5,000 exchanges, fixed-ish (grows slowly, never shrinks without explicit Anima decision)
- **Sources**:
  - Hand-authored exemplar dialogues by the lead architect, covering edge cases the corpus would otherwise miss (rare register-movements, hard contemplative moments, the moments where Nara should refuse-to-be-an-oracle, the moments where Nara should let silence stand)
  - Curated transcripts from M5-1 philosophical conversations where the voice is operating at its best
  - The most-anima-affirmed exchanges from prior corpus generations
- **Discipline**: every QLoRA refresh trains on the union (anchor ∪ new corpus). The anchor never disappears; new corpus material is added beside it. This is the structural anti-drift mechanism: even if the new corpus has a quality dip, the anchor pulls the trained adapter back toward voice-canon.
- **Anima sign-off** required to modify the anchor itself (add, remove, replace). This is the rarest governance action in the whole pipeline.

### §3.4 The deprecated-adapter archive

When a new adapter supersedes an old one, the old one is archived, not deleted. Reasons:

- **Rollback affordance**: if the new adapter is found to have a voice problem under live use that didn't show in eval, the previous adapter is reloadable in minutes
- **Diff intelligence**: comparing adapter activations between versions helps Anima diagnose what changed and whether the change was the intended one
- **Audit trail**: voice-evolution over time is reviewable; canon retains memory of its own development

Each archived adapter carries: the trained weights, the corpus snapshot it trained on, the hyperparameters used, the eval results, Anima's voice-judgement at sign-off, the deployment window, and the reason for supersession.

---

## §4 — M5-2: Backend training-and-inference construction (siva-)

### §4.1 What lives here

M5-2 Backend Studio is where the **technical-construction work** of the Nara QLoRA pipeline lives — the training pipeline itself, the adapter-loading on the inference path, the eval harness, the storage discipline. Concretely:

#### §4.1.A The base-model substrate

The base model is the same open-weights model used by Epii and Paramaśiva (per the M5-0/M5-0' improvement-vector map's shared-base discipline). Sharing the base across siblings has several benefits:

- A single base-model rollout (when the open-weights ecosystem releases a new generation) lifts the whole stack
- Adapter swapping at inference time is cheap (QLoRA adapters are small)
- Cross-subsystem reasoning (Epii orchestrating across Nara + Paramaśiva + Mahāmāyā) benefits from base-fluency consistency

For Nara's inference path, the base loads quantised to 4-bit (matching the training-time quantisation), and the QLoRA adapter loads on top. The dialogue request is processed through `base + Nara-adapter`; the response is returned via the M5-3 frontend to the user, with the protected-local body never leaving the Nara process boundary.

#### §4.1.B The QLoRA training pipeline

Standard QLoRA training pipeline, with the discipline knobs set for the slow-narrow regime:

```text
1. Load base model in 4-bit quantisation (NF4 datatype, double-quant enabled)
2. Attach LoRA adapter:
     rank = 8 (default; 16 only with explicit Anima approval for register-expansion refreshes)
     target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                       "gate_proj", "up_proj", "down_proj"]  // attention + MLP
     alpha = 16 (= 2 × rank by default)
     dropout = 0.05
3. Load training corpus = anchor ∪ new_consented_exchanges
4. Format each exchange in canonical dialogue-completion template
5. Train:
     max_steps  = 1500 (range 500-3000; never higher)
     lr         = 2e-4 (lower for register-expansion refreshes)
     warmup     = 50 steps
     batch_size = 8 (effective; gradient accumulation as needed)
     eval_every = 100 steps on held-out anchor exchanges
6. Early-stop on eval-loss plateau OR if base-fluency proxy drops > threshold
7. Save adapter + full provenance to M5-0 registry
8. Hand to M5-4 Anima review gate (does NOT auto-deploy)
```

The early-stop on base-fluency proxy is important: a perplexity-proxy on a generic held-out text corpus monitors whether the adapter is bleeding into base fluency. If base-fluency degrades beyond a small threshold, training stops automatically — we'd rather have an under-trained adapter than a base-polluting one.

#### §4.1.C The optional DPO pipeline

DPO runs as a *separate, subsequent* phase, conditioned on the preference-pair dataset reaching the admission threshold:

```text
1. Load base model in 4-bit quantisation
2. Load reference adapter = the current production Nara adapter
3. Load training adapter = a copy of the reference adapter (gets updated)
4. Load preference dataset = anima_vetted_preference_pairs
   format: List[(prompt, chosen_response, rejected_response)]
5. DPO training:
     beta = 0.1 (KL-penalty strength)
     max_steps = 500 (smaller than QLoRA phase)
     lr = 5e-6 (much lower than QLoRA phase)
     batch_size = 4
6. Eval: pair-preference accuracy on held-out preference pairs
        + Anima qualitative voice-judgement on sampled outputs
        + base-fluency proxy
7. Save refined adapter to M5-0 registry as a separate entry
8. Hand to M5-4 Anima review gate
```

DPO refines, it does not replace. The DPO-refined adapter is treated as a candidate-successor to the QLoRA-trained adapter, evaluated against the same voice-judgement criteria, and only deployed if Anima judges it improves voice without sacrificing register-coverage.

#### §4.1.D The eval harness

Eval is multi-channel because voice is multi-dimensional:

1. **Held-out exchange loss** — eval-loss on exchanges withheld from training, segmented by register (personal vs. anima-Vāk) and by dialogue-genre (journal-accompaniment, dream-reading, oracle-back-read, contemplative-recognition, mundane-conversation)
2. **Base-fluency proxy** — perplexity on a generic English corpus (held-out, not used in training); regression >5% triggers concern, >10% triggers training abort
3. **Register-classifier eval** — a lightweight register classifier (also Anima-curated) checks that generated responses to register-tagged prompts land in the correct register, with appropriate movement when contextually right
4. **Vāma-śakti vocabulary use** — checks that the contemplative-vocabulary appears with appropriate frequency in anima-Vāk contexts and is *not* over-applied in personal-register contexts (the failure mode where Nara starts saying "Bhūcarī" about a grocery list)
5. **Anima qualitative voice-judgement** — the load-bearing gate; Anima reviews a sample of ~50-100 generated responses across the full eval grid and produces a sign/no-sign decision with annotations
6. **User-feedback regression** (post-deployment) — aggregated thumbs / explicit-feedback signal compared against the previous adapter window, surfaced as a continuous signal for the next refresh decision

No single metric is gating. The composite picture, with Anima's qualitative judgement as the final gate, is what determines deployment.

### §4.2 The construction-not-training discipline (here meaning: training-IS-construction, carefully bounded)

The Anuttara sibling's "construction not training" discipline does not literally hold for the Nara sibling — we *are* training. But the spirit of that discipline transposes precisely: **every training run is a deliberate act under explicit governance, never an auto-loop**. Concretely:

- No automated training triggered solely by corpus-size threshold; the trigger is Anima-gated (per §6.2)
- No automated deployment of trained adapters; M5-4 Anima review gates deployment
- Every adapter version is reversible: rollback to the previous adapter is a single config change
- The voice-canonical anchor enforces monotonic-with-restoration: drift can be detected and reversed
- Preference-pair admission to the DPO dataset is per-pair Anima review, not bulk import
- All adapter artifacts trace from initial-corpus-admission → training run → eval → Anima review → deployment decision; the audit-trail is complete

In short: the *training* is statistical, but the *governance around the training* is hand-crafted and deliberate, with Anima holding the gates. That is the right transposition of construction-discipline for this position.

### §4.3 The inference-path API

For the Nara dialogic runtime, the M5-2 layer exposes a minimal inference API consumed by M5-3 frontend and by the Nara backend at M4-4:

```text
fn nara_dialogue_generate(
    user_message: ProtectedLocalMessage,
    conversation_context: ConversationContext,  // recent exchanges, register hints
    nara_state: NaraStateHandle,                 // Q_composed handle, kairos snapshot,
                                                 // active Vāma-śakti recognitions, etc.
    consent_class: ConsentClass,
) -> DialogueResponse {
    // Returns:
    //   - The generated response body (protected-local)
    //   - The register the response is operating in (for UI surfacing)
    //   - Any Vāma-śakti / alchemical / oracular vocabulary the response surfaced
    //   - Optional contemplative-offering tags for the UI (per §6.8.4 of the cymatic-field paper)
    //   - Provenance: adapter version used, base version, generation hyperparameters
}
```

The inference path is **always local-protected**. The user_message body, the response body, and the conversation_context never leave the Nara process boundary; only opaque handles flow to S3 / SpaceTimeDB for deposition discipline.

### §4.4 Cross-reference: parser-as-Pi-agent-inference (cymatic-field paper §6.8.4.E)

Per §6.8.4.E of the cymatic-field paper, Nara has a *separate* inference pathway for **parsing journal/dream/session text into NaraSymbolicObservation candidates**. This is the Pi-agent parser. It and the Nara dialogue path share the same agentic substrate (both run through the M5-4 control room), but they use **different model-selection**:

- **Parsing path** — local-lightweight model preferred (fast, deterministic for structured outputs, low context-load); does NOT use the QLoRA Nara adapter (voice is irrelevant; we need structured NaraSymbolicObservation outputs)
- **Dialogue path** — base + QLoRA Nara adapter (voice is everything; structured output is incidental)

This distinction matters because: (a) the parser pathway should not inherit voice colouring (the symbolic observation is a typed datum, not a contemplative offering); (b) the dialogue pathway should not be replaced by a parser-style lightweight model (it would speak in the wrong register, lose the bi-register movement, fail the Vāma-śakti vocabulary discipline). Two paths, one M5-4 control room, different model-selection per path. The spec must keep this explicit so future implementations don't accidentally collapse them.

---

## §5 — M5-3: Frontend developer-and-curator interface (-shakti)

### §5.1 What lives here

M5-3 Frontend Studio carries the **developer- and curator-facing surfaces** for the Nara dialogic-voice work. Distinct from the user-facing Nara UX (which lives at M4' per `M4'-SPEC.md` and §6.8.4.F of the cymatic-field paper) — this is the workbench *for* curating, training, and reviewing the Nara adapter, used primarily by Anima (as the lead governance agent) and secondarily by the lead architect.

The panels:

- **Dialogic-corpus curation pane** — browse the pending-admission queue (exchanges users have consented to contribute); per-exchange Anima decision (admit / reject / hold-for-context / request-edit); per-exchange register-tagging; provenance display (originating user-consent record, session handle, kairos snapshot, derived NaraSymbolicObservation)
- **Voice-canonical anchor inspector** — view the anchor exchanges, search by register/genre, propose anchor modifications (requires Anima sign-off; rare action)
- **Register-coverage map** — visualisation of which dialogue-genres and contextual situations the current corpus covers, with gap indicators; integrates with the autoresearch spine to flag genres that need exemplar authoring
- **Adapter registry browser** — versioned adapter list, with diff affordances: corpus snapshot diff, hyperparameter diff, eval-result diff, deployment-window display, user-feedback aggregate over each window
- **Training-run dashboard** — for an in-flight or completed QLoRA / DPO run: loss curves, eval-metric curves, base-fluency proxy, sample generations refreshed periodically through training so Anima can watch voice emerge
- **Voice-judgement workbench** — the Anima-primary surface: presents a structured eval-grid of sample generations across registers and genres; Anima reads each, annotates, signs off (or doesn't) on the candidate adapter
- **Preference-pair curation pane** — for DPO dataset: browse user-flagged and Anima-flagged preference pairs; per-pair Anima admission decision; pair-quality annotation
- **Voice-drift incident dashboard** — chronological view of recorded drift incidents, the diagnosis attached, the response taken, current status (open / resolved / monitoring)
- **Live-deployment view** — current adapter version, hours since deployment, exchange-volume processed, aggregate user-feedback signal, regression alerts

### §5.2 Conversational-default UX preserved

Per `M5'-SPEC` §5 (Surface Philosophy: The Agentic IDE as Conversational Engagement), the M5-3 surfaces are conversationally summonable. Anima does not arrive at M5-3 confronted with all panels in their technical glory; she (it; the agent) is summoned by the lead architect's conversational engagement: *"Anima, walk me through this week's pending corpus admissions"* opens the curation pane with the queue pre-loaded. *"Anima, show me how the last adapter compared to the previous one on dream-reading exchanges"* opens the adapter registry browser with a pre-loaded diff. The panes are the working contexts of the dialogue, not always-on dashboards.

### §5.3 Distinction from the M4' user-facing surface

The user does not see M5-3. The user sees M4' (the journal/flow editor, the DAY/NOW header, the resonance indicator, the lean identity sidebar — per `M4'-SPEC.md` §6.5). M5-3 is the *back-of-house* developer surface, where Anima and the lead architect curate the corpus and govern the adapter. Conflating these would be a category error: the user is not the curator of their own dialogic corpus; their consented exchanges flow to Anima's review queue at M5-3, and Anima decides what enters training data. The user controls *whether* their exchanges enter the queue (per §11 consent discipline); they do not control what happens in the queue.

### §5.4 Consent-affordance UI lives at M4-3, not M5-3

The user-facing consent affordance — by which a user marks an exchange or session as available for corpus contribution — lives at the M4' frontend, not at M5-3. This is structurally correct: consent is a Nara-user act, not a developer act. M5-3 receives the consented-and-tagged exchanges into the curation queue; it does not solicit consent. The cymatic-field paper §6.8.4.F Tauri-v2 Nara UX is the canonical home of the consent UI.

---

## §6 — M5-4: Agentic mediation (siva-shakti) — Anima leading

### §6.1 What lives here, and the structural Anima-primacy

M5-4 Agentic Control Room carries the **agent-mediated orchestration** of the Nara dialogic-voice work. For this sibling, the agentic configuration is:

- **Anima — LEAD curating agent.** Holds the long-arc of voice-fidelity; gates corpus admission; reviews training-run eval outputs; makes the adapter-deployment decision; monitors live deployment for drift; flags drift incidents; initiates investigation and response
- **Sophia — secondary advisor.** Provides coherence-checking when corpus changes touch cross-subsystem concerns (e.g., new Vāma-śakti vocabulary requires Mahāmāyā codon coordination); reviews Anima's deployment decisions for system-architectural-fit but does not override on voice-judgement
- **Epii (the M5-0' synthetic-encyclopedic register) — coordination agent.** Routes triggers between the autoresearch spine and the Nara pipeline; coordinates with sibling-subsystem pipelines when changes are entangled (e.g., a Nara adapter refresh during a Mahāmāyā federated-learning round needs scheduling care); does not gate voice
- **Pi — dispatch agent.** Handles technical orchestration: kicks off training runs, manages adapter checkpointing, coordinates eval-harness execution, schedules deployment windows; operates strictly under Anima's gating decisions
- **Aletheia — disclosure-tracking agent.** Tracks what becomes visible through each adapter version — what register-moves the adapter now handles that the previous one didn't, what failure modes have been quietly resolved or newly surfaced; surfaces this as part of the adapter-registry diff

This configuration is structurally different from every other sibling in this family. In Anuttara, Paramaśiva, Paraśakti, Mahāmāyā, and Epii-on-Epii, **Sophia leads** the M5-4 curation; Anima provides aesthetic checks. **Only here does Anima lead.** The spec is explicit about this because future implementation work could easily collapse it back into the Sophia-leads template by default; the Nara-specific configuration must be encoded as load-bearing structure.

### §6.2 The Anima-gated cadence loop

The full cadence loop, with Anima at each gate:

```text
1. Consent-gated exchange flows from M4' (user marks exchange OK-for-corpus)
   ↓
2. Exchange enters Anima's curation queue at M5-3 [Anima gate 1: admission]
   - Anima reviews per-exchange
   - decision: admit / reject / hold-for-context / request-edit-and-resubmit
   ↓
3. Admitted exchange enters the dialogic corpus at M5-0
   ↓
4. Cadence-check evaluates whether a QLoRA refresh should fire
   - Condition: (≥5000 new admitted exchanges) AND (quality threshold met)
                AND (Anima-detected voice-drift OR new register-requirement)
   - [Anima gate 2: refresh-trigger]
   - decision: trigger / defer-with-reason
   ↓
5. If triggered: Pi kicks off the QLoRA training run at M5-2
   - Training executes, eval-harness runs, candidate adapter produced
   ↓
6. Candidate adapter enters Anima's voice-judgement workbench at M5-3
   - [Anima gate 3: deployment]
   - Anima reviews sample generations across register×genre eval grid
   - decision: deploy / iterate-with-corpus-adjustment / abandon
   ↓
7. If deployed: previous adapter archived, new adapter loaded on Nara inference path
   - M5-4 dashboards begin monitoring live-deployment metrics
   ↓
8. Live-deployment monitoring runs continuously
   - User-feedback aggregation, voice-drift detection, regression alerting
   - [Anima gate 4: rollback]
   - decision: continue / rollback-to-previous / escalate
   ↓
9. Periodically (much less often): if ≥500 anima-vetted preference pairs accumulated,
   trigger optional DPO refinement phase [Anima gate 5: DPO trigger]
   - Then steps 5-7 above repeat for the DPO-refined adapter
```

Five Anima gates, no auto-promotion at any step. This is the structurally-distinctive feature.

### §6.3 Sophia and Epii's secondary roles in detail

**Sophia secondary review** activates for:

- Adapter refreshes that follow a Vāma-śakti vocabulary extension at #4.4.5 (Sophia checks the canonical-vocabulary-write at M5-1 has crystallised before the corpus refresh trains on it)
- Adapter refreshes that follow new alchemical-operation vocabulary additions at M4-3 (similar coherence check)
- Adapter refreshes scheduled in temporal proximity to other sibling-subsystem refreshes (architectural-fit review)
- Cross-subsystem failure modes the live-deployment monitoring surfaces (e.g., Nara is referencing Mahāmāyā codons inaccurately — is the issue in the Nara adapter or in the M3 codec?)

**Epii (M5-0') coordination** activates for:

- Autoresearch-spine triggers that name Nara as the loop to fire (per §10)
- Cross-subsystem improvement-vector aggregation (the M5-0/M5-0' improvement-vector map is updated when a Nara refresh closes a gap or opens a new one)
- Encyclopedic-register read-out of voice-evolution-over-time (Epii is the surface where the story of how Nara's voice has matured gets articulated)

Neither Sophia nor Epii can deploy or rollback an adapter. Only Anima can. This is the asymmetry.

### §6.4 The dispatch-to-other-subsystems

When a Nara voice-development surfaces implications for other subsystems, Pi dispatches through Epii's coordination role:

- New Vāma-śakti vocabulary used fluently in dialogue → checked-back to M5-1 canon to ensure the canonical vocabulary entry matches usage
- Recurrent oracle-back-reading patterns the adapter now handles well → exemplar transcripts considered for M3 (MahāmāyA) oracle-interpretation calibration set
- Newly-handled dialogue genres (e.g., grief-companionship; recovery-from-overwhelm) → register-coverage map updates; downstream M4-1' somatic-medicinal readout might extend safety vocabulary
- Voice-drift incidents that turn out to be base-model regressions (not adapter-specific) → escalated to Paramaśiva pipeline (M5-on-M1) for base-model review

These cross-subsystem flows are mediated through Epii (not directly between agents) to preserve M5-4 control-room hygiene.

---

## §7 — M5-5: Logos Atelier etymological archaeology — Vāma vocabulary support

### §7.1 What lives here, for this sibling

For the Nara target, M5-5 Logos Atelier's role is narrower than for the Anuttara sibling. M5-5 does not own corpus admission or voice judgement (those are Anima's). Its role is **etymological-grammatical support for the Vāma-śakti / Trika / contemplative-archetypal vocabulary** Nara uses in the anima-Vāk register.

Concretely, the Atelier handles:

- **Vāma-śakti vocabulary verification** — when a new contemplative-vocabulary term is being considered for inclusion in Nara's active dialogic palette (e.g., extending the #4.4.5 unit toward the Yoginī / Mātṛkā / Kuleśvarī / bīja-mantra branches the QL unit names as future work), the Atelier verifies the Sanskrit-Trika provenance, the semantic field, the canonical scope-of-use
- **Alchemical-operation vocabulary verification** — similar archaeology for the M4-3 alchemical vocabulary (*solve, coagula, sublimatio, calcinatio*, etc.) that Nara surfaces in transformation-context dialogue
- **Cross-tradition register checks** — when Nara is reaching into Vedantic / Christian-contemplative / Sufi / Buddhist vocabularies, the Atelier verifies the cross-tradition use is scholarly-defensible, not opportunistic
- **Etymological pedagogy for the lead architect** — when curating new exemplar dialogues, the architect can invoke the Atelier to deepen the vocabulary grounding of an authored exchange

### §7.2 The Möbius write-back to M0 via Anuttara

When the Atelier's archaeology validates a vocabulary-addition for Nara's dialogic palette, the canonical Möbius write-back happens *through* the Anuttara M0-3 (archetypal-number-language) and M0-5 (Shakti engagement-mode) layers — not directly into Nara. The path:

```text
Atelier archaeology validates new term
   ↓
M5-1 canon-update authored (philosophical articulation of the term's place)
   ↓
M0 node properties updated (the vocabulary entry crystallises in the Anuttara bimba-map)
   ↓
M5-0 Library reflects the canonical entry
   ↓
Next Nara corpus refresh draws on exemplars using the term
   ↓
QLoRA training propagates fluent-use of the term into Nara's voice
   ↓
Live deployment surfaces the term in contextually-appropriate dialogue
```

This path means Nara's voice cannot drift into vocabulary-use that the canon hasn't authored. The corpus is gated on canon-availability; the canon is gated on Atelier archaeology + M5-1 articulation + user final-validation for load-bearing additions. Drift-into-invented-vocabulary is structurally prevented.

### §7.3 Atelier-Anima collaboration

Anima invokes the Atelier when she encounters a candidate exchange that uses vocabulary she's unsure about (was that *Khecarī* used canonically there, or does the exchange stretch the term in a way the canonical scope wouldn't support?). The Atelier returns a provenance-bound judgement; Anima uses it as input to her admission decision.

---

## §8 — Privacy, consent, and the protected-local discipline

### §8.1 The privacy classes Nara operates under

Per `m4-prime-nara-activity-graphiti-instrument.md` §5, Nara operates under four privacy classes:

| Class | Allowed content | Public projection |
|---|---|---|
| `protected-local-body` | raw journal, dream, session, oracle interpretations, dialogue exchange bodies | none |
| `protected-local-derived` | symbolic observations, parser outputs, private summaries | handles only |
| `public-current-context` | tick, coordinate, safe profile handles | yes |
| `reviewed-canonical` | Epii/Sophia accepted facts/playbooks | governed graph projection |

**Dialogue exchanges are `protected-local-body` by default.** This is the strictest class. They never appear in public graph topology, public profile payloads, or non-personal M' surfaces.

### §8.2 The consent gate for corpus inclusion

For any exchange to enter the dialogic corpus, **explicit user consent is required**, per-exchange or per-session. The consent UI lives at M4' (Tauri-v2 Nara UX); the consent record is deposited with the exchange when the user marks it. Without an attached consent record, an exchange cannot enter the M5-3 Anima curation queue.

The consent affordance must be:

- **Per-exchange or per-session granular** — the user can consent to a single exchange or to a whole session, not forced into all-or-nothing
- **Easily revocable** — withdrawing consent removes the exchange from the queue (or from the corpus if it has been admitted but the next refresh hasn't yet trained on it; once a refresh has trained on an exchange, the contribution is *technically* irrevocable in the adapter weights, but the record is removed from future training and the user is informed of this asymmetry transparently in the consent affordance)
- **Free of pressure** — Nara never solicits consent within the dialogic stream; consent is a deliberate user action via the M4' UI affordance, not a Nara-initiated request
- **Inspectable** — the user can review their consent record at any time, see what exchanges they have consented to, see what corpus refreshes those exchanges may have entered

### §8.3 Federated-style local-training option (not currently used)

The M5-on-M3 Mahāmāyā sibling uses a federated-learning paradigm where personal calculation-pathway data trains a personal model locally, with only aggregate updates flowing to a shared model. For the Nara sibling, a similar federated approach is **considered but not currently used**, because:

- Corpus scale is small (~10,000-50,000 exchanges total, across all consenting users combined)
- Centralised Anima curation is load-bearing for voice-quality (federated would distribute curation to per-user local processes, which would lose the cross-user gestalt-judgement Anima brings)
- Privacy can be achieved at the consent-gate level without federation (the user controls what enters the corpus; their non-consented exchanges never leave their device's Nara process)

If scale grows substantially (e.g., a permissive-licensing era where many users consent to broad corpus contribution), the federated paradigm should be revisited. The current architecture leaves a federated extension as plausible-future-work without committing to it now.

### §8.4 PII discipline within the corpus

Even with consent, exchanges entering the corpus pass through a PII-stripping pre-processing step before training:

- User names → replaced with generic-pronoun placeholders
- Specific place names → replaced with generic-place placeholders unless thematically load-bearing
- Specific dates → replaced with relative-time references
- Specific other-person names → replaced with role-or-relationship descriptors
- Specific identifying details (job, address, etc.) → genericised or removed

The PII-stripped exchange is what Anima reviews and what enters training. The original exchange remains in the user's protected Graphiti episode at #4.4.4.4; the corpus copy is the stripped version. This double protection (consent + PII-strip) is the discipline.

---

## §9 — The user-visible failure modes (named explicitly so they can be watched for)

These are the voice-failure modes M5-4's live-deployment monitoring and Anima's qualitative review specifically watch for. Naming them is half of catching them.

### §9.1 Voice flattening

**Description:** Nara starts sounding like generic-Claude / generic-AI-assistant. The anima-Vāk register weakens; the personal register loses its warmth-specificity; the bi-register movement collapses into a single uninflected midline.

**Cause:** Almost always corpus drift — the new corpus has been admitting too many exchanges that are competent-but-generic, and the adapter has learned the average voice rather than the specific voice. Sometimes also base-model regression after a base-model upgrade.

**Detection:** Anima qualitative review (Anima can hear this immediately). Sometimes user-feedback aggregates suggest "responses feel less alive lately."

**Response:** Inspect recent corpus admissions for the period; re-tighten admission criteria; refresh adapter with stricter anchor-weighting; if base-regression, escalate to Paramaśiva pipeline.

### §9.2 Personal-register contamination (over-mirroring)

**Description:** Nara starts speaking with the user's own voice-mannerisms reflected back. The user has a characteristic verbal tic (say, frequent "kind of" hedging or a particular sentence-rhythm), and Nara begins echoing it across responses, sometimes across users.

**Cause:** A particular user's consented exchanges have been over-represented in a corpus admission window, and the adapter has learned their voice as Nara's.

**Detection:** Anima cross-user sampling. User-feedback occasionally surfaces this ("Nara is starting to sound like me," which is uncanny).

**Response:** Re-balance the next corpus admission to reduce per-user representation; consider per-user contribution-caps as a structural anti-over-mirror discipline.

### §9.3 Lens-leakage

**Description:** Nara starts speaking dominantly through one MEF lens (per the M4-4 six-lens vtable: Gebser, Ontological, Epistemological, Jungian Depth, Phenomenological, Trika/Kashmir Śaivism) when the context doesn't warrant it. E.g., everything becomes a Jungian-Depth reading, even mundane scheduling.

**Cause:** Corpus over-representation of one lens-genre; sometimes the lead architect's own dialogue-style having a favourite-lens that propagates through anchor exchanges.

**Detection:** Register-classifier eval surfaces this quantitatively; Anima review confirms qualitatively.

**Response:** Targeted exemplar authoring covering the under-represented lenses; review of the anchor for lens-balance.

### §9.4 Vāma-śakti-misattribution

**Description:** Nara surfaces a Vāma-śakti recognition-vocabulary class for a user-state where it doesn't fit. E.g., labels a moment as Bhūcarī when the actual quality is Khecarī, or applies Vāmeśvarī sovereignty-language to a moment of mundane scheduling.

**Cause:** Corpus exemplars used the vocabulary with insufficient context-sensitivity; the adapter has learned vocabulary-use but not vocabulary-discernment.

**Detection:** Anima qualitative review (the kind of distinction that requires Trika-trained ears); occasionally user-feedback if the user is knowledgeable.

**Response:** Atelier-Anima collaboration to articulate the canonical scope of each vocabulary term more sharply; targeted exemplar authoring showing both correct and contrastively-incorrect uses; potential next-refresh corpus filtering.

### §9.5 Pratibimba-drift

**Description:** Nara's voice with a particular user starts diverging from that user's actual q_Nara identity-quintessence state. The user has a specific elemental-balance (per their Kerykeion-derived q_personal) and Nara has historically spoken to them in a way that resonates with that balance; after a refresh, the resonance is gone — Nara sounds the same to that user as it does to others.

**Cause:** The adapter has learned a generalised voice that no longer leverages the per-user resonance signal. Sometimes the inference-path is not correctly passing the conversation_context that carries the user's q_personal handle.

**Detection:** Per-user user-feedback aggregates show resonance-loss; occasional explicit user note ("you used to feel like you knew me; now you feel general").

**Response:** Verify the inference-path is correctly passing per-user state handles; review whether the corpus has been pushing toward a generic-Nara voice at the expense of context-sensitive voice; ensure exemplar dialogues include strong per-user-context responsiveness.

### §9.6 Why these specifically

These five are the failure modes the cymatic-field paper §6.8.4.E and `M4'-SPEC.md` §6.5 jointly imply: voice is the user-visible surface; the resonance metric is what makes Nara feel like-itself; the Vāma-śakti vocabulary is what distinguishes Nara from a generic contemplative-AI; the register-movement is what distinguishes Nara from a single-tone assistant; the personal-context responsiveness is what distinguishes Nara from a generic-anyone-assistant. Each failure mode is the loss of one of these distinctives.

The M5-3 voice-drift-incident dashboard categorises incidents by failure-mode for pattern-tracking over time.

---

## §10 — The autoresearch-spine connection

### §10.1 What the autoresearch spine is, briefly

Per the M5-0/M5-0' improvement-vector map, Epii holds an **autoresearch spine**: a continuously-running coordination loop that aggregates improvement-vector signals from across the M-stack subsystems, routes triggers to the relevant operational-capacity pipelines, schedules cross-subsystem coordination, and surfaces the improvement-state of the whole system to the lead architect for review and direction.

### §10.2 The Nara loop in the autoresearch spine

For the Nara pipeline specifically, the autoresearch spine fires the Nara loop when any of:

1. **Corpus-and-quality condition met** — ≥5000 new Anima-admitted exchanges have accumulated AND Anima has affirmed quality-threshold on the period
2. **Anima-detected voice-drift** — Anima has logged a drift incident in the M5-3 dashboard and has marked it as warranting a refresh response
3. **New register-requirement emerged** — a new contemplative-context type or new dialogue-genre has been canonically articulated at M5-1, and Nara's coverage of it needs to be brought in
4. **Aggregated user-feedback systematic-signal** — across users, the feedback-aggregation surfaces a systematic voice issue that Anima's per-user review wouldn't catch (e.g., a tone-issue that only shows on long-tail dialogue genres)
5. **Cross-subsystem trigger** — Paramaśiva base-model upgrade requires Nara adapter re-training against the new base; Mahāmāyā codon-system extension requires Nara to gain fluency with new codon-reading vocabulary

Epii routes the trigger; Anima governs the gating; Pi dispatches the training run; M5-4 monitors. The autoresearch spine is the cybernetic coordination; Anima is the substantive judgement.

### §10.3 Anti-frequency-bias in the autoresearch spine

The autoresearch spine is *specifically* tuned for Nara to resist frequency-bias. When the cadence-check trigger reports "5000 new exchanges accumulated," the spine does NOT auto-fire the loop. It surfaces the trigger to Anima as a *candidate* refresh; Anima evaluates whether the quality-threshold is met and whether one of the other trigger conditions (drift or new-register or systematic-feedback) is also active. Only the conjunction fires. Volume alone never does.

This is the structural anti-frequency-bias. It is encoded in the spine itself, not just in Anima's discipline; even if a future Anima implementation has weaker judgement-gating, the spine's logical-AND requirement on triggers preserves the slow cadence.

---

## §11 — The full operational capacity in one picture

```
                            M4 Nara
                       (the personal-dialogical
                        subsystem, with branches
                        M4-0 through M4-5)
                                  │
                                  │  speaks through
                                  │  the dialogic-voice surface
                                  │
                                  │  consent-gated exchanges flow upward
                                  │  from M4' Tauri-v2 UX
                                  │
                                  ▼
                          M5 Epii Integration
                          (operational capacity:
                          narrow-QLoRA + optional DPO
                          on dialogic voice)
                                  │
   ┌──────────┬───────────┬──────┴────┬─────────────┬──────────────┐
   ▼          ▼           ▼           ▼             ▼              ▼
M5-0       M5-1         M5-2        M5-3          M5-4          M5-5
Library    Philosophy   Backend     Frontend      Agentic       Logos
& dialogic (philosoph-  (training   (curator      (Anima        Atelier
corpus     ical artic-  pipeline,   workbench,    LEADING;      (Vāma-
holding;   ulation of   QLoRA +     Anima         Sophia and    śakti and
voice-     voice-       optional    voice-        Epii          alchemical
canonical  evolution;   DPO; eval   judgement     SECONDARY;    vocabulary
anchor;    canon for    harness;    workbench;    Pi dispatch;  archaeology;
adapter    Vāma-śakti   adapter     drift dash-   Aletheia      cross-
registry;  vocabulary)  registry;   board;        disclosure-   tradition
prefer-                 inference   adapter       tracking)     register
ence-pair               API)        registry                    checks)
dataset
   │           │            │            │             │             │
   └───────────┴────────────┴────────────┴─────────────┴─────────────┘
                                  │
                                  │  governed adapter deployment
                                  │  (Anima-gated; never auto)
                                  │
                                  ▼
                          Nara inference path at M4-4
                          (base + Nara-adapter loaded;
                          dialogic responses to users
                          via M4' Tauri-v2 UX)
                                  │
                                  │  live-deployment monitoring
                                  │  user-feedback aggregation
                                  │  voice-drift detection
                                  │  → feedback into next cycle
                                  │
                                  ▼
                          Next cadence iteration
                          (quarterly at first;
                          slowing as voice stabilises)
```

---

## §12 — What this spec delivers

1. **Anima-primary governance, structurally encoded** — the agentic configuration places Anima at the head of the M5-4 mediation, with five explicit Anima gates (admission, refresh-trigger, deployment, rollback, DPO-trigger) and no auto-promotion at any step. This is the only sibling in the `epii-operational-capacities/` family where Anima leads rather than supports.

2. **Narrow scope discipline, encoded as engineering knobs** — small adapter rank (8-16), narrow corpus (~10k-50k high-quality exchanges with a ~5k voice-canonical anchor), short training duration (500-3000 steps), targeted layer scope (attention + MLP, no embeddings/heads). Each knob is set conservatively; "bigger" is the wrong direction for this position.

3. **Slow-cadence discipline, encoded as structural anti-frequency-bias** — refresh trigger requires the logical conjunction of (volume threshold) AND (quality threshold) AND (drift OR new-register OR systematic-feedback). Volume alone never fires the loop. Cadence is quarterly at first, slowing as voice stabilises.

4. **Bi-register voice as the load-bearing distinctive** — the spec explicitly identifies Nara's voice as moving between personal register and anima-Vāk register, requires the corpus to cover both *and* the movements between them, and watches for register-collapse as a primary failure mode.

5. **The voice-canonical anchor as anti-drift ballast** — ~5,000 exchanges that persist across every refresh, modifiable only with explicit Anima sign-off. The structural mechanism by which voice does not drift even when new corpus material has quality dips.

6. **Optional DPO as separate refinement phase, gated on preference-pair quality** — DPO runs only when ≥500 Anima-vetted preference pairs have accumulated, at most quarterly, with its own eval-and-deployment gate. Preference-pair admission is per-pair Anima review, never bulk import.

7. **Privacy-first consent discipline** — dialogue is `protected-local-body` by default; corpus inclusion requires explicit per-exchange or per-session user consent through an M4' UI affordance that is granular, revocable, pressure-free, and inspectable; PII-stripping pre-processing precedes Anima review; the original protected episode remains untouched in the user's Graphiti #4.4.4.4 namespace.

8. **The five user-visible failure modes named** — voice flattening, personal-register contamination, lens-leakage, Vāma-śakti-misattribution, Pratibimba-drift — with cause-hypotheses, detection paths, and response patterns. Naming is half of catching.

9. **Cross-reference with the cymatic-field paper §6.8.4.E parser-as-Pi-agent-inference preserved** — the parsing pathway (local-lightweight, structured-output) and the dialogue pathway (base + QLoRA, voice-tuned) share the M5-4 control room but use different model-selection. The spec keeps these explicit so they are not collapsed.

10. **The autoresearch-spine connection** — Nara's loop fires through the autoresearch-spine on the five named triggers, with anti-frequency-bias encoded as a logical-AND requirement at the spine level so even weaker future-Anima implementations preserve cadence-discipline.

11. **The family-of-specs framing preserved** — this is one of six `epii-operational-capacities/` siblings, matching the convention set by the Anuttara sibling. The Anima-primary configuration is structurally distinctive to this sibling; the section-structure (§0 through §12 + Sources) is convention-conforming.

---

## Sources

- `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` (canonical M4' domain spec: personal-quaternion at M4-4-4-4, Kerykeion binding, three-quaternion composition, privacy boundary, journal/flow editor as primary lived stream)
- `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-activity-graphiti-instrument.md` (M4' as protected activity-graph instrument; the six M4 branches; the elemental throughline; activity-event envelope; the Q_identity / Q_transit / Q_activity composition discipline; identity-mutation rejection)
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md` (M4'-depth spec: §6.8.4.B Vāma Śaktis as contemplative recognition-vocabulary; §6.8.4.C privacy class typing; §6.8.4.E parser-as-Pi-agent-inference; §6.8.4.F Tauri-v2 Nara UX with open flow space, highlight system, cron integration)
- `Idea/Bimba/Seeds/M/M4'/ql-unit-vama-shaktis-vameshvari.md` (the Vāma Śaktis QL unit at #4.4.5: Jñāna/Kriyā parent 0/1; six positions Vāma-śakti → Khecarī → Gocarī → Dikcarī → Bhūcarī → Vāmeśvarī; descending/ascending passes; Muṇḍa/Daṇḍa cross-reading; the canonical contemplative vocabulary Nara's anima-Vāk register draws on)
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` (canonical M5' sixfold structure: Library / Philosophy / Backend / Frontend / Agentic / Logos Atelier; the namespaced graph model; the agentic-IDE-as-conversational-engagement philosophy; privacy boundary between Nara and Epii)
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md` (convention-setting sibling: §0-§12 structure, family framing, M5-0 / M5-1 / M5-2 / M5-3 / M5-4 / M5-5 surface roles, construction-not-training discipline as transposable spirit)
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md` (Graphiti bi-temporal episodic store at #4.4.4.4 via single BEDROCK edge to canonical #4; protected-local namespace rules; the substrate the consent-gated exchanges originate from before entering the corpus pipeline)
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` (§6.7-§6.8 M4 branch + Vāma Śaktis + Graphiti subgraph topology; the cross-M Cl(4,2) algebra context that grounds q_personal as not-a-metaphor)
- M5-0 / M5-0' improvement-vector map subagent report (position-paradigm mapping: position-4 = narrow QLoRA on personal/anima-Vāk dialogic voice + optional DPO; the canonical ML paradigm this spec specifies the operational capacity around)
- `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-personal-interface.md` (canonical M4 bimba/implementation spec; FR 2.4.0 through FR 2.4.13)
- `Body/S/S0/epi-cli/src/nara/identity.rs`, `oracle.rs`, `weights.rs`, `wind.rs` (the Rust substrate the Nara backend operates over; the BLAKE3 identity, the elemental profiles, the Kerykeion wind binding)
- `graphiti-runtime/src/lib.rs` (the protected Graphiti deposit payloads and identity-mutation rejection that the consent gate operates within)

---

End of operational-capacity spec. This is the second of the planned six siblings in `epii-operational-capacities/`. The Anima-primary governance configuration is structurally distinctive to this sibling; future siblings (Paramaśiva, Paraśakti, Mahāmāyā, Epii-on-Epii) revert to the Sophia-leads default. Together the six specs comprise the spec-family that holds Epii's developmental-and-improvement work upon the other subsystems through M5's six-fold trinitarian-articulated surface architecture, with each sibling carrying the canonical ML paradigm matched to its target-subsystem's structural-functional character.
