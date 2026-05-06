# git-master VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/git-master/SKILL.md`
**VAK agent:** Sophia | CF: `(5/0)` | Complexity: MEDIUM

## 1. Internal Workflow Summary

Routes to git-master agent: atomic commits, rebasing, branch management, history cleanup.
Minimal OMX content — thin skill wrapper around `git-master` agent role delegation.
Core capabilities: conventional format commits, interactive rebasing, style detection from history.

## 2. VAK Seam Map

| Operation | VAK CP | Agent | Day/Night′ |
|-----------|--------|-------|-----------|
| Git operations (commit/rebase/branch) | CP 4.5 Integration | Sophia | Day |
| Möbius return | P5′ → P0′ | Sophia → Nous | Night′ boundary |

All git operations are at CP 4.5 (what was produced? → commit it).
Möbius return is the unique VAK addition: P5′ Insight crystallized → P0′ Questions for next cycle.

## 3. Handoff Contract Rewrite

**OMX-native:** `delegate(role="git-master", tier="STANDARD", task="{{ARGUMENTS}}")` → stop.

**VAK-native:**
- Execute git operations as before
- After successful operation: write Möbius Return artifact
- Möbius Return artifact: handed back to Nous as P0′ ground for next cycle
- Format: `## Möbius Return (P5′→P0′)` section appended to completion output

## 4. State Schema Delta

Add `vak` to git-master state:
```json
{
  "vak": {
    "cpf": "(4.0/1-4.4/5)",
    "cf": "(5/0)",
    "agent": "sophia",
    "cp": "4.5",
    "cfp": "CFP0",
    "cs": "CS0",
    "mobius_return": null
  }
}
```

On completion: `"mobius_return": { "p5_insight": "...", "p0_questions": "..." }`

## 5. Output Format Delta

Completion output gains Möbius Return section:
```markdown
## Möbius Return (P5′→P0′)

**P5′ Insight (what this branch/commit crystallized):**
[1-3 sentence synthesis of what was accomplished]

**P0′ Questions (what the next cycle should investigate):**
[1-3 actionable questions opened by this closure]

---
VAK: git-master/{branch-or-operation}
CPF: (4.0/1-4.4/5)  CT: CT2→CT5  CP: 4.5→P5′→P0′
CF: (5/0) → Sophia  CFP: CFP0  CS: CS0 / Möbius
```

## 6. Constitutional Agent Binding

**Owner:** Sophia. All git operations route through Sophia's `(5/0)` CF frame.
Sophia receives from Atropos (Night′ P5′ crystallization) when Night′ preceded the commit.
Möbius return output is addressed to Nous as next-cycle ground.

## Cross-skill Q6 Resolution

Möbius contract = Sophia appends `## Möbius Return (P5′→P0′)` to every git-master completion.
Two required fields: **P5′ Insight** (what crystallized) + **P0′ Questions** (what opens next).
This is the P0′ handoff artifact — it exists even for simple commits.
