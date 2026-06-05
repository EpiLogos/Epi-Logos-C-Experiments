# Track 18 — Typed Kernel-Bridge JSON Edge

**The single most leveraged cycle-3 cleanup.** This tranche consolidates the eight separate profile-bus and kernel-bridge surface additions surfaced across Phase A + Phase B into one coherent typed-JSON-edge landing. Landing this first removes coupling across the rest of cycle 3 — every downstream M' extension consumes the typed shapes rather than negotiating with an opaque `Record<string, unknown>` payload at the JSON edge.

The kernel-bridge JSON shape at `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs:580-646` and its Theia mirror at `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts` become **typed at the edge**: each new field surfaces as a structured projection with a known schema, mirrored cleanly on the TS side, version-stamped per `M5_WORKBENCH_SCHEMA_VERSION` pattern.

## Source

- S0-ARCHITECTURE.md §5.6 + §10.5 (typed JSON shapes — the foundational proposal)
- S2-ARCHITECTURE.md §4 (graph_handle profile-bus extension)
- Existing Tranche 10 (kernel-bridge profile-contract) — this tranche extends + executes 10.M0..10.IG sub-tranches as one PR
- CCT-5 (KleinFlipEvent 3-variant), CCT-6 (BedrockProvenanceHandle)
- DR-KB-2 (depositionAnchor typed field)
- M1-2-ANANDA-VORTEX-ARCHITECTURE.md §4.3 (AnandaVortexProjection)
- M-SYMBOLIC-LANGUAGE-ARCHITECTURE.md (OracleFrame / SymbolicProtein / VAK reading-frame language)
- DR-VAK-1 (active VAK order and reading-frame authority)

## Consolidation Map

This tranche replaces (consolidates and executes) the following previously-separate scopes:

| Previous reference | What it owned | Consolidated as |
|---|---|---|
| Tranche 10.2 | `klein_flip: bool` field | 18.2 below |
| Tranche 10.4 | `s2_anchor` / `s3_anchor` populate-or-remove | 18.6 below |
| Tranche 10.10 | `ananda_vortex: AnandaVortexProjection` | 18.3 below |
| Tranche 10.M0..10.M5 | per-domain projections (6 fields) | 18.4 below |
| Tranche 04.11 | `OracleFrame`, `ReadingPosition`, `SymbolicProtein` | 18.4 below |
| Tranche 05.11 | Nara deck-context / symbolic-protein handles | 18.4 below |
| Tranche 12.15 | VAK reading-frame evaluator contract | 18.4 below |
| Tranche 10.IG | composition projections (3 fields) | 18.5 below |
| CCT-5 | `KleinFlipEvent` 3-variant discriminated union | 18.2.b below |
| CCT-6 | `bedrock_link: BedrockProvenanceHandle` | 18.7 below |
| DR-KB-2 | `deposition_anchor` typed vs DTO | 18.8 below |
| S0-ARCH §5.6 | `KernelBridgeProfileJsonShape` + `KernelBridgePerformanceEventJsonShape` | 18.1 below |
| S2-ARCH §4 | `graph_handle: GraphAnchorProjection` | 18.9 below |

The previously-separate tranches REMAIN as reference rows; cross-link from each to this tranche as the executing closure. Once 18.1..18.9 land, the 10.x sub-tranches mark `done` automatically (no separate landing required).

## Dependency

Tranche 18 depends on **17.6** (split `Body/S/S0/portal-core/src/kernel.rs`) landing first. The split produces per-projection files that 18.1 then makes typed at the JSON edge. Attempting 18 before 17.6 forces 1,266-LOC kernel.rs edits in the same PR — too wide blast radius.

## Tranches

1. **18.1 — Typed JSON shape extraction** *(code-pending-closure; foundational)*

   At `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs`, introduce two `#[derive(Serialize, Deserialize)]` typed shapes:
   - `KernelBridgeProfileJsonShape` — the profile JSON edge (replaces `serde_json::Value` ad-hoc construction at lines 580-646)
   - `KernelBridgePerformanceEventJsonShape` — the M1' performance event edge (`m1_performance_event_from_profile`)

   Mirror both on TS at `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts` as typed interfaces.

   Round-trip schema test: a captured fixture profile JSON deserialises into the typed shape, re-serialises to byte-identical JSON.

   Verification: `cargo check -p epi-cli && cargo test -p epi-cli --test kernel_bridge_runtime_typed_json`; `pnpm --filter @pratibimba/kernel-bridge build`.

