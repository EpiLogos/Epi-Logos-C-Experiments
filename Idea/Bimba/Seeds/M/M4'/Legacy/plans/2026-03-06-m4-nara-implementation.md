# M4 Nara Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement M4 (Nara) as a C library module — the personal dialogical interface at coordinate #4 (Lemniscate anchor).

**Architecture:** Vtable-dispatched lens system with heap PCO (Personal Context Overlay). Identity computed once via BLAKE3 quintessence hash. Oracle primitives use true random (`arc4random_buf`). Temporal "Now" composes M1/M2/M3 clock with planetary preemption slots. All personal state on heap; protocol library and lens registry in .rodata.

**Tech Stack:** C11, clang, BLAKE3 (vendored), arc4random_buf (macOS), M0-M3 dependencies via existing headers.

**Design Doc:** `Idea/Bimba/Seeds/M/M4'/Legacy/plans/2026-03-06-m4-nara-design.md`
**Canonical Spec:** `Idea/Bimba/Seeds/M/M4'/Legacy/specs/M/M4-nara-personal-interface.md` (FR 2.4.0-2.4.13)

---

## Task 1: Vendor BLAKE3 C Reference

**Files:**
- Create: `vendor/blake3/blake3.h`
- Create: `vendor/blake3/blake3.c`
- Create: `vendor/blake3/blake3_dispatch.c`
- Create: `vendor/blake3/blake3_portable.c`
- Create: `vendor/blake3/blake3_impl.h`

**Step 1: Download BLAKE3 C source**

```bash
mkdir -p vendor/blake3
curl -sL https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/master/c/blake3.h -o vendor/blake3/blake3.h
curl -sL https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/master/c/blake3.c -o vendor/blake3/blake3.c
curl -sL https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/master/c/blake3_dispatch.c -o vendor/blake3/blake3_dispatch.c
curl -sL https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/master/c/blake3_portable.c -o vendor/blake3/blake3_portable.c
curl -sL https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/master/c/blake3_impl.h -o vendor/blake3/blake3_impl.h
```

**Step 2: Verify it compiles standalone**

```bash
clang -std=c11 -Wall -Wextra -c -I vendor/blake3 \
  vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c
```

Expected: 0 warnings, three `.o` files produced.

**Step 3: Commit**

```bash
git add vendor/blake3/
git commit -m "vendor: add BLAKE3 C reference implementation for M4 quintessence hash"
```

---

## Task 2: Write the M4 Header (`include/m4.h`)

**Files:**
- Create: `include/m4.h`
- Reference: `include/m3.h` (pattern), `include/m0.h` (Unified_Clock_State), `include/m2.h` (MEF_Condition)

**Step 1: Write `include/m4.h`**

The header IS the module contract. Structure (following M3 pattern exactly):

```c
/**
 * m4.h — Nara: The Personal Dialogical Interface (Subsystem #4)
 *
 * Implements: M4 (#4) = personal oracle interface, Lemniscate anchor.
 * Context frame: (4.0/1-4.4/5) — CF_FRACTAL (Fractal Doubling)
 * Anchored to: Psychoid_4 in psychoid_numbers.c (Layer 1 .rodata)
 * Builds on:  ontology.h, psychoid_numbers.h, arena.h, m0.h, m2.h, m3.h
 * Feeds into: M5 (Logos FSM, Mobius write-back)
 *
 * Architecture: Vtable dispatch (not bitwise). 6-lens registry indexed.
 * All personal/mutable state = heap (PCO). Identity computed once.
 * Floats ONLY in M4_Jung_Complex (charge, autonomy).
 *
 * FR Coverage: 2.4.0 – 2.4.13 (M4-nara-personal-interface.md)
 *
 * ARCHITECTURE RULE: M4_Root has Holographic_Coordinate* hc
 * as its first field. Bind with HC_LINK(). Never access without GET_PTR().
 *
 * Public interface — all consumers need only:
 *   m4_init(arena, hc)              — allocate and HC-link M4 root
 *   m4_identity_compute(id, input)  — compute-once Symbol DNA + BLAKE3
 *   m4_snapshot_now(degree, epoch)  — create M4_Temporal_Now
 *   m4_advance_transformation(eng)  — modulo cascade cycle engine
 *   m4_teardown(root)               — release heap state
 *   m4_cli_dispatch(argc, argv, rt) — CLI entry point
 */
```

