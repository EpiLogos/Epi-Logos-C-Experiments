---
title: "M4' Nara Architecture — Total Shape, Substrate Map, Profile-Bus Contract, Psychoid Field Engine & Tick Choreography"
coordinate: "M4 / M4'"
status: "canonical-architecture-spec"
created: 2026-06-02
authority_relation: "Domain authority for the M4' surface. M4'-SPEC cross-references this document for the six sub-coordinates' total shape, the profile-bus deltas required for personal-pole rendering, the psychoid-cymatic field rendering contract, and the personal-side tick choreography. Where they disagree, this document is authoritative for the M4' surface specifically; M4'-SPEC remains authoritative for the broader Nara doctrine (privacy boundary, promotion law, Vāma policy, M4-0 branch law)."
depends_on:
  - "[[M4'-SPEC]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[m4-prime-nara-day-episodes-and-oracle-artifacts]]"
  - "[[nara-m4-0-0-birthdate-encoding-spec]]"
  - "[[nara-m4-0-identity-branch-integration-map]]"
  - "[[m4-prime-nara-integration-research]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
  - "[[M1-2-ANANDA-VORTEX-ARCHITECTURE]]"
companion_research:
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m4-reconciliation-matrix.md"
decisions_consumed:
  - "DR-M4-1 (vault path: `Pratibimba/Nara/{day_id}/`) — ratified; code already conforms (nara-surface.ts:415-417)"
  - "DR-M4-2 (q_personal baseline + Cl(4,2) axis order + Vāma classifier policy + 0/1 cymatic polarity) — five clauses; consumed throughout"
related_tranches:
  - "06.* — M4-Nara extension (cycle-2 inheritance, T0-T3 substrate)"
  - "10.* — kernel-bridge profile-spine (depositionAnchor, klein_flip, resonance ledger)"
  - "08.* — integrated 4-5-0 recognition plugin composition"
  - "15.1-15.7 — UI foundation principles, OmniPanel, activity-bar, profile-tick, state persistence"
cross_references:
  - "[[M0-ARCHITECTURE]] — the 4+2 city-scape backdrop / Jiva-is-Śiva integrated 4-5-0 ground"
  - "[[M1-ARCHITECTURE]] — Cl(4,2) ring quaternion + Hopf bundle (same algebra at personal scale)"
  - "[[M2-ARCHITECTURE]] — Vimarśa audio_octet/nodal_quartet bus (cymatic substrate input)"
  - "[[M3-ARCHITECTURE]] — q_cosmic codon-charge quaternion (the resonance counterparty)"
  - "[[M5-ARCHITECTURE]] — review/promotion gate + Epii relay (M4.5 receives the seam from this side)"
  - "[[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] — the 4-5-0 integrated plugin (Nara as Jiva pole)"
---

# M4' Nara Architecture

## §0 — Frame

**M4' is the protected personal-Pratibimba field of the M' stack.** It is the surface at which the user is *implicated* in the cosmic matheme rather than spectating it — the place where the same Cl(4,2) algebra that runs at M1 (the ring quaternion), at M3 (the codon-charge quaternion), and at the Kerykeion natal scale (the elemental-temperament quaternion) finally finds its **personal point** and computes the resonance metric between this user and the current cosmic state.

Nara is not a journal that knows astrology. Nara is the lived register where M1's toroidal recognition, M2's vibrational correspondence, and M3's binary-codon substrate **cohere into a psychoid field that has the topological structure of a being** (`m4-prime-psychoid-cymatic-field-engine.md` §0). The user IS the place where the 1-2-3 substrate becomes living being-pattern; M4' is the Theia / kernel-bridge surface that holds that fact honestly without lecturing the user about it (`M4'-SPEC` §6.5 default surface).

This document gives the **total shape** of M4' across all six sub-coordinates: substrate map with file:line citations, dataset map, the profile-bus contract additions required for personal-pole rendering, the psychoid-cymatic field rendering contract (the M' product surface owned here), the personal-side tick choreography, the M4↔Mn boundary contracts, the Theia integration, and the anti-greenfield audit. It is the canonical reference both `M4'-SPEC` and `nara-ux-full-m4-branch-update.md` defer to for M4'-render-side specifics.

The bimba/pratibimba dial at this scale: **M4' is the pratibimba pole of M0' (Anuttara ground) read through the matheme spine M1→M2→M3 as the user's lived field.** The 4-5-0 integrated plugin is the surface where this is enacted: Nara as Jiva, Epii as paidagōgos, Anuttara as ground — *jīva eva śivaḥ*, made visible.

---

## §1 — The Six Sub-Coordinates (bimba ↔ techne mapping)

Per M4'-SPEC §6.6, `m4-prime-nara-activity-graphiti-instrument`, and `nara-ux-full-m4-branch-update.md` §2 — the six sub-coordinates of M4' name not "modules" but the **personal-pole reading of the QL Mod-6 cycle**. Each carries a load-bearing structural identity at the personal scale.

| Bimba | Name | What it owns | Techne (substrate authority) | Render aspect |
|---|---|---|---|---|
| **M4-0'** | Personal identity / identity-system evidence | Six-layer identity branch (M4-0-0 birthdate · M4-0-1 decanic · M4-0-2 Jungian · M4-0-3 Gene Keys · M4-0-4 Human Design · M4-0-5 Quintessence). Source of `Q_identity` contributions. **Stable, not mutable from daily activity.** | `Body/S/S0/epi-lib/include/m4.h:90-228` (six layer structs + Identity Matrix); `Body/S/S0/portal-core/src/personal_identity.rs:101-141` (PersonalIdentityProfile, q_personal); `Body/S/S0/epi-cli/src/nara/wind.rs:117-148` (Kerykeion natal path) | Lean identity sidebar: name + elemental balance percentages (Earth/Fire/Water/Air); layer-presence indicators; no quaternion-dump |
| **M4-1'** | Q_personal baseline / somatic-medicinal field | Personal-quaternion at rest (the Kerykeion-natal-derived `q_personal`); body/transit/somatic current; elemental triage; chakra-state read; medicine triage | `Body/S/S0/epi-lib/include/m4.h:419-470` (`M4_Sympathetic_Medicine`, `M4_Elemental_Balance`, `M4_Chakra_State`); `personal_identity.rs:77-99, 230-265` (ElementalBalance + dignity weights); `Body/S/S0/portal-core/src/kernel.rs:374` (q_cosmic counterparty) | Resonance indicator (numeric + ConjugateFormCharacter Major/Minor/Shadow); elemental-balance bars; chakra glow density on psychoid axis |
| **M4-2'** | Q_transit / Kerykeion oracle service | Current transit quaternion (live); oracle artifact service (Quaternal Tarot · Quaternal I-Ching · dream-omen · Mahāmāyā transcriptional clock packets); planetary-hour/decan/lunar state | `Body/S/S0/epi-lib/include/m4.h:258-340` (`M4_Temporal_Now`, `M4_Sacred_Random`, `M4_IChing_Cast`, `M4_Tarot_Draw`, `M4_Oracle_Draw`, `M4_Canonical_Tag`); `epi-cli/src/nara/wind.rs:110-156, 178-228` (Kairos current; degree/element/decan extraction); `Body/S/S3/graphiti-runtime/src/lib.rs` (episode payload) | Oracle inspector panel; transit ring on psychoid backdrop; Mahāmāyā clock-walk inspector |
| **M4-3'** | Q_activity / transformation processor / logical-intelligence engine | The **central** Nara intelligence per UX doc §2.5: cross-dialect pattern integration; lens-routing through MEF squares (L2/L2'/L3/L3' primary; adjacent squares); `PatternPacket` production; teaching-threshold detection; Mahāmāyā transcription-packet ingestor | `Body/S/S0/portal-core/src/nara_journal.rs:48-185` (`NaraJournalParseInput`, `NaraSymbolicObservation`, `NaraParsedActivity`, `NaraJournalParser`); `ActivityStateEffect`, `NaraActivityEvent`, `NaraActivityKind` (re-export surface); no `PatternPacket` substrate yet (DOC-AHEAD per Wave-A row 8/15) | "Explain my resonance" panel: source artifact → M4 domain → MEF lens-position → active square → evidence spans → Q_activity effect → uncertainty (per UX §6.2) |
| **M4-4'** | Q_composed / bioquaternion / journal-graphiti-life field | The live composed state `Q_composed = Q_identity · Q_transit · Q_activity`; the bioquaternion **decomposition** `(q_b, q_p)` — bimba/pratibimba reading of `Q_composed`, NOT independent input; day-as-episode container; journal/dream/highlight/agent-chat artifacts; Graphiti episodic memory at PersonalNexus | `personal_identity.rs:177-186` (`compose_personal_quaternion`); `kernel.rs:46-59` (`BioQuaternionState { q_b, q_p }` — landed, lines 48-49); `nara_journal.rs` (journal parser); `Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts:62-74, 137-237` (`NaraDayContainer`, `createNaraArtifact`, `readNaraDayContainer`); `graphiti-runtime/src/lib.rs:132` (protected-local-episodic-memory privacy boundary) | Journal/flow editor (primary); DAY/NOW header; artifact tree; Graphiti browser; trajectory panel (PatternPacket aggregations) |
| **M4-5'** | Psychoid cymatic field at personal scale / Epii relay gate | The Diamond-QL Vitruvian psychoid field renderer (the M' product surface owned here, first-build allowed); the review/promotion gate (`proposed → reviewed → accepted|rejected → applied`); the seam to M5-4' (Epii review) and M5-5' (Sophia teaching); the Möbius return point for #4.4.4.4 updates | M2' cymatic engine + M1-5 Hopf bundle + M3-5 lens-stack consumed as substrate; `kernel.rs:46-59` BioQuaternionState; `kernel.rs:374-376, 486-488` (q_cosmic, resonance, conjugate_form_character on profile); `audio_octet[8]`, `nodal_quartet[4]` from kernel.rs (Vimarśa-window); **renderer first-build at `Body/M/epi-theia/extensions/m4-nara/src/browser/psychoid_cymatic/`** (DOES NOT YET EXIST — proposed tranche) | Diamond/bipyramid + Hopf-linked tori + cymatic standing-wave field + lens-ring backdrop + Vāma śakti contemplative glyph layer + sushumna axis with chakra assemblage points |

**The six-fold structure is the QL Mod-6 cycle read at personal scale**, exactly parallel to (and an instance of) the same cycle at M1 ring positions, M3 codon positions, and the bimba map. M4-0' is the ground (P0 / "what is given"); M4-1' is definition / baseline (P1); M4-2' is operation / event (P2); M4-3' is pattern (P3 — the central transformation engine); M4-4' is the lived context / fractal-doubling lemniscate (P4); M4-5' is integration / Möbius return (P5 — where reviewed activity may, with consent, perturb the personal field, and where the 4-5-0 seam opens to Epii).

