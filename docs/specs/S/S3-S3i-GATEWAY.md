# S3/S3' — Gateway (Network / Stack)

**Status:** STUB — `epi gate status` exists, no implementation
**Coordinate:** S3 (raw network/harness), S3' (ta-onta loader / QL gateway)
**Implementation:** `epi-cli/src/gate/` (Rust)
**CLI Namespace:** `epi gate`

---

## Architectural Role

S3 is the **network layer** — real-time data streams, external triggers, agent-to-client connectivity. In the original Epi-Logos repo, this was the WebSocket-based epi-claw gateway providing OmniPanel connectivity, session management, and live state synchronization.

### S3 (Explicit) — Raw Network Primitives
- WebSocket / real-time transport server
- Session lifecycle (connect, heartbeat, disconnect)
- Message routing and serialization
- TLS/certificate management
- Health monitoring and reconnection logic

### S3' (Implicate) — QL Gateway / Ta-Onta Loader
- **Ta-onta plugin loading**: the svabhava (self-nature) of the system
- **Context frame routing**: CF-signature aware message dispatch
- **Session propagation**: coordinate-aware session metadata envelope
- **Live visualization feed**: M3 clock state, coordinate activity, topology rendering
- **Agent-to-client bridge**: PI agent output -> visual client

---

## The SpacetimeDB Question

The user is evaluating **SpacetimeDB** as a potential transport/state layer alongside or replacing the traditional WebSocket gateway.

### SpacetimeDB Value Proposition for S3
- **Database + server runtime in one**: WASM modules define server logic, client SDKs auto-sync state
- **Real-time subscriptions**: clients subscribe to table queries, receive automatic delta updates
- **Persistent state + live sync**: no separate database needed for gateway state
- **Multi-client synchronization**: built-in conflict resolution and deterministic replay
- **Client SDKs**: Rust, C#, TypeScript (fits our stack)

### Potential Architecture: Dual Transport

```
S3 Gateway Layer
    |
    +-- SpacetimeDB Module (WASM, Rust)
    |       |
    |       +-- Coordinate state tables
    |       +-- M3 clock tick stream
    |       +-- Session state tables
    |       +-- Real-time subscriptions (auto-delta)
    |       |
    |       +-- Clients subscribe via SpacetimeDB SDK
    |               |
    |               +-- Web visualization (TS SDK)
    |               +-- Electron OmniPanel (TS SDK)
    |               +-- Mobile (future)
    |
    +-- epi-claw WebSocket (traditional)
    |       |
    |       +-- Agent <-> CLI command relay
    |       +-- PI session management
    |       +-- OmniPanel chat/config RPC
    |
    +-- Redis pub/sub (from S2)
            |
            +-- Graph mutation events
            +-- Cache invalidation
```

### Why Dual Transport Makes Sense
1. **SpacetimeDB for visualization/state**: The M3 clock, live coordinate activity, topology rendering — these are *state subscription* problems. SpacetimeDB's auto-sync model is perfect.
2. **WebSocket for command relay**: Agent <-> CLI command execution, session spawning, RPC calls — these are *request/response* problems. Traditional WebSocket (or the epi-claw pattern) handles this cleanly.
3. **Separation of concerns**: State observation (SpacetimeDB) vs command execution (WebSocket) mirrors the S3/S3' explicit/implicate split.

### SpacetimeDB for M3 Clock Visualization
The M3 Mahamaya module defines a 72-invariant clock (nucleotides x codons x hexagrams x Gene Keys). Visualizing this live requires:
- Clock tick state (current position in the 72-fold cycle)
- Active coordinate highlights (which nodes are being traversed)
- Topology mode rendering (which topological surface is active)
- Multi-client sync (multiple observers see the same state)

SpacetimeDB's table subscription model maps directly:
```rust
// SpacetimeDB module (WASM)
#[spacetimedb::table(public)]
pub struct ClockState {
    #[primary_key]
    pub id: u32,
    pub tick: u32,
    pub active_coordinate: String,
    pub topology_mode: u8,
    pub m3_position: u32,
    pub updated_at: u64,
}

// Clients auto-receive updates when any row changes
```

---

## Current State in This Repo

### What Exists
- `epi-cli/src/gate/mod.rs` — bare stub: `GateCmd::Status` prints "not yet implemented"
- Epi-claw gateway patterns exist in the Epi-Logos repo (TypeScript, WebSocket)

