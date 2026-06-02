---
coordinate: "S4'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT4a"
c_3_created_at: "2026-04-25T00:00:00Z"
c_3_day_id: "25-04-2026"
c_0_source_coordinates:
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 24 ANIMA EPII ARCHITECTURE]]"
  - "[[FLOW 2026 04 23 TRACK B PI INTEGRATION AUDIT]]"
---

# FLOW 2026 04 25 NEXT MOVES

> Prioritised next moves based on the API audit and TS interface definitions. Goal: identify the thinnest vertical slice that proves the two-agent architecture works end-to-end.

---

## I. CURRENT STATE — WHAT EXISTS

### Has epi-cli Backing (Rust implementation exists)

| API Method | epi-cli Command | Status |
|---|---|---|
| `s0.exec` | Shell execution | Trivial wrapper |
| `s1.read` | `epi vault read` | Working |
| `s1.write` | `epi vault write` (via `khora_write`) | Working |
| `s1.search` | `epi vault search` (partial) | Partial |
| `s1.template` | `epi vault template-invoke` | Working |
| `s1.frontmatter.*` | `epi vault frontmatter-validate/set` | Working |
| `s2.gnostic.*` | `epi gnostic ingest/query/status` | Working (Python shell-out) |
| `s3.session.*` | `epi gate sessions list/patch` | Working |
| `s3'.kairos.*` | `epi vault kairos fetch/status` | Working (Python kerykeion) |
| `s3'.day.open` | `epi vault day-init` | Working |
| `s3'.day.close` | `epi vault archive-day` | Working |
| `s5'.kbase.search` | `epi kbase search` (bkmr) | Working |
| `s5.m.oracle` | `epi nara oracle cast` | Working |
| `s5.m.medicine` | `epi nara medicine` | Working |
| `s5.m.identity` | `epi nara identity` | Working |

### Has ta-onta Extension Backing (TypeScript exists)

