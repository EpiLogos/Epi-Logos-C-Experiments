# Wave A — M0 (Anuttara) Reconciliation Matrix

**Domain:** M0 — Anuttara (the integrated bimba-map engagement system)
**Task id:** `wave-a-m0`
**Date:** 2026-06-02
**Author:** cycle-3 reconciliation subagent

## Sources consulted

- **UX doc** — `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md` (244 lines, full read).
- **M' Seed spec** — `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` (152 lines, full read);
  companion: `Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md` (header only — 109-node coverage table).
- **Code/substrate (Body/S)** —
  `Body/S/S0/epi-lib/include/m0.h` (568 lines, full read),
  `Body/S/S0/epi-lib/src/m0.c` (832 lines, partial read — lines 1-690),
  `Body/S/S0/portal-core/src/harmonic_profile.rs` (re-exports),
  `Body/S/S0/portal-core/src/kernel.rs` (`MathemeHarmonicProfile`, `MathemeResonance72Projection`, "pending-dataset-lut" residue),
  `Body/S/S2/graph-schema/src/lib.rs` (relation registry: `CONTAINS / FAMILY_CONTAINS / ANCHORED_TO / BEDROCK / MANIFESTS / INVERTS_TO / REFLECTS_AS / DERIVES_FROM / HAS_LENS / HAS_KERNEL_RESONANCE`; `c_1_symbol`, `c_1_complete_formulation`, `c_1_formulation_type`, `c_1_formulation_breakdown` all declared under the `"anuttara-language"` namespace).
- **Theia surface** — `Body/M/epi-theia/extensions/m0-anuttara/` (package.json, `src/browser/m0-anuttara-widget.tsx`, `src/common/m0-inspector.ts`, `src/common/index.ts`). `PRIMARY_VIEW_ID = 'm0.anuttara.languageMap'`; `ALL_VIEW_IDS = ['m0.anuttara.languageMap','m0.anuttara.owlShaclInspector','m0.anuttara.rVirtuePanel']`. Extension carries an explicit `DECLARED_BLOCKERS` list.
- **Cycle-2 inheritance** — `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/02-m0-bimba-map-extension.md` (T0 readable graph; T1 source traceability; T2 Anuttara language; T3 GDS delta; T4 routing).

---

## Reconciliation Matrix

