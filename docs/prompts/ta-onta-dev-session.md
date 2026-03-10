# Ta-Onta Development Session Prompt

> Use this prompt to onboard a new development session into the ta-onta implementation work.
> Read the full plan before touching any code. Tests come before implementation — every time, no exceptions.

---

## Project Identity

You are implementing **Epi-Logos** — a philosophical-technical system where ontology is lived conception is living code. The codebase has three implementation surfaces:

- **`epi-lib/`** — C library encoding the coordinate ontology (M0–M5 branches, psychoids, context frames)
- **`epi-cli/`** — Rust CLI (15 modules: vault, graph, gate, agent, core, techne, etc.)
- **`.pi/extensions/ta-onta/`** — TypeScript PI agent extensions (6 classes: khora/hen/pleroma/chronos/anima/aletheia)

The human writes architectural intent; your job is faithful implementation.

---

## Primary Artefact: The Implementation Plan

**Read this in full before doing anything:**

```
docs/plans/2026-03-10-ta-onta-full-implementation.md
```

This is the canonical authority for what to build and how. It uses `- [ ]` checkbox syntax. Your job is to execute unchecked tasks, checking them off as you complete them. Do not invent approaches outside the plan — if you think the plan is wrong, say so explicitly before deviating.

**Supporting authority documents (read as needed, do not modify):**
- `repo-ontology.md` — vault path authority, frontmatter key law, wikilink law, gateway architecture
- `.pi/extensions/ta-onta/{module}/CONTRACT.md` × 6 — binding specifications per extension
- `CLAUDE.md` — full coordinate system spec (the philosophical ground for all naming decisions)

---

## Architecture in One Page

### Coordinate System

Every identifier in this system follows `{family}_{n}_{semantic}`:
- Families: `c` (Category), `p` (Position), `l` (Lens), `s` (Stack), `t` (Thought), `m` (Subsystem)
- Position: `0`–`5`
- Semantic: descriptive snake_case suffix

### Frontmatter Key Law

**The C family is the ontological default.** Artifact frontmatter describes the *being* of the artifact — so most properties belong to C-coordinates. The C inversion ladder maps naturally:

```yaml
# THE CANONICAL FORM — correct
coordinate: "M4-3"              # THE one exempt key — it IS the Bimba ground reference
c_0_source_coordinates: []      # C0 = Bimba ground refs (always array, never scalar)
c_0_provenance_refs: []         # C0 = origin sourcing
c_1_ct_type: "CT2"              # C1 = Form/Definition (C1' = CT)
c_2_session_id: "abc123"        # C2 = Entity/Operation
c_2_parent_session_id: "..."    # C2 = entity parent
c_2_uuid: "..."                 # C2 = entity identity
c_3_ctx_frame: "0/1/2"         # C3 = Process/Canvas (C3' = CF)
c_3_day_id: "10-03-2026"        # C3 = processual temporal anchor
c_3_created_at: "..."           # C3 = process timestamp
c_3_updated_at: "..."           # C3 = process timestamp
c_4_artifact_role: "task-spec"  # C4 = Type/Context
c_4_invocation_kind: "vak_auto" # C4 = type of invocation
c_4_invocation_profile: "..."   # C4 = invocation context
c_5_reflection_complete: true   # C5 = Pratibimba (integration done)
c_5_aletheia_verifies: true     # C5 = Aletheia integration flag

# Non-C survivors — genuinely domain-specific only:
t_0_thought_type: "T3"          # T-bucket position IS a T-domain fact
m_4_nara_domain: "journal"      # M4 subsystem hook, genuine M4 concern

# FORBIDDEN — the validator will ERROR, not warn:
artifact_role: "..."            # plain English = non-conforming
ctx_type: "..."                 # ditto
session_id: "..."               # must be c_2_session_id
day_id: "..."                   # must be c_3_day_id
created_at: "..."               # must be c_3_created_at
reflection_complete: true       # must be c_5_reflection_complete
```