Contents to include (in order):
1. Include guards, includes (`ontology.h`, `psychoid_numbers.h`, `arena.h`, `m0.h`, `m2.h`, `m3.h`)
2. FR 2.4.7: Elemental Throughline constants (nucleotide-element-suit-function mapping)
3. FR 2.4.0: `M4_Symbol_DNA_Profile` struct (gene_keys_activation, nucleotide_balance, degree anchors)
4. FR 2.4.1: `M4_Input_Data` (transient), `M4_Identity_Matrix` (compute-once)
5. FR 2.4.11: `M4_Temporal_Now` struct + `m4_snapshot_now()` inline
6. FR 2.4.13: `M4_Sacred_Random`, `M4_IChing_Cast`, `M4_Tarot_Draw`, `M4_Canonical_Tag`
7. FR 2.4.3: `Divination_Vtable`, magic numbers, `M4_Tarot_State`, `M4_IChing_State`
8. FR 2.4.1: `M4_Sympathetic_Medicine` (elemental balance, chakras, ops, timing, safety)
9. FR 2.4.4: `M4_Decan_Recipe_Card`, `M4_Cycle_Engine`, `m4_advance_transformation()` inline
10. FR 2.4.9: `M4_Stall_Type`, `M4_Safety_Governor`, `m4_safety_check()` inline
11. FR 2.4.8: `M4_Container_Entry`, `M4_CONTAINER_LUT[3]`
12. FR 2.4.5: `M4_Jung_Complex` (THE ONLY floats), `M4_Jung_Type` bitfield, `M4_Alchemical_Stage` enum
13. FR 2.4.4: `M4_Lens_Vtable`, `M4_Personal_Pratibimba`, `M4_Context_Lenses`
14. FR 2.4.10: `M4_Voice_Config` (8 bytes), `M4_Transparency_Record`, `M4_Logos_Cycle_State`
15. FR 2.4.5: `M4_Epii_Integration` + `m4_mobius_return()` inline
16. PCO: `M4_PersonalContextOverlay` (the complete heap struct)
17. `M4_Root` struct (hc first field, active_cf, PCO)
18. Public API declarations: `m4_init`, `m4_identity_compute`, `m4_teardown`, `m4_verify`, `m4_cli_dispatch`

**Step 2: Verify header compiles**

```bash
echo '#include "m4.h"' > /tmp/m4_test.c && \
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 -fsyntax-only /tmp/m4_test.c
```

Expected: 0 errors, 0 warnings.

**Step 3: Commit**

```bash
git add include/m4.h
git commit -m "feat(m4): add m4.h header — Nara personal dialogical interface contract"
```

---

## Task 3: Write .rodata Constants + Init/Teardown (`src/m4.c` — Part 1)

**Files:**
- Create: `src/m4.c`
- Reference: `src/m3.c` (pattern for .rodata + init/teardown)

**Step 1: Write `src/m4.c` .rodata section**

Top of file: includes, then all `static const` data:
- `M4_PROTOCOL_LIBRARY[12][3]` — 36 decan recipe cards (stub values initially, correct structure)
- `M4_ALCHEMY_OPS[7]` — 7 alchemical op function pointer stubs
- `M4_LENS_MEF_THRESHOLD[6]` — from spec: {20, 40, 60, 80, 100, 120}
- Lens vtable stub implementations (6 static functions)
- `M4_LENS_REGISTRY[6]` — lens vtable entries
- `M4_VOICE_CONFIG` — default voice config (8 bytes)
- _Static_asserts for: `M4_Voice_Config == 8`, `M4_Container_Entry == 4`, `M4_Symbol_DNA_Profile` size

**Step 2: Write `m4_init()` and `m4_teardown()`**

Following M3 pattern exactly:

```c
M4_Root* m4_init(Coordinate_Arena* arena, Holographic_Coordinate* hc) {
    if (!arena || !hc) return NULL;
    if (hc->ql_position != 4) return NULL;  // Must be #4

    M4_Root* root = (M4_Root*)malloc(sizeof(M4_Root));
    if (!root) return NULL;

    memset(root, 0, sizeof(M4_Root));
    HC_LINK(hc, root);
    root->active_cf = cf_get(CF_FRACTAL);
    // Zero-init PCO — identity not yet computed
    return root;
}

void m4_teardown(M4_Root* root) {
    if (!root) return;
    // Free phase history if allocated
    if (root->pco.phase_history.records) free(root->pco.phase_history.records);
    if (root->hc) HC_UNLINK(root->hc);
    free(root);
}
```

**Step 3: Verify it compiles (no link needed yet)**

```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 -c src/m4.c -o /dev/null
```

Expected: 0 warnings.

**Step 4: Commit**

```bash
git add src/m4.c
git commit -m "feat(m4): add m4.c — .rodata constants, init, teardown"
```

---

## Task 4: Write Identity Compute + BLAKE3 Integration (`src/m4.c` — Part 2)

