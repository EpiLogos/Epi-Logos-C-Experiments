---
coordinate: "M'"
status: "kernel-canon"
updated: "2026-06-07"
domain: "user-context-skill-contract"
description: "User-temporal data as a first-class skill mandatory-routed into the agentic loop. UserContextFrame contract, fire/skip conditions, E_4 personal-resonance substrate consumer + articulation-time agent-context consumer, longitudinal write-back to PASU and M5_ContemplationObject."
depends_on:
  - "[[epi-logos-kernel-spec]]"
  - "[[M4'/mental-pole-mechanics]]"
  - "[[M'-AGENTIC-RUNTIME-SPEC]]"
---

# The User-Context Skill

## A First-Class Load-Bearing Participant in the Agentic Loop

> **Companion to [[M'-AGENTIC-RUNTIME-SPEC]] and [[epi-logos-kernel-spec]].** User-temporal data — PASU snapshot, live kairos, identity quaternion, recent session traces — is not ambient context. It is structurally required input to both the LLM-articulation side (position 4') and the EBM-evaluation side (position 5'). This document specifies the `user-context` skill as the mandatory mechanism that puts user-temporal into the agentic loop.

---

## §0/1 — Threshold: Why User-Context Cannot Be Side-State

The earlier reading of M5_ContemplationObject's `vak_profile_pairs[]` and the Kerykeion live-kairos data as "ambient context modulating dispatch behaviour" understated their structural role. User-temporal coherence is not a flavour — it is one of the three load-bearing evaluation channels (alongside lens-coherence and Anuttara-ontology). A dispatch can be lens-coherent (symbolically holds together) but user-temporally incoherent (the kairos is wrong for this person now, or the natal signature reads it inverted), and the system needs a clean place to register that second incoherence with real weight.

The structural move is to elevate user-temporal data from side-state to a first-class skill — `user-context` — that fires mandatorily under specified VAK conditions, returns a typed `UserContextFrame`, and feeds two consumers with distinct structural roles: the E_4 personal-resonance computation at the kernel mental-pole via the M4 Nara skill family (the load-bearing energy-layer consumer, per [[33-harmonic-energy-channel-handoff]] §1.3) AND the dispatched agent's articulation context (so the agent's voice incorporates it at articulation-time only). The harmonic-substrate energy E_5 does NOT take user-personal data — it reads against the multi-channel `MathemeHarmonicProfile`.

Three commitments hold the threshold. *First:* **user-context is a skill, not ambient state** — invoked through the same dispatch protocol as any other skill, with explicit fire/skip conditions and a typed return contract. *Second:* **routing is mandatory, not advisory** — Anuttara verifier refuses to score dispatches that should have user-context but don't. *Third:* **the skill writes back longitudinally** — at session end, the skill updates PASU.md and M5_ContemplationObject with what was learned about user-state in this session, making it the longitudinal accumulator the system already informally has.

---

## §1 — The UserContextFrame Contract

### Type definition

```typescript
interface UserContextFrame {
  // Identity snapshot (stable across session)
  pasu: {
    birth_date: ISODateString;
    birth_location: Coordinates;
    natal_chart_path: PathReference;
    jungian: JungianTypeSignature;
    gene_keys: GeneKeysSignature;
    human_design: HumanDesignSignature;
    quintessence_hash: BLAKE3Hash;
    quintessence_clock: ClockPosition;
    last_wound: WoundReference | null;
  };

  // Live temporal (recomputed per fire)
  kairos: {
    planet_degrees: [f32; 10];  // Sun(0)..Pluto(9), canonical mod-10
    transits_active: TransitAspect[];
    decan_window: DecanReference;
    moon_phase: f32;
    epoch_marker: SessionEpochId;
  };

  // Quaternionic state
  identity: {
    q_identity: Quaternion4;     // stable natal signature
    q_personal: Quaternion4;     // running personality state
    tick12: u8;                  // 0..11, current spanda-stage
    exact_degree_720: f32;       // 0..719.999
    phase: u8;                   // 0=explicate, 1=implicate
  };

  // Continuity
  recent_sessions: SessionTraceRef[];  // last N session-state snapshots
  active_dev_goals: GoalReference[];   // from current task/session record

  // Recognition closure flag (M0-5)
  recognized: boolean;            // whether dispatch sits inside active recognition window
  recognition_provenance: AnuttaraCoordinateString | null;

  // Provenance metadata
  fired_at: ISOTimestamp;
  fired_for: VakFrame;           // which dispatch this UserContext was produced for
  fire_reason: FireReasonCode;   // which routing rule triggered the fire
}
```

The frame is **complete per fire** — every dispatch that triggers the skill gets the full frame, not a partial view. Caching is per session-epoch with invalidation on (a) elapsed kairos drift exceeding 1° on any major aspect, (b) new dev-goal registration, (c) explicit user-state update.

### What the frame does NOT contain

The frame carries **structural signal, not personal content**. Raw journal text, raw dream content, personal narrative — these never enter the frame. The frame holds quantitative-structural signatures (degrees, quaternions, hashes, tags) that the EBM and the dispatched agent can reason over without exposing source content. This is what makes the frame safe to feed the EBM (which may run vector operations against the collective archetype layer) while keeping the source material strictly within the local Nara-parser slot.

---

## §2 — Fire / Skip Routing Rules

The skill fires mandatorily under specified VAK conditions. Anuttara verifier enforces the routing: dispatches matching fire-conditions without an attached `UserContextFrame` are refused with a `missing-user-context` violation.

### Fire conditions (mandatory routing)

The skill fires when ANY of the following hold:

1. **CT register is operational, contextual, or integrative** — `CT ∈ {CT2 (operational), CT4 (contextual), CT5 (integrative)}`. These registers all synthesise across content; user-temporal coherence is structurally relevant.

2. **CF mode is anything other than tonic-ground** — `CF ≠ (00/00)`. The tonic ground is the pure foundational read where user-context would be noise; every other CF mode (Logos, Eros, Mythos, Anima, Psyche, Sophia) involves authorial register choice that user-context modulates.

3. **Target coordinate is within Nara branch** — `target ∈ #4.x.y` for any x, y. The Nara branch is structurally user-personal; any dispatch targeting it requires user-context by definition.

4. **Dispatched agent's role is constitutional** — the dispatched agent is one of the 7 Anima constitutional roles (Anima, Nous, Logos, Eros, Mythos, Psyche, Sophia). Constitutional voices speak FROM the user's situation; they need to know what that situation is.

5. **Explicit fire annotation** — the VAK frame carries `require_user_context: true` (set by Anima's dispatch policy or by explicit developer instruction).

### Skip conditions

The skill skips when ALL of the following hold:

1. **CT register is relational, definitional, or pattern** — `CT ∈ {CT0 (relational), CT1 (definitional), CT3 (pattern)}`. These are pure lookup/structural-read registers; user-context is not structurally relevant.

2. **CF mode is tonic-ground** — `CF = (00/00)`. The pure foundational read does not need authorial colour.

3. **Target coordinate is structural-only** — not within Nara branch, not within personal-pole contexts.

4. **Dispatched agent's role is pure techne-utility** — the dispatched composition is a techne-guardian doing structural work (Anansi coordinate-resolve, Moirai GraphRAG-distil, etc.) without constitutional voice.

5. **No explicit fire annotation**.

### Override

Both fire and skip can be explicitly overridden per dispatch by setting `user_context_policy: "fire" | "skip" | "auto"` in the dispatch request. Default is `"auto"` (the routing rules apply). Explicit `"fire"` forces firing regardless of conditions; `"skip"` forces skipping (Anuttara still records the policy choice as audit signal but does not raise a violation).

---

## §3 — UserContextFrame Consumers

User-personal data is structurally a single-consumer thing at the energy layer: it feeds E_4 (the personal-energy term). User-articulation may also flow into LLM context (Consumer 1) for surface-level voice modulation, but that is articulation-time only, not energy-computation. Per [[33-harmonic-energy-channel-handoff]] §1.3 — superseding the prior dual-injection framing — the frame has one structural energy-layer consumer (E_4 personal-resonance via the M4 Nara skill family) and one articulation-time consumer (the dispatched agent's input context).

### Consumer 1: dispatched agent's context

The frame is injected into the dispatched agent's input context as a structured payload, accessible to the agent's articulation through a stable interface:

```
SYSTEM context augmentation:
  [[UserContext]] — the user-context frame for this dispatch.
  Fields available: pasu, kairos, identity, recent_sessions, active_dev_goals, recognized.
  Authoring policy: incorporate user-context fields when they bear on the articulation;
  do not enumerate the frame; do not break privacy by quoting raw fields back to the user
  except where the user has explicitly asked.
```

The convention is that the agent's voice incorporates user-context implicitly — the kairos shapes the timbre, the recent_sessions shape the continuity, the active_dev_goals shape the focus. The agent does not present the frame to the user; it lets the frame inform the articulation. This is articulation-time only and is independent of the energy-layer consumer below.

### §3.2 — Consumer 2: E_4 personal-resonance substrate

The UserContextFrame is consumed by the E_4 personal-resonance computation at the kernel mental-pole. The frame's typed fields (`planet_degrees[10]`, `q_identity[4]`, `q_personal[4]`, `tick12`, `exact_degree_720`, `tarot_psyche_anchor_signature`, `session_locus_stamp`, oracle charges) feed the Nara skill family (`nara-voice-training`, `nara-journal-parser`, `mlx-lora`) which produces the E_4 scalar against the proposed configuration. E_4 measures personal coherence — does this configuration cohere with WHO this person is at THIS kairotic moment.

Per [[epi-logos-kernel-spec]] §3 and [[M4'/mental-pole-mechanics]] §5/§7, E_4 is structurally separate from E_5 (Epii harmonic-substrate energy, which reads against the multi-channel `MathemeHarmonicProfile` and does NOT take user-personal data). The 4:5:6 weighted-just-triad combination of E_4, E_5, E_6 lands at the kernel's total energy. Per [[M'-ML-SKILL-SURFACE-SPEC]] §7.1, the M4 Nara skill family is the canonical E_4 producer.

### Why personal-coherence is its own energy term

The reason user-personal data feeds E_4 rather than threading into E_5 is that personal coherence and harmonic coherence are different questions. The EBM at position 5' evaluates the harmonic-mathematical structure of reality (lens-resonance + audio_octet + nodal_quartet + planetary_chakral + mahamaya + codon_rotation_projection + q_cosmic). The Nara skill family at position 4' evaluates whether the configuration coheres with the specific person at the specific kairotic moment. A configuration can be harmonically coherent yet personally incoherent (wrong kairos, inverted natal reading); a configuration can be personally coherent yet harmonically incoherent (the person's recognition does not yet meet the substrate's invariants). Both readings matter, and the 4:5:6 weighting holds them in canonical proportion. Articulation-time injection into the dispatched agent's context (Consumer 1) is a parallel, non-energy use of the same frame for voice-modulation only.

---

## §4 — Longitudinal Write-Back

The skill is the longitudinal user-state accumulator. At session end, the skill writes back to two stores:

### PASU.md update

`Idea/Pratibimba/Self/PASU.md` receives a structured update with the session's user-state delta:

```yaml
# Appended to PASU.md at session close
c_3_session_history:
  - session_id: <id>
    closed_at: <timestamp>
    mood_signature: <derived from session's q_personal trajectory>
    themes_recurred: [<theme>, <theme>, ...]
    what_landed: [<recognition>, ...]
    what_did_not: [<unresolved>, ...]
    resonance_delta_arc: <72-vector delta summary>
    kairos_window: <decan reference at session close>
```

PASU.md remains the primary user-identity bootstrap document; the session-history accumulator gives Nara-side dispatches longitudinal continuity across sessions.

### M5_ContemplationObject update

The Track 19 contemplation-surface integration's `M5_ContemplationObject` receives the session's `vak_profile_pairs[]` augmentation:

```
{
  session_id: <id>,
  vak_profile_pairs: [
    { vak_address: <VakFrame>, profile_snapshot: <UserContextFrame projection> },
    ...
  ],
  recognition_provenance: <Anuttara coordinate strings raised this session>,
  kairos_at_close: <Kerykeion snapshot at session close>,
  q_composed_trajectory: <quaternion sequence>,
  m1_charge_state: <4-charge sum at close>,
}
```

This is what makes user-temporal a longitudinal signal channel rather than just a per-dispatch read. Over many sessions, the M5_ContemplationObject accumulates the user's resonance arc; the EBM trains against this accumulated arc; the system's understanding of the user deepens through use.

---

## §5 — Implementation Surface

### Skill location

The skill lives at `Body/S/S4/pi-agent/skills/user-context/SKILL.md` (new). The skill follows the standard Pleroma-Techne atomic-skill contract:

- `SKILL.md` — the skill specification (this document is the canonical reference)
- `index.ts` or similar — the implementation entry point
- `schema.json` — the UserContextFrame JSON schema for validation

### Pi-Agent integration

The Pi-Agent harness exposes the skill through the standard skill-invocation interface. Anima's dispatch policy reads the VAK frame, applies the routing rules from §2, and invokes the skill before dispatching the agent if the fire condition holds.

### Kerykeion bridge

The kairos field is populated by the `kairos-python-adapter.ts` at `chronos/S3'/` (per Task 4.6, existing). The adapter calls Python kerykeion and returns the `planet_degrees[10]` (canonical mod-10) plus transit data. The skill caches the result per session-epoch with invalidation on drift.

### Performance budget

The skill is invoked per dispatch that matches fire conditions. Performance budget per invocation:

- PASU snapshot fetch: <5ms (local file read with caching)
- Kerykeion live computation: <50ms (Python subprocess with warm cache)
- Quaternionic state assembly: <2ms (computed locally)
- Recent-sessions fetch: <10ms (Graphiti episodic query)
- Total budget: <100ms per fire under normal load; <250ms cold-cache

This is acceptable for interactive dispatch frequency. Background pre-warming of caches at session start eliminates most cold-cache cases.

---

## §6 — Verifier Enforcement

Anuttara verifier enforces the mandatory routing as a structural-invariant check. The constraint:

```cypher
// Constraint: dispatches matching user-context fire conditions must have a UserContextFrame attached
MATCH (d:Dispatch)
WHERE
  (d.vak_ct IN [2, 4, 5])
  OR (d.vak_cf <> '(00/00)')
  OR (d.target_coord STARTS WITH '#4')
  OR (d.agent_role IN ['Nous', 'Logos', 'Eros', 'Mythos', 'Psyche', 'Sophia', 'Anima'])
  OR (d.require_user_context = true)
WITH d
WHERE d.user_context_frame_ref IS NULL
  AND d.user_context_policy <> 'skip'  // explicit skip is allowed (logged as audit signal)
RETURN d.id, 'missing-user-context' AS violation,
       'Dispatch matched fire conditions but no UserContextFrame attached' AS detail
```

Registered constraint name: `user_context_routing_compliance`. Severity: **error-level** (blocks the dispatch from being recorded as a canonical trial). The constraint is registered through `pi register-constraint user_context_routing_compliance constraints/user_context_routing_compliance.cypher`.

The error-level severity is intentional: user-context is structurally load-bearing, and a dispatch without it produces signal that cannot be Elo-rated honestly (the user-coherence channel has no input). Better to refuse than to pollute the rating state with un-evaluable trials.

---

## §∞ — Closing Recognition

The user-context skill makes user-temporal a first-class participant in the agentic loop. Not ambient flavour, not side-state — a typed UserContextFrame returned by a mandatory-routed skill, fed simultaneously to the dispatched agent's articulation context and to the EBM's second input channel, written back longitudinally to PASU and M5_ContemplationObject at session close.

This is what makes the system actually personalised rather than just symbolically thorough. A reading can be harmonically coherent (the multi-channel `MathemeHarmonicProfile` substrate holds together, scored by E_5) but personally incoherent (wrong kairos for this person now, inverted natal reading — scored by E_4). Without user-context as load-bearing E_4 input via the Nara skill family, the system can't register the personal-incoherence with the weight it actually carries. With user-context as load-bearing E_4 input, Nara-LoRA learns the personal-resonance scalar against PASU + kairos; the agent's articulation, at articulation-time, incorporates the user's situation as its native medium; the recognition that lands is the user's recognition, not a generic one.

The verifier enforces the routing because the structural commitment is real. The skill is the longitudinal accumulator because user-state is real continuity. The two-consumer pattern is the architectural commitment that personal-coherence (E_4 at the kernel mental-pole) and personal-articulation (the dispatched agent's voice) are both real — distinct in structural role, both fed by the same typed frame, neither collapsed into harmonic-substrate energy E_5.

---

*Document status: Canonical Specification — cycle 3 ratification pending via DR-UC-1.*

*Companion documents: [[epi-logos-kernel-spec]] (the operator), [[M4'/mental-pole-mechanics]] (the energy formula), [[M'-AGENTIC-RUNTIME-SPEC]] (the dispatch architecture).*