2. **18.2 — Land `klein_flip` and `KleinFlipEvent` together** *(code-pending-closure; closes Tranche 10.2 + CCT-5 + DR-IG-2)*

   (a) Add `klein_flip: Option<KleinFlipEvent>` to `MathemeHarmonicProfile`; populate from `vimarsha_reading.rs`. Drop `kleinFlipState` from contract preflight M2 blocker list.

   (b) Land the 3-variant discriminated union at `Body/S/S0/portal-core/src/events.rs` (after 17.13 split):
   ```rust
   pub enum KleinFlipEvent {
       M1TritoneCrossing { tick12: u8, lens_pair: (u8, u8) },
       M2CymaticValenceInvert { valence_before: Valence, valence_after: Valence },
       M3CodonRotationCross { codon_before: u8, codon_after: u8 },
   }
   ```

   Bridge subscribers (M1/M2/M3 extensions + integrated 1-2-3 plugin) match exhaustively.

   Verification: `cargo test -p portal-core --test klein_flip_event_variants_exhaustive`; bridge JSON edge emits all three variant kinds via 18.1 typed shape.

3. **18.3 — Land `ananda_vortex: AnandaVortexProjection`** *(code-pending-closure; closes Tranche 10.10)*

   Per M1-2-ANANDA-VORTEX-ARCHITECTURE.md §4.3 — the Rust struct definition is already specified there. Surface through 18.1 typed JSON shape without collapsing the Ananda payload to a scalar. The JSON edge preserves the canonical dual-register cell:
   - `activeCellValue.family`, `rowK`, `positionP`
   - raw/no-digit-root fields (`rawValue`, `rawBimba`, `rawPratibimba`, `rawSum`, `rawDelta`)
   - digit-root fields (`drValue`, `drBimba`, `drPratibimba`, `drSum`)
   - optional `ruleValue`
   - optional `skeletonEvent` discriminator for source-data events such as `Hit36`, `Hit64`, `Hit72`, `Ratio64Over36`, `Additive137`, `IdentityReturn4Plus2`

   Verification: `cargo test -p portal-core --test ananda_vortex_projection_round_trip`; typed fixture includes `7X+1` (`raw=1,8,15,22,29,36,43,50,57,64,71,78`; `dr=1,8,6,4,2,9,7,5,3,1,8,6`) and `8X+0` (`raw=0,8,16,24,32,40,48,56,64,72,80,88`; `dr=0,8,7,6,5,4,3,2,1,9,8,7`) so bridge serialization proves both CSV faces; m1-paramasiva-played-torus extension consumes typed handle.

4. **18.4 — Per-domain typed projections (M0-M5)** *(code-pending-closure; consolidates Tranches 10.M0..10.M5)*

   Six projection structs plus the cross-language reading handles surfaced through 18.1:
   - `AnuttaraLayerProjection` (M0; six data layers + KernelCoreAuditState)
   - `M1TopologyProjection` (M1; includes `torus_knot_phase` per DR-IG-4 SSOT, `double_cover_deg`, `torus_genus`, `hopf_identity`)
   - `InversionOperatorHandle` + `CanonicalSourceHandle` + `M1InstanceHandle` + `QLFloweringProjection` (M1 additional)
   - `ParashaktiMeaningProjection` (M2; Earth-at-centre is semantic documentation on the planetary axis projection, not a separate `EarthObserverHandle`)
   - `OracleFrameProjection` + `ReadingPosition` + `TranscriptionalClockPacket` + `SymbolicProteinProjection` / `OracleSequenceProjection` + `MahamayaLensStack` + optional `CouplingFlowAlignment` (M3; no `DetFoldState` per DR-M3-2)
   - `PersonalPoleProjection` with protected handles for `PatternPacket`, `OracleFrame`, `SymbolicProtein`, and `NaraDeckContext` (M4; DR-M4-3 strict invariant)
   - `EpiiReviewWorkbenchProjection` + `CanonRecognitionAnchor` (M5)

   M3/M4 reading discipline: `OracleFrameProjection` carries subject, deck manifest/order hash, entropy mode/provenance, spread grammar, `VakAddress`, CP position refs, DAY/NOW, Redis/Psyche, kbase/source-pool, and graph provenance handles. `SymbolicProteinProjection` carries sequence id, frame id, sequence mode, packet refs, Tarot/I-Ching/codon sequence refs, modulators, and optional Nara PatternPacket handle. `reading_frame.positions[]` / `OracleFrame.vak_address.cp[]` is the cardinality authority; spread label alone is not enough.

   M3 JSON discipline: `CouplingFlowAlignment`, when present, is a register-labelled inspector payload. It serializes symbolic skeletons, physics-descent labels, measurement-face display values, recognition handles, and mandatory caveats. It does not serialize executable formulas, renderer-computed constants, or private Nara bodies.

   Verification: `cargo test -p portal-core --test profile_projections_full_suite`; six per-domain round-trip tests pass; typed JSON fixture for M3 includes `oracleFrame`, `symbolicProtein`, `transcriptionPacket`, `symbolicSkeletons`, `physicsDescent`, `measurementFaces`, `recognitionContext`, and a caveat distinguishing `137` from `137.035999...`; reading-frame fixtures cover single, triad, sixfold, Night', and 4/5 pass.