**Note on M4-4-4-4.** The deepest #4-nesting (M4 → M4-4 → M4-4-4 → M4-4-4-4) is the *protected personal-Pratibimba carrier location* — the lemniscate-at-the-lemniscate-at-the-lemniscate-at-the-lemniscate where personal-quaternion-form lives (M4'-SPEC §7.1). It is **not a seventh sub-coordinate**: it is the recursive deepening of M4-4' itself. Per the corrected UX framing (`nara-ux-full-m4-branch-update.md` §2.2), this is the **living update target** — daily activity perturbs #4.4.4.4 through `Q_activity` and reviewed proposals, but **never mutates M4-0'**.

---

## §2 — Substrate Map

### §2.1 M4-0' Personal identity — the six-layer identity branch

C declarations in `Body/S/S0/epi-lib/include/m4.h`:

| Symbol | Decl | Bytes | What it carries |
|---|---|---|---|
| `M4_Numerological_Layer` | `m4.h:91-100` | 8 | #4.0-0 birthdate encoding — `numerological_key` (4-fold), `sixfold_difference`, `sixfold_sum`, `life_path` |
| `M4_Astrological_Layer` | `m4.h:103-116` | 32 | #4.0-1 decanic / natal — sun/moon/asc/mc anchors on the 720 clock; all 10 planet degrees; dominant sign / element / modality |
| `M4_Jungian_Layer` | `m4.h:119-135` | 12 | #4.0-2 — `nucleotide_balance` (A/T/C/G ↔ Cups/Wands/Pentacles/Swords ↔ F/N/S/T); MBTI 4-bit; dominant + auxiliary cognitive functions; enneagram |
| `M4_GeneKeys_Layer` | `m4.h:138-154` | 40 | #4.0-3 — `gene_keys_activation` (M3 bitboard mask); shadow/gift/siddhi masks; life-work / evolution / radiance / purpose / attraction / IQ / EQ / SQ hexagrams |
| `M4_HumanDesign_Layer` | `m4.h:157-169` | 20 | #4.0-4 — type / authority / profile / definition / incarnation cross / defined channels / defined gates |
| `M4_Symbol_DNA_Profile` | `m4.h:70-82` | — | Legacy synthesised view (gene_keys + nucleotide_balance + sun/moon anchors) |
| `M4_Identity_Matrix` | `m4.h:198-228` | ~166 | Composes all six layers via `layer_presence` bitmask; `quintessence_hash[32]` is the BLAKE3 of present layers (M4-0-5); `quintessence_preview[65]` is the 64-hex display |
| `M4_LAYER_*_PRESENT` | `m4.h:172-176` | — | Five presence bits (M4-0-0 through M4-0-4); M4-0-5 always derives from present layers |
| `m4_identity_hash_compute` | `m4.h:242` | — | Recomputes quintessence hash from present layers only |
| `m4_identity_augment` | `m4.h:245-248` | — | Adds a new layer to existing matrix; recomputes hash; the **only legitimate M4-0 mutation path** |

**Static asserts at compile time** (`m4.h:99, 115, 134, 153, 168`) lock each layer's byte size — the substrate refuses to allow drift.

Rust runtime surface — `Body/S/S0/portal-core/src/personal_identity.rs`:

- `PersonalIdentityProfile` (`personal_identity.rs:101-109`) — carries `q_personal: [f32; 4]`, `natal_chart_handle: String`, `elemental_balance: ElementalBalance`, `identity_hash: String`, `privacy_class: ProfilePrivacyClass` (defaults to `ProtectedLocalDerived`)
- `from_kerykeion_json` (`personal_identity.rs:112-119`) and `from_natal_chart` (`personal_identity.rs:121-136`) — constructors
- `elemental_weights_from_chart` (`personal_identity.rs:230-240`) — runs all 10 planets through `component_for_sign` + `planet_dignity_multiplier` against the keplerian-velocity LUT (mirrors `M2_PLANET_LUT.keplerian_vel`, see `personal_identity.rs:11-15`)
- `composed_quaternion` (`personal_identity.rs:138-140`) — exposes `compose_personal_quaternion`

**Substrate state per Wave-A row 10:** today M4-0 carries **Kerykeion-only `q_personal`**. Birthdate/Jungian/Gene Keys/Human Design layers are declared in `m4.h` but the Rust portal surface only implements layer-1 (Astrological / Kerykeion). DR-M4-2 clause 1 ratifies: `q_personal` is the natal baseline contribution; `Q_identity` names the integrated quintessence as more layers land.

### §2.2 M4-1' Q_personal baseline / somatic field

C declarations in `m4.h`:

- `M4_Elemental_Balance` (`m4.h:419-425`) — fire/earth/air/water/quintessence as `uint8_t`
- `M4_Chakra_State` (`m4.h:427-430`) — id / activation / blockage triple
- `M4_Sympathetic_Medicine` (`m4.h:436-450`-ish; struct definition extends past line 440) — composed at #4.1-0..#4.1-3
- `M4_Medicine_Triage` (`m4.h:346-358`, 16 bytes) — fire/water/earth/air intensities; dominant + deficient element; primary chakra; triage vector; planetary hour; safety mask
- `M4_Transform_State` (`m4.h:368-379`, 16 bytes) — alchemical operation index; stroke phase; cycle count; container active; decan recipe index; arousal level; safety threshold

Rust elemental-balance surface — `personal_identity.rs:77-99, 230-265` — runs the same dignity ladder (domicile/exaltation/detriment/fall multipliers at 1.20/1.10/0.90/0.85) over the 10-planet weights.

### §2.3 M4-2' Q_transit / oracle service

- `M4_Temporal_Now` (`m4.h:258-266`) — composes M1/M2/M3 clock + degree (720) + chronos epoch + 10 planet degrees + valid bitmask
- `m4_snapshot_now(degree, epoch)` (`m4.h:268-276`) — reads `m0_read_cosmic_clock(degree)` and stamps planetary slots
- Oracle primitives — `M4_Sacred_Random` (`m4.h:285-288`), `M4_IChing_Cast` (`m4.h:290-296`), `M4_Tarot_Draw` (`m4.h:298-304`), `M4_Canonical_Tag` (`m4.h:306-313`)
- Expanded `M4_Oracle_Draw` (`m4.h:322-339`, ~128 bytes) — canonical-tag payload bridges oracle → medicine → transformation
- Magic-number type safety + Divination vtable (`m4.h:389-412`)
- Kairos adapter path — `Body/S/S0/epi-cli/src/nara/wind.rs:110-156` runs `kairos::run_kerykeion_current(&today)` and `kairos::run_kerykeion_natal(date, time, lat, lon)`; the wind module saves natal at `kairos_dir/natal.json` and sets `profile.kerykeion_version = "4.x"`

### §2.4 M4-3' Q_activity / transformation processor

Rust journal parser — `Body/S/S0/portal-core/src/nara_journal.rs`:

- `NaraJournalParseInput` (`nara_journal.rs:48-62`) — `event_id, kind, coordinate, day_id, now_path, session_key, identity_ref, matheme_handle, raw_body_handle, body, source_ref, kairos_snapshot`
- `NaraJournalDocument` (`nara_journal.rs:64-92`) — normalises body, computes word/line counts
- `NaraSymbolicObservation` (`nara_journal.rs:120-…`) — typed observation candidates
- `NaraParsedActivity` (`nara_journal.rs:138-…`) — privacy-class-tagged parse result
- `NaraJournalParser::parse` (`nara_journal.rs:162-185`+) — the parse entry point
- Valence keyword lists (`nara_journal.rs:8-34`) and oracle markers (`nara_journal.rs:36-46`) drive the deterministic observation pass

**Substrate gap (Wave-A row 8/15):** there is **no `PatternPacket` struct** in `portal-core/src/`. The UX doc §3.4 specifies a structured `PatternPacket` envelope (root_lens / active_square / dialect_resonances / mahamaya_transcription / body_integration / life_dream_integration / q_activity_delta / m4_5 review fields). M4-3' is the **logical-intelligence engine** of Nara; today the substrate carries only the journal parser surface. This is the SPEC-AHEAD → tranche slot.

### §2.5 M4-4' Q_composed / bioquaternion / day-episodes / Graphiti

**Q_composed** — `Body/S/S0/portal-core/src/personal_identity.rs:177-186`:

```rust
pub fn compose_personal_quaternion(
    q_identity: [f32; 4],
    q_transit: [f32; 4],
    q_activity: [f32; 4],
) -> [f32; 4] {
    quat_normalize(quat_mul(
        quat_mul(quat_normalize(q_identity), quat_normalize(q_transit)),
        quat_normalize(q_activity),
    ))
}
```

The composition is left-associated: `((Q_identity · Q_transit) · Q_activity)` then normalised. This is the live runtime `Q_composed` per M4'-SPEC §7.3a and UX §5.4.

**BioQuaternionState `(q_b, q_p)`** — `Body/S/S0/portal-core/src/kernel.rs:46-59`:

```rust
pub struct BioQuaternionState {
    pub q_b: [f32; 4],
    pub q_p: [f32; 4],
}
impl BioQuaternionState {
    pub fn new(q_b, q_p) -> Self { ... }  // unit_or_identity normalisation
}
```

**This corrects Wave-A row 8's claim that `(q_b, q_p)` has no substrate**: it IS landed in kernel.rs as `BioQuaternionState`, consumed by `KernelEvalState` (`kernel.rs:155, 164-170`), and read by `kernel_energy_evaluate` to compute `bimba_pratibimba_energy = quat_distance_sq(state.q_b, state.q_p)` (`kernel.rs:1095`). What is missing is the **decomposition function** `decompose_bioquaternion(Q_composed) -> (q_b, q_p)` per M4'-SPEC §7.3a — that is the genuine code-pending slot (Wave-A tranche 5.4), and what is missing is the **surfacing of `bioquaternion` on `MathemeHarmonicProfile` for the personal pole** (see §4 below).

**Day-as-episode container** — Theia surface at `Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts`:

