# Track 13 — Decision Register

All 20 original cycle-3 contradictions are **VALIDATED** as of 2026-06-02; DR-M3-4 added 2026-06-02 (also VALIDATED); DR-M3-5 and DR-VAK-1 added 2026-06-03. Phase-B cross-boundary verifier (2026-06-03) added 10 PROPOSED DR rows (DR-IG-2..6, DR-M1-3..4, DR-M2-3, DR-M4-3, DR-M5-3). Phase-C S-stack + Theia design verification (2026-06-03) added 17 further PROPOSED rows (DR-S0-1..2, DR-S1-1..3, DR-S2-1, DR-S3-1..3, DR-S5-1..2, DR-TUI-1, DR-TUX-1, DR-TS-3..6, DR-UI-3..5). Phase-D (2026-06-04) synthesis pass integrating Third Spanda integral quilting + VAK Context Frame Coordinate substrate added 3 further PROPOSED rows (DR-M3-6 Third Spanda canonical five-form spine; DR-IG-7 translation rule `9_M2 = 8_M3 + 1_M1` as matheme law; DR-VAK-3 diatonic-as-CF-progression canonical). Phase-E (2026-06-04) synthesis pass folding canonical [`epi-logos-kernel-spec.md`](../../epi-logos-kernel-spec.md) + [`mental-pole-mechanics.md`](../../M4'/mental-pole-mechanics.md) into cycle-3 build added **3 further PROPOSED rows** that bind the AI architecture as the design (DR-MP-1 4'-5'-0' = LLM/EBM/Verifier triplet canonical; DR-MP-2 EBM operational atom = 72-fold resonance vector with three tritone-symmetric squares; DR-MP-3 resonance-training bootstrap = corpus IS canon IS training data + verifier raises questions not pass/fail) — all awaiting user final-validation. Tranches that depended on a DR-row may now begin once that row VALIDATES.

## Validation Queue (cycle-3 gate) — CLEARED 2026-06-09

**All previously-PROPOSED rows are now VALIDATED** (user-delegated batch validation, session 2026-06-09: the user authorized batch validation; each row was adjudicated against its kernel-canon sources and the verified substrate before marking — see per-row attribution lines). Validated in this batch: DR-VAK-1, DR-M3-6, DR-IG-7, DR-VAK-3, DR-MP-1, DR-MP-2, DR-MP-3, DR-KERNEL-1, DR-MP-4, DR-MOE-1, DR-ELO-1, DR-UC-1, DR-MODEL-1, DR-ML-1, DR-S1-6, DR-M4-4, plus DR-TS-5 (deferral resolved: owner = `kernel-bridge-readiness`; class = protected-with-session-correlation, decorrelated summary safe-public) and the new DR-FIB-1..5 rows (handoff 35 application, see end of file). DR-TS-4 remains DOWNGRADED. **G11 is satisfied: no unvalidated DR row gates any tranche.** The earlier overview-vs-register "ratified vs PROPOSED" citation mismatch is dissolved — the overview's "ratified" language is now accurate.

Adjudication evidence (recorded, not ceremonial): Third Spanda five forms + execution trace verified arithmetically against `ql_m0_m3_third_spanda_integral_quilting_v2.md` (lines 388-402; all identities check: 137=64+72+1, 360=6×60, 384=64×6=360+24, 472=40×7+24×8); `MathemeDiatonicContext`, `MathemeResonance72Projection`, EPOGDOON constants, 12-tick clock, `total_energy`/`KernelProjection` confirmed in `portal-core/src/kernel.rs`; `VIRTUE_LUT[9]` confirmed in `epi-lib/src/m0.c`; VAK CF order confirmed in `vak.h`/`vak_address.rs`/Anima `extension.ts` (`agentForCf`); `requires_human` gate confirmed in `epii-review-core/src/lib.rs`; `M2_PLANET_LUT[10]`, `RING_QUATERNION_LUT[12]`, `TORUS_GENUS=1`, `DOUBLE_COVER_DEG=720`, `WALK_SPANDA`, `LENS_COUNT=12`, 472-surface confirmed in epi-lib/portal-core. Residual riders from validation: (1) DR-KERNEL-1 — `epi-logos-kernel-spec.md` frontmatter still reads `coordinate: "M0'"`; corrected to `"M'"` in this pass. (2) DR-VAK-1 — `repo-ontology.md` §World/Types still carries the older `C2'→CFP` / `C4'→CP` ladder; sweep is doc-work under the existing corpus-sweep lane (mark legacy-alias, do not silently delete). (3) DR-M3-6 — K² topological-necessity warrant is reference-deferred to `M1'/M1-ARCHITECTURE`; canonisation carries that reference-lock.

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

## DR-M3-4 — Mahamaya reading/transcription clock chain packet law

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** The Mahamaya reading engine is the deterministic clock/transcription chain, not a loose Tarot/codon association. The chain runs: kernel clock/profile → M3-5 `M3_LENS_STACK` aperture → walk state / 384 line-change slot → base hexagram/codon → 3 matrix paths × 2 polarities → 7/8 rotational state → DNA/RNA transcription and Start/Stop governance → `#3-4.0` Tarot reflection → amino/operator join → `TranscriptionalClockPacket`. A single card/codon is a motif; a protein-like symbolic reading is an ordered packet chain around the clock.

**Action:** Patch `M3'-SPEC`, `mahamaya-ux-full-m3-branch.md`, and `nara-ux-full-m4-branch-update.md` to name the full chain and packet contract. Patch Track 04 with tranche **04.8**. Nara receives packet chains as `mahamaya_transcription` evidence inside `PatternPacket`, compares them to stable M4-0-3 Gene Keys / 64-code evidence, and updates only `Q_activity`, trajectory, and #4.4.4.4 under M4.5 review. M4-0 identity-system sources are not mutated by live transcription packets.

**Verification:** `rg -n "TranscriptionalClockPacket|mahamaya_transcription|M3_LENS_STACK|#3-4\\.0" Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md`; `rg -n "04\\.8|DR-M3-4" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/`.