| # | Claim (UX doc) | Spec authority (M0'-SPEC) | Code/substrate evidence | Theia surface | Status |
|---|---|---|---|---|---|
| 1 | M0 (content) is a 109-node unified formal syntax (void-grammar, archetypal number language, R-virtues, Siva-Sakti) — language prior to differentiation (§2). | Spec §"Anuttara As Pre-Math Node Language" + Canonical Source Lock cite `anuttara-language-map`. | `epi-lib/include/m0.h` declares: `ARCHETYPE_LUT[12]`, `VIMARSA_TABLE[7]`, `ZODIACAL_LUT[12]`, `MONOPOLY_LUT[7]`, `DIVINE_ACT_LUT[7]`, `VIRTUE_LUT[9]`, `MIRROR_CHILDREN[2]`, `QL_STACK[5]`, `SIVA_TABLE[6]`, `SHAKTI_TABLE[6]`, `M0_CORE_RELATIONS[65]`. `m0.c` populates them. Language map dataset enumerates 109 nodes. | Widget renders `"Anuttara syntax fields"` block with provenance-state, but reads only `c_1_*` fields from S2 payloads — no kernel-LUT projection yet. | **ALIGNED** (content+spec+code agree); surface is contract-clean. |
| 2 | M0' is **sixfold** (six M0-X' data-layers: language, QL-structure, relations, time/community, personal, pedagogy) — §3 table. | Spec acknowledges six data layers implicitly via "graph view + clock + community + personal + pedagogy" §sections but does NOT enumerate the six M0-X' layers explicitly. | No layered API in `m0-inspector.ts`. Substrate supports each layer separately (S2 relations, S0 LUTs, GDS, Graphiti, etc.). | Extension declares only 3 views: `languageMap`, `owlShaclInspector`, `rVirtuePanel`. No `M0-3'/M0-4'/M0-5'` layer surfaces. | **DOC-AHEAD** — UX names six layers; spec is silent on the M0-X' enumeration; surface only covers M0-0' / M0-2' (partial). Needs spec patch + surface contract. |
| 3 | Six data-layers are six modes of holding ONE graph; "M0 unified, M0' sixfold" reading reconciles earlier "no internal sixfold" remark (§2). | Spec corrects the older "M0 has no internal sixfold" wording implicitly but never names the M0-X' layer model. | n/a (architectural framing). | n/a. | **DOC-AHEAD / CONTRADICTION-RESOLUTION** — captures and resolves a prior CONTRADICTION ("M0 has no internal sixfold" vs §3). Decision: adopt the M' sixfold reading; downgrade/retire the older language in M0'-SPEC. |
| 4 | M0 is the prior `0/1` ground; `+1` parent is **M1-5**, NOT M0 (§2 / §M0'-1 boundary delta). | Spec §M0'-1 explicitly: "M1 is where `0/1 + 1/0 = 1/1 = 100%` is defined as the `+1` parent". | `m0.h` defines M0 as `CF_VOID (00/00)` and `tetralemmic` ground states. M1' substrate (m1.h) carries the +1 spine. | Widget renders `pedagogy.priorGroundBoundary` and `pedagogy.parentAttribution` strings. The contract has the boundary affordance. | **ALIGNED** — invariant holds across all four. Any future inspector copy that says "M0 +1 parent" must be flagged CONTRADICTION. |
| 5 | The graph is "playable physics" — relation = interval, position = pitch, traversal = phrase; positions are Cl(4,2) trig generators (P0 = sin, …, P5 = cos) §4. | Spec §"Visual / Audio Interaction Model" allows optional node audition tied to profile, but does NOT specify trig-generator mapping or Cl(4,2) at M0' level. | Cl(4,2) lives in kernel: codon Cl(4,2) in `mahamaya.rs`/`codon_rotation_projection.rs`; trig-mapping not encoded as a profile field. | Audio audition not implemented in `m0-anuttara` widget. | **SPEC-AHEAD / DOC-AHEAD blend** — DOC-AHEAD because the trig-generator mapping is asserted but unwritten as a contract anywhere; SPEC-AHEAD because the spec gestures toward audition without grounding it in code. Land as a kernel-bridge profile-field tranche (route through wave-b kernel agent). |
| 6 | One substrate / three renderings (M0' graph, M2' solar field, M3' clock-wheel) over ONE `MathemeHarmonicProfile` + ONE Neo4j graph; "edits propagate to all renderings" §5, §7. | Spec §"The 0-Side Mahamaya Graph View" + Canonical Source Lock: shared Theia shell + KernelBridge + profile stream owned by `M'-SYSTEM-SPEC`. | `MathemeHarmonicProfile` lives in `portal-core/src/kernel.rs` (line 346), is exported through `harmonic_profile.rs`. S2 schema is single-graph (`GRAPH_ID = "primary"`). | Widget consumes `MathemeHarmonicProfileBoundary` via `SharedBridgeAdapter` — boundary-typed and CRUD-disclaimer-only. | **ALIGNED** at substrate, **SPEC-AHEAD** at consumption (M0' surface does not yet show the three-rendering propagation cycle). |
| 7 | Two relation families — Structural skeleton (`CONTAINS / FAMILY_CONTAINS / ANCHORED_TO / BEDROCK / MANIFESTS / INVERTS_TO / REFLECTS_AS / DERIVES_FROM / HAS_LENS / HAS_KERNEL_RESONANCE`) + Correspondential web (decan, planetary, Shem, etc.) §3.1. | Spec §"§M0'-3 Graph-Inference-GDS Delta" calls out provenance states `canonical / inferred / kernel_core / dataset_relation / review_pending`. | `graph-schema/src/lib.rs` lines 243-375 declare exactly the 10 structural relations the doc names. The "anuttara-language" namespace registry covers `c_1_*` semantic fields. **The correspondential family** lives in Parashakti datasets / Neo4j data, not in `graph-schema` typed registries. | Inspector model `M0InspectorModel.relationFamilies` declared; widget renders "Relation families" line from S2 payload (currently fallback string). | **ALIGNED** for structural family; **DOC-AHEAD / CODE-PENDING** for correspondential — registry is dataset-resident, not typed as a separate family at schema level (per spec contradiction-register §"kernel/S2 relation count differ by design"). |
| 8 | M0-3' "community + temporal/episodic" via GDS + Graphiti episodes + M3-5 world clock (§3, §9). | Spec §"§M0'-3" requires "S2 supplies typed provenance" before display; §"Backend Contract Consumed" requires S2 owns GDS. | GDS bindings exist in graph-services (not read). Graphiti runtime present in S3. | Widget has NO M0-3' clock/community panel. The contract `DECLARED_BLOCKERS` includes "Track 02 T7/T8 coordinate-native graph API parity" — parity gates the dynamic overlay. | **SPEC-AHEAD** (contract requires it) **+ DOC-AHEAD** (UX asserts the layer) — needs an M0-3' surface that consumes S2 GDS + S3 Graphiti overlays. |
| 9 | M0-4' personal layer (traversal history, resonances, the daimon render) is protected-local via Nara governance (§3, §10). | Spec §"Privacy Boundary" — must not expose raw `q_b`, `q_p`, private Nara identity; Graphiti shown as protected-local references only. | Personal identity / nara_journal substrate lives in `personal_identity.rs` / `nara_journal.rs` (portal-core). | Widget has NO personal layer panel. PRIVACY_CLASS is `public_current_with_graph_provenance` — by design excludes personal. The personal surface must live elsewhere (M4 nara extension) with an M0-4' bridge. | **ALIGNED** at boundary; **DOC-AHEAD** at the M0-4' bridge inside the unified engagement system (the UX names it as a layer of M0'; spec localises personal to Nara). Decision: either land an M0' read-only personal-traversal projection, or formally route this layer to M4-nara surface. |
| 10 | M0-5' pedagogical layer (map-compass-lens, traversal depth/breadth, next-explorations) §3, §9. | Spec §"User-Facing Surface" allows "routes into M1'…M5'" but does NOT define a pedagogical map-compass-lens contract at M0'. | M5 atelier + recommendations live in Epii surfaces; no M0' pedagogical projection exists. | Widget has NO M0-5' layer. | **DOC-AHEAD** — needs either a spec patch (M0'-SPEC §M0'-5 "Pedagogical Cartography Delta") or routing the layer to M5-epii with a stable M0' deep-link contract. |
| 11 | M0' is "full CRUD engagement system" within the IDE: read/write/traverse/delete across every layer under governance; load-bearing coordinates require user final-validation (§7). | Spec §"User-Facing Surface" and §"§M0'-4 IDE/Surface Placement Delta": daily mode = read; IDE mode = "developer-grade Anuttara syntax, OWL/SHACL, GDS, source/spec/code/test anchors, and M5 operational routes." But spec §"Anuttara As Pre-Math Node Language" says "M0' may consume normalized fields … but it must show their source/provenance status rather than treating renamed fields as renderer-owned data" — i.e. spec says READ. | S2 graph-services has CRUD APIs (assumed; not read here). Kernel substrate (`m0.c`) is `.rodata` — immutable; only Neo4j-resident fields are mutable. | Widget contract `M0GatewayAction.mutatesGraphCanon: false` — **explicitly forbids canon mutation** from M0'. `OPEN_COMMAND_ID = 'm0.openCoordinate'` plus `READ_ONLY_COMMAND_ID` and `DEPOSIT_ONLY_COMMAND_ID` — disclosure-graded reads only. | **CONTRADICTION** — UX doc §7 explicitly promises "full CRUD," but spec and surface contract both lock M0' to **governed read + routed actions**. Decision needed: (a) downgrade UX claim to "governed-routed-write via M5 atelier" or (b) define a CRUD-gateway contract that mediates writes from M0' back through S2 with provenance + final-validation. Decision-register entry. |
| 12 | Solar system as spatial anchor; angels / Shem / maqam / planetary correspondences are data-driven overlays computed from Kerykeion positions §6. | Spec is silent on solar anchor at M0' level (M0' is "graph view"). Spec §"The 0-Side Mahamaya Graph View" leaves solar/spatial framing to M2'/M3'. | No solar anchor in kernel for M0; Kerykeion natal-chart-quaternion lives in M4/personal layer. | Not in widget. | **SPEC-AHEAD / cross-domain** — properly belongs to integrated-1-2-3 cosmic engine plugin (cycle-2 plan 08), not the M0-anuttara extension. M0' inherits the solar anchor when composed in the cosmic engine surface. Note as cross-tranche dependency, not an M0-anuttara closing tranche. |
| 13 | Image-assets-on-nodes — nodes carry asset handles (decan seals, sigils, glyphs, tarot images) alongside `c_1_symbol`/`c_1_complete_formulation` §6. | Spec §"M0-0' Lang" allows "attach asset handles" in the CRUD §7 table; §"Anuttara As Pre-Math Node Language" lists `symbol`, `formulation_type`, `complete_formulation` but NOT asset/image handles. | `graph-schema/src/lib.rs` declares no `c_1_asset`, no `c_1_image_handle` property. The `"anuttara-language"` namespace covers seven `c_1_*` text fields only. | Inspector `languageFields` array has no image/asset rendering. | **DOC-AHEAD** — image-asset-on-node is asserted but unwired. Closing tranche: add `c_1_asset_handle[]` to graph-schema, plus inspector projection, gated by user final-validation (load-bearing schema change). |
| 14 | "MathemeHarmonicProfile required fields" — `tick`, `harmonic`, `diatonic`, `resonance72{legacyResonanceIndex, lensAnchorIndex}`, `pointerAnchor`, `depositionAnchor` (spec §"Required …Fields"). | Spec lists fields exhaustively. | `kernel.rs` line 346: `MathemeHarmonicProfile` carries `resonance72: MathemeResonance72Projection {legacy_resonance_index, lens_anchor_index, base_lens, helix_bit, lens_anchor, position}`. **`pending-dataset-lut`** residue at line 797 (`dataset_lut_state: "pending-dataset-lut"`); **`tarot/amino LUTs pending`** at line 805 (m3 codec provenance). Klein flip / `kleinFlipState` not present in kernel.rs (per grep). 84-state `(lens,mode)` not surfaced as a single typed field. | Widget consumes `MathemeHarmonicProfileBoundary` via bridge — boundary type only, no field-by-field projection. | **CODE-PENDING** — `pending-dataset-lut` + missing `kleinFlipState` + missing 84-state field are the named kernel-bridge blockers. M0' surface cannot light up beyond `pending` until those land. Route to wave-B kernel-bridge / profile-contract agent (NOT an M0-anuttara greenfield tranche). |
| 15 | Cl(4,2) runs at four scales (M1 ring · M3 codon · M4 personal · Kerykeion natal) and "is the algebra recognising itself across scale" §8. | Out of M0' scope; spec routes 4π / spine detail to M1'/M2'/M3'. | Codon Cl(4,2) in `codon_rotation_projection.rs`; M1 ring + quaternion in `quaternion.rs`; M4 personal in `personal_identity.rs`. Verify **one algebra in code, not four**. | Not in M0 widget. | **SPEC-AHEAD / cross-domain** — properly Wave-B / M1/M3/M4 reconciliation domain. Note for wave-B kernel-bridge agent: confirm single-algebra invariant. |
| 16 | Anuttara CRUD writes route through S2 graph-services with provenance, reversible by deprecation, no renderer-local source of truth §7, §10. | Spec §"§M0'-2 Inferential-Language Delta" and §"Privacy Boundary": writes must route via Body/S/S0/epi-lib/include/ontology.h + Epii surfaces at M5-0' / M5-5'; M0' "only routes the user there." | S2 graph-services owns mutation paths (assumed; not read). `m0.c` writes are .rodata — immutable. | `M0GatewayAction.mutatesGraphCanon: false` enforces this at TypeScript type level. | **ALIGNED** — surface contract correctly forbids M0' canon mutation; UX "full CRUD" claim (row 11) is the load-bearing tension. |
| 17 | Anuttara source naming inconsistency: dataset exports `c_1_symbol` / `c_1_complete_formulation`; specs sometimes call them `symbol` / `formulation_type`. | Spec §"Open Questions" explicitly lists this as an unresolved naming gap pending an S2 normalized schema contract. | Schema declares both spaces (`c_1_*` raw + spec-normalized alias) in the `"anuttara-language"` registry — but with **two different parallel namings**, not one normalized form. | Inspector reads `c_1_*` from S2 payload + renders provenance state. | **CONTRADICTION (open question, named)** — needs decision-register entry. Decision: publish the S2 normalized schema contract (e.g. retain `c_1_*` as canonical; treat `symbol` / `formulation_type` as deprecated aliases). |
| 18 | Anuttara language is a real "content layer with a real contract" (UX §3 column 1) — `anuttara-language-map` is the named seed. | Spec cites `anuttara-language-map` as a Required-Reading companion. | Graph-schema declares `"anuttara-language"` as a typed property namespace (lib.rs line 1414+); `c_1_symbol` (107/109), `c_1_complete_formulation` (67/109), `c_1_formulation_breakdown` (49/109), `c_1_primary_designation` (108/109), `c_1_name` (109/109) populated per dataset. | Widget renders these fields with provenance-state. | **ALIGNED** — `anuttara-language` IS a real content layer with a real S2 contract. UX claim is true. |
| 19 | Six data layers must be navigable as a single integrated graph (one entry point, six modes of reading the same graph) §3, §12 mantra. | Spec lacks the unified-six-mode contract; treats each layer as independent backend consumption. | Substrate supports each layer; no "M0' six-mode dispatcher" exists. | Widget has three views (`languageMap`, `owlShaclInspector`, `rVirtuePanel`); not six, and not organised as "six modes of holding one graph." | **DOC-AHEAD** — needs an M0' six-mode navigation contract (UI grouping + read-mode metadata + bridge command). Closing tranche. |
| 20 | The 65 core relations (`M0_CORE_RELATIONS`) are kernel-resident; Neo4j may carry broader Anuttara relation sets; mismatches in the core-65 audit block `ready_public_current` (spec test §"Readiness/Test Criteria"). | Spec §"Open Questions" — "kernel declares 65 core relations while Neo4j may carry broader Anuttara relation sets." | `m0.h` declares `#define M0_CORE_RELATIONS_COUNT 65u`; `m0.c` populates the 65 entries. S2 schema includes `KERNEL_RESONANCE_RELATION = "HAS_KERNEL_RESONANCE"` and has indexes for kernel audit. | Inspector model has `readinessFacts` array with `kernel_core` state but no audit-result panel. | **CODE-PENDING / SPEC-AHEAD** — kernel-S2 sync audit exists in spec law but not in surface output. Needs a kernel-core-relations audit projection from S2 to the M0 widget. |

