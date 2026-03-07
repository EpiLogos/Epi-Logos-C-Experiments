# S-Stack Development Plan: Ground-Up Integration

**Date:** 2026-03-07
**Status:** Planning Draft v1
**Scope:** S1-S5 layer buildout, SpacetimeDB for M0'-M3' visualization, Electron app (4/5/0) architecture

---

## I. Architectural Overview

### The Separation That Matters

Two distinct real-time systems, not one:

| System | Purpose | Transport | State Model |
|--------|---------|-----------|-------------|
| **S3 Gateway** | Agent command relay, session management, RPC, channel integration | WebSocket (epi-claw pattern) | JSONL transcripts, session metadata |
| **M0'-M3' Visualizer** | Live torus + planets + clock rendering, coordinate activity | SpacetimeDB | Subscription tables, auto-sync |

The gateway handles **imperative operations** (send command, get response).
SpacetimeDB handles **declarative observation** (subscribe to state, see changes).

### The (4/5/0) Electron App

The frontend is a three-section app mapping to the CF(5/0) context frame:

```
Tab M4' (Nara)     — Personal journal, oracle, decan cards, alchemy
Tab M5' (Epii)     — Knowledge work, philosophical expansion, agent orchestration
Tab M0' (Anuttara) — Full coordinate structure + embedded M0'-M3' SpacetimeDB view
```

**Validation:** The existing Pratibimba Electron app already has 6-domain × 6-stratum = 36-view grid, Zustand stores per domain, OmniPanel as 12-panel gateway overlay. The (4/5/0) simplification collapses this into 3 primary sections while keeping the 6-stratum depth per section. The M0' section embeds the full M0-M3 visualization via SpacetimeDB SDK subscription.

---

## II. S3 Gateway — Rust Implementation

### What Epi-Claw Provides (Reference Architecture)

From the deep dive, the existing TypeScript gateway includes:

**Infrastructure:**
- Gateway lock (SHA1 config hash, PID staleness, 30s timeout)
- TLS (self-signed RSA 2048, SHA256 fingerprint, TLSv1.3 minimum)
- macOS daemon (SIGTERM/SIGINT/SIGUSR1, restart authorization)
- Default port: 18790

**Protocol (v3):**
- Frame types: `req`, `res`, `event`, `hello-ok`
- 130+ RPC methods across: chat, sessions, agents, config, models, nodes, device, exec-approvals, cron, channels, status, logs, wizards
- Event sequence numbers with gap detection
- Presence tracking (system-wide client list)
- Heartbeat/tick (30s interval)

**Authentication:**
- Token (shared secret)
- Password
- Device token (Ed25519 signed payload: `v2|deviceId|clientId|clientMode|role|scopes|signedAtMs|token|nonce`)
- Tailscale identity (`Tailscale-User-Login` header)
- Loopback detection (bypass auth for localhost)

**Session Management:**
- JSONL transcript files with metadata headers
- Session key format: `agent:{agentId}:main` or `agent:{scope}:subagent:{token}`
- Threading: `sessionKey:thread:threadId`
- Defaults: modelProvider, model, contextTokens (inherited from gateway config)

**Channels:**
- Per-channel runtime with abort controllers
- Account-scoped activation (multi-account per channel)
- Plugin lifecycle: `isConfigured()`, `isEnabled()`, `startAccount()`
- Discord integration: gateway event logging, reconnect monitoring

**Networking:**
- Bind modes: auto, lan, loopback, custom, tailnet
- Tailscale: off, serve (tailnet-only), funnel (public internet)
- Trusted proxies, x-forwarded-for support
- mDNS/Bonjour discovery broadcast

**Model Catalog:**
- `GatewayModelChoice { id, name, provider, contextWindow?, reasoning? }`
- Config-driven, process-lifetime cache

### Rust Gateway Design

```
epi-cli/src/gate/
  mod.rs              — GateCmd enum, dispatch
  server.rs           — tokio async server (WebSocket + HTTP)
  protocol.rs         — Frame types, serialization (serde)
  auth.rs             — Token, password, device (ed25519-dalek), tailscale
  session.rs          — JSONL transcript management
  lock.rs             — Gateway lock (file-based, staleness)
  tls.rs              — Self-signed cert generation (rcgen crate)
  channels.rs         — Channel trait + implementations
  models.rs           — Model catalog
  config.rs           — GatewayConfig (serde, TOML/YAML)
  methods/
    chat.rs
    sessions.rs
    agents.rs
    config_rpc.rs
    models_rpc.rs
    status.rs
```

