# S5/S5' — n8n + Notion (World / Subsystem)

**Status:** STUB — CLI module exists, no implementation
**Coordinate:** S5 (raw external API access), S5' (QL-augmented automations)
**Implementation:** `epi-cli/src/sync/` (Rust)
**CLI Namespace:** `epi sync`

---

## Architectural Role

S5 is the **world layer** — external API access, webhooks, email, and real-world execution. It is the thinnest layer: pure API mechanics with no state ownership, no scheduling, no coordinate semantics.

S5' gives those raw APIs coordinate meaning: which API to call and why, automation rules that respect the QL paradigm, publication workflows that transform internal vault state into external-facing form.

### S5 (Explicit) — Raw External APIs
- **Notion API client**: raw CRUD on Notion databases, pages, blocks
- **n8n webhook connectors**: trigger and receive workflow events
- **Telegram bot API**: send/react/edit/delete messages (notification dispatch)
- **Generic HTTP/webhook surface**: extensibility point for future integrations
- **Email dispatch** (future): notification and digest delivery

### S5' (Implicate) — QL Automations
- **Publication workflows**: vault -> Notion (transform coordinate-tagged notes into published pages)
- **Creative output pipelines**: structured content generation from vault/graph state
- **Automation rules**: QL-aware triggers (e.g., "when coordinate M2.4 crystallizes, publish to Notion")
- **Notification dispatch**: Chronos-driven notifications via Telegram with full lineage metadata
- **Evolutionary recompile orchestration**: S5' coordinates the full S0' <-> S2' recompile cycle
- **Mobius return workflow**: S5 -> S0 (external world feeds back to ground)
- **Canon-recognition and promotion**: distinguish canon-worthy spec deltas, evidence-only outputs, protected-local Nara material, and external-publication candidates before any Notion/n8n/world push.

---

## Current State in This Repo

### What Exists
- `epi-cli/src/sync/mod.rs` — stub only

### What's Missing
1. **No Notion client** — no API integration
2. **No n8n connection** — no webhook/workflow support
3. **No Telegram bot** — no notification dispatch
4. **No automation rules** — no trigger/action system
5. **No publication pipeline** — no vault -> external transformation
6. **No canon-recognition queue** — no production path for reviewing M'/S' structural claims before publication, deprecation, or external sync

---

## n8n: The Extensibility Engine

n8n provides the workflow automation backbone:
- **Self-hosted**: full control, no vendor lock-in
- **Visual workflow builder**: non-code automation design
- **Webhook triggers**: receive events from any source
- **HTTP request nodes**: call any API
- **Code nodes**: custom JavaScript/Python for complex transforms
- **Credential management**: secure API key storage

### n8n Integration Pattern
```
epi sync trigger --workflow <name> --data '{...}'
    |
    v
n8n API (POST /webhook/{workflow-id})
    |
    +-- Workflow executes (visual pipeline)
    |       |
    |       +-- Transform data
    |       +-- Call external APIs (Notion, Telegram, email)
    |       +-- Return result
    |
    v
epi sync status --workflow <name> --run <id>
```

### Key n8n Workflows (Planned)
1. **Vault -> Notion Publisher**: transform markdown + frontmatter into Notion page
2. **Daily Digest**: aggregate Day folder content, format, send via Telegram
3. **Evolutionary Recompile Trigger**: graph state change -> recompile pipeline
4. **Session Archive**: NOW folder -> Pratibimba archive + notification
5. **External Ingest**: receive webhooks -> vault note creation

---

## Notion: The Publication Layer

Notion serves as the external creative output surface:
- **Databases**: structured views of coordinate-tagged content
- **Pages**: published artifacts (essays, notes, analysis)
- **Blocks**: rich content rendering
- **Relations**: cross-page linking (mirrors graph relations)

### Notion Integration Pattern
```
epi sync publish --coordinate "M2.4" --target notion
    |
    v
1. Read vault note (epi vault read)
2. Parse frontmatter (coordinate metadata)
3. Transform markdown -> Notion blocks
4. Upsert Notion page (Notion API)
5. Update graph (mark as published)
```

---

## Integration Architecture

```
epi sync <cmd>
    |
    v
sync/mod.rs (Rust)
    |
    +-- epi sync status     — show connected services
    +-- epi sync publish    — vault -> external publication
    +-- epi sync trigger    — fire n8n workflow
    +-- epi sync digest     — generate daily digest
    +-- epi sync recompile  — orchestrate evolutionary recompile
    |
    +-- n8n API (self-hosted)
    |       |
    |       +-- Workflow webhooks
    |       +-- Execution status
    |
    +-- Notion API
    |       |
    |       +-- Page CRUD
    |       +-- Database operations
    |
    +-- Telegram Bot API
    |       |
    |       +-- Notification dispatch
    |
    +-- <- S1' (vault content for publication)
    +-- <- S2' (graph state for triggers)
    +-- <- S3' (gateway events)
    +-- <- S4' (agent-initiated automations)
```

### Dependencies
- n8n instance (self-hosted, `npx n8n` or Docker)
- Notion API key (integration token)
- Telegram Bot Token (from BotFather)
- Rust crates: `reqwest` (HTTP client), `serde_json`

---

## Implementation Plan

### Phase 1: Service Discovery
- `epi sync status` — check connectivity to n8n, Notion, Telegram
- Configuration management: `~/.epi/sync-config.json`
- Credential storage (use `op://` 1Password integration or env vars)

### Phase 2: Notion Publication
- Implement Notion API client (pages, databases, blocks)
- Markdown -> Notion blocks transformer
- `epi sync publish` with coordinate metadata
- Frontmatter -> Notion properties mapping

### Phase 3: n8n Workflow Integration
- Webhook trigger/receive client
- Workflow execution status tracking
- Predefined workflow templates for common patterns

### Phase 4: Notification Dispatch
- Telegram bot message dispatch
- Lineage metadata in notifications (sessionId, dayId, etc.)
- Digest generation from Day folder

### Phase 5: Automation Rules
- QL-aware trigger system (coordinate events -> actions)
- Cron integration for scheduled automations
- Evolutionary recompile orchestration

---

## Authority Documents
- `docs/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` (S5/S5' module definition)
- `docs/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` (External integrations)
