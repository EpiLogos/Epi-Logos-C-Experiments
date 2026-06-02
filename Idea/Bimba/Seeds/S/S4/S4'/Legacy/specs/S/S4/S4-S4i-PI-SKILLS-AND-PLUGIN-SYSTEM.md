# S4/S4' — Pi Skills and Plugin System

**Status:** Active — runtime substrate is now OMX (Codex) + claw-rust; PI is compatibility layer
**Date:** 2026-03-07 (updated 2026-04-03)
**Coordinate:** S4 (agent runtime substrate), S4' (skills, plugins, subagents, ta-onta execution layer)
**Purpose:** Define a Claude-compatible skills and plugin system for the custom Pi agent stack in this repo, and establish the prerequisite foundation for Pleroma and the ta-onta module family now mapped to S4'.

> **Authority split (2026-04-03):** The upstream substrate is now **oh-my-codex (OMX)** for
> Codex-facing runtime and **claw-rust** for the long-term native harness.  PI remains as a
> compatibility substrate only.  `plugins/pleroma/` is the canonical authoring surface for
> ta-onta-governed Pleroma capabilities.  See
> `Idea/Bimba/Seeds/S/Legacy/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md` for the full authority split.

---

## Canonical Decision

The S4' layer must adopt **skills as the primary authoring unit** and **plugins as the primary distribution unit**.

This means:

- **Skills** are the canonical place for reusable instructions, workflows, conventions, and operator-facing task recipes.
- **Subagents** are the canonical place for specialized roles with their own prompt, model, tool policy, permissions, and preloaded skills.
- **Hooks** are the canonical place for lifecycle guardrails, verification, telemetry, and policy enforcement.
- **Plugins** are the canonical packaging boundary for shipping skills, subagents, hooks, MCP servers, LSP servers, and default agent settings together.
- **Native Pi TypeScript extensions and Rust agent code remain the deep substrate**, not the primary authoring surface.

The important architectural distinction is:

- `.pi/extensions/*.ts` and `epi-cli/src/agent/*.rs` provide **runtime mechanics**
- plugin bundles provide **agent-facing capability surfaces**

The old ta-onta “plugin” framing from the earlier S3'/old-repo planning must therefore be translated into:

- **generic runtime primitives** moved down into S4 substrate code
- **ta-onta semantic workflows** surfaced upward as S4' skills, subagents, hooks, and plugin bundles

Pleroma becomes the executive skill/plugin layer of S4', not an improvised prompt pack.

---

## External Grounding

The current official Claude model is already close to the architecture we need:

1. Claude Code treats **skills, subagents, hooks, MCP, and LSP** as first-class extension surfaces, and treats a **plugin** as the container that packages them together.
2. Claude Code now treats `skills/` as the preferred modern authoring surface; `commands/` still works, but is explicitly legacy.
3. Claude skills follow the **Agent Skills** open standard and use filesystem-based `SKILL.md` artifacts with YAML frontmatter.
4. Claude subagents are also filesystem artifacts with frontmatter-driven tool, model, permission, and skill preload settings.
5. Claude hooks now have a significantly richer lifecycle surface, including `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `Stop`, `SubagentStop`, `SessionStart`, `SessionEnd`, `ConfigChange`, `WorktreeCreate`, `TaskCompleted`, `TeammateIdle`, and `PreCompact`.
6. Claude’s plugin testing story is currently:
   - local in-place loading via `--plugin-dir`
   - manifest validation via `claude plugin validate`
   - debug inspection via `claude --debug`
   - component-by-component testing in live sessions
7. Anthropic’s official skill guidance is now explicitly **evaluation-first**, but the docs also say there is **not currently a built-in evaluation runner**, which means our S4 plan should make evaluation native instead of leaving it as convention only.

### Source Notes

The plan below is grounded in the current official docs as of **March 7, 2026**:

- Claude Code Skills: [docs.claude.com/en/docs/claude-code/slash-commands](https://docs.claude.com/en/docs/claude-code/slash-commands)
- Claude Code Subagents: [docs.claude.com/en/docs/claude-code/subagents](https://docs.claude.com/en/docs/claude-code/subagents)
- Claude Code Plugins: [docs.claude.com/en/docs/claude-code/plugins](https://docs.claude.com/en/docs/claude-code/plugins)
- Claude Code Plugins Reference: [docs.claude.com/en/docs/claude-code/plugins-reference](https://docs.claude.com/en/docs/claude-code/plugins-reference)
- Claude Code Hooks Reference: [docs.claude.com/en/docs/claude-code/hooks](https://docs.claude.com/en/docs/claude-code/hooks)
- Claude Agent SDK Skills: [docs.claude.com/en/api/agent-sdk/skills](https://docs.claude.com/en/api/agent-sdk/skills)
- Skill Authoring Best Practices: [docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)

Key official behaviors we should mirror:

- Skills are **filesystem artifacts**, not DB rows or purely programmatic registrations.
- Skill metadata is discovered at startup; full content loads when invoked.
- Subagents can **preload skills into context** and do **not** inherit parent skills automatically.
- Plugins namespace their packaged skills as `plugin-name:skill-name`.
- Installed plugins are **copied to a cache**, so plugin paths must be relative and self-contained.
- Hooks accept JSON input on stdin and can return structured JSON decisions.
- Agent hooks are an official concept: a hook can spawn a constrained agent to verify whether work is actually complete.

---

## What We Should Port Exactly vs Adapt

### Adopt Without Translation

- `SKILL.md` filesystem skill format
- skill frontmatter fields:
  - `name`
  - `description`
  - `argument-hint`
  - `disable-model-invocation`
  - `user-invocable`
  - `model`
  - `context: fork`
  - `agent`
  - `hooks`
- subagent markdown format and frontmatter fields:
  - `name`
  - `description`
  - `tools`
  - `disallowedTools`
  - `model`
  - `permissionMode`
  - `skills`
  - `hooks`
- plugin manifest location and basic schema: `.claude-plugin/plugin.json`
- plugin root component locations:
  - `skills/`
  - `agents/`
  - `hooks/hooks.json`
  - `.mcp.json`
  - `.lsp.json`
  - `settings.json`
- hook JSON I/O contract and event naming
- plugin namespacing model
- semantic versioning and cache invalidation by plugin version

### Adopt With Pi-Specific Adaptation

- `allowed-tools`:
  - keep the field name for Claude compatibility
  - map values onto Pi/Epi tool capability IDs through a registry layer
- `context: fork` plus `agent`:
  - preserve the authoring syntax
  - implement with Pi subagent spawn and our managed agent directory model
- plugin install scopes:
  - map Claude’s `user`, `project`, `local`, `managed` concepts onto repo-local managed agent homes plus repo-local plugin activation
- plugin cache:
  - preserve the “installed plugins are copied to cache” behavior
  - implement it under `.epi/agents/<agent>/plugins/cache/` inside the active repo runtime
- dynamic context injection (`!command` patterns):
  - support it only through explicit safe-command rules, not arbitrary shell execution by default
- hook `type: "agent"`:
  - implement via a constrained Pi verification subagent
  - hard-cap turns and tools

### Defer Intentionally

- LSP plugin support in the first tranche unless a specific S4 flow needs it
- marketplace publishing and remote distribution before local/plugin-dir parity exists
- enterprise/managed org policy beyond what is needed for repo-local and user-local development
- blind parity with every Claude UI affordance; we need behavioral parity in the runtime contracts, not pixel parity

### Reject

- Treating `.pi/extensions/*.ts` as the only extension model
- Storing skills only in JSON or Rust structs
- Keeping ta-onta capability primarily as giant prompts instead of typed skills/plugins/subagents
- Leaving evaluation as “manual testing later”

---

## S4/S4' Layer Split

### S4 Substrate

This is the deep runtime and compatibility layer.

Primary responsibilities:

- managed Pi agent directories
- plugin discovery and sync
- skill registry and precedence resolution
- subagent registry and launcher
- hook runner and decision handling
- tool-capability registry
- plugin cache and version management
- MCP/LSP wiring
- CLI entrypoints for validation, testing, and evaluation

Likely Rust homes:

```text
epi-cli/src/agent/
  mod.rs
  agent_dirs.rs
  plugins.rs
  plugin_manifest.rs
  plugin_cache.rs
  skills.rs
  subagents.rs
  hooks.rs
  capabilities.rs
  evals.rs
  validator.rs
  spawn.rs
  doctor.rs
```

### S4' Authoring and Distribution Layer

This is the filesystem content Claude-like agents actually consume.

Canonical repo layout:

```text
.pi/
  extensions/              # native runtime extensions and bridge code
  prompts/
  agents/                  # existing Pi topology files if still needed

plugins/
  epi-core/
    .claude-plugin/
      plugin.json
    skills/
    agents/
    hooks/
    .mcp.json
    settings.json
    scripts/
  pleroma/
    .claude-plugin/
      plugin.json
    skills/
    agents/
    hooks/
    scripts/
  ta-onta-khora/
  ta-onta-chronos/
  ta-onta-hen/
  ta-onta-anima/
  ta-onta-aletheia/
```

This is the cleanest way to be compatible with official Claude plugin expectations while still keeping Pi-native runtime code in `.pi/`.

---

## Core Architectural Rule

**Every reusable capability must be assigned to the lowest correct layer.**

Use this test:

- If it is **runtime mechanics**, it belongs in Rust or `.pi/extensions/`
- If it is **reusable tool orchestration or agent workflow instructions**, it belongs in a skill
- If it is **a specialized autonomous role**, it belongs in a subagent
- If it is **a lifecycle or policy rule**, it belongs in a hook
- If it is **an externally callable tool bridge**, it belongs in MCP or a native extension
- If it is **a deployable/shareable bundle**, it belongs in a plugin

This is what prevents Pleroma and ta-onta from collapsing back into one monolithic prompt system.

---

## Plugin and Skill Precedence Model

S4 should follow a Claude-like precedence model, but with repo-local Epi-managed paths:

### Discovery Sources

1. Session-defined temporary agents/plugins
2. Explicit CLI `--plugin-dir` paths for the current launch
3. Repo-local `plugins/`
4. Repo-local plain skill roots such as `skills/` and ta-onta skill trees under `.pi/extensions/.../skills`
5. Repo-local managed compatibility projections under `.epi/agents/<id>/agent/compat/...`

Ambient user-home trees such as `~/.agents`, user-global `CODEX_HOME`, and `~/.claude` must not be read directly by the interactive runtime. If compatibility import is needed, it should be copied or projected into the repo-local managed runtime first.

### Conflict Rules

- Plugin skills are always namespaced and never shadow plain project skills.
- Project/user/global plain skills shadow same-name plain skills by precedence order.
- Subagents resolve by highest-priority matching name.
- Hook configs merge by scope, then by plugin, then by event.
- Explicit CLI `--plugin-dir` or `--plugin-path` overrides installed/cache state for that session.

### Why This Matters

This gives us:

- safe team-shared plugin bundles
- local experimentation without installation
- direct compatibility import for official Claude assets
- predictable conflict behavior for monorepos and worktrees

---

## Skill Contract We Should Support

Each skill must be a real directory with `SKILL.md` as the entrypoint.

We should support:

- frontmatter parsing
- supporting files next to `SKILL.md`
- nested `scripts/`, `examples/`, and template files
- `$ARGUMENTS` substitution
- optional dynamic context materialization with safe command evaluation
- inline execution or forked subagent execution
- skill-local hooks

### Non-Negotiable Behavior

- skill metadata is indexed without loading all content into every prompt
- full skill content is only materialized when the skill is actually used
- skill usage is logged with provenance:
  - source scope
  - plugin name
  - version
  - invoking agent
  - arguments
  - tool grants

### Why

This mirrors the official Claude model and keeps token usage controlled. It also gives us the auditability required for Pleroma and ta-onta execution traces.

---

## Subagent Contract We Should Support

Each subagent must be a markdown file with YAML frontmatter plus a markdown system prompt body.

We should support:

- `tools`
- `disallowedTools`
- `model`
- `permissionMode`
- `skills`
- `hooks`

### Important Official Behavior to Preserve

- subagents preload skill content named in the `skills` field
- subagents do not inherit parent skills automatically
- subagents can have their own hooks
- stop hooks for subagents should map to `SubagentStop` behavior

### Pi Translation

Pi already has agent-team and agent-chain primitives in the current foundation direction. Those should become the execution substrate for:

- skill `context: fork`
- plugin-defined subagents
- Pleroma team dispatch
- ta-onta role ensembles

---

## Hook System We Need

The hook system is where S4 becomes production-grade instead of prompt-grade.

We should implement Claude-compatible event names and JSON input contracts for at least:

- `PreToolUse`
- `PostToolUse`
- `PostToolUseFailure`
- `PermissionRequest`
- `UserPromptSubmit`
- `Notification`
- `Stop`
- `SubagentStart`
- `SubagentStop`
- `SessionStart`
- `SessionEnd`
- `ConfigChange`
- `WorktreeCreate`
- `WorktreeRemove`
- `TaskCompleted`
- `TeammateIdle`
- `PreCompact`
- `InstructionsLoaded`

### Hook Action Types

- `command`
- `prompt`
- `agent`

### S4-Specific Requirement

We should not stop at parity. We should make agent-based verification hooks a first-class S4 primitive for:

- completion verification
- ta-onta law checking
- graph/vault integrity gates
- workspace cutover checks
- release gating

This is especially important because the official Anthropic docs now clearly support agent hooks, and because Pleroma needs an execution discipline surface that is not just “remember to be careful”.

---

## Plugin Runtime Model

### Local Development Mode

Mirror Claude’s `--plugin-dir` model:

```bash
epi agent spawn --agent main --plugin-dir plugins/pleroma
```

Behavior:

- load plugin in place
- do not copy to cache
- re-resolve manifest and component files on each session start
- print verbose plugin diagnostics in debug mode

### Installed Mode

Installed plugins should be copied to a managed cache under the selected repo-local agent home:

```text
.epi/agents/<agent-id>/
  plugins/
    cache/
      <plugin-name>@<version>/
```

Behavior:

- copy plugin contents to cache
- reject `../` traversal paths
- allow symlinked-in content during copy, matching Claude’s cache model
- use plugin version for cache invalidation

### Why We Need Both

- local dev mode is required for rapid authoring and real testing
- cache mode is required for safe reproducibility and versioned execution

---

## Proposed S4 Plugin Set

### 1. `epi-core`

Purpose:

- the canonical bridge plugin for `epi` CLI and core repo behaviors
- basic agent help, verify, inspect, graph, vault, and session skills
- default verification and safety hooks

Contains:

- core skills
- core subagents
- hook rules for completion and config changes
- MCP definitions if needed for richer tool bridging

This plugin is the author-facing counterpart to the existing `epi-citta` runtime bridge.

### 2. `pleroma`

Purpose:

- executive execution layer for workflows, delegation, chain/team orchestration, and reusable skill composition

Contains:

- orchestration skills
- dispatch subagents
- completion/verification hooks
- bounded execution wrappers over native Pleroma-capability primitives

Pleroma should be the first serious plugin after `epi-core`.

### 3. ta-onta module plugins

These should be distinct plugins, even if some eventually ship together.

#### `ta-onta-khora`

- session bootstrap
- workspace context assembly
- queue and context-scope skills

#### `ta-onta-chronos`

- day/NOW lifecycle
- archive/cutover hooks
- temporal routing skills

#### `ta-onta-hen`

- frontmatter normalization
- template/lens skills
- write-path validation hooks

#### `ta-onta-aletheia`

- gate invocation
- graph crystallization
- reflective verification agents and skills

#### `ta-onta-anima`

- VAK/compiler-style planning and orchestration skills
- subagents for reflective role execution

### Why Separate Them

Because generic runtime mechanics must remain reusable, while ta-onta semantics must remain modular and composable.

---

## Mapping Pleroma and ta-onta Responsibilities

| Module | Primary S4' Artifact | Deep Substrate Dependency |
|---|---|---|
| `epi-citta` | native `.pi` runtime extension | `epi` CLI command bridge |
| `epi-core` | plugin | base skills, hooks, subagents |
| `pleroma` | plugin | team/chain/cross-agent runtime primitives |
| `khora` | plugin + skills | session/workspace APIs |
| `chronos` | plugin + hooks | pathing/archive/cutover APIs |
| `hen` | plugin + hooks | frontmatter and normalization APIs |
| `aletheia` | plugin + subagents | graph/gate verification APIs |
| `anima` | plugin + subagents | orchestration/compiler APIs |

The recurring design rule is:

- **substrate code provides APIs**
- **plugins provide agent-usable behaviors**

---

## Testing and Evaluation Model

This is the most important section.

Anthropic’s official guidance now clearly pushes toward **evaluation-first skill development**, but also states that users currently need to build their own evaluation runner. We should therefore make evaluation a first-class S4 feature, not a documentation footnote.

### Required Test Surfaces

#### 1. Static Validation

Commands:

- `epi agent plugin validate <path>`
- `epi agent skill validate <path>`
- `epi agent subagent validate <path>`
- `epi agent hooks validate <path>`

Checks:

- manifest schema
- directory layout
- path restrictions
- frontmatter schema
- duplicate names
- invalid tool capability references
- invalid hook event names
- unresolved supporting-file references

#### 2. Local Runtime Smoke Tests

Commands:

- `epi agent plugin dev --plugin-dir <path>`
- `epi agent plugin smoke <path>`

Checks:

- skill discovery works
- plugin namespacing works
- subagents load
- hooks fire
- MCP starts if configured

These should use real temp directories and real scripts, not mocked registries.

#### 3. Hook Contract Tests

Use real spawned scripts and JSON on stdin to verify:

- event payload shape
- block/allow decisions
- `continue: false` behavior
- `ConfigChange` and `WorktreeCreate` blocking semantics
- `SubagentStop` completion gates

#### 4. Skill Evaluation Runs

New command surface:

```bash
epi agent skills eval --suite suites/pleroma-core.yaml
```

Each suite should contain:

- a real prompt
- enabled plugins/skills
- expected skill selection or non-selection
- expected tool ceiling
- expected output criteria
- optional model matrix

Outputs:

- per-case transcript
- selected skill(s)
- selected subagent(s)
- hooks fired
- pass/fail rubric
- artifact paths

#### 5. End-to-End Domain Acceptance

For Pleroma and ta-onta, we need real end-to-end acceptance suites such as:

- “use Pleroma to dispatch a verification workflow”
- “use Khora to bootstrap session context and hand off to Anima”
- “use Hen skill plus hook policy to normalize frontmatter before write”
- “use Aletheia verification agent hook to block incomplete graph crystallization”

These are the real proof that S4' works.

### Testing Rules

- no fake “selection-only” tests that never run the real loader
- no purely mocked hook execution
- no plugin tests that bypass cache/path logic
- use temporary filesystems, real manifests, real scripts, real hook stdin/stdout exchange
- gate live provider/model tests behind explicit env flags, but make local non-network integration real

---

## CLI Surface We Should Add

```text
epi agent plugins list
epi agent plugin validate <path>
epi agent plugin smoke <path>
epi agent plugin install <path|marketplace-ref>
epi agent plugin enable <name>
epi agent plugin disable <name>
epi agent plugin sync --agent <id>

epi agent skills list
epi agent skill validate <path>
epi agent skills eval --suite <file>

epi agent subagents list
epi agent subagent validate <path>

epi agent hooks test --event <name> --fixture <file>
epi agent hooks trace --last
```

This should sit beside the current install/doctor/extensions/spawn work, not replace it.

---

## Phased Implementation Plan

### Phase 1: Registry and Validation Foundation

Build in Rust:

- plugin manifest parser
- plugin directory discovery
- skill parser
- subagent parser
- hook config parser
- capability registry
- validation CLI

Deliverable:

- `epi agent plugin validate`
- `epi agent skill validate`
- `epi agent subagent validate`

### Phase 2: Local Plugin Runtime

Build:

- `--plugin-dir` style local loading
- plugin namespacing
- skill lookup and invocation
- subagent preload
- hook registration/dispatch

Deliverable:

- local plugin smoke tests with real fixtures

### Phase 3: Installed Plugin Cache

Build:

- managed plugin cache
- semantic-version cache invalidation
- safe copy rules
- symlink-aware copy behavior

Deliverable:

- reproducible installed-plugin execution

### Phase 4: Evaluation Harness

Build:

- evaluation suite schema
- transcript capture
- structured pass/fail rubric
- model matrix support
- hook/skill/subagent provenance output

Deliverable:

- `epi agent skills eval`

### Phase 5: Core Plugin Port

Build:

- `epi-core` plugin
- basic core skills
- verification subagents
- completion hooks

Deliverable:

- usable core S4' extension set

### Phase 6: Pleroma Port

Build:

- orchestration skills
- team/chain dispatch subagents
- Pleroma hook discipline
- capability wrappers over runtime primitives

Deliverable:

- first serious executive plugin for S4'

### Phase 7: ta-onta Module Ports

Port in this rough order:

1. Khora
2. Hen
3. Chronos
4. Aletheia
5. Anima

Reason:

- Khora/Hen/Chronos establish state discipline
- Aletheia and Anima should sit on the stabilized substrate instead of forcing it into shape prematurely

---

## File and Directory Recommendation

The repo should move toward this structure:

```text
epi-cli/src/agent/
  plugins.rs
  plugin_manifest.rs
  plugin_cache.rs
  skills.rs
  subagents.rs
  hooks.rs
  capabilities.rs
  evals.rs
  validator.rs

.pi/
  extensions/
  prompts/
  agents/

plugins/
  epi-core/
  pleroma/
  ta-onta-khora/
  ta-onta-chronos/
  ta-onta-hen/
  ta-onta-aletheia/
  ta-onta-anima/

epi-cli/tests/
  agent_plugins.rs
  agent_skills.rs
  agent_subagents.rs
  agent_hooks.rs
  agent_plugin_cache.rs
  agent_skill_evals.rs
  fixtures/
    plugins/
    skills/
    hooks/
    evals/
```

### Migration Note

The earlier root-level `skills/`, `commands/`, and `hooks/` direction should be treated as an intermediate scaffold, not the final architecture. The final architecture should prefer **plugin-root packaging**, because that is the official Claude-compatible model and the right deployment boundary for S4'.

---

## Immediate Next-Step Recommendation

The next implementation tranche should **not** start by porting ta-onta content directly.

It should start by building the substrate required for ta-onta to land cleanly:

1. plugin manifest + layout parser
2. skill/subagent/hook registries
3. validator commands
4. local `--plugin-dir` equivalent
5. evaluation harness
6. `epi-core` plugin
7. `pleroma` plugin

Only after that should the domain plugins land.

This is the correct prerequisite sequence for both:

- Pleroma development
- ta-onta module development now remapped into S4'

---

## Bottom Line

The right S4' move is not “add a few skills to Pi.”

The right move is to make S4' a **Claude-compatible agent extension runtime** with:

- filesystem-native skills
- plugin-root packaging
- subagent-first specialization
- hook-based verification and guardrails
- managed plugin cache and local dev mode
- built-in evaluation harness

That gives us a durable base for Pleroma, keeps ta-onta modular, and brings the Pi layer up to the current official agent-skills/plugin paradigm instead of freezing it at an older extension model.
