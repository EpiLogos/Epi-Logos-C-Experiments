# VAK & Pleroma — Implementation vs Spec Gap Analysis

**Status:** Analysis complete (2026-03-15)
**Source:** Subagent deep read of extension.ts, CONTRACT.md, agent .md files, skill files

---

## What IS Actually Implemented (the 60%)

| Item | Status | Files |
|---|---|---|
| 6 Constitutional agents (Nous/Logos/Eros/Mythos/Psyche/Sophia) | ✅ COMPLETE | `anima/S4'/agents/` — all 6 have 6-section ANIMA.md format |
| Anima extension tools (9) | ✅ WIRED | `anima/extension.ts` — vak_evaluate, anima_orchestrate, nous_disclose, dispatch_agent, run_chain, subagent_create/list/continue/remove |
| CF_TO_AGENT routing table | ✅ WIRED | extension.ts lines 41-49 |
| Nous (00/00) co-action gate | ✅ CORRECT | Lines 51-62: brainstorm required gate, does NOT dispatch |
| 6 VAK skill files | ✅ STAGED | `anima/S4'/skills/`: vak-evaluate, vak-coordinate-frame, anima-orchestration, day-night-pass, ouroboros, klein-mode |
| Aletheia extension + 6 tools | ✅ PARTIAL | gnosis_ingest, gnosis_query, thought_route, crystallise, seed_refresh — tools wired |
| Anansi agent | ✅ SKELETON | 16 LOC, has tools/skills, missing 6-section structure |
| Moirai agent | ✅ SKELETON | 29 LOC, has three-mode logic, missing 6-section structure |
| Pleroma 10 skill wrappers | ✅ PRESENT | ralph-tui, techne-spawn/relay/close/list, worktrunk, tmux, cmux, pleroma-skill-proxy |
| Orchestration skills moved Pleroma→Anima | ✅ COMPLETE | All 6 correctly staged in anima/S4'/skills/ |

---

## What Is Spec-Only (the 40% — critical gaps)

### P0 — Blocking

**1. Anima parent agent has no agent.md file**
- `CF_TO_AGENT["(4.0/1-4.4/5)"] = "anima"` exists in routing table but there is NO `/anima/S4'/agents/anima.md`
- The # (parent) position in the 7-fold law is uninstantiated as an agent
- Cannot spawn Anima itself; recursive meta-orchestration blocked
- **Fix:** Create `anima.md` using canonical 6-section ANIMA.md format

