## Authoritative sources read

- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md (both pages, 0–505 + 506–669)
- Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md
- Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md (both pages, 1–637 + 638–769)
- Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md
- Idea/Bimba/Seeds/M/M1'/physical-pole-stack-architecture.md
- Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md (both pages 1–517 + 518–1035 + 1035–1178)
- Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/02-m1-paramasiva-reconciliation.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m1-reconciliation-matrix.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/15-m1-2-ananda-vortex-research.md
- Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md (both pages 1–506 + 507–986)
- Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md (head, lines 1–100; remainder confirmed cross-cited by M1-ARCHITECTURE and 10.10/18.3)

## Per-row audit

### T02.1 — Audit and downgrade residual M0-witness wording
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:42-51 (DR-M1-1 VALIDATED) and Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:60-65 ("M1-5 As The +1 Of The 137 Architecture")
- **Current framing in tranche:** Single-line patch routing alpha_quaternionic_integration_across_M_stack §1.1 from "M0 Anuttara witness-axis" to "M1-5 (+1 parent) per M1'-SPEC §1".
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Verbatim consistent with DR-M1-1's "standing invariant"; substrate at m1.h:526-551 already encodes the +1 site.

### T02.2 — Land `klein_flip` field + emitter on `MathemeHarmonicProfile`/`vimarsha_reading`
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:308-318 (DR-IG-2 VALIDATED 3-variant); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:106-108 (Klein-Flip Visibility on Tritone Crossing); Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:418-435 (KleinFlipEvent struct + kinds proposal)
- **Current framing in tranche:** Add `klein_flip: Option<KleinFlipEvent>` to profile in kernel.rs; detector inside vimarsha_reading.rs firing at Lens N ↔ N+3 (mod 12).
- **Recommendation:** AUGMENT
- **Recommendation detail:** Tranche 02.2 currently scopes only the tritone variant. Align with DR-IG-2's three-variant union (m1.tritone.crossing, m2.cymatic.valence.invert, m3.codon.rotation.cross) by cross-linking to 18.2(b) where the discriminated union actually lands; M1 only emits the M1 variant but the field/event type is shared per DR-IG-2.

### T02.3 — Wire Klein-flip + topology values into `m1.paramasiva.kleinTopology` view
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:498-525 (M1TopologyProjection); Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:617-635 (kleinTopology 2D view contract including verbatim attribution band); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:338 (test asserts DOUBLE_COVER_DEG=720, TORUS_GENUS=1, Hopf-bundle single-torus recognition)
- **Current framing in tranche:** Populate M1ProfileClockModel.topology slots from real bridge values; render kleinTopology widget; emit `m1.klein_flip.source`.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Substrate already enforces TORUS_GENUS=1, DOUBLE_COVER_DEG=720 at m1.h:526-551; wave-a row 6 confirmed slot presence, this tranche closes the wire.

### T02.4 — Verify `m1_performance_event_from_profile` + `MPrimePerformanceEvent` replay
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:80-82 (kernel-bridge runtime event); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:104-105 (deterministic event stream first-production artifact); Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md:230-256 (MPrimePerformanceEvent envelope)
- **Current framing in tranche:** Confirm symbol exists; replay-test asserts deterministic reconstruction.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Names the canonical envelope and grounds it in M1'-SPEC §13.1.

### T02.5 — Surface the single session-held # (Inversion_Operator) carrier
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:386-393 (DR-M1-3 VALIDATED — single session-held); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:42 ((0/1) wired into every coordinate via single Psychoid_Hash); Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:437-456 (InversionOperatorHandle proposal)
- **Current framing in tranche:** Named contract on the M1 kernel-bridge exposing `invert(coordinate)` as single session-held operator; no per-coordinate forks.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Verbatim consistent with DR-M1-3 ratified resolution ("Single session-held; no per-coordinate forks. The handle IS the (0/1) act surfaced at every coordinate.").

