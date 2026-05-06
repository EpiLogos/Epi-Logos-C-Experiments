# ultraqa VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/ultraqa/SKILL.md`
**VAK agent:** Sophia/Eros | CF: `(5/0)` / `(0/1/2)` | Complexity: MEDIUM

## 1. Internal Workflow Summary

Autonomous QA cycling: qa-tester → architect diagnosis → executor fix → repeat (max 5 cycles).
Goal types: --tests / --build / --lint / --typecheck / --custom / --interactive.
Exit conditions: goal met / cycle 5 / same failure 3x / environment error.

## 2. VAK Seam Map

| Phase | VAK CP | Agent | Day/Night′ |
|-------|--------|-------|-----------|
| QA run | CP 4.5 What was produced? | Sophia / Eros | Day |
| Failure check | CP 4.2 What is being done? | Eros | Day |
| Architect diagnosis | CP 4.3 What shape does it take? | Mythos | Day |
| Fix execution | CP 4.2 Operation | Eros / Anima | Day |
| Night′ trigger | P2′ Challenges / P3′ Patterns | Eros / Mythos | Night′ |

## 3. Night′ Trigger Rules (cross-skill Q5 resolution)

Night′ triggers when:
- **Same failure ≥2 cycles** AND no simple fix found → P3′ Patterns (what repeats?)
- **Architectural blocker** identified by architect → P2′ Challenges via Klotho (Eros)
- **Pattern recognized** (systemic issue, not one-off) → full Night′ via CFP4 L-Thread

Night′ is **NOT** a blocking condition for all passes. Partial pass rules:
- P0′–P3′ remaining: continue Day cycling; Night′ runs as CFP4 parallel (non-blocking)
- P4′–P5′ remaining: soft block; recommend Night′ before declaring done
- Only block at P5′ Insight if crystallization is required before PR/merge

## 4. Handoff Contract Rewrite

**OMX-native:** State-based cycling; on goal met → `state_clear`.

**VAK-native:**
- On goal met: VAK block written + hand to Sophia for Möbius return framing
- On Night′ trigger: dispatch Klotho (P1′) + Eros (P2′) via CFP4
- On max cycles: Night′ mandatory → P5′ Insight required before giving up

## 5. State Schema Delta

Add `vak` to ultraqa state:
```json
{
  "vak": {
    "cpf": "(4.0/1-4.4/5)",
    "cf": "(0/1/2)",
    "agent": "eros",
    "cfp": "CFP0",
    "cs": "CS2",
    "cp": "4.2",
    "night_triggered": false,
    "night_pass": null
  }
}
```

On Night′: `"night_triggered": true, "cfp": "CFP4", "night_pass": "P2′|P3′"`

## 6. Output Format Delta

Each cycle report gains VAK block. Completion:
```
VAK: ultraqa/{goal-type}
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.5
CF: (5/0) → Sophia / (0/1/2) → Eros  CFP: CFP0|CFP4  CS: CS2 / Day[+Night′]
```

## 7. Constitutional Agent Binding

**Owner:** Eros (QA cycling, fix execution). Sophia (completion sign-off).
Mythos: architect diagnosis invocation.
Night′: Klotho → P1′ Traces (evidence), Eros → P2′ Challenges (blockers).