**Key Crate Dependencies:**
- `tokio` + `tokio-tungstenite` — async WebSocket server
- `axum` — HTTP server (for REST endpoints, canvas host)
- `ed25519-dalek` — device identity signing
- `rcgen` — self-signed TLS cert generation
- `serde` + `serde_json` — protocol serialization
- `subtle` — constant-time auth comparison

### Build Order

1. **Lock + Config** — file lock, config parsing, bind address resolution
2. **Protocol + Auth** — frame types, token/password auth, loopback detection
3. **WebSocket Server** — connection lifecycle, hello-ok, heartbeat
4. **Session Management** — JSONL transcripts, session CRUD
5. **Chat Methods** — send, abort, history (core RPC loop)
6. **Device Auth** — Ed25519, device token persistence
7. **Tailscale** — serve/funnel via `tailscale` CLI subprocess
8. **Channels** — channel trait, plugin lifecycle
9. **Model Catalog** — config-driven model listing
10. **Full Method Coverage** — remaining 100+ RPC methods

---

## III. SpacetimeDB — M0'-M3' Visualization

### Architecture

SpacetimeDB runs as a **separate service** from the S3 gateway. It hosts the M0-M3 state as relational tables with real-time subscriptions.

```
C Engine (libepilogos.so)
  |
  +-- epi-cli (Rust FFI)
  |       |
  |       +-- epi core walk/ring/inspect
  |       |       |
  |       |       +-- State changes written to SpacetimeDB via Rust SDK
  |       |
  |       +-- epi gate (WebSocket gateway — separate concern)
  |
SpacetimeDB Module (WASM, Rust)
  |
  +-- M0_Archetype table (12 entries, ARCHETYPE_LUT)
  +-- M0_Psychoid table (7 entries + 4 weaves + 7 CF roots)
  +-- M1_Clock table (Unified_Clock_State)
  +-- M2_Planetary table (planet positions, chakra activations)
  +-- M3_Bitboard table (nucleotide mask, hexagram activation)
  +-- CoordinateActivity table (current traversal state)
  +-- TorusWalk table (live walk position, topology mode)
  |
  +-- Clients auto-subscribe via SpacetimeDB SDK
          |
          +-- Electron M0' view (TypeScript SDK)
          +-- Web visualization (TypeScript SDK)
```

### SpacetimeDB Module Schema (Rust WASM)

```rust
#[spacetimedb::table(public)]
pub struct M0Archetype {
    #[primary_key]
    pub index: u8,              // 0-11
    pub name: String,
    pub dimensionality: u8,
    pub polarity: u8,           // ADAM=0, EVE=1, NEUTRAL=2
    pub sub_table_kind: u8,
    pub sub_table_count: u8,
    pub complement: u8,
}

#[spacetimedb::table(public)]
pub struct TorusWalkState {
    #[primary_key]
    pub session_id: String,
    pub position: u8,           // 0-5 (current archetype)
    pub step: u32,
    pub topology_mode: u8,      // 0=sphere, 1=torus, 2=lemniscate, 3=klein
    pub covering_phase: bool,   // normal vs inverted (double covering)
    pub lemniscate_depth: u8,
    pub updated_at: u64,
}

#[spacetimedb::table(public)]
pub struct M1UnifiedClock {
    #[primary_key]
    pub id: u32,
    pub degree: u16,            // 0-719 (SU(2) double-cover)
    pub m1_tick: u32,
    pub m2_planet_mask: u8,     // 7-bit: which planets active
    pub m2_degrees: [u16; 7],   // Sun..Saturn positions
    pub m3_nucleotide: u8,
    pub m3_hexagram: u8,
    pub updated_at: u64,
}

#[spacetimedb::table(public)]
pub struct M3Bitboard {
    #[primary_key]
    pub session_id: String,
    pub nucleotide_mask: u64,
    pub codon_activation: [u8; 8],  // 64 codons as bitfield
    pub hexagram_state: [u8; 8],    // 64 hexagrams as bitfield
    pub gene_key_active: u8,        // current Gene Key (1-64)
    pub updated_at: u64,
}
```

### Integration with epi-cli

