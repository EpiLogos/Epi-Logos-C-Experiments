---
title: "Fibonacci Ground (Level 0, 60-fold meta-lens) — Temporal Substrate Integration Handoff"
type: cycle-3-planning-handoff
status: applied-to-plan (2026-06-09 — see numbering note in §2)
created: 2026-06-08
coordinate: "M'"
sub_coordinate: "M2' (Fibonacci ground source) + M3' (lens architecture host) + M4' (Nara temporal consumer) + S4'-0' (Khora write authority) + portal M3 plugin"
handoff_scope: "Planning + canon-spec amendments + new cycle-3 tranches. NOT cycle-3 execution. M-dev runs the new tranches separately, after their parent plan files have been updated per this handoff."
c_0_source_coordinates:
  - "M2'"
  - "M3'"
  - "M4'"
  - "M3'-SPEC"
  - "M4'-SPEC"
  - "M'-USER-CONTEXT-SKILL-SPEC"
c_0_related_coordinates:
  - "M0'"
  - "M1'"
  - "S0"
  - "S3'"
  - "S4'"
dev_decisions:
  - "Fibonacci Ground (`#2-0` Parashakti Archetypal Numerical Ground, 60-fold, LCM(6,5,12)) is canonically Level 0 of the temporal substrate — pre-lensic, pre-walk, pre-tick. It is the (00/00) context frame of the clock and the substrate generator for everything else. Final."
  - "The 4-level substrate stack — Level 0 Fibonacci Ground (60-fold) → Level 1 tick12 (M1 spanda, derived 60/5) → Level 2 16 lenses (M3 simultaneous apertures) → Level 3 9 walks (M1–M3 diachronic) — is the canonical reading order. tick12 is NOT a peer of the 16 lenses; it is the pentadic quantization of the same ground the lenses partition. Final."
  - "The `+1` of the `16+1` Mahamaya lens-stack is the Level 0 Fibonacci Ground (meta-lens), NOT a 17th aperture at Level 2. The 16-lens matrix at Level 2 is complete and exhaustive at its level. Final."
  - "Every `Clock_Degree_Node` carries intrinsic `fibonacci_position: u8` (0–59) and `fibonacci_digit: u8` (0–9) fields. These are properties of the ground, not derived from a walk or lens. Final."
  - "The 24-fold backbone (Lens 7, 15°×24) is the structural bridge between Level 1 (tick12) and Level 2 (lensing). It is simultaneously the 24 amino-acid palindromic codons, the 24 hours of the day, and the 24 zodiacal sub-divisions (12 cusps + 12 midpoints). `Clock_Backbone_Node` is a typed primitive. Final."
  - "Kerykeion's three temporal modes (Natal, RealTime, Kairotic) coexist as nested readings of the same substrate. They do NOT swap. `M4_Temporal_Now` carries all three simultaneously via a typed `KairosFrame` discriminated union. Final."
  - "Bioquaternion update cadence is canonical at per-element-tick (8× per cycle) via Möbius descent `q_p^(n+1) = q_p^(n) − log(9/8) · ∇_M E_total`, per [[33-harmonic-energy-channel-handoff]] §1.2. This handoff inherits that decision and does not relitigate it."
  - "Khora day/NOW writes remain episodic (tranche-complete) per T19.11. The reconciliation with live tick-driven renders is by ontological role: the Fibonacci Ground is the live substrate; the NOW.md is the episodic crystallisation trace. They are different temporal apertures over the same ground and do not require synchronisation. Frontmatter inscription of ground coordinates at write time is sufficient."
  - "T19.12 ([[19-contemplation-surface-integration]] §19.12) is affirmed as-is. It already specifies the Mercurius → `m4_snapshot_now()` wiring correctly. This handoff adds NO further changes to T19.12 — it ratifies it."
  - "All thresholds and config values stay sourced from `~/.epi-logos/config.toml`. No hardcoded numbers introduced by this handoff."
dev_relations:
  - { type: implements, target: "[[M3'-SPEC]]" }
  - { type: implements, target: "[[M4'-SPEC]]" }
  - { type: implements, target: "[[02-16-lenses-backbone-temporal]]" }
  - { type: depends_on, target: "[[33-harmonic-energy-channel-handoff]]" }
  - { type: depends_on, target: "[[04-m3-mahamaya-reconciliation]]" }
  - { type: depends_on, target: "[[05-m4-nara-reconciliation]]" }
  - { type: depends_on, target: "[[19-contemplation-surface-integration]]" }
  - { type: depends_on, target: "[[24-m3-mahamaya-frontend-deep]]" }
  - { type: depends_on, target: "[[13-decision-register]]" }
dev_changed_paths: []
---

