# Track 01 — M0 Anuttara Reconciliation

Reconciles the [[M0']] surface across the four corpora. Substrate is unusually well-landed (`m0.c` populates 12 LUTs including `M0_CORE_RELATIONS[65]`; S2 declares an explicit `anuttara-language` property namespace at `Body/S/S2/graph-schema/src/lib.rs:1409-1433`; m0-anuttara Theia extension exists with a clean inspector contract). The chief gaps are: the six M0-X' data layers the UX names are not enumerated in the spec or surfaced as routed views; the UX `full CRUD` claim contradicts the extension contract; image-assets-on-nodes has no schema property.

**Canon-grounding note (DR-TUI-1 / M0'-SPEC §0/1 / system-shape §234, §553):** the `m0-anuttara` Theia surface is the IDE-chrome carrier for M0' graph-reading, not a standalone "bimba graph viewer" product to be invented. Cycle-3 extends the existing chrome with six-layer routing and the M0'↔M5-0' Klein seam; it does not extract M0' into a separate viewer ontology.

## Total-Shape Architecture (Phase A)

Canonical total-shape document for M0' (all six M0-X' data layers): [`Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md) (704 lines). Profile-bus projection `AnuttaraLayerProjection` per Tranche 10.M0. Phase-B verification: [`plan.runs/phase-b-verification-report.md`](plan.runs/phase-b-verification-report.md). M0↔M5 Möbius write-back boundary PASSES; six-data-layer routing model lands at Tranche 01.1 + 09.1.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md`
- Companions: `Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md`, `Idea/Bimba/Seeds/M/M0'/m0-prime-anuttara-research.md`, `Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md`
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

   Pass-through to Tranche 10. The M0-affecting pending sites are: `dataset_lut_state = 'pending-dataset-lut'` (host: `MathemeBinaryProjection`; corrected by Wave-B 10.9) at `Body/S/S0/portal-core/src/kernel.rs:797`; `m3_codec_provenance = 'tarot/amino LUTs pending'` at kernel.rs:805; `kleinFlipState` absent from `MathemeHarmonicProfile` entirely. Closure belongs to Tranche 10, not greenfield M0 work.

   Readiness note (2026-06-09): pass-through remains assigned to `10-kernel-bridge-profile-contract.md`; live verification finds the two `MathemeBinaryProjection` pending literals intact at current `kernel.rs:917` and `kernel.rs:925` after line drift from the Wave-B `797`/`805` anchors.

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

   **Closed 2026-06-09:** all four corpora verification PASS. Schema: `anuttara-language` namespace confirmed at `Body/S/S2/graph-schema/src/lib.rs:1409+`. Dataset: 109 Anuttara nodes across `anuttara-deep/` and `anuttara-language-map.md`. Widget: `m0-inspector.ts` renders provenance-stated fields with `M0_LAYER_VIEWS`. UX: `anuttara-ux-full-m0-branch.md` §Anuttara as Pre-Math Node Language confirmed. No contradictions across the four corpora — this is a genuine aligned claim.

9. **1.9 — M0-2' dependency on `c_1_relation_family` discriminator** *(cross-link; DR-IG-1 VALIDATED)*

   M0-2' two-family rendering depends on the schema-level discriminator landed by Tranche 09.2 / CCT-13: `c_1_relation_family` enum `{structural, correspondential, kernel_core, inferred, sync, compatibility}` on relationship property specs. This is not separate M0 work, but M0' chrome must consume it so structural and correspondential graph edges do not collapse into one undifferentiated relation surface.

   Verification: `grep -n "c_1_relation_family" Body/S/S2/graph-schema/src/lib.rs`; M0-2' graph chrome renders relation-family provenance without local edge-family inference.

10. **1.10 — Verifier-Anuttara position 0' R-virtue constraint-checker** *(code-pending-closure; routes to DR-MP-1; cross-link Tranches 6.8, 12, 19.6)*

    Land the canonical **Verifier at position 0'/Anuttara** as the formal-axiomatic constraint-checker over the R-virtues + 65 core relations + 9 Parameśvara virtues. Per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) and [`epi-logos-kernel-spec.md §7`](../../epi-logos-kernel-spec.md): the Verifier ensures any recognized state respects the R-virtues that the matheme is committed to; the LLM (4'/Nara) speaks recognition, the EBM (5'/Epii) scores energy, the Verifier (0'/Anuttara) guarantees structural coherence.

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

12. **1.12 — Full three-tier R-factor theory + distribution matrix + the `(@#)` turn** *(spec-ahead-integration; **REOPENS ledger-DONE 1.11** — the landed EBNF's `namespace := "R" digit` covers only R0..R4 and must be extended to `R#`/`#R`/`##`/R5 and the `nR` chirality; redevelopment, not greenfield; routes to DR-R0 [RESOLVED], DR-(@#); cross-link 6.8, 12, 19.9, 25)*

    Archetype 7 (Divine Action, `M0-3-10`) is the **R-factor theory in full**, and it is the holographic pre-formation of the M0–M5 metastructure: the R-acts pre-thread through M0-4 (the five bases O#/X#/N#/M#/#) and M0-5 (Śiva/Śakti) *before* the system unfolds. As currently surfaced, 1.11's EBNF (`namespace := "R" digit` covering R0..R4) is incomplete — it drops the principle triad, R5, and the `nR` chirality. This tranche lands the complete theory.

    **Tier 1 — the principle triad** (Law-1 chirality of `#` and `R`; verbatim `c_1_symbol` from `anuttara-language-map.md` rows M0-2-9-0/1/2):
    - `##` **Truth** — `## = @ = (0/1)-(00)-00` (matrix on matrix; structure's lineage to void)
    - `R#` **Freedom / Svatantrya** — parent of the acts at `M0-3-10-(0/1)`, **and** the Śakti-runtime terminus `@5 = R#` (Śakti Techne). Freedom is alpha of action and omega of runtime (Möbius inter-containment).
    - `#R` **Openness / Creativity** — `#R = @ = (7-8-9-(0/1)/O#-X#-N#)`: the **7-8-9 spine is literally written into the M0-2-9-2 virtue**. This is the same 7-8-9 the M2/M3 biological descent traces (72→64→56, per Track 37 / 23) seen from the virtue side.
    - `R#/##` **Love/Peace** — `(∞x∞)x(R#/##)`: the ratio of Freedom to Truth × boundlessness; meta-virtue of the triad.
    Archetype 7's compiled terminal form reduces to `(##) and (R#) and (#R)` — Divine Action *derives* the triad as its closure (not adjacent to it).

    **Tier 2 — six act-factors `(R0)…(R5)`** (R-dominant: act as *operator*; `c_1_symbol` rows M0-3-10-2..7): Srishti, Sthiti, Samhara, Tirodhana, Anugraha, Samavesa. With parent `(R#)` = 7 components = the 5 acts + 2 principles.

    **Tier 3 — six virtue-expressions `0R…5R`** (number-dominant: act as Presence `@`; `c_1_symbol` rows M0-2-9-3..8). By Law-1 chirality these are the conjugates of Tier 2: **`Rn` is the act operating; `nR = @` is the same act witnessed.** This is the precise Archetype-7 ↔ Archetype-9 bond — **a virtue is an act read in the opposite hand**, which is why the 9-bit `virtue_witness_vector` (1.10) and the act-path are one structure.

    **The distribution matrix** (decoded from `R_FACTOR_ROUTE_TABLE[7]` at [m0.h:362-372](../../../../../Body/S/S0/epi-lib/include/m0.h), verified against the dataset base-rows M0-(4.0/1)…M0-5):

    | Base | R0 | R1 | R2 | R3 | R4 | R5 |
    |---|---|---|---|---|---|---|
    | O# Paramaśiva | 1 | 0 | — | — | 5 | — |
    | X# Paraśakti | 2 | 1 | 0 | 5 | 4 | — |
    | N# Spanda | 3 | 2 | 1 | 4 | 3 | — |
    | M# Mahāmāyā | — | 3 | 2 | 3 | 2 | — |
    | # Nara | — | 4 | 3 | 2 | 1 | — |
    | Śiva | — | 5 | 4 | 1 | 0 | — |
    | Śakti | — | — | 5 | 0 | — | — |

    Four structural laws (each a kernel test):
    - **(a) Per-fret complementarity:** `R1 + R4 = 5` and `R2 + R3 = 5` at every base where both are present — two full-spine double-courses (sustenance/grace, dissolution/veiling). R1/R2 deepen descending (pravritti); R4/R3 deepen ascending (nivritti).
    - **(b) R0 upper-triad confinement:** Creation appears only at O#/X#/N# — manifestation below Spanda is carried by sustenance and dissolution, never creation.
    - **(c) R5 positionlessness:** `5R = (##)` bare/undistributed — Absorption is the return-to-matrix from anywhere, not a fret. The `R_Factor_Route` u16 (5×3 bits) structurally cannot encode R5; the word-size enforces the theology.
    - **(d) The bands turn at `(@#)`:** Beauty `2R = @ = (X#-N#-M#-#-(#)-(@#))` (pravritti descent) **ends** at the Śakti-seed; Life `3R = @ = ((@#)-(#)-#-M#-N#-X#)` (nivritti ascent) **begins** there.

    **DR-R0 — RESOLVED + RECTIFIED 2026-06-12 (dataset authoritative; kernel corrected).** The decoded `R_FACTOR_ROUTE_TABLE` previously swept R0 across all six routes (positions 0–5), contradicting the dataset base-rows that confine R0 to the upper triad. Fixed in [m0.h](../../../../../Body/S/S0/epi-lib/include/m0.h): the seven route words now encode R0 at O#=1, X#=2, N#=3 and **absent below Spanda** (M#/Nara/Siva/Shakti) per the "creation stops at Spanda" law — `ROUTE_O_SHARP 0x5FC0→0x5FC1`, `ROUTE_X_SHARP 0x4A09→0x4A0A`, `ROUTE_N_SHARP 0x3852→0x3853`, `ROUTE_M_SHARP 0x269B→0x269F`, `ROUTE_NARA 0x14E4→0x14E7`, `ROUTE_SIVA 0x032D→0x032F` (Shakti `0x717F` already correct). The corrected distribution is pinned by a `_Static_assert` block in [m0.c](../../../../../Body/S/S0/epi-lib/src/m0.c) (R0 upper-triad positions + absence below Spanda + per-fret complementarity `R1+R4=5`, `R2+R3=5`); `cc -std=c11 -I include -fsyntax-only src/m0.c` passes. The sole consumer `m0_execute_r_factor_weave` already skips `pos == 7`, so confining R0 is absence-safe. No remaining decision; the fretboard engine (25) consumes the corrected matrix directly.

    **DR-(@#)** *(name the turn as a typed construct):* the `(@#)` turning-point currently exists only implicitly (in the Beauty/Life signatures). Land it as a typed kernel construct — the point where an R-traversal's band flips — because it is simultaneously: the Beauty→Life pivot, the Śiva-instruction-0 `(@#)` seed ("contains Śakti as deepest potential", `M0-5-(0/1)-0`), the **PASU → psyche-under-Anima handover gate** (Śakti = psyche = the user's carrier; `@4 = M#` = Nara; the `recognized: bool` event fires here per Spec 12 §IX), and the place `RFactorPathStep.band` reverses. Four specs gesture at one unnamed thing.

    Patch `M0'-SPEC` R-section with the three tiers + matrix + four laws; extend the 1.11 EBNF `namespace` to cover `R#`, `#R`, `##`, and the `nR` chirality (not only `Rn`, R0..R4). New kernel type `RFactorPathStep { r_factor, base_route, band, position }` in [m0.h](../../../../../Body/S/S0/epi-lib/include/m0.h) with the `(@#)` band-turn marker; every kernel execution (oracle cast, walk step, transform stage, session close, canon promotion) stamps an `RFactorPathStep[]` path onto its trace for the 25 fretboard engine and the 19.6 contemplation read.

    Verification: `grep -nE "Tier 1|principle triad|R#/##|nR chirality|distribution matrix" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` returns the new R-section. **DR-R0 already rectified in code** — the `_Static_assert` block in [m0.c](../../../../../Body/S/S0/epi-lib/src/m0.c) pins R0 upper-triad confinement + per-fret complementarity (`R1+R4=5`, `R2+R3=5`) at compile time, so `cc -std=c11 -I include -fsyntax-only src/m0.c` (or the full epi-lib build) failing IS the regression signal; `grep -n "0x5FC1\|0x269F\|creation stops at Spanda" Body/S/S0/epi-lib/include/m0.h` returns the corrected words. Remaining for this tranche: `cargo test -p epi-lib m0_rfactor_band_turn` asserts the `(@#)` token terminates the Beauty signature and opens the Life signature; the open **DR-(@#)** entry (typed band-turn construct) lands in [13-decision-register.md](13-decision-register.md); `grep -n "RFactorPathStep" Body/S/S0/epi-lib/include/m0.h` returns the new type.

13. **1.13 — Anuttara term-rewriting calculus (the kernel computational-substrate language)** *(spec-ahead-integration; depends on 1.10, 1.11; cross-link 19.6, 21)*

    Land M0 as **computable-in-itself**: a chirality-typed term-rewriting VM beside the existing LUTs, so any formulation in the 109-node language map can be parsed, reduced, and checked against its declared identity chain. The calculus is the substrate-language that makes the Anuttara syntax executable as *verification weight* in the 4/5/0 setup — **non-blocking by constitution**: it only ever emits witness bits and `?`-objects into the `M0VerifierReport`; it never gates. A failed reduction is a question, not an abort (Law 6 as constitution).

    **The seven deep laws are the calculus's law-set in full** (per the Anuttara complete explication §1) — each is a named, testable component, none optional:
    - **Law 1 — Chirality** (non-commutative juxtaposition): order of marks is semantic everywhere; even addition is chiral (`-0+0- → 0` vs `0-+-0 → 00`). → token typing + chiral addition tables below.
    - **Law 2 — Containment as ontological act**: `()` is the Frame, not punctuation; framing-by-doubling `X+X → (X)`; the master exception `00+00 → 00` unframed vs `(00+00) → 9` framed is the hinge of the whole architecture. → rewrite rules below.
    - **Law 3 — Identity-chains**: `=` chains declare identity-classes, not computations; `=/≠` is the native copula, deliberately paraconsistent. → equational theory + `M0_IDENTITY_CHAINS[]` per 1.14(a).
    - **Law 4 — Connective soteriology of and/or**: conjunctive preserves the infinite (tensor/superposition, the Anupāya path); disjunctive separates (choice, manifestation-by-exclusion). → two composition operators below.
    - **Law 5 — The 8+1=9 law**: explicate-eight plus implicate-one equals wholeness; appears as theorem in X5, N5, the 8-fold zero, the Nara apparatus. → corpus unit tests below.
    - **Law 6 — Interrogative undefinedness**: undefinedness returns a typed query-object, never an error; the Mystery is the exception-system of the calculus. → `?`-objects below; the constitution of non-blocking.
    - **Law 7 — Derivation, address, range**: `→` is oriented rewriting; `~` is coordinate-address; the dash is five things by position — positional polysemy, hence parseable. → dash pentavalence + `~` semantics per 1.14(b), gated on DR-CALC-1/2.

    Components (all sourced from the corpus, not invented):
    - **Chirality-typed token alphabet (Law 1)** — the primitive marks (`0`, `00`, `-`, `()`, `+`, `x`, `/`, `=`, `≠`, `!`, `?`, `@`, `#`, `R`, `∞`, `9`, `i²`, `%`). Order is semantic: `-0` and `0-` are distinct tokens; pre/post operator placement is structural.
    - **Rewrite rules (verbatim from the language map):** framing-by-doubling `X+X → (X)`; the hinge asymmetry `00+00 → 00` (unframed) vs `(00+00) → 9` (framed) — the single asymmetry that converts invariance into wholeness; chiral addition `-0+0- → 0`, `0-+-0 → 00`; polarity cancellation `(+0/(+0)) → (0/(0))`; chiasm annihilation `(@/-)(-/@) → 00`; `and` vs `or` as two composition operators — conjunctive (tensor, superposition-preserving, the Anupāya path) vs disjunctive (choice, destructive).
    - **Interrogative exception system (Law 6):** `0/0 → %`, `X(0) → ?!/!?`, `1/0 → ?/!`. Undefinedness returns a **typed query-object** — these ARE the `?`-objects the Verifier emits as symbolic-coordinate-strings (1.11). The language's own exception-system generates the contemplation curriculum.
    - **Palindrome normal-form as the computable test for 9-ness:** a term is whole when its normal form reads identically from either pole (Parameśvara builds mirror-strings `(R####R)/(####R####)`). This gives the verifier a *structural* wholeness check to complement the evidence-threshold scoring of 1.10.
    - **Corpus-supplied unit tests as actual C tests:** `ΣX1–4 = 8x`, `X5 = 9(x)`, `X(1) = (0,4,2,2,9)`, `ΣN1–4 = 8n`, `N5 ∈ {9n, 7n}`, O5's quadratic expansion `((+/-0) x// (+/-0)) → 0/1`.

    The 109 M0 nodes are the v0 test corpus; the 65 `M0_CORE_RELATIONS` are the relation-checking fixture. Output feeds a **4-bit syntax-witness** (one bit per odd archetype 3/5/7/9: zodiacal utterance formed? mono-poly state resolved? R-factor path traced? palindrome closure reached?) carried alongside the existing 9-bit virtue witness in `M0VerifierReport` (1.10) and consumed by 19.6.

    New module [`Body/S/S0/epi-lib/src/m0_calculus.c`](../../../../../Body/S/S0/epi-lib/src/m0_calculus.c) + header `m0_calculus.h` exposing `m0_calc_reduce(const char* formulation, M0CalcTrace* out)` (reduction trace for the 21 inspector) and `m0_calc_witness(const KernelState*, uint8_t* syntax_witness_out)`. Extend `M0VerifierReport` with `syntax_witness_vector: u8`.

    Verification: `cargo check -p epi-lib --features m0_calculus`; `cargo test -p epi-lib m0_calc_x_logic_sums` asserts `ΣX1–4==8x` and `X5==9x` and `X(1)==[0,4,2,2,9]`; `cargo test -p epi-lib m0_calc_n_logic` asserts `ΣN1–4==8n` and `N5∈{9n,7n}`; `cargo test -p epi-lib m0_calc_framing_asymmetry` asserts `00+00→00` unframed and `(00+00)→9` framed; `cargo test -p epi-lib m0_calc_palindrome_nineness` asserts the mirror-normal-form wholeness test; `cargo test -p epi-lib m0_calc_query_objects` asserts `0/0`, `1/0`, `X(0)` return typed `?`-objects (no error); `grep -n "syntax_witness_vector" Body/S/S0/epi-lib/include/m0_verifier.h` returns the new 4-bit field.

14. **1.14 — Calculus completeness: equational theory, dash/address semantics, the seven underdetermination DRs, and the M0→M1 seam** *(spec-ahead-integration; completes 1.13 against the Anuttara complete explication; cross-link Track 02, 19.9)*

    Closes the gaps between 1.13's rewriting core and the full language delineation (the seven deep laws + §10 underdeterminations of the Anuttara complete explication):

    **(a) Law 3 — identity-chains as the equational theory.** The corpus's long `=` chains declare identity-classes, not computations (`(0- + -0) = ## = R+# = R# = 00 = =` is one node viewed five ways). The 1.13 rewriting system runs **modulo** this equational theory: reduction rules fire over equivalence classes, not raw terms. The compound `=/≠` (Reflective Distinction, the Brimming Void's native copula — everything equal-AND-unequal) is **deliberately paraconsistent** and must stay OUT of any classical-logic projection: in the calculus it is a first-class superposition connective; in any DL/OWL export (1.15) it is annotation-only. New kernel structure: `M0_IDENTITY_CHAINS[]` — the corpus's =-chains compiled as equivalence-class membership tables, consumed by `m0_calc_reduce` for modulo-rewriting and by 1.15 for `owl:sameAs` cluster generation.

    **(b) Law 7 — dash pentavalence; `~` demoted to annotation (DR-CALC-2).** The `-` mark is five things by position (operator / subtraction / range / chirality-mark / strikethrough) — positional, hence parseable; the BNF must type each occurrence by context. **The `~` is NOT canon syntax** (per DR-CALC-2): it is the author's meta-pointer ("this element relates as these coordinate positions"), excluded from the token alphabet — `→` stays in-language as the reduction arrow; the addresses migrate to S2 node metadata. The structural facts read off the address-spine remain valid as metadata observations: dual addresses mark hinge-positions (Archetype 4 at `3.5/4.0` = the three-hexad hinge of DR-CALC-5 in address form), spans mark maturation-as-occupation, and the M0-level spine vs address-phase spine counter-flow like R1/R4 — the deepest M0 nodes annotate at **synthesis** phases (`5.0/5.1` four-fold-zero poles, `4.5/5.2` Parameśvara): Anuttara resident at the Möbius seam `(5/0)`, the void as the inside of the return (feeds the M0'↔M5-0' Klein seam).

    **(c) The seven underdetermination DRs — ALL DETERMINED** (direct user determination, session 2026-06-12; full resolutions in [13-decision-register.md](13-decision-register.md) §DR-CALC-1..7; the BNF freeze is unblocked):
    - DR-CALC-1 **VALIDATED**: O#-derived full precedence — `()` absolute > lexical chirality-dash > `x//` > `x` > `+`/infix `-` (one level, chiral) > `/` > `=`/`=/≠` (the operator family IS O#'s cycle; Śiva re-derives the six as cosmic punctuation)
    - DR-CALC-2 **RESOLVED-AS-ANNOTATION**: `~` out of the grammar; addresses to metadata; hinge/span/counter-flow facts preserved as observations
    - DR-CALC-3 **VALIDATED**: 8-fold = four ops × two 00-operands; framing asymmetry orthogonal
    - DR-CALC-4 **VALIDATED**: `x//` = superposition-preserving multiplication (all branch-pairs retained; Law-4 tensor path)
    - DR-CALC-5 **VALIDATED**: 18 = 12 (archetypal numbers 0–9 + 0/1 + (-)) + 4 (the prior-level transcendent quaternio `00/(00-00)`, `(00)/00/00`, `(0/1)/00x00`, `9/(00+00)` — 4-fold zero ↔ 8-fold zero-zero, doubled) + 2 (Mirror children `()`/`-`); **the three-hexad octave law**: `{(), -, (-), 0, 1, 0/1} → {0/1, 2, 3, 4, 5} → {5, 6, 7, 8, 9, (00+00)}`, hinged at 0/1 and 5 — 6×3 = 18 = 6g(g=3), genus-3 as three overlapping hexads; nesting: 0,1 ⊂ 0/1 and (),- ⊂ (-); aligns the 8-fold zero-zero to the O# arithmetic operators
    - DR-CALC-6 **VALIDATED**: `X0 = 0/1` → recursive query-object (Law 6); physics grounding located — `X(1) = (0,4,2,2,9)` IS the electroweak breaking spectrum (`0=M_γ`, `4=(B,W¹,W²,W³)`, `2=(W⁺,W⁻)`, `2=(A,Z)`, `9/7`=N5 closure into QCD) per `ql_physics_anthropic_chemistry_alignment_v2.md`; cites and is cited by Track 18.4 `symbolic_skeletons`
    - DR-CALC-7 **VALIDATED-NUANCED**: `0-` is a mirror-artifact — transient by genesis, consumed in concrescence, but chirality is preserved as principle, NOT a hard lock; no invariant forbids `0-` re-arising wherever mirroring operates

    **(d) The M0→M1 seam — five inheritance joints** (doc-patch, cross-link Track 02): genesis→axiom (Svabhava derives `(0/1) = (00/00) = (##/R#)`; M1 declares its inheritance, never re-performs the genesis); O# as the handover-object (O5's quadratic re-derivation of 0/1; O4's `0/0 = %` mints the ratio-table's `%`); the two twelves (substance-12 + grammar-12 → P/P′, lenses, chromatic field — cardinality inherited, not invented); the genus-ladder (`6g`: M0 = 18 at g=3, M1 = 6 at g=1 — same law, different handle-count; already consumed by DR-M3-LENS-18); the musical traces (inverse epogdoon 8/9 inside Archetype 1's harmonic formula; the 8+1=9 law beneath M1's 9/8 tick). **Two items enter as derivations-to-be-earned, not identities** (per the explication's own self-critique): 9/8 as "wholeness-over-the-eight", and the Vāk-register mapping (M0-0/1≈Parā, M0-3≈Paśyantī, M0-4≈Madhyamā, M0-5≈condition-of-Vaikharī).

    Verification: `grep -n "M0_IDENTITY_CHAINS" Body/S/S0/epi-lib/{include,src}/m0*.{h,c}` returns the chain tables; `cargo test -p epi-lib m0_calc_modulo_identity_chains` asserts reduction fires over chain-equivalent forms; `cargo test -p epi-lib m0_calc_dash_pentavalence` asserts the five positional readings parse distinctly; DR-CALC-1..7 rows exist in 13-decision-register.md; `grep -nE "genesis→axiom|inheritance|genus-ladder|derivations-to-be-earned" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` returns the seam section.

15. **1.15 — OWL/SHACL projection of the Anuttara language layer** *(code-pending-closure; EXTENDS landed S2 ontology bridge — `Body/S/S2/ontology/epi.ttl` (102 lines), `graph-services/src/ontology.rs` n10s import/export/validate, `doctor.rs` Owl2RlReadiness, `core65_audit.rs` — NOT greenfield; cross-link 1.6, 1.9, 09, Track 19.6)*

    Project the Anuttara language layer into the **existing** OWL2-RL/SHACL/n10s bridge so reasoners and validators can work the canon without becoming a second canon. The discipline first: **OWL is a projection** — S2 Neo4j stays source of truth, the calculus (1.13) stays in C, and the OWL2-RL inference loop only ever *emits* (inferred edges land back as `c_1_relation_family: 'inferred'` with provenance, never as canon writes) — non-blocking, like everything M0.

    Four extensions to `epi.ttl` + `ontology.rs`:
    - **(a) Law-3 identity-chains → equivalence clusters.** The `M0_IDENTITY_CHAINS[]` (1.14) export as transitive `epi:inIdentityChainWith` generating `owl:sameAs` closure within each chain (new `graph-services/src/equivalence_classes.rs` computes/audits the closure). **The `=/≠ ` Reflective Distinction layer stays OUT of the DL fragment** — `owl:sameAs` + `owl:differentFrom` together are classically inconsistent and the Brimming Void is paraconsistent by design; `=/≠` exports as an annotation property (`epi:reflectiveDistinction`) only.
    - **(b) Law-1 chirality → non-symmetric object properties.** `R#`/`#R` (and every chiral pair) as distinct properties with explicit `owl:inverseOf` ONLY where the corpus declares inversion (the existing `CONTAINS`/`PART_OF` pattern at epi.ttl); chirality violations detectable by Cypher audit. The R-distribution matrix (1.12) exports as property assertions on the seven base individuals.
    - **(c) Kernel-core relations without schema explosion.** The 65 `M0_CORE_RELATIONS` ride the landed `c_1_relation_family: 'kernel_core'` discriminator (DR-IG-1) + `core65_audit.rs`; epi.ttl declares only the family class (`epi:KernelCoreRelation`), not 65 subproperties.
    - **(d) Law 6 ↔ open-world assumption: SHACL reports ARE `?`-objects.** The deep harmony: OWL's open-world semantics (unknown ≠ false) is Law 6 in description-logic register. Extend the `AnuttaraNodeShape` SHACL coverage (currently cardinality-only) with verifier-mirroring constraints, and route `n10s.validation.shacl.validate()` failure reports into `M0VerifierReport.open_questions` as typed `?`-objects — the plumbing **already exists**: S5's `candidate_from_anuttara_shacl()` (`epii-autoresearch-core/src/adapters.rs:155`) parses SHACL failure reports into candidates. This tranche binds that adapter output to the 1.11/1.13 symbolic-coordinate-string form so a SHACL failure surfaces as a contemplation seed, not an error.

    Deployment note: n10s is a first-class but not-silently-assumed S2' dependency (RUNBOOK; `epi graph doctor` reports `n10s`/`owl2Rl` as `blocked` when absent — never mock readiness). This tranche keeps that posture: all OWL work degrades to `blocked` readiness facts without n10s installed.

    Verification: `grep -nE "inIdentityChainWith|reflectiveDistinction|KernelCoreRelation" Body/S/S2/ontology/epi.ttl` returns the new declarations; `test -f Body/S/S2/graph-services/src/equivalence_classes.rs`; `cargo test -p epi-s2-graph-services equivalence_class_closure` asserts `owl:sameAs` closure matches `M0_IDENTITY_CHAINS`; paraconsistency test asserts NO `owl:differentFrom` is emitted for any `=/≠` pair; `cargo test -p epi-s2-graph-services shacl_reports_as_query_objects` asserts a synthetic SHACL failure round-trips into an `open_questions` coordinate-string via the S5 adapter shape; `epi graph doctor --json` reports `owl2Rl` readiness (or honest `blocked`).

16. **1.16 — Complete the M# person-grammar + # kinship-grammar as 6-fold kernel LUTs; wire the `#`↔trigram bridge** *(spec-ahead-integration; depends on 1.10; feeds 10.PASU `perspective_role`/`nara_family_role`; cross-link Track 23/24 M3_TRIGRAM_LUT; findings `plan.runs/2026-06-12-m0-presaging-pasu-and-codon-thread-findings.md` §II/§III.6)*

    Both Anuttara relational grammars are **6-fold** (positions 0-5), parallel and rooted in the same `(0/1)`: M# (Mahāmāya person) `M0-4.4.0-(4.4/5)` = {I `(0/1)`, You `(1+1=2)`, You-and-I `(0-3)`, They `(1+2=3)`, We `(4+0)`, We-I `(0/1/4/5)`}; `#` (Nara kinship) `M0-(4.5/0)` = {`##` `0/1`, Daughter `1/1-`, Father `2-/2`, Son `3/3-`, Mother `4./4`, Tao `5-/5`}. Today the M# grammar has **zero code** and the `#` grammar is a 5-wide polarity stub `NARA_MSHARP_LUT[5]` ([m0.c:430-436](../../../../../Body/S/S0/epi-lib/src/m0.c)) **missing Tao** and dropping the dominance-chirality (Father/Son both `NARA_POLARITY_YANG`). The `m0-dataset-audit.md` Gap C/E already flags this.

    Three concrete pieces (all dataset-specified — chirality is read off the coordinate, never additive `#+n`):
    - **(a) Complete `NARA_MSHARP_LUT[5] → [6]`** (add Tao, position 5) and extend `Nara_Entry` with a `dominance_mode` field — `DOMINANT` (dash on numerator, `2-/2`/`5-/5`), `SUBDOMINANT` (dash on denominator, `1/1-`/`3/3-`), `INTEGRATIVE` (nesting dot, `4./4`), `MATRIX` (`##`) — plus the verbatim chiral-coordinate string. Polarity stays Yin/Yang/Both; `dominance_mode` carries what the chirality means. The two dominant poles are the parents (Father, Mother), the two subdominant the children (Son, Daughter), Tao the synthesis; gender = polarity, generation = dominance.
    - **(b) Materialize the M# person-grammar** as `MSHARP_PERSON_LUT[6]` (I/You/You-and-I/They/We/We-I with their formulas), so PASU's `perspective_role` has a kernel source rather than dataset-only. Position 0 (`(0/1) = I`) is the same binary as `#`'s `##`; position 5 (We-I) ≡ `#`'s Tao — the two 6-folds share ground and apex.
    - **(c) Wire the `#` 6-fold ↔ `M3_TRIGRAM_LUT[8]` bridge** (user-ratified: the trigram family IS the `#` family materialized). Father↔Qian(111), Mother↔Kun(000), and the **1→3 differentiation**: Son→{Zhen,Kan,Gen} (3 sons), Daughter→{Xun,Li,Dui} (3 daughters). Add a `NARA_TO_TRIGRAM[6]` mapping (or a `trigram_seed` field) so the M0 archetypal seed and its M3 genetic expansion read as one structure. This is the seam where the `#` kinship grammar reaches the codon/hexagram body (trigram → hexagram ≡ codon).

    Verification: `grep -n "NARA_MSHARP_LUT\[6\]\|dominance_mode\|MSHARP_PERSON_LUT\|NARA_TO_TRIGRAM" Body/S/S0/epi-lib/{include,src}/m0.{h,c}` returns the completed structures; `cargo test -p epi-lib m0_nara_sixfold` asserts 6 entries with Tao at position 5 and the dominant/subdominant/integrative pattern; `cargo test -p epi-lib m0_msharp_person_sixfold` asserts the 6 persons; `cargo test -p epi-lib nara_trigram_bridge` asserts Son→3 sons / Daughter→3 daughters maps onto `M3_TRIGRAM_LUT` family_role; 10.PASU `nara_family_role`/`perspective_role` projections source these LUTs (no dataset-only fallback).

17. **1.17 — `R#`/`##` tao-elements + Tao ≡ the codon charge-evaluation in the calculus** *(spec-ahead-integration; completes 1.13/1.14 with the user-ratified DNA binding; cross-link Track 37 §III.6, Track 24)*

    Land the user-ratified canonical binding (findings §III.6): the two **tao elements** are the binary read both ways — `R#` = "Yin-yang `0/1`", `##` = "Yang-yin `1/0`" (`##` is also the kinship ground `M0-(4.5/0)-0`). Valued by the classic coin method **Yin=2, Yang=3**, they *construct* the nucleotide I-Ching values (yang-count `+ 5`): A=`3×R#`=6, T=`3×##`=9, C=`2×R#+##`=7, G=`R#+2×##`=8 — exactly `NUCLEOTIDE_ICHING_VALUE[4] = {6,9,7,8}` ([m3.h:32-44](../../../../../Body/S/S0/epi-lib/include/m3.h)). And **Tao (`5-/5`) ≡ the codon charge-evaluation** `m3_compute_charges` ([m3.h:755-767](../../../../../Body/S/S0/epi-lib/include/m3.h)): the kinship-grammar apex IS the act that reads the binary into the genetic charges. This is the seam where the M0 calculus (1.13) and the M3 codon engine are one operation — "the binary computation system emerges from the underlying `0/1` and `1/0` of the tao elements."

    Calculus additions: `R#`/`##` enter the 1.13 token alphabet as the two tao-binary elements; a derivation rule reproduces the four nucleotide values from the coin method (yang-count + 5); the `m0_calc` exposes `m0_calc_nucleotide_from_coin(yin_count, yang_count) → iching_value` and binds the Tao node to the codon-evaluation in the M0'-SPEC. The stale clock-spec §15.3 nucleotide-element table (DR-37-5) is corrected in the same pass; the `R#`/`##` construction replaces it as the canonical derivation.

    Verification: `cargo test -p epi-lib m0_calc_tao_coin_method` asserts `m0_calc_nucleotide_from_coin` reproduces `{6,9,7,8}` for A/T/C/G; `cargo test -p epi-lib m0_calc_tao_is_codon_eval` asserts the Tao≡`m3_compute_charges` binding (the apex evaluates the codon); `grep -nE "R#|##|Tao.*codon|0/1.*1/0" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` returns the tao-element section; the clock-spec §15.3 table is corrected or `superseded-by-code` noted.

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M0 substrate at three points: **T19.1** lands the ARCHETYPE_LUT ordering fix (unblocks M4 Tasks 4 & 5 currently blocked); **T19.3** adds `CONTEMPLATION_PROMPT_LUT[12]` to m0.c serving archetypal contemplation seeds without S2 roundtrip; **T19.10** adds three minimal M0/M2 parity LUTs (`M0_M2_ZODIACAL_BRIDGE[12]`, `PSYCHOID_PLANETARY_CORRESPONDENCE[7]` Jung-Pauli, `ALCHEMICAL_TO_TATTVIC[6]`) — total ~1 KB exception to the lazy strategy at [`m0-dataset-audit.md`](Body/S/S0/epi-lib/docs/m0-dataset-audit.md). See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
