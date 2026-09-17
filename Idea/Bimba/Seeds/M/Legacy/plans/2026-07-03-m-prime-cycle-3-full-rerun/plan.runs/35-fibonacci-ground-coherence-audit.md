---
title: "Fibonacci Ground Level-0 — End-to-End Coherence Audit (T35.2)"
type: cycle-3-coherence-audit
task: "35.T35.2"
status: complete
created: 2026-07-13
coordinate: "M'"
sub_coordinate: "M2' (#2-0 Fibonacci Ground) + M3' (lens host) + M4' (Nara temporal) + S4'-0' (Khora) + S1' (Hen)"
audit_class: D
c_0_source_coordinates:
  - "M2'"
  - "M3'"
  - "M4'"
c_0_related_coordinates:
  - "M1'"
  - "S0"
  - "S1'"
  - "S4'"
dev_decisions:
  - "DR-FIB-1 LANDED; DR-FIB-2 LANDED (derived-not-stored nuance); DR-FIB-3 PARTIAL (precedence + decay MECHANISM landed, 4h deadline never populated on the live path); DR-FIB-4 LANDED; DR-FIB-5 LANDED (doctrine, proven by two paths sharing one ground law)."
dev_relations:
  - { type: evidences, target: "[[35-fibonacci-ground-level-0-temporal-substrate]]" }
  - { type: depends_on, target: "[[13-decision-register]]" }
dev_changed_paths:
  - "Body/M/pratibimba-app/src/engine/fibonacciGround.coherence.test.ts"
---

# T35.2 — Fibonacci Ground Level-0 End-to-End Coherence Audit

**Scope.** Walk the four-level temporal substrate — Level 0 Fibonacci Ground (60-fold) →
Level 1 tick12 (60/5) → Level 2 16 lenses → Level 3 9 walks — on the **current** stack, and
record per DR-FIB row (source §5, `../2026-06-02-m-prime-cycle-3-design-reconciliation/35-fibonacci-ground-level-0-temporal-substrate.md:445-453`) whether it is LANDED / PARTIAL / STILL-OPEN with `file:line` evidence.

**Core coherence claim (the one this audit executably backs).** The carrier's Level-0
projection (`Body/M/pratibimba-app/src/engine/fibonacciGround.ts`, landed by 35.T35.1) and the
kernel's Level-0 ground definition (`Body/S/S0/portal-core/src/kernel/projections/phase_space.rs`)
implement the **same 6° wedge math over the same anchors** — two independently-written
closed forms of `floor(deg/6)`, period 60, 6°/step, cardinal-zeros {0,15,30,45}→{0,90,180,270}.
Backing test (7 pass): `Body/M/pratibimba-app/src/engine/fibonacciGround.coherence.test.ts`
(`npx vitest run src/engine/fibonacciGround.coherence.test.ts`) — full-sweep agreement across
**all 360 real degrees**, reproducing the kernel test's own pinned anchors
(`phase_space.rs` position=`degree360/6` at `:314`; `phase_space_profile_field.rs:189,193`
pin 144→24 and 66→11). Kernel side independently green: `cargo test -p portal-core --test phase_space_profile_field` (9 pass). Carrier 35.T35.1 side green: `npx vitest run src/engine/fibonacciGround.test.ts` (11 pass).

---

## DR-FIB status table

