---
title: "Harmonic-System + Energy-Channel Reconciliation + Evolver Integration — Planning Handoff"
type: cycle-3-planning-handoff
status: ready-for-planning
created: 2026-06-08
coordinate: "M'"
sub_coordinate: "M (kernel) + M5-4' (operational capacities) + M2' (EBM) + M3' (oracle) + S1' (residency law) + S4' (VAK)"
handoff_scope: "Planning + canon-spec amendments. NOT cycle-3 execution. M-dev runs cycle-3 tranches separately, once their plan files have been updated per this handoff."
c_0_source_coordinates:
  - "M"
  - "M4'"
  - "M'-USER-CONTEXT-SKILL-SPEC"
  - "M'-AGENTIC-RUNTIME-SPEC"
  - "M'-ML-SKILL-SURFACE-SPEC"
  - "M5'"
  - "M5'/epii-operational-capacities/*"
  - "M3'"
  - "S1'"
c_0_related_coordinates:
  - "M0'"
  - "S0"
  - "S2"
  - "S4'"
  - "S5"
dev_decisions:
  - "E_4 = personal/Nara substrate (PASU + kairos + q_personal + q_identity + planet_degrees + oracle charges + Nara-LoRA-adapted user content). Final."
  - "E_5 = multi-channel harmonic substrate (lens_resonance_72 + audio_octet[8] + nodal_quartet[4] + planetary_chakral + mahamaya + codon_rotation_projection + q_cosmic) — N-channel EBM. Final."
  - "E_6 = Anuttara R-virtue verifier with refusal authority. Unchanged."
  - "M5-4' = canonical home for operational capacities, skills, capability matrix (siva-shakti register). M5-0' = library substrate (Gnostic Library)."
  - "Implementation language: Rust-native default (burn / candle). PyO3+PyTorch only as documented fallback where Rust is materially worse — file DR-EBM-IMPL at that decision point, not before."
  - "Gradient computation: Riemannian-quaternion with manifold projection. Specced inline in mental-pole-mechanics §7.5, NOT in a new spec file."
  - "All thresholds (Elo drift δ, trial-count N, time-window T, max k× retrain rate, confidence-interval penalty α) passed as real config values from ~/.epi-logos/config.toml. No hardcoded numbers."
  - "Stepping-stone archive: c_5_crystallisation_state: 'discarded-branchable' added to Hen residency law canonical state table."
  - "Gemini API key: read from user zshenv via new S0 settings infrastructure with cloud-opt-in policy enforcement per M'-MODEL-SLOT-SPEC."
  - "EBM N-channel cross-attention pattern is a degree of freedom for the system's own learning/self-experimentation. Spec the SHAPE (parallel channel encoders → cross-attention → tritone-symmetric three-sub-head → 72-vector) but do NOT pin the specific attention pattern."
  - "Existing specs are AMENDED IN PLACE. No new 'supersedes' specs. Where the older kernel-spec §3 contradicts the newer ML-Skill-Surface §7.1, the older is edited to match the newer."
  - "Evolver/DGM integration lands as typed VAK choreography after streams stabilise. Add tranche 12.25 (or next-numbered) explicitly naming this."
dev_relations:
  - { type: implements, target: "[[M-AGENTIC-RUNTIME-SPEC]]" }
  - { type: implements, target: "[[M-ML-SKILL-SURFACE-SPEC]]" }
  - { type: implements, target: "[[M-USER-CONTEXT-SKILL-SPEC]]" }
  - { type: implements, target: "[[epi-logos-kernel-spec]]" }
  - { type: depends_on, target: "[[06-m5-epii-reconciliation]]" }
  - { type: depends_on, target: "[[12-agentic-layer-s4-s5]]" }
  - { type: depends_on, target: "[[13-decision-register]]" }
  - { type: depends_on, target: "[[04-m3-mahamaya-reconciliation]]" }
dev_changed_paths: []
---

# §0 — Handoff Context

This tranche is a **planning + canon-amendment handoff**, not a cycle-3 execution handoff. Cycle-3 implementation is not started — the cycle is still being planned. This document captures the decisions made on 2026-06-08 and orchestrates two classes of work:

1. **Immediate canon-spec amendments and the Hen residency-law extension** — these update the canonical seed-specs in `Idea/Bimba/Seeds/M/` and `Idea/Bimba/Seeds/S/` and happen NOW regardless of cycle-3 timing, because they reconcile a real contradiction in canon (`epi-logos-kernel-spec.md §3` vs `M'-ML-SKILL-SURFACE-SPEC §7.1`) and because the schema-legal stepping-stone state extension is a paper change that needs to land before any tranche references it.

2. **Cycle-3 plan/tranche file updates** — these amend the cycle-3 tranche files at `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/0X..32-*.md` to capture the scope, dependencies, and decisions for streams that the m-dev process will execute later. No code is written by this handoff's downstream agents. They WRITE PLANS into existing or new tranches.

The session this came from was a clarification pass covering: (a) the full harmonic system rooted in `ql-musical-derivation-v3.md`, (b) the genuine contradiction between `epi-logos-kernel-spec.md §3` (older, Jun 7 20:19) and `M'-ML-SKILL-SURFACE-SPEC §7.1` (newer, Jun 7 21:01) on what E_4 actually carries, (c) the M5-0' vs M5-4' carrier question for operational capacities, (d) the m3_compute_charges zero-dependents oracle gap, (e) the kernel.rs plain-sum total_energy bug, (f) the missing gradient/descent step, (g) the stale `bge-small/gte-small` reference in mental-pole-mechanics §7 (already fixed in the session — see git log), and (h) the original session frame: how Sakana DGM / Imbue Darwinian Evolver patterns land against this canon.

All decisions are locked. The frontmatter `dev_decisions` block above is the canonical list — none of it is up for re-debate by downstream agents. Any decision not in that block that arises during planning must be escalated to user.

## Canonical state to know (most-recent / most-load-bearing)

- `Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md` — kernel matheme + 4:5:6 just-triad weighting + Möbius step `q_p^(n+1) = q_p^(n) − log(9/8) · ∇E_total`
- `Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md` — 72-fold resonance vector, EBM specification, per-element-tick invocation cadence (input-encoder line already updated to Gemini Embedding 2 in this session)
- `Idea/Bimba/Seeds/M/M'-USER-CONTEXT-SKILL-SPEC.md` — UserContextFrame typing, currently carries dual-injection commitment (TO BE REVISED per §1.3)
- `Idea/Bimba/Seeds/M/M'-AGENTIC-RUNTIME-SPEC.md` — MoE dispatch, Elo three-channel `(R_verifier, R_lens, R_user)`, VAK as gating grammar
- `Idea/Bimba/Seeds/M/M'-ML-SKILL-SURFACE-SPEC.md` — per-subsystem ML method binding (E_4 ← M4 Nara skills — the binding the kernel-spec §3 will be aligned to)
- `Idea/Bimba/Seeds/M/M5'/ql-musical-derivation-v3.md` — full harmonic-system derivation, 8 foundational ratios, DR-VAK-3
- `Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md` — M5-4' = siva-shakti register, capability-matrix authority
- `Body/S/S0/portal-core/src/kernel.rs:346-388` — MathemeHarmonicProfile struct (the N-channel substrate already in code)
- `Body/S/S2/graph-services/src/pointers.rs:21-131` — HarmonicPointerAnchor + family (the "core pointer webs")
- `Body/S/S5/epii-autoresearch-core/src/capacity_workflows.rs` — six-capacity registry

