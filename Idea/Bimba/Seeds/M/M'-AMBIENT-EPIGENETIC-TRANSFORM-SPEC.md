---
title: "M' Ambient-Conditions Epi-Genetic Transform Layer — Ambient Input Surface, Tarot Rotational-State Foundation, Codon 3-Matrix Expression, and the No-Collapse User-Quaternion Sink"
coordinate: "M1 / M2 / M3 → M4-4-4-4 (ambient-condition epi-genetic transform onto the user quaternion)"
status: "canonical-architecture-spec (v0.2 — Architect-ratified 2026-07-14)"
created: 2026-07-14
authority_relation: "Domain authority for the path by which AMBIENT ENVIRONMENTAL CONDITIONS (the collective sky's slow forces first among them, outer/transpersonal planets the canonical band) act as live symbolic-epi-genetic transforms on the M4 user quaternion. Where this overlaps HMS (the rotational-state mechanism), the 3-matrix codon engine, and the 4-5-0 recognition surface (the user-quaternion sink), this document is authoritative for the AMBIENT-INPUT → TRANSFORM → SINK composition specifically; the mechanism specs ([[HMS-quaternionic-overlay]], [[M3-mahamaya-symbolic-transcription]]) and the sink spec ([[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]]) remain authoritative for their own substrate."
depends_on:
  - "[[HMS-quaternionic-overlay]]"          # the 8 rotational states, 3 matrices (i/j/k), tarot bridge — the mechanism
  - "[[M3-mahamaya-symbolic-transcription]]" # codon / nucleotide / Major-Arcana transcription substrate
  - "[[M1-ARCHITECTURE]]"                    # K² / SU(2) ring / Ananda matrices — the quaternion rotation engine
  - "[[M4'-SPEC]]"                           # Nara personal field — the epi-genetic INTERPRETER pole
  - "[[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]]"  # M4-4-4-4 Q_composed — the user-quaternion sink
  - "[[alpha_quaternionic_integration_across_M_stack]]"  # cross-M-stack quaternionic integration — coordinate with, do not duplicate
cross_references:
  - "[[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] — the cosmic-side clock this layer modulates as a variable"
  - "[[M2-ARCHITECTURE]] — Parashakti planetary/vibrational surface (the ambient sky's residency)"
  - "[[M3-ARCHITECTURE]] — the genetic (codon) substrate the epi-genetic overlay expresses over"
related_tranches:
  - "37.x (design-recon 37-biological-quaternionic-cross-layer-integration) — the biological/quaternionic codon integration track this layer completes and re-frames"
  - "23.10 — outer-planet stubs: SUPERSEDED; outer planets are an ambient environmental band, not a pending M2-5 personal-correspondence dataset"
  - "05.x / 06.x — M4 Nara personal field: the epi-genetic interpreter and the q_personal sink"
  - "10.x — MathemeHarmonicProfile bus fields (planet_degrees, live_planets, kairos_mode/decays_at_ms) — the environmental carrier"
---

# M' Ambient-Conditions Epi-Genetic Transform Layer

## 0. Frame

The system already has a fixed genome and a mechanism for expressing it under environmental modulation; what it lacks is the **ambient input** that drives the modulation, the **channel** that keeps that input distinct from identity, and the **sink wiring** onto the user quaternion. This document specifies that missing surface.

**The layer in one line:** live *ambient environmental conditions* — the collective sky's slow forces, outer/transpersonal planets first among them — are evaluated **against the person's natal invariants** and applied as **symbolic-epi-genetic quaternionic transforms** onto the M4 user-quaternion object, selecting codon *expression* over a genome that never changes.

