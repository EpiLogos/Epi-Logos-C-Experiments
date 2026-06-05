# Canon Audit: M0-anuttara

**Auditor scope:** Tranche 01 (M0 Anuttara reconciliation), the M0-touching rows of Tranche 10 (kernel-bridge profile-contract: 10.1, 10.2, 10.5, 10.8, 10.9, 10.M0) and Tranche 18 (typed kernel-bridge JSON edge: 18.1, 18.4, 18.6, 18.9). DR rows scrutinised in particular: DR-M0-1, DR-M0-2, DR-M0-3, DR-TUI-1 (M0' IDE-chrome reading), DR-KB-2.
**Audit date:** 2026-06-03

## Authoritative sources read

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` (BOTH pages — full read, lines 0-505 then 505-669)
- `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` (full read, 152 lines)
- `Idea/Bimba/Seeds/M/M0'/m0-prime-anuttara-research.md` (full read, 97 lines)
- `Idea/Bimba/Seeds/M/M0'/epi-logos-kernel-spec.md` (full read, 496 lines)
- `Idea/Bimba/Seeds/M/M0'/the-matheme-of-the-field-differential.md` (read, first 200 lines covering 0/1 → 4+2 → 5→0 explication — substrate-level philosophical canon)
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (full read, 611 lines)
- `Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md` (full read, 244 lines)
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/01-m0-anuttara-reconciliation.md` (full read, 66 lines)
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/10-kernel-bridge-profile-contract.md` (full read, 151 lines)
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md` (full read, 161 lines)
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m0-reconciliation-matrix.md` (full read, 167 lines)
- `Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md` (read §0-§2.2 header + six-layer table + substrate map; ARCHITECTURE-doc-as-INPUT-only)

---

## Per-row audit

### Tranche 01 (M0 Anuttara reconciliation)

### 01.0 — Track-prose: "the chief gaps are: the six M0-X' data layers the UX names are not enumerated in the spec or surfaced as routed views; the UX `full CRUD` claim contradicts the extension contract; image-assets-on-nodes has no schema property"
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:30-38 (DR-M0-3)`; `13-decision-register.md:6-14 (DR-M0-1)`; `M0'-SPEC.md:94-99` (Open Questions / Contradiction Register names exactly the sixfold and naming gaps)
- **Current framing in tranche:** The three gaps the tranche frames as cycle-3 work are the same three DR-validated decisions (DR-M0-1, DR-M0-2/3, schema gap).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Track-prose is consistent with ratified DRs. No drift.

### 01.0.a — "M0' surface across the four corpora. Substrate is unusually well-landed"
- **Status:** ALIGNED
- **Cited:** `M0'-SPEC.md:26-28` (Canonical Substrate Anchors); `wave-a-m0-reconciliation-matrix.md:28` (row 1 ALIGNED confirming `M0_CORE_RELATIONS[65]`, S2 `anuttara-language` namespace, extension contract)
- **Current framing in tranche:** Substrate-citation row, correctly attributes M0 substrate as landed.
- **Recommendation:** KEEP-AS-IS

### 01.1 — M0-X' six-layer surface contract *(doc-ahead-landing)*
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:30-38 (DR-M0-3)` ("M0' has six M0-X' data layers; M0 (content) is unified. Sweep residual wording"); `anuttara-ux-full-m0-branch.md:60-76` (six M0-X' layers enumerated); `M0-ARCHITECTURE.md:54-65` (§1 six sub-coordinates table)
- **Current framing in tranche:** Patch M0'-SPEC to enumerate the six M0-X' layers; add `M0LayerView` discriminator to inspector; M0-4'/M0-5' as bridged routes (no canon mutation).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Framing matches DR-M0-3 ratification. The "bridged routes only / no canon mutation" framing of M0-4'/M0-5' is correct per Privacy Boundary (`M0'-SPEC.md:110-112`) and §M0'-2 Inferential-Language Delta (`M0'-SPEC.md:82-84`).

### 01.2 — Decision: CRUD vs governed-route *(routes to DR-M0-1)*
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:6-14 (DR-M0-1)` ("Downgrade UX §7 'full CRUD' to governed routed-write via M5 atelier. M0' is the readable-graph + summonable-inspector surface; canon mutation is M5-5 Logos Atelier's job"); `anuttara-ux-full-m0-branch.md:148-167` (the §7 paragraph the DR patches); `M0'-SPEC.md:84` ("language-construction work flows through ... Epii surfaces at M5-0' / M5-5'; M0' only routes the user there.")
- **Current framing in tranche:** Either downgrade UX §7 or define `requestCanonMutation()` routing through S2.
- **Recommendation:** AUGMENT
- **Recommendation detail:** DR-M0-1 has already ratified option (a) — downgrade to "governed routed-write via M5 atelier" with `mutatesGraphCanon: false` preserved. Tranche 01.2 should be re-stated as execution of the ratified DR-M0-1 (UX §7 patch + spec wording), not as an open decision. Add explicit cite to DR-M0-1 resolution text.

### 01.3 — Decision: Anuttara source naming canon *(routes to DR-M0-2)*
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:18-26 (DR-M0-2)` ("Coordinate-prefixed `c_1_*` is **always canonical**. Unprefixed `symbol`/`formulation_type` are documented aliases mapped through `OntologyPropertyMapping`. Rule generalizes: canon is always the coordinate-prefixed form."); `M0'-SPEC.md:98` (Open Questions item listing the naming gap)
- **Current framing in tranche:** Publish S2 normalised schema contract: `c_1_*` canonical; unprefixed reserved as aliases.
- **Recommendation:** KEEP-AS-IS

### 01.4 — Kernel-bridge profile-contract readiness ledger entries for M0 *(cross-link to Tranche 10)*
- **Status:** ALIGNED (with own internal correction noted)
- **Cited:** `10-kernel-bridge-profile-contract.md:86-90` (Tranche 10.9 "Correction: `dataset_lut_state` / `m3_codec_provenance` host struct" — these literals live on `MathemeBinaryProjection` not `MathemeBedrockProjection`); `M0'-SPEC.md:120-135` (Readiness / Test Criteria)
- **Current framing in tranche:** Pass-through to Tranche 10; names exact pending sites with line numbers, and self-corrects Wave-A's misattribution via Tranche 10.9.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Correctly downgraded to a code-pending-closure cross-link, not a greenfield item. Self-correction discipline is good.

### 01.5 — M0-3' community + clock overlay surface *(spec-ahead-integration)*
- **Status:** ALIGNED
- **Cited:** `M0'-SPEC.md:70-76` ("[[Graph Data Science|GDS]] tangent overlay showing recommended neighboring coordinates and community/ring context" — the build-facing affordances list); `M0'-SPEC.md:86-88 (§M0'-3 Graph-Inference-GDS Delta)` ("[[OWL]] inferred classes, [[SHACL]] warnings, relation-family groupings, and kernel-core relation audit badges are displayable only when S2 supplies typed provenance"); `anuttara-ux-full-m0-branch.md:71` (M0-3' "Community + temporal/episodic" row)
- **Current framing in tranche:** Add `m0.anuttara.communityClockOverlay` view; read-only; provenance-stated; no local clock.
- **Recommendation:** KEEP-AS-IS

### 01.6 — Image-assets-on-nodes contract + schema property *(no-orphan-fill; merges with Wave-B 09.3)*
- **Status:** MISSING-CITATION (in canonical M0'-SPEC, but UX-supported)
- **Cited:** `anuttara-ux-full-m0-branch.md:142-144` ("Image-assets-on-nodes fit here exactly: nodes carry asset handles (a decan's seal, an angel's sigil, a planet's glyph, a tarot card image), and the overlays *are* those assets placed by data ... M0-0' holds the asset-prop alongside symbol/formulation"); `M0'-SPEC.md:62-64` (the existing `c_1_symbol`/`c_1_formulation_type`/`c_1_complete_formulation` enumeration — extensible per Open Questions §98)
- **Current framing in tranche:** Add `c_1_asset_uri` + `c_1_asset_kind` to `anuttara-language` namespace; load-bearing schema change requiring user final-validation.
- **Canon framing:** UX cites the affordance but M0'-SPEC currently lists only seven `c_1_*` text fields. The asset extension is canonically required by UX §6 but not yet ratified by M0'-SPEC nor by a DR row. The tranche's "load-bearing → user final-validation required" gating is correctly disciplined.
- **Recommendation:** AUGMENT
- **Recommendation detail:** Add explicit "user final-validation required" gate citing the absence of DR row; flag as candidate for DR-M0-4 if it lands. Do not greenfield without DR ratification.

### 01.7 — Kernel-S2 core-65 relations sync audit *(code-pending-closure)*
- **Status:** ALIGNED
- **Cited:** `M0'-SPEC.md:130` ("Tests prove kernel-core relation status comes from a real S0/S2 sync audit of the 65 core relations; audit mismatch blocks `ready_public_current`"); `M0'-SPEC.md:99` (Open Questions: "The C kernel and S2 graph relation counts differ by design: the kernel declares the 65 core relations while Neo4j may carry broader Anuttara relation sets")
- **Current framing in tranche:** S2 graph-services audit method + `M0GraphReadinessFact[]` projection; `ready_public_current` only when zero mismatches.
- **Recommendation:** KEEP-AS-IS

### 01.8 — Aligned-only note: anuttara-language layer is real
- **Status:** ALIGNED
- **Cited:** `M0'-SPEC.md:60-64` (Anuttara As Pre-Math Node Language section confirming `c_1_symbol`, `c_1_formulation_type`, `c_1_complete_formulation` as S2-provenanced); `wave-a-m0-reconciliation-matrix.md:45` (row 18 ALIGNED)
- **Recommendation:** KEEP-AS-IS

### Tranche 10 (M0-touching rows of kernel-bridge profile-contract ledger)

### 10.1 — Profile-field readiness ledger (this document + matrix file)
- **Status:** ALIGNED
- **Cited:** `M'-SYSTEM-SPEC.md:426-450` (Required Shared MathemeHarmonicProfile field enumeration with `pointerAnchor`, `depositionAnchor`, `tick12`, `degree720` etc.); `M0'-SPEC.md:101-108` (Required MathemeHarmonicProfile Fields list)
- **Current framing in tranche:** This tranche-doc + matrix file are cycle-3's canonical profile-field SSOT.
- **Recommendation:** KEEP-AS-IS

### 10.2 — Land `MathemeHarmonicProfile.klein_flip` field + bridge JSON emit
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:308-318 (DR-IG-2)` (Klein-flip three-variant union ratified at kernel-bridge level); M0'-SPEC silent — Klein-flip is M1'/M2'/M3' producer/consumer territory, not M0' canon
- **Current framing in tranche:** Add `klein_flip` field; populate from `vimarsha_reading.rs`; drop `kleinFlipState` from M2 blocker list.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** M0' consumes the bus but does not own the Klein-flip producer/consumer side. Row is correctly scoped to the bus layer.

### 10.5 — Audit `s2_anchor` / `s3_anchor` future-anchor placeholder fields
- **Status:** ALIGNED
- **Cited:** `M0'-SPEC.md:55-58` (Backend Contract Consumed: "[S0] / [S3] expose the shared `MathemeHarmonicProfile` for the active tick and selected coordinate"; "[S3] deposition anchor gives DAY/NOW/session context")
- **Current framing in tranche:** Land emitters using cycle-2 anchor registries OR `#[deprecated]` + remove. No greenfield.
- **Recommendation:** KEEP-AS-IS

### 10.8 — Update contract preflight blocker list after 10.2 lands
- **Status:** ALIGNED
- **Cited:** dependent on 10.2 which is grounded in DR-IG-2 above.
- **Recommendation:** KEEP-AS-IS

### 10.9 — Correction: `dataset_lut_state` / `m3_codec_provenance` host struct
- **Status:** ALIGNED
- **Cited:** self-correction citing kernel.rs:797 vs Wave-A misattribution to `MathemeBedrockProjection`
- **Current framing in tranche:** doc-ahead-landing correction note.
- **Recommendation:** KEEP-AS-IS

### 10.M0 — `AnuttaraLayerProjection` profile-bus extension
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:30-38 (DR-M0-3)` (six M0-X' data layers); `M0-ARCHITECTURE.md:54-65 §1` (six-layer table — ARCHITECTURE-doc-as-INPUT)
- **Current framing in tranche:** Add `pub anuttara_layer: AnuttaraLayerProjection` to `MathemeHarmonicProfile` exposing six layer readiness facts + active-layer discriminator + `KernelCoreAuditState` for 65-relation sync. Anti-greenfield (data computed by `ontology.rs`, `gds.rs`, `sync_coordinator.rs`).
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Framing honours DR-M0-3 (six layers) AND DR-M0-1 (kernel-core audit as a readiness gate, not a write gate). Anti-greenfield discipline correctly applied.

### Tranche 18 (M0-touching rows of typed kernel-bridge JSON edge)

### 18.1 — Typed JSON shape extraction
- **Status:** ALIGNED
- **Cited:** `M0'-SPEC.md:48-58` (Backend Contract Consumed — M0' "consumes" S0/S3 profile through the bus); `M'-SYSTEM-SPEC.md:553-559` (Umbrella Authority Boundary table — KernelBridge singleton and shared profile/current projections are M'-umbrella-owned, not per-extension)
- **Current framing in tranche:** Typed `KernelBridgeProfileJsonShape` + TS mirror at kernel-bridge edge.
- **Recommendation:** KEEP-AS-IS

### 18.4 — Per-domain typed projections (M0-M5): `AnuttaraLayerProjection` row
- **Status:** ALIGNED
- **Cited:** Same as 10.M0 above: `13-decision-register.md:30-38 (DR-M0-3)`; `M0-ARCHITECTURE.md:54-65`
- **Current framing in tranche:** Six-layer projection with `KernelCoreAuditState` consolidated under 18.1 typed JSON edge.
- **Recommendation:** KEEP-AS-IS

### 18.6 — Audit `s2_anchor` / `s3_anchor` placeholders *(closes 10.5)*
- **Status:** ALIGNED
- **Cited:** as 10.5 above.
- **Recommendation:** KEEP-AS-IS

### 18.9 — Land `graph_handle: GraphAnchorProjection`
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:537-539 (DR-S2-1)` ("Land typed graph anchor on `MathemeHarmonicProfile`"); `M0'-SPEC.md:50-52` (S2 is the graph authority for "canonical nodes, typed relations, pointer web, graph geometry, and source traceability" — M0' inspector consumes typed graph handle, doesn't reparse)
- **Current framing in tranche:** Surface S2 graph anchor through profile bus so M' surfaces don't re-parse coordinates on every tick.
- **Recommendation:** KEEP-AS-IS

### Cross-cutting check: M0' as IDE chrome (DR-TUI-1 alignment)

### X.1 — Is M0' framed as a standalone extension in the tranche set, or as IDE chrome?
- **Status:** NAMED-CONFLICT (substrate/framing tension)
- **Cited (side A — DR-TUI-1 / system-shape):** `13-decision-register.md:586-618 (DR-TUI-1)` ("M0' IS the playable Bimba graph field — the graph viewer is M0' chrome, not a separate 'graph-viewer extension' ... 'M0 + M5 are integrated into the Theia shell itself: bimba-map graph viewer, canon studio, agentic control room, custom bimba-coordinate file-tree, Logos Atelier, and the M5-0 Library/Gnostic surface — all parts of the IDE's primary chrome rather than separate plugins.'"); `M0'-SPEC.md:22` ("M0' is the playable Bimba graph field. It is the first structural surface of M'")
- **Cited (side B — Tranche-01 framing):** `01-m0-anuttara-reconciliation.md:23` ("Extend `Body/M/epi-theia/extensions/m0-anuttara/src/common/m0-inspector.ts` with a `M0LayerView` discriminator"); `wave-a-m0-reconciliation-matrix.md:17-19` (treats `m0-anuttara` as a Theia extension with `PRIMARY_VIEW_ID = 'm0.anuttara.languageMap'`)
- **Current framing in tranche:** Tranche 01 + Wave-A matrix treat `m0-anuttara` as a Theia extension that needs widening (more views, sixfold layer dispatcher).
- **Canon framing:** DR-TUI-1 + `m5-prime-system-shape-and-tauri-ide-canon` §234/§553 specify M0' graph chrome IS in the IDE shell itself (`ide-shell-m0-m5` or equivalent), NOT a separately-loaded extension. The current `m0-anuttara` extension is the Theia-extension expression of M0' chrome — wiring it to the Klein-surface seam is correct work, but it should NOT be reframed as "extending an extension with new views" in a way that re-extracts M0' into "just another plugin."
- **Recommendation:** AUGMENT
- **Recommendation detail:** Tranche 01 should add a top-of-track preamble citing DR-TUI-1 + M0'-SPEC §0/1 — naming that the `m0-anuttara` Theia extension IS the IDE-chrome carrier for M0', not a separate viewer to be invented. This is preventive: while Tranche 01 does not itself propose a separate "graph-viewer extension" (the earlier drift was in Tranche 11.10, corrected by DR-TUI-1), making the IDE-chrome framing explicit here will inoculate future rebuilds from re-extracting M0'. The substrate-level work in Tranche 01 (six-layer dispatcher, M0LayerView discriminator, communityClockOverlay) is canonically correct chrome-expansion work.

### Cross-cutting check: Möbius write-back boundary (DR-M0-1)

### X.2 — Tranche 01 preamble claim "M0↔M5 Möbius write-back boundary PASSES"
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:6-14 (DR-M0-1)` ("M5-5 Logos Atelier's job (scent-following → cognate → drift → psychoid → pros-hen → Möbius write-back proposal)"); `M0'-SPEC.md:24` ("any inspection of the +1 parent, 4π toroidal recognition, or 1→2→3 manifestational spine routes onward to M1'/M2'/M3' rather than being absorbed into the M0' graph surface")
- **Recommendation:** KEEP-AS-IS

### Cross-cutting check: "M0 has no internal sixfold" sweep (DR-M0-3)

### X.3 — Tranche 01 frame "M0 (content) unified, M0' (surface) sixfold"
- **Status:** ALIGNED
- **Cited:** `13-decision-register.md:30-38 (DR-M0-3)`; `anuttara-ux-full-m0-branch.md:47-60` (the §2 "M0 (Content) vs M0' (App Surface)" section is the canonical reading); `M0-ARCHITECTURE.md:42` ("at content level M0 is Anuttara's own deep language ... without an internal sixfold. At app-surface level M0' is the bimba-map-as-held — and *it* has a sixfold")
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Framing is canonically tight. The sixfold-on-the-surface / unified-content distinction is exactly what DR-M0-3 ratifies.

---

## Drift patterns observed

The M0-anuttara tranche set is unusually well-grounded compared with what the audit brief warned to expect from cycle-3. Three drift patterns I checked for and did NOT find: (1) no invention of a standalone "bimba-graph-viewer extension" — the tranche correctly extends the existing `m0-anuttara` Theia extension as the IDE-chrome carrier; (2) no collapse of M0 (content) into M0' (surface) — the unified-content / sixfold-surface distinction tracks DR-M0-3 cleanly; (3) no inflation of M0' write authority — DR-M0-1's "governed routed-write via M5 atelier" framing is honoured throughout, and `mutatesGraphCanon: false` is preserved as the contract invariant.

The pattern of mild drift I did find is a different shape: under-citation of ratified DRs in the tranche prose. Tranche 01.2 still reads as "either downgrade UX §7 or define `requestCanonMutation()`" even though DR-M0-1 has already chosen option (a). Tranche 01.6 (image-assets-on-nodes) names the work but has no DR row backing the schema extension — the UX §6 affordance is canonically real but the schema property is unratified. The cross-cutting risk is that future rebuilds may re-extract M0' framing if Tranche 01 does not explicitly cite DR-TUI-1 / M0'-SPEC §0/1 as the IDE-chrome anchor. None of this rises to "WRONG-FRAMING" or "CONTRADICTS-RATIFIED-DR" severity — these are AUGMENT-class tightenings, not corrections.

A larger concern surfaces at the Theia-extension boundary. The Wave-A matrix correctly notes (row 11) that `M0GatewayAction.mutatesGraphCanon: false` is the load-bearing contract invariant, and DR-M0-1 explicitly preserves it. But the tranche prose uses the phrase "extension contract" in a way that risks future readers treating M0' as one Theia extension among many — when canonically it is IDE chrome that happens to be expressed AS a Theia extension. A preamble citing DR-TUI-1 would close this gap.

---

## Tranche augmentation / removal / addition recommendations

- **AUGMENT 01 (top-of-track preamble):** Add a preamble citing DR-TUI-1 (`13-decision-register.md:586-618`) + M0'-SPEC §0/1 (`M0'-SPEC.md:22`) + system-shape §234/§553 — naming that the `m0-anuttara` Theia extension IS the IDE-chrome carrier for M0', not a separate viewer to be invented. Inoculation against future re-extraction drift.

- **AUGMENT 01.2:** Restate as "execute the already-ratified DR-M0-1 resolution" not "decide between options". Cite `13-decision-register.md:6-14` in the tranche-row body. The UX §7 patch text is already specified by DR-M0-1's Action clause.

- **AUGMENT 01.6:** Add gating note that the `c_1_asset_uri` / `c_1_asset_kind` schema extension is canonically required by UX §6 (`anuttara-ux-full-m0-branch.md:142-144`) but not yet ratified by a DR row. Mark as candidate for DR-M0-4 (or extension to DR-M0-3) requiring explicit user final-validation, since it is a load-bearing schema change.

- **ADD 01.9 (proposed new row) — `c_1_relation_family` enum for two-family discriminator:** `13-decision-register.md:288-298 (DR-IG-1)` ratifies `c_1_relation_family` enum `{structural, correspondential, kernel_core, inferred, sync, compatibility}` on `RELATIONSHIP_PROPERTY_SPECS`. This was filed under Tranche 09.2 (integrated-bimba-graph), but it directly enables M0-2' two-family rendering (`anuttara-ux-full-m0-branch.md:79-86`). Add a cross-link row in Tranche 01 noting M0-2' surface dependency on 09.2 / DR-IG-1.

- **KEEP-AS-IS 01.1, 01.3, 01.4, 01.5, 01.7, 01.8** — all canonically tight per DR-M0-1/2/3 and the citations above.

- **KEEP-AS-IS 10.M0, 18.4 (M0 projection):** Both rows correctly anti-greenfield the six-layer projection over already-computed `ontology.rs` / `gds.rs` / `sync_coordinator.rs` data. No drift.

- **KEEP-AS-IS 10.1, 10.2, 10.5, 10.8, 10.9, 18.1, 18.6, 18.9** — all M0-affecting rows are bus-layer infrastructure correctly rooted in `M'-SYSTEM-SPEC.md:553-559` (umbrella ownership) and `M0'-SPEC.md:48-58` (consumer contract).

- **NEW TRANCHE PROPOSAL:** None. The M0 substrate is unusually well-landed; cycle-3 closure for M0 is a finite set of executable DR-grounded patches plus the six-layer profile-bus projection. No new closing tranche is required for M0 specifically — the AUGMENTs above are sufficient.

---

## Open questions for user

- **DR-M0-4 candidacy for image-assets-on-nodes schema extension.** UX §6 (`anuttara-ux-full-m0-branch.md:142-144`) treats nodes-carrying-asset-handles as canonical to "solar system as spatial anchor + data-driven overlays" framing. M0'-SPEC currently lists only seven `c_1_*` text fields (`M0'-SPEC.md:62-64`) and Open Questions §98 does not anticipate asset-handle extensions. The schema extension is load-bearing for M0-3' clock/community overlay rendering (since planet-glyph / decan-seal / sigil overlays are the spatial-anchor expression of M0-3'). Does this need a new DR-M0-4 row ratifying `c_1_asset_uri` + `c_1_asset_kind` as canonical alongside the seven text fields, or is Tranche 01.6's "load-bearing → user final-validation required" gating sufficient?

- **M0'-SPEC §M0'-5 status.** Tranche 01.1 implies M0-5' pedagogical layer surfaces only as "bridged routes into m5-epii" (deep-links, no canon mutation). Wave-A matrix row 10 names "Spec lacks `§M0'-5` definition" but the post-DR-M0-3 reading is that M0-5' IS canonically a layer of the M0' sixfold, even if its substrate authority routes through M5 (per `M0'-SPEC.md:82-84` §M0'-2 "M5 operational routes"). Should M0'-SPEC gain a §M0'-5 Pedagogical-Cartography Delta section explicitly, or is the cross-referenced routing to M5-0' / M5-5' sufficient? Canon-silent currently — see `M0'-SPEC.md:78-92` (§M0'-1..4 deltas present, no §M0'-5).

- **`AnuttaraLayerProjection` active-layer discriminator semantics.** 10.M0 / 18.4 specify "six layer readiness facts + active-layer discriminator". Canon (DR-M0-3, M0-ARCHITECTURE §1) does not specify whether multiple M0-X' layers can be "active" simultaneously (e.g. M0-0' language view AND M0-3' clock overlay co-rendered) or whether the discriminator is mutually exclusive. The UX §3 prose implies modes are read-through-layers, suggesting non-exclusive composition. Needs clarification before the projection lands.
