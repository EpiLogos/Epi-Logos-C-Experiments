---
name: m-coordinate-mapping
description: Rigorous M-coordinate dataset analysis workflow. Maps Neo4j Bimba node/relation data into refined Pillar II sub-FRs for the Epi-Logos C memory architecture. One M-branch at a time, dialogical, verbose surfacing.
---

# M-Coordinate Memory Architecture Mapping

## Purpose

Translate the Neo4j Bimba ontology datasets (nodes + relations per M-branch) into refined Functional Requirements (sub-FRs) that extend the Pillar II section of the spec (`Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/epi-logos-c-spec-gemini-03-03-2026.md`).

Each M-branch (M0-M5) gets a sub-FR series: **FR 2.N.0 through FR 2.N.5**, where N is the M-coordinate index. These sub-FRs define the precise C memory structures, `.rodata` layouts, bitfield semantics, pointer topologies, and operational flows dictated by the ontological content of each branch.

## Inputs (per M-branch invocation)

| Input | Location | Purpose |
|-------|----------|---------|
| **Node dataset** | `Idea/Bimba/Map/datasets/nodes_{name}.json` | Every coordinate node in the M-branch with full ontological content |
| **Relation dataset** | `Idea/Bimba/Map/datasets/relations_{name}.json` | Every edge (HAS_INTERNAL_COMPONENT, EXHIBITS_META_PATTERN, etc.) |
| **Existing M-plan** | `Idea/Bimba/Seeds/M/M{N}'/Legacy/plans/M{N}-C-architecture.md` | Previous architectural translation (starting point, not gospel) |
| **Spec file** | `Idea/Bimba/Seeds/S/S4/S4'/Legacy/specs/epi-logos-c-spec-gemini-03-03-2026.md` | The FR 2.N top-level requirement to be decomposed |
| **Gemini chat** | `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/gemini-planning-full-chat-03-03-2026.md` | Full design evolution context (later = more aligned, but earlier has key details) |
| **CLAUDE.md** | `CLAUDE.md` | Canonical architectural invariants and struct definitions |
| **Bimba MCP** | Live Neo4j graph access | For cross-referencing and validating coordinate relationships |

## Output

A single refined document per M-branch:
- **Location:** `Idea/Bimba/Seeds/M/M{N}'/Legacy/plans/M{N}-C-architecture.md` (update in place)
- **Structure:** FR 2.N.0 through FR 2.N.5, each containing:
  - **Requirement** (what the C code MUST do)
  - **Ontological Ground** (which Bimba coordinates mandate this)
  - **Formulation Analysis** (extracted formulation strings, identified formal system type, mapped C structure candidates — see Formulation-Awareness below)
  - **C Structure** (concrete struct/union/bitfield/LUT definition in pseudocode)
  - **Pointer Topology** (what points where, tagged pointer semantics)
  - **Relation Map** (which Neo4j edges become which C pointers — scoped per Relation Scoping below)
  - **Operational Flow** (how this sub-structure participates in the Torus walk / Lemniscate dive)

## Workflow (STRICT — follow in order)

### Phase 1: Dataset Ingestion
1. Read the full node dataset (`nodes_{name}.json`)
2. Read the full relation dataset (`relations_{name}.json`)
3. Read the existing M-plan (`Idea/Bimba/Seeds/M/M{N}'/Legacy/plans/M{N}-C-architecture.md`)
4. **Extract all `formulation` fields** — for every node in the dataset, collect the `formulation` string verbatim. Formulations are FIRST-CLASS inputs: they contain precise mathematical-symbolic notation that defines the OPERATIONAL nature of each branch. Nodes are not merely descriptive metadata — they hold specific formal language definitions. Group formulations by coordinate depth and identify their formal system type (operator lexicon, arithmetic reduction, concrescence algorithm, combinatorial permutation pattern, number-theoretic formula, pronominal grammar, polarity algebra, etc.).
5. **Surface to user:** Summary of dataset shape — node count, relation count, max depth, relation type distribution — AND a collated formulation table (coordinate → formulation string → tentative formal system type). Identify any surprising or novel structures not captured in the existing plan.

