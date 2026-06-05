# Canon Audit: S2 graphdb-substrate

**Auditor scope:** Audit Tranche 17 S2-related sub-rows + Tranche 18.9 (graph_handle: GraphAnchorProjection) against S2/S2' seed-level SPECs, S2-ARCHITECTURE.md, and ratified DRs (DR-S2-1, DR-IG-1).
**Audit date:** 2026-06-03

## Authoritative sources read

- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` (both pages — offset 0 limit 505 + offset 506 limit 165)
- `Idea/Bimba/Seeds/S/S2/S2-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2-0-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2-1-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2-2-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2-3-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2-4-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2-5-SPEC.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/18-typed-kernel-bridge-json-edge.md`
- `Idea/Bimba/Seeds/S/S2/S2-ARCHITECTURE.md` (both pages — 1-559, 560-755)

## Per-row audit

### 17.3 — Split `graph-schema/src/lib.rs` (3,072 LOC) into 9 files
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/S/S2/S2-ARCHITECTURE.md:320-345` (Priority-1 split proposal with the exact target directory tree — `constants.rs / labels.rs / relationships/{mod,node,rel,deep_bimba}.rs / properties.rs / coordinate_law.rs / validation.rs / constraints.rs`); LOC count anchored at `S2-ARCHITECTURE.md:68-70` ("one 3072-line `graph-schema/src/lib.rs`") and `S2-ARCHITECTURE.md:322` ("`Body/S/S2/graph-schema/src/lib.rs:1-3072`").
- **Current framing in tranche:** Modular split into 9 files (constants/labels/relationships/properties/coordinate_law/validation/constraints) with re-export façade. Per S2-ARCHITECTURE §5 finding 1.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Tranche row matches the architecture proposal exactly. Blast-radius framing ("low if pub use re-exports") matches `S2-ARCHITECTURE.md:345` ("none if `pub use` re-exports are preserved in `lib.rs`").

