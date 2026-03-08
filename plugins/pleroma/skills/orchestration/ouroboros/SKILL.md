---
name: ouroboros
description: "Protocol for consensual self-surgery. Workflow pipeline from Origin through Pre-flight, Design, Execute, Verify, Merge. Three modes: Checkpoint Surgery, Collaborative Design, Full Pipeline. Port-and-refine from upstream."
port_type: port-and-refine
skill_class: vak
ct: CT2, CT3
cp: "4.3"
agent_affinity: psyche, mythos
---

# Ouroboros -- Protocol for Consensual Self-Surgery

Ouroboros is the structured protocol for modifying the system's own skills, agents, and configuration. It ensures all self-modification follows a disciplined pipeline with verification gates and human consent at critical junctures.

## When to Invoke

- System needs to modify its own skills or agent definitions
- Architecture changes that affect the VAK coordinate system
- New skill integration or existing skill refactoring
- Agent capability extension or constraint modification

## Workflow Pipeline

### Phase 0: Origin

**Question**: What triggered this self-modification need?

- Identify the source: Night' P5' Insight, user request, bug discovery, pattern recognition
- Document the origin coordinate (CP, CF, CS that surfaced the need)
- Validate that modification is within scope

### Phase 1: Pre-flight

**Question**: Is modification safe and necessary?

- Check current state of target files
- Verify no concurrent modifications in progress
- Assess blast radius: which other skills/agents are affected?
- Document rollback strategy

**Gate**: Pre-flight passes only if blast radius is understood and rollback is possible.

### Phase 2: Design

**Question**: What exactly will change?

- Draft the modification as a structured diff
- Identify all affected files and their current state
- Design verification criteria (what must pass after modification)
- Document expected behavior changes

**Collaboration primitive**: `design-start` -- begins collaborative design with user/Patient.

**Gate**: Design must be reviewed and approved before execution.

### Phase 3: Execute

**Question**: Apply the changes.

- Create checkpoint (snapshot current state)
- Apply modifications in order
- Run immediate smoke tests
- Log all changes with timestamps

**Collaboration primitive**: `design-query` -- allows mid-execution questions to user/Patient.

### Phase 4: Verify

**Question**: Did it work?

- Run full verification suite against modification criteria
- Check for regressions in adjacent skills/agents
- Validate VAK coordinate consistency
- Confirm no broken references

**Collaboration primitive**: `verify-start` -- begins verification with user/Patient.

**Gate**: Verification must pass. If it fails, trigger rollback to Phase 3 checkpoint.

### Phase 5: Merge

**Question**: Commit the change.

- Commit changes with structured commit message
- Update any affected documentation
- Emit discharge summary
- Archive the Ouroboros session for Night' extraction

**Collaboration primitive**: `discharge` -- structured closure of the surgery session.

## Three Modes

### Checkpoint Surgery

Fast-path for small, well-understood changes:
- Skip Phase 2 (Design) detailed review
- Execute -> Verify -> Merge
- Use when: single-file changes, typo fixes, configuration updates

### Collaborative Design

Full human-in-the-loop design process:
- Full Phase 2 with design-start, design-query
- Multiple design iterations before execution
- Use when: new skill creation, architecture changes, multi-file modifications

### Full Pipeline

Complete Phase 0 through Phase 5:
- All gates enforced
- All collaboration primitives available
- Use when: significant system changes, first-time modifications to a subsystem

## Collaboration Primitives

| Primitive | Phase | Description |
|-----------|-------|-------------|
| `design-start` | 2 | Open collaborative design session |
| `design-query` | 2-3 | Mid-process question to user/Patient |
| `verify-start` | 4 | Open verification session |
| `discharge` | 5 | Structured closure and summary |

## Git Integration

Ouroboros integrates with git at each phase:

- **Phase 1**: `git stash` current changes if needed
- **Phase 3**: Create checkpoint branch before modifications
- **Phase 4**: Verify on checkpoint branch
- **Phase 5**: Merge checkpoint branch, clean up

## Rollback Protocol

If any phase fails:
1. Restore from Phase 3 checkpoint
2. Document failure reason
3. Return to Phase 2 for redesign
4. Log rollback event for Night' analysis

## Output Format

```
OUROBOROS: [modification-name]
Phase: [0-5]
Mode: [checkpoint | collaborative | full]
Status: [in-progress | gate-passed | gate-failed | complete | rolled-back]
Affected: [list of affected files/skills]
Verification: [pass | fail | pending]
```

## Constraints

- Never modify skills that are currently being executed
- Always create a checkpoint before execution
- Verification must pass before merge
- All self-modifications are logged for Night' extraction
- Human consent required for Phase 2 gate in Collaborative and Full modes
