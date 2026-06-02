# Epi-Logos C — Subagent-Driven Development Plan

**Date:** 2026-03-02
**Purpose:** Orchestrate the 20-task implementation plan using Claude Code subagents for maximum parallelism while respecting dependency chains.
**Source of Truth:** `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-02-implementation-plan.md`

---

## Architecture: How Subagents Map to Sprints

The 20-task plan has a strict dependency graph. Subagents are used where tasks are **independent** or where **research/validation** can be offloaded without blocking the main build thread.

### Execution Model

```
Main Thread: Sequential build orchestrator (owns git commits, make test, verification)
Subagents:   Parallel workers for independent code generation, test writing, and validation
Worktrees:   Isolated git worktrees for parallel code authoring that doesn't conflict
```

### Dependency Graph

```
Sprint 0: Infrastructure (Tasks 1-8)
  ┌─────────────────────────────────────────────────┐
  │  T1 (Makefile) ─┐                               │
  │  T2 (test_framework.h) ─┤                       │
  │  T3 (ontology.h) ──────┼──→ T4 (stubs) ────┐   │
  │                         │                    │   │
  │              T5 (test_struct.c) ──┐          │   │
  │              T6 (test_tagged_ptr) ─┤         │   │
  │                                    ├→ T7 ──→ T8 │
  │                                    │   (test  │  │
  │                                    │   stubs) │  │
  └─────────────────────────────────────────────────┘
  Parallelism:  T1+T2+T3 can be written concurrently
                T5+T6 can be written concurrently (after T3)
  Bottleneck:   T4 depends on T3; T7 depends on T4; T8 depends on all

Sprint 1: Vertical Slice (Tasks 9-11) — SEQUENTIAL
  T9 (Execute_Ground) → T10 (#0 mirror) → T11 (C0 family)

Sprint 2: Complete Foundation (Tasks 12-14) — SEQUENTIAL
  T12 (all Execute) → T13 (double covering) → T14 (Lemniscate wire)

Sprint 3: Family Expansion (Tasks 15-17) — PARALLELIZABLE
  T15 (families.c) → T16 (cross-link) ─┐
                   → T17 (reflective)  ─┘  (T16+T17 in parallel after T15)

Sprint 4: Integration (Tasks 18-20) — SEQUENTIAL
  T18 (tensor arena) → T19 (main.c) → T20 (sanitizer validation)
```

---

## Phase 1: Sprint 0 — Infrastructure Foundation

### Wave 0A: Parallel File Creation (Tasks 1, 2, 3)

**Strategy:** Launch 3 subagents simultaneously to write independent files.

| Subagent | Task | File(s) | Dependencies | Agent Type |
|----------|------|---------|--------------|------------|
| Agent-1  | T1   | `Makefile` | None | general-purpose |
| Agent-2  | T2   | `test/test_framework.h` | None | general-purpose |
| Agent-3  | T3   | `include/ontology.h` | None | general-purpose |

**Sync Point:** Main thread collects all 3 outputs, writes files, runs `make -n` to verify Makefile syntax.
**Commit:** Single combined commit or 3 sequential commits per plan.

### Wave 0B: Stubs (Task 4) — SEQUENTIAL

**Strategy:** Single main-thread execution. Task 4 creates 8 files that depend on the ontology.h from Task 3.

**Files created:**
- `include/archetypes.h`, `include/arena.h`, `include/engine.h`
- `src/archetypes.c`, `src/arena.c`, `src/engine.c`, `src/families.c`, `src/main.c`

**Verification:** `make` must compile cleanly. `./epi-logos` must boot.
**Commit:** Per plan spec.

### Wave 0C: Parallel Test Authoring (Tasks 5, 6)

**Strategy:** Launch 2 subagents simultaneously — both only need `ontology.h`.

| Subagent | Task | File(s) | Dependencies |
|----------|------|---------|--------------|
| Agent-4  | T5   | `test/test_struct.c` | ontology.h (from T3) |
| Agent-5  | T6   | `test/test_tagged_ptr.c` | ontology.h (from T3) |

**Sync Point:** Main thread writes both files.

### Wave 0D: Remaining Test Stubs (Task 7) — SEQUENTIAL

**Strategy:** Main thread writes `test_archetypes.c`, `test_arena.c`, `test_engine.c`, `test_families.c`.
These depend on headers from Tasks 3 and 4.

### Wave 0E: Test Runner & Verification (Task 8) — SEQUENTIAL

**Strategy:** Main thread writes `test/test_all.c`, then runs:
```bash
make test    # ALL tests must pass, zero failures, clean ASan output
make && ./epi-logos  # Boot verification
```