### 17.8 — Split `graph-services/src/sync_coordinator.rs` (1,384 LOC)
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/S/S2/S2-ARCHITECTURE.md:347-370` (Priority-1 sync_coordinator split with target tree `sync/{mod, intent_types, policy, property_proposals, frontmatter_rules, code_provenance, graphiti_episode, plan, coordinator, report}.rs`); LOC anchored at `S2-ARCHITECTURE.md:349` ("`Body/S/S2/graph-services/src/sync_coordinator.rs:1-1384`") and the module manifest table at `S2-ARCHITECTURE.md:175` (`sync_coordinator | 1384 | Promotion policy, plan, validation, cypher generation, sync result`).
- **Current framing in tranche:** Split into `sync/{mod, intent_types, policy, property_proposals, frontmatter_rules, code_provenance, graphiti_episode, plan, coordinator, report}.rs`. Per S2-ARCHITECTURE §5 finding 2.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** 10-file target exactly matches the architecture proposal. Substrate cites verified against the manifest.

### 17.14 — Split `Body/S/S0/portal-core/src/dataset_import.rs` (1,655 LOC)
- **Status:** WRONG-EXTRACTION
- **Cited:** `Idea/Bimba/Seeds/S/S2/S2-ARCHITECTURE.md:471-490` (Priority-3 dataset_import split; located at `Body/S/S2/graph-services/src/dataset_import.rs:1-1655`, NOT `Body/S/S0/portal-core/`); module manifest at `S2-ARCHITECTURE.md:157` (`dataset_import | 1655 | Bimba dataset import`); S2-SPEC at `S2-SPEC.md:103` (`Body/S/S2/graph-services/src/dataset_import.rs owns canonical Bimba corpus import`); S2-2 shard at `S2-2-SPEC.md:26` (`Body/S/S2/graph-services/src/dataset_import.rs`).
- **Current framing in tranche:** Path is given as `Body/S/S0/portal-core/src/dataset_import.rs`, attributed to S2-ARCHITECTURE.md §5 finding 7.
- **Canon framing (if not ALIGNED):** Dataset import lives at `Body/S/S2/graph-services/src/dataset_import.rs` (cited `S2-ARCHITECTURE.md:471-472`); there is no `dataset_import.rs` at `Body/S/S0/portal-core/`. The architecture finding referenced is §5.7 in the architecture doc (not §5 finding 7).
- **Recommendation:** REWRITE
- **Recommendation detail:** Replace the path with `Body/S/S2/graph-services/src/dataset_import.rs` and propose the target split tree from `S2-ARCHITECTURE.md:475-487` (`dataset_import/{mod, importer, branch, plans, property_mapping, json_utils, cypher}.rs`). Substrate cite and LOC count are otherwise correct.

### 17.17 — `coordinate_home: &'static str` → typed `CoordinateHome` enum
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/S/S2/S2-ARCHITECTURE.md:372-396` (Priority-2 `coordinate_home` typed enum). The architecture explicitly names the ~30 distinct strings repeated ~150 times across `GraphLabelSpec`/`GraphRelationshipTypeSpec`/`GraphPropertySpec` and proposes the typed `CoordinateHome { Compat, Sub, Namespace, Root }` enum at `S2-ARCHITECTURE.md:380-391`. Tranche 18.9 explicitly depends on this row (`18-typed-kernel-bridge-json-edge.md:132`).
- **Current framing in tranche:** ~30 distinct strings repeated ~150 times across S2 spec tables; compiler proves home consistency. Per S2-ARCHITECTURE §5 finding 3.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Row is precise. Note dependency: 17.17 is load-bearing for 18.9 (`coordinate_home: CoordinateHome` is a field in the proposed `GraphAnchorProjection`).

### 17.21 — `Body/S/S0/luts/` subdir consolidation
- **Status:** MISSING-CITATION (out of S2 scope; S0 row only listed here because Tranche 17 groups all S-stack splits)
- **Cited:** Tranche row at `17-s-stack-modularisation.md:138-139` cites "S0-ARCHITECTURE.md §5 finding 8" which is NOT among the audit-authoritative S2 sources. The S2-ARCHITECTURE.md does NOT discuss `Body/S/S0/luts/`.
- **Current framing in tranche:** Consolidate oracle_lut, mahamaya, transcription, rotational, codon, planet_keplerian under one subdir.
- **Canon framing (if not ALIGNED):** Out of S2 audit scope (this row pertains to S0). The cycle-3 S0 audit owns final verdict.
- **Recommendation:** KEEP-AS-IS (defer to S0 auditor)
- **Recommendation detail:** Not a finding against S2 canon; flagged only because of tranche scope discipline.

### 18.9 — Land `graph_handle: GraphAnchorProjection` on `MathemeHarmonicProfile`
- **Status:** ALIGNED
- **Cited:** `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:537-539` (DR-S2-1 VALIDATED 2026-06-03: "Land typed graph anchor on `MathemeHarmonicProfile`. Depends: Tranche 18.9"); architectural source at `Idea/Bimba/Seeds/S/S2/S2-ARCHITECTURE.md:298-301` (§4.3 profile-bus gap — "no `graph_handle` or `coordinate_resolution_cache` projection on `MathemeHarmonicProfile`. M' surfaces re-resolve `coordinate` strings through `CoordinateArrayParser` on every tick. The fix per cycle-3 Tranche 10 (kernel-bridge profile-contract) would add a `graph: GraphAnchorProjection` field"); and `S2-ARCHITECTURE.md:741-744` §10.4 profile-bus extensions ("Add `graph: GraphAnchorProjection` field … `(canonical_form, depth, prefix, parent, axis)` … Add `gds_overlay_state: GdsOverlayState` enum field"). Consolidation map at `18-typed-kernel-bridge-json-edge.md:36` cross-cites S2-ARCH §4.
- **Current framing in tranche:** Surface S2 graph anchor through profile bus; includes `coordinate_home: CoordinateHome` (typed enum from 17.17 dependency) + `gds_overlay_state` enum projection.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Both the named field and the `gds_overlay_state` projection match the architecture extension. The 17.17 dependency on `CoordinateHome` is correctly named. Worth verifying with the user that the field name on the profile is `graph_handle` (per the tranche title) vs. `graph` (per `S2-ARCHITECTURE.md:298, :741`) — minor naming choice, but document once.

### Tranche 17 — "Source" attribution row for S2 architecture
- **Status:** ALIGNED
- **Cited:** `17-s-stack-modularisation.md:19` cites "S2-ARCHITECTURE.md §5 (`Body/S/S2/{graph-schema, graph-services}`)"; matches `S2-ARCHITECTURE.md:316-549` (`§5. Code Cleanup + Modularisation Findings` covering both crates).
- **Current framing in tranche:** Source attribution is "S2-ARCHITECTURE.md §5 (`Body/S/S2/{graph-schema, graph-services}`)".
- **Recommendation:** KEEP-AS-IS

### Tranche 18 — Source attribution for S2 (`S2-ARCHITECTURE.md §4`)
- **Status:** ALIGNED
- **Cited:** `18-typed-kernel-bridge-json-edge.md:10` ("S2-ARCHITECTURE.md §4 (graph_handle profile-bus extension)") matches `S2-ARCHITECTURE.md:274-313` §4 contract surface where the `graph_handle` profile-bus gap is documented at lines 297-301.
- **Recommendation:** KEEP-AS-IS

### Tranche 18 dependency on 17.6 (kernel.rs split)
- **Status:** ALIGNED (out of S2 authority scope — S0 substrate dependency, not S2)
- **Cited:** `18-typed-kernel-bridge-json-edge.md:40-42` and `17-s-stack-modularisation.md:57-61` (17.6 kernel.rs split gates Tranche 18). Although this is S0 substrate (`Body/S/S0/portal-core/src/kernel.rs`), S2-SPEC at `S2-SPEC.md:587` confirms that `s2_anchor`/`s3_anchor` placeholders are on the kernel-side profile struct; addressing them through a clean kernel.rs split is consistent with S2's "consumes from S0" boundary per `S2-ARCHITECTURE.md:568` (`From S0 (portal-core): MathemeHarmonicProfile`).
- **Recommendation:** KEEP-AS-IS

### Tranche 18.9 dependency-chain coverage of DR-IG-1 c_1_relation_family
- **Status:** MISSING-CITATION (DR-IG-1 is not directly cross-linked from 18.9, although the GraphAnchorProjection content is canonically compatible)
- **Cited:** `13-decision-register.md:288-296` (DR-IG-1 VALIDATED 2026-06-02; adds `c_1_relation_family` enum to `RELATIONSHIP_PROPERTY_SPECS` at `Body/S/S2/graph-schema/src/lib.rs`; populated via dataset_import + sync_coordinator; depends on Tranche **09.2**). The Tranche 18 consolidation map at `18-typed-kernel-bridge-json-edge.md:23-37` lists Tranches 10.x but does NOT list 09.1 or DR-IG-1 in the consolidation map; `S2-ARCHITECTURE.md:653` calls DR-IG-1 a pending closure on the schema side (~50 LOC: const, prop spec, importer extension).
- **Current framing in tranche:** 18.9 lands a typed `graph_handle` but does not name the c_1_relation_family enum as part of the profile-bus surface.
- **Canon framing (if not ALIGNED):** DR-IG-1 lands at schema layer (`graph-schema/src/lib.rs` — `RELATIONSHIP_PROPERTY_SPECS` and a typed `RELATION_FAMILY_VALUES` const per `S2-ARCHITECTURE.md:406-413`); it is owned by Tranche 09.1/09.2 (Wave-B integrated bimba reconciliation), NOT Tranche 18.
- **Recommendation:** NEW-TRANCHE-ROW (clarification, not new work)
- **Recommendation detail:** Add an explicit cross-link from Tranche 18 to Tranche 09.1/09.2 (DR-IG-1) clarifying that `c_1_relation_family` is a schema-layer landing, not a profile-bus field — so future readers don't conflate the two surfaces. Substrate cites for DR-IG-1 already exist; this is a documentation cross-link only.

### S2-ARCHITECTURE.md §5.4 — DR-IG-1 typed-constant landing
- **Status:** ALIGNED (carry-forward authority)
- **Cited:** `S2-ARCHITECTURE.md:398-428` (Priority-2 — typed `RELATION_FAMILY_VALUES` const + `RELATION_FAMILY_PROPERTY` const + `RELATIONSHIP_PROPERTY_SPECS` entry); ratified by DR-IG-1 at `13-decision-register.md:288-296`. Tranche 09.1/09.2 owns landing (per `S2-ARCHITECTURE.md:723-724`); not part of Tranche 17 or 18 directly.
- **Current framing in tranche:** Not in Tranche 17 or 18 — owned by Tranche 09.1/09.2.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Verified scope boundary. No S2-substrate row in Tranche 17/18 contradicts DR-IG-1.

### S2-architecture §10.2 "NEW Tranche" S2.A — `graph-schema` Priority-1 split
- **Status:** ALIGNED — already executed as Tranche 17.3
- **Cited:** `S2-ARCHITECTURE.md:731` ("NEW Tranche S2.A — `graph-schema/src/lib.rs` Priority-1 split (§5.1)") maps to `17-s-stack-modularisation.md:39-43` (Tranche 17.3). No new tranche needed.
- **Recommendation:** KEEP-AS-IS

### S2-architecture §10.2 "NEW Tranche" S2.B — `sync_coordinator.rs` Priority-1 split
- **Status:** ALIGNED — already executed as Tranche 17.8
- **Cited:** `S2-ARCHITECTURE.md:732` maps to `17-s-stack-modularisation.md:71-75`. No new tranche needed.
- **Recommendation:** KEEP-AS-IS

### S2-architecture §10.2 "NEW Tranche" S2.C — typed `coordinate_home` enum
- **Status:** ALIGNED — already executed as Tranche 17.17
- **Cited:** `S2-ARCHITECTURE.md:733` maps to `17-s-stack-modularisation.md:121-123`. No new tranche needed.
- **Recommendation:** KEEP-AS-IS

### S2-architecture §10.2 "NEW Tranche" S2.D — Gateway exposure of seven new methods
- **Status:** MISSING-CITATION
- **Cited:** `S2-ARCHITECTURE.md:734` (`s2.graph.gds.tangent_overlay`, `ontology_reload`, `seed_snapshot`, `core65_audit`, `promotion_dry_run`, `promotion_commit`, `relation_family_list`); also `S2-ARCHITECTURE.md:608-617` §7.3 bridge-methods-needed table. NOT visible as a Tranche 17 sub-row or Tranche 18 sub-row.
- **Current framing in tranche:** Not present in Tranche 17 or 18.
- **Canon framing (if not ALIGNED):** This is a gateway-contract concern (S3 gateway surface), with S2-side method-routing; correct owner is a Tranche 09.x extension (per `S2-ARCHITECTURE.md:723-724` for the gds.tangent_overlay piece), or a new dedicated Tranche if no existing home.
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** Add a NEW row "Gateway exposure of `s2.graph.gds.tangent_overlay` / `ontology.reload` / `seed.snapshot` / `core65.audit` / `promotion.dry_run` / `promotion.commit` / `relation_family.list`" with substrate cites at `S2-ARCHITECTURE.md:608-617` and gateway-contract location `Body/S/S3/gateway-contract/src/lib.rs:139-144`. Substantial enough to warrant its own scope; should not be quietly folded into 17 or 18.

### S2-architecture §10.2 "NEW Tranche" S2.E — Audit `epi-s1-hen-compiler-core` dev-dependency
- **Status:** MISSING-CITATION
- **Cited:** `S2-ARCHITECTURE.md:735` and `S2-ARCHITECTURE.md:546` ("dev-dependency on `epi-s1-hen-compiler-core` for tests. Verify whether `hen-compiler-core` is the right crate (Hen is S1') — possibly stale dependency. **Audit item.**"). NOT in Tranche 17 or 18.
- **Current framing in tranche:** Not present.
- **Canon framing (if not ALIGNED):** Dependency-hygiene audit; appropriate as a cycle-3 closure row (likely Tranche 14 no-orphan-audit or Tranche 16 cross-cutting closure scope).
- **Recommendation:** NEW-TRANCHE-ROW
- **Recommendation detail:** Add a small row to Tranche 14 or Tranche 16 (cross-cutting closures) flagging the dev-dependency audit. Verification: `cargo tree -p epi-s2-graph-services --target=test` shows whether `hen-compiler-core` is actually used by current tests.

### S2-architecture §10.3 New orphan — `c_1_relation_family` naming hyphen vs underscore
- **Status:** MISSING-CITATION (in tranche set)
- **Cited:** `S2-ARCHITECTURE.md:738-739` ("the `c_1_relation_family` discriminator name appears in cypher (e.g. `graph_api.rs:323` writes `'kernel-resonance'` with a HYPHEN, not underscore) but DR-IG-1 specifies `kernel_core`. **Naming-axis orphan**"). DR-IG-1 ratifies the enum members as `{structural, correspondential, kernel_core, inferred, sync, compatibility}` at `13-decision-register.md:290`.
- **Current framing in tranche:** Not surfaced in Tranche 17 or 18.
- **Canon framing (if not ALIGNED):** Naming-axis discipline: canonical enum value is `kernel_core` (underscore); existing graph data may carry hyphenated `kernel-resonance`. Audit + migration belongs with the DR-IG-1 closure (Tranche 09.1).
- **Recommendation:** AUGMENT
- **Recommendation detail:** Augment Tranche 09.1 (DR-IG-1 closure) with a sub-row to audit existing graph data for hyphenated forms and migrate to canonical underscore form. Not a Tranche 17/18 concern, but worth a cross-link so the cleanup landings see the orphan.

### S2-architecture §10.4 — Profile-bus extension for `gds_overlay_state`
- **Status:** ALIGNED (already covered in 18.9)
- **Cited:** `S2-ARCHITECTURE.md:744` ("Add `gds_overlay_state: GdsOverlayState` enum field"); Tranche 18.9 at `18-typed-kernel-bridge-json-edge.md:132` explicitly includes `gds_overlay_state` in the GraphAnchorProjection field set.
- **Recommendation:** KEEP-AS-IS

## Drift patterns observed

The Tranche 17 + 18 S2 rows are the most carefully-grounded I have audited in cycle 3 so far. The substrate cites match S2-ARCHITECTURE.md and S2-SPEC.md with two narrow exceptions:

1. **Path inversion in 17.14** — dataset_import.rs is named under `Body/S/S0/portal-core/src/` when canon places it firmly at `Body/S/S2/graph-services/src/`. This is a copy-paste class drift, not a framing drift. The LOC count (1655) and split tree (`importer / branch / plans / property_mapping / json_utils / cypher`) are correctly mirrored from the architecture proposal — only the path is wrong. The fix is mechanical.

2. **Gateway-exposure scope gap (S2.D)** — the S2-ARCHITECTURE.md explicitly names seven new gateway methods that should be exposed to M' surfaces, plus an architecture cleanup audit (S2.E hen-compiler-core dev-dep). None of these surface in Tranche 17 or 18. They are not silently inflating — the issue is the opposite: legitimate substrate-cited findings have no tranche home. This is a *missing-tranche* drift, not a wrong-framing drift.

3. **Cross-link discipline** — Tranche 18.9 consolidates the GraphAnchorProjection from S2-ARCH §4 but does not name the c_1_relation_family schema work (Tranche 09.1, DR-IG-1) as related-but-distinct. A future reader unfamiliar with cycle-3 might assume both pieces land together; canon places them in different files (profile-bus vs schema spec). A one-line cross-link in Tranche 18 would close this.

There is NO inflation pattern observed: Tranche 17 + 18 do not propose new framings, new actors, or new architectural categories that contradict the seeds-level SPECs. Both tranches are essentially substrate-mapping exercises with citations matching the architecture doc one-to-one. This is the discipline the cycle-3 audit asks for.

## Tranche augmentation / removal / addition recommendations

- **AUGMENT (REWRITE) Tranche 17.14**: Replace `Body/S/S0/portal-core/src/dataset_import.rs` with `Body/S/S2/graph-services/src/dataset_import.rs` per `S2-ARCHITECTURE.md:471-490` + `S2-SPEC.md:103`. The split target tree from the architecture is `dataset_import/{mod, importer, branch, plans, property_mapping, json_utils, cypher}.rs` — adopt this explicitly.

- **NEW TRANCHE PROPOSAL — S2.D Gateway Exposure**: New row in Tranche 09 (Wave-B integrated bimba reconciliation) or a new dedicated tranche covering gateway methods `s2.graph.gds.tangent_overlay`, `s2.graph.ontology.reload`, `s2.graph.seed.snapshot`, `s2.graph.core65.audit`, `s2.graph.promotion.dry_run`, `s2.graph.promotion.commit`, `s2.graph.relation_family.list`. Cited: `S2-ARCHITECTURE.md:608-617` + `S2-ARCHITECTURE.md:734`. Substrate location: `Body/S/S3/gateway-contract/src/lib.rs:139-144`. Wrapping existing `GraphMethodService` methods, not new substrate.

- **NEW TRANCHE PROPOSAL — S2.E hen-compiler-core dev-dep audit**: Add to Tranche 14 (no-orphan audit) or Tranche 16 (cross-cutting closures). Cited: `S2-ARCHITECTURE.md:546` + `S2-ARCHITECTURE.md:735`. Verification: explicit decision recorded in 13-decision-register.md.

- **AUGMENT Tranche 09.1 (DR-IG-1 closure)** with a sub-row auditing existing graph data for `kernel-resonance` (hyphen) vs canonical `kernel_core` (underscore). Cited: `S2-ARCHITECTURE.md:738-739` + DR-IG-1 at `13-decision-register.md:290`.

- **AUGMENT Tranche 18** with a one-line cross-link in §"Consolidation Map" or §"Why This Lands First" naming that `c_1_relation_family` schema work (Tranche 09.1, DR-IG-1) is parallel-but-distinct — does NOT land via 18.9. Cited: `13-decision-register.md:288-296` (DR-IG-1) + `18-typed-kernel-bridge-json-edge.md:130-134` (18.9).

- **VERIFY Tranche 18.9 field name** with user: tranche calls it `graph_handle`, architecture calls it `graph` (`S2-ARCHITECTURE.md:298, :741`). Both spellings appear in the cycle-3 corpus; the canonical choice should be ratified in one DR row to prevent drift.

## Open questions for user

- **Field name on `MathemeHarmonicProfile` for the S2 graph anchor**: is it `graph_handle` (Tranche 18.9 title + DR-S2-1 wording) or `graph` (S2-ARCHITECTURE.md:298 + §10.4)? The substrate is otherwise consistent; this is a naming-pin decision.

- **Should S2-architecture §10.2 NEW Tranches S2.D + S2.E be folded into existing tranches (09, 14, 16) or stand as their own row(s)?** S2.D (gateway exposure of seven methods) is sizeable enough — 7 new gateway endpoints + corresponding kernel-bridge serialization + M' surface wiring — that a dedicated row may be warranted rather than buried in 09.5. S2.E (dev-dep audit) is small and fits naturally into Tranche 14 or 16.

- **Canonical form of `c_1_relation_family` enum members in existing graph data**: how much hyphenated legacy data exists (e.g. `'kernel-resonance'`), and what is the migration discipline? DR-IG-1 specifies underscore form; existing cypher at `graph_api.rs:323` reportedly writes hyphenated. Migration likely belongs in 09.1 closure work, but the volume and policy haven't been surfaced.
