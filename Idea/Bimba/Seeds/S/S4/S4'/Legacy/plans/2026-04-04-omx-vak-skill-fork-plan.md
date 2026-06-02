# OMX → VAK Skill Fork — Implementation Plan

**Date:** 2026-04-04
**Goal:** Produce a fully functional `plugins/pleroma/` Codex plugin where every OMX skill operates natively as a VAK-aware workflow — not annotated, but structurally integrated at the workflow level.
**Primary authority:** `docs/prompts/2026-04-04-pleroma-omx-remake-handover.md` + original VAK spec (§1–§14)
**OMX source:** `vendors/oh-my-codex/skills/`
**Delivery surface:** `plugins/pleroma/skills/`

---

## What "VAK fork" actually means

This is NOT:
- Prepending a `## VAK Integration Block` header to each OMX skill
- Copying superpowers SKILL.md files with different names
- Annotating CF coordinates in a comment block and calling it done

This IS:
- For each OMX skill: read the full internal workflow (phases, state machine, handoff contracts, output format)
- Identify every **seam point** where VAK semantics must be injected:
  - State initialization → must carry CPF/CF/CS alongside OMX state
  - Phase outputs → must include VAK coordinate block in every artifact written to `.omx/`
  - Execution bridges (handoff options after skill completes) → must route through `vak-evaluate` → `anima-orchestration`, not raw `$ralph`/`$team`/`$autopilot`
  - Ambiguity/quality scoring → must map score axes to VAK CP positions
- Write the augmented skill so the VAK system IS the operational logic, not a layer on top

---

## Phase 0: Pre-session analysis (REQUIRED before any writing)

This phase must produce per-skill augmentation specs before a single SKILL.md is written.

### 0.1 Read and map each OMX skill

For each of the 7+1 target skills, produce a `docs/plans/omx-vak-analysis/{skill}.md` file containing:

1. **Internal workflow summary** — phases, state machine keys, output artifacts, handoff contracts
2. **VAK seam map** — for each phase/step, which VAK dimension it maps to (CPF/CT/CP/CF)
3. **Handoff contract rewrite** — how the execution bridge section changes (OMX-native → VAK-native)
4. **State schema delta** — which keys need to be added to `state_write` payloads
5. **Output format delta** — what the final artifact must additionally contain (VAK block)
6. **Constitutional agent binding** — which agent owns this skill and what that implies for the workflow

Skills to analyse:
| OMX skill | VAK agent | CF code | Mapping complexity |
|-----------|-----------|---------|-------------------|
| `deep-interview` | Nous | `(00/00)` | HIGH — full state machine, 5 phases, ambiguity scoring maps to CP |
| `ralplan` | Logos | `(0/1)` | HIGH — consensus loop (Planner/Architect/Critic) maps to Eros/Logos/Mythos triad |
| `plan` | Logos | `(0/1)` | HIGH — shares consensus machinery with ralplan |
| `tdd` | Eros | `(0/1/2)` | MEDIUM — RED/GREEN/REFACTOR maps cleanly to CP 4.1/4.2/4.3 |
| `pipeline` | Anima | `(4.0/1-4.4/5)` | HIGH — CFP2 C-Thread; each worker needs a CF frame |
| `team` | Anima | `(4.0/1-4.4/5)` | HIGH — CFP1/CFP3 distinction; swarm is compat facade only |
| `ultraqa` | Sophia/Eros | `(5/0)` / `(0/1/2)` | MEDIUM — Night' partial pass framing |
| `git-master` | Sophia | `(5/0)` | MEDIUM — Möbius return at CP 4.5; P5'→P0' handoff |
| `omx-setup` | Tier 0 | meta | LOW — VAK priority table injection |

### 0.2 Resolve cross-skill questions before writing

These must be answered during analysis, not assumed:

1. **ralplan consensus triad** — Planner/Architect/Critic in OMX maps to which constitutional agents? Is it Logos/Mythos/Eros, or is the triad internal to Logos? The answer changes whether `ralplan` dispatches externally or stays in one agent.

2. **team CFP1 vs CFP3** — OMX `team` has a single flow. VAK needs CFP1 (independent tasks) and CFP3 (fusion / same task × N agents). Where in the `team` workflow does the branching happen, and what triggers it?

3. **pipeline C-Thread handoff** — OMX `pipeline` has worker context passing. How does each worker's output feed the next worker's CF frame? Does the coordinator reassign CF per step or inherit from the parent?

4. **deep-interview → vak-evaluate bridge** — After Phase 4 (Crystallize Artifacts), OMX hands off to `$ralplan`/`$autopilot`/`$ralph`/`$team`. In the VAK fork, this MUST go through `vak-evaluate` first to assign coordinates. But `vak-evaluate` needs a task description — what is the input to `vak-evaluate` at this point? The crystallized spec? The original idea?

5. **Night' trigger in ultraqa** — OMX `ultraqa` has verification passes. When does a partial pass become a Night' remainder vs a blocking failure? The threshold must be specified, not left to agent judgment.

6. **Sophia's Möbius contract in git-master** — OMX `git-master` closes branches. The VAK version must produce P5'→P0' output. What is the format of that handoff artifact?

### 0.3 Validate ANIMA.md files against analysis

