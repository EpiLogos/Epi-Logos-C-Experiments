---
title: "Implementation Plan — M' Ambient-Conditions Epi-Genetic Transform Layer"
coordinate: "M1 / M2 / M3 → M4-4-4-4 (PASU base)"
status: "active-implementation-plan"
created: 2026-07-14
spec: "[[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]]"
supersedes_tranches:
  - "37.2 / 37.4 / 37.9 (planet→PASU/bioquaternion identity feed — the collapse seam)"
  - "23.10 / 23.19 (outer-planet pending-dataset + elemental-weight→bioquaternion)"
  - "19:123 (outer planets → M2-5 transpersonal personal-dataset)"
verification_law: "TDD per tranche; real behavioural/live-wire proof per Track-00; verifier ≠ closer; kernel changes proven in C/Rust unit tests, carrier changes in vitest + a Playwright UF where a strip/surface renders."
---

# Implementation Plan — Ambient-Conditions Epi-Genetic Transform Layer

**Spec:** [[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]] (all law above this plan). Build order is foundation-first: the input surface and the `q_identity` de-collapse land before any transform math, so no phase can regress the DR-ENV-1 invariant.

**Standing invariant for every tranche (DR-ENV-1):** the PASU base quaternion (user or entity) is anchored by origin invariants; ambient conditions transform it, never become it. Any tranche that lets a live-sky value reach `q_identity` fails its gate.

---

## Progress (live)

- **P1.1 — DONE** (`9fa0961f`). `portal-core::environment` — `EnvironmentalCondition` / `ConditionSource` / `derive_env_quaternion` (conditions aspected against the natal invariant, gained by sensitivity). 8/8 green.
- **P1.2 — DONE** (`601c87dd`). `identityFromKairos` → `identityFromNatal` (pi-agent `user-context/index.ts`): `q_identity` natal-anchored (byte-stable), `q_personal = base ⊗ environment`. `natal`/`kairos`/`environment` options separate the birth chart from the transit sky. 10 gate tests + 457/457 ta-onta green.
- **P3.1 — DONE** (`2d5eba88`). Canonical composition site (`portal-core::state::recompute_composed_quaternion_state`): `composed = normalize(quintessence ⊗ environment ⊗ transit ⊗ live)`; `environment_quaternion` field (serde-default identity) + `update_environment_quaternion`. Absent env ⇒ prior law byte-for-byte. 4 state tests incl. the DR-ENV-1 gate + 107/107 portal-core green.
- **P3.1b — DONE** (`adb9de11`). epi-cli duplicate `PortalClockState`/recompute mirrored (live gateway parity). 2 parity tests + 22/22 clock_state green.
- **Open:** P3.2 (feed env → `m3_quat_active_state`, fix j/k asymmetry), three-site TS unification (`composeQComposed`) + delete the duplicate, then P2 richer natal reference / P4 rotational-3-matrix / P5 sequences / P6 carrier+sink. Phase 0 (cycle-3 track amendments) landed earlier this session (`8a2e1dab`).

---

## Phase 0 — Cycle-3 track amendments (do FIRST; unblocks the ledger)

**P0.1 — Amend track 37 (biological-quaternionic-cross-layer-integration).** Re-point the collapse tranches per spec §6, in BOTH `2026-06-02-m-prime-cycle-3-design-reconciliation/37-*.md` (spec source) and `2026-07-03-m-prime-cycle-3-full-rerun/37-*.md` (retarget stub):
- **37.4** — routing target for the LIVE/collective band becomes the `q_environment` transform factor, NOT PASU `elemental_weights`. Only natal-chart weights source identity.
- **37.2** — split natal (identity, Sun-rooted) from live/transit (environment).
- **37.9** — retire the 23.10 pending-dataset badge; outer planets are the ambient band, aspected against natal.
- Add a banner at the track head pointing to [[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]] as the governing law.
- Verify: grep shows no remaining "→ PASU elemental_weights" for the live band; the DR-ENV cross-refs present; assess re-index green.

**P0.2 — Amend 23.10 / 23.19, 19:123, 32.10** per spec §6 (supersession + redirect notes; retire `pending-dataset-2-5-8-9-10` / `pending-dataset:23.10` / `m2-5-transpersonal-extension` / `MEANING_ID_PREEMPTED` framing on outer-planet rows, keeping only the harmonic footprint).
- Verify: the superseded markers carry a redirect to DR-ENV-2; honesty-lint clean.

**P0.3 — DOX pass.** Index the spec + this plan in `Idea/Bimba/Seeds/M/AGENTS.md`; flag the owning `[[M3'-SPEC]]`/`[[M4'-SPEC]]` for the contract-surface addition (the `q_environment` factor + `EnvironmentalCondition`).

---

## Phase 1 — Foundation: ambient-input surface + `q_identity` de-collapse

