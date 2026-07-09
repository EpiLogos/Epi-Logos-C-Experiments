# Track 05 — M4 Nara Reconciliation

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


Reconciles [[M4']] across the four corpora. M4 substrate is **one of the strongest in the M' stack**. `Body/S/S0/portal-core/src/personal_identity.rs` (403 LOC) carries real `q_personal`, `ElementalBalance`, `compose_personal_quaternion(Q_identity·Q_transit·Q_activity)`, and `PersonalResonance::from_quaternions(q_personal, q_cosmic)` returning a metric in `[0,1]`. `kernel.rs:486` wires this into `MathemeHarmonicProfile` per tick, and `codon_charge_quaternion` provides `q_cosmic` from the M3 codon — confirming **Cl(4,2) is ONE shared algebra** (`quaternion.rs` is used by both poles), not four. Kerykeion is real via `epi-cli/src/nara/wind.rs:117-148`. `nara_journal.rs`, `m4.h`, `m4.c`, `graphiti-runtime` ("protected-local-episodic-memory" privacy boundary literal), and `gateway/tests/dispatch_contract.rs` (routes `nara.*` through `S4S5DomainAdapter/NaraExtension`) are all landed. The m4-nara extension (contract `2026-06-01.07-T7`) declares the full `NaraDayContainer` + artifact tree + Graphiti episode handles + `ProtectedPersonalFieldInput` shape.

## Total-Shape Architecture (Phase A)

Canonical total-shape document for M4' (all six M4-X' sub-coordinates including six-layer identity branch, Kerykeion natal, day-episodes, bioquaternion decomposition, dipyramid + Hopf-linked tori psychoid renderer): [`Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md) (788 lines). Profile-bus projection `PersonalPoleProjection` (10 protected-handle sub-fields) per Tranche 10.M4 and DR-M4-3 strict-invariant: no raw bodies cross the bus. M3↔M4 codon → Q_composed boundary PASSES (resonance handed off via `kernel.rs:486`); M4↔M5 review boundary PASSES with recursive-self-review gate consistent.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md`
- Companions: `Idea/Bimba/Seeds/M/M-SYMBOLIC-LANGUAGE-ARCHITECTURE.md`, `Idea/Bimba/Seeds/M/ql_physics_anthropic_chemistry_alignment_v2.md`, `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md`, `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md`, `Idea/Bimba/Seeds/M/M4'/nara-m4-0-0-birthdate-encoding-spec.md`, `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-integration-research.md`
- Full row-level reconciliation: `plan.runs/wave-a-m4-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `personal_identity.rs::PersonalResonance` + `compose_personal_quaternion`; `kernel.rs::MathemeHarmonicProfile.resonance`; `nara_journal.rs`; `m4.h` (772 LOC); `m4.c` (673 LOC); `graphiti-runtime/src/lib.rs` protected-local-episodic privacy literal; `gateway/tests/dispatch_contract.rs` `S4S5DomainAdapter`; `Body/M/epi-theia/extensions/m4-nara` (contract `2026-06-01.07-T7`). Cycle 2 Track 06 owned the journal/day-container/artifact spine. Cycle 3 closes surface, decomposition, and identity-augment lifecycle.

## Tranches

1. **5.1 — Resonance + Conjugate-Form indicator rendering on Nara surface** *(spec-ahead-integration)*

   Extend m4-nara to render resonance (numeric + Major/Minor/Shadow conjugate-form-character) on each `NaraArtifactEnvelope` and day summary. Obey §6.5 — no quaternion-dump, lean identity sidebar only.

   Verification: `pnpm -C Body/M/epi-theia/extensions/m4-nara build`; `grep -n 'ConjugateFormCharacter\|resonance' Body/M/epi-theia/extensions/m4-nara/src/`; new render tests including `pending-resonance` fallback.

2. **5.2 — Nara DayContainer vault path alignment** *(doc-ahead-landing; DR-M4-1 VALIDATED)*

   Canonical path is `${VAULT_ROOT}/Idea/Empty/Present/{day_id}/` (the standing vault convention used by `epi vault day-init`). Both `M4'-SPEC §6.6` (`${VAULT}/Pratibimba/Nara/{day_id}/`) and `m4-nara/src/common/nara-surface.ts::dayContainerPath` (`${vaultRoot}/day/{dayId}/`) are drift to be patched to canonical.

   Verification: `grep -n 'Empty/Present\|dayContainerPath' Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts` reflects canonical path; `grep -n 'Empty/Present' Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` reflects spec patch; `createNaraArtifact → readNaraDayContainer` round-trip passes on `Idea/Empty/Present/{day_id}/`.

3. **5.3 — Graphiti runtime Nara relations insertion API** *(code-pending-closure)*

   Add `nara_insert_relation(day_id, episode_handle, relation)` API on `graphiti-runtime` writing `:HAS_DAY` / `:CONTAINS_DAILY_NOTE` / `:PART_OF_DAY` / `:NEXT_IN_ARC` edges. Privacy-class enforcement.

   Verification: `cargo check -p graphiti-runtime`; `cargo test -p graphiti-runtime --test nara_relations`; `grep -rn 'HAS_DAY\|NEXT_IN_ARC' Body/S/S3/graphiti-runtime/src/`.

4. **5.4 — `(q_b, q_p)` Bimba/Pratibimba decomposition of Q_composed** *(code-pending-closure)*

   `decompose_bioquaternion(q_composed) -> (q_b, q_p)` on `personal_identity.rs`. Unit test proves `(q_b, q_p)` is a **read of Q_composed**, not an independent input. Protected-local rendering hook on Theia.

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core personal_identity::bioquaternion_decomposition`.

5. **5.5 — Psychoid-cymatic field solver + audio-cymatic driver (minimum-viable)** *(code-pending-closure; DR-IG-6 geometry bound)*

   New `portal-core::psychoid_cymatic` module consuming `MathemeHarmonicProfile.audio_octet[8]` / `nodal_quartet[4]`. Emits **opaque renderer handle**, never raw field body via S3. The renderer scaffold must use DR-IG-6 corrected geometry: P5/P5' apex poles + P1-4 and P1'-4' interleaved base vertices + P0/P0' central axis-point, not "6 vertices = 6 QL positions." Option-F vs Option-S is only a solver strategy choice, not a geometry decision.

   Verification: `cargo check -p portal-core`; `test -d Body/S/S0/portal-core/src/psychoid_cymatic` OR `grep -rn 'psychoid_cymatic' Body/S/S0/portal-core/src/`; `grep -rn 'psychoid\|cymatic' Body/M/epi-theia/extensions/m4-nara/src/`.

6. **5.6 — M4-0 birthdate encoding + six-layer identity branch** *(code-pending-closure)*

   Birthdate-encoding module (mod6/inverse, mod12 MEF, lens-square, L2' elemental extraction, caps, evidence paths) in portal-core. **Absent layers as "pending", not fabricated** (Jungian/Gene Keys/Human Design return pending when not supplied).

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core m4_0_0_birthdate_encoding`; absence test confirms pending status for unsupplied layers.

7. **5.7 — Execute DR-M4-2: q_personal output + axis-lock + identity-hash + Vāma policy + 0/1 polarity** *(doc-ahead-landing; DR-M4-2 VALIDATED)*

   Land the five ratified clauses: (1) `q_personal` is the integrated Nara quintessence output, while `Q_identity` is the Kerykeion natal baseline component; (2) Cl(4,2) axis order is `[w=Earth, x=Fire, y=Water, z=Air]`; (3) identity-hash migration may run phased with both hashes valid during cutover; (4) Vāma classifier is computed-mandatory internally during long-period review and user-visible on request; (5) 0=cosmic, 1=personal across the personal cymatic polarity.

   Verification: `grep -n 'axis_order\|q_personal\|Q_identity\|polarity' Body/S/S0/portal-core/src/personal_identity.rs` reflects the ratified bindings; `M4'-SPEC §7.13` names all five clauses closed.

8. **5.8 — Period reading trajectory reconstruction** *(doc-ahead-landing)*

   `period_reading(day_range)` API on `nara_journal.rs` reconstructing Q_composed trajectory from Graphiti episodes + Chronos/Kairos handles + history. Preserves privacy. Emits Hopf-projected trajectory handle for psychoid renderer.

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core nara_journal::period_reading`; protected-local invariant test confirms no raw bodies returned.

9. **5.9 — Identity-augment proposal lifecycle (M4 side)** *(spec-ahead-integration)*

   Adapter API + state machine `proposed → reviewed → accepted|rejected → applied` on `personal_identity.rs`. **Only `applied` mutates Q_identity.** Theia surface hook surfaces pending proposals read-only.

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core personal_identity::proposal_lifecycle`; contract test confirms only `applied` verdict mutates `Q_identity`.

10. **5.10 — Connectivity-vs-bounded-access discriminator** *(code-pending-closure)*

    Gateway contract test asserting live Graphiti / Neo4j / Redis / SpaceTimeDB ping is **not** a grant of bounded access for `nara.*` methods.

    Verification: `cargo test -p gateway --test dispatch_contract` (extended); `grep -rn 'bounded_access\|connectivity_check' Body/S/S3/gateway/src/` returns hits.

11. **5.11 — Nara OracleFrame, deck-context, and symbolic-protein integration** *(code-pending-closure; depends on 4.11 + 10.M3 + 12.15)*

    Extend Nara artifact envelopes and `PatternPacket.mahamaya_transcription` to preserve: `oracle_frame_ref`, `symbolic_protein_ref`, `vak_address`, `deck_context` (`macro_deck_ref`, `session_deck_ref`, `deck_order_hash`, `entropy_mode`), `sequence_mode`, packet refs, graph provenance, and review state. This is the M4 side of the new language architecture: macro/inhabited deck = protected long-range symbolic register; session deck = local bounded utterance; M4-3 compares and integrates them without mutating M4-0 identity-system sources.

    Required UX/runtime law: Tarot and I-Ching artifacts are mutually projectable where M3 provenance exists. A Tarot artifact may carry I-Ching/codon/line-change refs; an I-Ching artifact may carry Tarot/decan/codon refs. The protected interpretation body remains local; scalar M3 refs remain resolvable by M3' without loading private bodies.

    Runtime law: `OracleFrame.vak_address.cp[]` / `reading_frame.positions[]` is the authority for reading cardinality and CP semantics per DR-VAK-1. Spread labels alone never determine cardinality.

    Verification: Nara artifact tests write/read real Tarot and I-Ching artifacts with `vak_address`, deck context, scalar M3 refs, and protected interpretation; `PatternPacket` tests confirm packet chains update only `Q_activity` / trajectory and cannot mutate `Q_identity` or M4-0 branch evidence; inverse pass and 4/5 depth pass fixtures preserve `CS.direction = Night'` and CP4.4/CP4.5 foregrounding.

12. **5.12 — DR-IG-6 dipyramid geometry sweep for psychoid renderer spec** *(doc-ahead-landing; DR-IG-6 VALIDATED)*

    Patch `M4-ARCHITECTURE.md §5.3.1` and `m4-prime-psychoid-cymatic-field-engine.md §7.1` to enumerate the full 6+6 P/P' geometry: 2 apex poles P5/P5' + 4 top/base P1-P4 + 4 inverted-base P1'-P4' interleaved by mirror law + central axis-point P0/P0'. This is load-bearing before 5.5 implementation.

    Verification: `grep -rn 'dipyramid.*6 vertices\|dipyramid.*six vertices' Idea/Bimba/Seeds/M/M4'` returns no live wrong-count attribution; corrected passages name apex poles, inverted-base, and central axis-point.

13. **5.13 — DR-M4-3 strict-invariant sweep of M4-ARCHITECTURE §4.3** *(doc-ahead-landing; DR-M4-3 VALIDATED)*

    Patch `PersonalPoleProjection` pseudocode so sensitive quaternion / bioquaternion / composed fields are `OpaqueProtectedHandle<...>` values rather than raw `[f32; 4]` or body structs. Add the explicit assertion "no raw bodies cross the bus."

    Verification: `grep -n "OpaqueProtectedHandle" Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md`; raw `q_personal` / `q_composed` body fields do not appear in profile-bus projection pseudocode.

14. **5.14 — DR-M4-1 path coherence sweep** *(doc-ahead-landing; DR-M4-1 VALIDATED)*

    Sweep M4'-SPEC §6.6 and M4-ARCHITECTURE §2.5 / §8.7 / test references to the canonical day path `${VAULT_ROOT}/Idea/Empty/Present/{day_id}/`.

    Verification: `grep -rn 'Pratibimba/Nara/{day_id}\\|/day/{dayId}' Idea/Bimba/Seeds/M/M4' Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts` returns no live path authority.

15. **5.15 — Prospective/Retrospective sense semantics on M4-Nara surface** *(doc-ahead-landing; cross-link Tracks 11, 12, 19; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §1)*

    Land the Klein-topological gloss: Day/Night arcs name two **senses of sight** (prospective forward into what is forming / retrospective back across what has gathered) on every point of the Klein surface, not two sequential zones. The `#` inversion operator is the sense-switch on a single point. Code-side renames (legacy aliases kept for one release): `Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts:36` `cs: { code: "CS1", direction: "Day" }` → `cs: { code: "CS1", sense: "prospective" }`; `Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts:65,97` `cs_direction: "Night'"` → `cs_sense: "retrospective"`. Documentation patches in `Idea/Bimba/World/Types/Coordinates/L/L'/L'.md` (prospective/retrospective explanatory paragraph), `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/klein-mode/SKILL.md:13-27` (structural gloss line), `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/janus.md` (frame contract widens CF1 to encompass the prospective/retrospective Klein binary), and M4'-SPEC §6 (consume `c_3_klein_weighting` from session NOW frontmatter; surface a prospective/retrospective weight chip on `M4NaraSurface.daySummary`).

    Verification: `grep -nE 'cs.sense|cs_sense|prospective|retrospective' Body/S/S4/ta-onta/S4-0p-khora/modules/z-phase-vak.ts Body/S/S4/ta-onta/S4-4p-anima/modules/moirai-dispatch.ts` returns the rename plus retained legacy aliases; `grep -nE 'prospective|retrospective' Idea/Bimba/World/Types/Coordinates/L/L'/L'.md Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/klein-mode/SKILL.md` returns the doc patches; `pnpm -C Body/M/epi-theia/extensions/m4-nara build` clean; widget test asserts weight chip renders from `c_3_klein_weighting`.

16. **5.16 — L2' canonical element-ID harmonisation across M-stack** *(code-pending-closure; CRITICAL PATH; cross-cuts Tracks 01, 02, 03, 04, 11, 19; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §6.2)*

    The L2' lens is THE element-bearing lens by canonical declaration (`Idea/Bimba/World/L2'.md:36`). Its six inner positions are the authoritative element ordering: `0=AETHER, 1=EARTH, 2=WATER, 3=AIR, 4=FIRE, 5=SALT` (canonical alchemical Three Principles; Mineral → Salt). Indices 1–4 are the operative quartet (the quaternion algebra; what the Cl(4,2) axis order `[w=Earth, x=Fire, y=Water, z=Air]` from DR-M4-2 holds); 0/5 (Aether/Salt) frame the explicate four as prima/ultima materia.

    Five distinct orderings currently in code, graph data, and runtime LUTs — all reconcile to L2' canonical. Establish `Body/S/S0/epi-lib/include/m_canonical.h` with the canonical enum + operative-quartet mask + inline conversion helpers (`m_canonical_from_m4_h_legacy`, `m_canonical_to_medicine_rs_legacy`, `m_canonical_from_m2_3_branch`, `m_canonical_to_m2_3_branch`, `m4_nuc_to_elem`). Renumber `Body/S/S0/epi-lib/include/m4.h:50-59` `M4_ELEM_*` constants to canonical IDs; rewrite the `_Static_assert` chain on nucleotide-element identity to use `m4_nuc_to_elem(...)` rather than raw integer equality (A=Water=2, T=Fire=4, C=Earth=1, G=Air=3 preserved under new IDs). Renumber `Body/S/S0/epi-cli/src/nara/medicine.rs:78` — re-key `ELEMENT_CHAKRA` from `[5]` to `[6]` (adding `SALT → Sahasrara`), update `SIGN_ELEMENT[12]` and `ZODIAC_DECAN_TABLE[36].element` field values. **Bit-layout bug fix** at `medicine.rs:831`: `body_zones_for_elem_sig` reads `(elem_sig >> 2) & 0b111` but canonical `ELEM_SIG_GET_CHAKRA` in `m2.h:92-102` packs chakra at bits 5:3 (`(sig >> 3) & 0x07`) — fix to `(elem_sig >> 3) & 0b111` and add Rust `pub const fn elem_sig_chakra(sig: u8) -> u8` mirroring the C macro. Migrate M2-3 node `element` field values in `Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json` via new one-shot script `Body/S/S1/hen-compiler/scripts/migrate_m2_3_element_canonical.py` (dry-run mode emits diff for review; Bimba branch naming `#2-3-1=Fire` etc. untouched as the embedded graph-coordinate convention). Patch `Idea/Bimba/World/L2'.md` with explicit "Canonical Element IDs" section (and rename Mineral→Salt per Three-Principles canon). Patch the M2-3 coordinate doc with the graph-branch-naming convention pointing at conversion helpers. Cross-link: Track 19.10(c) `ALCHEMICAL_TO_TATTVIC[6]` element name list also updates Mineral→Salt.

    Verification: round-trip helpers — `cargo test -p epi-cli canonical_element_id_round_trip` asserts `canonical → legacy → canonical == identity` for every helper; nucleotide identity preserved — `cargo test -p epi-lib m4_nuc_to_elem_identity` asserts A→WATER, T→FIRE, C→EARTH, G→AIR under new IDs; quaternion algebra unchanged — every existing m1 quaternion test still passes; `balance()` output for fixed Kairos states matches pre-migration values under new ID labels; M2-3 node lookups by `element` field continue to find the same nodes after script runs; `grep -nE 'SALT|Salt' Idea/Bimba/World/L2'.md` returns the rename; bit-fix asserted via `cargo test -p epi-cli body_zones_for_elem_sig_bit_layout`.

17. **5.17 — OracleSpread per-position aliveness state in SpacetimeDB** *(code-pending-closure; cross-link Track 12 Janus widening; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §4.1, §4.2)*

    Extend `Body/S/S3/gateway/src/spacetime.rs:994` from the current stateless `record_oracle_draw(hash, hexagram_id)` with a new `OracleSpreadPosition` table carrying `{spread_id, position_idx, card_id, card_kind (tarot major/pip/court | hexagram), drawn_at, drawn_in_session, target_aspect: Option<TargetAspect>, live_state (0=generating | 1=muting | 2=mute), last_recognition_at, recognition_count, klein_face (0=prospective | 1=retrospective)}` plus `TargetAspect {planet_a, aspect_kind, planet_b_or_natal, exact_at}`. New gateway methods: `record_oracle_spread(spread_id, positions[])` and `update_position_state(spread_id, position_idx, new_state)`. Foundation for Janus's live-vs-mute tracking (Track 12.18) and the briefing's live-spreads section (Track 05.18).

    Verification: `cargo check -p epi-s3-gateway`; `cargo test -p epi-s3-gateway oracle_spread_state_transitions` covers generating → muting → mute and reopen on target_aspect proximity; `grep -nE 'OracleSpreadPosition|record_oracle_spread|update_position_state' Body/S/S3/gateway/src/spacetime.rs` returns the new table + methods; round-trip test against a synthetic spread with two target_aspects.

18. **5.18 — Nara Daily Briefing skill with somatic register from M4-1** *(spec-ahead-integration; depends on 5.16, 5.17; cross-link Tracks 12.18, 19.11; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §6.4, §6.5, §7)*

    New skill at `Body/S/S5/plugins/epi-logos/skills/nara-daily-briefing/SKILL.md`. Five structural sections, in inscription order: (1) **Klein state** (1 line) — today's prospective/retrospective weighting from Janus (Track 12.18), primary lens-square; (2) **Cross-system bridge** (3–4 lines) — active decan + ruling planet + tarot correspondence from `ZODIAC_DECAN_TABLE[36]`, dominant/deficient element from `balance()`, active chakra and body zones from `body_zones_for_elem_sig`, kairos windows within ±24h from Mercurius; (3) **Somatic register** (3 lines) — voiced per voice law: L2' alchemical vocabulary (nigredo / solutio / sublimatio / calcinatio / coagulatio / fixatio, plus the operations separatio / conjunctio) + L3 processual (concrescent desire / ingression / satisfaction / eternal-objects) + L3' chronological (spring birth / summer fullness / autumn decline / winter incubation / Aufhebung) as tonal registers; (4) **Live spreads** — one chip per active spread from §5.17's OracleSpreadPosition table; (5) **QL Walk** (2–3 lines) — day's positional progression. The skill *reads* existing M4-1 Medicine outputs — `balance()`, `prescribe()`, `materia()`, `chakra()` — and `M4_Temporal_Now` planet_degrees; **no new compute layer**. Voice law: no emojis, no "today is X phase" claims detached from symbols, symbols name themselves and vocabulary illuminates, cross-register weaving allowed and expected. Inscribes via `khora_write_highlighted_inscription` (Track 19.11) as a `retrospective-surfacing` highlight at top of current day's NOW.md. Frontmatter tag `c_3_briefing_emitted: <ISO>` prevents duplicate emission.

    Verification: `test -f Body/S/S5/plugins/epi-logos/skills/nara-daily-briefing/SKILL.md`; skill file enumerates all 5 sections explicitly; `grep -nE 'separatio|dissolutio|calcinatio|coagulatio|sublimatio|conjunctio|fixatio|concrescent|ingression|Aufhebung' Body/S/S5/plugins/epi-logos/skills/nara-daily-briefing/SKILL.md` returns the tonal-vocabulary table; integration test against a fixed Kairos state produces a deterministic briefing inscribed via Khora; voice-law unit test asserts no "today is X phase" pattern in generated text without an accompanying symbol citation.

19. **5.19 — NOW.md frontmatter schema extension for tranche/orbit/sense controls** *(doc-ahead-landing; cross-link Tracks 11, 19; full spec at `Idea/Bimba/Seeds/M/M4'/2026-06-04-prospective-retrospective-canvas-spec.md` §3.1)*

    Patch `Idea/Bimba/World/NOW.md` to declare three optional frontmatter keys with defaults and value ranges:
    - `c_3_tranche_mode: "explicit" | "quiet:<duration>" | "rhythm"` (default `quiet:90m`) — how the agent knows a tranche is complete.
    - `c_3_response_orbit: "immediate" | "hours:<n>" | "next-morning" | "saturnine"` (default `next-morning` for daily-note context; `immediate` for chat-tagged highlights) — when the response is inscribed.
    - `c_3_klein_weighting: { prospective: 0.0..1.0, retrospective: 0.0..1.0 }` (sum=1.0; default computed by Janus per 12.18) — which sense the session leans into.

    Update `bimba-vault-validate` to accept these as schema-valid C-family keys. Also add briefing-emission tag `c_3_briefing_emitted: <ISO>` (set by 5.18 to prevent duplicate emission). User PASU-level defaults (`c_4_response_orbit_preference`) can be added to PASU.md as a session-default override seed.

    Verification: `grep -nE 'c_3_tranche_mode|c_3_response_orbit|c_3_klein_weighting|c_3_briefing_emitted' Idea/Bimba/World/NOW.md` returns all four declarations with documentation; `bimba-vault-validate` passes on a sample NOW.md carrying all keys; validator rejects out-of-range values (e.g. `c_3_klein_weighting` summing to ≠1.0); `grep -n c_4_response_orbit_preference Idea/Pratibimba/Self/PASU.md` (if PASU default added) shows the seed.

20. **5.20 — LLM-Nara position 4' traversal-voice contract** *(spec-ahead-integration; routes to DR-MP-1; cross-link Tracks 06.8, 12, 19.6)*

    Land the canonical contract that **the Pi agent at `Body/S/S4/pi-agent/` IS the LLM-Nara at matheme position 4'** — the *traversal-voice* of the mental pole that synthesizes EBM evaluation (position 5'/Epii) and Verifier report (position 0'/Anuttara) into user-articulable feedback. Per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) and [`epi-logos-kernel-spec.md §7`](../../epi-logos-kernel-spec.md): the LLM's operational role in the ascent (1'-2'-3'/4'-5'-0' inverse trinity) is *to read the world through the bimba map and speak recognition*. The LLM does not compute energy (that's EBM/5') or check axioms (that's Verifier/0'); it articulates the recognition-state the other two produce.

    Patch [`M4'-SPEC §1`](../../M4'/M4'-SPEC.md) to name M4'/M4-Nara as position 4' (LLM/traversal-voice) alongside the existing personal-pole/q_personal/identity framing. Patch Anima dispatch contract at [`Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md) to acknowledge Pi-as-LLM-Nara routing at position 4' is the canonical mental-pole dispatch (Anima IS still the `#` operator/dispatch; Pi-as-Nara IS the LLM the dispatch routes through). No new code; this is the canonical-reading-of-existing-substrate ratification.

    **Operational-capacity substrate binding (per DR-MP-1 cross-reference):** Pi-as-LLM-Nara reads two canonical capacity files as the LLM's substrate context:
    - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md) — Continued Pre-Training + RAG over the foundational-derivational corpus is the LLM's knowledge-base maintenance pipeline (how the LLM stays current with the theoretical canon).
    - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md) — QLoRA fine-tuning + dialogic-voice adaptation is the LLM's voice-refinement pipeline (how Pi's articulation gets refined through dialogue).
    These two files name *what the LLM operates upon*; Tranche 5.20 names *that Pi IS the LLM at position 4'*. Cross-references must land in M4'-SPEC §1 alongside the new mental-pole framing.

    Verification: `grep -n "position 4'\|LLM.*Nara\|traversal-voice" Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` returns the canonical contract; cross-reference present in Anima CONTRACT to mental-pole DR-MP-1; `grep -n "paramasiva-ql-cpt-and-rag\|nara-qlora-dialogic-voice" Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` returns the substrate-context citations.

