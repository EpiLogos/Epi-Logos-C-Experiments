# Track 01 — M0 Anuttara Reconciliation

Reconciles the [[M0']] surface across the four corpora. Substrate is unusually well-landed (`m0.c` populates 12 LUTs including `M0_CORE_RELATIONS[65]`; S2 declares an explicit `anuttara-language` property namespace at `Body/S/S2/graph-schema/src/lib.rs:1409-1433`; m0-anuttara Theia extension exists with a clean inspector contract). The chief gaps are: the six M0-X' data layers the UX names are not enumerated in the spec or surfaced as routed views; the UX `full CRUD` claim contradicts the extension contract; image-assets-on-nodes has no schema property.

**Canon-grounding note (DR-TUI-1 / M0'-SPEC §0/1 / system-shape §234, §553):** the `m0-anuttara` Theia surface is the IDE-chrome carrier for M0' graph-reading, not a standalone "bimba graph viewer" product to be invented. Cycle-3 extends the existing chrome with six-layer routing and the M0'↔M5-0' Klein seam; it does not extract M0' into a separate viewer ontology.

## Total-Shape Architecture (Phase A)

Canonical total-shape document for M0' (all six M0-X' data layers): [`Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md) (704 lines). Profile-bus projection `AnuttaraLayerProjection` per Tranche 10.M0. Phase-B verification: [`plan.runs/phase-b-verification-report.md`](plan.runs/phase-b-verification-report.md). M0↔M5 Möbius write-back boundary PASSES; six-data-layer routing model lands at Tranche 01.1 + 09.1.

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

2. **1.2 — Execute DR-M0-1: CRUD downgraded to governed-route** *(doc-ahead-landing; DR-M0-1 VALIDATED)*

   Patch UX §7 to `governed routed-write via M5 atelier` and preserve the current extension contract invariant `mutatesGraphCanon: false`. No `requestCanonMutation()` path lands on M0'. Canon mutation routes through M5-5 Logos Atelier review / dry-run / governed-promote per DR-M0-1.

   Verification: `grep -nE "full CRUD|requestCanonMutation|governed routed-write" Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md` reflects the DR-M0-1 patch; M0' inspector retains `mutatesGraphCanon: false`.

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

   Extend `Body/S/S2/graph-schema/src/lib.rs` `anuttara-language` namespace with `c_1_asset_uri` (StringList, public) + `c_1_asset_kind` (String) + provenance metadata. Patch `M0'-SPEC §Anuttara As Pre-Math Node Language`. Extend `m0-inspector.ts.languageFields` to render asset handles. Load-bearing schema change → user final-validation required; track as candidate **DR-M0-4** or explicit extension to DR-M0-3 before implementation.

   Verification: `grep -n "c_1_asset" Body/S/S2/graph-schema/src/lib.rs` returns new declarations; `cargo check -p epi-s2-graph-schema` succeeds; inspector test renders new field with provenance-state.

7. **1.7 — Kernel-S2 core-65 relations sync audit** *(code-pending-closure)*

   Define an audit method on S2 graph-services (Cypher enumerating Neo4j relations vs kernel-declared 65) + projection into `M0GraphReadinessFact[]`. Mark `ready_public_current` only when audit reports zero kernel-core mismatches.

   Verification: `grep -n "M0_CORE_RELATIONS_COUNT" Body/S/S0/epi-lib/include/m0.h` returns 65; `grep -rn "core65Audit|core_65_audit|kernelCoreAudit" Body/S/S2/graph-services/` returns method; inspector readinessFact row `kernel-core 65/65` present.

8. **1.8 — Aligned-only note: anuttara-language layer is real** *(aligned-only-note)*

   The UX claim "anuttara-language exists as a real content layer with a real contract" is confirmed across all four corpora (schema lib.rs declares `anuttara-language` namespace at line 1414+; dataset covers 109 nodes; widget renders provenance-stated fields). Cross-reference only — no work required.

9. **1.9 — M0-2' dependency on `c_1_relation_family` discriminator** *(cross-link; DR-IG-1 VALIDATED)*

   M0-2' two-family rendering depends on the schema-level discriminator landed by Tranche 09.2 / CCT-13: `c_1_relation_family` enum `{structural, correspondential, kernel_core, inferred, sync, compatibility}` on relationship property specs. This is not separate M0 work, but M0' chrome must consume it so structural and correspondential graph edges do not collapse into one undifferentiated relation surface.

   Verification: `grep -n "c_1_relation_family" Body/S/S2/graph-schema/src/lib.rs`; M0-2' graph chrome renders relation-family provenance without local edge-family inference.

10. **1.10 — Verifier-Anuttara position 0' R-virtue constraint-checker** *(code-pending-closure; routes to DR-MP-1; cross-link Tranches 6.8, 12, 19.6)*

    Land the canonical **Verifier at position 0'/Anuttara** as the formal-axiomatic constraint-checker over the R-virtues + 65 core relations + 9 Parameśvara virtues. Per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) and [`epi-logos-kernel-spec.md §7`](../../M0'/epi-logos-kernel-spec.md): the Verifier ensures any recognized state respects the R-virtues that the matheme is committed to; the LLM (4'/Nara) speaks recognition, the EBM (5'/Epii) scores energy, the Verifier (0'/Anuttara) guarantees structural coherence.

    New module at [`Body/S/S0/epi-lib/src/m0_verifier.c`](../../../../../Body/S/S0/epi-lib/src/m0_verifier.c) (with header at [`m0_verifier.h`](../../../../../Body/S/S0/epi-lib/include/m0_verifier.h)) exposing:
    - `m0_verifier_check_state(const KernelState* state, M0VerifierReport* out)` — checks state against `VIRTUE_LUT[9]` (Parameśvara virtues at [m0.h:163](../../../../../Body/S/S0/epi-lib/include/m0.h)) + `M0_CORE_RELATIONS[65]` (canonical-relation skeleton at [m0.h:526](../../../../../Body/S/S0/epi-lib/include/m0.h)) + the four-syntax-layers (3 speech / 5 relationship / 7 action / 9 completion per Track 19.9). Returns NOT pass/fail boolean but a `M0VerifierReport` carrying `virtue_witness_vector: u16` (9-bit witness vector + per-virtue score) + `unsatisfied_constraints: Vec<SymbolicCoordinateString>` + `coherence_score: f32`.
    - `m0_verifier_emit_question(const M0VerifierReport* report, char* out_buf, size_t buf_len)` — emits a single symbolic-coordinate-string question per DR-MP-3 (e.g., `#R0-0/1/A-T7-pending?` reads: Archetype-7 Divine-Action at TCT position, why does the trajectory not witness this?). Cross-link Tranche 19.9 (3-5-7-9 syntax-layer reading) — Verifier's questions reference the syntax-layer that the trajectory failed to witness.

    Wire into gateway at `Body/S/S3/gateway/` as `s0'.verifier.{check_state,emit_question}` methods so the LLM-Nara can query the Verifier directly.

    **Operational-capacity substrate binding (per DR-MP-1 cross-reference):** the Verifier reads one canonical capacity file as its canon-corpus source:
    - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md) — Anuttara language-development is how Epii curates the symbolic-coordinate-string vocabulary the Verifier emits. The Verifier reads this file's vocabulary as the canonical namespace for symbolic-coordinate-string emission (DR-MP-3 + Tranche 1.11 EBNF grammar consumes that vocabulary).
    This file is *what Epii develops*; Tranche 1.10 names *that the kernel-side Verifier reads it as canon-corpus*. Substrate-context citation lives in `m0_verifier.c` module doc-header.

    Verification: `cargo check -p epi-lib --features m0_verifier`; `cargo test -p epi-lib m0_verifier::checks_against_virtue_lut`; `cargo test -p epi-lib m0_verifier::emits_symbolic_coordinate_string`; `grep -n "s0'.verifier" Body/S/S3/gateway-contract/src/lib.rs` returns two new methods; `grep -n "anuttara-language-development" Body/S/S0/epi-lib/src/m0_verifier.c` returns the substrate-context citation; round-trip integration test asserts verifier emits coordinate-string for a state with unwitnessed Archetype-9 wholeness.

11. **1.11 — Anuttara symbolic-coordinate-string emission protocol** *(spec-ahead-integration; routes to DR-MP-3; depends on 1.10; cross-link Tranche 5.21)*

    Specify the canonical grammar for symbolic-coordinate-string emission per DR-MP-3 ("verifier raises questions rather than passing-or-failing"). Patch [`M0'-SPEC`](../../M0'/M0'-SPEC.md) with a new section formalizing the Anuttara symbolic-coordinate-string EBNF:

    ```ebnf
    coordinate-string  := "#" namespace ("-" coordinate)+ ("-" archetype)? ("-" state-marker)? "?"
    namespace          := "R" digit  // R-virtue cycle (R0..R4 = Srishti..Anugraha)
                        | "L" digit  // L-lens (L0..L5 + L0'..L5')
                        | "M" digit  // M-branch (M0..M5)
                        | "C" digit  // C-family (C0..C5)
    coordinate         := digit+ ("/" digit+)*  // QL coordinate fragments
    archetype          := "T" digit+            // Archetype N (T7 = Ananda-Tandava, T9 = Paramesvara, etc.)
    state-marker       := "pending" | "unwitnessed" | "drift" | "incoherent" | "violated"
    ```

    Examples (concrete and binding):
    - `#R0-0/1/A-T7-pending?` — "Archetype-7 Divine-Action at TCT position, why does trajectory not witness this?"
    - `#L2-0/1/2-T9-unwitnessed?` — "Archetype-9 Wholeness at Logical-lens triadic position, where did virtue go unwitnessed?"
    - `#M4-4.4.4.4-drift?` — "Mental-pole personal-position-4.4.4.4 drift detected, what shifted?"
    - `#R3-O#X#N#-violated?` — "Tirodhana-veiling violated the operator-cycle integrity, what produced the break?"

    The LLM-Nara's `anuttara-symbolic-parse` skill (Tranche 5.21) is the canonical parser for these strings. Round-trip is the training signal per DR-MP-3.

    Verification: `grep -n "coordinate-string\|anuttara symbolic-coordinate\|EBNF" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` returns the new EBNF section; sample-corpus test asserts at least 12 distinct coordinate-string forms parse round-trip through 5.21's skill.

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M0 substrate at three points: **T19.1** lands the ARCHETYPE_LUT ordering fix (unblocks M4 Tasks 4 & 5 currently blocked); **T19.3** adds `CONTEMPLATION_PROMPT_LUT[12]` to m0.c serving archetypal contemplation seeds without S2 roundtrip; **T19.10** adds three minimal M0/M2 parity LUTs (`M0_M2_ZODIACAL_BRIDGE[12]`, `PSYCHOID_PLANETARY_CORRESPONDENCE[7]` Jung-Pauli, `ALCHEMICAL_TO_TATTVIC[6]`) — total ~1 KB exception to the lazy strategy at [`m0-dataset-audit.md`](Body/S/S0/epi-lib/docs/m0-dataset-audit.md). See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