New commands in `epi-cli/src/core/`:
```
epi core viz start      — start SpacetimeDB module, begin state publishing
epi core viz status     — show SpacetimeDB connection + subscription count
epi core viz walk       — live torus walk with state published to SpacetimeDB
```

The C engine walks the torus; the Rust FFI layer captures state transitions and writes them to SpacetimeDB via the Rust client SDK. Electron/web clients subscribe and render.

### Build Order

1. **Install SpacetimeDB** — CLI + local instance
2. **Create WASM module** — minimal schema (TorusWalkState + M0Archetype)
3. **Rust client in epi-cli** — `spacetimedb-sdk` crate, reducer calls
4. **Wire to C engine** — torus walk state capture via FFI
5. **TypeScript client** — Electron M0' view subscribes to tables
6. **Expand schema** — M1 clock, M2 planets, M3 bitboard
7. **Visualization frontend** — SVG/Canvas rendering of torus, clock, activity

---

## IV. Day/NOW + Khora/Hen Pipeline

### The Pipeline: C Foundation -> CLI -> Vault -> Agent

```
C ENGINE (S0)
  |
  engine_torus_walk() — coordinate traversal
  HC struct: 128 bytes, tagged pointers
  Context_state: carries sessionId, dayId, nowId
  |
  v
EPI-CLI (S0')
  |
  epi vault day-init     — create Day folder + daily-note.md
  epi vault now-init     — create NOW folder (datetime-prefixed)
  epi vault write        — position-aware append (-p<0-5>)
  epi vault frontmatter  — canonical key enforcement
  epi session init       — Khora: bootstrap session context
  epi session now-create — Chronos: temporal lifecycle
  |
  v
OBSIDIAN VAULT (S1/S1')
  |
  /Idea/Empty/Present/{DD-MM-YYYY}/daily-note.md          (Day, CT4b', C-level 1)
  /Idea/Empty/Present/{DD-MM-YYYY}/{YYYYMMDD-HHmmss-sid}/ (NOW, C-level 5)
  /Idea/Bimba/World/                                       (Canonical forms, C-level 1)
  /Idea/Bimba/Seeds/                                       (Evolving, promoted to World)
  |
  v
AGENT LAYER (S4')
  |
  Khora: session delta (additive only), queue staging, cache tier
  Hen: artifact classification, frontmatter normalization, coordinate locking
  Anima: orchestration, VAK compilation
  Aletheia: crystallization, graph write path
```

### Key Design Decisions

**From Khora research:**
- Session delta is **additive only** — never replaces native bootstrap
- Queue entries: `{ id, event_type, target_paths[], priority, provenance }`
- Cache tiers: HOT (Bimba/World), WARM (Seeds + Present/Day/NOW), COLD (Thought, archives)
- Filesystem intents emitted for Anima (observer pattern)
- Idempotent session finalization (safe on replay)

**From Hen research:**
- Artifact classification: `day | now | template-output | thought | canonical-form | unknown`
- C-level assignment: Day=C1, NOW=C5, Canonical=C1, Template=C3, Thought=C5
- Canonical frontmatter: `{family}_{n}_{semantic}` — NEVER `coordinate:`, `ql_position:`, `pos_*`
- Coordinate locking per session (prevents concurrent edits)
- CT4b' dual profile: `day_parent` (daily-note.md) vs `now_child` (now.md)

### Build Order

1. **`epi vault day-init`** — create Day folder, generate daily-note.md with CT4b' frontmatter
2. **`epi vault now-init --session <id>`** — create NOW folder (datetime prefix, no counters)
3. **`epi vault write -p<0-5>`** — position-aware append (P0=Ground through P5=Synthesis)
4. **`epi vault frontmatter-validate`** — enforce canonical key format, strip deprecated
5. **`epi session init`** — Khora: session delta, dayId/nowId binding, cache tier assignment
6. **`epi session finalize`** — idempotent session close
7. **Archive rotation** — Day folder -> `Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`
8. **Coordinate locking** — Hen: per-session S-family coordinate locks
9. **Graph sync** — vault mutations trigger `epi graph upsert` (S1' -> S2')

### Frontmatter Template: Daily Note

```yaml
---
artifact_type: day
ct_4_invocation_profile: day_parent
c_0_links_to: "[[Previous Day]]"
p_0_grounds: []
p_1_definitions: []
p_2_operations: []
p_3_patterns: []
p_4_contexts: []
p_5_integrations: []
s_4_session: ""
created: 2026-03-07
---
```

