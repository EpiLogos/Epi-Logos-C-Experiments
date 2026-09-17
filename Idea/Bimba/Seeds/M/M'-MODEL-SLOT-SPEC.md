---
coordinate: "M'"
status: "kernel-canon"
updated: "2026-06-07"
domain: "model-slot-policy"
description: "Per-role model-slot rule for the Pi-Agent harness. Three slot states (local-default / cloud-opt-in / null) per slot, with explicit privacy semantics. Names Gemma 4 12B Unified as the Nara-parser default and frames Pro-class hosted models as the autoresearch/judge-loop pool."
depends_on:
  - "[[epi-logos-kernel-spec]]"
  - "[[M'-AGENTIC-RUNTIME-SPEC]]"
  - "[[M4'/mental-pole-mechanics]]"
---

# The Model-Slot Rule

## Per-Role Model Configuration Under the Pi-Agent Harness

> **Companion to [[M'-AGENTIC-RUNTIME-SPEC]].** The agentic runtime treats "model" as one of four orthogonal expert dimensions in the coordinate-conditional MoE. This document specifies the per-role slot policy: how models are assigned per role, the three valid slot states, and the privacy semantics each state enforces.

---

## §0/1 — Threshold: Model Is a Slot, Not a System Commitment

The Pi-Agent harness is unified — there is one harness, one dispatch protocol, one observable runtime. But "the LLM" is not a single thing inside that harness. Different roles in the agentic runtime use different model classes for structural reasons:

— **Nara-parser** handles private content (journals, dreams) where local execution is non-negotiable for privacy.

— **Epii-judge** handles autoresearch over the corpus, alphaproof-style judge loops, and lens-coherence evaluation over vector-only data — where Pro-class capability is structurally required and the data has already been derived to vectors so hosted execution is safe.

— **Per-Aletheia-subagent** handles techne-specific work where model choice is per-domain (Anansi's coordinate-mapping is light; Moirai's GraphRAG-distillation wants stronger reasoning; Zeithoven's creative-advance wants Claude-class).

The right design move is to treat model as a **per-role slot** with explicit policy, rather than committing the whole system to one model. This document specifies the slot rule.

---

## §1 — The Three Slot States

Each role-slot has exactly three valid states. The state is configured per-slot in `~/.epi-logos/config.toml` and read by Anima's dispatch policy at dispatch time.

### Local-default (privacy-first)

The slot resolves to a local model running on-device. No content the slot receives ever leaves the device.

- **Nara-parser slot default**: Gemma 4 12B Unified Q4 via Ollama/llama.cpp (MLX once stable on Apple Silicon)
- **Smaller slots' default**: model per slot-requirement, typically 4B-class for lighter tasks, 7B-12B for medium

Privacy semantics: structural commitment. Content entering this slot is guaranteed local. Anuttara verifier refuses dispatches that would cross this commitment.

### Cloud-opt-in (explicit-consent-per-dispatch-class)

The slot resolves to a hosted model. The user has explicitly enabled cloud routing for this slot for the dispatch class in question.

- **Epii-judge slot default**: Pro-class hosted models (Gemini 3.1 Pro / Claude Opus / GPT-5.2-class), enabled by default because the input is vector-only derived signal, not raw content
- **Other slots**: cloud-opt-in requires per-slot, per-dispatch-class explicit consent through a config-level UI gate

Privacy semantics: the consent boundary is explicit. The UI gate makes the "data-leaves-device" boundary visible at opt-in time. The slot config records:

```toml
[slot.epii_judge]
state = "cloud-opt-in"
provider = "anthropic"
model = "claude-opus-4-7"
consent_scope = "vector-only-derived-signal"
consented_at = "2026-06-07T..."
```

Anuttara verifier refuses dispatches whose content class is broader than the consent scope.

### Null (no model assigned)

The slot is empty. Dispatches requiring this slot fail-soft with notice.

- **Use case**: the user has explicitly disabled the role (e.g., "I don't want Nara-parsing of dream content this session") OR the slot is unconfigured during bootstrap OR the local model is unavailable due to resource constraints

Privacy semantics: maximal — no model means no inference path. The fail-soft notice surfaces to the dispatched agent's articulation: "Nara-parser unavailable, dream-content cannot be processed for archetypal tagging this session." The user knows what they're giving up.

---

## §2 — The Nara-Parser Slot

The Nara-parser slot is the most privacy-sensitive in the system. It handles raw user content — journals, dreams, personal narrative, anything the user submits to Nara for parsing. The slot's default configuration:

```toml
[slot.nara_parser]
state = "local-default"
provider = "ollama"
model = "gemma3:12b-q4_K_M"  # Gemma 4 12B Unified Q4 once Ollama tag stabilises
context_window = 32768  # comfortable for journal-length input
fallback = "null"  # if local unavailable, fail-soft rather than falling through to cloud
```

The `fallback = "null"` is structural commitment. The slot does not silently degrade to cloud routing if the local model is unavailable — that would violate the privacy boundary the slot exists to enforce. If the user wants cloud-opt-in for Nara-parsing, they must configure it explicitly as a separate consent action.

### Why Gemma 4 12B Unified

Gemma 4 12B Unified (Google DeepMind, June 2026) is the right default for this slot because:

- **Encoder-free multimodal** — vision/audio patches project directly into LLM embedding space, no separate SigLIP encoder. Native audio in matters for dream-voice capture and journal voice notes.
- **256K context** — comfortable for long journal entries, multi-day dream sequences, accumulated personal narrative.
- **6.7 GB at Q4** — fits comfortably on a 16 GB Mac, leaving headroom for the agent runtime and the EBM head.
- **Strong structured-output and function-calling** — Nara-parser produces archetypal tags, dream-element classifications, mood signatures. Reliable JSON output is structurally required.
- **Apache 2.0 license** — no commercial-use friction, no rate limits, no API key dependency.

Alternative defaults per machine class:

- **24-32 GB Mac**: Gemma 4 12B Unified at Q5 or Q8 for higher fidelity
- **16 GB Mac with other load**: Gemma 4 E4B (4.5B effective) as compact fallback
- **Linux with discrete GPU**: full-precision Gemma 4 12B or step up to 26B A4B MoE

### Cloud-opt-in path for Nara-parser

If the user explicitly opts in to cloud routing for Nara-parsing, the consent is recorded with full scope:

```toml
[slot.nara_parser]
state = "cloud-opt-in"
provider = "anthropic"  # or "openai", "google"
model = "claude-opus-4-7"
consent_scope = "raw-content-journal-dream"  # broadest scope
consented_at = "..."
warning_acknowledged = "user-aware-that-content-leaves-device"
```

The `warning_acknowledged` field requires explicit user action to set. The UI gate spells out the privacy implication: "Enabling cloud routing for Nara-parser means your journal entries and dream content will be sent to {provider}. This trades local privacy for higher-quality parsing. Type 'I understand' to confirm." The frictional surface is intentional.

### Parametric knowledge carriage — canon-in-weights, content-in-context (per DR-PARAM-1)

Because the Nara-parser slot runs **locally** (llama.cpp/MLX, where the KV cache is under our control), stable canonical facts may be carried as **parameter-space micro-experts** rather than re-injected as retrieved text every turn. This is DMOA-style parametric knowledge injection (Decoupled Mixture of Experts), bounded to the **stable-canonical-leaf class** and made matheme-native:

- **What is carried:** canonical, non-private, offline-manufacturable facts — coordinate definitions, the 72/64/36 LUTs, archetypal tables. NOT raw user content. The privacy boundary is unchanged: canon goes in the weights, the user's journal/dream content stays in context and never leaves the device.
- **How it composes:** the user's PASU voice/idiom LoRA (the M4 Nara local-LoRA personalization, per [[M'-ML-SKILL-SURFACE-SPEC]] §3.1) and the canon-fact micro-experts are two distinct adapters that ride the same frozen Gemma base and compose by linear ΔΘ sum on the final FFN — exactly as DMOA composes experts. "Who the user is" and "what the canon is" are separate, hot-swappable Shakti perturbations on one Siva base (DR-ARENA-1).
- **When it fires:** the EBM energy `E = ‖q_b − q_p‖²` (DR-MP-2), not Shannon entropy, is the gate — when a proposal's misalignment-from-canon spikes for a coordinate whose leaf-facts are carried as a `c_5_birth_codon`-indexed expert, that expert loads instead of a text re-injection, preserving the KV cache.
- **What it does NOT do:** it never carries relational, multi-hop, or provenance-bearing knowledge — that stays in the GraphRAG / Indras Net substrate (`s5'.gnostic.query_with_layers`). The parametric layer is a fast leaf-cache **companion** to GraphRAG, never a replacement.

