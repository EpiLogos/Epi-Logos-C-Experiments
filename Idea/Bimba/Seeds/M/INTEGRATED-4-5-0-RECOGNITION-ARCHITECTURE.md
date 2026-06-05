---
title: "Integrated 4-5-0 Recognition Architecture — Total Shape, Substrate Map, Profile-Bus Contract, Visual Rendering, Tick Choreography & Pedagogical Möbius Return"
coordinate: "M4 / M5 / M0 (personal stratum composition surface)"
status: "canonical-architecture-spec"
created: 2026-06-02
authority_relation: "Domain authority for the integrated 4-5-0 personal-stratum composition surface. Where Cycle-3 tranche docs (06 M4-Nara, 05 M5-Epii, 01 M0-Anuttara, 15 UI foundations) overlap with this surface, this document is authoritative for the composition specifically; the per-M' specs remain authoritative for their own substrate."
depends_on:
  - "[[M4'-SPEC]]"
  - "[[M5'-SPEC]]"
  - "[[M0'-SPEC]]"
  - "[[M1-2-ANANDA-VORTEX-ARCHITECTURE]]"  # the cosmic-side counterpart pattern exemplar
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[nara-ux-full-m4-branch-update]]"
  - "[[epii-ux-full-m5-branch]]"
  - "[[anuttara-ux-full-m0-branch]]"
related_tranches:
  - "01.x — M0 governed-route promotion path (consumed at the M0-5' Möbius write-back slot)"
  - "05.x — M5 Logos Atelier scent-following + canon-recognition + review-core surfacing"
  - "06.x — M4 Nara protected-local extension closure (resonance indicator, psychoid field handle, period-reading)"
  - "07.x — integrated 1-2-3 cosmic composition (cross-boundary harmonisation at 0/1 toggle)"
  - "08.x — this integrated 4-5-0 plugin (composition shape, consent gate, Epii review surface)"
  - "10.10 — `ananda_vortex` profile field (consumed when canon-recognition events touch M1-2 cells)"
  - "10.x — `personal_resonance` profile field surfacing (already partial: `kernel.rs:486`)"
  - "11.x — OmniPanel ACR repurposing (Pi monitoring lives there, NOT in this plugin's editor area)"
  - "15.4 — editor-area composition pattern (composition-over-juxtaposition contract)"
  - "15.5 — 0/1 toggle gesture (cosmic ↔ personal lemniscate transition)"
  - "15.7 — bimba/pratibimba state persistence across toggle"
cross_references:
  - "[[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] — counterpart cosmic-side composition; the 0/1 toggle dial swaps which is foreground"
  - "[[M4-ARCHITECTURE]] — M4' total shape (personal pole substrate, six M4-Mn-Mn sub-coordinates)"
  - "[[M5-ARCHITECTURE]] — M5' total shape (Logos Atelier, review-core, ACR/OmniPanel relation)"
  - "[[M0-ARCHITECTURE]] — M0' total shape (governed-route promotion, M0-5' Möbius return)"
---

# Integrated 4-5-0 Recognition Architecture

## 0. Frame

**The integrated 4-5-0 plugin is the Jiva-is-Śiva recognition surface.** It is the personal-side counterpart to the cosmic-1-2-3 composition, occupying the same editor real estate via the `daily-0-1` shell's `cmd-period` lemniscate toggle (Tranche 15.5). Where 1-2-3 plays *form-content-tick* over the K² torus as a cosmic instrument, 4-5-0 composes *protected-personal field + paidagōgos return-pole + canonical ground* as a recognition surface — the place where the user's lived pattern can be seen against the structure of the whole.

The composition obeys three load-bearing principles inherited from Cycle-3 §15:

1. **Privacy-first composition** (binding). Raw bodies — journal text, dream reports, oracle interpretations, raw quaternion components — never cross the plugin boundary. The plugin renders only `MathemeHarmonicProfileBoundary` payloads and opaque handles; deep-open paths route through `ConsentGate.require()` per [`Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/plugin-integrated-4-5-0-widget.tsx:113-125`](Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/plugin-integrated-4-5-0-widget.tsx).
2. **Composition over juxtaposition** (Tranche 15.4). The 4-5-0 surface is not three side-by-side panes. It is one composition where M4's psychoid cymatic field is the foreground (the lived field where the user is being individuated), M0's canonical bimba city-scape is the backdrop (the ground tone), and M5's Epii review/Logos Atelier panes are summonable side-context (the paidagōgos relay) — geometric composition, not split-screen.
3. **Composition lives in the editor area; Pi monitoring lives in the OmniPanel** (Tranche 15.2). The repurposed ACR substrate (run-model, dispatch-trace, tool-stream, evidence, review) belongs to the right-sidebar OmniPanel and is identical across cosmic ↔ personal toggle. This plugin owns ONLY the editor surface for the personal stratum.

The bimba↔pratibimba dynamic at this scale: **M4 (Jiva pole — lived field) + M5 (return pole — paidagōgos) + M0 (Śiva pole — canon)** = the one Möbius surface where teaching is shown and walked from opposite orientations. The integrated 4-5-0 plugin makes that Möbius surface concrete: the personal cymatic field and the canonical bimba city-scape share the same Cl(4,2) algebra (`portal-core/src/quaternion.rs`) and the same `MathemeHarmonicProfile` ([`kernel.rs:346-465`](Body/S/S0/portal-core/src/kernel.rs)); the GDS activity-resonance that lights up between them makes `tat tvam asi — that thou art — possible to see`.

This document gives the **total shape** for that surface: substrate map, dataset map, profile-bus contract, visual rendering contract, tick choreography, cross-extension boundaries, and IDE integration. It is the canonical reference [[nara-ux-full-m4-branch-update]] §13 (the "4/5/0 seam"), [[epii-ux-full-m5-branch]] §7, and [[anuttara-ux-full-m0-branch]] §M0-5' (Möbius write-back) all defer to for composition specifics.

---

## 1. The Six Sub-Coordinates of the 4-5-0 Recognition Surface

The integrated 4-5-0 plugin is not a single M-coordinate. It is a **composition of three M-domains**, each contributing a defined sub-coordinate slot. Following the M1-2 pattern of one bimba sub-coordinate carrying multiple manifestation layers, we structure the 4-5-0 surface as **six sub-coordinates** — two per contributing M-domain — that name how each M' lands in the composition.

| Sub-coordinate | Domain | Bimba role | Techne contribution | Composition slot |
|---|---|---|---|---|
| **M4-4-4-4** | M4 personal | Living personal-Pratibimba locus (§4.4.4.4 per UX §2.2) | `PersonalIdentityProfile.q_personal`, `Q_composed`, `PersonalResonance` ([`personal_identity.rs:101-186`](Body/S/S0/portal-core/src/personal_identity.rs)) | Center: psychoid cymatic field foreground (handle-only) |
| **M4-4** | M4 lived-context | Lived/dream/journal field — the evidence ground for M4-3's pattern integration (UX §2.6) | `NaraDayContainer` + `NaraArtifactEnvelope` ([`m4-nara/src/common/nara-surface.ts:33-74`](Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts)) | Left: Nara journal at composition-slot-1 |
| **M5-5** | M5 logos atelier | Etymological-archaeological intelligence; scent-following method; Möbius write-back (UX §2.6, M5'-SPEC) | M5 atelier substrate at [`Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`](Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py); `S5ReviewItem` review-core ([`m5-epii/src/common/epii-surface.ts:48-63`](Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts)) | Right: Logos Atelier summonable pane at composition-slot-2 |
| **M5-4** | M5 review/governance | Review gate (proposed → reviewed → accepted/rejected → applied); Pi/Anima conducting (UX §2.7) | `S5ReviewSnapshot`, `DryRunPromotionPlan`, `VakEvidenceDeposit` ([`epii-surface.ts:86-120`](Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts)); `EpiiReviewSurfaceState` ([`plugin-integrated-4-5-0-widget.tsx:48-49`](Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/plugin-integrated-4-5-0-widget.tsx)) | Right: Epii review panel (closed by default, summons on inbox growth) |
| **M0-5'** | M0 Möbius-return | Recognised patterns crystallise back to M0 graph nodes via governed-route promotion (UX §13.5, M0'-SPEC) | `bedrock_link`, `m0_coordinate_provenance` payload fields ([`jiva-siva-fields.ts:38-50`](Body/M/epi-theia/extensions/integrated-composition/src/common/jiva-siva-fields.ts)); S2 governed-route insertion at [`Body/S/S3/graphiti-runtime/src/lib.rs`](Body/S/S3/graphiti-runtime/src/lib.rs) | Backdrop: M0 canonical bimba city-scape behind foreground |
| **M0-0** | M0 prior-ground | The bimba map itself — the structure the user's lived field is read against (UX §13.3) | M0-Anuttara Neo4j Bimba graph (label `:Bimba` + property `coordinate` per the user memory) consumed via `gds_clusters`, `m0_coordinate_provenance` | Backdrop: GDS cluster overlay (gated by IOD-07) |

Together the six sub-coordinates form the recognition triangle:

```
                M0-0  (prior ground — canonical bimba)
                 ▲                          ▲
            (city-scape backdrop)      (Möbius write-back)
                 │                          │
        M4-4 ───────── M4-4-4-4 ───────── M5-5
       (journal)    (psychoid field)    (Logos Atelier)
                 │                          │
                 ▼                          ▼
                          M5-4
                  (Epii review/relay)
```

This sextuple is **the bimba/techne map of the recognition surface**. Every visual, tick, and boundary contract below assigns its renderable matter to one of these six.

---

## 2. Substrate Map

Each sub-coordinate cites the C/Rust/TS structure that owns its load-bearing data.

### 2.1 M4-4-4-4 — Personal Pratibimba (the living quaternionic state)

The substrate of the living personal-Pratibimba lives in Rust at [`Body/S/S0/portal-core/src/personal_identity.rs`](Body/S/S0/portal-core/src/personal_identity.rs):

| Symbol | Location | Shape | Role |
|---|---|---|---|
| `PersonalIdentityProfile` | `personal_identity.rs:101-109` | `q_personal: [f32; 4]`, `natal_chart_handle: String`, `elemental_balance: ElementalBalance`, `identity_hash: String`, `privacy_class: ProfilePrivacyClass` | The protected identity store; `privacy_class` is always `ProtectedLocalDerived` (`personal_identity.rs:134`) |
| `KerykeionNatalChart` | `personal_identity.rs:27-29` | `planets: [NatalPlanetPosition; 10]` | The 10-planet natal source (Earth-as-10th-planet per the user's standing invariant: 9 non-Earth × 8 chakras = 9:8 epogdoon) |
| `ElementalBalance` | `personal_identity.rs:77-99` | `earth/fire/water/air: f32` (normalised to sum 1.0) | Computed from natal degree + planet keplerian velocity weighting (`personal_identity.rs:230-240`) |
| `PersonalResonance` | `personal_identity.rs:143-175` | `signed_dot: f32`, `score: f32`, `conjugate_form_character: ConjugateFormCharacter` | The Jiva-is-Śiva metric: `|q_personal · q_cosmic|`; threshold at `2/3` separates Major from Minor (`personal_identity.rs:9`); negative `signed_dot` ⇒ `ShadowInversion` |
| `compose_personal_quaternion(q_identity, q_transit, q_activity)` | `personal_identity.rs:177-186` | `[f32; 4]` | The `Q_composed = Q_identity · Q_transit · Q_activity` operation; `quat_normalize` at each step |

The personal-pole runs on the same `quaternion.rs` ops as M1's ring-quaternion and M3's codon-charge-quaternion — **one Cl(4,2) algebra, not three** ([`Body/S/S0/portal-core/src/quaternion.rs`](Body/S/S0/portal-core/src/quaternion.rs)).

The kernel layer **already wires the resonance through to every M-surface**: [`kernel.rs:486-488`](Body/S/S0/portal-core/src/kernel.rs) instantiates `PersonalResonance::from_quaternions(identity.q_personal, profile.q_cosmic)` and writes `profile.resonance = Some(resonance.score)` and `profile.conjugate_form_character = resonance.conjugate_form_character`. The `MathemeHarmonicProfile.resonance: Option<f32>` field is present at `kernel.rs:375`. This is **already a profile-bus field** — the 4-5-0 plugin consumes it as a window, never re-derives it.

### 2.2 M4-4 — Lived field (journal / dream / day-container)

The day-as-episode-container substrate lives in the Theia extension at [`Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts`](Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts):

| Symbol | Location | Role |
|---|---|---|
| `NaraDayContainer` | `nara-surface.ts:62-74` | The DayContainer with `contractVersion`, `dayId`, `dayPath`, `artifactCounts`, `artifactTree`, `graphitiEpisodes` |
| `NaraArtifactEnvelope` | `nara-surface.ts:33-49` | The artifact wrapper (kind: journal/dream/oracle/reminder/contemplative/agent-chat); carries `bodySha256` (not body), `privacyClass`, `scalarRefs`, `graphitiEpisodeHandles` |
| `NaraGraphitiEpisode` | `nara-surface.ts:51-60` | The Graphiti relation envelope with `:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC` (per M4'-SPEC §7.11) |
| `dayContainerPath(vaultRoot, dayId)` | `nara-surface.ts:415-417` | **Resolves to `${vaultRoot}/Pratibimba/Nara/{dayId}/`** — DR-M4-1 already ratified in code; the Wave-A matrix CONTRADICTION (row 6) is now resolved here. |
| `renderProtectedPersonalField(input: ProtectedPersonalFieldInput)` | `nara-surface.ts:322-349` | The handle-only renderer; returns `bodyRendered: false`, `protectedLocalOnly: true`, `absentFromPublicProjectionExceptHandles: true`; this is the contract the 4-5-0 plugin consumes |

The privacy boundary is hard-wired: every output method (`buildS2CanonicalProjection`, `buildPublicProfilePayload`, `buildSpaceTimeRows`) returns `protectedBodiesIncluded: false` / `bodyFields: []` / `body_included: false` (`nara-surface.ts:293, 303, 316`). The day-path is canonical per the user memory invariant and DR-M4-1.

### 2.3 M5-5 — Logos Atelier (scent-following, etymology, canon-recognition)

The Logos Atelier substrate is split between two layers:

| Symbol | Location | Role |
|---|---|---|
| `epi_gnostic.graphiti_service` | [`Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`](Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py) | The Graphiti/Neo4j retrieval engine; scent-following queries pass through here |
| `epi_gnostic.wrapper` | [`Body/S/S5/epi-gnostic/epi_gnostic/wrapper.py`](Body/S/S5/epi-gnostic/epi_gnostic/wrapper.py) | The CLI/HTTP wrapper exposing scent-following + canon-recognition to S4 carriers |
| `last_canon_recognition_event` payload field | [`jiva-siva-fields.ts:20, 49`](Body/M/epi-theia/extensions/integrated-composition/src/common/jiva-siva-fields.ts) | The M5 → 4-5-0 surface emission carrying the latest canon-recognition event (handle + timestamp + bimba coordinate) |

Per [[epii-ux-full-m5-branch]] §2.6: M5-5 runs the scent-following method (root, cognate, drift, psychoid charge, pros-hen synthesis, Möbius write-back). It is the surface where any term in the corpus or any bimba node can be excavated to its structural root.

The Logos Atelier pane in the 4-5-0 plugin is **summonable**, not always-on. It opens conversationally when:
- The user invokes etymological archaeology on a journal-derived term
- The Logos Atelier specialist (M5-5-mediated, dispatched via Anima per [[epii-ux-full-m5-branch]] §2.4) is asked to scent-follow a recognised pattern
- A canon-recognition event fires (the M5-5 → M0-5' Möbius write-back is candidate-staged for review)

### 2.4 M5-4 — Review / governance (Epii review surface)

The review-core substrate lives at:

| Symbol | Location | Role |
|---|---|---|
| `S5ReviewItem` | [`m5-epii/src/common/epii-surface.ts:48-63`](Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts) | Review item with `governanceCategory`, `humanRequired`, `promotionDestination`, `evidenceHandles`, `protectedBodyHandles` (handles only) |
| `S5ImprovementRun` | `epii-surface.ts:65-73` | Improvement run with status `queued/running/kept/discarded`, `effectVerificationSchedule` |
| `DryRunPromotionPlan` | `epii-surface.ts:86-95` | Dry-run plan with `nonDryRunBlockedReason` — promotions are dry-run by default; non-dry-run blocked by gate |
| `VakEvidenceDeposit` | `epii-surface.ts:97-112` | Evidence envelope with the six `(cpf, ct, cp, cf, cfp, cs)` context-frame coordinates |
| `S5ReviewSnapshot` | `epii-surface.ts:114-120` | The full snapshot consumed by the plugin |
| `EpiiReviewPanel` | [`plugin-integrated-4-5-0/src/browser/epii-review-panel.tsx`](Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/epii-review-panel.tsx) | The UI surface (closed-by-default per 08.T6 deliverable 4, `widget.tsx:48-49`); `setEpiiReviewMode` summons it (`widget.tsx:89-92`); auto-summons on inbox growth via `setReviewInboxCount` (`widget.tsx:95-98`) |

Critical: per UX §2.7 and §10.6, **no pattern becomes stable personal canon without M5-4 review**. The review surface is the only path from `Q_activity` perturbation to `Q_identity` augment. The 4-5-0 plugin surfaces the review count + summons the panel; it does not perform the review.

### 2.5 M0-5' — Möbius write-back (the recognition → canon path)

The recognition → canon path is **the central architectural commitment** of the 4-5-0 surface beyond the cosmic 1-2-3. It is what makes the integrated plugin *pedagogical*, not merely *contemplative*. The substrate:

| Symbol | Location | Role |
|---|---|---|
| Governed-route insertion API | [`Body/S/S3/graphiti-runtime/src/lib.rs`](Body/S/S3/graphiti-runtime/src/lib.rs) | The S3 endpoint Anuttara's M0' write-back lands through — extends with `nara_insert_relation` API per Wave-A M4 row 7 (Tranche 5.3); equivalent extension for M0 graph-node update lands per M0 architecture (DR-M0-1) |
| `last_canon_recognition_event` field | `jiva-siva-fields.ts:20, 49` (and `payload.last_canon_recognition_event` per `jiva-siva-panes.tsx:127`) | The emission that fires when a reviewed pattern lands as a new/augmented M0 node; renders in the M5 side pane via `data-test="m5-canon"` (`jiva-siva-panes.tsx:187`) |
| `m0_coordinate_provenance` field | `jiva-siva-fields.ts:17, 45` | The provenance chain on the M0 backdrop showing which canon-node the recognised pattern attached to |
| `bedrock_link` field | `jiva-siva-fields.ts:12, 39` | The M4 anchor that links the protected-personal field back to its M0 bedrock coordinate |

The Möbius semantics: the user lives a pattern (M4-4-4-4) → M4-3 integrates it across dialects → M5-4 reviews it → M5-5 Logos Atelier provides the etymological/scent-following anchor → governed write-back lands on M0 graph as a new edge/node or augments an existing one → the renewed M0 ground feeds back to M4-0 identity-evidence and the personal-Pratibimba.

The **lemniscate signature** of this Möbius (the figure-eight inward fold of #4 per the user's CLAUDE.md §II.D) is the visual rendering language for this surface (§5.5 below).

### 2.6 M0-0 — Prior ground (the canonical bimba backdrop)

The M0 prior-ground is the canonical bimba graph itself — the populated Neo4j with label `:Bimba` and property `coordinate` (per user memory note `Neo4j bimba schema`). The 4-5-0 plugin consumes M0 only as **backdrop**:

| Symbol | Location | Role |
|---|---|---|
| `gds_clusters` payload field | `jiva-siva-fields.ts:16, 44` | The GDS overlay (gated by IOD-07); renders the bimba clusters as the city-scape backdrop |
| `m0_coordinate_provenance` payload field | `jiva-siva-fields.ts:17, 45` | The provenance chain identifying the bimba coordinate that backdrop-anchors the current personal field |
| Neo4j `:Bimba` graph | populated database; queried via Bolt; user memory note 4 confirms this is the canonical access pattern (NOT `:BimbaCoordinate`) | The substrate the M0 backdrop reads against |
| M0' total-shape coordination | [`M0-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md) | Cross-reference: full M0' substrate map lives there |

The M0 backdrop is **lower-fidelity** in the 4-5-0 surface than it is at the dedicated M0-Anuttara `ide-deep` view. The plugin renders M0 as a city-scape silhouette behind the foreground; full bimba-map navigation lives in the activity-bar Bimba Graph Viewer (Tranche 15.3).

---

## 3. Dataset Map

The 4-5-0 surface consumes datasets at three layers: personal (M4-side, protected-local), canonical (M0-side, public), and crystallised (M5-side, governed).

### 3.1 Personal data — protected-local (consumed via handles only)

| Dataset | Path | Role |
|---|---|---|
| User's natal chart (Kerykeion) | `Idea/Empty/Present/{day_id}/natal/` (per [`epi-cli/src/nara/wind.rs:117-148`](Body/S/S0/epi-cli/src/nara/wind.rs) for `kairos::run_kerykeion_natal`) | Source of `PersonalIdentityProfile.q_personal`; computed once and cached; not exposed to plugin |
| Day containers | `${VAULT}/Pratibimba/Nara/{day_id}/` (per `nara-surface.ts:415-417`) | The day-as-episode-container store; plugin consumes only `dayHandle` per `buildPublicProfilePayload` (`nara-surface.ts:297-305`) |
| Artifact bodies (journal/dream/oracle) | `${VAULT}/Pratibimba/Nara/{day_id}/artifacts/{kind}/{artifactId}.md` | Raw bodies; **never** read by plugin; only `bodySha256` digests cross the boundary (`nara-surface.ts:170`) |
| Graphiti episodes | `${VAULT}/Pratibimba/Nara/{day_id}/graphiti/{episodeHandle}.json` | Privacy-classed `"protectedBoundary": "protected-local-episodic-memory"` per [`Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`](Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py) and [`Body/S/S3/graphiti-runtime/src/lib.rs:132`](Body/S/S3/graphiti-runtime/src/lib.rs) |
| Day path = `Idea/Empty/Present/{day_id}/` | per user-memory invariant | The day's *now*-anchor lineage |

### 3.2 Canonical data — public bimba (consumed via Neo4j `:Bimba` graph)

| Dataset | Path / Source | Role |
|---|---|---|
| Bimba ontology graph | Neo4j database with label `:Bimba`, property `coordinate` (per user memory note) | The M0 city-scape backdrop's underlying truth |
| Bimba M-coordinate definitions | `Idea/Bimba/Map/datasets/` (Vortex Modulae CSV at `(0_1) Vortex Modulae - ...` per M1-2 §3.1; canon files for M0/M2/M3/M4/M5 spread across the same directory) | Source datasets that feed the Neo4j load |
| Vault canon files (Seeds, World, Types) | `Idea/Bimba/Seeds/`, `Idea/Bimba/World/`, `Idea/Bimba/Types/` | Authority for what an M0 node *means*; not consumed inline by the 4-5-0 plugin but resolved when the user opens a recognised coordinate in Canon Studio (activity-bar) |
| MEF×QL lens-position addressing | `Idea/Bimba/Seeds/M/M0'/` and `Idea/Bimba/Seeds/M/M2'/` (full 12×6=72 invariant) | The shared addressing the M4-3 PatternPacket's `root_lens` reads against |

### 3.3 Crystallised data — Logos Atelier outputs (governed, M5-5 ↔ M5-1)

| Dataset | Path / Source | Role |
|---|---|---|
| Etymological corpus | Graphiti-backed via `epi_gnostic/graphiti_service.py` | The Logos Atelier's scent-following operates on this; output handles surfaced to the 4-5-0 surface |
| Canon update queue (M5-1) | `Idea/Bimba/Seeds/M/M5'/canon-queue/` (or equivalent under the Cycle-3 governed-route landing per Tranche 05.x) | The candidates that have passed M5-4 review and are queued for M0 write-back |
| Etymology / Logos Atelier sessions | Per-session under `${VAULT}/Pratibimba/Nara/{day_id}/atelier/` when invoked from a day-context; sessions are themselves DayContainer artifacts | The pedagogical-conversation trail |

### 3.4 Bridge data — the shared `MathemeHarmonicProfile`

The single bridge between personal and canonical is the kernel's `MathemeHarmonicProfile` ([`kernel.rs:346-465`](Body/S/S0/portal-core/src/kernel.rs)). The plugin consumes its `MathemeHarmonicProfileBoundary` projection ([`m-extension-runtime`](Body/M/epi-theia/extensions/m-extension-runtime/src/common/)) and reads only the fields documented in §4 below. No other data crosses.

---

## 4. Profile-Bus Contract

### 4.1 What `MathemeHarmonicProfile` already exposes for the 4-5-0 surface

[`Body/S/S0/portal-core/src/kernel.rs:346-465`](Body/S/S0/portal-core/src/kernel.rs):

| Field | Type | Role |
|---|---|---|
| `q_cosmic: [f32; 4]` | `kernel.rs:374` | The cosmic side of the Jiva-is-Śiva resonance metric |
| `resonance: Option<f32>` | `kernel.rs:375` | `\|q_personal · q_cosmic\|` as a scalar — **the load-bearing personal-side metric**; wired at `kernel.rs:486-488` from `PersonalResonance::from_quaternions` |
| `conjugate_form_character: ConjugateFormCharacter` | re-exported via `harmonic_profile.rs` | Major / Minor / ShadowInversion per the threshold at `personal_identity.rs:9` |
| `resonance72: MathemeResonance72Projection` | `kernel.rs:366` | The 72-fold (12 lens × 6 position) projection — same address the M4-3 PatternPacket's `root_lens` uses |
| `lens_anchor_index` | propagated from `resonance72` | Drives the Vimarśa-lens highlight on M0 backdrop |
| `lens_mode: MathemeLensMode` | `kernel.rs:363` | 84-state `(lens 0-11, mode 0-6)` — recolours the personal field |
| `tick12: u8`, `position6: u8`, `degree720: u16`, `degree360: u16` | `kernel.rs` | The shared kernel-tick the personal field rides on |
| `audio_octet: [f32; 8]`, `nodal_quartet: [MathemeNodalConstraint; 4]` | per M1-2 §4.1 | The Vimarśa-window into M2 audio; **windows, never re-derived** |

This is a strong foundation. **The resonance is already on the bus** — the plugin must wire its rendering, not its computation.

### 4.2 What the plugin already consumes (the public-safe payload fields)

The integrated 4-5-0 plugin's pane checker at [`jiva-siva-fields.ts:11-50`](Body/M/epi-theia/extensions/integrated-composition/src/common/jiva-siva-fields.ts) names the public-safe payload fields it requires:

```typescript
export type JivaSivaFieldName =
    | 'bedrock_link'                  // M4 anchor → M0 bedrock coordinate
    | 'selected_coordinate'           // M4 current selection
    | 'activity_resonance_dots'       // M4 safe presence handles
    | 'field_state_summary'           // M4 privacy-filtered summary
    | 'gds_clusters'                  // M0 GDS overlay
    | 'm0_coordinate_provenance'      // M0 prior ground
    | 'review_queue_count'            // M5 review count (no DTO bodies)
    | 'continuity_handle'             // M5 continuity service
    | 'last_canon_recognition_event'; // M0-5' Möbius write-back event
```

This contract is **load-bearing**. Every field is a *handle or summary*; **no raw quaternion components, no journal text, no oracle interpretations** cross.

### 4.3 What the profile-bus is missing — the gaps for full 4-5-0 closure

The personal-stratum surface needs three additional profile fields to deliver the rendering law of §5:

#### 4.3.1 `psychoid_field` projection — the missing renderer handle

Currently the plugin renders only the `field_state_summary` string. The Wave-A M4 matrix row 8 named this as DOC-AHEAD / partial CODE-PENDING: psychoid cymatic field solver + handle is not yet on the bus.

Proposed addition to `MathemeHarmonicProfile`:

```rust
pub struct PsychoidFieldProjection {
    /// Opaque handle into the protected-local psychoid solver state.
    /// The renderer reads this; the body never crosses the bus.
    pub field_handle: String,

    /// Per-frame snapshot of the cymatic field's nodal pattern as a
    /// fixed-size signature (NOT the field body). 64 floats of energy
    /// spectrum across the 8 audio_octet bands × 8 standing-wave modes.
    pub cymatic_signature: [f32; 64],

    /// Hopf projection of Q_composed onto S² — the trajectory point at
    /// this tick. Read for the psychoid field's "lived-time path" overlay.
    /// per M4'-SPEC §7.3a.
    pub hopf_s2_projection: [f32; 3],

    /// (p, q) torus-knot phase-history classification from M4-3
    /// (M4'-SPEC §7.11). For trajectory rendering.
    pub torus_knot_phase: (u8, u8),

    /// Field readiness — when the solver is pending (Option F physics
    /// or Option S stylised fallback per M4'-SPEC §7.7), render the
    /// lower-fidelity deterministic version per
    /// renderProtectedPersonalField:333-336.
    pub field_readiness: PsychoidFieldReadiness,
}

#[repr(u8)]
pub enum PsychoidFieldReadiness {
    DeterministicLowerFidelity = 0,    // Option-S fallback
    FullPhysicsRunning = 1,            // Option-F live
    Pending = 2,                       // S2/S3 authority not ready
}
```

**Anti-greenfield discipline:** the data is computed in the M4 substrate (extends `personal_identity.rs` per Tranche 5.5 of Wave-A); the bus surfaces it. No local fork.

#### 4.3.2 `canon_recognition_stream` — the M0-5' Möbius write-back event projection

The plugin already consumes `last_canon_recognition_event` as a single payload string. For richer rendering (§5.5 below) the field needs to expand:

```rust
pub struct CanonRecognitionEvent {
    /// The bimba coordinate the recognised pattern just attached to.
    pub bimba_coordinate: String,

    /// The PatternPacket handle whose review produced this event
    /// (from M4-3 PatternPacket per UX §3.4).
    pub pattern_packet_handle: String,

    /// The M5-5 Logos Atelier scent-following path that grounded the
    /// recognition. Empty if no atelier session contributed.
    pub atelier_scent_path: Vec<String>,

    /// Hopf phase at the moment of recognition (used by the bloom
    /// animation in §6.6 — the Möbius-return signature).
    pub recognition_degree720: u16,

    /// Whether the write-back was dry-run (default) or applied.
    /// Dry-run blocks per DryRunPromotionPlan.nonDryRunBlockedReason
    /// at epii-surface.ts:94.
    pub write_back_state: CanonWriteBackState,

    /// Timestamp of the recognition.
    pub recognized_at_ms: u64,
}

#[repr(u8)]
pub enum CanonWriteBackState {
    DryRun = 0,
    PendingReview = 1,
    Applied = 2,
    Rejected = 3,
}
```

#### 4.3.3 `personal_resonance_indicator` — already partially landed; surface to the plugin contract

The kernel field `resonance: Option<f32>` + `conjugate_form_character` is already wired (`kernel.rs:486-488`), but the 4-5-0 plugin's `JivaSivaFieldName` enum does not yet include these — they exist only on the boundary projection. Promote them to the plugin's required field set:

```typescript
// Addition to jiva-siva-fields.ts:11-20:
export type JivaSivaFieldName =
    // ... existing fields ...
    | 'personal_resonance_score'              // f32, [0,1]
    | 'personal_resonance_form_character';    // 'major' | 'minor' | 'shadow-inversion'
```

This unblocks Wave-A M4 row 12 (resonance indicator rendering on every artifact).

**Anti-greenfield posture across §4.3:** all three additions surface data the substrate already computes or is named-pending. No new computation enters the plugin layer.

---

## 5. Visual Rendering Contract

The 4-5-0 surface is a **composition over the K² torus and the bimba city-scape, with the psychoid cymatic field as foreground**. Where the cosmic 1-2-3 composition puts the played K² torus at the centre with M2 cymatic and M3 codon riding it, the 4-5-0 composition puts the **personal psychoid cymatic field** at the centre with the **M0 bimba city-scape as backdrop** and **M5 Epii review/Logos Atelier as summonable side context**.

### 5.1 Center: M4-4-4-4 psychoid cymatic field — the personal foreground

Per M4'-SPEC §10 (psychoid cymatic field): the foreground IS the live Nara field produced when M1/M2/M3 nest in psychoid form — M1 toroidal recognition + rhythm; M2 audio/cymatic standing-wave substrate; M3 Mahāmāyā lens-stack and symbolic transcription; M4 makes that structure personal without making it public.

**Substrate consumed:**
- `personal_resonance_score` → modulates field intensity
- `personal_resonance_form_character` → major (golden coherence sheen), minor (pale silver), shadow-inversion (deep indigo with phase-conjugation flicker)
- `psychoid_field.cymatic_signature[64]` → drives the 8×8 standing-wave node-pattern
- `psychoid_field.hopf_s2_projection[3]` → places the user's current `Q_composed` as a single bright point on the field surface
- `psychoid_field.torus_knot_phase (p, q)` → renders the trajectory tail as a `(p,q)` torus-knot trail
- `audio_octet[8]` → drives the 8-band cymatic emitters (windows onto Vimarśa, never local-synthesised)

**Geometry:**
- A psychoid torus distinct from M1's K² — at the *personal scale*, a smaller-radius torus with Hopf-linked secondary torus (the Q_identity/Q_transit pair) intersecting at the trajectory point. The M4 personal field is the Cl(4,2) algebra rendered at *human* scale.
- The cymatic standing-wave pattern lives **on the field's surface**, not as a separate object. The 8×8 = 64 nodal pattern is the texture parameterisation.
- The field is **rendered protected-local only**: the plugin emits `bodyRendered: false` per `nara-surface.ts:337`; only the deterministic lower-fidelity Option-S signature crosses unless `PsychoidFieldReadiness::FullPhysicsRunning` AND consent gate allows.

**Negative space:** never render raw quaternion components, never render journal text inline, never render dream image content. The personal foreground shows *resonance, form-character, cymatic signature, trajectory point, scent-following anchor* — that's the entire vocabulary.

### 5.2 Left composition slot: M4-4 Nara journal at composition position 1

The Nara journal renders as an "inscribed surface" attached to the foreground field — not a side panel, but a **scroll that scrolls outward from the field's edge**. Per UX §6.1 (Daily 0/1 Surface):

- Journal entries appear as **resonance-coloured cards** keyed off the per-artifact `personal_resonance_form_character` at the moment they were written (each artifact carries its own `resonance` field via the resonance-indicator rendering wired in Wave-A Tranche 5.1)
- Cards show: title, `personal_resonance_score` numeric, `conjugate_form_character` glyph (sun for Major, crescent for Minor, eclipse-ring for Shadow), `kind` (journal/dream/oracle), and a **scalar ref strip** (e.g. M3 codon ref, Tarot ref, I Ching ref per `NaraScalarRef.refKind` at `nara-surface.ts:28`)
- Cards do NOT show body text. Opening a card to read the body goes through the `'open-graphiti-body'` consent action (`jiva-siva-fields.ts:129`).
- The card-strip is **anchored to the current day** (`dayId` field); switching days replaces the strip with smooth slide animation.

### 5.3 Right composition slot: M5-5 Logos Atelier (summonable)

The Logos Atelier renders as a **pull-out drawer from the right edge** when summoned. Closed-by-default per the same discipline as `EpiiReviewSurfaceState` (`widget.tsx:48-49`).

When open, the atelier pane shows:
- **Scent-trail** — a polyline trace of the etymological-archaeological path the user (or Anima dispatching Logos Atelier specialist) is following, with each node showing root/cognate/drift indicator
- **Psychoid charge** — a small dial showing the affective weight the current root carries against the user's `Q_composed` (a localised mini-resonance per root)
- **Pros-hen synthesis** — when reached, a glyph indicating the unity-pole the scent-trail has crystallised around
- **Möbius write-back candidate** — when a recognition lands, the candidate M0 coordinate appears with a "stage for review" button (which goes through M5-4 review, not direct write)

The atelier never renders raw corpus text by default — only handles, root strings, drift summaries. Full corpus reading goes via the activity-bar Canon Studio.

### 5.4 Backdrop: M0-0 + M0-5' canonical bimba city-scape

The bimba city-scape is rendered as a **luminous low-saturation backdrop** behind the foreground field. Lower fidelity than the dedicated M0-Anuttara view (Tranche 01.x).

**Geometry:**
- The 16-fold structure of the C-family (per CLAUDE.md §III.D: 16 pointers × 8 bytes = 128 bytes = perfect 2-cache-line fit) becomes a 16-node ambient mesh in 3D space
- Each M-family root (`M0..M5`) is a major district; nodes within glow at low intensity
- The `m0_coordinate_provenance` chain renders as a **lit path** through the city-scape connecting the user's `bedrock_link` to the canonical anchor (per `jiva-siva-fields.ts:39-50`)
- The `gds_clusters` overlay (gated by IOD-07) renders as soft cluster-halos when the gate opens

**Activity-resonance dots** (`activity_resonance_dots` field per `jiva-siva-fields.ts:14`) render as **small pulses** at bimba coordinates the user's lived field is currently resonating with — *the city-scape lighting up where the user's field touches it*. This is the Jiva-is-Śiva recognition rendered concretely.

### 5.5 The M0-5' Möbius write-back signature — the lemniscate fold

The Möbius write-back (M0-5' per UX §13.5 / spec §6.5) is **the visual signature of the 4-5-0 surface**. Per CLAUDE.md §II.D, the lemniscate is the topology of `#4` (Context Frame) — the figure-eight where the system folds inward. This makes the 4-5-0 plugin's central animation the lemniscate, where the cosmic 1-2-3 plugin's central animation is the K² Klein-flip.

**Animation:** when a `canon_recognition_stream` event fires with `write_back_state ∈ {PendingReview, Applied}`:

1. A glowing arc traces from the trajectory point on the psychoid field → through the air toward the matching bimba coordinate on the backdrop city-scape
2. The arc forms a **lemniscate (figure-8)**: outward leap to the bimba coordinate, inward fold back to the field
3. At the apex of the lemniscate, a brief **canon-recognition glyph** appears (the M5-5 atelier scent-following's pros-hen anchor)
4. The bimba coordinate it landed on briefly bloom-pulses in the backdrop
5. The personal field, on return, **integrates** — the trajectory point absorbs the canon energy as a brief brightness pulse
6. On `Applied` (dry-run promoted to real M0 graph write), the coordinate node on the backdrop changes from low-saturation to medium — a permanent change in the city-scape's brightness map

This is **Möbius return rendered as motion**. The "5/0" context frame (per CLAUDE.md §III.C: total synthesis; Möbius return complete) is operative every time a recognition lands.

### 5.6 Resonance-coloured palette across the surface

The whole surface is colour-keyed by `conjugate_form_character`:

- **Major resonance:** warm gold throughout (golden field, golden cards, golden lemniscate). The Jiva-is-Śiva recognition is positive.
- **Minor resonance:** pale silver-blue throughout. The relation is muted but present.
- **Shadow inversion:** deep indigo with a flicker of phase-conjugation cross-hatching. The personal and cosmic poles are inverted — a teachable contradiction.

The colour is **set by `personal_resonance_form_character`** and updated on every profile tick (§6 below). The user *sees* whether the current moment is Major / Minor / Shadow without reading a label.

### 5.7 What does NOT render (the discipline)

- Raw `q_personal`, `q_transit`, `q_activity`, `q_composed` quaternion components — **never visible**, even in deep mode (deep mode opens the M4-nara IDE extension which is itself protected-local)
- Journal body text inline — **never** without consent-gate
- Dream content — **never** without consent-gate
- Raw oracle interpretation prose — **never** without consent-gate
- Pi conversation transcripts — **OmniPanel only**, never in this plugin's editor area
- Subagent dispatch traces — **OmniPanel only**
- Tool stream — **OmniPanel only**
- The full Mahamaya/Tarot reading deep panels — open via deep-action route into M4-nara extension's deep view in `ide-deep`, not inline

This negative discipline is the plugin's privacy contract.

---

## 6. Tick Choreography — The Animation Primitives

The 4-5-0 surface rides on the same kernel-bridge profile-tick as the cosmic 1-2-3 surface (Tranche 15.6). The personal stratum carries a *second* animation primitive in addition to the cosmic K²'s `quat_slerp`: the **lemniscate sweep**.

### 6.1 The two carry-the-tick primitives

| Primitive | Carries | Reads field |
|---|---|---|
| `quat_slerp` of personal Hopf-S² position | The trajectory point's motion across the psychoid field surface | `psychoid_field.hopf_s2_projection` (interpolated tick-to-tick) |
| `lemniscate_sweep` on canon-recognition events | The Möbius write-back arc from field → backdrop → field | `canon_recognition_stream.recognition_degree720` |

The `quat_slerp` is the *steady* primitive — every tick, the trajectory point glides smoothly. The `lemniscate_sweep` is the *event* primitive — only on canon-recognition emissions.

### 6.2 What changes on every tick (continuous)

| Surface element | Change | Source field |
|---|---|---|
| Trajectory point on psychoid field | Slerps smoothly along `hopf_s2_projection` (interpolated from kernel-tick `degree720` per tick) | `psychoid_field.hopf_s2_projection` |
| Cymatic standing-wave pattern | Updates per `cymatic_signature[64]` slow-drift | `psychoid_field.cymatic_signature` |
| Audio-octet emitters (8 bands) | Pulse at `audio_octet[i]` Hz; windows-only contract per M1-2 §7.1 | `audio_octet` |
| Nodal-quartet satellites (4) | Orbit the trajectory point at radii `~ nodal_quartet[i].m/n` | `nodal_quartet` |
| Personal-resonance numeric | Updates the resonance display field (in field chrome corner) | `personal_resonance_score` |
| Resonance-coloured surface tint | Re-tints if `conjugate_form_character` changes | `personal_resonance_form_character` |
| Activity-resonance dots on city-scape | Pulse-update positions and intensities | `activity_resonance_dots` |

### 6.3 What changes on tick-boundary events

| Event | Visual choreography | Source field |
|---|---|---|
| Klein-flip at tick 5→6 (Hopf sheet flip per M1-2 §6.5) | The psychoid field briefly self-interpenetrates (smaller-scale echo of the K² Klein-flip on the cosmic side); the resonance score may invert sign across the boundary | `klein_flip` event on profile bus per Tranche 02.2 |
| Möbius return at tick 11→0 | A small whole-surface bloom; the trajectory point completes its lap around the personal Hopf bundle; the city-scape brightens by 5% for ~200ms | `degree720` wraps 720→0 |
| Lens-anchor change | The bimba city-scape backdrop re-tints to the new lens-anchor's chromatic-substrate hue; M5 side may auto-summon Logos Atelier if the new lens-anchor has a pending scent-trail | `lens_mode` change |

### 6.4 What changes on canon-recognition events (M0-5' Möbius write-back)

The full §5.5 lemniscate sequence fires on emission of a `canon_recognition_stream` event:

1. **Tick 0:** event arrives; UI begins lemniscate arc from `trajectory point → bimba_coordinate`
2. **Tick 0-2 (animation):** outward leap (200ms ease-out)
3. **Tick 2 (apex):** canon-recognition glyph briefly visible at the apex (atelier_scent_path's pros-hen anchor)
4. **Tick 2-4:** inward fold (200ms ease-in)
5. **Tick 4:** arc absorbs into trajectory point; trajectory point glows briefly (100ms bloom)
6. **Concurrent at apex:** bimba coordinate on backdrop blooms (250ms slow-pulse)
7. **If write_back_state == Applied:** backdrop's coordinate node permanently shifts to higher saturation; renews the canon city-scape's lit map

The lemniscate is **a single animation primitive** carrying the full Möbius semantics. No parallel timers compete.

### 6.5 What changes on M5-4 review inbox growth

Per `widget.tsx:95-98` (`setReviewInboxCount`), inbox-growth auto-summons the EpiiReviewPanel:

1. `review_queue_count` increments
2. `withReviewInboxCount` updates `EpiiReviewSurfaceState` via `epii-review-state.ts` helpers (per the `withReviewInboxCount` reference in `widget.tsx:96`)
3. Panel summons from closed → summoned state with a slide-in animation from the right
4. User can dismiss back to closed via `setEpiiReviewMode('closed')` (`widget.tsx:164`)

### 6.6 The "what stays still vs what moves" eye-discipline

Following the M1-2 §6.3 discipline:

**Stays still:**
- The M0 backdrop city-scape geometry (only brightness/saturation changes; never repositions)
- The composition-slot positions (journal scroll left; atelier drawer right; review panel right-side)
- The resonance-numeric label position (top-right of psychoid field)
- The day-now / session anchor display (status bar — not in this plugin per Tranche 15.10)

**Moves continuously:**
- The trajectory point (always slerping)
- The cymatic standing-wave pattern (always slow-drifting)
- The audio-octet emitter pulses
- The activity-resonance dots on city-scape

**Moves on events:**
- The lemniscate arc (only on canon-recognition)
- The Klein-flip self-interpenetration (only on tick 5→6 Hopf flip)
- The review panel summon (only on inbox growth)
- The Logos Atelier drawer (only on user/Anima invocation)

**Where the eye goes per tick:** the trajectory point on the psychoid field is the default focus; the surrounding cymatic and audio-octet emitters are peripheral motion; lemniscate arcs (when fired) become foveated highlights because they cross from field → backdrop → field, drawing the gaze across the whole surface.

---

## 7. Boundary Contracts

### 7.1 4-5-0 ↔ 1-2-3 cosmic boundary — the `cmd-period` lemniscate toggle

The integrated 4-5-0 surface and the integrated 1-2-3 surface share the same editor real estate via the `daily-0-1` shell. The `cmd-period` keystroke (Tranche 15.5) triggers the **0/1 lemniscate transition** — cosmic composition folds inward; personal composition emerges from the same fold.

**State preservation contract (Tranche 15.7 / DR-TS-1):** six globals survive the toggle:
- `coordinate` — active bimba coordinate
- `lens` — `MathemeLensMode.lens`
- `mode` — `MathemeLensMode.mode`
- `profileGeneration` — kernel-bridge profile generation counter
- `sessionKey` — OmniPanel session
- `dayNow` — `Idea/Empty/Present/{day_id}/` anchor

Additionally: active OmniPanel tab + active activity-bar mode persist. The `BimbaPratibimbaUiState` type (Tranche 15.7) is the typed contract.

**Composition seam at toggle:**
- The cosmic K² torus and the personal psychoid field are **the same Cl(4,2) algebra at different scales**. The lemniscate transition renders the topological fact that K² (cosmic) and the personal Hopf-linked tori (personal) are duals across the inversion `#`.
- Audio continues uninterrupted across the toggle — same `audio_octet[8]` is heard; only the visual changes.

### 7.2 4-5-0 ↔ OmniPanel boundary — separation of concerns

The OmniPanel hosts the **agentic** content (Tranche 15.2):
- Pi Chat
- Sessions
- Dispatch Trace (Pi → Anima → subagent invocation tree)
- Tool Stream
- Evidence
- Review (the review surface for things that need a tab, *separate from* the in-editor `EpiiReviewPanel` that auto-summons on inbox growth here)
- Gateway
- Diagnostics

The 4-5-0 plugin hosts the **personal stratum composition surface** in the editor area. **No overlap.** Specifically:

- The **dispatch trace** for an active Logos Atelier scent-following lives in OmniPanel Dispatch Trace tab; the **scent-trail visualisation** in the plugin's atelier drawer is a different rendering (polyline trace through etymology, not subagent dispatch tree)
- The **review inbox** is mirrored: count in plugin's EpiiReviewPanel chrome; full inbox list in OmniPanel Review tab. The plugin shows only the auto-summon inbox preview, never the full deep DTO bodies (those go through the OmniPanel)
- **Pi conversation** is OmniPanel only; the plugin does not render Pi voice. (Aletheia subagent invocation traces likewise live in OmniPanel)
- **Forbidden in the 4-5-0 plugin's editor area:** anything that belongs in OmniPanel. Spec-patch §7 below requires the M5'-SPEC and UX §10 to make this explicit.

### 7.3 4-5-0 ↔ M4-nara extension — protected-local source-of-truth

The `m4-nara` extension at `Body/M/epi-theia/extensions/m4-nara/` owns:
- DayContainer creation/read (`createNaraArtifact`, `readNaraDayContainer`)
- Artifact envelopes (privacy-classed)
- Graphiti episode envelope creation
- Per-artifact resonance indicator rendering (Wave-A Tranche 5.1)
- Deep psychoid field rendering (the IDE-deep `m4-nara` view per Tranche 15.x)

The 4-5-0 plugin **consumes** the m4-nara surface via:
- `M4NaraSurface.daySummary` for the day header
- `M4NaraSurface.artifactTree` for the journal scroll (handle-only rows)
- `MathemeHarmonicProfileBoundary.payload.m4NaraDayContainer` (when populated per `nara-surface.ts:241`) for current-day binding

The plugin **never** mutates m4-nara state. The journal scroll's "create journal entry" action route through `m4-nara`'s `createNaraArtifact` API on a consent-gated path (deep action `open-nara-dialogue` per `jiva-siva-fields.ts:131`).

### 7.4 4-5-0 ↔ M5-epii extension — review-core consumption

The `m5-epii` extension at `Body/M/epi-theia/extensions/m5-epii/` owns:
- `S5ReviewSnapshot` source-of-truth (`epii-surface.ts:114-120`)
- `DryRunPromotionPlan` (`epii-surface.ts:86-95`)
- `VakEvidenceDeposit` (`epii-surface.ts:97-112`)
- The deep Epii dialogue / agentic surface (per UX §2.4)

The 4-5-0 plugin **consumes**:
- `review_queue_count` (number only; no DTO bodies)
- `continuity_handle`
- `last_canon_recognition_event`
- The full S5ReviewSnapshot is fetched only when EpiiReviewPanel is summoned, via the m5-epii extension's exported surface — and even then only handles/summaries/categories render; bodies stay protected.

### 7.5 4-5-0 ↔ M0-anuttara extension — backdrop consumption

The `m0-anuttara` extension owns:
- The full bimba graph viewer
- Coordinate Tree (activity-bar)
- Canon Studio editing
- The M0' total-shape rendering

The 4-5-0 plugin **consumes**:
- `gds_clusters` (overlay only; gated by IOD-07)
- `m0_coordinate_provenance` (lit path)
- `bedrock_link` (the M4 anchor)

Cross-reference: [`M0-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md) for full M0' contract.

### 7.6 4-5-0 ↔ S3 governed-route boundary (M0-5' Möbius write-back)

The M0-5' Möbius write-back is **the only path** by which a reviewed personal-side recognition becomes a canon-side M0 graph update. Per UX §13.5:

```
Nara lives event → Q_activity perturbation
  → M4-3 PatternPacket → M4.5 teaching/review threshold
  → Epii (M5) review:  proposed → reviewed → accepted | rejected → applied
  → crystallises into an Epii surface (gnostic packet / worldview / etymology)
  → governed write-back through Epii + Anuttara verification → canon in M0
  → renewed ground feeds back to M4-0 identity-evidence and #4.4.4.4
```

The write-back path:
1. M5-4 review (in EpiiReviewPanel or OmniPanel Review tab) → `DryRunPromotionPlan` produced
2. Anuttara M0-side verification on the dry-run
3. On `humanRequired: true` review path: human approval gate
4. Promotion applied → S3 `graphiti-runtime` write (`nara_insert_relation` extension per Wave-A Tranche 5.3) + Bimba `:Bimba` node update via S2
5. `last_canon_recognition_event` fires with `write_back_state: Applied`
6. The 4-5-0 plugin renders the §5.5 lemniscate completion

**Forbidden:** any direct write from this plugin to the M0 graph. Every write goes via the review → dry-run → governed-promote path.

### 7.7 4-5-0 ↔ Pi/Anima/Aletheia subagent boundary

Per the user invariants: Pi is the agent harness; Anima is main dispatcher; six Aletheia subagents (including the Logos Atelier specialist for M5-5 scent-following). 

The 4-5-0 plugin **does not host** Pi/Anima/Aletheia conversation. It **emits requests** through the OmniPanel (the `/` operator membrane):
- "Run Logos Atelier scent-following on this journal-derived term" → dispatched via Anima → Logos Atelier specialist → results emit as a `canon_recognition_stream` event on the profile bus → plugin renders the lemniscate
- "Explain my resonance" → dispatched via Anima → results render in plugin's "explain panel" (read from profile bus, not direct Pi chat)

The plugin **NEVER** opens a chat window in its editor area. Conversations live in OmniPanel.

### 7.8 Anti-overlap with M1-2 (cosmic side)

The M1-2 played-torus is the cosmic foreground; the 4-5-0 psychoid field is the personal foreground. They occupy the same editor real estate **alternately** via the 0/1 toggle, not simultaneously. The only shared substrate is the `MathemeHarmonicProfile` and the Cl(4,2) `quaternion.rs` algebra; no rendering surfaces conflict.

### 7.9 Anti-overlap with M3 (Mahamaya)

The M3 codon-rotation belongs to the cosmic side (1-2-3). The personal side consumes M3 only via `NaraScalarRef.refKind === 'm3-codon'` in journal cards (handle only), and via `mahamaya_transcription` data in M4-3 PatternPackets (per UX §3.5). **No M3 wheel rendering** in the 4-5-0 surface; that lives in `m3-mahamaya` extension and in the cosmic 1-2-3 composition.

---

## 8. IDE Integration (Theia / `plugin-integrated-4-5-0`)

### 8.1 Extension placement

- **Existing extension:** `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/`
- **Package:** `@pratibimba/plugin-integrated-4-5-0` per `package.json`
- **Composition contract source:** `contracts/08-t0-composition-contract-preflight.json` (referenced by `src/common/index.ts:1`)
- **ARCHITECTURE.md scaffold:** to be written at `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/ARCHITECTURE.md` per §B deliverable (this document's IDE-mirror)
- **Composition coordinator:** `CompositionCoordinator` from `@pratibimba/integrated-composition` (`widget.tsx:41-43`)
- **Consent gate:** `ConsentGate` instance (`widget.tsx:44`)

### 8.2 Surface placement in the IDE

- **Personal-side of `daily-0-1`** (Tranche 15.4): the 4-5-0 composition is the editor-area centrepiece when the user is on the personal side of the cosmic/personal toggle. The trajectory-point + psychoid field is the default focus.
- **NOT in `ide-deep` Mn views:** the 4-5-0 composition is a `daily-0-1` surface. In `ide-deep`, the user opens the dedicated `m4-nara` extension (or `m5-epii`, or `m0-anuttara`) for single-pole deep engagement.
- **NOT in OmniPanel:** the right-sidebar OmniPanel hosts Pi/Anima/dispatch/tool-stream/review/gateway/diagnostics. No 4-5-0 visualisation in OmniPanel.
- **Activity-bar:** the activity-bar (left sidebar) hosts Coordinate Tree, Bimba Graph Viewer (solar-anchor view in `daily-0-1`), Canon Studio. None of these are *inside* the 4-5-0 plugin's editor area.

### 8.3 Profile-tick clock — kernel-bridge subscription

The widget subscribes via `this.bridge.onProfile(profile => ...)` at `widget.tsx:64-67`. Every profile tick re-renders the widget. No local clock; no animation-frame-count fallback. Per Tranche 15.6, the kernel-bridge profile-tick event IS the UI clock.

### 8.4 Provenance inline rendering (Tranche 15.6)

When required payload fields are missing, the plugin renders the `IntegratedEmptyState` view (`widget.tsx:140-148`) showing **which contributor fields are missing and which owner-track is responsible** (`jiva-siva-fields.ts:37-50`). This is the named provenance contract: every pending field shows its owner.

When the psychoid field is missing (pre-Tranche 5.5 of Wave-A), the foreground renders the **deterministic lower-fidelity Option-S** version per `renderProtectedPersonalField:333-336` — and shows `readinessLabel: 'Lower-fidelity deterministic renderer; physics engine pending S2/S3 authority'` inline.

### 8.5 Bimba/Pratibimba state persistence

Per §7.1 and Tranche 15.7: state survives the toggle and the layout switch. The 4-5-0 plugin specifically persists:
- Active artifact selection (card the user was reading)
- Active Logos Atelier scent-trail position
- EpiiReviewPanel state (open/closed/summoned)
- Active activity-bar selection where it exists in both layouts

### 8.6 Accessibility — pause/scrub + protected-local guards

- **Pause:** the user can pause profile-tick advance for accessibility / slow inspection (Tranche 15.9)
- **Scrub:** scrubbing to a prior tick replays the deterministic state at `(tick12, degree720, lens_mode, resonance)` — for the personal field, scrubbing also re-evaluates `Q_composed` at the past kerykeion_current tick
- **Protected-local guards:** scrubbing **does not** unlock past raw bodies. The protected-local boundary is time-invariant; scrubbing replays the handles, not the data.

### 8.7 Empty-state and readiness behaviour

When required contributors (`m4-nara`, `m5-epii`, `m0-anuttara`) are not all present (`widget.tsx:128-148`):
- The widget renders `IntegratedEmptyState` with the aggregate readiness from `CompositionCoordinator.aggregateReadiness`
- Per Tranche 15.6, each missing contributor names its readiness blocker inline
- The widget does NOT silently degrade to a partial composition; if any leg is missing, the composition refuses to render

---

## 9. Anti-Greenfield Audit

### 9.1 Landed in code (consume, do not re-invent)

| Asset | Location |
|---|---|
| `PersonalIdentityProfile` + `from_kerykeion_json` / `from_natal_chart` constructors | `Body/S/S0/portal-core/src/personal_identity.rs:101-141` |
| `PersonalResonance::from_quaternions` + threshold + ConjugateFormCharacter | `personal_identity.rs:143-175, 9` |
| `compose_personal_quaternion` (`Q_composed = Q_identity · Q_transit · Q_activity`) | `personal_identity.rs:177-186` |
| Resonance wired to `MathemeHarmonicProfile.resonance` | `Body/S/S0/portal-core/src/kernel.rs:486-488` |
| Kerykeion natal CLI path | `Body/S/S0/epi-cli/src/nara/wind.rs:117-148` |
| 10-planet keplerian velocity LUT (Earth-as-10th) | `personal_identity.rs:13-15` |
| `NaraDayContainer` + `NaraArtifactEnvelope` + privacy-classed envelopes | `Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts:33-74` |
| `dayContainerPath` = `${VAULT}/Pratibimba/Nara/{dayId}/` (DR-M4-1 resolved) | `nara-surface.ts:415-417` |
| `renderProtectedPersonalField` handle-only | `nara-surface.ts:322-349` |
| `buildS2CanonicalProjection`/`buildPublicProfilePayload`/`buildSpaceTimeRows` — protected-local enforced | `nara-surface.ts:287-320` |
| `S5ReviewSnapshot` + review-core types | `Body/M/epi-theia/extensions/m5-epii/src/common/epii-surface.ts:48-120` |
| `EpiiReviewSurfaceState` + close/summon helpers | `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/plugin-integrated-4-5-0-widget.tsx:48-98` |
| `JivaSivaPaneAvailability` checker + field-owner tracks | `Body/M/epi-theia/extensions/integrated-composition/src/common/jiva-siva-fields.ts:1-135` |
| `ConsentGate` enforcement at deep-open | `plugin-integrated-4-5-0-widget.tsx:112-125` |
| `JivaSivaPanes` no-local-tables / no-raw-bodies discipline | `plugin-integrated-4-5-0/src/browser/jiva-siva-panes.tsx:1-212` |
| Graphiti runtime with `"protected-local-episodic-memory"` boundary | `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` + `Body/S/S3/graphiti-runtime/src/lib.rs:132` |
| Cl(4,2) quaternion ops (shared by personal pole and cosmic codon pole) | `Body/S/S0/portal-core/src/quaternion.rs` |
| `MathemeHarmonicProfile` + `MathemeResonance72Projection` + `lens_mode` | `kernel.rs:346-465` |

### 9.2 Pending (cycle-3 deliverables — named, classified, NOT proposed for greenfield rebuild)

| Tranche | Closure |
|---|---|
| Wave-A Tranche 5.1 | Resonance + ConjugateFormCharacter indicator rendering on Nara surface (per-artifact) |
| Wave-A Tranche 5.3 | Graphiti runtime Nara relations insertion API (`:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC`) |
| Wave-A Tranche 5.4 | `(q_b, q_p)` bimba/pratibimba decomposition of `Q_composed` per M4'-SPEC §7.3a |
| Wave-A Tranche 5.5 | Psychoid-Cymatic Field Solver + handle (Option-F-vs-Option-S decision) → `psychoid_field` profile field per §4.3.1 |
| Wave-A Tranche 5.6 | M4-0 birthdate encoding + six-layer identity branch (`q_personal` Kerykeion-only vs integrated `q_Nara` per DR-M4-2) |
| Wave-A Tranche 5.7 | `q_personal` baseline decision and axis lock (DR-M4-2) |
| Wave-A Tranche 5.8 | Period reading trajectory reconstruction |
| Wave-A Tranche 5.9 | Identity-augment proposal lifecycle adapter (M5-4 review gate consumer) |
| Wave-A Tranche 5.10 | Connectivity-vs-bounded-access discriminator (M4'-SPEC §8) |
| Tranche 10.10 | `ananda_vortex` profile field (consumed when canon-recognition touches an M1-2 cell — links the 4-5-0 surface to the 1-2-3 cosmic side at the seam) |
| Profile-bus addition §4.3.1 | `psychoid_field: PsychoidFieldProjection` |
| Profile-bus addition §4.3.2 | `canon_recognition_stream: CanonRecognitionEvent` (rich) |
| Profile-bus addition §4.3.3 | Promote `personal_resonance_score` + `personal_resonance_form_character` to `JivaSivaFieldName` enum |
| Tranche 15.2 closure | OmniPanel as agentic membrane (consolidates Pi/Anima/dispatch/tool-stream — clears overlap with this plugin) |

### 9.3 Net-new (M' product surface — anti-greenfield exception)

| Asset | Justification |
|---|---|
| **Psychoid field foreground rendering** (3D, Hopf-linked tori at personal scale) | Named in M4'-SPEC §10 + UX §6.4; substrate solver pending Tranche 5.5; the rendering layer itself is M' product surface and first-build is allowed |
| **Lemniscate sweep animation primitive** | The Möbius write-back signature (§5.5) — visual fact of the `(5/0)` context frame; no substrate geometry exists; renderer-side choreography |
| **Bimba city-scape backdrop** (16-fold ambient mesh) | Lower-fidelity backdrop is renderer-side; the actual graph data is M0 substrate |
| **Activity-resonance dot pulses on city-scape** | M' product surface; consumes `activity_resonance_dots` payload field |
| **EpiiReviewPanel auto-summon UX** (`widget.tsx:95-98`) | Already landed; UX choreography on top of `S5ReviewSnapshot` data |
| **Logos Atelier drawer pull-out animation** | UX choreography on top of M5-5 substrate |
| **Resonance-coloured surface tint** (gold/silver/indigo by `conjugate_form_character`) | Renderer choreography on top of landed `ConjugateFormCharacter` enum |

### 9.4 Forbidden (do not invent)

| Forbidden | Why |
|---|---|
| Local Pi/Anima/Aletheia conversation UI in the 4-5-0 plugin | OmniPanel-only per Tranche 15.2; CONTRACT §7.7 |
| Local pitch synthesis | `audio_octet[8]` is read-only window onto Vimarśa per M1-2 §7.1 |
| Local clock | kernel-bridge profile-tick is the UI clock per Tranche 15.6 |
| Local Mn.h constant fork | shared substrate Cl(4,2) algebra at `quaternion.rs` is the only source |
| Local graph relation inference | governed-route via S2/S3 only |
| Composition by juxtaposition (three side-by-side panes) | Tranche 15.4 contract rejects |
| Rendering raw quaternion components | privacy contract |
| Rendering raw journal/dream/oracle body text without consent gate | privacy contract |
| Direct write to M0 bimba graph | Möbius write-back goes via M5-4 review → governed-route only |
| Standalone ACR-style run-tree widget in this plugin | OmniPanel-only per Tranche 15.2 |
| The Mahamaya/Tarot wheel rendering | belongs to m3-mahamaya extension + 1-2-3 cosmic composition |
| Pi conversation transcript history | OmniPanel only |

---

## 10. Test Criteria

The integrated 4-5-0 plugin is acceptance-ready when:

1. `test -d Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/{common,browser}` succeeds (already passes)
2. `test -f Body/M/epi-theia/extensions/plugin-integrated-4-5-0/ARCHITECTURE.md` (after this cycle delivers §B)
3. `pnpm -C Body/M/epi-theia/extensions/plugin-integrated-4-5-0 build` succeeds
4. **Composition test:** widget renders empty-state when any contributor (`m4-nara`, `m5-epii`, `m0-anuttara`) is missing (`widget.tsx:128-148`); renders full composition when all three present
5. **Privacy test:** `pnpm -C Body/M/epi-theia/extensions/test test:jiva-siva-no-local-tables` (the test referenced at `jiva-siva-panes.tsx:11`); confirms no raw bodies, no local M4 personal field table, no identity quaternion components in rendered output
6. **Resonance-binding test:** when `MathemeHarmonicProfile.resonance` is `Some(_)`, the personal field surface tint matches `conjugate_form_character` (gold/silver/indigo)
7. **Tick choreography test:** profile-tick replay produces deterministic visual state at any `(tick12, degree720, lens_mode, resonance, conjugate_form_character)`
8. **Klein-flip test:** tick 5→6 produces brief self-interpenetration of the psychoid field; `klein_flip` bus event consumed
9. **Lemniscate test:** synthetic `canon_recognition_stream` event with `write_back_state: Applied` produces full §5.5 sequence (arc → glyph → bloom → tint shift); replay deterministic
10. **Consent-gate test:** every deep-action button (`open-graphiti-body`, `open-identity-quaternion`, `open-nara-dialogue`, `open-m4-field-deep`, `publish-shared-archetype`) is disabled until `ConsentGate.require()` succeeds (`widget.tsx:112-125`)
11. **State-persistence test:** six globals (coordinate, lens, mode, profileGeneration, sessionKey, dayNow) survive `cmd-period` toggle and `daily-0-1` ↔ `ide-deep` layout switch (Tranche 15.7)
12. **OmniPanel boundary test:** `grep -rn 'PiChat\|DispatchTrace\|ToolStream' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/` returns empty — Pi/dispatch/tool-stream do not appear in this plugin
13. **No direct M0 write test:** `grep -rn 'graphiti.*insert\|bimba.*write\|neo4j.*write' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/` returns empty
14. **Resonance-on-profile test:** when `MathemeHarmonicProfile.resonance` is `None`, the personal field renders the `pending-resonance` overlay (per Tranche 15.6); does NOT silently degrade
15. **Vimarśa-window audit:** `audio_octet`/`nodal_quartet` consumed via profile-bus subscription, not derived locally
16. **EpiiReviewPanel auto-summon test:** `setReviewInboxCount(prev + delta)` triggers summon animation with `delta > 0`; manual `setEpiiReviewMode('closed')` dismisses
17. **Cl(4,2) shared-algebra test:** verify that `quaternion.rs::quat_mul` is the only quaternion multiplication source consumed by both `personal_identity.rs::compose_personal_quaternion` AND `kernel.rs::codon_charge_quaternion` (one algebra, two scales)
18. **DayContainer path canonicality:** `grep -n "dayContainerPath" Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts` confirms `Pratibimba/Nara` path (already passing per `nara-surface.ts:415-417`; closes DR-M4-1)
19. **Privacy-class invariant:** every artifact-tree row emitted by `buildM4NaraSurface` has `bodyRendered: false`; integration test asserts this for ≥3 artifact kinds (`nara-surface.ts:498-511`)
20. **`personal_resonance` profile-field surfacing test (Wave-A Tranche 5.1 closure):** the plugin's `JivaSivaFieldName` includes `personal_resonance_score` and `personal_resonance_form_character`; field-owner-track is `Wave-A Tranche 5.1`

---

## 11. Closing — Why the 4-5-0 Surface Is the Right Place for Jiva-is-Śiva Recognition

The 4-5-0 plugin makes the central UX claim of [[nara-ux-full-m4-branch-update]] §13.3 visible as living surface:

> *The personal cymatic field (Nara's `Q_composed`, rendered/sonified at #4.4.4.4) and the canonical bimba city-scape (Anuttara, M0) share the same Cl(4,2) algebra and the same `MathemeHarmonicProfile`. The GDS activity-resonance that lights up between them makes **tat tvam asi — "that thou art" — possible to see**: the user's lived field resonating against the structure of the whole.*

The substrate already gives us the metric: `PersonalResonance::from_quaternions(q_personal, q_cosmic)` at `personal_identity.rs:151-175` is the literal `|q_personal · q_cosmic|`. The kernel wires it through (`kernel.rs:486-488`). The plugin renders it.

What this Architecture commits to:

> **M4 holds the personal field; M5 holds the paidagōgos; M0 holds the canon. The Möbius write-back is the act by which what is lived becomes what is taught. The 4-5-0 plugin is the surface where that Möbius is concretely visible — as a lemniscate sweep at every canon-recognition event, as a colour-keyed resonance tint at every tick, as a personal trajectory point gliding across the psychoid field against the canonical bimba city-scape.**

The cosmic 1-2-3 plugin shows the matheme playing as instrument. The personal 4-5-0 plugin shows the matheme **recognising itself in a lived life** — Jiva-is-Śiva not as proposition but as *daily lived recognition through reviewed, consent-gated, privacy-protected pedagogy*. The (5/0) Möbius return — the deepest mode of the QL — is finally seeable.

The bimba/pratibimba dial at this scale: M4 is bimba-of-personal (the lived); M0 is pratibimba-of-canonical (the witnessed); M5 is the inversion-act-itself (`#`) that lets either become the other. Toggling cosmic ↔ personal via `cmd-period` is the dial; the lemniscate transition shows the inversion as motion.

The privacy contract is what makes this *ethical*: every recognition lands as opaque handle, every body stays protected-local, every M0 write goes via reviewed governed-route. Jiva-is-Śiva is enacted *under M5-4 review*, never silently mutated.

---

*Companion research: [[nara-ux-full-m4-branch-update]] (UX intent), [[epii-ux-full-m5-branch]] §7 (M5 seam pole), [[anuttara-ux-full-m0-branch]] (M0 ground pole), `plan.runs/wave-a-m4-reconciliation-matrix.md` (matrix evidence). Cross-references: [`M4-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M4'/M4-ARCHITECTURE.md), [`M5-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md), [`M0-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M0'/M0-ARCHITECTURE.md), [`INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md) (the cosmic counterpart), [`M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md) (pattern exemplar).*