| API Method | Extension Tool | Status |
|---|---|---|
| `s4'.vak.evaluate` | `vak_evaluate` | Working (skill injection + `epi agent vak evaluate`) |
| `s4'.orchestrate` | `anima_orchestrate` | Working (CF routing) |
| `s4'.context.assemble` | `nous_disclose` | Partial (S0'/S1'/S2' context) |
| `s4'.thought.route` | `aletheia_thought_route` | Working |
| `s3'.episodic.*` | `aletheia_episodic_*` | Working (HTTP to Graphiti sidecar) |
| `s4'.cs.*` | Anima extension memory | Working (in-memory, session-scoped) |

### Gateway Infrastructure (Rust, port 18794)

- WebSocket server with protocol v3 hello-ok handshake: **working**
- Session store (create, list, patch, reset): **working**
- Method dispatch by name: **working** (but not yet by S-coordinate prefix routing)
- Broadcast/event push: **partial** (health/heartbeat exists, no temporal event channels)
- Agent registration with capabilities: **not implemented**
- Multi-agent session tracking with group_id: **not implemented**

### Not Implemented at All

| API Surface | Methods | Notes |
|---|---|---|
| `s2.graph.*` | 3 | `epi graph` CLI doesn't exist; `graph_query` in Hen is a hard stub |
| `s2'.retrieve/rerank/enrich/coordinate.resolve` | 4 | Coordinate-aware retrieval is conceptual |
| `s1'.type/form/canvas/residency` | 7 | S1'Cx type-to-form system is design only |
| `s1'.compile/ledger/query/injection` | 4 | Compiler spine has compile.py but no typed API |
| `s1.sync.flush` | 1 | CRITICAL STUB (G1) |
| `s3.channel.*` | 3 | Channel registration not implemented |
| `s3'.temporal.subscribe` | 1 | Event subscription not in gateway |
| `s3'.presence.*` | 2 | SpacetimeDB not activated (rustc version gate) |
| `s3'.context.*` | 5 | Redis API not exposed through gateway |
| `s4'.psyche.*` | 2 | Psyche has no API surface |
| `s4'.team.*` | 2 | Team composition is `dispatch_parallel_agents` only |
| `s4'.crystallise` | 1 | Hard stub |
| `s4'.notify_user` | 1 | Not implemented |
| All `s5.*` | 11 | Bimba navigation + M' functions — epi-cli has backing but no API wrapper |
| All `s5'.*` (except kbase.search) | 14 | Epii doesn't exist yet |

---

## II. WHAT'S NEEDED FOR TWO PI INSTANCES ON THE GATEWAY

### Minimal Gateway Changes (Rust)

1. **Agent registration in `connect`** — extend the `hello-ok` handshake to accept `agent_id`, `capabilities`, and `subscriptions`. Store in a new `AgentRegistry` alongside `SessionStore`. Return `peer_agents` in response. **~50 lines of Rust.**

2. **Method routing by capability prefix** — when a request arrives for `s5.bimba.context`, check `AgentRegistry` for which agent declared `["s5"]` capability, route the request to that agent's WebSocket. Currently the gateway dispatches all methods locally. **~80 lines of Rust** (new dispatch branch in the method router).

3. **`group_id` on sessions** — add a `group_id` field to `SessionRecord` that links Anima and Epii sessions sharing the same Day. Assigned at `connect` time based on `day_id`. **~20 lines of Rust.**

4. **Event broadcast to subscribers** — extend the existing heartbeat broadcast to push typed events on named channels. Agents subscribe via `s3'.temporal.subscribe`. **~100 lines of Rust** (new `EventBus` struct + subscription registry).

**Total: ~250 lines of new Rust in the gateway.**

### Minimal Epii Configuration

1. Create `.pi-epii/` configuration directory (separate from `.pi/` which is Anima's)
2. Epii's `extension.ts` — register capabilities `["s5", "s5'"]`
3. Epii's `connect` handler — subscribe to `["temporal.day.*", "temporal.kairos.*"]`
4. One real method implementation to prove it works

### Minimal Anima Changes

1. Update `connect` call to include `agent_id: "anima"`, `capabilities: ["s4", "s4'"]`
2. Update `khora_session_init` to use `connect` instead of direct CLI calls for session setup

---

## III. WHICH METHODS NEED NEW RUST CODE

### In the Gateway (method dispatch)

| Method | Rust Work | Complexity |
|---|---|---|
| `connect` (extended) | Add AgentRegistry, group_id, peer_agents | Medium |
| `agent.capabilities` | Query AgentRegistry | Trivial |
| `s3.message.route` | Route request to target agent's WebSocket | Medium |
| `s3'.temporal.subscribe` | EventBus subscription management | Medium |
| `s3'.temporal.state` | Assemble from SessionStore + Redis + Graphiti | Medium |
| `s3'.context.*` | Redis GET/SET with namespace prefixing | Easy |

### In epi-cli (new commands)

| Method | CLI Command | Complexity |
|---|---|---|
| `s1.sync.flush` | `epi vault sync-flush` | Medium (Neo4j write) |
| `s2.graph.query` | `epi graph query` | Medium (Cypher passthrough) |
| `s2.graph.node` | `epi graph node` | Medium |
| `s1.backlinks` | `epi vault backlinks` | Easy |

---

## IV. WHICH METHODS ARE EPII-NATIVE TS (NO RUST NEEDED)

These run entirely in Epii's TypeScript process, calling `epi-cli` as needed:

| Method | Calls | Notes |
|---|---|---|
| `s5.bimba.navigate` | `epi graph traverse` | TS orchestration over CLI results |
| `s5.bimba.context` | `epi graph node` | Enrich with M' and S' metadata |
| `s5.bimba.search` | `epi graph query` | Coordinate-aware Cypher |
| `s5.bimba.map` | `epi graph traverse` | Tree assembly |
| `s5.m.clock` | `epi nara clock` | Pass-through |
| `s5.m.oracle` | `epi nara oracle cast` | Pass-through |
| `s5.m.medicine` | `epi nara medicine` | Pass-through |
| `s5.m.identity` | `epi nara identity` | Pass-through |
| `s5'.mef.apply` | Pure TS | Lens logic is agent-native |
| `s5'.mef.evaluate` | Pure TS | Multi-lens scoring |
| `s5'.ql.schema` | Read Bimba/World QL law files | File reads |
| `s5'.ql.evaluate` | Pure TS | QL evaluation logic |
| `s5'.kbase.search` | `epi kbase search` | Pass-through |
| `s5'.kbase.pool` | Multiple `epi kbase search` + dedup | TS orchestration |
| `s5'.gnosis.strategy` | Pure TS | Strategy is policy, not infra |
| `s5'.gnosis.govern` | Pure TS | Governance filtering |
| `s5'.explain` | Pure TS + Bimba reads | Knowledge synthesis |
| `s5'.improve.*` | TS + file reads/writes | Autoresearch loop |

---

## V. THE THINNEST VERTICAL SLICE

**Goal:** Two PI instances connect to the gateway. One subscribes to temporal events. One cross-agent query is made. One shared episodic write happens.

### The Slice

```
1. Anima connects:     connect(agent_id: "anima", capabilities: ["s4", "s4'"])
2. Epii connects:      connect(agent_id: "epii", capabilities: ["s5", "s5'"])
3. Gateway returns:    peer_agents: [{agent_id: "anima", ...}] to Epii
4. Anima subscribes:   s3'.temporal.subscribe(["temporal.session.*"])
5. Epii subscribes:    s3'.temporal.subscribe(["temporal.session.*"])
6. Cross-agent query:  Anima calls s4.agent.query(target: "epii", method: "s5.bimba.context", params: {coordinate: "S4'"})
7. Gateway routes:     forwards to Epii's WebSocket
8. Epii responds:      returns BimbaNode for S4' (reads from vault file or epi graph)
9. Anima receives:     async result on "agent.result.{ack_id}"
10. Shared episodic:   Anima calls s3'.episodic.record(content: "first cross-agent query", agent_id: "anima")
11. Epii calls:        s3'.episodic.record(content: "served bimba context for S4'", agent_id: "epii")
12. Both recorded:     same Day arc, different agent_ids, shared Graphiti instance
```

### What This Exercises

| Concern | Exercised By |
|---|---|
| Agent registration | Steps 1-2 |
| Peer discovery | Step 3 |
| Temporal subscription | Steps 4-5 |
| Cross-agent query via gateway | Steps 6-9 |
| Capability-based routing | Step 7 |
| Async result delivery | Step 9 |
| Multi-agent episodic writing | Steps 10-12 |
| Shared Day arc | Steps 10-12 |

### Implementation Order

| Step | What to Build | Where | Effort |
|---|---|---|---|
| **1** | AgentRegistry in gateway | `epi-cli/src/gate/` | 1 session |
| **2** | Extended `connect` with agent_id/capabilities/peer_agents | `epi-cli/src/gate/` | 1 session |
| **3** | Method routing by capability prefix | `epi-cli/src/gate/dispatch.rs` | 1 session |
| **4** | Epii `.pi-epii/` scaffold + minimal extension.ts | `.pi-epii/extensions/` | 1 session |
| **5** | `s5.bimba.context` implementation in Epii | `.pi-epii/extensions/epii/` | 1 session |
| **6** | EventBus + `s3'.temporal.subscribe` | `epi-cli/src/gate/` | 1 session |
| **7** | `s3'.episodic.record` gateway endpoint (proxy to Graphiti) | `epi-cli/src/gate/` | 1 session |
| **8** | Two-window `epi up` (both agents start) | `epi-cli/src/up.rs` | 0.5 session |
| **9** | Smoke test: run the 12-step slice | Manual | 0.5 session |

**~8 sessions to prove the architecture.** After that, every other API method is additive — the routing, subscription, and cross-agent patterns are established.

---

## VI. PRIORITISED NEXT MOVES (not the vertical slice — the full roadmap)

### Tier 1: Architecture Proof (the vertical slice above)

1. Gateway AgentRegistry + extended `connect`
2. Capability-based method routing
3. Epii scaffold + one real method (`s5.bimba.context`)
4. EventBus + temporal subscriptions
5. `s3'.episodic.record` gateway endpoint
6. Two-window `epi up`

### Tier 2: Essential API Coverage

7. `s1.sync.flush` — unblock G1 (vault→Neo4j sync)
8. `s2.graph.query` / `s2.graph.node` — `epi graph` CLI commands
9. `s3'.context.*` — Redis through gateway
10. `s4'.psyche.state/update` — Layer 7 coverage
11. `s4'.vak.evaluate` response expansion — hot field coverage
12. `connect` response expansion — NOW identity, workspace_root

### Tier 3: Epii Capability Build-out

13. `s5.m.*` pass-through methods (7 methods, all backed by epi-cli)
14. `s5'.mef.apply/evaluate` — MEF lens logic in TS
15. `s5'.ql.schema/evaluate` — QL evaluation in TS
16. `s5'.kbase.pool` — multi-query assembly
17. `s5'.gnosis.strategy/govern` — retrieval policy

### Tier 4: Infrastructure Completion

18. `s3.channel.register` — channel multiplexing
19. `s1'.compile/ledger/query/injection` — compiler spine as API
20. `s1'.type/form/canvas/residency` — S1'Cx type-to-form API
21. `s2'.retrieve/rerank/enrich` — coordinate-aware retrieval API
22. `s3'.presence.*` — SpacetimeDB (blocked on rustc version)

### Tier 5: Deep System Features

23. `s4'.crystallise` — real crystallisation pipeline
24. `s5'.improve.*` — autoresearch loop
25. `s5'.explain/teach` — pedagogy surface
26. `s5'.seed.generate` — SEED.md generation
27. `s4'.notify_user` — user notification routing
28. `s3.channel.send` — Telegram/WhatsApp/Slack adapters

---

## VII. THE FIRST SESSION'S WORK

If starting now, the highest-value single session is **steps 1-3 of the vertical slice**: AgentRegistry + extended connect + capability routing.

This is entirely in `epi-cli/src/gate/`. No TypeScript needed. The gateway gains the ability to register multiple agents and route requests to them by S-coordinate prefix. Once this exists, Epii can be scaffolded and connected in the next session.

The gateway currently has:
- `SessionStore` (create/list/patch/reset)
- Method dispatch (hardcoded match on method name)
- WebSocket broadcast (health/heartbeat)

After one session it would have:
- `AgentRegistry` (register/capabilities/routing)
- `SessionStore` with `group_id` and `agent_id`
- Method dispatch by capability prefix (agent-routed for s4/s5, local for s0-s3)
- Extended `connect` returning peer agents

This is the load-bearing infrastructure change. Everything else builds on top.