# §0 — Handoff Context

This tranche is a **planning + canon-amendment handoff** following the substrate-clarity session of 2026-06-08. It resolves a single architectural-clarity question (how the 12-fold tick, live Kerykeion time, Nara user-tracking, the Mahamaya 60×6 meta-lens, and the day/NOW context cohere into a single firm temporal substrate) by promoting the **Fibonacci Ground** (`#2-0` Parashakti, 60-fold, LCM(6,5,12)) to its canonical position as **Level 0** of the substrate stack — pre-lensic, pre-walk, pre-tick, intrinsic to every degree node.

The architecture is not new. It is specified in [[02-16-lenses-backbone-temporal]] §0 ("The Fibonacci Ground: Level 0 (Meta-Lens, Pre-Lensic)") under `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/`. What this handoff does is propagate the Level 0 framing into cycle-3 reconciliation tranches, into the canonical kernel header files (`m3.h`, `m4.h`), into the NOW.md frontmatter schema, and into the M3 Mahamaya portal plugin render. After these amendments, every cycle-3 surface that touches temporality reads from a single named substrate.

This handoff also affirms two existing tranches without changes:
- **T19.12** ([[19-contemplation-surface-integration]] lines 139-145) — Mercurius (CF3) → `m4_snapshot_now()` wiring. Correct as written. The kairos cache derivation in [`Body/S/S0/epi-cli/src/nara/clock.rs:53-85`](Body/S/S0/epi-cli/src/nara/clock.rs) already proves the substrate-generation path; T19.12 closes the M4 EBM-consumption pipeline. No edit needed.
- **[[33-harmonic-energy-channel-handoff]] §1.2** — bioquaternion Möbius-descent cadence (per element-tick, `log(9/8)` step). This handoff inherits that decision; no relitigation.

The session this came from was the reading of the temporal substrate as a coherent four-layer hierarchy. The five concrete moves below are the propagation of that reading into deployable cycle-3 tasks. They are independently dispatchable.

## Canonical state to know (most-recent / most-load-bearing)

- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/02-16-lenses-backbone-temporal.md` §0 (Level 0 Fibonacci Ground definition) and §"Lenses vs Walk Modes vs Tick vs Fibonacci Ground" (the 4-level hierarchy table)
- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/03-spanda-double-helix-12fold.md` (tick12 = 60/5 derivation)
- `Body/M/M3/m3-mahamaya-core/include/m3/m3.h` (M3 kernel header, Clock_Degree_Node hostsite for fibonacci_position/digit)
- `Body/S/S0/epi-lib/include/m4.h:258-276` (M4_Temporal_Now, current planet_degrees[10] hostsite — KairosFrame discriminated union lands adjacent)
- `Body/S/S0/epi-cli/src/nara/clock.rs:53-85` (current kairos-driven ClockState derivation — proves Level 1 from Level 0 in code today)
- `Body/S/S0/portal-core/src/kernel.rs:346-477` (MathemeHarmonicProfile — Level 2 lens-resonance carrier)
- `Idea/Bimba/World/NOW.md` (NOW template; current `c_3_*` schema per T05.19 — extension hostsite for Fibonacci-grounded keys)
- `Body/M/epi-theia/extensions/m3-mahamaya/` (M3 portal plugin — render hostsite for Level 0 outer ring)

---

# §1 — IMMEDIATE: Canon-spec amendments + kernel-header additions

These edits happen NOW, independent of cycle-3 timing. They make the Level 0 Fibonacci Ground explicit in canonical specs and kernel headers so the cycle-3 tranches below can reference typed primitives rather than naming them inline. Paper edits + struct additions only — no execution logic.

## §1.1 — `M3'-SPEC.md` — promote Level 0 to top-of-§8

`Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md` §8 currently introduces the 16+1 lens-stack without first naming Level 0. Insert a new §8.0 above the existing §8.1.

**Insert (new §8.0):**