### T02.6 — K² played-torus 3D surface — full Bevy/wgpu extension (DR-M1-2)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:54-62 (DR-M1-2 VALIDATED — full 3D Bevy/wgpu rendering extension `m1-paramasiva-played-torus`); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:55-56 (M1-2' canonical contract incl. Bevy/wgpu); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:325 ("K² must remain disambiguated... M3-5 owns the downstream double-torus formalism K² × T²_Mahāmāya"); Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:698-704 (M1↔M3 forbidden-overlap boundary)
- **Current framing in tranche:** First-build at Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ with Bevy/wgpu; single K² only; double-torus belongs to M3-5; audio_octet/nodal_quartet via profile bus (no local re-derivation).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** All four boundary disciplines (M3-5 double-torus exclusion; Vimarśa-window subscription; no local LUT forks; CSV-fidelity test) are correctly anchored.

### T02.9 — M1-2 Ananda Vortex architecture landing in M1' spec + Paramasiva UX
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:53 (six matrix families w/ raw + DR faces); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:346-360 (§15a cross-reference to M1-2-ANANDA-VORTEX-ARCHITECTURE); Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md:101-161 (§5b "M1-2 Ananda Vortex — The Visible Heartbeat")
- **Current framing in tranche:** Doc-side total-shape landing; both spec §15a and UX §5b are patched.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Tranche correctly identifies that the C side currently exposes the digit-root face only (m1.c:22-114) and that the raw/no-DR 12x12 affine face from the CSV must be carried before the surface treats the vortex as complete.

### T02.7 — Audit four-scale Cl(4,2) identity
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:240-247 (Cl(4,2) as substrate-algebra across M1 ring, M3 codon, M4 personal, Kerykeion natal); Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:710-715 (M1' ↔ M4' shares-substrate one-algebra contract)
- **Current framing in tranche:** Audit memo confirming single Cl42_Basis_Entry shape with +2 signature shared across the four scales; M-side memo at 02.7 cross-cuts with 10.7 (kernel-side).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Exactly what M1'-SPEC §11 and standing invariant demand.

### T02.8 — Resolve audio-research open question on `MathemeHarmonicProfile` owner
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/m1-prime-audio-generative-research.md:260 (Open Research Questions first item); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m1-reconciliation-matrix.md:56 (Row 16 resolution — answer is at Body/S/S0/portal-core/src/kernel.rs:346, re-exported via harmonic_profile.rs)
- **Current framing in tranche:** One-line update naming portal-core/src/kernel.rs as canonical owner.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Stale question resolved cleanly by existing code.

### T10.1 — Profile-field readiness ledger
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md:1-35 (ledger digest table)
- **Current framing in tranche:** Cycle-3 canonical source-of-truth profile-field readiness ledger; the M1 fields (audio_octet/nodal_quartet, lens_mode, klein_flip pending) are correctly classified.
- **Recommendation:** KEEP-AS-IS

### T10.2 — Land `MathemeHarmonicProfile.klein_flip` + bridge JSON emit
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:308-318 (DR-IG-2 three-variant unification); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:58-73 (18.2 consolidates 10.2 + CCT-5 + DR-IG-2)
- **Current framing in tranche:** Field add + populate from vimarsha_reading; bridge JSON emit; preflight blocker drop.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Note explicitly that 10.2 is executed by 18.2 (per Tranche 18 consolidation map) so the three-variant union lands in one place.