**Files:**
- Modify: `src/m4.c`
- Reference: `vendor/blake3/blake3.h`

**Step 1: Implement `m4_identity_compute()`**

```c
#include "blake3.h"

void m4_identity_compute(M4_Identity_Matrix* id, M4_Input_Data* input) {
    if (!id || !input) return;
    if (id->computed) return;  // Compute-once guard

    // Step 1: Derive Symbol DNA Profile from raw input
    // (stub derivations — real logic depends on external data)
    id->dna_profile.gene_keys_activation = 0;  // Stub: no activation yet
    id->dna_profile.nucleotide_balance.adenine_water  = input->mbti_raw & 0x03 ? 180 : 60;
    id->dna_profile.nucleotide_balance.thymine_fire   = input->mbti_raw & 0x0C ? 180 : 60;
    id->dna_profile.nucleotide_balance.cytosine_earth = input->mbti_raw & 0x30 ? 180 : 60;
    id->dna_profile.nucleotide_balance.guanine_air    = input->mbti_raw & 0xC0 ? 180 : 60;
    id->dna_profile.sun_degree_anchor  = 0;  // Stub: populated by Kerykeion via S4'
    id->dna_profile.moon_degree_anchor = 0;

    // Step 2: Compute numerological key from birthdate
    id->numerological_key = (uint32_t)(input->birth_year + input->birth_month * 100
                                       + input->birth_day);

    // Step 3: BLAKE3 quintessence — archetypal synthesis hash
    blake3_hasher hasher;
    blake3_hasher_init(&hasher);
    blake3_hasher_update(&hasher, input, sizeof(M4_Input_Data));
    uint8_t hash_out[8];
    blake3_hasher_finalize(&hasher, hash_out, 8);
    memcpy(&id->quintessence_hash, hash_out, 8);

    // Step 4: ARCHITECTURAL PRIVACY — destroy raw input immediately
    memset(input, 0, sizeof(M4_Input_Data));

    // Step 5: Mark computed
    id->computed = true;
}
```

**Step 2: Verify it compiles**

```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 -c src/m4.c -o /dev/null
```

**Step 3: Commit**

```bash
git add src/m4.c
git commit -m "feat(m4): implement m4_identity_compute with BLAKE3 quintessence"
```

---

## Task 5: Write Oracle Primitives (`src/m4.c` — Part 3)

**Files:**
- Modify: `src/m4.c`

**Step 1: Implement I-Ching casting**

```c
int m4_cast_iching(M4_Sacred_Random* rng, uint16_t cast_degree,
                   M4_IChing_Cast* out) {
    if (!rng || !out) return -1;
    memset(out, 0, sizeof(M4_IChing_Cast));
    out->cast_degree = cast_degree;

    uint8_t rand_buf[6];
    if (!m4_sacred_random(rng, rand_buf, 6)) return -EPERM;

    uint8_t hex_bits = 0;
    for (int i = 0; i < 6; i++) {
        // 3 coins from random byte: bits 0-2, heads=3 tails=2
        uint8_t sum = 0;
        for (int c = 0; c < 3; c++)
            sum += ((rand_buf[i] >> c) & 1) ? 3 : 2;
        out->lines[i] = sum;  // 6, 7, 8, or 9
        // Yang line (7 or 9) = bit set; Yin (6 or 8) = bit clear
        if (sum & 1) hex_bits |= (1u << i);
        // Changing lines: 6 (old yin) or 9 (old yang)
        if (sum == 6 || sum == 9) out->changing_mask |= (1u << i);
    }
    out->hexagram_id = hex_bits & 0x3F;
    out->result_hexagram = (hex_bits ^ out->changing_mask) & 0x3F;
    return 0;
}
```

**Step 2: Implement Tarot draw**

```c
int m4_draw_tarot(M4_Sacred_Random* rng, uint8_t count, uint16_t cast_degree,
                  M4_Tarot_Draw* out) {
    if (!rng || !out || count == 0 || count > 12) return -1;
    memset(out, 0, sizeof(M4_Tarot_Draw));
    out->cast_degree = cast_degree;
    out->draw_count = count;

    // Initialize deck 0-77
    for (int i = 0; i < 78; i++) out->cards[i] = (uint8_t)i;

    // Fisher-Yates shuffle (consent-gated random)
    uint8_t rand_buf[78];
    if (!m4_sacred_random(rng, rand_buf, 78)) return -EPERM;

    for (int i = 77; i > 0; i--) {
        uint8_t j = rand_buf[i] % (uint8_t)(i + 1);
        uint8_t tmp = out->cards[i];
        out->cards[i] = out->cards[j];
        out->cards[j] = tmp;
    }

    // Draw top N
    for (int i = 0; i < count; i++) out->drawn[i] = out->cards[i];
    return 0;
}
```

