---
coordinate: "S3'"
c_4_artifact_role: "spec"
c_1_ct_type: "CT4a"
c_3_created_at: "2026-04-24T14:00:00Z"
c_3_day_id: "24-04-2026"
c_0_source_coordinates:
  - "[[S0]]"
  - "[[S0']]"
  - "[[S1]]"
  - "[[S1']]"
  - "[[S1'Cx]]"
  - "[[S2]]"
  - "[[S2']]"
  - "[[S3]]"
  - "[[S3']]"
  - "[[S4]]"
  - "[[S4']]"
  - "[[S5]]"
  - "[[S5']]"
  - "[[Anima]]"
  - "[[Epii]]"
  - "[[Aletheia]]"
  - "[[Psyche]]"
  - "[[Nous]]"
  - "[[Sophia]]"
  - "[[Khora]]"
  - "[[Hen]]"
  - "[[Pleroma]]"
  - "[[Chronos]]"
  - "[[Graphiti]]"
  - "[[Gnostic]]"
  - "[[Kairos]]"
  - "[[SpacetimeDB]]"
  - "[[kbase]]"
  - "[[bkmr]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[FLOW 2026 04 24 ORIENTATION]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
---

# Epi-Logos PI Agent API — v0.1

> The coordinate-native API surface for the Epi-Logos system. One typed interface, organised by S/S' coordinate, accessible to any client ([[Anima]], [[Epii]], `epi-cli`, the app, future agents, external integrations). The gateway mediates. Everything is async.

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| v0.1 | 2026-04-24 | Initial specification. Full S/S' coverage. Two-agent architecture ([[Anima]] + [[Epii]]). [[S3']] as unified temporal runtime. |

## DESIGN PRINCIPLES

1. **Coordinate-native.** Every method is homed to an S/S' coordinate. The coordinate prefix IS the namespace. A developer reading `s2'.retrieve` immediately knows this is a coordinate-aware retrieval concern at [[S2']].

2. **Async throughout.** Methods that involve non-trivial computation return a future. The caller gets an `ack_id` and receives the result via a callback event on the gateway. Fire-and-forget notifications use `agent.notify`.

3. **Decoupled domain law.** Per [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]] Section VIII: a domain may only communicate with another domain through envelope fields. Direct cross-domain calls are architecture violations. This API is the concrete protocol for that principle.

4. **Client-agnostic.** The same API surface is used by PI agent extensions (via gateway WebSocket), by `epi-cli` (via direct function calls that share the same type signatures), by the app (via gateway WebSocket), and by future agents. The gateway is the canonical host; CLI implementations are typed mirrors.

5. **Envelope-aligned.** The 118 fields of the [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] map to this API. Transport fields (Layer 1) are `connect` params and wire frame fields. Runtime fields (Layer 2) are `s0.*` and `s4.*` bootstrap returns. Temporal fields (Layer 3) are `s3'.*` subscription events. And so on through all 12 layers.

---

## 0. CONNECTION AND REGISTRATION

### `connect`

```typescript
// Request
{
  type: "req",
  method: "connect",
  params: {
    agent_id: string,              // "anima" | "epii" | custom
    agent_version: string,         // semver
    capabilities: string[],        // method prefixes this agent serves: ["s5", "s5'"]
    subscriptions: string[],       // temporal event channels: ["temporal.day.*", "temporal.kairos.*"]
    auth: {                        // connect auth (existing challenge-response)
      nonce: string,
      token: string
    }
  }
}

// Response
{
  type: "res",
  result: {
    session_key: string,
    session_id: string,
    day_id: string,
    group_id: string,              // shared Day group — links multi-agent sessions
    temporal_state: {
      day_id: string,
      now_id: string | null,
      kairos: KairosSnapshot | null,
      tick12: number,
      active_arcs: ArcSummary[]
    },
    protocol_version: 3,
    peer_agents: AgentSummary[]    // other agents currently connected
  }
}
```

On connect, the client declares its `agent_id`, the method prefixes it can serve (so other agents can discover its capabilities), and which temporal event channels it wants. The gateway returns the full temporal ground state plus a list of peer agents already connected.

### `agent.capabilities`

```typescript
// Request
{ method: "agent.capabilities", params: { agent_id?: string } }

// Response
{
  agents: [{
    agent_id: string,
    capabilities: string[],       // method prefixes served
    connected_since: number,      // epoch ms
    session_key: string
  }]
}
```

Discovery: any client can query what agents are connected and what method prefixes they serve.

---

## S0 / S0' — CLI GROUND

