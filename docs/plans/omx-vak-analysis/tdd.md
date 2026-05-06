# tdd VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/tdd/SKILL.md`
**VAK agent:** Eros | CF: `(0/1/2)` | Complexity: MEDIUM

## 1. Internal Workflow Summary

Iron Law TDD: no production code without failing test.
Cycle: RED (write failing test) → GREEN (minimal impl) → REFACTOR (clean up) → REPEAT.

State: cycle tracking per feature. Each phase must be verified by running tests.
External consultation: Codex for test strategy validation (optional).

## 2. VAK Seam Map

| Phase | VAK CP | Day/Night′ | Agent |
|-------|--------|-----------|-------|
| RED — write failing test | CP 4.1 Definition | Day: What must be true? | Eros |
| GREEN — minimal implementation | CP 4.2 Operation | Day: What is being done? | Eros |
| REFACTOR — clean up | CP 4.3 Pattern | Day: What shape does it take? | Eros→Mythos review |

TD generalisation: applies not just to code tests but to any verification artifact.
Night′ enters when: same test failure across ≥2 cycles → P2′ Challenges (what blocks us?).

## 3. Handoff Contract Rewrite

**OMX-native:** No explicit handoff; cycles until done or delegated.

**VAK-native:**
- After REFACTOR: if all green → hand to `vak-evaluate` for CP 4.5 (what was produced?)
- If Night′ triggered: CFP4 L-Thread via Eros, Klotho executor for P1′ Traces
- Completion check: `verification-before-completion` (ultraqa) before handing to Sophia

## 4. State Schema Delta

Add `vak` block per cycle:
```json
{
  "vak": {
    "cycle": 1,
    "phase": "RED|GREEN|REFACTOR",
    "cp": "4.1|4.2|4.3",
    "cf": "(0/1/2)",
    "agent": "eros",
    "cfp": "CFP0",
    "cs": "CS2",
    "night_triggered": false
  }
}
```

## 5. Output Format Delta

Each phase report gains VAK block:
```
VAK: tdd/[feature-name]
CPF: (4.0/1-4.4/5)  CT: CT2  CP: 4.[1|2|3]
CF: (0/1/2) → Eros  CFP: CFP0  CS: CS2 / Day
```

## 6. Constitutional Agent Binding

**Owner:** Eros owns TDD. Mythos invoked for architectural pattern questions during REFACTOR.
Night′ partial: Klotho (P1′ Traces) + Eros (P2′ Challenges).