- `NaraArtifactKind = 'journal' | 'dream' | 'oracle' | 'reminder' | 'contemplative' | 'agent-chat'` (`nara-surface.ts:14-20`)
- `NaraPrivacyClass = 'protected_local' | 'protected_local_handle_only' | 'shared_archetype_opt_in'` (`nara-surface.ts:22-25`)
- `NaraArtifactEnvelope` (`nara-surface.ts:33-49`) — full envelope with `artifactId`, `dayId`, `kind`, `nowPath`, `sessionKey`, `privacyClass`, `bodySha256`, `scalarRefs`, `graphitiEpisodeHandles`, `qActivityPolicy`
- `NaraDayContainer` (`nara-surface.ts:62-74`) — `dayId, dayPath, metadata, nowLineage, scalarRefs, graphitiEpisodeHandles, artifactCounts, artifactTree, graphitiEpisodes`
- `NaraGraphitiEpisode` (`nara-surface.ts:51-60`) — relation enum `'HAS_DAY' | 'CONTAINS_DAILY_NOTE' | 'PART_OF_DAY' | 'NEXT_IN_ARC'`
- `createNaraArtifact`, `createGraphitiEpisode`, `readNaraDayContainer`, `buildM4NaraSurface` (`nara-surface.ts:137-285`) — the operative API
- `dayContainerPath(vaultRoot, dayId) = join(vaultRoot, 'Pratibimba', 'Nara', dayId)` (`nara-surface.ts:415-417`) — **DR-M4-1 compliant**

**Graphiti substrate** — `Body/S/S3/graphiti-runtime/src/lib.rs:132` — payload literal `"privacyBoundary": "protected-local-episodic-memory"`. The four Nara relations (`:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC`) are named in the Theia envelope but **NOT yet inserted as graph edges** by `graphiti-runtime` (Wave-A CODE-PENDING row 7).

### §2.6 M4-5' Psychoid cymatic field + Epii relay gate

**Substrate consumed (all landed):**