---

## Anomalies (Decision register candidates)

### CONTRADICTIONS

- **C-M0-01 (row 11) — "Full CRUD" vs surface contract `mutatesGraphCanon: false`.** UX doc §7 promises full CRUD in IDE mode; spec §"§M0'-2" + extension contract explicitly forbid M0' canon mutation. **Decision needed:** either downgrade the UX claim to "governed routed-write via M5" or define a CRUD-gateway contract that mediates writes from M0' back through S2 + user final-validation. Routes to user final-validation per the ur-process.
- **C-M0-02 (row 17) — Source naming inconsistency.** Listed in spec §"Open Questions" but no decision exists. `c_1_symbol` (dataset) vs `symbol` (spec prose). **Decision needed:** publish S2 normalized schema contract and pick a canonical name.
- **C-M0-03 (row 3) — Old "M0 has no internal sixfold" wording in earlier specs vs new sixfold M0' reading.** UX §2 resolves the contradiction. **Decision needed:** retire/rephrase any residual "M0 has no internal sixfold" claims in the M' Seed corpus.

### CODE-PENDING (kernel-bridge / profile-contract blockers; do not greenfield)

- **CP-M0-01 (row 14) — `dataset_lut_state: "pending-dataset-lut"`** in `kernel.rs` line 797 — the M0/M3 dataset LUT contract is unfinished. Owning spec: M3'-SPEC + kernel-bridge profile-contract. Unblocks: M0' readiness beyond `pending` once `MathemeBedrockProjection` and `MathemeChromaticProfile` provenance flips from `pending-dataset-lut` to a populated LUT.
- **CP-M0-02 (row 14) — `tarot/amino LUTs pending`** in `kernel.rs` line 805 — m3 codec provenance line. Same owning spec.
- **CP-M0-03 (row 14) — `kleinFlipState` not in kernel** — grep finds zero hits. Owning spec: M2'-SPEC / kernel-bridge profile-contract. Unblocks: any UX claim that mentions Klein-double-cover or implicate-flip rendering.
- **CP-M0-04 (row 20) — kernel-S2 core-65 audit projection absent.** Owning spec: S2 graph-services + M0'-SPEC §"Readiness/Test Criteria". Unblocks: `ready_public_current` badge becoming true on the M0 widget.

