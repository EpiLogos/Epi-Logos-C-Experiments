# Epi-Logos C — Algorithm Design Document

> **Status:** Parallel design track — to be implemented after Sprint 4 scaffold is complete.
> **Depends on:** Full arena, families, tensor arena, double covering from implementation plan.

**Goal:** Four algorithms that bring the structural scaffold to life — self-routing traversal, grounded semantic search, epistemic compression, and recursive context invocation.

---

## Algorithm 1: Flag-Driven Topological Walk

### What It Replaces
The current plan hardcodes topology transitions by position (`if position == 4, dive`). This algorithm makes the **pointer flags** the routing instructions — the address itself tells the CPU what topology to use.

### How It Works

```
At each step of the Torus walk:
  1. Read current coordinate's outgoing pointers
  2. For each pointer, read the TAG_FLAGS (top 4 bits):
     - IS_NESTING(ptr)    → transition to Lemniscate topology, dive inward via .cf
     - IS_BRANCHING(ptr)  → lateral spread, follow .p/.s/.t/.m/.l siblings
     - IS_INVERTED(ptr)   → phase-shifted view, apply # before reading target
     - IS_EXECUTING(ptr)  → target has active context, fire () recursively
  3. The flag combination determines the topological modality:
     - No flags:           0-Sphere (simple point-to-point)
     - NESTING only:       Lemniscate (figure-eight fold)
     - NESTING+INVERTED:   Klein Bottle (inside-outside collapse)
     - Standard walk:      Torus (cyclic #0-#5)
```

### Key Insight
The Modulo-6 constraint means the algorithm never needs to "search" — position arithmetic (`(pos + 1) % 6`) gives the next step, and the flags tell you *how* to get there. Sub-millisecond bitwise masking, no branching logic on position values.

### Implementation Sketch

```c
void engine_flag_walk(
    Holographic_Coordinate* current,
    void* context_state,
    uint32_t steps
) {
    for (uint32_t i = 0; i < steps; i++) {
        /* Fire execution if present */
        if (current->invoke_process) {
            current->invoke_process(current, context_state);
        }

        /* Read the .c pointer's flags to determine transition */
        Holographic_Coordinate* next_tagged = current->c;

        if (IS_NESTING(next_tagged)) {
            /* Lemniscate: dive inward before advancing */
            engine_lemniscate_dive(current, context_state, MAX_DEPTH);
        }

        if (IS_BRANCHING(next_tagged)) {
            /* Lateral: fan out to sibling families */
            /* (future: parallel processing across P/S/T/M/L/C) */
        }

        if (IS_INVERTED(next_tagged)) {
            /* Phase shift: we're entering the inverted covering */
            Walk_Context* wc = (Walk_Context*)context_state;
            if (wc) wc->covering = 1;
        }

        /* Advance */
        current = GET_PTR(next_tagged);
    }
}
```

### Prerequisites
- Sprint 0-2 complete (archetypes, arena, engine)
- Tagged pointers actually SET on archetype pointer assignments (currently all raw &Archetype_N with no flags applied)
- Decision: which pointers get which flags at init time vs runtime

