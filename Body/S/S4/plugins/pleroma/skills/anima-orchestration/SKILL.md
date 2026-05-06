---
name: anima-orchestration
description: Evaluate a task through VAK coordinates, select the constitutional agent path, and produce a bounded dispatch plan with Epii review routing when needed.
---

# Anima Orchestration

Use this skill when Anima must turn a user or system request into an executable dispatch path.

## Contract

1. Run `vak-evaluate` first unless the caller provides a fresh VAK result.
2. Map `CF` to the constitutional agent function:
   - `(0000)` -> Nous
   - `(0/1)` -> Logos
   - `(0/1/2)` -> Eros
   - `(0/1/2/3)` -> Mythos
   - `(4.5/0)` -> Psyche
   - `(5/0)` -> Sophia
3. Return a bounded dispatch plan containing:
   - `target_agent`
   - `required_skills`
   - `allowed_tools`
   - `forbidden_authority`
   - `review_policy`
   - `epii_inbox_deposit`, when the output requires meaning review or validation
4. Do not resolve Epii review gates. Anima may deposit, request, or notify; Epii decides.

## Output Shape

```json
{
  "target_agent": "logos",
  "required_skills": ["plan"],
  "allowed_tools": ["Read", "Write"],
  "forbidden_authority": ["resolve_epii_review_gate"],
  "review_policy": "epii_inbox",
  "epii_inbox_deposit": null
}
```
