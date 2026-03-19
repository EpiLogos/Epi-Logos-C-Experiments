# `epi flow` — CT0 Daily Flow Journal

> **For agentic workers:** This is a design spec. Use superpowers:writing-plans to create the implementation plan.

**Goal:** Own-stack journaling system that replaces jrnl with a Rust-native `epi flow` command, writing to daily FLOW.md files with wikilink timestamps, typed entry flags, encrypted storage, and ripgrep-powered search.

**Architecture:** Top-level `epi flow` CLI module. One FLOW.md per day (`DD-MM-YYYY-flow.md`). Entries are append-only H2 blocks with `[[wikilink]]` timestamps. Tags become `[[wikilinks]]` on save. Typed flags (`*type*`) route entries to downstream pipelines. Search via ripgrep over the day-file filesystem. Encryption via chacha20poly1305 (already in Cargo.toml).

**Tech Stack:** Rust (clap, serde_json, serde_yaml, chrono, chacha20poly1305, argon2, rpassword), ripgrep (system binary or grep crate)

---

## 1. Entry Format Specification

### 1.1 File Structure

Each day produces one file inside the day folder resolved by `vault::paths::day_folder()`:

```
{vault_root}/Empty/Present/{DD-MM-YYYY}/{DD-MM-YYYY}-flow.md
```

Where `vault_root` = `$EPILOGOS_VAULT` or `~/Documents/Epi-Logos/Idea/` (same as existing vault commands).

Example: `~/Documents/Epi-Logos/Idea/Empty/Present/11-03-2026/11-03-2026-flow.md`

### 1.2 Frontmatter (file header, written once on init)

```yaml
---
coordinate: "CT0"
c_4_artifact_role: "flow"
c_1_ctx_type: "CT0"
c_3_ctx_frame: "00/00"
c_4_invocation_profile: "daily_flow"
m_4_nara_domain: "journal"
c_3_day_id: "11-03-2026"
c_0_source_coordinates: []
c_3_created_at: "2026-03-11T08:00:00Z"
---

# Flow — 11-03-2026

---
```

**Changes from current FLOW.md template:**
- `coordinate` field set to `"CT0"` (Ground — the receptive space itself, not a specific coord). This satisfies the ontological convention that `coordinate` is the one special key, while not over-determining to a specific M4/P/S coordinate.
- `c_4_invocation_kind` **removed** — was `"cron"` but flow files can be created manually or by cron. The creation method is not a property of the artifact.
- File renamed from `FLOW.md` to `DD-MM-YYYY-flow.md` (date in filename)
- Heading uses em-dash `—` (unicode, consistent with existing template)
- Existing `flow-init` vault command updated to delegate to `epi flow init`

### 1.3 Entry Block

Each entry is an atomic H2 block:

```markdown
## [[2026-03-11 08:30]] Morning thoughts *personal*

Working on nara integration. The identity matrix feels solid now.
Thinking about how the oracle connects to the transform cycle.

[[@architecture]] [[@nara]] [[#design]]

---
```

**Entry grammar:**

```
ENTRY     := "## " TIMESTAMP " " TITLE FLAG? "\n\n" BODY "\n\n" TAGS? "\n\n---\n"
TIMESTAMP := "[[" YYYY "-" MM "-" DD " " HH ":" MM "]]"
TITLE     := <free text, no newlines>
FLAG      := " *" TYPE "*"
TYPE      := <canonical or freeform identifier>
BODY      := <multiline free text>
TAGS      := (TAG " ")* TAG
TAG       := "[[" ("@" | "#") IDENTIFIER "]]"
```

**Rules:**
- Entries are delimited by `---` (horizontal rule)
- Timestamp is always a `[[wikilink]]` (links in Obsidian graph)
- Tags are written inline in body OR on a dedicated tag line
- On save, all `@tag` and `#tag` occurrences are wrapped as `[[@tag]]` / `[[#tag]]` wikilinks
- The `---` separator after each entry is mandatory (clean parsing boundary)

### 1.4 Typed Entry Flags (Canonical Set)

| Flag | Domain | Routing Target | Description |
|------|--------|---------------|-------------|
| `*personal*` | Self | Pratibimba subgraph | Personal reflection, inner life |
| `*dream*` | Self | Dream journal pipeline | Dream content, hypnagogic imagery |
| `*dev*` | Work | Session context / NOW.md | Development notes, code thoughts |
| `*llm*` | Work | Agent context injection | Notes for/about LLM interaction |
| `*oracle*` | Nara | Oracle history cross-ref | Oracle-related observations |
| `*task*` | Work | Task pipeline | Action items, reminders |
| `*reflection*` | Self | Logos cycle input | Contemplative / integrative |
| `*research*` | Work | Techne / notebook pipeline | Research notes, links, quotes |

