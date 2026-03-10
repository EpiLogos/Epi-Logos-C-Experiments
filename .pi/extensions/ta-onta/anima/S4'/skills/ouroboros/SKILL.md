---
name: ouroboros
description: "Lemniscate incubation of an external coding agent. Spawns an isolated agent instance (via pleroma-skill-proxy) into a worktrunk worktree, establishing a surgeon-patient relation where the external agent operates on the parent agent's codebase. Ralph manages deterministic task looping."
port_type: port-and-refine
skill_class: vak
ct: CT2, CT3
cp: "4.3"
agent_affinity: psyche, anima
---

# Ouroboros -- Lemniscate Incubation of an External Coding Agent

Ouroboros is the #4 self-fold made operational. The parent agent incubates within itself an external coding agent that operates *on* the parent's own codebase. This is the Lemniscate topology: the inside loop (parent agent context) contains the outside loop (external agent working on it). Rather than modifying itself directly, the system delegates modification to a spawned instance with fresh context and bounded scope.

## Topology

The figure-eight structure of the Lemniscate (#4, cf):

```
        Parent Agent (Patient)
       /                       \
      /   context, constraints   \
     |                           |
     |     +-----------------+   |
     |     | External Agent  |   |
     |     | (Surgeon)       |   |
     |     | via worktrunk   |   |
     |     +-----------------+   |
      \                         /
       \   modifications flow  /
        \_____________________/
```

- **Inside loop**: The parent agent's full coordinate context, skill registry, and codebase state.
- **Outside loop**: The external agent (claude, aider, cursor, or other CLI tool) operating within an isolated worktree, making bounded modifications that flow back.
- **Crossing point**: The `pleroma-skill-proxy` bridge -- skills and context pass outward; commits and diffs pass inward.

## When to Invoke

- Development tasks requiring fresh agent context (token budget, clean state)
- Multi-file refactors where bounded scope prevents drift
- Self-modification that benefits from surgeon-patient separation
- Parallelized development across multiple worktrees
- Tasks where ralph deterministic looping provides structure

## Mechanism

### 1. Spawn External Agent

The parent agent spawns an external coding CLI tool using `pleroma-skill-proxy`:

```
techne-spawn --tool claude --worktree <branch-name> --proxy-skills [skill-list]
```

Supported tools: `claude` (Claude Code), `aider`, `cursor`, or any CLI that accepts file paths and instructions. The `pleroma-skill-proxy` exposes the parent's skill registry to the child instance.

### 2. Worktrunk Integration

The `worktrunk` skill creates an isolated git worktree for the external agent:

- New worktree branched from the current HEAD
- External agent receives the worktree path as its working directory
- Isolation guarantees: no concurrent modification of the parent's working tree
- On completion, changes merge back through standard git flow

### 3. Surgeon-Patient Relation

| Role | Entity | Responsibility |
|------|--------|----------------|
| **Patient** | Parent agent | Provides context, constraints, acceptance criteria. Its codebase IS the thing being modified. |
| **Surgeon** | External agent | Receives bounded task scope, operates within worktree, produces commits. Fresh context, no accumulated token debt. |

The parent does not modify itself. It delegates, observes, and accepts or rejects the surgeon's work.

### 4. Ralph Execution Mode

Ralph manages the deterministic task loop:

- Tasks are structured as beads on a ralph loop
- Each bead = one bounded unit of work for the external agent
- The loop progresses deterministically: spawn, execute, verify, advance
- `ralph-tui` provides visibility into bead progress and agent state

### 5. Inter-Instance Communication

The `techne-*` hooks manage the external agent lifecycle:

| Hook | Function |
|------|----------|
| `techne-spawn` | Launch external agent with worktree path, skill proxy config, and task scope |
| `techne-relay` | Send structured messages between parent and child (instructions, queries, status) |
| `techne-list` | List active child agent instances and their states |
| `techne-close` | Terminate child instance, collect results, trigger merge evaluation |

### 6. Verification Gates

Shell hooks provide structured validation at lifecycle boundaries:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `preflight-validate.sh` | Before `techne-spawn` | Validates task scope, checks worktree readiness, confirms no conflicts |
| `postflight-verify.sh` | After `techne-close` | Runs tests against modified worktree, validates coordinate consistency, checks regressions |

## Integration Points

| Component | Role in Ouroboros |
|-----------|-------------------|
| `worktrunk` | Creates and manages the isolated worktree for the external agent |
| `pleroma-skill-proxy` | Proxies parent skill registry to child agent instance |
| `techne-spawn` | Spawns external coding agent with configuration |
| `techne-relay` | Structured parent-child communication channel |
| `techne-list` | Enumerates active child instances |
| `techne-close` | Terminates child, collects output, triggers merge path |
| `ralph-tui` | Deterministic bead/task loop management and visibility |
| `preflight-validate.sh` | Pre-spawn validation gate |
| `postflight-verify.sh` | Post-close verification gate |

## Output Format

```
OUROBOROS: [task-name]
Agent: [claude | aider | cursor | custom]
Worktree: [branch-name]
Bead: [n/total]
Status: [spawning | active | relay | verifying | merging | complete | failed]
Surgeon: [child-instance-id]
Patient: [parent-context-summary]
```

## Coordinate Semantics

- **CP 4.3**: Position 4 (Context/Lemniscate), sub-position 3 (Pattern). The self-fold that reveals processual pattern through delegation.
- **CT2**: The operational frame -- the Trika of User (architect), Agent (parent), Code (external agent as processor).
- **CT3**: The pattern frame -- the recurring loop structure of ralph bead iteration.
- **CF**: The Lemniscate anchor. Ouroboros IS cf made executable -- the system nesting within itself an agent that operates on itself.

## Constraints

- The parent agent never directly modifies files during an ouroboros session -- all modification flows through the surgeon
- Each external agent instance operates in exactly one worktree
- `techne-relay` is the only communication channel between parent and child (no shared mutable state)
- `postflight-verify.sh` must pass before merge is permitted
- Ralph bead progression is deterministic -- no skipping, no reordering
- Worktree cleanup is mandatory on `techne-close` (success or failure)