**Ambiguity is a signal, not a problem.** When a key could sit at C0 (ground/source) or C3 (process), notice the tension — it reflects real ontological ambiguity. Choose the reading that best serves the artifact's function. C3 for temporal stamps (process markers); C0 for sourcing/origin references.

The enforcement layer lives in `.pi/extensions/ta-onta/hen/S1'/frontmatter_schema.ts`. Unknown keys → ERROR (not warning). `SPECIAL_KEYS` contains only `coordinate`.

### Wikilink Law — Non-Negotiable Output Invariant

Every agent-produced artifact MUST use `[[wikilink]]` syntax for all entity references. This is not optional formatting — it is what makes the vault a traversable graph.

**Liberal use**: session IDs, day paths, coordinate names, tool names, concept names, proper nouns, anything cross-referenced:
```markdown
Session [[NOW-abc123]] opened in [[2026/03/W11/10]].
This relates to [[M4-3]] and the [[Nara]] domain.
Invoke [[vak_evaluate]] before dispatching to [[Psyche]].
```

**Structural breadcrumbs** (hardwired into templates):
- `now.md` header: `[[NOW-{session}]] | [[{day_path}]] | [[FLOW]]`
- Khora writes `[[NOW-{session}]]` into daily-note `## Sessions` on every `session_start`
- Every CT2+ artifact must have at least one `[[]]` backlink to its session or day

**Wikilink law is stated in every agent's `## Sattva`** section — framed per agent's character, but always present.

### Three-Layer Extension Model

```
TypeScript extension.ts  →  pi.registerTool()   (raw tools, always available)
SKILL.md files           →  workflow gates       (portable, shape tool invocation)
agent ANIMA.md files     →  PI-native subagents  (system prompt + tool access)
```

### Extension Map

| Extension | Class | Role |
|---|---|---|
| `khora` | S0 | Session identity, bootstrap, vault write primitive, wikilink breadcrumbs |
| `hen` | S1 | Vault content authority, frontmatter enforcement, template invocation |
| `pleroma` | S2 | Primitive registry; Techne subagent owns gateway/mechanical skills |
| `chronos` | S3 | Temporal lifecycle, cron scheduling (calls Techne for gateway execution) |
| `anima` | S4 | Agent orchestration, VAK eval, CF dispatch, constitutional agents |
| `aletheia` | S5 | Knowledge crystallisation, Gnosis RAG, thought routing, Möbius pass |

**Techne** lives in Pleroma as its craft-level execution subagent. Techne owns: gateway lifecycle (`techne_gateway_start/stop/status`), session management (`techne_session_list/patch/delete`), operational introspection (`techne_logs_tail`, `techne_debug_status`), and mechanical skills (tmux, cmux, update, wizard). It will eventually hold skills for skill/extension/plugin/subagent development.

### Gateway Architecture

- **Port**: `18794` (production). No separate test port — tests run against the production gateway.
- **Protocol**: v3. Connect handshake negotiates `minProtocol: 3, maxProtocol: 3`.
- **Electron OmniPanel** connects to `ws://localhost:18794` — the 14-panel command centre for sessions, channels, cron, skills, config, logs, debug, nodes, devices.
- **Session source of truth**: gateway `SessionStore` tracks active sessions, channel bindings, and NOW vault paths. The vault is the persistent archive. Session objects carry `vault_now_path`.
- **Multi-session per day, multi-channel per session**: many NOW folders per day folder; each session can bind multiple channels.
- **Method naming** (Rust must match Electron): `sessions.list`, `config.load`/`config.save`, `skills.list`/`skills.toggle`/`skills.saveApiKey`, `cron.add/list/toggle/run/remove`.

### Aletheia Gate Architecture

