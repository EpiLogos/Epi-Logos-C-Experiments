# Pi Runtime Monitor Terminal Observability Contract

Track 12.07 extends the Track 12.14 ACR repurpose decision: Pi-runtime monitor surfaces terminal-backed execution as read-only observability, not hidden process state and not command authority.

## Inputs

- `PortalTemporalSurface`: supplies NOW/day identity, kernel tick, `terminalProvider`, `terminalStatus`, `leaseExpires`, capture handle references, and safe terminal metadata keys.
- Gateway `sessions.resolve`: supplies `canonicalKey`, `activeAgentId`, role/team/chain lineage, cmux projection, `terminalBinding`, and redacted run-state handles.

The monitor must not invoke tmux, cmux, or process libraries directly. Diagnostics are deep links only:

- `epi agent tmux inspect --session-key <session-key>`
- `techne_terminal_inspect session_key=<session-key>`

## Rendered Fields

- session key
- active agent
- role
- team/chain lineage
- NOW/day link
- cmux projection
- `terminalBinding.provider` / `terminalProvider`
- `terminalBinding.terminalStatus` / `terminalStatus`
- `terminalBinding.lease.leaseExpiresAtMs` / `leaseExpires`
- last observed kernel tick
- capture availability
- bounded capture handle reference when present
- redacted last-run handle

## Capture Boundary

Raw terminal scrollback is never rendered by default. The monitor may expose only capture availability and a handle. Bounded captured content requires a capture policy with max-lines and redaction policy, plus explicit user invocation through S0/Techne surfaces.
