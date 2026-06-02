---
coordinate: "M4'"
sub_coordinate: "M4-0 + M4-2 + M4-4 + M4-4-4-4 cross-cutting"
status: "active-canonical-structure-spec"
updated: "2026-05-31"
companion_to: "[[M4'-SPEC]]"
depends_on:
  - "[[M4'-SPEC]]"
  - "[[m4-prime-nara-activity-graphiti-instrument]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[m5-prime-system-shape-and-tauri-ide-canon]]"
  - "[[2026-04-04-graphiti-unified-temporal-context-service]]"
vendor_skills:
  - "vendors/epi-logos/skills/quaternal-tarot/SKILL.md"
  - "vendors/epi-logos/skills/quaternal-i-ching/SKILL.md"
vendor_protocols:
  - "vendors/epi-logos/resources/methods/quaternal_tarot_protocol.md"
  - "vendors/epi-logos/resources/methods/quaternal_i_ching_protocol.md"
---

# [[M4']] Nara Day-Episodes + Oracle Artifacts + Canonical File Structure

## How daily notes, oracle readings, journal entries, dream entries, agent chats, and other Nara artefacts compose into a coherent Graphiti episodic structure

**Status:** Canonical-structure spec for the Nara M4-4-4-4 protected-local content layer. Specifies the file-system layout, the day-as-episode architecture, the per-artifact Graphiti episode shape, and the integration of the Quaternal Tarot and Quaternal I-Ching oracle systems from `vendors/epi-logos/skills/`.

**Reading order:** Read after `M4'-SPEC.md`, `m4-prime-nara-activity-graphiti-instrument.md` (the canonical M4 branch + activity-event envelope), `m4-prime-psychoid-cymatic-field-engine.md` (especially §6.8.4.C-F + §9 temporal integration), and the Graphiti unified temporal-context-service spec at `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md`.

---

## §0 — Thesis: day-as-episode-container with NOW-stamped artifact-children

The canonical organisation of Nara content is **day-as-episode-container with N attached artifact-children**, where each artifact is itself a typed Graphiti sub-episode carrying:

- A **NOW timestamp** (precise moment-of-creation; the S3 Khora NOW path)
- An **activity-type classification** (what kind of activity generated this artifact: oracle cast, journal entry, dream entry, agent chat, personal note, reminder, LLM task, etc.)
- A **provenance trace** (which skill / agent / system path produced it)
- A **privacy class** (protected-local-body / protected-local-derived / public-current-context per the canonical privacy taxonomy)
- A **bimba coordinate reference** (where in the canonical M-coordinate structure this artifact's symbolic content lives, for cross-reference without canonical-graph leakage)
- A **link to the day container** (`:PART_OF_DAY` relationship)
- A **link to PersonalNexus at #4.4.4.4** (`:HAS_EPISODE` per the existing Graphiti spec)

This structure does three things:

1. **Honours the lived rhythm of a day** — the user has a daily-note as the day's frame, with discrete artefacts emerging at specific NOWs throughout. The day-container makes this temporal-coherence explicit (a day is a thing; the artefacts of a day belong to that day).
2. **Preserves artefact-specific structure** — an oracle cast carries different fields than a journal entry; a dream entry carries different metadata than an agent chat. The activity-type discriminator lets each artefact-class have its own canonical fields without forcing a one-size-fits-all envelope.
3. **Integrates cleanly with the existing Graphiti substrate** — the day-container and its artifact-children are all Graphiti episodes rooted at PersonalNexus per the existing `2026-04-04-graphiti-unified-temporal-context-service.md` spec. Bi-temporal validity (`valid_at`/`invalid_at`) works naturally; the entity-extraction layer (Graphiti's `GeminiEmbedder`) operates over the artefact bodies; Saga clusters (Community) form across days for pattern-grouping.

The Quaternal Tarot and Quaternal I-Ching protocols at `vendors/epi-logos/skills/` get their oracle-specific artifact shapes specified here (per §5), with the canonical episode-types and bimba-coordinate-cross-references that bind them to the M3 Tarot/I-Ching library and the Square C lens-readings (L2/L2'/L3/L3').

---

## §1 — The day-episode container

### §1.1 Structure

For each calendar day the user is active, one **DayContainer episode** exists at #4.4.4.4. Its properties:

```typescript
// Conceptual; real implementation in TypeScript Graphiti client + Rust types

interface DayContainer {
  // Graphiti envelope (per 2026-04-04 spec)
  episode_id: EpisodeId;                       // canonical Graphiti episode UUID
  episode_type: "DayContainer";
  group_id: QuintessenceHash;                  // PersonalNexus.quintessence_hash
  valid_at: ISO8601;                           // day-start (00:00 local)
  invalid_at: ISO8601 | null;                  // day-end (24:00 local) when day closes; null while day active
  
  // Day identity
  day_id: string;                              // YYYY-MM-DD format
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;     // Sun=0
  
  // Kairos snapshot (cosmic-state at day-start)
  kairos_at_day_start: KairosSnapshot;         // sun_degree, moon_degree, planets[10].degree, current_decan, etc.
  kairos_at_day_end?: KairosSnapshot;          // populated when day closes
  
  // Daily note reference (the day's primary written reflection)
  daily_note_path?: VaultPath;                 // file path of daily-note.md if one exists
  daily_note_episode_id?: EpisodeId;           // episode-id of the DailyNote sub-episode
  
  // Artifact aggregation
  artifact_count: number;                      // count of attached artifacts
  artifact_types: Map<ActivityKind, number>;   // breakdown by activity-type
  
  // Aggregate metadata
  total_psyche_arcs: number;                   // agent-chat sessions (Psyche (4.5/0) arc count)
  oracle_cast_count: number;
  journal_entry_count: number;
  dream_entry_count: number;
  
  // Saga participation
  saga_memberships: SagaId[];                  // Communities this day participates in (built nightly)
}
```

### §1.2 Lifecycle

- **Day-start**: when the first artifact for a new calendar day is created, the DayContainer episode is auto-created. `valid_at` = midnight of that day in user's local timezone. `kairos_at_day_start` snapshots the cosmic state from M2-5 / Kerykeion at that moment.
- **Day-active**: as artifacts are created throughout the day, they link to the existing DayContainer. `artifact_count` and `artifact_types` update incrementally.
- **Day-close**: at midnight (or on the first artifact-create of the following day, whichever comes first), the DayContainer is closed: `invalid_at` set to day-end-midnight; `kairos_at_day_end` snapshots; aggregate metadata frozen.
- **Saga-night**: after day-close, the nightly Saga-building pass examines the closed day for cross-session pattern-grouping (per existing Graphiti spec).

### §1.3 The DayContainer is NOT the daily note

Critical structural clarification: the DayContainer is the **episodic container** for the day; the daily note is **one specific artifact** within the day (typically a longer-form reflection written by the user). Many days will have a DayContainer with no daily-note (just oracle casts + agent chats + journal entries, no dedicated reflection); some days will have multiple daily-notes (morning-reflection + evening-reflection are both daily-note-type artifacts within the same day).

The `daily_note_path` and `daily_note_episode_id` fields point to the **primary** daily note if one exists; secondary daily-note artifacts are linked via the standard artifact-attachment mechanism.

---

## §2 — The artifact taxonomy (NOW-stamped individual objects)

### §2.1 The ActivityKind enum

```typescript
type ActivityKind = 
  // Oracle artifacts
  | "oracle_quaternal_tarot"
  | "oracle_quaternal_iching"
  | "oracle_other"                  // for future oracle additions
  
  // Written artifacts
  | "daily_note"
  | "journal_entry"
  | "dream_entry"
  | "personal_note"
  | "reflection"
  
  // Interactive artifacts
  | "agent_chat_episode"            // one episode within a Psyche (4.5/0) arc
  
  // Task/reminder artifacts
  | "reminder"
  | "llm_task"
  | "scheduled_task"
  
  // Contemplative artifacts
  | "vama_shakti_recognition"       // per #4.4.5 Trika lens contemplation
  | "alchemical_lens_reading"       // per L2' alchemical-lens transformational reading
  | "phenomenological_bracketing"   // per #4.4.4 phenomenological-lens work
  
  // External-source artifacts
  | "external_event"                // events surfaced from non-Nara sources (e.g., transit-boundary crossing)
  | "external_artifact"             // material the user imports (book quotes, articles, etc.)
  ;
```

Each ActivityKind has its own **canonical-fields specification** (§5 covers oracle types; §6 covers the others).

### §2.2 The common artifact envelope

All artifacts share a common envelope on top of which their type-specific fields layer:

```typescript
interface NaraArtifact {
  // Graphiti envelope
  episode_id: EpisodeId;
  episode_type: ActivityKind;                  // the specific type
  group_id: QuintessenceHash;
  valid_at: ISO8601;                           // NOW of creation
  invalid_at: ISO8601 | null;                  // null unless artifact has explicit end
  
  // Day-container linkage
  day_container_id: EpisodeId;
  day_id: string;                              // YYYY-MM-DD for convenience
  
  // NOW lineage (S3 Khora)
  now_path: NOWPath;                           // precise moment from S3 Khora
  session_key?: SessionKey;                    // gateway session if applicable
  
  // Privacy
  privacy_class: PrivacyClass;                 // protected-local-body | protected-local-derived | public-current-context
  
  // Provenance
  source_skill?: SkillName;                    // e.g., "quaternal-tarot" / "quaternal-i-ching"
  source_agent?: AgentName;                    // e.g., "nara" / "anima" / "pi" / "sophia" / "user"
  source_path?: string;                        // free-form provenance trail
  
  // Vault storage
  vault_path: VaultPath;                       // canonical file path in /Pratibimba/Nara/...
  
  // Optional bimba-coordinate references
  bimba_coordinate_refs: BimbaCoordinateRef[]; // scalar refs to canonical M-coordinates
  
  // Optional cymatic-field state at NOW
  cymatic_field_snapshot?: CymaticFieldStateRef; // pointer to cymatic-field state when artifact created
  
  // Optional Q_composed at NOW
  q_composed_at_now?: QuaternionRef;           // reference to quaternionic state when artifact created
  
  // Type-specific payload (discriminated by episode_type)
  payload: TarotPayload | IChingPayload | DailyNotePayload | JournalPayload | DreamPayload | AgentChatPayload | ...;
}
```

The `payload` field is a discriminated union; each ActivityKind has its own typed payload shape (specified in §5-§6).

### §2.3 NOW-stamping discipline

Every artifact carries a NOW timestamp at creation. The NOW path (per the canonical NOW/DAY/SESSION lineage) carries:

- `day_id`: the calendar day
- `now_path`: the precise moment (timestamp with timezone)
- `tick12`: which 1/12 of the day (0-11)
- `session_key`: if generated within a gateway session
- `cosmic_state_at_now`: snapshot of relevant cosmic-state fields (sun_decan, moon_decan, active aspects)

The NOW lineage is what makes temporal-reading protocols (per `m4-prime-psychoid-cymatic-field-engine.md` §9) possible. Period-readings aggregate artifacts by NOW-range; trajectory-rendering plots Q_composed evolution across artifact NOWs.

---

## §3 — Activity-type metadata (what generated each artifact)

### §3.1 Source-skill provenance

Per the existing skill ecosystem at `vendors/epi-logos/skills/`, artifacts are typically generated by skill-invocations:

- `quaternal-tarot` skill → produces `oracle_quaternal_tarot` artifacts
- `quaternal-i-ching` skill → produces `oracle_quaternal_iching` artifacts
- `using-epi-logos` skill → may produce `phenomenological_bracketing` artifacts when bracketing-work happens
- `converse-pedagogically` skill → may produce specialized `journal_entry` artifacts when pedagogical-conversation deposits insights
- `apply-tetralemma` skill → may produce contemplative-engagement artifacts
- `manage-thought-artifacts` skill → coordinates artifact-family management for in-session Thought work

Free-form activities (manual journal entry, dream entry, personal note) get `source_skill = null` and `source_agent = "user"`.

### §3.2 Agent-mediated artefacts

When artifacts are generated through agent-mediation:

- `source_agent = "nara"` for Nara's dialogic-voice outputs
- `source_agent = "anima"` for Anima aesthetic/voice-coherence outputs
- `source_agent = "pi"` for Pi dispatch/translation outputs
- `source_agent = "sophia"` for Sophia wisdom-curation outputs
- `source_agent = "aletheia"` for Aletheia disclosure-tracking outputs
- `source_agent = "user"` for direct user-authored content

Per the Tauri-v2 Nara UX (per `m4-prime-psychoid-cymatic-field-engine.md` §6.8.4.F), most user-facing artifacts are user-authored within the open flow space with highlight-system tagging; the highlight tag becomes the `episode_type` (and the source_agent stays as "user").

### §3.3 The activity-type drives the routing

Different activity-types route differently downstream:

- **Oracle artifacts** → may update Q_activity (the third quaternion in the M4-4-4-4 composition); contribute to autoresearch spine surfacing per the Nara-dialogic pipeline (per spine spec §3.2)
- **Journal/dream entries** → routed through M4-4-4 phenomenological parser (per cymatic field engine §6.8.4.E — Pi-agent inference); contribute archetype-tags potentially
- **Agent chats** → emit 5-episode Psyche (4.5/0) arc per session (per cymatic field engine §6.8.4.D)
- **Reminders/scheduled-tasks** → route through cron-system integration (per cymatic field engine §6.8.4.F)
- **Contemplative artifacts** → route through M4-3 mediating-transformation telemetry (per cymatic field engine §6.8.3) for (p,q) trajectory classification

The activity-type tag is therefore not just metadata for browsing — it's the routing-discriminator for downstream processing.

---

## §4 — The canonical Nara file-system layout

### §4.1 The Pratibimba namespace

Per the existing convention at `m5-prime-system-shape-and-tauri-ide-canon.md` §2.2, the `/Pratibimba/` directory carries reflection/mirror-image content — the systematic-reflection-surface of the system. Within `/Pratibimba/`, two known sub-namespaces:

- `/Pratibimba/Epii/` — Epii agent inbox content per Graphiti spec (existing)
- `/Pratibimba/Nara/` — Nara personal content per this spec (canonical home for all Nara artifacts)

The `/Self/aham/daily/` placeholder currently used by the Quaternal Tarot and Quaternal I-Ching skills migrates to `/Pratibimba/Nara/`.

### §4.2 The day-directory layout

```
${VAULT}/Pratibimba/Nara/
├── {day_id}/                            # e.g., 2026-05-31/
│   ├── daily-note.md                    # primary daily-note artifact (if exists)
│   ├── day-container.json               # the DayContainer episode envelope (machine-readable)
│   └── artifacts/
│       ├── oracle/
│       │   ├── tarot-{cast_uuid}.md     # Quaternal Tarot reading
│       │   ├── iching-{cast_uuid}.md    # Quaternal I-Ching reading
│       │   └── {cast_uuid}.json         # machine-readable artifact envelope
│       ├── journal/
│       │   ├── {HH}-{MM}-{slug}.md      # timestamped journal entries
│       │   └── ...
│       ├── dreams/
│       │   ├── {HH}-{MM}-{slug}.md      # dream entries
│       │   └── ...
│       ├── chats/
│       │   └── {session_id}/
│       │       ├── episode-ql0.md       # opening
│       │       ├── episode-ql1.md       # intention
│       │       ├── episode-ql4.md       # convergence
│       │       ├── episode-ql5.md       # bridge
│       │       └── episode-ql5'.md      # closure
│       ├── notes/
│       │   ├── {HH}-{MM}-{slug}.md      # personal notes
│       │   └── ...
│       ├── reminders/
│       │   ├── {reminder_id}.md         # reminder content + status
│       │   └── ...
│       ├── llm-tasks/
│       │   ├── {task_id}/
│       │   │   ├── input.md             # task prompt
│       │   │   └── output.md            # task result
│       │   └── ...
│       └── contemplative/
│           ├── vama-shakti-{ts}.md      # Vāma Śaktis recognition entries
│           ├── alchemical-{ts}.md       # L2' alchemical-lens readings
│           └── phenomenological-{ts}.md # bracketing/eidetic-variation work
├── meta/
│   ├── period-readings/                 # derived weekly/lunar/period readings
│   │   ├── weekly-{year}-W{week}.md
│   │   ├── lunar-{year}-L{month}.md
│   │   └── period-{user-defined}.md
│   ├── trajectories/                    # rendered Q_composed trajectory data
│   │   └── {date_range}.json
│   └── indexes/                         # searchable indexes
│       ├── by-activity-type.json
│       ├── by-bimba-coord.json
│       └── by-saga.json
├── current/                             # symlink to today's day directory
└── README.md                            # explains the Nara namespace organisation
```

### §4.3 File-format conventions

- **`.md` files** for human-readable content (the user can read/edit directly in any markdown editor including the IDE m4-nara extension)
- **`.json` files** for machine-readable envelopes (the Graphiti episode envelopes, the DayContainer metadata, the indexes)
- All `.md` files carry **frontmatter** with the artifact envelope fields (so the markdown content is self-describing; an artifact's `.md` file alone contains its full metadata):

```yaml
---
episode_id: ep_2026-05-31_T1430_8a3f...
episode_type: oracle_quaternal_tarot
group_id: 8a3f4b2c...  # quintessence_hash
valid_at: 2026-05-31T14:30:00+00:00
day_id: 2026-05-31
now_path: /Khora/now/2026/05/31/14-30-00
session_key: sess_abc123
privacy_class: protected-local-body
source_skill: quaternal-tarot
source_agent: user
vault_path: Pratibimba/Nara/2026-05-31/artifacts/oracle/tarot-cast_uuid.md
bimba_coordinate_refs:
  - "#3.5"           # M3-5 cosmic wheel
  - "#3-tarot-fool"  # M3 Tarot library Fool card
lens_refs:
  - "L2"
  - "L3"
  - "L2'"
square_basin: "C"    # Square C Logic-Process basin per Quaternal Tarot protocol
spread_scale: "torus"  # Sphere | Torus | Klein
cards_drawn: 6
moving_cards: 0
---

# Question

What is moving through this moment of decision?

# Cards Drawn

## P0 — Why (Ground)
**The Fool** (upright)
...
```

### §4.4 The `current/` symlink

For easy access, `current/` is a symlink to today's day directory. The IDE's m4-nara extension uses this for quick today-view loading; the Tauri-v2 0/1 surface uses this for the journal-entry destination.

### §4.5 The `meta/` directory

Cross-day derived content:

- **`period-readings/`** — generated by temporal-reading protocols (daily/weekly/lunar/solar-arc/period per cymatic field engine §9.4). One file per generated period-reading.
- **`trajectories/`** — Q_composed trajectory data for visualisation by the cymatic-field engine. JSON format suitable for direct render-consumption.
- **`indexes/`** — searchable indexes built nightly. The autoresearch spine's Nara-dialogic surfacing pipeline (per spine spec §3.2) reads from these for pattern-detection.

---

## §5 — Oracle artifact types (Quaternal Tarot + Quaternal I-Ching)

### §5.1 Quaternal Tarot artifact

The Quaternal Tarot protocol (per `vendors/epi-logos/skills/quaternal-tarot/SKILL.md` and `vendors/epi-logos/resources/methods/quaternal_tarot_protocol.md`) operates at Square C (L2/L2'/L3/L3') with three scales (Sphere/Torus/Klein). The canonical artifact:

```typescript
interface QuaternalTarotPayload {
  // Reading metadata
  question: string;                              // L2-0 tetralemmaic ground
  spread_scale: "sphere" | "torus" | "klein";
  square_basin: "C";                             // always Square C for this oracle
  
  // The cast
  cast_uuid: UUID;                               // unique cast identifier
  cards_drawn: CardDraw[];                       // ordered draw sequence
  
  // Positional reading (Torus/Klein scales)
  positional_reading?: {
    p0_ground: PositionReading;                  // Why
    p1_definition: PositionReading;              // What
    p2_dynamis: PositionReading;                 // How
    p3_pattern: PositionReading;                 // Who
    p4_context: PositionReading;                 // Where (lemniscate sub-reading happens here)
    p5_integration: PositionReading;             // Why-for
    p4_lemniscate_sub?: LemniscateSubReading;    // optional P4 sub-reading
  };
  
  // Night arc (Klein scale only)
  night_arc?: {
    p0_prime_through_p5_prime: PositionReading[];
  };
  
  // Complementary pair readings
  complementary_pairs: {
    p0_p5: PairReading;                          // ground-integration
    p1_p4: PairReading;                          // definition-context
    p2_p3: PairReading;                          // dynamis-pattern
  };
  
  // Three-level interpretation per card
  three_level_per_card: Map<CardPosition, ThreeLevelInterpretation>;
  
  // Lens applications
  lens_l2_tetralemma: TetralemmaReading;         // IS / IS-NOT / BOTH / NEITHER / SILENCE across whole
  lens_l3_processual: ProcessualReading;         // what is becoming
  lens_l3_prime_chronological: SeasonalReading;  // what season
  lens_l2_prime_alchemical: AlchemicalReading;   // what dissolves / what crystallises
  
  // Whole-reading synthesis
  whole_reading_synthesis: string;               // the single living utterance
  
  // Cross-references to canonical M3 Tarot library
  m3_tarot_card_refs: BimbaCoordinateRef[];      // each card maps to M3 canonical coord
  
  // Reading session metadata
  session_id?: SessionId;
  skill_version: string;                         // version of quaternal-tarot skill
}

interface CardDraw {
  card_name: string;                             // e.g., "The Fool"
  card_id: number;                               // 0-77 in standard Tarot deck
  position: CardPosition;                        // P0 | P1 | ... | P0' | ... 
  orientation: "upright" | "reversed";
  draw_index: number;                            // order in the draw sequence
  m3_codon_ref?: CodonRef;                       // cross-reference to M3 codon-quaternion if applicable
}

interface PositionReading {
  card: CardDraw;
  position_question: string;                     // Why/What/How/Who/Where/Why-for
  reading_text: string;                          // user/agent-articulated interpretation
}

interface ThreeLevelInterpretation {
  concrete: string;                              // life situation
  psychological: string;                         // consciousness
  archetypal: string;                            // deep pattern
}
```

### §5.2 Quaternal I-Ching artifact

The Quaternal I-Ching protocol (per `vendors/epi-logos/skills/quaternal-i-ching/SKILL.md` and the protocol spec) operates at Square C with native tetralemma (the four line-states), Klein twist via moving lines, nuclear hexagram as P4 lemniscate, Wu Xing/L2' elemental mapping, dual compass framework. The canonical artifact:

```typescript
interface QuaternalIChingPayload {
  // Reading metadata
  question: string;                              // L2-0 tetralemmaic ground
  scale: "trigram" | "hexagram" | "transformed" | "nuclear";
  square_basin: "C";
  
  // The cast
  cast_uuid: UUID;
  lines_cast: LineCast[];                        // 6 lines, bottom to top (or 3 for trigram scale)
  
  // Hexagram identification
  hexagram_number: number;                       // 1-64 per King Wen sequence
  hexagram_name: string;                         // e.g., "K'un / The Receptive"
  hexagram_traditional_judgement: string;
  
  // Trigram analysis
  lower_trigram: TrigramReading;
  upper_trigram: TrigramReading;
  trigram_compass_reading: {
    early_heaven_fu_xi: CompassReading;          // Name-of-Power reading
    later_heaven_king_wen: CompassReading;       // Power-to-Name reading
  };
  wu_xing_interactions: WuXingReading;
  
  // Line readings (P0/Truth through P5/Image)
  positional_reading: {
    p0_truth: LineReading;                       // line 1 (bottom)
    p1_mind: LineReading;                        // line 2
    p2_word: LineReading;                        // line 3
    p3_logos: LineReading;                       // line 4
    p4_son: LineReading;                         // line 5
    p5_image: LineReading;                       // line 6 (top)
  };
  
  // Complementary pair readings
  complementary_pairs: {
    lines_1_6: PairReading;                      // Square A (Truth-Image)
    lines_2_5: PairReading;                      // Square B (Mind-Son)
    lines_3_4: PairReading;                      // Square C (Word-Logos)
  };
  
  // Moving lines
  moving_lines: MovingLineReading[];             // each line in old-yang or old-yin state
  
  // Transformed hexagram (Klein face)
  transformed_hexagram?: {
    hexagram_number: number;
    hexagram_name: string;
    day_night_relationship: string;              // Day=what IS; Night=what becoming
  };
  
  // Nuclear hexagram (P4 lemniscate)
  nuclear_hexagram?: {
    hexagram_number: number;
    hexagram_name: string;
    inner_structure_reading: string;
  };
  
  // Lens applications
  lens_l2_tetralemma: TetralemmaReading;
  lens_l3_processual: ProcessualReading;
  lens_l3_prime_chronological: SeasonalReading;
  lens_l2_prime_wu_xing_alchemical: WuXingAlchemicalReading;
  
  // Whole-reading synthesis
  whole_reading_synthesis: string;
  
  // Cross-references to canonical M3 I-Ching library
  m3_hexagram_ref: BimbaCoordinateRef;           // primary hexagram
  m3_transformed_ref?: BimbaCoordinateRef;
  m3_nuclear_ref?: BimbaCoordinateRef;
  m3_codon_quaternion_refs: CodonRef[];          // per-line codon-quaternion mappings
  
  // Reading session metadata
  session_id?: SessionId;
  skill_version: string;
}

interface LineCast {
  line_position: 1 | 2 | 3 | 4 | 5 | 6;          // bottom = 1
  state: "young_yang" | "young_yin" | "old_yang" | "old_yin"; // tetralemma native
  iching_value: 6 | 7 | 8 | 9;                   // old_yin=6, young_yin=7, young_yang=8, old_yang=9 (M3 nucleotide-iching mapping)
  is_moving: boolean;                            // old_yin or old_yang
}

interface LineReading {
  line: LineCast;
  traditional_line_text: string;                 // from canonical I-Ching commentary
  qua-positional_reading: string;                // QL P-position interpretive layer
  three_level: ThreeLevelInterpretation;
}
```

### §5.3 The cross-reference to canonical M3 Tarot/I-Ching library

Both oracle artifacts cross-reference the canonical M3 library at S2 Neo4j via scalar `bimba_coordinate_ref` properties:

- **Tarot**: each card maps to a canonical M3 Tarot coordinate (per `M3'-SPEC` §8.7 — 56 Minor Arcana + 22 Major Arcana + 2 Transcendent = 80 Tarot quaternion-points). The artifact carries `m3_tarot_card_refs: BimbaCoordinateRef[]` with one ref per drawn card.
- **I-Ching**: hexagrams map to canonical M3 hexagram coordinates (per `M3'-SPEC` §8.1 — 64 hexagrams as 64 codon-quaternions). The artifact carries `m3_hexagram_ref` for the primary, plus `m3_transformed_ref` and `m3_nuclear_ref` for derived hexagrams. Per-line, `m3_codon_quaternion_refs` carries the line-by-line codon-quaternion mappings.

These cross-references are **scalar properties on the artifact episode**, not graph-edges into the canonical bimba-map namespace. This preserves the privacy boundary (the artifact stays in `protected-local-body` at #4.4.4.4) while making M3-canonical-content retrievable when the user invokes a deeper exploration of the oracle reading.

### §5.4 The lens-application layer

Both oracle types apply L2/L3/L3'/L2' lens-readings to the whole-reading. These map to the canonical Lens family at S2 Neo4j:

- `L2` (Tetralemma) is native to both oracles (Square C basin)
- `L3` (Processual) tracks becoming
- `L3'` (Chronological) tracks seasonal timing
- `L2'` (Alchemical) tracks dissolve/crystallise (in Tarot) or Wu Xing transformations (in I-Ching)

Each lens-reading is its own typed sub-payload (`TetralemmaReading`, `ProcessualReading`, etc.) carrying the lens-specific interpretive structure. These integrate with the M2-1 MEF lens system at the canonical level.

### §5.5 Updating `Q_activity` from oracle casts

Per `m4-prime-nara-activity-graphiti-instrument.md`, oracle casts can update the third quaternion in the three-quaternion composition at M4-4-4-4:

```
Q_composed(t) = normalize(Q_identity · Q_transit · Q_activity)
```

When an oracle artifact is created with `state_effect: UpdateActivityQuaternion{decay, weight}`, the oracle's archetypal-charge derives a quaternion contribution that updates `Q_activity` with explicit decay (so the oracle's influence fades over time unless re-cast). The decay is parameterised per oracle-type:

- Tarot Sphere: decay over ~hours (single-card bearing fades quickly)
- Tarot Torus: decay over ~24h (full reading carries through a day)
- Tarot Klein: decay over ~3 days (full Day+Night Klein reading carries through multi-day phase)
- I-Ching Hexagram: decay over ~3-7 days (depending on movement complexity)
- I-Ching with moving lines: decay over ~7-14 days (transformation arc)

The decay parameters are part of the artifact's payload (`Q_activity_decay_hours`) and can be overridden by user or agent at cast-time.

---

## §6 — Other artifact types

### §6.1 DailyNote payload

```typescript
interface DailyNotePayload {
  content: string;                                 // the daily-note's body (markdown)
  note_position: "primary" | "morning" | "evening" | "addendum"; // which role within the day
  reflection_themes: string[];                     // user/parser-extracted themes
  archetype_tags: ArchetypeTag[];                  // parser-extracted archetypal tags (per cymatic field engine §6.8.4.E)
  body_zone_tags: BodyZoneTag[];                   // somatic references
  elemental_signature_derived: ElementalSignature; // derived from parser
}
```

### §6.2 JournalEntry payload

```typescript
interface JournalEntryPayload {
  content: string;
  title?: string;
  highlight_tags: HighlightTag[];                  // user-applied tags from highlight-system per cymatic field engine §6.8.4.F
  parser_extracted: {
    archetype_tags: ArchetypeTag[];
    elemental_fwea: ElementalVector;
    nucleotide_atcg: NucleotideVector;
    confidence: number;
  };
  spans: ContentSpan[];                            // span-bearing per cymatic field engine §6.8.4.E
}
```

### §6.3 DreamEntry payload

Dreams carry higher archetypal density; the dream flag triggers parser-specific routing (per cymatic field engine §6.8.4.D):

```typescript
interface DreamEntryPayload {
  dream_narrative: string;
  recall_quality: "vivid" | "fragmentary" | "vague";
  recurring_motifs: string[];                      // user-identified recurring elements
  parser_extracted: {
    dream_symbols: DreamSymbolExtraction[];         // higher-density extraction for dreams
    archetype_tags: ArchetypeTag[];
    bimba_routing: BimbaSymbolRouting[];            // proposed routing to M3/M2/M1 per symbol → coord
  };
  emotional_register: EmotionalRegisterAnnotation;
  potential_oracle_connection?: OracleConnectionHint; // if dream-symbol matches recent oracle-cast content
}
```

### §6.4 AgentChat payload (one episode within Psyche arc)

Per cymatic field engine §6.8.4.D, agent-chats emit 5 typed episodes per Psyche (4.5/0) arc:

```typescript
interface AgentChatEpisodePayload {
  arc_session_id: SessionId;                       // the Psyche arc this episode belongs to
  ql_position: "ql0" | "ql1" | "ql4" | "ql5" | "ql5_prime";
  ql_role: "opening" | "intention" | "convergence" | "bridge" | "closure";
  exchange_content: ExchangeTurn[];                // ordered user/agent turns
  insights_surfaced: string[];                     // explicit insights named
  candidate_curiosities: CuriosityHint[];          // per cymatic field engine §6.8.4.D — Sophia surfacing
  agent_signature: AgentName;                      // which agent led this episode
}
```

The 5 episodes of one chat session share the `arc_session_id` and link to each other via `:NEXT_IN_ARC` relationships in Graphiti.

### §6.5 Reminder payload

```typescript
interface ReminderPayload {
  reminder_text: string;
  scheduled_for: ISO8601;
  recurrence?: CronExpression;                     // for recurring reminders
  category: "personal" | "spiritual-practice" | "task" | "appointment";
  status: "pending" | "fired" | "acknowledged" | "deferred" | "cancelled";
  cron_integration_id?: string;                    // ID in mcp__scheduled-tasks cron system
  origin_artifact_id?: EpisodeId;                  // if reminder was set from another artifact (e.g., a journal entry)
}
```

### §6.6 LLMTask payload

```typescript
interface LLMTaskPayload {
  task_prompt: string;
  task_output: string;
  pi_agent_model_selected: string;                 // which model Pi chose (local/api/headless)
  privacy_compliance: "local-only" | "consented-api" | "headless-gateway";
  execution_metadata: {
    started_at: ISO8601;
    completed_at: ISO8601;
    tokens_used?: number;
    cost?: number;
  };
  result_routing: "back-to-user" | "graphiti-deposit" | "epii-review-inbox" | "vault-write";
}
```

### §6.7 Contemplative artifact payloads

```typescript
interface VamaShaktiRecognitionPayload {
  triggering_artifact_id?: EpisodeId;              // the artifact that triggered recognition
  recognised_shakti: "vama" | "khecari" | "gocari" | "dikcari" | "bhucari" | "vamesvari";
  recognised_position: 0 | 1 | 2 | 3 | 4 | 5;
  unawake_or_awake: "unawake" | "awake" | "transitioning";
  contemplative_note: string;                      // user's contemplative reflection
  agent_offering?: string;                         // Sophia/Anima offered the recognition
  user_accepted: boolean;                          // did the user take up the offering
}

interface AlchemicalLensReadingPayload {
  triggering_artifact_id?: EpisodeId;
  active_operation: "solve" | "coagula" | "separatio" | "conjunctio" | "calcinatio" | "putrefactio" | "distillatio" | "fermentatio" | "multiplicatio" | "projectio" | "sublimatio";
  contemplative_note: string;
  agent_offering?: string;
  user_accepted: boolean;
}

interface PhenomenologicalBracketingPayload {
  bracketing_target: string;                       // what is being bracketed
  method: "epoche" | "eidetic_variation" | "horizonal_analysis" | "intersubjective_validation";
  pre_categorical_observation: string;             // #4.4.4.0 layer
  observed_emergence?: string;                     // what emerged in the bracketing
}
```

These contemplative-artifact types are surfaced by agent-offering (Nara/Anima/Sophia per cymatic field engine §6.8.4) and accepted-or-declined by the user; they're never auto-generated.

---

## §7 — Graphiti integration

### §7.1 The episode graph topology

```
                  Bimba {coordinate: "#4"}              ← canonical Bimba namespace
                          ▲
                          │ :BEDROCK (single canonical edge)
                          │
                  Pratibimba:PersonalNexus              ← root at #4.4.4.4
                          │
                          │ :HAS_DAY
                          ▼
                  Pratibimba:DayContainer                ← one per active day
                          │
                ┌─────────┼─────────┬─────────┬───────────┬───────────┐
                │ :CONTAINS_DAILY_NOTE        :PART_OF_DAY            │
                ▼         │         ▼         ▼         ▼           ▼
              DailyNote   │      Oracle    Journal    Dream     AgentChat
              Episode     │      Cast      Entry      Entry     Episode
                          │      Episode   Episode    Episode   (one per ql_position)
                          │                              :NEXT_IN_ARC
                          │                              ↓
                          ▼                          (next episode)
                  [other artifact-children]
                  
                  Each artifact has :HAS_EPISODE from PersonalNexus too
                  (per existing Graphiti spec — preserves canonical episode-chain)
                  
                  Each artifact body extracts Entity nodes via
                  Graphiti's GeminiEmbedder (auto-extraction)
                  with :KNOWS from PersonalNexus and :RELATES_TO
                  between entities with valid_at/invalid_at temporal bounds
                  
                  Sagas (Community clusters) built nightly across
                  DayContainer + Artifact graph for cross-session
                  pattern grouping
```

### §7.2 The new relationship types

The existing Graphiti spec defines `:HAS_EPISODE`, `:KNOWS`, `:RELATES_TO`. This spec adds:

- **`:HAS_DAY`**: from PersonalNexus to DayContainer (one per active day)
- **`:CONTAINS_DAILY_NOTE`**: from DayContainer to primary DailyNote episode (one per day if exists)
- **`:PART_OF_DAY`**: from any artifact-child to its DayContainer
- **`:NEXT_IN_ARC`**: from one AgentChat episode to the next within a Psyche (4.5/0) arc

All four are typed Cypher relationships in the Pratibimba namespace at S2 Neo4j (within Graphiti's storage backend).

### §7.3 The day-close trigger

When a day closes (at midnight or on next day's first artifact-create), a cron-scheduled task:

1. Finalises DayContainer episode (sets `invalid_at` = day-end-midnight; captures `kairos_at_day_end`; freezes aggregate metadata)
2. Triggers nightly Saga-building pass over the closed day (per existing Graphiti spec — `:Community` clusters)
3. Triggers period-reading generation if any user-configured period boundary closes today (e.g., end-of-week triggers weekly-reading generation)
4. Updates `meta/indexes/` files for fast cross-day querying

### §7.4 The Q_composed trajectory

The day-container's artifact-children timeseries gives the user's Q_composed trajectory through the day. The cymatic-field engine's trajectory rendering (per `m4-prime-psychoid-cymatic-field-engine.md` §9.5) computes this as:

- Sort artifacts by `valid_at` (NOW timestamp)
- For each artifact's NOW: reconstruct Q_composed(NOW) from Q_identity + Q_transit(NOW) + Q_activity(NOW with decay from prior artifacts)
- Plot the Q_composed sequence as a trajectory through S³
- Hopf-project to S² for visualization
- Classify the trajectory's (p,q) torus-knot character (per cymatic field engine §1.C)

Period-readings extend this to multi-day trajectories with corresponding (p,q) classifications.

---

## §8 — The DailyNote ↔ Artifacts relationship (graph topology specifics)

### §8.1 The hub-and-spoke structure

Each DayContainer is a hub; its artifact-children are spokes. The DailyNote (if exists) is a special spoke — distinguished by `:CONTAINS_DAILY_NOTE` rather than just `:PART_OF_DAY`. This privileged-spoke relationship lets queries efficiently retrieve the day's primary written reflection without scanning all artifacts.

When the user has multiple daily-note-type artifacts in one day (e.g., morning-reflection + evening-reflection), only ONE is marked as `:CONTAINS_DAILY_NOTE` (the primary); the others are `:PART_OF_DAY` with `note_position` field discriminating their role.

### §8.2 Cross-day linking

Artifacts can reference other artifacts via:

- **`:REFERENCES_ARTIFACT`**: from one artifact to another (e.g., today's reflection references yesterday's oracle cast)
- **`:CONTINUES_THREAD`**: from one artifact to a prior artifact in an ongoing contemplative thread (e.g., a multi-day dream-symbol exploration)
- **`:RESPONDS_TO`**: from an artifact to a triggering artifact (e.g., a journal entry written in response to an agent's prompt)

These cross-day links don't violate the day-container structure — they're additional metadata-edges over and above the daily hub-spoke structure.

### §8.3 Saga participation

Per existing Graphiti spec, Sagas (Community clusters) are built nightly via Graphiti's community-detection. Saga membership is `:MEMBER_OF_SAGA` relationships from artifacts to `:Community` nodes. DayContainers don't directly belong to Sagas; their artifact-children do.

A typical Saga forms around a sustained theme (e.g., a 2-week arc of dream-work + oracle-casts + journal-entries all touching the same archetypal motif). Saga participation surfaces patterns the user might not consciously have identified.

---

## §9 — Privacy classes per artifact type

### §9.1 Default privacy classes

| Activity type | Default privacy class | Rationale |
|---|---|---|
| `oracle_quaternal_tarot` | `protected-local-body` | Oracle interpretation carries personal-context |
| `oracle_quaternal_iching` | `protected-local-body` | Same |
| `daily_note` | `protected-local-body` | Personal reflection |
| `journal_entry` | `protected-local-body` | Personal writing |
| `dream_entry` | `protected-local-body` | Highly personal; symbolic content |
| `personal_note` | `protected-local-body` | Personal |
| `reflection` | `protected-local-body` | Personal |
| `agent_chat_episode` | `protected-local-body` | User-agent dialogue |
| `reminder` | `protected-local-derived` | Reminder text is less sensitive than personal reflection |
| `llm_task` | `protected-local-body` (input) + `protected-local-derived` (output if non-personal) | Variable |
| `scheduled_task` | `protected-local-derived` | Task-machinery |
| `vama_shakti_recognition` | `protected-local-body` | Contemplative |
| `alchemical_lens_reading` | `protected-local-body` | Contemplative |
| `phenomenological_bracketing` | `protected-local-body` | Contemplative |
| `external_event` | `public-current-context` | Originates from non-personal source |
| `external_artifact` | `public-current-context` (typically) | Imported material |

The user can override defaults per-artifact at creation time.

### §9.2 Privacy enforcement at the substrate

- **`protected-local-body`** artifacts never leave the local Pratibimba namespace. They're stored at `${VAULT}/Pratibimba/Nara/{day_id}/artifacts/...`. The Graphiti episode contains the body in the protected-local store. NO canonical-graph projection; NO API egress (Pi-agent inference for parser-work runs local-model preferentially per cymatic field engine §6.8.4.E).
- **`protected-local-derived`** artifacts (parser outputs, aggregate metrics, handle references) can be published to shared substrates as handles only. No body content. The `bimba_coordinate_ref` properties on the artifact are protected-local-derived (the references themselves, not the content they reference).
- **`public-current-context`** artifacts may be projected to SpaceTimeDB shared cosmos at S3' (per `alpha_quaternionic_integration_across_M_stack.md` §11 — `pratibimba_presence` RLS-filtered per-user; `shared_archetype_event` opt-in per-artifact).
- **`reviewed-canonical`** artifacts have been promoted through M5 Epii review (per autoresearch spine spec) and now belong to canonical content; they exit the Pratibimba/Nara namespace and enter `Idea/Bimba/Seeds/` or `Idea/Bimba/World/` per Hen residency law.

### §9.3 Opt-in publishing to shared substrates

For users who opt into the shared-archetypal-resonance layer (per `alpha_quaternionic_integration_across_M_stack.md` §11.4-§11.5), specific artifact-types can have their archetypal-tag-derivations (NOT bodies) published:

- Oracle cast → publishes the `archetype_tag` (e.g., "tarot-the-tower", "iching-hexagram-29") and the `transit_signature_geo` (Hopf-projected Q_transit at write-time)
- Dream entry → publishes derived `archetype_tag` from dream-symbol-extraction (if user opts in per-entry)
- Journal entry → similar opt-in mechanism

The opt-in is per-artifact, gated by user-explicit consent. The `daily_identity_hash` (BLAKE3 of canonical `q_Nara · day_key_quaternion` per §11.4 quaternionic identity signature) is what's shared; the user's identity stays unrevealed.

---

## §10 — How Tauri-v2 0/1 surface and m4-nara IDE extension consume this

### §10.1 The 0/1 free-flow surface

Per `m5-prime-system-shape-and-tauri-ide-canon.md` §3.2, the 0/1 surface carries the lightweight daily-use Nara register:

- **Journal entry creation**: typing in the open flow space + applying highlight tags creates JournalEntry artifacts directly in `/Pratibimba/Nara/{today}/artifacts/journal/`
- **Highlight tags route**: tagging text as `dream` creates a DreamEntry artifact (in `dreams/` subdirectory); tagging as `oracle` invokes the relevant Quaternal-Tarot or Quaternal-I-Ching skill; tagging as `reminder` creates a Reminder artifact with cron integration; etc.
- **Today-view display**: the 0/1 surface shows today's DayContainer aggregate (count of artifacts, recent NOW activity, current Q_composed indicator)
- **Quick agent chat**: chatting with Nara/Anima creates AgentChat episodes (the 5-episode Psyche arc)
- **Lightweight cymatic field**: per cymatic field engine §3.5, a low-resolution / opt-in-audio version of the personal cymatic field can be rendered in the 0/1 surface (without the full deep engagement of the IDE extension)

The 0/1 surface is the **daily-use entry-point** to Nara content; the user lives here day-to-day.

### §10.2 The m4-nara IDE extension (per Theia plan §6.5)

Per the Theia IDE plan §6.5, the m4-nara extension provides the **full deep render**:

- **Personal cymatic field at full quality**: the complete psychoid cymatic field engine rendering per `m4-prime-psychoid-cymatic-field-engine.md` (the full M2' cymatic engine at the personal-Pratibimba register; the Mahāmāya lens-stack as holographic backdrop; the colour-quaternion projection; the bipyramid + Hopf tori geometry)
- **Journal/flow with full Graphiti integration**: the open flow space + highlight system + full episode-browser
- **Identity inspector**: q_Nara, Q_composed, resonance metric, bioquaternion decomposition with full visualisation
- **Vāma-śakti contemplation interface**: full engagement with the recognition-vocabulary
- **Temporal-reading protocols**: daily/weekly/lunar/period readings rendered as trajectories through the psychoid field
- **Graphiti episodic browser**: full DayContainer + artifact tree browsing; cross-day Saga navigation; cross-artifact link visualization
- **Oracle reading inspectors**: dedicated UI for reviewing past Tarot/I-Ching casts; reload-and-explore; three-level interpretation viewer; lens-application breakdown

The m4-nara extension is the **deep-engagement entry-point**; the user enters here when working with Nara content at depth.

### §10.3 The shared canonical-store

Both surfaces (0/1 and m4-nara extension) read/write to the same `${VAULT}/Pratibimba/Nara/` canonical store. The kernel-bridge extension (per `m5-prime-system-shape-and-tauri-ide-canon.md` §5) provides unified access:

- Writes: both surfaces use the same write-API (probably through a `nara-vault-service` Theia/Tauri service backed by Rust)
- Reads: both surfaces subscribe to the same Graphiti episodic stream via the kernel-bridge
- Consistency: write-then-read is consistent; the nightly Saga-build and indexes update happen at the substrate level

State-changes in either surface propagate to the other through the kernel-bridge's event-bus (per kernel-bridge spec §4.4).

### §10.4 The vendor-skill invocation chain

When the user invokes the Quaternal Tarot skill (via Claude Code, Codex, or other skill-supporting agent), the chain:

1. User invokes `quaternal-tarot` skill
2. Skill executes per its protocol (questions, cards drawn, reading articulated)
3. Skill writes the resulting artifact to `/Pratibimba/Nara/{today}/artifacts/oracle/tarot-{cast_uuid}.md` with the canonical QuaternalTarotPayload frontmatter + body content
4. Skill triggers Graphiti episode creation (POST to Graphiti sidecar) with the canonical OracleCast episode-type
5. Graphiti episode links to DayContainer via `:PART_OF_DAY` and to PersonalNexus via `:HAS_EPISODE`
6. The user's 0/1 surface or m4-nara extension (whichever is open) reflects the new artifact via the kernel-bridge event-bus

The skill is responsible for writing the artifact in canonical form (per §5.1 schema); the substrate (Graphiti + kernel-bridge + surfaces) handles the rest.

---

## §11 — Implementation milestones

### Milestone 1: Vault namespace establishment

- Create `${VAULT}/Pratibimba/Nara/` namespace
- Migrate existing `/Self/aham/daily/` content to new namespace if any exists
- Set up `current/` symlink mechanism
- Create initial `README.md` documenting the namespace

### Milestone 2: Day-container substrate

- Implement DayContainer episode-creation logic
- Day-start detection (first artifact of new calendar day)
- Day-close cron task (midnight finalisation)
- DayContainer ↔ PersonalNexus `:HAS_DAY` relationship in Graphiti
- DayContainer JSON envelope at `day-container.json`

### Milestone 3: Canonical artifact-envelope implementation

- TypeScript types for `NaraArtifact` + all payload types (§2.2, §5, §6)
- Rust types matching at S0-side
- Frontmatter validator per bimba-vault-validate skill convention
- Vault-write service handling artifact creation with full envelope population

### Milestone 4: Oracle skill integration

- Update `quaternal-tarot` skill to write artifacts in canonical form (§5.1)
- Update `quaternal-i-ching` skill to write artifacts in canonical form (§5.2)
- Migrate skill log-destinations from `/Self/aham/daily/` to `/Pratibimba/Nara/{day}/artifacts/oracle/`
- Test full skill→artifact→Graphiti episode chain

### Milestone 5: Other artifact-type creation paths

- Journal entry creation from 0/1 surface highlight system
- Dream entry creation (with parser-routing per §6.3)
- Agent-chat episode emission (5-episode Psyche arc per session per §6.4)
- Reminder + LLM-task + scheduled-task creation paths
- Contemplative artifact creation (Vāma Śaktis / Alchemical / Phenomenological)

### Milestone 6: Graphiti relationship-type addition

- Implement `:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC` Cypher relationships
- Update existing Graphiti spec (`2026-04-04-graphiti-unified-temporal-context-service.md`) to include these
- Verify graph topology renders correctly in inspection tools

### Milestone 7: Period-reading generation

- Daily-reading generator (per cymatic field engine §9.4)
- Weekly-reading generator (aggregates across 7 DayContainers)
- Lunar-reading generator (28-day cycle aggregation)
- Trajectory generator (Q_composed timeseries across date range)
- Output to `meta/period-readings/` and `meta/trajectories/`

### Milestone 8: m4-nara IDE extension

- Per Theia plan §6.5 — full m4-nara extension with all primary surfaces
- DayContainer + artifact-tree browser
- Oracle-reading inspector UIs
- Per-artifact full-detail views
- Cross-artifact link navigation
- Saga browsing

### Milestone 9: 0/1 surface integration

- Today-view display of DayContainer aggregate
- Journal-entry creation flow with highlight tagging
- Quick agent-chat with Psyche-arc emission
- Lightweight cymatic-field render
- Quick-action shortcuts (start journal, cast oracle, set reminder)

### Milestone 10: Opt-in shared-archetypal-resonance publishing

- Per-artifact consent UI for `shared_archetype_event` opt-in
- Daily-identity-hash computation (BLAKE3 of canonical `q_Nara · day_key_quaternion`)
- Transit-signature-geo computation (Hopf projection of Q_transit at write-time)
- SpaceTimeDB write integration via kernel-bridge
- Coincidence-detection feedback (display when user's archetype-tag appears in detected coincidence)

---

## §12 — Spec deltas

### §12.1 To `M4'-SPEC.md`

- New section: "Canonical Nara Content Structure" referencing this spec
- Annotation that the file-system layout at `/Pratibimba/Nara/` is canonical
- Annotation that oracle artifacts from the Quaternal Tarot and Quaternal I-Ching skills are first-class artifact-types with canonical payload-schemas

### §12.2 To `m4-prime-nara-activity-graphiti-instrument.md`

- Annotation that the activity-event envelope (per §3 of that spec) is extended by the artifact-envelope at §2.2 of this spec
- Cross-reference to the day-container + artifact-children topology

### §12.3 To `m4-prime-psychoid-cymatic-field-engine.md`

- Annotation in §6.8.4 input-modality pipelines: each pipeline produces canonical artifacts per this spec
- Annotation in §9 temporal-integration: period-readings derive from DayContainer aggregations per §7 of this spec
- Annotation in §6.8.4.F Tauri-v2 UX: highlight-system tags create canonical artifacts per the ActivityKind taxonomy

### §12.4 To `2026-04-04-graphiti-unified-temporal-context-service.md`

- Add `:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC` relationship types to the canonical relationship list
- Add `DayContainer` to the episode-type list
- Extend the episode-typing taxonomy with the full ActivityKind enum per §2.1 of this spec

### §12.5 To the Quaternal Tarot and Quaternal I-Ching skills

- Migrate log destination from `/Self/aham/daily/` to `/Pratibimba/Nara/{day_id}/artifacts/oracle/`
- Update SKILL.md "After the Reading" section to reference the canonical artifact-payload schema
- Add provenance fields: source_skill, skill_version, session_id

### §12.6 To the system-shape canon

- `m5-prime-system-shape-and-tauri-ide-canon.md` annotation: the m4-nara IDE extension and the 0/1 surface both consume from the `/Pratibimba/Nara/` canonical store via the kernel-bridge `nara-vault-service`

---

## §13 — What this spec delivers

1. **Day-as-episode-container architecture** — canonical structure where each calendar day has one DayContainer episode at #4.4.4.4 with N artifact-children attached, each carrying NOW timestamp + activity-type + provenance + privacy-class + bimba-coordinate-refs + day-container linkage
2. **Activity-type taxonomy** — closed `ActivityKind` enum covering oracle artifacts (Quaternal Tarot + Quaternal I-Ching), written artifacts (daily note / journal / dream / personal note / reflection), interactive artifacts (agent chat), task artifacts (reminder / LLM task / scheduled task), contemplative artifacts (Vāma Śaktis / alchemical / phenomenological), and external-source artifacts
3. **Common artifact envelope + type-specific payloads** — uniform Graphiti-integration envelope + discriminated payload union per ActivityKind, with full canonical schemas for the Quaternal Tarot and Quaternal I-Ching oracle types referencing the M3 Tarot/I-Ching library at canonical coordinates
4. **Canonical file-system layout** at `${VAULT}/Pratibimba/Nara/{day_id}/artifacts/...` with subdirectories per activity-type, frontmatter-bearing markdown files for human-readable artifacts, JSON envelopes for machine-readable metadata, `current/` symlink for today
5. **Quaternal Tarot canonical artifact** specifying full QuaternalTarotPayload with three scales (Sphere/Torus/Klein), positional readings (P0-P5), complementary pairs, P4 lemniscate sub-reading, Night arc, three-level interpretations, lens applications (L2/L3/L3'/L2'), and cross-references to canonical M3 Tarot library
6. **Quaternal I-Ching canonical artifact** specifying full QuaternalIChingPayload with four scales (Trigram/Hexagram/Transformed/Nuclear), native tetralemma in line-states, dual compass framework (Early Heaven + Later Heaven), Wu Xing interactions, moving lines, lens applications, and cross-references to canonical M3 I-Ching library
7. **Graphiti episode topology** with new relationship types (`:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC`) extending the existing canonical graph
8. **Privacy-class discipline per artifact-type** with default classifications, enforcement at substrate level, and explicit per-artifact opt-in for shared-archetypal-resonance publishing
9. **Tauri 0/1 surface and m4-nara IDE extension consumption** — both consume from the same canonical `/Pratibimba/Nara/` store via the kernel-bridge `nara-vault-service`; 0/1 for daily-use; m4-nara for deep engagement
10. **Q_composed trajectory through the day** — each DayContainer's artifact-children timeseries enables trajectory-rendering through the psychoid cymatic field per the cymatic field engine
11. **Spec deltas enumerated** for surgical update of M4'-SPEC, m4-prime-nara-activity-graphiti-instrument, m4-prime-psychoid-cymatic-field-engine, Graphiti spec, Quaternal Tarot/I-Ching skill files, and system-shape canon

---

## Sources

### Internal canon
- `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` — canonical M4' domain spec
- `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-activity-graphiti-instrument.md` — M4 branch structure + activity-event envelope
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md` — cymatic field engine + temporal integration + input-modality pipelines
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md` — system-shape canon + Tauri-IDE architecture
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-04-04-graphiti-unified-temporal-context-service.md` — Graphiti bi-temporal episodic store at #4.4.4.4

### Vendor skills + protocols (canonical oracle protocols)
- `vendors/epi-logos/skills/quaternal-tarot/SKILL.md` — Quaternal Tarot skill
- `vendors/epi-logos/resources/methods/quaternal_tarot_protocol.md` — full Tarot protocol
- `vendors/epi-logos/skills/quaternal-i-ching/SKILL.md` — Quaternal I-Ching skill
- `vendors/epi-logos/resources/methods/quaternal_i_ching_protocol.md` — full I-Ching protocol

### Cross-system canon
- `M3'-SPEC.md` §8.1 (M3 hexagram coords), §8.7 (M3 Tarot 56+8+22+2 coords) — canonical Tarot/I-Ching library at S2 Neo4j
- `M2'-SPEC.md` §8 (Lens family at S2; L2/L2'/L3/L3' Square C basin)
- `alpha_quaternionic_integration_across_M_stack.md` §11.4 (BLAKE3 quaternionic identity signatures) + §11.5 (shared cosmos tables) for opt-in shared-archetypal-resonance publishing

---

End of spec. The canonical Nara file structure, the day-as-episode-container architecture, the oracle-specific artifact schemas for Quaternal Tarot and Quaternal I-Ching, and the Graphiti episode topology are now articulated. Implementation milestones per §11; spec deltas per §12. The m4-nara IDE extension (per Theia plan §6.5) and the 0/1 free-flow Tauri surface both consume from this canonical structure.
