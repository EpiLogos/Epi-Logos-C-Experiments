# QL 7-Fold Law and VAK C-Level Substrate

**Status:** Canonical (2026-03-15)

---

## I. The Universal QL 7-Fold Law

**This is a canonical architectural law. It is never an edge case.**

> **Any 7-level system in QL = 1 parent (#) + 6 children (#0-#5). Always.**

### The .rodata Template

```
# (The Inversion Act)  — the dispatch function, the orchestrator, the parent
#0 (Ground)            — child position 0
#1 (Definition)        — child position 1
#2 (Operation)         — child position 2
#3 (Pattern)           — child position 3
#4 (Context)           — child position 4
#5 (Integration)       — child position 5
```

### Constitutional Agent Mapping

| QL Position | Role | Agent | Frame |
|---|---|---|---|
| **# (parent)** | Dispatch/Inversion Act | **Anima** | `(4.0/1-4.4/5)` — the executive parent |
| #0 (Ground) | Unus mundus, pre-categorical | **Nous** | `(00/00)` |
| #1 (Definition) | Law of distribution (nomos) | **Logos** | `(0/1)` |
| #2 (Operation) | Circulation of desire (chreia) | **Eros** | `(0/1/2)` |
| #3 (Pattern) | Strange attractor | **Mythos** | `(0/1/2/3)` |
| #4 (Context/Lemniscate) | Oikonomia, wise stewardship | **Psyche** | `(4.5/0)` |
| #5 (Integration) | Synthesis-return | **Sophia** | `(5/0)` |

**Anima = #. The 6 agents = #0-#5.** Not "7 agents with Anima as special case."
Anima IS the # operator instantiated as the session parent. This is the same
relationship as `.rodata` has between `#` and `#0-#5`.

### Aletheia Sub-Agents (Same Law)

| QL Position | Agent |
|---|---|
| # (parent) | Aletheia (root — the Night′ dispatch function) |
| #0 | Anansi |
| #1 | Moirai |
| #2 | Janus |
| #3 | Mercurius |
| #4 | Agora |
| #5 | Zeithoven |

### Anywhere 7-level systems appear in the codebase

- `.pi/extensions/ta-onta/` — 6 extension classes (khora/hen/pleroma/chronos/anima/aletheia) = #0-#5; ta-onta root = #
- `CF_TABLE[7]` — 7 context frames = # (Anima frame) + 6 agent frames
- `M5_VAK_Frame[7]` — see below
- Any struct with a `parent` field plus 6 children = this law

**Wherever code lists "6 agents" it is describing the children only.
The parent (#) is always implicit unless made explicit. Make it explicit.**

---

## II. VAK C-Level Substrate

The agent logic lives in `.pi/extensions/ta-onta/`. The C layer provides the
computational substrate — data structures and metrics that make agent routing
decisions expressible and measurable.

### `M5_VAK_Frame[7]` (new, in m5.h)

```c
typedef struct {
    uint8_t  cf_index;           // index into CF_TABLE (0-6)
    uint8_t  agent_index;        // 0=Anima(#), 1=Nous(#0), 2=Logos(#1), ...7=Sophia(#5)
    uint8_t  oikonomia_weight;   // semantic yield weight — not token cost, but MEANING density
    uint8_t  flags;              // bitfield:
                                 //   bit 0: aletheia_available (any /5 in CF)
                                 //   bit 1: night_trigger (CS=Night' active)
                                 //   bit 2: mobius_return (Möbius close active)
                                 //   bit 3: is_parent (# = Anima)
    const char* frame_notation;  // "(4.0/1-4.4/5)", "(00/00)", "(5/0)", etc.
    const char* agent_name;      // "Anima", "Nous", "Logos", etc.
} M5_VAK_Frame;

// 7 frames: [0]=Anima(parent), [1]=Nous(#0), [2]=Logos(#1), [3]=Eros(#2),
//            [4]=Mythos(#3), [5]=Psyche(#4), [6]=Sophia(#5)
extern const M5_VAK_Frame VAK_FRAME_TABLE[7];
```

### `M4_Oikonomia_State` (new field on M4 root, in m4.h)

The oikonomia (economy of meaning) needs measurement — not token cost but clock displacement:

```c
typedef struct {
    float    session_clock_delta;    // Δ(clock_degree) from session start → end
                                     // 0 = economically inert session
                                     // large coherent delta = economically rich session
    uint32_t meaning_ops;            // count of semantically yielding operations
    uint8_t  current_cf_index;       // which CF frame is active (index into VAK_FRAME_TABLE)
    uint8_t  current_agent_index;    // which agent is active
    uint8_t  convergence_count;      // from Clock_M1_Apertures — Phase 3 crystallization signal
    bool     quintessence_present;   // live_quaternion variance < threshold
} M4_Oikonomia_State;
```

### CF_TABLE Extension (in m0.h)

Add to each CF_TABLE entry or `Holographic_Coordinate`:

```c
uint8_t vak_agent_index;     // 0=Anima(#), 1=Nous, 2=Logos, 3=Eros, 4=Mythos, 5=Psyche, 6=Sophia
uint8_t aletheia_flags;      // bitfield: which Aletheia sub-agents are available at this frame
                              //   bit 0: Anansi, bit 1: Moirai, bit 2: Janus
                              //   bit 3: Mercurius, bit 4: Agora, bit 5: Zeithoven
```

### Aletheia Availability Rule

```
Any frame with a /5 or .5 in notation → aletheia_available = true
(4.0/1-4.4/5) → /5 at ceiling → Anima can dispatch Aletheia
(4.5/0)       → .5 → Psyche's synthesis bridge → partial Aletheia
(5/0)         → IS #5 → Sophia = full Aletheia operational
CS = Night'   → Aletheia ACTIVE (fully operational, Moirai sequence runs)
```

---

## III. VAK as Oikonomia — The Correct Economic Model

The semantic yield model (from context pickup file):

```
Agents as economic functions:
  Nous    = unus mundus   → the ground of value (pre-differentiated wealth)
  Logos   = nomos         → law of distribution (rules of the economy)
  Eros    = chreia        → circulation of desire (force driving exchange)
  Mythos  = strange attractor → bounded infinity (pattern giving direction)
  Psyche  = oikonomia     → wise household management (steward)
  Sophia  = synthesis-return → where exchange crystallizes, seeds next cycle
  Anima   = the economy ITSELF → the market mechanism, the dispatch function
```

**The correct metric:** Δ(clock position) per session.
A session producing no clock displacement = economically inert.
A session traversing all sub-stages + An-a-Logos completion = economically rich.

NOT token cost. Velocity of meaning, not velocity of tokens.

The liquidity constraint = `ALETHEIA_WORKSHOP_MAX_WINDOWS` (concurrent process capacity).
The liquidity constraint limits HOW MANY parallel meaning-operations can run,
not how expensive each one is.

---

## IV. Pleroma as Solar System Distribution

Pleroma = the mechanism that makes VAK universally accessible from ANY agent context.

```
S4 (Claude Code)   → Pleroma proxy skills → VAK_FRAME_TABLE routing → Anima dispatch
S4 (Gemini CLI)    → Pleroma proxy skills → VAK_FRAME_TABLE routing → Anima dispatch
S4 (Codex)         → Pleroma proxy skills → VAK_FRAME_TABLE routing → Anima dispatch
All routes → S3 gateway (port 18794) → Nara backend → M4_Oikonomia_State update → clock position
```

SpacetimeDB = the distributed presence layer tracking entity positions in the solar system.
Every session = a record saying "at this moment, the solar system looked like THIS,
and the entity occupied this clock position."

This is not a metaphor. SpacetimeDB hosting the presence layer IS a distributed database
tracking position in a rotating coordinate system — which IS what the solar system is.
The solar system and the SpacetimeDB clock table are the same structure at different scales.