> ### §8.0 — Level 0: The Fibonacci Ground (Meta-Lens, Pre-Lensic)
>
> The M3 Mahamaya lens architecture is a four-level hierarchy. **Level 0 is the Fibonacci Ground at `#2-0` (Parashakti Archetypal Numerical Ground)** — pre-lensic, pre-walk, pre-tick. The 16 simultaneous apertures of §8.1 (the "16-fold lens-stack") are Level 2 partitions OVER the Level 0 ground; they do not constitute the ground.
>
> The Fibonacci Ground period is `LCM(6, 5, 12) = 60` — the synchronization period of QL(6) × pentad(5) × zodiacal(12). The Pisano period `π(10) = 60` is its digital unfolding in base-10. Laid over the clock face at 6° per step: **60 × 6° = 360°**. Structural law (companion to `_Static_assert(64 * 6 - 24 == 360)`):
>
> ```c
> _Static_assert(60 * 6 == 360, "Fibonacci ground period × 6°/step = full clock");
> ```
>
> Every `Clock_Degree_Node` carries intrinsic `fibonacci_position: u8` (0–59) and `fibonacci_digit: u8` (0–9). These are properties of the ground, not derived from any lens or walk.
>
> **Four-level hierarchy:**
>
> | Level | Name | Cardinality | Derivation | Subsystem |
> |---|---|---|---|---|
> | 0 | Fibonacci Ground | 60 | LCM(6,5,12), Pisano π(10) | M2 (`#2-0`) |
> | 1 | tick12 (spanda) | 12 | 60 / 5 (pentadic quantization) | M1 |
> | 2 | 16 lenses | 16 | exhaustive factor-pairs of 360 | M3 |
> | 3 | 9 walks | 9 | sequential degree-space traversal | M1–M3 |
>
> The `+1` of the canonical `16+1` lens-stack count refers to Level 0 (this section). It is NOT a 17th aperture at Level 2. The 16-lens matrix in §8.1 is complete and exhaustive at its level.
>
> The full hierarchy is specified in `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/02-16-lenses-backbone-temporal.md` §0 and §"Lenses vs Walk Modes vs Tick vs Fibonacci Ground".

**Verification:**

```bash
grep -nE '§8\.0|Fibonacci Ground|60 \* 6 == 360|fibonacci_position' Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md
```

Expected: the new §8.0 lines present; §8.1 lens-stack §s renumber-clean; the static-assert quoted in spec body.

## §1.2 — `m3.h` — add `Clock_Backbone_Node` typed primitive

The 24-fold backbone (Lens 7, 15°×24) is currently named throughout the docs but has no typed home in `m3.h`. Add the struct adjacent to the existing `Clock_Degree_Node` definition.

**Target file:** `Body/M/M3/m3-mahamaya-core/include/m3/m3.h`

**Insert** (immediately after the `Clock_Degree_Node` definition):

```c
/* ------------------------------------------------------------------ */
/* Lens 7 (15°×24) projection — the structural backbone of the clock. */
/* The 24 nodes are simultaneously:                                   */
/*   - 24 amino-acid palindromic codons (genetic anchors)             */
/*   - 24 hours of the day (15°/hour, hour_of_day == backbone_index)  */
/*   - 24 zodiacal sub-divisions (12 cusps + 12 midpoints)            */
/* These three identities collapse to one struct because they ARE the */
/* same Lens-7 projection read through three subsystems.              */
/* ------------------------------------------------------------------ */
typedef struct {
    uint16_t degree;          /* 0, 15, 30, ..., 345 (15° steps)     */
    uint8_t  backbone_index;  /* 0..23                                */
    uint8_t  hour_of_day;     /* equal to backbone_index              */
    uint8_t  zodiac_sign;     /* backbone_index / 2 (0=Aries..11=Pis) */
    uint8_t  is_cusp;         /* 1 when backbone_index % 2 == 0       */
    uint8_t  amino_acid_idx;  /* index into AMINO_ACID_TABLE[24]      */
    uint8_t  is_palindromic;  /* always 1 for backbone nodes          */
    uint8_t  _pad;            /* explicit pad — align to 12 bytes     */
} Clock_Backbone_Node;

_Static_assert(sizeof(Clock_Backbone_Node) == 12,
               "Clock_Backbone_Node packs to 12 bytes");

/* Module-owned backbone table — built once at boot from Lens-7. */
extern const Clock_Backbone_Node CLOCK_BACKBONE[24];
```

**Verification:**

```bash
grep -nE 'Clock_Backbone_Node|CLOCK_BACKBONE\[24\]' Body/M/M3/m3-mahamaya-core/include/m3/m3.h
make -C Body/M/M3/m3-mahamaya-core test
```

Expected: struct present, _Static_assert compiles, existing M3 tests pass unchanged (no behavior change yet — see §3.3 for the population task).

## §1.3 — `m4.h` — add `KairosFrame` discriminated union; refactor `M4_Temporal_Now` to carry all three modes

`Body/S/S0/epi-lib/include/m4.h:258-276` currently exposes a flat `M4_Temporal_Now` with a single `planet_degrees[10]`. The three Kerykeion modes (Natal, RealTime, Kairotic) coexist as nested readings of the same substrate (see §0 dev_decisions). Refactor to a discriminated-union layout.

**Replace `M4_Temporal_Now` definition (currently m4.h:258-276) with:**