Manufacturing rides Tranche 12.24 (`epii-distillation` expert mode + `mlx-lora`); routing/retrieval rides `s5'.gnostic.query_with_layers` (Track 39, Tranche 12.2 EXPANDED); the expert terminus rides the Hen entity-candidate lifecycle (CCT-14b). This is an **option** on the local Nara slot, not a new model commitment — it shares the slot's existing `state`/`fallback` semantics.

---

## §3 — The Epii-Judge Slot

The Epii-judge slot handles the autoresearch spine — alphaproof-style judge loops over derived vectors, lens-coherence evaluation against the 72-dim resonance, cross-canon coherence checks, research-move evaluation. The input data is structural signal (resonance vectors, coordinate tags, anonymised embeddings), not raw user content. The default configuration:

```toml
[slot.epii_judge]
state = "cloud-opt-in"
provider = "anthropic"  # or per user preference
model = "claude-opus-4-7"
consent_scope = "vector-only-derived-signal"
consented_at = "..."
fallback = "local-pro-class"  # if cloud unavailable, fallback to best-available local Pro-class
```

The cloud-opt-in default makes sense here because:

- **Capability threshold matters** — alphaproof-pattern judge loops have a real generator-quality threshold; the DeepMind paper found Flash-Lite-class models solved zero on hard problems
- **Privacy is already solved upstream** — the data the slot sees is derived signal, not raw content; the privacy boundary was crossed (or not) at the Nara-parser slot, not here
- **Multi-model diversity is valuable** — having Claude Opus and Gemini 3.1 Pro and GPT-5.2 all available as judge-pool members gives polyvalent verification capacity (M5' frontier-confirmations argues for this)

### Multi-model judge pool

The Epii-judge slot can be configured as a *pool* rather than a single model:

```toml
[slot.epii_judge]
state = "cloud-opt-in-pool"
providers = [
  { provider = "anthropic", model = "claude-opus-4-7", weight = 0.4 },
  { provider = "google", model = "gemini-3-1-pro", weight = 0.4 },
  { provider = "openai", model = "gpt-5-2", weight = 0.2 },
]
consent_scope = "vector-only-derived-signal"
selection_policy = "elo-informed"  # or "round-robin", "user-pinned"
```

When `selection_policy = "elo-informed"`, the dispatch selects from the pool based on Mercurius's per-model Elo state (per [[M'-AGENTIC-RUNTIME-SPEC]] §3). The model dimension becomes a learned dispatch — which model fits which judge-task at which coordinate context is honed by the system through doing.