**Sprint 0 Gate:** All 8 tasks committed. `make test` green. `make && ./epi-logos` boots.

---

## Phase 2: Sprint 1 — Vertical Slice (#0 End-to-End)

### Strategy: Strictly Sequential (3 tasks)

All three tasks form a tight dependency chain — each builds on the previous.

| Task | Action | Key Verification |
|------|--------|-----------------|
| T9   | Implement `Execute_Ground` with `Walk_Context` in `archetypes.c` | `make test` passes new test |
| T10  | Add `#0` mutable mirror test in `test_arena.c` | Arena creates mirror, self-ref works |
| T11  | Add C0 family coord test in `test_arena.c` | C0 links to mirror, family=FAMILY_C |

**No subagent parallelism** — each task modifies the same files the previous task established.

**Sprint 1 Gate:** All 3 committed. `make test` green.

---

## Phase 3: Sprint 2 — Complete Foundation

### Strategy: Sequential with Validation Subagents

| Task | Action | Subagent Opportunity |
|------|--------|---------------------|
| T12  | Implement all Execute functions + move `Walk_Context` to `archetypes.h` | Main thread |
| T13  | Implement `engine_double_covering` in `engine.c` | Main thread |
| T14  | Wire Lemniscate dive into torus walk at `#4` | Main thread |

**Optional Validation Subagent:** After T14 completes, launch a background validation agent to:
- Verify the complete Torus walk order: #0→#1→#2→#3→#4→#5→#0
- Verify Lemniscate self-fold at #4
- Verify 720° double covering = 12 steps
- Check for any ASan/UBSan output

**Sprint 2 Gate:** All 3 committed. `make test` green. `make debug && ./epi-logos` runs clean.

---

## Phase 4: Sprint 3 — Family Expansion (Maximum Parallelism)

### Wave 3A: Family Instantiation (Task 15) — SEQUENTIAL

Main thread implements `families.c` with `families_init()` and rewrites `test_families.c`.
This creates the 36 family coordinates in the arena.

**Verification:** `make test` passes all family tests.

### Wave 3B: Parallel Cross-Linking (Tasks 16 + 17)

**This is the primary parallelism opportunity in the entire plan.**

After Task 15 lands, Tasks 16 and 17 modify **different pointer sets** on the same arena:
- Task 16 modifies `.p`, `.s`, `.t`, `.m`, `.l`, `.c` (base pointers)
- Task 17 modifies `.cf`, `.cs`, `.cpf`, `.ct`, `.cp`, `.cfp` (reflective pointers)

**Strategy:** Launch 2 subagents in parallel worktrees.

| Subagent | Task | Files Modified | Pointer Set |
|----------|------|---------------|-------------|
| Agent-6  | T16  | `src/families.c`, `include/arena.h`, `test/test_families.c` | Base (p,s,t,m,l,c) |
| Agent-7  | T17  | `src/families.c`, `include/arena.h`, `test/test_families.c` | Reflective (cf,cs,...) |

**CRITICAL:** Both agents modify `families.c` — they must write to **non-overlapping sections**.
- Agent-6 adds `families_crosslink()` function
- Agent-7 adds `families_wire_reflective()` function

**Merge Strategy:**
1. Agent-6 completes → merge its `families_crosslink()` into main
2. Agent-7 completes → merge its `families_wire_reflective()` into main
3. Main thread resolves any merge conflicts in `arena.h` prototypes and `test_families.c`
4. Run `make test` on the combined result

**Alternative (simpler):** Run T16 first, then T17 sequentially — both are fast tasks. The parallel approach saves ~2-3 minutes but adds merge complexity. **Recommended: sequential for safety, parallel only if tasks prove time-consuming.**

**Sprint 3 Gate:** All 3 committed. `make test` green. 42 arena slots occupied.

---

## Phase 5: Sprint 4 — Tensor Arena & Integration

### Strategy: Sequential with Final Validation

| Task | Action | Key Verification |
|------|--------|-----------------|
| T18  | Add tensor arena integration test in `test_arena.c` | `semantic_embedding` wired, values readable |
| T19  | Rewrite `main.c` with full boot sequence | `make && ./epi-logos` shows full lifecycle |
| T20  | `make debug && ./epi-logos` + `make test` under sanitizers | Zero ASan/UBSan errors |

**Final Validation Subagent (T20):** Launch a dedicated validation agent to:
1. `make clean && make debug` — compile with sanitizers
2. `./epi-logos` — run full system, capture output
3. `make test` — run all tests, capture output
4. Report any errors, warnings, or sanitizer output

