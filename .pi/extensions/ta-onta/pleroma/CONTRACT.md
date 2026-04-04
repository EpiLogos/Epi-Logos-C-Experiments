# Pleroma Contract — Bounded Primitives & Tool Registration

**Extension class:** S4-2' within ta-onta
**S-Layer fold:** S2 (Graph/Neo4j) — entity layer, where operations are typed and bounded
**Position:** #2 (Parashakti — operation, dynamic process, entity)

> **Claw-first note (2026-04-04):** This `.pi/extensions/ta-onta/pleroma/` tree is the
> **PI compatibility surface**. The canonical authoring source is now `plugins/pleroma/`.
> New skills and agents should be authored there, not here. This tree is maintained for
> PI compat while claw parity is being verified.

---

## Responsibility

Pleroma is the **execution substrate registry** — it owns the 7 bounded primitives (external tools that agents can invoke), the PI tool registration surface, execution mode enforcement, and visual theme identity per extension context. Pleroma does NOT orchestrate agents (Anima), does NOT own vault content (Hen), and does NOT provide knowledge retrieval (Aletheia). It provides the typed, bounded execution surfaces that Anima dispatches into.

**What Pleroma does NOT own:** orchestration skills (→ Anima), evidence-acquisition skills (→ Aletheia), constitutional agents (→ Anima), Moirai agents (→ Aletheia).

---

## PI Hook Seams

| Hook | Purpose |
|------|---------|
| `extension_init` | Register all 9 bounded primitives as PI tools |
| `command_register` | Register primitive invocation commands |

---

## 7 Bounded Primitives

| Primitive | Mode | Description |
|-----------|------|-------------|
| `tmux` | interactive | Terminal multiplexer — session management |
| `cmux` | interactive | Composite multiplexer — multi-pane layout |
| `bkmr_kbase` | bounded | Vimarsa aperture-aware bookmark/knowledge base |
| `onecontext` | bounded | Cross-session memory context injection |
| `ralph_tui` | interactive | TUI task management (beads, bead-rust) |
| `worktrunk` | bounded | Working tree / worktree management |
| `epi_cli` | bounded | Epi CLI pullthrough — all epi subcommands |

**Removed:** `mprocs` (→ cmux), `gitbutler` (→ worktrunk), `notebooklm` (→ aletheia_gnosis_query)

**Source:** `.pi/extensions/ta-onta/pleroma/S2/pleroma-primitives.ts` — 7 `PrimitiveDef` entries.

---

## Registered Tools (PI)

Each bounded primitive gets a PI tool registration:

```typescript
pi.registerTool({ name: "tmux_exec",         description: "...", handler: ... })
pi.registerTool({ name: "epi_run",             description: "...", handler: ... })
pi.registerTool({ name: "bkmr_search",        description: "...", handler: ... })
pi.registerTool({ name: "ralph_tui_dispatch", description: "...", handler: ... })
// etc. — one tool per primitive, execution-mode-enforced
```

---

## CLI Bridge

```
epi agent plugin validate / install / list / uninstall   — Plugin lifecycle
epi agent primitive list                                  — List registered primitives
epi agent primitive status <name>                         — Primitive health check
```

---

## Staging Disposition (from _staging/)

Items in `_staging/` require reassignment before Pleroma plugin creation:

| Item | Current location | Correct owner |
|------|-----------------|---------------|
| vak-evaluate | pleroma-skills/orchestration | **Anima** |
| vak-coordinate-frame | pleroma-skills/orchestration | **Anima** |
| anima-orchestration | pleroma-skills/orchestration | **Anima** |
| day-night-pass | pleroma-skills/orchestration | **Anima** (Chronos dep) |
| ouroboros | pleroma-skills/orchestration | **Anima** |
| klein-mode | pleroma-skills/orchestration | **Anima** |
| chatlog-fetcher | pleroma-skills/atomic | **Aletheia** (evidence acquisition) |
| youtube-transcript | pleroma-skills/atomic | **Aletheia** (evidence acquisition) |
| notebooklm | pleroma-skills/atomic | **Aletheia** (quality benchmark) |
| repl (Darshana) | pleroma-skills/atomic | **Aletheia** → Anansi subagent |
| Constitutional agents (7) | pleroma/agents | **Anima** |
| Aletheia agents (6) | pleroma/agents | **Aletheia** |
| root-hooks (4) | _staging/root-hooks | **Khora** (bootstrap/lifecycle) |
| root-commands (3) | _staging/root-commands | Evaluate: likely delete or Pleroma |
| root-skills (3) | _staging/root-skills | Evaluate: likely delete (premature) |
| plugin.json | _staging/ | Pleroma — but reassign contents first |

**Atomic skills staying in Pleroma:** tmux, cmux, worktrunk, ralph-tui, epi-cli, pleroma-skill-proxy (the primitive wrappers).

---

## pi-vs-claude-code Primitive (lives here)

| File | Purpose |
|------|---------|
| `S2/themeMap.ts` | Visual identity map — per-extension colour/icon theme for PI contexts |

---

## Eval Suites

5 eval suites in `_staging/pleroma-evals/` — move to `pleroma/S2'/evals/` on creation:
- atomic-tools.yaml, discharge.yaml, klein.yaml, manifest.yaml, ouroboros.yaml, topology-routing.yaml

---

## Key Invariants

1. Execution mode is always declared: bounded / interactive / background — no implicit execution
2. Each primitive is isolated — no primitive can directly call another primitive
3. All 9 primitives are registered at extension init — no lazy registration
4. `notebooklm` primitive is explicitly temporary — retire when Gnosis quality benchmark passes
5. Orchestration skills do not belong here — they belong in Anima
6. Darshana REPL is owned by Anansi (Aletheia mode-function), staged in Pleroma only

---

## Dependencies

**Receives from:** Khora (session context), Anima (dispatch decisions that invoke primitives)
**Provides to:** Anima (execution surfaces for CFP thread types), Aletheia (bkmr_kbase vimarsa aperture)

---

## Phase Priorities

| Phase | Deliverable |
|-------|------------|
| P0 | Promote `pleroma-primitives.ts` to full PI tool registration |
| P0 | Staging reassignment: move orchestration skills → Anima, evidence skills → Aletheia |
| P0 | Reassign agent .md files to correct extension owners |
| P1 | themeMap.ts wired to PI context rendering |
| P1 | Execution mode enforcement per primitive |
| P1 | Eval suites moved to `pleroma/S2'/evals/` |
| P2 | onecontext integration (cross-session memory) |
| P2 | `epi agent primitive status` health checks |
