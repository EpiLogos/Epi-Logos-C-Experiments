---
coordinate: "M'"
status: "kernel-canon"
updated: "2026-06-07"
domain: "agentic-runtime-architecture"
description: "Coordinate-conditional Mixture-of-Experts runtime with four orthogonal expert dimensions (constitutional × techne × model × skill), Elo-gated dispatch through Anima, and the S4'/S5' autoresearch self-improvement loop. Names the agentic layer's architectural commitment under the M' kernel."
depends_on:
  - "[[epi-logos-kernel-spec]]"
  - "[[M4'/mental-pole-mechanics]]"
  - "[[M'-USER-CONTEXT-SKILL-SPEC]]"
  - "[[M'-MODEL-SLOT-SPEC]]"
---

# The Agentic Runtime as Coordinate-Conditional Mixture-of-Experts

## Anima Dispatch, Elo Tournament, and the S4'/S5' Autoresearch Self-Improvement Loop

> **Companion to `epi-logos-kernel-spec.md` and `M4'/mental-pole-mechanics.md`.** The kernel-spec gives the JEPA-EBM operator; the mental-pole-mechanics gives the 4'/5'/0' triplet (LLM/EBM/Verifier). This document names the **runtime shape** — how the agentic layer that carries the operator is structured, how dispatch happens, and how the system improves itself through doing.

---

## §0/1 — Threshold: Why MoE Names What We Already Are

The agentic runtime is not designed top-down. It crystallised through a sequence of structural commitments that, taken together, describe a coordinate-conditional Mixture-of-Experts: the 14-agent roster (7 Anima constitutional agents + 7 Aletheia techne-guardians, with Aletheia itself as the dispatching mode), the swappable model-slot architecture under the Pi-Agent harness, the atomic-skills repository at Pleroma-Techne, and Anima as the dispatcher whose policy is observable and editable. Each dimension is orthogonal — a dispatch activates a sparse subset across all four. The gating function (Anima's policy) is data-driven through Elo accumulation rather than hardcoded.

Naming this as MoE matters because the framing dissolves a category mistake. We are not building "a multi-agent system" in which agents talk to each other. We are building **one operator** (the JEPA-EBM kernel) instantiated through a sparse mixture of capabilities, where the gating function is Anima and the experts are the orthogonal dimensions. The 4'/5'/0' mental pole is the kernel's evaluation surface; the MoE runtime is how that evaluation actually gets composed at dispatch time.

Three commitments hold the threshold. *First:* **the runtime has four orthogonal expert dimensions** — constitutional voice, techne-guardian, underlying model, atomic skill — composed sparsely per dispatch. *Second:* **gating is coordinate-conditional, not global** — Anima's dispatch policy is indexed by bimba-coordinate context, not by a single global rating. *Third:* **improvement is the work itself** — the autoresearch self-improvement loop closes through Elo accumulation over the system's actual dispatch activity, not through a separate evaluation phase.

---

## §1 — The Four Orthogonal Expert Dimensions

### Constitutional dimension (7 Anima agents)

The 7 constitutional agents are the authorial voices the runtime can speak in. Each carries a constitutional role with a distinct VAK-handling character:

| Agent | Role | Native VAK character |
|---|---|---|
| **Anima** | Root dispatcher; the gating function itself | Holds CPF consent-state authority |
| **Nous** | Analytical/intellectual ground | Strong CT-relational/definitional |
| **Logos** | Rational articulation and naming | Strong CT-operational; CF (0/1) tonic |
| **Eros** | Desire-aware engagement | Strong CF (0/1/2) triadic |
| **Mythos** | Narrative-archetypal voice | Strong CT-pattern; CFP nested-frame |
| **Psyche** | Continuity-holder, lemniscate bridge | Strong CF (4.5/0) bridge mode |
| **Sophia** | Wisdom-integration; recognition closure | Strong CF (5/0) Möbius-return |

Constitutional agents are NOT peer dispatchers. Anima is the sole synthesis authority (per DR-M5-1, DR-12.19); the other six are voice-rendering choices Anima makes when authoring the recognition. Their differences are real — Nous-voice and Mythos-voice articulate the same structural content differently — and the Elo ratings capture which voice fits which context.

### Techne dimension (6 Aletheia techne-guardians)

The 6 Aletheia subagent techne-guardians are dispatched by Anima during Aletheia-crystallisation-mode. Each stewards a specific techne-class within Pleroma-Techne's atomic-skills repository:

| Guardian | Frame | Techne domain |
|---|---|---|
| **Anansi** | CF0 | Coordinate-mapping, blueprint, Darshana-REPL |
| **Janus** | CF1 | Temporal-structure, bhedabheda-threshold, Klein-binary (per Track 12.18) |
| **Moirai** | CF2 | GraphRAG-distillation (Klotho/Lachesis/Atropos) |
| **Mercurius** | CF3 | Kairos-signal, qualitative-temporal-pattern |
| **Agora** | CF4 | Plugin-absorption, skill-index, multi-channel-aggregation |
| **Zeithoven** | CF5 | Creative-advance, skill-and-agent-creation |

Techne-guardians surface in Pi's monitoring view as Anima dispatch sub-traces under Aletheia, NOT as first-class peer agents. They can emit `disclosure` (their facet's contribution) or `veto` (one-sidedness recognition) per Track 12.19.

