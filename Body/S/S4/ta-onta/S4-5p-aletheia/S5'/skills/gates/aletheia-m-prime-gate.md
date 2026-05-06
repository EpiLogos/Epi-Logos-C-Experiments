---
name: aletheia-m-prime-gate
description: "Gate 4: M' Electron frontend alignment. Validates that agent-produced artifacts targeting the M' Electron OmniPanel use correct method names, panel IDs, and session/config schemas."
gate: 4
human_in_loop: false
phase: 2
status: stub
---

# aletheia-m-prime-gate

**Gate 4 — M′ Electron Frontend Alignment**

> Phase 2+ implementation. Stub only — do not execute.

Validates:
- OmniPanel method names match: `sessions.list`, `config.load/save`, `skills.list/toggle/saveApiKey`, `cron.add/list/toggle/run/remove`
- Electron-facing artifacts use correct 14-panel OmniPanel identifiers
- No stale method names from pre-v3 protocol in generated code