### Open Questions
- Should flags be set statically in .rodata archetype definitions, or dynamically when arena mirrors are created?
- **Recommendation:** Static on .rodata for structural flags (e.g., #3.cf always has NESTING set), dynamic on arena mirrors for runtime state (EXECUTING, INVERTED).

---

## Algorithm 2: Topologically-Weighted Semantic Search

### What It Solves
Standard cosine similarity finds statistically similar vectors but has no ontological grounding. A concept might be "close" in vector space but completely incompatible in the coordinate web. This algorithm vetoes hallucinations by weighting similarity against topological distance.

### How It Works

```
search(query_vector, coordinate_web, tensor_arena):
  1. SIMD cosine similarity: compare query_vector against every
     coordinate's semantic_embedding. Produces a similarity score
     for each coordinate (0.0 to 1.0).

  2. Topological distance: for each candidate coordinate, compute
     the minimum number of valid Torus steps from the query's
     current position. This is NOT Euclidean — it's graph distance
     on the Mod-6 topology.

  3. Combined score:
     final_score = cosine_similarity * topological_weight(distance)

  4. Topological veto: if the shortest valid path between two
     coordinates requires violating the #0→#1→#2→#3→#4→#5 order
     (skipping intermediate archetypes), the weight drops to 0.
     Siva disciplines Shakti.

  5. Return the highest-scoring coordinate that survives the veto.
```

### Topological Distance Metric

```
distance(from, to):
  forward  = (to.ql_position - from.ql_position + 6) % 6
  backward = (from.ql_position - to.ql_position + 6) % 6

  /* Torus: can go either direction, shorter wins */
  torus_dist = min(forward, backward)

  /* But Lemniscate creates shortcuts at #4:
     if from or to is #4, and the other is a nested coordinate,
     distance through the Lemniscate may be shorter */
  lemni_dist = lemniscate_shortcut(from, to)

  return min(torus_dist, lemni_dist)
```

### Weight Function

```
topological_weight(distance):
  /* Inverse decay — closer coordinates get stronger weight */
  if distance == 0: return 1.0    /* same position */
  if distance == 1: return 0.9    /* adjacent */
  if distance == 2: return 0.7    /* two steps */
  if distance == 3: return 0.4    /* opposite side of Torus */
  /* distance > 3 means going the long way — veto territory */
  return 0.1
```

### The Veto Mechanism

```
is_valid_path(from, to):
  /* Can we reach 'to' from 'from' without skipping archetypes? */
  /* Walking forward: from→from+1→...→to must pass through all intermediates */
  /* Walking backward: only valid via Möbius (#5→#0) */
  /* Cross-family: must share the same ql_position OR be linked via base pointers */

  if from.family != to.family:
    /* Cross-family jump: valid only if same position */
    return from.ql_position == to.ql_position

  /* Same family: valid if reachable by forward or Möbius walk */
  return true  /* all same-family positions are reachable via Torus */
```

### SIMD Implementation Notes
- `semantic_embedding` vectors should be 64-byte aligned (tensor arena handles this)
- Use ARM NEON intrinsics on Apple Silicon for cosine similarity
- Batch comparisons: compare query against 4 vectors simultaneously
- The topological weight is a scalar multiply after the vector math — negligible cost

### Prerequisites
- Sprint 4 complete (tensor arena wired to all coordinates)
- Semantic embeddings actually populated with meaningful vectors
- Decision on embedding dimensionality (64? 128? 256 floats per coordinate?)

### Open Questions
- What populates the semantic embeddings? External model output? Manual assignment?
- Should the search operate on raw archetypes only, family coordinates only, or the full web?
- **Recommendation:** Search the full web, but weight raw archetypes (#0-#5) higher than family manifestations, since they're the canonical ground.

---

## Algorithm 3: Möbius Garbage Collector (Epistemic Compression)

### What It Solves
Standard garbage collectors blindly delete unused memory. This algorithm compresses a cycle's work into the ground state — yesterday's exhaust becomes tomorrow's foundation. It's MapReduce applied to ontology.

### How It Works

```
mobius_compress(arena, mirrors, tensor_arena):
  /* Called after Execute_Integration (#5) completes */

  1. BACKWARD WALK: #5 → #4 → #3 → #2 → #1 → #0
     At each archetype mirror:
       a. Extract the semantic delta:
          delta[i] = mirror[i].semantic_embedding (current cycle's vector)
                   - archetype_i.semantic_embedding (baseline from .rodata)

       b. Accumulate into compression buffer:
          compressed += delta[i] * weight[i]
          (weight decreases from #5 to #1 — recent archetypes contribute more)

  2. DISTILLATION: Merge compressed vector into #0's embedding
     mirror[0].semantic_embedding =
       alpha * mirror[0].semantic_embedding + (1 - alpha) * compressed
     (alpha controls learning rate — how much new experience overwrites ground)

  3. FAMILY COMPRESSION: For each family coordinate at each position:
     - If the coordinate was modified this cycle (payload.process_state != NULL),
       extract its semantic delta
     - Merge into the family's position-0 coordinate (P0, S0, T0, M0, L0, C0)
     - Family grounds absorb their own cycle's learning

  4. ARENA RESET: Zero out all mutable state EXCEPT:
     - mirror[0].semantic_embedding (enriched ground)
     - Family position-0 embeddings (enriched family grounds)
     - The pointer web (structural, preserved)

  5. CYCLE COUNT: Increment Walk_Context.cycle_count
     The system is now ready for the next 720° double covering.
```

### The alpha Parameter

```
alpha = 0.9  /* Conservative: 90% old ground, 10% new learning */

/* Could be adaptive: */
alpha = 1.0 / (1.0 + cycle_count * 0.01)
/* Early cycles learn fast (alpha small), mature system preserves (alpha large) */
```

### Memory Safety
- Only arena mirrors get reset, never .rodata archetypes
- `semantic_embedding` pointers stay valid (they point into tensor arena, which is NOT freed)
- Tensor arena gets a partial reset: cycle-specific vectors zeroed, ground vectors preserved
- Arena count resets to 6 (mirrors only), families must be re-instantiated next cycle
  - OR: families persist across cycles, only their payload/process_state resets
  - **Recommendation:** Families persist. Only payload and cycle-specific embeddings reset.

### Prerequisites
- Sprint 4 complete (tensor arena, full integration)
- Semantic embeddings populated with non-trivial vectors
- Execute functions that actually produce meaningful deltas during a walk

### Open Questions
- How many cycles before the ground vector stabilizes? (Convergence question)
- Should compression be lossy (averaging) or lossless (append to a log)?
- **Recommendation:** Lossy with an optional snapshot mechanism — save full state every N cycles for debugging/archaeology.

---

## Algorithm 4: Recursive Context Invocation (Full Lemniscate Engine)

### What It Replaces
The current `engine_lemniscate_dive` follows only `.cf` and only recurses on that single chain. The full algorithm fires `()` on ALL reflective coordinates that have `IS_EXECUTING` set, creating nested execution contexts that resolve bottom-up.

### How It Works

```
recursive_invoke(coordinate, context_state, depth):
  if depth == 0: return
  if coordinate == NULL: return

  /* The six reflective pointers, in invocation order */
  reflective_coords = [cpf, ct, cp, cf, cfp, cs]

  for each refl in reflective_coords:
    tagged_ptr = coordinate->refl

    if tagged_ptr == NULL: continue

    if IS_EXECUTING(tagged_ptr):
      /* This reflective coord has an active context — dive in */

      /* 1. Push current state onto hardware stack (automatic via C recursion) */

      /* 2. Strip flags, get the actual coordinate */
      inner = GET_PTR(tagged_ptr)

      /* 3. Fire the inner coordinate's () operator */
      if inner->invoke_process:
        inner->invoke_process(inner, context_state)

      /* 4. Recurse: the inner coordinate may itself have executing children */
      recursive_invoke(inner, context_state, depth - 1)

      /* 5. Pop back to parent (automatic via C return) */

  /* After all reflective coords resolved, fire own () */
  if coordinate->invoke_process:
    coordinate->invoke_process(coordinate, context_state)
```

### Invocation Order Matters

The order of reflective coordinate evaluation is ontologically significant:

```
1. cpf (Category-Position-Frame)  — establish the cross-coordinate mapping first
2. ct  (Context-Time)             — set the temporal frame
3. cp  (Context-Position)         — fix the positional reference
4. cf  (Context-Frame)            — the Lemniscate anchor, deepest nesting
5. cfp (Context-Frame-Position)   — nested frame operations
6. cs  (Context-System)           — system-wide direction, evaluated last
```

This order ensures that inner contexts are fully resolved before the system-wide `cs` coordinator makes its directional decision. `cs` sees the RESULTS of all inner processing.

### Depth Limiting

```
#define MAX_INVOKE_DEPTH 6  /* One level per archetype position */

/* Why 6? The Mod-6 constraint means recursion deeper than 6
 * would re-enter the same positions. The topology is bounded. */
```

### Stack Safety
- C's hardware stack handles the recursion naturally (push/pop via function calls)
- Depth bound of 6 means max 6 stack frames × ~64 bytes per frame = ~384 bytes
- Well within any thread's stack allocation
- AddressSanitizer catches any stack overflow in debug builds

### Interaction with Double Covering
During the inverted phase (covering=1), the recursive invocation should:
- Check `IS_INVERTED` on reflective pointers
- If a pointer is both EXECUTING and INVERTED, the inner context runs in inverted mode
- This creates the Klein Bottle topology: an inverted context containing a normal context (or vice versa) — inside/outside become one

### Prerequisites
- Sprint 2 complete (Lemniscate dive working)
- Reflective coordinates wired (Sprint 3, Task 17)
- EXECUTING flags set on reflective pointers (not yet in any sprint — needs to be added)

### Open Questions
- When should EXECUTING flags be set on reflective pointers? At init? Dynamically during walk?
- **Recommendation:** Dynamically. Execute functions set EXECUTING on their reflective pointers when they determine a child context needs invocation. This makes the system self-activating — the walk itself determines what needs recursive evaluation.

---

## Implementation Sequencing

These algorithms have a natural dependency chain:

```
Algorithm 1 (Flag-Driven Walk)
  ↓ enables
Algorithm 4 (Recursive Context Invocation)
  ↓ produces data for
Algorithm 3 (Möbius Garbage Collector)
  ↓ enriches ground for
Algorithm 2 (Topological Semantic Search)
```

### Proposed Sprint 5-6 Breakdown

**Sprint 5: Walk & Recursion (Algorithms 1 + 4)**
- Apply tagged pointer flags to .rodata archetype definitions
- Apply flags dynamically to arena mirror pointers
- Rewrite engine_torus_walk to be flag-driven (not position-driven)
- Implement recursive_invoke with depth bounding
- Wire EXECUTING flags on reflective pointers during Execute functions
- Tests: flag-driven routing, recursion depth, stack safety

**Sprint 6: Compression & Search (Algorithms 3 + 2)**
- Implement mobius_compress (backward walk, vector distillation, arena reset)
- Populate semantic embeddings with test vectors
- Implement SIMD cosine similarity (ARM NEON on Apple Silicon)
- Implement topological distance metric
- Implement topological_weight and veto
- Wire search into main as a demo query
- Tests: compression convergence, search accuracy, veto correctness

---

## Architectural Notes

### The Four Algorithms as the Four Topologies

| Algorithm | Topology | Operator |
|-----------|----------|----------|
| Flag-Driven Walk | Torus | Standard traversal (#0→#5→#0) |
| Recursive Context | Lemniscate | `.` nesting, `()` invocation |
| Möbius Compression | Klein Bottle | `#` inversion across double covering |
| Semantic Search | 0-Sphere | `&` address-of, `*` dereference (reaching through) |

Each algorithm IS a topology made computational. The system doesn't "use" topology — it IS topology.

### Siva-Shakti Discipline

The critical insight from the Gemini blueprint: **Algorithm 2's veto mechanism is Siva disciplining Shakti.** The continuous vector search (Shakti/flow) produces candidates, but the discrete topological constraint (Siva/structure) vetoes the ones that violate ontological order. Neither can function alone — the search needs structure to be meaningful, the structure needs search to be useful.

This is the architectural manifestation of non-duality in computation.