**Extension rule:** Any `*identifier*` is valid. Unknown types are stored without routing. When a routing handler is registered for a new type, it retroactively applies to existing entries of that type.

**No flag = untyped:** Entry is stored as-is, available to all pipelines but not actively routed.

---

## 2. CLI Command: `epi flow`

Top-level command (not under `epi vault` or `epi nara`). This is the user's primary daily writing interface.

### 2.1 Command Tree

```
epi flow                              # No args: open today's flow in $EDITOR
epi flow "text"                       # Quick append: timestamped entry
epi flow "text" *dream*               # Quick append with typed flag
epi flow "text" @tag1 @tag2           # Quick append with tags
epi flow "text" *oracle* @iching      # Combined: flag + tags

epi flow show                         # Print today's flow to stdout
epi flow show --date 10-03-2026       # Print specific day's flow
epi flow show -n 3                    # Show last 3 entries from today
epi flow show --flagged               # Show only entries with a *type* flag
epi flow show --type dream            # Show only *dream* entries
epi flow show --format json           # Export today as JSON

epi flow search "text"                # Ripgrep across all flow files
epi flow search @tag                  # Search by tag
epi flow search --type oracle         # Search by flag type
epi flow search --from 01-03-2026     # Date range
epi flow search --to 10-03-2026
epi flow search -on 05-03-2026        # Specific date

epi flow tags                         # List all tags with counts
epi flow types                        # List all flag types with counts

epi flow edit                         # Open today's flow in $EDITOR
epi flow delete --entry 3             # Delete specific entry (interactive confirm)

epi flow init                         # Create today's flow file (idempotent)
epi flow encrypt                      # Encrypt today's flow (password prompt)
epi flow decrypt                      # Decrypt today's flow

epi flow export --format json         # Export all flow files as JSON
epi flow export --from 01-03-2026     # Export date range
```

**Phase 2 commands** (not in v1):
```
epi flow calendar                     # Show which days have flow files
epi flow history                      # Show today-in-history (same day, past years)
epi flow edit --entry 3               # Open specific entry in $EDITOR
epi flow retime --entry 3 "14:30"     # Change entry timestamp
epi flow export --format yaml         # YAML export
epi flow import --file entries.json   # Import entries from JSON
```

### 2.2 Quick Append Behavior

The primary use case: `epi flow "some thought" *type* @tags`

1. Resolve today's flow file path (`DD-MM-YYYY-flow.md`)
2. If file doesn't exist, run `flow init` first (create with frontmatter)
3. Parse CLI args: extract text, flag (`*type*`), tags (`@word` / `#word`)
4. Generate timestamp: `[[YYYY-MM-DD HH:MM]]`
5. Generate title: first line of text (truncated to 60 chars if needed), or full text if single line
6. Wrap all `@tag` and `#tag` as `[[@tag]]` / `[[#tag]]` wikilinks
7. Append entry block to file (after last `---` separator)
8. Print confirmation: `Flow +1 [[2026-03-11 08:30]] *personal* (3 entries today)`

**Multi-line input:** If no text argument given and no subcommand, open `$EDITOR` with a temp file. On save, parse the content as entry body.

### 2.3 Search via Ripgrep

Search uses the `rg` system binary (ripgrep):

```rust
Command::new("rg")
    .args(&["--type", "md", pattern, &flow_dir])
    .output()
```

**Why ripgrep:** Fast, respects .gitignore, structured output (`--json` flag), already standard on this system. The one-file-per-day layout means date filtering is just `rg pattern DD-MM-YYYY-flow.md` — the filesystem IS the date index.

For programmatic use, results are parsed from rg's JSON output format.

### 2.4 Export Formats

| Format | Method | Use Case |
|--------|--------|----------|
| `json` | Parse entries, serialize with serde | Gateway RPC, agent context |
| `yaml` | Parse entries, serialize with serde | Config/archival |
| `markdown` | Cat the raw file | Human reading |
| `text` | Strip markdown formatting | Plain text pipe |
| `tags` | Extract all tags with counts | Overview |
| `short` | Timestamps + titles only | Quick scan |

### 2.5 JSON Entry Schema

