# S4' Pleroma Port Matrix

**Status:** Draft authority for the real Pleroma port
**Date:** 2026-03-07
**Purpose:** Freeze what we are actually porting into `plugins/pleroma/`, what stays substrate-only, and which capabilities are true ports versus fresh designs required by the S4' 4.0-4.5 body.

## Port Modes

- `port-as-is`: upstream artifact is structurally sound and should be carried over with only path and metadata adaptation
- `port-and-refine`: upstream artifact is real and valuable, but must be repackaged or corrected during port
- `fresh-design`: capability is part of the target body, but there is no authoritative installed artifact to copy directly

## Matrix

| Capability | Source of Truth | Target Layer | Target Path | Port Mode | Verification Method |
|---|---|---|---|---|---|
| `tmux` | `Idea/epi-claw/skills/tmux/SKILL.md`; Pleroma primitives references | substrate primitive + atomic skill | `.pi/extensions/pleroma-primitives.ts`; `plugins/pleroma/skills/atomic/tmux/SKILL.md` | `port-and-refine` | primitive registry test + real spawn/runtime hook suite |
| `cmux` | S4' target architecture only; no installed authoritative skill found | substrate primitive + atomic skill | `.pi/extensions/pleroma-primitives.ts`; `plugins/pleroma/skills/atomic/cmux/SKILL.md` | `fresh-design` | primitive registry test + bounded command integration test |
| `mprocs` | `extensions/pleroma/skills/mprocs/SKILL.md`; Pleroma primitives references | substrate primitive + atomic skill | `.pi/extensions/pleroma-primitives.ts`; `plugins/pleroma/skills/atomic/mprocs/SKILL.md` | `port-and-refine` | primitive registry test + workshop process contract suite |
| `worktrunk` | target executive capability named in current planning; no installed authoritative skill found | substrate primitive + atomic skill | `.pi/extensions/pleroma-primitives.ts`; `plugins/pleroma/skills/atomic/worktrunk/SKILL.md` | `fresh-design` | real temp-worktree integration test |
| `bkmr_kbase` | `pleroma-pi-primitives.ts`; Agora/BKMR references in installed epi-claw | substrate primitive | `.pi/extensions/pleroma-primitives.ts` | `port-and-refine` | primitive registry test + retrieval contract suite |
| `onecontext` | `pleroma-pi-primitives.ts`; `pleroma-skill-proxy`; `technē-spawn` | substrate primitive | `.pi/extensions/pleroma-primitives.ts` | `port-and-refine` | primitive registry test + session-summary roundtrip suite |
| `ralph-tui` | `skills/ouroboros/SKILL.md`; `spawn-subagent.sh`; Anima runtime contracts | substrate primitive + atomic skill | `.pi/extensions/pleroma-primitives.ts`; `plugins/pleroma/skills/atomic/ralph-tui/SKILL.md` | `port-and-refine` | real headless launch/checkpoint suite |
| `gitbutler` | `extensions/pleroma/skills/gitbutler/SKILL.md`; Pleroma coordination code | substrate primitive + atomic skill | `.pi/extensions/pleroma-primitives.ts`; `plugins/pleroma/skills/atomic/gitbutler/SKILL.md` | `port-and-refine` | execution-plan validation suite |
| `notebooklm` | `Idea/epi-claw/skills/notebooklm/SKILL.md` | atomic skill + optional bounded primitive bridge | `plugins/pleroma/skills/atomic/notebooklm/SKILL.md`; optional `.pi/extensions/pleroma-primitives.ts` hook-in | `port-and-refine` | real command contract suite against configured helper |
| `chatlog-fetcher` | target evidence-acquisition capability; no installed authoritative skill found | atomic skill | `plugins/pleroma/skills/atomic/chatlog-fetcher/SKILL.md` | `fresh-design` | real file fixture ingestion suite |
| `youtube-transcript` | named in VAK planning as atomic skill example; no installed authoritative skill found in current local inventory | atomic skill | `plugins/pleroma/skills/atomic/youtube-transcript/SKILL.md` | `fresh-design` | real transcript fetch fixture and parser suite |
| `repl` / Darshana | `Idea/epi-claw/skills/repl/SKILL.md`; `darshana.py` called out in canonical docs | atomic skill | `plugins/pleroma/skills/atomic/repl/SKILL.md` | `port-as-is` | real large-file scout/read/threads suite |
| `pleroma-skill-proxy` | `extensions/pleroma/skills/pleroma-skill-proxy/SKILL.md` | atomic skill | `plugins/pleroma/skills/atomic/pleroma-skill-proxy/SKILL.md` | `port-and-refine` | progeny-config and path-propagation suite |
| `technē-spawn` | `extensions/pleroma/skills/technē-spawn/SKILL.md`; VAK Technē section | atomic skill | `plugins/pleroma/skills/atomic/technē-spawn/SKILL.md` | `port-and-refine` | real tmux/mprocs stdin-stdout orchestration suite |
| `technē-relay` | `extensions/pleroma/skills/technē-relay/SKILL.md`; VAK Technē section | atomic skill | `plugins/pleroma/skills/atomic/technē-relay/SKILL.md` | `port-and-refine` | workshop relay suite |
| `technē-list` | `extensions/pleroma/skills/technē-list/SKILL.md`; VAK Technē section | atomic skill | `plugins/pleroma/skills/atomic/technē-list/SKILL.md` | `port-and-refine` | workshop state listing suite |
| `technē-close` | `extensions/pleroma/skills/technē-close/SKILL.md`; VAK Technē section | atomic skill | `plugins/pleroma/skills/atomic/technē-close/SKILL.md` | `port-and-refine` | graceful shutdown and cleanup suite |
| `vak-coordinate-frame` | VAK integration spec + installed VAK skill set | orchestration skill | `plugins/pleroma/skills/orchestration/vak-coordinate-frame/SKILL.md` | `port-and-refine` | routing metadata validation suite |
| `vak-evaluate` | `extensions/pleroma/skills/vak-evaluate/SKILL.md` | orchestration skill | `plugins/pleroma/skills/orchestration/vak-evaluate/SKILL.md` | `port-and-refine` | S4-0' through S4-5' coordinate eval suite |
| `anima-orchestration` | `extensions/pleroma/skills/anima-orchestration/SKILL.md` | orchestration skill | `plugins/pleroma/skills/orchestration/anima-orchestration/SKILL.md` | `port-and-refine` | CF/CFP dispatch suite |
| `day-night-pass` | installed Pleroma skill inventory; VAK integration spec | orchestration skill | `plugins/pleroma/skills/orchestration/day-night-pass/SKILL.md` | `port-and-refine` | Day/Night' sequence suite |
| `ouroboros` | `Idea/epi-claw/skills/ouroboros/SKILL.md` and workflow script | orchestration skill | `plugins/pleroma/skills/orchestration/ouroboros/SKILL.md` | `port-and-refine` | Ralph-loop protocol suite |
| `klein-mode` | Anima topology contracts and runtime (`klein_inversion`) | orchestration skill | `plugins/pleroma/skills/orchestration/klein-mode/SKILL.md` | `fresh-design` | topology inversion eval suite |
| constitutional agent set (`nous`, `logos`, `eros`, `mythos`, `psyche`, `sophia`) | VAK integration spec; Anima runtime contract | subagents | `plugins/pleroma/agents/constitutional/*.md` | `port-and-refine` | agent registry validation suite |
| Aletheia cluster (`anansi`, `janus`, `moirai`, `mercurius`, `agora`, `zeithoven`) | Bimba harmonization doc + VAK/Aletheia planning | subagents | `plugins/pleroma/agents/aletheia/*.md` | `port-and-refine` | cluster routing and capability policy suite |
| Moirai specialization set (`klotho`, `lachesis`, `atropos`) | installed skills + runtime contract | subagents and/or internal roles | `plugins/pleroma/agents/moirai/*.md` or `plugins/pleroma/skills/constitutional/*` | `port-and-refine` | Night' routing suite |
| `techne-helper` | current planning only; replaces ad hoc external session handling | helper subagent | `plugins/pleroma/agents/constitutional/techne-helper.md` | `fresh-design` | bounded-helper spawn and cleanup suite |
| verification/discharge hooks | Claude-compatible hook model + installed runtime contract expectations | hooks | `plugins/pleroma/hooks/hooks.json`; `plugins/pleroma/hooks/scripts/*` | `fresh-design` | real stdin/stdout hook contract tests |
| eval runner and suites | S4 plugin-system spec; no finished native runner yet | substrate + plugin eval suites | `epi-cli/src/agent/evals.rs`; `plugins/pleroma/evals/suites/*.yaml` | `fresh-design` | `epi agent skills eval` integration tests |

## Notes

- This matrix is the anti-drift artifact for the real port.
- If a capability is marked `fresh-design`, we must not casually call it a port in docs, commits, or reviews.
- If a capability is marked `port-and-refine`, the expected behavior must stay traceable to upstream artifacts even when packaging and boundaries change.
- `plugins/pleroma/` remains the primary executive package unless and until the matrix demonstrates a capability belongs in another top-level plugin.
