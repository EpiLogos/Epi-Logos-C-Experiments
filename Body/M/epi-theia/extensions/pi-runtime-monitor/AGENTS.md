# AGENTS.md — pi-runtime-monitor

## Purpose
Contract-only extension stub: surfaces terminal-backed agent execution as read-only observability — "not hidden process state and not command authority" (per `TERMINAL-OBSERVABILITY-CONTRACT.md`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (per-coordinate: [[M5'-SPEC]]).

## Ownership
- `TERMINAL-OBSERVABILITY-CONTRACT.md` — the binding rendering contract: inputs (`PortalTemporalSurface`, gateway `sessions.resolve`), the rendered-fields list, diagnostics-as-deep-links rule, and the capture boundary.
- Does NOT own: terminal/process execution — the monitor "must not invoke tmux, cmux, or process libraries directly," delegating to S0/Techne deep links (`epi agent tmux inspect`, `techne_terminal_inspect`); gateway session/run-state (delegated to [[S3-SPEC]] gate via `sessions.resolve`); the shared bridge surface (sibling `kernel-bridge`). No package, `src/`, or tests live here yet.

## Local Contracts
- `TERMINAL-OBSERVABILITY-CONTRACT.md` — local binding contract (Track 12.07 / Track 12.14 ACR repurpose).
- Owning spec: [[M'-SYSTEM-SPEC]] / [[M5'-SPEC]]; terminal authority spec [[S0-SPEC]], session authority [[S3-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any symbol introduced when this stub is built out.
- [[wikilink]] all coordinate/spec/agent/tool references in authored artifacts.
- Honour the capture boundary: never render raw scrollback by default; expose only capture availability + handle; bounded capture requires max-lines + redaction policy and explicit user invocation through S0/Techne.

## Verification
(none specific — inherit parent: `pnpm --dir Body/M/epi-theia test:contracts`)

## Child DOX Index
- (leaf)