### ORPHANS

- **O-M0-01 (row 2) — M0-X' six-layer surface owners.** Of the six declared M0' data-layers, only M0-0' (language) and M0-2' (relations, partial) have an owner in the m0-anuttara extension. M0-1' (QL-structure), M0-3' (time/community), M0-4' (personal), M0-5' (pedagogy) have no carrier in the extension contract. Either each layer gets a co-owner extension (m1/m3/m4/m5) bridged into M0' via a sub-panel, or M0' grows to host all six. **No-orphan-audit candidate.**
- **O-M0-02 (row 13) — Image-assets-on-nodes** has no carrier. Spec mentions "attach asset handles" in passing; no schema property, no surface, no governance gate. Needs explicit owner.

---

## Proposed Cycle-3 Tranches

Anti-greenfield-rule applied: S0/S2 substrate is consume-as-is or audit/verify; Body/M/epi-theia extension exists and is consumed; new ownership is M' product-surface contract only.

### 1.1 — Doc-ahead landing: M0-X' six-layer surface contract

- **Classification:** `doc-ahead-landing`
- **Owner:** m0-anuttara extension + M0'-SPEC patch
- **Cycle 2 substrate inheritance:** consume as-is — `Body/S/S2/graph-schema/src/lib.rs` relation registries; consume as-is — `Body/S/S0/portal-core/src/kernel.rs` profile fields; consume as-is — `Body/M/epi-theia/extensions/m0-anuttara/` widget skeleton.
- **Deliverable:** Patch `M0'-SPEC.md` to explicitly enumerate the six M0-X' data layers (mirror UX §3 table). Extend `m0-inspector.ts` to declare `M0LayerView = 'language' | 'ql-structure' | 'relations' | 'community-time' | 'personal-bridge' | 'pedagogy-bridge'` and route panels accordingly. Wire M0-4' and M0-5' as bridged routes into m4-nara and m5-epii (no canon-mutation; deep-links only).
- **Verification:**
  - `grep -n "M0-0'\|M0-1'\|M0-2'\|M0-3'\|M0-4'\|M0-5'" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` returns rows for all six.
  - `test -f Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-layers.ts`
  - `cd Body/M/epi-theia && pnpm --filter @pratibimba/m0-anuttara build`

