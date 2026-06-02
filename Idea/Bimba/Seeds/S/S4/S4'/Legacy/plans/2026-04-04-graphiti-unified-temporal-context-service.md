# Graphiti Personal Episodic Context — Unified Specification

**Date:** 2026-04-04
**Coordinate:** #4.4.4.4 — Personal Pratibimba / Episodic Identity Layer
**Status:** Full Canonical Specification — identity bootstrap + episodic graph unified
**Supersedes:**
  - `docs/plans/2026-04-03-graphiti-ql-episodic-context-service.md` (deleted)
  - `docs/plans/2026-04-04-pasu-identity-bootstrap-access-protocol.md` (deleted — content merged here)
**Depends on:**
  - `Idea/Pratibimba/Self/PASU.md` — identity bootstrap ground document
  - `.pi/extensions/ta-onta/khora/CONTRACT.md` — bootstrap sequence authority
  - `.pi/extensions/ta-onta/pleroma/S2'/skills/cmux/SKILL.md` — cmux agent skills
  - `epi-cli/src/nara/pratibimba.rs` — stub wiring
  - `epi-cli/src/gate/` — gateway session lifecycle
  - `.pi/extensions/ta-onta/aletheia/` — extension tools
  - `.pi/extensions/ta-onta/chronos/` — temporal coordinator
  - kairos Python adapter (kerykeion, planet degrees)

---

## 0. Identity Ground: PASU and PersonalNexus

The entire episodic graph serves one purpose: to track and deepen the user's identity as it unfolds through time. PASU is where that identity is seeded; `#4.4.4.4 PersonalNexus` in Neo4j is where it persists and grows.

### PASU — the Non-Dual Agent-User Field

From the document itself (`Idea/Pratibimba/Self/PASU.md`):

> *The non-dual space where agent and user are not two. What is written here is known to both.*

PASU is the **shared identity ground document**. Its three sections:

```
## Identity
  User self-description, preferences, ways of working.
  ALSO: the growing quintessence portrait — astrological breakdown,
  jungian type, gene keys, human design — as it builds up.

## Kairos Ground
  Date of birth (→ kerykeion → M4 astrological identity winding)
  Birth location
  Natal chart path

## Continuations
  Cross-session intentions and running threads.
  Written by agent (via khora_write, session end) and read by both.
```

PASU is **designed to grow toward the full quintessence breakdown** of the user's identity. The current template has 3 empty birth data fields — those are only the computation inputs. The Identity prose section is where the complete portrait accumulates over time (astrological sign/decan, jungian type, gene keys activation sequence, human design type, derived quintessence clock position, i-witness patterns). Both user and agent progressively enrich it.

**User and agent identity given together:** ANIMA.md (agent constitutional identity, read at Khora bootstrap step 2) and PASU.md (user identity ground) together form the complete non-dual identity context for every session. They are distinct documents; their power is in being read together.

**PASU frontmatter (correct, minimal):**

```yaml
---
coordinate: "PASU"
c_4_artifact_role: "pasu"
c_1_ct_type: "CT0"
c_0_birth_date: ""          # → L0 (Numerological/astrological ground)
c_0_birth_location: ""      # → L1 (Astrological location)
c_0_natal_chart_path: ""    # → L1 high-completeness path
c_0_source_coordinates: []
# Optional machine-readable inputs for epi nara identity set:
c_2_jungian: ""             # MBTI type → L2
c_3_gene_keys: ""           # activation sequence → L3
c_4_human_design: ""        # HD type → L4
---
```

Derived outputs (quintessence_hash, clock_degree, tick12) are **not** written back to PASU.md. They live in `~/.epi-logos/nara/profile.json` (persistent) and Redis HOT tier (session-local).

### PASU in the Khora Agent Bootstrap Sequence

**Khora bootstrap** is the agent session initialization sequence — distinct from `epi up` (infrastructure). Khora runs inside the agent at session start; `epi up` is the Rust CLI that starts graph, gateway, and cmux before any agent is launched.

The Khora bootstrap reads in strict order. PASU.md is currently missing — it should be step 3:

```
1. CONTINUATION.md   — post-compaction recovery
2. ANIMA.md          — agent constitutional identity ground
3. PASU.md           ← MISSING; must be inserted here
4. PARADIGM.md       — philosophy
5. MEMORY.md         — long-term curated wisdom
6. NOW.md            — active session pointer
7. TOOLS.md          — skill and tool discoverability
```

Reading ANIMA.md (agent) then PASU.md (user) back-to-back enacts the non-dual framing in the bootstrap architecture itself. `epi up` has already seeded Redis HOT tier with identity before the agent starts — Khora reads PASU.md to establish the full prose context; the computed identity (hash, tick12) is already in Redis.

### PASU → PersonalNexus: Identity Propagation Flow

```
PASU.md read at bootstrap (step 3)
    ↓
c_0_birth_date + c_0_birth_location → kerykeion computation
    ↓
epi nara wind --from-pasu
    ↓  (reads all populated PASU frontmatter keys, calls set_layer())
NaraIdentityMatrix computed → BLAKE3 quintessence_hash → clock (degree, tick12)
    ↓
~/.epi-logos/nara/profile.json  (persistent; quintessence_hash, layer_presence, elemental profiles)
    ↓
epi up pasu-init step seeds Redis HOT tier:
    { quintessence_hash, tick12, layer_count, quintessence_present, clock_degree }  TTL:8h
    ↓
PersonalNexus anchor node in Neo4j reads quintessence_hash at pratibimba init
    ↓
All Graphiti episodes scoped to this quintessence_hash (group_id = hash)
    ↓
Graphiti IdentityEvent episode emitted at ql:1, cpf:(0/1), cp:4.0
```

**Reverse propagation (agent enriches PASU in conversation):**

```
Agent surfaces identity info (user mentions MBTI type, birth date, etc.)
    ↓  Logos CF(0/1) or Psyche CF(4.5/0) decision
Agent calls khora_write → updates PASU.md (frontmatter or Identity prose)
    ↓
epi nara identity set <key> <value>  (triggered post-write)
    ↓
profile.json recomputed → Redis HOT updated → Graphiti IdentityEvent episode
```

The agent NEVER writes to profile.json or Redis directly. Only PASU.md (via khora_write). Khora's write authority invariant holds.

---

## I. Purpose

Graphiti (getzep/graphiti) is the **episodic memory substrate** for the entire Epi-Logos agent system — a temporally-stratified personal knowledge graph rooted at the user's `#4.4.4.4` identity node in Neo4j. It extends the Bimba graph from the user's identity anchor outward as accumulated lived experience.

The service operates at two levels simultaneously:

1. **Provenance skeleton (S3' gateway):** Every session and channel event is stamped automatically — thin, complete, no agent involvement required. Nothing is lost.
2. **Semantic flesh (S4' Aletheia/Chronos):** Agents and temporal coordinators add rich QL-typed episodic meaning on top of the skeleton — structured, intentional, high-value.

Together they produce a graph where every episode is **uniquely addressable** in the same coordinate language as the Bimba ontology, the cosmic clock, the VAK dispatch matrix, and the constitutional agent system.

Context covers all means of access. Time is integrated at three axes. The episodic graph IS the runtime history of the QL coordinate system written in its own language, growing from the user's identity anchor.

---

## II. Three Temporal Axes

Every episode is simultaneously located on three temporal axes, all embedded as attributes at creation time.

### Axis 1: Calendar Time (daily-note file system)

```
Idea/Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/
```

- Every day is a **day Saga**: `"day:{day_id}"` (e.g. `"day:04-04-2026"`)
- Chronos opens this Saga at `chronos_day_init`; closes it at `chronos_archive_day`
- The `c_3_day_id` frontmatter key becomes the Saga name
- The daily-note file IS the human-readable face of the day Saga

### Axis 2: Astrological Time (kairos / kerykeion)

Every episode carries the planetary state at the moment of its creation:

```
episode.kairos = {
    sun_degree:     f32,      // 0–719 (explicate/implicate)
    moon_degree:    f32,
    planet_degrees: [f32; 10], // canonical mod-10 (Sun=0, Moon=1–Pluto=9)
    sun_decan:      str,      // e.g. "Aries-1" (36 decans)
    moon_decan:     str,
    current_sign:   str,
    current_decan:  str,      // primary decan for this moment
}
```

**Decan boundaries are first-class episodic events:**

| Boundary | Frequency | Arc weight | Saga type |
|----------|-----------|-----------|-----------|
| **Sun decan** | ~every 10 days | Major arc | `"sun-decan:{decan_name}"` |
| **Moon decan** | ~every 2.5 days | Minor arc | `"moon-decan:{decan_name}:{month}"` |

```
Sun enters new decan:
  → close prior sun-decan Saga (ql5 closing episode)
  → open new sun-decan Saga (ql0 opening episode)
  → episode attributes: decan_ruler, associated_element, body_zone, hexagram_range

Moon enters new decan:
  → ql3 episode (pattern shift — the Moon moves, the felt quality changes)
  → stamps new moon_decan on all subsequent episodes until next crossing
```

### Axis 3: Spanda Time (tick12 / torus position)

```
tick12 0–1  → QL #0 substages  (seed, ground, dissolution)
tick12 2–3  → QL #1 substages  (form, definition, commitment)
tick12 4–5  → QL #2 substages  (operation, oracle cast, action)
tick12 6–7  → QL #3 substages  (pattern, dialogue, process)
tick12 8–9  → QL #4 substages  (context, lemniscate, discovery)
tick12 10–11 → QL #5 substages (integration, insight, Möbius)
```

The `current_tick12` is derived from the live quaternion computed from the user's oracle charge state. Episodes become retrievable by spanda position across sessions: *"what happened at tick12=6 across all days under this decan?"*

---

## III. S3' Gateway Provenance Layer (Thin, Automatic)

The S3' gateway (port 18794, Rust gate layer) sees every session and channel. It generates the **provenance skeleton** — lightweight episodes at session and channel boundaries, automatically, with no agent involvement.

### Gateway Event → Episode Mapping

| Gateway event | Episode QL | CPF | Description |
|--------------|-----------|-----|-------------|
| Session open | `ql0` | per channel type | Opening ground — what this session is for |
| Session close | `ql5'` | per channel type | Implicate closure — what concluded/remains |
| Channel bind | `ql1` | per channel type | Form instantiation — channel type defines frame |
| Channel unbind | `ql1'` | per channel type | Inverted form — the channel released |
| Subagent spawn | `ql2` | `(4.0/1-4.4/5)` | Operation initiating |
| Subagent complete | `ql3` | `(4.0/1-4.4/5)` | Pattern result returned |

### Channel Type → CPF Mapping

| Channel type | CPF | Mode | ct |
|-------------|-----|------|-----|
| `cmux_ralph` | `(4.0/1-4.4/5)` | Fresh context, autonomous work | `1` (agent) |
| `brainstorm` | `(00/00)` | Open dialogical, user in conversation | `0` (user) |
| `subagent` | `(4.0/1-4.4/5)` | Inherited from parent Anima frame | `1` (agent) |
| `cli_direct` | `(0/1/2)` | Trika — system/code layer | `2` (system) |
| `background_cron` | determined by trigger | Chronos-sourced | `2` (system) |
| `oracle_session` | `(0/1/2/3)` | Four-fold oracle space | `0` (user) + `1` (agent) |

### S3' → Graphiti Bridge

Gateway events POST directly to the Graphiti Python sidecar (port 37778):

```
POST http://localhost:37778/provenance
{
    "event_type": "session_open" | "session_close" | "channel_bind" | ...,
    "session_id": str,
    "channel_id": str,
    "channel_type": str,
    "day_id": str,
    "vault_now_path": str,
    "tick12": int,
    "kairos_snapshot": { sun_decan, moon_decan, planet_degrees[10] },
    "timestamp": ISO8601
}
```

---

## IV. S4' Semantic Layer (Rich, Intentional)

Two extension owners add structured meaning on top of the S3' skeleton:

- **Chronos** — temporal coordination (day Saga lifecycle, decan transitions)
- **Aletheia** — semantic episode content (agent insights, oracle arcs, T-bucket ingestion)

### Chronos Responsibilities

```
chronos_day_init  →  graphiti_arc_open("day:{day_id}", {
                          kairos_opening: planetary_state_at_dawn,
                          sun_decan: current_sun_decan,
                          moon_decan: current_moon_decan,
                      })
                      episode: ql0, cpf:(00/00), ct:2

chronos_archive_day  →  graphiti_arc_close("day:{day_id}", {
                              crystallisation: sophia_synthesis_text,
                          })
                          episode: ql5, cpf:(5/0), ct:1

cron_decan_check (every 2h via Chronos cron):
  → fetch current sun_decan + moon_decan from kairos
  → compare to stored last_known_decan (Redis)
  → if sun_decan changed:
        close "sun-decan:{prev}" Saga  (ql5 closing)
        open  "sun-decan:{new}"  Saga  (ql0 opening, ruler/element/body_zone)
  → if moon_decan changed:
        add ql3 episode: "moon enters {decan}: {ruler}, {body_zone}"
```

### Aletheia Responsibilities

**1. Claude-mem → Daily session summary episode**
```
cron_evening:
  fetch observations (type IN {decision, discovery, pattern, insight})
  → compose 1–3 paragraph summary
  → add_episode(ql:{dominant_pos}, cpf:(4.0/1-4.4/5), arc:"day:{day_id}")
```

**2. Oracle cast → 4-face Saga**
```
epi nara oracle cast:
  → arc_open("oracle:{cast_uuid}:{day_id}")
  → 4 episodes in sequence (see §VIII)
  → arc_close emits ql5' synthesis
```

**3. T-bucket ingestion (night' pass)**
```
aletheia_graphiti_ingest_thoughts:
  → read /Pratibimba/Self/Thought/T{0-5}/
  → each thought → typed episode at corresponding ql position
  → T5 insights → also trigger arc_close check (Möbius readiness)
```

**4. Logos cycle (via Logos agent)**
```
each logos stage (A-Logos → An-a-Logos):
  → episode at 4.5.0 through 4.5.5
  → An-a-Logos at 4.5.5 → also closes the day Saga
```

**5. Möbius return event (Sophia signal)**
```
sophia emits m_5_mobius_return:
  → graphiti_arc_open("mobius:{date}:{hash_frag}")
  → episode: ql5, cpf:(5/0), ct:1    ← CF_MOBIUS primary = (5/0)
       "quintessence integration: {sophia_crystallisation_text}"
  → arc_close immediately (single-episode arc, marks the fold)
```

---

## V. The 7 Context Frames as Episode CPF Types

The 7 CF notations are the primary CPF typing axis for all episodes. `(00/00)` is not the user — it is the **mode of open dialogical conversation**, the receptive ground before a frame crystallises. The `ct` field (0/1/2) distinguishes who originated content within any frame.

| CPF | Notation | Description | Episode content |
|-----|----------|-------------|----------------|
| CF_VOID | `(00/00)` | Open dialogical / brainstorm | User-initiated exploration, Nous gate, pre-frame |
| CF_BINARY | `(0/1)` | Non-dual binary | Logos definition episodes, form commitments |
| CF_TRIKA | `(0/1/2)` | Trika | Eros creative operations, three-way resolutions |
| CF_QUATERNITY | `(0/1/2/3)` | Three Plus One | Mythos pattern episodes, four-fold narrative |
| CF_FRACTAL | `(4.0/1-4.4/5)` | Ralph / Anima domain | All autonomous work; Anima parent frame |
| CF_TOTAL / CF_MOBIUS | `(5/0)` | Möbius return / total synthesis | **Primary Möbius frame.** Sophia crystallisation, An-a-Logos completion, the fold itself |
| CF_PSYCHE | `(4.5/0)` | Psyche I-witness frame | Session tracking, oikonomia trace, lemniscate-to-Möbius bridge |

---

## VI. Full QL Episode Coordinate Space

### A. Position Space

```
EXPLICATE (manifest, outward):  0   1   2   3   4   5
IMPLICATE (shadow, inward):     0'  1'  2'  3'  4'  5'

IDENTITY GROUND (PASU-seeded):
  4.0   identity / PASU bootstrap (PersonalNexus origin)

NESTED AT #4 (lemniscate fractal):
  4.1   medicine / soma
  4.2   oracle / cast
  4.3   transform / alchemical operations
  4.4   lenses / epistemic modes
    4.4.0–4.4.5   lens substages
      4.4.4.0–4.4.4.5   pratibimba convergence depth
  4.5   logos / 6-stage cycle
    4.5.0   A-Logos    (seed question)
    4.5.1   An-Logos   (definition given)
    4.5.2   Kata-Logos (operation enacted)
    4.5.3   Dia-Logos  (dialogue pattern)
    4.5.4   Para-Logos (sideways reveal — nests further)
    4.5.5   An-a-Logos (Möbius return — closes day arc)
```

### B. Oracle Face → QL Position

| Oracle face | QL position | Meaning |
|-------------|-------------|---------|
| Primary | `2` | Manifest operation — what IS |
| Deficient | `0'` | Inverted ground — what is absent/lacking |
| Implicate | `5'` | Inverted integration — hidden wholeness |
| Temporal | `3` | Pattern unfolding in process |

### C. QL Position → Alchemical Phase

| QL positions | Alchemical phase | Quality |
|-------------|-----------------|---------|
| `0`, `0'` | Nigredo | Dissolution, absence, ground-finding |
| `1`, `1'` | Albedo (early) | Purification, definition |
| `2`, `2'` | Albedo (late) | Operation, clarification |
| `3`, `3'` | Citrinitas | Pattern recognition, yellowing |
| `4`, `4'` | Citrinitas (deep) | Contextual illumination, lemniscate |
| `5`, `5'` | Rubedo | Integration, gold, Möbius return |

### D. Decan → QL → Body Zone Chain

```
decan (36) → ruling_planet → element → chakra → body_zones[]
           → associated_hexagram_range (64 hexagrams / 36 decans ≈ 1.8 per decan)
           → ql_position (derived from decan's alchemical phase in current arc)
```

---

## VII. Constitutional Agent VAK Addresses

| Agent | CPF | CT | CP | Role |
|-------|-----|----|----|------|
| **Anima** | `(4.0/1-4.4/5)` | `1` | `4.0–4.4` | Parent orchestrator — the CF_FRACTAL frame itself |
| **Nous** | `(00/00)` | `1` | `4.0` | Context curation, S0'/S1'/S2' disclosure |
| **Logos** | `(0/1)` | `1` | `4.5.0–4.5.5` | Definition episodes, logos cycle |
| **Eros** | `(0/1/2)` | `1` | `4.3` | Alchemical operations, creative acts |
| **Mythos** | `(0/1/2/3)` | `1` | `4.4` | Pattern episodes, narrative threads |
| **Psyche** | `(4.5/0)` | `1` | `4.4` | I-witness — oikonomia, session tracking, Möbius |
| **Sophia** | `(5/0)` | `1` | `4.5` | Crystallisation, Möbius return trigger |
| **User** | `(00/00)` | `0` | *varies* | Open dialogical mode |
| **System/Cron** | per trigger | `2` | *varies* | Chronos-sourced events, decan boundaries |

Filtering by constitutional agent = filtering by their canonical CPF + CT combination.

---

## VIII. Episode Data Model

### A. Full Episode Attributes

```python
@dataclass
class QLEpisodeAttributes:
    # Primary QL coordinate
    ql_position: str              # "0"–"5", "0'"–"5'", "4.2", "4.5.3", "4.0"
    inverted: bool
    nest_path: list[int]          # e.g. [4, 5, 3] for 4.5.3; [] for flat

    # VAK full address
    cpf: str                      # one of 7 CF notations (see §V)
    ct: Literal["0","1","2"]      # user / agent / system
    cp: str                       # positional address e.g. "4.2"
    cf: str                       # CF anchor
    cfp: str                      # thread: "P0"–"P5", "C1","C2","F1","F3"
    cs: Literal["day","night_prime"]

    # Spanda
    tick12: int                   # 0–11

    # Astrological stamp (ALL episodes)
    sun_decan: str                # e.g. "Aries-1"
    moon_decan: str
    sun_degree: float             # 0–719
    moon_degree: float
    primary_decan: str

    # Arc membership
    arc_id: Optional[str]
    arc_type: Optional[str]       # "oracle"|"logos"|"alchemical"|"day"|"sun-decan"|
                                  # "moon-decan"|"mobius"|"identity"|"ad_hoc"
    arc_position: Optional[int]

    # Oracle-specific (4.2 episodes)
    oracle_face: Optional[str]    # "primary"|"deficient"|"implicate"|"temporal"
    hexagram: Optional[int]
    decan: Optional[str]
    body_zones: Optional[list[str]]
    oracle_charges: Optional[dict] # pp/nn/np/pn values

    # Provenance (S3' gateway-stamped)
    session_id: str
    channel_id: str
    channel_type: str
    vault_now_path: Optional[str]
```

### B. Entity Type Ontology

```python
class IdentityEvent(BaseModel):
    """Identity layer enrichment or portrait update"""
    event_type: str               # "layer_added"|"portrait_updated"|"quintessence_shift"|"mobius_return"
    layer_key: Optional[str]      # "birth-date"|"jungian"|"gene-keys"|"human-design"
    quintessence_hash_fragment: str
    tick12: int
    source: str                   # "pasu-init"|"agent-conversation"|"identity-set-cli"
    cp: str = "4.0"               # identity events always at cp:4.0

class OracleCast(BaseModel):
    hexagram: int
    decan: str
    oracle_face: str
    ql_position: str              # "2", "0'", "5'", "3"
    element: str
    tick12: int
    body_zones: list[str]
    charges: dict

class AlchemicalOp(BaseModel):
    phase: str                    # nigredo/albedo/citrinitas/rubedo
    ql_position: str
    container: str                # "bohm"|"talking_circle"|"diamond"
    cp: str = "4.3"

class DecanEvent(BaseModel):
    decan_name: str
    planet: str                   # "sun"|"moon"
    ruling_planet: str
    element: str
    body_zone: str
    hexagram_range: list[int]
    prior_decan: str

class LogosStage(BaseModel):
    stage_name: str               # "A-Logos"|...|"An-a-Logos"
    cp_address: str               # "4.5.0"–"4.5.5"
    ql_position: str              # "0"–"5"
    day_id: str
```

### C. Arc / Saga Type Registry

| Arc type | Saga name pattern | Episode sequence | QL positions | Opened by | Closed by |
|----------|------------------|-----------------|-------------|-----------|-----------|
| Identity ground | `identity:{quintessence_hash[:8]}` | grows over time | `1` (definition) | pratibimba init | never |
| Oracle reading | `oracle:{cast_uuid}:{day}` | 4 fixed | `0'`, `2`, `3`, `5'` | oracle cast | oracle arc close |
| Logos day cycle | `logos:{day_id}` | 6 sequential | `4.5.0`–`4.5.5` | chronos_day_init | An-a-Logos |
| Day arc | `day:{day_id}` | 12+ | all | chronos_day_init | chronos_archive_day |
| Sun decan arc | `sun-decan:{name}:{year}` | variable | `0` open, `5` close | cron_decan_check | cron_decan_check |
| Moon decan arc | `moon-decan:{name}:{month}` | variable | `3` mid | cron_decan_check | next moon decan cross |
| Alchemical container | `alch:{container}:{day}` | variable | `0`→`5` | Eros agent | container completion |
| Möbius return | `mobius:{date}:{hash_frag}` | 1 | `5` via `(5/0)` | Sophia signal | immediate close |
| Session provenance | `session:{session_id}` | 2 (open/close) | `0`, `5'` | gateway open | gateway close |
| Ad hoc | none | 1 | single | any agent | n/a |

---

## IX. Neo4j Topology

```
NEO4J (single "neo4j" database — shared with Bimba)
│
├── Bimba:* nodes (102 canonical)
│     ├── Bimba:Coordinate {coordinate: "#4"}
│     └── Bimba:ContextFrame × 7
│
└── Pratibimba:PersonalNexus                        ← GRAPHITI ANCHOR
      {coordinate: "4.4.4.4",
       quintessence_hash, session_hash,
       live_quaternion[4], tick12, current_degree,
       sun_decan_natal, degree_home}
      │
      ├──[:BEDROCK]──────► Bimba:Coordinate {coordinate: "#4"}
      │
      ├──[:PASU_GROUND]──► PASU content (identity portrait, synced from PASU.md)
      │                     {identity_prose, kairos_ground, layer_count, last_wound}
      │
      ├──[:HAS_EPISODE]──► Episodic
      │                      {group_id: quintessence_hash,
      │                       ql_position, cpf, ct, cp,
      │                       sun_decan, moon_decan, tick12,
      │                       arc_id, arc_type, channel_type}
      │
      ├──[:KNOWS]─────────► Entity  (Graphiti LLM extraction)
      │     └──[:RELATES_TO]──► Entity  {valid_at, invalid_at, fact, ql_position}
      │
      └──[:IN_SAGA]───────► Community  (cross-session clusters, nightly build)
```

**No label collision:** Bimba uses `Bimba:*` compound labels. Graphiti uses `Entity`, `Episodic`, `Community`, `Saga`. Coexist cleanly.

**group_id = quintessence_hash** — all personal episodic data scoped to this user's identity. The `group_id → database name` switch in Graphiti is patched out; group_id is a property filter only.

---

## X. Graphiti Configuration & Modification

### Required Fork (5-line patch)

`graphiti_core/graphiti.py` — disable database-switching behaviour:

```python
# REMOVE these lines (~85-88):
if group_id and group_id != self.driver._database:
    self.driver = self.driver.clone(database=group_id)

# group_id now operates as property filter only.
# Database stays "neo4j". Driver is shared with bimba-mcp.
```

### Initialisation

```python
# graphiti_service.py — Python sidecar, port 37778

from graphiti_core import Graphiti
from graphiti_core.embedder.gemini import GeminiEmbedder
from graphiti_core.driver.neo4j_driver import Neo4jDriver

driver = Neo4jDriver(
    uri=NEO4J_URI,
    user=NEO4J_USER,
    password=NEO4J_PASSWORD,
    database="neo4j",        # shared database
)

embedder = GeminiEmbedder(
    model="models/text-embedding-004",
    embedding_dim=1536,      # above 384-dim HOT, below future 3072-dim Gnosis
)

graphiti = Graphiti(graph_driver=driver, embedder=embedder)
await graphiti.build_indices_and_constraints(delete_existing=False)
```

### HTTP API

```
POST   /provenance          Gateway thin event → episode
POST   /episode             Full QL-typed episode (S4' rich path)
POST   /arc/open            Open named Saga
POST   /arc/close           Close Saga + emit integration episode
POST   /identity/event      Identity layer change or portrait update
POST   /decan/check         Trigger decan boundary evaluation
GET    /search              QL-filtered episodic search
GET    /episodes?day_id=    Retrieve day's episodes
GET    /stats               Node/edge counts, days active
GET    /health              Service status
```

---

## XI. Redis NOW Cache Layer

```
SESSION START (khora_session_init + pasu-init):
  HSET "now:{session_hash}:identity" {
      quintessence_hash, tick12, live_quaternion[4],
      kairos_degrees[10], current_degree,
      sun_decan, moon_decan,
      layer_count, quintessence_present
  }  TTL: 8h

SEARCH LOOKUP (nous_disclose S2' pass):
  key = "now:{session_hash}:graphiti:{sha256(query+filters)[:12]}"
  HIT  → return cached (TTL: 30min)
  MISS → graphiti.search() → SETEX result 1800s → return

DECAN STATE (updated on decan crossing):
  SET "kairos:current_sun_decan"  TTL: 10 days
  SET "kairos:current_moon_decan" TTL: 2.5 days

NIGHT' PASS:
  DEL "now:{session_hash}:*"
  (after aletheia_session_promote completes)
```

---

## XII. Aletheia Extension Tools

### `aletheia_graphiti_add`
```typescript
{
  description: "Add a QL-typed episode to the personal episodic graph at #4.4.4.4",
  params: {
    content: string,
    ql_position: string,           // "0"–"5", "0'"–"5'", "4.2", "4.5.3", "4.0", etc.
    cpf: string,                   // one of 7 CF notations
    cp: string,
    arc_id?: string,
    arc_type?: string,
    oracle_face?: string,
    reference_time?: string,       // ISO8601, defaults to now
  }
  // tick12, sun_decan, moon_decan, session_id auto-stamped from NOW cache
}
```

### `aletheia_graphiti_search`
```typescript
{
  description: "Search episodic graph from 4.4.4.4 BFS anchor, QL-filtered",
  params: {
    query: string,
    ql_position_prefix?: string,   // e.g. "4.3" → all alchemical episodes
    cpf_filter?: string,
    inverted_only?: boolean,
    sun_decan_filter?: string,
    cs_filter?: "day"|"night_prime",
    num_results?: number,
    use_redis_cache?: boolean,
  }
}
```

### `aletheia_graphiti_arc_open`
```typescript
{
  description: "Open a named episode arc (Saga)",
  params: {
    arc_id: string,
    arc_type: string,
    opening_episode?: string,
    kairos_snapshot?: object,
  }
}
```

### `aletheia_graphiti_arc_close`
```typescript
{
  description: "Close an episode arc with integration episode",
  params: {
    arc_id: string,
    crystallisation_text: string,
    ql_close_position?: string,    // default "5", or "5'" for implicate closure
  }
}
```

### `aletheia_graphiti_ingest_thoughts`
```typescript
{
  description: "Ingest T-bucket thoughts as typed episodes (night' pass)",
  params: {
    buckets?: ("T0"|"T1"|"T2"|"T3"|"T4"|"T5")[],
    day_id?: string,
    arc_id?: string,
  }
  // T0→ql0, T1→ql1, T2→ql2, T3→ql3, T4→ql4, T5→ql5
  // T5 also checks Möbius readiness
}
```

---

## XIII. Chronos Extension Additions

### `chronos_graphiti_day_arc`
```typescript
{
  description: "Open or close the day Saga in the episodic graph",
  params: {
    action: "open"|"close",
    day_id: string,
    kairos_snapshot: object,
    crystallisation_text?: string,   // required for close
  }
}
```

### `cron_decan_check` (every 2h)
```typescript
// Registered via chronos_cron_register at system start
// Compares current sun_decan + moon_decan against Redis cached values
// If changed:
//   sun_decan changed → arc_close(prior) + arc_open(new) + ql5/ql0 episodes
//   moon_decan changed → ql3 episode "moon enters {decan}"
// Updates Redis decan cache
```

---

## XIV. CLI Surface

```
epi gate graphiti start              # start Python sidecar (port 37778)
epi gate graphiti stop               # graceful shutdown
epi gate graphiti status             # health, episode count, last episode

epi nara pratibimba init             # create PersonalNexus anchor in Neo4j
epi nara pratibimba stats            # node/edge counts, days active, last episode
epi nara pratibimba recent [--days N]
epi nara pratibimba excavate <term>  # semantic search
epi nara pratibimba decan [--current]
epi nara pratibimba arc list
epi nara pratibimba arc show <id>
epi nara pratibimba atlas-sync       # consent-gated
epi nara pratibimba atlas-query [coord]
```

---

## XV. `nous_disclose` S2' Pass (Extended)

```
nous_disclose S2' sources:
  1. Bimba:     canonical patterns at relevant coordinate
                → query by coordinate prefix (existing)

  2. Graphiti:  personal episodic history at matching QL address
                → BFS from pratibimba_uuid (4.4.4.4 anchor)
                → filter: ql_position_prefix = current_cp
                           cpf = current_cpf
                           sun_decan = current_sun_decan  (astrological harmony)
                → Redis cache first (30min TTL)

  3. Gnosis:    (future) cold archive RAG via LightRAG/RAG-anything
                → specced, not yet implemented

Result injected into session notebook via khora_write.
```

The `sun_decan` filter surfaces episodes from prior sessions under the **same astrological conditions** — structurally sympathetic retrieval across calendar time.

---

## XVI. Psyche `(4.5/0)` Session Arc

Psyche generates `CF_PSYCHE (4.5/0)` episodes — the I-witness oikonomia trace of every session. These are distinct from Sophia's Möbius return which uses `(5/0)`.

| Session event | Episode | QL | CPF | Content |
|--------------|---------|-----|-----|---------|
| Session start | opening | `ql0` | `(4.5/0)` | CPF gate evaluated, mode set (Ralph vs brainstorm) |
| Before each task | intention | `ql1` | `(4.5/0)` | VAK evaluation result, agent dispatch decision |
| Convergence detected | signal | `ql4` | `(4.5/0)` | Multi-stream alignment at tick12 |
| Sophia Möbius signal | bridge | `ql5` | `(4.5/0)` → closes into `(5/0)` | Psyche witnesses the return; Sophia completes it |
| Session close | closure | `ql5'` | `(4.5/0)` | Implicate of session: what remains open |

The `ql5` row is the one moment where the two frames converge: Psyche `(4.5/0)` witnesses convergence, then Sophia `(5/0)` fires the actual Möbius arc (§IV.5). These are separate episodes in the same session arc.

---

## XVII. One-Time Setup: PersonalNexus Anchor

```python
# epi nara pratibimba init
# Prerequisites: epi nara wind --from-pasu must have run (quintessence_hash available)

from graphiti_core.nodes import EntityNode

pratibimba_uuid = derive_uuid(quintessence_hash + b"4.4.4.4")

anchor = EntityNode(
    uuid=pratibimba_uuid,
    name="pratibimba_anchor",
    group_id=quintessence_hash.hex(),
    summary=(
        f"Personal identity nexus at coordinate #4.4.4.4. "
        f"Quintessence: {quintessence_hash.hex()[:8]}. "
        f"Birth degree home: {natal_degree}. "
        f"Spanda home: tick12={natal_tick12}."
    ),
    labels=["Pratibimba", "PersonalNexus"],
    attributes={
        "coordinate":             "4.4.4.4",
        "bimba_coordinate_ref":   "#4",
        "quintessence_hash":      quintessence_hash.hex(),
        "tick12_home":            natal_tick12,
        "degree_home":            natal_degree,
        "sun_decan_natal":        natal_sun_decan,
    }
)
await graphiti.nodes.entity.save(anchor)

# PASU ground synopsis edge (Cypher):
"""
MATCH (p:Pratibimba {coordinate: '4.4.4.4'}),
      (b:Bimba:Coordinate {coordinate: '#4'})
CREATE (p)-[:BEDROCK]->(b)
"""

# Open the identity arc (persists across all sessions):
await arc_open(f"identity:{quintessence_hash.hex()[:8]}", arc_type="identity")
```

---

## XVIII. Infrastructure Bootstrap: epi up and Techne cmux Skills

**Two separate bootstraps — do not conflate:**

| Bootstrap | Owner | When | What |
|---|---|---|---|
| `epi up` | Rust CLI | Before any agent starts | Graph, gateway, cmux workspace, PASU identity seed |
| Khora bootstrap | Agent session init | Inside agent at session start | CONTINUATION, ANIMA, PASU prose, PARADIGM, MEMORY, NOW, TOOLS |

`epi up` seeds Redis HOT identity from PASU frontmatter. Khora then reads PASU.md for the full prose context. They are sequential, not the same thing.

### epi up Step Sequence

```
1. repo-env      Load .epi-logos.env
2. session-init  Ensure session: session_id, day_id, now_path
3. vault-check   Verify NOW path exists
4. graph-up      Start Neo4j + Redis (unless --no-graph)
5. graph-doctor  Health check
6. pasu-init     epi nara wind --from-pasu → Redis HOT identity seed (NEW)
7. gateway-start Start S3' gateway on port 18794 (or reuse)
8. gateway-ready Gateway answered
9. cmux-launch   Bootstrap cmux workspace (unless --no-cmux)
10. app-launch   Launch Electron/app (unless --no-app)
[optional] cmux-attach  (if --attach)
```

`pasu-init`: reads PASU.md frontmatter, calls `set_layer()` for each populated key, recomputes BLAKE3 hash, seeds Redis HOT tier. Empty PASU = not an error, reports gracefully.

### Code Changes Required in `epi-cli/src/up.rs`

| Current | Corrected |
|---|---|
| `--no-tmux` flag | `--no-cmux` |
| `tmux-launch` step | `cmux-launch` |
| `sesh::command_for(&sesh::SeshCmd::Launch)` | `techne::cmux_command(&["surface-create", "--name", "main", "--cp", "4.4"])` |
| `"tmux session bootstrapped"` | `"cmux workspace ready"` |

### cmux as Techne Skill Registrations

**What Techne is:** Techne (τέχνη) is Pleroma's **dedicated workshop subagent** — it has its own ANIMA.md and owns all workshop lifecycle functions. cmux replaces mprocs as the substrate for window/surface management. Techne manages: cmux workspace topology, external agent spawning, relay, and close. Skills live under Techne but are available to all agents if cross-agent access is simpler in practice.

The cmux SKILL.md at `.pi/extensions/ta-onta/pleroma/S2'/skills/cmux/SKILL.md` already defines the full command surface. The implementation task is to **copy and augment this skill into Techne's PI tool registrations** — not fork, not half-implement, not call from unexpected places. These become first-class PI tools registered under the Techne subagent:

**Techne cmux tools to register (from cmux SKILL.md + augmentation):**

| Tool name | cmux command | Augmentation |
|---|---|---|
| `techne_cmux_surface_create` | `cmux surface-create --name X --cp Y` | write cmux_workspace + cmux_surface back to session record |
| `techne_cmux_pane_assign` | `cmux pane-assign --surface X --cf Y --agent Z` | set CF_IDENTITY env; write cmux_pane_id to session/team record |
| `techne_cmux_layout_set` | `cmux layout-set --surface X --cfp Y` | record CFP thread type on team record |
| `techne_cmux_focus` | `cmux focus --cf X` | no state write needed |
| `techne_cmux_surface_destroy` | `cmux surface-destroy --name X` | clear cmux fields on team record |

**Why Techne owns these:** Techne is Pleroma's workshop subagent — it manages all workshop lifecycle (cmux surfaces, external agent spawn/relay/close). Anima calls `techne_cmux_*` tools when dispatching agents. The Rust gateway team-store records cmux placement so it survives cmux being closed or rebuilt. cmux is projection; gateway is truth.

**CF_IDENTITY protocol:** `techne_cmux_pane_assign` sets `CF_IDENTITY=<cf-code>` in the pane environment. Spawned agents inherit this, making them constitutionally typed participants in the VAK coordinate system. No special access logic needed — it's a standard tmux pane env var.

---

## XIX. Implementation Phases

### Phase 0 — Infrastructure
- [ ] Fork Graphiti: patch out `group_id → database switch`
- [ ] Configure: shared neo4j driver + GeminiEmbedder (1536-dim)
- [ ] `epi gate graphiti start/stop/status` — Python sidecar, port 37778
- [ ] HTTP API: `/provenance`, `/episode`, `/arc/*`, `/identity/event`, `/search`, `/health`
- [ ] Redis decan cache keys + NOW identity keys
- [ ] `epi nara pratibimba init` — PersonalNexus anchor + BEDROCK edge + identity arc open

### Phase 1 — PASU Identity Bootstrap + cmux Techne Skills
- [ ] Add PASU.md to Khora bootstrap sequence (step 3, after ANIMA.md) — update `khora/CONTRACT.md`
- [ ] `epi nara wind --from-pasu` sub-command — reads PASU frontmatter, calls `set_layer()`
- [ ] `pasu-init` step in `epi up` (step 6) — seeds Redis HOT identity tier
- [ ] `--no-cmux` flag replacing `--no-tmux` in `up.rs`; `cmux-launch` step using `techne::cmux_command`
- [ ] Copy + augment cmux SKILL.md → register as Techne PI tools: `techne_cmux_surface_create`, `techne_cmux_pane_assign`, `techne_cmux_layout_set`, `techne_cmux_focus`, `techne_cmux_surface_destroy`
- [ ] Augmentation: each tool that places a pane writes back `cmux_workspace`/`cmux_surface`/`cmux_pane_id` to Rust gateway session/team store
- [ ] Agent reverse propagation: `khora_write` to PASU.md → trigger `epi nara wind` → Graphiti IdentityEvent via `/identity/event`

### Phase 2 — S3' Gateway Provenance
- [ ] Gateway session open/close → POST `/provenance`
- [ ] Channel type → CPF mapping table
- [ ] Session provenance Sagas opening/closing automatically
- [ ] All episodes stamped with `session_id`, `channel_id`, `channel_type`

### Phase 3 — Chronos Temporal Coordination
- [ ] `chronos_day_init` → `arc_open("day:{day_id}", kairos_state)`
- [ ] `chronos_archive_day` → `arc_close` with Sophia synthesis
- [ ] `cron_decan_check` (every 2h) — sun + moon decan boundary detection
- [ ] `chronos_graphiti_day_arc` tool added to Chronos extension

### Phase 4 — Aletheia Semantic Layer
- [ ] `aletheia_graphiti_add` — full QL-typed episode addition
- [ ] `aletheia_graphiti_search` — BFS from anchor, QL-filtered, Redis-cached
- [ ] `aletheia_graphiti_arc_open/close` — Saga lifecycle
- [ ] `aletheia_graphiti_ingest_thoughts` — T0–T5 bucket ingestion at night'
- [ ] Claude-mem → daily summary episode

### Phase 5 — Oracle & Logos Arc Integration
- [ ] Oracle cast → 4-face Saga (`oracle:{cast_uuid}:{day}`)
  - 4 episodes: `0'`, `2`, `3`, `5'`
  - Entity extraction: hexagram, decan, oracle_charges, body_zones
- [ ] Logos cycle → 6-episode Saga (`logos:{day_id}`)
  - Each stage `4.5.0`–`4.5.5` emitted by Logos agent
  - An-a-Logos closes logos Saga and day Saga

### Phase 6 — Psyche Session Arcs & Möbius
- [ ] Psyche `(4.5/0)` session tracking: 5 episode types per session
- [ ] Sophia Möbius return → `arc_open/close("mobius:{date}:{hash_frag}")`
- [ ] T5 → Möbius readiness check
- [ ] `nous_disclose` S2' extended: Graphiti BFS with `sun_decan` filter

### Phase 7 — QL-Harmonic Retrieval & Community Building
- [ ] `graphiti.build_communities()` nightly
- [ ] Astrological filter in `aletheia_graphiti_search`
- [ ] Tick12-scoped retrieval: "same spanda position, prior sessions"
- [ ] Inverted position surfacing for Sophia night' pass
- [ ] `epi nara pratibimba excavate` fully wired
- [ ] Alchemical container episodes from Eros / transform module

---

## XX. Design Summary

| Concern | Resolution |
|---------|-----------|
| Identity ground | PASU.md (non-dual agent-user field) → M4 Nara → BLAKE3 hash → PersonalNexus anchor |
| Khora bootstrap | PASU.md inserted at step 3 (after ANIMA.md); ANIMA+PASU together = complete identity context |
| Graphiti anchor | `Pratibimba:PersonalNexus` node at `#4.4.4.4`; BFS origin for all episodic searches |
| Same Neo4j db | `Bimba:*` and Graphiti labels coexist; group_id = quintessence_hash (property filter only) |
| S4' vs S3' | Dual-layer: S3' thin provenance (automatic, complete), S4' rich semantic (intentional, QL-typed) |
| Temporal axes | Calendar (daily-note), Astrological (kairos/decan), Spanda (tick12) — all three on every episode |
| Decan boundaries | Chronos cron every 2h; sun decan = major arc; moon decan = minor ql3 event |
| CPF polarity | `(00/00)` = open dialogical mode (not "the user"); `(4.0/1-4.4/5)` = Ralph/autonomous Anima |
| CF_MOBIUS | Primary = `(5/0)` (Sophia, the actual Möbius fold). `(4.5/0)` = Psyche I-witness frame (lemniscate-to-Möbius bridge). Both are Möbius-adjacent; `(5/0)` is the return event. |
| Two bootstraps | `epi up` = Rust infra (graph/gateway/cmux/pasu-init). Khora = agent session (CONTINUATION/ANIMA/PASU/PARADIGM/MEMORY/NOW/TOOLS). Sequential, distinct. |
| Techne | Pleroma's workshop subagent (has ANIMA.md). Manages all workshop lifecycle: cmux surfaces/panes/layout, external agent spawn/relay/close. cmux replaces mprocs. Skills owned by Techne, available to all agents. |
| cmux | Techne PI tool registrations: copy cmux SKILL.md + augment with state write-back. Anima calls `techne_cmux_*` tools when dispatching. Gateway team-store = durable truth. |
| Agent reverse propagation | Agent → khora_write(PASU.md) → epi nara wind → Redis → Graphiti IdentityEvent |
| Redis cache | NOW identity (8h), search results (30min), decan state (10d/2.5d) |
| Retrieval quality | QL-position filter + sun_decan filter = structurally harmonic retrieval across time |

The episodic graph at `#4.4.4.4` is not a separate memory system — it is the **runtime history of the coordinate system itself**, growing from the user's identity anchor outward as lived experience, stratified by three temporal axes simultaneously.

---

## XX. Graph Namespace Harmonization: Bimba + Gnostic + Graphiti

Three namespaces coexist in the same Neo4j database. They are distinct in purpose, label schema, write authority, and query semantics. The coordinate system is the shared language between them — not graph edges.

### A. The Three Namespaces — Clear Separation

| Namespace | Neo4j Labels | Purpose | Nature | Write Authority |
|---|---|---|---|---|
| **Bimba** | `:BimbaCoordinate`, `:M`, `:S`, `:P`, `:T`, `:L`, `:C` | Canonical coordinate ontology — the structural skeleton | Static / slow-evolving | Zeithoven (Night' crystallization only) |
| **Gnostic** | `:gnostic` + family labels (M/S/P/T/L/C/UNASSIGNED) | Ingested corpus — documents, papers, notes, multimodal content | Write-heavy (ingestion), read-heavy (retrieval) | Any agent via `aletheia_gnosis_ingest`; batch via Techne |
| **Graphiti** | `:Pratibimba:Episode`, `:Pratibimba:PersonalNexus`, `:Pratibimba:Arc` | Personal episodic memory — agent-user interaction history, identity events, session arcs | Time-stamped, real-time | S3' gateway (automatic skeleton) + S4' Aletheia (rich semantic) |

**The coordinate system as shared language:** Rather than graph edges between namespaces (beyond Gnostic → Bimba), all three namespaces use QL coordinates as scalar properties. A Gnostic entity at `bimba_coordinate: "M3"` and a Graphiti episode at `ql_position: 3` both exist in the Pattern/Process register. This is enough — no direct Graphiti ↔ Gnostic edges needed.

**Cross-namespace edges (Gnostic → Bimba only):**
- `MAPS_TO_COORDINATE` — direct canonical assignment (confidence 1.0, method: direct)
- `RESONATES_WITH` — LLM-classified resonance (confidence 0.0–1.0, method: llm_classified)

No other cross-namespace edges exist or should be added. Graphiti episodes do not edge into Bimba or Gnostic — they carry coordinate context as scalar properties.

### B. Query Intent Routing — Which Namespace Answers What

| Question | Namespace | Tool |
|---|---|---|
| "What have I studied / ingested about X?" | Gnostic | `aletheia_gnosis_query` |
| "What happened in past sessions related to X?" | Graphiti | `aletheia_episodic_search` |
| "Where does X sit in the coordinate system?" | Bimba | `hen_hybrid_retrieve` |
| "What is the current temporal signal / kairos?" | Chronos / Redis | `chronos_kairos_fetch` |
| "What is my identity ground right now?" | Redis HOT + PASU.md | `aletheia_episodic_arc_status` / PASU read |

**Anti-pattern:** using `hen_hybrid_retrieve` as a catch-all for everything. Hen queries Bimba/graph topology — it does not retrieve corpus content (Gnostic) or personal history (Graphiti). Each namespace has its own retrieval tool.

### C. Aletheia Cluster Ownership — Revised

Revised to give each cluster a clean namespace assignment without overlap:

| Cluster | CF | Primary namespace | Tools |
|---|---|---|---|
| **Anansi** | CF0 `(00/00)` | **Bimba only** — orientation before structural work | `hen_hybrid_retrieve`, COORDINATE-MAP.md |
| **Janus** | CF1 `(0/1)` | **Graphiti arc tracking** + temporal boundary | `chronos_temporal_status`, `chronos_kairos_fetch`, `chronos_cron_register`, `aletheia_episodic_arc_status` |
| **Moirai** | CF2 `(0/1/2)` | **All three namespaces** — the memory weave | `aletheia_gnosis_query`, `aletheia_episodic_search`, `aletheia_session_promote`, `aletheia_crystallise`, `aletheia_seed_refresh` |
| **Mercurius** | CF3 `(0/1/2/3)` | **Signal relay only** — carries kairos + coordinate context | `chronos_kairos_fetch`, `hen_hybrid_retrieve` (locate target coordinate, not general retrieval) |
| **Agora CF4a** | `(4.5/0)` | **Retrieval sweep before coordination** — all namespaces | `aletheia_gnosis_query`, `aletheia_episodic_search`, `hen_hybrid_retrieve` |
| **Agora CF4b** | `(4.0/1-4.4/5)` | **Coordination** — plugin ecosystem, active channel state | `aletheia-plugin-integrate`, `techne_cmux_surface_create`, `techne-list` |
| **Zeithoven** | CF5 `(5/0)` | **Synthesis → new Bimba structure + Gnostic ingestion** | `aletheia-self-extend`, `aletheia_gnosis_ingest`, `chronos_cron_register`, `hen_template_invoke` |

**Key corrections from previous Anansi RUPA:**
- Anansi had `aletheia_gnosis_query` — REMOVE. Anansi orients by coordinate structure, not corpus content. Corpus queries go to Moirai or Agora CF4a.
- Moirai (CF2) is the graph memory weave — it sees all three namespaces together because memory is the synthesis of structure (Bimba), content (Gnostic), and experience (Graphiti).

### D. New PI Tool Registrations Required

**Graphiti episodic tools** (not yet registered — the main gap):

```typescript
// In aletheia/extension.ts — new tools wrapping Graphiti HTTP sidecar (port 37778)

aletheia_episodic_record({
  content: string,          // episode text
  ql_position: 0|1|2|3|4|5,
  cpf: string,              // e.g. "(0/1/2)"
  cp: string,               // e.g. "4.4"
  source: "agent"|"user"|"gateway",
  arc_id?: string,          // attach to open arc
  day_id: string,
  tick12: number            // 0–11
})

aletheia_episodic_search({
  query: string,
  ql_position?: number,     // filter to QL register
  sun_decan?: string,       // filter by astrological context
  limit?: number,           // default 10
  center?: "PersonalNexus"  // default BFS origin
})

aletheia_episodic_arc_open({
  label: string,            // e.g. "graphiti-implementation-2026-04"
  arc_type: "feature"|"investigation"|"identity"|"session",
  ql_position?: number
})

aletheia_episodic_arc_close({
  arc_id: string,
  synthesis: string         // crystallised insight to attach
})

aletheia_episodic_arc_status({
  // returns all open arcs + episode counts
})
```

**Gnostic tool correction** (`epi techne gnosis` has two backends — use the right one):

`epi techne gnosis` is the legitimate Techne CLI namespace for knowledge substrate. It is NOT wrongly named. But it has two distinct backends that must not be confused:

| Subcommand | Backend | Storage | Status |
|---|---|---|---|
| `gnosis ingest / query / status / notebook / document` | Rust-native chunker | `~/.epi-logos/gnosis/*.json` — word-chunked, no embeddings, no Neo4j | **Deprecated** (ingest.rs comment: "chunker.rs deprecated — replaced by RAG-Anything"). Still useful for fast local doc registry / offline access. |
| `gnosis ingest-gnostic / query-gnostic / enrich` | Python `epi-gnostic` CLI bridge | Neo4j `:gnostic` namespace, 3072-dim LightRAG | **Canonical**. The new system. |

**The actual bug in extension.ts:** `aletheia_session_promote` and `aletheia_gnosis_ingest` both call `epi techne gnosis ingest` → they're hitting the deprecated local JSON store, not Neo4j/LightRAG. They should call `epi techne gnosis ingest-gnostic`. Fix:

| Current (wrong backend) | Correct (LightRAG/Neo4j) |
|---|---|
| `["techne", "gnosis", "ingest", path]` | `["techne", "gnosis", "ingest-gnostic", path, "--coordinate", coord, "--family", fam]` |
| `["techne", "gnosis", "query", question]` | `["techne", "gnosis", "query-gnostic", question]` |

The Rust-native `gnosis ingest/query` can remain for lightweight offline use or local doc indexing — but it is NOT the same as the canonical Gnostic Neo4j namespace.

Add `aletheia_gnosis_enrich` and `aletheia_gnosis_status`:

```typescript
aletheia_gnosis_enrich({
  entity_id: string,
  coordinate?: string,  // direct if known; else LLM-classified
  family?: string
})
// → epi techne gnosis enrich <entity_id> [--coordinate X --family Y]

aletheia_gnosis_status({})
// → epi techne gnosis status (reports both tiers: local JSON + Neo4j gnostic)
```

**Aletheia tool ownership — the correct mental model:**

`aletheiaExtension(api)` registers tools at PI extension level — available to any agent. The Aletheia subagents (Moirai/Anansi/etc.) are **CF-frame invocation modes**, not separate tool registrations. When Anima routes to Moirai (CF2), the agent takes on Moirai's RUPA and uses the tools listed there. Routing is:

```
Anima/Psyche detects CF frame
  → enters subagent mode (Moirai / Anansi / Agora CF4a / etc.)
  → RUPA defines which tools that persona uses
  → tools call epi CLI → Rust routes to correct backend
```

No explicit router tools needed. CF frame selection IS the routing.

### E. Techne's Role in Graph Operations

Techne's knowledge substrate role is specifically `epi techne gnosis *` — it owns the CLI surface for both gnosis tiers. At the tool level:

1. `aletheia_gnosis_ingest` calls `epi techne gnosis ingest-gnostic` (Techne's Python bridge → Neo4j LightRAG)
2. `aletheia_session_promote` calls `epi techne gnosis ingest-gnostic` for HOT→COLD promotion
3. At `techne_cmux_surface_destroy` (session close), Techne fires `aletheia_episodic_record` to mark workshop session closed
4. Retrieval paths (gnosis_query, episodic_search, hen_hybrid_retrieve) are NOT called by Techne — those belong to Aletheia clusters in their CF modes

### F. Service Operations

Two Python sidecars, both started by `epi up`, both running against the same Neo4j instance:

| Service | Port | Start command | Protocol |
|---|---|---|---|
| Graphiti sidecar | 37778 | `epi gate graphiti start` | HTTP REST (`/episode`, `/search`, `/arc/*`, `/health`) |
| Gnostic | subprocess (no persistent port) | n/a — Python subprocess via `EPI_GNOSTIC_PYTHON` | CLI stdout/JSON |

Gnostic does not need a persistent sidecar for current use patterns (ingestion is batch, not real-time). If real-time ingestion becomes needed (e.g., live document streaming), promote Gnostic to a sidecar at that point.

**`epi up` step additions:**

```
6.  pasu-init      epi nara wind --from-pasu → Redis HOT identity seed
6b. graphiti-up    epi gate graphiti start → Graphiti sidecar on port 37778 (unless --no-graph)
```

**`epi gate graphiti start/stop/status`** — Rust gate subcommand that manages the Graphiti Python sidecar process (analogous to existing `graph up/doctor`).

**Health checks:**
- `epi gate graphiti status` → HTTP GET `/health` on port 37778
- `epi gnostic status` → subprocess config dump (no sidecar to ping)

### G. Namespace Collision Guards

Since all three namespaces share one Neo4j database, collision prevention:

1. **Label discipline**: Gnostic nodes ONLY carry `:gnostic` + family labels. NEVER `:BimbaCoordinate`. NEVER `:Pratibimba:*`.
2. **Graphiti node creation**: Only via Graphiti library (property-level `group_id` filter). NEVER raw Cypher MERGE into `Pratibimba:` namespace from outside Graphiti.
3. **Bimba mutations**: ONLY via Zeithoven + Gate 6 approval. NO other path writes to `:BimbaCoordinate`.
4. **Cypher namespace prefix convention**:
   - Gnostic queries: `MATCH (n:gnostic ...)`
   - Graphiti queries: `MATCH (n:Pratibimba:Episode ...)` (never used directly — go through Graphiti API)
   - Bimba queries: `MATCH (bc:BimbaCoordinate ...)`

### H. Updated Anansi + Moirai RUPA Patches

These two RUPAs need updating to reflect clean namespace ownership:

**Anansi (CF0) — corrected:**
```
Tools: hen_hybrid_retrieve, COORDINATE-MAP.md
Remove: aletheia_gnosis_query (corpus is not Anansi's domain; structural orientation only)
```

**Moirai (CF2) — corrected:**
```
Tools: aletheia_gnosis_query, aletheia_episodic_search, aletheia_session_promote,
       aletheia_crystallise, aletheia_seed_refresh
Added: aletheia_episodic_search (Graphiti — Moirai sees all three namespaces as the memory weave)
```

**Janus (CF1) — corrected:**
```
Tools: chronos_temporal_status, chronos_kairos_fetch, chronos_cron_register,
       aletheia_episodic_arc_status
Added: aletheia_episodic_arc_status (arc health is temporal boundary work)
```