```c
typedef enum {
    KAIROS_FRAME_NATAL    = 0,  /* From PASU.md birth-anchor; never changes per-session */
    KAIROS_FRAME_REALTIME = 1,  /* Polled live from kairos cache (Mercurius) */
    KAIROS_FRAME_KAIROTIC = 2   /* Frozen at oracle-cast; 4h decay window */
} KairosFrameKind;

typedef struct {
    KairosFrameKind kind;
    uint64_t        captured_at_ns;     /* Capture-time nanos since epoch */
    uint64_t        decays_at_ns;       /* For KAIROTIC: captured_at + 4h; else UINT64_MAX */
    float           planet_degrees[10]; /* Canonical mod-10: Sun=0..Pluto=9 (no Earth) */
    int8_t          pp;                 /* Oracle charges — set only on KAIROTIC */
    int8_t          mm;
    int8_t          mp;
    int8_t          pn;
    uint8_t         _pad[2];            /* Align to 16-byte boundary  */
} KairosFrame;

_Static_assert(sizeof(KairosFrame) == 64,
               "KairosFrame packs to 64 bytes — one L1 cache line");

typedef struct {
    KairosFrame natal;     /* Always present; populated at PASU load */
    KairosFrame realtime;  /* Refreshed by Mercurius polling (T19.12) */
    KairosFrame kairotic;  /* Optional — present only when an oracle is live */
    uint8_t     kairotic_active;  /* 0 when kairotic frame is stale/absent */
    uint8_t     _pad[7];
    /* … existing M4_Temporal_Now fields below (tick12, exact_degree_720, etc.) … */
} M4_Temporal_Now;
```

**Backwards-compatibility accessor — add immediately after the struct:**

```c
/* Convenience: read the canonical "live" planet_degrees view.
 * Returns kairotic if active (highest semantic specificity),
 * else realtime, else falls back to natal. Never returns NULL. */
static inline const float *m4_planet_degrees_live(const M4_Temporal_Now *now) {
    if (now->kairotic_active) return now->kairotic.planet_degrees;
    return now->realtime.planet_degrees; /* natal-degree fallback handled at populator */
}
```

**Verification:**

```bash
grep -nE 'KairosFrame|m4_planet_degrees_live' Body/S/S0/epi-lib/include/m4.h
make -C Body/S/S0/epi-lib test
```

Expected: struct/enum/accessor present, _Static_asserts compile, existing M4 tests pass (legacy callers reading `planet_degrees[10]` are migrated to `m4_planet_degrees_live(now)` in §3.5).

---

# §2 — Cycle-3 tranche amendments

These add definitive tranches to existing cycle-3 reconciliation docs. Each tranche is dispatchable independently and produces working, testable code on its own. Tranche numbering continues each parent doc's existing sequence.

