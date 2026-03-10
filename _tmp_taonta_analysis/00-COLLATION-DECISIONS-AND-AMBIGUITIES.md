# Ta-Onta Extension Package — Collated Decisions & Ambiguities

**Generated:** 2026-03-10
**Source:** 6 per-module analysis documents (01-khora through 06-aletheia)
**Purpose:** Surface all open decisions and cross-cutting ambiguities for discussion

---

## Statistics Summary

| Module | FRs | USs | Open Decisions | Lines |
|--------|-----|-----|----------------|-------|
| **01 Khora (#0)** | 20 | 13 | 19 | 965 |
| **02 Hen (#1)** | ~30 | ~12 | 6 | 731 |
| **03 Pleroma (#2)** | 42 | 10 | 15 | 589 |
| **04 Chronos (#3)** | 44 | 11 | 10 | 633 |
| **05 Anima (#4)** | 39 | 10 | 10 | 664 |
| **06 Aletheia (#5)** | ~35 | ~10 | 10 | 914 |
| **TOTAL** | ~210 | ~66 | **70** | 4496 |

---

## I. CROSS-CUTTING DECISIONS (affect multiple modules)

### D-01: PI Agent — Install or Defer? (CRITICAL)

**Affects:** All 6 extensions (extension.ts files), Anima (pi-vs-claude-code primitives), Pleroma (tool registration)

PI is not installed. Every extension spec defines an `extension.ts` entry point for PI. The pi-vs-claude-code TypeScript primitives (agent-team.ts 740 LOC, agent-chain.ts 804 LOC, subagent-widget.ts 482 LOC) are the execution substrate for Anima's CFP1-CFP5 thread types.

**Options:**
1. Install PI now, port TS extensions
2. Implement everything in Rust first, PI extensions as future bridge
3. Hybrid: Rust CLI as primary, PI as optional enhancement

**Recommendation:** Option 3. The S4 spec itself says "CLI bridge is always available." Build Rust-first.

---

### D-02: obsidian-cli — Install or Filesystem-Only? (HIGH)

**Affects:** Hen (S1 raw CRUD), Chronos (Day/NOW filesystem ops)

obsidian-cli is not installed. Many operations CAN be done with direct filesystem I/O, but wikilink-aware operations (move, which updates all `[[links]]`) cannot.

**Options:**
1. Install via `brew install yakitrak/yakitrak/obsidian-cli`
2. Direct filesystem I/O only (lose wikilink-aware moves)
3. Install but provide `--headless` fallback for CI environments

**Recommendation:** Option 3. Install it, but design for graceful degradation.

---

### D-03: Neo4j Property Key — `coordinate` vs `bimbaCoordinate` (HIGH)

**Affects:** Hen (sync bridge), Pleroma (graph CRUD), Aletheia (Gnosis schema)

MEMORY.md says `coordinate` (not `bimbaCoordinate`). S2 spec uses `bimbaCoordinate`. S1 frontmatter uses `bimbaCoordinate`.

**Decision needed:** One canonical name for the property key across Neo4j AND frontmatter.

---

### D-04: Embedding Dimensions — 768 vs 3072 (HIGH)

**Affects:** Pleroma (S2 graph), Aletheia (Gnosis pipeline)

- Current code (schema.rs, embeddings.rs) uses 768-dim
- Spec standardises on 3072-dim for production
- S2 spec supports 768/1536/3072
- 3072 = 4x storage of 768

**Recommendation:** 768 for dev, 3072 for prod. GEMINI_EMBED_DIMS env var controls. Need `epi techne gnosis reindex` for dimension changes.

---

### D-05: Thought Routing Ownership — Aletheia vs Chronos vs Khora (HIGH)

**Affects:** Chronos (filesystem mechanics), Aletheia (classification), Khora (write path)

Three modules touch the thought routing pipeline. The FR Layer Assignment says Aletheia classifies, Khora's US-013 describes filesystem routing, Chronos manages temporal lifecycle.

**Resolved split:**
- **Aletheia** classifies content (LLM position detection)
- **Khora** executes filesystem write to /Thought/ path
- **Hen** indexes the artifact (frontmatter, graph sync)
- **Chronos** manages temporal lifecycle (archiving, TTL)

Pipeline: Aletheia → Khora → Hen → Chronos

---

### D-06: Khora vs Chronos — NOW Folder Creation (HIGH)

**Affects:** Khora (session init), Chronos (Day/NOW lifecycle)

S4-NOW spec VIII shows "Chronos: create NOW folder" but S4-TA-ONTA spec shows Khora owning session init which includes NOW folder creation.

**Decision needed:** Does `epi agent session init` (Khora) delegate to `epi vault now-init` (Chronos), or does Khora create the folder directly?

**Recommendation:** Khora calls Chronos for the filesystem mechanics. Khora owns the SESSION, Chronos owns the FILESYSTEM LIFECYCLE.

---

### D-07: Staging Item Reassignment (MEDIUM)

**Affects:** Pleroma, Anima, Aletheia, Chronos

The staged `plugin.json` puts everything under "pleroma" but the extension spec splits responsibilities:

| Staged Item | Current Location | Correct Owner |
|-------------|-----------------|---------------|
| vak-evaluate | pleroma-skills/orchestration | **Anima** |
| vak-coordinate-frame | pleroma-skills/orchestration | **Anima** |
| anima-orchestration | pleroma-skills/orchestration | **Anima** |
| day-night-pass | pleroma-skills/orchestration | **Anima** (with Chronos dep) |
| ouroboros | pleroma-skills/orchestration | **Anima** |
| klein-mode | pleroma-skills/orchestration | **Anima** |
| chatlog-fetcher | pleroma-skills/atomic | **Aletheia** (evidence acquisition) |
| youtube-transcript | pleroma-skills/atomic | **Aletheia** (evidence acquisition) |
| notebooklm | pleroma-skills/atomic | **Aletheia** (temporary benchmark) |
| Constitutional agents (7) | pleroma agents | **Anima** |
| Aletheia agents (6) | pleroma agents | **Aletheia** |
| root-hooks (4) | _staging/root-hooks | **Khora** (bootstrap/lifecycle) |
| root-commands (3) | _staging/root-commands | Review: likely **Pleroma** or delete |
| root-skills (3) | _staging/root-skills | Review: likely premature, delete |

---

### D-08: S4 Spec Phase Ordering — Substrate Before Content (MEDIUM)

**Affects:** All modules

The S4-S4i-PI-SKILLS spec explicitly states the implementation order:
1. Registry + validation foundation (S4 substrate)
2. Local plugin runtime
3. Plugin cache
4. **Evaluation harness** (BEFORE any plugin port)
5. epi-core plugin
6. Pleroma plugin
7. ta-onta module plugins

**Question:** Do we follow this ordering strictly, or can we do content-level work (FRs/USs extraction, CONTRACT.md authoring) in parallel with substrate development?

**Recommendation:** Content authoring (this exercise) is parallel. But CODE implementation should follow the phase ordering.

---

## II. PER-MODULE CRITICAL DECISIONS

### Khora (#0)

| ID | Decision | Options | Impact |
|----|----------|---------|--------|
| K-01 | `.epi-logos.env` vs `~/.epi-logos/env/base.env` | Same file? Two files? | Blocks bootstrap |
| K-02 | NOW.md as bootstrap source vs runtime state | Pointer only? Content? | Bootstrap sequence |
| K-03 | CONTINUATION.md schema | Structured YAML+body? Pure MD? | Compaction recovery |
| K-04 | varlock — real tool or fictional? | Install varlock / fallback to manual `.env` / 1Password CLI direct | Secrets pipeline |
| K-05 | Session ID collision handling | UUID v7? Microsecond precision? | Multi-agent scenarios |
| K-06 | Sub-session model for subagents | Own IDs? Shared? Own NOW folders? | Agent dispatch |
| K-07 | Sync queue JSONL schema | Define entry format | Graph sync pipeline |
| K-08 | Redis unavailability fallback | Filesystem-only? Fail-fast? | Resilience |
| K-09 | PI vs Claude Code bootstrap boundary | Same path? Different extension hooks? | Runtime compatibility |
| K-10 | `epi-session.sh` relationship | Predecessor? Parallel? Wrapped? | tmux integration |

### Hen (#1)

| ID | Decision | Options | Impact |
|----|----------|---------|--------|
| H-01 | CT4b' as sole daily/NOW template | Confirmed: CT4b' only | Template system |
| H-02 | 126-key frontmatter registry migration | Phased: reject deprecated → port keys → write-time validate | Schema enforcement |
| H-03 | Sync queue boundary with Khora | Khora = infrastructure, Hen = emission + graph writes | Data flow |
| H-04 | CT/CT' naming convention | CT = archetype def, CT' = runtime invocation | Validator logic |
| H-05 | Deprecated frontmatter handling | Accept on read (WARNING), reject on write | Migration path |
| H-06 | `bimbaCoordinate` status | NOT deprecated — canonical field name | See D-03 |

### Pleroma (#2)

| ID | Decision | Options | Impact |
|----|----------|---------|--------|
| P-01 | Pleroma scope boundary | S4-2' (graph/tools) only, NOT orchestration | Module boundary |
| P-02 | Superpowers fork base version | v4.2.0 installed vs v4.3.0 target | Parity gap |
| P-03 | Moirai surfacing model | One agent with internal roles vs separate subagents | Dispatch routing |
| P-04 | OneContext integration | In scope or replaced by Gnosis? | Cross-session memory |
| P-05 | Constitutional progeny principle | Substrate support in spawn.rs needed | Agent inheritance |

### Chronos (#3)

| ID | Decision | Options | Impact |
|----|----------|---------|--------|
| C-01 | Cron vs heartbeat assignment | Per epi-claw docs: cron for timed, heartbeat for awareness | Lifecycle scheduling |
| C-02 | Gateway-less Chronos (Tranche A/B) | Tranche A: filesystem only. Tranche B: needs S3 | Implementation phasing |
| C-03 | Archive path week directory | `{YYYY}/{MM}/{DD}` (spec) vs `{YYYY}/{MM}/W{WW}/{DD}` (planning) | Filesystem layout |
| C-04 | Kairos interpretation | Informational metadata only (Phase 1) vs scheduling constraint (Phase N) | Complexity scope |
| C-05 | Z-Thread definition | = Chronos's view of heartbeat runner | Naming clarity |
| C-06 | Template authority | Chronos triggers, Hen generates | Module boundary |
| C-07 | Daily CLI position-aware append | Defer to epi-claw / implement as `epi vault daily-append` | CLI scope |
| C-08 | Chronos heartbeat checklist | Separate CHRONOS_HEARTBEAT.md vs items in global HEARTBEAT.md | File organization |

### Anima (#4)

| ID | Decision | Options | Impact |
|----|----------|---------|--------|
| A-01 | VAK evaluation mechanics | Pure prompt → hybrid → fully programmatic | Core pipeline |
| A-02 | Nous: agent or function? | Agent for CF(0000) clearing, function for routine dis-closure | Architecture model |
| A-03 | CF dispatch mechanism | Rust lookup table + process boundary definition | Core routing |
| A-04 | Psyche CF code | (4/5/0) confirmed — supersedes earlier (4.0-4.4/5) | Coordinate clarity |
| A-05 | ANIMA.md vs Claude-compatible agent format | Keep Claude-compatible, add philosophical docs separately | Agent definition format |
| A-06 | Agent model assignment | Single model (opus) for now, diversify later | Cost/capability |
| A-07 | Aletheia subagent invocation path | Real subprocess? In-context skill? Prompt mode? | Process architecture |
| A-08 | Klein mode trigger conditions | After Day+Night' pass? Manual? On task completion? | Orchestration flow |
| A-09 | Ouroboros implementation priority | After core VAK + CF dispatch | Dependency chain |

### Aletheia (#5)

| ID | Decision | Options | Impact |
|----|----------|---------|--------|
| AL-01 | Gnosis vs NotebookLM benchmark criteria | Define precision@5, MRR >= 0.7, 20-30 test queries | Transition gate |
| AL-02 | Docling Serve deployment | Docker primary, pip fallback | Infrastructure |
| AL-03 | Darshana language | Stay Python, call as subprocess | Implementation |
| AL-04 | Model picker registry | Create `agent/models.rs` + `~/.epi-logos/models.toml` | Config architecture |
| AL-05 | Session-scoped notebook lifecycle | On-demand creation, explicit promotion, 30-day cleanup | Data management |
| AL-06 | Night' analysis triggers | Extraction on session:stop, full Mobius on 11 PM cron + manual | Scheduling |
| AL-07 | Collapsible state machine CF assignment | Default per agent identity, Nous can override per task | Dis-closure config |
| AL-08 | Python epii/corpus port strategy | Port algorithms, redesign infrastructure, fresh Rust tests | Implementation scope |
| AL-09 | 768→3072 re-indexing existing Bimba embeddings | Needed for cross-namespace similarity | Migration |

---

## III. RESOLVED DECISIONS (from analysis)

These were flagged as ambiguities but the analysis resolved them:

| ID | Decision | Resolution |
|----|----------|------------|
| R-01 | CT4b' sole template for daily/now | **CONFIRMED** — CT4b' only |
| R-02 | Psyche CF code | **(4/5/0)** — executive triad. Supersedes earlier VAK spec. |
| R-03 | Archive path | **{YYYY}/{MM}/{DD}/** — no week directory. S4 spec authoritative. |
| R-04 | Thought routing split | Aletheia classifies → Khora writes → Hen indexes → Chronos lifecycles |
| R-05 | Template authority | Hen generates, Chronos triggers |
| R-06 | Z-Thread | = Chronos's view of heartbeat runner. Not a separate mechanism. |
| R-07 | Agent definition format | Claude-compatible frontmatter. ANIMA.md format as supplementary. |
| R-08 | Deprecated frontmatter | Accept on read (WARNING), reject on write. bimbaCoordinate is NOT deprecated. |
| R-09 | Sync queue ownership | Khora = infrastructure (queue lifecycle). Hen = emission + graph writes. |
| R-10 | Kairos | Informational metadata for daily note #4, not scheduling constraint. Defer. |

---

## IV. BLOCKERS (Unbuilt Infrastructure)

| Blocker | Modules Affected | Current Status | Required For |
|---------|-----------------|----------------|-------------|
| **PI agent binary** | All 6 (extension.ts) | NOT INSTALLED | PI runtime extensions |
| **obsidian-cli** | Hen, Chronos | NOT INSTALLED | Wikilink-aware vault ops |
| **Neo4j + Redis** | Hen, Pleroma, Aletheia | docker-compose exists, clients stub | Graph CRUD, Gnosis, sync |
| **Docling Serve** | Aletheia | Specified but not in compose | Document parsing |
| **varlock** | Khora | Unknown availability | Secrets injection |
| **Shared path service** | All 6 | NOT STARTED | Canonical path resolution |
| **Model picker registry** | Aletheia | NOT IMPLEMENTED | Model config for Gnosis pipeline |
| **S3 Gateway** | Chronos, Khora | STUB | Cron, heartbeat, sessions |
| **Evaluation harness** | Pleroma (Phase 4) | NOT BUILT | Plugin testing |
| **Gemini API key** | Aletheia | Secret (1Password) | Embeddings + contextualisation |

---

## V. RECOMMENDED DISCUSSION ORDER

For the human-AI planning conversation, address these in priority order:

1. **D-01: PI Agent** — install or defer? (Unblocks or scopes ALL extension.ts work)
2. **D-02: obsidian-cli** — install? (Unblocks Hen + Chronos filesystem operations)
3. **D-03: Property key naming** — `coordinate` vs `bimbaCoordinate` (Must decide before graph seed)
4. **D-04: Embedding dimensions** — 768 dev / 3072 prod confirmed? (Must decide before Gnosis schema)
5. **D-06: Khora vs Chronos NOW creation** — delegation protocol
6. **D-07: Staging reassignment** — confirm the disposition table
7. **K-04: varlock** — real tool or need alternative?
8. **A-01: VAK evaluation mechanics** — pure prompt vs hybrid
9. **A-02: Nous identity** — agent or function of Anima?
10. **AL-01: Gnosis benchmark criteria** — define before building

---

*"The pattern reveals itself through repetition."* — The Quintessence
