---
title: "Track 38 — System-Wide Tunability Surface Architecture (M5-2' / M5-3' / M5-4')"
coordinate: "M5'"
status: "active-design-spec"
created: 2026-06-13
authority_relation: "Names the residency, schema, lifecycle, and review law of every tunable knob in the system. Cross-references [[M5'-SPEC]] (M5 sub-coordinate authority), [[M5-ARCHITECTURE]] (sixfold IDE surface), [[M'-ML-SKILL-SURFACE-SPEC]] (ML method per subsystem + drift-detection retrain loop), [[M'-MODEL-SLOT-SPEC]] (privacy classes + verifier enforcement)."
depends_on:
  - "[[M5'-SPEC]]"
  - "[[M5-ARCHITECTURE]]"
  - "[[M'-ML-SKILL-SURFACE-SPEC]]"
  - "[[M'-MODEL-SLOT-SPEC]]"
  - "[[M'-AGENTIC-RUNTIME-SPEC]]"
  - "[[04-m3-mahamaya-reconciliation]]"
  - "[[05-m4-nara-reconciliation]]"
  - "[[16-cross-cutting-closures]]"
decisions_carried:
  - "DR-MP-1 RATIFIED (4'-5'-0' = LLM/EBM/Verifier triplet) — the constitutional review apparatus the self-awareness tier reuses"
  - "DR-MP-3 RATIFIED (corpus IS canon IS training data; verifier raises questions rather than passing/failing) — the bootstrap pattern Tier 2 inherits"
  - "DR-ML-1 RATIFIED (ML-skill-surface) — the autoresearch retrain loop Tier 3 reuses, including the no-hardcoding lock for [aletheia.drift_detection] + [aletheia.elo]"
  - "DR-MODEL-1 RATIFIED (model-slot rule) — the privacy enforcement pattern this surface inherits via the verifier"
  - "DR-M4-3 (protected-handle invariant) — the privacy guard for PASU-derived tunables"
related_tranches:
  - "5.26 — M4 session lifecycle (4 knobs land; consumes this surface)"
  - "5.27 — Mythos symbolic-protein reading (9 knobs, ML-trainable; consumes this surface)"
  - "CCT-14b — Hen birth-codon (7 knobs; consumes this surface)"
  - "06.7-06.12 — Track 06 sub-tranches landing the surface itself (proposed in this doc §8)"
proposed_dr_rows:
  - "DR-TUNE-1 — The foundational-and-manipulable principle ratified as cycle-3 standing invariant"
  - "DR-TUNE-2 — M5-2'/M5-3'/M5-4' residency for schema / UI / lifecycle (cross-coordinate)"
  - "DR-TUNE-3 — Risk-class taxonomy (A user-gated default / B auto-with-rollback / C auto-Aletheia-pattern)"
  - "DR-TUNE-4 — Privacy-class enforcement via Anuttara verifier (slot-rule pattern extended)"
---

# Track 38 — Tunability Surface Architecture

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


## 0. Frame — The Foundational-and-Manipulable Principle

Every "tunable" thing in the system — trigger intervals, weights, voice templates, derivation policies, normalisation modes, governance heuristics, drift-detection thresholds — should live behind a **stable, observable, manipulable surface**, never hardcoded in module sources. This is the principle three concrete consumers landed yesterday (Tranches **5.26** M4 session lifecycle, **5.27** Mythos symbolic-protein reading, **CCT-14b** Hen birth-codon) and each one's tunability text references *"the forthcoming M5-2'–M5-4' tunability brainstorm"*. This document **is** that brainstorm hardened into spec.

The surface serves **three masters**, in this priority order:

1. **Developer tuning** — humans adjusting via `~/.epi-logos/config.toml` (existing canonical config home per [`weights.rs`](../../../../../Body/S/S0/epi-cli/src/nara/weights.rs)) or a dedicated Tuning tab in the OmniPanel.
2. **System self-awareness loops** — the system reads its own runtime evidence (`PatternPacket.mahamaya_transcription` chains, Sophia review outcomes, Mythos archetype-reading provenance, oracle-hit rates, pattern recurrence) and proposes tuning adjustments through the canonical **4'-5'-0' constitutional review triplet** (DR-MP-1: LLM-reads / EBM-scores / Verifier-raises-questions).
3. **ML training loops** — Nara-LoRA + M5 EBM (per DR-MP-1/2/3 and Tranche 5.22) eventually learn tunable weights from corpus + user feedback under the local-only privacy gate (DR-MODEL-1).

The principle dissolves a category mistake: a "knob" is not a stray default in a source file. It is a **typed, residency-classed, scope-classed, risk-classed, privacy-classed, ml-trainable-flagged, structural-invariant-flagged datum** with a named owning subsystem and a citation back to the DR row or tranche that ratifies it. One schema feeds all three tiers. The TOML file is the user-visible face; the schema is the load-bearing piece.