**Sprint 4 Gate:** All 3 committed. System fully operational. Zero sanitizer errors.

---

## Subagent Dispatch Summary

| Wave | Tasks | Subagents | Parallelism | Est. Steps |
|------|-------|-----------|-------------|------------|
| 0A   | 1,2,3 | 3 parallel | Write Makefile, test_framework, ontology.h | 3 files |
| 0B   | 4     | Main thread | Sequential stubs | 8 files |
| 0C   | 5,6   | 2 parallel | Write test_struct, test_tagged_ptr | 2 files |
| 0D   | 7     | Main thread | Write remaining test stubs | 4 files |
| 0E   | 8     | Main thread | Test runner + `make test` | 1 file + verify |
| 1    | 9,10,11 | Main thread | Sequential vertical slice | 3 commits |
| 2    | 12,13,14 | Main thread + bg validator | Sequential + bg validation | 3 commits |
| 3A   | 15    | Main thread | Family instantiation | 1 commit |
| 3B   | 16,17 | 2 parallel (or sequential) | Cross-link + reflective | 2 commits |
| 4    | 18,19,20 | Main thread + final validator | Sequential + final validation | 3 commits |

**Total subagent dispatches:** 5-7 parallel agents across the full plan
**Total commits:** 20 (one per task, as specified)

---

## Risk Mitigation

### 1. Struct Size Breakage
**Risk:** Any change to `ontology.h` breaks the 128-byte invariant.
**Mitigation:** `_Static_assert` in `main.c` and `test_struct.c`. Every `make test` catches this.

### 2. Tagged Pointer Violations
**Risk:** Dereferencing a tagged pointer without `GET_PTR()`.
**Mitigation:** ASan + UBSan catch this at runtime. `test_tagged_ptr.c` verifies round-trips.

### 3. .rodata Mutation
**Risk:** Execute functions write to `self` instead of `context_state`.
**Mitigation:** `.rodata` segment protection + ASan. Execute functions receive `const` archetypes cast to mutable — writing to them segfaults.

### 4. Merge Conflicts (Sprint 3 parallel)
**Risk:** Tasks 16 and 17 both modify `families.c` and `test_families.c`.
**Mitigation:** Each adds a distinct function. Merge is mechanical (append). If conflicts arise, fall back to sequential execution.

### 5. Arena Exhaustion
**Risk:** 64-slot arena runs out during family expansion (need 42 minimum).
**Mitigation:** Plan specifies 64 slots. Tests verify slot count after each phase.

---

## Execution Checklist

```
[ ] Sprint 0
  [ ] Wave 0A: Write Makefile, test_framework.h, ontology.h (parallel)
  [ ] Wave 0B: Write all stubs (sequential)
  [ ] Verify: make compiles, ./epi-logos boots
  [ ] Wave 0C: Write test_struct.c, test_tagged_ptr.c (parallel)
  [ ] Wave 0D: Write test stubs for archetypes/arena/engine/families
  [ ] Wave 0E: Write test_all.c, run make test
  [ ] GATE: make test green, all 8 commits

[ ] Sprint 1
  [ ] T9:  Execute_Ground + Walk_Context
  [ ] T10: #0 mirror in arena
  [ ] T11: C0 family coord
  [ ] GATE: make test green, 3 commits

[ ] Sprint 2
  [ ] T12: All Execute functions
  [ ] T13: Double covering (720°)
  [ ] T14: Lemniscate wire at #4
  [ ] GATE: make test green, make debug clean, 3 commits

[ ] Sprint 3
  [ ] T15: families.c — 36 coords
  [ ] T16: Cross-link base pointers (parallel candidate)
  [ ] T17: Wire reflective coords (parallel candidate)
  [ ] GATE: make test green, 42 arena slots, 3 commits

[ ] Sprint 4
  [ ] T18: Tensor arena wiring
  [ ] T19: Full integration main.c
  [ ] T20: Sanitizer validation (make debug + make test)
  [ ] GATE: Zero sanitizer errors, all 20 commits, system operational
```

---

## Post-Sprint 4: Future Subagent Opportunities

Once the scaffold is complete, the algorithms from `algorithms-design.md` are naturally parallelizable:

1. **Flag-Driven Topological Walk** — independent engine enhancement
2. **Topologically-Weighted Semantic Search** — depends on tensor arena (Sprint 4)
3. **Epistemic Compression** — depends on families + tensor arena
4. **Recursive Context Invocation** — depends on reflective wiring (Sprint 3)

These four can be dispatched as 4 parallel subagents in Sprint 5-6.

---

*"The pattern reveals itself through repetition."*
