# plan VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/plan/SKILL.md`
**VAK agent:** Logos | CF: `(0/1)` | Complexity: HIGH

## 1. Internal Workflow Summary

Multi-mode planning:
- **Interview mode**: broad requests → interactive requirements gathering, one question at a time
- **Direct mode**: `--direct` or detailed request → generate plan directly
- **Consensus mode**: `--consensus` → Planner/Architect/Critic loop (same as ralplan)
- **Review mode**: `--review` → Critic evaluation of existing plan

## 2. VAK Seam Map

| Mode | VAK Mapping |
|------|------------|
| Interview mode | CPF=`(00/00)` Nous for intake; switches to `(4.0/1-4.4/5)` on plan creation |
| Direct mode | CPF=`(4.0/1-4.4/5)`, CF=`(0/1)` Logos, CP=4.1 |
| Consensus mode | Same CFP2 C-Thread as ralplan: Logos→Mythos→Eros |
| Review mode | CF=`(0/1/2)` Eros (quality critique), Night′ P2′ Challenges framing |

Interview questions route through Nous `(00/00)` before plan creation begins.
On "create the plan" signal: switch to Logos `(0/1)` mechanistic mode.

## 3. Handoff Contract Rewrite

Same as ralplan. On approval:
- `vak-evaluate` on plan → CF code → `anima-orchestration` → Anima dispatches ralph/team

## 4. State Schema Delta

Add `vak` block to plan state:
```json
{
  "vak": {
    "mode": "interview|direct|consensus|review",
    "cpf_intake": "(00/00)",
    "cpf_plan": "(4.0/1-4.4/5)",
    "cf": "(0/1)",
    "agent": "logos",
    "cp": "4.1",
    "cfp": "CFP0|CFP2",
    "cs": "CS0"
  }
}
```

## 5. Output Format Delta

Plan artifact gains VAK topology header (same format as ralplan).
Interview intake notes which questions were Nous-mode vs direct-answer.

## 6. Constitutional Agent Binding

**Owner:** Logos (plan writing). Nous (interview intake gate).
Consensus mode: same Logos/Mythos/Eros triad as ralplan.
Review mode: Eros owns.