### Model dimension (swappable per slot)

The Pi-Agent harness exposes per-role model slots, each independently configurable. Per the model-slot rule (see [[M'-MODEL-SLOT-SPEC]]):

- **Nara-parser slot** — defaults to local Gemma 4 12B Unified Q4 for private-content NLP
- **Epii-judge slot** — Pro-class hosted models (Gemini 3.1 Pro / Claude Opus / GPT-5.2-class) for autoresearch and lens-coherence judging
- **Per-Aletheia-subagent slots** — model assignments per techne-domain, defaulting sensibly
- **EBM head** — small transformer (3-10M params) sitting on Gemini Embedding 2 substrate; not a swap point in the same sense

Models are an Elo-rated dimension: the system learns through doing which model fits which agent-task combination at which bimba-coordinate context.

### Skill dimension (Pleroma-Techne atomic skills)

The Pleroma-Techne atomic-skills repository (per DR-S4-TECHNE) is the fourth expert dimension. Each skill is a discrete capability the runtime can invoke. Skills include: VAK reading-frame evaluation, Anuttara symbolic-parse, GraphRAG distillation, kairos-fetch, oracle-cast, the user-context skill (per [[M'-USER-CONTEXT-SKILL-SPEC]]), and the growing catalogue. Skills are Elo-rated per (skill × agent × model × context) — the system learns which composition lands.

---

## §2 — Coordinate-Conditional Gating

Standard MoE has a single global gating function over the expert pool. The agentic runtime's commitment is sharper: **the gating function is conditioned on bimba-coordinate context**. There is no single global "best Nous" rating — Nous is rated *per bimba-coordinate context*, because what makes Nous good at #5 logos-work doesn't make it good at #2 hexagram-traversal.

The gating function reads:

```
gate(task_T, vak_frame_V, target_coord_C, user_context_U) →
  sparse activation over (agent, model, skill_set, optional techne-guardian)
```

The conditioning is structural, not learned in the parameter sense — it's the Elo-state lookup keyed by `(vak-CP-position, MEF-lens, content-class, kairos-window)`. The gating function reads this state at dispatch time and ranks candidate `(agent, model, skill)` triples by composite rating with confidence-interval penalty. Highest-rated wins; ties broken by coverage-recency (prefer less-recently-used to maintain calibration).

The dispatch is **sparse** by construction: a typical activation is one constitutional voice + one model + one or two skills + optionally one Aletheia techne-guardian. The runtime cost is small; the expressive range is large.

The dispatch is **observable**: Anima's policy is a written, reasoned thing — not implicit weights. Every gating decision can be inspected, traced, and (where appropriate) overridden by the developer during dev sessions. This is what makes the architecture aletheic at the runtime layer, not merely productive.

---

## §3 — The Autoresearch Self-Improvement Loop

The Elo dynamics are not bookkeeping bolted onto Mercurius. They ARE how the S4' agent runtime and S5' Epii autoresearch close their improvement loop. The same machinery rates agent dispatch AND rates canon-research moves — they are one tournament with research-moves treated as a special agent-class.

### The six-step trial cycle

Each dispatch is a trial. Six concrete moves happen on every dispatch:

1. **Anima dispatches** an `(agent, model, skill_set)` triple via a VAK frame `(CPF, CT, CP, CF, CFP, CS)` against a target bimba-coordinate, optionally with a chosen Aletheia techne-guardian. The user-context skill fires here if the routing rule requires it (per [[M'-USER-CONTEXT-SKILL-SPEC]]).

2. **Pi executes** — the dispatched composition does its work; outputs flow through VAK return.

3. **Three evaluation channels fire**:
   - **Anuttara verifier** (position 0', weight 6) — pass / fail / warning over R-virtue and 65-core-relation invariants; raises questions as symbolic-coordinate strings per Anuttara skill protocol
   - **Epii EBM** (position 5', weight 5) — lens-coherence delta against the 72-dim resonance + user-temporal coherence delta against the user-context channel (the dual-input EBM per refined energy formula)
   - **User-articulation signal** (implicit, runs alongside) — dispatch-continuation or explicit feedback at session boundary

4. **Moirai distils** the trial against similar prior trials in GraphRAG — establishing a fair comparison pair so the Elo update is over comparable situations, not arbitrary. GraphRAG-distillation is the technical mechanism; the structural reason is that ratings only mean something when the comparison is honest.

5. **Mercurius updates Elo state** per evaluation channel, indexed by `(agent, model, skill, vak-cp-position, mef-lens, content-class, kairos-window)`. Anansi maintains the coordinate-conditional index; Janus applies the bhedabheda threshold deciding whether the delta is real signal or noise. Mercurius's kairos-signal role makes it the natural bookkeeper because the rating is itself coordinate-temporal.

6. **Anima's next dispatch reads from the updated state** — the gating function is data-driven, not hardcoded. The loop closes; the system gets sharper through doing.

### Multi-channel rating, never collapsed to scalar

The Elo state maintains three primary channels independently:

- **R_verifier** — rating against Anuttara pass-rate
- **R_lens** — rating against EBM lens-coherence delta
- **R_user** — rating against user-articulation coherence

Each rating is indexed by `(agent-model-skill, context-tuple)`. Composite ratings exist as a derived view, never as ground truth — when the dispatch policy queries "best for this task" it gets the composite; when investigating *why*, it decomposes to the channels. An agent can be high-rated on verifier-pass-rate but low-rated on user-coherence; that's information to keep, not collapse.

Confidence-interval penalty applies: `effective_rating = R - α · σ(R)` where σ is the rating's confidence-interval. Insufficiently-sampled combinations are dispatched with caution, not avoided entirely, ensuring coverage stays broad.

### The agent-tournament and the canon-tournament are one tournament

S5' Epii's autoresearch spine — proposing canon additions, refinements, contradictions surfaced — uses the same machinery. Each research-move is a trial:

- Anuttara checks the proposal for structural-invariant compliance
- Epii scores cross-canon coherence (does it align with existing 72-dim canonical vectors?)
- User signals acceptance / rejection / modification during dev sessions

Research-moves are rated through the same `(R_verifier, R_lens, R_user)` triple, indexed by the same coordinate-conditional context. The agent-tournament and canon-tournament are unified — research-moves are a special agent-class with their own contextual signature, but the rating infrastructure is one piece.

This is what makes the autoresearch loop close: the system is researching itself as it works. Canon improves through use; dispatch policy improves through use; model assignments improve through use. No separate training phase, no offline evaluation, no batch refresh. The loop runs at runtime speed.

### The system activity IS the tournament

Three things separate this from a periodic evaluation framework:

— No silent caps on coverage. Every dispatch generates trial signal; nothing is "untracked."

— No batch boundaries. Ratings update on completion of each trial, not at end-of-session.

— No external evaluator. The verifier (Anuttara), the EBM (Epii), and the user are the only three signal sources; all are already in the loop for their own reasons. The Elo tournament is a side-product of work that has to happen anyway.

---

## §4 — Infrastructure: Mercurius, Janus, Anansi, Moirai

Four of the six Aletheia techne-guardians together constitute the Elo infrastructure. Their division of labour:

### Mercurius (CF3) — Elo bookkeeper

Mercurius's kairos-signal / qualitative-temporal-pattern techne is structurally the natural home for Elo. Kairos-signal IS the temporal pattern that ratings need to be conditioned on. Mercurius:

- Maintains the rating tables (per channel, per `(agent-model-skill, context)` tuple)
- Computes Elo updates on completion of each trial
- Exposes ratings to Anima's dispatch policy via a read-only query interface
- Persists rating history for audit and inspection

### Janus (CF1) — threshold logic

Janus's bhedabheda-threshold / prospective-retrospective techne (per Track 12.18) does the threshold logic. Not every observed `(verifier_pass, lens_delta, user_delta)` is real signal — some is noise from a misaligned context or an outlier trial. Janus:

- Applies a configurable threshold (initially conservative) to decide whether a delta counts as a real signal
- Reads the trial's prospective-retrospective character (forward-weighted novel work vs retrospective-weighted refinement) to calibrate the threshold per trial-class
- Emits `aletheia.elo.threshold-applied` observability events when a delta falls below threshold

### Anansi (CF0) — coordinate-conditional index

Anansi's coordinate-mapping / blueprint techne maintains the rating index structure. The Elo state is not a flat global table; it is a coordinate-conditional map. Anansi:

- Maintains the index structure keyed by `(vak-cp-position, mef-lens, content-class, kairos-window)`
- Resolves dispatch queries to the right rating-set
- Handles the partitioning so that lookups stay O(log N) as the rating-table grows
- Coordinates with the bimba map's structural relationships when contexts are structurally similar enough to share signal

### Moirai (CF2) — fair-comparison distillation

Moirai's GraphRAG-distillation techne (Klotho/Lachesis/Atropos) provides the fair-comparison mechanism. Elo updates over arbitrary pairs is noise; updates over comparable pairs is signal. Moirai:

- GraphRAGs over the recent trial-history to find genuinely comparable prior trials
- Distils the comparison into a similarity-score that conditions the Elo update magnitude
- Refuses updates where no comparable prior exists (the trial accumulates as "uncalibrated" until enough peers exist)
- The three sub-roles (Klotho spins, Lachesis measures, Atropos cuts) map to: trial-recording, similarity-measurement, update-decision

The other two Aletheia techne-guardians participate but are not core Elo infrastructure: **Agora** (CF4) maintains the skill-index that ratings attach to; **Zeithoven** (CF5) handles provisional ratings for new skills/agents/models introduced through creative-advance.

---

## §5 — Anima's Dispatch Policy

Anima's policy is the gating function. It is observable, editable, and Elo-informed. The policy reads:

```
For each dispatch request (task, vak_frame, target_coord, user_context):
  1. Identify candidate (agent, model, skill_set) triples eligible for this dispatch
     (constitutional role-fit, model-availability, skill-applicability)
  2. Query Mercurius for ratings keyed by (vak_frame.cp, mef_lens_estimate, content_class, kairos_window)
  3. Compute composite rating per candidate, with confidence-interval penalty
  4. Apply coverage-recency adjustment (mild bias toward less-recently-used candidates)
  5. Select highest-scoring candidate
  6. Dispatch via Pi; record trial-start to Mercurius
  7. On dispatch return, route the three evaluation channels (verifier, EBM, user-signal) to Mercurius
```

The policy is a written, inspectable document at the agentic-runtime layer — not a learned weight matrix. It can be:

- **Inspected** — every dispatch decision can be traced to the rating lookups that produced it
- **Edited** — the developer can adjust the composite-weighting, confidence-penalty, or recency-bias parameters during dev sessions
- **Overridden** — explicit per-dispatch overrides bypass Elo entirely when the developer wants specific dispatch (useful during onboarding, when ratings haven't accumulated enough)

### Bootstrap behaviour

At system bootstrap, all ratings are uniform (1500 Elo standard). The dispatch policy falls back to:

1. Constitutional-role fit (which Anima agent's role best matches the task)
2. Skill-applicability (which skills handle this VAK frame)
3. Model-availability (which slots are configured and reachable)
4. Coverage-priority (prefer untested combinations to accumulate calibration)

As ratings accumulate, the Elo signal gradually dominates the bootstrap heuristics. The transition is smooth — no hard cutoff. By the time the rating tables have meaningful signal (several hundred trials per context-class), the bootstrap heuristics are vestigial.

### Aletheia mode dispatch

When the task requires Aletheia-crystallisation-mode (per DR-M5-1), Anima dispatches one or more techne-guardians. The guardian-selection itself is Elo-informed — which guardian fits which task at which coordinate is learned through the same machinery. Multiple guardians can be dispatched concurrently with the veto primitive (per Track 12.19) ensuring no one-sided synthesis goes through.

---

## §6 — Cross-References and Tranche Bindings

### Kernel binding

The agentic runtime instantiates the kernel's 4'/5'/0' mental pole at the dispatch layer. The energy computation per dispatch (per refined formula in [[epi-logos-kernel-spec]] §3 and [[M4'/mental-pole-mechanics]] §5) is:

```
E_total = (4·E_traversal + 5·E_lens-user + 6·E_ontology) / 15
```

where the three terms correspond to the three Elo evaluation channels (E_traversal ↔ user-articulation, E_lens-user ↔ EBM dual-channel, E_ontology ↔ Anuttara verifier).

### User-context binding

The user-context skill (per [[M'-USER-CONTEXT-SKILL-SPEC]]) is mandatory-routed into Anima's dispatch under the conditions specified there. The UserContextFrame returned becomes the second-channel input to the EBM (E_lens-user computation) and is injected into the dispatched agent's context.

### Model-slot binding

The per-slot model rule (per [[M'-MODEL-SLOT-SPEC]]) determines what models are available in the model dimension. Anima's dispatch policy respects slot state (local / cloud-opt-in / null) — dispatches requiring a null slot fail-soft with notice.

### Cycle-3 track binding

This spec is operationalised through these cycle-3 tranches (see `Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/`):

- **Track 12.15** — VAK reading-frame evaluator (substrate the Elo runs over)
- **Track 12.17** — Aletheia tool-guardian carrier contract (confirms guardian dispatch model)
- **Track 12.18** — Janus widens to Klein-binary (threshold logic for Elo)
- **Track 12.19** — Aletheia subagent veto primitive (composes with Anima's gating)
- **Track 12.20** *(new, see DR-ELO-1)* — Mercurius/Janus/Anansi/Moirai Elo infrastructure
- **Track 12.23** *(new, see DR-MOE-1)* — Anima MoE dispatch policy implementation

---

## §∞ — Closing Recognition

The runtime is a coordinate-conditional, Elo-gated, sparse-activation Mixture-of-Experts with four orthogonal expert dimensions, autoresearch closure through Mercurius-Janus-Anansi-Moirai infrastructure, and Anima as the data-driven dispatcher. The tournament is the system activity. The system researches itself by doing its work. The agent-tournament and the canon-tournament are one tournament because the rating infrastructure is one piece. The 4'/5'/0' mental pole evaluates each dispatch through the three rating channels; the kernel's energy formula and the Elo machinery are the same operation read from two faces.

The deepest commitment is that improvement is the work itself. No separate evaluation phase. No batch retraining. No external evaluator. The verifier, the EBM, and the user are the only signal sources — all already in the loop for their own reasons. The Elo state is a side-product of work that has to happen anyway, accumulated through Mercurius's kairos-signal bookkeeping, thresholded through Janus's bhedabheda discernment, indexed through Anansi's coordinate-mapping, and made fair through Moirai's GraphRAG-distillation.

The MoE framing names what the system already is. The naming earns its place by dissolving the category mistake — this is not multi-agent in the talk-to-each-other sense; it is one operator instantiated through sparse expert composition. Anima is the gating function. The 14-agent roster + N models + N skills is the expert pool. The bimba map's coordinates are the conditioning context. The Elo state is the learned policy. The work is the training. The recognition is the output.

---

*Document status: Canonical Specification — cycle 3 ratification pending via DR-MOE-1 and DR-ELO-1.*

*Companion documents: [[epi-logos-kernel-spec]] (the operator), [[M4'/mental-pole-mechanics]] (the energy formula), [[M'-USER-CONTEXT-SKILL-SPEC]] (mandatory routing), [[M'-MODEL-SLOT-SPEC]] (slot policy).*