Aletheia's 6 gates are SKILL.md files (not PI tool registrations) in `aletheia/S5'/skills/gates/`. They gate VAK operations across agent instances and ensure human final say on system learning:

| Gate | Purpose | Human-in-loop |
|------|---------|---------------|
| `aletheia-ql-gate` | Coordinate frame integrity | No |
| `aletheia-m-gate` | MEF/philosophical alignment | No |
| `aletheia-s-gate` | S/S′ tech stack coherence | No |
| `aletheia-m-prime-gate` | M′ Electron frontend alignment | No |
| `aletheia-rupa-gate` | CT3 archetypal coherence | No |
| `aletheia-collab-gate` | Human-in-loop collaboration | **YES — exits to user** |

Gate 6 (collab-gate) is the safety boundary: any system self-learning or architectural spawn decision requires human approval. Gate implementation is Phase 2+ — stubs can be empty files now.

### Kairos / Kerykeion

- **PASU.md** (`Pratibimba/Self/PASU.md`) is the user-identity bootstrap file. It carries: `c_0_birth_date`, `c_0_birth_location`, `c_0_natal_chart_path`.
- **CLI**: `epi vault pasu get/set birth-date|birth-location|natal-chart-path` (Task 1.5)
- **Kerykeion** (S4' package) reads PASU.md natal data → enriches `M4_Symbol_DNA_Profile.sun_degree_anchor`/`.moon_degree_anchor`. Full spec in **v3 Chronos PRD** — deferred.
- **Mercurius** (CF 0/1/2/3) carries the kairos signal from Kerykeion to agents. `t_4_kairos_context: "[[Kairos]]"` in T4 frontmatter marks kairos-enriched artifacts.
- **aletheia-workshop** = named tmux session (NOT mprocs — mprocs is deprecated, use cmux/tmux)

### Key Invariants

1. **All vault writes/moves route through `obsidian` CLI** — never `fs::rename` on vault content. Rust reads freely; mutations go through `obsidian move`, `obsidian create`, `obsidian property:set`.
2. **All agent dispatch routes through Anima** — no extension spawns agents directly.
3. **C-family is the ontological default for frontmatter** — `coordinate` is the only exempt key.
4. **`c_0_source_coordinates` is always `string[]`** — never a scalar.
5. **3072-dim embeddings only** — Gnosis and Bimba share one embedding space.
6. **Vault day-folder path**: `Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/` — W{WW} is mandatory.
7. **`c_5_reflection_complete: true`** required before `chronos_archive_day` succeeds.
8. **`[[wikilink]]` is mandatory** for all entity references in agent-produced artifacts.
9. **Gateway port `18794`** — single production port, no test-only gateway.
10. **Techne in Pleroma** — owns gateway lifecycle and mechanical skills; Chronos owns scheduling semantics.
11. **Aletheia vector retrieval goes via Moirai** — no direct `aletheia_vector_search` tool; Moirai's GraphRAG tooling handles all vector/graph/hybrid retrieval.
12. **mprocs is deprecated** — replaced by cmux. All workshop/spawn substrate uses tmux + cmux only.

---

## Build and Test

```bash
# Rust tests
make rust-test                                    # full suite
make rust-test RUST_TEST_ARGS="test_name"        # single test by name pattern

# TypeScript (PI extensions)
epi agent extensions sync --agent main
epi agent spawn --agent main
# then in session: /tool_name {...}

# C library
make test
```

---

## Writing Good Tests — This Is Non-Negotiable

**Tests come first. Always. Every task in the plan starts with a failing test.**

### What Makes a Good Test Here

**1. Test the contract, not the implementation**

The plan specifies exact contracts — path formats, frontmatter keys, tool behaviours. Your tests should verify the contract, not mirror the implementation.

```rust
// BAD — tests internal path construction details
assert!(path.to_str().unwrap().contains("W11"));