**P1.1 — `EnvironmentalCondition` schema (the intake).** New typed ambient input in portal-core (`src/environment.rs` or extend `state.rs`) + the TS bridge mirror: `{ source: ConditionSource, magnitude: f32, phase: f32, provenance: Handle, sensitivity: f32 }` with a `to_quaternion_contribution()` (element-distribution). Extensible enum `ConditionSource { TranspersonalPlanet(u8), LunarNode, Eclipse, MoonPhase, … Ambient(NonAstro) }` — planets populated, the rest declared (DR-ENV-6, full framework).
- Test: schema round-trips; an outer-planet condition yields a unit contribution; a declared-but-empty source is honest-null, never fabricated.

**P1.2 — De-collapse `identityFromKairos` (DR-ENV-1).** Identity sources from `PasuChannel` natal quintessence; `KairosChannel` is consumed only as environment. Remove the identity default at `index.ts:205`; fix the double-feed (`index.ts:240-257,286`); resolve the `fetchKairosFromChronos` conflation (`kairos.rs:126` env-transit vs `index.ts:326-348` PASU-birth) so the two channels are never the same object.
- Test (the invariant gate): with fixed PASU and a *changing* transit sky, `q_identity` is byte-stable while `Q_composed` moves. This test guards every later phase.

---

## Phase 2 — `env` derivation (conditions-against-natal → env quaternion)

**P2.1 — `derive_env_quaternion(conditions, natal)`.** Fold active conditions via the `update_kairos_full` element-distribution (`state.rs:126-163`), each aspected against the natal invariant, gained by its `sensitivity` (DR-ENV-7). Transpersonal band populated first; aggregate field with per-condition provenance retained.
- Test: unit-norm output; determinism; transpersonal band contributes; identity/natal is read-only input (no mutation).

---

## Phase 3 — Composition: the `q_environment` factor (single canonical site)

**P3.1 — Unify the composed-quaternion law (DR-ENV-8).** Canonical site = portal-core `recompute_composed_quaternion_state` (`state.rs:21-31`); insert `q_environment`: `normalize(q_identity · q_environment · q_transit · q_activity)`. epi-cli + TS `composeQComposed` (`recognition-layer-slot.tsx:96-106`) consume the one law (delete the duplicates).
- Test: three-site parity (one golden vector, identical across C/Rust/TS); `q_identity` factor byte-unchanged; `q_environment` absent ⇒ prior behaviour preserved.

**P3.2 — Feed `env` to `m3_quat_active_state`; resolve the j/k asymmetry.** Route the env quaternion into codon-state selection (`m3.c:1006`); fix `m3_quat_active_state` to use the full quaternion angle, not only `x/w` (HMS:639 — currently ignores Prime/Mod j/k).
- Test: codon states shift under env; j/k contributions now affect the bucket; state 7 (Environmental composite) reachable; existing codon-state tests updated, not broken.

---

## Phase 4 — Rotational-state / symbolic seam + the 3 matrices

**P4.1 — The 8 tarot rotational states + the 3-matrix (i/j/k) codon↔hexagram translation** wired end-to-end (HMS §V–VI): `M3_MATRIX_PAIR[3][4]`, `M3_MATRIX_QUATERNION_AXIS[3]`, `ij=k` composition; the codon-clock↔hexagram-clock 90° intersection driven by the tarot quaternion.
- Test: `ij=k` matrix composition; compass law `p(n)+p(9-n)=9`; codon↔hexagram round-trip; the codon system reads as a modulating variable to the clock.

---

## Phase 5 — Expression sequences (codon→RNA→amino-acid + Major Arcana)

**P5.1 — Transformational sequences.** The environmentally-selected codon states express as codon→RNA→amino-acid sequences bound to the Major-Arcana transcription pathways (56 minor→codon, 22 major→transcription; HMS §VII); prime-attractor checkpoints at Euler 41/43.
- Test: a fixture env produces a deterministic transcription sequence + Major-Arcana pathway; checkpoint pauses at 41/43; epigenetic (expression) stays distinct from mutation (DR-ENV-3).

---

## Phase 6 — Carrier + sink (the transform made visible)

**P6.1 — `environment` ModulationInputKey + carrier** in pratibimba (`modulation/types.ts`, `modulators.ts`, `CosmicEngine.tsx`): the ambient winds surface as a strip/overlay, deriving from the bussed env state — the display sibling of the kairos-tier + Pisano-digit readouts already landed.
- Test: vitest for the pure readout; Playwright UF on the engine strip (real gateway) asserting the environment readout renders honestly (present ⇒ valid, absent ⇒ pending — never fabricated).

**P6.2 — The transform on the M4 PASU base, end-to-end.** A live-wire proof: env condition → env quaternion → `Q_composed` transform on the PASU base, with `q_identity` invariant, for a user AND an entity pratibimba (DR-ENV-4).

---

## Sequencing & gates

Phase 0 first (unblock the ledger), then 1→6 in order. Phases 1–3 are the load-bearing spine (input, de-collapse, composition); 4–5 are the symbolic depth; 6 is the surface. Each tranche: TDD, independent verification (verifier ≠ closer), commit. The Phase-1 invariant test (`q_identity` stable under changing sky) is re-run as a gate at the close of every subsequent phase.