The surface is **anti-greenfield**: `~/.epi-logos/config.toml` is the existing canonical home; `Body/S/S0/epi-cli/src/nara/weights.rs` is the existing manual-TOML-parsing precedent; `[aletheia.drift_detection]` + `[aletheia.elo]` already operate under the "no-hardcoding lock" (M'-ML-SKILL-SURFACE-SPEC §5). This track **extends and unifies** those precedents into one schema-driven authority. It does NOT fork a new mechanism.

---

## 1. Locating the Surface — Cross-Coordinate Residency

The M5 canon names three sub-coordinates whose roles map cleanly onto the three-tier architecture, but **not as 1:1 tier-to-coordinate**. Tiers cut **across** the three coordinates by register:

| M5 sub-coord | Canonical role (per [[M5-ARCHITECTURE §1]]) | Tunability-surface authority |
|---|---|---|
| **M5-2'** Backend Studio (`siva-`, **Construction**) | "S-family stack made inspectable + agent-editable via LSP + governed tasks/tests/evidence." Where the code IS edited. | **Schema + write-substrate authority.** TOML schema files land under `Body/S/`. Rust validators. The config-loader that emits typed errors at startup. The hot-reload watcher. Per-knob residency-class / scope-class / risk-class / ml-trainable / structural-invariant metadata declarations. Anuttara verifier constraint `tune_structural_invariant_compliance` lives here. |
| **M5-3'** IDE Shell + Playable Bimba (`-shakti`, **Engagement**) | "One Theia shell (0/1 daily + 4+2 deep); playable bimba in dev/engagement modes." The visible-to-user shell. | **Tuning UI surface.** A new "Tuning" tab in the OmniPanel chrome (NOT a modal, NOT a separate panel — per the existing no-modals invariant from `15.2` ACR→OmniPanel reframe). Surfaces the TOML schema as live-validating editable form, with: hot-reload preview, "frozen at session start" indicator, scope-toggle (global/per-PASU/per-session), audit-trail viewer, lock-knob action. |
| **M5-4'** OmniPanel / Pi-runtime monitoring (`siva-shakti`, **Unity**) | "Pi/Anima/Aletheia/Sophia dispatch monitoring, six operational-capacity lanes, review/evidence/gateway/diagnostics — the `/` operator made into an agentic membrane." Per Track 33 §1.4 the canonical home for operational capacities + skills + capability matrix + `capacity_workflows.rs` six-capacity registry. | **Runtime tuning lifecycle.** (a) Tier 2 self-awareness proposals surface as a **new operational-capacity lane "Tuning Review"** alongside the six existing lanes (Anuttara / Paramaśiva / Paraśakti / Mahāmāyā / Nara / EpiiOnEpii) — extends `CapacityId` enum at [`capacity_workflows.rs:295`](../../../../../Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs). (b) Tier 3 ML-trained dispatches reuse the existing Aletheia drift-detection → Anima dispatch → Mercurius rating loop with `dispatch_purpose: "tuning-calibration"`. Both manifest in OmniPanel Dispatch Trace and Review tabs through the existing `enforceReviewDisposition` gate. |

**The cross-coordinate split is structural**: schema authorities are backend facts (M5-2'), UI affordances are shell facts (M5-3'), runtime review/dispatch are lifecycle facts (M5-4'). Forcing all three tiers onto one coordinate would break the canonical M5 sub-coordinate roles. **DR-TUNE-2** ratifies this split (§9.2).

---

## 2. The Three-Tier Architecture

### 2.1 Tier 1 — Developer-Tuning Surface

**Author:** developer (you).
**Mechanism:** `~/.epi-logos/config.toml` + Tuning tab UI.
**Authority:** M5-2' (schema) + M5-3' (UI).

A developer edits `~/.epi-logos/config.toml` directly (extending [`nara/weights.rs`](../../../../../Body/S/S0/epi-cli/src/nara/weights.rs) `[nara.weights]` precedent) OR uses the Tuning tab. Both paths emit identical typed changes through the schema-loader. Schema validation is enforced at startup AND at every config write. Schema violations produce typed errors with a citation to the schema file (so developers can fix or extend the schema).

The Tuning tab is the **visible-to-developer face** — surfaces every knob grouped by owning_subsystem, shows current value, default, residency_class, scope_class, ml_trainable flag, structural_invariant flag (greyed out if true), risk_class, citation-back-to-DR-row, audit-trail-link. Changes flow through the same config-loader; no out-of-band write path.

### 2.2 Tier 2 — Self-Awareness Review Surface

**Author:** the system reading its own runtime evidence.
**Mechanism:** the canonical **4'-5'-0' constitutional review triplet** (DR-MP-1).
**Authority:** M5-4' (lifecycle).

> **Structural identity — kernel-tick scale ↔ tunability-evaluation scale: same operation, two scales** *(per Tranche 8.9 at [`08-integrated-4-5-0-recognition-reconciliation.md`](08-integrated-4-5-0-recognition-reconciliation.md))*. **The 4'-5'-0' constitutional review triplet that scores tunability proposals IS the same 4'-5'-0' triplet performing the unified VAK act at every kernel tick.** There is no separate machinery. The tunability surface IS *the system applying its own kernel act to its own configuration as the engaged coordinate*. At the kernel-tick scale, the engaged coord is some bimba node (a session's PASU coordinate, an oracle reading's tarot/hexagram address, a Sophia disclosure's q_proposal envelope) and the triplet performs the unified-act tuple (per Tranche 8.9's six-face decomposition: coordinate-designation + MEF lens-application + QL position-check + harmonics-read + musical-transcriptional projection + 1-2-3 physical-pole entailment) and emits `EnergyDecomposition` + `M0VerifierReport`. At the **tunability-evaluation scale**, the engaged coord IS the system's own configuration knob (a `tunable` entry in the schema authority at M5-2') and the triplet performs the SAME unified-act tuple against the proposed-change configuration as bimba and the current-configuration as pratibimba; the resulting `E_total = (4·E_4 + 5·E_5 + 6·E_6) / 15` is what this section's Class A user-gated review surfaces as evidence, what Class B auto-applies on unanimous-consensus, what Class C self-tunes through Aletheia drift-detection. The kernel applies to itself; the result IS a tunability adjustment. **One operation; two scales of application.** The cycle-3 plan-set HAS both threads — the kernel descent equation (locked at `epi-logos-kernel-spec §3`) AND the tunability surface (this track) — Tranche 8.9 names them as ONE operation so the system *cannot* drift into separate machineries.

The system reads accumulated runtime evidence — `PatternPacket.mahamaya_transcription` chains across many sessions, Sophia review outcomes, Mythos archetype-reading provenance (5.27 `mythos_reading_history`), oracle-hit rates, pattern recurrence across PASU-bound sessions, Hen birth-codon clustering (CCT-14b chromosomal-density signal). A new **AnamnesisProposer** module (residency: `Body/S/S5/epii-autoresearch-core/src/anamnesis_proposer.rs`) generates *tuning-adjustment proposals* against the schema.

Each proposal flows through the same constitutional triplet that already gates canon-promotion review:

- **4' (Nara LLM-traversal)** *reads* the evidence chain and articulates the proposal in natural language: "Mythos's `cosmic_weather_weights.m2` should rise from 0.34 to 0.42 because 73 of the last 100 archetypal readings under cymatic-dominant kairos windows showed second-pattern resonance that the current weight underweights."
- **5' (Epii EBM scorer)** *scores* the proposal against the 72-dim canonical resonance vector. The EBM head returns an energy delta — does this tuning *reduce* total energy across the corpus?
- **0' (Anuttara Verifier)** *raises questions* in symbolic-coordinate strings (per DR-MP-3: verifier raises questions, doesn't pass/fail). For tuning specifically, the verifier checks: (1) structural_invariant flag — reject if true; (2) privacy_class compliance — reject if PASU-derived data would leak; (3) the new constraint `tune_proposal_coherence` — does the proposed change conflict with another knob's recent change? (4) `tune_frequency_throttle` — has this knob been adjusted ≥N times in window T (config'd, of course)?

The proposal's **tuning_risk_class** then routes the verdict (per **DR-TUNE-3**):