---

# §1 — IMMEDIATE: canon-spec amendments + Hen residency-law extension

These edits happen NOW, independent of cycle-3 timing. They reconcile real contradictions in canon and make schema-legal additions that downstream cycle-3 planning will reference. They are paper edits — no implementation code is written. Dispatch §3 Thread A.

## §1.1 — `epi-logos-kernel-spec.md` §3 lines 148-152

**Current text (line 148):**
> `E_4` (Nara-traversal energy, weight **4**) is the energy of the proposed traversal-direction against the QL positions *as refracted through the 12 MEF lenses into meaningfulness*. The lenses are how the underlying P/P' positions surface as readable content; E_4 measures whether the LLM's traversal-gradient coheres with that refraction-structure at the engaged coordinate.

**Replace with:**
> `E_4` (Nara personal-resonance energy, weight **4**) is the energy of the proposed pratibimba against the user's personal-substrate at the engaged coordinate. Nara IS the M4 personal/identity/kairos subsystem; E_4 reads against `PASU` (`q_identity[4]`, `q_personal[4]`, birth-anchored quaternion fields), live `planet_degrees[10]`, oracle charges (`pp/mm/mp/pn`), and Nara-LoRA-adapted content (journal / dream / phone-writings corpus). The energy measures whether the proposed configuration coheres with WHO this person is at THIS kairotic moment. Per [[M'-ML-SKILL-SURFACE-SPEC]] §7.1, E_4 is served by the M4 Nara skill family (`nara-voice-training`, `nara-journal-parser`, `mlx-lora`).

**Current text (line 150):**
> `E_5` (Epii lens-weighted energy with user-temporal modulation, weight **5**) is the joint computation over `(lens_resonance_72, user_temporal_N)` — the 72-dim lens-resonance vector AND the user-context channel as parallel inputs. The EBM at position 5' is a small fusion network learning this joint distribution. User-context entering as second channel makes the energy genuinely personalised: a configuration can be lens-coherent yet user-temporally incoherent, and E_5 holds both readings.

**Replace with:**
> `E_5` (Epii harmonic-substrate energy, weight **5**) is the multi-channel computation over the full harmonic substrate carried by `MathemeHarmonicProfile` — `lens_resonance_72` + `audio_octet[8]` + `nodal_quartet[4]` + `planetary_chakral` + `mahamaya` + `codon_rotation_projection` + `q_cosmic`, each as a parallel channel into the N-channel EBM at position 5'. The 72-fold IS the operational atom of the harmonic substrate; the 12 MEF lenses are one decomposition. E_5 measures whether the proposed configuration coheres with the harmonic-mathematical structure of reality. User-personal data does NOT enter E_5 (it enters E_4); the separation is structural — personal coherence vs harmonic coherence are different questions. Per [[M'-ML-SKILL-SURFACE-SPEC]] §7.1, E_5 is served by the M2 Parashakti skill family (`parashakti-ebm-head`, `parashakti-corpus-curation`) and M5 Epii (`epii-distillation`, `epii-preference-learning`).

