# Track 13 — Decision Register

All 20 cycle-3 contradictions are **VALIDATED** as of 2026-06-02. Each row carries the ratified resolution, the action that lands it, and the verification command. Tranches that depended on a DR-row may now begin.

---

## DR-M0-1 — M0' CRUD vs governed-route

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Downgrade UX §7 "full CRUD" to **governed routed-write via M5 atelier**. M0' is the readable-graph + summonable-inspector surface; canon mutation is M5-5 Logos Atelier's job (scent-following → cognate → drift → psychoid → pros-hen → Möbius write-back proposal). Writes flowing from the read surface collapse the bimba/pratibimba dial that justifies having two surfaces.

**Action:** Patch UX `anuttara-ux-full-m0-branch.md §7` to read "governed routed-write via M5 atelier"; M0' inspector retains `mutatesGraphCanon: false`.

**Verification:** `grep -nE "full CRUD|requestCanonMutation|governed routed-write" Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md` reflects the patch.

**Depends:** Tranches **01.2**, **09.4** (gateway extension downgrades to spec-side note — no `s2.graph.{create,update,delete}` registration).

---

## DR-M0-2 — Anuttara source naming canon

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Coordinate-prefixed `c_1_*` is **always canonical**. Unprefixed `symbol`/`formulation_type` are documented aliases mapped through `OntologyPropertyMapping`. Rule generalizes: canon is always the coordinate-prefixed form.

**Action:** Patch `M0'-SPEC §Open Questions` to remove the open status; document `c_1_*` as canonical, `symbol`/`formulation_type` as alias-only. Inspector reads canonical form, displays with alias-label for human readability.

**Verification:** `grep -n "c_1_symbol" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` after patch shows canonical-vs-alias note; `cargo test -p epi-s2-graph-services ontology::anuttara_property_mappings_round_trip` passes.

**Depends:** Tranches **01.3**, **09.8**.

---

## DR-M0-3 — Retire residual "M0 has no internal sixfold" wording

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** M0' has six M0-X' data layers; M0 (content) is unified. Sweep residual wording.

**Action:** Corpus sweep replacing "M0 has no internal sixfold" / "no internal sixfold" wording across the M' Seed corpus.

**Verification:** `grep -rn "no internal sixfold\|M0 has no" Idea/Bimba/Seeds/M/M0'/` returns no live-attribution matches.

**Depends:** Tranche **01.1**.

---

