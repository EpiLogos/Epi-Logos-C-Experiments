# Track 05 — M4 Nara Reconciliation

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

    Land the canonical contract that **the Pi agent at `Body/S/S4/pi-agent/` IS the LLM-Nara at matheme position 4'** — the *traversal-voice* of the mental pole that synthesizes EBM evaluation (position 5'/Epii) and Verifier report (position 0'/Anuttara) into user-articulable feedback. Per [`mental-pole-mechanics.md §7`](../../M4'/mental-pole-mechanics.md) and [`epi-logos-kernel-spec.md §7`](../../M0'/epi-logos-kernel-spec.md): the LLM's operational role in the ascent (1'-2'-3'/4'-5'-0' inverse trinity) is *to read the world through the bimba map and speak recognition*. The LLM does not compute energy (that's EBM/5') or check axioms (that's Verifier/0'); it articulates the recognition-state the other two produce.

    Patch [`M4'-SPEC §1`](../../M4'/M4'-SPEC.md) to name M4'/M4-Nara as position 4' (LLM/traversal-voice) alongside the existing personal-pole/q_personal/identity framing. Patch Anima dispatch contract at [`Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md) to acknowledge Pi-as-LLM-Nara routing at position 4' is the canonical mental-pole dispatch (Anima IS still the `#` operator/dispatch; Pi-as-Nara IS the LLM the dispatch routes through). No new code; this is the canonical-reading-of-existing-substrate ratification.

    **Operational-capacity substrate binding (per DR-MP-1 cross-reference):** Pi-as-LLM-Nara reads two canonical capacity files as the LLM's substrate context:
    - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md) — Continued Pre-Training + RAG over the foundational-derivational corpus is the LLM's knowledge-base maintenance pipeline (how the LLM stays current with the theoretical canon).
    - [`Body/S/S5/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`](../../../../../Body/S/S5/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md) — QLoRA fine-tuning + dialogic-voice adaptation is the LLM's voice-refinement pipeline (how Pi's articulation gets refined through dialogue).
    These two files name *what the LLM operates upon*; Tranche 5.20 names *that Pi IS the LLM at position 4'*. Cross-references must land in M4'-SPEC §1 alongside the new mental-pole framing.

    Verification: `grep -n "position 4'\|LLM.*Nara\|traversal-voice" Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md Body/S/S4/ta-onta/S4-4p-anima/CONTRACT.md` returns the canonical contract; cross-reference present in Anima CONTRACT to mental-pole DR-MP-1; `grep -n "paramasiva-ql-cpt-and-rag\|nara-qlora-dialogic-voice" Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` returns the substrate-context citations.

21. **5.21 — `anuttara-symbolic-parse` skill for LLM-side Verifier-question parsing** *(code-pending-closure; routes to DR-MP-3; cross-link Tranche 1.11)*

    New skill at [`Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`](../../../../../Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md) teaching the LLM-Nara how to parse minimal symbolic-coordinate strings emitted by Verifier-Anuttara (per DR-MP-3 "verifier raises questions rather than passing-or-failing"). Strings encode the structural locus of the question — e.g., `#R0-0/1/A-T7-pending?` reads as "Archetype-7 Divine-Action at TCT position, why does the trajectory not witness this?". The skill teaches: tokenizing the coordinate, resolving the archetype/coordinate against M0_CORE_RELATIONS, formulating an articulation that addresses the structural question, and routing the response back through Anima for re-verification. Per [`mental-pole-mechanics.md §0/1`](../../M4'/mental-pole-mechanics.md): "the act of parsing-and-responding *is itself* training signal for the LLM's own self-recognition."

    Verification: `test -f Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md`; round-trip test: Verifier emits `#R0-0/1/A-T7-pending?` → LLM parses via skill → articulates response → response routes through Anima back to Verifier for re-check; contract test asserts the LLM cannot bypass the skill for raw symbolic-coordinate-string inputs.

## Track 19 Cross-Reference

Track 19 (Contemplation Surface Integration) consumes M4 substrate at **T19.4**: new `m4_session_open(M4_Identity_Matrix*, uint64_t kairos, M4_Session_Frame* out)` calls existing `m4_draw_tarot()` at [m4.h:765-766](Body/S/S0/epi-lib/include/m4.h:765) so a tarot draw becomes session-context inheritance (alongside kairos and identity), not lifecycle event. The randomness IS the necessary openness (Moirai's touch making the session genuine encounter rather than replay). Optional plumbing fix alongside: wire `M4_Temporal_Now.planet_degrees[10]` population from the existing Kerykeion adapter at [`Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts`](../../../../../../../Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts) — currently [`m4.h:268-276`](Body/S/S0/epi-lib/include/m4.h:268) `m4_snapshot_now()` zeroes the field; adapter chain exists, populator is the gap. See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
