# Superpowers and Pleroma Source Inventory

**Date:** 2026-03-08 (updated 2026-04-03)
**Purpose:** File-by-file analysis of the upstream and local source surfaces that actually define Pleroma behavior, prompt strategy, and parity-relevant substrate functions.

> **Superseded upstream (2026-04-03):** The `vendor/obra-superpowers-v4.x` base referenced below
> has been replaced by `vendors/oh-my-codex/` (OMX) as the Codex runtime substrate.  Semantic
> authority remains with the ta-onta specs.  All new capability authoring targets `plugins/pleroma/`.
> PI (`vendor/obra-superpowers-*`) lineage is no longer the long-term base.  See the authority
> matrix at `docs/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md`.

## Reading Rule

This inventory is subordinate to the canonical brief. It explains how concrete files behave. It does not get to redefine telos.

## Inventory Table

| File | Role | What It Does | Specific Prompting Approach | Pleroma-level parity function | Classification |
|---|---|---|---|---|---|
| `vendor/obra-superpowers-v4.2.0/README.md` | upstream runtime philosophy | Defines Superpowers as a workflow system: brainstorm, plan, execute, TDD, review, finish | Minimal prose that frames prompt behavior as mandatory workflow activation rather than ad hoc commands | Establishes the ported workflow body and proves that prompting discipline itself is part of the upstream artifact | `true-port evidence` |
| `vendor/obra-superpowers-v4.2.0/lib/skills-core.js` | upstream skill loader/helper | Resolves skill directories, shadowing, frontmatter extraction, update checks, and frontmatter stripping | No authored prompts; it is metadata-driven prompt dispatch via `name` and `description` in `SKILL.md` | Shows that skills are discovered by filesystem/frontmatter, which maps cleanly to a plugin bundle registry | `port-and-refine` |
| `vendor/obra-superpowers-v4.2.0/commands/brainstorm.md` | upstream command trampoline | Delegates immediately to `superpowers:brainstorming` | Prompt is a one-line trampoline, not substantive content | Supports plugin aliases that dispatch into canonical skills rather than duplicating text | `port-as-command-pattern` |
| `vendor/obra-superpowers-v4.2.0/commands/write-plan.md` | upstream command trampoline | Delegates immediately to `superpowers:writing-plans` | One-line trampoline | Same command-to-skill alias pattern for plugin command surfaces | `port-as-command-pattern` |
| `vendor/obra-superpowers-v4.2.0/commands/execute-plan.md` | upstream command trampoline | Delegates immediately to `superpowers:executing-plans` | One-line trampoline | Same command-to-skill alias pattern for execution routing | `port-as-command-pattern` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/README.md` | local upstream extension summary | Declares Pleroma as Moirai orchestration plugin, names tools, and states runtime contract at a high level | Short declarative tool descriptions, almost no behavioral coaching | Evidence for which surfaces already existed in local Pleroma and which are still thin summaries | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/CONTRACT.md` | local upstream contract | Defines boundaries: no parallel runtime, subagents not skills, transcript ownership, prime handling, relation law, GitButler lane | Contract prose, not coaching prompts; behavior is specified as rules and exclusions | Direct source for boundary parity: no `SkillRegistry`, no transcript duplication, no sovereign Technē | `true-port evidence` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/index.ts` | local upstream runtime | Registers tools/services/gateway methods, loads config, exposes coordination and validation tools | Tool descriptions are concise imperative prompts for runtime affordances | Proves current Pleroma shape is tool/service registration over substrate functions, not a self-contained alternate runtime | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/src/moirai.ts` | local upstream policy core | Encodes Klotho/Lachesis/Atropos modes, tools, lens, and spawn-plan assembly | No freeform prompt; policy is data-driven | Canonical parity for Moirai role distinctions and relation defaults | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/src/policy.ts` | local upstream policy artifact builder | Generates assignation artifacts mapping skills to constitutional owners and fallback agents | No freeform prompt; emits structured policy objects | Important parity function for constitutional skill ownership and install-time policy generation | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/src/coordination.ts` | local upstream coordination helper | Builds Redis namespaces, worktree paths, GitButler branch refs, child records, orphan logic, cleanup plans | No natural-language prompting; coordination is deterministic and structured | Core parity function for worktree isolation, branch naming, orphan detection, and child metadata | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/src/spawn.ts` | local upstream lifecycle executor | Actually spawns Moirai, persists Redis state, registers graph links, runs VCS/worktree actions, handles completion/orphaning | No prompt text; runtime executes policy decisions | Confirms spawn/heartbeat/cleanup is substrate-coupled operational logic, not skill prose | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/vak-evaluate/SKILL.md` | local upstream orchestration skill | Assigns CPF, CT, CP, CF, CFP, CS for incoming work | Contextually adaptive six-step evaluation; silent inference when clear, explicit walk-through when ambiguous, handoff to `brainstorming` if CPF is user-engaged | Direct parity for S4-0' through S4-5' evaluation grammar | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/vak-coordinate-frame/SKILL.md` | local upstream reference skill | Provides the full VAK coordinate grammar and tables | Lookup/reference prompt, not procedural prompting | Canonical reference surface for every downstream routing/eval skill | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/anima-orchestration/SKILL.md` | local upstream orchestration skill | Maps CF and CFP to constitutional dispatch, Moirai routing, and Möbius closure | Matrix-style routing prompt: read coordinates, choose method, dispatch | Direct parity for constitutional routing and thread topology execution | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/day-night-pass/SKILL.md` | local upstream orchestration skill | Enacts Day synthesis, Night' analysis, and Möbius return sequencing | Traversal prompt organized by Day positions and Night' questions | Direct parity for closure law, Night' semantics, and sequence topology | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/skills/tmux/SKILL.md` | installed atomic skill | Provides tmux socket/session/pane cookbook and agent-control patterns | Command cookbook with naming, safety, and monitoring conventions | Maps to bounded terminal primitive surface under `.pi`/Rust substrate | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/skills/repl/SKILL.md` | installed atomic skill | Exposes Darshana as scout/read/threads for large documents | Very tight three-mode prompt: scout map, read lens, threads weave | Strong candidate for a true port as an atomic evidence-acquisition skill | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/skills/notebooklm/SKILL.md` | installed atomic skill | Thin wrapper over `run.sh` for notebook listing, querying, and source management | Command routing prompt; almost no narrative scaffolding | Useful ported atomic skill, but packaging must be updated for plugin runtime discovery | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/skills/ouroboros/SKILL.md` | installed workflow/orchestration skill | Defines consensual self-surgery protocol across PRD, design, execution, verification, and merge loops | Phase-based collaboration script with explicit role switching between patient/co-architect and surgeon | Strong parity source for CPF user-engaged workflow and Ralph-loop semantics | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/pleroma-skill-proxy/SKILL.md` | local upstream atomic skill | Configures external agents as constitutional progeny using canonical skills, CF identity, and OneContext | Provider-fork prompt: same constitutional contract, different config branch per CLI | Core parity function for constitutional progeny; proves external agents are inherited surfaces, not subcontractors | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/technē-spawn/SKILL.md` | local upstream atomic skill | Runs the external-agent spawn protocol through skill-proxy, OneContext, budget check, and workshop launch | Ordered protocol prompt with explicit spawn sequence and error states | Core parity function for Technē as helper substrate, not sovereign agency | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/technē-relay/SKILL.md` | local upstream atomic skill | Retrieves agent results from workshop windows using stdout/file/auto capture | Retrieval protocol prompt with timeout/status branches | Core parity function for bounded workshop result harvesting | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/technē-list/SKILL.md` | local upstream atomic skill | Enumerates workshop windows, statuses, elapsed time, and budget | Monitoring/reporting prompt with format/filter branches | Core parity function for workshop state observability and budget enforcement | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/extensions/pleroma/skills/technē-close/SKILL.md` | local upstream atomic skill | Gracefully closes workshop windows, commits OneContext milestones, captures final output | Shutdown protocol prompt with graceful and force branches | Core parity function for closure/summary handoff into Night' extraction | `true-port` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pleroma-pi-primitives.ts` | quaternal-logic substrate spec | Defines bounded primitive registry and per-agent primitive policies | No prose prompts; capability registry and policy tables only | Primary parity function for what must live in substrate rather than in skill prose | `true-port evidence` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pleroma-pi-extension.ts` | quaternal-logic substrate implementation | Implements preview/run wrappers for tmux, mprocs, kbase, ralph, GitButler, and progeny config | Preview-first imperative execution surface; prompt-like output is machine-readable JSON/text | Primary parity function for bounded primitive execution and observability | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/parity-models.ts` | quaternal-logic schema layer | Defines foundational/reflection family envelopes, orchestration payloads, observability envelopes, and manifest snapshots | No natural-language prompts; schema is the prompt contract between layers | Primary parity function for reflection-family runtime payloads and constitutional routing metadata | `true-port evidence` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-native-subagent-adapter.ts` | quaternal-logic adapter | Preserves the PI-native subagent lane while carrying observability and child-extension provenance | No freeform prompt; adapter builds explicit execution and lineage records | Important parity function proving Pleroma should ride the native PI lane, not bypass it | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/pi-launcher.ts` | quaternal-logic launcher | Builds launch specs for subagent/team/chain execution and injects child Pleroma extensions | Prompt composition is explicit initial-message assembly plus appended system prompts | Core parity function for plugin-child propagation and command-line realization | `port-and-refine` |
| `/Users/admin/Documents/Epi-Logos/Idea/epi-claw/src/agents/quaternal-logic/workflow-orchestration.ts` | quaternal-logic workflow router | Parses workflow prompt frontmatter and builds orchestration envelopes from route metadata | Frontmatter-driven prompting: the workflow file itself is a structured prompt surface | Important parity function for any future Pleroma workflow prompt files and constitutional routing envelopes | `port-and-refine` |