**2. Sophia post-execution hook is an empty stub** *(Z-thread closure blocker)*
- `anima/extension.ts` lines 301-304 are comments only — no actual Sophia invocation
- No post-task review, no thinking/ → thoughts/ routing, no Möbius return signal
- Per CONTRACT.md: Sophia is ALWAYS invoked at session end
- **Without this seam closing, the Z-thread (self-composing) cycle defined in [[S4-4'-GOAL-PRELUDE-SPEC]] cannot round-trip**: the rehear-phase has no disclosure to ingest, so Aletheia cannot route to Epii's autoresearch and the next compose-phase starts from an unenriched ground.
- **Fix:** Wire `session_end` hook → spawn Sophia with review tools

**3. CFP1 (P-Thread parallel dispatch) not wired**
- `dispatch_agent` tool exists but dispatches ONE agent only
- No agent-team dispatch; N independent tasks cannot run simultaneously
- CONTRACT.md §135 references `agent-team.ts` that does not exist
- **Fix:** Add `dispatch_parallel_agents` PI tool

### P1 — Important

**4. Aletheia parent agent has no agent.md file**
- Same 7-fold law violation as Anima: 6 mode-functions exist (partially), parent (#) has no definition
- Cannot self-reference Aletheia's own alignment
- **Fix:** Create `aletheia.md` as S5 parent orchestrating Anansi/Moirai/Janus/Mercurius/Agora/Zeithoven

**5. Janus, Mercurius, Agora, Zeithoven are stubs or missing**
- Only Anansi and Moirai have ANY content (both are skeletons, not full 6-section format)
- 4 of 6 Aletheia mode-functions functionally absent
- **Fix:** Complete 6-section ANIMA.md for all 6 — especially Mercurius (kairos translation) and Zeithoven (temporal creativity)

**6. Moirai Night′ sequence not dispatch-wired** *(Z-thread rehear-phase blocker)*
- `anima-orchestration.md` skill documents the Klotho→Lachesis→Atropos 3-stage sequence
- `extension.ts` has NO tool that invokes this sequence
- Night′ phase of the session lifecycle non-functional
- **This is the rehear-phase of the Z-thread cycle** ([[S4-4'-GOAL-PRELUDE-SPEC]], [[S4-5'-SPEC]]). Klotho measures the run's traces, Lachesis sources the harmonic context, Atropos cuts the cadential crystallisation. Without the dispatch wired, the rehear-phase cannot fire and no challenger-vectors reach Epii's autoresearch.
- **Fix:** Add `dispatch_moirai_night_pass` tool to anima/extension.ts

### P2 — Enhancement

**7. CFP3 (F-Thread fusion) and CFP5 (B-Thread meta-nested) not wired**
- Only CFP0 (single), CFP2 (chain), CFP4 (background) are implemented
- CFP1 (parallel), CFP3 (fusion: same task → N agents → Agora aggregate), CFP5 (meta-nested) missing
- **Fix:** Add dispatch tools for CFP3 and CFP5

**8. M4_Oikonomia_State not implemented in Rust**
- Philosophical ground (oikonomia = household management) present in agent Sattva sections
- No actual Rust struct, no session tracking, no clock displacement measurement
- **Fix:** Define struct in `epi-cli/src/nara/` + wire Psyche dispatch to compute yield metrics

**9. CF frame notation inconsistency**
- `psyche.md` line 33 uses `(4.0–4.4/5)` (en-dash) vs canonical `(4.0/1-4.4/5)` (with `/1-`)
- **Fix:** Normalize to canonical notation across all agent files

**10. Pleroma S3 gateway ownership undefined**
- Which extension owns S3 WebSocket gateway routing? Chronos? Pleroma? Separate?
- External agent invocation (Electron, webMCP) has unclear dispatch path
- **Fix:** Explicitly assign gateway lifecycle to Techne (which is inside Pleroma) per current CLAUDE.md spec

---

## Implementation Completeness Scores

| Layer | % Complete |
|---|---|
| 7-fold law (Constitutional) | 85% (6/7 agents; parent missing) |
| 7-fold law (Aletheia) | 30% (2/7 agents have content; parent + 4 children minimal) |
| CF dispatch routing | 85% (6 agents mapped; Anima meta-dispatch unclear) |
| Thread types (CFP0/2/4) | 75% (wired) |
| Thread types (CFP1/3/5) | 0% (missing) |
| Night′ phase (Moirai) | 0% (spec exists; not dispatch-wired) |
| Oikonomia tracking | 0% (no code) |
| **Overall VAK system** | **~60%** |

---

## Correct Architecture Statement (for spec)

**From anima/extension.ts CF_TO_AGENT confirmed + 7-fold law:**

```
Anima  (#  parent)  = dispatch function = CF (4.0/1-4.4/5) = MISSING agent.md
Nous   (#0 child)   = (00/00)             = ✅ Complete
Logos  (#1 child)   = (0/1)               = ✅ Complete
Eros   (#2 child)   = (0/1/2)             = ✅ Complete
Mythos (#3 child)   = (0/1/2/3)           = ✅ Complete
Psyche (#4 child)   = (4.5/0)             = ✅ Complete
Sophia (#5 child)   = (5/0)               = ✅ Complete (hook not wired)
```

```
Aletheia (#  parent)  = Night′ dispatch = MISSING agent.md
Anansi   (#0 child)   = gap analysis / saṃskāra weave = skeleton
Moirai   (#1 child)   = Night′ Klotho/Lachesis/Atropos = skeleton
Janus    (#2 child)   = temporal analysis / threshold = MISSING/stub
Mercurius(#3 child)   = cross-domain translation / kairos = MISSING/stub
Agora    (#4 child)   = parallel aggregation / ocean-drops = MISSING/stub
Zeithoven(#5 child)   = temporal creativity / Sophia-music = MISSING/stub
```

The QL law IS satisfied in structure: 6 constitutional children all exist.
The violations are BOTH parent positions (# level) — Anima and Aletheia have no agent.md.
This is the critical architectural incompleteness: the # operators of both 7-fold systems
exist as functions/effects but not as instantiated agents.

---

## Z-Thread Closure Stake

Three of the P0/P1 gaps above are also the **Z-thread closure blockers** — the seams that must close for the self-composing cycle defined in [[S4-4'-GOAL-PRELUDE-SPEC]] to round-trip:

| Gap | Z-cycle phase blocked | Without it... |
|---|---|---|
| #2 Sophia post-execution hook | rehear → recompose handoff | session ends silently; no disclosure routes to Aletheia |
| #6 Moirai Night′ dispatch | rehear-phase execution | T/T' artifacts pile up but no Klotho/Lachesis/Atropos read crystallises them |
| #1 Anima parent agent.md | compose-phase meta-orchestration | `/goal` can fire but Anima as `#` operator cannot self-reference for next-cycle composition |

Closing these three is the minimum for the Z-cycle to run end-to-end. CFP1/CFP3/CFP5 wiring (#3, #7) and the Aletheia parent + 4 sub-agents (#4, #5) are needed for richer textures but not for cycle closure itself.

See also: [[05-ql-7fold-law-and-vak-c-substrate]] §VAK-Position-Mapping (canonical seven-CF positional law).