**Epi-genetic in the exact biological sense.** M3 Mahamaya is the genome — the 64-codon substrate encoded from 2-bit nucleotides (the Complementarity Matrix M3-3-2-0, "the what is encoded"). The environment does not edit the code; it regulates *expression*, methylation-style — an on/off across a fixed genome. This is already named canon: Cytosine M3-2-3 is "the primary site for methylation… modulating expression without changing the underlying code," and the transducer is `environmentalConducting` — "epigenetic inputs (stress, nutrients, psychological states) creating quaternionic rotations that modulate expression through codon state transitions." At subsystem scale, **M3 is the genetic code; M4 Nara is its epi-genetic interpreter** (the "#4.4.4.4 Epigenetic Interpreter"). This layer makes the *environmental input* to that interpreter real.

## 1. The Governing Invariant — identity is natal; ambient conditions transform, never collapse

**Binding, non-negotiable:** the **base quaternion being operated upon is the PASU** — the being-pattern of a *pratibimba*, whether a human user or a system entity (the layer operates identically on either; "user quaternion" is the common case, not the only one). It is anchored by its **origin invariants** — for a user, birth place / birth time / natal chart; for an entity, its genesis constants — and that anchor is `q_identity` / `q_personal`. Ambient conditions are computed **against** this invariant and applied as transforms *onto the base*; they never *become* it.