**Step 3: Verify compiles**

```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 -c src/m4.c -o /dev/null
```

**Step 4: Commit**

```bash
git add src/m4.c
git commit -m "feat(m4): implement oracle primitives — I-Ching casting + Tarot draw"
```

---

## Task 6: Write m4_verify() + CLI Dispatch (`src/m4.c` — Part 4)

**Files:**
- Modify: `src/m4.c`

**Step 1: Implement `m4_verify()`**

Verify .rodata integrity at boot:
- Voice config size == 8
- Container LUT has 3 entries
- MEF thresholds are monotonically increasing
- Protocol library has 12x3 entries (spot check)
- Elemental Throughline consistency: A=Water, T=Fire, C=Earth, G=Air

**Step 2: Implement `m4_cli_dispatch()`**

Following M3 pattern:
```c
int m4_cli_dispatch(int argc, char** argv, M4_Root* root) {
    if (argc < 2) { m4_print_info(root); return 0; }
    const char* cmd = argv[1];
    if (strcmp(cmd, "info") == 0)       { m4_print_info(root);         return 0; }
    if (strcmp(cmd, "identity") == 0)   { m4_print_identity(root);     return 0; }
    if (strcmp(cmd, "now") == 0)        { m4_print_now(argc, argv);    return 0; }
    if (strcmp(cmd, "cast") == 0)       { return m4_cli_cast(argc, argv, root); }
    if (strcmp(cmd, "advance") == 0)    { /* advance + print */ return 0; }
    if (strcmp(cmd, "lens") == 0)       { /* activate lens */ return 0; }
    if (strcmp(cmd, "pratibimba") == 0) { m4_print_pratibimba(root);   return 0; }
    fprintf(stderr, "m4: unknown command '%s'\n", cmd);
    return -1;
}
```

Implement print helpers: `m4_print_info`, `m4_print_identity`, `m4_print_now`, `m4_print_pratibimba`, `m4_cli_cast`.

**Step 3: Verify compiles**

```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 -c src/m4.c -o /dev/null
```

**Step 4: Commit**

```bash
git add src/m4.c
git commit -m "feat(m4): add m4_verify, CLI dispatch, and print helpers"
```

---

## Task 7: Integrate M4 into main.c

**Files:**
- Modify: `src/main.c`

**Step 1: Add `#include "m4.h"` to includes**

After `#include "m3.h"` (line 17).

**Step 2: Add Phase 4.9 — Initialize M4**

After M3 init block (after line 214), add:

```c
/* Phase 4.9: Initialize M4 (Nara) */
M4_Root* m4 = m4_init(&arena, mirrors[4]);
if (!m4) {
    fprintf(stderr, "[boot] Aborting: M4 init failed.\n");
    m3_teardown(m3); m2_teardown(m2); m1_teardown(m1); m0_teardown(m0);
    arena_destroy(&arena);
    return 1;
}
if (!m4_verify()) {
    fprintf(stderr, "[boot] FAIL: M4 verification failed.\n");
    m4_teardown(m4); m3_teardown(m3); m2_teardown(m2); m1_teardown(m1); m0_teardown(m0);
    arena_destroy(&arena);
    return 1;
}
printf("[boot] M4 (Nara) initialized. CF=FRACTAL. Vtable[6] + PCO loaded.\n");
```

**Step 3: Add CLI dispatch block for m4**

After m3 dispatch block:

```c
if (argc > 1 && strcmp(argv[1], "m4") == 0) {
    int rc = m4_cli_dispatch(argc - 1, argv + 1, m4);
    m4_teardown(m4); m3_teardown(m3); m2_teardown(m2);
    m1_teardown(m1); m0_teardown(m0); arena_destroy(&arena);
    return rc;
}
```

**Step 4: Add `m4_teardown(m4)` to cleanup section**

Before `m3_teardown(m3)` in all teardown sequences.

**Step 5: Build the full system**

```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
  vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
  src/main.c -o epi-logos
```

Expected: 0 warnings. Then:

```bash
./epi-logos
```

Expected: All `[boot] ... OK` lines including `[boot] M4 (Nara) initialized.`

**Step 6: Test CLI commands**

```bash
./epi-logos m4 info
./epi-logos m4 now 155
```

**Step 7: Commit**

```bash
git add src/main.c
git commit -m "feat(m4): integrate M4 Nara into main.c boot sequence + CLI dispatch"
```

---

## Task 8: Write M4 Test Suite (`src/test_m4.c`)

