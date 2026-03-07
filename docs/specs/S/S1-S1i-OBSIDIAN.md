# S1/S1' — Obsidian Vault (Material / Position)

**Status:** STUB — CLI wrapper exists, vault integration not yet live
**Coordinate:** S1 (raw vault access), S1' (QL-aligned Obsidian operations)
**Implementation:** `epi-cli/src/vault/` (Rust, obsidian-cli wrapper)
**CLI Namespace:** `epi vault`

---

## Architectural Role

S1 is the **sedimented physical state** — the human-readable markdown memory. Obsidian vault is where the system's knowledge crystallizes into persistent, navigable form. S1' adds coordinate semantics: which paths are canonical, what frontmatter schema means, how Day/NOW lifecycle maps to vault structure.

### S1 (Explicit) — Raw Vault Access
- Obsidian CLI as shared service (IPC/CLI)
- Raw CRUD: create, read, update, delete, move notes
- File event emission (filesystem watch)
- Frontmatter read/write (raw YAML, no schema enforcement)
- Search (content + metadata)
- Daily note / NOW file operations (raw)

### S1' (Implicate) — QL-Aligned Operations
- **Canonical path resolution**: `Idea/Bimba/World`, `Idea/Bimba/Seeds`, `Idea/Empty/Present`
- **Day/NOW path contract**:
  - Day folder: `Idea/Empty/Present/{DD-MM-YYYY}/daily-note.md`
  - NOW folder: `Idea/Empty/Present/{DD-MM-YYYY}/{YYYYMMDD-HHmmss}-{sessionId}/now.md`
  - No sequential counters — datetime-prefixed only
- **Frontmatter schema** (coordinate-key format `{family}_{n}_{semantic}`):
  - `p_0_grounds`, `p_1_title`, `c_0_links_to`, `m_3_archived_to`, etc.
- **Residency rules**: Bimba (canonical) vs Present (temporal) vs Pratibimba (archived)
- **Promotion lifecycle**: Seeds -> Types -> World
- **Archive destination**: `Pratibimba/Self/Action/History/{YYYY}/{MM}/{DD}/`
- **Bimba-Pratibimba forms**: S1'Cx canonical note forms
- **Canvas MOC dynamics**: Map-of-content canvas semantics

---

## Current State in This Repo

### What Exists
`epi-cli/src/vault/mod.rs` provides a complete obsidian-cli wrapper:
- `epi vault status` — vault connection check
- `epi vault create/read/search/search-content/daily` — CRUD via obsidian-cli
- `epi vault frontmatter-get/frontmatter-set` — YAML frontmatter operations
- `epi vault move/delete` — note lifecycle
- `epi vault now-read/now-write` — direct NOW.md file I/O

### What's Missing
1. **obsidian-cli not installed** — wrapper exists but has no backend
2. **No QL frontmatter schema enforcement** — raw YAML only
3. **No Day/NOW lifecycle management** — only raw file read/write
4. **No wikilink resolution** — no coordinate-aware linking
5. **No vault event streaming** — no filesystem watch integration
6. **No canvas/MOC operations**

---

## Integration Architecture

```
epi vault <cmd>
    |
    v
vault/mod.rs (Rust)
    |
    +-- obsidian-cli (external binary, IPC)
    |       |
    |       v
    |   Obsidian App (vault filesystem)
    |
    +-- Direct filesystem I/O (NOW.md, frontmatter)
    |
    +-- -> S0' (coordinate validation before writes)
    +-- -> S2' (graph sync after vault mutations)
```

### Dependencies
- `obsidian-cli` binary (must be installed: `npm install -g obsidian-cli` or equivalent)
- Obsidian app running (for IPC-based operations)
- `EPILOGOS_VAULT` env var (defaults to `/Users/admin/Documents/Epi-Logos/Idea`)

### Downstream Consumers
- **S2'** (graph): vault mutations trigger graph upserts
- **S4'** (agent): PI agents read/write vault through `epi vault`
- **S5'** (sync): Notion publication pulls from vault state

---

## Implementation Plan

### Phase 1: Obsidian CLI Setup
- Install and verify obsidian-cli
- Test `epi vault status` end-to-end
- Verify CRUD operations against live vault

### Phase 2: QL Frontmatter Layer
- Implement frontmatter schema validation (S0' coordinate validation)
- Add `epi vault frontmatter-validate` command
- Enforce canonical `{family}_{n}_{semantic}` key format on writes

### Phase 3: Day/NOW Lifecycle
- Implement `epi vault day-init` (create day folder + daily-note.md)
- Implement `epi vault now-init` (create NOW folder with datetime prefix)
- Add session ID propagation for NOW folder naming
- Wire archive rotation: Day -> Pratibimba/Self/Action/History/

### Phase 4: Event Streaming
- Filesystem watch on vault (notify crate in Rust)
- Event emission to S2' for graph sync
- Event emission to S3' for live gateway updates

---

## Authority Documents
- `docs/resources/S/2026-02-22-bimba-data-foundation-harmonization.md` (Obsidian CLI shared service)
- `docs/resources/S/2026-02-28-epi-claw-cli-harmonization-daily-commands.md` (Daily/NOW commands)
- `docs/resources/S/2026-02-26-epi-logos-canonical-system-plan.md` (S1/S1' module definition)