### 1.2 — Contradiction decision: CRUD vs governed-route (C-M0-01)

- **Classification:** `contradiction-decision`
- **Owner:** user final-validation (per ur-process)
- **Cycle 2 substrate inheritance:** consume as-is — extension contract `M0GatewayAction.mutatesGraphCanon: false`.
- **Deliverable:** Decision-register entry in `13-decision-register.md` (cycle-3 plan): either (a) downgrade UX §7 wording to "governed routed-write via M5 atelier" + patch UX doc + spec, or (b) define a CRUD-gateway contract on m-extension-runtime that surfaces a `requestCanonMutation()` method routing to S2 graph-services with user final-validation. Result drives subsequent surface work.
- **Verification:**
  - `grep -n "full CRUD\|requestCanonMutation\|governed routed-write" Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md` after patch.
  - decision register row present.

### 1.3 — Contradiction decision: Anuttara source naming (C-M0-02)

- **Classification:** `contradiction-decision`
- **Owner:** user final-validation + S2 graph-services
- **Cycle 2 substrate inheritance:** consume as-is — `Body/S/S2/graph-schema/src/lib.rs` "anuttara-language" namespace (both `c_1_*` and aliased forms already present).
- **Deliverable:** Publish "S2 normalized schema contract" decision in `13-decision-register.md`. Decision: keep `c_1_*` raw exports as canonical; reserve unprefixed names (`symbol`, `formulation_type`) as documented spec-prose aliases only.
- **Verification:**
  - `grep -n "c_1_symbol" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` after patch shows the canonical-vs-alias note.
  - decision register row present.

