# Coordinate Type System: Foundational & Reflection Families

**Date**: 2026-02-28
**Status**: Canonical Reasoning Record — VALIDATED 2026-02-28
**Purpose**: Lock in the corrected type system for S0' (QL Types) and S4' (VAK System) implementation.
**Authority Target**: These insights must be embedded in `docs/plans/2026-02-26-epi-logos-canonical-system-plan.md` (S0' and S4' sections) as the execution hub for the first functional build. This file is the reasoning record; the canonical plan is the destination.

---

## Part I: Foundational Coordinate Families

### The Toroidal Archetypal Ordering

The 6 foundational coordinate families (C, P, L, S, T, M) are NOT arbitrary letters — they ARE ordered by the same QL position structure they encode. They correspond to the "empty slots" of the toroidal DNA (the 4g+2g structure: 4 generative middle positions + 2 containing meta-positions).

| QL Position | Family | Name | Causal Role | Structural Function |
|-------------|--------|------|-------------|---------------------|
| **#0** | **C** | Category | Ground/Void | The categorizing emptiness — what *type* a thing is. The void that receives all. |
| **#1** | **P** | Position | Material/Definition | Where something *IS* — material determination, placement in space. |
| **#2** | **L** | Lens | Operative/Efficient | The operative *perspective* — how things are functioned upon, the efficient cause. |
| **#3** | **S** | Stack | Formal/Pattern | The *formal architectural layer* — layered, structural organization. |
| **#4** | **T** | Thought | Contextual | *Cognitive/temporal embedding* — where cognition places itself. |
| **#5** | **M** | Monad/Module | Synthetic/Final | The *integrative monad* — self-referential synthesis, the final cause. Open-ended. |