## DR-M1-1 — Audit and downgrade residual `M0-Anuttara-witness` wording

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Standing invariant. The +1 parent of the matheme spine is **M1-5**, never M0. Substrate (`m1.h:526-551` with `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `RING_QUATERNION_LUT[12]`) already carries this. Sweep doc.

**Action:** Single-line patches across `alpha_quaternionic_integration_across_M_stack.md §1.1` and other residues replacing "M0 Anuttara witness-axis" with "M1-5 (+1 parent) per M1'-SPEC §1".

**Verification:** `grep -rn "M0.*witness-axis\|M0 Anuttara witness" Idea/Bimba/Seeds/M/` returns no live-attribution matches.

**Depends:** Tranche **02.1**. Consolidated with **DR-M5-2** as a single sweep.

---

## DR-M1-2 — K² played-torus 3D surface owner

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** **Full 3D Bevy/wgpu rendering extension** `m1-paramasiva-played-torus` seeded by `physical-pole-stack-architecture.md`. 2D never would have sufficed — M1 is a topological system, the played K² topology IS the instrument.

**Action:** New first-build extension at `Body/M/epi-theia/extensions/m1-paramasiva-played-torus/` with Bevy/wgpu renderer consuming the landed math at `portal-core/src/{quaternion.rs, hopf.rs}` + `m1.h CL42_BASIS[6]` + `RING_QUATERNION_LUT[12]`. Anti-greenfield exception: M' product surface with no current owner.

**Verification:** `test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus`; toolchain (Bevy/wgpu) declared in `package.json`; render-test asserts K² topology with `DOUBLE_COVER_DEG=720` and `TORUS_GENUS=1` from substrate.

**Depends:** Tranche **02.6**.

---

## DR-M2-1 (DCC-03) — Planet-count + Earth-observer semantics

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** 10 planets total including Earth-as-centre. Earth IS the 10th planet — the centre of the map and centre of the clock. The 9:8 epogdoon is 9 non-Earth planets to 8 chakras; Earth as observer-centre is structurally the 10th. Already resolved at the C/Rust substrate level — `M2_PLANET_LUT[10]` is canon.

**Action:** Strip `planetCountDecision: 'pending-DCC-03'` from `meaning-packet.ts:145`; document Earth-at-centre semantics in `M2'-SPEC §9.5` + the cymatic-engine companion. NO kernel-bridge field changes (consolidated **DR-KB-1** also VALIDATED).

**Verification:** `grep -n "pending-DCC-03\|planetCountDecision" Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts` returns no live hits; `grep -n "Earth.*centre\|10th planet" Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` reflects ratification.

**Depends:** Tranches **03.5**, **10.3** (both downgrade to doc-ahead-landing patches).

---

## DR-M2-2 — Six axes of 72 + overlays canonicalisation

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Six 72-axes (MEF / tattva / decan / Shem / maqam / DET-projection) + two sonic overlays (mantra-100, Asma'ul-Husna 99+1) + planetary keying via decan-link. **Split Theia `shem-asma` `M2AddressView` into `shem` (72-cardinality, real axis) and `asma` (99+1, overlay).** Collapsing them was mathematically wrong (different cardinalities, different ontological roles).

**Action:** Patch UX §3 mantra-row from axis to overlay. Split `M2AddressView['name']` enum at `meaning-packet.ts:50-54` into `shem` + `asma`. Round-trip tests cover the asymmetry.

**Verification:** UX §3 reflects six-axes-plus-overlays; `meaning-packet.ts:50-54` enum has `shem` and `asma` as separate entries; per-axis round-trip test passes.

**Depends:** Tranche **03.6**.

---

## DR-M3-1 — TCT / Nine-of-Wands dataset reconciliation

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Runtime law is authority. Dataset value moves from 8 to 7. Add S2 import-time validator rejecting value 8 for TCT.

**Action:** Patch dataset entry; add validator in `Body/S/S2/graph-services/src/dataset_import.rs` rejecting `cardinality=8` on TCT nodes.

**Verification:** `cargo test -p portal-core::codon::tests` confirms `classify_codon(0x35) == ImperfectPalindromic`; dataset value updated; validator rejects 8.

**Depends:** Tranche **04.4**.

---

## DR-M3-2 — 72→64 epogdoon (reformulated — not a uniqueness question)

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** The 72→64 fold is **the epogdoon ratio 9:8** — the same epogdoon that resolves planets-to-chakras (9 non-Earth planets : 8 chakras). It is NOT a slots-to-codons mapping requiring injectivity scope. The fold is a structural harmonic, not a partitioning. UI must not assume bijectivity, but does not need a gap-marker contract — the structural identity with the planetary 9:8 IS the contract.

**Action:** Document the epogdoon identity in `M3'-SPEC` cross-referenced to `M2'-SPEC §9.5` (the planetary 9:8). No new profile field. Remove any UI assertion of injectivity. The mistake in the original framing was importing software-engineering uniqueness concerns into an ontological structure that operates harmonically.

**Verification:** `grep -n "epogdoon\|9:8" Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md` references planetary epogdoon; `portal-core/tests/` contains no `assert injectivity` patterns.

**Depends:** Tranche **04.5** downgrades from contradiction-decision to doc-ahead-landing (cross-reference patch only).

---

## DR-M3-3 — 12 MEF lenses vs 16+1 Mahamaya lens-stack (clarification, not contradiction)

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** **Never a contradiction.** The 12 MEF lenses are M2-1' Vimarśa-domain (chromatic, the MEF dimension of the 72-fold MEF×QL addressing). The 16+1 Mahamaya lens-stack is M3'-domain (Mahamaya structure). Distinct ontologies in distinct namespaces by design. The substrate name `LENS_COUNT=12` at `codon_rotation_projection.rs:5` is correctly M2-1' chromatic MEF count.

**Action:** Documentation only — name each structure clearly in its respective spec; cross-reference to clarify they are not the same lens.

**Verification:** `grep LENS_COUNT Body/S/S0/portal-core/src/codon_rotation_projection.rs` returns the M2-1' chromatic count with a clarifying comment; `M3'-SPEC §8.10` names `M3_LENS_STACK` distinctly.

**Depends:** Tranches **04.6**, **04.2** (Lens Annulus inspector naming follows the distinction).

---

## DR-M4-1 — DayContainer vault path

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** The canonical day path has **always been** `Idea/Empty/Present/{day_id}/`. Both `M4'-SPEC §6.6` (`${VAULT}/Pratibimba/Nara/{day_id}/`) and `m4-nara/src/common/nara-surface.ts::dayContainerPath` (`${vaultRoot}/day/{dayId}/`) were drift — neither matches the actual vault layout that `epi vault day-init` writes.

**Action:** Patch BOTH spec AND extension to `${VAULT_ROOT}/Idea/Empty/Present/{day_id}/`. This aligns to the standing vault convention used by `epi vault day-init` and confirmed in the live session (`/Users/admin/Documents/Epi-Logos/Idea/Empty/Present/02-06-2026/daily-note.md`).

**Verification:** `grep -n "Empty/Present\|dayContainerPath" Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts` reflects canonical path; `grep -n "Empty/Present" Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` reflects spec patch; `createNaraArtifact → readNaraDayContainer` round-trip passes on `Idea/Empty/Present/{day_id}/`.

**Depends:** Tranche **05.2**.

---

## DR-M4-2 — Nara composite (five clauses, all VALIDATED)

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user

**Clause 1 — `q_personal` baseline:** Not a question. `q_personal` IS the **Nara quintessence output** — the integrated identity. `Q_identity` (the natal Kerykeion baseline) is a component the Nara output integrates; `q_personal` is the integrated form. Spec §7.13 clause (1) is closed.

**Clause 2 — Cl(4,2) axis order:** Pinned at `[w=Earth, x=Fire, y=Water, z=Air]`. Can permute / rotate in different modes (per-mode axis shift is a derived view, not a base-canon change). Already settled.

**Clause 3 — Identity-hash migration path:** Whatever works. Phased migration with both hashes valid during cutover is acceptable; final state quaternionic.

**Clause 4 — Vāma classifier policy:** **Computed-mandatory internally as part of long-period review**; surfaces **as insight, available on request, not auto-raised**. The shadow patterns are operative for the field whether observed or not; the UI offers them as recognition material, never imposes.

**Clause 5 — 0/1 cymatic polarity:** **0 = cosmic, 1 = personal. Always been the case.** psychoid-engine reading (1-side personal / 0-side cosmic) IS canonical; any `m5-prime-system-shape §3.2` wording suggesting otherwise is drift to be patched. Cross-link: this clause IS the polarity that DR-TS-1 ratifies at the shell level.

**Action:** Document clauses 1, 2, 5 as ALIGNED in `M4'-SPEC §7.13`. Land clause 3 phased-migration policy. Land clause 4 as long-period-review insight-surfacing on Nara surface (computed in `personal_identity.rs`, surfaced via `nara_journal::period_reading` long-arc).

**Verification:** `grep -n "axis_order\|q_personal_baseline\|polarity" Body/S/S0/portal-core/src/personal_identity.rs` reflects pinned forms; `M4'-SPEC §7.13` closes all five clauses with cross-references to DR-M4-2.

**Depends:** Tranches **05.7**, **08.6** (clause 5 consumer), **11.1** (clause 5 cross-link).

---

## DR-M5-1 / DR-B-1 — Pi as agent harness; ACR repurpose

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Pi is the **underlying agent harness** (single). **Anima is the main dispatching agent**. Anima dispatches the **six Aletheia subagents** (Anansi, Moirai, Janus, Mercurius, Agora, Zeithoven) for skill usage, system management, and service routing. The six **ta-onta carriers** (Khora, Hen, Pleroma, Chronos, Anima-carrier, Aletheia) are system/service routing infrastructure — NOT agents. Aletheia is the tool-guardian carrier AND the dispatcher of the six subagents.

The **"Agentic Control Room" (ACR)** development in `Body/M/epi-theia/extensions/agentic-control-room/` and the `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` array in `capability-matrix.json` are **tangent-development drift**, not canonical architecture. Cycle 3 unwinds:

- The ACR extension is repurposed as a **Pi runtime monitoring surface** (dispatch tracing, run-evidence display, capability-parity check) — NOT a "constitutional-agents review panel".
- The `constitutional_agents` array is either documented as **psyche-aspect rendering material** (Jungian functions surfaced through Anima for meditation/recognition, NOT separate agents) or deprecated outright if the audit finds no canonical use.
- M5'-SPEC §M5-4' (Agentic Control Room) is rewritten around Pi+Anima+subagents.

**Action:** See Tranche 12 rewrite — every 12.x tranche reframed around the Pi+Anima+subagents canonical architecture. No separate "constitutional vs ACR-governance" ontology.

**Verification:** `grep -n "constitutional_agents\|review_surface_roles" Body/S/S4/plugins/pleroma/capability-matrix.json` reflects audit outcome (documented or deprecated); ACR extension's `AgenticActor` union collapses to `pi` + `anima` + the six Aletheia subagents; M5'-SPEC §M5-4' rewritten.

**Depends:** Tranches **06.5**, **12.1** (Pi+Anima+subagents audit), **12.14 NEW** (ACR repurpose).

---

## DR-M5-2 — Enforce +1 = M1-5 corpus-wide

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Sibling of DR-M1-1. Sweep corpus-wide.

**Action:** Single sweep with DR-M1-1.

**Verification:** `grep -rn "M0.*witness-axis" Idea/Bimba/Seeds/M/` returns no live-attribution matches.

**Depends:** Tranches **02.1** + **06.5**.

---

## DR-B-2 — Pi axiom-translation tooling

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Land it. `Body/S/S4/pi-agent/lib/axiom-translate.ts` consumes `epi-gnostic` OWL/SHACL (`import_epi_ontology_with_n10s` is landed). Without it Pi can't perform the philosophical-English ↔ OWL ↔ SHACL bridging the UX promises and the Logos Atelier scent-following loses its root.

**Action:** Implement `Body/S/S4/pi-agent/lib/axiom-translate.ts` consuming epi-gnostic. Extend Pi capability list to include axiom-translate.

**Verification:** `test -f Body/S/S4/pi-agent/lib/axiom-translate.ts`; capability-matrix Pi gate-set includes axiom-translate; integration test bridges plain prose to OWL/SHACL via epi-gnostic.

**Depends:** Tranche **12.7**.

---

## DR-B-3 — Aletheia subagents are Anima-dispatched skill/system specialists

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** The six Aletheia subagents are **invoked by the main agents (primarily Anima) for skill usage, system management, and service routing.** They are NOT peer agents in any review surface. They surface in a Pi runtime monitoring view as dispatch traces, not as first-class actors.

**Action:** Collapse ACR `AgenticActor` union to `pi` + `anima` + the six Aletheia subagents (as dispatched specialists, not constitutional roles). Remove `eros/logos/mythos/nous/psyche/sophia` peer-agent entries OR document them as psyche-aspect rendering material per DR-M5-1.

**Verification:** `grep -n 'AgenticActor' Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts` reflects collapsed union; ACR contract test asserts subagents render as dispatched-from-Anima with provenance.

**Depends:** Tranches **12.12**, **12.1**.

---

## DR-KB-1 — Planetary projection LUT cardinality

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Already resolved at C/Rust substrate. 9:8 epogdoon = 9 non-Earth planets × 8 chakras; Earth-as-centre is the 10th planet. `M2_PLANET_LUT[10]` is canon; `MathemePlanetaryChakralProjection::from_diatonic` stays at 9×8 with Earth as centre-of-map. No bridge field change.

**Action:** Tranche 10.3 downgrades to doc-ahead-landing (document Earth-at-centre in the readiness ledger row).

**Verification:** `cargo check -p portal-core` clean against current substrate.

**Depends:** Tranche **10.3** (downgraded). Consolidates **DR-M2-1**.

---

## DR-KB-2 — `depositionAnchor` typed-field

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Typed `MathemeHarmonicProfile` field. `kernel.rs` is the authority; bridge DTO follows.

**Action:** Add `pub deposition_anchor: ...` to `MathemeHarmonicProfile` at `kernel.rs:346-387`; emit at `kernel_bridge_runtime.rs:625-631` reads the struct field instead of synthesizing.

**Verification:** `grep -n deposition_anchor Body/S/S0/portal-core/src/kernel.rs` returns field declaration; `cargo test -p epi-cli --test kernel_bridge_runtime_contract` asserts JSON edge consistency.

**Depends:** Tranche **10.4**.

---

## DR-TS-1 — Shell separation (clarified: not a contradiction)

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Spec says it cleanly: layout is `0/1` and `4+2`. The `0/1` is a single shell with **a 0 side (cosmic) and a 1 side (personal)** — that is the two surfaces, that is the toggle, that IS the spec's `(0/1)` as `#` applied to user context. The `4+2` is **six depth layers**, the workbench. Code's two layouts (`daily-0-1` + `ide-deep`) ARE the two-sided 0/1 shell + the six-layer depth shell. No third layout needed, no separate toggle widget — the toggle is built into `daily-0-1` as the 0-face / 1-face switch within the same layout. The `/` OmniPanel is the operator membrane that overlays both. It was counting, not contradiction.

**Action:** Document the structural reading in `11.1` so the next reader doesn't make the same misclassification. No code change; no third layout; no separate toggle widget unless one is wanted as UI polish.

**Verification:** `pnpm --filter @pratibimba/pratibimba-layouts test` passes against current substrate; spec grep confirms reading.

**Depends:** Tranches **11.1**, **07.5**, **08.5**. Cross-links **DR-M4-2 clause 5** (0 cosmic / 1 personal — same polarity all the way down).

---

## DR-IG-1 — Two-relation-families schema discriminator

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Extend schema with `c_1_relation_family` enum `{structural, correspondential, kernel_core, inferred, sync, compatibility}` (6 members ok). Populate via `dataset_import` + `sync_coordinator`.

**Action:** Add `c_1_relation_family` to `RELATIONSHIP_PROPERTY_SPECS` at `Body/S/S2/graph-schema/src/lib.rs`. Populate during dataset import; backfill via sync_coordinator.

**Verification:** `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-schema relation_family_enum_present`.

**Depends:** Tranche **09.2**.

---

## Validation Workflow

All 20 rows are VALIDATED. Cycle-3 tranches may begin work in the order named in `00-overview-and-design-reconciliation.md §Execution Sequence`. Three rows downgrade from contradiction-decision to doc-ahead-landing as a result of validation (10.3, 04.5, 09.4 partial); the rest land as ratified.
