# Canon Audit: integrated-1-2-3-cosmic

**Auditor scope:** Tranche 07 (integrated 1-2-3 cosmic engine reconciliation) — rows 7.1–7.6 audited against the seeds-level SPECs (M1', M2', M3'), the canonical composition architecture (INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE), the α-quaternionic integration paper, the Paramaśiva UX, and the ratified DR rows (special attention to DR-IG-2/3/4/5).
**Audit date:** 2026-06-03

## Authoritative sources read

- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md (lines 0–505 + 506–669, full)
- Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md (lines 1–587 of 918, all sections load-bearing for tranche 07)
- Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md (lines 1–517 of 1179)
- Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md (full)
- Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md (full)
- Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md (lines 1–639 of 919)
- Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md (lines 1–252, full body)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/07-integrated-1-2-3-cosmic-engine-reconciliation.md (full, 58 lines)
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-integrated-bimba-matrix.md (full, scoped to M0' integrated-bimba — confirmed it is NOT the cosmic-engine ledger; the matheme-composition ledger lives directly in INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md and the tranche-07 doc itself)
- Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md (lines 1–200; substrate citations + sub-coordinate map)
- Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md (lines 1–200; substrate + planet/72/Vimarśa map)
- Idea/Bimba/Seeds/M/M3'/M3-ARCHITECTURE.md (lines 1–200; sub-coordinate map + 472-state substrate)

## Per-row audit

### 7.0 (Phase-A frame) — "Composition over juxtaposition; M2 cymatic + M3 codon-rotation render ON K² surface"
- **Status:** ALIGNED
- **Cited:** INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:40-44 ("composition over juxtaposition" — load-bearing UI invariant); :60-80 (three poles, one K²); :346-357 (three layers stratified L0/L1/L2 on one canvas)
- **Current framing in tranche:** Composition-over-juxtaposition passes; M2 cymatic + M3 codon-rotation render on K² surface.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Frame matches the canonical architecture doc and the §7.1 contract.

### 7.0 (Phase-A frame, sub-row) — "DR-IG-2 (Klein-flip variant unification → CCT-5)"
- **Status:** WRONG-FRAMING
- **Cited:** 13-decision-register.md:308-318 (DR-IG-2 VALIDATED — three-variant `KleinFlipEvent` enum at `Body/S/S0/portal-core/src/events.rs`); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:275-302 (proposed `CosmicKleinFlip` with TWO variants only: BimbaToPratibimba / MobiusReturn)
- **Current framing in tranche:** Phase-A header treats DR-IG-2 as requiring a "CCT-5" closure; the architecture doc's `CosmicKleinFlip` struct still encodes only TWO variants.
- **Canon framing (if not ALIGNED):** DR-IG-2 ratified the three-variant `KleinFlipEvent` enum (`m1.tritone.crossing`, `m2.cymatic.valence.invert`, `m3.codon.rotation.cross`) unified at kernel-bridge level (events.rs is SSOT); the INTEGRATED-1-2-3 doc's two-variant `CosmicKleinFlip` enum is stale and must be reframed as a downstream projection of the canonical three-variant event, not a parallel definition (cited: 13-decision-register.md:308-318).
- **Recommendation:** REWRITE
- **Recommendation detail:** Tranche 07 must explicitly require the INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md §4.2.2 `CosmicKleinFlip`/`KleinFlipKind` proposed snippet (lines 275-300) be replaced with consumption of the ratified three-variant `KleinFlipEvent` at `events.rs`. Keep file:line citations to portal-core/events.rs.

### 7.0 (Phase-A frame, sub-row) — "DR-IG-4 (`torus_knot_phase` SSOT at `MathemeHarmonicProfile.m1_topology` → CCT-4)"
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:336-346 (DR-IG-4 VALIDATED — owner is `MathemeHarmonicProfile.m1_topology.torus_knot_phase` at `Body/S/S0/portal-core/src/kernel.rs`); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:236 (profile field table); M1-ARCHITECTURE.md:24-26 (decisions_routed lists DR-M1-3 + DR-M1-4)
- **Current framing in tranche:** SSOT lands on `MathemeHarmonicProfile.m1_topology`; INTEGRATED-1-2-3 composition reads from there.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Frame matches DR-IG-4 verbatim.

### 7.0 (Phase-A frame, sub-row) — "DR-IG-5 (cymatic surface pinned to torus inside composition → CCT-2)"
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:350-360 (DR-IG-5 VALIDATED — M2 cymatic pinned to K² in composition; standalone may toggle plate/sphere/torus); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:367-399 (§5.2-5.3: M2 cymatic shader bound to K² UV channels; "fragment-shader plugin into the K² material — not a separate mesh"); M2'-SPEC §2 (cymatic is a module within M2', not its identity)
- **Current framing in tranche:** Cymatic surface pinned to torus inside composition.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Aligns with DR-IG-5 ratified geometry and M2'-SPEC.

### 7.0 (Phase-A frame, sub-row) — "K2SurfaceHandle ownership at Tranche 02.6 → composition mount-point at 07.X"
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:54-62 (DR-M1-2 VALIDATED — `m1-paramasiva-played-torus` Bevy/wgpu extension is the K² renderer); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:188-198 (§2.9/§2.10 — M1 extension owns K² mesh; M2 + M3 extensions export `compositionMount`)
- **Current framing in tranche:** Tranche 02.6 owns `K2SurfaceHandle`; composition embeds it at a mount-point.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Composition-mount pattern matches §7.3 of the architecture doc.

### 7.1 — "Integrated readiness gate against Wave-A pending profile fields"
- **Status:** ALIGNED
- **Cited:** INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:128-135 (§2.4 profile-field availability checker, `checkCosmicEnginePanes`); :305-336 (§4.2.3 proposed `CosmicCompositionState` projection with `degradation_level` enum); :440-450 (§5.6 degradation states ready_full / ready_no_codon / ready_no_cymatic / ready_base_only / blocked_base_missing); 13-decision-register.md:308-318 (DR-IG-2 ratified — readiness consumes `klein_flip` field)
- **Current framing in tranche:** Plugin declares typed `IntegratedReadiness` blocked-states consuming Wave-A pending markers via the shared `integrated-composition` contract.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Add explicit citation to INTEGRATED-1-2-3 §4.2.3 proposed `CosmicCompositionState` so the readiness projection is the typed projection of its own readiness on profile-bus (not widget-local state), per §4.2.3 demanding OmniPanel-Diagnostics inspectability. Cite degradation-level enum verbatim.

### 7.2 — "137 = 64 + 72 + 1 composition assertion + parentAttribution == M1-5"
- **Status:** ALIGNED
- **Cited:** alpha_quaternionic_integration_across_M_stack.md:20-22 (§0 thesis — "+1 is Paramaśiva (M1) where 0/1 + 1/0 = 1/1 = 100% is defined"); :74-78 (§1 table — +1 at M1, 72 at M2, 64 at M3, 0/1 prior ground at M0); M1'-SPEC §1 + "M1-5 As The +1 Of The 137 Architecture" (lines 60-64 — M1-5 is single torus and SU(2)/4π recognition site, NOT M0); 13-decision-register.md:42-50 (DR-M1-1 VALIDATED standing invariant — +1 parent is M1-5, not M0); :216-224 (DR-M5-2 sibling sweep); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:48-54 (matheme diagram); M3'-SPEC §8.10 (137 spine framing)
- **Current framing in tranche:** Plugin must render `parentAttribution = 'M1-5'`, not `M0-Anuttara-witness`.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Frame matches DR-M1-1 + DR-M5-2 + the α-quaternionic paper §0/§1. The register-discipline extension (physics lane as labelled measurement face) is properly authorised by M3'-SPEC §0/1 commitment 7 (lines 49-49) and §8.10.

### 7.3 — "Solar-anchor design principle integration (B-8 / B-9 / B-12)"
- **Status:** MISSING-CITATION
- **Cited:** wave-b-integrated-bimba-matrix.md (rows B-8/B-9/B-12, lines 32-36 — the matrix that names solar-anchor + planetary placement + cross-surface edit propagation); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md DOES NOT name a "solar anchor" composition seam — its three-pole composition is M1(K²) + M2(72 texture) + M3(64 annulus), with planetary-chakral as an M2-internal field (line 250)
- **Current framing in tranche:** Plugin owns the B-8/B-9/B-12 composition seam: solar anchor + planetary placement + cross-surface edit propagation listener.
- **Canon framing (if not ALIGNED):** The wave-b-integrated-bimba matrix that originates B-8/B-9/B-12 is an M0' / Anuttara graph audit, NOT a cosmic-engine ledger. The "solar anchor" framing belongs to the Anuttara UX doc §6, not the seeds-level cosmic-engine architecture. Per INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md §2.6 (lines 154-155) planetary-chakral is consumed from `MathemeHarmonicProfile.planetary_chakral`; the spatial "solar anchor" rendering is the integrated plugin's claim against M0'/M2-5' substrate, not a seeded composition-architecture invariant. Route to user for whether "solar anchor" is a tranche-07 deliverable or an M0'-graph-side concern.
- **Recommendation:** REWRITE
- **Recommendation detail:** Either (a) cite the M2'-SPEC §9 Ficinian-Kerykeion routing protocol as the canon authority for planetary placement (lines 282-339) and reframe 7.3 around the `f_routing` carrier (DR-M2-3 VALIDATED, 13-decision-register.md:410-420) — making 7.3 about wiring `planetary_chakral` into a K²-pinned lens-region halo per INTEGRATED-1-2-3 §5.3; or (b) downgrade 7.3 to "cross-surface edit propagation listener via kernel-bridge profile-tick events" (the B-12 substance) and drop the solar-anchor framing as M0'-graph concern. Open question for user routing.

### 7.4 — "Cl(4,2) one-algebra cross-pole assertion"
- **Status:** ALIGNED
- **Cited:** alpha_quaternionic_integration_across_M_stack.md:240-247 (M1 ring quaternion + M3 codon quaternion + M4 personal quaternion all live in one Cl(4,2) algebra); M1'-SPEC §11 (lines 222-247 — Cl(4,2) as the substrate-algebra all higher layers inherit); M3'-SPEC §8.4 (lines 247-279 — codon-as-quaternion in Cl(4,2)); M3-ARCHITECTURE.md §2.7 (lines 169-173 — "one algebra, four scales", shared `Quaternion` type at `portal-core/src/quaternion.rs`); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:140-148 (substrate citations to `quaternion.rs`)
- **Current framing in tranche:** Plugin contract notes M1 ring quaternion, M3 codon quaternion, and M4 personal quaternion share one Cl(4,2) algebra at `portal-core/src/quaternion.rs`. Audit owned by Tranches 02.7 / 10.7.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Frame matches canonical SPECs and architecture docs; substrate cite is correct.

### 7.5 — "Plugin layout claim against shell-0 (cosmic) decision (DR-TS-1)"
- **Status:** ALIGNED
- **Cited:** 13-decision-register.md:276-284 (DR-TS-1 VALIDATED — `daily-0-1` carries the 0/1 cosmic↔personal toggle within ONE layout; no third layout needed; cross-link to DR-M4-2 clause 5 "0=cosmic / 1=personal"); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:82-96 (§1.3 — cosmic 1-2-3 lives on the cosmic side of `daily-0-1`)
- **Current framing in tranche:** Plugin's `LayoutClaim` for shell-0 matches DR-TS-1 resolution; no build until ratified.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** DR-TS-1 is VALIDATED (2026-06-02); tranche may proceed. Update gate-dependency note to mark DR-TS-1 ratified rather than pending.

### 7.6 — "Coupling-flow overlay on the 137 visual signature"
- **Status:** ALIGNED
- **Cited:** M3'-SPEC §0/1 commitment 7 (line 49 — physics bridge is a register-disciplined inspector, not a claim engine); M3'-SPEC §1 user-facing surface (line 59 — summonable coupling-flow / measurement-face inspector); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:43-44 (§0 — overlay register-labelled: symbolic skeleton, physics descent, measurement face, recognition context; "not a fourth pole, not a new dataset, not a local physics calculator"); :251 (`coupling_flow_alignment` optional field on profile); :420-438 (§5.5 — overlay names register; never changes geometry; still one K² / 72 / 64)
- **Current framing in tranche:** Plugin may expose `CouplingFlowAlignment` as a compact overlay on the existing 137 visual signature; must not add a fourth geometry layer.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Frame respects register discipline of `full_theoretical_alignments_ql_physics`. Substrate-grounded.

### Implicit row — "M3 codon ring DOES react to Klein-flip at tick 5→6" (per DR-IG-3)
- **Status:** WRONG-FRAMING (MISSING FROM TRANCHE 07)
- **Cited:** 13-decision-register.md:322-332 (DR-IG-3 VALIDATED — M3 codon-ring subscribes to `KleinFlipEvent` and renders a 200ms rotation-axis flip at the cross, mirroring M2 valence inversion; "composition-over-juxtaposition: all three poles respond to the same event in one render frame"); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:534-544 (§6.5 "DECISION" — proposes M3 codon ring is subscribed to klein_flip but reacts **minimally** with only T/U phase flicker; "does not rotate, swap, or re-shuffle")
- **Current framing in tranche:** Tranche 07 says nothing explicit about M3 codon-ring choreography on Klein-flip; the INTEGRATED-1-2-3 architecture doc itself encodes a MINIMAL flicker proposal that contradicts DR-IG-3's ratified rotation-axis flip mirroring M2's valence inversion.
- **Canon framing (if not ALIGNED):** DR-IG-3 ratified that M3 codon-ring renders a 200ms rotation-axis flip at the cross — mirroring (not minimising) the M2 valence inversion. The INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md §6.5 "minimal flicker" decision and the table at lines 538-544 are now stale and OVERRIDDEN by DR-IG-3 (cited: 13-decision-register.md:322-332).
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** Add tranche row 7.7 — "M3 codon-ring 200ms rotation-axis flip on Klein-flip event (per DR-IG-3)". Verification: M3 codon-ring `arc_sweep` choreography subscribes to all three `KleinFlipKind` variants (per DR-IG-2) and renders the rotation-axis flip; test asserts one render frame contains atomic M1 fold + M2 valence-invert + M3 rotation-axis-flip. The INTEGRATED-1-2-3 §6.5 doc must be patched to remove the "minimal flicker" decision and adopt DR-IG-3.

### Implicit row — "`torus_knot_phase` field consumed by composition" (per DR-IG-4)
- **Status:** WRONG-FRAMING (MISSING FROM TRANCHE 07)
- **Cited:** 13-decision-register.md:336-346 (DR-IG-4 VALIDATED — owner is `MathemeHarmonicProfile.m1_topology.torus_knot_phase`); :386-392 (DR-M1-3 VALIDATED — `inversion_operator: InversionOperatorHandle` on `MathemeHarmonicProfile`); INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:236 (kernel.rs profile-field table)
- **Current framing in tranche:** Tranche 07 phase-A header mentions DR-IG-4 but no per-row deliverable about `torus_knot_phase` consumption is enumerated.
- **Canon framing (if not ALIGNED):** DR-IG-4 demands the composition reads `MathemeHarmonicProfile.m1_topology.torus_knot_phase` as SSOT — no parallel definitions; depends on Tranche 10.M1 (per DR row). Tranche 07 must declare the consumer-side contract row.
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** Add tranche row 7.8 — "Composition consumes `m1_topology.torus_knot_phase` SSOT per DR-IG-4". Cross-link to Tranche 10.M1 (sub-tranche named in DR-IG-4 Depends).

### Implicit row — "single-subscription discipline (07.T1 test)"
- **Status:** ALIGNED (already implicit in cycle-2 carry)
- **Cited:** INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:171-186 (§2.8 kernel-bridge single profile fan-out, "One subscription. Three poles."); :340 (§4.3 the single-subscription discipline); :579-585 (§7.2 single-profile-subscription contract — same profile generation across all three layers atomically)
- **Current framing in tranche:** Tranche 07 inherits 07.T1 from cycle-2 ("Tests prove only one bridge subscription source fans out to three extensions") — already implemented at `plugin-integrated-1-2-3-widget.tsx:62-70`.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Make 07.T1 inheritance explicit in tranche 07 verification text, with citation to INTEGRATED-1-2-3 §4.3 + §7.2.

### Implicit row — "composition-mount contract (no juxtaposition)"
- **Status:** ALIGNED (lives in tranche 15.4)
- **Cited:** INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:563-577 (§7.1 composition-over-juxtaposition load-bearing); :587 (§7.3 compositionMount contract); 13-decision-register.md:660-662 (DR-UI-5 VALIDATED — `@pratibimba/integrated-composition-contract` shared package with typed `CompositionMountPoint` registry)
- **Current framing in tranche:** Tranche 07 cross-references 15.4 as composition pattern owner; DR-UI-5 ratifies the composition-mount contract.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Add explicit cross-link from tranche 07 to DR-UI-5 (13-decision-register.md:660-662) so the `compositionMountPoints` `package.json contributes` shape is contracted to the typed registry, not invented in `plugin-integrated-1-2-3`.

## Drift patterns observed

The dominant drift in tranche 07 is **architecture-doc-versus-DR temporal lag**: the INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md was authored 2026-06-02 (one day before the Phase-B verifier produced DR-IG-2/3 on 2026-06-03), and several of its proposed structures are now contradicted by ratified DRs but still cited as if canonical. The two specific cases:

1. The architecture doc's §4.2.2 `CosmicKleinFlip` enum carries TWO variants (`BimbaToPratibimba`, `MobiusReturn`) whereas DR-IG-2 ratified a THREE-variant `KleinFlipEvent` enum (`m1.tritone.crossing`, `m2.cymatic.valence.invert`, `m3.codon.rotation.cross`) at the kernel-bridge SSOT. Tranche 07's Phase-A header names DR-IG-2 but doesn't enforce the variant-count correction against the architecture doc's stale snippet.

2. The architecture doc's §6.5 "DECISION (DR-IG-3 candidate)" lands on a MINIMAL flicker for M3 codon-ring on Klein-flip ("does not rotate, swap, or re-shuffle"). DR-IG-3 ratified the OPPOSITE — a 200ms rotation-axis flip mirroring M2's valence inversion, in the spirit of composition-over-juxtaposition where all three poles respond to the same event in one render frame. The tranche 07 doc silently inherits the stale "minimal" framing because no row spells out the codon-ring choreography.

A secondary drift is **scope-conflation between the Anuttara M0' graph ledger (`wave-b-integrated-bimba-matrix.md`) and the cosmic-engine composition**. Row 7.3 imports B-8/B-9/B-12 "solar anchor / planetary placement / cross-surface propagation" from the M0' ledger and treats them as cosmic-engine deliverables. The canonical INTEGRATED-1-2-3 architecture has no "solar anchor" rendering primitive — the planetary-chakral is an M2-internal data field consumed via §5.3 cymatic shader and §6.6 lens-anchored cadence. Naming "solar anchor" at tranche 07 imports M0'-graph framing into a place where M2'-SPEC §9 Ficinian-Kerykeion routing already settles the question through `f_routing` (DR-M2-3 VALIDATED). The other tranche-07 rows hold well against canon — 7.1 / 7.2 / 7.4 / 7.5 / 7.6 are all substrate-grounded with citations that round-trip to the SPECs.

## Tranche augmentation / removal / addition recommendations

- **ADD 7.7 — M3 codon-ring 200ms rotation-axis flip on Klein-flip event.** Cited authority: 13-decision-register.md:322-332 (DR-IG-3). Concurrent with M1 K² fold + M2 cymatic valence invert per DR-IG-2 three-variant unification. Patch INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md §6.5 to drop the "minimal flicker" decision and adopt the DR-IG-3 rotation-axis flip.
- **ADD 7.8 — Composition consumes `MathemeHarmonicProfile.m1_topology.torus_knot_phase` SSOT.** Cited authority: 13-decision-register.md:336-346 (DR-IG-4). Cross-link to Tranche 10.M1. No parallel definition.
- **ADD 7.9 — Composition consumes ratified three-variant `KleinFlipEvent` from `Body/S/S0/portal-core/src/events.rs` (SSOT).** Cited authority: 13-decision-register.md:308-318 (DR-IG-2). INTEGRATED-1-2-3 §4.2.2 proposed `CosmicKleinFlip` two-variant struct is REPLACED by consumption of the three-variant kernel event; architecture doc must be patched in same tranche.
- **REWRITE 7.3** — drop "solar anchor design principle" framing as M0'-graph drift; reframe around either (a) Ficinian-Kerykeion `f_routing` consumption per M2'-SPEC §9 + DR-M2-3 (13-decision-register.md:410-420), or (b) the cross-surface edit propagation listener alone (B-12 substance). Route choice to user.
- **AUGMENT 7.1** — add explicit citation to INTEGRATED-1-2-3 §4.2.3 `CosmicCompositionState` typed projection; readiness lives on profile-bus for OmniPanel-Diagnostics inspectability, not in widget-local state.
- **AUGMENT 7.5** — mark DR-TS-1 as VALIDATED (2026-06-02) rather than "pending" gate dependency.
- **AUGMENT (cross-tranche)** — propose patch to INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md §4.2.2 and §6.5 to align with DR-IG-2 and DR-IG-3 respectively (architecture doc is currently stale on both).

## Open questions for user

1. **7.3 solar-anchor framing scope.** Is the "solar anchor + planetary placement" composition seam (B-8/B-9/B-12 from `wave-b-integrated-bimba-matrix.md` lines 32-36) intended to live at tranche 07 (cosmic-engine composition), or at the M0' Anuttara graph extension? Canon (INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md, M2'-SPEC §9) places planetary-chakral inside the M2 cymatic texture pinned to K² via DR-IG-5, not as a spatial "solar anchor" rendering primitive. The Anuttara UX doc §6 names solar-anchor for the M0' graph view. Two distinct surfaces; tranche 07 must pick one.

2. **Architecture-doc patch authority.** The INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md was authored before DR-IG-2/3 were ratified (one-day temporal gap). Should the architecture-doc patches be folded into tranche 07's deliverables (as architecture-doc maintenance), or land in a separate doc-only tranche? The audit cannot pick smoothly; the doc-patch work is mechanical but cross-cutting.

3. **DR-IG-3 "200ms" cadence.** DR-IG-3 names a "200ms rotation-axis flip" but the INTEGRATED-1-2-3 §6.1 tick choreography ties all animation primitives to the M1 `quat_slerp` cadence. Whether the 200ms is wall-clock or tick-quantised needs explicit anchoring — cited: 13-decision-register.md:328-330 (200ms named verbatim) and INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md:463 ("K² folds through itself for ~200ms" at L0 Klein-flip choreography). Both name 200ms; neither resolves the tick-quantisation question.
