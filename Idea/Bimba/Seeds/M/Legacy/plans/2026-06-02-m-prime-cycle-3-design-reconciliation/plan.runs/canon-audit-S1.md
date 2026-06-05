# Canon Audit: S1-obsidian-container

**Auditor scope:** Tranche 17 S1-sub-rows (17.11, 17.18, 17.19, 17.20, 17.22) + CCT-14 (Hen entity-candidate lifecycle) + CCT-15 (C-layer typology) against S1-SPEC + S1-{0..5}-SPEC + DR-S1-1..5 (ratified 2026-06-03) and S1-ARCHITECTURE substrate.
**Audit date:** 2026-06-03

## Authoritative sources read

- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md (full, two pages)
- Idea/Bimba/Seeds/S/S1/S1-SPEC.md
- Idea/Bimba/Seeds/S/S1/S1-0-SPEC.md
- Idea/Bimba/Seeds/S/S1/S1-1-SPEC.md
- Idea/Bimba/Seeds/S/S1/S1-2-SPEC.md
- Idea/Bimba/Seeds/S/S1/S1-3-SPEC.md
- Idea/Bimba/Seeds/S/S1/S1-4-SPEC.md
- Idea/Bimba/Seeds/S/S1/S1-5-SPEC.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/17-s-stack-modularisation.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/16-cross-cutting-closures.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/cct-14-hen-entity-candidate-lifecycle-ledger.md
- Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/cct-15-c-layer-typology-ledger.md
- Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md (substrate reference, ARCHITECTURE-as-INPUT only — not authority on conflict)

## Per-row audit

### 17.11 — Split `hen-compiler-core/src/lib.rs` (881 LOC) into 7 modules (`residency / coordinate / frontmatter / l_alignments / ledger / compile_plan / graph_sync`) preserving API via `pub use`
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:505-507 (DR-S1-1 ratified); Idea/Bimba/Seeds/S/S1/S1-SPEC.md:43-46 (canonical Rust authority at `hen-compiler-core`); Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:269-290 (§5.1 substrate-grounded 7-module proposal).
- **Current framing in tranche:** Split into seven small modules; pure `pub use` preserves API; verification `cargo check && cargo test -p hen-compiler-core`.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Module names match DR-S1-1's literal split. Anti-greenfield, blast-radius-zero refactor of canonical authority — exactly the discipline canon authorises.

### 17.18 — Move S1 rename-reconciliation literal-text rewrite from `gate/s1_hen.rs:155-205` into `hen-compiler-core::wikilinks::reconcile_rename` (integrity authority = mutation authority)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:509-511 (DR-S1-2); Idea/Bimba/Seeds/S/S1/S1-5-SPEC.md:27-31 (S1.5 build contract — "rename/move reconciliation must use real wikilink parsing and update inbound links atomically"); Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:312-329 (§5.3 substrate finding).
- **Current framing in tranche:** Unifies rename-reconciliation through Hen; load-bearing for DR-M1-4.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Exact DR-S1-2 language and substrate citation. Closes the boundary smell where S0 gate held mutation authority while Hen held integrity authority.

### 17.19 — Land `WikilinkTarget::PathBlock` + `PathHeadingBlock` variants (close `[[Note^block-id]]` corruption hole)
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/S/S1/S1-5-SPEC.md:39 (test obligations name `wikilink_parser.rs`); Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:331-341 (§5.4 — current parser only splits on `#`, `^` anchors fall into `Path` raw, "silent-corruption hole").
- **Current framing in tranche:** Add two new `WikilinkTarget` variants for Obsidian block-anchor syntax.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Substrate-grounded gap-fill. No DR conflict; SPEC requires real wikilink parsing for integrity (S1-5-SPEC build contract).

### 17.20 — Add `S1VaultRenameRefusalReason::CoordinateResidencyMismatch`; default policy REFUSE; user opt-in override flag
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:513-515 (DR-S1-3 — "default policy is REFUSE (user opt-in to bypass with explicit override flag)"); Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:366-376 (§5.6 substrate gap).
- **Current framing in tranche:** Land coordinate-residency-on-move enforcement; load-bearing for DR-M1-4 / DR-M1-1 / CCT-12.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Matches DR-S1-3 verbatim including default-REFUSE policy. Closes silent residency violation DR-M1-4 depends on.