```json
{
  "entries": [
    {
      "index": 0,
      "timestamp": "2026-03-11T08:30:00Z",
      "title": "Morning thoughts",
      "type": "personal",
      "flagged": true,
      "body": "Working on nara integration...",
      "tags": ["architecture", "nara", "design"],
      "wikilinks": ["@architecture", "@nara", "#design"]
    }
  ],
  "meta": {
    "day_id": "11-03-2026",
    "entry_count": 1,
    "types": {"personal": 1},
    "tags": {"architecture": 1, "nara": 1, "design": 1}
  }
}
```

---

## 3. Encryption

Uses chacha20poly1305 + argon2id (already in Cargo.toml from nara identity work).

### 3.1 Encrypt Flow

```
epi flow encrypt [--date DD-MM-YYYY]
```

1. Prompt for password via `rpassword::read_password()`
2. Derive key via argon2id (same params as nara identity layer encryption)
3. Read flow file content
4. Encrypt with ChaCha20-Poly1305, prepend 12-byte nonce
5. Write to `DD-MM-YYYY-flow.enc` (alongside or replacing `.md`)
6. Optionally zero the plaintext `.md` file

### 3.2 Decrypt Flow

```
epi flow decrypt [--date DD-MM-YYYY]
```

Reverse of above. Writes back to `.md`.

### 3.3 Encrypted File Behavior

When `epi flow show`, `epi flow search`, or any read command encounters a day where only `.enc` exists (no `.md`):
1. Prompt for password via `rpassword::read_password()`
2. Decrypt to a temporary in-memory buffer
3. Display/search the decrypted content
4. Do NOT persist the decrypted `.md` to disk

When `epi flow "text"` (append) targets an encrypted day:
1. Prompt for password
2. Decrypt existing content to memory
3. Append the new entry
4. Re-encrypt the full content back to `.enc`
5. Never write plaintext `.md`

### 3.4 Transparent Mode (Future)

Config option `flow.encrypt_on_write: true` — every append auto-encrypts. Requires password cached in session (via keyring or env var). Not in v1.

---

## 4. Template Integration (Hen) — Phase 2