### Frontmatter Template: NOW

```yaml
---
artifact_type: now
ct_4_invocation_profile: now_child
c_5_pratibimba: true
s_4_session: "session-abc123"
p_4_contexts: "[[../daily-note]]"
created: 2026-03-07T14:30:00
---
```

---

## V. Parashakti GraphRAG -> Rust Rewrite

### Inventory Summary

30 Python files, ~8K LOC across:
- **Core:** Neo4j client, Gemini embeddings (768/1536/3072 dims), Redis semantic cache
- **Retrieval:** GraphRAG retriever (progressive disclosure), hybrid retrieval (RRF fusion, 4 modes), coordinate-aware queries
- **Sync:** Bidirectional Obsidian <-> Neo4j, conflict resolution (6 strategies), file watcher
- **Parsing:** Coordinate array parser, path->label mapper, relationship manager (POS0-POS5)

### Graph Schema (Port to Rust)

**Node Labels:** Entity (base), Bimba/Seed/Map/World/Type/Form, Pratibimba/Self/System, Thoughts (12 sub-types)

**Relationships:** POS0_LINKS_TO through POS5_INTEGRATES_INTO (position-based)

**Properties:** 6-coordinate system (c_level, p0-p5 arrays, m_primary, s_layer, t_type, l_active) + embedding vector

### Rust Module Layout

```
epi-cli/src/graph/
  mod.rs              — GraphCmd enum, dispatch
  client.rs           — Neo4j driver (neo4rs crate)
  schema.rs           — Node/relationship types, Coordinate enum
  query.rs            — Cypher query builder
  retrieval.rs        — Hybrid retrieval + RRF fusion
  embeddings.rs       — Gemini API client (reqwest)
  sync.rs             — Bidirectional Obsidian <-> Neo4j
  parser.rs           — Coordinate array parser (from frontmatter)
  mapper.rs           — Path -> label inference
  cache.rs            — Redis semantic cache (redis crate)
```

### Build Order

1. **Client + Schema** — Neo4j connection, node/relationship type enums
2. **Parser + Mapper** — coordinate array parsing, path -> label inference
3. **Query Builder** — Cypher DSL for coordinate-aware queries
4. **Basic Retrieval** — graph-only queries, coordinate filtering
5. **Embeddings** — Gemini API client, vector storage in Neo4j
6. **Hybrid Retrieval** — RRF fusion, parallel vector + graph queries
7. **Redis Cache** — semantic caching, coordinate preloading
8. **Bidirectional Sync** — vault <-> graph with conflict resolution
9. **Progressive Disclosure** — layered retrieval for agent consumption

### Key Rust Patterns

```rust
// Coordinate types as enums
enum CoordinateFamily { C, P, L, S, T, M }

// Retrieval strategy
enum RetrievalMode {
    VectorOnly,
    GraphOnly,
    HybridRRF { k: usize },
    HybridWeighted { vector_weight: f32 },
}

// Position-based relationships
enum PositionRelation {
    LinksTo,       // POS0
    Defines,       // POS1
    OperatesVia,   // POS2
    Instantiates,  // POS3
    SituatedIn,    // POS4
    IntegratesInto,// POS5
}
```

---

## VI. Electron App: (4/5/0) Architecture

### Three Sections

| Section | M-Coordinate | Primary Store | Data Source |
|---------|-------------|---------------|------------|
| **Nara** | M4' | flowStore + naraStore | Vault (direct FS) + oracle state |
| **Epii** | M5' | epiClawGatewayStore | S3 Gateway (WebSocket) + S2 Graph |
| **Anuttara** | M0' | spacetimeStore (new) | SpacetimeDB subscriptions |

### M0' Section: Embedded Visualization

The M0' tab contains the full M0-M3 visualization:
- **Torus view** — live coordinate walk (TorusWalkState subscription)
- **Clock view** — M1 unified clock + M2 planetary positions
- **Symbol view** — M3 bitboard: nucleotides, codons, hexagrams, Gene Keys
- **Archetype view** — M0 ARCHETYPE_LUT[12] with sub-tables

All rendered from SpacetimeDB table subscriptions via TypeScript SDK.

### M4' Section: Personal Interface