21. **5.21 — `anuttara-symbolic-parse` skill for LLM-side Verifier-question parsing** *(code-pending-closure; routes to DR-MP-3; cross-link Tranche 1.11)*

    New skill at [`Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`](../../../../../Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md) teaching the LLM-Nara how to parse minimal symbolic-coordinate strings emitted by Verifier-Anuttara (per DR-MP-3 "verifier raises questions rather than passing-or-failing"). Strings encode the structural locus of the question — e.g., `#R0-0/1/A-T7-pending?` reads as "Archetype-7 Divine-Action at TCT position, why does the trajectory not witness this?". The skill teaches: tokenizing the coordinate, resolving the archetype/coordinate against M0_CORE_RELATIONS, formulating an articulation that addresses the structural question, and routing the response back through Anima for re-verification. Per [`mental-pole-mechanics.md §0/1`](../../M4'/mental-pole-mechanics.md): "the act of parsing-and-responding *is itself* training signal for the LLM's own self-recognition."

    Verification: `test -f Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`; round-trip test: Verifier emits `#R0-0/1/A-T7-pending?` → LLM parses via skill → articulates response → response routes through Anima back to Verifier for re-check; contract test asserts the LLM cannot bypass the skill for raw symbolic-coordinate-string inputs.

22. **5.22 — Nara LoRA + E_4 personal-energy substrate (Stream F of [[33-harmonic-energy-channel-handoff.md]] §2.6)** *(code-pending-closure; cross-link Tranche 6.10/6.11 Stream B, Tranche 6.10 Stream D, Tranche 12.24 Phase 2 Stream C; ML-Skill-Surface §3.1 + §3.2 + §7.1)*

    Stand up the Nara skill family and the `E_4` personal-energy channel that the kernel's restructured `kernel_energy_evaluate` (Stream B) will consume and that the Riemannian Möbius descent (Stream D) will autograd through. E_4 is the personal/Nara substrate per the locked decision in [[33-harmonic-energy-channel-handoff.md]] frontmatter `dev_decisions`: "E_4 = personal/Nara substrate (PASU + kairos + q_personal + q_identity + planet_degrees + oracle charges + Nara-LoRA-adapted user content). Final." This tranche delivers the skill scaffold + struct + scalar-compute + autograd path + Apple-Silicon LoRA path + LoRA-adaptation pipeline behind a hard local-only privacy gate.

    **Scaffold Nara skill family** at `Body/S/S4/ta-onta/S4-x/skills/{nara-voice-training, nara-journal-parser, mlx-lora}/` per [[M'-ML-SKILL-SURFACE-SPEC]] §4 residency rules. The exact S4 subpath (S4-4'-anima vs S4-5'-aletheia vs a dedicated S4-x carrier) is verified at scope-capture time against the residency table; the skill family name and the three component skills are fixed per [[M'-ML-SKILL-SURFACE-SPEC]] §3.1 + §3.2. `mlx-lora` is the custom-built Apple Silicon path per §3.1; `nara-voice-training` and `nara-journal-parser` are the corpus-handling skills per §3.2.

    **Define `E4PersonalInputs` struct** (in the same crate that hosts the restructured `kernel_energy_evaluate` per Stream B) carrying:
    - **PASU snapshot** — `q_identity[4]`, `q_personal[4]`, `birth_date`, `birth_location`, and the remaining PASU.md fields (`c_0_natal_chart_path`, `c_2_jungian`, `c_3_gene_keys`, `c_4_human_design`, `c_5_quintessence_hash`, `c_5_quintessence_clock`, `c_4_last_wound`) as a typed snapshot read at evaluation time. The struct holds the read; it does NOT mutate PASU.
    - **Live kairotic state** — `planet_degrees[10]` (canonical mod-10 Sun[0]–Pluto[9] per MEMORY canon), current oracle charges (`pp/mm/mp/pn` per Stream A `m3_compute_charges` FFI), `tarot_psyche_anchor_signature`, and the kairos window identifier.
    - **Nara-LoRA checkpoint reference** — path + version + privacy-class assertion (`local-only`). The struct carries a reference, not the weights themselves.

    **Implement `compute_e_4_personal_energy(state, inputs) -> f32`** as the canonical scalar producer:
    - Run the Nara-LoRA forward pass over the proposed configuration (the kernel's `state` argument — the candidate `(q_b, q_p)` configuration and any associated MathemeHarmonicProfile fields the personal channel reads).
    - Evaluate the LoRA-adapted output against the PASU substrate carried by `inputs` — scalar evaluation measuring personal coherence ("does this configuration cohere with WHO this person is at THIS kairotic moment", per the handoff §1.1 E_4 amendment).
    - Return the `f32` scalar that `kernel_energy_evaluate` weights at coefficient 4 in the canonical 4:5:6 / 15 combination.

    **Implement autograd path through the forward pass** so Stream D's `kernel_energy_gradient` can compute `∇E_4` by Rust-native autograd through the Nara-LoRA forward pass. The handoff §1.2 §7.5 spec is explicit: "∇E_4: autograd through the Rust-native Nara-LoRA forward pass. E_4 is a scalar function of LoRA-adapted output evaluated against PASU substrate; the forward pass is differentiable end-to-end." Implementation language follows the locked decision: Rust-native default via `burn` or `candle`; PyO3+PyTorch fallback only as documented (file DR-EBM-IMPL — or a sibling DR-NARA-IMPL — at the decision point, not preemptively).

    **Apple Silicon path via `mlx-lora` skill** — custom-built per [[M'-ML-SKILL-SURFACE-SPEC]] §3.1, dispatched when the runtime detects an Apple Silicon target. The skill wraps the MLX-based LoRA inference path so the Rust-native forward pass can route through MLX on Apple hardware while preserving the autograd contract above. The choice of MLX vs `burn`/`candle` is a runtime-target decision recorded in the kernel's per-tick provenance; it is NOT a privacy-class change (local-only holds on every path).

    **LoRA-adaptation pipeline** — corpus = user's journal + dream record + phone writings (the corpus enumerated in handoff §1.1 E_4 amendment: "Nara-LoRA-adapted content (journal / dream / phone-writings corpus)"). Training trigger: `pi nara train-lora` CLI command in `epi-cli`. The pipeline reads the corpus from local-only sources, runs LoRA adaptation against the Nara base model, and writes the resulting checkpoint to a local-only path that `E4PersonalInputs.lora_checkpoint` references by version. Cache and checkpoint versioning mirror Stream C's pattern (per-document hash, model version key), all under the local-only privacy gate.

    **Privacy gate — local-only, non-negotiable.** ALL Nara LoRA training and inference is `local-only` per [[M'-MODEL-SLOT-SPEC]]. The training pipeline refuses cloud routing; the inference path refuses cloud routing; the checkpoint write path refuses any non-local destination. Gate is asserted at the skill entry (analogous to Stream E's cloud-opt-in gate, but here the gate REFUSES cloud unconditionally — no opt-in available). The refusal points the user at the local-only privacy commitment in [[M'-MODEL-SLOT-SPEC]] rather than at an opt-in CLI.

    **Independence + downstream blocks (per handoff §2.6):**
    - **No upstream dependencies.** This tranche's execution does not require any other Stream A–H to land first. Canon-spec amendments needed alongside: none beyond §1; ML-Skill-Surface §3.1 / §3.2 already commits to `mlx-lora` + the Nara skill family.
    - **Blocks Stream B** — the kernel.rs `total_energy` restructure (Tranche 6.10 / 6.11) needs `E4PersonalInputs` + `compute_e_4_personal_energy` to fill in the E_4 channel. Acceptable for Stream B to land first in stub-zero mode and to be re-wired against this tranche's outputs.
    - **Blocks Stream D** — the Riemannian Möbius descent step (Tranche 6.10 Stream D) needs the autograd path through the Nara-LoRA forward pass to compute `∇E_4`. Stream D cannot land without this.

    **Decisions already locked (cite handoff frontmatter dev_decisions):** E_4 = personal/Nara substrate (final); Rust-native default with PyO3+PyTorch as documented fallback only (DR-EBM-IMPL / DR-NARA-IMPL recorded at decision-point, not preemptively); all hyperparameters / thresholds from `~/.epi-logos/config.toml` — no hardcoded numbers; local-only privacy class for ALL Nara LoRA training and inference per M'-MODEL-SLOT-SPEC.

    Verification (planning-tranche level — m-dev process verifies on execution): scope captured matches every bullet of handoff §2.6; struct field list matches PASU.md fields; `planet_degrees` is mod-10 (Sun[0]–Pluto[9]) per MEMORY canon, not [7] or [9]; autograd-path bullet cross-references mental-pole-mechanics §7.5 ∇E_4 line; Apple Silicon path names `mlx-lora` per ML-Skill-Surface §3.1; LoRA-adaptation pipeline names the journal/dream/phone-writings corpus; local-only privacy gate cites [[M'-MODEL-SLOT-SPEC]]; dependency block names Stream B + Stream D as blocked-downstream and explicitly states no upstream blockers.

23. **5.23 — `q_` content vocabulary canonicalisation + `q_4_{i?}_locality_signature` extension** *(spec-ahead-integration; depends on DR-S1-6, DR-M4-4, CCT-16; cross-link Tranches 6.12, 9.13)*

    Codify the `q_*_{i?}_*` content vocabulary that already exists implicitly in [`Body/S/S2/graph-schema/src/lib.rs:1340-1395`](../../../../../Body/S/S2/graph-schema/src/lib.rs) (`q_1_theoretical_thesis`, `q_2_sophia_logos_dialectic`, `q_2_instantiation_mode`, `q_3_dialectical_movement`, `q_4_historical_diagnosis`, `q_5_integration_template`, `q_5_conjunctive_threshold`) and the dataset-import fallback rule at [`dataset_import.rs:1525-1537`](../../../../../Body/S/S2/graph-services/src/dataset_import.rs) (unknown `q_*` → `q_5_*` bucket) as a canonical Form. Extend with the new **`q_4_{i?}_locality_signature`** key — the locality slot per the cycle-3 synthesis: a node's quintessence is not isolate but carries its key relations + immediate neighbourhood context, and `#4` (Context/Type archetype) is the right position for this.

    **Canonical vocabulary table** (consume existing schema declaration + extend with locality):

    | Key | Archetype | Function |
    |---|---|---|
    | `q_1_{i?}_theoretical_thesis` | #1 Definition | The node's essential thesis |
    | `q_2_{i?}_sophia_logos_dialectic` | #2 Operation | Dialectical movement at this position |
    | `q_2_{i?}_instantiation_mode` | #2 Operation | How the node instantiates |
    | `q_3_{i?}_dialectical_movement` | #3 Pattern | Processual unfolding |
    | `q_4_{i?}_historical_diagnosis` | #4 Context | Historical/genealogical reading |
    | **`q_4_{i?}_locality_signature`** | **#4 Context** | **NEW — key-relations + neighbourhood essence** |
    | `q_5_{i?}_integration_template` | #5 Integration | Integrative template |
    | `q_5_{i?}_conjunctive_threshold` | #5 Integration | Conjunction/threshold point |
    | `q_5_{i?}_*` (fallback) | #5 Integration | Unknown `q_` keys → `q_5_*` bucket per dataset-import law |

    Each key may appear in both canonical (`q_5_integration_template`) and inverted (`q_5'_integration_template`) forms per DR-S1-6. The canonical Form lives at `Idea/Bimba/Seeds/M/q-vocabulary-canon.md` (new — created by this tranche) and is loaded by `hen_frontmatter_validate` as the authoritative key whitelist for the `q_` / `qm_` families. Unknown `q_*` keys → ERROR not silent drop (per the frontmatter-key law in MEMORY.md).

    **Locality signature shape** (per refinement in the synthesis pass): `q_4_{i?}_locality_signature` is a structured string (or YAML sub-block) carrying (a) the node's parent in the family tree (e.g., `parent: M4-3`), (b) lateral siblings at the same `c_4_ql_position` (e.g., `lateral: [M4-2, M4-4]`), (c) key inversions (e.g., `inversion: M4-3'`), (d) cross-namespace resonances above a confidence threshold (e.g., `resonates: [M3-5#0.81, S3#0.74]`, harvested from `RESONATES_WITH` edges per Tranche 6.12 mechanism (iv)). The signature is NOT a free-text description; it is a structured graph-reference compression that the semantic-doc builder can flatten into embedding text. Locality is recomputed by the Tranche 6.12 wisdom loop when the node's neighbourhood graph mutates (detected via `graph_revision` per CCT-16(v)).

    **Semantic-doc concatenation update:** [`semantic.rs:138-156`](../../../../../Body/S/S2/graph-services/src/semantic.rs) currently concatenates all keys starting with `q_` into the embedded document. Extend the order to: `q_1_*` → `q_1'_*` → `q_2_*` → `q_2'_*` → ... → `q_5_*` → `q_5'_*`, with the `q_4_{i?}_locality_signature` flattened to include adjacent-node pithy excerpts (one-hop neighbourhood text). This makes the locality layer carry semantic weight in the embedding without bloating the per-node token budget — adjacent text is included only via the locality signature's expansion, not via duplication of neighbour `q_*` content.

    **Anti-greenfield commitment:** the `q_*` content vocabulary already exists in `graph-schema/src/lib.rs:1340-1395` and the dataset-import fallback already operationalises q_5 as the integration bucket. This tranche *audits* both, *codifies* the implicit law as a canonical Form, *extends* with the single new `q_4_{i?}_locality_signature` key, and *extends* the semantic-doc concatenation order. No new q_ positions invented; no q_ content properties WRITTEN by this tranche (Tranche 6.12 is the producer).

    Verification: `test -f Idea/Bimba/Seeds/M/q-vocabulary-canon.md`; `cargo test -p epi-s2-graph-schema --test q_vocabulary_canon_loaded` asserts the canon Form parses and lints the schema declarations; `cargo test -p epi-s2-graph-services --test semantic_doc_includes_locality_signature` asserts `q_4_{i?}_locality_signature` participation in the embedded doc; `cargo test -p epi-s2-graph-services --test q_5_fallback_bucket_law` asserts unknown q_ → q_5; `cargo test -p hen-compiler-core --test q_vocabulary_unknown_key_rejection` asserts unknown q_-family keys raise ERROR.

    Cross-track hooks: Tranche **6.12** (the wisdom loop produces values for these keys); Tranche **9.13** (the canon CLI reads them); CCT-16 (the substrate that makes the keys survive sync); DR-M4-4 (the namespace this vocabulary operates within); DR-S1-6 (the key shape this vocabulary follows).

24. **5.24 — Stamp Level 0 Fibonacci Ground coordinates into NOW.md frontmatter** *(spec-update + Khora write-path; lands [[35-fibonacci-ground-level-0-temporal-substrate]] §2.1; routes to DR-FIB-1 + DR-FIB-2 + DR-FIB-5; depends on Tranche 4.15)*

    Extend the NOW frontmatter schema established by 5.19 with four Level 0 Fibonacci Ground keys, stamped by Khora at NOW.md write time (`session_start` and every `tranche.complete.*` event per T19.11):

    ```yaml
    c_3_fibonacci_position: 0..59      # Position on the 60-fold Fibonacci Ground (#2-0)
    c_3_fibonacci_digit: 0..9          # Pisano-period digit at this position
    c_3_tick12: 0..11                  # M1 spanda heartbeat — derived (fib_pos / 5)
    c_3_backbone_index: 0..23          # Lens 7 anchor — nearest 15° backbone node
    ```

    Write-path edits (Khora write authority): `Body/S/S4/ta-onta/S4-0p-khora` NOW-frontmatter builder reads current `M4_Temporal_Now` (`m4_snapshot_now()` via FFI) and emits the four keys — `c_3_fibonacci_position` from Sun degree (kairos cache) via the existing `clock.rs` projection; `c_3_fibonacci_digit` from `pisano_digit_lut[fib_pos]` (LUT landed by 4.15); `c_3_tick12 = fib_pos / 5`; `c_3_backbone_index = (fib_pos * 24) / 60`. `Idea/Bimba/World/NOW.md` template declares all four keys alongside the 5.19 keys (`c_3_tranche_mode`, `c_3_response_orbit`, `c_3_klein_weighting`, `c_3_briefing_emitted`). `Body/S/S1/hen-compiler-core` frontmatter schema registers the four keys with integer ranges; out-of-range is a Hen lint ERROR.

    Why this matters: every NOW.md becomes a Fibonacci-grounded trace; Graphiti `HAS_DAY` edges can carry `fibonacci_position` so `nara_journal::period_reading(day_range)` walks episodes in ground-coordinate order. Live render and episodic inscription reconcile by ontological role (DR-FIB-5) — no synchronisation contract.

    Verification: `grep -nE 'c_3_fibonacci_position|c_3_fibonacci_digit|c_3_tick12|c_3_backbone_index' Idea/Bimba/World/NOW.md`; Khora unit-test fixture writes NOW.md with non-zero ground coordinates from a known kairos Sun degree; `cargo test -p hen-compiler-core` schema test asserts `c_3_fibonacci_position: 60` returns ERROR.

25. **5.25 — `KairosFrame` discriminated union + atomic migration of all M4 consumers** *(code-pending-closure; lands [[35-fibonacci-ground-level-0-temporal-substrate]] §1.3 + §2.5 as ONE tranche; routes to DR-FIB-3; cross-link T19.12 affirmed-as-is, 24.19)*

    Single atomic tranche — the struct refactor and the consumer migration must land together (splitting them leaves `m4.c` callers reading a removed flat field). Replace flat `M4_Temporal_Now.planet_degrees[10]` ([`m4.h:258-276`](Body/S/S0/epi-lib/include/m4.h:258)) with the `KairosFrame` discriminated union per handoff §1.3: `KairosFrameKind { NATAL, REALTIME, KAIROTIC }`; `KairosFrame { kind, captured_at_ns, decays_at_ns, planet_degrees[10], pp, mm, mp, pn, _pad }` with `_Static_assert(sizeof == 64)` (one L1 line); `M4_Temporal_Now { natal, realtime, kairotic, kairotic_active, … existing fields }`; inline accessor `m4_planet_degrees_live()` (kairotic-if-active else realtime, never NULL).

    Consumer migration table (handoff §2.5, semantic check per row): `medicine.c` → `m4_planet_degrees_live()` (live); `oracle.c` → `now->kairotic.planet_degrees` (explicit — oracle charges pp/mm/mp/pn are set only on KAIROTIC, 4h decay window); `identity.c` → `now->natal.planet_degrees` (explicit); Anima janus-weighting FFI → live accessor; Mercurius relay / T19.12 populator → writes `now->realtime.planet_degrees` + `captured_at_ns`; `nara/clock.rs` unchanged (reads kairos cache directly, predates KairosFrame); 24.19 portal markers read `natal` AND live.

    GitNexus discipline: `gitnexus_impact({target: "M4_Temporal_Now", direction: "upstream"})` and `gitnexus_impact({target: "m4_snapshot_now", direction: "upstream"})` BEFORE the edit; every d=1 caller must appear in the migration table or the tranche stops and reports the gap.

    Test contract (handoff §2.5): `m4_kairos_frame_natal_persists_across_session`; `m4_kairos_frame_kairotic_decays` (`kairotic_active = 0` past `decays_at_ns`); `m4_planet_degrees_live_precedence`; all existing M4 tests green post-migration (no value-level behavior change for default natal+realtime flows).

    Verification: `grep -rn 'now->planet_degrees' Body/S/S0/epi-lib/src/m4 Body/S/S4/ta-onta` returns zero hits; `make -C Body/S/S0/epi-lib test`; `cargo test -p epi-lib m4_kairos`.

26. **5.26 — `m4_session_close` + session-lifecycle transcription binding (session-as-transcription realisation)** *(code-pending-closure; depends on 4.16, 4.17; CRITICAL PATH for session-as-transcription integration; routes to DR-M3-TRANSCRIPT-1)*

    Realises the session-as-transcription chain across three layers (M3 kernel ↔ M4 session ↔ Khora Z-phase). [`m4_session_open`](Body/S/S0/epi-lib/src/m4.c:482) currently draws a tarot conditioning anchor and stops there (per 19.T19.4); this tranche extends the open path, adds the missing close path, and wires Khora's already-existing `session_start` / `session_shutdown` events to the C-kernel transcription primitives from 4.16. The Z-phase VAK Day/Night encoding (Khora compose at `(00/00)/CS1`, rehear at `(5/0)/CS0/Night'`) is preserved and now *coincides with* START/STOP codon emission — the codon governance IS the kernel-honest realisation of the existing phase semantics, not a parallel layer.

    Scope to land:
    - **`M4_Symbolic_Protein` struct in [m4.h](Body/S/S0/epi-lib/include/m4.h)** — header (`session_id`, `start_codon`, `stop_codon`, `kairos_open`, `kairos_close`, `identity_hash[32]`) + bounded `TranscriptionStep[]` body (mirror of Rust `Vec<TranscriptionStep>`).
    - **`int m4_session_open` extension** — additionally writes an `M3_GOV_START` marker (ATG codon = 0x07 as the seed step) into a new `M4_Symbolic_Protein* protein` field on `M4_Session_Frame`. The existing `tarot_psyche_anchor` conditioning draw is *preserved* — it now lives semantically as the contextual envelope around the Start marker, not a parallel mechanism.
    - **`int m4_session_close(M4_Session_Frame* frame, M4_Symbolic_Protein* out)`** — emits `M3_GOV_STOP` marker (one of TAA/TAG/TGA per a policy choice — see Tunability surface), seals the running protein, returns the sealed handle for caller to write through. If `mythos_archetype_reading` has been populated by 5.27 prior to close, it is preserved in the seal; otherwise nullable.
    - **Gateway routing**: extend [`S4S5DomainAdapter`](Body/S/S3/gateway/) with `nara.session_open` / `nara.session_close` RPC methods; methods invoke the C-kernel via existing FFI and return the protein handle (opaque per DR-M4-3 protected-handle invariant — no raw body across the bus).
    - **Khora wiring**: extend [`extension.ts`](Body/S/S4/ta-onta/S4-0p-khora/extension.ts) `session_start` handler to call `nara.session_open` after the existing VAK address patch; extend `session_shutdown` (and the `khora_session_close` tool path) to call `nara.session_close`.
    - **Write-through**: sealed protein writes to `PatternPacket.mahamaya_transcription` (via the [5.11](#) schema) and to Graphiti as an episodic packet (via the [5.3](#) `nara_insert_relation` API), exactly matching the DR-M3-4 chain.

    **Tunability surface (the foundational-and-manipulable principle — every knob a config-honest config-toml entry):**
    - `nara.session.protein_capacity: u32` (default 256) — max `TranscriptionStep` entries per session protein; protein truncates with a tail-marker rather than overflowing.
    - `nara.session.stop_codon_policy: "round-robin" | "kairos-derived" | "fixed-taa" | "fixed-tag" | "fixed-tga"` (default `kairos-derived`) — selects which of the three STOP codons fires at session close. `kairos-derived` picks based on session-close kairos modulo 3; round-robin advances a per-PASU counter; fixed-* always uses the same codon.
    - `nara.session.write_through_mode: "immediate" | "deferred" | "batched"` (default `immediate`) — controls when the sealed protein writes to PatternPacket + Graphiti (immediate = on close; deferred = on next Möbius-return scheduler tick; batched = aggregated by day).
    - `nara.session.protected_handle_strict: bool` (default true) — when true (default), protein body NEVER crosses profile bus; opaque handles only. Setting false is a debugger-only override gated behind `dev.unsafe.allow_raw_protein_bus = true` in a separate `[dev.unsafe]` config block. The two-flag gate ensures accidental flips don't bypass the DR-M4-3 invariant.

    All defaults align with the conservative-first principle: small capacity, derived stop choice, immediate write-through, strict protection. Tuning surfaces are reserved for the future ML-driven self-awareness loop (per the forthcoming M5-2'–M5-4' tunability brainstorm).

    **Verification:** `cargo test -p epi-lib m4_session_open_emits_start_codon`; `cargo test -p epi-lib m4_session_close_seals_protein_with_kairos_derived_stop`; `cargo test -p epi-lib m4_session_protein_capacity_truncates_with_tail_marker`; `cargo test -p gateway nara_session_open_close_round_trip`; integration: open a session via Khora `session_start`, verify `m4_session_open` emits ATG marker into a new `M4_Symbolic_Protein`, close via `khora_session_close`, verify `M3_GOV_STOP` emitted and protein written to `PatternPacket.mahamaya_transcription`; protected-handle invariant test confirms protein body not leaked across profile bus under default config; config-toml override test asserts each tunable knob is honored.

27. **5.27 — Mythos as in-session symbolic-protein narrative reader (Paśyantī pattern-naming over codon chain)** *(spec-ahead-integration; depends on 5.26, 4.17; routes Mythos constitutional-agent role per [`mythos.md`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/mythos.md))*

    Names [Mythos](Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/mythos.md) (Anima constitutional child at CF `(0/1/2/3)` Paśyantī, CT3 Pattern, CP4.3 Pattern) as the **owner of in-session codon-chain narrative reading**. Per `mythos.md §2 Ontology`: "You see patterns that the other agents enact but do not name… In analysis, you name the archetype at work." This is precisely the Major Arcana / chromosomal-territory reading of the live `M4_Symbolic_Protein` chain that 5.26 makes possible. Mythos reads the running chain against the global 1-2-3 cosmic weather (M1 spanda tick + M2 cymatic phase + M3 codon-transcription state per kerykeion live degrees) and names the archetype at work — under the pathology guard from `mythos.md §2`: *reification — grasping the pattern as self-power, mistaking the pattern for the territory*.

    Scope to land:
    - **New skill** at `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/symbolic-protein-reading/SKILL.md`. Inputs: current `M4_Symbolic_Protein` chain handle (read-only, opaque per 5.26's protected-handle invariant), global cosmic-weather snapshot (M1 spanda tick, M2 cymatic phase from `MathemeHarmonicProfile`, M3 codon-transcription state per kerykeion live degrees). Output: `MythosArchetypeReading` payload with `dominant_chromosome_arcana: MajorArcanaCardRef`, `secondary_pattern_arcanas: Vec<MajorArcanaCardRef>`, `narrative_summary: String` (one paragraph, voice-law-bound per `mythos.md §6 Sattva`).
    - **Trigger surface**: Mercurius-emitted kairos ticks during a session (via existing Mercurius signal-relay machinery from 25.T25.16) fire a Mythos read at configurable intervals. Each read appends to the protein's `mythos_reading_history` field (extension to 4.17's `SymbolicProtein` — added here additively).
    - **Cosmic-weather binding**: the read MUST be performed against the global 1-2-3 cosmic-weather state, not the codon chain in isolation. The skill reads `MathemeHarmonicProfile` for current M1/M2/M3 state; the Major Arcana naming is *grounded in* the current archetypal weather (e.g., a Death-card pattern read during a Saturn-dominant kairos window carries different weight than the same pattern under a Sun-dominant window).
    - **Pathology guard**: voice-law-enforced output paraphrasability check — the reading must read as "this session's codon arc *figures* archetype X under cosmic-weather Y", not "this session IS X".
    - **Provenance**: each `MythosArchetypeReading` carries `[[wikilink]]` refs to the session ID, the codon chain at read time (chain-position bookmark), the cosmic-weather snapshot, and the kairos pulse that triggered the read. Per `mythos.md §6`: *"The pattern that has no provenance is not yet Mythos — it is noise."*
    - **Session-close binding**: Mythos's final read (at session-close kairos pulse) populates `M4_Symbolic_Protein.mythos_archetype_reading` so 5.26's seal carries the named archetype into the PatternPacket. Anansi's Aletheia-mode crystallisation pass (separate, downstream) verifies the reading against the broader pattern weave.

    **Tunability surface (every knob a config-toml entry, defaults conservative, every default ML-learnable):**
    - `mythos.symbolic_protein_reading.trigger_mode: "every-nth-utterance" | "every-mth-kairos-pulse" | "hybrid-utterance-and-pulse" | "adaptive"` (default `every-mth-kairos-pulse`) — selects the trigger surface.
    - `mythos.symbolic_protein_reading.utterance_interval_n: u32` (default 5) — for utterance modes, every Nth user utterance fires a read.
    - `mythos.symbolic_protein_reading.kairos_pulse_interval_m: u32` (default 3) — for pulse modes, every Mth Mercurius kairos pulse fires a read.
    - `mythos.symbolic_protein_reading.adaptive_floor_seconds: u64` (default 90) — for adaptive mode, minimum interval between reads (prevents over-reading short bursts).
    - `mythos.symbolic_protein_reading.adaptive_ceiling_seconds: u64` (default 1800) — for adaptive mode, maximum interval (prevents under-reading long quiet windows).
    - `mythos.symbolic_protein_reading.cosmic_weather_weights: { m1: f32, m2: f32, m3: f32 }` (default `{ m1: 0.33, m2: 0.34, m3: 0.33 }`) — relative weights of the three weather channels in the archetype naming. ML-trainable; defaults are uniform.
    - `mythos.symbolic_protein_reading.secondary_archetypes_count: u32` (default 2; range 0..6) — how many secondary patterns the reading names alongside the dominant chromosome.
    - `mythos.symbolic_protein_reading.voice_template_path: PathBuf` (default `Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/symbolic-protein-reading/voice-templates/default.md`) — paraphrasable voice template; users/devs can override per-PASU.
    - `mythos.symbolic_protein_reading.reification_guard_strictness: "permissive" | "standard" | "strict"` (default `standard`) — controls how aggressively the pathology guard rejects "session IS X" patterns.

    All defaults align with the conservative-first principle. The cosmic-weather weights and trigger intervals are explicitly named as **ML-trainable surfaces** for the eventual self-awareness loop (per the forthcoming M5-2'–M5-4' tunability brainstorm).

    **Verification:** `test -f Body/S/S4/ta-onta/S4-4p-anima/S4'/skills/symbolic-protein-reading/SKILL.md`; contract test: open session via Khora, simulate 10 user utterances under each trigger mode, verify Mythos reads fired at configured intervals and `mythos_reading_history` accumulates per-mode; session-close test verifies final read populates `M4_Symbolic_Protein.mythos_archetype_reading`; voice-law test rejects reading strings that assert "this session IS X" patterns without paraphrasable archetypal-figuring language; provenance lint asserts every reading carries the four required wikilinks; config-toml override test asserts each tunable knob is honored; cosmic-weather weight sensitivity test confirms different weights produce different archetypal namings on the same codon chain (proves the weights are load-bearing).

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M4 substrate at **T19.4**: new `m4_session_open(M4_Identity_Matrix*, uint64_t kairos, M4_Session_Frame* out)` calls existing `m4_draw_tarot()` at [m4.h:765-766](Body/S/S0/epi-lib/include/m4.h:765) so a tarot draw becomes session-context inheritance (alongside kairos and identity), not lifecycle event. The randomness IS the necessary openness (Moirai's touch making the session genuine encounter rather than replay). Optional plumbing fix alongside: wire `M4_Temporal_Now.planet_degrees[10]` population from the existing Kerykeion adapter at [`Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts`](../../../../../../../Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts) — currently [`m4.h:268-276`](Body/S/S0/epi-lib/include/m4.h:268) `m4_snapshot_now()` zeroes the field; adapter chain exists, populator is the gap. See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