## Prompting Approach Synthesis

The phrase "specific prompting approach" matters here because these files are not just capability labels; they encode how the agent is meant to think, route, and speak.

Three prompt styles recur across the upstream material:

1. **Command trampoline prompts**
   - Example: Superpowers `commands/*.md`
   - Function: dispatch to the real skill immediately
   - Port implication: plugin command aliases should stay thin

2. **Protocol prompts**
   - Examples: `technē-spawn`, `technē-relay`, `technē-close`, `ouroboros`
   - Function: narrate a multi-step executable protocol with clear statuses and failure branches
   - Port implication: good fit for orchestration or atomic skill files in `plugins/pleroma/skills/`

3. **Reference/routing prompts**
   - Examples: `vak-coordinate-frame`, `vak-evaluate`, `anima-orchestration`, `day-night-pass`
   - Function: map conceptual coordinates to operational decisions
   - Port implication: these are the executive heart of Pleroma and should not be demoted to substrate code comments

## Parity Function Synthesis

The main parity functions that must survive the port are:

- `skill discovery by filesystem/frontmatter`, evidenced by `vendor/obra-superpowers-v4.2.0/lib/skills-core.js`
- `constitutional coordinate evaluation`, evidenced by `extensions/pleroma/skills/vak-evaluate/SKILL.md`
- `constitutional routing and thread topology`, evidenced by `extensions/pleroma/skills/anima-orchestration/SKILL.md`
- `Day/Night' closure law`, evidenced by `extensions/pleroma/skills/day-night-pass/SKILL.md`
- `constitutional progeny provider configuration`, evidenced by `extensions/pleroma/skills/pleroma-skill-proxy/SKILL.md`
- `Technē workshop lifecycle`, evidenced by `extensions/pleroma/skills/technē-*.md`
- `bounded primitive registry`, evidenced by `src/agents/quaternal-logic/pleroma-pi-primitives.ts`
- `reflection-family runtime schemas`, evidenced by `src/agents/quaternal-logic/parity-models.ts`
- `native PI launch lane preservation`, evidenced by `src/agents/quaternal-logic/pi-native-subagent-adapter.ts`

## Initial Rejections and Cautions

- `vendor/obra-superpowers-v4.2.0/commands/*.md` are not substantive capability bodies; they are dispatch trampolines and should not be mistaken for the underlying ported behavior.
- Current local Pleroma tool registration is useful evidence, but it is still OpenClaw-shaped and not yet the final `plugins/pleroma/` bundle architecture required here.
- `Klein-mode`, `cmux`, `worktrunk`, `chatlog-fetcher`, and `youtube-transcript` remain target-body items without a directly confirmed installed upstream Pleroma artifact in the files analyzed above. They must stay explicitly non-port-labeled unless stronger provenance appears.