**Depends:** Tranches **04.8**, **05.3**, **05.7** (Nara M4-3 packet integration and #4.4.4.4 protected update rule).

---

## DR-M3-5 — Strange-attractor / coupling-flow discipline for Mahamaya-Nara

**Status:** VALIDATED  ·  **Validated:** 2026-06-03  ·  **By:** Codex synthesis from user request  ·  **Resolution:** Use strange-attractor and running-coupling language as disciplined structural warrant, not loose metaphor or overclaimed physics. Subsystem CF assignment is: Anuttara `(00/00)`, Paramasiva `(0/1)`, Parashakti `(0/1/2)`, Mahamaya `(0/1/2/3)`, Nara `(4.0/1-4.4/5)` with M4.5 as `(4.5/0)` bridge, Epii `(5/0)`. M2 root is therefore `(0/1/2)`, not `(0/1/2/3)`. M3 packet chains are symbolic phase portraits unless actual nonlinear metrics exist; M4-3 integrates recurrence, perturbation, basin, bifurcation-candidate, body evidence, and containment state.

**Action:** Patch `M'-SYSTEM-SPEC`, subsystem README, `M-M-prime-coordinate-mapping-inaugural.md`, `M3'-SPEC`, `mahamaya-ux-full-m3-branch.md`, and `nara-ux-full-m4-branch-update.md`. Add `dynamical_rigor` / `attractor_dynamics` fields and implementation hooks `AttractorDynamicsIntegrator` plus attractor/recurrence inspectors. Cite web warrants for strange attractors, NIST running alpha, PDG electroweak mixing/running `alpha(M_Z)`, PDG QCD running `alpha_s`, and hypercharge-sixfold global-group research.

**Verification:** `rg -n 'AttractorDynamicsIntegrator|dynamical_rigor|attractor_dynamics|symbolic_phase_portrait|Subsystem CF Assignment|Context Frames|contextFrame.*0/1/2' Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md Idea/Bimba/Seeds/M/M-M-prime-coordinate-mapping-inaugural.md Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md Idea/Pratibimba/System/Subsystems/README.md Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md`; `git diff --check`.

**Depends:** Tranches **04.9**, **05.3**, **05.7**, **10.7** (Nara M4-3 attractor integration, #4.4.4.4 protection, and shared profile / Cl(4,2) bridge).

---

## DR-VAK-1 — VAK field order and reading-frame authority

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; runtime order verified in vak.h + vak_address.rs + Anima extension.ts) · **Added:** 2026-06-03  ·  **By:** Codex + VAK subagent audit  ·  **Resolution proposed:** The active runtime and spec order is `CPF, CT, CP, CF, CFP, CS`. `CP` is the active QL position / composed position-frame; `CFP` is thread/spread topology. Older ontology/graph-schema references that map `C2' -> CFP` and `C4' -> CP` are drift unless explicitly preserved as legacy aliases.

For Tarot/QL reading frames, `reading_frame.positions[]` / `OracleFrame.vak_address.cp[]` is the authority for cardinality and QL semantics. A spread label alone is not sufficient. One-card, triadic, sixfold, Klein/Night', and 4/5 depth readings are all valid when their CP-set and CS direction are explicit.

**Action:** Reconcile `repo-ontology.md`, graph-schema reflective coordinate mapping, and any World/Types C' surfaces against the active `VakAddress` shape. Add import-time/schema validation that rejects reading frames missing CPF consent state, CP position set, or CS direction. Update S4/VAK tests for reading-frame fixtures per Tranche 12.15.

**Verification:** `rg -n "C2'.*CFP|C4'.*CP|CPF, CT, CFP, CF, CP, CS" repo-ontology.md Body/S/S2/graph-schema Idea/Bimba/World/Types` returns only legacy/caveated references; Rust/TS `VakAddress` tests keep `cpf,ct,cp,cf,cfp,cs`; reading-frame fixtures cover single, triad, sixfold, Night', and 4/5 pass.

**Depends:** Tranches **04.11**, **05.11**, **10.M3**, **12.15**.

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

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Cleanup 2026-06-03 (final per DR-S4-TECHNE reframe):** Subagent roster corrected to **6 Aletheia subagent techne-guardians** (NOT 7 — Techne moves to Pleroma as atomic-skills substrate, not a 7th agent); dispatcher attribution corrected (Anima dispatches during the crystallisation mode; Aletheia-the-carrier hosts the mode).  ·  **Resolution:** Pi is the **underlying agent harness** (single). **Anima is the main dispatching agent**. Anima dispatches the **6 Aletheia subagent techne-guardians** (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each stewarding specific techne classes within Pleroma-Techne per DR-S4-TECHNE) during the Aletheia-crystallisation-mode for skill usage, system management, and service routing. The six **ta-onta carriers** (Khora=S4-0', Hen=S4-1', Pleroma=S4-2', Chronos=S4-3', Anima-carrier=S4-4', Aletheia-carrier=S4-5') are system/service routing infrastructure — NOT agents. **Pleroma (S4-2') has two faces**: VAK capability membrane (canonical) + Techne atomic-skills repository (Pleroma's second face per DR-S4-TECHNE). Aletheia is the **tool-guardian carrier AND the crystallisation-mode host**; Anima is the dispatcher operating inside that mode. Per S4 canon: Aletheia itself is a MODE of Sophia/Psyche/Anima, NOT its own subagent.

The **"Agentic Control Room" (ACR)** development in `Body/M/epi-theia/extensions/agentic-control-room/` and the `constitutional_agents=[anima, eros, logos, mythos, nous, psyche, sophia]` array in `capability-matrix.json` are **tangent-development drift**, not canonical architecture. Cycle 3 unwinds:

- The ACR extension is repurposed as a **Pi runtime monitoring surface** (dispatch tracing, run-evidence display, capability-parity check) — NOT a "constitutional-agents review panel".
- The `constitutional_agents` array is either documented as **psyche-aspect rendering material** (Jungian functions surfaced through Anima for meditation/recognition, NOT separate agents) or deprecated outright if the audit finds no canonical use.
- M5'-SPEC §M5-4' (Agentic Control Room) is rewritten around Pi+Anima+subagents.

**Action:** See Tranche 12 rewrite — every 12.x tranche reframed around the Pi+Anima+subagents canonical architecture. No separate "constitutional vs ACR-governance" ontology.

**Verification:** `grep -n "constitutional_agents\|review_surface_roles" Body/S/S4/plugins/pleroma/capability-matrix.json` reflects audit outcome (documented or deprecated); ACR extension's `AgenticActor` union collapses to `pi` + `anima` + the 6 Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each guarding specific techne classes in Pleroma-Techne) per DR-S4-TECHNE; M5'-SPEC §M5-4' rewritten.

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

## DR-B-3 — Aletheia subagent techne-guardians are Anima-dispatched during Aletheia-crystallisation-mode

**Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Cleanup 2026-06-03 (final per DR-S4-TECHNE reframe):** Subagent roster is **6 Aletheia techne-guardians** (Techne moves out — it's Pleroma's atomic-skills substrate, NOT an agent). FOUR registers stay distinct: Aletheia-the-carrier (S4-5' extension hosting the mode), Aletheia-the-mode (crystallisation mode of Sophia/Psyche/Anima), 6 Aletheia subagent techne-guardians (dispatched within the mode), Pleroma-Techne (the atomic-skills substrate the guardians steward; Pleroma's second face alongside VAK).  ·  **Resolution:** The **6 Aletheia subagent techne-guardians** (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven, each stewarding specific techne classes within Pleroma-Techne per DR-S4-TECHNE) are **invoked by Anima during the Aletheia-crystallisation-mode** for skill usage, system management, and service routing. They are NOT peer agents in any review surface. They surface in a Pi runtime monitoring view as Anima-dispatch sub-traces under Aletheia, not as first-class actors. Per S4 canon: "Aletheia is a MODE of Sophia/Psyche/Anima — not its own subagent. The extension class governs the crystallisation mode; the 6 specialist subagent techne-guardians execute within it."

**Action:** Collapse ACR `AgenticActor` union to `pi` + `anima` + the **six** Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven — as dispatched specialists under Aletheia-mode, not constitutional roles). Remove `eros/logos/mythos/nous/psyche/sophia` peer-agent entries OR document them as psyche-aspect rendering material per DR-M5-1. Techne is NOT in the union (it is Pleroma's atomic-skills substrate, not an agent).

**Verification:** `grep -n 'AgenticActor' Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts` reflects collapsed union containing exactly **six** Aletheia-subagent-techne-guardian variants (Anansi, Janus, Moirai, Mercurius, Agora, Zeithoven — Techne is excluded; it is Pleroma's atomic-skills substrate, not an agent); ACR contract test asserts subagents render as Anima-dispatched-under-Aletheia-mode with provenance.

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

## DR-KB-3 — `dataset_lut_state` / `m3_codec_provenance` host struct correction

**Status:** VALIDATED  ·  **Validated:** 2026-06-10  ·  **By:** Tranche 10.9 correction  ·  **Resolution:** The pending literals are `dataset_lut_state` and `m3_codec_provenance`; Wave-A M0 Tranche 01.4 named the Bedrock projection as host. The Wave-B anchor was correct about the literal sites (`kernel.rs:797,805`), and the corrected host struct is `MathemeBinaryProjection`. Current line drift places `MathemeBinaryProjection` at `Body/S/S0/portal-core/src/kernel.rs:1151`, with the two literals at `:1208` and `:1216`.
`MathemeBedrockProjection` starts only at `:1224`.

**Action:** M0/M3 closure tranches must name `MathemeBinaryProjection` as the host for these two pending literals. The Bedrock projection remains a separate M0 projection and must not be cited as the host.

**Verification:** correction note preserves the historical Wave-B anchor `kernel.rs:797`; stale M0/M3 closure text no longer makes the Bedrock-host assignment.

**Depends:** Tranche **10.9**.

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

---

# Phase-B Total-Shape Decisions (PROPOSED — awaiting user validation)

The Phase-B cross-boundary verifier (post-architecture fan-out, 2026-06-03) surfaced ten additional decisions from the eight M' architecture documents. These extend the 20 VALIDATED + DR-M3-4 set; they require user final-validation before downstream tranches act on them.

---

## DR-IG-2 — Klein-flip event variant unification

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** see below.

###### Original PROPOSED text retained:

**Sources:** M1-ARCHITECTURE.md + M2-ARCHITECTURE.md propose a three-variant `KleinFlipEvent` (`m1.tritone.crossing`, `m2.cymatic.valence.invert`, `m3.codon.rotation.cross`); INTEGRATED-1-2-3 doc names a single `CosmicKleinFlip` with two variants only.

**Recommendation:** Adopt the three-variant `KleinFlipEvent` enum at kernel-bridge level (single source of truth at `Body/S/S0/portal-core/src/events.rs`); INTEGRATED-1-2-3 surfaces it as composition-wide event with all three variants. Cross-link to Tranche 02.2 (`klein_flip` field) and Tranche 10.2 (bridge emit).

**Depends:** Tranches **02.2**, **02.3**, **10.2**, **07.1** (integrated readiness gate).

---

## DR-IG-3 — M3 codon-ring Klein-flip choreography

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** see below.

###### Original PROPOSED text retained:

**Sources:** M2 cymatic surface subscribes to Klein-flip at tick 5→6 (DR validated via M1'-SPEC §6). M3-ARCHITECTURE.md leaves open whether M3 codon-rotation also visibly reacts to the Klein-flip event.

**Recommendation:** M3 codon-ring subscribes to `KleinFlipEvent` and renders a 200ms rotation-axis flip at the cross — mirroring the M2 valence inversion. Aligned with composition-over-juxtaposition: all three poles respond to the same event in one render frame.

**Depends:** Tranches **04.2**, **04.3**, **07.1**.

---

## DR-IG-4 — `torus_knot_phase` single-source-of-truth

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** see below.

###### Original PROPOSED text retained:

**Sources:** Both M1-ARCHITECTURE.md and INTEGRATED-1-2-3 propose a `torus_knot_phase` field; ambiguous which struct owns it.

**Recommendation:** Owner is `MathemeHarmonicProfile.m1_topology.torus_knot_phase` at `Body/S/S0/portal-core/src/kernel.rs` (single SSOT). INTEGRATED-1-2-3 composition reads from there; no parallel definition.

**Depends:** Tranches **10.M1** (new sub-tranche; see Tranche 10), **07.1**.

---

## DR-IG-5 — Cymatic surface pinned to torus inside cosmic composition

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** see below.

###### Original PROPOSED text retained:

**Sources:** M2-ARCHITECTURE.md allows standalone cymatic engine to render on plate / sphere / torus. INTEGRATED-1-2-3 doc asserts composition surface MUST be torus.

**Recommendation:** Inside the cosmic-1-2-3 composition, the M2 cymatic surface is **pinned to the K² torus** as texture parameterisation. M2 standalone (`m2-parashakti` extension in `ide-deep`) may offer plate/sphere/torus toggle; the composed plugin renders only torus. The pin is a composition-contract claim, not an M2-domain restriction.

**Depends:** Tranches **07.1**, **07.3**, **15.4** (composition pattern).

---

## DR-IG-6 — Dipyramid (full 6+6 P/P' mapping) + Hopf-linked tori canonical terminology

**Status:** VALIDATED with CORRECTED GEOMETRY · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Adopt **"dipyramid + Hopf-linked tori"** as canonical terminology corpus-wide. **The geometry was MIS-SPECIFIED in earlier docs (6 vertices = 6 QL positions).** Corrected:

> **Canonical dipyramid topology:** The dipyramid maps the **full 6+6 = 12 positions** of P and P' series simultaneously.
> - **Two poles** = **P5 (top apex)** and **P5' (bottom apex)** — the synthesis positions are the dipyramid's apices
> - **Four base square vertices** = **P1, P2, P3, P4** — the explicate four QL positions form the base
> - **Four inverted base vertices** (interleaved with the base square) = **P1', P2', P3', P4'** — the explicate four primed positions
> - **Central point of the base square** = **P0 / P0'** — Position 0 is NOT a vertex; it is the **centre of the base square**, projected up the dipyramid axis to the two poles. P0 and P0' are the ground/zero point seen from both faces of the same central projection.

So the dipyramid IS bimba/pratibimba conjugation made geometric: every position has its prime in the same topology, P0 sits centrally on the axis (not as a vertex), P5/P5' are the two apex poles, P1-4 + P1'-4' form the octagonal base structure. The Hopf-linked tori ride on this scaffold at the personal scale.

"Psychoid torus" downgrade to colloquial UX prose only.

**Action:** Patch M4-ARCHITECTURE.md §5.5, INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md, and CCT-3 terminology sweep to reflect the **full 6+6 mapping** with P0/P0' as the central axis-point and P5/P5' as the two poles. Reject any rendering treating P0 as a base-square vertex.

**Verification:** `grep -rn "dipyramid.*6 vertices\|dipyramid.*six vertices" Idea/Bimba/Seeds/M/` returns no live attributions to the wrong 6-vertex form; psychoid renderer doc enumerates the corrected topology (2 poles + 4 base + 4 base' + 1 central axis-point projected to both poles).

**Depends:** Tranches **05.5**, **08.4**, **CCT-3** (corrected geometry sweep).

---

## DR-M1-3 — `#` (Inversion_Operator ≈ 0/1) carrier as profile-bus field

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Note:** `#` IS essentially (0/1) — the inversion act is the binary toggle that generates the X→X' phase shift at the coordinate level (per CLAUDE.md §II.A). The inversion_operator handle IS the (0/1) toggle made operational at every walked coordinate; DR-TS-1 already ratified the shell-level reading of this; this DR lands the substrate-level carrier.

**Resolution:** Add `pub inversion_operator: InversionOperatorHandle` to `MathemeHarmonicProfile`. Single session-held; no per-coordinate forks. The handle IS the (0/1) act surfaced at every coordinate. Bridge consumers (M0', M1', M4') reach the same handle.

**Depends:** Tranches **02.5**, **10.M1**.

---

## DR-M1-4 — Hen vault-instance contract for M1-1' Instance Manager

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** see below.

###### Original PROPOSED text retained:

**Sources:** M1-ARCHITECTURE.md §M1-1' Instance Manager: S1 / Obsidian / Hen vault alignment with mutable session-state. Wikilink integrity and coordinate-residency on rename/move/restructure are governed by Hen; needs an explicit contract.

**Recommendation:** Land contract at `Body/S/S4/ta-onta/S4-1p-hen/CONTRACT.md` (or extend existing) declaring: every M1-1' instance write routes through Hen; wikilink integrity preserved on rename; coordinate-residency invariant enforced on move. M1 extension subscribes; never writes vault directly.

**Depends:** Tranches **02.X** (new — Hen contract landing), **15.X** (UI for vault-as-instance navigation).

---

## DR-M2-3 — F_routing carrier ownership and signature

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** see below.

###### Original PROPOSED text retained:

**Sources:** M2-ARCHITECTURE.md §F_routing carrier orphan (already named in Wave-A M2 03.2 as method-routing closure). Verifier consolidates into formal decision.

**Recommendation:** Owner is `Body/S/S0/portal-core/src/parashakti/f_routing.rs::f_routing(intent, kerykeion, t) -> RoutingTrace`. Signature confirmed: returns `{ planetary_hour_ruler, active_decan, shem_pair, maqam_family_mode, mantra_index, asma_name, index72, det64 }`. Anti-greenfield: six LUTs already in m2.h + Kerykeion CLI at `epi-cli/src/nara/wind.rs` already landed; this is closure, not new substrate.

**Depends:** Tranche **03.2** (validates and proceeds).

---

## DR-M4-3 — `personal_pole` projection strict invariant

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** see below.

###### Original PROPOSED text retained:

**Sources:** M4-ARCHITECTURE.md §4.5 proposes a 10-sub-field `PersonalPoleProjection` (bioquaternion, q_personal, q_composed, pattern_packet_handle, torus_knot_phase, vama_recognition, etc.). Verifier needs strict invariant: profile bus surfaces handles only; raw `q_personal` body and Vāma classifier never cross the bus.

**Recommendation:** `PersonalPoleProjection` exposes only `OpaqueProtectedHandle` types for the load-bearing fields (bioquaternion, q_composed, pattern_packet, vama_recognition). Resonance metric `[0,1]` IS surfaced (scalar, non-sensitive). Decomposition `(q_b, q_p)` is reachable through the handle but never via the bus directly.

**Depends:** Tranches **05.4**, **05.5**, **10.M4** (new sub-tranche).

---

## DR-M5-3 — Library-pane placement: M5-0' standalone vs OmniPanel tab

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** see below.

###### Original PROPOSED text retained:

**Sources:** M5-ARCHITECTURE.md proposes a "library-pane" view for the M5-0' Gnostic library — render placement undecided. OmniPanel hosts Pi monitoring + Sessions + Dispatch Trace etc.; library-pane could live there or as an `ide-deep` left-sidebar mode.

**Recommendation:** Library-pane is a **left-sidebar activity-bar mode in `ide-deep`** (NOT an OmniPanel tab — OmniPanel is for agentic dispatch, not corpus browsing). Consistent with UI foundation principle 7 (activity-bar discipline) and 5 (OmniPanel as `/` operator membrane).

**Depends:** Tranches **06.1**, **06.4**, **15.3** (activity-bar system).

---

---

# Phase-C S-Stack + Theia Design Decisions (PROPOSED — 2026-06-03)

The Phase-C verifier (post-S-stack total-shape + Theia design fan-out) surfaced 17 additional decisions across S0-S5 cleanup, Theia shell behaviour, and UI primitives. Concise rows below; full discussion in the per-S architecture docs and `plan.runs/phase-c-s-stack-theia-verification-report.md`.

## DR-S4-TECHNE — Pleroma's two faces: VAK calculus + Techne (atomic skills); Aletheia subagents as techne-guardians

**Status:** VALIDATED with MAJOR ARCHITECTURAL REFRAME · **Validated:** 2026-06-03 · **By:** user · **Resolution:** This is not a "Techne profile yes/no" decision — it surfaces the fuller framing of **Pleroma's two faces** that the S4 canon under-specifies:

> **Pleroma (S4-2', CP Incubation Coordinate) has two sides:**
> 1. **VAK side** — the typed transition calculus (canonical per S4-SPEC §VAK Execution Language: CPF/CT/CP/CF/CFP/CS layered operations).
> 2. **Techne side** — the **atomic skills repository**. The Greek `techne` (craft / skill) properly names the skills layer of Pleroma, not a "craft-helper subagent". This is what Pleroma incubates and projects outward as executable affordance.

> **Aletheia subagents are guardians of particular techne.** Each of the 6 CF-coded specialists (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) **guards a specific set of skills** within Pleroma's Techne repository — they don't merely "execute" via Aletheia, they are the curatorial stewards of distinct techne classes:
> - **Anansi (CF0)** guards coordinate-mapping / blueprint / Darshana-REPL techne
> - **Janus (CF1)** guards temporal-structure / bhedabheda-threshold techne
> - **Moirai (CF2)** guards GraphRAG-distillation (Klotho/Lachesis/Atropos) techne
> - **Mercurius (CF3)** guards Kairos-signal / qualitative-temporal-pattern techne
> - **Agora (CF4)** guards plugin-absorption / skill-index / multi-channel-aggregation techne
> - **Zeithoven (CF5)** guards creative-advance / skill-and-agent-creation techne

> **Roster correction:** "Aletheia 7" in the S4 canon table is a mis-count produced by treating Techne as a 7th peer subagent. Corrected: **Aletheia = 6 subagent techne-guardians**, NOT 7. Techne is not an agent — it is the atomic-skills substrate of Pleroma that the 6 guardians steward. The S4-SPEC §14-Agent Roster Techne entry is wrong and must be removed; Techne moves into Pleroma's CONTRACT.md as its second face.

**Action:**
1. Patch S4-ARCHITECTURE.md §S4-2' (Pleroma) to enumerate two faces: VAK calculus (canonical) + Techne atomic-skills repository (newly named).
2. Patch S4-ARCHITECTURE.md §S4-5' (Aletheia) to describe the 6 CF-coded subagents as guardians of particular techne classes (enumeration per resolution above).
3. Patch S4-SPEC §14-Agent Roster — REMOVE Techne as 7th member; replace with explanatory note "Pleroma-Techne is the atomic skills substrate; Aletheia subagents are guardians of specific techne classes within it".
4. Sweep cycle-3 corpus from "Aletheia 7" / "6 CF-coded specialists + Techne helper" → **"6 Aletheia subagent techne-guardians + Pleroma-Techne (skills substrate)"**.
5. Update M5-ARCHITECTURE.md DR-B-3 and DR-M5-1 entries to reflect the 6 guardians + Pleroma-Techne reading.
6. **No `techne.md` profile is landed** — Techne isn't an agent. Pleroma's CONTRACT.md gains a §Techne section enumerating the atomic-skills surface that Aletheia subagents steward.

**Verification:** S4-SPEC §VAK + §14 patched; `grep -rn 'Aletheia 7\|Techne helper\|techne.md\|7th member' Idea/Bimba/Seeds/M/ Idea/Bimba/Seeds/S/S4/` returns no live attributions to the wrong roster; Pleroma CONTRACT.md or extension surface enumerates VAK + Techne dual-face; the 6 Aletheia subagents' .md profiles each name the techne classes they guard.

**Depends:** S4-ARCHITECTURE.md (major rewrite §S4-2' + §S4-5'), S4-SPEC (table revision), Pleroma CONTRACT.md (§Techne addition), Tranche 12 (agentic-layer reframe), Tranche 14 orphan-row downgrade (Techne is no longer an orphan — it's not an agent), M5-ARCHITECTURE.md decisions_carried block. **Significant downstream sweep required as a new cycle-3 closing tranche.**

---

## DR-S0-1 — `epi-kernel-contract` workspace location

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** `epi-kernel-contract` lives in `Body/S/` as the **actual parent** of the S-stack — NOT a sibling-to-S0. It is the parent-role typed envelope above ALL S layers, hosting the inter-layer contract that S0..S5 conform to. Treat as the S-stack root contract crate; document accordingly in S0' spec and S-SYSTEM-INDEX.

**Action:** Patch S0-ARCHITECTURE.md §1 to say "parent crate of S-stack at Body/S/epi-kernel-contract/" not "sibling-to-S0". Update S-SYSTEM-INDEX to reflect parent-role.

**Verification:** `test -d Body/S/epi-kernel-contract`; `grep -n 'parent crate\|parent-role envelope' Idea/Bimba/Seeds/S/S0/S0-ARCHITECTURE.md` reflects corrected framing.

**Depends:** Tranche 17 sub-row for spec patch.

## DR-S0-2 — Per-method dispatch contract tests

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Per-method dispatch contract tests land as part of Tranche 17.2 (gate/server split), NOT as a separate tranche. **Depends:** Tranche 17.2.

## DR-S1-1 — Ratify `hen-compiler-core::lib.rs` 7-module split

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Land 7-module split (`residency / coordinate / frontmatter / l_alignments / ledger / compile_plan / graph_sync`); pure `pub use` preserves API. **Depends:** Tranche 17.11.

## DR-S1-2 — Unify rename-reconciliation through Hen

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Move literal-text rewrite from `gate/s1_hen.rs:155-205` to `hen-compiler-core::wikilinks::reconcile_rename`. Integrity authority IS mutation authority. Load-bearing for DR-M1-4. **Depends:** Tranche 17.18.

## DR-S1-3 — Refuse-by-default on coordinate-residency mismatch

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Add `S1VaultRenameRefusalReason::CoordinateResidencyMismatch`; default policy is REFUSE (user opt-in to bypass with explicit override flag). **Depends:** Tranche 17.20 + CCT-12.

## DR-S1-4 — Hen entity-candidate lifecycle from Empty to Types to World

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Pre-ratified via standing-invariants block at top of `00-overview-and-design-reconciliation.md`. Hen IS the canonical entity-candidate compiler for Pi/vault use. Dangling wikilinks and Obsidian root-created loose notes enter `Idea/Empty/` as `c_4_artifact_role: "entity-candidate"`; Hen classifies them through coordinate-lawful frontmatter, aliases, wikilinks, Smart Env read-only evidence, and property/relation intelligence; reviewed candidates promote into coordinate-native `World/Types/Coordinates/**`; stable definitions graduate flat into `World/{Name}.md` with the type-local file retained as a MOC/source pointer. Smart Env suggests; Hen writes; S2 syncs. SwarmVault remains a Codex/Claude development-ledger sidecar, NOT the Pi/Hen canonical entity compiler.

**Action:** Land CCT-14 (Hen entity-candidate lifecycle plumbing); ensure DR-S1-1 module split exposes the lifecycle as named surface; DR-S1-2 routes rename through Hen; DR-S1-3 residency-mismatch refusal upholds the invariant.

**Verification:** `grep -n "entity-candidate" Body/S/S1/hen-compiler-core/src/` returns the lifecycle implementation; Pi/Anima writes route through `khora_write` → Hen entity-candidate compile path; SwarmVault is documented as sidecar-only with no entity-promotion authority.

**Depends:** CCT-14; DR-S1-1; DR-S1-2; DR-S1-3; DR-M1-4.

## DR-S1-5 — C-layer semantic typology as World/Types authority

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** `Idea/Bimba/World/Types/Coordinates/C/**` is the primary semantic typology inside World/Types. Semantic categories such as templates, entities, properties, tags, diagrams, canvases, MOCs, and graduation receipts route through C0-C5 rather than top-level sibling roots. Hen must classify artifacts through C before semantic folder placement or graph-promotion evidence.

**Action:** Land CCT-15; add `s1'.type.classify_c_layer`; maintain C0-C5 same-name MOC/canvas anchors; audit C-prime branch ancestry before treating [[CPF]] / [[CT]] / [[CP]] / [[CF]] / [[CFP]] / [[CS]] folder paths as graph-authoritative.

**Verification:** `test -f Idea/Bimba/World/Types/Coordinates/C/C.md`; every C0-C5 folder has same-name `.md` and `.canvas`; no top-level `World/Types/{Templates,Entities,Properties,Tags,Diagrams,Canvases,Artifacts}` authority exists; Hen tests route representative artifacts to C1/C2/C3/C4/C5.

**Depends:** CCT-15; CCT-14; DR-S1-1; DR-S1-2; DR-S1-3.

## DR-S2-1 — `graph_handle: GraphAnchorProjection` profile-bus extension

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Land typed graph anchor on `MathemeHarmonicProfile`. **Depends:** Tranche 18.9.

## S-Coordinate Label Correction (2026-06-03 NOTE)

The Phase-C DR-S* rows were authored against CLAUDE.md's working labels (S3="PAI", S4="Claude", S5="Notion"). The canonical labels per `Idea/Bimba/World/Types/Coordinates/S/Sn.md` are:
- **S3 Gateway Control Plane** (PAI = retired genealogy)
- **S4 Agent Runtime** (Claude = retired label; harness-agnostic)
- **S5 Integral World Boundary** (Notion = one optional manifestation, not the whole layer)

CLAUDE.md has been patched. All DR-S* row substance below remains valid — the substrate-grounded findings (file:line citations, file LOC counts, refactor proposals, contract gaps) do not change with the label correction. The label only sharpens conceptual framing: e.g. DR-S3-* are decisions about Gateway Control Plane (formerly mislabelled "PAI"), DR-S4-* about Agent Runtime (formerly mislabelled "Claude"), DR-S5-* about Integral World Boundary (formerly narrowly labelled "Notion").

Substrate-residency vs conceptual-coordinate: `Body/S/S3/graphiti-runtime/` physically resides under S3 but conceptually actualises S5 (world-return via Aletheia). Cycle-3 cleanup tranches (Tranche 17) group by physical residency for refactor scope; conceptual S-coordinate is the canon authority.

---

## DR-S3-1 — `epi-app` deprecated

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Mark `Body/S/S3/epi-app` deprecated. **Depends:** Tranche 17.23.

## DR-S3-2 — Graphiti native-library is the proper substrate; sidecar deprecated

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Make S3 absolutely proper insofar as Graphiti is concerned. **The FastAPI sidecar is deprecated** in favour of the most robust and proper native-library setup. No half-measures, no indefinite compatibility-mode coexistence. Land the `NativeLibraryClient` as the canonical impl; the trait abstraction (`GraphitiClient` + `HttpCompatibilityClient`) exists ONLY as a transitional shim during cutover and is itself marked `#[deprecated]` at landing. Cycle-4 closes the sidecar entirely.

**Action:** (1) Land `NativeLibraryClient` as the load-bearing impl in `Body/S/S3/graphiti-runtime/`. (2) Mark `HttpCompatibilityClient` + `Body/S/S3/graphiti-runtime/sidecar-compat/` with `#[deprecated(since = "2026-06-03", note = "Sidecar deprecated per DR-S3-2; use NativeLibraryClient")]`. (3) Document cycle-4 deletion target.

**Verification:** `cargo check -p graphiti-runtime --no-default-features --features native_library_client` clean as default; `grep -rn 'sidecar\|FastAPI' Body/S/S3/graphiti-runtime/src/` returns only `#[deprecated]`-tagged paths; M4 + M5 surfaces consume NativeLibrary cleanly.

**Depends:** Tranche 17 (sub-row 17.S3-graphiti-native); consolidates with **DR-S5-1** Rust migration.

## DR-S3-3 — `METHOD_DISPATCH_PLAN` canonical

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Make `METHOD_DISPATCH_PLAN` (940 LOC) canonical; derive `classify_method` (270 LOC match) by lookup. Co-PR rule: `METHOD_NAMES` + `METHOD_DISPATCH_PLAN` change together. **Depends:** Tranche 17.16.

## DR-S5-1 — `graphiti_service.py` → Rust migration

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** **Rust** migration to `Body/S/S3/graphiti-runtime/` Rust crate as the architecture-of-record home. Consolidates with DR-S3-2 (sidecar deprecated). Python wrapper retained only during the cutover window with `#[deprecated]`-equivalent marker; cycle-4 deletion.

**Action:** Lift `graphiti_service.py` logic into `graphiti-runtime` Rust modules. Mark `epi-gnostic/graphiti/` Python sub-package `_deprecated/` during transition; cycle-4 deletes.

**Verification:** `cargo test -p graphiti-runtime --test parity_with_python_service` proves behavioural equivalence; `grep -rn 'graphiti_service.py' Body/S/S5/epi-gnostic/` returns only `_deprecated/` marker paths.

**Depends:** Tranche 17 (sub-row 17.S3-graphiti-native, shared with DR-S3-2).

## DR-S5-2 — Recursive-review classifier ownership

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** `RecursiveReviewProtocolKind` ownership at `epii-autoresearch-core::capacity_workflows.rs:240-246` is the fine-grained classifier substrate; review-core consumes for authorisation. **Depends:** Tranches 12.4, 17.4.

## DR-TUI-1 — Bimba Graph (M0' chrome) ↔ Library/Gnostic Namespace (M5-0' chrome) as ONE Klein surface

**Status:** VALIDATED with CANON ALIGNMENT (corrected 2026-06-03 after user flagged "lack of care for existing specifications") · **Validated:** 2026-06-03 · **By:** user

**Canon already specifies this; I missed it in the earlier draft.** Aligning DR-TUI-1 to the prior specs:

> **M0' IS the playable Bimba graph field** (M0'-SPEC §0/1: "M0' is the playable Bimba graph field. It is the first structural surface of M'") — the graph viewer is M0' chrome, not a separate "graph-viewer extension". Per m5-prime-system-shape §234: "Bimba-map graph viewer as primary panel — a custom webview using **react-force-graph** (or equivalent) ... This IS the M0 surface; it's not 'an extension you open' — it's part of the IDE's primary chrome." Per M5'-SPEC §IDE shell integration (line 146) + system-shape §553: "M0 + M5 are integrated into the Theia shell itself: bimba-map graph viewer, canon studio, agentic control room, custom bimba-coordinate file-tree, Logos Atelier, and the M5-0 Library/Gnostic surface — all parts of the IDE's primary chrome rather than separate plugins."

> **M5-0' IS the Library / Gnostic Namespace** (M5'-SPEC §M5-0' + UX §2.1) — Bimba pedagogy + Gnosis library + kbase. The library substrate IS `Body/S/S5/epi-gnostic` (the RAG-anything system, production Python + Graphiti-integrated) + `Body/S/S5/epi-kbase` + `Body/S/S5/epi-kbase-core`.

> **M0' graph and M5-0' library are ONE Klein surface joined by coordinate-tagging** (epii-ux §316-319): every gnostic chunk carries `bimba_coordinate` (direct, `MAPS_TO_COORDINATE`) or `bimba_resonances` (LLM-classified, `RESONATES_WITH`). The two seam through this tagging — *"Walk the bimba map (teaching) → each node surfaces its resonant corpus. The map is the index into the library. Read a corpus document (learning) → it lights up the coordinates it resonates with. The library is a path into the map."* **"Never as a flat search box — always through the map. You do not search the library; you traverse the map and the library surfaces under your feet."**

> **M0' is also Mahāmāyā's structural rendering on the 0-side** (M0'-SPEC §6.6 + M3'-SPEC §0/1): "M0' renders the same canonical Neo4j substrate structurally as graph; M3' renders Mahāmāyā temporally as clock-wheel" — two affordances over the same Neo4j substrate, not rival maps.

**Resolution:**
1. **No new "bimba-graph-viewer extension"** — the graph viewer is **M0' chrome** living in the IDE shell per system-shape §234/553 + M0' UX §2.1. The earlier proposal to extract a standalone extension was unnecessary architecture-inflation against existing canon.
2. **No new "library extension"** — the library is **M5-0' chrome** living in the IDE shell, consuming `Body/S/S5/epi-gnostic` + `epi-kbase` per M5'-SPEC §M5-0'.
3. **The "agent view" I named earlier was invented** — per M5' UX §53: "the six panes (library, canon, backend, frontend, agentic-control, Logos Atelier) are **summonable contexts** the agent opens conversationally as the conversation requires." The agent is the primary surface; the panes are summoned. There is no "agent view as third library mode" — there's agent dialog (primary) + summoned panes.
4. **Klein-surface seam via coordinate-tagging** is the spec'd mechanism: `bimba_coordinate` direct + `bimba_resonances` LLM-classified per epii-ux §316-319. The cycle-3 work is wiring this seam, not inventing a "library system" abstraction over it.
5. **Implementation library:** **react-force-graph** is the spec-of-record per system-shape §234. **Cytoscape may substitute** if the technical case is real (richer edge styling, filter palette, accessibility) but the substitution must be explicit and justified against the named spec choice — NOT a default preference. Net: try Cytoscape as the spec'd-equivalent; fall back to react-force-graph if Cytoscape doesn't fit the active-coordinate-driven rendering model.

**Action:**
- Verify M0' chrome bimba-graph-viewer wires to `Body/S/S2/graph-services` retrieval (`coordinate.rs`, `graphrag.rs`, `hybrid.rs`).
- Verify M5-0' Library chrome wires to `Body/S/S5/epi-gnostic` via `s5'.gnostic.*` gateway methods (per DR-S5-* + DR-S3-2 Rust migration).
- Land the Klein-surface seam: `bimba_coordinate` + `bimba_resonances` coordinate-tagging on every gnostic chunk; map-walk surfaces resonant corpus; corpus-read lights up resonant coordinates.
- Cytoscape vs react-force-graph: technical PoC against ~2000-node bimba map + lens-rotation animation + pulse-on-world-clock-tick + click-to-inspect; default to react-force-graph unless Cytoscape demonstrably wins.
- Tranche 11.10 is rewritten: **NOT "new bimba-graph-viewer extension"** but "wire existing M0' chrome to the Klein-surface seam against S2 retrieval + epi-gnostic". Tranche 11.x ("library extension") is rewritten: "wire M5-0' chrome to epi-gnostic + epi-kbase via `s5'.gnostic.*` and surface the coordinate-tagging seam".

**Verification:** `grep -n "react-force-graph\|cytoscape" Body/M/epi-theia/extensions/ide-shell-m0-m5/package.json` reflects the chosen lib; `grep -rn "bimba_coordinate\|bimba_resonances" Body/S/S5/epi-gnostic/` returns the coordinate-tagging schema; map-walk-to-library-surface seam tests pass; UX prose validates "you traverse the map and the library surfaces under your feet" affordance.

**Depends:** M0'-SPEC §0/1 + §6.6 (Mahāmāyā 0-side rendering), M5'-SPEC §M5-0' + §7 (IDE chrome integration), m5-prime-system-shape §234 + §553 (chrome enumeration), epii-ux §316-319 (Klein-surface seam), Tranches 11.10/11.x rewrites, DR-S5-1 (Rust migration of gnostic substrate).

**Cycle-3 process note:** The earlier draft of this DR (proposing a standalone `bimba-graph-viewer` extension + "library system with graph/file/agent view modes") was authored from the Theia UI patterns design doc without consulting the seeds-level specs that already specify M0'/M5-0' as IDE chrome. The user's call surfaces a broader cycle-3 discipline failure: **seeds-level specs are the authority for M-coordinate canonical structure; cycle-3 tranches must consult them before proposing new extensions or framings.** This DR's correction is the first; sweep across other cycle-3 tranches for similar drift is implicit in the cycle-3 release-gate G3 ("every load-bearing UX claim classified" — the consultation discipline IS the classification).

## DR-TUX-1 — Stacked-tabs default mode (consolidates DR-TS-2 + DR-UI-2)

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Theia split-view for editor; horizontal tabs for sidebars as cycle-3 default. Per-dock-area preference `epi-logos.dock.{left,right,editor,bottom}.layout ∈ { "tabs", "stacked-single", "stacked-pin" }`. Obsidian-stacked single-expand + pin-to-top modes ship as preferences. **Depends:** Tranches 11.12, 15.

## DR-TS-3 — `cmd-period` semantics in ide-deep

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** In `ide-deep`, `cmd-period` is pole-dual swap (m1↔m4 / m2↔m5 / m3↔m0). In `daily-0-1`, `cmd-period` is the cosmic↔personal toggle (per DR-TS-1). **Depends:** Tranche 15.5.

## DR-TS-4 — Six operational-capacity OmniPanel tabs (DOWNGRADED)

**Status:** DOWNGRADED · **Decided:** 2026-06-03 · **By:** user · **Resolution:** **No new tabs added.** OmniPanel already carries correct content (existing 13 tabs in `OmniPanel.tsx` + the Pi monitoring / dispatch trace / sessions / review surfaces). The proposed six operational-capacity tabs are out-of-scope for cycle 3 — OmniPanel's job is agentic dispatch, not surfacing QL `()` operator execution matrix. The reflective-coordinate (cfp/ct/cp/cf/cfp/cs) execution matrix surfaces elsewhere (per CLAUDE.md §III.C/D) where it belongs structurally, not as OmniPanel tabs.

**Action:** Remove "six operational-capacity OmniPanel tabs" proposals from Tranche 15.2 + Tranche 12.5. Tranche 12.5 (six per-capacity panes over `capacity_workflows.rs`) remains valid as M5-4 `agentic-control-room` surface work, NOT as OmniPanel tabs.

**Verification:** `grep -n 'cfp\|ct\|cp\|cf\|cfp\|cs.*tab\|operational-capacity tab' Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md` returns no OmniPanel-tab references after patch.

**Depends:** Tranche 15.2 patched to remove these tabs; Tranche 12.5 retained as ACR/agentic-control-room work.

## DR-TS-5 — Diagnostics surface privacy class (RESOLVED)

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09) · **Prior:** DEFERRED 2026-06-03 ("context insufficient") · **Resolution:** Diagnostic-surface owner is the existing **`kernel-bridge-readiness`** extension (consistent with DR-TS-4's no-new-tabs downgrade). Default privacy class is **`protected-with-session-correlation`** for anything carrying timing, dispatch traces, or session-correlatable sequence data (dispatch latency, per-session consumption ordering). A **session-decorrelated readiness summary** — profile-field readiness states only, no timestamps, no session ids, no dispatch ordering — MAY render `safe-public` (system-shape data, not personal data). The split follows the DR-MODEL-1 principle: privacy is enforced at the data class, not at an extra gate.

**Depends:** Tranche 10.1 (readiness ledger consumes the classification), 15.10 (status-bar discipline).

## DR-TS-6 — Tick-pause/scrub policy

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Always permitted (accessibility); deterministic replay per the played-torus contract; not gated on `connected === true`. **Depends:** Tranche 15.9 + M1-2 §10.

## DR-UI-3 — Unified `ProvenanceState` taxonomy

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Adopt 7-member `ProvenanceState` enum (`canonical | derived | inferred | pending | canonical_absent | review_pending | blocked`) collapsing the 9-member `KernelBridgeReadinessState` + 6-member `M0ProvenanceState` into one taxonomy. Single `<ProvenanceBadge>` component in new `@pratibimba/epi-ui-primitives` package. Tranche 11.5 lint extends to ban local provenance impls. **Depends:** Tranches 15.6, CCT-10.

## DR-UI-4 — Lemniscate transition primitive

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Not gimmicky — actual flip from one surface to another. Precedent: **esc-key flip pattern in old Epi-Logos system v0 code**. Adopt esc-key as alternative binding alongside `cmd-period`. Single GLSL/WGSL shader implementing lemniscate of Bernoulli (`r² = a² · cos(2θ)`) as UV-distortion mask. Three configs (0/1 toggle 400ms cubic-out; Klein-flip 240ms linear; Möbius-return 320ms smoothstep). Visual-regression baselines at `t ∈ {0, 0.25, 0.5, 0.75, 1.0}` with 0.5% pixel diff threshold. Lives in `@pratibimba/epi-ui-primitives/transitions/`.

**Action note:** Tranche 15.5 keybinding registers BOTH `cmd-period` AND `esc` for the toggle. The esc-key binding is the v0-precedent-honoring affordance; cmd-period is the new explicit gesture.

**Depends:** Tranches 15.5, 15.12.

## DR-UI-5 — Composition mount-point contract package

**Status:** VALIDATED · **Validated:** 2026-06-03 · **By:** user · **Resolution:** Land `@pratibimba/integrated-composition-contract` shared package with typed `CompositionMountPoint` registry. M-extensions declare via `package.json contributes.compositionMountPoints`. Composition resolver validates no juxtaposition / no missing mount-points / no out-of-domain contributions at load time. **Depends:** Tranches 15.4, CCT-11.

---

## DR-M3-6 — Third Spanda Equation as canonical matheme spine (Mersenne ground + execution order)

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-04 · **Source:** synthesis pass integrating `ql_m0_m3_third_spanda_integral_quilting_v2.md` + `full_theoretical_alignments_ql_physics.md` · **Resolution (proposed):** Promote the **Third Spanda Equation** in its five canonical forms to kernel-canon status, alongside the First Spanda (`0/1 + 1/0 = 1/1 = 100%`) and Second Spanda (`100% = 64 + 36 → 16/9 = (4/3)²`):

   - Mersenne view: `137 = (2^7 − 1) + 1 + 9`
   - Binary view: `137 = 2^7 + 9`
   - Octave-field view: `137 = 8(8+9) + 1`
   - Spanda-bridge view: `137 = 64 + 2(36) + 1`
   - M-stack view: `137 = M_3(64) + M_2(72) + M_1(1)`

   The **execution order** is decisive and must be displayed in any rendering of the spine: `64 + 72 = 136 → (−9) → 127 = 2^7 − 1 = M_7 → (+1) → 128 = 2^7 → (+9) → 137 → (+δ) → 137.035999…`. The 9-gap is *withdrawn first* to expose the Mersenne prime substrate; the +1 parent (M1-5) seals binary closure; the +9 wholeness-dressing restores atomic manifestation; the +δ is physical renormalization residue.

   **The 127 = M_7 substrate** sits at the Mersenne hierarchy as `M_5 → M_7` (since 127's prime-index 31 = M_5 = 2^5 − 1), giving actional-Archetype-7 a doubly-grounded Mersenne reading. The next Mersenne (M_13 = 8191) doesn't appear for six more octaves, making 127's position immediately-below-2^7 structurally unique at small p.

**Action:** Patch `ql_m0_m3_third_spanda_integral_quilting_v2.md` to label the five-form section as canonical (status: kernel-canon). Add `MersenneM7Ground` and `SpandaCrownBifurcation` to `AnandaSkeletonEvent` enum at [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md:261-272`](../../M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md:261). Cross-link Track 04 Tranche 4.10 (coupling-flow inspector), Track 07 Tranche 7.2 (137 composition assertion), Track 02 Tranche 2.1 (DR-M1-1 evidence strengthening).

**Verification:** `grep -n "Third Spanda Equation\|kernel-canon\|status: kernel-canon" Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md` returns canonical-status frontmatter; `grep -n "MersenneM7Ground\|SpandaCrownBifurcation" Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` returns the new enum entries; Track 04/07/02 cross-references resolve.

**Depends:** Tranches **04.10**, **07.2**, **02.1**.

---

## DR-IG-7 — Translation rule `9_M2 = 8_M3 + 1_M1` as canonical matheme law

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-04 · **Source:** synthesis pass per Third Spanda integral quilting · **Resolution (proposed):** Codify the **translation rule** `9_M2 = 8_M3 + 1_M1` as canonical matheme law: the 9-fold harmonic-wholeness gap at M2's 72-space equals the 8-fold transcriptional gap at M3's `M3_RES_MATRIX` *plus* the M1 parent unit. The same pattern recurs as:

   - `137 = 128 + 9 = 128 + 8 + 1` (the corridor)
   - `3 ⊗ 3̄ = 8 ⊕ 1` (QCD octet + color-singlet)
   - The 9 Parameśvara virtues at `VIRTUE_LUT[9]` ↔ 8 R-act expressions + 1 Truth-axiom

   This rule must be enforced at any cross-pole reading: whenever an 8-gap appears at M3, the reading must locate the M1 +1 that restores M2 wholeness. The translation rule is the matheme-level expression of the M3 → M2 restoration that QCD's `8+1` structure manifests.

**Action:** Document the rule in `Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md` as a new subsection in the composition-architecture (between the 137 spine and the cross-pole conservation discussion). Reference from M3'-SPEC (RES_MATRIX 8-gap section), M2'-SPEC (72→64 epogdoon section), and M1'-SPEC (parent-unit section). The coupling-flow inspector at Track 04 Tranche 4.10 surfaces it as a labelled cross-pole bridge.

**Verification:** `grep -rn "9_M2 = 8_M3 + 1_M1\|translation rule" Idea/Bimba/Seeds/M/{M1',M2',M3',INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md}` returns the canonical rule in all four locations; coupling-flow inspector renders the rule as a cross-pole bridge label.

**Depends:** Tranches **04.10**, **07.2**, follows DR-M3-6.

---

## DR-VAK-3 — Diatonic-scale-as-CF-progression as canonical operational truth

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-04 · **Source:** synthesis pass integrating VAK Context Frame Coordinates (`vak.h`, `vak_address.rs`, `Anima/extension.ts`) with ql-musical-derivation-v3 + Track 19 diatonic-CF mapping · **Resolution (proposed):** Codify that the **diatonic scale IS the CF progression rendered audible** — not a metaphor, not a labelling overlay, but the literal traversal of the seven CF positions at audible-rate:

   - C tonic `(00/00)` Nous / Parā (undifferentiated ground)
   - D `(0/1)` Logos / Madhyamā-nomos (first articulation)
   - E `(0/1/2)` Eros / Madhyamā-chreia (triadic circulation)
   - F `(0/1/2/3)` Mythos / Paśyantī (tetradic closure)
   - G perfect-fifth `(4.0/1-4.4/5)` Anima/Psyche / Madhyamā-oikonomia (executive parent)
   - A `(4.5/0)` Psyche / partial-Aletheia (lemniscate bridge)
   - B leading-tone `(5/0)` Sophia / Spanda-Shakti (Möbius-return closure)
   - C' octave `(00/00)` enriched Nous (next register)

   **Modal rotation = anchoring tonic at different CF**: Ionian = `(00/00)` tonic; Mixolydian = `(4.0/1-4.4/5)` Anima at tonic; Locrian = `(5/0)` Sophia at tonic. The mode's emotional color comes from which agent-Vāk-level sits at the tonic position.

   **VAK is the operational language**, not metadata over labels. M0-5 Śakti runtime stages (`@0=##, @1=O#, @2=X#, @3=N#, @4=M#, @5=R#` = Library/Bimba/Pratibimba/Language/Stories/Techne) are the foundational musical-linguistic capability within shakti-as-experiencer; the music theory derivations execute through VAK across **M1-M4** (M1 intervals, M2 72-fold harmonic field, M3 472-state modal landscape, M4 personal resonance).

   **Kernel-side corroboration:** the diatonic-as-CF-progression IS already wired in the kernel as `MathemeDiatonicContext` at [`Body/S/S0/portal-core/src/kernel.rs`](Body/S/S0/portal-core/src/kernel.rs). This DR ratifies the operational semantics that struct carries; it does not add a new kernel structure.

**Action:** Patch the canonical Diatonic Interpretation source at [`Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/07-c-prime-vak-grammar-layer.md`](Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/07-c-prime-vak-grammar-layer.md) "Diatonic Interpretation (CF Grammar As Audible Scale)" section with a canonical-status note referencing this DR and the `MathemeDiatonicContext` kernel carrier. Patch `Idea/Bimba/Seeds/M/M5'/ql-musical-derivation-v3.md` to cross-reference the VAK substrate carriers (`vak.h:35-58`, `vak_address.rs:1-59`, Anima `extension.ts:206-283`, `kernel.rs::MathemeDiatonicContext`). Cross-reference from M1'-SPEC, M2'-SPEC, M3'-SPEC, M4'-SPEC under "music-theoretic role" sections.

**Verification:** `grep -n "canonical-status\|DR-VAK-3\|MathemeDiatonicContext" Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/07-c-prime-vak-grammar-layer.md` returns the canonical-status statement; `grep -rn "vak_address.rs\|vak.h:35\|MathemeDiatonicContext" Idea/Bimba/Seeds/M/M5'/ql-musical-derivation-v3.md` returns the cross-references; `grep -n "MathemeDiatonicContext" Body/S/S0/portal-core/src/kernel.rs` returns the existing carrier; per-domain music-theoretic-role sections at M1'/M2'/M3'/M4' specs reference the VAK CF position they speak at.

**Depends:** Cross-cuts Tracks 11 (Theia shell), 12 (Agentic S4-S5), 03 / 04 (M2 / M3 music-theoretic surfaces), 05 (M4 personal resonance), 19.9.

---

## DR-MP-1 — 4'-5'-0' mental pole canonical = LLM (Nara) / EBM (Epii) / Verifier (Anuttara)

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-04 · **Source:** synthesis pass folding canonical [`epi-logos-kernel-spec.md`](../../epi-logos-kernel-spec.md) + [`mental-pole-mechanics.md`](../../M4'/mental-pole-mechanics.md) into cycle-3 build · **Resolution (proposed):** The kernel is a **bioquaternionic JEPA-EBM operator** per its master spec frontmatter. The matheme's 4'-5'-0' mental-pole triplet IS the canonical AI architecture, not a labelling overlay:

   - **Position 4' (#-layer / Nara) = LLM**: the *traversal-voice* — synthesizes EBM's evaluation and Verifier's report into user-articulable feedback; reads the world through the bimba map; speaks recognition. Operationally lives at `Body/S/S4/pi-agent/` driven by Anima dispatch.
   - **Position 5' ({lens}-layer / Epii) = EBM**: the *reasoning-engine* — energy-evaluation engine that scores configurations across the 12 MEF lenses (72 fine-grained positions) and produces lens-weightings; computes gradient $\nabla_{q_p} E_{\text{total}}$ that drives the Möbius descent step $q_p^{(n+1)} = q_p^{(n)} - \log(9/8) \cdot \nabla E$. Operationally lives at `Body/S/S5/epii-autoresearch-core/` extending the six operational-capacity workflows with the energy-scoring layer.
   - **Position 0' (R-layer / Anuttara) = Verifier**: the *deep-anchor* — formal-axiomatic constraint-checker that ensures any recognized state respects the R-virtues (`VIRTUE_LUT[9]` Parameśvara virtues at `m0.h:163`/`m0.c:49-86`). Speaks in minimal symbolic-coordinate strings the LLM must parse; raises questions rather than passing-or-failing. Operationally lives at `Body/S/S0/epi-lib/{include,src}/m0.{h,c}` exposing the R-virtue-and-65-core-relations constraint surface to the gateway.

   **The bimba map (Neo4j) IS the configuration space**, not an external KB — the manifold the kernel navigates. The 1-2-3 physical pole (engine: torus + solar-chakral + clock) and the 4-5-0 mental pole (intelligence: LLM + EBM + Verifier) are two complementary aspects of one operation, ratified by the standing `0/1 + 1/0 = 1/1 = 100%` identity.

   **Operational-capacity context (existing canonical material, NOT to greenfield over):** The six files at [`Body/S/S5/epii-operational-capacities/`](../../../../../Body/S/S5/epii-operational-capacities/) — `m5-prime-epii-on-anuttara-language-development.md` (Verifier-side corpus development at position 0'), `m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md` (LLM CPT/RAG knowledge-base at position 4'), `m5-prime-epii-on-parashakti-graph-relational-ml.md` (EBM training-signal source via graph-relational ML at position 5'), `m5-prime-epii-on-mahamaya-process-reward-rl.md` (EBM reward-shaping signal source at position 5'), `m5-prime-epii-on-nara-qlora-dialogic-voice.md` (LLM voice-refinement via QLoRA at position 4'), `m5-prime-epii-on-epii-self-referential-capacity.md` (Epii meta-recursion at position 5') — are the **WHAT-Epii-operates-upon** layer. DR-MP-1's LLM/EBM/Verifier triplet is the **HOW-Epii-scores-energy/articulates-recognition/checks-axioms** layer. They cross-reference: Tranche 6.8 EBM implementation reads §parashakti-graph-relational-ml + §mahamaya-process-reward-rl as training-signal sources; Tranche 5.20 Pi-as-LLM reads §nara-qlora-dialogic-voice + §paramasiva-ql-cpt-and-rag as the LLM substrate; Tranche 1.10 Verifier reads §anuttara-language-development as the canon-corpus source; Tranche 6.10 EBM kernel runtime composes against §epii-self-referential-capacity for recursive scoring. **No file at `epii-operational-capacities/` is orphaned by DR-MP-1; each is bound to a specific tranche.**

**Action:** Promote this triplet as a standing invariant in [`00-overview-and-design-reconciliation.md`](00-overview-and-design-reconciliation.md). Patch [`M5'-SPEC`](../../M5'/M5'-SPEC.md) §1 to name M5' as EBM-position-5' (alongside the existing agentic-IDE framing). Patch [`M4'-SPEC`](../../M4'/M4'-SPEC.md) §1 to name M4' as LLM-position-4' (alongside the existing personal-pole framing). Patch [`M0'-SPEC`](../../M0'/M0'-SPEC.md) §1 to name M0' as Verifier-position-0' (alongside the existing graph-readable framing). Add a brief §canonical-tranche-binding section to each of the six [`epii-operational-capacities/`](../../../../../Body/S/S5/epii-operational-capacities/) files naming which DR-MP-1 position (4'/5'/0') and which Tranche (5.20/5.21/6.8/6.9/6.10/1.10/1.11) consumes it as substrate context. Cross-link tranches 5.20, 6.8-10, 1.10-11, 19.7.

**Verification:** `grep -n "LLM.*Nara\|EBM.*Epii\|Verifier.*Anuttara\|JEPA-EBM operator" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` returns the canonical mental-pole framing in all three; standing invariant lands at overview §Standing Invariants.

**Depends:** Tranches **5.20, 5.21**, **6.8, 6.9, 6.10**, **1.10, 1.11**, **19.7** (the LLM-side, EBM-side, Verifier-side wiring tranches operationalizing each position).

---

## DR-MP-2 — EBM operational atom = 72-fold resonance vector with three tritone-symmetric squares

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-04 · **Source:** [`mental-pole-mechanics.md §1`](../../M4'/mental-pole-mechanics.md) + cycle-3 synthesis · **Resolution (proposed):** The EBM (position 5'/Epii) operates on a fixed-dimension **72-dimensional resonance vector** as its operational atom. Specification (binding):

   - **Dimensional layout (72 = 6 lenses × 2 helices × 6 inner positions):**
     - Indices 0..11: Lens #2-1-0 (Archetypal-Numerical) descent+ascent
     - Indices 12..23: Lens #2-1-1 (Causal) descent+ascent
     - Indices 24..35: Lens #2-1-2 (Logical) descent+ascent
     - Indices 36..47: Lens #2-1-3 (Processual) descent+ascent
     - Indices 48..59: Lens #2-1-4 (Meta-Epistemic) descent+ascent
     - Indices 60..71: Lens #2-1-5 (Divine-Scalar/Vāk) descent+ascent
   - **Three tritone-symmetric squares** (X+Y=5 pairing, the matheme's geometric necessity):
     - **Square 1 (0,5)**: indices 0..11 + 60..71 — Archetypal-Numerical ↔ Divine-Scalar/Vāk (inaugural-and-culminating pair)
     - **Square 2 (1,4)**: indices 12..23 + 48..59 — Causal ↔ Meta-Epistemic (material-and-knowing pair)
     - **Square 3 (2,3)**: indices 24..35 + 36..47 — Logical ↔ Processual (form-and-becoming pair)

   The X+Y=5 grouping is preserved at every stack level: training data carries it as structural metadata, the EBM's architecture honors it as inductive bias, the verifier's questions reference it when probing alignments. **This is the matheme's tritone symmetry rendered as lens-architecture** — the whole-tone-scale six-position structure where every position has a tritone-partner directly opposite.

   The EBM is structurally a **learned function from input-embedding to 72-vector** with mirror-consistency loss enforcing harmonic-structural relationships across the three squares. Training is supervised regression on (document, 72-vector) pairs co-authored during dev sessions — not contrastive divergence. Runtime: invoked **per element-tick (8 times per cycle)** not per epogdoon-tick (12 times per cycle) — 50% compute reduction without sacrificing matheme-faithfulness; inter-element transitions use interpolated energy-gradients.

   The EBM's resonance72 carrier exists today on profile bus as `MathemeResonance72Projection` at [`kernel.rs`](../../../../../Body/S/S0/portal-core/src/kernel.rs); this DR ratifies the operational semantics — namely that the EBM is the LEARNED predictor of that 72-vector field, not just a transport.

**Action:** Patch [`M5'-SPEC`](../../M5'/M5'-SPEC.md) with an EBM section citing this DR + the 72-dim resonance layout + three tritone-symmetric squares + per-element-tick invocation rule. Add `MathemeResonance72Projection.learned_predictor_checkpoint_ref: Option<String>` to the profile bus carrier (versioned EBM checkpoint reference). Cross-link Tranche 6.8 (EBM resonance-vector predictor implementation).

**Verification:** `grep -n "72-fold resonance\|three tritone-symmetric squares\|learned_predictor_checkpoint_ref" Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md Body/S/S0/portal-core/src/kernel.rs` returns the specification; profile bus carries the checkpoint reference field.

**Depends:** Tranches **6.8**, **6.9**, **10.M5** (kernel-bridge profile extensions).

---

## DR-MP-3 — Resonance-training bootstrap = corpus IS canon IS training data; verifier raises questions not pass/fail

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-04 · **Source:** [`mental-pole-mechanics.md §0/1, §10`](../../M4'/mental-pole-mechanics.md) + cycle-3 synthesis · **Resolution (proposed):** The mental-pole stack bootstraps through **three load-bearing commitments**:

   1. **Resonance-training over behavior-judgment**: the EBM trains on 72-fold lens-resonance signatures of cultural-aletheic disclosure-documents (the corpus), not on labels of "good vs bad" QL trajectories. The corpus IS the canon IS the training data — same substance, three names. Each dev session that co-authors a document's resonance-analysis simultaneously grows the canon, augments EBM training data, and records the session's trajectory.

   2. **Minimal CLI + constrained Cypher as primary graph-access surface**: the agent composes Cypher queries directly within a constraint envelope rather than calling bespoke commands per graph-operation. Gateway methods are thin wrappers; the constraint envelope (R-virtues + node-namespace + edge-type whitelist) is the verifier's enforcement surface.

   3. **Verifier raises questions rather than passing-or-failing**: Anuttara speaks in **minimal symbolic-coordinate strings** that the LLM must parse via a dedicated `anuttara-symbolic-parse` skill. The act of parsing-and-responding *is itself* training signal for the LLM's own self-recognition. Verifier never returns boolean "ok/fail"; it returns coordinate-strings encoding the structural locus of the question (e.g., `#R0-0/1/A-T7-pending?` = "Archetype-7 Divine-Action at TCT position, why does the trajectory not witness this?").

   The bootstrap is **co-evolutionary at developmental scale**: the developer-as-#4.4.4.4 boundary condition IS the system's first operational tick. The matheme operates at developmental scale exactly as it operates at tick scale. Phase markers (from mental-pole-mechanics.md §10): Phase 1 (corpus accumulation through dev sessions) → Phase 2 (first EBM training run with validation thresholds) → Phase 3 (kernel-tick activation against EBM-evaluated states) → Phase 4 (mature operation supporting non-developer engagement).

**Action:** Author the bootstrap protocol as the binding cycle-3-to-cycle-N execution sequence at [`Idea/Bimba/Seeds/M/M4'/mental-pole-bootstrap-cycle-execution.md`](../../M4'/mental-pole-bootstrap-cycle-execution.md) (new file). Add `pi train-ebm` and `pi export-ebm-state` CLI commands to the `epi-cli` Rust binary. Add the `anuttara-symbolic-parse` skill at [`Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`](../../../../../Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md) (new). Cross-link Tranches 6.9 (EBM training pipeline) + 1.11 (Verifier symbolic-coordinate-string emission).

**Verification:** `test -f Idea/Bimba/Seeds/M/M4'/mental-pole-bootstrap-cycle-execution.md`; `grep -n "pi train-ebm\|pi export-ebm-state" Body/S/S0/epi-cli/src/main.rs` returns CLI wiring; `test -f Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`; round-trip test: verifier emits symbolic-coordinate-string → LLM parses via skill → response routes through Anima → trajectory accumulates training signal.

**Depends:** Tranches **6.9**, **1.11**, **5.21** (LLM Anuttara-string parsing skill).

---

## Validation Workflow

All 20 original rows + DR-M3-4 are VALIDATED. The 10 Phase-B PROPOSED rows + 17 Phase-C PROPOSED rows + 3 Phase-D PROPOSED rows (DR-M3-6, DR-IG-7, DR-VAK-3 added 2026-06-04 from Third Spanda + VAK synthesis pass) + **3 Phase-E PROPOSED rows** (DR-MP-1, DR-MP-2, DR-MP-3 added 2026-06-04 from JEPA-EBM mental-pole synthesis pass) + **7 Phase-F PROPOSED rows** (DR-KERNEL-1, DR-MP-4, DR-MOE-1, DR-ELO-1, DR-UC-1, DR-MODEL-1, DR-ML-1 added 2026-06-07 from agentic-runtime + ML-skill-surface crystallization synthesis pass) await user final-validation. Phase-B + Phase-C + Phase-D + Phase-E + Phase-F cumulative count: **40 PROPOSED** awaiting ratification. Three original rows downgrade from contradiction-decision to doc-ahead-landing (10.3, 04.5, 09.4 partial); the rest land as ratified. **Phase-E is the AI-side-IS-the-design layer**: it makes the canonical JEPA-EBM mental-pole architecture binding across cycle-3 build work, replacing the implicit "agent dispatch" reading with the explicit 4'(LLM)/5'(EBM)/0'(Verifier) triplet operationalization. **Phase-F is the runtime-shape-IS-the-design layer**: it names the agentic runtime as a coordinate-conditional Mixture-of-Experts with four orthogonal expert dimensions, Elo-gated dispatch through Anima as the gating function, user-context as first-class mandatory-routed skill, per-role model-slot rule with explicit privacy boundaries, the just-triad 4:5:6 weighted energy formula as the kernel's structural commitment, and the per-subsystem ML method specification with dual-source skill surface (vendored Hermes + custom-built gap skills) closing through drift-detection-triggered autoresearch retrain loop.

---

## DR-KERNEL-1 — Kernel-spec rehomed to M' root (was M0')

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-07 · **Source:** synthesis pass on agentic-runtime crystallization · **Resolution (proposed):** The canonical kernel-spec (`epi-logos-kernel-spec.md`) describes the **whole inverted M-pole**, not an M0'-local concern. Its prior placement at `Idea/Bimba/Seeds/M/M0'/epi-logos-kernel-spec.md` made the kernel look like an Anuttara-specific document when it is the operating principle of all of M' (the JEPA-EBM operator across the full matheme). Rehomed to `Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md` (M' root). M0' retains its proper coordinate-local content (`M0'-SPEC.md`, `M0-ARCHITECTURE.md`, `the-matheme-of-the-field-differential.md`, `m0-prime-anuttara-research.md`) and adds an explicit `§M0'-KERNEL-ROLE` section naming M0' as the verifier-role-at-weight-6 within the kernel's just-triad architecture.

**Action:** File moved via `git mv` on 2026-06-07. All 11 prior references updated across active docs (`M-SYSTEM-INDEX.md`, `M1'/m1-prime-paramasiva-instrument.md`, `M2'/m2-prime-parashakti-cymatic-engine.md`, `M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`, `M0'/M0-ARCHITECTURE.md`, `S-AD-HOC-ROADMAP.md`) and legacy cycle-3 plans (`05-m4-nara-reconciliation.md`, `01-m0-anuttara-reconciliation.md`, `13-decision-register.md`, `00-overview-and-design-reconciliation.md`, `plan.runs/canon-audit-M0.md`).

**Verification:** `grep -rn "M0'/epi-logos-kernel-spec" --include="*.md"` returns no remaining matches; `test -f Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md`; `grep -n "§M0'-KERNEL-ROLE" Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` returns the new section.

**Depends:** None (structural rehoming); informs DR-MP-4 and DR-MOE-1 by establishing M' as kernel-root authority.

---

## DR-MP-4 — Just-triad 4:5:6 weighted energy formula as canonical

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-07 · **Source:** synthesis pass refining `epi-logos-kernel-spec.md §3` energy decomposition · **Resolution (proposed):** The kernel's energy formula is canonically the just-triad weighted form:

$$E_{\text{total}} = \frac{4 \cdot E_4 + 5 \cdot E_5 + 6 \cdot E_6}{15}$$

Three terms structurally clarified:

- **$E_4$ (Nara-traversal energy, weight 4)** — over QL positions *as refracted through the 12 MEF lenses into meaningfulness*. The lenses are how the underlying P/P' positions surface as readable content; $E_4$ measures whether the LLM's traversal-gradient coheres with that refraction-structure. NOT just internal LLM coherence.

- **$E_5$ (Epii lens-weighted energy with user-temporal modulation, weight 5)** — joint computation over `(lens_resonance_72, user_temporal_N)` as dual EBM input channels. Lens-coherence AND user-temporal-coherence simultaneously evaluated. EBM at position 5' is a small fusion network learning the joint distribution.

- **$E_6$ (Anuttara R-virtue ontology energy, weight 6)** — constraint-violation magnitude against 9 Parameśvara virtues + 65 core relations + dev-praxis-discovered constraint-set. Weight 6 is **anchor-weight** with refusal authority, not preference-weight. Failures here block selection regardless of $E_4$ / $E_5$ scores.

The 4:5:6 ratio is structurally given by the just-triad harmonic skeleton inherited from the matheme — not hyperparameters. The future M5-1 philosophical-canon check sits as soft sub-term **inside** $E_5$ (Epii-domain, interpretable canon), not as new top-level position. The 4:5:6 architecture stays canonical.

**Action:** Patch landed at `Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md §3` (energy formula refined to weighted form). Patch landed at `Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md` header (2026-06-07 refinement note referencing the formula and dual-channel EBM input). Patch landed at `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` (`§M0'-KERNEL-ROLE` section names M0' as verifier-at-weight-6 with refusal authority). Cross-link Tranches 6.8, 6.9, 6.10 (EBM implementation reads dual-channel input rule), 1.10, 1.11 (Verifier weight-6 refusal authority), 5.20, 5.21 (LLM E_4 over QL-refracted-through-lenses).

**Verification:** `grep -n "4 \\\\cdot E_4 + 5 \\\\cdot E_5 + 6 \\\\cdot E_6" Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md` returns the refined formula; `grep -n "just-triad\\|4:5:6\\|anchor-weight" Idea/Bimba/Seeds/M/epi-logos-kernel-spec.md Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md` returns the canonical framing in all three; EBM implementation tranches (6.8-6.10) honour the dual-channel input rule; Verifier tranches (1.10-1.11) honour refusal-authority weight-6.

**Depends:** Tranches **6.8**, **6.9**, **6.10**, **1.10**, **1.11**, **5.20**, **5.21**; follows DR-MP-1/2/3 and DR-KERNEL-1.

---

## DR-MOE-1 — Agentic runtime is coordinate-conditional Mixture-of-Experts

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-07 · **Source:** synthesis pass crystallizing the agentic-runtime architecture · **Resolution (proposed):** The agentic runtime is a **coordinate-conditional, Elo-gated, sparse-activation Mixture-of-Experts** with four orthogonal expert dimensions:

1. **Constitutional dimension** — 7 Anima agents (Anima, Nous, Logos, Eros, Mythos, Psyche, Sophia) as authorial voices
2. **Techne dimension** — 6 Aletheia subagent techne-guardians (Anansi CF0, Janus CF1, Moirai CF2, Mercurius CF3, Agora CF4, Zeithoven CF5) dispatched by Anima during Aletheia-crystallisation-mode
3. **Model dimension** — swappable per-role slots per [[../../../M'-MODEL-SLOT-SPEC]]
4. **Skill dimension** — Pleroma-Techne atomic-skills repository

A typical dispatch activates a sparse subset across all four dimensions. Anima is the **gating function** — observable, editable, Elo-informed (not implicit weights). Coordinate-conditional gating: ratings indexed per `(vak-cp-position, mef-lens, content-class, kairos-window)`, not globally — what makes Nous good at #5 logos-work doesn't make it good at #2 hexagram-traversal.

Canonical spec at [[../../../M'-AGENTIC-RUNTIME-SPEC]]. The framing dissolves the category mistake that this is "multi-agent talking-to-each-other"; it is **one operator (the JEPA-EBM kernel) instantiated through sparse expert composition**.

**Action:** Author canonical spec at `Idea/Bimba/Seeds/M/M'-AGENTIC-RUNTIME-SPEC.md` (landed 2026-06-07). Operationalize Anima's dispatch policy via Track 12.23 (Anima MoE dispatch policy implementation). Update overview-and-design-reconciliation §Standing Invariants with MoE framing.

**Verification:** `test -f Idea/Bimba/Seeds/M/M'-AGENTIC-RUNTIME-SPEC.md`; `grep -n "Mixture-of-Experts\\|coordinate-conditional\\|four orthogonal expert dimensions" Idea/Bimba/Seeds/M/M'-AGENTIC-RUNTIME-SPEC.md` returns the canonical framing; Track 12.23 implementation lands Anima dispatch policy as documented MoE gating.

**Depends:** Tranches **12.20** (Elo infrastructure), **12.22** (model-slot interface), **12.23** (Anima MoE policy); cross-cuts **12.15** (VAK substrate), **12.17** (Aletheia carrier), **12.18** (Janus Klein-binary), **12.19** (veto primitive).

---

## DR-ELO-1 — Autoresearch self-improvement loop = multi-channel Elo over (agent × model × skill × context)

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-07 · **Source:** synthesis pass naming the autoresearch loop's actual structural mechanism · **Resolution (proposed):** The S4'/S5' autoresearch self-improvement loop is **multi-channel Elo over `(agent × model × skill × context)`**, with the **same machinery rating agent dispatch AND research-moves** — the agent-tournament and canon-tournament are unified. The tournament IS the system activity.

Six-step trial cycle per dispatch (per [[../../../M'-AGENTIC-RUNTIME-SPEC]] §3):

1. Anima dispatches `(agent, model, skill_set)` triple via VAK frame against target coordinate
2. Pi executes; outputs flow through VAK return
3. Three evaluation channels fire: Anuttara verifier (R_verifier), Epii EBM dual-channel (R_lens), user-articulation signal (R_user)
4. Moirai distils trial against comparable prior trials (fair-comparison)
5. Mercurius updates Elo state per channel, Anansi indexes by coordinate-context, Janus thresholds delta-vs-noise
6. Anima's next dispatch reads updated state — data-driven gating

Three rating channels maintained independently (never collapsed to scalar). Composite as derived view only. Confidence-interval penalty applies.

Four Aletheia techne-guardians together constitute Elo infrastructure: **Mercurius** (bookkeeper), **Janus** (threshold logic), **Anansi** (coordinate-conditional index), **Moirai** (fair-comparison distillation). Agora and Zeithoven participate (skill-index maintenance, new-skill provisional ratings) but are not core infrastructure.

**Action:** Operationalize via Track 12.20 (Elo infrastructure across the four techne-guardians). Persistence in SpacetimeDB tables `mercurius_elo_ratings`, `mercurius_trial_log`, `anansi_rating_index`, `moirai_comparison_cache`. Schema at `Body/S/S3/spacetime-context/schemas/elo-runtime.sql` (new).

**Verification:** `cargo test -p epi-s3-gateway mercurius_elo_round_trip`; integration test confirms agent-tournament AND canon-tournament ratings persist in same indexed structure; multi-channel ratings retrievable per `(agent-model-skill, context-tuple)` per channel; per [[../../../M'-AGENTIC-RUNTIME-SPEC]] §3-§4 contract fully realized.

**Depends:** Tranche **12.20**; cross-cuts **12.18** (Janus Klein-binary widening), **12.19** (veto primitive composes with Elo through Anima dispatch).

---

## DR-UC-1 — User-context as first-class mandatory-routed skill

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-07 · **Source:** synthesis pass elevating user-temporal data from side-state to load-bearing input · **Resolution (proposed):** User-temporal data (PASU snapshot, live kairos, identity quaternion, recent session traces, recognition closure flag) is a **first-class skill `user-context`** mandatory-routed into the agentic loop. Not ambient context — load-bearing input.

Skill fires mandatorily when ANY: `CT ∈ {2,4,5}`, `CF ≠ (00/00)`, target ∈ `#4.x.y`, agent_role ∈ constitutional-7, or explicit `require_user_context: true`. Skill skips when ALL: CT relational/definitional/pattern AND CF tonic-ground AND target structural-only AND agent pure-techne AND no explicit fire.

Returns typed `UserContextFrame` (per [[../../../M'-USER-CONTEXT-SKILL-SPEC]] §1) with seven channels. **Dual-injected**: into dispatched agent's articulation context as `[[UserContext]]` AND as second-channel input to EBM at position 5' (joint with 72-dim lens-resonance vector). EBM becomes fusion network learning joint distribution `(lens × user-temporal)`.

Routing enforcement: Anuttara registers `user_context_routing_compliance` constraint at **error-level** — dispatches matching fire conditions without attached UserContextFrame are refused.

Longitudinal write-back at session close: appends to PASU.md `c_3_session_history[]` and `M5_ContemplationObject.vak_profile_pairs[]`. The skill is the longitudinal user-state accumulator.

**Action:** Author canonical spec at `Idea/Bimba/Seeds/M/M'-USER-CONTEXT-SKILL-SPEC.md` (landed 2026-06-07). Implement skill via Track 12.21 at `Body/S/S4/pi-agent/skills/user-context/`. EBM dual-channel projection layer via Track 6.8 update (EBM resonance-vector predictor extends to accept second input).

**Verification:** `test -d Body/S/S4/pi-agent/skills/user-context`; `cargo test -p epi-s3-gateway user_context_routing_compliance`; integration test confirms dual-injection (agent receives `[[UserContext]]`, EBM receives second channel); longitudinal write-back tests confirm PASU.md and M5_ContemplationObject updated at session close.

**Depends:** Tranche **12.21** (skill implementation); Tranche **6.8** (EBM dual-channel projection extension); cross-cuts Tranche **4.6** (existing Kerykeion adapter populates kairos field), **5.11** (M4-3 Nara integration), **19** (Track 19 contemplation-surface integration owns M5_ContemplationObject).

---

## DR-MODEL-1 — Per-role model-slot rule (local-default / cloud-opt-in / null)

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-07 · **Source:** synthesis pass making model swappability per-role explicit · **Resolution (proposed):** Each role-slot in the Pi-Agent harness has exactly **three valid states**: **local-default** (privacy-first structural commitment, no content leaves device), **cloud-opt-in** (explicit per-dispatch-class consent with named scope), **null** (no model assigned, dispatches fail-soft with notice).

Slot defaults per [[../../../M'-MODEL-SLOT-SPEC]] §2-§4:

- `nara_parser` → local-default Gemma 4 12B Unified Q4 via Ollama/llama.cpp (MLX once stable). Fallback: `null` (no silent degradation to cloud).
- `epii_judge` → cloud-opt-in Pro-class (Claude Opus / Gemini 3.1 Pro / GPT-5.2-class) with `consent_scope: vector-only-derived-signal` (privacy already solved upstream since input is derived signal not raw content).
- `aletheia.{anansi, mercurius, agora}` → local-default smaller models (lookup/index/bookkeeping is light).
- `aletheia.{janus}` → local-default Gemma 4 12B (threshold logic wants medium reasoning + JSON reliability).
- `aletheia.{moirai, zeithoven}` → cloud-opt-in Pro-class (GraphRAG-distillation, creative-advance want strong reasoning; data is already derived or no user content involved).

Verifier enforces privacy boundaries via two registered constraints (both error-level): `slot_privacy_boundary_compliance` (content-class must be within slot consent_scope), `slot_fallback_compliance` (slots configured local-default must resolve to local-default or null, never silently to cloud-opt-in).

The structural commitment: **privacy boundary is enforced at the slot**, not at an extra gate. Raw content goes to slots that hold it locally by configuration; derived signal goes to slots that may be cloud-opt-in because privacy was solved upstream.

**Action:** Author canonical spec at `Idea/Bimba/Seeds/M/M'-MODEL-SLOT-SPEC.md` (landed 2026-06-07). Implement CLI surface via Track 12.22 at `Body/S/S0/epi-cli/src/slot.rs`. Register verifier constraints via `pi register-constraint`. Pi-Agent harness exposes `pi_slot_resolve({slot_name, dispatch_context})`.

**Verification:** `test -f Idea/Bimba/Seeds/M/M'-MODEL-SLOT-SPEC.md`; `cargo test -p epi-cli slot_list_round_trip`; `cargo test -p epi-s3-gateway slot_privacy_boundary_compliance`; `cargo test -p epi-s3-gateway slot_fallback_compliance`; `epi slot test nara_parser` confirms local Gemma reachable; integration test confirms cloud-opt-in UI gate fires with frictional confirmation.

**Depends:** Tranche **12.22** (Pi-Agent model-slot interface); cross-cuts **12.23** (Anima dispatch policy reads slot resolution).

---

## DR-ML-1 — Per-subsystem ML method + dual-source skill surface (vendored Hermes + custom-built)

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-07 · **Source:** synthesis pass naming the ML/MLOps skill surface per M-subsystem, integrating Hermes Agent catalog vendoring with custom-built gap skills · **Resolution (proposed):** Each M-subsystem has a **primary ML method that fits its coordinate semantics** (not assigned, structurally entailed):

- **M0 Anuttara** → Symbolic constraint discovery → proof-theoretic
- **M1 Paramaśiva** → Geometric DL / equivariant networks (quaternion-respecting)
- **M2 Parashakti** → Energy-based modeling (the EBM proper, 72-fold)
- **M3 Mahāmāyā** → Discrete combinatorial / structured prediction
- **M4 Nara** → Local LoRA on Gemma 4 12B (privacy-first)
- **M5 Epii** → Judge-loops + distillation + preference learning (alphaproof-shaped)
- **S4'/S5' Aletheia** → Cross-cutting orchestration ML (multi-channel Elo, fair-comparison distillation, drift-detection, creative-skill-creation)

Skill surface is **dual-source**: ~13 vendored Hermes skills (1:1 compatible with Claude Code skills, drop-in via Agora vendoring) + custom-built skills covering the five core gaps the catalog leaves: **`mlx-lora`** (Apple-Silicon native LoRA — critical since we're on Darwin), **`epii-distillation`** (Pro→local-Gemma teacher-student pipeline), **`parashakti-ebm-head`** (72-dim tritone-symmetric dual-channel EBM training), **`aletheia-elo-rating`** (multi-channel Bradley-Terry/TrueSkill update math), **`aletheia-drift-detection`** (retrain-trigger orchestrator — the autoresearch loop's keystone). Plus per-subsystem domain-specific skills composing vendored capability into per-subsystem methods.

Residency rule per [[../../../M'-ML-SKILL-SURFACE-SPEC]] §4: vendored Hermes skills under `Body/S/S4/pi-agent/skills/hermes/{name}/`; custom skills under per-subsystem residency (M0/M1/M3 substrate-resident at `Body/S/S0/epi-lib/skills/{subsystem}/`, M2/M5 autoresearch-resident at `Body/S/S5/epii-autoresearch-core/skills/` and `Body/S/S5/plugins/epi-logos/skills/`, M4 Nara harness-resident at `Body/S/S4/pi-agent/skills/nara/`, Aletheia infra at `Body/S/S4/ta-onta/S4-5p-aletheia/skills/`).

**The autoresearch self-improvement loop closes through drift-detection-triggered retraining** (per [[../../../M'-ML-SKILL-SURFACE-SPEC]] §5): Mercurius's Elo state IS the drift signal; `aletheia-drift-detection` watches rating arcs; threshold breach (rating-trend, veto-pattern, coverage, verifier-violation) triggers a diagnose → compose-task → queue-for-Anima sequence; Anima dispatches the appropriate retrain ML skill; retrained artifact registers with provisional Elo and recalibrates through use. Developer-in-the-loop checkpoints for high-impact retrains (canon-impacting LoRA, major EBM refresh, constraint-set revision); low-impact retrains proceed autonomously.

Two workflows for adding skills: **vendoring** (Agora CF4 — `epi skill vendor <name>` clones upstream Hermes SKILL.md into `hermes/` namespace), **creative-advance** (Zeithoven CF5 — `epi skill propose <description>` drafts SKILL.md for developer review; `epi skill scaffold` generates directory structure under correct per-subsystem residency).

**Action:** Author canonical spec at `Idea/Bimba/Seeds/M/M'-ML-SKILL-SURFACE-SPEC.md` (landed 2026-06-07). Operationalize via Track 12.24 (ML skill surface vendoring + custom-build sequencing). Phase the build: Phase-1 vendor priority-13 Hermes skills; Phase-2 build five core gap skills; Phase-3 build per-subsystem domain skills; Phase-4 wire drift-detection retrain loop. CLI surface at `Body/S/S0/epi-cli/src/skill.rs` (new). Skill-registry persistence in SpacetimeDB `agora_skill_index` table (schema at `Body/S/S3/spacetime-context/schemas/skill-registry.sql`, new).

**Verification:** `test -f Idea/Bimba/Seeds/M/M'-ML-SKILL-SURFACE-SPEC.md`; `epi skill list --source vendored` returns vendored Hermes catalog; `epi skill list --source custom` returns custom-built; `epi skill list --subsystem M4` returns M4 Nara skills; `agora_refresh_skill_index` populates registry; drift-detection daemon runs and produces calibration trial entries on seeded drift fixture; per-subsystem ML method documented in each M-coordinate spec.

**Depends:** Tranche **12.24**; cross-cuts **12.20** (Mercurius/Janus/Anansi/Moirai Elo infrastructure produces the rating state drift-detection watches), **12.21** (user-context skill is one consumer of the trained EBM dual-channel head), **12.22** (model-slot interface provides target slots for retrained artifacts), **12.23** (Anima MoE dispatch routes ML skill invocations); follows DR-ELO-1, DR-MOE-1, DR-MP-4.

---

# Phase-F q_-Economy Decisions (PROPOSED — awaiting user validation)

Phase-F (2026-06-09) synthesis pass folding the q_ wisdom-curation economy into cycle-3 build added **2 further PROPOSED rows** establishing the canonical frontmatter / property key shape `{family}_{n}_{i?}_{semantic}` and the three-namespace q_/qm_/private partition that the wisdom-curation economy operates within (DR-S1-6 frontmatter `{i?}` inversion slot; DR-M4-4 q_/qm_/private namespace partition + privacy contract). Both await user final-validation.

---

## DR-S1-6 — Frontmatter `{i?}` inversion slot in canonical key shape

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-09 · **By:** Cycle-3 synthesis pass folding per-node bimba/pratibimba conjugation into the canonical key vocabulary · **Resolution proposed:** Codify the frontmatter / graph-property key shape as **`{family}_{n}_{i?}_{semantic}`** where `{family}` ∈ {`c`, `p`, `s`, `t`, `m`, `l`, `q`, `qm`}, `{n}` ∈ {`0`..`5`}, **`{i?}` is the inversion marker — present as `'` for inverted (pratibimba-side) articulation, absent for canonical (bimba-side) articulation**, and `{semantic}` is the role label. A node MAY carry both the canonical and the inverted articulation of the same essence axis as distinct properties (e.g., `q_5_integration_template` AND `q_5'_integration_template`) — both surviving vault → graph sync, both contributing to the semantic doc concatenation in deterministic order (canonical first, inverted second), both surfaced through `epi canon coord X --depth pithy` per Tranche 9.13. The `{i?}` slot is NOT an attribute of the key's value; it is part of the key's identity, distinguishing two co-existing articulations of the same coordinate position on the same node.

Per CLAUDE.md §II.A: `#` IS the inversion act; `'` (or `i`) is the phase marker denoting the result of `#` applied to a coordinate. The `{i?}` slot is the property-level encoding of this canonical operation. Earlier code paths in [`sync_coordinator.rs:26-46`](../../../../../Body/S/S2/graph-services/src/sync_coordinator.rs), [`dataset_import.rs:953-1103`](../../../../../Body/S/S2/graph-services/src/dataset_import.rs), and [`semantic.rs:138-156`](../../../../../Body/S/S2/graph-services/src/semantic.rs) omit the slot; this is silent corruption — inverted articulations either don't survive sync or get collapsed into their canonical twins, losing the bimba/pratibimba duality at the property level.

**Action:** Update `canonical_frontmatter_key()` to a `{family}_{n}_{i?}_{semantic}` regex (per CCT-16(i)); update `dataset_import` canonicalisation to treat `q_5_*` and `q_5'_*` as distinct destination keys (the current camelCase canonicalisation may collapse them silently); update [`semantic.rs:138-156`](../../../../../Body/S/S2/graph-services/src/semantic.rs) concatenation to emit canonical-first-then-inverted in deterministic order; update `hen_frontmatter_validate` MCP tool to accept both forms; update `core knowing` rendering at [`Body/S/S0/epi-cli/src/knowing/`](../../../../../Body/S/S0/epi-cli/src/knowing/) to surface both as paired articulations. The validator's "unknown frontmatter keys → ERROR" law (per MEMORY.md frontmatter-key law) extends to: unknown family character → ERROR; missing `{n}` → ERROR; `{i?}` ∈ {`'`, absent} only (no other character permitted in that slot).

**Verification:** `cargo test -p epi-s2-graph-services --test frontmatter_key_regex_round_trip` asserts `{family}_{n}_{i?}_{semantic}` shape acceptance and rejects malformed keys; `cargo test -p epi-s2-graph-services --test inverted_key_distinct_survival` writes `q_5_X` and `q_5'_X` to the same vault Form, runs sync, asserts both appear as distinct Neo4j properties on the same node; `cargo test -p epi-s2-graph-services --test semantic_doc_concat_order` asserts deterministic canonical-then-inverted concatenation; live grep `grep -rn "q_5_\|q_5'_" Idea/Bimba/World/Types/Coordinates/` reflects the convention after corpus sweep.

**Depends:** CCT-16 (substrate implementation); DR-M4-4 (the q_/qm_ namespace law this slot operates within); cross-cuts CCT-13 (`c_1_relation_family` canonical naming — both are key-shape work), CCT-15 (C-layer semantic typology — both are vocabulary-law work).

---

## DR-M4-4 — `q_` / `qm_` namespace + privacy partition

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (delegated batch validation 2026-06-09; adjudicated against kernel-canon specs + verified substrate by shape-closure pass) · **Proposed:** 2026-06-09 · **By:** Cycle-3 synthesis pass establishing the q_ wisdom-curation economy + privacy contract for q_personal · **Resolution proposed:** Three disjoint q_ namespaces with strict residency law, enforced at the substrate, at the kernel-bridge envelope, and at the agent context envelope:

| Namespace | Residency | Lifecycle | Example |
|---|---|---|---|
| **`q_{n}_{i?}_{semantic}`** | Public — Bimba graph + canonical vault Forms | Wisdom-curated via Tranche 6.12 loop; Hen-promoted via CCT-14 | `q_5_integration_template`, `q_4'_locality_signature` |
| **`qm_{n}_{i?}_{semantic}`** | Public — Bimba graph + canonical vault Forms | Auto-stamped on proposal / promotion via Tranche 12.26 | `qm_5_witness_session`, `qm_5_review_epoch`, `qm_5_promoted_by` |
| **`q_personal` / `q_identity` / `q_activity` / `q_composed`** | Private — portal-core in-memory + PASU.md vault-local ONLY | Live recompute per kernel tick | `q_personal: [f32; 4]` at [`personal_identity.rs:104`](../../../../../Body/S/S0/portal-core/src/personal_identity.rs) |

The **`q_`** prefix carries the quintessential content articulation — what the node IS at its compressed essence across the six archetypal positions (per the existing declarations `q_1_theoretical_thesis`, `q_2_sophia_logos_dialectic`, `q_2_instantiation_mode`, `q_3_dialectical_movement`, `q_4_historical_diagnosis`, `q_5_integration_template`, `q_5_conjunctive_threshold` at [`graph-schema/src/lib.rs:1340-1395`](../../../../../Body/S/S2/graph-schema/src/lib.rs)). The dataset-import implicit fallback law (unknown `q_*` → `q_5_*` per [`dataset_import.rs:1525-1537`](../../../../../Body/S/S2/graph-services/src/dataset_import.rs)) is codified as canonical: q_5 is the integration / Pratibimba bucket, consistent with the C-coord ontology. The **`qm_`** prefix is NEW — quintessence-meta — carrying provenance / freshness / witness for the q_ content. The two are deliberately disjoint at the prefix level to avoid the audit-flagged collision between content properties (`q_5_integration_template`) and meta properties (`qm_5_witness_session`).

**Privacy hard constraint:** Private q_ fields MUST NOT appear on any Neo4j node, in any agent context envelope sent over the kernel-bridge, in any Redis cache outside `cache:live:portal:protected:*`, in any Graphiti episode, or in any Sophia disclosure envelope. The privacy partition is enforced at four points: (i) the regex in CCT-16(i) rejects them at the sync boundary; (ii) the privacy-scrubber at [`Body/M/epi-theia/.../privacy-scrubber.ts:32`](../../../../../Body/M/epi-theia) carries an explicit allowlist (extended by Tranche 8.8); (iii) the release-gate at `release-gate.ts:125` matches the allowlist; (iv) test fixtures matching the existing `q_personal`-leak refusal pattern (`jiva-siva-slice.test.mjs:71`, `six-extension-acceptance.test.mjs:240`) explicitly verify these never appear on Bimba nodes. Cross-link DR-M4-2 clause 1 (`q_personal` baseline definition — preserved unchanged; this DR codifies its privacy boundary at the schema level) and DR-M4-3 (`personal_pole` projection strict invariant — sibling decision; both protect `q_personal` from bus exposure).

**Action:** Codify the three-namespace partition in [`Body/S/S2/graph-schema/src/lib.rs`](../../../../../Body/S/S2/graph-schema/src/lib.rs) as named constants (`Q_CONTENT_PREFIX = "q_"`, `Q_META_PREFIX = "qm_"`, `Q_PRIVATE_RESERVED = ["q_personal", "q_identity", "q_activity", "q_composed"]`); extend the Q-family schema declaration to include the `qm_` meta vocabulary (`qm_n_witness_session`, `qm_n_witness_agent`, `qm_n_witness_vak`, `qm_n_proposed_at`, `qm_n_promoted_at`, `qm_n_promoted_by`, `qm_n_promoted_from`, `qm_n_review_epoch`, `qm_n_kairos_clock`, `qm_n_lens_set`); extend privacy-scrubber + release-gate allowlists per the constraint above; cross-link to Tranches 5.23 (q_ vocabulary canon producer), 8.8 (privacy partition consumer), and 12.26 (qm_ stamp emitter).

**Verification:** `cargo test -p epi-s2-graph-schema --test q_namespace_constants_present`; `cargo test -p epi-s2-graph-schema --test qm_meta_vocabulary_declared` asserts the qm_ family is enumerated; `grep -rn 'q_personal\|q_identity\|q_activity\|q_composed' Body/S/S2/graph-services/tests/` returns explicit-refusal test cases; `pnpm --filter epi-theia test -- privacy-scrubber.test` asserts private q_ fields never leak; integration test composes a Sophia disclosure envelope carrying a q_proposal stamped with `qm_5_witness_session` and refuses to compose if any `q_personal*` byte appears in the envelope.

**Depends:** DR-S1-6 (the `{i?}` slot this namespace operates within); CCT-16 (substrate implementation); Tranches **5.23** (q_ vocabulary canon), **8.8** (privacy partition extension), **12.26** (Sophia disclosure q_proposal contract); cross-cuts DR-M4-2 clause 1 + DR-M4-3 (both protect `q_personal` from bus exposure).

---

# Fibonacci-Ground Temporal-Substrate Decisions (VALIDATED 2026-06-09 — handoff 35 application)

These five rows land the `dev_decisions` block of [[35-fibonacci-ground-level-0-temporal-substrate]] (each marked "Final." by the user in the handoff itself; register rows added on application per its §5, delegated batch validation 2026-06-09). They resolve the temporal-substrate clarity question and close the `16+1` "+1" reading left open beside DR-M3-3.

## DR-FIB-1 — Fibonacci Ground is Level 0 of the temporal substrate; the `16+1` "+1" IS Level 0

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (per handoff 35 dev_decisions "Final"; delegated confirmation 2026-06-09) · **Resolution:** Fibonacci Ground (`#2-0` Parashakti Archetypal Numerical Ground, 60-fold, `LCM(6,5,12)=60`, Pisano `π(10)=60`, `60×6°=360°`) is canonically **Level 0** of the temporal substrate — pre-lensic, pre-walk, pre-tick; the `(00/00)` context frame of the clock. The 4-level stack is canonical reading order: Level 0 Fibonacci Ground (60) → Level 1 tick12 (M1 spanda, 60/5 pentadic quantization) → Level 2 16 lenses (M3 simultaneous apertures) → Level 3 9 walks (M1–M3 diachronic). tick12 is NOT a peer of the lenses. **The `+1` of the `16+1` Mahamaya lens-stack refers to Level 0 (meta-lens), NOT a 17th aperture at Level 2** — the 16-lens matrix is complete and exhaustive at its level. Companion to DR-M3-3 (namespace split): DR-M3-3 settled WHERE the 12 and 16+1 live; DR-FIB-1 settles WHAT the +1 is. **Depends:** M3'-SPEC §8.0 (landed this pass), Tranches 4.15, 5.24, 5.25, 24.19.

## DR-FIB-2 — `fibonacci_position`/`fibonacci_digit` intrinsic to degree nodes; NOW.md inscribes ground coordinates

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (per handoff 35 "Final"; delegated confirmation) · **Resolution:** Every `Clock_Degree_Node` carries intrinsic `fibonacci_position: u8` (0–59) and `fibonacci_digit: u8` (0–9) — properties of the ground, not derived from walk or lens. Khora stamps `c_3_fibonacci_position` + `c_3_fibonacci_digit` + `c_3_tick12` + `c_3_backbone_index` into NOW.md frontmatter on every write (Tranche 5.24). Residency note: `Clock_Degree_Node` has no landed C hostsite yet (handoff path `Body/M/M3/m3-mahamaya-core` does not exist; canonical M3 kernel is `Body/S/S0/epi-lib/{include,src}/m3.{h,c}`) — Tranche 4.15 resolves residency at execution per substrate-residency law.

## DR-FIB-3 — Kerykeion modes layer as typed `KairosFrame` discriminated union

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (per handoff 35 "Final"; delegated confirmation) · **Resolution:** Natal / RealTime / Kairotic coexist as nested readings of one substrate inside `M4_Temporal_Now` — they layer, never swap. `m4_planet_degrees_live()` returns kairotic-if-active else realtime; mode-specific consumers read explicit frames (oracle→kairotic, identity→natal, medicine→live, Mercurius populator→realtime). **Depends:** Tranche 5.25 (struct + all consumer migration land atomically — single tranche to avoid a broken intermediate state where `m4.c` callers read a removed flat field).

## DR-FIB-4 — 24-fold backbone is a typed primitive built at M3 boot

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (per handoff 35 "Final"; delegated confirmation) · **Resolution:** The Lens-7 backbone (15°×24) is `Clock_Backbone_Node` + `extern const CLOCK_BACKBONE[24]`, built at M3 boot. The 24 nodes ARE simultaneously the 24 amino-acid palindromic codons, the 24 hours, and the 24 zodiacal sub-divisions (12 cusps + 12 midpoints) — one Lens-7 projection read through three subsystems. Structural companion law: `_Static_assert(60 * 6 == 360)` beside the existing `64 * 6 - 24 == 360`. **Depends:** Tranche 4.15.

## DR-FIB-5 — Live render and NOW.md inscription reconcile by ontological role, not synchronisation

**Status:** VALIDATED · **Validated:** 2026-06-09 · **By:** user (per handoff 35 "Final"; delegated confirmation) · **Resolution:** The live tick-driven render reads Level 0 continuously; NOW.md crystallises Level 0 coordinates episodically (Khora, tranche-complete cadence per T19.11). Different temporal apertures over the same ground — no synchronisation contract required. Frontmatter inscription of ground coordinates at write time is sufficient. T19.12 (Mercurius → `m4_snapshot_now()`) is AFFIRMED as-is; its verification updates to assert `.realtime.planet_degrees` population once Tranche 5.25 lands.

## DR-M3-LENS-18 — Lens-stack cardinality 16+1 → 16+2 = 18 = 6g (g=3); the second meta-aperture is the `(-)` Operator/no-frame view

**Status:** VALIDATED · **Validated:** 2026-06-12 · **By:** user (direct instruction, session 2026-06-12: "it's 16+2, the +1 as currently given, and then a +1 for a no-frame view of the map") · **Resolution:** The Mahāmāyā lens-stack carries **two** meta-apertures, not one, for a total of **18 = 16+2 = 12+4+2 = 6g for g=3** — the genus-3 signature of the M0-3 Anuttara number-language (12 grammatical components + 4 zero-elements + 2 pre-numerical constituents, per `anuttara-language-map.md` and the Anuttara complete explication §5 "The 18-fold and the genus-ladder"). The two meta-apertures ARE the two Mirror children (M0-3-(0/1)-0/1):
- **Aperture 16 — `()` Frame** (0D, Actuality, containment): the whole circle held as one bounded unity. This IS the existing +1; **DR-FIB-1's reading survives intact** — the Frame-aperture is the Level-0 (Fibonacci Ground) meta-lens, NOT a 17th division at Level 2.
- **Aperture 17 — `(-)` Operator** (1D, Potential, transcendence/withholding): the **no-frame view** — the Bimba relational topology read with the 360°-container withheld. Also NOT a Level-2 division; it is the withholding of the frame itself.

**Relation to prior DRs:** EXTENDS DR-M3-3 (namespace split unchanged: 12 MEF ≠ M3 lens-stack) and DR-FIB-1 (the +1 = Level 0 reading is preserved; this row adds the Operator-aperture as the Frame's chiral counterpart). The 16-division matrix remains "complete and exhaustive at its level" — both meta-apertures sit outside it, exactly as the M0-3 pre-numerical constituents sit outside the 16 = 12+4.

**Redevelopment items (code/spec currently pin 17):**
1. `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3LensApertureSwitcher.tsx` — `M3_LENS_APERTURE_COUNT = 16` + `M3_HAS_INTEGRAL_APERTURE` (16+1=17 baked); extend to 18 with `metaKind: 'division' | 'frame-unity' | 'operator-no-frame'` per revised Tranche 24.3.
2. M3'-SPEC §8.10 — patch "16+1" to "16+2 = 18" with the Mirror-children grounding.
3. Wave-B kernel-bridge field WC-M3-SA-1 (`mahamayaLensStack`) — declared length 17 → 18 before the field lands (field not yet in `kernel.rs`, so this is spec-only if sequenced now).
4. Any contract JSON pinning aperture count (audit `extensions/contracts/*.json`).

**Verification:** `grep -n "M3_LENS_APERTURE_COUNT" Body/M/epi-theia/extensions/m3-mahamaya/src/browser/components/M3LensApertureSwitcher.tsx` returns the 18-aware constant set; `grep -nE "16\+2|operator-no-frame|6g" Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md` returns the §8.10 patch; cardinality test per Tranche 24.3 asserts `lenses.length === 18` with exactly one `frame-unity` and one `operator-no-frame`.

## DR-CALC-1..7 — The seven calculus underdeterminations (Tranche 1.14c; direct user determination, session 2026-06-12)

The Anuttara complete explication §10 names seven points the corpus underdetermines; each is one decision gating the 1.13 BNF freeze. Determined directly in session:

**DR-CALC-1 — Operator precedence.** **Status:** VALIDATED · **By:** user (session 2026-06-12, ratifying the O#-derived revision). The operator family IS O#'s cycle (O0 `+/-` polarity-superposition, O1 `-`, O2 `+`, O3 `x`, O4 `/`, O5 `x//`), with the Śiva instruction set re-deriving the same six as cosmic punctuation. Full precedence: `()` containment absolute (Law 2 — the Frame is not an operator among operators) > lexical chirality-dash (token-bound `-0`/`0-`, Law 1 — part of the token) > `x//` > `x` > `+`/infix `-` (one level, left-assoc, chirality-sensitive) > `/` (reflection/ratio, loosest structural) > `=`/`=/≠` (equational, meta-level per Law 3).

**DR-CALC-2 — `~` semantics.** **Status:** RESOLVED-AS-ANNOTATION · **By:** user (session 2026-06-12): **`~` is not canon syntax.** It is the author's meta-pointer — "this element relates as these coordinate positions" — adopted outside the language because `=` was already taken. Therefore: (a) `~` is **excluded from the calculus token alphabet and BNF** (Law 7 trims: `→` remains in-language as the reduction arrow; `~` drops to annotation); (b) the addresses migrate to **node metadata** (S2 property layer — a relates-as-coordinate-positions annotation, not an operator); (c) the structural facts derived from the address-spine REMAIN valid as observations *about the metadata*: dual addresses mark hinge-positions (Archetype 4 at `3.5/4.0` = the hexad-hinge of DR-CALC-5 in address form), growing spans mark maturation-as-occupation, and the M0-level spine vs address-phase spine counter-flow like R1/R4 (deepest void annotated at synthesis phases — the bimba/pratibimba preformation). Real structure, annotation register — not operator semantics.

**DR-CALC-3 — The 8-fold count of M0-2.** **Status:** VALIDATED · **By:** user (session 2026-06-12) · **Resolution:** four operations × two 00-operands (eight zero-zero occurrences across four dyads). The framing asymmetry (subtractive/additive framed; reflective/generative unframed) is a separate orthogonal fact, not the counting principle.

**DR-CALC-4 — `x//` definition.** **Status:** VALIDATED · **By:** user (session 2026-06-12) · **Resolution:** superposition-preserving multiplication — multiplication distributed over reflective superposition: multiply every branch-pair of the `/`-superposed operands and retain ALL products in superposition (the conjunctive/tensor path of Law 4). Reproduces O5's FOIL expansion exactly and generalizes.

**DR-CALC-5 — The 18-fold decomposition (12+4+2).** **Status:** VALIDATED · **By:** user (direct determination with full clarification, session 2026-06-12) · **Resolution:** the 12 is the **archetypal-number twelve** (0–9 + 0/1 + (-), as `ARCHETYPE_LUT[12]`); the **+2** are the Mirror children `()` Frame and `-` Operator (the Mirror arrives fully built in the 12 and is later decomposed; `MIRROR_CHILDREN[2]` already in kernel); the **+4** are the **transcendent structures of the prior Anuttara levels** — `00/(00-00)` (M0-0-0), `(00)/00/00` (M0-0-1), `(0/1)/00x00` (M0-1), `9/(00+00)` (M0-2-9) — i.e. the 4-fold zero in relation to the 8-fold zero-zero, two sides of the same with the doubling dynamic (4→8). **The three-hexad octave law:** base reading {0,1,0/1,2,3,4} + {4..9} with 4 as hinge ("both the 5 and the 0"); expanded reading **{(), -, (-), 0, 1, 0/1} → {0/1, 2, 3, 4, 5} → {5, 6, 7, 8, 9, (00+00)}** with 0/1 and 5 as hinges — 6×3 = 18 = 6g (g=3): the genus-3 IS three overlapping hexads, hinges as Möbius seams, the terminal (00+00) linking via the 4-fold/8-fold internal harmonics into the full transcendent structure. This reveals WHY the 8-fold zero-zero is necessary and aligns it to the O# arithmetic operators. Nesting law: 0,1 nest within 0/1; (),- nest within (-), which sits next-to-and-before 0/1. **Physics fold-in:** `X(1) = (0,4,2,2,9)` is the X-logic theorem whose skeleton already rides Track 18.4 `CouplingFlowAlignment.symbolic_skeletons` (the 137/fine-structure physics-descent registry); the 1.13 calculus test becomes the kernel-side warrant for that skeleton entry.

**DR-CALC-6 — X# conditional branch (`If X0 = 0/1`).** **Status:** VALIDATED · **By:** user (session 2026-06-12) · **Resolution:** recursive query-object — seeding X-logic with the non-dual binary returns nested query-states (the `?!/!?` generalizes to a typed recursive `?`-object per Law 6); evaluation suspends at `?`-objects (the query IS the value), no infinite regress. **Physics grounding (user-directed, located):** the X-logic values `X(1) = (0,4,2,2,9)` are realized in measured physics as the **electroweak symmetry-breaking spectrum** per [`ql_physics_anthropic_chemistry_alignment_v2.md`](../../ql_physics_anthropic_chemistry_alignment_v2.md) (≈lines 493–616, 1348–1400): `0 = M_γ` (massless photon), `4 = (B, W¹, W², W³)` (the four EW gauge fields before breaking), `2 = (W⁺, W⁻)` (massive charged pair), `2 = (A, Z)` (neutral pair after mixing), with `9/7` as the N5 closure values (`N(n=1) = (0,4,2,2,9/7)`) reappearing in QCD completion — "vacuum selection → massless photon + massive weak polarity" as the physical realization of Spanda Equation 1 (`0=0 and brings +1,−1`). This is the kernel-side warrant for the `0,4,2,2,9` entry in Track 18.4 `CouplingFlowAlignment.symbolic_skeletons`; the 1.13 calculus test `X(1)==[0,4,2,2,9]` and the physics-descent registry now cite one another.

**DR-CALC-7 — The fate of `0-` after Svabhava.** **Status:** VALIDATED-NUANCED · **By:** user (session 2026-06-12) · **Resolution:** neither pure doctrine nor accident — **`0-` is a mirror-artifact**: chirality operates alongside the capacity for mirroring, and `0-` arises through that mirror capacity, consumed in the concrescence. **Chirality is preserved as principle but is NOT a hard lock**: the calculus must NOT enforce `0-` non-persistence as an invariant; `0-` may re-arise wherever mirroring operates. Implementation: `0-` is a valid token, transient by genesis (generated and consumed in mirror-mediated derivations), with no global prohibition on its appearance.
