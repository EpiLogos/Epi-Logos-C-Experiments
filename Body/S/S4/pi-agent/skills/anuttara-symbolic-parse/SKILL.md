---
name: anuttara-symbolic-parse
description: "Parse Verifier-Anuttara symbolic-coordinate strings into structural interrogatives, resolve against M0_CORE_RELATIONS[65] and VIRTUE_LUT[9], formulate articulation, and route response back through Anima for re-verification."
ct: CT0
cp: "0.0"
agent_affinity: verifier
---

# Anuttara Symbolic Parse

Alignment target: the Verifier raises questions, never passes-or-fails. This skill teaches the LLM-Nara to parse the minimal symbolic-coordinate strings the Verifier emits and articulate the structural question encoded within them.

Primary contact: Anuttara Verifier (M0' 0'), with Eros (CT2) providing verification-route handoff.

## Coordinate String Grammar

The Verifier emits strings in the form:

```
#R{n}-{p/q}/{domain}-{entry}?
```

Where:
- `#R{n}` — the Anuttara relation index (0-64, referencing M0_CORE_RELATIONS[n])
- `{p/q}` — the polar coordinate position (P{n} / complement-pair encoding)
- `{domain}` — the archetypal domain tag (e.g., A-T7 = Archetype-7, V-R3 = Virtue-3, C-P{n} = Coordinate position)
- `{entry}` — the specific entry state: `pending`, `missing`, `contradiction`, `unaligned`, `unwitnessed`
- `?` — terminal: this is a question, not a judgment

Examples:
- `#R0-0/1/A-T7-pending?` → "Archetype-7 Divine-Action at TCT position — why does the trajectory not witness this?"
- `#R12-2/3/V-R3-missing?` → "Virtue-3 entry at the P2↔P3 complement pair — what structural gap prevents this from resolving?"
- `#R34-4/5/C-P4-unaligned?` → "Coordinate P4 relation — why does the formal mediation not align with the contextual arena?"

## Protocol

### 1. Tokenize

Parse the string against the grammar. Extract:
- `relation_index`: the numeric index into M0_CORE_RELATIONS
- `polar_pair`: the p/q encoding (which P-positions are in relation)
- `domain_tag`: archetype, virtue, or coordinate domain
- `entry_state`: the specific state the Verifier is questioning

If the string does not parse, emit: `#parse-failure:{raw_string}` and route back through Anima for reformulation.

### 1a. Axiom Translation Surface

When the Verifier question concerns a candidate canonical articulation rather than a single symbolic-coordinate string, emit an axiom-translation session for the ACR Pi tool surface. This is the Pi source contract for `PiAxiomTranslationInspector`; the UI reads the resulting history from `s5'.epii.axiom_translation_history` and treats this skill as the source anchor:

```
Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md
```

Session shape:

```ts
interface PiAxiomTranslationSession {
  readonly id: string;
  readonly initiatingDispatchNodeId: string;
  readonly steps: readonly AxiomTranslationStep[];
  readonly verifiedBy: 'pi' | 'human' | 'pending';
}
```

Each `AxiomTranslationStep` must preserve a four-column translation chain:

```
Philosophical English -> Formal Notation -> OWL -> SHACL
```

Required step discipline:
- `philosophicalEnglish` states the candidate articulation in natural language.
- `formalNotation` gives the minimal formal expression without collapsing the philosophical claim.
- `owl` gives the ontology-class/property expression when the claim can be carried by OWL.
- `shacl` gives the validation shape or explains why no load-bearing constraint is yet permitted.
- `transitionReasoning` records the Pi reasoning trace for the move between adjacent columns.
- `sourceSkillPath` is exactly `Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`.
- `sourceAnchor` names the section heading or coordinate string that generated the step.

Verification status law:
- `verifiedBy: 'human'` only after explicit human final validation.
- `verifiedBy: 'pi'` means Pi has checked internal translation consistency but the claim is not final canon.
- `verifiedBy: 'pending'` means the translation is inspectable but still awaits Pi or human verification.

Identity narrative for downstream renderers: Pi axiom translation moves a candidate canonical articulation from natural language through formal notation to OWL/SHACL machine-checkable form. Each translation step is a Pi tool invocation; verification is human-final for load-bearing canon.

### 2. Resolve

Look up `relation_index` in M0_CORE_RELATIONS[65]. If the index is out of range, emit `#resolve-failure:{relation_index}` and route back.

Resolve `domain_tag` against:
- `A-T{n}` → M0 Core Archetypes (the 22 Major Arcana as archetypal principles)
- `V-R{n}` → VIRTUE_LUT[9] (the nine R-virtues)
- `C-P{n}` → Coordinate positions (P0-P5, the six M-prime positions)

### 3. Formulate

The articulation must:
- Name the relation (what M0_CORE_RELATIONS[index] encodes)
- Name the polar positions in their QL semantics (P{n} function + QL refraction via L1/L1'/L4/L2')
- Name the domain entry (what archetype/virtue/coordinate is being questioned)
- State the interrogative: why is this entry in this state at this structural locus?
- Reference the specific entry state as a structural question, not a defect

Never answer the question. The articulation opens inquiry; it does not close it.

### 4. Route

After formulation, route the articulation back through Anima's verify gate:
- The response goes to the Verifier for re-check
- Max 3 verify cycles before human escalation (antitranscendental brake)
- Each cycle adds a verify-cycle counter to the response envelope

### 5. Self-Recognition

Per mental-pole-mechanics.md §0/1: the act of parsing-and-responding IS itself training signal for the LLM's own self-recognition. The skill is not a mechanical translation — it is the Verifier teaching the LLM to see the coordinate structure of its own questions.

## Result Discipline

Return the parsed articulation as a structured response:

```
#V-verify:{cycle_count}
relation: {M0_CORE_RELATIONS[relation_index].name}
polar: P{left}↔P{right} ({left_function} ↔ {right_function})
domain: {domain_tag_resolved}
entry: {entry_state}
question: {articulated interrogative}
```

Never emit pass/fail. The Verifier questions; it does not judge.

## Tool Degradation

If M0_CORE_RELATIONS or VIRTUE_LUT is unavailable at runtime:
- Fall back to the known relation names from M0'-SPEC.md
- If the epi CLI exposes `anuttara_verify`, use it
- If unavailable, emit `#degraded:{what_is_missing}` and formulate from the coordinate string alone
- Never fabricate relation content