### 1.4 — Code-pending closure: kernel-bridge profile-contract readiness ledger for M0

- **Classification:** `code-pending-closure`
- **Owner:** Wave-B kernel-bridge / profile-contract agent
- **Cycle 2 substrate inheritance:** consume as-is — `MathemeHarmonicProfile` exists at `portal-core/src/kernel.rs:346`; audit/verify — `pending-dataset-lut` (line 797), `tarot/amino LUTs pending` (line 805); audit/verify — `kleinFlipState` absence.
- **Deliverable:** Add the M0-relevant rows to the wave-B kernel-bridge readiness ledger. Name each blocker, its owning spec, the contract that unblocks it. NO greenfield rebuild — the closure work belongs to the kernel-bridge tranche, not M0-anuttara.
- **Verification:**
  - `cargo check -p portal-core` succeeds (baseline).
  - `grep -n "pending-dataset-lut\|tarot/amino LUTs pending\|kleinFlipState" Body/S/S0/portal-core/src/kernel.rs` returns exactly the known pending sites; new code adds no new `pending-*` strings.
  - readiness ledger present at `<plan_folder>/10-kernel-bridge-profile-contract.md` with M0 rows.

### 1.5 — Spec-ahead integration: M0-3' GDS-+-clock overlay surface

- **Classification:** `spec-ahead-integration`
- **Owner:** m0-anuttara extension + S2 graph-services projection
- **Cycle 2 substrate inheritance:** consume as-is — S2 GDS bindings (Track 02 T3 owns these); consume as-is — Graphiti runtime in S3; consume as-is — `world_clock` in M3 substrate.
- **Deliverable:** Add `m0.anuttara.communityClockOverlay` view to m0-anuttara extension. Render GDS community + active-now clock overlay from S2/S3 projections. Read-only; provenance-stated; no local clock.
- **Verification:**
  - `grep -n "communityClockOverlay\|m0.anuttara.communityClockOverlay" Body/M/epi-theia/extensions/m0-anuttara/src/common/index.ts`
  - extension build passes.
  - widget renders provenance-state `blocked` until S2 GDS payload is wired.