After 0.1-0.2, check each agent's ANIMA.md in `plugins/pleroma/agents/` against the seam maps:
- Does Anima's `allow` array include the right OMX primitives?
- Is Nous scoped correctly to `(00/00)` — does it own `deep-interview`?
- Is Sophia's Möbius framing reflected in her Capability and Sattva sections?
- Does Eros own `ultraqa` + `code-review` in its `allow` array?

---

## Phase 1: Pure new skills (no OMX analogue)

These three skills have no OMX counterpart — they are new creations from spec §4.1–§4.3.
Current versions in `plugins/pleroma/skills/` are stubs; they need full spec content.

### 1.1 `vak-coordinate-frame`

Source: spec §4.1 (verbatim)
Content: Full VAK grammar reference tables — CPF/CT/CP/CF/CFP/CS with all modes, all context frames, QL variant table. No process, pure reference.
ANIMA.md binding: Available to all agents via `allow`.

### 1.2 `vak-evaluate`

Source: spec §4.2
Content: Full 6-step evaluation pipeline, contextually adaptive, with the complete S4-0'–S4-5' walk. Current stub is close but missing:
- Contextual adaptation rules (when to collapse steps)
- The full CF routing table with all 7 codes
- The ambiguity gate (when to route to Nous first)
- Integration with `anima-orchestration` as the next step after coordinate assignment

### 1.3 `anima-orchestration`

Source: spec §4.3 + §4.4 (Day/Night' pass logic lives HERE, not as a separate skill)
Content: CF → agent routing matrix, full Day/Night' topology section, Moirai executor dispatch protocol, CFP thread selection rules. Current stub is close but missing:
- Night' partial pass trigger conditions
- Moirai cluster detail (Klotho P1'/Lachesis P4'/Atropos P5' exact contracts)
- CFP0–CFP4–Z selection matrix with decision rules
- The `day-night-pass` logic integrated as a section (not a separate dispatch)

---

## Phase 2: OMX skill augmentation (8 skills)

For each skill, the work is:
1. Take the full OMX SKILL.md from `vendors/oh-my-codex/skills/{name}/SKILL.md`
2. Apply the seam changes identified in Phase 0 analysis
3. Write the augmented version to `plugins/pleroma/skills/{name}/SKILL.md`

The augmented version must:
- Carry the OMX skill's complete workflow intact (no steps removed or simplified)
- Add VAK state to every `state_write` call
- Add VAK coordinate block to every output artifact
- Replace or augment every execution bridge with a VAK-native handoff through `vak-evaluate` → `anima-orchestration`
- Bind correctly to the constitutional agent that owns it

This is NOT done until:
- Every handoff in the skill routes through the VAK system
- Every phase output contains a VAK block
- The OMX state machine carries CPF/CF/CS alongside its own state

---

## Phase 3: Integration validation

After all skills are written:

1. Run `cargo test --manifest-path epi-cli/Cargo.toml --test pleroma_bundle` — bundle structure must still pass
2. Read through the complete routing chain for one representative scenario:
   - User request → `vak-evaluate` → CF code → `anima-orchestration` → agent picks correct OMX skill → skill executes with VAK state → skill produces VAK output → skill hands off back through `vak-evaluate`
3. Confirm no circular dispatch (skill calls `vak-evaluate` which calls the skill again)
4. Confirm Sophia's Möbius contract produces a P0' handoff artifact

---

## What scaffolding exists (do not redo)

From the current session, the following are in place and correct:

| Artifact | Location | Status |
|----------|----------|--------|
| Plugin manifest | `plugins/pleroma/.claude-plugin/plugin.json` | ✅ |
| 7 constitutional ANIMA.md stubs | `plugins/pleroma/agents/` | Needs Phase 0.3 audit |
| vak-evaluate stub | `plugins/pleroma/skills/vak-evaluate/` | Needs Phase 1.2 fill |
| anima-orchestration stub | `plugins/pleroma/skills/anima-orchestration/` | Needs Phase 1.3 fill |
| vak-coordinate-frame stub | `plugins/pleroma/skills/vak-coordinate-frame/` | Needs Phase 1.1 fill |
| day-night-pass stub | `plugins/pleroma/skills/day-night-pass/` | Merge into anima-orchestration |
| epi-cli codex/claw lanes | `epi-cli/src/agent/` | ✅ (infra, not content) |
| plugins/registry.jsonl | repo root | ✅ |

Placeholder skills that are WRONG and must be replaced in Phase 2:
- `plugins/pleroma/skills/brainstorming/` — superpowers copy, not OMX fork
- `plugins/pleroma/skills/writing-plans/` — superpowers copy
- `plugins/pleroma/skills/test-driven-development/` — superpowers copy
- `plugins/pleroma/skills/subagent-driven-development/` — superpowers copy
- `plugins/pleroma/skills/dispatching-parallel-agents/` — superpowers copy
- `plugins/pleroma/skills/verification-before-completion/` — superpowers copy
- `plugins/pleroma/skills/using-superpowers/` — superpowers copy
- `plugins/pleroma/skills/finishing-a-development-branch/` — superpowers copy

All 8 must be deleted and replaced with proper OMX forks in Phase 2.