| DR | Claim | Status | Evidence (`file:line`) |
|---|---|---|---|
| **DR-FIB-1** | Fibonacci Ground (`#2-0`, 60-fold LCM(6,5,12), Pisano π(10)=60) is canonically Level 0; the `+1` of the `16+1` lens-stack refers to Level 0, not a 17th Level-2 aperture. | **LANDED** | Kernel: `Body/S/S0/portal-core/src/kernel/projections/phase_space.rs:76-78` ("deliberately NOT a 17th row — the Level-0 growth aperture of the 16+1 law"), `:244-255` `FibonacciGroundPhase`, `:314-327` position/digit/phase01. Carrier: `Body/M/pratibimba-app/src/engine/fibonacciGround.ts:22-26` (period 60, 6°/step). Spec §8.0 landed per source §1.1 → DR-FIB-1 VALIDATED (`13-decision-register.md`). Coherence: `fibonacciGround.coherence.test.ts` (period/step + full-sweep). |
| **DR-FIB-2** | Every degree carries intrinsic `fibonacci_position`(0–59) + `fibonacci_digit`(0–9); NOW.md stamps `c_3_fibonacci_position/digit/tick12/backbone_index` on every Khora write; Hen rejects out-of-range as ERROR. | **LANDED** (one nuance) | NOW template: `Idea/Bimba/World/NOW.md:11-14`. Hen ranges → ERROR: `Body/S/S1/hen-compiler-core/src/frontmatter.rs:39-42` (0-59 / 0-9 / 0-11 / 0-23). Khora real-value stamp: `Body/S/S4/ta-onta/S4-0p-khora/modules/now-fibonacci-ground.ts`, wired `.../extension.ts:175,569` (session_start + tranche.complete), test `.../tests/now_fibonacci_ground.test.ts:25` ("writes non-zero Fibonacci Ground coordinates from a real kairos Sun degree cache"). **Nuance (spec-note, escalated):** position/digit are realized on the Rust projection `PhaseSpaceAddress.fibonacci_ground` (`phase_space.rs:270`, computed per degree), NOT stored as fields on the C `Clock_Degree_Entry` (`Body/S/S0/epi-lib/include/m3.h:879` — no `fibonacci_*` member). Functionally every degree HAS its position/digit; stored-vs-derived differs from the literal source text "Every `Clock_Degree_Node` carries intrinsic fields". |
| **DR-FIB-3** | Kerykeion modes coexist as a typed `KairosFrame` union in `M4_Temporal_Now`; they layer, not swap. `m4_planet_degrees_live()` returns kairotic-if-active else realtime (natal = explicit frame). 4h kairotic decay applied to displayed live degrees. | **PARTIAL** | Union + precedence LANDED: `Body/S/S0/epi-lib/include/m4.h:261-288` (`KairosFrameKind`, `KairosFrame` natal/realtime/kairotic + `kairotic_active`, `_Static_assert sizeof==64` `:278`); accessor `Body/S/S0/epi-lib/src/m4.c:319-323` (kairotic_active ? kairotic : realtime). C tests: `Body/S/S0/epi-lib/test/m4/test_m4.c:220` (`test_planet_degrees_live_precedence`), `:204` (`test_kairos_frame_kairotic_decays`). Decay MECHANISM LANDED: `m4.c:325-329` (`m4_planet_degrees_live_at` deactivates when `now_ns > decays_at_ns`). **STILL-OPEN sub-claim (escalated — no routed tranche exists):** the **4h deadline is never populated on the live path** — `decays_at_ns` defaults to `0` (= "no decay") at frame init (`m4.c:275`) and the only non-test writer also writes `0` (`Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts:148`); the decay test sets it manually to `2000u` (`test_m4.c:213`). So on the current stack kairotic frames never auto-decay via the `captured_at + 4h` rule — an oracle-cast populator that sets `decays_at_ns = captured_at_ns + 4h` is absent. |
| **DR-FIB-4** | The 24-fold backbone (Lens 7) is a typed primitive `Clock_Backbone_Node` + extern `CLOCK_BACKBONE[24]`, built at M3 boot. | **LANDED** | Struct: `Body/S/S0/epi-lib/include/m3.h:816-829` (`_Static_assert sizeof==12` `:818`, `extern ... CLOCK_BACKBONE[24]` `:825/827`, `m3_build_backbone` `:829`). Populator: `Body/S/S0/epi-lib/src/m3.c:396-400`, wired into boot `:1154,1178`, self-check `:1216-1220`. Test: `Body/S/S0/epi-lib/tests/clock_backbone_node_test.rs:23` (`clock_backbone_node_contract_is_populated`). Portal-core mirror: `Body/S/S0/portal-core/src/m3_transcription_bridge.rs:30-31` (`M3_BACKBONE_DEGREE_STEP=15`, `M3_BACKBONE_NODE_COUNT=24`; `24×15=360`, `360+24=384` identity in `pentadic_trace.rs:81-116`). |
| **DR-FIB-5** | Tick-driven live render vs tranche-driven episodic NOW.md are reconciled by ontological role — both read the same Level-0 ground; no synchronisation contract required. | **LANDED** (doctrine) | Live path: carrier `fibonacciGround.ts` folds the live Sun (`frame.kairos.degrees[0]` = `m4_planet_degrees_live()[0]`) via `floor(deg/6)` continuously; mounted at `Body/M/pratibimba-app/src/engine/CosmicEngine.tsx:onFrame` (gitnexus upstream: `onFrame → fibonacciGroundPoint → fibonacciPosition`). Episodic path: Khora stamps `c_3_fibonacci_*` at session_start/tranche.complete (`now-fibonacci-ground.ts`). The two paths **share one ground law** — proven by the coherence test (live-render law ≡ kernel/stamp law). That shared ground IS the reconciliation: they need no sync because they read the same substrate at different apertures. DR-FIB-5 VALIDATED per `13-decision-register.md`. |

---

## Four-level substrate walk (current stack)