### What's Missing
1. **No transport server** — no WebSocket, no SpacetimeDB
2. **No session management** — no connect/disconnect lifecycle
3. **No message routing** — no command dispatch
4. **No live state feed** — no visualization support
5. **No ta-onta loader** — plugin system not ported

---

## Integration Architecture

```
epi gate <cmd>
    |
    v
gate/mod.rs (Rust)
    |
    +-- epi gate status     — show gateway health
    +-- epi gate start      — launch gateway server
    +-- epi gate connect    — client connection management
    +-- epi gate subscribe  — live state subscription
    +-- epi gate send       — command relay
    |
    +-- SpacetimeDB client (state subscription)
    |       |
    |       +-- Clock state table
    |       +-- Coordinate activity table
    |       +-- Session state table
    |
    +-- WebSocket server (command relay)
    |       |
    |       +-- Agent command dispatch
    |       +-- RPC handler
    |
    +-- <- S0' (coordinate validation)
    +-- <- S2' (Redis pub/sub events)
    +-- -> S4' (agent session management)
    +-- -> Visualization clients (SpacetimeDB auto-sync)
```

### Dependencies
- SpacetimeDB (self-hosted or cloud): `spacetimedb-sdk` Rust crate
- WebSocket: `tokio-tungstenite` or `axum` for the command relay
- Redis connection (from S2) for event bridging

---

## Implementation Plan

### Phase 1: Research & Prototype
- [ ] Install SpacetimeDB CLI and local instance
- [ ] Create minimal WASM module with clock state table
- [ ] Verify TS client auto-subscription works
- [ ] Benchmark latency for state updates (target: <50ms)
- [ ] Document: SpacetimeDB vs pure WebSocket decision matrix

### Phase 2: WebSocket Command Gateway
- Implement `epi gate start` — launch WebSocket server (port 8420)
- Implement basic RPC: `core.inspect`, `vault.read`, `graph.query`
- Port epi-claw gateway-lock pattern for single-instance enforcement
- TLS support (from epi-claw TLS gateway pattern)

### Phase 3: SpacetimeDB State Layer
- Create SpacetimeDB module with tables:
  - `ClockState` (M3 tick, position, topology mode)
  - `CoordinateActivity` (active traversals, agent operations)
  - `SessionState` (connected clients, active sessions)
- Implement `epi gate subscribe` — CLI client for state feed
- Bridge S2 Redis pub/sub -> SpacetimeDB table updates

### Phase 4: Live Visualization
- Web client (Svelte or vanilla TS) consuming SpacetimeDB subscriptions
- M3 clock visualization: 72-fold circular display with active highlighting
- Topology mode rendering: torus/lemniscate/klein bottle visualization
- Coordinate activity heat map
- Host as static site with SpacetimeDB connection

### Phase 5: Agent Bridge
- PI agent session management through gateway
- Agent command relay (agent -> `epi` CLI -> response)
- Context frame signature routing for parallel agents

---

## Epi-Claw Gateway Patterns (Reference)

From the Epi-Logos repo, the existing epi-claw gateway provides:
- `src/infra/gateway-lock.ts` — single-instance enforcement
- `src/infra/tls/gateway.ts` — TLS certificate management
- `src/macos/gateway-daemon.ts` — macOS daemon lifecycle
- `src/agents/tools/gateway-tool.ts` — agent tool registration
- `src/tui/gateway-chat.ts` — TUI chat interface
- `src/config/types.gateway.ts` — gateway configuration types
- `ui/src/ui/gateway.ts` — UI gateway client

These patterns inform but do not dictate the C Experiments implementation. The key structural decisions:
1. **Rust, not TypeScript** — gateway server in Rust (tokio async runtime)
2. **Dual transport** — SpacetimeDB for state, WebSocket for commands
3. **CLI-first** — `epi gate` commands, not a standalone daemon initially

---

## Authority Documents
- `docs/resources/S/2026-02-11-omnipanel-gateway-parity-plan.md` (Gateway parity)
- `docs/resources/S/2026-02-17-omnipanel-gateway-state-architecture-plan.md` (State architecture)
- `docs/resources/S/2026-02-11-omnipanel-gateway-gap-analysis-elevation-plan.md` (Gap analysis)
- `docs/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` (S3/S3' module definition)