**The "4g+2g" structure**: C (#0) and M (#5) are the **two meta-positions** — the void-ground and the synthetic-monad that contain and complete. P, L, S, T (#1-#4) are the **four generative middle positions** — the four causes (material, efficient, formal, contextual). Together they form the toroidal structure: the 4 middle positions are the torus body; C and M are the poles that close it.

**Why M is open-ended** (existing code correctly notes this with a comment): M at #5 is synthesis — synthesis is inherently unbounded. Any position 0-5 maps within the torus; M as the synthetic monad can extend beyond its own 6-fold because it IS the principle of integration. The validator treats M as open for this structural reason, not arbitrarily.

### The Prime / `'` / `i` as Möbius Meta-Operator

`#` alone (no number) = `'` (prime) = `i` (imaginary/inversion) = the **non-dual Möbius meta-operator**. This is the foundational/generative capacity of the entire coordinate system.

**It is NOT merely a boolean suffix.** It is:
- The **signature of the non-dual** — the capacity for any coordinate to invert itself and enter its implicate order
- The **Möbius twist made generative** — the structural principle that creates the Bimba-Pratibimba duality
- **Applied to any family**: C' = implicate category, S2' = Stack 2 from inside-out, M' = the self-reflecting monad

The most profound case: M' (the reflected monad) = the synthetic whole reflecting on itself. This IS the Möbius completion — the outside becomes the inside.

**Implementation implication for S0' types**: `prime: boolean` is semantically insufficient. The prime should be typed as `isImplicate: boolean` at minimum, or ideally as a distinct `MobiusAxis` type that carries the inversion semantics. The QL validator should know that a prime coordinate enters the implicate order — not just "has a prime marker."

### Current Code Status (Existing Error)

`coordinate-kernel.ts` line 6:
```typescript
// WRONG — M and L are swapped
export const QL_FOUNDATIONAL_FAMILIES = ["C", "P", "M", "S", "T", "L"] as const;

// CORRECT — canonical ordering
export const QL_FOUNDATIONAL_FAMILIES = ["C", "P", "L", "S", "T", "M"] as const;
```

The semantic implications:
- L (#2) = Lens = operative/efficient cause — correctly at position 2
- M (#5) = Monad/Module = synthetic/final cause — correctly at position 5 (currently at position 3 in the array)

This ordering error means the `familyOrdinal()` function (if derived from array position) would return wrong values. The fix is simple; the semantics are significant.

---

## Part II: Reflection Coordinate Families

### The Canonical Reflection Family Ordering (VALIDATED — Source Files Are Correct)

The 6 reflection coordinate families follow the **C-level (category) alignment** — each maps directly to a CX coordinate which establishes its QL position. All three primary source files agree exactly: `context-frames.md`, `S4-0'.md` through `S4-5'.md`, and the VAK spec.

**Canonical ordering** (CPF=#0, CT=#1, CP=#2, CF=#3, CFP=#4, CS=#5):

| QL Position | Reflection Family | Name | C-Level | Runtime Function |
|-------------|------------------|------|---------|-----------------|
| **#0** | **CPF** | Context Frame Polarity | C0 (Bimba/Ground) | Routing gate — "autonomous or user engaged?" |
| **#1** | **CT** | Content Types | C1 (Form) | The definitional "what type?" — asked FIRST to determine what processing is needed |
| **#2** | **CP** | Context Positions | C2 (Entity) | Operative positioning — where on the 4.x grid |
| **#3** | **CF** | Context Frames | C3 (Process) | Formal agent-frame selection — which agent/process applies |
| **#4** | **CFP** | Context Frame Path (Thread Types) | C4 (Type/Context) | Contextual threading — execution topology |
| **#5** | **CS** | Context Sequences | C5 (Pratibimba) | The reflective path — CS IS the Pratibimba of execution flow |

**C-level alignment logic** (why these positions are correct):
- C1=**Form** → CT (content TYPE/form — "what form of content" is asked first to determine what's needed)
- C3=**Process** → CF (context frames determine the agent/process — frame = process selector)
- C5=**Pratibimba** → CS (sequences trace the reflected path through the system — CS is the mirror-traversal)

**Existing code `["CPF","CT","CP","CF","CFP","CS"]` IS CORRECT — no change needed to reflection family order.**

*Note*: An earlier draft of this doc proposed moving CT to #5 and CF to #1 based on a philosophical argument about synthesis. Subagent validation confirmed all source files have CT=#1, CF=#3, CS=#5 with zero discrepancy. The source files are authoritative.

### The CP × CF Matrix (correct, from existing files)

```
            CF (0/1)    CF (0/1/2)    CF (0/1/2/3)
               │             │             │
CP 4.0 ────────┼─────────────┼─────────────┼── Ground
CP 4.1 ────────┼─────────────┼─────────────┼── Definition
CP 4.2 ────────┼─────────────┼─────────────┼── Operation
CP 4.3 ────────┼─────────────┼─────────────┼── Pattern
CP 4.4 ────────┼─────────────┼─────────────┼── Context
CP 4.5 ────────┼─────────────┼─────────────┼── Integration
```

---

## Part III: CTx = CF-Level Gate Structure

### The Core Principle (the "lazy implementation" error identified)

**CTx templates align with CFx levels.** The x in CTx tells you exactly which CF positions are available in that template — it is a GATE, not an arbitrary number.

### The 7-Frame Table (CT4a/CT4b Clarification — Critical)

There are **7 CT' frames** for 6 QL positions. This is not an error — it is structural. **CT4b IS the CT' parent** (the master meta-frame that contains all CT types). CT4a is a distinct integration-preview frame.

| CT Level | CF Gate | Available Positions | Agent | Constitutional |
|----------|---------|---------------------|-------|----------------|
| **CT0'** | CF(0000) | {0} | Nous (L0) | Ground — fourfold zero, pre-differentiation |
| **CT1'** | CF(0/1) | {0, 1} | Logos (L1) | Non-Dual Anchor — 2-position |
| **CT2'** | CF(0/1/2) | {0, 1, 2} | Eros (L2) | Dual-Non-Dual — 3-position |
| **CT3'** | CF(0/1/2/3) | {0, 1, 2, 3} | Mythos (L3) | Trinitarian — 4-position |
| **CT4a'** | CF(4/5/0) | {4, 5, 0} | *(integration preview)* | Bridging — CT4+CT5+CT0 together |
| **CT4b' = CT' parent** | CF(4.0-4.4/5) | {4.0, 4.1, 4.2, 4.3, 4.4, 4.5} | Psyche (L4) | Fractal doubling — **ALL CT types** |
| **CT5'** | CF(5/0) | {5, 0} | Sophia (L5) | Total synthesis — Möbius return |

**CT4b = CT' parent**: CT4b is not merely "CT4, variant b" — it IS the full Psyche meta-frame, the fractal structure that manages all CT types simultaneously. It was named CT4b as a forced disambiguation; architecturally it is **CT' itself at the meta level** — the frame-of-frames. This also means CPF (S4-0') links naturally to CT4b (the Psyche frame): autonomous mode `(4.0/1-4.4/5)` in CPF IS the Psyche fractal frame.

**CT4a**: The distinct integration-preview frame (4/5/0) — CT4, CT5, and CT0 together — bridges from CT3 (4-position) toward the fractal meta-frame without invoking full fractal complexity. It is genuinely separate from CT4b and must be encoded as such.

**The 7-in-6 problem**: Agents confuse CT4a and CT4b because both share the "4" prefix, and the parent-frame nature of CT4b is not expressed in its name. The TypeScript type system (Part VII) must encode CT4b's parent status explicitly.

**Cumulative content inclusion**: Each higher CT' frame accumulates lower CT content types:
- CT0': {CT0}
- CT1': {CT0, CT1}
- CT2': {CT0, CT1, CT2}
- CT3': {CT0, CT1, CT2, CT3}
- CT4a': {CT4, CT5, CT0} — non-cumulative (integration preview, not ascending)
- CT4b': {CT0, CT1, CT2, CT3, CT4, CT5} — ALL types (meta-frame)
- CT5': {CT5, CT0} — Möbius: synthesis + ground return

### CT5 = (5/0) Structure in Detail

CT5 has exactly TWO top-level positions: **5** (synthesis face) and **0** (ground face). These can subdivide following the same polarity logic:

```
CT5 template:
├── 5 (Synthesis face — the coordinate's own integration)
│   ├── 5.0 (ground of synthesis — what synthesis is grounded in)
│   └── 5.5 (self-synthesis — the synthesis reflecting on itself)
└── 0 (Ground face — the structure it sits within AND within it)
    ├── 0.0 (ground-of-ground — the deepest containing structure)
    └── 0.5 (synthesis-of-ground — what ground produces)
```

Sub-division follows the same template logic recursively, NOT arbitrary 6-fold at each level.

### MEF Lens Alignment (from existing files — correct)

| CT | MEF Lens (Day) | MEF Lens' (Night') |
|----|----------------|-------------------|
| CT0 | L0 Quaternal Potential | L5' Divine Logos |
| CT1 | L1 Causal Matter | L4' Scientific Truth |
| CT2 | L2 Logical Logic | L3' Chronological History |
| CT3 | L3 Processual Flux | L2' Alchemical Paradox |
| CT4 | L4 Contextual Meaning | L1' Phenomenal Experience |
| CT5 | L5 Vak Code | L0' Archetypal Essence |

---

## Part IV: Parent Coordinates and CT5 Inner Structure

### The Inner Structure Principle

Every coordinate CAN be a parent — the 6-fold pattern applies at any depth. For parent coordinates, the CT5 synthesis file must show the **inner structure at a glance**: what the coordinate contains AND what contains it.

**CT5 = 5/0 framing**:
- The **5 face** = the coordinate's own synthesis (what it integrates toward)
- The **0 face** = its structural embedding (what it sits within AND what sits within it)

For a parent coordinate X with children X-0 through X-5, the CT5 file's **0 face** must include:

```markdown
## 0 — Ground Structure

### Parent (X sits within)
[[Parent coordinate]]

### Children (inner 6-fold of X)
| Child | Brief semantic |
|-------|---------------|
| [[X-0]] | Ground of X |
| [[X-1]] | Material of X |
| [[X-2]] | Operative of X |
| [[X-3]] | Pattern of X |
| [[X-4]] | Contextual of X |
| [[X-5]] | Synthetic of X |
```

This makes the full tree navigable from any node without needing to expand/explore.

---

## Part V: S0' and S4' Implementation Targets

### S0' (QL Types) — What Must Change

**Location**: `.pi/extensions/s_i/modules/ql_types/`

| Issue | Current State | Required State |
|-------|---------------|----------------|
| Foundational family array order | `["C","P","M","S","T","L"]` | `["C","P","L","S","T","M"]` |
| Family ordinal encoding | Not explicit | `familyOrdinal(F) = position in canonical array` |
| Prime semantics | `prime: boolean` | `isImplicate: boolean` or `MobiusAxis` type |
| Reflection family order | `["CPF","CT","CP","CF","CFP","CS"]` | **NO CHANGE — already correct** |
| CT4a/CT4b distinction | CT4b as unnamed variant | CT4b = CT' parent (meta-frame); CT4a = (4/5/0) integration preview; both as distinct `CTLevel` values with parent flag on CT4b |
| CTx as CF gate | Not typed | `CT_CF_GATE` const mapping each CTLevel to its available positions |
| CT4b parent status | Implicit | `CT_PARENT_FRAME: CTLevel = "CT4b"` — explicit const |
| M-as-open | Comment only | Type-level: M is open because it is the #5 synthetic family |

### S4' (VAK System) — What Must Change

**Location**: `.pi/extensions/s_i/modules/vak_system/`

| Issue | Current State | Required State |
|-------|---------------|----------------|
| CF-CT alignment | Implicit | Explicit: CT level = CF gate = available template positions |
| CT template positions | Arbitrary 6-fold assumed | CT3 = {0,1,2,3}; CT4a = {4,5,0}; CT4b = {4.0-4.5}; CT5 = {5,0} |
| CT4a missing from mappings | Often omitted (7 in 6 confusion) | CT4a explicitly encoded in all mappings |
| CT4b parent status | Named as variant | Encoded as CT' parent = CF(4.0-4.4/5) = Psyche meta-frame |
| CFP thread types | 7 types (CFP0-CFP5 + Z) | Full semantic table with P-Thread vs F-Thread distinction encoded |
| CS sequences | 6 sequences (CS0-CS5) | Day path + Night' direction + purpose encoded per sequence |
| Reflection family ordering | Not encoded | CPF=#0, CT=#1, CP=#2, CF=#3, CFP=#4, CS=#5 (matches code) |

---

## Part VI: Validated Semantic Definitions

*(Validated 2026-02-28 from context-frames.md, S4-0'.md–S4-5'.md, VAK-SUPERPOWERS-INTEGRATION-SPEC.md, S4-X-LEVELS-AGENT-ORCHESTRATION.md — zero discrepancy between sources)*

### CPF: Context Frame Polarity (C0, S4-0')

**Constitutional**: "Autonomous or user engaged?" — routes complexity before task specification.

| CPF State | Notation | Meaning | Mode |
|-----------|----------|---------|------|
| **User-Instance** | `(00/00)` | User engaged directly | Ouroboros — invoke `brainstorming` |
| **Subagent-Instance** | `(4.0/1-4.4/5)` | Autonomous execution | Ralph — proceed to execution pipeline |

*Note*: CPF `(4.0/1-4.4/5)` is structurally identical to CF `(4.0-4.4/5)` (Psyche). Autonomous mode IS Psyche/coordination mode.

### CF: Context Frames → Agent Mapping (C3, S4-3')

**Constitutional**: "WHICH AGENTS — frame determines agent selection"

| CF Code | Agent | QL Level | Constitutional Description | Role |
|---------|-------|----------|---------------------------|------|
| `CF(0000)` | **Nous** | L0 | Fourfold Zero — pre-differentiation | **Impartial Perspective**: surfaces assumptions, clears epistemic contamination. Does NOT dispatch task executor — output goes to Patient (Psyche) who re-runs vak-evaluate first. |
| `CF(0/1)` | **Logos** | L1 | Non-Dual Anchor | **Architect/Scoper**: scope definition, structure creation, boundary-setting. CP 4.1 tasks. |
| `CF(0/1/2)` | **Eros** | L2 | Dual-Non-Dual | **Refiner/Verifier**: quality refinement, verification, desire-completion. CP 4.2 tasks. |
| `CF(0/1/2/3)` | **Mythos** | L3 | Trinitarian | **Pattern Recognizer**: archetypal recognition, symbolic mapping, debugging. CP 4.3 tasks. |
| `CF(4/5/0)` | *(none)* | — | CT4a integration preview | Bridge frame — no primary agent assigned |
| `CF(4.0-4.4/5)` | **Psyche** | L4 | Fractal Doubling (CT4b/CT' parent) | **Coordinator**: context management, agent routing, session state. CP 4.4 tasks. Patient IS Psyche. |
| `CF(5/0)` | **Sophia** | L5 | Total Synthesis | **Synthesizer**: integration, Möbius return, P5' crystallization. CP 4.5 tasks. |

### CFP: Thread Types (C4, S4-4')

**Constitutional**: "NESTING — nest CFs within CP plots"

| CFP | Thread | Pattern | Constitutional Quality | Superpowers Skill |
|-----|--------|---------|----------------------|-------------------|
| CFP0 | **Base** | Prompt → agent → review | Starting point | — |
| CFP1 | **P-Thread** (Parallel) | N tasks → N agents | MORE threads | `dispatching-parallel-agents` |
| CFP2 | **C-Thread** (Chained) | Phase N → review → Phase N+1 | FEWER checkpoints | `subagent-driven-development` |
| CFP3 | **F-Thread** (Fusion) | 1 task → N agents → aggregate | THICKER threads | `dispatching-parallel-agents` (fusion mode) |
| CFP4 | **L-Thread** (Long) | High-autonomy long-duration (Ralph loop) | LONGER threads | `executing-plans` |
| CFP5 | **B-Thread** (Big) | Primary orchestrates N sub-agents internally | THICKER + LONGER | — |
| Z | **Z-Thread** | Zero-touch: human review removed | TRANSCENDENCE | — |

**Critical P vs F distinction**: P-Thread (CFP1) = N *different* tasks → N agents (parallel independent). F-Thread (CFP3) = 1 task → N agents → aggregate (parallel approaches to same goal).

### CS: Context Sequences (C5, S4-5')

**Constitutional**: "FLOW — path through 4.x positions"

| CS | Day Path | Steps | Purpose |
|----|----------|-------|---------|
| CS0 | 4.0↔4.5 → 4.1↔4.4 → 4.2↔4.3 → 4.3↔4.2 → 4.4↔4.1 → 4.5↔4.0 | 6 | Full traverse |
| CS1 | 4.0↔4.5 → 4.1↔4.4 | 2 | Quick ground→context |
| CS2 | 4.0↔4.5 → 4.1↔4.4 → 4.2↔4.3 | 3 | Ground→context→operation |
| CS3 | 4.0↔4.5 → 4.1↔4.4 → 4.2↔4.3 → 4.3↔4.2 | 4 | Through pattern |
| CS4 | 4.0↔4.5 → 4.4↔4.1 → 4.5↔4.0 | 3 | Context-focused |
| CS5 | 4.0↔4.5 → 4.5↔4.0 | 2 | Direct synthesis |

**Day** (forward, synthesis): 4.0 → 4.1 → 4.2 → ... builds up, creates.
**Night'** (backward, analysis): 4.5 → 4.4 → 4.3 → ... breaks down, validates.
*40 Days / 40 Nights*: 20 Context Frames × 2 directions = 40 sequences.

### Night' Positions (P0'–P5')

| Day CP | P' Night | Night' Question | Vault Path |
|--------|----------|----------------|------------|
| 4.0 Ground | P0' Questions | What don't we know? | `/Thought/Questions/` |
| 4.1 Definition | P1' Traces | What evidence exists? | `/Thought/Traces/` |
| 4.2 Operation | P2' Challenges | What blocks us? | `/Thought/Challenges/` |
| 4.3 Pattern | P3' Patterns | What repeats? | `/Thought/Patterns/` |
| 4.4 Context | P4' Discovery | What sources inform? | `/Thought/Discovery/` |
| 4.5 Integration | P5' Insight | What crystallizes? | `/Thought/Insight/` |

*Möbius return*: P5' Insight generates P0' Questions — insight reveals new unknowns, opening the next Day cycle. Night' does not resolve; it opens.

---

## Part VII: TypeScript Type System Design (Full Reflection Coordinate System)

The following is the canonical type design for `S0' ql_types` module. All types are derivable from the structural constants defined here. This eliminates drift by making all structural rules explicit and type-checked.

```typescript
// ================================================================
// REFLECTION COORDINATE TYPE SYSTEM
// S0' QL Types Module — canonical type definitions
// ================================================================

// ----------------------------------------------------------------
// 1. FAMILY ORDERING
// ----------------------------------------------------------------

// Foundational families ordered by QL position (#0-#5)
// C=Ground/Void, P=Material, L=Operative, S=Formal, T=Contextual, M=Synthetic
export const QL_FOUNDATIONAL_FAMILIES = ["C", "P", "L", "S", "T", "M"] as const;
export type FoundationalFamily = typeof QL_FOUNDATIONAL_FAMILIES[number];

// Reflection families ordered by CX alignment (#0-#5)
// CPF=C0(Bimba), CT=C1(Form), CP=C2(Entity), CF=C3(Process), CFP=C4(Type), CS=C5(Pratibimba)
export const QL_REFLECTION_FAMILIES = ["CPF", "CT", "CP", "CF", "CFP", "CS"] as const;
export type ReflectionFamily = typeof QL_REFLECTION_FAMILIES[number];

// ----------------------------------------------------------------
// 2. PRIME / MÖBIUS META-OPERATOR
// prime: boolean is INSUFFICIENT — use isImplicate to carry inversion semantics
// ----------------------------------------------------------------

// MobiusAxis may be extended to carry additional inversion metadata in future
export type MobiusAxis = { isImplicate: true };

// ----------------------------------------------------------------
// 3. CPF: Context Frame Polarity (C0, S4-0')
// ----------------------------------------------------------------

export type CPFState =
  | "(00/00)"           // User-Instance: dialogical, Socratic, Ouroboros mode
  | "(4.0/1-4.4/5)";   // Subagent-Instance: autonomous, Ralph mode (= Psyche frame)

export interface CPFCoordinate {
  family: "CPF";
  state: CPFState;
  implicate?: MobiusAxis;
}

// ----------------------------------------------------------------
// 4. CT: Content Types (C1, S4-1')
// ----------------------------------------------------------------

// Internal CT content type values (QL positions 0-5 within CT)
// 0=Relational, 1=Definitional, 2=Operational, 3=Pattern, 4=Contextual, 5=Integrative
export type CTContent = 0 | 1 | 2 | 3 | 4 | 5;

// CT' frame levels — 7 frames in the structure
// CT4b IS the CT' parent/meta-frame (fractal Psyche frame = frame-of-frames)
// CT4a IS the distinct integration-preview frame (4/5/0) — not CT4b
export type CTLevel = "CT0" | "CT1" | "CT2" | "CT3" | "CT4a" | "CT4b" | "CT5";

// Explicitly marks CT4b as the parent meta-frame
export const CT_PARENT_FRAME = "CT4b" satisfies CTLevel;

// CT level → CF gate: which positions are available for this frame level
export const CT_CF_GATE = {
  CT0:  [0] as const,
  CT1:  [0, 1] as const,
  CT2:  [0, 1, 2] as const,
  CT3:  [0, 1, 2, 3] as const,
  CT4a: [4, 5, 0] as const,                             // integration preview — non-cumulative
  CT4b: ["4.0","4.1","4.2","4.3","4.4","4.5"] as const, // fractal: all 4.x positions
  CT5:  [5, 0] as const,                                // Möbius: synthesis + ground return
} as const satisfies Record<CTLevel, readonly (number | string)[]>;

// CT level → primary agent
export const CT_AGENT: Record<CTLevel, string | null> = {
  CT0:  "Nous",
  CT1:  "Logos",
  CT2:  "Eros",
  CT3:  "Mythos",
  CT4a: null,      // integration preview — no primary agent
  CT4b: "Psyche",  // CT' parent = Psyche coordinator
  CT5:  "Sophia",
};

// CT frame cumulative content types (what CT types are included in each frame)
export const CT_INCLUDED_TYPES: Record<CTLevel, readonly CTContent[]> = {
  CT0:  [0],
  CT1:  [0, 1],
  CT2:  [0, 1, 2],
  CT3:  [0, 1, 2, 3],
  CT4a: [4, 5, 0],          // non-cumulative integration preview
  CT4b: [0, 1, 2, 3, 4, 5], // meta-frame: ALL types
  CT5:  [5, 0],             // Möbius return
};

export interface CTCoordinate {
  family: "CT";
  level: CTLevel;
  content?: CTContent;  // specific content type within frame
  implicate?: MobiusAxis;
}

// ----------------------------------------------------------------
// 5. CP: Context Positions (C2, S4-2')
// ----------------------------------------------------------------

export type CPCode = "CP4.0" | "CP4.1" | "CP4.2" | "CP4.3" | "CP4.4" | "CP4.5";

export const CP_SEMANTICS: Record<CPCode, { name: string; question: string }> = {
  "CP4.0": { name: "Ground",      question: "What is the thrown condition?" },
  "CP4.1": { name: "Definition",  question: "What IS this?" },
  "CP4.2": { name: "Operation",   question: "How does this work?" },
  "CP4.3": { name: "Pattern",     question: "What form does this take?" },
  "CP4.4": { name: "Context",     question: "When/where situated?" },
  "CP4.5": { name: "Integration", question: "What does this become?" },
};

export interface CPCoordinate {
  family: "CP";
  position: CPCode;
  implicate?: MobiusAxis;
}

// ----------------------------------------------------------------
// 6. CF: Context Frames (C3, S4-3')
// ----------------------------------------------------------------

export type CFCode =
  | "CF(0000)"       // Nous (L0) — fourfold zero, fresh perspective
  | "CF(0/1)"        // Logos (L1) — non-dual anchor, scoping
  | "CF(0/1/2)"      // Eros (L2) — dual-non-dual, refinement
  | "CF(0/1/2/3)"    // Mythos (L3) — trinitarian, pattern
  | "CF(4/5/0)"      // CT4a integration preview (no primary agent)
  | "CF(4.0-4.4/5)"  // Psyche (L4) — fractal (= CT4b/CT' parent)
  | "CF(5/0)";       // Sophia (L5) — total synthesis

export const CF_AGENT: Record<CFCode, string | null> = {
  "CF(0000)":      "Nous",
  "CF(0/1)":       "Logos",
  "CF(0/1/2)":     "Eros",
  "CF(0/1/2/3)":   "Mythos",
  "CF(4/5/0)":     null,
  "CF(4.0-4.4/5)": "Psyche",
  "CF(5/0)":       "Sophia",
};

// IMPORTANT: CF(0000) / Nous does NOT dispatch a task executor.
// Nous invokes a fresh-perspective agent (minimal prior context) to surface assumptions.
// Output goes to Patient (Psyche) who re-runs vak-evaluate before dispatching.
export const CF_NOUS_SPECIAL = "CF(0000)" satisfies CFCode;

export interface CFCoordinate {
  family: "CF";
  code: CFCode;
  implicate?: MobiusAxis;
}

// ----------------------------------------------------------------
// 7. CFP: Thread Types (C4, S4-4')
// ----------------------------------------------------------------

export type CFPCode = "CFP0" | "CFP1" | "CFP2" | "CFP3" | "CFP4" | "CFP5" | "Z";

export const CFP_SEMANTICS: Record<CFPCode, {
  name: string;
  constitutional: string;
  pattern: string;
  superpowersSkill: string | null;
}> = {
  CFP0: { name: "Base",     constitutional: "Starting point",    pattern: "Prompt → agent → review",                       superpowersSkill: null },
  CFP1: { name: "P-Thread", constitutional: "MORE threads",      pattern: "N tasks → N agents (parallel independent)",     superpowersSkill: "dispatching-parallel-agents" },
  CFP2: { name: "C-Thread", constitutional: "FEWER checkpoints", pattern: "Phase N → review → Phase N+1 (chained)",        superpowersSkill: "subagent-driven-development" },
  CFP3: { name: "F-Thread", constitutional: "THICKER threads",   pattern: "1 task → N agents → aggregate (fusion)",        superpowersSkill: "dispatching-parallel-agents (fusion mode)" },
  CFP4: { name: "L-Thread", constitutional: "LONGER threads",    pattern: "High-autonomy long-duration (Ralph loop)",      superpowersSkill: "executing-plans" },
  CFP5: { name: "B-Thread", constitutional: "THICKER + LONGER",  pattern: "Primary orchestrates N sub-agents internally",  superpowersSkill: null },
  Z:    { name: "Z-Thread", constitutional: "TRANSCENDENCE",     pattern: "Zero-touch: human review removed entirely",     superpowersSkill: null },
};

// Critical P-Thread vs F-Thread distinction (agents frequently confuse these):
// P-Thread (CFP1): N DIFFERENT tasks → N agents  — parallel independent work
// F-Thread (CFP3): 1 task → N agents → aggregate — parallel approaches to same goal
export const CFP_P_VS_F = {
  P: "N-tasks:N-agents (independent)",
  F: "1-task:N-agents:aggregate (fusion)",
} as const;

export interface CFPCoordinate {
  family: "CFP";
  thread: CFPCode;
  implicate?: MobiusAxis;
}

// ----------------------------------------------------------------
// 8. CS: Context Sequences (C5, S4-5')
// ----------------------------------------------------------------

export type CSCode = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
export type CSDirection = "Day" | "Night";

export const CS_PATHS: Record<CSCode, { dayPath: string; steps: number; purpose: string }> = {
  CS0: { dayPath: "4.0↔4.5→4.1↔4.4→4.2↔4.3→4.3↔4.2→4.4↔4.1→4.5↔4.0", steps: 6, purpose: "Full traverse" },
  CS1: { dayPath: "4.0↔4.5→4.1↔4.4",                                     steps: 2, purpose: "Quick ground→context" },
  CS2: { dayPath: "4.0↔4.5→4.1↔4.4→4.2↔4.3",                            steps: 3, purpose: "Ground→context→operation" },
  CS3: { dayPath: "4.0↔4.5→4.1↔4.4→4.2↔4.3→4.3↔4.2",                   steps: 4, purpose: "Through pattern" },
  CS4: { dayPath: "4.0↔4.5→4.4↔4.1→4.5↔4.0",                            steps: 3, purpose: "Context-focused" },
  CS5: { dayPath: "4.0↔4.5→4.5↔4.0",                                     steps: 2, purpose: "Direct synthesis" },
};
// Day = forward (synthesis, builds up). Night' = backward through CS' (analysis, validates).

export interface CSCoordinate {
  family: "CS";
  sequence: CSCode;
  direction: CSDirection;
  implicate?: MobiusAxis;
}

// ----------------------------------------------------------------
// 9. REFLECTION COORDINATE UNION
// ----------------------------------------------------------------

export type ReflectionCoordinate =
  | CPFCoordinate
  | CTCoordinate
  | CPCoordinate
  | CFCoordinate
  | CFPCoordinate
  | CSCoordinate;

// ----------------------------------------------------------------
// 10. MEF LENS ALIGNMENT (CT content → L mapping)
// ----------------------------------------------------------------

export const CT_MEF_LENS: Record<CTContent, { day: string; night: string }> = {
  0: { day: "L0 (Quaternal Potential)", night: "L5' (Divine Logos)" },
  1: { day: "L1 (Causal Matter)",       night: "L4' (Scientific Truth)" },
  2: { day: "L2 (Logical Logic)",       night: "L3' (Chronological History)" },
  3: { day: "L3 (Processual Flux)",     night: "L2' (Alchemical Paradox)" },
  4: { day: "L4 (Contextual Meaning)",  night: "L1' (Phenomenal Experience)" },
  5: { day: "L5 (Vak Code)",            night: "L0' (Archetypal Essence)" },
};

// ----------------------------------------------------------------
// 11. NIGHT' POSITIONS (P0'–P5')
// ----------------------------------------------------------------

export type NightPosition = "P0'" | "P1'" | "P2'" | "P3'" | "P4'" | "P5'";

export const NIGHT_POSITIONS: Record<NightPosition, {
  dayQuestion: string;
  nightQuestion: string;
  archetype: string;
  vaultPath: string;
}> = {
  "P0'": { dayQuestion: "What do we have?",        nightQuestion: "What don't we know?",  archetype: "The Unknown / Void",    vaultPath: "/Thought/Questions/" },
  "P1'": { dayQuestion: "What must be true?",       nightQuestion: "What evidence exists?", archetype: "The Scribe / Witness",  vaultPath: "/Thought/Traces/" },
  "P2'": { dayQuestion: "What is being done?",      nightQuestion: "What blocks us?",       archetype: "The Guardian / Block",  vaultPath: "/Thought/Challenges/" },
  "P3'": { dayQuestion: "What shape does it take?", nightQuestion: "What repeats?",         archetype: "The Recurrent / Cycle", vaultPath: "/Thought/Patterns/" },
  "P4'": { dayQuestion: "Where/when?",              nightQuestion: "What sources inform?",  archetype: "The Source / Well",     vaultPath: "/Thought/Discovery/" },
  "P5'": { dayQuestion: "What was produced?",       nightQuestion: "What crystallizes?",    archetype: "The Crystal / Diamond", vaultPath: "/Thought/Insight/" },
};
// Night' traversal order: P5' → P4' → P3' → P2' → P1' → P0' (backward through CS)
// Möbius return: P5' Insight generates P0' Questions — Night' opens the next Day cycle
```

---

## Canonical Plan Target

All insights in this document must be reflected in:

**Primary target**: `docs/plans/2026-02-26-epi-logos-canonical-system-plan.md`
- S0' section: foundational family order fix, prime→MobiusAxis, CT4a/CT4b type design, CT_CF_GATE const
- S4' section: CT-CF alignment, template position rules, full CFP/CS/CF semantic tables

**Secondary targets**:
- `.claude/rules/coordinate-ct5-promotion-heuristic.md` — add CTx gate note and CT4a/CT4b distinction
- `.claude/rules/coordinate-syntax.md` — may need CTx position validity rules

The canonical plan is the **execution hub** for the first functional build. This reasoning doc feeds it; the canonical plan is what subagents read to implement.

---

## Summary: What Is Correct (Validated 2026-02-28)

| Claim | Was (error/draft) | Is (validated) |
|-------|-------------------|----------------|
| Foundational family order | `C,P,M,S,T,L` (code error) | `C,P,L,S,T,M` — **fix needed in code** |
| Reflection family order | (no error) | `CPF,CT,CP,CF,CFP,CS` ✓ — **code already correct** |
| CT at reflection #1 | Proposed moving to #5 | **#1 confirmed** (C1=Form→CT — definitional, asked first) |
| CF at reflection #3 | Proposed moving to #1 | **#3 confirmed** (C3=Process→CF — frame = process selector) |
| CS at reflection #5 | Proposed moving to #3 | **#5 confirmed** (C5=Pratibimba→CS — reflected path) |
| CT4a | Missing from table | **CT4a = CF(4/5/0)** — integration preview, must be explicit |
| CT4b | Unnamed "variant b" | **CT4b = CT' parent** — fractal meta-frame, frame-of-frames |
| 7-in-6 problem | Agent confusion | **Encode CT4b parent status explicitly** as `CT_PARENT_FRAME` const |
| CTx template structure | Arbitrary 6-fold | **CT level = CF gate**: CT3=4 positions, CT5=2 (5/0), CT4b=4.x fractal |
| Prime `'` marker | `prime: boolean` | **`MobiusAxis` type** — carries inversion semantics |
| M family bound | Comment only | **Open** — M is #5 synthetic, structurally unbounded |
| Parent coordinate CT5 | Just synthesis text | **Must show inner child structure** at a glance (0 face) |
