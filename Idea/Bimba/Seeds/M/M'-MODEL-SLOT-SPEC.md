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

## §∞ — Closing Recognition

Model is a slot, not a system commitment. Three states per slot: local-default (privacy-first structural commitment), cloud-opt-in (explicit-consent-per-dispatch-class with scope), null (graceful refusal). Nara-parser defaults to Gemma 4 12B Unified Q4 because privacy is non-negotiable for raw content. Epii-judge defaults to cloud-opt-in Pro-class because capability threshold matters and the data is already derived to vectors. Per-Aletheia-subagent slots default sensibly per techne-domain and become Elo-rated over time.

The structural commitment is that the privacy boundary is enforced at the slot, not at an extra gate. Raw content goes to slots that hold it locally by configuration; derived signal goes to slots that can be cloud-opt-in because the privacy was solved upstream. The verifier refuses dispatches that would cross the boundary; the system fails soft rather than silently degrading. The user knows what they're getting because the slot configuration is explicit, the consent scope is named, and the privacy implication is surfaced through frictional UI gates at opt-in time.

Gemma 4 12B Unified is today's right default for the Nara-parser slot. Next year's right default may be different — the slot rule keeps the door open by making model a swap point. What stays constant is the structural commitment: per-role slots, three states, explicit consent, verifier enforcement, no silent degradation.

---

*Document status: Canonical Specification — cycle 3 ratification pending via DR-MODEL-1.*

*Companion documents: [[epi-logos-kernel-spec]] (the operator), [[M'-AGENTIC-RUNTIME-SPEC]] (the dispatch architecture), [[M'-USER-CONTEXT-SKILL-SPEC]] (the privacy boundary).*