### T10.5 — Audit `s2_anchor` / `s3_anchor` placeholders
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md:62-66; Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:370-375 (M1-1' future-anchor consumption)
- **Current framing in tranche:** Either populate using cycle-2 S2/S3 anchor registries or downgrade to `#[deprecated]`. No greenfield.
- **Recommendation:** KEEP-AS-IS

### T10.M1 — M1' Profile Projections (six new fields)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:336-346 (DR-IG-4 VALIDATED — torus_knot_phase SSOT at MathemeHarmonicProfile.m1_topology.torus_knot_phase); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:386-393 (DR-M1-3); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:396-407 (DR-M1-4)
- **Current framing in tranche:** Six fields — klein_flip, inversion_operator, canonical_source_handle, instance_handle (Hen-routed), ql_flowering, m1_topology (with torus_knot_phase per DR-IG-4 SSOT, double_cover_deg:720, torus_genus:1, hopf_identity).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Each subfield matches a ratified DR or M1-ARCHITECTURE proposal with substrate citations.

### T18.1 — Typed JSON shape extraction (M1-relevant)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:46-56
- **Current framing in tranche:** Add typed KernelBridgeProfileJsonShape + KernelBridgePerformanceEventJsonShape at kernel_bridge_runtime.rs; mirror on TS.
- **Recommendation:** KEEP-AS-IS

### T18.2 — KleinFlipEvent 3-variant discriminated union
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:308-318 (DR-IG-2); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:106-108 (M1 = origin of Klein flip; M2' consumes)
- **Current framing in tranche:** Three variants — M1TritoneCrossing, M2CymaticValenceInvert, M3CodonRotationCross — at portal-core/src/events.rs; bridge subscribers match exhaustively.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Aligned with M1'-SPEC §6 (M1 is the origin of the Klein flip) and DR-IG-2 ratified composition.

### T18.3 — Land `ananda_vortex: AnandaVortexProjection`
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md:96-100 (raw + DR dual-register cell); Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md:61-80 (six matrix families with both faces from CSV)
- **Current framing in tranche:** Dual-register projection with CSV-fidelity test fixture covering `7X+1` and `8X+0`.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Tranche correctly insists that the JSON edge preserve both raw/no-digit-root and digit-root faces — substrate-grounded against m1.c:22-114 + CSV.

### T18.4 — M1 sub-projections (M1TopologyProjection + handles)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:336-346 (DR-IG-4 — torus_knot_phase SSOT); Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:498-525 (M1TopologyProjection canonical attribution strings)
- **Current framing in tranche:** Per-domain projections including M1TopologyProjection (with torus_knot_phase per DR-IG-4 SSOT, double_cover_deg, torus_genus, hopf_identity), InversionOperatorHandle, CanonicalSourceHandle, M1InstanceHandle, QLFloweringProjection.
- **Recommendation:** KEEP-AS-IS

### T18.5 — Composition projections (PsychoidFieldProjection / dipyramid)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:364-382 (DR-IG-6 VALIDATED with CORRECTED GEOMETRY — full 6+6 = 12 positions; P0/P0' centre; P5/P5' poles; P1-4 + P1'-4' base)
- **Current framing in tranche:** PsychoidFieldProjection per DR-IG-6.
- **Recommendation:** AUGMENT
- **Recommendation detail:** The 18.5 row is M1-tangential (sits in composition projections), but per DR-IG-6 cleanup, the projection MUST enumerate the full 6+6 mapping (2 apex poles P5/P5' + 4 base P1-4 + 4 inverted-base P1'-4' + 1 central axis-point P0/P0'). Tranche text should explicitly cite DR-IG-6's "corrected geometry" so renderers don't regress to the 6-vertex form.

### T18.6 / T18.7 / T18.8 / T18.9 (M1-tangential)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md:112-134; Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:265-272 (DR-KB-2 deposition_anchor); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:539 (DR-S2-1 graph_handle: GraphAnchorProjection)
- **Current framing in tranche:** s2/s3 anchor audit; bedrock_link; typed deposition_anchor; GraphAnchorProjection on profile.
- **Recommendation:** KEEP-AS-IS

### Wave-A row 1 — M1' renders, never invents pitch
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:25 (authority boundary: Vimarsha at M2-1' writes the cloud; M1' walks); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:78-80 (M1' uses audio_octet to sound the current coordinate; never re-synthesizes)
- **Current framing in matrix:** Vimarsha writes audio bus; M1' consumes; never re-synthesises.
- **Recommendation:** KEEP-AS-IS

### Wave-A row 2 — 9/8 epogdoon tick self-derived from 4:2 ↔ 3:3
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:142-172 (§9 The Dual Partition 4:2 ↔ 3:3; (4/3)×(3/2)=2/1, (3/2)÷(4/3)=9/8); Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md:79 (the tick is self-derived)
- **Current framing in matrix:** Substrate constants present; UX makes load-bearing pedagogy claim; surface derivation panel pending.
- **Recommendation:** KEEP-AS-IS

### Wave-A row 3 — 84-state (lens, mode) shared playing surface
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:110-127 (§7 The 84-State `(lens, mode)` Playing Landscape — 12 MEF lenses × 7 CF modes)
- **Current framing in matrix:** kernel.rs:363 lens_mode field; 84-cell landscape round-trips.
- **Recommendation:** KEEP-AS-IS

### Wave-A row 4 — M1-5 is the +1 of 137 (NOT M0)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:60-65 (M1-5 As The +1 Of The 137 Architecture); Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md:22-46 (the +1 is at M1, where 100% is defined); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:42-51 (DR-M1-1 VALIDATED)
- **Current framing in matrix:** Standing invariant — substrate at m1.h carries TORUS_GENUS=1/DOUBLE_COVER_DEG=720/RING_QUATERNION_LUT[12] which IS the +1.
- **Recommendation:** KEEP-AS-IS

### Wave-A row 5 — Audio_octet + ratio_role consumed; never re-synthesised
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:79 ("M1' uses audio_octet … never owns or re-synthesizes the bus"); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:333 (test fixtures match kernel profile exactly)
- **Recommendation:** KEEP-AS-IS

### Wave-A row 6 — Hopf identity S³→S²→S¹; 720° SU(2) double-cover
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:217-220 (M1' renders K²; Hopf bundle via hopf.rs); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:338 (DOUBLE_COVER_DEG=720, TORUS_GENUS=1)
- **Recommendation:** KEEP-AS-IS

### Wave-A row 7 — Klein-flip at Lens N ↔ Lens N+3 tritone crossings (M1' is origin)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:106-108 (Klein-Flip Visibility on Tritone Crossing — M1' is the origin point; M2' consumes); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:308-318 (DR-IG-2)
- **Recommendation:** KEEP-AS-IS

### Wave-A row 8 — Cl(4,2): 4 explicate +1, 2 implicate −1; +2 net signature
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:222-247 (§11 The Cl(4,2) Clifford Algebra; explicit P0=sin..P5=cos signature)
- **Recommendation:** KEEP-AS-IS

### Wave-A row 9 — 6 pairing-families A/B/C + D1/D2/D3; "three squares" derived C∪D1
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:250-295 (§12 6 Pairing-Families as Geometric Moves on K²; squares as C ∪ D1)
- **Current framing in matrix:** S2 typed harmonic pointer relations are the named blocker.
- **Recommendation:** KEEP-AS-IS

### Wave-A row 10 — M1-1' ↔ S1/Obsidian vault alignment (coordinate IS file structure)
- **Status:** ALIGNED (decision pending under DR-M1-4)
- **Cited:** Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md:179-187 (§7 The S1 / Obsidian / Vault Alignment); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:396-407 (DR-M1-4 VALIDATED — Hen vault-instance contract at Body/S/S4/ta-onta/S4-1p-hen/CONTRACT.md)
- **Current framing in matrix:** DOC-AHEAD; UX promises coordinate-IS-file; the Hen carrier closure lives at S1.
- **Recommendation:** AUGMENT
- **Recommendation detail:** DR-M1-4 has already validated landing of the Hen contract at S4-1p-hen/CONTRACT.md. The wave-A "DOC-AHEAD (land it or downgrade)" framing is now stale — point at DR-M1-4 + DR-S1-2 (rename-reconciliation through Hen) + DR-S1-3 (refuse-by-default on coordinate-residency mismatch) which together close the contract. Tranche should reflect "land per DR-M1-4 + DR-S1-2/3", not "downgrade to navigational analogy".

### Wave-A row 11 — (0/1) = raw # at every coordinate's invert field
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:42 (every walked coordinate carries invert pointing at the single session-held Psychoid_Hash); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:386-393 (DR-M1-3 VALIDATED — # is essentially (0/1))
- **Recommendation:** KEEP-AS-IS

### Wave-A row 12 — Deterministic MPrimePerformanceEvent stream
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:104, 301-303 (§13.1 Profile-to-Performance Stream)
- **Recommendation:** KEEP-AS-IS

### Wave-A row 13 — audio_octet[8] + nodal_quartet[4]
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:79 (M1' uses audio_octet to sound; nodal_quartet are boundary parameters)
- **Recommendation:** KEEP-AS-IS

### Wave-A row 14 — Played K² torus (Klein-double-cover-of-chromatic-fifths-torus)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:209-220 (§10 The K² Topology; Klein non-orientable identification); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:54-62 (DR-M1-2 — full Bevy/wgpu extension ratified)
- **Current framing in matrix:** "Largest renderer absence" — decision needed (2D vs Bevy/wgpu).
- **Recommendation:** AUGMENT
- **Recommendation detail:** DR-M1-2 has ratified the Bevy/wgpu extension; wave-A row 14 status should be elevated from "DOC-AHEAD" to "RATIFIED-BUILD". The matrix predates DR-M1-2 ratification.

### Wave-A row 15 — Coordinate system IS file structure (vault navigation = M1' walk)
- **Status:** ALIGNED
- **Cited:** Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md:183-187 (§7 alignment claim); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:517-525 (DR-S1-4 VALIDATED — Hen IS the canonical entity-candidate compiler)
- **Recommendation:** AUGMENT
- **Recommendation detail:** Closure now lives at DR-S1-4 (Hen entity-candidate lifecycle) + DR-M1-4 (vault-instance contract). Update matrix from DOC-AHEAD to RATIFIED-LAND.

### Wave-A row 16 — MathemeHarmonicProfile owner (audio-research open question)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:31 (Body/S/S0/portal-core/src/kernel.rs as live engine; harmonic_profile.rs as the shared type)
- **Recommendation:** KEEP-AS-IS

### Wave-A row 17 — Cl(4,2) four-scale identity (one algebra, four scales)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:240-247 (§11 Cl(4,2) as substrate-algebra inherited by M1/M3/M4/Kerykeion)
- **Recommendation:** KEEP-AS-IS

### Wave-A row 18 — M2-1' Vimarsha writes audio bus; M1' walks-as-melody
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:25 (corrected 2026-05-29 authority boundary)
- **Recommendation:** KEEP-AS-IS

### plan.runs/15-m1-2-ananda-vortex-research §A.5 — Cl(4,2) only colour-binary
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:226-238 (§11 Cl(4,2) trigonometric basis: P0=sin, P5=cos implicate −1; P1=tan, P2=sec, P3=cot, P4=csc explicate +1)
- **Recommendation:** KEEP-AS-IS

### plan.runs/15-m1-2-ananda-vortex-research §D.3 — 720° SU(2) recognition seeable as helix-stripe return after 24 ticks
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:217-220 (Hopf bundle S³→S²→S¹; double-cover); Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md:235-238 (TORUS_GENUS=1, DOUBLE_COVER_DEG=720, DEGREE_PER_TICK=30)
- **Recommendation:** KEEP-AS-IS

### plan.runs/15-m1-2-ananda-vortex-research §D.7 — diamond at K² centre
- **Status:** ALIGNED
- **Cited:** Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md:147-149 (§5b.7 the diamond at centre — substrate-claimed aesthetic primitive per net-new audit)
- **Recommendation:** KEEP-AS-IS

### plan.runs/15-m1-2-ananda-vortex-research §F.3 — Forbidden inventions
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:319 (no fork of m1.h constants); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:83 (no animation-frame clock authority); Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md:325-326 (no double-torus rendering)
- **Recommendation:** KEEP-AS-IS

## Drift patterns observed

The M1 tranches are remarkably clean. The single material drift pattern across this slice is **wave-A status staleness against later-ratified DRs**: rows 10/14/15 of the wave-A matrix were authored before DR-M1-2, DR-M1-4, and DR-S1-4 were validated on 2026-06-02/03, leaving the matrix carrying "DOC-AHEAD (land it or downgrade)" framings that the decision register has since closed by name. The fix is mechanical — point the matrix rows at the ratified DRs and elevate their status. A second, smaller pattern is **scope-collapse risk on the Klein-flip event**: T02.2 treats `klein_flip` as M1-local, but DR-IG-2 ratified a three-variant `KleinFlipEvent` (M1 tritone / M2 cymatic valence invert / M3 codon rotation cross) that lands as one shared enum at portal-core/src/events.rs through T18.2. T02.2 needs an explicit cross-reference so the field type is not silently re-defined as M1-only. A third pattern — and this one is important not to lose sight of even though it doesn't surface in M1-touching rows directly — is the **DR-IG-6 dipyramid geometry** (full 6+6 = 12 positions with P0/P0' as the central axis-point and P5/P5' as the two poles, not the older "6 vertices = 6 QL positions"). T18.5 PsychoidFieldProjection touches this; the tranche row currently cites DR-IG-6 but does not explicitly enumerate the corrected geometry. No M1 row contradicts a ratified DR. No M1 row collapses the four-Aletheia-registers, the Pleroma-two-faces, or the M0'/M5-0' Klein-seam — those families simply don't show up in the M1 slice, but the audit confirms M1 doesn't accidentally reintroduce confusions through ambiguous wording (e.g. all uses of "+1 parent" name M1-5 explicitly).

## Tranche augmentation / removal / addition recommendations

- **AUGMENT T02.2:** Add a cross-link to T18.2(b) and DR-IG-2 making clear that `KleinFlipEvent` is a three-variant discriminated union (M1TritoneCrossing, M2CymaticValenceInvert, M3CodonRotationCross) landed once at portal-core/src/events.rs. M1 only emits the M1TritoneCrossing variant but consumes the shared type. Citation: 13-decision-register.md:308-318.
- **AUGMENT T18.5:** Tranche row should verbatim enumerate the DR-IG-6 corrected dipyramid geometry (2 apex poles P5/P5' + 4 base P1-4 + 4 inverted-base P1'-4' + 1 central axis-point P0/P0') so the PsychoidFieldProjection serializer can't regress to the 6-vertex reading. Citation: 13-decision-register.md:364-382.
- **AUGMENT plan.runs/wave-a-m1-reconciliation-matrix.md rows 10, 14, 15:** Elevate from DOC-AHEAD to RATIFIED-LAND. Row 10/15 closure is DR-M1-4 + DR-S1-2 + DR-S1-3 + DR-S1-4 (Hen vault-instance contract + Hen-routed rename + residency-mismatch refusal + entity-candidate lifecycle). Row 14 closure is DR-M1-2 (Bevy/wgpu extension ratified). The "decision file present + no greenfield until validated" framing is fulfilled by the 2026-06-02 ratifications.
- **ADD (small clarifying row in Tranche 02):** A row explicitly naming that the M1-side audit of DR-IG-4 `torus_knot_phase` SSOT is consumed at `MathemeHarmonicProfile.m1_topology.torus_knot_phase` (per 10.M1 / 18.4). The current 02-m1-paramasiva-reconciliation.md does not name DR-IG-4; without that pointer a reader could think `torus_knot_phase` lives elsewhere. Citation: 13-decision-register.md:336-346.

## Open questions for user

- **DR-M1-4 vault-instance carrier verification.** The DR ratifies the contract at Body/S/S4/ta-onta/S4-1p-hen/CONTRACT.md but the wave-A matrix row 10 still reads as if it's open. The user should confirm that the contract file referenced in DR-M1-4 is the same file the user-memory note ("Aletheia is tool-guardian, not peer agent — spec lives at Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md; do not flag a missing aletheia-agent/agent-contract.json as a blocker") generalises — i.e. the Hen contract is also a CONTRACT.md, not a `hen-agent/agent-contract.json`. Citation: 13-decision-register.md:396-407.
- **2D vs 3D dual scaffold sequencing.** DR-M1-2 ratifies the Bevy/wgpu extension as the primary surface; M1-ARCHITECTURE.md §8.1 also retains the 2D m1-paramasiva extension as the inspector. M1'-SPEC §14 readiness tests don't distinguish which surface must pass which test. User confirmation requested: do the readiness tests run against the 3D played-torus only, the 2D inspector only, or both with split coverage? Citation: M1'-SPEC.md:333-344 and M1-ARCHITECTURE.md:756-770.