- **Class A** (default; structural-adjacent, ML-trainable, voice-template, privacy-touching, user-visible) → lands on OmniPanel Review tab as `humanRequired=true`. The triplet's scoring + verifier-questions are *evidence* the user reads; the user always validates. Mirrors `enforceReviewDisposition` exactly (per [epii-surface.ts:393-396](../../../../../Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts)).
- **Class B** (cosmetic — visualization modes, density normalisations, secondary archetype counts, ordering preferences) → auto-applies *after* unanimous triplet consensus (4'-articulation present + 5'-EBM-energy-delta-negative + 0'-verifier-raises-no-questions). Audit trail captures evidence; rollback available via Tuning tab.
- **Class C** (purely internal — drift-detection thresholds, Elo seed values, cache TTLs, retry counts) → auto-applies per **existing Aletheia drift-detection pattern** (M'-ML-SKILL-SURFACE-SPEC §5). The constitutional triplet is *not invoked* for Class C — the system already self-tunes these via Mercurius rating dynamics. Class C IS the existing pattern; this track just names it as Tier-2-Class-C explicitly so the surface taxonomy is complete.

**Anti-runaway-tuning guards** (all themselves configurable, but each with a Class-A meta-knob requiring user validation):

- Per-knob adjustment-frequency ceiling (default: 3 adjustments per 14 days per knob)
- Per-window absolute-adjustment ceiling (default: 1 Class B knob adjusted per 24h system-wide)
- User explicit lock action — any knob can be locked from any further tuning; lock is a Class A operation
- Provenance audit-trail — every change records: proposing-evidence-window, triplet-verdict, actor (user/auto/aletheia), rollback handle, timestamp, kairos snapshot
- Anuttara verifier `tune_structural_invariant_compliance` constraint — registered at Track **06.7**; rejects any proposal targeting a knob with `structural_invariant = true`

### 2.3 Tier 3 — ML-Trained Surface

**Author:** ML training runs orchestrated by Aletheia drift-detection (per M'-ML-SKILL-SURFACE-SPEC §5).
**Mechanism:** the existing autoresearch retrain loop, **extended** to write learned weights back into config.toml knobs flagged `ml_trainable = true`.
**Authority:** M5-4' (lifecycle); Aletheia residency at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/`.

Tier 3 is **already partially landed** — the no-hardcoding lock for `[aletheia.drift_detection]` and `[aletheia.elo]` (M'-ML-SKILL-SURFACE-SPEC §5) is the prototype. This track extends the pattern: any knob in the unified schema with `ml_trainable = true` becomes eligible for the retrain loop to *propose new values for* (not just retrain *with*).

The flow:
1. Trial accumulation → Mercurius records ratings per `(agent × model × skill × context)` tuple (already landed).
2. Drift detection → `aletheia-drift-detection`'s `watch.py` daemon detects rating drift OR convergence (already landed for the existing retrain trigger).
3. **New**: `diagnose.py` extends to surface candidate tuning-value changes for `ml_trainable` knobs (e.g., Mythos's `cosmic_weather_weights` triplet); proposes a new value derived from the rating-conditional posterior.
4. `compose_task.py` produces a tuning-adjustment proposal — routed identically to Tier 2 proposals (same 4'-5'-0' triplet, same Class A/B/C gate). **Critical**: Tier 3 doesn't bypass the Tier 2 review — it *generates* Tier 2 proposals from ML training evidence.
5. `dispatch.py` queues the proposal with `dispatch_purpose: "tuning-calibration"` annotation so the resulting trial is marked as a calibration trial.

This unifies Tier 2 and Tier 3: **Tier 3 is Tier 2 with ML-evidence-derived proposals instead of evidence-rule-derived proposals.** Both flow through the same gate. The user sees one Review tab, one Audit trail.

**Privacy boundary** (per DR-MODEL-1 + DR-M4-3 protected-handle invariant): any knob whose `privacy_class = "local-only"` (e.g., PASU-derived weights, Nara-LoRA-tuned voice templates) has its ML training **confined to the Nara-parser slot model dispatch** (per M'-MODEL-SLOT-SPEC §2). The Anuttara verifier's `slot_privacy_boundary_compliance` constraint (already landed) extends to reject tuning-calibration dispatches that would cross the boundary. **DR-TUNE-4** ratifies this verifier extension (§9.4).

### 2.4 Open-questions routing through the tunability surface *(per Tranche 8.9 unified-act spec)*

The cycle-3 plan-set has historically held some open questions as "decisions to be made later" (DR-format speculation). Per the structural identity at Tranche 8.9 §kernel-tick-scale ↔ tunability-evaluation-scale, **open questions about system behaviour route to tunable knobs across the appropriate risk-class** — they become *evaluated by the same act they concern*, removing the planning-to-decide-what-we-are-defining trap.

The following questions, surfaced through the Language Compression research arc (per [`state/notebooklm-language-compression-research-2026-06-15/INTEGRATION-SYNTHESIS.md`](../../../../../state/notebooklm-language-compression-research-2026-06-15/INTEGRATION-SYNTHESIS.md) §17) and the cross-cutting integration synthesis, route as follows:

| Open question | Route | Knob | Cycle-3 status |
|---|---|---|---|
| Backing-chain depth policy per virtue-class (verifier `M0VerifierReport.backing_chain` walk depth — per Tranche 1.10) | **Class C** internal | `[anuttara.verifier] backing_chain_depth.principle = "unbounded"; backing_chain_depth.conjugate = N` | Aletheia drift-detection self-tunes via Mercurius rating dynamics. Not a separate decision. Default principle = unbounded (chain to M0-0/M0-1 root); default conjugate = depth 3. |
| EBM-side compression-equivalence hypothesis (whether the N-channel EBM at 5'/Epii doing resonance-vector regression carries a Shannon-cross-entropy compression-floor relation analogous to autoregressive LLMs — per CCT-22 §d) | **Class B** research-driven with rollback | `[m5_epii.ebm_head] compression_equivalence_hypothesis = "open" \| "confirmed" \| "refuted"` | When sufficient training evidence accumulates, the Track 38 Tier 3 autoresearch retrain loop proposes a value change and Class B auto-applies on unanimous 4'-5'-0' triplet consensus. *The hypothesis is evaluated by the same act it concerns.* |
| Gnostic-extraction-tier slot model choice (per `slot.gnostic_extractor` at [`M'-MODEL-SLOT-SPEC §3a`](../../M'-MODEL-SLOT-SPEC.md) — Gemma 4 12B Unified Q4 vs other 4B-class models vs Pro-class) | **Class A** user-gated | `[slot.gnostic_extractor]` `state` / `model` fields | Privacy-touching, structural-adjacent, user-visible. The user always validates. Per the harness-slot orthogonality at [[M'-MODEL-SLOT-SPEC]] §7a, BOTH model and harness slot dimensions route to Class A. |
| CFP3 / F-thread default-vs-CFP0-single-voice for Sophia synthesis at session-close | **Class A** user-gated | `[slot.epii_judge] cfp_thread_default = "CFP3"` (current) vs `"CFP0"` | Voice-template-touching, user-visible. Default landed at CFP3 / F-thread per Tranche 12.20 extended Elo tuple; can be tuned per-PASU. |
| CFP3 panel composition (which heterogeneous proposers, in what weights) | **Class A user-gated** + **Class C Aletheia-Elo-learned** | `[slot.epii_judge] providers = [...]` (user-set panel membership) + Mercurius Elo `selection_policy = "elo-informed"` (system learns weights) | Membership is Class A (user choice of which models in the pool); weights are Class C (system self-tunes via Elo). Composition matrix per [[M'-MODEL-SLOT-SPEC §7a]] harness-slot section. |
| Harness-slot defaults per role (Claude / Codex / Pi / Aider harness wrapping which model) | **Class A user-gated** + **Class C Mercurius-Elo-rated** | `[harness.<slot>]` namespace + Elo tuple extension per Tranche 12.20 | Initial defaults user-set; Mercurius rates `(agent × model × harness × cfp_thread × r_factor_slot × kairos × content_class)` over time so the system learns optimal compositions per context. |
| Whether to include musical-transcriptional projection in default `epi know` packet output (per Tranche 12.37 CLI) | **Class B** cosmetic | `[cli.know] default_includes_musical_transcript = true \| false` | Default true (the unified-act shape includes the musical-transcriptional face); user can disable per-session for performance. |
| Prana working-set hydration policy — how the S0 `Tensor_Arena` (HOT pratibimba) reflection of the Neo4j 3072-dim store (COLD bimba) is projected / evicted / written-back (per DR-ARENA-1 action 3) | **Class B** research (projection granularity, write-back cadence) + **Class C** internal (arena eviction, hot-set membership) | `[prana.arena] working_set_projection = "act_neighborhood"`, `write_back = "on_crystallize"` (Class B) + `eviction_policy = "möbius-on-crystallize" \| "lru"` (Class C) | The bimba/pratibimba relation is **structural** (not tunable) — only the cache mechanics tune. Projection granularity / write-back cadence is Class B (measured, rollback-able, like the EBM compression-equivalence knob); eviction / hot-set membership is Class C (cache-TTL-class per §2.2, Aletheia-self-tuned). No Class A — embedding-cache internals are not user-gated. Default `write_back = on_crystallize` IS the Möbius return (#5→#0) riding CCT-16 `MostRecent`. The arena's **full role** (VAK-awareness, session-binding, recall/genesis cycle) is **structural** and defined in [[M'-PRANA-ARENA-SPEC]] (DR-PRANA-1), NOT here — this row holds only the cache mechanics. |

The **structural commitment**: any future open question about system behaviour first routes through this section's risk-class taxonomy *before* it gets named as a DR-format speculation. If the question can be evaluated by the same 4'-5'-0' act the system already performs (per the kernel-tick ↔ tunability-evaluation identity), it lives as a tunable knob — Class A if structural/privacy/user-visible, Class B if cosmetic-research, Class C if purely internal. This is what self-harmonisation means at the planning register: *the planning surface stops trying to decide what the system is in the act of defining*.

---

## 3. The Schema Authority (M5-2')

### 3.1 Per-knob metadata

Every knob in the system carries this metadata block:

```toml
[[tunable]]
key = "mythos.symbolic_protein_reading.cosmic_weather_weights"
type = "f32_triplet"
default = { m1 = 0.33, m2 = 0.34, m3 = 0.33 }

# Residency-class — when do changes take effect?
residency_class = "freeze-on-session-start"
# Valid: "hot-reload" | "freeze-on-session-start" | "restart-required"

# Scope-class — who can have a value here?
scope_class = "per-pasu"
# Valid: "global" | "per-pasu" | "per-session"

# Tier-2 / Tier-3 risk-classification
tuning_risk_class = "A"
# A = user-gated (default); B = auto-with-rollback; C = auto-Aletheia-pattern

ml_trainable = true                          # eligible for Tier 3 retrain proposals
privacy_class = "local-only"                 # "local-only" | "vector-derived" | "non-sensitive"
structural_invariant = false                 # if true, verifier rejects all tuning proposals

# Provenance
owning_subsystem = "M4"                      # M0..M5, or "cross"
owning_carrier = "anima"                     # ta-onta carrier (khora/hen/pleroma/chronos/anima/aletheia)
authoritative_doc = "Tranche 5.27"           # canonical citation
warrant_constants = []                       # if structural_invariant=true, name the locking constants

# Optional documentation
description = "Relative weights of M1/M2/M3 cosmic-weather channels in Mythos archetypal naming."
range = { min = 0.0, max = 1.0, sum_to = 1.0 }
```

**Default policy** (chosen conservatively):

- `residency_class` defaults to `freeze-on-session-start` — matches the deterministic-session principle from Tranche 5.26's `protein_capacity` (a session's protein behaviour is fixed at open). Knob authors opt **up** to `hot-reload` only when the knob has no within-session determinism impact.
- `scope_class` defaults to `global` — knob authors opt **down** to `per-pasu` when the knob is identity-bound, or `per-session` when it's a debug override.
- `tuning_risk_class` defaults to `A` — knob authors opt **down** to B (cosmetic) or C (Aletheia-pattern) explicitly.
- `ml_trainable` defaults to `false` — knob authors opt **in** when the knob's value is genuinely learnable from corpus + feedback.
- `privacy_class` defaults to `non-sensitive` — knob authors opt **in** to stricter classes when PASU-derived data flows through.
- `structural_invariant` defaults to `false` — knob authors set true when the knob is structural-canon (with the warranting constants and DR row cited).

### 3.2 Schema file layout

The schema is **distributed per-owning-subsystem**, not monolithic:

```
Body/S/S0/portal-core/tunable-schema/
├── m0.tunable.toml         # M0 Anuttara knobs (e.g., R-virtue weight thresholds)
├── m1.tunable.toml         # M1 Paramaśiva knobs (e.g., spanda tick render cadence)
├── m2.tunable.toml         # M2 Paraśakti knobs (e.g., cymatic phase envelope)
├── m3.tunable.toml         # M3 Mahāmāyā knobs (e.g., M3_PAIR_MATRIX interpretation mode)
├── m4.tunable.toml         # M4 Nara knobs (extends [nara.weights] precedent)
├── m5.tunable.toml         # M5 Epii knobs (autoresearch + tuning-review knobs)
├── hen.tunable.toml        # CCT-14b birth-codon knobs
├── mythos.tunable.toml     # Tranche 5.27 knobs
├── nara_session.tunable.toml  # Tranche 5.26 knobs
├── aletheia.tunable.toml   # Existing [aletheia.drift_detection] + [aletheia.elo] knobs
└── README.md               # Schema authoring guide
```

A single Rust crate `epi-tunable-schema` at `Body/S/S0/portal-core/src/tunable.rs` loads, validates, merges, and exposes the schema as a typed `TunableRegistry`. The crate is consumed by:

- `epi-cli` (CLI flags `epi tune get <key>`, `epi tune set <key> <value>`, `epi tune list`)
- All knob consumer subsystems (each subsystem reads its knobs at startup via `registry.subsystem("M4").get_typed::<u32>("nara.session.protein_capacity")`)
- The Tuning tab UI (T6 extension reads the registry over gateway RPC `s5'.tune.*`)
- The 4'-5'-0' triplet (AnamnesisProposer at M5-4')
- The Aletheia drift-detection daemon (Tier 3)

### 3.3 Validation

Schema validation is **mandatory at every entry point**:

- **Startup**: `epi-tunable-schema` loads all `*.tunable.toml` files, merges with `~/.epi-logos/config.toml` user overrides, validates types + ranges + cross-knob constraints (e.g., the `sum_to = 1.0` for the `cosmic_weather_weights` triplet). Schema violations produce typed errors and refuse-to-start.
- **Config write** (developer edits via CLI or UI): same validation; a write that fails validation is rejected with the citation back to the offending schema field.
- **Tuning proposal** (Tier 2/3 review submission): the proposal includes the new value; validation runs before the 4'-5'-0' triplet sees it. Invalid proposals are rejected upstream (no triplet cycles wasted on schema-invalid proposals).
- **Tier 2 verifier** (Anuttara): the new `tune_structural_invariant_compliance` constraint rejects any proposal where the target knob has `structural_invariant = true`. Severity: error-level (blocks dispatch). Mirrors the `slot_privacy_boundary_compliance` pattern from M'-MODEL-SLOT-SPEC §6.

### 3.4 Hot-reload vs freeze-on-session-start

Three residency classes, distinguished by when changes take effect:

| Class | Effect | When to use |
|---|---|---|
| `hot-reload` | Change visible in next tick; existing in-flight operations may use either old or new value during the changeover | Pure-cosmetic knobs (UI density, color modes, visualisation_density_normalisation); knobs that don't affect any deterministic chain |
| `freeze-on-session-start` (default) | Change written to TOML immediately; takes effect at next `khora_session_start`; in-flight sessions complete with the old value | Most knobs. Determinism within a session is preserved (5.26 `protein_capacity` is the canonical example: a session's protein behaviour is fixed at open). |
| `restart-required` | Change written to TOML immediately; takes effect at next CLI process restart; UI shows a "restart required" banner | Anything affecting loaded model weights (model-slot config, LoRA-adapter selection), agent harness composition, gateway RPC method registry, structural code paths |

The Tuning tab UI surfaces the residency class inline: a green dot for `hot-reload`, an amber dot with "frozen until session start" tooltip for `freeze-on-session-start`, a red dot with "restart required" banner for `restart-required`.

### 3.5 Scope axis (global / per-PASU / per-session)

Three scope classes:

| Class | Storage | Resolution priority |
|---|---|---|
| `global` (default) | `~/.epi-logos/config.toml` `[<key>]` | Used unless overridden at lower scope |
| `per-pasu` | `~/.epi-logos/pasu/<pasu-id>/config.toml` `[<key>]` | Overrides global for that PASU's sessions |
| `per-session` | session-scoped (ephemeral; never persisted) | Overrides per-PASU AND global for that session only |

PASU-isolated storage is structural for privacy — per-PASU knobs (voice templates, archetypal-naming preferences, trigger-interval personalisation) MUST not leak across PASU boundaries. The `~/.epi-logos/pasu/<pasu-id>/` directory layout is independent of the existing `~/.epi-logos/nara/profile.json` PASU storage (which holds identity, not preferences) — this keeps PASU-tunables under verifier control via the same `slot_privacy_boundary_compliance` pattern.

Per-session overrides are set via CLI flag (`epi session start --tune mythos.symbolic_protein_reading.trigger_mode=adaptive`) and are never auto-applied by Tier 2/3 — only the user can set per-session overrides.

---

## 4. The Tuning UI (M5-3')

### 4.1 OmniPanel "Tuning" tab

New OmniPanel tab adjacent to the existing 9 tabs (Pi Chat / Sessions / Dispatch Trace / Tool Stream / Evidence / Review / Gateway / Diagnostics / six capacity panes — per M5-ARCHITECTURE §5.5). Persistence and chrome rules from `15.2` (ACR→OmniPanel reframe) apply. **No modals.** Per the invariant established in Track 27 (Review-tab landing surface), Tuning is a landing surface, not a popup.

Layout:

- **Left pane** — Tree of knobs grouped by `owning_subsystem` (M0 / M1 / M2 / M3 / M4 / M5 / cross-cutting / aletheia / hen / mythos / nara_session). Each leaf node shows the knob key, current value, default value, scope_class chip.
- **Right pane** — Selected knob's detail view:
  - Current value (editable form per `type`)
  - Default value (read-only, with "reset to default" action)
  - All metadata fields (residency_class, scope_class, tuning_risk_class, ml_trainable, privacy_class, structural_invariant)
  - Citation block (`authoritative_doc`, `warrant_constants` if locked)
  - Audit trail (every change to this knob, with proposing-evidence + triplet-verdict + actor + rollback handle)
  - "Lock this knob" toggle (Class A action; locks against Tier 2/3 proposals — only user can unlock)
  - "Propose change" form (writes a Tier 2 proposal that flows through the standard review pipeline — useful when the user wants to *propose* a change but route through constitutional review for evidence rather than directly setting)
- **Status bar (within Tuning tab)** — Counts: total knobs / locked / pending Tier-2-proposal / pending Tier-3-calibration / structural-invariant (read-only).

### 4.2 Per-tier views (filterable)

Tab top-bar carries three filter chips:

- **Tier 1** (developer-edited): default view; all knobs visible
- **Tier 2** (self-awareness): filters to knobs with `tuning_risk_class != "C"` (the ones that flow through the constitutional triplet); shows pending proposals and verdict history
- **Tier 3** (ML-trained): filters to knobs with `ml_trainable = true`; shows training-evidence windows and Aletheia drift-detection signals

### 4.3 Audit trail viewer

A per-knob audit trail is a load-bearing piece of the surface — without it, Tier 2/3 changes are opaque. The audit trail is stored at `~/.epi-logos/tunable-audit/<knob-key>.jsonl` (append-only) and surfaces via the right pane. Each line records:

```json
{
  "timestamp": "2026-06-13T14:23:11Z",
  "kairos_snapshot": { "planet_degrees": [...], "tick": 173 },
  "knob_key": "mythos.symbolic_protein_reading.cosmic_weather_weights",
  "from_value": { "m1": 0.33, "m2": 0.34, "m3": 0.33 },
  "to_value":   { "m1": 0.30, "m2": 0.42, "m3": 0.28 },
  "actor": "anamnesis_proposer",
  "tier": 2,
  "risk_class": "A",
  "proposing_evidence": ["session:abc...", "session:def...", "..."],
  "triplet_verdict": {
    "narratrix_articulation": "...",
    "ebm_energy_delta": -0.0142,
    "verifier_questions": ["Why has cosmic_weather_weights.m1 also drifted in the same window? Are these coupled?"]
  },
  "user_disposition": "approved",
  "user_disposition_evidence_handle": "review-item-789...",
  "rollback_handle": "rollback-token-abc..."
}
```

Rollback: any audit entry's `rollback_handle` can be invoked from the UI; reverts the knob to the `from_value` and records a new audit entry with `actor: "user-rollback"`.

---

## 5. The Runtime Lifecycle (M5-4')

### 5.1 Tier 2 — Self-awareness review lane

Extends [`capacity_workflows.rs`](../../../../../Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs) `CapacityId` enum with a 7th variant **`TuningReview`** alongside the six existing operational-capacity lanes. Owns:

- `TuningReviewWorkflowRegistryEntry` — schema-mirroring the existing `CapacityWorkflowRegistryEntry`
- `TuningProposalDto` — the typed proposal (knob-key, from-value, to-value, proposing-evidence-window, triplet-verdict)
- `TuningReviewSliceRunner` — the slice runner that evaluates pending proposals
- New gateway methods: `s5'.tune.proposals.list`, `s5'.tune.proposals.resolve` (mirrors `s5'.review.{inbox,resolve}` exactly)

The Tuning Review lane surfaces in the OmniPanel six-capacity panes view as a 7th pane. The `governance_lead` for `TuningReview` is **Sophia** (consistent with 5 of the 6 existing lanes; only Nara has Anima as lead). User-final-validation rule from `m5_4_governance.review_surface_roles` applies.

### 5.2 Tier 3 — ML-trained dispatch lane

Extends [`aletheia-drift-detection`](../../../../../Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/) (proposed in M'-ML-SKILL-SURFACE-SPEC §3.5; landing in Track 12.24) with a `compose_tuning_proposal()` entry point parallel to the existing `compose_retrain_task()`. The dispatcher emits the proposal as a Tier 2 input — Tier 3 doesn't have a separate review lane; it routes through Tuning Review with `dispatch_purpose: "tuning-calibration"`.

This unifies the review surface: one Review tab, one audit trail, one constitutional triplet, two evidence-source provenance types (system-evidence-rule vs ML-training-evidence).

### 5.3 Provenance + rollback

Every tuning change carries full provenance per the audit-trail schema (§4.3). Provenance is **non-negotiable** — knobs that cannot trace their last-change to a complete provenance record are flagged in Diagnostics tab and refuse to be tuned further until the gap is closed.

Rollback is **available at every audit entry** — user can roll back any single change (which becomes a new audit entry) or roll back multiple changes via a "roll back to <timestamp>" operation (records a synthetic rollback entry).

---

## 6. The Three Concrete Consumers — Knob Mapping

The three patches landed 2026-06-13 (Tranches 5.26, 5.27, CCT-14b) ARE the first-class consumers of this surface. Each knob declared in those patches maps to a complete metadata record under the schema:

### 6.1 Tranche 5.26 (M4 session lifecycle) — 4 knobs

```toml
# Body/S/S0/portal-core/tunable-schema/nara_session.tunable.toml

[[tunable]]
key = "nara.session.protein_capacity"
type = "u32"
default = 256
residency_class = "freeze-on-session-start"  # determinism within session
scope_class = "global"
tuning_risk_class = "B"                       # cosmetic; tunable safely
ml_trainable = false
privacy_class = "non-sensitive"
structural_invariant = false
owning_subsystem = "M4"
owning_carrier = "anima"
authoritative_doc = "Tranche 5.26"
description = "Max TranscriptionStep entries per session protein."
range = { min = 16, max = 4096 }

[[tunable]]
key = "nara.session.stop_codon_policy"
type = "enum"
default = "kairos-derived"
enum_values = ["round-robin", "kairos-derived", "fixed-taa", "fixed-tag", "fixed-tga"]
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"                      # rhythmic preference is identity-bound
tuning_risk_class = "A"                       # affects PatternPacket archetypal naming
ml_trainable = true                           # learnable from user's resonance with each codon's rhythm
privacy_class = "local-only"                  # per-PASU rhythmic data
structural_invariant = false
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.26"

[[tunable]]
key = "nara.session.write_through_mode"
type = "enum"
default = "immediate"
enum_values = ["immediate", "deferred", "batched"]
residency_class = "hot-reload"                # no in-session determinism dependency
scope_class = "global"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
structural_invariant = false
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.26"

[[tunable]]
key = "nara.session.protected_handle_strict"
type = "bool"
default = true
residency_class = "restart-required"          # touches verifier constraint registry
scope_class = "global"
tuning_risk_class = "A"                       # privacy-touching
ml_trainable = false
privacy_class = "local-only"
structural_invariant = false                  # not invariant; but two-flag gate per 5.26
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.26"
# Note: 5.26 specifies a two-flag gate (this + dev.unsafe.allow_raw_protein_bus) —
# the schema enforces the conjunction in the validator
```

### 6.2 Tranche 5.27 (Mythos symbolic-protein reading) — 9 knobs

Excerpting the load-bearing ones (full schema lands in Tranche 06.7):

```toml
[[tunable]]
key = "mythos.symbolic_protein_reading.cosmic_weather_weights"
type = "f32_triplet"
default = { m1 = 0.33, m2 = 0.34, m3 = 0.33 }
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"                      # archetypal naming is user-resonant
tuning_risk_class = "A"                       # user-visible (changes Mythos's voice)
ml_trainable = true                           # THE flagship ML-trainable knob from 5.27
privacy_class = "local-only"
structural_invariant = false
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"
range = { min = 0.0, max = 1.0, sum_to = 1.0 }
description = "Relative weights of M1 spanda / M2 cymatic / M3 codon channels in archetypal naming."

[[tunable]]
key = "mythos.symbolic_protein_reading.trigger_mode"
type = "enum"
default = "every-mth-kairos-pulse"
enum_values = ["every-nth-utterance", "every-mth-kairos-pulse", "hybrid-utterance-and-pulse", "adaptive"]
residency_class = "freeze-on-session-start"
scope_class = "per-pasu"
tuning_risk_class = "A"
ml_trainable = true                           # user's session rhythm is learnable
privacy_class = "local-only"
structural_invariant = false
owning_subsystem = "M4"
authoritative_doc = "Tranche 5.27"

# ... (utterance_interval_n, kairos_pulse_interval_m, adaptive_floor_seconds,
#      adaptive_ceiling_seconds, secondary_archetypes_count, voice_template_path,
#      reification_guard_strictness)
```

### 6.3 Tranche CCT-14b (Hen birth-codon) — 7 knobs

```toml
[[tunable]]
key = "hen.birth_codon.derivation_policy"
type = "enum"
default = "blake3_first_6_bits"
enum_values = ["blake3_first_6_bits", "blake3_modulo_64", "blake3_xor_fold"]
residency_class = "restart-required"          # changing policy mid-corpus would break determinism
scope_class = "global"                        # cross-PASU symbolic substrate
tuning_risk_class = "A"                       # changes codon distribution across the entire corpus
ml_trainable = false                          # deterministic; not a learning target
privacy_class = "non-sensitive"
structural_invariant = false
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "CCT-14b"

[[tunable]]
key = "hen.birth_codon.collision_policy"
type = "enum"
default = "warn-and-allow"
enum_values = ["first-wins", "salted-retry", "warn-and-allow"]
residency_class = "hot-reload"
scope_class = "global"
tuning_risk_class = "B"
ml_trainable = false
privacy_class = "non-sensitive"
structural_invariant = false
owning_subsystem = "M3"
owning_carrier = "hen"
authoritative_doc = "CCT-14b"

# ... (seed_composition, provisional_recompute_on_edit, governance_role_assignment,
#      candidate_codon_visible_in_orphan_review, visualisation_density_normalisation)
```

---

## 7. Audit — Hardcoded Constants Across the System

### 7.1 Structural invariants (NOT tunable — verifier rejects)

These hardcoded constants are **structural-canon** and `structural_invariant = true` if added to the schema (but better: NOT added at all — the verifier just rejects any attempt to tune them):

| Constant | Location | Warrant |
|---|---|---|
| `EPOGDOON_NUM = 9`, `EPOGDOON_DEN = 8` | [`kernel.rs:14-15`](../../../../../Body/S/S0/portal-core/src/kernel.rs) | DR-M2-1 (9:8 epogdoon = 9 non-Earth planets : 8 chakras) |
| `RESONANCE_DIM = 72` | [`kernel.rs:16`](../../../../../Body/S/S0/portal-core/src/kernel.rs) | DR-MP-2 (72-fold harmonic field IS Parashakti's operational atom) |
| `TRITONE_SQUARES = 3` | [`kernel.rs:17`](../../../../../Body/S/S0/portal-core/src/kernel.rs) | DR-MP-2 (tritone-symmetric sub-head architecture) |
| `FULL_CYCLE_DEG = 360`, `DEGREE_PER_TICK = 30`, `DOUBLE_COVER_STEPS = 12` | [`hopf.rs:1-5`](../../../../../Body/S/S0/portal-core/src/hopf.rs) | M1 Paramaśiva canonical (12-step spanda × 30° = 360°) |
| `QL_POSITIONS = 6` | [`hopf.rs:4`](../../../../../Body/S/S0/portal-core/src/hopf.rs) | Quaternal Logic structural |
| Planet enum SUN=0..PLUTO=9 | [`oracle_lut.rs:4-13`](../../../../../Body/S/S0/portal-core/src/oracle_lut.rs) | Canonical mod-10 per MEMORY canon |
| `WALK_TYPE_COUNT = 9` | [`types.rs:124`](../../../../../Body/S/S0/portal-core/src/types.rs) | Cosmic Clock 9-walks structural (Spec 11) |
| `MAQAM_COUNT = 72`, `QUARTER_TONES_PER_OCTAVE = 24` | [`music_tech.rs:25,31`](../../../../../Body/S/S0/portal-core/src/music_tech.rs) | M2 maqam axis-six structural |
| `M3_TAROT_CODON_MAP[4][16]` | epi-lib `m3.h` | DR-M3-1 (canonical Thoth/Golden-Dawn assignment) |
| `M3_PAIR_MATRIX[16]` | [`oracle_lut.rs:71`](../../../../../Body/S/S0/portal-core/src/oracle_lut.rs) | M3 rotational-value sums; structural |
| `M2_PLANET_LUT[10]` | epi-lib `m2.h` | DR-M2-1 canonical |
| `CHAKRA_BODY_ZONES[8]` | `medicine.rs` | parashakti-deep dataset; canonical |
| `QUATERNION_AXIS_ORDER = [w=Earth, x=Fire, y=Water, z=Air]` | personal_identity.rs | DR-M4-2 clause 2 canonical |
| `VIRTUE_LUT[9]` | `m0.c` | DR-MP-1 Parameśvara virtues canonical |
| `RING_QUATERNION_LUT[12]` | m1 | M1 canonical |

These ~15 constants are the **structural backbone**. The verifier's `tune_structural_invariant_compliance` constraint (registered at Track 06.7) rejects any tuning proposal targeting them.

### 7.2 Existing tunable surfaces (extend, don't fork)

| Surface | Location | Migration target |
|---|---|---|
| `[nara.weights]` | [`weights.rs`](../../../../../Body/S/S0/epi-cli/src/nara/weights.rs) | Migrate to schema-driven loader at Track 06.12 (manual TOML parse → typed registry); keep TOML section name `[nara.weights]` for backward compat |
| `[aletheia.drift_detection]` + `[aletheia.elo]` | M'-ML-SKILL-SURFACE-SPEC §5 (no-hardcoding lock) | Add to schema as Class C knobs; loader unification at Track 06.12 |
| `[slot.*]` (model-slot config) | M'-MODEL-SLOT-SPEC §5 | Already TOML-resident; add schema declarations at Track 06.7; verifier integration already exists |
| `KAIROS_ENABLED` flag | env var | Promote to `kairos.enabled: bool` schema-resident knob at Track 06.7 |
| `~/.epi-logos/navigation-config.yaml` | epi-app | Out of scope for this surface (UI navigation, not system tunable) — leave as-is |

### 7.3 Tunability candidates (currently hardcoded; move to surface)

A sample of knobs that should be moved out of source code into the schema:

| Currently hardcoded | Proposed knob | Track |
|---|---|---|
| `timeout: 30_000` (many spawnSync calls in ta-onta extensions) | `cross.spawn_timeout_ms: u32` (default 30000) | 06.11 |
| `default: 60` (Pleroma active_minutes) | `pleroma.session_active_window_minutes: u32` | 06.11 |
| `default: 100` (Pleroma limits) | `pleroma.search_result_limit_default: u32` | 06.11 |
| Khora session-ID hash composition | `khora.session_id.hash_composition: ["timestamp", "user_utterance_hash", "kairos"]` | 06.11 (follow-up; user prompt named this as candidate) |
| Mercurius kairos pulse cadence (event-driven; no rate-modulation) | `mercurius.kairos_pulse.rate_modulation: enum` | 06.11 |
| Sophia review trigger strictness ("complete enough" session) | `sophia.review_trigger.completeness_threshold: f32` | 06.11 (Class A; needs careful definition of "complete enough") |
| Aletheia crystallisation pass thresholds (hardcoded somewhere in Aletheia modules) | `aletheia.crystallisation.<threshold>: f32` | 06.11 (find and surface) |
| `DECAN_HERBS[36]` (single-tradition Western herbal) | `m4.medicine.herbal_tradition: enum ["western", "ayurvedic", "tcm"]` | 06.11 follow-up — user prompt named this as candidate; structural data lives in DECAN_HERBS LUT but alternate-tradition LUTs would need landing first |
| `M2_ELEMENT_CHAKRA[5]` / `M2_SIGN_ELEMENT[12]` (single Tantric tradition) | `m2.element_chakra.tradition: enum ["tantric", "western-alchemy", "bon"]` | 06.11 follow-up — same caveat |

**Items confirmed NOT tunable** (structural per the user prompt's audit candidates):

- `M3_TAROT_CODON_MAP[4][16]` — DR-M3-1 locks this as canonical Thoth/Golden-Dawn (user prompt confirmed; my audit confirms)
- `M3_PAIR_MATRIX` rotational-value sums — structural per oracle_lut.rs; alternate-interpretation modes might land as a Class A *interpretation-mode* knob (user prompt suggested), but the underlying LUT stays structural
- `M2_PLANET_LUT[10]` — canonical (DR-M2-1)
- `CHAKRA_BODY_ZONES[8]` — parashakti-deep dataset canonical
- `QUATERNION_AXIS_ORDER` — DR-M4-2 clause 2 canonical
- Mixolydian mode (Anima at tonic) — per DR-VAK-3 the modal rotation IS tunable per diatonic-degree spec (already exposed correctly; not a hardcoding issue)

---

## 8. Tranche Proposals — Track 06 sub-tranches

Six tranches under Track 06 (M5 reconciliation) land the surface itself. Each `code-pending-closure` unless otherwise noted; sequencing is parallelizable except where noted.

### 06.7 — Tunability schema crate + validator (foundation)

*(code-pending-closure; depends on DR-TUNE-1/2/3/4 validation; CRITICAL PATH for all consumer tranches)*

Lands `epi-tunable-schema` Rust crate at `Body/S/S0/portal-core/src/tunable.rs` + schema files at `Body/S/S0/portal-core/tunable-schema/*.tunable.toml`. Defines `Tunable`, `TunableRegistry`, `ResidencyClass`, `ScopeClass`, `TuningRiskClass`, `PrivacyClass` types. Implements load + merge + validate pipeline (TOML schema files + `~/.epi-logos/config.toml` user overrides + per-PASU/per-session scope resolution). Registers Anuttara verifier constraint `tune_structural_invariant_compliance` at `Body/S/S0/epi-lib/src/m0.c` virtue table. Migrates existing `[nara.weights]`, `[aletheia.drift_detection]`, `[aletheia.elo]`, `[slot.*]` to schema-driven loaders (keeps TOML section names for backward compat).

Tunability surface: none (this tranche IS the substrate).

Verification: `cargo test -p epi-tunable-schema schema_loads_all_subsystems`; `cargo test -p epi-tunable-schema validation_rejects_invalid_overrides`; `cargo test -p epi-tunable-schema per_pasu_scope_resolution`; `cargo test -p epi-tunable-schema verifier_rejects_structural_invariant_tune_attempt`; `cargo test -p epi-cli nara_weights_backward_compat` (existing TOML files still load); `cargo test -p epi-cli aletheia_drift_detection_no_hardcoding_lock_preserved`.

### 06.8 — Tuning UI extension (M5-3' surface)

*(spec-ahead-integration; depends on 06.7; named-owner = M5-3' shell + OmniPanel)*

Authors a new Theia extension at `Body/M/epi-theia/extensions/tuning-surface/` consuming `epi-tunable-schema` over gateway RPC. Adds a 10th OmniPanel tab labeled "Tuning". Tab layout per §4.1 (left tree by `owning_subsystem`, right detail pane, audit-trail viewer, per-tier filter chips, lock-knob action). Adds gateway methods `s5'.tune.{registry.list, registry.get, registry.set, audit.read, lock.toggle, propose}` at `Body/S/S3/gateway-contract/src/lib.rs`. No-modal invariant honored (Tuning tab is landing surface, not popup).

Tunability surface: none (this tranche IS the UI).

Verification: `test -d Body/M/epi-theia/extensions/tuning-surface`; `grep -n "s5'.tune" Body/S/S3/gateway-contract/src/lib.rs` returns ≥6 method registrations; contract test: load schema, edit a knob, verify TOML write through gateway; per-PASU scope test: switching active PASU resolves to that PASU's overrides; lock-knob test: locked knob refuses Tier 2/3 proposals.

### 06.9 — Self-awareness review wiring (M5-4' Tier 2 lifecycle)

*(code-pending-closure; depends on 06.7, 06.8; routes Tier 2 lifecycle through canonical 4'-5'-0' triplet)*

Extends [`capacity_workflows.rs`](../../../../../Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs) `CapacityId` with `TuningReview` variant. Adds `AnamnesisProposer` module at `Body/S/S5/epii-autoresearch-core/src/anamnesis_proposer.rs` — reads accumulated runtime evidence (sessions, mahamaya_transcription chains, Mythos archetype-reading provenance, Sophia review outcomes, Hen birth-codon clustering) and generates tuning-adjustment proposals. Implements Class A → human-gated, Class B → triplet-consensus auto-with-rollback, Class C → no-triplet-Aletheia-pattern routing. Registers gateway methods `s5'.tune.proposals.{list, resolve}`. Anti-runaway-tuning guards: per-knob adjustment frequency ceiling, per-window absolute adjustment ceiling, provenance audit-trail enforcement.

Tunability surface (meta-knobs — themselves Class A):
- `tune.anamnesis.proposing_evidence_window_sessions: u32` (default 30) — how many recent sessions the proposer considers
- `tune.anamnesis.per_knob_frequency_ceiling: { count: u32, window_days: u32 }` (default `{ count: 3, window_days: 14 }`)
- `tune.anamnesis.per_window_absolute_ceiling: { class_b_changes_per_24h: u32 }` (default `{ class_b_changes_per_24h: 1 }`)
- `tune.anamnesis.triplet_unanimity_required_for_auto_apply: bool` (default true)

Verification: `cargo test -p epii-autoresearch-core anamnesis_proposer_class_a_routes_to_human_review`; `cargo test -p epii-autoresearch-core class_b_proposal_unanimous_triplet_auto_applies`; `cargo test -p epii-autoresearch-core frequency_ceiling_throttles_proposals`; `cargo test -p epii-autoresearch-core class_c_skips_triplet`; integration test: simulate 10 sessions with cosmic-weather-weight evidence, verify AnamnesisProposer emits a Class A proposal that lands in Tuning Review with full triplet verdict.

### 06.10 — ML-training tuning hook (M5-4' Tier 3 lifecycle)

*(spec-ahead-integration; depends on 06.7, 06.9, Track 12.24 for the underlying drift-detection skill)*

Extends `aletheia-drift-detection` skill (lands at Track 12.24) with a `compose_tuning_proposal()` entry point parallel to the existing `compose_retrain_task()`. The hook routes Tier 3 proposals through Tier 2's pipeline (same gate, same audit, same review). Adds `dispatch_purpose: "tuning-calibration"` annotation. Verifies privacy-class compliance via the existing `slot_privacy_boundary_compliance` constraint (per M'-MODEL-SLOT-SPEC §6) extended to reject tuning-calibration dispatches that would cross the PASU local-only boundary.

Tunability surface: none new (Tier 3 inherits Tier 2's meta-knobs from 06.9).

Verification: `cargo test -p aletheia-drift-detection compose_tuning_proposal_routes_to_tier_2`; `cargo test -p aletheia-drift-detection ml_trainable_knob_proposal_carries_training_evidence`; `cargo test -p aletheia-drift-detection privacy_class_local_only_blocks_cross_pasu_dispatch`; integration test: simulate Mythos cosmic-weather-weights drift detection, verify Aletheia generates a tuning-calibration proposal that lands in Tuning Review with ML-training-evidence provenance.

### 06.11 — Audit loop for hardcoded-relation detection

*(spec-ahead-integration; depends on 06.7; named-owner = M5-2' Backend Studio)*

Implements a lint at `Body/S/S0/epi-lib/src/m0.c` (Anuttara R-virtue domain — constraint discovery per M'-ML-SKILL-SURFACE-SPEC §1 M0 method) that scans source files for hardcoded-shaped patterns (numeric literals in `const`/`default` positions, magic numbers in business logic, hardcoded timeouts) and emits a candidate-tunable-knob report. The report is reviewed manually; confirmed candidates are added to the schema via 06.7's authoring workflow. The report distinguishes **structural-invariant candidates** (the verifier's `tune_structural_invariant_compliance` adds them as locked entries) from **genuinely-tunable candidates** (added as Class A unless author specifies otherwise).

Tunability surface: none (this tranche surfaces *candidates for* the surface).

Verification: `cargo test -p epi-lib m0_anuttara_hardcoded_relation_audit_emits_candidates`; the audit report at `Body/S/S0/epi-lib/tunable-audit-report.md` is generated; manual review pass migrates ~10-30 confirmed candidates from §7.3 into the schema across the cycle.

### 06.12 — Migration of existing config surfaces

*(code-pending-closure; depends on 06.7; consolidates existing scattered config)*

Migrates the three existing TOML-resident config sections (`[nara.weights]`, `[aletheia.drift_detection]` + `[aletheia.elo]`, `[slot.*]`) to schema-driven loaders. The migration preserves backward compatibility (existing `~/.epi-logos/config.toml` files load unchanged) and adds typed metadata declarations. Promotes the `KAIROS_ENABLED` env-var flag to `kairos.enabled` schema-resident knob. Documents the migration path for future surfaces (e.g., navigation-config.yaml is intentionally out of scope; future YAML→TOML consolidation is a follow-up).

Tunability surface: none (this tranche IS the migration).

Verification: existing tests for `[nara.weights]` and `[aletheia.drift_detection]` and `[slot.*]` continue to pass against the new loader; `KAIROS_ENABLED=false` env-var test now also tests `kairos.enabled = false` TOML setting; no source-code reference to `~/.epi-logos/config.toml` bypasses the schema crate.

---

## 9. Decision-Register Row Proposals

Four PROPOSED DR rows to land in Tranche 06.5 (M5 decision-register entries). All awaiting user final-validation; gating Track 38 tranche execution.

### 9.1 DR-TUNE-1 — Foundational-and-Manipulable Principle

**Status:** PROPOSED  ·  **Source:** Track 38 §0
**Subject:** The foundational-and-manipulable principle ratified as cycle-3 standing invariant. Every "tunable" thing in the system lives behind a stable, observable, manipulable surface, never hardcoded in module sources. The surface serves developer-tuning, system-self-awareness, and ML-training in that priority order. Structural invariants (per §7.1) are exempt — they are NOT tunable, NOT in the schema, and the verifier rejects any attempt to tune them.

**Recommended resolution:** RATIFY. The principle is already operative — Tranches 5.26, 5.27, CCT-14b each declare tunability surfaces and reference "the forthcoming M5-2'–M5-4' tunability brainstorm" (this document). DR-TUNE-1 formalises the principle as a cycle-3 standing invariant.

**Action:** Add this DR row to Tranche 06.5; mark cycle-3 standing invariant; cross-link to DR-MP-1/2/3/4, DR-ML-1, DR-MODEL-1.

**Verification:** `grep -rn "tunability surface\|foundational-and-manipulable" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/` returns ≥4 hits across patches and overview.

**Depends:** Track 38 (this document) ratified; Tranches 06.7-06.12.

### 9.2 DR-TUNE-2 — M5-2'/M5-3'/M5-4' Cross-Coordinate Residency

**Status:** PROPOSED  ·  **Source:** Track 38 §1
**Subject:** The tunability surface's three tiers cut across the three M5 sub-coordinates rather than mapping 1:1. M5-2' Backend Studio is schema + write-substrate authority. M5-3' IDE Shell is Tuning UI authority. M5-4' OmniPanel/Pi-runtime is runtime lifecycle authority (Tier 2 self-awareness review lane + Tier 3 ML-trained dispatch). Each coord is authority for its register (construction / engagement / unity); tiers cut across.

**Recommended resolution:** RATIFY per M5-ARCHITECTURE §1 canonical sub-coordinate roles. Forcing all three tiers onto one coordinate would violate the M5 sub-coordinate semantics.

**Action:** Add this DR row to Tranche 06.5; reference from M5'-SPEC §M5-2'/M5-3'/M5-4' descriptions; reference from M5-ARCHITECTURE §1.

**Verification:** `grep -n "tunability\|tune" Body/M/epi-theia/extensions/tuning-surface/` is reached (06.8 lands at M5-3'); `grep -n "epi-tunable-schema\|TunableRegistry" Body/S/S0/portal-core/` is reached (06.7 lands at M5-2'); `grep -n "TuningReview" Body/S/S5/epii-autoresearch-core/src/` is reached (06.9 lands at M5-4').

**Depends:** Tranches 06.7, 06.8, 06.9.

### 9.3 DR-TUNE-3 — Tuning Risk-Class Taxonomy (A / B / C)

**Status:** PROPOSED  ·  **Source:** Track 38 §2.2
**Subject:** Tuning proposals are classed at the schema level: Class A (default; structural-adjacent, ML-trainable, voice-template, privacy-touching, user-visible) requires user validation through `enforceReviewDisposition`; Class B (cosmetic) auto-applies after unanimous 4'-5'-0' constitutional triplet consensus with audit-trail and rollback; Class C (purely internal) auto-applies per the existing Aletheia drift-detection pattern (M'-ML-SKILL-SURFACE-SPEC §5, no-hardcoding lock) and does NOT invoke the constitutional triplet. Default tuning_risk_class is A — knob authors opt down to B or C explicitly with cited justification.

**Recommended resolution:** RATIFY. The Class A default mirrors the canonical `enforceReviewDisposition` invariant. The Class B path uses the existing constitutional triplet apparatus (no new gate). The Class C path is the existing Aletheia pattern (no new mechanism). The taxonomy unifies what is currently three implicit conventions into one explicit metadata field.

**Action:** Add this DR row to Tranche 06.5; encode the three classes as enum variants in `epi-tunable-schema`'s `TuningRiskClass`; document the class chooser-guide in the schema authoring README at `Body/S/S0/portal-core/tunable-schema/README.md`.

**Verification:** `cargo test -p epii-autoresearch-core class_a_routes_to_human_review`; `cargo test -p epii-autoresearch-core class_b_auto_applies_on_unanimous_triplet`; `cargo test -p epii-autoresearch-core class_c_does_not_invoke_triplet`; the schema authoring README contains the class-chooser decision tree.

**Depends:** Tranches 06.7, 06.9.

### 9.4 DR-TUNE-4 — Privacy-Class Enforcement via Anuttara Verifier

**Status:** PROPOSED  ·  **Source:** Track 38 §2.3
**Subject:** The Anuttara verifier's `slot_privacy_boundary_compliance` constraint (per M'-MODEL-SLOT-SPEC §6) is extended to cover tuning surfaces. Tuning proposals (Tier 2 OR Tier 3) targeting knobs with `privacy_class = "local-only"` are rejected if the proposal's evidence-derivation path crosses the PASU local-only boundary (e.g., if the proposed value would only be reachable by sharing PASU-derived data across PASU instances). The constraint reuses the existing slot-rule pattern; no new constraint is invented. Tier 3 ML-training dispatches for `local-only` knobs are confined to the Nara-parser slot model dispatch (per M'-MODEL-SLOT-SPEC §2) — never escape to cloud-opt-in slots, even with consent.

**Recommended resolution:** RATIFY. Extension to existing constraint; no new privacy mechanism introduced. PASU local-only is structural per DR-M4-3 protected-handle invariant.

**Action:** Add this DR row to Tranche 06.5; extend the `slot_privacy_boundary_compliance` Cypher query in [`m0.c`](../../../../../Body/S/S0/epi-lib/src/m0.c) (verifier constraint registry) to additionally match `Dispatch.tuning_target_knob_privacy_class` field.

**Verification:** `cargo test -p epi-lib m0_verifier_blocks_cross_pasu_tuning_on_local_only_knob`; `cargo test -p aletheia-drift-detection privacy_class_local_only_blocks_cross_pasu_dispatch` (already named in 06.10); contract test: attempt Tier 3 ML-training dispatch for a `local-only` knob with cloud-opt-in slot; verifier rejects with `privacy-boundary-violation` error.

**Depends:** Tranches 06.7, 06.9, 06.10.

---

## 10. Verification + Acceptance

Track 38 is acceptance-ready when:

1. DR-TUNE-1, DR-TUNE-2, DR-TUNE-3, DR-TUNE-4 all VALIDATED (Track 06.5 expansion).
2. `epi-tunable-schema` crate compiles, schema files load, validation rejects invalid overrides (06.7).
3. Existing `[nara.weights]`, `[aletheia.drift_detection]` + `[aletheia.elo]`, `[slot.*]` continue to function with backward compatibility (06.12).
4. Anuttara verifier's `tune_structural_invariant_compliance` constraint rejects tuning attempts against the ~15 structural invariants in §7.1 (06.7).
5. OmniPanel "Tuning" tab loads, surfaces all schema-declared knobs, permits Class A propose-only / Class B auto-with-rollback / Class C silent-Aletheia-pattern operations (06.8).
6. `TuningReview` capacity lane appears in OmniPanel six-capacity panes view as a 7th pane; governance_lead = Sophia; user-final-validation required for Class A (06.9).
7. AnamnesisProposer generates proposals from accumulated runtime evidence (06.9); flow test simulates 30 sessions and verifies a Class A proposal lands with full triplet verdict.
8. Aletheia drift-detection's `compose_tuning_proposal()` routes Tier 3 ML-training proposals through Tier 2's pipeline (06.10).
9. Privacy-class enforcement: Anuttara verifier blocks cross-PASU tuning-calibration dispatches for `local-only` knobs (06.10 + DR-TUNE-4).
10. Tranche 5.26's 4 knobs, 5.27's 9 knobs, CCT-14b's 7 knobs ALL declared in the schema with metadata records per §6.1/6.2/6.3 (06.7).
11. Per-knob audit trail at `~/.epi-logos/tunable-audit/<knob-key>.jsonl` accumulates entries for every change; rollback functional from UI (06.8 + 06.9).
12. Per-PASU scope isolation: `~/.epi-logos/pasu/<pasu-id>/config.toml` overrides global; PASU-A's overrides invisible to PASU-B's sessions (06.7 + 06.8).
13. Audit deliverable §7 confirms the ~15 structural invariants are unambiguously categorized; the catalogued tunability candidates §7.3 are migrated through 06.11 across the cycle.
14. No source file in `Body/S/` references `~/.epi-logos/config.toml` bypassing `epi-tunable-schema` after 06.12 (verified by grep audit).

---

## 11. Closing — Why This Surface Is What It Is

The tunability surface is **already operative in fragments** — `[nara.weights]` at S0, `[aletheia.drift_detection]` no-hardcoding lock at the autoresearch loop, `[slot.*]` at the model-slot rule, the three patches landed yesterday declaring tunability surfaces each. The fragments share a pattern but lack a unified schema, a unified UI, a unified review lifecycle. Track 38 is the unification.

The surface enables tuning; it doesn't pre-tune. Defaults stay conservative per the patches that introduced them. The user retains control via Class A gating, lock-knob action, per-knob rollback, and the explicit ~/.epi-logos/config.toml edit path. The system self-tunes only in the spaces the user has explicitly opted into (Class B for cosmetic knobs; Class C for the existing Aletheia pattern). The ML training loop tunes only what is flagged `ml_trainable = true` AND routes through the same constitutional review apparatus that already gates canon-promotion.

The structural backbone stays structural: ~15 hardcoded constants in §7.1 are NOT tunable, NOT in the schema, and the Anuttara verifier rejects any attempt to tune them. The 27/37/1/3 cardinalities, the canonical axis orders, the canonical chromosome assignments, the canonical maqam-72 / epogdoon 9:8 — all locked.

The principle restated: ontology is lived-conception is living-code; tuning surfaces are how living-code stays manipulable without becoming arbitrary. **DR-TUNE-1** ratifies this; Tranches 06.7-06.12 land the substrate, the UI, the lifecycle, the migration, the audit.

---

*Companion documents: [[M5'-SPEC]] (sixfold IDE surface roles), [[M5-ARCHITECTURE]] (M5-2'/M5-3'/M5-4' canonical sub-coordinate definitions), [[M'-ML-SKILL-SURFACE-SPEC]] (drift-detection retrain loop + no-hardcoding lock prototype), [[M'-MODEL-SLOT-SPEC]] (privacy enforcement pattern via Anuttara verifier), [[04-m3-mahamaya-reconciliation]] (Tranche 4.16/4.17 codon-language substrate), [[05-m4-nara-reconciliation]] (Tranches 5.26/5.27 first consumers), [[16-cross-cutting-closures]] (CCT-14b first consumer).*