| Level | Name | Cardinality | Where it lives now | Status |
|---|---|---|---|---|
| **0** | Fibonacci Ground | 60 | Kernel `FibonacciGroundPhase` (`phase_space.rs:248,314-327`); carrier `fibonacciGround.ts`. Two closed forms of `floor(deg/6)`, proven coherent over all 360 degrees. | LANDED |
| **1** | tick12 (spanda) | 12 = 60/5 | Kernel `ClockDegreeNode.degree_tick12` (`phase_space.rs:142`, from `raw.tick12`); NOW `c_3_tick12` range-gated 0-11 (`frontmatter.rs:41`); Khora derives `tick12 = fib_position / 5`. | LANDED |
| **2** | 16 lenses | 16 | Kernel `CLOCK_LENSES_16` (`phase_space.rs:79-96`) + `lens_carrier` (`:296-313`); kernel test "the_sixteen_lenses_tile_360" green. Fibonacci Ground carried BESIDE the ring as the +1, never inside it (`:76-78`). | LANDED |
| **3** | 9 walks | 9 | Diachronic degree-space traversal (M1–M3). Consumes the same degree-space; DR-FIB-1..5 assign it no row, so it is **context, not a DR-FIB gate** here — the source §2.4 layer order treats the 9-walk overlay as the existing inner layer the Level-0 ring frames. | context (out of DR-FIB scope) |

---

## Findings for other threads (escalations — no fabricated tranche ids)

1. **DR-FIB-3 4h decay deadline is unwired on the live path.** The decay *mechanism* is landed and tested, but no production caller sets `decays_at_ns = captured_at_ns + 4h`; it defaults to `0` (no-decay) at `m4.c:275` and via `kairos-python-adapter.ts:148`. Kairotic frames therefore never auto-decay on the current stack. Needs a routed tranche: an oracle-cast populator (Mercurius/oracle path) that sets the 4h deadline when a KAIROTIC frame is captured. **Do not build on "4h decay is live"** — it is a typed-but-inert deadline today.

2. **DR-FIB-2 stored-vs-derived nuance.** The source text "Every `Clock_Degree_Node` carries intrinsic `fibonacci_position`/`fibonacci_digit`" is satisfied by DERIVATION on the Rust projection (`PhaseSpaceAddress.fibonacci_ground`), not by fields on the C `Clock_Degree_Entry` (`m3.h:879`). Functionally equivalent for every consumer, but if the canon intends stored `.rodata` fields, that is a separate kernel-struct tranche + a `[[M3'-SPEC]]` §8.0 clarification. Flag for the owning spec, not a blocker.

*Coherence test authored under T35.2: `Body/M/pratibimba-app/src/engine/fibonacciGround.coherence.test.ts` (7 pass). Verifier ≠ closer applies — this audit is authored by uc-3502; independent verification is the orchestrator's dispatch.*

---

## Update — DR-FIB-3 STILL-OPEN sub-claim CLOSED (2026-07-14, opus-kairos-carrier)

The escalated DR-FIB-3 sub-claim above ("the 4h deadline is never populated on the
live path … an oracle-cast populator that sets `decays_at_ns = captured_at_ns + 4h`
is absent") is now **CLOSED**. The kairotic vertical landed end-to-end (finding #1
below is superseded — it is no longer an escalation):

- **Kernel arm** (`8c2de9e6`): `m4_temporal_now_capture_kairotic` (`m4.h`/`m4.c`) sets
  `kairotic_active = 1` and `decays_at_ns = captured_at_ns + (ttl ? ttl : M4_KAIROTIC_DEFAULT_TTL_NS)`,
  where `M4_KAIROTIC_DEFAULT_TTL_NS = 4·3600·1e9 ns` (4h) — the populator the audit
  flagged as absent. C test in `test_m4.c`.
- **Live path** (`c2cdba92`): `nara/kairos.rs::capture_kairotic()` writes `kairotic.json`
  with `decays_at_epoch = captured_at + 4h`; `kairotic_live_sky()` reads it back only
  while non-decayed; `heartbeat_live_sky_tiered()` resolves kairotic>realtime precedence
  and carries the deadline; CLI `epi nara kairos capture` is the oracle-consultation
  trigger. `nara::kairos::kairos_parse_tests` 9/9.
- **Bus** (`e798e26e`): the S3 heartbeat stamps `kairos_mode` (kairotic|realtime) +
  `kairos_decays_at_ms` onto `MathemeHarmonicProfile` (`gate/server/mod.rs`, `profile.rs`;
  camelCase serde → `kairosMode`/`kairosDecaysAtMs` on the wire).
- **Carrier** (`b9a7a973`): the cosmic-engine HUD renders the resolved tier + the live
  4h decay countdown (`data-testid="engine-kairos-mode"`), reverting to realtime when the
  client clock passes the deadline (`kairosTierReadout`; modulators 23/23, engine 162/162,
  tsc clean). Independent verifier PASS (verifier-kairos-b ≠ implementer).

So on the live path DR-FIB-3 is now **LANDED, not PARTIAL**: `decays_at_ns` /
`decays_at_epoch` / `kairos_decays_at_ms` all carry the real `captured_at + 4h` deadline,
and the carrier displays + decays it. The legacy zero-writer `kairos-python-adapter.ts:148`
is superseded by the Rust `capture_kairotic` populator. **Remaining (separate tranche):**
the interactive three-mode `natal|realtime|kairotic` time-axis switcher (25.T25.17) is still
blocked on its own deps (25.6 renderer handle) — this closure covers the kairotic DISPLAY +
decay, not the natal-mode selector.