The Hen extension (#1) manages templates. Flow integrates via:

### 4.1 Entry Templates (Phase 2)

```
epi flow --template dream "Last night I dreamed..."
```

Templates live in `~/.epi-logos/templates/flow/` or `Idea/Bimba/World/templates/flow/`:

```markdown
<!-- dream.md -->
## [[{{timestamp}}]] {{title}} *dream*

**Setting:**
**Characters:**
**Emotions:**
**Symbols:**

{{body}}

[[@dream]]

---
```

### 4.2 Day Template (Phase 2)

The daily flow file template (replacing current `FLOW.md` in `Idea/Bimba/World/`):

```markdown
---
coordinate: "CT0"
c_4_artifact_role: "flow"
c_1_ctx_type: "CT0"
c_3_ctx_frame: "00/00"
c_4_invocation_profile: "daily_flow"
m_4_nara_domain: "journal"
c_3_day_id: "{{day_id}}"
c_0_source_coordinates: []
c_3_created_at: "{{created_at}}"
---

# Flow — {{day_id}}

---
```

---

## 5. Entry Parsing

Parsing is the core shared logic used by search, export, edit, delete, and the Electron app.

### 5.1 Parse Algorithm

```
1. Read file content
2. Split on frontmatter delimiter (first "---\n...\n---\n")
3. Split remaining content on "\n---\n" → raw entry blocks
4. For each block:
   a. Match H2 header: "## [[TIMESTAMP]] TITLE *TYPE*"
   b. Extract timestamp → DateTime
   c. Extract title → String
   d. Extract flag type → Option<String>
   e. Remaining lines → body
   f. Extract tags from body: regex [[(@|#)\w+]]
   g. Return FlowEntry struct
```

### 5.2 FlowEntry Struct

```rust
pub struct FlowEntry {
    pub index: usize,
    pub timestamp: DateTime<Utc>,
    pub title: String,
    pub entry_type: Option<String>,       // *dream*, *dev*, etc.
    pub body: String,
    pub tags: Vec<String>,                // ["architecture", "nara"]
    pub raw: String,                      // Original markdown block
}
```

### 5.3 Wikilink Normalization

On every write (append, edit, import), run a normalization pass:

```
@word     → [[@word]]
#word     → [[#word]]
@word@    → no change (email address)
#123      → no change (issue number — only if pure digits)
```

Regex: `(?<!\[)(@|#)([a-zA-Z_]\w{0,30})(?!\])` → `[[$1$2]]`

**Test vectors:**

| Input | Output | Reason |
|-------|--------|--------|
| `@nara` | `[[@nara]]` | Standard tag wrap |
| `#design` | `[[#design]]` | Hashtag wrap |
| `[[@nara]]` | `[[@nara]]` | Already wrapped, no change |
| `[[#design]]` | `[[#design]]` | Already wrapped, no change |
| `email@host.com` | `email@host.com` | `@h` preceded by alphanumeric — but regex WILL match. Need refinement: use `(?<!\w)` as additional lookbehind |
| `#123` | `#123` | Pure digits, no match (identifier must start with `[a-zA-Z_]`) |
| `[@tag]` | `[@tag]` | Single bracket — lookbehind sees `[`, skips. Acceptable. |
| `## heading with #tag` | `## heading with [[#tag]]` | Tag in heading body — wraps correctly |

**Refined regex** (handles email edge case): `(?<![[\w])(@|#)([a-zA-Z_]\w{0,30})(?!\])` — adds `\w` to negative lookbehind so `email@host` is not matched.

---

## 6. Electron App Compliance

The M4' Electron app (Nara domain / journal UI) MUST enforce the same entry format.

### 6.1 Write Contract

Any newline entry in the Electron app's flow editor MUST:

1. Generate `## [[TIMESTAMP]] TITLE` header
2. Include `*type*` flag if user selects an entry type
3. Wrap tags as `[[wikilinks]]`
4. Terminate with `---` separator
5. Append (never rewrite) to the day's flow file

### 6.2 Shared Parser

The entry parsing logic (Section 5) should be available as:
- Rust: `epi_logos::flow::parse_entries(content: &str) -> Vec<FlowEntry>`
- TypeScript: `parseFlowEntries(content: string): FlowEntry[]` (port or WASM)

This ensures CLI and Electron always agree on entry boundaries.

### 6.3 Conflict Resolution

If both CLI and Electron write simultaneously:
- Each write is an **append** (no rewrite) — conflicts are structurally impossible for normal writes
- For edit/delete: use file-level advisory lock (`flock`) with 1s timeout

---

## 7. Gateway RPC Methods

Register in `gate/server.rs` dispatch:

```
flow.append          — append entry (params: text, type?, tags?)
flow.show            — read today's entries (params: date?, n?, type?, format?)
flow.search          — ripgrep search (params: pattern, from?, to?, type?)
flow.tags            — tag counts (params: date?)
flow.types           — flag type counts (params: date?)
flow.entries         — parsed entries as JSON (params: date?, n?)
flow.entry.get       — single entry by index (params: date, index)
flow.entry.delete    — delete entry (params: date, index)
flow.init            — create today's flow file
flow.encrypt         — encrypt flow file (params: date?)
flow.decrypt         — decrypt flow file (params: date?)
flow.export          — export date range (params: from?, to?, format)
```

---

## 8. File Layout

### 8.1 Module Structure

```
epi-cli/src/flow/
  mod.rs              — FlowCmd enum, dispatch, top-level command
  entry.rs            — FlowEntry struct, parse_entries(), format_entry()
  append.rs           — append logic, wikilink normalization, tag extraction
  search.rs           — ripgrep wrapper, date filtering, result parsing
  encrypt.rs          — chacha20poly1305 encrypt/decrypt
  export.rs           — JSON/text/short/tags format exporters
  templates.rs        — entry template loading + rendering (Phase 2)
```

### 8.2 Integration Checklist

These existing files must be modified to register the new module:

1. **`epi-cli/src/lib.rs`** — add `pub mod flow;`
2. **`epi-cli/src/main.rs`** — add `Flow` variant to `Commands` enum:
   ```rust
   /// CT0 daily flow journal
   Flow {
       #[command(subcommand)]
       cmd: Option<flow::FlowCmd>,
       /// Quick append: epi flow "text"
       #[arg(trailing_var_arg = true)]
       text: Vec<String>,
   },
   ```
   Add dispatch arm matching the vault/nara pattern (synchronous, `Result<String, String>`)
3. **`epi-cli/src/gate/server.rs`** — add before catch-all:
   ```rust
   method if method.starts_with("flow.") => {
       super::flow_gate::dispatch_flow(method, &frame.params)
   }
   ```
4. **`epi-cli/src/gate/mod.rs`** — add `pub mod flow_gate;` (named `flow_gate` to avoid ambiguity with `crate::flow`)
5. **`epi-cli/src/vault/mod.rs`** — update `FlowInit` to delegate to `crate::flow::init()`

### 8.3 Storage Layout

Uses `vault::paths::day_folder()` for path resolution:

```
{vault_root}/Empty/Present/
  11-03-2026/
    11-03-2026-flow.md          — day's flow journal (plaintext)
    11-03-2026-flow.enc         — encrypted version (if encrypted)
    daily-note.md               — existing daily note
    {session_id}/now.md         — existing session notes
  10-03-2026/
    10-03-2026-flow.md
    ...
```

Where `{vault_root}` = `$EPILOGOS_VAULT` or `~/Documents/Epi-Logos/Idea/`

### 8.4 Template Location (Phase 2)

```
~/.epi-logos/templates/flow/
  dream.md
  oracle.md
  dev.md
  ...
Idea/Bimba/World/templates/flow/    — vault-local templates (override)
```

---

## 9. Dispatch Signature

`flow::dispatch()` is **synchronous** (`fn dispatch(cmd, json) -> Result<String, String>`), matching the vault and nara patterns. The ripgrep search shells out via `std::process::Command` (blocking). If async search is needed later, it can be wrapped in `tokio::task::spawn_blocking` at the gateway layer.

---

## 10. Migration from Current FLOW.md

### 10.1 Backward Compatibility

- `epi vault flow-init` continues to work but delegates to `epi flow init`
- Old `FLOW.md` files (no date prefix) are recognized and readable
- First `epi flow` invocation on a day with old-format `FLOW.md`:
  1. Renames `FLOW.md` → `DD-MM-YYYY-flow.md`
  2. Preserves all existing content (frontmatter + body)
  3. Old free-form body text (before any `## [[timestamp]]` header) is kept as-is — the parser returns zero entries for this legacy preamble, but the text is preserved in the file
  4. New entries append below the legacy content after a `---` separator

### 10.2 Template Update

Update `Idea/Bimba/World/FLOW.md` template:
- Set `coordinate: "CT0"` (was `"{{day_coordinate}}"`)
- Remove `c_4_invocation_kind` field
- Update rendered filename to include date prefix
- Use em-dash `—` in heading (was `--`)
- Keep all other frontmatter keys

---

## 11. Agent Integration (Pipeline Hooks)

### 11.1 Context Injection

At session start, the agent context assembler includes:

```rust
let today_entries = flow::parse_entries(&today_flow)?;
let flagged = today_entries.iter()
    .filter(|e| e.entry_type.is_some())
    .collect::<Vec<_>>();
// Inject as session context breadcrumbs
```

### 11.2 Type-Based Routing

When an entry is appended with a known flag type, the system can fire a hook:

| Flag | Hook Action |
|------|-------------|
| `*oracle*` | Cross-ref with `nara oracle history` |
| `*dream*` | Queue for dream analysis pipeline |
| `*task*` | Create task entry in task pipeline |
| `*reflection*` | Queue as Logos cycle input (stage 0) |
| `*dev*` | Inject into active session's NOW.md context |

Hooks are opt-in via config. v1 ships with the routing table but hooks fire only when handlers are registered.

---

## 12. Success Criteria

1. `epi flow "thought" *personal* @tag` appends correctly formatted entry in < 50ms
2. Frontmatter is never modified by append operations
3. `epi flow search` uses ripgrep and returns results in < 200ms for 1000+ entries
4. All `@tag` and `#tag` become `[[wikilinks]]` on save
5. Flow files render cleanly in Obsidian (headers, wikilinks, tags all functional)
6. Encrypt/decrypt round-trips without data loss
7. Entry parsing produces identical results in Rust and TypeScript (tested via shared fixtures)
8. Electron app writes are indistinguishable from CLI writes (format compliance)

---

## Appendix: Comparison with jrnl v4.3

| Feature | jrnl | epi flow |
|---------|------|----------|
| Append entry | `jrnl "text"` | `epi flow "text"` |
| Timestamps | `[date]` (hardcoded single bracket) | `[[date]]` (wikilink) |
| Tags | `@tag` (plain text) | `[[@tag]]` (wikilinks) |
| Starred | `*` (boolean) | `*type*` (typed flags, open extension) |
| Search | Built-in Python | ripgrep (faster, structured output) |
| Encryption | Password-based (Python cryptography) | ChaCha20-Poly1305 + Argon2id |
| Frontmatter | Destroyed on write | Preserved (append-only) |
| Templates | Basic file templates | Hen template system integration |
| Export | json/yaml/xml/md/txt | json/yaml/md/txt + gateway RPC |
| Multi-journal | Config-based named journals | One file per day (filesystem = index) |
| Obsidian | No integration | Native (wikilinks, graph, frontmatter) |
| Routing | None | Typed flags → pipeline hooks |
| App compliance | N/A | Shared parser contract (Rust + TS) |