// GOOD — tests the full contract from the top
assert_eq!(
    archive_day_path(&vault, day),
    vault.join("Pratibimba/Self/Action/History/2026/03/W11/10")
);
```

**2. Test idempotency explicitly**

Every `*-init` command must be idempotent. Call it twice, assert success on both, assert the second call does not corrupt the first call's output.

```rust
let r1 = Command::new(epi).args(["vault", "flow-init", "--now", "2026-03-10"]).output().unwrap();
assert!(r1.status.success());
let content_before = fs::read_to_string(&flow_path).unwrap();

let r2 = Command::new(epi).args(["vault", "flow-init", "--now", "2026-03-10"]).output().unwrap();
assert!(r2.status.success());
assert_eq!(content_before, fs::read_to_string(&flow_path).unwrap(), "must not modify on second call");
```

**3. Test error paths with exact error messages**

```rust
let result = Command::new(epi)
    .args(["vault", "archive-day", "10-03-2026"])  // c_5_reflection_complete not set
    .output().unwrap();
assert!(!result.status.success());
let stderr = String::from_utf8_lossy(&result.stderr);
assert!(stderr.contains("c_5_reflection_complete not set"), "wrong error: {stderr}");
```

**4. Test coordinate-driven key format explicitly — and test the negative**

```rust
assert!(content.contains("c_4_artifact_role: \"flow\""),
    "must use coordinate-driven key, got:\n{content}");
assert!(!content.contains("\nartifact_role:"),
    "plain-English key leaked:\n{content}");
assert!(content.contains("c_3_day_id:"),
    "must use c_3_day_id not day_id:\n{content}");
assert!(content.contains("c_2_session_id:"),
    "must use c_2_session_id not session_id:\n{content}");
```

**5. Test wikilinks are present in template output**

```rust
assert!(content.contains("[[NOW-"), "now.md must contain [[NOW-{session}]] breadcrumb");
assert!(content.contains("[[FLOW]]"), "now.md must link to FLOW");
```

**6. Isolate test environments**

```rust
let tmp = std::env::temp_dir().join("epi-test-UNIQUE_SUFFIX");
let _ = fs::remove_dir_all(&tmp);   // clean before, not after (leave failed state for debugging)
fs::create_dir_all(&tmp).unwrap();
std::env::set_var("EPI_VAULT_ROOT", tmp.to_str().unwrap());
```

**7. One failing test before any implementation**

Write the test → run it → confirm it FAILS → implement → run again → confirm it PASSES → commit. Do not skip the "confirm it fails" step. A test that passes before the implementation exists is not testing what you think it's testing.

---

## Current State

Check the plan for unchecked `- [ ]` items. Work chunk by chunk:

- **Chunk 1 (Phase 0):** Rust bug fixes — W{WW} path, coordinate/bimbaCoordinate inversion, template key fix, parity.rs port 18794
- **Chunk 2 (Phase 1 — Khora):** Session lifecycle, bootstrap, claude-mem install, wikilink breadcrumb on session_start
- **Chunk 3 (Phase 2 — Hen):** Frontmatter schema enforcement (C-family law, unknown key = ERROR), template registration including NOW.md and FLOW.md
- **Chunk 4 (Phase 3 — Pleroma):** Primitive registry + Techne subagent with gateway lifecycle tools
- **Chunk 5 (Phase 4 — Chronos):** Temporal lifecycle — day-init, now-init, flow-init, archive-day, cron (delegates gateway execution to Techne)
- **Chunk 6 (Phase 5 — Anima):** VAK eval, CF dispatch, nous_disclose, constitutional agents
- **Chunk 7 (Phase 6 — Aletheia):** Gnosis RAG, thought routing, Möbius crystallisation, session promotion

---

## Before You Write Any Code

1. `git status` — understand what's already changed
2. Read the relevant task in the plan — every task has exact file paths and code to write
3. Read the CONTRACT.md for the module you're working on
4. Write the failing test first
5. Run it — confirm it fails
6. Implement minimally
7. Run again — confirm it passes
8. `git add` specific files (never `-A`)
9. `git commit` with the message from the plan

Never skip a step. Never commit without a passing test. Never write a test that passes before the implementation exists.