**Files:**
- Create: `src/test_m4.c`
- Reference: `src/test_m3.c` (pattern)

**Step 1: Write test file**

Using same TEST macro pattern as test_m3.c. Test groups:

1. **Elemental Throughline** — A=Water, T=Fire, C=Earth, G=Air constants
2. **Symbol DNA Profile** — struct size, gene_keys_activation is uint64_t
3. **Identity Compute** — BLAKE3 produces non-zero hash, input is zeroed after, computed flag set
4. **Temporal Now** — m4_snapshot_now produces valid Unified_Clock_State, degree preserved
5. **Oracle: Sacred Random** — consent gate blocks without consent, succeeds with consent
6. **Oracle: I-Ching Cast** — 6 lines in range 6-9, hexagram_id < 64, changing_mask valid
7. **Oracle: Tarot Draw** — 78 unique cards, draw_count preserved, no duplicates in drawn
8. **Modulo Cascade** — stroke wraps at 24, storey wraps at 12, decan wraps at 3
9. **Safety Governor** — contraindicated blocks, arousal threshold blocks, hysteresis band
10. **Container LUT** — 3 entries, sizes correct
11. **Voice Config** — sizeof == 8
12. **Lens MEF Thresholds** — monotonically increasing
13. **Init/Teardown** — root non-NULL, hc linked, cf set to CF_FRACTAL
14. **m4_verify()** — returns true

**Step 2: Build and run**

```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 -fsanitize=address,undefined \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
  vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
  src/test_m4.c -o test_m4 && ./test_m4
```

Expected: All tests pass, 0 failures, no ASan/UBSan errors.

**Step 3: Commit**

```bash
git add src/test_m4.c
git commit -m "test(m4): add test_m4.c — full M4 Nara verification suite"
```

---

## Task 9: Final Verification + Full System Build

**Files:**
- No new files — verification pass

**Step 1: Full build with all M-branches**

```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
  vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
  src/main.c -o epi-logos
```

Expected: 0 warnings.

**Step 2: Run boot sequence**

```bash
./epi-logos
```

Expected: All `[boot] ... OK` including M4.

**Step 3: Run all test suites**

```bash
# M4 tests
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 -fsanitize=address,undefined \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
  vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
  src/test_m4.c -o test_m4 && ./test_m4

# Existing tests still pass
clang -std=c11 -Wall -Wextra -I include -fsanitize=address,undefined \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/test_pillar1_gaps.c -o test_pillar1 && ./test_pillar1
```

**Step 4: Run CLI smoke tests**

```bash
./epi-logos m4 info
./epi-logos m4 identity
./epi-logos m4 now 155
./epi-logos m4 now 540
./epi-logos m4 cast iching
./epi-logos m4 cast tarot 3
./epi-logos m4 advance
./epi-logos m4 pratibimba
```

**Step 5: Commit final state**

```bash
git add -A
git commit -m "feat(m4): M4 Nara complete — vtable dispatch, BLAKE3 quintessence, oracle primitives, temporal now"
```

---

## Build Command Reference

**Full system build:**
```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
  vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
  src/main.c -o epi-logos
```

**Test build:**
```bash
clang -std=c11 -Wall -Wextra -I include -I vendor/blake3 -fsanitize=address,undefined \
  src/psychoid_numbers.c src/engine.c src/arena.c src/families.c \
  src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c \
  vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c \
  src/test_m4.c -o test_m4
```

---

## Spec Fidelity Checklist

After implementation, verify against spec:

- [ ] All FRs (2.4.0-2.4.13) have corresponding function or constant
- [ ] Every struct has its `_Static_assert`
- [ ] M4_Root.hc is present and HC_LINK'd
- [ ] Context frame via `CF_TABLE[CF_FRACTAL]`
- [ ] All BIMBA LUTs are `static const`
- [ ] All PRATIBIMBA instances are heap-allocated
- [ ] `m4_cli_dispatch` covers all public operations
- [ ] `boot_verify_web()` extended with M4-specific checks
- [ ] Elemental Throughline consistent across M3/M4
- [ ] Float isolation: only Jung_Complex.charge + .autonomy
- [ ] Oracle emissions produce M4_Canonical_Tag with nucleotide + degree
- [ ] M4_Temporal_Now works at 0 planets (stub mode)
- [ ] BLAKE3 vendored and producing 64-bit quintessence hash
- [ ] Identity input memset to 0 after compute
- [ ] Modulo cascade: stroke%24 → storey%12 → decan%3

---

*Plan Version: 1.0*
*Date: 2026-03-06*
*Tasks: 9*
*Estimated commits: 9*