5. **18.5 — Composition projections** *(spec-ahead-integration; consolidates Tranche 10.IG)*

   Three composition state projections:
   - `CosmicCompositionState` (1-2-3 plugin composition mount-points + load status)
   - `PersonalPoleProjection` / `PsychoidFieldProjection` handle (DR-M4-3 opaque boundary; dipyramid + Hopf-linked tori per DR-IG-6 corrected full 6+6 geometry)
   - `canon_recognition_stream: Vec<CanonRecognitionEvent>` (4-5-0 Möbius write-back stream)

   Verification: `cargo test -p portal-core --test integrated_plugin_projections`; both integrated plugin extensions consume at composition load.

6. **18.6 — Audit `s2_anchor` / `s3_anchor` placeholders** *(code-pending-closure; closes Tranche 10.4)*

   Either populate using cycle-2 S2/S3 anchor registries, or downgrade to `#[deprecated]` and remove. No greenfield.

   Verification: `grep -n 's2_anchor\|s3_anchor' Body/S/S0/portal-core/src/kernel.rs`; populated OR removed cleanly.

7. **18.7 — Land `bedrock_link: BedrockProvenanceHandle`** *(no-orphan-fill; closes CCT-6)*

   Extend `MathemeHarmonicProfileReadinessFact` with a `bedrock_link: BedrockProvenanceHandle` enum naming the substrate `.rodata` chain (file:line → .rodata → profile field → here). Readiness ledger renders bedrock_link inline per Tranche 15.6 provenance discipline.

   Verification: `grep -n "bedrock_link\|BedrockProvenanceHandle" Body/S/S0/portal-core/src/kernel.rs`; Theia provenance overlay system (Tranche 15.6 + DR-UI-3) consumes the handle via tooltip.

8. **18.8 — Typed `deposition_anchor` field** *(contradiction-decision-execution; closes DR-KB-2)*

   Add `pub deposition_anchor: DepositionAnchorProjection` to `MathemeHarmonicProfile`. `kernel.rs` is authority; bridge JSON edge (18.1) reads from struct field, not synthesises.

   Verification: `grep -n deposition_anchor Body/S/S0/portal-core/src/kernel.rs`; `cargo test -p epi-cli --test kernel_bridge_runtime_typed_json` asserts deposition_anchor in typed shape.

9. **18.9 — Land `graph_handle: GraphAnchorProjection`** *(code-pending-closure; from S2-ARCH §4)*

   Surface S2 graph anchor through profile bus so M' surfaces don't re-parse coordinates on every tick. Includes `coordinate_home: CoordinateHome` (typed enum from 17.17 dependency) + `gds_overlay_state` enum projection. DR-IG-1 `c_1_relation_family` is parallel schema work owned by Tranche 09.2 / CCT-13, not by 18.9; this row only surfaces the profile-bus graph anchor.

   Verification: `cargo test -p portal-core --test graph_handle_projection`; M0' inspector consumes typed graph handle.

## Acceptance Gate

Tranche 18 closes when:
- All nine 18.x rows land
- `cargo test -p portal-core -p epi-cli -p gateway -p gateway-contract` clean
- All eight M-extensions + two integrated plugin extensions build clean
- Theia kernel-bridge contract preflight (`07-t0-extension-contract-preflight.json`) reflects typed shapes
- `grep -rn "Record<string, unknown>" Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts` returns only the documented opaque-payload boundary (per S0-ARCH §10.5 — per-extension narrowing is M-extension owned)
- The 10.x sub-tranches in [`10-kernel-bridge-profile-contract.md`](10-kernel-bridge-profile-contract.md) are cross-referenced as "executed by Tranche 18"

## Why This Lands First

Every cycle-3 M' extension consumes `MathemeHarmonicProfile` through the kernel-bridge JSON edge. While that edge remains untyped, every downstream change requires:
- Patching one Rust struct emit
- Patching one TS interface decl
- Patching every M-extension consumer
- Patching the contract preflight blocker list

After Tranche 18:
- Rust struct change automatically surfaces typed in the JSON edge
- TS interface auto-mirrors (via codegen or paired schema)
- M-extension consumers compile-fail on rename without manual coordination
- Contract preflight reads the typed shape, not a string list

Coupling drops sharply. Every downstream Mn tranche (01-08, 11, 12, 15) becomes smaller because the JSON-edge negotiation is centralised here.