- `kernel.rs:374` — `pub q_cosmic: [f32; 4]` on `MathemeHarmonicProfile`; computed via `codon_charge_quaternion(codon_id)` at `kernel.rs:410`
- `kernel.rs:375-376` — `resonance: Option<f32>`, `conjugate_form_character: ConjugateFormCharacter`
- `kernel.rs:486-488` — at profile-build with identity supplied: `PersonalResonance::from_quaternions(identity.q_personal, profile.q_cosmic)` → `profile.resonance = Some(score)`, `profile.conjugate_form_character = resonance.conjugate_form_character`
- `personal_identity.rs:151-175` — `PersonalResonance { signed_dot, score, conjugate_form_character }`; `from_quaternions` computes `signed_dot = q_personal · q_cosmic` (clamped), `score = |signed_dot|`, and classifies: `< -EPSILON → ShadowInversion`; `≥ 2/3 → Major`; else `Minor`
- `personal_identity.rs:9` — `PERSONAL_RESONANCE_MAJOR_THRESHOLD = 2.0/3.0` (the explicit threshold)
- `kernel.rs:46-59` — `BioQuaternionState { q_b, q_p }` (the bimba/pratibimba decomposition substrate)
- `kernel.rs:1095` — `bimba_pratibimba_energy = quat_distance_sq(state.q_b, state.q_p)`
- `kernel.rs:1039` — quaternion conjugation `[w, -x, -y, -z]` used in `q_p` derivation
- `audio_octet: [f32; 8]`, `nodal_quartet: [MathemeNodalConstraint; 4]` on `MathemeHarmonicProfile` (kernel.rs M2-1' Vimarśa-written writes — same substrate M1-2 ananda vortex extension consumes)
- `Body/S/S0/portal-core/src/hopf.rs` — Hopf bundle for `(p, q)` torus-knot trajectory rendering at personal scale (M4'-SPEC §7.3a, §7.11)

**Substrate first-build owned at M4-5'** (anti-greenfield exception — this IS the M' product surface):

- The psychoid-cymatic field **renderer** at `Body/M/epi-theia/extensions/m4-nara/src/browser/psychoid_cymatic/` — does not yet exist; first-build allowed per `m4-prime-psychoid-cymatic-field-engine.md` §§3-8 contract
- The opaque renderer handle path through S3 — never emits raw field body; emits handle + signature
- The proposal-lifecycle state machine `proposed → reviewed → accepted|rejected → applied` on the personal-pole side of the M5' review gate (`personal_identity.rs` extension per Wave-A tranche 5.9)

---

## §3 — Dataset Map

### §3.1 Canonical narrative sources

- `Idea/Bimba/Map/datasets/nara-deep/13-03-2026-claude-nara-thinking-marketing.md` — the Nara design narrative; the journal-as-living-mirror framing
- `Idea/Bimba/Map/datasets/nara-deep/nodes-full-detail.json` — full-detail Nara node payloads from the bimba map
- `Idea/Bimba/Map/datasets/nara-deep/relations.json` — Nara relations (M4 internal relations)
- `Idea/Bimba/Map/datasets/low-detail/nodes_nara.json` — low-detail Nara nodes (for navigation / coordinate-tree)
- `Idea/Bimba/Map/datasets/low-detail/relations_nara.json` — low-detail Nara relations

### §3.2 Identity-system datasets

The M4-0 layer 1-4 datasets (decanic, Jungian, Gene Keys, Human Design) **live in the M3 dataset family** because they are 64-fold codon-space addressings — Gene Keys is the M3 hexagram map indexed by activation, and Mahāmāyā Tarot is its dual. M4-0' consumes them by handle (scalar refs), not by ingesting them locally. See `Idea/Bimba/Map/datasets/mahamaya-deep/` for the canonical Gene Keys / hexagram / codon material.

The M2 dataset family (`parashakti-deep/`) provides the planetary-LUT material consumed by `personal_identity.rs::PLANET_KEPLERIAN_VELOCITY` (`personal_identity.rs:13-15`). The keplerian-velocity coefficients there mirror `M2_PLANET_LUT.keplerian_vel` in `epi-lib/include/m2.h` — **one LUT, not two** (anti-greenfield: do not duplicate the constants into a Nara-local table).

### §3.3 PASU.md — the user's natal birth data

`PASU.md` (per M4'-SPEC §7.5) is the canonical source for natal-chart input. It is **never committed to the repo and never appears in any public dataset**. The user maintains it locally; `wind.rs:117-148` reads it via Kairos / Kerykeion adapters and produces the `KerykeionResult` consumed by `PersonalIdentityProfile::from_kerykeion_json`.

### §3.4 No M4-specific World coordinate datasets

Per M4'-SPEC "Canonical Source Lock" closing paragraph: M4' consumes shared World artifact forms (`Daily-Note.md`, `NOW.md`, `Thought.md`) and shared World P/CT/L lens corpora through umbrella specs. **No M-specific World coordinate markdown exists yet.** This is anti-greenfield-correct: Nara does not fork the World vocabulary.

### §3.5 Vāma Śaktis dataset (companion-spec source)

`Idea/Bimba/Seeds/M/M4'/ql-unit-vama-shaktis-vameshvari` (referenced by M4'-SPEC §7.9) is the canonical source for the sixfold Vāma vocabulary. **Not yet a dataset under `Idea/Bimba/Map/datasets/`** — and per DR-M4-2 clause 4 it stays as a contemplative-recognition vocabulary, not a classifier dataset. The vocabulary is read into the renderer at #4.4.5 Trika lens depth, not loaded as a feature table.

---

## §4 — Profile-Bus Contract

### §4.1 What `MathemeHarmonicProfile` already exposes for M4'

`Body/S/S0/portal-core/src/kernel.rs:346-465`:

- `tick12: u8` — the 12-spanda tick (the personal-side clock is the same kernel tick as M1)
- `degree720: u16`, `degree360: u16` — Hopf total/base angles (the Hopf bundle is the (p,q) torus-knot carrier at M4-3' / §7.11)
- `position6: u8`, `helix: String`, `lens_mode: MathemeLensMode` (84-state)
- `resonance72: MathemeResonance72Projection` — the 72-name axis the M4-3' lens-routing addresses (see §7.3 boundary)
- `audio_octet: [f32; 8]` — Vimarśa-written; the personal cymatic engine consumes this for chakra-frequency drives (§5 below)
- `nodal_quartet: [MathemeNodalConstraint; 4]` — Vimarśa-written nodal stress-points; the personal psychoid-field renderer uses these as field-coherence anchors
- `q_cosmic: [f32; 4]` — codon-charge quaternion at this tick (the resonance counterparty)
- `resonance: Option<f32>` (`kernel.rs:375`) — populated when an `IdentitySupply` is present at profile-build (line 486)
- `conjugate_form_character: ConjugateFormCharacter` (`kernel.rs:376`) — Major / Minor / ShadowInversion
- `privacy_class: ProfilePrivacyClass` (`kernel.rs:377`) — `PublicCurrentContext` by default; transitions to `ProtectedLocalDerived` when identity material is mixed

### §4.2 What the profile-bus is missing — the personal-pole gaps

Four load-bearing gaps for the M4' surface:

1. **No `bioquaternion: BioQuaternionState` field on the public profile.** The substrate has it (`kernel.rs:46-59`, consumed inside `KernelEvalState`) but it is not surfaced through `MathemeHarmonicProfile`. The psychoid-field renderer at M4-5' needs `(q_b, q_p)` to render the bimba/pratibimba counter-rotating tori at the heart-chakra position (psychoid-cymatic-field-engine §7.2 "white/black 0/1 ground tori").
2. **No `q_personal: Option<[f32; 4]>` field surfaced under the protected-local class.** Today `q_personal` lives on `PersonalIdentityProfile` (`personal_identity.rs:104`) and is fed into the resonance computation at profile-build (line 486) but is not retrievable from the profile — the renderer at M4-1'/M4-5' needs it to compute its own elemental-quaternion projection (psychoid §4 colour-quaternion) without re-deriving from the natal chart.
3. **No `q_composed: Option<[f32; 4]>` field surfaced under protected-local class.** `compose_personal_quaternion` exists; the result is what drives the live cymatic field (psychoid §5.1 "the medium tuning is driven by `q_Nara`"). Without this on the profile, the renderer would either re-compose locally (unauthorised duplication) or read three handles separately and re-multiply (correctness risk).
4. **No `pattern_packet_handle: Option<String>` field surfaced under protected-local class.** When M4-3' produces a `PatternPacket`, the explain-my-resonance panel and the trajectory render need a handle to look it up. Today there is no return-channel.

### §4.3 The `personal_pole: PersonalPoleProjection` projection (proposed Tranche 10.M4)

Add `pub personal_pole: Option<PersonalPoleProjection>` to `MathemeHarmonicProfile` — `Option` because the cosmic-only public profile MUST NOT carry it; only when the profile is built with `IdentitySupply` does the field land. Following the M1-2 `AnandaVortexProjection` pattern:

```rust
/// Personal-pole projection. Present only on `ProtectedLocalDerived` profiles
/// (those built via `MathemeHarmonicProfile::from_tick_with_identity(...)`).
/// Public-current profiles MUST have `personal_pole: None` — strict invariant
/// enforced by `assert!(profile.privacy_class == PublicCurrentContext
///                       || profile.personal_pole.is_some())` at profile-build.
pub struct PersonalPoleProjection {
    /// The natal-baseline personal quaternion (Kerykeion-derived per DR-M4-2 clause 1).
    /// Lifted from `PersonalIdentityProfile.q_personal` (personal_identity.rs:104).
    /// Surfaced so the cymatic renderer never re-derives from natal data.
    pub q_personal: [f32; 4],

    /// The live composed quaternion `Q_identity · Q_transit · Q_activity`
    /// (personal_identity.rs:177-186). Drives the psychoid field's medium-tuning.
    pub q_composed: [f32; 4],

    /// The current Q_transit (somatic / astrological / temporal current at this tick).
    /// Read from M2/M4-1 sources via the activity-state effect chain.
    pub q_transit: [f32; 4],

    /// The current Q_activity (live perturbation; decays per qActivityPolicy).
    /// Read from M4-3' PatternPacket emissions (when a packet has fired in this tick window).
    pub q_activity: [f32; 4],

    /// The bimba/pratibimba decomposition reading of Q_composed.
    /// Computed via the proposed `decompose_bioquaternion(q_composed) -> (q_b, q_p)`
    /// per M4'-SPEC §7.3a — NOT independent input. Equivalent to the (q_b, q_p)
    /// substrate consumed by KernelEvalState (kernel.rs:155, 164-170).
    pub bioquaternion: BioQuaternionState,

    /// The personal resonance with the current cosmic state.
    /// signed_dot, score, conjugate_form_character per PersonalResonance
    /// (personal_identity.rs:143-175). Already computed at kernel.rs:486
    /// — this surfaces it as a typed sub-record instead of three loose fields.
    pub resonance: PersonalResonance,

    /// The elemental balance (Earth/Fire/Water/Air weights summing to 1.0)
    /// from PersonalIdentityProfile.elemental_balance (personal_identity.rs:79-99).
    /// Surfaced for the lean identity sidebar's percentage bars.
    pub elemental_balance: ElementalBalance,

    /// The most recent PatternPacket handle from M4-3', if a packet has fired
    /// in this tick's activity window. Handle-only — the packet body lives
    /// protected-local under the M4-3 engine state.
    pub pattern_packet_handle: Option<String>,

    /// The (p, q) torus-knot phase coordinates for the identity trajectory
    /// per M4'-SPEC §7.3a / §7.11. Computed via Hopf projection from
    /// q_composed onto S². Two unit floats; the renderer threads them through
    /// the breath torus / cosmic torus / villarceau bundles (psychoid §7.2).
    pub torus_knot_phase: TorusKnotPhase,

    /// The currently-active Vāma śakti recognition (internal classifier output).
    /// User-visible only on contemplative-engagement deepening per DR-M4-2 clause 4.
    /// `None` when classifier is below confidence threshold or feature off.
    pub vama_recognition: Option<VamaRecognition>,
}

pub struct TorusKnotPhase {
    pub p: f32,  // base-circle phase, [0, 2π)
    pub q: f32,  // fiber-circle phase, [0, 2π)
}

pub struct VamaRecognition {
    pub shakti_id: u8,                // 0..5 — the sixfold unit
    pub confidence: f32,              // [0, 1]
    pub presentation_policy: VamaPolicy,  // Internal-Only | UserVisibleOnRequest | UserVisible
}
```

**Anti-greenfield:** every component already exists in the substrate — `q_personal` at `personal_identity.rs:104`, `q_composed` via `compose_personal_quaternion` at `personal_identity.rs:177-186`, `BioQuaternionState` at `kernel.rs:46-59`, `PersonalResonance` at `personal_identity.rs:143-175`, `ElementalBalance` at `personal_identity.rs:77-99`. The projection is a **surfacing**, not a fabrication. The four new pieces (`q_transit` channel, `pattern_packet_handle`, `TorusKnotPhase`, `VamaRecognition`) are each a named code-pending closure with a single owner.

### §4.4 Strict-invariant: protected-local enforcement

The proposed projection MUST be guarded by:

1. Profile-build path discrimination: `MathemeHarmonicProfile::from_tick(tick)` produces `personal_pole: None`; `MathemeHarmonicProfile::from_tick_with_identity(tick, identity)` produces `personal_pole: Some(...)`.
2. Privacy-class invariant: `from_tick_with_identity` sets `privacy_class = ProtectedLocalDerived` (matches `personal_identity.rs:134` default).
3. Public-projection sanitisation: `MathemeHarmonicProfilePublicCurrent::from(profile)` (kernel.rs:276) strips `personal_pole` to `None`. The public current profile MUST NEVER carry it.
4. Gateway-contract enforcement: `Body/S/S3/gateway-contract/src/lib.rs` (see `classify_vault_path_marks_nara_protected_under_any_day` referenced via GitNexus) already classifies Nara paths as protected; the same classification gate refuses to forward any profile with `personal_pole.is_some()` across the public boundary.

---

## §5 — Visual Rendering Contract

The M4' surface has **two visual registers** and a third composite:

1. **Daily 0/1 surface (default)** — the lean Nara journal/flow editor; lean identity sidebar; resonance indicator. Renders the personal pole at low fidelity, honestly.
2. **`ide-deep` `m4-nara` surface** — the deep psychoid-cymatic field at full fidelity. The M' product surface.
3. **Integrated 4-5-0 surface (composition)** — psychoid field composed with M5 Epii canon city-scape and M0 Anuttara ground (Jiva-is-Śiva); see `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`.

This document specifies the rendering contract for each register, with the substrate it consumes named explicitly.

### §5.1 Daily 0/1 Surface — the lean register

Per M4'-SPEC §6.5 ("Lived Engagement, Not Quaternion-Dump") and UX §6.1:

| Element | Render | Source field |
|---|---|---|
| Journal/flow editor | React markdown editor with QL/MEF lens-anchor decoration | Local protected-local body; no external state |
| DAY/NOW header | `dayId` + Kairos current-tick label + coordinate breadcrumb | `profile.tick12`, `profile.lens_mode`, `dayContainer.dayId`, status-bar day-now anchor (Tranche 15.10) |
| Resonance indicator | Numeric `score` (0.00–1.00 with two decimals) + ConjugateFormCharacter glyph (Major = filled circle in elemental colour; Minor = open circle; ShadowInversion = inverted/struck-through) | `profile.personal_pole.resonance.score`, `profile.personal_pole.resonance.conjugate_form_character` |
| Lean identity sidebar | Name (display only) + four elemental-balance bars (Earth / Fire / Water / Air percentages) + layer-presence dots (M4-0-0…M4-0-4) | `profile.personal_pole.elemental_balance`; `PersonalIdentityProfile.layer_presence` (via DI handle) |
| Quick chat affordance | Anima conversational entry-point (right-edge, low-emphasis) | OmniPanel Pi Chat tab (Tranche 15.2) — surfaces the same Anima |

**Anti-quaternion-dump rule (binding):** raw quaternion components (`q.w, q.x, q.y, q.z`), `q_composed` internals, Kerykeion degree-by-degree readouts, full elemental arithmetic, raw `NaraSymbolicObservation` field-sets, and psychoid-field solver internals **MUST NEVER appear by default**. They surface only in the Explain panel, the Deep `m4-nara` surface, or M5' review evidence.

### §5.2 Explain-my-Resonance Panel (UX §6.2)

Triggered by the user clicking the resonance indicator or asking Anima "why this resonance?". Renders a structured trace:

```
source artifact (handle + kind + day_id + now_path)
→ M4 domain (which M4-* the artifact lives at)
→ MEF lens-position (L_x · P_y) and active square (e.g. L2/L2'/L3/L3')
→ supporting evidence spans (offsets into the protected-local body — span text NEVER rendered cross-process)
→ Q_activity delta (vector, decay window, provenance handle)
→ uncertainty / confidence
```

This is the **PatternPacket inspector at minimum-viable depth** — same source, less prose. The packet's body fields render only with explicit user toggle; default is the schematic chain above.

### §5.3 Deep M4-Nara Surface — the psychoid-cymatic field

This is the M' product surface owned at M4-5'. The render contract follows `m4-prime-psychoid-cymatic-field-engine.md` §§3-7 precisely.

**§5.3.1 Geometric scaffold (§7 of psychoid spec)**

- **Dipyramid + full 6+6 P/P' mapping (DR-IG-6 corrected)** — the renderer carries 2 apex poles (P5/P5'), 4 top/base vertices (P1-P4), 4 inverted-base vertices (P1'-P4') interleaved by mirror law `x + y' = 5`, and 1 central axis-point (P0/P0', not a vertex) projected through the pole-to-pole axis. The geometric scaffold is the bounding shell of the psychoid field; it must not be read as "6 vertices = 6 QL positions." Rendered as faint geometric wireframe (the bounding shell, not a frame around a figure). Vertical apex-to-apex = head-top-to-base-of-spine; equatorial half-base = arm-span / 2.
- **Vertical sushumna axis** — central thread carrying chakra assemblage points (vertebrae of a luminous spine). Position-fixed; tilts only with macro-orientation gestures.
- **Equatorial plane at heart-level** — the elemental-quaternion belt: four equatorial vertices render the four elemental colours per §5.3.4 below.
- **Polar caps** — Aether-cap at crown radiates violet-luminous when scalar-positive cap active; Mineral-cap at root radiates gold-crystalline when scalar-negative cap dominant.

**§5.3.2 Hopf-linked tori (psychoid §7.2)**

Multiple tori threaded through the bipyramid; ALL share the vertical sushumna as central fibre (Hopf-link topology explicit):

| Torus | Size / cadence | Animation primitive | Substrate field |
|---|---|---|---|
| **Breath torus** | Large, slow | `scale.set(R, 1, R)` radial pulsing at ~6 cycles/min, modulated by `tick12` | Kernel tick (not a local breath clock) |
| **Chakral aura torus** | Medium | Brightness sustained by chakra activation density | Per-chakra cymatic-pattern intensity (§5.3.3) |
| **Cosmic torus** | Small, fast | Rotates per `degree720` advance | `profile.degree720` (every tick = 60°) |
| **Central white/black 0/1 ground tori** | Heart-level | Counter-rotating; pulse inversely to breath torus | `profile.personal_pole.bioquaternion.q_b` (white, ascent helix) and `profile.personal_pole.bioquaternion.q_p` (black, descent helix) |
| **Villarceau bundles** | Axial, fine | Chirality-coupled spin per `profile.position6` | Inside each pyramid half; chirality from `cl42_signature` (M1-2 boundary) |

**§5.3.3 Chakras as cymatic assemblage points (psychoid §5.3)**

Each chakra is a cymatic standing-wave pattern computed in real-time:

- **Fundamental frequency** = Cousto-Hz of currently-active ruling planet at that chakra, from `M2_PLANET_LUT` (consumed via M2-1' Vimarśa write, NOT re-derived from `m2.h`)
- **Coherence parameter** = `|profile.personal_pole.resonance.signed_dot|` modulated by Human Design BodyGraph defined-vs-undefined status at this chakra (if M4-0-4 layer present — else 1.0)
- **Medium tuning** = `profile.personal_pole.q_personal` projected at the chakra-local axis (two users at the same chakra-frequency render different patterns because their psychoid medium tunes differently)
- **Inter-chakra interference** — phase relationships across chakras compute the multi-chakra coherence-state: clean harmonic intervals across chakras → aligned multi-region patterns; dissonant relationships → visible interference scintillation

**Substrate the chakra-pattern reads:**
- `profile.audio_octet[8]` — the eight Vimarśa-written chakra frequencies (M2 boundary, §7.1)
- `profile.nodal_quartet[4]` — nodal stress points (the four field-coherence anchors)
- `profile.personal_pole.q_personal` — the medium-tuning quaternion
- `profile.personal_pole.resonance.signed_dot` — the coherence parameter

The chakra is NOT a fixed labelled point — it is the cymatic-pattern-at-its-frequency-in-q_personal-tuned-medium. The renderer composes the eight chakra patterns via additive frequency mixing in a fragment shader; the medium-tuning enters as anisotropic response coefficients in the wave equation.

**§5.3.4 Colour-quaternion (psychoid §4)**

The `Q_composed = q_identity · q_transit · q_activity` projects directly into the Cl(4,2) elemental colour basis without translation layers — the quaternion's axis basis IS the colour basis:

| Element | Component of q_composed | Colour register |
|---|---|---|
| Earth | `w` (scalar) | ochre / brown / sienna (grounding, weighted, stable) |
| Water | `x` (i-axis) | deep blue / aqua / oceanic |
| Air | `y` (j-axis) | clear / pale silver / pale yellow |
| Fire | `z` (k-axis) | red / orange / gold |
| Aether (P0 cap) | scalar-positive cap | violet / luminous-transparent |
| Mineral (P5 cap) | scalar-negative cap | gold-crystalline |

Projection scopes (psychoid §4.1): global field tint (dominant element); per-chakra colour (locally-dominant element modulated by `q_transit` at that chakra); particle colours in toroidal currents (local field-region projection); equatorial belt vertices (four elemental basis colours); polar caps as above.

**Axis order (DR-M4-2 clause 2 — pending):** §7.13 open. This document tracks `[w=Earth, x=Water, y=Air, z=Fire]` per the activity-graph remap (the operative law since `m4-prime-nara-activity-graphiti-instrument` locked `[F,W,E,A] → [w=E, x=F, y=W, z=A]` and the colour-quaternion table above), with the open canon question DR-M4-2 clause 2 flagged for kernel-level lock.

**§5.3.5 Mahāmāya lens-stack as backdrop (psychoid §6)**

The 16+1 M3-5 lenses render as concentric annular bands OUTSIDE the dipyramid bounding shell, as frequency-filter holographic backdrop. Default composition (3-5 lenses visible):

- **Always-on:** Lens 7 (15° × 24 hour-gates) at moderate opacity
- **Contextually-on:** Lens 5 (decan) during oracle work; Lens 9 (zodiacal) during transit work; Lens 16 (Fibonacci/Pisano 6° × 60) during contemplative-growth work — rendered with golden-spiral marks rather than equal partition
- **Conjugate-pair counter-rotation:** Lens N and Lens N+8 (the 8 mirror-reciprocals) render as counter-rotating partners — the double-cover SU(2) topology visible as paired rotational bands

The lens-stack substrate IS owned by M3 (`M3-ARCHITECTURE`); the personal-field renderer consumes it through a `profile.m3_lens_stack` projection — never re-derives from `m3.h` constants.

**§5.3.6 Vāma śakti contemplative glyph layer (psychoid §8)**

When `profile.personal_pole.vama_recognition` is `Some(VamaRecognition { presentation_policy: UserVisible, .. })`, a subtle glyph or colour-shift surfaces in the field at the corresponding chakra-position. The glyph is small, peripheral, and contemplative — never a verdict overlay. Per DR-M4-2 clause 4, the classifier runs internally regardless; presentation surfaces only on contemplative-engagement deepening (user-invoked or explicit Nara/Anima offering).

### §5.4 Render-honesty rules (binding)

1. **High resonance is beautiful-symmetric BECAUSE high resonance IS beautiful-symmetric in cymatic physics** — the renderer does not flatter; it shows. Low resonance scintillates because dissonant frequencies produce scintillation in standing-wave media.
2. **The field is non-comparable across users** — psychoid signature is genuinely individual at the layer where individuation lives. The field is unshareable in principle (no shared-archetype publication except handle-only opt-in). The gateway-contract enforces this at `Body/S/S3/gateway-contract/src/lib.rs`.
3. **Body-topological without body-figurative** — no anatomical model; no avatar; no drawn outline; the "body" IS what the field-structure IS, not a graphic of one. Reference register: Hans Jenny cymatic photographs, Ryoji Ikeda mathematical-field installations, dynamic geometric mandala. Aesthetic ancestor: cymatic photography + mathematical-field + dynamic mandala — NOT iconographic-figurative.
4. **Audio always running** (psychoid §5.2) — audio computation is always live; audio playback is the deliberate-engagement layer (user opts in). The visual is literally derived from the audio's standing-wave response when playback is on; when playback is off the same audio computation drives the visual. No on/off compute path.

---

## §6 — Tick Choreography

### §6.1 The personal-side animation primitives

Unlike M1-2 where a single primitive (`quat_slerp` of K² orientation) carries the tick, the personal-pole render layers depend on **three coupled primitives**, each honest to a different substrate:

| Primitive | What it carries | Substrate field | Cadence |
|---|---|---|---|
| **`quat_slerp(q_composed_prev, q_composed_next, dt/TICK_PERIOD)`** | The whole personal field's orientation across the tick boundary | `profile.personal_pole.q_composed` | Every frame; tick-quantised key |
| **`cymatic_step(audio_octet, nodal_quartet, q_personal, t)`** | The chakra standing-wave field's evolution | `profile.audio_octet`, `profile.nodal_quartet`, `profile.personal_pole.q_personal` | Every frame (audio is always-running per §5.4) |
| **`hopf_project(torus_knot_phase)`** | The `(p, q)` identity trajectory's projection to S² | `profile.personal_pole.torus_knot_phase` | Tick-quantised (one S² point per tick, interpolated for render) |

The three primitives compose via shared state: `quat_slerp` advances `q_composed`; `cymatic_step` reads the latest `q_composed` for its medium-tuning; `hopf_project` reads `q_composed` for its base-space projection.

### §6.2 What changes simultaneously on tick advance (M4-5' deep surface)

| Surface element | Change | Source field |
|---|---|---|
| Dipyramid orientation | Slerps along `q_composed` trajectory | `profile.personal_pole.q_composed` |
| Sushumna axis tilt | Stable (only re-orients with macro user gesture); kernel tick does NOT move it | — (still-point per §6.4) |
| Chakra cymatic patterns | Standing-wave fields evolve per `cymatic_step` | `profile.audio_octet`, `profile.personal_pole.q_personal` |
| Inter-chakra interference | Recomputes coherence per inter-chakra phase relations | `profile.audio_octet[i]` pair products |
| Field colour | Re-projects `q_composed` into the elemental colour basis | `profile.personal_pole.q_composed` (axis order per DR-M4-2 c2) |
| Resonance indicator (daily side too) | Recomputes `score` + `conjugate_form_character` glyph | `profile.personal_pole.resonance` |
| Breath torus | Pulses per kernel tick (~6 cycles/min coupled to tick12) | `profile.tick12` (rate divider in renderer) |
| Cosmic torus | Rotates 60° per tick (one full revolution per 12 ticks → 720° per 24 ticks for the double-cover) | `profile.degree720` |
| Central 0/1 ground tori | Counter-rotate; bimba-pole driven by `q_b`, pratibimba-pole by `q_p` | `profile.personal_pole.bioquaternion.{q_b,q_p}` |
| Lens-stack rings | Rotate per their divisor cadence | M3-5 boundary (`profile.m3_lens_stack`) |
| Vāma śakti glyph (if active) | Cross-fades on recognition transitions | `profile.personal_pole.vama_recognition` |
| Audio output (if playback on) | Recomputes chakra-frequency mix | `profile.audio_octet[0..8]` |

### §6.3 What changes on profile-bus events (not every tick)

| Event | Trigger | Render effect |
|---|---|---|
| `klein_flip = true` | M1-2 boundary at tick 5↔6 (mirror at M4-5' is the bimba/pratibimba flip in `(q_b, q_p)`) | The two central 0/1 ground tori briefly interpenetrate at heart-level; field colour shifts toward complement; the dipyramid's apex-pair exchanges identity (white↔black at #5/#5') |
| New `pattern_packet_handle` | M4-3' fires a PatternPacket on activity input | Soft halo at the active-square's lens-position; pattern_packet handle becomes addressable from explain-my-resonance |
| New `q_activity` decay-event | qActivityPolicy decay window expires | Activity contribution fades to zero in `q_composed`; field returns to `Q_identity · Q_transit` baseline |
| Identity-augment proposal landed (`accepted → applied`) | M5' review verdict | Brief whole-field bloom in the cap-element colour (Aether-violet for canonising upward; Mineral-gold for crystallising downward); `Q_identity` updates atomically; cymatic field re-tunes |
| Day-rollover | New `dayId` (midnight in user's local timezone or first artifact of next calendar day per `m4-prime-nara-day-episodes` §1.2) | Day-close: brief fade-to-baseline; Day-open: kairos_at_day_start snapshot taken; DayContainer episode auto-created via `createNaraArtifact` path |

### §6.4 What stays still on tick advance

- **Vertical sushumna axis** — the gravity-and-spine of the field; moves only with macro user gesture, never per tick. The matheme's still-point at personal scale.
- **Dipyramid bounding shell** — only orientation rotates (via `q_composed` slerp); the shell never deforms.
- **Mahāmāya lens-stack outer bounds** — only the ring rotations advance; the lens-stack as a whole stays centred on the field.
- **Status-bar elements** — day-now anchor, session id, profile generation (consume from status-bar state thread per Tranche 15.10; never per-tick re-render at the widget level).

### §6.5 Where the eye goes per tick

- **Default focus:** the central chakra-region cymatic pattern (heart-chakra, where the 0/1 ground tori counter-rotate). The peripheral fovea catches Vāma glyphs only when recognition transitions are active.
- **Peripheral motion:** the colour-quaternion projection across the whole field (the field-as-a-whole tints toward the dominant element); the breath torus's slow radial pulse; the lens-stack's outer rotational bands.
- **Foveated highlight on PatternPacket emissions:** when `pattern_packet_handle` arrives, the corresponding lens-position halo brightens softly — the eye is drawn to the just-formed pattern, but only briefly (decays over ~2 seconds).

### §6.6 Boundary-quantised events (Klein-flip at personal scale)

At a `klein_flip = true` event on the profile bus (M1-2 substrate boundary, but consumed at the personal pole as the bimba/pratibimba inversion of `(q_b, q_p)`):

- The two central 0/1 ground tori briefly interpenetrate at heart-level (~200ms); chromatic-axis and fifths-axis circles visibly cross.
- The colour-quaternion's hemisphere flips — the field colour shifts toward complement (Earth→Air, Water→Fire, or per axis order).
- The dipyramid's apex-pair #5/#5' exchanges identity (white-luminous ↔ gold-crystalline visibly swap).
- The chakra cymatic patterns re-tune through their conjugate frequencies (one octave step on chakra Hz LUT mirrored — the Vimarśa octave-lift at the personal register).

This is the same boundary M1-2 fires; M4-5' subscribes and re-tunes — never re-derives.

---

## §7 — Boundary Contracts

### §7.1 M4 ↔ M2 — the Vimarśa-window contract at the personal register

Per `m4-prime-psychoid-cymatic-field-engine.md` §5 and DR-M4-2 clause 3 (Vāma classifier policy was clause 4, polarity clause 5; cymatic-substrate-consumption is the universal contract):

- The cymatic engine at M4-5' is the **M2' cymatic engine applied at the personal-Pratibimba register**. We do NOT invent new cymatic infrastructure.
- The renderer reads `profile.audio_octet[8]` (Vimarśa-written) and `profile.nodal_quartet[4]` (Vimarśa-written) — never invokes a synthesiser locally, never indexes `m2.h` LUTs locally for chakra-frequency derivation, never recomputes interval law.
- The chakra-frequency stack is **windows onto M2-5 planetary-chakral writes** — owned by M2', consumed at M4'. When M2-5 writes update (new planetary hour, new decan), the cymatic patterns re-tune at the next tick boundary.

**This is the central M4↔M2 contract.** It mirrors the M1↔M2 contract: M2 reads the matheme cloud through the 9-squares structure and writes the audio bus; M1's played-torus and M4's psychoid-cymatic field BOTH consume that bus. The personal cymatic field is the same engine running at the personal register.

### §7.2 M4 ↔ M1 — the Cl(4,2) algebra at four scales

Per M4'-SPEC §7.4 and CYCLE-3 invariant ("Cl(4,2) runs at four scales (M1 ring · M3 codon · M4 personal · Kerykeion natal)"):

- The `quat_normalize / quat_mul / quat_slerp` functions at `Body/S/S0/portal-core/src/quaternion.rs` are **shared across all four scales** — `personal_identity.rs::compose_personal_quaternion` (M4 personal scale) and the M1 ring quaternion path use the same functions.
- `BioQuaternionState` (`kernel.rs:46-59`) is the same `(q_b, q_p)` pair consumed at M1-5 (Hopf-bundle bimba/pratibimba) and at M4-5' (psychoid-field bimba/pratibimba) — one substrate, two readers.
- The M1-2 Klein-flip event (`profile.klein_flip` or computed from `tick12 ∈ {5,11}`) propagates to M4-5' as the colour-quaternion hemisphere flip; the dipyramid apex-pair exchange.

**One algebra, four scales** — kernel-bridge audit owns the proof (Wave-B kernel-bridge tranche). M4-ARCHITECTURE consumes the algebra; never re-implements.

### §7.3 M4 ↔ M3 — the codon-quaternion as resonance counterparty

Per M4'-SPEC §7.3 and UX §13.3:

- `q_cosmic` (`kernel.rs:374, 410`) is the codon-charge quaternion at this tick — the M3 codon evaluates to a quaternion in the same Cl(4,2) algebra via `codon_charge_quaternion(codon_id)`. M3-ARCHITECTURE owns its derivation.
- The resonance metric `score = |q_personal · q_cosmic|` (`personal_identity.rs:155-161`) makes the personal-cosmic alignment a real number at every tick.
- The M3 lens-stack (M3_LENS_STACK 16+1 apertures) is consumed as the holographic backdrop of the psychoid field (§5.3.5) — never re-derived. M3-ARCHITECTURE / M3-5 owns the stack; M4-5' consumes a `profile.m3_lens_stack` projection.

**Mahāmāya namespace split (UX §3.5):** M2_MEF_LENS (12-lens chromatic addressing in 72-fold field) is read by M4-3' for cross-dialect routing; M3_LENS_STACK (16+1 static + growth apertures) is consumed by M4-5' for the lens-backdrop; M4 PatternPacket lens-position is the QL/MEF route by which Nara integrates the packet. These three lens vocabularies do NOT collapse — each names a different reading aperture.

### §7.4 M4 ↔ M5 — the review/promotion gate and the 4-5-0 seam

Per M4'-SPEC §6.7, UX §7, and `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`:

- **Promotion is one-way and governed.** Activity may perturb live state immediately through decayed `Q_activity`; it becomes identity ONLY through M4-5'/M5' review with explicit lifecycle `proposed → reviewed → accepted|rejected → applied`.
- **The `pratibimba` graph namespace is the data seam.** Epii (M5) reaches into Nara's protected field ONLY through `pratibimba` namespace handles — coordinate handles, lens/mode suggestions, abstracted symbolic observations, user-approved excerpts, review envelopes. NEVER raw private content by default.
- **Aletheia (S4-5p) is the carrier that retrieves canon** for any teaching response — M4-3' surfaces a teaching-threshold flag in the PatternPacket; M4.5 decides whether the threshold becomes a teaching-event; Aletheia retrieves the corpus via L4 (topic) / L4' (corpus-source) apertures; the teaching response arrives back through Anima as conversational mediation. M4-ARCHITECTURE does NOT call the corpus flat — it surfaces *through the map*.

**The promotion law is, read at seam-scale, simultaneously the individuation cycle, the pedagogical cycle, and the Logos cycle** (UX §13.5). M4-5' is the gate that keeps the loop both safe (no activity hardens into identity or pollutes canon without review) and educational (the map opens only when teaching serves the live process).

### §7.5 M4 ↔ M0 — Anuttara ground / Jiva-is-Śiva recognition

Per psychoid §2.3 ("Epii city-scape backdrop, Jiva-is-Śiva recognition") and UX §13.1:

- M0 holds the **canonical playable bimba field** — the same Śiva at canonical-architectural scale. M4-5' holds the **personal-cymatic field** — the same Śiva at psychoid-individual scale.
- The integrated 4-5-0 surface (`ide-deep` full-depth view per psychoid §2.3) composes M4-5's psychoid field in the foreground and M0's canonical city-scape (Sabbioneta-style geometric grid representing the M0-M5 graph as architectural canon) behind it.
- The visual co-presence IS the contemplative invitation: "I am that — at every scale" — *jīva eva śivaḥ*, the structural-philosophical punchline of M4.5.

This is rendered, not asserted — the dipyramid+tori in front, the city-scape grid behind, with the lens-stack threading both at the boundary.

### §7.6 Composition over juxtaposition — integrated 4-5-0 plugin

Per Tranche 15.4 and `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`: the integrated 4-5-0 surface is **one composed surface**, NOT three side-by-side widgets:

- Nara journal at LEFT composition slot (the lived register — flow editor + DAY/NOW header)
- Personal cymatic field (Hopf-linked tori at personal scale, M4 psychoid renderer) at CENTER
- Mahāmāya recognition layer (M3 codon at personal scale via Q_composed × q_cosmic resonance) at RIGHT composition slot

The composition is geometric: the Mahāmāya codon-wheel at right shares its lens-stack rings with the cymatic field's backdrop; the personal-pole rendering tints both panels via the same `Q_composed` colour projection. The Nara journal at left is the linguistic register; the cymatic field at centre is the field register; the M3 wheel at right is the codon register. **Three readings of the same Q_composed.**

### §7.7 Anti-overlap with adjacent M's

- **M1 owns the K² played-torus and the ring-quaternion** — M4 NEVER renders K² at the cosmic scale. M4-5' renders the Hopf-linked tori at the PERSONAL scale (heart-bounded), not the cosmic K². The two are distinct manifestations of the same Cl(4,2) algebra.
- **M2 owns the cymatic engine** — M4-5' is the engine applied at the personal register; it does NOT fork the engine. New cymatic features land in M2.
- **M3 owns the lens-stack and the codon-quaternion** — M4-5' consumes both as backdrop / counterparty; never re-derives.
- **M5 owns the review gate, the canon, and the Pi/Anima dispatcher** — M4 never bypasses the review gate to promote activity to identity; never calls the corpus directly (always through Aletheia surfaced via Anima).
- **M0 owns the bimba ground and the integrated-bimba surface** — M4 consumes the M0 city-scape as backdrop in the 4-5-0 integrated surface; never holds the canon authority.

---

## §8 — IDE Integration (Theia / `m4-nara`)

### §8.1 Extension placement

- **Existing extension:** `Body/M/epi-theia/extensions/m4-nara/` (contract version `2026-06-01.07-T7`) — current scope: protected Nara DayContainer + Graphiti browser; handles-only deep links; explicit consent/privacy gates. Per `nara-surface.ts:12` the contract version is binding.
- **Existing surface files:**
  - `src/common/index.ts` — extension id + privacy class constants
  - `src/common/nara-surface.ts` (551 LOC) — the operative API
  - `src/browser/frontend-module.ts` — Theia DI bindings
  - `style/` — CSS
- **First-build extension subdirectory:** `src/browser/psychoid_cymatic/` — the renderer module owned at M4-5' (Bevy/wgpu or Three.js/WebGPU; DR for renderer choice pending). NOT yet built.

### §8.2 Surface placement in the IDE (per Tranche 15)

| Layout slot | What renders | Substrate |
|---|---|---|
| **Personal-side of `daily-0-1`** (4-5-0 integrated composition) | Nara journal at LEFT; personal cymatic field at CENTER; Mahāmāya recognition layer at RIGHT (per §7.6) | This document §5.1 + §7.6 |
| **`ide-deep` `m4-nara` view** | Editor-area widget: the FULL psychoid-cymatic field; bottom-pane: PatternPackets list, Graphiti trajectory inspector, oracle inspectors, Mahāmāya transcription-chain inspector, dream/journal recurrence | This document §5.3 + UX §6.3 |
| **Left sidebar (activity-bar)** on personal layout | Day Calendar (Empty/Present nav) · Journal Entries · Personal Coordinate (Q_personal current state) | Tranche 15.3 |
| **Right sidebar (OmniPanel)** | Pi Chat (Anima conversational entry); Sessions; Dispatch Trace; Tool Stream; Evidence; Review (M4.5 verdicts surface here); Gateway; Diagnostics | Tranche 15.2 |
| **Status bar** | Day-now anchor (`Idea/Empty/Present/{day_id}/` per DR-M4-1); session id; profile generation; resonance score (read-only) | Tranche 15.10 |

### §8.3 Profile-tick clock — global consumption

The `m4-nara` extension subscribes to the kernel-bridge profile-tick event (Tranche 15.6). Every tick advance is a render-frame trigger for:
- The resonance indicator (daily side)
- The cymatic field (deep side)
- The Mahāmāya wheel composition (4-5-0 side)

NO local clock. NO animation-frame-count fallback. NO Date.now() polling.

### §8.4 Provenance inline rendering (Tranche 15.6)

When `profile.personal_pole` is missing or pending (pre-Tranche-10.M4):

- The cymatic field renders the geometric scaffold (dipyramid + faint sushumna) but the chakra patterns are blocked-overlay
- The kernel-bridge readiness reason renders inline ("pending: profile.personal_pole — proposal lifecycle adapter not yet wired")
- The resonance indicator displays "pending-resonance" badge instead of a score
- NO silent degradation; NO fabricated resonance values

When `profile.audio_octet` is pending (M2-1' Vimarśa write not yet wired): the cymatic patterns are blocked-overlay; the rest of the field renders with the medium-tuning frozen at `q_personal` baseline.

### §8.5 Bimba/Pratibimba state persistence (Tranche 15.7)

The `m4-nara` surface state survives the `daily-0-1 ↔ ide-deep` toggle and the `cosmic-0 ↔ personal-1` flip per `BimbaPratibimbaUiState`:

- Active `dayId` and `nowPath` (the day-now anchor)
- Active `sessionKey`
- Active artifact selection (if any)
- Active explain-panel state (if open)
- Active oracle inspector state (if any)
- Active `Q_composed` reading (does NOT re-trigger a Kerykeion compute on layout toggle)

### §8.6 Accessibility — pause / scrub / reduce-motion

- **Pause:** halts the kernel-tick subscription's render side (the kernel keeps advancing; render freezes). Useful for slow inspection of a cymatic pattern.
- **Scrub-to-tick:** replays the deterministic state at a target `(tick12, degree720, lens_mode)`. Combined with a target `q_composed` from the trajectory log, the field re-renders at any historical state.
- **Reduce-motion:** the cymatic field renders the standing-wave patterns as STILL images (no per-frame interference evolution); the breath/cosmic tori freeze; the lens-stack stops rotating; the resonance indicator updates per tick but without crossfade.
- **High-contrast mode:** the elemental colour projection switches to a high-contrast palette (no aesthetic dilution; saturation increased; outline strokes added to the dipyramid and the equatorial belt).

### §8.7 Privacy / gateway-contract enforcement

Per Wave-A row 11 and `Body/S/S3/gateway-contract/src/lib.rs:classify_vault_path_marks_nara_protected_under_any_day`:

- All M4 paths under `Idea/Empty/Present/{day_id}/Pratibimba/Nara/{day_id}/` classify as protected-local
- `buildS2CanonicalProjection` (`nara-surface.ts:287-295`) emits handles only (`protectedBodiesIncluded: false`)
- `buildPublicProfilePayload` (`nara-surface.ts:297-305`) emits empty `bodyFields: []`
- `buildSpaceTimeRows` (`nara-surface.ts:307-320`) emits `body_included: false`
- Observability event always carries `protectedBodiesRendered: false` (`nara-surface.ts:280`)

These five guards together enforce the §10.7 UX rule and M4'-SPEC §7.6 privacy class. No M4-3' PatternPacket body, no Q_composed value, no q_personal component crosses to S2 / public-current / SpaceTimeDB without explicit governed review.

---

## §9 — Anti-Greenfield Audit

### §9.1 Landed in code (consume / extend, do not re-invent)

| Asset | Location |
|---|---|
| `M4_Identity_Matrix` + six-layer structs (numerological / astrological / Jungian / Gene Keys / Human Design / quintessence) | `Body/S/S0/epi-lib/include/m4.h:90-228` |
| Static-asserted layer byte sizes | `m4.h:99, 115, 134, 153, 168` |
| `m4_identity_hash_compute`, `m4_identity_augment` | `m4.h:242-248` |
| `M4_Temporal_Now`, `m4_snapshot_now` | `m4.h:258-276` |
| Oracle primitives (Sacred_Random, IChing_Cast, Tarot_Draw, Oracle_Draw, Canonical_Tag) | `m4.h:285-339` |
| Medicine triage + transform state + elemental balance + chakra state + sympathetic medicine + alchemical ops | `m4.h:346-440+` |
| Divination vtable + magic-number type safety | `m4.h:389-412` |
| `PersonalIdentityProfile` + `q_personal` + `elemental_balance` + Kerykeion path | `Body/S/S0/portal-core/src/personal_identity.rs:101-141` |
| `PersonalResonance::from_quaternions` + Major/Minor/ShadowInversion classifier | `personal_identity.rs:143-175` |
| `compose_personal_quaternion` (Q_identity · Q_transit · Q_activity) | `personal_identity.rs:177-186` |
| `BioQuaternionState { q_b, q_p }` + KernelEvalState consumption | `Body/S/S0/portal-core/src/kernel.rs:46-59, 155, 164-170, 1095` |
| `MathemeHarmonicProfile.q_cosmic / .resonance / .conjugate_form_character / .privacy_class` | `kernel.rs:374-377, 486-488` |
| `codon_charge_quaternion(codon_id)` | `kernel.rs:410` |
| `ConjugateFormCharacter` enum | `kernel.rs:494+` |
| `MathemeResonance72Projection` (the 72-axis read by M4-3') | `kernel.rs:366` |
| `audio_octet[8]`, `nodal_quartet[4]` (Vimarśa-written cymatic substrate) | `kernel.rs` (within MathemeHarmonicProfile) |
| Hopf bundle (the (p,q) torus-knot projection) | `Body/S/S0/portal-core/src/hopf.rs` |
| Cl(4,2) quaternion algebra (shared across four scales) | `Body/S/S0/portal-core/src/quaternion.rs` (119 LOC) |
| Nara journal parser + symbolic observation + parsed activity | `Body/S/S0/portal-core/src/nara_journal.rs:48-185+` |
| Kerykeion natal + current via Kairos adapter | `Body/S/S0/epi-cli/src/nara/wind.rs:55-228` |
| Graphiti protected-local-episodic-memory privacy boundary | `Body/S/S3/graphiti-runtime/src/lib.rs:132` |
| Theia `m4-nara` extension scaffold | `Body/M/epi-theia/extensions/m4-nara/` |
| `NaraDayContainer` + `NaraArtifactEnvelope` + DR-M4-1-compliant vault path | `nara-surface.ts:42-74, 415-417` |
| `createNaraArtifact / createGraphitiEpisode / readNaraDayContainer / buildM4NaraSurface` | `nara-surface.ts:137-285` |
| Gateway-contract Nara path classifier | `Body/S/S3/gateway-contract/src/lib.rs:classify_vault_path_marks_nara_protected_under_any_day` |
| Nara-deep dataset (narrative + nodes + relations) | `Idea/Bimba/Map/datasets/nara-deep/`, `Idea/Bimba/Map/datasets/low-detail/nodes_nara.json`, `relations_nara.json` |

### §9.2 Pending (cycle-3 deliverables — code-pending closures, NOT greenfield rebuilds)

- **Tranche 10.M4 — `personal_pole: Option<PersonalPoleProjection>` surfaced on `MathemeHarmonicProfile`** (§4.3). All substrate exists; this is a typed surfacing.
- **Tranche 10.M4-b — `decompose_bioquaternion(q_composed) -> (q_b, q_p)`** on `personal_identity.rs` per M4'-SPEC §7.3a (Wave-A tranche 5.4). Extends existing `compose_personal_quaternion` + `BioQuaternionState`.
- **Tranche 06.M4-a — Graphiti runtime Nara relations insertion** (`:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC` as actual graph edges, not just Theia envelope) on `graphiti-runtime/src/lib.rs` (Wave-A tranche 5.3, CODE-PENDING row 7).
- **Tranche 06.M4-b — M4-0 birthdate encoding + remaining identity layers (Jungian / Gene Keys / Human Design)** on `personal_identity.rs` per `nara-m4-0-0-birthdate-encoding-spec.md` (Wave-A tranche 5.6). C-side structs exist (`m4.h`); Rust-side computation missing.
- **Tranche 06.M4-c — M4-3' PatternPacket substrate** — the `PatternPacket` struct + `LensPositionRouter`, `DialectResonanceMapper`, `MahamayaTranscriptionPacketIngestor`, `ContradictionDetector`, `BodyEvidenceCorrelator`, `DreamJournalRecurrenceTracker`, `TrajectoryBuilder`, `QActivityDeltaBuilder`, `TeachingThresholdDetector`, `ReviewProposalBuilder` services per UX §12.2 (Wave-A DOC-AHEAD row 8/15).
- **Tranche 06.M4-d — Period-reading trajectory reconstruction** on `nara_journal.rs::period_reading(day_range)` per M4'-SPEC §7.8 (Wave-A tranche 5.8).
- **Tranche 06.M4-e — Identity-augment proposal lifecycle adapter** (`proposed → reviewed → accepted|rejected → applied`) on `personal_identity.rs` consuming the M5' review-core verdict path (Wave-A tranche 5.9).
- **Tranche 06.M4-f — Connectivity-vs-bounded-access discriminator test** on `gateway` + `m4-nara` extension readiness logic per M4'-SPEC §8 (Wave-A tranche 5.10).
- **Tranche 15.M4 — Psychoid-cymatic field renderer first-build** at `Body/M/epi-theia/extensions/m4-nara/src/browser/psychoid_cymatic/` per psychoid spec §§3-8 (the M' product surface owned at M4-5'). Option-F (full physics) vs Option-S (stylised cymatic-inspired) decision per M4'-SPEC §7.7.

### §9.3 Net-new (M' product surface — anti-greenfield exceptions)

These three are first-build allowed because they ARE the M' product surface owned at M4', and no substrate carries them:

- **Psychoid-cymatic field renderer** at M4-5' — claimed by `m4-prime-psychoid-cymatic-field-engine.md` §§3-8; no substrate geometry exists; renderer-side choreography.
- **PatternPacket explainer panel** at M4-3' — claimed by UX §6.2; structured trace renderer at the Theia surface.
- **4-5-0 integrated composition surface** — the Jiva-is-Śiva recognition surface per UX §13 + psychoid §2.3; the composition is the M' product. (See `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md` for full ownership.)

### §9.4 Forbidden (do not invent)

- **Local pitch synthesis** — M4-5' MUST consume `profile.audio_octet[8]` (Vimarśa-written); never invoke a synthesiser; never index `m2.h` LUTs for chakra-frequency derivation.
- **Local clock** — M4-5' MUST consume the kernel-tick profile-advance event; never animation-frame-count; never Date.now() polling.
- **Local LUT forks** — `M2_PLANET_LUT` constants, `PERSONAL_RESONANCE_MAJOR_THRESHOLD = 2.0/3.0`, ConjugateFormCharacter classification rules: all consumed from `personal_identity.rs:9, 11-15, 162-168`. NEVER duplicated frontend-side.
- **Local graph relation inference** — Graphiti `:HAS_DAY`/`:NEXT_IN_ARC` edges MUST come through S3 graphiti-runtime; the Theia extension's envelope is for handle bookkeeping, not graph authority.
- **Composition by juxtaposition** — the 4-5-0 surface composes three poles geometrically (psychoid field + canon city-scape + journal/recognition layer); NOT three side-by-side widgets.
- **Cosmic-scale K² rendering** — M1 owns K² at the cosmic scale. M4-5' renders Hopf-linked tori at the PERSONAL scale (heart-bounded, dipyramid-contained), not cosmic K².
- **Direct corpus calls** — M4 NEVER calls the Aletheia corpus flat; teaching responses always route through Anima dispatch with Aletheia retrieval.
- **Activity-to-identity collapse** — Q_activity perturbs `Q_composed` but NEVER `Q_identity`. Only `accepted → applied` review verdicts mutate identity, atomically and with full provenance.
- **Per-user shareable fields** — psychoid signatures are non-comparable across users (psychoid §1); no shared-archetype publication except handle-only opt-in.
- **Raw private content rendering in OmniPanel** — Pi Chat, Sessions, Dispatch Trace, Tool Stream, Evidence, Review tabs receive handles, not bodies. Bodies render only inline in the journal editor (the user's own protected-local context) and explicitly-toggled in Explain panel.

---

## §10 — Test Criteria

The M4' architecture is acceptance-ready when:

1. **Substrate-citation audit:** every §2 file:line citation resolves (`grep` returns the symbol at the named line). `pnpm -C Body/M/epi-theia/extensions/m4-nara build` succeeds.
2. **Profile-bus contract test:** `cargo test -p portal-core personal_pole_projection_present_only_with_identity` — confirms `MathemeHarmonicProfile::from_tick(t).personal_pole.is_none()`; `MathemeHarmonicProfile::from_tick_with_identity(t, identity).personal_pole.is_some()`; `profile.public_current().personal_pole.is_none()`.
3. **Bioquaternion decomposition test:** `cargo test -p portal-core personal_identity::bioquaternion_decomposition` — confirms `decompose_bioquaternion(compose_personal_quaternion(qi, qt, qa))` is deterministic; `(q_b, q_p)` is a reading of `Q_composed`, NOT independent input; `BioQuaternionState::new(q_b, q_p)` round-trips through the kernel-eval state.
4. **DR-M4-1 vault-path test:** `grep -n "Pratibimba.*Nara.*dayId\\|join.*Pratibimba.*Nara" Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts` returns line 416. Round-trip `createNaraArtifact` → `readNaraDayContainer` against `${vaultRoot}/Pratibimba/Nara/{day_id}/` passes.
5. **Graphiti Nara-relations insertion test:** `cargo test -p graphiti-runtime nara_relations` — confirms `:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC` write paths at the S3 graph-edge level (not just envelope-side); `grep -rn "HAS_DAY\\|NEXT_IN_ARC" Body/S/S3/graphiti-runtime/src/` returns the new relation symbols.
6. **M4-0 birthdate encoding test:** `cargo test -p portal-core m4_0_0_birthdate_encoding` — confirms raw totals / mod6 / inverse / mod12 / MEF refraction / lens-square / L2' elemental extraction / caps / evidence paths preserved (no Pythagorean root reduction). Absence-test confirms Jungian / Gene Keys / Human Design layer outputs return `pending` when not supplied (no fabrication).
7. **Resonance rendering test:** `pnpm -C Body/M/epi-theia/extensions/m4-nara test:render` — renders the resonance indicator (numeric + ConjugateFormCharacter glyph) on `NaraArtifactEnvelope`s when profile carries resonance; falls back to `pending-resonance` badge when `profile.personal_pole.is_none()`. NO silent zero-resonance display.
8. **Privacy-boundary test:** `cargo test -p gateway --test dispatch_contract nara_personal_pole_never_in_public_projection` — confirms `MathemeHarmonicProfilePublicCurrent::from(profile).personal_pole.is_none()` always; `buildPublicProfilePayload(day).bodyFields.len() == 0`; `buildSpaceTimeRows(day)` always has `body_included: false`; gateway-contract refuses to forward profiles with `personal_pole.is_some()` across the public boundary.
9. **Bounded-access discriminator test:** `cargo test -p gateway --test dispatch_contract nara_connectivity_is_not_bounded_access` (Wave-A tranche 5.10) — confirms live Graphiti/Neo4j/Redis/SpaceTimeDB ping does NOT grant bounded access to `nara.*` methods.
10. **Tick-choreography determinism test:** `pnpm -C Body/M/epi-theia/extensions/m4-nara test:replay` — deterministic `MPrimePerformanceEvent` stream produces same orientation / cymatic-pattern / resonance trajectory across two runs. Pause/scrub replays correctly to any historical `(tick12, degree720, q_composed)`.
11. **Composition-not-juxtaposition audit:** `grep -rn "side-by-side\\|three-pane" Body/M/epi-theia/extensions/m4-nara/src/` returns empty; integrated-450 composition contract test confirms side-by-side widget contributions are rejected at composition load.
12. **No-cosmic-K² test:** `grep -rn "K²\\|K2\\|chromatic_torus\\|fifths_meridian" Body/M/epi-theia/extensions/m4-nara/src/` returns empty (M1 territory). The Hopf-linked tori rendered at M4-5' are personal-scale dipyramid-contained, not cosmic K².
13. **Vimarśa-window audit:** `audio_octet` / `nodal_quartet` consumed via profile-bus subscription in `m4-nara/src/browser/psychoid_cymatic/`, NOT derived from local LUT lookups. `grep -rn "M2_PLANET_LUT\\|m2_planet_lut\\|chakra_freq" Body/M/epi-theia/extensions/m4-nara/src/` returns empty.
14. **Audio-always-running test:** the cymatic engine computes the audio bus regardless of playback state; playback is a separate output toggle. `grep -rn "playback.*enabled.*cymatic\\|if.*playback.*compute" Body/M/epi-theia/extensions/m4-nara/src/` returns empty (the compute path does NOT gate on playback).
15. **Q_activity decay enforcement:** `cargo test -p portal-core q_activity_decay_window` — confirms `q_activity` contributions to `Q_composed` decay per `qActivityPolicy.decay_window_open`; expired contributions zero out without identity mutation.
16. **M4.5 review-gate test:** `cargo test -p portal-core proposal_lifecycle` — confirms only `accepted → applied` verdicts mutate `Q_identity`; `proposed`, `reviewed`, `rejected` states leave identity unchanged. Contract test confirms the M4 adapter consumes M5' verdicts and never writes M4-0 outside the review path.
17. **Body-topological-not-figurative audit:** `grep -rn "anatomical\\|avatar\\|body_outline\\|character_model" Body/M/epi-theia/extensions/m4-nara/src/` returns empty.
18. **Default-surface anti-quaternion-dump audit:** `grep -rn "q\\.w\\|q\\.x\\|q\\.y\\|q\\.z\\|quaternion_components" Body/M/epi-theia/extensions/m4-nara/src/browser/daily/` returns empty (raw quaternion components NEVER on daily surface; only deep-surface explain).
19. **Vāma policy test:** classifier internal output is computed regardless of `presentation_policy`; user-visible glyph surfaces only on `UserVisible` or explicit contemplative-engagement invocation per DR-M4-2 clause 4.
20. **4-5-0 integrated composition test:** `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test` confirms the three composition slots (Nara journal left · cymatic field center · Mahāmāya recognition right) compose geometrically with shared `q_composed` color projection and shared lens-stack rings; rejects side-by-side widget contributions.

---

## §11 — Closing — Why M4' Is What It Is

The system stack flows `M0 (ground) → M1 (+1) → M2 (72) → M3 (64) → M4 (lived) → M5 (review/return)`. M4' is **the lived register where the cosmic matheme finds its personal point**. Without M4', the matheme is impersonal — the system speaks but no one is implicated. With M4' and the personal-quaternion at #4.4.4.4, the system speaks **in the user's elemental register**, and that speech is computable as a real metric (`resonance = |q_personal · q_cosmic(t)|`) rather than felt-only.

The bimba/pratibimba dial at this scale:

> **M4' is the pratibimba pole of M0's bimba ground, read through the matheme spine M1→M2→M3 as the user's lived field. The personal-quaternion is the user's actual position in the Cl(4,2) algebra that runs the whole system. The cymatic field is what that position looks like, in standing-wave physics, at every moment.**

The six sub-coordinates name the QL Mod-6 cycle at this scale: identity-evidence (M4-0', stable), baseline (M4-1'), event (M4-2'), pattern (M4-3', the intelligence), composed life (M4-4'), reviewed-or-deferred return (M4-5', the seam to M5). The corrected UX framing is that **M4-3' is the logical-intelligence engine** of Nara (the cross-dialect integrator), and that **#4.4.4.4 is the living update target** (NOT M4-0'). M4-0' supplies stable evidence; activity perturbs `Q_composed`; reviewed verdicts may, with consent, update `Q_identity`.

The integrated 4-5-0 surface is the moment the personal cymatic field and the canonical city-scape are rendered together so the identity-recognition can happen visually: *I am that, at every scale*. The Cl(4,2) algebra is the substrate that makes this visible; the resonance metric is the math that makes it computable; the psychoid-cymatic field is the rendering that makes it *seeable*; the review gate is the governance that keeps it safe.

> **Nara mirrors the lived pattern. M4-3' integrates the pattern across systems. M4.5 decides whether the map should be revealed. Epii conducts the user to the canon. Nara returns the teaching to body, dream, journal, and life. The personal cymatic field renders the whole thing honestly, in standing-wave physics, at every tick.**

The personal pole, finally seeable. *jīva eva śivaḥ*, finally renderable.

---

*Companion research with full file:line evidence: [`plan.runs/wave-a-m4-reconciliation-matrix.md`](../Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-a-m4-reconciliation-matrix.md). Cross-references: `M4'-SPEC.md`, `m4-prime-psychoid-cymatic-field-engine.md`, `m4-prime-nara-day-episodes-and-oracle-artifacts.md`, `nara-m4-0-0-birthdate-encoding-spec.md`, `M1-2-ANANDA-VORTEX-ARCHITECTURE.md` (the pattern exemplar this doc follows), `INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md` (the 4-5-0 composition surface where M4 is Jiva pole).*