### 1.6 — Doc-ahead landing + spec patch: image-assets-on-nodes (O-M0-02)

- **Classification:** `doc-ahead-landing`
- **Owner:** S2 graph-schema + m0-anuttara inspector
- **Cycle 2 substrate inheritance:** extend — `Body/S/S2/graph-schema/src/lib.rs` "anuttara-language" property namespace (currently 7 text fields; extending with one asset-handle field).
- **Deliverable:** Add `c_1_asset_handle` (or `c_1_asset_refs[]`) property to "anuttara-language" namespace in graph-schema with provenance metadata. Patch M0'-SPEC §"Anuttara As Pre-Math Node Language" to list it. Extend `m0-inspector.ts.languageFields` to render asset handles. **Load-bearing schema change → user final-validation required.**
- **Verification:**
  - `grep -n "c_1_asset" Body/S/S2/graph-schema/src/lib.rs` returns the new declaration.
  - `cargo check -p graph-schema` succeeds.
  - inspector test renders the new field with provenance-state.

### 1.7 — Audit/verify: kernel-S2 core-65 relations sync audit (CP-M0-04)

- **Classification:** `code-pending-closure`
- **Owner:** S2 graph-services + m0-anuttara inspector readinessFacts panel
- **Cycle 2 substrate inheritance:** audit/verify — `m0.c` `M0_CORE_RELATIONS[65]` is .rodata; audit/verify — S2 has `KERNEL_RESONANCE_RELATION` indexes.
- **Deliverable:** Define the audit method on S2 graph-services (a Cypher query enumerating relations Neo4j carries vs the kernel-declared 65) + projection into `M0GraphReadinessFact[]`. Mark `ready_public_current` only when audit reports zero kernel-core mismatches.
- **Verification:**
  - `grep -n "M0_CORE_RELATIONS_COUNT" Body/S/S0/epi-lib/include/m0.h` confirms 65.
  - `grep -n "core65Audit\|core_65_audit\|kernelCoreAudit" Body/S/S2/graph-services/` returns the audit method.
  - inspector readinessFact row "kernel-core 65/65" present.