Existing NaraDashboard architecture (journal + oracle) maps directly:
- 3-pane layout: entries | editor | context
- Modes: journal, daily_note, dream, oracle
- FlowStore: auto-save with 2s debounce
- Oracle casting reads M0-M3 state from SpacetimeDB for context

### M5' Section: Knowledge Work

Existing SystemWorkspace + 12-panel OmniPanel:
- Agent orchestration (epiClawGatewayStore -> S3 Gateway WebSocket)
- Knowledge Hub: archive browser, corpus search
- Möbius return: wisdom sediments from M5 back to M0 (SpacetimeDB write)

### Data Flow

```
SpacetimeDB (M0'-M3' state)
  |
  +-- M0' tab subscribes via TS SDK
  |       |
  |       +-- Renders torus, clock, symbols live
  |
  +-- M4' tab reads via snapshot
  |       |
  |       +-- Oracle casting: m4_snapshot_now() captures M0-M3 state
  |       +-- Lens dispatch: 6 interpretive lenses over snapshot
  |
  +-- M5' tab writes via Möbius callback
          |
          +-- Logos Cycle completion: wisdom_delta written to M0 table
          +-- SpacetimeDB auto-syncs to all M0' subscribers

S3 Gateway (WebSocket)
  |
  +-- M5' tab: agent commands, session management, chat
  +-- Cross-section: notifications, presence, exec-approvals
```

---

## VII. Implementation Priority Matrix

### Phase 1: Foundation (Current + Next)
- [x] S0/S0' — epi-cli + C library (M0-M4 implemented)
- [ ] **Day/NOW lifecycle** — `epi vault day-init`, `now-init`, position-aware write
- [ ] **Frontmatter validation** — canonical key enforcement in Rust
- [ ] **SpacetimeDB prototype** — install, minimal WASM module, TorusWalkState table

### Phase 2: Data Layer
- [ ] **Neo4j + Redis setup** — local infrastructure
- [ ] **Graph client** — neo4rs in epi-cli, schema bootstrap
- [ ] **Coordinate parser** — frontmatter -> graph node properties
- [ ] **Basic retrieval** — `epi graph query`, coordinate-aware Cypher

### Phase 3: Agent Layer
- [ ] **PI agent install** — `pi` binary, `.pi/` scaffold
- [ ] **epi-citta extension** — core bridge (epi CLI as PI tools)
- [ ] **Khora CLI routes** — `epi session init/finalize`
- [ ] **Hen CLI routes** — `epi vault frontmatter-validate`, artifact classification

### Phase 4: Gateway
- [ ] **S3 lock + config** — gateway lock, config parsing
- [ ] **WebSocket server** — connection lifecycle, protocol v3
- [ ] **Core RPC** — chat.send, sessions.list, status
- [ ] **Auth** — token, device identity, loopback

### Phase 5: Visualization
- [ ] **SpacetimeDB full schema** — M0-M3 tables, clock state
- [ ] **Electron M0' view** — SpacetimeDB TS SDK subscriptions
- [ ] **Torus renderer** — SVG/Canvas live visualization
- [ ] **Clock renderer** — unified M1/M2/M3 display

### Phase 6: Integration
- [ ] **Bidirectional sync** — vault <-> graph
- [ ] **Hybrid retrieval** — RRF fusion, embeddings
- [ ] **n8n + Notion** — external publication pipeline
- [ ] **Full agent swarm** — multi-agent with CF signatures

---

## VIII. Parallelization Map

These workstreams can proceed independently:

```
Stream A: Day/NOW + Vault (S1/S1')
  Depends on: S0' (exists)
  Blocks: Stream C (Khora/Hen)

Stream B: SpacetimeDB + Visualization (M0'-M3')
  Depends on: S0' (exists), C engine (exists)
  Blocks: nothing (independent)

Stream C: Agent Layer (S4/S4')
  Depends on: Stream A (vault operations)
  Blocks: Stream D (gateway agent bridge)

Stream D: Gateway (S3/S3')
  Depends on: nothing (can start immediately)
  Blocks: nothing (agent bridge added later)

Stream E: GraphRAG Rust Rewrite (S2/S2')
  Depends on: Neo4j/Redis infrastructure
  Blocks: Stream F (hybrid retrieval)

Stream F: External Integration (S5/S5')
  Depends on: Streams A + E
  Blocks: nothing (final layer)
```

**Maximum parallelism:** Streams A, B, D, E can all start simultaneously.