Coordinate home: [[S0]] / [[S0']]
Implementation: `epi-cli` (Rust)
Envelope layers served: Layer 2 (Runtime)

### `s0.exec`

```typescript
{ method: "s0.exec", params: {
    command: string,
    args: string[],
    cwd?: string,
    timeout_ms?: number,
    env?: Record<string, string>
}}
→ async { stdout: string, stderr: string, exit_code: number }
```

Raw CLI execution. Gated by `s_4_permission_boundary`. This is the ground — every higher method that needs shell access goes through here.

### `s0.tool_surface`

```typescript
{ method: "s0.tool_surface" }
→ {
    preferred_tools: Record<string, string>,  // e.g. { read: "bat", search: "rg" }
    resolved_paths: Record<string, string>,   // actual resolved binary paths
    epi_binary: string                        // path to epi-cli binary
}
```

Returns the [[S0']] contract: `preferred-tools.json` + `resolve.sh` resolved state. Per [[Khora]]'s S0' bootstrap.

### `s0.env`

```typescript
{ method: "s0.env", params: { keys: string[] } }
→ { values: Record<string, string | null> }
```

Read environment variables. Respects varlock for secrets (returns null for locked keys unless the requesting agent has varlock access).

### `s0'.cmux`

```typescript
{ method: "s0'.cmux.list" }
→ { workspaces: CmuxWorkspace[] }

{ method: "s0'.cmux.surface", params: { action: "create" | "destroy", name: string, layout?: string } }
→ { ok: boolean }

{ method: "s0'.cmux.focus", params: { pane: string } }
→ { ok: boolean }
```

[[Pleroma]]'s cmux surface management exposed as API. Controls the tmux/cmux topology including the two-window Anima/Epii ground UX.

---

## S1 / S1' — VAULT AND COMPILER SPINE

Coordinate home: [[S1]] / [[S1']]
Implementation: `epi vault` (Rust) + `epi-dev-vault/` compiler (Python)
Envelope layers served: Layer 5 (Residency), Layer 2 (Runtime — bootstrap)

### S1 — Vault Material Operations

#### `s1.read`

```typescript
{ method: "s1.read", params: {
    path: string,
    format?: "raw" | "parsed"     // parsed = frontmatter + body separated
}}
→ {
    content: string,
    frontmatter?: Record<string, unknown>,
    body?: string,
    ct_type?: string,
    coordinate?: string
}
```

#### `s1.write`

```typescript
{ method: "s1.write", params: {
    path: string,
    content: string,
    frontmatter?: Record<string, unknown>,
    sync_queue?: boolean           // queue for Neo4j sync (default true)
}}
→ { ok: boolean, sync_queued: boolean }
```

All writes go through [[Khora]]'s write authority. The `sync_queue` flag controls whether the write is queued for graph sync via `khora_sync_queue_push`.

#### `s1.search`

```typescript
{ method: "s1.search", params: {
    query: string,
    scope?: string,               // vault path prefix to scope within
    ct_type?: string,             // filter by CT type
    coordinate?: string,          // filter by coordinate frontmatter
    limit?: number
}}
→ { results: VaultSearchResult[] }
```

#### `s1.template`

```typescript
{ method: "s1.template", params: {
    name: string,                 // CT0, CT1, CT2, CT3, CT4a, CT4b', CT5
    params: Record<string, unknown>
}}
→ { rendered: string, path: string }
```

[[Hen]]'s template invocation. CT types per the [[S4']] definition: CT0=seed, CT1=prompt, CT2=task-spec, CT3=pattern-note, CT4a=integration-preview, CT4b'=daily-note/NOW, CT5=thought/synthesis.

#### `s1.frontmatter`

```typescript
{ method: "s1.frontmatter.validate", params: { path: string } }
→ { valid: boolean, errors: FrontmatterError[], warnings: FrontmatterWarning[] }

{ method: "s1.frontmatter.set", params: { path: string, key: string, value: unknown } }
→ { ok: boolean }

{ method: "s1.frontmatter.get", params: { path: string, keys?: string[] } }
→ { frontmatter: Record<string, unknown> }
```

126 canonical frontmatter keys enforced. `{family}_{n}_{semantic}` format. Unknown keys → ERROR per [[Hen]]'s contract.

### S1'Cx — Type-to-Form System

The [[S1'Cx]] system maps C-family ontological categories onto the vault filesystem. These methods expose that mapping as API operations.

#### `s1'.type.create`

```typescript
{ method: "s1'.type.create", params: {
    name: string,                 // Type name (becomes folder + MOC canvas)
    parent_type?: string,         // for type hierarchisation
    coordinate?: string           // C4 coordinate assignment
}}
→ {
    type_path: string,            // Bimba/World/Types/{Name}/
    moc_canvas_path: string,      // Bimba/World/Types/{Name}/{Name}.canvas
    neo4j_label: string           // label acquired by entities birthed here
}
```

Creates a C4 Type manifestation: a `Types/{Name}/` folder with its MOC canvas (`{Name}.canvas` acting as INDEX). Per [[S1'Cx]] S1.4': "Only Types have subfolders."

#### `s1'.type.list`

```typescript
{ method: "s1'.type.list", params: { parent_type?: string } }
→ {
    types: [{
        name: string,
        path: string,
        moc_canvas: string,
        entity_count: number,
        neo4j_label: string,
        children: string[]        // subtypes
    }]
}
```

#### `s1'.form.birth`

```typescript
{ method: "s1'.form.birth", params: {
    name: string,                 // unique Form name
    type: string,                 // which Type folder to birth in
    content: string,
    frontmatter: Record<string, unknown>,
    ct_type: string               // CT level
}}
→ {
    birth_path: string,           // Types/{Type}/{Name}.md — acquires Neo4j label
    neo4j_label: string,
    status: "birthed"
}
```

Per [[S1'Cx]] canonical workflow: Forms are birthed in `Types/{Name}/` to acquire the Type as a Neo4j label. The birth location is where the form gets its ontological type stamp.

#### `s1'.form.graduate`

```typescript
{ method: "s1'.form.graduate", params: {
    name: string,                 // Form to graduate
    source_type: string           // current Type home
}}
→ {
    graduated_path: string,       // Bimba/World/{Name}.md — now canonical
    origin_type: string,
    neo4j_label: string,          // retained from birth
    status: "canonical"
}
```

Graduation: move from `Types/{Type}/{Name}.md` to `World/{Name}.md`. The Form becomes canonical. Per [[S1'Cx]] S1.1': "Forms go directly and flatly in /World (no subfolders)." The Neo4j label acquired at birth is retained.

#### `s1'.form.list`

```typescript
{ method: "s1'.form.list", params: {
    zone?: "world" | "types" | "seeds",
    type_filter?: string,
    ct_type?: string
}}
→ { forms: FormSummary[] }
```

#### `s1'.canvas.create`

```typescript
{ method: "s1'.canvas.create", params: {
    name: string,
    type?: "moc" | "process" | "workspace",
    parent_path: string,
    nodes?: CanvasNode[],
    edges?: CanvasEdge[]
}}
→ { canvas_path: string }
```

Per [[S1'Cx]] S1.3': canvas files are the C3 Process manifestation — "entity AS process, frozen in workspace form." MOC canvases are the C4 INDEX for a Type.

#### `s1'.residency.resolve`

```typescript
{ method: "s1'.residency.resolve", params: {
    artifact_role: string,        // "definition" | "flow" | "thought" | "trace" | etc.
    ct_type: string,
    coordinate?: string
}}
→ {
    zone: "Present" | "Seeds" | "World" | "Self" | "System" | "Map",
    path_pattern: string,
    graduation_path: string | null
}
```

Resolves where an artifact should live per the `/Idea` residency ladder (Present → Seeds → World). Per [[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]] Section V.

### S1' — Compiler Spine

#### `s1'.compile`

```typescript
{ method: "s1'.compile", params: {
    channel: string,              // "transport" | "runtime" | "temporal" | "coordinate" |
                                  // "residency" | "context" | "environs" | "execution" |
                                  // "episodic" | "crystallisation" | "improvement" | "ql"
    force?: boolean
}}
→ async { artifacts: CompiledArtifact[], channel: string }
```

Triggers a compiler pass for the named ledger channel. Per [[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]] compiler spine mapping. The QL channel (`ql`) MUST be compiled first — it governs how all other passes interpret their entries.

#### `s1'.ledger.append`

```typescript
{ method: "s1'.ledger.append", params: {
    channel: string,
    entry: LedgerEntry
}}
→ { ok: boolean, sequence: number }
```

Append-only ledger write. Each of the 12 envelope layers has its own ledger channel.

#### `s1'.query`

```typescript
{ method: "s1'.query", params: {
    question: string,
    coordinate_filter?: string,
    cost_tier?: "hot" | "warm" | "cold"
}}
→ { answer: string, sources: SourceRef[], cost_tier: string }
```

Query compiled knowledge. The spine compositor's `query()` method exposed as API.

#### `s1'.injection`

```typescript
{ method: "s1'.injection", params: {
    cost_tier: "hot" | "warm" | "cold",
    char_budget?: number          // default 18000
}}
→ {
    context_block: string,
    char_count: number,
    layers_included: string[],
    agent_id: string              // which agent this injection is assembled for
}
```

Returns the assembled system prompt injection for a given cost tier. This is what gets injected at `session_start` via the spine compositor's `assembleInjection()`. Agent-scoped — each agent gets its own injection.

---

## S2 / S2' — GRAPH SUBSTRATE AND COORDINATE-AWARE RETRIEVAL

Coordinate home: [[S2]] / [[S2']]
Implementation: `epi graph` (Rust → Neo4j), `bimba-mcp`
Envelope layers served: Layer 6 (Context-Economy)

[[S2]] is the raw shared graph/cache substrate: [[Neo4j]] and [[Redis]] as infrastructure primitives. [[S2']] is the coordinate-aware graph law over that substrate. Gnostic (RAG-Anything) and Graphiti (episodic) are NOT here — they are S5 world-return concerns that USE the S2 substrate.

### S2 — Raw Graph Operations

#### `s2.graph.query`

```typescript
{ method: "s2.graph.query", params: {
    cypher: string,
    params?: Record<string, unknown>
}}
→ { rows: Record<string, unknown>[], columns: string[] }
```

Raw Cypher query against Neo4j. The `epi graph query` command exposed as API. This is the [[Parashakti]] coordinate traversal surface.

#### `s2.graph.node`

```typescript
{ method: "s2.graph.node", params: {
    coordinate: string            // e.g. "S4'", "M2-3", "#4.4.4.4"
}}
→ {
    node: BimbaNode,
    relations: Relation[],
    maps_to: CoordinateRef[],     // MAPS_TO_COORDINATE edges
    resonates_with: CoordinateRef[] // RESONATES_WITH edges
}
```

Coordinate-aware node lookup. Returns the node with its cross-namespace edges.

#### `s2.graph.traverse`

```typescript
{ method: "s2.graph.traverse", params: {
    from: string,                 // coordinate or node ID
    edge_types?: string[],        // filter by relation type
    direction?: "outbound" | "inbound" | "both",
    depth?: number,               // max traversal depth (default 2)
    families?: string[]           // filter by coordinate family: P, S, T, M, L, C
}}
→ { paths: GraphPath[], nodes: BimbaNode[] }
```

### S2' — Coordinate-Aware Retrieval

#### `s2'.retrieve`

```typescript
{ method: "s2'.retrieve", params: {
    query: string,
    scope_coordinates: string[],  // coordinate filter for retrieval scope
    mode: "kbase" | "semantic" | "episodic" | "hybrid",
    disclosure_density?: "minimal" | "standard" | "rich",
    top_k?: number
}}
→ {
    pool: RetrievalResult[],
    disclosure_density: string,
    scope_applied: string[],
    sources: string[]             // which retrieval backends contributed
}
```

The assembled retrieval surface. Combines [[Bimba]] graph, [[Gnostic]] corpus, and [[kbase]] results into a coordinate-scoped pool. Disclosure density controls how much context surfaces.

#### `s2'.rerank`

```typescript
{ method: "s2'.rerank", params: {
    pool: RetrievalResult[],
    criteria: RerankCriteria       // coordinate proximity, recency, disclosure_density target
}}
→ { ranked: RetrievalResult[] }
```

#### `s2'.enrich`

```typescript
{ method: "s2'.enrich", params: {
    node_id: string,
    cross_namespace?: boolean     // create MAPS_TO_COORDINATE / RESONATES_WITH edges
}}
→ { edges_created: EnrichmentEdge[] }
```

#### `s2'.coordinate.resolve`

```typescript
{ method: "s2'.coordinate.resolve", params: {
    coordinate_string: string     // "S4'", "M2-3-1", "#4.4.4.4", etc.
}}
→ {
    node: BimbaNode | null,
    family: string,               // P, S, T, M, L, C
    position: number,             // 0-5
    prime: boolean,               // inverted?
    sub_coordinates: string[],    // if compound
    parent: string | null
}
```

Parses any coordinate string into its structural components and resolves to a [[Bimba]] node if one exists.

---

## S3 / S3' — TEMPORAL RUNTIME

Coordinate home: [[S3]] / [[S3']]
Implementation: Gateway (Rust, port 18794), Redis, [[SpacetimeDB]], [[Kerykeion]] (Python)
Envelope layers served: Layer 1 (Transport), Layer 3 (Temporal), Layer 6 (Context-Economy — Redis)

[[S3']] is the shared temporal runtime substrate. [[Graphiti]] episodic and [[Gnostic]] corpus are S5 world-return concerns — they USE the S3' temporal substrate but are not part of it.

This is the largest API surface because [[S3']] is the shared temporal substrate that all agents subscribe to. Per [[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]], Redis and [[Graphiti]]/episodic are unified here.

### S3 — Gateway Transport

#### `s3.session`

```typescript
{ method: "s3.session.list", params: { agent_id?: string, day_id?: string, group_id?: string } }
→ { sessions: SessionRecord[] }

{ method: "s3.session.get", params: { session_key: string } }
→ { session: SessionRecord }

{ method: "s3.session.patch", params: { session_key: string, patch: SessionPatch } }
→ { ok: boolean, session: SessionRecord }
```

Session management. The `SessionRecord` includes `agent_id`, `day_id`, `group_id` (shared Day group linking multi-agent sessions), `vault_now_path`, `active_agent_id`, and all existing fields.

#### `s3.channel`

```typescript
{ method: "s3.channel.register", params: {
    name: string,                 // "terminal" | "app" | "telegram" | "whatsapp" | "slack" | custom
    handler_agent: string,        // which agent handles messages on this channel
    config?: ChannelConfig
}}
→ { channel_id: string, status: "registered" }

{ method: "s3.channel.list" }
→ { channels: RegisteredChannel[] }

{ method: "s3.channel.send", params: {
    channel: string,
    message: string,
    thread?: string,
    metadata?: Record<string, unknown>
}}
→ { delivered: boolean, message_id: string }
```

Channel registration — the OpenClaw `registerChannel` equivalent built coordinate-native. Any channel (terminal, app, Telegram, WhatsApp, Slack) registers with the gateway, declaring which agent handles its messages. The gateway routes accordingly.

#### `s3.message`

```typescript
{ method: "s3.message.route", params: {
    target_agent: string,
    method: string,               // the s-coordinate method to invoke on the target
    params: Record<string, unknown>,
    callback_channel?: string     // where to push the async result
}}
→ { ack_id: string, status: "routed" }
```

Inter-agent async message routing. The caller gets an `ack_id`. The result arrives as an event on the `callback_channel` (or the caller's default event channel). This is how [[Aletheia]] delegates to [[Epii]] — fire a routed message, continue working, receive the result asynchronously.

### S3' — Temporal Substrate

#### `s3'.temporal`

```typescript
{ method: "s3'.temporal.state" }
→ {
    day_id: string,
    now_id: string | null,
    session_start: number,        // epoch ms
    kairos: KairosSnapshot | null,
    tick12: number,               // 0-11 spanda stage
    sun_decan: DecanInfo | null,
    moon_decan: DecanInfo | null,
    active_arcs: ArcSummary[],
    connected_agents: string[]
}

{ method: "s3'.temporal.subscribe", params: {
    events: string[]              // event channel patterns (supports wildcards)
}}
→ { subscription_id: string, active_subscriptions: string[] }

{ method: "s3'.temporal.unsubscribe", params: { subscription_id: string } }
→ { ok: boolean }
```

#### `s3'.day`

```typescript
{ method: "s3'.day.open", params: {
    day_id: string,
    seed_content?: string,        // SEED.md content for morning injection
    kairos_snapshot?: KairosSnapshot
}}
→ { ok: boolean, arc_id: string, vault_path: string }

{ method: "s3'.day.close", params: {
    day_id: string,
    crystallisation?: string,
    force?: boolean               // bypass c_5_reflection_complete check
}}
→ { ok: boolean, archive_path: string }

{ method: "s3'.day.status", params: { day_id?: string } }
→ { day_id: string, open: boolean, session_count: number, agents_active: string[], arcs: ArcSummary[] }
```

#### `s3'.kairos`

```typescript
{ method: "s3'.kairos.fetch" }
→ {
    planet_degrees: number[],     // [10] — Sun(0) through Pluto(9), mod-10 canonical
    sun_decan: DecanInfo,
    moon_decan: DecanInfo,
    sun_degree: number,
    moon_degree: number,
    mode: "natal" | "realtime" | "kairotic",
    timestamp: number
}

{ method: "s3'.kairos.status" }
→ { enabled: boolean, mode: string, last_fetch: number, planet_valid: number }

{ method: "s3'.kairos.natal", params: {
    birth_date: string,
    birth_location: string
}}
→ { natal_chart: NatalChart, sun_degree_anchor: number }
```

[[Kerykeion]] (Python, pyswisseph) via `kairos-python-adapter.ts`. Three temporal modes: natal (stable identity from PASU.md), realtime (current planetary positions), kairotic (oracle cast moment, 4h decay).

#### `s3'.presence` — SpacetimeDB

```typescript
{ method: "s3'.presence.state" }
→ {
    agents: [{
        agent_id: string,
        torus_position: number,   // tick12
        hexagram: number,         // 0-63
        hash: string,             // BLAKE3 identity hash
        last_update: number
    }]
}

{ method: "s3'.presence.update", params: {
    torus_position: number,
    hexagram: number,
    hash?: string
}}
→ { ok: boolean }
```

#### `s3'.context` — Redis (unified)

```typescript
// Agent-scoped context
{ method: "s3'.context.get", params: { key: string } }
→ { value: unknown | null }
// Key is auto-prefixed with {agent_id}:{session_id}:

{ method: "s3'.context.set", params: { key: string, value: unknown, ttl_seconds?: number } }
→ { ok: boolean }

// Shared Day-scoped context (cross-agent)
{ method: "s3'.context.shared.get", params: { key: string } }
→ { value: unknown | null }
// Key is auto-prefixed with {day_id}:shared:

{ method: "s3'.context.shared.set", params: { key: string, value: unknown } }
→ { ok: boolean }

// Batch read (for context pool assembly)
{ method: "s3'.context.pool", params: {
    keys: string[],
    include_shared?: boolean
}}
→ { values: Record<string, unknown> }
```

Redis unified at [[S3']]. Agent-scoped keys for per-session context. Shared keys for cross-agent temporal state (kairos cache, decan state, active arc IDs). The `context.pool` method is the batch assembly surface for building [[Psyche]]'s session context pack.

### Temporal Event Channels

Agents subscribe via `s3'.temporal.subscribe`. Events pushed as standard gateway event frames:

```typescript
// Day lifecycle
"temporal.day.open"       → { day_id, kairos_snapshot, seed_available }
"temporal.day.close"      → { day_id, crystallisation_summary, archive_path }

// Kairos
"temporal.kairos.tick"    → { planet_degrees, sun_decan, moon_decan, sun_degree, moon_degree }
"temporal.decan.change"   → { body: "sun" | "moon", from: DecanInfo, to: DecanInfo }

// Episodic arcs
"temporal.arc.open"       → { arc_id, name, ql, agent_id }
"temporal.arc.close"      → { arc_id, crystallisation, agent_id }

// Agent presence
"temporal.session.start"  → { agent_id, session_id, session_key }
"temporal.session.end"    → { agent_id, session_id, summary }
"temporal.presence.update"→ { agent_id, torus_position, hexagram }

// Async method results (callback channel)
"agent.result.{ack_id}"  → { method, result, error? }
```

Wildcard subscription supported: `"temporal.day.*"`, `"temporal.*"`, etc.

---

## S4 / S4' — AGENT OPERATIONS

Coordinate home: [[S4]] / [[S4']]
Implementation: [[ta-onta]] extensions (TypeScript, native in [[Anima]])
Envelope layers served: Layer 2 (Runtime), Layer 4 (Coordinate), Layer 7 (Lived-Environs), Layer 8 (Execution)

### S4 — Inter-Agent Communication

#### `s4.agent.query`

```typescript
{ method: "s4.agent.query", params: {
    target_agent: string,         // "epii" | "anima" | custom
    method: string,               // the coordinate-typed method to invoke
    params: Record<string, unknown>,
    coordinate_context?: {        // envelope context for the query
        primary_coordinate: string,
        cf_frame: string,
        ql_modal: string
    }
}}
→ { ack_id: string }
// Result arrives async on "agent.result.{ack_id}" event channel
```

Async inter-agent query. [[Anima]] (via [[Aletheia]]) queries [[Epii]] for knowledge. [[Epii]] processes and returns via the gateway event channel. The `coordinate_context` lets the receiving agent understand the ontological frame of the request.

#### `s4.agent.notify`

```typescript
{ method: "s4.agent.notify", params: {
    target_agent: string,
    event: string,
    payload: Record<string, unknown>
}}
→ { ack_id: string }
```

Fire-and-forget notification. No response expected. Used for: [[Sophia]] improvement vectors → [[Epii]], session boundary signals, crystallisation triggers.

#### `s4.agent.status`

```typescript
{ method: "s4.agent.status", params: { agent_id?: string } }
→ {
    agent_id: string,
    state: "active" | "idle" | "improvement" | "crystallising",
    session_key: string,
    day_id: string,
    team_composition: AgentTeam | null,
    cs_position: number,          // CS0-CS5
    cf_frame: string,
    uptime_ms: number
}
```

### S4' — Anima Orchestration (native TS, also exposed as API for observability)

#### `s4'.vak`

```typescript
{ method: "s4'.vak.evaluate", params: {
    context: {
        user_input: string,
        session_state: SessionState,
        coordinate_context?: CoordinateContext
    }
}}
��� {
    cf_frame: string,             // "(00/00)" | "(0/1)" | "(0/1/2)" | "(0/1/2/3)" | "(4.0/1-4.4/5)" | "(5/0)"
    agent_route: string,          // "nous" | "logos" | "eros" | "mythos" | "anima" | "psyche" | "sophia"
    ct_type: string,              // CT0-CT5
    cp_position: string,          // P0-P5
    mef_lens: string,             // L0-L5
    rationale: string
}
```

[[VAK]] evaluation: given context, determine the [[CF]] frame, constitutional agent route, and corresponding CT/CP/MEF positions. Per the agent economic tastes table in [[S4']].

#### `s4'.team`

```typescript
{ method: "s4'.team.compose", params: {
    task_context: TaskContext,
    cf_frame: string
}}
→ {
    agents: AgentAssignment[],
    roles: string[],
    dispatch_mode: "sequential" | "parallel" | "fusion"
}

{ method: "s4'.team.status" }
→ { composition: AgentTeam, active_agents: string[] }
```

#### `s4'.cs`

```typescript
{ method: "s4'.cs.state" }
→ { position: number, label: string, transitions: CSTransition[] }
// CS0 (void) through CS5 (full depth)

{ method: "s4'.cs.transition", params: { target: number } }
→ { ok: boolean, new_state: CSState }
```

CS state machine — resets each session, governs context depth and agent scope.

#### `s4'.orchestrate`

```typescript
{ method: "s4'.orchestrate", params: {
    task: string,
    mode: "sequential" | "parallel" | "fusion",
    team?: AgentAssignment[],
    cf_frame?: string
}}
→ { ack_id: string }
// Result arrives async on "agent.result.{ack_id}"
```

#### `s4'.thought`

```typescript
{ method: "s4'.thought.route", params: {
    content: string,
    sophia_analysis?: SophiaAnalysis,
    t_lane?: number               // 0-5, auto-classified if omitted
}}
→ {
    t_lane: number,               // T0 Questions → T5 Insight
    artifact_path: string,        // /Pratibimba/Self/Thought/T{n}/...
    epii_delegation?: string      // ack_id if delegated to Epii for deep work
}

{ method: "s4'.thought.list", params: {
    lane?: number,
    session_id?: string,
    day_id?: string
}}
→ { thoughts: ThoughtArtifact[] }
```

[[Aletheia]] UX membrane: thought routing into T-buckets and management of the `/thoughts` directory lifecycle.

#### `s4'.crystallise`

```typescript
{ method: "s4'.crystallise", params: {
    session_id: string,
    vectors: ImprovementVector[],
    delegate_to_epii?: boolean
}}
→ { ack_id: string }
// If delegate_to_epii, the heavy crystallisation work is async-routed to Epii
```

#### `s4'.notify_user`

```typescript
{ method: "s4'.notify_user", params: {
    type: "decision" | "research_track" | "follow_up" | "report" | "notification",
    content: string,
    priority: "low" | "normal" | "high",
    action_required?: boolean,
    coordinate_context?: string
}}
→ { delivered: boolean, channel: string }
```

[[Aletheia]] UX surface: how the internal agent machinery becomes user-facing. The gateway routes this to the appropriate channel (terminal, app, Telegram, etc.).

#### `s4'.context.assemble`

```typescript
{ method: "s4'.context.assemble", params: {
    task_context: TaskContext,
    coordinate_scope: string[],
    disclosure_density: "minimal" | "standard" | "rich"
}}
→ {
    context_pack: ContextPack,    // the assembled pool for Psyche
    sources: {
        kbase: KbaseResult[],
        gnosis: GnosticResult[],
        episodic: Episode[],
        bimba: BimbaNode[],
        vault: VaultSearchResult[]
    },
    pool_id: string,              // s_2_kbase_pool_id equivalent
    redis_key: string             // cached in S3' Redis for turn-by-turn access
}
```

The [[Nous]]/[[Khora]] bootstrap context assembly. Pools [[kbase]]/[[bkmr]] semantic search, [[Gnostic]] retrieval, [[Graphiti]] episodic search, [[Bimba]] node context, and vault search into [[Psyche]]'s `s_4_active_context_pack`. This is the method that populates Layer 7 (Lived-Environs) of the envelope.

The [[kbase]]/[[bkmr]] integration: `bkmr` (semantic bookmark search backed by Gemini embeddings + SQLite) provides project-scoped knowledge lookups via `epi kbase`. The `build_kbase_field(coord, project, limit)` function in `knowing/kbase.rs` runs coordinate-aware searches and returns `FacetItem` structs with path candidates. This method wraps that into the full context assembly pipeline.

---

## S5 / S5' — KNOWLEDGE ORACLE, WORLD RETURN, AND IMPROVEMENT

Coordinate home: [[S5]] / [[S5']]
Implementation: [[Epii]] agent (TypeScript, native), backed by `Body/S/S0/epi-cli` command mirrors for graph/gnostic/M' calls, [[Graphiti]] S3' runtime for episodic memory, and [[RAG-Anything]] for corpus
Envelope layers served: Layer 6 (Context-Economy — gnostic/episodic sources), Layer 9 (Episodic), Layer 10 (Crystallisation), Layer 11 (Improvement), Layer 12 (QL Process)

[[S5]] is the integral world-boundary: where the system meets the world and receives its return. [[Gnostic]] (corpus ingestion/retrieval) and [[Graphiti]] (episodic memory) are S5 world-return concerns — they use the [[S2]] graph substrate and the [[S3']] temporal runtime but belong here as knowledge-return services. [[S5']] is the QL-aligned governance and improvement law over those services.

These methods are served by [[Epii]] as a separate PI instance. Other agents invoke them via `s4.agent.query` → gateway routing → [[Epii]].

### S5 — Bimba Map, Gnostic Corpus, Episodic Memory, and M' Functions

#### `s5.gnostic` — RAG-Anything Corpus (world-return ingestion and retrieval)

```typescript
{ method: "s5.gnostic.ingest", params: {
    source: string,               // file path or URL
    format?: string,              // auto-detected by MinerU if omitted
    namespace?: string            // target Neo4j namespace
}}
→ async { chunks_created: number, embeddings_written: number, namespace: string }
```

[[RAG-Anything]] / MinerU multimodal parse pipeline. 3072-dim embeddings via Gemini. Uses the [[S2]] Neo4j substrate for storage.

```typescript
{ method: "s5.gnostic.query", params: {
    query: string,
    mode?: "semantic" | "keyword" | "hybrid",
    top_k?: number,
    namespace?: string
}}
→ { results: GnosticResult[], scores: number[] }
```

```typescript
{ method: "s5.gnostic.status" }
→ { namespaces: NamespaceInfo[], total_chunks: number, embedding_dim: number, health: string }
```

#### `s5.episodic` — Graphiti Episodic Memory (lived temporal memory)

```typescript
{ method: "s5.episodic.record", params: {
    content: string,
    agent_id: string,
    ql: number,                   // 0-5 QL position
    cpf: string,                  // context-position-frame
    ct: number,                   // content-type
    metadata?: {
        sun_degree?: number,
        moon_degree?: number,
        planet_degrees?: number[],
        sun_decan?: string,
        moon_decan?: string,
        tick12?: number
    }
}}
→ { episode_id: string, arc_id: string | null }

{ method: "s5.episodic.search", params: {
    query: string,
    time_range?: { from: number, to: number },
    agent_id?: string,            // filter by agent or null for cross-agent
    arc_id?: string,
    ql_range?: { min: number, max: number },
    limit?: number
}}
→ { episodes: Episode[] }

{ method: "s5.episodic.arc.open", params: {
    name: string,
    ql: number,
    metadata?: Record<string, unknown>
}}
→ { arc_id: string }

{ method: "s5.episodic.arc.close", params: {
    arc_id: string,
    crystallisation?: string,
    ql?: number
}}
→ { ok: boolean }

{ method: "s5.episodic.arc.status", params: { arc_id?: string } }
→ { arcs: ArcStatus[] }

{ method: "s5.episodic.arc.oracle", params: {
    oracle_result: OracleResult,
    arc_name: string
}}
→ { arc_id: string, hexagram_body: HexagramBodyEntry }

{ method: "s5.episodic.arc.mobius", params: {
    closing_arc_id: string,
    synthesis: string
}}
→ { new_ground_arc_id: string, mobius_complete: boolean }

{ method: "s5.episodic.ingest_thoughts", params: {
    thoughts: ThoughtEntry[],
    agent_id: string
}}
→ { ingested: number, episode_ids: string[] }
```

[[Graphiti]] episodic memory as world-return. Every episode carries agent identity, QL position, coordinate frame, and optional kairos metadata. Arcs span sessions and agents. Uses the [[S2]] Neo4j substrate for storage and [[S3']] temporal runtime for Day/arc grounding.

#### `s5.bimba`

```typescript
{ method: "s5.bimba.navigate", params: {
    from: string,                 // coordinate
    direction?: "inward" | "outward" | "lateral" | "inverse",
    depth?: number,
    families?: string[]           // filter traversal by family
}}
→ { path: CoordinateStep[], nodes: BimbaNode[], narrative: string }

{ method: "s5.bimba.context", params: {
    coordinate: string
}}
→ {
    node: BimbaNode,
    family: string,
    position: number,
    prime: boolean,
    intra_openness: CoordinateRef[],  // 16-fold pointer web
    m_prime: MPrimeFunction | null,    // associated M' implementation
    s_prime: SPrimeLayer | null,       // associated S' layer
    definition_path: string | null     // Bimba/World vault artifact
}

{ method: "s5.bimba.search", params: {
    concept: string,
    families?: string[],
    include_relations?: boolean
}}
→ { matches: BimbaSearchResult[] }

{ method: "s5.bimba.map", params: {
    root?: string,                // coordinate root for the map view (default: "#")
    depth?: number,
    families?: string[]
}}
→ { tree: CoordinateTree, node_count: number }
```

The [[Bimba]] map as a live navigable surface. `navigate` follows coordinate paths with direction. `context` gives the full 360-degree view of a coordinate (its 16-fold intra-openness, M' function, S' layer, vault definition). `map` returns a subtree for visualization.

#### `s5.m` — M' Functions

```typescript
{ method: "s5.m.clock", params: {
    mode?: "full" | "position" | "lenses"
}}
→ {
    degree_360: number,
    tick12: number,
    torus_position: number,
    spanda_stage: string,
    active_lenses: LensState[],   // 16 sacred circle divisions
    backbone: {
        seasonal_4: number,       // 4-fold ring position
        zodiac_12: number,        // 12-fold ring position
        amino_24: number,         // 24-fold ring position
        degree_360: number        // 360-fold ring position
    },
    quintessence: QuintessenceState | null
}

{ method: "s5.m.oracle", params: {
    method: "iching" | "tarot",
    cast_params?: Record<string, unknown>
}}
→ {
    result: OracleResult,
    body_dynamics: HexagramBodyEntry | null,
    decan_map: DecanMapping | null,
    kairos_moment: KairosSnapshot
}

{ method: "s5.m.medicine", params: {
    query: string,
    mode?: "zone" | "herb" | "chakra" | "full"
}}
→ {
    body_zones: string[],
    herbs: string[],
    chakras: ChakraInfo[],
    decan_context: DecanBodyInfo | null,
    element_signature: number
}

{ method: "s5.m.transform", params: {
    container: "bohm" | "talking_circle" | "diamond",
    input: string,
    cycle_params?: Record<string, unknown>
}}
→ { output: string, container_state: ContainerState }

{ method: "s5.m.lens", params: {
    lens_id: string,              // specific M4 lens identifier
    target: string,
    mode?: string
}}
→ { application: LensApplication }

{ method: "s5.m.logos", params: {
    stage?: number                // 0-5 Logos FSM stage (A-Logos → An-a-Logos)
}}
→ { cycle_state: LogosCycleState, current_stage: number, transitions: LogosTransition[] }

{ method: "s5.m.identity", params: {
    query: "pasu" | "natal" | "quintessence" | "gene_keys" | "human_design" | "jungian"
}}
→ { identity: IdentityFacet }
```

The full M' function surface. Cosmic clock (385 nodes, 4 nested backbone rings, 16 lenses, 9 walks). Oracle (I-Ching 3-coin + Tarot Thoth/Golden Dawn, hexagram body dynamics, decan mapping). Medicine (CHAKRA_BODY_ZONES[8], DECAN_BODY_PARTS[36], DECAN_HERBS[36], element signatures). Transform (Bohm/TalkingCircle/Diamond containers). Lens (M4 specific lenses — distinct from MEF lenses). Logos (6-stage FSM). Identity ([[PASU]].md bootstrap data).

### S5' — MEF Lenses, Improvement, Gnosis Governance, Pedagogy

#### `s5'.mef`

```typescript
{ method: "s5'.mef.apply", params: {
    lens: "L0" | "L1" | "L2" | "L3" | "L4" | "L5"
         | "L0'" | "L1'" | "L2'" | "L3'" | "L4'" | "L5'",
    target: string,               // coordinate, artifact path, or concept
    mode?: "day" | "night"        // Day MEF lens or Night' inversion
}}
→ {
    lens_name: string,            // Literal | Functional | Structural | Archetypal | Paradigmatic | Integral
    reading: string,
    depth: number,
    cross_references: CoordinateRef[]
}

{ method: "s5'.mef.evaluate", params: {
    artifact: string,             // path or content to evaluate
    criteria?: MEFCriteria,
    lenses?: string[]             // which lenses to apply (default: all 6)
}}
→ {
    scores: Record<string, number>,  // per-lens scores
    overall: number,
    recommendations: string[],
    dominant_lens: string
}

{ method: "s5'.mef.modal", params: {
    mode: "mod2" | "mod3" | "mod4" | "mod6" | "mod%"
}}
→ {
    frame: string,                // e.g. "(0/1)" for mod2, "(0/1/2)" for mod3
    structure: ModalStructure,
    interpretation: string
}
```

MEF (Meta-Epistemic Framework) lens system. L0 Literal through L5 Integral, plus their Night' inversions (L0'-L5'). Per the agent economic tastes: [[Nous]] = L0/L5', [[Logos]] = L1/L4', [[Eros]] = L2/L3', [[Mythos]] = L3/L2', [[Psyche]] = L4/L1', [[Sophia]] = L5/L0'. Modal evaluation covers all QL variants (Mod 2 binary through Mod 6 full, Mod % receptive dynamism).

#### `s5'.ql`

```typescript
{ method: "s5'.ql.schema" }
→ {
    version: string,              // c_0_ql_schema_version
    fields: SchemaField[],
    extension_fields: Record<string, unknown>,  // c_0_ql_extension_fields
    history: SchemaVersion[]
}

{ method: "s5'.ql.evaluate", params: {
    context: {
        coordinate: string,
        cf_frame: string,
        topological_mode: "0-sphere" | "torus" | "lemniscate" | "klein_bottle"
    }
}}
→ {
    ql_modal: string,
    cycle_position: number,       // 0-5
    inversion_state: boolean,
    dialectical_polarity: "yin" | "yang",
    interpretation: string
}
```

#### `s5'.kbase`

```typescript
{ method: "s5'.kbase.search", params: {
    query: string,
    project?: string,             // bkmr project (default: "epi-logos")
    mode?: "semantic" | "keyword" | "all",
    limit?: number
}}
→ {
    results: KbaseResult[],
    facets: KbaseFacet[],         // path candidates extracted
    project: string
}

{ method: "s5'.kbase.add", params: {
    url: string,
    tags?: string[],
    description?: string,
    project?: string
}}
→ { ok: boolean, id: string, embedding_backfilled: boolean }

{ method: "s5'.kbase.pool", params: {
    queries: string[],            // multiple queries to pool
    coordinate_scope?: string[],
    project?: string,
    limit_per_query?: number
}}
→ {
    pool: KbaseResult[],
    pool_id: string,              // unique pool identifier for s_2_kbase_pool_id
    facets: KbaseFacet[],
    deduplicated: boolean
}

{ method: "s5'.kbase.status", params: { project?: string } }
→ { project: string, total_bookmarks: number, embedded: number, db_path: string }
```

[[kbase]]/[[bkmr]] as [[Epii]]'s knowledge surface. `search` runs coordinate-aware semantic search via Gemini embeddings. `pool` assembles multiple queries into a deduplicated pool (the assembly that feeds `s_2_kbase_pool_id` in the context-economy layer). `add` manages the bookmark corpus. This is the [[Agora]] (CF4a) learning surface.

#### `s5'.improve`

```typescript
{ method: "s5'.improve.status" }
→ {
    loop_state: "idle" | "hypothesis" | "evaluating" | "deciding",
    active_vectors: ImprovementVector[],
    last_run: number,
    total_runs: number,
    keep_count: number,
    discard_count: number
}

{ method: "s5'.improve.evaluate", params: {
    baseline: ArtifactRef,
    challenger: ArtifactRef,
    criteria?: EvaluationCriteria
}}
→ { ack_id: string }
// Result async: { winner: "baseline" | "challenger", rationale, scores }

{ method: "s5'.improve.propose", params: {
    target_family: string,        // S, M, P, L, C, T, or "ql"
    target_coordinate: string,
    direction?: string            // Sophia's identified vector
}}
→ { ack_id: string }
// Result async: { challenger_artifact, diff_summary, confidence }

{ method: "s5'.improve.promote", params: {
    artifact: ArtifactRef,
    destination: "seeds" | "world"
}}
→ { ok: boolean, promoted_path: string }

{ method: "s5'.improve.history", params: { limit?: number, target_family?: string } }
→ { runs: ImprovementRun[] }
```

The autoresearch spine. [[Zeithoven]] generates challengers. [[Darshana]] evaluates. [[Sophia]]'s vectors drive the loop. Keep/discard decisions follow the graduation path (Present → Seeds → World).

#### `s5'.review`

```typescript
{ method: "s5'.review.inbox", params: {
    status?: "open" | "resolved" | "deferred",
    source?: "human_gate" | "anima" | "aletheia" | "autoresearch",
    limit?: number
}}
→ {
    items: ReviewInboxItem[]
}

{ method: "s5'.review.submit", params: {
    source: "human_gate" | "anima" | "aletheia" | "autoresearch",
    title: string,
    body: string,
    priority: "low" | "normal" | "high" | "blocking",
    coordinate_context: CoordinateContext,
    proposed_action?: ReviewProposedAction,
    requires_human: boolean
}}
→ {
    item: ReviewInboxItem
}

{ method: "s5'.review.resolve", params: {
    item_id: string,
    decision: "approve" | "reject" | "revise" | "defer",
    rationale: string,
    promotion_destination?: "present" | "seeds" | "world"
}}
→ {
    resolution: ReviewResolution
}

{ method: "s5'.review.history", params: {
    limit?: number,
    coordinate?: string,
    source?: "human_gate" | "anima" | "aletheia" | "autoresearch"
}}
→ {
    items: ReviewInboxItem[],
    resolutions: ReviewResolution[]
}
```

The review inbox is the Epii-accessible place where human validation gates, [[Anima]] handoffs, [[Aletheia]] crystallisations, and [[autoresearch]] proposals become meaningful to the user-position. Automation may create items, persist state, route notifications, and apply approved promotions. It must not pretend to replace human judgement where `requires_human` is true.

#### `s5'.gnosis`

```typescript
{ method: "s5'.gnosis.strategy", params: {
    query: string,
    context: {
        coordinate_scope: string[],
        cf_frame: string,
        disclosure_density: "minimal" | "standard" | "rich"
    }
}}
→ {
    retrieval_plan: RetrievalPlan,  // which backends to query, in what order, with what params
    sources: string[],
    expected_density: string
}

{ method: "s5'.gnosis.govern", params: {
    results: RetrievalResult[],
    coordinate_scope: string[],
    disclosure_density: "minimal" | "standard" | "rich"
}}
→ {
    filtered: RetrievalResult[],
    reranked: RetrievalResult[],
    disclosure: string,           // actual density achieved
    rationale: string
}
```

Gnosis governance: the policy layer over [[S2]]'s raw retrieval. [[Epii]] decides *how* to retrieve (strategy) and *what to surface* (governance). The raw retrieval backends (`s2.gnostic.query`, `s2.graph.query`) are at [[S2]]. The intelligent curation is at [[S5']].

#### `s5'.explain`

```typescript
{ method: "s5'.explain", params: {
    coordinate: string,
    depth?: "overview" | "technical" | "philosophical",
    audience?: "developer" | "architect" | "student" | "user",
    mef_lens?: string             // apply a specific MEF lens to the explanation
}}
→ {
    explanation: string,
    references: CoordinateRef[],
    related_coordinates: string[],
    m_prime_context: string | null
}

{ method: "s5'.teach", params: {
    topic: string,
    mef_lens?: string,
    ql_mode?: string,
    depth?: number
}}
→ {
    lesson: string,
    exercises: Exercise[],
    coordinate_path: CoordinateStep[],
    further_reading: ArtifactRef[]
}
```

Pedagogy: [[Epii]] as the system's self-understanding made accessible. Explanations are coordinate-aware and can be filtered by MEF lens and audience level. Teaching produces structured lessons with exercises.

---

## SHARED TYPES

Core types referenced across the API:

```typescript
interface BimbaNode {
    coordinate: string;
    family: string;
    position: number;
    prime: boolean;
    name: string;
    labels: string[];
    properties: Record<string, unknown>;
}

interface SessionRecord {
    canonical_key: string;
    session_id: string;
    agent_id: string;
    day_id: string;
    group_id: string;             // shared Day group
    vault_now_path: string | null;
    channel: string | null;
    active_agent_id: string;
    workspace_root: string;
    updated_at_ms: number;
    // ... existing fields from session_store.rs
}

interface KairosSnapshot {
    planet_degrees: number[];     // [10] mod-10 canonical
    sun_degree: number;
    moon_degree: number;
    sun_decan: DecanInfo;
    moon_decan: DecanInfo;
    mode: "natal" | "realtime" | "kairotic";
    timestamp: number;
}

interface DecanInfo {
    index: number;                // 0-35
    name: string;
    ruler: string;
    element: string;
    body_zone: string;
    sign: string;
}

interface Episode {
    episode_id: string;
    content: string;
    agent_id: string;
    ql: number;
    cpf: string;
    ct: number;
    arc_id: string | null;
    kairos: KairosSnapshot | null;
    timestamp: number;
}

interface ArcSummary {
    arc_id: string;
    name: string;
    ql: number;
    status: "open" | "closed";
    agent_id: string;
    episode_count: number;
    opened_at: number;
    closed_at: number | null;
}

interface ImprovementVector {
    target_family: string;
    target_coordinate: string;
    direction: string;
    confidence: number;
    sophia_source: string;        // session_id where Sophia identified this
}

interface KbaseResult {
    id: string;
    url: string;
    title: string;
    description: string;
    tags: string[];
    score: number;
    path_candidates: string[];    // extracted file paths
}

interface ContextPack {
    kbase: KbaseResult[];
    gnosis: GnosticResult[];
    episodic: Episode[];
    bimba: BimbaNode[];
    vault: VaultSearchResult[];
    pool_id: string;
    assembled_at: number;
    coordinate_scope: string[];
    disclosure_density: string;
}

interface CoordinateContext {
    primary_family: string;
    primary_coordinate: string;
    cf_frame: string;
    ql_modal: string;
    topological_mode: string;
    cycle_position: number;
    inversion_state: boolean;
}

interface AgentAssignment {
    agent_name: string;
    cf_frame: string;
    ct_type: string;
    cp_position: string;
    mef_lens: string;
    role: string;
}

interface ThoughtArtifact {
    t_lane: number;               // 0-5
    content: string;
    path: string;
    session_id: string;
    day_id: string;
    timestamp: number;
    sophia_classified: boolean;
    epii_delegated: boolean;
}

type ModalStructure =
    | { mode: "mod2", frame: "(0/1)", positions: [string, string] }
    | { mode: "mod3", frame: "(0/1/2)", positions: [string, string, string] }
    | { mode: "mod4", frame: "(0/1/2/3)", positions: [string, string, string, string] }
    | { mode: "mod6", frame: "(0-5)", positions: [string, string, string, string, string, string] }
    | { mode: "mod%", frame: "(00/00)", positions: [] };
```

---

## METHOD COUNT SUMMARY

| Coordinate | Methods | Primary Consumer |
|------------|---------|------------------|
| Connection | 2 | All clients |
| S0 / S0' | 5 | All clients |
| S1 / S1' | 14 | [[Anima]], [[Hen]], [[Khora]] |
| S2 / S2' | 7 | All clients (raw graph substrate) |
| S3 / S3' | 15 | All clients (temporal runtime) |
| S4 / S4' | 15 | [[Anima]] (native), [[Epii]] (observability) |
| S5 / S5' | 42 | [[Epii]] (native), [[Anima]] (via agent.query) |
| **Total** | **100** | |

100 methods across the full S/S' coordinate space plus connection. Gnostic (3 methods) and episodic (8 methods) moved from S2/S3' to S5 — they are world-return services using the S2 substrate and S3' temporal grounding. The Epii review family (4 methods) is S5' because it is the user-position where human gates, Anima handoffs, Aletheia crystallisations, and autoresearch proposals become meaningful and resolvable.

---

## ENVELOPE FIELD MAPPING

Each envelope layer's fields now have concrete API methods that populate them:

| Envelope Layer | Fields | Populated By |
|----------------|--------|-------------|
| 1. Transport (10) | `s_3_session_key`, `s_3_agent_id`, etc. | `connect` response + `s3.session.*` |
| 2. Runtime (9) | `s_4_bootstrap_context`, `s_0_tool_surface`, etc. | `s0.tool_surface`, `s0.env`, `connect` |
| 3. Temporal (11) | `s_3_day_id`, `s_3_kairos_tick`, etc. | `s3'.temporal.state`, `s3'.kairos.*`, `s3'.day.*` |
| 4. Coordinate (13) | `c_4_primary_coordinate`, `c_3_cpf`, etc. | `s4'.vak.evaluate`, `s5'.ql.evaluate` |
| 5. Residency (7) | `s_1_target_vault_zone`, `s_1_artifact_ct_type`, etc. | `s1'.residency.resolve`, `s1.frontmatter.*` |
| 6. Context-Economy (10) | `s_2_source_set`, `s_2_kbase_pool_id`, etc. | `s4'.context.assemble`, `s5'.kbase.pool`, `s2'.retrieve`, `s5.gnostic.query` |
| 7. Lived-Environs (8) | `s_4_active_context_pack`, `s_4_team_composition`, etc. | `s4'.context.assemble`, `s4'.team.*` |
| 8. Execution (9) | `p_2_intent_class`, `c_3_execution_mode`, etc. | `s4'.vak.evaluate`, `s4'.orchestrate` |
| 9. Episodic (9) | `t_3_episode_id`, `t_3_arc_id`, etc. | `s5.episodic.*` |
| 10. Crystallisation (9) | `s_5_sophia_disclosure`, `s_5_zeithoven_next_form`, etc. | `s4'.crystallise`, `s5'.improve.*` |
| 11. Improvement (10) | `s_5_improvement_mode`, `s_5_baseline_artifact`, etc. | `s5'.improve.*` |
| 12. QL Process (10) | `c_0_ql_schema_version`, `c_3_ql_modal`, etc. | `s5'.ql.*`, `s5'.mef.*` |

---

## IMPLEMENTATION NOTES

### Wire Protocol

All methods use the existing gateway wire protocol (v3):

```json
{ "type": "req", "id": 42, "method": "s5.bimba.context", "params": { "coordinate": "M2-3" } }
{ "type": "res", "id": 42, "result": { "node": { ... }, "family": "M", ... } }
```

Async methods return immediately with `ack_id`:

```json
{ "type": "res", "id": 42, "result": { "ack_id": "abc-123" } }
// Later, pushed as event:
{ "type": "event", "event": "agent.result.abc-123", "payload": { "method": "s5'.improve.evaluate", "result": { ... } } }
```

### Method Routing

The gateway routes methods by prefix:

- `s0.*`, `s1.*` → local Rust execution (epi-cli)
- `s2.*` → Neo4j direct (raw graph substrate)
- `s3.*`, `s3'.*` → gateway-internal (session store, Redis, SpacetimeDB)
- `s4.*`, `s4'.*` → routed to [[Anima]] PI instance
- `s5.*`, `s5'.*` → routed to [[Epii]] PI instance

When an agent registers with `capabilities: ["s5", "s5'"]`, the gateway knows to route those prefixes to that agent's WebSocket connection.

### CLI Parity

`epi` CLI commands are typed mirrors of the API methods:

```
epi vault read           → s1.read
epi graph query          → s2.graph.query
epi gnostic ingest       → s5.gnostic.ingest
epi gate session list    → s3.session.list
epi vault kairos fetch   → s3'.kairos.fetch
epi kbase search         → s5'.kbase.search
epi nara oracle cast     → s5.m.oracle
```

Same types, same params, different transport (direct function call vs WebSocket).

---

## NEXT STEPS

1. **TypeScript interface generation** — extract the types from this spec into `.d.ts` files. These become the shared type package used by both [[Anima]] and [[Epii]] extensions.

2. **Gateway method router** — extend the Rust gateway's dispatch to route by S/S' coordinate prefix to the appropriate handler (local, external agent, or Python subprocess).

3. **Temporal subscription system** — implement the `s3'.temporal.subscribe` event channel system in the gateway's broadcast infrastructure (extending the existing tick/health/heartbeat pattern).

4. **Epii `.pi/` scaffold** — create [[Epii]]'s PI agent configuration, register its capability prefixes (`s5`, `s5'`), and implement the first methods (`s5.bimba.context`, `s5'.mef.apply`, `s5'.kbase.search`).

5. **Two-window tmux** — extend `epi up` to launch both PI instances side by side, both connecting to the shared gateway with their respective `agent_id` values.