### 17.22 — Declare `Body/S/S1/hen-compiler/` (Python vendor) compatibility-only via STATUS.md; no deletion; pure documentation
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/S/S1/S1-SPEC.md:43-46 (canonical authority moved to Rust `hen-compiler-core`; Python files "are no longer the target authority"); Idea/Bimba/Seeds/S/S1/S1-3-SPEC.md:24-30 (vendor compatibility seams kept "intelligible while refusing to mistake them for canon"); Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:416-430 (§5.10).
- **Current framing in tranche:** Pure doc-ahead-landing; prevents future Python pipeline extension; no deletion.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Honors SPEC's "vendor-compat, not authority" framing without retiring useful probe material.

### CCT-14 — Hen entity-candidate lifecycle (capture / classify / promote_to_type / world.graduate); SwarmVault remains Codex/Claude sidecar
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:517-525 (DR-S1-4 verbatim — "Hen IS the canonical entity-candidate compiler for Pi/vault use"; "Idea/Empty/" residency; coordinate-native promotion into `World/Types/Coordinates/**`; flat graduation to `World/{Name}.md`; "SwarmVault remains a Codex/Claude development-ledger sidecar"); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/cct-14-hen-entity-candidate-lifecycle-ledger.md:1-54; Idea/Bimba/Seeds/S/S1/S1-SPEC.md:496-515 (S1' as Hen's ta-onta module: "CT template law", "vault residency resolver", "type/form birth and graduation").
- **Current framing in tranche:** Land missing S1' entity lifecycle over existing substrate; Smart Env read-only; mdbase intelligence as coordinate-lawful frontmatter+aliases; reviewed candidates → coordinate-native World/Types incubation; stable → flat World; SwarmVault explicitly NOT the canonical compiler.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Method surface (`s1'.entity.capture/classify/promote_to_type`, `s1'.world.graduate`, `s1'.semantic.neighbors_of/by_block/search`) matches the SPEC-level gap-list at S1-ARCHITECTURE §4.2 (MISSING entries) and the DR-S1-4 implementation invariant.

### CCT-15 — C-layer typology under `World/Types/Coordinates/C/**` as primary semantic typology; `s1'.type.classify_c_layer`; graph-promotion evidence `semantic_authority` + `c_layer_path`
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:527-535 (DR-S1-5 — "C-layer semantic typology as World/Types authority"; "Hen must classify artifacts through C before semantic folder placement"; "audit C-prime branch ancestry before treating [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] folder paths as graph-authoritative"); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/cct-15-c-layer-typology-ledger.md:1-51; Idea/Bimba/Seeds/S/S1/S1-SPEC.md:838-850 (S1'Cx Projection — "Forms are flat; Types hold folders/canvases"; explicit C0..C5 mapping); Idea/Bimba/Seeds/S/S1/S1-SPEC.md:923 ("`World/Forms/` is obsolete").
- **Current framing in tranche:** Materialise `World/Types/Coordinates/C/**`; no top-level `World/Types/{Templates,Entities,...}` peers; Hen routes templates→C1/CT, entities/properties/tags→C2, canvases/diagrams→C3, type authorities/MOCs→C4, World graduation→C5.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Routing map matches S1-SPEC's S1'Cx projection table exactly. Avoids re-introducing the obsolete sibling-root semantic-folder pattern.

### CCT-15 sub-claim — "audit C-prime branch ancestry before treating [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] folder paths as graph-authoritative"
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:531 (DR-S1-5 Action clause).
- **Current framing in tranche:** CFP / CT / CP / CF / CFP / CS treated as C-prime reflective coordinates whose folder-paths require ancestry audit before graph-authoritative use.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Reflective-coordinate naming (cpf/ct/cp/cf/cfp/cs) is the standing canon per CLAUDE.md §III.C; the audit clause prevents accidental cross-namespace authority leakage from CLAUDE.md summary (which is not authority per discipline rule 2e).

### 17.11 sub-claim — "Pure `pub use` preserves API" for the 7-module split
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:507 ("pure `pub use` preserves API"); Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:290 (blast-radius analysis confirms public API preserved via `pub use`).
- **Current framing in tranche:** Re-export façade only.
- **Recommendation:** KEEP-AS-IS

### CCT-14 sub-claim — Dangling wikilinks / loose root-created notes route to `Idea/Empty/` or `Idea/Empty/Present/{day}/entities/` as `entity_candidate` artifacts
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:519 (DR-S1-4 — "Dangling wikilinks and Obsidian root-created loose notes enter `Idea/Empty/` as `c_4_artifact_role: \"entity-candidate\"`"); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/cct-14-hen-entity-candidate-lifecycle-ledger.md:11; Idea/Bimba/Seeds/S/S1/S1-4-SPEC.md:18 ("`Idea/Empty/Present`" as active session anchor).
- **Current framing in tranche:** Empty residency for candidate; per-day entities sub-folder optional.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Matches DR-S1-4 + S1-4-SPEC. The `c_4_artifact_role: "entity-candidate"` literal frontmatter form should be carried into implementation, per DR-S1-4 verbatim.

### CCT-14 sub-claim — Smart Env remains a read-only suggestion pool; mdbase intelligence expressed via coordinate-lawful frontmatter + aliases
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:519 (DR-S1-4 — "Smart Env suggests; Hen writes; S2 syncs"); Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:120-124 (substrate evidence: `smart_env.rs` is a pure-read consumer; no embedding model invoked, no external service; "load-bearing graceful-degradation invariant").
- **Recommendation:** KEEP-AS-IS

### CCT-14 sub-claim — Method surface adds `s1'.entity.capture`, `s1'.entity.classify`, `s1'.entity.promote_to_type`, `s1'.world.graduate`, plus `s1'.semantic.neighbors_of` / `by_block` / `search`
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/cct-14-hen-entity-candidate-lifecycle-ledger.md:36-42 (Implementation Targets list); Idea/Bimba/Seeds/S/S1/S1-SPEC.md:516-822 (every `s1'.*` method-family that already exists, leaving room for these new ones); Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:233-237 (§4.2 explicitly names these as MISSING).
- **Recommendation:** KEEP-AS-IS

### CCT-15 sub-claim — Graph-promotion evidence extended with `semantic_authority` + `c_layer_path`
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:529-531 (DR-S1-5 Action); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/cct-15-c-layer-typology-ledger.md:36-39 (Implementation Targets).
- **Current framing in tranche:** Two new evidence fields plumbed into the existing `GraphPromotionIntent` surface.
- **Recommendation:** KEEP-AS-IS
- **Recommendation detail:** Extends existing `GraphPromotionIntent` without forking a new type — matches anti-greenfield discipline.

### CCT-15 sub-claim — Top-level `World/Types/{Templates,Entities,Properties,Tags,Diagrams,Canvases,Artifacts}` peer-roots must NOT exist
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:533 (DR-S1-5 Verification — "no top-level `World/Types/{Templates,Entities,Properties,Tags,Diagrams,Canvases,Artifacts}` authority exists"); Idea/Bimba/Seeds/S/S1/S1-SPEC.md:923 ("`World/Forms/` is obsolete"); Idea/Bimba/Seeds/S/S1/S1-SPEC.md:838-850 (S1'Cx projection routes these categories under C0-C5).
- **Recommendation:** KEEP-AS-IS

### CCT-14 verification claim — `cargo test -p hen-compiler-core --test entity_candidate_lifecycle` + gateway-contract tests for capture/classify/promote/graduate/refusal
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/cct-14-hen-entity-candidate-lifecycle-ledger.md:46-53 (Verification Shape); Idea/Bimba/Seeds/S/S1/S1-5-SPEC.md:36-39 (real-fixture test discipline).
- **Recommendation:** KEEP-AS-IS

### CCT-14 dependency chain — DR-S1-4, DR-S1-1, DR-S1-2, DR-S1-3, DR-M1-4
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:525 (DR-S1-4 Depends clause names CCT-14 + DR-S1-1/2/3 + DR-M1-4); Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:396-406 (DR-M1-4 Hen vault-instance contract).
- **Recommendation:** KEEP-AS-IS

### CCT-15 dependency chain — DR-S1-5, CCT-14, DR-S1-1, DR-S1-2, DR-S1-3
- **Status:** ALIGNED
- **Cited:** Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:535 (DR-S1-5 Depends clause).
- **Recommendation:** KEEP-AS-IS

## Drift patterns observed

No load-bearing drift in this tranche-slice. The S1 cycle-3 rows (17.11, 17.18, 17.19, 17.20, 17.22, CCT-14, CCT-15) are unusually well-disciplined relative to the cycle-3 average. Three factors appear to drive that: (1) DR-S1-1..5 were ratified the same day (2026-06-03) the verifier produced them, so the tranche text was written *with* the ratified-DR language already in hand; (2) the substrate authority — `hen-compiler-core` — was already named canonical by S1-SPEC, so refactor proposals had nowhere to drift toward "rebuild"; (3) the CCT-14 and CCT-15 ledger files were authored from FLOW-2026-06-03 source flows that themselves consult S1'-SPEC + S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL directly. The discipline failure flagged by the user in DR-TUI-1's process-note ("the consultation discipline IS the classification") evidently caught these tranches *before* drafting rather than after.

The one shape worth flagging is not drift but emphasis: 17.22 (Python vendor declared compatibility-only via STATUS.md) is a doc-only patch but is load-bearing as guard-rail against future contributors extending the Python side — this is correctly small-scope, but its blast-radius-zero framing makes it easy to deprioritise. It should remain in scope. Similarly, CCT-15's C-prime ancestry audit clause for [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] folder paths is subtle but load-bearing — it prevents accidental graph-authority leakage when reflective-coordinate folder shorthand collides with C-family typology. The CLAUDE.md summary (§III.C) is *not* authority on this question; the audit must consult S1-SPEC §S1'Cx Projection + DR-S1-5 directly.

No NAMED-CONFLICT, no CONTRADICTS-RATIFIED-DR, no MISSING-CITATION, no WRONG-FRAMING surfaced in this slice.

## Tranche augmentation / removal / addition recommendations

- KEEP all rows: 17.11, 17.18, 17.19, 17.20, 17.22, CCT-14, CCT-15 land as written.
- AUGMENT 17.22 with explicit cross-link to S1-SPEC:43-46 ("Python files in `Body/S/S1/hen-compiler/scripts/hen_*` remain useful vendor-adjacent compatibility/probe material, but they are no longer the target authority") so the STATUS.md content is grounded in the SPEC's own framing rather than left to author judgment. Citation: Idea/Bimba/Seeds/S/S1/S1-SPEC.md:43-46.
- AUGMENT 17.19 (PathBlock variants) verification to include a fixture test demonstrating that `[[Note^block-id]]` survives a rename. Per S1-ARCHITECTURE.md:331-341 the silent-corruption hole is real Obsidian usage; the §5.9 test surface (S1-ARCHITECTURE.md:402-414) names "rename rewrites `[[X#Heading]]` and (post §5.4) `[[X^block-id]]`" — this should be lifted into 17.19's stated verification rather than left implicit. Citation: Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md:402-414.
- AUGMENT CCT-14 to add explicit verification that the `c_4_artifact_role: "entity-candidate"` frontmatter literal appears on captured artifacts (DR-S1-4 names this literal). Without grounding it in the verification clause, the symbolic frontmatter contract could drift in implementation. Citation: Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:519.
- AUGMENT CCT-15 to add a verification asserting absence of any sibling `World/Forms/` directory (the explicit obsolete-path from S1-SPEC:923). Citation: Idea/Bimba/Seeds/S/S1/S1-SPEC.md:923.
- NO REMOVALS. NO NEW TRANCHE PROPOSALS in this slice.

## Open questions for user

None within this slice. All seven rows have direct ratified-DR citations and SPEC anchors. The Hen carrier `CONTRACT.md` mentioned in S1-ARCHITECTURE §4.4 gap-7 belongs to Tranche 02.X (DR-M1-4 Hen vault-instance contract landing), not to Tranche 17 / CCT-14 / CCT-15, so it is outside this slice's audit scope.