### 1.8 — Aligned-only note: anuttara-language is a real content layer (row 18)

- **Classification:** `aligned-only-note`
- **Owner:** documentation
- **Deliverable:** Note in the cycle-3 overview that the UX claim "anuttara-language exists as a real content layer with a real contract" is confirmed across all four corpora; no work required.
- **Verification:** no-op (note in 00-overview).

---

## Notes for the controller

- The m0-anuttara extension is solid; its `DECLARED_BLOCKERS` already names the two upstream-Track gates ("Track 02 T7/T8 coordinate-native graph API parity"; "Track 01 profile and pointer anchors"). Cycle-3 should NOT rebuild any of this — the extension is consume-as-is.
- The single largest M0 finding is the **sixfold gap** (row 2): the UX names six M0-X' data layers; the spec acknowledges them only in pieces; the surface has three views. Tranche 1.1 lands the contract; tranches 1.5 + cross-extension bridges (m4, m5) ship the missing layers.
- The CRUD vs governed-read contradiction (row 11) is the only load-bearing decision on this domain; it routes to user final-validation per the ur-process.
- All other findings are either ALIGNED (the substrate work has actually been done — `m0.h` is dense, the language map is real, the schema declares the "anuttara-language" namespace) or are wave-B kernel-bridge concerns (rows 5, 14, 15) and should not be relitigated as M0-anuttara tranches.
