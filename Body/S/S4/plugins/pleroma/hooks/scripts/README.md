# Pleroma hook scripts — LEGACY REFERENCE, NOT WIRED

These four scripts (`preflight-validate.sh`, `postflight-verify.sh`,
`subagent-discharge.sh`, `worktree-cleanup.sh`) are the **old Claude-Code
stop-hook generation** salvaged from the retired `staged/pleroma-hooks/` import
(epi-claw vintage, 2026-05). They are kept as **concrete reference**, not as
active hooks.

**Do NOT wire these without a deliberate design decision.** The active
`../hooks.json` uses the current **contract-event** format (`SessionStart`,
`UserPromptSubmit`, `PostToolUse`, `Stop` → `s4-prime.pleroma.*` emissions); it
does **not** call these scripts.

**Why they are not wired (cycle-3 finding, 2026-06-16).** The cycle-3 design set
(`Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/`)
contains no reference to this hook-script mechanism. The concerns these scripts
handled are now owned by different surfaces:

- `subagent-discharge.sh` (structured discharge: VAK coordinates + Möbius-return
  signal + Night' extraction) → **Sophia (5/0) post-execution disclosure +
  Aletheia night' crystallisation** (Track 12 + Track 42 §42.9).
- `worktree-cleanup.sh` (prune orphaned worktrees, kill dead tmux workshop
  windows) → **terminal session-safety lease** (Track 12 §12.01) + the unified
  harness launcher teardown (Track 42 §42.3).
- `preflight-validate.sh` / `postflight-verify.sh` → the **policy gate /
  VAK-envelope lint** on tool calls (Track 42 §42.1).

They also carry retired bindings (`~/.onecontext/...`, the `aletheia-workshop`
tmux session) that would need updating before any use.

**Value:** the concrete shapes — the discharge metadata JSON (session summary,
`coordinatesUsed`, `mobiusReturn.signal`) and the worktree/window prune logic —
are useful reference for whoever builds Track 42 §42.3 / §42.6 / §42.9.
