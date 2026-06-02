# Track 01 — M0 Anuttara Reconciliation

Reconciles the [[M0']] surface across the four corpora. Substrate is unusually well-landed (`m0.c` populates 12 LUTs including `M0_CORE_RELATIONS[65]`; S2 declares an explicit `anuttara-language` property namespace at `Body/S/S2/graph-schema/src/lib.rs:1409-1433`; m0-anuttara Theia extension exists with a clean inspector contract). The chief gaps are: the six M0-X' data layers the UX names are not enumerated in the spec or surfaced as routed views; the UX `full CRUD` claim contradicts the extension contract; image-assets-on-nodes has no schema property.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md`
- Companions: `Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md`, `Idea/Bimba/Seeds/M/M0'/m0-prime-anuttara-research.md`, `Idea/Bimba/Seeds/M/M0'/epi-logos-kernel-spec.md`
- Full row-level reconciliation: `plan.runs/wave-a-m0-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/S/S2/graph-schema/src/lib.rs` relation registries (M0_CORE_RELATIONS=65; `anuttara-language` namespace); `Body/S/S0/portal-core/src/kernel.rs` `MathemeHarmonicProfile`; `Body/M/epi-theia/extensions/m0-anuttara` widget skeleton (contract `M0GatewayAction.mutatesGraphCanon: false`). Cycle 2 Track 02 owns the readable-graph + inspector spine — cycle 3 extends, never rebuilds.

## Tranches

1. **1.1 — M0-X' six-layer surface contract** *(doc-ahead-landing)*

   Patch `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` to enumerate the six M0-X' data layers (M0-0' language, M0-1' QL-structure, M0-2' relations, M0-3' time/community, M0-4' personal, M0-5' pedagogy). Extend `Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` with a `M0LayerView` discriminator. Wire M0-4' and M0-5' as bridged routes into `m4-nara` and `m5-epii` (deep-links only, no canon mutation).

   Verification: `grep -nE "M0-0'|M0-1'|M0-2'|M0-3'|M0-4'|M0-5'" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` returns all six. `test -f Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-layers.ts`. `cd Body/M/epi-theia && pnpm --filter @pratibimba/m0-anuttara build`.

2. **1.2 — Decision: CRUD vs governed-route** *(contradiction-decision; routes to DR-M0-1)*

   Either downgrade UX §7 `full CRUD` claim to `governed routed-write via M5 atelier` and patch the doc, or define `requestCanonMutation()` on `m-extension-runtime` routing through S2 graph-services with user final-validation. The current extension contract enforces `mutatesGraphCanon: false`.

   Verification: decision-register row DR-M0-1 present; `grep -nE "full CRUD|requestCanonMutation|governed routed-write" Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md` reflects the chosen patch.

3. **1.3 — Decision: Anuttara source naming canon** *(contradiction-decision; routes to DR-M0-2)*

   Publish the S2 normalized schema contract: `c_1_*` (raw exports) canonical; unprefixed `symbol`/`formulation_type` reserved as documented aliases only.

   Verification: DR-M0-2 entry; `grep -n "c_1_symbol" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` after patch shows canonical-vs-alias note.

4. **1.4 — Kernel-bridge profile-contract readiness ledger entries for M0** *(code-pending-closure; cross-link to Tranche 10)*

   Pass-through to Tranche 10. The M0-affecting pending sites are: `dataset_lut_state = 'pending-dataset-lut'` (actually on `MathemeBinaryProjection`, not `MathemeBedrockProjection` — corrected by Wave-B 10.9) at `Body/S/S0/portal-core/src/kernel.rs:797`; `m3_codec_provenance = 'tarot/amino LUTs pending'` at kernel.rs:805; `kleinFlipState` absent from `MathemeHarmonicProfile` entirely. Closure belongs to Tranche 10, not greenfield M0 work.

   Verification: `cargo check -p portal-core` succeeds; `grep -nE "pending-dataset-lut|tarot/amino LUTs pending|kleinFlipState" Body/S/S0/portal-core/src/kernel.rs` returns known sites; readiness ledger at `10-kernel-bridge-profile-contract.md` references M0 rows.

5. **1.5 — M0-3' community + clock overlay surface** *(spec-ahead-integration)*

   Add `m0.anuttara.communityClockOverlay` view to the m0-anuttara extension rendering GDS community + active-now clock overlay from S2/S3 projections — read-only, provenance-stated, no local clock. Depends on Wave-B integrated-bimba 09.6.

   Verification: `grep -n "communityClockOverlay" Body/M/epi-theia/extensions/m0-anuttara/src/common/index.ts`; `cd Body/M/epi-theia && pnpm --filter @pratibimba/m0-anuttara build`; widget renders provenance-state `blocked` until S2 GDS payload wired.

6. **1.6 — Image-assets-on-nodes contract + schema property** *(no-orphan-fill; merges with Wave-B 09.3)*

   Extend `Body/S/S2/graph-schema/src/lib.rs` `anuttara-language` namespace with `c_1_asset_uri` (StringList, public) + `c_1_asset_kind` (String) + provenance metadata. Patch `M0'-SPEC §Anuttara As Pre-Math Node Language`. Extend `m0-inspector.ts.languageFields` to render asset handles. Load-bearing schema change → user final-validation required.

   Verification: `grep -n "c_1_asset" Body/S/S2/graph-schema/src/lib.rs` returns new declarations; `cargo check -p epi-s2-graph-schema` succeeds; inspector test renders new field with provenance-state.

7. **1.7 — Kernel-S2 core-65 relations sync audit** *(code-pending-closure)*

   Define an audit method on S2 graph-services (Cypher enumerating Neo4j relations vs kernel-declared 65) + projection into `M0GraphReadinessFact[]`. Mark `ready_public_current` only when audit reports zero kernel-core mismatches.

   Verification: `grep -n "M0_CORE_RELATIONS_COUNT" Body/S/S0/epi-lib/include/m0.h` returns 65; `grep -rn "core65Audit|core_65_audit|kernelCoreAudit" Body/S/S2/graph-services/` returns method; inspector readinessFact row `kernel-core 65/65` present.

8. **1.8 — Aligned-only note: anuttara-language layer is real** *(aligned-only-note)*

   The UX claim "anuttara-language exists as a real content layer with a real contract" is confirmed across all four corpora (schema lib.rs declares `anuttara-language` namespace at line 1414+; dataset covers 109 nodes; widget renders provenance-stated fields). Cross-reference only — no work required.