- The user-quaternion object is `PersonalIdentityProfile.q_personal` → `Q_composed` (`Body/S/S0/portal-core/src/personal_identity.rs:101-186`), the M4-4-4-4 "Living personal-Pratibimba locus" ([[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] §1).
- **The wrong-turn to kill:** `identityFromKairos(kairos)` derives `q_identity` *directly from the live sky's fast planets* and is wired as the **default** (`Body/S/S4/pi-agent/skills/user-context/index.ts:205,350-360`), so today the environment literally overwrites identity, and the sky is fed in twice (`index.ts:240-257,286`). This collapse is the defect this layer exists to correct.
- **The clean split already exists in shape:** `UserContextFrame` carries separate `pasu / kairos / identity` channels (`index.ts:38-80`) — identity is sourced from the `PasuChannel` natal quintessence; `KairosChannel` is consumed as *environment*. M2 already separates `cosmic-public` from `protected-m4 / personal-pratibimba` scope (`meaning-packet.ts:16,250-266`) with a `face:cosmic↔personal-0/1` toggle (`M2BimbaPratibimbaSelector.ts:178-186`).

Formally: the composed quaternion is `q_identity ⊗ 𝒯(ambient · natal)`, where `𝒯` is the epi-genetic transform of section 3 and `q_identity` is a fixed factor derived from natal invariants alone.

## 2. The Ambient-Input Surface — an open-ended condition system

Not "three outer-planet rows to backfill" but a **general ambient-condition intake**, extensible by construction, seeded with the astrological band and admitting more (lunar nodes, eclipses, and eventually non-astrological ambient — season, geomagnetic, biometric).

- **`EnvironmentalCondition` (new):** a typed ambient input carrying `{ source, magnitude, phase, provenance }` and a derivation to the four quaternion components. There is no such schema today — the single largest absence.
- **First band = the collective sky.** Sourced from the *cosmic-public* tiered feed (kairotic 4h over daily realtime, refuse-on-incomplete, Greenwich reference — `Body/S/S0/epi-cli/src/nara/kairos.rs:126-129,373-461`), never `protected-m4`. Provenance handles: `worldClockHandle / transitHandle / earthObserverHandle` (`meaning-packet.ts:34-39`).
- **Canonical condition = the transpersonal planets.** Uranus / Neptune / Pluto (`PLANET_IS_TRANSPERSONAL`, `m2.h:274-293`) are the paradigm ambient condition precisely because they are generational and collective — not personal identity. They are NOT relocated to an M2-5 personal-correspondence dataset (that placement — `pending-dataset-2-5-8-9-10`, `MEANING_ID_PREEMPTED` — is the superseded paradigm); they enter here as environmental conditions.
- **Aggregate field with per-condition provenance.** One `env` quaternion is composed from the active conditions (element-distribution pattern, below), but each contributing condition stays individually addressable so a single planet — or later, a non-astrological input — can be distinguished.

## 3. The Transform Pipeline — ambient → tarot rotational state → codon expression → user quaternion

The pipeline threads M1 → M2 → M3 → M4; it does not *reside* in one coordinate. Each stage already has substrate; this layer wires them and adds the input at the head.

**3.1 Ambient → `env` quaternion (M2 sky → K² rotation).**
Map the active conditions into a unit quaternion by their elemental distribution — the existing template is `update_kairos_full`, which folds planetary element counts into a transit quaternion (Fire→x, Earth→w, Air→z, Water→y; `Body/S/S0/portal-core/src/state.rs:126-163`). The ambient layer reuses this derivation but over the *transpersonal/collective* band and weighted by a **sensitivity coefficient** (absent today — an open decision, §5-D4).

**3.2 `env` quaternion → tarot rotational state (M1 rotation ↔ M2 symbolic).**
This is the load-bearing seam and the *foundation* of the layer. Each codon is a quaternion `q_codon = Sum·1 + Diff·i + Prime·j + Mod·k` ([[HMS-quaternionic-overlay]] FR 2.Q.9). Multiplying the `env` quaternion onto it and bucketing the angle selects one of **8 rotational states at 45°** — the codon's expressions under environmental modulation, with **state 7 (315°) the explicit "Environmental composite"** (HMS:575-588). The mechanism is *already implemented*: `m3_quat_active_state(Quaternion env, uint8_t codon_id)` (`Body/S/S0/epi-lib/src/m3.c:139`), called at `m3.c:1006` as `codon_states[codon] = m3_quat_active_state(result.composed_q, codon)`. **A rotation in K² IS a symbolic state selection** — this is where M1 quaternion rotation becomes M2 symbolic-expressional modulation.

**3.3 Codon engine = the 3 matrices (native).**
The codon system runs on three transformation matrices as the quaternion basis: Complementarity/DNA-complementary = **i** (`M3_MATRIX_COMPLEMENTARY`), Moving↔Resting = **j**, Same-Quality = **k**, with the self-same pairs as the scalar/identity, and `ij=k` reading as matrix composition (HMS:466-553; `M3_MATRIX_PAIR[3][4]`, `M3_MATRIX_QUATERNION_AXIS[3]`). The codon↔hexagram translation is the orthogonal (90°) intersection of the codon clock and hexagram clock, with the tarot layer performing the quaternionic multiplication between them (HMS:424-462). The codon system is thereby a **modulating variable to the cosmic clock**, and the many codon-hexagram relations are derived *through* these three matrices — not tabulated.

**3.4 Epi-genetic expression = transformational sequences.**
Expression is a *sequence*, not a static state: codon → RNA → amino-acid invoked together with the Major-Arcana transcription pathways (56 Minor Arcana → codons, 22 Major Arcana → transcription/amino-acid pathways, court cards → rotational/compass dynamics; HMS:29, Section VII four-system transcriptional pipeline FR 2.Q.11). Prime-attractor lock points (Euler primes 41/43) are the transcription checkpoints (HMS:645). The layer expresses the environmentally-selected codon states as these Major-Arcana transformational sequences.

**3.5 Sink = the M4 user quaternion (no collapse).**
The transform composes onto `Q_composed` as a **distinct `q_environment` factor** — `normalize(q_identity · q_environment(ambient, natal) · …)` — at the single canonical composition site. **Hazard:** the composed-quaternion law is currently *triplicated* — portal-core `recompute_composed_quaternion_state` (`state.rs:21-31`), epi-cli, and the TS `composeQComposed` (`recognition-layer-slot.tsx:96-106`). A `q_environment` factor MUST land at one canonical site with the other two consuming it (§5-D5).

## 4. What already exists vs what this layer adds

**Exists (compose onto, do not rebuild):** the epi-genetic mechanism `m3_quat_active_state` (`m3.c:139,1006`); the 8 rotational states + codon quaternion encoding + the 3 i/j/k matrices (HMS §V–VI); the tarot↔codon↔amino-acid bridge (HMS §VII); the mutable composed-quaternion chain with extensible slots (`integrate_nara_quintessence` folds an arbitrary `&[[f32;4]]` slice — `personal_identity.rs:470-479`; `perturb_q_activity` — the bounded axis-angle perturbation template, `vama_shakti.rs:412-442`); the cosmic-public tiered sky feed and its scope separation; the pratibimba carrier taxonomy (`ModulationFrame/ModulationInputKey/ModulationCarrier`, `modulators.ts`).

**Adds (the real work):** (a) the `EnvironmentalCondition` schema + the derivation of `env` from conditions-against-natal; (b) the `q_environment` factor at the single canonical composition site; (c) the de-collapse of `identityFromKairos`; (d) an `environment` `ModulationInputKey` + carrier so the ambient winds are visible in the display graph; (e) the transpersonal-band re-framing away from the M2-5 personal dataset.

## 5. Corrections & Decision Register

- **DR-ENV-1 — No-collapse invariant.** `q_identity` derives from natal invariants only; ambient conditions transform `Q_composed` as a distinct factor. `identityFromKairos` as the identity default is retired. *(Architect: RATIFIED in intent — "we mustn't have a collapse from planets into q_identity".)*
- **DR-ENV-2 — Outer planets are ambient conditions, not an M2 personal dataset.** The `m2-5-transpersonal-extension` "pending dataset" framing is superseded; the outer planets' harmonic footprint (Cousto Hz/element) stays a footprint, their *meaning* is collective/environmental, read via cosmic-public. *(supersedes the 23.10 paradigm.)*
- **DR-ENV-3 — Epi-genetic ≠ mutation.** Expression modulation (no code change) and genetic mutation ("determinism ends here" — the Resonance-gap code change, M3-mahamaya:667,755) must stay ontologically distinct surfaces. This layer is expression-only.
- **Resolved decisions (Architect-ratified 2026-07-14):**
  - **DR-ENV-4 (D1) — M4 is the base being operated upon.** The operand is the **PASU base quaternion** of a pratibimba (user *or* entity); the full M1→M2→M3→M4 pipeline *lands its transform on that base*. The codon-state expression **mechanism** is M3; the **operand/sink** is M4 — the transform composes onto the M4 PASU base, not a Nara-only overlay. Both senses of "epigenetic" are braided by the pipeline; the base is M4.
  - **DR-ENV-5 (D2) — runtime quaternion perturbation.** A wind is a quaternion perturbation on the composed product (the kernel `m3_quat_active_state` / `quat_mul` already implements exactly this). NOT a `.rodata` matrix mutation (immutable — select/overlay only), NOT a display-only tint.
  - **DR-ENV-6 (D3) — the FULL framework.** Build the general `EnvironmentalCondition` system with the planets AND the rotational states — not an outer-planets-only slice. The transpersonal band is the first *populated* condition; the surface admits lunar nodes / eclipses / moon-phase / non-astrological ambient from the start.
  - **DR-ENV-7 (D4) — input typing.** Derive `env` via the `update_kairos_full` element-distribution over the active conditions (each aspected against natal), gained by a per-condition **sensitivity coefficient** (new).
  - **DR-ENV-8 (D5) — canonical site + combination law.** Unify the composed-quaternion law at the **portal-core canonical site** (`recompute_composed_quaternion_state`); epi-cli and the TS `composeQComposed` consume it. Combination = quaternion multiply (`normalize(·)` of factors).
- **Contradictions to resolve during build:** the `KairosChannel` is computed as an honest Greenwich transit (environmental) in `kairos.rs` yet `fetchKairosFromChronos` seeds the same channel from PASU birth data (personal) — conflating environment and identity (`kairos.rs:126` vs `index.ts:326-348`); state-count 472 vs 512 (M-M-prime:222,386); `m3_quat_active_state` angle uses only `composed.x/composed.w`, ignoring the j/k (Prime, Mod%6) contributions (HMS:639).

## 6. Cross-cutting coordinate map & superseded-track amendments

**Track 37 — Biological-Quaternionic Cross-Layer Integration ("The Living Symbolic Body")** is the existing home this layer completes, and it *architects the exact collapse DR-ENV-1 forbids*. The old-paradigm law to supersede — design-recon `37-*.md` §7:176 (and full-rerun `37-*.md`), §3 chain :117-127 — routes the live planetary/elemental feed **into the personal being-pattern register**. Precise amendments:

- **37.4** ("exports M2 elemental + cymatic contributions → PASU `elemental_weights` / M4 `bioquaternion_handles`") — the core collapse tranche. Amend: the routing target for the LIVE/collective band is the **`q_environment` transform factor** (this layer §3.5), NOT the PASU personal register. Only *natal-chart-derived* elemental weights (a birth-time invariant) may source identity; the live sky may only transform.
- **37.2** ("planetary-elemental projection → PASU; Sun excluded as identity root") — amend to split natal (identity, invariant — Sun-rooted, correct) from live/transit (environment — the ambient-condition input). The "Sun is the excluded identity root" instinct is *kept and generalised*: identity is the natal invariant, the transiting sky is environment.
- **37.9** ("planet↔aperture aspect; outer planets carry the 23.10 pending-dataset badge") — retire the pending-dataset badge per DR-ENV-2; the outer planets are the canonical ambient-condition band (they feed §2/§3.1), aspected against natal (the aspect-to-natal IS the "computed against personal invariants").
- **37.7 / 37.8 / 37.11** (RNA/chromosome deferral; lens→codon→binary; bioquaternion transcription totality) — retained, and *fed* by this layer's environmentally-selected codon states (§3.4); they are the expression-sequence substrate, not collapse sites.

**Track 23** — **23.10** (outer-planet stubs + pending-dataset badge) SUPERSEDED by DR-ENV-2; **23.19** (planetary-orbiter elemental-weight → bioquaternion/PASU `elemental_weights`) is a second collapse seam, amended as 37.4.

**Track 19:123** ("outer planets belong to M2-5 transpersonal extension; not in this LUT") — amend the note: outer planets are ambient environmental conditions, not a pending M2-5 *personal-correspondence* dataset. The exclusion-from-the-personal-LUT instinct is correct; the "future transpersonal personal dataset" destination is wrong.

**Track 32.10** (Kairos enablement onboarding — populates `M4_Temporal_Now.planet_degrees[10]`) — re-frame as *environmental-condition onboarding*: the live planet-degree feed is the ambient input to this layer, held distinct from natal identity; no epigenetic/identity-collapse language needed, but the ingress it opens is this layer's source.

**Retired markers:** `pending-dataset-2-5-8-9-10`, `pending-dataset:23.10`, `OUTER_PLANET_PSYCHOID_EXTENSION_TARGET='m2-5-transpersonal-extension'`, `MEANING_ID_PREEMPTED` on outer-planet rows — all superseded once the ambient layer lands; the outer-planet M2 rows keep only their harmonic footprint (Cousto Hz / element).

## 7. Build phases (the plan doc details these)

1. **Foundation** — `EnvironmentalCondition` schema + de-collapse `identityFromKairos` (identity from PASU natal; kairos as environment). No transform math yet.
2. **`env` derivation** — conditions-against-natal → `env` quaternion (transpersonal band via the `update_kairos_full` template + sensitivity coefficient).
3. **Composition** — `q_environment` at the single canonical site (unify the triplicated law); feed `env` to `m3_quat_active_state`.
4. **Rotational-state / symbolic seam** — the tarot 8-state expression + codon↔hexagram via the 3 matrices; resolve the j/k asymmetry.
5. **Expression sequences** — codon→RNA→amino-acid + Major-Arcana transformational sequences.
6. **Carrier + sink** — the `environment` `ModulationInputKey` + display carrier; the transform visible on the M4 user quaternion.

---

*v0.1 — authored 2026-07-14 for Architect review. This document is the correction surface: where it has mis-stated the intent, amend here before code. Prior conclusions herein carry the status of hypotheses grounded in file:line citation, not settled canon, until ratified.*