### CFP3 / F-thread naming (architectural identity)

The `cloud-opt-in-pool` slot state IS the substrate of **CFP3 / F-thread (fusion_cadence)** at the model-dispatch level per the VAK CFP thread-type taxonomy (verbatim at [`Idea/Bimba/Seeds/M/M4'/2026-05-19-vak-musical-execution-z-thread.md:210, 263-268`](M4'/2026-05-19-vak-musical-execution-z-thread.md): `CFP1 parallel_chord` = P-thread (N tasks → N agents); **`CFP3 fusion_cadence` = F-thread (1 task → N agents → judge aggregate)**; `CFP4 long_drone` = L-thread (high-autonomy long-duration); `Z` = Möbius cycle wrapping all). The `cloud-opt-in-pool` slot configuration above IS CFP3 / F-thread operationalised as a model-slot pattern — N proposer models in parallel on the same prompt, with a judge model (default: `claude-opus-4-7`) reading every response and extracting consensus / contradictions / partial-coverage / unique-insights / blind-spots. The OpenRouter Fusion architecture is the empirical-pattern instance (per the Language Compression research arc at [`state/notebooklm-language-compression-research-2026-06-15/INTEGRATION-SYNTHESIS.md`](../../../state/notebooklm-language-compression-research-2026-06-15/INTEGRATION-SYNTHESIS.md) §3): budget panel `(Gemini 3 Flash + Kimmy 2.6 + Deepseek v3.2/v4 pro)` reaches **64.7% vs Fable 5 at 65.3%** on the deep-research benchmark — within 0.6pp at sum-of-individual-model costs (no bundle discount).

The Law 4 connective soteriology of and/or at M0-1 Brimming Void (per [`epi-logos-coordinate-system.md`](Legacy/reference/epi_logos_coordinate_system.md)) grounds the dispatch doctrine: **conjunctive composition (and-pathway) preserves the infinite — superposition-preserving; this is the Anupāya path** — IS CFP3 / F-thread and CFP1 / P-thread (both are parallel conjunctive). **Disjunctive composition (or-pathway) separates and limits — manifestation-by-exclusion** — IS MoE gating dispatch (per [[M'-AGENTIC-RUNTIME-SPEC]] §5 Anima MoE dispatch policy). Both are valid at their correct seats: conjunctive at the Epii-judge slot (where multiple readings compose into a synthesis); disjunctive at the Pleroma-Techne tool-dispatch seat (where exactly one tool runs). The choreography at Tranche 8.9 (`08-integrated-4-5-0-recognition-reconciliation.md`) names this distinction explicitly. The cycle-3 spec edits surface the CFP3 / F-thread name on `cloud-opt-in-pool` so the architecture vocabulary is consistent across spec layers.

**Optional explicit CFP3 / F-thread annotation** (compatible with the existing `cloud-opt-in-pool` state — additive, not breaking):

```toml
[slot.epii_judge]
state = "cloud-opt-in-pool"
cfp_thread_default = "CFP3"           # NEW (optional) — architectural name
panel_role = "proposer_panel"          # NEW (optional) — distinguish proposer-panel vs judge-pool
judge = { provider = "anthropic", model = "claude-opus-4-7" }  # NEW (optional) — explicit judge if heterogeneous
providers = [ ... ]                    # the N proposer models
consent_scope = "vector-only-derived-signal"
selection_policy = "elo-informed"
cost_model = "sum"                     # NEW (optional) — pricing is sum-of-models, not bundle
```

The Anuttara verifier wrap that distinguishes the Epi-Logos Fusion-pattern from vanilla OpenRouter Fusion is per Tranche 8.9 — the 0' face of the unified VAK act IS the verifier that emits typed-queries-with-backing-chain alongside the proposer-panel + judge synthesis. Per the 4:5:6 just-triad weighting `E_total = (4·E_4 + 5·E_5 + 6·E_6) / 15`, the heaviest weight sits at the verifier seat OpenRouter Fusion entirely lacks; this is the structural reason the wrap is non-optional.

---

## §3a — The Gnostic-Extractor Slot (O# Handover Register)

The gnostic-extractor slot handles offline structured-schema extraction at the **O# Zero Logic handover register** (per [[../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/16-cross-cutting-closures]] CCT-22 §c). This is the slot a 4B-class extractor model runs in to perform corpus → coordinate-tagged structured-schema extraction before the binary-form output is passed to M1 axiomatic-unfolding. The default configuration:

```toml
[slot.gnostic_extractor]
state = "local-default"
provider = "ollama"
model = "gemma3:12b-q4_K_M"  # Gemma 4 12B Unified Q4 as current realisation
context_window = 32768
fallback = "null"            # no silent degrade to cloud — privacy is structural
cfp_thread_default = "CFP0"  # single_voice (offline batch extraction)
extraction_schemas = [
  "factual_metadata",
  "authorship",
  "textually_mentioned_entities",
  "implicit_abstracted",
  "relational_citation_graph",
]
reward_dimensions = {
  format    = "-",   # O1 sacred-limitation: constraint on output shape
  json      = "/",   # O4 indeterminacy-as-proportion (KL-penalty held in ratio)
  task      = "x",   # O3 self-multiplication (work multiplying through data)
  kl_step   = "+",   # O2 affirmation deferred to closure (added-at-last-step)
}
```

**Why O# handover register.** Per [`Body/S/S0/epi-lib/src/m0.c::O_SHARP_TABLE`](../../../Body/S/S0/epi-lib/src/m0.c), the O# Zero Logic cycle `O0 +/-0` (potential polarity) / `O1 -0` (sacred limitation, `-`) / `O2 +0` (affirmation, `+`) / `O3 0²` (self-multiplication, `x`) / `O4 (0/0) = √0/%` (indeterminacy-as-proportion, `/`) / `O5 quadratic-closing-on-0/1` IS the structural cycle a corpus-extraction operator must traverse to close on binary-form output the M1 matheme can receive as axiom (Spinoza joint per DR-VAK-7). GRPO-trained extractor models with format / JSON / task rewards + KL-penalty-at-last-step match the O# cycle structurally; the specific model is incidental (Gemma 4 12B Unified Q4 is the current realisation; the K1 model from the Language Compression research arc is a notable inspiration; any model exposing the right reward-structure can fill the slot). The slot is **model-agnostic by design** per CCT-22 §c.

**Two-tier extractor + analyst split.** The gnostic-extractor slot is the *offline structured-schema* tier; the Epii-judge slot (§3 above) is the *online query reasoning* tier. The split maps cleanly onto the privacy boundary: raw corpus → gnostic_extractor (local-default by structural commitment, mirrors Nara-parser § 2 policy for raw content) → coordinate-tagged structured-schema substrate → online queries route to Epii-judge (cloud-opt-in for derived-signal reasoning). Per [[M'-AGENTIC-RUNTIME-SPEC]] §5, the MoE dispatch handles routing across the two slots based on the request shape (offline-batch vs online-query).

**Privacy semantics.** Same three-state policy (`local-default` / `cloud-opt-in` / `null`) as Nara-parser slot per §2 with `fallback = "null"` structural commitment. The slot does NOT silently degrade to cloud routing; if the local model is unavailable, the slot returns null and the gnostic-ingest pipeline fail-soft with notice.

---

## §4 — Per-Aletheia-Subagent Slots

Each of the 6 Aletheia techne-guardians has its own model slot. Defaults reflect the techne-domain's structural needs:

```toml
[slot.aletheia.anansi]  # CF0, coordinate-mapping
state = "local-default"
model = "gemma3:e4b"  # light reasoning, fast turnaround
# Coordinate-mapping is lookup-heavy, doesn't need heavy generation

[slot.aletheia.janus]  # CF1, threshold logic
state = "local-default"
model = "gemma3:12b-q4_K_M"  # threshold logic wants medium reasoning
# Janus also runs Klein-binary weighting per Track 12.18; benefits from structured-output

[slot.aletheia.moirai]  # CF2, GraphRAG-distillation
state = "cloud-opt-in"
provider = "anthropic"
model = "claude-opus-4-7"
consent_scope = "vector-only-graphrag-context"
# GraphRAG-distillation wants strong reasoning; data is already derived

[slot.aletheia.mercurius]  # CF3, kairos-signal / Elo bookkeeping
state = "local-default"
model = "gemma3:12b-q4_K_M"  # bookkeeping is mostly structured operations
# Mercurius runs the Elo update math; benefits from JSON reliability

[slot.aletheia.agora]  # CF4, skill-index
state = "local-default"
model = "gemma3:e4b"  # index maintenance is light
# Plugin absorption is structured registration work

[slot.aletheia.zeithoven]  # CF5, creative-advance / new-skill creation
state = "cloud-opt-in"
provider = "anthropic"
model = "claude-opus-4-7"
consent_scope = "skill-design-no-user-content"
# Creative-advance wants strongest model available; no user content involved
```

The defaults are starting points. As Mercurius's Elo state accumulates, the system learns which per-subagent model fits which techne-task at which coordinate — the slot defaults become less important than the rated dispatch policy.

---

## §5 — Slot Configuration Surface

### CLI

```bash
# View current slot state
$ epi slot list
$ epi slot show <slot-name>

# Configure a slot
$ epi slot set <slot-name> --state local-default --model gemma3:12b-q4_K_M
$ epi slot set <slot-name> --state cloud-opt-in --provider anthropic --model claude-opus-4-7

# Disable a slot (null state)
$ epi slot disable <slot-name>

# Test a slot is reachable
$ epi slot test <slot-name>
```

### Config file structure

`~/.epi-logos/config.toml` carries the per-slot configuration. Slots are namespaced:

```toml
[slot.nara_parser]
state = "local-default"
# ...

[slot.epii_judge]
state = "cloud-opt-in"
# ...

[slot.aletheia.anansi]
state = "local-default"
# ...
```

### Per-session override

The user can override slot configuration per session through dispatch-level flags or session-scoped config:

```bash
$ epi session start --override-slot epii_judge=local-default
```

The override applies only to the session; the persistent config in `~/.epi-logos/config.toml` is unchanged.

---

## §6 — Verifier Enforcement of Privacy Boundaries

Anuttara verifier enforces the slot rule as structural-invariant checks. Two registered constraints:

### `slot_privacy_boundary_compliance`

```cypher
// Dispatches must not route content of class X to a slot whose consent_scope doesn't cover X
MATCH (d:Dispatch)
WHERE d.content_class IS NOT NULL
  AND d.slot_state = 'cloud-opt-in'
WITH d, d.content_class AS cls, d.slot_consent_scope AS scope
WHERE NOT cls IN scope_class_set(scope)
RETURN d.id, 'privacy-boundary-violation' AS violation,
       cls AS content_class, scope AS consent_scope
```

Severity: **error-level** (blocks dispatch).

### `slot_fallback_compliance`

```cypher
// Dispatches must not silently degrade across privacy boundaries
MATCH (d:Dispatch)
WHERE d.slot_target_state = 'local-default'
  AND d.actual_resolved_state <> 'local-default'
  AND d.actual_resolved_state <> 'null'
RETURN d.id, 'silent-degradation-violation' AS violation,
       d.slot_target_state AS configured, d.actual_resolved_state AS actual
```

Severity: **error-level**. A slot configured `local-default` must resolve to either `local-default` (success) or `null` (graceful refusal) — never silently to `cloud-opt-in`.

---

## §7 — Cross-References

### Kernel binding

The slot rule lives below the kernel-spec abstraction (the kernel sees LLM/EBM/Verifier as roles; the slot rule says how the LLM role gets instantiated). The kernel-spec §7 (technical stack distribution) is unchanged in its role-naming; this document specifies the model-level realization.

### Agentic-runtime binding

The slot rule is consumed by [[M'-AGENTIC-RUNTIME-SPEC]] §1 (the model dimension of the MoE) and §5 (Anima's dispatch policy reads slot state at dispatch time). Elo state is per-model (per [[M'-AGENTIC-RUNTIME-SPEC]] §3); the slot rule controls which models are even eligible for Elo participation.

### User-context binding

The slot rule interacts with [[M'-USER-CONTEXT-SKILL-SPEC]] through the privacy boundary: raw user content goes to Nara-parser slot (local-default by structural commitment); only EBM-output and UserContextFrame structural signal crosses to slots that may be cloud-opt-in. The opt-in to collective archetype-telemetry is opt-in to letting these derived signals cross — never to letting raw content cross.

### Cycle-3 track binding

This spec is operationalised through cycle-3 tranche **Track 12.22** *(new, see DR-MODEL-1)* — Pi-Agent model-slot configuration interface implementation.

---

## §7a — The Harness-Slot Orthogonal Namespace *(NEW per [[../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/08-integrated-4-5-0-recognition-reconciliation]] Tranche 8.9)*

**The model-slot picks the weights. The harness-slot picks the tool-protocol surface wrapping the weights. They are orthogonal.** A model can run inside any harness; a harness can wrap any model. Composing them gives the dispatch its operational shape: `(model × harness × cfp_thread × r_factor_slot × kairos × content_class)` is the rating tuple Mercurius's Elo bookkeeping covers (per Tranche 12.20 extension).

### The harness dimension

Per the Z-thread autonomy framework at [`Idea/Bimba/Seeds/S/S4/S4'/S4-4'-GOAL-PRELUDE-SPEC.md:25-49`](../Idea/Bimba/Seeds/S/S4/S4'/S4-4'-GOAL-PRELUDE-SPEC.md), the harness wrapping a model determines: tool-availability surface, context-management policy, dispatch-shape (sync / async / streaming), observability hooks, capability-matrix membership, and the protocol the orchestrating agent uses to invoke the model. The known harness families per cycle-3:

| Harness | Provider | Surface | Use-cases |
|---|---|---|---|
| **`pi`** | epi-logos | Pi-Agent runtime per [[M'-AGENTIC-RUNTIME-SPEC]] §1 | Default for all Anima-dispatched constitutional voices and Aletheia techne-guardians; canonical surface for any Epi-Logos-native dispatch |
| **`claude`** | Anthropic | Claude harness (CLI / API native) | High-capability sustained agentic work; Sophia disclosure synthesis; Zeithoven creative-advance; some Epii-judge dispatches |
| **`codex`** | OpenAI | Codex CLI / API | Specific code-generation surfaces; structural-edit operations; some gnostic-extraction batch operations |
| **`aider`** | community | Aider harness | Code-edit workflows for specific surfaces (e.g. Body/S/S0/ epi-cli rust edits when invoked); not default for any cycle-3 role |
| **`ollama`** | community | Ollama local-runtime | Wrapping local-default model slots (Nara-parser default, Anuttara-verifier default, gnostic-extractor default) |

### The three states (same as model-slot per §1)

Each harness-slot has exactly three valid states, configured per-slot in `~/.epi-logos/config.toml` and read by Anima's dispatch policy at dispatch time:

- **`local-default`** — the harness runs on-device (e.g. ollama, pi running locally, claude CLI invoking local model). Privacy-first.
- **`cloud-opt-in`** — the harness invokes a cloud API (e.g. claude API to Anthropic, codex API to OpenAI). Consent-scoped.
- **`null`** — no harness assigned; the slot fails-soft.

### Worked example: composing model × harness for the Epii-judge slot

```toml
[slot.epii_judge]
state = "cloud-opt-in-pool"
cfp_thread_default = "CFP3"
panel_role = "proposer_panel"
providers = [
  { provider = "anthropic", model = "claude-opus-4-7", weight = 0.4 },
  { provider = "google", model = "gemini-3-1-pro", weight = 0.4 },
  { provider = "openai", model = "gpt-5-2", weight = 0.2 },
]
judge = { provider = "anthropic", model = "claude-opus-4-7" }
consent_scope = "vector-only-derived-signal"
selection_policy = "elo-informed"

[harness.epii_judge]
state = "cloud-opt-in"
provider = "claude"                  # claude harness wraps the chosen model
fallback = "pi"                      # if claude harness unavailable, use Pi-Agent harness
consent_scope = "judge-loop-only"
overrides_per_provider = [
  { model_provider = "anthropic", harness = "claude" },
  { model_provider = "google",    harness = "pi" },     # Gemini 3.1 Pro wrapped by Pi-Agent (not Google's native CLI)
  { model_provider = "openai",    harness = "codex" },  # GPT-5.2 wrapped by Codex CLI
]
```

A dispatch under this configuration picks a model from the pool (per Elo-informed selection), then picks the harness wrapping that model from `overrides_per_provider` (or `provider`/`fallback` defaults). The Mercurius Elo state per Tranche 12.20 rates each `(model × harness × ...)` composition independently, so the system learns over time whether (for example) Claude Opus 4.7 in Claude harness performs the Epii-judge role better than the same weights in Pi-Agent harness, at this CFP3 / F-thread context, at this kairos window.

### Privacy boundary enforcement

The Anuttara verifier's `slot_privacy_boundary_compliance` constraint (already landed, per §6) extends to check both dimensions:

- **Model-slot privacy class** (raw-content / vector-only / non-sensitive)
- **Harness-slot privacy class** (does the harness itself cross-network? cache-locally? log to provider's telemetry?)

A dispatch where `slot.foo.state = "local-default"` (raw content stays local) but `harness.foo.state = "cloud-opt-in"` (harness routes through cloud) is structurally inconsistent and the verifier refuses with `harness-model-privacy-mismatch` violation. The two dimensions must compose privacy-coherently or the verifier raises a typed-query at dispatch time.

### Cycle-3 track binding

The harness-slot dimension is operationalised through **Tranche 12.22 extension** (the slot CLI gains `epi slot harness set <slot-name> --provider <X>` parity with `epi slot model set`) + **Tranche 12.20 extension** (Mercurius Elo rating tuple expands to include `harness_id` as a context coordinate). The composition matrix and the Mercurius rate-table land at the new Tranche 12.37 *(NEW)* — see [`12-agentic-layer-s4-s5.md`](../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md).

---

## §4b — The Anuttara-Verifier Slot (Phase-J 2026-06-15)

Per Tranche 12.34 (Track 12) + §13 of [`epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`](epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md), the Anuttara PI agent form at S5 completes the 4/5/0 nara-epii-anuttara agent system. Anuttara needs its own slot alongside `[slot.nara_parser]` and `[slot.epii_judge]`:

```toml
[slot.anuttara_verifier]
state = "local-default"  # privacy-first; verifier operates over kernel-substrate-local content
provider = "ollama"
model = "qwen2.5-7b-instruct-q5"  # or similar 7B-class with strong constraint-following + JSON
```

### Why local-default

The Anuttara verifier runs over content that is structurally local: the M0-0' language registry (128 atomic elements per DR-VAK-7), the OWL ontology + n10s Neo4j integration, the R-virtue table (`VIRTUE_LUT[9]`), the 65 core relations (`M0_CORE_RELATIONS[65]`), and the typed-query emission surface drawn from the full-7-laws Anuttara grammar. None of this content needs to cross the privacy boundary — all of it IS the kernel-substrate-local language definition.

The verifier's typed-query output (a `M0VerifierReport` with `typed_queries: Vec<TypedQuery>` drawn from the full 7 laws, per §13.4 of the operational-capacity spec) is consumed by the dispatching agent (Nara-PI, Epii-PI, or Anima); the verifier itself is purely local. Cloud-opt-in only makes sense if user wants larger interpretive verifier capacity; the local default suffices for canonical R-virtue + 7-laws constraint-checking.

### Capability requirement

The Anuttara-verifier slot model needs: strong **constraint-following** (verifier output must match `M0VerifierReport` schema reliably), reliable **JSON output** (the typed-query surface is structured), reasonable **OWL/ontology comprehension** (the model queries the n10s ontology), and **fast enough for synchronous verification** (the verifier runs on every emission's type-check, not in background).

A 7B-class instruct model with strong JSON-mode reliability fits. Examples: Qwen 2.5 7B Instruct Q5, Hermes 7B, Llama 3.1 8B Instruct. The exact default is configurable; the spec names the class, not the model.

### Cloud-opt-in path for Anuttara-verifier

```toml
[slot.anuttara_verifier]
state = "cloud-opt-in"
provider = "anthropic"
model = "claude-haiku-4-5-20251001"  # or Sonnet for richer interpretive verifier capacity
consent_scope = "language-substrate-only"  # NOT user-content
```

When cloud-opt-in, the verifier still operates ONLY over the kernel-substrate-local language definition. User content never enters this slot. The cloud-opt-in unlocks larger interpretive capacity for the typed-query emission, not broader content access.

### Verifier constraints registered

Per Tranche 12.34, four gateway routes register under `s0'.verifier.*`:
- `s0'.verifier.check_state(state)` → `M0VerifierReport`
- `s0'.verifier.emit_query(coord, context)` → `TypedQuery` (drawn from full 7-laws vocabulary, not minimal subset)
- `s0'.verifier.validate_membership(element)` → `bool` (128-registry check)
- `s0'.verifier.owl_query(query)` → `OwlResultSet`

All four dispatch through the `[slot.anuttara_verifier]` model. Slot privacy-boundary compliance applies: the verifier slot can be local-default OR cloud-opt-in with `consent_scope = "language-substrate-only"`; raw user content never enters this slot regardless of state.

---

## §∞ — Closing Recognition

Model is a slot, not a system commitment. Three states per slot: local-default (privacy-first structural commitment), cloud-opt-in (explicit-consent-per-dispatch-class with scope), null (graceful refusal). Nara-parser defaults to Gemma 4 12B Unified Q4 because privacy is non-negotiable for raw content. Epii-judge defaults to cloud-opt-in Pro-class because capability threshold matters and the data is already derived to vectors. Anuttara-verifier defaults to local-default 7B-class because the verifier runs over kernel-substrate-local language content (the 128 registry + OWL ontology + R-virtue table) — privacy boundary is structurally pre-solved. Per-Aletheia-subagent slots default sensibly per techne-domain and become Elo-rated over time.

The structural commitment is that the privacy boundary is enforced at the slot, not at an extra gate. Raw content goes to slots that hold it locally by configuration; derived signal goes to slots that can be cloud-opt-in because the privacy was solved upstream. The verifier refuses dispatches that would cross the boundary; the system fails soft rather than silently degrading. The user knows what they're getting because the slot configuration is explicit, the consent scope is named, and the privacy implication is surfaced through frictional UI gates at opt-in time.

Gemma 4 12B Unified is today's right default for the Nara-parser slot. Next year's right default may be different — the slot rule keeps the door open by making model a swap point. What stays constant is the structural commitment: per-role slots, three states, explicit consent, verifier enforcement, no silent degradation.

---

*Document status: Canonical Specification — cycle 3 ratification pending via DR-MODEL-1.*

*Companion documents: [[epi-logos-kernel-spec]] (the operator), [[M'-AGENTIC-RUNTIME-SPEC]] (the dispatch architecture), [[M'-USER-CONTEXT-SKILL-SPEC]] (the privacy boundary).*
