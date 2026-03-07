# S-Stack Integration Architecture

**Status:** Draft v1
**Date:** 2026-03-07
**Purpose:** Ground-up integration map for S0-S5 / S0'-S5' layers

---

## The Stack as Toroidal Process

The S-family manifests the #0-#5 archetypes through the technology stack domain. The layers are not independent services — they form a toroidal process where each layer feeds into the next, completing the Mobius return from S5 back to S0:

```
S0 (Ground/Terminal)
  -> S1 (Material/Vault) — CLI writes to physical state
    -> S2 (Relational/Graph) — physical state reflected in graph
      -> S3 (Network/Gateway) — graph state streamed live
        -> S4 (Agent/PI) — agents observe and act
          -> S5 (World/External) — actions manifest externally
            -> S0 (Ground) — external feedback returns to terminal
```

---

## Integration Matrix

| From \ To | S0 | S1 | S2 | S3 | S4 | S5 |
|-----------|----|----|----|----|----|----|
| **S0** | - | CLI -> vault | CLI -> graph | CLI -> gateway | CLI -> agent | CLI -> sync |
| **S1** | vault events -> CLI | - | mutations -> graph upsert | events -> live feed | vault content -> agent | vault -> publication |
| **S2** | graph queries -> CLI | graph -> vault backfill | - | pub/sub -> live stream | graph context -> agent | graph state -> triggers |
| **S3** | gateway -> CLI relay | gateway -> vault writes | gateway -> graph writes | - | gateway -> agent bridge | gateway -> notifications |
| **S4** | agent -> CLI commands | agent -> vault reads/writes | agent -> graph queries | agent -> gateway output | - | agent -> publish triggers |
| **S5** | webhooks -> CLI | external -> vault ingest | external -> graph nodes | external -> gateway events | external -> agent prompts | - |

---

## Data Flow Patterns

### Pattern 1: Agent Coordinate Commit (Primary Flow)
```
User prompt -> S4 (PI agent interprets)
  -> S0 (epi core validate — topological check)
  -> S1 (epi vault write — persist markdown)
  -> S2 (epi graph upsert — update graph)
  -> S3 (event emitted — live visualization updates)
  -> S5 (optional — notify/publish)
```

### Pattern 2: Live Visualization (M3 Clock)
```
S0 (C engine torus walk)
  -> S2 (clock state written to graph/Redis)
  -> S3/SpacetimeDB (state table updated)
  -> Clients (auto-sync via subscription)
```

### Pattern 3: Evolutionary Recompile
```
S5 (trigger — cron or manual)
  -> S2 (extract STATUS_PROVISIONAL nodes)
  -> S0 (C engine recompile: regenerate headers, rebuild, test)
  -> S2 (update graph, clear provisional flags)
  -> S1 (update vault, clear provisional tags)
  -> S3 (emit recompile event)
```

### Pattern 4: External Ingest (Mobius Return)
```
S5 (webhook received from external service)
  -> S0 (epi core validate coordinate)
  -> S1 (create vault note)
  -> S2 (create graph node)
  -> S4 (notify agent of new content)
```

---

## Shared Infrastructure

### Configuration
All layers share a common configuration root:
```
~/.epi/
  config.json          — global settings
  agents/              — per-agent directories (S4)
  sync-config.json     — external service credentials (S5)
  gate-config.json     — gateway settings (S3)
```

### Environment Variables
```
EPILOGOS_VAULT        — Obsidian vault root (S1)
EPILOGOS_NEO4J_URI    — Neo4j connection (S2)
EPILOGOS_REDIS_URI    — Redis connection (S2)
EPILOGOS_GATE_PORT    — Gateway port (S3, default 8420)
EPI_AGENT_HOME        — Agent directory root (S4)
EPILOGOS_N8N_URL      — n8n instance URL (S5)
NOTION_TOKEN          — Notion API token (S5)
TELEGRAM_BOT_TOKEN    — Telegram bot (S5)
```

### The epi CLI as Universal Substrate
Every S layer is accessed through the `epi` CLI. No layer has a standalone daemon or separate entry point (except for the services themselves — Neo4j, Redis, n8n). This is by design:

```
epi core    -> S0/S0' (C library FFI)
epi vault   -> S1/S1' (obsidian-cli wrapper)
epi graph   -> S2/S2' (Neo4j + Redis client)
epi gate    -> S3/S3' (gateway management)
epi agent   -> S4/S4' (PI agent lifecycle)
epi sync    -> S5/S5' (external integrations)
```

---

## Implementation Priority

### Tier 1: Foundation (In Progress)
- [x] S0/S0' — epi CLI + C library (core, ffi, tui)
- [ ] S1 — obsidian-cli installation and vault connectivity
- [ ] S4 — PI agent installation and scaffold

### Tier 2: Data Layer
- [ ] S2 — Neo4j + Redis setup and Rust client
- [ ] S1' — QL frontmatter and Day/NOW lifecycle
- [ ] S2' — QL graph schema and coordinate CRUD

### Tier 3: Network Layer
- [ ] S3 — Gateway server (WebSocket)
- [ ] S3 — SpacetimeDB evaluation and prototype
- [ ] S4' — epi-citta extension and ta-onta module port

### Tier 4: World Layer
- [ ] S5 — n8n setup and Notion client
- [ ] S5' — Publication pipeline and automation rules
- [ ] S3' — Live M3 clock visualization

---

## Directory Organization

```
/Users/admin/Documents/Epi-Logos C Experiments/
  |
  +-- src/              — C library (S0 bedrock)
  +-- include/          — C headers
  +-- epi-cli/          — Rust CLI (S0' router to all layers)
  |     +-- src/
  |           +-- core/     S0'
  |           +-- vault/    S1/S1'
  |           +-- graph/    S2/S2'
  |           +-- gate/     S3/S3'
  |           +-- agent/    S4/S4'
  |           +-- sync/     S5/S5'
  |           +-- ffi/      S0 FFI bridge
  |           +-- tui/      S0 TUI dashboard
  |
  +-- .pi/              — PI agent extensions (S4')
  |     +-- extensions/
  |     +-- prompts/
  |     +-- agents/
  |
  +-- skills/           — Agent skills (S4')
  +-- commands/         — Agent commands (S4')
  +-- hooks/            — Agent hooks (S4')
  |
  +-- docs/
        +-- specs/S/    — These spec documents
        +-- resources/S/ — Planning docs from Epi-Logos repo
        +-- plans/      — Implementation plans
```
