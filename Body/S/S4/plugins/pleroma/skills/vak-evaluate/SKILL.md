---
name: vak-evaluate
description: Assign CPF, CT, CP, CF, CFP, and CS coordinates to a task before Anima dispatch.
---

# VAK Evaluate

Use this skill before non-trivial Anima dispatch.

## Required Coordinates

- `CPF`: dialogical ground and stop condition.
- `CT`: task type.
- `CP`: operative position.
- `CF`: constitutional function code.
- `CFP`: coordinate family projection.
- `CS`: synthesis/return condition.

## Gate Rules

- `CPF = (00/00)` means stop and ask the user through Nous.
- `CF = (0000)` means invoke Nous for epistemic clearing, then re-evaluate.
- Return enough evidence for the chosen `CF`; do not only return labels.

## Output Shape

```json
{
  "cpf": "(4.0/1-4.4/5)",
  "ct": "CT1",
  "cp": "4.1",
  "cf": "(0/1)",
  "cfp": "S4/S4'",
  "cs": "dispatchable",
  "reasoning": "Specification and boundary-setting dominate the task."
}
```