**Current text (line 162):**
> The future M5-1 philosophical-canon check (Epii at sub-position #1, planned for a later development cycle) sits as a soft sub-term *inside* E_5 rather than as a new top-level position, because canon is interpretable (Epii-domain) rather than formal (Anuttara-domain). The 4:5:6 architecture stays canonical.

**Refine to:**
> The future M5-1 philosophical-canon check (Epii at sub-position #1, planned for a later development cycle) sits as one of the multi-channel inputs to E_5 alongside the harmonic substrate channels, because canon is interpretable (Epii-domain) rather than formal (Anuttara-domain). The 4:5:6 architecture stays canonical; channel-set within E_5 is the system's learning/experimentation degree of freedom.

## §1.2 — `M4'/mental-pole-mechanics.md` §5 + §7 + new §7.5

**§5 (energy formula description):**
- Sync E_4 and E_5 textual descriptions to match §1.1 amendments above. Find any prose that says "lens-coherent yet user-temporally incoherent" or describes user-data as feeding E_5; rewrite per §1.1.
- The line-18 refinement note ("The EBM at position 5' takes two input channels — the 72-dim lens-resonance vector AND the UserContextFrame projection") must be REPLACED with: "The EBM at position 5' takes N parallel channels from MathemeHarmonicProfile — lens_resonance_72, audio_octet[8], nodal_quartet[4], planetary_chakral, mahamaya, codon_rotation_projection, q_cosmic. User-context does NOT feed E_5 (it feeds E_4 personal-energy)."

**§7 EBM Specification:**
- Architecture section: replace dual-channel `(lens_resonance_72, user_temporal_N)` framing with N parallel channels from MathemeHarmonicProfile. State that specific cross-channel-attention pattern is the system's self-experimentation degree of freedom — spec the shape (parallel channel encoders → cross-channel attention → tritone-symmetric three-sub-head → sigmoid-normalised 72-output) but not the specific attention pattern.
- Implementation language: change PyTorch / pytorch-lightning references to Rust-native (`burn` or `candle`). Add a paragraph: "Rust-native is the canonical implementation language for the EBM head. PyO3+PyTorch is permitted as documented fallback if a specific architecture component is materially worse in Rust at the time of build — record the decision as DR-EBM-IMPL when that fallback is invoked, not preemptively."
- Training-data shape change: per-document input is now an N-channel tuple, not a single embedding.
- §7 line 432 `pi train-ebm` and §7 line 453 `pi export-ebm-state` — naming stays; implementation moves Rust-native.
- The input-encoder line (Gemini Embedding 2 substrate) — already fixed in this session (see git log); preserve.

**ADD new subsection §7.5 — Riemannian-quaternion gradient pipeline:**

Insert between current §7 and §8. Content:

> ### §7.5 — Möbius descent step: Riemannian-quaternion gradient pipeline
>
> The kernel's descent equation `q_p^(n+1) = q_p^(n) − log(9/8) · ∇_{q_p} E_total` requires gradient through three energy terms back to `q_p`. The unit-quaternion constraint `|q_p| = 1` means standard Euclidean backprop violates the manifold; the spec is Riemannian-quaternion descent with explicit manifold projection.
>
> **Per-channel gradient sources:**
> - `∇E_4`: autograd through the Rust-native Nara-LoRA forward pass. E_4 is a scalar function of LoRA-adapted output evaluated against PASU substrate; the forward pass is differentiable end-to-end.
> - `∇E_5`: autograd through the Rust-native N-channel EBM head + the learned bioquaternion→embedding projection layer. Both are differentiable by construction.
> - `∇E_6`: discrete (Cypher invariant pass/fail) — NOT naturally differentiable. Use a soft surrogate: scalar count of violated invariants weighted by severity (severity weights from config, no hardcoded numbers) divided by total invariants checked. For high-noise regimes, a REINFORCE-style estimator may be substituted; surrogate choice is recorded in the kernel's per-tick provenance.
>
> **Weighted combination (canonical 4:5:6):**
> ```
> ∇E_total = (4·∇E_4 + 5·∇E_5 + 6·∇E_6) / 15
> ```
>
> **Manifold projection (tangent-space at q_p):**
> ```
> ∇_M E_total = ∇E_total − ⟨∇E_total, q_p⟩ · q_p
> ```
> Subtract the radial component (projection onto q_p) to land in the tangent space of S^3 at q_p.
>
> **Update + renormalize:**
> ```
> q_p_raw = q_p − log(9/8) · ∇_M E_total
> q_p^(n+1) = q_p_raw / |q_p_raw|
> ```
> Renormalization enforces `|q_p^(n+1)| = 1`. Step-size `log(9/8)` is the epogdoon — non-tunable, structurally inherited.
>
> **Invocation cadence:** per element-tick (8x per cycle), per §7 line 436. The inter-element transitions interpolate energy-gradients between EBM calls.
>
> **Test contract:**
> - Synthetic q_b/q_p pairs with known optimum: descent must reach within tolerance ε after K steps for documented (ε, K).
> - Manifold preservation: |q_p^(n)| must equal 1 ± numerical-precision-floor at every step.
> - Weight invariance: the 4:5:6 sum must match `(4·E_4 + 5·E_5 + 6·E_6) / 15` recomputed independently.
> - Gradient sanity: for E_total = const, `∇E_total = 0` and update is identity.
> - Discrete-surrogate behaviour: zero invariants violated → ∇E_6 = 0; monotone increase in violations → monotone increase in ‖∇E_6‖.

## §1.3 — `M'-USER-CONTEXT-SKILL-SPEC.md` §3

The dual-injection claim (UserContextFrame feeds both LLM articulation context AND EBM second channel) is superseded by the E_4/E_5 separation.

**§3.2 "Consumer 2: EBM second-channel input" — rename and rewrite:**

New title: **§3.2 — Consumer 2: E_4 personal-resonance substrate**

New content:
> The UserContextFrame is consumed by the E_4 personal-resonance computation at the kernel mental-pole. The frame's typed fields (`planet_degrees[10]`, `q_identity[4]`, `q_personal[4]`, `tick12`, `exact_degree_720`, `tarot_psyche_anchor_signature`, `session_locus_stamp`, oracle charges) feed the Nara skill family (`nara-voice-training`, `nara-journal-parser`, `mlx-lora`) which produces the E_4 scalar against the proposed configuration. E_4 measures personal coherence — does this configuration cohere with WHO this person is at THIS kairotic moment.

**§3 introduction — remove the "dual injection" framing entirely.** Replace with: "User-personal data is structurally a single-consumer thing at the energy layer: it feeds E_4 (the personal-energy term). User-articulation may also flow into LLM context (Consumer 1) for surface-level voice modulation, but that is articulation-time only, not energy-computation."

**The `recognized: bool` flag at §72-74 STAYS.** Annotation comment kept as `// Recognition closure flag (M0-5)`. The flag is not part of the dual-injection debate.

## §1.4 — Operational-capacity carrier (M5-4' canonical, M5-0' substrate)

**Six files under `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/*.md`:**
- `m5-prime-epii-on-anuttara-language-development.md`
- `m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`
- `m5-prime-epii-on-parashakti-graph-relational-ml.md`
- `m5-prime-epii-on-mahamaya-process-reward-rl.md`
- `m5-prime-epii-on-nara-qlora-dialogic-voice.md`
- `m5-prime-epii-on-epii-self-referential-capacity.md`

**Frontmatter change** on each:
- Current: `sub_coordinate: "M5-1 + M5-2 + M5-3 + M5-4 + M5-5 cross-cutting"` (or Nara variant)
- New: `sub_coordinate: "M5-4' primary (siva-shakti operational register); library substrate at M5-0'; cross-cuts M5-1/2/3/5"`

**`M5-ARCHITECTURE.md` updates:**
- Confirm M5-4' row labels: capability-matrix authority, six-capacity workflow registry (`capacity_workflows.rs`), siva-shakti register
- Confirm M5-0' row labels: Gnostic Library substrate, RAG context grounding, documentary content the capacities reason over
- Any prose that suggests capacities live primarily at M5-0' or cross-cutting without primary location: rewrite to M5-4' primary

## §1.5 — Hen residency-law extension for stepping-stone archive

**`Idea/Bimba/Seeds/S/S1/S1'/S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL.md`** — extend the crystallisation states table at lines 109-115.

Add row:

| State | Location | Meaning |
|---|---|---|
| `discarded_branchable` | `Idea/Empty/Discarded/{round-key}/{slug}.md` | Candidate evaluated and not promoted in its originating round, retained as branchable parent for future autoresearch / evolver rounds. Carries `c_5_crystallisation_state: "discarded-branchable"` + evaluation rationale in body + provenance to the round-key that discarded it. |

**Promotion-direction update:** add a new arrow to the existing Empty → Seeds → World/Types → flat World flow:
> Empty/Discarded/{round-key} → sample-back-as-parent → new challenger lineage in subsequent autoresearch round

**Why this lands as immediate-paper-only (not cycle-3 code):** schema-legal today (`c_5_*` keys already accepted at `hen-compiler-core/src/lib.rs:697-700`), low risk, enables Sakana-DGM stepping-stone insight without architectural disruption. Code-side `s1'.archive.*` gateway methods are NOT in scope for this handoff — they'd be a future cycle-3 sub-tranche. The spec extension is what's needed for evolver-stream tranches to reference.

---

# §2 — CYCLE-3 PLAN UPDATES (tranche file amendments)

Eight planning streams. Each stream's downstream agent amends one or more existing cycle-3 tranche files (or creates a new tranche file in the same plan folder) to capture scope, decisions, dependencies. **No implementation code is written by these agents. They write plans.** The m-dev process executes the resulting tranches later.

Some tranches already exist and reference these streams in stub form — the agent reads the existing tranche content and amends it to capture the locked decisions and scope detail per this handoff. Some tranches don't exist yet — the agent creates them as new tranche files in the same plan folder using next-available numbering.

## §2.1 — STREAM A: `m3_compute_charges` → oracle Rust wiring

**Target tranche file:** `04-m3-mahamaya-reconciliation.md` — amend to add a sub-tranche capturing this scope (next sub-tranche number in that file's sequence). If the file already has a placeholder tranche for oracle wiring, fold this scope into it.

**Scope to capture in the tranche:**
- C function `m3_compute_charges(codon6bit, pp, mm, mp, pn)` at `Body/S/S0/epi-lib/include/m3.h:755-767` exists and is tested in C, zero Rust callers (per `.depwire/DEAD_CODE.md:92`).
- Oracle Rust path at `Body/S/S0/epi-cli/src/nara/oracle.rs:1236-1665` currently reimplements charge logic in Rust. The cycle-3 tranche will replace with FFI binding to the C function.
- Payload typing alignment across consumers: Aletheia extension `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts:634-642`, parashakti-corpus-curation, oracle resonance scoring, quintessence_hash XOR pipeline at `m4.h:683-694`.
- Startup assertion `sum(pp for codon in 0..64) == 360` (per `m3-mahamaya-reference.md:700`).
- Cross-check test: all 64 codons must match Rust-reimplemented baseline within zero tolerance.
- `.depwire/DEAD_CODE.md:92` update on completion.

**Canon-spec amendments needed alongside this tranche:** none — the spec already supports this; only the m-dev tranche needs to capture it.

**Tranche dependencies:** none blocking. Independent of other streams.

## §2.2 — STREAM B: kernel.rs total_energy formula + E_4 parameter restructure

**Target tranche file:** `06-m5-epii-reconciliation.md` — amend Tranche 6.10 (existing, named for Möbius descent step) OR add Tranche 6.11 if 6.10 is already full. Read the file first to decide.

**Scope to capture in the tranche:**
- `kernel_energy_evaluate` at `Body/S/S0/portal-core/src/kernel.rs:1209-1237` currently uses plain sum and is missing E_4 entirely.
- Per §1 canon amendments, E_4 = personal/Nara energy, E_5 = multi-channel harmonic, E_6 = R-virtue (unchanged).
- Restructure:
  - `EnergyDecomposition` struct extended with `e_4_personal_energy`, `e_5_harmonic_energy`, `e_6_verifier_energy` fields (preserve `bimba_pratibimba_energy` as diagnostic)
  - New input structs: `E4PersonalInputs`, `E5HarmonicInputs`, `E6VerifierInputs`
  - `kernel_energy_evaluate` signature change to take these inputs
  - Per-channel scalar computation, with stub-zero behaviour until Streams C/D/F land
  - `total_energy: (4.0 * e_4 + 5.0 * e_5 + 6.0 * e_6) / 15.0`
  - `bimba_pratibimba_energy = quat_distance_sq(state.q_b, state.q_p)` retained as diagnostic, NOT summed into total
- Update direct caller `KernelProjection::from_clock_state` at `kernel.rs:161-184`.
- Update `KernelTemporalEnergy::from_energy` at `kernel.rs:1088-1094` to serialize all four energy fields.
- gitnexus impact: 30 transitive upstream callers, only 1 direct (same-file `from_clock_state`). All transitive go through `KernelTemporalProjection::from_kernel_projection` without re-passing the changed args. Risk acceptable.

**Canon-spec amendments needed alongside this tranche:** §1.1 (kernel-spec §3) and §1.2 (mental-pole-mechanics §5/§7/§7.5) must be landed before this tranche executes. Thread A handles those.

**Tranche dependencies:** Stream C (EBM forward pass), Stream F (Nara forward pass) for non-stub channel content. Acceptable to land in stub-zero mode first.

## §2.3 — STREAM C: N-channel EBM head (Rust-native)

**Target tranche files:**
- `12-agentic-layer-s4-s5.md` Tranche 12.24 Phase 2 (parashakti-ebm-head skill — already planned)
- `06-m5-epii-reconciliation.md` Tranche 6.8 (resonance-vector predictor module — already planned)

Amend both. Coordinate scope between the two so they don't duplicate.

**Scope to capture in the tranches:**
- Build at `Body/S/S5/epii-autoresearch-core/skills/parashakti/ebm-head/` per `M'-ML-SKILL-SURFACE-SPEC §3.3`.
- Architecture: N parallel channel encoders → cross-channel attention → tritone-symmetric three-sub-head → sigmoid-normalised 72-vector output.
- Channels from MathemeHarmonicProfile: `lens_resonance_72`, `audio_octet[8]`, `nodal_quartet[4]`, `planetary_chakral`, `mahamaya`, `codon_rotation_projection`, `q_cosmic`.
- Implementation language: Rust-native via `burn` or `candle`. PyO3+PyTorch fallback only if a specific architecture component is materially worse in Rust at build time (file DR-EBM-IMPL at that decision point).
- Per-channel encoder modules (small linear or 1-layer transformer per channel into shared latent dim D=256 or 512).
- Cross-channel attention layer — multi-head attention over channel-tokens. **Specific pattern (full attention vs gated fusion vs hierarchical) is the system's self-experimentation degree of freedom; spec the shape, do NOT pin the pattern.**
- Tritone-symmetric three-sub-head — three sub-heads each producing 24 outputs, with cross-square attention. Preserve from current `mental-pole-mechanics §7` tritone-symmetric-inductive-bias subsection.
- Output projection — linear to 72 scalars + sigmoid.
- Training pipeline `scripts/train.rs` — supervised regression. Loss: `MSE + λ_square·square_emphasis_loss + λ_mirror·mirror_consistency_loss + λ_cross_channel·cross_channel_coherence_loss`. λ values from config.
- Bioquaternion→embedding projection layer (learned alongside main head).
- Checkpoint versioning + corpus-snapshot pairing per `mental-pole-mechanics §7 line 451-459`.
- `pi train-ebm` and `pi export-ebm-state` CLI commands (Rust-native, in epi-cli).
- Kernel-runtime integration: per-element-tick invocation path callable from `kernel_energy_evaluate` (Stream B integration point).
- Training corpus assembly: completed dev sessions, accumulated bimba node annotations, Phone Writings, project markdown.
- Gemini Embedding 2 fetch per document — depends on Stream E S0 settings infrastructure for API key.
- Embedding cache (embeddings don't change per document version).

**Canon-spec amendments needed alongside this tranche:** §1.2 (mental-pole-mechanics §7 N-channel rewrite + Rust-native language change) must be landed before this tranche executes. Thread A handles that.

**Tranche dependencies:** Stream E (S0 settings + Gemini Embedding 2 accessor) blocking on the API-key plumbing.

## §2.4 — STREAM D: Riemannian gradient + Möbius descent step

**Target tranche file:** `06-m5-epii-reconciliation.md` Tranche 6.10 — amend to fold the gradient implementation scope alongside the existing Möbius-descent-step naming.

**Scope to capture in the tranche:**
- Implement Riemannian-quaternion gradient pipeline per `mental-pole-mechanics §7.5` (the new subsection landed by Thread A per §1.2).
- `kernel_energy_gradient(state, e_4_inputs, e_5_inputs, e_6_inputs) → [f32; 4]`:
  - ∇E_4 via autograd through Nara-LoRA forward pass (Stream F)
  - ∇E_5 via autograd through Rust-native N-channel EBM (Stream C)
  - ∇E_6 via soft surrogate over Cypher invariants (severity weights from config)
  - Weighted sum 4:5:6 / 15
  - Manifold projection: subtract radial component
- `kernel_mobius_descent_step(state) → BioQuaternionState`:
  - `q_p_raw = q_p − log(9/8) · ∇_M E_total`
  - Renormalize to `|q|=1`
- Wire into `KernelProjection` at per-element-tick (8x per cycle per `mental-pole-mechanics §7 line 436`).
- Inter-element transitions interpolate gradients.
- Inverse-Möbius at Element VII (per kernel-spec §7 line 326): same Riemannian pattern on q_b.
- Test contract per `mental-pole-mechanics §7.5`.

**Canon-spec amendments needed alongside this tranche:** §1.2 (mental-pole-mechanics §7.5 new subsection) must be landed first. Thread A handles.

**Tranche dependencies:** Streams B (signature), C (EBM autograd), F (Nara autograd) must land before this can execute.

## §2.5 — STREAM E: S0 settings infrastructure + Gemini Embedding 2 accessor

**Target tranche file:** read `17-s-stack-modularisation.md` first; if scope aligns, amend with a sub-tranche. Otherwise create a new tranche file at next-available number for S0-settings + cloud-key-management work.

**Scope to capture in the tranche:**

**A. S0 settings infrastructure** at `Body/S/S0/settings/` (verify against existing crate layout):
- `ApiKeyStore` reading from env (user's `~/.zshenv` canonical source)
- `CloudOptInPolicy` per-key (mandatory check before use)
- `SettingsManifest` listing required and optional keys
- Gateway methods: `s0'.settings.api_key_status(name)`, `s0'.settings.opt_in(name)`
- CLI: `epi settings status`, `epi settings opt-in <key>`
- Opt-in recorded in `~/.epi-logos/config.toml` `[cloud_opt_in]` section
- Refuse cloud-class API use without recorded opt-in; error points to CLI command

**B. Gemini Embedding 2 accessor** at `Body/S/S0/gemini-embedding/` (or module inside existing crate):
- Model `gemini-embedding-2-preview` (verify latest name at execution time)
- Document chunking: native 3072-dim handling; chunk only beyond canonical context limit
- Cache: `~/.epi-logos/cache/embeddings/{model-version}/{document-hash}.{matryoshka-dim}`
- Matryoshka truncation: 3072 / 1536 / 768
- Rate limiting + back-off + retry with jitter (parameters from config)
- Privacy class: cloud-opt-in (gate at accessor entry)
- Mock-API mode for CI; live-API smoke test for manual verification

**Canon-spec amendments needed alongside this tranche:** none beyond §1 amendments. `M'-MODEL-SLOT-SPEC` already commits to cloud-opt-in policy.

**Tranche dependencies:** none blocking. Blocks Stream C (EBM head needs Gemini access).

## §2.6 — STREAM F: Nara LoRA + E_4 personal-energy substrate

**Target tranche file:** `05-m4-nara-reconciliation.md` — amend to add a sub-tranche.

**Scope to capture in the tranche:**
- Scaffold Nara skill family at `Body/S/S4/ta-onta/S4-x/skills/{nara-voice-training, nara-journal-parser, mlx-lora}/` per ML-Skill-Surface §4 residency rules (verify exact S4 subpath at scope-capture time).
- Define `E4PersonalInputs` struct consumed by Stream B `kernel_energy_evaluate`:
  - PASU snapshot (q_identity, q_personal, birth_date, birth_location, etc.)
  - Live kairotic state (planet_degrees[10], current oracle charges, tarot_psyche_anchor_signature)
  - Reference to Nara-LoRA checkpoint (path + version)
- Implement `compute_e_4_personal_energy(state, inputs) → f32`:
  - Nara-LoRA forward pass over proposed configuration
  - Scalar evaluation against PASU substrate
- Implement autograd path through forward pass (Stream D gradient dependency).
- Apple Silicon path via `mlx-lora` skill (custom-built per ML-Skill-Surface §3.1).
- LoRA-adaptation pipeline: corpus = user's journal + dream record + phone writings; trigger via `pi nara train-lora`.
- Privacy class: ALL Nara LoRA training and inference is `local-only` per `M'-MODEL-SLOT-SPEC`; refuse cloud routing.

**Canon-spec amendments needed alongside this tranche:** none beyond §1. ML-Skill-Surface §3.1/§3.2 already commits to mlx-lora + Nara skill family.

**Tranche dependencies:** none blocking. Blocks Stream B (E_4 channel content) and Stream D (gradient ∇E_4).

## §2.7 — STREAM G: Elo state + multi-channel scoring + drift-detection

**Target tranche files:**
- `12-agentic-layer-s4-s5.md` Tranches 12.20 (Elo bookkeeping — already planned), 12.23 (Anima MoE dispatch policy — already planned), 12.24 Phase 2 (aletheia-elo-rating + aletheia-drift-detection skills — already planned)

Amend each to lock the no-hardcoding rule and confirm scope alignment with this handoff.

**Scope to capture in the tranches:**
- Three Elo channels `(R_verifier, R_lens, R_user)` keyed by `(agent, model, skill, vak-cp-position, mef-lens, content-class, kairos-window)` per `M'-AGENTIC-RUNTIME-SPEC §3-5`.
- SpacetimeDB schemas at `Body/S/S3/spacetime-context/schemas/elo-runtime.sql`.
- Aletheia subagent modules at `Body/S/S4/ta-onta/S4-5p-aletheia/modules/{mercurius-elo, anansi-elo-index, moirai-fair-comparison, janus-threshold}.ts`.
- Rust-native Bradley-Terry / TrueSkill updater in `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/elo-rating/`.
- Anima dispatch policy at `Body/S/S4/ta-onta/S4-4p-anima/modules/dispatch-policy.ts` reading Mercurius state (7-step policy per `M'-AGENTIC-RUNTIME-SPEC §5`).
- Drift-detection daemon at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/custom/drift-detection/` — four drift conditions (rating-trend, veto-pattern, coverage, verifier-violation).
- **ALL THRESHOLDS (δ, N, T, k, α) FROM `~/.epi-logos/config.toml` `[aletheia.drift_detection]` and `[aletheia.elo]` SECTIONS. NO HARDCODED DEFAULTS. The tranche must explicitly state this rule and forbid magic numbers in implementation.**
- Retrain-trigger writes to Anima dispatch queue with `dispatch_purpose: calibration`.

**Canon-spec amendments needed alongside this tranche:** confirm `M'-ML-SKILL-SURFACE-SPEC §5` lists the four drift conditions with explicit config-driven framing (not example numbers). If it currently hardcodes example numbers (δ=100, N=50, etc.), Thread A or H amends §5 to remove example numbers and replace with config-key references.

**Tranche dependencies:** independent of Streams A-F.

## §2.8 — STREAM H: Evolver / DGM integration as typed VAK choreography

**Target tranche file:** create new Tranche 12.25 (or next-numbered after Tranche 12.24 Phase 4) in `12-agentic-layer-s4-s5.md`. New tranche capturing the evolver integration as typed VAK choreography over existing primitives.

**Scope to capture in the tranche:**
- Once Streams A-G stabilise (via m-dev execution), the evolver loop is typed VAK choreography over existing primitives.
- Mapping:

| Evolver step | Existing primitive |
|---|---|
| Sample parent | `s5'.improve.history` (existing dry-run-only API at `Body/S/S5/epii-autoresearch-core/src/lib.rs`) |
| Sample stepping-stone parent | Query `Idea/Empty/Discarded/*` per §1.5 residency-law extension |
| Mutate / propose | Zeithoven via `s5'.improve.propose` (specced, async ack) |
| Score | Kernel's canonical `(E_4, E_5, E_6)` energy computation via `kernel_energy_evaluate` (Stream B). Same energy used for descent; baseline-vs-challenger is `E_total(challenger) < E_total(baseline)`, not a separate fitness function. |
| Admissibility gate | M0'/Anuttara verifier refusal-authority at E_6 weight 6 (canonical; failure at E_6 vetoes regardless of E_4/E_5 scores) |
| Promotion | Hen residency law + `requires_human` gate at `Body/S/S5/epii-review-core/src/lib.rs:261-269` (existing, non-bypassable by agents) |
| Crossover (multi-parent synthesis) | `dispatch_fusion_agents` CFP3 F-Thread at `Body/S/S4/ta-onta/S4-4p-anima/extension.ts:460` (existing, wired) |
| Stepping-stone archive | §1.5 (Empty/Discarded/{round-key}/) |
| Cross-cycle differential signal (Imbue's "learning log") | Read existing `dev_decisions` + `supersedes` + `proposes` canonical frontmatter relations as differential signal for Zeithoven's next-round proposals |
| Recognition-closure | Existing `recognized: bool` on UserContextFrame + `recognition_provenance` Anuttara coordinate string. Composition predicate: SHACL-pass ∧ R-virtue-check ∧ kernel-65-invariant-check ∧ (E_5 lens-coherence delta below threshold when EBM is trained). Threshold from config. |

**The tranche scope is to SPEC this composition** — name each evolver-step as a typed VAK invocation `(CPF, CT, CP, CF, CFP, CS)` with concrete values, map each step to its existing primitive, reference Sakana DGM's objective-hacking case studies as load-bearing rationale for keeping E_6 refusal-authority + `requires_human` gate non-bypassable, reference Imbue's dynamic percentile-based sigmoid midpoint as the technique Mercurius's `weighted_score()` should adopt (Stream G refinement).

**Canon-spec amendments needed alongside this tranche:** the tranche itself becomes the canonical reference for the evolver integration. May want to add a top-level reference in `M5'/m5-prime-autoresearch-self-improvement-loop.md` pointing to the tranche for the operational/typed-VAK view.

**Tranche dependencies:** All other streams (A-G) must execute before this tranche's scope is implementable. The tranche itself is plan-able now.

---

# §3 — SUBAGENT PROMPTS (ready-to-dispatch — planning, not execution)

Each prompt is self-contained. Dispatch as `general-purpose` agent. **All prompts are planning prompts.** Threads B-I write into cycle-3 tranche files; they do NOT write implementation code. Thread A amends canon-spec files directly because those are paper canon updates, not cycle-3 work.

## Thread A — Immediate canon-spec amendments + Hen residency-law extension

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Execute the in-place spec amendments per §1 of [[33-harmonic-energy-channel-handoff.md]]. PAPER EDITS ONLY — no implementation code written by this thread.

Files to amend:

1. /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md
   - §3 lines 148-152 + line 162 per handoff §1.1
   - Use exact replacement text from handoff

2. /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md
   - §5 + §7 + new §7.5 per handoff §1.2
   - §7 input-encoder line already fixed (Gemini Embedding 2) — preserve
   - §7.5 is a NEW subsection inserted between current §7 and §8 — use exact text from handoff §1.2

3. /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M'-USER-CONTEXT-SKILL-SPEC.md
   - §3 + §3.2 rename and rewrite per handoff §1.3
   - PRESERVE §72-74 recognized:bool flag

4. Six files under /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/
   - Frontmatter sub_coordinate update per handoff §1.4

5. /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md
   - Confirm M5-4' / M5-0' carrier labels per handoff §1.4

6. /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S1/S1'/S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL.md
   - Add discarded_branchable state row + promotion-direction arrow per handoff §1.5

RULES:
- DO NOT create new "supersedes" spec files. Edit in place.
- DO NOT write implementation code or touch cycle-3 tranche files.
- Preserve all existing frontmatter unless explicitly changed per the handoff.
- Use exact replacement text from the handoff §1 subsections.
- Verify after each edit: file still parses as valid YAML frontmatter + markdown; no broken wikilinks; no surrounding text orphaned.

If a passage doesn't fit cleanly (e.g., surrounding context needs additional reconciliation), note it and propose minimal additional edits to make the surroundings consistent — do not skip such reconciliations silently.

Report back: list of files touched, line ranges of changes, any reconciliation notes.
```

## Thread B — Plan-update: m3_compute_charges oracle-wiring sub-tranche

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Amend the cycle-3 plan to capture Stream A scope per §2.1 of [[33-harmonic-energy-channel-handoff.md]]. PLAN-FILE EDIT ONLY — no implementation code written by this thread.

Read these first:
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/04-m3-mahamaya-reconciliation.md (full)
- /Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/epi-lib/include/m3.h:755-767 (for citation accuracy)
- /Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/epi-cli/src/nara/oracle.rs lines 1236-1665 (current Rust reimplementation)
- /Users/admin/Documents/Epi-Logos C Experiments/Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts lines 634-642 (OracleCast.charges typing)
- /Users/admin/Documents/Epi-Logos C Experiments/.depwire/DEAD_CODE.md line 92
- handoff §2.1 (scope to capture)

Task:
- Decide whether to amend an existing tranche in 04-m3-mahamaya-reconciliation.md (if there's a stub for oracle wiring) or add a new sub-tranche with next-available number.
- Write the tranche scope in the plan file's existing tranche-format style, capturing every bullet from handoff §2.1 "Scope to capture in the tranche."
- Reference handoff §2.1 by tranche-relative link.
- Add tranche dependencies / blocks-and-blocked-by per the handoff.
- Capture the decisions-already-locked block (cite handoff frontmatter dev_decisions).

DO NOT:
- Implement the FFI binding or touch oracle.rs / m3.h.
- Modify other tranche files unless cross-references need updating.

Report back: file amended, tranche-id added, line range of additions, any cross-reference updates made.
```

## Thread C — Plan-update: kernel.rs total_energy restructure tranche

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Amend the cycle-3 plan to capture Stream B scope per §2.2 of [[33-harmonic-energy-channel-handoff.md]]. PLAN-FILE EDIT ONLY — no implementation code written by this thread.

Read these first:
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md (full — locate Tranche 6.10)
- /Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/portal-core/src/kernel.rs lines 106-184 (struct + caller) and 1209-1237 (function)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md §3 (current text — note Thread A may amend per handoff §1.1)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md §5 + §7 (current text — note Thread A may amend per handoff §1.2)
- handoff §2.2 (scope to capture)

Task:
- Read existing Tranche 6.10 scope in 06-m5-epii-reconciliation.md. If it already captures kernel.rs restructure work, AMEND it to align with handoff §2.2. If not, add Tranche 6.11 (or next-available) capturing the scope.
- Capture every bullet from handoff §2.2 "Scope to capture in the tranche" including the EnergyDecomposition struct extension, signature change, stub-zero acceptable behaviour, downstream caller updates, gitnexus risk assessment.
- Note dependency: this tranche's execution requires Thread A's canon amendments to be landed first (kernel-spec §3 + mental-pole-mechanics §5/§7/§7.5 per handoff §1.1, §1.2).
- Note dependency: tranche execution requires Streams C (EBM forward pass) and F (Nara forward pass) for non-stub channel content. Stub-zero acceptable for initial landing.

DO NOT:
- Implement the kernel.rs changes or touch any code under Body/.
- Re-debate decisions; cite handoff frontmatter dev_decisions block.

Report back: file amended, tranche-id added or amended, line range of additions, dependency-chain captured.
```

## Thread D — Plan-update: N-channel EBM head tranche coordination

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Amend the cycle-3 plan to capture Stream C scope per §2.3 of [[33-harmonic-energy-channel-handoff.md]] across two tranche files. PLAN-FILE EDIT ONLY — no implementation code written.

Read these first:
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md Tranche 12.24 Phase 2 (existing)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md Tranche 6.8 (existing)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md §7 (current — note Thread A will amend per handoff §1.2)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M'-ML-SKILL-SURFACE-SPEC.md §3.3 (parashakti-ebm-head)
- /Users/admin/Documents/Epi-Logos C Experiments/Body/S/S0/portal-core/src/kernel.rs lines 346-388 (MathemeHarmonicProfile — confirms N-channel substrate is in code)
- handoff §2.3 (scope to capture)

Task:
- Amend Tranche 12.24 Phase 2 in 12-agentic-layer-s4-s5.md to capture the parashakti-ebm-head skill scope per handoff §2.3.
- Amend Tranche 6.8 in 06-m5-epii-reconciliation.md to capture the resonance-vector-predictor module scope per handoff §2.3.
- Coordinate the two so scope is not duplicated: 12.24 Phase 2 owns the skill/training surface; 6.8 owns the module/runtime integration. Cross-reference each from the other.
- Capture explicit decisions: Rust-native default, N-channel architecture shape, cross-attention pattern as system-experimentation degree-of-freedom (not pinned), all hyperparameters from config.
- Note dependency: Stream E (S0 settings + Gemini Embedding 2 accessor) must execute before this tranche's training pipeline is operable.
- Note dependency: Thread A canon amendments (mental-pole-mechanics §7 Rust-native + N-channel rewrite per handoff §1.2) must land first.

DO NOT:
- Implement EBM code or touch Body/S/S5/epii-autoresearch-core/skills/.
- Pin the cross-attention pattern in the tranche scope (it's a system-experimentation surface).
- Hardcode any hyperparameter values in the tranche scope.

Report back: files amended, tranche-id pair, scope-split rationale, dependency-chain captured.
```

## Thread E — Plan-update: Riemannian gradient + Möbius descent tranche

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Amend the cycle-3 plan to capture Stream D scope per §2.4 of [[33-harmonic-energy-channel-handoff.md]]. PLAN-FILE EDIT ONLY — no implementation code written.

Read these first:
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md Tranche 6.10 (existing — Möbius descent step)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md (post-Thread-A — §7.5 new subsection IS the spec the tranche implements)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md §3 + §7 (descent + inverse-Möbius)
- handoff §2.4 (scope to capture)

Task:
- Amend Tranche 6.10 in 06-m5-epii-reconciliation.md to fold the gradient implementation scope alongside the existing Möbius-descent-step naming.
- Capture every bullet from handoff §2.4 "Scope to capture in the tranche" including per-channel gradient sources, weighted combination, manifold projection, update + renormalize, invocation cadence (8x per cycle), inverse-Möbius at Element VII, test contract.
- Note explicit dependency: Streams B (kernel.rs signature), C (EBM autograd), F (Nara autograd) must land first.
- Note dependency: Thread A canon amendment (mental-pole-mechanics §7.5 new subsection per handoff §1.2) must land first — it IS the spec.

DO NOT:
- Implement gradient code or touch portal-core / kernel.rs.
- Spec a different gradient technique; decision is locked to Riemannian-quaternion with manifold projection.

Report back: file amended, tranche-id, scope-additions, dependency-chain captured.
```

## Thread F — Plan-update: S0 settings infrastructure + Gemini Embedding 2 accessor

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Amend the cycle-3 plan to capture Stream E scope per §2.5 of [[33-harmonic-energy-channel-handoff.md]]. PLAN-FILE EDIT ONLY — no implementation code written.

Read these first:
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md (full)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M'-MODEL-SLOT-SPEC.md (cloud-opt-in policy)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M5'/frontier-confirmations-and-refinements.md §2 (Gemini Embedding 2)
- Body/S/S0/ directory tree (decide which crate hosts the new settings subsystem, or whether a new crate is needed)
- handoff §2.5 (scope to capture)

Task:
- Determine whether 17-s-stack-modularisation.md is the right home, or if a new tranche file is warranted. If new, create at next-available number in the cycle-3 plan folder using the file-naming convention NN-name.md.
- Capture two components per handoff §2.5: (A) S0 settings infrastructure, (B) Gemini Embedding 2 accessor.
- Capture every bullet including ApiKeyStore, CloudOptInPolicy, gateway methods, CLI commands, opt-in recording at ~/.epi-logos/config.toml, embedding cache structure, Matryoshka truncation support, rate limiting parameters from config.
- Note: this tranche's execution is independent (no upstream deps); it blocks Stream C (EBM head training pipeline).
- Note canonical API-key source: user's ~/.zshenv.

DO NOT:
- Implement any settings or embedding-accessor code.
- Hardcode rate-limit thresholds or retry counts in the tranche scope.

Report back: file amended or created, tranche-id, scope-split between A and B, dependency-blocks captured.
```

## Thread G — Plan-update: Nara LoRA + E_4 personal-energy substrate

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Amend the cycle-3 plan to capture Stream F scope per §2.6 of [[33-harmonic-energy-channel-handoff.md]]. PLAN-FILE EDIT ONLY — no implementation code written.

Read these first:
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/05-m4-nara-reconciliation.md (full)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M'-ML-SKILL-SURFACE-SPEC.md §3.1 + §3.2 + §7.1
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Pratibimba/Self/PASU.md
- handoff §2.6 (scope to capture)

Task:
- Add a sub-tranche to 05-m4-nara-reconciliation.md (next-available number).
- Capture every bullet from handoff §2.6 including Nara skill scaffolding, E4PersonalInputs struct definition, compute_e_4_personal_energy function spec, autograd path, mlx-lora Apple Silicon path, LoRA-adaptation pipeline, local-only privacy gate.
- Note: this tranche's execution is independent (no upstream deps); it blocks Stream B (E_4 channel content) and Stream D (gradient ∇E_4).
- Note canonical privacy commitment: ALL Nara LoRA training and inference is local-only per M'-MODEL-SLOT-SPEC.

DO NOT:
- Implement any Nara skill or compute_e_4_personal_energy code.
- Touch PASU.md or any user-data file.

Report back: file amended, tranche-id, scope-additions, dependency-blocks captured.
```

## Thread H — Plan-update: Elo state + drift-detection no-hardcoding lock

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Amend the cycle-3 plan to capture Stream G scope per §2.7 of [[33-harmonic-energy-channel-handoff.md]]. PLAN-FILE EDIT ONLY — no implementation code written.

Read these first:
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md Tranches 12.20, 12.23, 12.24 Phase 2 (existing)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M'-AGENTIC-RUNTIME-SPEC.md §3-5
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M'-ML-SKILL-SURFACE-SPEC.md §3.4 + §5
- handoff §2.7 (scope to capture)

Task:
- Amend Tranches 12.20, 12.23, 12.24 Phase 2 in 12-agentic-layer-s4-s5.md to lock the no-hardcoding requirement and confirm scope alignment with handoff §2.7.
- Capture explicit rule in EACH amended tranche: "ALL thresholds (δ, N, T, k, α, retry counts, severity weights) FROM ~/.epi-logos/config.toml [aletheia.drift_detection] and [aletheia.elo] sections. Tranche execution must implement config-driven values, not hardcoded constants."
- ADDITIONAL CANON CHECK: Read M'-ML-SKILL-SURFACE-SPEC §5. If it currently contains example numeric thresholds (e.g., "δ=100 Elo, N=50 trials, T=30 days, k=3×"), amend §5 to remove the numeric examples and replace with named config-key references (e.g., "δ = config.aletheia.drift_detection.delta_elo, N = config.aletheia.drift_detection.min_trials, etc."). Verify and amend in place.

DO NOT:
- Implement any Elo/drift-detection code.
- Pin any numeric threshold in the tranche scope or in the §5 canon amendment.

Report back: files amended, tranche-ids amended, canon-spec amendment status (M'-ML-SKILL-SURFACE-SPEC §5 — yes/no with citation), config-key vocabulary established.
```

## Thread I — Plan-update: Evolver / DGM integration tranche (new Tranche 12.25)

```
Repo root: /Users/admin/Documents/Epi-Logos C Experiments

Add the evolver-integration tranche per §2.8 of [[33-harmonic-energy-channel-handoff.md]]. PLAN-FILE EDIT ONLY — no implementation code written.

Read these first:
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/12-agentic-layer-s4-s5.md (locate end of Tranche 12.24 Phase 4 — Tranche 12.25 lands after)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md (existing four-phase spine)
- /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S4/S4'/S4'-SPEC.md (VAK reading-frame law)
- handoff §2.8 (scope to capture, including the full mapping table)

Task:
- Add Tranche 12.25 in 12-agentic-layer-s4-s5.md (or next-available number if 12.25 is taken).
- Capture the full integration mapping from handoff §2.8 (10-row table).
- The tranche scope is to PRODUCE a spec mapping each evolver-step to a typed VAK invocation (CPF, CT, CP, CF, CFP, CS values) and to its existing primitive.
- Capture explicit rationale: Sakana DGM's objective-hacking case studies as evidence for keeping E_6 refusal-authority + requires_human gate non-bypassable; Imbue's dynamic percentile-based sigmoid midpoint as the technique Mercurius's weighted_score() should adopt.
- Note tranche dependency: ALL other streams (A-G via Threads B-H) must EXECUTE (not just plan) before this tranche's spec produces an implementable integration. Plan-able now; execution waits for upstream stabilisation.
- Add a reference link from /Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md pointing to Tranche 12.25 as the operational/typed-VAK view of the spine.

DO NOT:
- Implement any evolver code.
- Re-debate decisions; cite handoff frontmatter dev_decisions block.

Report back: tranche-id added, scope-summary, m5-prime-autoresearch-self-improvement-loop.md cross-reference added.
```

---

# §4 — PLANNING-PASS ORDER (this handoff's downstream agents)

This is the order to dispatch threads in. It is not cycle-3 execution order — it is the order to PLAN cycle-3 work + land immediate canon amendments.

1. **Thread A** — Immediate canon amendments + Hen residency-law extension (paper changes, unblocks all downstream plan-update threads because they cite the amended specs)
2. **Threads B–I** — Cycle-3 tranche file amendments. These can all run in parallel after Thread A lands; they touch different tranche files and do not share write-targets. The only soft-coordination point is Thread D (touches both 06-m5-epii-reconciliation.md Tranche 6.8 and 12-agentic-layer-s4-s5.md Tranche 12.24 Phase 2) and Thread H (touches 12.20 / 12.23 / 12.24 Phase 2 in 12-agentic-layer-s4-s5.md) — both write into 12-agentic-layer-s4-s5.md but to different tranches. Sequential dispatch of D and H is safer than parallel.

After all threads complete, the cycle-3 plan files are fully updated to reflect locked decisions, the canon is reconciled, and the m-dev process is ready to be pointed at the updated tranche set for actual execution (which is a separate session).

---

# §5 — WHAT THIS HANDOFF DOES NOT COVER

- Cycle-3 EXECUTION. The m-dev process owns that. This handoff only updates plans + canon.
- Cycle-3 tranches not touched by these streams remain on their existing scope.
- Ratification of any Phase-F decision register row. The locked decisions in this handoff's frontmatter ARE the project's decisions; whether the cycle-3 13-decision-register.md tracks them as ratified is a separate housekeeping pass.
- DR-EBM-IMPL (PyTorch-via-PyO3 vs pure-Rust). Deferred until Stream C executes and hits the decision point. Not pre-decided.
- The N-channel EBM cross-attention pattern is deliberately under-specified across all artifacts. The system's praxis decides.
- Any decision not in the frontmatter `dev_decisions` block is out of scope. Escalate to user if it arises.

---

# §6 — HANDOFF PROMPT FOR NEW SESSION

Use this prompt as the opening of the new session:

```
Continuing from 2026-06-08 planning session. This is PLANNING work for cycle 3, NOT execution. The m-dev process runs cycle-3 tranches separately; this session updates the cycle-3 plan files and lands immediate canon-spec amendments so the cycle-3 plans are coherent.

Read first:
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/33-harmonic-energy-channel-handoff.md

That document captures:
- Locked decisions (frontmatter dev_decisions block — not up for re-debate)
- §1 immediate canon-spec amendments (paper edits — Thread A dispatches them)
- §2 cycle-3 plan/tranche file updates (Threads B-I — each amends specific tranche files)
- §3 ready-to-dispatch subagent prompts (one per thread, self-contained)
- §4 planning-pass dispatch order

Dispatch Thread A first per §3 (immediate canon amendments). After it lands, dispatch Threads B-I per §4 (sequential D and H to avoid same-file races, otherwise parallel).

No implementation code is written by this session. Threads A-I write paper amendments and plan-file updates only. The cycle-3 m-dev execution happens in a later session, against the updated plan files this session produces.
```