### Phase 2: Structural Analysis
6. Map the branch tree: identify all coordinates, their depth, and parent-child structure
7. Classify relation types and their frequency — which are structural (HAS_INTERNAL_COMPONENT), which are cross-branch (ZERO_ONE_UNITY, SUCCEEDED_BY_AND_MANIFESTS_THROUGH), which are self-referential (EXHIBITS_META_PATTERN). Apply relation scoping (see Relation Scoping section): process in-scope structural and semantic relations now; flag high-fanout cross-branch correspondence edges for deferral.
8. **Deepen formulation analysis:** For each formulation identified in Phase 1, map the syntax to concrete C structure candidates. Apply the odd/even cardinality heuristic: **odd-cardinality systems have a 0/1 singularity position** (a fused non-dual anchor at position 0 that collapses the binary), with remaining positions counting from 2 onward; **even-cardinality systems** distribute evenly. This heuristic governs whether a position-enum needs a `FUSED_GROUND` sentinel, whether a union needs an extra discriminant tag, or whether a bitfield needs an asymmetric layout. Tabulate: formulation → cardinality → odd/even → C candidate (function pointer table, LUT, bitfield, state machine, union overlay, etc.).
9. Cross-reference with the Bimba MCP for any coordinates that have rich relational neighborhoods not fully captured in the dataset dumps
10. **Surface to user:** The complete structural map with relation classification AND the formulation-to-C-candidate mapping table. Highlight: (a) what the existing M-plan already captures well, (b) what's missing or underspecified, (c) any ontological patterns that suggest specific C structures (unions, bitfields, function pointer tables, etc.), (d) which formulations drive the most consequential structural decisions.

### Phase 3: Sub-FR Derivation

