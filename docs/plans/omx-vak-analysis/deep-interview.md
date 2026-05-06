# deep-interview VAK Seam Map

**OMX source:** `vendors/oh-my-codex/skills/deep-interview/SKILL.md`
**VAK agent:** Nous | CF: `(00/00)` | Complexity: HIGH

## 1. Internal Workflow Summary

5-phase state machine:
- **Phase 0**: Preflight context snapshot → `.omx/context/{slug}-{timestamp}.md`
- **Phase 1**: Initialize state, detect greenfield/brownfield, depth profile (quick/standard/deep)
- **Phase 2**: Socratic interview loop — ambiguity scoring, stage priority, challenge modes
- **Phase 3**: Challenge modes (Contrarian / Simplifier / Ontologist)
- **Phase 4**: Crystallize artifacts → `.omx/interviews/` + `.omx/specs/`
- **Phase 5**: Execution bridge — handoff options ($ralplan / $autopilot / $ralph / $team)

State keys: `interview_id`, `profile`, `type`, `initial_idea`, `rounds[]`, `current_ambiguity`, `threshold`, `challenge_modes_used`, `current_stage`, `current_focus`

## 2. VAK Seam Map

| Phase | VAK Mapping |
|-------|------------|
| Phase 0: Preflight | CPF=`(00/00)`, CP=4.0 Ground (what do we have?) |
| Phase 1: Initialize | CPF=`(00/00)`, CT=CT0 Relational |
| Phase 2: Interview loop | CF=`(00/00)` → Nous; each round is P0′ Questions territory |
| Phase 3: Challenge modes | Contrarianist = P2′ Challenges; Ontologist = P0′ Questions |
| Phase 4: Crystallize | CP=4.5 Integration (what was produced?) — VAK block goes HERE |
| Phase 5: Bridge | `vak-evaluate` first, then `anima-orchestration` — not raw $ralplan |

## 3. Handoff Contract Rewrite

**OMX-native (current):**
- `$ralplan`, `$autopilot`, `$ralph`, `$team`

**VAK-native (after fork):**
- Always run `vak-evaluate` on the crystallized spec first
- `vak-evaluate` output → `anima-orchestration` → dispatches to correct constitutional agent
- Options become: Logos (ralplan path), Anima (ralph/team path), Sophia (closure)
- User selection maps to CF code: ralplan → `(0/1)` Logos; ralph/team → `(4.0/1-4.4/5)` Anima

## 4. State Schema Delta

Add to Phase 1 `state_write`:
```json
{
  "vak": {
    "cpf": "(00/00)",
    "ct": "CT0",
    "cp": "4.0",
    "cf": "(00/00)",
    "agent": "nous",
    "cfp": "CFP0",
    "cs": "CS0",
    "mode": "Day"
  }
}
```

Update on Phase 4 crystallize: `"cp": "4.5"` (production complete)

## 5. Output Format Delta

Phase 4 spec artifact (`.omx/specs/deep-interview-{slug}.md`) gains VAK block:
```
VAK: deep-interview/{slug}
CPF: (00/00)  CT: CT0  CP: 4.0→4.5
CF: (00/00) → Nous  CFP: CFP0  CS: CS0 / Day
```

Phase 5 bridge includes resolved VAK coordinates for handoff skill.

## 6. Constitutional Agent Binding

**Owner:** Nous. This IS a Nous modality — no external agent dispatch during the interview.
Nous holds both Ouroboros (brainstorming) and deep-interview (Socratic).
At Phase 5, Nous hands off; the handoff skill (vak-evaluate) runs OUTSIDE Nous.

## Cross-skill Q4 Resolution

Input to `vak-evaluate` at Phase 5 = the crystallized spec path (`.omx/specs/deep-interview-{slug}.md`).
The spec's Intent + Desired Outcome section is the task description for VAK coordinate assignment.
