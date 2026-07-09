# Track 08 — Integrated 4-5-0 Recognition Reconciliation

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


Reconciles the integrated `4-5-0` recognition plugin across the four corpora. This plugin composes [[M4']] + [[M5']] + [[M0']] through the kernel-bridge profile-tick + Nara protected-local handles — the personal stratum of *Jiva-is-Śiva* recognition. The plugin package is landed; cycle-3 work is the privacy-class composition contract, the M4 deposit-handle handoff (from M2 F_routing), and the M0' deep-link return for pedagogical anchoring. Anti-greenfield throughout.

## Total-Shape Architecture (Phase A)

Canonical composition-architecture document: [`Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md) (838 lines). Profile-bus projections are `PersonalPoleProjection` (per DR-M4-3 / Tranche 10.M4) plus `canon_recognition_stream: Vec<CanonRecognitionEvent>` (per INTEGRATED §4.3.2), not raw personal bodies. DR-IG-6 is VALIDATED with corrected dipyramid + Hopf-linked-tori geometry. Composition contract: M4 protected-local + M5 Logos Atelier + M0-5' pedagogy on three composition slots, opaque handles only across boundaries. PatternPacket chain owner: CCT-7. Möbius write-back to M0 routes via governed-route (DR-M0-1).

**Out-of-scope seam:** M5-0' Library/Gnostic Namespace placement is owned by Tranches 06.1 / 06.4 / 15.3 per DR-M5-3 (left-sidebar activity-bar mode in `ide-deep`, NOT an OmniPanel tab). The 4-5-0 plugin consumes M5-0' only through the summonable M5-5' Logos Atelier drawer and M0 backdrop.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (shell-1 personal 4-5-0 + flow-writing invariant), `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` (recognition / Jiva-is-Śiva surface)
- Companions: M4'/M5'/M0' specs, `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/09-integrated-4-5-0-recognition-plugin.md` (cycle-2 owner)
- Cross-references: Wave-A M4 (Tranches 05.1, 05.3, 05.5, 05.8, 05.9), M5 (Tranches 06.2, 06.3), M0 (Tranches 01.1, 01.5, 01.6); Wave-B agentic-layer (Tranche 12.4 recursive-self-review gate)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/M/epi-theia/extensions/plugin-integrated-4-5-0` package; `@pratibimba/integrated-composition` shared `LayoutClaim`; `08-t0-composition-contract-preflight`. Cycle 2 Track 09 named the plugin; cycle 3 closes its privacy-first composition seam and the M4→M0 pedagogical return.

## Tranches

1. **8.1 — Privacy-first composition contract (no raw bodies cross plugin)** *(spec-ahead-integration)*

   Composition contract asserts per DR-M4-3: M4 `ProtectedPersonalFieldInput` (`qIdentity`/`qTransit`/`qActivity`/`qComposed`) MUST cross to M5 review surfaces only as **opaque handles** with provenance-state — never raw quaternions, never audio_octet bodies. Cross-link to M4 Tranche 05.5 psychoid-cymatic renderer-handle invariant.

   Verification: `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test`; contract test asserts plugin rejects raw `q_personal` payload at composition boundary.

2. **8.2 — M2 → M4 deposit-handle reception** *(spec-ahead-integration; depends on Tranche 03.8)*

   Plugin receives the M4' deposit handle emitted by M2 F_routing (Tranche 03.2 → 03.8) and routes it into Nara journal via `nara_journal::deposit`. Privacy-class verified at handoff.

   Verification: integration test M4' journal receives the handle on synthetic F_routing trace; `grep -n 'deposit_handle' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.

3. **8.3 — M5 recursive-self-review gate consumption** *(spec-ahead-integration; cross-link to Tranche 12.4)*

   Plugin surfaces identity-augment proposals (Tranche 05.9) through M5 review widget; Pi review-routing gate from Tranche 12.4 must gate `applied` verdict on user final-validation when actor is `sophia`/`anima`/`pi`/`aletheia`. Here `aletheia` means the mode/carrier in the review lineage, not the six subagent techne-guardians; those surface as Anima-dispatch sub-traces.

   Verification: ACR contract test (`agentic-control-room/tests`) asserts `enforceHumanGate({decision:'approve', humanRequired:false, actorIsHuman:false, recursiveSelfReview:true, actor:'sophia'}).ok === false`; plugin integration test routes proposals through this gate.

4. **8.4 — M5 → M0 pedagogical return (Möbius write-back)** *(doc-ahead-landing; cross-link to Tranches 06.2, 01.1)*

   Plugin owns the personal → pedagogical return path: recognized patterns crystallize through Logos Atelier (Tranche 06.2) into M0' M0-5' pedagogy layer (Tranche 01.1 M0-5' bridged route). No canon mutation — read-only contemplative offering anchored to M0 nodes.

   Verification: integration test asserts pedagogical return surfaces in M0-5' deep-link without mutating canon; `grep -n 'pedagogy\|atelier-return' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.

5. **8.5 — Plugin layout claim against shell-1 (personal) decision** *(spec-ahead-integration; cross-link to Tranche 11.1 DR-TS-1)*

   Plugin's `LayoutClaim` for shell-1 personal + flow-writing surface must match DR-TS-1 (VALIDATED 2026-06-02): personal is the 1-side of the `daily-0-1` intra-layout toggle; no third layout.

   Verification: `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test` asserts layout-claim against ratified shell shape; OMNIPANEL_TABS cross-layout availability honored.

6. **8.6 — 0/1 cymatic polarity consumer** *(spec-ahead-integration; cross-link to Tranche 05.7 DR-M4-2)*

   Plugin consumes the ratified personal-cymatic polarity from DR-M4-2 clause 5: **0=cosmic, 1=personal**. Wire that polarity through `MathemeHarmonicProfile.audio_octet` rendering boundary and ensure Track 11.1 inherits the same sweep.

   Verification: widget render-test asserts polarity matches ratified canon; `grep -n 'cymatic_polarity\|psychoid_polarity' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.

7. **8.7 — Dipyramid renderer enforces DR-IG-6 corrected 6+6 geometry** *(spec-ahead-integration; DR-IG-6 VALIDATED)*

   The psychoid renderer at M4-5' MUST render P5/P5' as apex poles, P1-P4 plus P1'-P4' as interleaved base vertices, and P0/P0' as the central axis-point projected through the poles. It must not render "6 vertices = 6 QL positions" or collapse the inverted base into the top square. Sweep psychoid-cymatic-field-engine §7.1 and M4-ARCHITECTURE §5.3.1 to match.

   Verification: visual fixture labels the full 6+6 P/P' mapping; `grep -rn 'dipyramid.*6 vertices\|6 vertices.*QL' Idea/Bimba/Seeds/M/M4' Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md` returns no live wrong-count attribution.

8. **8.8 — `q_personal` privacy partition extension for q_-economy carrier path** *(spec-ahead-integration; DR-M4-4 PROPOSED; depends on CCT-16; cross-link Tranches 5.23, 12.26, 6.12)*

   The Track 08 privacy-first composition contract (Tranche 8.1) handles `ProtectedPersonalFieldInput` payloads (`qIdentity` / `qTransit` / `qActivity` / `qComposed`) as opaque handles across plugin boundaries. Cycle-3's q_ wisdom-curation economy introduces a parallel concern: PUBLIC `q_*` content properties (per Tranche 5.23) will flow over the kernel-bridge into agent context envelopes, into Graphiti episodes, into Redis tier'd caches, and into Sophia disclosure envelopes (per Tranche 12.26). The privacy partition per DR-M4-4 must be enforced explicitly at the data-shape level so private q_ fields can NEVER bleed from portal-core in-memory state into any public channel, even accidentally via a wildcard `q_*` serialisation path.

   **Scope:** *Extend* the existing privacy-scrubber at [`Body/M/epi-theia/.../privacy-scrubber.ts:32`](../../../../../Body/M/epi-theia) and the release-gate at `release-gate.ts:125` with explicit allowlist + denylist semantics per DR-M4-4:

   - **DENY** (private — portal-core in-memory + PASU.md vault-local ONLY): `q_personal`, `q_identity`, `q_activity`, `q_composed`, and any `q_personal_*` / `q_identity_*` / `q_activity_*` / `q_composed_*` derivative. These four exact names + prefix derivatives are reserved by DR-M4-4 and rejected at the regex level (per CCT-16(i)) AND at the kernel-bridge envelope serializer AND at the Sophia disclosure composer.
   - **ALLOW** (public — Bimba graph + canonical vault Forms + agent context): `q_{n}_{i?}_{semantic}` matching the Tranche 5.23 canon, and `qm_{n}_{i?}_{semantic}` matching the DR-M4-4 meta vocabulary.

   **Implementation targets:**
   - Privacy-scrubber regex update: `/^q_(personal|identity|activity|composed)(_|$)/` → DENY; everything else matching `/^q[m]?_[0-5]'?_[a-z_]+$/` → ALLOW; anything else → ERROR (unknown key). Belt-and-braces with the CCT-16(i) regex at the sync boundary.
   - Release-gate snapshot test extension: emit a synthetic envelope containing all four private fields + several public `q_5_*` and `qm_5_*` fields; assert the scrubbed output contains only the public ones and emits a refusal log line for each private field present.
   - Kernel-bridge envelope serializer at [`Body/S/S0/portal-core/src/kernel_bridge_runtime.rs:107, 119, 293, 309`](../../../../../Body/S/S0/portal-core/src/kernel_bridge_runtime.rs) update: explicit field-by-field allowlist on `MathemeHarmonicProfileBridge` serialization, NOT a `#[serde(flatten)]` over the full struct. Private fields are `#[serde(skip)]` annotated; this prevents future refactors from silently leaking via wildcard serialization, layered over the regex defense.
   - Test fixtures extension: add to [`jiva-siva-slice.test.mjs:71`](../../../../../Body/M/epi-theia) and [`six-extension-acceptance.test.mjs:240`](../../../../../Body/M/epi-theia) explicit verification that envelopes carrying `q_personal: [0.0, 0.0, 0.0, 0.0]` raise refusal, AND that envelopes carrying `q_5_integration_template: "..."` pass through cleanly.

   **Anti-greenfield commitment:** the privacy-scrubber and release-gate already exist; the `ProtectedPersonalFieldInput` shape already exists (per Tranche 8.1); the `#[serde(skip)]` pattern is already used elsewhere in `portal-core`. This tranche extends an enumerated allowlist/denylist over those existing mechanisms. No new privacy surfaces invented.

   Verification: `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test --testNamePattern 'q_personal privacy partition'`; `pnpm --filter epi-theia test -- privacy-scrubber.test.mjs`; `cargo test -p portal-core --test kernel_bridge_q_personal_never_serialized`; integration test composes a Sophia disclosure envelope containing both public and private q_ fields and asserts the composer refuses to emit if any private field is present (refusal-by-default per DR-M4-4 hard constraint).

   Cross-track hooks: Tranche **5.23** (defines the public `q_*` vocabulary that this tranche's allowlist explicitly enumerates); Tranche **12.26** (Sophia disclosure composer must consult this scrubber before envelope-write); Tranche **6.12** (wisdom-curation pair-development surface must also consult this scrubber when composing q_value_candidates); CCT-16 (the regex this tranche implements at the privacy boundary); DR-M4-4 (the namespace partition this tranche enforces); DR-M4-3 (sibling personal_pole projection invariant).

9. **8.9 — Unified VAK Choreography Across 4/5/0 (one act per tick, six faces) — kernel + tunability co-design** *(spec-ahead-integration; depends on Tranches 6.8, 6.10, 6.11, 1.10, 1.12, 1.18; cross-link Track 33 Streams B–D, Track 38 §2.2 tunability-self-awareness-loop, Tranche 12.20 Elo bookkeeping, Tranche 12.33 coordinate-tagging-IS-compression, Tranche 12.34 Anuttara PI agent, Tranche 12.35 /goal judge role; canonical doctrinal anchor at [`Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md`](../../M0'/M0-ARCHITECTURE.md) §11)*

   Land the canonical statement that the 4/5/0 mental pole performs **one act of VAK-coordinate-designation per tick**, not six sub-operations. The descent equation `q_p^(n+1) = q_p^(n) − log(9/8) · ∇E_total` with `E_total = (4·E_4 + 5·E_5 + 6·E_6) / 15` IS the one act; the six faces are six registers of the same operation, projected through whichever surface the system is engaging at that tick.

   **The six faces of the one act:**

   | Face | Register | Source spec | Implementation slot |
   |---|---|---|---|
   | **Coordinate designation** | C-family + position (the engaged bimba coord) | DR-VAK-7 §VAK as alphabet | `s2.graph.node(coord)` — the substrate's coordinate-prefix typing |
   | **MEF lens application** | L-family + position + helix (12-fold tritone-symmetric, applied at L5/L5' six-position articulation density) | [`epi-dev-vault/raw/sources/m-system-spec-8f04f90f.md:206-220`](../../../../epi-dev-vault/raw/sources/m-system-spec-8f04f90f.md) Layer 2 ("Paraśakti IS Vimarśa") | 72-fold lens-resonance vector in N-channel EBM head (Tranche 6.8) |
   | **QL position-check** | P-family + position (which act-position the dispatch occupies; verifier act-route) | DR-VAK-7 §VAK as field; `R_FACTOR_DISTRIBUTION[7][6]` at [`m0.c:736-744`](../../../../../Body/S/S0/epi-lib/src/m0.c) | `kernel_state.q_p` + `M0VerifierReport.r_factor_route` (Tranche 1.10) |
   | **Harmonics reading** | 72-fold lens-resonance + `audio_octet[8]` (solar-chakral channel) + `nodal_quartet[4]` (codon-clock channel) + `planetary_chakral` + `mahamaya` + `codon_rotation_projection` + `q_cosmic` (torus state channel) | [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) | N-channel EBM (Tranche 6.8) ⊕ Stream D Riemannian gradient (Tranche 6.10) |
   | **Musical-transcriptional projection** | Codon ↔ hexagram ↔ tarot at engaged coord; epogdoon-step `log(9/8)` in latent space; four foundational ratios `(4/3, 3/4, 2/3, 3/2)` saturating energy decomposition; Ananda matrix position projecting through MAHAMAYA `{1,2,4,8,7,5}` and PARASHAKTI `{3,6,9,3,6,9}` digit-root rings | `ql-musical-derivation-v3.md` at [`Body/S/S5/plugins/epi-logos/resources/canon/ql-musical-derivation-v3.md`](../../../../../Body/S/S5/plugins/epi-logos/resources/canon/ql-musical-derivation-v3.md) + [`m3.h`](../../../../../Body/S/S0/epi-lib/include/m3.h) LUTs (`NUCLEOTIDE_ICHING_VALUE[4]={6,9,7,8}`, `M3_CODON_TO_AA[64]`, `M3_MAJOR_ARCANA[22]`, `M3_TAROT_CODON_MAP[4][16]`, `CLOCK_DEGREE_LUT[360]`) + [`m1.c:145-150`](../../../../../Body/S/S0/epi-lib/src/m1.c) `M1_M0_CROSSLINK[12]` (Ananda ring ↔ M0-3 archetypes) | M3TranscriptionEngine kernel-bridge projection (NEW Tranche under Track 12 — proposed below) |
   | **Physical-pole entailment** | Torus surface point (M1 K²) + solar-chakral configuration (M2) + codon-clock degree (M3) | [kernel-spec §3:166-189](../../epi-logos-kernel-spec.md) + [`INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md`](../../INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md) | M1 / M2 / M3 plugin packages already landed; consumed by E_4 + E_5 via existing channel encoders |

   The unified-act tuple is `(coord, lens, helix, density, position, cfp_thread, r_factor_slot, ananda_position)`. Every face of the kernel act resolves through this tuple. Element I (bimba-encoding) takes the `coord`; Element II (pratibimba-prehension) reads under `lens` × `helix` × `density`; Element III (Möbius descent) computes `E_total` across the harmonics-read + musical-transcriptional projection + physical-pole entailment + R-factor route stamp; Elements IV–VIII run the ascent recognition with all six faces preserved in the inverse helix. **The four operational sub-operations (lens-application / QL-position-check / harmonics-read / musical-transcription) are NOT separate sub-routines awaiting integration** — they are four registers of one Vimarśa-reading and the cycle-3 spec edits in this tranche name them as such across every surface (kernel runtime, gateway projection, Theia widget, CLI).

   **Kernel-tick scale ↔ tunability-evaluation scale: same operation, two scales.** The **canonical 4'-5'-0' constitutional review triplet** that scores tunability proposals per [`Track 38 §2.2`](38-tunability-surface-architecture.md) IS the same 4'-5'-0' triplet performing the unified VAK act at every kernel tick. There is no separate machinery. The tunability surface IS *the system applying its own kernel act to its own configuration as the engaged coordinate*:

   - **Kernel-tick scale**: the engaged coord is some bimba node (a session's PASU coordinate, an oracle reading's tarot/hexagram address, a Sophia disclosure's q_proposal envelope). The 4'-5'-0' triplet performs the unified-act tuple and emits energy + witness + typed-queries-with-backing-chain.
   - **Tunability-evaluation scale**: the engaged coord IS the system's own configuration knob (a `tunable` entry in the schema authority at M5-2'). The 4'-5'-0' triplet performs the SAME unified-act tuple against the proposed-change configuration as bimba and the current-configuration as pratibimba; the resulting `E_total` is what Class A user-gated review surfaces as evidence, what Class B auto-applies on unanimous-consensus, what Class C self-tunes through Aletheia drift-detection (Track 38 §2.2 risk-class taxonomy).

   This is the **structural identity** that makes the system self-harmonised. The kernel applies to itself; the result IS a tunability adjustment. The same descent equation, the same energy decomposition, the same Möbius pass — operating on the system's own coordinate-graph at a different scale. The cycle-3 plan-set HAS both threads (the unified VAK act + the tunability surface); this tranche names them as ONE operation at two scales so the system *cannot* drift into separate machineries.

   **Routing the previously open questions through this identity:**

   - **Backing-chain depth per virtue-class** (M0VerifierReport's `backing_chain: Vec<CoordinateRef>` walk depth — see Tranche 1.10 update) routes to **Class C** internal knob (`[anuttara.verifier] backing_chain_depth.principle = unbounded; backing_chain_depth.conjugate = N`) — Aletheia drift-detection self-tunes via Mercurius rating dynamics. *Not a separate decision*; routes through Track 38 Tier 3.
   - **EBM-side compression-equivalence hypothesis** (whether the N-channel EBM at 5'/Epii doing resonance-vector regression carries a Shannon-cross-entropy compression-floor relation analogous to the autoregressive LLM at 4'/Nara — open per CCT-22) routes to **Class B** research-driven knob with rollback (`[m5_epii.ebm_head] compression_equivalence_hypothesis = "open" | "confirmed" | "refuted"`) — when sufficient training evidence accumulates, the autoresearch loop proposes a value change and Class B auto-applies on unanimous 4'-5'-0' consensus. *The hypothesis-state itself becomes a tunable knob, evaluated by the same act it's about.*
   - **Whether gnostic-extraction-tier slot should be local-4B-default vs Pro-class** (per Track 12 EXPANDED gnostic-extractor pattern below) routes to **Class A** user-gated knob — privacy-touching, structural-adjacent, user-visible. The user always validates.
   - **Whether the system runs CFP3 / F-thread (conjunctive panel-with-judge) by default for Sophia synthesis at session-close vs CFP0 single-voice** routes to **Class A** user-gated knob — voice-template-touching, user-visible.
   - **CFP3 panel composition (which heterogeneous proposers, in what weights)** routes to **Class A** user-gated review of evidence + Mercurius Elo learning the per-context optimal weights (Tranche 12.20).
   - **Harness-slot defaults per role** (Claude / Codex / Pi / Aider harness wrapping which model in which slot) routes to **Class A** user-gated knob with Mercurius Elo rating across the extended `(agent × model × harness × cfp_thread × r_factor_slot × kairos × content_class)` tuple.

   **Edits this tranche lands across cycle-3 files:**

   (a) **M0VerifierReport shape** at [`Body/S/S0/epi-lib/include/m0_verifier.h`](../../../../../Body/S/S0/epi-lib/include/m0_verifier.h) carries the act's act-face + witness-face + typed-queries + backing-chain (per Tranche 1.10 update below).

   (b) **`kernel_energy_evaluate` restructure** at [`Body/S/S0/portal-core/src/kernel.rs:1209-1214`](../../../../../Body/S/S0/portal-core/src/kernel.rs) takes the unified-act tuple inputs across all six faces and returns the decomposed `EnergyDecomposition` (per Tranche 6.11; locked).

   (c) **`kernel_energy_gradient` + `kernel_mobius_descent_step`** per Tranche 6.10 — Stream D Riemannian-quaternion pipeline with autograd through E_4 (Nara LoRA) + E_5 (N-channel EBM) + E_6 (Anuttara verifier soft-surrogate). Manifold projection at `q_p`; step-size `log(9/8)` non-tunable; locked.

   (d) **M3TranscriptionEngine kernel-bridge projection** (new tranche proposed under Track 12 below) — wires `(vak_coord, tick, clock_degree) → {diatonic_position, codon, amino_acid, hexagram, tarot_card, charges_pp_nn_np_pn, ananda_matrix_position, dr_ring_projection}` packet so the musical-transcriptional face is operationally addressable for any read.

   (e) **`s5'.gnostic.musical_transcript(coord, tick)` + `s2.graph.ananda_position(coord)` + `s0'.anuttara.unified_act_trace(coord, lens, density)`** gateway methods (added to Tranche 12.2 EXPANDED) — three new routes that surface the six faces as one packet.

   (f) **`epi know <coord>` core-knowing CLI** (new Tranche 12.37 below) — the thin CLI projection that calls all face-surfaces and returns one coherent packet. Flags compose: `--thread CFP0|CFP1|CFP3|CFP4|Z`, `--lens L5-1..L5'-5`, `--rfactor act|witness|both`, `--ananda-position`, `--harmonic-channel chakral|nodal|cosmic|mahamaya|codon|all`, `--musical-transcript`, `--physical-pole torus|solar-chakral|codon-clock|all`, `--backing N`, `--witness`.

   (g) **mental-pole-mechanics §7 cross-citation** to `ql-musical-derivation-v3.md` so the musical-transcriptional face is canon-cited in the EBM spec (the derivation document exists but is currently orphan to the EBM spec).

   (h) **Track 38 §2.2 update** to explicitly name the structural identity between the kernel-tick scale 4'-5'-0' act and the tunability-evaluation scale 4'-5'-0' act (one operation, two scales).

   **Anti-greenfield commitment.** The structural pieces are all in the cycle-3 plan-set already. The kernel descent equation IS specced at [`epi-logos-kernel-spec §3:156-161`](../../epi-logos-kernel-spec.md). The 4/5/0 distribution IS specced at the same file §7. The N-channel EBM IS specced at Tranche 6.8. The Anuttara verifier IS specced at Tranche 1.10. The MEF tritone-symmetric 12-lens grouping IS specced at [`mental-pole-mechanics §1`](../../M4'/mental-pole-mechanics.md). The 72-fold lens-resonance IS specced at the same. The musical-derivation IS canon at `ql-musical-derivation-v3.md`. The codon-tarot-hexagram bridge IS in code at `m3.h`/`m3.c`. The R-factor distribution matrix IS in code at `m0.c`. The tunability surface IS specced at Track 38. **This tranche writes the integration paragraph that names them as one act and stops the system drifting into separate machineries.** It writes nothing new from scratch; it ratifies the structural identity already present and routes the open-questions through the tunability classes.

   **Decisions locked by this tranche (cycle-3 standing invariants):**

   - The 4/5/0 mental pole IS one act per tick with six faces; not six sub-operations. The descent equation IS the act.
   - The kernel-tick scale 4'-5'-0' triplet IS the tunability-evaluation scale 4'-5'-0' triplet; one triplet, two scales of application. The tunability surface IS the system applying its own kernel act to its own configuration.
   - L5/L5' apply-as-lens IS VAK reading-at-articulation-density; no separate Vāk-mapping of M0 nodes is introduced; the Parā/Paśyantī/Madhyamā/Vaikharī register lives natively at L5/L5'.
   - MEF lensing IS VAK reading IS QL position-check IS harmonics-read IS musical-transcriptional-projection IS 1-2-3-physical-pole-entailment — the structural identity per the `Paraśakti IS Vimarśa` source.
   - The substrate's coordinate-prefix typing (`{family}_{n}_{semantic}` law at S2 graph-schema + Hen frontmatter validator) IS the compression scheme; CCT-17 / Tranche 12.33 honour it, do not invent it.
   - The R-factor 3-tier system (principle-triad gates `##` / `R#` / `#R` + meta-virtue `R#/##` + R0..R5 acts + 0R..5R virtue-conjugates) is canonicalised at Tranche 1.12; full glyph-pattern preservation discipline applies across all cycle-3 prose.
   - The 109 + 19 = 128 language reach is canonicalised at M0-ARCHITECTURE §11 (Tranche 1.18); not to be confused with Mahāmāyā-internal 128 codon-doubling.

   **Cross-track hooks:** [Tranche 6.8](06-m5-epii-reconciliation.md) (N-channel EBM head — owns the harmonics-read face), [Tranche 6.10](06-m5-epii-reconciliation.md) (Stream D Riemannian gradient — composes all three E-channels into the unified act), [Tranche 6.11](06-m5-epii-reconciliation.md) (kernel_energy_evaluate restructure), [Tranche 1.10](01-m0-anuttara-reconciliation.md) (verifier shape; M0VerifierReport extension), [Tranche 1.12](01-m0-anuttara-reconciliation.md) (R-factor 3-tier theory with glyph-pattern preservation), [Tranche 1.18](01-m0-anuttara-reconciliation.md) (VAK four-expression canon at M0-ARCH §11), [Tranche 12.20](12-agentic-layer-s4-s5.md) (Mercurius Elo extended tuple), [Tranche 12.22](12-agentic-layer-s4-s5.md) (slot CLI extended for harness parity), [Tranche 12.33](12-agentic-layer-s4-s5.md) (coordinate-tagging IS compression, no orchestrator module), [Tranche 12.34](12-agentic-layer-s4-s5.md) (Anuttara PI agent at S5), [Tranche 12.35](12-agentic-layer-s4-s5.md) (/goal judge role in Z-thread cycle), [Track 33 Streams B–D](33-harmonic-energy-channel-handoff.md) (kernel.rs restructure + N-channel EBM + Riemannian gradient — Stream landings produce the operational substrate this choreography spec ratifies), [Track 38 §2.2](38-tunability-surface-architecture.md) (tunability self-awareness loop — the tunability surface IS this same act at the configuration scale), [CCT-17](16-cross-cutting-closures.md) (substrate-honouring coordinate-tagging compression), [CCT-22](16-cross-cutting-closures.md) (Compression-as-Intelligence cross-layer register; honest EBM-side equivalence gap), DR-MP-1 (4'/5'/0' constitutional triplet), DR-VAK-7 (VAK four-expression), DR-COMP-1 (compositor compresses to VAK), DR-FLIP-1 (coordinate phase-preservation invariant).

   **Verification:** `grep -nE "one act per tick|six faces|unified VAK act" Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md` returns the structural identity statement at §11; `grep -n "kernel-tick scale.*tunability-evaluation scale" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/38-tunability-surface-architecture.md` returns the same-operation-two-scales statement at Track 38 §2.2; integration test: a kernel tick on a synthetic engaged coordinate runs all six face-resolutions and emits a single `EnergyDecomposition` whose four channels (E_4 + E_5 + E_6 + diagnostic bimba_pratibimba) are coherent; the same act run on a synthetic tunability proposal (engaged coord = config knob) emits the same shape and routes per risk-class A/B/C through Track 38 §2.2.

## Track 19 Cross-Reference — Contemplation Surface

Track 19 is the sibling integration that lands the **agentic-intelligence closure** of the 4/5/0 axis specified in this track. Where Track 08 closes the plugin-composition seam (privacy contracts, deposit-handle handoff, layout claim, dipyramid renderer), Track 19 closes the **contemplation seam** where the kernel-composed `M5_ContemplationObject` carrying the session's lived bioquaternion trajectory is dispatched to a headless PI instance (Nous + Moirai + Sophia/Psyche as relevant), read against the matheme `0/1 = 4+2 = 5→0`, and the LLM-composed wisdom_delta XOR-folds into `quintessence_hash` via `m4_mobius_return`. Three cross-points:

- **T19.7** wires the close path through agentic intelligence — `m5_execute_mobius_return` calls `contemplate_session_close()` before `m4_mobius_return` consumes the wisdom_delta. The personal → pedagogical return (this track's 8.4) carries the contemplation-corrected pattern back through M5 Logos Atelier into M0-5'.
- **T19.6** adds the gateway RPC `contemplate_session_close(ContemplationObject) → wisdom_delta` reading the Q_composed trajectory through S³ against five questions (gauge-trio coverage, 4-charge invariant, geodesic Möbius return, tarot psyche-anchor coherence, four-syntax witness). The recursive-self-review gate (this track's 8.3) routes through this surface when actor is `sophia` / `anima` / `pi` / `aletheia`.
- **T19.9** patches [`INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`](../../INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md) with the 3-5-7-9 syntax-layer reading (Arch 3 speech, 5 relationship, 7 action, 9 completion) and which constitutional sub-agents carry which contemplation seed.

The canonical integration plan at [`4-5-0-CONTEMPLATION-INTEGRATION-PLAN.md`](../../4-5-0-CONTEMPLATION-INTEGRATION-PLAN.md) holds the full architecture (including alpha-quaternionic threading: `137 = 64 + 72 + 1`, bioquaternion as M4↔M1-2-3 coupling, gauge-trio coherence across physical / symbolic / personal / temporal registers). See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