**FR granularity rule:** The 6 sub-FRs (FR 2.N.0 through FR 2.N.5) correspond **one-to-one** with the 6 top-level sub-branches (#N-0 through #N-5). This is the ONLY level at which FRs are defined for this M-branch. All deeper structure — sub-sub-branches, micro-tori, zodiacal grammars, positional sub-enumerations, and any other nested ontological content — is folded INTO its parent sub-FR as implementation detail. It is NOT broken out into sub-sub-FRs (e.g., no FR 2.N.0.1, no FR 2.N.0.a). The FRs define memory contracts at the 6-fold level; everything below that is internal to the C structure(s) that FR mandates.

11. For each of the 6 sub-positions (#N-0 through #N-5), derive a sub-FR (FR 2.N.0 through FR 2.N.5) by:
    - Extracting the coreNature, essence, and structure fields from the node data
    - **Extracting and tabulating ALL formulation strings for every node at this sub-position and its descendants.** Formulations are FIRST-CLASS: they contain specific formal language definitions (operator tables, arithmetic reductions, concrescence algorithms, combinatorial permutation patterns, number-theoretic formulas) that directly prescribe the C structure. Do not treat them as supplementary annotations.
    - **Identifying the formal system type** for each formulation (operator lexicon, arithmetic, permutational, pronominal grammar, polarity algebra, etc.)
    - **Mapping formulation syntax to C structure candidates** (function pointer tables, LUTs, bitfields, state machines, union overlays) — include the odd/even cardinality heuristic where applicable
    - Mapping relation types to C pointer semantics (in-scope relations only; flag deferred ones)
    - Identifying the QL mode (which context frame governs this sub-position)
    - Determining the memory domain (.rodata vs heap vs tensor)
    - Specifying bitfield layouts where the ontology dictates bit-level semantics
    - **Folding all sub-branch detail** (sub-sub-nodes, nested enumerations, micro-tori) into the implementation notes of this sub-FR — not into child FRs
12. **Surface to user:** Each sub-FR draft, one at a time, with rationale including the formulation analysis. Wait for validation/correction before proceeding to the next.

### Phase 4: Topology & Flow
13. Map the complete pointer topology for this M-branch — which sub-FRs point to which, and how this connects to Pillar I's tagged pointer and 16-fold intra-openness-to structure
14. Define the operational flow: how the Torus walk traverses this branch, where the Lemniscate dive engages, what the Mobius return looks like
15. **Surface to user:** The topology diagram and flow narrative for validation.

### Phase 5: Document Assembly
16. Update `Idea/Bimba/Seeds/M/M{N}'/Legacy/plans/M{N}-C-architecture.md` with the refined sub-FRs
17. **Surface to user:** Final document diff for approval before writing.

## Formulation-Awareness

The `formulation` field in each Bimba node is a **first-class architectural input**, not a supplementary annotation. Formulations encode the OPERATIONAL nature of each branch in precise mathematical-symbolic notation. The subagent analyzing any M-branch MUST:

1. **Extract and tabulate ALL formulation strings** for every node in the branch (including sub-sub-nodes). Present them as a table: `coordinate | formulation string | formal system type`.
2. **Identify the formal system type** for each formulation. Common types include:
   - Operator lexicon (tabulated symbols → operations)
   - Arithmetic reduction (formula over positions, e.g., modular, factorial, geometric)
   - Concrescence algorithm (multi-stage assembly process with defined phases)
   - Combinatorial / permutational pattern (counting arrangements of positions)
   - Number-theoretic formula (prime, Fibonacci, triangular, etc. relationships)
   - Pronominal grammar (positional roles as grammatical persons/cases)
   - Polarity algebra (binary or n-ary opposition structures)
3. **Map each formulation to C structure candidates.** Typical mappings:
   - Operator lexicons → function pointer tables or `switch`-dispatch LUTs
   - Arithmetic reductions → compile-time macros or constexpr arrays
   - Concrescence algorithms → multi-stage state machines or pipeline structs
   - Combinatorial patterns → bitfield layouts or packed enumerations
   - Pronominal grammars → tagged union discriminants or role-enum fields
   - Polarity algebras → 1-bit or 2-bit bitfields, `XOR`-paired pointer slots
4. **Apply the odd/even cardinality heuristic.** When a formulation defines a system with N positions:
   - **Odd N:** Position 0 is a **singularity** — a fused non-dual anchor that collapses what would otherwise be a binary (0 and 1 fused into one). Remaining positions count from 2 onward. In C: the enum/array needs a `FUSED_GROUND` sentinel at index 0; a union discriminant or bitfield may need an asymmetric layout to reflect this.
   - **Even N:** Positions distribute symmetrically. Standard enum/array indexing applies.
   - This heuristic must be checked for every formulation before committing to a struct layout.

## Relation Scoping

Not all Neo4j relation types carry equal structural weight for in-branch FR derivation. Apply this scoping policy during Phase 2 and Phase 3:

**In scope — process immediately:**

| Category | Relation types |
|----------|---------------|
| Core structural | `HAS_INTERNAL_COMPONENT`, `DEVELOPS_INTO`, QL cycle edges (e.g., `SUCCEEDED_BY_AND_MANIFESTS_THROUGH`, `PRECEDES`), `CONTEXT_FRAME_GENERATES`, `COMPLEMENTARY_POLE`, `FORMULATION_SYNTAX_CORRESPONDENCE` |
| Key semantic | `ADAM_EVE_COMPLEMENT`, `DIVINE_ACT_MANIFESTATION`, `NESTS_VIRTUE`, `OPERATES_THROUGH`, `EXHIBITS_META_PATTERN`, `ZERO_ONE_UNITY` |

These relations define the memory contracts, pointer topology, and operational semantics of the sub-FRs.

**Flagged and deferred:**

High-fanout cross-branch correspondence edges — specifically `LINGUISTIC_CORRESPONDENCE` (×99), `GRAMMATICAL_CORRESPONDENCE` (×99), and any similarly large cross-branch edge sets — are noted in the Phase 2 surface but **not resolved in-branch**. They are flagged for integration in the FR of the target M-branch they correspond to. This prevents in-branch analysis from being overwhelmed by correspondence webs that belong to another branch's structural logic.

## Composability Rules

- **One M-branch per invocation.** Never process multiple M-branches in a single run.
- **Sequential subagent dispatch.** The parent orchestrator dispatches ONE subagent to do the heavy analysis (Phases 1-3), surfaces results verbosely, gets user validation, then proceeds.
- **Dialogical surfacing is mandatory.** The user MUST see and validate the structural analysis (Phase 2 output) before sub-FR derivation begins, and each sub-FR (Phase 3) before the next.
- **Bimba MCP is a first-class input.** Use `resolve_coordinate`, `get_node_by_coordinate_extended`, and `get_node_relationships` to validate and enrich the dataset dumps.
- **Existing plans are starting points, not constraints.** The dataset may reveal structures the earlier plans missed. Update fearlessly but explain what changed and why.

## M-Branch Naming Map

| Index | Name | Dataset Prefix | Spec FR |
|-------|------|---------------|---------|
| 0 | Anuttara | `anuttara` | FR 2.0 |
| 1 | Paramasiva | `paramasiva` | FR 2.1 |
| 2 | Parashakti | `parashakti` | FR 2.2 |
| 3 | Mahamaya | `mahamaya` | FR 2.3 |
| 4 | Nara | `nara` | FR 2.4 |
| 5 | Epii | `epii` | FR 2.5 |

## Quality Gates

- Every sub-FR MUST trace back to specific Bimba coordinates (cite them)
- Every C structure MUST respect the 128-byte singularity (FR 1.1)
- Every pointer MUST specify whether it's tagged or raw
- Every `.rodata` placement MUST be justified by immutability in the ontology
- Cross-branch relations MUST be flagged for later integration (not resolved in-branch)