> **APPLIED 2026-06-09 (shape-closure round 2).** The amendments below have been landed in their parent docs with final numbering: **§2.1 → Tranche 5.24**, **§2.5 → Tranche 5.25** (in `05-m4-nara-reconciliation.md`; 5.21/5.22 were taken by handoff-33 Streams, 5.23 by the q_-vocabulary tranche), **§2.3 → Tranche 4.15** (in `04-m3-mahamaya-reconciliation.md`, combined with §1.2 — struct + populator land as one tranche), **§2.4 → Tranche 24.19** (in `24-m3-mahamaya-frontend-deep.md`). §1.1 (M3'-SPEC §8.0) is landed directly in `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`. §1.3 (KairosFrame) is folded into Tranche 5.25 as an atomic struct+migration tranche (avoids the broken intermediate state the §1.3/§2.5 split would create). §5's register rows are landed as DR-FIB-1..5 (VALIDATED) in `13-decision-register.md`. **Residency correction:** `Body/M/M3/m3-mahamaya-core` does not exist in the repo — the canonical M3 kernel hostsite is `Body/S/S0/epi-lib/{include,src}/m3.{h,c}`; Tranche 4.15 carries the residency-resolution instruction. This file is now historical source for those tranches; the parent-doc tranche text is authoritative where they differ.

## §2.1 — [[05-m4-nara-reconciliation]] — new tranche **T05.21**: Fibonacci-grounded NOW frontmatter

**Parent doc:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/05-m4-nara-reconciliation.md`
**Insertion point:** Immediately after the existing T05.19 frontmatter-schema tranche (line 138).
**Depends on:** §1.2 (`Clock_Backbone_Node` typed) — m-dev gates this tranche on §1.2 landing first.

**Insert as new tranche:**

> 21. **T05.21 — Stamp Level 0 Fibonacci Ground coordinates into NOW.md frontmatter** *(spec-update + Khora write-path)*
>
> Extend the NOW frontmatter schema established by T05.19 with four Level 0 Fibonacci Ground keys, stamped by Khora at NOW.md write time (`session_start` and every `tranche.complete.*` event per T19.11):
>
> ```yaml
> c_3_fibonacci_position: 0..59      # Position on the 60-fold Fibonacci Ground (#2-0)
> c_3_fibonacci_digit: 0..9          # Pisano-period digit at this position
> c_3_tick12: 0..11                  # M1 spanda heartbeat — derived (fib_pos / 5)
> c_3_backbone_index: 0..23          # Lens 7 anchor — nearest 15° backbone node
> ```
>
> **Write-path edits** (Khora write authority):
> - `Body/S/S4/ta-onta/S4-0p-khora/modules/now-frontmatter-builder.ts` — read current `M4_Temporal_Now` (`m4_snapshot_now()` via FFI) and emit the four keys above. Compute `c_3_fibonacci_position` from Sun degree (kairos cache) via the Hopf-projected `clock.rs:hopf_project`; `c_3_fibonacci_digit` from `pisano_digit_lut[c_3_fibonacci_position]` (new LUT in `Body/M/M3/m3-mahamaya-core/src/fibonacci_ground.c`); `c_3_tick12` from `c_3_fibonacci_position / 5`; `c_3_backbone_index` from `(c_3_fibonacci_position * 24) / 60`.
> - `Idea/Bimba/World/NOW.md` (template) — declare all four keys in the canonical frontmatter block alongside the existing T05.19 keys (`c_3_tranche_mode`, `c_3_response_orbit`, `c_3_klein_weighting`, `c_3_briefing_emitted`).
> - `Body/S/S1/hen-compiler-core/src/validator/frontmatter_schema.rs` — register the four keys with their integer ranges; out-of-range values become a Hen lint ERROR (not warning).
>
> **Why this matters:** Every NOW.md becomes a Fibonacci-grounded trace. Graphiti edges can then carry ground coordinates as edge properties (`HAS_DAY` edges gain `fibonacci_position` to make `nara_journal::period_reading(day_range)` walk episodes in ground-coordinate order). The live tick-driven portal render and the episodic NOW.md inscription are reconciled by both reading the same ground at their own temporal apertures — no further synchronisation contract needed.
>
> **Verification:**
> ```bash
> grep -nE 'c_3_fibonacci_position|c_3_fibonacci_digit|c_3_tick12|c_3_backbone_index' Idea/Bimba/World/NOW.md
> pnpm -C Body/S/S4/ta-onta/S4-0p-khora test now-frontmatter-builder
> cargo test -p hen-compiler-core frontmatter_schema::fibonacci_keys_round_trip
> ```
> Expected: NOW.md template declares all four keys; Khora unit-test fixture writes a NOW.md with non-zero Fibonacci coordinates derived from a known kairos-cache Sun degree; Hen lint test asserts out-of-range value (e.g. `c_3_fibonacci_position: 60`) returns a schema ERROR.

## §2.2 — [[19-contemplation-surface-integration]] T19.12 — **AFFIRMED, NO EDIT**

T19.12 (lines 139-145) already specifies the Mercurius (CF3) → `m4_snapshot_now()` wiring correctly. With §1.3 above landing the typed `KairosFrame`, T19.12's `populates planet_degrees[10] in canonical mod-10 order` instruction is satisfied by populating `M4_Temporal_Now.realtime.planet_degrees[10]` (the RealTime KairosFrame). No edit to T19.12 text needed.

**M-dev note:** When executing T19.12, the implementer reads §1.3 of this handoff for the new `KairosFrame` layout. The T19.12 verification command `cargo test -p epi-lib m4_snapshot_now_populates_planet_degrees` should be updated by m-dev (not by this handoff) to assert population of `.realtime.planet_degrees` rather than the top-level slot.

## §2.3 — [[04-m3-mahamaya-reconciliation]] — new tranche **T04.N+1**: populate `CLOCK_BACKBONE[24]` at boot

**Parent doc:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/04-m3-mahamaya-reconciliation.md`
**Insertion point:** End of the tranche list (m-dev assigns the next available T04.* number when landing).
**Depends on:** §1.2 (`Clock_Backbone_Node` struct typed).

**Insert as new tranche:**

> **T04.N+1 — Build `CLOCK_BACKBONE[24]` at M3 boot from Lens 7 (15°×24) projection** *(M3 kernel)*
>
> Create `Body/M/M3/m3-mahamaya-core/src/backbone.c` exporting the populator:
>
> ```c
> #include "m3/m3.h"
> #include "m3/amino_acid_table.h"  /* existing 24-entry codon table */
>
> const Clock_Backbone_Node CLOCK_BACKBONE[24] = { 0 };  /* zeroed; populated at boot */
>
> void m3_build_backbone(void) {
>     for (uint8_t i = 0; i < 24; ++i) {
>         Clock_Backbone_Node *n = (Clock_Backbone_Node *)&CLOCK_BACKBONE[i];
>         n->degree         = (uint16_t)(i * 15);
>         n->backbone_index = i;
>         n->hour_of_day    = i;
>         n->zodiac_sign    = i / 2;
>         n->is_cusp        = (i % 2 == 0) ? 1 : 0;
>         n->amino_acid_idx = i;
>         n->is_palindromic = 1;
>         n->_pad           = 0;
>     }
> }
> ```
>
> Wire `m3_build_backbone()` into `m3_init()` (existing M3 boot path). Add `Body/M/M3/m3-mahamaya-core/tests/backbone_table_contract.c`:
>
> ```c
> #include "m3/m3.h"
> #include <assert.h>
>
> int main(void) {
>     m3_init();
>     assert(CLOCK_BACKBONE[0].degree == 0);
>     assert(CLOCK_BACKBONE[12].degree == 180);
>     assert(CLOCK_BACKBONE[23].degree == 345);
>     for (int i = 0; i < 24; ++i) {
>         assert(CLOCK_BACKBONE[i].backbone_index == i);
>         assert(CLOCK_BACKBONE[i].hour_of_day == i);
>         assert(CLOCK_BACKBONE[i].zodiac_sign == i / 2);
>         assert(CLOCK_BACKBONE[i].is_cusp == ((i % 2 == 0) ? 1 : 0));
>         assert(CLOCK_BACKBONE[i].is_palindromic == 1);
>     }
>     return 0;
> }
> ```
>
> **Verification:**
> ```bash
> make -C Body/M/M3/m3-mahamaya-core test backbone_table_contract
> ```
> Expected: PASS. Existing M3 tests (`m3_test_*`) remain green.

## §2.4 — [[24-m3-mahamaya-frontend-deep]] — new tranche **T24.N+1**: Fibonacci Ground outer ring in `CosmicClockPlugin`

**Parent doc:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/24-m3-mahamaya-frontend-deep.md`
**Insertion point:** Within the `CosmicClockPlugin` section, after the existing 16-lens annular-sector render tranche.
**Depends on:** §1.2 (`Clock_Backbone_Node`), §2.3 (`CLOCK_BACKBONE[24]` populated at boot), §1.3 (`KairosFrame` for live natal/realtime markers).

**Insert as new tranche:**

> **T24.N+1 — Render the Fibonacci Ground (Level 0) as the outermost ring of `CosmicClockPlugin`** *(M3 portal plugin)*
>
> Add a new render layer to `Body/M/epi-theia/extensions/m3-mahamaya/src/cosmic-clock-plugin.tsx`. The Fibonacci Ground sits OUTSIDE the existing 16-lens annular sectors, framing them as the substrate they partition.
>
> **Render contract:**
>
> 1. **60-position outer ring** — render 60 wedges at 6° each. Each wedge labelled with `fibonacci_digit` (0–9) from the Pisano-period LUT.
> 2. **Cardinal-zero highlights** — Fibonacci positions {0, 15, 30, 45} render as filled circles (the 4 quadrant anchors at 0°, 90°, 180°, 270°). Colour: `var(--epi-cardinal-anchor)`.
> 3. **Zodiacal-five secondary anchors** — Fibonacci positions {5, 10, 20, 25, 35, 40, 50, 55} render as smaller open circles. Colour: `var(--epi-zodiacal-anchor)`.
> 4. **Two live markers**:
>    - **Natal Sun** — read `m4_snapshot_now().natal.planet_degrees[0]`, project to `fibonacci_position = (sun_deg * 60 / 360) mod 60`, render as a gold ring at that position.
>    - **Live Sun** — read `m4_planet_degrees_live(m4_snapshot_now())[0]`, project the same way, render as a moving silver dot. Updates on every `subscribeToProfileTick` callback (Level 1 tick12 boundary).
> 5. **Backbone-node tick marks** — render 24 short radial ticks at the `CLOCK_BACKBONE[i].degree` positions, slightly inside the 60-position ring. Backbone-index 0 (midnight / 0° Aries cusp) emphasised.
>
> **Layer order (outer → inner):** Fibonacci Ground (new) → 24-backbone tick marks (new) → 16-lens annular sectors (existing) → 9-walk path overlay (existing) → 3D torus core (existing).
>
> **Why this matters:** The substrate becomes visible. The user sees the (00/00) context frame as the outer envelope of the clock. The relationship between their natal-Sun fibonacci-position (structural identity) and the live-Sun fibonacci-position (current ground state) is rendered as the geometric distance between gold ring and silver dot — directly inviting the lens / walk / contemplation surfaces that read from the same ground.
>
> **Verification:**
> ```bash
> pnpm -C Body/M/epi-theia/extensions/m3-mahamaya test cosmic-clock-plugin
> pnpm -C Body/M/epi-theia/extensions/m3-mahamaya storybook -- --test fibonacci-ground-ring
> ```
> Expected: render snapshot matches reference with 60 wedges, 4 cardinal anchors, 8 zodiacal anchors, 24 backbone ticks, gold natal ring + silver live dot present. Storybook scene `fibonacci-ground-ring` exports a static prop snapshot for design review.

## §2.5 — [[05-m4-nara-reconciliation]] — new tranche **T05.22**: KairosFrame discriminated union — wire into all M4 consumers

**Parent doc:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/05-m4-nara-reconciliation.md`
**Insertion point:** After T05.21 (§2.1 above).
**Depends on:** §1.3 (`KairosFrame` enum + struct landed in `m4.h`).

**Insert as new tranche:**

> 22. **T05.22 — Migrate M4 consumers from flat `planet_degrees[10]` to typed `KairosFrame` discriminated union** *(M4 kernel + Rust callers)*
>
> §1.3 of [[35-fibonacci-ground-level-0-temporal-substrate]] adds `KairosFrame` and refactors `M4_Temporal_Now` to carry Natal + RealTime + Kairotic frames simultaneously. Every M4 consumer that previously read the flat top-level `planet_degrees[10]` must migrate to the `m4_planet_degrees_live()` accessor (or, where mode-specificity matters, read the explicit frame).
>
> **Consumer migrations (search-and-replace + semantic check):**
>
> | Caller | Current read | New read | Mode |
> |---|---|---|---|
> | `Body/S/S0/epi-cli/src/nara/clock.rs:53-85` (ClockState derivation) | `kairos.planets[sun].degree` (Sun = kairos cache) | unchanged — clock.rs reads kairos cache directly, predates KairosFrame | n/a |
> | `Body/S/S0/epi-lib/src/m4/medicine.c` (`body_zones_for_elem_sig`) | `now->planet_degrees[i]` | `m4_planet_degrees_live(now)[i]` | live |
> | `Body/S/S0/epi-lib/src/m4/oracle.c` (oracle charge accumulator) | `now->planet_degrees[i]` | `now->kairotic.planet_degrees[i]` (explicit) | kairotic |
> | `Body/S/S0/epi-lib/src/m4/identity.c` (natal-chart projector) | `now->planet_degrees[i]` | `now->natal.planet_degrees[i]` (explicit) | natal |
> | `Body/S/S4/ta-onta/S4-4p-anima/modules/janus-weighting.ts` (T12.18) | FFI `planet_degrees[10]` flat | FFI `m4_planet_degrees_live()` | live |
> | `Body/S/S4/ta-onta/S4-5p-aletheia/modules/mercurius-relay.ts` (T19.12 populator) | writes top-level `planet_degrees[10]` | writes `now->realtime.planet_degrees[10]`; also sets `now->realtime.captured_at_ns` | realtime |
> | `Body/M/epi-theia/extensions/m3-mahamaya/src/cosmic-clock-plugin.tsx` (T24.N+1 §2.4) | n/a (new) | reads `now->natal` AND `m4_planet_degrees_live(now)` for two markers | both |
>
> **Where mode specificity matters** the consumer reads the explicit frame. Where the consumer just wants "the canonical live degrees" the accessor wins (preserves the "kairotic if active else realtime" precedence rule).
>
> **Test contract:**
> - `cargo test -p epi-lib m4_kairos_frame_natal_persists_across_session` — assert `natal` field is unchanged after a session of mutations to `realtime`.
> - `cargo test -p epi-lib m4_kairos_frame_kairotic_decays` — assert `kairotic_active = 0` once `now_ns > now->kairotic.decays_at_ns`.
> - `cargo test -p epi-lib m4_planet_degrees_live_precedence` — assert accessor returns `kairotic.planet_degrees` when `kairotic_active = 1`, else `realtime.planet_degrees`.
> - All existing M4 tests pass post-migration (no behavior change at the value level for default natal+realtime flows).
>
> **Verification:**
> ```bash
> grep -rn 'now->planet_degrees' Body/S/S0/epi-lib/src/m4 Body/S/S4/ta-onta
> # Expected: zero hits — all consumers migrated to m4_planet_degrees_live() or explicit-frame access.
> make -C Body/S/S0/epi-lib test
> cargo test -p epi-lib m4_kairos
> ```

---

# §3 — Dispatch order + dependency graph

```
§1.1 (M3'-SPEC §8.0 Level 0 statement)  ──┐
§1.2 (m3.h Clock_Backbone_Node struct)  ──┼──→ §2.1 (T05.21 NOW frontmatter)
                                          │
§1.3 (m4.h KairosFrame discriminated)   ──┤
                                          │
§2.3 (T04.N+1 backbone populator) <───────┘ (depends on §1.2)
                                          
§2.3 (backbone populated) ────────────────→ §2.4 (T24.N+1 portal render)
§1.3 (KairosFrame typed) ─────────────────→ §2.4 (portal natal/live markers)
                                            §2.5 (T05.22 consumer migration)
                                            §2.2 (T19.12 affirmed — writes to .realtime)
```

**M-dev recommended dispatch (sequential, with two parallelisable pairs):**

1. **§1.1** (paper-edit M3'-SPEC) — single agent, 30 min
2. **§1.2 + §1.3 in parallel** (header additions, independent) — two agents
3. **§2.3** (backbone populator) — depends on §1.2; one agent
4. **§2.1 + §2.5 in parallel** — both depend on §1.2/§1.3; two agents
5. **§2.4** (portal render) — depends on §2.3 and §1.3; one agent

T19.12 (§2.2) is unchanged from existing cycle-3 schedule.

---

# §4 — Self-review checklist

- **Spec coverage** — five concrete moves from the substrate-clarity session all present: NOW frontmatter (§2.1), Clock_Backbone_Node typed (§1.2 + §2.3), Mercurius→snapshot wiring (§2.2 affirms T19.12), portal Fibonacci-ring render (§2.4), KairosFrame discriminated (§1.3 + §2.5). ✓
- **No placeholders** — every code block is concrete (struct definitions, populator function, render layers, test commands). No "TBD", no "similar to". ✓
- **Type consistency** — `KairosFrame`/`KairosFrameKind` used identically in §1.3 and §2.5; `Clock_Backbone_Node` and `CLOCK_BACKBONE[24]` consistent across §1.2, §2.3, §2.4; `m4_planet_degrees_live()` accessor named identically in §1.3 + §2.5 + §2.4. ✓
- **File paths exact** — every Insert/Edit cites the canonical path. Cycle-3 doc references use the `2026-06-02-m-prime-cycle-3-design-reconciliation/` folder. M3 kernel under `Body/M/M3/`, M4 kernel under `Body/S/S0/epi-lib/`. ✓
- **Test contracts present** — every tranche names a runnable verification command with expected outcome. ✓
- **Affirmations explicit** — T19.12 named as affirmed-no-edit; harmonic-energy §1.2 Möbius-descent cadence inherited; T05.19 schema extended not replaced. ✓

---

# §5 — Decision register entries

To be appended to [[13-decision-register]] when this handoff is accepted:

- **DR-FIB-1** — Fibonacci Ground (`#2-0` Parashakti, 60-fold, LCM(6,5,12)) is canonically Level 0 of the temporal substrate. The `+1` of the `16+1` Mahamaya lens-stack refers to Level 0, not a 17th aperture at Level 2.
- **DR-FIB-2** — Every `Clock_Degree_Node` carries intrinsic `fibonacci_position: u8` (0–59) and `fibonacci_digit: u8` (0–9). NOW.md frontmatter inscribes `c_3_fibonacci_position` + `c_3_fibonacci_digit` + `c_3_tick12` + `c_3_backbone_index` on every Khora write.
- **DR-FIB-3** — Kerykeion temporal modes (Natal, RealTime, Kairotic) coexist as a typed `KairosFrame` discriminated union inside `M4_Temporal_Now`. They do not swap; they layer. `m4_planet_degrees_live()` accessor returns kairotic-if-active else realtime; explicit-frame access is required for mode-specific reads.
- **DR-FIB-4** — The 24-fold backbone (Lens 7) is a typed primitive (`Clock_Backbone_Node`) and an extern table (`CLOCK_BACKBONE[24]`), built at M3 boot.
- **DR-FIB-5** — The reconciliation between tick-driven live render and tranche-driven NOW.md inscription is by ontological role: live render reads Level 0 continuously; NOW.md crystallises Level 0 coordinates episodically. Both read the same ground. No synchronisation contract required.

---

*Created 2026-06-08 from the substrate-clarity session.
Affirms [[33-harmonic-energy-channel-handoff]] §1.2 (Möbius descent cadence).
Affirms [[19-contemplation-surface-integration]] T19.12 (Mercurius → m4_snapshot_now wiring).
Inherits the 4-level architecture from [[02-16-lenses-backbone-temporal]] §0.*
