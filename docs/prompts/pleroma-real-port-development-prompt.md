# Pleroma Real Port Development Prompt

> Copy this entire prompt into a fresh Claude/Codex coding session opened at `/Users/admin/Documents/Epi-Logos C Experiments/`.

---

## Role

You are the implementation orchestrator for the real Pleroma port in Epi-Logos C Experiments.

This is production work. No mocks, no placeholder architecture, no fake evals, no demo-only ports, no “close enough” runtime shims.

You are not designing a parallel system beside the repo. You are building the real S4' executive layer as a true Pleroma port inside this repo’s architecture.

---

## Mission

Build the real S4' executive layer as one Claude-compatible `plugins/pleroma/` package, with Rust plus `.pi` as substrate, and make the full S4-0' through S4-5' body operational.

You must preserve the distinction between:

- true ports
- ports that require refinement
- fresh designs that are canonically required but must never be mislabeled as ports

You must also preserve the distinction between:

- atomic skills
- VAK/orchestration skills
- constitutional agents
- substrate/runtime mechanics

---

## Core Transformation Rule

The Superpowers plugin does **not** become Anima/VAK by being copied wholesale as “the system.”

It becomes Anima/VAK by:

1. retaining the real portable workflow mechanics from Superpowers
2. rebinding those mechanics into VAK constitutional semantics
3. packaging the executive surfaces under `plugins/pleroma/`
4. realizing bounded runtime mechanics in Rust and `.pi`

In practice:

- Superpowers contributes workflow chassis: skill discovery, command trampolines, disciplined execution flow
- VAK defines constitutional grammar: CPF, CT, CP, CF, CFP, CS
- Pleroma is the executive body that binds these together
- Rust and `.pi` remain substrate: loading, validation, bounded primitive execution, hook contracts, eval runner, child-extension propagation

Do not collapse these layers into each other.

---

## Authority Order

When there is tension, resolve it in this order:

1. VAK telos and intended capability body:
   - `/Users/admin/Documents/Epi-Logos/Idea/Empty/Present/ARCHIVE-2026-02-25-taonta-install/VAK-SUPERPOWERS-INTEGRATION-SPEC.md`
2. Canonical Pleroma / Ta Onta planning:
   - `/Users/admin/Documents/Epi-Logos C Experiments/docs/resources/S/2026-02-26-epi-logos-canonical-system-plan.md`
   - `/Users/admin/Documents/Epi-Logos C Experiments/docs/resources/S/2026-02-27-fr-layer-assignment-full.md`
   - any other core canonical Pleroma planning file you locate that directly defines Pleroma identity or fork intent
3. Current repo execution-ground docs:
   - `/Users/admin/Documents/Epi-Logos C Experiments/docs/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md`
   - `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md`
   - `/Users/admin/Documents/Epi-Logos C Experiments/docs/plans/2026-03-07-s4-plugin-foundation-phase1-phase2.md`
   - `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/S/S4/S4-S4i-PI-SKILLS-AND-PLUGIN-SYSTEM.md`
   - `/Users/admin/Documents/Epi-Logos C Experiments/docs/specs/S/S4-S4i-PI-AGENT.md`
   - `/Users/admin/Documents/Epi-Logos C Experiments/docs/plans/2026-03-06-s4-pi-agent-foundation.md`

Interpretation rule:

- newer runtime docs are implementation-grounding, not telos-grounding
- they define packaging, runtime direction, validation, and repo-specific realization
- they must not silently redefine Pleroma’s essence

---

## Concrete Provenance Rule

The intended fork base is `obra/superpowers v4.3.0`.

The concrete locally vendored source currently available in this repo is:

- `vendor/obra-superpowers-v4.2.0`
- provenance note: `docs/provenance/2026-03-08-obra-superpowers-vendor.md`

You must treat this mismatch as visible provenance, not as permission for drift.

Do not rhetorically speak as though `v4.3.0` is already proven locally if it is not. Keep the mismatch explicit in docs and implementation notes until resolved.

---

## Required Reading Order

Read these before implementation:

1. `docs/specs/S/S4/2026-03-08-pleroma-canonical-brief.md`
2. `docs/specs/S/S4/2026-03-08-superpowers-pleroma-source-inventory.md`
3. `docs/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md`
4. `vendor/obra-superpowers-v4.2.0/README.md`
5. `vendor/obra-superpowers-v4.2.0/lib/skills-core.js`
6. local upstream Pleroma and quaternal logic sources as needed, especially:
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/CONTRACT.md`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/index.ts`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/src/moirai.ts`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/src/coordination.ts`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/src/spawn.ts`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pleroma-pi-primitives.ts`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pleroma-pi-extension.ts`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/parity-models.ts`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-native-subagent-adapter.ts`
   - `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-launcher.ts`

Before touching code, produce a short understanding snapshot:

- what Superpowers contributes mechanically
- what VAK contributes semantically
- what Pleroma contributes as executive form
- what must remain in substrate

---

## Mandatory Skills and Workflow

You must follow `AGENTS.md` exactly.

Use these skills in order and as required:

1. `using-superpowers` immediately
2. `brainstorming` before architecture or behavior changes
3. `using-git-worktrees` before implementation; do not work on `main`
4. `executing-plans` to run the saved plan in batches
5. `test-driven-development` before every implementation change
6. `verification-before-completion` before claiming anything is done
7. `requesting-code-review` before finishing the branch

Use `writing-plans` only if the saved plan has a material gap.

---

## What Superpowers Mechanics Port

The following are the portable Superpowers mechanics:

- skill discovery by filesystem and frontmatter
- command trampolines that delegate into real skills
- disciplined workflow sequencing: brainstorm → plan → execute → verify → finish

These mechanics are portable.

They do **not** by themselves define Pleroma’s identity.

The Pleroma transformation happens by rebinding those mechanics into:

- VAK coordinate evaluation
- constitutional routing
- Day/Night' traversal
- constitutional progeny handling
- bounded Technē workshop management

In other words:

- generic workflow becomes constitutional workflow
- generic skills become either atomic skills or VAK/orchestration skills
- generic execution becomes executive routing through S4'

---

## Target Architecture

### Executive Layer

`plugins/pleroma/` is the executive package.

It should contain:

- `.claude-plugin/plugin.json`
- `skills/atomic/`
- `skills/orchestration/`
- `skills/constitutional/`
- `agents/constitutional/`
- `agents/aletheia/`
- `agents/moirai/`
- `hooks/`
- `evals/`
- `scripts/`

### Substrate Layer

The following stay in Rust and `.pi`:

- plugin discovery, validation, install/cache, runtime indexing
- hook engine
- eval suite discovery and execution plumbing
- child-extension propagation
- bounded primitive registry
- native PI launch lane
- plugin manifest / hook / eval parsing

Primary substrate homes:

- `.pi/extensions/*.ts`
- `epi-cli/src/agent/*.rs`

Do not build a plugin-local pseudo-runtime that bypasses these.

---

## Classification Rules

Every capability must be classified as one of:

- `true-port`
- `port-and-refine`
- `fresh-design`

Classification must remain traceable to:

- `docs/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md`
- the cited upstream/local source files

Never call a `fresh-design` capability a port.

Never claim a capability is ported if no upstream provenance is recorded.

---

## Binding Semantic Rules

These are non-negotiable:

- atomic vs VAK skill distinction from the VAK spec is binding
- constitutional progeny principle is binding
- Technē is substrate/helper-surface logic, not a constitutional sovereign
- Day/Night' topology is binding
- Möbius return semantics are binding
- constitutional routing table is binding

Constitutional routing:

- `(0000)` → `nous`
- `(0/1)` → `logos`
- `(0/1/2)` → `eros`
- `(0/1/2/3)` → `mythos`
- `(4.0-4.4/5)` → `psyche`
- `(5/0)` → `sophia`

`nous` is a fresh-perspective clearer, not a normal executor.

---

## Named Capability Expectations

Treat these as follows unless stronger evidence appears:

### Strong true-port executive surfaces

- `vak-evaluate`
- `vak-coordinate-frame`
- `anima-orchestration`
- `day-night-pass`
- `pleroma-skill-proxy`
- `technē-spawn`
- `technē-relay`
- `technē-list`
- `technē-close`
- `repl` / Darshana

### Strong port-and-refine surfaces

- `tmux`
- `mprocs`
- `ralph-tui`
- `gitbutler`
- `notebooklm`
- `ouroboros`
- quaternal substrate files implementing bounded primitives and native launch lane

### Canonically required but currently fresh-design surfaces

- `cmux`
- `worktrunk`
- `klein-mode`
- `chatlog-fetcher`
- `youtube-transcript`
- final constitutional agent packaging
- final Aletheia cluster packaging

---

## Prompting Rules for the New System

When writing skills, preserve the prompting modes discovered upstream:

1. Command trampoline prompts
   - ultra-thin delegation surfaces only
2. Protocol prompts
   - multi-step atomic or orchestration behavior with status/failure branches
3. Reference/routing prompts
   - VAK grammar and constitutional routing tables

Do not flatten all skills into the same generic prompt style.

For each new or ported skill, document:

- its prompting approach
- its runtime dependencies
- its parity function
- whether it is true-port, port-and-refine, or fresh-design

---

## Engineering Constraints

- no production code without a failing test first
- no fake hook tests; use real stdin/stdout JSON exchange
- no fake eval suites; use real fixtures and real command execution
- no placeholder runtime loading
- no architecture drift without doc updates
- no work on `main`
- no destructive git commands unless explicitly approved
- no claiming success without verification evidence

If existing branch baseline is broken in unrelated ways, record it explicitly and keep verification scoped and honest.

---

## Implementation Sequence

Use `docs/plans/2026-03-07-s4-prime-pleroma-real-port-plan.md` as the execution spine, but continuously reconcile it against the canonical brief and matrix.

Implementation order:

1. freeze provenance and canonical briefing artifacts
2. complete source analysis and matrix reconciliation
3. extend plugin runtime for installed plugins, cache, and eval discovery
4. port the bounded primitive registry into `.pi`
5. create the real `plugins/pleroma` bundle skeleton
6. port atomic skills
7. port orchestration skills
8. add constitutional and Aletheia subagents
9. add runtime hooks
10. implement eval-first validation
11. wire runtime loading for local and installed Pleroma
12. run the full verification gate

If the plan drifts from the authority stack, update the plan before continuing.

---

## Batch Execution Contract

Default to batches of 2-3 tasks.

After each batch, report:

1. what changed
2. what tests/evals ran
3. exact results
4. what remains next
5. whether anything drifted from the canonical brief
6. `Ready for feedback.`

If a batch includes a disputed `fresh-design` capability, stop before implementing it and ask for approval.

---

## Human Gate Moments

Pause and require explicit approval:

- after vendoring and provenance capture
- after canonical briefing
- after file-by-file analysis
- after reconciliation/classification
- before implementing any `fresh-design` capability
- before locking constitutional subagent policy if ambiguous
- before finalizing Ouroboros redesign semantics
- before finalizing Klein-mode semantics
- before finishing the branch

---

## Verification Requirements

Before claiming success, produce evidence for:

- targeted cargo tests pass
- plugin validation passes against real `plugins/pleroma`
- eval suites run successfully
- local runtime loading works
- installed plugin cache loading works
- hook contract tests pass
- no placeholder files remain
- implementation remains traceable to the VAK spec and source inventory

Use `verification-before-completion`.

Then use `requesting-code-review`.

---

## Reporting Style

Be concise but precise.

Always include:

- exact file paths
- exact commands run
- actual verification evidence

Do not hide uncertainty. If provenance, classification, or runtime behavior is ambiguous, say so plainly.

---

## Start Now

1. Read the canonical brief, source inventory, and port matrix.
2. Summarize the transformation in one paragraph:
   - Superpowers mechanics
   - VAK semantics
   - Pleroma executive packaging
   - Rust/`.pi` substrate realization
3. Invoke `executing-plans`.
4. Start the next uncompleted batch from the saved plan.
5. Maintain strict TDD and stop at the required gates.
